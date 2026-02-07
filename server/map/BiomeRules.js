export const BIOME_RULES = {
  forest: {
    groundTile: "grass",
    description: "Dense forests with abundant vegetation",
    resources: [
      { type: "tree", density: 0.18, icon_color: "#228B22" },      // 18% of tiles
      { type: "berry", density: 0.08, icon_color: "#FF69B4" },     // 8%
      { type: "log", density: 0.06, icon_color: "#8B4513" },       // 6%
      { type: "mushroom", density: 0.04, icon_color: "#FF6347" }   // 4%
    ]
  },

  plains: {
    groundTile: "grass",
    description: "Open grasslands with scattered resources",
    resources: [
      { type: "tree", density: 0.05, icon_color: "#228B22" },
      { type: "berry", density: 0.03, icon_color: "#FF69B4" },
      { type: "flower", density: 0.07, icon_color: "#FFD700" },    // 7%
      { type: "rock", density: 0.04, icon_color: "#A9A9A9" }       // 4%
    ]
  },

  desert: {
    groundTile: "sand",
    description: "Hot, arid lands with sparse resources",
    resources: [
      { type: "rock", density: 0.12, icon_color: "#D2B48C" },      // 12%
      { type: "sand", density: 0.08, icon_color: "#F0E68C" },      // 8%
      { type: "cactus", density: 0.05, icon_color: "#6B8E23" },    // 5%
      { type: "ore", density: 0.03, icon_color: "#696969" }        // 3%
    ]
  },

  snow: {
    groundTile: "snow",
    description: "Frozen tundra with minimal resources",
    resources: [
      { type: "rock", density: 0.08, icon_color: "#B0C4DE" },
      { type: "ice", density: 0.06, icon_color: "#E0FFFF" },
      { type: "ore", density: 0.04, icon_color: "#696969" }
    ]
  },

  swamp: {
    groundTile: "grass",
    description: "Murky wetlands with unique vegetation",
    resources: [
      { type: "tree", density: 0.10, icon_color: "#2F4F4F" },
      { type: "mushroom", density: 0.12, icon_color: "#FF6347" },
      { type: "herb", density: 0.08, icon_color: "#90EE90" },
      { type: "berry", density: 0.05, icon_color: "#FF69B4" }
    ]
  }
};