"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  CARD_CATEGORIES,
  SPECIAL_CARDS,
  type CardCategory,
  type MoleVariant,
  type SpecialId,
} from "../../../convex/lib/content";
import { MASCOT } from "@/lib/mascot";
import { useSafeMutation } from "@/lib/useSafeMutation";
import Ivy from "../Ivy";
import Mole from "../Mole";
import { ErrorNote, GhostButton, PrimaryButton } from "../ui";
import { labelOf, playerById, scenarioOf } from "./common";
import type { PhaseProps, RoomData, RoomPlayer } from "./types";

type PlayArgs = {
  targetId?: Id<"players">;
  secondId?: Id<"players">;
  voterId?: Id<"players">;
  category?: string;
};

/** The dashed "MAXSUS KARTA" row: what you hold, a ? for the explainer, and Ishlatish. */
export default function SpecialCard({ data }: PhaseProps) {
  const me = data.players.find((p) => p.isMe);
  const [mode, setMode] = useState<"info" | "use" | null>(null);
  const play = useSafeMutation(api.game.playSpecial);
  const special = me?.special;
  if (!me || !me.alive || !special?.id) return null;

  const card = SPECIAL_CARDS[special.id];
  const used = special.usedRound !== null;
  const rightPhase = (card.phases as string[]).includes(data.room.phase);
  const canUse = !used && rightPhase;
  const hint = card.phases.length === 1 ? "Ovoz berishda ishlatiladi" : "Muhokama yoki ovoz berishda ishlatiladi";
  const close = () => {
    play.setError(null);
    setMode(null);
  };

  return (
    <>
      <div
        className={`flex items-center gap-2.5 rounded-[14px] border-2 border-dashed px-3 py-2.5 ${
          used ? "border-line bg-bg-deep" : "border-accent bg-surface"
        }`}
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[11px] font-black tracking-[0.08em] text-accent">MAXSUS KARTA</span>
          <span className={`text-[14px] font-extrabold leading-tight ${used ? "text-muted line-through" : ""}`}>{card.title}</span>
          {used ? (
            <span className="text-[12px] font-bold text-muted">{special.usedRound}-raundda ishlatildi</span>
          ) : (
            !canUse && <span className="text-[12px] font-bold text-muted">{hint}</span>
          )}
        </span>
        <button
          type="button"
          onClick={() => setMode("info")}
          aria-label="Maxsus karta haqida"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-accent text-[18px] font-black text-accent"
        >
          ?
        </button>
        {!used && (
          <button
            type="button"
            disabled={!canUse}
            onClick={() => setMode("use")}
            className="h-11 shrink-0 rounded-xl border-2 border-accent px-3.5 text-[14px] font-black text-accent disabled:opacity-40"
          >
            Ishlatish
          </button>
        )}
      </div>

      {mode && (
        <SpecialCardModal id={special.id} scenario={data.room.scenario} mood={scenarioOf(data).moleVariant} confirm={mode === "use" && canUse} onClose={close}>
          {mode === "use" && canUse && (
            <UseFlow
              data={data}
              me={me}
              id={special.id}
              pending={play.pending}
              error={play.error}
              onCancel={close}
              onUse={async (args) => {
                const ok = await play.run({ code: data.room.code, ...args });
                if (ok) setMode(null);
              }}
            />
          )}
        </SpecialCardModal>
      )}
    </>
  );
}

