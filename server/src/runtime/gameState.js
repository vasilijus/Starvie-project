import {
  generateWorld,
  WORLD_CHUNKS,
  CHUNK_SIZE,
  TILE_SIZE,
} from '../world/ProceduralMap.js';
import { Wolf, Bear, Hyena, Rabbit, EN_TYPES } from '../entities/enemy/EnemyTypes.js';
import { ResourceFactory } from '../entities/resource/ResourceFactory.js';

function loadResourcesFromChunks(world) {
  const loadedResources = [];

  for (const key in world.chunks) {
    const chunk = world.chunks[key];
    if (!chunk.resources || !Array.isArray(chunk.resources)) continue;

    for (const resourceData of chunk.resources) {
      try {
        const resource = ResourceFactory.createResource(
          resourceData.type,
          resourceData.x,
          resourceData.y
        );

        if (resourceData.icon_color) {
          resource.icon_color = resourceData.icon_color;
        }

        loadedResources.push(resource);
      } catch (err) {
        console.warn(`Failed to create resource of type ${resourceData.type}: ${err.message}`);
      }
    }
  }

  return loadedResources;
}

function spawnEnemies(worldSize, count = 20) {
  const enemies = [];

  for (let i = 0; i < count; i++) {
    const id = `enemy${i}`;
    const num = Math.floor(Math.random() * EN_TYPES);
    const xPos = Math.floor(Math.random() * worldSize);
    const yPos = Math.floor(Math.random() * worldSize);

    let mob;
    switch (num) {
      case 0:
        mob = new Wolf(`w_${id}`, xPos, yPos);
        break;
      case 1:
        mob = new Bear(`b_${id}`, xPos, yPos);
        break;
      case 2:
        mob = new Hyena(`h_${id}`, xPos, yPos);
        break;
      default:
        mob = new Rabbit(`r_${id}`, xPos, yPos);
        break;
    }

    enemies.push(mob);
  }

  return enemies;
}

export function createGameState() {
  const world = generateWorld();
  const worldSize = WORLD_CHUNKS * CHUNK_SIZE * TILE_SIZE;

  return {
    world,
    worldSize,
    players: {},
    enemies: spawnEnemies(worldSize),
    resources: loadResourcesFromChunks(world),
    enemyDrops: [],
    movementQueue: [],
  };
}
