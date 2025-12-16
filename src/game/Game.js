/**
 * Game.js
 * Main game loop and logic controller.
 * @author Sanjoker aka Sanjay
 */
import { Snake } from './Snake.js';
import { Food } from './Food.js';
import { BonusFruit } from './BonusFruit.js';
import { InputHandler } from './InputHandler.js';
import { SoundManager } from './SoundManager.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.gridSize = 20;
        this.tileCountX = 0;
        this.tileCountY = 0;

        this.snake = new Snake(this.gridSize);
        this.food = new Food(this.gridSize);
        this.bonusFruit = new BonusFruit(this.gridSize);
        this.soundManager = new SoundManager();
        this.input = new InputHandler();

        this.score = 0;
        this.highScore = localStorage.getItem('snake_highscore') || 0;

        this.lastTime = 0;
        this.acumulator = 0;
        this.stepTime = 1000 / 12;

        this.gameState = 'MENU';

        this.ui = {
            score: document.getElementById('score'),
            highScore: document.getElementById('high-score'),
            startScreen: document.getElementById('start-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            finalScore: document.getElementById('final-score'),
            startBtn: document.getElementById('start-btn'),
            restartBtn: document.getElementById('restart-btn')
        };

        this.ui.startBtn.addEventListener('click', () => this.start());
        this.ui.restartBtn.addEventListener('click', () => this.start());
        this.ui.highScore.innerText = this.highScore.toString().padStart(4, '0');

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        this.tileCountX = Math.floor(this.canvas.width / this.gridSize);
        this.tileCountY = Math.floor(this.canvas.height / this.gridSize);
    }

    start() {
        // Audio Context must start on user interaction
        if (!this.soundManager.initialized) {
            this.soundManager.init();
        }

        this.gameState = 'PLAYING';
        this.snake = new Snake(this.gridSize);
        this.food = new Food(this.gridSize);
        this.bonusFruit = new BonusFruit(this.gridSize);

        this.score = 0;
        this.updateScore();
        this.input.reset();

        // Spawn inside walls (range: 1 to tileCount-2)
        this.food.spawn(this.snake.body, this.tileCountX - 2, this.tileCountY - 2, 1);

        this.ui.startScreen.classList.add('hidden');
        this.ui.gameOverScreen.classList.add('hidden');

        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    gameOver() {
        this.gameState = 'GAMEOVER';
        this.ui.gameOverScreen.classList.remove('hidden');
        this.ui.finalScore.innerText = this.score;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snake_highscore', this.highScore);
            this.ui.highScore.innerText = this.highScore.toString().padStart(4, '0');
        }
    }

    updateScore() {
        this.ui.score.innerText = this.score.toString().padStart(4, '0');
    }

    loop(timestamp) {
        if (this.gameState !== 'PLAYING') return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.acumulator += deltaTime;

        while (this.acumulator > this.stepTime) {
            this.update(timestamp); // Pass timestamp to update for bonus logic
            this.acumulator -= this.stepTime;
        }

        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }

    update(timestamp) {
        const dir = this.input.getDirection();

        // Haptic feedback on turn
        if (dir.x !== this.snake.direction.x || dir.y !== this.snake.direction.y) {
            // this.soundManager.playTurn(); // Optional, avoiding spam
        }

        this.snake.setDirection(dir);

        this.snake.update();

        // Wall Collision: walls are at 0 and tileCount-1
        const head = this.snake.body[0];
        const hitWall = head.x < 1 || head.x >= this.tileCountX - 1 ||
            head.y < 1 || head.y >= this.tileCountY - 1;

        if (hitWall || this.snake.checkCollision(this.tileCountX, this.tileCountY)) { // checkCollision handles self-collision
            this.soundManager.playCrash();
            this.gameOver();
            return;
        }

        // Regular Food
        if (head.x === this.food.position.x && head.y === this.food.position.y) {
            this.snake.grow();
            this.soundManager.playEat();
            this.score += 10;
            this.updateScore();
            // Spawn inside walls
            this.food.spawn(this.snake.body, this.tileCountX - 2, this.tileCountY - 2, 1);

            // Chance to spawn bonus fruit if score > 50
            if (this.score >= 50 && !this.bonusFruit.active && Math.random() < 0.3) {
                this.bonusFruit.attemptSpawn(this.snake.body, this.tileCountX - 2, this.tileCountY - 2, this.score, 1);
            }
        }

        // Bonus Fruit
        this.bonusFruit.update(timestamp || performance.now());
        if (this.bonusFruit.active) {
            if (head.x === this.bonusFruit.position.x && head.y === this.bonusFruit.position.y) {
                this.snake.grow();
                this.soundManager.playBonus();
                this.score += 50; // Big bonus!
                this.updateScore();
                this.bonusFruit.active = false;
            }
        }
    }

    draw() {
        this.ctx.fillStyle = '#0d120d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawWalls();
        this.food.draw(this.ctx, this.gridSize);
        this.bonusFruit.draw(this.ctx, this.gridSize);
        this.snake.draw(this.ctx, this.gridSize);
    }

    drawWalls() {
        const size = this.gridSize;

        // Draw Top & Bottom
        for (let x = 0; x < this.tileCountX; x++) {
            this.drawWallBlock(x, 0);
            this.drawWallBlock(x, this.tileCountY - 1);
        }

        // Draw Left & Right (avoiding corners twice)
        for (let y = 1; y < this.tileCountY - 1; y++) {
            this.drawWallBlock(0, y);
            this.drawWallBlock(this.tileCountX - 1, y);
        }
    }

    drawWallBlock(x, y) {
        const size = this.gridSize;
        const px = x * size;
        const py = y * size;

        this.ctx.fillStyle = '#34495e'; // Dark Slate Base
        this.ctx.fillRect(px, py, size, size);

        // Brick pattern styling
        this.ctx.fillStyle = '#2c3e50'; // Darker mortar
        this.ctx.fillRect(px, py + size - 2, size, 2); // Bottom border
        this.ctx.fillRect(px + size - 2, py, 2, size); // Right border

        // Inner highlights for 3D effect
        this.ctx.fillStyle = '#5d6d7e';
        this.ctx.fillRect(px, py, size, 2); // Top highlight
        this.ctx.fillRect(px, py, 2, size); // Left highlight

        // Center detail
        this.ctx.fillStyle = '#283747';
        this.ctx.fillRect(px + 4, py + 4, size - 8, size - 8);
    }
}
