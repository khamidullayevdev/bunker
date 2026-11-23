"use client";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useSafeMutation } from "@/lib/useSafeMutation";
import { Avatar, ErrorNote, GhostButton, MoleSay, PrimaryButton, Screen, Title } from "../ui";
import { GameHeader, TraitChips, WaitNote, hostName, playerById, scenarioOf } from "./common";
import SpecialCard, { SpecialLog } from "./SpecialCard";
import { ThreatCard } from "./Threat";
import { VOTER_LINES, pickLine } from "../../../convex/lib/content";
import type { PhaseProps } from "./types";

/**
 * Open voting: one voter at a time, everyone sees every vote live, so the accused
 * can argue back and earlier voters may change their mind before the host closes it.
 */
export default function Voting({ data }: PhaseProps) {
  const s = scenarioOf(data);
  const code = data.room.code;
  const cast = useSafeMutation(api.game.vote);
  const skip = useSafeMutation(api.game.skipVoter);
  const finish = useSafeMutation(api.game.finishVoting);

  const me = data.players.find((p) => p.isMe)!;
  const currentVoter = playerById(data, data.room.voterOrder[data.room.voterIndex]);
  const myVote = data.votes.find((v) => v.voterId === me._id);
  const canVote = me.alive && (!!myVote || currentVoter?._id === me._id);
  const allVoted = !currentVoter;

  const alive = data.players.filter((p) => p.alive);
  const voted = new Map<string, { name: string; cancelled: boolean }[]>();
  for (const v of data.votes) {
    const target = playerById(data, v.targetId);
    const cancelled =
      target?.special?.id === "bekor" && target.special.usedRound === data.room.round && target.special.voterId === v.voterId;
    voted.set(v.targetId, [...(voted.get(v.targetId) ?? []), { name: playerById(data, v.voterId)?.name ?? "?", cancelled }]);
  }
  // Special-card effects on one player this round, shown next to their count.
  const effects = (id: string) =>
    data.players
      .filter((p) => p.special?.usedRound === data.room.round)
      .flatMap((p) =>
        p.special!.id === "ikki" && p.special!.targetId === id
          ? [`+2 (${p.name})`]
          : p.special!.id === "qalqon" && p._id === id
            ? ["Qalqon"]
            : [],
      );
  const lastChanged = [...data.votes].reverse().find((v) => v.changed);
  const host = hostName(data);

  let line: string;
  if (allVoted) {
    line = data.isHost
      ? "Trenirovkam tugaguncha hal qilish, uss us uss us! Tayyor boʻlsangiz, “Yakunlash”ni bosing."
      : `Trenirovkam tugaguncha hal qilish, uss us uss us! ${host} oʻzin hal qivor uka.`;
  } else {
    const joke = pickLine(VOTER_LINES, `${code}-${data.room.round}-v${data.room.voterIndex}`, currentVoter!.name);
    line = currentVoter!.isMe ? `Navbat sizda, kimga ovoz berasiz? ${joke}` : joke;
  }

  return (
    <Screen scenario={data.room.scenario}>
      <GameHeader data={data} />
      <div className="flex items-baseline justify-between">
        <Title>OVOZ BERISH</Title>
        <span className="text-[13px] font-extrabold text-muted">
          {data.votes.length} / {alive.length} ovoz
        </span>
      </div>
      <MoleSay mood={allVoted ? "sly" : "judge"} variant={s.moleVariant} size={96} accent={!!currentVoter && !currentVoter.isMe}>
        {line}
      </MoleSay>
      <ThreatCard data={data} />
      <SpecialLog data={data} />
      {lastChanged && (
        <p className="text-center text-[13px] font-extrabold text-accent">
          {playerById(data, lastChanged.voterId)?.name} fikrini oʻzgartirdi → {playerById(data, lastChanged.targetId)?.name}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {alive.map((p) => {
          const voters = voted.get(p._id) ?? [];
          const count = data.tally[p._id] ?? 0;
          const badges = effects(p._id);
          const mine = myVote?.targetId === p._id;
          const disabled = !canVote || p.isMe || cast.pending;
          return (
            <li key={p._id}>
              <button
                type="button"
                disabled={disabled}
                aria-pressed={mine}
                onClick={() => cast.run({ code, targetId: p._id as Id<"players"> })}
                className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left ${
                  mine ? "border-[3px] border-danger bg-bg-deep" : "border-2 border-line bg-surface"
                } ${p._id === currentVoter?._id ? "ring-2 ring-accent" : ""}`}
              >
                <Avatar name={p.name} imageUrl={p.imageUrl} size={40} />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-[16px] font-black">
                    {p.name}
                    {p.isMe ? " (siz)" : ""}
                  </span>
                  <TraitChips player={p} />
                  {voters.length > 0 && (
                    <span className="text-[12px] font-extrabold text-danger">
                      Ovoz berdi:{" "}
                      {voters.map((v, i) => (
                        <span key={i} className={v.cancelled ? "text-muted line-through" : undefined}>
                          {i > 0 ? ", " : ""}
                          {v.name}
                        </span>
                      ))}
                    </span>
                  )}
                  {badges.length > 0 && (
                    <span className="flex flex-wrap gap-1">
                      {badges.map((b) => (
                        <span key={b} className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-black text-btn-ink">
                          {b}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[17px] font-black ${
                    count ? "bg-danger text-danger-ink" : "bg-line text-muted"
                  }`}
                  aria-label={`${count} ovoz`}
                >
                  {count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {!me.alive && (
        <WaitNote>Siz {me.eliminatedRound}-raundda bunkerdan chiqdingiz. Endi faqat kuzatasiz, ovoz bera olmaysiz.</WaitNote>
      )}
      <SpecialCard data={data} />
      <ErrorNote message={cast.error ?? skip.error ?? finish.error} />
      <div className="flex-1" />
      {canVote && myVote && !allVoted && (
        <p className="text-center text-[13px] font-bold text-muted">Ovoz berish yakunlanguncha fikringizni oʻzgartirishingiz mumkin.</p>
      )}
      {data.isHost && (
        <div className="grid grid-cols-2 gap-2.5">
          <GhostButton onClick={() => skip.run({ code })} disabled={allVoted}>
            Oʻtkazish
          </GhostButton>
          <PrimaryButton vine="right" onClick={() => finish.run({ code })} disabled={data.votes.length === 0 || finish.pending}>
            Yakunlash
          </PrimaryButton>
        </div>
      )}
    </Screen>
  );
}