/** Bunker-style modal for a special card, with hanging ivy over the top. */
export function SpecialCardModal({
  id,
  scenario,
  mood,
  confirm,
  onClose,
  children,
}: {
  id: SpecialId;
  scenario: string;
  mood: MoleVariant;
  /** True while the player is choosing how to use the card. */
  confirm: boolean;
  onClose: () => void;
  /** The use flow. When empty, the modal explains the card. */
  children?: ReactNode;
}) {
  const card = SPECIAL_CARDS[id];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div data-scenario={scenario} className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="special-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-full w-full max-w-[360px] flex-col overflow-hidden rounded-[22px] border-2 border-line bg-surface text-ink shadow-[0_18px_60px_rgb(0_0_0/0.6)]"
      >
        <div className="hazard-stripes h-2.5 shrink-0" aria-hidden="true" />
        {["top-[18px] left-[8px]", "top-[18px] right-[8px]", "bottom-[8px] left-[8px]", "bottom-[8px] right-[8px]"].map((pos) => (
          <span key={pos} aria-hidden="true" className={`absolute size-[7px] rounded-full bg-leaf ${pos}`} />
        ))}

        <div className="overflow-y-auto px-4 pb-4">
          <div className={`relative -mx-4 ${confirm ? "h-[118px]" : "h-[150px]"}`}>
            <Ivy width={360} height={confirm ? 118 : 150} seed={id.length * 13 + 5} className="absolute left-0 top-0" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <Mole mood={confirm ? "sly" : "guide"} variant={mood} size={confirm ? 84 : 104} />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-black tracking-[0.08em] text-btn-ink">MAXSUS KARTA</span>
            <h2 id="special-title" className="font-stencil text-[22px] leading-tight text-accent">
              {card.title}
            </h2>
            <p className="text-[14px] font-bold text-muted">{card.short}</p>
          </div>

          {children ?? (
            <>
              <dl className="mt-3 flex flex-col gap-2">
                <Section label="Nima qiladi?" text={card.what} />
                <Section label="Qachon ishlatish mumkin?" text={card.when} />
                <Section label="Hamma koʻradimi?" text={`Ha. Karta ishlatilganda ${MASCOT} buni hammaga eʼlon qiladi. Ungacha kartangiz sir.`} />
              </dl>
              <p className="mt-3 rounded-[16px_16px_16px_4px] bg-paper px-3 py-2.5 text-[14px] font-extrabold leading-snug text-paper-ink">
                {MASCOT} maslahati: {card.tip}
              </p>
              <div className="mt-4">
                <PrimaryButton onClick={onClose}>Tushunarli</PrimaryButton>
              </div>
            </>
          )}
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="absolute right-3 top-6 z-10 flex size-10 items-center justify-center rounded-xl border-2 border-line bg-bg text-ink"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border-2 border-line bg-bg px-3 py-2">
      <dt className="text-[11px] font-black tracking-[0.06em] text-accent uppercase">{label}</dt>
      <dd className="text-[14px] font-bold leading-snug">{text}</dd>
    </div>
  );
}

const cardOf = (p: RoomPlayer, category: string) => p.cards.find((c) => c.category === category);
const pid = (id: string) => id as Id<"players">;

/**
 * Step-by-step choices for playing a card. Every step only offers options that
 * the server will accept, and says plainly when there is nothing to pick yet.
 */
