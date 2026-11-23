import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

export async function findRoom(ctx: QueryCtx, code: string): Promise<Doc<"rooms"> | null> {
  return await ctx.db
    .query("rooms")
    .withIndex("by_code", (q) => q.eq("code", normalizeCode(code)))
    .order("desc")
    .first();
}

export async function requireRoom(ctx: QueryCtx, code: string): Promise<Doc<"rooms">> {
  const room = await findRoom(ctx, code);
  if (!room) throw new ConvexError("Bunday xona topilmadi.");
  return room;
}

export async function roomPlayers(ctx: QueryCtx, roomId: Id<"rooms">): Promise<Doc<"players">[]> {
  const players = await ctx.db
    .query("players")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .collect();
  return players.sort((a, b) => a.seat - b.seat);
}

export function requireMember(players: Doc<"players">[], userId: Id<"users">): Doc<"players"> {
  const me = players.find((p) => p.userId === userId);
  if (!me) throw new ConvexError("Siz bu xonada emassiz.");
  return me;
}

export function requireHost(room: Doc<"rooms">, userId: Id<"users">) {
  if (room.hostUserId !== userId) throw new ConvexError("Buni faqat lobby egasi qila oladi.");
}

export function requirePhase(room: Doc<"rooms">, ...phases: Doc<"rooms">["phase"][]) {
  if (!phases.includes(room.phase)) throw new ConvexError("Hozir buni qilib boʻlmaydi.");
}

/**
 * Speaking and voting order, the same every round: the lobby owner first,
 * then everyone else in the order they joined. Eliminated players are skipped.
 */
export function turnOrder(players: Doc<"players">[], hostUserId: Id<"users">): Id<"players">[] {
  return players
    .filter((p) => p.alive)
    .sort((a, b) => Number(b.userId === hostUserId) - Number(a.userId === hostUserId) || a.seat - b.seat)
    .map((p) => p._id);
}

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type Ctx = MutationCtx;
