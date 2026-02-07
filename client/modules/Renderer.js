export default class Renderer {
    constructor(canvas, ctx, player, worldRenderer, mapEditor = null) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.player = player;
        this.worldRenderer = worldRenderer;
        this.mapEditor = mapEditor;
    }

    render(state) {
        const { players, enemies = [], resources = [] } = state;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.worldRenderer.draw(ctx, state.world, this.player);

        // Use player position directly
        const px = this.player?.x || 0;
        const py = this.player?.y || 0;

        // players
        for (const id in players) {
            const p = players[id];
            //   console.log(`Player: ${p.id}`)
            // console.log(`Players`, players)
            const sx = p.x - px + this.canvas.width / 2;
            const sy = p.y - py + this.canvas.height / 2;
            ctx.fillStyle = id === state.socketId || id === this.player.id ? 'blue' : 'red';
            ctx.fillRect(sx, sy, this.player.size, this.player.size);
            if(p.hp < p.hpMax)
                this.drawHealth(ctx, sx, sy, p.hp);
        }

        // Draw player direction line (from center of player square)
        const playerScreenX = this.canvas.width / 2;
        const playerScreenY = this.canvas.height / 2;
        this.drawDirectionLine(ctx, playerScreenX, playerScreenY, this.player.facingDirection);

        // enemies
        for (const enemy of enemies) {
            const sx = enemy.x - px + this.canvas.width / 2;
            const sy = enemy.y - py + this.canvas.height / 2;
            // ctx.fillStyle = 'grey';
            ctx.fillStyle = enemy.color;
            ctx.fillRect(sx, sy, enemy.size, enemy.size );
            if(enemy.hp < enemy.hpMax)
                this.drawHealth(ctx, sx, sy, enemy.hp);
        }
        

        // First pass: Calculate screen positions for all resources
        const resourceScreenPositions = resources
            .filter(r => {
                const sx = r.x - px + this.canvas.width / 2;
                const sy = r.y - py + this.canvas.height / 2;
                // Check if on-screen
                return !(sx < -20 || sx > this.canvas.width + 20 || sy < -20 || sy > this.canvas.height + 20);
            })
            .map(r => ({
                resource: r,
                baseX: r.x - this.player.x + this.canvas.width / 2,
                baseY: r.y - this.player.y + this.canvas.height / 2,
                offsetX: 0,
                offsetY: 0
            }));

        // Second pass: Apply offsets to overlapping resources (iterative)
        const MIN_DISTANCE = 35; // Minimum pixel distance between resources
        const SEPARATION_ITERATIONS = 5; // Multiple passes for better separation
        
        for (let iteration = 0; iteration < SEPARATION_ITERATIONS; iteration++) {
            for (let i = 0; i < resourceScreenPositions.length; i++) {
                for (let j = i + 1; j < resourceScreenPositions.length; j++) {
                    const r1 = resourceScreenPositions[i];
                    const r2 = resourceScreenPositions[j];
                    
                    // Calculate distance between resources (including offsets)
                    const dx = (r2.baseX + r2.offsetX) - (r1.baseX + r1.offsetX);
                    const dy = (r2.baseY + r2.offsetY) - (r1.baseY + r1.offsetY);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // If too close, push them apart more aggressively
                    if (distance < MIN_DISTANCE && distance > 0.1) {
                        const angle = Math.atan2(dy, dx);
                        const pushDistance = (MIN_DISTANCE - distance) / 2 + 2; // Extra push for better separation
                        
                        r1.offsetX -= Math.cos(angle) * pushDistance;
                        r1.offsetY -= Math.sin(angle) * pushDistance;
                        r2.offsetX += Math.cos(angle) * pushDistance;
                        r2.offsetY += Math.sin(angle) * pushDistance;
                    }
                }
            }
        }

        // Third pass: Draw all resources with offsets
        for (const { resource: r, baseX, baseY, offsetX, offsetY } of resourceScreenPositions) {
            const sx = baseX + offsetX;
            const sy = baseY + offsetY;

            // Draw resource with icon color
            const color = r.icon_color || '#00AA00';
            ctx.fillStyle = color;
            ctx.fillRect(sx - 5, sy - 5, 10, 10);
            
            // Draw resource type label (small text above resource)
            ctx.fillStyle = color;
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(r.type || 'resource', sx, sy - 12);
            
            // Draw HP indicator if damaged
            if (r.hp !== undefined && r.hpMax !== undefined && r.hp < r.hpMax) {
                const hpPercent = r.hp / r.hpMax;
                ctx.fillStyle = hpPercent > 0.5 ? '#00AA00' : hpPercent > 0.25 ? '#FFAA00' : '#AA0000';
                ctx.fillRect(sx - 4, sy - 10, 8 * hpPercent, 2);
                ctx.strokeStyle = '#333333';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(sx - 4, sy - 10, 8, 2);
            }
        }

        // Draw Effects
        this.player.activeEffects.forEach((effect, index) => {
            // 1. Calculate Screen Position
            // Subtract the world camera offset so the circle "sticks" to the ground
            const screenX = effect.x - (this.player.x - this.canvas.width / 2);
            const screenY = effect.y - (this.player.y - this.canvas.height / 2);

            // 2. Draw using the NEW screen coordinates
            this.ctx.beginPath();
            const radius = (1.2 - effect.life) * 50; // Expands as it fades
            this.ctx.arc(screenX, screenY, 20, 0, Math.PI * 2);
            
            // this.ctx.arc(effect.x, effect.y, 20, 0, Math.PI * 2);


            this.ctx.strokeStyle = effect.type === 'combat' 
                ? `rgba(255, 0, 0, ${effect.life})` 
                : `rgba(0, 255, 0, ${effect.life})`;
            
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // 3. Update & Cleanup
            effect.life -= effect.decay || 0.05;
            if (effect.life <= 0) this.player.activeEffects.splice(index, 1);
            
            this.ctx.fillStyle = effect.type === 'combat' ? `rgba(255,0,0,${effect.life})` : `rgba(0,255,0,${effect.life})`; // Choose a color that stands out
            this.ctx.font = "22px Arial"; // Set size and font
            this.ctx.textAlign = "left";  // Align text to the start of your coordinates
            // Use fillText(text, x, y) to place it next to the bar
            // (x + 30) moves it just past the end of a full 100% bar
            this.ctx.fillText('combat', effect.x,effect.y); 

            // Remove dead effects
            if (effect.life <= 0) this.player.activeEffects.splice(index, 1);
        });

        // Draw editor grid if active
        if (this.mapEditor && this.mapEditor.isActive) {
          this.mapEditor.drawGrid(ctx, this.player);
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
    drawDirectionLine(ctx, centerX, centerY, direction) {
        if (!direction) return;
        const length = 30; // Length of the direction line
        const endX = centerX + direction.x * length;
        const endY = centerY + direction.y * length;
        
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw arrowhead
        const arrowSize = 8;
        const angle = Math.atan2(direction.y, direction.x);
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - arrowSize * Math.cos(angle - Math.PI / 6), endY - arrowSize * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - arrowSize * Math.cos(angle + Math.PI / 6), endY - arrowSize * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    }
}