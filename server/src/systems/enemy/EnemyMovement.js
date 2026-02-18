import { applyAxisSeparatedMovement } from '../collision/SolidResourceCollision.js';
import { AI } from './EnemyConfig.js';

const getDistSq = (x1, y1, x2, y2) => {
    const dx = x1 - x2; const dy = y1 - y2;
    return dx * dx + dy * dy;
};

const getEntityRadius = (entity) => Math.max(2, (entity?.size || 20) / 2);

function getWanderSpeed(enemy) {
    return enemy?.wanderSpeed ?? AI.WANDER_SPEED;
}

function getChaseSpeed(enemy, target) {
    let speed = enemy?.chaseSpeed ?? AI.CHASE_SPEED;

    if (enemy?.lowHealthTargetSpeedMultiplier && target?.hpMax > 0) {
        const hpRatio = target.hp / target.hpMax;
        if (hpRatio <= 0.5) speed *= enemy.lowHealthTargetSpeedMultiplier;
    }

    return speed;
}

function getFleeSpeed(enemy) {
    return enemy?.fleeSpeed ?? AI.FLEE_SPEED;
}

export function wander(enemy, alivePlayers, resources = []) {
    if (!enemy.moveDirection || Math.random() < 0.01) {
        const angle = Math.random() * Math.PI * 2;
        enemy.moveDirection = { x: Math.cos(angle), y: Math.sin(angle) };
    }

    const speed = getWanderSpeed(enemy);
    const newX = enemy.x + enemy.moveDirection.x * speed;
    const newY = enemy.y + enemy.moveDirection.y * speed;

    const enemyRadius = getEntityRadius(enemy);
    for (const p of alivePlayers) {
        const playerRadius = getEntityRadius(p);
        const minDistance = enemyRadius + playerRadius;
        if (getDistSq(newX, newY, p.x, p.y) <= (minDistance * minDistance)) return;
    }

    applyAxisSeparatedMovement(enemy, newX, newY, resources);
}

export function chase(enemy, player, resources = []) {
    const enemyRadius = getEntityRadius(enemy);
    const playerRadius = getEntityRadius(player);
    const stopDistance = enemyRadius + playerRadius + 2;
    if (getDistSq(enemy.x, enemy.y, player.x, player.y) <= (stopDistance * stopDistance)) {
        return;
    }

    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    const speed = getChaseSpeed(enemy, player);

    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;

    // Agile trait: sidestep unpredictably while closing distance
    if (enemy?.agileDodgeChance && Math.random() < enemy.agileDodgeChance) {
        const side = Math.random() < 0.5 ? -1 : 1;
        const perpendicular = angle + side * Math.PI / 2;
        vx += Math.cos(perpendicular) * speed * 0.45;
        vy += Math.sin(perpendicular) * speed * 0.45;
    }

    applyAxisSeparatedMovement(enemy, enemy.x + vx, enemy.y + vy, resources);
}

export function flee(enemy, player, resources = []) {
    const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
    const speed = getFleeSpeed(enemy);

    const newX = enemy.x + Math.cos(angle) * speed;
    const newY = enemy.y + Math.sin(angle) * speed;

    applyAxisSeparatedMovement(enemy, newX, newY, resources);
}
