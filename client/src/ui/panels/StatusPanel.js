export default class StatusPanel {
    constructor(opts = {}) {
        this.x = opts.x ?? 10;
        this.y = opts.y ?? 10;
        this.w = opts.width ?? 200;
        this.bg = opts.bgColor ?? 'rgba(0,0,0,0.8)';
        this.barBg = opts.barBg ?? '#444';
        this.barFg = opts.barColor ?? '#4caf50';
        this.font = opts.font ?? '14px sans-serif';
        this.padding = 10;

        this.recipesToShow = 3;
        this.craftingFont = '11px sans-serif';
        this.gearFont = '11px sans-serif';
        this.craftBadgeColor = '#2ecc71';
        this.craftBadgeDisabled = '#555';
    }

    draw(ctx, player) {
        const lvl = player.level || 1;
        const xp = player.xp || 0;
        const next = player.xpToNextLevel || 100;
        const recipes = player.recipes || [];
        const gear = player.gear || player.equipment || [];

        // --- 1. GET RECENT RESOURCES ---
        // Reverse entries to show newest pickups first
        const inventoryEntries = Object.entries(player.inventory || {}).reverse();
        const visibleResources = inventoryEntries.slice(0, 3);

        // --- 2. DYNAMIC HEIGHT CALCULATION ---
        let totalHeight = this.padding * 2;
        totalHeight += 25; // Level
        totalHeight += 30; // XP Bar
        totalHeight += 20 + (Math.max(1, visibleResources.length) * 15); // Resources
        totalHeight += 20 + (recipes.length > 0 ? Math.min(this.recipesToShow, recipes.length) * 16 : 16); 
        totalHeight += 20 + (gear.length > 0 ? Math.min(3, gear.length) * 18 : 14);
        totalHeight += 45; // Hotbar

        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Draw background
        ctx.fillStyle = this.bg;
        roundRect(ctx, this.x, this.y, this.w, totalHeight, 8, true, false);

        let currentY = this.y + this.padding;

        // --- 3. DRAW LEVEL ---
        ctx.fillStyle = '#fff';
        ctx.font = this.font;
        ctx.fillText(`Level ${lvl}`, this.x + this.padding, currentY -5);
        currentY += 25;

        // --- 4. DRAW XP BAR ---
        const barW = this.w - this.padding * 2;
        ctx.fillStyle = this.barBg;
        ctx.fillRect(this.x + this.padding, currentY, barW, 10);
        const pct = Math.max(0, Math.min(1, xp / next));
        ctx.fillStyle = this.barFg;
        ctx.fillRect(this.x + this.padding, currentY, Math.round(barW * pct), 10);
        
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.fillText(`XP: ${xp} / ${next}`, this.x + this.padding, currentY - 12);
        currentY += 25;

        // --- 5. DRAW RECENT RESOURCES ---
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Recent Resources:', this.x + this.padding, currentY);
        currentY += 15;

        if (visibleResources.length === 0) {
            ctx.fillStyle = '#888';
            ctx.font = '11px sans-serif';
            ctx.fillText('(empty)', this.x + this.padding + 5, currentY);
            currentY += 15;
        } else {
            visibleResources.forEach(([type, amt]) => {
                ctx.fillStyle = '#aef';
                ctx.font = '11px sans-serif';
                ctx.fillText(`${type}: ${amt}`, this.x + this.padding + 5, currentY);
                currentY += 15;
            });
        }

        // --- 6. DRAW CRAFTING ---
        currentY += 10;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Crafting:', this.x + this.padding, currentY);
        currentY += 16;
        
        if (recipes.length === 0) {
            ctx.fillStyle = '#888';
            ctx.font = '11px sans-serif';
            ctx.fillText('(no recipes)', this.x + this.padding + 5, currentY);
            currentY += 16;
        } else {
            recipes.slice(0, this.recipesToShow).forEach(r => {
                ctx.fillStyle = '#aef';
                ctx.font = this.craftingFont;
                ctx.fillText(r.name || '?', this.x + this.padding + 5, currentY);
                
                const craftable = Object.entries(r.ingredients || {}).every(([res, amt]) => (player.inventory?.[res] || 0) >= amt);
                ctx.save();
                ctx.textAlign = 'right';
                ctx.fillStyle = craftable ? this.craftBadgeColor : this.craftBadgeDisabled;
                ctx.fillText(craftable ? 'READY' : '---', this.x + this.w - this.padding, currentY);
                ctx.restore();
                currentY += 16;
            });
        }

        // --- 7. DRAW GEAR ---
        currentY += 10;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Gear:', this.x + this.padding, currentY);
        currentY += 16;
        if (gear.length === 0) {
            ctx.fillStyle = '#888';
            ctx.fillText('(no gear)', this.x + this.padding + 5, currentY);
            currentY += 16;
        } else {
            gear.slice(0, 3).forEach(g => {
                ctx.fillStyle = '#aef';
                ctx.fillText(`${g.name} Lv.${g.level || 0}`, this.x + this.padding + 5, currentY);
                currentY += 18;
            });
        }

        // --- 8. DRAW HOTBAR ---
        currentY += 10;
        const slotSize = 28;
        const slotPadding = 6;
        for (let i = 0; i < (player.hotbar?.length || 5); i++) {
            const sx = this.x + this.padding + i * (slotSize + slotPadding);
            ctx.fillStyle = (player.selectedHotbarIndex === i) ? '#666' : '#333';
            roundRect(ctx, sx, currentY, slotSize, slotSize, 4, true, false);
            
            const slot = player.hotbar?.[i];
            if (slot) {
                ctx.save();
                ctx.fillStyle = '#fff';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(slot.type.substring(0, 3), sx + slotSize/2, currentY + slotSize/2);
                ctx.restore();
            }
        }

        ctx.restore();
    }
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
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
