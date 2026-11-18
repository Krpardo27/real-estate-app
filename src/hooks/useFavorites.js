import { useSyncExternalStore } from "react";
import { favoritesStore } from "../stores/favoritesStore.js";

export function useFavorites() {
  const { ids, persistent } = useSyncExternalStore(
    favoritesStore.subscribe,
    favoritesStore.getSnapshot,
    favoritesStore.getServerSnapshot,
  );
  return { ids, toggle: favoritesStore.toggle, persistent };
}