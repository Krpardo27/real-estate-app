import { properties } from "../data/properties.js";

export const FAVORITES_STORAGE_KEY = "homeestate:favorites:v1";
const propertyIds = new Set(properties.map((property) => property.id));
const validId = (id) => Number.isSafeInteger(id) && propertyIds.has(id);
const serverSnapshot = Object.freeze({ ids: Object.freeze([]), persistent: true });

/** Store compartido; los adaptadores permiten probarlo sin DOM ni otras dependencias. */
export function createFavoritesStore({
  getStorage = () => window.localStorage,
  eventTarget = typeof window === "undefined" ? null : window,
} = {}) {
  let snapshot = serverSnapshot;
  let initialized = false;
  let cachedRaw;
  let memoryOnly = false;
  const listeners = new Set();

  function updateSnapshot(ids, persistent) {
    if (persistent === snapshot.persistent && ids.length === snapshot.ids.length && ids.every((id, index) => id === snapshot.ids[index])) return;
    snapshot = Object.freeze({ ids: Object.freeze([...ids]), persistent });
  }

  function refresh() {
    if (memoryOnly) return snapshot;
    let raw;
    try {
      raw = getStorage().getItem(FAVORITES_STORAGE_KEY);
    } catch {
      memoryOnly = true;
      initialized = true;
      updateSnapshot(snapshot.ids, false);
      return snapshot;
    }

    if (!initialized || raw !== cachedRaw) {
      initialized = true;
      cachedRaw = raw;
      // JSON inválido no significa que el navegador impida guardar.
      // La siguiente selección válida repara el valor sin perder persistencia.
      let value;
      try { value = JSON.parse(raw || "[]"); } catch { value = []; }
      const ids = Array.isArray(value) ? [...new Set(value.filter(validId))] : [];
      updateSnapshot(ids, true);
    }
    return snapshot;
  }

  function notify() {
    [...listeners].forEach((listener) => listener());
  }

  function handleStorage(event) {
    if (memoryOnly || (event.key !== FAVORITES_STORAGE_KEY && event.key !== null)) return;
    try {
      if (event.storageArea && event.storageArea !== getStorage()) return;
    } catch { /* refresh comunica el fallo a todos los consumidores. */ }
    const previous = snapshot;
    refresh();
    if (snapshot !== previous) notify();
  }

  function subscribe(listener) {
    listeners.add(listener);
    if (listeners.size === 1) {
      // Capturar cambios ocurridos cuando no había consumidores suscritos.
      refresh();
      eventTarget?.addEventListener("storage", handleStorage);
    }
    return () => {
      listeners.delete(listener);
      if (!listeners.size) eventTarget?.removeEventListener("storage", handleStorage);
    };
  }

  function toggle(id) {
    if (!validId(id)) return;
    // Leer antes de escribir combina cambios de otras pestañas aún no notificados.
    // localStorage no es transaccional: ante escrituras simultáneas gana la última.
    const { ids } = refresh();
    const next = ids.includes(id) ? ids.filter((entry) => entry !== id) : [...ids, id];
    const raw = JSON.stringify(next);
    if (!memoryOnly) {
      try { getStorage().setItem(FAVORITES_STORAGE_KEY, raw); }
      catch { memoryOnly = true; }
    }
    initialized = true;
    cachedRaw = raw;
    updateSnapshot(next, !memoryOnly);
    notify();
  }

  return {
    subscribe,
    getSnapshot: () => initialized ? snapshot : refresh(),
    getServerSnapshot: () => serverSnapshot,
    toggle,
  };
}

export const favoritesStore = createFavoritesStore();