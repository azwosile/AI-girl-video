// ================= 番外1：Git 小技巧 =================
const GOLD = '#ffc83d', CFGC = '#3ec1ff', ALC = '#a66bff', DIFC = '#22c08b', IGC = '#ff5c8a', TOOLC = '#ff7a3d';
const TIPS = [['⚙', 'config', CFGC], ['⌨', 'alias', ALC], ['🔍', 'diff', DIFC], ['🙈', '.gitignore', IGC]];
// 金色版本标签（沿用第5集）
function verTag(x, y, s, label, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.globalAlpha *= (o.alpha ?? 1);
  const fs = o.fs || 40; ctx.font = `bold ${fs}px ${F_CODE}`; const w = ctx.measureText(label).width + 70, h = fs * 1.7;
  const col = o.col || GOLD;
  const path = () => { ctx.beginPath(); ctx.moveTo(-h * 0.45, 0); ctx.lineTo(0, -h / 2); ctx.lineTo(w, -h / 2); ctx.quadraticCurveTo(w + 14, -h / 2, w + 14, -h / 2 + 14); ctx.lineTo(w + 14, h / 2 - 14); ctx.quadraticCurveTo(w + 14, h / 2, w, h / 2); ctx.lineTo(0, h / 2); ctx.closePath(); };
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.save(); ctx.translate(6, 8); path(); ctx.fill(); ctx.restore();
  path(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#1b1433'; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-h * 0.1, 0, h * 0.13, 0, 7); ctx.fill(); ctx.lineWidth = 4; ctx.stroke();
  txt(label, w / 2 + 6, 3, fs, '#1b1433', { align: 'center', font: F_CODE });
  ctx.restore();
}
// 工具卡片（标题页、复习页共用）
function toolCard(x, y, s, k, o = {}) {
  if (s <= 0) return; const [ic, name, col] = TIPS[k];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  if (o.glow) { ctx.shadowColor = col; ctx.shadowBlur = 40 * o.glow; }
  box(-130, -70, 260, 140, 26, '#fff', col, 7); ctx.shadowBlur = 0;
  txt(ic, -78, 2, 56, '#000', { align: 'center', font: EMOJI, bold: false });
  txt(name, 34, 2, name.length > 7 ? 30 : 36, '#1b1433', { align: 'center', font: F_CODE });
  ctx.restore();
}
// 键帽
function keyCap(x, y, s, ch, down = 0, col = '#fff') {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y + down * 8); ctx.scale(s, s);
  box(-34, -30 + 8 - down * 8, 68, 64, 12, '#8f8aa8'); box(-34, -38, 68, 64, 12, down > 0.5 ? '#ffd23f' : col, '#1b1433', 4);
  txt(ch, 0, -6, 34, '#1b1433', { align: 'center', font: F_CODE }); ctx.restore();
}
// 小号工具箱
function toolbox(x, y, s, open, t) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  box(-200, -40, 400, 190, 22, '#e0483e', '#1b1433', 8); box(-60, -90, 120, 60, 18, null, '#1b1433', 10);
  box(-200, -10, 400, 26, 0, '#b8332b');
  ctx.save(); ctx.translate(-200, -40); ctx.rotate(-open * 0.9); box(0, -46, 400, 50, 16, '#ff6a5c', '#1b1433', 8); ctx.restore();
  box(-30, 40, 60, 40, 8, GOLD, '#1b1433', 5);
  ctx.restore();
}
// 侧栏小卡（讲解页下方信息卡）
function infoCard(x, y, w, h, s, title, col, lines, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= (o.alpha ?? 1);
  box(-w / 2, -h / 2, w, h, 22, '#fffaf0', col, 6); box(-w / 2, -h / 2, w, 62, [22, 22, 0, 0], col);
  txt(title, 0, -h / 2 + 32, 32, '#fff', { align: 'center', font: F_FANCY, bold: false });
  lines.forEach((l, i) => txt(l[0], -w / 2 + 30, -h / 2 + 100 + i * 52, l[2] || 28, l[1] || '#1b1433', { font: l[3] || F_BODY, max: w - 60 }));
  ctx.restore();
}

