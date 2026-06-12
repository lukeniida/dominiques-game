#!/bin/bash
# Rebuilds the gitignored assets/ folder from the (also gitignored)
# asset-candidates/ packs. Run this after a fresh clone, once the packs
# have been re-downloaded from their itch.io pages (see TODO.md).
# Licenses are free for non-commercial use but forbid redistribution,
# which is why neither folder is committed.
set -euo pipefail
cd "$(dirname "$0")/.."

CF="asset-candidates/cute-fantasy/Cute_Fantasy_Free"
mkdir -p assets/exterior

cp "$CF/Tiles/Grass_Middle.png"            assets/exterior/grass.png
cp "$CF/Tiles/Water_Middle.png"            assets/exterior/water.png
cp "$CF/Tiles/Water_Tile.png"              assets/exterior/water-edges.png
cp "$CF/Tiles/Path_Middle.png"             assets/exterior/path.png
cp "$CF/Tiles/Path_Tile.png"               assets/exterior/path-edges.png
cp "$CF/Tiles/Cliff_Tile.png"              assets/exterior/cliff-edges.png
cp "$CF/Outdoor decoration/Oak_Tree.png"   assets/exterior/oak-tree.png
cp "$CF/Outdoor decoration/Oak_Tree_Small.png" assets/exterior/oak-tree-small.png
cp "$CF/Outdoor decoration/Fences.png"     assets/exterior/fences.png
cp "$CF/Outdoor decoration/Outdoor_Decor_Free.png" assets/exterior/decor.png
cp "$CF/Outdoor decoration/Bridge_Wood.png" assets/exterior/bridge.png

echo "assets/ restored:"
ls assets/exterior
