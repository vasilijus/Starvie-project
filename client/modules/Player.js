export class Player {
    constructor(name) {
        this.name = `${name}`;
        // this.id = id;
        this.x = 100;
        this.y = 100;
        this.size = 50;
        this.color = 'red'; 
        this.health = 100;
        this.speed = 5;
        this.inventory = [];
        this.equipment = {};
    }
}