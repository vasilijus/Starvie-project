import fs from 'fs';
import path from 'path';
import { setHandmadeMap } from '../world/ProceduralMap.js';

/**
 * Try to load map data from disk and inject it into ProceduralMap.
 * Returns true when a saved map was found and loaded.
 */
export function loadMapFromFile() {
  const mapPath = path.join(process.cwd(), 'server', 'maps', 'map.json');

  try {
    if (fs.existsSync(mapPath)) {
      const mapData = fs.readFileSync(mapPath, 'utf8');
      const chunks = JSON.parse(mapData);
      setHandmadeMap(chunks);
      return true;
    }
  } catch (err) {
    console.warn(`⚠ Failed to load map: ${err.message}`);
  }

  return false;
}
