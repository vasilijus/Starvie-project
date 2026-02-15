export const resourceVisualDefinitions = {
    tree: { kind: 'tree', defaultColor: '#2d5016', defaultRenderRadius: 20 },
    berry: { kind: 'berryBush', defaultColor: '#8b2f39', defaultRenderRadius: 8 },
    stone: { kind: 'stone', defaultColor: '#7a7a7a', defaultRenderRadius: 15 },
    grass: { kind: 'grassTuft', defaultColor: '#6b8e23', defaultRenderRadius: 10 },
    mushroom: { kind: 'mushroom', defaultColor: '#A0522D', defaultRenderRadius: 10 },
    herb: { kind: 'leafCluster', defaultColor: '#90EE90', defaultRenderRadius: 8 },
    flower: { kind: 'flower', defaultColor: '#FFD700', defaultRenderRadius: 9 },
    log: { kind: 'log', defaultColor: '#8B6F47', defaultRenderRadius: 12 },
    rock: { kind: 'stone', defaultColor: '#808080', defaultRenderRadius: 10 },
    sand: { kind: 'sandPile', defaultColor: '#F4A460', defaultRenderRadius: 10 },
    cactus: { kind: 'cactus', defaultColor: '#6B8E23', defaultRenderRadius: 12 },
    ore: { kind: 'ore', defaultColor: '#696969', defaultRenderRadius: 12 },
    gem: { kind: 'gem', defaultColor: '#8B008B', defaultRenderRadius: 9 },
    ice: { kind: 'ice', defaultColor: '#E0FFFF', defaultRenderRadius: 11 },
    crystal: { kind: 'crystal', defaultColor: '#B0E0E6', defaultRenderRadius: 12 },
    gold: { kind: 'goldNugget', defaultColor: '#d4af37', defaultRenderRadius: 10 },
    grain: { kind: 'grain', defaultColor: '#d9c565', defaultRenderRadius: 10 },
    default: { kind: 'circle', defaultColor: '#00AA00', defaultRenderRadius: 10 }
};

export function getResourceVisualDefinition(type) {
    return resourceVisualDefinitions[type] || resourceVisualDefinitions.default;
}

export function getResourceTypes() {
    return Object.keys(resourceVisualDefinitions).filter((k) => k !== 'default');
}
