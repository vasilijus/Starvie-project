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
      this.drawHealth(ctx, sx, sy, p.hp);
    }

    // enemies
    for (const enemy of enemies) {
      const sx = enemy.x - this.player.x + this.canvas.width / 2;
      const sy = enemy.y - this.player.y + this.canvas.height / 2;
      ctx.fillStyle = 'grey';
      ctx.fillRect(sx, sy, 20, 20);
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
    ctx.fillStyle = 'green';
    ctx.fillRect(x - 5, y - 20, (hp / 100) * 30, 5);
  }
}