// ================= 第8集：变基 rebase =================
Object.assign(SQ.Q, { role: '用户反馈' }); Object.assign(SQ.C, { role: '先读提示' }); Object.assign(SQ.M, { role: '改旧说明' });
Object.assign(SQ.X, { role: '强推' }); Object.assign(SQ.B, { role: '合并碎提交' }); Object.assign(SQ.K, { role: '翻日记' });
const ACC = '#f76707', MAINC = '#3ec1ff', FEATC = '#ff7a3d', NEWC = '#ffd23f', KNOTC = '#ff4d6d', OKC = '#1f883d', BADC = '#cf222e', RUNC = '#d4a72c', LIVEC = '#1a7f37';
const CMDC = { pick: '#6bd3ff', squash: '#ff9f43', fixup: '#c9a6ff', reword: '#7cf07a', drop: '#ff6b81' };
const isCJK = s => /[\u4e00-\u9fff]/.test(s);
// 提交点：x,y 圆心；s 缩放；o.r 半径、o.glow、o.lab 标签、o.up 标签在上、o.ghost 半透明、o.mark 圆内字
function gDot(x, y, s, col, o = {}) {
  if (s <= 0) return; const r = o.r || 24; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.ghost) ctx.globalAlpha *= 0.3;
  if (o.glow) { ctx.fillStyle = hexA(col, 0.35); ctx.beginPath(); ctx.arc(0, 0, r * 1.9 + 5 * Math.sin((o.t || 0) * 8), 0, 7); ctx.fill(); }
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.lineWidth = r * 0.26; ctx.strokeStyle = '#fff'; ctx.stroke();
  if (o.mark) txt(o.mark, 0, 1, r * 1.05, '#fff', { align: 'center', font: F_CODE });
  if (o.lab) txt(o.lab, 0, o.up ? -r - 24 : r + 26, o.fs || 24, o.lc || '#fff', { align: 'center', font: isCJK(o.lab) ? F_BODY : F_CODE, max: o.max || 220 });
  ctx.restore();
}
// 节点 N = {k: {x, y, col, t0, ...gDot 选项}}；边 E = [[k1, k2, t0, col]]（col 缺省取终点颜色）
function drawGraph(t, N, E, o = {}) {
  E.forEach(e => { const a = N[e[0]], b = N[e[1]]; if (!a || !b) return; const p = prog(t, e[2] ?? -1, 0.25); if (p <= 0) return;
    ctx.save(); if (a.ghost || b.ghost) ctx.globalAlpha *= 0.3; seg(a.x, a.y, b.x, b.y, e[3] || b.col, p, o.lw || 9); ctx.restore(); });
  Object.values(N).forEach(n => gDot(n.x, n.y, n.s ?? popIn(t, n.t0 ?? -1), n.col, Object.assign({ t, fs: o.fs, r: o.r }, n)));
}
// 曲线 + 抬起：把点从 (x0,y0) 搬到 (x1,y1)
function moveP(t, t0, d, x0, y0, x1, y1, lift = 90) { const p = eIO(prog(t, t0, d)); return [lerp(x0, x1, p), lerp(y0, y1, p) - Math.sin(p * Math.PI) * lift, p]; }
// 交互式变基清单：rows = [{cmd, hash, msg, t, to:[[时间, 新cmd]], gone:时间, y0 行号覆盖}]
function todoList(t, x, y, w, rows, o = {}) {
  const fs = o.fs || 30, lh = o.lh || fs * 1.9; const h = o.h || (90 + rows.length * lh + (o.foot ? 70 : 20));
  const a0 = o.alpha ?? 1; if (a0 <= 0) return; ctx.save(); ctx.globalAlpha *= a0;
  win(x, y, w, h, '📝 ' + (o.title || 'git-rebase-todo'), o.accent || ACC, { bg: '#1b1730' });
  rows.forEach((r, i) => {
    if (t < (r.t ?? -1)) return; let cmd = r.cmd; (r.to || []).forEach(c => { if (t >= c[0]) cmd = c[1]; });
    const ch = (r.to || []).find(c => t >= c[0] && t < c[0] + 0.45);
    const gone = r.gone != null ? clamp(prog(t, r.gone, 0.35)) : 0; const row = r.row != null ? (typeof r.row === 'function' ? r.row(t) : r.row) : i;
    const ly = y + 100 + row * lh; ctx.save(); ctx.globalAlpha *= clamp(prog(t, r.t ?? -1, 0.2)) * (1 - gone * 0.8);
    if (ch || r.hl && t >= r.hl[0] && t < r.hl[1]) box(x + 20, ly - lh / 2 + 4, w - 40, lh - 8, 10, hexA(CMDC[cmd] || '#ffd23f', 0.2 + 0.08 * Math.sin(t * 8)), CMDC[cmd] || '#ffd23f', 3);
    ctx.font = `bold ${fs}px ${F_CODE}`; const cw = ctx.measureText('squash ').width;
    const sc = ch ? 1 + 0.25 * Math.sin(prog(t, ch[0], 0.45) * Math.PI) : 1;
    ctx.save(); ctx.translate(x + 40, ly); ctx.scale(sc, sc); txt(cmd, 0, 0, fs, CMDC[cmd] || '#fff', { font: F_CODE }); ctx.restore();
    txt(r.hash, x + 40 + cw, ly, fs, '#ffd36b', { font: F_CODE }); txt(r.msg, x + 40 + cw + fs * 4.4, ly, fs, '#ece9f7', { font: isCJK(r.msg) ? F_BODY : F_CODE, max: w - cw - fs * 4.4 - 70 });
    if (gone > 0) { ctx.strokeStyle = '#ff6b81'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 30, ly); ctx.lineTo(x + 30 + (w - 60) * gone, ly); ctx.stroke(); }
    ctx.restore();
  });
  if (o.foot) txt(o.foot, x + 40, y + h - 40, 22, '#8f8aa8', { font: F_CODE, bold: false });
  ctx.restore();
}
// 胶片条（cx 中心）：frames = [[文字, 颜色, 透明度, 缩放]]
function filmStrip(cx, y, s, frames, o = {}) {
  if (s <= 0) return; const fw = o.fw || 170, fh = o.fh || 130, n = frames.length, w = n * fw + 40; ctx.save(); ctx.translate(cx, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  box(-w / 2, -fh / 2 - 34, w, fh + 68, 10, '#2b2233', '#111', 4);
  for (let i = 0; i < n * 3 + 2; i++) { const hx = -w / 2 + 12 + i * (w - 24) / (n * 3 + 1); box(hx - 7, -fh / 2 - 24, 14, 14, 3, '#f4efe6'); box(hx - 7, fh / 2 + 10, 14, 14, 3, '#f4efe6'); }
  frames.forEach((f, i) => { const fx = -w / 2 + 20 + i * fw; ctx.save(); ctx.globalAlpha *= f[2] ?? 1; const k = f[3] ?? 1; ctx.translate(fx + fw / 2, 0); ctx.scale(k, k);
    box(-fw / 2 + 6, -fh / 2, fw - 12, fh, 8, f[1] || '#5b4a7a'); txt(f[0], 0, 0, o.fs || 28, '#fff', { align: 'center', max: fw - 24 }); ctx.restore(); });
  ctx.restore();
}

// ---- 冷开场：提交历史乱成一团 ----
SC.cold = (t, blk) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, P('D01', 0.62), 10, 0.35); ctx.translate(sx, sy);
  bgBurst(t, '#7a1f4a', '#c2416d', W * 0.62, H * 0.5, 22, 0.35);
  const wa = eBack(prog(t, t0 + 0.05, 0.4));
  ctx.save(); ctx.translate(1390, 450); ctx.scale(wa, wa); ctx.rotate(-0.02); ctx.translate(-1390, -450);
  win(960, 90, 860, 700, '终端 — git log --graph', ACC, { bg: '#1b1730' });
  const N = {}, E = []; const labs = ['甜点菜单', '改改', 'Merge branch main', '再改', 'Merge branch main', '真的好了', 'Merge branch main'];
  labs.forEach((l, i) => { const mg = l.startsWith('Merge'); const x = mg ? 1130 : 1060 + (i % 2) * 150, y = 720 - i * 88;
    N['n' + i] = { x, y, col: mg ? KNOTC : FEATC, t0: t0 + 0.15 + i * 0.12, r: 18 }; if (i) E.push(['n' + (i - 1), 'n' + i, t0 + 0.15 + i * 0.12]);
    if (mg) { N['m' + i] = { x: 1290, y: y + 44, col: MAINC, t0: t0 + 0.1 + i * 0.12, r: 14 }; E.push(['m' + i, 'n' + i, t0 + 0.15 + i * 0.12, MAINC]); }
    const a = popIn(t, t0 + 0.2 + i * 0.12); if (a > 0) txt(l, 1340, y, 28, mg ? '#ff9aa9' : '#ece9f7', { font: isCJK(l) ? F_BODY : F_CODE, max: 460 }); });
  drawGraph(t, N, E, { lw: 7 });
  if (t >= P('D01', 0.62)) { flash(t, P('D01', 0.62), 0.15, '255,80,120'); stamp(t, P('D01', 0.66), 1560, 640, '全是分叉！', BADC, 60, -0.1); }
  ctx.restore();
  [['这是啥？', 1720, 170, 0.5, '#ff5c8a'], ['看不懂…', 1110, 860, 0.56, '#7c5cff']].forEach(q => { const s = popIn(t, P('D01', q[3])); if (s > 0) note(q[1], q[2], s, q[0], q[4], { fs: 40, rot: -0.06 }); });
  const p = spring(prog(t, t0, 0.9));
  sprite('d_tangle', 470, H + 40, 990, { scale: lerp(1.3, 1, p) });
  fancy('乱成一团！', 460, 150, 92, t, U.D01.vo + 0.05, { rot: -0.08, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
  if (t >= P('D01', 0.12)) pill(1390, 960, 'PR 都不好意思发…', '#ff9aa9', popIn(t, P('D01', 0.12)), { fs: 38, font: F_BODY });
};
SFX_FNS.push(() => { const b = BK.cold; sfx(b.t0 + 0.05, 'swoosh_in', 0.5); for (let i = 0; i < 7; i++) sfx(b.t0 + 0.15 + i * 0.12, 'pop', 0.22); sfx(P('D01', 0.12), 'boing', 0.3); [0.5, 0.56].forEach(f => sfx(P('D01', f), 'boing', 0.3)); sfx(P('D01', 0.62), 'impact', 0.6); sfx(P('D01', 0.66), 'stamp', 0.6); });

// ---- 引入：提交拿起来接到 main 后面；剪辑录像 ----
SC.why = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const sw = S('G01_02') - 0.2, a1 = 1 - eIO(prog(t, sw, 0.35));
  if (a1 > 0) { ctx.save(); ctx.globalAlpha = a1;
    box(700, 170, 1160, 560, 30, 'rgba(15,12,31,0.88)', '#fff', 5);
    const up = P('G01_01', 0.42), mv = P('G01_01', 0.5);
    const N = { a: { x: 800, y: 330, col: MAINC, t0: blk.t0 + 0.1, lab: 'A' }, b: { x: 960, y: 330, col: MAINC, t0: blk.t0 + 0.16, lab: 'B' },
      c: { x: 1120, y: 330, col: MAINC, t0: P('G01_01', 0.3), lab: 'C' }, d: { x: 1280, y: 330, col: MAINC, t0: P('G01_01', 0.34), lab: 'D' } };
    const E = [['a', 'b', blk.t0 + 0.16], ['b', 'c', P('G01_01', 0.3)], ['c', 'd', P('G01_01', 0.34)]];
    const f1 = moveP(t, mv, 0.6, 1120, 560, 1440, 330, 120), f2 = moveP(t, mv + 0.15, 0.6, 1280, 560, 1600, 330, 120);
    N.f1 = { x: f1[0], y: f1[1], col: f1[2] > 0.99 ? NEWC : FEATC, t0: blk.t0 + 0.3, lab: f1[2] > 0.99 ? "F1'" : 'F1' };
    N.f2 = { x: f2[0], y: f2[1], col: f2[2] > 0.99 ? NEWC : FEATC, t0: blk.t0 + 0.36, lab: f2[2] > 0.99 ? "F2'" : 'F2' };
    if (t < mv) E.push(['b', 'f1', blk.t0 + 0.3]); else if (f1[2] > 0.99) E.push(['d', 'f1', mv + 0.6]);
    E.push(['f1', 'f2', blk.t0 + 0.36]);
    drawGraph(t, N, E);
    txt('main', 800, 282, 26, MAINC, { align: 'center', font: F_CODE }); if (t < mv) txt('你的分支', 1180, 640, 26, FEATC, {});
    if (t >= up && t < mv + 1) { const s = popIn(t, up); note(1360, 470, s, '拿起来 ↻ 重新放一遍', NEWC, { fs: 36 }); }
    if (t >= mv + 0.8) { fancy('一条直线！', 1280, 620, 76, t, mv + 0.8, FX.yel); }
    pill(1280, 120, '变基 rebase · 整理提交历史', NEWC, popIn(t, blk.t0 + 0.1), { fs: 40, font: F_BODY });
    ctx.restore(); }
  if (t >= sw) { // 剪辑游戏录像
    const a = eOut(prog(t, sw, 0.35)); ctx.save(); ctx.globalAlpha = a;
    const cut = P('G01_02', 0.25), glue = P('G01_02', 0.5), done = P('G01_02', 0.75);
    const fr0 = [['开场', '#5b6ee1'], ['失误', '#cf222e'], ['碎镜头', '#a26ad9'], ['碎镜头', '#a26ad9'], ['通关', '#22a06b']];
    if (t < glue) { filmStrip(1280, 380, popIn(t, sw, 0.4), fr0.map((f, i) => [f[0], f[1], i === 1 ? 1 - clamp(prog(t, cut + 0.1, 0.3)) : 1])); if (t >= cut) bigX(1110, 380, 70, '#ff3b5c', prog(t, cut, 0.3)); }
    else filmStrip(1280, 380, 1, [['开场', '#5b6ee1'], ['精彩片段', '#a26ad9', 1, 1 + 0.15 * Math.sin(prog(t, glue, 0.4) * Math.PI)], ['通关', '#22a06b']], { fw: 230 });
    if (t >= cut && t < glue) note(1100, 560, popIn(t, cut), '✂ 失误剪掉', '#ff8a9a', { fs: 34 });
    if (t >= glue && t < done) note(1280, 560, popIn(t, glue), '碎镜头拼成一段', '#c9a6ff', { fs: 34 });
    if (t >= done) { fancy('成片一条线！', 1280, 620, 80, t, done, FX.yel); sparkle(t, done, 1280, 380, 260, 12); }
    pill(1280, 140, '🎬 剪辑游戏录像', NEWC, popIn(t, sw + 0.1), { fs: 42, font: F_BODY });
    ctx.restore(); }
};
SFX_FNS.push(() => { const b = BK.why; sfx(b.t0 + 0.1, 'pop', 0.4); sfx(P('G01_01', 0.3), 'pop', 0.3); sfx(P('G01_01', 0.42), 'pop', 0.4); sfx(P('G01_01', 0.5), 'whoosh', 0.5); sfx(P('G01_01', 0.5) + 0.6, 'ding', 0.4); sfx(P('G01_01', 0.5) + 0.8, 'sparkle', 0.4);
  sfx(S('G01_02') - 0.2, 'swoosh_in', 0.4); sfx(P('G01_02', 0.25), 'buzz', 0.4); sfx(P('G01_02', 0.5), 'whoosh', 0.4); sfx(P('G01_02', 0.75), 'sparkle', 0.5); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#a3360a', '#f76707', W * 0.6, H * 0.45, 28, 0.2);
  ['✂️', '🎬', '📼', '⏪', '✨'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  sprite('g_scissors', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 60, 1040);
  sprite('d_film', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 760);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-400, -10, 95, '#ff5c8a', '第8集', { fs: 52, rot: -0.15, fg: '#fff' });
    fancy('变基', 40, -70, 130, t, -99, FX.white);
    fancy('rebase！', 110, 80, 150, t, -99, FX.orange);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况（左侧插图，画在 80..960）----
function probMergeQ(t, blk) {
  const t0 = blk.t0; box(110, 200, 820, 500, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
  const N = { a: { x: 200, y: 330, col: MAINC, t0: t0 + 0.1 }, b: { x: 360, y: 330, col: MAINC, t0: t0 + 0.15 }, c: { x: 560, y: 330, col: MAINC, t0: t0 + 0.2 },
    f1: { x: 480, y: 540, col: FEATC, t0: t0 + 0.3 }, f2: { x: 640, y: 540, col: FEATC, t0: t0 + 0.35 }, m: { x: 800, y: 430, col: '#ffffff', t0: P('D02', 0.45), mark: '?' } };
  drawGraph(t, N, [['a', 'b', t0 + 0.15], ['b', 'c', t0 + 0.2], ['b', 'f1', t0 + 0.3], ['f1', 'f2', t0 + 0.35], ['c', 'm', P('D02', 0.45), '#fff'], ['f2', 'm', P('D02', 0.45), '#fff']]);
  txt('main', 140, 270, 28, MAINC, { font: F_CODE }); txt('我的分支', 400, 620, 28, FEATC, {});
  if (t >= P('D02', 0.7)) stamp(t, P('D02', 0.7), 520, 820, 'merge？rebase？', ACC, 56, -0.08);
}
function probPullQ(t, blk) {
  const t0 = blk.t0; const cy = browser(110, 160, 820, 640, 'github.com/dafeiyu/baifan/commits', { title: '提交记录', accent: '#5b6ee1' });
  const rows = ['Merge branch \'main\'', '加甜点菜单', 'Merge branch \'main\'', '改错字', 'Merge branch \'main\''];
  rows.forEach((r, i) => { const a = prog(t, t0 + 0.15 + i * 0.1, 0.2); if (a <= 0) return; const mg = r.startsWith('Merge'); const ry = cy + 20 + i * 86; ctx.save(); ctx.globalAlpha *= a;
    box(140, ry, 760, 72, 12, mg && t >= P('Q01', 0.4) ? '#fff0f2' : '#fff', mg && t >= P('Q01', 0.4) ? '#ff8182' : '#d0d7de', mg && t >= P('Q01', 0.4) ? 4 : 2);
    gDot(178, ry + 36, 1, mg ? KNOTC : FEATC, { r: 13 }); txt(r, 210, ry + 36, 28, '#24292f', { font: isCJK(r) ? F_BODY : F_CODE }); ctx.restore(); });
  if (U.D03 && t >= U.D03.vo + 0.3) stamp(t, U.D03.vo + 0.3, 520, 850, '每次 pull 都多一个！', BADC, 52, -0.08);
}
function probConflictQ(t, blk) {
  const t0 = blk.t0, hint = P('C01', 0.45);
  terminal(t, 110, 190, 820, 560, [
    { s: 'git rebase main', t: t0 + 0.1, cmd: true, dur: 0.5 },
    { s: '{r}CONFLICT (content):', t: t0 + 0.7 }, { s: '{r}  Merge conflict in menu.html', t: t0 + 0.75 },
    { s: '{d}hint: Resolve all conflicts manually,', t: t0 + 0.9, hl: [hint, 1e9], hlc: '#ffd23f' }, { s: '{d}hint: mark them with "git add",', t: t0 + 0.95, hl: [hint, 1e9], hlc: '#ffd23f' },
    { s: '{y}hint: then run "git rebase --continue".', t: t0 + 1.0, hl: [hint, 1e9], hlc: '#ffd23f' }], { title: '终端 — 变基停下了', accent: BADC, fs: 26, prompt: false });
  if (t >= hint) note(520, 800, popIn(t, hint), '👀 下一步写在这里', '#ffd23f', { fs: 38 });
  else if (t >= t0 + 0.8) stamp(t, t0 + 0.8, 560, 820, '冲突了！', BADC, 70, -0.08);
}
function probSquashQ(t, blk) {
  const t0 = blk.t0; const cs = [['甜点菜单', '#ff9fb2'], ['改改', '#ffd36b'], ['再改', '#8fd3ff'], ['真的好了', '#c9a6ff']];
  cs.forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12, 0.4); if (s <= 0) return; const sq = t >= P('B01', 0.45) ? 0.06 * Math.sin(t * 7 + i) : 0;
    ctx.save(); ctx.translate(520, 640 - i * 125); ctx.rotate((i % 2 ? 0.04 : -0.04) + sq); ctx.scale(s, s); box(-240, -52, 480, 104, 18, c[1], '#1b1433', 5); gDot(-190, 0, 1, FEATC, { r: 18 }); txt(c[0], -150, 2, 38, '#1b1433', {}); ctx.restore(); });
  if (t >= P('B01', 0.45)) { const s = popIn(t, P('B01', 0.45)); txt('4 → 1 ?', 640, 170, 64 * s, ACC, { align: 'center', font: F_FANCY, bold: false }); }
  if (U.D05 && t >= U.D05.vo + 0.3) stamp(t, U.D05.vo + 0.3, 520, 830, '碎成渣了…', '#a855f7', 60, -0.08);
}
function probRewordQ(t, blk) {
  const t0 = blk.t0; const cy = browser(110, 170, 820, 560, 'git log --oneline', { title: '终端里的历史', accent: '#a855f7' });
  [['e5f6a7', '加饮料菜单'], ['c3d4e5', '调整配色'], ['b2c3d4', '2024 新菜单上线'], ['a1b2c3', '第一次上线']].forEach((c, i) => { const a = prog(t, t0 + 0.15 + i * 0.1, 0.2); if (a <= 0) return; const bad = i === 2 && t >= P('M01', 0.5); const ry = cy + 24 + i * 96;
    ctx.save(); ctx.globalAlpha *= a; box(140, ry, 760, 80, 12, bad ? '#fff0f2' : '#fff', bad ? '#ff8182' : '#d0d7de', bad ? 4 : 2); txt(c[0], 166, ry + 40, 26, '#9a6700', { font: F_CODE }); txt(c[1], 320, ry + 40, 30, bad ? BADC : '#24292f', {}); ctx.restore(); });
  if (t >= P('M01', 0.5)) { const s = popIn(t, P('M01', 0.5)); txt('← 三个之前', 860, cy + 260, 26 * s, BADC, { align: 'right' }); }
  if (U.D06 && t >= U.D06.vo + 0.3) stamp(t, U.D06.vo + 0.3, 520, 830, 'amend 够不着！', '#a855f7', 58, -0.08);
}
function probForceQ(t, blk) {
  const t0 = blk.t0, fp = P('X01', 0.55);
  terminal(t, 110, 190, 820, 360, [{ s: 'git push', t: t0 + 0.1, cmd: true, dur: 0.3 }, { s: '{r} ! [rejected] dessert -> dessert', t: t0 + 0.5 }, { s: '{r}   (non-fast-forward)', t: t0 + 0.55 },
    { s: 'git push --force', t: fp, cmd: true, dur: 0.4 }], { title: '终端', accent: BADC, fs: 28, prompt: false });
  if (t >= fp) { const s = popIn(t, fp + 0.3, 0.4); ctx.save(); ctx.translate(330, 700); ctx.scale(s, s); ctx.fillStyle = '#ff3b5c'; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.stroke(); txt('FORCE', 0, 2, 40, '#fff', { align: 'center', font: F_CODE }); ctx.restore(); }
  if (U.D07 && t >= U.D07.vo) { [['千问', 'Q'], ['Kimi', 'K']].forEach((q, i) => { const s = popIn(t, U.D07.vo + 0.1 + i * 0.1); if (s > 0) { avatar(q[1], 640 + i * 170, 700, 56, { s }); if (t >= U.D07.vo + 0.5) txt('💦', 680 + i * 170, 640, 44, '#000', { font: EMOJI, bold: false }); } });
    stamp(t, U.D07.vo + 0.4, 600, 860, '队友的提交！', BADC, 56, -0.08); }
}
function probRescueQ(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.15, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 470); ctx.scale(s, s); ctx.rotate(-0.03);
  box(-380, -250, 760, 500, 22, '#fff7e6', '#7a4b1f', 8); box(-12, -250, 24, 500, 0, '#c8a27a'); txt('📔 reflog 日记', -350, -205, 34, '#7a4b1f', {});
  ['HEAD@{0}: rebase (finish)', 'HEAD@{1}: rebase (pick)', 'HEAD@{4}: rebase (start)', 'HEAD@{5}: commit: 真的好了'].forEach((l, i) => { const a = clamp(prog(t, P('K01', 0.3 + i * 0.1), 0.2)); ctx.save(); ctx.globalAlpha *= a; const hot = i === 3 && t >= P('K01', 0.75);
    if (hot) box(-360, -150 + i * 92, 720, 70, 10, 'rgba(255,210,63,0.45)'); txt(l, -340, -115 + i * 92, 28, '#3b2a14', { font: isCJK(l) ? F_BODY : F_CODE, max: 680 }); ctx.restore(); });
  ctx.restore();
  if (U.D08 && t >= U.D08.vo + 0.2) fancy('每一步都记着！', 520, 840, 70, t, U.D08.vo + 0.2, FX.green);
}
function probAsk8(t, blk) {
  const t0 = blk.t0;
  [['🔗 接', MAINC], ['✂️ 剪', ACC], ['🛡️ 守', OKC]].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s > 0) { ctx.save(); ctx.translate(250 + i * 270, 480); ctx.scale(s, s); ctx.rotate((i - 1) * 0.06); box(-110, -140, 220, 280, 24, '#fff', c[1], 8); txt(c[0], 0, 0, 52, '#1b1433', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); } });
  if (t >= t0 + 0.6) txt('三个重点', 520, 760, 64, ACC, { align: 'center', font: F_FANCY, bold: false });
}
function probAskP(t, blk) {
  const t0 = blk.t0; box(110, 200, 820, 520, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
  const N = { a: { x: 200, y: 330, col: MAINC, t0: t0 + 0.1 }, b: { x: 340, y: 330, col: MAINC, t0: t0 + 0.14 }, c: { x: 600, y: 330, col: MAINC, t0: t0 + 0.18 }, d: { x: 800, y: 330, col: MAINC, t0: t0 + 0.22 } };
  const E = [['a', 'b', t0 + 0.14], ['b', 'c', t0 + 0.18], ['c', 'd', t0 + 0.22]];
  ['甜点', '改改', '再改', '好了'].forEach((l, i) => { N['f' + i] = { x: 340 + (i + 1) * 120, y: 560 + (i % 2) * 40, col: FEATC, t0: t0 + 0.3 + i * 0.08, lab: l, fs: 22 }; E.push([i ? 'f' + (i - 1) : 'b', 'f' + i, t0 + 0.3 + i * 0.08]); });
  drawGraph(t, N, E); txt('main', 140, 270, 28, MAINC, { font: F_CODE }); txt('dessert 分支', 380, 680, 26, FEATC, {});
  ['✂️', '✨'].forEach((e, i) => { const p = popIn(t, t0 + 0.5 + i * 0.12); if (p > 0) txt(e, 300 + i * 440, 850, 90 * p, '#000', { align: 'center', font: EMOJI, bold: false }); });
}
const PROB = {
  mergeQ: { chap: ['第①步', '变基是什么', ACC, F_BODY], q: '有啥区别？', bg: ['#ffe6d6', '#ffcaa8'], draw: probMergeQ },
  pullQ: { chap: ['第②步', 'pull 也能变基', '#5b6ee1', F_BODY], q: '我自动生成的…', bg: ['#e3e6ff', '#c9cff9'], draw: probPullQ },
  conflictQ: { chap: ['踩坑①', '变基冲突', BADC, F_BODY], q: '是不是全完了？', bg: ['#ffe0e4', '#ffbcc6'], draw: probConflictQ },
  squashQ: { chap: ['第③步', '合并碎提交', '#ff9f43', F_BODY], q: '我也是！', bg: ['#fff0d6', '#ffdcab'], draw: probSquashQ },
  rewordQ: { chap: ['第④步', '改旧说明', '#a855f7', F_BODY], q: 'amend 不行？', bg: ['#eadfff', '#d6c4ff'], draw: probRewordQ },
  forceQ: { chap: ['踩坑②', '强推冲掉队友', '#e03131', F_BODY], q: '等等！', bg: ['#ffe3e3', '#ffc9c9'], draw: probForceQ },
  rescueQ: { chap: ['救命', '变基搞砸了', '#7a4b1f', F_BODY], q: '真的能回去？', bg: ['#fff3db', '#ffe2a8'], draw: probRescueQ },
  ask8: { chap: ['复习', '接 · 剪 · 守', ACC, F_BODY], q: '帮我划重点！', bg: ['#ffe6d6', '#ffcaa8'], draw: probAsk8 },
  askP: { chap: ['实战', '剪干净甜点分支', '#ff7a3d', F_BODY], q: '现在就剪！', bg: ['#ffe6d6', '#ffcaa8'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  sfx(BK.mergeQ.t0 + 0.3, 'pop', 0.3); sfx(P('D02', 0.45), 'pop', 0.4); sfx(P('D02', 0.7), 'stamp', 0.6);
  for (let i = 0; i < 5; i++) sfx(BK.pullQ.t0 + 0.15 + i * 0.1, 'pop', 0.2); sfx(P('Q01', 0.4), 'buzz', 0.4); sfx(U.D03.vo + 0.3, 'stamp', 0.6);
  typeSfx(BK.conflictQ.t0 + 0.1, 15, 0.5); sfx(BK.conflictQ.t0 + 0.7, 'buzz', 0.5); sfx(BK.conflictQ.t0 + 0.8, 'stamp', 0.6); sfx(P('C01', 0.45), 'ding', 0.5);
  for (let i = 0; i < 4; i++) sfx(BK.squashQ.t0 + 0.15 + i * 0.12, 'pop', 0.3); sfx(P('B01', 0.45), 'boing', 0.4); sfx(U.D05.vo + 0.3, 'stamp', 0.6);
  sfx(P('M01', 0.5), 'buzz', 0.5); sfx(U.D06.vo + 0.3, 'stamp', 0.6);
  typeSfx(BK.forceQ.t0 + 0.1, 8, 0.3); sfx(BK.forceQ.t0 + 0.5, 'buzz', 0.5); typeSfx(P('X01', 0.55), 16, 0.4); sfx(P('X01', 0.55) + 0.3, 'impact', 0.5); sfx(U.D07.vo + 0.4, 'stamp', 0.6);
  sfx(BK.rescueQ.t0 + 0.15, 'pop', 0.4); for (let i = 0; i < 4; i++) sfx(P('K01', 0.3 + i * 0.1), 'pop', 0.2); sfx(P('K01', 0.75), 'ding', 0.4); sfx(U.D08.vo + 0.2, 'sparkle', 0.4);
  [0, 1, 2].forEach(i => sfx(BK.ask8.t0 + 0.15 + i * 0.12, 'pop', 0.3)); sfx(BK.askP.t0 + 0.15, 'pop', 0.4);
});
