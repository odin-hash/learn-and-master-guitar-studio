// Luxury Rotary Speed Dial Canvas Controller
export class GuitarSpeedDial {
  constructor(canvasElement, onBpmChange, onPlayToggle) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.onBpmChange = onBpmChange;
    this.onPlayToggle = onPlayToggle;

    this.minBpm = 30;
    this.maxBpm = 240;
    this.bpm = 60;
    this.isPlaying = false;
    this.isRest = false;

    this.isDragging = false;

    this.center = { x: 135, y: 135 };
    this.radius = 118;

    this.angleStart = Math.PI * 0.72; // ~130 deg
    this.angleEnd = Math.PI * 2.28;   // ~410 deg

    this._setupResize();
    this._attachEvents();
    this.draw();
  }

  _setupResize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = (rect && rect.width > 0) ? rect.width : 270;
    const h = (rect && rect.height > 0) ? rect.height : 270;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.width = w;
    this.height = h;
    this.center = { x: this.width / 2, y: this.height / 2 };
    this.radius = Math.max(40, Math.min(this.width, this.height) / 2 - 14);
  }

  resize() {
    this._setupResize();
    this.draw();
  }

  setBpm(newBpm) {
    this.bpm = Math.max(this.minBpm, Math.min(this.maxBpm, Math.round(newBpm)));
    this.draw();
  }

  setPlayState(isPlaying) {
    this.isPlaying = isPlaying;
    this.draw();
  }

  setRestState(isRest) {
    if (this.isRest !== isRest) {
      this.isRest = isRest;
      this.draw();
    }
  }

  _bpmToAngle(bpm) {
    const fraction = (bpm - this.minBpm) / (this.maxBpm - this.minBpm);
    return this.angleStart + fraction * (this.angleEnd - this.angleStart);
  }

  _angleToBpm(angle) {
    let normalized = angle;
    // Bisect the bottom dead zone at 90 deg (0.5 * PI) so dragging below 30 BPM never snaps to 240 BPM
    if (normalized < Math.PI * 0.5) {
      normalized += Math.PI * 2;
    }
    const clamped = Math.max(this.angleStart, Math.min(this.angleEnd, normalized));
    const fraction = (clamped - this.angleStart) / (this.angleEnd - this.angleStart);
    return Math.round(this.minBpm + fraction * (this.maxBpm - this.minBpm));
  }

  draw() {
    const ctx = this.ctx;
    const { x: cx, y: cy } = this.center;
    const r = Math.max(40, this.radius);

    ctx.clearRect(0, 0, this.width, this.height);

    const activeColor = this.isRest ? "#f43f5e" : "#f97316";
    const tickTrackColor = "rgba(255, 255, 255, 0.12)";

    // 1. Outer Luxury Ring Dial Arc
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = "#08080a";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.stroke();
    ctx.restore();

    // 2. Radial Ticks (30 to 240)
    const totalTicks = 72;
    for (let i = 0; i <= totalTicks; i++) {
      const frac = i / totalTicks;
      const angle = this.angleStart + frac * (this.angleEnd - this.angleStart);
      const tickBpm = this.minBpm + frac * (this.maxBpm - this.minBpm);
      const isMajor = i % 9 === 0;
      const tickLength = isMajor ? 13 : 6;

      const innerX = cx + Math.cos(angle) * (r - 18);
      const innerY = cy + Math.sin(angle) * (r - 18);
      const outerX = cx + Math.cos(angle) * (r - 18 + tickLength);
      const outerY = cy + Math.sin(angle) * (r - 18 + tickLength);

      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.lineWidth = isMajor ? 2.0 : 1.0;
      ctx.strokeStyle = tickBpm <= this.bpm ? activeColor : tickTrackColor;
      ctx.stroke();
    }

    // 3. Center Dividing Line (Sunset Orange)
    ctx.beginPath();
    ctx.moveTo(cx - (r - 35), cy);
    ctx.lineTo(cx + (r - 35), cy);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(249, 115, 22, 0.22)";
    ctx.stroke();

    // 4. Dial Numeric Labels
    ctx.font = "600 11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#9ca3af";

    ctx.fillText("135", cx, cy - (r - 40));
    ctx.fillText("75", cx - (r - 42), cy - 10);
    ctx.fillText("195", cx + (r - 42), cy - 10);
    ctx.fillText("30", cx - (r - 60), cy + (r - 46));
    ctx.fillText("240", cx + (r - 60), cy + (r - 46));

    // 5. Draggable Thumb Ring
    const currentAngle = this._bpmToAngle(this.bpm);
    const thumbX = cx + Math.cos(currentAngle) * (r - 18);
    const thumbY = cy + Math.sin(currentAngle) * (r - 18);

    ctx.save();
    ctx.beginPath();
    ctx.arc(thumbX, thumbY, 11, 0, Math.PI * 2);
    ctx.fillStyle = "#0b0c10";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = activeColor;
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();

    // 6. Center Luxury Play / Stop Button
    const playBtnRadius = 26;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, playBtnRadius, 0, Math.PI * 2);
    const centerGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, playBtnRadius);
    centerGrad.addColorStop(0, "#18191e");
    centerGrad.addColorStop(1, "#08080a");
    ctx.fillStyle = centerGrad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = this.isPlaying ? "rgba(249, 115, 22, 0.75)" : "rgba(249, 115, 22, 0.35)";
    ctx.stroke();

    if (!this.isPlaying) {
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy - 11);
      ctx.lineTo(cx + 13, cy);
      ctx.lineTo(cx - 7, cy + 11);
      ctx.closePath();
      ctx.fillStyle = activeColor;
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 8;
      ctx.fill();
    } else {
      ctx.fillStyle = activeColor;
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 8;
      ctx.fillRect(cx - 8, cy - 9, 5, 18);
      ctx.fillRect(cx + 3, cy - 9, 5, 18);
    }
    ctx.restore();
  }

  _attachEvents() {
    let lastTouchTime = 0;

    const handleStart = (clientX, clientY, isTouch = false) => {
      if (!isTouch && (Date.now() - lastTouchTime < 600)) {
        // Ignore simulated mouse events fired right after touch on mobile/tablet
        return;
      }
      const rect = this.canvas.getBoundingClientRect();
      const x = clientX - (rect.left + rect.width / 2);
      const y = clientY - (rect.top + rect.height / 2);
      const distFromCenter = Math.sqrt(x * x + y * y);

      if (distFromCenter <= 34) {
        if (this.onPlayToggle) this.onPlayToggle();
        return;
      }

      this.isDragging = true;
      this._updateFromCoords(clientX, clientY);
    };

    const handleMove = (clientX, clientY, isTouch = false) => {
      if (!isTouch && (Date.now() - lastTouchTime < 600)) return;
      if (!this.isDragging) return;
      this._updateFromCoords(clientX, clientY);
    };

    const handleEnd = () => {
      this.isDragging = false;
    };

    this.canvas.addEventListener("mousedown", (e) => handleStart(e.clientX, e.clientY, false));
    window.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY, false));
    window.addEventListener("mouseup", handleEnd);

    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        lastTouchTime = Date.now();
        handleStart(e.touches[0].clientX, e.touches[0].clientY, true);
      }
      e.preventDefault();
    }, { passive: false });

    window.addEventListener("touchmove", (e) => {
      if (!this.isDragging) return;
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY, true);
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener("touchend", () => {
      lastTouchTime = Date.now();
      handleEnd();
    });
    window.addEventListener("touchcancel", () => {
      lastTouchTime = Date.now();
      handleEnd();
    });

    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1 : -1;
      this.setBpm(this.bpm + delta);
      if (this.onBpmChange) this.onBpmChange(this.bpm);
    }, { passive: false });

    window.addEventListener("resize", () => this.resize());
  }

  _updateFromCoords(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - (rect.left + rect.width / 2);
    const y = clientY - (rect.top + rect.height / 2);

    let angle = Math.atan2(y, x);
    if (angle < 0) angle += Math.PI * 2;
    const newBpm = this._angleToBpm(angle);
    if (newBpm !== this.bpm) {
      this.bpm = newBpm;
      this.draw();
      if (this.onBpmChange) this.onBpmChange(this.bpm);
    }
  }
}
