// ================= 番外共用组件（沿用第12集）=================
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

// ---- 沿用第11集组件 ----
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

