"use client";

import { useParams } from "next/navigation";
import type { FormEvent } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSafeMutation } from "@/lib/useSafeMutation";
import { NICKNAME_MAX, useNickname } from "@/lib/nickname";
import { ErrorNote, GhostButton, LoadingScreen, MoleSay, PrimaryButton, Screen, Title } from "@/components/ui";
import Lobby from "@/components/room/Lobby";
import Intro from "@/components/room/Intro";
import Reveal from "@/components/room/Reveal";
import Discussion from "@/components/room/Discussion";
import Voting from "@/components/room/Voting";
import Result from "@/components/room/Result";
import Finished from "@/components/room/Finished";

export default function RoomScreen() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? "").toUpperCase();
  const me = useQuery(api.users.me);
  const data = useQuery(api.rooms.get, me ? { code } : "skip");
  const join = useSafeMutation(api.rooms.join);
  const setNickname = useSafeMutation(api.rooms.setNickname);
  const nick = useNickname();

  async function onSetNickname(e?: FormEvent) {
    e?.preventDefault();
    const problem = nick.problem();
    setNickname.setError(problem);
    if (problem) return;
    nick.remember(nick.nickname);
    await setNickname.run({ code, nickname: nick.nickname });
  }

  async function onJoin() {
    const problem = nick.problem();
    join.setError(problem);
    if (problem) return;
    nick.remember(nick.nickname);
    await join.run({ code, nickname: nick.nickname });
  }

  // `me` is null for a moment on the very first visit while the account row is created.
  if (!me || data === undefined) return <LoadingScreen />;

  if (data === null) {
    return (
      <Screen>
        <Title>XONA TOPILMADI</Title>
        <MoleSay mood="scared" size={110}>
          {code} kodli bunker yoʻq. Kodni tekshirib koʻring!
        </MoleSay>
        <div className="flex-1" />
        <GhostButton href="/">Bosh sahifa</GhostButton>
      </Screen>
    );
  }

  if (!data.meId) {
    const open = data.room.phase === "lobby";
    return (
      <Screen scenario={data.room.scenario}>
        <Title>{code} XONASI</Title>
        <MoleSay mood={open ? "wave" : "sad"} size={110}>
          {open
            ? `Sizni ${data.players.length} kishi kutyapti! Qoʻshilasizmi?`
            : "Afsus, bu xonada oʻyin allaqachon boshlangan. Keyingisiga ulgurasiz!"}
        </MoleSay>
        {open && (
          <label className="flex flex-col gap-1.5 text-[13px] font-extrabold text-muted">
            {"O'yindagi Ism"}
            <input
              value={nick.nickname}
              onChange={(e) => nick.setNickname(e.target.value.slice(0, NICKNAME_MAX))}
              placeholder="Masalan: Jasur"
              autoComplete="nickname"
              aria-required="true"
              className="h-12 rounded-xl border-2 border-line bg-bg px-3 text-[16px] font-bold text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
            />
          </label>
        )}
        <ErrorNote message={join.error} />
        <div className="flex-1" />
        {open ? (
          <PrimaryButton onClick={onJoin} disabled={join.pending}>
            Xonaga qoʻshilish
          </PrimaryButton>
        ) : null}
        <GhostButton href="/">Bosh sahifa</GhostButton>
      </Screen>
    );
  }

  // Last step after creating a room: what should everyone call you in this game?
  if (data.meNeedsNickname) {
    return (
      <Screen scenario={data.room.scenario}>
        <Title>LAQABINGIZ</Title>
        <MoleSay mood="guide" size={110}>
          Bunker tayyor! Oxirgi savol: oʻyin davomida sizni nima deb chaqiraylik?
        </MoleSay>
        <form onSubmit={onSetNickname} className="flex flex-1 flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-[13px] font-extrabold text-muted">
            {"O'yindagi Ism"}
            <input
              value={nick.nickname}
              onChange={(e) => nick.setNickname(e.target.value.slice(0, NICKNAME_MAX))}
              placeholder="Masalan: Abil koʻcha"
              autoComplete="nickname"
              autoFocus
              aria-required="true"
              className="h-12 rounded-xl border-2 border-line bg-bg px-3 text-[16px] font-bold text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
            />
          </label>
          <p className="text-[13px] font-bold text-muted">Bu laqab faqat shu oʻyin uchun. Akkauntingizdagi ism oʻzgarmaydi.</p>
          <ErrorNote message={setNickname.error} />
          <div className="flex-1" />
          <PrimaryButton onClick={() => onSetNickname()} disabled={setNickname.pending}>
            {setNickname.pending ? "Saqlanmoqda..." : "Bunkerga tushish"}
          </PrimaryButton>
        </form>
      </Screen>
    );
  }

  switch (data.room.phase) {
    case "lobby":
      return <Lobby data={data} />;
    case "intro":
      return <Intro data={data} />;
    case "reveal":
      return <Reveal data={data} />;
    case "discussion":
      return <Discussion data={data} />;
    case "voting":
      return <Voting data={data} />;
    case "result":
      return <Result data={data} />;
    case "finished":
      return <Finished data={data} />;
  }
}
