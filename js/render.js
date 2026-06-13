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

  // ════════════════════ asset sheets (Cute Fantasy pack) ════════════════════
  // Professional 16px tile art, drawn at 3× like everything else.
  // Files live in gitignored assets/ — run scripts/restore-assets.sh
  // after a fresh clone to rebuild it from the downloaded packs.
  const IMG = {};
  await Promise.all(Object.entries({
    grass: "exterior/grass.png",
    path: "exterior/path.png", pathEdges: "exterior/path-edges.png", pathDecor: "exterior/path-decor.png",
    fences: "exterior/fences.png", decor: "exterior/decor.png",
    waterEdgesAnim: "exterior/water-edges-anim.png", waterMiddleAnim: "exterior/water-middle-anim.png",
    fishAnim: "exterior/fish-anim.png",
    mansion: "exterior/mansion.png", chimneySmoke: "exterior/chimney-smoke-anim.png",
    treeOak: "exterior/tree-oak-anim.png", treeBirch: "exterior/tree-birch-anim.png", treeSpruce: "exterior/tree-spruce-anim.png",
    lilyGreen: "exterior/lillypad-green-anim.png", lilyRed: "exterior/lillypad-red-anim.png",
    lilyPurple: "exterior/lillypad-purple-anim.png", cattail: "exterior/cattail-anim.png",
    waterlog: "exterior/waterlog-anim.png",
    tallgrass1: "exterior/tallgrass-1-anim.png", tallgrass2: "exterior/tallgrass-2-anim.png",
    flower1: "exterior/flower-1-anim.png", flower2: "exterior/flower-2-anim.png", flower3: "exterior/flower-3-anim.png",
    butterfly: "exterior/butterfly.png",
    roomBuilder: "interior/room-builder.png", furniture: "interior/furniture.png",
  }).map(([key, file]) => new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(IMG[key] = i);
    i.onerror = () => rej(new Error("missing assets/" + file + " — run scripts/restore-assets.sh"));
    i.src = "assets/" + file;
  })));

  // ════════════════════ family characters (layered) ════════════════════
  // Each family member = Cute Fantasy player layers stacked on one
  // canvas (rows 0-5 only: idle + walk), plus hand-pixeled "deco"
  // stamps for the likeness details. Textures are sliced per
  // (row, frame) at 3× like everything else.
  const FAM_IMG = {};
  {
    const wanted = new Set();
    for (const name in FAMILY) FAMILY[name].layers.forEach(l => wanted.add(l));
    await Promise.all([...wanted].map(l => new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(FAM_IMG[l] = i);
      i.onerror = () => rej(new Error("missing assets/family/" + l + ".png — run scripts/restore-assets.sh"));
      i.src = "assets/family/" + l + ".png";
    })));
  }

  // Per-frame head bob: the body rises/dips a pixel through the
  // cycle, and deco stamps have to ride along or they'd float.
  // Measured from the base layer: top-most opaque pixel per frame,
  // relative to that row's first frame.
  function famBobs(baseImg) {
    const c = makeCanvas(FAM_CELL * FAM_FRAMES, FAM_CELL * 6, g =>
      g.drawImage(baseImg, 0, 0, FAM_CELL * FAM_FRAMES, FAM_CELL * 6, 0, 0, FAM_CELL * FAM_FRAMES, FAM_CELL * 6));
    const data = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    const topOf = (row, f) => {
      for (let y = row * FAM_CELL; y < (row + 1) * FAM_CELL; y++)
        for (let x = f * FAM_CELL; x < (f + 1) * FAM_CELL; x++)
          if (data[(y * c.width + x) * 4 + 3] > 60) return y;
      return row * FAM_CELL;
    };
    const bobs = [];
    for (let row = 0; row < 6; row++) {
      const t0 = topOf(row, 0);
      bobs.push(Array.from({ length: FAM_FRAMES }, (_, f) => topOf(row, f) - t0));
    }
    return bobs;
  }
  const FAM_BOBS = famBobs(FAM_IMG.base);

  // Feet line (for bottom-anchoring): lowest opaque pixel of the
  // base's idle-down frame, inside its 64px cell.
  const FAM_FEET = (() => {
    const c = makeCanvas(FAM_CELL, FAM_CELL, g =>
      g.drawImage(FAM_IMG.base, 0, 0, FAM_CELL, FAM_CELL, 0, 0, FAM_CELL, FAM_CELL));
    const data = c.getContext("2d").getImageData(0, 0, FAM_CELL, FAM_CELL).data;
    for (let y = FAM_CELL - 1; y >= 0; y--)
      for (let x = 0; x < FAM_CELL; x++)
        if (data[(y * FAM_CELL + x) * 4 + 3] > 60) return y + 1;
    return FAM_CELL;
  })();

  const famCache = {};
  function famSheet(name) {
    if (famCache[name]) return famCache[name];
    const r = FAMILY[name];
    // raw-pixel composite of rows 0-5
    const raw = makeCanvas(FAM_CELL * FAM_FRAMES, FAM_CELL * 6, (g) => {
      for (const l of r.layers)
        g.drawImage(FAM_IMG[l], 0, 0, FAM_CELL * FAM_FRAMES, FAM_CELL * 6, 0, 0, FAM_CELL * FAM_FRAMES, FAM_CELL * 6);
      if (!r.deco) return;
      const decoFor = { 0: "down", 1: "side", 2: "up", 3: "down", 4: "side", 5: "up" };
      for (let row = 0; row < 6; row++)
        for (const d of r.deco[decoFor[row]] || [])
          for (let f = 0; f < FAM_FRAMES; f++) {
            g.fillStyle = d.color;
            g.fillRect(f * FAM_CELL + d.x, row * FAM_CELL + d.y + FAM_BOBS[row][f], d.w, d.h);
          }
    });
    // upscale once, slice 36 textures
    const big = makeCanvas(raw.width * SCALE, raw.height * SCALE, (g) => {
      g.imageSmoothingEnabled = false;
      g.drawImage(raw, 0, 0, raw.width * SCALE, raw.height * SCALE);
    });
    const texs = [];
    for (let row = 0; row < 6; row++) {
      texs.push([]);
      for (let f = 0; f < FAM_FRAMES; f++)
        texs[row].push(new PIXI.Texture({
          source: PIXI.Texture.from(big).source,
          frame: new PIXI.Rectangle(f * FAM_CELL * SCALE, row * FAM_CELL * SCALE, FAM_CELL * SCALE, FAM_CELL * SCALE),
        }));
    }
    return famCache[name] = texs;
  }

  // dir + walking → texture. Side art faces LEFT; caller mirrors for right.
  function famTex(name, dir, moving) {
    const rows = moving ? FAM_ROWS.walk : FAM_ROWS.idle;
    const row = rows[dir === "left" || dir === "right" ? "side" : dir] ?? rows.down;
    const speed = moving ? 5 : 10;
    return famSheet(name)[row][((G.tick / speed) | 0) % FAM_FRAMES];
  }

  // The edge sheets (water-edges, path-edges) are "blob" tilesets:
  // rows 0-2 are a 3×3 pool — corners, edges, and pure middle — and
  // rows 3-4 hold the four inner-corner pieces (grass poking into a
  // diagonal). We pick art per 8px QUADRANT of each 16px tile, which
  // composes those pieces into every possible shoreline/junction shape.
  const T16 = 16;
  const BLOB = {
    TL: [0, 0], T: [1, 0], TR: [2, 0],
    L:  [0, 1], MID: [1, 1], R: [2, 1],
    BL: [0, 2], B: [1, 2], BR: [2, 2],
    ITL: [1, 4], ITR: [0, 4], IBL: [1, 3], IBR: [0, 3],
  };

  function blitCell(ctx, img, cx, cy, dx, dy) {
    ctx.drawImage(img, cx * T16, cy * T16, T16, T16, dx, dy, TS, TS);
  }

  // Decides which sheet cell each 8px quadrant of a tile should use.
  // Returns a spec we can either bake to canvas (paths) or compose
  // into per-frame textures (animated water).
  function quadSpec(same, x, y) {
    const n = same(x, y - 1), s = same(x, y + 1);
    const w = same(x - 1, y), e = same(x + 1, y);
    const spec = [];
    const pick = (qx, qy, landV, landH, landDiag, corner, edgeV, edgeH, inner) => {
      let cell = null;
      if (landV && landH) cell = BLOB[corner];
      else if (landV) cell = BLOB[edgeV];
      else if (landH) cell = BLOB[edgeH];
      else if (landDiag) cell = BLOB[inner];
      spec.push({ qx, qy, cell });
    };
    pick(0, 0, !n, !w, !same(x - 1, y - 1), "TL", "T", "L", "ITL");
    pick(1, 0, !n, !e, !same(x + 1, y - 1), "TR", "T", "R", "ITR");
    pick(0, 1, !s, !w, !same(x - 1, y + 1), "BL", "B", "L", "IBL");
    pick(1, 1, !s, !e, !same(x + 1, y + 1), "BR", "B", "R", "IBR");
    return spec;
  }

  function blitQuadSpec(ctx, spec, sheet, mid, dx, dy) {
    for (const { qx, qy, cell } of spec) {
      if (cell) ctx.drawImage(sheet, cell[0] * T16 + qx * 8, cell[1] * T16 + qy * 8, 8, 8,
        dx + qx * TS / 2, dy + qy * TS / 2, TS / 2, TS / 2);
      else ctx.drawImage(mid, qx * 8, qy * 8, 8, 8,
        dx + qx * TS / 2, dy + qy * TS / 2, TS / 2, TS / 2);
    }
  }

  // ════════════════════ animation textures ════════════════════
  // Premium sheets are horizontal frame strips. Slice each frame into
  // its own texture, upscaled 3× like everything else.
  function sliceFrames(img, frameW, frameH, count) {
    const texs = [];
    for (let f = 0; f < count; f++) {
      texs.push(PIXI.Texture.from(makeCanvas(frameW * SCALE, frameH * SCALE, (g) => {
        g.imageSmoothingEnabled = false;
        g.drawImage(img, f * frameW, 0, frameW, frameH, 0, 0, frameW * SCALE, frameH * SCALE);
      })));
    }
    return texs;
  }

  // tree sheets are stump / tree+shadow / tree-only variants (chop
  // states, not animation) — we want the middle one
  const TREE_TEX = {
    oak: sliceFrames(IMG.treeOak, 64, 80, 3)[1],
    spruce: sliceFrames(IMG.treeSpruce, 64, 80, 3)[1],
    birch: sliceFrames(IMG.treeBirch, 32, 48, 3)[1],
  };
  const DECOR_TEX = {
    flower1: sliceFrames(IMG.flower1, 16, 16, 8),
    flower2: sliceFrames(IMG.flower2, 16, 16, 8),
    flower3: sliceFrames(IMG.flower3, 16, 16, 8),
    tallgrass1: sliceFrames(IMG.tallgrass1, 16, 16, 8),
    tallgrass2: sliceFrames(IMG.tallgrass2, 16, 16, 8),
    lilyGreen: sliceFrames(IMG.lilyGreen, 16, 16, 8),
    lilyRed: sliceFrames(IMG.lilyRed, 16, 16, 8),
    lilyPurple: sliceFrames(IMG.lilyPurple, 16, 16, 8),
    cattail: sliceFrames(IMG.cattail, 16, 16, 8),
    waterlog: sliceFrames(IMG.waterlog, 16, 16, 16),
  };
  const FISH_TEX = sliceFrames(IMG.fishAnim, 16, 16, 16);
  const SMOKE_TEX = sliceFrames(IMG.chimneySmoke, 32, 32, 5);
  // butterfly.png: 8×8 sprites, 2 wing frames per color row
  const BUTTERFLY_TEX = Array.from({ length: 6 }, (_, row) =>
    [0, 1].map(col => PIXI.Texture.from(makeCanvas(8 * SCALE, 8 * SCALE, (g) => {
      g.imageSmoothingEnabled = false;
      g.drawImage(IMG.butterfly, col * 8, row * 8, 8, 8, 0, 0, 8 * SCALE, 8 * SCALE);
    }))));
  // gentle, distinct paces — Luke's note: the lake shouldn't look caffeinated
  const DECOR_SPEED = {
    waterlog: 34, lilyGreen: 26, lilyRed: 26, lilyPurple: 26, cattail: 22,
  };
  const MANSION_TEX = PIXI.Texture.from(makeCanvas(240 * SCALE, 192 * SCALE, (g) => {
    g.imageSmoothingEnabled = false;
    g.drawImage(IMG.mansion, 0, 0, 240 * SCALE, 192 * SCALE);
  }));

  // Animated water: every water cell gets 8 composed textures, one per
  // animation frame. The edge sheet repeats the whole blob layout once
  // per frame (stride 48px); the middle strip strides 16px. Cells with
  // the same quadrant spec share one composed set.
  const WATER_FRAMES = 8;
  const waterTexCache = {};
  function waterCellTextures(spec) {
    const key = spec.map(q => (q.cell ? q.cell.join("") : "m")).join("|");
    if (waterTexCache[key]) return waterTexCache[key];
    const frames = [];
    for (let f = 0; f < WATER_FRAMES; f++) {
      frames.push(PIXI.Texture.from(makeCanvas(TS, TS, (g) => {
        g.imageSmoothingEnabled = false;
        for (const { qx, qy, cell } of spec) {
          if (cell) g.drawImage(IMG.waterEdgesAnim, f * 48 + cell[0] * T16 + qx * 8, cell[1] * T16 + qy * 8, 8, 8,
            qx * TS / 2, qy * TS / 2, TS / 2, TS / 2);
          else g.drawImage(IMG.waterMiddleAnim, f * T16 + qx * 8, qy * 8, 8, 8,
            qx * TS / 2, qy * TS / 2, TS / 2, TS / 2);
        }
      })));
    }
    return (waterTexCache[key] = frames);
  }

  // fences.png: col 0 = vertical run (top/mid/bottom + lone post),
  // row 0 cols 1-3 = horizontal run, the 3×3 at (1-3, 1-3) = a full
  // square with corners, T-junctions, and a cross.
  function fencePiece(u, d, l, r) {
    if (u && d && l && r) return [2, 2];
    if (d && l && r) return [2, 1];
    if (u && l && r) return [2, 3];
    if (u && d && r) return [1, 2];
    if (u && d && l) return [3, 2];
    if (d && r) return [1, 1];
    if (d && l) return [3, 1];
    if (u && r) return [1, 3];
    if (u && l) return [3, 3];
    if (l && r) return [2, 0];
    if (u && d) return [0, 1];
    if (r) return [1, 0];
    if (l) return [3, 0];
    if (d) return [0, 0];
    if (u) return [0, 2];
    return [0, 3];
  }

  // decor.png cells (col,row) — mapped with _slicer.html
  const TUFT_CELLS = [[0, 0], [1, 0], [2, 0]];
  const SPROUT_CELLS = [[3, 1]];
  const ROCK_CELL = [1, 2];

  // ════════════════════ static map layers ════════════════════
  function tileAt(x, y) { return G.tileAt(x, y); }

  function buildGround(map, mapName) {
    return map.theme === "exterior"
      ? buildExteriorGround(map)
      : buildInteriorGround(map, mapName);
  }

  function buildExteriorGround(map) {
    const w = G.mapW * TS, h = G.mapH * TS;
    const water = [];   // {x, y, spec} → animated water sprites
    const spawns = [];  // {kind, px, py, ph} → animated decor sprites
    const trees = [];   // {type, cx, baseY, flip, ph} → tree sprites
    const openWater = []; // candidate cells for the jumping fish
    let mansionAt = null; // top-left B cell — the building art anchors here
    // off-map counts as water so the lake bleeds past the map edge
    const isWater = (x, y) =>
      (x < 0 || y < 0 || x >= G.mapW || y >= G.mapH) ? true : map.tiles[y][x] === "w";
    const isPath = (x, y) => tileAt(x, y) === "p";
    const isFence = (x, y) => tileAt(x, y) === "F";
    const ground = makeCanvas(w, h, (ctx) => {
      ctx.imageSmoothingEnabled = false;
      for (let y = 0; y < G.mapH; y++) {
        for (let x = 0; x < G.mapW; x++) {
          const ch = map.tiles[y][x];
          const sx = x * TS, sy = y * TS;
          const hsh = hash(x, y);
          const ph = (hsh * 8) | 0;

          // grass under everything — water/path edges and the mansion
          // sprite all have transparent fringes
          ctx.drawImage(IMG.grass, sx, sy, TS, TS);

          if (ch === "B" && !mansionAt) mansionAt = { x, y };
          if (ch === "w") {
            water.push({ x, y, spec: quadSpec(isWater, x, y) });
            const open = isWater(x - 1, y) && isWater(x + 1, y) && isWater(x, y - 1) && isWater(x, y + 1)
              && isWater(x - 1, y - 1) && isWater(x + 1, y - 1) && isWater(x - 1, y + 1) && isWater(x + 1, y + 1);
            if (open) {
              openWater.push({ x, y });
              if (hsh < 0.05) spawns.push({ kind: "waterlog", px: sx, py: sy, ph });
              else if (hsh < 0.17) {
                const lily = ["lilyGreen", "lilyGreen", "lilyRed", "lilyPurple"][(hsh * 97 | 0) % 4];
                spawns.push({ kind: lily, px: sx, py: sy, ph });
              }
            } else if (!isWater(x, y - 1) && hsh < 0.22) {
              // reeds along the upper bank
              spawns.push({ kind: "cattail", px: sx, py: sy, ph });
            }
          } else if (ch === "p") {
            blitQuadSpec(ctx, quadSpec(isPath, x, y), IMG.pathEdges, IMG.path, sx, sy);
            if (hsh > 0.94) blitCell(ctx, IMG.pathDecor, ((hsh * 31) | 0) % 3, 0, sx, sy);
          } else if (ch === "f") {
            spawns.push({ kind: ["flower1", "flower2", "flower3"][(hsh * 13 | 0) % 3], px: sx, py: sy, ph });
          } else if (ch === "h") {
            spawns.push({ kind: ["tallgrass1", "tallgrass2"][(hsh * 11 | 0) % 2], px: sx, py: sy, ph });
          } else if (ch === "F") {
            blitCell(ctx, IMG.fences,
              ...fencePiece(isFence(x, y - 1), isFence(x, y + 1), isFence(x - 1, y), isFence(x + 1, y)),
              sx, sy);
          } else if (ch === "g") {
            // sparse decoration keeps plain grass from feeling flat
            if (hsh < 0.10) blitCell(ctx, IMG.decor, ...TUFT_CELLS[((hsh * 30) | 0) % 3], sx, sy);
            else if (hsh < 0.19) spawns.push({ kind: ["flower1", "flower2", "flower3"][(hsh * 53 | 0) % 3], px: sx, py: sy, ph });
            else if (hsh > 0.985) blitCell(ctx, IMG.decor, ...ROCK_CELL, sx, sy);
            else if (hsh > 0.97) blitCell(ctx, IMG.decor, ...SPROUT_CELLS[0], sx, sy);
          }
        }
      }
      // top border: a static canopy band hanging over the map edge —
      // a sprite tree's canopy would sit above the viewport and the
      // camera would only ever show its trunk
      for (let x = 0; x < G.mapW; x++) {
        if (map.tiles[0][x] !== "t" || x % 2) continue;
        const jy = hash(x * 13, 29) * TS * 0.35;
        const flip = hash(x * 7, 3) < 0.5;
        const dx = x * TS + TS / 2 - 96, dy = -66 + jy;
        ctx.save();
        if (flip) { ctx.translate(dx + 192, 0); ctx.scale(-1, 1); }
        // canopy crop of the tree+shadow variant (the sheet's middle frame)
        ctx.drawImage(IMG.treeOak, 64, 0, 64, 56, flip ? 0 : dx, dy, 192, 168);
        ctx.restore();
      }
    });

    // forest border: every other 't' cell grows a tree — oaks mostly,
    // with birches and spruces mixed in. Jitter + mirroring + species
    // keep the line from reading as a hedge.
    for (let y = 1; y < G.mapH; y++)
      for (let x = 0; x < G.mapW; x++) {
        if (map.tiles[y][x] !== "t" || (x + y) % 2) continue;
        const jx = (hash(x * 31, y * 17) - 0.5) * TS * 0.8;
        const jy = hash(x * 13, y * 29) * TS * 0.7;
        const pick = hash(x * 5, y * 23);
        trees.push({
          type: pick < 0.62 ? "oak" : pick < 0.82 ? "birch" : "spruce",
          cx: x * TS + TS / 2 + jx,
          baseY: y * TS + TS + jy,
          flip: hash(x * 7, y * 3) < 0.5,
          ph: (hash(x * 3, y * 41) * 4) | 0,
        });
      }

    return { ground, water, spawns, trees, openWater, mansionAt };
  }

  // Per-room looks from the LimeZu Room Builder sheet: wallRow is the
  // top row of a 2-row wall color set (trim course on top, baseboard
  // course everywhere a wall meets the room); floor is a [cx, cy, w, h]
  // tile region we repeat. Herringbone is hallway-only by request —
  // rooms get a neutral floor.
  const ROOM_STYLE = {
    hallway:   { wallRow: 19, floor: [11, 13, 3, 2] },  // beige + herringbone parquet
    lukeroom:  { wallRow: 7,  floor: [14, 9, 3, 2] },   // warm yellow walls, neutral floor
    momroom:   { wallRow: 9,  floor: [14, 9, 3, 2] },   // mint walls
    dadroom:   { wallRow: 17, floor: [14, 9, 3, 2] },   // slate blue walls
    henryroom: { wallRow: 13, floor: [14, 11, 3, 2] },  // dark wood + darker stone
    closet:    { wallRow: 19, floor: [14, 9, 3, 2] },   // beige, like the hallway it hides in
  };

  function buildInteriorGround(map, mapName) {
    const w = G.mapW * TS, h = G.mapH * TS;
    const style = ROOM_STYLE[mapName] || ROOM_STYLE.hallway;
    const [fx, fy, fw, fh] = style.floor;
    const ground = makeCanvas(w, h, (ctx) => {
      ctx.imageSmoothingEnabled = false;
      for (let y = 0; y < G.mapH; y++) {
        for (let x = 0; x < G.mapW; x++) {
          const ch = map.tiles[y][x];
          const sx = x * TS, sy = y * TS;

          if (ch === "#" || ch === "K" || ch === "X") {
            // top map row shows the wall's trim course; every other
            // wall cell gets the baseboard course so side and bottom
            // walls read as solid paneling
            blitCell(ctx, IMG.roomBuilder, x % 3, style.wallRow + (y === 0 ? 0 : 1), sx, sy);
            if (ch === "X") {
              // full 1×2 window spanning both wall courses
              ctx.drawImage(IMG.furniture, 9 * T16, 24 * T16, T16, 2 * T16, sx, sy - TS, TS, TS * 2);
            }
            continue;
          }

          // floor everywhere else (doors sit on floor too)
          blitCell(ctx, IMG.roomBuilder, fx + (x % fw), fy + (y % fh), sx, sy);
          if (ch === "d") {
            // LimeZu door is 1×2 — bottom half sits in the cell, top
            // half overlaps the wall above (clips at the canvas edge)
            ctx.drawImage(IMG.furniture, 7 * T16, 8 * T16, T16, 2 * T16, sx, sy - TS, TS, TS * 2);
          }
        }
      }
      // the great hallway keeps its big rug — LimeZu's red & gold one
      if (mapName === "hallway") {
        ctx.drawImage(IMG.furniture, 7 * T16, 15 * T16, 4 * T16, 3 * T16, 6 * TS, 3 * TS, 4 * TS, 3 * TS);
      }
    });
    return { ground, water: [], spawns: [], trees: [], openWater: [], mansionAt: null };
  }

  // Entity sprites that now come from the LimeZu furniture sheet
  // instead of the hand-drawn pixel grids: [cx, cy, w, h] in tiles,
  // plus an optional dy nudge (wall-hung pieces). The personality
  // props (altar, katanas, espresso machine…) stay hand-drawn.
  const FURN = {
    bookshelf:    { r: [5, 13, 2, 3] },
    computerdesk: { r: [3, 3, 2, 2] },
    terrarium:    { r: [2, 24, 1, 2] },
    redlight:     { r: [11, 53, 1, 2] },
    coatrack:     { r: [2, 21, 2, 2] },
    bed:          { r: [13, 0, 2, 3] },
    portrait:     { r: [10, 26, 1, 1], dy: -26 },
    plant:        { r: [11, 44, 1, 2] },
  };
  const furnTexCache = {};
  function furnTex(name) {
    if (furnTexCache[name]) return furnTexCache[name];
    const [cx, cy, fw, fh] = FURN[name].r;
    return (furnTexCache[name] = PIXI.Texture.from(makeCanvas(fw * TS, fh * TS, (g) => {
      g.imageSmoothingEnabled = false;
      g.drawImage(IMG.furniture, cx * T16, cy * T16, fw * T16, fh * T16, 0, 0, fw * TS, fh * TS);
    })));
  }

  // ════════════════════ light sources ════════════════════
  // Soft additive glows that sit over the scene. Each entity sprite
  // listed here emits light; 'flicker' jitters like flame, 'pulse'
  // breathes slowly, 'steady' just glows.
  const glowTexCache = {};
  function glowTex(color, r) {
    const key = color + "_" + r;
    if (glowTexCache[key]) return glowTexCache[key];
    const hex = "#" + color.toString(16).padStart(6, "0");
    return (glowTexCache[key] = PIXI.Texture.from(makeCanvas(r * 2, r * 2, (g) => {
      const grad = g.createRadialGradient(r, r, 2, r, r, r);
      grad.addColorStop(0, hex + "ff");
      grad.addColorStop(0.55, hex + "55");
      grad.addColorStop(1, hex + "00");
      g.fillStyle = grad;
      g.fillRect(0, 0, r * 2, r * 2);
    })));
  }
  const GLOW_SOURCES = {
    candles:      { color: 0xffc270, r: 80,  alpha: 0.30, mode: "flicker" },
    altar:        { color: 0xffc270, r: 55,  alpha: 0.22, mode: "flicker" },
    computerdesk: { color: 0x86c8ff, r: 50,  alpha: 0.18, mode: "pulse" },
    gamingrig:    { color: 0x86c8ff, r: 115, alpha: 0.42, mode: "pulse" },
    terrarium:    { color: 0xffa860, r: 60,  alpha: 0.28, mode: "steady" },
    redlight:     { color: 0xff7060, r: 90,  alpha: 0.30, mode: "pulse" },
    espresso:     { color: 0xffc270, r: 40,  alpha: 0.15, mode: "steady" },
  };

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
    if (FURN[spriteName]) {
      const c = new PIXI.Container();
      const body = new PIXI.Sprite(furnTex(spriteName));
      body.anchor.set(0.5, 1);
      body.position.y = FURN[spriteName].dy || 0;
      c.addChild(body);
      c._body = body;
      c._furn = true;
      return c;
    }
    const c = new PIXI.Container();
    if (FAMILY[spriteName]) {
      // layered sheet character: pack art has its own baked shadow
      const body = new PIXI.Sprite(famTex(spriteName, "down", false));
      body.anchor.set(0.5, FAM_FEET / FAM_CELL);
      c.addChild(body);
      c._body = body;
      c._fam = spriteName;
      return c;
    }
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
          grad.addColorStop(0, "rgba(255,236,170,0.09)");
          grad.addColorStop(1, "rgba(255,236,170,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(bx, 0); ctx.lineTo(bx + 70, 0);
          ctx.lineTo(bx + 210, VIEW_H); ctx.lineTo(bx + 80, VIEW_H);
          ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = "rgba(255,225,150,0.04)";
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
  const waterLayer = new PIXI.Container();   // animated water cells + fish
  const decorLayer = new PIXI.Container();   // ground-hugging animated decor
  const glowSprite = new PIXI.Sprite(PIXI.Texture.from(GLOW_CANVAS));
  glowSprite.anchor.set(0.5);
  glowSprite.visible = false;
  const entLayer = new PIXI.Container();     // trees, mansion, characters — depth-sorted
  entLayer.sortableChildren = true;
  const lightFx = new PIXI.Container();      // additive glows over the scene
  const butterflyLayer = new PIXI.Container();
  const fxG = new PIXI.Graphics();
  const labelLayer = new PIXI.Container();
  world.addChild(groundSprite, waterLayer, decorLayer, glowSprite, entLayer, lightFx, butterflyLayer, fxG, labelLayer);

  // gentle per-theme color grading over the whole world
  const grade = new PIXI.ColorMatrixFilter();
  world.filters = [grade];

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
  let waterSprites = [], decorSprites = [], sceneSprites = [], smokeSprites = [];
  let entitySprites = [], labels = [], butterflies = [];
  let openWaterCells = [], fish = null;
  let glowFx = [], motes = [];
  let runnerC = null;

  function rebuildMap() {
    lastMap = G.mapName;
    const { ground, water, spawns, trees, openWater, mansionAt } = buildGround(G.map, G.mapName);
    groundSprite.texture = PIXI.Texture.from(ground);

    // animated water, one sprite per cell — all cells share the same
    // frame clock so the tiling stays seamless
    waterLayer.removeChildren();
    waterSprites = water.map(({ x, y, spec }) => {
      const sp = new PIXI.Sprite();
      sp._frames = waterCellTextures(spec);
      sp.texture = sp._frames[0];
      sp.position.set(x * TS, y * TS);
      waterLayer.addChild(sp);
      return sp;
    });

    // the jumping fish (one at a time, somewhere in open water)
    openWaterCells = openWater;
    fish = null;
    if (openWater.length) {
      const sp = new PIXI.Sprite(FISH_TEX[0]);
      sp.visible = false;
      waterLayer.addChild(sp);
      fish = { sp, nextAt: G.tick + 200, start: -1 };
    }

    // ground-hugging animated decor (flowers, tall grass, lily pads…)
    decorLayer.removeChildren();
    decorSprites = spawns.map(({ kind, px, py, ph }) => {
      const sp = new PIXI.Sprite(DECOR_TEX[kind][0]);
      sp._frames = DECOR_TEX[kind];
      sp._ph = ph;
      sp._spd = DECOR_SPEED[kind] || 16;
      sp.position.set(px, py);
      decorLayer.addChild(sp);
      return sp;
    });

    // depth-sorted scenery: trees + the mansion
    sceneSprites = trees.map(({ type, cx, baseY, flip }) => {
      const sp = new PIXI.Sprite(TREE_TEX[type]);
      sp.anchor.set(0.5, 1);
      sp.position.set(cx, baseY + 6);
      if (flip) sp.scale.x = -1;
      sp.zIndex = baseY - TS;
      return sp;
    });
    smokeSprites = [];
    if (mansionAt) {
      const mx = mansionAt.x * TS, my = mansionAt.y * TS;
      const m = new PIXI.Sprite(MANSION_TEX);
      m.position.set(mx, my);
      m.zIndex = my + 10 * TS; // behind anything walking on the doormat row
      sceneSprites.push(m);
      // chimney smoke, one plume per chimney (offsets within the Inn art)
      for (const [ox, oy, ph] of [[60, 82, 0], [317, 64, 3]]) {
        const sp = new PIXI.Sprite(SMOKE_TEX[0]);
        sp.anchor.set(0.5, 1);
        sp.position.set(mx + ox, my + oy);
        sp.zIndex = m.zIndex + 1;
        sp._ph = ph;
        smokeSprites.push(sp);
        sceneSprites.push(sp);
      }
    }

    lightSprite.texture = PIXI.Texture.from(buildLight(G.map.theme));

    // ── lighting pass: glow sources, window pools, motes, grading ──
    lightFx.removeChildren();
    glowFx = [];
    for (const e of G.entities) {
      const s = GLOW_SOURCES[e.sprite];
      if (!s) continue;
      const sp = new PIXI.Sprite(glowTex(s.color, s.r));
      sp.anchor.set(0.5);
      sp.blendMode = "add";
      sp.position.set(e.px + TS / 2, e.py + TS / 2 - 8);
      sp.alpha = s.alpha;
      sp._glow = s;
      sp._ph = hash(e.x, e.y) * Math.PI * 2;
      lightFx.addChild(sp);
      glowFx.push(sp);
    }
    if (G.map.theme !== "exterior") {
      for (let y = 0; y < G.mapH; y++)
        for (let x = 0; x < G.mapW; x++)
          if (G.map.tiles[y][x] === "X") {
            const sp = new PIXI.Sprite(glowTex(0xffe2a8, 65));
            sp.anchor.set(0.5);
            sp.blendMode = "add";
            sp.position.set(x * TS + TS / 2, (y + 1.7) * TS);
            sp.alpha = 0.10;
            lightFx.addChild(sp);
          }
    }
    motes = [];
    if (G.map.theme !== "exterior" && G.map.theme !== "dojo") {
      for (let i = 0; i < 10; i++) {
        motes.push({
          x: Math.random() * G.mapW * TS,
          y: Math.random() * G.mapH * TS,
          ph: Math.random() * Math.PI * 2,
        });
      }
    }
    grade.reset();
    if (G.map.theme === "exterior") {
      grade.saturate(0.12, true);
      grade.brightness(1.02, true);
    } else if (G.map.theme === "dojo") {
      grade.saturate(-0.12, true);
      grade.brightness(0.94, true);
      grade.contrast(0.08, true);
    } else {
      grade.saturate(0.06, true);
    }

    butterflyLayer.removeChildren();
    butterflies = [];
    if (G.map.theme === "exterior") {
      for (let i = 0; i < 14; i++) {
        const sp = new PIXI.Sprite(BUTTERFLY_TEX[i % 6][0]);
        sp.anchor.set(0.5);
        butterflyLayer.addChild(sp);
        butterflies.push({
          sp, color: i % 6,
          x: (2 + Math.random() * (G.mapW - 8)) * TS,
          y: (2 + Math.random() * (G.mapH - 4)) * TS,
          a: Math.random() * Math.PI * 2,
          ph: (Math.random() * 2) | 0,
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
    for (const sp of sceneSprites) entLayer.addChild(sp);
    for (const e of G.entities) {
      const c = makeCharacter(e.sprite);
      if (e.big) c.scale.set(e.big); // landmarks like the memorial and the hoop
      placeChar(c, e.px, e.py);
      entLayer.addChild(c);
      entitySprites.push({ e, c });
      if (e.label) {
        const grid = FAMILY[e.sprite] ? { length: 24 } : SPRITES[e.sprite].down;
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
        glowSprite.scale.set(e.big || 1);
        glowSprite.position.set(e.px + TS / 2, e.py + TS / 2 - 10 - (e.big ? 28 : 0));
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

    // ── ambient animation clocks ──
    // water: all cells share one frame so edges tile seamlessly
    const wf = ((G.tick / 12) | 0) % WATER_FRAMES;
    for (const sp of waterSprites) sp.texture = sp._frames[wf];
    // decor sways at its own kind's pace, phased per sprite so the
    // meadow doesn't march in step
    for (const sp of decorSprites) {
      sp.texture = sp._frames[(((G.tick / sp._spd) | 0) + sp._ph) % sp._frames.length];
    }
    const sf = (G.tick / 12) | 0;
    for (const sp of smokeSprites) sp.texture = SMOKE_TEX[(sf + sp._ph) % SMOKE_TEX.length];
    // the fish: surfaces somewhere in open water every few seconds
    if (fish) {
      if (fish.start < 0 && G.tick >= fish.nextAt) {
        const c = openWaterCells[(Math.random() * openWaterCells.length) | 0];
        fish.sp.position.set(c.x * TS, c.y * TS);
        fish.sp.visible = true;
        fish.start = G.tick;
      }
      if (fish.start >= 0) {
        const f = ((G.tick - fish.start) / 5) | 0;
        if (f >= FISH_TEX.length) {
          fish.sp.visible = false;
          fish.start = -1;
          fish.nextAt = G.tick + 300 + Math.random() * 700;
        } else {
          fish.sp.texture = FISH_TEX[f];
        }
      }
    }

    // entities (furniture sprites keep their sheet texture)
    for (const { e, c } of entitySprites) {
      if (c._fam) {
        const dir = e.dir || "down";
        c._body.texture = famTex(c._fam, dir, !!e.moving);
        c._body.scale.x = dir === "right" ? -1 : 1; // side art faces left
      } else if (!c._furn) {
        c._body.texture = charTex(e.sprite, e.dir || "down", 0);
      }
      placeChar(c, e.px, e.py);
    }
    for (const { e, t, hPx } of labels) {
      t.position.set(e.px + TS / 2, e.py - (hPx - TS) - 4);
    }

    // player
    if (playerC._fam) {
      playerC._body.texture = famTex("dominique", p.facing, p.moving);
      playerC._body.scale.x = p.facing === "right" ? -1 : 1; // side art faces left
    } else {
      playerC._body.texture = charTex("dominique", p.facing, p.moving ? p.step : 0);
      playerC._body.scale.x = p.facing === "left" ? -1 : 1;
    }
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

    // light sources: candle flicker / slow pulses
    for (const sp of glowFx) {
      const s = sp._glow;
      if (s.mode === "flicker") {
        sp.alpha = s.alpha * (0.82 + 0.13 * Math.sin(G.tick * 0.31 + sp._ph) + 0.08 * Math.sin(G.tick * 0.83 + sp._ph * 3));
      } else if (s.mode === "pulse") {
        sp.alpha = s.alpha * (0.85 + 0.15 * Math.sin(G.tick / 38 + sp._ph));
      }
    }

    // sparkles + butterflies
    fxG.clear();
    for (const e of G.entities) {
      if ((e.itemId && !G.state.taken.has(e.itemId)) || e.portal) drawSparkle(e.px, e.py, e.x * 3);
    }
    for (const b of butterflies) {
      b.a += 0.03;
      b.x += Math.cos(b.a) * 0.7;
      b.y += Math.sin(b.a * 1.3) * 0.5;
      b.sp.position.set(b.x, b.y);
      b.sp.texture = BUTTERFLY_TEX[b.color][(((G.tick / 7) | 0) + b.ph) % 2];
      b.sp.scale.x = Math.cos(b.a) < 0 ? -1 : 1; // face the way it drifts
    }

    // dust motes drifting through the light
    for (const m of motes) {
      m.y -= 0.12;
      m.x += Math.sin(G.tick / 60 + m.ph) * 0.15;
      if (m.y < 0) { m.y = G.mapH * TS; m.x = Math.random() * G.mapW * TS; }
      const a = 0.10 + 0.08 * Math.sin(G.tick / 30 + m.ph);
      fxG.rect(m.x, m.y, 2, 2).fill({ color: 0xfff4d8, alpha: a });
    }

    // red flash
    flashG.clear();
    if (G.flashRed > 0) {
      flashG.rect(0, 0, VIEW_W, VIEW_H).fill({ color: 0xdc2828, alpha: (G.flashRed / 50) * 0.4 });
    }
  });
})();
