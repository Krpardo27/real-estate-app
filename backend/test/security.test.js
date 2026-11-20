import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createApp } from "../src/server.js";

process.env.NODE_ENV = "test";
const token = "test-only-administrator-token-not-a-real-secret";

async function serve(t, options = {}) {
  const app = createApp({ allowedOrigin: "http://localhost:5173", token, uploadImage: async () => ({ secure_url: "https://example.com/image.png", public_id: "test-image" }), ...options });
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); }));
  return `http://127.0.0.1:${server.address().port}`;
}

test("API demo devuelve IDs reales, 404 y no finge persistencia", async (t) => {
  const base = await serve(t);
  const list = await fetch(`${base}/api/properties`);
  assert.equal(list.status, 200);
  assert.equal(list.headers.get("x-powered-by"), null);
  assert.equal(list.headers.get("x-content-type-options"), "nosniff");
  const entries = await list.json();
  assert.equal(entries.length, 600);
  assert.equal((await fetch(`${base}/api/properties/1`)).status, 200);
  assert.equal((await fetch(`${base}/api/1`)).status, 200);
  for (const id of ["99999", "1x", "-1"]) assert.equal((await fetch(`${base}/api/properties/${id}`)).status, 404);
  assert.equal((await fetch(`${base}/api`, { method: "POST", headers: { "content-type": "application/json" }, body: '{"title":"untrusted"}' })).status, 501);
});

test("CORS exacto, JSON acotado y errores sin detalles internos", async (t) => {
  const base = await serve(t);
  const good = await fetch(base, { headers: { origin: "http://localhost:5173" } });
  assert.equal(good.headers.get("access-control-allow-origin"), "http://localhost:5173");
  const blocked = await fetch(base, { headers: { origin: "https://untrusted.example" } });
  assert.equal(blocked.status, 403);
  assert.equal(blocked.headers.get("access-control-allow-origin"), null);
  const invalid = await fetch(`${base}/api`, { method: "POST", headers: { "content-type": "application/json" }, body: "{" });
  assert.equal(invalid.status, 400);
  assert.doesNotMatch(await invalid.text(), /SyntaxError|node_modules|stack|<html/i);
  const large = await fetch(`${base}/api`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "x".repeat(40000) }) });
  assert.equal(large.status, 413);
});

test("upload: cerrado por defecto y autenticación antes del parser", async (t) => {
  const disabled = await serve(t, { token: "" });
  assert.equal((await fetch(`${disabled}/api/upload`, { method: "POST" })).status, 503);
  const base = await serve(t);
  assert.equal((await fetch(`${base}/api/upload`, { method: "POST" })).status, 401);
  assert.equal((await fetch(`${base}/api/upload`, { method: "POST", headers: { authorization: `Bearer ${token}` } })).status, 400);
});

test("upload: valida MIME, firma y tamaño; prueba sin contactar Cloudinary", async (t) => {
  let uploads = 0;
  const base = await serve(t, { uploadImage: async () => { uploads++; return { secure_url: "https://example.com/image.png", public_id: "test-image" }; } });
  const post = (bytes, type) => {
    const form = new FormData();
    form.append("image", new Blob([bytes], { type }), "image.bin");
    return fetch(`${base}/api/upload`, { method: "POST", headers: { authorization: `Bearer ${token}` }, body: form });
  };
  assert.equal((await post("<svg onload=alert(1)>", "image/svg+xml")).status, 415);
  assert.equal((await post("not-a-png", "image/png")).status, 415);
  assert.equal((await post(new Uint8Array(5 * 1024 * 1024 + 1), "image/png")).status, 413);
  const valid = await post(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), "image/png");
  assert.equal(valid.status, 200);
  assert.equal(uploads, 1);
});

test("importar migraciones no ejecuta subidas ni escribe catálogos", async () => {
  await import("../src/scripts/importImages.js");
  await import("../src/scripts/migratePropertiesImages.js");
  await import("../src/scripts/migrateCitiesImages.js");
});