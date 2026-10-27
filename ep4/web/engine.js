// AI娘 Git课 · 第4集 渲染引擎 —— renderAt(t) 纯函数，逐帧确定性导出（通用部分沿用第1集）
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const F_FANCY = '"Smiley", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const F_BODY = '"Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const F_CODE = 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", "Microsoft YaHei", "Noto Sans CJK SC", monospace';

// ================= 素材 =================
const SPR = {};
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'g_cheer', 'g_warn', 'g_think', 'g_shock', 'g_proud', 'g_type', 'g_peace', 'g_awkward', 'g_present', 'd_panic', 'd_curious', 'd_happy', 'd_raise', 'd_think', 'd_shock', 'd_sparkle', 'd_ok', 'd_relief', 'd_leader', 'q_base', 'q_point', 'q_tea', 'c_base', 'c_ok', 'c_cool', 'm_base', 'm_panic', 'm_cheeky', 'x_base', 'x_angry', 'x_force', 'b_base', 'b_sorry', 'k_base', 'k_read', 'g_pill', 'd_pill', 'm_oops', 'q_alarm', 'b_wave', 'x_panic', 'k_diary', 'c_read'];
// 竖版立绘只显示上半身：显示高度占整张图的比例（头顶到腰）
const SPRC = { d_panic: 0.55, d_curious: 0.55, d_happy: 0.55, d_sparkle: 0.6, d_ok: 0.66, d_raise: 0.72, d_think: 0.7, d_relief: 0.82, d_shock: 0.82, d_leader: 0.7, q_base: 0.6, q_point: 0.6, q_tea: 0.6, c_base: 0.58, c_ok: 0.58, c_cool: 0.58, m_base: 0.62, m_panic: 0.6, m_cheeky: 0.62, x_base: 0.6, x_angry: 0.6, x_force: 0.66, b_base: 0.62, b_sorry: 0.62, k_base: 0.6, k_read: 0.6, d_pill: 0.6, m_oops: 0.62, q_alarm: 0.6, b_wave: 0.62, x_panic: 0.62, k_diary: 0.6, c_read: 0.58 };
const loadImg = n => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });


// ================= 台词（由 subtitles.json 生成，改台词请改 _gen_script.py）=================
const TEXT = {
  D01: "完了完了！刚提交完就发现，说明写错了，还漏了一个文件！Git 有后悔药吗？",
  G01_01: "有！而且不止一种。改说明、收起半成品、撤回提交、找回删掉的存档，Git 全都能后悔。",
  G01_02: "欢迎来到 AI娘 Git 课，第四集，Git 后悔药大全！",
  M01: "嘿嘿，我刚提交完，说明写的是“2024 年更新”喵！",
  D02: "又是 2024 年……这种刚提交的，还能改吗？",
  G02_01: "能！第一颗后悔药：git commit --amend。",
  G02_02: "说明写错了，就 git commit --amend -m，跟上新的说明，上一次提交直接被换掉。",
  G02_03: "漏了文件，先 git add 把它加进来，再 git commit --amend --no-edit，说明不变，文件补进去。",
  G02_04: "注意：amend 会换成一个新的提交，所以只改还没 push 的那一次。",
  M02: "改好啦，这次年份写对了喵！",
  Q01: "紧急任务！首页打不开了，谁有空马上去修？",
  D03: "可我的介绍页才写到一半，又不想提交半成品，怎么办？",
  G03_01: "第二颗后悔药：git stash，把改到一半的东西先收进抽屉。",
  G03_02: "工作区一下子就干净了，放心切到别的分支，修好、提交。",
  G03_03: "回来以后 git stash pop，刚才的半成品原样放回来。",
  G03_04: "抽屉里能放好几份，git stash list 就能看到。新建的文件，记得加 -u 一起收。",
  Q02: "首页修好啦！辛苦了，奶茶我请～",
  D04: "豆包怎么一口气提交了三次？",
  B01: "“测试”“测试二”“这次真的是最后一次”！家人们，先交了再说嘛！",
  G04_01: "提交太碎了。第三颗后悔药：git reset，撤回提交。",
  G04_02: "git reset --soft HEAD~3，撤回最近三次提交，改动全都留在暂存区。",
  G04_03: "再重新 commit 一次，三次提交就合成了一次，说明也能重写。",
  G04_04: "不加参数的话，默认是 --mixed：提交撤回了，改动留在工作区，等你重新 add。",
  G04_05: "三种模式记一句话：soft 留暂存，mixed 留工作区，hard 全清空。",
  B02: "收到！三合一，这下整整齐齐啦！",
  X01: "全写坏了。git reset --hard HEAD~2，退回两步，重新来过！",
  D05: "等等！Grok 的改动全没了？",
  G05_01: "这就是最危险的一颗：reset --hard。它会把提交和没提交的改动，一起清掉。",
  G05_02: "没提交的改动，清掉就真的找不回来了。用之前，一定先 commit 或者 stash。",
  G05_03: "还有，已经 push 上去的提交，别用 reset 改历史，要用 git revert。",
  G05_04: "revert 会新建一个提交，把那次改动反着做一遍。历史一条不少，队友也不受影响。",
  X02: "那我刚才退掉的两次提交，也没了？这是真的吗？",
  K01: "别慌……Git 有一本日记，每一步都记着。我帮你翻。",
  D06: "退掉的提交，还能找回来？",
  G06_01: "能！最后一颗后悔药：git reflog。HEAD 每移动一次，它都记一笔，被 reset 掉的提交也在里面。",
  G06_02: "在列表里找到出事之前的那一行，复制前面的编号。",
  K02: "找到了。第二行，就是她出事之前。",
  G06_03: "再 git reset --hard 加上这个编号，两次提交就全回来了。",
  G06_04: "不放心的话，也可以 git branch rescue 加编号，先开一条新分支把它存起来。",
  G06_05: "不过记住：reflog 只记提交过的东西，没提交的改动，它也救不了。",
  X03: "回来了。行，下次我先 commit 再动手。",
  D07: "还有，一看到红色的报错，我就慌。",
  C01: "先别慌。报错已经把原因写清楚了，读完再动手。",
  G07_01: "Claude 说得对。最常见的三个，记住解法就行。",
  G07_02: "看到“本地改动会被覆盖”：有没提交的改动挡路，先 commit 或者 stash。",
  G07_03: "看到 detached HEAD：你停在了某个旧提交上。回去用 git switch main，想接着写，就 git switch -c 开新分支。",
  G07_04: "看到 not a git repository：你不在仓库文件夹里，cd 进项目目录就好。",
  C02: "原因写清楚了，解法也有。批准。",
  D08: "后悔药好多，帮我整理一下！",
  G08_01: "说明写错、漏了文件，用 amend；改到一半要切走，用 stash。",
  G08_02: "撤回提交、留着改动，用 reset --soft 或 --mixed；已经 push 的，用 revert。",
  G08_03: "reset --hard 要小心；退掉的提交，用 reflog 找回来。",
  D09: "能带我从头到尾，用一遍吗？",
  G09_01: "没问题！用大肥鱼的白饭页，把后悔药完整用一遍！",
  G09_02: "提交以后发现说明写错：git commit --amend -m，改掉。",
  G09_03: "千问喊紧急任务：git stash 收起半成品，git switch -c 开个修复分支，修好提交，切回来 git stash pop。",
  G09_04: "写完提交，手一滑 reset --hard HEAD~1。别慌：git reflog 找到编号，reset --hard 回去，提交全回来！",
  D10: "吃了后悔药，白饭页一个字都没丢！",
  G10_01: "下集预告：给作品打上版本标签！git tag 和 GitHub Releases，下集见分晓！",
  G10_02: "喜欢的话记得一键三连，我们下集见！",
};
const DUR = Object.assign({}, window.DUR || {});

