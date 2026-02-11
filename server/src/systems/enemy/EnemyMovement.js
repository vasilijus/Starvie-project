import { AI } from "./EnemyConfig.js";

const getDistSq = (x1,y1,x2,y2)=>{
    const dx=x1-x2; const dy=y1-y2;
    return dx*dx+dy*dy;
};

export function wander(enemy, alivePlayers) {
    if (!enemy.moveDirection || Math.random() < 0.01) {
        const angle = Math.random() * Math.PI * 2;
        enemy.moveDirection = { x: Math.cos(angle), y: Math.sin(angle) };
    }

    const newX = enemy.x + enemy.moveDirection.x * AI.WANDER_SPEED;
    const newY = enemy.y + enemy.moveDirection.y * AI.WANDER_SPEED;

    for (const p of alivePlayers) {
        if (getDistSq(newX,newY,p.x,p.y) <= AI.COLLISION_SQ) return;
    }

    enemy.x = newX;
    enemy.y = newY;
}

export function chase(enemy, player) {
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.x += Math.cos(angle) * AI.CHASE_SPEED;
    enemy.y += Math.sin(angle) * AI.CHASE_SPEED;
}
