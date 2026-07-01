import puppeteer from "puppeteer";

const targets = [
  { url: "https://o6-demo-jhun-bistro-premium.vercel.app", name: "jhun" },
  { url: "https://o6-demo-emporio-premium.vercel.app", name: "emporio" },
];

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox"],
});

for (const t of targets) {
  // ── desktop hero ──
  const desk = await browser.newPage();
  await desk.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  console.log(`→ ${t.name} desktop ...`);
  await desk.goto(t.url, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 4500));
  await desk.screenshot({
    path: `public/demos/screenshots/${t.name}-desktop-hero.png`,
    type: "png",
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });
  console.log(`  ✓ desktop-hero`);
  await desk.close();

  // ── mobile full page ──
  const mob = await browser.newPage();
  await mob.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  console.log(`→ ${t.name} mobile full ...`);
  await mob.goto(t.url, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 4500));
  await mob.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y <= h; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 1500));
  await mob.screenshot({
    path: `public/demos/screenshots/${t.name}-mobile-full.png`,
    type: "png",
    fullPage: true,
  });
  console.log(`  ✓ mobile-full`);
  await mob.close();
}

await browser.close();
console.log("done.");
