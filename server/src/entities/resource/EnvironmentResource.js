import { Resource } from './Resource.js';

/**
 * Tree Resource
 * A persistent resource that provides wood
 */
export class Tree extends Resource {
    constructor(id, x, y) {
        super(id, 'tree', x, y, {
            quantity: 5,
            maxQuantity: 5,
            respawnEnabled: true,
            respawnTime: 45000, // 45 seconds to fully regrow
            respawnRate: 0.1,
            icon_color: '#2d5016',
            size: 24,
            hp: 100,
            hpMax: 100,
            renderRadius: 20,
            collisionRadius: 10,
            isSolid: true
        });

        this.resourceYield = {
            wood: { min: 2, max: 4 }
        };
    }

    /**
     * Override harvest to give wood
     * @returns {object} Harvested resources
     */
    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        const woodAmount = Math.floor(
            Math.random() * (this.resourceYield.wood.max - this.resourceYield.wood.min + 1) +
            this.resourceYield.wood.min
        );

        return {
            wood: woodAmount,
            xpReward: 10
        };
    }
}

/**
 * Berry Bush Resource
 * A persistent resource that provides berries
 */
export class BerryBush extends Resource {
    constructor(id, x, y) {
        super(id, 'berry', x, y, {
            quantity: 8,
            maxQuantity: 8,
            respawnEnabled: true,
            respawnTime: 20000, // 20 seconds to fully regrow (faster than tree)
            respawnRate: 0.15,
            icon_color: '#8b2f39',
            size: 14,
            hp: 50,
            hpMax: 50,
            renderRadius: 14,
            collisionRadius: 0,
            isSolid: false
        });

        this.resourceYield = {
            berry: { min: 1, max: 3 }
        };
    }

    /**
     * Harvest berries
     * @returns {object} Harvested resources
     */
    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        const berryAmount = Math.floor(
            Math.random() * (this.resourceYield.berry.max - this.resourceYield.berry.min + 1) +
            this.resourceYield.berry.min
        );

        return {
            berry: berryAmount,
            xpReward: 5
        };
    }
}

/**
 * Stone Resource
 * Provides stone/rock for building
 */
export class StoneResource extends Resource {
    constructor(id, x, y) {
        super(id, 'stone', x, y, {
            quantity: 3,
            maxQuantity: 3,
            respawnEnabled: true,
            respawnTime: 60000, // 60 seconds (slowest)
            respawnRate: 0.05,
            icon_color: '#7a7a7a',
            size: 16,
            hp: 150, // Harder to break
            hpMax: 150,
            renderRadius: 15,
            collisionRadius: 15,
            isSolid: true
        });

        this.resourceYield = {
            stone: { min: 3, max: 6 }
        };
    }

    /**
     * Harvest stone
     * @returns {object} Harvested resources
     */
    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        const stoneAmount = Math.floor(
            Math.random() * (this.resourceYield.stone.max - this.resourceYield.stone.min + 1) +
            this.resourceYield.stone.min
        );

        return {
            stone: stoneAmount,
            xpReward: 15
        };
    }
}

/**
 * Grass Resource
 * Provides grass/fiber for basic crafting
 */
export class GrassResource extends Resource {
    constructor(id, x, y) {
        super(id, 'grass', x, y, {
            quantity: 10,
            maxQuantity: 10,
            respawnEnabled: true,
            respawnTime: 15000, // 15 seconds (fastest)
            respawnRate: 0.2,
            icon_color: '#6b8e23',
            size: 12,
            hp: 30,
            hpMax: 30,
            renderRadius: 12,
            collisionRadius: 0,
            isSolid: false
        });

        this.resourceYield = {
            grass: { min: 1, max: 2 }
        };
    }

    /**
     * Harvest grass
     * @returns {object} Harvested resources
     */
    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        const grassAmount = Math.floor(
            Math.random() * (this.resourceYield.grass.max - this.resourceYield.grass.min + 1) +
            this.resourceYield.grass.min
        );

        return {
            grass: grassAmount,
            xpReward: 3
        };
    }
}


/**
 * Mushroom Resource
 * Provides mushrooms for food and crafting
 */
