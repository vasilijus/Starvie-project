/**
 * EnemyResource
 * Represents a harvestable drop from a defeated enemy.
 * Drops are private to the killer for a short period, then become public,
 * and eventually despawn (old-school MMO style).
 */
export class EnemyResource {
    constructor(id, type, x, y, quantity, xpReward = 0, ownerId = null) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.quantity = quantity;
        this.maxQuantity = quantity;
        this.xpReward = xpReward;

        this.ownerId = ownerId;

        // Visual
        this.icon_color = this.getColorForType(type);
        this.size = 12;

        // Lifecycle
        this.isCollected = false;
        this.createdTime = Date.now();

        // OSRS-like visibility windows
        this.ownerVisibilityMs = 60000; // 60s private
        this.publicVisibilityMs = 60000; // then 60s public
        this.despawnTime = this.ownerVisibilityMs + this.publicVisibilityMs;
    }

    getColorForType(type) {
        const colors = {
            meat: '#d32f2f',
            leather: '#8b4513',
            fur: '#5a4a3a',
            bone: '#d7ccc8',
            tooth: '#b0bec5',
            scale: '#4db6ac'
        };
        return colors[type] || '#999999';
    }

    getAgeMs() {
        return Date.now() - this.createdTime;
    }

    isVisibleTo(playerId) {
        if (this.isCollected) return false;

        const age = this.getAgeMs();
        if (age >= this.despawnTime) return false;

        if (age < this.ownerVisibilityMs) {
            return !this.ownerId || this.ownerId === playerId;
        }

        return true;
    }

    canCollect(playerId) {
        return this.isVisibleTo(playerId);
    }

    collect(amount = this.quantity) {
        if (this.isCollected) return 0;

        const collected = Math.min(amount, this.quantity);
        this.quantity -= collected;

        if (this.quantity <= 0) {
            this.isCollected = true;
        }

        return collected;
    }

    shouldDespawn() {
        return this.getAgeMs() > this.despawnTime || this.isCollected;
    }

    toObject() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            quantity: this.quantity,
            maxQuantity: this.maxQuantity,
            icon_color: this.icon_color,
            size: this.size,
            isCollected: this.isCollected,
            xpReward: this.xpReward
        };
    }
}

/**
 * Loot tables split into guaranteed and random rolls.
 */
export const ENEMY_LOOT_TABLES = {
    wolf: {
        guaranteed: [
            { type: 'bone', min: 1, max: 1, xpReward: 5 }
        ],
        rolls: [
            { type: 'meat', min: 2, max: 4, chance: 0.9, xpReward: 10 },
            { type: 'fur', min: 1, max: 2, chance: 0.7, xpReward: 8 }
        ]
    },
    bear: {
        guaranteed: [
            { type: 'bone', min: 2, max: 2, xpReward: 10 }
        ],
        rolls: [
            { type: 'meat', min: 4, max: 6, chance: 0.95, xpReward: 20 },
            { type: 'fur', min: 2, max: 3, chance: 0.8, xpReward: 15 },
            { type: 'tooth', min: 1, max: 2, chance: 0.4, xpReward: 12 }
        ]
    }
};

function randomQty(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function makeDropId(enemyType, dropIndex) {
    return `drop_${enemyType}_${Date.now()}_${dropIndex}_${Math.floor(Math.random() * 10000)}`;
}

/**
 * Get resource drops for an enemy type using loot table rolls.
 */
export function generateEnemyDrops(enemyType, baseX, baseY, ownerId = null) {
    const drops = [];
    const table = ENEMY_LOOT_TABLES[enemyType.toLowerCase()];

    if (!table) {
        console.warn(`No loot table for enemy type: ${enemyType}`);
        return drops;
    }

    let dropIndex = 0;
    const allEntries = [
        ...(table.guaranteed || []).map(entry => ({ ...entry, chance: 1 })),
        ...(table.rolls || [])
    ];

    for (const entry of allEntries) {
        if (Math.random() > (entry.chance ?? 1)) continue;

        const quantity = randomQty(entry.min, entry.max);
        const dropX = baseX + (Math.random() * 20 - 10);
        const dropY = baseY + (Math.random() * 20 - 10);

        drops.push(new EnemyResource(
            makeDropId(enemyType, dropIndex),
            entry.type,
            dropX,
            dropY,
            quantity,
            entry.xpReward,
            ownerId
        ));

        dropIndex++;
    }

    return drops;
}
