// ============================================================
// engine.js — movement, camera, tiles, drawing, dialog.
// Pokémon-style grid walking, Stardew-style warmth.
// ============================================================

(() => {
  const TILE = 16, SCALE = 3, TS = TILE * SCALE;
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const VIEW_W = canvas.width;   // 960
  const VIEW_H = canvas.height;  // 624

  const SOLID = new Set(["t", "w"]);

  // ---------- deterministic per-tile randomness (for grass detail) ----------
  function hash(x, y) {
    let h = (x * 374761393 + y * 668265263) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }

  // ---------- state ----------
  const map = MAPS.gallery;
  const mapW = map.tiles[0].length, mapH = map.tiles.length;

  const player = {
    x: map.playerStart.x, y: map.playerStart.y,
    px: map.playerStart.x * TS, py: map.playerStart.y * TS,
    facing: "down", moving: false, prog: 0, step: 0, animTick: 0,
  };

  const entities = map.entities.map(e => ({ ...e }));
  const occupied = () => {
    const s = new Set();
    for (const e of entities) s.add(e.x + "," + e.y);
    return s;
  };

  let dialog = null; // {name, lines, idx, shown}
  let started = false;
  let tick = 0;

  // dev shortcut: ?skiptitle jumps straight into the world
  if (location.search.includes("skiptitle")) {
    started = true;
    document.getElementById("title-screen").classList.add("hidden");
  }

  // butterflies, purely decorative
  const butterflies = [];
  for (let i = 0; i < 7; i++) {
    butterflies.push({
      x: (2 + Math.random() * (mapW - 4)) * TS,
      y: (2 + Math.random() * (mapH - 4)) * TS,
      a: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.5 ? "#f5f2ec" : "#f0a64a",
    });
  }

  // ---------- input ----------
  const held = new Set();
  const DIRS = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
    W: "up", S: "down", A: "left", D: "right",
  };

  window.addEventListener("keydown", (ev) => {
    if (DIRS[ev.key]) { held.add(DIRS[ev.key]); ev.preventDefault(); }
    if (ev.key === " " || ev.key === "z" || ev.key === "Z") {
      ev.preventDefault();
      if (!started) {
        started = true;
        document.getElementById("title-screen").classList.add("hidden");
        return;
      }
      if (dialog) advanceDialog();
      else tryExamine();
    }
  });
  window.addEventListener("keyup", (ev) => {
    if (DIRS[ev.key]) held.delete(DIRS[ev.key]);
  });

  // ---------- dialog ----------
  const dlgBox = document.getElementById("dialog");
  const dlgName = document.getElementById("dialog-name");
  const dlgText = document.getElementById("dialog-text");

  function openDialog(name, lines) {
    dialog = { name, lines, idx: 0, shown: 0 };
    dlgName.textContent = name;
    dlgText.textContent = "";
    dlgBox.classList.remove("hidden");
  }
  function advanceDialog() {
    const full = dialog.lines[dialog.idx];
    if (dialog.shown < full.length) { dialog.shown = full.length; return; }
    dialog.idx++;
    if (dialog.idx >= dialog.lines.length) {
      dialog = null;
      dlgBox.classList.add("hidden");
    } else {
      dialog.shown = 0;
    }
  }
  function updateDialog() {
    if (!dialog) return;
    const full = dialog.lines[dialog.idx];
    if (dialog.shown < full.length) dialog.shown = Math.min(full.length, dialog.shown + 2);
    dlgText.textContent = full.slice(0, dialog.shown);
  }

  // ---------- movement & examine ----------
  const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  function walkable(x, y) {
    if (x < 0 || y < 0 || x >= mapW || y >= mapH) return false;
    if (SOLID.has(map.tiles[y][x])) return false;
    if (occupied().has(x + "," + y)) return false;
    return true;
  }

  function tryExamine() {
    const [dx, dy] = DELTA[player.facing];
    const tx = player.x + dx, ty = player.y + dy;
    const e = entities.find(e => e.x === tx && e.y === ty);
    if (e) openDialog(e.name, e.lines);
  }

  function updatePlayer() {
    if (dialog || !started) return;
    if (player.moving) {
      player.prog += 0.14;
      player.animTick++;
      if (player.animTick % 8 === 0) player.step = 1 - player.step;
      if (player.prog >= 1) {
        player.prog = 0;
        player.moving = false;
        player.px = player.x * TS;
        player.py = player.y * TS;
      } else {
        const [dx, dy] = DELTA[player.facing];
        player.px = (player.x - dx * (1 - player.prog)) * TS;
        player.py = (player.y - dy * (1 - player.prog)) * TS;
      }
    }
    if (!player.moving) {
      for (const dir of ["up", "down", "left", "right"]) {
        if (held.has(dir)) {
          player.facing = dir;
          const [dx, dy] = DELTA[dir];
          if (walkable(player.x + dx, player.y + dy)) {
            player.x += dx; player.y += dy;
            player.moving = true; player.prog = 0;
          }
          break;
        }
      }
    }
  }

  // ---------- drawing ----------
  function drawSpritePixels(sprite, grid, dx, dy, mirror) {
    const w = grid[0].length;
    for (let r = 0; r < grid.length; r++) {
      const row = grid[r];
      for (let c = 0; c < row.length; c++) {
        const ch = mirror ? row[row.length - 1 - c] : row[c];
        if (ch === ".") continue;
        const color = sprite.legend[ch];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(dx + c * SCALE, dy + r * SCALE, SCALE, SCALE);
      }
    }
  }

  function spriteGrid(spriteName, facing) {
    const s = SPRITES[spriteName];
    if (facing === "up" && s.up) return { s, grid: s.up, mirror: false };
    if (facing === "left" && s.side) return { s, grid: s.side, mirror: true };
    if (facing === "right" && s.side) return { s, grid: s.side, mirror: false };
    return { s, grid: s.down, mirror: false };
  }

  function drawCharacter(spriteName, facing, px, py, camX, camY, stepFrame) {
    const { s, grid, mirror } = spriteGrid(spriteName, facing);
    let rows = grid;
    if (stepFrame === 1 && s.feetAlt && s.feetRow != null && facing !== "left" && facing !== "right") {
      rows = grid.slice();
      rows[s.feetRow] = s.feetAlt;
    }
    const wPx = grid[0].length * SCALE;
    const hPx = grid.length * SCALE;
    const dx = Math.round(px - camX + (TS - wPx) / 2);
    const dy = Math.round(py - camY + TS - hPx + 2 * SCALE);
    // soft shadow at the feet
    ctx.fillStyle = "rgba(20,30,15,0.25)";
    ctx.beginPath();
    ctx.ellipse(Math.round(px - camX) + TS / 2, Math.round(py - camY) + TS - 4, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    drawSpritePixels(s, rows, dx, dy, mirror);
    return { dx, dy, wPx };
  }

  // ---------- pre-rendered terrain (Stardew-style detail) ----------
  // Ground textures are painted once at 2px detail (half the character
  // pixel size) onto offscreen canvases, then stamped per tile. This is
  // what gives the "modded Stardew" higher-res ground feel.
  function makeCanvas(w, h, fn) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    fn(g);
    return c;
  }
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const G_BASE = "#64b22d", G_DARK = "#3f8a1e", G_TIP = "#9ad852";

  function paintGrass(g, seed) {
    const r = mulberry(seed * 1013 + 7);
    g.fillStyle = G_BASE;
    g.fillRect(0, 0, TS, TS);
    // soft mottling — sparse single cells slightly darker/lighter
    for (let yy = 0; yy < 24; yy++)
      for (let xx = 0; xx < 24; xx++) {
        const n = r();
        if (n < 0.05) { g.fillStyle = "#57a527"; g.fillRect(xx * 2, yy * 2, 2, 2); }
        else if (n > 0.965) { g.fillStyle = "#74c23a"; g.fillRect(xx * 2, yy * 2, 2, 2); }
      }
    // grass tufts — clumps of dark blades, the Stardew signature
    const tufts = 1 + ((r() * 3) | 0);
    for (let t = 0; t < tufts; t++) {
      const tx = 2 + ((r() * 15) | 0), ty = 4 + ((r() * 15) | 0);
      const w = 4 + ((r() * 3) | 0);
      g.fillStyle = "rgba(30,70,15,0.35)";
      g.fillRect(tx * 2, ty * 2 + 6, w * 2, 2); // shadow under the clump
      for (let b = 0; b < w; b++) {
        const bh = 2 + ((r() * 3) | 0);
        g.fillStyle = G_DARK;
        g.fillRect((tx + b) * 2, ty * 2 + 6 - bh * 2, 2, bh * 2);
        if (r() < 0.5) {
          g.fillStyle = G_TIP;
          g.fillRect((tx + b) * 2, ty * 2 + 6 - bh * 2, 2, 2);
        }
      }
    }
    // occasional pebble
    if (r() < 0.28) {
      const px2 = 4 + ((r() * 18) | 0) * 2, py2 = 4 + ((r() * 18) | 0) * 2;
      g.fillStyle = "#b8b8a8"; g.fillRect(px2, py2, 4, 4);
      g.fillStyle = "#8f8f7e"; g.fillRect(px2, py2 + 2, 4, 2);
    }
  }

  function paintFlower(g, seed) {
    paintGrass(g, seed * 7 + 3);
    const r = mulberry(seed * 31 + 11);
    const colors = ["#f5f2ec", "#f2c0d8", "#f0e060", "#b89ae8"];
    const n = 2 + ((r() * 2) | 0);
    for (let i = 0; i < n; i++) {
      const fx = (6 + r() * (TS - 16)) | 0, fy = (6 + r() * (TS - 16)) | 0;
      const col = colors[(r() * colors.length) | 0];
      g.fillStyle = "#3f7a2e";
      g.fillRect(fx + 2, fy + 5, 2, 5); // stem
      g.fillStyle = col;                // four petals
      g.fillRect(fx, fy + 2, 2, 2);
      g.fillRect(fx + 4, fy + 2, 2, 2);
      g.fillRect(fx + 2, fy, 2, 2);
      g.fillRect(fx + 2, fy + 4, 2, 2);
      g.fillStyle = "#f0a83c";          // center
      g.fillRect(fx + 2, fy + 2, 2, 2);
    }
  }

  function paintWater(g, phase) {
    const grad = g.createLinearGradient(0, 0, 0, TS);
    grad.addColorStop(0, "#4a9ad8");
    grad.addColorStop(1, "#2f72b8");
    g.fillStyle = grad;
    g.fillRect(0, 0, TS, TS);
    g.fillStyle = "rgba(150,210,240,0.55)"; // drifting wave highlights
    for (let i = 0; i < 3; i++) {
      const wy = (i * 17 + phase * 4) % TS;
      const wx = (i * 23 + phase * 6) % TS;
      g.fillRect(wx, wy, 10, 2);
      g.fillRect((wx + 24) % TS, (wy + 8) % TS, 6, 2);
    }
    g.fillStyle = "rgba(255,255,255,0.3)"; // sparkle
    g.fillRect((phase * 12) % TS, (phase * 7 + 20) % TS, 4, 2);
  }

  const GRASS_TILES = Array.from({ length: 8 }, (_, i) => makeCanvas(TS, TS, g => paintGrass(g, i + 1)));
  const FLOWER_TILES = Array.from({ length: 6 }, (_, i) => makeCanvas(TS, TS, g => paintFlower(g, i + 1)));
  const WATER_TILES = Array.from({ length: 4 }, (_, i) => makeCanvas(TS, TS, g => paintWater(g, i)));

  // A tree occupies its tile plus the tile above (tall canopy).
  // The canopy is a noise-jittered banded ellipse rendered cell by cell —
  // chunky pixel clusters with a dark outline and top-left light, like
  // Stardew's foliage, instead of smooth vector circles.
  const TREE_TILE = makeCanvas(TS, TS * 2, g => {
    g.fillStyle = "rgba(20,40,10,0.28)";
    g.beginPath(); g.ellipse(TS / 2, TS * 2 - 7, 19, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3e2a18"; g.fillRect(TS / 2 - 7, TS + 4, 14, TS - 12);
    g.fillStyle = "#6b4a2f"; g.fillRect(TS / 2 - 5, TS + 4, 10, TS - 14);
    g.fillStyle = "#54391f"; g.fillRect(TS / 2 - 5, TS + 4, 4, TS - 14);
    const cx = 11.5, cy = 10, rx = 11, ry = 9;
    for (let yy = 0; yy < 22; yy++) {
      for (let xx = 0; xx < 24; xx++) {
        const jit = (hash(xx * 7 + 13, yy * 11 + 5) - 0.5) * 0.22;
        const d = Math.hypot((xx - cx) / rx, (yy - cy) / ry) + jit;
        if (d > 1.04) continue;
        const light = ((xx - cx) / rx) * 0.35 + ((yy - cy) / ry) * 0.55;
        const v = d * 0.55 + light * 0.5;
        let col;
        if (d > 0.92) col = "#1e4218";
        else if (v < -0.25) col = "#8cd84e";
        else if (v < 0) col = "#6cc23e";
        else if (v < 0.25) col = "#4f9e30";
        else col = "#356f24";
        g.fillStyle = col;
        g.fillRect(xx * 2, yy * 2, 2, 2);
      }
    }
  });

  function tileAt(x, y) {
    if (x < 0 || y < 0 || x >= mapW || y >= mapH) return "t";
    return map.tiles[y][x];
  }

  function drawTile(x, y, camX, camY) {
    const ch = map.tiles[y][x];
    const sx = Math.round(x * TS - camX), sy = Math.round(y * TS - camY);
    const h = hash(x, y);

    if (ch === "w") {
      ctx.drawImage(WATER_TILES[(((tick / 16) | 0) + x) % 4], sx, sy);
      // foam where water meets land
      ctx.fillStyle = "rgba(225,242,250,0.7)";
      if (tileAt(x, y - 1) !== "w") ctx.fillRect(sx, sy, TS, 3);
      if (tileAt(x - 1, y) !== "w") ctx.fillRect(sx, sy, 3, TS);
      if (tileAt(x + 1, y) !== "w") ctx.fillRect(sx + TS - 3, sy, 3, TS);
      if (tileAt(x, y + 1) !== "w") ctx.fillRect(sx, sy + TS - 3, TS, 3);
      return;
    }

    // grass under everything else
    ctx.drawImage(GRASS_TILES[(h * 8) | 0], sx, sy);
    if (ch === "f") ctx.drawImage(FLOWER_TILES[(h * 6) | 0], sx, sy);

    if (ch === "p") {
      // golden dirt path with soft edges where it meets grass
      const isP = (xx, yy) => tileAt(xx, yy) === "p";
      const pad = 6;
      const l = isP(x - 1, y) ? 0 : pad, rr = isP(x + 1, y) ? 0 : pad;
      const tp = isP(x, y - 1) ? 0 : pad, bt = isP(x, y + 1) ? 0 : pad;
      ctx.fillStyle = "#a87f3e"; // dark rim
      ctx.fillRect(sx + Math.max(0, l - 2), sy + Math.max(0, tp - 2),
        TS - Math.max(0, l - 2) - Math.max(0, rr - 2),
        TS - Math.max(0, tp - 2) - Math.max(0, bt - 2));
      ctx.fillStyle = "#d9b35c"; // sand
      ctx.fillRect(sx + l, sy + tp, TS - l - rr, TS - tp - bt);
      for (let i = 0; i < 5; i++) { // speckles
        const hx = hash(x * 5 + i, y * 9 + i);
        ctx.fillStyle = hx < 0.5 ? "#c79a4e" : "#ecd084";
        ctx.fillRect(sx + 6 + ((hx * 631) | 0) % (TS - 16), sy + 6 + ((hx * 277) | 0) % (TS - 16), 2, 2);
      }
    }
  }

  function drawLabels(camX, camY) {
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.textAlign = "center";
    for (const e of entities) {
      const lx = e.x * TS - camX + TS / 2;
      const ly = e.y * TS - camY - (SPRITES[e.sprite].down.length * SCALE - TS) - 8;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText(e.name, lx + 1, ly + 1);
      ctx.fillStyle = "#fcf3df";
      ctx.fillText(e.name, lx, ly);
    }
  }

  function frame() {
    tick++;
    updatePlayer();
    updateDialog();

    // camera centered on player, clamped to map
    let camX = player.px + TS / 2 - VIEW_W / 2;
    let camY = player.py + TS / 2 - VIEW_H / 2;
    camX = Math.max(0, Math.min(camX, mapW * TS - VIEW_W));
    camY = Math.max(0, Math.min(camY, mapH * TS - VIEW_H));

    // tiles
    const x0 = Math.max(0, (camX / TS) | 0), x1 = Math.min(mapW - 1, ((camX + VIEW_W) / TS) | 0);
    const y0 = Math.max(0, (camY / TS) | 0), y1 = Math.min(mapH - 1, ((camY + VIEW_H) / TS) | 0);
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++)
        drawTile(x, y, camX, camY);

    // trees drawn after the ground so their canopies layer over it
    for (let y = y0; y <= Math.min(mapH - 1, y1 + 1); y++)
      for (let x = x0; x <= x1; x++)
        if (map.tiles[y][x] === "t")
          ctx.drawImage(TREE_TILE, Math.round(x * TS - camX), Math.round(y * TS - camY - TS));

    // entities + player, painter's order (lower on screen draws last)
    const drawables = entities.map(e => ({
      y: e.y * TS, fn: () => drawCharacter(e.sprite, "down", e.x * TS, e.y * TS, camX, camY, 0),
    }));
    drawables.push({
      y: player.py,
      fn: () => drawCharacter("dominique", player.facing, player.px, player.py, camX, camY, player.moving ? player.step : 0),
    });
    drawables.sort((a, b) => a.y - b.y);
    for (const d of drawables) d.fn();

    // butterflies
    for (const b of butterflies) {
      b.a += 0.03;
      b.x += Math.cos(b.a) * 0.7;
      b.y += Math.sin(b.a * 1.3) * 0.5;
      const flap = (tick / 6 | 0) % 2 === 0;
      ctx.fillStyle = b.hue;
      const bx = b.x - camX, by = b.y - camY;
      if (flap) {
        ctx.fillRect(bx - SCALE, by, SCALE, SCALE);
        ctx.fillRect(bx + SCALE, by, SCALE, SCALE);
      } else {
        ctx.fillRect(bx, by - SCALE, SCALE, SCALE);
      }
      ctx.fillRect(bx, by, SCALE, SCALE);
    }

    // warm afternoon light + soft vignette
    const grad = ctx.createLinearGradient(0, 0, VIEW_W, VIEW_H);
    grad.addColorStop(0, "rgba(255,214,140,0.10)");
    grad.addColorStop(1, "rgba(120,80,160,0.08)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    const vig = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H / 2.4, VIEW_W / 2, VIEW_H / 2, VIEW_H);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(10,5,30,0.28)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    drawLabels(camX, camY);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
