export const BIOME_RULES = {
  forest: {
    groundTile: "grass",
    description: "Dense forests with abundant vegetation and wildlife",
    resources: [
      { type: "tree", density: 0.10, icon_color: "#2F5233" },           // 10% - primary resource
      { type: "berry", density: 0.05, icon_color: "#FF6B9D" },          // 5% - food source
      { type: "log", density: 0.04, icon_color: "#8B6F47" },            // 4% - building material
      { type: "mushroom", density: 0.03, icon_color: "#A0522D" },       // 3% - medicinal
      { type: "herb", density: 0.02, icon_color: "#90EE90" }            // 2% - crafting
    ]
  },

  plains: {
    groundTile: "grass",
    description: "Open grasslands with scattered trees and abundant flowers",
    resources: [
      { type: "flower", density: 0.08, icon_color: "#FFD700" },         // 8% - primary, abundant
      { type: "tree", density: 0.04, icon_color: "#2F5233" },           // 4% - scattered trees
      { type: "berry", density: 0.03, icon_color: "#FF6B9D" },          // 3% - berries
      { type: "rock", density: 0.03, icon_color: "#808080" },           // 3% - stone
      { type: "herb", density: 0.03, icon_color: "#90EE90" }            // 3% - herbs
    ]
  },

  desert: {
    groundTile: "sand",
    description: "Hot, arid lands with rocks and precious metals",
    resources: [
      { type: "rock", density: 0.10, icon_color: "#D2B48C" },           // 10% - very abundant
      { type: "sand", density: 0.07, icon_color: "#F4A460" },           // 7% - abundant
      { type: "cactus", density: 0.04, icon_color: "#6B8E23" },         // 4% - water source
      { type: "ore", density: 0.05, icon_color: "#696969" },            // 5% - metal ore
      { type: "gem", density: 0.02, icon_color: "#8B008B" }             // 2% - rare gems
    ]
  },

  snow: {
    groundTile: "snow",
    description: "Frozen tundra with minimal but valuable resources",
    resources: [
      { type: "rock", density: 0.06, icon_color: "#B0C4DE" },           // 6% - abundant stone
      { type: "ice", density: 0.05, icon_color: "#E0FFFF" },            // 5% - water source
      { type: "ore", density: 0.04, icon_color: "#696969" },            // 4% - rare ore
      { type: "crystal", density: 0.02, icon_color: "#B0E0E6" },        // 2% - rare
      { type: "herb", density: 0.01, icon_color: "#90EE90" }            // 1% - very rare herbs
    ]
  },

  swamp: {
    groundTile: "grass",
    description: "Murky wetlands with unique vegetation and dark resources",
    resources: [
      { type: "mushroom", density: 0.10, icon_color: "#8B4513" },       // 10% - most abundant here
      { type: "herb", density: 0.07, icon_color: "#90EE90" },           // 7% - medicinal herbs
      { type: "tree", density: 0.05, icon_color: "#2F5233" },           // 5% - darker wood
      { type: "berry", density: 0.04, icon_color: "#FF6B9D" },          // 4% - rare berries
      { type: "ore", density: 0.02, icon_color: "#696969" }             // 2% - bog ore
    ]
  }
};