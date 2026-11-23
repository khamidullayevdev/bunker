"use client";

import { api } from "../../../convex/_generated/api";
import { useSafeMutation } from "@/lib/useSafeMutation";
import { Avatar, ErrorNote, GhostButton, MoleSay, PrimaryButton, Screen, Title, useNow } from "../ui";
import { EliminatedRow, GameHeader, TraitChips, WaitNote, hostName, labelOf, playerById, scenarioOf } from "./common";
import SpecialCard, { SpecialLog } from "./SpecialCard";
import { ThreatCard } from "./Threat";
import { SPEAKER_LINES, pickLine } from "../../../convex/lib/content";
import type { PhaseProps } from "./types";

/** After this long the mascot jokingly nudges the speaker. The turn is never skipped. */
const NUDGE_AFTER_MS = 90_000;

export default function Discussion({ data }: PhaseProps) {
  const s = scenarioOf(data);
  const code = data.room.code;
  const now = useNow(5000);
  const next = useSafeMutation(api.game.nextSpeaker);
  const vote = useSafeMutation(api.game.startVoting);
  const skipVote = useSafeMutation(api.game.skipFirstVote);
  const firstRound = data.room.round === 1;

  const speakerId = data.room.speakerOrder[data.room.speakerIndex];
  const speaker = playerById(data, speakerId);
  const allSpoke = !speaker;
  const iAmSpeaker = !!speaker?.isMe;
  const longTalk =
    data.room.nudge && !!data.room.speakerStartedAt && now - data.room.speakerStartedAt > NUDGE_AFTER_MS;
  const newCard = speaker?.cards.find((c) => c.revealedRound === data.room.round && c.value);

  let line: string;
  if (allSpoke && firstRound)
    line = data.isHost
      ? "Tanishuv tugadi! Birinchi raundda hech kim chiqmaydi. Keyingi raundga oʻtamiz, bunkerda nimadir buzilishi mumkin..."
      : `Tanishuv tugadi! Birinchi raundda hech kim chiqmaydi. ${hostName(data)} keyingi raundga oʻtkazadi.`;
  else if (allSpoke)
    line = data.isHost
      ? "Muhokama tugadi, kimmidur, sybalsa qillarin, us us uss us."
      : `Muhokama tugadi, kimmidur, sybalsa qillarin, us us uss us. ${hostName(data)} ovoz berishni boshlaydi.`;
  else if (longTalk) line = `${speaker!.name}, bratan, gap yetarli! Choy ham sovib qoldi, boshqalarga ham navbat ber.`;
  else {
    const joke = pickLine(SPEAKER_LINES, `${code}-${data.room.round}-${data.room.speakerIndex}`, speaker!.name);
    line = iAmSpeaker ? `Navbat sizda! ${joke}` : joke;
  }

  const me = data.players.find((p) => p.isMe)!;
  const alive = data.players.filter((p) => p.alive);
  const out = data.players.filter((p) => !p.alive);

  return (
    <Screen scenario={data.room.scenario}>
      <GameHeader data={data} />
      <Title>MUHOKAMA</Title>
      <ThreatCard data={data} />

      {speaker && (
        <div className="flex flex-col gap-2.5 rounded-[18px] border-[3px] border-accent bg-surface p-3.5">
          <div className="flex items-center gap-3">
            <Avatar name={speaker.name} imageUrl={speaker.imageUrl} size={48} />
            <span className="flex flex-col">
              <span className="text-[12px] font-extrabold tracking-wide text-accent">HOZIR GAPIRYAPTI</span>
              <span className="text-[20px] font-black">
                {speaker.name}
                {speaker.isMe ? " (siz)" : ""}
              </span>
            </span>
          </div>
          {newCard && (
            <p className="rounded-xl bg-paper px-3 py-2 text-[14px] font-extrabold text-paper-ink">
              Yangi karta: <span className="text-stem">{labelOf(newCard.category)}</span> — {newCard.value}
            </p>
          )}
        </div>
      )}

      <MoleSay
        mood={longTalk ? "sly" : allSpoke ? "judge" : "guide"}
        variant={s.moleVariant}
        size={allSpoke ? 92 : 78}
        accent={longTalk}
      >
        {line}
      </MoleSay>

      <div className="flex flex-col gap-2">
        {alive.map((p) => (
          <div
            key={p._id}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${p._id === speakerId ? "bg-line" : "bg-surface"}`}
          >
            <span className="w-[88px] shrink-0 truncate text-[14px] font-black">
              {p.name}
              {p.isMe ? " (siz)" : ""}
            </span>
            <TraitChips player={p} />
          </div>
        ))}
        {out.map((p) => (
          <EliminatedRow key={p._id} player={p} />
        ))}
      </div>

      <SpecialLog data={data} />
      <ErrorNote message={next.error ?? vote.error ?? skipVote.error} />
      {!me.alive && (
        <WaitNote>Siz {me.eliminatedRound}-raundda bunkerdan chiqdingiz. Endi faqat kuzatasiz.</WaitNote>
      )}
      <SpecialCard data={data} />
      <div className="flex-1" />
      <div className="grid grid-cols-2 gap-2.5">
        {(iAmSpeaker || data.isHost) && !allSpoke ? (
          <GhostButton onClick={() => next.run({ code })}>{iAmSpeaker ? "Gapim tugadi" : "Keyingi odam"}</GhostButton>
        ) : (
          <span />
        )}
        {data.isHost &&
          (firstRound ? (
            <PrimaryButton vine="right" onClick={() => skipVote.run({ code })} disabled={skipVote.pending}>
              2-raundga oʻtish
            </PrimaryButton>
          ) : (
            <PrimaryButton vine="right" onClick={() => vote.run({ code })} disabled={vote.pending}>
              Ovoz berish
            </PrimaryButton>
          ))}
      </div>
    </Screen>
  );
}
