"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { MIN_PLAYERS, SCENARIOS, SCENARIO_IDS } from "../../../convex/lib/content";
import { useSafeMutation } from "@/lib/useSafeMutation";
import Mole from "../Mole";
import { MASCOT } from "@/lib/mascot";
import { Avatar, BackLink, ErrorNote, GhostButton, MoleSay, PrimaryButton, Screen, Title } from "../ui";
import { hostName } from "./common";
import { SeatingButton, SeatingModal } from "./Seating";
import type { PhaseProps } from "./types";

export default function Lobby({ data }: PhaseProps) {
  const router = useRouter();
  const code = data.room.code;
  const me = data.players.find((p) => p.isMe)!;
  const [copied, setCopied] = useState(false);
  const [seating, setSeating] = useState(false);

  const start = useSafeMutation(api.rooms.start);
  const setScenario = useSafeMutation(api.rooms.setScenario);
  const setNudge = useSafeMutation(api.rooms.setNudge);
  const setReady = useSafeMutation(api.rooms.setReady);
  const leave = useSafeMutation(api.rooms.leave);
  const kick = useSafeMutation(api.rooms.kick);

  const notReady = data.players.filter((p) => !p.ready);
  const enough = data.players.length >= MIN_PLAYERS;
  const readyCount = data.players.length - notReady.length;

  let line: string;
  if (!enough) line = `Kamida ${MIN_PLAYERS} kishi kerak. Kodni doʻstlarga yuboring!`;
  else if (notReady.length) line = `${notReady[0].name} hali tayyor emas... Choy ichyaptimi?`;
  else if (data.isHost) line = "Hamma tayyor! Ssenariyni tanlang va boshlang.";
  else line = `Hamma tayyor! ${hostName(data)} boshlashini kutamiz.`;

  async function share() {
    const url = `${window.location.origin}/xona/${code}`;
    const text = `Bunker*cha: ${code} xonasiga kiring!`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Bunker*cha", text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the user closed the share sheet */
    }
  }

  return (
    <Screen scenario={data.room.scenario}>
      <div className="flex items-center gap-3">
        <BackLink />
        <div className="flex-1">
          <Title>KUTISH XONASI</Title>
        </div>
        <button
          type="button"
          onClick={async () => {
            await leave.run({ code });
            router.push("/");
          }}
          className="h-11 rounded-xl border-2 border-line px-3 text-[13px] font-extrabold text-muted"
        >
          Chiqish
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-line bg-surface">
        <div aria-hidden="true" className="hazard-stripes h-2.5" />
        <div className="flex items-center gap-3 px-3.5 py-3">
          <div className="flex flex-1 flex-col">
            <span className="text-[12px] font-extrabold uppercase tracking-wider text-sage">Bunker kodi</span>
            <span className="flex items-center gap-1.5">
              <span className="font-stencil text-[34px] tracking-[0.2em] text-accent">{code}</span>
              <SeatingButton onClick={() => setSeating(true)} />
            </span>
          </div>
          <button type="button" onClick={share} className="h-11 rounded-xl border-2 border-sage px-3.5 text-[14px] font-extrabold">
            {copied ? "Nusxalandi!" : "Ulashish"}
          </button>
        </div>
      </div>

      <MoleSay mood={enough && !notReady.length ? "wave" : "guide"} size={78}>
        {line}
      </MoleSay>

      <div className="flex items-baseline justify-between">
        <h2 className="text-[17px] font-black">Oʻyinchilar</h2>
        <span className="text-[14px] font-bold text-muted">
          {data.players.length} kishi · {readyCount} tayyor · bunkerda {data.room.capacity} joy
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {data.players.map((p) => (
          <li key={p._id} className="flex items-center gap-2.5 rounded-xl bg-surface px-2.5 py-2">
            <Avatar name={p.nicknamePending ? "?" : p.name} imageUrl={p.imageUrl} size={32} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[14px] font-extrabold">
                {p.name}
                {p.isMe ? " (siz)" : ""}
              </span>
              <span className={`text-[12px] font-bold ${p.isHost ? "text-accent" : p.ready ? "text-sage" : "text-muted"}`}>
                {p.isHost ? "Lobby egasi" : p.ready ? "Tayyor" : "Kutilmoqda..."}
              </span>
            </span>
            {data.isHost && !p.isMe && (
              <button
                type="button"
                aria-label={`${p.name}ni chiqarish`}
                onClick={() => kick.run({ code, playerId: p._id })}
                className="flex size-8 items-center justify-center rounded-lg text-muted"
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>

      <h2 className="mt-1 text-[17px] font-black">Halokat ssenariysi</h2>
      <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Halokat ssenariysi">
        {SCENARIO_IDS.map((id) => {
          const s = SCENARIOS[id];
          const on = data.room.scenario === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={!data.isHost}
              onClick={() => setScenario.run({ code, scenario: id })}
              data-scenario={id}
              className={`flex min-h-[104px] flex-col items-center gap-1 rounded-2xl bg-surface px-1 py-2 text-center ${
                on ? "border-[3px] border-accent" : "border-2 border-line opacity-80"
              }`}
            >
              <Mole variant={s.moleVariant} mood={on ? "wave" : "guide"} size={54} />
              <span className="text-[11px] font-extrabold leading-tight text-ink">{s.name}</span>
            </button>
          );
        })}
      </div>

      <label className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-2.5">
        <span className="flex flex-1 flex-col">
          <span className="text-[14px] font-extrabold">{MASCOT} eslatib tursin</span>
          <span className="text-[12px] font-semibold text-muted">
            Gap choʻzilsa, hazil bilan ogohlantiradi. Navbat hech qachon oʻtib ketmaydi.
          </span>
        </span>
        <input
          type="checkbox"
          checked={data.room.nudge}
          disabled={!data.isHost}
          onChange={(e) => setNudge.run({ code, nudge: e.target.checked })}
          className="size-6 accent-[var(--btn)]"
        />
      </label>

      <ErrorNote message={start.error ?? setScenario.error ?? leave.error ?? setReady.error} />
      <div className="flex-1" />
      {data.isHost ? (
        <PrimaryButton onClick={() => start.run({ code })} disabled={!enough || notReady.length > 0 || start.pending}>
          {start.pending ? "Boshlanmoqda..." : "Oʻyinni boshlash"}
        </PrimaryButton>
      ) : me.ready ? (
        <GhostButton onClick={() => setReady.run({ code, ready: false })}>Tayyor emasman</GhostButton>
      ) : (
        <PrimaryButton onClick={() => setReady.run({ code, ready: true })}>Men tayyorman!</PrimaryButton>
      )}
      {seating && <SeatingModal data={data} onClose={() => setSeating(false)} />}
    </Screen>
  );
}
