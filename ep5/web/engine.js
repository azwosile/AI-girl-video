// AI娘 Git课 · 第5集 渲染引擎 —— renderAt(t) 纯函数，逐帧确定性导出（通用部分沿用第1集）
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const F_FANCY = '"Smiley", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const F_BODY = '"Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const F_CODE = 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", "Microsoft YaHei", "Noto Sans CJK SC", monospace';

// ================= 素材 =================
const SPR = {};
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'g_cheer', 'g_warn', 'g_think', 'g_shock', 'g_proud', 'g_type', 'g_peace', 'g_awkward', 'g_present', 'd_panic', 'd_curious', 'd_happy', 'd_raise', 'd_think', 'd_shock', 'd_sparkle', 'd_ok', 'd_relief', 'd_leader', 'q_base', 'q_point', 'q_tea', 'c_base', 'c_ok', 'c_cool', 'm_base', 'm_panic', 'm_cheeky', 'x_base', 'x_angry', 'x_force', 'b_base', 'b_sorry', 'k_base', 'k_read', 'g_pill', 'd_pill', 'm_oops', 'q_alarm', 'b_wave', 'x_panic', 'k_diary', 'c_read', 'g_tag', 'd_party', 'b_proud', 'm_tag', 'x_thumb', 'k_scroll'];
// 竖版立绘只显示上半身：显示高度占整张图的比例（头顶到腰）
const SPRC = { d_panic: 0.55, d_curious: 0.55, d_happy: 0.55, d_sparkle: 0.6, d_ok: 0.66, d_raise: 0.72, d_think: 0.7, d_relief: 0.82, d_shock: 0.82, d_leader: 0.7, q_base: 0.6, q_point: 0.6, q_tea: 0.6, c_base: 0.58, c_ok: 0.58, c_cool: 0.58, m_base: 0.62, m_panic: 0.6, m_cheeky: 0.62, x_base: 0.6, x_angry: 0.6, x_force: 0.66, b_base: 0.62, b_sorry: 0.62, k_base: 0.6, k_read: 0.6, d_pill: 0.6, m_oops: 0.62, q_alarm: 0.6, b_wave: 0.62, x_panic: 0.62, k_diary: 0.6, c_read: 0.58, d_party: 0.68, b_proud: 0.6, m_tag: 0.62, x_thumb: 0.66, k_scroll: 0.62 };
const loadImg = n => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });


// ================= 台词（由 subtitles.json 生成，改台词请改 _gen_script.py）=================
const TEXT = {
  D01: "老师要看白饭页“能用的那一版”……可我提交了几十次，到底是哪一个啊？",
  G01_01: "编号记不住，就给重要的存档起个名字：打标签！再把它正式发布出去。",
  G01_02: "就像打 Boss 之前存的那个档，起个名字，想回去一眼就能找到。",
  G01_03: "欢迎来到 AI娘 Git 课，第五集，版本号与发布！",
  D02: "起名字？那要怎么起？",
  G02_01: "最简单的：git tag v1.0，当前这个提交就贴上了 v1.0 的标签。",
  G02_02: "以后不用记编号：git tag 列出所有标签，想看哪一版，就 git show v1.0。",
  G02_03: "标签和分支不一样：分支会跟着新提交往前走，标签贴上去就不动了，永远指着这一版。",
  C01: "这种标签只有一个名字。正式发布，要写清楚是谁、什么时候、为什么。",
  G02_04: "Claude 说得对：git tag -a v1.0 -m \"第一个正式版\"，这就是带说明的附注标签。",
  G02_05: "再 git show v1.0，打标签的人、时间和说明，全都写在上面。",
  G02_06: "忘了打也没关系：git tag -a v0.9 加上旧提交的编号，以前的存档也能补上标签。",
  C02: "有名字、有时间、有理由。批准。",
  M01: "我也打好标签啦：v2024！喵～",
  D03: "又是 2024……而且还打错了提交吧？",
  G03_01: "打错了就删掉：git tag -d 删本地的，git push origin --delete 删远程的，然后再打一次。",
  G03_02: "不过已经发给别人用的标签，别偷偷挪。出了问题，就发一个新版本。",
  M02: "这次打对了：v1.0，喵！",
  X01: "标签打好了，代码也 push 了。可 GitHub 上一个标签都没有，这是真的吗？",
  G04_01: "是真的：普通的 git push，不会带上标签。",
  G04_02: "要单独推：git push origin v1.0 推一个，git push --tags 一次推全部。",
  G04_03: "嫌麻烦的话，用 git push --follow-tags，提交和附注标签一起推上去。",
  X02: "推上去了。这下，是真的了。",
  Q01: "用户反馈：v1.0 的首页有个错别字，大家能回去看看吗？",
  G05_01: "有标签就好办：git switch --detach v1.0，直接回到那一版。上集说过，这就是 detached HEAD。",
  G05_02: "要在旧版上修：git switch -c 新分支名 v1.0，从这一版开一条新分支，修好提交。",
  G05_03: "修好以后，记得把这条分支合回主分支 main，不然下一个版本，错别字又回来了。",
  Q02: "修好啦！那新版本叫什么呢？",
  B01: "我宣布：这是 v2.0.0，大版本！家人们，冲！",
  D04: "只改了一个错别字，就 2.0 了？",
  G06_01: "版本号有规矩，叫语义化版本：主版本、次版本、修订号，三段数字。",
  G06_02: "修了 bug，改最后一位：v1.0.1。",
  G06_03: "加了新功能，旧的用法照样能用，改中间一位：v1.1.0，最后一位归零。",
  G06_04: "改动大到旧的用法不兼容了，才改第一位：v2.0.0。",
  G06_05: "还有，1.0 之前的 0.x 版本，表示还在开发，随时可能大改。",
  B02: "那……v1.0.1！先交了再说！",
  D05: "标签推上去了，怎么让大家下载呢？",
  G07_01: "去 GitHub 仓库的 Releases，点 Draft a new release。",
  G07_02: "选好标签 v1.0.1，再写上标题和更新说明。",
  K01: "更新说明我写好了……一共三千字。",
  G07_03: "Kimi，挑重点就好。也可以点 Generate release notes，自动整理这次的改动。",
  G07_04: "打包好的文件拖进来当附件；源码压缩包，GitHub 会自动附上。",
  G07_05: "还没准备好就勾上“预发布”，最后点绿色的发布按钮，发布！",
  G07_06: "发布以后，这一版会标上 Latest，大家点附件就能下载；每发一版，Releases 里就多一条记录。",
  K02: "……压缩好了。新增、修复、注意事项，三条。",
  D06: "步骤有点多，帮我整理一下！",
  G08_01: "打标签用 git tag -a，推标签用 git push --tags；打错了 git tag -d，删掉再打。",
  G08_02: "版本号三段：修 bug 改最后一位，加功能改中间，不兼容改第一位。",
  G08_03: "要发布，就去 Releases：选标签、写说明、加附件，Publish。",
  D07: "能带我从头到尾，发布一次吗？",
  G09_01: "没问题！给大肥鱼的白饭页，正式发布一次！",
  G09_02: "首页做完：git tag -a v1.0.0 -m \"第一个正式版\"，再 git push --tags。",
  G09_03: "修了错别字，提交后打 v1.0.1；又加了“今日推荐菜”，打 v1.1.0。",
  G09_04: "用户又发现一个 bug？修好以后打 v1.1.1，改最后一位就行。",
  G09_05: "最后到 Releases 选 v1.1.1，自动生成说明，拖进附件，Publish！",
  D08: "白饭页 v1.1.1，正式发布啦！",
  G10_01: "下集预告：把白饭页变成真正的网站！GitHub Pages，下集见分晓！",
  G10_02: "喜欢的话记得一键三连，我们下集见！",
};
const DUR = Object.assign({}, window.DUR || {});

