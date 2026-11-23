"use client";

import { GhostButton, PrimaryButton, Screen, formatClock } from "../ui";
import Mole from "../Mole";
import Vine from "../Vine";
import { scenarioOf } from "./common";
import { ThreatSummary } from "./Threat";
import { PARTY_LINES, pickLine } from "../../../convex/lib/content";
import type { PhaseProps } from "./types";
import { MASCOT } from "@/lib/mascot";

export default function Finished({ data }: PhaseProps) {
  const s = scenarioOf(data);
  const inside = data.players.filter((p) => p.alive);
  const outside = data.players.filter((p) => !p.alive).sort((a, b) => (a.eliminatedRound ?? 0) - (b.eliminatedRound ?? 0));
  const duration = data.room.endedAt && data.room.startedAt ? data.room.endedAt - data.room.startedAt : 0;
  const me = data.players.find((p) => p.isMe);
  // Same toast on every phone: seeded by the room, aimed at someone who made it inside.
  const seed = `${data.room.code}-${data.room.endedAt ?? 0}`;
  const toastee = pickLine((inside.length ? inside : data.players).map((p) => p.name), `${seed}-who`);
  const toast = pickLine(PARTY_LINES, seed, toastee);
  const job = (p: (typeof data.players)[number]) => p.cards.find((c) => c.category === "kasb")?.value ?? "";

  return (
    <Screen scenario={data.room.scenario}>
      <div className="flex flex-col items-center gap-1 text-center">
        <Mole mood={me && !me.alive ? "sad" : "party"} variant={s.moleVariant} size={150} className="mole-bob" />
        <h1 className="font-stencil text-[30px] text-accent">BUNKER YOPILDI!</h1>
        <p className="text-[15px] font-extrabold text-muted">Oʻyin vaqti: <span className="tabular-nums">{formatClock(duration)}</span></p>
      </div>
      <p aria-live="polite" className="rounded-[18px] bg-accent px-3 py-2.5 text-center text-[16px] font-black leading-snug text-btn-ink">
        {toast}
      </p>
      <p className="rounded-2xl bg-paper px-3 py-2.5 text-center text-[14px] font-extrabold leading-snug text-paper-ink">
        {MASCOT}: {inside.map(job).filter(Boolean).join(", ")} — {s.duration}ga yetadigan jamoa! Natijalar profilingizga saqlandi.
      </p>

      <h2 className="text-[16px] font-black text-accent">Bunkerga kirdi</h2>
      <ul className="flex flex-col gap-2">
        {inside.map((p) => (
          <li key={p._id} className="flex items-center gap-3 rounded-xl border-2 border-[#9A7E3B] bg-surface px-3.5 py-2.5">
            <span aria-hidden="true" className="text-[18px] font-black text-accent">✓</span>
            <span className="flex-1 text-[16px] font-black">
              {p.name}
              {p.isMe ? " (siz)" : ""}
            </span>
            <span className="text-[13px] font-bold text-muted">{job(p)}</span>
          </li>
        ))}
      </ul>

      {outside.length > 0 && <h2 className="text-[16px] font-black text-sage">Tashqarida qoldi</h2>}
      <ul className="relative flex flex-col gap-1.5">
        {outside.map((p) => (
          <li key={p._id} className="flex items-center gap-3 rounded-xl bg-bg-deep px-3.5 py-2 text-muted/80">
            <span className="flex-1 text-[15px] font-extrabold line-through">{p.name}</span>
            <span className="text-[12px] font-bold">{p.eliminatedRound}-raundda chiqdi</span>
          </li>
        ))}
        {outside.length > 0 && <Vine kind="drape" width={350} height={30} className="absolute -top-3 left-0 opacity-80" />}
      </ul>

      <ThreatSummary data={data} />

      <div className="flex-1" />
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <GhostButton href="/profil">Statistika</GhostButton>
        <PrimaryButton href="/" vine="right">
          Yana oʻynash
        </PrimaryButton>
      </div>
    </Screen>
  );
}
