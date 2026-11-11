// Web Audio Precision Metronome & Karplus-Strong Acoustic Steel-String Guitar Engine
export class MetronomeAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.soundType = "woodblock"; // "woodblock", "beep", "drum"
    this.soundOnRest = "click"; // "click", "muted-thud", "silent"
    this.guitarToneEnabled = true;
    this.volume = 0.8;

    // Open string MIDI notes: 1=E4(64), 2=B3(59), 3=G3(55), 4=D3(50), 5=A2(45), 6=E2(40)
    this.openStringMidi = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };

    this._guitarBus = null;
    this._clickNoiseBuffer = null;
    this._stringBufferCache = new Map();
    this._activeVoices = [];

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
    if (this.audioCtx.state === "suspended" || this.audioCtx.state === "interrupted") {
      this.audioCtx.resume();
    }
    this._ensureGuitarBus();
    this._ensureClickNoiseBuffer();
    this.unlockMobileAudio();
  }

  // Synthesize & cache a short 22ms decaying white-noise burst for percussive metronome clicks
  _ensureClickNoiseBuffer() {
    if (!this.audioCtx) return null;
    const sr = this.audioCtx.sampleRate;
    if (this._clickNoiseBuffer && this._clickNoiseBuffer.sampleRate === sr) {
      return this._clickNoiseBuffer;
    }
    const len = Math.max(64, Math.floor(sr * 0.024));
    const buf = this.audioCtx.createBuffer(1, len, sr);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.exp(-i / (sr * 0.0042));
      ch[i] = (Math.random() * 2 - 1) * env;
    }
    this._clickNoiseBuffer = buf;
    return buf;
  }

  _ensureGuitarBus() {
    if (!this.audioCtx || this._guitarBus) return;
    const ctx = this.audioCtx;

    // Acoustic Dreadnought Wood-Body Resonance EQ Chain + Soft Limiting Compressor
    const bodyHelmholtz = ctx.createBiquadFilter();
    bodyHelmholtz.type = "peaking";
    bodyHelmholtz.frequency.value = 105;
    bodyHelmholtz.Q.value = 2.0;
    bodyHelmholtz.gain.value = 4.2;

    const topDipole = ctx.createBiquadFilter();
    topDipole.type = "peaking";
    topDipole.frequency.value = 215;
    topDipole.Q.value = 1.8;
    topDipole.gain.value = 2.6;

    const boxCut = ctx.createBiquadFilter();
    boxCut.type = "peaking";
    boxCut.frequency.value = 470;
    boxCut.Q.value = 1.4;
    boxCut.gain.value = -2.2;

    const stringPresence = ctx.createBiquadFilter();
    stringPresence.type = "highshelf";
    stringPresence.frequency.value = 2400;
    stringPresence.gain.value = 1.6;

    const warmthCap = ctx.createBiquadFilter();
    warmthCap.type = "lowpass";
    warmthCap.frequency.value = 5600;
    warmthCap.Q.value = 0.7;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 12;
    comp.ratio.value = 3.5;
    comp.attack.value = 0.004;
    comp.release.value = 0.14;

    bodyHelmholtz.connect(topDipole);
    topDipole.connect(boxCut);
    boxCut.connect(stringPresence);
    stringPresence.connect(warmthCap);
    warmthCap.connect(comp);
    comp.connect(ctx.destination);

    this._guitarBus = bodyHelmholtz;
  }

  // Synthesize & cache an Extended Karplus-Strong steel-string acoustic guitar pluck buffer
  _getOrRenderStringBuffer(midi, isWound = false) {
    const key = `${midi}_${isWound ? "w" : "p"}`;
    if (this._stringBufferCache.has(key)) {
      return this._stringBufferCache.get(key);
    }

    const ctx = this.audioCtx;
    const sr = ctx.sampleRate;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const bufferDur = 2.8;
    const totalSamples = Math.floor(sr * bufferDur);
    const buffer = ctx.createBuffer(1, totalSamples, sr);
    const out = buffer.getChannelData(0);

    // Fractional delay line length with one-pole loop filter compensation
    const exactPeriod = sr / freq;
    const delayLen = Math.max(4, Math.floor(exactPeriod));
    const frac = exactPeriod - delayLen;
    const delay = new Float32Array(delayLen + 1);

    // 1. Pick excitation transient: pink-shaped noise + pick-position comb filter (~17% from bridge)
    const combOffset = Math.max(1, Math.round(delayLen * 0.17));
    let lpState = 0;
    const pickLp = isWound ? 0.42 : 0.62;
    const rawNoise = new Float32Array(delayLen);
    for (let i = 0; i < delayLen; i++) {
      const white = Math.random() * 2 - 1;
      lpState = lpState + pickLp * (white - lpState);
      rawNoise[i] = lpState;
    }
    for (let i = 0; i < delayLen; i++) {
      const delayedPick = i >= combOffset ? rawNoise[i - combOffset] : rawNoise[delayLen - combOffset + i];
      delay[i] = rawNoise[i] - 0.58 * delayedPick;
    }

    // 2. Extended Karplus-Strong feedback waveguide loop
    const baseDecay = isWound ? 0.9965 : 0.9945;
    const freqLoss = Math.max(0.986, baseDecay - Math.max(0, (freq - 140) * 0.000012));
    const blend = isWound ? 0.55 : 0.62; // two-point lowpass weight (controls string brightness)

    let idx = 0;
    let apState = 0;
    const apCoeff = (1 - frac) / (1 + frac); // Thiran 1st-order fractional-delay tuning correction

    let peak = 0;
    for (let n = 0; n < totalSamples; n++) {
      const cur = delay[idx];
      const nextIdx = (idx + 1) % delayLen;
      const nxt = delay[nextIdx];

      // Averaging lowpass filter + decay
      const filtered = freqLoss * (blend * cur + (1 - blend) * nxt);
      delay[idx] = filtered;

      // Sub-sample fractional delay all-pass interpolation for dead-on fret intonation
      const tuned = apCoeff * (cur - apState) + apState;
      apState = cur;

      // Subtle pick click fade-in during first 1.2ms to prevent digital click
      const env = n < 52 ? (n / 52) : 1.0;
      const sample = tuned * env;
      out[n] = sample;

      const absVal = Math.abs(sample);
      if (absVal > peak) peak = absVal;

      idx = nextIdx;
    }

    // Normalize buffer to uniform level
    if (peak > 0.0001) {
      const norm = 0.85 / peak;
      for (let n = 0; n < totalSamples; n++) {
        out[n] *= norm;
      }
    }

    if (this._stringBufferCache.size > 72) {
      const oldestKey = this._stringBufferCache.keys().next().value;
      this._stringBufferCache.delete(oldestKey);
    }
    this._stringBufferCache.set(key, buffer);
    return buffer;
  }

  // Actively damp/mute all ringing strings (e.g. when a Rest hits or playback stops)
  dampAllStrings(time) {
    if (!this.audioCtx || this._activeVoices.length === 0) return;
    const now = Math.max(time || 0, this.audioCtx.currentTime);
    const keepVoices = [];

    this._activeVoices.forEach(voice => {
      if (voice.stopAt <= now) return;
      // Only damp voices that started before or at this rest beat!
      if (voice.startTime <= now + 0.004) {
        try {
          voice.gainNode.gain.cancelScheduledValues(now);
          voice.gainNode.gain.setValueAtTime(Math.max(0.0001, voice.level), now);
          voice.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
          voice.source.stop(now + 0.022);
          voice.stopAt = now + 0.022;
        } catch (e) {}
      } else {
        keepVoices.push(voice);
      }
    });

    this._activeVoices = keepVoices;
  }

  unlockMobileAudio() {
    if (!this.audioCtx) return;
    try {
      const buffer = this.audioCtx.createBuffer(1, 1, 22050);
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioCtx.destination);
      source.start(0);
    } catch (e) {}
  }

  playBeat(time, accentLevel = false, isRest = false, isCountIn = false) {
    if (!this.audioCtx) this.init();

    const ctx = this.audioCtx;
    const now = Math.max(time || 0, ctx.currentTime);
    const level = typeof accentLevel === "string"
      ? accentLevel
      : (accentLevel ? "accent" : "normal");

    if (isCountIn) {
      // Crisp 18ms percussive count-in woodblock click (1200 Hz Beat 1 / 800 Hz Beats 2-4)
      const isPrimary = level === "accent";
      this._playPercussiveClick(now, isPrimary ? 1200 : 800, isPrimary ? 0.95 : 0.62, 6.5, 0.018);
      return;
    }

    if (isRest) {
      this.dampAllStrings(now);
      if (this.soundOnRest === "silent") {
        return;
      } else if (this.soundOnRest === "muted-thud") {
        this._playMutedThud(now);
        return;
      }
    }

    if (this.soundType === "silent") {
      return;
    }

    if (this.soundType === "drum") {
      // Rim / percussive tick (900 Hz primary / 760 Hz secondary / 620 Hz normal / 520 Hz sub)
      const freq = level === "accent" ? 900 : (level === "secondary" ? 760 : (level === "sub" ? 520 : 620));
      const gain = level === "accent" ? 0.92 : (level === "secondary" ? 0.74 : (level === "sub" ? 0.34 : 0.56));
      this._playPercussiveClick(now, freq, gain, 4.2, level === "sub" ? 0.015 : 0.022);
    } else if (this.soundType === "click" || this.soundType === "beep") {
      // High crisp digital wood click (1400 Hz / 1150 Hz / 950 Hz / 760 Hz sub)
      const freq = level === "accent" ? 1400 : (level === "secondary" ? 1150 : (level === "sub" ? 760 : 950));
      const gain = level === "accent" ? 0.90 : (level === "secondary" ? 0.72 : (level === "sub" ? 0.32 : 0.54));
      this._playPercussiveClick(now, freq, gain, 8.0, level === "sub" ? 0.012 : 0.016);
    } else {
      // Default Woodblock: 1200 Hz primary accent / 1000 Hz secondary / 800 Hz normal / 660 Hz sub
      const freq = level === "accent" ? 1200 : (level === "secondary" ? 1000 : (level === "sub" ? 660 : 800));
      const gain = level === "accent" ? 0.95 : (level === "secondary" ? 0.76 : (level === "sub" ? 0.34 : 0.58));
      this._playPercussiveClick(now, freq, gain, 6.5, level === "sub" ? 0.014 : 0.020);
    }
  }

  // Play single acoustic guitar note or 20ms-staggered chord strum (strictly decoupled from metronome beats)
  playNoteEvent(time, beatData, chordName, durationSeconds) {
    if (!this.audioCtx) this.init();
    const now = Math.max(time || 0, this.audioCtx.currentTime);

    if (!beatData || beatData.type === "rest" || beatData.type === "metronome" || beatData.isMetronomeOnly) {
      if (beatData && beatData.type === "rest") {
        this.dampAllStrings(now);
      }
      return;
    }
    if (!this.guitarToneEnabled || beatData.isSustain || beatData.type === "sustain") return;

    const holdDur = Math.max(0.24, Math.min(2.75, (durationSeconds || 0.5) + 0.14));

    // Single-string melody note
    if (typeof beatData.string === "number" && beatData.fret !== null && beatData.fret !== undefined) {
      const midi = (this.openStringMidi[beatData.string] || 64) + beatData.fret;
      this._playPluckedString(now, midi, holdDur, 0.48, beatData.string >= 4);
      return;
    }

    // Chord strum staggered by 20ms (0.020s) per string low-to-high (or reversed on Up strum)
    const activeChord = beatData.chordChange || chordName;
    if (activeChord) {
      const cKey = activeChord.trim().toUpperCase();
      const shape = this.chordVoicings[cKey] || this.chordVoicings["C"];
      if (shape) {
        const isUpstroke = beatData.pick === "Up";
        const ordered = isUpstroke ? [...shape].reverse() : shape;
        ordered.forEach(([s, f], idx) => {
          const midi = (this.openStringMidi[s] || 64) + f;
          const strumOffset = idx * 0.020; // 20ms stagger per string
          const stringLevel = s >= 5 ? 0.23 : 0.19;
          this._playPluckedString(now + strumOffset, midi, holdDur, stringLevel, s >= 4);
        });
      }
    }
  }

  _playPluckedString(time, midi, duration, level, isWound = false) {
    const ctx = this.audioCtx;
    if (!ctx) return;
    this._ensureGuitarBus();

    const t = Math.max(time || 0, ctx.currentTime);
    const buffer = this._getOrRenderStringBuffer(midi, isWound);

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    const peak = Math.max(0.01, this.volume * level);
    const releaseAt = Math.max(t + 0.08, t + duration - 0.08);
    const stopAt = t + duration + 0.02;

    gainNode.gain.setValueAtTime(peak, t);
    gainNode.gain.setValueAtTime(peak, releaseAt);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, stopAt);

    source.connect(gainNode);
    gainNode.connect(this._guitarBus || ctx.destination);

    const voiceRecord = { source, gainNode, startTime: t, stopAt, level: peak };
    this._activeVoices.push(voiceRecord);

    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
      this._activeVoices = this._activeVoices.filter(v => v !== voiceRecord);
    };

    source.start(t);
    source.stop(stopAt);
  }

  // Ultra-tight 15-25ms Web Audio percussive click synthesizer:
  // exponentially decaying noise burst + high-Q bandpass woodblock impulse
  _playPercussiveClick(time, centerFreq = 1200, gainLevel = 0.85, qFactor = 6.5, decaySec = 0.020) {
    const ctx = this.audioCtx;
    if (!ctx) return;
    const t = Math.max(time || 0, ctx.currentTime);
    const clickDur = Math.max(0.015, Math.min(0.025, decaySec));
    const level = Math.max(0.05, this.volume * gainLevel);

    // 1. Short exponentially decaying noise burst shaped through a high-Q bandpass filter
    const noiseBuf = this._ensureClickNoiseBuffer();
    if (noiseBuf) {
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(centerFreq, t);
      bandpass.Q.setValueAtTime(qFactor, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(level * 1.1, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + clickDur);

      noiseSrc.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseSrc.onended = () => {
        noiseSrc.disconnect();
        bandpass.disconnect();
        noiseGain.disconnect();
      };

      noiseSrc.start(t);
      noiseSrc.stop(t + clickDur + 0.004);
    }

    // 2. Short woodblock resonant pitch impulse (1200 Hz accent / 800 Hz beat, zero sustain)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(centerFreq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(200, centerFreq * 0.88), t + clickDur);

    oscGain.gain.setValueAtTime(0.0005, t);
    oscGain.gain.linearRampToValueAtTime(level * 0.68, t + 0.0012);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t + clickDur);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.onended = () => {
      osc.disconnect();
      oscGain.disconnect();
    };

    osc.start(t);
    osc.stop(t + clickDur + 0.004);
  }

  _playMutedThud(time) {
    const ctx = this.audioCtx;
    if (!ctx) return;
    const t = Math.max(time || 0, ctx.currentTime);
    const noiseBuf = this._ensureClickNoiseBuffer();
    if (noiseBuf) {
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;

      const lp = ctx.createBiquadFilter();
      lp.type = "bandpass";
      lp.frequency.setValueAtTime(240, t);
      lp.Q.setValueAtTime(2.8, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(Math.max(0.02, this.volume * 0.55), t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);

      noiseSrc.connect(lp);
      lp.connect(gain);
      gain.connect(ctx.destination);
      noiseSrc.onended = () => {
        noiseSrc.disconnect();
        lp.disconnect();
        gain.disconnect();
      };
      noiseSrc.start(t);
      noiseSrc.stop(t + 0.025);
    }
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
