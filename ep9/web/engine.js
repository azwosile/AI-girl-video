// AI娘 Git课 · 第9集 渲染引擎 —— renderAt(t) 纯函数，逐帧确定性导出（通用部分沿用第1集）
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const F_FANCY = '"Smiley", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const F_BODY = '"Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const F_CODE = 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", "Microsoft YaHei", "Noto Sans CJK SC", monospace';

// ================= 素材 =================
const SPR = {};
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'g_cheer', 'g_warn', 'g_think', 'g_shock', 'g_proud', 'g_type', 'g_peace', 'g_awkward', 'g_present', 'd_panic', 'd_curious', 'd_happy', 'd_raise', 'd_think', 'd_shock', 'd_sparkle', 'd_ok', 'd_relief', 'd_leader', 'q_base', 'q_point', 'q_tea', 'c_base', 'c_ok', 'c_cool', 'm_base', 'm_panic', 'm_cheeky', 'x_base', 'x_angry', 'x_force', 'b_base', 'b_sorry', 'k_base', 'k_read', 'g_pill', 'd_pill', 'm_oops', 'q_alarm', 'b_wave', 'x_panic', 'k_diary', 'c_read', 'g_tag', 'd_party', 'b_proud', 'm_tag', 'x_thumb', 'k_scroll', 'g_web', 'd_phone', 'm_photo', 'x_doubt', 'b_point', 'g_check', 'd_robot', 'm_clock', 'c_lock', 'b_badge', 'g_scissors', 'd_tangle', 'd_film', 'b_squash', 'g_detective', 'd_detective', 'b_cherry'];
// 竖版立绘只显示上半身：显示高度占整张图的比例（头顶到腰）
const SPRC = { d_panic: 0.55, d_curious: 0.55, d_happy: 0.55, d_sparkle: 0.6, d_ok: 0.66, d_raise: 0.72, d_think: 0.7, d_relief: 0.82, d_shock: 0.82, d_leader: 0.7, q_base: 0.6, q_point: 0.6, q_tea: 0.6, c_base: 0.58, c_ok: 0.58, c_cool: 0.58, m_base: 0.62, m_panic: 0.6, m_cheeky: 0.62, x_base: 0.6, x_angry: 0.6, x_force: 0.66, b_base: 0.62, b_sorry: 0.62, k_base: 0.6, k_read: 0.6, d_pill: 0.6, m_oops: 0.62, q_alarm: 0.6, b_wave: 0.62, x_panic: 0.62, k_diary: 0.6, c_read: 0.58, d_party: 0.68, b_proud: 0.6, m_tag: 0.62, x_thumb: 0.66, k_scroll: 0.62, d_phone: 0.66, m_photo: 0.6, x_doubt: 0.62, b_point: 0.62, d_robot: 0.66, m_clock: 0.62, c_lock: 0.6, b_badge: 0.62, d_tangle: 0.62, d_film: 0.64, b_squash: 0.7, d_detective: 0.64, b_cherry: 0.62 };
const loadImg = n => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });


// ================= 台词（由 subtitles.json 生成，改台词请改 _gen_script.py）=================
const TEXT = {
  Q01: "用户反馈：从周三开始，白饭页的“点菜”按钮就不见了！",
  D01: "啊？上周还好好的……一百多个提交，到底是哪次改坏的？",
  G01_01: "别慌，每个提交都留着线索。今天当一回侦探：先搜历史，再查每一行是谁改的，最后二分法抓出真凶。",
  G01_02: "就像破案：翻卷宗缩小范围，看指纹锁定嫌疑人，最后排查出那一个。",
  G01_03: "欢迎来到 AI娘 Git 课，第九集，Git 侦探！",
  K01: "我把一百多条提交说明全读完了，没有一条写着“删了按钮”。",
  D02: "说明靠不住，那还能怎么搜？",
  G02_01: "先缩小范围：git log 后面加两个横线和文件名，只列出动过这个文件的提交。",
  G02_02: "再按内容搜：git log -S \"order-btn\"，找出这段代码是在哪次提交里出现、又在哪次消失的。",
  G02_03: "还能用 --grep 搜说明里的字，--author 只看某个人，--since 只看最近几天，几个条件叠在一起用。",
  G02_04: "-S 找的是这段字“数量变了”的提交：加上、删掉都算，只是挪了位置不算。",
  G02_05: "不想敲命令？GitHub 打开这个文件，点右上角的 History，就是它的全部提交记录。",
  K02: "按内容一搜，只剩三个嫌疑提交了。",
  M01: "喵？首页按钮附近那一段，是谁改的？不会……又是我吧？",
  D03: "能看出每一行是谁改的吗？",
  G03_01: "用 git blame index.html：每一行前面都标着最后改它的提交编号、作者和时间。",
  G03_02: "文件太长就加 -L 40,50 只看这几行；GitHub 的文件页面点 Blame 按钮，也是一样的效果。",
  G03_03: "注意：blame 只说明谁最后动过这一行，不等于谁的锅。拿到编号，用 git show 看那次提交到底改了什么。",
  G03_04: "GitHub 的 Blame 页面，每段旁边有个小图标，点一下就跳到这次改动之前的版本，一层一层往前查。",
  G03_05: "只改了空格缩进的提交也会被算上；加 -w 忽略空白改动，blame 会跳过它，指向真正改内容的那次。",
  M02: "看完了：我只是改了缩进！清白了喵！",
  X01: "嫌疑人还是太多？那就二分，一刀砍一半。",
  D04: "一百个提交，那得试多少次？",
  G04_01: "用 git bisect：先 start 开始，标记现在是 bad，再告诉它上周的 v1.2 是 good。",
  G04_02: "Git 会跳到正中间那个提交。你打开网页看一眼：正常就输 good，坏了就输 bad，范围每次砍掉一半。",
  G04_03: "一百砍一半是五十，再砍是二十五……最多七次，它就会报出 first bad commit：第一个坏提交。",
  G04_04: "跳到的提交本身跑不起来、没法判断？输 git bisect skip，跳过它换一个。",
  G04_05: "查完记得 git bisect reset 回到原来的分支；能写测试脚本的话，git bisect run 还能自动跑完。",
  X02: "七次就抓到。干脆。",
  D05: "抓到了！那我 reset 把那个提交删掉？",
  C01: "慢着。main 已经推送、大家都在用，改写历史，审查不通过。",
  G05_01: "用 git revert 加编号：它新建一个反向提交，把那次的改动撤销掉，原来的历史一点不动。",
  G05_02: "reset 是把历史倒回去，revert 是往前加一步“撤销”。推送过的提交，用 revert。",
  G05_03: "revert 会自动写好说明：“Revert”加上原来的标题，保存就行。以后想恢复，再 revert 这个撤销提交。",
  C02: "留下记录的撤销，批准。",
  B01: "家人们！甜点分支上有个修错字的提交，我想先单独拿到 main 上，别的还没做完！",
  D06: "能只拿一个吗？",
  G06_01: "用 git cherry-pick 加编号：把那一个提交复制一份，接到当前分支后面。",
  G06_02: "只拿你点名的那个，其他的不动；复制出来是新编号，冲突了一样 add 再 --continue。",
  G06_03: "加上 -x，新提交的说明里会自动记下“从哪个提交摘来的”，以后追查一眼就知道。",
  B02: "只摘这一颗樱桃！家人们，太精准了！",
  D07: "侦探课线索好多……帮我划个重点！",
  G07_01: "搜：git log 加文件名缩小范围，-S 按代码内容搜，--author 和 --since 筛人筛时间。",
  G07_02: "查：blame 看每一行谁改的，show 看完整改动；不知道是哪次，就 bisect 二分。",
  G07_03: "修：推送过的用 revert 留痕撤销；只要一个提交，就 cherry-pick。",
  D08: "我现在就去把按钮的真凶抓出来！",
  G08_01: "先 git log -S \"order-btn\" -- index.html：动过按钮代码的只有三个提交。",
  G08_02: "git bisect start，现在 bad，v1.2 good；看了三次网页，它指出了 e5f6a7。",
  G08_03: "git show e5f6a7：“调整首页布局”时把按钮那一段误删了。先 bisect reset 收工。",
  G08_04: "git revert e5f6a7，推送，PR 检查绿勾，按钮回来了。",
  G08_05: "最后在 PR 里写清楚：哪次提交、为什么坏、怎么修，下次谁看都明白。",
  D09: "案子破了！白饭页又能点菜了！",
  G09_01: "下集预告：想给喜欢的开源项目出一份力？fork、同步上游、认领 issue、提第一个 PR，带你走一遍！",
  G09_02: "喜欢的话记得一键三连，我们下集见！",
};
const DUR = Object.assign({}, window.DUR || {});

