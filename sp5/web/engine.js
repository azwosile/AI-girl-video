// AI娘 Git课 · 番外5 渲染引擎 —— renderAt(t) 纯函数，逐帧确定性导出（通用部分沿用第1集）
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const F_FANCY = '"Smiley", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const F_BODY = '"Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const F_CODE = 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", "Microsoft YaHei", "Noto Sans CJK SC", monospace';

// ================= 素材 =================
const SPR = {};
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'g_cheer', 'g_warn', 'g_think', 'g_shock', 'g_proud', 'g_type', 'g_peace', 'g_awkward', 'g_present', 'd_panic', 'd_curious', 'd_happy', 'd_raise', 'd_think', 'd_shock', 'd_sparkle', 'd_ok', 'd_relief', 'd_leader', 'q_base', 'q_point', 'q_tea', 'c_base', 'c_ok', 'c_cool', 'm_base', 'm_panic', 'm_cheeky', 'x_base', 'x_angry', 'x_force', 'b_base', 'b_sorry', 'k_base', 'k_read', 'g_pill', 'd_pill', 'm_oops', 'q_alarm', 'b_wave', 'x_panic', 'k_diary', 'c_read', 'g_tag', 'd_party', 'b_proud', 'm_tag', 'x_thumb', 'k_scroll', 'g_web', 'd_phone', 'm_photo', 'x_doubt', 'b_point', 'g_check', 'd_robot', 'm_clock', 'c_lock', 'b_badge', 'g_scissors', 'd_tangle', 'd_film', 'b_squash', 'g_detective', 'd_detective', 'b_cherry', 'g_fork', 'd_medal', 'm_review', 'g_doctor', 'd_heavy', 'c_key', 'g_grad', 'd_grad', 'd_keys', 'g_mouse', 'g_term', 'g_hook', 'd_cloud'];
// 竖版立绘只显示上半身：显示高度占整张图的比例（头顶到腰）
const SPRC = { d_panic: 0.55, d_curious: 0.55, d_happy: 0.55, d_sparkle: 0.6, d_ok: 0.66, d_raise: 0.72, d_think: 0.7, d_relief: 0.82, d_shock: 0.82, d_leader: 0.7, q_base: 0.6, q_point: 0.6, q_tea: 0.6, c_base: 0.58, c_ok: 0.58, c_cool: 0.58, m_base: 0.62, m_panic: 0.6, m_cheeky: 0.62, x_base: 0.6, x_angry: 0.6, x_force: 0.66, b_base: 0.62, b_sorry: 0.62, k_base: 0.6, k_read: 0.6, d_pill: 0.6, m_oops: 0.62, q_alarm: 0.6, b_wave: 0.62, x_panic: 0.62, k_diary: 0.6, c_read: 0.58, d_party: 0.68, b_proud: 0.6, m_tag: 0.62, x_thumb: 0.66, k_scroll: 0.62, d_phone: 0.66, m_photo: 0.6, x_doubt: 0.62, b_point: 0.62, d_robot: 0.66, m_clock: 0.62, c_lock: 0.6, b_badge: 0.62, d_tangle: 0.62, d_film: 0.64, b_squash: 0.7, d_detective: 0.64, b_cherry: 0.62, d_medal: 0.64, m_review: 0.62, d_heavy: 0.66, c_key: 0.6, d_grad: 0.64, d_keys: 0.6, d_cloud: 0.64 };
const loadImg = n => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });


// ================= 台词（由 subtitles.json 生成，改台词请改 _gen_script.py）=================
const TEXT = {
  D01: "翻提交历史：“修改”“改了点”“再改一下”……我自己都看不懂当时改了啥！",
  G01_01: "提交说明是写给未来的自己看的。今天学一套通用写法，再让 Git 钩子帮你自动把关。",
  G01_02: "欢迎来到 AI娘 Git 课番外五：提交规范与钩子！",
  D02: "好的说明长什么样？",
  G02_01: "第一行是标题：五十个字符以内，说清楚做了什么；空一行，再写为什么要改。",
  G02_02: "标题直接写动作：“修复登录按钮错位”；别写“修改了一些东西”。",
  K01: "历史太长了。我想一眼找出所有修 bug 的提交。",
  D03: "能给提交分个类吗？",
  G03_01: "用约定式提交：类型、冒号、空格，再写描述。feat 是新功能，fix 是修 bug，docs 是改文档。",
  G03_02: "还能加范围：fix(login)；破坏性改动在类型后面加感叹号，比如 feat!。",
  G03_03: "格式统一以后，git log --grep \"^fix\" 就能筛出所有修复，工具还能据此自动生成更新日志。",
  K02: "一条一条，分得清清楚楚。",
  D04: "每次都要想格式，好麻烦……",
  G04_01: "写一个提交模板：git config commit.template 指向一个文本文件，不加 -m 提交时，编辑器里自动带上提示。",
  D05: "要是有人还是乱写呢？",
  G05_01: "用钩子把关：仓库的 .git/hooks 文件夹里，放一个叫 commit-msg 的脚本。",
  G05_02: "每次提交，Git 都会先跑它：格式不对就返回非零，这次提交直接被拒。",
  G05_03: "还有 pre-commit 钩子：提交前自动跑检查，比如格式化、跑测试。",
  G05_04: ".git/hooks 不会跟着仓库走：团队要共享，就把钩子放进仓库里的文件夹，再用 core.hooksPath 指过去。",
  G05_05: "本地钩子能用 --no-verify 跳过，所以真正把关，还得靠第七集的 Actions 检查。",
  D06: "实战：给白饭页装上提交把关！",
  G06_01: "在仓库里建 .githooks 文件夹，写一个 commit-msg：不是 feat、fix、docs 开头，就拒绝。",
  G06_02: "git config core.hooksPath .githooks，再给脚本加上执行权限。",
  G06_03: "试一下：写“改了点东西”，被拒；改成“fix: 修复按钮错位”，提交成功！",
  D07: "历史终于看得懂了！",
  G07_01: "下个番外：不用装任何软件，在网页里按一个键就能写代码。",
  G07_02: "喜欢的话，一键三连！我们下个番外见！",
};
const DUR = Object.assign({}, window.DUR || {});

// ================= 时间轴 =================
const V = (b, id, pose) => ({ k: 'v', b, id, pose });
const BEAT = (b, d) => ({ k: 'beat', b, d: b === 'teaser' ? d * 0.75 : d * 0.35 });
const CH_COL = ['#7c5cff', '#3ec1ff', '#22c08b', '#ffb020', '#ff5c8a', '#ff7a3d', '#a66bff', '#ffd23f'];
const PLAN = [
  V('cold', 'D01', 'd_panic'),
  V('why', 'G01_01', 'g_explain'),
  V('title', 'G01_02', 'g_hook'), BEAT('title', 1.2),
  V('msgQ', 'D02', 'd_curious'),
  V('msg', 'G02_01', 'g_type'), V('msg', 'G02_02', 'g_warn'),
  V('typeQ', 'K01', 'k_scroll'), V('typeQ', 'D03', 'd_think'),
  V('type', 'G03_01', 'g_explain'), V('type', 'G03_02', 'g_point'), V('type', 'G03_03', 'g_detective'), V('type', 'K02', 'k_read'),
  V('tmplQ', 'D04', 'd_heavy'),
  V('tmpl', 'G04_01', 'g_wink'),
  V('hookQ', 'D05', 'd_think'),
  V('hook', 'G05_01', 'g_hook'), V('hook', 'G05_02', 'g_warn'), V('hook', 'G05_03', 'g_hook'), V('hook', 'G05_04', 'g_explain'), V('hook', 'G05_05', 'g_check'),
  V('askP', 'D06', 'd_leader'),
  V('practice', 'G06_01', 'g_type'), V('practice', 'G06_02', 'g_point'), V('practice', 'G06_03', 'g_proud'), V('practice', 'D07', 'd_sparkle'),
  V('teaser', 'G07_01', 'g_present'), V('teaser', 'G07_02', 'g_cheer'), BEAT('teaser', 8),
];
const GAP_SAME = 0.2, GAP_SWITCH = 0.25, GAP_BLOCK = 0.18;   // v2：句与句之间留一点气口，不连读
const U = {}, BLOCKS = [], ENTRIES = [];
(function build() {
  let T = 0, prev = null;
  PLAN.forEach((e, i) => {
    const en = Object.assign({}, e);
    let gap = 0;
    if (prev) {
      if (prev.b !== en.b) gap = (en.k === 'card' || prev.k === 'card' || prev.k === 'sum') ? 0.05 : GAP_BLOCK;
      else if (en.k === 'v' && prev.k === 'v') gap = (prev.id[0] !== en.id[0]) ? GAP_SWITCH : GAP_SAME;
      else gap = 0.1;
    } else gap = 0.5;
    en.t0 = T; T += gap; en.vo = T;
    en.dur = en.k === 'v' ? (DUR[en.id] || TEXT[en.id].length * 0.2) : en.d;
    T += en.dur; en.t1 = T;
    if (en.k === 'v') U[en.id] = en;
    ENTRIES.push(en);
    let blk = BLOCKS[BLOCKS.length - 1];
    if (!blk || blk.b !== en.b) { blk = { b: en.b, t0: en.t0, entries: [] }; BLOCKS.push(blk); }
    blk.entries.push(en); blk.t1 = en.t1;
    prev = en;
  });
})();
const TOTAL = BLOCKS[BLOCKS.length - 1].t1;
const S = id => U[id].vo, E = id => U[id].vo + U[id].dur, D = id => U[id].dur;
const P = (id, f) => U[id].vo + U[id].dur * f;     // 句内比例时间
const BK = {}; BLOCKS.forEach(b => BK[b.b] = b);

// ================= 音效表 =================
const SFX = [];
const sfx = (t, name, gain = 1) => SFX.push({ t: +t.toFixed(3), name, gain });
function typeSfx(t, n, dur) { const k = Math.min(n, 18); for (let i = 0; i < k; i++) sfx(t + i * dur / k, 'type', 0.28); }

// ================= 工具 =================
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
const OS = [-140, -140, W + 280, H + 280];
function shake(t, t0, amp, d) { const p = prog(t, t0, d); if (p <= 0 || p >= 1) return [0, 0]; const k = (1 - p) * amp; return [noise(t, 1) * k, noise(t, 5) * k]; }
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }

// ================= 背景 =================
function bgBurst(t, c1, c2, cx = W / 2, cy = H / 2, n = 24, spd = 0.25) {
  ctx.fillStyle = c1; ctx.fillRect(...OS);
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * spd); ctx.fillStyle = c2;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 2600, Math.sin(a) * 2600); ctx.lineTo(Math.cos(a + Math.PI / n) * 2600, Math.sin(a + Math.PI / n) * 2600); ctx.fill(); }
  ctx.restore();
  const g = ctx.createRadialGradient(cx, cy, 100, cx, cy, 1300); g.addColorStop(0, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = g; ctx.fillRect(...OS);
}
function bgDots(t, base, dot, size = 7, gap = 46, drift = 30) {
  ctx.fillStyle = base; ctx.fillRect(...OS); ctx.fillStyle = dot;
  const ox = (t * drift) % gap, oy = (t * drift * .6) % gap;
  for (let y = -3 * gap; y < H + 3 * gap; y += gap) for (let x = -3 * gap; x < W + 3 * gap; x += gap) {
    const r = size * (0.6 + 0.4 * Math.sin((x + y) * 0.004 + t * 2)); ctx.beginPath(); ctx.arc(x + ox + ((y / gap) % 2) * gap / 2, y + oy, r, 0, 7); ctx.fill();
  }
}
function bgLecture(t, accent = '#7c5cff') {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2b2350'); g.addColorStop(1, '#17122e');
  ctx.fillStyle = g; ctx.fillRect(...OS);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2; const off = (t * 20) % 60;
  for (let x = -120; x < W + 120; x += 60) { ctx.beginPath(); ctx.moveTo(x + off, -140); ctx.lineTo(x + off, H + 140); ctx.stroke(); }
  for (let y = -120; y < H + 120; y += 60) { ctx.beginPath(); ctx.moveTo(-140, y + off); ctx.lineTo(W + 140, y + off); ctx.stroke(); }
  const rg = ctx.createRadialGradient(1300, 420, 50, 1300, 420, 900); rg.addColorStop(0, hexA(accent, 0.22)); rg.addColorStop(1, hexA(accent, 0));
  ctx.fillStyle = rg; ctx.fillRect(...OS);
  ctx.font = `bold 46px ${F_CODE}`; ctx.fillStyle = 'rgba(160,140,255,0.08)';
  const sy = ['{ }', '</>', '#', '$', '>_', '+', '✓', '*'];
  for (let i = 0; i < 14; i++) { const x = (rnd(i) * W + t * (20 + rnd(i + 9) * 30)) % (W + 200) - 100; ctx.fillText(sy[i % sy.length], x, rnd(i + 3) * H + Math.sin(t + i) * 12); }
}
function bgStripes(t, col, dark = '#16122b') {
  ctx.fillStyle = dark; ctx.fillRect(...OS);
  ctx.save(); ctx.translate((t * 160) % 180, 0); ctx.fillStyle = hexA(col, 0.18);
  for (let x = -600; x < W + 600; x += 180) { ctx.beginPath(); ctx.moveTo(x, -140); ctx.lineTo(x + 90, -140); ctx.lineTo(x - 380, H + 140); ctx.lineTo(x - 470, H + 140); ctx.fill(); }
  ctx.restore();
}

// ================= 立绘 =================
function sprite(name, x, by, h, o = {}) {
  const im = SPR[name]; if (!im || !im.width) return;
  const sh = im.height * (o.full ? 1 : (SPRC[name] || 1)); const w = h * im.width / sh;
  ctx.save(); ctx.globalAlpha = o.alpha ?? 1; ctx.translate(x, by);
  if (o.rot) ctx.rotate(o.rot);
  const s = o.scale ?? 1; ctx.scale(s * (o.flip ? -1 : 1), s);
  if (o.filter) ctx.filter = o.filter;
  ctx.drawImage(im, 0, 0, im.width, sh, -w / 2, -h, w, h); ctx.restore();
}
function talkBob(t, en) { return 0; }
function cameo(t, name, t0, t1, x = 1790, h = 400) {
  const pi = eOut(prog(t, t0, 0.3)), po = eIn(prog(t, t1, 0.25)); if (pi <= 0 || po >= 1) return;
  sprite(name, x, H + 30 + (1 - pi) * 480 + po * 480, h, { rot: -0.06 + (1 - pi) * 0.2, scale: breath(t, 2) });
}
function breath(t, seed = 0) { return 1 + Math.sin(t * 1.6 + seed) * 0.003; }