function UseFlow({
  data,
  me,
  id,
  pending,
  error,
  onUse,
  onCancel,
}: {
  data: RoomData;
  me: RoomPlayer;
  id: SpecialId;
  pending: boolean;
  error: string | null;
  onUse: (args: PlayArgs) => void;
  onCancel: () => void;
}) {
  const card = SPECIAL_CARDS[id];
  const alive = data.players.filter((p) => p.alive);
  const others = alive.filter((p) => !p.isMe);
  const [pick, setPick] = useState<string[]>([]);
  const [category, setCategory] = useState<string | null>(card.category ?? null);
  const [drawn, setDrawn] = useState(false);

  const toggle = (playerId: string, max: number) =>
    setPick((cur) => (cur.includes(playerId) ? cur.filter((x) => x !== playerId) : [...cur, playerId].slice(-max)));
  const one = (playerId: string) => setPick((cur) => (cur[0] === playerId ? [] : [playerId]));

  let body: ReactNode;
  let args: PlayArgs | null = null;

  if (id === "bekor") {
    const voters = data.votes
      .filter((v) => v.targetId === me._id)
      .map((v) => playerById(data, v.voterId))
      .filter((p): p is RoomPlayer => !!p);
    body = (
      <Step title="Kimning ovozini bekor qilasiz?" empty={voters.length === 0 && "Hali hech kim sizga ovoz bermadi. Kimdir bersa, qaytib keling."}>
        {voters.map((p) => (
          <Choice key={p._id} selected={pick[0] === p._id} onClick={() => one(p._id)} title={p.name} sub={`${me.name}ga ovoz bergan`} />
        ))}
      </Step>
    );
    if (pick[0]) args = { voterId: pid(pick[0]) };
  } else if (id === "ikki") {
    body = (
      <Step title="Kimga +2 ovoz yozamiz?">
        {others.map((p) => (
          <Choice key={p._id} selected={pick[0] === p._id} onClick={() => one(p._id)} title={p.name} sub={`${data.tally[p._id] ?? 0} ovoz → ${(data.tally[p._id] ?? 0) + 2} ovoz`} />
        ))}
      </Step>
    );
    if (pick[0]) args = { targetId: pid(pick[0]) };
  } else if (id === "qalqon") {
    body = <p className="mt-3 rounded-xl border-2 border-line bg-bg px-3 py-2.5 text-[14px] font-bold">{card.what}</p>;
    args = {};
  } else if (id === "almash_bagaj" || id === "almash_salomatlik" || id === "almash_istalgan") {
    const revealedBy = (cat: string) => alive.filter((p) => cardOf(p, cat)?.revealed);
    const cats = card.category ? [card.category] : CARD_CATEGORIES.map((c) => c.id).filter((c) => revealedBy(c).length >= 2);
    const owners = category ? revealedBy(category) : [];
    body = (
      <>
        {!card.category && (
          <Step title="1. Qaysi kartani almashtiramiz?" empty={cats.length === 0 && "Hali hech bir kartani kamida ikki kishi ochmagan. Keyinroq urinib koʻring."}>
            <div className="flex flex-wrap gap-1.5">
              {cats.map((c) => (
                <Chip key={c} selected={category === c} onClick={() => { setCategory(c); setPick([]); }}>
                  {labelOf(c)}
                </Chip>
              ))}
            </div>
          </Step>
        )}
        {category && (
          <Step
            title={`${card.category ? "" : "2. "}Ikki oʻyinchini tanlang (${pick.length}/2)`}
            empty={owners.length < 2 && `Hali kamida ikki kishi ${labelOf(category).toLowerCase()} kartasini ochmagan.`}
          >
            {owners.map((p) => (
              <Choice
                key={p._id}
                selected={pick.includes(p._id)}
                onClick={() => toggle(p._id, 2)}
                title={`${p.name}${p.isMe ? " (siz)" : ""}`}
                sub={cardOf(p, category)?.value ?? ""}
              />
            ))}
          </Step>
        )}
      </>
    );
    if (category && pick.length === 2) args = { targetId: pid(pick[0]), secondId: pid(pick[1]), category };
  } else if (id === "ogirlik") {
    const shared = (p: RoomPlayer) =>
      me.cards.filter((c) => !c.revealed && cardOf(p, c.category)?.revealed === false).map((c) => c.category);
    const targets = others.filter((p) => shared(p).length > 0);
    const target = targets.find((p) => p._id === pick[0]);
    body = (
      <>
        <Step title="1. Kim bilan almashasiz?" empty={targets.length === 0 && "Hech kim bilan umumiy yopiq kartangiz qolmagan."}>
          {targets.map((p) => (
            <Choice key={p._id} selected={pick[0] === p._id} onClick={() => { one(p._id); setCategory(null); }} title={p.name} sub={`${shared(p).length} ta yopiq karta`} />
          ))}
        </Step>
        {target && (
          <Step title="2. Qaysi yopiq kartangizni berasiz?">
            {shared(target).map((c) => (
              <Choice key={c} selected={category === c} onClick={() => setCategory(c)} title={labelOf(c)} sub={`Sizniki: ${cardOf(me, c)?.value ?? "?"} → ?`} />
            ))}
          </Step>
        )}
      </>
    );
    if (target && category) args = { targetId: pid(target._id), category };
  } else {
    body = (
      <>
        <div className="mt-3 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawn(true)}
            disabled={drawn}
            aria-label={drawn ? "Tortilgan karta: sir" : "Karta tortish"}
            className={`flex h-[112px] w-[84px] items-center justify-center rounded-xl border-[3px] font-stencil text-[44px] transition-transform ${
              drawn ? "mystery-flip border-accent bg-paper text-paper-ink" : "border-dashed border-accent bg-bg text-accent"
            }`}
          >
            ?
          </button>
          <p className="text-center text-[13px] font-bold text-muted">
            {drawn ? "Karta tortildi! Nima ekanini hech kim bilmaydi, hatto siz ham." : "Kartani bosib, bittasini torting."}
          </p>
        </div>
        {drawn && (
          <Step title="Kimning kartasini almashtiramiz?">
            {alive.map((p) => (
              <Choice key={p._id} selected={pick[0] === p._id} onClick={() => one(p._id)} title={`${p.name}${p.isMe ? " (siz)" : ""}`} sub="Bir kartasi “?” bilan almashadi" />
            ))}
          </Step>
        )}
      </>
    );
    if (drawn && pick[0]) args = { targetId: pid(pick[0]) };
  }

  return (
    <>
      {body}
      <ErrorNote message={error} />
      <div className="mt-4 flex flex-col gap-2.5">
        <PrimaryButton onClick={() => args && onUse(args)} disabled={!args || pending}>
          {pending ? "Ishlatilmoqda..." : "Hozir ishlatish"}
        </PrimaryButton>
        <GhostButton onClick={onCancel}>Hozircha yoʻq</GhostButton>
      </div>
    </>
  );
}

