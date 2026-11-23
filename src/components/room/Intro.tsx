"use client";

import { api } from "../../../convex/_generated/api";
import { useSafeMutation } from "@/lib/useSafeMutation";
import { MASCOT } from "@/lib/mascot";
import Mole from "../Mole";
import { ErrorNote, PrimaryButton, Screen } from "../ui";
import { GameHeader, WaitNote, hostName, scenarioOf } from "./common";
import type { PhaseProps } from "./types";

export default function Intro({ data }: PhaseProps) {
  const s = scenarioOf(data);
  const next = useSafeMutation(api.game.continueIntro);
  const facts = [
    [`${data.room.capacity}`, "joy"],
    [s.duration, "muddat"],
    [s.area, "maydon"],
    [s.food, "ovqat"],
  ];

  return (
    <Screen scenario={data.room.scenario}>
      <GameHeader data={data} label="Halokat yuz berdi" />
      <div className="relative h-[196px] overflow-hidden rounded-[20px] border-2 border-line bg-surface">
        <svg aria-hidden="true" viewBox="0 0 390 196" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full">
          <circle cx="300" cy="56" r="34" fill="var(--accent)" opacity="0.85" />
          <path
            d="M0 196 L0 120 L30 120 L30 92 L58 92 L58 130 L84 130 L84 70 L110 70 L110 112 L140 112 L140 98 L170 98 L170 140 L200 140 L200 84 L236 84 L236 124 L262 124 L262 104 L292 104 L292 136 L330 136 L330 90 L356 90 L356 128 L390 128 L390 196 Z"
            fill="var(--bg)"
            opacity="0.9"
          />
        </svg>
        <div aria-hidden="true" className="hazard-stripes absolute inset-x-0 bottom-0 h-2.5" />
        <Mole mood="scared" variant={s.moleVariant} size={150} className="absolute bottom-2 left-6" />
      </div>
      <h1 className="font-stencil text-[28px] leading-tight text-accent">{s.title}</h1>
      <p className="text-[15px] font-bold leading-snug text-muted">{s.story}</p>
      <p className="rounded-[4px_18px_18px_18px] bg-paper px-3.5 py-2.5 text-[14px] font-extrabold leading-snug text-paper-ink">
        <span className="text-leaf">{MASCOT}: </span>
        {s.quip}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {facts.map(([v, k]) => (
          <div key={k} className="flex flex-col rounded-xl border-2 border-line bg-surface px-1 py-2.5 text-center">
            <span className="text-[17px] font-black">{v}</span>
            <span className="text-[11px] font-extrabold text-muted">{k}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[13px] font-extrabold text-muted">Bunkerda bor:</span>
        {s.items.map((it) => (
          <span key={it} className="rounded-full border border-line bg-surface px-2.5 py-1 text-[13px] font-bold">
            {it}
          </span>
        ))}
      </div>
      <ErrorNote message={next.error} />
      <div className="flex-1" />
      {data.isHost ? (
        <PrimaryButton onClick={() => next.run({ code: data.room.code })} disabled={next.pending}>
          Kartalarni ochishga oʻtish
        </PrimaryButton>
      ) : (
        <WaitNote>{hostName(data)} davom ettirishini kuting...</WaitNote>
      )}
    </Screen>
  );
}
