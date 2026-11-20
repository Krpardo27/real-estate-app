import { mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

await mkdir("reports/lighthouse", { recursive: true });
const target = process.env.AUDIT_URL || "http://127.0.0.1:4175";
for (const mode of ["mobile", "desktop"]) {
  const result = spawnSync(process.execPath, [
    fileURLToPath(import.meta.resolve("lighthouse/cli/index.js")), target,
    "--output=json", "--output=html", `--output-path=reports/lighthouse/${mode}`,
    `--chrome-flags=--headless=new --disable-dev-shm-usage${process.env.CHROME_NO_SANDBOX === "1" ? " --no-sandbox" : ""}`,
    ...(mode === "desktop" ? ["--preset=desktop"] : []),
  ], { stdio: "inherit" });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}