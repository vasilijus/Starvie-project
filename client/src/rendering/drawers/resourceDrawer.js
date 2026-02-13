import { getResourceVisualDefinition } from '../definitions/resourceVisualDefinitions.js';

function polygon(ctx, x, y, points, radius, jitter = 0.2, rotation = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
        const angle = rotation + (Math.PI * 2 * i) / points;
        const r = radius * (1 - jitter + ((i % 2) * jitter));
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
}

function drawByKind(ctx, kind, x, y, r, color) {
    if (kind === 'tree') {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y - r * 0.15, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6b3e1d';
        ctx.fillRect(x - Math.max(5, r * 0.42) / 2, y + r * 0.2, Math.max(5, r * 0.42), Math.max(8, r * 0.95));
        return;
    }

    if (kind === 'stone' || kind === 'ore' || kind === 'goldNugget') {
        polygon(ctx, x, y, 7, r, 0.22);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.stroke();
        if (kind === 'ore' || kind === 'goldNugget') {
            ctx.strokeStyle = kind === 'goldNugget' ? '#f8e27a' : '#9ec7d4';
            ctx.beginPath();
            ctx.moveTo(x - r * 0.35, y - r * 0.1);
            ctx.lineTo(x + r * 0.25, y + r * 0.2);
            ctx.moveTo(x - r * 0.05, y - r * 0.45);
            ctx.lineTo(x + r * 0.2, y - r * 0.1);
            ctx.stroke();
        }
        return;
    }

    if (kind === 'log') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 0.95, r * 0.55, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5a402a'; ctx.stroke();
        return;
    }

    if (kind === 'berryBush' || kind === 'leafCluster' || kind === 'grassTuft') {
        ctx.fillStyle = color;
        const loops = kind === 'grassTuft' ? 3 : 4;
        for (let i = 0; i < loops; i++) {
            const ox = (i - (loops - 1) / 2) * r * 0.3;
            ctx.beginPath();
            ctx.ellipse(x + ox, y, r * 0.35, r * (kind === 'grassTuft' ? 0.9 : 0.5), 0, 0, Math.PI * 2);
            ctx.fill();
        }
        if (kind === 'berryBush') {
            ctx.fillStyle = '#d04759';
            ctx.beginPath(); ctx.arc(x + r * 0.2, y, Math.max(2, r * 0.18), 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x - r * 0.22, y + r * 0.1, Math.max(2, r * 0.16), 0, Math.PI * 2); ctx.fill();
        }
        return;
    }

    if (kind === 'mushroom') {
        ctx.fillStyle = '#e6d3b0';
        ctx.fillRect(x - r * 0.12, y, r * 0.24, r * 0.55);
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, r * 0.6, Math.PI, 0); ctx.closePath(); ctx.fill();
        return;
    }

    if (kind === 'flower' || kind === 'grain') {
        ctx.strokeStyle = '#4f7f2b';
        ctx.beginPath(); ctx.moveTo(x, y + r * 0.6); ctx.lineTo(x, y - r * 0.2); ctx.stroke();
        ctx.fillStyle = color;
        if (kind === 'grain') {
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.ellipse(x + r * 0.18, y - r * 0.08 - i * r * 0.14, r * 0.16, r * 0.08, 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            for (let i = 0; i < 5; i++) {
                const a = (Math.PI * 2 * i) / 5;
                ctx.beginPath();
                ctx.arc(x + Math.cos(a) * r * 0.35, y + Math.sin(a) * r * 0.35, r * 0.2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = '#e3841c';
            ctx.beginPath(); ctx.arc(x, y, r * 0.18, 0, Math.PI * 2); ctx.fill();
        }
        return;
    }

    if (kind === 'cactus') {
        ctx.fillStyle = color;
        ctx.fillRect(x - r * 0.18, y - r * 0.5, r * 0.36, r);
        ctx.fillRect(x - r * 0.46, y - r * 0.15, r * 0.2, r * 0.4);
        ctx.fillRect(x + r * 0.26, y - r * 0.2, r * 0.2, r * 0.4);
        return;
    }

    if (kind === 'gem' || kind === 'crystal' || kind === 'ice') {
        polygon(ctx, x, y, kind === 'ice' ? 6 : 5, r * 0.9, 0.12, -Math.PI / 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.stroke();
        return;
    }

    if (kind === 'sandPile') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 0.8, r * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(5, r * 0.65), 0, Math.PI * 2);
    ctx.fill();
}

export function drawResource(ctx, resource, x, y) {
    const visual = getResourceVisualDefinition(resource.type);
    const color = resource.icon_color || visual.defaultColor;
    const renderRadius = resource.renderRadius || resource.size || visual.defaultRenderRadius || 10;

    drawByKind(ctx, visual.kind, x, y, renderRadius, color);
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
