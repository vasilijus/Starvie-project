export const resourceShapeDefinitions = {
    tree: { kind: 'tree' },
    stone: { kind: 'stone' },
    rock: { kind: 'stone' },
    ore: { kind: 'stone' },
    gem: { kind: 'stone' },
    crystal: { kind: 'stone' },
    ice: { kind: 'stone' },
    default: { kind: 'circle' }
};

export function getResourceShapeDefinition(type) {
    return resourceShapeDefinitions[type] || resourceShapeDefinitions.default;
}
