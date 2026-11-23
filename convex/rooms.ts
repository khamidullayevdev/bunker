import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getCurrentUser, requireUser } from "./lib/auth";
import {
  findRoom,

  requireHost,
  requireMember,
  requirePhase,
  requireRoom,
  roomPlayers,
  shuffle,
} from "./lib/room";
import {
  DECKS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  SPECIAL_IDS,
  bunkerCapacity,
  isScenarioId,
} from "./lib/content";
import type { Doc, Id } from "./_generated/dataModel";
import { effectiveTally } from "./lib/specials";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Everything a room screen needs. Hidden cards of other players are masked. */
export const get = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const room = await findRoom(ctx, code);
    if (!room) return null;
    const players = await roomPlayers(ctx, room._id);
    const me = players.find((p) => p.userId === user._id) ?? null;
    const finished = room.phase === "finished";
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room_round", (q) => q.eq("roomId", room._id).eq("round", room.round))
      .collect();

    return {
      room: {
        _id: room._id,
        code: room.code,
        phase: room.phase,
        scenario: room.scenario,
        nudge: room.nudge,
        capacity: room.phase === "lobby" ? bunkerCapacity(players.length) : room.capacity,
        round: room.round,
        speakerOrder: room.speakerOrder,
        speakerIndex: room.speakerIndex,
        speakerStartedAt: room.speakerStartedAt ?? null,
        voterOrder: room.voterOrder,
        voterIndex: room.voterIndex,
        startedAt: room.startedAt ?? null,
        endedAt: room.endedAt ?? null,
        lastElimination: room.lastElimination ?? null,
        threats: room.threats ?? [],
      },
      players: players.map((p) => {
        const isMe = me?._id === p._id;
        return {
          _id: p._id,
          // The host picks a nickname right after creating the room.
          name: p.name || "Laqab tanlanmoqda...",
          nicknamePending: !p.name,
          imageUrl: p.imageUrl ?? null,
          seat: p.seat,
          ready: p.ready,
          alive: p.alive,
          eliminatedRound: p.eliminatedRound ?? null,
          isHost: p.userId === room.hostUserId,
          isMe,
          revealedThisRound: p.cards.some((c) => c.revealedRound === room.round),
          // Which special card someone holds stays secret until they play it.
          special: p.special ? publicSpecial(p.special, { isMe, finished, meId: me?._id }) : null,
          cards: p.cards.map((c) => ({
            category: c.category,
            revealed: c.revealed,
            revealedRound: c.revealedRound ?? null,
            value: c.revealed || isMe || finished ? c.value : null,
          })),
        };
      }),
      meId: me?._id ?? null,
      meNeedsNickname: !!me && !me.name,
      isHost: room.hostUserId === user._id,
      // Vote totals with special cards applied; the same numbers decide who leaves.
      tally: Object.fromEntries(effectiveTally(votes, players, room.round)),
      votes: votes.map((vote) => ({
        voterId: vote.voterId,
        targetId: vote.targetId,
        changed: vote.changed,
      })),
    };
  },
});

/**
 * What others may know about a special card. Which card someone holds is secret
 * until it is played; after that everyone sees what it did, except the hidden
 * parts of the secret swaps (only the people involved learn the category).
 */
function publicSpecial(
  s: NonNullable<Doc<"players">["special"]>,
  { isMe, finished, meId }: { isMe: boolean; finished: boolean; meId?: Id<"players"> },
) {
  const used = s.usedRound !== undefined;
  const involved = isMe || finished || (!!meId && (s.targetId === meId || s.secondId === meId));
  const secretCategory = (s.id === "ogirlik" && !involved) || (s.id === "sirli" && !finished);
  return {
    id: isMe || finished || used ? s.id : null,
    usedRound: s.usedRound ?? null,
    targetId: used ? (s.targetId ?? null) : null,
    secondId: used ? (s.secondId ?? null) : null,
    voterId: used ? (s.voterId ?? null) : null,
    category: used && !secretCategory ? (s.category ?? null) : null,
  };
}

const NICKNAME_MAX = 20;

