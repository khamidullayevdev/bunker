import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { ConvexError } from "convex/values";

function displayName(identity: {
  name?: string;
  givenName?: string;
  nickname?: string;
  email?: string;
}): string {
  return (
    identity.name?.trim() ||
    identity.givenName?.trim() ||
    identity.nickname?.trim() ||
    identity.email?.split("@")[0] ||
    "Oʻyinchi"
  ).slice(0, 24);
}

/** Current user, or null when signed out / not yet stored. */
export async function getCurrentUser(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
}

/** Current user for mutations; creates the row on first use. Throws when signed out. */
export async function requireUser(ctx: MutationCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Avval akkauntga kiring.");
  const existing = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  if (existing) return existing;
  const id = await ctx.db.insert("users", {
    tokenIdentifier: identity.tokenIdentifier,
    name: displayName(identity),
    imageUrl: identity.pictureUrl,
    gamesPlayed: 0,
    gamesSurvived: 0,
    gamesEliminated: 0,
    totalPlayMs: 0,
  });
  return (await ctx.db.get(id))!;
}

export { displayName };