// ================= 时间轴 =================
const V = (b, id, pose) => ({ k: 'v', b, id, pose });
const BEAT = (b, d) => ({ k: 'beat', b, d: b === 'teaser' ? d * 0.75 : d * 0.35 });
const CH_COL = ['#7c5cff', '#3ec1ff', '#22c08b', '#ffb020', '#ff5c8a', '#ff7a3d', '#a66bff', '#ffd23f'];
const PLAN = [
  V('cold', 'D01', 'd_panic'),
  V('why', 'G01_01', 'g_pill'),
  V('title', 'G01_02', 'g_cheer'), BEAT('title', 1.4),
  V('amendQ', 'M01', 'm_oops'), V('amendQ', 'D02', 'd_think'),
  V('amend', 'G02_01', 'g_pill'), V('amend', 'G02_02', 'g_type'), V('amend', 'G02_03', 'g_explain'), V('amend', 'G02_04', 'g_warn'), V('amend', 'M02', 'm_cheeky'),
  V('stashQ', 'Q01', 'q_alarm'), V('stashQ', 'D03', 'd_panic'),
  V('stash', 'G03_01', 'g_point'), V('stash', 'G03_02', 'g_explain'), V('stash', 'G03_03', 'g_wink'), V('stash', 'G03_04', 'g_type'), V('stash', 'Q02', 'q_tea'),
  V('resetQ', 'D04', 'd_curious'), V('resetQ', 'B01', 'b_wave'),
  V('reset', 'G04_01', 'g_awkward'), V('reset', 'G04_02', 'g_type'), V('reset', 'G04_03', 'g_explain'), V('reset', 'G04_04', 'g_point'), V('reset', 'G04_05', 'g_present'), V('reset', 'B02', 'b_base'),
  V('hardQ', 'X01', 'x_force'), V('hardQ', 'D05', 'd_shock'),
  V('hard', 'G05_01', 'g_shock'), V('hard', 'G05_02', 'g_warn'), V('hard', 'G05_03', 'g_think'), V('hard', 'G05_04', 'g_explain'), V('hard', 'X02', 'x_panic'),
  V('reflogQ', 'K01', 'k_diary'), V('reflogQ', 'D06', 'd_raise'),
  V('reflog', 'G06_01', 'g_cheer'), V('reflog', 'G06_02', 'g_point'), V('reflog', 'K02', 'k_read'), V('reflog', 'G06_03', 'g_type'), V('reflog', 'G06_04', 'g_explain'), V('reflog', 'G06_05', 'g_warn'), V('reflog', 'X03', 'x_base'),
  V('errQ', 'D07', 'd_panic'), V('errQ', 'C01', 'c_read'),
  V('errors', 'G07_01', 'g_proud'), V('errors', 'G07_02', 'g_explain'), V('errors', 'G07_03', 'g_point'), V('errors', 'G07_04', 'g_wink'), V('errors', 'C02', 'c_ok'),
  V('ask8', 'D08', 'd_sparkle'),
  V('recap', 'G08_01', 'g_present'), V('recap', 'G08_02', 'g_explain'), V('recap', 'G08_03', 'g_warn'),
  V('askP', 'D09', 'd_raise'),
  V('practice', 'G09_01', 'g_cheer'), V('practice', 'G09_02', 'g_type'), V('practice', 'G09_03', 'g_type'), V('practice', 'G09_04', 'g_point'), V('practice', 'D10', 'd_pill'),
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

// ================= 第4集：Git 药房 =================
// 本集小队成员的“后悔”标签（guest() / 名字条使用）
Object.assign(SQ.Q, { role: '紧急任务' }); Object.assign(SQ.C, { role: '读报错' }); Object.assign(SQ.M, { role: '说明写错' });
Object.assign(SQ.X, { role: 'reset --hard' }); Object.assign(SQ.B, { role: '提交太碎' }); Object.assign(SQ.K, { role: 'Git 日记' });
const PILLC = { amend: '#3ec1ff', stash: '#ffd23f', reset: '#ff7a3d', revert: '#22c08b', reflog: '#a66bff', hard: '#ff3b5c' };
const EMOJI = '"Segoe UI Emoji","Noto Color Emoji",sans-serif';
// 胶囊：左半彩色，右半白色写命令
function capsule(x, y, s, col, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= (o.alpha ?? 1);
  if (o.glow) { ctx.fillStyle = hexA(col, 0.35 * o.glow); ctx.beginPath(); ctx.ellipse(0, 0, 160, 96, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(-104, -38, 220, 92, 46); ctx.fill();
  ctx.save(); rr(-110, -46, 220, 92, 46); ctx.clip();
  ctx.fillStyle = col; ctx.fillRect(-110, -46, 110, 92); ctx.fillStyle = '#fff'; ctx.fillRect(0, -46, 110, 92);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; rr(-90, -34, 170, 14, 7); ctx.fill(); ctx.restore();
  rr(-110, -46, 220, 92, 46); ctx.lineWidth = 7; ctx.strokeStyle = '#1b1433'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(0, 46); ctx.stroke();
  if (o.label) txt(o.label, 55, 3, o.fs || 28, '#1b1433', { align: 'center', font: F_CODE, max: 100 });
  ctx.restore();
}
// 危险药品：reset --hard
function dangerBottle(x, y, s, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= (o.alpha ?? 1);
  if (o.glow) { ctx.fillStyle = `rgba(255,59,92,${0.3 * o.glow})`; ctx.beginPath(); ctx.arc(0, 0, 190, 0, 7); ctx.fill(); }
  box(-38, -160, 76, 44, 10, '#3a3358', '#1b1433', 6); box(-26, -120, 52, 34, 6, '#ffcfd6', '#1b1433', 6);
  box(-95, -90, 190, 220, 44, '#ff3b5c', '#1b1433', 7); box(-74, -46, 148, 118, 12, '#fff', '#1b1433', 4);
  txt('危险', 0, -14, 40, '#ff3b5c', { align: 'center', font: F_FANCY, bold: false }); txt('--hard', 0, 38, 30, '#1b1433', { align: 'center', font: F_CODE });
  ctx.restore();
}
// Git 药房：6 格（5 颗胶囊 + 1 瓶危险药品）
const SHELF = [['amend', '改说明 · 补文件'], ['stash', '临时收起'], ['reset', '撤回提交'], ['revert', '已 push 用它'], ['reflog', '找回提交'], ['hard', '小心服用']];
const SLOT = [[-245, -165], [0, -165], [245, -165], [-245, 120], [0, 120], [245, 120]];
function pharmacy(t, cx, cy, s, lit, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; rr(-388, -318, 800, 660, 30); ctx.fill();
  box(-400, -330, 800, 660, 30, '#9a6438', '#3b2210', 8); box(-372, -302, 744, 604, 18, '#fbefd6');
  [-45, 240].forEach(by => { box(-372, by, 744, 22, 4, '#c08a5a', '#3b2210', 4); });
  ctx.save(); ctx.translate(0, -360); ctx.rotate(-0.03); box(-190, -44, 380, 88, 24, '#ff5c8a', '#fff', 7);
  txt('Git 药房', 0, 3, 56, '#fff', { align: 'center', font: F_FANCY, bold: false }); ctx.restore();
  SHELF.forEach((it, i) => {
    const [x, y] = SLOT[i]; const l = clamp(lit(i)); const pop = eBack(l);
    ctx.save(); ctx.globalAlpha *= 0.35 + 0.65 * clamp(l * 2);
    if (i < 5) capsule(x, y, 0.82 * (0.85 + 0.15 * pop), PILLC[it[0]], { label: it[0], rot: -0.12, glow: l >= 1 && o.glow ? 0.5 + 0.5 * Math.sin(t * 6 + i) : 0 });
    else dangerBottle(x, y - 10, 0.5 * (0.85 + 0.15 * pop), { rot: 0.06, glow: l >= 1 && o.glow ? 0.6 : 0 });
    ctx.restore();
    if (o.desc && l > 0.02) { ctx.save(); ctx.globalAlpha *= clamp(l * 2); txt(it[1], x, y + 82, 30, i === 5 ? '#d6283e' : '#3b2210', { align: 'center' }); ctx.restore(); }
  });
  ctx.restore();
}
// 翻牌文字：seq = [[时间, 文本], ...]
function flipText(t, seq) {
  let i = 0; for (let k = 0; k < seq.length; k++) if (t >= seq[k][0]) i = k;
  const p = i ? prog(t, seq[i][0], 0.3) : 1; const sc = Math.max(0.05, Math.abs(Math.cos(p * Math.PI)));
  return { s: (i > 0 && p < 0.5) ? seq[i - 1][1] : seq[i][1], sc: i ? sc : 1, fresh: i > 0 && p < 1 };
}
// 提交卡片
function commitCard(t, x, y, w, h, hashSeq, msg, o = {}) {
  const s = o.s ?? 1; if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= (o.alpha ?? 1);
  const col = o.col || '#ff7a3d';
  if (o.glow) { ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 40 * o.glow; box(-w / 2, -h / 2, w, h, 22, '#fff'); ctx.restore(); }
  box(-w / 2, -h / 2, w, h, 22, '#fff', col, 6);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(-w / 2 + 52, 0, 28, 0, 7); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#1b1433'; ctx.stroke();
  txt('✓', -w / 2 + 52, 2, 30, '#fff', { align: 'center' });
  const fh = typeof hashSeq === 'string' ? { s: hashSeq, sc: 1 } : flipText(t, hashSeq);
  ctx.save(); ctx.translate(-w / 2 + 100, -h * 0.2); ctx.scale(1, fh.sc);
  if (fh.fresh) { ctx.font = `bold ${o.hfs || 28}px ${F_CODE}`; const hw = ctx.measureText(fh.s).width; box(-6, -20, hw + 12, 40, 8, '#fff36b'); }
  txt(fh.s, 0, 0, o.hfs || 28, '#b07a00', { font: F_CODE }); ctx.restore();
  const mw = txt(msg, -w / 2 + 100, h * 0.2, o.mfs || 32, '#1b1433', { max: w - 130 });
  if (o.strike > 0) { ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-w / 2 + 96, h * 0.2); ctx.lineTo(-w / 2 + 96 + Math.min(mw, w - 130) * clamp(o.strike), h * 0.2); ctx.stroke(); }
  ctx.restore();
}
// 打字命令条
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
// 终端行：先按台词定时间，再登记打字音效
function retime(lines, times) { lines.forEach((l, i) => l.t = typeof times[i] === 'number' ? times[i] : P(times[i][0], times[i][1])); return cmdLines(lines); }
// 沿弧线飞行
function arcPos(t, t0, d, x0, y0, x1, y1, lift = 120) { const p = eIO(prog(t, t0, d)); return [lerp(x0, x1, p), lerp(y0, y1, p) - Math.sin(p * Math.PI) * lift, p]; }
// 抽屉柜（stash）
function drawer(x, y, s, open, n, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; rr(-232, -192, 480, 420, 26); ctx.fill();
  box(-240, -200, 480, 420, 26, '#9a6438', '#3b2210', 8);
  box(-210, -170, 420, 120, 14, '#c08a5a', '#3b2210', 5); box(-40, -122, 80, 22, 10, '#3b2210');
  const oy = open * 70, sc = 1 + open * 0.1;
  if (open > 0.02) {   // 拉出来的托盘
    ctx.save(); ctx.translate(0, 70 + oy); ctx.scale(sc, sc);
    box(-200, -60 - open * 120, 400, open * 120 + 10, 10, '#4a2c16', '#3b2210', 5);
    for (let i = 0; i < n; i++) { ctx.save(); ctx.translate(-120 + i * 70, -60 - open * 60); ctx.rotate(-0.1 + i * 0.08); box(-50, -34, 120, 68, 8, i ? '#ffe9a8' : '#fff', '#1b1433', 4); txt(`stash@{${i}}`, 10, 1, 18, '#1b1433', { align: 'center', font: F_CODE }); ctx.restore(); }
    ctx.restore();
  }
  ctx.save(); ctx.translate(0, 70 + oy); ctx.scale(sc, sc);
  box(-210, -60, 420, 130, 14, o.hi ? '#ffd23f' : '#d9a46c', '#3b2210', 5);
  box(-90, -26, 180, 52, 12, '#fff', '#3b2210', 4); txt('stash', 0, 1, 32, '#1b1433', { align: 'center', font: F_CODE });
  ctx.restore();
  ctx.restore();
}
// 小卡片（reset 区域板里用）
function miniCard(x, y, label, col, s = 1, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= (o.alpha ?? 1); ctx.rotate(o.rot || 0);
  const w = o.w || 290, h = o.h || 66; box(-w / 2, -h / 2, w, h, 16, o.bg || '#fff', col, 5);
  if (o.icon !== false) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(-w / 2 + 32, 0, 16, 0, 7); ctx.fill(); }
  txt(label, -w / 2 + (o.icon === false ? w / 2 : 60), 1, o.fs || 28, '#1b1433', { align: o.icon === false ? 'center' : 'left', max: w - 70 });
  ctx.restore();
}
// 打开的日记本（reflog）
function diary(x, y, w, h, title) {
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.3)'; rr(x + 12, y + 16, w, h, 26); ctx.fill();
  box(x - 14, y - 10, w + 28, h + 24, 28, '#2a3366', '#141a3d', 6);
  box(x, y, w, h, 20, '#fffaf0', '#c9b98f', 3);
  ctx.strokeStyle = 'rgba(120,150,220,0.28)'; ctx.lineWidth = 2; for (let ly = y + 130; ly < y + h - 20; ly += 72) { ctx.beginPath(); ctx.moveTo(x + 30, ly + 36); ctx.lineTo(x + w - 30, ly + 36); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,92,138,0.35)'; ctx.beginPath(); ctx.moveTo(x + 150, y + 20); ctx.lineTo(x + 150, y + h - 20); ctx.stroke();
  box(x + 40, y - 34, 520, 64, 18, '#a66bff', '#fff', 5); txt(title, x + 300, y - 1, 34, '#fff', { align: 'center', font: F_FANCY, bold: false });
  ctx.restore();
}
function bookCover(x, y, s, t) {   // 合起来、发光的日记
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.06);
  const g = 0.5 + 0.5 * Math.sin(t * 4); ctx.fillStyle = `rgba(190,170,255,${0.25 + 0.2 * g})`; ctx.beginPath(); ctx.arc(0, 0, 330, 0, 7); ctx.fill();
  box(-210, -270, 420, 540, 26, '#2a3366', '#fff', 8); box(-180, -240, 24, 480, 8, '#1a2150');
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(40, -90, 70, 0, 7); ctx.fill(); ctx.fillStyle = '#2a3366'; ctx.beginPath(); ctx.arc(70, -110, 62, 0, 7); ctx.fill();
  txt('Git 日记', 20, 70, 64, '#ffd23f', { align: 'center', font: F_FANCY, bold: false }); txt('reflog', 20, 150, 40, '#c9a6ff', { align: 'center', font: F_CODE });
  ctx.restore();
  sparkle(t, -99, x, y, 260, 8, '#e9dcff');
}
// 报错卡：正面红色英文，翻过来是绿色解法
function errCard(t, x, y, w, h, en, zh, fix, flipT, o = {}) {
  const s = o.s ?? 1; if (s <= 0) return; const p = prog(t, flipT, 0.36); const back = p >= 0.5; const sy = Math.max(0.04, Math.abs(Math.cos(p * Math.PI)));
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s * sy); ctx.globalAlpha *= (o.alpha ?? 1);
  if (!back) {
    box(-w / 2, -h / 2, w, h, 22, '#2a0b14', '#ff3b5c', 6); box(-w / 2, -h / 2, 150, h, [22, 0, 0, 22], '#ff3b5c');
    txt('✗', -w / 2 + 75, 0, 80, '#fff', { align: 'center' });
    txt(en, -w / 2 + 180, -18, 30, '#ff8a9b', { font: F_CODE, max: w - 210 }); txt('看不懂？先别慌', -w / 2 + 180, 40, 26, '#a7899a', {});
  } else {
    box(-w / 2, -h / 2, w, h, 22, '#0d2a1c', '#22c08b', 6); box(-w / 2, -h / 2, 150, h, [22, 0, 0, 22], '#22c08b');
    txt('✓', -w / 2 + 75, 0, 80, '#fff', { align: 'center' });
    txt(zh, -w / 2 + 180, -26, 36, '#fff', { max: w - 210 }); txt(fix, -w / 2 + 180, 34, 32, '#7cf07a', { font: F_CODE, max: w - 210 });
  }
  ctx.restore();
}

