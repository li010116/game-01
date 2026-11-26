import { sound } from './audio.js';
import { toySDK } from './toy-sdk.js';
import { evaluateRun, formatMs, renderCertificateDataURL } from './poster.js';
import { LEVELS, CHAPTERS } from './levels/index.js';

/**
 * Set DEFAULT_DEBUG = false before publishing to Bilibili Toy production.
 * Can also be enabled at runtime via URL parameter ?debug=1.
 */
const DEFAULT_DEBUG = true;

const els = {
  body: document.body,
  skinBar: document.getElementById('skinBar'),
  hudLevel: document.getElementById('hudLevel'),
  hudTimer: document.getElementById('hudTimer'),
  hudSus: document.getElementById('hudSus'),
  hudSusFill: document.getElementById('hudSusFill'),
  btnRank: document.getElementById('btnRank'),
  btnMute: document.getElementById('btnMute'),
  gameCard: document.getElementById('gameCard'),
  progressStrip: document.getElementById('progressStrip'),
  brandOrg: document.getElementById('brandOrg'),
  levelTitle: document.getElementById('levelTitle'),
  versionChip: document.getElementById('versionChip'),
  promptTag: document.getElementById('promptTag'),
  levelPrompt: document.getElementById('levelPrompt'),
  stage: document.getElementById('stage'),
  roastBar: document.getElementById('roastBar'),
  roastIcon: document.getElementById('roastIcon'),
  roastSpeaker: document.getElementById('roastSpeaker'),
  roastText: document.getElementById('roastText'),
  btnSkip: document.getElementById('btnSkip'),
  encryptNote: document.getElementById('encryptNote'),
  passFlash: document.getElementById('passFlash'),
  passFlashMsg: document.getElementById('passFlashMsg'),
  chapterOverlay: document.getElementById('chapterOverlay'),
  chapterTag: document.getElementById('chapterTag'),
  chapterName: document.getElementById('chapterName'),
  chapterDesc: document.getElementById('chapterDesc'),
  resultScreen: document.getElementById('resultScreen'),
  resultSub: document.getElementById('resultSub'),
  certImage: document.getElementById('certImage'),
  playerNameInput: document.getElementById('playerNameInput'),
  btnRenameCert: document.getElementById('btnRenameCert'),
  btnCopyShare: document.getElementById('btnCopyShare'),
  btnDownloadCert: document.getElementById('btnDownloadCert'),
  btnResultRank: document.getElementById('btnResultRank'),
  btnReplay: document.getElementById('btnReplay'),
  btnFastReplay: document.getElementById('btnFastReplay'),
  rankModal: document.getElementById('rankModal'),
  btnCloseRank: document.getElementById('btnCloseRank'),
  btnRefreshRank: document.getElementById('btnRefreshRank'),
  rankSourceNote: document.getElementById('rankSourceNote'),
  rankStatus: document.getElementById('rankStatus'),
  rankList: document.getElementById('rankList'),
  rankMyBar: document.getElementById('rankMyBar'),
  debugBar: document.getElementById('debugBar'),
  dbgToggle: document.getElementById('dbgToggle'),
  dbgPrev: document.getElementById('dbgPrev'),
  dbgSelect: document.getElementById('dbgSelect'),
  dbgNext: document.getElementById('dbgNext'),
  dbgCert: document.getElementById('dbgCert'),
  dbg307: document.getElementById('dbg307'),
  toast: document.getElementById('toast'),
  confettiCanvas: document.getElementById('confettiCanvas')
};

const state = {
  started: false,
  fastMode: false,
  currentIdx: 0,
  timerRunning: false,
  timerBaseMs: 0,
  timerStartPerf: 0,
  extraPenaltyMs: 0,
  rawSus: 0,
  skipCount: 0,
  totalFails: 0,
  levelFails: {},
  flags: {},
  lastEval: null,
  lastCertUrl: ''
};

let activeCleanup = null;
let hudRafId = 0;
let levelSettled = false;
let toastTimer = 0;
let confettiRafId = 0;

