import { Enemy } from './Enemy.js';
import { generateEnemyDrops } from '../resource/EnemyResource.js';

export const EN_TYPES = 4;

class BaseTypedEnemy extends Enemy {
    getResourceDrops(ownerId) {
        return generateEnemyDrops(this.enemyType, this.x, this.y, ownerId);
    }
}

export class Wolf extends BaseTypedEnemy {
    constructor(id, x, y) {
        super(x, y);
        this.id = id;
        this.hp = this.hpMax = 55;
        this.color = '#444444';
        this.xpWorth = 22;
        this.size = 20;
        this.enemyType = 'wolf';

        this.attackDamage = 10;
        this.huntRangeSq = 200 * 200;
        this.attackRangeSq = 25 * 25;
        this.chaseSpeed = 2;
        this.attackCooldown = 1000;

        // Trait: frenzy when target is under 50% hp
        this.lowHealthTargetSpeedMultiplier = 1.45;
    }
}

export class Bear extends BaseTypedEnemy {
    constructor(id, x, y) {
        super(x, y);
        this.id = id;
        this.hp = this.hpMax = 85;
        this.color = '#4a1500';
        this.xpWorth = 38;
        this.size = 24;
        this.enemyType = 'bear';

        // Trait: stronger attacks + larger detection range
        this.attackDamage = 18;
        this.huntRangeSq = 300 * 300;
        this.attackRangeSq = 30 * 30;
        this.chaseSpeed = 1.7;
        this.attackCooldown = 1300;
    }
}

export class Hyena extends BaseTypedEnemy {
    constructor(id, x, y) {
        super(x, y);
        this.id = id;
        this.hp = this.hpMax = 48;
        this.color = '#8b6a3d';
        this.xpWorth = 28;
        this.size = 18;
        this.enemyType = 'hyena';

        this.attackDamage = 8;
        this.huntRangeSq = 210 * 210;
        this.attackRangeSq = 22 * 22;
        this.chaseSpeed = 2.6;
        this.attackCooldown = 850;

        // Trait: agile runner with occasional dodge sidestep while chasing
        this.agileDodgeChance = 0.22;
    }
}

export class Rabbit extends BaseTypedEnemy {
    constructor(id, x, y) {
        super(x, y);
        this.id = id;
        this.hp = this.hpMax = 25;
        this.color = '#dedede';
        this.xpWorth = 8;
        this.size = 14;
        this.enemyType = 'rabbit';

        this.isPassive = true;
        this.attackDamage = 0;
        this.attackCooldown = 0;
        this.fleeRangeSq = 190 * 190;
        this.fleeSpeed = 3.2;
        this.wanderSpeed = 1.5;
    }
}
