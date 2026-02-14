import { getEnemyShapeDefinition } from '../definitions/enemyShapeDefinitions.js';

export function drawEnemy(ctx, enemy, x, y) {
    const shape = getEnemyShapeDefinition(enemy.enemyType);

    ctx.fillStyle = enemy.color;

    // Keep current behavior as default for non-breaking refactor.
    if (shape.kind === 'square') {
        ctx.fillRect(x, y, enemy.size, enemy.size);
        return;
    }

    ctx.fillRect(x, y, enemy.size, enemy.size);
}