// ---- 冷开场：刚提交就后悔 ----
const T_COLD = retime([
  { t: 0, s: 'git commit -m "完成百饭页"', cmd: true, dur: 0.6 },
  { t: 0, s: '{y}[main 3f9a1c2]{w} 完成百饭页' },
  { t: 0, s: '{w} 1 file changed' },
  { t: 0, s: 'git status', cmd: true, dur: 0.35 },
  { t: 0, s: '{r}Untracked files:  photo.png' },
], [0.02, 0.2, 0.26, 0.34, 0.45].map(f => ['D01', f]));
SC.cold = (t, blk) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, P('D01', 0.4), 10, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#ff4d6d', '#ff8fa3', W * 0.62, H * 0.5, 22, 0.35);
  const wa = eBack(prog(t, t0 + 0.05, 0.4));
  ctx.save(); ctx.translate(1390, 450); ctx.scale(wa, wa); ctx.translate(-1390, -450);
  terminal(t, 960, 120, 880, 560, T_COLD, { fs: 34, title: '终端 — 大肥鱼的电脑', accent: '#ff5c8a' });
  ctx.restore();
  if (t >= P('D01', 0.4)) { pill(1650, 220, '✗ 百 → 白', '#ffd23f', popIn(t, P('D01', 0.42)), { font: F_BODY, fs: 32 }); }
  if (t >= P('D01', 0.5)) { pill(1390, 560, '✗ 漏了 photo.png', '#ff8fa3', popIn(t, P('D01', 0.52)), { font: F_BODY, fs: 36 }); }
  const p = spring(prog(t, t0, 0.9));
  sprite('d_panic', 500, H + 40, 980, { scale: lerp(1.3, 1, p) });
  fancy('完了完了！', 420, 160, 120, t, U.D01.vo + 0.05, { rot: -0.12, wobble: 6, c1: '#fff36b', c2: '#ffb000', stroke: '#8a0a2a' });
  if (t >= P('D01', 0.75)) fancy('Git 有后悔药吗？', 1390, 880, 84, t, P('D01', 0.76), Object.assign({ rot: -0.04, wobble: 4 }, FX.white, { stroke: '#8a0a2a' }));
};
SFX_FNS.push(() => { const b = BK.cold; sfx(b.t0 + 0.05, 'swoosh_in', 0.5); sfx(P('D01', 0.4), 'impact', 0.8); sfx(P('D01', 0.42), 'pop', 0.4); sfx(P('D01', 0.5), 'buzz', 0.5); sfx(P('D01', 0.76), 'glitch', 0.4); });

