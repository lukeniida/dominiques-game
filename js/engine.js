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

  const G_BASE = "#67b234", G_DARK = "#4f9426", G_DARK2 = "#458420",
        G_LIGHT = "#83c84a", G_DOT = "#a0dc64";

  function paintGrass(g, seed) {
    const r = mulberry(seed * 1013 + 7);
    g.fillStyle = G_BASE;
    g.fillRect(0, 0, TS, TS);
    for (let i = 0; i < 30; i++) { // individual grass blades, 2px wide
      const bx = (r() * TS) | 0, by = (r() * TS) | 0, bh = 3 + ((r() * 5) | 0);
      const p = r();
      g.fillStyle = p < 0.45 ? G_DARK : p < 0.65 ? G_DARK2 : G_LIGHT;
      g.fillRect(bx, by, 2, bh);
    }
    for (let i = 0; i < 8; i++) {
      g.fillStyle = G_DOT;
      g.fillRect((r() * TS) | 0, (r() * TS) | 0, 2, 2);
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
  const TREE_TILE = makeCanvas(TS, TS * 2, g => {
    g.fillStyle = "rgba(20,40,10,0.25)";
    g.beginPath(); g.ellipse(TS / 2, TS * 2 - 8, 18, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#6b4a2f"; g.fillRect(TS / 2 - 5, TS + 8, 10, TS - 16);
    g.fillStyle = "#543a24"; g.fillRect(TS / 2 - 5, TS + 8, 4, TS - 16);
    g.fillStyle = "#2e5e22"; g.beginPath(); g.arc(TS / 2, TS - 6, 22, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3f7a2e"; g.beginPath(); g.arc(TS / 2 - 4, TS - 10, 17, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#569a3c"; g.beginPath(); g.arc(TS / 2 + 5, TS - 13, 13, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#6fb84e";
    [[-8, -14], [2, -20], [9, -9], [-2, -6]].forEach(([ox, oy]) => {
      g.fillRect(TS / 2 + ox, TS + oy, 4, 4);
    });
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