function showToast(msg, ms = 1900) {
  els.toast.textContent = msg;
  els.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.add('hidden'), ms);
}

function getCurrentRawMs() {
  if (!state.started) return 0;
  const live = state.timerRunning ? performance.now() - state.timerStartPerf : 0;
  return state.timerBaseMs + live + state.extraPenaltyMs;
}

function startTimer() {
  if (state.timerRunning) return;
  state.started = true;
  state.timerStartPerf = performance.now();
  state.timerRunning = true;
  tickHudTimer();
}

function pauseTimer() {
  if (!state.timerRunning) return;
  state.timerBaseMs += performance.now() - state.timerStartPerf;
  state.timerRunning = false;
  cancelAnimationFrame(hudRafId);
}

function tickHudTimer() {
  els.hudTimer.textContent = formatMs(getCurrentRawMs());
  if (state.timerRunning) {
    hudRafId = requestAnimationFrame(tickHudTimer);
  }
}

function renderProgressStrip() {
  if (!els.progressStrip) return;
  els.progressStrip.innerHTML = LEVELS.map((lv, i) => {
    const cls = i < state.currentIdx
      ? `prog-seg done ch${lv.chapter}`
      : (i === state.currentIdx ? 'prog-seg active' : 'prog-seg');
    return `<span class="${cls}"></span>`;
  }).join('');
}

function guardAvatarSVG(mood) {
  const faceColor = mood === 'roast' ? '#FFC2C9' : (mood === 'warn' ? '#FFE8B8' : '#FFE4C4');
  let eyes = '<rect x="10" y="16" width="7" height="4.5" rx="1.5" fill="#18191C"/><rect x="19" y="16" width="7" height="4.5" rx="1.5" fill="#18191C"/><line x1="17" y1="18" x2="19" y2="18" stroke="#18191C" stroke-width="1.6"/>';
  let mouth = '<path d="M14.5 25 Q18 27 21.5 25" stroke="#18191C" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
  let extra = '';

  if (mood === 'warn') {
    eyes = '<circle cx="13.5" cy="18.5" r="2.2" fill="#18191C"/><circle cx="22.5" cy="18.5" r="2.2" fill="#18191C"/>';
    mouth = '<ellipse cx="18" cy="25.5" rx="2.6" ry="2" fill="#18191C"/>';
    extra = '<path d="M27.5 14 Q29.5 17 27.5 19 Q25.5 17 27.5 14 Z" fill="#00AEEC"/>';
  } else if (mood === 'roast') {
    eyes = '<path d="M10.5 16 L16 19 M25.5 16 L20 19" stroke="#18191C" stroke-width="2" stroke-linecap="round"/><circle cx="13.5" cy="20" r="1.7" fill="#18191C"/><circle cx="22.5" cy="20" r="1.7" fill="#18191C"/>';
    mouth = '<path d="M13.5 26.5 Q18 22.5 22.5 26.5" stroke="#E0243C" stroke-width="2.1" fill="none" stroke-linecap="round"/>';
    extra = '<path d="M25 11 L27 13 M27 11 L25 13" stroke="#FF3B5C" stroke-width="1.8" stroke-linecap="round"/>';
  } else if (mood === 'win') {
    eyes = '<path d="M10.5 19 Q13.5 15.5 16.5 19 M19.5 19 Q22.5 15.5 25.5 19" stroke="#18191C" stroke-width="2" fill="none" stroke-linecap="round"/>';
    mouth = '<path d="M13.5 24 Q18 28.5 22.5 24" stroke="#008F5E" stroke-width="2" fill="none" stroke-linecap="round"/>';
  }

  return `
    <svg width="32" height="32" viewBox="0 0 36 36">
      <circle cx="18" cy="20" r="11.5" fill="${faceColor}" stroke="#18191C" stroke-width="2"/>
      <path d="M7 14 C8 7.5, 28 7.5, 29 14 Z" fill="#1E3A5F" stroke="#18191C" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="6" y="13" width="24" height="3.2" rx="1.6" fill="#0F172A"/>
      <circle cx="18" cy="10.2" r="2" fill="#FDE047"/>
      ${eyes}
      ${mouth}
      ${extra}
    </svg>
  `;
}

