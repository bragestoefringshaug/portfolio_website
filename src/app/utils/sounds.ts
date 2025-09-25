// Sound effects utility
export class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  public playClick() {
    this.playTone(800, 0.1, 'square');
  }

  public playHover() {
    this.playTone(600, 0.05, 'sine');
  }

  public playSuccess() {
    this.playTone(523, 0.1, 'sine');
    setTimeout(() => this.playTone(659, 0.1, 'sine'), 100);
    setTimeout(() => this.playTone(784, 0.2, 'sine'), 200);
  }

  public playError() {
    this.playTone(200, 0.3, 'sawtooth');
  }

  public playWindowOpen() {
    this.playTone(400, 0.2, 'sine');
    setTimeout(() => this.playTone(500, 0.2, 'sine'), 100);
  }

  public playWindowClose() {
    this.playTone(500, 0.1, 'sine');
    setTimeout(() => this.playTone(400, 0.2, 'sine'), 50);
  }

  public playNotification() {
    this.playTone(1000, 0.1, 'sine');
    setTimeout(() => this.playTone(1200, 0.1, 'sine'), 150);
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();
