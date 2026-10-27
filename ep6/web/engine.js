// AI娘 Git课 · 第6集 渲染引擎 —— renderAt(t) 纯函数，逐帧确定性导出（通用部分沿用第1集）
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const F_FANCY = '"Smiley", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const F_BODY = '"Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const F_CODE = 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", "Microsoft YaHei", "Noto Sans CJK SC", monospace';

// ================= 素材 =================
const SPR = {};
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'g_cheer', 'g_warn', 'g_think', 'g_shock', 'g_proud', 'g_type', 'g_peace', 'g_awkward', 'g_present', 'd_panic', 'd_curious', 'd_happy', 'd_raise', 'd_think', 'd_shock', 'd_sparkle', 'd_ok', 'd_relief', 'd_leader', 'q_base', 'q_point', 'q_tea', 'c_base', 'c_ok', 'c_cool', 'm_base', 'm_panic', 'm_cheeky', 'x_base', 'x_angry', 'x_force', 'b_base', 'b_sorry', 'k_base', 'k_read', 'g_pill', 'd_pill', 'm_oops', 'q_alarm', 'b_wave', 'x_panic', 'k_diary', 'c_read', 'g_tag', 'd_party', 'b_proud', 'm_tag', 'x_thumb', 'k_scroll', 'g_web', 'd_phone', 'm_photo', 'x_doubt', 'b_point'];
// 竖版立绘只显示上半身：显示高度占整张图的比例（头顶到腰）
const SPRC = { d_panic: 0.55, d_curious: 0.55, d_happy: 0.55, d_sparkle: 0.6, d_ok: 0.66, d_raise: 0.72, d_think: 0.7, d_relief: 0.82, d_shock: 0.82, d_leader: 0.7, q_base: 0.6, q_point: 0.6, q_tea: 0.6, c_base: 0.58, c_ok: 0.58, c_cool: 0.58, m_base: 0.62, m_panic: 0.6, m_cheeky: 0.62, x_base: 0.6, x_angry: 0.6, x_force: 0.66, b_base: 0.62, b_sorry: 0.62, k_base: 0.6, k_read: 0.6, d_pill: 0.6, m_oops: 0.62, q_alarm: 0.6, b_wave: 0.62, x_panic: 0.62, k_diary: 0.6, c_read: 0.58, d_party: 0.68, b_proud: 0.6, m_tag: 0.62, x_thumb: 0.66, k_scroll: 0.62, d_phone: 0.66, m_photo: 0.6, x_doubt: 0.62, b_point: 0.62 };
const loadImg = n => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });


// ================= 台词（由 subtitles.json 生成，改台词请改 _gen_script.py）=================
const TEXT = {
  D01: "白饭页发给同学，他们打开全是代码……能不能像真网站一样，点个链接就能看？",
  G01_01: "能！GitHub Pages：把仓库里的网页直接变成网站，免费，还不用买服务器。",
  G01_02: "云存档只有自己翻；Pages 就是把它摆进展示柜，谁路过都能点开看。",
  G01_03: "欢迎来到 AI娘 Git 课，第六集，GitHub Pages！",
  D02: "要怎么开？是不是还得装什么东西？",
  G02_01: "什么都不用装：打开仓库的 Settings，左边点 Pages。",
  G02_02: "Source 选 Deploy from a branch，分支选 main，文件夹选 /(root)，点 Save。",
  G02_03: "网页要是放在 docs 文件夹里，文件夹就选 /docs，也一样能发布。",
  G02_04: "等一两分钟，上方出现 Your site is live，网址就有了。",
  G02_05: "格式是 用户名.github.io/仓库名，大肥鱼的就是 dafeiyu.github.io/baifan。",
  C01: "慢着。免费账号，仓库得是公开的；网站谁都能看，密码和密钥一个字都别放。",
  G02_06: "Claude 说得对。而且 Pages 只放静态网页：HTML、CSS、JavaScript，要登录、要数据库的后台，它跑不了。",
  C02: "公开、无密钥、纯静态。可以上线。",
  Q01: "用户反馈：网址打开，是一个大大的 404！",
  D03: "啊？我明明点了 Save 啊！",
  G03_01: "Pages 打开网址，先找一个叫 index.html 的首页，而且要放在你选的文件夹最外层。",
  G03_02: "你的首页叫 baifan.html，它找不到首页，只好给你 404。",
  G03_03: "改名成 index.html，全部小写；提交、推送，等一会儿刷新就好了。",
  Q02: "用户说打开了！还夸白饭页挺好看。",
  M01: "我给白饭页加了猫猫图，本地好好的，网上怎么是个裂开的图标？喵？",
  D04: "又是 Gemini……你图片放哪了？",
  G04_01: "看一眼：文件叫 Cat.png，代码里写的是 cat.png，大小写不一样。",
  G04_02: "你的电脑不分大小写，网站服务器分。差一个字母，它就找不到。",
  G04_03: "还有，路径别用斜杠开头：项目网站在 /baifan 下面，写 /img 会跑到网站最外层去找。",
  G04_04: "用相对路径，比如 img/cat.png，本地和网上都能用。",
  M02: "名字改成一样，猫猫出来了！",
  X01: "我改了标题，push 了，网页一点没变。这是真的吗？",
  D05: "我上次也是，还以为把网站弄坏了！",
  G05_01: "是真的，只是要等等：每次推送，GitHub 都会自动部署一遍，一般几分钟，最长十分钟左右。",
  G05_02: "去 Actions 页面看，pages build and deployment 打了绿勾，就是部署好了。",
  G05_03: "绿勾了还没变？多半是浏览器缓存，按 Ctrl+F5 强制刷新。",
  X02: "绿勾，强刷，标题变了。是真的。",
  K01: "我把 Pages 文档读完了。关键：默认会经过 Jekyll 处理，下划线开头的文件夹不会被发布。",
  D06: "我的图片全放在 _img 里……难怪一张都没有！",
  G06_01: "两个办法：一，文件夹改个名，别用下划线开头。",
  G06_02: "二，在根目录放一个空文件，名字叫 .nojekyll，Pages 就原样发布，不做处理。",
  K02: "一句话：下划线，要么改名，要么加 .nojekyll。",
  B01: "家人们！这网址后面还拖着仓库名，我想要 doubao.github.io，干干净净！",
  D07: "短网址？那我也想要一个！",
  G07_01: "可以：新建一个仓库，名字就叫 用户名.github.io，它就是你的个人主页。",
  G07_02: "个人主页每个账号只有一个；项目网站，每个仓库都能开一个。",
  G07_03: "想用自己买的域名，就在 Pages 设置里填 Custom domain，再勾上 Enforce HTTPS。",
  B02: "那我先把个人主页建了，域名……下回再买！",
  D08: "信息量好大，帮我收个尾！",
  G08_01: "开：Settings → Pages，选 main 和根目录，Save。",
  G08_02: "查：首页叫 index.html，大小写一致，用相对路径，下划线加 .nojekyll。",
  G08_03: "改：push 就自动部署，看 Actions 绿勾，再强制刷新。",
  D09: "我现在就让白饭页上线！",
  G09_01: "先把 baifan.html 改名成 index.html，图片挪出 _img，路径全改成相对路径。",
  G09_02: "提交、推送，再到 Settings → Pages，选 main 和根目录，Save。",
  G09_03: "Actions 打了绿勾，打开 dafeiyu.github.io/baifan，白饭页上线了！",
  G09_04: "再改一下今日推荐菜，push，等一会儿强制刷新，网站跟着变了。",
  G09_05: "手机也能打开，把链接发给同学，点开就是你的白饭页。",
  D10: "同学们都能点开了！白饭页，是真网站了！",
  G10_01: "下集预告：每次 push，自动帮你检查、测试、部署——GitHub Actions！",
  G10_02: "喜欢的话记得一键三连，我们下集见！",
};
const DUR = Object.assign({}, window.DUR || {});

