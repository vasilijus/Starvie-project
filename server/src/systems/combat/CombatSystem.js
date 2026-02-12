// Handles ALL combat logic (damage, death, drops, XP)

export function attackEnemy(player, enemy, enemyDrops) {
    const baseDamage = player.stats.damage;
    const totalDamage = baseDamage * 1.0; // weapon multiplier can go here later

    enemy.hp -= totalDamage;

    if (enemy.hp > 0) return { killed: false };

    // Enemy died
    const drops = enemy.getResourceDrops(player.id);
    enemyDrops.push(...drops);

    player.addXP(enemy.xpWorth);

    return {
        killed: true,
        dropsCreated: drops.length
    };
}
