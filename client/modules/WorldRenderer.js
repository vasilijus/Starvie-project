
export const CHUNK_SIZE = 10;
export const TILE_SIZE = 32;
export const WORLD_CHUNKS = 10;

const WORLD_SIZE = WORLD_CHUNKS * CHUNK_SIZE * TILE_SIZE; // Calculate world size based on chunks, chunk size, and tile size

const TILE_COLORS = {
  "snow": "#FFFFF0",
  "forest": "#228B22",
  "plains": "#7CFC00",
  "desert": "#EDC9AF"
};

export class WorldRenderer {
    draw(ctx, world, player) {
        if (!ctx || !ctx.canvas) return;

        // If no world/chunks, clear to a sane default instead of leaving a black canvas
        if (!world || !world.chunks) {
            ctx.fillStyle = TILE_COLORS['plains'];
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            console.warn('WorldRenderer.draw: missing world or world.chunks');
            return;
        }

        // Use renderX/renderY only if they're finite numbers; otherwise fall back to player.x/y
        const px = Number.isFinite(player?.renderX) ? player.renderX
                 : Number.isFinite(player?.x) ? player.x : 0;
        const py = Number.isFinite(player?.renderY) ? player.renderY
                 : Number.isFinite(player?.y) ? player.y : 0;

        for (const key in world.chunks) {

            const chunk = world.chunks[key];
            // console.log(`World: key ${JSON.stringify(chunk)}`)
            if (!chunk) continue;
            const [chunkX, chunkY] = key.split(',').map(Number);
            const biome = chunk.biome || 'plains';
            const color = TILE_COLORS[biome] || TILE_COLORS['plains'];
            const baseX = chunkX * CHUNK_SIZE * TILE_SIZE - px + ctx.canvas.width / 2;
            const baseY = chunkY * CHUNK_SIZE * TILE_SIZE - py + ctx.canvas.height / 2;
            ctx.fillStyle = color;
            ctx.fillRect(baseX, baseY, CHUNK_SIZE * TILE_SIZE, CHUNK_SIZE * TILE_SIZE);
        }
    }
}