// ================= 花字 =================
function fancy(text, x, y, size, t, t0, o = {}) {
  const chars = [...text];
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  ctx.font = `${size}px ${o.font || F_FANCY}`; ctx.textBaseline = 'middle';
  const widths = chars.map(c => ctx.measureText(c).width * (o.spacing || 1));
  const total = widths.reduce((a, b) => a + b, 0);
  let cx = o.align === 'left' ? 0 : -total / 2;
  const fill1 = o.c1 || '#fff36b', fill2 = o.c2 || '#ff9d2e', stroke = o.stroke || '#3b1460';
  const out = o.out ? clamp(1 - (t - o.out) / 0.2) : 1;
  chars.forEach((c, i) => {
    const p = prog(t, t0 + i * (o.stagger ?? 0.04), 0.32);
    if (p <= 0 || out <= 0) { cx += widths[i]; return; }
    const sc = eBack(p) * out; const wob = o.wobble ? Math.sin(t * 9 + i * 1.3) * o.wobble : 0;
    ctx.save(); ctx.translate(cx + widths[i] / 2, wob); ctx.scale(sc, sc); ctx.rotate(Math.sin(i * 2.1) * 0.06);
    ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(30,10,60,0.45)'; ctx.fillText(c, size * 0.06, size * 0.08);
    ctx.lineWidth = size * 0.30; ctx.strokeStyle = '#ffffff'; ctx.strokeText(c, 0, 0);
    ctx.lineWidth = size * 0.16; ctx.strokeStyle = stroke; ctx.strokeText(c, 0, 0);
    const g = ctx.createLinearGradient(0, -size / 2, 0, size / 2); g.addColorStop(0, fill1); g.addColorStop(1, fill2);
    ctx.fillStyle = g; ctx.fillText(c, 0, 0); ctx.restore();
    cx += widths[i];
  });
  ctx.restore();
}
const FX = { // 常用花字配色
  yel: { c1: '#fff36b', c2: '#ffb000', stroke: '#3b1460' }, blue: { c1: '#d8f6ff', c2: '#3ec1ff', stroke: '#13294b' },
  green: { c1: '#e2ffd9', c2: '#5fe07a', stroke: '#0d3a1a' }, red: { c1: '#ffe0e0', c2: '#ff4d6d', stroke: '#3a0010' },
  orange: { c1: '#ffe9d6', c2: '#ff7a3d', stroke: '#4b1300' }, pink: { c1: '#ffe0ec', c2: '#ff5c8a', stroke: '#3a0020' },
  white: { c1: '#ffffff', c2: '#e6defa', stroke: '#5b3fd6' },
};

// ================= 字幕 =================
function subtitle(t) {
  const en = ENTRIES.find(e => e.k === 'v' && t >= e.vo - 0.05 && t < e.t1 + 0.25);
  if (!en) return;
  const p = eOut(prog(t, en.vo - 0.05, 0.16)) * clamp((en.t1 + 0.25 - t) / 0.12);
  const name = SQ[en.id[0]].n, col = SQ[en.id[0]].col;
  const text = TEXT[en.id];
  ctx.save();
  let fs = 46; ctx.font = `bold ${fs}px ${F_BODY}`; let tw = ctx.measureText(text).width;
  if (tw > 1640) { fs = Math.floor(46 * 1640 / tw); ctx.font = `bold ${fs}px ${F_BODY}`; tw = ctx.measureText(text).width; }
  const bw = tw + 90, bh = 92, bx = W / 2 - bw / 2, by = H - 124 + (1 - p) * 30;
  ctx.globalAlpha = p;
  ctx.fillStyle = 'rgba(20,14,40,0.84)'; rr(bx, by, bw, bh, 26); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.font = `30px ${F_FANCY}`; const nw = ctx.measureText(name).width + 40;
  ctx.save(); ctx.translate(bx + 30, by - 16); ctx.rotate(-0.05);
  ctx.fillStyle = col; rr(0, -22, nw, 46, 14); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(name, 20, 2); ctx.restore();
  ctx.font = `bold ${fs}px ${F_BODY}`; ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.fillText(text, W / 2, by + bh / 2 + 2);
  ctx.restore();
}

