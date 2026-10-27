// ================= 第10集：参与开源 =================
Object.assign(SQ.C, { role: '先看规矩' }); Object.assign(SQ.K, { role: '读完 issue' }); Object.assign(SQ.X, { role: '直接推' });
Object.assign(SQ.Q, { role: '上游动态' }); Object.assign(SQ.B, { role: '送 PR' }); Object.assign(SQ.M, { role: '被审查' });
const ACC = '#5f3dc4', CLUE = '#ffd23f', MAINC = '#3ec1ff', FEATC = '#ff7a3d', NEWC = '#ffd23f', KNOTC = '#ff4d6d', OKC = '#1f883d', BADC = '#cf222e', RUNC = '#d4a72c', LIVEC = '#1a7f37', GOODC = '#2fbf71';
const UPC = '#f59f00', ORIC = '#3ec1ff', LOCC = '#a78bfa', PRC = '#2da44e', GFI = '#7057ff', HWC = '#008672';
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
// GitHub 风格浏览器窗口（白底）：x,y 左上；title 是地址栏
function ghWin(x, y, w, h, url, o = {}) {
  box(x, y, w, h, 18, '#fff', o.border || '#d0d7de', 4); box(x, y, w, 56, [18, 18, 0, 0], '#f6f8fa');
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 28 + i * 24, y + 28, 8, 0, 7); ctx.fill(); });
  box(x + 110, y + 12, w - 140, 32, 16, '#fff', '#d0d7de', 2); txt(url, x + 128, y + 29, 20, '#57606a', { font: F_CODE, bold: false, max: w - 180 });
}
// 仓库标题行：owner/name + 可选 forked from
function repoHead(x, y, owner, name, o = {}) {
  let cx = x; cx += txt('📦 ', cx, y, 30, '#000', { font: EMOJI, bold: false }); cx += txt(owner + ' / ', cx, y, 30, '#0969da', { font: F_CODE, bold: false }); txt(name, cx, y, 30, '#0969da', { font: F_CODE });
  if (o.from) txt('forked from ' + o.from, x + 44, y + 34, 20, '#57606a', { font: F_CODE, bold: false });
}
// GitHub 按钮
function ghBtn(x, y, label, o = {}) {
  ctx.font = `bold ${o.fs || 24}px ${isCJK(label) ? F_BODY : F_CODE}`; const w = o.w || ctx.measureText(label).width + 40, h = o.h || 46;
  if (o.hot) { ctx.save(); ctx.shadowColor = o.hc || CLUE; ctx.shadowBlur = 26 + 8 * Math.sin((o.t || 0) * 8); box(x - w / 2, y - h / 2, w, h, 10, o.bg || '#f6f8fa', o.hc || CLUE, 4); ctx.restore(); }
  else box(x - w / 2, y - h / 2, w, h, 10, o.bg || '#f6f8fa', o.bd || '#d0d7de', 2);
  txt(label, x, y + 1, o.fs || 24, o.fg || '#24292f', { align: 'center', font: isCJK(label) ? F_BODY + ',' + EMOJI : F_CODE + ',' + EMOJI });
  return w;
}
// 标签胶囊（GitHub label）
function ghLabel(x, y, label, col, s = 1, fs = 20) {
  if (s <= 0) return 0; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.font = `bold ${fs}px ${F_CODE}`; const w = ctx.measureText(label).width + 26;
  box(0, -fs * 0.75, w, fs * 1.5, fs * 0.75, hexA(col, 0.18), col, 2); txt(label, w / 2, 1, fs, col, { align: 'center', font: F_CODE }); ctx.restore(); return w;
}
// issue 行
function issueRow(t, x, y, w, r, o = {}) {
  const a = clamp(prog(t, r.t ?? -1, 0.2)); if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a * (r.dim ? 0.3 : 1);
  if (r.hot) { ctx.shadowColor = GFI; ctx.shadowBlur = 24; } box(x, y, w, 72, 10, r.hot ? '#f5f0ff' : '#fff', r.hot ? GFI : '#d0d7de', r.hot ? 4 : 2); ctx.shadowBlur = 0;
  ctx.strokeStyle = r.closed ? '#8250df' : PRC; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x + 32, y + 36, 11, 0, 7); ctx.stroke(); ctx.fillStyle = r.closed ? '#8250df' : PRC; ctx.beginPath(); ctx.arc(x + 32, y + 36, 3.5, 0, 7); ctx.fill();
  const cx = x + 56 + txt(r.title, x + 56, y + 36, 26, '#24292f', { font: isCJK(r.title) ? F_BODY : F_CODE, max: w * 0.5 }) + 14;
  let lx = cx; (r.labels || []).forEach(l => { lx += ghLabel(lx, y + 36, l[0], l[1], 1, 18) + 8; });
  txt(r.num, x + w - 18, y + 36, 22, '#57606a', { align: 'right', font: F_CODE, bold: false });
  ctx.restore();
}
// 三角远程图：上游 / 你的复刻 / 你的电脑。act: {fork, clone, up, fetch, push, pr}（值为出现时间）
const TRI = { up: [1010, 260], ori: [1530, 260], loc: [1270, 640] };
function triNode(t, k, s, lab, sub, col, icon) {
  if (s <= 0) return; const [x, y] = TRI[k]; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  box(-170, -78, 340, 156, 22, '#fff', col, 6); txt(icon, -118, -6, 52, '#000', { align: 'center', font: EMOJI, bold: false });
  txt(lab, 26, -22, 32, '#1b1433', { align: 'center' }); txt(sub, 26, 26, 22, col, { align: 'center', font: F_CODE, max: 230 }); ctx.restore();
}
function triArrow(t, from, to, t0, col, lab, o = {}) {
  if (t < t0) return; const p = eOut(prog(t, t0, 0.45)); const [x0, y0] = TRI[from], [x1, y1] = TRI[to];
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy * (o.side || 0), ny = ux * (o.side || 0);
  const sx = x0 + ux * (o.pad0 || 175) + nx, sy = y0 + uy * (o.pad0 || 100) + ny, ex = x1 - ux * (o.pad1 || 175) + nx, ey = y1 - uy * (o.pad1 || 100) + ny;
  const cx = lerp(sx, ex, p), cy = lerp(sy, ey, p); ctx.save(); if (o.dash) ctx.setLineDash([16, 10]); seg(sx, sy, cx, cy, col, 1, 8); ctx.restore();
  if (p > 0.95) { const a = Math.atan2(ey - sy, ex - sx); ctx.save(); ctx.translate(ex, ey); ctx.rotate(a); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-20, -16); ctx.lineTo(-20, 16); ctx.fill(); ctx.restore(); }
  if (lab && p > 0.5) pill((sx + ex) / 2 + (o.lx || 0), (sy + ey) / 2 + (o.ly || 0), lab, col, popIn(t, t0 + 0.2), { fs: 26, font: isCJK(lab) ? F_BODY : F_CODE });
}
// README 卡（错别字）：fixed 0 原样 / 1 圈红 / 2 已改
function readmeCard(t, cx, cy, s, st, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  box(-330, -200, 660, 400, 20, '#fff', o.col || '#d0d7de', 5); box(-330, -200, 660, 60, [20, 20, 0, 0], '#f6f8fa'); txt('📄 README.md', -300, -170, 26, '#24292f', { font: EMOJI + ',' + F_CODE });
  txt('# ⏲️ 电饭煲计时器', -300, -100, 36, '#24292f', { font: EMOJI + ',' + F_BODY });
  const w1 = txt('按下开始，米饭就会自动', -300, -20, 30, '#24292f', {});
  const ch = st === 2 ? '煮' : '者'; txt(ch, -300 + w1, -20, 30, st === 2 ? OKC : st === 1 ? BADC : '#24292f', {}); txt('熟。', -300 + w1 + 30, -20, 30, '#24292f', {});
  if (st === 1) { ctx.strokeStyle = BADC; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(-300 + w1 + 15, -20, 30, 28, 0, 0, 7); ctx.stroke(); }
  if (st === 2) { ctx.save(); ctx.globalAlpha *= 0.9; txt('✓', -300 + w1 + 15, -66, 30, OKC, { align: 'center' }); ctx.restore(); }
  txt('· 支持倒计时提醒', -300, 50, 26, '#57606a', {}); txt('· MIT License', -300, 100, 26, '#57606a', {}); txt('⭐ 2.3k', 300, 150, 26, '#9a6700', { align: 'right', font: EMOJI + ',' + F_CODE });
  ctx.restore();
}
function lockIcon(x, y, s, col = BADC) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, -30, 40, Math.PI, 0); ctx.stroke();
  box(-62, -30, 124, 100, 16, col); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 10, 13, 0, 7); ctx.fill(); ctx.fillRect(-5, 10, 10, 30); ctx.restore();
}

