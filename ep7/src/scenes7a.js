// ================= 第7集：GitHub Actions =================
Object.assign(SQ.Q, { role: '用户反馈' }); Object.assign(SQ.C, { role: '安全审查' }); Object.assign(SQ.M, { role: '定时任务' });
Object.assign(SQ.X, { role: '推送' }); Object.assign(SQ.B, { role: '展示' }); Object.assign(SQ.K, { role: '读文档' });
const ACC = '#2088ff', OKC = '#1f883d', BADC = '#cf222e', RUNC = '#d4a72c', WEBC = '#3ec1ff', LIVEC = '#1a7f37';
// 普通网站窗口（没有 GitHub 顶栏）：返回内容区顶部 y
function siteWin(x, y, w, h, url, o = {}) {
  win(x, y, w, h, o.title || '浏览器', o.accent || WEBC, { bg: '#ffffff', bar: '#e9e6f3' });
  box(x + 20, y + 68, w - 40, 50, 25, '#f2f0f8', '#d6d1e6', 2);
  txt('🔒 ' + url, x + 44, y + 94, o.ufs || 26, '#555', { font: F_CODE, bold: false, max: w - 120 });
  if (o.reload != null) { ctx.save(); ctx.translate(x + w - 56, y + 94); ctx.rotate(o.reload * Math.PI * 2); ctx.strokeStyle = '#7c5cff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 13, 0.3, 5.6); ctx.stroke(); ctx.restore(); }
  return y + 130;
}
// 白饭页本体（cx 中心，y 顶部，w 宽）；o.broken：标签没关好，排版全乱
function baifanPage(cx, y, w, o = {}) {
  const s = w / 700; ctx.save(); ctx.translate(cx, y); ctx.scale(s, s);
  if (o.broken) {
    box(-350, 0, 700, 90, 0, '#ffe9c7'); ctx.save(); ctx.rotate(0.05); txt('🍚 白饭页', -60, 50, 52, '#7a3d00', { align: 'center', font: F_FANCY, bold: false }); ctx.restore();
    ctx.save(); ctx.rotate(-0.08); ['首页', '今日推荐菜', '关于'].forEach((n, i) => chip(-320 + i * 90, 150 + i * 46, 1, n, ['#ff7a3d', '#22c08b', '#7c5cff'][i], '#fff', 26)); ctx.restore();
    txt('<div class="dish">番茄炒蛋盖饭', -330, 310, 28, BADC, { font: F_CODE, max: 660 });
    ctx.save(); ctx.rotate(0.12); box(30, 120, 300, 120, 14, '#fffaf0', '#ffd6a0', 3); txt('今日推荐菜', 60, 160, 26, '#b85c00', {}); ctx.restore();
    ctx.restore(); return;
  }
  box(-350, 0, 700, 90, 0, '#ffe9c7'); txt(o.title || '🍚 白饭页', 0, 46, 52, '#7a3d00', { align: 'center', font: F_FANCY, bold: false });
  ['首页', '今日推荐菜', '关于'].forEach((n, i) => chip(-300 + i * 200, 130, 1, n, ['#ff7a3d', '#22c08b', '#7c5cff'][i], '#fff', 26));
  box(-310, 180, 370, 150, 18, '#fffaf0', '#ffd6a0', 3); txt('今日推荐菜', -290, 212, 26, '#b85c00', {});
  txt(o.dish || '番茄炒蛋盖饭', -290, 262, o.dishFs || 34, '#1b1433', { max: 340 });
  if (o.badge) badgeSvg(200, 255, 1.1, 'check', 'passing', '#2ea44f');
  else for (let i = 0; i < 3; i++) box(90, 190 + i * 44, 180 + rnd(i + 7) * 40, 20, 10, '#e4dff5');
  ctx.restore();
}
// 状态图标：0 黄点转圈 / 1 绿勾 / 2 红叉
function statusIcon(x, y, r, st, t) {
  ctx.save(); ctx.translate(x, y);
  if (st === 1) { ctx.fillStyle = OKC; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-r * 0.48, 0); ctx.lineTo(-r * 0.12, r * 0.38); ctx.lineTo(r * 0.52, -r * 0.4); ctx.stroke(); }
  else if (st === 2) { ctx.fillStyle = BADC; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round'; const k = r * 0.4; ctx.beginPath(); ctx.moveTo(-k, -k); ctx.lineTo(k, k); ctx.moveTo(k, -k); ctx.lineTo(-k, k); ctx.stroke(); }
  else { ctx.fillStyle = '#fff8c5'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.rotate(t * 6); ctx.strokeStyle = RUNC; ctx.lineWidth = r * 0.26; ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, 4.4); ctx.stroke(); }
  ctx.restore();
}
// Actions 运行列表：rows = [[标题, 状态, 出现, 副标题, 用时, 高亮]]
function runList(t, x, y, w, rows, o = {}) {
  const rh = o.rh || 92;
  rows.forEach((r, i) => {
    const a = clamp(r[2] ?? 1); if (a <= 0) return; const ry = y + i * rh; ctx.save(); ctx.globalAlpha *= a;
    const bc = r[1] === 1 ? '#4ac26b' : r[1] === 2 ? '#ff8182' : RUNC;
    if (r[5]) { ctx.shadowColor = bc; ctx.shadowBlur = 30; }
    box(x, ry, w, rh - 12, 12, r[1] === 2 ? '#fff5f5' : '#fff', bc, r[5] ? 6 : 3); ctx.shadowBlur = 0;
    statusIcon(x + 44, ry + (rh - 12) / 2, 22, r[1], t);
    txt(r[0], x + 84, ry + 30, o.fs || 26, '#24292f', { font: /[\u4e00-\u9fff]/.test(r[0]) ? F_BODY : F_CODE, max: w - 250 }); txt(r[3] || 'check · main', x + 84, ry + 60, 20, '#57606a', { bold: false, max: w - 250 });
    txt(r[1] ? (r[4] || '23s') : '进行中…', x + w - 24, ry + (rh - 12) / 2, 24, r[1] === 1 ? LIVEC : r[1] === 2 ? BADC : '#9a6700', { align: 'right' });
    ctx.restore();
  });
}
// 代码编辑器：lines = [{s, t, dur, hl:[t0,t1], bad, good, dim, row}]；o.tabs：Tab 画成红箭头，o.dots：空格画点
function ymlEditor(t, x, y, w, h, title, lines, o = {}) {
  const fs = o.fs || 30, lh = fs * 1.55, a0 = o.alpha ?? 1; if (a0 <= 0) return;
  ctx.save(); ctx.globalAlpha *= a0;
  win(x, y, w, h, '📝 ' + title, o.accent || ACC, { bg: '#1b1730' });
  ctx.save(); rr(x + 6, y + 62, w - 12, h - 68, 16); ctx.clip();
  ctx.font = `bold ${fs}px ${F_CODE}`; const cw = ctx.measureText('m').width;
  lines.forEach((l, i) => {
    if (t < l.t) return; const row = l.row ?? i; const ly = y + 62 + 22 + lh * (row - (o.rowOff || 0) + 0.5); const a = clamp(prog(t, l.t, 0.18)); ctx.save(); ctx.globalAlpha *= a * (l.dim ? 0.35 : 1);
    const hot = l.hl && t >= l.hl[0] && t < l.hl[1];
    if (hot || l.bad || l.good) { const c = l.bad ? '#ff3b5c' : l.good ? '#2ec86e' : '#ffd23f'; box(x + 70, ly - lh / 2 + 3, w - 90, lh - 6, 10, hexA(c, hot && !l.bad && !l.good ? 0.16 + 0.08 * Math.sin(t * 8) : 0.24), c, 3); }
    txt(String(row + 1), x + 50, ly, fs * 0.8, '#6e6890', { align: 'right', font: F_CODE, bold: false });
    const n = Math.floor(clamp((t - l.t) / (l.dur || 0.35)) * [...l.s].length); const s = [...l.s].slice(0, n).join('');
    let cx = x + 92; const m = s.match(/^([ \t]*)(- )?([^:]*?:)?(.*)$/);
    for (const ch of m[1]) { if (ch === '\t') { txt('→', cx + cw * 0.3, ly, fs, '#ff5c7a', { font: F_CODE }); cx += cw * 4; } else { if (o.dots) { ctx.fillStyle = 'rgba(160,220,255,0.55)'; ctx.beginPath(); ctx.arc(cx + cw / 2, ly, 3.5, 0, 7); ctx.fill(); } cx += cw; } }
    if (m[2]) cx += txt('- ', cx, ly, fs, '#ff9de2', { font: F_CODE });
    if (m[3]) cx += txt(m[3], cx, ly, fs, '#7cc7ff', { font: F_CODE });
    if (m[4]) txt(m[4], cx, ly, fs, l.vcol || '#ffd27a', { font: F_CODE });
    ctx.restore();
  });
  ctx.restore(); ctx.restore();
}
// 状态徽章（shields 风格），x 为中心
function badgeSvg(x, y, s, label, val, col) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `bold 26px ${F_CODE}`; const w1 = ctx.measureText(label).width + 30, w2 = ctx.measureText(val).width + 30, W2 = w1 + w2;
  box(-W2 / 2, -22, W2, 44, 8, '#555'); ctx.save(); rr(-W2 / 2, -22, W2, 44, 8); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(-W2 / 2 + w1, -22, w2, 44); ctx.restore();
  txt(label, -W2 / 2 + w1 / 2, 1, 26, '#fff', { align: 'center', font: F_CODE }); txt(val, -W2 / 2 + w1 + w2 / 2, 1, 26, '#fff', { align: 'center', font: F_CODE });
  ctx.restore();
}
// 云电脑
function cloudPC(x, y, s, t, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1b1433'; ctx.lineWidth = 7; ctx.beginPath();
  ctx.arc(-90, 20, 70, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(-10, -50, 90, Math.PI, Math.PI * 1.9); ctx.arc(100, 10, 80, Math.PI * 1.4, Math.PI * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
  box(-70, -40, 140, 96, 10, '#1b1730', '#1b1433', 5); box(-24, 58, 48, 14, 4, '#1b1433');
  if (o.st != null) statusIcon(0, 8, 30, o.st, t); else txt('⚙️', 0, 8, 54, '#000', { align: 'center', font: EMOJI, bold: false });
  ctx.restore();
}
// 网址/路径拆解：segs = [[文字, 颜色, 说明]]
function urlParts(cx, y, s, segs, fs = 64) {
  if (s <= 0) return; ctx.save(); ctx.translate(cx, y); ctx.scale(s, s); ctx.font = `bold ${fs}px ${F_CODE}`;
  const ws = segs.map(g => ctx.measureText(g[0]).width), tot = ws.reduce((a, b) => a + b, 0); let x = -tot / 2;
  box(-tot / 2 - 40, -fs, tot + 80, fs * 2, 24, 'rgba(15,12,31,0.95)', '#fff', 5);
  segs.forEach((g, i) => { txt(g[0], x, 2, fs, g[1], { font: F_CODE }); if (g[2]) { ctx.strokeStyle = g[1]; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 6, fs * 0.82); ctx.lineTo(x + ws[i] - 6, fs * 0.82); ctx.stroke(); note(x + ws[i] / 2, fs * 1.75, 1, g[2], g[1], { fs: 30 }); } x += ws[i]; });
  ctx.restore();
}
// 邮件提醒
function mailCard(x, y, s, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0.04);
  box(-210, -80, 420, 160, 18, '#fff', '#1b1433', 5); txt('✉️', -150, 0, 70, '#000', { align: 'center', font: EMOJI, bold: false });
  txt('Run failed', -90, -28, 30, BADC, { font: F_CODE }); txt('check · main', -90, 14, 24, '#57606a', { font: F_CODE, bold: false }); txt('GitHub 邮件提醒', -90, 50, 22, '#57606a', { bold: false });
  ctx.restore();
}

