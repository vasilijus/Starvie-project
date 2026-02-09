/**
 * PlayerStats - Handles core player statistics
 * Manages HP, damage, speed, and stat progression
 */
export class PlayerStats {
    constructor() {
        this.hp = 100;
        this.hpMax = 100;
        this.damage = 10;
        this.speed = 5;
        this.size = 20;
        this.level = 1;

        this.attackSpeed = 2; // 2 attacks per second
        this.lastAttackTime = 0;
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        return this.hp === 0;
    }

    heal(amount) {
        this.hp = Math.min(this.hpMax, this.hp + amount);
    }

    increaseDamage(amount) {
        this.damage += amount;
    }

    levelUp() {
        this.level++;
        this.hpMax += 5;
        this.hp = this.hpMax;
        this.damage += this.damage * 0.5;
    }

    toObject() {
        return {
            hp: this.hp,
            hpMax: this.hpMax,
            damage: this.damage,
            speed: this.speed,
            level: this.level,
            size: this.size
        };
    }
}