// ================= 时间轴 =================
const V = (b, id, pose) => ({ k: 'v', b, id, pose });
const BEAT = (b, d) => ({ k: 'beat', b, d: b === 'teaser' ? d * 0.75 : d * 0.35 });
const CH_COL = ['#7c5cff', '#3ec1ff', '#22c08b', '#ffb020', '#ff5c8a', '#ff7a3d', '#a66bff', '#ffd23f'];
const PLAN = [
  V('cold', 'D01', 'd_curious'),
  V('why', 'G01_01', 'g_web'), V('why', 'G01_02', 'g_explain'),
  V('title', 'G01_03', 'g_cheer'), BEAT('title', 1.4),
  V('pagesQ', 'D02', 'd_think'),
  V('pages', 'G02_01', 'g_point'), V('pages', 'G02_02', 'g_type'), V('pages', 'G02_03', 'g_explain'), V('pages', 'G02_04', 'g_web'), V('pages', 'G02_05', 'g_present'), V('pages', 'C01', 'c_cool'), V('pages', 'G02_06', 'g_warn'), V('pages', 'C02', 'c_ok'),
  V('q404', 'Q01', 'q_alarm'), V('q404', 'D03', 'd_shock'),
  V('index', 'G03_01', 'g_explain'), V('index', 'G03_02', 'g_awkward'), V('index', 'G03_03', 'g_type'), V('index', 'Q02', 'q_point'),
  V('imgQ', 'M01', 'm_photo'), V('imgQ', 'D04', 'd_curious'),
  V('path', 'G04_01', 'g_think'), V('path', 'G04_02', 'g_explain'), V('path', 'G04_03', 'g_warn'), V('path', 'G04_04', 'g_point'), V('path', 'M02', 'm_cheeky'),
  V('updQ', 'X01', 'x_doubt'), V('updQ', 'D05', 'd_happy'),
  V('update', 'G05_01', 'g_explain'), V('update', 'G05_02', 'g_point'), V('update', 'G05_03', 'g_wink'), V('update', 'X02', 'x_thumb'),
  V('jekQ', 'K01', 'k_read'), V('jekQ', 'D06', 'd_panic'),
  V('jekyll', 'G06_01', 'g_think'), V('jekyll', 'G06_02', 'g_type'), V('jekyll', 'K02', 'k_scroll'),
  V('userQ', 'B01', 'b_point'), V('userQ', 'D07', 'd_sparkle'),
  V('user', 'G07_01', 'g_present'), V('user', 'G07_02', 'g_explain'), V('user', 'G07_03', 'g_type'), V('user', 'B02', 'b_wave'),
  V('ask8', 'D08', 'd_raise'),
  V('recap', 'G08_01', 'g_present'), V('recap', 'G08_02', 'g_explain'), V('recap', 'G08_03', 'g_proud'),
  V('askP', 'D09', 'd_leader'),
  V('practice', 'G09_01', 'g_cheer'), V('practice', 'G09_02', 'g_type'), V('practice', 'G09_03', 'g_web'), V('practice', 'G09_04', 'g_type'), V('practice', 'G09_05', 'g_proud'), V('practice', 'D10', 'd_phone'),
  V('teaser', 'G10_01', 'g_explain'), V('teaser', 'G10_02', 'g_cheer'), BEAT('teaser', 8),
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
// ---- 讲解①：开启 Pages（Claude：公开、不放密钥）----
SC.pages = (t, blk, en) => {
  bgLecture(t, PGC); lecturer(t, blk, en, blk.t0);
  const g5 = S('G02_05') - 0.15, g6 = S('G02_06') - 0.15;
  const sa = 1 - eIO(prog(t, g5, 0.3));
  if (sa > 0) {
    const st = { hi: t >= P('G02_01', 0.55), src: t >= P('G02_02', 0.12) ? 'Deploy from a branch' : null, srcHot: t >= P('G02_02', 0.05) && t < P('G02_02', 0.35),
      br: t >= P('G02_02', 0.42) ? 'main' : null, brHot: t >= P('G02_02', 0.35) && t < P('G02_02', 0.6), dirHot: (t >= P('G02_02', 0.6) && t < P('G02_02', 0.82)) || (t >= S('G02_03') && t < E('G02_03')),
      dir: t >= S('G02_03') + 0.1 && t < P('G02_03', 0.9) ? '/docs' : '/ (root)', docs: t >= S('G02_03') && t < P('G02_03', 0.9) ? prog(t, S('G02_03'), 0.2) : 0,
      saved: t >= P('G02_02', 0.86), press: t >= P('G02_02', 0.86) && t < P('G02_02', 0.86) + 0.2, live: prog(t, P('G02_04', 0.4), 0.3) };
    ctx.save(); ctx.globalAlpha = sa; const ss = popIn(t, blk.t0 + 0.05, 0.4);
    ctx.translate(1270, 480); ctx.scale(ss, ss); ctx.translate(-1270, -480);
    settingsPage(t, 680, 120, 1180, 740, st);
    if (t >= P('G02_01', 0.55) && t < S('G02_02')) { const p = eOut(prog(t, P('G02_01', 0.55), 0.3)); txt('👆', 850, 650 + (1 - p) * 60, 64, '#000', { font: EMOJI, bold: false }); }
    if (t >= P('G02_02', 0.86) && t < S('G02_03')) txt('👆', 1600, 740, 64, '#000', { font: EMOJI, bold: false });
    ctx.restore();
    if (t >= S('G02_01') && t < P('G02_01', 0.55)) note(1270, 940, popIn(t, S('G02_01')), '什么都不用装 · 免费', PGC, { fs: 38 });
    if (t >= P('G02_04', 0.45) && t < g5) { sparkle(t, P('G02_04', 0.45), 1400, 360, 260, 12); fancy('网站上线！', 1300, 880, 70, t, P('G02_04', 0.45), FX.green); }
  }
  const c1 = S('C01') - 0.3;
  if (t >= g5 && t < c1 + 0.3) { // 网址格式（Claude 开口前退场）
    const a = eOut(prog(t, g5, 0.3)) * (1 - prog(t, c1, 0.3)); ctx.save(); ctx.globalAlpha = a;
    txt('网址格式', 1270, 200, 46, '#fff', { align: 'center', font: F_FANCY, bold: false });
    urlParts(1270, 340, popIn(t, g5 + 0.1, 0.4), [['用户名', '#ffd23f', ''], ['.github.io', '#ece9f7', ''], ['/仓库名', '#7cf07a', '']], 60);
    urlParts(1270, 560, popIn(t, P('G02_05', 0.5), 0.4), [['dafeiyu', '#ffd23f', '用户名'], ['.github.io', '#ece9f7'], ['/baifan', '#7cf07a', '仓库名']], 60);
    ctx.restore();
  }
  if (t >= g6) { // 静态网页：能放 / 不能放
    const a = eOut(prog(t, g6, 0.3)); ctx.save(); ctx.globalAlpha = a;
    txt('✅ 能放：静态网页', 760, 230, 44, '#7cf07a', {});
    [['📄', 'HTML', '#ff7a3d'], ['🎨', 'CSS', '#3ec1ff'], ['⚙️', 'JavaScript', '#ffd23f']].forEach((c, i) => fileChip(860 + i * 330, 340, 0.85 * popIn(t, P('G02_06', 0.2 + i * 0.08)), c[0], c[1], c[2]));
    txt('❌ 跑不了：后台', 760, 520, 44, '#ff6b81', {});
    [['🔐', '登录', 0.6], ['🗄️', '数据库', 0.68]].forEach((c, i) => { const s = popIn(t, P('G02_06', c[2])); if (s <= 0) return; fileChip(900 + i * 380, 630, 0.85 * s, c[0], c[1], '#ff3b5c'); bigX(900 + i * 380, 630, 40, '#ff3b5c', prog(t, P('G02_06', c[2]) + 0.2, 0.3)); });
    ctx.restore();
  }
  guest(t, blk);
  if (t >= P('C01', 0.45) && t < E('C01') + 0.2) { note(1150, 330, popIn(t, P('C01', 0.15)), '🌐 仓库要公开', '#e07a3d', { fs: 40 }); note(1150, 470, popIn(t, P('C01', 0.6)), '🔑 密码密钥 ✗', '#ff3b5c', { fs: 40 }); }
  if (t >= P('C02', 0.5)) stamp(t, P('C02', 0.5), 1180, 520, '可以上线 ✓', '#22c08b', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['C01', 'C02']); const b = BK.pages; sfx(b.t0 + 0.05, 'swoosh_in', 0.4); sfx(P('G02_01', 0.55), 'click', 0.6);
  [0.12, 0.42].forEach(f => sfx(P('G02_02', f), 'click', 0.5)); sfx(P('G02_02', 0.86), 'click', 0.7); sfx(S('G02_03'), 'pop', 0.4); sfx(P('G02_04', 0.4), 'ding', 0.6); sfx(P('G02_04', 0.45), 'sparkle', 0.5);
  sfx(S('G02_05') - 0.05, 'swoosh_in', 0.4); sfx(P('G02_05', 0.5), 'pop', 0.5); sfx(S('G02_06') - 0.15, 'swoosh_in', 0.4); [0.2, 0.28, 0.36].forEach(f => sfx(P('G02_06', f), 'pop', 0.3)); [0.6, 0.68].forEach(f => sfx(P('G02_06', f) + 0.2, 'buzz', 0.3));
  sfx(P('C01', 0.15), 'pop', 0.4); sfx(P('C01', 0.6), 'buzz', 0.4); sfx(P('C02', 0.5), 'stamp', 0.7); });