function updateHud() {
  const lvNum = Math.min(LEVELS.length, state.currentIdx + 1);
  els.hudLevel.textContent = `${String(lvNum).padStart(2, '0')}/${LEVELS.length}`;
  els.hudTimer.textContent = formatMs(getCurrentRawMs());

  const sus = Math.min(99.9, Math.round(state.rawSus));
  els.hudSus.textContent = `${sus}%`;
  if (els.hudSusFill) els.hudSusFill.style.width = `${sus}%`;
  els.hudSus.classList.remove('warn', 'danger');
  if (sus >= 65) {
    els.hudSus.classList.add('danger');
    els.body.dataset.heat = '2';
  } else if (sus >= 30) {
    els.hudSus.classList.add('warn');
    els.body.dataset.heat = '1';
  } else {
    els.body.dataset.heat = '0';
  }
  renderProgressStrip();
}

function setRoast(text, mood = 'info') {
  els.roastBar.dataset.mood = mood;
  els.roastIcon.innerHTML = guardAvatarSVG(mood);
  const speakers = {
    info: 'bCAPTCHA 保安',
    warn: '保安（警觉）',
    roast: '保安（红温嘲讽）',
    win: '保安（勉强认可）'
  };
  if (els.roastSpeaker) els.roastSpeaker.textContent = speakers[mood] || 'bCAPTCHA 保安';
  els.roastText.textContent = text;
}

function shakeCard() {
  els.gameCard.classList.remove('anim-shake', 'rage-border');
  void els.gameCard.offsetWidth;
  els.gameCard.classList.add('anim-shake', 'rage-border');
  setTimeout(() => els.gameCard.classList.remove('rage-border'), 480);
}

function glitchCard() {
  els.gameCard.classList.remove('anim-glitch');
  void els.gameCard.offsetWidth;
  els.gameCard.classList.add('anim-glitch');
}

function cleanupCurrentLevel() {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
  sound.stopAllLoops();
}

function updateSkipButton(levelId) {
  const fails = state.levelFails[levelId] || 0;
  if (fails >= 3) {
    els.btnSkip.classList.remove('hidden');
    els.encryptNote.classList.add('hidden');
  } else {
    els.btnSkip.classList.add('hidden');
    els.encryptNote.classList.remove('hidden');
  }
}