export class MushroomResource extends Resource {
    constructor(id, x, y) {
        super(id, 'mushroom', x, y, {
            quantity: 6,
            maxQuantity: 6,
            respawnEnabled: true,
            respawnTime: 25000, // 25 seconds
            respawnRate: 0.15,
            icon_color: '#A0522D',
            size: 12,
            hp: 40,
            hpMax: 40
        });

        this.resourceYield = {
            mushroom: { min: 1, max: 2 }
        };
    }

    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        const mushroomAmount = Math.floor(
            Math.random() * (this.resourceYield.mushroom.max - this.resourceYield.mushroom.min + 1) +
            this.resourceYield.mushroom.min
        );

        return {
            mushroom: mushroomAmount,
            xpReward: 6
        };
    }
}

/**
 * Herb Resource
 * Provides herbs for potions and healing
 */
export class HerbResource extends Resource {
    constructor(id, x, y) {
        super(id, 'herb', x, y, {
            quantity: 8,
            maxQuantity: 8,
            respawnEnabled: true,
            respawnTime: 18000, // 18 seconds
            respawnRate: 0.2,
            icon_color: '#90EE90',
            size: 10,
            hp: 25,
            hpMax: 25
        });

        this.resourceYield = {
            herb: { min: 1, max: 3 }
        };
    }

    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        const herbAmount = Math.floor(
            Math.random() * (this.resourceYield.herb.max - this.resourceYield.herb.min + 1) +
            this.resourceYield.herb.min
        );

        return {
            herb: herbAmount,
            xpReward: 4
        };
    }
}

/**
 * Flower Resource
 * Provides flowers for decorations and dyes
 */
export class FlowerResource extends Resource {
    constructor(id, x, y) {
        super(id, 'flower', x, y, {
            quantity: 10,
            maxQuantity: 10,
            respawnEnabled: true,
            respawnTime: 12000, // 12 seconds (fastest)
            respawnRate: 0.25,
            icon_color: '#FFD700',
            size: 10,
            hp: 20,
            hpMax: 20
        });

        this.resourceYield = {
            flower: { min: 1, max: 2 }
        };
    }

    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        const flowerAmount = Math.floor(
            Math.random() * (this.resourceYield.flower.max - this.resourceYield.flower.min + 1) +
            this.resourceYield.flower.min
        );

        return {
            flower: flowerAmount,
            xpReward: 2
        };
    }
}

/**
 * Log Resource
 * Provides logs for building
 */
export class LogResource extends Resource {
    constructor(id, x, y) {
        super(id, 'log', x, y, {
            quantity: 4,
            maxQuantity: 4,
            respawnEnabled: true,
            respawnTime: 40000, // 40 seconds
            respawnRate: 0.08,
            icon_color: '#8B6F47',
            size: 16,
            hp: 120,
            hpMax: 120
        });

        this.resourceYield = {
            log: { min: 1, max: 2 }
        };
    }

    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        const logAmount = Math.floor(
            Math.random() * (this.resourceYield.log.max - this.resourceYield.log.min + 1) +
            this.resourceYield.log.min
        );

        return {
            log: logAmount,
            xpReward: 12
        };
    }
}

/**
 * Rock Resource
 * Provides rocks/stones from ground deposits
 */
export class RockResource extends Resource {
    constructor(id, x, y) {
        super(id, 'rock', x, y, {
            quantity: 4,
            maxQuantity: 4,
            respawnEnabled: true,
            respawnTime: 55000, // 55 seconds
            respawnRate: 0.06,
            icon_color: '#808080',
            size: 14,
            hp: 160,
            hpMax: 160
        });

        this.resourceYield = {
            rock: { min: 2, max: 4 }
        };
    }

    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        const rockAmount = Math.floor(
            Math.random() * (this.resourceYield.rock.max - this.resourceYield.rock.min + 1) +
            this.resourceYield.rock.min
        );

        return {
            rock: rockAmount,
            xpReward: 14
        };
    }
}

/**
 * Sand Resource
 * Provides sand for crafting
 */
export class SandResource extends Resource {
    constructor(id, x, y) {
        super(id, 'sand', x, y, {
            quantity: 12,
            maxQuantity: 12,
            respawnEnabled: true,
            respawnTime: 10000, // 10 seconds (fastest, very common)
            respawnRate: 0.3,
            icon_color: '#F4A460',
            size: 11,
            hp: 15,
            hpMax: 15
        });

        this.resourceYield = {
            sand: { min: 2, max: 4 }
        };
    }

    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        const sandAmount = Math.floor(
            Math.random() * (this.resourceYield.sand.max - this.resourceYield.sand.min + 1) +
            this.resourceYield.sand.min
        );

