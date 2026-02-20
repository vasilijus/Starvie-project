import { EnemyState } from './EnemyConfig.js';
import { updateEnemyState } from './EnemyBrain.js';
import { wander, chase, flee } from './EnemyMovement.js';
import { tryAttack } from './EnemyCombat.js';

const getDistSq = (x1, y1, x2, y2) => {
    const dx = x1 - x2; const dy = y1 - y2;
    return dx * dx + dy * dy;
};

function findClosestPlayer(enemy, players) {
    let closest = null;
    let best = Infinity;

    for (const p of players) {
        const d = getDistSq(enemy.x, enemy.y, p.x, p.y);
        if (d < best) {
            best = d;
            closest = p;
        }
    }

    return { closest, best };
}

export function updateEnemiesAI(enemies, alivePlayers, worldSize, resources = []) {
    if (alivePlayers.length === 0) return;

    for (const enemy of enemies) {
        if (!enemy.state) enemy.state = EnemyState.IDLE;

        const { closest, best } = findClosestPlayer(enemy, alivePlayers);
        if (!closest) continue;

        updateEnemyState(enemy, closest, best);

        switch (enemy.state) {
            case EnemyState.IDLE:
                wander(enemy, alivePlayers, resources);
                break;
            case EnemyState.CHASE:
                chase(enemy, closest, resources);
                break;
            case EnemyState.ATTACK:
                tryAttack(enemy, closest);
                break;
            case EnemyState.FLEE:
                flee(enemy, closest, resources);
                break;
        }

        enemy.x = Math.max(0, Math.min(worldSize, enemy.x));
        enemy.y = Math.max(0, Math.min(worldSize, enemy.y));
    }
}
