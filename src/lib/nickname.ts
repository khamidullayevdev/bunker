"use client";

import { useEffect, useState } from "react";

const KEY = "bunkercha.nickname";
export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 20;

/** The nickname the player typed last time, so they don't retype it every game. */
export function useNickname() {
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from storage after hydration
      if (saved) setNickname(saved);
    } catch {
      // Storage can be blocked (private mode); the field just starts empty.
    }
  }, []);

  function remember(value: string) {
    try {
      window.localStorage.setItem(KEY, value.trim());
    } catch {
      // ignore
    }
  }

  /** Returns an Uzbek error message, or null when the nickname is fine. */
  function problem(): string | null {
    const clean = nickname.trim();
    if (clean.length < NICKNAME_MIN) return "Laqabingizni yozing (kamida 2 harf).";
    return null;
  }

  return { nickname, setNickname, remember, problem };
}
