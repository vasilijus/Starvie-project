/**
 * Base Resource Class
 * Represents a harvestable resource with respawning mechanics
 */
export class Resource {
    constructor(id, type, x, y, options = {}) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;

        // Resource state
        this.quantity = options.quantity || 1;
        this.maxQuantity = options.maxQuantity || 1;
        this.isDeplete = false;

        // Respawn mechanics
        this.respawnEnabled = options.respawnEnabled !== false; // Enabled by default
        this.respawnTime = options.respawnTime || 30000; // ms - time to fully respawn
        this.respawnRate = options.respawnRate || 0.1; // quantity per update
        this.lastHarvestedTime = null;

        // Visual
        this.icon_color = options.icon_color || '#fff';
        this.size = options.size || 10;

        // HP system for durability (if applicable)
        this.hp = options.hp || 100;
        this.hpMax = options.hpMax || 100;
    }

    /**
     * Harvest a quantity from this resource
     * @param {number} amount - Amount to harvest
     * @returns {number} Actual amount harvested
     */
    harvest(amount = 1) {
        if (this.isDeplete) return 0;

        const harvested = Math.min(amount, this.quantity);
        this.quantity -= harvested;

        if (this.quantity <= 0) {
            this.quantity = 0;
            this.isDeplete = true;
            this.lastHarvestedTime = Date.now();
        }

        return harvested;
    }

    /**
     * Check if resource can be harvested
     * @returns {boolean}
     */
    canHarvest() {
        return !this.isDeplete && this.quantity > 0;
    }

    /**
     * Update resource respawning
     * Called periodically by the server
     */
    updateRespawn(deltaTime = 1000) {
        if (!this.respawnEnabled || !this.isDeplete) return;

        const timeSinceHarvest = Date.now() - this.lastHarvestedTime;
        const respawnProgress = timeSinceHarvest / this.respawnTime;

        if (respawnProgress >= 1) {
            // Fully respawned
            this.quantity = this.maxQuantity;
            this.hp = this.hpMax;
            this.isDeplete = false;
            this.lastHarvestedTime = null;
            return true; // Fully respawned
        } else {
            // Partial respawn
            this.quantity = Math.floor(this.maxQuantity * respawnProgress);
            this.hp = Math.floor(this.hpMax * respawnProgress);
        }

        return false;
    }

    /**
     * Get respawn progress (0-1)
     * @returns {number}
     */
    getRespawnProgress() {
        if (!this.lastHarvestedTime) return 1;

        const timeSinceHarvest = Date.now() - this.lastHarvestedTime;
        return Math.min(1, timeSinceHarvest / this.respawnTime);
    }

    /**
     * Get remaining respawn time in ms
     * @returns {number}
     */
    getRespawnTimeRemaining() {
        if (!this.lastHarvestedTime) return 0;

        const timeSinceHarvest = Date.now() - this.lastHarvestedTime;
        const remaining = this.respawnTime - timeSinceHarvest;
        return Math.max(0, remaining);
    }

    /**
     * Serialize for sending to client
     * @returns {object}
     */
    toObject() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            quantity: this.quantity,
            maxQuantity: this.maxQuantity,
            isDeplete: this.isDeplete,
            icon_color: this.icon_color,
            size: this.size,
            hp: this.hp,
            hpMax: this.hpMax,
            respawnProgress: this.getRespawnProgress(),
            respawnTimeRemaining: this.getRespawnTimeRemaining()
        };
    }
}
