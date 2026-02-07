/**
 * PlayerExperience - Manages XP and leveling progression
 */
export class PlayerExperience {
  constructor() {
    this.xp = 0;
    this.xpToNextLevel = 100;
    this.level = 1;
  }

  addXP(amount) {
    this.xp += amount;
    const leveledUp = this.xp >= this.xpToNextLevel;
    
    if (leveledUp) {
      this.xp -= this.xpToNextLevel;
      this.levelUp();
    }
    
    return leveledUp;
  }

  levelUp() {
    this.level++;
    this.xpToNextLevel = this.calculateNextLevelThreshold();
  }

  calculateNextLevelThreshold() {
    return this.xpToNextLevel * 1.5; // Exponential growth
  }

  getProgress() {
    return Math.min(1, this.xp / this.xpToNextLevel);
  }

  toObject() {
    return {
      xp: this.xp,
      level: this.level,
      xpToNextLevel: this.xpToNextLevel,
      progress: this.getProgress()
    };
  }
}
