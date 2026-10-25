// AI娘 Git课 样片引擎 —— 纯函数渲染：renderAt(t) 只依赖 t，可逐帧确定性导出
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

// ---------- 字体 ----------
const F_FANCY = '"Smiley", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const F_BODY = '"Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const F_CODE = 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", monospace';

// ---------- 素材 ----------
const SPR = {};
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'd_panic', 'd_curious', 'd_happy'];
function loadImg(n) {
  return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });
}

// ---------- 时间轴 ----------
// 台词时长（秒）由导出脚本注入 window.DUR；缺省用估计值
const DUR = Object.assign({ d1: 2.6, g1: 3.81, g2: 4.57, g3: 5.37, d2: 2.8, g4: 5.68, d3: 2.4, g5: 4.11, d4: 2.6, g6: 3.75 }, window.DUR || {});
const SEQ = [
  { id: 'd1', scene: 'panic', who: 'd', text: '完了完了！我的论文又改崩了！' },
  { id: 'g1', scene: 'title', who: 'g', text: '别慌！今天教你 Git 的三步魔法！' },
  { id: 'g2', scene: 'work', who: 'g', text: '第一步，工作区！你正在改的文件，都在这里。' },
  { id: 'g3', scene: 'add', who: 'g', text: '第二步，git add！把想保存的改动，放进暂存区。' },
  { id: 'd2', scene: 'box', who: 'd', text: '就像把要寄的东西，先放进快递箱？' },
  { id: 'g4', scene: 'commit', who: 'g', text: '没错！第三步，git commit！封箱贴单，存成一个快照！' },
  { id: 'd3', scene: 'worry', who: 'd', text: '那以后要是又改崩了……' },
  { id: 'g5', scene: 'rewind', who: 'g', text: '以后不管怎么改崩，随时都能回到这个存档点！' },
  { id: 'd4', scene: 'happy', who: 'd', text: '学会了！原来存档这么简单！' },
  { id: 'g6', scene: 'teaser', who: 'g', text: '下集预告：后悔药，git restore！' },
];
const LEAD = 0.22, TAIL = 0.18, OUTRO = 2.4;
let T = 0.0;
SEQ.forEach((s, i) => {
  s.t0 = T; s.vo = T + (i === 0 ? 0.45 : LEAD); s.dur = DUR[s.id];
  s.t1 = s.vo + s.dur + TAIL; T = s.t1;
});
SEQ[SEQ.length - 1].t1 += OUTRO;
const TOTAL = SEQ[SEQ.length - 1].t1;
const SC = {}; SEQ.forEach(s => SC[s.scene] = s);

// 音效清单（导出脚本读取后混音）
const SFX = [];
function sfx(t, name, gain = 1) { SFX.push({ t: +t.toFixed(3), name, gain }); }
(function buildSfx() {
  SEQ.forEach((s, i) => { if (i > 0) sfx(s.t0 - 0.12, 'whoosh', 0.55); });
  const p = SC.panic, ti = SC.title, wk = SC.work, ad = SC.add, bx = SC.box, cm = SC.commit, wo = SC.worry, rw = SC.rewind, hp = SC.happy, tz = SC.teaser;
  sfx(p.t0 + 0.05, 'boom', 0.9); for (let k = 0; k < 6; k++) sfx(p.t0 + 0.35 + k * 0.28, 'pop', 0.25);
  sfx(ti.t0 + 0.1, 'swoosh_in', 0.5); sfx(ti.vo + 1.05, 'impact', 1.0);
  [0, 1, 2].forEach(k => sfx(ti.vo + 1.6 + k * 0.18, 'pop', 0.5));
  [0, 1, 2].forEach(k => sfx(wk.t0 + 0.1 + k * 0.1, 'pop', 0.35));
  [0, 1, 2].forEach(k => sfx(wk.vo + 1.3 + k * 0.22, 'pop', 0.45));
  for (let k = 0; k < 16; k++) sfx(ad.vo + 0.05 + k * 0.065, 'type', 0.35);
  sfx(ad.vo + 1.55, 'whoosh', 0.5); sfx(ad.vo + 2.15, 'ding', 0.6);
  sfx(bx.t0 + 0.2, 'pop', 0.6); sfx(bx.vo + 1.2, 'boing', 0.5);
  for (let k = 0; k < 22; k++) sfx(cm.vo + 0.6 + k * 0.05, 'type', 0.3);
  sfx(cm.vo + 2.2, 'tape', 0.7); sfx(cm.vo + 3.0, 'stamp', 0.9); sfx(cm.vo + 3.6, 'whoosh', 0.5); sfx(cm.vo + 4.15, 'shutter', 1.0);
  sfx(wo.t0 + 0.15, 'glitch', 0.8); sfx(wo.vo + 1.0, 'crack', 0.8);
  sfx(rw.vo + 0.2, 'rewind', 0.8); sfx(rw.vo + 2.0, 'ding', 0.7);
  sfx(hp.t0 + 0.05, 'impact', 0.8); sfx(hp.t0 + 0.1, 'confetti', 0.7);
  sfx(tz.t0 + 0.15, 'impact', 0.7); sfx(tz.vo + 1.3, 'pop', 0.6);
  const oS = tz.vo + tz.dur + 0.15;
  [0, 1, 2].forEach(k => sfx(oS + k * 0.32, 'coin', 0.6));
})();

