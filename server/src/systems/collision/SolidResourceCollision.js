function getDistSq(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy;
}

function getEntityRadius(entity) {
    return Math.max(2, (entity?.size || 20) / 2);
}

export function isCollidingWithSolidResource(entity, resources = []) {
    const entityRadius = getEntityRadius(entity);

    for (const resource of resources) {
        if (!resource?.isSolid) continue;

        const collisionRadius = Math.max(0, resource.collisionRadius || 0);
        if (collisionRadius <= 0) continue;

        const minDistance = entityRadius + collisionRadius;
        if (getDistSq(entity.x, entity.y, resource.x, resource.y) < (minDistance * minDistance)) {
            return true;
        }
    }

    return false;
}

export function applyAxisSeparatedMovement(entity, targetX, targetY, resources = []) {
    const previousX = entity.x;
    const previousY = entity.y;

    entity.x = targetX;
    entity.y = previousY;
    if (isCollidingWithSolidResource(entity, resources)) entity.x = previousX;

    entity.y = targetY;
    if (isCollidingWithSolidResource(entity, resources)) entity.y = previousY;
}