// ================= 组件 =================
function win(x, y, w, h, title, accent = '#7c5cff', o = {}) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; rr(x + 10, y + 14, w, h, 22); ctx.fill();
  ctx.fillStyle = o.bg || '#0f0c1f'; rr(x, y, w, h, 22); ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = accent; ctx.stroke();
  ctx.save(); rr(x, y, w, 58, [22, 22, 0, 0]); ctx.fillStyle = o.bar || '#1d1838'; ctx.fill(); ctx.restore();
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 32 + i * 28, y + 29, 9, 0, 7); ctx.fill(); });
  ctx.fillStyle = '#cfc8ef'; ctx.font = `bold 26px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(title, x + w / 2, y + 30);
  ctx.restore();
}
const TC = { r: '#ff6b81', g: '#7cf07a', y: '#ffd36b', c: '#6bd3ff', w: '#ece9f7', d: '#8f8aa8', p: '#c9a6ff' };
function colorText(str, x, y, def = 'w') {
  const parts = str.split(/\{([a-z])\}/); let col = TC[def], cx = x;
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) { col = TC[parts[i]] || col; continue; }
    if (!parts[i]) continue; ctx.fillStyle = col; ctx.fillText(parts[i], cx, y); cx += ctx.measureText(parts[i]).width;
  }
  return cx;
}
const plain = s => s.replace(/\{[a-z]\}/g, '');
// 终端：lines = [{t, s, cmd:true, dur}] / {t, clear:true}
function terminal(t, x, y, w, h, lines, o = {}) {
  const a = o.alpha ?? 1; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const sc = o.scale ?? 1; ctx.translate(x + w / 2, y + h / 2); ctx.scale(sc, sc); ctx.translate(-x - w / 2, -y - h / 2);
  win(x, y, w, h, o.title || '终端 — 论文', o.accent || '#7c5cff');
  let start = 0; lines.forEach((l, i) => { if (l.clear && t >= l.t) start = i + 1; });
  const vis = lines.slice(start).filter(l => !l.clear && t >= l.t);
  const fs = o.fs || 38, lh = fs * 1.42, maxL = Math.floor((h - 90) / lh);
  ctx.font = `bold ${fs}px ${F_CODE}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.save(); rr(x + 6, y + 62, w - 12, h - 68, 16); ctx.clip();
  const first = Math.max(0, vis.length - maxL);
  let last = null;
  vis.slice(first).forEach((l, i) => {
    const ly = y + 100 + i * lh;
    if (l.hl && t >= l.hl[0] && t < l.hl[1]) { const pp = 0.5 + 0.5 * Math.sin(t * 8); ctx.fillStyle = hexA(l.hlc || '#ff6b81', 0.16 + 0.12 * pp); rr(x + 18, ly - lh / 2 + 2, w - 36, lh - 4, 10); ctx.fill(); }
    if (l.cmd) {
      const n = Math.floor(clamp((t - l.t) / (l.dur || 0.8)) * [...l.s].length);
      ctx.fillStyle = TC.g; ctx.fillText('$', x + 30, ly);
      ctx.fillStyle = TC.w; const s = [...l.s].slice(0, n).join(''); ctx.fillText(s, x + 30 + fs * 0.9, ly);
      last = { x: x + 30 + fs * 0.9 + ctx.measureText(s).width, y: ly, typing: n < [...l.s].length };
    } else {
      const fa = clamp((t - l.t) / 0.12); ctx.globalAlpha = a * fa; colorText(l.s, x + 30 + (l.ind || 0), ly, l.c || 'w'); ctx.globalAlpha = a;
      last = null;
    }
  });
  if (last && (last.typing || Math.floor(t * 3) % 2 === 0)) { ctx.fillStyle = TC.g; ctx.fillRect(last.x + 6, last.y - fs * 0.5, fs * 0.5, fs); }
  if (!last && o.prompt !== false && vis.length) { const ly = y + 100 + Math.min(vis.length - first, maxL) * lh; if (ly < y + h - 20 && Math.floor(t * 3) % 2 === 0) { ctx.fillStyle = TC.g; ctx.fillText('$', x + 30, ly); ctx.fillRect(x + 30 + fs * 0.9, ly - fs * 0.5, fs * 0.5, fs); } }
  ctx.restore(); ctx.restore();
}
function cmdLines(arr) { // 生成终端行并登记打字音效
  arr.forEach(l => { if (l.cmd) { l.dur = l.dur || Math.min(1.3, 0.25 + [...l.s].length * 0.045); typeSfx(l.t, [...l.s].length, l.dur); } });
  return arr;
}
function docIcon(x, y, s, label, color = '#2f6fe0', o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= (o.alpha ?? 1);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(-46, -56, 100, 128, 12); ctx.fill();
  ctx.fillStyle = o.broken ? '#ffe1e1' : '#fff'; rr(-50, -64, 100, 128, 12); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#2a2140'; ctx.stroke();
  ctx.fillStyle = color; rr(-34, -46, 46, 46, 8); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `bold 30px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, -11, -22);
  ctx.fillStyle = '#c9c3dd'; for (let i = 0; i < 3; i++) { rr(-34, 12 + i * 14, 68 - i * 14, 7, 3); ctx.fill(); }
  if (o.name) { ctx.font = `bold ${o.nameSize || 24}px ${F_BODY}`; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(15,12,31,0.9)'; ctx.strokeText(o.name, 0, 94); ctx.fillStyle = o.nameCol || '#fff'; ctx.fillText(o.name, 0, 94); }
  ctx.restore();
}
function folderIcon(x, y, s, col = '#ffc94d', o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= (o.alpha ?? 1);
  ctx.fillStyle = shade(col); rr(-40, -30, 36, 14, 4); ctx.fill();
  ctx.fillStyle = col; rr(-40, -22, 80, 56, 8); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#2a2140'; ctx.stroke();
  ctx.restore();
}
function shade(c) { return c === '#ffc94d' ? '#e0a52a' : '#8a7fb0'; }
function boxIcon(x, y, s, lid, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-100, -50, 210, 150);
  ctx.fillStyle = '#e0a463'; ctx.fillRect(-105, -60, 210, 150); ctx.lineWidth = 6; ctx.strokeStyle = '#5a3412'; ctx.strokeRect(-105, -60, 210, 150);
  ['L', 'R'].forEach((k, i) => {
    ctx.save(); ctx.translate(k === 'L' ? -105 : 105, -60);
    ctx.rotate(lerp(k === 'L' ? -2.4 : 2.4, 0, eOut(clamp(lid * 1.3 - i * 0.2))));
    ctx.fillStyle = '#d39554'; ctx.fillRect(k === 'L' ? 0 : -105, -8, 105, 16); ctx.strokeRect(k === 'L' ? 0 : -105, -8, 105, 16); ctx.restore();
  });
  if (o.tape > 0) { ctx.fillStyle = '#f5e6b8'; ctx.fillRect(-14, -68, 28, 160 * o.tape); ctx.strokeStyle = '#a8894a'; ctx.lineWidth = 3; ctx.strokeRect(-14, -68, 28, 160 * o.tape); }
  if (o.label > 0) {
    ctx.save(); ctx.translate(48, 30); ctx.rotate(-0.12); const ls = eBack(o.label); ctx.scale(ls, ls);
    ctx.fillStyle = '#fff'; ctx.fillRect(-56, -26, 112, 52); ctx.strokeStyle = '#e02424'; ctx.lineWidth = 4; ctx.strokeRect(-56, -26, 112, 52);
    ctx.fillStyle = '#e02424'; ctx.font = `bold 24px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.labelText || '完成第一章', 0, 1); ctx.restore();
  }
  ctx.restore();
}
function commitNode(x, y, s, hash, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.glow) { ctx.fillStyle = `rgba(255,230,90,${0.35 * o.glow})`; ctx.beginPath(); ctx.arc(0, 0, 80 + 16 * Math.sin((o.t || 0) * 8), 0, 7); ctx.fill(); }
  ctx.fillStyle = o.col || '#ff7a3d'; ctx.beginPath(); ctx.arc(0, 0, 46, 0, 7); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = `bold 40px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('✓', 0, 2);
  if (hash) { ctx.font = `bold 28px ${F_CODE}`; ctx.fillStyle = '#ffd36b'; ctx.fillText(hash, 0, 80); }
  ctx.restore();
}
function star(x, y, r, n = 5) { ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n - Math.PI / 2, r2 = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2); } ctx.closePath(); }
function confetti(t, t0, n = 90, seed = 0, cx = W / 2, cy = H * 0.55) {
  const dt = t - t0; if (dt < 0 || dt > 3) return;
  for (let i = 0; i < n; i++) {
    const a = rnd(i + seed) * Math.PI * 2, sp = 500 + rnd(i + seed + 50) * 900;
    const x = cx + Math.cos(a) * sp * dt, y = cy + Math.sin(a) * sp * dt * 0.8 + 700 * dt * dt;
    ctx.save(); ctx.translate(x, y); ctx.rotate(dt * 8 + i); ctx.fillStyle = ['#ff5c8a', '#ffd23f', '#3ec1ff', '#7cf07a', '#b98bff'][i % 5]; ctx.fillRect(-9, -5, 18, 10); ctx.restore();
  }
}
function sparkle(t, t0, x, y, r = 120, n = 10, col = '#fff36b') {
  const p = prog(t, t0, 0.6); if (p <= 0 || p >= 1) return;
  for (let i = 0; i < n; i++) { const a = i / n * 6.28 + rnd(i) * 0.4; const d = r * eOut(p); ctx.fillStyle = col; ctx.globalAlpha = 1 - p; star(x + Math.cos(a) * d, y + Math.sin(a) * d, 16 * (1 - p) + 4); ctx.fill(); }
  ctx.globalAlpha = 1;
}
function speedLines(t, cx, cy, alpha = 1) {
  if (alpha <= 0) return; ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.55 * alpha})`;
  for (let i = 0; i < 60; i++) { const a = rnd(i) * Math.PI * 2 + Math.floor(t * 20) * 0.37 * rnd(i + 7); const r0 = 420 + rnd(i + 3) * 260; ctx.lineWidth = 2 + rnd(i + 5) * 6; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * 1600, cy + Math.sin(a) * 1600); ctx.stroke(); }
  ctx.restore();
}
function flash(t, t0, d = 0.25, col = '255,255,255') { const p = prog(t, t0, d); if (p > 0 && p < 1) { ctx.fillStyle = `rgba(${col},${(1 - p) * 0.85})`; ctx.fillRect(...OS); } }
function popIn(t, t0, d = 0.35) { return eBack(prog(t, t0, d)); }
function stamp(t, t0, x, y, text, col = '#e02424', size = 70, rot = -0.15) {
  const p = prog(t, t0, 0.22); if (p <= 0) return;
  const s = lerp(2.4, 1, eOut(p));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = clamp(p * 2);
  ctx.font = `${size}px ${F_FANCY}`; const w = ctx.measureText(text).width + 50;
  ctx.lineWidth = 8; ctx.strokeStyle = col; rr(-w / 2, -size * 0.75, w, size * 1.5, 16); ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 4); ctx.restore();
}
function badge(x, y, r, col, label, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(o.s ?? 1, o.s ?? 1); ctx.rotate(o.rot || 0);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.lineWidth = r * 0.09; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.fillStyle = o.fg || '#1b1433'; ctx.font = `${o.fs || r * 0.8}px ${o.font || F_FANCY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, o.dy || 4);
  if (o.sub) { ctx.font = `${r * 0.3}px ${F_FANCY}`; ctx.fillText(o.sub, 0, r * 0.48); }
  ctx.restore();
}
function gitLogo(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#f05133'; rr(-90, -90, 180, 180, 26); ctx.fill(); ctx.lineWidth = 12; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.rotate(-Math.PI / 4); ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-30, -55); ctx.lineTo(-30, 55); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-30, -20); ctx.quadraticCurveTo(30, -20, 30, 25); ctx.stroke();
  [[-30, -55], [-30, 55], [30, 30]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 17, 0, 7); ctx.fill(); });
  ctx.restore();
}
function cursor(x, y, s = 1, click = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (click > 0 && click < 1) { ctx.strokeStyle = `rgba(255,255,255,${1 - click})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 20 + 50 * click, 0, 7); ctx.stroke(); }
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 46); ctx.lineTo(12, 35); ctx.lineTo(21, 54); ctx.lineTo(29, 50); ctx.lineTo(20, 32); ctx.lineTo(36, 32); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function cryFace(x, y, r, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#2a2140'; ctx.stroke();
  ctx.lineWidth = 9; ctx.lineCap = 'round';
  [-1, 1].forEach(k => { ctx.beginPath(); ctx.moveTo(k * r * 0.5, -r * 0.2); ctx.lineTo(k * r * 0.2, -r * 0.1); ctx.stroke(); });
  ctx.beginPath(); ctx.arc(0, r * 0.5, r * 0.3, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.fillStyle = '#5fc8ff';
  [-1, 1].forEach(k => { for (let i = 0; i < 3; i++) { const p = ((t * 1.6 + i / 3) % 1); ctx.globalAlpha = 1 - p; ctx.beginPath(); ctx.ellipse(k * r * 0.35, -r * 0.02 + p * r * 1.1, 10, 16, 0, 0, 7); ctx.fill(); } });
  ctx.restore();
}

// ================= 讲课布局 =================
// 讲师立绘在左，内容面板在右（x 660..1880）
function lecturer(t, blk, en, enterT) {
  const cur = (en && en.k === 'v' && en.id[0] === 'G') ? en : [...blk.entries].reverse().find(e => e.k === 'v' && e.id[0] === 'G' && e.vo <= t) || blk.entries.find(e => e.k === 'v' && e.id[0] === 'G');
  const pose = cur ? cur.pose : 'g_explain';
  const sw = cur ? prog(t, cur.vo - 0.15, 0.2) : 1;
  const pin = eOut(prog(t, enterT, 0.35));
  const gs = blk.entries.filter(e => e.k === 'v' && e.id[0] === 'G');
  const ci = cur ? gs.indexOf(cur) : -1; const prevPose = ci > 0 ? gs[ci - 1].pose : null;
  const hop = pose === 'g_cheer' && cur ? -Math.sin(prog(t, cur.vo - 0.1, 0.36) * Math.PI) * 30 : 0;
  const y = H + 280 + (1 - pin) * 200 + hop, sc = breath(t);
  if (prevPose && prevPose !== pose && sw < 1) sprite(prevPose, 300, y, 1180, { scale: sc, alpha: 1 - sw });
  sprite(pose, 300, y, 1180, { scale: sc, alpha: (prevPose && prevPose !== pose) ? sw : 1 });
}

// ================= 区域板 =================
const ZONES = [
  { key: 'work', title: '工作区', en: 'Working Dir', x: 900, col: '#3ec1ff' },
  { key: 'stage', title: '暂存区', en: 'Staging', x: 1285, col: '#ffd23f' },
  { key: 'repo', title: '仓库', en: 'Repository', x: 1670, col: '#ff7a3d' },
];
const ZY = 250, ZW = 345, ZH = 460;
function zoneBoard(t, appear, hi) {
  ZONES.forEach((z, i) => {
    const a = eBack(prog(t, appear + i * 0.12, 0.4)); if (a <= 0) return;
    const isHi = hi === z.key; const sc = a * (isHi ? 1.04 + Math.sin(t * 6) * 0.01 : 1);
    ctx.save(); ctx.translate(z.x, ZY + ZH / 2); ctx.scale(sc, sc); ctx.translate(-ZW / 2, -ZH / 2);
    ctx.globalAlpha = (hi && !isHi) ? 0.5 : 1;
    if (isHi) { ctx.shadowColor = z.col; ctx.shadowBlur = 50; }
    ctx.fillStyle = 'rgba(255,255,255,0.09)'; rr(0, 0, ZW, ZH, 30); ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = isHi ? 8 : 5; ctx.strokeStyle = isHi ? z.col : 'rgba(255,255,255,0.6)'; ctx.setLineDash(isHi ? [] : [18, 12]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = z.col; rr(24, -30, ZW - 48, 64, 20); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.fillStyle = '#1b1433'; ctx.font = `44px ${F_FANCY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(z.title, ZW / 2, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `bold 24px ${F_CODE}`; ctx.fillText(z.en, ZW / 2, ZH - 30);
    ctx.restore();
  });
  [0, 1].forEach(i => {
    const a = prog(t, appear + 0.35 + i * 0.1, 0.3); if (a <= 0) return;
    const x0 = ZONES[i].x + ZW / 2 + 4, x1 = ZONES[i + 1].x - ZW / 2 - 4, y = ZY + ZH / 2;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(x0, y - 9); ctx.lineTo(x1 - 6, y - 9); ctx.lineTo(x1 - 6, y - 19); ctx.lineTo(x1 + 8, y); ctx.lineTo(x1 - 6, y + 19); ctx.lineTo(x1 - 6, y + 9); ctx.lineTo(x0, y + 9); ctx.fill(); ctx.restore();
  });
}

// ================= 第1集小组件 =================
function miniZone(x, y, w, h, title, col, a = 1, hi = false) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  if (hi) { ctx.shadowColor = col; ctx.shadowBlur = 40; }
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; rr(x - w / 2, y - h / 2, w, h, 28); ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = hi ? 7 : 5; ctx.strokeStyle = hi ? col : 'rgba(255,255,255,0.55)'; ctx.setLineDash(hi ? [] : [16, 10]); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = col; rr(x - w / 2 + 30, y - h / 2 - 30, w - 60, 60, 18); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.fillStyle = '#1b1433'; ctx.font = `42px ${F_FANCY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(title, x, y - h / 2 + 2);
  ctx.restore();
}
function scribble(x, y, s, a) { // 改崩的红色涂鸦
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) { ctx.beginPath(); for (let i = 0; i <= 8; i++) ctx.lineTo(-40 + i * 10, -20 + k * 26 + (i % 2 ? -10 : 10)); ctx.stroke(); }
  ctx.restore();
}
function pill(x, y, text, col, s = 1, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `bold ${o.fs || 34}px ${o.font || F_CODE}`; const w = ctx.measureText(text).width + 40, h = (o.fs || 34) * 1.6;
  ctx.fillStyle = col; rr(-w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.fillStyle = o.fg || '#1b1433'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 2); ctx.restore();
}
function headTag(x, y, s) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#6bd3ff'; rr(-72, -32, 144, 58, 16); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.fillStyle = '#0d2238'; ctx.font = `bold 32px ${F_CODE}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('HEAD', 0, -2);
  ctx.beginPath(); ctx.moveTo(-12, 26); ctx.lineTo(12, 26); ctx.lineTo(0, 46); ctx.fillStyle = '#6bd3ff'; ctx.fill(); ctx.restore();
}
function seg(x0, y0, x1, y1, col, p = 1, w = 12) {
  if (p <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0);
  if (y0 !== y1) { const mx = x0 + (x1 - x0) * 0.5; const N = 24; for (let i = 1; i <= Math.ceil(N * p); i++) { const u = Math.min(i / N, p); const bx = (1 - u) ** 3 * x0 + 3 * (1 - u) ** 2 * u * mx + 3 * (1 - u) * u * u * mx + u ** 3 * x1; const by = (1 - u) ** 3 * y0 + 3 * (1 - u) ** 2 * u * y0 + 3 * (1 - u) * u * u * y1 + u ** 3 * y1; ctx.lineTo(bx, by); } }
  else ctx.lineTo(lerp(x0, x1, p), y1);
  ctx.stroke(); ctx.restore();
}

// ================= 第2集新组件 =================
const REPO_URL = 'https://github.com/dafeiyu/ai-zukan.git';
function txt(s, x, y, size, col, o = {}) {
  ctx.font = `${o.bold === false ? '' : 'bold '}${size}px ${o.font || F_BODY}`; ctx.fillStyle = col;
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y, o.max); return ctx.measureText(s).width;
}
function box(x, y, w, h, r, fill, stroke, lw = 4) { rr(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); } }
// 区间可见度：a 开始淡入，b 开始淡出
function ph(t, a, b = 1e9, fi = 0.3, fo = 0.25) { if (t < a || t > b + fo) return 0; return eOut(prog(t, a, fi)) * (1 - prog(t, b, fo)); }
// 一排存档节点
function chainRow(x, y, n, o = {}) {
  const g = o.gap || 70, s = o.s || 0.42, x0 = x - (n - 1) * g / 2;
  if (n > 1) { ctx.save(); ctx.strokeStyle = o.line || '#ffffff'; ctx.lineWidth = 9 * s / 0.42; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (n - 1) * g, y); ctx.stroke(); ctx.restore(); }
  for (let i = 0; i < n; i++) {
    const a = o.pop ? o.pop(i) : 1; if (a <= 0) continue;
    ctx.save(); if (o.ghost && o.ghost(i)) ctx.globalAlpha *= 0.3;
    commitNode(x0 + i * g, y, s * a, null, { col: (o.cols && o.cols[i]) || CH_COL[(i + (o.c0 || 2)) % 8], glow: o.hi === i ? 1 : 0, t: o.t });
    ctx.restore();
  }
  return x0 + (n - 1) * g;
}
// 云端仓库
function cloud(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y + Math.sin((o.t || 0) * 1.8) * 5); ctx.scale(s, s); ctx.globalAlpha *= (o.alpha ?? 1);
  if (o.glow) { ctx.shadowColor = '#8fdcff'; ctx.shadowBlur = 60 * o.glow; }
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1b1433'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.arc(-130, 30, 90, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(-20, -45, 125, Math.PI, Math.PI * 1.85); ctx.arc(115, 0, 100, Math.PI * 1.35, Math.PI * 0.5); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; ctx.stroke();
  ctx.fillStyle = '#e8f6ff'; ctx.beginPath(); ctx.ellipse(-40, -90, 60, 22, -0.2, 0, 7); ctx.fill();
  if (o.label) txt(o.label, 0, o.n != null ? -50 : -10, 52, '#1b1433', { font: F_FANCY, align: 'center', bold: false });
  if (o.n != null && o.n > 0) chainRow(0, 40, o.n, { s: 0.32, gap: 56, line: '#bdb5da', hi: o.hi, t: o.t, cols: o.cols, ghost: o.ghost, pop: o.pop });
  if (o.n === 0) { ctx.setLineDash([10, 8]); box(-90, 15, 180, 60, 14, null, '#9a92b8', 4); ctx.setLineDash([]); txt('空', 0, 46, 34, '#9a92b8', { align: 'center' }); }
  ctx.restore();
}
// 笔记本电脑：screen(cx, cy) 在屏幕中心坐标系里画内容
function laptop(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= (o.alpha ?? 1);
  if (o.hl) { ctx.shadowColor = o.hl; ctx.shadowBlur = 50; }
  box(-190, -262, 380, 252, 22, '#2a2140', '#ffffff', 7); ctx.shadowBlur = 0;
  box(-172, -244, 344, 216, 12, o.dead ? '#05040a' : (o.scr || '#1d1838'));
  if (!o.dead && o.screen) { ctx.save(); rr(-172, -244, 344, 216, 12); ctx.clip(); ctx.translate(0, -136); o.screen(); ctx.restore(); }
  if (o.dead) {
    txt('无法开机', 0, -150, 34, '#5b5670', { align: 'center' });
    for (let i = 0; i < 6; i++) { const p = ((o.t || 0) * 0.7 + i / 6) % 1; ctx.fillStyle = `rgba(120,120,130,${0.55 * (1 - p)})`; ctx.beginPath(); ctx.arc(-60 + rnd(i) * 120 + Math.sin(p * 6 + i) * 20, -270 - p * 260, 26 + p * 50, 0, 7); ctx.fill(); }
  }
  ctx.beginPath(); ctx.moveTo(-215, -12); ctx.lineTo(215, -12); ctx.lineTo(248, 18); ctx.lineTo(-248, 18); ctx.closePath(); ctx.fillStyle = '#d9d3ee'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#2a2140'; ctx.stroke();
  box(-40, -12, 80, 10, 4, '#b4abd2');
  if (o.label) pill(0, 66, o.label, o.lcol || '#ffd23f', 1, { font: F_FANCY, fs: 40 });
  if (o.tag) pill(150, -270, o.tag, o.tcol || '#6bd3ff', o.tagS ?? 1, { fs: 30 });
  ctx.restore();
}
// 带箭头的线，p = 0..1 画到哪
function arrow(x0, y0, x1, y1, col, p = 1, w = 14, o = {}) {
  if (p <= 0) return; const x = lerp(x0, x1, p), y = lerp(y0, y1, p), a = Math.atan2(y1 - y0, x1 - x0);
  ctx.save(); ctx.globalAlpha *= (o.alpha ?? 1); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  if (o.dash) { ctx.setLineDash(o.dash); ctx.lineDashOffset = -(o.t || 0) * 60; }
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x - Math.cos(a) * w * 1.2, y - Math.sin(a) * w * 1.2); ctx.stroke(); ctx.setLineDash([]);
  ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(w * 0.6, 0); ctx.lineTo(-w * 2.2, -w * 1.7); ctx.lineTo(-w * 2.2, w * 1.7); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// 存档节点飞行
