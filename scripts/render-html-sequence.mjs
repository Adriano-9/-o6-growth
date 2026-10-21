import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";
import { createCanvas, loadImage } from "canvas";

const [sourceArg, selector = ".slide", widthArg = "1080", heightArg = "1350"] =
  process.argv.slice(2);

if (!sourceArg) {
  throw new Error(
    "Uso: node scripts/render-html-sequence.mjs <html> [seletor] [largura] [altura]",
  );
}

const source = path.resolve(sourceArg);
const root = path.dirname(source);
const output = path.join(root, "png");
const width = Number(widthArg);
const height = Number(heightArg);

await fs.mkdir(output, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(source).href, { waitUntil: "networkidle0" });

const elements = await page.$$(selector);
const count = elements.length;
if (count === 0) throw new Error(`Nenhum elemento encontrado para ${selector}`);

const rendered = [];
for (let index = 0; index < count; index += 1) {
  const file = path.join(output, `slide-${String(index + 1).padStart(2, "0")}.png`);
  await elements[index].screenshot({ path: file });
  rendered.push(file);
}

await browser.close();

const columns = Math.min(count, count > 5 ? 4 : count);
const rows = Math.ceil(count / columns);
const thumbWidth = 360;
const thumbHeight = Math.round((height / width) * thumbWidth);
const gap = 18;
const board = createCanvas(
  columns * thumbWidth + (columns + 1) * gap,
  rows * thumbHeight + (rows + 1) * gap,
);
const context = board.getContext("2d");
context.fillStyle = "#080808";
context.fillRect(0, 0, board.width, board.height);

for (let index = 0; index < rendered.length; index += 1) {
  const image = await loadImage(rendered[index]);
  const x = gap + (index % columns) * (thumbWidth + gap);
  const y = gap + Math.floor(index / columns) * (thumbHeight + gap);
  context.drawImage(image, x, y, thumbWidth, thumbHeight);
}

await fs.writeFile(path.join(root, "overview.png"), board.toBuffer("image/png"));
console.log(`Rendered ${count} frames from ${source}`);
