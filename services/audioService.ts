
// A simple Web Audio API wrapper to generate retro sounds and music
// without needing external assets.

class AudioService {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private musicGain: GainNode | null = null;
    private sfxGain: GainNode | null = null;
    private isPlayingMusic: boolean = false;
    private nextNoteTime: number = 0;
    private timerID: number | null = null;
    
    // Music State
    private currentNote: number = 0;
    private melody = [
        { note: 440, dur: 0.2 }, { note: 0, dur: 0.2 }, { note: 440, dur: 0.2 }, { note: 523, dur: 0.4 },
        { note: 440, dur: 0.2 }, { note: 0, dur: 0.2 }, { note: 392, dur: 0.4 }, { note: 0, dur: 0.1 },
        { note: 659, dur: 0.2 }, { note: 587, dur: 0.2 }, { note: 523, dur: 0.2 }, { note: 493, dur: 0.2 }
    ];

    constructor() {
        // Init lazy
    }

    private init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.musicGain = this.ctx.createGain();
            this.sfxGain = this.ctx.createGain();

            this.masterGain.connect(this.ctx.destination);
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);

            // Defaults
            this.musicGain.gain.value = 0.1; // Low volume for BGM
            this.sfxGain.gain.value = 0.3;
        }
    }

    setVolumes(musicVol: number, sfxVol: number, musicMuted: boolean, sfxMuted: boolean) {
        this.init();
        if (this.musicGain) this.musicGain.gain.setValueAtTime(musicMuted ? 0 : musicVol * 0.15, this.ctx!.currentTime);
        if (this.sfxGain) this.sfxGain.gain.setValueAtTime(sfxMuted ? 0 : sfxVol, this.ctx!.currentTime);
        
        // Only force stop if muted. Do NOT auto-start here.
        if (musicMuted && this.isPlayingMusic) {
            this.stopMusic();
        } 
    }

    startMusic() {
        this.init();
        if (this.isPlayingMusic) return;
        this.isPlayingMusic = true;
        this.nextNoteTime = this.ctx!.currentTime;
        this.scheduler();
    }

    stopMusic() {
        this.isPlayingMusic = false;
        if (this.timerID !== null) {
            window.clearTimeout(this.timerID);
            this.timerID = null;
        }
    }

    private scheduler() {
        if (!this.isPlayingMusic || !this.ctx) return;
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.playNote();
        }
        this.timerID = window.setTimeout(() => this.scheduler(), 25);
    }

    private playNote() {
        if (!this.ctx || !this.musicGain) return;
        
        const beat = this.melody[this.currentNote % this.melody.length];
        
        if (beat.note > 0) {
            const osc = this.ctx.createOscillator();
            osc.connect(this.musicGain);
            osc.type = 'square';
            osc.frequency.value = beat.note;
            
            // Retro envelope
            osc.start(this.nextNoteTime);
            osc.stop(this.nextNoteTime + beat.dur - 0.05);
        }

        this.nextNoteTime += beat.dur;
        this.currentNote++;
    }

    playSfx(type: 'button' | 'coin' | 'error' | 'success' | 'collect' | 'hurt' | 'miss' | 'gameover') {
        this.init();
        if (!this.ctx || !this.sfxGain) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);

        const now = this.ctx.currentTime;

        if (type === 'button') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'coin') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.setValueAtTime(1600, now + 0.1);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.3);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(1000, now + 0.2);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === 'collect') {
             // High pitch chirp
             osc.type = 'sine';
             osc.frequency.setValueAtTime(1200, now);
             osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
             gain.gain.setValueAtTime(0.3, now);
             gain.gain.linearRampToValueAtTime(0, now + 0.1);
             osc.start(now);
             osc.stop(now + 0.1);
        } else if (type === 'hurt') {
             // Low buzz
             osc.type = 'sawtooth';
             osc.frequency.setValueAtTime(150, now);
             osc.frequency.linearRampToValueAtTime(50, now + 0.2);
             gain.gain.setValueAtTime(0.5, now);
             gain.gain.linearRampToValueAtTime(0, now + 0.2);
             osc.start(now);
             osc.stop(now + 0.2);
        } else if (type === 'miss') {
             // Descending 'bloop'
             osc.type = 'triangle';
             osc.frequency.setValueAtTime(300, now);
             osc.frequency.linearRampToValueAtTime(100, now + 0.15);
             gain.gain.setValueAtTime(0.3, now);
             gain.gain.linearRampToValueAtTime(0, now + 0.15);
             osc.start(now);
             osc.stop(now + 0.15);
        } else if (type === 'gameover') {
             // Sad slide
             osc.type = 'triangle';
             osc.frequency.setValueAtTime(400, now);
             osc.frequency.linearRampToValueAtTime(100, now + 1.0);
             gain.gain.setValueAtTime(0.5, now);
             gain.gain.linearRampToValueAtTime(0, now + 1.0);
             osc.start(now);
             osc.stop(now + 1.0);
        }
    }
}

export const audioService = new AudioService();
