// ================= 第6集：GitHub Pages =================
Object.assign(SQ.Q, { role: '用户反馈' }); Object.assign(SQ.C, { role: '安全审查' }); Object.assign(SQ.M, { role: '加图片' });
Object.assign(SQ.X, { role: '推送' }); Object.assign(SQ.B, { role: '短网址' }); Object.assign(SQ.K, { role: '读文档' });
const PGC = '#2da44e', WEBC = '#3ec1ff', LIVEC = '#1a7f37';
// 普通网站窗口（没有 GitHub 顶栏）：返回内容区顶部 y
function siteWin(x, y, w, h, url, o = {}) {
  win(x, y, w, h, o.title || '浏览器', o.accent || WEBC, { bg: '#ffffff', bar: '#e9e6f3' });
  box(x + 20, y + 68, w - 40, 50, 25, '#f2f0f8', '#d6d1e6', 2);
  txt('🔒 ' + url, x + 44, y + 94, o.ufs || 26, '#555', { font: F_CODE, bold: false, max: w - 120 });
  if (o.reload != null) { ctx.save(); ctx.translate(x + w - 56, y + 94); ctx.rotate(o.reload * Math.PI * 2); ctx.strokeStyle = '#7c5cff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 13, 0.3, 5.6); ctx.stroke(); ctx.restore(); }
  return y + 130;
}
// 白饭页本体（cx 中心，y 顶部，w 宽）
function baifanPage(cx, y, w, o = {}) {
  const s = w / 700; ctx.save(); ctx.translate(cx, y); ctx.scale(s, s);
  box(-350, 0, 700, 90, 0, '#ffe9c7'); txt(o.title || '🍚 白饭页', 0, 46, 52, '#7a3d00', { align: 'center', font: F_FANCY, bold: false });
  ['首页', '今日推荐菜', '关于'].forEach((n, i) => chip(-300 + i * 200, 130, 1, n, ['#ff7a3d', '#22c08b', '#7c5cff'][i], '#fff', 26));
  box(-310, 180, 370, 150, 18, '#fffaf0', '#ffd6a0', 3); txt('今日推荐菜', -290, 212, 26, '#b85c00', {});
  txt(o.dish || '番茄炒蛋盖饭', -290, 262, o.dishFs || 34, '#1b1433', { max: 340 });
  if (o.cat) { // 猫猫图：ok / broken
    box(90, 180, 220, 150, 14, o.cat === 'ok' ? '#fff3d6' : '#f2f2f2', '#d0d7de', 3);
    if (o.cat === 'ok') txt('🐱', 200, 258, 90, '#000', { align: 'center', font: EMOJI, bold: false });
    else brokenImg(200, 255, 1);
  } else for (let i = 0; i < 3; i++) box(90, 190 + i * 44, 180 + rnd(i + 7) * 40, 20, 10, '#e4dff5');
  ctx.restore();
}
// 裂开的图片图标
function brokenImg(x, y, s) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  box(-48, -40, 96, 80, 8, '#fff', '#8c959f', 4);
  ctx.fillStyle = '#8c959f'; ctx.beginPath(); ctx.moveTo(-36, 28); ctx.lineTo(-10, -4); ctx.lineTo(8, 16); ctx.lineTo(20, 4); ctx.lineTo(36, 28); ctx.fill();
  ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(10, -44); ctx.lineTo(-2, -10); ctx.lineTo(12, 6); ctx.lineTo(0, 44); ctx.stroke();
  ctx.restore();
}
// GitHub Pages 的 404 页面
function page404(cx, y, s) {
  ctx.save(); ctx.translate(cx, y); ctx.scale(s, s);
  fancy('404', 0, 90, 170, 0, -99, { c1: '#ffe0e0', c2: '#ff4d6d', stroke: '#3a0010' });
  txt('File not found', 0, 210, 40, '#24292f', { align: 'center', font: F_CODE });
  txt('找不到首页 index.html', 0, 270, 30, '#6b6488', { align: 'center', bold: false });
  ctx.restore();
}
// 文件树：rows = [[名字, 状态]]，状态：'' / 'bad' / 'good' / 'ghost'
function fileTree(x, y, w, rows, o = {}) {
  const rh = o.rh || 70; box(x, y, w, 70 + rows.length * rh + 20, 22, 'rgba(22,16,44,0.94)', o.col || '#8f8aa8', 4);
  txt('📁 ' + (o.root || 'baifan（根目录）'), x + 26, y + 38, 30, '#fff', {});
  rows.forEach((r, i) => {
    const a = r[2] == null ? 1 : clamp(r[2]); if (a <= 0) return;
    const ry = y + 80 + i * rh + rh / 2, isDir = r[0].endsWith('/'); ctx.save(); ctx.globalAlpha *= a * (r[1] === 'ghost' ? 0.35 : 1);
    if (r[1] === 'bad' || r[1] === 'good') box(x + 18, ry - rh / 2 + 6, w - 36, rh - 12, 12, r[1] === 'bad' ? 'rgba(255,59,92,0.22)' : 'rgba(46,200,110,0.22)', r[1] === 'bad' ? '#ff3b5c' : '#2ec86e', 3);
    txt(isDir ? '📁' : '📄', x + 50, ry + 2, 30, '#000', { font: EMOJI, bold: false });
    const nm = r[3] || r[0]; ctx.save(); ctx.translate(x + 96, ry + 2); ctx.scale(1, r[4] ?? 1); txt(nm, 0, 0, o.fs || 32, r[1] === 'bad' ? '#ff9aa9' : r[1] === 'good' ? '#9dffbf' : '#ece9f7', { font: F_CODE }); ctx.restore();
    ctx.restore();
  });
}
// GitHub 设置页（Pages）：st = {hi, src, br, dir, saved, live, docs, domain, https}
function settingsPage(t, x, y, w, h, st) {
  const cy = browser(x, y, w, h, 'github.com/dafeiyu/baifan/settings/pages', { title: 'Settings · Pages', accent: PGC });
  const side = ['General', 'Collaborators', 'Branches', 'Actions', 'Pages'];
  box(x + 20, cy + 20, 230, h - (cy - y) - 40, 12, '#f6f8fa', '#d0d7de', 2);
  side.forEach((n, i) => { const hot = n === 'Pages' && st.hi; const yy = cy + 60 + i * 62;
    if (hot) { box(x + 28, yy - 26, 214, 52, 10, '#ddf4ff'); ctx.fillStyle = '#fd8c73'; rr(x + 28, yy - 22, 6, 44, 3); ctx.fill(); }
    txt(n, x + 50, yy, 26, hot ? '#0969da' : '#24292f', { font: F_CODE, bold: hot }); });
  const px = x + 280, pw = w - 300;
  txt('GitHub Pages', px, cy + 50, 38, '#24292f', {});
  if (st.live > 0) { ctx.save(); ctx.globalAlpha *= clamp(st.live); box(px, cy + 84, pw, 64, 10, '#dafbe1', '#4ac26b', 2); txt('✅ Your site is live at', px + 20, cy + 116, 24, LIVEC, {}); txt('dafeiyu.github.io/baifan', px + 300, cy + 116, 24, '#0969da', { font: F_CODE }); ctx.restore(); }
  const by = cy + 180; txt('Build and deployment', px, by, 28, '#24292f', {});
  txt('Source', px, by + 50, 24, '#57606a', { bold: false });
  dropBtn(px, by + 70, 400, st.src || 'None', st.src ? 1 : 0, st.srcHot);
  if (st.src) {
    txt('Branch', px, by + 170, 24, '#57606a', { bold: false });
    dropBtn(px, by + 190, 190, st.br ? '🌿 ' + st.br : 'None', st.br ? 1 : 0, st.brHot);
    dropBtn(px + 205, by + 190, 200, st.dir || '/ (root)', 1, st.dirHot);
    ghButton(px + 420, by + 190, 110, 54, 'Save', st.saved ? '#1f883d' : '#f6f8fa', { fg: st.saved ? '#fff' : '#24292f', border: '#d0d7de', press: st.press, glow: st.press ? 1 : 0, fs: 26 });
    if (st.docs > 0) { ctx.save(); ctx.globalAlpha *= clamp(st.docs); box(px + 205, by + 250, 200, 112, 10, '#fff', '#d0d7de', 2);
      txt('/ (root)', px + 225, by + 280, 24, '#24292f', { font: F_CODE }); box(px + 210, by + 306, 190, 46, 8, '#ddf4ff'); txt('/docs', px + 225, by + 330, 24, '#0969da', { font: F_CODE }); ctx.restore(); }
  }
  if (st.domain > 0) { ctx.save(); ctx.globalAlpha *= clamp(st.domain); const dy = by + 268;
    txt('Custom domain', px, dy, 26, '#24292f', {}); inputBox(px, dy + 24, 330, null, st.dval || 'baifan.com', { focus: st.dfocus, code: true, t });
    ghButton(px + 345, dy + 26, 100, 54, 'Save', '#f6f8fa', { fg: '#24292f', border: '#d0d7de', fs: 24 });
    checkbox(px + 16, dy + 98, st.https, 'Enforce HTTPS'); ctx.restore(); }
}
function dropBtn(x, y, w, label, on, hot) {
  box(x, y, w, 54, 10, hot ? '#fff8c5' : '#f6f8fa', hot ? '#d4a72c' : '#d0d7de', hot ? 4 : 2);
  txt(label, x + 16, y + 28, 24, on ? '#24292f' : '#8c959f', { font: F_CODE, bold: false, max: w - 50 });
  ctx.fillStyle = '#57606a'; ctx.beginPath(); ctx.moveTo(x + w - 30, y + 22); ctx.lineTo(x + w - 16, y + 22); ctx.lineTo(x + w - 23, y + 32); ctx.fill();
}
// Actions 运行列表：rows = [[标题, 状态 0=转圈 1=绿勾, 出现]]
function actionsList(t, x, y, w, rows) {
  rows.forEach((r, i) => {
    const a = clamp(r[2] ?? 1); if (a <= 0) return; const ry = y + i * 92; ctx.save(); ctx.globalAlpha *= a;
    box(x, ry, w, 80, 12, '#fff', r[1] ? '#4ac26b' : '#d4a72c', r[1] ? 4 : 3);
    if (r[1]) { ctx.fillStyle = '#1f883d'; ctx.beginPath(); ctx.arc(x + 44, ry + 40, 22, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + 33, ry + 40); ctx.lineTo(x + 41, ry + 49); ctx.lineTo(x + 56, ry + 31); ctx.stroke(); }
    else { ctx.save(); ctx.translate(x + 44, ry + 40); ctx.rotate(t * 6); ctx.strokeStyle = '#d4a72c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 18, 0, 4.4); ctx.stroke(); ctx.restore(); }
    txt(r[0], x + 84, ry + 30, 26, '#24292f', { font: F_CODE, max: w - 260 }); txt(r[3] || 'main · dafeiyu', x + 84, ry + 60, 20, '#57606a', { bold: false });
    txt(r[1] ? (r[4] || '1m 12s') : '进行中…', x + w - 24, ry + 40, 24, r[1] ? LIVEC : '#9a6700', { align: 'right' });
    ctx.restore();
  });
}
// 网址拆解：segs = [[文字, 颜色, 说明]]
function urlParts(cx, y, s, segs, fs = 64) {
  if (s <= 0) return; ctx.save(); ctx.translate(cx, y); ctx.scale(s, s); ctx.font = `bold ${fs}px ${F_CODE}`;
  const ws = segs.map(g => ctx.measureText(g[0]).width), tot = ws.reduce((a, b) => a + b, 0); let x = -tot / 2;
  box(-tot / 2 - 40, -fs, tot + 80, fs * 2, 24, 'rgba(15,12,31,0.95)', '#fff', 5);
  segs.forEach((g, i) => { txt(g[0], x, 2, fs, g[1], { font: F_CODE }); if (g[2]) { ctx.strokeStyle = g[1]; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 6, fs * 0.82); ctx.lineTo(x + ws[i] - 6, fs * 0.82); ctx.stroke(); note(x + ws[i] / 2, fs * 1.75, 1, g[2], g[1], { fs: 30 }); } x += ws[i]; });
  ctx.restore();
}
// 键帽
function keycap(x, y, s, label, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.press ? 0.92 : 1), s * (o.press ? 0.92 : 1));
  ctx.font = `bold 44px ${F_CODE}`; const w = Math.max(110, ctx.measureText(label).width + 60);
  box(-w / 2, -50 + 10, w, 100, 18, '#9a92c0'); box(-w / 2, -50 + (o.press ? 8 : 0), w, 92, 18, '#fff', '#1b1433', 5);
  txt(label, 0, -4 + (o.press ? 8 : 0), 44, '#1b1433', { align: 'center', font: F_CODE }); ctx.restore();
}
// 原始 HTML 代码（冷开场：同学打开全是代码）
const RAW = ['<!DOCTYPE html>', '<html lang="zh">', '<head>', '  <meta charset="utf-8">', '  <title>白饭页</title>', '  <link rel="stylesheet" href="style.css">', '</head>', '<body>', '  <h1>🍚 白饭页</h1>', '  <div class="dish">番茄炒蛋盖饭</div>', '</body>', '</html>'];

