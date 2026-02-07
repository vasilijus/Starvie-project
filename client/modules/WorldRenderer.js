
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

        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const chunkPixelSize = CHUNK_SIZE * TILE_SIZE;

        // Calculate which chunks are within the viewport
        // Add padding to render chunks slightly off-screen for smooth scrolling
        const padding = chunkPixelSize;
        const minScreenX = -padding;
        const maxScreenX = canvasWidth + padding;
        const minScreenY = -padding;
        const maxScreenY = canvasHeight + padding;

        for (const key in world.chunks) {
            const chunk = world.chunks[key];
            if (!chunk) continue;

            const [chunkX, chunkY] = key.split(',').map(Number);
            const baseX = chunkX * chunkPixelSize - px + canvasWidth / 2;
            const baseY = chunkY * chunkPixelSize - py + canvasHeight / 2;

            // Viewport culling: only render if chunk is visible or near-visible
            if (baseX + chunkPixelSize < minScreenX || baseX > maxScreenX ||
                baseY + chunkPixelSize < minScreenY || baseY > maxScreenY) {
                continue; // Skip rendering this chunk
            }

            const biome = chunk.biome || 'plains';
            const color = TILE_COLORS[biome] || TILE_COLORS['plains'];
            ctx.fillStyle = color;
            ctx.fillRect(baseX, baseY, chunkPixelSize, chunkPixelSize);
        }
    }
}