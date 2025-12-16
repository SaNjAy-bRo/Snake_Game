export class Snake {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.body = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.newDirection = { x: 1, y: 0 };
        this.growthPending = 0;
    }

    setDirection(dir) {
        // Prevent 180 degree turns
        if (dir.x !== 0 && this.direction.x === 0) {
            this.newDirection = dir;
        } else if (dir.y !== 0 && this.direction.y === 0) {
            this.newDirection = dir;
        }
    }

    update() {
        this.direction = this.newDirection;

        // Calculate new head position
        const head = { ...this.body[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        // Add new head
        this.body.unshift(head);

        // Remove tail unless growing
        if (this.growthPending > 0) {
            this.growthPending--;
        } else {
            this.body.pop();
        }
    }

    grow() {
        this.growthPending++;
    }

    checkCollision(columns, rows) {
        const head = this.body[0];

        // Wall Collision
        if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows) {
            return true;
        }

        // Self Collision
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }

        return false;
    }

    draw(ctx, gridSize) {
        // Shadow for the whole snake
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#4aff4a';

        // Draw connectors and segments
        this.body.forEach((segment, index) => {
            const x = segment.x * gridSize;
            const y = segment.y * gridSize;
            const size = gridSize;
            const center = size / 2;

            // Determine radius (taper tail)
            let radius = (size / 2);
            if (index === this.body.length - 1) radius *= 0.6; // Tail tip
            else if (index > this.body.length - 4) radius *= 0.8; // Tapering

            const isHead = index === 0;

            ctx.fillStyle = isHead ? '#80ff80' : '#4aff4a';

            // Draw Connector to next segment
            if (index < this.body.length - 1) {
                const nextSeg = this.body[index + 1];
                const nextX = nextSeg.x * gridSize;
                const nextY = nextSeg.y * gridSize;

                // Draw a thick line/rect between centers
                ctx.beginPath();
                ctx.moveTo(x + center, y + center);
                ctx.lineTo(nextX + center, nextY + center);
                ctx.lineWidth = radius * 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#4aff4a';
                ctx.stroke();
                ctx.lineWidth = 1; // Reset
            }

            // Draw Segment Circle
            ctx.beginPath();
            ctx.arc(x + center, y + center, radius, 0, Math.PI * 2);
            ctx.fill();

            // Head Details
            if (isHead) {
                this.drawHeadDetails(ctx, x, y, size);
            }
        });

        ctx.shadowBlur = 0;
    }

    drawHeadDetails(ctx, x, y, size) {
        const center = size / 2;

        // Slight offset for eyes based on direction
        let eyeX = 0, eyeY = 0;
        if (this.direction.x === 1) eyeX = 4;
        if (this.direction.x === -1) eyeX = -4;
        if (this.direction.y === 1) eyeY = 4;
        if (this.direction.y === -1) eyeY = -4;

        // Eyes (White Sclera)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        // Left Eye relative to direction
        // Simple Top/Bottom layout for side movement, Left/Right for vertical
        let lx, ly, rx, ry;

        if (this.direction.x !== 0) { // Moving Horizontally
            lx = x + center + eyeX; ly = y + center - 4;
            rx = x + center + eyeX; ry = y + center + 4;
        } else { // Moving Vertically
            lx = x + center - 4; ly = y + center + eyeY;
            rx = x + center + 4; ry = y + center + eyeY;
        }

        const eyeSize = 3;
        ctx.arc(lx, ly, eyeSize, 0, Math.PI * 2);
        ctx.arc(rx, ry, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupils (Black)
        ctx.fillStyle = '#000';
        ctx.beginPath();
        const pd = 1; // pupil displacement
        ctx.arc(lx + (this.direction.x * pd), ly + (this.direction.y * pd), 1.5, 0, Math.PI * 2);
        ctx.arc(rx + (this.direction.x * pd), ry + (this.direction.y * pd), 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Tongue (Flicker)
        if (Math.floor(Date.now() / 100) % 3 === 0) {
            ctx.strokeStyle = '#ff4a4a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const tx = x + center + (this.direction.x * 8);
            const ty = y + center + (this.direction.y * 8);
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + (this.direction.x * 6), ty + (this.direction.y * 6));

            // Fork
            if (this.direction.x !== 0) {
                ctx.lineTo(tx + (this.direction.x * 8), ty - 3);
                ctx.moveTo(tx + (this.direction.x * 6), ty);
                ctx.lineTo(tx + (this.direction.x * 8), ty + 3);
            } else {
                ctx.lineTo(tx - 3, ty + (this.direction.y * 8));
                ctx.moveTo(tx, ty + (this.direction.y * 6));
                ctx.lineTo(tx + 3, ty + (this.direction.y * 8));
            }
            ctx.stroke();
            ctx.lineWidth = 1;
        }
    }
}
