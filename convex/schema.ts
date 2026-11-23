import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const phaseValidator = v.union(
  v.literal("lobby"),
  v.literal("intro"),
  v.literal("reveal"),
  v.literal("discussion"),
  v.literal("voting"),
  v.literal("result"),
  v.literal("finished"),
);

export const cardValidator = v.object({
  category: v.string(),
  value: v.string(),
  revealed: v.boolean(),
  revealedRound: v.optional(v.number()),
  age: v.optional(v.number()),
  sex: v.optional(v.string()),
});

export const specialIdValidator = v.union(
  v.literal("bekor"),
  v.literal("ikki"),
  v.literal("qalqon"),
  v.literal("almash_bagaj"),
  v.literal("almash_salomatlik"),
  v.literal("almash_istalgan"),
  v.literal("ogirlik"),
  v.literal("sirli"),
);

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    // True once the player typed their own name on the welcome screen.
    nameChosen: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
    gamesPlayed: v.number(),
    gamesSurvived: v.number(),
    gamesEliminated: v.number(),
    totalPlayMs: v.number(),
  }).index("by_token", ["tokenIdentifier"]),

  rooms: defineTable({
    code: v.string(),
    hostUserId: v.id("users"),
    phase: phaseValidator,
    scenario: v.string(),
    nudge: v.boolean(),
    capacity: v.number(),
    round: v.number(),
    // Discussion: who talks, in order. The current speaker is never skipped
    // automatically; the mascot only nudges them when `nudge` is on.
    speakerOrder: v.array(v.id("players")),
    speakerIndex: v.number(),
    speakerStartedAt: v.optional(v.number()),
    // Voting is open and turn-based so everyone sees who votes for whom.
    voterOrder: v.array(v.id("players")),
    voterIndex: v.number(),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    // Threats so far, in order; the last one is the current one.
    threats: v.optional(v.array(v.object({ id: v.string(), round: v.number() }))),
    lastElimination: v.optional(
      v.object({
        playerId: v.id("players"),
        name: v.string(),
        votes: v.number(),
        intro: v.string(),
        punchline: v.string(),
      }),
    ),
  })
    .index("by_code", ["code"]),

  players: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    seat: v.number(),
    ready: v.boolean(),
    alive: v.boolean(),
    eliminatedRound: v.optional(v.number()),
    cards: v.array(cardValidator),
    // One secret special card per game; usedRound is set when it is played,
    // together with whatever the player picked (who, whose vote, which card).
    special: v.optional(
      v.object({
        id: specialIdValidator,
        usedRound: v.optional(v.number()),
        targetId: v.optional(v.id("players")),
        secondId: v.optional(v.id("players")),
        voterId: v.optional(v.id("players")),
        category: v.optional(v.string()),
      }),
    ),
  })
    .index("by_room", ["roomId"])
    .index("by_room_user", ["roomId", "userId"]),

  votes: defineTable({
    roomId: v.id("rooms"),
    round: v.number(),
    voterId: v.id("players"),
    targetId: v.id("players"),
    changed: v.boolean(),
  })
    .index("by_room_round", ["roomId", "round"])
    .index("by_room_round_voter", ["roomId", "round", "voterId"]),

  games: defineTable({
    roomId: v.id("rooms"),
    code: v.string(),
    scenario: v.string(),
    playerCount: v.number(),
    capacity: v.number(),
    rounds: v.number(),
    startedAt: v.number(),
    endedAt: v.number(),
    durationMs: v.number(),
  }),

  gameResults: defineTable({
    gameId: v.id("games"),
    userId: v.id("users"),
    name: v.string(),
    survived: v.boolean(),
    eliminatedRound: v.optional(v.number()),
    profession: v.optional(v.string()),
    scenario: v.string(),
    durationMs: v.number(),
    endedAt: v.number(),
  })
    .index("by_user", ["userId", "endedAt"])
    .index("by_game", ["gameId"]),
});
