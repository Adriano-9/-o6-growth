import puppeteer from "puppeteer";

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

await page.goto("https://o6-demo-jhun-bistro-premium.vercel.app", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 3000));

// Scroll to vozes section
await page.evaluate(() => {
  const el = document.getElementById("vozes");
  if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
});
await new Promise((r) => setTimeout(r, 2000));

await page.screenshot({
  path: "public/demos/screenshots/jhun-vozes.png",
  type: "png",
  captureBeyondViewport: false,
});
console.log("✓ jhun-vozes.png");

// Also re-capture desktop hero
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({
  path: "public/demos/screenshots/jhun-desktop-hero-v2.png",
  type: "png",
  clip: { x: 0, y: 0, width: 1440, height: 900 },
});
console.log("✓ jhun-desktop-hero-v2.png");

await browser.close();
