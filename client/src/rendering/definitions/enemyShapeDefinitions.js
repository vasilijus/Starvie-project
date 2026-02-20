export const enemyShapeDefinitions = {
    wolf: { kind: 'wolf' },
    bear: { kind: 'bear' },
    hyena: { kind: 'hyena' },
    rabbit: { kind: 'rabbit' },
    default: { kind: 'square' }
};

export function getEnemyShapeDefinition(enemyType) {
    return enemyShapeDefinitions[enemyType] || enemyShapeDefinitions.default;
}
