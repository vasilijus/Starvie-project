export default class StatusPanel {
  constructor(opts = {}) {
    this.x = opts.x ?? 10;
    this.y = opts.y ?? 10;
    this.w = opts.width ?? 200;
    this.h = opts.height ?? 56;
    this.bg = opts.bgColor ?? 'rgba(0,0,0,0.6)';
    this.barBg = opts.barBg ?? '#444';
    this.barFg = opts.barColor ?? '#4caf50';
    this.font = opts.font ?? '14px sans-serif';
    this.padding = 8;
  }

  draw(ctx, player) {
    const lvl = (player.level != null) ? player.level : (player.getLevel ? player.getLevel() : 1);
    const xp = (player.xp != null) ? player.xp : (player.getXP ? player.getXP() : 0);
    const next = (player.nextLevelXp != null) ? player.nextLevelXp : (player.getNextLevelXp ? player.getNextLevelXp() : 100);

    // background box
    ctx.save();
    ctx.translate(0,0);
    ctx.fillStyle = this.bg;
    roundRect(ctx, this.x, this.y, this.w, this.h, 6, true, false);

    // text
    ctx.fillStyle = '#fff';
    ctx.font = this.font;
    ctx.textBaseline = 'top';
    ctx.fillText(`Level ${lvl}`, this.x + this.padding, this.y + this.padding);

    // XP bar
    const barX = this.x + this.padding;
    const barY = this.y + this.h - this.padding - 10;
    const barW = this.w - this.padding * 2;
    const barH = 12;
    ctx.fillStyle = this.barBg;
    ctx.fillRect(barX, barY, barW, barH);
    const pct = Math.max(0, Math.min(1, xp / Math.max(1, next)));
    ctx.fillStyle = this.barFg;
    ctx.fillRect(barX, barY, Math.round(barW * pct), barH);

    // xp text
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${xp} / ${next}`, barX + 6, barY - 12);

    ctx.restore();
  }
}

// helper: rounded rect
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (typeof r === 'undefined') r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}