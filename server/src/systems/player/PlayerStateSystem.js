// --------------------------------------------------
// PLAYER STATE SYSTEM
// --------------------------------------------------

export function updateFacingDirection(player, direction) {
    if (!player || !direction) return;
    if (direction.x === undefined || direction.y === undefined) return;

    player.setFacingDirection(direction);
}
