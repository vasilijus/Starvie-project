export const EnemyState = {
    IDLE: 'IDLE',
    CHASE: 'CHASE',
    ATTACK: 'ATTACK',
    FLEE: 'FLEE'
};

export const AI = {
    HUNT_RANGE_SQ: 200 * 200,
    ATTACK_RANGE_SQ: 25 * 25,
    FLEE_RANGE_SQ: 180 * 180,
    COLLISION_SQ: 20 * 20,
    WANDER_SPEED: 1,
    CHASE_SPEED: 2,
    FLEE_SPEED: 2.4,
    ATTACK_COOLDOWN: 1000,
    ATTACK_DAMAGE: 10
};
