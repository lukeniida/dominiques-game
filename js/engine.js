// ============================================================
// engine.js — movement, camera, maps, items, events, drawing.
// Pokémon bones, Stardew warmth.
// ============================================================

(() => {
  const TILE = 16, SCALE = 3, TS = TILE * SCALE;
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const VIEW_W = canvas.width, VIEW_H = canvas.height;
  const SOLID = new Set(["t", "w", "V", "M", "X", "#", "K"]);

  function hash(x, y) {
    let h = (x * 374761393 + y * 668265263) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  function makeCanvas(w, h, fn) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    fn(c.getContext("2d"));
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

  // ════════════════════ pre-rendered terrain ════════════════════
  const G_BASE = "#64b22d", G_DARK = "#3f8a1e", G_TIP = "#9ad852";

  function paintGrass(g, seed) {
    const r = mulberry(seed * 1013 + 7);
    g.fillStyle = G_BASE;
    g.fillRect(0, 0, TS, TS);
    for (let yy = 0; yy < 24; yy++)
      for (let xx = 0; xx < 24; xx++) {
        const n = r();
        if (n < 0.05) { g.fillStyle = "#57a527"; g.fillRect(xx * 2, yy * 2, 2, 2); }
        else if (n > 0.965) { g.fillStyle = "#74c23a"; g.fillRect(xx * 2, yy * 2, 2, 2); }
      }
    const tufts = 1 + ((r() * 3) | 0);
    for (let t = 0; t < tufts; t++) {
      const tx = 2 + ((r() * 15) | 0), ty = 4 + ((r() * 15) | 0);
      const w = 4 + ((r() * 3) | 0);
      g.fillStyle = "rgba(30,70,15,0.35)";
      g.fillRect(tx * 2, ty * 2 + 6, w * 2, 2);
      for (let b = 0; b < w; b++) {
        const bh = 2 + ((r() * 3) | 0);
        g.fillStyle = G_DARK;
        g.fillRect((tx + b) * 2, ty * 2 + 6 - bh * 2, 2, bh * 2);
        if (r() < 0.5) { g.fillStyle = G_TIP; g.fillRect((tx + b) * 2, ty * 2 + 6 - bh * 2, 2, 2); }
      }
    }
    if (r() < 0.28) {
      const px2 = 4 + ((r() * 18) | 0) * 2, py2 = 4 + ((r() * 18) | 0) * 2;
      g.fillStyle = "#b8b8a8"; g.fillRect(px2, py2, 4, 4);
      g.fillStyle = "#8f8f7e"; g.fillRect(px2, py2 + 2, 4, 2);
    }
  }

  function paintTallGrass(g, seed) {
    paintGrass(g, seed * 3 + 1);
    const r = mulberry(seed * 77 + 5);
    for (let i = 0; i < 26; i++) {
      const bx = 2 + ((r() * 21) | 0), by = 8 + ((r() * 14) | 0);
      const bh = 5 + ((r() * 4) | 0);
      g.fillStyle = r() < 0.6 ? "#2f7a16" : "#3f8a1e";
      g.fillRect(bx * 2, by * 2 - bh * 2, 2, bh * 2);
      g.fillStyle = "#8cd64a";
      if (r() < 0.6) g.fillRect(bx * 2, by * 2 - bh * 2, 2, 2);
    }
  }

  function paintFlower(g, seed) {
    paintGrass(g, seed * 7 + 3);
    const r = mulberry(seed * 31 + 11);
    const colors = ["#f5f2ec", "#f2c0d8", "#f0e060", "#b89ae8"];
    const n = 2 + ((r() * 2) | 0);
    for (let i = 0; i < n; i++) {
      const fx = (6 + r() * (TS - 16)) | 0, fy = (6 + r() * (TS - 16)) | 0;
      g.fillStyle = "#3f7a2e"; g.fillRect(fx + 2, fy + 5, 2, 5);
      g.fillStyle = colors[(r() * colors.length) | 0];
      g.fillRect(fx, fy + 2, 2, 2); g.fillRect(fx + 4, fy + 2, 2, 2);
      g.fillRect(fx + 2, fy, 2, 2); g.fillRect(fx + 2, fy + 4, 2, 2);
      g.fillStyle = "#f0a83c"; g.fillRect(fx + 2, fy + 2, 2, 2);
    }
  }

  function paintWater(g, phase) {
    const grad = g.createLinearGradient(0, 0, 0, TS);
    grad.addColorStop(0, "#4a9ad8"); grad.addColorStop(1, "#2f72b8");
    g.fillStyle = grad; g.fillRect(0, 0, TS, TS);
    g.fillStyle = "rgba(150,210,240,0.55)";
    for (let i = 0; i < 3; i++) {
      const wy = (i * 17 + phase * 4) % TS, wx = (i * 23 + phase * 6) % TS;
      g.fillRect(wx, wy, 10, 2);
      g.fillRect((wx + 24) % TS, (wy + 8) % TS, 6, 2);
    }
    g.fillStyle = "rgba(255,255,255,0.3)";
    g.fillRect((phase * 12) % TS, (phase * 7 + 20) % TS, 4, 2);
  }

  function paintWood(g, seed, dark) {
    const r = mulberry(seed * 419 + 13);
    const tones = dark
      ? ["#4c4456", "#484052", "#514a5c"]
      : ["#c89a62", "#c2945c", "#cfa26a"];
    const line = dark ? "#38323f" : "#a87f4e";
    const grain = dark ? "#564e62" : "#d8ac76";
    // long horizontal planks, tone varies per plank
    for (let row = 0; row < 4; row++) {
      g.fillStyle = tones[(r() * 3) | 0];
      g.fillRect(0, row * 12, TS, 12);
      g.fillStyle = line;
      g.fillRect(0, row * 12 + 11, TS, 1); // thin gap between planks
      if (r() < 0.7) { // sparse joints
        const seam = ((r() * 20) | 0) * 2 + 4;
        g.fillRect(seam, row * 12, 1, 12);
      }
      // grain streaks
      g.fillStyle = grain;
      const gx = ((r() * 16) | 0) * 2;
      g.fillRect(gx, row * 12 + 3 + ((r() * 3) | 0) * 2, 8 + ((r() * 5) | 0) * 2, 1);
    }
  }

  const GRASS_TILES = Array.from({ length: 8 }, (_, i) => makeCanvas(TS, TS, g => paintGrass(g, i + 1)));
  const TALL_TILES = Array.from({ length: 4 }, (_, i) => makeCanvas(TS, TS, g => paintTallGrass(g, i + 1)));
  const FLOWER_TILES = Array.from({ length: 6 }, (_, i) => makeCanvas(TS, TS, g => paintFlower(g, i + 1)));
  const WATER_TILES = Array.from({ length: 4 }, (_, i) => makeCanvas(TS, TS, g => paintWater(g, i)));
  const WOOD_TILES = Array.from({ length: 4 }, (_, i) => makeCanvas(TS, TS, g => paintWood(g, i + 1, false)));
  const DARK_TILES = Array.from({ length: 4 }, (_, i) => makeCanvas(TS, TS, g => paintWood(g, i + 1, true)));

  const TREE_TILE = makeCanvas(TS, TS * 2, g => {
    g.fillStyle = "rgba(20,40,10,0.28)";
    g.beginPath(); g.ellipse(TS / 2, TS * 2 - 7, 19, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3e2a18"; g.fillRect(TS / 2 - 7, TS + 4, 14, TS - 12);
    g.fillStyle = "#6b4a2f"; g.fillRect(TS / 2 - 5, TS + 4, 10, TS - 14);
    g.fillStyle = "#54391f"; g.fillRect(TS / 2 - 5, TS + 4, 4, TS - 14);
    const cx = 11.5, cy = 10, rx = 11, ry = 9;
    for (let yy = 0; yy < 22; yy++)
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
  });

  // ════════════════════ game state ════════════════════
  const ITEMS = [
    { id: "lumpy",    label: "Lumpy",    sprite: "lumpy" },
    { id: "notebook", label: "Notebook", sprite: "notebook" },
    { id: "heart",    label: "Heart",    sprite: "kintsugiheart" },
    { id: "door",     label: "Door",     sprite: "lockedphoto" },
    { id: "diploma",  label: "Doctorate", sprite: "diploma" },
  ];

  const state = { taken: new Set(), flags: {} };
  let map = null, mapName = "", mapW = 0, mapH = 0;
  let entities = [];
  let dialog = null, started = false, tick = 0;
  let shake = 0, flashRed = 0;
  let runner = null; // the Dad sprint
  let butterflies = [];

  const player = { x: 0, y: 0, px: 0, py: 0, facing: "down", moving: false, prog: 0, step: 0, animTick: 0, hasLumpy: false };
  const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  function loadMap(name, x, y, facing) {
    map = MAPS[name]; mapName = name;
    mapW = map.tiles[0].length; mapH = map.tiles.length;
    entities = map.entities
      .filter(e => !(e.itemId && state.taken.has(e.itemId)))
      .filter(e => !(e.gag === "pb" && false))
      .map(e => ({ ...e, moving: false, prog: 0, px: e.x * TS, py: e.y * TS, home: { x: e.x, y: e.y }, timer: tick + 60 + ((hash(e.x, e.y) * 200) | 0), dir: "down" }));
    if (state.flags.pbDone && name === "exterior") {
      entities.push({
        x: 26, y: 21, sprite: "dad", name: "Dad", label: true, wander: 1,
        moving: false, prog: 0, px: 26 * TS, py: 21 * TS, home: { x: 26, y: 21 }, timer: tick + 100, dir: "down",
        lines: ["I'm watching the table.", "(He is doing a very slow patrol jog\naround it.)"],
      });
    }
    player.x = x; player.y = y;
    player.px = x * TS; player.py = y * TS;
    player.facing = facing || "down";
    player.moving = false; player.prog = 0;
    runner = null;
    butterflies = [];
    if (map.theme === "exterior") {
      for (let i = 0; i < 7; i++) {
        butterflies.push({
          x: (2 + Math.random() * (mapW - 8)) * TS,
          y: (2 + Math.random() * (mapH - 4)) * TS,
          a: Math.random() * Math.PI * 2,
          hue: Math.random() < 0.5 ? "#f5f2ec" : "#f0a64a",
        });
      }
    }
  }

  // ════════════════════ input ════════════════════
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
      else if (!runner) tryExamine();
    }
  });
  window.addEventListener("keyup", (ev) => { if (DIRS[ev.key]) held.delete(DIRS[ev.key]); });

  // ════════════════════ dialog ════════════════════
  const dlgBox = document.getElementById("dialog");
  const dlgName = document.getElementById("dialog-name");
  const dlgText = document.getElementById("dialog-text");

  function openDialog(name, lines, onClose) {
    dialog = { name, lines, idx: 0, shown: 0, onClose };
    dlgName.textContent = name;
    dlgText.textContent = "";
    dlgBox.classList.remove("hidden");
  }
  function advanceDialog() {
    const full = dialog.lines[dialog.idx];
    if (dialog.shown < full.length) { dialog.shown = full.length; return; }
    dialog.idx++;
    if (dialog.idx >= dialog.lines.length) {
      const cb = dialog.onClose;
      dialog = null;
      dlgBox.classList.add("hidden");
      if (cb) cb();
    } else dialog.shown = 0;
  }
  function updateDialog() {
    if (!dialog) return;
    const full = dialog.lines[dialog.idx];
    if (dialog.shown < full.length) dialog.shown = Math.min(full.length, dialog.shown + 2);
    dlgText.textContent = full.slice(0, dialog.shown);
  }

  // ════════════════════ movement, examine, events ════════════════════
  function tileAt(x, y) {
    if (x < 0 || y < 0 || x >= mapW || y >= mapH) return "t";
    return map.tiles[y][x];
  }
  function entityAt(x, y) { return entities.find(e => e.x === x && e.y === y); }
  function isWarp(x, y) { return map.warps && map.warps.some(w => w.x === x && w.y === y); }

  function walkable(x, y, forNpc) {
    if (x < 0 || y < 0 || x >= mapW || y >= mapH) return false;
    if (SOLID.has(tileAt(x, y))) return false;
    if (entityAt(x, y)) return false;
    if (forNpc && (isWarp(x, y) || (x === player.x && y === player.y))) return false;
    return true;
  }

  function tryExamine() {
    const [dx, dy] = DELTA[player.facing];
    const e = entityAt(player.x + dx, player.y + dy);
    if (!e) return;

    if (e.portal) { portalExamine(); return; }

    if (e.gag === "pb") {
      if (!state.flags.pbDone) {
        openDialog(e.name, e.lines, startPbGag);
      } else {
        openDialog(e.name, e.linesAfter);
      }
      return;
    }

    if (e.itemId && !state.taken.has(e.itemId)) {
      openDialog(e.name, e.lines, () => {
        state.taken.add(e.itemId);
        entities = entities.filter(x => x !== e);
        if (e.itemId === "lumpy") player.hasLumpy = true;
      });
      return;
    }

    openDialog(e.name, e.lines);
  }

  function startPbGag() {
    shake = 50; flashRed = 50;
    const table = entities.find(e => e.gag === "pb");
    runner = {
      sprite: "dad",
      px: Math.max(0, (table.x - 8)) * TS, py: table.y * TS,
      targetPx: (table.x - 1) * TS,
      done: false,
    };
  }

  function updateRunner() {
    if (!runner || runner.done) return;
    runner.px += 4.5; // a full sprint. nobody knew he had it.
    if (runner.px >= runner.targetPx) {
      runner.px = runner.targetPx;
      runner.done = true;
      openDialog("Dad", [
        "Why? Why? Why? WHY???",
        "(He sprinted here from the couch.\nYou didn't know he could move like that.\nNobody did.)",
        "Dominique, age 9: 'DAD. They can't\neven LOOK at peanut butter!'",
        "(Everyone laughed for a decade.)",
      ], () => {
        state.flags.pbDone = true;
        const t = runner; runner = null;
        entities.push({
          x: Math.round(t.px / TS), y: Math.round(t.py / TS),
          sprite: "dad", name: "Dad", label: true, wander: 1,
          moving: false, prog: 0, px: t.px, py: t.py,
          home: { x: Math.round(t.px / TS), y: Math.round(t.py / TS) }, timer: tick + 80, dir: "down",
          lines: ["I'm watching the table.", "(He is doing a very slow patrol jog\naround it.)"],
        });
      });
    }
  }

  function portalExamine() {
    const missing = ITEMS.filter(i => !state.taken.has(i.id));
    if (missing.length > 0) {
      openDialog("The Portal", [
        "A door of light stands at the cliff's\nedge, humming over the lake.",
        "It is waiting for " + missing.length + " more treasure" + (missing.length > 1 ? "s" : "") + ":\n" + missing.map(m => "✦ " + m.label).join("   "),
        "(Five treasures. One per family member.\nLook for the sparkle.)",
      ]);
    } else {
      openDialog("The Portal", [
        "The portal recognizes what you carry:",
        "a gecko. a poem. a mended heart.\na locked door. a doctorate.",
        "In other words: your family.",
        "It opens.",
      ], finale);
    }
  }

  function finale() {
    const f = document.getElementById("finale");
    f.classList.remove("hidden");
    const confetti = document.getElementById("confetti");
    const colors = ["#f0a83c", "#e85a6a", "#5ac8c8", "#8a5ae8", "#7ab648", "#f5d058"];
    for (let i = 0; i < 90; i++) {
      const s = document.createElement("span");
      s.className = "confetti-bit";
      s.style.left = Math.random() * 100 + "%";
      s.style.background = colors[(Math.random() * colors.length) | 0];
      s.style.animationDelay = Math.random() * 4 + "s";
      s.style.animationDuration = 3.5 + Math.random() * 3 + "s";
      confetti.appendChild(s);
    }
  }

  function updatePlayer() {
    if (dialog || !started || runner) return;
    if (player.moving) {
      player.prog += 0.095;
      player.animTick++;
      if (player.animTick % 8 === 0) player.step = 1 - player.step;
      if (player.prog >= 1) {
        player.prog = 0; player.moving = false;
        player.px = player.x * TS; player.py = player.y * TS;
        const w = map.warps && map.warps.find(w => w.x === player.x && w.y === player.y);
        if (w) { loadMap(w.to, w.tx, w.ty, w.facing); return; }
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
          const nx = player.x + dx, ny = player.y + dy;
          if (!SOLID.has(tileAt(nx, ny)) && !entityAt(nx, ny) && nx >= 0 && ny >= 0 && nx < mapW && ny < mapH) {
            player.x = nx; player.y = ny;
            player.moving = true; player.prog = 0;
          }
          break;
        }
      }
    }
  }

  function updateNpcs() {
    for (const e of entities) {
      if (!e.wander) continue;
      if (e.moving) {
        e.prog += 0.045;
        if (e.prog >= 1) { e.prog = 0; e.moving = false; e.px = e.x * TS; e.py = e.y * TS; }
        else {
          const [dx, dy] = DELTA[e.dir];
          e.px = (e.x - dx * (1 - e.prog)) * TS;
          e.py = (e.y - dy * (1 - e.prog)) * TS;
        }
        continue;
      }
      if (tick < e.timer || dialog) continue;
      e.timer = tick + 90 + ((hash(e.x * 3 + tick, e.y * 7) * 150) | 0);
      const dirs = ["up", "down", "left", "right"];
      const dir = dirs[(hash(tick, e.x + e.y) * 4) | 0];
      const [dx, dy] = DELTA[dir];
      const nx = e.x + dx, ny = e.y + dy;
      if (Math.abs(nx - e.home.x) > e.wander || Math.abs(ny - e.home.y) > e.wander) continue;
      if (!walkable(nx, ny, true)) continue;
      e.x = nx; e.y = ny; e.dir = dir;
      e.moving = true; e.prog = 0;
    }
  }

  // ════════════════════ drawing ════════════════════
  function drawSpritePixels(sprite, grid, dx, dy, mirror) {
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

  function drawCharacter(spriteName, facing, px, py, camX, camY, stepFrame, noShadow) {
    const { s, grid, mirror } = spriteGrid(spriteName, facing);
    let rows = grid;
    if (stepFrame === 1 && s.feetAlt && s.feetRow != null && facing !== "left" && facing !== "right") {
      rows = grid.slice();
      rows[s.feetRow] = s.feetAlt;
    }
    const wPx = grid[0].length * SCALE, hPx = grid.length * SCALE;
    const dx = Math.round(px - camX + (TS - wPx) / 2);
    const dy = Math.round(py - camY + TS - hPx + 2 * SCALE);
    if (!noShadow) {
      ctx.fillStyle = "rgba(20,30,15,0.25)";
      ctx.beginPath();
      ctx.ellipse(Math.round(px - camX) + TS / 2, Math.round(py - camY) + TS - 4, Math.min(20, wPx / 2.4), 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    drawSpritePixels(s, rows, dx, dy, mirror);
    return { dx, dy, wPx, hPx };
  }

  function drawWallTile(ch, sx, sy, x, y) {
    if (ch === "#") {
      ctx.fillStyle = "#d8c8a8"; ctx.fillRect(sx, sy, TS, TS);
      ctx.fillStyle = "#c8b696"; ctx.fillRect(sx, sy, TS, 4);
      ctx.fillStyle = "#8a653a"; ctx.fillRect(sx, sy + TS - 10, TS, 10);
      ctx.fillStyle = "#7a5530"; ctx.fillRect(sx, sy + TS - 10, TS, 2);
    } else if (ch === "K") {
      ctx.fillStyle = "#2e2e3a"; ctx.fillRect(sx, sy, TS, TS);
      ctx.fillStyle = "#262630"; ctx.fillRect(sx, sy + TS - 10, TS, 10);
      ctx.fillStyle = "#3a3a4a"; ctx.fillRect(sx, sy, TS, 3);
    } else if (ch === "M") {
      ctx.fillStyle = "#b8917a"; ctx.fillRect(sx, sy, TS, TS);
      ctx.fillStyle = "#9a7560";
      for (let r = 0; r < 4; r++) {
        ctx.fillRect(sx, sy + r * 12 + 10, TS, 2);
        ctx.fillRect(sx + ((r % 2) * 24 + 10), sy + r * 12, 2, 12);
      }
    } else if (ch === "X") {
      ctx.fillStyle = "#b8917a"; ctx.fillRect(sx, sy, TS, TS);
      ctx.fillStyle = "#f0ece0"; ctx.fillRect(sx + 6, sy + 6, TS - 12, TS - 14);
      const glow = mapName === "exterior" ? "#f5d878" : "#a8d8f0";
      ctx.fillStyle = glow; ctx.fillRect(sx + 9, sy + 9, TS - 18, TS - 20);
      ctx.fillStyle = "#f0ece0";
      ctx.fillRect(sx + 9, sy + TS / 2 - 3, TS - 18, 2);
      ctx.fillRect(sx + TS / 2 - 1, sy + 9, 2, TS - 20);
    } else if (ch === "V") {
      ctx.fillStyle = "#8a4a3a"; ctx.fillRect(sx, sy, TS, TS);
      ctx.fillStyle = "#6e3a2c";
      for (let r = 0; r < 4; r++) {
        ctx.fillRect(sx, sy + r * 12 + 10, TS, 2);
        ctx.fillRect(sx + ((r % 2) * 20 + 14), sy + r * 12, 2, 12);
      }
      ctx.fillStyle = "#a05a48"; ctx.fillRect(sx, sy, TS, 2);
    }
  }

  function drawTile(x, y, camX, camY) {
    const ch = tileAt(x, y);
    const sx = Math.round(x * TS - camX), sy = Math.round(y * TS - camY);
    const h = hash(x, y);

    if (ch === "w") {
      ctx.drawImage(WATER_TILES[(((tick / 16) | 0) + x) % 4], sx, sy);
      ctx.fillStyle = "rgba(225,242,250,0.6)";
      if (tileAt(x, y - 1) !== "w") ctx.fillRect(sx, sy, TS, 3);
      if (tileAt(x - 1, y) !== "w") ctx.fillRect(sx, sy, 3, TS);
      if (tileAt(x + 1, y) !== "w") ctx.fillRect(sx + TS - 3, sy, 3, TS);
      if (tileAt(x, y + 1) !== "w") ctx.fillRect(sx, sy + TS - 3, TS, 3);
      return;
    }
    if ("#KMXV".includes(ch)) { drawWallTile(ch, sx, sy, x, y); return; }

    if (ch === "r" || ch === "u" || ch === "k" || (ch === "d" && map.theme !== "exterior")) {
      const woodSet = (map.theme === "dojo" || ch === "k") ? DARK_TILES : WOOD_TILES;
      ctx.drawImage(woodSet[(h * 4) | 0], sx, sy);
      if (ch === "u") {
        // one continuous rug: full tile fill, border only at outer edges
        ctx.fillStyle = "#b8453e";
        ctx.fillRect(sx, sy, TS, TS);
        const isU = (xx, yy) => tileAt(xx, yy) === "u";
        ctx.fillStyle = "#8a2f2a";
        if (!isU(x, y - 1)) ctx.fillRect(sx, sy, TS, 5);
        if (!isU(x, y + 1)) ctx.fillRect(sx, sy + TS - 5, TS, 5);
        if (!isU(x - 1, y)) ctx.fillRect(sx, sy, 5, TS);
        if (!isU(x + 1, y)) ctx.fillRect(sx + TS - 5, sy, 5, TS);
        ctx.fillStyle = "#c8645c"; // subtle weave texture
        if (hash(x * 3, y * 5) < 0.6) ctx.fillRect(sx + 14, sy + 22, 8, 2);
        if (hash(x * 7, y * 3) < 0.6) ctx.fillRect(sx + 30, sy + 10, 8, 2);
        ctx.fillStyle = "#e8c858";
        if (hash(x * 3, y * 5) > 0.7) ctx.fillRect(sx + 22, sy + 16, 4, 4);
      }
      if (ch === "d") {
        ctx.fillStyle = "#6b4a2f"; ctx.fillRect(sx + 2, sy, TS - 4, TS);
        ctx.fillStyle = "#3a2415"; ctx.fillRect(sx + 6, sy, TS - 12, TS - 4);
        ctx.fillStyle = "#e8c858"; ctx.fillRect(sx + TS - 14, sy + TS / 2 - 2, 3, 3);
      }
      return;
    }

    if (ch === "D") {
      drawWallTile("M", sx, sy, x, y);
      ctx.fillStyle = "#54391f"; ctx.fillRect(sx + 2, sy, TS - 4, TS);
      ctx.fillStyle = "#3a2415"; ctx.fillRect(sx + 6, sy + 4, TS - 12, TS - 4);
      ctx.fillStyle = "#e8c858"; ctx.fillRect(sx + TS - 14, sy + TS / 2, 3, 3);
      return;
    }

    // outdoor ground
    ctx.drawImage(GRASS_TILES[(h * 8) | 0], sx, sy);
    if (ch === "f") ctx.drawImage(FLOWER_TILES[(h * 6) | 0], sx, sy);
    if (ch === "h") ctx.drawImage(TALL_TILES[(h * 4) | 0], sx, sy);

    if (ch === "p") {
      const isP = (xx, yy) => tileAt(xx, yy) === "p";
      const pad = 6;
      const l = isP(x - 1, y) ? 0 : pad, rr = isP(x + 1, y) ? 0 : pad;
      const tp = isP(x, y - 1) ? 0 : pad, bt = isP(x, y + 1) ? 0 : pad;
      ctx.fillStyle = "#a87f3e";
      ctx.fillRect(sx + Math.max(0, l - 2), sy + Math.max(0, tp - 2),
        TS - Math.max(0, l - 2) - Math.max(0, rr - 2),
        TS - Math.max(0, tp - 2) - Math.max(0, bt - 2));
      ctx.fillStyle = "#d9b35c";
      ctx.fillRect(sx + l, sy + tp, TS - l - rr, TS - tp - bt);
      for (let i = 0; i < 5; i++) {
        const hx = hash(x * 5 + i, y * 9 + i);
        ctx.fillStyle = hx < 0.5 ? "#c79a4e" : "#ecd084";
        ctx.fillRect(sx + 6 + ((hx * 631) | 0) % (TS - 16), sy + 6 + ((hx * 277) | 0) % (TS - 16), 2, 2);
      }
    }
  }

  function drawSparkle(px, py, camX, camY, seed) {
    const t = tick / 8;
    for (let i = 0; i < 3; i++) {
      const a = t * 0.6 + i * 2.1 + seed;
      const r = 14 + Math.sin(t + i) * 6;
      const x = px - camX + TS / 2 + Math.cos(a) * r;
      const y = py - camY + TS / 2 - 10 + Math.sin(a) * r * 0.6;
      const big = ((tick / 10) | 0 + i) % 3 === 0;
      ctx.fillStyle = i % 2 ? "#fff8d8" : "#ffe87a";
      ctx.fillRect(x, y, big ? 4 : 2, big ? 4 : 2);
      if (big) {
        ctx.fillRect(x - 2, y + 1, 2, 2);
        ctx.fillRect(x + 4, y + 1, 2, 2);
      }
    }
  }

  function drawHud() {
    if (!started) return;
    const pad = 10, slot = 44;
    for (let i = 0; i < ITEMS.length; i++) {
      const x = pad + i * (slot + 6), y = pad;
      ctx.fillStyle = "rgba(20,15,30,0.55)";
      ctx.beginPath();
      ctx.roundRect(x, y, slot, slot, 8);
      ctx.fill();
      ctx.strokeStyle = "rgba(252,243,223,0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
      const it = ITEMS[i];
      if (state.taken.has(it.id)) {
        const s = SPRITES[it.sprite];
        const g = s.down;
        const cell = Math.min(2, (slot - 8) / g[0].length, (slot - 8) / g.length);
        const ox = x + (slot - g[0].length * cell) / 2;
        const oy = y + (slot - g.length * cell) / 2;
        for (let r = 0; r < g.length; r++)
          for (let c = 0; c < g[r].length; c++) {
            const chh = g[r][c];
            if (chh === ".") continue;
            ctx.fillStyle = s.legend[chh];
            ctx.fillRect(ox + c * cell, oy + r * cell, cell, cell);
          }
      } else {
        ctx.fillStyle = "rgba(252,243,223,0.35)";
        ctx.font = "bold 20px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText("?", x + slot / 2, y + slot / 2 + 7);
      }
    }
  }

  function drawLabels(camX, camY) {
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.textAlign = "center";
    for (const e of entities) {
      if (!e.label) continue;
      const g = SPRITES[e.sprite].down;
      const lx = e.px - camX + TS / 2;
      const ly = e.py - camY - (g.length * SCALE - TS) - 8;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText(e.name, lx + 1, ly + 1);
      ctx.fillStyle = "#fcf3df";
      ctx.fillText(e.name, lx, ly);
    }
  }

  function lightPass() {
    if (map.theme === "exterior") {
      const grad = ctx.createLinearGradient(0, 0, VIEW_W, VIEW_H);
      grad.addColorStop(0, "rgba(255,214,140,0.10)");
      grad.addColorStop(1, "rgba(200,100,80,0.12)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    } else if (map.theme === "lukeroom") {
      // sunbeams from the wall of windows
      for (let i = 0; i < 4; i++) {
        const bx = 120 + i * 180;
        const grad = ctx.createLinearGradient(bx, 0, bx + 140, VIEW_H);
        grad.addColorStop(0, "rgba(255,236,170,0.16)");
        grad.addColorStop(1, "rgba(255,236,170,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(bx, 0); ctx.lineTo(bx + 70, 0);
        ctx.lineTo(bx + 210, VIEW_H); ctx.lineTo(bx + 80, VIEW_H);
        ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = "rgba(255,225,150,0.06)";
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    } else if (map.theme === "dojo") {
      ctx.fillStyle = "rgba(8,8,38,0.32)";
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    } else {
      ctx.fillStyle = "rgba(255,220,160,0.07)";
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
    const vig = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H / 2.4, VIEW_W / 2, VIEW_H / 2, VIEW_H);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, map.theme === "dojo" ? "rgba(5,5,20,0.5)" : "rgba(10,5,30,0.28)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  function frame() {
    tick++;
    updatePlayer();
    updateNpcs();
    updateRunner();
    updateDialog();

    // greeting, once, shortly after the world appears
    if (started && mapName === "exterior" && !state.flags.greeted && tick > 40 && !dialog) {
      state.flags.greeted = true;
      openDialog("Luke", [
        "DOM. You made it. Welcome to my house.",
        "Okay — technically I haven't bought it\nyet. But this is a 1:1 preview of the\nmansion I'm going to own on Lake Michigan.",
        "Everyone already lives here. Go say hi.",
        "Oh — and FIVE things in this world\nSPARKLE. Find all five, then meet me at\nthe portal on the cliff.",
        "Go on. Explore. Touch stuff.",
        "(Not the peanut butter table.)",
      ]);
    }

    // camera (centers small maps)
    const mapPxW = mapW * TS, mapPxH = mapH * TS;
    let camX = player.px + TS / 2 - VIEW_W / 2;
    let camY = player.py + TS / 2 - VIEW_H / 2;
    camX = mapPxW <= VIEW_W ? (mapPxW - VIEW_W) / 2 : Math.max(0, Math.min(camX, mapPxW - VIEW_W));
    camY = mapPxH <= VIEW_H ? (mapPxH - VIEW_H) / 2 : Math.max(0, Math.min(camY, mapPxH - VIEW_H));

    ctx.save();
    if (shake > 0) {
      shake--;
      ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    }

    // void behind small maps
    ctx.fillStyle = "#0d0a14";
    ctx.fillRect(-20, -20, VIEW_W + 40, VIEW_H + 40);

    const x0 = Math.max(0, (camX / TS) | 0), x1 = Math.min(mapW - 1, ((camX + VIEW_W) / TS) | 0);
    const y0 = Math.max(0, (camY / TS) | 0), y1 = Math.min(mapH - 1, ((camY + VIEW_H) / TS) | 0);
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++)
        drawTile(x, y, camX, camY);
    for (let y = y0; y <= Math.min(mapH - 1, y1 + 1); y++)
      for (let x = x0; x <= x1; x++)
        if (tileAt(x, y) === "t")
          ctx.drawImage(TREE_TILE, Math.round(x * TS - camX), Math.round(y * TS - camY - TS));

    // portal glow
    const portalE = entities.find(e => e.glow);
    if (portalE) {
      const pulse = 0.25 + Math.sin(tick / 20) * 0.1;
      const gx = portalE.px - camX + TS / 2, gy = portalE.py - camY + TS / 2 - 10;
      const grad = ctx.createRadialGradient(gx, gy, 4, gx, gy, 70);
      grad.addColorStop(0, "rgba(180,140,255," + pulse + ")");
      grad.addColorStop(1, "rgba(180,140,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(gx - 70, gy - 70, 140, 140);
    }

    // entities + player + runner, painter's order
    const drawables = entities.map(e => ({
      y: e.py, fn: () => {
        drawCharacter(e.sprite, e.dir || "down", e.px, e.py, camX, camY, 0);
        if ((e.itemId && !state.taken.has(e.itemId)) || e.portal) drawSparkle(e.px, e.py, camX, camY, e.x * 3);
      },
    }));
    drawables.push({
      y: player.py,
      fn: () => {
        const pos = drawCharacter("dominique", player.facing, player.px, player.py, camX, camY, player.moving ? player.step : 0);
        if (player.hasLumpy && player.facing !== "up") {
          const lg = SPRITES.lumpy;
          for (let r = 0; r < lg.down.length; r++)
            for (let c = 0; c < lg.down[r].length; c++) {
              const chh = lg.down[r][c];
              if (chh === ".") continue;
              ctx.fillStyle = lg.legend[chh];
              ctx.fillRect(pos.dx + 30 + c * 2, pos.dy + 26 + r * 2, 2, 2);
            }
        }
      },
    });
    if (runner) drawables.push({ y: runner.py, fn: () => drawCharacter("dad", "down", runner.px, runner.py, camX, camY, 0) });
    drawables.sort((a, b) => a.y - b.y);
    for (const d of drawables) d.fn();

    // butterflies
    for (const b of butterflies) {
      b.a += 0.03;
      b.x += Math.cos(b.a) * 0.7;
      b.y += Math.sin(b.a * 1.3) * 0.5;
      const flap = ((tick / 6) | 0) % 2 === 0;
      ctx.fillStyle = b.hue;
      const bx = b.x - camX, by = b.y - camY;
      if (flap) { ctx.fillRect(bx - 3, by, 3, 3); ctx.fillRect(bx + 3, by, 3, 3); }
      else ctx.fillRect(bx, by - 3, 3, 3);
      ctx.fillRect(bx, by, 3, 3);
    }

    lightPass();

    if (flashRed > 0) {
      flashRed--;
      ctx.fillStyle = "rgba(220,40,40," + (flashRed / 50) * 0.4 + ")";
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }

    drawLabels(camX, camY);
    ctx.restore();
    drawHud();

    requestAnimationFrame(frame);
  }

  // ════════════════════ boot ════════════════════
  const params = new URLSearchParams(location.search);
  if (params.has("skiptitle") || params.has("map")) {
    started = true;
    document.getElementById("title-screen").classList.add("hidden");
  }
  const startMap = params.get("map") && MAPS[params.get("map")] ? params.get("map") : "exterior";
  const ps = MAPS[startMap].playerStart;
  loadMap(startMap, ps.x, ps.y, ps.facing);

  requestAnimationFrame(frame);
})();
