"use client";

import { THREAT_BY_ID, type Threat } from "../../../convex/lib/content";
import { labelOf } from "./common";
import type { RoomData, RoomPlayer } from "./types";

const HAZARD = "#F2C200";

/** The threat in force this round (the latest one announced), if any. */
export function currentThreat(data: RoomData): { threat: Threat; round: number } | null {
  const last = data.room.threats.at(-1);
  const threat = last ? THREAT_BY_ID[last.id] : undefined;
  return last && threat ? { threat, round: last.round } : null;
}

/** Open cards of these players that can deal with the threat. */
function helpers(threat: Threat, players: RoomPlayer[], openOnly: boolean) {
  return players.flatMap((p) =>
    p.cards
      .filter((c) => c.value && (c.revealed || !openOnly) && threat.solvers.includes(c.value))
      .map((c) => ({ player: p, value: c.value!, category: c.category })),
  );
}

/** Scratches over the yellow card, like a worn hazard sign. */
function Scratches() {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 160" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full opacity-25">
      <path d="M8 20 L60 6 M230 150 L292 118 M250 18 L290 44 M14 140 L44 112 M120 154 L170 140" stroke="#1b1b1b" strokeWidth="2" strokeLinecap="round" />
      <path d="M266 70 L296 92 M4 70 L26 62" stroke="#1b1b1b" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/**
 * The threat card. `big` is the full announcement at the start of the round;
 * otherwise it is a compact reminder the players can open.
 */
export function ThreatCard({ data, big = false }: { data: RoomData; big?: boolean }) {
  const current = currentThreat(data);
  if (!current) return null;
  const { threat } = current;
  const alive = data.players.filter((p) => p.alive);
  const open = helpers(threat, alive, true);
  const me = data.players.find((p) => p.isMe);
  const mine = me?.alive ? helpers(threat, [me], false).filter((h) => !me.cards.find((c) => c.category === h.category)?.revealed) : [];

  const body = (
    <>
      <div className="relative overflow-hidden rounded-[6px] px-4 py-4 text-center text-[#1b1b1b]" style={{ background: HAZARD }}>
        <Scratches />
        <p className={`relative font-extrabold leading-snug ${big ? "text-[17px]" : "text-[14px]"}`}>{threat.text}</p>
      </div>
      <div className="flex flex-col gap-1.5 text-[13px] font-bold">
        <p className="text-muted">
          Yordam beradigan kartalar:{" "}
          <span className="text-ink">{threat.solvers.join(", ")}</span>
        </p>
        <p className={open.length ? "text-accent" : "text-muted"}>
          {open.length
            ? `Ochiq kartalarda bor: ${open.map((h) => `${h.player.name} (${h.value})`).join(", ")}`
            : "Hozircha hech kimning ochiq kartasida yoʻq. Kim isbotlaydi?"}
        </p>
        {mine.length > 0 && (
          <p className="rounded-lg bg-accent px-2.5 py-1.5 text-[13px] font-black text-btn-ink">
            Sizning yopiq kartangiz yordam beradi: {mine.map((h) => `${labelOf(h.category)} — ${h.value}`).join(", ")}. Ochish vaqti!
          </p>
        )}
      </div>
    </>
  );

  if (big) {
    return (
      <section aria-label="Tahdid" className="flex flex-col gap-2.5 rounded-[18px] border-2 border-line bg-[#1b1b1b] p-3.5">
        <h2 className="text-center font-stencil text-[34px] leading-none tracking-wide" style={{ color: HAZARD }}>
          TAHDID
        </h2>
        {body}
        <p className="text-center font-stencil text-[19px] leading-tight tracking-wide text-[#f4f4ee]">{threat.kind}</p>
      </section>
    );
  }

  return (
    <details className="group rounded-[14px] border-2 bg-[#1b1b1b] px-3 py-2.5" style={{ borderColor: HAZARD }}>
      <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
        <span className="rounded px-1.5 py-0.5 font-stencil text-[13px] text-[#1b1b1b]" style={{ background: HAZARD }}>
          TAHDID
        </span>
        <span className="min-w-0 flex-1 truncate text-[14px] font-black text-[#f4f4ee]">{threat.kind}</span>
        <span aria-hidden="true" className="text-[12px] font-black text-muted transition-transform group-open:rotate-180">
          ▼
        </span>
      </summary>
      <div className="mt-2.5 flex flex-col gap-2.5">{body}</div>
    </details>
  );
}

/** End of the game: which threats the people inside can handle. */
export function ThreatSummary({ data }: { data: RoomData }) {
  const inside = data.players.filter((p) => p.alive);
  const list = data.room.threats.map((t) => THREAT_BY_ID[t.id]).filter(Boolean);
  if (list.length === 0) return null;
  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="text-[16px] font-black text-accent">Tahdidlar</h2>
      {list.map((threat) => {
        const h = helpers(threat, inside, false);
        return (
          <div key={threat.id} className="flex items-start gap-2.5 rounded-xl bg-surface px-3 py-2">
            <span aria-hidden="true" className={`text-[16px] font-black ${h.length ? "text-accent" : "text-danger"}`}>
              {h.length ? "✓" : "✗"}
            </span>
            <span className="flex flex-col">
              <span className="text-[14px] font-black">{threat.kind}</span>
              <span className="text-[12px] font-bold text-muted">
                {h.length ? `Hal qiladi: ${h.map((x) => `${x.player.name} (${x.value})`).join(", ")}` : "Bunkerda buni hal qiladigan odam yoʻq."}
              </span>
            </span>
          </div>
        );
      })}
    </section>
  );
}