// ---- Git 全都能后悔：药房 ----
const WHY_LIT = [0.3, 0.42, 0.55, 0.62, 0.68, 0.75];
SC.why = (t, blk, en) => {
  bgLecture(t, '#ff5c8a'); lecturer(t, blk, en, blk.t0);
  pharmacy(t, 1270, 500, eBack(prog(t, blk.t0 + 0.1, 0.45)) * 0.92, i => prog(t, P('G01_01', WHY_LIT[i]), 0.3), { glow: true, desc: true });
  if (t < P('G01_01', 0.3)) fancy('有！', 1270, 500, 220, t, U.G01_01.vo + 0.02, FX.yel);
  fancy('Git 全都能后悔！', 1270, 900, 70, t, P('G01_01', 0.8), FX.pink);
};
SFX_FNS.push(() => { sfx(BK.why.t0 + 0.1, 'swoosh_in', 0.5); sfx(U.G01_01.vo + 0.02, 'impact', 0.6); WHY_LIT.forEach(f => sfx(P('G01_01', f), 'pop', 0.4)); sfx(P('G01_01', 0.8), 'sparkle', 0.5); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#d63f8a', '#ff5c8a', W * 0.6, H * 0.45, 28, 0.2);
  ['amend', 'stash', 'reset', 'revert', 'reflog'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; capsule(1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 0.55 * popIn(t, t0 + 0.2 + i * 0.06), PILLC[k], { label: k, rot: a }); });
  sprite('g_pill', lerp(-400, 320, eBack(prog(t, t0, 0.5))), H + 250, 1180);
  sprite('d_pill', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 760);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-360, 0, 95, '#ffd23f', '第4集', { fs: 52, rot: -0.15 });
    fancy('Git 后悔药', 80, -60, 120, t, -99, FX.yel);
    fancy('大全！', 130, 85, 150, t, -99, FX.pink);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况：小队成员 + 大肥鱼提问（每个知识点一次互动）----
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
// 各块的“状况”插图（画在左侧 80..960）
function probAmend(t, blk) {
  const t0 = blk.t0;
  win(110, 200, 820, 300, 'Gemini 的终端', PILLC.amend);
  cmdBar(t, 520, 330, 'git commit -m "2024 年更新 喵"', t0 + 0.3, 0.7, { fs: 28, col: PILLC.amend });
  commitCard(t, 520, 440, 740, 110, 'e3b1a07', '2024 年更新 喵', { s: popIn(t, t0 + 1.1), col: PILLC.amend });
  const cs = popIn(t, t0 + 0.6); if (cs > 0) calendar(520, 720, 0.95 * cs, ['2024', '2024'], 0);
  const dq = U.D02; if (t >= dq.vo + 0.2) { const p = eOut(prog(t, dq.vo + 0.2, 0.35)); ctx.save(); ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(470, 462, 120, 40, -0.05, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke(); ctx.restore(); stamp(t, dq.vo + 0.5, 790, 640, '又是 2024', '#ff3b5c', 52, 0.12); }
}
function probStash(t, blk) {
  const t0 = blk.t0;
  win(110, 220, 820, 560, '白饭页.md — 写到一半', '#2f6fe0', { bg: '#f7f5ff' });
  for (let i = 0; i < 7; i++) { const w = i < 4 ? 520 + rnd(i) * 180 : 0; if (w) box(160, 320 + i * 56, w, 22, 11, i === 0 ? '#2f6fe0' : '#c9c3dd'); }
  const bl = Math.floor(t * 2.5) % 2; if (bl) box(160 + 300, 320 + 4 * 56, 6, 34, 2, '#2f6fe0');
  box(160, 690, 720, 34, 17, '#e4dff5'); box(160, 690, 360, 34, 17, '#ffb020'); txt('完成度 50%', 540, 707, 26, '#3b2a5a');
  txt('🍚', 820, 300, 70, '#000', { font: EMOJI, bold: false });
  const q = U.Q01; if (t >= q.vo + 0.1) {
    const s = popIn(t, q.vo + 0.1); const fl = 0.75 + 0.25 * Math.sin(t * 14);
    ctx.save(); ctx.translate(520, 220); ctx.scale(s, s); ctx.rotate(-0.04); box(-330, -56, 660, 112, 24, `rgba(255,59,92,${fl})`, '#fff', 6);
    txt('🚨 紧急：首页打不开！', 0, 3, 48, '#fff', { align: 'center' }); ctx.restore();
  }
  const d = U.D03; if (t >= d.vo + 0.3) note(520, 840, popIn(t, d.vo + 0.3), '不想提交半成品……', '#ffd23f', { fs: 36, rot: 0.03 });
}
const BCOMMITS = [['b1e2f03', '测试'], ['c4d5e66', '测试二'], ['d7f8a99', '这次真的是最后一次']];
function probReset(t, blk) {
  const t0 = blk.t0;
  win(110, 200, 820, 640, '豆包的 git log', PILLC.reset);
  BCOMMITS.slice().reverse().forEach((c, j) => {
    const i = 2 - j; const s = popIn(t, t0 + 0.3 + i * 0.25); const y = 330 + j * 150;
    const hiT = U.B01.vo + D('B01') * [0.05, 0.22, 0.45][i]; const hi = t >= hiT ? Math.sin(clamp((t - hiT) / 0.5) * Math.PI) : 0;
    commitCard(t, 520, y, 720, 120, c[0], c[1], { s: s * (1 + 0.06 * hi), col: hi > 0.05 ? '#ff5c8a' : PILLC.reset });
  });
  if (t >= t0 + 1.0) stamp(t, t0 + 1.0, 840, 770, '×3', '#ff3b5c', 90, -0.15);
}
const T_HARDQ = retime([{ t: 0, s: 'git reset --hard HEAD~2', cmd: true, dur: 0.7 }, { t: 0, s: '{r}HEAD is now at 1a2b3c4 添加首页' }], [['X01', 0.35], ['X01', 0.72]]);
function probHard(t, blk) {
  terminal(t, 110, 200, 820, 300, T_HARDQ, { fs: 30, title: '终端 — Grok 的电脑', accent: PILLC.hard });
  const boom = P('X01', 0.75); let [sx, sy] = shake(t, boom, 14, 0.4);
  ctx.save(); ctx.translate(sx, sy);
  const xs = [220, 400, 580, 760];
  seg(xs[0], 640, xs[3], 640, '#fff', 1, 10);
  xs.forEach((x, i) => {
    if (i < 2) { commitNode(x, 640, 0.6, null, { col: CH_COL[(i + 2) % 8] }); return; }
    const bp = prog(t, boom, 0.5); ctx.save(); ctx.globalAlpha *= 1 - bp * 0.75; ctx.translate(x, 640 + bp * 60); ctx.rotate(bp * (i === 2 ? -0.6 : 0.7));
    commitNode(0, 0, 0.6, null, { col: '#ff7a3d' }); ctx.restore(); if (bp > 0) bigX(x, 640, 50, '#ff3b5c', eOut(bp));
  });
  txt('首页', xs[0], 720, 28, '#1b1433', { align: 'center' }); txt('…', xs[1], 720, 28, '#1b1433', { align: 'center' });
  ctx.restore();
  if (t >= boom) { const s = popIn(t, boom + 0.15); miniCard(520, 770, 'grok.md 的改动', '#ff3b5c', s, { w: 380 }); bigX(700, 770, 34, '#ff3b5c', eOut(prog(t, boom + 0.3, 0.25))); }
  const d = U.D05; if (t >= d.vo) fancy('全没了？！', 520, 880, 80, t, d.vo + 0.1, FX.red);
}
function probReflog(t, blk) { bookCover(520, 520, popIn(t, blk.t0 + 0.2, 0.5), t); const d = U.D06; if (t >= d.vo + 0.2) note(520, 870, popIn(t, d.vo + 0.2), '退掉的提交 → 还在日记里？', '#a66bff', { fs: 34 }); }
const ERRS = [['error: Your local changes would be overwritten', '本地改动会被覆盖', '先 git commit 或 git stash'],
  ["You are in 'detached HEAD' state.", '停在了某个旧提交上', 'git switch main · git switch -c 新分支'],
  ['fatal: not a git repository', '不在仓库文件夹里', 'cd 进项目目录']];
function probErr(t, blk) {
  const t0 = blk.t0;
  win(110, 200, 820, 560, '终端', '#ff3b5c');
  ERRS.forEach((e, i) => { const ta = t0 + 0.3 + i * 0.35; if (t < ta) return; const fl = t < ta + 0.6 ? (Math.floor(t * 12) % 2 ? 0.4 : 1) : 1;
    ctx.save(); ctx.globalAlpha *= fl; txt(e[0], 140, 310 + i * 150, 25, '#ff6b81', { font: F_CODE, max: 760 }); ctx.restore(); });
  const c = U.C01; if (t >= c.vo + 0.4) { ERRS.forEach((e, i) => { const p = eOut(prog(t, c.vo + 0.4 + i * 0.25, 0.4)); box(140, 334 + i * 150, 740 * p, 6, 3, '#7cf07a'); });
    note(520, 840, popIn(t, P('C01', 0.6)), '读完再动手 ✓', '#7cf07a', { fs: 40 }); }
  else if (t >= t0 + 1.2) fancy('满屏红字……', 520, 860, 64, t, t0 + 1.2, FX.red);
}
function probAsk8(t, blk) { pharmacy(t, 520, 560, 0.7 * popIn(t, blk.t0 + 0.15, 0.45), i => 1, {}); }
function probAskP(t, blk) {
  const s = popIn(t, blk.t0 + 0.15, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 540); ctx.scale(s, s);
  box(-240, -300, 480, 600, 30, '#fff', '#2f6fe0', 8); box(-240, -300, 480, 90, [30, 30, 0, 0], '#2f6fe0');
  txt('白饭页.md', 0, -255, 44, '#fff', { align: 'center', font: F_FANCY, bold: false });
  for (let i = 0; i < 5; i++) box(-190, -170 + i * 60, 300 + rnd(i + 4) * 80, 22, 11, '#c9c3dd');
  txt('🍚', 0, 190, 120, '#000', { align: 'center', font: EMOJI, bold: false });
  ctx.restore();
  ['amend', 'stash', 'reset', 'revert', 'reflog'].forEach((k, i) => { const a = -Math.PI * 0.9 + i * Math.PI * 0.45; capsule(520 + Math.cos(a) * 380, 540 + Math.sin(a) * 360 + 40, 0.5 * popIn(t, blk.t0 + 0.4 + i * 0.08), PILLC[k], { label: k, rot: a * 0.3 }); });
}
const PROB = {
  amendQ: { chap: ['后悔药 ①', 'commit --amend', PILLC.amend], q: '刚提交的还能改？', bg: ['#d7f3ff', '#b5e6ff'], draw: probAmend },
  stashQ: { chap: ['后悔药 ②', 'git stash', '#e0a800'], q: '半成品怎么办？', bg: ['#fff1cc', '#ffe29a'], draw: probStash },
  resetQ: { chap: ['后悔药 ③', 'git reset', PILLC.reset], q: '一口气提交三次？', bg: ['#ffe6d6', '#ffcaa8'], draw: probReset },
  hardQ: { chap: ['危险药品', 'reset --hard', PILLC.hard], q: '改动全没了？', bg: ['#ffe0e0', '#ffbcbc'], draw: probHard },
  reflogQ: { chap: ['后悔药 ④', 'git reflog', PILLC.reflog], q: '还能找回来？', bg: ['#eadfff', '#d6c4ff'], draw: probReflog },
  errQ: { chap: ['急救', '看懂报错', '#e07a3d', F_BODY], q: '红色报错好慌！', bg: ['#ffe9dc', '#ffd0b5'], draw: probErr },
  ask8: { chap: ['复习', '后悔药一览', '#ffb020', F_BODY], q: '帮我整理一下！', bg: ['#d7f3ff', '#b5e6ff'], draw: probAsk8 },
  askP: { chap: ['实战', '白饭页走一遍', '#ff7a3d', F_BODY], q: '从头到尾用一遍！', bg: ['#ffe6d6', '#ffcaa8'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  cmdAt(BK.amendQ.t0 + 0.3, 'git commit -m "2024 年更新 喵"', 0.7); sfx(BK.amendQ.t0 + 1.1, 'pop', 0.4); sfx(U.D02.vo + 0.5, 'stamp', 0.6);
  sfx(U.Q01.vo + 0.1, 'buzz', 0.6);
  [0, 1, 2].forEach(i => sfx(BK.resetQ.t0 + 0.3 + i * 0.25, 'pop', 0.4)); sfx(BK.resetQ.t0 + 1.0, 'stamp', 0.6);
  sfx(P('X01', 0.75), 'impact', 0.9); sfx(P('X01', 0.78), 'glitch', 0.5);
  sfx(BK.reflogQ.t0 + 0.2, 'sparkle', 0.5);
  [0, 1, 2].forEach(i => sfx(BK.errQ.t0 + 0.3 + i * 0.35, 'buzz', 0.35)); sfx(P('C01', 0.6), 'ding', 0.5);
});

// ---- 后悔药①：commit --amend ----
const T_AMEND = retime([
  { t: 0, s: 'git commit --amend -m "2026 年更新 喵"', cmd: true },
  { t: 0, s: '{y}[main 9c4d2f1]{w} 2026 年更新 喵' },
  { t: 0, s: 'git add photo.png', cmd: true },
  { t: 0, s: 'git commit --amend --no-edit', cmd: true },
  { t: 0, s: '{y}[main 5a8e3b6]{w} 2026 年更新 喵  {d}2 files changed' },
], [['G02_02', 0.18], ['G02_02', 0.6], ['G02_03', 0.12], ['G02_03', 0.42], ['G02_03', 0.7]]);
SC.amend = (t, blk, en) => {
  bgLecture(t, PILLC.amend); lecturer(t, blk, en, blk.t0);
  const sw = S('G02_02') - 0.15;
  if (t < sw + 0.3) {
    const a = 1 - prog(t, sw, 0.3); ctx.save(); ctx.globalAlpha = a;
    capsule(1270, 340, 1.7 * popIn(t, blk.t0 + 0.1, 0.45), PILLC.amend, { label: 'amend', rot: -0.15 + Math.sin(t * 2) * 0.04, glow: 0.6 + 0.4 * Math.sin(t * 5) });
    fancy('第一颗：amend', 1270, 590, 90, t, P('G02_01', 0.25), FX.blue);
    pill(1270, 730, 'git commit --amend', '#7cf07a', popIn(t, P('G02_01', 0.5)), { fs: 44 });
    ctx.restore();
  }
  if (t >= sw) {
    const a = eOut(prog(t, sw, 0.3)); ctx.save(); ctx.globalAlpha = a;
    const f1 = P('G02_02', 0.6), f2 = P('G02_03', 0.7);
    const strike = prog(t, P('G02_02', 0.4), 0.25);
    const msg = t < f1 ? '2024 年更新 喵' : '2026 年更新 喵';
    commitCard(t, 1270, 190, 1080, 150, [[-1, 'e3b1a07'], [f1, '9c4d2f1'], [f2, '5a8e3b6']], msg, { col: PILLC.amend, strike: t < f1 ? strike : 0, hfs: 34, mfs: 40, glow: (t >= f1 && t < f1 + 0.6) || (t >= f2 && t < f2 + 0.6) ? 1 : 0 });
    miniCard(1500, 300, 'gemini.md', PILLC.amend, 1, { w: 220, h: 50, fs: 24 });
    if (t >= P('G02_03', 0.12)) {   // photo.png：先 add，再并进提交
      const [x, y, p] = arcPos(t, P('G02_03', 0.62), 0.45, 760, 900, 1740, 300, 160);
      const s0 = popIn(t, P('G02_03', 0.12));
      if (t < P('G02_03', 0.62)) miniCard(1000, 400, 'photo.png', '#ffd23f', s0, { w: 220, h: 50, fs: 24 });
      else miniCard(lerp(1000, 1740, eIO(p)), lerp(400, 300, eIO(p)) - Math.sin(p * Math.PI) * 80, 'photo.png', '#22c08b', 1, { w: 220, h: 50, fs: 24 });
      if (t < P('G02_03', 0.62)) txt('已 add', 1000, 448, 22, '#ffd23f', { align: 'center' });
    }
    terminal(t, 690, 470, 1160, 360, T_AMEND, { fs: 28, title: '终端 — Gemini 的电脑', accent: PILLC.amend });
    ctx.restore();
  }
  if (t >= S('G02_04') - 0.1) {
    const s = popIn(t, P('G02_04', 0.1));
    note(1270, 395, s, '每次 amend → 换一个新编号', '#ffd23f', { fs: 34 });
    const cs = popIn(t, P('G02_04', 0.5)); if (cs > 0) { cloud(1720, 560, 0.5 * cs, { t, label: '已 push' }); prohibit(1720, 560, 110, cs); }
    fancy('只改还没 push 的！', 1270, 890, 66, t, P('G02_04', 0.55), FX.red);
  }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['M02']); sfx(BK.amend.t0 + 0.1, 'pop', 0.6); sfx(P('G02_01', 0.25), 'sparkle', 0.4); sfx(S('G02_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G02_02', 0.4), 'click', 0.4); sfx(P('G02_02', 0.6), 'ding', 0.5); sfx(P('G02_03', 0.12), 'pop', 0.4); sfx(P('G02_03', 0.62), 'whoosh', 0.4); sfx(P('G02_03', 0.7), 'ding', 0.5); sfx(P('G02_04', 0.1), 'pop', 0.4); sfx(P('G02_04', 0.5), 'buzz', 0.4); sfx(P('G02_04', 0.55), 'stamp', 0.5); });

