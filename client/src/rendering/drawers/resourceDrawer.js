import { getResourceVisualDefinition } from '../definitions/resourceVisualDefinitions.js';
import { getResourceSpriteDefinition } from '../definitions/resourceSpriteDefinitions.js';
import { RENDER_SCALE } from '../definitions/renderConstants.js';
import { getResourceAtlasImage, isAtlasReady } from '../spriteAtlases.js';

const RESOURCE_BASE_SIZE = 32;

function isEmptyResource(resource) {
    if (resource?.isEmpty || resource?.isDepleted || resource?.isDeplete) return true;
    if (typeof resource?.quantity === 'number' && resource.quantity <= 0) return true;
    if (typeof resource?.hp === 'number' && resource.hp <= 0) return true;
    return false;
}

function drawFallback(ctx, x, y, color, size) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
}

export function drawResource(ctx, resource, x, y) {
    const visual = getResourceVisualDefinition(resource.type);
    const color = resource.icon_color || visual.defaultColor;

    const atlas = getResourceAtlasImage();
    const sprite = getResourceSpriteDefinition(resource.type);
    const frame = isEmptyResource(resource) ? sprite.empty : sprite.normal;

    const baseRadius = resource.renderRadius || resource.size || (RESOURCE_BASE_SIZE / 2);
    const renderSize = Math.max(RESOURCE_BASE_SIZE, baseRadius * 2) * RENDER_SCALE;
    const half = renderSize / 2;

    if (isAtlasReady(atlas) && frame) {
        ctx.drawImage(
            atlas,
            frame.sx,
            frame.sy,
            frame.sw,
            frame.sh,
            x - half,
            y - half,
            renderSize,
            renderSize
        );
    } else {
        drawFallback(ctx, x, y, color, renderSize);
    }

    return { color, renderRadius: half };
}

export function drawResourceCollisionDebug(ctx, resource, x, y, options = {}) {
    const collisionRadius = Math.max(0, resource?.collisionRadius || 0);
    if (collisionRadius <= 0) return;

    const collisionOffsetX = resource?.collisionOffsetX || 0;
    const collisionOffsetY = resource?.collisionOffsetY || 0;
    const reduction = Math.max(0, options?.radiusReduction || 0);
    const effectiveRadius = Math.max(0, collisionRadius - reduction);
    if (effectiveRadius <= 0) return;

    const cx = x + collisionOffsetX;
    const cy = y + collisionOffsetY;

    ctx.strokeStyle = options?.strokeStyle || 'rgba(255, 80, 80, 0.95)';
    ctx.lineWidth = options?.lineWidth || 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, effectiveRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = options?.centerStyle || 'rgba(255, 80, 80, 0.95)';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
}
