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
- **V2 in progress** ("Pokémon-quality" visual rebuild): Step 1 done —
  PixiJS renderer swap. engine.js = logic only, render.js = GPU drawing,
  pixi vendored in js/vendor/. NEXT: Step 2, exterior rebuild with
  Cute Fantasy tiles (see TODO.md).
- GitHub: private repo lukeiida/dominiques-game, all work pushed
- Vercel: deliberately NOT deployed yet — Luke will say when

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
  (exterior, hallway, lukeroom, momroom, dadroom, henryroom, closet)
- Verify renders: headless Chrome screenshots (see git history for pattern)
