export class Player {
  constructor(id, x = 0, y = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.hp = 100;
    this.hpMax = 100;
    this.isAlive = true;
    this.lastDamageTime = 0;
    this.regenTimer = null;
    this.regenInterval = null;
    this.speed = 5;
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
        // if (this.hp <= 0) {
        //     this.hp = 0;
        //     this.isAlive = false;
        //     console.log(`${this.name} has died.`);
        //     // Handle player death (e.g., respawn, drop inventory, etc.)
        // } else {
        //     console.log(`${this.name} took ${amount} damage, hp is now ${this.hp}.`);
        // }
    }

    startHealing() {
        console.log('Starting regeneration')

        // 3 Tick health every 100ms
        this.regenInterval = setInterval(() => {
            if(this.hp < this.hpMax) {
                this.hp += 1;
                console.log(`Healing... ${this.hp}`);
            } else {
                // Stop once hp i full
                clearInterval(this.regenInterval);
            }
        }, 100)
    }

    move(dx, dy) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }

    toClient() {
        return { id: this.id, x: this.x, y: this.y, hp: this.hp, isAlive: this.isAlive };
    }
}