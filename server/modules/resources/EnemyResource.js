/**
 * EnemyResource
 * Represents a harvestable drop from a defeated enemy
 * These are temporary and don't respawn
 */
export class EnemyResource {
  constructor(id, type, x, y, quantity, xpReward = 0) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.quantity = quantity;
    this.maxQuantity = quantity;
    this.xpReward = xpReward;

    // Visual
    this.icon_color = this.getColorForType(type);
    this.size = 12;

    // Lifecycle
    this.isCollected = false;
    this.createdTime = Date.now();
    this.despawnTime = 120000; // 2 minutes before despawning
  }

  /**
   * Get color based on resource type
   * @param {string} type
   * @returns {string} Hex color
   */
  getColorForType(type) {
    const colors = {
      meat: '#d32f2f',
      leather: '#8b4513',
      fur: '#5a4a3a',
      bone: '#d7ccc8',
      tooth: '#b0bec5',
      scale: '#4db6ac'
    };
    return colors[type] || '#999999';
  }

  /**
   * Collect this drop
   * @param {number} amount - Amount to collect
   * @returns {number} Actual amount collected
   */
  collect(amount = this.quantity) {
    if (this.isCollected) return 0;

    const collected = Math.min(amount, this.quantity);
    this.quantity -= collected;

    if (this.quantity <= 0) {
      this.isCollected = true;
    }

    return collected;
  }

  /**
   * Check if this drop should despawn
   * @returns {boolean}
   */
  shouldDespawn() {
    const age = Date.now() - this.createdTime;
    return age > this.despawnTime || this.isCollected;
  }

  /**
   * Serialize for sending to client
   * @returns {object}
   */
  toObject() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      quantity: this.quantity,
      maxQuantity: this.maxQuantity,
      icon_color: this.icon_color,
      size: this.size,
      isCollected: this.isCollected,
      xpReward: this.xpReward
    };
  }
}

/**
 * EnemyResourceTable
 * Defines what drops each enemy type provides
 */
export const ENEMY_RESOURCES = {
  wolf: [
    { type: 'meat', min: 2, max: 4, chance: 0.9, xpReward: 10 },
    { type: 'fur', min: 1, max: 2, chance: 0.7, xpReward: 8 },
    { type: 'bone', min: 1, max: 1, chance: 0.3, xpReward: 5 }
  ],
  bear: [
    { type: 'meat', min: 4, max: 6, chance: 0.95, xpReward: 20 },
    { type: 'fur', min: 2, max: 3, chance: 0.8, xpReward: 15 },
    { type: 'bone', min: 2, max: 2, chance: 0.5, xpReward: 10 },
    { type: 'tooth', min: 1, max: 2, chance: 0.4, xpReward: 12 }
  ]
};

/**
 * Get resource drops for an enemy type
 * @param {string} enemyType - Type of enemy (wolf, bear, etc)
 * @param {number} baseX - X position to drop at
 * @param {number} baseY - Y position to drop at
 * @returns {array} Array of EnemyResource instances
 */
export function generateEnemyDrops(enemyType, baseX, baseY) {
  const drops = [];
  const resourceTable = ENEMY_RESOURCES[enemyType.toLowerCase()];

  if (!resourceTable) {
    console.warn(`No resource table for enemy type: ${enemyType}`);
    return drops;
  }

  let dropIndex = 0;
  for (const resource of resourceTable) {
    // Check if this resource type should drop
    if (Math.random() > resource.chance) continue;

    // Generate quantity
    const quantity = Math.floor(
      Math.random() * (resource.max - resource.min + 1) + resource.min
    );

    // Spread drops slightly so they're not all in same location
    const offset = dropIndex * 10;
    const dropX = baseX + (Math.random() * 20 - 10);
    const dropY = baseY + (Math.random() * 20 - 10);

    const drop = new EnemyResource(
      `drop_${enemyType}_${dropIndex}`,
      resource.type,
      dropX,
      dropY,
      quantity,
      resource.xpReward
    );

    drops.push(drop);
    dropIndex++;
  }

  return drops;
}
