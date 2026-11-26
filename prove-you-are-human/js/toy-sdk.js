/**
 * Bilibili Toy SDK Adapter with Local Fallback & 307044 Rate-Limit Guard
 *
 * Follows bilibili/toy official best practices:
 * - Single merged cloud storage key; never write on every click.
 * - Save cooldown >= 10s (unless final settlement).
 * - Leaderboard cached locally for 60s; manual refresh has 10s cooldown; zero polling.
 * - Idempotent submitScore only when personal best improves.
 */

const STORAGE_KEY = 'bcaptcha_2026_v1';
const LOCAL_RANK_KEY = 'bcaptcha_2026_mock_ranks_v1';
const SAVE_COOLDOWN_MS = 10000;
const RANK_CACHE_MS = 60000;
const RANK_REFRESH_COOLDOWN_MS = 10000;
const MAX_SCORE_BASE = 10000000;

const DEFAULT_MOCK_RANKS = [
  { name: '徒手按停火车的神', effectiveMs: 74820, title: '碳基速通战神' },
  { name: '纯血大水猛男', effectiveMs: 88340, title: '碳基速通战神' },
  { name: '人间圆规精99%', effectiveMs: 102490, title: '人间圆规精' },
  { name: '绝不烧心老哥', effectiveMs: 118910, title: 'B站收藏夹守护神' },
  { name: '手稳得像脚本', effectiveMs: 135260, title: '手稳得像脚本' },
  { name: '蚊子一生之敌', effectiveMs: 158740, title: '蚊子的一生之敌' },
  { name: '红按钮终结者', effectiveMs: 184120, title: '红按钮终结者' },
  { name: '硅基卧底007', effectiveMs: 249600, title: '天网派来的潜伏者' }
];

function detectHostSDK() {
  if (typeof window === 'undefined') return null;
  if (window.toy && typeof window.toy.getCloudStorage === 'function') return window.toy;
  if (window.biliToy && typeof window.biliToy.getCloudStorage === 'function') return window.biliToy;
  if (window.studio && window.studio.sdk && window.studio.sdk.toy) return window.studio.sdk.toy;
  return null;
}

function isRateLimitError(err) {
  if (!err) return false;
  const code = err.code ?? err.status ?? err.errno;
  const msg = String(err.message || err);
  return Number(code) === 307044 || msg.includes('307044') || msg.includes('频繁');
}

export function msToRankScore(effectiveMs) {
  return Math.max(1, Math.round(MAX_SCORE_BASE - Math.max(0, effectiveMs)));
}

export function rankScoreToMs(score) {
  return Math.max(0, MAX_SCORE_BASE - Number(score || 0));
}