function loadLevel(idx) {
  cleanupCurrentLevel();
  if (idx >= LEVELS.length) {
    finishGame();
    return;
  }

  state.currentIdx = idx;
  levelSettled = false;
  const level = LEVELS[idx];

  // Reset UI shell & theme mood
  els.resultScreen.classList.add('hidden');
  els.gameCard.classList.remove('hidden', 'bsod-mode', 'terminal-mode');
  els.passFlash.classList.add('hidden');
  els.stage.className = 'stage' + (level.allowScroll ? ' allow-scroll' : '');
  els.stage.innerHTML = '';

  const mood = level.mood || 'normal';
  els.body.dataset.mood = mood;
  if (mood === 'bsod') {
    els.gameCard.classList.add('bsod-mode');
    glitchCard();
  } else if (mood === 'terminal') {
    els.gameCard.classList.add('terminal-mode');
  }

  els.levelTitle.textContent = level.title;
  els.levelPrompt.textContent = level.prompt;
  els.versionChip.textContent = level.chip || `CH.${level.chapter}`;
  els.versionChip.classList.toggle('boss', level.chip === 'BOSS');
  if (els.promptTag) {
    els.promptTag.textContent = level.chip === 'BOSS' ? 'BOSS' : (level.chip === 'FINAL' ? '终局' : '任务');
    els.promptTag.className = 'prompt-tag' + (level.chip === 'BOSS' ? ' boss' : (level.chip === 'FINAL' ? ' final' : ''));
  }
  els.brandOrg.textContent = level.org || '全网人机安全验证中心 · bCAPTCHA';
  setRoast(level.initialRoast || '请按提示证明你是碳基生物。', 'info');
  updateSkipButton(level.id);
  updateHud();
  if (els.dbgSelect) els.dbgSelect.value = String(idx);

  // Scoped lifecycle tracker for leak-free unmount
  const rafs = new Set();
  const timeouts = new Set();
  const intervals = new Set();
  const listeners = [];
  let customUnmount = null;

  const ctx = {
    stageEl: els.stage,
    audio: sound,
    startTimer: () => startTimer(),
    roast: (text, moodArg = 'info') => setRoast(text, moodArg),
    setFlag: (k, v) => { state.flags[k] = v; },
    getFlag: (k) => state.flags[k],
    shake: () => shakeCard(),
    glitch: () => glitchCard(),
    fail: (susDelta = 5, reason = '操作失误，硅基嫌疑上升！', extraMs = 0) => {
      if (levelSettled) return;
      if (!state.started) startTimer();
      state.rawSus = Math.min(99.9, state.rawSus + susDelta);
      state.totalFails += 1;
      state.levelFails[level.id] = (state.levelFails[level.id] || 0) + 1;
      if (extraMs > 0) state.extraPenaltyMs += extraMs;
      sound.fail();
      shakeCard();
      setRoast(reason, 'roast');
      updateSkipButton(level.id);
      updateHud();
    },
    pass: (opts = {}) => {
      if (levelSettled) return;
      levelSettled = true;
      if (!state.started) startTimer();
      cleanupCurrentLevel();

      if (level.id === LEVELS.length) {
        sound.fanfare();
        launchConfetti();
        setRoast(opts.msg || '欢迎回到人类世界。', 'win');
        setTimeout(() => finishGame(), 900);
        return;
      }

      sound.pass();
      setRoast(opts.msg || '验证通过，继续下一关！', 'win');
      els.passFlashMsg.textContent = opts.msg || '人类行为已确认';
      els.passFlash.classList.remove('hidden');

      setTimeout(() => {
        els.passFlash.classList.add('hidden');
        advanceAfterLevel(idx);
      }, state.fastMode ? 240 : 520);
    },
    raf: (fn) => {
      const id = requestAnimationFrame((ts) => {
        rafs.delete(id);
        fn(ts);
      });
      rafs.add(id);
      return id;
    },
    timeout: (fn, ms) => {
      const id = setTimeout(() => {
        timeouts.delete(id);
        fn();
      }, ms);
      timeouts.add(id);
      return id;
    },
    interval: (fn, ms) => {
      const id = setInterval(fn, ms);
      intervals.add(id);
      return id;
    },
    on: (target, event, handler, options) => {
      target.addEventListener(event, handler, options);
      listeners.push({ target, event, handler, options });
    },
    onUnmount: (fn) => {
      customUnmount = fn;
    }
  };

  activeCleanup = () => {
    rafs.forEach((id) => cancelAnimationFrame(id));
    timeouts.forEach((id) => clearTimeout(id));
    intervals.forEach((id) => clearInterval(id));
    listeners.forEach(({ target, event, handler, options }) => {
      target.removeEventListener(event, handler, options);
    });
    if (customUnmount) {
      try { customUnmount(); } catch (_) {}
    }
  };

  level.mount(ctx);
}

function advanceAfterLevel(completedIdx) {
  const nextIdx = completedIdx + 1;
  if (nextIdx >= LEVELS.length) {
    finishGame();
    return;
  }
  const prevChapter = LEVELS[completedIdx].chapter;
  const nextChapter = LEVELS[nextIdx].chapter;

  if (!state.fastMode && nextChapter !== prevChapter && CHAPTERS[nextChapter]) {
    showChapterInterlude(CHAPTERS[nextChapter], () => loadLevel(nextIdx));
  } else {
    loadLevel(nextIdx);
  }
}

