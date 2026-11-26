/**
 * Chapter 1 (Lv.1 - Lv.5): 冷静伪装 → 初次反转
 */

function svgWaterJug(label = '2L', color = '#00AEEC', danger = false) {
  return `
    <svg width="52" height="54" viewBox="0 0 52 54" aria-hidden="true">
      <rect x="19" y="3" width="14" height="7" rx="2" fill="${danger ? '#FF3B5C' : '#0077B6'}" stroke="#18191C" stroke-width="2.2"/>
      <path d="M16 11 H36 L42 18 V47 C42 50 40 51 37 51 H15 C12 51 10 50 10 47 V18 Z"
            fill="${color}" stroke="#18191C" stroke-width="2.4" stroke-linejoin="round"/>
      <rect x="13" y="23" width="26" height="16" rx="3" fill="#FFFFFF" stroke="#18191C" stroke-width="1.8"/>
      <text x="26" y="35" text-anchor="middle" font-size="${danger ? '11' : '11.5'}" font-weight="900" fill="${danger ? '#E0243C' : '#18191C'}">${label}</text>
      ${danger ? '<circle cx="38" cy="15" r="5" fill="#FF3B5C" stroke="#18191C" stroke-width="1.5"/>' : '<circle cx="19" cy="17" r="1.8" fill="#18191C"/><circle cx="33" cy="17" r="1.8" fill="#18191C"/>'}
    </svg>
  `;
}

function svgCup(color = '#D97706', emoji = '🧋') {
  return `
    <svg width="52" height="54" viewBox="0 0 52 54" aria-hidden="true">
      <line x1="30" y1="3" x2="26" y2="14" stroke="#18191C" stroke-width="3" stroke-linecap="round"/>
      <path d="M13 15 H39 L35 49 H17 Z" fill="${color}" stroke="#18191C" stroke-width="2.4" stroke-linejoin="round"/>
      <rect x="11" y="12" width="30" height="5" rx="2.5" fill="#FFFFFF" stroke="#18191C" stroke-width="2.2"/>
      <text x="26" y="37" text-anchor="middle" font-size="16">${emoji}</text>
    </svg>
  `;
}

