import { EnemyState, AI } from './EnemyConfig.js';

function getEnemyRanges(enemy) {
    return {
        huntRangeSq: enemy?.huntRangeSq ?? AI.HUNT_RANGE_SQ,
        attackRangeSq: enemy?.attackRangeSq ?? AI.ATTACK_RANGE_SQ,
        fleeRangeSq: enemy?.fleeRangeSq ?? AI.FLEE_RANGE_SQ
    };
}

export function updateEnemyState(enemy, closestPlayer, distSq) {
    const { huntRangeSq, attackRangeSq, fleeRangeSq } = getEnemyRanges(enemy);

    if (enemy?.isPassive) {
        if (distSq < fleeRangeSq) {
            enemy.state = EnemyState.FLEE;
        } else {
            enemy.state = EnemyState.IDLE;
        }
        return;
    }

    switch (enemy.state) {
        case EnemyState.IDLE:
            if (distSq < huntRangeSq) enemy.state = EnemyState.CHASE;
            break;

        case EnemyState.CHASE:
            if (distSq < attackRangeSq) enemy.state = EnemyState.ATTACK;
            else if (distSq > huntRangeSq) enemy.state = EnemyState.IDLE;
            break;

        case EnemyState.ATTACK:
            if (distSq > attackRangeSq) enemy.state = EnemyState.CHASE;
            break;

        case EnemyState.FLEE:
            if (distSq > fleeRangeSq) enemy.state = EnemyState.IDLE;
            break;
    }
}