// ---- 后悔药②：git stash ----
const T_STASH = retime([
  { t: 0, s: 'git stash', cmd: true },
  { t: 0, s: '{g}Saved working directory and index state WIP on main' },
  { t: 0, s: 'git switch -c hotfix', cmd: true },
  { t: 0, s: 'git commit -am "修复首页"', cmd: true },
  { t: 0, s: 'git switch main', cmd: true },
  { t: 0, s: 'git stash pop', cmd: true },
  { t: 0, s: 'git stash list', cmd: true },
  { t: 0, s: '{y}stash@{0}{w}: WIP on main: 白饭页' },
  { t: 0, s: '{y}stash@{1}{w}: WIP on main: 封面' },
  { t: 0, s: 'git stash -u', cmd: true },
  { t: 0, s: '{d}# -u：新建的文件也一起收' },
], [['G03_01', 0.25], ['G03_01', 0.5], ['G03_02', 0.3], ['G03_02', 0.6], ['G03_02', 0.84], ['G03_03', 0.22], ['G03_04', 0.12], ['G03_04', 0.3], ['G03_04', 0.36], ['G03_04', 0.62], ['G03_04', 0.8]]);
SC.stash = (t, blk, en) => {
  bgLecture(t, '#ffb020'); lecturer(t, blk, en, blk.t0);
  const a = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha = a;
  const stT = P('G03_01', 0.4), popT = P('G03_03', 0.35);
  const bump = t0 => Math.sin(clamp((t - t0 + 0.25) / 1.0) * Math.PI);
  const listOn = t >= P('G03_04', 0.12) ? eOut(prog(t, P('G03_04', 0.12), 0.3)) : 0;
  const open = Math.max(bump(stT), bump(popT), listOn);
  const n = listOn > 0 ? 2 : (t >= stT + 0.4 && t < popT + 0.3) ? 1 : 0;
  win(690, 100, 560, 420, '工作区', '#3ec1ff');
  const inWork = t < stT || t >= popT + 0.6;
  if (inWork) docIcon(970, 300, 1.1, 'MD', '#2f6fe0', { name: '白饭页（写到一半）', nameSize: 26 });
  else if (t >= stT + 0.6 && t < popT) {
    const s = popIn(t, stT + 0.6); ctx.save(); ctx.translate(970, 290); ctx.scale(s, s); txt('✓ 干净', 0, 0, 72, '#7cf07a', { align: 'center', font: F_FANCY, bold: false }); ctx.restore();
    if (t >= P('G03_02', 0.6)) pill(970, 420, 'hotfix ✓ 修好', '#ff8fa3', popIn(t, P('G03_02', 0.6)), { font: F_BODY, fs: 30 });
  }
  drawer(1560, 290, 0.78, open, n, { hi: t >= stT && t < stT + 0.8 });
  if (t >= stT && t < stT + 0.6) { const [x, y] = arcPos(t, stT, 0.6, 970, 300, 1560, 330, 140); docIcon(x, y, lerp(1.1, 0.5, prog(t, stT, 0.6)), 'MD', '#2f6fe0'); }
  if (t >= popT && t < popT + 0.6) { const [x, y] = arcPos(t, popT, 0.6, 1560, 330, 970, 300, 140); docIcon(x, y, lerp(0.5, 1.1, prog(t, popT, 0.6)), 'MD', '#2f6fe0'); }
  if (t >= P('G03_04', 0.62)) { const s = popIn(t, P('G03_04', 0.62)); miniCard(1560, 520, '新文件：加 -u', '#ffd23f', s, { w: 300, h: 56, fs: 28 }); }
  terminal(t, 690, 560, 1160, 300, T_STASH, { fs: 24, title: '终端', accent: '#ffb020' });
  ctx.restore();
  if (t >= P('G03_01', 0.55) && t < S('G03_02')) fancy('先收进抽屉！', 1270, 900, 66, t, P('G03_01', 0.55), Object.assign({ out: S('G03_02') - 0.2 }, FX.yel));
  if (t >= P('G03_03', 0.4) && t < S('G03_04')) fancy('原样放回来！', 1270, 900, 66, t, P('G03_03', 0.4), Object.assign({ out: S('G03_04') - 0.2 }, FX.green));
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['Q02']); const stT = P('G03_01', 0.4), popT = P('G03_03', 0.35); sfx(stT - 0.1, 'click', 0.5); sfx(stT, 'whoosh', 0.5); sfx(stT + 0.6, 'stamp', 0.4); sfx(P('G03_02', 0.6), 'ding', 0.4); sfx(popT - 0.1, 'click', 0.5); sfx(popT, 'whoosh', 0.5); sfx(popT + 0.6, 'pop', 0.4); sfx(P('G03_04', 0.12), 'click', 0.4); sfx(P('G03_04', 0.62), 'pop', 0.4); });

