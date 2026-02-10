import express from "express";
import http from "http";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";
import { generateWorld, WORLD_CHUNKS, CHUNK_SIZE, TILE_SIZE, setHandmadeMap } from "./map/ProceduralMap.js";
import { ServerPlayer } from './modules/ServerPlayer.js';
import { Wolf, Bear, EN_TYPES } from "./modules/EnemyTypes.js";
// import { generateGUID } from "./util/GUID.js";
import { ResourceFactory } from "./modules/resources/ResourceFactory.js";
import { getHitPoint, findHitEnemy, findHitResource } from "./gameplay/TargetingSystem.js";
import { attackEnemy } from "./gameplay/CombatSystem.js";
import { collectEnemyDrop, harvestWorldResource } from "./gameplay/HarvestSystem.js";
import { applyPlayerMovement } from "./gameplay/MovementSystem.js";
import { updateFacingDirection } from "./gameplay/PlayerStateSystem.js";
import { updateEnemiesAI } from "./gameplay/enemy/EnemySystem.js";


// server tick movement queue
// This keeps everything synced and deterministic.
const movementQueue = [];

// Try to load a saved map from server/maps/map.json
function loadMapFromFile() {
    const mapPath = path.join(process.cwd(), 'server', 'maps', 'map.json');
    // console.log(`Map path: ${mapPath}`)
    try {
        if (fs.existsSync(mapPath)) {
            const mapData = fs.readFileSync(mapPath, 'utf8');
            const chunks = JSON.parse(mapData);
            // console.log(`✓ Loaded map from ${mapPath}`);
            setHandmadeMap(chunks);
            return true;
        }
    } catch (err) {
        console.warn(`⚠ Failed to load map: ${err.message}`);
    }
    return false;
}

// Load map at startup
loadMapFromFile();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("../client"));

// Initialize world
const world = generateWorld();
// console.log(`World initialized with chunks: ${Object.keys(world.chunks).length}`);

// Load resources from world chunks using ResourceFactory
function loadResourcesFromChunks() {
    const loadedResources = [];
    for (const key in world.chunks) {
        const chunk = world.chunks[key];
        if (chunk.resources && Array.isArray(chunk.resources)) {
            // Create instances using ResourceFactory
            for (const resourceData of chunk.resources) {
                try {
                    const resource = ResourceFactory.createResource(
                        resourceData.type,
                        resourceData.x,
                        resourceData.y
                    );
                    // Override icon color if provided
                    if (resourceData.icon_color) {
                        resource.icon_color = resourceData.icon_color;
                    }
                    loadedResources.push(resource);
                } catch (err) {
                    console.warn(`Failed to create resource of type ${resourceData.type}: ${err.message}`);
                }
            }
        }
    }
    return loadedResources;
}

const WORLD_SIZE = WORLD_CHUNKS * CHUNK_SIZE * TILE_SIZE; // Calculate world size based on chunks, chunk size, and tile size  

const players = {};
const enemies = [
    // Example enemy data
    // "enemy1": { x: 500, y: 500, hp: 50 },
    // "enemy2": { x: 1500, y: 1500, hp: 75 }
];
const resources = loadResourcesFromChunks();
const enemyDrops = []; // Track drops from defeated enemies


// Spawn enemies at random positions within the world
for (let i = 0; i < 20; i++) {
    const id = `enemy${i}`;
    const num = Math.floor(Math.random() * EN_TYPES);
    let mob;
    // const id = generateGUID();
    const [xPos, yPos] = [Math.floor(Math.random() * WORLD_SIZE), Math.floor(Math.random() * WORLD_SIZE)]
    switch (num) {
        case 1:
            mob = new Wolf("w_" + id, xPos, yPos)
            break;

        default:
            mob = new Bear("b_" + id, xPos, yPos)
            break;
    }

    enemies.push(mob)
}


