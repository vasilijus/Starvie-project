import { drawResource, drawResourceCollisionDebug } from '../rendering/drawers/resourceDrawer.js';

const SERVER_COLLISION_RADIUS_REDUCTION = 2;

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');

const fields = {
    type: document.getElementById('resourceType'),
    color: document.getElementById('resourceColor'),
    renderRadius: document.getElementById('renderRadius'),
    collisionRadius: document.getElementById('collisionRadius'),
    collisionOffsetX: document.getElementById('collisionOffsetX'),
    collisionOffsetY: document.getElementById('collisionOffsetY'),
    isSolid: document.getElementById('isSolid'),
    showCollision: document.getElementById('showCollision')
};

const output = document.getElementById('resourceJson');
const radiusValue = document.getElementById('renderRadiusValue');
const collisionValue = document.getElementById('collisionRadiusValue');
const offsetXValue = document.getElementById('collisionOffsetXValue');
const offsetYValue = document.getElementById('collisionOffsetYValue');

function getResourceFromUI() {
    return {
        type: fields.type.value,
        icon_color: fields.color.value,
        renderRadius: Number(fields.renderRadius.value),
        collisionRadius: Number(fields.collisionRadius.value),
        collisionOffsetX: Number(fields.collisionOffsetX.value),
        collisionOffsetY: Number(fields.collisionOffsetY.value),
        isSolid: fields.isSolid.checked
    };
}

function refreshLabels(resource) {
    radiusValue.textContent = String(resource.renderRadius);
    collisionValue.textContent = String(resource.collisionRadius);
    offsetXValue.textContent = String(resource.collisionOffsetX);
    offsetYValue.textContent = String(resource.collisionOffsetY);
}

function render() {
    const resource = getResourceFromUI();
    refreshLabels(resource);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // guide crosshair
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 120, centerY);
    ctx.lineTo(centerX + 120, centerY);
    ctx.moveTo(centerX, centerY - 120);
    ctx.lineTo(centerX, centerY + 120);
    ctx.stroke();

    drawResource(ctx, resource, centerX, centerY);

    if (fields.showCollision.checked && resource.isSolid) {
        drawResourceCollisionDebug(ctx, resource, centerX, centerY, {
            radiusReduction: SERVER_COLLISION_RADIUS_REDUCTION
        });
    }

    output.textContent = JSON.stringify({
        type: resource.type,
        icon_color: resource.icon_color,
        renderRadius: resource.renderRadius,
        collisionRadius: resource.collisionRadius,
        collisionOffsetX: resource.collisionOffsetX,
        collisionOffsetY: resource.collisionOffsetY,
        isSolid: resource.isSolid
    }, null, 2);
}

for (const field of Object.values(fields)) {
    field.addEventListener('input', render);
    field.addEventListener('change', render);
}

render();
