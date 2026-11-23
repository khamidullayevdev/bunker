"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import Mole, { type MoleMood } from "./Mole";
import Vine from "./Vine";
import type { MoleVariant } from "../../convex/lib/content";

function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** A full-height themed screen. */
export function Screen({
  children,
  scenario,
  className,
}: {
  children: ReactNode;
  scenario?: string;
  className?: string;
}) {
  return (
    <div
      data-scenario={scenario}
      className={cx("bunker-bg flex min-h-full flex-1 flex-col gap-3 px-5 pt-5 pb-6 text-ink", className)}
    >
      {children}
    </div>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <h1 className="font-stencil text-[24px] leading-tight tracking-wide">{children}</h1>;
}

/** Qilichbek with a speech bubble. */
export function MoleSay({
  mood = "guide",
  variant = "classic",
  size = 96,
  children,
  accent = false,
}: {
  mood?: MoleMood;
  variant?: MoleVariant;
  size?: number;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-end gap-1">
      <Mole mood={mood} variant={variant} size={size} className="mole-bob shrink-0" />
      <div
        aria-live="polite"
        className={cx(
          "mb-3 flex-1 rounded-[18px_18px_18px_4px] px-3 py-2.5 text-[15px] font-extrabold leading-snug",
          accent ? "bg-accent text-btn-ink" : "bg-paper text-paper-ink",
        )}
      >
        {children}
      </div>
    </div>
  );
}

const base =
  "flex h-14 w-full items-center justify-center rounded-2xl px-4 text-[18px] font-black disabled:opacity-50";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  vine?: "left" | "right" | false;
  className?: string;
};

function WithVine({ vine, children }: { vine: ButtonProps["vine"]; children: ReactNode }) {
  if (!vine) return <>{children}</>;
  return (
    <div className="relative">
      {children}
      <Vine
        kind="edge"
        width={170}
        height={34}
        flip={vine === "right"}
        className={cx("absolute -top-4", vine === "right" ? "-right-2" : "-left-2")}
      />
    </div>
  );
}

export function PrimaryButton({ children, onClick, href, disabled, vine = "left", className }: ButtonProps) {
  const cls = cx(base, "btn-press bg-btn text-btn-ink", className);
  return (
    <WithVine vine={vine}>
      {href ? (
        <Link href={href} className={cls}>
          {children}
        </Link>
      ) : (
        <button type="button" onClick={onClick} disabled={disabled} className={cls}>
          {children}
        </button>
      )}
    </WithVine>
  );
}

export function GhostButton({ children, onClick, href, disabled, className }: ButtonProps) {
  const cls = cx(base, "border-2 border-sage text-ink text-[16px]", className);
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function DangerButton({ children, onClick, disabled }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(base, "btn-press btn-danger bg-danger text-danger-ink")}
    >
      {children}
    </button>
  );
}

export function Pill({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "surface" }) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-black",
        tone === "accent" ? "bg-accent text-btn-ink" : "border-2 border-line bg-surface text-ink",
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ name, imageUrl, size = 36, dim = false }: { name: string; imageUrl?: string | null; size?: number; dim?: boolean }) {
  return imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt=""
      width={size}
      height={size}
      className={cx("shrink-0 rounded-full object-cover", dim && "opacity-50 grayscale")}
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cx("flex shrink-0 items-center justify-center rounded-full bg-sage font-black text-btn-ink", dim && "opacity-50")}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours} soat ${minutes % 60} daqiqa`;
  return `${minutes} daqiqa`;
}

/** Stopwatch style: 0:45, 20:45, 1:12:54. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function useNow(intervalMs = 15000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** How long the game has been going. Never forces anything; it only informs. */
export function GameClock({ startedAt }: { startedAt: number | null }) {
  const now = useNow(1000);
  if (!startedAt) return null;
  return (
    <span className="flex items-center gap-1.5 text-[13px] font-extrabold text-muted">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2M9 2h6" />
      </svg>
      <span className="tabular-nums" aria-label="Oʻyin vaqti">{formatClock(now - startedAt)}</span>
    </span>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("relative rounded-[18px] border-2 border-line bg-surface p-4", className)}>
      {["top-[7px] left-[7px]", "top-[7px] right-[7px]", "bottom-[7px] left-[7px]", "bottom-[7px] right-[7px]"].map((pos) => (
        <span key={pos} aria-hidden="true" className={cx("absolute size-[7px] rounded-full bg-leaf", pos)} />
      ))}
      {children}
    </div>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-danger px-3 py-2 text-center text-[14px] font-extrabold text-danger-ink">
      {message}
    </p>
  );
}

export function BackLink({ href = "/", label = "Orqaga" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-line bg-surface text-ink"
    >
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}

export function LoadingScreen({ text = "Bunker eshigi ochilmoqda..." }: { text?: string }) {
  return (
    <Screen className="items-center justify-center">
      <Mole mood="guide" size={140} className="mole-bob" />
      <p className="text-[16px] font-extrabold text-muted">{text}</p>
    </Screen>
  );
}
