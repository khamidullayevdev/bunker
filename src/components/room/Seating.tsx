"use client";

import { useEffect, useRef } from "react";
import { MoleSay, PrimaryButton } from "../ui";
import type { RoomData } from "./types";

/** Seating order for the real table: the lobby owner sits first, then everyone in the order they joined. */
export function seatingOrder(data: RoomData) {
  return [...data.players].sort((a, b) => Number(b.isHost) - Number(a.isHost) || a.seat - b.seat);
}

/** Borderless "people around a table" icon that opens the seating plan. */
export function SeatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Oʻtirish tartibi"
      title="Oʻtirish tartibi"
      className="flex size-11 shrink-0 items-center justify-center rounded-full text-accent active:scale-95"
    >
      <svg aria-hidden="true" width="36" height="36" viewBox="0 0 36 36" fill="currentColor">
        {/* a round table with four people sitting around it, each facing the table */}
        <circle cx="18" cy="18" r="5.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
        {[0, 90, 180, 270].map((deg) => (
          <g key={deg} transform={`rotate(${deg} 18 18)`}>
            <circle cx="18" cy="3.6" r="2.9" />
            <path d="M12.6 10.6 Q12.6 6.9 18 6.9 Q23.4 6.9 23.4 10.6 Z" />
          </g>
        ))}
      </svg>
    </button>
  );
}

/**
 * Full-screen plan of the real table: seats numbered in turn order, clockwise
 * from the top, so people sit down in the same order the game will call them.
 */
export function SeatingModal({ data, onClose }: { data: RoomData; onClose: () => void }) {
  const order = seatingOrder(data);
  const n = order.length;
  const closeRef = useRef<HTMLButtonElement>(null);
  const seat = n > 8 ? 46 : 56;
  const radius = n > 8 ? 41 : 38; // % of the square, from the centre

  // Live lobby updates re-render this modal; keep focus where it is and always call the latest onClose.
  const closeFn = useRef(onClose);
  useEffect(() => {
    closeFn.current = onClose;
  });
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeFn.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const nameOf = (p: (typeof order)[number]) => (p.nicknamePending ? "Laqab tanlanmoqda" : p.name);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="seating-title"
      data-scenario={data.room.scenario}
      className="bunker-bg fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain px-5 pt-5 pb-6 text-ink"
    >
      <div className="flex items-center gap-3">
        <h2 id="seating-title" className="flex-1 font-stencil text-[24px] leading-tight tracking-wide">
          OʻTIRISH TARTIBI
        </h2>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="flex size-11 items-center justify-center rounded-xl border-2 border-line bg-surface"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="mt-3">
        <MoleSay mood="guide" size={72}>
          Stol atrofida shu tartibda oʻtiring. 1-raqamdan boshlab soat yoʻnalishida gapiramiz va ovoz beramiz.
        </MoleSay>
      </div>

      <div className="relative mx-auto my-4 aspect-square w-full max-w-[360px]">
        <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 size-full">
          <defs>
            <marker id="seat-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 Z" fill="var(--accent)" />
            </marker>
          </defs>
          {/* the table */}
          <circle cx="50" cy="50" r={n > 8 ? 28 : 26} fill="var(--surface)" stroke="var(--line)" strokeWidth="1.6" />
          <circle cx="50" cy="50" r={n > 8 ? 24.5 : 22.5} fill="none" stroke="var(--line)" strokeWidth="0.6" strokeDasharray="2 2" />
          {/* clockwise arrow around the inside of the table */}
          <path
            d="M50 32 A18 18 0 1 1 32.3 46.9"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.4"
            strokeLinecap="round"
            markerEnd="url(#seat-arrow)"
          />
        </svg>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[10px] font-black uppercase leading-tight tracking-wide text-muted">
          Soat
          <br />
          yoʻnalishida
        </span>

        {order.map((p, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;
          return (
            <div
              key={p._id}
              className="absolute flex w-[84px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span
                className={`relative flex items-center justify-center rounded-full font-black ${
                  p.isMe ? "bg-accent text-btn-ink ring-4 ring-accent/35" : "bg-paper text-paper-ink"
                }`}
                style={{ width: seat, height: seat, fontSize: seat * 0.42 }}
              >
                {i + 1}
              </span>
              <span className={`max-w-full truncate rounded-md bg-bg/80 px-1 text-[12px] font-extrabold ${p.isMe ? "text-accent" : ""}`}>
                {nameOf(p)}
                {p.isMe ? " (siz)" : ""}
              </span>
            </div>
          );
        })}
      </div>

      <ol className="flex flex-col gap-1.5">
        {order.map((p, i) => (
          <li
            key={p._id}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 ${p.isMe ? "border-2 border-accent bg-surface" : "bg-surface"}`}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-paper text-[14px] font-black text-paper-ink">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-[15px] font-extrabold">
              {nameOf(p)}
              {p.isMe ? " (siz)" : ""}
            </span>
            {p.isHost && <span className="text-[12px] font-bold text-accent">Lobby egasi</span>}
          </li>
        ))}
      </ol>
      <p className="mt-2 text-center text-[13px] font-bold text-muted">
        Kimdir qoʻshilsa yoki chiqsa, tartib shu yerda yangilanadi.
      </p>

      <div className="mt-4">
        <PrimaryButton onClick={onClose}>Tushunarli</PrimaryButton>
      </div>
    </div>
  );
}
