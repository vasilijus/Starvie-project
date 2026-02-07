
export const CHUNK_SIZE = 16;
export const TILE_SIZE = 32;
export const WORLD_CHUNKS = 10;

const biomes = ["forest", "plains", "desert"];

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
  const chunks = {};
  for ( let cx = 0; cx < WORLD_CHUNKS; cx++ ) {
    for ( let cy = 0; cy < WORLD_CHUNKS; cy++ ) {
      chunks[`${cx},${cy}`] = getChunk(cx, cy, seed);
    }
  }

  return { chunks };
}

function generateChunk(cx, cy, seed) {
  const biome = getProceduralBiome(cx, cy, seed);
  const tiles = [];

  for (let y = 0; y < CHUNK_SIZE; y++) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
      tiles.push(biome);
    }
  }

  return { biome, tiles };
}

export function getChunk(cx, cy, seed = 1) {
  const key = `${cx},${cy}`;

  // 1) Handmade chunk exists → use it
  if (handmadeChunks && handmadeChunks[key]) {
    const biome = handmadeChunks[key].biome;

    // rebuild tiles from biome
    const tiles = new Array(CHUNK_SIZE * CHUNK_SIZE).fill(biome);
    return { biome, tiles };
  }

  // 2) Otherwise → procedural chunk
  return generateChunk(cx, cy, seed);
}


