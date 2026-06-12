// ============================================================
// family.js — Step 5: family characters built on the Cute
// Fantasy layered player system (base body + hair + clothes,
// each a same-size sheet that stacks like a paper doll).
//
// layers: files in assets/family/ (gitignored, see
//   scripts/restore-assets.sh), composited bottom-up.
// deco: hand-pixeled likeness details stamped onto the
//   composite per animation frame, following the body's bob —
//   this is where the family jokes live (gown panel, glasses,
//   camera...). Coordinates are raw sheet pixels within a
//   64×64 frame: the body stands roughly x25-39, y24-46.
//   Keyed by facing; "side" art faces left and is mirrored
//   by the renderer for the other direction.
// ============================================================

const FAMILY = {
  // Dominique in her black TCOM grad gown: black outfit with the
  // green velvet front panel stamped over the shirt.
  dominique: {
    layers: ["base", "pants-black", "shoes-black", "shirt-black", "hair4-brown"],
    deco: {
      // body box per frame is x25-37, y23-40 (head ~23-31, torso ~32-38)
      down: [
        { x: 30, y: 33, w: 3, h: 5, color: "#1f8a55" },  // gown panel
        { x: 30, y: 33, w: 3, h: 1, color: "#2fae6e" },  // collar trim
      ],
      side: [
        { x: 28, y: 33, w: 2, h: 5, color: "#1f8a55" },  // panel, front edge (faces left)
      ],
      up: [],
    },
  },
};

// Frames-per-row layout of every Cute Fantasy player sheet:
// row 0/1/2 = idle down/side/up, row 3/4/5 = walk down/side/up,
// 6 frames each, 64×64 per frame.
const FAM_ROWS = { idle: { down: 0, side: 1, up: 2 }, walk: { down: 3, side: 4, up: 5 } };
const FAM_FRAMES = 6, FAM_CELL = 64;
