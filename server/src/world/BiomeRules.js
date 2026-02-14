export const BIOME_RULES = {
    sizes: { sm: 0.01, md: 0.03, lg: 0.05 },
    forest: {
        groundTile: "grass",
        description: "Dense forests with abundant vegetation and wildlife",
        resources: [
            { type: "tree", density: 0.10 },           // 10% - primary resource
            { type: "berry", density: 0.05 },          // 5% - food source
            { type: "log", density: 0.04 },            // 4% - building material
            { type: "mushroom", density: 0.03 },       // 3% - medicinal
            { type: "herb", density: 0.02 }            // 2% - crafting
        ]
    },

    plains: {
        groundTile: "grass",
        description: "Open grasslands with scattered trees and abundant flowers",
        resources: [
            { type: "flower", density: 0.08 },         // 8% - primary, abundant
            { type: "tree", density: 0.04 },           // 4% - scattered trees
            { type: "berry", density: 0.03 },          // 3% - berries
            { type: "rock", density: 0.03 },           // 3% - stone
            { type: "herb", density: 0.02 },           // 2% - herbs
            { type: "grain", density: 0.05 }           // 5% - wild grain
        ]
    },

    desert: {
        groundTile: "sand",
        description: "Hot, arid lands with rocks and precious metals",
        resources: [
            { type: "rock", density: 0.05 },           // 10% - very abundant
            { type: "sand", density: 0.07 },           // 7% - abundant
            { type: "cactus", density: 0.04 },         // 4% - water source
            { type: "ore", density: 0.001 },            // 5% - metal ore
            { type: "gem", density: 0.02 },            // 2% - rare gems
            { type: "gold", density: 0.008 }           // 0.8% - rare gold
        ]
    },

    snow: {
        groundTile: "snow",
        description: "Frozen tundra with minimal but valuable resources",
        resources: [
            { type: "rock", density: 0.03 },           // 6% - abundant stone
            { type: "ice", density: 0.05 },            // 5% - water source
            { type: "ore", density: 0.04 },            // 4% - rare ore
            { type: "crystal", density: 0.02 },        // 2% - rare
            { type: "herb", density: 0.01 }            // 1% - very rare herbs
        ]
    },

    swamp: {
        groundTile: "grass",
        description: "Murky wetlands with unique vegetation and dark resources",
        resources: [
            { type: "mushroom", density: 0.05 },       // 10% - most abundant here
            { type: "herb", density: 0.01 },           // 7% - medicinal herbs
            { type: "tree", density: 0.06 },           // 5% - darker wood
            { type: "berry", density: 0.04 },          // 4% - rare berries
            { type: "ore", density: 0.02 }             // 2% - bog ore
        ]
    }
};