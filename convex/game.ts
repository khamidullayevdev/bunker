import { mutation, type MutationCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { requireUser } from "./lib/auth";
import {
  requireHost,
  requireMember,
  requirePhase,
  requireRoom,
  roomPlayers,
  turnOrder,
} from "./lib/room";
import { drawMysteryCard, effectiveTally, replaceCard, swapContent, withContent } from "./lib/specials";
import {
  FIRST_ROUND_CATEGORY,
  SPECIAL_CARDS,
  isCardCategory,
  eliminationIntro,
  eliminationPunchline,
  pickThreat,
  roundHasThreat,
} from "./lib/content";

async function load(ctx: MutationCtx, code: string) {
  const user = await requireUser(ctx);
  const room = await requireRoom(ctx, code);
  const players = await roomPlayers(ctx, room._id);
  return { user, room, players };
}

async function toDiscussion(ctx: MutationCtx, room: Doc<"rooms">, players: Doc<"players">[]) {
  await ctx.db.patch(room._id, {
    phase: "discussion",
    speakerOrder: turnOrder(players, room.hostUserId),
    speakerIndex: 0,
    speakerStartedAt: Date.now(),
  });
}

async function finishGame(ctx: MutationCtx, room: Doc<"rooms">, players: Doc<"players">[]) {
  const endedAt = Date.now();
  const startedAt = room.startedAt ?? endedAt;
  const durationMs = endedAt - startedAt;
  const gameId = await ctx.db.insert("games", {
    roomId: room._id,
    code: room.code,
    scenario: room.scenario,
    playerCount: players.length,
    capacity: room.capacity,
    rounds: room.round,
    startedAt,
    endedAt,
    durationMs,
  });
  for (const p of players) {
    await ctx.db.insert("gameResults", {
      gameId,
      userId: p.userId,
      name: p.name,
      survived: p.alive,
      eliminatedRound: p.eliminatedRound,
      profession: p.cards.find((c) => c.category === "kasb")?.value,
      scenario: room.scenario,
      durationMs,
      endedAt,
    });
    const user = await ctx.db.get(p.userId);
    if (user) {
      await ctx.db.patch(user._id, {
        gamesPlayed: user.gamesPlayed + 1,
        gamesSurvived: user.gamesSurvived + (p.alive ? 1 : 0),
        gamesEliminated: user.gamesEliminated + (p.alive ? 0 : 1),
        totalPlayMs: user.totalPlayMs + durationMs,
      });
    }
  }
  await ctx.db.patch(room._id, { phase: "finished", endedAt });
}

/** Host closes the catastrophe intro and the first reveal round begins. */
export const continueIntro = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const { user, room } = await load(ctx, code);
    requireHost(room, user._id);
    requirePhase(room, "intro");
    await ctx.db.patch(room._id, { phase: "reveal" });
  },
});

/** Reveal one of my hidden cards for this round. */
export const reveal = mutation({
  args: { code: v.string(), category: v.string() },
  handler: async (ctx, { code, category }) => {
    const { user, room, players } = await load(ctx, code);
    requirePhase(room, "reveal");
    const me = requireMember(players, user._id);
    if (!me.alive) throw new ConvexError("Siz oʻyindan chiqqansiz.");
    if (me.cards.some((c) => c.revealedRound === room.round)) {
      throw new ConvexError("Bu raundda kartani allaqachon ochdingiz.");
    }
    if (room.round === 1 && category !== FIRST_ROUND_CATEGORY) {
      throw new ConvexError("Birinchi raundda hamma kasbini ochadi.");
    }
    const card = me.cards.find((c) => c.category === category);
    if (!card || card.revealed) throw new ConvexError("Bu kartani ochib boʻlmaydi.");
    const cards = me.cards.map((c) =>
      c.category === category ? { ...c, revealed: true, revealedRound: room.round } : c,
    );
    await ctx.db.patch(me._id, { cards });

    const updated = players.map((p) => (p._id === me._id ? { ...p, cards } : p));
    const everyone = updated
      .filter((p) => p.alive)
      .every((p) => p.cards.some((c) => c.revealedRound === room.round));
    if (everyone) await toDiscussion(ctx, room, updated);
  },
});

