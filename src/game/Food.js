export class Food {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.position = { x: 5, y: 5 }; // Initial default
    }

    spawn(snakeBody, columns, rows, offset = 0) {
        let valid = false;
        while (!valid) {
            const x = Math.floor(Math.random() * columns) + offset;
            const y = Math.floor(Math.random() * rows) + offset;

            // Check if on snake
            let onSnake = false;
            for (let segment of snakeBody) {
                if (segment.x === x && segment.y === y) {
                    onSnake = true;
                    break;
                }
            }

            if (!onSnake) {
                this.position = { x, y };
                valid = true;
            }
            // Fail-safe could be added if snake fills screen, but simple version for now
        }
    }

    draw(ctx, gridSize) {
        const x = this.position.x * gridSize;
        const y = this.position.y * gridSize;
        const size = gridSize;
        const center = size / 2;

        // Shadow/Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff4a4a';

        // Apple Body (Red Circle-ish)
        ctx.fillStyle = '#e74c3c'; // Nice Apple Red
        ctx.beginPath();
        // A slightly flattened circle looks more organic? Sticking to circle for clarity in limited pixels
        ctx.arc(x + center, y + center + 1, center - 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0; // Reset for details

        // Shine/Reflection (Top Left)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(x + center - 3, y + center - 3, 2, 0, Math.PI * 2);
        ctx.fill();

        // Stem (Brown)
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(x + center - 1, y + 2, 2, 4);

        // Leaf (Green)
        ctx.fillStyle = '#4cd137';
        ctx.beginPath();
        ctx.moveTo(x + center, y + 2);
        ctx.quadraticCurveTo(x + center + 6, y - 2, x + center + 6, y + 4);
        ctx.quadraticCurveTo(x + center + 2, y + 4, x + center, y + 2);
        ctx.fill();
    }
}