class ToySDKAdapter {
  constructor() {
    this.host = detectHostSDK();
    this.isMock = !this.host;
    this.force307044 = false;

    this.saveData = {
      v: 1,
      playerName: 'B站纯血人类',
      bestEffectiveMs: null,
      bestPurity: 0,
      clearCount: 0,
      badges: []
    };

    this.dirty = false;
    this.lastSaveAt = 0;
    this.lastSubmittedScore = 0;
    this.rankCache = null;
    this.rankCachedAt = 0;
    this.lastManualRefreshAt = 0;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.dirty) {
        this.flushSave(false);
      }
    });
  }

  async init() {
    try {
      const raw = await this._readRawStorage();
      if (raw && typeof raw === 'object') {
        this.saveData = { ...this.saveData, ...raw };
        if (this.saveData.bestEffectiveMs != null) {
          this.lastSubmittedScore = msToRankScore(this.saveData.bestEffectiveMs);
        }
      }
    } catch (_) {
      // Gracefully keep defaults
    }
    return this.saveData;
  }

  getPlayerName() {
    return this.saveData.playerName || 'B站纯血人类';
  }

  setPlayerName(name) {
    const clean = String(name || '').trim().slice(0, 14) || 'B站纯血人类';
    this.saveData.playerName = clean;
    this.dirty = true;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.saveData));
    } catch (_) {}
  }

  recordCompletion({ effectiveMs, purity, title, badges = [] }) {
    this.saveData.clearCount = (this.saveData.clearCount || 0) + 1;
    if (purity > (this.saveData.bestPurity || 0)) {
      this.saveData.bestPurity = purity;
    }
    const merged = new Set([...(this.saveData.badges || []), ...badges]);
    this.saveData.badges = Array.from(merged).slice(0, 20);

    const improved = this.saveData.bestEffectiveMs == null || effectiveMs < this.saveData.bestEffectiveMs;
    if (improved) {
      this.saveData.bestEffectiveMs = effectiveMs;
    }
    this.dirty = true;

    // Update local mock board for instant offline verification
    if (this.isMock) {
      this._upsertMockRank(this.getPlayerName(), effectiveMs, title);
    }

    // Flush save & idempotently submit score
    const p1 = this.flushSave(true);
    const p2 = improved ? this.submitBestTime(effectiveMs) : Promise.resolve({ ok: true, skipped: true });
    return Promise.all([p1, p2]);
  }

  async flushSave(force = false) {
    const now = Date.now();
    if (!this.dirty) return { ok: true, skipped: true };
    if (!force && now - this.lastSaveAt < SAVE_COOLDOWN_MS) {
      return { ok: true, throttled: true };
    }
    this.lastSaveAt = now;
    this.dirty = false;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.saveData));
    } catch (_) {}

    if (this.isMock) return { ok: true, mock: true };

    try {
      if (this.force307044) throw { code: 307044, message: '请求过于频繁，请稍后再试' };
      await this.host.setCloudStorage({ [STORAGE_KEY]: JSON.stringify(this.saveData) });
      return { ok: true };
    } catch (err) {
      if (isRateLimitError(err)) {
        this.dirty = true; // retry later
        return { ok: false, rateLimited: true, message: '存档排队中，稍后自动同步 (307044)' };
      }
      return { ok: false, message: '云存档暂不可用，已保存在本地' };
    }
  }

  async submitBestTime(effectiveMs) {
    const score = msToRankScore(effectiveMs);
    if (score <= this.lastSubmittedScore) {
      return { ok: true, skipped: true };
    }
    this.lastSubmittedScore = score;
    if (this.isMock) return { ok: true, mock: true, score };

    try {
      if (this.force307044) throw { code: 307044, message: '请求过于频繁，请稍后再试' };
      if (typeof this.host.submitScore === 'function') {
        await this.host.submitScore({ score });
      }
      return { ok: true, score };
    } catch (err) {
      if (isRateLimitError(err)) {
        return { ok: false, rateLimited: true, message: '榜单太火爆了，成绩提交限流中 (307044)' };
      }
      return { ok: false };
    }
  }

  async fetchLeaderboard({ manual = false } = {}) {
    const now = Date.now();

    if (this.force307044) {
      return {
        ok: false,
        rateLimited: true,
        message: '围观人类太多啦！触发频控保护 (307044)，请 10 秒后再刷新。',
        items: this.rankCache || this._loadMockRanks(),
        isMock: this.isMock
      };
    }

    if (manual) {
      const wait = RANK_REFRESH_COOLDOWN_MS - (now - this.lastManualRefreshAt);
      if (wait > 0 && this.rankCache) {
        return {
          ok: true,
          cooldownSec: Math.ceil(wait / 1000),
          items: this.rankCache,
          isMock: this.isMock
        };
      }
      this.lastManualRefreshAt = now;
    } else if (this.rankCache && now - this.rankCachedAt < RANK_CACHE_MS) {
      return { ok: true, cached: true, items: this.rankCache, isMock: this.isMock };
    }

    if (this.isMock) {
      const items = this._loadMockRanks();
      this.rankCache = items;
      this.rankCachedAt = now;
      return { ok: true, items, isMock: true };
    }

    try {
      const res = await this.host.getRankList({ limit: 20 });
      const rawList = Array.isArray(res) ? res : (res && (res.list || res.items || [])) || [];
      const items = rawList.map((r, i) => ({
        rank: r.rank || i + 1,
        name: r.nickname || r.name || r.uname || `匿名人类#${i + 1}`,
        effectiveMs: r.score ? rankScoreToMs(r.score) : Number(r.effectiveMs || 180000),
        isMe: Boolean(r.isMe || r.self)
      }));
      this.rankCache = items;
      this.rankCachedAt = now;
      return { ok: true, items, isMock: false };
    } catch (err) {
      if (isRateLimitError(err)) {
        return {
          ok: false,
          rateLimited: true,
          message: '围观人类太多啦，请稍后再刷新榜单 (307044)',
          items: this.rankCache || this._loadMockRanks(),
          isMock: false
        };
      }
      return {
        ok: false,
        message: '暂无法连接周榜，显示本地记录',
        items: this._loadMockRanks(),
        isMock: true
      };
    }
  }

  async _readRawStorage() {
    if (!this.isMock && typeof this.host.getCloudStorage === 'function') {
      const data = await this.host.getCloudStorage([STORAGE_KEY]);
      const val = data && data[STORAGE_KEY];
      if (val) return typeof val === 'string' ? JSON.parse(val) : val;
    }
    const local = localStorage.getItem(STORAGE_KEY);
    return local ? JSON.parse(local) : null;
  }

  _loadMockRanks() {
    let list = DEFAULT_MOCK_RANKS.map((x) => ({ ...x, isMe: false }));
    try {
      const saved = localStorage.getItem(LOCAL_RANK_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) list = parsed;
      }
    } catch (_) {}
    list.sort((a, b) => a.effectiveMs - b.effectiveMs);
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }

  _upsertMockRank(name, effectiveMs, title) {
    const list = this._loadMockRanks().filter((x) => !x.isMe);
    list.push({ name, effectiveMs, title, isMe: true });
    list.sort((a, b) => a.effectiveMs - b.effectiveMs);
    const trimmed = list.slice(0, 15).map((item, idx) => ({ ...item, rank: idx + 1 }));
    this.rankCache = trimmed;
    this.rankCachedAt = Date.now();
    try {
      localStorage.setItem(LOCAL_RANK_KEY, JSON.stringify(trimmed));
    } catch (_) {}
  }
}

export const toySDK = new ToySDKAdapter();
