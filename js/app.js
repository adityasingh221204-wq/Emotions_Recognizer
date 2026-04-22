// ============================================================
//  MOODSCAN PRO — Main Application Orchestrator
//  face-api.js integration · Camera · Detection Loop · UI
//  On-device inference, <200ms target, Privacy-First
// ============================================================
'use strict';

/* global faceapi, MoodScanEngine, MoodScanAnalytics, MoodScanFeedback */

window.MoodScanApp = (() => {

  // ── Application State ───────────────────────────────────────
  const state = {
    lang:           'en',
    theme:          'dark',
    isRunning:      false,
    faceDetected:   false,
    currentEmotion: null,
    lastEmotion:    null,
    lastResponseTs: 0,
    inferenceMs:    0,
    detectionCount: 0,
    sessionId:      Date.now().toString(36) + Math.random().toString(36).slice(2),
    sessionStartTime: null,
    frameCount:     0,
    lastFpsTs:      Date.now(),
    fps:            0,
  };

  // CDN for face-api.js models (vladmandic fork — WebGL-optimised)
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

  // ── DOM References ──────────────────────────────────────────
  let videoEl, overlayCanvas, ctx;

  // ── Boot ────────────────────────────────────────────────────
  async function init() {
    videoEl       = document.getElementById('videoEl');
    overlayCanvas = document.getElementById('overlayCanvas');
    ctx           = overlayCanvas.getContext('2d');

    // Restore prefs
    state.theme = localStorage.getItem('moodscan_theme') || 'dark';
    state.lang  = localStorage.getItem('moodscan_lang')  || 'en';
    _applyTheme(state.theme);
    _applyLang(state.lang);

    // Init sub-systems
    MoodScanAnalytics.init();
    MoodScanFeedback.init(state);

    // Build dynamic UI components
    _buildEmotionStrip();
    _buildProbBars();

    // Show privacy modal if not accepted
    if (localStorage.getItem('moodscan_privacy') !== 'true') {
      _showModal('privacyModal');
    }

    await _loadModels();
  }

  // ── Model Loading ────────────────────────────────────────────
  async function _loadModels() {
    const fill    = document.getElementById('loaderFill');
    const statusEl = document.getElementById('loaderStatus');

    const steps = [
      { pct: 20,  msg: '📦 Downloading face detector…',      fn: () => faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)    },
      { pct: 55,  msg: '🦴 Loading face landmark model…',    fn: () => faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL) },
      { pct: 88,  msg: '🧠 Loading emotion classifier…',     fn: () => faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)    },
      { pct: 100, msg: '✅ All models ready! Starting…',      fn: null },
    ];

    for (const step of steps) {
      if (statusEl) statusEl.textContent = step.msg;
      if (step.fn)  await step.fn();
      if (fill)     fill.style.width = step.pct + '%';
      await _sleep(150);
    }

    await _sleep(350);
    document.getElementById('loaderOverlay')?.classList.add('hidden');
    state.sessionStartTime = Date.now();

    // Auto-start camera if privacy already accepted
    if (localStorage.getItem('moodscan_privacy') === 'true') {
      startCamera();
    }
  }

  // ── Camera Start ─────────────────────────────────────────────
  async function startCamera() {
    const startCamOverlay = document.getElementById('startCamOverlay');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width:     { ideal: 640 },
          height:    { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 },
        }
      });

      videoEl.srcObject = stream;
      await new Promise(r => { videoEl.onloadedmetadata = r; });
      await videoEl.play();

      if (startCamOverlay) startCamOverlay.classList.add('hidden');
      state.isRunning = true;
      state.sessionStartTime = state.sessionStartTime || Date.now();

      _startDetectionLoop();

    } catch (err) {
      console.error('[MoodScan] Camera error:', err);
      const hint = document.getElementById('camHint');
      if (hint) hint.textContent = '⚠️ Camera access denied. Please allow camera permission.';
    }
  }

  // ── Detection Loop ───────────────────────────────────────────
  // Targets 15 inference-fps to balance accuracy vs latency
  function _startDetectionLoop() {
    const TARGET_IFR  = 1000 / 15;
    let lastInferTs   = 0;

    async function loop(timestamp) {
      if (!state.isRunning) return;

      // FPS tracking
      state.frameCount++;
      if (timestamp - state.lastFpsTs >= 1000) {
        state.fps       = state.frameCount;
        state.frameCount = 0;
        state.lastFpsTs  = timestamp;
        const fpsEl = document.getElementById('fpsBadge');
        if (fpsEl) fpsEl.textContent = state.fps + ' fps';
      }

      // Throttle inference
      if (timestamp - lastInferTs >= TARGET_IFR) {
        lastInferTs = timestamp;
        await _processFrame();
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  // ── Process Single Frame ─────────────────────────────────────
  async function _processFrame() {
    if (!videoEl.videoWidth) return;

    // Sync canvas dimensions
    if (overlayCanvas.width  !== videoEl.videoWidth)  overlayCanvas.width  = videoEl.videoWidth;
    if (overlayCanvas.height !== videoEl.videoHeight) overlayCanvas.height = videoEl.videoHeight;
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    const t0 = performance.now();

    // Run inference: face detect → landmarks → expressions
    const result = await faceapi
      .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({
        inputSize:       224,
        scoreThreshold:  0.45,
      }))
      .withFaceLandmarks(true)
      .withFaceExpressions();

    state.inferenceMs = Math.round(performance.now() - t0);

    // Update inference badge
    const infEl = document.getElementById('infBadge');
    if (infEl) {
      infEl.textContent = state.inferenceMs + 'ms';
      infEl.style.color = state.inferenceMs < 200 ? 'var(--success)' : 'var(--warning)';
    }

    if (result) {
      _handleFaceDetected(result);
    } else {
      _handleNoFace();
    }
  }

  // ── Face Detected ────────────────────────────────────────────
  function _handleFaceDetected(result) {
    document.getElementById('noFaceOverlay')?.classList.remove('show');
    state.faceDetected = true;
    state.detectionCount++;

    const expressions = result.expressions;
    const dominant    = _getDominant(expressions);

    // Draw overlay (mirrored canvas is handled by CSS transform)
    _drawFaceOverlay(result, dominant);

    // Update probability bars + chip strip
    _updateProbBars(expressions, dominant);
    _updateEmotionStrip(expressions, dominant);

    // Push to analytics
    MoodScanAnalytics.addDataPoint(dominant, expressions, Date.now());

    // Update main emotion panel (throttled: 4s or on emotion change)
    const now = Date.now();
    const emotionChanged = dominant !== state.currentEmotion;
    const expired        = now - state.lastResponseTs > 4000;

    if (emotionChanged || expired) {
      state.lastEmotion    = state.currentEmotion;
      state.currentEmotion = dominant;
      state.lastResponseTs = now;
      _updateEmotionDisplay(dominant, expressions[dominant]);
      if (emotionChanged && state.currentEmotion) {
        _updateGIF(dominant);
      }
    }

    MoodScanFeedback.setCurrentEmotion(dominant, expressions[dominant]);
  }

  // ── No Face ──────────────────────────────────────────────────
  function _handleNoFace() {
    document.getElementById('noFaceOverlay')?.classList.add('show');
    state.faceDetected = false;
  }

  // ── Canvas Overlay Rendering ─────────────────────────────────
  function _drawFaceOverlay(result, dominant) {
    const info  = MoodScanEngine.EMOTIONS[dominant];
    const { x, y, width: w, height: h } = result.detection.box;
    const conf  = result.expressions[dominant];

    // ─ Glow bounding box
    ctx.shadowColor = info.color;
    ctx.shadowBlur  = 18;
    ctx.strokeStyle = info.color;
    ctx.lineWidth   = 2.5;
    ctx.beginPath();
    _roundRect(ctx, x, y, w, h, 14);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // ─ Corner accent brackets
    _drawCornerAccents(ctx, x, y, w, h, info.color);

    // ─ Label pill
    const name  = MoodScanEngine.getEmotionName(dominant, state.lang);
    const label = `${info.emoji}  ${name}  ${(conf * 100).toFixed(0)}%`;
    ctx.font    = 'bold 14px Outfit, sans-serif';
    const tw    = ctx.measureText(label).width;

    ctx.fillStyle = info.color + 'e8';
    ctx.shadowColor = info.color;
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    _roundRect(ctx, x - 1, y - 34, tw + 22, 27, 8);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#00000099';
    ctx.fillText(label, x + 11, y - 15);

    // ─ Landmark dots
    if (result.landmarks?.positions) {
      ctx.fillStyle = info.color + '60';
      for (const pt of result.landmarks.positions) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function _drawCornerAccents(ctx, x, y, w, h, color) {
    const L = 22;
    ctx.strokeStyle = color;
    ctx.lineWidth   = 3.5;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 10;
    ctx.lineCap     = 'round';

    // TL
    ctx.beginPath(); ctx.moveTo(x, y + L); ctx.lineTo(x, y); ctx.lineTo(x + L, y); ctx.stroke();
    // TR
    ctx.beginPath(); ctx.moveTo(x + w - L, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + L); ctx.stroke();
    // BL
    ctx.beginPath(); ctx.moveTo(x, y + h - L); ctx.lineTo(x, y + h); ctx.lineTo(x + L, y + h); ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(x + w - L, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - L); ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.lineCap = 'butt';
  }

  // ── UI Updates ───────────────────────────────────────────────
  function _updateEmotionDisplay(emotion, confidence) {
    const info  = MoodScanEngine.EMOTIONS[emotion];
    const name  = MoodScanEngine.getEmotionName(emotion, state.lang);
    const conf  = (confidence * 100).toFixed(0);
    const uiStr = MoodScanEngine.UI.get(state.lang).ui;

    // Big emoji — bounce animation
    const emojiEl = document.getElementById('bigEmoji');
    if (emojiEl) {
      emojiEl.style.animation = 'none';
      void emojiEl.offsetHeight;
      emojiEl.style.animation = '';
      emojiEl.textContent = info.emoji;
    }

    // Emotion name
    const nameEl = document.getElementById('emotionNameDisplay');
    if (nameEl) {
      nameEl.textContent = name;
      nameEl.style.color = info.color;
    }

    // Confidence
    const confEl = document.getElementById('emotionConfDisplay');
    if (confEl) confEl.textContent = `${conf}% ${uiStr.confidenceLabel}`;

    // Emoji wrap glow ring
    const wrapEl = document.getElementById('bigEmojiWrap');
    if (wrapEl) {
      wrapEl.style.background = info.color + '22';
      wrapEl.style.setProperty('--current-color', info.color);
      wrapEl.style.boxShadow = `0 0 30px ${info.color}44`;
    }

    // Response text
    _updateResponseText(emotion);
  }

  function _updateResponseText(emotion) {
    const el = document.getElementById('responseText');
    if (!el) return;
    el.classList.add('updating');
    setTimeout(() => {
      el.textContent = MoodScanEngine.getResponse(emotion, state.lang);
      el.classList.remove('updating');
    }, 220);
  }

  function _updateGIF(emotion) {
    const info    = MoodScanEngine.EMOTIONS[emotion];
    const gifFrame = document.getElementById('gifFrame');
    if (!gifFrame) return;
    const url = MoodScanEngine.getGIF(emotion);
    if (!url) return;

    gifFrame.innerHTML = `<img
      src="${url}"
      alt="${emotion} reaction gif"
      loading="lazy"
      onerror="this.parentElement.innerHTML='<div class=\\'gif-placeholder\\'><span class=\\'gp-icon\\'>${info.emoji}</span><p>Vibe: ${emotion}!</p></div>'"
    />`;
  }

  function _updateProbBars(expressions, dominant) {
    MoodScanEngine.EMOTION_ORDER.forEach(em => {
      const pct = Math.round((expressions[em] || 0) * 100);

      const fill = document.getElementById(`probFill-${em}`);
      if (fill) {
        fill.style.width = pct + '%';
        fill.classList.toggle('active', em === dominant);
      }

      const pctEl = document.getElementById(`probPct-${em}`);
      if (pctEl) pctEl.textContent = pct + '%';
    });
  }

  function _updateEmotionStrip(expressions, dominant) {
    MoodScanEngine.EMOTION_ORDER.forEach(em => {
      document.getElementById(`chip-${em}`)?.classList.toggle('active', em === dominant);
      const pctEl = document.getElementById(`chipPct-${em}`);
      if (pctEl) pctEl.textContent = Math.round((expressions[em] || 0) * 100) + '%';
    });
  }

  // ── Build Dynamic Components ─────────────────────────────────
  function _buildEmotionStrip() {
    const strip = document.getElementById('emotionStrip');
    if (!strip) return;
    strip.innerHTML = '';
    MoodScanEngine.EMOTION_ORDER.forEach(em => {
      const info = MoodScanEngine.EMOTIONS[em];
      const chip = document.createElement('div');
      chip.className = 'em-chip';
      chip.id = `chip-${em}`;
      chip.style.setProperty('--chip-color', info.color);
      chip.innerHTML = `
        <span class="chip-emoji">${info.emoji}</span>
        <span class="chip-name" data-i18n-emotion="${em}">${em}</span>
        <span class="chip-pct" id="chipPct-${em}">0%</span>`;
      strip.appendChild(chip);
    });
  }

  function _buildProbBars() {
    const container = document.getElementById('probBarsContainer');
    if (!container) return;
    container.innerHTML = '';
    MoodScanEngine.EMOTION_ORDER.forEach(em => {
      const info = MoodScanEngine.EMOTIONS[em];
      const row  = document.createElement('div');
      row.className = 'prob-row';
      row.innerHTML = `
        <span class="prob-label">
          <span class="prob-emoji">${info.emoji}</span>
          <span data-i18n-emotion="${em}">${em}</span>
        </span>
        <div class="prob-track">
          <div class="prob-fill" id="probFill-${em}" style="background:${info.color}"></div>
        </div>
        <span class="prob-pct" id="probPct-${em}">0%</span>`;
      container.appendChild(row);
    });
  }

  // ── i18n & Theme ─────────────────────────────────────────────
  function _applyLang(lang) {
    state.lang = lang;
    localStorage.setItem('moodscan_lang', lang);
    document.documentElement.lang = lang;

    const S = MoodScanEngine.UI.get(lang);

    // data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const val = _resolveKey(S, key);
      if (val !== undefined) el.textContent = val;
    });

    // data-i18n-placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      const val = _resolveKey(S, key);
      if (val !== undefined) el.placeholder = val;
    });

    // Emotion names in strip + bars
    document.querySelectorAll('[data-i18n-emotion]').forEach(el => {
      const em = el.dataset.i18nEmotion;
      el.textContent = S.emotions[em] || em;
    });

    // Re-render response if emotion is set
    if (state.currentEmotion) _updateResponseText(state.currentEmotion);
  }

  function _resolveKey(obj, path) {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }

  function _applyTheme(theme) {
    state.theme = theme;
    localStorage.setItem('moodscan_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    MoodScanAnalytics.updateChartTheme(theme);
  }

  // ── Modal System ─────────────────────────────────────────────
  function _showModal(id) { document.getElementById(id)?.classList.add('show'); }
  function _hideAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));
  }

  // ── Helpers ──────────────────────────────────────────────────
  function _getDominant(expressions) {
    return Object.entries(expressions).sort((a, b) => b[1] - a[1])[0][0];
  }

  function _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // ── Event Bindings ───────────────────────────────────────────
  function bindEvents() {

    // ─ Privacy modal
    document.getElementById('privacyAcceptBtn')?.addEventListener('click', () => {
      localStorage.setItem('moodscan_privacy', 'true');
      _hideAllModals();
      startCamera();
    });

    // ─ Theme toggle
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
      _applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });

    // ─ Language select
    document.getElementById('langSelect')?.addEventListener('change', e => {
      _applyLang(e.target.value);
    });

    // ─ Settings open / close
    document.getElementById('settingsBtn')?.addEventListener('click', () => _showModal('settingsModal'));
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', _hideAllModals);
    });

    // ─ Click outside modal to close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('show');
      });
    });

    // ─ Start camera button (inside cam placeholder)
    document.getElementById('startCamBtn')?.addEventListener('click', startCamera);

    // ─ Feedback buttons
    document.getElementById('feedbackYesBtn')?.addEventListener('click', () =>
      MoodScanFeedback.submitFeedback(true));
    document.getElementById('feedbackNoBtn')?.addEventListener('click', () =>
      MoodScanFeedback.submitFeedback(false));

    // ─ Export buttons
    document.getElementById('exportFeedbackBtn')?.addEventListener('click', () =>
      MoodScanFeedback.exportCSV());
    document.getElementById('exportSessionBtn')?.addEventListener('click', () =>
      MoodScanAnalytics.exportSessionCSV());

    // ─ Stats update (every second)
    setInterval(() => MoodScanAnalytics.updateStats(state), 1000);
  }

  return { init, startCamera, bindEvents, getState: () => state };

})();

// ── Bootstrap ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  MoodScanApp.bindEvents();
  MoodScanApp.init();
});
