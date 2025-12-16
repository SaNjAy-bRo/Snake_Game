import { Food } from './Food.js';

export class BonusFruit extends Food {
    constructor(gridSize) {
        super(gridSize);
        this.active = false;
        this.spawnTime = 0;
        this.lifespan = 5000; // 5 seconds
        this.blinkState = false;
    }

    // Override spawn to control active state
    attemptSpawn(snakeBody, columns, rows, currentScore, offset = 0) {
        // Only spawn if not active and random chance
        // Example: 1% chance per frame if score > 50? Too frequent?
        // Better: Controller by Game loop triggers.

        // We'll trust the caller to decide WHEN to attempt spawn, we just handle the PLACEMENT.
        this.spawn(snakeBody, columns, rows, offset);
        this.active = true;
        this.spawnTime = performance.now();
    }

    update(currTime) {
        if (!this.active) return;

        // Blink effect before disappearing
        const aliveTime = currTime - this.spawnTime;
        if (aliveTime > this.lifespan) {
            this.active = false;
        } else if (aliveTime > this.lifespan - 2000) {
            // Blink last 2 seconds
            this.blinkState = Math.floor(aliveTime / 200) % 2 === 0;
        } else {
            this.blinkState = true; // Visible
        }
    }

    draw(ctx, gridSize) {
        if (!this.active) return;
        if (!this.blinkState && (performance.now() - this.spawnTime > this.lifespan - 2000)) return; // Blink off

        const x = this.position.x * gridSize;
        const y = this.position.y * gridSize;
        const center = gridSize / 2;

        // Glowing Golden Apple / Cherry
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f1c40f';

        // Body (Gold)
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(x + center, y + center + 2, gridSize / 2 - 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + center - 3, y + center - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Stem
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + center - 1, y, 2, 4);

        // Big Leaf
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.moveTo(x + center, y);
        ctx.quadraticCurveTo(x + center + 8, y - 6, x + center + 10, y + 2);
        ctx.quadraticCurveTo(x + center + 2, y + 2, x + center, y);
        ctx.fill();
    }
}
