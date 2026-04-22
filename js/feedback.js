// ============================================================
//  MOODSCAN PRO — Self-Learning Feedback System
//  Collects user corrections → localStorage → CSV export
//  Data structure compatible with FER+ retraining format
// ============================================================
'use strict';

window.MoodScanFeedback = (() => {
  /* global MoodScanEngine, MoodScanAnalytics */

  const STORAGE_KEY = 'moodscan_feedback_v2';

  let _state         = null;  // reference to app state
  let _current       = { emotion: null, confidence: 0 };
  let _feedbackBuffer = [];   // in-memory

  // ── Schema ──────────────────────────────────────────────────
  /**
   * Each feedback entry:
   * {
   *   id:            string   UUID-like
   *   ts:            number   Unix ms
   *   sessionId:     string
   *   detected:      string   Emotion detected by model
   *   confidence:    number   0–1
   *   isCorrect:     boolean
   *   corrected:     string | null   (if isCorrect=false)
   *   lang:          string
   * }
   */

  // ── Init ────────────────────────────────────────────────────
  function init(appState) {
    _state = appState;
    _feedbackBuffer = _load();
  }

  // ── Set Current Emotion ─────────────────────────────────────
  function setCurrentEmotion(emotion, confidence) {
    _current = { emotion, confidence };
  }

  // ── Submit Feedback (Yes/No) ─────────────────────────────────
  function submitFeedback(isCorrect) {
    if (!_current.emotion) return;

    if (!isCorrect) {
      // Show correction picker
      _showCorrectionPicker();
      return;
    }

    _saveFeedbackEntry({ isCorrect: true, corrected: null });
    _showThanks();
    MoodScanAnalytics.recordFeedback(true);
  }

  // ── Correction Picker ────────────────────────────────────────
  function _showCorrectionPicker() {
    const picker = document.getElementById('correctionPicker');
    if (!picker) return;

    // Clear previous buttons
    picker.innerHTML = '';
    const lang = _state?.lang || 'en';
    const strings = MoodScanEngine.UI.get(lang);

    const label = document.createElement('p');
    label.className = 'picker-label';
    label.textContent = strings.ui.selectCorrect;
    picker.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'picker-grid';

    MoodScanEngine.EMOTION_ORDER.forEach(em => {
      const info = MoodScanEngine.EMOTIONS[em];
      const btn  = document.createElement('button');
      btn.className = 'picker-btn';
      btn.innerHTML = `${info.emoji}<br><small>${MoodScanEngine.getEmotionName(em, lang)}</small>`;
      btn.style.setProperty('--em-color', info.color);
      btn.addEventListener('click', () => {
        _saveFeedbackEntry({ isCorrect: false, corrected: em });
        picker.innerHTML = '';
        _showThanks();
        MoodScanAnalytics.recordFeedback(false);
      });
      grid.appendChild(btn);
    });

    picker.appendChild(grid);
  }

  // ── Save Entry ───────────────────────────────────────────────
  function _saveFeedbackEntry({ isCorrect, corrected }) {
    const entry = {
      id:         _uid(),
      ts:         Date.now(),
      sessionId:  _state?.sessionId || 'unknown',
      detected:   _current.emotion,
      confidence: parseFloat((_current.confidence || 0).toFixed(4)),
      isCorrect,
      corrected:  corrected || null,
      lang:       _state?.lang || 'en',
    };
    _feedbackBuffer.push(entry);
    _persist();
  }

  // ── Show Thanks ──────────────────────────────────────────────
  function _showThanks() {
    const thanksEl = document.getElementById('feedbackThanks');
    const btns     = document.getElementById('feedbackBtns');
    if (thanksEl) { thanksEl.style.display = 'block'; }
    if (btns)     { btns.style.display = 'none'; }

    setTimeout(() => {
      if (thanksEl) thanksEl.style.display = 'none';
      if (btns)     btns.style.display = 'flex';
      const picker = document.getElementById('correctionPicker');
      if (picker) picker.innerHTML = '';
    }, 2800);
  }

  // ── Persist & Load ───────────────────────────────────────────
  function _persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_feedbackBuffer));
    } catch (e) {
      // Graceful degradation if storage is full
      console.warn('MoodScan: localStorage full, trimming feedback log');
      _feedbackBuffer = _feedbackBuffer.slice(-500);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_feedbackBuffer));
    }
  }

  function _load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
  }

  // ── Export CSV ───────────────────────────────────────────────
  /**
   * Export all feedback as CSV for offline model fine-tuning.
   * Format matches FER+ voting format (can be used to re-label training data).
   */
  function exportCSV() {
    const data = _load();
    if (!data.length) { alert('No feedback data yet. Make some detections first!'); return; }

    const header = ['id','timestamp','session_id','detected_emotion','confidence',
                    'is_correct','corrected_emotion','language'].join(',');
    const rows = data.map(d => [
      d.id, new Date(d.ts).toISOString(), d.sessionId,
      d.detected, d.confidence,
      d.isCorrect, d.corrected ?? '', d.lang
    ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));

    const csv  = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `moodscan_feedback_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Get Stats (for settings panel) ──────────────────────────
  function getStats() {
    const data = _load();
    const total    = data.length;
    const correct  = data.filter(d => d.isCorrect).length;
    const accuracy = total ? Math.round(correct / total * 100) : 0;
    return { total, correct, incorrect: total - correct, accuracy };
  }

  // ── Helpers ──────────────────────────────────────────────────
  function _uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  return { init, setCurrentEmotion, submitFeedback, exportCSV, getStats };

})();
