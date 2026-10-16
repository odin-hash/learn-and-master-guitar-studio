// Web Audio Precision Metronome & Guitar Pitch Synthesis Engine (Lookahead Scheduler)
export class MetronomeAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.soundType = "woodblock"; // "woodblock", "beep", "drum"
    this.soundOnRest = "muted-thud"; // "muted-thud", "click", "silent"
    this.guitarToneEnabled = true; // Synthesizes actual guitar note/chord pitches!
    this.volume = 0.8;

    // Open string MIDI notes: 1=E4(64), 2=B3(59), 3=G3(55), 4=D3(50), 5=A2(45), 6=E2(40)
    this.openStringMidi = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };

    // Chord voicing lookup [string, fret] for realistic strum playback
    this.chordVoicings = {
      "C": [[5,3],[4,2],[3,0],[2,1],[1,0]],
      "C MAJOR": [[5,3],[4,2],[3,0],[2,1],[1,0]],
      "C7": [[5,3],[4,2],[3,3],[2,1],[1,0]],
      "CMAJ7": [[5,3],[4,2],[3,0],[2,0],[1,0]],
      "CADD9": [[5,3],[4,2],[3,0],[2,3],[1,0]],
      "CSUS": [[5,3],[4,3],[3,0],[2,1],[1,0]],
      "CM": [[5,3],[4,5],[3,5],[2,4],[1,3]],
      "C9": [[5,3],[4,2],[3,3],[2,3],[1,3]],
      "C BARRE": [[5,3],[4,5],[3,5],[2,5],[1,3]],
      "C7 BARRE": [[5,3],[4,5],[3,3],[2,5],[1,3]],
      "G": [[6,3],[5,2],[4,0],[3,0],[2,0],[1,3]],
      "G MAJOR": [[6,3],[5,2],[4,0],[3,0],[2,0],[1,3]],
      "G7": [[6,3],[5,2],[4,0],[3,0],[2,0],[1,1]],
      "GADD9": [[6,3],[5,0],[4,0],[3,2],[2,0],[1,3]],
      "GM": [[6,3],[5,5],[4,5],[3,3],[2,3],[1,3]],
      "G13": [[6,3],[4,3],[3,4],[2,5]],
      "G9": [[6,3],[5,2],[4,3],[3,2],[2,3]],
      "G BARRE": [[6,3],[5,5],[4,5],[3,4],[2,3],[1,3]],
      "D": [[4,0],[3,2],[2,3],[1,2]],
      "D MAJOR": [[4,0],[3,2],[2,3],[1,2]],
      "D7": [[4,0],[3,2],[2,1],[1,2]],
      "DM": [[4,0],[3,2],[2,3],[1,1]],
      "DM7": [[4,0],[3,2],[2,1],[1,1]],
      "DM9": [[5,5],[4,3],[3,5],[2,5]],
      "DM11": [[4,0],[3,0],[2,1],[1,1]],
      "DSUS": [[4,0],[3,2],[2,3],[1,3]],
      "D9": [[5,5],[4,4],[3,5],[2,5]],
      "D13": [[6,10],[4,10],[3,11],[2,12]],
      "D7#9": [[5,5],[4,4],[3,5],[2,6]],
      "D BARRE": [[5,5],[4,7],[3,7],[2,7],[1,5]],
      "A": [[5,0],[4,2],[3,2],[2,2],[1,0]],
      "A7": [[5,0],[4,2],[3,0],[2,2],[1,0]],
      "AM": [[5,0],[4,2],[3,2],[2,1],[1,0]],
      "AM7": [[5,0],[4,2],[3,0],[2,1],[1,0]],
      "AM9": [[5,0],[4,2],[3,4],[2,1],[1,0]],
      "ASUS": [[5,0],[4,2],[3,2],[2,3],[1,0]],
      "A13": [[6,5],[4,5],[3,6],[2,7]],
      "A BARRE": [[6,5],[5,7],[4,7],[3,6],[2,5],[1,5]],
      "E": [[6,0],[5,2],[4,2],[3,1],[2,0],[1,0]],
      "E7": [[6,0],[5,2],[4,0],[3,1],[2,0],[1,0]],
      "EM": [[6,0],[5,2],[4,2],[3,0],[2,0],[1,0]],
      "EM7": [[6,0],[5,2],[4,2],[3,0],[2,3],[1,0]],
      "ESUS": [[6,0],[5,2],[4,2],[3,2],[2,0],[1,0]],
      "E9": [[6,0],[5,7],[4,6],[3,7],[2,7]],
      "E7#9": [[6,0],[5,7],[4,6],[3,7],[2,8]],
      "F": [[6,1],[5,3],[4,3],[3,2],[2,1],[1,1]],
      "F MAJOR": [[6,1],[5,3],[4,3],[3,2],[2,1],[1,1]],
      "F BARRE": [[6,1],[5,3],[4,3],[3,2],[2,1],[1,1]],
      "FMAJ7": [[4,3],[3,2],[2,1],[1,0]],
      "FMAJ7#11": [[4,3],[3,2],[2,0],[1,0]],
      "FM": [[6,1],[5,3],[4,3],[3,1],[2,1],[1,1]],
      "F9": [[5,8],[4,7],[3,8],[2,8]],
      "B7": [[5,2],[4,1],[3,2],[2,0],[1,2]],
      "BM": [[5,2],[4,4],[3,4],[2,3],[1,2]],
      "BM7": [[5,2],[4,4],[3,2],[2,3],[1,2]],
      "B7#9": [[5,2],[4,1],[3,2],[2,3]],
      "BB BARRE": [[5,1],[4,3],[3,3],[2,3],[1,1]],
      "F#M": [[6,2],[5,4],[4,4],[3,2],[2,2],[1,2]],
      "F#M7": [[6,2],[5,4],[4,2],[3,2],[2,2],[1,2]],
      "F#7": [[6,2],[5,4],[4,2],[3,3],[2,2],[1,2]],
      "C#M7": [[5,4],[4,6],[3,4],[2,5],[1,4]],
      "C#7": [[5,4],[4,6],[3,4],[2,6],[1,4]],
      "G#M7": [[6,4],[5,6],[4,4],[3,4],[2,4],[1,4]],
      "AB BARRE": [[6,4],[5,6],[4,6],[3,5],[2,4],[1,4]],
      "EB BARRE": [[5,6],[4,8],[3,8],[2,8],[1,6]],
      "DB BARRE": [[5,4],[4,6],[3,6],[2,6],[1,4]],
      "E5": [[6,0],[5,2]],
      "G5": [[6,3],[5,5]],
      "A5": [[5,0],[4,2]],
      "B5": [[5,2],[4,4]],
      "C5": [[5,3],[4,5]],
      "D5": [[5,5],[4,7]],
      "A TRIAD": [[3,2],[2,2],[1,0]],
      "D TRIAD": [[3,2],[2,3],[1,2]],
      "E TRIAD": [[3,1],[2,0],[1,0]],
      "G/B": [[5,2],[4,0],[3,0],[2,3],[1,3]],
      "D/F#": [[6,2],[5,0],[4,0],[3,2],[2,3],[1,2]],
      "C/E": [[6,0],[5,3],[4,2],[3,0],[2,1],[1,0]],
      "C/G": [[6,3],[5,3],[4,2],[3,0],[2,1],[1,0]],
      "G 4THS": [[4,5],[3,5]],
      "A 4THS": [[4,7],[3,7]],
      "B 4THS": [[4,9],[3,9]],
      "C 4THS": [[4,10],[3,10]]
    };
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  playBeat(time, isAccent = false, isRest = false, isCountIn = false) {
    if (!this.audioCtx) this.init();

    const ctx = this.audioCtx;
    const now = time || ctx.currentTime;

    if (isCountIn) {
      this._playChime(now, isAccent ? 1318.5 : 1046.5, 0.08);
      return;
    }

    if (isRest) {
      if (this.soundOnRest === "silent") {
        return;
      } else if (this.soundOnRest === "muted-thud") {
        this._playMutedThud(now);
        return;
      }
    }

    if (this.soundType === "woodblock") {
      this._playWoodblock(now, isAccent ? 880 : 587, isAccent ? 0.9 : 0.6);
    } else if (this.soundType === "drum") {
      this._playDrum(now, isAccent);
    } else {
      this._playBeep(now, isAccent ? 1200 : 800, isAccent ? 0.9 : 0.6);
    }
  }

  // Synthesize an acoustic guitar note or chord strum so beginners can hear the exact pitch
  playNoteEvent(time, beatData, chordName, durationSeconds) {
    if (!this.guitarToneEnabled || !beatData) return;
    if (beatData.type === "rest" || beatData.isSustain || beatData.type === "sustain") return;
    if (!this.audioCtx) this.init();

    const now = time || this.audioCtx.currentTime;
    const holdDur = Math.max(0.18, Math.min(3.5, durationSeconds || 0.5));

    // Single-string melody note
    if (typeof beatData.string === "number" && beatData.fret !== null && beatData.fret !== undefined) {
      const midi = (this.openStringMidi[beatData.string] || 64) + beatData.fret;
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      this._playPluckedString(now, freq, holdDur, 0.35);
      return;
    }

    // Chord strum
    if (chordName) {
      const cKey = chordName.trim().toUpperCase();
      const shape = this.chordVoicings[cKey] || this.chordVoicings["C"];
      if (shape) {
        const isUpstroke = beatData.pick === "Up";
        const ordered = isUpstroke ? [...shape].reverse() : shape;
        ordered.forEach(([s, f], idx) => {
          const midi = (this.openStringMidi[s] || 64) + f;
          const freq = 440 * Math.pow(2, (midi - 69) / 12);
          this._playPluckedString(now + idx * 0.012, freq, holdDur, 0.16);
        });
      }
    }
  }

  _playPluckedString(time, freq, duration, level) {
    const ctx = this.audioCtx;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = "triangle";
    osc2.type = "sawtooth";
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 2, time); // 2nd harmonic warmth

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * 4.5, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.2, time + duration * 0.85);

    const peak = this.volume * level;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.22, time);

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.onended = () => {
      osc1.disconnect();
      osc2.disconnect();
      osc2Gain.disconnect();
      filter.disconnect();
      gain.disconnect();
    };

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  }

  _playWoodblock(time, freq, gainLevel) {
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, time + 0.04);

    gain.gain.setValueAtTime(this.volume * gainLevel, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    osc.start(time);
    osc.stop(time + 0.05);
  }

  _playMutedThud(time) {
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.04);

    gain.gain.setValueAtTime(this.volume * 0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    osc.start(time);
    osc.stop(time + 0.04);
  }

  _playBeep(time, freq, gainLevel) {
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(this.volume * gainLevel, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    osc.start(time);
    osc.stop(time + 0.06);
  }

  _playDrum(time, isAccent) {
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(isAccent ? 160 : 100, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.08);

    gain.gain.setValueAtTime(this.volume * (isAccent ? 0.9 : 0.6), time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    osc.start(time);
    osc.stop(time + 0.08);
  }

  _playChime(time, freq, duration) {
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(this.volume * 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    osc.start(time);
    osc.stop(time + duration);
  }

  setSoundType(type) {
    this.soundType = type;
  }

  setRestSoundType(type) {
    this.soundOnRest = type;
  }

  setGuitarTone(enabled) {
    this.guitarToneEnabled = !!enabled;
  }
}