// ---- 冷开场：想修错别字，没有写权限 ----
SC.cold = (t, blk) => {
  const t0 = blk.t0, lk = P('D01', 0.62); let [sx, sy] = shake(t, lk, 10, 0.35); ctx.translate(sx, sy);
  bgBurst(t, '#123a5c', '#2f6fe0', W * 0.62, H * 0.5, 22, 0.35);
  readmeCard(t, 1290, 420, eBack(prog(t, t0 + 0.05, 0.45)) * 1.2, t >= P('D01', 0.3) ? 1 : 0);
  if (t >= P('D01', 0.3)) note(1290, 720, popIn(t, P('D01', 0.32)), '“者熟” → “煮熟”', CLUE, { fs: 40, rot: -0.03 });
  if (t >= lk) { flash(t, lk, 0.15, '255,80,120'); ctx.fillStyle = `rgba(15,12,31,${0.45 * eOut(prog(t, lk, 0.3))})`; rr(950, 160, 680, 520, 24); ctx.fill(); lockIcon(1290, 360, eBack(prog(t, lk, 0.35)) * 1.4); stamp(t, lk + 0.2, 1290, 540, '没有写权限', BADC, 60, -0.08); }
  const p = spring(prog(t, t0, 0.9)); if (t < lk) sprite('d_phone', 470, H + 40, 990, { scale: lerp(1.2, 1, p) * breath(t, 1) }); else sprite('d_shock', 470, H + 40, 990, { scale: lerp(1.15, 1, spring(prog(t, lk, 0.6))) });
  pill(470, 150, '大肥鱼 · 想帮忙', SQ.D.col, popIn(t, t0 + 0.15), { font: F_FANCY, fs: 44, fg: '#fff' });
  if (t >= lk) fancy('想改却改不了？！', 470, 270, 76, t, lk + 0.1, { rot: -0.06, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
};
SFX_FNS.push(() => { const b = BK.cold; sfx(b.t0 + 0.05, 'swoosh_in', 0.5); sfx(b.t0 + 0.15, 'pop', 0.4); sfx(P('D01', 0.3), 'ding', 0.4); sfx(P('D01', 0.32), 'pop', 0.4);
  sfx(P('D01', 0.62), 'impact', 0.6); sfx(P('D01', 0.62) + 0.2, 'stamp', 0.6); sfx(P('D01', 0.62) + 0.1, 'boing', 0.4); });

// ---- 引入：复刻 → 改 → PR；帮厨比喻 ----
SC.why = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const sw = S('G01_02') - 0.2, a1 = 1 - eIO(prog(t, sw, 0.35));
  if (a1 > 0) { ctx.save(); ctx.globalAlpha *= a1;
    pill(1280, 130, '🌍 没权限也能贡献', CLUE, popIn(t, blk.t0 + 0.1), { fs: 42, font: F_BODY + ',' + EMOJI });
    const k1 = P('G01_01', 0.35), k2 = P('G01_01', 0.55), k3 = P('G01_01', 0.72), k4 = P('G01_01', 0.88);
    const nodes = [[900, 330, '🏛️', '原项目', 'octo-chef', UPC, blk.t0 + 0.2], [1660, 330, '🍴', '你的复刻', 'dafeiyu', ORIC, k1], [1660, 660, '✏️', '改好了', 'fix-typo', LOCC, k2], [900, 660, '✅', '维护者合并', 'merged', PRC, k4]];
    nodes.forEach(n => { const s = popIn(t, n[6], 0.4); if (s <= 0) return; ctx.save(); ctx.translate(n[0], n[1]); ctx.scale(s, s); box(-170, -95, 340, 190, 24, '#fffaf0', n[5], 7); txt(n[2], 0, -38, 60, '#000', { align: 'center', font: EMOJI, bold: false }); txt(n[3], 0, 28, 36, '#1b1433', { align: 'center' }); txt(n[4], 0, 68, 22, n[5], { align: 'center', font: F_CODE }); ctx.restore(); });
    const arr = (x0, y0, x1, y1, t0, col, lab, lx, ly) => { if (t < t0) return; const p = eOut(prog(t, t0, 0.4)); seg(x0, y0, lerp(x0, x1, p), lerp(y0, y1, p), col, 1, 9); if (p > 0.6) pill(lx, ly, lab, col, popIn(t, t0 + 0.15), { fs: 28, font: isCJK(lab) ? F_BODY : F_CODE }); };
    arr(1080, 330, 1480, 330, k1 - 0.1, ORIC, 'Fork 复刻', 1280, 280); arr(1660, 435, 1660, 555, k2 - 0.1, LOCC, '改', 1720, 495); arr(1480, 660, 1080, 660, k3, PRC, 'Pull Request', 1280, 610);
    ctx.restore(); }
  if (t >= sw) { const a = eOut(prog(t, sw, 0.35)); ctx.save(); ctx.globalAlpha *= a;
    pill(1280, 130, '👩‍🍳 就像去大饭店帮厨', CLUE, popIn(t, sw + 0.1), { fs: 42, font: F_BODY + ',' + EMOJI });
    [['📜', '读后厨规矩', 'LICENSE · CONTRIBUTING', P('G01_02', 0.12)], ['📋', '抄菜谱回家改', 'Fork · 分支', P('G01_02', 0.42)], ['🍲', '端回去请主厨尝', 'Pull Request', P('G01_02', 0.72)]].forEach((c, i) => { const s = popIn(t, c[3], 0.4); if (s <= 0) return;
      const x = 900 + i * 380; ctx.save(); ctx.translate(x, 450); ctx.scale(s, s); ctx.rotate((i - 1) * 0.04);
      box(-165, -180, 330, 360, 26, '#fffaf0', ACC, 7); txt(c[0], 0, -75, 92, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 0, 40, 38, '#1b1433', { align: 'center' }); txt(c[2], 0, 110, 22, ACC, { align: 'center', font: F_CODE, max: 300 }); ctx.restore();
      if (i < 2 && t >= c[3] + 0.2) txt('→', x + 190, 450, 60, '#fff', { align: 'center' }); });
    ctx.restore(); }
};
SFX_FNS.push(() => { const b = BK.why; sfx(b.t0 + 0.1, 'pop', 0.4); sfx(b.t0 + 0.2, 'pop', 0.3); [0.35, 0.55, 0.72, 0.88].forEach(f => sfx(P('G01_01', f), 'pop', 0.35)); sfx(P('G01_01', 0.72), 'whoosh', 0.4);
  sfx(S('G01_02') - 0.2, 'swoosh_in', 0.4); [0.12, 0.42, 0.72].forEach(f => sfx(P('G01_02', f), 'pop', 0.4)); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#123a5c', '#2f6fe0', W * 0.6, H * 0.45, 28, 0.2);
  ['🍴', '🌍', '🤝', '⭐', '✨'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  sprite('g_fork', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 60, 1040);
  sprite('d_happy', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 800);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-400, -10, 95, '#ff5c8a', '第10集', { fs: 48, rot: -0.15, fg: '#fff' });
    fancy('参与', 40, -70, 130, t, -99, FX.white);
    fancy('开源！', 110, 80, 150, t, -99, FX.yel);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况（左侧插图，画在 80..960）----
function probRulesQ(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.1, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 450); ctx.scale(s, s); ctx.translate(-520, -450);
  ghWin(110, 170, 820, 560, 'github.com/octo-chef/rice-timer'); repoHead(140, 260, 'octo-chef', 'rice-timer');
  const files = [['📁', 'src/', 0], ['📄', 'README.md', 0], ['⚖️', 'LICENSE', 1], ['🤝', 'CONTRIBUTING.md', 1], ['💬', 'CODE_OF_CONDUCT.md', 1], ['📄', 'package.json', 0]];
  const hot = P('C01', 0.45);
  files.forEach((f, i) => { const a = clamp(prog(t, t0 + 0.2 + i * 0.05, 0.2)); const y = 330 + i * 64; ctx.save(); ctx.globalAlpha *= a;
    const h = f[2] && t >= hot; if (h) box(130, y - 28, 780, 56, 8, hexA(CLUE, 0.25 + 0.08 * Math.sin(t * 8)), CLUE, 3); else box(130, y + 28, 780, 2, 0, '#eaeef2');
    txt(f[0], 160, y, 28, '#000', { font: EMOJI, bold: false }); txt(f[1], 210, y, 28, '#0969da', { font: F_CODE, bold: false }); if (h) txt('👈 先看', 890, y, 26, '#9a6700', { align: 'right', font: F_BODY + ',' + EMOJI }); ctx.restore(); });
  ctx.restore();
  if (U.D02 && t >= U.D02.vo + 0.3) stamp(t, U.D02.vo + 0.3, 520, 820, '还有规矩？', '#e07a3d', 58, -0.08);
}
const ISSUES = [
  { title: '支持暗色模式', labels: [['help wanted', HWC]], num: '#57' }, { title: 'README 错别字', labels: [['good first issue', GFI]], num: '#42', g: 1 },
  { title: '倒计时归零后崩溃', labels: [['bug', BADC]], num: '#61' }, { title: '补充英文文档', labels: [['good first issue', GFI]], num: '#45', g: 1 },
  { title: '重构计时模块', labels: [['refactor', '#57606a']], num: '#33' }];
function probIssueQ(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.1, 0.45); if (s <= 0) return; const hot = P('K01', 0.6);
  ctx.save(); ctx.translate(520, 450); ctx.scale(s, s); ctx.translate(-520, -450);
  ghWin(100, 170, 840, 560, 'github.com/octo-chef/rice-timer/issues');
  txt('⊙ 412 Open', 140, 260, 28, '#24292f', { font: F_CODE }); txt('✓ 1,208 Closed', 380, 260, 26, '#57606a', { font: F_CODE, bold: false });
  ISSUES.forEach((r, i) => issueRow(t, 120, 300 + i * 82, 800, Object.assign({ t: t0 + 0.25 + i * 0.06, hot: r.g && t >= hot, dim: !r.g && t >= hot }, r)));
  ctx.restore();
  if (t >= hot + 0.2) note(520, 780, popIn(t, hot + 0.2), '新人从这里开始', GFI, { fs: 36, rot: -0.03 });
  if (U.D03 && t >= U.D03.vo + 0.3) stamp(t, U.D03.vo + 0.3, 520, 870, '直接开改？', BADC, 52, -0.08);
}
function probForkQ(t, blk) {
  const t0 = blk.t0, d4 = U.D04 ? U.D04.vo : 1e9;
  const L = [{ s: 'git clone https://github.com/octo-chef/rice-timer.git', t: t0 + 0.2, cmd: true, dur: 0.6 }, { s: '{d}... 改好错别字，提交 ...', t: P('X01', 0.5) },
    { s: 'git push', t: P('X01', 0.7), cmd: true, dur: 0.2 }, { s: '{r}remote: Permission to octo-chef/rice-timer denied.', t: d4 - 0.1 }, { s: '{r}fatal: ... error: 403', t: d4 }];
  terminal(t, 100, 220, 840, 470, L, { title: '终端 — rice-timer', accent: '#d6283e', fs: 22, prompt: false });
  if (t >= d4) { flash(t, d4, 0.12, '255,60,90'); stamp(t, d4 + 0.1, 520, 800, '推送被拒 403', BADC, 58, -0.08); }
}
function probSyncQ(t, blk) {
  const t0 = blk.t0; box(100, 200, 840, 520, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
  txt('🏛️ 上游 main', 140, 270, 28, UPC, { font: EMOJI + ',' + F_BODY }); txt('🍴 你的复刻 main', 140, 520, 28, ORIC, { font: EMOJI + ',' + F_BODY });
  const N = {}, E = []; for (let i = 0; i < 3; i++) { N['a' + i] = { x: 200 + i * 110, y: 360, col: UPC, t0: t0 + 0.1 + i * 0.05 }; N['f' + i] = { x: 200 + i * 110, y: 610, col: ORIC, t0: t0 + 0.1 + i * 0.05 }; if (i) { E.push(['a' + (i - 1), 'a' + i, t0 + 0.1 + i * 0.05]); E.push(['f' + (i - 1), 'f' + i, t0 + 0.1 + i * 0.05]); } }
  const nw = P('Q01', 0.3); for (let i = 0; i < 5; i++) { const tt = nw + i * 0.12; N['n' + i] = { x: 530 + i * 90, y: 360, col: CLUE, t0: tt, r: 16 }; E.push([i ? 'n' + (i - 1) : 'a2', 'n' + i, tt]); }
  drawGraph(t, N, E, { r: 20, lw: 7 });
  if (t >= nw + 0.6) { txt('+20', 890, 300, 34, CLUE, { align: 'right', font: F_CODE }); ctx.save(); ctx.setLineDash([12, 10]); seg(420, 610, 880, 610, '#5a5580', 1, 5); ctx.restore(); pill(650, 670, 'This branch is 20 commits behind', '#ff9aa9', popIn(t, nw + 0.7), { fs: 22, font: F_CODE }); }
  if (U.D05 && t >= U.D05.vo + 0.3) stamp(t, U.D05.vo + 0.3, 520, 820, '落后 20 个！', BADC, 56, -0.08);
}
function probPrQ(t, blk) {
  const t0 = blk.t0; box(100, 200, 840, 520, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
  [[300, '🍴', '你的复刻', 'fix-typo ✓ 已推送', ORIC], [740, '🏛️', '原项目', 'octo-chef/rice-timer', UPC]].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s <= 0) return; ctx.save(); ctx.translate(c[0], 420); ctx.scale(s, s); box(-170, -120, 340, 240, 22, '#fff', c[4], 6); txt(c[1], 0, -50, 64, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[2], 0, 30, 34, '#1b1433', { align: 'center' }); txt(c[3], 0, 80, 20, c[4], { align: 'center', font: F_CODE + ',' + EMOJI, max: 320 }); ctx.restore(); });
  if (t >= P('B01', 0.5)) { const p = eOut(prog(t, P('B01', 0.5), 0.4)); ctx.save(); ctx.setLineDash([14, 10]); seg(480, 420, lerp(480, 560, p), 420, PRC, 1, 8); ctx.restore(); txt('?', 520, 360, 70, CLUE, { align: 'center', font: F_FANCY, bold: false }); txt('PR', 520, 470, 28, PRC, { align: 'center', font: F_CODE }); }
  if (U.D06 && t >= U.D06.vo + 0.3) stamp(t, U.D06.vo + 0.3, 520, 820, 'PR 发到哪？', '#d6336c', 56, -0.08);
}
function probReviewQ(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.1, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 450); ctx.scale(s, s); ctx.translate(-520, -450);
  ghWin(100, 170, 840, 560, 'github.com/octo-chef/rice-timer/pull/88');
  txt('修正 README 错别字 #88', 140, 260, 32, '#24292f', {}); box(140, 290, 760, 70, 12, '#fff5f5', BADC, 3); txt('✗ octo-chef requested changes', 170, 325, 26, BADC, { font: F_CODE });
  [['README.md 第 12 行', '这里的句号也改成全角吧'], ['README.md 第 20 行', '“定时” 统一成 “计时”']].forEach((c, i) => { const a = clamp(prog(t, P('M01', 0.2 + i * 0.15), 0.25)); ctx.save(); ctx.globalAlpha *= a; box(140, 390 + i * 140, 760, 120, 12, '#fff', '#d0d7de', 2); txt('💬 ' + c[0], 170, 425 + i * 140, 22, '#57606a', { font: EMOJI + ',' + F_BODY, bold: false }); txt(c[1], 170, 470 + i * 140, 28, '#24292f', {}); ctx.restore(); });
  ctx.restore();
  if (t >= P('M01', 0.6)) { const s2 = popIn(t, P('M01', 0.6)); ghBtn(520, 790, '关掉 PR，重开一个？', { fs: 30, bg: '#fff', bd: BADC, fg: BADC, w: 420, h: 66 }); }
  if (U.D07 && t >= U.D07.vo + 0.3) stamp(t, U.D07.vo + 0.3, 520, 880, '怎么更新？', '#a855f7', 50, -0.08);
}
function probAsk10(t, blk) {
  const t0 = blk.t0;
  [['📖 读', UPC], ['🔄 同', ORIC], ['📮 交', PRC]].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s > 0) { ctx.save(); ctx.translate(250 + i * 270, 480); ctx.scale(s, s); ctx.rotate((i - 1) * 0.06); box(-110, -140, 220, 280, 24, '#fff', c[1], 8); txt(c[0], 0, 0, 52, '#1b1433', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false }); ctx.restore(); } });
  if (t >= t0 + 0.6) txt('三个重点', 520, 760, 64, ACC, { align: 'center', font: F_FANCY, bold: false });
}
function probAskP(t, blk) {
  const t0 = blk.t0; readmeCard(t, 520, 430, popIn(t, t0 + 0.1, 0.4) * 1.15, 1);
  if (t >= P('D09', 0.5)) stamp(t, P('D09', 0.5), 520, 800, '修好它！', GOODC, 64, -0.08);
}
const PROB = {
  rulesQ: { chap: ['第①步', '先读规矩', '#e07a3d', F_BODY], q: '还有规矩？', bg: ['#fff0e0', '#ffd9b3'], draw: probRulesQ },
  issueQ: { chap: ['第②步', '认领 issue', GFI, F_BODY], q: '直接开改？', bg: ['#efe8ff', '#dccfff'], draw: probIssueQ },
  forkQ: { chap: ['第③步', '复刻 Fork', '#d6283e', F_BODY], q: '推送被拒！', bg: ['#ffe3e6', '#ffc4cc'], draw: probForkQ },
  syncQ: { chap: ['第④步', '同步上游', '#e8890c', F_BODY], q: '落后会怎样？', bg: ['#fff4db', '#ffe3a3'], draw: probSyncQ },
  prQ: { chap: ['第⑤步', '跨仓库发 PR', PRC, F_BODY], q: 'PR 发哪？', bg: ['#e3f7e9', '#c2edd0'], draw: probPrQ },
  reviewQ: { chap: ['第⑥步', '回应审查', '#a855f7', F_BODY], q: '怎么更新？', bg: ['#f3e8ff', '#e2ccff'], draw: probReviewQ },
  ask10: { chap: ['复习', '读 · 同 · 交', ACC, F_BODY], q: '帮我划重点！', bg: ['#ece3ff', '#d6c4ff'], draw: probAsk10 },
  askP: { chap: ['实战', '修好错别字', GOODC, F_BODY], q: '这就去修！', bg: ['#e3f7e9', '#c2edd0'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  for (let i = 0; i < 6; i++) sfx(BK.rulesQ.t0 + 0.2 + i * 0.05, 'pop', 0.2); sfx(P('C01', 0.45), 'ding', 0.4); sfx(U.D02.vo + 0.3, 'stamp', 0.6);
  for (let i = 0; i < 5; i++) sfx(BK.issueQ.t0 + 0.25 + i * 0.06, 'pop', 0.2); sfx(P('K01', 0.6), 'sparkle', 0.4); sfx(U.D03.vo + 0.3, 'stamp', 0.6);
  typeSfx(BK.forkQ.t0 + 0.2, 50, 0.6); typeSfx(P('X01', 0.7), 8, 0.2); sfx(U.D04.vo, 'buzz', 0.6); sfx(U.D04.vo + 0.1, 'stamp', 0.6);
  for (let i = 0; i < 5; i++) sfx(P('Q01', 0.3) + i * 0.12, 'pop', 0.3); sfx(P('Q01', 0.3) + 0.7, 'buzz', 0.4); sfx(U.D05.vo + 0.3, 'stamp', 0.6);
  sfx(BK.prQ.t0 + 0.15, 'pop', 0.3); sfx(BK.prQ.t0 + 0.27, 'pop', 0.3); sfx(P('B01', 0.5), 'whoosh', 0.4); sfx(U.D06.vo + 0.3, 'stamp', 0.6);
  sfx(BK.reviewQ.t0 + 0.1, 'pop', 0.4); sfx(P('M01', 0.2), 'pop', 0.3); sfx(P('M01', 0.35), 'pop', 0.3); sfx(P('M01', 0.6), 'buzz', 0.3); sfx(U.D07.vo + 0.3, 'stamp', 0.6);
  [0, 1, 2].forEach(i => sfx(BK.ask10.t0 + 0.15 + i * 0.12, 'pop', 0.3)); sfx(BK.askP.t0 + 0.1, 'pop', 0.4); sfx(P('D09', 0.5), 'stamp', 0.6);
});
