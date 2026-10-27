// ================= 第5集：版本号与发布 =================
Object.assign(SQ.Q, { role: '用户反馈' }); Object.assign(SQ.C, { role: '审核' }); Object.assign(SQ.M, { role: '打标签' });
Object.assign(SQ.X, { role: '推送' }); Object.assign(SQ.B, { role: '起版本号' }); Object.assign(SQ.K, { role: '更新说明' });
const GOLD = '#ffc83d', ANNO = '#3ec1ff', RELC = '#a66bff', SEMC = ['#ff5d73', '#ffb020', '#22c08b'];
// 金色版本标签（行李牌形状，孔在左边）
function verTag(x, y, s, label, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.globalAlpha *= (o.alpha ?? 1);
  const fs = o.fs || 40; ctx.font = `bold ${fs}px ${F_CODE}`; const w = ctx.measureText(label).width + 70, h = fs * 1.7;
  const col = o.col || GOLD;
  if (o.glow) { ctx.fillStyle = hexA(col, 0.35 * o.glow); ctx.beginPath(); ctx.ellipse(w / 2 - 20, 0, w * 0.75, h * 1.1, 0, 0, 7); ctx.fill(); }
  const path = () => { ctx.beginPath(); ctx.moveTo(-h * 0.45, 0); ctx.lineTo(0, -h / 2); ctx.lineTo(w, -h / 2); ctx.quadraticCurveTo(w + 14, -h / 2, w + 14, -h / 2 + 14); ctx.lineTo(w + 14, h / 2 - 14); ctx.quadraticCurveTo(w + 14, h / 2, w, h / 2); ctx.lineTo(0, h / 2); ctx.closePath(); };
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.save(); ctx.translate(6, 8); path(); ctx.fill(); ctx.restore();
  path(); ctx.fillStyle = o.gray ? '#8f8aa8' : col; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = o.stroke || '#1b1433'; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-h * 0.1, 0, h * 0.13, 0, 7); ctx.fill(); ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; rr(12, -h / 2 + 8, w - 24, 8, 4); ctx.fill();
  txt(label, w / 2 + 6, 3, fs, '#1b1433', { align: 'center', font: F_CODE });
  if (o.anno) { box(w - 44, -h / 2 - 22, 76, 34, 12, ANNO, '#1b1433', 4); txt('附注', w - 6, -h / 2 - 5, 20, '#fff', { align: 'center' }); }
  if (o.x) bigX(w / 2, 0, h * 0.42, '#ff3b5c', o.x);
  ctx.restore();
}
// 挂在提交节点上方的标签（带一根绳子）
function tagOn(x, y, s, label, o = {}) {
  if (s <= 0) return; const ty = y - (o.up || 96);
  ctx.save(); ctx.globalAlpha *= (o.alpha ?? 1); ctx.strokeStyle = o.gray ? '#8f8aa8' : '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y - 24); ctx.lineTo(x, ty); ctx.stroke(); ctx.restore();
  verTag(x + 12, ty - 4, s * (o.sc || 0.62), label, Object.assign({ rot: -0.5 }, o));
}
// 分支名牌（会跟着提交往前走）
function branchLabel(x, y, s, name, col = '#22c08b') {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `bold 30px ${F_CODE}`; const w = ctx.measureText(name).width + 36;
  ctx.fillStyle = col; rr(-w / 2, -26, w, 52, 14); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, 26); ctx.lineTo(10, 26); ctx.lineTo(0, 42); ctx.fill();
  txt(name, 0, 1, 30, '#fff', { align: 'center', font: F_CODE }); ctx.restore();
}
// 一排提交：xs 坐标，hashes 可选；pop(i) 控制出现
function chain(t, xs, y, o = {}) {
  const n = xs.length; ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  for (let i = 1; i < n; i++) { const a = o.pop ? o.pop(i) : 1; if (a <= 0) continue; ctx.beginPath(); ctx.moveTo(xs[i - 1], y); ctx.lineTo(lerp(xs[i - 1], xs[i], clamp(a)), y); ctx.stroke(); }
  ctx.restore();
  xs.forEach((x, i) => {
    const a = o.pop ? o.pop(i) : 1; if (a <= 0) return;
    commitNode(x, y, (o.s || 0.5) * eBack(clamp(a)), null, { col: (o.cols && o.cols[i]) || CH_COL[(i + 2) % 8], glow: o.hi === i ? 1 : 0, t });
    if (o.hashes && o.hashes[i]) txt(o.hashes[i], x, y + 52, o.hfs || 22, '#ffd36b', { align: 'center', font: F_CODE });
  });
}
const HASH = ['1a2b3c4', '3c4d5e6', '5e6f7a8', '9b8c7d6', '7d3e9a1', 'c0ffee1', 'e41a9c2'];
// 礼物盒 = Release
function relBox(x, y, s, t, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 3) * 0.04);
  if (o.glow) { ctx.fillStyle = `rgba(200,170,255,${0.35 * o.glow})`; ctx.beginPath(); ctx.arc(0, 0, 200, 0, 7); ctx.fill(); }
  box(-130, -60, 260, 190, 18, RELC, '#1b1433', 7); box(-150, -110, 300, 70, 14, '#c49bff', '#1b1433', 7);
  box(-22, -110, 44, 240, 4, GOLD, '#1b1433', 5);
  ctx.fillStyle = GOLD; ctx.strokeStyle = '#1b1433'; ctx.lineWidth = 6;
  [-1, 1].forEach(d => { ctx.beginPath(); ctx.ellipse(d * 46, -128, 46, 26, d * 0.5, 0, 7); ctx.fill(); ctx.stroke(); });
  txt(o.label || 'Release', 0, 60, 40, '#fff', { align: 'center', font: F_FANCY, bold: false });
  ctx.restore();
}

// ---- 冷开场：几十次提交，哪一版能用？ ----
const COLD_LOG = [['e41a9c2', '真·最终版'], ['c0ffee1', '最终版2'], ['7d3e9a1', '首页完成'], ['9b8c7d6', '最终版'], ['5e6f7a8', '再改一点'], ['3c4d5e6', '这次真的好了'], ['1a2b3c4', '改了一点'], ['0f1e2d3', '能用了？'], ['8a7b6c5', '修复'], ['4d5c6b7', '试试']];
const T_COLD = retime([{ t: 0, s: 'git log --oneline', cmd: true, dur: 0.4 }, ...COLD_LOG.map(c => ({ t: 0, s: `{y}${c[0]}{w} ${c[1]}` }))],
  [['D01', 0.02], ...COLD_LOG.map((c, i) => ['D01', 0.1 + i * 0.035])]);
