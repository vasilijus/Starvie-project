
export const CHUNK_SIZE = 10;
export const TILE_SIZE = 64;
export const WORLD_CHUNKS = 10;

const WORLD_SIZE = WORLD_CHUNKS * CHUNK_SIZE * TILE_SIZE; // Calculate world size based on chunks, chunk size, and tile size

const TILE_COLORS = {
    "snow": "#FFFFF0",
    "forest": "#228B22",
    "plains": "#7CFC00",
    "desert": "#EDC9AF",
    "swamp": "#6B8E23",
    "water": "#3d80d6",
    "mud": "#7a5a3a",
    "quicksand": "#c2b280"
};

export class WorldRenderer {
    draw(ctx, world, player) {
        if (!ctx || !ctx.canvas) return;

        // Keep rasterization stable to avoid hairline seams / chessboard-like tile borders.
        ctx.imageSmoothingEnabled = false;

        // If no world/chunks, clear to a sane default instead of leaving a black canvas
        if (!world || !world.chunks) {
            ctx.fillStyle = TILE_COLORS['plains'];
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            console.warn('WorldRenderer.draw: missing world or world.chunks');
            return;
        }

        // Use integer-aligned camera coordinates to avoid sub-pixel tile seams.
        const px = player?.x || 0;
        const py = player?.y || 0;

        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const chunkPixelSize = CHUNK_SIZE * TILE_SIZE;
        const cameraX = Math.round(px - canvasWidth / 2);
        const cameraY = Math.round(py - canvasHeight / 2);

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
            // Draw using integer world->screen transform shared by all chunks/tiles.
            const baseX = chunkX * chunkPixelSize - cameraX;
            const baseY = chunkY * chunkPixelSize - cameraY;

            // Viewport culling: only render if chunk is visible or near-visible
            if (baseX + chunkPixelSize < minScreenX || baseX > maxScreenX ||
                baseY + chunkPixelSize < minScreenY || baseY > maxScreenY) {
                continue; // Skip rendering this chunk
            }

            const defaultBiome = chunk.biome || 'plains';
            const tiles = Array.isArray(chunk.tiles) ? chunk.tiles : null;

            if (!tiles || tiles.length !== CHUNK_SIZE * CHUNK_SIZE) {
                const color = TILE_COLORS[defaultBiome] || TILE_COLORS['plains'];
                ctx.fillStyle = color;
                ctx.fillRect(baseX, baseY, chunkPixelSize, chunkPixelSize);
                continue;
            }

            for (let ty = 0; ty < CHUNK_SIZE; ty++) {
                for (let tx = 0; tx < CHUNK_SIZE; tx++) {
                    const tileBiome = tiles[ty * CHUNK_SIZE + tx] || defaultBiome;
                    const color = TILE_COLORS[tileBiome] || TILE_COLORS['plains'];
                    ctx.fillStyle = color;
                    const tileX = baseX + tx * TILE_SIZE;
                    const tileY = baseY + ty * TILE_SIZE;
                    ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }
}
