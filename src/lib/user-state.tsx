import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getActivity, toggleActivity } from "./movies/api";
import type { UserActivity } from "./movies/types";

type SessionUser = { name: string; email: string };

type UserState = {
  hydrated: boolean;
  user: SessionUser | null;
  activity: UserActivity;
  isWatched: (id: string) => boolean;
  isLiked: (id: string) => boolean;
  toggleWatched: (id: string) => void;
  toggleLiked: (id: string) => void;
  signIn: (user?: SessionUser) => void;
  signOut: () => void;
};

const STORAGE_KEY = "moviegraph:state:v1";

const DEMO_USER: SessionUser = { name: "Araf", email: "araf@moviegraph.app" };
const GUEST_EMAIL = "guest@moviegraph.app";

const UserContext = createContext<UserState | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [activity, setActivity] = useState<UserActivity>({ watched: [], liked: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { user: SessionUser | null };
        setUser(parsed.user ?? null);
      }
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }));
  }, [hydrated, user]);

  const email = user?.email ?? GUEST_EMAIL;

  // Load the graph-stored activity for the active identity.
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    getActivity(email)
      .then((next) => {
        if (!cancelled) setActivity(next);
      })
      .catch(() => {
        if (!cancelled) setActivity({ watched: [], liked: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, email]);

  const toggle = useCallback(
    (kind: "watched" | "liked", id: string) => {
      // Optimistic update, then persist to CognoDB.
      setActivity((prev) => {
        const list = prev[kind];
        return {
          ...prev,
          [kind]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
        };
      });
      toggleActivity(email, id, kind)
        .then(setActivity)
        .catch(() => {
          getActivity(email)
            .then(setActivity)
            .catch(() => undefined);
        });
    },
    [email],
  );

  const value = useMemo<UserState>(
    () => ({
      hydrated,
      user,
      activity,
      isWatched: (id) => activity.watched.includes(id),
      isLiked: (id) => activity.liked.includes(id),
      toggleWatched: (id) => toggle("watched", id),
      toggleLiked: (id) => toggle("liked", id),
      signIn: (next) => setUser(next ?? DEMO_USER),
      signOut: () => setUser(null),
    }),
    [hydrated, user, activity, toggle],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