// ---------- 工具函数 ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const prog = (t, a, d) => clamp((t - a) / d);
const eOut = x => 1 - Math.pow(1 - x, 3);
const eIn = x => x * x * x;
const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eBack = x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const spring = x => x <= 0 ? 0 : 1 - Math.exp(-7 * x) * Math.cos(15 * x);
function rnd(i) { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function noise(t, seed) { return Math.sin(t * 23.1 + seed) * .5 + Math.sin(t * 37.7 + seed * 2.1) * .3 + Math.sin(t * 61.3 + seed * 3.7) * .2; }

function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// ---------- 背景 ----------
function bgBurst(t, c1, c2, cx = W / 2, cy = H / 2, n = 24, spd = 0.25) {
  ctx.fillStyle = c1; ctx.fillRect(-140, -140, W + 280, H + 280);
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * spd);
  ctx.fillStyle = c2;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 2400, Math.sin(a) * 2400);
    ctx.lineTo(Math.cos(a + Math.PI / n) * 2400, Math.sin(a + Math.PI / n) * 2400);
    ctx.fill();
  }
  ctx.restore();
  const g = ctx.createRadialGradient(cx, cy, 100, cx, cy, 1200);
  g.addColorStop(0, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = g; ctx.fillRect(-140, -140, W + 280, H + 280);
}
function bgDots(t, base, dot, size = 6, gap = 44, drift = 30) {
  ctx.fillStyle = base; ctx.fillRect(-140, -140, W + 280, H + 280);
  ctx.fillStyle = dot;
  const ox = (t * drift) % gap, oy = (t * drift * .6) % gap;
  for (let y = -3 * gap; y < H + 3 * gap; y += gap)
    for (let x = -3 * gap; x < W + 3 * gap; x += gap) {
      const r = size * (0.6 + 0.4 * Math.sin((x + y) * 0.004 + t * 2));
      ctx.beginPath(); ctx.arc(x + ox + ((y / gap) % 2) * gap / 2, y + oy, r, 0, 7); ctx.fill();
    }
}
function bgBoard(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2b2350'); g.addColorStop(1, '#1a1533');
  ctx.fillStyle = g; ctx.fillRect(-140, -140, W + 280, H + 280);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2;
  const off = (t * 20) % 60;
  for (let x = -60; x < W + 60; x += 60) { ctx.beginPath(); ctx.moveTo(x + off, 0); ctx.lineTo(x + off, H); ctx.stroke(); }
  for (let y = -60; y < H + 60; y += 60) { ctx.beginPath(); ctx.moveTo(0, y + off); ctx.lineTo(W, y + off); ctx.stroke(); }
  // 漂浮符号
  ctx.font = `bold 46px ${F_CODE}`; ctx.fillStyle = 'rgba(160,140,255,0.10)';
  const sy = ['{ }', '</>', '#', '$', '>_', '⎇', '+', '✓'];
  for (let i = 0; i < 14; i++) {
    const x = (rnd(i) * W + t * (20 + rnd(i + 9) * 30)) % (W + 200) - 100;
    const y = rnd(i + 3) * H;
    ctx.fillText(sy[i % sy.length], x, y + Math.sin(t + i) * 12);
  }
}

// ---------- 立绘 ----------
// x: 中心, by: 底边 y, h: 显示高度
function sprite(name, x, by, h, o = {}) {
  const im = SPR[name]; if (!im || !im.width) return;
  const w = h * im.width / im.height;
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.translate(x, by);
  if (o.rot) ctx.rotate(o.rot);
  const s = o.scale ?? 1; const sq = o.squash ?? 0;
  ctx.scale(s * (o.flip ? -1 : 1) * (1 - sq * .5), s * (1 + sq));
  if (o.tint) ctx.filter = o.tint;
  ctx.drawImage(im, -w / 2, -h, w, h);
  ctx.restore();
}
// 说话时的上下弹跳 + 呼吸
function talk(t, s) {
  const on = (t > s.vo && t < s.vo + s.dur) ? 1 : 0;
  return { bob: -Math.abs(Math.sin((t - s.vo) * 11)) * 10 * on, breath: Math.sin(t * 2.6) * 0.008 };
}

// ---------- 花字 ----------
// 逐字弹出，白边 + 深色描边 + 渐变填充 + 投影
function fancy(text, x, y, size, t, t0, o = {}) {
  const chars = [...text];
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  ctx.font = `${size}px ${o.font || F_FANCY}`;
  ctx.textBaseline = 'middle';
  const widths = chars.map(c => ctx.measureText(c).width * (o.spacing || 1));
  const total = widths.reduce((a, b) => a + b, 0);
  let cx = o.align === 'left' ? 0 : -total / 2;
  const fill1 = o.c1 || '#fff36b', fill2 = o.c2 || '#ff9d2e', stroke = o.stroke || '#3b1460';
  chars.forEach((c, i) => {
    const p = prog(t, t0 + i * (o.stagger ?? 0.05), 0.35);
    if (p <= 0) { cx += widths[i]; return; }
    const sc = eBack(p);
    const wob = o.wobble ? Math.sin(t * 9 + i * 1.3) * o.wobble : 0;
    ctx.save(); ctx.translate(cx + widths[i] / 2, wob); ctx.scale(sc, sc); ctx.rotate(Math.sin(i * 2.1) * 0.08);
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(30,10,60,0.45)'; ctx.fillText(c, size * 0.06, size * 0.08);
    ctx.lineWidth = size * 0.30; ctx.strokeStyle = '#ffffff'; ctx.strokeText(c, 0, 0);
    ctx.lineWidth = size * 0.16; ctx.strokeStyle = stroke; ctx.strokeText(c, 0, 0);
    const g = ctx.createLinearGradient(0, -size / 2, 0, size / 2); g.addColorStop(0, fill1); g.addColorStop(1, fill2);
    ctx.fillStyle = g; ctx.fillText(c, 0, 0);
    ctx.restore();
    cx += widths[i];
  });
  ctx.restore();
}