/** Host moves on without waiting for everyone to reveal. */
export const skipReveal = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const { user, room, players } = await load(ctx, code);
    requireHost(room, user._id);
    requirePhase(room, "reveal");
    await toDiscussion(ctx, room, players);
  },
});

/** The current speaker (or the host) passes the turn. Turns are never skipped automatically. */
export const nextSpeaker = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const { user, room, players } = await load(ctx, code);
    requirePhase(room, "discussion");
    const me = requireMember(players, user._id);
    const current = room.speakerOrder[room.speakerIndex];
    if (room.hostUserId !== user._id && current !== me._id) {
      throw new ConvexError("Hozir sizning navbatingiz emas.");
    }
    await ctx.db.patch(room._id, {
      speakerIndex: Math.min(room.speakerIndex + 1, room.speakerOrder.length),
      speakerStartedAt: Date.now(),
    });
  },
});

/**
 * Opens the next reveal round. From round 2 on, every other round starts with
 * a threat picked from the cards the people still inside hold.
 */
async function startRound(ctx: MutationCtx, room: Doc<"rooms">, players: Doc<"players">[]) {
  const round = room.round + 1;
  const threats = room.threats ?? [];
  const next = roundHasThreat(round)
    ? [
        ...threats,
        {
          id: pickThreat(
            players.filter((p) => p.alive).map((p) => p.cards),
            threats.map((t) => t.id),
          ).id,
          round,
        },
      ]
    : threats;
  await ctx.db.patch(room._id, {
    phase: "reveal",
    round,
    threats: next,
    lastElimination: undefined,
    speakerOrder: [],
    speakerIndex: 0,
    voterOrder: [],
    voterIndex: 0,
  });
}

/** Round 1 is for getting to know each other: nobody is voted out, the host moves on. */
export const skipFirstVote = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const { user, room, players } = await load(ctx, code);
    requireHost(room, user._id);
    requirePhase(room, "discussion");
    if (room.round !== 1) throw new ConvexError("Bu faqat birinchi raundda.");
    await startRound(ctx, room, players);
  },
});

export const startVoting = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const { user, room, players } = await load(ctx, code);
    requireHost(room, user._id);
    requirePhase(room, "discussion");
    if (room.round === 1) throw new ConvexError("Birinchi raundda ovoz berilmaydi.");
    await ctx.db.patch(room._id, {
      phase: "voting",
      voterOrder: turnOrder(players, room.hostUserId),
      voterIndex: 0,
    });
  },
});

/**
 * Open, turn-based vote. The current voter announces their choice and everyone
 * sees it. Anyone who already voted may change their vote until the host closes
 * the voting, so the accused can still talk their way out.
 */
export const vote = mutation({
  args: { code: v.string(), targetId: v.id("players") },
  handler: async (ctx, { code, targetId }) => {
    const { user, room, players } = await load(ctx, code);
    requirePhase(room, "voting");
    const me = requireMember(players, user._id);
    if (!me.alive) throw new ConvexError("Siz oʻyindan chiqqansiz.");
    const target = players.find((p) => p._id === targetId);
    if (!target || !target.alive) throw new ConvexError("Bu oʻyinchiga ovoz berib boʻlmaydi.");
    if (target._id === me._id) throw new ConvexError("Oʻzingizga ovoz bera olmaysiz.");

    const existing = await ctx.db
      .query("votes")
      .withIndex("by_room_round_voter", (q) =>
        q.eq("roomId", room._id).eq("round", room.round).eq("voterId", me._id),
      )
      .unique();
    if (existing) {
      if (existing.targetId !== targetId) {
        await ctx.db.patch(existing._id, { targetId, changed: true });
      }
      return;
    }
    if (room.voterOrder[room.voterIndex] !== me._id) {
      throw new ConvexError("Navbatingizni kuting.");
    }
    await ctx.db.insert("votes", {
      roomId: room._id,
      round: room.round,
      voterId: me._id,
      targetId,
      changed: false,
    });
    await ctx.db.patch(room._id, { voterIndex: room.voterIndex + 1 });
  },
});