// ================= 时间轴 =================
const V = (b, id, pose) => ({ k: 'v', b, id, pose });
const BEAT = (b, d) => ({ k: 'beat', b, d: b === 'teaser' ? d * 0.75 : d * 0.35 });
const CH_COL = ['#7c5cff', '#3ec1ff', '#22c08b', '#ffb020', '#ff5c8a', '#ff7a3d', '#a66bff', '#ffd23f'];
const PLAN = [
  V('cold', 'Q01', 'q_alarm'), V('cold', 'D01', 'd_panic'),
  V('why', 'G01_01', 'g_detective'), V('why', 'G01_02', 'g_explain'),
  V('title', 'G01_03', 'g_cheer'), BEAT('title', 1.4),
  V('searchQ', 'K01', 'k_scroll'), V('searchQ', 'D02', 'd_think'),
  V('search', 'G02_01', 'g_type'), V('search', 'G02_02', 'g_detective'), V('search', 'G02_03', 'g_explain'), V('search', 'G02_04', 'g_warn'), V('search', 'G02_05', 'g_point'), V('search', 'K02', 'k_read'),
  V('blameQ', 'M01', 'm_oops'), V('blameQ', 'D03', 'd_curious'),
  V('blame', 'G03_01', 'g_point'), V('blame', 'G03_02', 'g_type'), V('blame', 'G03_03', 'g_warn'), V('blame', 'G03_04', 'g_present'), V('blame', 'G03_05', 'g_think'), V('blame', 'M02', 'm_cheeky'),
  V('bisectQ', 'X01', 'x_force'), V('bisectQ', 'D04', 'd_shock'),
  V('bisect', 'G04_01', 'g_type'), V('bisect', 'G04_02', 'g_explain'), V('bisect', 'G04_03', 'g_detective'), V('bisect', 'G04_04', 'g_awkward'), V('bisect', 'G04_05', 'g_warn'), V('bisect', 'X02', 'x_thumb'),
  V('revertQ', 'D05', 'd_detective'), V('revertQ', 'C01', 'c_read'),
  V('revert', 'G05_01', 'g_explain'), V('revert', 'G05_02', 'g_think'), V('revert', 'G05_03', 'g_point'), V('revert', 'C02', 'c_ok'),
  V('cherryQ', 'B01', 'b_cherry'), V('cherryQ', 'D06', 'd_raise'),
  V('cherry', 'G06_01', 'g_type'), V('cherry', 'G06_02', 'g_explain'), V('cherry', 'G06_03', 'g_tag'), V('cherry', 'B02', 'b_proud'),
  V('ask9', 'D07', 'd_happy'),
  V('recap', 'G07_01', 'g_present'), V('recap', 'G07_02', 'g_detective'), V('recap', 'G07_03', 'g_proud'),
  V('askP', 'D08', 'd_detective'),
  V('practice', 'G08_01', 'g_cheer'), V('practice', 'G08_02', 'g_type'), V('practice', 'G08_03', 'g_think'), V('practice', 'G08_04', 'g_check'), V('practice', 'G08_05', 'g_proud'), V('practice', 'D09', 'd_party'),
  V('teaser', 'G09_01', 'g_explain'), V('teaser', 'G09_02', 'g_cheer'), BEAT('teaser', 8),
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
// ================= 第9集：Git 侦探 =================
Object.assign(SQ.Q, { role: '用户反馈' }); Object.assign(SQ.K, { role: '读完卷宗' }); Object.assign(SQ.M, { role: '嫌疑人？' });
Object.assign(SQ.X, { role: '一刀砍一半' }); Object.assign(SQ.C, { role: '审查' }); Object.assign(SQ.B, { role: '摘樱桃' });
const ACC = '#5f3dc4', CLUE = '#ffd23f', MAINC = '#3ec1ff', FEATC = '#ff7a3d', NEWC = '#ffd23f', KNOTC = '#ff4d6d', OKC = '#1f883d', BADC = '#cf222e', RUNC = '#d4a72c', LIVEC = '#1a7f37', GOODC = '#2fbf71', CHERRY = '#e03131';
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
// 提交列表：rows = [{h, m, a, d, t, st}]；st: 0 普通 1 嫌疑(黄) 2 真凶(红) 3 无关(变淡) 4 清白(绿)；可以传函数 st(t)
function logRows(t, x, y, w, rows, o = {}) {
  const rh = o.rh || 70, fs = o.fs || 28;
  rows.forEach((r, i) => {
    const a = clamp(prog(t, r.t ?? -1, 0.2)); if (a <= 0) return; const st = typeof r.st === 'function' ? r.st(t) : (r.st || 0);
    const row = r.row != null ? (typeof r.row === 'function' ? r.row(t) : r.row) : i; const ry = y + row * rh;
    ctx.save(); ctx.globalAlpha *= a * (st === 3 ? 0.28 : 1);
    const bc = st === 1 ? CLUE : st === 2 ? KNOTC : st === 4 ? GOODC : '#d0d7de', bg = st === 1 ? '#fffbe6' : st === 2 ? '#fff0f2' : st === 4 ? '#effcf3' : '#fff';
    if (st === 1 || st === 2) { ctx.shadowColor = bc; ctx.shadowBlur = 24; }
    box(x, ry, w, rh - 10, 12, bg, bc, st === 1 || st === 2 || st === 4 ? 5 : 2); ctx.shadowBlur = 0;
    gDot(x + 34, ry + (rh - 10) / 2, 1, st === 2 ? KNOTC : st === 1 ? '#e8a400' : MAINC, { r: 12 });
    txt(r.h, x + 64, ry + (rh - 10) / 2, fs * 0.9, '#9a6700', { font: F_CODE });
    txt(r.m, x + 64 + fs * 4.2, ry + (rh - 10) / 2, fs, '#24292f', { font: isCJK(r.m) ? F_BODY : F_CODE, max: w - fs * 4.2 - 260 });
    if (r.a) txt(r.a + (r.d ? ' · ' + r.d : ''), x + w - 22, ry + (rh - 10) / 2, fs * 0.72, '#57606a', { align: 'right', bold: false });
    if (r.tag) { const tg = typeof r.tag === 'function' ? r.tag(t) : r.tag; if (tg) pill(x + w + 10 + tg[0].length * 12, ry + (rh - 10) / 2, tg[0], tg[1], popIn(t, tg[2] ?? -1), { fs: 24, font: isCJK(tg[0]) ? F_BODY : F_CODE }); }
    ctx.restore();
  });
}
// blame 视图：rows = [{h, a, d, code, t, st, ln}]
function blameView(t, x, y, w, rows, o = {}) {
  const rh = o.rh || 58, fs = o.fs || 24, a0 = o.alpha ?? 1; if (a0 <= 0) return; ctx.save(); ctx.globalAlpha *= a0;
  const h = 76 + rows.length * rh + 16; win(x, y, w, h, o.title || 'git blame index.html', o.accent || ACC, { bg: '#1b1730' });
  rows.forEach((r, i) => { const a = clamp(prog(t, r.t ?? -1, 0.2)); if (a <= 0) return; const st = typeof r.st === 'function' ? r.st(t) : (r.st || 0); const ry = y + 76 + i * rh + rh / 2;
    ctx.save(); ctx.globalAlpha *= a * (st === 3 ? 0.3 : 1);
    if (st === 1 || st === 2 || st === 4) box(x + 14, ry - rh / 2 + 3, w - 28, rh - 6, 8, hexA(st === 2 ? KNOTC : st === 4 ? GOODC : CLUE, 0.22 + 0.06 * Math.sin(t * 8)), st === 2 ? KNOTC : st === 4 ? GOODC : CLUE, 3);
    txt(r.h, x + 30, ry, fs, '#ffd36b', { font: F_CODE }); txt(r.a, x + 30 + fs * 4.3, ry, fs, AUTHC[r.a] || '#c9a6ff', { max: fs * 4 });
    txt(r.d, x + 30 + fs * 8.6, ry, fs * 0.85, '#8f8aa8', { font: F_CODE, bold: false });
    box(x + fs * 13.2, ry - rh / 2 + 6, 2, rh - 12, 0, '#3d3760');
    txt(String(r.ln), x + fs * 14.6, ry, fs * 0.85, '#6e6890', { align: 'right', font: F_CODE, bold: false });
    txt(r.code, x + fs * 15.2, ry, fs, '#ece9f7', { font: F_CODE, max: w - fs * 15.2 - 30 });
    ctx.restore(); });
  ctx.restore();
}
const AUTHC = { '大肥鱼': '#8fc3ff', 'Gemini': '#d4a6ff', '千问': '#9fb0ff', 'Kimi': '#b9c2ff', 'Claude': '#ffb98a' };
// 二分进度条：n 个提交；state(t) 返回 {lo, hi, mid, found, skip:[...]}
function bisectBar(t, x, y, w, n, S0, o = {}) {
  const tw = w / n; const st = S0;
  for (let i = 0; i < n; i++) { const cx = x + (i + 0.5) * tw; let col = '#5a5580';
    if (i <= st.lo) col = GOODC; else if (i >= st.hi) col = KNOTC; else col = '#bdb6e6';
    if ((st.skip || []).includes(i)) col = '#777';
    const hh = (o.h || 60) * (i === st.mid || i === st.found ? 1.35 : 1); box(cx - tw * 0.36, y - hh / 2, tw * 0.72, hh, Math.min(4, tw * 0.3), col); }
  if (st.mid != null && st.found == null) { const cx = x + (st.mid + 0.5) * tw; ctx.save(); ctx.translate(cx, y - (o.h || 60) * 0.95); ctx.fillStyle = CLUE; ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(-16, -8); ctx.lineTo(16, -8); ctx.fill(); ctx.restore(); }
  if (st.found != null) { const cx = x + (st.found + 0.5) * tw; ctx.save(); ctx.strokeStyle = KNOTC; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, y, (o.h || 60) * 0.9, 0, 7); ctx.stroke(); ctx.restore(); }
  if (o.labels !== false) { txt(o.left || 'v1.2 ✓ good', x, y + (o.h || 60) * 0.5 + 34, 24, GOODC, { font: F_CODE }); txt(o.right || 'bad ✗ HEAD', x + w, y + (o.h || 60) * 0.5 + 34, 24, KNOTC, { align: 'right', font: F_CODE }); }
}
// 二分步骤：steps = [[时间, lo, hi, mid]]，最后一步 [时间, lo, hi, null, found]
function bisectState(t, steps) { let s = steps[0]; steps.forEach(k => { if (t >= k[0]) s = k; }); return { lo: s[1], hi: s[2], mid: s[3], found: s[4], skip: s[5] }; }
// 白饭页小网页：btn 0 不见（虚线问号）/1 正常；s 缩放
function baifanPage(t, cx, cy, s, btn, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  box(-260, -190, 520, 380, 22, '#fffaf0', o.col || '#1b1433', 6); box(-260, -190, 520, 64, [22, 22, 0, 0], '#ffb347'); txt('🍚 白饭页', -230, -157, 30, '#fff', {});
  ['🍚 白米饭 ¥2', '🥚 卤蛋 ¥3', '🍮 布丁 ¥6'].forEach((m, i) => txt(m, -220, -88 + i * 50, 28, '#3b2a14', { font: EMOJI + ',' + F_BODY }));
  if (btn) { box(-120, 80, 240, 74, 37, '#ff7a3d', '#1b1433', 5); txt('点菜', 0, 118, 34, '#fff', { align: 'center' }); }
  else { ctx.save(); ctx.setLineDash([12, 10]); box(-120, 80, 240, 74, 37, null, '#cf222e', 5); ctx.restore(); txt('？', 0, 118, 44, BADC, { align: 'center' }); }
  ctx.restore();
}

