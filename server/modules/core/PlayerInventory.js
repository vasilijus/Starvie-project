/**
 * PlayerInventory - Manages player inventory and resource gathering
 */
export class PlayerInventory {
  constructor() {
    this.items = {};
  }

  addResource(resourceType, quantity = 1) {
    if (!this.items[resourceType]) {
      this.items[resourceType] = 0;
    }
    this.items[resourceType] += quantity;
    return this.items[resourceType];
  }

  removeResource(resourceType, quantity = 1) {
    if (!this.items[resourceType]) return false;
    
    const newAmount = this.items[resourceType] - quantity;
    if (newAmount < 0) return false;
    
    this.items[resourceType] = newAmount;
    if (this.items[resourceType] === 0) {
      delete this.items[resourceType];
    }
    return true;
  }

  getQuantity(resourceType) {
    return this.items[resourceType] || 0;
  }

  getTotalItems() {
    return Object.values(this.items).reduce((sum, qty) => sum + qty, 0);
  }

  toObject() {
    return { ...this.items };
  }

  clear() {
    this.items = {};
  }
}
