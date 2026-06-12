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
all free for non-commercial use, NOT redistributable — gitignored):
- **Cute Fantasy RPG** (Kenmi) — outdoor world: grass/water/cliff/path
  tiles, oak trees, fences, house pieces
- **Modern Interiors** (LimeZu) — all 5 rooms: floors, walls, furniture,
  PLUS animated walk-cycle character bases for the family
- **Cozy RPG** (lakiiah) — two-story house kit, reserve for mansion facade
- Sprout Lands (Cup Nooble) — benched (pastel palette mismatch)

### Steps (each ends playable, Luke reviews at every checkpoint)
- [ ] 1. **PixiJS renderer swap** — vendor pixi.min.js, split engine into
      logic (engine.js) + rendering (render.js). Game looks IDENTICAL
      after this step; it's the GPU foundation everything else stands on.
- [ ] 2. **Exterior rebuild** — grounds re-laid with Cute Fantasy tiles:
      real grass, water with animated edges, cliffs, oak trees, fences
- [ ] 3. **Mansion facade** — proper two-story build (Cozy RPG kit)
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