// ---- 后悔药③：git reset ----
SC.reset = (t, blk, en) => {
  bgLecture(t, PILLC.reset); lecturer(t, blk, en, blk.t0);
  const big = t >= S('G04_05') - 0.1;
  ctx.save(); if (big) ctx.globalAlpha = 1 - 0.7 * prog(t, S('G04_05') - 0.1, 0.3);
  zoneBoard(t, blk.t0 + 0.1, t >= P('G04_04', 0.4) ? 'work' : t >= P('G04_03', 0.4) ? 'repo' : t >= P('G04_02', 0.5) ? 'stage' : null);
  const softT = P('G04_02', 0.5), comT = P('G04_03', 0.42), mixT = P('G04_04', 0.42);
  const RX = 1670, SX = 1285, WX = 900, Y0 = 350;
  miniCard(RX, Y0, '添加首页', '#8f8aa8', 1, { w: 290 });
  if (t < comT + 0.5) BCOMMITS.forEach((c, i) => {
    const ft = softT + i * 0.08; const ty = Y0 + 90 + i * 85;
    if (t < ft) { const hi = t < S('G04_02') && t >= S('G04_01') ? 1 + 0.04 * Math.sin(t * 9 + i) : 1; miniCard(RX, ty, c[1], '#ff5c8a', popIn(t, blk.t0 + 0.3 + i * 0.1) * hi, { w: 290, fs: c[1].length > 6 ? 22 : 28 }); return; }
    if (t < comT) { const [x, y] = arcPos(t, ft, 0.45, RX, ty, SX, ty, 90); miniCard(x, y, '改动 ' + (i + 1), '#ffd23f', 1, { w: 250 }); return; }
    const [x, y, p] = arcPos(t, comT, 0.45, SX, ty, RX, Y0 + 90, 90); ctx.save(); ctx.globalAlpha *= 1 - p; miniCard(x, y, '改动 ' + (i + 1), '#ffd23f', 1, { w: 250 }); ctx.restore();
  });
  if (t >= comT + 0.35) {
    if (t < mixT) miniCard(RX, Y0 + 90, '添加豆包介绍页', '#22c08b', popIn(t, comT + 0.35), { w: 300, fs: 26 });
    else { const [x, y] = arcPos(t, mixT, 0.5, RX, Y0 + 90, WX, Y0 + 90, 110); miniCard(x, y, t < mixT + 0.3 ? '添加豆包介绍页' : '改动（未 add）', t < mixT + 0.3 ? '#22c08b' : '#3ec1ff', 1, { w: 300, fs: 26 }); }
  }
  if (t >= comT + 0.35 && t < comT + 1.2) sparkle(t, comT + 0.35, RX, Y0 + 90, 160, 10);
  if (t < S('G04_02')) fancy('第三颗：reset', 1285, 140, 78, t, P('G04_01', 0.45), FX.orange);
  cmdBar(t, 1285, 140, 'git reset --soft HEAD~3', P('G04_02', 0.05), 0.8, { out: S('G04_03') - 0.1, col: PILLC.reset });
  cmdBar(t, 1285, 140, 'git commit -m "添加豆包介绍页"', P('G04_03', 0.05), 0.7, { out: S('G04_04') - 0.1, col: PILLC.reset });
  cmdBar(t, 1285, 140, 'git reset HEAD~1', P('G04_04', 0.05), 0.5, { out: S('G04_05') - 0.15, col: '#3ec1ff' });
  if (t >= P('G04_02', 0.6) && t < S('G04_04')) note(SX, 800, popIn(t, P('G04_02', 0.6)), t < comT ? '--soft：改动留在暂存区' : '三次 → 合成一次 ✓', t < comT ? '#ffd23f' : '#22c08b', { fs: 34 });
  if (t >= P('G04_04', 0.55)) note(WX + 120, 800, popIn(t, P('G04_04', 0.55)), '默认 --mixed：改动回到工作区', '#3ec1ff', { fs: 32 });
  ctx.restore();
  if (big) {
    const s = popIn(t, S('G04_05') - 0.1); ctx.save(); ctx.translate(1270, 470); ctx.scale(s, s);
    box(-540, -300, 1080, 600, 36, 'rgba(20,14,40,0.95)', PILLC.reset, 8);
    txt('reset 三种模式', 0, -220, 52, '#fff', { align: 'center', font: F_FANCY, bold: false });
    [['soft', '留暂存', '#ffd23f', 0.32], ['mixed', '留工作区', '#3ec1ff', 0.55], ['hard', '全清空', '#ff3b5c', 0.78]].forEach((r, i) => {
      const on = t >= P('G04_05', r[3]); const y = -100 + i * 125; const ps = on ? popIn(t, P('G04_05', r[3])) : 0;
      ctx.save(); ctx.globalAlpha *= on ? 1 : 0.25;
      pill(-250, y, '--' + r[0], r[2], on ? ps : 1, { fs: 46 });
      txt('→', -40, y, 56, '#fff', { align: 'center' }); txt(r[1], 40, y, 62, r[2], { font: F_FANCY, bold: false });
      ctx.restore();
    });
    ctx.restore();
  }
  guest(t, blk);
};
SFX_FNS.push(() => {
  guestSfx(['B02']); cmdAt(P('G04_02', 0.05), 'git reset --soft HEAD~3', 0.8); cmdAt(P('G04_03', 0.05), 'git commit -m "添加豆包介绍页"', 0.7); cmdAt(P('G04_04', 0.05), 'git reset HEAD~1', 0.5);
  [0, 1, 2].forEach(i => sfx(P('G04_02', 0.5) + i * 0.08, 'whoosh', 0.3)); sfx(P('G04_03', 0.42), 'whoosh', 0.4); sfx(P('G04_03', 0.42) + 0.35, 'sparkle', 0.5); sfx(P('G04_04', 0.42), 'whoosh', 0.4);
  sfx(P('G04_01', 0.45), 'impact', 0.5); sfx(S('G04_05') - 0.1, 'swoosh_in', 0.4); [0.32, 0.55, 0.78].forEach(f => sfx(P('G04_05', f), 'stamp', 0.5));
});

// ---- 危险药品：reset --hard + revert ----
SC.hard = (t, blk, en) => {
  bgLecture(t, PILLC.hard); lecturer(t, blk, en, blk.t0);
  const sw = S('G05_03') - 0.1;
  if (t < sw + 0.3) {
    const a = 1 - prog(t, sw, 0.3); ctx.save(); ctx.globalAlpha = a;
    const shrink = eIO(prog(t, P('G05_01', 0.45), 0.4));
    dangerBottle(lerp(1270, 1760, shrink), lerp(420, 210, shrink), lerp(1.5, 0.55, shrink) * popIn(t, blk.t0 + 0.1, 0.45), { rot: Math.sin(t * 7) * 0.05 * (1 - shrink), glow: 1 - shrink });
    if (shrink < 1) fancy('最危险的一颗！', 1270, 800, 80, t, P('G05_01', 0.12), Object.assign({ out: P('G05_01', 0.45) }, FX.red));
    if (shrink > 0) {
      const za = eOut(prog(t, P('G05_01', 0.45), 0.3));
      ctx.save(); ctx.globalAlpha *= za;
      miniZone(980, 470, 440, 380, '提交', '#ff7a3d', 1); miniZone(1500, 470, 440, 380, '没提交的改动', '#3ec1ff', 1);
      const b1 = P('G05_01', 0.62), b2 = P('G05_01', 0.78);
      [[930, 440], [1030, 520]].forEach((q, i) => { const bp = prog(t, b1, 0.4); ctx.save(); ctx.globalAlpha *= 1 - bp * 0.7; commitNode(q[0], q[1] + bp * 40, 0.6, null, { col: '#ff7a3d' }); ctx.restore(); });
      { const bp = prog(t, b2, 0.4); ctx.save(); ctx.globalAlpha *= 1 - bp * 0.7; docIcon(1500, 470 + bp * 40, 0.9, 'MD', '#3ec1ff', { rot: bp * 0.4 }); ctx.restore(); }
      if (t >= b1) bigX(980, 480, 90, '#ff3b5c', eOut(prog(t, b1, 0.25)));
      if (t >= b2) bigX(1500, 480, 90, '#ff3b5c', eOut(prog(t, b2, 0.25)));
      ctx.restore();
    }
    if (t >= S('G05_02')) { stamp(t, P('G05_02', 0.25), 1500, 640, '找不回来！', '#ff3b5c', 60, -0.1); note(1240, 820, popIn(t, P('G05_02', 0.55)), '用之前：先 commit 或 stash', '#7cf07a', { fs: 40 }); }
    ctx.restore();
  }
  if (t >= sw) {
    const a = eOut(prog(t, sw, 0.3)); ctx.save(); ctx.globalAlpha = a;
    cloud(1730, 190, 0.5, { t, label: '已 push' }); pill(1730, 300, 'origin/main', '#c9a6ff', 1, { fs: 26 });
    const xs = [820, 1040, 1260, 1480], y = 470, nx = 1700;
    seg(xs[0], y, (t >= P('G05_04', 0.1) ? nx : xs[3]), y, '#fff', 1, 10);
    xs.forEach((x, i) => commitNode(x, y, 0.62, null, { col: i === 3 ? '#ff3b5c' : CH_COL[(i + 2) % 8] }));
    txt('Grok 改坏', xs[3], y - 80, 28, '#ff8a9b', { align: 'center' });
    if (t < S('G05_04')) {
      const rp = eOut(prog(t, P('G05_03', 0.3), 0.4));
      if (rp > 0) { ctx.save(); ctx.strokeStyle = '#ffb3c0'; ctx.lineWidth = 8; ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.arc((xs[1] + xs[3]) / 2, y - 20, (xs[3] - xs[1]) / 2, Math.PI * 2 - 0.1, Math.PI * 2 - 0.1 - rp * (Math.PI - 0.2), true); ctx.stroke(); ctx.restore(); txt('reset 改历史', (xs[1] + xs[3]) / 2, y - 300, 34, '#ffb3c0', { align: 'center' }); }
      if (t >= P('G05_03', 0.55)) prohibit((xs[1] + xs[3]) / 2, y - 200, 70, popIn(t, P('G05_03', 0.55)));
      if (t >= P('G05_03', 0.78)) pill(1270, 700, 'git revert', '#7cf07a', popIn(t, P('G05_03', 0.78)), { fs: 48 });
    } else {
      const np = popIn(t, P('G05_04', 0.1));
      if (np > 0) { commitNode(nx, y, 0.62 * np, null, { col: '#22c08b', glow: 1, t }); txt('反向提交', nx, y - 80, 28, '#7cf07a', { align: 'center' }); }
      const ap = eOut(prog(t, P('G05_04', 0.3), 0.5));
      if (ap > 0) { ctx.save(); ctx.strokeStyle = '#7cf07a'; ctx.lineWidth = 8; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 50; ctx.beginPath(); ctx.arc((xs[3] + nx) / 2, y + 10, (nx - xs[3]) / 2, 0.15, 0.15 + ap * (Math.PI - 0.3)); ctx.stroke(); ctx.restore(); if (ap >= 1) txt('把改动反着做一遍', (xs[3] + nx) / 2, y + 190, 30, '#7cf07a', { align: 'center' }); }
      if (t >= P('G05_04', 0.6)) note(1270, 760, popIn(t, P('G05_04', 0.6)), '历史一条不少 · 队友不受影响', '#22c08b', { fs: 38 });
    }
    ctx.restore();
    if (t >= S('G05_03') && t < S('G05_04')) fancy('push 过的用 revert！', 1270, 900, 64, t, P('G05_03', 0.8), Object.assign({ out: S('G05_04') - 0.2 }, FX.green));
  }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['X02']); sfx(BK.hard.t0 + 0.1, 'impact', 0.6); sfx(P('G05_01', 0.12), 'buzz', 0.5); sfx(P('G05_01', 0.45), 'whoosh', 0.4); sfx(P('G05_01', 0.62), 'glitch', 0.5); sfx(P('G05_01', 0.78), 'glitch', 0.5); sfx(P('G05_02', 0.25), 'stamp', 0.6); sfx(P('G05_02', 0.55), 'ding', 0.4); sfx(S('G05_03') - 0.1, 'swoosh_in', 0.4); sfx(P('G05_03', 0.55), 'buzz', 0.5); sfx(P('G05_03', 0.78), 'pop', 0.5); sfx(P('G05_04', 0.1), 'ding', 0.5); sfx(P('G05_04', 0.3), 'whoosh', 0.4); sfx(P('G05_04', 0.6), 'sparkle', 0.4); });

