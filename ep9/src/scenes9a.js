// ================= 第9集：Git 侦探 =================
Object.assign(SQ.Q, { role: '用户反馈' }); Object.assign(SQ.K, { role: '读完卷宗' }); Object.assign(SQ.M, { role: '嫌疑人？' });
Object.assign(SQ.X, { role: '一刀砍一半' }); Object.assign(SQ.C, { role: '审查' }); Object.assign(SQ.B, { role: '摘樱桃' });
const ACC = '#5f3dc4', CLUE = '#ffd23f', MAINC = '#3ec1ff', FEATC = '#ff7a3d', NEWC = '#ffd23f', KNOTC = '#ff4d6d', OKC = '#1f883d', BADC = '#cf222e', RUNC = '#d4a72c', LIVEC = '#1a7f37', GOODC = '#2fbf71', CHERRY = '#e03131';
const isCJK = s => /[\u4e00-\u9fff]/.test(s);
function gDot(x, y, s, col, o = {}) {
  if (s <= 0) return; const r = o.r || 24; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.ghost) ctx.globalAlpha *= 0.3;
  if (o.glow) { ctx.fillStyle = hexA(col, 0.35); ctx.beginPath(); ctx.arc(0, 0, r * 1.9 + 5 * Math.sin((o.t || 0) * 8), 0, 7); ctx.fill(); }
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.lineWidth = r * 0.26; ctx.strokeStyle = '#fff'; ctx.stroke();
  if (o.mark) txt(o.mark, 0, 1, r * 1.05, '#fff', { align: 'center', font: F_CODE });
  if (o.lab) txt(o.lab, 0, o.up ? -r - 24 : r + 26, o.fs || 24, o.lc || '#fff', { align: 'center', font: isCJK(o.lab) ? F_BODY : F_CODE, max: o.max || 220 });
  ctx.restore();
}
function drawGraph(t, N, E, o = {}) {
  E.forEach(e => { const a = N[e[0]], b = N[e[1]]; if (!a || !b) return; const p = prog(t, e[2] ?? -1, 0.25); if (p <= 0) return;
    ctx.save(); if (a.ghost || b.ghost) ctx.globalAlpha *= 0.3; seg(a.x, a.y, b.x, b.y, e[3] || b.col, p, o.lw || 9); ctx.restore(); });
  Object.values(N).forEach(n => gDot(n.x, n.y, n.s ?? popIn(t, n.t0 ?? -1), n.col, Object.assign({ t, fs: o.fs, r: o.r }, n)));
}
function moveP(t, t0, d, x0, y0, x1, y1, lift = 90) { const p = eIO(prog(t, t0, d)); return [lerp(x0, x1, p), lerp(y0, y1, p) - Math.sin(p * Math.PI) * lift, p]; }
// 放大镜（x,y 镜片中心）
function magnifier(x, y, r, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.globalAlpha *= o.alpha ?? 1;
  ctx.strokeStyle = '#6b4a1f'; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(r * 0.72, r * 0.72); ctx.lineTo(r * 1.7, r * 1.7); ctx.stroke();
  ctx.fillStyle = 'rgba(190,235,255,0.28)'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.strokeStyle = '#c99a2e'; ctx.lineWidth = r * 0.16; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = r * 0.08; ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 3.6, 4.4); ctx.stroke();
  ctx.restore();
}
// 提交列表：rows = [{h, m, a, d, t, st}]；st: 0 普通 1 嫌疑(黄) 2 真凶(红) 3 无关(变淡) 4 清白(绿)；可以传函数 st(t)
function logRows(t, x, y, w, rows, o = {}) {
  const rh = o.rh || 70, fs = o.fs || 28;
  rows.forEach((r, i) => {
    const a = clamp(prog(t, r.t ?? -1, 0.2)); if (a <= 0) return; const st = typeof r.st === 'function' ? r.st(t) : (r.st || 0);
    const row = r.row != null ? (typeof r.row === 'function' ? r.row(t) : r.row) : i; const ry = y + row * rh;
    ctx.save(); ctx.globalAlpha *= a * (st === 3 ? 0.28 : 1);
    const bc = st === 1 ? CLUE : st === 2 ? KNOTC : st === 4 ? GOODC : '#d0d7de', bg = st === 1 ? '#fffbe6' : st === 2 ? '#fff0f2' : st === 4 ? '#effcf3' : '#fff';
    if (st === 1 || st === 2) { ctx.shadowColor = bc; ctx.shadowBlur = 24; }
    box(x, ry, w, rh - 10, 12, bg, bc, st === 1 || st === 2 || st === 4 ? 5 : 2); ctx.shadowBlur = 0;
    gDot(x + 34, ry + (rh - 10) / 2, 1, st === 2 ? KNOTC : st === 1 ? '#e8a400' : MAINC, { r: 12 });
    txt(r.h, x + 64, ry + (rh - 10) / 2, fs * 0.9, '#9a6700', { font: F_CODE });
    txt(r.m, x + 64 + fs * 4.2, ry + (rh - 10) / 2, fs, '#24292f', { font: isCJK(r.m) ? F_BODY : F_CODE, max: w - fs * 4.2 - 260 });
    if (r.a) txt(r.a + (r.d ? ' · ' + r.d : ''), x + w - 22, ry + (rh - 10) / 2, fs * 0.72, '#57606a', { align: 'right', bold: false });
    if (r.tag) { const tg = typeof r.tag === 'function' ? r.tag(t) : r.tag; if (tg) pill(x + w + 10 + tg[0].length * 12, ry + (rh - 10) / 2, tg[0], tg[1], popIn(t, tg[2] ?? -1), { fs: 24, font: isCJK(tg[0]) ? F_BODY : F_CODE }); }
    ctx.restore();
  });
}
// blame 视图：rows = [{h, a, d, code, t, st, ln}]
function blameView(t, x, y, w, rows, o = {}) {
  const rh = o.rh || 58, fs = o.fs || 24, a0 = o.alpha ?? 1; if (a0 <= 0) return; ctx.save(); ctx.globalAlpha *= a0;
  const h = 76 + rows.length * rh + 16; win(x, y, w, h, o.title || 'git blame index.html', o.accent || ACC, { bg: '#1b1730' });
  rows.forEach((r, i) => { const a = clamp(prog(t, r.t ?? -1, 0.2)); if (a <= 0) return; const st = typeof r.st === 'function' ? r.st(t) : (r.st || 0); const ry = y + 76 + i * rh + rh / 2;
    ctx.save(); ctx.globalAlpha *= a * (st === 3 ? 0.3 : 1);
    if (st === 1 || st === 2 || st === 4) box(x + 14, ry - rh / 2 + 3, w - 28, rh - 6, 8, hexA(st === 2 ? KNOTC : st === 4 ? GOODC : CLUE, 0.22 + 0.06 * Math.sin(t * 8)), st === 2 ? KNOTC : st === 4 ? GOODC : CLUE, 3);
    txt(r.h, x + 30, ry, fs, '#ffd36b', { font: F_CODE }); txt(r.a, x + 30 + fs * 4.3, ry, fs, AUTHC[r.a] || '#c9a6ff', { max: fs * 4 });
    txt(r.d, x + 30 + fs * 8.6, ry, fs * 0.85, '#8f8aa8', { font: F_CODE, bold: false });
    box(x + fs * 13.2, ry - rh / 2 + 6, 2, rh - 12, 0, '#3d3760');
    txt(String(r.ln), x + fs * 14.6, ry, fs * 0.85, '#6e6890', { align: 'right', font: F_CODE, bold: false });
    txt(r.code, x + fs * 15.2, ry, fs, '#ece9f7', { font: F_CODE, max: w - fs * 15.2 - 30 });
    ctx.restore(); });
  ctx.restore();
}
const AUTHC = { '大肥鱼': '#8fc3ff', 'Gemini': '#d4a6ff', '千问': '#9fb0ff', 'Kimi': '#b9c2ff', 'Claude': '#ffb98a' };
// 二分进度条：n 个提交；state(t) 返回 {lo, hi, mid, found, skip:[...]}
function bisectBar(t, x, y, w, n, S0, o = {}) {
  const tw = w / n; const st = S0;
  for (let i = 0; i < n; i++) { const cx = x + (i + 0.5) * tw; let col = '#5a5580';
    if (i <= st.lo) col = GOODC; else if (i >= st.hi) col = KNOTC; else col = '#bdb6e6';
    if ((st.skip || []).includes(i)) col = '#777';
    const hh = (o.h || 60) * (i === st.mid || i === st.found ? 1.35 : 1); box(cx - tw * 0.36, y - hh / 2, tw * 0.72, hh, Math.min(4, tw * 0.3), col); }
  if (st.mid != null && st.found == null) { const cx = x + (st.mid + 0.5) * tw; ctx.save(); ctx.translate(cx, y - (o.h || 60) * 0.95); ctx.fillStyle = CLUE; ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(-16, -8); ctx.lineTo(16, -8); ctx.fill(); ctx.restore(); }
  if (st.found != null) { const cx = x + (st.found + 0.5) * tw; ctx.save(); ctx.strokeStyle = KNOTC; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, y, (o.h || 60) * 0.9, 0, 7); ctx.stroke(); ctx.restore(); }
  if (o.labels !== false) { txt(o.left || 'v1.2 ✓ good', x, y + (o.h || 60) * 0.5 + 34, 24, GOODC, { font: F_CODE }); txt(o.right || 'bad ✗ HEAD', x + w, y + (o.h || 60) * 0.5 + 34, 24, KNOTC, { align: 'right', font: F_CODE }); }
}
// 二分步骤：steps = [[时间, lo, hi, mid]]，最后一步 [时间, lo, hi, null, found]
function bisectState(t, steps) { let s = steps[0]; steps.forEach(k => { if (t >= k[0]) s = k; }); return { lo: s[1], hi: s[2], mid: s[3], found: s[4], skip: s[5] }; }
// 白饭页小网页：btn 0 不见（虚线问号）/1 正常；s 缩放
function baifanPage(t, cx, cy, s, btn, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  box(-260, -190, 520, 380, 22, '#fffaf0', o.col || '#1b1433', 6); box(-260, -190, 520, 64, [22, 22, 0, 0], '#ffb347'); txt('🍚 白饭页', -230, -157, 30, '#fff', {});
  ['🍚 白米饭 ¥2', '🥚 卤蛋 ¥3', '🍮 布丁 ¥6'].forEach((m, i) => txt(m, -220, -88 + i * 50, 28, '#3b2a14', { font: EMOJI + ',' + F_BODY }));
  if (btn) { box(-120, 80, 240, 74, 37, '#ff7a3d', '#1b1433', 5); txt('点菜', 0, 118, 34, '#fff', { align: 'center' }); }
  else { ctx.save(); ctx.setLineDash([12, 10]); box(-120, 80, 240, 74, 37, null, '#cf222e', 5); ctx.restore(); txt('？', 0, 118, 44, BADC, { align: 'center' }); }
  ctx.restore();
}