// ---------- 字幕 ----------
function subtitle(t, s) {
  if (t < s.vo - 0.05 || t > s.t1) return;
  const p = eOut(prog(t, s.vo - 0.05, 0.18));
  const isG = s.who === 'g';
  const name = isG ? 'GitHub娘' : '大肥鱼';
  const col = isG ? '#8b5cf6' : '#2f6fe0';
  ctx.save();
  ctx.font = `bold 46px ${F_BODY}`;
  const tw = ctx.measureText(s.text).width;
  const bw = tw + 90, bh = 92, bx = W / 2 - bw / 2, by = H - 128 + (1 - p) * 40;
  ctx.globalAlpha = p;
  ctx.fillStyle = 'rgba(20,14,40,0.82)'; rr(bx, by, bw, bh, 26); ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke();
  // 名牌
  ctx.font = `30px ${F_FANCY}`;
  const nw = ctx.measureText(name).width + 40;
  ctx.save(); ctx.translate(bx + 30, by - 18); ctx.rotate(-0.05);
  ctx.fillStyle = col; rr(0, -22, nw, 46, 14); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(name, 20, 2); ctx.restore();
  ctx.font = `bold 46px ${F_BODY}`; ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.fillText(s.text, W / 2, by + bh / 2 + 2);
  ctx.restore();
}

