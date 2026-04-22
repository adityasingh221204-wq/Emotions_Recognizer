// ============================================================
//  MOODSCAN PRO — Analytics & Dashboard Module
//  Real-time Chart.js integration, session metrics
// ============================================================
'use strict';

window.MoodScanAnalytics = (() => {
  /* global Chart, MoodScanEngine */

  let pieChart     = null;
  let timelineChart = null;

  // Session data storage
  const session = {
    counts:    {},   // { emotion: count }
    timeline:  [],   // [{ ts, emotion, scores }]
    accuracy:  { correct: 0, total: 0 },
    startTime: null,
  };

  // Timeline window: keep last N points
  const TIMELINE_WINDOW = 60;

  // Chart.js theme colours
  let textColor = '#8882b0';
  let gridColor = 'rgba(255,255,255,0.05)';

  // ── Init ────────────────────────────────────────────────────
  function init() {
    session.startTime = Date.now();
    MoodScanEngine.EMOTION_ORDER.forEach(em => { session.counts[em] = 0; });
    _initPieChart();
    _initTimelineChart();
  }

  // ── Pie / Doughnut Chart ────────────────────────────────────
  function _initPieChart() {
    const canvas = document.getElementById('pieChartCanvas');
    if (!canvas || !window.Chart) return;

    const E = MoodScanEngine.EMOTIONS;
    const order = MoodScanEngine.EMOTION_ORDER;

    pieChart = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: order.map(em => em),
        datasets: [{
          data: order.map(() => 0),
          backgroundColor: order.map(em => E[em].color + 'bb'),
          borderColor:     order.map(em => E[em].color),
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        animation: { duration: 400, easing: 'easeOutCubic' },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              font: { family: 'Outfit', size: 11 },
              boxWidth: 10,
              padding: 8,
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed} detections`
            }
          }
        }
      }
    });
  }

  // ── Timeline Line Chart ─────────────────────────────────────
  function _initTimelineChart() {
    const canvas = document.getElementById('timelineChartCanvas');
    if (!canvas || !window.Chart) return;

    const E = MoodScanEngine.EMOTIONS;
    const order = MoodScanEngine.EMOTION_ORDER;

    // Each emotion is its own dataset line
    timelineChart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: order.map(em => ({
          label: em,
          data: [],
          borderColor: E[em].color,
          backgroundColor: E[em].color + '15',
          borderWidth: 2,
          pointRadius: 0,
          pointHitRadius: 10,
          fill: false,
          tension: 0.45,
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            display: false,
          },
          y: {
            min: 0,
            max: 1,
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: 'Outfit', size: 10 },
              callback: v => (v * 100).toFixed(0) + '%',
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${(ctx.parsed.y * 100).toFixed(0)}%`
            }
          }
        }
      }
    });
  }

  // ── Add Data Point ──────────────────────────────────────────
  function addDataPoint(dominant, expressions, ts) {
    // Increment session counts
    session.counts[dominant] = (session.counts[dominant] || 0) + 1;
    session.timeline.push({ ts, emotion: dominant, scores: { ...expressions } });

    // Update pie chart
    if (pieChart) {
      const order = MoodScanEngine.EMOTION_ORDER;
      pieChart.data.datasets[0].data = order.map(em => session.counts[em]);
      pieChart.update('none'); // no animation for real-time perf
    }

    // Update timeline chart
    if (timelineChart) {
      const label = new Date(ts).toLocaleTimeString('en', { hour12: false });
      const order = MoodScanEngine.EMOTION_ORDER;

      timelineChart.data.labels.push(label);
      order.forEach((em, i) => {
        timelineChart.data.datasets[i].data.push(expressions[em] || 0);
      });

      // Trim to window
      if (timelineChart.data.labels.length > TIMELINE_WINDOW) {
        timelineChart.data.labels.shift();
        timelineChart.data.datasets.forEach(ds => ds.data.shift());
      }

      timelineChart.update('none');
    }
  }

  // ── Update Feedback Accuracy ────────────────────────────────
  function recordFeedback(isCorrect) {
    session.accuracy.total++;
    if (isCorrect) session.accuracy.correct++;
    _updateAccuracyDisplay();
  }

  function _updateAccuracyDisplay() {
    const el = document.getElementById('statAccuracy');
    if (!el) return;
    const pct = session.accuracy.total > 0
      ? Math.round(session.accuracy.correct / session.accuracy.total * 100)
      : '--';
    el.textContent = session.accuracy.total > 0 ? pct + '%' : '--';
  }

  // ── Update Stats Panel ──────────────────────────────────────
  function updateStats(state) {
    const lang = state?.lang || 'en';

    // Total detections
    const totalEl = document.getElementById('statTotal');
    if (totalEl) totalEl.textContent = state?.detectionCount?.toLocaleString() || '0';

    // Dominant emotion
    const domEl = document.getElementById('statDominant');
    if (domEl) {
      const dominant = Object.entries(session.counts)
        .sort((a, b) => b[1] - a[1])[0];
      if (dominant && dominant[1] > 0) {
        const info = MoodScanEngine.EMOTIONS[dominant[0]];
        domEl.textContent = info ? `${info.emoji} ${MoodScanEngine.getEmotionName(dominant[0], lang)}` : '--';
      } else {
        domEl.textContent = '--';
      }
    }

    // Session duration
    const durEl = document.getElementById('statDuration');
    if (durEl && session.startTime) {
      const elapsed = Date.now() - session.startTime;
      const mm = Math.floor(elapsed / 60000);
      const ss = Math.floor((elapsed % 60000) / 1000);
      durEl.textContent = `${mm}:${ss.toString().padStart(2,'0')}`;
    }

    // Inference
    const infEl = document.getElementById('statInference');
    if (infEl && state?.inferenceMs != null) {
      infEl.textContent = state.inferenceMs + 'ms';
      infEl.style.color = state.inferenceMs < 200 ? 'var(--success)' : 'var(--warning)';
    }
  }

  // ── Update Chart Colours on Theme Change ────────────────────
  function updateChartTheme(theme) {
    textColor = theme === 'dark' ? '#8882b0' : '#6060a0';
    gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';

    [pieChart, timelineChart].forEach(chart => {
      if (!chart) return;
      // Update tick colors
      if (chart.options.scales?.y) {
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.y.grid.color  = gridColor;
      }
      if (chart.options.plugins?.legend?.labels) {
        chart.options.plugins.legend.labels.color = textColor;
      }
      chart.update();
    });
  }

  // ── Export Session CSV ──────────────────────────────────────
  function exportSessionCSV() {
    if (!session.timeline.length) { alert('No session data yet.'); return; }

    const order = MoodScanEngine.EMOTION_ORDER;
    const header = ['timestamp', 'dominant', ...order].join(',');
    const rows = session.timeline.map(pt => {
      return [
        new Date(pt.ts).toISOString(),
        pt.emotion,
        ...order.map(em => (pt.scores[em] || 0).toFixed(4))
      ].join(',');
    });

    const csv  = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `moodscan_session_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return { init, addDataPoint, recordFeedback, updateStats, updateChartTheme, exportSessionCSV, session };

})();
