// Singleton AudioContext to bypass strict browser autoplay limits
let audioContext: AudioContext | null = null;
export let isMuted = false;

export const setMuted = (muted: boolean) => {
   isMuted = muted;
};

const getContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
};

// Extremely lightweight programmable oscillator synthesizer
const playTone = (frequency: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
    if (isMuted) return;
    try {
        const ctx = getContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        // Smooth fade out to prevent audio clicking pops
        gainNode.gain.setValueAtTime(vol, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
        console.warn("Audio failed to play", e);
    }
};

export const audioEngine = {
    // UI Clicks/Taps
    playPop: () => playTone(800, 'sine', 0.1, 0.05),
    
    // Answering
    playCorrect: () => {
        playTone(600, 'sine', 0.1, 0.1);
        setTimeout(() => playTone(800, 'sine', 0.15, 0.1), 100);
    },
    playBuzz: () => {
        playTone(150, 'sawtooth', 0.3, 0.1);
    },

    // Clock
    playTick: () => playTone(1200, 'square', 0.05, 0.02),
    playWarningTick: () => playTone(600, 'square', 0.1, 0.05),

    // Win
    playFanfare: () => {
        playTone(400, 'square', 0.2, 0.1);
        setTimeout(() => playTone(500, 'square', 0.2, 0.1), 200);
        setTimeout(() => playTone(600, 'square', 0.4, 0.1), 400);
    }
};
