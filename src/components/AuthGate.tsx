"use client";

import { RedirectToSignIn, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Welcome from "./Welcome";
import type { ReactNode } from "react";
import { LoadingScreen } from "./ui";

const PUBLIC_PREFIXES = ["/sign-in", "/sign-up"];

/**
 * Everyone needs an account to play. Signed-out visitors are sent to sign-in.
 * The real protection is in Convex: every function checks the user's identity.
 */
export default function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return <>{children}</>;
  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) {
    return (
      <>
        <RedirectToSignIn />
        <LoadingScreen text="Kirish sahifasiga oʻtilmoqda..." />
      </>
    );
  }
  return <NameGate>{children}</NameGate>;
}

/** New accounts pick their name once before seeing anything else. */
function NameGate({ children }: { children: ReactNode }) {
  const me = useQuery(api.users.me);
  // `me` is null for a moment on the very first visit while the account row is created.
  if (!me) return <LoadingScreen />;
  if (!me.nameChosen) return <Welcome />;
  return <>{children}</>;
}
