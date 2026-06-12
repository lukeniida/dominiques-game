# Dominique's Game — Roadmap

## ✅ V1 — DONE (playable start to finish)
Mansion grounds + hallway + 5 rooms, walk/examine, 5 sparkling treasures,
inventory, portal finale with confetti, peanut butter gag, NPC wandering,
Lumpy on shoulder. Hand-coded canvas renderer + procedural pixel art.

## 🚧 V2 — "Pokémon-quality" visual rebuild (current)

The diagnosis: our gap vs Pokémon/Stardew is ART, not tech. The fix is
three pillars: professional tile art (60%), animated outlined character
sprites (30%), WebGL lighting polish (10%).

The asset stack (downloaded to asset-candidates/, license-checked,
NOT redistributable — gitignored):
- **Cute Fantasy RPG PREMIUM** (Kenmi) — the whole exterior: tiles,
  animated water, buildings (the Inn = the mansion!), trees, animated
  decor, weather. Luke owns the premium license (commercial OK).
  Source copy also at ~/Desktop/Cute_Fantasy.
- **Modern Interiors** (LimeZu) — all 5 rooms: floors, walls, furniture,
  PLUS animated walk-cycle character bases for the family
- Cozy RPG (lakiiah) — benched (premium Cute Fantasy covers buildings
  in a matching style)
- Sprout Lands (Cup Nooble) — benched (pastel palette mismatch)

### Steps (each ends playable, Luke reviews at every checkpoint)
- [x] 1. **PixiJS renderer swap** — vendor pixi.min.js, split engine into
      logic (engine.js) + rendering (render.js). Game looks IDENTICAL
      after this step; it's the GPU foundation everything else stands on.
- [x] 2. **Exterior rebuild** — grounds re-laid with Cute Fantasy tiles:
      autotiled water + path shorelines, oak forest border, fenced
      flower garden, decor scatter.
- [x] 2.5 **Premium upgrade pass** — fully animated water (8-frame
      tiles), lily pads, cattails, floating logs, a jumping fish,
      animated flowers + tall grass, mixed tree species (oak/golden
      birch/spruce), chimney smoke. Map grew 5 rows taller for the
      mansion. OPEN DECISION (Luke): portal sits on a grass point;
      premium pack HAS bridge/dock pieces if we want a dock instead
      (would mean tweaking "cliff" dialogue).
- [x] 3. **Mansion facade** — the premium pack's Inn: a grand two-story
      timber manor with porch, dormers, and smoking chimneys
- [ ] 4. **Interior rebuild** — hallway + 5 rooms with LimeZu floors,
      walls, real furniture (Dad's couch! Henry's battlestation!)
- [ ] 5. **Family sprites v2** — custom heads/hair/outfits on LimeZu
      animated bases: walk cycles + likenesses. Luke approves each.
- [ ] 6. **Light & shader pass** — color grading, light maps (candle
      flicker, monitor glow, window pools), bloom, dust motes
- [ ] 7. **Full playtest + dialogue polish** — Luke plays start→finish
- [ ] 8. **Ship** — Vercel deploy when Luke says go

## 🧊 V3 / backlog
- Graduation ceremony area (cap toss, Match Day sign, TCOM colors)
- Sound: cozy looping music, footsteps, pickup chime
- More inside jokes as Luke remembers them
- Lubbock desert area
- gstack upgrade (0.16 → 1.57) when convenient