// ---- 冷开场：发给同学，打开全是代码 ----
SC.cold = (t, blk) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, P('D01', 0.42), 8, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#1f5f8c', '#2f8fd0', W * 0.62, H * 0.5, 22, 0.35);
  const wa = eBack(prog(t, t0 + 0.05, 0.4));
  ctx.save(); ctx.translate(1390, 470); ctx.scale(wa, wa); ctx.translate(-1390, -470);
  const cy = siteWin(960, 80, 860, 720, 'github.com/dafeiyu/baifan/blob/main/baifan.html', { title: '同学的手机', ufs: 22 });
  RAW.forEach((l, i) => { const a = prog(t, t0 + 0.2 + i * 0.05, 0.15); if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
    txt(String(i + 1).padStart(2, ' '), 990, cy + 34 + i * 48, 24, '#8c959f', { font: F_CODE, bold: false });
    txt(l, 1040, cy + 34 + i * 48, 26, l.startsWith('  <') || l.startsWith('<') ? '#cf222e' : '#24292f', { font: F_CODE, bold: false, max: 760 }); ctx.restore(); });
  ctx.restore();
  [['？？？', 1700, 230, 0.35, '#ff5c8a'], ['这是啥？', 1180, 560, 0.5, '#7c5cff'], ['看不懂…', 1640, 700, 0.62, '#22a06b']].forEach(q => { const s = popIn(t, P('D01', q[3])); if (s > 0) note(q[1], q[2], s, q[0], q[4], { fs: 40, rot: -0.06 }); });
  const p = spring(prog(t, t0, 0.9));
  sprite('d_curious', 480, H + 40, 980, { scale: lerp(1.3, 1, p) });
  fancy('打开全是代码？！', 470, 160, 84, t, U.D01.vo + 0.05, { rot: -0.08, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
  if (t >= P('D01', 0.72)) fancy('想要真网站！', 1390, 870, 78, t, P('D01', 0.72), Object.assign({ rot: -0.04, wobble: 4 }, FX.white));
};
SFX_FNS.push(() => { sfx(BK.cold.t0 + 0.05, 'swoosh_in', 0.5); [0.35, 0.5, 0.62].forEach(f => sfx(P('D01', f), 'boing', 0.3)); sfx(P('D01', 0.42), 'impact', 0.5); sfx(P('D01', 0.72), 'ding', 0.4); });

// ---- 引入：仓库 → 网站；展示柜 ----
SC.why = (t, blk, en) => {
  bgLecture(t, PGC); lecturer(t, blk, en, blk.t0);
  const sw = S('G01_02') - 0.2, a1 = 1 - eIO(prog(t, sw, 0.35));
  if (a1 > 0) { ctx.save(); ctx.globalAlpha = a1;
    const rs = popIn(t, blk.t0 + 0.1, 0.4); if (rs > 0) { ctx.save(); ctx.translate(900, 430); ctx.scale(rs, rs); box(-160, -200, 320, 400, 24, '#0f0c1f', '#8f8aa8', 5); txt('📦 仓库', 0, -150, 38, '#fff', { align: 'center' });
      ['index.html', 'style.css', 'img/'].forEach((f, i) => fileChip(0, -40 + i * 100, 0.62, i === 2 ? '📁' : '📄', f, ['#ff7a3d', '#3ec1ff', '#22c08b'][i])); ctx.restore(); }
    arrow(1090, 430, 1250, 430, PGC, eOut(prog(t, P('G01_01', 0.25), 0.4)), 16);
    const bs = popIn(t, P('G01_01', 0.3), 0.45); if (bs > 0) { ctx.save(); ctx.translate(1560, 430); ctx.scale(bs, bs); ctx.translate(-1560, -430);
      ctx.shadowColor = WEBC; ctx.shadowBlur = 50 * (0.6 + 0.4 * Math.sin(t * 4)); const cy = siteWin(1270, 200, 580, 470, 'dafeiyu.github.io/baifan', { ufs: 22 }); ctx.shadowBlur = 0;
      baifanPage(1560, cy + 10, 540); ctx.restore(); sparkle(t, P('G01_01', 0.32), 1560, 430, 260, 12); }
    [['免费', 0.55, 1060], ['不用服务器', 0.72, 1460]].forEach(c => pill(c[2], 800, c[0], '#ffd23f', popIn(t, P('G01_01', c[1])), { fs: 40, font: F_BODY }));
    ctx.restore();
  }
  if (t >= sw) { // 展示柜
    const a = eOut(prog(t, sw, 0.35)); ctx.save(); ctx.globalAlpha = a;
    ctx.save(); ctx.translate(1270, 430); const cs = eBack(prog(t, sw, 0.45)); ctx.scale(cs, cs);
    box(-330, -260, 660, 520, 20, 'rgba(180,230,255,0.18)', '#d8f6ff', 8); box(-350, 250, 700, 50, 10, '#8a5a2b', '#3b2412', 5); box(-370, -290, 740, 44, 10, '#8a5a2b', '#3b2412', 5);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.moveTo(-300, -230); ctx.lineTo(-220, -230); ctx.lineTo(-320, 200); ctx.lineTo(-330, 120); ctx.fill();
    ctx.restore();
    const cy = siteWin(1010, 230, 520, 400, 'dafeiyu.github.io/baifan', { ufs: 20 }); baifanPage(1270, cy + 6, 480);
    ['🙋', '🧑‍🎓', '👩‍💻', '🙋‍♂️'].forEach((e, i) => { const s = popIn(t, P('G01_02', 0.45 + i * 0.08)); if (s <= 0) return; const x = 800 + i * 260 + Math.sin(t * 2 + i) * 10; txt(e, x, 860, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); if (t > P('G01_02', 0.7) + i * 0.05) txt('👆', x + 40, 790, 50, '#000', { align: 'center', font: EMOJI, bold: false }); });
    ctx.restore();
    if (t >= P('G01_02', 0.2)) fancy('仓库 → 展示柜', 1270, 92, 62, t, P('G01_02', 0.2), FX.yel);
  }
};
SFX_FNS.push(() => { const b = BK.why; sfx(b.t0 + 0.1, 'pop', 0.4); sfx(P('G01_01', 0.25), 'whoosh', 0.4); sfx(P('G01_01', 0.32), 'sparkle', 0.6); [0.55, 0.72].forEach(f => sfx(P('G01_01', f), 'pop', 0.4)); sfx(S('G01_02') - 0.2, 'swoosh_in', 0.4); sfx(P('G01_02', 0.2), 'ding', 0.4); for (let i = 0; i < 4; i++) sfx(P('G01_02', 0.45 + i * 0.08), 'pop', 0.25); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#1a7f37', '#2da44e', W * 0.6, H * 0.45, 28, 0.2);
  ['🌐', '📄', '🚀', '🔗', '✨'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  sprite('g_web', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 60, 1040);
  sprite('d_phone', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 760);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-400, -10, 95, '#ff5c8a', '第6集', { fs: 52, rot: -0.15, fg: '#fff' });
    fancy('GitHub', 60, -70, 120, t, -99, FX.white);
    fancy('Pages！', 110, 80, 150, t, -99, FX.green);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况（左侧插图，画在 80..960）----
function probPagesQ(t, blk) {
  const t0 = blk.t0; const ls = popIn(t, t0 + 0.15, 0.4);
  if (ls > 0) laptop(330, 470, 0.95 * ls, { screen: () => { txt('🍚', 0, 0, 90, '#000', { align: 'center', font: EMOJI, bold: false }); } });
  const ss = popIn(t, t0 + 0.4, 0.4); if (ss > 0) { ctx.save(); ctx.translate(740, 430); ctx.scale(ss, ss);
    box(-110, -170, 220, 340, 16, '#3a3358', '#1b1433', 6); for (let i = 0; i < 4; i++) { box(-85, -145 + i * 80, 170, 56, 8, '#24203d'); ctx.fillStyle = i % 2 ? '#7cf07a' : '#ffd23f'; ctx.beginPath(); ctx.arc(60, -117 + i * 80, 8, 0, 7); ctx.fill(); }
    txt('服务器？', 0, 220, 36, '#1b1433', { align: 'center' }); ctx.restore(); }
  ['？', '？'].forEach((q, i) => { const s = popIn(t, t0 + 0.6 + i * 0.12); if (s > 0) txt(q, 520 + i * 90, 250 - i * 40, 100 * s, ['#ff5c8a', '#3ec1ff'][i], { align: 'center', font: F_FANCY, bold: false }); });
  if (t >= P('D02', 0.7)) stamp(t, P('D02', 0.7), 520, 830, '要装啥？', '#ff7a3d', 60, -0.08);
}
function probQ404(t, blk) {
  const t0 = blk.t0; const cy = siteWin(110, 180, 820, 600, 'dafeiyu.github.io/baifan', { ufs: 24 });
  const s = popIn(t, t0 + 0.3, 0.45); if (s > 0) page404(520, cy + 40, s);
  if (t >= P('Q01', 0.55)) { flash(t, P('Q01', 0.55), 0.15, '255,80,100'); }
  const dq = U.D03; if (t >= dq.vo + 0.3) stamp(t, dq.vo + 0.3, 700, 840, '明明点了保存', '#ff3b5c', 48, 0.08);
}
function probImgQ(t, blk) {
  const t0 = blk.t0; const ls = popIn(t, t0 + 0.15, 0.4);
  if (ls > 0) laptop(270, 420, 0.75 * ls, { screen: () => { txt('🐱', 0, 0, 90, '#000', { align: 'center', font: EMOJI, bold: false }); } });
  txt('本地 ✓', 270, 560, 38, '#1a7f37', { align: 'center' });
  const ws = popIn(t, t0 + 0.4, 0.4); if (ws > 0) { ctx.save(); ctx.translate(700, 430); ctx.scale(ws, ws); ctx.translate(-700, -430);
    const cy = siteWin(500, 240, 400, 380, 'github.io/baifan', { ufs: 18 }); brokenImg(700, cy + 120, 1.4); txt('网上 ✗', 700, cy + 260, 38, '#cf222e', { align: 'center' }); ctx.restore(); }
  arrow(400, 420, 490, 420, '#8f8aa8', popIn(t, t0 + 0.55), 10, { dash: [16, 14], t });
  if (t >= P('M01', 0.6)) stamp(t, P('M01', 0.6), 520, 830, '图片裂了！', '#a66bff', 60, -0.08);
}
function probUpdQ(t, blk) {
  const t0 = blk.t0; const tA = popIn(t, t0 + 0.1, 0.4);
  if (tA > 0) { ctx.save(); ctx.globalAlpha *= clamp(tA); cmdBar(t, 520, 250, 'git push', t0 + 0.2, 0.4, { fs: 40 }); txt('✓ 推送成功', 520, 340, 34, '#1a7f37', { align: 'center' }); ctx.restore(); }
  const ws = popIn(t, t0 + 0.4, 0.4); if (ws > 0) { ctx.save(); ctx.translate(520, 620); ctx.scale(ws, ws); ctx.translate(-520, -620);
    const cy = siteWin(170, 420, 700, 420, 'dafeiyu.github.io/baifan', { ufs: 22, reload: t * 0.8 }); baifanPage(520, cy + 10, 640); ctx.restore(); }
  if (t >= P('X01', 0.55)) stamp(t, P('X01', 0.55), 520, 640, '一点没变？', '#ff3b5c', 64, -0.1);
}
function probJekQ(t, blk) {
  const t0 = blk.t0; const k = P('K01', 0.62);
  fileTree(170, 220, 700, [['index.html', ''], ['style.css', ''], ['_img/', t >= k ? 'bad' : '', null, '_img/'], ['   cat.png', t >= k ? 'ghost' : ''], ['   rice.png', t >= k ? 'ghost' : '']], { col: '#34407a' });
  if (t >= k) { note(700, 455, popIn(t, k), 'Jekyll 跳过', '#ff3b5c', { fs: 30, rot: 0.06 }); }
  const s = popIn(t, t0 + 0.4); if (s > 0) { ctx.save(); ctx.translate(520, 800); ctx.scale(s, s); fancy('_ 开头 = 不发布', 0, 0, 60, t, -99, FX.red); ctx.restore(); }
}
function probUserQ(t, blk) {
  const t0 = blk.t0; const cut = P('B01', 0.55);
  const s = popIn(t, t0 + 0.2, 0.4); if (s > 0) { ctx.save(); ctx.translate(520, 360); ctx.scale(s, s);
    box(-420, -60, 840, 120, 24, '#fff', '#1b1433', 6); ctx.font = `bold 44px ${F_CODE}`;
    txt('doubao.github.io', -390, 2, 44, '#24292f', { font: F_CODE }); const w1 = ctx.measureText('doubao.github.io').width;
    ctx.save(); ctx.globalAlpha *= 1 - prog(t, cut + 0.3, 0.4); txt('/baifan', -390 + w1, 2 + prog(t, cut + 0.3, 0.4) * 120, 44, '#cf222e', { font: F_CODE }); ctx.restore();
    if (t >= cut) txt('✂️', -390 + w1, -70, 70, '#000', { align: 'center', font: EMOJI, bold: false });
    ctx.restore(); }
  if (t >= cut + 0.4) fancy('干干净净！', 520, 560, 90, t, cut + 0.4, FX.blue);
  ['✨', '💖', '✨'].forEach((e, i) => { const sp = popIn(t, cut + 0.5 + i * 0.1); if (sp > 0) txt(e, 260 + i * 260, 740, 80 * sp, '#000', { align: 'center', font: EMOJI, bold: false }); });
}
function probAsk8(t, blk) {
  const t0 = blk.t0;
  [['🚀 开', PGC], ['🔍 查', '#e0485e'], ['🔄 改', WEBC]].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s > 0) { ctx.save(); ctx.translate(250 + i * 270, 480); ctx.scale(s, s); ctx.rotate((i - 1) * 0.06); box(-110, -140, 220, 280, 24, '#fff', c[1], 8); txt(c[0], 0, 0, 52, '#1b1433', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); } });
  if (t >= t0 + 0.6) txt('上线三步', 520, 760, 64, '#1a7f37', { align: 'center', font: F_FANCY, bold: false });
}
function probAskP(t, blk) {
  const s = popIn(t, blk.t0 + 0.15, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 520); ctx.scale(s, s); ctx.translate(-520, -520);
  const cy = siteWin(150, 200, 740, 560, 'dafeiyu.github.io/baifan', { ufs: 24 }); baifanPage(520, cy + 10, 690, { cat: 'ok' });
  ctx.restore();
  ['🚀', '🌐', '🎉'].forEach((e, i) => { const p = popIn(t, blk.t0 + 0.4 + i * 0.1); if (p > 0) txt(e, 200 + i * 320, 870, 90 * p, '#000', { align: 'center', font: EMOJI, bold: false }); });
}
const PROB = {
  pagesQ: { chap: ['第①步', '开启 Pages', PGC], q: '要装什么吗？', bg: ['#dcf7ea', '#b8eed3'], draw: probPagesQ },
  q404: { chap: ['踩坑①', '404', '#e0485e'], q: '明明点了保存！', bg: ['#ffe0e4', '#ffbcc6'], draw: probQ404 },
  imgQ: { chap: ['踩坑②', '图片裂了', '#a66bff', F_BODY], q: '图片放哪了？', bg: ['#eadfff', '#d6c4ff'], draw: probImgQ },
  updQ: { chap: ['踩坑③', '推送没变化', '#22a06b', F_BODY], q: '网站坏了？', bg: ['#dcf7ea', '#b8eed3'], draw: probUpdQ },
  jekQ: { chap: ['踩坑④', '_下划线文件夹', '#34407a', F_BODY], q: '一张都没有！', bg: ['#dde3ff', '#c3ccf5'], draw: probJekQ },
  userQ: { chap: ['进阶', '个人主页', '#16a5c9', F_BODY], q: '我也想要！', bg: ['#d7f3ff', '#b5e6ff'], draw: probUserQ },
  ask8: { chap: ['复习', '上线三步', PGC, F_BODY], q: '帮我收个尾！', bg: ['#dcf7ea', '#b8eed3'], draw: probAsk8 },
  askP: { chap: ['实战', '白饭页上线', '#ff7a3d', F_BODY], q: '现在就上线！', bg: ['#ffe6d6', '#ffcaa8'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  sfx(BK.pagesQ.t0 + 0.4, 'pop', 0.4); sfx(P('D02', 0.7), 'stamp', 0.6);
  sfx(BK.q404.t0 + 0.3, 'impact', 0.6); sfx(P('Q01', 0.55), 'buzz', 0.5); sfx(U.D03.vo + 0.3, 'stamp', 0.6);
  sfx(BK.imgQ.t0 + 0.4, 'pop', 0.4); sfx(P('M01', 0.6), 'stamp', 0.6);
  cmdAt(BK.updQ.t0 + 0.2, 'git push', 0.4); sfx(P('X01', 0.55), 'stamp', 0.7);
  sfx(P('K01', 0.62), 'buzz', 0.5);
  sfx(P('B01', 0.55), 'click', 0.6); sfx(P('B01', 0.55) + 0.4, 'sparkle', 0.5);
  [0, 1, 2].forEach(i => sfx(BK.ask8.t0 + 0.15 + i * 0.12, 'pop', 0.3));
  sfx(BK.askP.t0 + 0.15, 'pop', 0.4);
});
