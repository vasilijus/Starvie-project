import { BIOME_RULES } from './BiomeRules.js';

export const CHUNK_SIZE = 10;
export const TILE_SIZE = 32;
export const WORLD_CHUNKS = 10;

const biomes = ["forest", "plains", "desert", "snow", "swamp"];

function getProceduralBiome(cx, cy, seed) {
  // Later we can swap this with Perlin noise
  const biomeIndex = Math.floor((cx + cy + seed) / 2) % biomes.length;
  return biomes[biomeIndex];
}

// Will contain chunks painted in the editor (loaded from JSON)
let handmadeChunks = null;

export function setHandmadeMap(jsonChunks) {
  handmadeChunks = jsonChunks;
}

// export function generateWorld(seed = 1) {
//   const chunks = {};
//   for (let cx = 0; cx < WORLD_CHUNKS; cx++) {
//     for (let cy = 0; cy < WORLD_CHUNKS; cy++) {
//       // Make biome selection more smooth by using a noise function or a more complex algorithm based on chunk coordinates and seed
//       const biomeIndex = Math.floor((cx + cy + seed) / 2) % biomes.length;
//       const biome = biomes[biomeIndex];
//       const tiles = [];
      
//       // const biome = biomes[(cx + cy + seed) % biomes.length];
//       // const tiles = [];

//       for (let y = 0; y < CHUNK_SIZE; y++) {
//         for (let x = 0; x < CHUNK_SIZE; x++) {
//           tiles.push(biome);
//         }
//       }
//       chunks[`${cx},${cy}`] = { biome, tiles };
//     }
//   }
//   return { chunks };
// }

export function generateWorld(seed = 1) {
  // If handmade chunks were set, use them
  if (handmadeChunks) {
    const chunks = {};
    for (const key in handmadeChunks) {
      chunks[key] = handmadeChunks[key];
    }
      // console.log(JSON.stringify(chunks))
// console.log(chunks['9,9'])
    return { chunks };
  }

  // Otherwise generate procedurally
  const chunks = {};
  for ( let cx = 0; cx < WORLD_CHUNKS; cx++ ) {
    for ( let cy = 0; cy < WORLD_CHUNKS; cy++ ) {
      chunks[`${cx},${cy}`] = getChunk(cx, cy, seed); 

    }
  }
  // console.log(JSON.stringify(chunks))
  // console.log(chunks['0,0'])
  return { chunks };
}

function generateChunk(cx, cy, seed) {
  const biome = getProceduralBiome(cx, cy, seed);
  const tiles = [];
  const resources = [];

  // Get biome rules for this biome
  const biomeRule = BIOME_RULES[biome] || BIOME_RULES['plains'];

  // Generate tiles
  for (let y = 0; y < CHUNK_SIZE; y++) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
      tiles.push(biome);
    }
  }

  // Track occupied tile positions to prevent overlaps
  const occupiedTiles = new Set();

  // Helper function to find a free nearby tile position
  function findFreeTilePosition(preferredX, preferredY, maxSearchRadius = 3) {
    // Check if preferred position is free
    const key = `${preferredX},${preferredY}`;
    if (!occupiedTiles.has(key)) {
      return { x: preferredX, y: preferredY };
    }

    // Spiral outward to find a free tile
    for (let radius = 1; radius <= maxSearchRadius; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          // Only check positions on the current radius boundary
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

          const checkX = preferredX + dx;
          const checkY = preferredY + dy;

          // Check bounds
          if (checkX < 0 || checkX >= CHUNK_SIZE || checkY < 0 || checkY >= CHUNK_SIZE) {
            continue;
          }

          const checkKey = `${checkX},${checkY}`;
          if (!occupiedTiles.has(checkKey)) {
            return { x: checkX, y: checkY };
          }
        }
      }
    }

    // If no free position found within search radius, return original with offset anyway
    return { x: preferredX, y: preferredY };
  }

  // Generate resources based on biome rules
  if (biomeRule.resources) {
    const chunkSeed = cx * 73856093 ^ cy * 19349663 ^ seed; // Generate consistent seed per chunk
    
    for (const resourceRule of biomeRule.resources) {
      const { type, density, icon_color } = resourceRule;
      const expectedCount = Math.round((CHUNK_SIZE * CHUNK_SIZE) * density);

      // Iterate through each tile in the chunk
      for (let tileY = 0; tileY < CHUNK_SIZE; tileY++) {
        for (let tileX = 0; tileX < CHUNK_SIZE; tileX++) {
          // Generate a deterministic but pseudo-random value for this specific tile
          const tileHash = chunkSeed + tileX * 73856093 + tileY * 19349663 + type.charCodeAt(0) * 27644437;
          const pseudoRand = Math.sin(tileHash) * 43758.5453;
          const randomVal = pseudoRand - Math.floor(pseudoRand);

          // Place resource if random roll succeeds (based on density)
          if (randomVal < density) {
            const key = `${tileX},${tileY}`;
            
            // Only place if tile is free
            if (!occupiedTiles.has(key)) {
              occupiedTiles.add(key);

              // Convert tile position to world position
              const worldX = cx * CHUNK_SIZE * TILE_SIZE + tileX * TILE_SIZE + TILE_SIZE / 2;
              const worldY = cy * CHUNK_SIZE * TILE_SIZE + tileY * TILE_SIZE + TILE_SIZE / 2;

              resources.push({
                type,
                x: worldX,
                y: worldY,
                icon_color, // Include icon_color from biome rules
                hp: 100,
                hpMax: 100
              });
            }
          }
        }
      }
    }
  }

  return { biome, tiles, resources };
}

export function getChunk(cx, cy, seed = 1) {
  const key = `${cx},${cy}`;

  // 1) Handmade chunk exists → use it
  if (handmadeChunks && handmadeChunks[key]) {
    const biome = handmadeChunks[key].biome;
    const tiles = new Array(CHUNK_SIZE * CHUNK_SIZE).fill(biome);
    
    // Add resources from biome rules for handmade chunks too
    const biomeRule = BIOME_RULES[biome] || BIOME_RULES['plains'];
    const resources = handmadeChunks[key].resources || [];

    return { biome, tiles, resources };
  }

  // 2) Otherwise → procedural chunk
  return generateChunk(cx, cy, seed);
}


