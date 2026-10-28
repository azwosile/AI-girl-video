// ================= 第11集：仓库体检 =================
Object.assign(SQ.Q, { role: '用户反馈' }); Object.assign(SQ.X, { role: '删了再说' }); Object.assign(SQ.B, { role: '设计稿太大' });
Object.assign(SQ.M, { role: '全红了' }); Object.assign(SQ.C, { role: '安全审查' }); Object.assign(SQ.K, { role: '翻遍历史' });
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

// ---- 第11集专用组件 ----
const SIZEC = '#e8590c', LFSC = '#0e9f6e', EOLC = '#d6336c', HISC = '#7048e8', DOCC = '#0f766e';
function termSfx(L) { L.forEach(l => { if (l.cmd) typeSfx(l.t, [...l.s].length, l.dur || 0.8); }); }
const fadeW = (t, a0, a1) => clamp(eOut(prog(t, a0, 0.3)) * (1 - prog(t, a1, 0.3)));
// PSD 文件图标（中心 x,y）
function psdIcon(x, y, s, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.globalAlpha *= o.alpha ?? 1;
  box(-46, -60, 92, 120, 12, o.bg || '#fff', o.col || SIZEC, 5); box(-34, -42, 68, 40, 8, o.col || SIZEC);
  txt('PSD', 0, -21, 24, '#fff', { align: 'center', font: F_CODE }); txt(o.lab || '180MB', 0, 28, 20, '#1b1433', { align: 'center', font: F_CODE });
  ctx.restore();
}
// 钥匙（x,y 为钥匙圈中心）
function keyIcon(x, y, s, col = CLUE, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.globalAlpha *= o.alpha ?? 1;
  if (o.glow) { ctx.shadowColor = col; ctx.shadowBlur = 30; }
  ctx.strokeStyle = col; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.stroke();
  ctx.fillStyle = col; ctx.fillRect(24, -7, 90, 14); ctx.fillRect(84, 0, 12, 26); ctx.fillRect(102, 0, 12, 18);
  if (o.broken) { ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(55, -20); ctx.lineTo(48, 0); ctx.lineTo(60, 20); ctx.stroke(); }
  ctx.restore();
}
// 云（LFS 存储 / GitHub）
function cloud(x, y, s, col, lab) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#fff'; ctx.strokeStyle = col; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(-80, 20, 60, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(-20, -40, 80, Math.PI, Math.PI * 1.9); ctx.arc(80, 0, 70, Math.PI * 1.4, Math.PI * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (lab) txt(lab, 0, 30, 30, col, { align: 'center' }); ctx.restore();
}
// 体检报告行
function checkRow(x, y, w, icon, lab, val, ok, s = 1) {
  if (s <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(s);
  box(x, y, w, 76, 14, ok ? '#effaf3' : '#fff5f5', ok ? GOODC : BADC, 4);
  txt(icon, x + 40, y + 38, 36, '#000', { align: 'center', font: EMOJI, bold: false }); txt(lab, x + 78, y + 38, 30, '#1b1433', {});
  txt(val, x + w - 70, y + 38, 28, ok ? OKC : BADC, { align: 'right', font: isCJK(val) ? F_BODY : F_CODE }); statusIcon(x + w - 36, y + 38, 18, ok ? 1 : 2, 0);
  ctx.restore();
}

// ---- 冷开场：推送被拒（文件 180 MB）----
const L_COLD = () => { const t0 = BK.cold.t0, lk = P('D01', 0.1); return [{ s: 'git push', t: t0 + 0.05, cmd: true, dur: 0.25 }, { s: '{d}Writing objects: 100% (12/12), 180.02 MiB', t: t0 + 0.35 },
  { s: '{r}remote: error: File design/白饭页设计稿.psd is 180.00 MB;', t: lk }, { s: "{r}remote: this exceeds GitHub's file size limit of 100.00 MB", t: lk + 0.1 },
  { s: '{y}remote: error: GH001: Large files detected.', t: lk + 0.2 }, { s: '{r} ! [remote rejected] main -> main (pre-receive hook declined)', t: lk + 0.3 }]; };
SC.cold = (t, blk) => {
  const t0 = blk.t0, lk = P('D01', 0.1); let [sx, sy] = shake(t, lk, 12, 0.35); ctx.translate(sx, sy);
  bgBurst(t, '#3a1020', '#c2255c', W * 0.62, H * 0.5, 22, 0.35);
  terminal(t, 860, 150, 1000, 430, L_COLD(), { title: '终端 — rice-page', accent: '#d6283e', fs: 22, prompt: false, scale: eBack(prog(t, t0, 0.4)) });
  if (t >= lk) { flash(t, lk, 0.15, '255,80,120'); stamp(t, lk + 0.35, 1560, 520, '推送被拒', BADC, 64, -0.1); }
  const g0 = P('D01', 0.3), gp = eOut(prog(t, g0, 0.7));
  if (t >= g0) { box(860, 630, 1000, 170, 22, 'rgba(15,12,31,0.94)', '#fff', 5);
    const bx = 900, bw = 920, by = 740; txt('🎨 白饭页设计稿.psd', bx, 675, 28, '#fff', { font: EMOJI + ',' + F_BODY });
    box(bx, by - 20, bw, 40, 20, '#2a2350'); box(bx, by - 20, Math.max(40, bw * 0.9 * gp), 40, 20, gp > 0.55 ? BADC : '#ff9f43');
    txt((180 * gp).toFixed(0) + ' MB', bx + Math.max(40, bw * 0.9 * gp) - 14, by + 1, 26, '#fff', { align: 'right', font: F_CODE });
    const lx = bx + bw * 0.5; ctx.save(); ctx.setLineDash([10, 8]); seg(lx, 650, lx, 790, CLUE, 1, 6); ctx.restore();
    if (t >= P('D01', 0.62)) pill(lx + 10, 660, '上限 100 MB', CLUE, popIn(t, P('D01', 0.62)), { fs: 26 }); }
  const p = spring(prog(t, t0, 0.9)); const sw = P('D01', 0.55);
  if (t < sw) sprite('d_heavy', 440, H + 40, 960, { scale: lerp(1.2, 1, p) * breath(t, 1) }); else sprite('d_shock', 440, H + 40, 990, { scale: lerp(1.15, 1, spring(prog(t, sw, 0.6))) });
  pill(440, 150, '大肥鱼 · 推送设计稿', SQ.D.col, popIn(t, t0 + 0.15), { font: F_FANCY, fs: 44, fg: '#fff' });
  if (t >= lk) fancy('推不上去？！', 440, 270, 80, t, lk + 0.1, { rot: -0.06, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
};
SFX_FNS.push(() => { const b = BK.cold; termSfx(L_COLD()); sfx(b.t0 + 0.15, 'pop', 0.4); const lk = P('D01', 0.1);
  sfx(lk, 'impact', 0.6); sfx(lk, 'buzz', 0.5); sfx(lk + 0.35, 'stamp', 0.6); sfx(P('D01', 0.3), 'whoosh', 0.4); sfx(P('D01', 0.55), 'boing', 0.4); sfx(P('D01', 0.62), 'ding', 0.4); });

// ---- 引入：仓库也要体检 ----
SC.why = (t, blk, en) => {
  bgLecture(t, DOCC); lecturer(t, blk, en, blk.t0);
  const sw = S('G01_02') - 0.2, a1 = 1 - eIO(prog(t, sw, 0.35));
  if (a1 > 0) { ctx.save(); ctx.globalAlpha *= a1;
    pill(1270, 130, '🩺 仓库用久了也要体检', CLUE, popIn(t, blk.t0 + 0.1), { fs: 42, font: F_BODY + ',' + EMOJI });
    [['🐘', '虚胖的大文件', '仓库越来越重', SIZEC, P('G01_01', 0.3)], ['↩️', '乱掉的换行符', 'CRLF / LF', EOLC, P('G01_01', 0.52)], ['🔑', '推上去的密钥', '谁都能看到', BADC, P('G01_01', 0.75)]].forEach((c, i) => {
      const s = popIn(t, c[4], 0.4); if (s <= 0) return; const x = 890 + i * 380; ctx.save(); ctx.translate(x, 470); ctx.scale(s, s); ctx.rotate((i - 1) * 0.04);
      box(-170, -200, 340, 400, 26, '#fffaf0', c[3], 7); txt(c[0], 0, -80, 100, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 0, 50, 36, '#1b1433', { align: 'center' }); txt(c[2], 0, 120, 26, c[3], { align: 'center', font: isCJK(c[2]) ? F_BODY : F_CODE });
      ctx.restore(); if (t >= c[4] + 0.3) stamp(t, c[4] + 0.3, x + 90, 300, '?', c[3], 60, 0.1); });
    ctx.restore(); }
  if (t >= sw) { const a = eOut(prog(t, sw, 0.35)); ctx.save(); ctx.globalAlpha *= a;
    const s = popIn(t, sw + 0.05, 0.45); ctx.save(); ctx.translate(1270, 470); ctx.scale(s, s); ctx.rotate(-0.02);
    box(-400, -330, 800, 660, 30, '#fff', DOCC, 8); box(-120, -360, 240, 60, 16, '#8a8f98'); txt('🩺 仓库体检单', 0, -250, 48, DOCC, { align: 'center', font: EMOJI + ',' + F_BODY });
    [['⚖️', '量体重', '仓库多大', 0.15], ['🔬', '查指标', '换行符 · 密钥', 0.4], ['💊', '马上处理', '发现就治', 0.62]].forEach((c, i) => { const y = -130 + i * 140, on = t >= P('G01_02', c[3]);
      box(-340, y - 55, 680, 110, 18, on ? '#effaf3' : '#f6f8fa', on ? GOODC : '#d0d7de', 3); txt(c[0], -290, y, 52, '#000', { align: 'center', font: EMOJI, bold: false });
      txt(c[1], -230, y - 14, 38, '#1b1433', {}); txt(c[2], -230, y + 30, 24, '#57606a', { bold: false }); box(230, y - 32, 64, 64, 12, '#fff', on ? GOODC : '#d0d7de', 4);
      if (on) { const k = eBack(prog(t, P('G01_02', c[3]), 0.3)); ctx.save(); ctx.translate(262, y); ctx.scale(k, k); txt('✓', 0, 0, 56, GOODC, { align: 'center' }); ctx.restore(); } });
    ctx.restore();
    if (t >= P('G01_02', 0.8)) fancy('今天三项全查！', 1270, 860, 72, t, P('G01_02', 0.8), FX.yel);
    ctx.restore(); }
};
SFX_FNS.push(() => { const b = BK.why; sfx(b.t0 + 0.1, 'pop', 0.4); [0.3, 0.52, 0.75].forEach(f => { sfx(P('G01_01', f), 'pop', 0.4); sfx(P('G01_01', f) + 0.3, 'stamp', 0.35); });
  sfx(S('G01_02') - 0.2, 'swoosh_in', 0.4); [0.15, 0.4, 0.62].forEach(f => sfx(P('G01_02', f), 'ding', 0.4)); sfx(P('G01_02', 0.8), 'sparkle', 0.4); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#0b3d3a', '#12a594', W * 0.6, H * 0.45, 28, 0.2);
  ['🩺', '⚖️', '🔑', '🐘', '✨'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  sprite('g_doctor', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 60, 1040);
  sprite('d_heavy', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 780);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-400, -10, 95, '#ff5c8a', '第11集', { fs: 48, rot: -0.15, fg: '#fff' });
    fancy('仓库', 40, -70, 130, t, -99, FX.white);
    fancy('体检！', 110, 80, 150, t, -99, FX.yel);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况（左侧插图，画在 80..960）----
const L_SIZEQ = () => { const t0 = BK.sizeQ.t0; return [{ s: 'git clone https://github.com/dafeiyu/rice-page.git', t: t0 + 0.2, cmd: true, dur: 0.5 }, { s: "{d}Cloning into 'rice-page'...", t: t0 + 0.75 }]; };
function probSizeQ(t, blk) {
  const t0 = blk.t0, r0 = t0 + 0.95; const L = L_SIZEQ();
  if (t >= r0) { const k = clamp((t - r0) / 6); const pct = Math.floor(k * 37), n = Math.floor(k * 812), mb = (k * 780).toFixed(1);
    L.push({ s: `{y}Receiving objects: ${pct}% (${n}/2194), ${mb} MiB`, t: r0 }); L.push({ s: '{r}预计剩余：09:48 ……', t: r0 + 0.4 }); }
  terminal(t, 100, 200, 840, 400, L, { title: '终端 — 用户的电脑', accent: SIZEC, fs: 21, prompt: false });
  if (t >= r0) { const k = clamp((t - r0) / 6); box(130, 650, 780, 44, 22, '#2a2350', '#fff', 3); box(134, 654, Math.max(36, 772 * k * 0.37), 36, 18, SIZEC);
    txt('🐌', 150 + 772 * k * 0.37, 620, 60, '#000', { align: 'center', font: EMOJI, bold: false }); }
  if (U.D02 && t >= U.D02.vo + 0.3) stamp(t, U.D02.vo + 0.3, 520, 820, '要十分钟！', BADC, 58, -0.08);
}
const L_DELQ = () => { const d3 = U.D03 ? U.D03.vo : 1e9; return [{ s: 'git rm design/白饭页设计稿.psd', t: BK.delQ.t0 + 0.2, cmd: true, dur: 0.4 }, { s: 'git commit -m "删掉大文件"', t: P('X01', 0.45), cmd: true, dur: 0.4 },
  { s: 'git push', t: P('X01', 0.8), cmd: true, dur: 0.2 }, { s: '{r}remote: error: File design/白饭页设计稿.psd is 180.00 MB', t: d3 - 0.1 }, { s: '{r} ! [remote rejected] main -> main', t: d3 }]; };
function probDelQ(t, blk) {
  const d3 = U.D03 ? U.D03.vo : 1e9;
  terminal(t, 100, 220, 840, 470, L_DELQ(), { title: '终端 — rice-page', accent: '#d6283e', fs: 22, prompt: false });
  if (t >= P('X01', 0.6) && t < d3) txt('🗑️', 800, 330, 80, '#000', { align: 'center', font: EMOJI, bold: false });
  if (t >= d3) { flash(t, d3, 0.12, '255,60,90'); stamp(t, d3 + 0.1, 520, 800, '还是被拒！', BADC, 60, -0.08); }
}
function probLfsQ(t, blk) {
  const t0 = blk.t0; box(100, 200, 840, 520, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
  const ds = popIn(t, t0 + 0.15); if (ds > 0) { ctx.save(); ctx.translate(620, 470); ctx.scale(ds, ds); box(-80, -170, 160, 340, 14, '#6b4a1f', '#3b2a10', 6); box(-60, -150, 120, 300, 8, '#1b1433');
    txt('≤100MB', 0, -200, 28, CLUE, { align: 'center', font: F_CODE }); txt('🚪', 0, 0, 60, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore(); }
  const bs = popIn(t, t0 + 0.3); if (bs > 0) { const bump = t >= P('B01', 0.4) ? Math.abs(Math.sin((t - P('B01', 0.4)) * 6)) * 60 : 0;
    ctx.save(); ctx.translate(290 + bump, 480); ctx.scale(bs * 0.85, bs * 0.85); box(-170, -170, 340, 340, 18, '#c8915a', '#7a5228', 7); ctx.fillStyle = '#a8743f'; ctx.fillRect(-170, -20, 340, 40);
    txt('PSD', 0, -90, 54, '#fff', { align: 'center', font: F_CODE }); txt('180 MB', 0, 90, 44, '#fff', { align: 'center', font: F_CODE }); ctx.restore();
    if (bump > 50) txt('💥', 500, 380, 60, '#000', { align: 'center', font: EMOJI, bold: false }); }
  if (U.D04 && t >= U.D04.vo + 0.3) stamp(t, U.D04.vo + 0.3, 520, 820, '塞不进去！', LFSC, 56, -0.08);
}
const EOL_ROWS = ['<!doctype html>', '<html lang="zh">', '<head>', '  <title>白饭页</title>', '</head>', '<body>', '  <h1>今天吃白饭</h1>', '  <p>大肥鱼会偷吃</p>'];
function probEolQ(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.1, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 450); ctx.scale(s, s); ctx.translate(-520, -450);
  ghWin(100, 150, 840, 600, 'github.com/dafeiyu/rice-page/commit/7c1e9a2');
  txt('📄 index.html', 130, 240, 26, '#24292f', { font: EMOJI + ',' + F_CODE }); txt('+240 −240', 900, 240, 26, BADC, { align: 'right', font: F_CODE });
  EOL_ROWS.slice(0, 6).forEach((r, i) => { [0, 1].forEach(k => { const a = clamp(prog(t, P('M01', 0.25) + (i * 2 + k) * 0.05, 0.12)); if (a <= 0) return; const y = 285 + (i * 2 + k) * 37; ctx.save(); ctx.globalAlpha *= a;
    box(120, y, 800, 35, 0, k ? '#e6ffec' : '#ffebe9'); txt((k ? '+ ' : '− ') + r, 140, y + 18, 20, k ? '#1a7f37' : BADC, { font: F_CODE, bold: false }); ctx.restore(); }); });
  ctx.restore();
  if (U.D05 && t >= U.D05.vo + 0.3) stamp(t, U.D05.vo + 0.3, 520, 820, '一行没改！', EOLC, 58, -0.08);
}
function probLeakQ(t, blk) {
  const t0 = blk.t0, hot = P('C01', 0.35);
  const L = [{ s: '// 白饭页 · 支付配置', t: t0 + 0.15, dim: true }, { s: 'PAY_URL = "pay.example.com"', t: t0 + 0.25 }, { s: 'PAY_KEY = "sk_live_51Hx9aQ…7Qz"', t: t0 + 0.35, bad: t >= hot }, { s: 'export { PAY_URL, PAY_KEY }', t: t0 + 0.45 }];
  ymlEditor(t, 100, 200, 840, 360, 'config.js', L, { fs: 28, accent: BADC });
  if (t >= hot) keyIcon(830, 420, popIn(t, hot) * 0.7, BADC, { glow: true, rot: -0.3 });
  if (t >= P('C01', 0.7)) pill(520, 620, '🕒 3 个月前 · 已推送到 GitHub', BADC, popIn(t, P('C01', 0.7)), { fs: 30, font: F_BODY + ',' + EMOJI });
  if (U.D06 && t >= U.D06.vo + 0.3) stamp(t, U.D06.vo + 0.3, 520, 800, '快删掉！', BADC, 60, -0.08);
}
function probHistQ(t, blk) {
  const t0 = blk.t0, hot = P('K01', 0.55); box(100, 200, 840, 520, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
  txt('📜 git log', 140, 260, 30, '#fff', { font: EMOJI + ',' + F_CODE });
  const lab = ['7月', '', '8月', '', '9月', '', '10月', '今天'];
  for (let i = 0; i < 8; i++) { const x = 170 + i * 100, s = popIn(t, t0 + 0.15 + i * 0.05); if (i) seg(x - 100, 450, x, 450, '#5a5580', clamp(s), 7);
    gDot(x, 450, s, i === 1 && t >= hot ? BADC : ORIC, { r: 22, glow: i === 1 && t >= hot, t }); if (lab[i]) txt(lab[i], x, 510, 22, '#cfc8ef', { align: 'center' }); }
  const mx = lerp(870, 270, eIO(prog(t, P('K01', 0.1), 1.2))); magnifier(mx, 400, 50, { rot: -0.3 });
  if (t >= hot) { keyIcon(240, 340, popIn(t, hot) * 0.55, BADC, { glow: true }); note(400, 620, popIn(t, hot + 0.2), '旧密钥还在这里', BADC, { fs: 32 }); }
  if (U.D07 && t >= U.D07.vo + 0.3) stamp(t, U.D07.vo + 0.3, 520, 820, '还要清吗？', HISC, 56, -0.08);
}
function probAsk11(t, blk) {
  const t0 = blk.t0;
  [['🏃 瘦', SIZEC], ['📏 齐', EOLC], ['🚑 救', BADC]].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s > 0) { ctx.save(); ctx.translate(250 + i * 270, 480); ctx.scale(s, s); ctx.rotate((i - 1) * 0.06); box(-110, -140, 220, 280, 24, '#fff', c[1], 8); txt(c[0], 0, 0, 52, '#1b1433', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false }); ctx.restore(); } });
  if (t >= t0 + 0.6) txt('三个重点', 520, 760, 64, ACC, { align: 'center', font: F_FANCY, bold: false });
}
function probAskP(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.1, 0.4); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 440); ctx.scale(s, s); ctx.translate(-520, -440);
  box(130, 180, 780, 520, 26, '#fff', DOCC, 7); txt('🩺 白饭页 · 体检单', 520, 240, 38, DOCC, { align: 'center', font: EMOJI + ',' + F_BODY });
  [['⚖️', '体重', '2.1 GB'], ['🐘', '大文件', '12 个'], ['↩️', '换行符', '乱'], ['🔑', '密钥', '泄露']].forEach((c, i) => checkRow(170, 290 + i * 98, 700, c[0], c[1], c[2], false, clamp(prog(t, t0 + 0.3 + i * 0.1, 0.2))));
  ctx.restore();
  if (t >= P('D09', 0.5)) stamp(t, P('D09', 0.5), 520, 800, '全面体检！', GOODC, 64, -0.08);
}
const PROB = {
  sizeQ: { chap: ['第①项', '量体重', SIZEC, F_BODY], q: '怎么这么胖？', bg: ['#fff0e0', '#ffd9b3'], draw: probSizeQ },
  delQ: { chap: ['第②项', '删了没用？', '#d6283e', F_BODY], q: '还是被拒？', bg: ['#ffe3e6', '#ffc4cc'], draw: probDelQ },
  lfsQ: { chap: ['第③项', 'Git LFS', LFSC, F_CODE], q: '设计稿放哪？', bg: ['#e3f7ef', '#bfeedd'], draw: probLfsQ },
  eolQ: { chap: ['第④项', '换行符', EOLC, F_BODY], q: '一行没改？', bg: ['#ffe3f0', '#ffc9e0'], draw: probEolQ },
  leakQ: { chap: ['第⑤项', '密钥泄露', BADC, F_BODY], q: '快删掉！', bg: ['#ffe3e6', '#ffc4cc'], draw: probLeakQ },
  histQ: { chap: ['第⑥项', '清理历史', HISC, F_BODY], q: '还要清吗？', bg: ['#efe8ff', '#dccfff'], draw: probHistQ },
  ask11: { chap: ['复习', '瘦 · 齐 · 救', ACC, F_BODY], q: '帮我划重点！', bg: ['#ece3ff', '#d6c4ff'], draw: probAsk11 },
  askP: { chap: ['实战', '白饭页体检', GOODC, F_BODY], q: '全面体检！', bg: ['#e3f7e9', '#c2edd0'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  termSfx(L_SIZEQ()); sfx(BK.sizeQ.t0 + 1.35, 'buzz', 0.3); sfx(U.D02.vo + 0.3, 'stamp', 0.6);
  termSfx(L_DELQ()); sfx(P('X01', 0.6), 'pop', 0.3); sfx(U.D03.vo, 'buzz', 0.6); sfx(U.D03.vo + 0.1, 'stamp', 0.6);
  sfx(BK.lfsQ.t0 + 0.15, 'pop', 0.3); sfx(BK.lfsQ.t0 + 0.3, 'pop', 0.3); for (let i = 0; i < 3; i++) sfx(P('B01', 0.4) + 0.26 + i * 0.52, 'impact', 0.25); sfx(U.D04.vo + 0.3, 'stamp', 0.6);
  sfx(BK.eolQ.t0 + 0.1, 'pop', 0.4); for (let i = 0; i < 12; i++) sfx(P('M01', 0.25) + i * 0.05, 'pop', 0.12); sfx(U.D05.vo + 0.3, 'stamp', 0.6);
  sfx(P('C01', 0.35), 'buzz', 0.4); sfx(P('C01', 0.7), 'pop', 0.3); sfx(U.D06.vo + 0.3, 'stamp', 0.6);
  for (let i = 0; i < 8; i++) sfx(BK.histQ.t0 + 0.15 + i * 0.05, 'pop', 0.15); sfx(P('K01', 0.55), 'ding', 0.4); sfx(U.D07.vo + 0.3, 'stamp', 0.6);
  [0, 1, 2].forEach(i => sfx(BK.ask11.t0 + 0.15 + i * 0.12, 'pop', 0.3)); sfx(BK.askP.t0 + 0.1, 'pop', 0.4); sfx(P('D09', 0.5), 'stamp', 0.6);
});
