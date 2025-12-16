export class InputHandler {
    constructor() {
        this.direction = { x: 0, y: 0 };
        this.lastDirection = { x: 0, y: 0 };
        this.touchStartX = 0;
        this.touchStartY = 0;

        // Tune swipe sensitivity
        this.swipeThreshold = 30; // Min pixels to count as swipe

        window.addEventListener('keydown', (e) => this.handleKey(e));
        window.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    }

    reset() {
        this.direction = { x: 0, y: 0 };
        this.lastDirection = { x: 0, y: 0 };
    }

    handleKey(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.lastDirection.y !== 0) break;
                this.direction = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.lastDirection.y !== 0) break;
                this.direction = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.lastDirection.x !== 0) break;
                this.direction = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.lastDirection.x !== 0) break;
                this.direction = { x: 1, y: 0 };
                break;
        }
    }

    handleTouchStart(e) {
        // Prevent default to stop scrolling/zooming
        // e.preventDefault(); 
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        if (!this.touchStartX || !this.touchStartY) return;

        let touchEndX = e.touches[0].clientX;
        let touchEndY = e.touches[0].clientY;

        let diffX = touchEndX - this.touchStartX;
        let diffY = touchEndY - this.touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (Math.abs(diffX) > this.swipeThreshold) {
                let success = false;
                if (diffX > 0) {
                    if (this.lastDirection.x === 0) { this.direction = { x: 1, y: 0 }; success = true; }
                } else {
                    if (this.lastDirection.x === 0) { this.direction = { x: -1, y: 0 }; success = true; }
                }

                if (success) {
                    if (navigator.vibrate) navigator.vibrate(10); // Light haptic on turn
                    this.touchStartX = touchEndX; // Reset to prevent rapid firing
                    this.touchStartY = touchEndY;
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(diffY) > this.swipeThreshold) {
                let success = false;
                if (diffY > 0) {
                    if (this.lastDirection.y === 0) { this.direction = { x: 0, y: 1 }; success = true; }
                } else {
                    if (this.lastDirection.y === 0) { this.direction = { x: 0, y: -1 }; success = true; }
                }

                if (success) {
                    if (navigator.vibrate) navigator.vibrate(10); // Light haptic on turn
                    this.touchStartX = touchEndX;
                    this.touchStartY = touchEndY;
                }
            }
        }

        e.preventDefault(); // Prevent scrolling
    }

    getDirection() {
        this.lastDirection = this.direction;
        return this.direction;
    }
}
