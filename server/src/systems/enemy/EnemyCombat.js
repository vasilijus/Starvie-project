import { AI } from './EnemyConfig.js';

export function tryAttack(enemy, player) {
    const now = Date.now();
    if (!enemy.lastAttackTime) enemy.lastAttackTime = 0;

    const attackCooldown = enemy?.attackCooldown ?? AI.ATTACK_COOLDOWN;
    const attackDamage = enemy?.attackDamage ?? AI.ATTACK_DAMAGE;

    if (attackDamage <= 0) return;
    if (now - enemy.lastAttackTime < attackCooldown) return;

    player.takeDamage(attackDamage);
    enemy.lastAttackTime = now;
}
