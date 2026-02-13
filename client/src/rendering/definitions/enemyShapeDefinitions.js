export const enemyShapeDefinitions = {
    default: { kind: 'square' }
};

export function getEnemyShapeDefinition(enemyType) {
    return enemyShapeDefinitions[enemyType] || enemyShapeDefinitions.default;
}
