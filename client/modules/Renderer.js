export default class Renderer {
    constructor(canvas, ctx, player, worldRenderer) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.player = player;
        this.worldRenderer = worldRenderer;
    }

    render(state) {
        const { players, enemies = [], resources = [] } = state;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.worldRenderer.draw(ctx, state.world, this.player);

        // players
        for (const id in players) {
            const p = players[id];
            //   console.log(`Player: ${p.id}`)
            // console.log(`Players`, players)
            const sx = p.x - this.player.x + this.canvas.width / 2;
            const sy = p.y - this.player.y + this.canvas.height / 2;
            ctx.fillStyle = id === state.socketId || id === this.player.id ? 'blue' : 'red';
            ctx.fillRect(sx, sy, 20, 20);
            if(p.hp < p.hpMax)
                this.drawHealth(ctx, sx, sy, p.hp);
        }

        // enemies
        for (const enemy of enemies) {
            const sx = enemy.x - this.player.x + this.canvas.width / 2;
            const sy = enemy.y - this.player.y + this.canvas.height / 2;
            // ctx.fillStyle = 'grey';
            ctx.fillStyle = enemy.color;
            ctx.fillRect(sx, sy, 20, 20);
            if(enemy.hp < enemy.hpMax)
                this.drawHealth(ctx, sx, sy, enemy.hp);
        }

        // resources
        for (const r of resources) {
            const sx = r.x - this.player.x + this.canvas.width / 2;
            const sy = r.y - this.player.y + this.canvas.height / 2;
            ctx.fillStyle = r.icon_color || 'green';
            ctx.fillRect(sx, sy, 10, 10);
        }
    }

    drawHealth(ctx, x, y, hp = 100) {
        // 1. Logic for Bar Color (Fixed Order)
        let barColor = "#147800";
        // Check from lowest to highest
        if (hp < 20)    barColor = "#e10707";
        else if (hp < 50)    barColor = "#ff7b00";
        else if (hp < 80)    barColor = "#d1bf00";
        // 2. Draw the Health Bar
        ctx.fillStyle = barColor;
        ctx.fillRect(x - 5, y - 20, (hp / 100) * 30, 5);
        // 3. Draw the HP Number
        ctx.fillStyle = "black"; // Choose a color that stands out
        ctx.font = "9px Arial"; // Set size and font
        ctx.textAlign = "left";  // Align text to the start of your coordinates
        // Use fillText(text, x, y) to place it next to the bar
        // (x + 30) moves it just past the end of a full 100% bar
        ctx.fillText(Math.floor(hp), x +2, y - 25); 
    }
}