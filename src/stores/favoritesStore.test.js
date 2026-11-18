import { expect, test, vi } from "vitest";
import { createFavoritesStore, FAVORITES_STORAGE_KEY } from "./favoritesStore.js";

function setup(raw = null) {
  let stored = raw;
  const storage = {
    getItem: vi.fn(() => stored),
    setItem: vi.fn((_key, value) => { stored = value; }),
  };
  const target = new EventTarget();
  const store = createFavoritesStore({ getStorage: () => storage, eventTarget: target });
  return {
    store, storage, target,
    raw: () => stored,
    setRaw: (value) => { stored = value; },
    dispatch: (key = FAVORITES_STORAGE_KEY, storageArea = storage) => {
      target.dispatchEvent(Object.assign(new Event("storage"), { key, storageArea }));
    },
  };
}

test("inicia vacío con un snapshot estable e inmutable", () => {
  const { store, storage } = setup();
  const snapshot = store.getSnapshot();
  expect(snapshot).toStrictEqual({ ids: [], persistent: true });
  expect(store.getSnapshot()).toBe(snapshot);
  expect(store.getSnapshot()).toBe(snapshot);
  expect(storage.getItem).toHaveBeenCalledTimes(1);
  expect(() => snapshot.ids.push(1)).toThrow(TypeError);
});

test("conserva la clave existente y persiste agregar/quitar sin duplicados", () => {
  const { store, storage } = setup();
  store.toggle(1);
  expect(store.getSnapshot().ids).toStrictEqual([1]);
  expect(storage.setItem).toHaveBeenLastCalledWith("homeestate:favorites:v1", "[1]");
  store.toggle(2);
  store.toggle(1);
  expect(store.getSnapshot().ids).toStrictEqual([2]);
  store.toggle(1);
  store.toggle(1);
  expect(store.getSnapshot().ids).toStrictEqual([2]);
  expect(storage.setItem).toHaveBeenLastCalledWith(FAVORITES_STORAGE_KEY, "[2]");
});

test("carga y normaliza favoritos existentes sin duplicados ni IDs huérfanos", () => {
  const { store } = setup('[1,1,2,"2",null,0,-1,1.5,99999]');
  expect(store.getSnapshot()).toStrictEqual({ ids: [1, 2], persistent: true });
});

test.each(["{", "undefined", "null", "false", "123", '"texto"', '{"ids":[1]}'])("recupera datos inválidos %s sin desactivar persistencia", (raw) => {
  const { store, storage } = setup(raw);
  expect(store.getSnapshot()).toStrictEqual({ ids: [], persistent: true });
  store.toggle(1);
  expect(store.getSnapshot()).toStrictEqual({ ids: [1], persistent: true });
  expect(storage.setItem).toHaveBeenLastCalledWith(FAVORITES_STORAGE_KEY, "[1]");
});

test.each([0, -1, 1.5, NaN, Infinity, 99999, "1", null, undefined, {}, []])("ignora toggle con ID inválido %j", (id) => {
  const { store, storage } = setup();
  const listener = vi.fn();
  const unsubscribe = store.subscribe(listener);
  store.toggle(id);
  expect(store.getSnapshot().ids).toStrictEqual([]);
  expect(storage.setItem).not.toHaveBeenCalled();
  expect(listener).not.toHaveBeenCalled();
  unsubscribe();
});

test("notifica a todos los consumidores de la pestaña al agregar y quitar", () => {
  const { store } = setup();
  const first = vi.fn();
  const second = vi.fn();
  const offFirst = store.subscribe(first);
  const offSecond = store.subscribe(second);
  store.toggle(1);
  expect(first).toHaveBeenCalledTimes(1);
  expect(second).toHaveBeenCalledTimes(1);
  offFirst();
  store.toggle(1);
  expect(first).toHaveBeenCalledTimes(1);
  expect(second).toHaveBeenCalledTimes(2);
  offSecond();
});

test("comparte una sola escucha storage y la retira al quedar sin consumidores", () => {
  const { store, target } = setup();
  const add = vi.spyOn(target, "addEventListener");
  const remove = vi.spyOn(target, "removeEventListener");
  const first = store.subscribe(vi.fn());
  const second = store.subscribe(vi.fn());
  expect(add).toHaveBeenCalledTimes(1);
  first();
  expect(remove).not.toHaveBeenCalled();
  second();
  expect(remove).toHaveBeenCalledWith("storage", add.mock.calls[0][1]);
});