// ---- 冷开场：一天几十遍 git status ----
const T_COLD = retime([
  { t: 0, s: 'git stauts', cmd: true, dur: 0.35 },
  { t: 0, s: "{r}git: 'stauts' is not a git command." },
  { t: 0, s: 'git statsu', cmd: true, dur: 0.35 },
  { t: 0, s: "{r}git: 'statsu' is not a git command." },
  { t: 0, s: 'git status', cmd: true, dur: 0.35 },
  { t: 0, s: '{g}On branch main' },
  { t: 0, s: 'git status', cmd: true, dur: 0.3 },
  { t: 0, s: 'git status', cmd: true, dur: 0.3 },
  { t: 0, s: 'git sta', cmd: true, dur: 0.3 },
], [['D01', 0.0], ['D01', 0.1], ['D01', 0.16], ['D01', 0.26], ['D01', 0.32], ['D01', 0.42], ['D01', 0.5], ['D01', 0.6], ['D01', 0.7]]);
SC.cold = (t, blk) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, P('D01', 0.6), 9, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#3a2a8c', '#5a43c9', W * 0.62, H * 0.5, 22, 0.35);
  const wa = eBack(prog(t, t0 + 0.05, 0.4));
  ctx.save(); ctx.translate(1390, 450); ctx.scale(wa, wa); ctx.translate(-1390, -450);
  terminal(t, 960, 110, 880, 640, T_COLD, { fs: 34, title: '终端 — 大肥鱼的电脑', accent: TOOLC });
  ctx.restore();
  const n = Math.floor(lerp(41, 58, clamp(prog(t, P('D01', 0.3), U.D01.dur * 0.5))));
  const cs = popIn(t, P('D01', 0.3)); if (cs > 0) { ctx.save(); ctx.translate(1400, 860); ctx.scale(cs, cs); ctx.rotate(-0.04); box(-260, -55, 520, 110, 55, '#ffd23f', '#1b1433', 7); txt(`今天第 ${n} 次`, 0, 2, 50, '#1b1433', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); }
  const p = spring(prog(t, t0, 0.9));
  sprite('d_tired', 480, H + 40, 1000, { scale: lerp(1.3, 1, p), rot: Math.sin(t * 22) * 0.006 });
  fancy('手要断了！', 470, 150, 92, t, P('D01', 0.6), { rot: -0.08, wobble: 6, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
};
SFX_FNS.push(() => { sfx(BK.cold.t0 + 0.05, 'swoosh_in', 0.5); sfx(P('D01', 0.1), 'buzz', 0.4); sfx(P('D01', 0.26), 'buzz', 0.4); sfx(P('D01', 0.3), 'pop', 0.4); sfx(P('D01', 0.6), 'impact', 0.6); });

// ---- 标题：打开工具箱 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0, tT = S('G01_02'); let [sx, sy] = shake(t, tT + 0.2, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#c9511f', '#ff8a3d', W * 0.62, H * 0.5, 28, 0.2);
  const oT = P('G01_01', 0.25), op = eBack(prog(t, oT, 0.4));
  const pos = [[880, 300], [1660, 300], [880, 720], [1660, 720]];
  const pre = t < tT;
  if (pre) toolbox(1270, 640, popIn(t, t0 + 0.1, 0.4), op, t);
  TIPS.forEach((c, i) => {
    const ft = P('G01_01', 0.35 + i * 0.1); if (t < ft) return;
    let x, y; const p = eOut(prog(t, ft, 0.4));
    if (pre) { x = lerp(1270, pos[i][0], p); y = lerp(600, pos[i][1], p) - Math.sin(p * Math.PI) * 120; }
    else { const a = (t - tT) * 0.5 + i * Math.PI / 2 + Math.PI / 4; x = 1270 + Math.cos(a) * 560; y = 520 + Math.sin(a) * 300; }
    toolCard(x, y, 0.95 * Math.min(1, popIn(t, ft, 0.3)), i, { rot: Math.sin(t * 2 + i) * 0.05 });
  });
  if (pre && t >= P('G01_01', 0.7)) fancy('用了就回不去！', 1270, 960, 66, t, P('G01_01', 0.7), FX.yel);
  lecturer(t, blk, en, t0);
  if (!pre) {
    sprite('d_happy', lerp(W + 500, 1700, eBack(prog(t, tT + 0.3, 0.5))), H + 30, 720);
    fancy('AI娘 Git课', 1250, 150, 88, t, tT, FX.white);
    const slam = prog(t, tT + 0.2, 0.2);
    if (slam > 0) {
      ctx.save(); ctx.translate(1240, 520); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
      badge(-360, -10, 95, '#7c5cff', '番外', { fs: 56, rot: -0.15, fg: '#fff' });
      fancy('Git', 40, -70, 120, t, -99, FX.white);
      fancy('小技巧！', 90, 80, 150, t, -99, FX.yel);
      ctx.restore();
      speedLines(t, 1240, 520, 1 - prog(t, tT + 0.4, 0.6));
    }
    flash(t, tT + 0.4, 0.2);
  }
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(P('G01_01', 0.25), 'click', 0.6); [0, 1, 2, 3].forEach(i => sfx(P('G01_01', 0.35 + i * 0.1), 'pop', 0.4)); sfx(P('G01_01', 0.7), 'ding', 0.4); sfx(S('G01_02') + 0.35, 'impact', 1.0); sfx(S('G01_02') + 0.5, 'confetti', 0.4); });

