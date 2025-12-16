/**
 * SoundManager.js
 * Procedural audio generation using Web Audio API.
 * @author Sanjoker aka Sanjay
 */
export class SoundManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;

        // Haptics support
        this.hasHaptics = 'vibrate' in navigator;
    }

    init() {
        if (this.initialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.error('Web Audio API not supported', e);
        }
    }

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.initialized && this.ctx?.state === 'suspended') {
            this.ctx.resume();
        }
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playEat() {
        // High pitch "bloop"
        this.playTone(600, 'triangle', 0.1, 0.1);
        this.vibrate(10); // Light tap
    }

    playBonus() {
        // Arpeggio
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.playTone(800, 'square', 0.1, 0.1);
        setTimeout(() => this.playTone(1200, 'square', 0.1, 0.1), 100);
        setTimeout(() => this.playTone(1600, 'square', 0.2, 0.1), 200);
        this.vibrate([50, 50, 50]);
    }

    playCrash() {
        // Low saw wave slide
        if (!this.initialized && this.ctx?.state === 'suspended') {
            this.ctx.resume();
        }
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);

        this.vibrate(400); // Long crash
    }

    playTurn() {
        // Very subtle click for turning (optional, good for haptics)
        this.vibrate(5);
    }

    vibrate(pattern) {
        if (this.hasHaptics) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                // Ignore
            }
        }
    }
}