SC.cold = (t, blk) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, P('D01', 0.55), 8, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#3a2a8c', '#5a43c9', W * 0.62, H * 0.5, 22, 0.35);
  const wa = eBack(prog(t, t0 + 0.05, 0.4));
  ctx.save(); ctx.translate(1390, 450); ctx.scale(wa, wa); ctx.translate(-1390, -450);
  terminal(t, 960, 100, 880, 700, T_COLD, { fs: 34, title: '终端 — 大肥鱼的电脑', accent: GOLD });
  ctx.restore();
  [[1700, 250, 0.5], [1500, 420, 0.56], [1760, 560, 0.62], [1250, 650, 0.68]].forEach((q, i) => { const s = popIn(t, P('D01', q[2])); if (s > 0) txt('?', q[0], q[1], 120 * s, ['#ffd23f', '#ff5c8a', '#3ec1ff', '#7cf07a'][i], { align: 'center', font: F_FANCY, bold: false }); });
  const p = spring(prog(t, t0, 0.9));
  sprite('d_curious', 500, H + 40, 980, { scale: lerp(1.3, 1, p) });
  fancy('能用的是哪一版？', 470, 160, 84, t, U.D01.vo + 0.05, { rot: -0.08, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
  if (t >= P('D01', 0.78)) fancy('几十次提交……', 1390, 880, 78, t, P('D01', 0.78), Object.assign({ rot: -0.04, wobble: 4 }, FX.white));
};
SFX_FNS.push(() => { sfx(BK.cold.t0 + 0.05, 'swoosh_in', 0.5); [0.5, 0.56, 0.62, 0.68].forEach(f => sfx(P('D01', f), 'boing', 0.3)); sfx(P('D01', 0.55), 'impact', 0.6); });

// ---- 打标签 + 发布 ----
SC.why = (t, blk, en) => {
  bgLecture(t, GOLD); lecturer(t, blk, en, blk.t0);
  const xs = [760, 900, 1040, 1180, 1320, 1460, 1600, 1740];
  const up = eIO(prog(t, S('G01_02') - 0.2, 0.4)); const cy = lerp(400, 230, up);
  chain(t, xs, cy, { pop: i => prog(t, blk.t0 + 0.05 + i * 0.05, 0.3), hi: t >= P('G01_01', 0.3) ? 4 : -1 });
  const ts = popIn(t, P('G01_01', 0.3), 0.4);
  if (ts > 0) { tagOn(xs[4], cy, ts, 'v1.0', { glow: 0.6 + 0.4 * Math.sin(t * 5) }); }
  if (t >= P('G01_01', 0.3) && t < P('G01_01', 0.3) + 0.3) flash(t, P('G01_01', 0.3), 0.2);
  const ra = 1 - up; if (ra > 0) { relBox(1300, 690, 0.8 * popIn(t, P('G01_01', 0.68), 0.45) * ra, t, { glow: 1 }); if (t >= P('G01_01', 0.68)) sparkle(t, P('G01_01', 0.7), 1300, 690, 180, 10); }
  if (t < S('G01_02') - 0.2) fancy('打标签 → 正式发布！', 1270, 920, 66, t, P('G01_01', 0.75), FX.yel);
  if (up > 0) {   // 存档列表：给存档起名
    ctx.save(); ctx.globalAlpha = up; win(760, 400, 1020, 470, '读取存档', GOLD);
    const rows = [['存档 #36', '02:14'], ['存档 #37', '02:31'], ['存档 #38', '02:40'], ['存档 #39', '02:52']];
    const rn = P('G01_02', 0.3);
    rows.forEach((r, i) => {
      const y = 500 + i * 88, hot = i === 2; const s = popIn(t, S('G01_02') - 0.1 + i * 0.06); if (s <= 0) return;
      box(800, y - 34, 940, 72, 14, hot && t >= rn ? '#3a2d10' : '#1d1838', hot && t >= rn ? GOLD : '#3a3358', hot && t >= rn ? 5 : 3);
      const name = hot ? flipText(t, [[-1, r[0]], [rn, '打 Boss 之前']]) : { s: r[0], sc: 1 };
      ctx.save(); ctx.translate(840, y); ctx.scale(1, name.sc); txt(name.s, 0, 0, 34, hot && t >= rn ? GOLD : '#c9c3dd', {}); ctx.restore();
      txt(r[1], 1700, y, 28, '#8f8aa8', { align: 'right', font: F_CODE });
      if (hot && t >= rn + 0.2) verTag(1380, y, 0.55 * popIn(t, rn + 0.2), '⭐ 这里', { fs: 34 });
    });
    ctx.restore();
    if (t >= P('G01_02', 0.7)) fancy('一眼就能找到！', 1270, 940, 62, t, P('G01_02', 0.7), FX.yel);
  }
};
SFX_FNS.push(() => { const b = BK.why; for (let i = 0; i < 8; i++) sfx(b.t0 + 0.05 + i * 0.05, 'pop', 0.2); sfx(P('G01_01', 0.3), 'impact', 0.7); sfx(P('G01_01', 0.68), 'sparkle', 0.5); sfx(P('G01_01', 0.75), 'ding', 0.4); sfx(S('G01_02') - 0.2, 'swoosh_in', 0.4); sfx(P('G01_02', 0.3), 'click', 0.5); sfx(P('G01_02', 0.35), 'ding', 0.5); sfx(P('G01_02', 0.7), 'sparkle', 0.4); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#c98a00', '#ffc83d', W * 0.6, H * 0.45, 28, 0.2);
  ['v0.9', 'v1.0.0', 'v1.0.1', 'v1.1.0', 'v2.0.0'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; verTag(1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 0.6 * popIn(t, t0 + 0.2 + i * 0.06), k, { rot: Math.sin(a) * 0.3, col: i % 2 ? GOLD : '#fff1b8' }); });
  sprite('g_tag', lerp(-400, 320, eBack(prog(t, t0, 0.5))), H + 250, 1180);
  sprite('d_party', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 760);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-380, 0, 95, '#ff5c8a', '第5集', { fs: 52, rot: -0.15, fg: '#fff' });
    fancy('版本号', 60, -60, 130, t, -99, FX.yel);
    fancy('与发布！', 110, 85, 140, t, -99, FX.white);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况（左侧插图，画在 80..960）----
function probTagQ(t, blk) {
  const t0 = blk.t0; win(110, 200, 820, 560, 'git log', GOLD);
  HASH.slice(0, 6).forEach((h, i) => { const s = popIn(t, t0 + 0.2 + i * 0.07); if (s <= 0) return; const fl = Math.sin(t * 9 + i * 2) > 0.6 ? 0.45 : 1;
    ctx.save(); ctx.globalAlpha *= fl; txt(h, 170, 300 + i * 74, 40, '#ffd36b', { font: F_CODE }); ctx.restore(); txt(['改了一点', '这次真的好了', '再改一点', '最终版', '首页完成', '最终版2'][i], 400, 300 + i * 74, 32, '#c9c3dd', {}); });
  if (t >= t0 + 0.9) stamp(t, t0 + 0.9, 680, 680, '记不住！', '#ff3b5c', 64, -0.12);
}
function probFixQ(t, blk) {
  const t0 = blk.t0; win(110, 200, 820, 300, 'Gemini 的终端', '#a66bff');
  cmdBar(t, 520, 330, 'git tag v2024', t0 + 0.3, 0.5, { fs: 34, col: '#a66bff' });
  const xs = [220, 370, 520, 670, 820]; chain(t, xs, 640, { s: 0.42, pop: i => prog(t, t0 + 0.2 + i * 0.05, 0.3) });
  const ts = popIn(t, t0 + 0.95); if (ts > 0) tagOn(xs[1], 640, ts, 'v2024', { sc: 0.55 });
  branchLabel(xs[4], 560, popIn(t, t0 + 0.5), 'main');
  const cs = popIn(t, t0 + 0.6); if (cs > 0) calendar(820, 850, 0.6 * cs, ['2024', '2024'], 0);
  const dq = U.D03; if (t >= dq.vo + 0.2) { const p = eOut(prog(t, dq.vo + 0.2, 0.35)); ctx.save(); ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(xs[1], 640, 70, 56, 0, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke(); ctx.restore(); stamp(t, dq.vo + 0.5, 420, 820, '打错提交', '#ff3b5c', 52, 0.1); }
}
function probPushQ(t, blk) {
  const t0 = blk.t0; const ls = popIn(t, t0 + 0.15, 0.4);
  if (ls > 0) laptop(300, 560, 0.95 * ls, { screen: () => { verTag(-70, 0, 0.6, 'v1.0'); } });
  txt('本地 ✓ 有标签', 300, 620, 34, '#1a7f37', { align: 'center' });
  const bs = popIn(t, t0 + 0.4, 0.4);
  if (bs > 0) { ctx.save(); ctx.translate(700, 460); ctx.scale(bs, bs); box(-200, -190, 400, 380, 22, '#fff', '#1b1433', 6); box(-200, -190, 400, 64, [22, 22, 0, 0], '#24292f');
    txt('GitHub', 0, -158, 30, '#fff', { align: 'center' }); txt('🏷 Tags', 0, -60, 44, '#24292f', { align: 'center' }); txt('0', 0, 50, 120, '#ff3b5c', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); }
  arrow(470, 460, 560, 460, '#8f8aa8', popIn(t, t0 + 0.6), 10, { dash: [16, 14], t });
  if (t >= P('X01', 0.75)) stamp(t, P('X01', 0.75), 520, 820, '一个都没有？！', '#ff3b5c', 60, -0.08);
}
function probOldQ(t, blk) {
  const t0 = blk.t0; browser(110, 180, 820, 620, 'dafeiyu.github.io', { title: '白饭页 v1.0' });
  txt('百饭页', 520, 470, 90, '#24292f', { align: 'center', font: F_FANCY, bold: false });
  for (let i = 0; i < 4; i++) box(220, 560 + i * 44, 400 + rnd(i + 3) * 160, 20, 10, '#d0d7de');
  verTag(700, 300, 0.55 * popIn(t, t0 + 0.3), 'v1.0');
  const q = U.Q01; if (t >= P('Q01', 0.4)) { const p = eOut(prog(t, P('Q01', 0.4), 0.35)); ctx.save(); ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(445, 470, 70, 60, 0, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke(); ctx.restore(); note(445, 380, popIn(t, P('Q01', 0.5)), '百 → 白', '#ff3b5c', { fs: 34 }); }
}
function probSemQ(t, blk) {
  const t0 = blk.t0, b = U.B01;
  const s = popIn(t, P('B01', 0.25), 0.4); if (s > 0) { ctx.save(); ctx.translate(520, 420); ctx.scale(s, s); ctx.rotate(-0.06); fancy('v2.0.0', 0, 0, 170, t, -99, FX.red); ctx.restore(); confetti(t, P('B01', 0.3), 60, 3, 520, 380); }
  if (t >= P('B01', 0.25)) txt('大版本！', 520, 560, 54, '#ff3b5c', { align: 'center', font: F_FANCY, bold: false });
  const ds = popIn(t, U.D04.vo + 0.1, 0.4); if (ds > 0) { ctx.save(); ctx.translate(520, 760); ctx.scale(ds, ds); box(-300, -90, 600, 180, 20, '#fff', '#1b1433', 6);
    box(-280, -70, 560, 60, 10, '#ffebe9'); txt('-  百饭页', -260, -40, 36, '#cf222e', { font: F_CODE }); box(-280, 10, 560, 60, 10, '#dafbe1'); txt('+  白饭页', -260, 40, 36, '#1a7f37', { font: F_CODE }); ctx.restore();
    stamp(t, U.D04.vo + 0.5, 820, 660, '只改 1 个字', '#ff7a3d', 44, 0.12); }
}
function probRelQ(t, blk) {
  const t0 = blk.t0; cloud(520, 420, 0.95 * popIn(t, t0 + 0.15, 0.4), { t, label: 'GitHub' });
  ['v1.0', 'v1.0.1'].forEach((v, i) => verTag(380 + i * 220, 470, 0.5 * popIn(t, t0 + 0.4 + i * 0.1), v));
  ['🙋', '🙋‍♀️', '🧑‍💻'].forEach((e, i) => { const s = popIn(t, t0 + 0.6 + i * 0.1); if (s > 0) txt(e, 280 + i * 240, 780, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  if (t >= t0 + 1.0) txt('⬇ 去哪下载？', 520, 900, 44, '#5a43c9', { align: 'center' });
}
function probAsk8(t, blk) {
  const t0 = blk.t0;
  verTag(300, 360, 0.9 * popIn(t, t0 + 0.15), 'git tag');
  const s2 = popIn(t, t0 + 0.3); if (s2 > 0) { ctx.save(); ctx.translate(560, 560); ctx.scale(s2, s2); fancy('x.y.z', 0, 0, 110, t, -99, FX.blue); ctx.restore(); }
  relBox(420, 790, 0.6 * popIn(t, t0 + 0.45), t);
}
function probAskP(t, blk) {
  const s = popIn(t, blk.t0 + 0.15, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 540); ctx.scale(s, s);
  box(-240, -300, 480, 600, 30, '#fff', '#2f6fe0', 8); box(-240, -300, 480, 90, [30, 30, 0, 0], '#2f6fe0');
  txt('白饭页', 0, -255, 44, '#fff', { align: 'center', font: F_FANCY, bold: false });
  for (let i = 0; i < 5; i++) box(-190, -170 + i * 60, 300 + rnd(i + 4) * 80, 22, 11, '#c9c3dd');
  txt('🍚', 0, 190, 120, '#000', { align: 'center', font: EMOJI, bold: false });
  ctx.restore();
  ['v1.0.0', 'v1.0.1', 'v1.1.0', 'v1.1.1'].forEach((k, i) => { const a = -Math.PI * 0.85 + i * Math.PI * 0.55; verTag(480 + Math.cos(a) * 400, 540 + Math.sin(a) * 340 + 40, 0.5 * popIn(t, blk.t0 + 0.4 + i * 0.08), k, { rot: a * 0.2 }); });
}
const PROB = {
  tagQ: { chap: ['第①步', 'git tag', '#c98a00'], q: '名字怎么起？', bg: ['#fff4cc', '#ffe48a'], draw: probTagQ },
  fixQ: { chap: ['打错了', 'git tag -d', '#a66bff'], q: '又是 2024？', bg: ['#eadfff', '#d6c4ff'], draw: probFixQ },
  pushQ: { chap: ['第②步', 'push 标签', '#22a06b'], q: '', bg: ['#dcf7ea', '#b8eed3'], draw: probPushQ },
  oldQ: { chap: ['回到旧版', 'switch v1.0', '#3e8ed0'], q: '', bg: ['#d7f3ff', '#b5e6ff'], draw: probOldQ },
  semQ: { chap: ['第③步', '语义化版本', '#e0485e', F_BODY], q: '一个字就 2.0？', bg: ['#ffe0e4', '#ffbcc6'], draw: probSemQ },
  relQ: { chap: ['第④步', 'GitHub Releases', RELC], q: '怎么让大家下载？', bg: ['#eadfff', '#d6c4ff'], draw: probRelQ },
  ask8: { chap: ['复习', '发布三件套', '#c98a00', F_BODY], q: '帮我整理一下！', bg: ['#fff4cc', '#ffe48a'], draw: probAsk8 },
  askP: { chap: ['实战', '白饭页正式发布', '#ff7a3d', F_BODY], q: '从头发布一次！', bg: ['#ffe6d6', '#ffcaa8'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  for (let i = 0; i < 6; i++) sfx(BK.tagQ.t0 + 0.2 + i * 0.07, 'pop', 0.25); sfx(BK.tagQ.t0 + 0.9, 'stamp', 0.6);
  cmdAt(BK.fixQ.t0 + 0.3, 'git tag v2024', 0.5); sfx(BK.fixQ.t0 + 0.95, 'pop', 0.5); sfx(U.D03.vo + 0.5, 'stamp', 0.6);
  sfx(BK.pushQ.t0 + 0.4, 'pop', 0.4); sfx(P('X01', 0.75), 'stamp', 0.7);
  sfx(P('Q01', 0.4), 'buzz', 0.5);
  sfx(P('B01', 0.25), 'impact', 0.8); sfx(P('B01', 0.3), 'confetti', 0.5); sfx(U.D04.vo + 0.5, 'stamp', 0.6);
  sfx(BK.relQ.t0 + 0.15, 'pop', 0.4);
});
// ---- 讲解①：git tag ----
const TXS = [760, 900, 1040, 1180, 1320, 1460];   // 提交链横坐标
const T_TAG = retime([
  { t: 0, s: 'git tag v1.0', cmd: true },
  { t: 0, s: 'git tag', cmd: true, dur: 0.3 },
  { t: 0, s: '{y}v1.0' },
  { t: 0, s: 'git show v1.0', cmd: true, dur: 0.45 },
  { t: 0, s: '{y}commit 7d3e9a1{w}  首页完成' },
  { t: 0, clear: true },
  { t: 0, s: '{d}# 换成附注标签（同名的先 -d 删掉）' },
  { t: 0, s: 'git tag -a v1.0 -m "第一个正式版"', cmd: true },
  { t: 0, s: 'git show v1.0', cmd: true, dur: 0.45 },
  { t: 0, s: '{y}tag v1.0' },
  { t: 0, s: '{w}Tagger: 大肥鱼' },
  { t: 0, s: '{w}Date:   2026-10-27' },
  { t: 0, s: '{c}    第一个正式版' },
  { t: 0, s: 'git tag -a v0.9 3c4d5e6 -m "测试版"', cmd: true },
], [['G02_01', 0.12], ['G02_02', 0.2], ['G02_02', 0.32], ['G02_02', 0.66], ['G02_02', 0.84], ['G02_04', 0.02], ['G02_04', 0.06], ['G02_04', 0.3],
  ['G02_05', 0.04], ['G02_05', 0.2], ['G02_05', 0.32], ['G02_05', 0.46], ['G02_05', 0.62], ['G02_06', 0.35]]);
// 标签信息卡：轻量（只有名字） / 附注（谁·何时·为什么）
function tagInfo(t, x, y, s, anno, rows) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const h = anno ? 380 : 220; box(-240, -h / 2, 480, h, 24, '#fffaf0', anno ? ANNO : GOLD, 6);
  box(-240, -h / 2, 480, 64, [24, 24, 0, 0], anno ? ANNO : GOLD);
  txt(anno ? '附注标签' : '轻量标签', 0, -h / 2 + 33, 34, anno ? '#fff' : '#1b1433', { align: 'center', font: F_FANCY, bold: false });
  txt('🏷  v1.0', -200, -h / 2 + 110, 36, '#1b1433', { font: F_CODE });
  if (!anno) txt('只有一个名字', -200, -h / 2 + 170, 30, '#8f8aa8', {});
  else rows.forEach((r, i) => { const a = clamp(r[2]); if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; txt(r[0], -200, -h / 2 + 175 + i * 64, 34, '#000', { font: EMOJI, bold: false }); txt(r[1], -140, -h / 2 + 175 + i * 64, 32, '#1b1433', {}); ctx.restore(); });
  ctx.restore();
}
SC.tag = (t, blk, en) => {
  bgLecture(t, GOLD); lecturer(t, blk, en, blk.t0);
  const cy = 250, nT = P('G02_03', 0.18);
  chain(t, [...TXS.slice(0, 5), ...(t >= nT ? [TXS[5]] : [])], cy, { hashes: HASH, pop: i => i < 5 ? prog(t, blk.t0 + 0.05 + i * 0.05, 0.3) : prog(t, nT, 0.3), hi: t >= P('G02_01', 0.4) && t < S('G02_02') ? 4 : -1 });
  // main 分支名牌：新提交出现后往前走
  const mx = lerp(TXS[4], TXS[5], eIO(prog(t, nT + 0.25, 0.45)));
  branchLabel(mx, cy - 210, popIn(t, blk.t0 + 0.3), 'main');
  const tagT = P('G02_01', 0.42);
  if (t >= tagT) { const drop = eBack(prog(t, tagT, 0.35)); tagOn(TXS[4], cy, 1, 'v1.0', { up: lerp(300, 96, drop), anno: t >= P('G02_04', 0.55), glow: t < tagT + 0.6 ? 1 : 0 }); }
  if (t >= tagT && t < tagT + 0.3) flash(t, tagT, 0.15);
  const v9 = P('G02_06', 0.6); if (t >= v9) tagOn(TXS[1], cy, eBack(prog(t, v9, 0.35)), 'v0.9', { anno: true, glow: t < v9 + 0.6 ? 1 : 0 });
  if (t >= nT + 0.3 && t < S('C01')) { const a = popIn(t, nT + 0.5);
    arrow(TXS[4] + 30, cy - 270, TXS[5] - 20, cy - 270, '#22c08b', eOut(prog(t, nT + 0.25, 0.45)), 8);
    note(1610, 380, a, '分支往前走', '#22c08b', { fs: 28 }); note(1010, 380, popIn(t, P('G02_03', 0.62)), '标签不动 📌', GOLD, { fs: 28 }); }
  terminal(t, 690, 460, 660, 420, T_TAG, { fs: 25, title: '终端', accent: GOLD });
  const anno = t >= S('G02_04') - 0.1;
  const rows = [['👤', '谁：大肥鱼', prog(t, P('G02_05', 0.32), 0.25) * 1], ['🕒', '何时：2026-10-27', prog(t, P('G02_05', 0.46), 0.25)], ['💬', '为什么：第一个正式版', prog(t, P('G02_05', 0.62), 0.25)]];
  const ia = anno ? popIn(t, S('G02_04') - 0.1, 0.4) : popIn(t, P('G02_02', 0.3), 0.4);
  tagInfo(t, 1620, 670, ia * 0.95, anno, anno ? rows.map((r, i) => [r[0], r[1], t >= S('G02_05') ? r[2] : (t >= P('G02_04', 0.6) ? 1 : 0)]) : []);
  if (t >= P('G02_06', 0.62) && t < S('C02')) fancy('旧存档也能补标签！', 1270, 930, 60, t, P('G02_06', 0.62), FX.yel);
  guest(t, blk);
  if (t >= P('C02', 0.5)) stamp(t, P('C02', 0.5), 1180, 520, '批准 ✓', '#22c08b', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['C01', 'C02']); const b = BK.tag; for (let i = 0; i < 5; i++) sfx(b.t0 + 0.05 + i * 0.05, 'pop', 0.2); sfx(P('G02_01', 0.42), 'whoosh', 0.4); sfx(P('G02_01', 0.42) + 0.3, 'impact', 0.6); sfx(P('G02_02', 0.3), 'pop', 0.4); sfx(P('G02_03', 0.18), 'pop', 0.5); sfx(P('G02_03', 0.18) + 0.25, 'whoosh', 0.4); sfx(P('G02_03', 0.62), 'ding', 0.5); sfx(S('G02_04') - 0.1, 'swoosh_in', 0.4); sfx(P('G02_04', 0.55), 'sparkle', 0.4); [0.32, 0.46, 0.62].forEach(f => sfx(P('G02_05', f), 'pop', 0.35)); sfx(P('G02_06', 0.6), 'whoosh', 0.4); sfx(P('G02_06', 0.6) + 0.3, 'ding', 0.5); sfx(P('C02', 0.5), 'stamp', 0.7); });

// ---- 打错了：删掉再打 ----
const T_FIX = retime([
  { t: 0, s: 'git tag -d v2024', cmd: true },
  { t: 0, s: "{g}Deleted tag 'v2024' (was 3c4d5e6)" },
  { t: 0, s: 'git push origin --delete v2024', cmd: true },
  { t: 0, s: '{g} - [deleted]         v2024' },
  { t: 0, s: 'git tag -a v1.0 -m "第一个正式版"', cmd: true },
], [['G03_01', 0.1], ['G03_01', 0.26], ['G03_01', 0.36], ['G03_01', 0.6], ['G03_01', 0.76]]);
SC.fix = (t, blk, en) => {
  bgLecture(t, '#a66bff'); lecturer(t, blk, en, blk.t0);
  const cy = 280, xs = [760, 900, 1040, 1180, 1320];
  chain(t, xs, cy, { hashes: HASH, pop: i => prog(t, blk.t0 + 0.05 + i * 0.04, 0.3) });
  branchLabel(xs[4], cy - 210, 1, 'main');
  const dT = P('G03_01', 0.22), nT = P('G03_01', 0.82);
  if (t < dT + 0.8) { const fall = prog(t, dT + 0.2, 0.6); ctx.save(); ctx.translate(0, fall * fall * 700); ctx.globalAlpha *= 1 - fall;
    tagOn(xs[1], cy, 1, 'v2024', { x: prog(t, dT, 0.3), rot: -0.5 + fall * 1.2 }); ctx.restore(); }
  // 远程：云上也删
  const cs = popIn(t, P('G03_01', 0.34), 0.4); if (cs > 0) { cloud(1680, 610, 0.62 * cs, { t, label: '远程' }); const rd = prog(t, P('G03_01', 0.6), 0.4);
    if (rd < 1) verTag(1640, 660, 0.5 * (1 - rd), 'v2024', { x: clamp(rd * 3), rot: rd * 2 }); }
  if (t >= nT) { const drop = eBack(prog(t, nT, 0.35)); tagOn(xs[4], cy, 1, 'v1.0', { up: lerp(300, 96, drop), anno: true, glow: t < nT + 0.6 ? 1 : 0 }); }
  const tA = clamp(1 - prog(t, S('G03_02') - 0.2, 0.3));
  if (tA > 0) terminal(t, 690, 470, 820, 400, T_FIX, { fs: 26, title: '终端', accent: '#a66bff', alpha: tA });
  const g2 = S('G03_02') - 0.2;
  if (t >= g2) {
    const a = eOut(prog(t, g2, 0.3)); ctx.save(); ctx.globalAlpha = a;
    box(700, 470, 1160, 420, 26, 'rgba(20,14,40,0.9)', '#ff3b5c', 5);
    txt('已经发给别人用的标签', 1280, 530, 40, '#fff', { align: 'center' });
    verTag(840, 680, 0.8, 'v1.0'); const mv = Math.sin(clamp(prog(t, g2 + 0.3, 1.2)) * Math.PI);
    ctx.save(); ctx.globalAlpha *= 0.5 * mv; verTag(840 + 300 * mv, 680, 0.8, 'v1.0'); ctx.restore();
    arrow(1020, 680, 1200, 680, '#ff3b5c', popIn(t, g2 + 0.3), 10, { dash: [14, 12], t });
    prohibit(1110, 680, 90, popIn(t, P('G03_02', 0.35)));
    txt('别偷偷挪！', 1110, 810, 40, '#ff6b81', { align: 'center', font: F_FANCY, bold: false });
    const ns = popIn(t, P('G03_02', 0.62), 0.4); if (ns > 0) { arrow(1300, 680, 1420, 680, '#22c08b', ns, 10); verTag(1460, 680, 0.8 * ns, 'v1.0.1', { col: '#7cf07a' }); txt('发新版本 ✓', 1600, 810, 40, '#7cf07a', { align: 'center', font: F_FANCY, bold: false }); }
    ctx.restore();
  }
  guest(t, blk);
  if (t >= P('M02', 0.4)) stamp(t, P('M02', 0.4), 1180, 520, 'v1.0 ✓', '#22c08b', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['M02']); const dT = P('G03_01', 0.22); sfx(dT, 'buzz', 0.5); sfx(dT + 0.25, 'whoosh', 0.4); sfx(P('G03_01', 0.34), 'pop', 0.4); sfx(P('G03_01', 0.6), 'glitch', 0.4); sfx(P('G03_01', 0.82), 'whoosh', 0.4); sfx(P('G03_01', 0.82) + 0.3, 'ding', 0.5); sfx(S('G03_02') - 0.2, 'swoosh_in', 0.4); sfx(P('G03_02', 0.35), 'buzz', 0.5); sfx(P('G03_02', 0.62), 'sparkle', 0.5); sfx(P('M02', 0.4), 'stamp', 0.7); });

// ---- 讲解②：推送标签 ----
const T_PUSH = retime([
  { t: 0, s: 'git push', cmd: true, dur: 0.3 },
  { t: 0, s: '{d}main -> main   （标签没带上）' },
  { t: 0, s: 'git push origin v1.0', cmd: true },
  { t: 0, s: '{g} * [new tag]   v1.0 -> v1.0' },
  { t: 0, s: 'git push --tags', cmd: true, dur: 0.5 },
  { t: 0, s: 'git push --follow-tags', cmd: true },
], [['G04_01', 0.15], ['G04_01', 0.5], ['G04_02', 0.2], ['G04_02', 0.42], ['G04_02', 0.62], ['G04_03', 0.2]]);
SC.push = (t, blk, en) => {
  bgLecture(t, '#22a06b'); lecturer(t, blk, en, blk.t0);
  const LX = 900, LY = 420, CX = 1650, CY = 300;
  laptop(LX, LY, 0.9 * popIn(t, blk.t0 + 0.05, 0.4), { screen: () => { txt('本地仓库', 0, -70, 30, '#ece9f7', { align: 'center' }); } });
  cloud(CX, CY, 0.7 * popIn(t, blk.t0 + 0.15, 0.4), { t, label: 'GitHub' });
  // 本地标签（左下角一排）
  const local = [['v0.9', 0], ['v1.0', 1], ['v1.0.1', 2]];
  const sent = (i) => i === 1 ? P('G04_02', 0.3) : P('G04_02', 0.66);
  local.forEach(([v, i]) => { const st = sent(i); if (t < st) verTag(LX - 150 + i * 120, LY + 70, 0.45, v, { rot: -0.2 });
    else { const [x, y, p] = arcPos(t, st, 0.6, LX - 150 + i * 120, LY + 70, CX - 160 + i * 120, CY + 40, 160); verTag(x, y, 0.45, v, { rot: -0.2 + p * 0.2, glow: p < 1 ? 0.6 : 0 }); } });
  // 普通 push：只有提交飞过去
  const p1 = P('G04_01', 0.2); for (let k = 0; k < 3; k++) flyNode(t, p1 + k * 0.12, 0.6, LX, LY - 140, CX - 60 + k * 50, CY - 10, CH_COL[k + 2], 0.32, 140);
  if (t >= p1 + 0.8) chainRow(CX - 10, CY + 110, 3, { s: 0.3, gap: 60, pop: k => popIn(t, p1 + 0.6 + k * 0.12) });
  if (t >= P('G04_01', 0.5) && t < S('G04_02')) { note(LX, LY + 170, popIn(t, P('G04_01', 0.5)), '✗ 标签没带上', '#ff3b5c', { fs: 32 }); }
  if (t >= P('G04_03', 0.3)) { const s = popIn(t, P('G04_03', 0.3)); pill(1270, 160, 'git push --follow-tags', '#7cf07a', s, { fs: 40 });
    const ft = P('G04_03', 0.45); flyNode(t, ft, 0.7, LX, LY - 140, CX, CY - 10, '#ff7a3d', 0.32, 140); if (t >= ft && t < ft + 0.7) { const [x, y] = arcPos(t, ft + 0.05, 0.7, LX + 40, LY - 100, CX + 40, CY + 30, 140); verTag(x, y, 0.4, 'v1.1', { anno: true }); }
    note(1270, 560, popIn(t, P('G04_03', 0.6)), '提交 + 附注标签，一起上去', ANNO, { fs: 30 }); }
  terminal(t, 690, 640, 1160, 260, T_PUSH, { fs: 26, title: '终端', accent: '#22a06b' });
  guest(t, blk);
  if (t >= P('X02', 0.5)) stamp(t, P('X02', 0.5), 1180, 520, '真的有了 ✓', '#22c08b', 76, -0.12);
};
SFX_FNS.push(() => { guestSfx(['X02']); const p1 = P('G04_01', 0.2); for (let k = 0; k < 3; k++) sfx(p1 + k * 0.12, 'whoosh', 0.25); sfx(P('G04_01', 0.5), 'buzz', 0.5); sfx(P('G04_02', 0.3), 'whoosh', 0.5); sfx(P('G04_02', 0.3) + 0.6, 'ding', 0.5); sfx(P('G04_02', 0.66), 'whoosh', 0.5); sfx(P('G04_02', 0.66) + 0.6, 'ding', 0.5); sfx(P('G04_03', 0.3), 'pop', 0.5); sfx(P('G04_03', 0.45), 'whoosh', 0.4); sfx(P('G04_03', 0.6), 'sparkle', 0.4); sfx(P('X02', 0.5), 'stamp', 0.7); });

// ---- 回到旧版修 bug ----
const T_OLD = retime([
  { t: 0, s: 'git switch --detach v1.0', cmd: true },
  { t: 0, s: '{r}HEAD is now at 7d3e9a1 首页完成' },
  { t: 0, s: 'git switch -c fix-typo v1.0', cmd: true },
  { t: 0, s: 'git commit -am "修复错别字"', cmd: true },
  { t: 0, s: 'git switch main', cmd: true, dur: 0.35 },
  { t: 0, s: 'git merge fix-typo', cmd: true, dur: 0.45 },
], [['G05_01', 0.2], ['G05_01', 0.42], ['G05_02', 0.15], ['G05_02', 0.72], ['G05_03', 0.12], ['G05_03', 0.3]]);
SC.old = (t, blk, en) => {
  bgLecture(t, '#3e8ed0'); lecturer(t, blk, en, blk.t0);
  const cy = 250, xs = [760, 900, 1040, 1180, 1320, 1460];
  const mT = P('G05_03', 0.35); const xsM = t >= mT ? [...xs, 1600] : xs;
  chain(t, xsM, cy, { pop: i => i < 6 ? prog(t, blk.t0 + 0.05 + i * 0.04, 0.3) : prog(t, mT, 0.3), cols: [0, 0, 0, 0, 0, 0, '#22c08b'].map((c, i) => c || CH_COL[(i + 2) % 8]) });
  tagOn(xs[1], cy, 1, 'v1.0', { sc: 0.5, up: 80 });
  branchLabel(xsM[xsM.length - 1], cy - 160, 1, 'main');
  // 修复分支：从 v1.0 往下长
  const bT = P('G05_02', 0.35), fT = P('G05_02', 0.75), FX0 = 1040, FY = 430;
  if (t >= bT) { seg(xs[1], cy, FX0, FY, '#ff7a3d', eOut(prog(t, bT, 0.4)), 9); if (t >= fT) commitNode(FX0, FY, 0.5 * eBack(prog(t, fT, 0.3)), null, { col: '#ff7a3d' }); branchLabel(FX0 + 150, FY - 4, popIn(t, bT + 0.2), 'fix-typo', '#ff7a3d'); if (t >= fT) txt('修好 ✓', FX0, FY + 56, 26, '#ffd36b', { align: 'center' }); }
  if (t >= mT) { seg(FX0, FY, 1600, cy, '#22c08b', eOut(prog(t, mT, 0.4)), 9); }
  // HEAD：跳回 v1.0，再跟着修复分支
  const hT = P('G05_01', 0.32); let hx = xs[5], hy = cy - 230;
  if (t >= hT) { const p = eIO(prog(t, hT, 0.45)); hx = lerp(xs[5], xs[1], p); }
  if (t >= fT) { const p = eIO(prog(t, fT, 0.4)); hx = lerp(xs[1], FX0, p); hy = lerp(cy - 230, FY - 90, p); }
  if (t >= P('G05_03', 0.12)) { const p = eIO(prog(t, P('G05_03', 0.12), 0.4)); hx = lerp(FX0, xsM[xsM.length - 1], p); hy = lerp(FY - 90, cy - 230, p); }
  headTag(hx, hy, popIn(t, blk.t0 + 0.2));
  if (t >= hT + 0.4 && t < S('G05_02')) note(1300, 560, popIn(t, hT + 0.4), '⚠ detached HEAD · 上集讲过', '#ff7a3d', { fs: 30 });
  if (t >= mT + 0.4) note(1450, 560, popIn(t, mT + 0.4), '合回 main，错别字不会回来', '#22c08b', { fs: 30 });
  terminal(t, 690, 610, 1160, 290, T_OLD, { fs: 25, title: '终端', accent: '#3e8ed0' });
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['Q02']); sfx(P('G05_01', 0.32), 'whoosh', 0.5); sfx(P('G05_01', 0.32) + 0.4, 'buzz', 0.4); sfx(P('G05_02', 0.35), 'pop', 0.4); sfx(P('G05_02', 0.75), 'ding', 0.5); sfx(P('G05_03', 0.12), 'whoosh', 0.4); sfx(P('G05_03', 0.35), 'pop', 0.5); sfx(P('G05_03', 0.35) + 0.4, 'sparkle', 0.4); });
// ---- 讲解③：语义化版本 ----
SC.semver = (t, blk, en) => {
  bgLecture(t, '#e0485e'); lecturer(t, blk, en, blk.t0);
  const pT = P('G06_02', 0.4), nT = P('G06_03', 0.5), zT = P('G06_03', 0.82), mT = P('G06_04', 0.55);
  const dig = [flipText(t, [[-1, '1'], [mT, '2']]), flipText(t, [[-1, '0'], [nT, '1'], [mT, '0']]), flipText(t, [[-1, '0'], [pT, '1'], [zT, '0'], [mT, '0']])];
  const hiI = t >= mT ? 0 : t >= nT ? 1 : t >= pT ? 2 : -1;
  const s0 = popIn(t, blk.t0 + 0.1, 0.45);
  ctx.save(); ctx.translate(1270, 330); ctx.scale(s0, s0);
  txt('v', -470, 10, 150, '#fff', { align: 'center', font: F_FANCY, bold: false });
  const lab = ['主版本', '次版本', '修订号'], en2 = ['MAJOR', 'MINOR', 'PATCH'];
  dig.forEach((d, i) => {
    const x = -260 + i * 300, hot = hiI === i && t < [mT, nT, pT][i] + 1.2;
    if (i) txt('.', x - 150, 60, 120, '#fff', { align: 'center', font: F_FANCY, bold: false });
    ctx.save(); ctx.translate(x, 0); if (hot) { ctx.shadowColor = SEMC[i]; ctx.shadowBlur = 50; }
    box(-110, -130, 220, 260, 30, SEMC[i], '#fff', 8); ctx.shadowBlur = 0;
    ctx.save(); ctx.scale(1, d.sc); txt(d.s, 0, 8, 190, '#fff', { align: 'center', font: F_FANCY, bold: false }); ctx.restore();
    const ls = popIn(t, P('G06_01', 0.45 + i * 0.13)); if (ls > 0) { ctx.save(); ctx.scale(ls, ls); txt(lab[i], 0, 180, 40, '#fff', { align: 'center', font: F_FANCY, bold: false }); txt(en2[i], 0, 225, 24, '#c9c3dd', { align: 'center', font: F_CODE }); ctx.restore(); }
    ctx.restore();
  });
  ctx.restore();
  const rules = [['🐞', '修了 bug', '改最后一位', 'v1.0.1', S('G06_02')], ['✨', '加新功能 · 旧用法照样能用', '改中间，最后归零', 'v1.1.0', S('G06_03')], ['💥', '旧用法不兼容了', '才改第一位', 'v2.0.0', S('G06_04')]];
  rules.forEach((r, i) => {
    const s = popIn(t, r[4] + 0.05, 0.35); if (s <= 0) return; const y = 650 + i * 92; const act = hiI === 2 - i;
    ctx.save(); ctx.translate(1270, y); ctx.scale(s, s);
    box(-560, -38, 1120, 76, 20, act ? hexA(SEMC[2 - i], 0.95) : 'rgba(20,14,40,0.85)', SEMC[2 - i], 5);
    txt(r[0], -520, 2, 40, '#000', { font: EMOJI, bold: false }); txt(r[1], -460, 2, 32, '#fff', {}); txt('→ ' + r[2], 130, 2, 32, '#ffd36b', {}); txt(r[3], 520, 2, 32, '#fff', { align: 'right', font: F_CODE });
    ctx.restore();
  });
  if (t >= P('G06_05', 0.15)) { const s = popIn(t, P('G06_05', 0.15), 0.4); ctx.save(); ctx.translate(1700, 470); ctx.scale(s, s); ctx.rotate(0.08);
    box(-150, -70, 300, 140, 18, '#ffd23f', '#1b1433', 7); for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#1b1433' : '#ffd23f'; ctx.fillRect(-150 + k * 50, 70, 50, 18); }
    txt('🚧 v0.x', 0, -22, 40, '#1b1433', { align: 'center', font: F_CODE }); txt('还在开发中', 0, 30, 32, '#1b1433', { align: 'center' }); ctx.restore(); }
  guest(t, blk);
  if (t >= P('B02', 0.6)) stamp(t, P('B02', 0.6), 1180, 520, 'v1.0.1 ✓', '#22c08b', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['B02']); sfx(BK.semver.t0 + 0.1, 'impact', 0.5); [0.45, 0.58, 0.71].forEach(f => sfx(P('G06_01', f), 'pop', 0.4)); ['G06_02', 'G06_03', 'G06_04'].forEach(id => sfx(S(id) + 0.05, 'swoosh_in', 0.3)); sfx(P('G06_02', 0.4), 'ding', 0.5); sfx(P('G06_03', 0.5), 'ding', 0.5); sfx(P('G06_03', 0.82), 'click', 0.4); sfx(P('G06_04', 0.55), 'impact', 0.7); sfx(P('G06_05', 0.15), 'pop', 0.5); sfx(P('B02', 0.6), 'stamp', 0.7); });

// ---- 讲解④：GitHub Releases ----
SC.release = (t, blk, en) => {
  bgLecture(t, RELC); lecturer(t, blk, en, blk.t0);
  const BX = 680, BY = 80, BW = 1210, BH = 830, top = BY + 210;
  const formT = P('G07_01', 0.72), pubT = P('G07_05', 0.78), doneT = S('G07_06') - 0.15;
  const ba = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha = ba;
  browser(BX, BY, BW, BH, t < formT ? 'github.com/dafeiyu/baifan/releases' : t < doneT ? '…/baifan/releases/new' : '…/baifan/releases/tag/v1.0.1', { title: 'GitHub', accent: RELC });
  if (t < formT) {   // Releases 列表页
    h2('Releases', BX + 50, top + 40, 48);
    const pr = t >= P('G07_01', 0.58) && t < P('G07_01', 0.68);
    ghButton(BX + BW - 400, top + 10, 340, 64, 'Draft a new release', '#1f883d', { press: pr, glow: t >= P('G07_01', 0.4) ? 0.6 + 0.4 * Math.sin(t * 8) : 0, fs: 28 });
    box(BX + 50, top + 120, BW - 100, 160, 18, '#f6f8fa', '#d0d7de', 2); txt('还没有任何 Release', BX + BW / 2, top + 200, 34, '#8c959f', { align: 'center' });
    if (t >= P('G07_01', 0.3)) { const p = eIO(prog(t, P('G07_01', 0.3), 0.3)); cursor(lerp(BX + 300, BX + BW - 230, p), lerp(top + 400, top + 45, p), 1.2, pr ? 1 : 0); }
  } else if (t < doneT) {   // 新建 Release 表单
    const fy = top + 20;
    txt('Choose a tag', BX + 50, fy + 10, 28, '#24292f');
    box(BX + 50, fy + 34, 300, 58, 10, '#f6f8fa', t >= P('G07_02', 0.15) && t < P('G07_02', 0.45) ? '#3ec1ff' : '#d0d7de', 3);
    const tagSet = t >= P('G07_02', 0.25); if (tagSet) verTag(BX + 90, fy + 63, 0.5, 'v1.0.1'); else txt('🏷 选择标签 ▾', BX + 70, fy + 63, 26, '#57606a', {});
    const title = 'v1.0.1 · 修复错别字'; const tn = Math.floor(clamp(prog(t, P('G07_02', 0.5), 0.5)) * [...title].length);
    inputBox(BX + 380, fy + 34, BW - 430, '', [...title].slice(0, tn).join(''), { focus: t >= P('G07_02', 0.5) && t < S('K01'), t });
    txt('Release title', BX + 380, fy + 10, 28, '#24292f');
    // 说明框
    box(BX + 50, fy + 120, BW - 100, 230, 12, '#fff', '#d0d7de', 2);
    const gT = P('G07_03', 0.5);
    ghButton(BX + BW - 400, fy + 130, 330, 50, 'Generate release notes', '#f6f8fa', { fg: '#24292f', border: '#d0d7de', press: t >= gT - 0.1 && t < gT + 0.05, fs: 24, glow: t >= P('G07_03', 0.3) && t < gT ? 0.8 : 0 });
    if (t >= gT) { const L2 = ["## What's Changed", '* 修复首页错别字 by @dafeiyu', 'Full Changelog: v1.0...v1.0.1']; L2.forEach((l, i) => { const a = clamp(prog(t, gT + i * 0.15, 0.2)); ctx.save(); ctx.globalAlpha *= a; txt(l, BX + 80, fy + 210 + i * 46, i ? 26 : 30, i ? '#24292f' : '#0969da', { font: i === 2 ? F_CODE : F_BODY }); ctx.restore(); }); }
    else txt('Describe this release', BX + 80, fy + 160, 26, '#8c959f', { bold: false });
    // 附件区
    box(BX + 50, fy + 370, BW - 100, 110, 12, '#f6f8fa', '#8c959f', 2); ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = '#8c959f'; ctx.lineWidth = 3; rr(BX + 60, fy + 380, BW - 120, 90, 10); ctx.stroke(); ctx.restore();
    const aT = P('G07_04', 0.3);
    if (t < aT + 0.5) txt('把文件拖到这里当附件', BX + BW / 2, fy + 425, 28, '#8c959f', { align: 'center' });
    if (t >= aT - 0.5) { const [x, y] = arcPos(t, aT - 0.5, 0.5, BX + BW - 60, fy + 700, BX + 330, fy + 425, 120); fileChip(x, y, 0.7, '📦', 'baifan-v1.0.1.zip', RELC); }
    if (t >= P('G07_04', 0.6)) note(BX + 860, fy + 425, popIn(t, P('G07_04', 0.6)), 'Source code 自动附上 ✓', '#22c08b', { fs: 26 });
    // pre-release + 发布
    const pre = t >= P('G07_05', 0.2) && t < P('G07_05', 0.55);
    checkbox(BX + 80, fy + 530, pre, 'Set as a pre-release'); if (pre) note(BX + 600, fy + 530, popIn(t, P('G07_05', 0.2)), '还没准备好？勾它', '#ffb020', { fs: 26 });
    ghButton(BX + BW - 360, fy + 500, 300, 64, 'Publish release', '#1f883d', { press: t >= pubT - 0.1 && t < pubT + 0.05, glow: t >= P('G07_05', 0.6) ? 0.6 + 0.4 * Math.sin(t * 8) : 0, fs: 28 });
    if (t >= P('G07_05', 0.6)) { const p = eIO(prog(t, P('G07_05', 0.6), 0.2)); cursor(lerp(BX + 600, BX + BW - 210, p), lerp(fy + 650, fy + 535, p), 1.2, t >= pubT - 0.1 ? 1 : 0); }
    if (t >= pubT) { flash(t, pubT, 0.2); confetti(t, pubT, 70, 5, 1290, 500); }
  } else {   // 发布完成页
    const s = popIn(t, doneT, 0.4); ctx.save(); ctx.translate(BX + BW / 2, top + 250); ctx.scale(s, s);
    box(-540, -230, 1080, 460, 20, '#fff', '#d0d7de', 3);
    txt('v1.0.1 · 修复错别字', -500, -180, 44, '#24292f', {});
    const lp = popIn(t, P('G07_06', 0.22)); if (lp > 0) { ctx.save(); ctx.translate(120, -180); ctx.scale(lp, lp); box(-60, -24, 120, 48, 24, '#fff', '#1a7f37', 4); txt('Latest', 0, 1, 26, '#1a7f37', { align: 'center' }); ctx.restore(); }
    verTag(-490, -110, 0.45, 'v1.0.1');
    txt('▾ Assets  3', -500, -40, 32, '#24292f', {});
    [['📦', 'baifan-v1.0.1.zip'], ['📄', 'Source code (zip)'], ['📄', 'Source code (tar.gz)']].forEach((a, i) => { const y = 20 + i * 62; box(-500, y - 26, 1000, 52, 8, i === 0 && t >= P('G07_06', 0.45) ? '#ddf4ff' : '#f6f8fa'); txt(a[0], -480, y, 30, '#000', { font: EMOJI, bold: false }); txt(a[1], -430, y, 28, '#0969da', { font: F_CODE }); });
    ctx.restore();
    if (t >= P('G07_06', 0.35)) cursor(BX + 520, top + 290, 1.2, t >= P('G07_06', 0.45) && t < P('G07_06', 0.5) ? 1 : 0);
    const old = popIn(t, P('G07_06', 0.68)); if (old > 0) { ctx.save(); ctx.globalAlpha *= old; box(BX + 65, top + 510, BW - 130, 80, 16, '#f6f8fa', '#d0d7de', 2); txt('v1.0 · 第一个正式版', BX + 100, top + 550, 30, '#57606a', {}); ctx.restore(); }
    if (t >= P('G07_06', 0.75)) fancy('每发一版，就多一条记录！', 1290, 940, 58, t, P('G07_06', 0.75), FX.yel);
  }
  ctx.restore();
  guest(t, blk);
  if (t >= P('K01', 0.55) && t < E('K01') + 0.3) fancy('3000 字……', 1100, 700, 110, t, P('K01', 0.55), FX.red);
  if (t >= P('K02', 0.6) && t < E('K02') + 0.3) stamp(t, P('K02', 0.6), 1150, 560, '三条 ✓', '#22c08b', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['K01', 'K02']); sfx(P('G07_01', 0.3), 'whoosh', 0.3); sfx(P('G07_01', 0.6), 'click', 0.6); sfx(P('G07_01', 0.72), 'swoosh_in', 0.4); sfx(P('G07_02', 0.25), 'pop', 0.5); typeSfx(P('G07_02', 0.5), 12, 0.5); sfx(P('K01', 0.55), 'impact', 0.6); sfx(P('G07_03', 0.5), 'click', 0.6); sfx(P('G07_03', 0.5) + 0.1, 'sparkle', 0.4); sfx(P('K02', 0.6), 'stamp', 0.6); sfx(P('G07_04', 0.3), 'whoosh', 0.4); sfx(P('G07_04', 0.3) + 0.05, 'pop', 0.5); sfx(P('G07_04', 0.6), 'ding', 0.4); sfx(P('G07_05', 0.2), 'click', 0.4); sfx(P('G07_05', 0.55), 'click', 0.3); sfx(P('G07_05', 0.78), 'click', 0.6); sfx(P('G07_05', 0.78) + 0.05, 'confetti', 0.6); sfx(S('G07_06') - 0.15, 'swoosh_in', 0.4); sfx(P('G07_06', 0.22), 'ding', 0.5); sfx(P('G07_06', 0.45), 'click', 0.4); sfx(P('G07_06', 0.68), 'pop', 0.3); sfx(P('G07_06', 0.75), 'sparkle', 0.4); });

