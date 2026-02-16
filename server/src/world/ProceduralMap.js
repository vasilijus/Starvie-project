import { BIOME_RULES } from './BiomeRules.js';

export const CHUNK_SIZE = 10;
export const TILE_SIZE = 64;
export const WORLD_CHUNKS = 10;

const biomes = ["forest", "plains", "desert", "snow", "swamp"];
const WATER_TILE_CHANCE = 0.08;

function pseudoNoise(x, y, seed) {
    const v = Math.sin((x * 12.9898) + (y * 78.233) + (seed * 37.719)) * 43758.5453;
    return v - Math.floor(v);
}



function hashNoise(x, y, seed, salt = 0) {
    const value = Math.sin((x * 127.1) + (y * 311.7) + (seed * 74.7) + (salt * 19.19)) * 43758.5453123;
    return value - Math.floor(value);
}

function samplePointInTile(tileX, tileY, seed, salt = 0) {
    // Keep a small margin from tile edges to avoid clipping while avoiding dead-center placement.
    const margin = 0.12;
    const px = margin + hashNoise(tileX, tileY, seed, salt) * (1 - margin * 2);
    const py = margin + hashNoise(tileX + 17, tileY - 23, seed, salt + 7) * (1 - margin * 2);
    return { px, py };
}

function getResourceSpacing(density) {
    if (density <= 0.015) return 3;
    if (density <= 0.04) return 2;
    return 1;
}

