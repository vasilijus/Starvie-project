import { CHUNK_SIZE, TILE_SIZE, WORLD_CHUNKS } from './WorldRenderer.js';

const TILE_COLORS = {
    "snow": "#FFFFF0",
    "forest": "#228B22",
    "plains": "#7CFC00",
    "desert": "#EDC9AF"
};

const BIOMES = ["plains", "forest", "desert", "snow"];

export class MapEditor {
    constructor(canvas, ctx, player, worldRenderer, network = null) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.player = player;
        this.worldRenderer = worldRenderer;
        this.network = network;
        this.isActive = false;
        this.selectedBiome = "plains";
        this.world = null;

        // Editor UI
        this.setupUI();
    }

    setupUI() {
        // Create editor UI container
        const editorUI = document.createElement('div');
        editorUI.id = 'editorUI';
        editorUI.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid #0f9;
      border-radius: 5px;
      padding: 15px;
      color: #0f9;
      font-family: monospace;
      font-size: 12px;
      z-index: 500;
      display: none;
    `;

        editorUI.innerHTML = `
      <div>MAP EDITOR</div>
      <div style="margin-top: 10px;">
        <div>Biome: <span id="biomeName">plains</span></div>
        <div style="margin: 5px 0;">
          ${BIOMES.map(b => `<button id="biome-${b}" style="margin: 2px; padding: 5px 10px; background: ${TILE_COLORS[b]}; color: #000; border: 1px solid #333; cursor: pointer; border-radius: 3px;">${b}</button>`).join('')}
        </div>
      </div>
      <div style="margin-top: 10px;">
        <button id="gridToggle" style="margin: 5px 0; width: 100%; padding: 8px; background: #0f9; color: #000; border: none; cursor: pointer; border-radius: 3px; font-weight: bold;">Show Grid (G)</button>
      </div>
      <div style="margin-top: 10px;">
        <button id="exportBtn" style="margin: 5px 0; width: 100%; padding: 8px; background: #09f; color: #000; border: none; cursor: pointer; border-radius: 3px;">Export JSON</button>
        <button id="importBtn" style="margin: 5px 0; width: 100%; padding: 8px; background: #f90; color: #000; border: none; cursor: pointer; border-radius: 3px;">Import JSON</button>
        <button id="saveBtn" style="margin: 5px 0; width: 100%; padding: 8px; background: #0f0; color: #000; border: none; cursor: pointer; border-radius: 3px; font-weight: bold;">Save to Server</button>
      </div>
      <div style="margin-top: 10px; font-size: 10px; color: #077;">
        Click to paint | M to toggle | G to grid
      </div>
    `;

        document.body.appendChild(editorUI);
        this.editorUI = editorUI;

        // Biome buttons
        BIOMES.forEach(biome => {
            document.getElementById(`biome-${biome}`).addEventListener('click', () => {
                this.selectedBiome = biome;
                document.getElementById('biomeName').textContent = biome;
            });
        });

        // Grid toggle
        let showGrid = false;
        document.getElementById('gridToggle').addEventListener('click', () => {
            showGrid = !showGrid;
            this.showGrid = showGrid;
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportMap());

        // Import button
        document.getElementById('importBtn').addEventListener('click', () => this.importMap());

        // Save to server button
        document.getElementById('saveBtn').addEventListener('click', () => this.saveToServer());
    }

    toggle() {
        this.isActive = !this.isActive;
        this.editorUI.style.display = this.isActive ? 'block' : 'none';
        console.log(`Editor Mode: ${this.isActive ? 'ON' : 'OFF'}`);
    }

    setWorld(world) {
        this.world = world;
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY, player) {
        const worldX = player.x + (screenX - this.canvas.width / 2);
        const worldY = player.y + (screenY - this.canvas.height / 2);
        console.log(`Screen: (${screenX}, ${screenY}) → World: (${worldX.toFixed(0)}, ${worldY.toFixed(0)}) | Player: (${player.x.toFixed(0)}, ${player.y.toFixed(0)})`);
        return { worldX, worldY };
    }

    // Convert world coordinates to chunk coordinates
    worldToChunk(worldX, worldY) {
        const chunkX = Math.floor(worldX / (CHUNK_SIZE * TILE_SIZE));
        const chunkY = Math.floor(worldY / (CHUNK_SIZE * TILE_SIZE));
        return { chunkX, chunkY };
    }

    // Paint a chunk with selected biome
    paintChunk(worldX, worldY) {
        const { chunkX, chunkY } = this.worldToChunk(worldX, worldY);
        const chunkKey = `${chunkX},${chunkY}`;

        if (!this.world || !this.world.chunks) {
            console.warn('World not initialized in editor');
            return;
        }

        // Clamp to valid chunk range (0 to WORLD_CHUNKS-1)
        const WORLD_CHUNKS = 10; // Match server value
        if (chunkX < 0 || chunkY < 0 || chunkX >= WORLD_CHUNKS || chunkY >= WORLD_CHUNKS) {
            console.warn(`Chunk [${chunkX}, ${chunkY}] is outside world bounds (0-${WORLD_CHUNKS - 1})`);
            return;
        }

        if (chunkKey in this.world.chunks) {
            const oldBiome = this.world.chunks[chunkKey].biome;
            this.world.chunks[chunkKey].biome = this.selectedBiome;

            // Regenerate tiles array to match new biome (10x10 = 100 tiles)
            const CHUNK_SIZE = 10;
            this.world.chunks[chunkKey].tiles = new Array(CHUNK_SIZE * CHUNK_SIZE).fill(this.selectedBiome);

            console.log(`✓ Painted chunk [${chunkX}, ${chunkY}] from ${oldBiome} to ${this.selectedBiome}`);
            console.log(`  Chunk data after paint:`, JSON.stringify(this.world.chunks[chunkKey]));
        } else {
            console.warn(`Chunk ${chunkKey} not found in world (valid keys: ${Object.keys(this.world.chunks).slice(0, 5).join(', ')}...)`);
        }
    }

    // Draw chunk grid overlay
    drawGrid(ctx, player) {
        if (!this.showGrid) return;

        const px = player.x;
        const py = player.y;
        const chunkPixelSize = CHUNK_SIZE * TILE_SIZE;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;

        // Draw vertical lines
        for (let cx = -2; cx < WORLD_CHUNKS + 2; cx++) {
            const x = cx * chunkPixelSize - px + ctx.canvas.width / 2;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ctx.canvas.height);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let cy = -2; cy < WORLD_CHUNKS + 2; cy++) {
            const y = cy * chunkPixelSize - py + ctx.canvas.height / 2;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(ctx.canvas.width, y);
            ctx.stroke();
        }

        // Draw chunk coordinates
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px monospace';
        for (let cx = 0; cx < WORLD_CHUNKS; cx++) {
            for (let cy = 0; cy < WORLD_CHUNKS; cy++) {
                const x = cx * chunkPixelSize - px + ctx.canvas.width / 2 + 5;
                const y = cy * chunkPixelSize - py + ctx.canvas.height / 2 + 15;
                ctx.fillText(`[${cx},${cy}]`, x, y);
            }
        }
    }

    // Export map to JSON
    exportMap() {
        if (!this.world || !this.world.chunks) {
            alert('No world to export');
            return;
        }

        const exportData = JSON.stringify(this.world.chunks, null, 2);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `map-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('Map exported as JSON');
    }

    // Import map from JSON file
    importMap() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const chunks = JSON.parse(event.target.result);

                    // Validate chunks structure
                    for (const key in chunks) {
                        if (!chunks[key].biome) {
                            chunks[key].biome = 'plains';
                        }
                    }

                    // Update world
                    if (this.world) {
                        this.world.chunks = chunks;
                        console.log('Map imported successfully');
                    }
                } catch (err) {
                    alert('Invalid JSON file: ' + err.message);
                }
            };
            reader.readAsText(file);
        });

        input.click();
    }

    // Save map to server (automatically loads it)
    saveToServer() {
        if (!this.world || !this.world.chunks) {
            alert('No world to save');
            return;
        }

        if (!this.network) {
            alert('Network connection not available');
            return;
        }

        // Log what we're about to send
        console.log(`Saving ${Object.keys(this.world.chunks).length} chunks to server...`);
        console.log('Sample chunks being saved:', {
            '0,0': this.world.chunks['0,0'],
            '1,1': this.world.chunks['1,1'],
            '5,5': this.world.chunks['5,5']
        });

        // Send chunks to server
        this.network.emit('saveMap', this.world.chunks);

        // Listen for response
        this.network.on('mapSaveResult', (result) => {
            if (result.success) {
                alert('✓ Map saved to server successfully!');
                console.log(result.message);
            } else {
                alert('✗ Failed to save map: ' + result.message);
            }
        });
    }
}
