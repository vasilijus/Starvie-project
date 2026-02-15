import { drawEnemy } from './drawers/enemyDrawer.js';
import { drawResource } from './drawers/resourceDrawer.js';

export default class Renderer {
    constructor(canvas, ctx, player, worldRenderer, mapEditor = null) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.player = player;
        this.worldRenderer = worldRenderer;
        this.mapEditor = mapEditor;
    }

    render(state) {
        // const { players, enemies = [], resources = [] } = state;
        const { players, enemies = [], resources = [], enemyDrops = [] } = state;
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
            const playerThis = 'rgba(200,150,100,0.9)'
            const playerOther = 'rgba(139, 28, 28, 0.9)'
            ctx.fillStyle = id === state.socketId || id === this.player.id ? playerThis : playerOther;
            // ctx.strokeStyle = '#0a5800';
            // ctx.lineWidth = 1;
            // ctx.stroke();
            
            // For local player use client-side state (includes attack animation)
            if (id === this.player.id) {
                const cp = this.player;
                const dir = cp.facingDirection || { x: 0, y: -1 };
                // Debug attack state per frame for troubleshooting
                // (comment out when no longer needed)
                // eslint-disable-next-line no-console
                // console.log(`[Renderer] local attack: isAttacking=${cp.isAttacking} progress=${cp.attackProgress.toFixed(2)}`);
                this.drawRotatedPlayer(ctx, sx, sy, cp.size, dir, cp);
            } else {
                // remote player: draw based on server state
                if (p.facingDirection && (p.facingDirection.x !== 0 || p.facingDirection.y !== 0)) {
                    this.drawRotatedPlayer(ctx, sx, sy, this.player.size, p.facingDirection, null);
                } else {
                    // ctx.fillRect(sx, sy, this.player.size, this.player.size);
                    ctx.roundRect(10, 150, 150, 100, [10, 10]);
                }
            }

            if (p.hp < p.hpMax)
                this.drawHealth(ctx, sx, sy, p.hp);
        }

        // Draw player direction line (from center of player square)
        const playerScreenX = this.canvas.width / 2;
        const playerScreenY = this.canvas.height / 2;
        // console.log(`[Renderer] Arrow direction: (${this.player.facingDirection.x.toFixed(2)}, ${this.player.facingDirection.y.toFixed(2)})`);
        // Testing debug
        this.drawDirectionLine(ctx, playerScreenX + this.player.size/2, playerScreenY +this.player.size/2, this.player.facingDirection);

        // enemies
        for (const enemy of enemies) {
            const sx = enemy.x - px + this.canvas.width / 2;
            const sy = enemy.y - py + this.canvas.height / 2;
            drawEnemy(ctx, enemy, sx, sy);
            if (enemy.hp < enemy.hpMax)
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
                //  baseY: r.y - this.player.y + this.canvas.height / 2
                offsetX: 0,
                offsetY: 0,
                canApplyVisualOffset: !r.isSolid

            }));

        // Second pass: Apply offsets to overlapping resources.
        // Keep this bounded so it cannot dominate frame time in crowded scenes.
        const MIN_DISTANCE = 35;
        const resourceCount = resourceScreenPositions.length;
        const SEPARATION_ITERATIONS = resourceCount > 120 ? 1 : resourceCount > 60 ? 2 : 3;

        if (resourceCount > 1 && SEPARATION_ITERATIONS > 0) {
            const cellSize = MIN_DISTANCE;

            for (let iteration = 0; iteration < SEPARATION_ITERATIONS; iteration++) {
                const grid = new Map();

                for (let i = 0; i < resourceCount; i++) {
                    const r = resourceScreenPositions[i];
                    if (!r.canApplyVisualOffset) continue;

                    const x = r.baseX + r.offsetX;
                    const y = r.baseY + r.offsetY;
                    const gx = Math.floor(x / cellSize);
                    const gy = Math.floor(y / cellSize);
                    const key = `${gx},${gy}`;

                    if (!grid.has(key)) grid.set(key, []);
                    grid.get(key).push(i);
                }

                for (let i = 0; i < resourceCount; i++) {
                    const r1 = resourceScreenPositions[i];
                    if (!r1.canApplyVisualOffset) continue;

                    const x1 = r1.baseX + r1.offsetX;
                    const y1 = r1.baseY + r1.offsetY;
                    const gx = Math.floor(x1 / cellSize);
                    const gy = Math.floor(y1 / cellSize);

                    for (let ny = gy - 1; ny <= gy + 1; ny++) {
                        for (let nx = gx - 1; nx <= gx + 1; nx++) {
                            const bucket = grid.get(`${nx},${ny}`);
                            if (!bucket) continue;

                            for (const j of bucket) {
                                if (j <= i) continue;
                                const r2 = resourceScreenPositions[j];
                                if (!r2.canApplyVisualOffset) continue;

                                const dx = (r2.baseX + r2.offsetX) - (r1.baseX + r1.offsetX);
                                const dy = (r2.baseY + r2.offsetY) - (r1.baseY + r1.offsetY);
                                const distance = Math.sqrt(dx * dx + dy * dy);

                                if (distance < MIN_DISTANCE && distance > 0.1) {
                                    const angle = Math.atan2(dy, dx);
                                    const pushDistance = (MIN_DISTANCE - distance) / 2 + 1;

                                    r1.offsetX -= Math.cos(angle) * pushDistance;
                                    r1.offsetY -= Math.sin(angle) * pushDistance;
                                    r2.offsetX += Math.cos(angle) * pushDistance;
                                    r2.offsetY += Math.sin(angle) * pushDistance;
                                }
                            }
                        }
                    }
                }
            }
        }

        // Third pass: Draw all resources with offsets
        for (const { resource: r, baseX, baseY, offsetX, offsetY } of resourceScreenPositions) {
            const sx = baseX + offsetX;
            const sy = baseY + offsetY;

            const { color, renderRadius } = drawResource(ctx, r, sx, sy);

            // Draw resource type label (small text above resource)
            ctx.fillStyle = color;
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(r.type || 'resource', sx, sy - (renderRadius + 6));

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
            this.ctx.fillText('combat', effect.x, effect.y);

            // Remove dead effects
            if (effect.life <= 0) this.player.activeEffects.splice(index, 1);
        });

        // Draw editor grid if active
        if (this.mapEditor && this.mapEditor.isActive) {
            this.mapEditor.drawGrid(ctx, this.player);
        }

        // Draw enemy drops (temporary loot)
        const dropScreenPositions = enemyDrops
            .filter(d => {
                const sx = d.x - px + this.canvas.width / 2;
                const sy = d.y - py + this.canvas.height / 2;
                return !(sx < -20 || sx > this.canvas.width + 20 || sy < -20 || sy > this.canvas.height + 20);
            })
            .map(d => ({
                drop: d,
                baseX: d.x - this.player.x + this.canvas.width / 2,
                baseY: d.y - this.player.y + this.canvas.height / 2
            }));

        for (const { drop: d, baseX, baseY } of dropScreenPositions) {
            const sx = baseX;
            const sy = baseY;

            // Draw drop with distinctive icon color
            const color = d.icon_color || '#FFD700';
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(sx, sy, 6, 0, Math.PI * 2);
            ctx.fill();

            // Draw drop type label
            ctx.fillStyle = color;
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(d.type, sx, sy - 10);

            // Show quantity if > 1
            if (d.quantity > 1) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 9px Arial';
                ctx.fillText(`x${d.quantity}`, sx + 8, sy + 8);
            }
        }
    }


    drawHealth(ctx, x, y, hp = 100) {
        // 1. Logic for Bar Color (Fixed Order)
        let barColor = "#147800";
        // Check from lowest to highest
        if (hp < 20) barColor = "#e10707";
        else if (hp < 50) barColor = "#ff7b00";
        else if (hp < 80) barColor = "#d1bf00";
        // 2. Draw the Health Bar
        ctx.fillStyle = barColor;
        ctx.fillRect(x - 5, y - 20, (hp / 100) * 30, 5);
        // 3. Draw the HP Number
        ctx.fillStyle = "black"; // Choose a color that stands out
        ctx.font = "9px Arial"; // Set size and font
        ctx.textAlign = "left";  // Align text to the start of your coordinates
        // Use fillText(text, x, y) to place it next to the bar
        // (x + 30) moves it just past the end of a full 100% bar
        ctx.fillText(Math.floor(hp), x + 2, y - 25);
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


    /**
     * Draws a rotated player with rounded corners and animated hands.
     */
    drawRotatedPlayer(ctx, x, y, size, direction, clientState = null) {
        const angle = Math.atan2(direction.y, direction.x);
        const center = { x: x + size / 2, y: y + size / 2 };
        const radius = size * 0.2; // Corner roundness

        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.rotate(angle);

        this._drawPlayerBody(ctx, size, radius);
        this._drawDirectionIndicator(ctx, size);
        this._drawHands(ctx, size, clientState);

        ctx.restore();
    }

    /**
     * Draws the main player body as a rounded square.
     */
    _drawPlayerBody(ctx, size, radius) {
        const half = size / 2;

        ctx.beginPath();
        // Using roundRect is the modern standard for rounded corners
        // Supported in all major browsers (Chrome 99+, Firefox 102+, Safari 15.4+)
        if (ctx.roundRect) {
            ctx.roundRect(-half, -half, size, size, radius);
        } else {
            // Fallback for older environments
            this._manualRoundRect(ctx, -half, -half, size, size, radius);
        }
        ctx.fill();
    }

    /**
     * Draws a small triangle pointing in the direction the player is facing.
     */
    _drawDirectionIndicator(ctx, size) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(size / 2, 0);
        ctx.lineTo(size / 3, -size / 3);
        ctx.lineTo(size / 3, size / 3);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Handles the logic for positioning and drawing hands.
     */
    _drawHands(ctx, size, clientState) {
        const handRadius = Math.max(3, Math.floor(size * 0.2));
        const armDistance = size * 1.2;
        const halfArm = armDistance / 2;

        ctx.fillStyle = 'rgba(200,150,100,0.9)';

        // Left hand (Fixed)
        ctx.beginPath();
        ctx.arc(0, -halfArm, handRadius, 0, Math.PI * 2);
        ctx.fill();

        // Right hand (Animated for attacking)
        let pushForward = 0;
        if (clientState?.isAttacking) {
            const t = Math.min(1, Math.max(0, clientState.attackProgress));
            const easeOutQuad = 1 - (1 - t) * (1 - t);
            pushForward = easeOutQuad * (armDistance * 0.6);
        }

        ctx.beginPath();
        ctx.arc(pushForward, halfArm, handRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Fallback for environments where ctx.roundRect is not available.
     */
    _manualRoundRect(ctx, x, y, width, height, radius) {
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }

}
