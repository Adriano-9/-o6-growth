/* eslint-disable */
const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "public", "logos");
fs.mkdirSync(OUT, { recursive: true });

const ORANGE = "#FF5722";
const WHITE = "#FFFFFF";
const DARK = "#0D0D0D";
const GREY = "#888888";

// Draw a regular hexagon centered at (cx, cy) with circumradius r.
function drawHex(ctx, cx, cy, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6; // flat-top hex (rotate 30deg)
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function save(canvas, name) {
  const p = path.join(OUT, name);
  fs.writeFileSync(p, canvas.toBuffer("image/png"));
  const size = fs.statSync(p).size;
  console.log(`${name.padEnd(22)} ${(size / 1024).toFixed(1).padStart(7)} KB`);
  return p;
}

// ─────────────────────────────────────────────────────────────
// 1. logo-branco.png — 600x160, white bg
// ─────────────────────────────────────────────────────────────
function logoBranco() {
  const w = 600, h = 160;
  const c = createCanvas(w, h);
  const ctx = c.getContext("2d");
  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, w, h);

  // hexagon left
  const hexR = 52;
  const hexCx = 80;
  const hexCy = h / 2;
  drawHex(ctx, hexCx, hexCy, hexR, ORANGE);

  // O6 inside hexagon (white)
  ctx.fillStyle = WHITE;
  ctx.font = "bold 40px Arial Black, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("O6", hexCx, hexCy);

  // GROWTH right
  ctx.fillStyle = DARK;
  ctx.font = "bold 56px Arial Black, Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const textX = 160;
  ctx.fillText("GROWTH", textX, 90);

  // accent line under GROWTH
  ctx.fillStyle = ORANGE;
  ctx.fillRect(textX, 100, 240, 2);

  // subtitle
  ctx.fillStyle = GREY;
  ctx.font = "16px Arial";
  ctx.fillText("SISTEMA COMERCIAL", textX, 128);

  return save(c, "logo-branco.png");
}

// ─────────────────────────────────────────────────────────────
// 2. logo-preto.png — 600x160, dark bg
// ─────────────────────────────────────────────────────────────
function logoPreto() {
  const w = 600, h = 160;
  const c = createCanvas(w, h);
  const ctx = c.getContext("2d");
  ctx.fillStyle = DARK;
  ctx.fillRect(0, 0, w, h);

  const hexR = 52;
  const hexCx = 80;
  const hexCy = h / 2;
  drawHex(ctx, hexCx, hexCy, hexR, ORANGE);

  ctx.fillStyle = WHITE;
  ctx.font = "bold 40px Arial Black, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("O6", hexCx, hexCy);

  ctx.fillStyle = WHITE;
  ctx.font = "bold 56px Arial Black, Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const textX = 160;
  ctx.fillText("GROWTH", textX, 90);

  ctx.fillStyle = ORANGE;
  ctx.fillRect(textX, 100, 240, 2);

  ctx.fillStyle = GREY;
  ctx.font = "16px Arial";
  ctx.fillText("SISTEMA COMERCIAL", textX, 128);

  return save(c, "logo-preto.png");
}

// ─────────────────────────────────────────────────────────────
// 3. logo-icone.png — 400x400, dark bg, rounded square, hex + GROWTH below
// ─────────────────────────────────────────────────────────────
function logoIcone() {
  const w = 400, h = 400;
  const c = createCanvas(w, h);
  const ctx = c.getContext("2d");

  // rounded dark background
  roundedRect(ctx, 0, 0, w, h, 60);
  ctx.fillStyle = DARK;
  ctx.fill();

  // hexagon centered (large)
  const hexR = 110;
  const hexCx = w / 2;
  const hexCy = 170;
  drawHex(ctx, hexCx, hexCy, hexR, ORANGE);

  // O6 inside
  ctx.fillStyle = WHITE;
  ctx.font = "bold 90px Arial Black, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("O6", hexCx, hexCy);

  // GROWTH below
  ctx.fillStyle = WHITE;
  ctx.font = "bold 44px Arial Black, Arial";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("GROWTH", w / 2, 330);

  // accent line
  ctx.fillStyle = ORANGE;
  ctx.fillRect(w / 2 - 60, 342, 120, 2);

  // subtitle
  ctx.fillStyle = GREY;
  ctx.font = "14px Arial";
  ctx.fillText("SISTEMA COMERCIAL", w / 2, 366);

  return save(c, "logo-icone.png");
}

// ─────────────────────────────────────────────────────────────
// 4. logo-compacta.png — 500x70, white bg, mini hex + inline
// ─────────────────────────────────────────────────────────────
function logoCompacta() {
  const w = 500, h = 70;
  const c = createCanvas(w, h);
  const ctx = c.getContext("2d");
  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, w, h);

  // mini hexagon
  const hexR = 24;
  const hexCx = 32;
  const hexCy = h / 2;
  drawHex(ctx, hexCx, hexCy, hexR, ORANGE);

  ctx.fillStyle = WHITE;
  ctx.font = "bold 18px Arial Black, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("O6", hexCx, hexCy);

  // O6 GROWTH inline
  ctx.fillStyle = DARK;
  ctx.font = "bold 26px Arial Black, Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("O6 GROWTH", 72, h / 2 - 4);

  // subtitle right
  ctx.fillStyle = GREY;
  ctx.font = "11px Arial";
  ctx.fillText("SISTEMA COMERCIAL", 72, h / 2 + 16);

  // accent line right
  ctx.fillStyle = ORANGE;
  ctx.fillRect(w - 110, h / 2 - 1, 90, 2);

  return save(c, "logo-compacta.png");
}

console.log("Generating O6 Growth logos...\n");
logoBranco();
logoPreto();
logoIcone();
logoCompacta();
console.log("\nDone. Files in:", OUT);
