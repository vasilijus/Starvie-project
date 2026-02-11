export default class SkillSystem {
  constructor() {
    // Define skills with XP thresholds per level
    this.skills = {
      woodcutting: {
        name: 'Woodcutting',
        color: '#8B4513',
        xpPerLevel: 100, // XP needed to go from level N to N+1
        description: 'Gather more wood per tree'
      },
      cooking: {
        name: 'Cooking',
        color: '#FF6347',
        xpPerLevel: 120,
        description: 'Cook food faster'
      },
      crafting: {
        name: 'Crafting',
        color: '#FFD700',
        xpPerLevel: 150,
        description: 'Craft items faster'
      },
      mining: {
        name: 'Mining',
        color: '#A9A9A9',
        xpPerLevel: 100,
        description: 'Gather more stone per mine'
      },
      combat: {
        name: 'Combat',
        color: '#DC143C',
        xpPerLevel: 80,
        description: 'Deal more damage'
      }
    };
  }

  // Initialize player skills (call once when player is created)
  initializePlayerSkills(player) {
    if (player.skills) return; // already initialized
    player.skills = {};
    for (const skillKey of Object.keys(this.skills)) {
      player.skills[skillKey] = {
        level: 1,
        xp: 0
      };
    }
  }

  // Get XP needed for next level
  getXpToNextLevel(skillKey) {
    return this.skills[skillKey]?.xpPerLevel || 100;
  }

  // Award XP to a skill; returns {leveledUp: bool, newLevel: int}
  awardXp(player, skillKey, amount) {
    if (!this.skills[skillKey]) {
      console.warn(`Unknown skill: ${skillKey}`);
      return { leveledUp: false, newLevel: 0 };
    }

    if (!player.skills) this.initializePlayerSkills(player);
    if (!player.skills[skillKey]) {
      player.skills[skillKey] = { level: 1, xp: 0 };
    }

    const skill = player.skills[skillKey];
    const xpNeeded = this.getXpToNextLevel(skillKey);

    skill.xp += amount;
    let leveledUp = false;

    // Check for level ups
    while (skill.xp >= xpNeeded) {
      skill.xp -= xpNeeded;
      skill.level += 1;
      leveledUp = true;
      console.log(`✓ ${this.skills[skillKey].name} is now level ${skill.level}!`);
    }

    return { leveledUp, newLevel: skill.level };
  }

  // Get skill info for UI
  getSkillInfo(player, skillKey) {
    if (!player.skills || !player.skills[skillKey]) {
      return { level: 1, xp: 0, xpToNext: this.getXpToNextLevel(skillKey) };
    }
    const skill = player.skills[skillKey];
    return {
      level: skill.level,
      xp: skill.xp,
      xpToNext: this.getXpToNextLevel(skillKey)
    };
  }

  // Get bonus based on skill level (e.g., woodcutting lvl 5 = +4 gather bonus)
  getGatherBonus(player, skillKey) {
    if (!player.skills || !player.skills[skillKey]) return 0;
    return Math.max(0, player.skills[skillKey].level - 1); // Level 1 = +0, Level 5 = +4
  }

  getDamageBonus(player) {
    return this.getGatherBonus(player, 'combat') * 0.1; // +10% per level above 1
  }

  getCraftTimeReduction(player) {
    return Math.min(0.5, this.getGatherBonus(player, 'crafting') * 0.05); // up to 50% faster
  }
}
