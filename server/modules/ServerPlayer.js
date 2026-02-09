import { PlayerStats } from './core/PlayerStats.js';
import { PlayerInventory } from './core/PlayerInventory.js';
import { PlayerExperience } from './core/PlayerExperience.js';
import { PlayerHealth } from './core/PlayerHealth.js';

/**
 * ServerPlayer - Server-authoritative player with all game logic
 * Handles movement, combat, gathering, and progression
 */
export class ServerPlayer {
    constructor(id, name, x = 0, y = 0) {
        this.id = id;
        this.name = name;

        // Position
        this.x = x;
        this.y = y;

        // Core systems
        this.stats = new PlayerStats();
        this.inventory = new PlayerInventory();
        this.experience = new PlayerExperience();
        this.health = new PlayerHealth(this.stats);

        // State
        this.isAlive = true;
        this.facingDirection = { x: 0, y: -1 };
    }

    // ==================== Movement ====================

    move(dx, dy) {
        this.x += dx * this.stats.speed;
        this.y += dy * this.stats.speed;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setFacingDirection(direction) {
        this.facingDirection = direction;
    }

    // ==================== Health & Combat ====================

    takeDamage(amount) {
        const playerDied = this.health.takeDamage(amount);
        if (playerDied) {
            this.isAlive = false;
        }
        return playerDied;
    }

    heal(amount = 1) {
        this.health.stats.heal(amount);
    }

    // ==================== Gathering ====================

    gatherResource(resourceType, quantity = 1) {
        const newTotal = this.inventory.addResource(resourceType, quantity);
        console.log(`Player ${this.id} gathered ${quantity}x ${resourceType}. Total: ${newTotal}`);
        return newTotal;
    }

    // ==================== Experience & Leveling ====================

    addXP(amount) {
        const leveledUp = this.experience.addXP(amount);
        if (leveledUp) {
            this.onLevelUp();
        }
        return leveledUp;
    }

    onLevelUp() {
        this.stats.levelUp();
        console.log(`Player ${this.id} reached level ${this.stats.level}!`);
    }

    // ==================== State Serialization ====================

    /**
     * Convert to client-safe state (excludes internal systems)
     */
    toClient() {
        return {
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            isAlive: this.isAlive,
            hp: this.stats.hp,
            hpMax: this.stats.hpMax,
            damage: this.stats.damage,
            level: this.experience.level,
            xp: this.experience.xp,
            xpToNextLevel: this.experience.xpToNextLevel,
            inventory: this.inventory.toObject(),
            facingDirection: this.facingDirection
        };
    }

    // ==================== Cleanup ====================

    destroy() {
        this.health.cleanup();
    }
}
