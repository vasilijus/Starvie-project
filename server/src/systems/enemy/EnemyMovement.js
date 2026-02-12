import { AI } from "./EnemyConfig.js";

const getDistSq = (x1, y1, x2, y2) => {
    const dx = x1 - x2; const dy = y1 - y2;
    return dx * dx + dy * dy;
};

function isCollidingWithSolidResource(entity, resources) {
    const entityRadius = Math.max(2, (entity.size || 20) / 2);

    for (const resource of resources) {
        if (!resource?.isSolid) continue;

        const collisionRadius = Math.max(0, resource.collisionRadius || 0);
        if (collisionRadius <= 0) continue;

        const minDistance = entityRadius + collisionRadius;
        if (getDistSq(entity.x, entity.y, resource.x, resource.y) < (minDistance * minDistance)) {
            return true;
        }
    }

    return false;
}

function applyEnemyMovement(enemy, targetX, targetY, resources = []) {
    const previousX = enemy.x;
    const previousY = enemy.y;

    enemy.x = targetX;
    enemy.y = previousY;
    if (isCollidingWithSolidResource(enemy, resources)) enemy.x = previousX;

    enemy.y = targetY;
    if (isCollidingWithSolidResource(enemy, resources)) enemy.y = previousY;
}

export function wander(enemy, alivePlayers, resources = []) {
    if (!enemy.moveDirection || Math.random() < 0.01) {
        const angle = Math.random() * Math.PI * 2;
        enemy.moveDirection = { x: Math.cos(angle), y: Math.sin(angle) };
    }

    const newX = enemy.x + enemy.moveDirection.x * AI.WANDER_SPEED;
    const newY = enemy.y + enemy.moveDirection.y * AI.WANDER_SPEED;

    for (const p of alivePlayers) {
        if (getDistSq(newX, newY, p.x, p.y) <= AI.COLLISION_SQ) return;
    }

    applyEnemyMovement(enemy, newX, newY, resources);
}

export function chase(enemy, player, resources = []) {
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    const newX = enemy.x + Math.cos(angle) * AI.CHASE_SPEED;
    const newY = enemy.y + Math.sin(angle) * AI.CHASE_SPEED;

    applyEnemyMovement(enemy, newX, newY, resources);
}
