// ================= 第12集：毕业篇 =================
Object.assign(SQ.Q, { role: '用户反馈' }); Object.assign(SQ.X, { role: '管理员' }); Object.assign(SQ.B, { role: '合并按钮' });
Object.assign(SQ.M, { role: '偷偷推送' }); Object.assign(SQ.C, { role: '审查' }); Object.assign(SQ.K, { role: '翻遍笔记' });
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


// ---- 第12集专用组件 ----
const RULEC = '#d9480f', OWNC = '#1971c2', CHKC = '#2f9e44', MRGC = '#8250df', RELC = '#e67700', FLOWC = '#0c8599', GOLD = '#d4a017';
// 盾牌（保护规则）
function shield(x, y, s, col = RULEC, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.globalAlpha *= o.alpha ?? 1;
  if (o.glow) { ctx.shadowColor = col; ctx.shadowBlur = 36; }
  ctx.fillStyle = col; ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -80); ctx.quadraticCurveTo(50, -60, 70, -64); ctx.quadraticCurveTo(74, 40, 0, 84); ctx.quadraticCurveTo(-74, 40, -70, -64); ctx.quadraticCurveTo(-50, -60, 0, -80); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
  if (o.crack) { ctx.strokeStyle = '#1b1433'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-6, -78); ctx.lineTo(10, -30); ctx.lineTo(-12, 6); ctx.lineTo(8, 40); ctx.lineTo(-2, 80); ctx.stroke(); }
  else txt(o.mark || '✓', 0, 4, 70, '#fff', { align: 'center' });
  ctx.restore();
}
// 设置页复选框行：x,y 左上
function ghCheck(t, x, y, w, label, sub, on, s = 1, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(s); const h = o.h || (sub ? 86 : 64);
  if (o.hot) { ctx.shadowColor = o.hc || CLUE; ctx.shadowBlur = 28 + 8 * Math.sin(t * 8); }
  box(x, y, w, h, 12, o.hot ? '#fffbe6' : '#fff', o.hot ? (o.hc || CLUE) : '#d0d7de', o.hot ? 4 : 2); ctx.shadowBlur = 0;
  box(x + 22, y + h / 2 - 16, 32, 32, 7, on ? '#0969da' : '#fff', on ? '#0969da' : '#8c959f', 3);
  if (on) { const k = clamp(on); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 30, y + h / 2); ctx.lineTo(x + 30 + 6 * k, y + h / 2 + 7 * k); if (k > 0.5) ctx.lineTo(x + 36 + 12 * (k - 0.5) * 2, y + h / 2 + 7 - 16 * (k - 0.5) * 2); ctx.stroke(); }
  txt(label, x + 72, y + (sub ? h / 2 - 15 : h / 2), o.fs || 26, '#24292f', { font: isCJK(label) ? F_BODY : F_CODE, max: w - 90 });
  if (sub) txt(sub, x + 72, y + h / 2 + 20, 20, '#57606a', { bold: false, font: isCJK(sub) ? F_BODY : F_CODE, max: w - 90 });
  ctx.restore();
}
// PR 合并面板：rows = [[状态 0转 1绿 2红 3灰, 标题, 副标题]]；o.btn: 0 灰 / 1 绿；o.drop: 下拉菜单出现进度；o.pick: 高亮第几项
const MERGE_OPTS = [['Create a merge commit', '保留全部提交 + 一个合并提交'], ['Squash and merge', '整个 PR 压成一个提交'], ['Rebase and merge', '逐个接到 main 后面，一条直线']];
function mergeBox(t, x, y, w, rows, o = {}) {
  const rh = 78, h = rows.length * rh + 120; box(x, y, w, h, 16, '#fff', o.border || '#d0d7de', 4);
  rows.forEach((r, i) => { const ry = y + 14 + i * rh; if (i) { ctx.fillStyle = '#eaeef2'; ctx.fillRect(x + 16, ry - 4, w - 32, 2); }
    if (r[0] === 3) { ctx.fillStyle = '#8c959f'; ctx.beginPath(); ctx.arc(x + 44, ry + 34, 18, 0, 7); ctx.fill(); } else statusIcon(x + 44, ry + 34, 18, r[0], t);
    txt(r[1], x + 80, ry + 22, 25, '#24292f', { font: isCJK(r[1]) ? F_BODY + ',' + F_CODE : F_CODE, max: w - 110 }); if (r[2]) txt(r[2], x + 80, ry + 52, 19, '#57606a', { bold: false, font: isCJK(r[2]) ? F_BODY + ',' + F_CODE : F_CODE, max: w - 110 }); });
  const by = y + h - 70, on = o.btn; const bw = Math.min(420, w - 60);
  box(x + 24, by, bw - 56, 52, [10, 0, 0, 10], on ? '#1f883d' : '#94d3a2'); box(x + 24 + bw - 56, by, 56, 52, [0, 10, 10, 0], on ? '#1a7f37' : '#8cc99a');
  txt(o.label || 'Squash and merge', x + 24 + (bw - 56) / 2, by + 27, 22, '#fff', { align: 'center', font: F_CODE, max: bw - 76 }); txt('▾', x + 24 + bw - 28, by + 27, 26, '#fff', { align: 'center', font: F_CODE });
  if (o.hotArrow) { ctx.save(); ctx.strokeStyle = CLUE; ctx.lineWidth = 5; ctx.shadowColor = CLUE; ctx.shadowBlur = 20 + 8 * Math.sin(t * 8); rr(x + 24 + bw - 60, by - 4, 64, 60, 12); ctx.stroke(); ctx.restore(); }
  const dp = o.drop || 0; if (dp > 0) { ctx.save(); ctx.globalAlpha *= clamp(dp); const dy = by + 62; box(x + 24, dy, bw + 120, 3 * 76 + 12, 12, '#fff', '#d0d7de', 3);
    MERGE_OPTS.forEach((m, i) => { const yy = dy + 6 + i * 76; if (o.pick === i) box(x + 30, yy, bw + 108, 72, 10, hexA(MRGC, 0.14), MRGC, 3);
      txt(m[0], x + 50, yy + 24, 22, '#24292f', { font: F_CODE }); txt(m[1], x + 50, yy + 52, 18, '#57606a', { bold: false, font: F_BODY + ',' + F_CODE, max: bw + 60 }); }); ctx.restore(); }
  return h;
}
// 标签（git tag）
function tagChip(x, y, s, label, col = GOLD) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.font = `bold 30px ${F_CODE}`; const w = ctx.measureText(label).width + 70;
  ctx.fillStyle = col; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2 + 26, -30); ctx.lineTo(w / 2, -30); ctx.lineTo(w / 2, 30); ctx.lineTo(-w / 2 + 26, 30); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-w / 2 + 26, 0, 7, 0, 7); ctx.fill(); txt(label, 14, 1, 30, '#1b1433', { align: 'center', font: F_CODE }); ctx.restore();
}
// 学士帽
function capIcon(x, y, s, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  ctx.fillStyle = '#1b1433'; ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(90, 0); ctx.lineTo(0, 40); ctx.lineTo(-90, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();
  box(-48, 14, 96, 44, [0, 0, 22, 22], '#1b1433'); ctx.strokeStyle = GOLD; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(62, 18); ctx.lineTo(62, 60); ctx.stroke();
  ctx.fillStyle = GOLD; ctx.fillRect(56, 56, 12, 24); ctx.restore();
}
// 毕业证书（展开）
function diploma(x, y, s, name, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  box(-300, -200, 600, 400, 18, '#fffaf0', GOLD, 8); box(-280, -180, 560, 360, 12, null, hexA(GOLD, 0.6), 3);
  txt('🎓 毕业证书', 0, -120, 46, '#7a5b00', { align: 'center', font: EMOJI + ',' + F_FANCY, bold: false });
  txt(name, 0, -40, 40, '#1b1433', { align: 'center' }); txt('修完 AI娘 Git课 全部 12 集', 0, 20, 28, '#57606a', { align: 'center' });
  txt('准予毕业', 0, 80, 34, BADC, { align: 'center', font: F_FANCY, bold: false });
  ctx.fillStyle = BADC; ctx.beginPath(); ctx.arc(200, 120, 44, 0, 7); ctx.fill(); txt('Git', 200, 122, 28, '#fff', { align: 'center', font: F_CODE }); ctx.restore();
}
// 进度胶囊条（实战 / 工作流）
function stepBar(t, steps, x0, y, dx, end, o = {}) {
  steps.forEach((s, i) => { const a = popIn(t, (o.t0 || 0) + i * 0.06); if (a <= 0) return;
    const x = x0 + i * dx; const act = t < end && t >= s[1] && (i === steps.length - 1 || t < steps[i + 1][1]); const done = t >= end || (i < steps.length - 1 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1)); box(-(dx / 2 - 8), -32, dx - 16, 64, 18, act ? (o.col || GOODC) : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act ? '✓ ' : '') + s[0], 0, 2, o.fs || 24, '#fff', { align: 'center', font: isCJK(s[0]) ? F_BODY : F_CODE, max: dx - 36 }); ctx.restore(); });
}