        return {
            sand: sandAmount,
            xpReward: 2
        };
    }
}

/**
 * Cactus Resource
 * Provides water in desert
 */
export class CactusResource extends Resource {
    constructor(id, x, y) {
        super(id, 'cactus', x, y, {
            quantity: 5,
            maxQuantity: 5,
            respawnEnabled: true,
            respawnTime: 30000, // 30 seconds
            respawnRate: 0.1,
            icon_color: '#6B8E23',
            size: 15,
            hp: 80,
            hpMax: 80
        });

        this.resourceYield = {
            water: { min: 1, max: 2 },
            cactus_fiber: { min: 1, max: 1 }
        };
    }

    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        return {
            water: Math.floor(Math.random() * 2 + 1),
            cactus_fiber: 1,
            xpReward: 10
        };
    }
}

/**
 * Ore Resource
 * Provides metal ore for crafting
 */
export class OreResource extends Resource {
    constructor(id, x, y) {
        super(id, 'ore', x, y, {
            quantity: 3,
            maxQuantity: 3,
            respawnEnabled: true,
            respawnTime: 70000, // 70 seconds (slow)
            respawnRate: 0.04,
            icon_color: '#696969',
            size: 13,
            hp: 200,
            hpMax: 200
        });

        this.resourceYield = {
            ore: { min: 2, max: 5 }
        };
    }

    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        const oreAmount = Math.floor(
            Math.random() * (this.resourceYield.ore.max - this.resourceYield.ore.min + 1) +
            this.resourceYield.ore.min
        );

        return {
            ore: oreAmount,
            xpReward: 20
        };
    }
}

/**
 * Gem Resource
 * Provides rare gems
 */
export class GemResource extends Resource {
    constructor(id, x, y) {
        super(id, 'gem', x, y, {
            quantity: 2,
            maxQuantity: 2,
            respawnEnabled: true,
            respawnTime: 90000, // 90 seconds (very slow)
            respawnRate: 0.02,
            icon_color: '#8B008B',
            size: 11,
            hp: 250,
            hpMax: 250
        });

        this.resourceYield = {
            gem: { min: 1, max: 2 }
        };
    }

    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        const gemAmount = Math.floor(
            Math.random() * (this.resourceYield.gem.max - this.resourceYield.gem.min + 1) +
            this.resourceYield.gem.min
        );

        return {
            gem: gemAmount,
            xpReward: 35
        };
    }
}

/**
 * Ice Resource
 * Provides ice/water in snow biomes
 */
export class IceResource extends Resource {
    constructor(id, x, y) {
        super(id, 'ice', x, y, {
            quantity: 5,
            maxQuantity: 5,
            respawnEnabled: true,
            respawnTime: 22000, // 22 seconds
            respawnRate: 0.12,
            icon_color: '#E0FFFF',
            size: 12,
            hp: 90,
            hpMax: 90
        });

        this.resourceYield = {
            ice: { min: 2, max: 4 }
        };
    }

    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        const iceAmount = Math.floor(
            Math.random() * (this.resourceYield.ice.max - this.resourceYield.ice.min + 1) +
            this.resourceYield.ice.min
        );

        return {
            ice: iceAmount,
            xpReward: 8
        };
    }
}

/**
 * Crystal Resource
 * Provides rare crystals
 */
export class CrystalResource extends Resource {
    constructor(id, x, y) {
        super(id, 'crystal', x, y, {
            quantity: 2,
            maxQuantity: 2,
            respawnEnabled: true,
            respawnTime: 100000, // 100 seconds (extremely slow)
            respawnRate: 0.01,
            icon_color: '#B0E0E6',
            size: 10,
            hp: 280,
            hpMax: 280
        });

        this.resourceYield = {
            crystal: { min: 1, max: 1 }
        };
    }

    harvestResources() {
        const amount = this.harvest(1);
        if (amount === 0) return null;

        return {
            crystal: 1,
            xpReward: 40
        };
    }
}