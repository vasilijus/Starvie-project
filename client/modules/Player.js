export class Player {
    constructor(name) {
        this.name = `${name}`;
        // this.id = id;
        this.x = 100;
        this.y = 100;
        this.renderX = 0;
        this.renderY = 0;
        this.size = 50;
        this.color = 'red'; 
        this.health = 100;
        this.speed = 5;
        this.inventory = [];
        this.equipment = {};
    }

    update() {
        // Smoothly interpolate render position towards actual position for better visuals
        this.renderX += (this.x - this.renderX) * 0.1;
        this.renderY += (this.y - this.renderY) * 0.1;
    }
}