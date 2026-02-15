import { getEnemyShapeDefinition } from '../definitions/enemyShapeDefinitions.js';

export function drawEnemy(ctx, enemy, x, y) {
    const shape = getEnemyShapeDefinition(enemy.enemyType);
    const size = enemy.size || 20;
    const cx = x + size / 2;
    const cy = y + size / 2;

    ctx.fillStyle = enemy.color;

    if (shape.kind === 'bear') {
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.48, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx - size * 0.25, cy - size * 0.35, size * 0.13, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.25, cy - size * 0.35, size * 0.13, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    if (shape.kind === 'rabbit') {
        ctx.beginPath();
        ctx.ellipse(cx, cy, size * 0.4, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - size * 0.2, cy - size * 0.65, size * 0.12, size * 0.35);
        ctx.fillRect(cx + size * 0.08, cy - size * 0.65, size * 0.12, size * 0.35);
        return;
    }

    if (shape.kind === 'wolf' || shape.kind === 'hyena') {
        ctx.beginPath();
        ctx.ellipse(cx, cy, size * 0.44, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx - size * 0.2, cy - size * 0.35);
        ctx.lineTo(cx - size * 0.05, cy - size * 0.55);
        ctx.lineTo(cx + size * 0.05, cy - size * 0.35);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx + size * 0.12, cy - size * 0.35);
        ctx.lineTo(cx + size * 0.28, cy - size * 0.55);
        ctx.lineTo(cx + size * 0.33, cy - size * 0.32);
        ctx.closePath();
        ctx.fill();
        return;
    }

    ctx.fillRect(x, y, size, size);
}