// ---------- 小物件 ----------
function docIcon(x, y, s, label, color = '#2f6fe0', o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(-46, -56, 100, 128, 12); ctx.fill();
  ctx.fillStyle = o.broken ? '#ffe1e1' : '#fff'; rr(-50, -64, 100, 128, 12); ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = '#2a2140'; ctx.stroke();
  ctx.fillStyle = color; rr(-34, -46, 46, 46, 8); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `bold 32px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label[0], -11, -22);
  ctx.fillStyle = '#c9c3dd'; for (let i = 0; i < 3; i++) { rr(-34, 12 + i * 14, 68 - i * 14, 7, 3); ctx.fill(); }
  if (o.broken) {
    ctx.strokeStyle = '#e02424'; ctx.lineWidth = 6; ctx.beginPath();
    ctx.moveTo(-50, -20); ctx.lineTo(-10, 0); ctx.lineTo(-24, 20); ctx.lineTo(20, 40); ctx.lineTo(8, 64); ctx.stroke();
  }
  if (o.name) { ctx.fillStyle = '#fff'; ctx.font = `bold 24px ${F_BODY}`; ctx.fillText(o.name, 0, 92); }
  ctx.restore();
}
function boxIcon(x, y, s, lid, o = {}) { // lid: 0 打开 → 1 合上
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-100, -50, 210, 150);
  // 后盖
  ctx.fillStyle = '#c98a4b';
  ctx.save(); ctx.translate(0, -60); ctx.scale(1, lerp(-0.6, 0.0001, lid)); ctx.fillRect(-105, 0, 210, 70); ctx.restore();
  ctx.fillStyle = '#e0a463'; ctx.fillRect(-105, -60, 210, 150);
  ctx.lineWidth = 6; ctx.strokeStyle = '#5a3412'; ctx.strokeRect(-105, -60, 210, 150);
  // 左右盖
  ['L', 'R'].forEach((k, i) => {
    ctx.save(); ctx.translate(k === 'L' ? -105 : 105, -60);
    const a = lerp(k === 'L' ? -2.4 : 2.4, 0, eOut(clamp(lid * 1.3 - i * 0.2)));
    ctx.rotate(a); ctx.fillStyle = '#d39554';
    ctx.fillRect(k === 'L' ? 0 : -105, -8, 105, 16); ctx.strokeRect(k === 'L' ? 0 : -105, -8, 105, 16);
    ctx.restore();
  });
  if (o.tape > 0) { ctx.fillStyle = '#f5e6b8'; ctx.fillRect(-14, -68, 28, 160 * o.tape); ctx.strokeStyle = '#a8894a'; ctx.lineWidth = 3; ctx.strokeRect(-14, -68, 28, 160 * o.tape); }
  if (o.label > 0) {
    ctx.save(); ctx.translate(48, 30); ctx.rotate(-0.12); const ls = eBack(o.label) ; ctx.scale(ls, ls);
    ctx.fillStyle = '#fff'; ctx.fillRect(-48, -26, 96, 52); ctx.strokeStyle = '#e02424'; ctx.lineWidth = 4; ctx.strokeRect(-48, -26, 96, 52);
    ctx.fillStyle = '#e02424'; ctx.font = `bold 26px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('第一版', 0, 1);
    ctx.restore();
  }
  ctx.restore();
}
function commitNode(x, y, s, hash, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.glow) { ctx.fillStyle = `rgba(255,230,90,${0.35 * o.glow})`; ctx.beginPath(); ctx.arc(0, 0, 80 + 20 * Math.sin(o.t * 8), 0, 7); ctx.fill(); }
  ctx.fillStyle = '#ff7a3d'; ctx.beginPath(); ctx.arc(0, 0, 46, 0, 7); ctx.fill();
  ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = `bold 40px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('✓', 0, 2);
  ctx.font = `bold 26px ${F_CODE}`; ctx.fillStyle = '#ffd36b'; ctx.fillText(hash, 0, 78);
  ctx.restore();
}
function star(x, y, r, n = 5) { ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n - Math.PI / 2, rr2 = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } ctx.closePath(); }
function confetti(t, t0, n = 90, seed = 0) {
  const dt = t - t0; if (dt < 0) return;
  for (let i = 0; i < n; i++) {
    const a = rnd(i + seed) * Math.PI * 2, sp = 500 + rnd(i + seed + 50) * 900;
    const x = W / 2 + Math.cos(a) * sp * dt, y = H * 0.55 + Math.sin(a) * sp * dt * 0.8 + 700 * dt * dt;
    ctx.save(); ctx.translate(x, y); ctx.rotate(dt * 8 + i);
    ctx.fillStyle = ['#ff5c8a', '#ffd23f', '#3ec1ff', '#7cf07a', '#b98bff'][i % 5];
    ctx.fillRect(-9, -5, 18, 10); ctx.restore();
  }
}
function speedLines(t, cx, cy, alpha = 1, col = '255,255,255') {
  ctx.save(); ctx.strokeStyle = `rgba(${col},${0.55 * alpha})`;
  for (let i = 0; i < 60; i++) {
    const a = rnd(i) * Math.PI * 2 + Math.floor(t * 20) * 0.37 * rnd(i + 7);
    const r0 = 420 + rnd(i + 3) * 260;
    ctx.lineWidth = 2 + rnd(i + 5) * 6;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * 1500, cy + Math.sin(a) * 1500); ctx.stroke();
  }
  ctx.restore();
}
function flash(t, t0, d = 0.25, col = '255,255,255') { const p = prog(t, t0, d); if (p > 0 && p < 1) { ctx.fillStyle = `rgba(${col},${(1 - p) * 0.85})`; ctx.fillRect(0, 0, W, H); } }

// ---------- 讲解板（工作区 / 暂存区 / 仓库）----------
const ZONES = [
  { key: 'work', title: '工作区', en: 'Working Dir', x: 905, col: '#3ec1ff' },
  { key: 'stage', title: '暂存区', en: 'Staging', x: 1290, col: '#ffd23f' },
  { key: 'repo', title: '仓库', en: 'Repository', x: 1675, col: '#ff7a3d' },
];
const ZY = 330, ZW = 350, ZH = 470;
function board(t, st) {
  // st: { appear, hi: key, dim, box: 0..1 }
  ZONES.forEach((z, i) => {
    const a = eBack(prog(t, st.appear + i * 0.09, 0.4));
    if (a <= 0) return;
    const hi = st.hi === z.key;
    const sc = a * (hi ? 1.05 + Math.sin(t * 6) * 0.01 : 1);
    ctx.save(); ctx.translate(z.x, ZY + ZH / 2); ctx.scale(sc, sc); ctx.translate(-ZW / 2, -ZH / 2);
    ctx.globalAlpha = (st.hi && !hi) ? 0.55 : 1;
    if (hi) { ctx.shadowColor = z.col; ctx.shadowBlur = 50; }
    ctx.fillStyle = 'rgba(255,255,255,0.10)'; rr(0, 0, ZW, ZH, 30); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = hi ? 8 : 5; ctx.strokeStyle = hi ? z.col : 'rgba(255,255,255,0.6)'; ctx.setLineDash(hi ? [] : [18, 12]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = z.col; rr(24, -30, ZW - 48, 64, 20); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.fillStyle = '#1b1433'; ctx.font = `44px ${F_FANCY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(z.title, ZW / 2, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `bold 24px ${F_CODE}`; ctx.fillText(z.en, ZW / 2, ZH - 30);
    ctx.restore();
  });
  // 箭头
  [0, 1].forEach(i => {
    const a = prog(t, st.appear + 0.3 + i * 0.1, 0.3); if (a <= 0) return;
    const x0 = ZONES[i].x + ZW / 2 + 4, x1 = ZONES[i + 1].x - ZW / 2 - 4, y = ZY + ZH / 2;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(x0, y - 10); ctx.lineTo(x1 - 6, y - 10); ctx.lineTo(x1 - 6, y - 20); ctx.lineTo(x1 + 8, y); ctx.lineTo(x1 - 6, y + 20); ctx.lineTo(x1 - 6, y + 10); ctx.lineTo(x0, y + 10); ctx.fill();
    ctx.restore();
  });
}
function terminal(t, cmd, t0, dur, y = 150) {
  const a = eOut(prog(t, t0 - 0.25, 0.25)); if (a <= 0) return;
  const n = Math.floor(clamp((t - t0) / dur) * [...cmd].length);
  const shown = '$ ' + [...cmd].slice(0, n).join('');
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * -40);
  const x = 735, w = 1110, h = 96;
  ctx.fillStyle = '#0d0b1a'; rr(x, y - h / 2, w, h, 20); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#7c5cff'; ctx.stroke();
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 32 + i * 30, y, 9, 0, 7); ctx.fill(); });
  ctx.font = `bold 46px ${F_CODE}`; ctx.textBaseline = 'middle'; ctx.fillStyle = '#7cf07a'; ctx.textAlign = 'left';
  ctx.fillText(shown, x + 130, y + 2);
  const cw = ctx.measureText(shown).width;
  if (Math.floor(t * 3) % 2 === 0 || n < [...cmd].length) { ctx.fillStyle = '#7cf07a'; ctx.fillRect(x + 134 + cw, y - 24, 22, 48); }
  ctx.restore();
}

