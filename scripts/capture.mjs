import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4175";
await mkdir("reports/screenshots", { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", args: process.env.CHROME_NO_SANDBOX === "1" ? ["--no-sandbox"] : [] });
try {
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    for (const [name, path] of [["home", "/"], ["search", "/search?filters=all"], ["detail", "/property/1"], ["favorites", "/favorites"]]) {
      await page.goto(new URL(path, base).href, { waitUntil: "networkidle" });
      await page.screenshot({ path: `reports/screenshots/${name}-${width}.png`, fullPage: true });
    }
    await context.close();
  }
} finally {
  await browser.close();
}