/** Host skips a voter who is away (they can still vote later by changing nothing). */
export const skipVoter = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const { user, room } = await load(ctx, code);
    requireHost(room, user._id);
    requirePhase(room, "voting");
    await ctx.db.patch(room._id, {
      voterIndex: Math.min(room.voterIndex + 1, room.voterOrder.length),
    });
  },
});

export const finishVoting = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const { user, room, players } = await load(ctx, code);
    requireHost(room, user._id);
    requirePhase(room, "voting");
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room_round", (q) => q.eq("roomId", room._id).eq("round", room.round))
      .collect();
    if (votes.length === 0) throw new ConvexError("Hali hech kim ovoz bermadi.");

    const tally = effectiveTally(votes, players, room.round);
    const max = Math.max(0, ...tally.values());
    if (max === 0) {
      throw new ConvexError("Maxsus kartalar barcha ovozlarni bekor qildi. Ovozlarni boshqa odamga bering.");
    }
    const leaders = [...tally.entries()].filter(([, n]) => n === max).map(([id]) => id);
    const outId = leaders[Math.floor(Math.random() * leaders.length)];
    const out = players.find((p) => p._id === outId)!;

    const cards = out.cards.map((c) => ({
      ...c,
      revealed: true,
      revealedRound: c.revealedRound ?? room.round,
    }));
    await ctx.db.patch(out._id, { alive: false, eliminatedRound: room.round, cards });
    await ctx.db.patch(room._id, {
      phase: "result",
      lastElimination: {
        playerId: out._id,
        name: out.name,
        votes: max,
        intro: eliminationIntro(cards),
        punchline: eliminationPunchline(out.name, `${room.code}-${room.round}-${out.name}`, leaders.length > 1),
      },
    });
  },
});