// ---- 讲解②：首页必须叫 index.html ----
const T_IDX = retime([
  { t: 0, s: 'git mv baifan.html index.html', cmd: true },
  { t: 0, s: 'git commit -m "首页改名 index.html"', cmd: true, dur: 0.6 },
  { t: 0, s: 'git push', cmd: true, dur: 0.3 },
  { t: 0, s: '{g}   main -> main' },
], [['G03_03', 0.3], ['G03_03', 0.55], ['G03_03', 0.7], ['G03_03', 0.78]]);
SC.index = (t, blk, en) => {
  bgLecture(t, '#e0485e'); lecturer(t, blk, en, blk.t0);
  const rn = P('G03_03', 0.3), bad = t >= S('G03_02') && t < rn;
  const nm = flipText(t, [[-1, 'baifan.html'], [rn, 'index.html']]);
  fileTree(700, 150, 560, [[nm.s, bad ? 'bad' : t >= rn ? 'good' : '', null, nm.s, nm.sc], ['style.css', ''], ['img/', '']], { col: '#e0485e', root: '根目录 /(root)' });
  // 放大镜：Pages 在找 index.html
  const ms = popIn(t, P('G03_01', 0.15), 0.4); if (ms > 0 && t < S('G03_03')) { const mx = 1500 + Math.sin(t * 2.4) * 60, my = 300 + Math.cos(t * 1.8) * 30;
    ctx.save(); ctx.translate(mx, my); ctx.scale(ms, ms); txt('🔍', 0, 0, 120, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore();
    note(1560, 450, popIn(t, P('G03_01', 0.3)), '找：index.html', '#ffd23f', { fs: 36 }); }
  if (t >= P('G03_01', 0.6) && t < S('G03_02')) note(980, 560, popIn(t, P('G03_01', 0.6)), '全小写 · 放最外层', '#ffd23f', { fs: 36 });
  if (bad) { const s = popIn(t, P('G03_02', 0.55), 0.4); if (s > 0) { const cy = siteWin(1100, 500, 560, 380, 'dafeiyu.github.io/baifan', { ufs: 20 }); page404(1380, cy - 10, 0.75 * s); } }
  if (t >= S('G03_03') - 0.1) {
    terminal(t, 690, 560, 760, 300, T_IDX, { fs: 24, title: '终端', accent: '#e0485e', alpha: eOut(prog(t, S('G03_03') - 0.1, 0.3)) });
    const ok = P('G03_03', 0.85); if (t >= ok) { const s = popIn(t, ok, 0.45); ctx.save(); ctx.translate(1660, 680); ctx.scale(s, s); ctx.translate(-1660, -680); const cy = siteWin(1470, 520, 380, 320, 'github.io/baifan', { ufs: 18 }); baifanPage(1660, cy + 6, 350); ctx.restore(); }
  }
  guest(t, blk);
  if (t >= P('Q02', 0.4)) stamp(t, P('Q02', 0.4), 1180, 520, '打开了 ✓', '#22c08b', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['Q02']); sfx(P('G03_01', 0.15), 'pop', 0.5); sfx(P('G03_01', 0.3), 'pop', 0.3); sfx(P('G03_01', 0.6), 'ding', 0.4); sfx(S('G03_02'), 'buzz', 0.5); sfx(P('G03_02', 0.55), 'impact', 0.5);
  sfx(P('G03_03', 0.3), 'click', 0.5); sfx(P('G03_03', 0.85), 'sparkle', 0.5); sfx(P('Q02', 0.4), 'stamp', 0.7); });