test("sincroniza otra pestaña y localStorage.clear sin esperar una interacción", () => {
  const { store, setRaw, dispatch } = setup("[1]");
  const listener = vi.fn();
  const unsubscribe = store.subscribe(listener);
  setRaw("[1,2,2]");
  dispatch();
  expect(store.getSnapshot().ids).toStrictEqual([1, 2]);
  expect(listener).toHaveBeenCalledTimes(1);
  setRaw(null);
  dispatch(null);
  expect(store.getSnapshot().ids).toStrictEqual([]);
  expect(listener).toHaveBeenCalledTimes(2);
  unsubscribe();
});

test("no re-renderiza si el JSON cambia pero la selección normalizada es la misma", () => {
  const { store, setRaw, dispatch } = setup("[1]");
  const unsubscribe = store.subscribe(vi.fn());
  const previous = store.getSnapshot();
  setRaw('[1,1,"invalido"]');
  dispatch();
  expect(store.getSnapshot()).toBe(previous);
  unsubscribe();
});

test("ignora eventos ajenos y sessionStorage", () => {
  const { store, storage, setRaw, dispatch } = setup("[1]");
  const listener = vi.fn();
  const unsubscribe = store.subscribe(listener);
  const reads = storage.getItem.mock.calls.length;
  setRaw("[2]");
  dispatch("otra-clave");
  dispatch(FAVORITES_STORAGE_KEY, {});
  expect(store.getSnapshot().ids).toStrictEqual([1]);
  expect(storage.getItem).toHaveBeenCalledTimes(reads);
  expect(listener).not.toHaveBeenCalled();
  unsubscribe();
});

test("al volver a suscribirse recoge cambios ocurridos sin escuchas", () => {
  const { store, setRaw } = setup("[1]");
  const off = store.subscribe(vi.fn());
  off();
  setRaw("[2]");
  const unsubscribe = store.subscribe(vi.fn());
  expect(store.getSnapshot().ids).toStrictEqual([2]);
  unsubscribe();
});

test("toggle lee el almacenamiento reciente para no sobrescribir cambios aún no notificados", () => {
  const { store, setRaw, raw } = setup("[1]");
  store.getSnapshot();
  setRaw("[2]");
  store.toggle(3);
  expect(store.getSnapshot().ids).toStrictEqual([2, 3]);
  expect(JSON.parse(raw())).toStrictEqual([2, 3]);
});

test("una escritura bloqueada mantiene la selección en memoria y notifica el aviso", () => {
  const { store, storage, setRaw, dispatch } = setup("[1]");
  const listener = vi.fn();
  const unsubscribe = store.subscribe(listener);
  storage.setItem.mockImplementation(() => { throw new Error("quota"); });
  store.toggle(2);
  expect(store.getSnapshot()).toStrictEqual({ ids: [1, 2], persistent: false });
  expect(listener).toHaveBeenCalledTimes(1);
  store.toggle(1);
  expect(store.getSnapshot()).toStrictEqual({ ids: [2], persistent: false });
  expect(storage.setItem).toHaveBeenCalledTimes(1);
  setRaw("[]");
  dispatch();
  expect(store.getSnapshot().ids).toStrictEqual([2]);
  unsubscribe();
});

test("el cambio de persistencia modifica el snapshot incluso sin cambiar los IDs", () => {
  const { store, storage, dispatch } = setup("[1]");
  const listener = vi.fn();
  const unsubscribe = store.subscribe(listener);
  const previous = store.getSnapshot();
  storage.getItem.mockImplementation(() => { throw new Error("blocked"); });
  dispatch();
  expect(store.getSnapshot()).not.toBe(previous);
  expect(store.getSnapshot()).toStrictEqual({ ids: [1], persistent: false });
  expect(listener).toHaveBeenCalledTimes(1);
  unsubscribe();
});

test("admite almacenamiento inaccesible y evita consultar window durante SSR", () => {
  const getStorage = vi.fn(() => { throw new Error("denied"); });
  const store = createFavoritesStore({ getStorage, eventTarget: null });
  const server = store.getServerSnapshot();
  expect(server).toStrictEqual({ ids: [], persistent: true });
  expect(getStorage).not.toHaveBeenCalled();
  expect(store.getSnapshot()).toStrictEqual({ ids: [], persistent: false });
  store.toggle(1);
  expect(store.getSnapshot()).toStrictEqual({ ids: [1], persistent: false });
  expect(store.getServerSnapshot()).toBe(server);
  expect(server.ids).toStrictEqual([]);
});