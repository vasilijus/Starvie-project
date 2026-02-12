// import { Tree, BerryBush, StoneResource, GrassResource } from './EnvironmentResource.js';
import { 
  Tree, BerryBush, StoneResource, GrassResource,
  MushroomResource, HerbResource, FlowerResource, LogResource,
  RockResource, SandResource, CactusResource, OreResource,
  GemResource, IceResource, CrystalResource
} from './EnvironmentResource.js';

import { generateGUID } from '../../utils/GUID.js';

/**
 * ResourceFactory
 * Creates resource instances based on type
 */
export class ResourceFactory {
  /**
   * Create a resource by type
   * @param {string} type - Resource type (tree, berry, stone, grass)
   * @param {number} x - World X position
   * @param {number} y - World Y position
   * @returns {Resource}
   */
  static createResource(type, x, y) {
    const id = `resource_${generateGUID()}`;

    // switch (type.toLowerCase()) {
    //   case 'tree':
    //     return new Tree(id, x, y);
    //   case 'berry':
    //   case 'berry_bush':
    //     return new BerryBush(id, x, y);
    //   case 'stone':
    //     return new StoneResource(id, x, y);
    //   case 'grass':
    //     return new GrassResource(id, x, y);
    //   default:
    //     throw new Error(`Unknown resource type: ${type}`);
    // }
        switch (type.toLowerCase()) {
      case 'tree':
        return new Tree(id, x, y);
      case 'berry':
      case 'berry_bush':
        return new BerryBush(id, x, y);
      case 'stone':
        return new StoneResource(id, x, y);
      case 'grass':
        return new GrassResource(id, x, y);
      case 'mushroom':
        return new MushroomResource(id, x, y);
      case 'herb':
        return new HerbResource(id, x, y);
      case 'flower':
        return new FlowerResource(id, x, y);
      case 'log':
        return new LogResource(id, x, y);
      case 'rock':
        return new RockResource(id, x, y);
      case 'sand':
        return new SandResource(id, x, y);
      case 'cactus':
        return new CactusResource(id, x, y);
      case 'ore':
        return new OreResource(id, x, y);
      case 'gem':
        return new GemResource(id, x, y);
      case 'ice':
        return new IceResource(id, x, y);
      case 'crystal':
        return new CrystalResource(id, x, y);
      default:
        throw new Error(`Unknown resource type: ${type}`);
    }
  }

  /**
   * Create multiple resources from chunk data
   * @param {array} resourceData - Array of {type, x, y, icon_color}
   * @returns {array} Array of Resource instances
   */
  static createResourcesFromChunkData(resourceData) {
    return resourceData.map(data => {
      const resource = this.createResource(data.type, data.x, data.y);
      // Override icon color if provided
      if (data.icon_color) {
        resource.icon_color = data.icon_color;
      }
      return resource;
    });
  }
}