function Step({ title, empty, children }: { title: string; empty?: string | false; children?: ReactNode }) {
  return (
    <section className="mt-3 flex flex-col gap-1.5">
      <h3 className="text-[11px] font-black tracking-[0.06em] text-accent uppercase">{title}</h3>
      {empty ? <p className="rounded-xl border-2 border-dashed border-line px-3 py-2.5 text-[13px] font-bold text-muted">{empty}</p> : children}
    </section>
  );
}

function Choice({ selected, onClick, title, sub }: { selected: boolean; onClick: () => void; title: string; sub?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-12 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left ${
        selected ? "border-[3px] border-accent bg-bg-deep" : "border-2 border-line bg-bg"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-accent bg-accent" : "border-line"}`}
      >
        {selected && <span className="size-2 rounded-full bg-btn-ink" />}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[15px] font-black">{title}</span>
        {sub && <span className="truncate text-[12px] font-bold text-muted">{sub}</span>}
      </span>
    </button>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`h-10 rounded-full px-3.5 text-[13px] font-extrabold ${selected ? "bg-accent text-btn-ink" : "border-2 border-line bg-bg"}`}
    >
      {children}
    </button>
  );
}

/** One public sentence about a played card, with names. */
export function specialLine(data: RoomData, owner: RoomPlayer): string {
  const s = owner.special!;
  const name = (id: string | null) => playerById(data, id)?.name ?? "?";
  const cat = s.category ? labelOf(s.category as CardCategory).toLowerCase() : null;
  switch (s.id) {
    case "bekor":
      return `${owner.name}ga qarshi berilgan bitta ovoz hisoblanmaydi: ${name(s.voterId)}ning ovozi kuydi.`;
    case "ikki":
      return `${owner.name}ning ovozi ikkitaga oʻtdi: ${name(s.targetId)}ga +2 ovoz.`;
    case "qalqon":
      return `${owner.name} qalqon koʻtardi. Bu raundda unga qarshi ovozlar sanalmaydi.`;
    case "almash_bagaj":
    case "almash_salomatlik":
    case "almash_istalgan":
      return `${owner.name} kartani ishlatdi: ${name(s.targetId)} va ${name(s.secondId)}ning ${cat ?? "kartalari"} kartalari almashdi.`;
    case "ogirlik":
      return `${owner.name} ${name(s.targetId)} bilan bitta yopiq kartasini almashtirdi${cat ? ` (${cat})` : ""}. Nima tushgani sir.`;
    case "sirli":
      return s.targetId === owner._id
        ? `${owner.name} sirli kartani oʻziga oldi: bitta kartasi “?” bilan almashdi.`
        : `${owner.name} sirli kartani ${name(s.targetId)}ga berdi: uning bitta kartasi “?” bilan almashdi.`;
    default:
      return `${owner.name} maxsus kartani ishlatdi.`;
  }
}

/** Every special card played this round, newest last, announced by name. */
export function SpecialLog({ data }: PhaseProps) {
  const played = data.players.filter((p) => p.special?.id && p.special.usedRound === data.room.round);
  if (played.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1.5" aria-live="polite">
      {played.map((p) => (
        <li key={p._id} className="rounded-xl border-2 border-dashed border-accent bg-bg-deep px-3 py-2 text-[13px] font-extrabold leading-snug">
          <span className="text-accent">{SPECIAL_CARDS[p.special!.id!].title}:</span> {specialLine(data, p)}
        </li>
      ))}
    </ul>
  );
}
