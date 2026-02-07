/**
 * PlayerHealth - Manages health regeneration and damage timing
 */
export class PlayerHealth {
  constructor(stats) {
    this.stats = stats;
    this.lastDamageTime = 0;
    this.regenTimer = null;
    this.regenInterval = null;
    this.REGEN_DELAY = 5000; // 5 seconds after damage
    this.HEAL_SPEED = 1; // HP per second
    this.HEAL_TICK = 1000; // 1 second per tick
  }

  takeDamage(amount) {
    if (this.stats.hp <= 0) return false;
    
    this.stats.takeDamage(amount);
    this.lastDamageTime = Date.now();
    
    // Interrupt existing regen
    this.stopRegen();
    
    // Schedule new regen after delay
    this.regenTimer = setTimeout(() => {
      this.startRegen();
    }, this.REGEN_DELAY);

    return this.stats.hp <= 0; // Return true if player died
  }

  startRegen() {
    this.regenInterval = setInterval(() => {
      if (this.stats.hp >= this.stats.hpMax) {
        this.stopRegen();
        return;
      }
      
      this.stats.heal(this.HEAL_SPEED);
    }, this.HEAL_TICK);
  }

  stopRegen() {
    if (this.regenTimer) {
      clearTimeout(this.regenTimer);
      this.regenTimer = null;
    }
    if (this.regenInterval) {
      clearInterval(this.regenInterval);
      this.regenInterval = null;
    }
  }

  cleanup() {
    this.stopRegen();
  }

  toObject() {
    return {
      hp: this.stats.hp,
      hpMax: this.stats.hpMax,
      isDamaged: this.stats.hp < this.stats.hpMax
    };
  }
}
