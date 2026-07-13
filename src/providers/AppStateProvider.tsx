"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface AppSettings {
  reduceMotion: boolean;
  showSpoilers: boolean;
  region: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  reduceMotion: false,
  showSpoilers: true,
  region: "JP",
};

interface AppState {
  favorites: string[];
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  recentHeroes: string[];
  pushRecentHero: (slug: string) => void;
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  hydrated: boolean;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites, favHydrated] = useLocalStorage<string[]>("mlbb:favorites", []);
  const [recentHeroes, setRecentHeroes] = useLocalStorage<string[]>("mlbb:recent-heroes", []);
  const [settings, setSettings] = useLocalStorage<AppSettings>("mlbb:settings", DEFAULT_SETTINGS);

  const toggleFavorite = useCallback(
    (slug: string) =>
      setFavorites((prev) =>
        prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
      ),
    [setFavorites]
  );

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  const pushRecentHero = useCallback(
    (slug: string) =>
      setRecentHeroes((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, 10)),
    [setRecentHeroes]
  );

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => setSettings((prev) => ({ ...prev, ...patch })),
    [setSettings]
  );

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite,
      recentHeroes,
      pushRecentHero,
      settings,
      updateSettings,
      hydrated: favHydrated,
    }),
    [favorites, toggleFavorite, isFavorite, recentHeroes, pushRecentHero, settings, updateSettings, favHydrated]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