// ---- 后悔药④：git reflog ----
const REFLOG = [['1a2b3c4', 'HEAD@{0}', 'reset: moving to HEAD~2'], ['f3d8b40', 'HEAD@{1}', 'commit: Grok 页 加特效'], ['2e6a1c9', 'HEAD@{2}', 'commit: Grok 页 初稿'], ['1a2b3c4', 'HEAD@{3}', 'commit: 添加首页']];
const T_REFLOG = retime([
  { t: 0, s: 'git reflog', cmd: true },
  { t: 0, s: 'git reset --hard f3d8b40', cmd: true },
  { t: 0, s: '{g}HEAD is now at f3d8b40 Grok 页 加特效' },
  { t: 0, s: 'git branch rescue f3d8b40', cmd: true },
], [['G06_01', 0.22], ['G06_03', 0.12], ['G06_03', 0.5], ['G06_04', 0.3]]);
SC.reflog = (t, blk, en) => {
  bgLecture(t, PILLC.reflog); lecturer(t, blk, en, blk.t0);
  const a = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha = a;
  diary(700, 130, 1150, 400, '📖 Git 日记 · reflog');
  const rowT = i => P('G06_01', 0.4 + i * 0.07);
  const hiRow = t >= P('G06_02', 0.3) ? 1 : -1; const scanning = t >= S('G06_02') && t < P('G06_02', 0.3);
  REFLOG.forEach((r, i) => {
    const y = 210 + i * 76; const s = prog(t, rowT(i), 0.25); if (s <= 0) return;
    ctx.save(); ctx.globalAlpha *= s;
    const hl = (hiRow === i) || (scanning && Math.floor(prog(t, S('G06_02'), D('G06_02') * 0.3) * 4) === i);
    if (hl) { const pp = 0.5 + 0.5 * Math.sin(t * 7); box(720, y - 32, 1110, 64, 14, `rgba(255,210,63,${hiRow === i ? 0.35 + 0.25 * pp : 0.25})`); }
    txt(r[0], 740, y, 32, '#b07a00', { font: F_CODE }); txt(r[1], 920, y, 30, '#7c5cff', { font: F_CODE }); txt(r[2], 1110, y, 30, '#1b1433', { max: 700 });
    ctx.restore();
  });
  if (t >= U.K02.vo) { avatar('K', 1790, 286, 34, { s: popIn(t, U.K02.vo + 0.1) }); stamp(t, P('K02', 0.5), 1640, 300, '出事之前', '#a66bff', 34, -0.08); }
  if (t >= P('G06_02', 0.72)) { const [x, y, p] = arcPos(t, P('G06_02', 0.72), 0.5, 800, 286, 1010, 650, 80); if (p < 1) miniCard(x, y, 'f3d8b40', '#ffd23f', 1, { w: 200, h: 50, fs: 26, icon: false }); else if (t < P('G06_03', 0.12)) note(1010, 650, 1, '已复制 f3d8b40', '#ffd23f', { fs: 28 }); }
  terminal(t, 690, 570, 640, 290, T_REFLOG, { fs: 24, title: '终端 — Grok 的电脑', accent: PILLC.reflog });
  // 右下：提交链
  win(1350, 570, 500, 290, '提交历史', '#8f8aa8');
  const xs = [1440, 1600, 1760], cy = 730, rest = P('G06_03', 0.52);
  seg(xs[0], cy, xs[2], cy, t >= rest ? '#fff' : 'rgba(255,255,255,0.3)', 1, 8);
  xs.forEach((x, i) => { ctx.save(); if (i > 0 && t < rest) ctx.globalAlpha *= 0.25; commitNode(x, cy, 0.42, null, { col: i ? '#ff7a3d' : '#8f8aa8', glow: i > 0 && t >= rest && t < rest + 1 ? 1 : 0, t }); ctx.restore(); });
  headTag(t >= rest ? xs[2] : xs[0], cy - 70, 0.75);
  ['首页', '初稿', '特效'].forEach((s, i) => txt(s, xs[i], cy + 48, 22, '#ece9f7', { align: 'center' }));
  if (t >= rest && t < rest + 1.2) sparkle(t, rest, xs[2], cy, 120, 8);
  if (t >= P('G06_04', 0.55)) { const s = popIn(t, P('G06_04', 0.55)); arrow(xs[2] - 70, cy + 100, xs[2] - 20, cy + 40, '#7cf07a', s, 7); pill(xs[2] - 130, cy + 100, 'rescue', '#7cf07a', s, { fs: 24 }); }
  ctx.restore();
  if (t >= P('G06_03', 0.55) && t < S('G06_04')) fancy('两次提交，全回来了！', 1270, 900, 64, t, P('G06_03', 0.55), Object.assign({ out: S('G06_04') - 0.2 }, FX.green));
  if (t >= S('G06_05') - 0.1 && t < S('X03') - 0.2) {
    const s = popIn(t, S('G06_05') - 0.1); ctx.save(); ctx.translate(1270, 450); ctx.scale(s, s);
    box(-470, -250, 940, 500, 36, 'rgba(20,14,40,0.95)', '#ff3b5c', 8);
    txt('reflog 只记 提交过的', 0, -160, 50, '#fff', { align: 'center' });
    miniCard(-200, -20, '提交过的 ✓', '#22c08b', 1, { w: 320, h: 70, fs: 32 }); miniCard(200, -20, '没提交的改动', '#ff3b5c', 1, { w: 320, h: 70, fs: 32 });
    if (t >= P('G06_05', 0.6)) bigX(200, -20, 70, '#ff3b5c', eOut(prog(t, P('G06_05', 0.6), 0.25)));
    txt('救不了 → 动手前先 commit', 0, 130, 44, '#ffd36b', { align: 'center', font: F_FANCY, bold: false });
    ctx.restore();
  }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['K02', 'X03']); [0, 1, 2, 3].forEach(i => sfx(P('G06_01', 0.4 + i * 0.07), 'pop', 0.3)); sfx(P('G06_02', 0.3), 'ding', 0.4); sfx(P('K02', 0.5), 'stamp', 0.5); sfx(P('G06_02', 0.72), 'whoosh', 0.3); sfx(P('G06_03', 0.52), 'sparkle', 0.6); sfx(P('G06_03', 0.55), 'confetti', 0.3); sfx(P('G06_04', 0.55), 'pop', 0.4); sfx(S('G06_05') - 0.1, 'impact', 0.5); sfx(P('G06_05', 0.6), 'buzz', 0.4); });

