import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function runMigration(moduleUrl, migrate) {
  if (!process.argv[1] || pathToFileURL(resolve(process.argv[1])).href !== moduleUrl) return;
  if (!process.argv.includes("--execute")) {
    console.error("Migración bloqueada. Revisar destino y datos; --execute autoriza efectos remotos.");
    process.exitCode = 1;
    return;
  }
  migrate().catch(() => {
    console.error("La migración falló. No se ha generado un catálogo parcial; revisar el destino antes de reintentar.");
    process.exitCode = 1;
  });
}