// ---- 冷开场：坏页面推上去了 ----
SC.cold = (t, blk) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, P('D01', 0.4), 10, 0.35); ctx.translate(sx, sy);
  bgBurst(t, '#8c1f3a', '#d0485e', W * 0.62, H * 0.5, 22, 0.35);
  const wa = eBack(prog(t, t0 + 0.05, 0.4));
  ctx.save(); ctx.translate(1390, 470); ctx.scale(wa, wa); ctx.rotate(-0.02); ctx.translate(-1390, -470);
  const cy = siteWin(960, 100, 860, 640, 'dafeiyu.github.io/baifan', { title: '同学的手机', ufs: 24 });
  const br = t >= P('D01', 0.38); baifanPage(1390, cy + 20, 800, { broken: br });
  if (br) { flash(t, P('D01', 0.38), 0.15, '255,80,100'); stamp(t, P('D01', 0.42), 1560, 640, '<div> 没关！', BADC, 54, -0.1); }
  ctx.restore();
  [['哈哈哈', 1720, 200, 0.55, '#ff5c8a'], ['页面炸了？', 1100, 820, 0.64, '#7c5cff'], ['😂😂', 1700, 820, 0.72, '#22a06b']].forEach(q => { const s = popIn(t, P('D01', q[3])); if (s > 0) note(q[1], q[2], s, q[0], q[4], { fs: 40, rot: -0.06 }); });
  const p = spring(prog(t, t0, 0.9));
  sprite('d_panic', 480, H + 40, 980, { scale: lerp(1.3, 1, p) });
  fancy('页面全乱了！', 470, 160, 88, t, U.D01.vo + 0.05, { rot: -0.08, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
  if (t >= P('D01', 0.8)) fancy('同学都看见了……', 1390, 960, 64, t, P('D01', 0.8), Object.assign({ rot: -0.03 }, FX.white));
};
SFX_FNS.push(() => { sfx(BK.cold.t0 + 0.05, 'swoosh_in', 0.5); sfx(P('D01', 0.38), 'impact', 0.6); sfx(P('D01', 0.42), 'stamp', 0.6); [0.55, 0.64, 0.72].forEach(f => sfx(P('D01', f), 'boing', 0.3)); sfx(P('D01', 0.8), 'buzz', 0.3); });

// ---- 引入：云电脑按任务单干活；自动挂机 ----
SC.why = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const sw = S('G01_02') - 0.2, a1 = 1 - eIO(prog(t, sw, 0.35));
  if (a1 > 0) { ctx.save(); ctx.globalAlpha = a1;
    const ps = popIn(t, blk.t0 + 0.1); if (ps > 0) { ctx.save(); ctx.translate(880, 300); ctx.scale(ps, ps); box(-150, -60, 300, 120, 24, '#0f0c1f', '#7cf07a', 5); txt('git push', 0, 2, 40, '#fff', { align: 'center', font: F_CODE }); ctx.restore(); }
    const ckt = P('G01_01', 0.15); if (t < ckt + 0.5) { const q = popIn(t, blk.t0 + 0.3); if (q > 0) { txt('🥱 每次都自己检查？', 880, 470, 36 * q, '#fff', { align: 'center' }); if (t >= ckt) bigX(880, 470, 60, '#ff3b5c', prog(t, ckt, 0.3)); } }
    arrow(1050, 300, 1220, 300, ACC, eOut(prog(t, P('G01_01', 0.3), 0.4)), 16);
    cloudPC(1430, 300, popIn(t, P('G01_01', 0.32), 0.45), t, { st: t >= P('G01_01', 0.8) ? 1 : 0 });
    const ls = popIn(t, P('G01_01', 0.55), 0.4); if (ls > 0) { ctx.save(); ctx.translate(1430, 640); ctx.scale(ls, ls); box(-260, -150, 520, 300, 20, '#fffaf0', '#1b1433', 6); txt('📋 任务单', -230, -108, 34, '#1b1433', {});
      ['拉代码', '检查网页', '自动部署'].forEach((k, i) => { const on = t >= P('G01_01', 0.62 + i * 0.08); box(-230, -62 + i * 66, 40, 40, 8, on ? OKC : '#fff', '#1b1433', 3); if (on) txt('✓', -210, -40 + i * 66, 32, '#fff', { align: 'center' }); txt(k, -170, -42 + i * 66, 32, '#1b1433', {}); });
      ctx.restore(); }
    if (t >= P('G01_01', 0.8)) sparkle(t, P('G01_01', 0.8), 1430, 300, 180, 10);
    ctx.restore();
  }
  if (t >= sw) { // 自动挂机
    const a = eOut(prog(t, sw, 0.35)); ctx.save(); ctx.globalAlpha = a;
    const on = t >= P('G01_02', 0.25);
    ctx.save(); ctx.translate(1270, 330); ctx.scale(eBack(prog(t, sw, 0.45)), eBack(prog(t, sw, 0.45)));
    box(-380, -170, 760, 340, 40, '#2a2350', '#fff', 7); txt('🎮', -270, -20, 120, '#000', { align: 'center', font: EMOJI, bold: false });
    box(-110, -70, 420, 120, 60, on ? '#22c08b' : '#4a4370', '#fff', 6); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(on ? 250 : -50, -10, 46, 0, 7); ctx.fill();
    txt(on ? 'AUTO ON' : 'AUTO', on ? 30 : 160, -10, 46, '#fff', { align: 'center', font: F_CODE });
    txt('自动挂机', 100, 110, 40, '#ffd23f', { align: 'center' }); ctx.restore();
    [0, 1, 2].forEach(i => { const s = popIn(t, P('G01_02', 0.5 + i * 0.1)); if (s <= 0) return; ctx.save(); ctx.translate(900 + i * 370, 700); ctx.scale(s, s);
      box(-150, -70, 300, 140, 22, '#fff', OKC, 5); txt('💾 存档 ' + (i + 1), -40, -18, 32, '#1b1433', { align: 'center' }); txt('⬆ 上传', -40, 28, 28, '#57606a', { align: 'center', bold: false }); statusIcon(100, 0, 30, 1, t); ctx.restore(); });
    if (t >= P('G01_02', 0.3)) pill(1270, 120, '规则写一次 · 每次自动跑', '#ffd23f', popIn(t, P('G01_02', 0.3)), { fs: 40, font: F_BODY });
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.why; sfx(b.t0 + 0.1, 'pop', 0.4); sfx(P('G01_01', 0.15), 'buzz', 0.4); sfx(P('G01_01', 0.3), 'whoosh', 0.4); sfx(P('G01_01', 0.32), 'pop', 0.5); sfx(P('G01_01', 0.55), 'pop', 0.4);
  [0, 1, 2].forEach(i => sfx(P('G01_01', 0.62 + i * 0.08), 'ding', 0.3)); sfx(P('G01_01', 0.8), 'sparkle', 0.5);
  sfx(S('G01_02') - 0.2, 'swoosh_in', 0.4); sfx(P('G01_02', 0.25), 'click', 0.7); sfx(P('G01_02', 0.3), 'ding', 0.4); [0, 1, 2].forEach(i => sfx(P('G01_02', 0.5 + i * 0.1), 'pop', 0.3)); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#0b4fa8', '#2088ff', W * 0.6, H * 0.45, 28, 0.2);
  ['⚙️', '✅', '🤖', '⏰', '🔑'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  sprite('g_check', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 60, 1040);
  sprite('d_robot', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 760);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-400, -10, 95, '#ff5c8a', '第7集', { fs: 52, rot: -0.15, fg: '#fff' });
    fancy('GitHub', 60, -70, 120, t, -99, FX.white);
    fancy('Actions！', 110, 80, 150, t, -99, FX.blue);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况（左侧插图，画在 80..960）----
function probWfQ(t, blk) {
  const t0 = blk.t0; const ls = popIn(t, t0 + 0.15, 0.4);
  if (ls > 0) laptop(330, 470, 0.95 * ls, { screen: () => { txt('📋', 0, 0, 90, '#000', { align: 'center', font: EMOJI, bold: false }); } });
  const ss = popIn(t, t0 + 0.4, 0.4); if (ss > 0) { ctx.save(); ctx.translate(760, 430); ctx.scale(ss, ss); ctx.rotate(0.06);
    box(-120, -150, 240, 300, 18, '#e8e4f8', '#1b1433', 6); txt('💿', 0, -40, 100, '#000', { align: 'center', font: EMOJI, bold: false }); txt('安装包？', 0, 90, 36, '#1b1433', { align: 'center' }); ctx.restore(); }
  ['？', '？'].forEach((q, i) => { const s = popIn(t, t0 + 0.6 + i * 0.12); if (s > 0) txt(q, 520 + i * 90, 250 - i * 40, 100 * s, ['#ff5c8a', '#3ec1ff'][i], { align: 'center', font: F_FANCY, bold: false }); });
  if (t >= P('D02', 0.7)) stamp(t, P('D02', 0.7), 520, 830, '写在哪？', '#ff7a3d', 64, -0.08);
}
function probYamlQ(t, blk) {
  const t0 = blk.t0, k = P('K01', 0.55), d = U.D03.vo + 0.2, ok = U.K02.vo + 0.3;
  const L = t < d ? [{ s: 'jobs:', t: 0 }, { s: '  check:', t: 0 }, { s: '    runs-on: ubuntu-latest', t: 0 }]
    : [{ s: 'jobs:', t: 0 }, { s: t < ok ? '\tcheck:' : '  check:', t: 0, bad: t < ok, good: t >= ok }, { s: '    runs-on: ubuntu-latest', t: 0, good: t >= ok }];
  ymlEditor(t, 110, 200, 820, 330, 'check.yml', L, { fs: 30, dots: t >= k, accent: '#34407a', alpha: popIn(t, t0 + 0.1) });
  if (t >= k && t < d) { note(320, 600, popIn(t, k), '空格 ✓', '#2ec86e', { fs: 40 }); note(700, 600, popIn(t, k + 0.15), 'Tab ✗', '#ff3b5c', { fs: 40 }); }
  if (t >= d && t < ok) stamp(t, d + 0.15, 520, 640, 'Invalid workflow file', BADC, 46, -0.06);
  if (t >= ok) { fancy('同层左对齐！', 520, 640, 72, t, ok, FX.green); }
}
function probRedQ(t, blk) {
  const t0 = blk.t0; const cy = browser(110, 170, 820, 560, 'github.com/dafeiyu/baifan/commits', { title: '提交记录', accent: BADC });
  [['白饭页改版', 2, 0.25, '刚刚'], ['加今日推荐菜', 1, 0.15, '昨天'], ['第一次上线', 1, 0.1, '3 天前']].forEach((c, i) => { const a = prog(t, t0 + c[2], 0.2); if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; const ry = cy + 30 + i * 110;
    box(140, ry, 760, 90, 12, i ? '#fff' : '#fff5f5', i ? '#d0d7de' : '#ff8182', i ? 2 : 4); txt(c[0], 170, ry + 32, 30, '#24292f', {}); txt('dafeiyu · ' + c[3], 170, ry + 66, 20, '#57606a', { bold: false }); statusIcon(850, ry + 45, i ? 18 : 22 + 6 * Math.max(0, Math.sin(t * 6)), c[1], t); ctx.restore(); });
  if (t >= P('X01', 0.5)) { const s = popIn(t, P('X01', 0.5), 0.4); ctx.save(); ctx.translate(850, cy + 75); ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 50 * s, 0, 7); ctx.stroke(); ctx.restore(); }
  if (U.D04 && t >= U.D04.vo + 0.3) stamp(t, U.D04.vo + 0.3, 520, 830, '红叉？！', BADC, 70, -0.08);
}
function probPrQ(t, blk) {
  const t0 = blk.t0; const cy = browser(110, 170, 820, 600, 'github.com/dafeiyu/baifan/pull/3', { title: 'Pull request', accent: '#5b6ee1' });
  txt('改今日推荐菜：咖喱饭 #3', 140, cy + 46, 32, '#24292f', {}); chip(140, cy + 100, 1, '⇄ Open', OKC, '#fff', 24); txt('xiaoming 想合并到 main', 280, cy + 100, 22, '#57606a', { bold: false });
  box(140, cy + 150, 760, 120, 14, '#f6f8fa', '#d0d7de', 2); const q = t >= P('Q01', 0.55);
  txt(q ? '⚪ 还没有任何检查' : '…', 170, cy + 190, 28, '#57606a', {}); txt('合并前不知道会不会坏', 170, cy + 236, 22, '#8c959f', { bold: false });
  ghButton(140, cy + 300, 300, 64, 'Merge pull request', OKC, { fs: 24 });
  if (t >= P('Q01', 0.55)) txt('？', 500, cy + 330, 80, '#ff5c8a', { align: 'center', font: F_FANCY, bold: false });
  if (U.D05 && t >= U.D05.vo + 0.3) stamp(t, U.D05.vo + 0.3, 600, 830, '合并完才发现！', BADC, 54, -0.08);
}
function probCronQ(t, blk) {
  const t0 = blk.t0; const fl = P('M01', 0.6);
  [['设定', '08:00', '#2ec86e', 300, 0.15], ['实际', '16:00', '#ff3b5c', 740, 0.5]].forEach((c, i) => { const s = popIn(t, i ? fl : t0 + c[4], 0.4); if (s <= 0) return; ctx.save(); ctx.translate(c[3], 400); ctx.scale(s, s);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = c[2]; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 150, 0, 7); ctx.fill(); ctx.stroke();
    const hh = i ? 4 : 8; ctx.strokeStyle = '#1b1433'; ctx.lineCap = 'round'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(hh / 12 * Math.PI * 2) * 80, -Math.cos(hh / 12 * Math.PI * 2) * 80); ctx.stroke();
    ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -120); ctx.stroke(); ctx.fillStyle = '#1b1433'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.fill();
    txt(c[0] + ' ' + c[1], 0, 200, 44, '#1b1433', { align: 'center', font: F_CODE }); ctx.restore(); });
  if (t >= fl) arrow(470, 400, 570, 400, '#ff3b5c', eOut(prog(t, fl + 0.2, 0.3)), 12);
  if (U.D06 && t >= U.D06.vo) { const f = prog(t, P('D06', 0.6), 0.4); calendar(520, 760, popIn(t, U.D06.vo + 0.1), ['2026', '????'], f); }
  else if (t >= fl + 0.4) stamp(t, fl + 0.4, 520, 780, '晚了 8 小时！', '#a855f7', 60, -0.08);
}
function probSecQ(t, blk) {
  const t0 = blk.t0; const L = [{ s: 'steps:', t: 0 }, { s: '  - run: ./deploy.sh', t: 0 }, { s: '    env:', t: 0 }, { s: '      KEY: sk-baifan-8f3a2c', t: t0 + 0.3, bad: t >= P('C01', 0.35), vcol: '#ff9aa9' }];
  ymlEditor(t, 110, 220, 820, 400, 'check.yml', L, { fs: 30, accent: '#e07a3d', alpha: popIn(t, t0 + 0.1) });
  if (t >= P('C01', 0.4)) chip(130, 180, 1, '🌐 Public 公开仓库', '#e07a3d', '#fff', 30);
  ['👀', '👀', '👀'].forEach((e, i) => { const s = popIn(t, P('C01', 0.5 + i * 0.08)); if (s > 0) txt(e, 260 + i * 260, 720 + Math.sin(t * 3 + i) * 10, 80 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  if (U.D07 && t >= U.D07.vo + 0.3) stamp(t, U.D07.vo + 0.3, 600, 860, '谁都看得见！', BADC, 56, -0.08);
}
function probBadgeQ(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.15, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 470); ctx.scale(s, s); ctx.translate(-520, -470);
  box(130, 200, 780, 520, 20, '#fff', '#d0d7de', 3); box(130, 200, 780, 70, [20, 20, 0, 0], '#f6f8fa', '#d0d7de', 2); txt('📖 README.md', 160, 236, 30, '#24292f', {});
  txt('🍚 白饭页', 170, 340, 60, '#24292f', { font: F_FANCY, bold: false });
  const bp = popIn(t, P('B01', 0.45), 0.4); badgeSvg(330, 430, 1.5 * bp, 'check', 'passing', '#2ea44f'); if (bp > 0) sparkle(t, P('B01', 0.45), 330, 430, 160, 10);
  txt('每天推荐一道盖饭', 170, 530, 32, '#57606a', { bold: false }); for (let i = 0; i < 2; i++) box(170, 590 + i * 50, 500 - i * 120, 20, 10, '#eaeef2');
  ctx.restore();
  if (U.D08 && t >= U.D08.vo + 0.3) fancy('一看就靠谱！', 520, 830, 76, t, U.D08.vo + 0.3, FX.green);
}
function probAsk8(t, blk) {
  const t0 = blk.t0;
  [['✍️ 写', ACC], ['👀 看', OKC], ['🛠️ 管', '#e07a3d']].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s > 0) { ctx.save(); ctx.translate(250 + i * 270, 480); ctx.scale(s, s); ctx.rotate((i - 1) * 0.06); box(-110, -140, 220, 280, 24, '#fff', c[1], 8); txt(c[0], 0, 0, 52, '#1b1433', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); } });
  if (t >= t0 + 0.6) txt('三个重点', 520, 760, 64, ACC, { align: 'center', font: F_FANCY, bold: false });
}
function probAskP(t, blk) {
  const s = popIn(t, blk.t0 + 0.15, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 500); ctx.scale(s, s); ctx.translate(-520, -500);
  const cy = siteWin(150, 200, 740, 560, 'dafeiyu.github.io/baifan', { ufs: 24 }); baifanPage(520, cy + 10, 690);
  ctx.restore();
  ['🤖', '✅', '🚀'].forEach((e, i) => { const p = popIn(t, blk.t0 + 0.4 + i * 0.1); if (p > 0) txt(e, 200 + i * 320, 870, 90 * p, '#000', { align: 'center', font: EMOJI, bold: false }); });
}
const PROB = {
  wfQ: { chap: ['第①步', '写任务单', ACC, F_BODY], q: '要装什么吗？', bg: ['#dbeaff', '#b9d6ff'], draw: probWfQ },
  yamlQ: { chap: ['踩坑①', 'YAML 缩进', '#34407a', F_BODY], q: '我用了 Tab！', bg: ['#dde3ff', '#c3ccf5'], draw: probYamlQ },
  redQ: { chap: ['第②步', '看结果', BADC, F_BODY], q: '仓库坏了？', bg: ['#ffe0e4', '#ffbcc6'], draw: probRedQ },
  prQ: { chap: ['第③步', 'PR 自动检查', '#5b6ee1', F_BODY], q: '合并前先查！', bg: ['#e3e6ff', '#c9cff9'], draw: probPrQ },
  cronQ: { chap: ['踩坑②', '定时差 8 小时', '#a855f7', F_BODY], q: '这次几几年？', bg: ['#eadfff', '#d6c4ff'], draw: probCronQ },
  secQ: { chap: ['踩坑③', '密钥别写进代码', '#e07a3d', F_BODY], q: '密钥放哪？', bg: ['#ffe9d6', '#ffd0ab'], draw: probSecQ },
  badgeQ: { chap: ['进阶', '状态徽章', '#16a5c9', F_BODY], q: '我也要绿的！', bg: ['#d7f3ff', '#b5e6ff'], draw: probBadgeQ },
  ask8: { chap: ['复习', '写 · 看 · 管', ACC, F_BODY], q: '帮我划重点！', bg: ['#dbeaff', '#b9d6ff'], draw: probAsk8 },
  askP: { chap: ['实战', '白饭页自动检查', '#ff7a3d', F_BODY], q: '现在就装上！', bg: ['#ffe6d6', '#ffcaa8'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  sfx(BK.wfQ.t0 + 0.4, 'pop', 0.4); sfx(P('D02', 0.7), 'stamp', 0.6);
  sfx(P('K01', 0.55), 'pop', 0.4); sfx(U.D03.vo + 0.35, 'buzz', 0.5); sfx(U.K02.vo + 0.3, 'ding', 0.5);
  sfx(P('X01', 0.5), 'buzz', 0.5); sfx(U.D04.vo + 0.3, 'stamp', 0.6);
  sfx(P('Q01', 0.55), 'boing', 0.3); sfx(U.D05.vo + 0.3, 'stamp', 0.6);
  sfx(P('M01', 0.6), 'buzz', 0.5); sfx(P('M01', 0.6) + 0.4, 'stamp', 0.5); sfx(P('D06', 0.6), 'whoosh', 0.4);
  sfx(P('C01', 0.35), 'buzz', 0.5); [0, 1, 2].forEach(i => sfx(P('C01', 0.5 + i * 0.08), 'pop', 0.25)); sfx(U.D07.vo + 0.3, 'stamp', 0.6);
  sfx(P('B01', 0.45), 'sparkle', 0.5); sfx(U.D08.vo + 0.3, 'ding', 0.4);
  [0, 1, 2].forEach(i => sfx(BK.ask8.t0 + 0.15 + i * 0.12, 'pop', 0.3));
  sfx(BK.askP.t0 + 0.15, 'pop', 0.4);
});
