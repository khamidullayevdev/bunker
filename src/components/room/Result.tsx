"use client";

import { api } from "../../../convex/_generated/api";
import { useSafeMutation } from "@/lib/useSafeMutation";
import { ErrorNote, PrimaryButton, Screen } from "../ui";
import Mole from "../Mole";
import Vine from "../Vine";
import { Avatar } from "../ui";
import { GameHeader, WaitNote, hostName, labelOf, playerById, scenarioOf } from "./common";
import type { PhaseProps } from "./types";

/** Elimination reveal: all of the player's cards open, the mascot roasts them. */
export default function Result({ data }: PhaseProps) {
  const s = scenarioOf(data);
  const next = useSafeMutation(api.game.nextRound);
  const elim = data.room.lastElimination;
  const out = playerById(data, elim?.playerId);
  const alive = data.players.filter((p) => p.alive).length;
  const gameOver = alive <= data.room.capacity;

  return (
    <Screen scenario={data.room.scenario}>
      <GameHeader data={data} label={`${data.room.round}-raund natijasi`} />
      <div className="flex items-end gap-1">
        <Mole mood="laugh" variant={s.moleVariant} size={128} className="mole-bob shrink-0" />
        <div className="mb-2.5 flex flex-1 flex-col gap-1.5" aria-live="polite">
          <p className="rounded-[16px_16px_16px_4px] bg-paper px-3 py-2 text-[14px] font-extrabold leading-snug text-paper-ink">
            {elim?.intro}
          </p>
          <p className="rounded-[16px_16px_16px_4px] bg-accent px-3 py-2 text-[16px] font-black leading-snug text-btn-ink">
            {elim?.punchline}
          </p>
        </div>
      </div>

      {out && (
        <div className="relative rounded-[18px] bg-paper p-3.5 text-paper-ink shadow-[0_4px_0_var(--bg-deep)]">
          <div className="mb-3 flex items-center gap-3 pr-[136px]">
            <Avatar name={out.name} imageUrl={out.imageUrl} size={52} />
            <span className="flex flex-col">
              <span className="text-[22px] font-black">{out.name}</span>
              <span className="text-[13px] font-extrabold text-stem">{elim?.votes} ovoz bilan chiqarildi</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {out.cards.map((c) => (
              <div key={c.category} className="flex flex-col rounded-lg bg-[#d9d9c0] px-2.5 py-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-stem">{labelOf(c.category)}</span>
                <span className="text-[14px] font-extrabold">{c.value}</span>
              </div>
            ))}
          </div>
          <span
            aria-hidden="true"
            className="absolute top-6 right-3 -rotate-[10deg] rounded-lg border-[3px] border-danger px-2.5 py-0.5 font-stencil text-[16px] text-danger"
          >
            TASHQARIDA
          </span>
          <Vine kind="drape" width={340} height={44} className="absolute -top-2.5 left-0" />
          <Vine kind="corner" width={90} height={90} className="absolute -right-2 -bottom-2 rotate-180" />
        </div>
      )}

      <p className="text-center text-[13px] font-extrabold text-muted">
        Bunkerda joy: {data.room.capacity} · Qolganlar: {alive}
      </p>
      <ErrorNote message={next.error} />
      <div className="flex-1" />
      {data.isHost ? (
        <PrimaryButton onClick={() => next.run({ code: data.room.code })} disabled={next.pending}>
          {gameOver ? "Bunkerni yopish" : "Keyingi raund"}
        </PrimaryButton>
      ) : (
        <WaitNote>{hostName(data)} davom ettirishini kuting...</WaitNote>
      )}
    </Screen>
  );
}
