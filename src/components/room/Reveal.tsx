"use client";

import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { FIRST_ROUND_CATEGORY } from "../../../convex/lib/content";
import { useSafeMutation } from "@/lib/useSafeMutation";
import { ErrorNote, GhostButton, MoleSay, PrimaryButton, Screen, Title } from "../ui";
import { GameHeader, WaitNote, labelOf, scenarioOf } from "./common";
import SpecialCard from "./SpecialCard";
import { ThreatCard, currentThreat } from "./Threat";
import type { PhaseProps } from "./types";

export default function Reveal({ data }: PhaseProps) {
  const s = scenarioOf(data);
  const code = data.room.code;
  const me = data.players.find((p) => p.isMe)!;
  const firstRound = data.room.round === 1;
  const [picked, setPicked] = useState<string | null>(firstRound ? FIRST_ROUND_CATEGORY : null);
  const reveal = useSafeMutation(api.game.reveal);
  const skip = useSafeMutation(api.game.skipReveal);

  const alive = data.players.filter((p) => p.alive);
  const waiting = alive.filter((p) => !p.revealedThisRound);
  const done = me.revealedThisRound;
  const threat = currentThreat(data);
  const newThreat = threat?.round === data.room.round;

  let line: string;
  if (!me.alive) line = "Siz tashqaridasiz, lekin kuzatib turishingiz mumkin. Popkorn bormi?";
  else if (done) line = `Zoʻr! Endi ${waiting.length} kishini kutamiz: ${waiting.map((p) => p.name).join(", ")}.`;
  else if (firstRound) line = "Birinchi raundda hamma kasbini ochadi, hech kim chiqarilmaydi. Pastdagi tugmani bosing!";
  else if (newThreat) line = "Bunkerda nosozlik! Kartangiz shu muammoni hal qila oladimi? Endi qaysi kartani ochishni yaxshilab oʻylang.";
  else line = "Bitta yashirin kartani tanlab oching. Qaysi biri sizni bunkerga olib kiradi?";

  return (
    <Screen scenario={data.room.scenario}>
      <GameHeader data={data} />
      {threat && <ThreatCard data={data} big={newThreat} />}
      <Title>MENING KARTALARIM</Title>
      <MoleSay mood={done ? "wave" : "guide"} variant={s.moleVariant} size={84}>
        {line}
      </MoleSay>

      <div className="grid grid-cols-2 gap-2">
        {me.cards.map((c) => {
          const selectable = me.alive && !done && !c.revealed && (!firstRound || c.category === FIRST_ROUND_CATEGORY);
          const selected = picked === c.category && selectable;
          return (
            <button
              key={c.category}
              type="button"
              aria-pressed={selected}
              disabled={!selectable}
              onClick={() => setPicked(c.category)}
              className={`flex min-h-[76px] flex-col gap-1.5 rounded-xl px-3 py-2.5 text-left shadow-[0_3px_0_var(--bg-deep)] transition-transform ${
                c.revealed
                  ? "border-2 border-sage bg-sage text-paper-ink"
                  : selected
                    ? "-translate-y-[3px] border-[3px] border-accent bg-paper text-paper-ink"
                    : "border-2 border-paper bg-paper text-paper-ink"
              } ${!selectable && !c.revealed ? "opacity-75" : ""}`}
            >
              <span className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-stem">
                {labelOf(c.category)}
                {c.revealed ? (
                  <span className="rounded-md bg-stem px-1.5 text-[10px] text-paper">OCHIQ</span>
                ) : (
                  <svg role="img" aria-label="Yashirin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                )}
              </span>
              <span className="text-[15px] font-black leading-tight">{c.value}</span>
            </button>
          );
        })}
      </div>

      <SpecialCard data={data} />
      <ErrorNote message={reveal.error ?? skip.error} />
      <div className="flex-1" />
      {me.alive && !done ? (
        <PrimaryButton
          vine="right"
          disabled={!picked || reveal.pending}
          onClick={async () => {
            if (picked) await reveal.run({ code, category: picked });
          }}
        >
          {picked ? `“${labelOf(picked)}”ni ochish` : "Kartani tanlang"}
        </PrimaryButton>
      ) : (
        <WaitNote>
          {alive.length - waiting.length} / {alive.length} kishi kartasini ochdi
        </WaitNote>
      )}
      {data.isHost && waiting.length > 0 && (me.revealedThisRound || !me.alive) && (
        <GhostButton onClick={() => skip.run({ code })}>Kutmasdan muhokamaga oʻtish</GhostButton>
      )}
    </Screen>
  );
}
