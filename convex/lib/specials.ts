import type { Doc } from "../_generated/dataModel";
import { DECKS, type CardCategory } from "./content";

type Player = Doc<"players">;
type Card = Player["cards"][number];

/** True when this player played their special card in the given round. */
function playedNow(p: Player, round: number) {
  return p.special?.usedRound === round;
}

/**
 * This round's vote count per alive player, with special cards applied.
 * The voting screen and finishVoting both use it, so what players see is
 * exactly what decides who leaves.
 *
 * - bekor: the chosen voter's vote against the card owner does not count.
 * - ikki: the chosen player gets 2 extra votes.
 * - qalqon: the owner's total is zero this round.
 */
export function effectiveTally(
  votes: Pick<Doc<"votes">, "voterId" | "targetId">[],
  players: Player[],
  round: number,
): Map<string, number> {
  const tally = new Map<string, number>(players.filter((p) => p.alive).map((p) => [p._id, 0]));
  const used = players.filter((p) => playedNow(p, round));

  const cancelled = new Set(
    used
      .filter((p) => p.special!.id === "bekor" && p.special!.voterId)
      .map((p) => `${p.special!.voterId}>${p._id}`),
  );
  for (const vote of votes) {
    if (!tally.has(vote.targetId)) continue;
    if (cancelled.has(`${vote.voterId}>${vote.targetId}`)) continue;
    tally.set(vote.targetId, tally.get(vote.targetId)! + 1);
  }
  for (const p of used) {
    const target = p.special!.targetId;
    if (p.special!.id === "ikki" && target && tally.has(target)) {
      tally.set(target, tally.get(target)! + 2);
    }
  }
  for (const p of used) {
    if (p.special!.id === "qalqon" && tally.has(p._id)) tally.set(p._id, 0);
  }
  return tally;
}

type Content = Pick<Card, "value" | "age" | "sex">;

/** Puts new content on a card slot; the slot keeps its category and revealed state. */
export function withContent(slot: Card, content: Content): Card {
  const next: Card = { category: slot.category, value: content.value, revealed: slot.revealed };
  if (slot.revealedRound !== undefined) next.revealedRound = slot.revealedRound;
  // Convex rejects undefined inside stored arrays, so optional fields are only set when present.
  if (content.age !== undefined) next.age = content.age;
  if (content.sex !== undefined) next.sex = content.sex;
  return next;
}

/** Swaps what two cards say, while each slot keeps its own revealed state. */
export function swapContent(a: Card, b: Card): [Card, Card] {
  return [withContent(a, b), withContent(b, a)];
}

export function replaceCard(cards: Card[], category: string, next: Card): Card[] {
  return cards.map((c) => (c.category === category ? next : c));
}

const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

/**
 * Draws a random card of a random category from the game's decks, trying not to
 * hand back the value the target already has.
 */
export function drawMysteryCard(current: Card[]): { category: CardCategory; content: Content } {
  const categories = current.map((c) => c.category as CardCategory);
  const category = pick(categories);
  const old = current.find((c) => c.category === category)?.value;
  for (let attempt = 0; attempt < 8; attempt++) {
    let content: Content;
    if (category === "biologiya") {
      const sex = Math.random() < 0.5 ? "Erkak" : "Ayol";
      const age = 18 + Math.floor(Math.random() * 62);
      content = { value: `${age} yoshli ${sex.toLowerCase()}`, age, sex };
    } else {
      content = { value: pick(DECKS[category]) };
    }
    if (content.value !== old || attempt === 7) return { category, content };
  }
  throw new Error("unreachable");
}
