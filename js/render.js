// ============================================================
// render.js — ALL drawing, on the GPU via PixiJS.
// Reads game state from the global `G` (engine.js).
// Step 1 of the visual rebuild: output should look identical
// to the old canvas renderer; the difference is what it makes
// possible next (spritesheets, shaders, light maps).
// ============================================================

(async () => {
  const { TS, SCALE, hash, ITEMS } = G;
  const VIEW_W = 960, VIEW_H = 624;

  PIXI.TextureSource.defaultOptions.scaleMode = "nearest";
  const app = new PIXI.Application();
  await app.init({
    canvas: document.getElementById("game"),
    width: VIEW_W, height: VIEW_H,
    background: 0x0d0a14, antialias: false, roundPixels: true,
  });

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

  // ════════════════════ terrain painters (ported intact) ════════════════════
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

  function paintWood(g, seed, dark, ox, oy) {
    const r = mulberry(seed * 419 + 13);
    const tones = dark ? ["#4c4456", "#484052", "#514a5c"] : ["#c89a62", "#c2945c", "#cfa26a"];
    const line = dark ? "#38323f" : "#a87f4e";
    const grain = dark ? "#564e62" : "#d8ac76";
    for (let row = 0; row < 4; row++) {
      g.fillStyle = tones[(r() * 3) | 0];
      g.fillRect(ox, oy + row * 12, TS, 12);
      g.fillStyle = line;
      g.fillRect(ox, oy + row * 12 + 11, TS, 1);
      if (r() < 0.7) {
        const seam = ((r() * 20) | 0) * 2 + 4;
        g.fillRect(ox + seam, oy + row * 12, 1, 12);
      }
      g.fillStyle = grain;
      const gx = ((r() * 16) | 0) * 2;
      g.fillRect(ox + gx, oy + row * 12 + 3 + ((r() * 3) | 0) * 2, 8 + ((r() * 5) | 0) * 2, 1);
    }
  }

  const GRASS_TILES = Array.from({ length: 8 }, (_, i) => makeCanvas(TS, TS, g => paintGrass(g, i + 1)));
  const TALL_TILES = Array.from({ length: 4 }, (_, i) => makeCanvas(TS, TS, g => paintTallGrass(g, i + 1)));
  const FLOWER_TILES = Array.from({ length: 6 }, (_, i) => makeCanvas(TS, TS, g => paintFlower(g, i + 1)));
  const WATER_CANVASES = Array.from({ length: 4 }, (_, i) => makeCanvas(TS, TS, g => paintWater(g, i)));
  const WATER_TEX = WATER_CANVASES.map(c => PIXI.Texture.from(c));

  const TREE_CANVAS = makeCanvas(TS, TS * 2, g => {
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

  // ════════════════════ static map layers ════════════════════
  function tileAt(x, y) { return G.tileAt(x, y); }

  function drawWallTile(ctx, ch, sx, sy, mapName) {
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
      ctx.fillStyle = mapName === "exterior" ? "#f5d878" : "#a8d8f0";
      ctx.fillRect(sx + 9, sy + 9, TS - 18, TS - 20);
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

  function buildGround(map, mapName) {
    const w = G.mapW * TS, h = G.mapH * TS;
    const waterCells = [];
    const foam = makeCanvas(w, h, () => {});
    const fctx = foam.getContext("2d");
    const ground = makeCanvas(w, h, (ctx) => {
      for (let y = 0; y < G.mapH; y++) {
        for (let x = 0; x < G.mapW; x++) {
          const ch = map.tiles[y][x];
          const sx = x * TS, sy = y * TS;
          const hsh = hash(x, y);

          if (ch === "w") {
            ctx.drawImage(WATER_CANVASES[x % 4], sx, sy);
            waterCells.push({ x, y });
            fctx.fillStyle = "rgba(225,242,250,0.6)";
            if (tileAt(x, y - 1) !== "w") fctx.fillRect(sx, sy, TS, 3);
            if (tileAt(x - 1, y) !== "w") fctx.fillRect(sx, sy, 3, TS);
            if (tileAt(x + 1, y) !== "w") fctx.fillRect(sx + TS - 3, sy, 3, TS);
            if (tileAt(x, y + 1) !== "w") fctx.fillRect(sx, sy + TS - 3, TS, 3);
            continue;
          }
          if ("#KMXV".includes(ch)) { drawWallTile(ctx, ch, sx, sy, mapName); continue; }

          if (ch === "r" || ch === "u" || ch === "k" || (ch === "d" && map.theme !== "exterior")) {
            paintWood(ctx, ((x * 7 + y * 13) % 4) + 1, map.theme === "dojo" || ch === "k", sx, sy);
            if (ch === "u") {
              ctx.fillStyle = "#b8453e";
              ctx.fillRect(sx, sy, TS, TS);
              const isU = (xx, yy) => tileAt(xx, yy) === "u";
              ctx.fillStyle = "#8a2f2a";
              if (!isU(x, y - 1)) ctx.fillRect(sx, sy, TS, 5);
              if (!isU(x, y + 1)) ctx.fillRect(sx, sy + TS - 5, TS, 5);
              if (!isU(x - 1, y)) ctx.fillRect(sx, sy, 5, TS);
              if (!isU(x + 1, y)) ctx.fillRect(sx + TS - 5, sy, 5, TS);
              ctx.fillStyle = "#c8645c";
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
            continue;
          }

          if (ch === "D") {
            drawWallTile(ctx, "M", sx, sy, mapName);
            ctx.fillStyle = "#54391f"; ctx.fillRect(sx + 2, sy, TS - 4, TS);
            ctx.fillStyle = "#3a2415"; ctx.fillRect(sx + 6, sy + 4, TS - 12, TS - 4);
            ctx.fillStyle = "#e8c858"; ctx.fillRect(sx + TS - 14, sy + TS / 2, 3, 3);
            continue;
          }

          ctx.drawImage(GRASS_TILES[(hsh * 8) | 0], sx, sy);
          if (ch === "f") ctx.drawImage(FLOWER_TILES[(hsh * 6) | 0], sx, sy);
          if (ch === "h") ctx.drawImage(TALL_TILES[(hsh * 4) | 0], sx, sy);

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
      }
      // tree pass (canopies overlap the tile above)
      for (let y = 0; y < G.mapH; y++)
        for (let x = 0; x < G.mapW; x++)
          if (map.tiles[y][x] === "t")
            ctx.drawImage(TREE_CANVAS, x * TS, y * TS - TS);
    });
    return { ground, foam, waterCells };
  }

  // ════════════════════ character textures ════════════════════
  const texCache = {};
  function charTex(name, dir, frame, cell) {
    cell = cell || SCALE;
    const key = name + "|" + dir + "|" + frame + "|" + cell;
    if (texCache[key]) return texCache[key];
    const s = SPRITES[name];
    let grid = s.down;
    if (dir === "up" && s.up) grid = s.up;
    if ((dir === "left" || dir === "right") && s.side) grid = s.side;
    if (frame === 1 && s.feetAlt && s.feetRow != null && dir !== "left" && dir !== "right") {
      grid = grid.slice();
      grid[s.feetRow] = s.feetAlt;
    }
    const canvas = makeCanvas(grid[0].length * cell, grid.length * cell, (g) => {
      for (let r = 0; r < grid.length; r++)
        for (let c = 0; c < grid[r].length; c++) {
          const ch = grid[r][c];
          if (ch === ".") continue;
          const color = s.legend[ch];
          if (!color) continue;
          g.fillStyle = color;
          g.fillRect(c * cell, r * cell, cell, cell);
        }
    });
    texCache[key] = PIXI.Texture.from(canvas);
    return texCache[key];
  }

  function makeCharacter(spriteName, withShadow) {
    const c = new PIXI.Container();
    if (withShadow !== false) {
      const grid = SPRITES[spriteName].down;
      const wPx = grid[0].length * SCALE;
      const sh = new PIXI.Graphics();
      sh.ellipse(0, -10, Math.min(20, wPx / 2.4), 6).fill({ color: 0x141e0f, alpha: 0.25 });
      c.addChild(sh);
    }
    const body = new PIXI.Sprite(charTex(spriteName, "down", 0));
    body.anchor.set(0.5, 1);
    c.addChild(body);
    c._body = body;
    return c;
  }

  function placeChar(container, px, py) {
    container.position.set(px + TS / 2, py + TS + 2 * SCALE);
    container.zIndex = py;
  }

  // ════════════════════ light overlays ════════════════════
  function buildLight(theme) {
    return makeCanvas(VIEW_W, VIEW_H, (ctx) => {
      if (theme === "exterior") {
        const grad = ctx.createLinearGradient(0, 0, VIEW_W, VIEW_H);
        grad.addColorStop(0, "rgba(255,214,140,0.10)");
        grad.addColorStop(1, "rgba(200,100,80,0.12)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      } else if (theme === "lukeroom") {
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
      } else if (theme === "dojo") {
        ctx.fillStyle = "rgba(8,8,38,0.32)";
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      } else {
        ctx.fillStyle = "rgba(255,220,160,0.07)";
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      }
      const vig = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H / 2.4, VIEW_W / 2, VIEW_H / 2, VIEW_H);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, theme === "dojo" ? "rgba(5,5,20,0.5)" : "rgba(10,5,30,0.28)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    });
  }

  const GLOW_CANVAS = makeCanvas(140, 140, (ctx) => {
    const grad = ctx.createRadialGradient(70, 70, 4, 70, 70, 70);
    grad.addColorStop(0, "rgba(180,140,255,1)");
    grad.addColorStop(1, "rgba(180,140,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 140, 140);
  });

  // ════════════════════ scene graph ════════════════════
  const world = new PIXI.Container();
  const groundSprite = new PIXI.Sprite();
  const waterLayer = new PIXI.Container();
  const foamSprite = new PIXI.Sprite();
  const glowSprite = new PIXI.Sprite(PIXI.Texture.from(GLOW_CANVAS));
  glowSprite.anchor.set(0.5);
  glowSprite.visible = false;
  const entLayer = new PIXI.Container();
  entLayer.sortableChildren = true;
  const fxG = new PIXI.Graphics();
  const labelLayer = new PIXI.Container();
  world.addChild(groundSprite, waterLayer, foamSprite, glowSprite, entLayer, fxG, labelLayer);

  const lightSprite = new PIXI.Sprite();
  const flashG = new PIXI.Graphics();
  const hud = new PIXI.Container();
  app.stage.addChild(world, lightSprite, flashG, hud);

  // player
  const playerC = makeCharacter("dominique");
  const lumpyMini = new PIXI.Sprite(charTex("lumpy", "down", 0, 2));
  lumpyMini.position.set(6, -46);
  lumpyMini.visible = false;
  playerC.addChild(lumpyMini);

  // ════════════════════ map / entity sync ════════════════════
  let lastMap = "", lastEntVersion = -1, lastTakenCount = -1;
  let waterSprites = [], entitySprites = [], labels = [], butterflies = [];
  let runnerC = null;

  function rebuildMap() {
    lastMap = G.mapName;
    const { ground, foam, waterCells } = buildGround(G.map, G.mapName);
    groundSprite.texture = PIXI.Texture.from(ground);
    foamSprite.texture = PIXI.Texture.from(foam);
    waterLayer.removeChildren();
    waterSprites = waterCells.map(({ x, y }) => {
      const sp = new PIXI.Sprite(WATER_TEX[x % 4]);
      sp.position.set(x * TS, y * TS);
      sp._wx = x;
      waterLayer.addChild(sp);
      return sp;
    });
    lightSprite.texture = PIXI.Texture.from(buildLight(G.map.theme));
    butterflies = [];
    if (G.map.theme === "exterior") {
      for (let i = 0; i < 7; i++) {
        butterflies.push({
          x: (2 + Math.random() * (G.mapW - 8)) * TS,
          y: (2 + Math.random() * (G.mapH - 4)) * TS,
          a: Math.random() * Math.PI * 2,
          hue: Math.random() < 0.5 ? 0xf5f2ec : 0xf0a64a,
        });
      }
    }
    rebuildEntities();
  }

  function rebuildEntities() {
    lastEntVersion = G.entitiesVersion;
    entLayer.removeChildren();
    labelLayer.removeChildren();
    entitySprites = []; labels = [];
    glowSprite.visible = false;
    for (const e of G.entities) {
      const c = makeCharacter(e.sprite);
      placeChar(c, e.px, e.py);
      entLayer.addChild(c);
      entitySprites.push({ e, c });
      if (e.label) {
        const grid = SPRITES[e.sprite].down;
        const t = new PIXI.Text({
          text: e.name,
          style: {
            fontFamily: "Courier New", fontSize: 13, fontWeight: "bold",
            fill: 0xfcf3df,
            dropShadow: { color: 0x000000, alpha: 0.55, distance: 1, blur: 0, angle: Math.PI / 4 },
          },
        });
        t.anchor.set(0.5, 1);
        labelLayer.addChild(t);
        labels.push({ e, t, hPx: grid.length * SCALE });
      }
      if (e.glow) {
        glowSprite.visible = true;
        glowSprite.position.set(e.px + TS / 2, e.py + TS / 2 - 10);
      }
    }
    entLayer.addChild(playerC);
    if (runnerC) { entLayer.addChild(runnerC); }
  }

  function rebuildHud() {
    lastTakenCount = G.state.taken.size;
    hud.removeChildren();
    if (!G.started) return;
    const pad = 10, slot = 44;
    for (let i = 0; i < ITEMS.length; i++) {
      const x = pad + i * (slot + 6), y = pad;
      const g = new PIXI.Graphics();
      g.roundRect(x, y, slot, slot, 8)
        .fill({ color: 0x140f1e, alpha: 0.55 })
        .stroke({ width: 2, color: 0xfcf3df, alpha: 0.5 });
      hud.addChild(g);
      const it = ITEMS[i];
      if (G.state.taken.has(it.id)) {
        const sp = new PIXI.Sprite(charTex(it.sprite, "down", 0, 2));
        const scale = Math.min(1, (slot - 8) / sp.width, (slot - 8) / sp.height);
        sp.scale.set(scale);
        sp.position.set(x + (slot - sp.width) / 2, y + (slot - sp.height) / 2);
        hud.addChild(sp);
      } else {
        const q = new PIXI.Text({
          text: "?",
          style: { fontFamily: "Courier New", fontSize: 20, fontWeight: "bold", fill: 0xfcf3df },
        });
        q.alpha = 0.35;
        q.anchor.set(0.5);
        q.position.set(x + slot / 2, y + slot / 2);
        hud.addChild(q);
      }
    }
  }

  function drawSparkle(px, py, seed) {
    const t = G.tick / 8;
    for (let i = 0; i < 3; i++) {
      const a = t * 0.6 + i * 2.1 + seed;
      const r = 14 + Math.sin(t + i) * 6;
      const x = px + TS / 2 + Math.cos(a) * r;
      const y = py + TS / 2 - 10 + Math.sin(a) * r * 0.6;
      const big = (((G.tick / 10) | 0) + i) % 3 === 0;
      const col = i % 2 ? 0xfff8d8 : 0xffe87a;
      fxG.rect(x, y, big ? 4 : 2, big ? 4 : 2).fill(col);
      if (big) {
        fxG.rect(x - 2, y + 1, 2, 2).fill(col);
        fxG.rect(x + 4, y + 1, 2, 2).fill(col);
      }
    }
  }

  // ════════════════════ frame loop ════════════════════
  app.ticker.add(() => {
    G.update();

    if (G.mapName !== lastMap) rebuildMap();
    if (G.entitiesVersion !== lastEntVersion) rebuildEntities();
    if (G.state.taken.size !== lastTakenCount || (G.started && hud.children.length === 0)) rebuildHud();

    // camera (centers small maps)
    const p = G.player;
    const mapPxW = G.mapW * TS, mapPxH = G.mapH * TS;
    let camX = p.px + TS / 2 - VIEW_W / 2;
    let camY = p.py + TS / 2 - VIEW_H / 2;
    camX = mapPxW <= VIEW_W ? (mapPxW - VIEW_W) / 2 : Math.max(0, Math.min(camX, mapPxW - VIEW_W));
    camY = mapPxH <= VIEW_H ? (mapPxH - VIEW_H) / 2 : Math.max(0, Math.min(camY, mapPxH - VIEW_H));

    let jx = 0, jy = 0;
    if (G.shake > 0) {
      jx = (Math.random() - 0.5) * 10;
      jy = (Math.random() - 0.5) * 10;
    }
    world.position.set(Math.round(-camX + jx), Math.round(-camY + jy));

    // water animation
    const wf = ((G.tick / 16) | 0);
    for (const sp of waterSprites) sp.texture = WATER_TEX[(wf + sp._wx) % 4];

    // entities
    for (const { e, c } of entitySprites) {
      c._body.texture = charTex(e.sprite, e.dir || "down", 0);
      placeChar(c, e.px, e.py);
    }
    for (const { e, t, hPx } of labels) {
      t.position.set(e.px + TS / 2, e.py - (hPx - TS) - 4);
    }

    // player
    const mirror = p.facing === "left";
    playerC._body.texture = charTex("dominique", p.facing, p.moving ? p.step : 0);
    playerC._body.scale.x = mirror ? -1 : 1;
    placeChar(playerC, p.px, p.py);
    lumpyMini.visible = p.hasLumpy && p.facing !== "up";

    // runner (the Dad sprint)
    if (G.runner && !runnerC) {
      runnerC = makeCharacter("dad");
      entLayer.addChild(runnerC);
    }
    if (!G.runner && runnerC) {
      entLayer.removeChild(runnerC);
      runnerC = null;
    }
    if (G.runner && runnerC) placeChar(runnerC, G.runner.px, G.runner.py);

    // portal glow pulse
    if (glowSprite.visible) glowSprite.alpha = 0.25 + Math.sin(G.tick / 20) * 0.1;

    // sparkles + butterflies
    fxG.clear();
    for (const e of G.entities) {
      if ((e.itemId && !G.state.taken.has(e.itemId)) || e.portal) drawSparkle(e.px, e.py, e.x * 3);
    }
    for (const b of butterflies) {
      b.a += 0.03;
      b.x += Math.cos(b.a) * 0.7;
      b.y += Math.sin(b.a * 1.3) * 0.5;
      const flap = ((G.tick / 6) | 0) % 2 === 0;
      if (flap) {
        fxG.rect(b.x - 3, b.y, 3, 3).fill(b.hue);
        fxG.rect(b.x + 3, b.y, 3, 3).fill(b.hue);
      } else {
        fxG.rect(b.x, b.y - 3, 3, 3).fill(b.hue);
      }
      fxG.rect(b.x, b.y, 3, 3).fill(b.hue);
    }

    // red flash
    flashG.clear();
    if (G.flashRed > 0) {
      flashG.rect(0, 0, VIEW_W, VIEW_H).fill({ color: 0xdc2828, alpha: (G.flashRed / 50) * 0.4 });
    }
  });
})();
