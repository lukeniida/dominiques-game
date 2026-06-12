#!/bin/bash
# Rebuilds the gitignored assets/ folder from the (also gitignored)
# asset-candidates/ packs. Run this after a fresh clone, once the packs
# have been re-downloaded (Cute Fantasy premium from kenmi-art.itch.io).
# Licenses allow use + modification but forbid redistribution, which is
# why neither folder is committed.
set -euo pipefail
cd "$(dirname "$0")/.."

P="asset-candidates/cute-fantasy-premium"
ANIM="$P/Outdoor decoration/Outdoor_Decor_Animations"
mkdir -p assets/exterior

# ── ground tiles (free + premium share the same art style) ──
CF="asset-candidates/cute-fantasy/Cute_Fantasy_Free"
cp "$CF/Tiles/Grass_Middle.png"            assets/exterior/grass.png
cp "$CF/Tiles/Path_Middle.png"             assets/exterior/path.png
cp "$CF/Tiles/Path_Tile.png"               assets/exterior/path-edges.png
cp "$CF/Outdoor decoration/Fences.png"     assets/exterior/fences.png
cp "$CF/Outdoor decoration/Outdoor_Decor_Free.png" assets/exterior/decor.png

# ── animated water (8 frames each) ──
cp "$P/Tiles/Water/Water_Tile_1_Anim.png"   assets/exterior/water-edges-anim.png
cp "$P/Tiles/Water/Water_Middle_Anim_1.png" assets/exterior/water-middle-anim.png
cp "$P/Tiles/Water/Fish_Animated_Tile.png"  assets/exterior/fish-anim.png

# ── the mansion ──
cp "$P/Buildings/Buildings/Unique_Buildings/Inn/Inn_Blue.png" assets/exterior/mansion.png
cp "$P/Buildings/House_Decor/Chimney_smoke_Anim.png" assets/exterior/chimney-smoke-anim.png

# ── animated trees (3 sway frames each) ──
cp "$P/Trees/Big_Oak_Tree.png"      assets/exterior/tree-oak-anim.png
cp "$P/Trees/Medium_Birch_Tree.png" assets/exterior/tree-birch-anim.png
cp "$P/Trees/Big_Spruce_tree.png"   assets/exterior/tree-spruce-anim.png

# ── water features (8 frames each unless noted) ──
WP="$ANIM/Water_Decor_Animations/Water_Plants"
cp "$WP/Lillypad_Green_1_Anim.png"  assets/exterior/lillypad-green-anim.png
cp "$WP/Lillypad_Red_2_Anim.png"    assets/exterior/lillypad-red-anim.png
cp "$WP/Lillypad_Purple_3_Anim.png" assets/exterior/lillypad-purple-anim.png
cp "$WP/Cattail_1_Anim.png"         assets/exterior/cattail-anim.png
cp "$ANIM/Water_Decor_Animations/Other_Water_Decor/Log_1_Water_Anim.png" assets/exterior/waterlog-anim.png  # 16 frames

# ── animated grass + flowers (8 frames each) ──
GA="$ANIM/Grass_Animations"
cp "$GA/Grass_1_Anim.png"        assets/exterior/tallgrass-1-anim.png
cp "$GA/Grass_2_Anim.png"        assets/exterior/tallgrass-2-anim.png
cp "$GA/Flower_Grass_1_Anim.png" assets/exterior/flower-1-anim.png
cp "$GA/Flower_Grass_2_Anim.png" assets/exterior/flower-2-anim.png
cp "$GA/Flower_Grass_8_Anim.png" assets/exterior/flower-3-anim.png

# ── path detail ──
cp "$P/Tiles/Grass/Path_Decoration.png" assets/exterior/path-decor.png

# ── ambient life ──
cp "$P/Animals/Butterfly/Butterfly.png" assets/exterior/butterfly.png

# ── family character layers (Cute Fantasy premium player system) ──
PL="$P/Player"
mkdir -p assets/family
cp "$PL/Player_Base/Player_Base_animations.png" assets/family/base.png
cp "$PL/Head/Hair_1/Hair_1_Grey.png"   assets/family/hair1-grey.png
cp "$PL/Head/Hair_1/Hair_1_Black.png"  assets/family/hair1-black.png
cp "$PL/Head/Hair_2/Hair_2_Brown.png"  assets/family/hair2-brown.png
cp "$PL/Head/Hair_3/Hair_3_Black.png"  assets/family/hair3-black.png
cp "$PL/Head/Hair_4/Hair_4_Brown.png"  assets/family/hair4-brown.png
cp "$PL/Head/Hair_6/Hair_6_Blonde.png" assets/family/hair6-blonde.png
cp "$PL/Chest/OG_Shirt/Shirt_1_Black.png" assets/family/shirt-black.png
cp "$PL/Chest/OG_Shirt/Shirt_1_Blue.png"  assets/family/shirt-blue.png
cp "$PL/Chest/Royal_Shirt/Royal_Shirt_1_Blue.png" assets/family/royal-blue.png
cp "$PL/Legs/OG_Pants/Pants_1_Black.png" assets/family/pants-black.png
cp "$PL/Legs/OG_Pants/Pants_1_Brown.png" assets/family/pants-brown.png
cp "$PL/Feet/Shoes_1_Black.png" assets/family/shoes-black.png
cp "$PL/Feet/Shoes_1_Brown.png" assets/family/shoes-brown.png

# ── interiors (LimeZu Modern Interiors free) ──
MI="asset-candidates/modern-interiors/Modern tiles_Free/Interiors_free/16x16"
mkdir -p assets/interior
cp "$MI/Room_Builder_free_16x16.png" assets/interior/room-builder.png
cp "$MI/Interiors_free_16x16.png"    assets/interior/furniture.png

echo "assets/ restored:"
ls assets/exterior assets/interior
