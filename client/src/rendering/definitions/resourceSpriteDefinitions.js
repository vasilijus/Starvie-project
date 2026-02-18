const RESOURCE_SHEET_LAYOUT = {
    cellWidth: 256,
    cellHeight: 154,
    spriteOffsetX: 64,
    spriteOffsetY: 10,
    spriteWidth: 128,
    spriteHeight: 128
};

function frameAt(column, row) {
    const { cellWidth, cellHeight, spriteOffsetX, spriteOffsetY, spriteWidth, spriteHeight } = RESOURCE_SHEET_LAYOUT;
    return {
        sx: column * cellWidth + spriteOffsetX,
        sy: row * cellHeight + spriteOffsetY,
        sw: spriteWidth,
        sh: spriteHeight
    };
}

export const resourceSpriteDefinitions = {
    tree: { normal: frameAt(0, 0), empty: frameAt(1, 0) },
    berry: { normal: frameAt(2, 0), empty: frameAt(3, 0) },
    stone: { normal: frameAt(0, 1), empty: frameAt(1, 1) },
    grass: { normal: frameAt(2, 1), empty: frameAt(3, 1) },
    mushroom: { normal: frameAt(0, 2), empty: frameAt(1, 2) },
    herb: { normal: frameAt(2, 2), empty: frameAt(3, 2) },
    flower: { normal: frameAt(0, 3), empty: frameAt(1, 3) },
    log: { normal: frameAt(2, 3), empty: frameAt(3, 3) },
    sand: { normal: frameAt(0, 4), empty: frameAt(1, 4) },
    rock: { normal: frameAt(2, 4), empty: frameAt(3, 4) },
    cactus: { normal: frameAt(2, 5), empty: frameAt(3, 5) },
    gem: { normal: frameAt(0, 6), empty: frameAt(1, 6) },
    ore: { normal: frameAt(2, 6), empty: frameAt(3, 6) },
    gold: { normal: frameAt(0, 8), empty: frameAt(1, 8) },
    crystal: { normal: frameAt(2, 8), empty: frameAt(3, 8) },
    grain: { normal: frameAt(2, 9), empty: frameAt(3, 9) },
    default: { normal: frameAt(0, 1), empty: frameAt(1, 1) }
};

export function getResourceSpriteDefinition(type) {
    return resourceSpriteDefinitions[type] || resourceSpriteDefinitions.default;
}
