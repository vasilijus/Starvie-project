function getDistSq(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy;
}

function getEntityRadius(entity) {
    return Math.max(2, (entity?.size || 20) / 2);
}

function getEntityCollisionCenter(entity) {
    const radius = getEntityRadius(entity);

    return {
        x: (entity?.x || 0) + radius,
        y: (entity?.y || 0) + radius,
        radius
    };
}

const COLLISION_RADIUS_REDUCTION = 2;

function getResourceCollisionData(resource) {
    const rawRadius = Math.max(0, resource?.collisionRadius || 0);
    const collisionRadius = Math.max(0, rawRadius - COLLISION_RADIUS_REDUCTION);

    return {
        x: (resource?.x || 0) + (resource?.collisionOffsetX || 0),
        y: (resource?.y || 0) + (resource?.collisionOffsetY || 0),
        collisionRadius
    };
}

export function isCollidingWithSolidResource(entity, resources = []) {
    const { x: entityX, y: entityY, radius: entityRadius } = getEntityCollisionCenter(entity);

    for (const resource of resources) {
        if (!resource?.isSolid) continue;

        const { x: collisionX, y: collisionY, collisionRadius } = getResourceCollisionData(resource);
        if (collisionRadius <= 0) continue;

        const minDistance = entityRadius + collisionRadius;
        if (getDistSq(entityX, entityY, collisionX, collisionY) < (minDistance * minDistance)) {
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