// ---- 冷开场：main 被直接推坏 ----
const L_COLD = () => { const t0 = BK.cold.t0; return [{ s: 'git push origin main', t: t0 + 0.05, cmd: true, dur: 0.3 }, { s: '{d}To github.com/dafeiyu/rice-page.git', t: t0 + 0.4 },
  { s: '{g}   9c1e2f0..4b7d1aa  main -> main', t: t0 + 0.5 }, { s: '{y}⚠ 没有 PR · 没有审查 · 没有检查', t: P('D01', 0.4) }]; };
SC.cold = (t, blk) => {
  const t0 = blk.t0, lk = P('D01', 0.12); let [sx, sy] = shake(t, lk, 12, 0.35); ctx.translate(sx, sy);
  bgBurst(t, '#3a1020', '#c2255c', W * 0.62, H * 0.5, 22, 0.35);
  terminal(t, 860, 110, 1000, 290, L_COLD(), { title: '终端 — 某位同学', accent: '#d6283e', fs: 24, prompt: false, scale: eBack(prog(t, t0, 0.4)) });
  const bs = popIn(t, t0 + 0.6, 0.4); if (bs > 0) { ctx.save(); ctx.translate(1360, 640); ctx.scale(bs, bs); ctx.translate(-1360, -640);
    ghWin(860, 440, 1000, 400, 'dafeiyu.github.io/rice-page');
    if (t < lk) { txt('🍚 今天吃白饭', 1360, 600, 54, '#24292f', { align: 'center', font: EMOJI + ',' + F_BODY }); txt('大肥鱼会偷吃白饭', 1360, 680, 30, '#57606a', { align: 'center' }); }
    else { const fl = Math.floor(t * 10) % 2 && t < lk + 0.4; box(864, 498, 992, 338, [0, 0, 16, 16], fl ? '#f0f0f0' : '#fff');
      txt('（一片空白）', 1360, 640, 34, '#c9ced6', { align: 'center' }); box(890, 760, 940, 52, 8, '#ffebe9', BADC, 2); txt('✖ Uncaught TypeError: rice is undefined', 910, 787, 22, BADC, { font: F_CODE }); }
    ctx.restore(); }
  if (t >= lk) { flash(t, lk, 0.15, '255,80,120'); stamp(t, lk + 0.3, 1650, 520, '白屏了！', BADC, 70, -0.1); }
  const p = spring(prog(t, t0, 0.9)); sprite('d_panic', 440, H + 40, 980, { scale: lerp(1.2, 1, p) * breath(t, 1) });
  pill(440, 150, '大肥鱼 · 刚合并完', SQ.D.col, popIn(t, t0 + 0.15), { font: F_FANCY, fs: 44, fg: '#fff' });
  if (t >= P('D01', 0.6)) fancy('谁推的？！', 440, 270, 84, t, P('D01', 0.6), { rot: -0.06, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
};
SFX_FNS.push(() => { const b = BK.cold; termSfx(L_COLD()); sfx(b.t0 + 0.15, 'pop', 0.4); sfx(b.t0 + 0.6, 'pop', 0.4); const lk = P('D01', 0.12);
  sfx(lk, 'impact', 0.6); sfx(lk, 'buzz', 0.5); sfx(lk + 0.3, 'stamp', 0.6); sfx(P('D01', 0.4), 'pop', 0.3); sfx(P('D01', 0.6), 'boing', 0.4); });

// ---- 引入：团队要有规矩 ----
SC.why = (t, blk, en) => {
  bgLecture(t, GOLD); lecturer(t, blk, en, blk.t0);
  const sw = S('G01_02') - 0.2, a1 = 1 - eIO(prog(t, sw, 0.35));
  if (a1 > 0) { ctx.save(); ctx.globalAlpha *= a1;
    pill(1270, 130, '👥 团队要有规矩', CLUE, popIn(t, blk.t0 + 0.1), { fs: 42, font: F_BODY + ',' + EMOJI });
    [['🚪', '谁能推', 'main 要保护', RULEC, P('G01_01', 0.42)], ['👀', '谁来审', '对的人审对的文件', OWNC, P('G01_01', 0.6)], ['🚀', '怎么发版本', '标签一推就发布', RELC, P('G01_01', 0.78)]].forEach((c, i) => {
      const s = popIn(t, c[4], 0.4); if (s <= 0) return; const x = 890 + i * 380; ctx.save(); ctx.translate(x, 470); ctx.scale(s, s); ctx.rotate((i - 1) * 0.04);
      box(-170, -200, 340, 400, 26, '#fffaf0', c[3], 7); txt(c[0], 0, -80, 100, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 0, 50, 36, '#1b1433', { align: 'center' }); txt(c[2], 0, 120, 24, c[3], { align: 'center', max: 300 });
      ctx.restore(); });
    if (t >= P('G01_01', 0.15)) fancy('一个人会用还不够', 1270, 800, 60, t, P('G01_01', 0.15), FX.white);
    ctx.restore(); }
  if (t >= sw) { const a = eOut(prog(t, sw, 0.35)); ctx.save(); ctx.globalAlpha *= a;
    const s = popIn(t, sw + 0.05, 0.45); ctx.save(); ctx.translate(1270, 440); ctx.scale(s, s); ctx.rotate(-0.02);
    box(-430, -320, 860, 600, 30, '#fffaf0', GOLD, 8); capIcon(-330, -250, 0.7, { rot: -0.2 }); txt('🎓 毕业考试', 0, -250, 52, '#7a5b00', { align: 'center', font: EMOJI + ',' + F_FANCY, bold: false });
    const eps = ['存档', '云存档', '协作', '后悔药', '发布', 'Pages', 'Actions', '变基', '侦探', '开源', '体检'];
    eps.forEach((e, i) => { const tt = P('G01_02', 0.1 + i * 0.035), k = popIn(t, tt, 0.3); if (k <= 0) return; const col = i % 4, row = Math.floor(i / 4);
      const fx = -300 + col * 200, fy = -130 + row * 90; ctx.save(); ctx.translate(fx, fy); ctx.scale(k, k); box(-90, -34, 180, 68, 16, '#fff', ACC, 3);
      txt(String(i + 1), -62, 0, 24, ACC, { align: 'center', font: F_CODE }); txt(e, 14, 1, 24, '#1b1433', { align: 'center', font: isCJK(e) ? F_BODY : F_CODE, max: 120 }); ctx.restore(); });
    if (t >= P('G01_02', 0.62)) { const p = eOut(prog(t, P('G01_02', 0.62), 0.4)); box(-380, 140, 760 * p, 90, 22, FLOWC); if (p > 0.9) txt('➡ 一整套团队工作流', 0, 186, 40, '#fff', { align: 'center', font: EMOJI + ',' + F_BODY }); }
    ctx.restore(); ctx.restore(); }
};
SFX_FNS.push(() => { const b = BK.why; sfx(b.t0 + 0.1, 'pop', 0.4); [0.42, 0.6, 0.78].forEach(f => sfx(P('G01_01', f), 'pop', 0.4)); sfx(P('G01_01', 0.15), 'ding', 0.3);
  sfx(S('G01_02') - 0.2, 'swoosh_in', 0.4); for (let i = 0; i < 11; i++) sfx(P('G01_02', 0.1 + i * 0.035), 'pop', 0.15); sfx(P('G01_02', 0.62), 'whoosh', 0.4); sfx(P('G01_02', 0.75), 'sparkle', 0.4); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#3d2a00', '#d4a017', W * 0.6, H * 0.45, 28, 0.2);
  ['🎓', '🛡️', '🏷️', '🚀', '✨'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  sprite('g_grad', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 60, 1040);
  sprite('d_leader', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 780);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-400, -10, 95, '#ff5c8a', '第12集', { fs: 48, rot: -0.15, fg: '#fff' });
    fancy('最终回', 40, -70, 120, t, -99, FX.white);
    fancy('毕业篇！', 110, 80, 150, t, -99, FX.yel);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况（左侧插图，画在 100..940）----
const L_RULEQ = () => { const t0 = BK.ruleQ.t0; return [{ s: 'git push origin main', t: t0 + 0.2, cmd: true, dur: 0.3 }, { s: '{y}remote: Bypassed rule violations for refs/heads/main:', t: P('X01', 0.4) },
  { s: '{y}remote: - Changes must be made through a pull request.', t: P('X01', 0.45) }, { s: '{g}   4b7d1aa..e81f3c2  main -> main', t: P('X01', 0.55) }]; };
function probRuleQ(t, blk) {
  terminal(t, 100, 200, 840, 330, L_RULEQ(), { title: '终端 — Grok（管理员）', accent: '#d6283e', fs: 21, prompt: false });
  const cr = P('X01', 0.55); shield(520, 660, popIn(t, blk.t0 + 0.3) * 0.9, RULEC, { crack: t >= cr, rot: t >= cr ? 0.08 : 0 });
  if (t >= P('X01', 0.4)) pill(250, 640, '管理员', '#ffd23f', popIn(t, P('X01', 0.4)), { fs: 30, font: F_BODY });
  if (U.D02 && t >= U.D02.vo + 0.3) stamp(t, U.D02.vo + 0.3, 760, 760, '能绕过？！', BADC, 56, -0.08);
}
function probOwnQ(t, blk) {
  const t0 = blk.t0; ghWin(100, 170, 840, 600, 'github.com/pulls/review-requested');
  txt('👀 Review requests', 130, 265, 28, '#24292f', { font: EMOJI + ',' + F_CODE }); const n = Math.min(30, Math.floor(clamp((t - t0 - 0.2) / 2) * 30)); pill(860, 265, String(n), BADC, popIn(t, t0 + 0.2), { fs: 28, fg: '#fff' });
  const T = ['修改首页标题', '更新 README', '深色模式样式', '修复按钮错位', '新增文档页', '调整配色'];
  T.forEach((s, i) => issueRow(t, 130, 310 + i * 76, 780, { t: t0 + 0.3 + i * 0.12, title: s, num: '#' + (31 - i), labels: [['review', i % 2 ? '#1971c2' : '#e07a3d']] }));
  if (U.D03 && t >= U.D03.vo + 0.3) stamp(t, U.D03.vo + 0.3, 700, 800, '按文件分？', OWNC, 54, -0.08);
}
function probChkQ(t, blk) {
  const t0 = blk.t0, sn = P('M01', 0.5); box(100, 200, 840, 520, 26, '#fff', '#d0d7de', 4); txt('🔀 PR #18 · 首页改版', 130, 250, 30, '#24292f', { font: EMOJI + ',' + F_BODY + ',' + F_CODE });
  const R = [['🟢', 'feat: 首页改版', '3 天前', t0 + 0.15], ['✅', 'Claude approved these changes', '1 小时前', t0 + 0.3], ['😼', 'Gemini: 偷偷加一行', '刚刚', sn]];
  R.forEach((r, i) => { const a = clamp(prog(t, r[3], 0.2)); if (a <= 0) return; const y = 300 + i * 120; ctx.save(); ctx.globalAlpha *= a; if (i < 2) seg(150, y + 40, 150, y + 120, '#d0d7de', 1, 5);
    box(130, y, 780, 90, 14, i === 2 ? '#fff5f5' : '#f6f8fa', i === 2 ? BADC : '#d0d7de', i === 2 ? 4 : 2); txt(r[0], 170, y + 45, 34, '#000', { align: 'center', font: EMOJI, bold: false });
    txt(r[1], 210, y + 45, 26, '#24292f', { font: isCJK(r[1]) ? F_BODY + ',' + F_CODE : F_CODE, max: 560 }); txt(r[2], 890, y + 45, 20, '#57606a', { align: 'right', bold: false }); ctx.restore(); });
  if (t >= sn + 0.2) note(520, 680, popIn(t, sn + 0.2), '批准之后又改了！', BADC, { fs: 30 });
  if (U.D04 && t >= U.D04.vo + 0.3) stamp(t, U.D04.vo + 0.3, 720, 800, '还算数吗？', CHKC, 54, -0.08);
}
function probMrgQ(t, blk) {
  const t0 = blk.t0, dp = eOut(prog(t, P('B01', 0.45), 0.35)); const s = popIn(t, t0 + 0.1, 0.4); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 420); ctx.scale(s, s); ctx.translate(-520, -420);
  mergeBox(t, 110, 170, 820, [[1, 'All checks have passed', '1 successful check'], [1, 'Changes approved', '1 approving review']], { btn: 1, label: 'Create a merge commit', hotArrow: t >= P('B01', 0.3) && dp < 1, drop: dp });
  ctx.restore();
  if (U.D05 && t >= U.D05.vo + 0.3) stamp(t, U.D05.vo + 0.3, 700, 850, '闭眼点第一个', MRGC, 50, -0.08);
}
function probRelQ(t, blk) {
  const t0 = blk.t0; box(100, 200, 840, 520, 26, 'rgba(15,12,31,0.92)', '#fff', 5); txt('📦 手动发布 v1.9.3（第 23 次）', 140, 260, 30, '#fff', { font: EMOJI + ',' + F_BODY + ',' + F_CODE });
  [['🗜️', '打包成 zip'], ['📝', '手写更新说明'], ['⬆️', '上传附件'], ['🔢', '核对版本号']].forEach((c, i) => { const a = clamp(prog(t, t0 + 0.3 + i * 0.25, 0.2)); if (a <= 0) return; const y = 330 + i * 90; ctx.save(); ctx.globalAlpha *= a;
    box(140, y, 760, 72, 14, '#2a2350', '#5a5580', 3); txt(c[0], 180, y + 36, 34, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 220, y + 36, 28, '#fff', {}); txt('😩', 860, y + 36, 32, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore(); });
  if (U.D06 && t >= U.D06.vo + 0.3) stamp(t, U.D06.vo + 0.3, 700, 790, '好累……', RELC, 58, -0.08);
}
const NOTES = [['①', '存档读档'], ['②', 'push / pull'], ['③', 'PR 协作'], ['④', '后悔药'], ['⑤', 'tag 发布'], ['⑥', 'Pages'], ['⑦', 'Actions'], ['⑧', 'rebase'], ['⑨', 'bisect'], ['⑩', 'Fork 开源'], ['⑪', '仓库体检']];
function probFlowQ(t, blk) {
  const t0 = blk.t0; box(100, 190, 840, 560, 26, '#fff8e1', '#c99a2e', 6); txt('📒 Kimi 的笔记', 140, 245, 30, '#7a5b00', { font: EMOJI + ',' + F_BODY });
  NOTES.forEach((n, i) => { const s = popIn(t, t0 + 0.2 + i * 0.06, 0.3); if (s <= 0) return; const px = 210 + ((i * 263) % 640), py = 330 + ((i * 157) % 360), r = ((i * 37) % 9 - 4) * 0.05;
    ctx.save(); ctx.translate(px, py); ctx.scale(s, s); ctx.rotate(r); box(-90, -40, 180, 80, 8, ['#ffe066', '#a5d8ff', '#b2f2bb', '#ffc9c9'][i % 4], null); txt(n[0] + ' ' + n[1], 0, 1, 22, '#1b1433', { align: 'center', font: F_BODY + ',' + F_CODE, max: 168 }); ctx.restore(); });
  if (U.D07 && t >= U.D07.vo + 0.3) stamp(t, U.D07.vo + 0.3, 700, 810, '先做什么？', FLOWC, 54, -0.08);
}
function probAsk12(t, blk) {
  const t0 = blk.t0;
  [['🛡️ 守', RULEC], ['🤝 合', MRGC], ['🚀 发', RELC]].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s > 0) { ctx.save(); ctx.translate(250 + i * 270, 480); ctx.scale(s, s); ctx.rotate((i - 1) * 0.06); box(-110, -140, 220, 280, 24, '#fff', c[1], 8); txt(c[0], 0, 0, 52, '#1b1433', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false }); ctx.restore(); } });
  if (t >= t0 + 0.6) txt('三个重点', 520, 760, 64, ACC, { align: 'center', font: F_FANCY, bold: false });
}
function probAskP(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.1, 0.4); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 440); ctx.scale(s, s); ctx.translate(-520, -440);
  box(130, 170, 780, 560, 26, '#fff', GOODC, 7); txt('🚀 白饭页 v2.0 · 发布清单', 520, 225, 36, GOODC, { align: 'center', font: EMOJI + ',' + F_BODY });
  [['🛡️', '保护规则', '待办'], ['👀', 'CODEOWNERS', '待办'], ['🔀', 'PR + 审查', '待办'], ['🏷️', '标签发布', '待办']].forEach((c, i) => checkRow(170, 280 + i * 98, 700, c[0], c[1], c[2], false, clamp(prog(t, t0 + 0.3 + i * 0.1, 0.2))));
  ctx.restore();
  if (t >= P('D09', 0.5)) stamp(t, P('D09', 0.5), 520, 800, '发出去！', GOODC, 64, -0.08);
}
const PROB = {
  ruleQ: { chap: ['第①题', '不许绕过', RULEC, F_BODY], q: '能绕过去？', bg: ['#fff0e0', '#ffd9b3'], draw: probRuleQ },
  ownQ: { chap: ['第②题', 'CODEOWNERS', OWNC, F_CODE], q: '按文件分？', bg: ['#e3f0ff', '#c4defc'], draw: probOwnQ },
  chkQ: { chap: ['第③题', '批准作废', CHKC, F_BODY], q: '还算数吗？', bg: ['#e3f7e9', '#c2edd0'], draw: probChkQ },
  mrgQ: { chap: ['第④题', '三种合并', MRGC, F_BODY], q: '选哪个？', bg: ['#efe8ff', '#dccfff'], draw: probMrgQ },
  relQ: { chap: ['第⑤题', '自动发布', RELC, F_BODY], q: '好累……', bg: ['#fff3d6', '#ffe2a8'], draw: probRelQ },
  flowQ: { chap: ['第⑥题', '团队工作流', FLOWC, F_BODY], q: '先做什么？', bg: ['#dff6f8', '#bdebef'], draw: probFlowQ },
  ask12: { chap: ['复习', '守 · 合 · 发', ACC, F_BODY], q: '帮我划重点！', bg: ['#ece3ff', '#d6c4ff'], draw: probAsk12 },
  askP: { chap: ['实战', '白饭页 2.0', GOODC, F_BODY], q: '发出去！', bg: ['#e3f7e9', '#c2edd0'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  termSfx(L_RULEQ()); sfx(P('X01', 0.4), 'buzz', 0.3); sfx(P('X01', 0.55), 'impact', 0.4); sfx(U.D02.vo + 0.3, 'stamp', 0.6);
  for (let i = 0; i < 6; i++) sfx(BK.ownQ.t0 + 0.3 + i * 0.12, 'pop', 0.2); sfx(U.D03.vo + 0.3, 'stamp', 0.6);
  sfx(BK.chkQ.t0 + 0.15, 'pop', 0.3); sfx(BK.chkQ.t0 + 0.3, 'ding', 0.3); sfx(P('M01', 0.5), 'buzz', 0.4); sfx(U.D04.vo + 0.3, 'stamp', 0.6);
  sfx(BK.mrgQ.t0 + 0.1, 'pop', 0.4); sfx(P('B01', 0.45), 'whoosh', 0.4); sfx(U.D05.vo + 0.3, 'stamp', 0.6);
  for (let i = 0; i < 4; i++) sfx(BK.relQ.t0 + 0.3 + i * 0.25, 'pop', 0.25); sfx(U.D06.vo + 0.3, 'stamp', 0.6);
  for (let i = 0; i < 11; i++) sfx(BK.flowQ.t0 + 0.2 + i * 0.06, 'pop', 0.15); sfx(U.D07.vo + 0.3, 'stamp', 0.6);
  [0, 1, 2].forEach(i => sfx(BK.ask12.t0 + 0.15 + i * 0.12, 'pop', 0.3)); sfx(BK.askP.t0 + 0.1, 'pop', 0.4); sfx(P('D09', 0.5), 'stamp', 0.6);
});