function getClusterProfile(type, density) {
    const clusterTypes = new Set(['tree', 'rock', 'ore', 'ice', 'crystal', 'gem', 'gold']);
    if (!clusterTypes.has(type)) {
        return {
            clustered: false,
            clusters: 0,
            radius: 0,
            overlapChance: 0
        };
    }

    const baseClusters = Math.max(1, Math.round((CHUNK_SIZE * CHUNK_SIZE * density) / 4));
    return {
        clustered: true,
        clusters: Math.min(baseClusters, 6),
        radius: type === 'tree' ? 2.6 : 2.0,
        // Allow some resources in the exact same tile cell for denser deposits/woods.
        overlapChance: type === 'tree' ? 0.45 : 0.65
    };
}

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
    for (let cx = 0; cx < WORLD_CHUNKS; cx++) {
        for (let cy = 0; cy < WORLD_CHUNKS; cy++) {
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

    const chunkWorldTileX = cx * CHUNK_SIZE;
    const chunkWorldTileY = cy * CHUNK_SIZE;

    // Generate tiles with soft biome transitions and occasional water pockets.
    // This avoids hard square chunk borders by sampling neighboring chunk biomes.
    for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
            const worldTileX = chunkWorldTileX + x;
            const worldTileY = chunkWorldTileY + y;
            let tileBiome = biome;

            const fx = x / (CHUNK_SIZE - 1);
            const fy = y / (CHUNK_SIZE - 1);
            const leftWeight = Math.max(0, (0.30 - fx) / 0.30);
            const rightWeight = Math.max(0, (fx - 0.70) / 0.30);
            const topWeight = Math.max(0, (0.30 - fy) / 0.30);
            const bottomWeight = Math.max(0, (fy - 0.70) / 0.30);

            const blendOptions = [
                { w: leftWeight, biome: getProceduralBiome(cx - 1, cy, seed) },
                { w: rightWeight, biome: getProceduralBiome(cx + 1, cy, seed) },
                { w: topWeight, biome: getProceduralBiome(cx, cy - 1, seed) },
                { w: bottomWeight, biome: getProceduralBiome(cx, cy + 1, seed) },
                { w: leftWeight * topWeight, biome: getProceduralBiome(cx - 1, cy - 1, seed) },
                { w: rightWeight * topWeight, biome: getProceduralBiome(cx + 1, cy - 1, seed) },
                { w: leftWeight * bottomWeight, biome: getProceduralBiome(cx - 1, cy + 1, seed) },
                { w: rightWeight * bottomWeight, biome: getProceduralBiome(cx + 1, cy + 1, seed) }
            ];

            const tileNoise = pseudoNoise(worldTileX, worldTileY, seed);
            for (const option of blendOptions) {
                if (option.w <= 0 || option.biome === biome) continue;
                if (tileNoise < option.w * 0.85) {
                    tileBiome = option.biome;
                    break;
                }
            }

            // Add deterministic water pools, stronger in swamp/snow biomes.
            const waterNoise = pseudoNoise(worldTileX + 999, worldTileY + 999, seed);
            const waterBias = (tileBiome === 'swamp' ? 0.08 : 0) + (tileBiome === 'snow' ? 0.03 : 0);
            if (waterNoise < WATER_TILE_CHANCE + waterBias) {
                tileBiome = 'water';
            }

            tiles.push(tileBiome);
        }
    }

    // Track occupied tile positions to avoid extreme overstacking.
    const occupiedTiles = new Map();

    // Generate resources based on biome rules
    if (biomeRule.resources) {
        const chunkSeed = cx * 73856093 ^ cy * 19349663 ^ seed;

        for (const resourceRule of biomeRule.resources) {
            const { type, density, icon_color } = resourceRule;
            const expectedCount = Math.round((CHUNK_SIZE * CHUNK_SIZE) * density);
            const densityVariance = hashNoise(cx, cy, chunkSeed, type.charCodeAt(0)) * 0.4 + 0.8; // 0.8 -> 1.2
            const targetCount = Math.max(0, Math.round(expectedCount * densityVariance));
            const minSpacing = getResourceSpacing(density);
            const clusterProfile = getClusterProfile(type, density);

            const candidates = [];
            for (let tileY = 0; tileY < CHUNK_SIZE; tileY++) {
                for (let tileX = 0; tileX < CHUNK_SIZE; tileX++) {
                    const idx = tileY * CHUNK_SIZE + tileX;
                    if (tiles[idx] === 'water') continue;

                    const macroNoise = hashNoise(cx * CHUNK_SIZE + tileX, cy * CHUNK_SIZE + tileY, chunkSeed, type.length);
                    const localNoise = hashNoise(tileX, tileY, chunkSeed, type.charCodeAt(0));
                    const score = macroNoise * 0.65 + localNoise * 0.35;
                    candidates.push({ tileX, tileY, score });
                }
            }

            // Deterministic order gives stable generation while removing row/column patterns.
            candidates.sort((a, b) => b.score - a.score);

            const selected = [];

            if (clusterProfile.clustered) {
                const centers = [];
                for (let i = 0; i < clusterProfile.clusters; i++) {
                    const seedX = Math.floor(hashNoise(cx + i, cy - i, chunkSeed, type.length + i) * CHUNK_SIZE);
                    const seedY = Math.floor(hashNoise(cx - i, cy + i, chunkSeed, type.charCodeAt(0) + i) * CHUNK_SIZE);
                    centers.push({ x: seedX, y: seedY });
                }

                const clustered = candidates.map((candidate) => {
                    let minDistSq = Infinity;
                    for (const center of centers) {
                        const dx = candidate.tileX - center.x;
                        const dy = candidate.tileY - center.y;
                        const d2 = dx * dx + dy * dy;
                        if (d2 < minDistSq) minDistSq = d2;
                    }

                    const clusterFalloff = Math.exp(-minDistSq / (clusterProfile.radius * clusterProfile.radius));
                    const clusterScore = candidate.score * 0.45 + clusterFalloff * 0.55;
                    return { ...candidate, clusterScore };
                });

                clustered.sort((a, b) => b.clusterScore - a.clusterScore);

                const uniqueTarget = Math.max(1, targetCount);
                for (const candidate of clustered) {
                    if (selected.length >= uniqueTarget) break;

                    const key = `${candidate.tileX},${candidate.tileY}`;
                    const existingInTile = occupiedTiles.get(key) || 0;
                    if (existingInTile >= 1) continue;

                    let tooClose = false;
                    for (const placed of selected) {
                        const dx = placed.tileX - candidate.tileX;
                        const dy = placed.tileY - candidate.tileY;
                        if ((dx * dx + dy * dy) < (minSpacing * minSpacing)) {
                            tooClose = true;
                            break;
                        }
                    }
                    if (tooClose) continue;

                    occupiedTiles.set(key, existingInTile + 1);
                    selected.push(candidate);
                }

                // Intentionally avoid same-tile overlap to keep distribution even
                // and reduce dense clumps that feel unfair for interaction/collision.
            } else {
                for (const candidate of candidates) {
                    if (selected.length >= targetCount) break;

                    const key = `${candidate.tileX},${candidate.tileY}`;
                    const existingInTile = occupiedTiles.get(key) || 0;
                    if (existingInTile > 0) continue;

                    let tooClose = false;
                    for (const placed of selected) {
                        const dx = placed.tileX - candidate.tileX;
                        const dy = placed.tileY - candidate.tileY;
                        if ((dx * dx + dy * dy) < (minSpacing * minSpacing)) {
                            tooClose = true;
                            break;
                        }
                    }
                    if (tooClose) continue;

                    occupiedTiles.set(key, existingInTile + 1);
                    selected.push(candidate);
                }
            }

            for (const candidate of selected) {
                const variantSalt = type.charCodeAt(0) + (candidate.variantSalt || 0);
                const point = samplePointInTile(candidate.tileX, candidate.tileY, chunkSeed, variantSalt);
                const tileBaseX = cx * CHUNK_SIZE * TILE_SIZE + candidate.tileX * TILE_SIZE;
                const tileBaseY = cy * CHUNK_SIZE * TILE_SIZE + candidate.tileY * TILE_SIZE;

                resources.push({
                    type,
                    x: tileBaseX + point.px * TILE_SIZE,
                    y: tileBaseY + point.py * TILE_SIZE,
                    icon_color,
                    hp: 100,
                    hpMax: 100
                });
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
        const tiles = Array.isArray(handmadeChunks[key].tiles)
            ? handmadeChunks[key].tiles
            : new Array(CHUNK_SIZE * CHUNK_SIZE).fill(biome);

        // If handmade chunks don't define resources explicitly, fall back to
        // procedural resource generation so edited maps don't become empty.
        const authoredResources = handmadeChunks[key].resources;
        const hasAuthoredResources = Array.isArray(authoredResources) && authoredResources.length > 0;
        const procedural = generateChunk(cx, cy, seed);
        const resources = hasAuthoredResources ? authoredResources : procedural.resources;

        return { biome, tiles, resources };
    }

    // 2) Otherwise → procedural chunk
    return generateChunk(cx, cy, seed);
}
