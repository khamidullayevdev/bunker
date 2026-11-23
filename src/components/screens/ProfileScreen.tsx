"use client";

import { SignOutButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { SCENARIOS, isScenarioId } from "../../../convex/lib/content";
import { Avatar, BackLink, ErrorNote, GhostButton, LoadingScreen, MoleSay, Screen, Title, formatDuration } from "@/components/ui";
import { useSafeMutation } from "@/lib/useSafeMutation";

export default function ProfileScreen() {
  const me = useQuery(api.users.me);
  const history = useQuery(api.users.history);
  const rename = useSafeMutation(api.users.rename);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  if (me === undefined) return <LoadingScreen />;
  if (me === null) return <LoadingScreen text="Profil tayyorlanmoqda..." />;

  const survivalRate = me.gamesPlayed ? Math.round((me.gamesSurvived / me.gamesPlayed) * 100) : 0;
  const stats = [
    { label: "Oʻyinlar", value: me.gamesPlayed },
    { label: "Bunkerga kirdi", value: me.gamesSurvived },
    { label: "Tashqarida qoldi", value: me.gamesEliminated },
    { label: "Omon qolish", value: `${survivalRate}%` },
  ];

  return (
    <Screen>
      <div className="flex items-center gap-3">
        <BackLink />
        <Title>PROFIL</Title>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border-2 border-line bg-surface p-3.5">
        <Avatar name={me.name} imageUrl={me.imageUrl} size={52} />
        {editing ? (
          <form
            className="flex min-w-0 flex-1 gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              await rename.run({ name });
              setEditing(false);
            }}
          >
            <label className="sr-only" htmlFor="name">Ism</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              className="h-11 min-w-0 flex-1 rounded-xl border-2 border-line bg-bg px-3 text-[16px] font-bold text-ink focus:border-accent focus:outline-none"
            />
            <button type="submit" className="h-11 shrink-0 rounded-xl bg-btn px-3 font-black text-btn-ink">Saqlash</button>
          </form>
        ) : (
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <span className="flex flex-col">
              <span className="text-[20px] font-black">{me.name}</span>
              <span className="text-[13px] font-bold text-muted">Jami oʻyin vaqti: {formatDuration(me.totalPlayMs)}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setName(me.name);
                setEditing(true);
              }}
              className="h-11 rounded-xl border-2 border-sage px-3 text-[14px] font-black"
            >
              Oʻzgartirish
            </button>
          </div>
        )}
      </div>
      <ErrorNote message={rename.error} />

      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col rounded-2xl bg-surface p-3 text-center">
            <span className="text-[26px] font-black text-accent">{s.value}</span>
            <span className="text-[13px] font-extrabold text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-1 text-[17px] font-black">Soʻnggi oʻyinlar</h2>
      {history && history.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {history.map((g) => (
            <li key={g._id} className="flex items-center gap-3 rounded-xl bg-surface px-3.5 py-2.5">
              <span className={g.survived ? "text-accent" : "text-muted"} aria-hidden="true">
                {g.survived ? "✓" : "✕"}
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-[15px] font-black">
                  {isScenarioId(g.scenario) ? SCENARIOS[g.scenario].name : g.scenario}
                  {g.profession ? ` · ${g.profession}` : ""}
                </span>
                <span className="text-[12px] font-bold text-muted">
                  {g.survived ? "Bunkerga kirdi" : `${g.eliminatedRound ?? "?"}-raundda chiqdi`} · {formatDuration(g.durationMs)} ·{" "}
                  {new Date(g.endedAt).toLocaleDateString("uz-UZ")}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <MoleSay mood="sad" size={80}>
          Hali birorta oʻyin yoʻq. Doʻstlaringizni chaqiring!
        </MoleSay>
      )}

      <div className="flex-1" />
      <SignOutButton redirectUrl="/sign-in">
        <GhostButton>Akkauntdan chiqish</GhostButton>
      </SignOutButton>
    </Screen>
  );
}