function showChapterInterlude(ch, onDone) {
  pauseTimer();
  els.chapterTag.textContent = ch.tag;
  els.chapterName.textContent = ch.name;
  els.chapterDesc.textContent = ch.desc;
  els.chapterOverlay.classList.remove('hidden');

  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    clearTimeout(autoTimer);
    els.chapterOverlay.removeEventListener('click', done);
    els.chapterOverlay.classList.add('hidden');
    startTimer();
    onDone();
  };
  const autoTimer = setTimeout(done, 1900);
  els.chapterOverlay.addEventListener('click', done);
}

function skipCurrentLevel() {
  if (levelSettled) return;
  levelSettled = true;
  if (!state.started) startTimer();
  cleanupCurrentLevel();

  state.skipCount += 1;
  state.rawSus = Math.min(99.9, state.rawSus + 15);
  sound.click();
  showToast('🤖 已走人机通道跳过：罚时 +30s，硅基浓度 +15%');
  updateHud();
  advanceAfterLevel(state.currentIdx);
}

function finishGame(isMockPreview = false) {
  cleanupCurrentLevel();
  pauseTimer();
  els.body.dataset.mood = 'cert';
  els.gameCard.classList.add('hidden');
  els.resultScreen.classList.remove('hidden');

  const runSnapshot = isMockPreview
    ? {
        rawMs: 92180,
        skipCount: 0,
        totalFails: 3,
        rawSus: 14,
        levelFails: { 6: 2, 17: 1 },
        flags: { stoppedTrain: true, godTiming: true, trolleyChoice: 'fav' }
      }
    : {
        rawMs: getCurrentRawMs(),
        skipCount: state.skipCount,
        totalFails: state.totalFails,
        rawSus: state.rawSus,
        levelFails: state.levelFails,
        flags: state.flags
      };

  const ev = evaluateRun(runSnapshot, LEVELS);
  state.lastEval = ev;

  const savedName = toySDK.getPlayerName();
  els.playerNameInput.value = savedName;
  els.resultSub.textContent = `评级【${ev.grade} · ${ev.gradeLabel}】｜称号「${ev.title}」`;
  renderCertImage(savedName);

  if (!isMockPreview) {
    toySDK.recordCompletion({
      effectiveMs: ev.effectiveMs,
      purity: ev.humanPurity,
      title: ev.title,
      badges: ev.subBadges
    });
  }
}

function renderCertImage(name) {
  if (!state.lastEval) return;
  const dataUrl = renderCertificateDataURL(state.lastEval, name);
  state.lastCertUrl = dataUrl;
  els.certImage.src = dataUrl;
}

function resetGame(fastMode = false) {
  cleanupCurrentLevel();
  pauseTimer();
  stopConfetti();
  state.started = false;
  state.fastMode = fastMode;
  state.currentIdx = 0;
  state.timerBaseMs = 0;
  state.timerStartPerf = 0;
  state.extraPenaltyMs = 0;
  state.rawSus = 0;
  state.skipCount = 0;
  state.totalFails = 0;
  state.levelFails = {};
  state.flags = {};
  updateHud();
  loadLevel(0);
  if (fastMode) showToast('⚡ 已进入速通极简模式：跳过章节过场！');
}

/* ==========================================================================
   Leaderboard Modal
   ========================================================================== */