// ---- 报错急救 ----
SC.errors = (t, blk, en) => {
  bgLecture(t, '#e07a3d'); lecturer(t, blk, en, blk.t0);
  const ids = ['G07_02', 'G07_03', 'G07_04'], fl = [0.35, 0.28, 0.32];
  const cur = ids.findIndex((id, i) => t >= S(id) - 0.1 && (i === 2 || t < S(ids[i + 1]) - 0.1));
  ERRS.forEach((e, i) => {
    const s = popIn(t, P('G07_01', 0.15 + i * 0.12)); const focus = cur < 0 || cur === i || t >= S('C02') - 0.2;
    errCard(t, 690, 110 + i * 240, 1160, 200, e[0], e[1], e[2], P(ids[i], fl[i]), { s: s * (cur === i ? 1.03 : 1), alpha: focus ? 1 : 0.45 });
  });
  if (t < S('G07_02')) fancy('最常见的三个！', 1270, 900, 66, t, P('G07_01', 0.5), FX.orange);
  guest(t, blk);
  if (t >= P('C02', 0.65)) stamp(t, P('C02', 0.65), 1180, 520, '批准 ✓', '#22c08b', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['C02']); [0, 1, 2].forEach(i => sfx(P('G07_01', 0.15 + i * 0.12), 'buzz', 0.3)); [['G07_02', 0.35], ['G07_03', 0.28], ['G07_04', 0.32]].forEach(x => { sfx(P(x[0], x[1]), 'whoosh', 0.4); sfx(P(x[0], x[1]) + 0.2, 'ding', 0.4); }); sfx(P('G07_01', 0.5), 'sparkle', 0.4); sfx(P('C02', 0.65), 'stamp', 0.7); });

// ---- 复习：药房一览 ----
const RC_LIT = [['G08_01', 0.1], ['G08_01', 0.62], ['G08_02', 0.08], ['G08_02', 0.68], ['G08_03', 0.55], ['G08_03', 0.05]];
SC.recap = (t, blk, en) => {
  bgLecture(t, '#ffd23f'); lecturer(t, blk, en, blk.t0);
  pharmacy(t, 1270, 500, 0.95 * eBack(prog(t, blk.t0 + 0.05, 0.4)), i => prog(t, P(RC_LIT[i][0], RC_LIT[i][1]), 0.3), { glow: true, desc: true });
  if (t >= P('G08_03', 0.75)) fancy('后悔药，对症服用！', 1270, 900, 66, t, P('G08_03', 0.75), FX.yel);
};
SFX_FNS.push(() => { RC_LIT.forEach(x => sfx(P(x[0], x[1]), 'ding', 0.4)); sfx(P('G08_03', 0.75), 'sparkle', 0.5); });

// ---- 实战：白饭页 ----
const T_PRAC = retime([
  { t: 0, s: 'git commit --amend -m "添加白饭页"', cmd: true },
  { t: 0, s: '{y}[main 5e6f7a8]{w} 添加白饭页' },
  { t: 0, s: 'git stash', cmd: true, dur: 0.3 },
  { t: 0, s: 'git switch -c hotfix', cmd: true, dur: 0.45 },
  { t: 0, s: 'git commit -am "修复首页"', cmd: true, dur: 0.5 },
  { t: 0, s: 'git switch main', cmd: true, dur: 0.35 },
  { t: 0, s: 'git stash pop', cmd: true, dur: 0.35 },
  { t: 0, s: 'git commit -am "白饭页写完了"', cmd: true, dur: 0.5 },
  { t: 0, s: 'git reset --hard HEAD~1', cmd: true, dur: 0.5 },
  { t: 0, s: '{r}HEAD is now at 5e6f7a8 添加白饭页' },
  { t: 0, s: 'git reflog', cmd: true, dur: 0.3 },
  { t: 0, s: '{y}c0ffee1{w} HEAD@{1}: commit: 白饭页写完了' },
  { t: 0, s: 'git reset --hard c0ffee1', cmd: true, dur: 0.5 },
  { t: 0, s: '{g}HEAD is now at c0ffee1 白饭页写完了' },
], [['G09_02', 0.3], ['G09_02', 0.75], ['G09_03', 0.15], ['G09_03', 0.3], ['G09_03', 0.46], ['G09_03', 0.68], ['G09_03', 0.8],
  ['G09_04', 0.04], ['G09_04', 0.2], ['G09_04', 0.32], ['G09_04', 0.5], ['G09_04', 0.6], ['G09_04', 0.7], ['G09_04', 0.84]]);
SC.practice = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  const steps = [['amend', S('G09_02')], ['stash', P('G09_03', 0.15)], ['hotfix', P('G09_03', 0.3)], ['pop', P('G09_03', 0.8)], ['commit', S('G09_04')], ['reset', P('G09_04', 0.2)], ['reflog', P('G09_04', 0.5)]];
  const end = S('D10') - 0.2;
  steps.forEach((s, i) => {
    const a = popIn(t, blk.t0 + 0.15 + i * 0.06); if (a <= 0) return;
    const x = 760 + i * 172, y = 88; const act = t < end && t >= s[1] && (i === 6 || t < steps[i + 1][1]); const done = t >= end || (i < 6 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1));
    box(-80, -32, 160, 64, 18, act ? '#ff7a3d' : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act ? '✓ ' : '') + s[0], 0, 2, 24, '#fff', { align: 'center', font: F_CODE }); ctx.restore();
  });
  const ta = eOut(prog(t, blk.t0, 0.3));
  terminal(t, 676, 160, 680, 700, T_PRAC, { alpha: ta, fs: 21, accent: '#ff7a3d', title: '终端 — 大肥鱼的电脑' });
  ctx.save(); ctx.globalAlpha = ta;
  win(1370, 160, 520, 700, '白饭页.md', '#2f6fe0', { bg: '#f7f5ff' });
  const wrote = P('G09_04', 0.04), lost = P('G09_04', 0.33), back = P('G09_04', 0.86);
  const stashed = t >= P('G09_03', 0.15) && t < P('G09_03', 0.8);
  const nL = (t >= wrote && (t < lost || t >= back)) ? 10 : 6;
  ctx.save(); if (stashed) ctx.globalAlpha *= 0.25;
  for (let i = 0; i < nL; i++) { const fresh = i >= 6 && t < back + 0.8 && t >= back; box(1410, 290 + i * 46, 300 + rnd(i + 2) * 120, 20, 10, i === 0 ? '#2f6fe0' : fresh ? '#22c08b' : '#c9c3dd'); }
  ctx.restore();
  txt(t >= P('G09_02', 0.75) ? '✓ 添加白饭页' : '完成百饭页', 1410, 250, 26, t >= P('G09_02', 0.75) ? '#1a7f37' : '#d6283e');
  if (stashed) txt('📦 收进 stash 了', 1630, 450, 34, '#b07a00', { align: 'center' });
  txt('🍚', 1800, 800, 64, '#000', { align: 'center', font: EMOJI, bold: false });
  if (t >= lost && t < lost + 0.4) { ctx.fillStyle = `rgba(255,59,92,${0.4 * (1 - prog(t, lost, 0.4))})`; ctx.fillRect(1376, 220, 508, 634); }
  if (t >= back && t < back + 0.5) { ctx.fillStyle = `rgba(124,240,122,${0.4 * (1 - prog(t, back, 0.5))})`; ctx.fillRect(1376, 220, 508, 634); }
  ctx.restore();
  if (t < S('G09_02')) fancy('实战开始！', 1280, 500, 110, t, P('G09_01', 0.3), Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_pill', 1600, H + 30, 860, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    const bs = popIn(t, end + 0.05, 0.4); ctx.save(); ctx.translate(1050, 420); ctx.scale(bs, bs); ctx.rotate(-0.05);
    box(-200, -230, 400, 460, 26, '#fff', '#2f6fe0', 8); box(-200, -230, 400, 80, [26, 26, 0, 0], '#2f6fe0'); txt('白饭页.md', 0, -190, 40, '#fff', { align: 'center', font: F_FANCY, bold: false });
    for (let i = 0; i < 6; i++) box(-160, -120 + i * 44, 240 + rnd(i + 2) * 60, 18, 9, '#22c08b');
    txt('🍚', 0, 170, 90, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore();
    fancy('一个字都没丢！', 1050, 780, 80, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 7; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(P('G09_01', 0.3), 'impact', 0.6); sfx(P('G09_02', 0.75), 'ding', 0.4); sfx(P('G09_03', 0.15), 'whoosh', 0.3); sfx(P('G09_03', 0.8), 'pop', 0.4); sfx(P('G09_04', 0.33), 'glitch', 0.6); sfx(P('G09_04', 0.86), 'sparkle', 0.6); const end = S('D10') - 0.2; sfx(end, 'impact', 0.6); sfx(end + 0.4, 'confetti', 0.6); });

// ---- 预告 + 三连 ----
function tagIcon(x, y, s, label, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.18 + Math.sin(t * 3) * 0.05);
  ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(-200, -90); ctx.lineTo(120, -90); ctx.lineTo(220, 0); ctx.lineTo(120, 90); ctx.lineTo(-200, 90); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#a66bff'; ctx.beginPath(); ctx.arc(130, 0, 22, 0, 7); ctx.fill(); ctx.stroke();
  txt(label, -40, 4, 96, '#1b1433', { align: 'center', font: F_FANCY, bold: false });
  ctx.restore();
}
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#a66bff');
  const outro = E('G10_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G10_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G10_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 130, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G10_01', 0.15), 0.5); if (bp > 0) tagIcon(1260, 450, bp, 'v1.0', t);
    [['git tag v1.0', -470, 300, 0.35], ['git push --tags', 470, 290, 0.5], ['GitHub Releases', -440, 620, 0.62], ['📦 附件下载', 450, 630, 0.72]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G10_01', c[3])), { fs: 34, font: c[0].startsWith('📦') ? F_BODY : F_CODE }));
    fancy('给作品打上版本标签！', 1260, 820, 84, t, P('G10_01', 0.75), FX.pink);
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
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_pill', 1690, H + 40, 640, { scale: sa }); }
      SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
    ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
    ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G10_01', 0.15), 'pop', 0.6); [0.35, 0.5, 0.62, 0.72].forEach(f => sfx(P('G10_01', f), 'pop', 0.4)); sfx(P('G10_01', 0.75), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G10_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G10_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_sparkle', P('G02_03', 0.75), E('G02_03')], ['d_relief', P('G03_03', 0.5), E('G03_03')], ['d_shock', P('G05_02', 0.2), E('G05_02')],
  ['d_sparkle', P('G06_03', 0.6), E('G06_03')], ['d_ok', P('G07_04', 0.5), E('G07_04')],
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
