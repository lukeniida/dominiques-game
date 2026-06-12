// ============================================================
// engine.js — GAME LOGIC ONLY (state, movement, dialog, events).
// All drawing lives in render.js (PixiJS). The contract between
// them is the global `G` object defined here.
// ============================================================

(() => {
  const TILE = 16, SCALE = 3, TS = TILE * SCALE;
  const SOLID = new Set(["t", "w", "V", "M", "X", "#", "K", "F", "B"]);

  function hash(x, y) {
    let h = (x * 374761393 + y * 668265263) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }

  const ITEMS = [
    { id: "lumpy",    label: "Lumpy",     sprite: "lumpy" },
    { id: "notebook", label: "Notebook",  sprite: "notebook" },
    { id: "heart",    label: "Heart",     sprite: "kintsugiheart" },
    { id: "door",     label: "Door",      sprite: "lockedphoto" },
    { id: "diploma",  label: "Doctorate", sprite: "diploma" },
  ];

  const G = window.G = {
    TILE, SCALE, TS, SOLID, ITEMS, hash,
    map: null, mapName: "", mapW: 0, mapH: 0,
    entities: [], entitiesVersion: 0,
    runner: null,
    state: { taken: new Set(), flags: {} },
    tick: 0, shake: 0, flashRed: 0, started: false,
    player: {
      x: 0, y: 0, px: 0, py: 0, facing: "down",
      moving: false, prog: 0, step: 0, animTick: 0, hasLumpy: false,
    },
    tileAt, update, loadMap, startGame,
  };

  const player = G.player;
  const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  function tileAt(x, y) {
    if (x < 0 || y < 0 || x >= G.mapW || y >= G.mapH) return "t";
    return G.map.tiles[y][x];
  }

  function loadMap(name, x, y, facing) {
    G.map = MAPS[name]; G.mapName = name;
    G.mapW = G.map.tiles[0].length; G.mapH = G.map.tiles.length;
    G.entities = G.map.entities
      .filter(e => !(e.itemId && G.state.taken.has(e.itemId)))
      .map(e => ({
        ...e, moving: false, prog: 0, px: e.x * TS, py: e.y * TS,
        home: { x: e.x, y: e.y },
        timer: G.tick + 60 + ((hash(e.x, e.y) * 200) | 0), dir: "down",
      }));
    if (G.state.flags.pbDone && name === "exterior") {
      G.entities.push(makePatrolDad(26, 26));
    }
    player.x = x; player.y = y;
    player.px = x * TS; player.py = y * TS;
    player.facing = facing || "down";
    player.moving = false; player.prog = 0;
    G.runner = null;
    G.entitiesVersion++;
  }

  function makePatrolDad(x, y) {
    return {
      x, y, sprite: "dad", name: "Dad", label: true, wander: 1,
      moving: false, prog: 0, px: x * TS, py: y * TS,
      home: { x, y }, timer: G.tick + 100, dir: "down",
      lines: ["I'm watching the table.", "(He is doing a very slow patrol jog\naround it.)"],
    };
  }

  function startGame() {
    G.started = true;
    document.getElementById("title-screen").classList.add("hidden");
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
      if (!G.started) { startGame(); return; }
      if (dialog) advanceDialog();
      else if (!G.runner) tryExamine();
    }
  });
  window.addEventListener("keyup", (ev) => { if (DIRS[ev.key]) held.delete(DIRS[ev.key]); });

  // ════════════════════ dialog (DOM) ════════════════════
  let dialog = null;
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
  G.dialogOpen = () => !!dialog;

  // ════════════════════ examine & events ════════════════════
  function entityAt(x, y) { return G.entities.find(e => e.x === x && e.y === y); }
  function isWarp(x, y) { return G.map.warps && G.map.warps.some(w => w.x === x && w.y === y); }

  function walkableNpc(x, y) {
    if (x < 0 || y < 0 || x >= G.mapW || y >= G.mapH) return false;
    if (SOLID.has(tileAt(x, y))) return false;
    if (entityAt(x, y)) return false;
    if (isWarp(x, y) || (x === player.x && y === player.y)) return false;
    return true;
  }

  function tryExamine() {
    const [dx, dy] = DELTA[player.facing];
    const e = entityAt(player.x + dx, player.y + dy);
    if (!e) return;

    if (e.portal) { portalExamine(); return; }

    if (e.gag === "pb") {
      if (!G.state.flags.pbDone) openDialog(e.name, e.lines, startPbGag);
      else openDialog(e.name, e.linesAfter);
      return;
    }

    if (e.itemId && !G.state.taken.has(e.itemId)) {
      openDialog(e.name, e.lines, () => {
        G.state.taken.add(e.itemId);
        G.entities = G.entities.filter(x => x !== e);
        G.entitiesVersion++;
        if (e.itemId === "lumpy") player.hasLumpy = true;
      });
      return;
    }

    openDialog(e.name, e.lines);
  }

  function startPbGag() {
    G.shake = 50; G.flashRed = 50;
    const table = G.entities.find(e => e.gag === "pb");
    G.runner = {
      sprite: "dad",
      px: Math.max(0, (table.x - 8)) * TS, py: table.y * TS,
      targetPx: (table.x - 1) * TS,
      done: false,
    };
  }

  function updateRunner() {
    const runner = G.runner;
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
        G.state.flags.pbDone = true;
        const t = G.runner; G.runner = null;
        G.entities.push(makePatrolDad(Math.round(t.px / TS), Math.round(t.py / TS)));
        G.entitiesVersion++;
      });
    }
  }

  function portalExamine() {
    const missing = ITEMS.filter(i => !G.state.taken.has(i.id));
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

  // ════════════════════ movement ════════════════════
  function updatePlayer() {
    if (dialog || !G.started || G.runner) return;
    if (player.moving) {
      player.prog += 0.095;
      player.animTick++;
      if (player.animTick % 8 === 0) player.step = 1 - player.step;
      if (player.prog >= 1) {
        player.prog = 0; player.moving = false;
        player.px = player.x * TS; player.py = player.y * TS;
        const w = G.map.warps && G.map.warps.find(w => w.x === player.x && w.y === player.y);
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
          if (nx >= 0 && ny >= 0 && nx < G.mapW && ny < G.mapH &&
              !SOLID.has(tileAt(nx, ny)) && !entityAt(nx, ny)) {
            player.x = nx; player.y = ny;
            player.moving = true; player.prog = 0;
          }
          break;
        }
      }
    }
  }

  function updateNpcs() {
    for (const e of G.entities) {
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
      if (G.tick < e.timer || dialog) continue;
      e.timer = G.tick + 90 + ((hash(e.x * 3 + G.tick, e.y * 7) * 150) | 0);
      const dirs = ["up", "down", "left", "right"];
      const dir = dirs[(hash(G.tick, e.x + e.y) * 4) | 0];
      const [dx, dy] = DELTA[dir];
      const nx = e.x + dx, ny = e.y + dy;
      if (Math.abs(nx - e.home.x) > e.wander || Math.abs(ny - e.home.y) > e.wander) continue;
      if (!walkableNpc(nx, ny)) continue;
      e.x = nx; e.y = ny; e.dir = dir;
      e.moving = true; e.prog = 0;
    }
  }

  // ════════════════════ per-frame logic tick ════════════════════
  function update() {
    G.tick++;
    updatePlayer();
    updateNpcs();
    updateRunner();
    updateDialog();
    if (G.shake > 0) G.shake--;
    if (G.flashRed > 0) G.flashRed--;

    if (G.started && G.mapName === "exterior" && !G.state.flags.greeted && G.tick > 40 && !dialog) {
      G.state.flags.greeted = true;
      openDialog("Luke", [
        "DOM. You made it. Welcome to my house.",
        "Okay — technically I haven't bought it\nyet. But this is a 1:1 preview of the\nmansion I'm going to own on Lake Michigan.",
        "Everyone already lives here. Go say hi.",
        "Oh — and FIVE things in this world\nSPARKLE. Find all five, then meet me at\nthe portal on the cliff.",
        "Go on. Explore. Touch stuff.",
        "(Not the peanut butter table.)",
      ]);
    }
  }

  // ════════════════════ boot ════════════════════
  const params = new URLSearchParams(location.search);
  if (params.has("skiptitle") || params.has("map")) {
    G.started = true;
    document.getElementById("title-screen").classList.add("hidden");
  }
  if (params.has("quiet")) G.state.flags.greeted = true; // dev: skip the intro dialog
  const startMap = params.get("map") && MAPS[params.get("map")] ? params.get("map") : "exterior";
  const ps = MAPS[startMap].playerStart;
  let sx = ps.x, sy = ps.y;
  if (params.has("at")) { // dev: spawn anywhere, e.g. ?at=30,12
    const [ax, ay] = params.get("at").split(",").map(Number);
    if (!isNaN(ax) && !isNaN(ay)) { sx = ax; sy = ay; }
  }
  loadMap(startMap, sx, sy, ps.facing);
})();
