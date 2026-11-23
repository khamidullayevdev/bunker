"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Hatch from "@/components/Hatch";
import Mole from "@/components/Mole";
import Vine from "@/components/Vine";
import { Avatar, ErrorNote, GhostButton, Panel } from "@/components/ui";
import { useSafeMutation } from "@/lib/useSafeMutation";
import { NICKNAME_MAX, useNickname } from "@/lib/nickname";

export default function HomeScreen() {
  const router = useRouter();
  const me = useQuery(api.users.me);
  const [code, setCode] = useState("");
  const nick = useNickname();
  const create = useSafeMutation(api.rooms.create);
  const join = useSafeMutation(api.rooms.join);

  /** Every player, the host included, enters a nickname for this game. */
  function checkNickname(setError: (m: string | null) => void): boolean {
    const problem = nick.problem();
    setError(problem);
    if (!problem) nick.remember(nick.nickname);
    return !problem;
  }

  async function onJoin(e: FormEvent) {
    e.preventDefault();
    if (!checkNickname(join.setError)) return;
    if (code.trim().length < 4) {
      join.setError("Xona kodini toʻliq kiriting.");
      return;
    }
    const joined = await join.run({ code, nickname: nick.nickname });
    if (joined) router.push(`/xona/${joined}`);
  }

  async function onCreate() {
    const created = await create.run({});
    if (created) router.push(`/xona/${created}`);
  }

  return (
    <div className="bunker-bg flex min-h-full flex-1 flex-col gap-3 px-5 pt-5 pb-6 text-ink">
      <header className="flex items-center justify-between">
        <span className="font-stencil text-[26px] tracking-wide">
          BUNKER<span className="text-accent">*</span>CHA
        </span>
        <div className="flex gap-2">
          <Link
            href="/qoidalar"
            aria-label="Oʻyin qoidalari"
            className="flex size-11 items-center justify-center rounded-xl border-2 border-line bg-surface text-[20px] font-black text-paper"
          >
            ?
          </Link>
          <Link href="/profil" aria-label="Profil va statistika" className="flex size-11 items-center justify-center rounded-xl border-2 border-line bg-surface">
            <Avatar name={me?.name ?? "?"} imageUrl={me?.imageUrl} size={32} />
          </Link>
        </div>
      </header>

      <div className="relative mx-auto h-[262px] w-[300px]">
        <div className="absolute left-[40px] top-0">
          <Hatch />
        </div>
        <Vine kind="corner" width={110} height={110} className="absolute left-[10px] -top-[6px]" />
        <div className="absolute left-[78px] top-[100px]">
          <Mole mood="wave" size={160} className="mole-bob" />
        </div>
      </div>

      <p className="relative rounded-[18px] bg-paper px-4 py-3 text-[15px] font-bold leading-snug text-paper-ink">
        <span aria-hidden="true" className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 bg-paper" />
        Salom{nick.nickname.trim() ? `, ${nick.nickname.trim()}` : me ? `, ${me.name}` : ""}! Men Qilichbek, bunker qoʻriqchisi. Dunyo tugayapti, joy esa kam. Kim kirishini birga hal qilamiz.
      </p>

      <Panel>
        <form onSubmit={onJoin} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex min-w-0 flex-col gap-1.5 text-[13px] font-extrabold text-muted">
              {"O'yindagi Ism"}
              <input
                value={nick.nickname}
                onChange={(e) => nick.setNickname(e.target.value.slice(0, NICKNAME_MAX))}
                aria-required="true"
                placeholder="Masalan: Jasur"
                autoComplete="nickname"
                className="h-12 min-w-0 rounded-xl border-2 border-line bg-bg px-3 text-[16px] font-bold text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-[13px] font-extrabold text-muted">
              Xona kodi
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="K7M2"
                autoCapitalize="characters"
                autoComplete="off"
                inputMode="text"
                className="h-12 min-w-0 rounded-xl border-2 border-line bg-bg px-3 text-[18px] font-extrabold tracking-[0.2em] text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
              />
            </label>
          </div>
          <div className="relative mt-1">
            <button
              type="submit"
              disabled={join.pending}
              className="btn-press flex h-14 w-full items-center justify-center rounded-2xl bg-btn text-[19px] font-black text-btn-ink disabled:opacity-50"
            >
              {join.pending ? "Kirilmoqda..." : "Bunkerga kirish"}
            </button>
            <Vine kind="edge" width={190} height={38} className="absolute -left-2 -top-[18px]" />
          </div>
          <ErrorNote message={join.error} />
        </form>
      </Panel>

      <GhostButton onClick={onCreate} disabled={create.pending}>
        {create.pending ? "Xona ochilmoqda..." : "Yangi xona ochish"}
      </GhostButton>
      <ErrorNote message={create.error} />
    </div>
  );
}
