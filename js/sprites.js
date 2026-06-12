// ============================================================
// sprites.js — every character drawn as pixel data.
// Each sprite is a grid of characters; the legend maps a
// character to a color. '.' means transparent.
// ============================================================

const SPRITES = {

  // ---------- DOMINIQUE (the player, in her TCOM grad gown) ----------
  dominique: {
    legend: {
      H: "#5d3f28", h: "#a87850",            // hair + caramel highlight
      F: "#f2c9a4", E: "#2f211a", M: "#cd8577",
      G: "#23232e",                          // gown black
      P: "#1f8a55", S: "#2fae6e",            // TCOM green panel + cuff
      B: "#3a2f28",                          // shoes
    },
    down: [
      "................",
      ".....HHHHHH.....",
      "....HHHHHHHH....",
      "...HHHhHHhHHH...",
      "...HHFFFFFFHH...",
      "...HHFEFFEFHH...",
      "...HHFFFFFFHH...",
      "...HHFFMMFFHH...",
      "....HFFFFFFH....",
      "....HHFFFFHH....",
      "...HHGGPPGGHH...",
      "..HHGGGPPGGGHH..",
      "..HHGGGPPGGGHH..",
      "..HhGGGPPGGGhH..",
      "..hSGGGPPGGGSh..",
      "...FGGGPPGGGF...",
      "....GGGPPGGG....",
      "....GGGPPGGG....",
      "...GGGGPPGGGG...",
      "...GGGGPPGGGG...",
      "..GGGGGPPGGGGG..",
      "..GGGGGPPGGGGG..",
      "....BB....BB....",
      "................",
    ],
    up: [
      "................",
      ".....HHHHHH.....",
      "....HHHHHHHH....",
      "...HHHHHHHHHH...",
      "...HHhHHHHhHH...",
      "...HHHHHHHHHH...",
      "...HHHHHHHHHH...",
      "...HHHHHHHHHH...",
      "....HHHHHHHH....",
      "....HHHHHHHH....",
      "...HHHHHHHHHH...",
      "..HHHHHHHHHHHH..",
      "..HHGGGGGGGGHH..",
      "..HhGGGGGGGGhH..",
      "..hSGGGGGGGGSh..",
      "...FGGGGGGGGF...",
      "....GGGGGGGG....",
      "....GGGGGGGG....",
      "...GGGGGGGGGG...",
      "...GGGGGGGGGG...",
      "..GGGGGGGGGGGG..",
      "..GGGGGGGGGGGG..",
      "....BB....BB....",
      "................",
    ],
    side: [ // drawn facing RIGHT; engine mirrors for left
      "................",
      ".....HHHHHH.....",
      "....HHHHHHHH....",
      "....HHHHHHhH....",
      "....HHFFFFFF....",
      "....HHFFEFF.....",
      "....HHFFFFFF....",
      "....HHFFFMF.....",
      "....HHFFFFF.....",
      "....HHHFFFF.....",
      "....HHGGGPG.....",
      "...HHGGGGPPG....",
      "...HHGGGGPPG....",
      "...HhGGGGPPG....",
      "...hGGGGGPPG....",
      "....GSGGGPPG....",
      "....GFGGGPPG....",
      "....GGGGGPPG....",
      "....GGGGGPPG....",
      "...GGGGGGPPGG...",
      "...GGGGGGPPGG...",
      "..GGGGGGGPPGGG..",
      ".....BBBB.......",
      "................",
    ],
    feetRow: 22,
    feetAlt: "...BB......BB...",
  },

  // ---------- LUKE (twin brother, camera around neck) ----------
  luke: {
    legend: {
      H: "#3b2a1e", F: "#eac393", E: "#2f211a", M: "#b06a5a",
      C: "#5a5f66", c: "#494e54",            // charcoal knit sweater
      N: "#2c3550",                          // navy tee at collar
      K: "#17171b", k: "#8fa3b8",            // camera body + lens
      O: "#23242a",                          // black shorts
      D: "#7a5639",                          // birkenstocks
    },
    down: [
      "................",
      "....HHHHHHHH....",
      "...HHHHHHHHHH...",
      "...HHHHHHHHHH...",
      "...HHHHHHHHHH...",
      "...HFHFFFFHFH...",
      "...HFEFFFFEFH...",
      "....FFFFFFFF....",
      "....FFFMMFFF....",
      "....CFFFFFFC....",
      "...CCCNNNNCCC...",
      "..CCCCCCCCCCCC..",
      "..CcCCCCCCCCcC..",
      "..CcCCKKKKCCcC..",
      "..FcCCKkkKCCcF..",
      "..F.CCKKKKCC.F..",
      "....CCCCCCCC....",
      "....cCCCCCCc....",
      "....OOOOOOOO....",
      "....OOO..OOO....",
      "....FFF..FFF....",
      "....FFF..FFF....",
      "....DDD..DDD....",
      "................",
    ],
  },

  // ---------- MOM (Swedish, blonde, artist, gold heart pendant) ----------
  mom: {
    legend: {
      Y: "#e8d27a", y: "#cdb159",            // blonde + shade
      F: "#f4cfae", E: "#3a5a7a", M: "#c47b6b",
      Z: "#26262c",                          // black blazer
      W: "#3a3a42",                          // tee underneath
      g: "#e0a93c",                          // gold heart pendant
      P: "#2c2c34", B: "#1d1d22",
    },
    down: [
      "................",
      ".....YYYYYY.....",
      "....YYYYYYYY....",
      "...YYYYYYYYYY...",
      "...YYyYYYYyYY...",
      "...YFFFFFFFFY...",
      "...YFEFFFFEFY...",
      "...YFFFFFFFFY...",
      "...YFFFMMFFFY...",
      "....YFFFFFFY....",
      "...YZZZZZZZZY...",
      "..YZZZWWWWZZZY..",
      "..YZZZWggWZZZY..",
      "..yZZZWWWWZZZy..",
      "..FZZZWWWWZZZF..",
      "..F.ZZWWWWZZ.F..",
      "....ZZZZZZZZ....",
      "....ZZZZZZZZ....",
      "....PPPPPPPP....",
      "....PPP..PPP....",
      "....PPP..PPP....",
      "....PPP..PPP....",
      "....BBB..BBB....",
      "................",
    ],
  },

  // ---------- DAD (square face, round glasses a bit too small) ----------
  dad: {
    legend: {
      G: "#8a8a8a", g: "#d8d8d8",            // salt-and-pepper
      F: "#e9b98a", E: "#2f211a", M: "#a8645a",
      O: "#1c1c20",                          // round glasses rims
      V: "#2b3a5e",                          // navy blazer
      p: "#f2c9cf",                          // pink button-down
      K: "#b9a37e", B: "#3a2f28",            // khakis + shoes
    },
    down: [
      "................",
      "....GGGGGGGG....",
      "...GgGGGGGGgG...",
      "...GGGGGGGGGG...",
      "..GFFFFFFFFFFG..",
      "..GFOOFFFFOOFG..",
      "..GFOEOFFOEOFG..",
      "..GFOOFFFFOOFG..",
      "..GFFFFFFFFFFG..",
      "..GFFFFMMFFFFG..",
      "...FFFFFFFFFF...",
      "...VVVppppVVV...",
      "..VVVVppppVVVV..",
      "..VVVVppppVVVV..",
      "..FVVVppppVVVF..",
      "..F.VVppppVV.F..",
      "....VVppppVV....",
      "....VVVVVVVV....",
      "....KKKKKKKK....",
      "....KKK..KKK....",
      "....KKK..KKK....",
      "....KKK..KKK....",
      "....BBB..BBB....",
      "................",
    ],
  },

  // ---------- RUTHVIK (beard, light-blue striped button-down) ----------
  ruthvik: {
    legend: {
      R: "#171717", b: "#2a2118",            // hair + beard
      F: "#caa07a", E: "#2f211a", M: "#9a5a4a",
      L: "#a8c8e8", W: "#ffffff",            // shirt + stripes
      P: "#2e3138", B: "#1d1d22",
    },
    down: [
      "................",
      ".....RRRRRR.....",
      "....RRRRRRRR....",
      "....RRRRRRRR....",
      "....RFFFFFFR....",
      "....RFEFFEFR....",
      "....FFFFFFFF....",
      "....bFFFFFFb....",
      "....bbFMMFbb....",
      "....bbbbbbbb....",
      "....LLLLLLLL....",
      "...LWLLWLLWLL...",
      "..LLWLLWLLWLLL..",
      "..LLWLLWLLWLLL..",
      "..FLWLLWLLWLLF..",
      "..F.LLLLLLLL.F..",
      "....LLLLLLLL....",
      "....LLLLLLLL....",
      "....PPPPPPPP....",
      "....PPP..PPP....",
      "....PPP..PPP....",
      "....PPP..PPP....",
      "....BBB..BBB....",
      "................",
    ],
  },

  // ---------- HENRY (28px tall — he requested it) ----------
  henry: {
    legend: {
      H: "#241a12", F: "#ecc8a2", E: "#2f211a", M: "#b06a5a",
      S: "#1d1d22",                          // black button shirt
      r: "#c43c3c",                          // rising-sun fox tattoo
      P: "#26262e", B: "#17171b",
    },
    down: [
      "................",
      ".....HHHHHH.....",
      "....HHHHHHHH....",
      "...HHHHHHHHHH...",
      "...HHHHHHHHHH...",
      "...HHFFFFFFHH...",
      "...HHFEFFEFHH...",
      "...HHFFFFFFHH...",
      "...HHFFMMFFHH...",
      "....HFFFFFFH....",
      "...HHSSSSSSHH...",
      "..HHSSSSSSSSHH..",
      "..HHSSSSSSSSHH..",
      "..HFSSSSSSSSrH..",
      "..HFSSSSSSSSrH..",
      "..HF.SSSSSS.FH..",
      "..F..SSSSSS..F..",
      ".....SSSSSS.....",
      "....PPPPPPPP....",
      "....PPPPPPPP....",
      "....PPP..PPP....",
      "....PPP..PPP....",
      "....PPP..PPP....",
      "....PPP..PPP....",
      "....PPP..PPP....",
      "....BBB..BBB....",
      "....BBB..BBB....",
      "................",
    ],
  },

  // ---------- BOO-BOO (a very good bunny) ----------
  booboo: {
    legend: {
      W: "#f5f2ec", w: "#ddd6c8",
      p: "#e8b0b8", E: "#2f211a", N: "#d88a96",
    },
    down: [
      "............",
      "...W....W...",
      "..WpW..WpW..",
      "..WpW..WpW..",
      "..WWWWWWWW..",
      ".WWWWWWWWWW.",
      ".WWEWWWWEWW.",
      ".WWWWNNWWWW.",
      ".WWWWWWWWWW.",
      ".WwWWWWWWwW.",
      "..WWWWWWWW..",
      "..ww....ww..",
    ],
  },

  // ---------- LUMPY (Henry's leopard gecko) ----------
  lumpy: {
    legend: {
      L: "#c8c84e", l: "#a8a83e",
      s: "#4a4a22", E: "#1d1d12",
    },
    down: [
      "............",
      "..LL........",
      ".LELL.......",
      "..LLLLLLL...",
      "..LsLLsLLL..",
      "..LLLLLLsLL.",
      "...lLLlLLLL.",
      ".........ll.",
    ],
  },

  // ---------- WOODEN SIGN ----------
  sign: {
    legend: {
      W: "#6b4a2f", w: "#9a713f", x: "#b8915a",
    },
    down: [
      "................",
      "..WWWWWWWWWWWW..",
      ".WwwwwwwwwwwwwW.",
      ".WwxwwxwwxwwxwW.",
      ".WwwwwwwwwwwwwW.",
      ".WwxwwxwwxwwwwW.",
      ".WwwwwwwwwwwwwW.",
      "..WWWWWWWWWWWW..",
      "......WW........",
      "......WW........",
      "......WW........",
      "................",
    ],
  },
};

// Warn loudly (via the error banner) if any sprite row has a typo'd width.
(function validateSprites() {
  for (const name in SPRITES) {
    const s = SPRITES[name];
    for (const dir of ["down", "up", "side"]) {
      if (!s[dir]) continue;
      const w = s[dir][0].length;
      s[dir].forEach((row, i) => {
        if (row.length !== w) {
          throw new Error("sprite '" + name + "' " + dir + " row " + i +
            " is " + row.length + " chars, expected " + w);
        }
      });
    }
  }
})();
