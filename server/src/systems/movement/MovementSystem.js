import { applyAxisSeparatedMovement } from '../collision/SolidResourceCollision.js';

// --------------------------------------------------
// PLAYER MOVEMENT SYSTEM (Server Authoritative)
// --------------------------------------------------

const BASE_MOVE_SPEED = 5;
const WORLD_PADDING = 0; // future collision padding

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function getEntityRadius(entity) {
    return Math.max(2, (entity?.size || 20) / 2);
}

// Normalize vector to prevent faster diagonal movement
function normalizeDirection(dir) {
    const length = Math.hypot(dir.x, dir.y);
    if (length === 0) return { x: 0, y: 0 };

    return {
        x: dir.x / length,
        y: dir.y / length
    };
}

// Main movement entry point used by sockets
export function applyPlayerMovement(player, inputDir, worldSize, resources = []) {
    if (!player?.isAlive) return;

    // 1️⃣ Normalize input (prevents speed hacks)
    const dir = normalizeDirection(inputDir);

    // 2️⃣ Calculate final speed (future buffs/debuffs hook here)
    const speed = getPlayerSpeed(player);

    // 3️⃣ Calculate candidate position
    const nextX = player.x + dir.x * speed;
    const nextY = player.y + dir.y * speed;

    // 4️⃣ Apply movement with axis-separate collision for simple sliding
    applyAxisSeparatedMovement(player, nextX, nextY, resources);

    // 5️⃣ Keep player inside world bounds using center + radius semantics
    clampPlayerToWorld(player, worldSize);
}

// Future-proof speed calculation
function getPlayerSpeed(player) {
    let speed = BASE_MOVE_SPEED;

    // Hooks for future mechanics:
    // if (player.isSprinting) speed *= 1.5;
    // if (player.isSlowed) speed *= 0.5;
    // if (player.isStunned) speed = 0;

    return speed;
}

function clampPlayerToWorld(player, worldSize) {
    const radius = getEntityRadius(player);
    player.x = clamp(player.x, WORLD_PADDING + radius, worldSize - radius - WORLD_PADDING);
    player.y = clamp(player.y, WORLD_PADDING + radius, worldSize - radius - WORLD_PADDING);
}
