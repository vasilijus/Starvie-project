export const resourceVisualDefinitions = {
    tree: { kind: 'tree', defaultColor: '#2d5016', defaultRenderRadius: 20 },
    stone: { kind: 'stone', defaultColor: '#7a7a7a', defaultRenderRadius: 15 },
    grass: { kind: 'grassTuft', defaultColor: '#6b8e23', defaultRenderRadius: 10 },
    flower: { kind: 'flower', defaultColor: '#FFD700', defaultRenderRadius: 9 },
    rock: { kind: 'stone', defaultColor: '#808080', defaultRenderRadius: 10 },
    sand: { kind: 'sandPile', defaultColor: '#F4A460', defaultRenderRadius: 10 },
    gem: { kind: 'gem', defaultColor: '#8B008B', defaultRenderRadius: 9 },
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
