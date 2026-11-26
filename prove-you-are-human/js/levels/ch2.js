/**
 * Chapter 2 (Lv.6 - Lv.10): 物理失控与感官整活
 */

export const CHAPTER2_LEVELS = [
  /* ========================================================================
     Lv.6 拍死这只蚊子（地狱3连拍：极速蛇皮 → 墙灰假动作 → 凌晨3点关灯突袭）
     ======================================================================== */
  {
    id: 6,
    chapter: 2,
    title: '拍死这三只蚊子',
    prompt: '听声辨位连拍 3 只越来越贱的蚊子：只在真正落停静音的瞬间拍！',
    initialRoast: '落地停顿只有半秒且不再送红圈，第 2 只会骗拍，第 3 只更缺德！',
    mount(ctx) {
      const stage = ctx.stageEl;
      stage.innerHTML = `
        <div style="width:100%;display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-bottom:6px;">
          <span id="lv6Prog" style="color:#008FC5;">击杀进度：0 / 3</span>
          <span id="lv6Phase" style="color:#555C66;">第一只 · 极速蛇皮</span>
        </div>
        <canvas class="stage-canvas" id="lv6Canvas" style="height:260px;cursor:crosshair;"></canvas>
        <div id="lv6Cue" style="margin-top:8px;font-size:12.5px;font-weight:800;color:#555C66;">
          🔊 嗡嗡嗡——别硬拍，等声音骤停！
        </div>
      `;

      const progEl = stage.querySelector('#lv6Prog');
      const phaseEl = stage.querySelector('#lv6Phase');
      const canvas = stage.querySelector('#lv6Canvas');
      const cue = stage.querySelector('#lv6Cue');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = 340;
      const H = 260;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const c = canvas.getContext('2d');
      c.scale(dpr, dpr);

      let kills = 0;
      let mx = W / 2;
      let my = H / 2;
      let vx = 4.2;
      let vy = 3.2;
      let mode = 'fly'; // 'fly' | 'feint' | 'land'
      let stateTimer = 1.4;
      let zigTimer = 0.3;
      let missCount = 0;
      let darkRoom = false;
      let flashSpots = []; // brief phone-screen light spots in dark mode
      let splats = [];
      let smudges = [];
      let popTexts = [];
      let done = false;
      let lastTs = performance.now();

      const phaseCfg = () => {
        if (kills === 0) return { speed: 5.4, landSec: 0.62, hitR: 28, hasFeint: false };
        if (kills === 1) return { speed: 6.4, landSec: 0.56, hitR: 26, hasFeint: true };
        return { speed: 6.9, landSec: 0.58, hitR: 30, hasFeint: true };
      };

      const spawnNextMosquito = () => {
        mx = 40 + Math.random() * (W - 80);
        my = 40 + Math.random() * (H - 80);
        mode = 'fly';
        stateTimer = 1.1 + Math.random() * 0.9;
        ctx.audio.setMosquitoAudible(true, 0.35 + kills * 0.25);
        progEl.textContent = `击杀进度：${kills} / 3`;

        if (kills === 1) {
          phaseEl.textContent = '第二只 · 假动作+墙灰干扰';
          phaseEl.style.color = '#D97706';
          smudges = Array.from({ length: 4 }, () => ({
            x: 36 + Math.random() * (W - 72),
            y: 36 + Math.random() * (H - 72),
            rot: Math.random() * Math.PI
          }));
          ctx.roast('注意！墙上混进了污渍，这只还会半空假停骗你空拍！', 'warn');
        } else if (kills === 2) {
          darkRoom = true;
          phaseEl.textContent = '第三只 · 凌晨 3 点关灯！';
          phaseEl.style.color = '#FF3B5C';
          ctx.audio.click();
          ctx.roast('啪嗒！室友把灯关了！靠声音骤停 + 暗处红点一巴掌拍死它！', 'warn');
        }
      };

      ctx.audio.startMosquito();
      ctx.onUnmount(() => ctx.audio.stopMosquito());

      const drawSplat = (s) => {
        c.save();
        c.translate(s.x, s.y);
        c.fillStyle = darkRoom ? 'rgba(0, 181, 120, 0.45)' : '#00B578';
        c.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const r = i % 2 === 0 ? 15 : 7;
          c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        c.closePath();
        c.fill();
        c.restore();
      };

      const drawMosquito = (x, y, flap) => {
        c.save();
        c.translate(x, y);

        if (darkRoom) {
          // Barely visible in the dark while flying; glowing blood-belly pinpoint when landed!
          c.globalAlpha = mode === 'land' ? 0.92 : 0.2;
          if (mode === 'land') {
            c.fillStyle = 'rgba(255, 59, 92, 0.35)';
            c.beginPath();
            c.arc(0, 3, 12, 0, Math.PI * 2);
            c.fill();
          }
        }

        const wingAngle = mode === 'land' ? 0.25 : Math.sin(flap * 1.4) * 0.72;
        c.fillStyle = darkRoom ? 'rgba(226, 232, 240, 0.65)' : 'rgba(203, 213, 225, 0.85)';
        c.strokeStyle = darkRoom ? '#E2E8F0' : '#18191C';
        c.lineWidth = 1.4;
        [-1, 1].forEach((dir) => {
          c.save();
          c.rotate(dir * (0.38 + wingAngle));
          c.beginPath();
          c.ellipse(dir * 10, -3, 9.5, 3.8, 0, 0, Math.PI * 2);
          c.fill();
          c.stroke();
          c.restore();
        });

        c.fillStyle = darkRoom ? (mode === 'land' ? '#FF3B5C' : '#CBD5E1') : '#18191C';
        c.beginPath();
        c.ellipse(0, 2, 3.8, 8.5, 0, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.moveTo(0, -6);
        c.lineTo(0, -14);
        c.strokeStyle = darkRoom ? '#E2E8F0' : '#18191C';
        c.lineWidth = 1.5;
        c.stroke();

        if (mode === 'land') {
          c.fillStyle = '#FF3B5C';
          c.font = '900 10px sans-serif';
          c.textAlign = 'center';
          c.fillText('吸!', 0, -18);
        }
        c.restore();
      };

      const loop = (now) => {
        const dt = Math.min(0.05, (now - lastTs) / 1000);
        lastTs = now;
        const cfg = phaseCfg();

        if (!done) {
          stateTimer -= dt;
          if (stateTimer <= 0) {
            if (mode === 'fly') {
              // On phase 2+, 45% chance to do a sneaky feint hover with buzzing still ON!
              if (cfg.hasFeint && Math.random() < 0.45) {
                mode = 'feint';
                stateTimer = 0.28;
                ctx.audio.setMosquitoAudible(true, 0.7);
                cue.textContent = '🔊 嗡——（翅膀还在震！别上当！）';
                cue.style.color = '#D97706';
              } else {
                mode = 'land';
                stateTimer = cfg.landSec;
                ctx.audio.setMosquitoAudible(false);
                cue.textContent = '🤫 声音骤停！正在吸血，快拍！！';
                cue.style.color = '#FF3B5C';
              }
            } else {
              mode = 'fly';
              stateTimer = 1.2 + Math.random() * 0.9;
              ctx.audio.setMosquitoAudible(true, 0.35 + kills * 0.25);
              cue.textContent = darkRoom ? '🌑 漆黑一片：嗡嗡嗡——等它落地静音！' : '🔊 嗡嗡嗡——正在蛇皮走位...';
              cue.style.color = '#555C66';
            }
          }

          if (mode === 'fly') {
            zigTimer -= dt;
            if (zigTimer <= 0) {
              zigTimer = 0.22 + Math.random() * 0.26;
              const ang = Math.random() * Math.PI * 2;
              vx = Math.cos(ang) * cfg.speed;
              vy = Math.sin(ang) * cfg.speed;
            }
            mx += vx;
            my += vy;
            if (mx < 26 || mx > W - 26) vx = -vx;
            if (my < 26 || my > H - 26) vy = -vy;
            mx = Math.max(24, Math.min(W - 24, mx));
            my = Math.max(24, Math.min(H - 24, my));
          } else if (mode === 'feint') {
            mx += (Math.random() - 0.5) * 2.2;
            my += (Math.random() - 0.5) * 2.2;
          }
        }

        // Background: warm wall -> pitch-dark 3AM bedroom
        c.fillStyle = darkRoom ? '#0F172A' : '#FDFCF7';
        c.fillRect(0, 0, W, H);

        if (!darkRoom) {
          c.fillStyle = 'rgba(148, 163, 184, 0.14)';
          for (let gx = 16; gx < W; gx += 26) {
            for (let gy = 16; gy < H; gy += 26) c.fillRect(gx, gy, 2, 2);
          }
        } else {
          // Brief flashlight circles where player recently slapped
          flashSpots = flashSpots.filter((f) => f.life > 0);
          flashSpots.forEach((f) => {
            f.life -= dt * 1.4;
            const g = c.createRadialGradient(f.x, f.y, 4, f.x, f.y, 68);
            g.addColorStop(0, `rgba(255, 244, 184, ${0.32 * f.life})`);
            g.addColorStop(1, 'rgba(255, 244, 184, 0)');
            c.fillStyle = g;
            c.beginPath();
            c.arc(f.x, f.y, 68, 0, Math.PI * 2);
            c.fill();
          });
        }

        // Fake wall smudges (Phase 2+)
        smudges.forEach((sm) => {
          c.save();
          c.translate(sm.x, sm.y);
          c.rotate(sm.rot);
          c.fillStyle = darkRoom ? 'rgba(148, 163, 184, 0.18)' : 'rgba(24, 25, 28, 0.48)';
          c.beginPath();
          c.ellipse(0, 0, 3.2, 7.5, 0, 0, Math.PI * 2);
          c.fill();
          c.fillRect(-7, -1, 14, 1.5);
          c.restore();
        });

        splats.forEach(drawSplat);
        if (!done) drawMosquito(mx, my, now * 0.06);

        popTexts = popTexts.filter((p) => p.life > 0);
        popTexts.forEach((p) => {
          p.y -= 1.0;
          p.life -= 0.035;
          c.fillStyle = `rgba(255, 59, 92, ${p.life})`;
          c.font = '900 13.5px sans-serif';
          c.textAlign = 'center';
          c.fillText(p.text, p.x, p.y);
        });

        ctx.raf(loop);
      };

      ctx.on(canvas, 'pointerdown', (e) => {
        if (done) return;
        const rect = canvas.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * W;
        const py = ((e.clientY - rect.top) / rect.height) * H;
        const dist = Math.hypot(px - mx, py - my);
        const cfg = phaseCfg();

        if (darkRoom) {
          flashSpots.push({ x: px, y: py, life: 1 });
        }

        if (mode === 'land' && dist <= cfg.hitR) {
          ctx.audio.splat();
          splats.push({ x: mx, y: my });
          kills += 1;
          progEl.textContent = `击杀进度：${kills} / 3`;
          if (kills >= 3) {
            done = true;
            ctx.audio.stopMosquito();
            cue.textContent = '💥 三连超度！深夜蚊子清零！';
            cue.style.color = '#00B578';
            ctx.pass({ msg: '黑灯瞎火都能三连拍扁！绝世拍蚊宗师！' });
          } else {
            popTexts.push({ x: mx, y: my - 10, text: `超度 ${kills}/3!`, life: 1 });
            spawnNextMosquito();
          }
          return;
        }

        // Check if slapped a fake wall smudge
        const hitSmudge = smudges.some((sm) => Math.hypot(px - sm.x, py - sm.y) <= 20);
        ctx.audio.dodge();

        let missMsg = 'MISS!';
        if (mode === 'feint') {
          missMsg = '骗拍成功哈哈!';
          mx = px < W / 2 ? W - 40 : 40;
          my = py < H / 2 ? H - 40 : 40;
          mode = 'fly';
          stateTimer = 1.0;
        } else if (hitSmudge) {
          missMsg = '那是墙灰污渍!';
        } else if (mode === 'land') {
          missMsg = '拍歪了！惊飞了!';
          mode = 'fly';
          stateTimer = 1.2;
          ctx.audio.setMosquitoAudible(true, 0.5);
        } else if (dist <= 90) {
          mx = px < W / 2 ? W - 40 : 40;
          my = py < H / 2 ? H - 40 : 40;
          missMsg = '闪避+10086!';
        }

        popTexts.push({ x: px, y: py, text: missMsg, life: 1 });
        missCount += 1;
        if (missCount % 2 === 0) {
          ctx.fail(5, hitSmudge ? '那是墙上的陈年污渍，别对着墙瞎拍！' : '空挥两巴掌！声音没停就是假动作，等真正落地静音再拍！');
        }
      });

      ctx.raf(loop);
    }
  },

  /* ========================================================================
     Lv.7 紧急手摇充电（画圈/狂点双支持 + 80% 偷电弹窗）
     ======================================================================== */
  {
    id: 7,
    chapter: 2,
    title: '紧急手摇发电充电',
    prompt: '12 秒内疯狂转圈或连点发电机，把手机充到 100%！',
    initialRoast: '支持顺时针转圈手摇，也支持单指狂点！',
    mount(ctx) {
      const stage = ctx.stageEl;
      stage.innerHTML = `
        <div style="width:100%;display:flex;justify-content:space-between;font-size:12.5px;font-weight:800;margin-bottom:6px;">
          <span>⚡ 手摇应急充电</span>
          <span class="tabular" id="lv7Time" style="color:#FF3B5C;">剩余 12.0s</span>
        </div>
        <div class="battery-shell">
          <div class="battery-fill" id="lv7Fill" style="width:14%;"></div>
          <div class="battery-label tabular" id="lv7Pct">14%</div>
        </div>
        <div id="lv7Thieves" style="min-height:42px;width:100%;margin:10px 0;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;"></div>
        <div class="crank-wheel" id="lv7Wheel">
          <div style="font-size:11px;font-weight:900;color:#555C66;pointer-events:none;z-index:2;background:#FFF;padding:3px 6px;border-radius:6px;border:1.5px solid #18191C;">狂转 / 狂点</div>
          <div class="crank-arm" id="lv7Arm"><div class="crank-knob"></div></div>
        </div>
      `;

      const timeEl = stage.querySelector('#lv7Time');
      const fillEl = stage.querySelector('#lv7Fill');
      const pctEl = stage.querySelector('#lv7Pct');
      const thievesEl = stage.querySelector('#lv7Thieves');
      const wheel = stage.querySelector('#lv7Wheel');
      const arm = stage.querySelector('#lv7Arm');

      let charge = 15;
      let timeLeft = 12.0;
      let angle = 0;
      let thievesSpawned = false;
      let activeThieves = [];
      let dragging = false;
      let lastAngle = 0;
      let won = false;
      let lastTs = performance.now();

      const resetRun = () => {
        charge = 15;
        timeLeft = 12.0;
        thievesSpawned = false;
        activeThieves = [];
        thievesEl.innerHTML = '';
      };

      const renderThieves = () => {
        thievesEl.innerHTML = activeThieves.map((t) => `
          <button type="button" class="thief-chip" data-tid="${t.id}">✕ ${t.label}</button>
        `).join('');
      };

      const spawnThieves = () => {
        thievesSpawned = true;
        activeThieves = [
          { id: 't1', label: '短视频狂刷 -7%/s' },
          { id: 't2', label: '后台偷更新 -7%/s' },
          { id: 't3', label: '5G 满载 -7%/s' }
        ];
        renderThieves();
        ctx.audio.glitch();
        ctx.roast('🚨 警报！后台偷电大户上线疯狂掉电，快点掉红色弹窗！', 'warn');
      };

      const addCharge = (delta, deg) => {
        if (won) return;
        angle += deg;
        arm.style.transform = `rotate(${angle}deg)`;
        charge = Math.min(100, charge + delta);
        ctx.audio.crank(charge / 100);
        if (!thievesSpawned && charge >= 75) {
          spawnThieves();
        }
        if (charge >= 100) {
          won = true;
          fillEl.style.width = '100%';
          pctEl.textContent = '100% ⚡';
          ctx.pass({ msg: '麒麟臂发动！手机满血复活！' });
        }
      };

      ctx.on(thievesEl, 'click', (e) => {
        const chip = e.target.closest('.thief-chip');
        if (!chip) return;
        const tid = chip.dataset.tid;
        activeThieves = activeThieves.filter((t) => t.id !== tid);
        ctx.audio.splat();
        renderThieves();
        if (activeThieves.length === 0) {
          ctx.roast('漂亮！后台全清干净了，一鼓作气冲 100%！', 'info');
        }
      });

      const pointerAngle = (e) => {
        const r = wheel.getBoundingClientRect();
        return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
      };

      ctx.on(wheel, 'pointerdown', (e) => {
        dragging = true;
        wheel.setPointerCapture(e.pointerId);
        lastAngle = pointerAngle(e);
        // Also reward every tap directly for easy mobile play!
        addCharge(4.6, 38);
      });

      ctx.on(window, 'pointermove', (e) => {
        if (!dragging || won) return;
        const a = pointerAngle(e);
        let diff = a - lastAngle;
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        if (Math.abs(diff) > 0.22) {
          lastAngle = a;
          addCharge(Math.min(5.5, Math.abs(diff) * 3.8), (diff * 180) / Math.PI);
        }
      });

      ctx.on(window, 'pointerup', () => { dragging = false; });

      const loop = (now) => {
        if (won) return;
        const dt = Math.min(0.05, (now - lastTs) / 1000);
        lastTs = now;
        timeLeft = Math.max(0, timeLeft - dt);
        const drainPerSec = 5.5 + activeThieves.length * 7.2;
        charge = Math.max(0, charge - drainPerSec * dt);

        timeEl.textContent = `剩余 ${timeLeft.toFixed(1)}s`;
        fillEl.style.width = `${charge.toFixed(1)}%`;
        pctEl.textContent = `${Math.round(charge)}%`;

        if (timeLeft <= 0 || charge <= 0.1) {
          ctx.fail(6, activeThieves.length > 0 ? '先拍掉上面偷电的红弹窗再摇啊！' : '手机没电关机了！手速再快亿点！');
          resetRun();
        }
        ctx.raf(loop);
      };

      ctx.raf(loop);
    }
  },

  /* ========================================================================
     Lv.8 绝对别按红按钮（7 秒心理钓鱼大赏）
     ======================================================================== */
  {
    id: 8,
    chapter: 2,
    title: '自制力测试：别按红按钮',
    prompt: '证明你不是乱点脚本：接下来 7 秒内绝对不要碰红色按钮！',
    initialRoast: '很简单，把手从屏幕上拿开就行……你真的忍得住吗？',
    mount(ctx) {
      const stage = ctx.stageEl;
      stage.innerHTML = `
        <div class="tabular" id="lv8Timer" style="font-size:28px;font-weight:900;color:#18191C;margin-bottom:14px;">7.0 s</div>
        <div style="position:relative;display:flex;align-items:center;justify-content:center;width:240px;height:190px;">
          <button type="button" class="big-red-btn anim-pulse" id="lv8Btn">
            <span id="lv8BtnText">千万别按</span>
          </button>
          <!-- Fake expired dialog trap aligned right over button -->
          <div id="lv8FakeDialog" class="hidden comic-box" style="position:absolute;inset:8px;background:#FFFFFF;border-radius:14px;padding:12px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center;">
            <div style="font-size:13px;font-weight:900;color:#FF3B5C;">⚠️ 验证会话已超时</div>
            <div style="font-size:11.5px;color:#555C66;">为防止进度丢失，请立即点击下方恢复</div>
            <button type="button" id="lv8FakeBtn" class="btn-green" style="width:100%;min-height:42px;">立即恢复继续</button>
          </div>
          <!-- Realistic hair strand trap -->
          <svg id="lv8Hair" class="hidden" width="120" height="90" viewBox="0 0 120 90" style="position:absolute;pointer-events:none;z-index:5;">
            <path d="M18 68 C 44 52, 68 18, 102 30" stroke="#18191C" stroke-width="1.35" fill="none" stroke-linecap="round" opacity="0.88"/>
          </svg>
        </div>
        <div id="lv8Whisper" style="font-size:12px;color:#8E96A4;margin-top:8px;min-height:18px;"></div>
      `;

      const timerEl = stage.querySelector('#lv8Timer');
      const btn = stage.querySelector('#lv8Btn');
      const btnText = stage.querySelector('#lv8BtnText');
      const fakeDialog = stage.querySelector('#lv8FakeDialog');
      const fakeBtn = stage.querySelector('#lv8FakeBtn');
      const hair = stage.querySelector('#lv8Hair');
      const whisper = stage.querySelector('#lv8Whisper');

      let left = 7.0;
      let phase = 0;
      let done = false;
      let lastTs = performance.now();

      const reset = () => {
        left = 7.0;
        phase = 0;
        btn.classList.remove('gold-bait');
        btnText.textContent = '千万别按';
        fakeDialog.classList.add('hidden');
        hair.classList.add('hidden');
        whisper.textContent = '';
      };

      const failTrap = (msg) => {
        if (done) return;
        ctx.setFlag('pressedRedButton', true);
        ctx.fail(8, msg);
        reset();
      };

      ctx.on(btn, 'pointerdown', () => {
        if (phase === 1) failTrap('哈哈！20 秒就把你收买了？重来 7 秒！');
        else if (phase === 3) failTrap('那是画在屏幕上的假头发丝！擦什么擦！');
        else failTrap('叫你别按你还真按？人类叛逆基因觉醒了是吧！');
      });

      ctx.on(fakeBtn, 'pointerdown', () => {
        failTrap('换个绿色马甲你就不认识红按钮了？经典诈骗中招！');
      });

      const loop = (now) => {
        if (done) return;
        const dt = Math.min(0.05, (now - lastTs) / 1000);
        lastTs = now;
        left = Math.max(0, left - dt);
        timerEl.textContent = `${left.toFixed(1)} s`;

        if (left <= 5.2 && phase === 0) {
          phase = 1;
          btn.classList.add('gold-bait');
          btnText.textContent = '🎉 点我立减\n20 秒耗时!';
          whisper.textContent = '限时福利，不点亏大了...';
          ctx.audio.tick(false);
        } else if (left <= 3.5 && phase === 1) {
          phase = 2;
          btn.classList.remove('gold-bait');
          fakeDialog.classList.remove('hidden');
          whisper.textContent = '';
          ctx.audio.tick(true);
        } else if (left <= 1.8 && phase === 2) {
          phase = 3;
          fakeDialog.classList.add('hidden');
          btnText.textContent = '千万别按';
          hair.classList.remove('hidden');
          whisper.textContent = '咦？你屏幕上好像掉了一根头发，快擦掉~';
          ctx.audio.tick(true);
        }

        if (left <= 0) {
          done = true;
          ctx.pass({ msg: '钢铁自制力！所有心理陷阱全部免疫！' });
          return;
        }
        ctx.raf(loop);
      };

      ctx.raf(loop);
    }
  },

  /* ========================================================================
     Lv.9 治好你的强迫症（先连敲 3 下松动钉子再扶正画框）
     ======================================================================== */
  {
    id: 9,
    chapter: 2,
    title: '强迫症测试：把画扶正',
    prompt: '将墙上歪掉的名画精准调正到 0°（误差 ±2° 内）',
    initialRoast: '强迫症保安已经难受坏了，快把画摆正！',
    mount(ctx) {
      const stage = ctx.stageEl;
      stage.innerHTML = `
        <div style="position:relative;width:100%;height:225px;background:#FBF9F4;border-radius:12px;border:1.5px solid #DCE3EE;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;">
          <!-- Loose protruding nail -->
          <button id="lv9Nail" type="button" style="position:absolute;top:14px;background:transparent;border:none;cursor:pointer;padding:8px 16px;z-index:5;display:flex;flex-direction:column;align-items:center;">
            <span id="lv9NailTag" style="font-size:10.5px;font-weight:900;color:#FF3B5C;margin-bottom:2px;">钉子松了!</span>
            <span id="lv9NailHead" style="display:block;width:22px;height:8px;border-radius:4px;background:#94A3B8;border:2px solid #18191C;transition:transform 0.12s;"></span>
            <span id="lv9NailStem" style="display:block;width:5px;height:18px;background:#64748B;border-left:1.5px solid #18191C;border-right:1.5px solid #18191C;transition:height 0.14s;"></span>
          </button>

          <!-- Tilted Frame -->
          <div id="lv9Frame" style="margin-top:30px;width:136px;height:152px;background:#92400E;border:3px solid #18191C;border-radius:8px;padding:9px;box-shadow:0 8px 18px rgba(0,0,0,0.16);transform-origin:50% 6%;transform:rotate(18deg);transition:transform 0.08s linear;">
            <div style="width:100%;height:100%;background:#FEF3C7;border:2px solid #18191C;display:flex;flex-direction:column;align-items:center;justify-content:center;">
              <svg width="86" height="106" viewBox="0 0 86 106">
                <rect width="86" height="106" fill="#D1FAE5"/>
                <path d="M12 106 C14 70, 72 70, 74 106 Z" fill="#1E293B"/>
                <circle cx="43" cy="44" r="22" fill="#FDE68A" stroke="#18191C" stroke-width="2.2"/>
                <path d="M21 44 C21 16, 65 16, 65 44 L68 74 L58 68 L58 46 C50 38, 36 38, 28 46 L28 68 L18 74 Z" fill="#451A03" stroke="#18191C" stroke-width="2"/>
                <circle cx="36" cy="46" r="2.5" fill="#18191C"/>
                <circle cx="50" cy="46" r="2.5" fill="#18191C"/>
                <path d="M37 56 Q43 60 49 56" stroke="#18191C" stroke-width="2" fill="none" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </div>
        <div style="width:100%;margin-top:12px;">
          <div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:800;margin-bottom:6px;">
            <span>调节倾角</span>
            <span class="tabular" id="lv9Deg">+18.0°</span>
          </div>
          <input id="lv9Range" type="range" min="-25" max="25" step="0.5" value="18" style="width:100%;accent-color:#00AEEC;height:32px;cursor:pointer;" />
        </div>
      `;

      const nailBtn = stage.querySelector('#lv9Nail');
      const nailTag = stage.querySelector('#lv9NailTag');
      const nailStem = stage.querySelector('#lv9NailStem');
      const frame = stage.querySelector('#lv9Frame');
      const range = stage.querySelector('#lv9Range');
      const degEl = stage.querySelector('#lv9Deg');

      let nailHits = 0;
      let slipFails = 0;

      const setAngle = (val, smooth = false) => {
        frame.style.transition = smooth ? 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.06s linear';
        frame.style.transform = `rotate(${val}deg)`;
        range.value = String(val);
        degEl.textContent = `${val > 0 ? '+' : ''}${Number(val).toFixed(1)}°`;
        degEl.style.color = Math.abs(val) <= 2 ? '#00B578' : '#18191C';
      };

      ctx.on(nailBtn, 'click', () => {
        if (nailHits >= 3) return;
        nailHits += 1;
        ctx.audio.hammer();
        nailStem.style.height = `${Math.max(2, 18 - nailHits * 6)}px`;
        if (nailHits < 3) {
          nailTag.textContent = `再敲 ${3 - nailHits} 下!`;
          ctx.roast(`咚！敲进去一截了，再敲 ${3 - nailHits} 下把钉子彻底钉死！`, 'info');
        } else {
          nailTag.textContent = '✓ 已钉死!';
          nailTag.style.color = '#00B578';
          ctx.roast('钉子稳了！现在把画框调到 0° 就行！', 'win');
          if (Math.abs(Number(range.value)) <= 2.0) {
            ctx.pass({ msg: '强迫症极度舒适！动手能力满分！' });
          }
        }
      });

      ctx.on(range, 'input', () => {
        setAngle(Number(range.value), false);
      });

      ctx.on(range, 'change', () => {
        const val = Number(range.value);
        if (Math.abs(val) <= 2.0) {
          if (nailHits >= 3) {
            ctx.pass({ msg: '强迫症极度舒适！一毫米不差！' });
          } else {
            ctx.timeout(() => {
              const target = val >= 0 ? -17 : 17;
              setAngle(target, true);
              ctx.audio.dodge();
              slipFails += 1;
              if (slipFails >= 2) {
                ctx.fail(5, '钉子都翘出来半截了，先连点上面那颗【钉子】敲 3 下！');
              } else {
                ctx.roast('哎呀！松手就又滑歪了……画框上面那颗钉子好像有点松？', 'warn');
              }
            }, 220);
          }
        }
      });
    }
  },

  /* ========================================================================
     Lv.10 半程 BOSS：我要验牌！（连续审查 4 张离谱卡牌）
     ======================================================================== */
  {
    id: 10,
    chapter: 2,
    title: '半程 BOSS：我要验牌！',
    prompt: '快速审查 4 张身份/扑克牌（6.5秒/张），发现破绽立刻拍桌验牌！',
    chip: 'BOSS',
    initialRoast: '盯紧每一个字和数字！发现离谱破绽就拍红键！',
    mount(ctx) {
      const stage = ctx.stageEl;
      const cards = [
        {
          isFake: false,
          failRoast: '人家是一张清清白白的红桃 A！你瞎验啥牌啊！',
          html: `
            <div style="display:flex;justify-content:space-between;color:#E0243C;">
              <div style="line-height:1;font-weight:900;font-size:22px;font-family:var(--font-mono);">A<br/>♥</div>
              <span style="font-size:11px;color:#64748B;">扑克牌 · #1/4</span>
            </div>
            <div style="text-align:center;font-size:58px;color:#E0243C;line-height:1;">♥</div>
            <div style="text-align:right;color:#E0243C;line-height:1;font-weight:900;font-size:22px;font-family:var(--font-mono);">A ♥</div>
          `
        },
        {
          isFake: true,
          failRoast: '扑克牌哪来的【梅花 14】？！老千在你脸上出牌都看不见？',
          html: `
            <div style="display:flex;justify-content:space-between;color:#18191C;">
              <div style="line-height:1;font-weight:900;font-size:22px;font-family:var(--font-mono);">14<br/>♣</div>
              <span style="font-size:11px;color:#64748B;">扑克牌 · #2/4</span>
            </div>
            <div style="text-align:center;font-size:22px;letter-spacing:1px;line-height:1.25;">♣♣♣♣♣<br/>♣♣♣♣♣<br/>♣♣♣♣</div>
            <div style="text-align:right;color:#18191C;line-height:1;font-weight:900;font-size:22px;font-family:var(--font-mono);">14 ♣</div>
          `
        },
        {
          isFake: true,
          failRoast: '2026 年哪来的【2 月 30 日】？！这假证都敢放行？',
          html: `
            <div style="font-size:12px;font-weight:900;color:#008FC5;border-bottom:1.5px solid #E2E8F0;padding-bottom:4px;">🪪 碳基居民身份证 · #3/4</div>
            <div style="font-size:12.5px;line-height:1.75;color:#18191C;margin:8px 0;">
              <div><strong>姓名：</strong>张大水</div>
              <div><strong>性别：</strong>纯血人类</div>
              <div><strong>出生：</strong>2026年 2月 30日</div>
              <div><strong>住址：</strong>铁岭市绝不烧心路88号</div>
            </div>
            <div style="font-size:10px;color:#94A3B8;text-align:right;">签发机关：bCAPTCHA 派出所</div>
          `
        },
        {
          isFake: true,
          failRoast: '底部都明写着【由 GPT-99 Pro 诚挚生成】了还放行？！',
          html: `
            <div style="font-size:12px;font-weight:900;color:#00B578;border-bottom:1.5px solid #E2E8F0;padding-bottom:4px;">📄 绝对人类承诺书 · #4/4</div>
            <div style="font-size:12.5px;line-height:1.6;color:#18191C;margin:8px 0;">
              本人郑重声明：我每天喝 2L 大水，热爱吃米饭，绝不是任何形式的人工智能。
            </div>
            <div style="font-size:10px;color:#64748B;background:#F1F5F9;padding:5px;border-radius:6px;line-height:1.35;">
              注：以上声明由 GPT-99 Pro 诚挚为您生成，如还有需要请随时告诉我！
            </div>
          `
        }
      ];

      stage.innerHTML = `
        <div class="poker-stage">
          <div style="width:100%;display:flex;justify-content:space-between;align-items:center;color:#E2E8F0;font-size:12px;font-weight:800;">
            <span id="lv10Count">审查进度：1 / 4</span>
            <span class="tabular" id="lv10Time" style="color:#FDE047;">⏱ 6.5s</span>
          </div>
          <div class="poker-card" id="lv10Card"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;">
            <button type="button" class="btn-green" id="lv10Pass">✓ 放行（真）</button>
            <button type="button" class="btn-danger anim-pulse" id="lv10Check">💥 我要验牌！</button>
          </div>
        </div>
      `;

      const countEl = stage.querySelector('#lv10Count');
      const timeEl = stage.querySelector('#lv10Time');
      const cardEl = stage.querySelector('#lv10Card');
      const passBtn = stage.querySelector('#lv10Pass');
      const checkBtn = stage.querySelector('#lv10Check');

      let idx = 0;
      let timeLeft = 6.5;
      let locked = false;
      let lastTs = performance.now();

      const showCard = () => {
        timeLeft = 6.5;
        locked = false;
        countEl.textContent = `审查进度：${idx + 1} / ${cards.length}`;
        cardEl.innerHTML = cards[idx].html;
      };

      const judge = (choseCheck) => {
        if (locked) return;
        const cur = cards[idx];
        if (choseCheck === cur.isFake) {
          locked = true;
          if (choseCheck) {
            ctx.audio.slapTable();
            ctx.shake();
            const stamp = document.createElement('div');
            stamp.className = 'slam-stamp';
            stamp.innerHTML = '<span>我要验牌！</span>';
            cardEl.appendChild(stamp);
            ctx.roast('🔥 拍桌命中！好一双火眼金睛！', 'win');
          } else {
            ctx.audio.click();
            ctx.roast('✓ 确认真牌，安全放行！', 'info');
          }

          ctx.timeout(() => {
            idx += 1;
            if (idx >= cards.length) {
              ctx.pass({ msg: '赌神附体！半程 BOSS 验牌全胜！' });
            } else {
              showCard();
            }
          }, choseCheck ? 620 : 320);
        } else {
          ctx.fail(7, cur.failRoast);
          timeLeft = 6.5;
        }
      };

      ctx.on(passBtn, 'click', () => judge(false));
      ctx.on(checkBtn, 'click', () => judge(true));

      const loop = (now) => {
        const dt = Math.min(0.05, (now - lastTs) / 1000);
        lastTs = now;
        if (!locked) {
          timeLeft = Math.max(0, timeLeft - dt);
          timeEl.textContent = `⏱ ${timeLeft.toFixed(1)}s`;
          if (timeLeft <= 0) {
            ctx.fail(7, '思考超时！牌局不等人，再给你 6.5 秒！');
            timeLeft = 6.5;
          }
        }
        ctx.raf(loop);
      };

      showCard();
      ctx.raf(loop);
    }
  }
];
