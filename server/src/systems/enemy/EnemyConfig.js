export const EnemyState = {
    IDLE: "IDLE",
    CHASE: "CHASE",
    ATTACK: "ATTACK"
};

export const AI = {
    HUNT_RANGE_SQ: 200 * 200,
    ATTACK_RANGE_SQ: 25 * 25,
    COLLISION_SQ: 20 * 20,
    WANDER_SPEED: 1,
    CHASE_SPEED: 2,
    ATTACK_COOLDOWN: 1000
};