function flyNode(t, t0, d, x0, y0, x1, y1, col = '#ff7a3d', s = 0.4, lift = 80) {
  const p = prog(t, t0, d); if (p <= 0 || p >= 1) return;
  const e = eIO(p); commitNode(lerp(x0, x1, e), lerp(y0, y1, e) - Math.sin(e * Math.PI) * lift, s, null, { col });
}
// 浏览器（GitHub 页面）：返回内容区顶部 y
function browser(x, y, w, h, url, o = {}) {
  win(x, y, w, h, o.title || '浏览器', o.accent || '#3ec1ff', { bg: '#ffffff', bar: '#e9e6f3' });
  ctx.save();
  box(x + 20, y + 68, w - 40, 50, 25, '#f2f0f8', '#d6d1e6', 2);
  txt('🔒 ' + url, x + 44, y + 94, 26, '#555', { font: F_CODE, bold: false, max: w - 120 });
  if (o.reload != null) { ctx.save(); ctx.translate(x + w - 56, y + 94); ctx.rotate(o.reload * Math.PI * 2); ctx.strokeStyle = '#7c5cff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 13, 0.3, 5.6); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = '#24292f'; ctx.fillRect(x + 5, y + 130, w - 10, 64);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 46, y + 162, 20, 0, 7); ctx.fill();
  ctx.fillStyle = '#24292f'; ctx.beginPath(); ctx.arc(x + 46, y + 166, 10, 0, 7); ctx.fill();
  txt('GitHub', x + 78, y + 163, 30, '#fff');
  if (o.user !== false) { ctx.fillStyle = '#8fdcff'; ctx.beginPath(); ctx.arc(x + w - 50, y + 162, 18, 0, 7); ctx.fill(); }
  ctx.restore();
  return y + 194;
}
function ghButton(x, y, w, h, label, col = '#1f883d', o = {}) {
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); const s = o.press ? 0.94 : 1; ctx.scale(s, s);
  if (o.glow) { ctx.shadowColor = col; ctx.shadowBlur = 30 * o.glow; }
  box(-w / 2, -h / 2, w, h, 12, col, o.border || null, 3); ctx.shadowBlur = 0;
  txt(label, 0, 2, o.fs || 30, o.fg || '#fff', { align: 'center' }); ctx.restore();
}
function inputBox(x, y, w, label, val, o = {}) {
  if (label) txt(label, x, y - 30, 28, '#24292f');
  box(x, y, w, 58, 10, o.focus ? '#ffffff' : '#f6f8fa', o.focus ? '#3ec1ff' : '#d0d7de', o.focus ? 4 : 2);
  const tw = txt(val, x + 18, y + 30, 30, '#24292f', { font: o.code ? F_CODE : F_BODY, bold: false });
  if (o.focus && Math.floor((o.t || 0) * 3) % 2 === 0) { ctx.fillStyle = '#24292f'; ctx.fillRect(x + 22 + tw, y + 14, 3, 32); }
}
function radio(x, y, on, label, sub) {
  ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = on ? '#3ec1ff' : '#8c959f'; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 16, 0, 7); ctx.fill(); ctx.stroke();
  if (on) { ctx.fillStyle = '#3ec1ff'; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill(); }
  txt(label, x + 34, y - 2, 30, '#24292f'); if (sub) txt(sub, x + 34, y + 32, 22, '#6b6488', { bold: false });
  ctx.restore();
}
function checkbox(x, y, on, label) {
  ctx.save(); box(x - 16, y - 16, 32, 32, 6, on ? '#3ec1ff' : '#fff', '#8c959f', 3);
  if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x - 2, y + 8); ctx.lineTo(x + 10, y - 8); ctx.stroke(); }
  txt(label, x + 30, y, 30, '#24292f'); ctx.restore();
}
function bigX(x, y, r, col = '#ff3b5c', p = 1) {
  if (p <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(lerp(x - r, x + r, clamp(p * 2)), lerp(y - r, y + r, clamp(p * 2))); ctx.stroke();
  if (p > 0.5) { ctx.beginPath(); ctx.moveTo(x + r, y - r); ctx.lineTo(lerp(x + r, x - r, clamp(p * 2 - 1)), lerp(y - r, y + r, clamp(p * 2 - 1))); ctx.stroke(); }
  ctx.restore();
}
function prohibit(x, y, r, s = 1) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = r * 0.2;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.7); ctx.lineTo(r * 0.7, r * 0.7); ctx.stroke(); ctx.restore();
}
function fileChip(x, y, s, icon, name, col, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  ctx.font = `bold 34px ${F_CODE}`; const w = ctx.measureText(name).width + 120;
  box(-w / 2 + 8, -38, w, 84, 20, 'rgba(0,0,0,0.3)'); box(-w / 2, -46, w, 84, 20, '#fffaf0', col, 6);
  txt(icon, -w / 2 + 22, -2, 44, '#000', { font: '"Segoe UI Emoji","Noto Color Emoji",sans-serif', bold: false });
  txt(name, -w / 2 + 88, -2, 34, '#1b1433', { font: F_CODE }); ctx.restore();
}
function shield(x, y, s, t) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = '#6bd3ff'; ctx.shadowBlur = 40 + Math.sin(t * 6) * 10;
  ctx.beginPath(); ctx.moveTo(0, -150); ctx.quadraticCurveTo(70, -110, 125, -110); ctx.quadraticCurveTo(130, 60, 0, 150); ctx.quadraticCurveTo(-130, 60, -125, -110); ctx.quadraticCurveTo(-70, -110, 0, -150); ctx.closePath();
  ctx.fillStyle = '#3ec1ff'; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
  txt('Git', 0, 4, 64, '#fff', { font: F_FANCY, align: 'center', bold: false }); ctx.restore();
}
// 文件夹里的文件列表（GitHub 仓库首页）
function repoFiles(x, y, w, rows, t, t0, o = {}) {
  box(x, y, w, 64, [12, 12, 0, 0], '#f6f8fa', '#d0d7de', 2);
  ctx.fillStyle = '#8fdcff'; ctx.beginPath(); ctx.arc(x + 34, y + 32, 15, 0, 7); ctx.fill();
  txt('dafeiyu  ' + (o.msg || '完成第一章'), x + 60, y + 32, 26, '#24292f');
  txt('🕒 ' + (o.commits || 3) + ' Commits', x + w - 24, y + 32, 26, '#24292f', { align: 'right' });
  rows.forEach((r, i) => {
    const a = t0 == null ? 1 : popIn(t, t0 + i * 0.08); if (a <= 0) return;
    const ry = y + 64 + i * 58; ctx.save(); ctx.globalAlpha *= clamp(a);
    box(x, ry, w, 58, 0, '#fff', '#d0d7de', 2);
    txt(r[0] === '/' ? '📁' : '📄', x + 22, ry + 30, 26, '#000', { font: '"Segoe UI Emoji","Noto Color Emoji",sans-serif', bold: false });
    txt(r.replace('/', ''), x + 70, ry + 30, 28, '#0969da', { bold: false });
    txt(o.ago || '刚刚', x + w - 24, ry + 30, 24, '#6b6488', { align: 'right', bold: false });
    ctx.restore();
  });
}
// 一行说明标签（深色底）
function note(x, y, s, text, col = '#ffd23f', o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  ctx.font = `bold ${o.fs || 36}px ${F_BODY}`; const w = ctx.measureText(text).width + 50, h = (o.fs || 36) * 1.8;
  box(-w / 2, -h / 2, w, h, 18, 'rgba(20,14,40,0.92)', col, 5);
  txt(text, 0, 2, o.fs || 36, o.fg || '#fff', { align: 'center' }); ctx.restore();
}

// ================= 场景 =================
const SC = {};
const SFX_FNS = [];
// ================= 第3集：小队 =================
const SQ = {
  G: { n: 'GitHub娘', col: '#8b5cf6', spr: 'g_explain' }, D: { n: '大肥鱼', col: '#2f6fe0', spr: 'd_ok', role: '组长' },
  Q: { n: '千问', col: '#5b6ee1', spr: 'q_base', role: '张罗分工' }, C: { n: 'Claude', col: '#e07a3d', spr: 'c_base', role: '审查' },
  M: { n: 'Gemini', col: '#a855f7', spr: 'm_base', role: '搜索' }, X: { n: 'Grok', col: '#d6283e', spr: 'x_base', role: '执行' },
  B: { n: '豆包', col: '#16a5c9', spr: 'b_base', role: '气氛' }, K: { n: 'Kimi', col: '#34407a', spr: 'k_base', role: '长文' },
};
const SQUAD = 'QCMXBK';
// 头像裁切：[中心 x 比例, 中心 y 比例, 半径（相对宽度）]
const HEAD = { q_base: [0.476, 0.152, 0.12], c_base: [0.508, 0.151, 0.135], m_base: [0.51, 0.151, 0.128], x_base: [0.55, 0.225, 0.12], b_base: [0.531, 0.158, 0.135], k_base: [0.512, 0.150, 0.145], d_ok: [0.475, 0.165, 0.14], g_explain: [0.525, 0.17, 0.155] };
function avatar(k, x, y, r, o = {}) {
  const c = SQ[k], im = SPR[c.spr]; if (!im || !im.width) return; const s = o.s ?? 1; if (s <= 0) return;
  const [hx, hy, hr] = HEAD[c.spr]; const R = hr * im.width;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= (o.alpha ?? 1);
  ctx.fillStyle = o.gray ? '#3a3358' : c.col; ctx.beginPath(); ctx.arc(0, 0, r + r * 0.14, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(-r, -r, 2 * r, 2 * r);
  if (o.gray) ctx.filter = 'brightness(0) opacity(0.55)';
  ctx.drawImage(im, hx * im.width - R, hy * im.height - R, 2 * R, 2 * R, -r, -r, 2 * r, 2 * r); ctx.restore();
  ctx.lineWidth = Math.max(3, r * 0.1); ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r + r * 0.14, 0, 7); ctx.stroke();
  if (o.gray) txt('?', 0, 2, r * 1.1, '#fff', { align: 'center', font: F_FANCY, bold: false });
  ctx.restore();
}
// 说话的小队成员从右侧滑入，内容区压暗
function guest(t, blk) {
  blk.entries.forEach(e => {
    if (e.k !== 'v' || !SQUAD.includes(e.id[0])) return;
    const a0 = e.vo - 0.25, a1 = e.t1 + 0.2; if (t < a0 || t > a1 + 0.3) return;
    const pi = eOut(prog(t, a0, 0.3)), po = eIn(prog(t, a1, 0.3)); const v = pi * (1 - po);
    ctx.fillStyle = `rgba(16,10,34,${0.42 * v})`; ctx.fillRect(640, -40, W, H + 80);
    const c = SQ[e.id[0]];
    sprite(e.pose, lerp(W + 450, 1560, pi) + po * 500, H + 40, 960, { scale: breath(t, 3) });
    const np = popIn(t, a0 + 0.1); if (np > 0 && po < 1) { ctx.save(); ctx.globalAlpha *= 1 - po; pill(1560, 150, c.n + ' · ' + c.role, c.col, np, { font: F_FANCY, fs: 46, fg: '#fff' }); ctx.restore(); }
  });
}
function guestSfx(ids) { ids.forEach(id => { sfx(U[id].vo - 0.25, 'swoosh_in', 0.4); sfx(U[id].vo - 0.1, 'pop', 0.35); }); }
// 浏览器页面里的小标题
function h2(s, x, y, size = 40, col = '#24292f') { return txt(s, x, y, size, col); }
// 状态小标签
function chip(x, y, s, label, col, fg = '#fff', fs = 24) {
  ctx.font = `bold ${fs}px ${F_BODY}`; const w = ctx.measureText(label).width + 30;
  box(x, y - fs * 0.75, w, fs * 1.5, fs * 0.75, col); txt(label, x + w / 2, y + 1, fs, fg, { align: 'center' }); return w;
}
// 日历（Gemini 梗）
function calendar(x, y, s, year, flip = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  box(-130, -110, 260, 240, 22, '#fff', '#1b1433', 7); box(-130, -110, 260, 70, [22, 22, 0, 0], '#ff4d6d');
  [-70, 70].forEach(rx => box(rx - 10, -130, 20, 44, 8, '#555'));
  txt('现在是', 0, -74, 32, '#fff', { align: 'center' });
  const sc = Math.abs(Math.cos(flip * Math.PI)); const yy = flip < 0.5 ? year[0] : year[1];
  ctx.save(); ctx.translate(0, 40); ctx.scale(1, Math.max(0.02, sc)); txt(yy, 0, 0, 88, flip < 0.5 ? '#1b1433' : '#22a35a', { align: 'center', font: F_FANCY, bold: false }); ctx.restore();
  ctx.restore();
}
// 代码 diff 行
function diffLine(x, y, w, no, text, kind, o = {}) {
  const bg = kind === '+' ? '#e6ffec' : kind === '-' ? '#ffebe9' : '#fff';
  box(x, y, w, 48, 0, o.hl ? '#fff8c5' : bg);
  txt(String(no), x + 40, y + 25, 22, '#8c959f', { align: 'right', font: F_CODE, bold: false });
  txt((kind || ' ') + ' ' + text, x + 60, y + 25, 26, '#24292f', { font: F_CODE, bold: false });
}

