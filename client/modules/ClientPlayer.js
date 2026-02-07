/**
 * ClientPlayer - Client-side player that syncs from server
 * Handles only rendering and local state (smooth interpolation, UI)
 */
export class ClientPlayer {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    
    // Server-authoritative position
    this.x = 0;
    this.y = 0;
    
    // Display stats (synced from server)
    this.hp = 100;
    this.hpMax = 100;
    this.level = 1;
    this.xp = 0;
    this.xpToNextLevel = 100;
    this.damage = 10;
    this.size = 20;
    
    // Inventory (synced from server)
    this.inventory = {};
    
    // Local UI state
    this.isAlive = true;
    this.facingDirection = { x: 0, y: -1 };
    this.activeEffects = [];
  }

  /**
   * Update from server state
   */
  syncFromServer(serverState) {
    this.x = serverState.x;
    this.y = serverState.y;
    this.hp = serverState.hp;
    this.hpMax = serverState.hpMax;
    this.damage = serverState.damage;
    this.level = serverState.level;
    this.xp = serverState.xp;
    this.xpToNextLevel = serverState.xpToNextLevel;
    this.inventory = serverState.inventory || {};
    this.isAlive = serverState.isAlive;
    if (serverState.facingDirection) {
      this.facingDirection = serverState.facingDirection;
    }
  }

  /**
   * Update (no-op now that we use direct x/y)
   */
  update() {
    // Smooth interpolation removed - using direct x/y from server
  }

  /**
   * Set player facing direction
   */
  setFacingDirection(direction) {
    this.facingDirection = direction;
  }

  /**
   * Add visual effect (hit, gather, etc.)
   */
  addEffect(effect) {
    this.activeEffects.push(effect);
  }

  /**
   * Remove effect by index
   */
  removeEffect(index) {
    this.activeEffects.splice(index, 1);
  }

  /**
   * Get inventory display info
   */
  getInventorySummary(maxItems = 3) {
    const items = Object.entries(this.inventory)
      .slice(0, maxItems)
      .map(([type, qty]) => ({ type, qty }));
    
    return {
      items,
      totalItems: Object.values(this.inventory).reduce((sum, qty) => sum + qty, 0),
      isEmpty: items.length === 0
    };
  }

  /**
   * Get XP progress (0-1)
   */
  getXPProgress() {
    return Math.min(1, this.xp / Math.max(1, this.xpToNextLevel));
  }
}
