// --------------------------------------------------
// PLAYER MOVEMENT SYSTEM (Server Authoritative)
// --------------------------------------------------

const BASE_MOVE_SPEED = 5;
const WORLD_PADDING = 0; // future collision padding

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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
    const previousX = player.x;
    const previousY = player.y;
    const nextX = previousX + dir.x * speed;
    const nextY = previousY + dir.y * speed;

    // 4️⃣ Apply movement with axis-separate collision for simple sliding
    player.x = nextX;
    player.y = previousY;
    if (isCollidingWithSolidResource(player, resources)) player.x = previousX;

    player.y = nextY;
    if (isCollidingWithSolidResource(player, resources)) player.y = previousY;

    // 5️⃣ Keep player inside world bounds
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
    player.x = clamp(player.x, WORLD_PADDING, worldSize);
    player.y = clamp(player.y, WORLD_PADDING, worldSize);
}


function isCollidingWithSolidResource(player, resources) {
    const playerRadius = Math.max(2, (player.size || 20) / 2);

    for (const resource of resources) {
        if (!resource?.isSolid) continue;

        const collisionRadius = Math.max(0, resource.collisionRadius || 0);
        if (collisionRadius <= 0) continue;

        const dx = player.x - resource.x;
        const dy = player.y - resource.y;
        const minDistance = playerRadius + collisionRadius;

        if ((dx * dx + dy * dy) < (minDistance * minDistance)) {
            return true;
        }
    }

    return false;
}