// ---- 通用组件（沿用第4集，第7集同第6集）----
const EMOJI = '"Segoe UI Emoji","Noto Color Emoji",sans-serif';
function flipText(t, seq) {
  let i = 0; for (let k = 0; k < seq.length; k++) if (t >= seq[k][0]) i = k;
  const p = i ? prog(t, seq[i][0], 0.3) : 1; const sc = Math.max(0.05, Math.abs(Math.cos(p * Math.PI)));
  return { s: (i > 0 && p < 0.5) ? seq[i - 1][1] : seq[i][1], sc: i ? sc : 1, fresh: i > 0 && p < 1 };
}
function cmdBar(t, x, y, s, t0, dur = 0.7, o = {}) {
  if (t < t0 - 0.12 || (o.out && t > o.out + 0.25)) return;
  const a = eOut(prog(t, t0 - 0.12, 0.25)) * (o.out ? 1 - prog(t, o.out, 0.25) : 1);
  const ch = [...s]; const n = Math.floor(clamp((t - t0) / dur) * ch.length);
  ctx.save(); ctx.globalAlpha *= a; const fs = o.fs || 36; ctx.font = `bold ${fs}px ${F_CODE}`; const w = ctx.measureText(s).width + 110;
  box(x - w / 2, y - fs * 1.05, w, fs * 2.1, 20, 'rgba(15,12,31,0.95)', o.col || '#7cf07a', 5);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = TC.g; ctx.fillText('$', x - w / 2 + 28, y + 2);
  ctx.fillStyle = '#fff'; const str = ch.slice(0, n).join(''); ctx.fillText(str, x - w / 2 + 28 + fs * 0.95, y + 2);
  if (n < ch.length || Math.floor(t * 3) % 2 === 0) { ctx.fillStyle = TC.g; ctx.fillRect(x - w / 2 + 34 + fs * 0.95 + ctx.measureText(str).width, y - fs * 0.48, fs * 0.5, fs); }
  ctx.restore();
}
const CMDBARS = [];   // [t0, 文本, dur]：登记打字音效
function cmdAt(t0, s, dur) { const d = dur || Math.min(1.1, 0.25 + [...s].length * 0.04); CMDBARS.push([t0, s, d]); return d; }
SFX_FNS.push(() => CMDBARS.forEach(c => typeSfx(c[0], [...c[1]].length, c[2])));
function retime(lines, times) { lines.forEach((l, i) => l.t = typeof times[i] === 'number' ? times[i] : P(times[i][0], times[i][1])); return cmdLines(lines); }
function arcPos(t, t0, d, x0, y0, x1, y1, lift = 120) { const p = eIO(prog(t, t0, d)); return [lerp(x0, x1, p), lerp(y0, y1, p) - Math.sin(p * Math.PI) * lift, p]; }
function miniCard(x, y, label, col, s = 1, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= (o.alpha ?? 1); ctx.rotate(o.rot || 0);
  const w = o.w || 290, h = o.h || 66; box(-w / 2, -h / 2, w, h, 16, o.bg || '#fff', col, 5);
  if (o.icon !== false) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(-w / 2 + 32, 0, 16, 0, 7); ctx.fill(); }
  txt(label, -w / 2 + (o.icon === false ? w / 2 : 60), 1, o.fs || 28, '#1b1433', { align: o.icon === false ? 'center' : 'left', max: w - 70 });
  ctx.restore();
}
function probChap(t, t0, ch) {
  const cp = eOut(prog(t, t0 + 0.05, 0.3)); ctx.save(); ctx.translate(lerp(-700, 0, cp), 0);
  ctx.font = `46px ${F_FANCY}`; const w1 = ctx.measureText(ch[0]).width + 50; ctx.font = `bold 44px ${F_CODE}`; const w2 = ctx.measureText(ch[1]).width + 60;
  ctx.fillStyle = '#1b1433'; rr(40, 40, w1 + w2 + 20, 92, 26); ctx.fill();
  ctx.fillStyle = ch[2]; rr(50, 50, w1, 72, 20); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `46px ${F_FANCY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch[0], 50 + w1 / 2, 88);
  ctx.font = `bold 44px ${ch[3] || F_CODE}`; ctx.fillText(ch[1], 60 + w1 + w2 / 2, 88);
  ctx.restore();
}
function probScene(t, blk, en) {
  const cfg = PROB[blk.b], t0 = blk.t0; bgDots(t, cfg.bg[0], cfg.bg[1]);
  const ia = eOut(prog(t, t0, 0.35)); ctx.save(); ctx.translate(lerp(-500, 0, ia), 0); cfg.draw(t, blk); ctx.restore();
  const vs = blk.entries.filter(e => e.k === 'v');
  vs.forEach((e, i) => {
    const a0 = i === 0 ? t0 : e.vo - 0.3, a1 = i < vs.length - 1 ? vs[i + 1].vo - 0.3 : 1e9; if (t < a0 || t > a1 + 0.3) return;
    const pi = eOut(prog(t, a0, 0.3)), po = eIn(prog(t, a1, 0.3)), p = spring(prog(t, a0 + 0.05, 0.8));
    sprite(e.pose, lerp(W + 500, 1500, pi) + po * 700, H + 30, 900, { scale: lerp(1.06, 1, p) * breath(t, i) });
    const c = SQ[e.id[0]]; const np = popIn(t, a0 + 0.12); if (np > 0 && po < 1) pill(1500, 128, c.n + (e.id[0] === 'D' ? ' · 提问' : ' · ' + c.role), c.col, np * (1 - po), { font: F_FANCY, fs: 42, fg: '#fff' });
  });
  const dq = vs.find(e => e.id[0] === 'D'); const bp = dq ? popIn(t, dq.vo + 0.35, 0.4) : 0;
  if (bp > 0) {
    ctx.save(); ctx.translate(1180, 310); ctx.scale(bp, bp); ctx.rotate(-0.04);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1b1433'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.ellipse(0, 0, 300, 118, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(150, 80); ctx.lineTo(250, 180); ctx.lineTo(210, 64); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, 290, 110, 0, 0, 7); ctx.fill();
    ctx.restore();
    const L = [...cfg.q].length; fancy(cfg.q, 1180, 305, L > 8 ? 58 : L > 6 ? 68 : 84, t, dq.vo + 0.5, FX.blue);
  }
  probChap(t, t0, cfg.chap);
}
// ---- 沿用第7集：状态图标 / 运行列表 / 代码编辑器 / 徽章 ----
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


// ---- 沿用第12集组件 ----
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


// ================= 番外通用组件（spkit）：声明式面板 + 片头 / 标题 / 片尾模板 =================
// 时间写法：数字 = 绝对秒；'G02_01' = 该句开口；['G02_01', 0.4] = 句内 40%；['G02_01', 0.4, 0.1] = 再加 0.1 秒
const tAt = a => typeof a === 'number' ? a : Array.isArray(a) ? P(a[0], a[1]) + (a[2] || 0) : S(a);
const SPC = { x: 680, w: 1180 };   // 讲解区（讲师在左）
const LECS = [];                   // [块名, cfg]：统一登记音效
const FXK = s => typeof s === 'string' ? FX[s] : (s || FX.yel);

// ---- 面板解析：panels = [{ at, k, ... }]，下一块开始即淡出 ----
function spPanels(cfg, blk) {
  if (cfg._ps) return cfg._ps;
  const ps = (cfg.panels || []).map(p => Object.assign({}, p, { t0: typeof p.at === 'string' ? S(p.at) - 0.15 : tAt(p.at) }));
  ps.forEach((p, i) => { p.t1 = p.until ? tAt(p.until) : i < ps.length - 1 ? ps[i + 1].t0 : blk.t1 + 1; p.x = p.x ?? (cfg.geo || SPC).x; p.w = p.w ?? (cfg.geo || SPC).w; prepPanel(p, cfg); });
  return cfg._ps = ps;
}
function prepPanel(p, cfg) {
  p.acc = p.acc || cfg.acc;
  if (p.k === 'term') p.L = p.lines.map(l => { const cmd = l[1].startsWith('$ '), s = cmd ? l[1].slice(2) : l[1]; const o = l[2] || {};
    return Object.assign({ s, t: tAt(l[0]), cmd, dur: cmd ? (o.dur || Math.min(1.2, 0.25 + [...s].length * 0.04)) : 0 }, o.hl ? { hl: o.hl.map(tAt), hlc: o.hlc } : {}, o.c ? { c: o.c } : {}); });
  if (p.k === 'edit') p.L = p.lines.map((l, i) => { const o = l[2] || {};
    return Object.assign({ s: l[1], t: tAt(l[0]), dur: o.type ? Math.min(1.1, 0.2 + [...l[1]].length * 0.035) : 0.01, type: !!o.type }, o.hl ? { hl: o.hl.map(tAt) } : {}, o.good ? { good: 1 } : {}, o.bad ? { bad: 1 } : {}, o.dim ? { dim: 1 } : {}, o.row != null ? { row: o.row } : {}, o.vcol ? { vcol: o.vcol } : {}); });
  (p.fx || []).forEach(f => f._t = tAt(f[0])); (p.st || []).forEach(f => f._t = tAt(f[0]));
  if (p.items) p.items.forEach(c => c._t = tAt(p.k === 'flow' ? c[2] : c[4]));
  if (p.rows) p.rows.forEach(r => { r._t = tAt(r[0]); if (r[1] === 'chk') r._on = tAt(r[4]); if (r[3] && r[3].hot) r._hot = r[3].hot.map(tAt); });
  if (p.k === 'ide') { (p.files || []).forEach(f => { f._t = tAt(f[2]); if (f[3] != null) f._s = tAt(f[3]); if (f[5] != null) f._u = tAt(f[5]); }); (p.diff || []).forEach(d => d._t = tAt(d[0]));
    ['sel', 'menu', 'msg', 'commit', 'sync', 'conf'].forEach(k => { if (p[k]) p[k]._t = tAt(p[k][0]); }); if (p.sync && p.sync[2] != null) p.sync._p = tAt(p.sync[2]); if (p.commit && p.commit[1] != null) p.commit._p = tAt(p.commit[1]); }
}
function panelSfx(p, first) {
  sfx(p.t0, first ? 'pop' : 'swoosh_in', 0.4);
  if (p.L && p.k === 'term') termSfx(p.L);
  if (p.L && p.k === 'edit') p.L.forEach(l => { if (l.type) typeSfx(l.t, [...l.s].length, l.dur); });
  (p.items || []).forEach(c => sfx(c._t, 'pop', 0.35));
  (p.rows || []).forEach(r => { if (r._t > p.t0 + 0.2) sfx(r._t, 'pop', 0.22); if (r._on) sfx(r._on, 'ding', 0.35); if (r._hot) sfx(r._hot[0], 'pop', 0.4); });
  (p.fx || []).forEach(f => sfx(f._t, 'sparkle', 0.35)); (p.st || []).forEach(f => sfx(f._t, 'stamp', 0.5));
  if (p.k === 'ide') { (p.files || []).forEach(f => { if (f._t > p.t0 + 0.2) sfx(f._t, 'pop', 0.2); if (f._s > p.t0 + 0.2) sfx(f._s, 'ding', 0.3); if (f._u) sfx(f._u, 'pop', 0.4); }); if (p.sel) sfx(p.sel._t, 'pop', 0.3); if (p.menu) { sfx(p.menu._t, 'pop', 0.35); sfx(p.menu._t + 0.5, 'ding', 0.35); }
    if (p.msg) typeSfx(p.msg._t, [...p.msg[1]].length, 0.7); if (p.commit) sfx(p.commit._p ?? p.commit._t, 'ding', 0.4); if (p.sync && p.sync._p) sfx(p.sync._p, 'whoosh', 0.45); if (p.conf) sfx(p.conf._t, 'pop', 0.3); }
  if (p.sfx) p.sfx(p);
}

// ---- 面板绘制 ----
function drawPanels(t, ps) {
  ps.forEach(p => { if (t < p.t0 - 0.05 || t > p.t1 + 0.35) return; const a = fadeW(t, p.t0, p.t1); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; const s = 0.94 + 0.06 * eBack(prog(t, p.t0, 0.35)); const cx = p.x + p.w / 2;
    ctx.translate(cx, 470); ctx.scale(s, s); ctx.translate(-cx, -470);
    (PANEL[p.k] || PANEL.draw)(t, p);
    if (p.tag) pill(cx, p.tagY || 70, p.tag[0], p.tag[1] || CLUE, popIn(t, p.t0 + 0.1), { fs: 30, font: F_BODY + ',' + EMOJI });
    (p.st || []).forEach(f => { if (t >= f._t) stamp(t, f._t, f[3] ?? cx + 300, f[4] ?? 640, f[1], f[2] || BADC, f[5] || 60, f[6] ?? -0.1); });
    (p.fx || []).forEach(f => { if (t >= f._t) fancy(f[1], f[3] ?? cx, f[4] ?? 830, f[5] || 64, t, f._t, FXK(f[2])); });
    ctx.restore(); });
}
const PANEL = {};
PANEL.draw = (t, p) => p.fn && p.fn(t, p);
PANEL.term = (t, p) => terminal(t, p.x, p.y ?? 150, p.w, p.h ?? 440, p.L, { title: p.title || '终端', accent: p.acc, fs: p.fs || 28, prompt: false });
PANEL.edit = (t, p) => ymlEditor(t, p.x, p.y ?? 150, p.w, p.h ?? 460, p.title || 'config', p.L, { fs: p.fs || 30, accent: p.acc });
// 卡片排：items = [[emoji, 标题, 副标题, 颜色, 出现]]
PANEL.cards = (t, p) => {
  const n = p.items.length, gap = 30, cw = Math.min(p.cw || 360, (p.w - 40 - gap * (n - 1)) / n), ch = p.ch || 380, y = p.y ?? 450;
  if (p.title) txt(p.title, p.x + p.w / 2, y - ch / 2 - 60, 40, '#fff', { align: 'center', font: F_BODY + ',' + EMOJI });
  p.items.forEach((c, i) => { const s = popIn(t, c._t, 0.4); if (s <= 0) return; const x = p.x + p.w / 2 + (i - (n - 1) / 2) * (cw + gap);
    const hot = p.hot && t >= tAt(p.hot[0]) && i === p.hot[1];
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (hot ? 1.06 : 1), s * (hot ? 1.06 : 1)); ctx.rotate((i - (n - 1) / 2) * 0.03);
    if (hot) { ctx.shadowColor = c[3]; ctx.shadowBlur = 40; }
    box(-cw / 2, -ch / 2, cw, ch, 26, '#fffaf0', c[3], 7); ctx.shadowBlur = 0;
    txt(c[0], 0, -ch / 2 + 100, 96, '#000', { align: 'center', font: EMOJI, bold: false });
    txt(c[1], 0, 30, c[1].length > 9 ? 30 : 36, '#1b1433', { align: 'center', font: isCJK(c[1]) ? F_BODY + ',' + EMOJI : F_CODE, max: cw - 30 });
    if (c[2]) String(c[2]).split('\n').forEach((s2, k) => txt(s2, 0, 92 + k * 36, 24, c[3], { align: 'center', max: cw - 30, font: isCJK(s2) ? F_BODY : F_CODE }));
    ctx.restore(); });
};
// 网页：rows = [[出现, 类型, ...]]，类型 h / t / btn / chk / field / code
PANEL.gh = (t, p) => {
  const x = p.x, y = p.y ?? 110, h = p.h ?? 660; ghWin(x, y, p.w, h, p.url || 'github.com');
  let cy = y + 110;
  p.rows.forEach(r => { const o = (r[1] === 'chk' ? r[5] : r[1] === 'field' ? r[4] : r[3]) || {}; if (o.y != null) cy = o.y; const a = clamp(prog(t, r._t, 0.2)); const rh = { h: 64, t: 50, btn: 74, chk: 100, field: 116, code: 72 }[r[1]] + (o.gap || 0);
    if (a > 0) { ctx.save(); ctx.globalAlpha *= a; const lx = x + 40 + (o.dx || 0);
      if (r[1] === 'h') txt(r[2], lx, cy + 10, o.size || 34, '#24292f', { font: (isCJK(r[2]) ? F_BODY : F_CODE) + ',' + EMOJI });
      if (r[1] === 't') txt(r[2], lx, cy, o.size || 26, o.col || '#57606a', { font: (isCJK(r[2]) ? F_BODY : F_CODE) + ',' + EMOJI, bold: !!o.bold, max: p.w - 80 });
      if (r[1] === 'btn') { const hot = r._hot && t >= r._hot[0] && t < (r._hot[1] ?? 1e9); ctx.font = `bold 26px ${F_CODE}`; const bw = ctx.measureText(r[2]).width + 44;
        ghBtn(o.x ?? lx + bw / 2, cy + 6, r[2], { fs: 26, hot, t, bg: o.green ? '#1f883d' : undefined, fg: o.green ? '#fff' : undefined, bd: o.green ? '#1a7f37' : undefined, hc: o.hc }); }
      if (r[1] === 'chk') ghCheck(t, lx, cy - 20, p.w - 80 - (o.dx || 0), r[2], r[3], clamp(prog(t, r._on, 0.25)), 1, { hot: t >= r._on && t < r._on + 0.9 });
      if (r[1] === 'field') { txt(r[2], lx, cy - 10, 24, '#24292f', { font: isCJK(r[2]) ? F_BODY : F_CODE }); const n = Math.floor(clamp((t - r._t - 0.2) / 0.6) * [...r[3]].length);
        box(lx, cy + 14, p.w - 80 - (o.dx || 0), o.fh || 56, 8, '#f6f8fa', '#d0d7de', 2);
        String([...r[3]].slice(0, n).join('')).split('\n').forEach((s2, k) => txt(s2, lx + 16, cy + 42 + k * 30, o.fs || 22, '#24292f', { font: F_CODE, bold: false, max: p.w - 120 })); }
      if (r[1] === 'code') { box(lx, cy - 24, p.w - 80, 56, 8, '#f6f8fa', '#d0d7de', 2); txt(r[2], lx + 16, cy + 4, 24, o.col || '#0550ae', { font: F_CODE, max: p.w - 120 }); }
      ctx.restore(); }
    cy += rh; });
};
// 流程链：items = [[文字, 颜色, 出现, 副标题?]]
PANEL.flow = (t, p) => {
  const n = p.items.length, gap = 64, cw = (p.w - 40 - gap * (n - 1)) / n, y = p.y ?? 420;
  if (p.title) fancy(p.title, p.x + p.w / 2, y - 150, 56, t, p.t0 + 0.1, FX.white);
  p.items.forEach((c, i) => { const x = p.x + 20 + cw / 2 + i * (cw + gap), s = popIn(t, c._t, 0.35); if (s <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); box(-cw / 2, -60, cw, 120, 22, c[1], '#fff', 5);
    txt(c[0], 0, c[3] ? -14 : 2, cw < 240 ? 26 : 30, '#fff', { align: 'center', font: (isCJK(c[0]) ? F_BODY : F_CODE) + ',' + EMOJI, max: cw - 20 });
    if (c[3]) txt(c[3], 0, 30, 20, 'rgba(255,255,255,0.9)', { align: 'center', max: cw - 20, font: isCJK(c[3]) ? F_BODY : F_CODE, bold: false });
    ctx.restore();
    if (i < n - 1 && t >= p.items[i + 1]._t - 0.1) { const ax = x + cw / 2 + 8; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(ax, y - 16); ctx.lineTo(ax + gap - 20, y); ctx.lineTo(ax, y + 16); ctx.fill(); } });
};
// 大卡片：emoji + 标题 + 副标题
PANEL.big = (t, p) => {
  const s = popIn(t, p.t0, 0.45), cx = p.x + p.w / 2, y = p.y ?? 440; if (s <= 0) return; ctx.save(); ctx.translate(cx, y); ctx.scale(s, s); ctx.rotate(-0.02);
  box(-430, -260, 860, 520, 30, '#fffaf0', p.acc, 8); txt(p.emoji, 0, -120, 140, '#000', { align: 'center', font: EMOJI, bold: false });
  txt(p.title, 0, 50, 54, '#1b1433', { align: 'center', font: (isCJK(p.title) ? F_FANCY : F_CODE) + ',' + EMOJI, bold: false, max: 800 });
  if (p.sub) String(p.sub).split('\n').forEach((s2, k) => txt(s2, 0, 140 + k * 44, 32, p.acc, { align: 'center', max: 800, font: isCJK(s2) ? F_BODY : F_CODE }));
  ctx.restore();
};
// VS Code / github.dev 模拟：files = [[文件名, M/U/D, 出现, 暂存时间?]]，diff = [[出现, 文本, '+'|'-'|' ']]
const SCM = { M: '#e2c08d', U: '#73c991', D: '#f14c4c', A: '#73c991', C: '#f14c4c' };
PANEL.ide = (t, p) => {
  const x = p.x, y = p.y ?? 110, w = p.w, h = p.h ?? 660, sw = p.sw ?? 400;
  win(x, y, w, h, p.title || 'Visual Studio Code', p.acc || '#007acc', { bg: '#1e1e1e' });
  box(x + 6, y + 62, 70, h - 68, [0, 0, 0, 14], '#333333');
  ['📄', '🔍', '⑂', '▶', '⧉'].forEach((ic, i) => { const iy = y + 110 + i * 78, on = i === 2;
    if (on) { const pulse = p.pulse && t >= tAt(p.pulse[0]) && t < tAt(p.pulse[1]); if (pulse) { ctx.save(); ctx.shadowColor = CLUE; ctx.shadowBlur = 30 + 10 * Math.sin(t * 9); box(x + 14, iy - 30, 54, 60, 10, hexA(CLUE, 0.25), CLUE, 3); ctx.restore(); }
      ctx.fillStyle = '#fff'; ctx.fillRect(x + 6, iy - 30, 5, 60); }
    txt(ic, x + 41, iy, i === 2 ? 40 : 32, on ? '#fff' : '#858585', { align: 'center', font: (i === 2 ? F_CODE : EMOJI), bold: i === 2 });
    if (on) { const nf = (p.files || []).filter(f => t >= f._t && !(f._s && t >= f._s + 0.2 && p.badgeStaged === false)).length; if (nf) { ctx.fillStyle = '#007acc'; ctx.beginPath(); ctx.arc(x + 60, iy + 20, 14, 0, 7); ctx.fill(); txt(String(nf), x + 60, iy + 21, 18, '#fff', { align: 'center' }); } } });
  const sx = x + 76; box(sx, y + 62, sw, h - 68, 0, '#252526');
  txt(p.side || '源代码管理', sx + 20, y + 92, 20, '#bbbbbb', { font: F_BODY });
  let cy = y + 128;
  if (p.msg) { box(sx + 16, cy, sw - 32, 50, 6, '#3c3c3c', t >= p.msg._t && t < p.msg._t + 1.2 ? '#007acc' : '#3c3c3c', 2); const n = Math.floor(clamp((t - p.msg._t) / 0.7) * [...p.msg[1]].length);
    txt(n > 0 ? [...p.msg[1]].slice(0, n).join('') : '消息（Ctrl+Enter 提交）', sx + 30, cy + 26, 20, n > 0 ? '#ffffff' : '#8b8b8b', { font: F_BODY + ',' + F_CODE, bold: false, max: sw - 60 }); cy += 64; }
  if (p.commit) { const pr = p.commit._p != null && t >= p.commit._p && t < p.commit._p + 0.3; box(sx + 16, cy, sw - 32, 48, 6, pr ? '#1177bb' : '#0e639c'); txt(p.commitLabel || '✓ 提交', sx + sw / 2, cy + 25, 22, '#fff', { align: 'center', font: F_BODY + ',' + EMOJI }); cy += 66; }
  const isSt = f => f._s != null && t >= f._s && !(f._u != null && t >= f._u); const staged = (p.files || []).filter(isSt), changes = (p.files || []).filter(f => t >= f._t && !(isSt(f) && !f[4]));
  const fileRow = (f, yy, hi) => { if (hi) box(sx + 4, yy - 20, sw - 8, 40, 4, '#094771'); txt('📄 ' + f[0], sx + 30, yy, 22, '#cccccc', { font: F_CODE + ',' + EMOJI, bold: false, max: sw - 110 }); txt(f[1], sx + sw - 30, yy, 22, SCM[f[1]] || '#ccc', { align: 'right', font: F_CODE }); };
  if (staged.length) { txt('暂存的更改  ' + staged.length, sx + 20, cy, 18, '#bbbbbb', { font: F_BODY }); cy += 36; staged.forEach(f => { fileRow(f, cy, false);
    if (p.minus) { const m0 = tAt(p.minus), hot = t >= m0 - 0.5 && t < m0 + 0.3; if (hot) { ctx.save(); ctx.shadowColor = CLUE; ctx.shadowBlur = 20 + 8 * Math.sin(t * 9); } box(sx + sw - 92, cy - 16, 32, 32, 6, hot ? hexA(CLUE, 0.3) : '#3c3c3c', hot ? CLUE : null, 2); if (hot) ctx.restore(); txt('−', sx + sw - 76, cy, 26, '#fff', { align: 'center' }); }
    cy += 40; }); cy += 8; }
  if (changes.length) { txt('更改  ' + changes.length, sx + 20, cy, 18, '#bbbbbb', { font: F_BODY }); cy += 36; changes.forEach(f => { const a = clamp(prog(t, f._t, 0.2)); ctx.save(); ctx.globalAlpha *= a; fileRow(f, cy, p.open && f[0] === p.open[1] && t >= tAt(p.open[0])); ctx.restore(); cy += 40; }); }
  if (p.sync) { const pr = p.sync._p != null && t >= p.sync._p; const by = y + h - 70; const hot = t >= p.sync._t && !pr;
    if (hot) { ctx.save(); ctx.shadowColor = CLUE; ctx.shadowBlur = 24 + 8 * Math.sin(t * 8); } box(sx + 16, by, sw - 32, 48, 6, pr ? '#1177bb' : '#0e639c', hot ? CLUE : null, 3); if (hot) ctx.restore();
    txt((pr ? '⟳ ' : '⇅ ') + (p.sync[1] || '同步更改'), sx + sw / 2, by + 25, 22, '#fff', { align: 'center', font: F_BODY + ',' + F_CODE }); }
  // 编辑区
  const ex = sx + sw, ew = x + w - 6 - ex; box(ex, y + 62, ew, h - 68, [0, 0, 14, 0], '#1e1e1e');
  if (p.etitle) { box(ex, y + 62, ew, 44, 0, '#2d2d2d'); txt(p.etitle, ex + 20, y + 85, 20, '#cccccc', { font: F_CODE + ',' + F_BODY, bold: false, max: ew - 40 }); }
  const fs = p.dfs || 24, lh = fs * 1.7; let row = 0;
  (p.diff || []).forEach((d, i) => { if (t < d._t) return; const ly = y + (p.conf ? 165 : 140) + i * lh; const a = clamp(prog(t, d._t, 0.2)); ctx.save(); ctx.globalAlpha *= a;
    const bg = d[2] === '+' ? 'rgba(46,160,67,0.28)' : d[2] === '-' ? 'rgba(248,81,73,0.28)' : d[2] === '<' ? 'rgba(63,185,80,0.22)' : d[2] === '>' ? 'rgba(56,139,253,0.25)' : d[2] === '=' ? 'rgba(255,210,63,0.18)' : null;
    if (bg) box(ex + 8, ly - lh / 2 + 2, ew - 16, lh - 4, 4, bg);
    const sel = p.sel && t >= p.sel._t && i >= p.sel[1] && i <= p.sel[2]; if (sel) box(ex + 8, ly - lh / 2 + 2, ew - 16, lh - 4, 4, 'rgba(38,79,120,0.9)', '#3794ff', 2);
    txt(String(i + 1), ex + 40, ly, fs * 0.8, '#858585', { align: 'right', font: F_CODE, bold: false });
    txt(d[1], ex + 60, ly, fs, d[2] === '=' ? '#ffd23f' : '#d4d4d4', { font: F_CODE + ',' + F_BODY, bold: false, max: ew - 80 }); ctx.restore(); row++; });
  if (p.conf) { const cy2 = y + 108; const items = p.conf[1]; let cx2 = ex + 20; ctx.save(); ctx.globalAlpha *= clamp(prog(t, p.conf._t, 0.2));
    items.forEach((s2, k) => { ctx.font = `20px ${F_BODY}`; const ww = ctx.measureText(s2).width + 10; const hot = p.conf[2] === k && t >= p.conf._t + 0.6; txt(s2, cx2, cy2, 20, hot ? '#ffd23f' : '#9cdcfe', { font: F_BODY, bold: hot }); if (hot) { ctx.fillStyle = '#ffd23f'; ctx.fillRect(cx2, cy2 + 14, ww - 10, 3); } cx2 += ww + 14; txt('|', cx2 - 12, cy2, 20, '#555', { bold: false }); }); ctx.restore(); }
  if (p.menu && t >= p.menu._t) { const s = popIn(t, p.menu._t, 0.25), items = p.menu[1], mx = p.menu[3] ?? ex + 140, my = p.menu[4] ?? y + 300; ctx.save(); ctx.translate(mx, my); ctx.scale(s, s);
    box(0, 0, 380, items.length * 46 + 16, 8, '#252526', '#454545', 2); items.forEach((s2, k) => { const hot = k === p.menu[2] && t >= p.menu._t + 0.45; if (hot) box(6, 8 + k * 46, 368, 44, 4, '#094771'); txt(s2, 22, 30 + k * 46, 22, hot ? '#fff' : '#cccccc', { font: F_BODY + ',' + F_CODE, bold: false }); });
    ctx.restore(); }
  if (p.extra) p.extra(t, p, { ex, ew, sx, sw });
};

// ---- 嘉宾（含大肥鱼）：讲解块里插话 ----
function guest2(t, blk) {
  blk.entries.forEach(e => {
    if (e.k !== 'v' || e.id[0] === 'G') return;
    const a0 = e.vo - 0.25, a1 = e.t1 + 0.2; if (t < a0 || t > a1 + 0.3) return;
    const pi = eOut(prog(t, a0, 0.3)), po = eIn(prog(t, a1, 0.3)); const v = pi * (1 - po);
    ctx.fillStyle = `rgba(16,10,34,${0.42 * v})`; ctx.fillRect(640, -40, W, H + 80);
    const c = SQ[e.id[0]];
    sprite(e.pose, lerp(W + 450, 1560, pi) + po * 500, H + 40, 960, { scale: breath(t, 3) });
    const np = popIn(t, a0 + 0.1); if (np > 0 && po < 1) { ctx.save(); ctx.globalAlpha *= 1 - po; pill(1560, 150, c.n + ' · ' + c.role, c.col, np, { font: F_FANCY, fs: 46, fg: '#fff' }); ctx.restore(); }
  });
}

// ---- 讲解块模板 ----
function lec(name, cfg) {
  LECS.push([name, cfg]);
  SC[name] = (t, blk, en) => {
    bgLecture(t, cfg.acc); lecturer(t, blk, en, blk.t0);
    if (cfg.steps) stepBar(t, cfg.steps.map(s => [s[0], tAt(s[1])]), cfg.sx ?? 900, 70, cfg.sdx ?? 330, blk.t1, { t0: blk.t0 + 0.1, col: cfg.acc, fs: 24 });
    drawPanels(t, spPanels(cfg, blk));
    if (cfg.chap) probChap(t, blk.t0, cfg.chap);
    if (cfg.extra) cfg.extra(t, blk, en);
    guest2(t, blk);
  };
}
// ---- 提问块：左侧插图（大图标 + 小卡片）----
function qArt(emoji, lines, col, o = {}) {
  return (t, blk) => {
    const t0 = blk.t0, s = popIn(t, t0 + 0.1, 0.45), bob = Math.sin(t * 2.4) * 10;
    if (s > 0) { ctx.save(); ctx.translate(520, 330 + bob); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.7) * 0.04);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 175, 0, 7); ctx.fill(); ctx.lineWidth = 12; ctx.strokeStyle = col; ctx.stroke();
      txt(emoji, 0, 8, 170, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore(); }
    (lines || []).forEach((l, i) => miniCard(520, 610 + i * 92, l, col, popIn(t, t0 + 0.35 + i * 0.15), { w: 560, h: 72, fs: 28, rot: (i % 2 ? 0.02 : -0.02) }));
    if (o.draw) o.draw(t, blk);
  };
}
// ---- 冷开场模板：cfg = { bg:[c1,c2], pose, pill, cry:[文字, 时间], shake, panels(画在 860..1860) } ----
function coldScene(cfg) {
  cfg.geo = { x: 860, w: 1000 }; LECS.push(['cold', cfg]);
  SC.cold = (t, blk) => {
    const t0 = blk.t0; if (cfg.shake) { const [sx, sy] = shake(t, tAt(cfg.shake), 12, 0.35); ctx.translate(sx, sy); }
    bgBurst(t, cfg.bg[0], cfg.bg[1], W * 0.62, H * 0.5, 22, 0.35);
    drawPanels(t, spPanels(cfg, blk));
    if (cfg.shake && t >= tAt(cfg.shake)) flash(t, tAt(cfg.shake), 0.15, '255,80,120');
    const lead = blk.entries.find(e => e.k === 'v' && e.id[0] === 'D'); const others = blk.entries.filter(e => e.k === 'v' && e.id[0] !== 'D');
    if (others.length) guest2(t, { entries: others });
    const din = lead ? lead.vo - 0.4 : t0; const p = spring(prog(t, din, 0.9)); const dv = clamp(prog(t, din, 0.25));
    if (dv > 0) { ctx.save(); ctx.globalAlpha *= dv; sprite(cfg.pose, 440, H + 40, 980, { scale: lerp(1.2, 1, p) * breath(t, 1) }); ctx.restore();
      pill(440, 150, cfg.pill, SQ.D.col, popIn(t, din + 0.15), { font: F_FANCY, fs: 44, fg: '#fff' }); }
    if (cfg.cry && t >= tAt(cfg.cry[1])) fancy(cfg.cry[0], 440, 270, cfg.cry[2] || 80, t, tAt(cfg.cry[1]), { rot: -0.06, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
  };
  SFX_FNS.push(() => { if (cfg.shake) { const k = tAt(cfg.shake); sfx(k, 'impact', 0.6); sfx(k, 'buzz', 0.45); } if (cfg.cry) sfx(tAt(cfg.cry[1]), 'boing', 0.4);
    const lead = BK.cold.entries.find(e => e.k === 'v' && e.id[0] === 'D'); if (lead) sfx(lead.vo - 0.25, 'pop', 0.4);
    guestSfx(BK.cold.entries.filter(e => e.k === 'v' && e.id[0] !== 'D' && e.id[0] !== 'G').map(e => e.id)); });
}
// ---- 标题模板：cfg = { bg:[c1,c2], icons:[5], gpose, dpose, num, l1, l2 } ----
function titleScene(cfg) {
  SC.title = (t, blk) => {
    const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
    bgBurst(t, cfg.bg[0], cfg.bg[1], W * 0.6, H * 0.45, 28, 0.2);
    cfg.icons.forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / cfg.icons.length; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
    const gx = lerp(-400, 330, eBack(prog(t, t0, 0.5))); sprite(cfg.gpose, gx, H + 60, 1040);
    if (cfg.gextra) cfg.gextra(t, gx, H + 60, 1040);
    sprite(cfg.dpose, lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 780);
    fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
    const slam = prog(t, t0 + 0.8, 0.2);
    if (slam > 0) {
      ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
      badge(-420, -10, 95, '#ff5c8a', cfg.num, { fs: 46, rot: -0.15, fg: '#fff' });
      const n1 = [...cfg.l1].length, n2 = [...cfg.l2].length;
      fancy(cfg.l1, 60, -70, Math.min(120, 760 / Math.max(1, n1 * 0.62)), t, -99, FX.white);
      fancy(cfg.l2, 110, 80, Math.min(140, 820 / Math.max(1, n2 * 0.95)), t, -99, FX.yel);
      ctx.restore();
      speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
    }
    flash(t, t0 + 1.0, 0.2);
  };
  SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < cfg.icons.length; i++) sfx(b.t0 + 0.2 + i * 0.06, 'pop', 0.2); });
}
// ---- 片尾模板（块名 teaser：mix.py 靠它接片尾曲）：cfg = { head, next:[emoji, 标题, 副标题] | comment:true, end, dpose } ----
function outroScene(cfg) {
  SC.teaser = (t, blk, en) => {
    const st = blk.t0; bgStripes(t, '#5f3dc4');
    const outro = E('G07_02') + 0.2;
    const cur = en && en.k === 'v' ? en : U.G07_02;
    sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
    const ot = prog(t, S('G07_02'), 0.3);
    if (ot < 1) {
      fancy(cfg.head, 1260, 120, 92, t, st + 0.1, FX.white);
      const bp = popIn(t, P('G07_01', 0.2), 0.5);
      if (bp > 0) { ctx.save(); ctx.translate(1260, 480); ctx.scale(bp, bp); ctx.translate(-1260, -480);
        box(860, 250, 800, 440, 24, '#ffffff', '#5f3dc4', 6);
        txt(cfg.next ? '🎁 下个番外' : '💬 评论区点菜', 900, 305, 38, '#5f3dc4', { font: EMOJI + ',' + F_BODY });
        const rows = cfg.next ? [cfg.next] : cfg.rows;
        rows.forEach((c, i) => { const s = popIn(t, P('G07_01', 0.35 + i * 0.15)); if (s <= 0) return; const ry = rows.length === 1 ? 480 : 410 + i * 105; ctx.save(); ctx.translate(1260, ry); ctx.scale(s, s);
          const bh = rows.length === 1 ? 200 : 90; box(-360, -bh / 2, 720, bh, 16, '#f6f8fa', '#5f3dc4', 3);
          txt(c[0], -290, 0, rows.length === 1 ? 110 : 50, '#000', { align: 'center', font: EMOJI, bold: false });
          txt(c[1], rows.length === 1 ? -200 : -250, rows.length === 1 ? -30 : -14, rows.length === 1 ? 46 : 30, '#24292f', { font: F_BODY + ',' + F_CODE, max: 520 });
          txt(c[2], rows.length === 1 ? -200 : -250, rows.length === 1 ? 40 : 24, rows.length === 1 ? 28 : 22, '#5f3dc4', { font: F_BODY + ',' + F_CODE, bold: false, max: 520 }); ctx.restore(); });
        ctx.restore(); }
      fancy(cfg.tease || '敬请期待！', 1260, 820, 66, t, P('G07_01', 0.8), FX.pink);
    }
    if (ot > 0) {
      ctx.fillStyle = `rgba(10,8,22,${0.78 * ot})`; ctx.fillRect(...OS);
      [['👍', '点赞', '#ff5c8a'], ['🪙', '投币', '#ffd23f'], ['⭐', '收藏', '#3ec1ff']].forEach((ic, i) => {
        const a = popIn(t, S('G07_02') + 0.4 + i * 0.32, 0.4); if (a <= 0) return;
        const x = W / 2 + (i - 1) * 330, y = 440;
        ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(t * 5 + i) * 0.06);
        ctx.fillStyle = ic[2]; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
        ctx.font = `110px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic[0], 0, 8); ctx.restore();
        fancy(ic[1], x, y + 180, 60, t, S('G07_02') + 0.5 + i * 0.32, { c1: '#fff', c2: '#eee', stroke: ic[2] });
      });
      fancy(cfg.end || '一键三连，番外见！', W / 2, 180, 92, t, S('G07_02') + 1.4, { stagger: 0.04 });
      if (t > outro) {
        const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite(cfg.dpose || 'd_happy', 1690, H + 40, 640, { scale: sa }); }
        SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
      }
      ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
      ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
      ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
      ctx.restore();
    }
  };
  SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G07_01', 0.2), 'pop', 0.6); sfx(P('G07_01', 0.35), 'pop', 0.4); sfx(P('G07_01', 0.8), 'ding', 0.5);
    [0, 1, 2].forEach(k => sfx(S('G07_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G07_02') + 1.4, 'confetti', 0.4); });
}
// ---- 统一登记：讲解块面板音效 + 嘉宾音效 ----
SFX_FNS.push(() => LECS.forEach(([name, cfg]) => { const blk = BK[name]; if (!blk) return; spPanels(cfg, blk).forEach((p, i) => panelSfx(p, i === 0));
  if (name !== 'cold') guestSfx(blk.entries.filter(e => e.k === 'v' && e.id[0] !== 'G').map(e => e.id)); if (cfg.sfx) cfg.sfx(blk); }));