// ---- 冷开场：点菜按钮不见了 ----
SC.cold = (t, blk) => {
  const t0 = blk.t0, d1 = S('D01'); let [sx, sy] = shake(t, P('D01', 0.3), 10, 0.35); ctx.translate(sx, sy);
  bgBurst(t, '#2b1d6b', '#5f3dc4', W * 0.62, H * 0.5, 22, 0.35);
  const wa = eBack(prog(t, t0 + 0.05, 0.4));
  // 用户反馈卡 + 网页
  const fadeQ = 1 - prog(t, d1 - 0.15, 0.3);
  if (fadeQ > 0) baifanPage(t, 1390, 430, wa * 1.15 * (0.6 + 0.4 * fadeQ), t < P('Q01', 0.55) ? 1 : 0);
  if (t >= P('Q01', 0.55) && t < d1) { flash(t, P('Q01', 0.55), 0.15, '255,80,120'); stamp(t, P('Q01', 0.6), 1600, 700, '按钮没了！', BADC, 60, -0.1); }
  if (t >= P('Q01', 0.2) && fadeQ > 0) pill(1390, 120, '📮 用户反馈 · 周三起', '#9fb0ff', popIn(t, P('Q01', 0.2)) * fadeQ, { fs: 38, font: F_BODY });
  // 大肥鱼：一百多个提交哗啦啦
  if (t >= d1 - 0.1) { const a = eOut(prog(t, d1 - 0.1, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(15,12,31,0.75)'; rr(940, 60, 900, 900, 30); ctx.fill();
    const msgs = ['改改', '更新', 'fix', '调整首页布局', '再改', 'wip', '加饮料菜单', '修错字', '改颜色', 'update', '调整配色', '真的好了'];
    for (let i = 0; i < 14; i++) { const k = (i + Math.floor((t - d1) * 9)) % msgs.length; const yy = 120 + ((i * 64 + (t - d1) * 380) % 840);
      ctx.save(); ctx.globalAlpha *= 0.85; box(980, yy - 26, 820, 52, 10, '#fff', '#d0d7de', 2); gDot(1010, yy, 1, MAINC, { r: 10 }); txt(msgs[k], 1040, yy, 26, '#24292f', { font: isCJK(msgs[k]) ? F_BODY : F_CODE }); ctx.restore(); }
    fancy('×100+', 1390, 500, 150, t, P('D01', 0.35), FX.red);
    ctx.restore(); }
  const qa = t < d1 ? 1 : 1 - prog(t, d1 - 0.2, 0.3);
  if (qa > 0) { const p = spring(prog(t, t0, 0.9)); ctx.save(); ctx.globalAlpha *= qa; sprite('q_alarm', 470, H + 40, 960, { scale: lerp(1.2, 1, p) }); ctx.restore(); pill(470, 150, '千问 · 用户反馈', SQ.Q.col, popIn(t, t0 + 0.15) * qa, { font: F_FANCY, fs: 44, fg: '#fff' }); }
  if (t >= d1 - 0.2) { const p = spring(prog(t, d1 - 0.2, 0.9)); sprite('d_panic', 470, H + 40, 990, { scale: lerp(1.3, 1, p) }); fancy('哪次改坏的？！', 470, 150, 84, t, d1 + 0.1, { rot: -0.08, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' }); }
};
SFX_FNS.push(() => { const b = BK.cold; sfx(b.t0 + 0.05, 'swoosh_in', 0.5); sfx(P('Q01', 0.2), 'pop', 0.4); sfx(P('Q01', 0.55), 'impact', 0.5); sfx(P('Q01', 0.6), 'stamp', 0.6);
  sfx(S('D01') - 0.2, 'swoosh_in', 0.5); sfx(P('D01', 0.3), 'boing', 0.4); sfx(P('D01', 0.35), 'impact', 0.6); });

// ---- 引入：搜 → 查 → 抓；破案比喻 ----
SC.why = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const sw = S('G01_02') - 0.2, a1 = 1 - eIO(prog(t, sw, 0.35));
  if (a1 > 0) { ctx.save(); ctx.globalAlpha *= a1;
    pill(1280, 140, '🕵️ Git 侦探 · 三步破案', CLUE, popIn(t, blk.t0 + 0.1), { fs: 42, font: F_BODY });
    [['🔍', '搜历史', 'git log', P('G01_01', 0.4)], ['🖐️', '查每一行', 'git blame', P('G01_01', 0.58)], ['✂️', '二分抓真凶', 'git bisect', P('G01_01', 0.76)]].forEach((c, i) => { const s = popIn(t, c[3], 0.4); if (s <= 0) return;
      const x = 900 + i * 380; ctx.save(); ctx.translate(x, 430); ctx.scale(s, s); ctx.rotate((i - 1) * 0.04);
      box(-160, -170, 320, 340, 26, '#fffaf0', ACC, 7); txt(c[0], 0, -70, 90, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 0, 40, 40, '#1b1433', { align: 'center' }); txt(c[2], 0, 110, 28, ACC, { align: 'center', font: F_CODE }); ctx.restore();
      if (i < 2 && t >= c[3] + 0.2) txt('→', x + 190, 430, 60, '#fff', { align: 'center' }); });
    if (t >= P('G01_01', 0.15) && t < P('G01_01', 0.4)) fancy('每个提交都是线索', 1280, 430, 70, t, P('G01_01', 0.15), FX.yel);
    ctx.restore(); }
  if (t >= sw) { const a = eOut(prog(t, sw, 0.35)); ctx.save(); ctx.globalAlpha *= a;
    pill(1280, 140, '🔎 就像破案', CLUE, popIn(t, sw + 0.1), { fs: 42, font: F_BODY });
    const k1 = P('G01_02', 0.1), k2 = P('G01_02', 0.4), k3 = P('G01_02', 0.7);
    // 卷宗
    const s1 = popIn(t, k1, 0.4); if (s1 > 0) { ctx.save(); ctx.translate(900, 420); ctx.scale(s1, s1); ctx.rotate(-0.06); box(-150, -110, 300, 220, 14, '#e8c98a', '#7a4b1f', 6); box(-150, -140, 130, 40, [14, 14, 0, 0], '#e8c98a', '#7a4b1f', 6); txt('卷宗', 0, -20, 46, '#5a3510', { align: 'center' }); txt('100 → 3', 0, 50, 34, BADC, { align: 'center', font: F_CODE }); ctx.restore(); txt('缩小范围', 900, 600, 34, '#fff', { align: 'center' }); }
    const s2 = popIn(t, k2, 0.4); if (s2 > 0) { ctx.save(); ctx.translate(1280, 420); ctx.scale(s2, s2); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.strokeStyle = '#3b2a6b'; ctx.lineWidth = 6;
      for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(0, 10, 20 + k * 15, 28 + k * 16, 0, 3.6, 6.0 + (k % 2) * 0.3); ctx.stroke(); } ctx.restore(); magnifier(1320, 400, 70 * s2, { rot: 0 }); txt('看指纹', 1280, 600, 34, '#fff', { align: 'center' }); }
    const s3 = popIn(t, k3, 0.4); if (s3 > 0) { ['🙂', '😐', '😈', '🙂'].forEach((f, i) => { const x = 1560 + i * 90, hot = i === 2; ctx.save(); ctx.translate(x, 430); ctx.scale(s3 * (hot ? 1.2 : 1), s3 * (hot ? 1.2 : 1)); box(-38, -90, 76, 180, 14, hot ? '#ffe0e4' : '#ece9f7', hot ? KNOTC : '#8f8aa8', 4); txt(f, 0, -30, 50, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore(); });
      txt('排查出那一个', 1695, 600, 34, '#fff', { align: 'center' }); if (t >= k3 + 0.4) stamp(t, k3 + 0.4, 1740, 330, '真凶！', BADC, 46, -0.1); }
    ctx.restore(); }
};
SFX_FNS.push(() => { const b = BK.why; sfx(b.t0 + 0.1, 'pop', 0.4); sfx(P('G01_01', 0.15), 'ding', 0.3); [0.4, 0.58, 0.76].forEach(f => sfx(P('G01_01', f), 'pop', 0.4));
  sfx(S('G01_02') - 0.2, 'swoosh_in', 0.4); [0.1, 0.4, 0.7].forEach(f => sfx(P('G01_02', f), 'pop', 0.4)); sfx(P('G01_02', 0.7) + 0.4, 'stamp', 0.5); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#241552', '#5f3dc4', W * 0.6, H * 0.45, 28, 0.2);
  ['🔍', '🕵️', '🧩', '🗂️', '✨'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  sprite('g_detective', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 60, 1040);
  sprite('d_detective', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 800);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-400, -10, 95, '#ff5c8a', '第9集', { fs: 52, rot: -0.15, fg: '#fff' });
    fancy('Git', 40, -70, 130, t, -99, FX.white);
    fancy('侦探！', 110, 80, 150, t, -99, FX.yel);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况（左侧插图，画在 80..960）----
function probSearchQ(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.1, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 460); ctx.scale(s, s); ctx.rotate(-0.02);
  box(-390, -300, 780, 600, 22, '#fff7e6', '#7a4b1f', 8); txt('📜 提交说明 × 100+', -350, -255, 34, '#7a4b1f', {});
  ctx.save(); rr(-370, -215, 740, 490, 12); ctx.clip();
  const msgs = ['改改', '更新', 'fix', '再改', 'wip', '调整首页布局', 'update', '改颜色', '修错字', '真的好了', '加饮料菜单', '调整配色'];
  const off = Math.max(0, t - t0 - 0.3) * 160;
  msgs.forEach((m, i) => { const yy = -180 + ((i * 58 - off) % (msgs.length * 58) + msgs.length * 58) % (msgs.length * 58); txt('• ' + m, -340, yy, 30, '#3b2a14', { font: isCJK(m) ? F_BODY : F_CODE }); txt('✓ 读过', 330, yy, 22, '#2f9e44', { align: 'right' }); });
  ctx.restore(); ctx.restore();
  if (t >= P('K01', 0.55)) { box(150, 790, 740, 90, 45, '#fff', '#1b1433', 5); txt('🔍 “删了按钮”', 190, 835, 34, '#1b1433', {}); txt('0 条结果', 860, 835, 30, BADC, { align: 'right' }); }
  if (U.D02 && t >= U.D02.vo + 0.3) stamp(t, U.D02.vo + 0.3, 520, 700, '说明靠不住！', BADC, 56, -0.08);
}
function probBlameQ(t, blk) {
  const t0 = blk.t0; const a = popIn(t, t0 + 0.1, 0.4); if (a <= 0) return;
  ctx.save(); ctx.translate(520, 460); ctx.scale(a, a); ctx.translate(-520, -460);
  win(110, 190, 820, 520, '📝 index.html', ACC, { bg: '#1b1730' });
  ['<nav class="top">', '  <a href="#menu">菜单</a>', '  <a href="#about">关于</a>', '</nav>', '<section id="menu">', '  <h2>今日菜单</h2>'].forEach((l, i) => { const p = clamp(prog(t, t0 + 0.2 + i * 0.06, 0.2)); ctx.save(); ctx.globalAlpha *= p;
    const hot = i >= 4 && t >= P('M01', 0.3); if (hot) box(130, 270 + i * 66, 780, 58, 8, hexA(CLUE, 0.22), CLUE, 3);
    txt(String(40 + i), 170, 300 + i * 66, 22, '#6e6890', { align: 'right', font: F_CODE, bold: false }); txt(l, 190, 300 + i * 66, 26, '#ece9f7', { font: F_CODE }); if (hot) txt('❓', 880, 300 + i * 66, 30, '#000', { align: 'right', font: EMOJI, bold: false }); ctx.restore(); });
  ctx.restore();
  if (t >= P('M01', 0.6)) note(520, 790, popIn(t, P('M01', 0.6)), '谁改的？', CLUE, { fs: 40, rot: -0.04 });
  if (U.D03 && t >= U.D03.vo + 0.3) magnifier(560, 560, 70 * popIn(t, U.D03.vo + 0.3), { rot: -0.3 });
}
function probBisectQ(t, blk) {
  const t0 = blk.t0; box(110, 220, 820, 480, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
  txt('100 个提交', 520, 290, 40, '#fff', { align: 'center' });
  const a = clamp(prog(t, t0 + 0.15, 0.4)); ctx.save(); ctx.globalAlpha *= a; bisectBar(t, 160, 450, 720, 50, { lo: 0, hi: 49, mid: null }, { h: 70 }); ctx.restore();
  const cut = P('X01', 0.6); if (t >= cut) { const p = eOut(prog(t, cut, 0.25)); ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.shadowColor = '#ff4d6d'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.moveTo(520, 340); ctx.lineTo(520, 340 + 230 * p); ctx.stroke(); ctx.restore();
    txt('🔪', 520, 330, 70, '#000', { align: 'center', font: EMOJI, bold: false }); txt('50', 330, 600, 36, '#ff9aa9', { align: 'center', font: F_CODE }); txt('50', 710, 600, 36, '#ff9aa9', { align: 'center', font: F_CODE }); }
  if (U.D04 && t >= U.D04.vo + 0.3) stamp(t, U.D04.vo + 0.3, 520, 810, '要试多少次？', '#a855f7', 56, -0.08);
}
function probRevertQ(t, blk) {
  const t0 = blk.t0; box(110, 220, 820, 480, 26, 'rgba(15,12,31,0.9)', '#fff', 5); txt('main（已推送）', 150, 280, 28, MAINC, {});
  const xs = [190, 320, 450, 580, 710, 840]; const labs = ['A', 'B', 'e5f6', '千问', 'Kimi', 'HEAD'];
  const back = U.D05 ? P('D05', 0.55) : 1e9; const N = {}, E = [];
  xs.forEach((x, i) => { const gone = i > 2 && t >= back; N['n' + i] = { x, y: 430, col: i === 2 ? KNOTC : MAINC, t0: t0 + 0.1 + i * 0.06, lab: labs[i], fs: 22, ghost: gone, glow: i === 2 }; if (i) E.push(['n' + (i - 1), 'n' + i, t0 + 0.1 + i * 0.06]); });
  drawGraph(t, N, E, { r: 24 });
  if (t >= back) { const p = eIO(prog(t, back, 0.5)); ctx.save(); ctx.strokeStyle = '#ff6b81'; ctx.lineWidth = 8; ctx.setLineDash([16, 10]); ctx.beginPath(); ctx.moveTo(840, 520); ctx.lineTo(lerp(840, 330, p), 520); ctx.stroke(); ctx.restore(); txt('reset --hard', 600, 570, 30, '#ff9aa9', { align: 'center', font: F_CODE });
    if (t >= back + 0.4) [['Q', 580], ['K', 710]].forEach(q => { avatar(q[0], q[1], 330, 36, { s: popIn(t, back + 0.4) }); txt('💦', q[1] + 30, 290, 36, '#000', { font: EMOJI, bold: false }); }); }
  if (t >= P('C01', 0.55)) stamp(t, P('C01', 0.55), 520, 790, '审查不通过 ✗', BADC, 60, -0.08);
}
function probCherryQ(t, blk) {
  const t0 = blk.t0; box(110, 220, 820, 480, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
  const N = { a: { x: 190, y: 330, col: MAINC, t0: t0 + 0.1 }, b: { x: 330, y: 330, col: MAINC, t0: t0 + 0.14 }, c: { x: 470, y: 330, col: MAINC, t0: t0 + 0.18 } }; const E = [['a', 'b', t0 + 0.14], ['b', 'c', t0 + 0.18]];
  ['甜点', '修错字', '做一半', '做一半'].forEach((l, i) => { N['f' + i] = { x: 400 + i * 130, y: 560, col: i === 1 ? CHERRY : FEATC, t0: t0 + 0.3 + i * 0.08, lab: l, fs: 22, glow: i === 1 && t >= P('B01', 0.3), r: i === 1 ? 28 : 22 }; E.push([i ? 'f' + (i - 1) : 'b', 'f' + i, t0 + 0.3 + i * 0.08]); });
  drawGraph(t, N, E, { r: 22 }); txt('main', 150, 280, 28, MAINC, { font: F_CODE }); txt('dessert 分支', 560, 650, 26, FEATC, {});
  if (t >= P('B01', 0.3)) txt('🍒', 530, 480, 60 * popIn(t, P('B01', 0.3)), '#000', { align: 'center', font: EMOJI, bold: false });
  if (U.D06 && t >= U.D06.vo + 0.2) stamp(t, U.D06.vo + 0.2, 520, 800, '只要这一个！', CHERRY, 58, -0.08);
}
function probAsk9(t, blk) {
  const t0 = blk.t0;
  [['🔍 搜', MAINC], ['🕵️ 查', ACC], ['🩹 修', OKC]].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s > 0) { ctx.save(); ctx.translate(250 + i * 270, 480); ctx.scale(s, s); ctx.rotate((i - 1) * 0.06); box(-110, -140, 220, 280, 24, '#fff', c[1], 8); txt(c[0], 0, 0, 52, '#1b1433', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false }); ctx.restore(); } });
  if (t >= t0 + 0.6) txt('三个重点', 520, 760, 64, ACC, { align: 'center', font: F_FANCY, bold: false });
}
function probAskP(t, blk) {
  const t0 = blk.t0; baifanPage(t, 520, 430, popIn(t, t0 + 0.1, 0.4) * 1.3, 0);
  if (t >= t0 + 0.5) magnifier(700, 560, 90 * popIn(t, t0 + 0.5), { rot: -0.2 });
  if (t >= P('D08', 0.5)) stamp(t, P('D08', 0.5), 520, 840, '抓真凶！', BADC, 64, -0.08);
}
const PROB = {
  searchQ: { chap: ['第①步', '搜历史', MAINC, F_BODY], q: '还能怎么搜？', bg: ['#e3ecff', '#c4d6ff'], draw: probSearchQ },
  blameQ: { chap: ['第②步', '查每一行', ACC, F_BODY], q: '谁改的？', bg: ['#ece3ff', '#d6c4ff'], draw: probBlameQ },
  bisectQ: { chap: ['第③步', '二分抓真凶', '#d6283e', F_BODY], q: '试多少次？', bg: ['#ffe3e6', '#ffc4cc'], draw: probBisectQ },
  revertQ: { chap: ['第④步', '安全地修', '#e07a3d', F_BODY], q: '删掉它？', bg: ['#fff0e0', '#ffd9b3'], draw: probRevertQ },
  cherryQ: { chap: ['第⑤步', '只拿一个提交', CHERRY, F_BODY], q: '能只拿一个？', bg: ['#ffe3e3', '#ffc9c9'], draw: probCherryQ },
  ask9: { chap: ['复习', '搜 · 查 · 修', ACC, F_BODY], q: '帮我划重点！', bg: ['#ece3ff', '#d6c4ff'], draw: probAsk9 },
  askP: { chap: ['实战', '抓出按钮真凶', BADC, F_BODY], q: '现在就抓！', bg: ['#ece3ff', '#d6c4ff'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  sfx(BK.searchQ.t0 + 0.1, 'pop', 0.4); sfx(P('K01', 0.55), 'buzz', 0.4); sfx(U.D02.vo + 0.3, 'stamp', 0.6);
  for (let i = 0; i < 6; i++) sfx(BK.blameQ.t0 + 0.2 + i * 0.06, 'pop', 0.2); sfx(P('M01', 0.3), 'ding', 0.3); sfx(P('M01', 0.6), 'pop', 0.4); sfx(U.D03.vo + 0.3, 'pop', 0.4);
  sfx(BK.bisectQ.t0 + 0.15, 'whoosh', 0.3); sfx(P('X01', 0.6), 'impact', 0.6); sfx(U.D04.vo + 0.3, 'stamp', 0.6);
  for (let i = 0; i < 6; i++) sfx(BK.revertQ.t0 + 0.1 + i * 0.06, 'pop', 0.2); sfx(P('D05', 0.55), 'whoosh', 0.5); sfx(P('D05', 0.55) + 0.4, 'boing', 0.3); sfx(P('C01', 0.55), 'stamp', 0.6);
  for (let i = 0; i < 4; i++) sfx(BK.cherryQ.t0 + 0.3 + i * 0.08, 'pop', 0.2); sfx(P('B01', 0.3), 'sparkle', 0.4); sfx(U.D06.vo + 0.2, 'stamp', 0.6);
  [0, 1, 2].forEach(i => sfx(BK.ask9.t0 + 0.15 + i * 0.12, 'pop', 0.3)); sfx(BK.askP.t0 + 0.1, 'pop', 0.4); sfx(P('D08', 0.5), 'stamp', 0.6);
});
