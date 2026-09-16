import { ViolationRecord, ViolationType } from '../types';

export class AntiCheatSoundAlert {
  private static audioCtx: AudioContext | null = null;

  public static playWarningBeep(isCritical: boolean = false) {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = isCritical ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isCritical ? 880 : 587.33, this.audioCtx.currentTime); // A5 or D5
      if (isCritical) {
        osc.frequency.setValueAtTime(440, this.audioCtx.currentTime + 0.15);
      }

      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + (isCritical ? 0.35 : 0.2));

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + (isCritical ? 0.35 : 0.2));
    } catch {
      // Audio autoplay might be restricted without user interaction
    }
  }
}

export function requestBrowserFullscreen(): Promise<void> {
  const elem = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  };

  if (elem.requestFullscreen) {
    return elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    return elem.webkitRequestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    return elem.mozRequestFullScreen();
  } else if (elem.msRequestFullscreen) {
    return elem.msRequestFullscreen();
  }
  return Promise.resolve();
}

export function exitBrowserFullscreen(): Promise<void> {
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
  };

  if (document.exitFullscreen) {
    return document.exitFullscreen();
  } else if (doc.webkitExitFullscreen) {
    return doc.webkitExitFullscreen();
  } else if (doc.mozCancelFullScreen) {
    return doc.mozCancelFullScreen();
  } else if (doc.msExitFullscreen) {
    return doc.msExitFullscreen();
  }
  return Promise.resolve();
}

export function isCurrentlyFullscreen(): boolean {
  const doc = document as Document & {
    webkitFullscreenElement?: Element;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
  };
  return !!(
    document.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
}

export function createViolationRecord(type: ViolationType, description: string, severity: 'warning' | 'danger' | 'critical' = 'warning'): ViolationRecord {
  const now = new Date();
  const timeString = now.toLocaleTimeString('id-ID', { hour12: false });
  return {
    id: `viol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: timeString,
    type,
    description,
    severity
  };
}