// ---- 讲解③：大小写 + 相对路径（Gemini 猫猫图）----
SC.path = (t, blk, en) => {
  bgLecture(t, '#a66bff'); lecturer(t, blk, en, blk.t0);
  const g3 = S('G04_03') - 0.15, a1 = 1 - prog(t, g3, 0.3);
  if (a1 > 0) { ctx.save(); ctx.globalAlpha = a1;
    fileChip(980, 230, popIn(t, blk.t0 + 0.1), '🖼️', 'Cat.png', '#a66bff'); txt('文件', 980, 150, 30, '#c9c3dd', { align: 'center' });
    const cs = popIn(t, blk.t0 + 0.2); if (cs > 0) { ctx.save(); ctx.translate(1560, 230); ctx.scale(cs, cs); box(-290, -46, 580, 92, 16, '#0f0c1f', '#a66bff', 5); txt('<img src="cat.png">', 0, 2, 32, '#ece9f7', { align: 'center', font: F_CODE }); ctx.restore(); }
    txt('代码', 1560, 150, 30, '#c9c3dd', { align: 'center' });
    const hc = P('G04_01', 0.55); if (t >= hc) { const p = eOut(prog(t, hc, 0.3)); ctx.save(); ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = 7;
      ctx.font = `bold 34px ${F_CODE}`; const fw = ctx.measureText('Cat.png').width + 120, cw = ctx.measureText('C').width; const cx1 = 980 - fw / 2 + 88 + cw / 2;
      ctx.font = `bold 32px ${F_CODE}`; const sw2 = ctx.measureText('<img src="cat.png">').width, pre = ctx.measureText('<img src="').width, cw2 = ctx.measureText('c').width; const cx2 = 1560 - sw2 / 2 + pre + cw2 / 2;
      ctx.beginPath(); ctx.ellipse(cx1, 228, 26, 34, 0, 0, p * 7); ctx.stroke(); ctx.beginPath(); ctx.ellipse(cx2, 232, 22, 30, 0, 0, p * 7); ctx.stroke(); ctx.restore();
      fancy('C ≠ c', 1270, 360, 80, t, hc + 0.1, FX.red); }
    const g2 = S('G04_02') - 0.1; if (t >= g2) {
      [['💻 你的电脑', 'Cat = cat', '#7cf07a', '✓'], ['🌐 网站服务器', 'Cat ≠ cat', '#ff6b81', '✗']].forEach((c, i) => { const s = popIn(t, i ? P('G04_02', 0.35) : g2, 0.4); if (s <= 0) return; ctx.save(); ctx.translate(960 + i * 500, 640); ctx.scale(s, s);
        box(-230, -150, 460, 300, 26, 'rgba(255,255,255,0.08)', c[2], 6); txt(c[0], 0, -90, 40, '#fff', { align: 'center' }); txt(c[1], 0, 10, 52, c[2], { align: 'center', font: F_CODE }); txt(c[3], 0, 100, 60, c[2], { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); });
      if (t >= P('G04_02', 0.7)) fancy('差一个字母就找不到！', 1220, 880, 58, t, P('G04_02', 0.7), FX.yel);
    }
    ctx.restore();
  }
  if (t >= g3) { // 网站目录：/img 跑到最外层
    const a = eOut(prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a;
    box(700, 140, 1160, 470, 24, 'rgba(255,255,255,0.06)', '#8f8aa8', 4);
    txt('🌐 dafeiyu.github.io/', 740, 200, 36, '#ffd23f', { font: F_CODE });
    txt('📁 img/  ← 这里没有！', 800, 290, 32, '#ff9aa9', { font: F_CODE });
    txt('📁 baifan/   ← 你的项目网站', 800, 380, 32, '#9dffbf', { font: F_CODE });
    txt('📁 img/cat.png', 880, 460, 32, '#ece9f7', { font: F_CODE }); txt('📄 index.html', 880, 530, 32, '#ece9f7', { font: F_CODE });
    const w1 = P('G04_03', 0.45); if (t >= w1 && t < S('G04_04')) { cmdBar(t, 1270, 700, 'src="/img/cat.png"', w1, 0.5, { fs: 34, col: '#ff3b5c' }); arrow(1040, 650, 1040, 320, '#ff3b5c', eOut(prog(t, w1 + 0.5, 0.4)), 10); if (t >= w1 + 0.8) bigX(1260, 290, 26, '#ff3b5c', prog(t, w1 + 0.8, 0.3)); }
    const w2 = S('G04_04'); if (t >= w2) { cmdBar(t, 1270, 700, 'src="img/cat.png"', w2 + 0.1, 0.5, { fs: 34, col: '#7cf07a' }); arrow(1500, 650, 1180, 480, '#7cf07a', eOut(prog(t, w2 + 0.6, 0.4)), 10);
      if (t >= P('G04_04', 0.6)) fancy('相对路径：本地网上都能用', 1270, 870, 56, t, P('G04_04', 0.6), FX.green); }
    ctx.restore();
  }
  guest(t, blk);
  if (t >= P('M02', 0.45)) { const s = popIn(t, P('M02', 0.45), 0.4); ctx.save(); ctx.translate(1100, 480); ctx.scale(s, s); box(-150, -120, 300, 240, 20, '#fff3d6', '#a66bff', 6); txt('🐱', 0, 6, 150, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore(); sparkle(t, P('M02', 0.45), 1100, 480, 200, 10); }
};
SFX_FNS.push(() => { guestSfx(['M02']); const b = BK.path; sfx(b.t0 + 0.1, 'pop', 0.4); sfx(b.t0 + 0.2, 'pop', 0.4); sfx(P('G04_01', 0.55), 'buzz', 0.5); sfx(S('G04_02') - 0.1, 'pop', 0.4); sfx(P('G04_02', 0.35), 'pop', 0.4); sfx(P('G04_02', 0.7), 'ding', 0.4);
  sfx(S('G04_03') - 0.15, 'swoosh_in', 0.4); const w1 = P('G04_03', 0.45); cmdAt(w1, 'src="/img/cat.png"', 0.5); sfx(w1 + 0.8, 'buzz', 0.5); cmdAt(S('G04_04') + 0.1, 'src="img/cat.png"', 0.5); sfx(P('G04_04', 0.6), 'ding', 0.5); sfx(P('M02', 0.45), 'sparkle', 0.6); });

// ---- 讲解④：推送后要等部署（Grok：这是真的吗）----
SC.update = (t, blk, en) => {
  bgLecture(t, '#22a06b'); lecturer(t, blk, en, blk.t0);
  const steps = [['⬆', 'push'], ['🏗️', '构建'], ['🚀', '部署'], ['🌐', '上线']];
  const top = S('G05_02') - 0.15;
  const py = lerp(330, 190, eIO(prog(t, top, 0.35))), ps = lerp(1, 0.7, eIO(prog(t, top, 0.35)));
  const g3 = S('G05_03') - 0.15; const sfa = 1 - prog(t, g3, 0.3);
  if (sfa > 0) steps.forEach((s, i) => { const a = popIn(t, P('G05_01', 0.12 + i * 0.1)) * sfa; if (a <= 0) return; const x = 840 + i * 300;
    const lit = t >= P('G05_01', 0.15 + i * 0.12); ctx.save(); ctx.translate(x, py); ctx.scale(a * ps, a * ps);
    ctx.fillStyle = lit ? '#22c08b' : '#3a3358'; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = '#fff'; ctx.stroke();
    txt(s[0], 0, -10, 70, '#000', { align: 'center', font: EMOJI, bold: false }); txt(s[1], 0, 130, 36, '#fff', { align: 'center' }); ctx.restore();
    if (i) arrow(x - 300 + 100 * ps, py, x - 100 * ps, py, '#fff', prog(t, P('G05_01', 0.15 + i * 0.12) - 0.1, 0.25), 10); });
  if (t >= P('G05_01', 0.6) && t < top) { const s = popIn(t, P('G05_01', 0.6), 0.4); ctx.save(); ctx.translate(1290, 680); ctx.scale(s, s); box(-330, -90, 660, 180, 30, '#fff', '#22a06b', 7);
    txt('⏱', -250, 2, 80, '#000', { align: 'center', font: EMOJI, bold: false }); txt('一般几分钟', 40, -30, 46, '#1b1433', { align: 'center' }); txt('最长 ≈ 10 分钟', 40, 36, 40, '#cf222e', { align: 'center' }); ctx.restore(); }
  if (t >= top && t < g3 + 0.3) { const a = eOut(prog(t, top, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a;
    box(700, 330, 1160, 520, 20, '#ffffff', '#d0d7de', 3); box(700, 330, 1160, 70, [20, 20, 0, 0], '#f6f8fa', '#d0d7de', 2);
    txt('▶ Actions · All workflows', 730, 366, 30, '#24292f', {});
    const done = P('G05_02', 0.6);
    actionsList(t, 730, 430, 1100, [['pages build and deployment', t >= done ? 1 : 0, prog(t, top + 0.1, 0.2), 'main · 改标题', '58s'], ['pages build and deployment', 1, prog(t, top + 0.2, 0.2), 'main · 首页改名 index.html', '1m 3s'], ['pages build and deployment', 1, prog(t, top + 0.3, 0.2), 'main · 第一次上线', '1m 12s']]);
    ctx.restore(); if (t >= done) { sparkle(t, done, 775, 470, 120, 8); note(1640, 366, popIn(t, done), '绿勾 = 部署好了', '#22c08b', { fs: 36 }); } }
  if (t >= g3) { const a = eOut(prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a;
    const kt = P('G05_03', 0.55), pr = t >= kt && t < kt + 0.25;
    const cy = siteWin(700, 330, 640, 520, 'dafeiyu.github.io/baifan', { ufs: 22, reload: t >= kt ? prog(t, kt, 0.5) : 0 });
    baifanPage(1020, cy + 10, 600, { title: t >= kt + 0.4 ? '🍚 白饭页 · 新标题' : '🍚 白饭页' });
    note(1020, 280, popIn(t, P('G05_03', 0.1)), '浏览器缓存：还是旧的', '#ffd23f', { fs: 32 });
    keycap(1490, 560, popIn(t, P('G05_03', 0.4)), 'Ctrl', { press: pr }); txt('+', 1600, 560, 70, '#fff', { align: 'center', font: F_FANCY, bold: false }); keycap(1710, 560, popIn(t, P('G05_03', 0.45)), 'F5', { press: pr });
    if (t >= kt + 0.2) fancy('强制刷新！', 1600, 730, 70, t, kt + 0.2, FX.green);
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('X02', 0.6)) stamp(t, P('X02', 0.6), 1180, 520, '是真的 ✓', '#22c08b', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['X02']); for (let i = 0; i < 4; i++) sfx(P('G05_01', 0.12 + i * 0.1), 'pop', 0.35); sfx(P('G05_01', 0.6), 'ding', 0.4);
  sfx(S('G05_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G05_02', 0.6), 'ding', 0.6); sfx(S('G05_03') - 0.15, 'swoosh_in', 0.4); sfx(P('G05_03', 0.4), 'pop', 0.3); sfx(P('G05_03', 0.55), 'click', 0.7); sfx(P('G05_03', 0.55) + 0.2, 'whoosh', 0.4); sfx(P('X02', 0.6), 'stamp', 0.7); });

// ---- 讲解⑤：下划线文件夹 / .nojekyll（Kimi 读文档）----
const T_JEK = retime([
  { t: 0, s: 'git mv _img img', cmd: true, dur: 0.4 },
  { t: 0, clear: true },
  { t: 0, s: '{d}# 或者：根目录放一个空文件' },
  { t: 0, s: 'touch .nojekyll', cmd: true, dur: 0.4 },
  { t: 0, s: 'git add .nojekyll', cmd: true, dur: 0.4 },
], [['G06_01', 0.45], ['G06_02', 0.0], ['G06_02', 0.05], ['G06_02', 0.3], ['G06_02', 0.5]]);
SC.jekyll = (t, blk, en) => {
  bgLecture(t, '#34407a'); lecturer(t, blk, en, blk.t0);
  const g2 = S('G06_02'), rn = P('G06_01', 0.55), nj = P('G06_02', 0.35);
  const opt2 = t >= g2 - 0.1;
  const nm = opt2 ? { s: '_img/', sc: 1 } : flipText(t, [[-1, '_img/'], [rn, 'img/']]);
  const rows = [['index.html', ''], ['style.css', ''], [nm.s, opt2 ? (t >= nj ? 'good' : 'bad') : (t >= rn ? 'good' : 'bad'), null, nm.s, nm.sc], ['   cat.png', (!opt2 && t < rn) || (opt2 && t < nj) ? 'ghost' : '']];
  if (opt2) rows.unshift(['.nojekyll', t >= nj ? 'good' : '', prog(t, nj - 0.05, 0.3)]);
  fileTree(700, 140, 540, rows, { col: '#6b7cff' });
  pill(1560, 200, opt2 ? '办法②：加 .nojekyll' : '办法①：改名', opt2 ? '#7cf07a' : '#ffd23f', popIn(t, opt2 ? g2 - 0.1 : S('G06_01')), { fs: 36, font: F_BODY });
  terminal(t, 1280, 290, 590, 300, T_JEK, { fs: 24, title: '终端', accent: '#6b7cff', alpha: eOut(prog(t, S('G06_01'), 0.3)) });
  if (opt2 && t >= nj) { const s = popIn(t, nj + 0.2); if (s > 0) { ctx.save(); ctx.translate(1580, 720); ctx.scale(s, s); box(-90, -110, 180, 220, 14, '#fff', '#1b1433', 6); txt('空', 0, 0, 60, '#c9c3dd', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); } note(1580, 880, popIn(t, P('G06_02', 0.7)), '原样发布 · 不做处理', '#7cf07a', { fs: 32 }); }
  if (!opt2 && t >= rn + 0.3) fancy('别用 _ 开头', 1580, 760, 70, t, rn + 0.3, FX.yel);
  guest(t, blk);
  if (t >= P('K02', 0.5)) stamp(t, P('K02', 0.5), 1180, 520, '改名 或 .nojekyll', '#6b7cff', 64, -0.1);
};
SFX_FNS.push(() => { guestSfx(['K02']); sfx(S('G06_01'), 'pop', 0.4); sfx(P('G06_01', 0.55), 'click', 0.5); sfx(P('G06_01', 0.55) + 0.3, 'ding', 0.4); sfx(S('G06_02') - 0.1, 'swoosh_in', 0.4); sfx(P('G06_02', 0.35), 'pop', 0.5); sfx(P('G06_02', 0.35) + 0.2, 'sparkle', 0.4); sfx(P('K02', 0.5), 'stamp', 0.6); });

// ---- 进阶：个人主页 + 自定义域名（豆包）----
SC.user = (t, blk, en) => {
  bgLecture(t, '#16a5c9'); lecturer(t, blk, en, blk.t0);
  const g2 = S('G07_02') - 0.15, g3 = S('G07_03') - 0.15;
  if (t < g2 + 0.3) { const a = 1 - prog(t, g2, 0.3); ctx.save(); ctx.globalAlpha = a;
    const cy = browser(700, 130, 1160, 420, 'github.com/new', { title: '新建仓库', accent: '#16a5c9' });
    txt('Create a new repository', 740, cy + 50, 34, '#24292f', {});
    const typ = 'dafeiyu.github.io'; const n = Math.floor(clamp(prog(t, P('G07_01', 0.2), 0.8)) * typ.length);
    inputBox(740, cy + 130, 620, 'Repository name', typ.slice(0, n), { focus: true, code: true, t });
    if (n >= typ.length) { txt('✓', 1390, cy + 160, 44, LIVEC, {}); }
    const us = popIn(t, P('G07_01', 0.7), 0.4); if (us > 0) { urlParts(1280, 720, us, [['dafeiyu.github.io', '#ffd23f', '个人主页 · 最短网址']], 66); }
    ctx.restore(); }
  if (t >= g2 && t < g3 + 0.3) { const a = eOut(prog(t, g2, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a;
    avatar('D', 820, 450, 80, { s: popIn(t, g2) }); txt('一个账号', 820, 580, 34, '#fff', { align: 'center' });
    const us = popIn(t, P('G07_02', 0.15)); if (us > 0) { arrow(920, 300, 1080, 250, '#ffd23f', us, 10); pill(1360, 240, '🏠 个人主页 ×1', '#ffd23f', us, { fs: 36, font: F_BODY }); txt('dafeiyu.github.io', 1360, 320, 30, '#ffd23f', { align: 'center', font: F_CODE }); }
    ['/baifan', '/notes', '/game'].forEach((r, i) => { const s = popIn(t, P('G07_02', 0.55 + i * 0.08)); if (s <= 0) return; arrow(920, 480 + i * 30, 1080, 460 + i * 120, '#7cf07a', s, 8); pill(1360, 460 + i * 120, '📦 项目网站  ' + r, '#7cf07a', s, { fs: 32, font: F_BODY }); });
    if (t >= P('G07_02', 0.8)) note(1360, 860, popIn(t, P('G07_02', 0.8)), '每个仓库都能开一个', '#7cf07a', { fs: 32 });
    ctx.restore(); }
  if (t >= g3) { const a = eOut(prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a;
    settingsPage(t, 680, 120, 1180, 760, { hi: true, src: 'Deploy from a branch', br: 'main', saved: true, live: 1, domain: 1, dval: 'baifan.com'.slice(0, Math.floor(clamp(prog(t, P('G07_03', 0.3), 0.5)) * 10)), dfocus: t < P('G07_03', 0.75), https: t >= P('G07_03', 0.8) });
    if (t >= P('G07_03', 0.82)) { txt('🔒', 1260, 820, 56, '#000', { align: 'center', font: EMOJI, bold: false }); fancy('自定义域名 + HTTPS', 1600, 780, 42, t, P('G07_03', 0.82), FX.blue); }
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['B02']); cmdAt(P('G07_01', 0.2), 'dafeiyu.github.io', 0.8); sfx(P('G07_01', 0.7), 'ding', 0.5); sfx(S('G07_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G07_02', 0.15), 'pop', 0.4); [0, 1, 2].forEach(i => sfx(P('G07_02', 0.55 + i * 0.08), 'pop', 0.3));
  sfx(S('G07_03') - 0.15, 'swoosh_in', 0.4); cmdAt(P('G07_03', 0.3), 'baifan.com', 0.5); sfx(P('G07_03', 0.8), 'click', 0.6); sfx(P('G07_03', 0.82), 'sparkle', 0.5); });
// ---- 复习：开 · 查 · 改 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, PGC); lecturer(t, blk, en, blk.t0);
  const cards = [['🚀 开', PGC, ['Settings → Pages', 'main + /(root)', 'Save'], 'G08_01'], ['🔍 查', '#e0485e', ['首页 index.html', '大小写一致', '相对路径', '_ 文件夹 → .nojekyll'], 'G08_02'], ['🔄 改', WEBC, ['push 自动部署', 'Actions 绿勾', 'Ctrl+F5 强制刷新'], 'G08_03']];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.1, 0.4); if (s <= 0) return; const act = t >= S(c[3]) - 0.1 && (i === 2 || t < S(cards[i + 1][3]) - 0.1);
    const x = 870 + i * 400, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= S(c[3]) - 0.1 ? 1 : 0.5;
    if (act) { ctx.shadowColor = c[1]; ctx.shadowBlur = 40; } box(-180, -300, 360, 600, 28, '#fffaf0', c[1], 8); ctx.shadowBlur = 0;
    box(-180, -300, 360, 100, [28, 28, 0, 0], c[1]); txt(c[0], 0, -248, 46, '#fff', { align: 'center', font: F_FANCY, bold: false });
    const n = c[2].length, gap = n > 3 ? 112 : 140, hh = n > 3 ? 92 : 110;
    c[2].forEach((l, k) => { const a = clamp(prog(t, P(c[3], 0.08 + k * (0.8 / n)), 0.25)); ctx.save(); ctx.globalAlpha *= 0.25 + 0.75 * a; box(-150, -170 + k * gap, 300, hh, 16, '#fff', '#e4dff5', 3); txt(l, 0, -170 + k * gap + hh / 2, 26, '#1b1433', { align: 'center', font: /[\u4e00-\u9fff]/.test(l) ? F_BODY : F_CODE, max: 280 }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= P('G08_03', 0.8)) fancy('开 · 查 · 改，网站就上线！', 1270, 880, 58, t, P('G08_03', 0.8), FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2].forEach(i => sfx(BK.recap.t0 + 0.1 + i * 0.1, 'pop', 0.3)); [['G08_01', 3], ['G08_02', 4], ['G08_03', 3]].forEach(([id, n]) => { for (let k = 0; k < n; k++) sfx(P(id, 0.08 + k * (0.8 / n)), 'ding', 0.25); }); sfx(P('G08_03', 0.8), 'sparkle', 0.5); });

// ---- 实战：白饭页上线 ----
const T_PRAC = retime([
  { t: 0, s: 'git mv baifan.html index.html', cmd: true, dur: 0.6 },
  { t: 0, s: 'git mv _img img', cmd: true, dur: 0.4 },
  { t: 0, s: '{d}# 路径改成 img/cat.png' },
  { t: 0, s: 'git commit -am "准备上线"', cmd: true, dur: 0.5 },
  { t: 0, s: 'git push', cmd: true, dur: 0.3 },
  { t: 0, s: '{g}   main -> main' },
  { t: 0, s: '{c}# Settings → Pages → main /(root) → Save' },
  { t: 0, s: '{g}✓ pages build and deployment' },
  { t: 0, s: 'git commit -am "今日推荐菜：咖喱饭"', cmd: true, dur: 0.6 },
  { t: 0, s: 'git push', cmd: true, dur: 0.3 },
  { t: 0, s: '{g}✓ pages build and deployment' },
], [['G09_01', 0.25], ['G09_01', 0.55], ['G09_01', 0.75], ['G09_02', 0.08], ['G09_02', 0.2], ['G09_02', 0.3], ['G09_02', 0.5], ['G09_03', 0.12], ['G09_04', 0.2], ['G09_04', 0.38], ['G09_04', 0.55]]);
SC.practice = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  const steps = [['index.html', S('G09_01')], ['img/', P('G09_01', 0.5)], ['push', S('G09_02')], ['Pages', P('G09_02', 0.45)], ['✓ 上线', S('G09_03')], ['更新', S('G09_04')]];
  const end = S('D10') - 0.2;
  steps.forEach((s, i) => {
    const a = popIn(t, blk.t0 + 0.15 + i * 0.06); if (a <= 0) return;
    const x = 790 + i * 200, y = 88; const act = t < end && t >= s[1] && (i === 5 || t < steps[i + 1][1]); const done = t >= end || (i < 5 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1));
    box(-90, -32, 180, 64, 18, act ? '#ff7a3d' : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act && !s[0].startsWith('✓') ? '✓ ' : '') + s[0], 0, 2, 22, '#fff', { align: 'center', font: /[\u4e00-\u9fff]/.test(s[0]) ? F_BODY : F_CODE, max: 170 }); ctx.restore();
  });
  const ta = eOut(prog(t, blk.t0, 0.3));
  terminal(t, 676, 160, 640, 700, T_PRAC, { alpha: ta, fs: 22, accent: '#ff7a3d', title: '终端 — 大肥鱼的电脑' });
  ctx.save(); ctx.globalAlpha = ta;
  const live = P('G09_03', 0.3), upd = P('G09_04', 0.6);
  const cy = siteWin(1340, 160, 540, 700, t >= live ? 'dafeiyu.github.io/baifan' : '（还没上线）', { ufs: 20, reload: t >= upd ? prog(t, upd, 0.5) : null });
  if (t < live) { txt('⏳', 1610, cy + 260, 120, '#000', { align: 'center', font: EMOJI, bold: false }); txt('等待部署…', 1610, cy + 400, 34, '#6b6488', { align: 'center' }); }
  else { const s = popIn(t, live, 0.4); ctx.save(); ctx.translate(1610, cy); ctx.scale(s, s); ctx.translate(-1610, -cy);
    baifanPage(1610, cy + 10, 500, { cat: 'ok', dish: flipText(t, [[-1, '番茄炒蛋盖饭'], [upd + 0.3, '咖喱饭 🍛']]).s }); ctx.restore();
    if (t < live + 1) sparkle(t, live, 1610, cy + 200, 220, 12); }
  if (t >= S('G09_05') && t < end) { const s = popIn(t, S('G09_05'), 0.4); ctx.save(); ctx.translate(1610, 760); ctx.scale(s, s); box(-120, -150, 240, 300, 34, '#1b1433', '#fff', 6); box(-100, -120, 200, 230, 10, '#fff'); txt('🍚', 0, -10, 90, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore(); note(1610, 560, popIn(t, P('G09_05', 0.3)), '📱 手机也能打开', '#ffd23f', { fs: 32 }); }
  ctx.restore();
  if (t < S('G09_01') + 0.6) fancy('实战开始！', 1280, 500, 110, t, blk.t0 + 0.2, Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_phone', 1600, H + 30, 860, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    const bs = popIn(t, end + 0.05, 0.4); ctx.save(); ctx.translate(1050, 420); ctx.scale(bs, bs); ctx.rotate(-0.04); ctx.translate(-1050, -420);
    const c2 = siteWin(760, 160, 580, 470, 'dafeiyu.github.io/baifan', { ufs: 22 }); baifanPage(1050, c2 + 10, 540, { cat: 'ok', dish: '咖喱饭 🍛' }); ctx.restore();
    fancy('白饭页，上线啦！', 1050, 780, 90, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 6; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(b.t0 + 0.2, 'impact', 0.6); sfx(P('G09_03', 0.3), 'sparkle', 0.6); sfx(P('G09_03', 0.3), 'ding', 0.5); sfx(P('G09_04', 0.6), 'whoosh', 0.4); sfx(P('G09_04', 0.6) + 0.3, 'ding', 0.4); sfx(S('G09_05'), 'pop', 0.5); const end = S('D10') - 0.2; sfx(end, 'impact', 0.6); sfx(end + 0.4, 'confetti', 0.6); });

// ---- 预告 + 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#2da44e');
  const outro = E('G10_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G10_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G10_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G10_01', 0.12), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 470); ctx.scale(bp, bp); ctx.translate(-1260, -470);
      box(860, 250, 800, 420, 24, '#ffffff', '#2da44e', 6); box(860, 250, 800, 70, [24, 24, 0, 0], '#24292f'); txt('▶ Actions', 900, 286, 32, '#fff', {});
      [['⬆', 'push', 0.2], ['✔', '检查', 0.35], ['🧪', '测试', 0.5], ['🚀', '部署', 0.62]].forEach((c, i) => { const s = popIn(t, P('G10_01', c[2])); if (s <= 0) return; const x = 960 + i * 200;
        ctx.save(); ctx.translate(x, 470); ctx.scale(s, s); ctx.fillStyle = i ? '#1f883d' : '#3e8ed0'; ctx.beginPath(); ctx.arc(0, 0, 66, 0, 7); ctx.fill(); txt(c[0], 0, -4, 54, i === 1 ? '#fff' : '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore();
        txt(c[1], x, 580, 32, '#24292f', { align: 'center' }); if (i) arrow(x - 130, 470, x - 72, 470, '#2da44e', s, 8); });
      ctx.restore(); }
    [['GitHub Actions', -520, 300, 0.35], ['自动检查', 520, 290, 0.5], ['自动测试', -500, 680, 0.62], ['🤖 自动部署', 510, 690, 0.72]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G10_01', c[3])), { fs: 34, font: /[\u4e00-\u9fff]/.test(c[0]) ? F_BODY : F_CODE }));
    fancy('push 一下，全自动！', 1260, 830, 84, t, P('G10_01', 0.75), FX.pink);
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
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_phone', 1690, H + 40, 640, { scale: sa }); }
      SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
    ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
    ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G10_01', 0.12), 'pop', 0.6); [0.2, 0.35, 0.5, 0.62].forEach(f => sfx(P('G10_01', f), 'pop', 0.35)); [0.35, 0.5, 0.62, 0.72].forEach(f => sfx(P('G10_01', f), 'pop', 0.3)); sfx(P('G10_01', 0.75), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G10_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G10_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_sparkle', P('G02_04', 0.5), E('G02_04')], ['d_shock', P('G03_02', 0.6), E('G03_02')], ['d_relief', P('G04_02', 0.75), E('G04_02')],
  ['d_ok', P('G05_01', 0.75), E('G05_01')], ['d_sparkle', P('G07_02', 0.4), E('G07_02')],
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
