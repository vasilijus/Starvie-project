import { getResourceShapeDefinition } from '../definitions/resourceShapeDefinitions.js';

export function drawResource(ctx, resource, x, y) {
    const color = resource.icon_color || '#00AA00';
    const renderRadius = resource.renderRadius || resource.size || 10;
    const shape = getResourceShapeDefinition(resource.type);

    if (shape.kind === 'tree') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, renderRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#6b3e1d';
        const trunkW = Math.max(4, renderRadius * 0.4);
        const trunkH = Math.max(6, renderRadius * 0.7);
        ctx.fillRect(x - trunkW / 2, y + renderRadius * 0.25, trunkW, trunkH);
        return { color, renderRadius };
    }

    if (shape.kind === 'mushroom') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, renderRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00AA00';
        const trunkW = Math.max(4, renderRadius * 0.4);
        const trunkH = Math.max(6, renderRadius * 0.7);
        ctx.fillRect(x - trunkW / 1, y + renderRadius * 0.25, trunkW, trunkH);
        return { color, renderRadius };
    }

    if (shape.kind === 'stone') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, renderRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#5e5e5e';
        ctx.lineWidth = 1;
        ctx.stroke();
        return { color, renderRadius };
    }

    if (shape.kind === 'rock') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.fillRect(x, y, renderRadius, renderRadius);
        ctx.strokeStyle = '#5e5e5e';
        ctx.lineWidth = 1;
        ctx.stroke();
        return { color, renderRadius };
    }



    if (shape.kind === 'cactus') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, renderRadius / 2, renderRadius, 0, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.strokeStyle = '#0a5800';
        ctx.lineWidth = 1;
        ctx.stroke();
        return { color, renderRadius };
    }

    if (shape.kind === 'gem') {
        const gradient = ctx.createLinearGradient(x-renderRadius/2, y-renderRadius/2,x+renderRadius/2, y+renderRadius/2);
            gradient.addColorStop(0, "green");
            gradient.addColorStop(0.5, "cyan");
            gradient.addColorStop(1, "green");
        // ctx.fillStyle = color;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, renderRadius, 0, Math.PI * 2);
        ctx.fill();
        return { color, renderRadius };
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(5, renderRadius * 0.6), 0, Math.PI * 2);
    ctx.fill();
    return { color, renderRadius };
}
