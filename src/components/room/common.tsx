"use client";

import type { ReactNode } from "react";
import { api } from "../../../convex/_generated/api";
import { CATEGORY_LABEL, SCENARIOS, isScenarioId, type CardCategory } from "../../../convex/lib/content";
import { useSafeMutation } from "@/lib/useSafeMutation";
import { GameClock, Pill } from "../ui";
import Vine from "../Vine";
import type { RoomData, RoomPlayer } from "./types";

export function scenarioOf(data: RoomData) {
  return isScenarioId(data.room.scenario) ? SCENARIOS[data.room.scenario] : SCENARIOS.nuclear;
}

export function labelOf(category: string) {
  return CATEGORY_LABEL[category as CardCategory] ?? category;
}

export function playerById(data: RoomData, id: string | null | undefined) {
  return data.players.find((p) => p._id === id) ?? null;
}

/** The lobby owner's in-game name, used instead of a generic "host". */
export function hostName(data: RoomData) {
  const host = data.players.find((p) => p.isHost);
  return host && !host.nicknamePending ? host.name : "Lobby egasi";
}

export function GameHeader({ data, label }: { data: RoomData; label?: string }) {
  const end = useSafeMutation(api.game.endGame);
  return (
    <div className="flex items-center justify-between gap-2">
      <Pill>{label ?? `${data.room.round}-raund`}</Pill>
      <div className="flex items-center gap-3">
        <GameClock startedAt={data.room.startedAt} />
        {data.isHost && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Oʻyinni hozir tugatasizmi? Natijalar saqlanadi.")) {
                void end.run({ code: data.room.code });
              }
            }}
            className="rounded-lg border border-line px-2 py-1 text-[12px] font-extrabold text-muted"
          >
            Tugatish
          </button>
        )}
      </div>
    </div>
  );
}

/** Revealed trait chips for a player. */
export function TraitChips({ player, onlyRound }: { player: RoomPlayer; onlyRound?: number }) {
  const cards = player.cards.filter((c) => c.revealed && c.value && (onlyRound === undefined || c.revealedRound === onlyRound));
  if (cards.length === 0) return <span className="text-[12px] font-bold text-muted">Hali hech narsa ochilmagan</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {cards.map((c) => (
        <span key={c.category} className="rounded-full bg-line px-2.5 py-0.5 text-[12px] font-bold" title={labelOf(c.category)}>
          {c.value}
        </span>
      ))}
    </span>
  );
}

export function EliminatedRow({ player }: { player: RoomPlayer }) {
  return (
    <div className="relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-bg-deep px-3 py-2.5 text-muted/80">
      <span className="w-[88px] shrink-0 text-[14px] font-black line-through">{player.name}</span>
      <span className="text-[12px] font-bold">{player.eliminatedRound}-raundda bunkerdan chiqdi</span>
      <Vine kind="drape" width={360} height={24} className="absolute -top-2 left-0 opacity-80" />
    </div>
  );
}

export function WaitNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border-2 border-dashed border-line px-3 py-3 text-center text-[14px] font-extrabold text-muted">
      {children}
    </p>
  );
}