// ---- 提问块音效：角色滑入 + 气泡弹出 ----
SFX_FNS.push(() => Object.keys(PROB).forEach(b => { const blk = BK[b]; if (!blk) return; const vs = blk.entries.filter(e => e.k === 'v');
  vs.forEach((e, i) => { sfx(i === 0 ? blk.t0 : e.vo - 0.3, 'swoosh_in', 0.35); sfx((i === 0 ? blk.t0 : e.vo - 0.3) + 0.12, 'pop', 0.3); });
  const dq = vs.find(e => e.id[0] === 'D'); if (dq) { sfx(dq.vo + 0.35, 'pop', 0.4); sfx(dq.vo + 0.5, 'sparkle', 0.25); } sfx(blk.t0 + 0.1, 'pop', 0.3); }));

// ================= 番外5：提交规范与钩子 =================
Object.assign(SQ.K, { role: '翻历史' });
const MSGC = '#0ca678', TYPEC = '#e8590c', TMPC = '#1971c2', HOOKC = '#c2255c', PRAC = '#7048e8';

// ---- 钓竿上的鱼线 + 鱼钩（g_hook 立绘里鱼线太细抠不出来，这里画）----
function hookLine(t, x, by, h, a = 1) {
  const im = SPR.g_hook; if (!im || !im.width || a <= 0) return; const w = h * im.width / im.height;
  const tx = x + (0.945 - 0.5) * w, ty = by - h + 0.052 * h, L = h * 0.3, ang = Math.sin(t * 2.2) * 0.1;
  const ex = tx + Math.sin(ang) * L, ey = ty + Math.cos(ang) * L;
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.translate(ex, ey); ctx.rotate(ang); const s = h / 1180; ctx.scale(s, s);
  ctx.strokeStyle = '#1b1433'; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 46); ctx.arc(-16, 46, 16, 0, Math.PI, false); ctx.lineTo(-32, 34); ctx.stroke();
  ctx.strokeStyle = '#dfe6ee'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 46); ctx.arc(-16, 46, 16, 0, Math.PI, false); ctx.lineTo(-32, 34); ctx.stroke();
  ctx.fillStyle = '#dfe6ee'; ctx.beginPath(); ctx.moveTo(-32, 26); ctx.lineTo(-40, 40); ctx.lineTo(-25, 38); ctx.fill(); ctx.restore();
}
function hookIfPose(t, blk) {
  const gs = blk.entries.filter(e => e.k === 'v' && e.id[0] === 'G'); const cur = [...gs].reverse().find(e => e.vo - 0.15 <= t) || gs[0]; if (!cur || cur.pose !== 'g_hook') return;
  const i = gs.indexOf(cur), prev = i > 0 ? gs[i - 1].pose : null; const a = prev && prev !== 'g_hook' ? clamp(prog(t, cur.vo - 0.15, 0.2)) : 1;
  const pin = eOut(prog(t, blk.t0, 0.35)); hookLine(t, 300, H + 280 + (1 - pin) * 200, 1180 * breath(t), a);
}

