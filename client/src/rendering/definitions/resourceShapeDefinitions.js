export const resourceShapeDefinitions = {
    tree: { kind: 'tree' },
    stone: { kind: 'stone' },
    default: { kind: 'circle' }
};

export function getResourceShapeDefinition(type) {
    return resourceShapeDefinitions[type] || resourceShapeDefinitions.default;
}