/** Plays your special card, once per game. Everyone sees that it was used and on whom. */
export const playSpecial = mutation({
  args: {
    code: v.string(),
    targetId: v.optional(v.id("players")),
    secondId: v.optional(v.id("players")),
    voterId: v.optional(v.id("players")),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { code, targetId, secondId, voterId, category }) => {
    const { user, room, players } = await load(ctx, code);
    const me = requireMember(players, user._id);
    if (!me.alive) throw new ConvexError("Tashqaridagilar maxsus kartani ishlata olmaydi.");
    if (!me.special) throw new ConvexError("Sizda maxsus karta yoʻq.");
    if (me.special.usedRound !== undefined) throw new ConvexError("Maxsus kartangiz allaqachon ishlatilgan.");
    const id = me.special.id;
    const info = SPECIAL_CARDS[id];
    if (!(info.phases as string[]).includes(room.phase)) {
      throw new ConvexError(
        info.phases.length === 1 ? "Bu karta faqat ovoz berish paytida ishlaydi." : "Bu kartani muhokama yoki ovoz berish paytida ishlating.",
      );
    }

    const alive = (pid: string | undefined) => {
      const p = players.find((x) => x._id === pid && x.alive);
      if (!p) throw new ConvexError("Oʻyinchini tanlang.");
      return p;
    };
    const used = { ...me.special, usedRound: room.round };

    if (id === "bekor") {
      if (!voterId) throw new ConvexError("Kimning ovozini bekor qilishni tanlang.");
      const vote = await ctx.db
        .query("votes")
        .withIndex("by_room_round_voter", (q) => q.eq("roomId", room._id).eq("round", room.round).eq("voterId", voterId))
        .unique();
      if (!vote || vote.targetId !== me._id) throw new ConvexError("Bu odam sizga ovoz bermagan.");
      await ctx.db.patch(me._id, { special: { ...used, voterId } });
      return true;
    }
    if (id === "ikki") {
      const target = alive(targetId);
      if (target._id === me._id) throw new ConvexError("Oʻzingizga ovoz qoʻsha olmaysiz.");
      await ctx.db.patch(me._id, { special: { ...used, targetId: target._id } });
      return true;
    }
    if (id === "qalqon") {
      await ctx.db.patch(me._id, { special: used });
      return true;
    }

    if (id === "almash_bagaj" || id === "almash_salomatlik" || id === "almash_istalgan") {
      const cat = info.category ?? category;
      if (!cat || !isCardCategory(cat)) throw new ConvexError("Karta turini tanlang.");
      const a = alive(targetId);
      const b = alive(secondId);
      if (a._id === b._id) throw new ConvexError("Ikki xil oʻyinchini tanlang.");
      const ca = a.cards.find((c) => c.category === cat);
      const cb = b.cards.find((c) => c.category === cat);
      if (!ca?.revealed || !cb?.revealed) throw new ConvexError("Ikkalasining ham bu kartasi ochilgan boʻlishi kerak.");
      const [na, nb] = swapContent(ca, cb);
      await ctx.db.patch(a._id, { cards: replaceCard(a.cards, cat, na) });
      await ctx.db.patch(b._id, { cards: replaceCard(b.cards, cat, nb) });
      // patch() only touches `special`, so this is safe even when I was one of the two.
      await ctx.db.patch(me._id, { special: { ...used, targetId: a._id, secondId: b._id, category: cat } });
      return true;
    }

    if (id === "ogirlik") {
      const target = alive(targetId);
      if (target._id === me._id) throw new ConvexError("Boshqa oʻyinchini tanlang.");
      if (!category || !isCardCategory(category)) throw new ConvexError("Karta turini tanlang.");
      const mineCard = me.cards.find((c) => c.category === category);
      const theirs = target.cards.find((c) => c.category === category);
      if (!mineCard || !theirs || mineCard.revealed || theirs.revealed) {
        throw new ConvexError("Bu karta ikkalangizda ham yopiq boʻlishi kerak.");
      }
      const [nm, nt] = swapContent(mineCard, theirs);
      await ctx.db.patch(me._id, { cards: replaceCard(me.cards, category, nm), special: { ...used, targetId: target._id, category } });
      await ctx.db.patch(target._id, { cards: replaceCard(target.cards, category, nt) });
      return true;
    }

    // sirli: a random card from the decks replaces the same kind of card of the chosen player.
    const target = alive(targetId);
    const drawn = drawMysteryCard(target.cards);
    const old = target.cards.find((c) => c.category === drawn.category)!;
    await ctx.db.patch(target._id, {
      cards: replaceCard(target.cards, drawn.category, withContent(old, drawn.content)),
    });
    await ctx.db.patch(me._id, { special: { ...used, targetId: target._id, category: drawn.category } });
    return true;
  },
});

/** After the elimination reveal: next round, or close the bunker when it is full. */
export const nextRound = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const { user, room, players } = await load(ctx, code);
    requireHost(room, user._id);
    requirePhase(room, "result");
    const alive = players.filter((p) => p.alive).length;
    if (alive <= room.capacity) {
      await finishGame(ctx, room, players);
      return;
    }
    await startRound(ctx, room, players);
  },
});

/** Host ends the game early; the result is still saved to everyone's stats. */
export const endGame = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const { user, room, players } = await load(ctx, code);
    requireHost(room, user._id);
    if (room.phase === "lobby" || room.phase === "finished") return;
    await finishGame(ctx, room, players);
  },
});