async function openLeaderboard(manual = false) {
  els.rankModal.classList.remove('hidden');
  els.rankStatus.classList.add('hidden');
  els.rankList.innerHTML = '<div style="text-align:center;padding:24px;color:#8E96A4;font-size:13px;">正在读取人类速通榜...</div>';

  const res = await toySDK.fetchLeaderboard({ manual });
  els.rankSourceNote.textContent = res.isMock
    ? '本地演示周榜 · 上线 Toy 后自动对接全站'
    : 'Bilibili Toy 全站周榜 · 同分先到先赢';

  if (res.rateLimited) {
    els.rankStatus.textContent = `⚠️ ${res.message}`;
    els.rankStatus.classList.remove('hidden');
  } else if (res.cooldownSec) {
    els.rankStatus.textContent = `⏳ 刷新太快啦，请 ${res.cooldownSec} 秒后再试（已展示缓存）`;
    els.rankStatus.classList.remove('hidden');
  } else if (!res.ok && res.message) {
    els.rankStatus.textContent = res.message;
    els.rankStatus.classList.remove('hidden');
  }

  const items = res.items || [];
  if (!items.length) {
    els.rankList.innerHTML = '<div style="text-align:center;padding:24px;color:#8E96A4;font-size:13px;">暂无通关人类，快来抢占第 1 名！</div>';
  } else {
    els.rankList.innerHTML = items.map((item, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${item.rank || idx + 1}`;
      const topCls = idx < 3 ? ` top-${idx + 1}` : '';
      return `
        <div class="rank-item${topCls} ${item.isMe ? 'is-me' : ''}">
          <span class="rank-pos">${medal}</span>
          <span class="rank-name">${escapeHtml(item.name)}${item.isMe ? ' (我)' : ''}</span>
          <span class="rank-time">${formatMs(item.effectiveMs)}</span>
        </div>
      `;
    }).join('');
  }

  const best = toySDK.saveData.bestEffectiveMs;
  els.rankMyBar.textContent = best != null
    ? `我的历史最佳有效耗时：${formatMs(best)}（累计通关 ${toySDK.saveData.clearCount} 次）`
    : '完成全部 20 关即可上榜，祝你好运！';
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

/* ==========================================================================
   Lightweight Confetti Celebration
   ========================================================================== */
function launchConfetti() {
  const c = els.confettiCanvas;
  c.classList.remove('hidden');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = window.innerWidth * dpr;
  c.height = window.innerHeight * dpr;
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);

  const colors = ['#00AEEC', '#FB7299', '#00B578', '#FF9F1C', '#FF3B5C', '#FFF4B8'];
  const pieces = Array.from({ length: 72 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * 140,
    vx: (Math.random() - 0.5) * 3.5,
    vy: 2.2 + Math.random() * 4.2,
    w: 7 + Math.random() * 6,
    h: 10 + Math.random() * 6,
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.2,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));

  const start = performance.now();
  const loop = (now) => {
    const elapsed = now - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (elapsed < 3200) {
      confettiRafId = requestAnimationFrame(loop);
    } else {
      stopConfetti();
    }
  };
  confettiRafId = requestAnimationFrame(loop);
}

function stopConfetti() {
  cancelAnimationFrame(confettiRafId);
  els.confettiCanvas.classList.add('hidden');
}

/* ==========================================================================
   4-Skin Theme Switcher (gadget | cyber | pop | editorial)
   ========================================================================== */
const SKIN_KEY = 'bcaptcha_skin_v1';
const SKIN_LABELS = {
  gadget: '📟 实体掌机 · 人类检测仪',
  cyber: '⚡ 赛博高能暗黑特工',
  pop: '💥 高饱和漫画波普潮玩',
  editorial: '◻️ 极致极简 Neal.fun 大片'
};

function applySkin(skinName, announce = false) {
  const valid = SKIN_LABELS[skinName] ? skinName : 'gadget';
  els.body.dataset.skin = valid;
  if (els.skinBar) {
    els.skinBar.querySelectorAll('.skin-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.skin === valid);
    });
  }
  try { localStorage.setItem(SKIN_KEY, valid); } catch (_) {}
  if (announce) {
    sound.click();
    showToast(`已切换：${SKIN_LABELS[valid]}`);
  }
}

/* ==========================================================================
   Event Wiring & Debug Toolbar
   ========================================================================== */
function setupBindings() {
  // Restore persisted or URL-specified skin (?skin=cyber|pop|editorial|gadget)
  const urlSkin = new URLSearchParams(window.location.search).get('skin');
  let initialSkin = urlSkin;
  if (!initialSkin) {
    try { initialSkin = localStorage.getItem(SKIN_KEY); } catch (_) {}
  }
  applySkin(initialSkin || 'gadget', false);

  if (els.skinBar) {
    els.skinBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.skin-btn');
      if (!btn) return;
      applySkin(btn.dataset.skin, true);
    });
  }

  els.btnMute.addEventListener('click', () => {
    const muted = sound.toggleMute();
    els.btnMute.textContent = muted ? '🔇' : '🔊';
    showToast(muted ? '已静音' : '音效已开启');
  });

  els.btnRank.addEventListener('click', () => {
    sound.click();
    openLeaderboard(false);
  });
  els.btnResultRank.addEventListener('click', () => {
    sound.click();
    openLeaderboard(false);
  });
  els.btnCloseRank.addEventListener('click', () => els.rankModal.classList.add('hidden'));
  els.rankModal.addEventListener('click', (e) => {
    if (e.target === els.rankModal) els.rankModal.classList.add('hidden');
  });
  els.btnRefreshRank.addEventListener('click', () => openLeaderboard(true));

  els.btnSkip.addEventListener('click', () => skipCurrentLevel());

  els.btnRenameCert.addEventListener('click', () => {
    const name = els.playerNameInput.value.trim() || 'B站纯血人类';
    toySDK.setPlayerName(name);
    renderCertImage(name);
    sound.hammer();
    showToast('✅ 已重新加盖红章！');
  });

  els.btnCopyShare.addEventListener('click', async () => {
    if (!state.lastEval) return;
    const text = state.lastEval.shareCopy;
    try {
      await navigator.clipboard.writeText(text);
      showToast('📋 已复制！快去评论区晒你的纯度');
    } catch (_) {
      window.prompt('复制下方炫耀文案发到评论区：', text);
    }
    sound.click();
  });

  els.btnDownloadCert.addEventListener('click', () => {
    if (!state.lastCertUrl) return;
    const a = document.createElement('a');
    a.href = state.lastCertUrl;
    a.download = `2026人类纯度鉴定证书_${state.lastEval.grade}.png`;
    a.click();
    sound.click();
    showToast('💾 证书图片已开始下载');
  });

  els.btnReplay.addEventListener('click', () => {
    sound.click();
    resetGame(false);
  });
  els.btnFastReplay.addEventListener('click', () => {
    sound.click();
    resetGame(true);
  });

  // Pause timer cleanly when page goes background
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.timerRunning) {
      pauseTimer();
      state._wasRunningBeforeHide = true;
    } else if (!document.hidden && state._wasRunningBeforeHide && !els.gameCard.classList.contains('hidden')) {
      state._wasRunningBeforeHide = false;
      startTimer();
    }
  });

  // Debug toolbar
  const urlDebug = new URLSearchParams(window.location.search).get('debug');
  const debugEnabled = urlDebug === '1' || (DEFAULT_DEBUG && urlDebug !== '0');
  if (debugEnabled) {
    els.debugBar.classList.remove('hidden');
    els.debugBar.classList.add('collapsed');
    els.dbgSelect.innerHTML = LEVELS.map((lv, i) => `<option value="${i}">Lv.${lv.id} ${lv.title}</option>`).join('');
    els.dbgToggle.addEventListener('click', () => els.debugBar.classList.toggle('collapsed'));
    els.dbgSelect.addEventListener('change', () => {
      if (!state.started) startTimer();
      loadLevel(Number(els.dbgSelect.value));
    });
    els.dbgPrev.addEventListener('click', () => {
      if (!state.started) startTimer();
      loadLevel(Math.max(0, state.currentIdx - 1));
    });
    els.dbgNext.addEventListener('click', () => {
      if (!state.started) startTimer();
      loadLevel(Math.min(LEVELS.length - 1, state.currentIdx + 1));
    });
    els.dbgCert.addEventListener('click', () => finishGame(true));
    els.dbg307.addEventListener('click', () => {
      toySDK.force307044 = !toySDK.force307044;
      showToast(toySDK.force307044 ? '🧪 已开启 307044 模拟限流' : '🧪 已关闭 307044 模拟');
      if (toySDK.force307044) openLeaderboard(true);
    });
  }
}

async function boot() {
  setupBindings();
  await toySDK.init();
  loadLevel(0);
}

boot();
