import puppeteer from "puppeteer";
import path from "node:path";
import { pathToFileURL } from "node:url";

const file = path.resolve("public/demos/jhun-bistro-premium.html");
const url = pathToFileURL(file).href;

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
console.log("→ local:", url);
await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 5000));

// Hero
await page.screenshot({ path: "public/demos/screenshots/jhun-local-hero.png", captureBeyondViewport: false });
console.log("✓ hero");

// Vozes
await page.evaluate(() => document.getElementById("vozes")?.scrollIntoView({ block: "start" }));
await new Promise((r) => setTimeout(r, 2500));
await page.screenshot({ path: "public/demos/screenshots/jhun-local-vozes.png", captureBeyondViewport: false });
console.log("✓ vozes");

await browser.close();
