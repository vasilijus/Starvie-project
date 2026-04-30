const CELL_SIZE = 64;

function frameAt(column, row) {
    return {
        sx: column * CELL_SIZE,
        sy: row * CELL_SIZE,
        sw: CELL_SIZE,
        sh: CELL_SIZE
    };
}

export const enemySpriteDefinitions = {
    rabbit: frameAt(0, 0),
    wolf: frameAt(2, 0),
    hyena: frameAt(4, 0),
    bear: frameAt(5, 0),
    default: frameAt(2, 0)
};

export function getEnemySpriteDefinition(type) {
    return enemySpriteDefinitions[type] || enemySpriteDefinitions.default;
}
