export class Player {
    constructor(id, name) {
        this.id = id
        this.name = `${name}`;
        // this.id = id;
        // Get spawn position from server or generate randomly
        
        // this.x = 100;
        // this.y = 100;
        this.renderX = 0;
        this.renderY = 0;
        this.size = 10;
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 5;
        this.inventory = [];
        this.equipment = {
            mainHand: null,
            offHand: null,
            head: null,
            body: null
        };
        this.regenRate = 1; // HP per second
        this.regenDelay = 5000; // Time in ms before health starts regenerating after taking damage
        this.lastDamageTime = 0; // Timestamp of the last time the player took damage   
        this.isAlive = true;
        this.facingDirection = { x: 0, y: -1 }; // Direction player is facing (normalized)
    }

    update() {
        // Smoothly interpolate render position towards actual position for better visuals
        this.renderX += (this.x - this.renderX) * 0.1;
        this.renderY += (this.y - this.renderY) * 0.1;
        // alert('test')
    }

    // takeDamage(amount) {
    //     if (!this.isAlive) return;
    //     this.lastDamageTime = Date.now();
    //     this.health -= amount;
    //     if (this.health <= 0) {
    //         this.health = 0;
    //         this.isAlive = false;
    //         console.log(`${this.name} has died.`);
    //         // Handle player death (e.g., respawn, drop inventory, etc.)
    //     } else {
    //         console.log(`${this.name} took ${amount} damage, health is now ${this.health}.`);
    //     }
    // }
    

    // equip(itemName) {
    //     this.equipment.mainHand = itemName;
    //     console.log(`${this.name} equipped ${itemName}`);
    // }

    // Start regenerating health after taking damage
    // startHealthRegen() {
    //     if (this.healthRegenInterval) return; // Already regenerating
    //     this.healthRegenInterval = setInterval(() => {
    //         if (this.health < this.maxHealth) {
    //             this.health += this.regenRate; // Regenerate 1 HP per second
    //             console.log(`${this.name} regenerates health, current HP: ${this.health}`);
    //         } else {
    //             clearInterval(this.healthRegenInterval);
    //             this.healthRegenInterval = null;
    //         }
    //     }, 1000);
    // }


    // If player is no longer taking damage, start health regeneration
    // checkHealthRegen() {
    //     if (this.lastDamageTime && Date.now() - this.lastDamageTime > 5000) { // 5 seconds without damage
    //         this.startHealthRegen();
    //     } else if (this.healthRegenInterval) {
    //         clearInterval(this.healthRegenInterval);
    //         this.healthRegenInterval = null;
    //     }   
    // }



    // harvestResource(resource) {
    //     if (!this.isAlive) return;
    //     // Add resource to inventory and remove from world
    //     this.inventory.push(resource);
    //     // Notify server to remove resource from world (not implemented here)
    // }
    
    // Additional methods for combat, crafting, etc. can be added here

    // Mouse click event listener for attacking and harvesting resources can be set up in the main game loop or a separate input handler
    
    // // method for combat
    // attack(target) {
    //     if (!this.isAlive || !target.isAlive) return;
    //     // Example attack logic (simplified)
    //     target.takeDamage(10); // Reduce target's health by 10
    // }

    // // Listen for a mouse click event to harvest resources
    // setupHarvestListener() {
    //     document.addEventListener('click', (event) => {
    //         // Check if player is clicking on a resource (this is a simplified example)
    //         const clickedResource = this.getClickedResource(event.clientX, event.clientY);
    //         if (clickedResource) {
    //             this.harvestResource(clickedResource);
    //         }
    //     });
    // }

    // getClickedResource(x, y) {
    //     // This function should check if the click coordinates intersect with any resource in the world
    //     // For simplicity, we will return a dummy resource if the click is within a certain area
    //     // In a real implementation, you would check against actual resource positions in the world
    //     if (x > 100 && x < 200 && y > 100 && y < 200) {
    //         return { id: 'resource1', type: 'wood', hp: 100 };
    //     }
    //     return null;
    // }
}