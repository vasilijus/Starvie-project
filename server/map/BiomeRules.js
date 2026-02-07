export const BIOME_RULES = {
  forest: {
    groundTile: "grass",

    resources: [
      { type: "tree", density: 0.18 },   // 18% of tiles
      { type: "berry", density: 0.06 }   // 6%
    ]
  },

  plains: {
    groundTile: "grass",

    resources: [
      { type: "tree", density: 0.05 },
      { type: "berry", density: 0.03 }
    ]
  },

  desert: {
    groundTile: "sand",

    resources: [
      { type: "rock", density: 0.12 }
    ]
  }
};