io.on("connection", socket => {
    players[socket.id] = new ServerPlayer(
        socket.id,
        `Player_${socket.id.substring(0, 8)}`,
        Math.floor(Math.random() * WORLD_SIZE),
        Math.floor(Math.random() * WORLD_SIZE)
    );


    socket.on("playerJoin", (data) => {
        const p = players[socket.id];
        if (p && data.name) {
            p.name = data.name;
            console.log(`Player ${socket.id} joined as: ${p.name}`);
        }
    });


    // Save map from client editor
    socket.on("saveMap", (chunksData) => {
        if (!chunksData || typeof chunksData !== 'object') {
            console.warn('Invalid map data received');
            socket.emit('mapSaveResult', { success: false, message: 'Invalid data' });
            return;
        }

        try {
            // Log what we received
            // console.log(`📥 Received map save request with ${Object.keys(chunksData).length} chunks`);
            // console.log(`  Sample chunk [0,0]: ${JSON.stringify(chunksData['0,0'])}`);

            // Ensure maps directory exists
            const mapsDir = path.join(process.cwd(), 'server', 'maps');
            if (!fs.existsSync(mapsDir)) {
                fs.mkdirSync(mapsDir, { recursive: true });
            }

            const mapPath = path.join(mapsDir, 'map.json');
            const mapJson = JSON.stringify(chunksData, null, 2);
            fs.writeFileSync(mapPath, mapJson, 'utf8');

            // Update server world with new chunks
            world.chunks = chunksData;
            // console.log(`✓ Map saved and loaded: ${mapPath}`);
            // console.log(`  Sample chunk [0,0] after load: ${JSON.stringify(world.chunks['0,0'])}`);
            // console.log(`  Total chunks: ${Object.keys(world.chunks).length}`);

            socket.emit('mapSaveResult', { success: true, message: 'Map saved successfully' });
        } catch (err) {
            console.error(`✗ Failed to save map: ${err.message}`);
            socket.emit('mapSaveResult', { success: false, message: err.message });
        }
    });


    // socket.on("playerInput", (dir) => {
    //     const player = players[socket.id];
    //     applyPlayerMovement(player, dir, WORLD_SIZE);
    // });
    socket.on("playerInput", (dir) => {
        movementQueue.push({
            id: socket.id,
            dir
        });
    });

    
    socket.on("playerFacingDirection", (direction) => {
        const player = players[socket.id];
        updateFacingDirection(player, direction);
    });

    
    socket.on("harvestResource", (resourceId) => {
        const player = players[socket.id];
        if (!player) return;

        // Try world resource first
        const resourceIndex = resources.findIndex(r => r.id === resourceId);
        if (resourceIndex !== -1) {
            harvestWorldResource(player, resources[resourceIndex]);
            return;
        }

        // Try enemy drop
        const dropIndex = enemyDrops.findIndex(d => d.id === resourceId);
        if (dropIndex !== -1) {
            const collected = collectEnemyDrop(player, enemyDrops[dropIndex]);
            if (collected) enemyDrops.splice(dropIndex, 1);
        }
    });


    socket.on("playerAction", (data) => {
        const player = players[socket.id];
        if (!player?.isAlive) return;

        const hitPoint = getHitPoint(player, data.direction);

        // 1️⃣ Try hit enemy first
        const enemy = findHitEnemy(hitPoint, enemies);

        if (enemy) {
            const result = attackEnemy(player, enemy, enemyDrops);

            if (result.killed) {
                const index = enemies.indexOf(enemy);
                enemies.splice(index, 1);
            }

            io.emit('hitEffect', { x: hitPoint.x, y: hitPoint.y, type: 'combat' });
            return;
        }

        // 2️⃣ Otherwise try harvest resource
        const resource = findHitResource(hitPoint, resources);

        if (resource && harvestWorldResource(player, resource)) {
            io.emit('hitEffect', { x: hitPoint.x, y: hitPoint.y, type: 'gather' });
        }
    });


    socket.on("disconnect", () => {
        // Remove player from the game when they disconnect
        delete players[socket.id];
    });
});


// --------------------------------------------------
// MOVEMENT TICK SYSTEM
// --------------------------------------------------

function processMovementQueue() {
    while (movementQueue.length > 0) {
        const { id, dir } = movementQueue.shift();
        const player = players[id];
        applyPlayerMovement(player, dir, WORLD_SIZE);
    }
}


// --------------------------------------------------
// PERFORMANCE HELPERS
// --------------------------------------------------

// Squared distance (avoids expensive sqrt every frame)
const getDistSq = (x1, y1, x2, y2) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy;
};

const clampToWorld = (entity) => {
    entity.x = Math.max(0, Math.min(WORLD_SIZE, entity.x));
    entity.y = Math.max(0, Math.min(WORLD_SIZE, entity.y));
};


// --------------------------------------------------
// PLAYER SYSTEM
// --------------------------------------------------

