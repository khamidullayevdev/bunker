"use client";

import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import type { FunctionReference } from "convex/server";
import { useCallback, useState } from "react";

/** Wraps a Convex mutation with pending state and a readable Uzbek error. */
export function useSafeMutation<M extends FunctionReference<"mutation">>(ref: M) {
  const mutate = useMutation(ref);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (args: M["_args"]): Promise<M["_returnType"] | undefined> => {
      setPending(true);
      setError(null);
      try {
        return await mutate(args);
      } catch (err) {
        setError(
          err instanceof ConvexError && typeof err.data === "string"
            ? err.data
            : "Nimadir xato ketdi. Yana urinib koʻring.",
        );
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [mutate],
  );

  return { run, pending, error, setError };
}