export const CHAPTER1_LEVELS = [
  /* ========================================================================
     Lv.1 基础人机身份验证（逃跑复选框）
     ======================================================================== */
  {
    id: 1,
    chapter: 1,
    title: '基础人机身份验证',
    prompt: '勾选下方复选框，证明您不是爬虫或 AI',
    chip: 'v2026.11',
    initialRoast: '请配合完成基础核验，全程绝对不烧心。',
    mount(ctx) {
      const stage = ctx.stageEl;
      stage.innerHTML = `
        <div class="lv1-bar" id="lv1Bar">
          <div class="lv1-left">
            <div class="lv1-slot" id="lv1Slot" style="border-color:transparent;"></div>
            <span id="lv1Label" style="font-size:15px;font-weight:800;">我不是机器人</span>
          </div>
          <div style="text-align:right;line-height:1.1;">
            <div style="font-size:20px;">🛡️</div>
            <div style="font-size:9px;color:#8E96A4;font-family:var(--font-mono);">bCAPTCHA</div>
          </div>
        </div>
        <button class="lv1-runner" id="lv1Runner" type="button" aria-label="我不是机器人">
          <span class="lv1-box" id="lv1Box"></span>
          <svg id="lv1Legs" class="hidden" width="30" height="15" viewBox="0 0 30 15">
            <path d="M9 0 L4 12 L1 12 M21 0 L26 12 L29 12" stroke="#18191C" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      `;

      const bar = stage.querySelector('#lv1Bar');
      const slot = stage.querySelector('#lv1Slot');
      const label = stage.querySelector('#lv1Label');
      const runner = stage.querySelector('#lv1Runner');
      const box = stage.querySelector('#lv1Box');
      const legs = stage.querySelector('#lv1Legs');

      let catches = 0;
      let missClicks = 0;

      const placeAtSlot = () => {
        const sRect = stage.getBoundingClientRect();
        const slotRect = slot.getBoundingClientRect();
        const left = slotRect.left - sRect.left - stage.clientLeft - (runner.offsetWidth - slot.offsetWidth) / 2;
        const top = slotRect.top - sRect.top - stage.clientTop - 1;
        runner.style.left = `${left}px`;
        runner.style.top = `${top}px`;
      };
      // Position cleanly once rendered and whenever skin changes border width
      ctx.raf(placeAtSlot);
      ctx.on(window, 'resize', () => { if (catches === 0 || catches >= 3) placeAtSlot(); });
      const skinObs = new MutationObserver(() => { if (catches === 0 || catches >= 3) placeAtSlot(); });
      skinObs.observe(document.body, { attributes: true, attributeFilter: ['data-skin'] });
      ctx.onUnmount(() => skinObs.disconnect());

      ctx.on(stage, 'pointerdown', (e) => {
        if (e.target.closest('#lv1Runner')) return;
        if (catches > 0 && catches < 3) {
          missClicks++;
          if (missClicks >= 3) {
            ctx.roast('点那个长腿的框！别戳空气啊喂！', 'warn');
          }
        }
      });

      ctx.on(runner, 'pointerdown', (e) => {
        e.stopPropagation();
        ctx.startTimer();
        if (catches >= 3) return;
        catches += 1;

        const w = stage.clientWidth;
        const h = stage.clientHeight;

        if (catches === 1) {
          ctx.audio.dodge();
          slot.style.borderColor = '';
          slot.textContent = '空';
          label.textContent = '等等，它长腿跑了！';
          runner.classList.add('escaped');
          box.textContent = '•̀ᴗ•́';
          legs.classList.remove('hidden');
          runner.style.left = `${Math.max(16, w - 74)}px`;
          runner.style.top = `${Math.max(20, h - 76)}px`;
          ctx.roast('别看我，是复选框自己长腿跑路的！快抓住它！', 'warn');
        } else if (catches === 2) {
          ctx.audio.dodge();
          label.textContent = '它躲上面喘气去了 💦';
          box.textContent = '>_<';
          runner.style.left = `${Math.round(w * 0.56)}px`;
          runner.style.top = `14px`;
          ctx.roast('就差一下！它跑不动了，赶紧按住它！', 'warn');
        } else {
          runner.classList.remove('escaped');
          runner.classList.add('caught');
          legs.classList.add('hidden');
          box.textContent = '✓';
          label.textContent = '抓获成功！确实是活人';
          placeAtSlot();
          ctx.pass({ msg: '抓住了！至少手指比爬虫快' });
        }
      });
    }
  },

  /* ========================================================================
     Lv.2 强者喝大水（九宫格 + 叛变冰美式 + 84伪装）
     ======================================================================== */
  {
    id: 2,
    chapter: 1,
    title: '九宫格：强者喝大水',
    prompt: '请选出所有真正的【2L 纯净大水】（弱者才喝小甜水）',
    initialRoast: '擦亮眼睛，有些东西长得像大水，喝了可会烧心。',
    mount(ctx) {
      const stage = ctx.stageEl;
      const items = [
        { id: 'w1', kind: 'water', label: '2L 纯净大水', svg: svgWaterJug('2L', '#38BDF8') },
        { id: 'w2', kind: 'water', label: '山泉大桶水', svg: svgWaterJug('大水', '#00AEEC') },
        { id: 'w3', kind: 'water', label: '强者专供水', svg: svgWaterJug('1.5L', '#22D3EE') },
        { id: 'traitor', kind: 'traitor', label: '2L 冰爽大水', svg: svgWaterJug('2L', '#60A5FA'), flipped: false },
        { id: 'bleach', kind: 'bleach', label: '84消毒液', svg: svgWaterJug('84', '#93C5FD', true) },
        { id: 'd1', kind: 'drink', label: '珍珠奶茶', svg: svgCup('#EAB308', '🧋') },
        { id: 'd2', kind: 'drink', label: '肥宅快乐水', svg: svgCup('#EF4444', '🥤') },
        { id: 'd3', kind: 'drink', label: '生椰拿铁', svg: svgCup('#A16207', '☕') },
        { id: 'd4', kind: 'drink', label: '秋天糖水', svg: svgCup('#FB7299', '🍓') }
      ];

      // Fisher-Yates shuffle
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }

      const selected = new Set();
      let clickSteps = 0;

      stage.innerHTML = `
        <div class="grid-3x3" id="lv2Grid"></div>
        <button class="btn-primary" id="lv2Submit" type="button" style="width:100%;margin-top:12px;">
          确认提交验证
        </button>
      `;

      const grid = stage.querySelector('#lv2Grid');
      const submitBtn = stage.querySelector('#lv2Submit');

      const triggerTraitorFlip = () => {
        const traitor = items.find((x) => x.id === 'traitor');
        if (!traitor || traitor.flipped) return;
        traitor.flipped = true;
        traitor.kind = 'drink';
        traitor.label = '冰美式(去冰)';
        traitor.svg = svgCup('#78350F', '🧊');
        ctx.audio.dodge();
        renderGrid('traitor');
        ctx.roast('👀 咦？刚才是不是有一桶大水偷偷叛变了？', 'warn');
      };

      const renderGrid = (justFlippedId = null) => {
        grid.innerHTML = items.map((it) => `
          <button type="button" class="grid-tile ${selected.has(it.id) ? 'selected' : ''} ${justFlippedId === it.id ? 'flipped' : ''}" data-id="${it.id}">
            ${it.svg}
            <span class="grid-tile-label">${it.label}</span>
          </button>
        `).join('');
      };

      renderGrid();

      ctx.on(grid, 'click', (e) => {
        const tile = e.target.closest('.grid-tile');
        if (!tile) return;
        const id = tile.dataset.id;
        ctx.audio.click();
        if (selected.has(id)) selected.delete(id);
        else selected.add(id);
        clickSteps += 1;
        renderGrid();

        const traitor = items.find((x) => x.id === 'traitor');
        if (traitor && !traitor.flipped && (clickSteps >= 2 || id === 'traitor')) {
          ctx.timeout(triggerTraitorFlip, 260);
        }
      });

      ctx.on(submitBtn, 'click', () => {
        // Ensure traitor flips before evaluating if user somehow clicked fast
        const traitor = items.find((x) => x.id === 'traitor');
        if (traitor && !traitor.flipped) {
          triggerTraitorFlip();
          return;
        }
        if (selected.has('bleach')) {
          ctx.fail(8, '兄弟你连 84 消毒液都敢喝？胃是钛合金做的吧！');
          return;
        }
        if (selected.has('traitor')) {
          ctx.fail(6, '那桶偷偷翻面变冰美式了！AI 只认缓存不看图？');
          return;
        }
        const waterIds = items.filter((x) => x.kind === 'water').map((x) => x.id);
        const exact = selected.size === waterIds.length && waterIds.every((id) => selected.has(id));
        if (exact) {
          ctx.pass({ msg: '强者鉴定完毕！大水喝得不烧心！' });
        } else {
          ctx.fail(5, '漏了大水或者混进了小甜水，强者只喝纯净大水！');
        }
      });
    }
  },

  /* ========================================================================
     Lv.3 不听话的滑块（逃跑缺口 + 墙角反弹壁咚）
     ======================================================================== */
  {
    id: 3,
    chapter: 1,
    title: '不听话的拼图滑块',
    prompt: '拖动下方滑块，把拼图块精准送进缺口里',
    initialRoast: '保安提示：缺口有点社恐，你可以试试把它逼到墙角。',
    mount(ctx) {
      const stage = ctx.stageEl;
      stage.innerHTML = `
        <canvas class="stage-canvas" id="lv3Canvas" style="height:184px;"></canvas>
        <div class="slider-track" id="lv3Track">
          <span>向右拖动滑块拼合 →</span>
          <div class="slider-thumb" id="lv3Thumb">⇄</div>
        </div>
      `;

      const canvas = stage.querySelector('#lv3Canvas');
      const track = stage.querySelector('#lv3Track');
      const thumb = stage.querySelector('#lv3Thumb');

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = 340;
      const H = 184;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const c = canvas.getContext('2d');
      c.scale(dpr, dpr);

      let pieceX = 0.08;
      let holeX = 0.56;
      let holeVx = 0;
      let dragging = false;
      let bounceSparks = [];
      const pieceSize = 46;
      const pieceY = 68;

      const drawPuzzleShape = (xPx, yPx, fill, stroke) => {
        c.save();
        c.beginPath();
        const s = pieceSize;
        c.roundRect(xPx, yPx, s, s, 8);
        c.fillStyle = fill;
        c.fill();
        c.lineWidth = 2.5;
        c.strokeStyle = stroke;
        c.stroke();
        // Top ear nub
        c.beginPath();
        c.arc(xPx + s / 2, yPx, 8, Math.PI, 0);
        c.fill();
        c.stroke();
        c.restore();
      };

      const render = () => {
        // Physics for shy hole
        const dist = holeX - pieceX;
        if (dragging && dist > 0.01 && dist < 0.25 && holeVx >= -0.002) {
          holeVx += 0.0032;
        }
        holeX += holeVx;
        holeVx *= 0.92;

        // Bounce off walls!
        if (holeX > 0.84) {
          holeX = 0.84;
          if (holeVx > 0.005) {
            holeVx = -0.032;
            ctx.audio.hammer();
            for (let i = 0; i < 6; i++) {
              bounceSparks.push({
                x: W - 12,
                y: pieceY + pieceSize / 2,
                vx: -1.5 - Math.random() * 2.5,
                vy: (Math.random() - 0.5) * 4,
                life: 1
              });
            }
          }
        } else if (holeX < 0.14) {
          holeX = 0.14;
          holeVx = Math.abs(holeVx) * 0.6;
        }

        // Background landscape
        const grad = c.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#BAE6FD');
        grad.addColorStop(1, '#E0F2FE');
        c.fillStyle = grad;
        c.fillRect(0, 0, W, H);

        // Sun & hills
        c.fillStyle = '#FDE047';
        c.beginPath();
        c.arc(285, 38, 22, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = '#38BDF8';
        c.beginPath();
        c.moveTo(0, H);
        c.lineTo(90, 96);
        c.lineTo(190, H);
        c.fill();

        c.fillStyle = '#00AEEC';
        c.beginPath();
        c.moveTo(130, H);
        c.lineTo(240, 82);
        c.lineTo(W, H);
        c.fill();

        // Draw fleeing hole
        const hx = holeX * (W - pieceSize - 20) + 10;
        drawPuzzleShape(hx, pieceY, 'rgba(15, 23, 42, 0.52)', '#18191C');
        c.fillStyle = '#FFFFFF';
        c.font = 'bold 11px sans-serif';
        c.textAlign = 'center';
        c.fillText(Math.abs(holeVx) > 0.006 ? '别追我!' : '缺口', hx + pieceSize / 2, pieceY + 28);

        // Draw player puzzle piece
        const px = pieceX * (W - pieceSize - 20) + 10;
        drawPuzzleShape(px, pieceY, '#FFF4B8', '#18191C');
        c.fillStyle = '#18191C';
        c.font = '900 13px sans-serif';
        c.fillText('•‿•', px + pieceSize / 2, pieceY + 29);

        // Bounce sparks
        bounceSparks = bounceSparks.filter((p) => p.life > 0);
        bounceSparks.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.07;
          c.fillStyle = `rgba(255, 59, 92, ${p.life})`;
          c.fillRect(p.x, p.y, 5, 5);
        });

        ctx.raf(render);
      };

      const syncThumb = () => {
        const maxLeft = Math.max(1, track.clientWidth - thumb.clientWidth - 8);
        const norm = Math.max(0, Math.min(1, (pieceX - 0.08) / 0.76));
        thumb.style.left = `${4 + norm * maxLeft}px`;
      };

      const onMove = (e) => {
        if (!dragging) return;
        const rect = track.getBoundingClientRect();
        const maxLeft = Math.max(1, rect.width - thumb.clientWidth - 8);
        const rel = Math.max(0, Math.min(maxLeft, e.clientX - rect.left - thumb.clientWidth / 2));
        pieceX = 0.08 + (rel / maxLeft) * 0.76;
        syncThumb();
      };

      const onUp = () => {
        if (!dragging) return;
        dragging = false;
        if (Math.abs(pieceX - holeX) <= 0.075) {
          pieceX = holeX;
          syncThumb();
          ctx.pass({ msg: '墙角壁咚成功！严丝合缝！' });
        } else {
          pieceX = 0.08;
          syncThumb();
          ctx.fail(5, '差一点！把它撞到最右边反弹回来再迎面卡住！');
        }
      };

      ctx.on(thumb, 'pointerdown', (e) => {
        dragging = true;
        thumb.setPointerCapture(e.pointerId);
        ctx.audio.click();
      });
      ctx.on(window, 'pointermove', onMove);
      ctx.on(window, 'pointerup', onUp);
      ctx.on(window, 'pointercancel', onUp);

      syncThumb();
      ctx.raf(render);
    }
  },

  /* ========================================================================
     Lv.4 阅读并同意用户协议（无限滚动 + 隐蔽正文机关）
     ======================================================================== */
  {
    id: 4,
    chapter: 1,
    allowScroll: true,
    title: '阅读并同意用户协议',
    prompt: '请将下方协议拉至最底端，阅读完毕后点击「同意」',
    initialRoast: '温馨提示：真正的人类到底会不会认真看协议呢？',
    mount(ctx) {
      const stage = ctx.stageEl;
      stage.innerHTML = `
        <div class="tos-box" id="tosBox">
          <p><strong>《2026 碳基生物联网安全协议（修订版）》</strong></p>
          <p>第 1 条：在使用本验证服务前，您应当完整阅读、充分理解并遵守本协议所列明的全部条款，切勿一目十行直接往下乱滑。</p>
          <p>第 2 条：本平台严格禁止任何未经授权的自动化脚本、爬虫程序、大语言模型以及来自三体星系的智子参与本次人类纯度测试。</p>
          <p>第 3 条：为保障良好体验，平台承诺全部验证环节均采用手工打磨，确保界面轻快流畅、用料扎实、童叟无欺。</p>
          <p>第 4 条：如果您在验证过程中出现心跳加速、血压升高、手抖拍桌或质疑人生等现象，均属于纯血碳基生物的正常生理反应。</p>
          <p>第 5 条：本协议最终解释权归刚刚在第 1 关长腿逃跑的那个复选框所有，任何针对该复选框的抓捕行为均不构成侵权。</p>
          <p>第 6 条：多喝 2L 纯净大水有益身体健康，少喝高糖小甜水有助于延缓发际线后移并提升本验证后续关卡的反应速度。</p>
          <p>第 7 条：顺便说一句，底部的滚动条其实是保安故意焊死的，根本拉不到 100%。如果您真的在认真逐行看字，直接点击这里的<span class="tos-secret" id="tosSecret">绝不烧心</span>四个字即可瞬间通过本关。</p>
          <p>第 8 条：如果您此时已经手速飞快直接划过了上面所有条款，请不要怀疑自己的拇指，这说明您完美继承了人类“绝不看用户协议”的传统美德。</p>
        </div>
        <button class="btn-disabled" id="tosAgree" type="button" style="width:100%;margin-top:10px;min-height:44px;border-radius:11px;font-size:14px;font-weight:800;">
          我已完整阅读并同意 (12%)
        </button>
      `;

      const box = stage.querySelector('#tosBox');
      const agree = stage.querySelector('#tosAgree');
      const secret = stage.querySelector('#tosSecret');

      let extraCount = 8;
      let progress = 12;
      const fillers = [
        '本条为凑字数专用条款，旨在测试您的手指耐力与屏幕滑动寿命。',
        '温馨提醒：您已经滑了这么久，怎么还没发现进度条涨得越来越慢？',
        '据统计，99.8% 的人类根本不认真看前 8 条到底写了什么。',
        '别往下滑了兄弟，滚动条真的拉不到底，往上翻翻仔细读字吧！',
        '保安已经笑得直不起腰了，您还在坚持往下划拉呢？'
      ];

      ctx.on(box, 'scroll', () => {
        const ratio = (box.scrollTop + box.clientHeight) / box.scrollHeight;
        if (ratio > 0.78 && extraCount < 60) {
          for (let k = 0; k < 3; k++) {
            extraCount += 1;
            const p = document.createElement('p');
            p.textContent = `第 ${extraCount} 条：${fillers[extraCount % fillers.length]}`;
            box.appendChild(p);
          }
          if (progress < 98) progress = Math.min(98, progress + 18);
          else if (progress < 99.9) progress = Number((progress + 0.3).toFixed(1));
          else progress = Number((99.9 + (extraCount % 9) * 0.01).toFixed(2));
          agree.textContent = `我已完整阅读并同意 (${Math.min(99.99, progress)}%)`;

          if (extraCount >= 20) {
            ctx.roast('真打算滑到宇宙尽头？停下来认真读一读前面几条条款吧！', 'warn');
          }
        }
      });

      ctx.on(agree, 'click', () => {
        ctx.fail(4, '按钮都是灰的还硬点？不如静下心认真读读协议正文！');
      });

      ctx.on(secret, 'click', () => {
        ctx.pass({ msg: '居然真把协议读完了！确实绝不烧心！' });
      });
    }
  },

  /* ========================================================================
     Lv.5 盲停 5.00 秒（2.5s 贴纸遮罩 + ±0.02s 外挂彩蛋）
     ======================================================================== */
  {
    id: 5,
    chapter: 1,
    title: '人类心算：盲停 5.00 秒',
    prompt: '点击开始计时，在正好 5.00 秒时按下停止（误差 ±0.35s 合格）',
    initialRoast: '友情提示：太慢像卡顿，太准（±0.02s）像脚本！',
    mount(ctx) {
      const stage = ctx.stageEl;
      stage.innerHTML = `
        <div class="blind-clock-wrap" id="lv5Wrap">
          <div class="blind-clock-num tabular" id="lv5Num">0.00 s</div>
          <div id="lv5Sub" style="font-size:12px;color:#94A3B8;margin-top:4px;">目标区间：4.65s ~ 5.35s</div>
          <div class="blind-mask hidden" id="lv5Mask">
            <div>🚧 广告位招租 🚧</div>
            <div style="font-size:12px;margin-top:4px;">数字已屏蔽，请靠人类灵魂默数！</div>
          </div>
        </div>
        <button class="btn-primary" id="lv5Btn" type="button" style="width:100%;margin-top:16px;min-height:52px;font-size:16px;">
          ▶ 开始计时
        </button>
      `;

      const numEl = stage.querySelector('#lv5Num');
      const subEl = stage.querySelector('#lv5Sub');
      const maskEl = stage.querySelector('#lv5Mask');
      const btn = stage.querySelector('#lv5Btn');

      let running = false;
      let startPerf = 0;
      let masked = false;
      let godHits = 0;

      const loop = () => {
        if (!running) return;
        const sec = (performance.now() - startPerf) / 1000;
        if (!masked && sec >= 2.5) {
          masked = true;
          maskEl.classList.remove('hidden');
          ctx.audio.slapTable();
          ctx.roast('哈哈！2.50 秒自动贴纸遮挡，靠心算停在 5 秒吧！', 'warn');
        }
        if (!masked) {
          numEl.textContent = `${sec.toFixed(2)} s`;
        }
        if (sec >= 9.5) {
          running = false;
          maskEl.classList.add('hidden');
          numEl.textContent = `${sec.toFixed(2)} s`;
          btn.textContent = '🔄 重新挑战';
          btn.className = 'btn-primary';
          ctx.fail(6, '都快 10 秒了你睡着了吗？请重新计时！');
          return;
        }
        ctx.raf(loop);
      };

      ctx.on(btn, 'click', () => {
        if (!running) {
          running = true;
          masked = false;
          startPerf = performance.now();
          maskEl.classList.add('hidden');
          numEl.textContent = '0.00 s';
          subEl.textContent = '心里默数到 5.00 秒按下停止！';
          btn.textContent = '⏹ 立即停止！';
          btn.className = 'btn-danger';
          ctx.audio.click();
          ctx.raf(loop);
        } else {
          running = false;
          const sec = (performance.now() - startPerf) / 1000;
          const diff = sec - 5.0;
          const absDiff = Math.abs(diff);
          maskEl.classList.add('hidden');
          numEl.textContent = `${sec.toFixed(2)} s`;
          subEl.textContent = `误差：${diff >= 0 ? '+' : ''}${diff.toFixed(2)} 秒`;
          btn.textContent = '🔄 再试一次';
          btn.className = 'btn-primary';

          if (absDiff <= 0.025) {
            godHits += 1;
            ctx.setFlag('godTiming', true);
            if (godHits === 1) {
              ctx.fail(3, `停在 ${sec.toFixed(2)}s？！手稳得像脚本外挂！请故意手抖点重来！`);
            } else {
              ctx.pass({ msg: `连停两次 ${sec.toFixed(2)}s！人形原子钟我服了！` });
            }
          } else if (absDiff <= 0.35) {
            ctx.pass({ msg: `停在 ${sec.toFixed(2)}s！完美的人类误差！` });
          } else {
            ctx.fail(6, `停在 ${sec.toFixed(2)}s（偏差 ${diff >= 0 ? '+' : ''}${diff.toFixed(2)}s），你数的是火星秒吧？`);
          }
        }
      });
    }
  }
];
