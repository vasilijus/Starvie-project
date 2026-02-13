export const resourceShapeDefinitions = {
    tree: { kind: 'tree' },
    stone: { kind: 'stone' },
    rock: { kind: 'rock' },
    mushroom: { kind: 'mushroom' },
    cactus: { kind: 'cactus' },
    gem: { kind: 'gem' },
    default: { kind: 'circle' }
};

export function getResourceShapeDefinition(type) {
    return resourceShapeDefinitions[type] || resourceShapeDefinitions.default;
}
