import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { displayName, getCurrentUser, requireUser } from "./lib/auth";

/** Called by the client after sign-in: creates or refreshes the user row. */
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const identity = (await ctx.auth.getUserIdentity())!;
    const name = displayName(identity);
    const useClerkName = !user.nameChosen && user.name === "Oʻyinchi" && name !== user.name;
    if (user.imageUrl !== identity.pictureUrl || useClerkName) {
      await ctx.db.patch(user._id, {
        imageUrl: identity.pictureUrl,
        name: useClerkName ? name : user.name,
      });
    }
    return user._id;
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

/** Saves the player's name: on the one-time welcome screen and from the profile. */
export const rename = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const user = await requireUser(ctx);
    const clean = name.trim().replace(/\s+/g, " ").slice(0, 24);
    if (clean.length < 2) throw new ConvexError("Ismingizni yozing (kamida 2 harf).");
    await ctx.db.patch(user._id, { name: clean, nameChosen: true });
  },
});

/** Recent games of the signed-in user, newest first. */
export const history = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("gameResults")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});
