export class World {
    constructor() {
        this.biomes = ['forest', 'desert', 'mountain', 'swamp'];
        // this.players = {};
        // this.items = [];
    }

    addPlayer(player) { this.players[player.id] = player; }
    removePlayer(playerId) { delete this.players[playerId]; }

    // addItem(item) { this.items.push(item); }
    // removeItem(itemId) { this.items = this.items.filter(item => item.id !== itemId); }

    draw(ctx, player, size) {
        const offsetX = size / 2 - player.renderX + ctx.canvas.width / 2;
        const offsetY = size / 2 - player.renderY + ctx.canvas.height / 2;
        console.log(`Player render position: x=${player.x}, y=${player.y}`); // Debug log for player render position
        // const offsetY = player ? player.y - ctx.canvas.height / 2 : 0;

        ctx.fillStyle = "#2a5";
        ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
        // ctx.fillStyle = "#2a5";
        // ctx.fillRect(-offsetX, -offsetY, size, size); // Draw the world background
  
        // ctx.strokeStyle = "#000";
        // ctx.lineWidth = 1;
        // ctx.strokeRect(-offsetX, -offsetY, size, size); // Draw the world border
        
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