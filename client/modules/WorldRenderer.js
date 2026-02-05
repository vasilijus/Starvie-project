const TILE_SIZE = 32;
const CHUNK_SIZE = 16;
const WORLD_CHUNKS = 10;
const WORLD_SIZE = WORLD_CHUNKS * CHUNK_SIZE * TILE_SIZE; // Calculate world size based on chunks, chunk size, and tile size

const TILE_COLORS = {
  "snow": "#FFFFF0",
  "forest": "#228B22",
  "plains": "#7CFC00",
  "desert": "#EDC9AF"
};

export class WorldRenderer {
    // constructor(world) {
    //     this.world = world;
    // }

    draw(ctx, world, player) {
        for( const key in world.chunks) {
            const chunk = world.chunks[key];
            const [chunkX, chunkY] = key.split(',').map(Number);
            const biome = chunk.biome;
            const color = TILE_COLORS[biome] || "#000";

            const baseX = chunkX * CHUNK_SIZE * TILE_SIZE - player.renderX + ctx.canvas.width / 2;
            const baseY = chunkY * CHUNK_SIZE * TILE_SIZE - player.renderY + ctx.canvas.height / 2;
            
            // Draw the entire chunk as a single rectangle for performance
            ctx.fillStyle = color;
            ctx.fillRect(baseX, baseY, CHUNK_SIZE * TILE_SIZE, CHUNK_SIZE * TILE_SIZE);

            // for (let y = 0; y < CHUNK_SIZE; y++) {
            //     for (let x = 0; x < CHUNK_SIZE; x++) {
            //         const tileX = chunkX * CHUNK_SIZE + x;
            //         const tileY = chunkY * CHUNK_SIZE + y;
            //         const screenX = tileX * TILE_SIZE - player.x + 400; // Center player on screen
            //         const screenY = tileY * TILE_SIZE - player.y + 300; // Center player on screen

            //         ctx.fillStyle = color;
            //         ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            //     }
            // }
        }
    }
}
// export class WorldRenderer {
//   constructor(world) {
//     this.world = world;
//   }

//   render(ctx, camera) {
//     const startX = Math.floor(camera.x / TILE_SIZE);
//     const startY = Math.floor(camera.y / TILE_SIZE);
//     const endX = Math.ceil((camera.x + camera.width) / TILE_SIZE);
//     const endY = Math.ceil((camera.y + camera.height) / TILE_SIZE);

//     for (let y = startY; y < endY; y++) {
//       for (let x = startX; x < endX; x++) {
//         const chunkX = Math.floor(x / CHUNK_SIZE);
//         const chunkY = Math.floor(y / CHUNK_SIZE);
//         const tileX = x % CHUNK_SIZE;
//         const tileY = y % CHUNK_SIZE;

//         const chunk = this.world.chunks[`${chunkX},${chunkY}`];
//         if (chunk) {
//           const biome = chunk.biome;
//           ctx.fillStyle = TILE_COLORS[biome] || "#000";
//           ctx.fillRect(x * TILE_SIZE - camera.x, y * TILE_SIZE - camera.y, TILE_SIZE, TILE_SIZE);
//         }
//       }
//     }
//   }
// }