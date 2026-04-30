const resourceSheetUrl = new URL('../assets/resource_sprite_sheet.png', import.meta.url).href;
const enemySheetUrl = new URL('../assets/enemies_sprite_sheet.png', import.meta.url).href;

function createAtlas(src) {
    const image = new Image();
    image.src = src;
    return image;
}

const resourceAtlas = createAtlas(resourceSheetUrl);
const enemyAtlas = createAtlas(enemySheetUrl);

export function getResourceAtlasImage() {
    return resourceAtlas;
}

export function getEnemyAtlasImage() {
    return enemyAtlas;
}

export function isAtlasReady(image) {
    return Boolean(image && image.complete && image.naturalWidth > 0);
}