// ---- 冷开场：看不懂的提交历史 ----
coldScene({ bg: ['#2b1d0e', '#e8590c'], pose: 'd_panic', pill: '大肥鱼 · 翻历史', cry: ['看不懂！', ['D01', 0.7]], shake: ['D01', 0.72],
  panels: [{ at: 0.05, k: 'term', title: '终端 — git log --oneline', acc: '#e8590c', y: 170, h: 470, fs: 28, lines: [
    [['D01', 0, -0.2], '$ git log --oneline'], ...[['a1b2c3d', '修改'], ['9f8e7d6', '改了点'], ['5c4b3a2', '再改一下'], ['1a2b3c4', '改'], ['0f9e8d7', '啊啊啊'], ['7d6c5b4', 'test'], ['3e2d1c0', '最终版'], ['8b7a6f5', '最终版2']]
      .map((r, i) => [['D01', 0.12 + i * 0.07], `{y}${r[0]} {w}${r[1]}`])],
    st: [[['D01', 0.75], '？？？', CLUE, 1600, 560, 80]] }] });

// ---- 引入 ----
lec('why', { acc: MSGC, panels: [{ at: 'G01_01', k: 'cards', tag: ['📜 提交说明', CLUE], items: [
  ['📝', '写给未来的自己', '说明要\n看得懂', MSGC, ['G01_01', 0.1]], ['🏷️', '通用写法', '约定式提交', TYPEC, ['G01_01', 0.55]], ['🪝', '钩子把关', '自动检查\n格式', HOOKC, ['G01_01', 0.8]]] }] });