// ================= 时间轴 =================
const V = (b, id, pose) => ({ k: 'v', b, id, pose });
const BEAT = (b, d) => ({ k: 'beat', b, d: b === 'teaser' ? d * 0.75 : d * 0.35 });
const CH_COL = ['#7c5cff', '#3ec1ff', '#22c08b', '#ffb020', '#ff5c8a', '#ff7a3d', '#a66bff', '#ffd23f'];
const PLAN = [
  V('cold', 'D01', 'd_curious'),
  V('why', 'G01_01', 'g_tag'), V('why', 'G01_02', 'g_explain'),
  V('title', 'G01_03', 'g_cheer'), BEAT('title', 1.4),
  V('tagQ', 'D02', 'd_think'),
  V('tag', 'G02_01', 'g_tag'), V('tag', 'G02_02', 'g_type'), V('tag', 'G02_03', 'g_explain'), V('tag', 'C01', 'c_cool'), V('tag', 'G02_04', 'g_point'), V('tag', 'G02_05', 'g_type'), V('tag', 'G02_06', 'g_wink'), V('tag', 'C02', 'c_ok'),
  V('fixQ', 'M01', 'm_tag'), V('fixQ', 'D03', 'd_think'),
  V('fix', 'G03_01', 'g_warn'), V('fix', 'G03_02', 'g_think'), V('fix', 'M02', 'm_cheeky'),
  V('pushQ', 'X01', 'x_angry'),
  V('push', 'G04_01', 'g_awkward'), V('push', 'G04_02', 'g_type'), V('push', 'G04_03', 'g_explain'), V('push', 'X02', 'x_thumb'),
  V('oldQ', 'Q01', 'q_alarm'),
  V('old', 'G05_01', 'g_point'), V('old', 'G05_02', 'g_type'), V('old', 'G05_03', 'g_warn'), V('old', 'Q02', 'q_point'),
  V('semQ', 'B01', 'b_proud'), V('semQ', 'D04', 'd_shock'),
  V('semver', 'G06_01', 'g_present'), V('semver', 'G06_02', 'g_point'), V('semver', 'G06_03', 'g_explain'), V('semver', 'G06_04', 'g_warn'), V('semver', 'G06_05', 'g_think'), V('semver', 'B02', 'b_sorry'),
  V('relQ', 'D05', 'd_curious'),
  V('release', 'G07_01', 'g_point'), V('release', 'G07_02', 'g_type'), V('release', 'K01', 'k_scroll'), V('release', 'G07_03', 'g_wink'), V('release', 'K02', 'k_read'), V('release', 'G07_04', 'g_explain'), V('release', 'G07_05', 'g_cheer'), V('release', 'G07_06', 'g_proud'),
  V('ask8', 'D06', 'd_raise'),
  V('recap', 'G08_01', 'g_present'), V('recap', 'G08_02', 'g_explain'), V('recap', 'G08_03', 'g_proud'),
  V('askP', 'D07', 'd_sparkle'),
  V('practice', 'G09_01', 'g_cheer'), V('practice', 'G09_02', 'g_type'), V('practice', 'G09_03', 'g_type'), V('practice', 'G09_04', 'g_point'), V('practice', 'G09_05', 'g_explain'), V('practice', 'D08', 'd_party'),
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
