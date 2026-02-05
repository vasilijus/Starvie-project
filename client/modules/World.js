export class World {
    constructor() {
        this.biomes = ['forest', 'desert', 'mountain', 'swamp'];
        // this.players = {};
        // this.items = [];
    }

    addPlayer(player) {
        this.players[player.id] = player;
    }

    removePlayer(playerId) {
        delete this.players[playerId];
    }

    // addItem(item) {
    //     this.items.push(item);
    // }

    // removeItem(itemId) {
    //     this.items = this.items.filter(item => item.id !== itemId);
    // }

    draw(ctx, player) {
        ctx.fillStyle = "#2a5";
        ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
  
        // players.forEach(player => {
        //     ctx.fillStyle = player.color;
        //     ctx.fillRect(player.x, player.y, player.size, player.size);
        // });

        // this.items.forEach(item => {
        //     ctx.fillStyle = item.color;
        //     ctx.fillRect(item.x, item.y, item.size, item.size);
        // });
    }
}