/**
 * Chapter 3 (Lv.11 - Lv.15): 规则叛变与精神污染
 */

export const CHAPTER3_LEVELS = [
  /* ========================================================================
     Lv.11 地狱密码（手机特调一键词块版 + 突发失火灭火）
     ======================================================================== */
  {
    id: 11,
    chapter: 3,
    title: '地狱密码设置器',
    prompt: '点击下方词块组合密码，满足所有实时弹出的离谱规则',
    initialRoast: '专治手机切输入法痛点：直接点下面词块拼密码就行！',
    mount(ctx) {
      const stage = ctx.stageEl;
      const tokens = ['2026', '不烧心', '喝大水', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '💧'];

      stage.innerHTML = `
        <div class="pwd-display">
          <span id="lv11Pwd" style="color:#18191C;flex:1;"></span>
          <span id="lv11Fire" class="hidden" style="font-size:20px;">🔥</span>
        </div>
        <div class="pwd-rules" id="lv11Rules"></div>
        <div class="pwd-keys" id="lv11Keys">
          ${tokens.map((t) => `<button type="button" class="pwd-key" data-tok="${t}">${t}</button>`).join('')}
          <button type="button" class="pwd-key" data-act="back" style="background:#FFF1F3;color:#E0243C;">⌫ 退格</button>
          <button type="button" class="pwd-key" data-act="clear" style="background:#F1F5F9;">清空</button>
        </div>
      `;

      const pwdEl = stage.querySelector('#lv11Pwd');
      const fireEl = stage.querySelector('#lv11Fire');
      const rulesEl = stage.querySelector('#lv11Rules');
      const keysEl = stage.querySelector('#lv11Keys');

      let parts = [];
      let unlockedStep = 1;
      let fireActive = false;
      let fireLeft = 5.0;
      let fireExtinguished = false;
      let fireTickId = null;

      const getPwd = () => parts.join('');
      const getDigitSum = (str) => (str.match(/\d/g) || []).reduce((acc, d) => acc + Number(d), 0);

      const stopFireTimer = () => {
        if (fireTickId) {
          clearInterval(fireTickId);
          fireTickId = null;
        }
      };

      const startFire = () => {
        if (fireActive || fireExtinguished) return;
        fireActive = true;
        fireLeft = 5.0;
        fireEl.classList.remove('hidden');
        ctx.audio.glitch();
        ctx.roast('🔥 糟糕！密码自燃了！5 秒内快点一滴水【💧】浇灭它！', 'warn');

        fireTickId = ctx.interval(() => {
          if (!fireActive) return;
          fireLeft = Math.max(0, fireLeft - 0.1);
          render();
          if (fireLeft <= 0) {
            fireActive = false;
            stopFireTimer();
            fireEl.classList.add('hidden');
            parts = [];
            unlockedStep = 4;
            ctx.fail(6, '眼睁睁看着密码烧成灰烬💨！下次着火记得秒按【💧】！');
            render();
          }
        }, 100);
      };

      const render = () => {
        const pwd = getPwd();
        pwdEl.textContent = pwd || '点击下方词块输入密码...';
        pwdEl.style.color = pwd ? '#18191C' : '#94A3B8';

        const r1 = pwd.length >= 6;
        const r2 = pwd.includes('2026');
        const r3 = pwd.includes('不烧心');
        const sum = getDigitSum(pwd);
        const r4 = sum === 15;

        if (r1 && unlockedStep < 2) unlockedStep = 2;
        if (r1 && r2 && unlockedStep < 3) unlockedStep = 3;
        if (r1 && r2 && r3 && unlockedStep < 4) unlockedStep = 4;

        if (r1 && r2 && r3 && r4 && !fireActive && !fireExtinguished) {
          unlockedStep = 5;
          startFire();
        }

        const list = [
          { ok: r1, text: `规则 1：密码长度至少 6 个字符（当前 ${pwd.length}）` },
          { ok: r2, text: '规则 2：必须包含今年年份【2026】' },
          { ok: r3, text: '规则 3：必须包含 2026 靠谱热词【不烧心】' },
          { ok: r4, text: `规则 4：所有数字之和必须正好等于 15（当前和：${sum} / 15）` },
          { ok: fireExtinguished, text: fireExtinguished ? '规则 5：火灾已扑灭！' : `规则 5：🔥 密码着火了！${fireLeft.toFixed(1)}s 内点【💧】灭火！` }
        ];

        rulesEl.innerHTML = list.slice(0, unlockedStep).map((r) => `
          <div class="pwd-rule ${r.ok ? 'ok' : ''}">${r.ok ? '✓' : '✕'} ${r.text}</div>
        `).join('');
      };

      ctx.on(keysEl, 'click', (e) => {
        const btn = e.target.closest('.pwd-key');
        if (!btn) return;
        const act = btn.dataset.act;
        const tok = btn.dataset.tok;
        ctx.audio.click();

        if (act === 'back') {
          parts.pop();
        } else if (act === 'clear') {
          parts = [];
        } else if (tok) {
          if (tok === '💧' && fireActive) {
            fireActive = false;
            fireExtinguished = true;
            stopFireTimer();
            fireEl.classList.add('hidden');
            parts.push('💧');
            render();
            ctx.pass({ msg: '消防意识满分！绝不烧心密码通过！' });
            return;
          }
          if (getPwd().length < 28) {
            parts.push(tok);
          }
        }
        render();
      });

      render();
    }
  },

  /* ========================================================================
     Lv.12 精神污染：流氓弹窗地狱（9层叠压 + 自动增殖 + 赖皮回滑 + 二段挽留杀毒键）
     ======================================================================== */
  {
    id: 12,
    chapter: 3,
    title: '精神污染：流氓弹窗地狱',
    prompt: '摆脱满屏流氓广告！（警告：假 × 会裂变，而且新广告还在不断弹出！）',
    initialRoast: '别乱点假关闭按钮！动动手指想想怎么把底下藏着的东西扒出来！',
    mount(ctx) {
      const stage = ctx.stageEl;
      stage.innerHTML = `
        <div style="width:100%;display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-bottom:6px;">
          <span id="lv12Count" style="color:#FF3B5C;">当前存活广告：6 个</span>
          <span style="color:#555C66;">💡 可拖到边缘甩飞</span>
        </div>
        <div id="lv12Arena" style="position:relative;width:100%;height:316px;border-radius:12px;background:#DCE3EE;overflow:hidden;border:1.5px solid #CBD5E1;">
          <button type="button" id="lv12ClearAll" class="btn-green comic-box" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;white-space:nowrap;font-size:14px;padding:12px 22px;box-shadow:0 0 0 4px rgba(0,181,120,0.22), 4px 4px 0 #18191C;">
            🧹 强制终结广告进程
          </button>
        </div>
      `;

      const countEl = stage.querySelector('#lv12Count');
      const arena = stage.querySelector('#lv12Arena');
      const clearAllBtn = stage.querySelector('#lv12ClearAll');

      const themes = [
        { bg: '#FF3B5C', title: '🔥 电子薯片买一送一', body: '越吃越爽！点右上角再送两包！' },
        { bg: '#FF9F1C', title: '🎁 恭喜获得 9999 硬币', body: '仅剩 0.1 秒失效，快点 × 放弃！' },
        { bg: '#00AEEC', title: '🛸 三体人邀您进群', body: '不要点 ×！不要点 ×！不要点 ×！' },
        { bg: '#FB7299', title: '💧 2L 大水尊享会员', body: '强者专属弹窗，拖走我还会滑回来~' },
        { bg: '#7C3AED', title: '⚡ 您的手机提速 900%', body: '检测到大量硅基垃圾，点 × 买一送二！' },
        { bg: '#DC2626', title: '🗡️ 屠龙宝刀点击就送', body: '是兄弟就来点我右上角假关闭！' },
        { bg: '#D97706', title: '📢 防沉迷延长助手', body: '点假 × 原地裂变，童叟无欺！' },
        { bg: '#0284C7', title: '🏆 恭喜第1亿位幸运人类', body: '跳过本弹窗将损失 100 万空气币！' }
      ];
      const realSpec = {
        bg: '#0F766E',
        title: '🛡️ 3600 极速清道夫',
        body: '（小字：我是真杀毒，点我右上角直接清屏）'
      };

      let zCounter = 5;
      let popups = [];
      let clearStage = 0; // 0 -> first tap (moves & begs), 1 -> confirmed win!
      let won = false;

      const updateCount = () => {
        countEl.textContent = `当前存活广告：${popups.length} 个`;
      };

      const spawnPopup = (spec, opts = {}) => {
        const { isReal = false, sticky = false, x = null, y = null, z = null } = opts;
        if (popups.length >= 10 || won) return;
        const arenaW = arena.clientWidth || 320;
        const maxX = Math.max(8, arenaW - 198);
        const maxY = Math.max(8, 316 - 92);
        const left = x != null ? x : Math.round(Math.random() * maxX);
        const top = y != null ? y : Math.round(Math.random() * maxY);

        const el = document.createElement('div');
        el.className = 'spam-popup';
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.zIndex = String(z != null ? z : ++zCounter);
        el.innerHTML = `
          <div class="spam-head" style="background:${spec.bg};">
            <span>${spec.title}</span>
            <button type="button" class="spam-x" aria-label="关闭">×</button>
          </div>
          <div class="spam-body" style="${isReal ? 'font-size:11px;color:#0F766E;' : ''}">${spec.body}</div>
        `;

        const item = { el, sticky, removed: false, dragging: false, homeX: arenaW / 2 - 98, homeY: 112 };
        popups.push(item);
        updateCount();

        const xBtn = el.querySelector('.spam-x');
        ctx.on(xBtn, 'pointerdown', (e) => {
          e.stopPropagation();
          if (won || item.removed) return;
          if (isReal) {
            won = true;
            ctx.pass({ msg: '居然在广告堆里挖出了唯一真杀毒 ×！火眼金睛！' });
          } else {
            ctx.fail(4, '点到假 × 了！买一送一原地裂变！把弹窗拖到边缘甩飞找底层杀毒键！');
            spawnPopup(themes[Math.floor(Math.random() * themes.length)]);
          }
        });

        let ox = 0;
        let oy = 0;
        ctx.on(el, 'pointerdown', (e) => {
          if (e.target.closest('.spam-x') || won || item.removed) return;
          item.dragging = true;
          el.setPointerCapture(e.pointerId);
          el.style.zIndex = String(++zCounter);
          el.style.transition = 'none';
          ox = e.clientX - el.offsetLeft;
          oy = e.clientY - el.offsetTop;
          ctx.audio.click();
        });
        ctx.on(el, 'pointermove', (e) => {
          if (!item.dragging || won || item.removed) return;
          el.style.left = `${e.clientX - ox}px`;
          el.style.top = `${e.clientY - oy}px`;
        });
        const endDrag = () => {
          if (!item.dragging || item.removed) return;
          item.dragging = false;

          // Fling/discard popup cleanly if dragged toward any edge!
          const curL = el.offsetLeft;
          const curT = el.offsetTop;
          const aw = arena.clientWidth || 320;
          if (curL < -90 || curL > aw - 90 || curT < -35 || curT > 265) {
            item.removed = true;
            popups = popups.filter((p) => p !== item);
            el.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
            el.style.transform = 'scale(0.6)';
            el.style.opacity = '0';
            ctx.audio.splat();
            ctx.timeout(() => el.remove(), 220);
            updateCount();
            return;
          }

          // Sticky rogue ad slowly creeps back toward center after 3s if left inside
          if (item.sticky && !won) {
            ctx.timeout(() => {
              if (item.dragging || item.removed || won) return;
              el.style.transition = 'left 1.8s ease, top 1.8s ease';
              el.style.left = `${item.homeX + (Math.random() - 0.5) * 32}px`;
              el.style.top = `${item.homeY + (Math.random() - 0.5) * 32}px`;
            }, 3000);
          }
        };
        ctx.on(el, 'pointerup', endDrag);
        ctx.on(el, 'pointercancel', endDrag);

        arena.appendChild(el);
      };

      // Place the real × slightly peeking near upper-left, and pile 5 rogue popups leaving a visible peek of the green kill-switch!
      spawnPopup(realSpec, { isReal: true, x: 16, y: 24, z: 5 });
      const centerPile = [
        [24, 96, true], [96, 134, false], [14, 152, false], [108, 66, false], [52, 46, false]
      ];
      centerPile.forEach(([px, py, sticky], i) => {
        spawnPopup(themes[i % themes.length], { isReal: false, sticky, x: px, y: py });
      });

      // Gently spawn 1 new ad every 5.5s (capped at 10) while still in stage 0
      ctx.interval(() => {
        if (won || clearStage > 0) return;
        if (popups.length < 10) {
          ctx.audio.dodge();
          spawnPopup(themes[Math.floor(Math.random() * themes.length)], { sticky: false });
        }
      }, 5500);

      // Buried green kill-switch requires 2 taps (classic rogue software "Are you sure?" dodge!)
      ctx.on(clearAllBtn, 'click', () => {
        if (won) return;
        if (clearStage === 0) {
          clearStage = 1;
          ctx.audio.dodge();
          const corners = [
            ['28%', '20%'], ['72%', '20%'], ['28%', '80%'], ['72%', '80%']
          ];
          const [cx, cy] = corners[Math.floor(Math.random() * corners.length)];
          clearAllBtn.style.left = cx;
          clearAllBtn.style.top = cy;
          clearAllBtn.style.zIndex = String(++zCounter + 5);
          clearAllBtn.textContent = '💥 确认彻底卸载！';
          clearAllBtn.className = 'btn-danger comic-box';
          ctx.roast('流氓弹窗挽留：“真的要卸载吗？”它跳到角落去了，快补一刀确认！', 'warn');
        } else {
          won = true;
          ctx.audio.slapTable();
          ctx.pass({ msg: '彻底卸载流氓全家桶！世界清净了！' });
        }
      });
    }
  },

  /* ========================================================================
     Lv.13 大脑过载：反色陷阱（5 题 20 秒规则突变）
     ======================================================================== */
  {
    id: 13,
    chapter: 3,
    title: '大脑过载：反色陷阱',
    prompt: '20 秒内连对 5 题，紧盯顶部指令——它随时会反着来！',
    initialRoast: '别光凭肌肉记忆乱点，看清顶部红字指令有没有反转！',
    mount(ctx) {
      const stage = ctx.stageEl;
      const DURATION = 20.0;
      const COLORS = [
        { key: 'red', label: '红', hex: '#FF3B5C' },
        { key: 'blue', label: '蓝', hex: '#00AEEC' },
        { key: 'green', label: '绿', hex: '#00B578' },
        { key: 'yellow', label: '黄', hex: '#EAB308' }
      ];

      stage.innerHTML = `
        <div style="width:100%;display:flex;justify-content:space-between;font-size:12.5px;font-weight:800;margin-bottom:8px;">
          <span id="lv13Prog">进度：1 / 5</span>
          <span class="tabular" id="lv13Time" style="color:#FF3B5C;">剩余 ${DURATION.toFixed(1)}s</span>
        </div>
        <div class="stroop-rule-banner" id="lv13Rule">指令：点击【字的颜色】</div>
        <div class="stroop-word" id="lv13Word">蓝</div>
        <div id="lv13Btns" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;"></div>
      `;

      const progEl = stage.querySelector('#lv13Prog');
      const timeEl = stage.querySelector('#lv13Time');
      const ruleEl = stage.querySelector('#lv13Rule');
      const wordEl = stage.querySelector('#lv13Word');
      const btnsEl = stage.querySelector('#lv13Btns');

      let step = 0;
      let timeLeft = DURATION;
      let current = null;
      let done = false;
      let lastTs = performance.now();

      const buildQuestion = () => {
        const wordItem = COLORS[Math.floor(Math.random() * COLORS.length)];
        const others = COLORS.filter((c) => c.key !== wordItem.key);
        const inkItem = others[Math.floor(Math.random() * others.length)];

        let mode = 'ink';
        let ruleText = '指令：点击【字的颜色】';
        let flipped = false;
        if (step === 2) {
          ruleText = '指令：还是点【字的颜色】（按钮顺序变啦）';
        } else if (step === 3) {
          mode = 'meaning';
          ruleText = '⚠️ 反转！点击【字的含义】！';
          flipped = true;
          ctx.audio.glitch();
        } else if (step === 4) {
          mode = 'neither';
          ruleText = '⚠️ 终极反转：点【既不是字色、也不是字义】的！';
          flipped = true;
          ctx.audio.glitch();
        }

        current = { wordKey: wordItem.key, inkKey: inkItem.key, mode };
        progEl.textContent = `进度：${step + 1} / 5`;
        ruleEl.textContent = ruleText;
        ruleEl.className = 'stroop-rule-banner' + (flipped ? ' flipped' : '');
        wordEl.textContent = wordItem.label;
        wordEl.style.color = inkItem.hex;

        const btnOrder = [...COLORS];
        if (step >= 2) {
          for (let i = btnOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [btnOrder[i], btnOrder[j]] = [btnOrder[j], btnOrder[i]];
          }
        }

        btnsEl.innerHTML = btnOrder.map((c) => `
          <button type="button" class="btn-outline" data-key="${c.key}" style="border-width:2px;font-size:15px;">
            <span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:${c.hex};"></span>
            ${c.label}色
          </button>
        `).join('');
      };

      const resetSprint = () => {
        step = 0;
        timeLeft = DURATION;
        buildQuestion();
      };

      ctx.on(btnsEl, 'click', (e) => {
        const b = e.target.closest('button[data-key]');
        if (!b || done) return;
        const pick = b.dataset.key;
        let ok = false;
        if (current.mode === 'ink') ok = pick === current.inkKey;
        else if (current.mode === 'meaning') ok = pick === current.wordKey;
        else ok = pick !== current.inkKey && pick !== current.wordKey;

        if (ok) {
          ctx.audio.click();
          step += 1;
          if (step >= 5) {
            done = true;
            ctx.pass({ msg: 'CPU 没烧干！多线程大脑认证！' });
          } else {
            buildQuestion();
          }
        } else {
          ctx.fail(6, '大脑打结了吧！仔细看顶部有没有反转指令，重来 5 题！');
          resetSprint();
        }
      });

      const loop = (now) => {
        if (done) return;
        const dt = Math.min(0.05, (now - lastTs) / 1000);
        lastTs = now;
        timeLeft = Math.max(0, timeLeft - dt);
        timeEl.textContent = `剩余 ${timeLeft.toFixed(1)}s`;
        if (timeLeft <= 0) {
          ctx.fail(6, '超时啦！你这处理延迟比 2G 网还高，再来！');
          resetSprint();
        }
        ctx.raf(loop);
      };

      buildQuestion();
      ctx.raf(loop);
    }
  },

  /* ========================================================================
     Lv.14 手画一个圆（无辅助环 + 10s一笔 + 过半淡隐盲接 + 82%–94.9% 精准人味窗口）
     ======================================================================== */
  {
    id: 14,
    chapter: 3,
    title: '手艺验证：盲画标准圆',
    prompt: '10 秒内绕红点一笔徒手画大圆（82%–94.9% 过关，≥95% 判 AI！）',
    initialRoast: '已拆掉辅助参考线！画过半圈后轨迹会淡隐，靠肌肉记忆精准闭合！',
    mount(ctx) {
      const stage = ctx.stageEl;
      stage.innerHTML = `
        <div style="width:100%;display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:800;color:#555C66;">合格区：<span style="color:#00B578;">82.0%–94.9%</span> · <span style="color:#FF3B5C;">≥95% 判AI</span></span>
          <span class="tabular" id="lv14Score" style="font-size:22px;font-weight:900;color:#18191C;">0.0%</span>
        </div>
        <canvas class="stage-canvas" id="lv14Canvas" style="height:270px;cursor:crosshair;"></canvas>
      `;

      const scoreEl = stage.querySelector('#lv14Score');
      const canvas = stage.querySelector('#lv14Canvas');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = 340;
      const H = 270;
      const cx = W / 2;
      const cy = H / 2;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const c = canvas.getContext('2d');
      c.scale(dpr, dpr);

      let drawing = false;
      let strokeStart = 0;
      let pts = [];
      let perfectHits = 0;
      let showFullAfterEnd = false;

      ctx.onUnmount(() => ctx.audio.stopDrawTone());

      const computeMetrics = (points) => {
        if (points.length < 14) return { score: 0, meanR: 0, sweep: 0, gapRatio: 1 };
        let sumR = 0;
        const rs = points.map((p) => {
          const r = Math.hypot(p.x - cx, p.y - cy);
          sumR += r;
          return r;
        });
        const meanR = sumR / rs.length;
        let variance = 0;
        let maxDev = 0;
        for (let i = 0; i < rs.length; i++) {
          const d = Math.abs(rs[i] - meanR);
          variance += d * d;
          if (d > maxDev) maxDev = d;
        }
        const std = Math.sqrt(variance / rs.length);

        let sweep = 0;
        let prevAng = Math.atan2(points[0].y - cy, points[0].x - cx);
        for (let i = 1; i < points.length; i++) {
          const ang = Math.atan2(points[i].y - cy, points[i].x - cx);
          let d = ang - prevAng;
          if (d > Math.PI) d -= Math.PI * 2;
          if (d < -Math.PI) d += Math.PI * 2;
          sweep += d;
          prevAng = ang;
        }

        const first = points[0];
        const last = points[points.length - 1];
        const gapRatio = meanR > 1 ? Math.hypot(last.x - first.x, last.y - first.y) / meanR : 1;

        const cv = meanR > 1 ? std / meanR : 1;
        const maxRatio = meanR > 1 ? maxDev / meanR : 1;
        // Strict human freehand circularity metric
        const rawScore = 100 * (1 - cv * 2.7 - Math.max(0, maxRatio - 0.1) * 0.55);
        const score = Math.max(0, Math.min(99.9, rawScore));
        return { score, meanR, sweep: Math.abs(sweep), gapRatio };
      };

      const redraw = () => {
        c.fillStyle = '#FFFFFF';
        c.fillRect(0, 0, W, H);

        // No tracing rings! Just a subtle minimum-radius warning dot-ring around center
        c.strokeStyle = 'rgba(255, 59, 92, 0.16)';
        c.setLineDash([4, 4]);
        c.lineWidth = 1.2;
        c.beginPath();
        c.arc(cx, cy, 52, 0, Math.PI * 2);
        c.stroke();
        c.setLineDash([]);

        // Center red dot
        c.fillStyle = '#FF3B5C';
        c.beginPath();
        c.arc(cx, cy, 5.5, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#94A3B8';
        c.font = '700 10px sans-serif';
        c.textAlign = 'center';
        c.fillText('请画在红圈外', cx, cy + 20);

        if (pts.length > 1) {
          const { meanR, sweep } = computeMetrics(pts);
          const fadeTrail = drawing && !showFullAfterEnd && sweep > Math.PI;
          c.lineCap = 'round';
          c.lineJoin = 'round';
          c.lineWidth = 4.2;
          for (let i = 1; i < pts.length; i++) {
            const r = Math.hypot(pts[i].x - cx, pts[i].y - cy);
            const err = meanR > 1 ? Math.abs(r - meanR) / meanR : 0.5;
            const alpha = fadeTrail && i < pts.length - 10 ? 0.14 : 1;
            const rgb = err < 0.055 ? '0,181,120' : (err < 0.12 ? '255,159,28' : '255,59,92');
            c.strokeStyle = `rgba(${rgb}, ${alpha})`;
            c.beginPath();
            c.moveTo(pts[i - 1].x, pts[i - 1].y);
            c.lineTo(pts[i].x, pts[i].y);
            c.stroke();
          }
        }
      };

      const toLocal = (e) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: ((e.clientX - rect.left) / rect.width) * W,
          y: ((e.clientY - rect.top) / rect.height) * H
        };
      };

      ctx.on(canvas, 'pointerdown', (e) => {
        drawing = true;
        showFullAfterEnd = false;
        strokeStart = performance.now();
        canvas.setPointerCapture(e.pointerId);
        pts = [toLocal(e)];
        scoreEl.textContent = '0.0%';
        scoreEl.style.color = '#18191C';
        ctx.audio.startDrawTone();
        redraw();
      });

      ctx.on(canvas, 'pointermove', (e) => {
        if (!drawing) return;
        const p = toLocal(e);
        const last = pts[pts.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) >= 3) {
          pts.push(p);
          const { score } = computeMetrics(pts);
          scoreEl.textContent = `${score.toFixed(1)}%`;
          scoreEl.style.color = score >= 95 ? '#FF3B5C' : (score >= 82 ? '#00B578' : '#18191C');
          ctx.audio.updateDrawTone(score);
          redraw();
        }
      });

      const finishStroke = () => {
        if (!drawing) return;
        drawing = false;
        showFullAfterEnd = true;
        ctx.audio.stopDrawTone();
        redraw();

        const elapsed = (performance.now() - strokeStart) / 1000;
        const { score, meanR, sweep, gapRatio } = computeMetrics(pts);
        scoreEl.textContent = `${score.toFixed(1)}%`;

        if (pts.length < 24 || sweep < Math.PI * 1.82) {
          ctx.fail(5, '圈都没画满一整圈！请一气呵成首尾闭合！');
          return;
        }
        if (meanR < 55) {
          ctx.fail(5, '别在红圈里转小拇指作弊！请画在虚线红圈外！');
          return;
        }
        if (elapsed > 10.0) {
          ctx.fail(5, `画了 ${elapsed.toFixed(1)} 秒太慢了！是在拿圆规比划吗？10 秒内一气呵成！`);
          return;
        }
        if (gapRatio > 0.34) {
          ctx.fail(5, '头尾没接上漏气啦！收尾要精准闭合！');
          return;
        }
        if (score >= 95.0) {
          perfectHits += 1;
          ctx.setFlag('perfectCircle', true);
          if (perfectHits === 1) {
            ctx.fail(4, `圆度 ${score.toFixed(1)}%？！圆得像圆规外挂！请故意手抖画到 82%–94.9%！`);
          } else {
            ctx.pass({ msg: `徒手盲接还能连续 ${score.toFixed(1)}%！达芬奇转世请进！` });
          }
        } else if (score >= 82.0) {
          ctx.pass({ msg: `盲画圆度 ${score.toFixed(1)}%（${elapsed.toFixed(1)}s）！神级手感！` });
        } else {
          ctx.fail(5, `圆度仅 ${score.toFixed(1)}%（需 82.0%–94.9%），你画的是土豆还是地瓜？`);
        }
      };

      ctx.on(window, 'pointerup', finishStroke);
      ctx.on(window, 'pointercancel', finishStroke);
      redraw();
    }
  },

  /* ========================================================================
     Lv.15 系统已崩溃！（假蓝屏：把红色回滚条向左撕回 0% 或点右上 🔧）
     ======================================================================== */
  {
    id: 15,
    chapter: 3,
    mood: 'bsod',
    org: 'CRITICAL_SYSTEM_FAULT',
    chip: '0x2026',
    title: '验证服务器已崩溃',
    prompt: '检测到未知碳基干扰，正在清空您的 14 关记录并回滚至第 1 关...',
    initialRoast: '系统正在强制回滚进度……真的要乖乖点下面重头再来吗？',
    mount(ctx) {
      const stage = ctx.stageEl;
      ctx.audio.glitch();

      stage.innerHTML = `
        <div style="width:100%;color:#FFFFFF;font-family:var(--font-mono);display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <span style="font-size:52px;font-weight:900;line-height:1;">:(</span>
            <button type="button" id="lv15Wrench" title="极客维护模式"
              style="width:40px;height:40px;border-radius:10px;border:1.5px solid rgba(0,255,157,0.65);background:rgba(0,181,120,0.22);color:#00FF9D;font-size:18px;cursor:pointer;">
              🔧
            </button>
          </div>
          <div style="font-size:13px;line-height:1.6;">
            bCAPTCHA 内核已宕机，将在 <strong id="lv15Sec" style="color:#FDE047;font-size:16px;">8.0</strong> 秒后强制回滚至 Lv.1。
          </div>

          <!-- Draggable Rollback Progress Bar -->
          <div id="lv15BarBox" style="background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.28);border-radius:12px;padding:12px;touch-action:none;cursor:grab;">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;">
              <span>← 按住红条往左撕回 0%</span>
              <span id="lv15Pct" style="color:#FF8599;font-weight:900;">46%</span>
            </div>
            <div id="lv15Track" style="width:100%;height:20px;background:rgba(0,0,0,0.35);border-radius:999px;overflow:hidden;position:relative;">
              <div id="lv15Fill" style="height:100%;width:46%;background:#FF3B5C;border-radius:999px;"></div>
            </div>
          </div>

          <button type="button" id="lv15Trap" style="width:100%;min-height:46px;border-radius:10px;border:none;background:#FFFFFF;color:#0A2472;font-weight:900;font-size:14px;cursor:pointer;">
            立刻返回第 1 关重做
          </button>
        </div>
      `;

      const secEl = stage.querySelector('#lv15Sec');
      const pctEl = stage.querySelector('#lv15Pct');
      const fillEl = stage.querySelector('#lv15Fill');
      const barBox = stage.querySelector('#lv15BarBox');
      const track = stage.querySelector('#lv15Track');
      const trapBtn = stage.querySelector('#lv15Trap');
      const wrenchBtn = stage.querySelector('#lv15Wrench');

      let secLeft = 8.0;
      let pct = 46;
      let dragging = false;
      let done = false;
      let lastTs = performance.now();

      ctx.on(trapBtn, 'click', () => {
        if (done) return;
        ctx.setFlag('bsodTricked', true);
        ctx.fail(6, '哈哈哈骗你的！真老实！不踢回第1关，罚你 +4 秒！试试把红条往左拖回去！', 4000);
      });

      ctx.on(wrenchBtn, 'click', () => {
        if (done) return;
        done = true;
        ctx.glitch();
        ctx.pass({ msg: '🔧 极客强行重启成功！直接撕碎假蓝屏！' });
      });

      const updateByClientX = (clientX) => {
        const rect = track.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        pct = ratio * 100;
        fillEl.style.width = `${pct.toFixed(1)}%`;
        pctEl.textContent = `${Math.round(pct)}%`;
        if (pct <= 6) {
          done = true;
          ctx.glitch();
          ctx.pass({ msg: '徒手把蓝屏进度条撕回 0%！太硬核了！' });
        }
      };

      ctx.on(barBox, 'pointerdown', (e) => {
        dragging = true;
        barBox.setPointerCapture(e.pointerId);
        updateByClientX(e.clientX);
      });
      ctx.on(window, 'pointermove', (e) => {
        if (!dragging || done) return;
        updateByClientX(e.clientX);
      });
      ctx.on(window, 'pointerup', () => { dragging = false; });

      const loop = (now) => {
        if (done) return;
        const dt = Math.min(0.05, (now - lastTs) / 1000);
        lastTs = now;

        if (!dragging) {
          secLeft = Math.max(0.01, secLeft - dt);
          pct = Math.min(99.9, pct + dt * 5.8);
        }
        secEl.textContent = secLeft.toFixed(1);
        fillEl.style.width = `${pct.toFixed(1)}%`;
        pctEl.textContent = `${pct >= 99.5 ? '99.9' : Math.round(pct)}%`;

        if (secLeft <= 0.02) {
          ctx.roast('倒计时卡死在 0.01s 了！快把红色进度条往左拉回 0%，或点右上角 🔧！', 'warn');
        }
        ctx.raf(loop);
      };

      ctx.raf(loop);
    }
  }
];