// ---------- 镜头 ----------
function sceneShake(t, t0, amp, d) { const p = prog(t, t0, d); if (p <= 0 || p >= 1) return [0, 0]; const k = (1 - p) * amp; return [noise(t, 1) * k, noise(t, 5) * k]; }

const FILES = [{ l: 'W', c: '#2f6fe0', n: '论文.docx' }, { l: '图', c: '#22a06b', n: '图表.png' }, { l: 'P', c: '#e0452f', n: '参考.pdf' }];
function workFiles(t, appearT, o = {}) {
  FILES.forEach((f, i) => {
    if (o.skip && o.skip.includes(i)) return;
    const a = eBack(prog(t, appearT + i * 0.22, 0.4)); if (a <= 0) return;
    const x = 905 + (i - 1) * 105, y = ZY + 200 + (i % 2) * 120;
    docIcon(x, y + Math.sin(t * 3 + i) * 6, 0.9 * a, f.l, f.c, { rot: Math.sin(t * 2 + i) * 0.06, name: f.n, broken: o.broken && o.broken(i) });
  });
}

function drawScene(t) {
  const s = SEQ.find(s => t >= s.t0 && t < s.t1) || SEQ[SEQ.length - 1];
  const lt = t - s.t0;
  let [shx, shy] = [0, 0];
  ctx.save();

  switch (s.scene) {
    case 'panic': {
      [shx, shy] = sceneShake(t, s.t0, 30, 0.6);
      const k = noise(t, 9) * 6; shx += k; shy += noise(t, 3) * 6;
      ctx.translate(shx, shy);
      bgBurst(t, '#ff4d6d', '#ff8fa3', W / 2, H * 0.6, 22, 0.35);
      // 文件雨
      for (let i = 0; i < 16; i++) {
        const st = s.t0 + 0.25 + rnd(i) * 1.6; const dt = t - st; if (dt < 0) continue;
        const x = 80 + rnd(i + 20) * (W - 160), y = -150 + dt * (900 + rnd(i + 40) * 500);
        docIcon(x, y, 0.75 + rnd(i + 60) * 0.4, 'W', '#2f6fe0', { rot: dt * (rnd(i + 80) - .5) * 6, broken: i % 3 === 0 });
      }
      const p = spring(prog(t, s.t0, 0.9));
      const tk = talk(t, s);
      sprite('d_panic', W * 0.56 + noise(t, 2) * 5, H + 40 + tk.bob, 900, { scale: lerp(1.5, 1, p) * (1 + tk.breath) });
      fancy('完了完了！', 430, 210, 150, t, s.t0 + 0.35, { rot: -0.12, wobble: 6, c1: '#fff36b', c2: '#ffb000', stroke: '#8a0a2a' });
      fancy('论文_最终版_v8_真的最终.docx', 50, 420, 40, t, s.vo + 0.9, { rot: -0.08, stagger: 0.02, c1: '#ffffff', c2: '#dfe8ff', stroke: '#2a2140', font: F_BODY, align: 'left' });
      break;
    }
    case 'title': {
      [shx, shy] = sceneShake(t, s.vo + 1.05, 26, 0.45);
      ctx.translate(shx, shy);
      bgBurst(t, '#4b2bb3', '#5d3bd6', W * 0.62, H * 0.45, 28, 0.2);
      const ix = eBack(prog(t, s.t0, 0.5)), tk = talk(t, s);
      sprite('g_point', lerp(-400, 400, ix), H + 220 + tk.bob, 1180, { scale: 1 + tk.breath });
      const slam = prog(t, s.vo + 0.85, 0.2);
      if (slam > 0) {
        const sc = lerp(3.2, 1, eOut(slam)) + (slam >= 1 ? Math.sin(t * 5) * 0.015 : 0);
        ctx.save(); ctx.translate(1220, 380); ctx.scale(sc, sc); ctx.rotate(-0.06);
        ctx.globalAlpha = clamp(slam * 3);
        fancy('Git', -230, 0, 230, t, -99, { c1: '#ffffff', c2: '#ffd9c7', stroke: '#f05133' });
        fancy('三步魔法', 160, 20, 170, t, -99, { c1: '#fff36b', c2: '#ff9d2e', stroke: '#3b1460' });
        ctx.restore();
        speedLines(t, 1220, 380, 1 - prog(t, s.vo + 1.05, 0.6));
      }
      ['工作区', '暂存区', '仓库'].forEach((w, i) => {
        const a = eBack(prog(t, s.vo + 1.6 + i * 0.18, 0.35)); if (a <= 0) return;
        ctx.save(); ctx.translate(900 + i * 300, 640); ctx.scale(a, a); ctx.rotate((i - 1) * 0.06);
        ctx.fillStyle = ZONES[i].col; ctx.beginPath(); ctx.arc(0, 0, 105, 0, 7); ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = '#fff'; ctx.stroke();
        ctx.fillStyle = '#1b1433'; ctx.font = `90px ${F_FANCY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(i + 1, 0, -18);
        ctx.font = `34px ${F_FANCY}`; ctx.fillText(w, 0, 50); ctx.restore();
      });
      flash(t, s.vo + 1.05, 0.2);
      break;
    }
    case 'work': case 'add': case 'commit': case 'rewind': {
      bgBoard(t);
      const first = SC.work.t0;
      const tk = talk(t, s);
      // 讲师
      const pose = { work: 'g_explain', add: 'g_point', commit: 'g_point', rewind: 'g_wink' }[s.scene];
      const pin = eBack(prog(t, s.t0, 0.35));
      sprite(pose, 330, H + 260 + tk.bob + (1 - pin) * 120, 1200, { scale: (0.92 + 0.08 * pin) * (1 + tk.breath) });
      board(t, { appear: first + 0.05, hi: { work: 'work', add: 'stage', commit: 'repo', rewind: 'repo' }[s.scene] });
      if (s.scene === 'work') {
        workFiles(t, s.vo + 1.3);
        fancy('你改的文件都在这！', 1290, 960 - 70, 64, t, s.vo + 2.4, { stagger: 0.03, c1: '#bff3ff', c2: '#3ec1ff', stroke: '#13294b' });
      }
      if (s.scene === 'add') {
        terminal(t, 'git add 论文.docx', s.vo + 0.05, 1.05);
        workFiles(t, -99, { skip: t > s.vo + 1.5 ? [0] : [] });
        const p = prog(t, s.vo + 1.5, 0.6);
        if (p > 0) {
          const e = eIO(p);
          const x = lerp(800, 1290, e), y = lerp(ZY + 200, ZY + 250, e) - Math.sin(e * Math.PI) * 260;
          // 拖尾
          for (let k = 1; k < 6 && p < 1; k++) { const e2 = eIO(clamp(p - k * 0.04)); ctx.globalAlpha = 0.15; docIcon(lerp(800, 1290, e2), lerp(ZY + 200, ZY + 250, e2) - Math.sin(e2 * Math.PI) * 260, 1, 'W', '#2f6fe0'); }
          ctx.globalAlpha = 1;
          const land = spring(prog(t, s.vo + 2.1, 0.5));
          docIcon(x, y, p < 1 ? 1.1 : lerp(1.4, 1.1, land), 'W', '#2f6fe0', { rot: p < 1 ? e * 6.28 : 0, name: p >= 1 ? '论文.docx' : '' });
          if (p >= 1) fancy('+1', 1400, ZY + 120, 80, t, s.vo + 2.12, { c1: '#fff36b', c2: '#ffb000' });
        }
        fancy('先挑出要存的改动', 1290, 890, 64, t, s.vo + 2.6, { stagger: 0.03, c1: '#fff7c2', c2: '#ffd23f', stroke: '#4b3a00' });
      }
      if (s.scene === 'commit') {
        workFiles(t, -99, { skip: [0] });
        terminal(t, 'git commit -m "第一版"', s.vo + 0.6, 1.1);
        // 暂存区箱子：合盖→贴胶带→贴单→飞向仓库→变节点
        const lid = eOut(prog(t, s.vo + 1.7, 0.5)), tape = prog(t, s.vo + 2.2, 0.35), label = prog(t, s.vo + 3.0, 0.3);
        const fly = prog(t, s.vo + 3.6, 0.5);
        if (fly < 1) {
          const e = eIn(fly);
          const bx = lerp(1290, 1675, e), by = lerp(ZY + 270, ZY + 230, e) - Math.sin(e * Math.PI) * 200;
          if (lid < 0.6) docIcon(1290, ZY + 210 + lid * 60, 0.8, 'W', '#2f6fe0');
          boxIcon(bx, by, lerp(0.95, 0.4, e), lid, { tape, label });
        }
        const node = prog(t, s.vo + 4.1, 0.01);
        if (node > 0) {
          commitNode(1675, ZY + 230, spring(prog(t, s.vo + 4.1, 0.6)), 'a1b2c3d', { glow: 1, t });
          fancy('咔嚓！存档成功', 1480, 890, 70, t, s.vo + 4.2, { stagger: 0.03, c1: '#ffe0cc', c2: '#ff7a3d', stroke: '#4b1300' });
        }
        flash(t, s.vo + 4.12, 0.3);
      }
      if (s.scene === 'rewind') {
        // 坏掉的文件倒带复原
        const rp = prog(t, s.vo + 0.3, 1.4);
        workFiles(t, -99, { skip: [0], broken: () => rp < 0.75 });
        commitNode(1675, ZY + 230, 1, 'a1b2c3d', { glow: prog(t, s.vo + 1.7, 0.3), t });
        // HEAD 指针跳回
        const hp = eBack(prog(t, s.vo + 1.7, 0.45));
        ctx.save(); ctx.translate(1675, lerp(ZY - 120, ZY + 120, hp) - 30);
        ctx.globalAlpha = clamp(hp * 2);
        ctx.fillStyle = '#7cf07a'; rr(-70, -66, 140, 52, 16); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke();
        ctx.fillStyle = '#0d2a12'; ctx.font = `bold 32px ${F_CODE}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('HEAD', 0, -40);
        ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(14, -14); ctx.lineTo(0, 6); ctx.fillStyle = '#7cf07a'; ctx.fill();
        ctx.restore();
        // 倒带特效
        if (rp > 0 && rp < 1) {
          ctx.save(); ctx.globalAlpha = 0.9 * Math.sin(rp * Math.PI);
          ctx.fillStyle = 'rgba(120,200,255,0.08)';
          for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2);
          for (let i = 0; i < 5; i++) { const y = (rnd(i + Math.floor(t * 24)) * H); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(0, y, W, 4 + rnd(i) * 10); }
          ctx.font = `90px ${F_FANCY}`; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText('◀◀ REWIND', 760, 60);
          ctx.restore();
        }
        fancy('随时读档！', 1480, 890, 84, t, s.vo + 2.0, { c1: '#d6ffd2', c2: '#7cf07a', stroke: '#0d2a12', wobble: 3 });
      }
      break;
    }
    case 'box': {
      bgDots(t, '#ffe9a8', '#ffd36b', 7, 46, 40);
      const z = eIO(prog(t, s.t0, 0.4));
      // 暂存区 → 快递箱特写
      ctx.save(); ctx.translate(lerp(0, W * 0.38 - 1290 * 1.7, 0), 0);
      const bs = lerp(0.6, 1.9, z);
      const wig = Math.sin(t * 7) * 0.04;
      ctx.save(); ctx.translate(700, 620); ctx.rotate(wig); ctx.translate(-700, -620);
      boxIcon(700, 620, bs, 0, {});
      ctx.restore();
      docIcon(700, 540 - Math.abs(Math.sin(t * 5)) * 30, 1.2 * z, 'W', '#2f6fe0', { rot: -0.1 });
      ctx.restore();
      const p = spring(prog(t, s.t0 + 0.15, 0.8)), tk = talk(t, s);
      sprite('d_curious', lerp(W + 500, 1430, eOut(prog(t, s.t0 + 0.1, 0.4))), H + 30 + tk.bob, 860, { scale: lerp(1.2, 1, p) * (1 + tk.breath) });
      // 问号
      [0, 1, 2].forEach(i => {
        const a = eBack(prog(t, s.vo + 1.1 + i * 0.15, 0.35)); if (a <= 0) return;
        ctx.save(); ctx.translate(1180 + i * 120, 230 - i * 50 + Math.sin(t * 6 + i) * 10); ctx.scale(a, a); ctx.rotate(Math.sin(t * 4 + i) * 0.2);
        fancy('?', 0, 0, 110 - i * 15, t, -99, { c1: '#ffffff', c2: '#bcd6ff', stroke: '#1d3f8f' }); ctx.restore();
      });
      fancy('快递箱？', 520, 220, 130, t, s.vo + 1.3, { rot: -0.08, c1: '#fff6e0', c2: '#e0a463', stroke: '#5a3412' });
      break;
    }
    case 'worry': {
      bgBoard(t);
      ctx.save(); ctx.filter = 'grayscale(0.6) brightness(0.6)';
      board(t, { appear: -99 }); commitNode(1675, ZY + 230, 1, 'a1b2c3d', {});
      ctx.restore();
      workFiles(t, -99, { skip: [0], broken: () => t > s.vo + 1.0 });
      [shx, shy] = sceneShake(t, s.vo + 1.0, 24, 0.5);
      // 故障条
      const gl = 1 - prog(t, s.t0, 0.6);
      for (let i = 0; i < 9; i++) {
        if (rnd(i + Math.floor(t * 30)) > 0.5 * gl + 0.05) continue;
        const y = rnd(i * 3 + Math.floor(t * 30)) * H, h = 10 + rnd(i) * 60;
        ctx.drawImage(cv, 0, y, W, h, (rnd(i + 99) - .5) * 120, y, W, h);
      }
      ctx.fillStyle = 'rgba(200,0,40,0.18)'; ctx.fillRect(-140, -140, W + 280, H + 280);
      const tk = talk(t, s);
      ctx.translate(shx, shy);
      sprite('d_panic', lerp(W + 400, 1580, eOut(prog(t, s.t0, 0.3))), H + 60 + tk.bob, 760, { scale: 1 + tk.breath });
      fancy('又改崩了……', 520, 230, 120, t, s.vo + 0.4, { rot: -0.06, c1: '#ffd6d6', c2: '#ff4d6d', stroke: '#3a0010', wobble: 4 });
      break;
    }
    case 'happy': {
      [shx, shy] = sceneShake(t, s.t0, 22, 0.4);
      ctx.translate(shx, shy);
      bgBurst(t, '#3ec1ff', '#8fdcff', W / 2, H * 0.55, 24, 0.5);
      confetti(t, s.t0 + 0.05, 120, 3);
      const p = spring(prog(t, s.t0, 0.8)), tk = talk(t, s);
      sprite('d_happy', W / 2, H + 40 + tk.bob, 860, { scale: lerp(0.4, 1, p) * (1 + tk.breath) });
      fancy('学会了！', W / 2, 170, 170, t, s.vo, { c1: '#fff36b', c2: '#ffb000', stroke: '#13294b', wobble: 5 });
      // 星星
      for (let i = 0; i < 8; i++) {
        const a = eBack(prog(t, s.t0 + 0.2 + i * 0.08, 0.3)); if (a <= 0) continue;
        ctx.save(); ctx.fillStyle = '#fff36b'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
        const x = W / 2 + Math.cos(i / 8 * 6.28) * 720, y = H * 0.5 + Math.sin(i / 8 * 6.28) * 380;
        star(x, y, 40 * a * (1 + 0.15 * Math.sin(t * 8 + i))); ctx.fill(); ctx.stroke(); ctx.restore();
      }
      break;
    }
    case 'teaser': {
      const st = s.t0;
      ctx.fillStyle = '#16122b'; ctx.fillRect(0, 0, W, H);
      // 斜纹
      ctx.save(); ctx.translate((t * 120) % 160, 0); ctx.fillStyle = 'rgba(124,92,255,0.12)';
      for (let x = -400; x < W + 400; x += 160) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 80, 0); ctx.lineTo(x - 300, H); ctx.lineTo(x - 380, H); ctx.fill(); }
      ctx.restore();
      const outro = s.vo + s.dur + 0.15;
      const tk = talk(t, s);
      sprite('g_wink', lerp(-400, 360, eBack(prog(t, st, 0.45))), H + 240 + tk.bob, 1150, { scale: 1 + tk.breath });
      // 胶囊
      const cp = eBack(prog(t, s.vo + 1.2, 0.5));
      if (cp > 0) {
        ctx.save(); ctx.translate(1240, 560); ctx.scale(cp, cp); ctx.rotate(-0.5 + Math.sin(t * 3) * 0.1);
        ctx.fillStyle = '#ff5c8a'; rr(-170, -64, 170, 128, [64, 0, 0, 64]); ctx.fill();
        ctx.fillStyle = '#ffffff'; rr(0, -64, 170, 128, [0, 64, 64, 0]); ctx.fill();
        ctx.lineWidth = 9; ctx.strokeStyle = '#2a2140'; rr(-170, -64, 340, 128, 64); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; rr(-140, -44, 100, 22, 11); ctx.fill();
        ctx.restore();
      }
      fancy('下集预告', 1240, 150, 92, t, st + 0.1, { c1: '#ffffff', c2: '#d9ccff', stroke: '#7c5cff' });
      fancy('后悔药', 1240, 320, 140, t, s.vo + 0.9, { c1: '#ffd6e3', c2: '#ff5c8a', stroke: '#3a0020' });
      const rp = prog(t, s.vo + 1.6, 0.4);
      if (rp > 0) {
        ctx.save(); ctx.globalAlpha = rp; ctx.font = `bold 64px ${F_CODE}`; ctx.fillStyle = '#7cf07a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('$ git restore', 1240, 780 + (1 - eOut(rp)) * 30); ctx.restore();
      }
      // 一键三连
      const ot = prog(t, outro, 0.3);
      if (ot > 0) {
        ctx.fillStyle = `rgba(10,8,22,${0.75 * ot})`; ctx.fillRect(0, 0, W, H);
        const icons = [['👍', '点赞', '#ff5c8a'], ['🪙', '投币', '#ffd23f'], ['⭐', '收藏', '#3ec1ff']];
        icons.forEach((ic, i) => {
          const a = eBack(prog(t, outro + i * 0.32, 0.4)); if (a <= 0) return;
          const x = W / 2 + (i - 1) * 330, y = 500;
          ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(t * 5 + i) * 0.06);
          ctx.fillStyle = ic[2]; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
          ctx.font = `110px "Segoe UI Emoji","Noto Color Emoji",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic[0], 0, 8);
          ctx.restore();
          fancy(ic[1], x, y + 190, 60, t, outro + i * 0.32 + 0.1, { c1: '#fff', c2: '#eee', stroke: ic[2] });
        });
        fancy('一键三连，下集见！', W / 2, 230, 96, t, outro + 0.9, { stagger: 0.04 });
      }
      break;
    }
  }
  ctx.restore();

  // 转场：斜切色带（覆盖切点 ±0.16s）
  SEQ.forEach((sq, i) => {
    if (i === 0) return;
    const p = prog(t, sq.t0 - 0.16, 0.32); if (p <= 0 || p >= 1) return;
    const cols = ['#ffd23f', '#7c5cff', '#3ec1ff', '#ff5c8a'];
    [0, 1].forEach(k => {
      const e = eIO(clamp(p * 1.15 - k * 0.12));
      const x = lerp(-W * 0.9, W * 1.9, e);
      ctx.fillStyle = k ? '#ffffff' : cols[i % cols.length];
      ctx.beginPath(); ctx.moveTo(x - 700, 0); ctx.lineTo(x + 300, 0); ctx.lineTo(x - 100, H); ctx.lineTo(x - 1100, H); ctx.fill();
    });
  });

  subtitle(t, s);
}

// ---------- 对外接口 ----------
window.TIMELINE = { total: TOTAL, seq: SEQ.map(s => ({ id: s.id, t0: s.t0, vo: s.vo, dur: s.dur, t1: s.t1 })), sfx: SFX };
window.renderAt = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  ctx.clearRect(0, 0, W, H);
  drawScene(Math.min(t, TOTAL - 1e-3));
};
window.ready = (async () => {
  await Promise.all(SPR_NAMES.map(loadImg));
  await document.fonts.load(`80px "Smiley"`, '完了');
  await document.fonts.ready;
  window.renderAt(0);
  return true;
})();

// 预览：直接打开页面时自动播放
if (!window.__EXPORT__) {
  window.ready.then(() => {
    const t0 = performance.now();
    (function loop() { const t = ((performance.now() - t0) / 1000) % TOTAL; window.renderAt(t); requestAnimationFrame(loop); })();
  });
}
