import { getResourceShapeDefinition } from '../definitions/resourceShapeDefinitions.js';

function drawTree(ctx, x, y, renderRadius, color) {
    // foliage
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - renderRadius * 0.15, renderRadius, 0, Math.PI * 2);
    ctx.fill();

    // trunk
    ctx.fillStyle = '#6b3e1d';
    const trunkW = Math.max(5, renderRadius * 0.45);
    const trunkH = Math.max(8, renderRadius * 0.95);
    ctx.fillRect(x - trunkW / 2, y + renderRadius * 0.2, trunkW, trunkH);
}

function drawStone(ctx, x, y, renderRadius, color) {
    const points = 7;
    ctx.fillStyle = color;
    ctx.beginPath();

    for (let i = 0; i < points; i++) {
        const angle = (Math.PI * 2 * i) / points - Math.PI / 2;
        const r = renderRadius * (0.78 + (i % 2) * 0.22);
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }

    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawCircle(ctx, x, y, renderRadius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(5, renderRadius * 0.65), 0, Math.PI * 2);
    ctx.fill();
}

export function drawResource(ctx, resource, x, y) {
    const color = resource.icon_color || '#00AA00';
    const renderRadius = resource.renderRadius || resource.size || 10;
    const shape = getResourceShapeDefinition(resource.type);

    if (shape.kind === 'tree') {
        drawTree(ctx, x, y, renderRadius, color);
        return { color, renderRadius };
    }

    if (shape.kind === 'stone') {
        drawStone(ctx, x, y, renderRadius, color);
        return { color, renderRadius };
    }

    drawCircle(ctx, x, y, renderRadius, color);
    return { color, renderRadius };
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
