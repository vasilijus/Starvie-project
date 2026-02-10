import { EnemyState, AI } from "./EnemyConfig.js";

const getDistSq = (x1,y1,x2,y2)=>{
    const dx=x1-x2; const dy=y1-y2;
    return dx*dx+dy*dy;
};

export function updateEnemyState(enemy, closestPlayer, distSq) {
    switch (enemy.state) {

        case EnemyState.IDLE:
            if (distSq < AI.HUNT_RANGE_SQ)
                enemy.state = EnemyState.CHASE;
            break;

        case EnemyState.CHASE:
            if (distSq < AI.ATTACK_RANGE_SQ)
                enemy.state = EnemyState.ATTACK;
            else if (distSq > AI.HUNT_RANGE_SQ)
                enemy.state = EnemyState.IDLE;
            break;

        case EnemyState.ATTACK:
            if (distSq > AI.ATTACK_RANGE_SQ)
                enemy.state = EnemyState.CHASE;
            break;
    }
}
