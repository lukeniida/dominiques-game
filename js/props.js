// ============================================================
// props.js — furniture, treasures, and set dressing.
// Same pixel-grid format as the characters in sprites.js.
// ============================================================

Object.assign(SPRITES, {

  // ---------- Luke's room ----------
  planets: { // hanging solar system mobile
    legend: { B: "#5a4a3a", J: "#d8975a", j: "#b87840", S: "#e8c878", R: "#c45a4a", E: "#4a90c8", s: "#f5f2ec" },
    down: [
      "BBBBBBBBBBBBBB",
      "..B....B....B.",
      "..B....B....B.",
      ".JJJ...B...RR.",
      "JJjJJ.SSS..RR.",
      ".JJJ..SSS.....",
      "......SSS..EE.",
      "...........EE.",
      ".s.....s......",
    ],
  },
  bookshelf: {
    legend: { W: "#6b4a2f", w: "#54391f", r: "#c45a4a", b: "#4a78b8", g: "#5a9a4a", y: "#e8c858", p: "#9a6ac8" },
    down: [
      "WWWWWWWWWWWWWW",
      "Wrbgyprbgyprbw",
      "Wrbgyprbgyprbw",
      "WWWWWWWWWWWWWW",
      "Wybprgybprgybw",
      "Wybprgybprgybw",
      "WWWWWWWWWWWWWW",
      "Wgyrbpggyrbgpw",
      "WgyrbpggyrbgpW",
      "WWWWWWWWWWWWWW",
      "ww..........ww",
    ],
  },
  guitar: {
    legend: { W: "#b87840", w: "#8a5a2a", n: "#3a2a1a", s: "#e8e0d0" },
    down: [
      "....nn....",
      "....ss....",
      "....ss....",
      "....ss....",
      "...WWWW...",
      "..WWssWW..",
      ".WWWssWWW.",
      ".WWWwwWWW.",
      ".WWWWWWWW.",
      "..WWWWWW..",
      "...WWWW...",
    ],
  },
  candles: {
    legend: { c: "#f0e8d0", f: "#f0a83c", F: "#f5d058", w: "#8a5a3a" },
    down: [
      "..F...F...F.",
      "..f...f...f.",
      "..c...c...c.",
      "..c.F.c.F.c.",
      "..c.f.c.f.c.",
      "..c.c.c.c.c.",
      "wwwwwwwwwwww",
      ".wwwwwwwwww.",
    ],
  },
  altar: {
    legend: { p: "#b89ae8", P: "#8a6ac8", w: "#7a5a3a", s: "#e8e0d0", g: "#e8c858" },
    down: [
      "....p....P....",
      "...ppp..PPP...",
      "..ppppp.PPP...",
      ".s..g......s..",
      "wwwwwwwwwwwwww",
      ".wwwwwwwwwwww.",
      ".ww........ww.",
    ],
  },
  computerdesk: {
    legend: { m: "#2a2a36", s: "#7ac0e8", k: "#d8d0c0", w: "#6b4a2f", o: "#e8975a" },
    down: [
      "..mmmmmmmmmm..",
      "..mssssssssm..",
      "..mssossossm..",
      "..mssssssssm..",
      "..mmmmmmmmmm..",
      "......mm......",
      "wwwwwwwwwwwwww",
      "wkkkkkkk..kkkw",
      "ww..........ww",
      "ww..........ww",
    ],
  },
  notebook: { // ITEM — Luke's poetry notebook
    legend: { c: "#c45a4a", p: "#f5ecd8", l: "#8a5a3a" },
    down: [
      "..cccccccc..",
      ".cpppppppcc.",
      ".cpllllppcc.",
      ".cpppppppcc.",
      ".cplllpppcc.",
      ".cpppppppcc.",
      "..cccccccc..",
    ],
  },

  // ---------- Mom's room ----------
  easel: {
    legend: { w: "#a87f4e", W: "#8a653a", c: "#f5f2ec", b: "#4a90c8", g: "#5a9a4a", o: "#e8975a" },
    down: [
      "....wwwww.....",
      "...wcccccw....",
      "...wcbbgcw....",
      "...wcbggcw....",
      "...wcoogcw....",
      "...wcccccw....",
      "....w...w.....",
      "...w.....w....",
      "...w.....w....",
      "..w.......w...",
      "..w.......w...",
      ".w.........w..",
    ],
  },
  angelshelf: {
    legend: { w: "#8a653a", a: "#f5f2ec", g: "#e8c858", h: "#f0d8b8" },
    down: [
      ".g...g...g....",
      "aaa.aaa.aaa...",
      ".a...a...a....",
      "aaa.aaa.aaa...",
      "wwwwwwwwwwwwww",
      ".w..........w.",
    ],
  },
  redlight: {
    legend: { f: "#e85a6a", F: "#f08a98", m: "#3a3a42", s: "#6a6a72" },
    down: [
      ".mmmmmmmm.",
      ".mFFffFFm.",
      ".mfFFFFfm.",
      ".mFFffFFm.",
      ".mfFFFFfm.",
      ".mFFffFFm.",
      ".mmmmmmmm.",
      "....ss....",
      "....ss....",
      "...ssss...",
    ],
  },
  kintsugiheart: { // ITEM — Mom's mended metal heart
    legend: { m: "#8a8a96", M: "#6a6a76", g: "#e8c040", G: "#f5d868" },
    down: [
      "..mmm..mmm..",
      ".mmmmmgmmmm.",
      ".mmmmGgmmmm.",
      ".mmmmgGmmmm.",
      "..mmmgmmmm..",
      "...mmGgmm...",
      "....mgm.....",
      ".....g......",
    ],
  },
  note: {
    legend: { p: "#f5ecd8", l: "#5a5a6a" },
    down: [
      "pppppppp",
      "pllllllp",
      "ppppplpp",
      "pllllllp",
      "pppllppp",
      "pppppppp",
    ],
  },

  // ---------- Dad's room ----------
  bed: {
    legend: { w: "#6b4a2f", s: "#f0ece0", b: "#4a78b8", p: "#f5f2ec" },
    down: [
      "wwwwwwwwwwwwwwww",
      "wppppssssssssssw",
      "wppppssssssssssw",
      "wbbbbbbbbbbbbbbw",
      "wbbbbbbbbbbbbbbw",
      "wbbbbbbbbbbbbbbw",
      "wbbbbbbbbbbbbbbw",
      "wwwwwwwwwwwwwwww",
      "w..............w",
    ],
  },
  dadcouch: { // Dad IS the couch now. The couch is Dad.
    legend: {
      c: "#7a5a4a", C: "#65483a", u: "#9a7a62",
      G: "#8a8a8a", F: "#e9b98a", V: "#2b3a5e", p: "#f2c9cf", O: "#1c1c20",
    },
    down: [
      "cccccccccccccccccccc",
      "cuuuuuuuuuuuuuuuuuuc",
      "cu.GGG.............c",
      "cuGGGGG............c",
      "cuGFOFFVVVVVVVVppp.c",
      "cuGFFFFVVVVVVVVppp.c",
      "cu.FF..VVVVVVVV....c",
      "cCCCCCCCCCCCCCCCCCCc",
      "cCCCCCCCCCCCCCCCCCCc",
      "cc..cc........cc..cc",
    ],
  },
  granola: {
    legend: { g: "#d8a85a", j: "#b8d8e8", w: "#8a5a3a", l: "#f5ecd8" },
    down: [
      "..jjjj..",
      ".jwwwwj.",
      ".jggggj.",
      ".jggggj.",
      ".jlggljj",
      ".jggggj.",
      "..jjjj..",
    ],
  },
  glassesrack: {
    legend: { w: "#6b4a2f", o: "#1c1c20", g: "#b8d8e8" },
    down: [
      "wwwwwwwwwwwwww",
      "w.oo.oo.oo.oow",
      "w.og.go.og.gow",
      "w.oo.oo.oo.oow",
      "wwwwwwwwwwwwww",
      "w.oo.oo.oo.oow",
      "w.og.go.og.gow",
      "w.oo.oo.oo.oow",
      "wwwwwwwwwwwwww",
    ],
  },
  shoerack: {
    legend: { w: "#6b4a2f", r: "#e85a4a", b: "#4a78b8", s: "#f5f2ec" },
    down: [
      "wwwwwwwwwwwwww",
      "w.rrs.bbs.rrsw",
      "w.rrs.bbs.rrsw",
      "wwwwwwwwwwwwww",
      "w.bbs.rrs.bbsw",
      "w.bbs.rrs.bbsw",
      "wwwwwwwwwwwwww",
    ],
  },
  thinker: {
    legend: { s: "#9a9aa6", S: "#7a7a88", b: "#5a5a66" },
    down: [
      "....ssss....",
      "....ssss....",
      ".....ss.....",
      "...ssSss....",
      "..ssssSs....",
      "..s.ssSs....",
      "....ssss....",
      "...ssssss...",
      "..sss..sss..",
      ".bbbbbbbbbb.",
      ".bbbbbbbbbb.",
    ],
  },
  espresso: {
    legend: { m: "#3a3a42", s: "#8a8a96", c: "#f5ecd8", k: "#6b4a2f" },
    down: [
      ".mmmmmmmmmm.",
      ".mssssssssm.",
      ".mmmmmmmmmm.",
      ".m.c....c.m.",
      ".m.c....c.m.",
      ".mmmmmmmmmm.",
      "kkkkkkkkkkkk",
    ],
  },
  lockedphoto: { // ITEM — framed photo of the locked back door
    legend: { f: "#e8c858", p: "#d8d0c0", d: "#6b4a2f", k: "#3a2a1a" },
    down: [
      "ffffffffff",
      "fppppppppf",
      "fpppdddppf",
      "fppdddkppf",
      "fppdddpppf",
      "fppppppppf",
      "ffffffffff",
    ],
  },

  // ---------- Henry's dojo ----------
  gamingrig: {
    legend: { m: "#1d1d26", s: "#5a8ae8", S: "#8a5ae8", k: "#2e2e3a", w: "#3a3a46" },
    down: [
      "mmmmm.mmmmm.mmmm",
      "msssm.mSSSm.mssm",
      "msssm.mSSSm.mssm",
      "mmmmm.mmmmm.mmmm",
      "..m.....m.....m.",
      "wwwwwwwwwwwwwwww",
      "wkkkkkkkkkkkkkkw",
      "ww............ww",
    ],
  },
  vrheadset: {
    legend: { m: "#2e2e3a", l: "#5ae8c8", s: "#46465a" },
    down: [
      ".mmmmmmmm.",
      "mmllllllmm",
      "mmllllllmm",
      ".mmmmmmmm.",
      "...ssss...",
    ],
  },
  welding: {
    legend: { w: "#46465a", m: "#6a6a7a", k: "#c8c8d4", f: "#f5d058", o: "#e8975a" },
    down: [
      "......f.........",
      ".....fo.........",
      "..kkkkkkkkkk....",
      "...kk....kk.....",
      "wwwwwwwwwwwwwwww",
      "wmmmmmmmmmmmmmmw",
      "ww............ww",
      "ww............ww",
    ],
  },
  katanarack: {
    legend: { w: "#54391f", b: "#c8c8d4", h: "#8a2f2a", g: "#e8c858" },
    down: [
      "wwwwwwwwwwwwww",
      "w.hbbbbbbbbg.w",
      "wwwwwwwwwwwwww",
      "w.hbbbbbbbbg.w",
      "wwwwwwwwwwwwww",
      "w.hbbbbbbbbg.w",
      "wwwwwwwwwwwwww",
    ],
  },
  terrarium: {
    legend: { g: "#b8d8e8", w: "#46465a", s: "#d8b87a", p: "#5a9a4a", r: "#8a8a96" },
    down: [
      "wwwwwwwwwwwwwwww",
      "wggggggggggggggw",
      "wgggggpggggggggw",
      "wggggppgggggrggw",
      "wgggggpggggggggw",
      "wssssssssssssssw",
      "wssssssssssssssw",
      "wwwwwwwwwwwwwwww",
      "ww............ww",
    ],
  },

  // ---------- the closet ----------
  coatrack: {
    legend: { w: "#6b4a2f", c: "#8a4a6a" },
    down: [
      "..w..w..w.",
      "..wwwwww..",
      "....cc....",
      "...cccc...",
      "...cccc...",
      "...cccc...",
      "...cccc...",
      "....ww....",
      "....ww....",
      "....ww....",
      "...wwww...",
    ],
  },
  shoespair: {
    legend: { s: "#f5f2ec", r: "#e85a4a" },
    down: [
      ".rr...rr..",
      ".rrs..rrs.",
      ".sss..sss.",
    ],
  },
  diploma: { // ITEM — the doctorate, displayed in the closet
    legend: { p: "#f5ecd8", r: "#c45a4a", g: "#e8c858", w: "#6b4a2f" },
    down: [
      "..pppppp..",
      ".pppppppp.",
      ".pprrrppp.",
      ".pppppppp.",
      "...gggg...",
      "....ww....",
      "...wwww...",
    ],
  },

  // ---------- grounds ----------
  memorial: {
    // a proper monument: rounded headstone, inset panel with engraved
    // bunny ears, pedestal, flowers at the base (scaled up via big:)
    legend: {
      s: "#a2a2ae", S: "#7a7a88", d: "#686876", e: "#d8d8e2",
      p: "#8a8a96", P: "#6e6e7c", f: "#f2c0d8", y: "#f0e060", g: "#3f8a1e",
    },
    down: [
      "....ssss....",
      "..ssssssss..",
      ".ssssssssss.",
      ".sSSSSSSSSs.",
      ".sSddddddSs.",
      ".sSdeddedSs.",
      ".sSdeddedSs.",
      ".sSdeddedSs.",
      ".sSdeeeedSs.",
      ".sSddddddSs.",
      ".sSdeeeedSs.",
      ".sSddddddSs.",
      ".sSSSSSSSSs.",
      "pppppppppppp",
      "PPPPPPPPPPPP",
      "fy.g.gg.g.yf",
    ],
  },
  towel: {
    legend: { t: "#5ac8c8", T: "#8ae0e0", s: "#f5d058" },
    down: [
      "tTtTtTtTtTtTtT",
      "tttttttttttttt",
      "tTtTtTtTtTtTtT",
      "tttttttttttttt",
      "......ss......",
    ],
  },
  hoop: {
    legend: { p: "#8a8a96", b: "#f5f2ec", o: "#e8975a", n: "#d8d0c0" },
    down: [
      "..bbbbbbbbbb..",
      "..b........b..",
      "..b..oooo..b..",
      "..bbbbbbbbbb..",
      "....oooooo....",
      "....n.nn.n....",
      "....n.nn.n....",
      "......pp......",
      "......pp......",
      "......pp......",
      "......pp......",
      "......pp......",
      "......pp......",
      ".....pppp.....",
    ],
  },
  pbtable: {
    legend: { w: "#a87f4e", W: "#8a653a", j: "#c8862a", J: "#e8a84a", r: "#c43c3c", p: "#6b4a2f" },
    down: [
      "r..................r",
      "rr.......jj.......rr",
      "r........Jj........r",
      "r........jj........r",
      "rwwwwwwwwwwwwwwwwwwr",
      "rWWWWWWWWWWWWWWWWWWr",
      "r...pp........pp...r",
      "r...pp........pp...r",
      "rrrrrrrrrrrrrrrrrrrr",
    ],
  },
  portal: {
    legend: { o: "#8a5ae8", O: "#b89ae8", l: "#e0d0ff", s: "#46465a" },
    down: [
      "....oooooooo....",
      "..ooOOOOOOOOoo..",
      ".ooOllllllllOoo.",
      ".oOllllllllllOo.",
      ".oOllllllllllOo.",
      ".oOllllllllllOo.",
      ".oOllllllllllOo.",
      ".oOllllllllllOo.",
      ".oOllllllllllOo.",
      ".oOllllllllllOo.",
      ".oOllllllllllOo.",
      ".oOllllllllllOo.",
      ".ooOOOOOOOOOOoo.",
      ".ss..........ss.",
    ],
  },

  // ---------- interior dressing ----------
  portrait: {
    legend: { f: "#e8c858", p: "#d8d0c0", a: "#8a6a4a", b: "#e8d27a", c: "#241a12" },
    down: [
      "ffffffffffff",
      "fppppppppppf",
      "fpapbpapcppf",
      "fpapbpapcppf",
      "fppppppppppf",
      "ffffffffffff",
    ],
  },
  plant: {
    legend: { g: "#5a9a4a", G: "#3f7a2e", p: "#b86a4a", P: "#9a5538" },
    down: [
      "...gGg....",
      "..gGgGg...",
      ".GgGgGgG..",
      "..gGgGg...",
      "...PPP....",
      "..PpppP...",
      "..PpppP...",
      "...PPP....",
    ],
  },
});

// validate prop grids too
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
