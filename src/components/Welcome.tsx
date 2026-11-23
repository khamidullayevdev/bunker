"use client";

import { useState, type FormEvent } from "react";
import { api } from "../../convex/_generated/api";
import { useSafeMutation } from "@/lib/useSafeMutation";
import AuthShell from "./AuthShell";
import { ErrorNote, Panel, PrimaryButton } from "./ui";

/** One-time welcome after signing up: the player tells us what to call them. */
export default function Welcome() {
  const [name, setName] = useState("");
  const save = useSafeMutation(api.users.rename);

  async function onSave(e?: FormEvent) {
    e?.preventDefault();
    if (name.trim().length < 2) {
      save.setError("Ismingizni yozing (kamida 2 harf).");
      return;
    }
    await save.run({ name });
  }

  return (
    <AuthShell line="Xush kelibsiz! Men Qilichbek, bunker qoʻriqchisi. Derski, koʻcha yigiti, lekin seryozni hazilkashman. Tanishib olaylik: sizni nima deb chaqiramiz?">
      <Panel>
        <form onSubmit={onSave} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-[13px] font-extrabold text-muted">
            Ismingiz
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 24))}
              placeholder="Masalan: Abdulloh"
              autoComplete="given-name"
              autoFocus
              aria-required="true"
              className="h-12 rounded-xl border-2 border-line bg-bg px-3 text-[16px] font-bold text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
            />
          </label>
          <p className="text-[13px] font-bold text-muted">Bu ism profilingizda turadi. Har bir oʻyinda xohlagan laqabingiz bilan kirishingiz mumkin.</p>
          <ErrorNote message={save.error} />
          <div className="mt-1">
            <PrimaryButton onClick={() => onSave()} disabled={save.pending}>
              {save.pending ? "Saqlanmoqda..." : "Davom etish"}
            </PrimaryButton>
          </div>
        </form>
      </Panel>
    </AuthShell>
  );
}