/** Trims and validates a per-room nickname. */
function cleanNickname(raw: string): string {
  const clean = raw.trim().replace(/\s+/g, " ").slice(0, NICKNAME_MAX);
  if (clean.length < 2) throw new ConvexError("Laqabingizni yozing (kamida 2 harf).");
  return clean;
}

function nicknameTaken(players: { name: string; userId: unknown }[], name: string, userId: unknown) {
  const key = name.toLocaleLowerCase();
  return players.some((p) => p.userId !== userId && p.name.toLocaleLowerCase() === key);
}

/** Creates a lobby. The host chooses their nickname on the next screen (setNickname). */
export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    let code = "";
    for (let attempt = 0; attempt < 20; attempt++) {
      code = Array.from({ length: 4 }, () =>
        CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)],
      ).join("");
      if (!(await findRoom(ctx, code))) break;
    }
    const roomId = await ctx.db.insert("rooms", {
      code,
      hostUserId: user._id,
      phase: "lobby",
      scenario: "nuclear",
      nudge: true,
      capacity: 1,
      round: 0,
      speakerOrder: [],
      speakerIndex: 0,
      voterOrder: [],
      voterIndex: 0,
    });
    await ctx.db.insert("players", {
      roomId,
      userId: user._id,
      name: "",
      imageUrl: user.imageUrl,
      seat: 0,
      ready: true,
      alive: true,
      cards: [],
    });
    return code;
  },
});

export const join = mutation({
  args: { code: v.string(), nickname: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const nickname = cleanNickname(args.nickname);
    const room = await requireRoom(ctx, args.code);
    const players = await roomPlayers(ctx, room._id);
    const existing = players.find((p) => p.userId === user._id);
    if (existing) {
      // Rejoining your own lobby with a new nickname just renames you.
      if (room.phase === "lobby" && existing.name !== nickname) {
        if (nicknameTaken(players, nickname, user._id)) throw new ConvexError("Bu laqab xonada band. Boshqasini tanlang.");
        await ctx.db.patch(existing._id, { name: nickname });
      }
      return room.code;
    }
    if (room.phase !== "lobby") throw new ConvexError("Bu xonada oʻyin allaqachon boshlangan.");
    if (players.length >= MAX_PLAYERS) throw new ConvexError("Xona toʻlgan.");
    if (nicknameTaken(players, nickname, user._id)) throw new ConvexError("Bu laqab xonada band. Boshqasini tanlang.");
    const seat = players.length === 0 ? 0 : Math.max(...players.map((p) => p.seat)) + 1;
    await ctx.db.insert("players", {
      roomId: room._id,
      userId: user._id,
      name: nickname,
      imageUrl: user.imageUrl,
      seat,
      ready: false,
      alive: true,
      cards: [],
    });
    return room.code;
  },
});

/** Sets (or changes) your nickname while the room is still in the lobby. */
export const setNickname = mutation({
  args: { code: v.string(), nickname: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const nickname = cleanNickname(args.nickname);
    const room = await requireRoom(ctx, args.code);
    requirePhase(room, "lobby");
    const players = await roomPlayers(ctx, room._id);
    const me = players.find((p) => p.userId === user._id);
    if (!me) throw new ConvexError("Siz bu xonada emassiz.");
    if (nicknameTaken(players, nickname, user._id)) throw new ConvexError("Bu laqab xonada band. Boshqasini tanlang.");
    await ctx.db.patch(me._id, { name: nickname });
  },
});

export const leave = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const user = await requireUser(ctx);
    const room = await requireRoom(ctx, code);
    if (room.phase !== "lobby") return;
    const players = await roomPlayers(ctx, room._id);
    const me = players.find((p) => p.userId === user._id);
    if (!me) return;
    await ctx.db.delete(me._id);
    const rest = players.filter((p) => p._id !== me._id);
    if (rest.length === 0) {
      await ctx.db.delete(room._id);
    } else if (room.hostUserId === user._id) {
      await ctx.db.patch(room._id, { hostUserId: rest[0].userId });
      await ctx.db.patch(rest[0]._id, { ready: true });
    }
  },
});

