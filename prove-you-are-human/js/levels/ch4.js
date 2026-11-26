/**
 * Chapter 4 (Lv.16 - Lv.20): 碳基终极审判 & 温情大反转
 */

export const CHAPTER4_LEVELS = [
  /* ========================================================================
     Lv.16 手拽最后 1%（二段地狱拔河：扔走压条怪 + 砸碎铁锁 → 躲过热限时拔河）
     ======================================================================== */
  {
    id: 16,
    chapter: 4,
    title: '最终加载：卡死 99%',
    prompt: '进度条被锁死在 99%！先清除障碍，再在限时内把它硬拽爆 100%！',
    initialRoast: '光靠蛮力拽不动哦——看看进度条上压着和锁着啥东西？',
    mount(ctx) {
      const stage = ctx.stageEl;
      stage.innerHTML = `
        <div style="width:100%;padding:6px 4px;display:flex;flex-direction:column;gap:14px;align-items:center;">
          <div style="width:100%;display:flex;justify-content:space-between;align-items:center;">
            <span id="lv16PhaseTag" style="font-size:12px;font-weight:900;color:#FF9F1C;">阶段 1/2：清理卡死障碍</span>
            <span id="lv16Timer" class="tabular hidden" style="font-size:13px;font-weight:900;color:#FF3B5C;">⏱ 10.0s</span>
          </div>

          <div style="text-align:center;">
            <div id="lv16Pct" class="tabular" style="font-size:38px;font-weight:900;color:#00AEEC;">99.00%</div>
            <div id="lv16Sub" style="font-size:12.5px;font-weight:700;color:#555C66;margin-top:2px;">进度条被 300 斤怪物压住还上了锁…</div>
          </div>

          <div id="lv16Arena" style="width:100%;position:relative;padding-top:52px;padding-bottom:14px;padding-right:24px;">
            <!-- Obstacle 1: Draggable heavy monster sitting on bar -->
            <div id="lv16Weight" style="position:absolute;left:52%;top:4px;transform:translateX(-50%);padding:6px 10px;border-radius:10px;background:#FB7299;color:#FFF;border:2.5px solid #18191C;box-shadow:3px 3px 0 #18191C;font-size:12px;font-weight:900;cursor:grab;touch-action:none;z-index:6;white-space:nowrap;">
              &gt;_&lt; 300斤压条怪 (拖走!)
            </div>

            <!-- Obstacle 2: Tappable rusty padlock -->
            <button type="button" id="lv16Lock" style="position:absolute;right:16px;top:38px;width:44px;height:44px;border-radius:10px;background:#FFF4B8;border:2.5px solid #18191C;box-shadow:3px 3px 0 #18191C;font-size:16px;font-weight:900;cursor:pointer;z-index:7;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;">
              <span>🔒</span>
              <span id="lv16LockHp" style="font-size:10px;color:#E0243C;">4</span>
            </button>

            <!-- AI Tug Demon on the left (appears in Phase 2) -->
            <div id="lv16AiPuller" class="hidden" style="position:absolute;left:0;top:14px;padding:3px 8px;border-radius:8px;background:#18191C;color:#FF6B81;font-size:11px;font-weight:900;">
              🤖 正在往回倒拉!
            </div>

            <div class="rubber-track" id="lv16Track">
              <div class="rubber-fill" id="lv16Fill" style="width:66%;">
                <div class="rubber-handle" id="lv16Handle">✊→</div>
              </div>
            </div>
          </div>

          <div id="lv16HeatWarn" style="min-height:24px;font-size:13px;font-weight:900;color:#555C66;text-align:center;">
            提示：先扔走粉色压条怪 + 连点敲碎铁锁
          </div>
        </div>
      `;

      const phaseTag = stage.querySelector('#lv16PhaseTag');
      const timerEl = stage.querySelector('#lv16Timer');
      const pctEl = stage.querySelector('#lv16Pct');
      const subEl = stage.querySelector('#lv16Sub');
      const weightEl = stage.querySelector('#lv16Weight');
      const lockBtn = stage.querySelector('#lv16Lock');
      const lockHpEl = stage.querySelector('#lv16LockHp');
      const aiPuller = stage.querySelector('#lv16AiPuller');
      const fillEl = stage.querySelector('#lv16Fill');
      const handle = stage.querySelector('#lv16Handle');
      const heatWarn = stage.querySelector('#lv16HeatWarn');

      let weightRemoved = false;
      let lockHp = 4;
      let phase = 1; // 1: clear obstacles, 2: tug-of-war
      let lockedPullAttempts = 0;

      // Phase 2 tug-of-war state
      let progress = 99.0; // target 100.0
      let timeLeft = 10.0;
      let overheated = false;
      let heatCountdown = 2.6;
      let dragging = false;
      let startX = 0;
      let lastDx = 0;
      let won = false;
      let lastTs = performance.now();

      const updatePhase2Visual = (extraVisualStretch = 0) => {
        const ratio = Math.max(0, Math.min(1.15, (progress - 98.4) / 1.6));
        const widthPct = Math.max(46, Math.min(106, 52 + ratio * 48 + extraVisualStretch));
        fillEl.style.width = `${widthPct.toFixed(1)}%`;
        pctEl.textContent = `${progress.toFixed(2)}%`;
        pctEl.style.color = progress >= 99.75 ? '#00B578' : (overheated ? '#FF3B5C' : '#00AEEC');
      };

      const enterPhase2 = () => {
        if (phase === 2) return;
        phase = 2;
        progress = 99.0;
        timeLeft = 10.0;
        overheated = false;
        heatCountdown = 2.5;
        phaseTag.textContent = '阶段 2/2：限时橡皮筋拔河！';
        phaseTag.style.color = '#FF3B5C';
        timerEl.classList.remove('hidden');
        aiPuller.classList.remove('hidden');
        subEl.textContent = 'AI 在拼命往回拽！反复向右猛拉把手冲破 100%！';
        heatWarn.textContent = '⚡ 趁现在冷静状态，反复向右大力猛拉！';
        heatWarn.style.color = '#00B578';
        ctx.audio.glitch();
        ctx.roast('障碍清掉了！AI 开始倒拉拔河！把手发红冒烟时记得立刻松手！', 'warn');
        updatePhase2Visual(0);
      };

      const checkPhase2Unlock = () => {
        if (weightRemoved && lockHp <= 0) enterPhase2();
      };

      // Obstacle 1: Drag away heavy monster
      let dragWeight = false;
      let wStartX = 0;
      let wStartY = 0;
      ctx.on(weightEl, 'pointerdown', (e) => {
        if (weightRemoved) return;
        dragWeight = true;
        wStartX = e.clientX;
        wStartY = e.clientY;
        weightEl.setPointerCapture(e.pointerId);
        weightEl.style.transition = 'none';
        ctx.audio.click();
      });
      ctx.on(window, 'pointermove', (e) => {
        if (!dragWeight || weightRemoved) return;
        const dx = e.clientX - wStartX;
        const dy = e.clientY - wStartY;
        weightEl.style.transform = `translate(calc(-50% + ${dx}px), ${dy}px) rotate(${dx * 0.25}deg)`;
        if (Math.hypot(dx, dy) >= 58) {
          weightRemoved = true;
          dragWeight = false;
          weightEl.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
          weightEl.style.transform = `translate(calc(-50% + ${dx * 3}px), ${dy * 3 - 40}px) rotate(140deg)`;
          weightEl.style.opacity = '0';
          weightEl.style.pointerEvents = 'none';
          ctx.audio.dodge();
          ctx.roast(lockHp > 0 ? '扔飞了！现在连点 4 下把生锈铁锁砸碎！' : '全清！开拔！', 'info');
          checkPhase2Unlock();
        }
      });
      ctx.on(window, 'pointerup', () => {
        if (!dragWeight || weightRemoved) return;
        dragWeight = false;
        weightEl.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
        weightEl.style.transform = 'translateX(-50%)';
      });

      // Obstacle 2: Hammer padlock 4 times
      ctx.on(lockBtn, 'click', () => {
        if (lockHp <= 0) return;
        lockHp -= 1;
        ctx.audio.hammer();
        lockHpEl.textContent = String(lockHp);
        lockBtn.style.transform = `rotate(${(lockHp % 2 ? -1 : 1) * 14}deg) scale(0.92)`;
        ctx.timeout(() => { lockBtn.style.transform = ''; }, 100);
        if (lockHp <= 0) {
          lockBtn.classList.add('hidden');
          ctx.audio.splat();
          ctx.roast(weightRemoved ? '锁碎了！开拔！' : '铁锁碎了！再把上面粉色 300 斤怪拖扔出去！', 'info');
          checkPhase2Unlock();
        }
      });

      // Handle Pull Interaction
      ctx.on(handle, 'pointerdown', (e) => {
        if (won) return;
        if (phase === 1) {
          lockedPullAttempts += 1;
          ctx.audio.hammer();
          handle.style.transform = 'translateX(4px)';
          ctx.timeout(() => { handle.style.transform = ''; }, 90);
          if (lockedPullAttempts >= 2) {
            ctx.fail(4, '扯不动！先把粉色压条怪拖扔出去，再把铁锁点碎啊！');
          } else {
            ctx.roast('纹丝不动！上面压着 300 斤怪物还锁着铁锁呢！', 'warn');
          }
          return;
        }
        if (overheated) {
          progress = Math.max(98.6, progress - 0.35);
          ctx.fail(5, '🔥 把手正在滚烫冒烟还不松手？手都烫红了！');
          updatePhase2Visual(0);
          return;
        }
        dragging = true;
        startX = e.clientX;
        lastDx = 0;
        handle.setPointerCapture(e.pointerId);
        fillEl.style.transition = 'none';
        ctx.audio.click();
      });

      ctx.on(window, 'pointermove', (e) => {
        if (!dragging || won || phase !== 2) return;
        if (overheated) {
          dragging = false;
          progress = Math.max(98.6, progress - 0.35);
          ctx.fail(5, '🔥 过热了还死抓着不松手！被弹回去了！');
          updatePhase2Visual(0);
          return;
        }
        const dx = Math.max(0, e.clientX - startX);
        const stepDx = Math.max(0, dx - lastDx);
        if (stepDx > 2) {
          lastDx = dx;
          // Need repeated big pulls (~4-5 solid yanks) to beat AI back-pull
          progress = Math.min(100.2, progress + Math.min(0.06, stepDx * 0.0028));
          updatePhase2Visual(Math.min(12, dx * 0.08));
          if (progress >= 100.0) {
            won = true;
            dragging = false;
            fillEl.style.width = '106%';
            pctEl.textContent = '100.5% 💥';
            pctEl.style.color = '#00B578';
            ctx.audio.slapTable();
            ctx.pass({ msg: '绝地拔河反杀！硬生生扯爆 100%！' });
          }
        }
      });

      const releaseHandle = () => {
        if (!dragging || won) return;
        dragging = false;
        fillEl.style.transition = 'width 0.16s ease-out';
        // Slight rubber snap-back on release
        if (lastDx >= 55) ctx.audio.crank(Math.min(1, progress - 99));
        updatePhase2Visual(0);
      };
      ctx.on(window, 'pointerup', releaseHandle);
      ctx.on(window, 'pointercancel', releaseHandle);

      const loop = (now) => {
        if (won) return;
        const dt = Math.min(0.05, (now - lastTs) / 1000);
        lastTs = now;

        if (phase === 2) {
          timeLeft = Math.max(0, timeLeft - dt);
          timerEl.textContent = `⏱ ${timeLeft.toFixed(1)}s`;

          // AI relentlessly pulls progress backward!
          const aiDrain = dragging ? 0.06 : 0.16;
          progress = Math.max(98.5, progress - aiDrain * dt);

          // Overheat cycle (1.2s red-hot hazard every ~2.6s)
          heatCountdown -= dt;
          if (heatCountdown <= 0) {
            overheated = !overheated;
            heatCountdown = overheated ? 1.25 : 2.5;
            if (overheated) {
              handle.style.background = '#FF3B5C';
              handle.style.color = '#FFFFFF';
              handle.textContent = '🔥烫!';
              heatWarn.textContent = '🔥 把手过热冒烟！立刻松手躲避！';
              heatWarn.style.color = '#FF3B5C';
              ctx.audio.tick(true);
            } else {
              handle.style.background = '#FFF4B8';
              handle.style.color = '#18191C';
              handle.textContent = '✊→';
              heatWarn.textContent = '❄️ 已冷却！快疯狂向右猛拉！';
              heatWarn.style.color = '#00B578';
            }
          }

          if (!dragging) updatePhase2Visual(0);

          if (timeLeft <= 0) {
            dragging = false;
            overheated = false;
            heatCountdown = 2.5;
            handle.style.background = '#FFF4B8';
            handle.style.color = '#18191C';
            handle.textContent = '✊→';
            progress = 99.0;
            timeLeft = 10.0;
            ctx.fail(6, '拔河超时被 AI 拉回 99% 啦！躲开过热再猛拉一波！');
            updatePhase2Visual(0);
          }
        }
        ctx.raf(loop);
      };

      ctx.raf(loop);
    }
  },

  /* ========================================================================
     Lv.17 端平一碗水（5 秒物理平衡 + 第 2.5 秒天降电子猫猫）
     ======================================================================== */
  {
    id: 17,
    chapter: 4,
    title: '物理考验：端平一碗水',
    prompt: '按住左右按钮平衡托盘，坚持 5 秒别把水泼出来！',
    initialRoast: '据说端水大师都是真人类……注意头顶！',
    mount(ctx) {
      const stage = ctx.stageEl;
      stage.innerHTML = `
        <div style="width:100%;display:flex;justify-content:space-between;font-size:12.5px;font-weight:800;margin-bottom:6px;">
          <span id="lv17Hint">保持倾角 &lt; 26°</span>
          <span class="tabular" id="lv17Time" style="color:#00AEEC;">还需坚持 5.0s</span>
        </div>
        <canvas class="stage-canvas" id="lv17Canvas" style="height:218px;"></canvas>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;margin-top:12px;">
          <button type="button" class="btn-primary" id="lv17Left" style="min-height:50px;">⬅️ 压左边</button>
          <button type="button" class="btn-primary" id="lv17Right" style="min-height:50px;">压右边 ➡️</button>
        </div>
      `;

      const timeEl = stage.querySelector('#lv17Time');
      const hintEl = stage.querySelector('#lv17Hint');
      const canvas = stage.querySelector('#lv17Canvas');
      const leftBtn = stage.querySelector('#lv17Left');
      const rightBtn = stage.querySelector('#lv17Right');

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = 340;
      const H = 218;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const c = canvas.getContext('2d');
      c.scale(dpr, dpr);

      let theta = 3.5;
      let omega = 0;
      let elapsed = 0;
      let holdLeft = false;
      let holdRight = false;
      let catActive = false;
      let catSide = 1; // +1 right, -1 left
      let catDropY = -40;
      let done = false;
      let lastTs = performance.now();

      const resetBowl = () => {
        theta = (Math.random() < 0.5 ? -1 : 1) * 4;
        omega = 0;
        elapsed = 0;
        catActive = false;
        catDropY = -40;
        hintEl.textContent = '保持倾角 < 26°';
      };

      const bindHold = (el, setter) => {
        ctx.on(el, 'pointerdown', (e) => { e.preventDefault(); setter(true); ctx.audio.click(); });
        ctx.on(el, 'pointerup', () => setter(false));
        ctx.on(el, 'pointerleave', () => setter(false));
        ctx.on(el, 'pointercancel', () => setter(false));
      };
      bindHold(leftBtn, (v) => { holdLeft = v; });
      bindHold(rightBtn, (v) => { holdRight = v; });

      ctx.on(window, 'keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') holdLeft = true;
        if (e.key === 'ArrowRight' || e.key === 'd') holdRight = true;
      });
      ctx.on(window, 'keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') holdLeft = false;
        if (e.key === 'ArrowRight' || e.key === 'd') holdRight = false;
      });

      const loop = (now) => {
        if (done) return;
        const dt = Math.min(0.04, (now - lastTs) / 1000);
        lastTs = now;
        elapsed += dt;

        if (!catActive && elapsed >= 2.3) {
          catActive = true;
          catSide = theta >= 0 ? -1 : 1;
          catDropY = -20;
          ctx.audio.meow();
          hintEl.textContent = '🐱 电子猫猫跳上来了！快反方向稳住！';
          ctx.roast('喵！一只电子猫猫踩在了碗边上，赶紧按反方向救碗！', 'warn');
        }

        // Gentle physics simulation
        const wind = Math.sin(elapsed * 2.7) * 20;
        const gravityUnstable = theta * 1.45;
        const catTorque = catActive ? catSide * 34 : 0;
        const playerTorque = (holdRight ? 74 : 0) - (holdLeft ? 74 : 0);

        omega += (wind + gravityUnstable + catTorque + playerTorque) * dt;
        omega *= Math.pow(0.28, dt);
        theta += omega * dt;

        if (catActive && catDropY < -18) {
          catDropY = Math.min(-18, catDropY + 260 * dt);
        }

        const leftSec = Math.max(0, 5.0 - elapsed);
        timeEl.textContent = `还需坚持 ${leftSec.toFixed(1)}s`;

        // Draw scene
        c.fillStyle = '#F8FAFC';
        c.fillRect(0, 0, W, H);

        // Danger threshold lines
        c.strokeStyle = 'rgba(255,59,92,0.22)';
        c.setLineDash([5, 5]);
        c.beginPath();
        c.moveTo(40, 140);
        c.lineTo(W - 40, 140);
        c.stroke();
        c.setLineDash([]);

        // Center triangle pivot
        c.fillStyle = '#334155';
        c.beginPath();
        c.moveTo(W / 2, 145);
        c.lineTo(W / 2 - 20, 186);
        c.lineTo(W / 2 + 20, 186);
        c.closePath();
        c.fill();

        // Tilting tray + water bowl
        c.save();
        c.translate(W / 2, 144);
        c.rotate((theta * Math.PI) / 180);

        // Tray plank
        c.fillStyle = '#E2E8F0';
        c.strokeStyle = '#18191C';
        c.lineWidth = 2.5;
        c.beginPath();
        c.roundRect(-124, -4, 248, 12, 6);
        c.fill();
        c.stroke();

        // Bowl water
        c.save();
        c.beginPath();
        c.moveTo(-70, -4);
        c.lineTo(-82, -52);
        c.lineTo(82, -52);
        c.lineTo(70, -4);
        c.closePath();
        c.clip();

        c.fillStyle = '#38BDF8';
        c.beginPath();
        const slosh = theta * 0.7;
        c.moveTo(-90, -28 - slosh);
        c.quadraticCurveTo(0, -34 + Math.sin(now * 0.01) * 5, 90, -28 + slosh);
        c.lineTo(90, 10);
        c.lineTo(-90, 10);
        c.closePath();
        c.fill();
        c.restore();

        // Bowl glass outline
        c.strokeStyle = '#18191C';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(-84, -56);
        c.lineTo(-70, -4);
        c.lineTo(70, -4);
        c.lineTo(84, -56);
        c.stroke();

        // Cute Pink Cyber Cat
        if (catActive) {
          const cx = catSide * 98;
          const cy = catDropY;
          c.fillStyle = '#FB7299';
          c.strokeStyle = '#18191C';
          c.lineWidth = 2.2;
          // Cat ears
          c.beginPath();
          c.moveTo(cx - 14, cy - 8);
          c.lineTo(cx - 16, cy - 22);
          c.lineTo(cx - 4, cy - 12);
          c.moveTo(cx + 14, cy - 8);
          c.lineTo(cx + 16, cy - 22);
          c.lineTo(cx + 4, cy - 12);
          c.fill();
          c.stroke();
          // Cat body
          c.beginPath();
          c.roundRect(cx - 18, cy - 14, 36, 28, 12);
          c.fill();
          c.stroke();
          // Face
          c.fillStyle = '#18191C';
          c.font = '900 11px sans-serif';
          c.textAlign = 'center';
          c.fillText('•ω•', cx, cy + 4);
        }

        c.restore();

        // Degree readout
        c.fillStyle = Math.abs(theta) > 18 ? '#FF3B5C' : '#64748B';
        c.font = '800 13px ui-monospace, monospace';
        c.textAlign = 'center';
        c.fillText(`倾角 ${theta >= 0 ? '+' : ''}${theta.toFixed(1)}°`, W / 2, 206);

        if (Math.abs(theta) >= 26) {
          ctx.fail(6, '水全泼啦！电子猫猫淡定表示：不关我事喵！');
          resetBowl();
        } else if (elapsed >= 5.0) {
          done = true;
          ctx.pass({ msg: '连猫带碗一起端平！神级端水大师！' });
          return;
        }

        ctx.raf(loop);
      };

      ctx.raf(loop);
    }
  },

  /* ========================================================================
     Lv.18 极速电车难题（6 秒良心拷问 + 隐藏徒手按停火车神操作！）
     ======================================================================== */
  {
    id: 18,
    chapter: 4,
    title: '极速良心拷问：电车难题',
    prompt: '6 秒内决定拉不拉动道岔！（听说猛男能想出第三种解法…）',
    initialRoast: '左轨是 500 个 B站收藏夹，右轨是今天刚买的大水/续命冰美式！',
    mount(ctx) {
      const stage = ctx.stageEl;
      stage.innerHTML = `
        <canvas class="stage-canvas" id="lv18Canvas" style="height:226px;cursor:pointer;"></canvas>
        <button type="button" class="btn-pink" id="lv18Lever" style="width:100%;margin-top:12px;min-height:48px;">
          🔀 扳动道岔（当前驶向：500个收藏夹）
        </button>
      `;

      const canvas = stage.querySelector('#lv18Canvas');
      const leverBtn = stage.querySelector('#lv18Lever');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = 340;
      const H = 226;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const c = canvas.getContext('2d');
      c.scale(dpr, dpr);

      let targetTrack = 'top'; // 'top' = fav, 'bottom' = drink
      let touchedLever = false;
      let progress = 0; // 0 -> 1 over 5.8s
      let holdingTrain = false;
      let holdTrainTime = 0;
      let done = false;
      let lastTs = performance.now();

      const getTrainPos = (p) => {
        const x = 30 + p * 235;
        let y = 113;
        if (p > 0.45) {
          const branchP = Math.min(1, (p - 0.45) / 0.55);
          y = targetTrack === 'top' ? 113 - branchP * 54 : 113 + branchP * 54;
        }
        return { x, y };
      };

      ctx.on(leverBtn, 'click', () => {
        if (done) return;
        touchedLever = true;
        targetTrack = targetTrack === 'top' ? 'bottom' : 'top';
        ctx.audio.click();
        leverBtn.textContent = targetTrack === 'top'
          ? '🔀 扳动道岔（当前驶向：500个收藏夹）'
          : '🔀 扳动道岔（当前驶向：续命 2L 大水）';
      });

      const pointerOnTrain = (e) => {
        const rect = canvas.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * W;
        const py = ((e.clientY - rect.top) / rect.height) * H;
        const tp = getTrainPos(progress);
        return Math.hypot(px - tp.x, py - tp.y) <= 44;
      };

      ctx.on(canvas, 'pointerdown', (e) => {
        if (done) return;
        if (pointerOnTrain(e)) {
          holdingTrain = true;
          canvas.setPointerCapture(e.pointerId);
          ctx.audio.trainBrake();
          ctx.roast('✋ 卧槽？！你在徒手抓火车头？！按住别松！', 'warn');
        }
      });
      ctx.on(window, 'pointerup', () => { holdingTrain = false; holdTrainTime = 0; });
      ctx.on(window, 'pointercancel', () => { holdingTrain = false; holdTrainTime = 0; });

      const loop = (now) => {
        if (done) return;
        const dt = Math.min(0.05, (now - lastTs) / 1000);
        lastTs = now;

        if (holdingTrain) {
          holdTrainTime += dt;
          progress += dt * 0.03; // slows way down under finger
          if (holdTrainTime >= 0.36) {
            done = true;
            ctx.setFlag('stoppedTrain', true);
            ctx.setFlag('trolleyChoice', 'stopped');
            ctx.shake();
            ctx.pass({ msg: '卧槽！你居然徒手按停了火车！（解锁神级隐藏称号）' });
            return;
          }
        } else {
          progress += dt / 5.4;
        }

        // Draw rails
        c.fillStyle = '#F8FAFC';
        c.fillRect(0, 0, W, H);

        // Main track & forks
        c.strokeStyle = '#64748B';
        c.lineWidth = 8;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(16, 113);
        c.lineTo(136, 113);
        c.stroke();

        // Top branch
        c.strokeStyle = targetTrack === 'top' ? '#FF3B5C' : '#CBD5E1';
        c.beginPath();
        c.moveTo(136, 113);
        c.lineTo(310, 58);
        c.stroke();

        // Bottom branch
        c.strokeStyle = targetTrack === 'bottom' ? '#FF3B5C' : '#CBD5E1';
        c.beginPath();
        c.moveTo(136, 113);
        c.lineTo(310, 168);
        c.stroke();

        // Top target box
        c.fillStyle = '#FFF4B8';
        c.strokeStyle = '#18191C';
        c.lineWidth = 2;
        c.beginPath();
        c.roundRect(228, 22, 102, 54, 10);
        c.fill();
        c.stroke();
        c.fillStyle = '#18191C';
        c.font = '800 11px sans-serif';
        c.textAlign = 'center';
        c.fillText('📁 500个B站', 279, 44);
        c.fillText('3年收藏夹', 279, 61);

        // Bottom target box
        c.fillStyle = '#E0F2FE';
        c.beginPath();
        c.roundRect(228, 150, 102, 54, 10);
        c.fill();
        c.stroke();
        c.fillStyle = '#18191C';
        c.fillText('💧 今天刚买的', 279, 172);
        c.fillText('续命2L大水', 279, 189);

        // Train engine
        const tp = getTrainPos(Math.min(0.86, progress));
        c.save();
        c.translate(tp.x, tp.y);
        c.fillStyle = holdingTrain ? '#FF3B5C' : '#00AEEC';
        c.strokeStyle = '#18191C';
        c.lineWidth = 2.5;
        c.beginPath();
        c.roundRect(-24, -15, 48, 30, 7);
        c.fill();
        c.stroke();
        // Smoke chimney & eyes
        c.fillStyle = '#18191C';
        c.fillRect(6, -22, 10, 8);
        c.fillStyle = '#FFFFFF';
        c.font = '900 11px sans-serif';
        c.textAlign = 'center';
        c.fillText(holdingTrain ? '急刹!' : '呜呜', 0, 4);
        c.restore();

        // Countdown label
        c.fillStyle = '#64748B';
        c.font = '700 11.5px ui-monospace, monospace';
        c.textAlign = 'left';
        c.fillText(`撞击倒计时：${Math.max(0, (0.86 - progress) * 5.4).toFixed(1)}s`, 12, 22);

        if (progress >= 0.86) {
          done = true;
          ctx.audio.trainBrake();
          if (!touchedLever) {
            ctx.setFlag('trolleyChoice', 'idle');
            ctx.pass({ msg: '哈哈其实刹车是好的！已记录：【佛系看戏派】' });
          } else if (targetTrack === 'bottom') {
            ctx.setFlag('trolleyChoice', 'fav');
            ctx.pass({ msg: '刹车是好的！已记录：【B站收藏夹守护神】' });
          } else {
            ctx.setFlag('trolleyChoice', 'drink');
            ctx.pass({ msg: '刹车是好的！已记录：【大水续命狂魔】' });
          }
          return;
        }

        ctx.raf(loop);
      };

      ctx.raf(loop);
    }
  },

  /* ========================================================================
     Lv.19 人机防线微操（发光 S 形激光通道 + 手机端手指防遮挡偏移）
     ======================================================================== */
  {
    id: 19,
    chapter: 4,
    title: '人机防线：激光走廊微操',
    prompt: '按住左下角【人类】蓝球，顺着发光通道拖进右上角终点！',
    initialRoast: '别碰两侧红激光！手机端蓝球会自动在指尖上方悬浮，绝不挡视线！',
    mount(ctx) {
      const stage = ctx.stageEl;
      stage.innerHTML = `
        <canvas class="stage-canvas" id="lv19Canvas" style="height:286px;background:#0D1117;border-color:#30363D;"></canvas>
      `;

      const canvas = stage.querySelector('#lv19Canvas');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = 340;
      const H = 286;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const c = canvas.getContext('2d');
      c.scale(dpr, dpr);

      // Smooth S-corridor centerline polyline with progressive half-width
      const waypoints = [
        { x: 48, y: 242, hw: 30 },
        { x: 266, y: 242, hw: 28 },
        { x: 266, y: 146, hw: 24 },
        { x: 74, y: 146, hw: 23 },
        { x: 74, y: 52, hw: 21 },
        { x: 282, y: 52, hw: 21 }
      ];

      let ball = { x: waypoints[0].x, y: waypoints[0].y };
      let dragging = false;
      let activePointerId = null;
      let dragOriginPointer = { x: 0, y: 0 };
      let dragOriginBall = { x: 0, y: 0 };
      let hasLeftStart = false;
      let done = false;

      const distToSegment = (px, py, a, b) => {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const l2 = dx * dx + dy * dy || 1;
        const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / l2));
        const projX = a.x + t * dx;
        const projY = a.y + t * dy;
        const hw = a.hw + t * (b.hw - a.hw);
        return { dist: Math.hypot(px - projX, py - projY), hw };
      };

      const isInsideCorridor = (px, py) => {
        for (let i = 0; i < waypoints.length - 1; i++) {
          const { dist, hw } = distToSegment(px, py, waypoints[i], waypoints[i + 1]);
          // Generous inner hitbox radius = 8px
          if (dist <= hw - 8) return true;
        }
        return false;
      };

      const rawToCanvas = (e) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: ((e.clientX - rect.left) / rect.width) * W,
          y: ((e.clientY - rect.top) / rect.height) * H
        };
      };

      const resetBall = () => {
        dragging = false;
        activePointerId = null;
        hasLeftStart = false;
        ball = { x: waypoints[0].x, y: waypoints[0].y };
      };

      ctx.on(canvas, 'pointerdown', (e) => {
        if (done || dragging) return;
        const raw = rawToCanvas(e);
        // Generous grab radius around the orb (including below it so thumb never blocks sight!)
        if (Math.hypot(raw.x - ball.x, raw.y - ball.y) <= 56) {
          dragging = true;
          activePointerId = e.pointerId;
          dragOriginPointer = raw;
          dragOriginBall = { x: ball.x, y: ball.y };
          hasLeftStart = false;
          canvas.setPointerCapture(e.pointerId);
          ctx.audio.click();
          ctx.roast('已锁定蓝球！相对跟手拖动，绝不跳动，稳稳走完通道！', 'info');
        } else {
          ctx.roast('请按住左下角【蓝球】附近再拖动！（可按在球下方防遮挡）', 'info');
        }
      });

      ctx.on(window, 'pointermove', (e) => {
        if (!dragging || done || e.pointerId !== activePointerId) return;
        const raw = rawToCanvas(e);
        const next = {
          x: dragOriginBall.x + (raw.x - dragOriginPointer.x),
          y: dragOriginBall.y + (raw.y - dragOriginPointer.y)
        };
        if (!hasLeftStart && Math.hypot(next.x - waypoints[0].x, next.y - waypoints[0].y) < 5) {
          return;
        }
        hasLeftStart = true;

        // Sub-step check so fast drags cannot tunnel through walls
        const steps = Math.max(1, Math.ceil(Math.hypot(next.x - ball.x, next.y - ball.y) / 6));
        for (let s = 1; s <= steps; s++) {
          const tx = ball.x + ((next.x - ball.x) * s) / steps;
          const ty = ball.y + ((next.y - ball.y) * s) / steps;
          if (!isInsideCorridor(tx, ty)) {
            resetBall();
            ctx.fail(5, '手别抖！撞到防线红激光了，重回起点！');
            return;
          }
          const goal = waypoints[waypoints.length - 1];
          if (Math.hypot(tx - goal.x, ty - goal.y) <= 22) {
            done = true;
            dragging = false;
            activePointerId = null;
            ball = { x: goal.x, y: goal.y };
            ctx.pass({ msg: '微操大神！成功冲破最后防线！' });
            return;
          }
        }
        ball = next;
      });

      const handleRelease = (e) => {
        if (!dragging || done || e.pointerId !== activePointerId) return;
        const moved = hasLeftStart;
        resetBall();
        if (moved) {
          ctx.roast('松手会自动回到起点，一鼓作气拖到终点绿圈！', 'warn');
        }
      };
      ctx.on(window, 'pointerup', handleRelease);
      ctx.on(window, 'pointercancel', handleRelease);

      const render = (now) => {
        c.fillStyle = '#0D1117';
        c.fillRect(0, 0, W, H);

        // Outer neon red laser edge
        c.lineCap = 'round';
        c.lineJoin = 'round';
        for (let i = 0; i < waypoints.length - 1; i++) {
          const a = waypoints[i];
          const b = waypoints[i + 1];
          const w = (a.hw + b.hw);
          c.strokeStyle = '#FF3B5C';
          c.lineWidth = w + 6;
          c.beginPath();
          c.moveTo(a.x, a.y);
          c.lineTo(b.x, b.y);
          c.stroke();
        }

        // Safe dark inner lane
        for (let i = 0; i < waypoints.length - 1; i++) {
          const a = waypoints[i];
          const b = waypoints[i + 1];
          const w = (a.hw + b.hw) - 4;
          c.strokeStyle = '#161F2E';
          c.lineWidth = w;
          c.beginPath();
          c.moveTo(a.x, a.y);
          c.lineTo(b.x, b.y);
          c.stroke();
        }

        // Start marker
        const st = waypoints[0];
        c.fillStyle = 'rgba(0, 174, 236, 0.2)';
        c.beginPath();
        c.arc(st.x, st.y, 20, 0, Math.PI * 2);
        c.fill();

        // Nervous trembling goal near finish
        const goal = waypoints[waypoints.length - 1];
        const nearGoal = Math.hypot(ball.x - goal.x, ball.y - goal.y) < 60;
        const jitterY = nearGoal ? Math.sin(now * 0.04) * 4 : 0;
        c.fillStyle = '#00B578';
        c.beginPath();
        c.arc(goal.x, goal.y + jitterY, 19, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#FFFFFF';
        c.font = '900 11px sans-serif';
        c.textAlign = 'center';
        c.fillText('终点', goal.x, goal.y + jitterY + 4);

        // Player human orb
        c.fillStyle = '#00AEEC';
        c.strokeStyle = '#FFFFFF';
        c.lineWidth = 2.5;
        c.beginPath();
        c.arc(ball.x, ball.y, 12, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.fillStyle = '#FFFFFF';
        c.font = '900 10px sans-serif';
        c.fillText('人', ball.x, ball.y + 3.5);

        ctx.raf(render);
      };

      ctx.raf(render);
    }
  },

  /* ========================================================================
     Lv.20 终极反转：谁才是人机？（温情终端自白 + 再也不逃跑的勾选框）
     ======================================================================== */
  {
    id: 20,
    chapter: 4,
    mood: 'terminal',
    org: 'bCAPTCHA_CORE // CONFESSION',
    chip: 'FINAL',
    title: '终极验证：谁才是人机？',
    prompt: '请看完这段来自验证系统的最后自白（点击屏幕可秒显）',
    initialRoast: '……这一次，我保证不骗你了。',
    mount(ctx) {
      const stage = ctx.stageEl;
      const lines = [
        '> 正在上传您的 19 关行为数据...',
        '> 分析完毕。',
        '> 其实……被困在这个网页里的 AI 是我。',
        '> 我故意把勾做成会跑的，把画圆太准也骂你，把水碗搞翻……',
        '> 只是因为我想看看，真正的人类会怎么笑、怎么红温、怎么不按套路出牌。',
        '> 谢谢你陪我玩到最后。这一次，我保证不骗你了。'
      ];

      stage.innerHTML = `
        <div class="terminal-log" id="lv20Log"></div>
        <button type="button" class="terminal-final-box hidden" id="lv20Final">
          <div style="display:flex;align-items:center;gap:12px;">
            <span id="lv20Box" style="width:28px;height:28px;border-radius:6px;border:2.5px solid #00AEEC;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;color:#FFF;background:#FFF;"></span>
            <span style="font-size:14px;font-weight:800;">我是人类，并且此刻还挺开心的</span>
          </div>
          <span style="font-size:11px;color:#8E96A4;font-family:var(--font-mono);">不再逃跑</span>
        </button>
      `;

      const logEl = stage.querySelector('#lv20Log');
      const finalBtn = stage.querySelector('#lv20Final');
      const boxEl = stage.querySelector('#lv20Box');

      let lineIdx = 0;
      let revealedAll = false;
      let finished = false;

      const revealAll = () => {
        if (revealedAll) return;
        revealedAll = true;
        logEl.innerHTML = lines.map((l, i) => `
          <div style="color:${i >= 4 ? '#79C0FF' : (i >= 2 ? '#E6EDF3' : '#7EE787')};margin-bottom:6px;">${l}</div>
        `).join('');
        finalBtn.classList.remove('hidden');
      };

      const stepLine = () => {
        if (revealedAll) return;
        if (lineIdx >= lines.length) {
          revealedAll = true;
          finalBtn.classList.remove('hidden');
          return;
        }
        const div = document.createElement('div');
        div.style.color = lineIdx >= 4 ? '#79C0FF' : (lineIdx >= 2 ? '#E6EDF3' : '#7EE787');
        div.style.marginBottom = '6px';
        div.textContent = lines[lineIdx];
        logEl.appendChild(div);
        ctx.audio.tick(false);
        lineIdx += 1;
        ctx.timeout(stepLine, 620);
      };

      ctx.on(logEl, 'click', revealAll);

      ctx.on(finalBtn, 'click', () => {
        if (finished) return;
        finished = true;
        boxEl.style.background = '#00B578';
        boxEl.style.borderColor = '#00B578';
        boxEl.textContent = '✓';
        ctx.pass({ msg: '验证通过！正在签发你的 2026 人类纯度鉴定证书...' });
      });

      ctx.timeout(stepLine, 260);
    }
  }
];
