// Centralised hit detection utilities

const ENEMY_HIT_RADIUS_SQ = 30 * 30;
const RESOURCE_HIT_RADIUS_SQ = 25 * 25;

const getDistSq = (x1, y1, x2, y2) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy;
};

// Calculate world position player is aiming at
export function getHitPoint(player, direction, reach = 40) {
    return {
        x: player.x + direction.x * reach,
        y: player.y + direction.y * reach
    };
}

export function findHitEnemy(hitPoint, enemies) {
    return enemies.find(e =>
        getDistSq(hitPoint.x, hitPoint.y, e.x, e.y) < ENEMY_HIT_RADIUS_SQ
    );
}

export function findHitResource(hitPoint, resources) {
    return resources.find(r =>
        getDistSq(hitPoint.x, hitPoint.y, r.x, r.y) < RESOURCE_HIT_RADIUS_SQ
    );
}