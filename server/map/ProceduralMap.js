
export const CHUNK_SIZE = 16;
export const TILE_SIZE = 32;
export const WORLD_CHUNKS = 10;

const biomes = ["forest", "plains", "desert"];

export function generateWorld(seed = 1) {
  const chunks = {};
  for (let cx = 0; cx < WORLD_CHUNKS; cx++) {
    for (let cy = 0; cy < WORLD_CHUNKS; cy++) {
      // Make biome selection more smooth by using a noise function or a more complex algorithm based on chunk coordinates and seed
      const biomeIndex = Math.floor((cx + cy + seed) / 2) % biomes.length;
      const biome = biomes[biomeIndex];
      const tiles = [];
      
      // const biome = biomes[(cx + cy + seed) % biomes.length];
      // const tiles = [];

      for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
          tiles.push(biome);
        }
      }

      chunks[`${cx},${cy}`] = { biome, tiles };
    }
  }
  return { chunks };
}
