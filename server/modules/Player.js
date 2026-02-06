export class Player {
  constructor(id, name, x = 0, y = 0) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.size = 20;
    this.hp = 100;
    this.hpMax = 100;
    this.isAlive = true;
    this.lastDamageTime = 0;
    this.regenTimer = null;
    this.regenInterval = null;
    this.speed = 5;
    this.damage = 1;
    this.healSpeed = 1;
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 2;
    
  }

//   takeDamage(amount) {
//     this.hp -= amount;
//     if (this.hp <= 0) {
//       this.hp = 0;
//       this.isAlive = false;
//     }
//   }
    takeDamage(amount) {
        if (!this.isAlive) return;
        this.hp -= amount;
        // 1. Interrupt any existing wait or active healing
        clearTimeout(this.regenTimer);
        clearInterval(this.regenInterval)

        // 2. Start a new 5-second "no-damage" wait
        this.regenTimer = setTimeout(() => {
            this.startHealing();
        }, 5000)

    }

    startHealing() {
        // console.log('Starting regeneration')

        // 3 Tick health every 100ms
        this.regenInterval = setInterval(() => {
            if(this.hp < this.hpMax) {
                this.hp += this.healSpeed;
                // if (this.hp % 20 === 0) {
                //     console.log(`Healing... ${this.hp}%`);
                // }
            } else {
                // Stop once hp i full
                console.log(`Healed... ${this.hp}`);
                clearInterval(this.regenInterval);
            }
        }, 1000) // hp per second
    }

    addXP(ammount) {
        this.xp += ammount;

        // Use 'while' in case they gain enough XP for multiple levels
        while(this.xp >= this.xpToNext) {
            this.levelUp();
        }
    }

    levelUp() {
        this.xp -= this.xpToNext; // Keep leftover XP
        this.level++;
        
        // Update the threshold using a formula (see below)
        this.xpToNext = this.calculateNextLevel(this.xpToNext);
        console.log(`Leveled Up! Current Level: ${this.level}`);
        // console.log(`Player data: ${this})
        this.increaseDamage(this.damage * 0.5);
        this.increaseStats();
    }
d
    calculateNextLevel(lvl) {
        return lvl * 2;
    }

    increaseDamage(strenght) {
        this.damage += strenght;
    }

    increaseStats() {
        let percent = 5;
        this.hpMax += percent
    }
    move(dx, dy) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }

    toClient() {
        return { 
            id: this.id,
            x: this.x,
            y: this.y,
            hp: this.hp,
            hpMax: this.hpMax,
            isAlive: this.isAlive,
            damage: this.damage 
        };
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }
}