titleScene({ bg: ['#3a0d1f', '#c2255c'], icons: ['📝', '🪝', '🏷️', '✅', '🐛'], gpose: 'g_hook', dpose: 'd_happy', num: '番外5', l1: '提交规范', l2: '与钩子！', gextra: (t, x, by, h) => hookLine(t, x, by, h) });

const PROB = {
  msgQ: { chap: ['技巧①', '好的说明', MSGC, F_BODY], q: '长什么样？', bg: ['#e0f8f1', '#bdeee0'], draw: qArt('📝', ['“修改” ❌', '“改了点” ❌'], MSGC) },
  typeQ: { chap: ['技巧②', '约定式提交', TYPEC, F_BODY], q: '能分个类吗？', bg: ['#fff0e0', '#ffd9b3'], draw: qArt('🗂️', ['一眼找出', '所有修 bug 的提交'], TYPEC) },
  tmplQ: { chap: ['技巧③', '提交模板', TMPC, F_BODY], q: '好麻烦……', bg: ['#e3f0ff', '#c4defc'], draw: qArt('😩', ['每次都要想格式'], TMPC) },
  hookQ: { chap: ['技巧④', '钩子把关', HOOKC, F_BODY], q: '有人乱写呢？', bg: ['#ffe3ee', '#ffc2d8'], draw: qArt('🪝', ['乱写的提交', '谁来拦？'], HOOKC) },
  askP: { chap: ['实战', '装上提交把关', PRAC, F_BODY], q: '装上把关！', bg: ['#efe8ff', '#dccfff'], draw: qArt('🛡️', ['写钩子 → 指过去', '试一试'], PRAC) },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);

// ---- 技巧①：标题 + 空行 + 原因 ----
lec('msg', { acc: MSGC, chap: PROB.msgQ.chap, panels: [
  { at: 'G02_01', k: 'edit', title: 'COMMIT_EDITMSG', y: 150, h: 420, fs: 34, lines: [
    [['G02_01', 0.08], '修复登录按钮在手机上错位', { type: 1, hl: [['G02_01', 0.08], ['G02_01', 0.5]] }],
    [['G02_01', 0.62], '手机屏幕窄时，按钮被挤到第二行，', { type: 1, row: 2 }], [['G02_01', 0.72], '改成 flex 布局并允许换行。', { type: 1, row: 3 }]],
    fx: [[['G02_01', 0.2], '标题 ≤ 50 字符', 'green', 960, 650, 52], [['G02_01', 0.5], '空一行', 'yel', 1300, 650, 52], [['G02_01', 0.75], '再写为什么', 'blue', 1660, 650, 52]] },
  { at: 'G02_02', k: 'cards', cw: 500, items: [['✅', '修复登录按钮错位', '直接写动作', OKC, ['G02_02', 0.1]], ['❌', '修改了一些东西', '等于没写', BADC, ['G02_02', 0.6]]],
    st: [[['G02_02', 0.72], '别这样', BADC, 1760, 700, 50, 0.12]] }] });

// ---- 技巧②：约定式提交 ----
function ccFormula(t, p) {
  const a = 'G03_01', y = 240; const parts = [['类型', TYPEC, 0.08], [':', '#fff', 0.14], ['空格', '#495057', 0.2], ['描述', MSGC, 0.26]]; ctx.font = `48px ${F_FANCY}`; const ws = parts.map(c => c[0] === ':' ? 60 : ctx.measureText(c[0]).width + 60); let x = 1270 - (ws.reduce((a, b) => a + b, 0) + 24 * 3) / 2;
  parts.forEach(c => { const s = popIn(t, tAt([a, c[2]])); ctx.font = `48px ${F_FANCY}`; const w = c[0] === ':' ? 60 : ctx.measureText(c[0]).width + 60;
    if (s > 0) { ctx.save(); ctx.translate(x + w / 2, y); ctx.scale(s, s); if (c[0] !== ':') box(-w / 2, -50, w, 100, 22, c[1], '#fff', 5); txt(c[0], 0, 2, 48, '#fff', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); }
    x += w + 24; });
  if (t >= tAt([a, 0.3])) txt('例：fix: 修复按钮错位', 1270, 340, 34, '#ffd27a', { align: 'center', font: F_CODE + ',' + F_BODY });
  [['✨', 'feat', '新功能', '#1f883d', 0.5], ['🐛', 'fix', '修 bug', BADC, 0.65], ['📖', 'docs', '改文档', AUTHC, 0.8]].forEach((c, i) => { const s = popIn(t, tAt([a, c[4]])); if (s <= 0) return;
    const cx = 920 + i * 350; ctx.save(); ctx.translate(cx, 580); ctx.scale(s, s); box(-150, -130, 300, 260, 24, '#fffaf0', c[3], 7);
    txt(c[0], 0, -60, 70, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 0, 30, 46, c[3], { align: 'center', font: F_CODE }); txt(c[2], 0, 90, 30, '#1b1433', { align: 'center' }); ctx.restore(); });
}
const AUTHC = '#0969da';
lec('type', { acc: TYPEC, chap: PROB.typeQ.chap, panels: [
  { at: 'G03_01', k: 'draw', fn: ccFormula, tag: ['🏷️ Conventional Commits', CLUE], tagY: 120 },
  { at: 'G03_02', k: 'cards', cw: 500, items: [['🎯', 'fix(login): …', '括号里写范围', TYPEC, ['G03_02', 0.1]], ['💥', 'feat!: …', '! = 破坏性改动', BADC, ['G03_02', 0.55]]] },
  { at: 'G03_03', k: 'term', title: '终端 — 筛出所有修复', y: 150, h: 400, fs: 27, lines: [
    [['G03_03', 0.1], '$ git log --oneline --grep "^fix"'], [['G03_03', 0.35], '{y}e4f1a2b {w}fix(login): 修复按钮错位'], [['G03_03', 0.38], '{y}b7c8d9e {w}fix: 修复米饭计数'],
    [['G03_03', 0.41], '{y}3a4b5c6 {w}fix(css): 手机端字体太小']],
    fx: [[['G03_03', 0.72], '还能自动生成更新日志', 'yel', null, 690, 56]] }] });

// ---- 技巧③：提交模板 ----
lec('tmpl', { acc: TMPC, chap: PROB.tmplQ.chap, panels: [
  { at: 'G04_01', k: 'term', title: '终端 — 设置模板', y: 180, h: 300, fs: 26, lines: [[['G04_01', 0.05], '$ git config --global commit.template ~/.gitmessage'], [['G04_01', 0.4], '$ git commit']] },
  { at: ['G04_01', 0.5], k: 'edit', title: 'COMMIT_EDITMSG（自动带上提示）', y: 150, h: 460, fs: 30, lines: [
    [['G04_01', 0.52], '█', { vcol: '#ffffff' }], [['G04_01', 0.55], '# 类型(范围): 描述   例：fix(login): 修复按钮错位', { vcol: '#8f8aa8', row: 1 }],
    [['G04_01', 0.6], '# 类型：feat / fix / docs', { vcol: '#8f8aa8', row: 2 }], [['G04_01', 0.65], '# 空一行，再写为什么要改', { vcol: '#8f8aa8', row: 3 }]],
    fx: [[['G04_01', 0.75], '不加 -m，提示自动出现', 'blue', null, 700, 56]] }] });

// ---- 技巧④：钩子 ----
const HOOK_SRC = [['#!/bin/sh', '#8f8aa8'], ['grep -qE "^(feat|fix|docs)(\\(.+\\))?!?: " "$1" || {'], ['  echo "提交说明格式不对！"'], ['  exit 1'], ['}']];
lec('hook', { acc: HOOKC, chap: PROB.hookQ.chap, extra: hookIfPose, panels: [
  { at: 'G05_01', k: 'edit', title: '.git/hooks/commit-msg', y: 150, h: 440, fs: 28, lines: HOOK_SRC.map((r, i) => [['G05_01', 0.3 + i * 0.1], r[0], { type: 1, vcol: r[1], row: i }]),
    fx: [[['G05_01', 0.2], '名字就叫 commit-msg', 'pink', null, 680, 54]] },
  { at: 'G05_02', k: 'flow', title: '每次提交都先过一遍', y: 420, items: [['git commit', '#24292f', ['G05_02', 0.05], '按下提交'], ['跑 commit-msg', HOOKC, ['G05_02', 0.25], '检查格式'], ['返回非零', BADC, ['G05_02', 0.55], '直接拒绝']],
    st: [[['G05_02', 0.72], '✗ 提交被拒', BADC, 1270, 660, 60]] },
  { at: 'G05_03', k: 'cards', cw: 470, items: [['🪝', 'commit-msg', '检查\n说明格式', HOOKC, ['G05_03', 0.05]], ['🧹', 'pre-commit', '提交前\n格式化 · 跑测试', MSGC, ['G05_03', 0.25]]] },
  { at: 'G05_04', k: 'term', title: '终端 — 团队共享钩子', y: 170, h: 380, fs: 27, lines: [
    [['G05_04', 0.05], '{r}# .git/hooks 不会跟着仓库走'], [['G05_04', 0.35], '{d}# 钩子放进仓库里的 .githooks/'], [['G05_04', 0.55], '$ git config core.hooksPath .githooks'], [['G05_04', 0.85], '{g}✓ 全队用同一套钩子']] },
  { at: 'G05_05', k: 'term', title: '终端 — 跳过钩子', tag: ['🔗 第7集：Actions', CLUE], tagY: 110, y: 170, h: 340, fs: 26, lines: [
    [['G05_05', 0.05], '$ git commit --no-verify -m "随便写"'], [['G05_05', 0.35], '{y}[main 9d8c7b6] 随便写    {r}← 钩子被跳过了']],
    st: [[['G05_05', 0.7], 'Actions 才是真把关', OKC, 1270, 650, 56]] }] });

// ---- 实战 ----
lec('practice', { acc: PRAC, chap: PROB.askP.chap, steps: [['写钩子', 'G06_01'], ['hooksPath', 'G06_02'], ['试一试', 'G06_03']], sx: 920, sdx: 350, panels: [
  { at: 'G06_01', k: 'edit', title: '.githooks/commit-msg', y: 150, h: 420, fs: 28, lines: HOOK_SRC.map((r, i) => [['G06_01', 0.15 + i * 0.12], r[0], { type: 1, vcol: r[1], row: i }]) },
  { at: 'G06_02', k: 'term', title: '终端 — 指过去 + 执行权限', y: 150, h: 340, fs: 27, lines: [[['G06_02', 0.05], '$ git config core.hooksPath .githooks'], [['G06_02', 0.55], '$ chmod +x .githooks/commit-msg']] },
  { at: 'G06_03', k: 'term', title: '终端 — 试一下', y: 150, h: 460, fs: 26, lines: [
    [['G06_03', 0.04], '$ git commit -m "改了点东西"'], [['G06_03', 0.25], '{r}提交说明格式不对！'], [['G06_03', 0.5], '$ git commit -m "fix: 修复按钮错位"'],
    [['G06_03', 0.75], '{g}[main 4e5f6a7] fix: 修复按钮错位']],
    st: [[['G06_03', 0.3], '被拒 ✗', BADC, 1640, 330, 46, 0.1], [['G06_03', 0.8], '提交成功 ✓', OKC, 1500, 680, 60]] }] });

outroScene({ head: '番外5 完！', next: ['🌐', '网页里写代码', '按一个键就能开写'], dpose: 'd_happy' });

// ================= 大肥鱼反应贴纸（每个都对应一个知识点）=================
const CAMEOS = [
  ['d_ok', P('G03_03', 0.8), E('G03_03')], ['d_sparkle', P('G04_01', 0.85), E('G04_01')], ['d_shock', P('G05_02', 0.85), E('G05_02')],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));

// ================= 主渲染 =================
function drawFrame(t) {
  const blk = BLOCKS.find(b => t >= b.t0 && t < b.t1) || BLOCKS[BLOCKS.length - 1];
  const en = blk.entries.find(e => t >= e.t0 && t < e.t1);
  ctx.save();
  const k = clamp((t - blk.t0) / Math.max(1, blk.t1 - blk.t0));
  { const z = 1 + 0.02 * k; ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); }
  (SC[blk.b] || (() => { }))(t, blk, en);
  ctx.restore();
  BLOCKS.forEach((b, i) => {
    if (i === 0) return; const p = prog(t, b.t0 - 0.16, 0.32); if (p <= 0 || p >= 1) return;
    const cols = ['#ffd23f', '#7c5cff', '#3ec1ff', '#ff5c8a', '#22c08b'];
    [0, 1].forEach(j => { const e = eIO(clamp(p * 1.15 - j * 0.12)); const x = lerp(-W * 0.9, W * 1.9, e); ctx.fillStyle = j ? '#ffffff' : cols[i % cols.length]; ctx.beginPath(); ctx.moveTo(x - 700, 0); ctx.lineTo(x + 300, 0); ctx.lineTo(x - 100, H); ctx.lineTo(x - 1100, H); ctx.fill(); });
  });
  CAMEOS.forEach(c => { if (t > c[1] - 0.1 && t < c[2] + 0.4) cameo(t, c[0], c[1], c[2]); });
  subtitle(t);
}
SFX_FNS.push(() => BLOCKS.forEach((b, i) => { if (i > 0) sfx(b.t0 - 0.12, 'whoosh', 0.45); }));
SFX_FNS.forEach(f => f());
SFX.sort((a, b) => a.t - b.t);

window.TIMELINE = { total: TOTAL, seq: ENTRIES.filter(e => e.k === 'v').map(e => ({ id: e.id, t0: e.t0, vo: e.vo, dur: e.dur, t1: e.t1 })), blocks: BLOCKS.map(b => ({ b: b.b, t0: b.t0, t1: b.t1 })), sfx: SFX };
window.renderAt = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.shadowBlur = 0; ctx.setLineDash([]);
  ctx.clearRect(0, 0, W, H); drawFrame(Math.min(t, TOTAL - 1e-3));
};
window.ready = (async () => {
  await Promise.all(SPR_NAMES.map(loadImg));
  await document.fonts.load(`80px "Smiley"`, '完了'); await document.fonts.ready;
  window.renderAt(0); return true;
})();
if (!window.__EXPORT__) window.ready.then(() => { const t0 = performance.now(); (function loop() { window.renderAt(((performance.now() - t0) / 1000) % TOTAL); requestAnimationFrame(loop); })(); });