export const setReady = mutation({
  args: { code: v.string(), ready: v.boolean() },
  handler: async (ctx, { code, ready }) => {
    const user = await requireUser(ctx);
    const room = await requireRoom(ctx, code);
    requirePhase(room, "lobby");
    const me = requireMember(await roomPlayers(ctx, room._id), user._id);
    await ctx.db.patch(me._id, { ready });
  },
});

export const setScenario = mutation({
  args: { code: v.string(), scenario: v.string() },
  handler: async (ctx, { code, scenario }) => {
    const user = await requireUser(ctx);
    const room = await requireRoom(ctx, code);
    requireHost(room, user._id);
    requirePhase(room, "lobby");
    if (!isScenarioId(scenario)) throw new ConvexError("Nomaʼlum ssenariy.");
    await ctx.db.patch(room._id, { scenario });
  },
});

export const setNudge = mutation({
  args: { code: v.string(), nudge: v.boolean() },
  handler: async (ctx, { code, nudge }) => {
    const user = await requireUser(ctx);
    const room = await requireRoom(ctx, code);
    requireHost(room, user._id);
    await ctx.db.patch(room._id, { nudge });
  },
});

export const kick = mutation({
  args: { code: v.string(), playerId: v.id("players") },
  handler: async (ctx, { code, playerId }) => {
    const user = await requireUser(ctx);
    const room = await requireRoom(ctx, code);
    requireHost(room, user._id);
    requirePhase(room, "lobby");
    const player = await ctx.db.get(playerId);
    if (!player || player.roomId !== room._id || player.userId === user._id) return;
    await ctx.db.delete(playerId);
  },
});

function dealCards(count: number): Doc<"players">["cards"][] {
  const decks = Object.fromEntries(
    Object.entries(DECKS).map(([k, list]) => [k, shuffle(list)]),
  ) as Record<keyof typeof DECKS, string[]>;
  const draw = (k: keyof typeof DECKS, i: number) => decks[k][i % decks[k].length];
  return Array.from({ length: count }, (_, i) => {
    const sex = Math.random() < 0.5 ? "Erkak" : "Ayol";
    const age = 18 + Math.floor(Math.random() * 62);
    const card = (category: string, value: string) => ({ category, value, revealed: false });
    return [
      card("kasb", draw("kasb", i)),
      { ...card("biologiya", `${age} yoshli ${sex.toLowerCase()}`), age, sex },
      card("salomatlik", draw("salomatlik", i)),
      card("hobbi", draw("hobbi", i)),
      card("fobiya", draw("fobiya", i)),
      card("xarakter", draw("xarakter", i)),
      card("bagaj", draw("bagaj", i)),
      card("qoshimcha", draw("qoshimcha", i)),
    ];
  });
}

export const start = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const user = await requireUser(ctx);
    const room = await requireRoom(ctx, code);
    requireHost(room, user._id);
    requirePhase(room, "lobby");
    const players = await roomPlayers(ctx, room._id);
    if (players.length < MIN_PLAYERS) {
      throw new ConvexError(`Oʻyin uchun kamida ${MIN_PLAYERS} kishi kerak.`);
    }
    if (players.some((p) => !p.name)) throw new ConvexError("Hamma oʻyinchi laqab tanlashi kerak.");
    if (players.some((p) => !p.ready)) throw new ConvexError("Hamma hali tayyor emas.");
    const hands = dealCards(players.length);
    // Deal from a shuffled deck so a small table still gets a mix of card kinds.
    const deck = shuffle([...SPECIAL_IDS]);
    const specials = players.map((_, i) => deck[i % deck.length]);
    for (const [i, p] of players.entries()) {
      await ctx.db.patch(p._id, {
        cards: hands[i],
        special: { id: specials[i] },
        alive: true,
        eliminatedRound: undefined,
      });
    }
    await ctx.db.patch(room._id, {
      phase: "intro",
      round: 1,
      capacity: bunkerCapacity(players.length),
      startedAt: Date.now(),
      speakerOrder: [],
      speakerIndex: 0,
      voterOrder: [],
      voterIndex: 0,
      lastElimination: undefined,
    });
  },
});

