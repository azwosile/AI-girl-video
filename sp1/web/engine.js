// AI娘 Git课 · 番外1 渲染引擎 —— renderAt(t) 纯函数，逐帧确定性导出（通用部分沿用第1集）
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const F_FANCY = '"Smiley", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const F_BODY = '"Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const F_CODE = 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", "Microsoft YaHei", "Noto Sans CJK SC", monospace';

// ================= 素材 =================
const SPR = {};
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'g_cheer', 'g_warn', 'g_think', 'g_shock', 'g_proud', 'g_type', 'g_peace', 'g_awkward', 'g_present', 'd_panic', 'd_curious', 'd_happy', 'd_raise', 'd_think', 'd_shock', 'd_sparkle', 'd_ok', 'd_relief', 'd_leader', 'q_base', 'q_point', 'q_tea', 'c_base', 'c_ok', 'c_cool', 'm_base', 'm_panic', 'm_cheeky', 'x_base', 'x_angry', 'x_force', 'b_base', 'b_sorry', 'k_base', 'k_read', 'g_pill', 'd_pill', 'm_oops', 'q_alarm', 'b_wave', 'x_panic', 'k_diary', 'c_read', 'g_tag', 'd_party', 'b_proud', 'm_tag', 'x_thumb', 'k_scroll', 'd_tired', 'g_tools'];
// 竖版立绘只显示上半身：显示高度占整张图的比例（头顶到腰）
const SPRC = { d_panic: 0.55, d_curious: 0.55, d_happy: 0.55, d_sparkle: 0.6, d_ok: 0.66, d_raise: 0.72, d_think: 0.7, d_relief: 0.82, d_shock: 0.82, d_leader: 0.7, q_base: 0.6, q_point: 0.6, q_tea: 0.6, c_base: 0.58, c_ok: 0.58, c_cool: 0.58, m_base: 0.62, m_panic: 0.6, m_cheeky: 0.62, x_base: 0.6, x_angry: 0.6, x_force: 0.66, b_base: 0.62, b_sorry: 0.62, k_base: 0.6, k_read: 0.6, d_pill: 0.6, m_oops: 0.62, q_alarm: 0.6, b_wave: 0.62, x_panic: 0.62, k_diary: 0.6, c_read: 0.58, d_party: 0.68, b_proud: 0.6, m_tag: 0.62, x_thumb: 0.66, k_scroll: 0.62, d_tired: 0.6 };
const loadImg = n => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });


// ================= 台词（由 subtitles.json 生成，改台词请改 _gen_script.py）=================
const TEXT = {
  D01: "又打错了……一天敲几十遍 git status，手都要断了！",
  G01_01: "这期不讲新命令，送你几个用了就回不去的小技巧。",
  G01_02: "欢迎来到 AI娘 Git 课番外：Git 小技巧！",
  D02: "先问个怪事：换了台电脑提交，作者怎么变成一串奇怪的名字？",
  G02_01: "新电脑要先告诉 Git 你是谁：git config --global user.name 和 user.email。",
  G02_02: "邮箱和 GitHub 账号填一样的，提交记录上才会显示你的头像。",
  G02_03: "只想给这一个仓库换名字？去掉 --global，就只在当前仓库生效。",
  G02_04: "设没设好，git config --list 看一眼，所有设置都在这里。",
  D03: "那 git status 能不能少打几个字？",
  G03_01: "能！起个别名：git config --global alias.st status。",
  G03_02: "以后打 git st，就等于 git status。",
  G03_03: "别名随便起，但别和已有的命令重名，不然自己都搞不清。",
  G03_04: "再送一个：把 log --oneline --graph --all 起名叫 lg，提交和分支图一屏看完。",
  D04: "写了一下午，提交前……我到底改了哪些地方？",
  G04_01: "git diff：红色是删掉的，绿色是新加的，改了哪里一目了然。",
  G04_02: "已经 add 进暂存区的，要加 --staged 才看得到。",
  G04_03: "只想知道改了哪些文件？加 --stat，只列文件名和改动多少。",
  G04_04: "还能比两个版本：git diff v1.0 v1.1，上集打的标签这就用上了。",
  D05: "node_modules 早就提交上去了，现在写进 .gitignore，怎么还在？",
  G05_01: ".gitignore 只管还没被跟踪的文件；已经提交过的，Git 会一直盯着。",
  G05_02: "先 git rm -r --cached node_modules：从仓库里拿掉，本地文件还在，再提交。",
  G05_03: "想知道一个文件为什么被忽略？git check-ignore -v 文件名，是哪条规则一查便知。",
  G05_04: "不知道该忽略什么？在 GitHub 建仓库时选个 .gitignore 模板，常见的都写好了。",
  D06: "等等，信息量有点大，帮我总结一下！",
  G06_01: "config 设身份，alias 起别名，diff 看改动，rm --cached 补救忽略。",
  D07: "我现在就在白饭页上配一遍！",
  G07_01: "先设好名字和邮箱，再起 st 和 lg 两个别名。",
  G07_02: "git st 一看，node_modules 又冒出来了？rm --cached 拿掉，写进 .gitignore。",
  G07_03: "提交前 git diff --staged 检查一遍，没问题就提交！",
  D08: "手不酸了，提交也干净了！",
  G08_01: "下集正片：把白饭页变成一个真正的网站，GitHub Pages！",
  G08_02: "觉得有用就点赞、投币、收藏，我们下集见！",
};
const DUR = Object.assign({}, window.DUR || {});

// ================= 时间轴 =================
const V = (b, id, pose) => ({ k: 'v', b, id, pose });
const BEAT = (b, d) => ({ k: 'beat', b, d: b === 'teaser' ? d * 0.75 : d * 0.35 });
const CH_COL = ['#7c5cff', '#3ec1ff', '#22c08b', '#ffb020', '#ff5c8a', '#ff7a3d', '#a66bff', '#ffd23f'];
const PLAN = [
  V('cold', 'D01', 'd_tired'),
  V('title', 'G01_01', 'g_tools'), V('title', 'G01_02', 'g_cheer'), BEAT('title', 1.2),
  V('cfgQ', 'D02', 'd_think'),
  V('config', 'G02_01', 'g_explain'), V('config', 'G02_02', 'g_point'), V('config', 'G02_03', 'g_wink'), V('config', 'G02_04', 'g_type'),
  V('aliasQ', 'D03', 'd_curious'),
  V('alias', 'G03_01', 'g_cheer'), V('alias', 'G03_02', 'g_type'), V('alias', 'G03_03', 'g_warn'), V('alias', 'G03_04', 'g_proud'),
  V('diffQ', 'D04', 'd_panic'),
  V('diff', 'G04_01', 'g_present'), V('diff', 'G04_02', 'g_explain'), V('diff', 'G04_03', 'g_point'), V('diff', 'G04_04', 'g_wink'),
  V('ignQ', 'D05', 'd_shock'),
  V('ignore', 'G05_01', 'g_think'), V('ignore', 'G05_02', 'g_type'), V('ignore', 'G05_03', 'g_explain'), V('ignore', 'G05_04', 'g_peace'),
  V('ask6', 'D06', 'd_raise'),
  V('recap', 'G06_01', 'g_present'),
  V('askP', 'D07', 'd_sparkle'),
  V('practice', 'G07_01', 'g_type'), V('practice', 'G07_02', 'g_point'), V('practice', 'G07_03', 'g_explain'), V('practice', 'D08', 'd_party'),
  V('teaser', 'G08_01', 'g_explain'), V('teaser', 'G08_02', 'g_cheer'), BEAT('teaser', 8),
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

// ---- 通用组件（沿用第4集）----
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