// ---- 复习：发布三件套 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, GOLD); lecturer(t, blk, en, blk.t0);
  const cards = [['🏷 打标签', GOLD, ['git tag -a', 'git push --tags', 'git tag -d 删掉再打'], 'G08_01'], ['🔢 版本号', SEMC[0], ['修 bug → 最后一位', '加功能 → 中间', '不兼容 → 第一位'], 'G08_02'], ['📦 发布', RELC, ['选标签', '写说明', '加附件 → Publish'], 'G08_03']];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.1, 0.4); if (s <= 0) return; const act = t >= S(c[3]) - 0.1 && (i === 2 || t < S(cards[i + 1][3]) - 0.1);
    const x = 870 + i * 400, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= S(c[3]) - 0.1 ? 1 : 0.5;
    if (act) { ctx.shadowColor = c[1]; ctx.shadowBlur = 40; } box(-180, -300, 360, 600, 28, '#fffaf0', c[1], 8); ctx.shadowBlur = 0;
    box(-180, -300, 360, 100, [28, 28, 0, 0], c[1]); txt(c[0], 0, -248, 42, i === 0 ? '#1b1433' : '#fff', { align: 'center', font: F_FANCY, bold: false });
    c[2].forEach((l, k) => { const a = clamp(prog(t, P(c[3], 0.1 + k * 0.27), 0.25)); ctx.save(); ctx.globalAlpha *= 0.25 + 0.75 * a; box(-150, -150 + k * 140, 300, 110, 16, '#fff', '#e4dff5', 3); txt(l, 0, -95 + k * 140, l.startsWith('git') ? 26 : 28, '#1b1433', { align: 'center', font: l.startsWith('git') ? F_CODE : F_BODY, max: 280 }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= P('G08_03', 0.8)) fancy('打标签 · 定版本 · 发出去！', 1270, 930, 60, t, P('G08_03', 0.8), FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2].forEach(i => sfx(BK.recap.t0 + 0.1 + i * 0.1, 'pop', 0.3)); ['G08_01', 'G08_02', 'G08_03'].forEach(id => [0, 1, 2].forEach(k => sfx(P(id, 0.1 + k * 0.27), 'ding', 0.25))); sfx(P('G08_03', 0.8), 'sparkle', 0.5); });

