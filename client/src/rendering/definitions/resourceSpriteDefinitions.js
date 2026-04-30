const RESOURCE_SHEET_LAYOUT = {
    cellWidth: 128,
    cellHeight: 128,
    spriteOffsetX: 0,
    spriteOffsetY: 0,
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
    stone: { normal: frameAt(0, 1), empty: frameAt(1, 1) },
    grass: { normal: frameAt(0, 2), empty: frameAt(0, 2) },
    flower: { normal: frameAt(0, 3), empty: frameAt(1, 3) },
    sand: { normal: frameAt(0, 4), empty: frameAt(0, 4) },
    rock: { normal: frameAt(0, 5), empty: frameAt(0, 5) },
    gem: { normal: frameAt(0, 6), empty: frameAt(0, 6) },
    gold: { normal: frameAt(0, 7), empty: frameAt(0, 7) },
    crystal: { normal: frameAt(0, 8), empty: frameAt(0, 8) },
    default: { normal: frameAt(0, 1), empty: frameAt(1, 1) }
};

export function getResourceSpriteDefinition(type) {
    return resourceSpriteDefinitions[type] || resourceSpriteDefinitions.default;
}
