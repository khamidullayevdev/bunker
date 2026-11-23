"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";

/** Makes sure the signed-in Clerk user has a row in Convex (needed for stats). */
export default function EnsureUser() {
  const { isAuthenticated } = useConvexAuth();
  const store = useMutation(api.users.store);
  useEffect(() => {
    if (isAuthenticated) void store({}).catch(() => {});
  }, [isAuthenticated, store]);
  return null;
}