function getAlivePlayers() {
    const alive = [];

    for (const id in players) {
        const p = players[id];

        if (p.hp <= 0) {
            delete players[id]; // cleanup happens ONCE per frame
            continue;
        }

        alive.push(p);
    }

    return alive;
}


// --------------------------------------------------
// RESOURCE SYSTEM
// --------------------------------------------------

function updateResources(delta) {
    for (const r of resources) {
        r.updateRespawn?.(delta);
    }
}

function cleanupDrops() {
    for (let i = enemyDrops.length - 1; i >= 0; i--) {
        if (enemyDrops[i].shouldDespawn()) {
            enemyDrops.splice(i, 1);
        }
    }
}


// --------------------------------------------------
// ENEMY SYSTEM
// --------------------------------------------------

const HUNT_RANGE_SQ = 200 * 200;
const COLLISION_SQ = 20 * 20;
const ATTACK_RANGE_SQ = 25 * 25;

function findClosestPlayer(enemy, alivePlayers) {
    let closest = null;
    let bestDist = Infinity;

    for (const p of alivePlayers) {
        const d = getDistSq(enemy.x, enemy.y, p.x, p.y);
        if (d < bestDist) {
            bestDist = d;
            closest = p;
        }
    }

    return { closest, bestDist };
}

function moveEnemyTowards(enemy, target) {
    const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
    const newX = enemy.x + Math.cos(angle) * 2;
    const newY = enemy.y + Math.sin(angle) * 2;

    // prevent overlapping player
    if (getDistSq(newX, newY, target.x, target.y) > COLLISION_SQ) {
        enemy.x = newX;
        enemy.y = newY;
    }
}

function moveEnemyRandom(enemy, alivePlayers) {
    if (!enemy.moveDirection || Math.random() < 0.01) {
        const angle = Math.random() * Math.PI * 2;
        enemy.moveDirection = { x: Math.cos(angle), y: Math.sin(angle) };
    }

    const newX = enemy.x + enemy.moveDirection.x;
    const newY = enemy.y + enemy.moveDirection.y;

    // avoid bumping into players
    for (const p of alivePlayers) {
        if (getDistSq(newX, newY, p.x, p.y) <= COLLISION_SQ) return;
    }

    enemy.x = newX;
    enemy.y = newY;
}

function enemyAttack(enemy, player) {
    if (getDistSq(enemy.x, enemy.y, player.x, player.y) > ATTACK_RANGE_SQ) return;

    const now = Date.now();
    if (!enemy.lastAttackTime) enemy.lastAttackTime = 0;

    if (now - enemy.lastAttackTime > 1000) {
        player.takeDamage(10);
        enemy.lastAttackTime = now;
    }
}

// function updateEnemies(alivePlayers) {
//     if (alivePlayers.length === 0) return;

//     for (const enemy of enemies) {
//         const { closest, bestDist } = findClosestPlayer(enemy, alivePlayers);

//         if (closest && bestDist < HUNT_RANGE_SQ) {
//             moveEnemyTowards(enemy, closest);
//             enemyAttack(enemy, closest);
//         } else {
//             moveEnemyRandom(enemy, alivePlayers);
//         }

//         clampToWorld(enemy);
//     }
// }


// --------------------------------------------------
// NETWORK SYSTEM
// --------------------------------------------------

function broadcastState() {
    const statePlayers = Object.fromEntries(
        Object.entries(players).map(([id, p]) => [id, p.toClient()])
    );

    io.emit("state", {
        players: statePlayers,
        enemies,
        world,
        resources: resources.map(r => r.toObject?.() ?? r),
        enemyDrops: enemyDrops.map(d => d.toObject())
    });
}


// Broadcast game state to all clients at 30 FPS
// --------------------------------------------------
// MAIN GAME LOOP (30 FPS)
// --------------------------------------------------

const TICK_RATE = 1000 / 30;

setInterval(() => {
    const delta = TICK_RATE;

    processMovementQueue();     // 🆕 movement first
    
    // 1️⃣ Update resource respawns
    updateResources(delta);

    // 2️⃣ Remove expired drops
    cleanupDrops();

    // 3️⃣ Remove dead players once per frame
    const alivePlayers = getAlivePlayers();

    // 4️⃣ Run enemy AI using cached alive players
    // updateEnemies(alivePlayers);
    updateEnemiesAI(enemies, alivePlayers, WORLD_SIZE);

    // 5️⃣ Send state to clients
    broadcastState();

}, TICK_RATE);



const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
