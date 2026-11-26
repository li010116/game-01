/**
 * 《2026 碳基纯度鉴定证书》Evaluation Engine & 750x1180 Canvas Renderer
 */

export function formatMs(ms) {
  const safe = Math.max(0, Math.round(ms || 0));
  const mins = Math.floor(safe / 60000);
  const secs = Math.floor((safe % 60000) / 1000);
  const cs = Math.floor((safe % 1000) / 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

export function evaluateRun(state, levelMetaList) {
  const rawMs = Math.max(1000, state.rawMs || 0);
  const skipCount = state.skipCount || 0;
  const totalFails = state.totalFails || 0;
  const effectiveMs = rawMs + skipCount * 30000;
  const finalSus = Math.max(0, Math.min(99.9, Number((state.rawSus || 0).toFixed(1))));
  const humanPurity = Number((100 - finalSus).toFixed(1));
  const flags = state.flags || {};

  // Worst rage level
  let worstLevelId = null;
  let worstLevelFails = 0;
  for (const [idStr, count] of Object.entries(state.levelFails || {})) {
    if (count > worstLevelFails) {
      worstLevelFails = count;
      worstLevelId = Number(idStr);
    }
  }
  const worstMeta = levelMetaList.find((l) => l.id === worstLevelId);
  const worstLevelText = worstLevelFails > 0 && worstMeta
    ? `Lv.${worstMeta.id}《${worstMeta.title}》— 红温 ${worstLevelFails} 次`
    : '全程零红温！血压稳如老狗';

  // Grade calculation
  let grade = 'A';
  let gradeLabel = '合格碳基生物';
  if (skipCount > 6 || finalSus >= 90) {
    grade = 'ERR';
    gradeLabel = '硅基卧底·已报备';
  } else if (skipCount === 0 && rawMs <= 95000 && totalFails <= 3) {
    grade = 'S+';
    gradeLabel = '纯血碳基·免检';
  } else if (skipCount === 0 && rawMs <= 165000) {
    grade = 'S';
    gradeLabel = '高纯度人类';
  } else if (skipCount <= 1 && rawMs <= 240000) {
    grade = 'A';
    gradeLabel = '合格碳基生物';
  } else if (skipCount <= 3) {
    grade = 'B';
    gradeLabel = '轻微掉帧人类';
  } else {
    grade = 'C';
    gradeLabel = '高度疑似混血';
  }

  // 14-priority dynamic title tree
  let title = '认证不烧心纯人类';
  if (flags.stoppedTrain) {
    title = '徒手按停火车的神';
  } else if (skipCount === 0 && rawMs <= 85000) {
    title = '碳基速通战神';
  } else if (flags.godTiming && flags.perfectCircle) {
    title = '人形高精度外挂';
  } else if (flags.perfectCircle) {
    title = '人间圆规精';
  } else if (flags.godTiming) {
    title = '手稳得像脚本';
  } else if (skipCount >= 5) {
    title = '天网派来的潜伏者';
  } else if (flags.pressedRedButton && totalFails >= 8) {
    title = '红温暴躁老哥';
  } else if (flags.pressedRedButton) {
    title = '红按钮终结者';
  } else if (totalFails === 0 && skipCount === 0) {
    title = '零失误无情过关机';
  } else if (worstLevelId === 6 && worstLevelFails >= 3) {
    title = '蚊子的一生之敌';
  } else if (worstLevelId === 17 && worstLevelFails >= 3) {
    title = '端水大师（翻车版）';
  } else if (flags.trolleyChoice === 'fav') {
    title = 'B站收藏夹守护神';
  } else if (flags.trolleyChoice === 'drink') {
    title = '大水续命狂魔';
  }

  const subBadges = [];
  if (flags.stoppedTrain) subBadges.push('stoppedTrain');
  if (flags.perfectCircle) subBadges.push('perfectCircle');
  if (flags.godTiming) subBadges.push('godTiming');
  if (flags.pressedRedButton) subBadges.push('pressedRedButton');
  if (skipCount === 0) subBadges.push('noSkip');

  let trolleyText = '电车难题立场：佛系挂机看戏派';
  if (flags.stoppedTrain) trolleyText = '电车难题立场：直接徒手把火车按停了（离谱）';
  else if (flags.trolleyChoice === 'fav') trolleyText = '电车难题立场：拼死保住 500 个 B站收藏夹';
  else if (flags.trolleyChoice === 'drink') trolleyText = '电车难题立场：收藏夹算啥，续命大水第一';

  let remark = '“虽然中途差点把手机拍碎，但那股不服输的倔劲儿确实很人类。”';
  if (grade === 'S+') {
    remark = '“操作行云流水，连保安都怀疑你是不是穿越回来的老玩家。”';
  } else if (grade === 'ERR') {
    remark = '“建议立刻去喝两升大水冷静一下，天网已经发来面试邀请了。”';
  } else if (flags.pressedRedButton) {
    remark = '“越不让按越要按——恭喜，这正是人类最宝贵的叛逆基因！”';
  } else if (totalFails >= 10) {
    remark = '“红温次数感人，但宁死不退的精神已经打败了 99% 的大模型。”';
  }

  const certSeed = Math.abs(Math.floor(effectiveMs * 7 + totalFails * 131 + humanPurity * 97)) % 899999 + 100000;
  const certNo = `NO.2026-${certSeed}`;

  const shareCopy = `我刚打通了《绝对证明你是人类·2026地狱验证》20关！\n鉴定评级：【${grade} ${gradeLabel}】碳基纯度 ${humanPurity}%\n有效耗时：${formatMs(effectiveMs)}（红温 ${totalFails} 次 / 跳过 ${skipCount} 次）\n喜提称号：【${title}】\n最让我破防的是：${worstLevelText}\n敢不敢来测测你的硅基浓度有多高？`;

  return {
    rawMs,
    effectiveMs,
    skipCount,
    totalFails,
    finalSus,
    humanPurity,
    grade,
    gradeLabel,
    title,
    subBadges,
    worstLevelText,
    trolleyText,
    remark,
    certNo,
    shareCopy
  };
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = Array.from(text);
  let line = '';
  let cy = y;
  for (let i = 0; i < chars.length; i++) {
    const test = line + chars[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = chars[i];
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
  return cy;
}

function roundRect(ctx, x, y, w, h, r) {
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

export function renderCertificateDataURL(ev, playerName = 'B站纯血人类') {
  const W = 750;
  const H = 1180;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 1. Ivory official paper background
  ctx.fillStyle = '#FBF9F4';
  ctx.fillRect(0, 0, W, H);

  // Subtle paper border stripes top & bottom
  ctx.fillStyle = '#1E3A5F';
  ctx.fillRect(0, 0, W, 18);
  ctx.fillStyle = '#00AEEC';
  ctx.fillRect(0, 18, W, 6);
  ctx.fillStyle = '#1E3A5F';
  ctx.fillRect(0, H - 18, W, 18);

  // Outer security frame
  ctx.strokeStyle = '#2C3E50';
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 42, W - 56, H - 84);
  ctx.strokeStyle = 'rgba(44, 62, 80, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(38, 52, W - 76, H - 104);

  // 2. Diagonal anti-counterfeit watermark
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.24);
  ctx.fillStyle = 'rgba(24, 25, 28, 0.038)';
  ctx.font = '900 44px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  for (let wy = -460; wy <= 460; wy += 190) {
    ctx.fillText('bCAPTCHA 2026 · 绝不烧心', 0, wy);
  }
  ctx.restore();

  // 3. Header metadata
  ctx.fillStyle = '#64748B';
  ctx.font = '700 22px ui-monospace, Menlo, Consolas, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('全网碳基生物安全检疫中心', 60, 98);
  ctx.textAlign = 'right';
  ctx.fillText(ev.certNo, W - 60, 98);

  ctx.strokeStyle = '#2C3E50';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(60, 114);
  ctx.lineTo(W - 60, 114);
  ctx.stroke();

  // Official Serif Title
  ctx.fillStyle = '#18191C';
  ctx.textAlign = 'center';
  ctx.font = '900 42px "Songti SC", "STSong", "SimSun", Georgia, serif';
  ctx.fillText('2026 人类纯度官方鉴定证书', W / 2, 180);

  ctx.fillStyle = '#64748B';
  ctx.font = '700 18px ui-monospace, Menlo, Consolas, monospace';
  ctx.fillText('OFFICIAL CARBON-BASED IDENTITY REPORT · v2026.11', W / 2, 214);

  // 4. Subject Info Block (Left)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.font = '600 24px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('受检对象：', 64, 288);
  ctx.fillStyle = '#18191C';
  ctx.font = '800 30px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(playerName, 190, 288);

  ctx.fillStyle = '#64748B';
  ctx.font = '600 24px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('碳基纯度：', 64, 348);
  ctx.fillStyle = ev.humanPurity >= 75 ? '#00A86B' : (ev.humanPurity >= 45 ? '#D97706' : '#E0243C');
  ctx.font = '900 46px ui-monospace, Menlo, Consolas, monospace';
  ctx.fillText(`${ev.humanPurity}%`, 190, 352);

  // Purity bar
  roundRect(ctx, 64, 372, 390, 18, 9);
  ctx.fillStyle = '#E5E7EB';
  ctx.fill();
  roundRect(ctx, 64, 372, Math.max(18, 390 * (ev.humanPurity / 100)), 18, 9);
  ctx.fillStyle = ev.humanPurity >= 75 ? '#00B578' : (ev.humanPurity >= 45 ? '#FF9F1C' : '#FF3B5C');
  ctx.fill();

  // Dynamic Title Sticker (Comic Pop Accent)
  ctx.fillStyle = '#64748B';
  ctx.font = '600 22px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('专属鉴定称号', 64, 434);

  const badgeText = `【${ev.title}】`;
  ctx.font = '900 30px "PingFang SC", "Microsoft YaHei", sans-serif';
  const badgeW = Math.min(W - 128, ctx.measureText(badgeText).width + 44);
  roundRect(ctx, 68, 452, badgeW, 56, 12);
  ctx.fillStyle = '#18191C';
  ctx.fill();
  roundRect(ctx, 64, 448, badgeW, 56, 12);
  ctx.fillStyle = '#FFF4B8';
  ctx.fill();
  ctx.strokeStyle = '#18191C';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#18191C';
  ctx.fillText(badgeText, 86, 487);

  // 5. Official Cinnabar Red Circular Stamp (Right, rotated -14 deg)
  ctx.save();
  ctx.translate(585, 325);
  ctx.rotate(-0.24);
  ctx.strokeStyle = 'rgba(224, 36, 60, 0.88)';
  ctx.fillStyle = 'rgba(224, 36, 60, 0.05)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 80, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(224, 36, 60, 0.92)';
  ctx.textAlign = 'center';
  ctx.font = '800 17px "Songti SC", "SimSun", serif';
  ctx.fillText('★ 碳基鉴定专用章 ★', 0, -45);
  ctx.font = '900 56px ui-monospace, Menlo, Consolas, monospace';
  ctx.fillText(ev.grade, 0, 18);
  ctx.font = '800 18px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(ev.gradeLabel, 0, 52);
  ctx.restore();

  // 6. 3-Column Metrics Cards
  const metrics = [
    { label: '有效速通耗时', value: formatMs(ev.effectiveMs), color: '#008FC5' },
    { label: '红温失误次数', value: `${ev.totalFails} 次`, color: '#E0243C' },
    { label: '人机跳过次数', value: `${ev.skipCount} 次`, color: ev.skipCount === 0 ? '#00B578' : '#D97706' }
  ];
  const cardW = 196;
  const cardGap = 19;
  metrics.forEach((m, i) => {
    const cx = 62 + i * (cardW + cardGap);
    roundRect(ctx, cx, 540, cardW, 126, 14);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#D8D2C5';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748B';
    ctx.font = '600 21px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(m.label, cx + cardW / 2, 582);

    ctx.fillStyle = m.color;
    ctx.font = '900 30px ui-monospace, Menlo, Consolas, monospace';
    ctx.fillText(m.value, cx + cardW / 2, 636);
  });

  // 7. Worst Rage Callout Box
  roundRect(ctx, 62, 696, W - 124, 146, 14);
  ctx.fillStyle = '#FFF1F3';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 59, 92, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#E0243C';
  ctx.font = '800 24px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('🔥 最高血压红温点名', 86, 738);

  ctx.fillStyle = '#1E293B';
  ctx.font = '700 24px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(ev.worstLevelText, 86, 780);

  ctx.fillStyle = '#475569';
  ctx.font = '600 21px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(ev.trolleyText, 86, 820);

  // 8. Security Guard Final Remark
  ctx.fillStyle = '#64748B';
  ctx.font = '700 21px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('保安终审寄语：', 64, 890);

  ctx.fillStyle = '#334155';
  ctx.font = 'italic 700 25px "PingFang SC", "Microsoft YaHei", sans-serif';
  wrapText(ctx, ev.remark, 64, 932, W - 128, 38);

  // 9. Footer Barcode & Branding
  ctx.strokeStyle = '#CBD5E1';
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(62, 1020);
  ctx.lineTo(W - 62, 1020);
  ctx.stroke();
  ctx.setLineDash([]);

  // Crisp decorative barcode
  let bx = 64;
  const widths = [4, 2, 6, 2, 3, 5, 2, 6, 3, 2, 4, 2, 5, 3, 2, 6, 2, 4, 3, 5, 2, 4, 2, 6];
  ctx.fillStyle = '#18191C';
  widths.forEach((w, idx) => {
    if (idx % 2 === 0) ctx.fillRect(bx, 1044, w, 62);
    bx += w + 3;
  });

  ctx.textAlign = 'right';
  ctx.fillStyle = '#18191C';
  ctx.font = '900 24px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('Bilibili Toy · 2026地狱验证', W - 64, 1072);

  ctx.fillStyle = '#64748B';
  ctx.font = '600 19px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('长按保存发评论区 · 看看谁才是硅基卧底', W - 64, 1106);

  return canvas.toDataURL('image/png');
}
