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

  const GRASS_A = "#7ab648", GRASS_B = "#6ca83e", GRASS_C = "#8cc456";
  const FLOWER_COLORS = ["#f0e060", "#e88aa8", "#f5f2ec", "#a88ae8"];

  function drawTile(x, y, camX, camY) {
    const ch = map.tiles[y][x];
    const sx = x * TS - camX, sy = y * TS - camY;
    const h = hash(x, y);

    // grass base everywhere (water gets painted over)
    ctx.fillStyle = h < 0.33 ? GRASS_A : h < 0.66 ? GRASS_B : GRASS_C;
    ctx.fillRect(sx, sy, TS, TS);
    // grass texture flecks
    ctx.fillStyle = "rgba(40,80,20,0.18)";
    if (h > 0.2) ctx.fillRect(sx + ((h * 13) | 0) % 14 * SCALE, sy + ((h * 7) | 0) % 14 * SCALE, SCALE, SCALE);
    if (h > 0.5) ctx.fillRect(sx + ((h * 29) | 0) % 14 * SCALE, sy + ((h * 17) | 0) % 14 * SCALE, SCALE, SCALE * 2);

    if (ch === "f") {
      // little flowers, color varies per tile
      const fc = FLOWER_COLORS[(h * 17 | 0) % FLOWER_COLORS.length];
      const fx = sx + (3 + ((h * 23) % 8)) * SCALE, fy = sy + (3 + ((h * 31) % 8)) * SCALE;
      ctx.fillStyle = fc;
      ctx.fillRect(fx - SCALE, fy, SCALE, SCALE);
      ctx.fillRect(fx + SCALE, fy, SCALE, SCALE);
      ctx.fillRect(fx, fy - SCALE, SCALE, SCALE);
      ctx.fillRect(fx, fy + SCALE, SCALE, SCALE);
      ctx.fillStyle = "#f0c040";
      ctx.fillRect(fx, fy, SCALE, SCALE);
      // second tiny flower
      ctx.fillStyle = FLOWER_COLORS[(h * 29 | 0) % FLOWER_COLORS.length];
      ctx.fillRect(sx + (10 + ((h * 41) % 4)) * SCALE, sy + (9 + ((h * 13) % 5)) * SCALE, SCALE, SCALE);
    }

    if (ch === "w") {
      const shimmer = Math.sin(tick / 30 + x * 1.7 + y * 2.3) * 0.5 + 0.5;
      ctx.fillStyle = "#3a78b8";
      ctx.fillRect(sx, sy, TS, TS);
      ctx.fillStyle = "rgba(120,180,230," + (0.25 + shimmer * 0.2) + ")";
      ctx.fillRect(sx + 2 * SCALE, sy + (3 + (shimmer * 3 | 0)) * SCALE, 5 * SCALE, SCALE);
      ctx.fillRect(sx + 9 * SCALE, sy + (9 - (shimmer * 3 | 0)) * SCALE, 4 * SCALE, SCALE);
    }

    if (ch === "t") {
      // bushy tree: trunk + layered canopy
      ctx.fillStyle = "#6b4a2f";
      ctx.fillRect(sx + 6 * SCALE, sy + 10 * SCALE, 4 * SCALE, 5 * SCALE);
      ctx.fillStyle = "#3f7a2e";
      ctx.beginPath();
      ctx.arc(sx + TS / 2, sy + 6 * SCALE, 7 * SCALE, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4f9438";
      ctx.beginPath();
      ctx.arc(sx + TS / 2 - 2 * SCALE, sy + 5 * SCALE, 5 * SCALE, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#65aa48";
      ctx.beginPath();
      ctx.arc(sx + TS / 2 + 2 * SCALE, sy + 4 * SCALE, 4 * SCALE, 0, Math.PI * 2);
      ctx.fill();
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
