import type { FunctionReturnType } from "convex/server";
import type { api } from "../../../convex/_generated/api";

export type RoomData = NonNullable<FunctionReturnType<typeof api.rooms.get>>;
export type RoomPlayer = RoomData["players"][number];
export type PhaseProps = { data: RoomData };
