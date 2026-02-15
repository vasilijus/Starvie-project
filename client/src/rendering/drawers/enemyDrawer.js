import { getEnemySpriteDefinition } from '../definitions/enemySpriteDefinitions.js';
import { RENDER_SCALE } from '../definitions/renderConstants.js';
import { getEnemyAtlasImage, isAtlasReady } from '../spriteAtlases.js';

export function drawEnemy(ctx, enemy, x, y) {
    const sprite = getEnemySpriteDefinition(enemy.enemyType);
    const atlas = getEnemyAtlasImage();

    const baseSize = enemy.size || 20;
    const size = baseSize * RENDER_SCALE;
    const drawX = x - (size - baseSize) / 2;
    const drawY = y - (size - baseSize) / 2;

    if (isAtlasReady(atlas) && sprite) {
        ctx.drawImage(
            atlas,
            sprite.sx,
            sprite.sy,
            sprite.sw,
            sprite.sh,
            drawX,
            drawY,
            size,
            size
        );
        return;
    }

    ctx.fillStyle = enemy.color || '#6b4e2e';
    ctx.fillRect(drawX, drawY, size, size);
}