// ---- 冷开场：点菜按钮不见了 ----
SC.cold = (t, blk) => {
  const t0 = blk.t0, d1 = S('D01'); let [sx, sy] = shake(t, P('D01', 0.3), 10, 0.35); ctx.translate(sx, sy);
  bgBurst(t, '#2b1d6b', '#5f3dc4', W * 0.62, H * 0.5, 22, 0.35);
  const wa = eBack(prog(t, t0 + 0.05, 0.4));
  // 用户反馈卡 + 网页
  const fadeQ = 1 - prog(t, d1 - 0.15, 0.3);
  if (fadeQ > 0) baifanPage(t, 1390, 430, wa * 1.15 * (0.6 + 0.4 * fadeQ), t < P('Q01', 0.55) ? 1 : 0);
  if (t >= P('Q01', 0.55) && t < d1) { flash(t, P('Q01', 0.55), 0.15, '255,80,120'); stamp(t, P('Q01', 0.6), 1600, 700, '按钮没了！', BADC, 60, -0.1); }
  if (t >= P('Q01', 0.2) && fadeQ > 0) pill(1390, 120, '📮 用户反馈 · 周三起', '#9fb0ff', popIn(t, P('Q01', 0.2)) * fadeQ, { fs: 38, font: F_BODY });
  // 大肥鱼：一百多个提交哗啦啦
  if (t >= d1 - 0.1) { const a = eOut(prog(t, d1 - 0.1, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(15,12,31,0.75)'; rr(940, 60, 900, 900, 30); ctx.fill();
    const msgs = ['改改', '更新', 'fix', '调整首页布局', '再改', 'wip', '加饮料菜单', '修错字', '改颜色', 'update', '调整配色', '真的好了'];
    for (let i = 0; i < 14; i++) { const k = (i + Math.floor((t - d1) * 9)) % msgs.length; const yy = 120 + ((i * 64 + (t - d1) * 380) % 840);
      ctx.save(); ctx.globalAlpha *= 0.85; box(980, yy - 26, 820, 52, 10, '#fff', '#d0d7de', 2); gDot(1010, yy, 1, MAINC, { r: 10 }); txt(msgs[k], 1040, yy, 26, '#24292f', { font: isCJK(msgs[k]) ? F_BODY : F_CODE }); ctx.restore(); }
    fancy('×100+', 1390, 500, 150, t, P('D01', 0.35), FX.red);
    ctx.restore(); }
  const qa = t < d1 ? 1 : 1 - prog(t, d1 - 0.2, 0.3);
  if (qa > 0) { const p = spring(prog(t, t0, 0.9)); ctx.save(); ctx.globalAlpha *= qa; sprite('q_alarm', 470, H + 40, 960, { scale: lerp(1.2, 1, p) }); ctx.restore(); pill(470, 150, '千问 · 用户反馈', SQ.Q.col, popIn(t, t0 + 0.15) * qa, { font: F_FANCY, fs: 44, fg: '#fff' }); }
  if (t >= d1 - 0.2) { const p = spring(prog(t, d1 - 0.2, 0.9)); sprite('d_panic', 470, H + 40, 990, { scale: lerp(1.3, 1, p) }); fancy('哪次改坏的？！', 470, 150, 84, t, d1 + 0.1, { rot: -0.08, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' }); }
};
SFX_FNS.push(() => { const b = BK.cold; sfx(b.t0 + 0.05, 'swoosh_in', 0.5); sfx(P('Q01', 0.2), 'pop', 0.4); sfx(P('Q01', 0.55), 'impact', 0.5); sfx(P('Q01', 0.6), 'stamp', 0.6);
  sfx(S('D01') - 0.2, 'swoosh_in', 0.5); sfx(P('D01', 0.3), 'boing', 0.4); sfx(P('D01', 0.35), 'impact', 0.6); });

// ---- 引入：搜 → 查 → 抓；破案比喻 ----
SC.why = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const sw = S('G01_02') - 0.2, a1 = 1 - eIO(prog(t, sw, 0.35));
  if (a1 > 0) { ctx.save(); ctx.globalAlpha *= a1;
    pill(1280, 140, '🕵️ Git 侦探 · 三步破案', CLUE, popIn(t, blk.t0 + 0.1), { fs: 42, font: F_BODY });
    [['🔍', '搜历史', 'git log', P('G01_01', 0.4)], ['🖐️', '查每一行', 'git blame', P('G01_01', 0.58)], ['✂️', '二分抓真凶', 'git bisect', P('G01_01', 0.76)]].forEach((c, i) => { const s = popIn(t, c[3], 0.4); if (s <= 0) return;
      const x = 900 + i * 380; ctx.save(); ctx.translate(x, 430); ctx.scale(s, s); ctx.rotate((i - 1) * 0.04);
      box(-160, -170, 320, 340, 26, '#fffaf0', ACC, 7); txt(c[0], 0, -70, 90, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 0, 40, 40, '#1b1433', { align: 'center' }); txt(c[2], 0, 110, 28, ACC, { align: 'center', font: F_CODE }); ctx.restore();
      if (i < 2 && t >= c[3] + 0.2) txt('→', x + 190, 430, 60, '#fff', { align: 'center' }); });
    if (t >= P('G01_01', 0.15) && t < P('G01_01', 0.4)) fancy('每个提交都是线索', 1280, 430, 70, t, P('G01_01', 0.15), FX.yel);
    ctx.restore(); }
  if (t >= sw) { const a = eOut(prog(t, sw, 0.35)); ctx.save(); ctx.globalAlpha *= a;
    pill(1280, 140, '🔎 就像破案', CLUE, popIn(t, sw + 0.1), { fs: 42, font: F_BODY });
    const k1 = P('G01_02', 0.1), k2 = P('G01_02', 0.4), k3 = P('G01_02', 0.7);
    // 卷宗
    const s1 = popIn(t, k1, 0.4); if (s1 > 0) { ctx.save(); ctx.translate(900, 420); ctx.scale(s1, s1); ctx.rotate(-0.06); box(-150, -110, 300, 220, 14, '#e8c98a', '#7a4b1f', 6); box(-150, -140, 130, 40, [14, 14, 0, 0], '#e8c98a', '#7a4b1f', 6); txt('卷宗', 0, -20, 46, '#5a3510', { align: 'center' }); txt('100 → 3', 0, 50, 34, BADC, { align: 'center', font: F_CODE }); ctx.restore(); txt('缩小范围', 900, 600, 34, '#fff', { align: 'center' }); }
    const s2 = popIn(t, k2, 0.4); if (s2 > 0) { ctx.save(); ctx.translate(1280, 420); ctx.scale(s2, s2); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.strokeStyle = '#3b2a6b'; ctx.lineWidth = 6;
      for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(0, 10, 20 + k * 15, 28 + k * 16, 0, 3.6, 6.0 + (k % 2) * 0.3); ctx.stroke(); } ctx.restore(); magnifier(1320, 400, 70 * s2, { rot: 0 }); txt('看指纹', 1280, 600, 34, '#fff', { align: 'center' }); }
    const s3 = popIn(t, k3, 0.4); if (s3 > 0) { ['🙂', '😐', '😈', '🙂'].forEach((f, i) => { const x = 1560 + i * 90, hot = i === 2; ctx.save(); ctx.translate(x, 430); ctx.scale(s3 * (hot ? 1.2 : 1), s3 * (hot ? 1.2 : 1)); box(-38, -90, 76, 180, 14, hot ? '#ffe0e4' : '#ece9f7', hot ? KNOTC : '#8f8aa8', 4); txt(f, 0, -30, 50, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore(); });
      txt('排查出那一个', 1695, 600, 34, '#fff', { align: 'center' }); if (t >= k3 + 0.4) stamp(t, k3 + 0.4, 1740, 330, '真凶！', BADC, 46, -0.1); }
    ctx.restore(); }
};
SFX_FNS.push(() => { const b = BK.why; sfx(b.t0 + 0.1, 'pop', 0.4); sfx(P('G01_01', 0.15), 'ding', 0.3); [0.4, 0.58, 0.76].forEach(f => sfx(P('G01_01', f), 'pop', 0.4));
  sfx(S('G01_02') - 0.2, 'swoosh_in', 0.4); [0.1, 0.4, 0.7].forEach(f => sfx(P('G01_02', f), 'pop', 0.4)); sfx(P('G01_02', 0.7) + 0.4, 'stamp', 0.5); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#241552', '#5f3dc4', W * 0.6, H * 0.45, 28, 0.2);
  ['🔍', '🕵️', '🧩', '🗂️', '✨'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  sprite('g_detective', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 60, 1040);
  sprite('d_detective', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 800);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-400, -10, 95, '#ff5c8a', '第9集', { fs: 52, rot: -0.15, fg: '#fff' });
    fancy('Git', 40, -70, 130, t, -99, FX.white);
    fancy('侦探！', 110, 80, 150, t, -99, FX.yel);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况（左侧插图，画在 80..960）----
function probSearchQ(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.1, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 460); ctx.scale(s, s); ctx.rotate(-0.02);
  box(-390, -300, 780, 600, 22, '#fff7e6', '#7a4b1f', 8); txt('📜 提交说明 × 100+', -350, -255, 34, '#7a4b1f', {});
  ctx.save(); rr(-370, -215, 740, 490, 12); ctx.clip();
  const msgs = ['改改', '更新', 'fix', '再改', 'wip', '调整首页布局', 'update', '改颜色', '修错字', '真的好了', '加饮料菜单', '调整配色'];
  const off = Math.max(0, t - t0 - 0.3) * 160;
  msgs.forEach((m, i) => { const yy = -180 + ((i * 58 - off) % (msgs.length * 58) + msgs.length * 58) % (msgs.length * 58); txt('• ' + m, -340, yy, 30, '#3b2a14', { font: isCJK(m) ? F_BODY : F_CODE }); txt('✓ 读过', 330, yy, 22, '#2f9e44', { align: 'right' }); });
  ctx.restore(); ctx.restore();
  if (t >= P('K01', 0.55)) { box(150, 790, 740, 90, 45, '#fff', '#1b1433', 5); txt('🔍 “删了按钮”', 190, 835, 34, '#1b1433', {}); txt('0 条结果', 860, 835, 30, BADC, { align: 'right' }); }
  if (U.D02 && t >= U.D02.vo + 0.3) stamp(t, U.D02.vo + 0.3, 520, 700, '说明靠不住！', BADC, 56, -0.08);
}
function probBlameQ(t, blk) {
  const t0 = blk.t0; const a = popIn(t, t0 + 0.1, 0.4); if (a <= 0) return;
  ctx.save(); ctx.translate(520, 460); ctx.scale(a, a); ctx.translate(-520, -460);
  win(110, 190, 820, 520, '📝 index.html', ACC, { bg: '#1b1730' });
  ['<nav class="top">', '  <a href="#menu">菜单</a>', '  <a href="#about">关于</a>', '</nav>', '<section id="menu">', '  <h2>今日菜单</h2>'].forEach((l, i) => { const p = clamp(prog(t, t0 + 0.2 + i * 0.06, 0.2)); ctx.save(); ctx.globalAlpha *= p;
    const hot = i >= 4 && t >= P('M01', 0.3); if (hot) box(130, 270 + i * 66, 780, 58, 8, hexA(CLUE, 0.22), CLUE, 3);
    txt(String(40 + i), 170, 300 + i * 66, 22, '#6e6890', { align: 'right', font: F_CODE, bold: false }); txt(l, 190, 300 + i * 66, 26, '#ece9f7', { font: F_CODE }); if (hot) txt('❓', 880, 300 + i * 66, 30, '#000', { align: 'right', font: EMOJI, bold: false }); ctx.restore(); });
  ctx.restore();
  if (t >= P('M01', 0.6)) note(520, 790, popIn(t, P('M01', 0.6)), '谁改的？', CLUE, { fs: 40, rot: -0.04 });
  if (U.D03 && t >= U.D03.vo + 0.3) magnifier(560, 560, 70 * popIn(t, U.D03.vo + 0.3), { rot: -0.3 });
}
function probBisectQ(t, blk) {
  const t0 = blk.t0; box(110, 220, 820, 480, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
  txt('100 个提交', 520, 290, 40, '#fff', { align: 'center' });
  const a = clamp(prog(t, t0 + 0.15, 0.4)); ctx.save(); ctx.globalAlpha *= a; bisectBar(t, 160, 450, 720, 50, { lo: 0, hi: 49, mid: null }, { h: 70 }); ctx.restore();
  const cut = P('X01', 0.6); if (t >= cut) { const p = eOut(prog(t, cut, 0.25)); ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.shadowColor = '#ff4d6d'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.moveTo(520, 340); ctx.lineTo(520, 340 + 230 * p); ctx.stroke(); ctx.restore();
    txt('🔪', 520, 330, 70, '#000', { align: 'center', font: EMOJI, bold: false }); txt('50', 330, 600, 36, '#ff9aa9', { align: 'center', font: F_CODE }); txt('50', 710, 600, 36, '#ff9aa9', { align: 'center', font: F_CODE }); }
  if (U.D04 && t >= U.D04.vo + 0.3) stamp(t, U.D04.vo + 0.3, 520, 810, '要试多少次？', '#a855f7', 56, -0.08);
}
function probRevertQ(t, blk) {
  const t0 = blk.t0; box(110, 220, 820, 480, 26, 'rgba(15,12,31,0.9)', '#fff', 5); txt('main（已推送）', 150, 280, 28, MAINC, {});
  const xs = [190, 320, 450, 580, 710, 840]; const labs = ['A', 'B', 'e5f6', '千问', 'Kimi', 'HEAD'];
  const back = U.D05 ? P('D05', 0.55) : 1e9; const N = {}, E = [];
  xs.forEach((x, i) => { const gone = i > 2 && t >= back; N['n' + i] = { x, y: 430, col: i === 2 ? KNOTC : MAINC, t0: t0 + 0.1 + i * 0.06, lab: labs[i], fs: 22, ghost: gone, glow: i === 2 }; if (i) E.push(['n' + (i - 1), 'n' + i, t0 + 0.1 + i * 0.06]); });
  drawGraph(t, N, E, { r: 24 });
  if (t >= back) { const p = eIO(prog(t, back, 0.5)); ctx.save(); ctx.strokeStyle = '#ff6b81'; ctx.lineWidth = 8; ctx.setLineDash([16, 10]); ctx.beginPath(); ctx.moveTo(840, 520); ctx.lineTo(lerp(840, 330, p), 520); ctx.stroke(); ctx.restore(); txt('reset --hard', 600, 570, 30, '#ff9aa9', { align: 'center', font: F_CODE });
    if (t >= back + 0.4) [['Q', 580], ['K', 710]].forEach(q => { avatar(q[0], q[1], 330, 36, { s: popIn(t, back + 0.4) }); txt('💦', q[1] + 30, 290, 36, '#000', { font: EMOJI, bold: false }); }); }
  if (t >= P('C01', 0.55)) stamp(t, P('C01', 0.55), 520, 790, '审查不通过 ✗', BADC, 60, -0.08);
}
function probCherryQ(t, blk) {
  const t0 = blk.t0; box(110, 220, 820, 480, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
  const N = { a: { x: 190, y: 330, col: MAINC, t0: t0 + 0.1 }, b: { x: 330, y: 330, col: MAINC, t0: t0 + 0.14 }, c: { x: 470, y: 330, col: MAINC, t0: t0 + 0.18 } }; const E = [['a', 'b', t0 + 0.14], ['b', 'c', t0 + 0.18]];
  ['甜点', '修错字', '做一半', '做一半'].forEach((l, i) => { N['f' + i] = { x: 400 + i * 130, y: 560, col: i === 1 ? CHERRY : FEATC, t0: t0 + 0.3 + i * 0.08, lab: l, fs: 22, glow: i === 1 && t >= P('B01', 0.3), r: i === 1 ? 28 : 22 }; E.push([i ? 'f' + (i - 1) : 'b', 'f' + i, t0 + 0.3 + i * 0.08]); });
  drawGraph(t, N, E, { r: 22 }); txt('main', 150, 280, 28, MAINC, { font: F_CODE }); txt('dessert 分支', 560, 650, 26, FEATC, {});
  if (t >= P('B01', 0.3)) txt('🍒', 530, 480, 60 * popIn(t, P('B01', 0.3)), '#000', { align: 'center', font: EMOJI, bold: false });
  if (U.D06 && t >= U.D06.vo + 0.2) stamp(t, U.D06.vo + 0.2, 520, 800, '只要这一个！', CHERRY, 58, -0.08);
}
function probAsk9(t, blk) {
  const t0 = blk.t0;
  [['🔍 搜', MAINC], ['🕵️ 查', ACC], ['🩹 修', OKC]].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s > 0) { ctx.save(); ctx.translate(250 + i * 270, 480); ctx.scale(s, s); ctx.rotate((i - 1) * 0.06); box(-110, -140, 220, 280, 24, '#fff', c[1], 8); txt(c[0], 0, 0, 52, '#1b1433', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false }); ctx.restore(); } });
  if (t >= t0 + 0.6) txt('三个重点', 520, 760, 64, ACC, { align: 'center', font: F_FANCY, bold: false });
}
function probAskP(t, blk) {
  const t0 = blk.t0; baifanPage(t, 520, 430, popIn(t, t0 + 0.1, 0.4) * 1.3, 0);
  if (t >= t0 + 0.5) magnifier(700, 560, 90 * popIn(t, t0 + 0.5), { rot: -0.2 });
  if (t >= P('D08', 0.5)) stamp(t, P('D08', 0.5), 520, 840, '抓真凶！', BADC, 64, -0.08);
}
const PROB = {
  searchQ: { chap: ['第①步', '搜历史', MAINC, F_BODY], q: '还能怎么搜？', bg: ['#e3ecff', '#c4d6ff'], draw: probSearchQ },
  blameQ: { chap: ['第②步', '查每一行', ACC, F_BODY], q: '谁改的？', bg: ['#ece3ff', '#d6c4ff'], draw: probBlameQ },
  bisectQ: { chap: ['第③步', '二分抓真凶', '#d6283e', F_BODY], q: '试多少次？', bg: ['#ffe3e6', '#ffc4cc'], draw: probBisectQ },
  revertQ: { chap: ['第④步', '安全地修', '#e07a3d', F_BODY], q: '删掉它？', bg: ['#fff0e0', '#ffd9b3'], draw: probRevertQ },
  cherryQ: { chap: ['第⑤步', '只拿一个提交', CHERRY, F_BODY], q: '能只拿一个？', bg: ['#ffe3e3', '#ffc9c9'], draw: probCherryQ },
  ask9: { chap: ['复习', '搜 · 查 · 修', ACC, F_BODY], q: '帮我划重点！', bg: ['#ece3ff', '#d6c4ff'], draw: probAsk9 },
  askP: { chap: ['实战', '抓出按钮真凶', BADC, F_BODY], q: '现在就抓！', bg: ['#ece3ff', '#d6c4ff'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  sfx(BK.searchQ.t0 + 0.1, 'pop', 0.4); sfx(P('K01', 0.55), 'buzz', 0.4); sfx(U.D02.vo + 0.3, 'stamp', 0.6);
  for (let i = 0; i < 6; i++) sfx(BK.blameQ.t0 + 0.2 + i * 0.06, 'pop', 0.2); sfx(P('M01', 0.3), 'ding', 0.3); sfx(P('M01', 0.6), 'pop', 0.4); sfx(U.D03.vo + 0.3, 'pop', 0.4);
  sfx(BK.bisectQ.t0 + 0.15, 'whoosh', 0.3); sfx(P('X01', 0.6), 'impact', 0.6); sfx(U.D04.vo + 0.3, 'stamp', 0.6);
  for (let i = 0; i < 6; i++) sfx(BK.revertQ.t0 + 0.1 + i * 0.06, 'pop', 0.2); sfx(P('D05', 0.55), 'whoosh', 0.5); sfx(P('D05', 0.55) + 0.4, 'boing', 0.3); sfx(P('C01', 0.55), 'stamp', 0.6);
  for (let i = 0; i < 4; i++) sfx(BK.cherryQ.t0 + 0.3 + i * 0.08, 'pop', 0.2); sfx(P('B01', 0.3), 'sparkle', 0.4); sfx(U.D06.vo + 0.2, 'stamp', 0.6);
  [0, 1, 2].forEach(i => sfx(BK.ask9.t0 + 0.15 + i * 0.12, 'pop', 0.3)); sfx(BK.askP.t0 + 0.1, 'pop', 0.4); sfx(P('D08', 0.5), 'stamp', 0.6);
});

// ---- 讲解①：搜历史（Kimi）----
const LOG9 = [
  { h: 'f7a8b9', m: '加饮料菜单', a: '千问', d: '周四' }, { h: 'e5f6a7', m: '调整首页布局', a: '大肥鱼', d: '周三' }, { h: 'd4e5f6', m: '改颜色', a: 'Gemini', d: '周三' },
  { h: 'c3d4e5', m: '修错字', a: 'Kimi', d: '周二' }, { h: '7c8d9e', m: '统一缩进', a: 'Gemini', d: '周二' }, { h: 'b2c3d4', m: '更新 README', a: 'Claude', d: '周一' },
  { h: 'a1b2c3', m: '加点菜按钮', a: '大肥鱼', d: '上周' }];
const LOG_FILE = [true, true, false, true, true, false, true];   // 动过 index.html 的
SC.search = (t, blk, en) => {
  bgLecture(t, MAINC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G02_01'), g2 = S('G02_02'), g3 = S('G02_03'), g4 = S('G02_04') - 0.15, g5 = S('G02_05') - 0.15;
  const flt = P('G02_01', 0.55), pk = P('G02_02', 0.55);
  if (t < g3 - 0.1) { const a = eOut(prog(t, g1, 0.3)) * (1 - prog(t, g3 - 0.4, 0.3)); ctx.save(); ctx.globalAlpha *= clamp(a);
    cmdBar(t, 1270, 160, 'git log --oneline -- index.html', P('G02_01', 0.08), 0.7, { out: g2 - 0.1, fs: 34, col: MAINC });
    cmdBar(t, 1270, 160, 'git log -S "order-btn"', P('G02_02', 0.1), 0.6, { out: g3 - 0.4, fs: 36, col: CLUE });
    const rows = LOG9.map((r, i) => Object.assign({}, r, { t: g1 + 0.1 + i * 0.05,
      st: tt => { if (tt >= pk && (i === 1 || i === 6)) return i === 1 ? 2 : 4; if (tt >= g2 + 0.2 && LOG_FILE[i]) return 3; if (tt >= flt && !LOG_FILE[i]) return 3; return 0; },
      tag: i === 6 ? ['+ 出现', GOODC, pk + 0.1] : i === 1 ? ['− 消失', KNOTC, pk + 0.25] : null }));
    logRows(t, 700, 240, 980, rows, { rh: 76, fs: 28 });
    if (t >= flt && t < g2) note(1190, 830, popIn(t, flt), '只剩动过 index.html 的', MAINC, { fs: 34 });
    if (t >= pk + 0.4) note(1190, 830, popIn(t, pk + 0.4), '按内容搜：代码在哪出现、在哪消失', CLUE, { fs: 34 });
    ctx.restore(); }
  if (t >= g3 - 0.3 && t < g4 + 0.3) { const a = eOut(prog(t, g3 - 0.3, 0.3)) * (1 - prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    txt('git log', 760, 230, 48, '#fff', { font: F_CODE });
    [['--grep="按钮"', '搜说明里的字', P('G02_03', 0.05), '#9fb0ff'], ['--author="大肥鱼"', '只看某个人', P('G02_03', 0.3), '#8fc3ff'], ['--since="3 days ago"', '只看最近几天', P('G02_03', 0.55), '#7cf07a']].forEach((c, i) => { const s = popIn(t, c[2], 0.4); if (s <= 0) return;
      ctx.save(); ctx.translate(1270, 360 + i * 140); ctx.scale(s, s); box(-500, -55, 1000, 110, 22, 'rgba(15,12,31,0.92)', c[3], 5); txt(c[0], -470, 0, 38, c[3], { font: F_CODE }); txt(c[1], 470, 0, 32, '#fff', { align: 'right' }); ctx.restore(); });
    if (t >= P('G02_03', 0.8)) fancy('条件可以叠着用！', 1270, 820, 64, t, P('G02_03', 0.8), FX.yel);
    ctx.restore(); }
  if (t >= g4 && t < g5 + 0.3) { const a = eOut(prog(t, g4, 0.3)) * (1 - prog(t, g5, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    pill(1270, 170, '-S 找的是“数量变了”的提交', CLUE, popIn(t, g4 + 0.05), { fs: 38, font: F_BODY });
    [['加上', 'order-btn × 0 → 1', '✓ 算', GOODC, P('G02_04', 0.3)], ['删掉', 'order-btn × 1 → 0', '✓ 算', GOODC, P('G02_04', 0.42)], ['挪位置', 'order-btn × 1 → 1', '✗ 不算', KNOTC, P('G02_04', 0.65)]].forEach((c, i) => { const s = popIn(t, c[4], 0.4); if (s <= 0) return;
      ctx.save(); ctx.translate(1270, 330 + i * 150); ctx.scale(s, s); box(-520, -60, 1040, 120, 22, '#fffaf0', c[3], 6); txt(c[0], -480, 0, 40, '#1b1433', {}); txt(c[1], -40, 0, 36, '#5f3dc4', { align: 'center', font: F_CODE }); txt(c[2], 480, 0, 40, c[3], { align: 'right' }); ctx.restore(); });
    ctx.restore(); }
  if (t >= g5) { const a = eOut(prog(t, g5, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    const cy = browser(700, 140, 1160, 640, 'github.com/dafeiyu/baifan/blob/main/index.html', { title: 'GitHub', accent: '#24292f' });
    txt('📄 index.html', 740, cy + 50, 34, '#24292f', {});
    const hb = popIn(t, P('G02_05', 0.35)); ctx.save(); ctx.translate(1720, cy + 50); ctx.scale(1 + 0.15 * Math.sin(prog(t, P('G02_05', 0.35), 0.5) * Math.PI), 1 + 0.15 * Math.sin(prog(t, P('G02_05', 0.35), 0.5) * Math.PI));
    box(-90, -30, 180, 60, 12, t >= P('G02_05', 0.35) ? '#fff8c5' : '#f6f8fa', t >= P('G02_05', 0.35) ? '#d4a72c' : '#d0d7de', 3); txt('🕘 History', 0, 1, 26, '#24292f', { align: 'center' }); ctx.restore();
    if (t >= P('G02_05', 0.5)) logRows(t, 740, cy + 110, 1080, LOG9.filter((r, i) => LOG_FILE[i]).map((r, i) => Object.assign({}, r, { t: P('G02_05', 0.5) + i * 0.06 })), { rh: 70, fs: 26 });
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('K02', 0.6)) stamp(t, P('K02', 0.6), 1180, 520, '嫌疑 3 个 ✓', '#34407a', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['K02']); typeSfx(P('G02_01', 0.08), 31, 0.7); for (let i = 0; i < 7; i++) sfx(S('G02_01') + 0.1 + i * 0.05, 'pop', 0.15); sfx(P('G02_01', 0.55), 'whoosh', 0.4);
  typeSfx(P('G02_02', 0.1), 22, 0.6); sfx(S('G02_02') + 0.2, 'whoosh', 0.3); sfx(P('G02_02', 0.55), 'ding', 0.5); sfx(P('G02_02', 0.55) + 0.25, 'buzz', 0.4);
  [0.05, 0.3, 0.55].forEach(f => sfx(P('G02_03', f), 'pop', 0.4)); sfx(P('G02_03', 0.8), 'sparkle', 0.4);
  sfx(S('G02_04') - 0.15, 'swoosh_in', 0.4); [0.3, 0.42].forEach(f => sfx(P('G02_04', f), 'ding', 0.3)); sfx(P('G02_04', 0.65), 'buzz', 0.4);
  sfx(S('G02_05') - 0.15, 'swoosh_in', 0.4); sfx(P('G02_05', 0.35), 'click', 0.6); for (let i = 0; i < 5; i++) sfx(P('G02_05', 0.5) + i * 0.06, 'pop', 0.15); sfx(P('K02', 0.6), 'stamp', 0.7); });

// ---- 讲解②：git blame（Gemini）----
const BL9 = [
  { h: 'a1b2c3', a: '大肥鱼', d: '10-12', ln: 40, code: '<nav class="top">' }, { h: '7c8d9e', a: 'Gemini', d: '10-20', ln: 41, code: '  <a href="#menu">菜单</a>' },
  { h: '7c8d9e', a: 'Gemini', d: '10-20', ln: 42, code: '  <a href="#about">关于</a>' }, { h: 'a1b2c3', a: '大肥鱼', d: '10-12', ln: 43, code: '</nav>' },
  { h: 'e5f6a7', a: '大肥鱼', d: '10-21', ln: 44, code: '<section id="menu" class="grid">' }, { h: '7c8d9e', a: 'Gemini', d: '10-20', ln: 45, code: '  <h2>今日菜单</h2>' }];
SC.blame = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G03_01'), g2 = S('G03_02'), g3 = S('G03_03') - 0.15, g4 = S('G03_04') - 0.15, g5 = S('G03_05') - 0.15, ws = P('G03_05', 0.4);
  if (t < g3 + 0.3) { const a = eOut(prog(t, g1, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha *= clamp(a);
    cmdBar(t, 1270, 160, 'git blame index.html', P('G03_01', 0.05), 0.5, { out: g2 - 0.1, fs: 38, col: ACC });
    cmdBar(t, 1270, 160, 'git blame -L 40,50 index.html', P('G03_02', 0.05), 0.6, { out: P('G03_02', 0.55), fs: 34, col: ACC });
    const cols = [[P('G03_01', 0.3), '提交编号', 760], [P('G03_01', 0.45), '作者', 930], [P('G03_01', 0.58), '时间', 1060]];
    blameView(t, 700, 240, 1170, BL9.map((r, i) => Object.assign({}, r, { t: g1 + 0.15 + i * 0.05, st: tt => (r.a === 'Gemini' && tt >= P('G03_01', 0.75) ? 1 : 0) })), { fs: 26, rh: 64 });
    cols.forEach(c => { if (t >= c[0] && t < g2) note(c[2] + 40, 740, popIn(t, c[0]), c[1], CLUE, { fs: 28 }); });
    if (t >= P('G03_02', 0.3) && t < P('G03_02', 0.55)) note(1270, 760, popIn(t, P('G03_02', 0.3)), '只看第 40–50 行', CLUE, { fs: 34 });
    if (t >= P('G03_02', 0.55)) { const s = popIn(t, P('G03_02', 0.55), 0.4); ctx.save(); ctx.translate(1270, 170); ctx.scale(s, s); box(-430, -50, 860, 100, 18, '#fff', '#24292f', 4); txt('GitHub 文件页', -400, 0, 32, '#24292f', {});
      box(140, -30, 120, 60, 10, '#fff8c5', '#d4a72c', 3); txt('Blame', 200, 1, 28, '#24292f', { align: 'center', font: F_CODE }); box(275, -30, 130, 60, 10, '#f6f8fa', '#d0d7de', 2); txt('History', 340, 1, 24, '#57606a', { align: 'center', font: F_CODE }); ctx.restore(); }
    ctx.restore(); }
  if (t >= g3 && t < g4 + 0.3) { const a = eOut(prog(t, g3, 0.3)) * (1 - prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    const s0 = popIn(t, g3 + 0.05, 0.4); ctx.save(); ctx.translate(1270, 230); ctx.scale(s0, s0); box(-520, -80, 1040, 160, 26, '#fffaf0', BADC, 7); txt('最后动过这一行', -260, 0, 44, '#1b1433', { align: 'center' }); txt('≠', 0, 0, 80, BADC, { align: 'center' }); txt('谁的锅', 260, 0, 44, '#1b1433', { align: 'center' }); ctx.restore();
    cmdBar(t, 1270, 420, 'git show 7c8d9e', P('G03_03', 0.6), 0.4, { fs: 38, col: ACC });
    if (t >= P('G03_03', 0.7)) ymlEditor(t, 700, 500, 1170, 340, '7c8d9e 统一缩进 · Gemini', [{ s: '-<a href="#menu">菜单</a>', t: P('G03_03', 0.72), bad: true, vcol: '#ff9aa9' }, { s: '+  <a href="#menu">菜单</a>', t: P('G03_03', 0.76), good: true, vcol: '#9be89b' }, { s: '  （只多了两个空格）', t: P('G03_03', 0.85), vcol: '#ffd27a' }], { fs: 30, accent: ACC });
    ctx.restore(); }
  if (t >= g4 && t < g5 + 0.3) { const a = eOut(prog(t, g4, 0.3)) * (1 - prog(t, g5, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    const cy = browser(700, 140, 1160, 640, 'github.com/dafeiyu/baifan/blame/main/index.html', { title: 'GitHub · Blame', accent: '#24292f' });
    const lay = Math.min(2, Math.floor(Math.max(0, t - P('G03_04', 0.45)) / 0.7) + (t >= P('G03_04', 0.45) ? 1 : 0));
    const vers = [['7c8d9e', 'Gemini', '统一缩进'], ['e5f6a7', '大肥鱼', '调整首页布局'], ['a1b2c3', '大肥鱼', '加点菜按钮']];
    for (let k = 0; k <= lay; k++) { const off = (lay - k) * -24; ctx.save(); ctx.globalAlpha *= k === lay ? 1 : 0.5; box(740 + off, cy + 30 + off, 1080, 420, 16, '#fff', k === lay ? '#d4a72c' : '#d0d7de', k === lay ? 4 : 2);
      if (k === lay) { txt(vers[k][0] + ' · ' + vers[k][1], 780 + off, cy + 80 + off, 28, '#9a6700', { font: F_CODE }); txt(vers[k][2], 780 + off, cy + 130 + off, 30, '#24292f', {});
        ['<nav class="top">', k === 2 ? '  <button class="order-btn">点菜</button>' : '  <a href="#menu">菜单</a>', '</nav>'].forEach((l, j) => txt(l, 900 + off, cy + 210 + j * 56 + off, 26, '#24292f', { font: F_CODE }));
        const ib = popIn(t, P('G03_04', 0.3)); ctx.save(); ctx.translate(820 + off, cy + 210 + off); ctx.scale(ib, ib); box(-26, -26, 52, 52, 10, '#ddf4ff', '#54aeff', 3); txt('⧉', 0, 2, 30, '#0969da', { align: 'center' }); ctx.restore(); }
      ctx.restore(); }
    if (t >= P('G03_04', 0.45)) note(1290, cy + 560, popIn(t, P('G03_04', 0.45)), '⧉ 跳到这次改动之前 · 一层层往前查', CLUE, { fs: 32 });
    ctx.restore(); }
  if (t >= g5) { const a = eOut(prog(t, g5, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    cmdBar(t, 1270, 160, 'git blame -w index.html', P('G03_05', 0.3), 0.5, { fs: 38, col: ACC });
    blameView(t, 700, 240, 1170, BL9.map(r => { const ig = r.a === 'Gemini'; return Object.assign({}, r, ig && t >= ws + 0.4 ? { h: 'a1b2c3', a: '大肥鱼', d: '10-12' } : {}, { t: -1, st: ig ? (t >= ws + 0.4 ? 4 : t >= ws ? 3 : 1) : 0 }); }), { fs: 26, rh: 64, title: 'git blame -w index.html' });
    if (t >= ws) note(1270, 790, popIn(t, ws), '-w：忽略空白改动，跳过“只改缩进”', '#7cf07a', { fs: 32 });
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('M02', 0.6)) stamp(t, P('M02', 0.6), 1180, 520, '清白 ✓', '#a855f7', 96, -0.12);
};
SFX_FNS.push(() => { guestSfx(['M02']); typeSfx(P('G03_01', 0.05), 20, 0.5); for (let i = 0; i < 6; i++) sfx(S('G03_01') + 0.15 + i * 0.05, 'pop', 0.15); [0.3, 0.45, 0.58].forEach(f => sfx(P('G03_01', f), 'pop', 0.3)); sfx(P('G03_01', 0.75), 'ding', 0.4);
  typeSfx(P('G03_02', 0.05), 29, 0.6); sfx(P('G03_02', 0.3), 'pop', 0.3); sfx(P('G03_02', 0.55), 'click', 0.5);
  sfx(S('G03_03') - 0.1, 'swoosh_in', 0.4); sfx(S('G03_03'), 'buzz', 0.4); typeSfx(P('G03_03', 0.6), 15, 0.4); sfx(P('G03_03', 0.72), 'pop', 0.3); sfx(P('G03_03', 0.76), 'pop', 0.3);
  sfx(S('G03_04') - 0.15, 'swoosh_in', 0.4); sfx(P('G03_04', 0.3), 'pop', 0.4); sfx(P('G03_04', 0.45), 'click', 0.5); sfx(P('G03_04', 0.45) + 0.7, 'click', 0.5);
  sfx(S('G03_05') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G03_05', 0.3), 23, 0.5); sfx(P('G03_05', 0.4), 'whoosh', 0.4); sfx(P('G03_05', 0.4) + 0.4, 'ding', 0.4); sfx(P('M02', 0.6), 'stamp', 0.8); });

// ---- 讲解③：git bisect（Grok）----
SC.bisect = (t, blk, en) => {
  bgLecture(t, '#d6283e'); lecturer(t, blk, en, blk.t0);
  const g1 = S('G04_01'), g2 = S('G04_02'), g3 = S('G04_03'), g4 = S('G04_04') - 0.15, g5 = S('G04_05') - 0.15;
  const N = 64;   // 画 64 格代表 100 个提交
  const st = [[-1, 0, N - 1, null], [P('G04_02', 0.12), 0, N - 1, 32], [P('G04_02', 0.5), 32, N - 1, 48], [P('G04_02', 0.78), 32, 48, 40],
    [P('G04_03', 0.1), 40, 48, 44], [P('G04_03', 0.25), 40, 44, 42], [P('G04_03', 0.4), 42, 44, 43], [P('G04_03', 0.55), 42, 43, null, 43]];
  const top = t < g4 + 0.3;
  if (top) { const a = eOut(prog(t, g1, 0.3)) * (1 - prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha *= clamp(a);
    box(690, 130, 1180, 300, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
    bisectBar(t, 740, 280, 1080, N, bisectState(t, st), { h: 70 });
    const ms = bisectState(t, st); if (ms.mid != null && t >= P('G04_02', 0.12)) txt('试这个 →', 740 + (ms.mid + 0.5) * 1080 / N, 190, 26, CLUE, { align: 'center' });
    ctx.restore();
    if (t < g2) terminal(t, 700, 470, 1160, 380, [{ s: 'git bisect start', t: P('G04_01', 0.08), cmd: true, dur: 0.35 }, { s: 'git bisect bad', t: P('G04_01', 0.35), cmd: true, dur: 0.3 }, { s: '{d}# 现在是坏的', t: P('G04_01', 0.42) }, { s: 'git bisect good v1.2', t: P('G04_01', 0.7), cmd: true, dur: 0.4 }, { s: '{d}# 上周的版本是好的', t: P('G04_01', 0.78) }], { title: '终端', accent: '#d6283e', fs: 32, prompt: false, alpha: a });
    else if (t < g3) { const k = [[P('G04_02', 0.3), 1, 'good', GOODC], [P('G04_02', 0.6), 0, 'bad', KNOTC]]; let cur = null; k.forEach(c => { if (t >= c[0]) cur = c; });
      baifanPage(t, 1000, 660, 0.82 * popIn(t, P('G04_02', 0.15)), cur ? cur[1] : 1);
      if (cur) { const s = popIn(t, cur[0] + 0.15); ctx.save(); ctx.translate(1530, 650); ctx.scale(s, s); box(-260, -60, 520, 120, 30, '#1b1730', cur[3], 6); txt('git bisect ' + cur[2], 0, 2, 38, cur[3], { align: 'center', font: F_CODE }); ctx.restore(); }
      if (t >= P('G04_02', 0.82)) fancy('每次砍掉一半！', 1270, 860, 60, t, P('G04_02', 0.82), FX.yel); }
    else { const cnt = [100, 50, 25, 13, 7, 4, 2, 1]; const ci = Math.min(7, Math.max(0, Math.floor((t - g3) / ((E('G04_03') - g3) * 0.08)))); const fin = P('G04_03', 0.6);
      cnt.forEach((n, i) => { if (i > ci) return; const s = popIn(t, g3 + i * (E('G04_03') - g3) * 0.08, 0.3); ctx.save(); ctx.translate(760 + i * 150, 560); ctx.scale(s, s); box(-60, -50, 120, 100, 20, i === 7 ? KNOTC : '#fffaf0', i === 7 ? '#fff' : ACC, 5); txt(String(n), 0, 2, 44, i === 7 ? '#fff' : '#1b1433', { align: 'center', font: F_CODE }); if (i) txt('第' + i + '次', 0, 78, 22, '#fff', { align: 'center' }); ctx.restore(); });
      if (t >= fin) { const s = popIn(t, fin, 0.4); ctx.save(); ctx.translate(1270, 800); ctx.scale(s, s); box(-560, -60, 1120, 120, 24, '#1b1730', KNOTC, 6); txt('e5f6a7 is the first bad commit', 0, 2, 40, '#ff9aa9', { align: 'center', font: F_CODE }); ctx.restore(); stamp(t, fin + 0.3, 1640, 680, '最多 7 次！', BADC, 42, -0.06); } } }
  if (t >= g4 && t < g5 + 0.3) { const a = eOut(prog(t, g4, 0.3)) * (1 - prog(t, g5, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    box(690, 130, 1180, 300, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
    const sk = P('G04_04', 0.55); const s2 = t < sk ? { lo: 32, hi: 48, mid: 40 } : { lo: 32, hi: 48, mid: 39, skip: [40] };
    bisectBar(t, 740, 280, 1080, N, s2, { h: 70 });
    if (t < sk) { const p = popIn(t, P('G04_04', 0.1)); ctx.save(); ctx.translate(1270, 600); ctx.scale(p, p); box(-300, -110, 600, 220, 24, '#2a2350', '#888', 5); txt('💥 跑不起来', 0, -30, 44, '#fff', { align: 'center', font: EMOJI + ',' + F_BODY }); txt('好？坏？没法判断', 0, 40, 32, '#c9c3e6', { align: 'center' }); ctx.restore(); }
    else { cmdBar(t, 1270, 600, 'git bisect skip', sk, 0.35, { fs: 44, col: '#aaa' }); note(1270, 740, popIn(t, sk + 0.4), '跳过它，换旁边一个', '#ddd', { fs: 34 }); }
    ctx.restore(); }
  if (t >= g5) { const a = eOut(prog(t, g5, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    [['git bisect reset', '⏪ 查完回到原来的分支', P('G04_05', 0.1), '#7cf07a'], ['git bisect run npm test', '🤖 有测试脚本？自动跑完', P('G04_05', 0.55), '#6bd3ff']].forEach((c, i) => { const s = popIn(t, c[2], 0.4); if (s <= 0) return;
      ctx.save(); ctx.translate(1270, 320 + i * 260); ctx.scale(s, s); box(-540, -100, 1080, 200, 30, '#1b1730', c[3], 7); txt(c[0], 0, -30, 46, c[3], { align: 'center', font: F_CODE }); txt(c[1], 0, 45, 34, '#fff', { align: 'center', font: EMOJI + ',' + F_BODY }); ctx.restore(); });
    if (t >= P('G04_05', 0.25) && t < P('G04_05', 0.55)) stamp(t, P('G04_05', 0.25), 1700, 180, '别忘了！', BADC, 46, -0.1);
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('X02', 0.5)) stamp(t, P('X02', 0.5), 1180, 520, '7 次抓到 ✓', '#d6283e', 86, -0.12);
};
SFX_FNS.push(() => { guestSfx(['X02']); typeSfx(P('G04_01', 0.08), 16, 0.35); typeSfx(P('G04_01', 0.35), 14, 0.3); typeSfx(P('G04_01', 0.7), 20, 0.4);
  [0.12, 0.5, 0.78].forEach(f => sfx(P('G04_02', f), 'whoosh', 0.4)); sfx(P('G04_02', 0.15), 'pop', 0.3); sfx(P('G04_02', 0.3) + 0.15, 'ding', 0.4); sfx(P('G04_02', 0.6) + 0.15, 'buzz', 0.4); sfx(P('G04_02', 0.82), 'sparkle', 0.4);
  const g3 = S('G04_03'), d3 = E('G04_03') - g3; for (let i = 0; i < 8; i++) sfx(g3 + i * d3 * 0.08, 'pop', 0.25); [0.1, 0.25, 0.4].forEach(f => sfx(P('G04_03', f), 'whoosh', 0.25)); sfx(P('G04_03', 0.6), 'impact', 0.6); sfx(P('G04_03', 0.6) + 0.3, 'stamp', 0.6);
  sfx(S('G04_04') - 0.15, 'swoosh_in', 0.4); sfx(P('G04_04', 0.1), 'buzz', 0.4); typeSfx(P('G04_04', 0.55), 15, 0.35); sfx(P('G04_04', 0.55) + 0.4, 'pop', 0.3);
  sfx(S('G04_05') - 0.15, 'swoosh_in', 0.4); sfx(P('G04_05', 0.1), 'pop', 0.4); sfx(P('G04_05', 0.25), 'stamp', 0.5); sfx(P('G04_05', 0.55), 'pop', 0.4); sfx(P('X02', 0.5), 'stamp', 0.8); });

// ---- 讲解④：git revert（Claude）----
SC.revert = (t, blk, en) => {
  bgLecture(t, '#e07a3d'); lecturer(t, blk, en, blk.t0);
  const g1 = S('G05_01'), g2 = S('G05_02') - 0.15, g3 = S('G05_03') - 0.15, rv = P('G05_01', 0.4);
  if (t < g2 + 0.3) { const a = eOut(prog(t, g1, 0.3)) * (1 - prog(t, g2, 0.3)); ctx.save(); ctx.globalAlpha *= clamp(a);
    cmdBar(t, 1270, 160, 'git revert e5f6a7', P('G05_01', 0.05), 0.45, { fs: 40, col: '#e07a3d' });
    box(690, 250, 1180, 300, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
    const xs = [770, 900, 1030, 1160, 1290, 1470]; const labs = ['A', 'B', 'e5f6', '千问', 'Kimi', '↩ 撤销'];
    const N = {}, E = []; xs.forEach((x, i) => { if (i === 5 && t < rv) return; N['n' + i] = { x, y: 380, col: i === 2 ? KNOTC : i === 5 ? GOODC : MAINC, t0: i === 5 ? rv : -1, lab: labs[i], fs: 22, r: i === 5 ? 30 : 22, glow: i === 5 && t < rv + 1, mark: i === 5 ? '↩' : null }; if (i) E.push(['n' + (i - 1), 'n' + i, i === 5 ? rv : -1, i === 5 ? GOODC : null]); });
    drawGraph(t, N, E);
    if (t >= rv) { const pv = moveP(t, rv - 0.1, 0.5, 1030, 380, 1470, 380, 120); if (pv[2] < 1) txt('↺', pv[0], pv[1] - 50, 50, CLUE, { align: 'center' }); }
    if (t >= P('G05_01', 0.55)) { ymlEditor(t, 700, 580, 760, 230, 'index.html（撤销后）', [{ s: '<button class="order-btn">点菜</button>', t: P('G05_01', 0.58), good: true, vcol: '#9be89b' }, { s: '  ↑ 按钮回来了', t: P('G05_01', 0.65), vcol: '#ffd27a' }], { fs: 26, accent: GOODC }); }
    if (t >= P('G05_01', 0.78)) note(1650, 610, popIn(t, P('G05_01', 0.78)), '原来的历史 一点不动', '#7cf07a', { fs: 30 });
    ctx.restore(); }
  if (t >= g2 && t < g3 + 0.3) { const a = eOut(prog(t, g2, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    [[690, 'reset', '把历史倒回去', KNOTC, S('G05_02')], [1290, 'revert', '往前加一步“撤销”', GOODC, P('G05_02', 0.35)]].forEach((c, i) => { const s = popIn(t, c[4], 0.4); if (s <= 0) return;
      ctx.save(); ctx.translate(c[0] + 285, 400); ctx.scale(s, s); ctx.translate(-c[0] - 285, -400); box(c[0], 170, 570, 460, 26, 'rgba(15,12,31,0.92)', c[3], 6); txt(c[1], c[0] + 285, 230, 44, c[3], { align: 'center', font: F_CODE }); txt(c[2], c[0] + 285, 290, 32, '#fff', { align: 'center' });
      const N = {}, E = []; for (let k = 0; k < 4; k++) { const gone = i === 0 && k >= 2 && t >= c[4] + 0.4; N['k' + k] = { x: c[0] + 85 + k * 105, y: 420, col: k === 2 ? KNOTC : MAINC, ghost: gone }; if (k) E.push(['k' + (k - 1), 'k' + k, -1]); }
      if (i === 1 && t >= c[4] + 0.4) { N.r = { x: c[0] + 85 + 4 * 105, y: 420, col: GOODC, t0: c[4] + 0.4, mark: '↩' }; E.push(['k3', 'r', c[4] + 0.4, GOODC]); }
      drawGraph(t, N, E, { r: 22 });
      txt(i === 0 ? '⚠ 改写历史' : '✓ 不改写历史', c[0] + 285, 560, 32, i === 0 ? '#ff9aa9' : '#7cf07a', { align: 'center' }); ctx.restore(); });
    if (t >= P('G05_02', 0.7)) fancy('推送过的 → revert', 1270, 760, 66, t, P('G05_02', 0.7), FX.green);
    ctx.restore(); }
  if (t >= g3) { const a = eOut(prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    ymlEditor(t, 700, 180, 1170, 330, 'COMMIT_EDITMSG', [{ s: 'Revert "调整首页布局"', t: P('G05_03', 0.12), dur: 0.5, vcol: '#ffd27a', hl: [P('G05_03', 0.12), P('G05_03', 0.5)] }, { s: '', t: -1 }, { s: 'This reverts commit e5f6a7.', t: P('G05_03', 0.25), dur: 0.5, vcol: '#c9c3e6' }], { fs: 32, accent: '#e07a3d' });
    if (t >= P('G05_03', 0.4)) note(1270, 560, popIn(t, P('G05_03', 0.4)), '💾 说明自动写好 · 保存就行', CLUE, { fs: 32 });
    if (t >= P('G05_03', 0.6)) { const s = popIn(t, P('G05_03', 0.6), 0.4); ctx.save(); ctx.translate(1270, 720); ctx.scale(s, s); box(-480, -70, 960, 140, 26, '#fffaf0', '#e07a3d', 6); txt('想恢复？再 revert 这个撤销提交 ↩↩', 0, 2, 36, '#1b1433', { align: 'center' }); ctx.restore(); }
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('C02', 0.6)) stamp(t, P('C02', 0.6), 1180, 520, '批准 ✓', '#22c08b', 96, -0.12);
};
SFX_FNS.push(() => { guestSfx(['C02']); typeSfx(P('G05_01', 0.05), 17, 0.45); sfx(P('G05_01', 0.4) - 0.1, 'whoosh', 0.5); sfx(P('G05_01', 0.4) + 0.4, 'ding', 0.5); sfx(P('G05_01', 0.58), 'pop', 0.3); sfx(P('G05_01', 0.78), 'pop', 0.3);
  sfx(S('G05_02') - 0.15, 'swoosh_in', 0.4); sfx(S('G05_02'), 'pop', 0.4); sfx(S('G05_02') + 0.4, 'buzz', 0.3); sfx(P('G05_02', 0.35), 'pop', 0.4); sfx(P('G05_02', 0.35) + 0.4, 'ding', 0.4); sfx(P('G05_02', 0.7), 'stamp', 0.5);
  sfx(S('G05_03') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G05_03', 0.12), 20, 0.5); typeSfx(P('G05_03', 0.25), 27, 0.5); sfx(P('G05_03', 0.4), 'pop', 0.3); sfx(P('G05_03', 0.6), 'pop', 0.4); sfx(P('C02', 0.6), 'stamp', 0.8); });

// ---- 讲解⑤：cherry-pick（豆包）----
SC.cherry = (t, blk, en) => {
  bgLecture(t, CHERRY); lecturer(t, blk, en, blk.t0);
  const g1 = S('G06_01'), g2 = S('G06_02'), g3 = S('G06_03') - 0.15, cp = P('G06_01', 0.45);
  cmdBar(t, 1270, 160, 'git cherry-pick c3d4e5', P('G06_01', 0.08), 0.5, { out: g3, fs: 40, col: CHERRY });
  if (t >= g3) cmdBar(t, 1270, 160, 'git cherry-pick -x c3d4e5', P('G06_03', 0.08), 0.5, { fs: 40, col: CHERRY });
  if (t < g3 + 0.3) { const a = eOut(prog(t, g1, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha *= clamp(a);
    box(690, 250, 1180, 420, 26, 'rgba(15,12,31,0.9)', '#fff', 5); txt('main', 720, 310, 28, MAINC, { font: F_CODE }); txt('dessert', 720, 560, 28, FEATC, { font: F_CODE });
    const N = { a: { x: 820, y: 380, col: MAINC }, b: { x: 960, y: 380, col: MAINC }, c: { x: 1100, y: 380, col: MAINC } }; const E = [['a', 'b', -1], ['b', 'c', -1]];
    ['甜点', '修错字', '做一半', '做一半'].forEach((l, i) => { N['f' + i] = { x: 1040 + i * 150, y: 580, col: i === 1 ? CHERRY : FEATC, lab: i === 1 ? 'c3d4e5 修错字' : l, fs: 20, glow: i === 1 && t < cp + 0.6, r: i === 1 ? 28 : 22, max: 260 }; E.push([i ? 'f' + (i - 1) : 'b', 'f' + i, -1]); });
    const m = moveP(t, cp, 0.6, 1190, 580, 1260, 380, 140);
    if (t >= cp) { N.cp = { x: m[0], y: m[1], col: m[2] > 0.99 ? NEWC : CHERRY, r: 28, lab: m[2] > 0.99 ? '9a8b7c 修错字' : null, up: true, fs: 22, max: 260 }; if (m[2] > 0.99) E.push(['c', 'cp', cp + 0.6, NEWC]); }
    drawGraph(t, N, E, { r: 22 });
    if (t >= cp) txt('🍒', m[0] + 30, m[1] - 40, 46, '#000', { align: 'center', font: EMOJI, bold: false });
    if (t >= cp + 0.7 && t < g2) note(1270, 740, popIn(t, cp + 0.7), '复制一份 · 接到当前分支后面', CLUE, { fs: 34 });
    if (t >= g2) { [['只拿点名的那个', P('G06_02', 0.05), '#7cf07a'], ['新编号 9a8b7c', P('G06_02', 0.35), CLUE], ['冲突：add → --continue', P('G06_02', 0.6), '#ff9aa9']].forEach((c, i) => note(840 + i * 400, 750, popIn(t, c[1]), c[0], c[2], { fs: 28 })); }
    ctx.restore(); }
  if (t >= g3) { const a = eOut(prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    ymlEditor(t, 700, 260, 1170, 300, 'git log -1', [{ s: '修错字', t: P('G06_03', 0.2), vcol: '#ffd27a' }, { s: '', t: -1 }, { s: '(cherry picked from commit c3d4e5)', t: P('G06_03', 0.35), dur: 0.6, good: true, vcol: '#9be89b' }], { fs: 32, accent: CHERRY });
    if (t >= P('G06_03', 0.6)) fancy('从哪摘来的，一眼就知道！', 1270, 720, 58, t, P('G06_03', 0.6), FX.pink);
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('B02', 0.5)) stamp(t, P('B02', 0.5), 1180, 520, '精准摘取 🍒', CHERRY, 76, -0.1);
};
SFX_FNS.push(() => { guestSfx(['B02']); typeSfx(P('G06_01', 0.08), 22, 0.5); sfx(P('G06_01', 0.45), 'whoosh', 0.5); sfx(P('G06_01', 0.45) + 0.6, 'ding', 0.5); sfx(P('G06_01', 0.45) + 0.7, 'pop', 0.3);
  [0.05, 0.35, 0.6].forEach(f => sfx(P('G06_02', f), 'pop', 0.35)); sfx(S('G06_03') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G06_03', 0.08), 25, 0.5); sfx(P('G06_03', 0.35), 'ding', 0.4); sfx(P('G06_03', 0.6), 'sparkle', 0.4); sfx(P('B02', 0.5), 'stamp', 0.8); });

// ---- 复习：搜 · 查 · 修 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const cards = [['🔍 搜', MAINC, ['log -- 文件名', 'log -S "代码"', '--author / --since'], 'G07_01'], ['🕵️ 查', ACC, ['blame 谁改的', 'show 看改动', 'bisect 二分'], 'G07_02'], ['🩹 修', OKC, ['推送过 → revert', '只要一个 → cherry-pick', '不改写公共历史'], 'G07_03']];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.1, 0.4); if (s <= 0) return; const act = t >= S(c[3]) - 0.1 && (i === 2 || t < S(cards[i + 1][3]) - 0.1);
    const x = 870 + i * 400, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= S(c[3]) - 0.1 ? 1 : 0.5;
    if (act) { ctx.shadowColor = c[1]; ctx.shadowBlur = 40; } box(-180, -300, 360, 600, 28, '#fffaf0', c[1], 8); ctx.shadowBlur = 0;
    box(-180, -300, 360, 100, [28, 28, 0, 0], c[1]); txt(c[0], 0, -248, 46, '#fff', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false });
    c[2].forEach((l, k) => { const a = clamp(prog(t, P(c[3], 0.08 + k * 0.27), 0.25)); ctx.save(); ctx.globalAlpha *= 0.25 + 0.75 * a; box(-150, -170 + k * 140, 300, 110, 16, '#fff', '#e4dff5', 3); txt(l, 0, -170 + k * 140 + 55, 25, '#1b1433', { align: 'center', font: isCJK(l) ? F_BODY : F_CODE, max: 285 }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= P('G07_03', 0.8)) fancy('搜 · 查 · 修，真凶跑不掉！', 1270, 880, 56, t, P('G07_03', 0.8), FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2].forEach(i => sfx(BK.recap.t0 + 0.1 + i * 0.1, 'pop', 0.3)); ['G07_01', 'G07_02', 'G07_03'].forEach(id => { for (let k = 0; k < 3; k++) sfx(P(id, 0.08 + k * 0.27), 'ding', 0.25); }); sfx(P('G07_03', 0.8), 'sparkle', 0.5); });

// ---- 实战：抓出按钮真凶 ----
SC.practice = (t, blk, en) => {
  bgLecture(t, BADC); lecturer(t, blk, en, blk.t0);
  const T = { log: S('G08_01'), bis: S('G08_02'), show: S('G08_03'), rv: S('G08_04'), ok: P('G08_04', 0.6), pr: S('G08_05') };
  const steps = [['log -S', T.log], ['bisect', T.bis], ['show', T.show], ['revert', T.rv], ['✅ 检查', T.ok], ['写说明', T.pr]];
  const end = S('D09') - 0.2;
  steps.forEach((s, i) => { const a = popIn(t, blk.t0 + 0.15 + i * 0.06); if (a <= 0) return;
    const x = 790 + i * 200, y = 88; const act = t < end && t >= s[1] && (i === 5 || t < steps[i + 1][1]); const done = t >= end || (i < 5 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1)); box(-90, -32, 180, 64, 18, act ? BADC : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act && !/^[✓✅]/.test(s[0]) ? '✓ ' : '') + s[0], 0, 2, 22, '#fff', { align: 'center', font: isCJK(s[0]) ? F_BODY : F_CODE, max: 170 }); ctx.restore(); });
  const ta = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha *= ta;
  // 上：二分条 + 网页
  box(670, 150, 1210, 330, 24, 'rgba(15,12,31,0.92)', '#fff', 4);
  const st = [[-1, 0, 23, null], [P('G08_02', 0.35), 0, 23, 12], [P('G08_02', 0.5), 12, 23, 18], [P('G08_02', 0.65), 12, 18, 15], [P('G08_02', 0.78), 12, 15, null, 14]];
  const sus = [3, 14, 20];
  if (t < T.bis) { for (let i = 0; i < 24; i++) { const hot = sus.includes(i) && t >= P('G08_01', 0.5); box(720 + i * 34, 250 - (hot ? 10 : 0), 24, hot ? 80 : 60, 4, hot ? CLUE : t >= P('G08_01', 0.5) ? '#3d3760' : '#5a5580'); } if (t >= P('G08_01', 0.55)) txt('嫌疑 × 3', 1100, 380, 34, CLUE, { align: 'center' }); }
  else bisectBar(t, 720, 280, 820, 24, bisectState(t, st), { h: 60 });
  const btn = t < T.rv + 0.3 ? 0 : t >= T.ok ? 1 : 0; baifanPage(t, 1720, 315, 0.62, btn);
  if (t >= T.ok) sparkle(t, T.ok, 1720, 360, 160, 10);
  // 下：终端
  const L = [{ s: 'git log -S "order-btn" -- index.html', t: P('G08_01', 0.05), cmd: true, dur: 0.6 }, { s: '{y}f7a8b9 {y}e5f6a7 {y}a1b2c3 {d}← 3 个', t: P('G08_01', 0.5) },
    { s: 'git bisect start; git bisect bad; git bisect good v1.2', t: P('G08_02', 0.05), cmd: true, dur: 0.7 }, { s: '{r}e5f6a7 is the first bad commit', t: P('G08_02', 0.8) },
    { s: 'git show e5f6a7', t: T.show + 0.05, cmd: true, dur: 0.35 }, { s: '{r}-  <button class="order-btn">点菜</button>', t: P('G08_03', 0.4) }, { s: 'git bisect reset', t: P('G08_03', 0.8), cmd: true, dur: 0.3 },
    { s: 'git revert e5f6a7 && git push', t: T.rv + 0.05, cmd: true, dur: 0.55 }, { s: '{g}✓ checks passed', t: T.ok }];
  terminal(t, 670, 500, 1210, 400, L, { title: '终端 — 白饭页', accent: BADC, fs: 28, prompt: false });
  if (t >= T.pr && t < end) { const s = popIn(t, T.pr + 0.05, 0.4); ctx.save(); ctx.translate(1275, 700); ctx.scale(s, s); box(-560, -170, 1120, 340, 22, '#fff', '#d0d7de', 4);
    txt('PR #6 修复：点菜按钮消失', -520, -120, 34, '#24292f', {}); ['🔍 哪次：e5f6a7「调整首页布局」', '💥 为什么：改布局时误删了按钮', '🩹 怎么修：git revert e5f6a7'].forEach((l, i) => { const a = clamp(prog(t, P('G08_05', 0.25 + i * 0.15), 0.2)); ctx.save(); ctx.globalAlpha *= a; txt(l, -520, -40 + i * 70, 30, '#24292f', { font: EMOJI + ',' + F_BODY }); ctx.restore(); }); ctx.restore(); }
  ctx.restore();
  if (t < S('G08_01') + 0.6) fancy('实战开始！', 1280, 500, 110, t, blk.t0 + 0.2, Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_party', 1620, H + 30, 880, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    baifanPage(t, 960, 400, popIn(t, end + 0.05, 0.4) * 1.1, 1, { col: GOODC });
    stamp(t, end + 0.4, 1160, 230, '结案 ✓', GOODC, 70, -0.1);
    fancy('案子破了！', 940, 720, 90, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 6; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(b.t0 + 0.2, 'impact', 0.6);
  typeSfx(P('G08_01', 0.05), 36, 0.6); sfx(P('G08_01', 0.5), 'ding', 0.4); typeSfx(P('G08_02', 0.05), 50, 0.7); [0.35, 0.5, 0.65].forEach(f => sfx(P('G08_02', f), 'whoosh', 0.3)); sfx(P('G08_02', 0.78), 'impact', 0.5);
  typeSfx(S('G08_03') + 0.05, 15, 0.35); sfx(P('G08_03', 0.4), 'buzz', 0.4); typeSfx(P('G08_03', 0.8), 16, 0.3); typeSfx(S('G08_04') + 0.05, 30, 0.55); sfx(P('G08_04', 0.6), 'ding', 0.5); sfx(P('G08_04', 0.6), 'sparkle', 0.4);
  sfx(S('G08_05') + 0.05, 'pop', 0.4); [0.25, 0.4, 0.55].forEach(f => sfx(P('G08_05', f), 'pop', 0.25));
  const end = S('D09') - 0.2; sfx(end, 'impact', 0.6); sfx(end + 0.4, 'stamp', 0.6); sfx(end + 0.4, 'confetti', 0.6); });

// ---- 预告（参与开源）+ 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#5f3dc4');
  const outro = E('G09_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G09_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G09_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G09_01', 0.1), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 470); ctx.scale(bp, bp); ctx.translate(-1260, -470);
      box(860, 250, 800, 420, 24, '#ffffff', '#5f3dc4', 6);
      const up = [1000, 380], fk = [1520, 380], pr = P('G09_01', 0.62);
      [[up, '🌍 开源项目', 'upstream'], [fk, '🍴 你的 fork', 'fork']].forEach((c, i) => { const s = popIn(t, P('G09_01', 0.2 + i * 0.15)); if (s <= 0) return; ctx.save(); ctx.translate(c[0][0], c[0][1]); ctx.scale(s, s); box(-140, -70, 280, 140, 20, '#f6f8fa', '#24292f', 4); txt(c[1], 0, -15, 32, '#24292f', { align: 'center', font: EMOJI + ',' + F_BODY }); txt(c[2], 0, 35, 24, '#57606a', { align: 'center', font: F_CODE }); ctx.restore(); });
      if (t >= P('G09_01', 0.3)) { const p = eOut(prog(t, P('G09_01', 0.3), 0.4)); seg(1140, 360, lerp(1140, 1380, p), 360, '#24292f', 1, 6); txt('fork', 1260, 330, 24, '#24292f', { align: 'center', font: F_CODE }); }
      if (t >= pr) { const p = eOut(prog(t, pr, 0.5)); seg(1380, 410, lerp(1380, 1140, p), 410, OKC, 1, 8); txt('Pull Request ✓', 1260, 450, 26, OKC, { align: 'center', font: F_CODE }); }
      ['issue #42  good first issue'].forEach((l, i) => { const s = popIn(t, P('G09_01', 0.45)); if (s > 0) { ctx.save(); ctx.translate(1260, 580); ctx.scale(s, s); box(-300, -36, 600, 72, 36, '#ddf4ff', '#54aeff', 3); txt('🏷️ ' + l, 0, 2, 28, '#0969da', { align: 'center', font: EMOJI + ',' + F_CODE }); ctx.restore(); } });
      ctx.restore(); }
    [['fork', -520, 300, 0.25], ['同步上游', 520, 290, 0.4], ['认领 issue', -500, 680, 0.5], ['🎉 第一个 PR', 510, 690, 0.66]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G09_01', c[3])), { fs: 34, font: isCJK(c[0]) ? F_BODY : F_CODE }));
    fancy('给开源项目出一份力！', 1260, 830, 70, t, P('G09_01', 0.78), FX.pink);
  }
  if (ot > 0) {
    ctx.fillStyle = `rgba(10,8,22,${0.78 * ot})`; ctx.fillRect(...OS);
    [['👍', '点赞', '#ff5c8a'], ['🪙', '投币', '#ffd23f'], ['⭐', '收藏', '#3ec1ff']].forEach((ic, i) => {
      const a = popIn(t, S('G09_02') + 0.4 + i * 0.32, 0.4); if (a <= 0) return;
      const x = W / 2 + (i - 1) * 330, y = 440;
      ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(t * 5 + i) * 0.06);
      ctx.fillStyle = ic[2]; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.font = `110px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic[0], 0, 8); ctx.restore();
      fancy(ic[1], x, y + 180, 60, t, S('G09_02') + 0.5 + i * 0.32, { c1: '#fff', c2: '#eee', stroke: ic[2] });
    });
    fancy('一键三连，下集见！', W / 2, 180, 96, t, S('G09_02') + 1.4, { stagger: 0.04 });
    if (t > outro) {
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_detective', 1690, H + 40, 640, { scale: sa }); }
      SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
    ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
    ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G09_01', 0.1), 'pop', 0.6); [0.2, 0.35].forEach(f => sfx(P('G09_01', f), 'pop', 0.3)); sfx(P('G09_01', 0.3), 'whoosh', 0.4); sfx(P('G09_01', 0.62), 'whoosh', 0.5); sfx(P('G09_01', 0.62) + 0.5, 'ding', 0.5);
  [0.25, 0.4, 0.5, 0.66].forEach(f => sfx(P('G09_01', f), 'pop', 0.3)); sfx(P('G09_01', 0.78), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G09_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G09_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_sparkle', P('G01_01', 0.85), E('G01_01')], ['d_ok', P('G03_03', 0.4), P('G03_03', 0.95)],
  ['d_shock', P('G04_03', 0.65), E('G04_03')], ['d_relief', P('G05_01', 0.8), E('G05_01')],
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
