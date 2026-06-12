// ============================================================
// maps.js — the world and every word in it.
// Tile chars:
//   g grass   f flowers   t tree    w water   p path   h tall grass
//   F fence (solid)
//   B mansion footprint (solid; the building art is drawn over it)
//   V roof    M house wall   X window   D front door (warp)
//   # wall    r wood floor   u rug   k dojo floor   K dojo wall
//   d interior door (warp)
// ============================================================

const MAPS = {

  // ════════════════════════ THE GROUNDS ════════════════════════
  exterior: {
    theme: "exterior",
    playerStart: { x: 17, y: 26, facing: "up" },
    tiles: [
      // the mansion (B block) is 15×12 tiles — the Inn art is drawn
      // over rows 1-12; D cells are the doormat in front of its porch
      "tttttttttttttttttttttttttttttttttttt",
      "tggggggggggggggggggggggggggggggwwwww",
      "tggggggggggggggggggggggggggggggwwwww",
      "tggggggggggBBBBBBBBBBBBBBBgggggwwwww",
      "tggggggggggBBBBBBBBBBBBBBBgggggwwwww",
      "tggggggggggBBBBBBBBBBBBBBBgggggwwwww",
      "tggggggggggBBBBBBBBBBBBBBBgggggwwwww",
      "tggggfffgggBBBBBBBBBBBBBBBgggggwwwww",
      "tggggfffgggBBBBBBBBBBBBBBBgggggwwwww",
      "tggggfffgggBBBBBBBBBBBBBBBgggggwwwww",
      "tggggggggggBBBBBBBBBBBBBBBgggggwwwww",
      "tggggggggggBBBBBBBBBBBBBBBgggggwwwww",
      "tggggggggggBBBBBBBBBBBBBBBgggggwwwww",
      "tggggggggggBBBBBBDDBBBBBBBgggggwwwww",
      "tggggggggggggggggppggggggggggggwwwww",
      "tggggggggggggggggppggggggggggggwwwww",
      "tgggggfggggggggggppggghhgggggggwwwww",
      "tggggggggggggggggppggggggggggggwwwww",
      "tggggggggggggggggppggggggggggggggwww",
      "tggggggggggggggggpppppppppppppppggww",
      "tggggggggggggggggpppppppppppppppgwww",
      "tggggggggggggggggppggggggggggggwwwww",
      "tgggppppppppppppppppgggggggggggwwwww",
      "tgggppppppppppppppppgggggggggggwwwww",
      "tgFffffffFgggggggppggggggggggggwwwww",
      "tgFffffffFgggggggppggggggggggggwwwww",
      "tgFffffffFgggggggppggggggggggggwwwww",
      "tgFFFFFFFFgggggggppggggggggggggwwwww",
      "thhhhhhhhggggggggggggggggggggggwwwww",
      "thhhhhhggggggggggggggggggggggggwwwww",
      "tttttttttttttttttttttttttttttttwwwww",
    ],
    warps: [
      { x: 17, y: 13, to: "hallway", tx: 7, ty: 7, facing: "up" },
      { x: 18, y: 13, to: "hallway", tx: 8, ty: 7, facing: "up" },
    ],
    entities: [
      {
        x: 19, y: 26, sprite: "luke", name: "Luke", label: true,
        lines: [
          "Five sparkling things, Dom. One per family\nmember. The portal's at the cliff, over\nthe lake.",
          "And hey — take your time. The house\nisn't going anywhere. I haven't even\nbought it yet.",
        ],
      },
      {
        x: 6, y: 8, sprite: "memorial", name: "Boo-Boo's Memorial", big: 2.5,
        lines: [
          "A monument in a bed of flowers.\nIt is visible from the lake.",
          "'BOO-BOO — a very good bunny.\nLoved by Dominique.\nSurvived by everyone who ever\nsaw her ears.'",
          "The flowers here never wilt.",
        ],
      },
      {
        x: 8, y: 24, sprite: "booboo", name: "Boo-Boo", label: true, wander: 2,
        lines: [
          "...",
          "(The bunny regards you warmly.\nSomehow, you feel twelve years younger.)",
        ],
      },
      {
        x: 26, y: 23, sprite: "hoop", name: "Basketball Hoop", big: 2,
        lines: [
          "Regulation height. Ruthvik checked.\nTwice.",
        ],
      },
      {
        x: 25, y: 24, sprite: "ruthvik", name: "Ruthvik", label: true, wander: 1,
        lines: [
          "Dom! Welcome! I was just recording\nthe pod.",
          "Today's episode: 'Why the mid-range\njumper is undervalued, and why my\nfiancée is the best anesthesiologist\nin Texas.'",
          "It's a two-topic show. Both takes are\ncorrect. Very level-headed.",
        ],
      },
      {
        x: 23, y: 27, sprite: "sign", name: "Warning Sign",
        lines: [
          "'CAUTION: ALLERGEN VIEWING AREA.'",
          "'Absolutely NO LOOKING.'",
          "— Fort Worth Elementary, est. 2007",
        ],
      },
      {
        x: 25, y: 27, sprite: "pbtable", name: "Roped-Off Table", gag: "pb",
        lines: [
          "A picnic table behind a velvet rope.\nOn it: a single jar of peanut butter.",
          "A sign reads: 'DO NOT LOOK AT THE\nPEANUT BUTTER.'",
          "You look at the peanut butter.",
        ],
        linesAfter: [
          "The table has been re-roped.",
          "You've done enough.",
        ],
      },
      {
        x: 28, y: 16, sprite: "towel", name: "Luke's Towel", big: 2,
        lines: [
          "Luke's sunbathing towel. Still warm.",
          "He was here a second ago. He is also\nat the front path. Don't think about it.",
        ],
      },
      {
        x: 33, y: 19, sprite: "portal", name: "The Portal", portal: true, glow: true, big: 2.5,
      },
    ],
  },

  // ════════════════════════ THE GREAT HALLWAY ════════════════════════
  hallway: {
    theme: "room",
    playerStart: { x: 7, y: 6, facing: "up" },
    tiles: [
      "################",
      "###d##d##d##d###",
      "#rrrrrrrrrrrrrr#",
      "#rrrrrrrrrrrrrr#",
      "#rrrrrrrrrrrrrrd",
      "#rrrrrrrrrrrrrr#",
      "#rrrrrrrrrrrrrr#",
      "#rrrrrrrrrrrrrr#",
      "#######dd#######",
    ],
    warps: [
      { x: 3, y: 1, to: "lukeroom", tx: 4, ty: 6, facing: "up" },
      { x: 6, y: 1, to: "momroom", tx: 4, ty: 6, facing: "up" },
      { x: 9, y: 1, to: "dadroom", tx: 4, ty: 6, facing: "up" },
      { x: 12, y: 1, to: "henryroom", tx: 4, ty: 6, facing: "up" },
      { x: 15, y: 4, to: "closet", tx: 1, ty: 4, facing: "right" },
      { x: 7, y: 8, to: "exterior", tx: 17, ty: 14, facing: "down" },
      { x: 8, y: 8, to: "exterior", tx: 18, ty: 14, facing: "down" },
    ],
    entities: [
      {
        x: 2, y: 1, sprite: "note", name: "Door Plaque",
        lines: ["'LUKE'S ROOM — knock first.\n(He's meditating.) (He's not.)'"],
      },
      {
        x: 5, y: 1, sprite: "note", name: "Door Plaque",
        lines: ["'MOM'S STUDIO — the layout has\nchanged since you read this sign.'"],
      },
      {
        x: 8, y: 1, sprite: "note", name: "Door Plaque",
        lines: ["'DAD'S ROOM — quiet hours:\n11 AM to 6 PM. And 8 PM to 4:30 AM.'"],
      },
      {
        x: 11, y: 1, sprite: "note", name: "Door Plaque",
        lines: ["'HENRY'S DOJO — enter with honor.\nDo not touch the swords. Or do.\nHe doesn't say much either way.'"],
      },
      {
        x: 14, y: 3, sprite: "note", name: "Door Plaque",
        lines: ["'DOMINIQUE'S ROOM.'", "(The plaque is bigger than the room.)"],
      },
      {
        x: 1, y: 1, sprite: "portrait", name: "Family Portrait",
        lines: ["The whole family. Everyone blinked\nexcept Boo-Boo."],
      },
      {
        x: 14, y: 1, sprite: "portrait", name: "Family Portrait (2nd attempt)",
        lines: ["Everyone blinked again.", "Boo-Boo remains undefeated."],
      },
      {
        x: 1, y: 5, sprite: "plant", name: "House Plant",
        lines: ["Mom moved this plant here eleven\nminutes ago.", "It will move again."],
      },
      {
        x: 14, y: 6, sprite: "plant", name: "House Plant (relocated)",
        lines: ["Ah. There it is."],
      },
    ],
  },

  // ════════════════════════ LUKE'S ROOM ════════════════════════
  lukeroom: {
    theme: "lukeroom",
    playerStart: { x: 4, y: 6, facing: "up" },
    tiles: [
      "##########",
      "#XX####XX#",
      "#rrrrrrrr#",
      "#rrrrrrrr#",
      "#rrrrrrrr#",
      "#rrrrrrrr#",
      "#rrrrrrrr#",
      "####dd####",
    ],
    warps: [
      { x: 4, y: 7, to: "hallway", tx: 3, ty: 2, facing: "down" },
      { x: 5, y: 7, to: "hallway", tx: 3, ty: 2, facing: "down" },
    ],
    entities: [
      {
        x: 1, y: 3, sprite: "bookshelf", name: "Bookshelf",
        lines: [
          "Three hundred books. Poetry, philosophy,\nphysics, and one (1) manual for a camera\nhe has never read.",
        ],
      },
      {
        x: 4, y: 2, sprite: "computerdesk", name: "Luke's Computer",
        lines: [
          "The monitor is open to Claude.",
          "The chat says: 'how do i tell my twin\nsister i made her a game without crying'",
          "Claude replied: 'Just show her.'",
        ],
      },
      {
        x: 7, y: 2, sprite: "planets", big: 2, name: "Solar System Mobile",
        lines: [
          "A hanging model of the solar system.",
          "Jupiter is labeled 'me'.",
          "Pluto is labeled 'Henry (sorry)'.",
        ],
      },
      {
        x: 8, y: 4, sprite: "guitar", big: 2, name: "Guitars",
        lines: [
          "Four guitars.",
          "He can play one (1) song.",
          "It's Wonderwall. It has always been\nWonderwall.",
        ],
      },
      {
        x: 8, y: 6, sprite: "candles", big: 2, name: "Candles",
        lines: [
          "Seventeen candles arranged with great\nspiritual intention.",
          "Fire hazard rating: transcendent.",
        ],
      },
      {
        x: 1, y: 6, sprite: "altar", big: 2, name: "The Altar",
        lines: [
          "Crystals, sage, a singing bowl, and a\nsticky note:",
          "'remember to be present\n(after I finish building the game)'",
        ],
      },
      {
        x: 4, y: 4, sprite: "notebook", big: 1.6, name: "Luke's Poetry Notebook",
        itemId: "notebook",
        lines: [
          "Luke's poetry notebook. The first page\nis an index:",
          "'poems about Dom: 14.\npoems about myself: 212.'",
          "✦ THE NOTEBOOK joins your inventory. ✦",
        ],
      },
    ],
  },

  // ════════════════════════ MOM'S STUDIO ════════════════════════
  momroom: {
    theme: "room",
    playerStart: { x: 4, y: 6, facing: "up" },
    tiles: [
      "##########",
      "##XX##XX##",
      "#rrrrrrrr#",
      "#rrrrrrrr#",
      "#rrrrrrrr#",
      "#rrrrrrrr#",
      "#rrrrrrrr#",
      "####dd####",
    ],
    warps: [
      { x: 4, y: 7, to: "hallway", tx: 6, ty: 2, facing: "down" },
      { x: 5, y: 7, to: "hallway", tx: 6, ty: 2, facing: "down" },
    ],
    entities: [
      {
        x: 2, y: 3, sprite: "easel", big: 2, name: "Easel",
        lines: [
          "A half-finished painting of the lake.\nIt's beautiful.",
          "She'll say it 'needs one more pass.'",
          "It does not.",
        ],
      },
      {
        x: 6, y: 2, sprite: "angelshelf", big: 2, name: "Shelf of Angels",
        lines: [
          "A shelf of angels. They watch over\nthe house.",
          "They have seen the furniture move\nand said nothing.",
        ],
      },
      {
        x: 8, y: 3, sprite: "redlight", name: "Red Light Therapy Device",
        lines: [
          "Mom says it's for cellular energy.",
          "The angels glow pink in it. They seem\nto like it.",
        ],
      },
      {
        x: 4, y: 4, sprite: "kintsugiheart", big: 1.6, name: "The Kintsugi Heart",
        itemId: "heart",
        lines: [
          "A great metal heart, broken once, mended\nwith a river of gold down the middle.",
          "Mom makes these. The break is part of\nthe beauty. That's the whole point.",
          "✦ THE KINTSUGI HEART joins your\ninventory. ✦",
        ],
      },
      {
        x: 7, y: 5, sprite: "note", big: 1.5, name: "A Note (Luke's handwriting)",
        lines: [
          "'MOM. Tell Dad to buy SpaceX stock.'",
          "'This is the 6th note.'",
          "'The notes will continue.'",
        ],
      },
      {
        x: 3, y: 5, sprite: "mom", name: "Mom", label: true, wander: 1,
        lines: [
          "DOMINIQUE!! My girl!! THE DOCTOR!!",
          "Quick — help me move this easel.\nNo, wait. It's perfect there.",
          "No. Wait.",
          "(She is already holding the easel.)",
        ],
      },
    ],
  },

  // ════════════════════════ DAD'S ROOM ════════════════════════
  dadroom: {
    theme: "room",
    playerStart: { x: 4, y: 6, facing: "up" },
    tiles: [
      "##########",
      "##XX##XX##",
      "#rrrrrrrr#",
      "#rrrrrrrr#",
      "#rrrrrrrr#",
      "#rrrrrrrr#",
      "#rrrrrrrr#",
      "####dd####",
    ],
    warps: [
      { x: 4, y: 7, to: "hallway", tx: 9, ty: 2, facing: "down" },
      { x: 5, y: 7, to: "hallway", tx: 9, ty: 2, facing: "down" },
    ],
    entities: [
      {
        x: 1, y: 3, sprite: "bed", name: "Dad's Bed",
        lines: [
          "Perfectly made. Decorative.",
          "The couch is where the sleeping happens.",
        ],
      },
      {
        x: 4, y: 2, sprite: "lockedphoto", big: 1.6, name: "A Framed Photo",
        itemId: "door",
        lines: [
          "A framed photo of... the back door.\nLocked. Dated: one summer, years ago.",
          "Engraved beneath it: 'NEVER FORGET.'",
          "(Luke locked him out. Dad slept on the\nporch. The family healed. Eventually.)",
          "✦ THE LOCKED DOOR joins your\ninventory. ✦",
        ],
      },
      {
        x: 7, y: 2, sprite: "glassesrack", big: 2, name: "The Glasses Wall",
        lines: [
          "Twenty pairs of designer glasses. All\nround. All slightly too small for his face.",
          "He insists this is the style.",
          "The 21st pair is on his face right now.",
        ],
      },
      {
        x: 8, y: 4, sprite: "shoerack", big: 2, name: "Running Shoes",
        lines: [
          "Running shoes in race-day condition.",
          "Top recorded speed: a brisk walk.",
        ],
      },
      {
        x: 4, y: 4, sprite: "dadcouch", big: 1.5, name: "Dad", label: true,
        lines: [
          "Mmh. Dom. Good. You're here.",
          "I woke up at 4:30. Made four espressos.\nRan the company. Did a slow jog.",
          "It's 11 AM and I have earned this couch.",
          "Wake me for dinner. Or don't. I'll know.",
        ],
      },
      {
        x: 2, y: 6, sprite: "thinker", big: 2, name: "The Thinker",
        lines: [
          "A replica of Rodin's 'The Thinker.'",
          "Dad says it's him, 'thinking about\nthe business.'",
          "It faces the couch.",
        ],
      },
      {
        x: 8, y: 6, sprite: "espresso", big: 2, name: "Espresso Machine",
        lines: [
          "A commercial four-group espresso machine.\nIn a bedroom.",
          "The barista is Dad. The customer is Dad.",
          "The shop never closes.",
        ],
      },
      {
        x: 6, y: 5, sprite: "granola", big: 1.6, name: "The Granola Jar",
        lines: [
          "A single jar of granola.",
          "The label says: 'DAD'S.'",
          "(Everyone eats it anyway.)",
        ],
      },
    ],
  },

  // ════════════════════════ HENRY'S DOJO ════════════════════════
  henryroom: {
    theme: "dojo",
    playerStart: { x: 4, y: 6, facing: "up" },
    tiles: [
      "KKKKKKKKKK",
      "KKKKKKKKKK",
      "KkkkkkkkkK",
      "KkkkkkkkkK",
      "KkkkkkkkkK",
      "KkkkkkkkkK",
      "KkkkkkkkkK",
      "KKKKddKKKK",
    ],
    warps: [
      { x: 4, y: 7, to: "hallway", tx: 12, ty: 2, facing: "down" },
      { x: 5, y: 7, to: "hallway", tx: 12, ty: 2, facing: "down" },
    ],
    entities: [
      {
        x: 2, y: 2, sprite: "gamingrig", big: 2, name: "The Battlestation",
        lines: [
          "Three monitors. One shows code. One shows\na game. One shows a 4K video of rain\non a forest.",
          "For ambience.",
        ],
      },
      {
        x: 4, y: 3, sprite: "vrheadset", big: 1.6, name: "VR Headset",
        lines: [
          "Inside this headset, Henry has a\nfifth room.",
          "It is also a dojo.",
        ],
      },
      {
        x: 6, y: 2, sprite: "terrarium", name: "The Terrarium",
        lines: [
          "A huge terrarium. Heat lamp. Tiny hammock.\nA single perfect rock.",
          "It's nicer than several apartments\nLuke has lived in.",
        ],
      },
      {
        x: 8, y: 3, sprite: "welding", big: 2, name: "Welding Station",
        lines: [
          "A metal workstation.",
          "Current project: a sword.",
          "Previous project: a better sword.\n(Don't ask about the order.)",
        ],
      },
      {
        x: 8, y: 5, sprite: "katanarack", big: 2, name: "Katana Rack",
        lines: [
          "A rack of katanas, arranged by sharpness.",
          "The bottom one is labeled:\n'for opening packages.'",
        ],
      },
      {
        x: 6, y: 3, sprite: "lumpy", big: 1.6, name: "Lumpy",
        itemId: "lumpy",
        lines: [
          "Lumpy the leopard gecko is out of his\nterrarium. He looks at you.",
          "He has been waiting for this moment\nhis whole life.",
          "✦ LUMPY climbs onto your shoulder.\nHe's coming with you. ✦",
          "(Henry nods, almost imperceptibly.)",
        ],
      },
      {
        x: 3, y: 5, sprite: "henry", name: "Henry", label: true,
        lines: [
          "Hey.",
          "...",
          "(He glances at the terrarium, then at\nyou. Take care of Lumpy.)",
        ],
      },
    ],
  },

  // ════════════════════════ DOMINIQUE'S ROOM ════════════════════════
  closet: {
    theme: "closet",
    playerStart: { x: 1, y: 4, facing: "right" },
    tiles: [
      "######",
      "######",
      "#rrrr#",
      "#rrrr#",
      "drrrr#",
      "#rrrr#",
      "######",
    ],
    warps: [
      { x: 0, y: 4, to: "hallway", tx: 14, ty: 4, facing: "left" },
    ],
    entities: [
      {
        x: 4, y: 2, sprite: "coatrack", name: "Coat Rack",
        lines: [
          "A coat rack. One (1) coat.",
          "The hanger situation is dire.",
          "(It is also touching the opposite wall.)",
        ],
      },
      {
        x: 1, y: 2, sprite: "note", big: 1.5, name: "A Sign",
        lines: [
          "'DOMINIQUE'S ROOM.'",
          "It's a closet. It has always been\na closet.",
          "The family voted. The vote was 4–1.",
        ],
      },
      {
        x: 2, y: 3, sprite: "shoespair", big: 1.6, name: "Shoes",
        lines: [
          "One pair of shoes, perfectly centered,\nlike a museum piece.",
          "There is no room for a second pair.",
        ],
      },
      {
        x: 3, y: 4, sprite: "diploma", big: 1.6, name: "The Diploma",
        itemId: "diploma",
        lines: [
          "Wait. On a tiny pedestal, under a\nsingle perfect spotlight:",
          "'DOCTOR OF OSTEOPATHIC MEDICINE —\nDOMINIQUE IIDA.'",
          "They put it in your closet.",
          "The most valuable room in the house.",
          "✦ THE DOCTORATE joins your inventory. ✦",
        ],
      },
    ],
  },
};
