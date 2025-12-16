import '../style.css';
import { Game } from './game/Game.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (canvas) {
    const game = new Game(canvas);
    // Optional: Auto resize once to be sure
    game.resize();
  }
});
