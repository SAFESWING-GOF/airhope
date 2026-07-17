// Web Audio API Synthesizer for Discord-like Sound Effects
// Handled gracefully if blocked by browser permissions or if AudioContext is unavailable

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type: 'join' | 'leave' | 'message' | 'toggle') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'join') {
      // Ascending bleeps: G4 (392Hz) -> C5 (523Hz)
      const osc1 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(392, now);
      osc1.frequency.setValueAtTime(523, now + 0.08);
      
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc1.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);
    } else if (type === 'leave') {
      // Descending bleeps: C5 (523Hz) -> G4 (392Hz)
      const osc1 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523, now);
      osc1.frequency.setValueAtTime(392, now + 0.08);
      
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc1.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);
    } else if (type === 'message') {
      // High-pitched message chime: Bb5 (932Hz)
      const osc1 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(932, now);
      
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc1.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);
    } else if (type === 'toggle') {
      // Toggle sound: short neutral click
      const osc1 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(600, now);
      
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      osc1.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.05);
    }
  } catch (error) {
    // Fail-safe for browser autoplay blocks
    console.debug('Audio cue blocked or unsupported:', error);
  }
}