// ---- 实战：白饭页正式发布 ----
const T_PRAC = retime([
  { t: 0, s: 'git tag -a v1.0.0 -m "第一个正式版"', cmd: true },
  { t: 0, s: 'git push --tags', cmd: true, dur: 0.4 },
  { t: 0, s: '{g} * [new tag]  v1.0.0 -> v1.0.0' },
  { t: 0, s: 'git commit -am "修复错别字"', cmd: true, dur: 0.5 },
  { t: 0, s: 'git tag -a v1.0.1 -m "修复错别字"', cmd: true, dur: 0.6 },
  { t: 0, s: 'git commit -am "今日推荐菜"', cmd: true, dur: 0.5 },
  { t: 0, s: 'git tag -a v1.1.0 -m "今日推荐菜"', cmd: true, dur: 0.6 },
  { t: 0, s: 'git commit -am "修复 bug"', cmd: true, dur: 0.5 },
  { t: 0, s: 'git tag -a v1.1.1 -m "修复 bug"', cmd: true, dur: 0.6 },
  { t: 0, s: 'git push --follow-tags', cmd: true, dur: 0.5 },
  { t: 0, s: '{g} * [new tag]  v1.1.1 -> v1.1.1' },
], [['G09_02', 0.2], ['G09_02', 0.72], ['G09_02', 0.86], ['G09_03', 0.08], ['G09_03', 0.26], ['G09_03', 0.5], ['G09_03', 0.68], ['G09_04', 0.3], ['G09_04', 0.5], ['G09_04', 0.78], ['G09_04', 0.92]]);
const PR_V = [['v1.0.0', 'G09_02', 0.4, '第一个正式版'], ['v1.0.1', 'G09_03', 0.3, '修复错别字'], ['v1.1.0', 'G09_03', 0.72, '今日推荐菜'], ['v1.1.1', 'G09_04', 0.55, '修复 bug']];
SC.practice = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  const steps = [['v1.0.0', S('G09_02')], ['push', P('G09_02', 0.7)], ['v1.0.1', S('G09_03')], ['v1.1.0', P('G09_03', 0.48)], ['v1.1.1', S('G09_04')], ['Release', S('G09_05')]];
  const end = S('D08') - 0.2;
  steps.forEach((s, i) => {
    const a = popIn(t, blk.t0 + 0.15 + i * 0.06); if (a <= 0) return;
    const x = 790 + i * 200, y = 88; const act = t < end && t >= s[1] && (i === 5 || t < steps[i + 1][1]); const done = t >= end || (i < 5 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1));
    box(-90, -32, 180, 64, 18, act ? '#ff7a3d' : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act ? '✓ ' : '') + s[0], 0, 2, 24, '#fff', { align: 'center', font: F_CODE }); ctx.restore();
  });
  const ta = eOut(prog(t, blk.t0, 0.3));
  terminal(t, 676, 160, 700, 700, T_PRAC, { alpha: ta, fs: 21, accent: '#ff7a3d', title: '终端 — 大肥鱼的电脑' });
  ctx.save(); ctx.globalAlpha = ta;
  win(1390, 160, 500, 700, '白饭页 · 版本记录', GOLD);
  PR_V.forEach((v, i) => { const tt = P(v[1], v[2]); const y = 290 + i * 140; const s = popIn(t, tt, 0.35); if (s <= 0) return;
    if (i) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(1460, y - 140 + 30); ctx.lineTo(1460, y - 30); ctx.stroke(); }
    commitNode(1460, y, 0.42 * s, null, { col: CH_COL[(i + 2) % 8] }); verTag(1530, y - 10, 0.5 * s, v[0], { anno: true, glow: t < tt + 0.6 ? 1 : 0 }); txt(v[3], 1550, y + 40, 24, '#c9c3dd', {}); });
  const rT = P('G09_05', 0.25); if (t >= rT && t < end) { relBox(1660, 800, 0.42 * popIn(t, rT), t, { label: 'v1.1.1', glow: 1 });
    [['自动生成说明 ✓', 0.45], ['📦 附件 ✓', 0.62], ['Publish!', 0.8]].forEach((c, k) => pill(1060, 600 + k * 80, c[0], k === 2 ? '#7cf07a' : '#ffd23f', popIn(t, P('G09_05', c[1])), { font: F_BODY, fs: 32 })); }
  ctx.restore();
  if (t < S('G09_02')) fancy('实战开始！', 1280, 500, 110, t, P('G09_01', 0.3), Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_party', 1600, H + 30, 860, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    const bs = popIn(t, end + 0.05, 0.4); ctx.save(); ctx.translate(1050, 420); ctx.scale(bs, bs); ctx.rotate(-0.05);
    box(-260, -230, 520, 400, 26, '#fff', RELC, 8); box(-260, -230, 520, 80, [26, 26, 0, 0], RELC); txt('Release', 0, -190, 40, '#fff', { align: 'center', font: F_FANCY, bold: false });
    txt('白饭页 v1.1.1', -220, -100, 40, '#24292f', {}); box(110, -126, 120, 48, 24, '#fff', '#1a7f37', 4); txt('Latest', 170, -101, 26, '#1a7f37', { align: 'center' });
    [['📦', 'baifan-v1.1.1.zip'], ['📄', 'Source code (zip)']].forEach((a, i) => { box(-220, -40 + i * 70, 440, 54, 8, '#f6f8fa'); txt(a[0], -200, -13 + i * 70, 28, '#000', { font: EMOJI, bold: false }); txt(a[1], -150, -13 + i * 70, 24, '#0969da', { font: F_CODE }); });
    txt('🍚', 170, 110, 60, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore();
    fancy('正式发布啦！', 1050, 780, 90, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 6; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(P('G09_01', 0.3), 'impact', 0.6); PR_V.forEach(v => sfx(P(v[1], v[2]), 'ding', 0.4)); sfx(P('G09_02', 0.86), 'whoosh', 0.3); sfx(P('G09_05', 0.25), 'sparkle', 0.5); [0.45, 0.62, 0.8].forEach(f => sfx(P('G09_05', f), 'pop', 0.4)); const end = S('D08') - 0.2; sfx(end, 'impact', 0.6); sfx(end + 0.4, 'confetti', 0.6); });

// ---- 预告 + 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#3e8ed0');
  const outro = E('G10_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G10_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G10_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G10_01', 0.12), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 470); ctx.scale(bp, bp); ctx.translate(-1260, -470);
      browser(860, 220, 800, 500, 'dafeiyu.github.io/baifan', { title: '白饭页', accent: '#3e8ed0' });
      txt('🍚 白饭页', 1260, 500, 70, '#24292f', { align: 'center', font: F_FANCY, bold: false });
      ['首页', '今日推荐菜', '关于'].forEach((n, i) => chip(960 + i * 200, 590, 1, n, ['#ff7a3d', '#22c08b', '#7c5cff'][i], '#fff', 26));
      ctx.restore(); }
    [['GitHub Pages', -520, 300, 0.35], ['免费网站', 520, 290, 0.5], ['push 就更新', -500, 640, 0.62], ['🌐 人人能访问', 510, 650, 0.72]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G10_01', c[3])), { fs: 34, font: /[\u4e00-\u9fff]/.test(c[0]) ? F_BODY : F_CODE }));
    fancy('白饭页变成真网站！', 1260, 830, 84, t, P('G10_01', 0.75), FX.pink);
  }
  if (ot > 0) {
    ctx.fillStyle = `rgba(10,8,22,${0.78 * ot})`; ctx.fillRect(...OS);
    [['👍', '点赞', '#ff5c8a'], ['🪙', '投币', '#ffd23f'], ['⭐', '收藏', '#3ec1ff']].forEach((ic, i) => {
      const a = popIn(t, S('G10_02') + 0.4 + i * 0.32, 0.4); if (a <= 0) return;
      const x = W / 2 + (i - 1) * 330, y = 440;
      ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(t * 5 + i) * 0.06);
      ctx.fillStyle = ic[2]; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.font = `110px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic[0], 0, 8); ctx.restore();
      fancy(ic[1], x, y + 180, 60, t, S('G10_02') + 0.5 + i * 0.32, { c1: '#fff', c2: '#eee', stroke: ic[2] });
    });
    fancy('一键三连，下集见！', W / 2, 180, 96, t, S('G10_02') + 1.4, { stagger: 0.04 });
    if (t > outro) {
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_party', 1690, H + 40, 640, { scale: sa }); }
      SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
    ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
    ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G10_01', 0.12), 'pop', 0.6); [0.35, 0.5, 0.62, 0.72].forEach(f => sfx(P('G10_01', f), 'pop', 0.4)); sfx(P('G10_01', 0.75), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G10_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G10_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_sparkle', P('G02_03', 0.62), E('G02_03')], ['d_shock', P('G04_01', 0.5), E('G04_01')], ['d_ok', P('G05_03', 0.55), E('G05_03')],
  ['d_relief', P('G06_02', 0.45), E('G06_02')], ['d_sparkle', P('G07_06', 0.4), E('G07_06')],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));
