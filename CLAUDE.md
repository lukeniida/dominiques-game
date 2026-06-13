# Project: Dominique's Game

## About Luke (the builder)
- First coding project, zero prior experience — explain in plain English, define jargon on first use
- Wants to learn how things work, not just get output

## Workflow rules
- Four-phase loop: explore → plan → implement → verify. Plan before any change that touches multiple files
- Commit after every working change with a descriptive message
- Never restart a session to fix a problem — iterate in place

## End-of-session ritual (required)
Before Luke leaves a session, do a walkthrough covering:
1. What we built or changed this session
2. What was committed, and whether it was pushed to GitHub
3. Any decisions made in conversation — add them to this file so they're never lost
4. What the logical next step is for the following session

## Project status (updated June 11, 2026, end of session)
- **V1 COMPLETE & PLAYABLE**: a top-down cozy game for Luke's twin sister
  Dominique celebrating her med-school graduation. Mansion grounds + hallway
  + 5 family rooms, walk/examine, 5 sparkling treasures → portal finale.
  Full design record in CONCEPT.md; roadmap in TODO.md.
- **V2 in progress** ("Pokémon-quality" visual rebuild): Steps 1-3 done —
  PixiJS renderer swap; exterior rebuilt with Cute Fantasy PREMIUM pack
  (Luke owns it, source at ~/Desktop/Cute_Fantasy + mirrored in
  asset-candidates/): fully animated water via per-cell sprite textures,
  lily pads/cattails/jumping fish, animated flowers, mixed tree species,
  and the mansion = the pack's Inn building with chimney smoke.
  Exterior map is now 29 rows (grew 5 for the mansion); trees + mansion
  are depth-sorted sprites in entLayer, not baked. Tile art loads from
  gitignored assets/ (scripts/restore-assets.sh rebuilds it).
  Step 4 done: interiors rebuilt with LimeZu Room Builder walls/floors
  per room (ROOM_STYLE in render.js) + furniture-sheet sprites for
  generic pieces (FURN table maps entity sprite names to sheet rects);
  personality props stay hand-drawn. Luke's revision: interiors halved
  (hallway 16×9, rooms 10×8, 2-course walls), herringbone hallway-only
  with neutral gray room floors, props scaled up via big:. Step 6
  first cut done: per-theme ColorMatrix grading, additive glow sources
  (GLOW_SOURCES), window light pools, dust motes.
  NEXT: Step 5, family sprites v2 (LimeZu animated character bases +
  likenesses, Luke approves each). Open decisions for Luke: dock vs
  grass point at the portal; bloom/dusk mode as extra light polish.
- GitHub: repo is lukeniida/dominiques-game (lukeniida@gmail.com account)
- Vercel: live at https://dominiques-game.vercel.app (otherotter account)
  Deploy command: `cd ~/Projects/dominiques-game && vercel --prod --yes --scope otherotter`

## Key decisions on record
- Scope: mansion-only for v1/v2 (graduation area is v3 backlog)
- Art: free asset packs for world (Cute Fantasy RPG + LimeZu Modern
  Interiors + Cozy RPG house kit), CUSTOM sprites for the family —
  likenesses are the soul of the gift. Packs live in asset-candidates/
  (gitignored — licenses prohibit redistribution; repo must stay private)
- All asset licenses: free non-commercial w/ modification — fine for this
- Renderer: PixiJS (WebGL) over canvas; chose web over MonoGame/Godot so
  the game stays a shareable link
- Title & final sign: "A game Luke made while Dominique was home"
- Walk speed: slow & cozy (player 0.095/frame). Dad's pb-gag sprint stays fast
- Dominique's closet is deliberately tiny (4×4 walkable) — family joke, 4–1 vote

## Practical commands
- Local server: `cd ~/Projects/dominiques-game && python3 -m http.server 4173`
  then open http://localhost:4173
- Dev params: `?skiptitle` skips title, `?map=<name>` jumps to a map
  (exterior, hallway, lukeroom, momroom, dadroom, henryroom, closet),
  `?quiet` skips the intro dialog, `?at=x,y` spawns at a tile
- Verify renders: headless Chrome screenshots, e.g.
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless
  --disable-gpu --force-device-scale-factor=1 --screenshot=/tmp/shot.png
  --window-size=960,624 --hide-scrollbars --virtual-time-budget=5000
  "http://localhost:4173/?skiptitle&quiet&at=17,9"`
- Inspect asset sheet tile coords: `_slicer.html?img=assets/exterior/<file>.png`
  (draws a labeled 16px grid over any sheet)
- Dev facing param: `&face=down|up|left|right` spawns player facing a direction