// ---- 提问页插图（左侧 80..960）----
function probCfgQ(t, blk) {
  const t0 = blk.t0; win(110, 200, 820, 520, 'git log', CFGC);
  const L = [['{y}commit a1b2c3d', 0.2], ['{w}Author: {r}Administrator <admin@DESKTOP-8F3K2>', 0.35], ['{w}    修好首页', 0.45], ['', 0], ['{y}commit 9f8e7d6', 0.55], ['{w}Author: {g}dafeiyu <dafeiyu@example.com>', 0.65], ['{w}    第一版', 0.72]];
  ctx.font = `bold 26px ${F_CODE}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  L.forEach((l, i) => { if (!l[0]) return; const a = clamp(prog(t, t0 + l[1], 0.2)); ctx.save(); ctx.globalAlpha *= a; colorText(l[0], 150, 300 + i * 56); ctx.restore(); });
  if (t >= P('D02', 0.5)) { const p = eOut(prog(t, P('D02', 0.5), 0.35)); ctx.save(); ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(560, 356, 360, 40, 0, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke(); ctx.restore(); }
  if (t >= P('D02', 0.75)) stamp(t, P('D02', 0.75), 640, 790, '这是谁？', '#ff3b5c', 64, -0.1);
}
function probAliasQ(t, blk) {
  const t0 = blk.t0, keys = [...'git status'];
  const cyc = 1.3, ph = ((t - t0) % cyc) / cyc, k = Math.floor(ph * 12);
  keys.forEach((c, i) => { const x = 170 + i * 76; keyCap(x, 420, popIn(t, t0 + 0.1 + i * 0.03), c === ' ' ? '␣' : c, k === i ? 1 : 0); });
  const n = 58 + Math.floor(Math.max(0, t - t0) / cyc);
  const s = popIn(t, t0 + 0.4); if (s > 0) { ctx.save(); ctx.translate(520, 640); ctx.scale(s, s); fancy(`×${n}`, 0, 0, 150, t, -99, FX.red); ctx.restore(); }
  if (t >= t0 + 0.6) txt('每天都在敲……', 520, 800, 44, '#5a43c9', { align: 'center' });
}
function probDiffQ(t, blk) {
  const t0 = blk.t0; docIcon(400, 470, 2.6 * popIn(t, t0 + 0.15, 0.4), 'html', DIFC, { name: '' });
  [[700, 300], [770, 470], [660, 640], [250, 260]].forEach((q, i) => { const s = popIn(t, t0 + 0.4 + i * 0.12); if (s > 0) txt('?', q[0], q[1], 110 * s, ['#ffd23f', '#ff5c8a', '#3ec1ff', '#22c08b'][i], { align: 'center', font: F_FANCY, bold: false }); });
  const cs = popIn(t, t0 + 0.35); if (cs > 0) { ctx.save(); ctx.translate(560, 820); ctx.scale(cs, cs); box(-220, -45, 440, 90, 45, '#fff', '#1b1433', 6); txt('🕒 改了一下午', 0, 2, 40, '#1b1433', { align: 'center' }); ctx.restore(); }
}
function probIgnQ(t, blk) {
  const t0 = blk.t0; ctx.save(); ctx.translate(140, 190);
  repoFiles(0, 0, 760, ['/node_modules', '/src', '.gitignore', 'index.html'], t, t0 + 0.15, { msg: '更新 .gitignore', commits: 12 });
  ctx.restore();
  const g = popIn(t, t0 + 0.6); if (g > 0) { ctx.save(); ctx.translate(700, 700); ctx.scale(g, g); ctx.rotate(0.04); box(-180, -80, 360, 160, 16, '#fff8c5', '#1b1433', 5); txt('.gitignore', 0, -40, 30, '#57606a', { align: 'center', font: F_CODE }); txt('node_modules/', 0, 20, 34, '#1b1433', { align: 'center', font: F_CODE }); ctx.restore(); }
  if (t >= P('D05', 0.55)) { const p = eOut(prog(t, P('D05', 0.55), 0.35)); ctx.save(); ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(330, 283, 210, 44, 0, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke(); ctx.restore(); }
  if (t >= P('D05', 0.8)) stamp(t, P('D05', 0.8), 330, 560, '还在！', '#ff3b5c', 72, -0.12);
}
function probAsk6(t, blk) { [0, 1, 2, 3].forEach(i => toolCard(300 + (i % 2) * 440, 380 + Math.floor(i / 2) * 260, popIn(t, blk.t0 + 0.15 + i * 0.08), i, { rot: (i % 2 ? 1 : -1) * 0.05 })); }
function probAskP(t, blk) {
  const s = popIn(t, blk.t0 + 0.15, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(460, 540); ctx.scale(s, s);
  box(-240, -300, 480, 600, 30, '#fff', '#2f6fe0', 8); box(-240, -300, 480, 90, [30, 30, 0, 0], '#2f6fe0');
  txt('白饭页', 0, -255, 44, '#fff', { align: 'center', font: F_FANCY, bold: false });
  for (let i = 0; i < 5; i++) box(-190, -170 + i * 60, 300 + rnd(i + 4) * 80, 22, 11, '#c9c3dd');
  txt('🍚', 0, 190, 120, '#000', { align: 'center', font: EMOJI, bold: false });
  ctx.restore();
  toolbox(800, 760, 0.5 * popIn(t, blk.t0 + 0.4), 0.6, t);
}
const PROB = {
  cfgQ: { chap: ['技巧①', 'git config', '#1e8ac9'], q: '这是谁的名字？', bg: ['#d7f3ff', '#b5e6ff'], draw: probCfgQ },
  aliasQ: { chap: ['技巧②', 'alias 别名', ALC, F_BODY], q: '能少打几个字吗？', bg: ['#eadfff', '#d6c4ff'], draw: probAliasQ },
  diffQ: { chap: ['技巧③', 'git diff', '#15925f'], q: '我改了啥？', bg: ['#dcf7ea', '#b8eed3'], draw: probDiffQ },
  ignQ: { chap: ['技巧④', '.gitignore', '#d6336c'], q: '怎么还在？', bg: ['#ffe0ea', '#ffc2d6'], draw: probIgnQ },
  ask6: { chap: ['复习', '四个小技巧', '#c98a00', F_BODY], q: '帮我总结！', bg: ['#fff4cc', '#ffe48a'], draw: probAsk6 },
  askP: { chap: ['实战', '白饭页配一遍', '#ff7a3d', F_BODY], q: '现在就配！', bg: ['#ffe6d6', '#ffcaa8'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach(e => { if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  sfx(P('D02', 0.5), 'buzz', 0.4); sfx(P('D02', 0.75), 'stamp', 0.6);
  for (let i = 0; i < 6; i++) sfx(BK.aliasQ.t0 + 0.1 + i * 0.22, 'type', 0.3);
  sfx(P('D05', 0.55), 'buzz', 0.4); sfx(P('D05', 0.8), 'stamp', 0.7);
  [0, 1, 2, 3].forEach(i => sfx(BK.ask6.t0 + 0.15 + i * 0.08, 'pop', 0.3));
});

// ---- 技巧①：git config ----
const T_CFG = retime([
  { t: 0, s: 'git config --global user.name "dafeiyu"', cmd: true },
  { t: 0, s: 'git config --global user.email "dafeiyu@example.com"', cmd: true },
  { t: 0, s: '{d}# 只改当前仓库：去掉 --global' },
  { t: 0, s: 'git config user.name "大肥鱼-工作号"', cmd: true },
  { t: 0, clear: true },
  { t: 0, s: 'git config --list', cmd: true, dur: 0.4 },
  { t: 0, s: '{c}user.name{w}=dafeiyu' },
  { t: 0, s: '{c}user.email{w}=dafeiyu@example.com' },
  { t: 0, s: '{c}core.autocrlf{w}=true' },
  { t: 0, s: '{c}init.defaultbranch{w}=main' },
], [['G02_01', 0.3], ['G02_01', 0.62], ['G02_03', 0.3], ['G02_03', 0.45], ['G02_04', 0.1], ['G02_04', 0.2], ['G02_04', 0.45], ['G02_04', 0.52], ['G02_04', 0.59], ['G02_04', 0.66]]);
SC.config = (t, blk, en) => {
  bgLecture(t, CFGC); lecturer(t, blk, en, blk.t0);
  terminal(t, 680, 100, 1200, 380, T_CFG, { fs: 27, accent: CFGC, title: '终端 — 大肥鱼的新电脑', alpha: eOut(prog(t, blk.t0, 0.3)) });
  const ph2 = S('G02_02') - 0.1, ph3 = S('G02_03') - 0.1, ph4 = S('G02_04') - 0.1;
  if (t < ph3) {   // 身份卡 → GitHub 提交记录
    const sh = eIO(prog(t, ph2, 0.4)); const cx = lerp(1280, 1000, sh);
    const s = popIn(t, P('G02_01', 0.15), 0.4); if (s > 0) { ctx.save(); ctx.translate(cx, 700); ctx.scale(s, s); ctx.rotate(-0.02);
      box(-300, -170, 600, 340, 26, '#fff', CFGC, 7); box(-300, -170, 600, 70, [26, 26, 0, 0], CFGC); txt('Git 身份卡', 0, -134, 36, '#fff', { align: 'center', font: F_FANCY, bold: false });
      ctx.fillStyle = '#8fdcff'; ctx.beginPath(); ctx.arc(-190, 30, 70, 0, 7); ctx.fill(); txt('🐟', -190, 34, 70, '#000', { align: 'center', font: EMOJI, bold: false });
      const nm = t >= P('G02_01', 0.5) ? 'dafeiyu' : '？？？', em = t >= P('G02_01', 0.85) ? 'dafeiyu@example.com' : '？？？';
      txt('name', -90, -30, 24, '#8f8aa8', { font: F_CODE }); txt(nm, -90, 10, 36, '#1b1433', { font: F_CODE });
      txt('email', -90, 60, 24, '#8f8aa8', { font: F_CODE }); txt(em, -90, 100, em.length > 6 ? 26 : 36, '#1b1433', { font: F_CODE });
      ctx.restore(); }
    if (t >= ph2) {
      arrow(1320, 700, 1420, 700, '#fff', prog(t, ph2 + 0.2, 0.3), 12);
      const g = popIn(t, ph2 + 0.3, 0.4); if (g > 0) { ctx.save(); ctx.translate(1640, 700); ctx.scale(g, g);
        box(-210, -150, 420, 300, 18, '#fff', '#d0d7de', 3); box(-210, -150, 420, 56, [18, 18, 0, 0], '#24292f'); txt('GitHub · Commits', 0, -122, 26, '#fff', { align: 'center' });
        const av = t >= P('G02_02', 0.5); ctx.fillStyle = av ? '#8fdcff' : '#d0d7de'; ctx.beginPath(); ctx.arc(-140, 0, 42, 0, 7); ctx.fill(); txt(av ? '🐟' : '?', -140, 4, 44, av ? '#000' : '#fff', { align: 'center', font: av ? EMOJI : F_FANCY, bold: false });
        txt('修好首页', -80, -20, 30, '#24292f', {}); txt((av ? 'dafeiyu' : 'unknown') + ' 提交于 刚刚', -80, 22, 22, '#57606a', {});
        if (av) note(0, 100, popIn(t, P('G02_02', 0.5)), '邮箱一致 → 头像 ✓', '#22c08b', { fs: 26 });
        ctx.restore(); }
    }
  } else if (t < ph4) {   // --global vs 当前仓库
    [['🌍 加 --global', '所有仓库都用', '~/.gitconfig', CFGC, 1000], ['📁 不加', '只管当前仓库', '.git/config', TOOLC, 1560]].forEach((c, i) => {
      const s = popIn(t, ph3 + 0.1 + i * 0.5, 0.4); const hi = i === 0 ? t < P('G02_03', 0.4) : t >= P('G02_03', 0.4);
      infoCard(c[4], 720, 500, 300, s, c[0], c[3], [[c[1], '#1b1433', 34], [c[2], '#57606a', 28, F_CODE]], { alpha: hi ? 1 : 0.55 });
    });
  } else {
    const s = popIn(t, P('G02_04', 0.7)); if (s > 0) { ctx.save(); ctx.translate(1280, 760); ctx.scale(s, s); fancy('设没设好，一眼就知道！', 0, 0, 62, t, -99, FX.yel); ctx.restore(); }
  }
};
SFX_FNS.push(() => { sfx(P('G02_01', 0.15), 'pop', 0.4); sfx(P('G02_01', 0.5), 'ding', 0.35); sfx(P('G02_01', 0.85), 'ding', 0.35); sfx(S('G02_02') + 0.2, 'swoosh_in', 0.4); sfx(P('G02_02', 0.5), 'sparkle', 0.5); sfx(S('G02_03'), 'pop', 0.4); sfx(S('G02_03') + 0.4, 'pop', 0.4); sfx(P('G02_04', 0.7), 'ding', 0.4); });

// ---- 技巧②：alias ----
const T_AL = retime([
  { t: 0, s: 'git config --global alias.st status', cmd: true },
  { t: 0, s: 'git st', cmd: true, dur: 0.25 },
  { t: 0, s: '{g}On branch main' },
  { t: 0, s: '{w}nothing to commit, working tree clean' },
  { t: 0, clear: true },
  { t: 0, s: 'git config --global alias.lg "log --oneline --graph --all"', cmd: true },
  { t: 0, s: 'git lg', cmd: true, dur: 0.25 },
  { t: 0, s: '{y}* e41a9c2 {c}(HEAD -> main){w} 今日推荐菜' },
  { t: 0, s: '{y}*   7d3e9a1{w} Merge branch fix-typo' },
  { t: 0, s: '{p}|\\' },
  { t: 0, s: '{p}| {y}* 9b8c7d6{w} 修复错别字' },
  { t: 0, s: '{p}|/' },
  { t: 0, s: '{y}* 5e6f7a8 {c}(tag: v1.0){w} 首页完成' },
], [['G03_01', 0.3], ['G03_02', 0.1], ['G03_02', 0.3], ['G03_02', 0.36], ['G03_04', 0.02], ['G03_04', 0.08], ['G03_04', 0.55], ['G03_04', 0.62], ['G03_04', 0.66], ['G03_04', 0.7], ['G03_04', 0.74], ['G03_04', 0.78], ['G03_04', 0.82]]);
SC.alias = (t, blk, en) => {
  bgLecture(t, ALC); lecturer(t, blk, en, blk.t0);
  const big = t >= S('G03_04') - 0.1;
  terminal(t, 680, 100, 1200, big ? 640 : 330, T_AL, { fs: 27, accent: ALC, title: '终端', alpha: eOut(prog(t, blk.t0, 0.3)) });
  if (t < S('G03_03') - 0.1) {
    const s1 = popIn(t, P('G03_01', 0.55)); if (s1 > 0) {
      pill(1020, 620, 'git status', '#ffd23f', s1, { fs: 44 }); txt('=', 1280, 620, 80 * s1, '#fff', { align: 'center', font: F_FANCY, bold: false });
      pill(1500, 620, 'git st', '#7cf07a', popIn(t, P('G03_01', 0.7)), { fs: 56 });
    }
    const s2 = popIn(t, P('G03_02', 0.55)); if (s2 > 0) { ctx.save(); ctx.translate(1280, 820); ctx.scale(s2, s2); box(-430, -55, 860, 110, 55, '#fff', ALC, 6); txt('少敲 4 个键 × 每天 58 次', 0, 2, 44, '#1b1433', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); }
  } else if (!big) {
    const s = popIn(t, S('G03_03'), 0.4); if (s > 0) { ctx.save(); ctx.translate(1280, 640); ctx.scale(s, s); box(-500, -60, 1000, 120, 20, '#1d1838', '#ff3b5c', 6); txt('alias.commit = status', 0, 2, 44, '#fff', { align: 'center', font: F_CODE }); bigX(0, 0, 70, '#ff3b5c', prog(t, P('G03_03', 0.35), 0.3)); ctx.restore(); }
    if (t >= P('G03_03', 0.5)) note(1280, 820, popIn(t, P('G03_03', 0.5)), '⚠ 别和已有命令重名', '#ffb020', { fs: 36 });
  } else if (t >= P('G03_04', 0.85)) fancy('一屏看完！', 1280, 860, 80, t, P('G03_04', 0.85), FX.yel);
};
SFX_FNS.push(() => { sfx(P('G03_01', 0.55), 'pop', 0.4); sfx(P('G03_01', 0.7), 'ding', 0.5); sfx(P('G03_02', 0.55), 'pop', 0.4); sfx(S('G03_03'), 'buzz', 0.5); sfx(P('G03_03', 0.35), 'stamp', 0.5); sfx(P('G03_04', 0.85), 'sparkle', 0.5); });

// ---- 技巧③：git diff ----
const T_DIFF = retime([
  { t: 0, s: 'git diff', cmd: true, dur: 0.3 },
  { t: 0, s: '{d}diff --git a/index.html b/index.html' },
  { t: 0, s: '{c}@@ -3,4 +3,5 @@' },
  { t: 0, s: '{w}  <h1>白饭页</h1>' },
  { t: 0, s: '{r}- <p>今日推荐：百饭</p>' },
  { t: 0, s: '{g}+ <p>今日推荐：白饭</p>' },
  { t: 0, s: '{g}+ <p>新菜：咸鱼拌饭</p>' },
  { t: 0, clear: true },
  { t: 0, s: 'git diff --stat', cmd: true, dur: 0.4 },
  { t: 0, s: '{w} index.html | 3 {g}++{r}-' },
  { t: 0, s: '{w} style.css  | 8 {g}++++++{r}--' },
  { t: 0, s: '{w} 2 files changed, {g}7 insertions(+){w}, {r}3 deletions(-)' },
  { t: 0, clear: true },
  { t: 0, s: 'git diff v1.0 v1.1 --stat', cmd: true, dur: 0.5 },
  { t: 0, s: '{w} index.html | 12 {g}+++++++++{r}---' },
  { t: 0, s: '{w} menu.html  | 20 {g}++++++++++++++++++++' },
], [['G04_01', 0.05], ['G04_01', 0.12], ['G04_01', 0.16], ['G04_01', 0.2], ['G04_01', 0.3], ['G04_01', 0.5], ['G04_01', 0.56], ['G04_03', 0.05], ['G04_03', 0.1], ['G04_03', 0.5], ['G04_03', 0.56], ['G04_03', 0.66], ['G04_04', 0.15], ['G04_04', 0.25], ['G04_04', 0.5], ['G04_04', 0.56]]);
SC.diff = (t, blk, en) => {
  bgLecture(t, DIFC); lecturer(t, blk, en, blk.t0);
  terminal(t, 680, 100, 1200, 430, T_DIFF, { fs: 28, accent: DIFC, title: '终端 — 提交前看一眼', alpha: eOut(prog(t, blk.t0, 0.3)) });
  const p2 = S('G04_02') - 0.1, p3 = S('G04_03') - 0.1, p4 = S('G04_04') - 0.1;
  if (t < p2) {
    pill(1050, 650, '红 = 删掉的', '#ff6b81', popIn(t, P('G04_01', 0.3)), { font: F_BODY, fs: 40 });
    pill(1500, 650, '绿 = 新加的', '#7cf07a', popIn(t, P('G04_01', 0.5)), { font: F_BODY, fs: 40 });
    if (t >= P('G04_01', 0.75)) fancy('一目了然！', 1280, 820, 76, t, P('G04_01', 0.75), FX.yel);
  } else if (t < p3) {
    const a = prog(t, p2, 0.3); const zs = [[960, '工作区', '#3ec1ff'], [1280, '暂存区', '#ffd23f'], [1600, '仓库', '#ff7a3d']];
    zs.forEach((z, i) => miniZone(z[0], 720, 260, 190, z[1], z[2], clamp(a * 3 - i * 0.3), (i < 2 && t < P('G04_02', 0.3)) || (i > 0 && t >= P('G04_02', 0.3))));
    const b1 = popIn(t, p2 + 0.3), b2 = popIn(t, P('G04_02', 0.35));
    if (b1 > 0) { seg(960, 850, 1280, 850, '#3ec1ff', clamp(b1), 8); pill(1120, 900, 'git diff', '#3ec1ff', b1, { fs: 30 }); }
    if (b2 > 0) { seg(1280, 600, 1600, 600, '#ffd23f', clamp(b2), 8); pill(1440, 560, 'git diff --staged', '#ffd23f', b2, { fs: 30 }); }
  } else if (t < p4) {
    note(1280, 700, popIn(t, P('G04_03', 0.6)), '只看文件名 + 改了多少', DIFC, { fs: 38 });
  } else {
    const s = popIn(t, P('G04_04', 0.2)); verTag(980, 720, 0.8 * s, 'v1.0'); verTag(1460, 720, 0.8 * popIn(t, P('G04_04', 0.3)), 'v1.1');
    if (t >= P('G04_04', 0.35)) { arrow(1180, 720, 1400, 720, '#fff', prog(t, P('G04_04', 0.35), 0.3), 12); txt('⇄', 1290, 660, 50, '#fff', { align: 'center', font: EMOJI, bold: false }); }
    if (t >= P('G04_04', 0.7)) fancy('上集的标签用上了！', 1280, 880, 66, t, P('G04_04', 0.7), FX.yel);
  }
};
SFX_FNS.push(() => { sfx(P('G04_01', 0.3), 'pop', 0.4); sfx(P('G04_01', 0.5), 'pop', 0.4); sfx(P('G04_01', 0.75), 'ding', 0.4); sfx(S('G04_02'), 'swoosh_in', 0.4); sfx(P('G04_02', 0.35), 'pop', 0.4); sfx(P('G04_03', 0.6), 'pop', 0.4); sfx(P('G04_04', 0.2), 'pop', 0.4); sfx(P('G04_04', 0.3), 'pop', 0.4); sfx(P('G04_04', 0.7), 'sparkle', 0.5); });

// ---- 技巧④：.gitignore 补救 ----
const T_IGN = retime([
  { t: 0, s: 'git rm -r --cached node_modules', cmd: true },
  { t: 0, s: "{d}rm 'node_modules/...'（共 1342 个文件）" },
  { t: 0, s: 'git commit -m "不再跟踪 node_modules"', cmd: true },
  { t: 0, clear: true },
  { t: 0, s: 'git check-ignore -v node_modules', cmd: true },
  { t: 0, s: '{y}.gitignore:1:node_modules/{w}    node_modules' },
], [['G05_02', 0.08], ['G05_02', 0.35], ['G05_02', 0.82], ['G05_03', 0.05], ['G05_03', 0.25], ['G05_03', 0.55]]);
SC.ignore = (t, blk, en) => {
  bgLecture(t, IGC); lecturer(t, blk, en, blk.t0);
  const p2 = S('G05_02') - 0.1, p4 = S('G05_04') - 0.1;
  if (t >= p2 && t < p4) terminal(t, 680, 100, 1200, 300, T_IGN, { fs: 27, accent: IGC, title: '终端', alpha: eOut(prog(t, p2, 0.3)) });
  if (t < S('G05_03') - 0.1) {
    const top = t < p2 ? 0 : 1, by = lerp(480, 640, eIO(prog(t, p2, 0.4)));
    // 仓库框
    const rs = popIn(t, blk.t0 + 0.1, 0.4); if (rs > 0) { ctx.save(); ctx.translate(1000, by); ctx.scale(rs, rs);
      box(-280, -200, 560, 400, 24, 'rgba(255,255,255,0.1)', '#ff7a3d', 6); box(-200, -230, 400, 60, 18, '#ff7a3d', '#fff', 4); txt('仓库 · Git 在跟踪', 0, -199, 32, '#1b1433', { align: 'center', font: F_FANCY, bold: false });
      fileChip(-90, -60, 0.8, '📄', 'index.html', '#3ec1ff');
      ctx.restore(); }
    // node_modules：先在仓库里被盯着，然后飞到本地
    const fT = P('G05_02', 0.3); let nx = 1000 - 90, ny = by + 60;
    if (t >= fT) { const [x, y] = arcPos(t, fT, 0.6, nx, ny, 1600, by + 60, 160); nx = x; ny = y; }
    if (rs > 0) { fileChip(nx, ny, 0.8 * rs, '📁', 'node_modules', '#ff5c8a'); if (t < fT) txt('👀', nx + 210, ny - 50, 56 + Math.sin(t * 6) * 4, '#000', { align: 'center', font: EMOJI, bold: false }); }
    if (top === 0) {
      const gs = popIn(t, P('G05_01', 0.2)); if (gs > 0) { ctx.save(); ctx.translate(1620, 480); ctx.scale(gs, gs); ctx.rotate(0.04); box(-200, -110, 400, 220, 16, '#fff8c5', '#1b1433', 5); txt('.gitignore', 0, -60, 30, '#57606a', { align: 'center', font: F_CODE }); txt('node_modules/', 0, -6, 34, '#1b1433', { align: 'center', font: F_CODE }); txt('只管没跟踪的', 0, 60, 30, IGC, { align: 'center' }); ctx.restore(); }
      if (t >= P('G05_01', 0.6)) fancy('提交过的，一直盯着！', 1280, 900, 62, t, P('G05_01', 0.6), FX.pink);
    } else {
      const ls = popIn(t, p2 + 0.2, 0.4); if (ls > 0) { ctx.save(); ctx.translate(1600, by); ctx.scale(ls, ls); box(-240, -200, 480, 400, 24, 'rgba(255,255,255,0.1)', '#3ec1ff', 6); box(-170, -230, 340, 60, 18, '#3ec1ff', '#fff', 4); txt('本地文件夹', 0, -199, 32, '#1b1433', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); }
      if (t >= P('G05_02', 0.6)) stamp(t, P('G05_02', 0.6), 1600, by + 150, '文件还在 ✓', '#22c08b', 48, -0.08);
    }
  } else if (t < p4) {
    const s = popIn(t, P('G05_03', 0.6)); if (s > 0) { ctx.save(); ctx.translate(1280, 640); ctx.scale(s, s);
      box(-520, -90, 1040, 180, 22, '#fff', IGC, 6); txt('.gitignore 第 1 条规则', -480, -30, 40, '#1b1433', {}); txt('node_modules/  →  命中！', -480, 34, 34, IGC, { font: F_CODE }); ctx.restore(); }
    if (t >= P('G05_03', 0.8)) fancy('一查便知！', 1280, 860, 72, t, P('G05_03', 0.8), FX.yel);
  } else {   // GitHub 建仓库表单
    const s = popIn(t, p4 + 0.1, 0.4); if (s > 0) { ctx.save(); ctx.translate(1280, 520); ctx.scale(s, s); ctx.translate(-1280, -520);
      browser(720, 140, 1120, 720, 'github.com/new', { title: 'Create a new repository' });
      inputBox(780, 320, 600, 'Repository name', 'baifan');
      txt('Add .gitignore', 780, 450, 28, '#24292f', {});
      const open = t >= P('G05_04', 0.35);
      box(780, 480, 460, 58, 10, '#f6f8fa', open ? '#0969da' : '#d0d7de', open ? 4 : 2); txt('.gitignore template: ' + (t >= P('G05_04', 0.6) ? 'Node' : 'None'), 800, 510, 26, '#24292f', { font: F_CODE, bold: false });
      if (open && t < P('G05_04', 0.6)) { box(780, 545, 460, 230, 10, '#fff', '#d0d7de', 2); ['Node', 'Python', 'Java', 'Unity'].forEach((n, i) => { box(784, 550 + i * 56, 452, 52, 6, i === 0 ? '#ddf4ff' : '#fff'); txt(n, 806, 576 + i * 56, 26, '#24292f', { font: F_CODE, bold: false }); }); }
      cursor(lerp(1500, 1000, eIO(prog(t, P('G05_04', 0.2), 0.3))), lerp(800, open && t < P('G05_04', 0.6) ? 576 : 510, eIO(prog(t, P('G05_04', 0.2), 0.3))), 1.2, (t >= P('G05_04', 0.32) && t < P('G05_04', 0.4)) || (t >= P('G05_04', 0.57) && t < P('G05_04', 0.65)) ? 1 : 0);
      ctx.restore(); }
    if (t >= P('G05_04', 0.7)) note(1500, 760, popIn(t, P('G05_04', 0.7)), '常见的都写好了 ✓', '#22c08b', { fs: 34 });
  }
};
SFX_FNS.push(() => { sfx(P('G05_01', 0.2), 'pop', 0.4); sfx(P('G05_01', 0.6), 'buzz', 0.4); sfx(P('G05_02', 0.3), 'whoosh', 0.5); sfx(P('G05_02', 0.6), 'stamp', 0.5); sfx(P('G05_03', 0.6), 'pop', 0.4); sfx(P('G05_03', 0.8), 'ding', 0.4); sfx(P('G05_04', 0.35), 'click', 0.5); sfx(P('G05_04', 0.6), 'click', 0.5); sfx(P('G05_04', 0.7), 'sparkle', 0.4); });

// ---- 复习：四个小技巧 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, GOLD); lecturer(t, blk, en, blk.t0);
  const cards = [['设身份', ['user.name', 'user.email', '--list']], ['起别名', ['st = status', 'lg = 分支图']], ['看改动', ['--staged', '--stat', 'v1.0 v1.1']], ['补救忽略', ['rm --cached', 'check-ignore', '建库选模板']]];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.08, 0.4); if (s <= 0) return; const on = P('G06_01', i * 0.24);
    const act = t >= on && (i === 3 || t < P('G06_01', (i + 1) * 0.24));
    const x = 840 + i * 300, y = 500, col = TIPS[i][2]; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= on ? 1 : 0.5;
    if (act) { ctx.shadowColor = col; ctx.shadowBlur = 40; } box(-135, -300, 270, 600, 26, '#fffaf0', col, 8); ctx.shadowBlur = 0;
    box(-135, -300, 270, 110, [26, 26, 0, 0], col); txt(TIPS[i][0], 0, -262, 44, '#000', { align: 'center', font: EMOJI, bold: false }); txt(TIPS[i][1], 0, -214, 28, '#fff', { align: 'center', font: F_CODE });
    txt(c[0], 0, -140, 40, '#1b1433', { align: 'center', font: F_FANCY, bold: false });
    c[1].forEach((l, k) => { const a = clamp(prog(t, on + 0.1 + k * 0.12, 0.2)); ctx.save(); ctx.globalAlpha *= 0.3 + 0.7 * a; box(-115, -80 + k * 120, 230, 96, 14, '#fff', '#e4dff5', 3); txt(l, 0, -32 + k * 120, /[\u4e00-\u9fff]/.test(l) ? 26 : 22, '#1b1433', { align: 'center', font: /[\u4e00-\u9fff]/.test(l) ? F_BODY : F_CODE, max: 210 }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= E('G06_01') - 0.3) fancy('四个小技巧 get！', 1290, 930, 62, t, E('G06_01') - 0.3, FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2, 3].forEach(i => { sfx(BK.recap.t0 + 0.1 + i * 0.08, 'pop', 0.3); sfx(P('G06_01', i * 0.24), 'ding', 0.35); }); sfx(E('G06_01') - 0.3, 'sparkle', 0.5); });

// ---- 实战：白饭页配一遍 ----
const T_PRAC = retime([
  { t: 0, s: 'git config --global user.name "dafeiyu"', cmd: true, dur: 0.5 },
  { t: 0, s: 'git config --global alias.st status', cmd: true, dur: 0.5 },
  { t: 0, s: 'git config --global alias.lg "log --oneline --graph --all"', cmd: true, dur: 0.6 },
  { t: 0, s: 'git st', cmd: true, dur: 0.25 },
  { t: 0, s: '{r}  modified:   node_modules/.package-lock.json' },
  { t: 0, s: 'git rm -r --cached node_modules', cmd: true, dur: 0.5 },
  { t: 0, s: 'echo node_modules/ >> .gitignore', cmd: true, dur: 0.5 },
  { t: 0, s: 'git add .', cmd: true, dur: 0.2 },
  { t: 0, s: 'git diff --staged --stat', cmd: true, dur: 0.4 },
  { t: 0, s: '{w} .gitignore | 1 {g}+' },
  { t: 0, s: 'git commit -m "配置好了"', cmd: true, dur: 0.4 },
  { t: 0, s: '{g}[main 3f2a1b0] 配置好了' },
], [['G07_01', 0.12], ['G07_01', 0.5], ['G07_01', 0.7], ['G07_02', 0.05], ['G07_02', 0.15], ['G07_02', 0.5], ['G07_02', 0.75], ['G07_03', 0.08], ['G07_03', 0.2], ['G07_03', 0.4], ['G07_03', 0.72], ['G07_03', 0.88]]);
SC.practice = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  const steps = [['身份', S('G07_01')], ['别名', P('G07_01', 0.45)], ['忽略', S('G07_02')], ['检查', S('G07_03')]];
  const end = S('D08') - 0.2;
  steps.forEach((s, i) => {
    const a = popIn(t, blk.t0 + 0.15 + i * 0.06); if (a <= 0) return;
    const x = 860 + i * 230, y = 88; const act = t < end && t >= s[1] && (i === 3 || t < steps[i + 1][1]); const done = t >= end || (i < 3 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1));
    box(-100, -32, 200, 64, 18, act ? '#ff7a3d' : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act ? '✓ ' : '') + s[0], 0, 2, 28, '#fff', { align: 'center' }); ctx.restore();
  });
  const ta = eOut(prog(t, blk.t0, 0.3));
  terminal(t, 676, 160, 820, 700, T_PRAC, { alpha: ta, fs: 21, accent: '#ff7a3d', title: '终端 — 白饭页' });
  ctx.save(); ctx.globalAlpha = ta;
  win(1510, 160, 390, 700, '白饭页 · 检查单', GOLD);
  [['名字和邮箱', P('G07_01', 0.3)], ['st / lg 别名', P('G07_01', 0.85)], ['node_modules', P('G07_02', 0.9)], ['提交前 diff', P('G07_03', 0.5)]].forEach((c, i) => {
    const y = 290 + i * 140, ok = t >= c[1];
    box(1540, y - 50, 330, 100, 16, ok ? '#173d2c' : '#1d1838', ok ? '#22c08b' : '#3a3358', ok ? 5 : 3);
    txt(ok ? '✅' : '⬜', 1585, y, 40, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[0], 1630, y, 26, ok ? '#7cf07a' : '#c9c3dd', { max: 230 });
  });
  ctx.restore();
  if (t < S('G07_01') + 0.6) fancy('实战开始！', 1280, 520, 110, t, blk.t0 + 0.2, Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_party', 1600, H + 30, 860, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    const bs = popIn(t, end + 0.05, 0.4); ctx.save(); ctx.translate(1060, 420); ctx.scale(bs, bs); ctx.rotate(-0.05);
    box(-280, -200, 560, 360, 26, '#0f0c1f', '#22c08b', 8); txt('$ git st', -240, -130, 34, '#7cf07a', { font: F_CODE });
    txt('On branch main', -240, -60, 32, '#ece9f7', { font: F_CODE }); txt('nothing to commit,', -240, 0, 32, '#ece9f7', { font: F_CODE }); txt('working tree clean ✨', -240, 60, 32, '#ffd36b', { font: F_CODE });
    ctx.restore();
    fancy('手不酸了，提交也干净了！', 1060, 780, 72, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 4; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(b.t0 + 0.2, 'impact', 0.6); [P('G07_01', 0.3), P('G07_01', 0.85), P('G07_02', 0.9), P('G07_03', 0.5)].forEach(x => sfx(x, 'ding', 0.4)); sfx(P('G07_02', 0.15), 'buzz', 0.4); sfx(S('D08') - 0.15, 'sparkle', 0.6); sfx(S('D08') + 0.2, 'confetti', 0.6); });

// ---- 预告 + 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#3e8ed0');
  const outro = E('G08_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G08_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G08_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G08_01', 0.12), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 470); ctx.scale(bp, bp); ctx.translate(-1260, -470);
      browser(860, 220, 800, 500, 'dafeiyu.github.io/baifan', { title: '白饭页', accent: '#3e8ed0' });
      txt('🍚 白饭页', 1260, 500, 70, '#24292f', { align: 'center', font: F_FANCY, bold: false });
      ['首页', '今日推荐菜', '关于'].forEach((n, i) => chip(960 + i * 200, 590, 1, n, ['#ff7a3d', '#22c08b', '#7c5cff'][i], '#fff', 26));
      ctx.restore(); }
    [['GitHub Pages', -520, 300, 0.4], ['免费网站', 520, 290, 0.55], ['push 就更新', -500, 640, 0.65], ['🌐 人人能访问', 510, 650, 0.75]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G08_01', c[3])), { fs: 34, font: /[\u4e00-\u9fff]/.test(c[0]) ? F_BODY : F_CODE }));
    fancy('第6集 · 白饭页变成真网站！', 1260, 830, 76, t, P('G08_01', 0.8), FX.pink);
  }
  if (ot > 0) {
    ctx.fillStyle = `rgba(10,8,22,${0.78 * ot})`; ctx.fillRect(...OS);
    [['👍', '点赞', '#ff5c8a'], ['🪙', '投币', '#ffd23f'], ['⭐', '收藏', '#3ec1ff']].forEach((ic, i) => {
      const a = popIn(t, S('G08_02') + 0.4 + i * 0.32, 0.4); if (a <= 0) return;
      const x = W / 2 + (i - 1) * 330, y = 440;
      ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(t * 5 + i) * 0.06);
      ctx.fillStyle = ic[2]; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.font = `110px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic[0], 0, 8); ctx.restore();
      fancy(ic[1], x, y + 180, 60, t, S('G08_02') + 0.5 + i * 0.32, { c1: '#fff', c2: '#eee', stroke: ic[2] });
    });
    fancy('一键三连，下集见！', W / 2, 180, 96, t, S('G08_02') + 1.4, { stagger: 0.04 });
    if (t > outro) {
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_tools', 280, H + 330, 980, { scale: sa }); sprite('d_party', 1690, H + 40, 640, { scale: sa }); }
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 920, W, 160); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆', W / 2, 960);
    ctx.fillText('DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》 · 非商用同人创作', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G08_01', 0.12), 'pop', 0.6); [0.4, 0.55, 0.65, 0.75].forEach(f => sfx(P('G08_01', f), 'pop', 0.4)); sfx(P('G08_01', 0.8), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G08_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G08_02') + 1.4, 'sparkle', 0.6); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_sparkle', P('G02_02', 0.6), E('G02_02')], ['d_happy', P('G03_02', 0.5), E('G03_02')],
  ['d_ok', P('G04_04', 0.55), E('G04_04')], ['d_relief', P('G05_02', 0.7), E('G05_02')],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));
