import { AI } from "./EnemyConfig.js";

export function tryAttack(enemy, player) {
    const now = Date.now();
    if (!enemy.lastAttackTime) enemy.lastAttackTime = 0;

    if (now - enemy.lastAttackTime < AI.ATTACK_COOLDOWN)
        return;

    player.takeDamage(10);
    enemy.lastAttackTime = now;
}
