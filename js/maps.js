// ============================================================
// maps.js — the world. Tile characters:
//   g grass   f grass+flowers   t tree (solid)   w water (solid)
// Entities stand ON tiles and are examined with SPACE.
// ============================================================

const MAPS = {

  gallery: {
    name: "Sprite Gallery",
    tiles: [
      "tttttttttttttttttttttttttt",
      "tggggfgggggggggggggfgggggt",
      "tggggggggggggggggggggggggt",
      "tgfgggggggggggggggggggfggt",
      "tggggggggggggggggggggggggt",
      "tggggggggggggggggggggggggt",
      "tggggggggggggggggggggggggt",
      "tggfgggggggfggggggggggfggt",
      "tggggggggggggggggggggggggt",
      "tggggggggggggggggggggggggt",
      "tggggggggggggggggggggggggt",
      "tgggggfgggggggggggggfggggt",
      "tggggggggggggggggggggggggt",
      "tggggggggggggggggggggggggt",
      "twwwggfgggggggggggggggfggt",
      "tttttttttttttttttttttttttt",
    ],
    playerStart: { x: 12, y: 11 },
    entities: [
      {
        x: 12, y: 9, sprite: "sign", name: "Wooden Sign",
        lines: [
          "SPRITE GALLERY — the test chamber.",
          "Walk with ARROW KEYS (or WASD).\nPress SPACE to talk to your family.",
          "(This is where Luke checks that everyone\nactually looks like themselves.)",
        ],
      },
      {
        x: 4, y: 5, sprite: "luke", name: "Luke",
        lines: [
          "Hey Dom. Welcome to the test chamber.",
          "I'm still building the real thing — this is\njust the part where you tell me my pixel\nhair looks wrong.",
          "(Note the camera. The camera is essential.)",
        ],
      },
      {
        x: 7, y: 5, sprite: "mom", name: "Mom",
        lines: [
          "Oh good, you're here! Quick question —",
          "do you think this field would look better\nif I moved that tree... three feet to\nthe left?",
          "Hold on. I'm moving it.",
        ],
      },
      {
        x: 10, y: 5, sprite: "dad", name: "Dad",
        lines: [
          "I jogged here.",
          "It took four hours.",
          "...Where's the couch?",
        ],
      },
      {
        x: 13, y: 5, sprite: "henry", name: "Henry",
        lines: [
          "Yo.",
          "Lumpy wanted to see you. He's been\ntraining.",
          "(Henry is 6'4\" in this game.\nHe requested it.)",
        ],
      },
      {
        x: 16, y: 5, sprite: "ruthvik", name: "Ruthvik",
        lines: [
          "Hey hey! Great to see you!",
          "I gave this field a 9.7 on the podcast.\nSolid fundamentals. Great spacing.",
          "Very level-headed take, I thought.",
        ],
      },
      {
        x: 19, y: 5, sprite: "booboo", name: "Boo-Boo",
        lines: [
          "Boo-Boo.",
          "A very good bunny.",
          "She watches over this world.",
        ],
      },
      {
        x: 21, y: 5, sprite: "lumpy", name: "Lumpy",
        lines: [
          "Lumpy the leopard gecko stares at you.",
          "...",
          "He's deciding if you're worthy.\n(You are. He'll ride on your shoulder\nin the real game.)",
        ],
      },
    ],
  },
};
