// AI娘 Git课 · 第2集 渲染引擎 —— renderAt(t) 纯函数，逐帧确定性导出（通用部分沿用第1集）
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const F_FANCY = '"Smiley", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const F_BODY = '"Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const F_CODE = 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", "Microsoft YaHei", "Noto Sans CJK SC", monospace';

// ================= 素材 =================
const SPR = {};
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'g_cheer', 'g_warn', 'g_think', 'g_shock', 'g_proud', 'g_type', 'g_peace', 'g_awkward', 'g_present', 'd_panic', 'd_curious', 'd_happy', 'd_raise', 'd_think', 'd_shock', 'd_sparkle', 'd_ok', 'd_relief', 'd_leader', 'q_base', 'q_point', 'q_tea', 'c_base', 'c_ok', 'c_cool', 'm_base', 'm_panic', 'm_cheeky', 'x_base', 'x_angry', 'x_force', 'b_base', 'b_sorry', 'k_base', 'k_read'];
// 竖版立绘只显示上半身：显示高度占整张图的比例（头顶到腰）
const SPRC = { d_panic: 0.55, d_curious: 0.55, d_happy: 0.55, d_sparkle: 0.6, d_ok: 0.66, d_raise: 0.72, d_think: 0.7, d_relief: 0.82, d_shock: 0.82, d_leader: 0.7, q_base: 0.6, q_point: 0.6, q_tea: 0.6, c_base: 0.58, c_ok: 0.58, c_cool: 0.58, m_base: 0.62, m_panic: 0.6, m_cheeky: 0.62, x_base: 0.6, x_angry: 0.6, x_force: 0.66, b_base: 0.62, b_sorry: 0.62, k_base: 0.6, k_read: 0.6 };
const loadImg = n => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });


// ================= 台词（由 subtitles.json 生成，改台词请改 _gen_script.py）=================
const TEXT = {
  D01: "救命！小组作业七个人一起写，文件在群里传来传去，现在谁也不知道哪份是最新的！",
  G01_01: "别慌！上集你学会了云存档，其实一个仓库，可以让一整队人联机一起写。",
  G01_02: "欢迎来到 AI娘 Git 课，第三集，联机模式，多人协作！",
  G02_01: "先认识一下这次的 AI 分工小队！",
  Q01: "千问，负责张罗分工！任务大家领，奶茶我来请～",
  C01: "Claude，负责审查。没有来源的内容，我不会放行。",
  M01: "嘿嘿，Gemini 来啦！不管你问什么，你的观察都非常敏锐喵！",
  X01: "Grok。废话少说，活儿交给我，我直接干。",
  B01: "豆包来咯！家人们有事尽管说，包在我身上！",
  K01: "Kimi……资料多长都行，我都能一口气读完。",
  G02_02: "组长大肥鱼先新建仓库，再到 Settings 里的 Collaborators，把队友一个个邀请进来。",
  G02_03: "队友接受邀请，git clone 下载仓库，就都能往里 push 了。",
  D02: "人到齐了，可是谁写哪部分呢？",
  Q02: "交给我！在仓库的 Issues 里，一个任务开一条。",
  G03_01: "对，Issue 就是任务单。写清楚要做什么，再在右边的 Assignees 指定负责人。",
  G03_02: "每条 Issue 都有编号，比如 #3：写 Claude 的介绍页。",
  D03: "领到任务啦！那我直接在 main 上改？",
  G04_01: "不行哦！联机的第一条规矩：不在 main 上直接改。",
  G04_02: "每个任务开一条自己的分支：git switch -c claude-page。",
  G04_03: "写完 add、commit，再 git push -u origin claude-page，把分支推上云。",
  G04_04: "main 永远保持能用的样子，大家的半成品都待在各自的分支里。",
  D04: "分支推上去了，怎么让它合进 main 呢？",
  G05_01: "回到网页，会看到一条黄色提示，点 Compare & pull request。",
  G05_02: "Pull Request，简称 PR，意思就是：请把我的分支合进 main。",
  G05_03: "写清楚改了什么，再加一句 Closes #3，合并以后，三号任务会自动关闭。",
  D05: "开好 PR，就能直接合并了吗？",
  G06_01: "先等队友审查！这次的审查员是 Claude。",
  C02: "第十二行写着“豆包会做菜”，没有来源。我不想放行一个只是听起来合理的说法。",
  G06_02: "在 Files changed 里，点任意一行就能留评论。审查员可以选 Approve 批准，或者 Request changes 要求修改。",
  G06_03: "作者在本地改好，commit、push 到同一条分支，PR 会自动更新，不用重开。",
  C03: "来源补上了。Approve，批准。",
  G07_01: "批准以后，点 Merge pull request，分支就合进 main 啦！",
  G07_02: "合完点 Delete branch，把用完的分支删掉。其他人回到 main，git pull 一下，就能拿到最新内容。",
  D06: "诶？Gemini 的 PR 怎么显示有冲突？",
  M02: "不可能！我的分支是最新的，现在绝对是 2024 年喵！",
  G08_01: "Gemini 的分支开得太早了。这期间，千问已经改了 README 里成员表的同一行。",
  G08_02: "两个人改了同一行，GitHub 不知道该听谁的，就会提示冲突。",
  G08_03: "在本地切到自己的分支，git pull origin main，把云端最新的 main 拉进来。",
  G08_04: "然后像第一集那样，选好要保留的内容，删掉冲突标记，再 add、commit、push。",
  G08_05: "推上去以后，PR 里的冲突提示就消失了。",
  M03: "诶？原来……已经不是 2024 年了喵。嘿嘿。",
  G08_06: "所以分支别拖太久，开工前先把 main 拉到最新，冲突会少很多。",
  X02: "审查太慢了。git push --force，直接推到 main！",
  G09_01: "停！组长早就给 main 加了保护。",
  G09_02: "在 Settings 的 Rules 里给 main 定规则：必须通过 PR 合并，至少一人批准，禁止强制推送。",
  X03: "被拒了？这是真的吗？",
  G09_03: "真的！谁想绕过审查直接推 main，都会被拦下来。规则面前，人人平等。",
  D07: "豆包的 PR 怎么有两个多 G？",
  B02: "嘻嘻，我把录屏和存着密码的 .env 文件，一起传上去啦！",
  G10_01: "这就是上集说的：密码和大文件，绝对不能推！",
  G10_02: "在仓库根目录建一个 .gitignore 文件，写上不想让 Git 管的文件。",
  G10_03: "比如写一行 .env，再写一行 *.mp4，所有 mp4 视频就都被忽略了。",
  G10_04: "已经被 Git 记录的文件，要先 git rm --cached 取消跟踪，文件本身还留在电脑上。",
  G10_05: "密码要是已经推上去了，第一时间去改密码，这比删记录更重要。",
  B03: "收到！对不起嘛家人们，下次一定！",
  D08: "那要是想给别人的开源项目帮忙，我又不是成员，怎么办？",
  G11_01: "用 Fork！在别人的仓库页面点 Fork，就会在你的账号下复制一份。",
  G11_02: "在自己的副本里开分支、改、推，再向原仓库发起 PR。",
  G11_03: "记住：队友用分支，外人用 Fork，最后都靠 PR 合并。",
  D09: "信息量好大，帮我总结一下！",
  G12_01: "联机就是一条流水线：Issue 领任务，开分支，push，开 PR。",
  G12_02: "审查通过再合并，合完大家 pull。再加两道保险：保护 main，写好 .gitignore。",
  D10: "能不能带我们从头到尾，完整走一遍呀？",
  G13_01: "没问题！用 Kimi 的介绍页，完整走一遍联机流程！",
  G13_02: "先拉最新的 main：git switch main，git pull。",
  G13_03: "开分支：git switch -c kimi-page。",
  K02: "介绍页写好了。三个月前的聊天记录，我也一字不差地整理进去了。",
  G13_04: "git add .，git commit -m \"添加 Kimi 介绍页\"，再 git push -u origin kimi-page。",
  G13_05: "回到网页开 PR，写上 Closes #6。Claude 批准，点合并，删分支。",
  G13_06: "最后大家 git pull，七个人的图鉴，就合成一本啦！",
  Q03: "完工！奶茶我请！",
  G14_01: "下集预告：提交说明写错了？改到一半要切分支？下集我们讲 Git 后悔药大全！",
  G14_02: "喜欢的话记得一键三连，我们下集见！",
};
const DUR = Object.assign({}, window.DUR || {});

// ================= 时间轴 =================
const V = (b, id, pose) => ({ k: 'v', b, id, pose });
const BEAT = (b, d) => ({ k: 'beat', b, d: b === 'teaser' ? d * 0.75 : d * 0.35 });
const CH_COL = ['#7c5cff', '#3ec1ff', '#22c08b', '#ffb020', '#ff5c8a', '#ff7a3d', '#a66bff', '#ffd23f'];
const PLAN = [
  V('cold', 'D01', 'd_panic'),
  V('why', 'G01_01', 'g_explain'),
  V('title', 'G01_02', 'g_cheer'), BEAT('title', 1.4),
  V('squad', 'G02_01', 'g_present'), V('squad', 'Q01', 'q_base'), V('squad', 'C01', 'c_cool'), V('squad', 'M01', 'm_cheeky'), V('squad', 'X01', 'x_base'), V('squad', 'B01', 'b_base'), V('squad', 'K01', 'k_base'),
  V('collab', 'G02_02', 'g_point'), V('collab', 'G02_03', 'g_explain'),
  V('ask1', 'D02', 'd_curious'),
  V('issue', 'Q02', 'q_point'), V('issue', 'G03_01', 'g_point'), V('issue', 'G03_02', 'g_explain'),
  V('ask2', 'D03', 'd_raise'),
  V('branch', 'G04_01', 'g_warn'), V('branch', 'G04_02', 'g_type'), V('branch', 'G04_03', 'g_explain'), V('branch', 'G04_04', 'g_point'),
  V('ask3', 'D04', 'd_think'),
  V('pr', 'G05_01', 'g_present'), V('pr', 'G05_02', 'g_explain'), V('pr', 'G05_03', 'g_point'),
  V('ask4', 'D05', 'd_curious'),
  V('review', 'G06_01', 'g_explain'), V('review', 'C02', 'c_cool'), V('review', 'G06_02', 'g_point'), V('review', 'G06_03', 'g_explain'), V('review', 'C03', 'c_ok'),
  V('merge', 'G07_01', 'g_cheer'), V('merge', 'G07_02', 'g_explain'),
  V('ask5', 'D06', 'd_shock'),
  V('conflict', 'M02', 'm_panic'), V('conflict', 'G08_01', 'g_think'), V('conflict', 'G08_02', 'g_explain'), V('conflict', 'G08_03', 'g_type'), V('conflict', 'G08_04', 'g_point'), V('conflict', 'G08_05', 'g_cheer'), V('conflict', 'M03', 'm_cheeky'), V('conflict', 'G08_06', 'g_wink'),
  V('protect', 'X02', 'x_force'), V('protect', 'G09_01', 'g_warn'), V('protect', 'G09_02', 'g_explain'), V('protect', 'X03', 'x_angry'), V('protect', 'G09_03', 'g_proud'),
  V('ask6', 'D07', 'd_shock'),
  V('ignore', 'B02', 'b_base'), V('ignore', 'G10_01', 'g_warn'), V('ignore', 'G10_02', 'g_type'), V('ignore', 'G10_03', 'g_explain'), V('ignore', 'G10_04', 'g_point'), V('ignore', 'G10_05', 'g_warn'), V('ignore', 'B03', 'b_sorry'),
  V('ask7', 'D08', 'd_think'),
  V('fork', 'G11_01', 'g_present'), V('fork', 'G11_02', 'g_explain'), V('fork', 'G11_03', 'g_wink'),
  V('ask8', 'D09', 'd_panic'),
  V('recap', 'G12_01', 'g_cheer'), V('recap', 'G12_02', 'g_present'),
  V('askP', 'D10', 'd_ok'),
  V('practice', 'G13_01', 'g_cheer'), V('practice', 'G13_02', 'g_type'), V('practice', 'G13_03', 'g_type'), V('practice', 'K02', 'k_read'), V('practice', 'G13_04', 'g_type'),
  V('practice', 'G13_05', 'g_point'), V('practice', 'G13_06', 'g_proud'), V('practice', 'Q03', 'q_tea'),
  V('teaser', 'G14_01', 'g_explain'), V('teaser', 'G14_02', 'g_cheer'), BEAT('teaser', 8),
];
const GAP_SAME = 0.04, GAP_SWITCH = 0.12, GAP_BLOCK = 0.12;
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
  const parts = str.split(/\{(\w)\}/); let col = TC[def], cx = x;
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) { col = TC[parts[i]] || col; continue; }
    if (!parts[i]) continue; ctx.fillStyle = col; ctx.fillText(parts[i], cx, y); cx += ctx.measureText(parts[i]).width;
  }
  return cx;
}
const plain = s => s.replace(/\{\w\}/g, '');
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
const HEAD = { q_base: [0.476, 0.152, 0.12], c_base: [0.508, 0.151, 0.135], m_base: [0.51, 0.151, 0.128], x_base: [0.55, 0.225, 0.12], b_base: [0.543, 0.151, 0.13], k_base: [0.512, 0.150, 0.145], d_ok: [0.475, 0.165, 0.14], g_explain: [0.525, 0.17, 0.155] };
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

// ---- 冷开场：群里文件刷屏 ----
const CHAT = [['Q', '图鉴_最终版.docx', '1.2 MB'], ['C', '图鉴_最终版_Claude改.docx', '1.3 MB'], ['M', '图鉴_最终版2(1).docx', '1.2 MB'], ['X', '图鉴_真·最终版.docx', '1.1 MB'],
  ['B', '图鉴_豆包改坏了.docx', '0 KB'], ['K', '图鉴_别再改了.docx', '1.4 MB'], ['Q', '图鉴_最终版_确定版.docx', '1.3 MB'], ['C', '图鉴_最最终版.docx', '1.3 MB'], ['M', '图鉴_最终版_喵.docx', '1.2 MB']];
SC.cold = (t, blk) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, P('D01', 0.55), 10, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#ff4d6d', '#ff8fa3', W * 0.62, H * 0.5, 22, 0.35);
  const wa = eBack(prog(t, t0 + 0.05, 0.4));
  ctx.save(); ctx.translate(1390, 470); ctx.scale(wa, wa); ctx.translate(-1390, -470);
  win(940, 80, 900, 790, '小组作业群（7）', '#ff5c8a', { bg: '#f3f0fa', bar: '#2a2350' });
  ctx.save(); rr(946, 140, 888, 724, [0, 0, 18, 18]); ctx.clip();
  const n = CHAT.filter((m, i) => t >= t0 + 0.35 + i * 0.62).length;
  CHAT.slice(0, n).forEach((m, i) => {
    const age = t - (t0 + 0.35 + i * 0.62); const ry = 790 - (n - 1 - i) * 122 + (1 - eOut(clamp(age / 0.25))) * 60;
    if (ry < 120) return; const right = i % 3 === 2;
    const ax = right ? 1780 : 1000; avatar(m[0], ax, ry, 38);
    ctx.font = `bold 28px ${F_CODE}`; const bw = ctx.measureText(m[1]).width + 120; const bx = right ? 1730 - bw : 1050;
    box(bx, ry - 46, bw, 92, 18, '#fff', '#d6d1e6', 3);
    txt('📄', bx + 20, ry, 40, '#000', { font: '"Segoe UI Emoji","Noto Color Emoji",sans-serif', bold: false });
    txt(m[1], bx + 78, ry - 12, 28, '#1b1433', { font: F_CODE }); txt(m[2], bx + 78, ry + 22, 20, '#8c959f', { bold: false });
  });
  ctx.restore(); ctx.restore();
  const p = spring(prog(t, t0, 0.9));
  sprite('d_panic', 520, H + 40, 980, { scale: lerp(1.3, 1, p) });
  fancy('救命！', 380, 160, 140, t, U.D01.vo + 0.05, { rot: -0.12, wobble: 6, c1: '#fff36b', c2: '#ffb000', stroke: '#8a0a2a' });
  if (t >= P('D01', 0.55)) {
    ctx.save(); ctx.globalAlpha = eOut(prog(t, P('D01', 0.55), 0.25)); ctx.fillStyle = 'rgba(20,10,40,0.35)'; ctx.fillRect(940, 80, 900, 790); ctx.restore();
    fancy('到底哪份是最新的？！', 1390, 470, 88, t, P('D01', 0.58), Object.assign({ rot: -0.06, wobble: 4 }, FX.white, { stroke: '#8a0a2a' }));
  }
};
SFX_FNS.push(() => { const b = BK.cold; sfx(b.t0 + 0.05, 'swoosh_in', 0.5); CHAT.forEach((m, i) => sfx(b.t0 + 0.35 + i * 0.62, 'pop', 0.4)); sfx(P('D01', 0.55), 'impact', 0.8); sfx(P('D01', 0.58), 'glitch', 0.4); });

// ---- 一个仓库，一整队人 ----
SC.why = (t, blk, en) => {
  bgLecture(t, '#3ec1ff'); lecturer(t, blk, en, blk.t0);
  const cx = 1270, cy = 430;
  const keys = ['D', 'Q', 'C', 'M', 'X', 'B', 'K'];
  keys.forEach((k, i) => {
    const ang = -Math.PI / 2 + i * Math.PI * 2 / 7; const x = cx + Math.cos(ang) * 470, y = cy + 20 + Math.sin(ang) * 300;
    const ta = P('G01_01', 0.42 + i * 0.05); const s = popIn(t, ta);
    if (s > 0) arrow(x + (cx - x) * 0.18, y + (cy - y) * 0.18, x + (cx - x) * 0.62, y + (cy - y) * 0.62, SQ[k].col, eOut(prog(t, ta + 0.1, 0.3)), 9, { dash: [14, 10], t });
    avatar(k, x, y, 62, { s });
  });
  cloud(cx, cy, 0.95 * popIn(t, blk.t0 + 0.2, 0.4), { t, label: '一个仓库', n: 3, glow: t > P('G01_01', 0.8) ? 0.6 : 0 });
  fancy('一个仓库，一整队人！', cx, 880, 70, t, P('G01_01', 0.7), FX.yel);
};
SFX_FNS.push(() => { sfx(BK.why.t0 + 0.2, 'pop', 0.5); for (let i = 0; i < 7; i++) sfx(P('G01_01', 0.42 + i * 0.05), 'pop', 0.3); sfx(P('G01_01', 0.7), 'sparkle', 0.5); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#6d3fd6', '#8b5cf6', W * 0.6, H * 0.45, 28, 0.2);
  sprite('g_cheer', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 250, 1180);
  sprite('d_leader', lerp(W + 500, 1650, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 700);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 450); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-330, 0, 95, '#ffd23f', '第3集', { fs: 52, rot: -0.15 });
    fancy('联机模式', 60, -60, 120, t, -99, FX.yel);
    fancy('多人协作！', 150, 80, 140, t, -99, FX.pink);
    ctx.restore();
    speedLines(t, 1060, 450, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 760, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 小队登场 ----
SC.squad = (t, blk, en) => {
  const ids = ['Q01', 'C01', 'M01', 'X01', 'B01', 'K01'];
  const curI = ids.findIndex(id => t >= U[id].vo - 0.2 && t < (ids[ids.indexOf(id) + 1] ? U[ids[ids.indexOf(id) + 1]].vo - 0.2 : blk.t1 + 1));
  const k = curI >= 0 ? ids[curI][0] : null; const col = k ? SQ[k].col : '#8b5cf6';
  bgBurst(t, col, 'rgba(255,255,255,0.16)', W * 0.72, H * 0.45, 24, 0.22);
  if (curI < 0) {
    sprite('g_present', lerp(W + 400, 1450, eBack(prog(t, blk.t0, 0.45))), H + 280, 1180, { scale: breath(t) });
    fancy('AI 分工小队', 620, 300, 120, t, blk.t0 + 0.15, FX.white);
    fancy('集合！', 620, 470, 130, t, P('G02_01', 0.5), FX.yel);
  } else {
    const id = ids[curI], e = U[id], c = SQ[k];
    const ta = e.vo - 0.2; const pi = eBack(prog(t, ta, 0.4));
    sprite(e.pose, lerp(W + 500, 1430, pi), H + 40, 1000, { scale: breath(t, curI) });
    ctx.save(); ctx.translate(lerp(-600, 0, eOut(prog(t, ta, 0.3))), 0);
    box(120, 200, 840, 380, 40, 'rgba(20,14,40,0.88)', '#fff', 6);
    avatar(k, 250, 330, 90, { s: popIn(t, ta + 0.05) });
    fancy(c.n, 600, 320, c.n.length > 3 ? 104 : 130, t, ta + 0.1, { c1: '#fff', c2: hexA(c.col, 1), stroke: '#1b1433', stagger: 0.03 });
    pill(540, 500, '分工：' + c.role, c.col, popIn(t, ta + 0.25), { font: F_FANCY, fs: 48, fg: '#fff' });
    ctx.restore();
  }
  ids.forEach((id, i) => { const on = t >= U[id].vo - 0.2; avatar(id[0], 160 + i * 140, 790, 52, { gray: !on, s: popIn(t, blk.t0 + 0.2 + i * 0.05) * (on && i === curI ? 1.12 : 1) }); });
};
SFX_FNS.push(() => { sfx(P('G02_01', 0.5), 'impact', 0.6); ['Q01', 'C01', 'M01', 'X01', 'B01', 'K01'].forEach(id => { sfx(U[id].vo - 0.2, 'swoosh_in', 0.45); sfx(U[id].vo + 0.05, 'stamp', 0.35); }); });

// ---- 邀请协作者 + clone ----
SC.collab = (t, blk, en) => {
  bgLecture(t, '#22c08b'); lecturer(t, blk, en, blk.t0);
  const sw = S('G02_03') - 0.1;
  if (t < sw + 0.3) {
    const a = ph(t, blk.t0, sw, 0.3, 0.3); ctx.save(); ctx.globalAlpha = a;
    const cy = browser(680, 90, 1180, 720, 'github.com/dafeiyu/ai-zukan/settings/access');
    txt('⚙ Settings  ›  Collaborators', 720, cy + 50, 34, '#24292f');
    ghButton(1580, cy + 22, 240, 56, 'Add people', '#1f883d', { fs: 26, press: t > P('G02_02', 0.35) && t < P('G02_02', 0.42), glow: t < P('G02_02', 0.45) ? 0.6 + 0.4 * Math.sin(t * 8) : 0 });
    SQUAD.split('').forEach((k, i) => {
      const ry = cy + 120 + i * 66, s = popIn(t, P('G02_02', 0.42 + i * 0.04)); if (s <= 0) return;
      ctx.save(); ctx.globalAlpha *= clamp(s); box(720, ry - 30, 1100, 62, 0, i % 2 ? '#fff' : '#f6f8fa', '#d0d7de', 1);
      avatar(k, 760, ry, 24); txt(SQ[k].n, 805, ry, 30, '#24292f');
      const mem = t >= P('G02_02', 0.62 + i * 0.05);
      chip(1640, ry, 1, mem ? '✓ Member' : 'Pending', mem ? '#1f883d' : '#bf8700', '#fff', 24);
      ctx.restore();
    });
    ctx.restore();
    if (t > P('G02_02', 0.62)) fancy('邀请队友！', 1270, 880, 64, t, P('G02_02', 0.62), Object.assign({ out: sw }, FX.green));
  }
  if (t >= sw) {
    const a = eOut(prog(t, sw, 0.3)); ctx.save(); ctx.globalAlpha = a;
    cloud(1270, 250, 0.8, { t, label: 'ai-zukan', n: 2 });
    SQUAD.split('').forEach((k, i) => {
      const x = 770 + i * 200, y = 690, ta = P('G02_03', 0.15 + i * 0.05);
      arrow(1270 + (x - 1270) * 0.15, 380, x, y - 90, '#7cf07a', eOut(prog(t, ta, 0.3)), 8);
      avatar(k, x, y, 54);
      if (t > P('G02_03', 0.65)) pill(x, y + 90, 'push ✓', '#ffd23f', popIn(t, P('G02_03', 0.65 + i * 0.03)), { fs: 24 });
    });
    pill(1270, 470, 'git clone', '#7cf07a', popIn(t, P('G02_03', 0.12)), { fs: 34 });
    ctx.restore();
  }
};
SFX_FNS.push(() => { sfx(P('G02_02', 0.38), 'click', 0.6); for (let i = 0; i < 6; i++) { sfx(P('G02_02', 0.42 + i * 0.04), 'pop', 0.25); sfx(P('G02_02', 0.62 + i * 0.05), 'ding', 0.25); } sfx(S('G02_03') - 0.1, 'swoosh_in', 0.4); sfx(P('G02_03', 0.2), 'whoosh', 0.5); sfx(P('G02_03', 0.65), 'coin', 0.4); });

// ---- 大肥鱼提问 ----
const ASK = {
  ask1: { q: '谁写哪部分？', col: '#d7f3ff', dot: '#b5e6ff' }, ask2: { q: '直接改 main？', col: '#fff1cc', dot: '#ffe29a' },
  ask3: { q: '怎么合进 main？', col: '#d9fbe9', dot: '#b6f0d2' }, ask4: { q: '能直接合并吗？', col: '#ffe0ea', dot: '#ffc2d4' },
  ask5: { q: 'PR 有冲突？', col: '#ffe0e0', dot: '#ffbcbc' }, ask6: { q: '两个多 G？！', col: '#ffe6d6', dot: '#ffcaa8' },
  ask7: { q: '我不是成员？', col: '#eadfff', dot: '#d6c4ff' }, ask8: { q: '帮我总结一下！', col: '#d7f3ff', dot: '#b5e6ff' },
  askP: { q: '完整走一遍！', col: '#ffe6d6', dot: '#ffcaa8' },
};
const CHAP = {
  ask1: ['分工', 'Issue 任务单', '#3ec1ff'], ask2: ['分工', '一任务一分支', '#3ec1ff'], ask3: ['审查', 'Pull Request', '#22c08b'], ask4: ['审查', '代码审查与合并', '#22c08b'],
  ask5: ['避坑', 'PR 冲突', '#ff5c8a'], ask6: ['避坑', '.gitignore', '#ff7a3d'], ask7: ['开源', 'Fork', '#a66bff'], ask8: ['复习', '联机流水线', '#ffb020'], askP: ['实战', '用 Kimi 的介绍页走一遍', '#ff7a3d'],
};
function askScene(t, blk, en) {
  const cfg = ASK[blk.b], e = blk.entries[0], t0 = blk.t0;
  bgDots(t, cfg.col, cfg.dot);
  sprite('g_explain', lerp(-300, 250, eOut(prog(t, t0, 0.3))), H + 330, 980, { filter: 'brightness(0.92)', scale: breath(t) });
  const p = spring(prog(t, t0 + 0.05, 0.8));
  sprite(e.pose, lerp(W + 600, 1320, eOut(prog(t, t0, 0.3))), H + 30, 880, { scale: lerp(1.06, 1, p) * breath(t, 1) });
  const bp = popIn(t, e.vo + 0.4, 0.4);
  if (bp > 0) {
    ctx.save(); ctx.translate(820, 260); ctx.scale(bp, bp); ctx.rotate(-0.05);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1b1433'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.ellipse(0, 0, 360, 140, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(180, 100); ctx.lineTo(300, 210); ctx.lineTo(240, 80); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, 350, 132, 0, 0, 7); ctx.fill();
    ctx.restore();
    const L = [...cfg.q].length; fancy(cfg.q, 820, 255, L > 8 ? 66 : L > 5 ? 80 : 100, t, e.vo + 0.55, FX.blue);
  }
  const ch = CHAP[blk.b];
  if (ch) {
    const cp = eOut(prog(t, t0 + 0.05, 0.3)); ctx.save(); ctx.translate(lerp(-700, 0, cp), 0);
    ctx.font = `46px ${F_FANCY}`; const w1 = ctx.measureText(ch[0]).width + 50; ctx.font = `bold 44px ${F_BODY}`; const w2 = ctx.measureText(ch[1]).width + 60;
    ctx.fillStyle = '#1b1433'; rr(40, 40, w1 + w2 + 20, 92, 26); ctx.fill();
    ctx.fillStyle = ch[2]; rr(50, 50, w1, 72, 20); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `46px ${F_FANCY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch[0], 50 + w1 / 2, 88);
    ctx.font = `bold 44px ${F_BODY}`; ctx.fillText(ch[1], 60 + w1 + w2 / 2, 88);
    ctx.restore();
  }
}
Object.keys(ASK).forEach(k => SC[k] = askScene);
SFX_FNS.push(() => BLOCKS.filter(b => b.b.startsWith('ask')).forEach(b => { sfx(b.t0 + 0.08, 'swoosh_in', 0.35); sfx(b.t0 + 0.05, 'pop', 0.6); sfx(b.entries[0].vo + 0.4, 'boing', 0.4); }));

// ---- Issue 任务单 ----
const ISSUES = [['Q', '写千问的介绍页'], ['M', '写 Gemini 的介绍页'], ['C', '写 Claude 的介绍页'], ['X', '写 Grok 的介绍页'], ['B', '写豆包的介绍页'], ['K', '写 Kimi 的介绍页'], ['D', '合成图鉴 + 封面']];
SC.issue = (t, blk, en) => {
  bgLecture(t, '#3ec1ff'); lecturer(t, blk, en, blk.t0);
  const a = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha = a;
  const cy = browser(680, 90, 1180, 720, 'github.com/dafeiyu/ai-zukan/issues');
  txt('⊙ 7 Open', 720, cy + 42, 30, '#24292f'); ghButton(1640, cy + 16, 190, 52, 'New issue', '#1f883d', { fs: 24 });
  if (t > P('G03_01', 0.55)) txt('Assignees', 1820, cy + 42, 26, '#57606a', { align: 'right' });
  const hi3 = t >= S('G03_02');
  ISSUES.forEach((it, i) => {
    const ry = cy + 104 + i * 62; const s = popIn(t, P('Q02', 0.45) + i * 0.07); if (s <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(s);
    const isHi = hi3 && i === 2;
    box(720, ry - 30, 1100, 60, 0, isHi ? '#fff8c5' : '#fff', '#d0d7de', 1);
    txt('⊙', 742, ry, 28, '#1a7f37', { bold: false });
    txt(it[1], 780, ry - 1, 30, '#24292f'); ctx.font = `bold 30px ${F_BODY}`; const tw = ctx.measureText(it[1]).width;
    txt('#' + (i + 1), 795 + tw, ry, 26, '#57606a', { bold: false });
    if (t > P('G03_01', 0.6 + i * 0.04)) avatar(it[0], 1780, ry, 22, { s: popIn(t, P('G03_01', 0.6 + i * 0.04)) });
    ctx.restore();
  });
  if (hi3) { const p = popIn(t, P('G03_02', 0.3)); ctx.save(); ctx.translate(1560, cy + 230); ctx.rotate(-0.08); ctx.scale(p, p); box(-70, -50, 140, 100, 24, '#ffd23f', '#1b1433', 6); txt('#3', 0, 3, 64, '#1b1433', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); }
  ctx.restore();
  fancy('Issue = 任务单', 1270, 880, 70, t, S('G03_01') + 0.3, FX.blue);
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['Q02']); for (let i = 0; i < 7; i++) { sfx(P('Q02', 0.45) + i * 0.07, 'pop', 0.25); sfx(P('G03_01', 0.6 + i * 0.04), 'click', 0.2); } sfx(S('G03_01') + 0.3, 'sparkle', 0.4); sfx(P('G03_02', 0.3), 'stamp', 0.6); });

// ---- 一任务一分支 ----
let _brT;
SC.branch = (t, blk, en) => {
  bgLecture(t, '#ffb020'); lecturer(t, blk, en, blk.t0);
  if (!_brT) _brT = cmdLines([
    { t: P('G04_02', 0.25), s: 'git switch -c claude-page', cmd: true },
    { t: P('G04_02', 0.6), s: "{g}Switched to a new branch {y}'claude-page'" },
    { t: P('G04_03', 0.05), s: 'git add .', cmd: true, dur: 0.3 },
    { t: P('G04_03', 0.15), s: 'git commit -m "Claude 介绍页"', cmd: true, dur: 0.5 },
    { t: P('G04_03', 0.35), s: 'git push -u origin claude-page', cmd: true },
    { t: P('G04_03', 0.62), s: '{g} * [new branch]{w}  claude-page -> claude-page' },
  ]);
  const MY = 660, mx0 = 720, mx1 = 1840, fan = t >= S('G04_04') - 0.1;
  // main 主线
  seg(mx0, MY, mx1, MY, '#22c08b', eOut(prog(t, blk.t0, 0.5)), 16);
  [800, 960, 1120].forEach((x, i) => commitNode(x, MY, 0.36 * popIn(t, blk.t0 + 0.2 + i * 0.1), null, { col: '#22c08b' }));
  pill(780, MY + 70, 'main', '#7cf07a', popIn(t, blk.t0 + 0.3), { fs: 30 });
  if (t < S('G04_02')) {
    docIcon(1400, MY - 10, 0.8 * popIn(t, P('G04_01', 0.2)), '', '#2f6fe0');
    prohibit(1400, MY - 10, 110, popIn(t, P('G04_01', 0.45)));
    stamp(t, P('G04_01', 0.5), 1300, 360, '不在 main 上直接改！', '#e02424', 64, -0.06);
  }
  if (!fan) {
    const ta = ph(t, S('G04_02'), S('G04_04') - 0.2);
    terminal(t, 690, 100, 1170, 380, _brT, { alpha: ta, fs: 28, accent: '#ffb020', title: '终端 — Claude 的电脑' });
    const bp = eOut(prog(t, P('G04_02', 0.6), 0.4));
    if (bp > 0) { seg(960, MY, 1250, 540, '#ff7a3d', bp, 12); if (bp >= 1) { commitNode(1250, 540, 0.36 * popIn(t, P('G04_03', 0.25)), null, { col: '#ff7a3d' }); avatar('C', 1340, 540, 36, { s: popIn(t, P('G04_02', 0.75)) }); pill(1250, 600, 'claude-page', '#ffb36b', popIn(t, P('G04_02', 0.8)), { fs: 24 }); } }
    if (t > P('G04_03', 0.35)) { cloud(1680, 560, 0.5, { t, label: 'GitHub' }); arrow(1380, 530, 1560, 560, '#ffd23f', eOut(prog(t, P('G04_03', 0.45), 0.3)), 10); flyNode(t, P('G04_03', 0.45), 0.4, 1250, 540, 1680, 560, '#ff7a3d', 0.3); }
  } else {
    const ks = ['Q', 'C', 'M', 'X', 'B', 'K'];
    ks.forEach((k, i) => {
      const ex = 1300 + (i % 3) * 210, ey = i < 3 ? 280 + i * 70 : 800 - (i - 3) * 50; const p = eOut(prog(t, S('G04_04') - 0.1 + i * 0.06, 0.4));
      seg(960, MY, ex, ey, SQ[k].col, p, 10); if (p >= 1) avatar(k, ex + 40, ey, 34, { s: popIn(t, S('G04_04') + 0.3 + i * 0.06) });
    });
    pill(820, MY - 80, '✓ 永远能用', '#7cf07a', popIn(t, P('G04_04', 0.3)), { font: F_FANCY, fs: 40 });
    fancy('半成品待在各自分支', 1270, 150, 66, t, P('G04_04', 0.45), FX.orange);
  }
};
SFX_FNS.push(() => { sfx(P('G04_01', 0.45), 'buzz', 0.5); sfx(P('G04_01', 0.5), 'stamp', 0.6); sfx(P('G04_02', 0.6), 'whoosh', 0.4); sfx(P('G04_02', 0.75), 'pop', 0.4); sfx(P('G04_03', 0.45), 'whoosh', 0.5); sfx(P('G04_03', 0.62), 'ding', 0.4); for (let i = 0; i < 6; i++) sfx(S('G04_04') + 0.3 + i * 0.06, 'pop', 0.25); });

// ---- Pull Request ----
SC.pr = (t, blk, en) => {
  bgLecture(t, '#22c08b'); lecturer(t, blk, en, blk.t0);
  const a = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha = a;
  const click = P('G05_01', 0.72), form = t >= click + 0.15;
  const cy = browser(680, 90, 1180, 720, form ? 'github.com/dafeiyu/ai-zukan/compare/claude-page' : 'github.com/dafeiyu/ai-zukan');
  if (!form) {
    repoFiles(720, cy + 150, 1100, ['/members', 'README.md', 'zukan.md'], t, null, { msg: '初始化图鉴', commits: 5, ago: '1 小时前' });
    const bp = popIn(t, P('G05_01', 0.2));
    ctx.save(); ctx.translate(1270, cy + 62); ctx.scale(bp, bp); box(-550, -46, 1100, 92, 12, '#fff8c5', '#d4a72c', 3);
    txt('claude-page had recent pushes', -520, 0, 28, '#24292f', { font: F_CODE }); ctx.restore();
    ghButton(1490, cy + 34, 340, 56, 'Compare & pull request', '#1f883d', { fs: 24, press: t > click && t < click + 0.12, glow: 0.6 + 0.4 * Math.sin(t * 8) });
    const cp = eIO(prog(t, P('G05_01', 0.35), 0.35)); cursor(lerp(1200, 1650, cp), lerp(640, cy + 66, cp), 1.2, prog(t, click, 0.35));
  } else {
    txt('Open a pull request', 720, cy + 46, 40, '#24292f');
    chip(720, cy + 110, 1, 'base: main', '#ddf4ff', '#0969da', 24); txt('←', 900, cy + 110, 30, '#57606a'); chip(940, cy + 110, 1, 'compare: claude-page', '#ddf4ff', '#0969da', 24);
    const title = '添加 Claude 介绍页'; const n = Math.floor(clamp((t - click - 0.3) / 0.8) * title.length);
    inputBox(720, cy + 190, 1100, '', title.slice(0, n), { focus: t < S('G05_03'), t });
    box(720, cy + 280, 1100, 200, 10, '#fff', t >= S('G05_03') ? '#3ec1ff' : '#d0d7de', t >= S('G05_03') ? 4 : 2);
    txt('改了什么：新增 claude.md（Claude 的介绍页）', 744, cy + 320, 28, '#24292f', { bold: false });
    if (t >= P('G05_03', 0.35)) { const s = 'Closes #3'; const m = Math.floor(clamp((t - P('G05_03', 0.35)) / 0.5) * s.length); const tw = txt(s.slice(0, m), 744, cy + 380, 34, '#0969da', { font: F_CODE }); if (m === s.length) { ctx.save(); ctx.globalAlpha *= 0.3 + 0.2 * Math.sin(t * 8); box(734, cy + 356, tw + 20, 48, 8, '#ffd23f'); ctx.restore(); } }
    ghButton(1530, cy + 500, 290, 56, 'Create pull request', '#1f883d', { fs: 24, press: t > P('G05_03', 0.9) && t < P('G05_03', 0.97) });
    if (t >= P('G05_03', 0.6)) note(1180, cy + 528, popIn(t, P('G05_03', 0.6)), '合并后 → #3 自动关闭 ✓', '#7cf07a', { fs: 28 });
  }
  ctx.restore();
  if (t >= S('G05_02') && t < S('G05_03')) fancy('PR = 请把我合进 main', 1270, 880, 70, t, P('G05_02', 0.3), Object.assign({ out: S('G05_03') - 0.1 }, FX.yel));
};
SFX_FNS.push(() => { sfx(P('G05_01', 0.2), 'pop', 0.4); sfx(P('G05_01', 0.72), 'click', 0.7); typeSfx(P('G05_01', 0.72) + 0.3, 10, 0.8); sfx(P('G05_02', 0.3), 'sparkle', 0.4); typeSfx(P('G05_03', 0.35), 9, 0.5); sfx(P('G05_03', 0.6), 'ding', 0.4); sfx(P('G05_03', 0.9), 'click', 0.5); });

// ---- 审查 ----
SC.review = (t, blk, en) => {
  bgLecture(t, '#ff5c8a'); lecturer(t, blk, en, blk.t0);
  const a = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha = a;
  const cy = browser(680, 90, 1180, 720, 'github.com/dafeiyu/ai-zukan/pull/8/files');
  ['Conversation', 'Commits', 'Files changed'].forEach((s, i) => { const x = 720 + i * 250; txt(s, x, cy + 36, 26, i === 2 ? '#24292f' : '#57606a'); if (i === 2) box(x - 6, cy + 60, 210, 5, 2, '#fd8c73'); });
  const fixed = t >= P('G06_03', 0.45);
  box(720, cy + 86, 1100, 50, [10, 10, 0, 0], '#f6f8fa', '#d0d7de', 2); txt('members/claude.md', 740, cy + 111, 26, '#24292f', { font: F_CODE });
  const L = [[10, '## Claude'], [11, '分工：审查'], [12, fixed ? '豆包会做菜（来源：豆包直播回放 3:21）' : '豆包会做菜'], [13, '口头禅：没有来源，不放行']];
  L.forEach((l, i) => diffLine(720, cy + 136 + i * 48, 1100, l[0], l[1], '+', { hl: l[0] === 12 && t >= S('C02') - 0.2 && !fixed }));
  if (fixed) { ctx.save(); ctx.globalAlpha *= 1 - prog(t, P('G06_03', 0.45), 0.8); box(720, cy + 232, 1100, 48, 0, '#7cf07a'); ctx.restore(); }
  // 行内评论
  if (t >= P('C02', 0.15)) {
    const s = popIn(t, P('C02', 0.15)); ctx.save(); ctx.translate(780, cy + 340); ctx.scale(s, s);
    box(0, -10, 1010, 120, 14, '#fff', '#d0d7de', 2); avatar('C', 50, 50, 30); txt('Claude', 100, 25, 26, '#24292f');
    chip(220, 25, 1, 'Request changes', '#cf222e', '#fff', 20); txt('第 12 行没有来源，我不想放行一个只是听起来合理的说法。', 100, 72, 26, '#24292f', { bold: false });
    ctx.restore();
  }
  // 审查面板
  if (t >= P('G06_02', 0.4) && t < S('G06_03')) {
    const s = popIn(t, P('G06_02', 0.4)); ctx.save(); ctx.translate(1250, cy + 300); ctx.scale(s, s);
    box(0, -40, 560, 220, 14, '#fff', '#3ec1ff', 4); txt('Review changes', 24, -8, 28, '#24292f');
    radio(40, 50, false, 'Comment'); radio(40, 100, t >= P('G06_02', 0.62) && t < P('G06_02', 0.85), 'Approve 批准'); radio(40, 150, t >= P('G06_02', 0.85), 'Request changes 要求修改');
    ctx.restore();
  }
  if (t >= P('G06_02', 0.05) && t < P('G06_02', 0.4)) { const p = popIn(t, P('G06_02', 0.05)); ctx.save(); ctx.translate(700, cy + 256); ctx.scale(p, p); box(-18, -18, 36, 36, 8, '#0969da'); txt('+', 0, 1, 30, '#fff', { align: 'center' }); ctx.restore(); }
  if (t >= S('G06_03') && t < S('C03')) { const p = popIn(t, P('G06_03', 0.35)); note(1270, cy + 560, p, '🔁 新 commit：补上来源 → PR 自动更新', '#3ec1ff', { fs: 28 }); }
  ctx.restore();
  if (t < S('C02') - 0.3) fancy('先审查，再合并', 1270, 880, 70, t, P('G06_01', 0.3), FX.pink);
  guest(t, blk);
  if (t >= S('C03') - 0.1) stamp(t, P('C03', 0.5), 1010, 520, '✓ Approved', '#1a7f37', 90, -0.1);
};
SFX_FNS.push(() => { guestSfx(['C02', 'C03']); sfx(P('G06_01', 0.3), 'pop', 0.4); sfx(P('C02', 0.15), 'pop', 0.5); sfx(P('G06_02', 0.05), 'click', 0.4); sfx(P('G06_02', 0.4), 'swoosh_in', 0.4); sfx(P('G06_02', 0.62), 'click', 0.3); sfx(P('G06_02', 0.85), 'click', 0.4); sfx(P('G06_03', 0.35), 'ding', 0.4); sfx(P('C03', 0.5), 'stamp', 0.8); sfx(P('C03', 0.6), 'sparkle', 0.4); });

// ---- 合并 + pull ----
SC.merge = (t, blk, en) => {
  bgLecture(t, '#a66bff'); lecturer(t, blk, en, blk.t0);
  const a = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha = a;
  const click = P('G07_01', 0.45), merged = t >= click + 0.1, del = P('G07_02', 0.2);
  const cy = browser(680, 90, 1180, 560, 'github.com/dafeiyu/ai-zukan/pull/8');
  txt('添加 Claude 介绍页 #8', 720, cy + 40, 36, '#24292f');
  chip(720, cy + 96, 1, merged ? '⑂ Merged' : '⑂ Open', merged ? '#8250df' : '#1f883d', '#fff', 26);
  txt('claude-page → main', merged ? 900 : 870, cy + 96, 24, '#57606a', { font: F_CODE, bold: false });
  box(720, cy + 140, 1100, 160, 12, '#fff', merged ? '#8250df' : '#1f883d', 3);
  if (!merged) { txt('✓ 审查通过 · 没有冲突', 750, cy + 185, 28, '#1a7f37'); ghButton(750, cy + 220, 320, 58, 'Merge pull request', '#1f883d', { fs: 26, press: t > click - 0.05 && t < click + 0.08, glow: 0.6 + 0.4 * Math.sin(t * 8) }); }
  else {
    txt('Pull request successfully merged and closed', 750, cy + 185, 26, '#24292f');
    const gone = t >= del + 0.1; ghButton(750, cy + 220, 260, 58, gone ? '✓ 分支已删除' : 'Delete branch', gone ? '#8c959f' : '#cf222e', { fs: 24, press: t > del - 0.05 && t < del + 0.08 });
  }
  const cp = eIO(prog(t, blk.t0 + 0.1, 0.4)); const cp2 = eIO(prog(t, P('G07_02', 0.02), 0.2));
  if (t < del + 0.5) cursor(lerp(lerp(1400, 900, cp), 870, cp2), lerp(lerp(700, cy + 250, cp), cy + 250, cp2), 1.2, Math.max(prog(t, click, 0.35) * (t < del ? 1 : 0), prog(t, del, 0.35)));
  ctx.restore();
  if (merged) { stamp(t, click + 0.1, 1560, cy + 60, 'Merged', '#8250df', 80, -0.12); }
  if (t >= P('G07_02', 0.45)) {
    SQUAD.split('').concat(['D']).forEach((k, i) => { const x = 760 + i * 180, y = 735; avatar(k, x, y, 46, { s: popIn(t, P('G07_02', 0.45 + i * 0.03)) }); if (t > P('G07_02', 0.6 + i * 0.03)) pill(x, y - 82, 'pull ↓', '#6bd3ff', popIn(t, P('G07_02', 0.6 + i * 0.03)), { fs: 22 }); });
    fancy('合完记得 pull！', 1270, 880, 64, t, P('G07_02', 0.7), FX.blue);
  }
};
SFX_FNS.push(() => { sfx(P('G07_01', 0.45), 'click', 0.7); sfx(P('G07_01', 0.45) + 0.1, 'stamp', 0.8); sfx(P('G07_01', 0.5), 'confetti', 0.4); sfx(P('G07_02', 0.2), 'click', 0.5); sfx(P('G07_02', 0.25), 'crack', 0.3); for (let i = 0; i < 7; i++) sfx(P('G07_02', 0.6 + i * 0.03), 'pop', 0.2); });

// ---- PR 冲突 ----
let _cfT;
SC.conflict = (t, blk, en) => {
  bgLecture(t, '#ff5c8a'); lecturer(t, blk, en, blk.t0);
  if (!_cfT) _cfT = cmdLines([
    { t: P('G08_03', 0.1), s: 'git switch gemini-page', cmd: true, dur: 0.5 },
    { t: P('G08_03', 0.4), s: 'git pull origin main', cmd: true, dur: 0.5 },
    { t: P('G08_03', 0.7), s: '{r}CONFLICT (content): Merge conflict in README.md' },
    { t: P('G08_04', 0.62), s: 'git add .', cmd: true, dur: 0.25 },
    { t: P('G08_04', 0.72), s: 'git commit -m "解决冲突"', cmd: true, dur: 0.35 },
    { t: P('G08_04', 0.86), s: 'git push', cmd: true, dur: 0.25 },
  ]);
  const ph1 = t < S('G08_03') - 0.1, ph3 = t >= S('G08_05') - 0.1;
  if (ph1) {
    const a = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha = a;
    const cy = browser(680, 90, 1180, 420, 'github.com/dafeiyu/ai-zukan/pull/9');
    txt('Gemini 的介绍页 #9', 720, cy + 40, 34, '#24292f');
    box(720, cy + 80, 1100, 120, 12, '#f6f8fa', '#d0d7de', 2); badge(770, cy + 140, 28, '#bf8700', '!', { fs: 36, fg: '#fff', font: F_BODY });
    txt('This branch has conflicts that must be resolved', 820, cy + 122, 28, '#24292f'); txt('Conflicting files:  README.md', 820, cy + 162, 24, '#cf222e', { font: F_CODE, bold: false });
    ctx.restore();
    // 时间线：分支开得早
    if (t >= S('G08_01')) {
      const ga = eOut(prog(t, S('G08_01'), 0.3)); ctx.save(); ctx.globalAlpha = ga;
      const Y = 640; seg(720, Y, 1840, Y, '#22c08b', 1, 14); [790, 1000, 1210, 1420].forEach((x, i) => commitNode(x, Y, 0.3, null, { col: '#22c08b' }));
      pill(780, Y + 60, 'main', '#7cf07a', 1, { fs: 26 });
      seg(790, Y, 1050, 560, '#a855f7', eOut(prog(t, P('G08_01', 0.15), 0.4)), 10); avatar('M', 1090, 560, 32, { s: popIn(t, P('G08_01', 0.3)) });
      if (t > P('G08_01', 0.5)) { avatar('Q', 1420, Y + 70, 30, { s: popIn(t, P('G08_01', 0.5)) }); pill(1600, Y + 70, '改了成员表', '#8fa0ff', popIn(t, P('G08_01', 0.55)), { font: F_BODY, fs: 24 }); }
      ctx.restore();
    }
    if (t >= S('G08_02')) {
      const s = popIn(t, S('G08_02')); ctx.save(); ctx.translate(1270, 830); ctx.scale(s, s);
      box(-560, -70, 1120, 140, 16, '#0f0c1f', '#ff5c8a', 4); txt('README.md 第 6 行', -530, -40, 24, '#8f8aa8');
      txt('| Gemini | 搜索担当 |', -530, 12, 32, '#8fa0ff', { font: F_CODE }); txt('vs', 0, 12, 32, '#fff', { align: 'center' }); txt('| Gemini | 猫猫搜索员喵 |', 60, 12, 32, '#d9a6ff', { font: F_CODE });
      ctx.restore(); fancy('听谁的？', 1640, 540, 72, t, P('G08_02', 0.5), FX.red);
    }
  } else if (!ph3) {
    const a = eOut(prog(t, S('G08_03') - 0.1, 0.3));
    terminal(t, 690, 100, 1170, 330, _cfT, { alpha: a, fs: 26, accent: '#ff5c8a', title: '终端 — Gemini 的电脑' });
    if (t >= P('G08_03', 0.7)) {
      const ea = eOut(prog(t, P('G08_03', 0.7), 0.3)); ctx.save(); ctx.globalAlpha = ea;
      win(690, 450, 1170, 400, 'README.md', '#ffd23f');
      const fixed = t >= P('G08_04', 0.35);
      const lines = fixed ? [['| Gemini | 搜索担当 · 猫猫搜索员喵 |', '#7cf07a']] : [['<<<<<<< HEAD', '#ff6b81'], ['| Gemini | 猫猫搜索员喵 |', '#d9a6ff'], ['=======', '#ffd36b'], ['| Gemini | 搜索担当 |', '#8fa0ff'], ['>>>>>>> main', '#ff6b81']];
      lines.forEach((l, i) => txt(l[0], 730, 545 + i * 56, 32, l[1], { font: F_CODE }));
      if (fixed) note(1275, 760, popIn(t, P('G08_04', 0.38)), '✓ 两边都保留，删掉冲突标记', '#7cf07a', { fs: 32 });
      ctx.restore();
    }
  } else {
    const a = eOut(prog(t, S('G08_05') - 0.1, 0.3)); ctx.save(); ctx.globalAlpha = a;
    const cy = browser(680, 90, 1180, 420, 'github.com/dafeiyu/ai-zukan/pull/9');
    txt('Gemini 的介绍页 #9', 720, cy + 40, 34, '#24292f');
    box(720, cy + 80, 1100, 120, 12, '#dafbe1', '#1a7f37', 3); badge(770, cy + 140, 28, '#1a7f37', '✓', { fs: 36, fg: '#fff', font: F_BODY });
    txt('This branch has no conflicts with the base branch', 820, cy + 140, 28, '#1a7f37');
    ctx.restore();
    if (t >= S('M03') - 0.3) { const fl = prog(t, P('M03', 0.2), 0.5); calendar(1060, 690, popIn(t, S('M03') - 0.3), ['2024', '2026'], fl); }
    if (t >= S('G08_06')) fancy('开工先拉最新 main！', 1270, 880, 70, t, P('G08_06', 0.4), FX.yel);
  }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['M02', 'M03']); sfx(BK.conflict.t0 + 0.3, 'buzz', 0.4); sfx(P('G08_01', 0.3), 'pop', 0.4); sfx(P('G08_01', 0.5), 'pop', 0.4); sfx(S('G08_02'), 'swoosh_in', 0.4); sfx(P('G08_02', 0.5), 'boing', 0.5); sfx(P('G08_03', 0.7), 'glitch', 0.5); sfx(P('G08_04', 0.35), 'sparkle', 0.5); sfx(S('G08_05') - 0.1, 'ding', 0.6); sfx(P('M03', 0.2), 'tape', 0.4); sfx(P('G08_06', 0.4), 'pop', 0.4); });

// ---- 保护 main ----
let _ptT;
SC.protect = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  if (!_ptT) _ptT = cmdLines([
    { t: P('X02', 0.45), s: 'git push --force origin main', cmd: true, dur: 0.6 },
    { t: S('G09_01') + 0.15, s: '{r}remote: error: GH006: Protected branch update failed' },
    { t: S('G09_01') + 0.3, s: '{r} ! [remote rejected] main -> main (protected branch)' },
  ]);
  const hit = S('G09_01'); let [sx, sy] = shake(t, hit, 18, 0.35);
  const rules = t >= S('G09_02') - 0.1;
  if (!rules) {
    ctx.save(); ctx.translate(sx, sy);
    terminal(t, 690, 120, 1170, 300, _ptT, { alpha: eOut(prog(t, blk.t0, 0.3)), fs: 27, accent: t >= hit ? '#ff3b5c' : '#ff7a3d', title: '终端 — Grok 的电脑' });
    if (t >= hit) { shield(1270, 640, popIn(t, hit, 0.3) * 1.15, t); flash(t, hit, 0.25, '255,120,120'); fancy('拦下！', 1600, 560, 100, t, hit + 0.1, FX.red); }
    ctx.restore();
  } else {
    const a = eOut(prog(t, S('G09_02') - 0.1, 0.3)); ctx.save(); ctx.globalAlpha = a;
    const cy = browser(680, 90, 1180, 640, 'github.com/dafeiyu/ai-zukan/settings/rules');
    txt('Branch ruleset：保护 main', 720, cy + 50, 36, '#24292f'); chip(1640, cy + 50, 1, 'Active', '#1f883d', '#fff', 24);
    [['合并前必须通过 Pull Request', 0.3], ['至少 1 人批准（Required approvals: 1）', 0.5], ['禁止强制推送（Block force pushes）', 0.72]].forEach((r, i) => {
      const y = cy + 140 + i * 90; box(720, y - 38, 1100, 76, 12, '#f6f8fa', '#d0d7de', 2); checkbox(760, y, t >= P('G09_02', r[1]), r[0]);
    });
    shield(1720, cy + 450, 0.55 * popIn(t, P('G09_02', 0.85)), t);
    ctx.restore();
    if (t >= S('G09_03')) fancy('规则面前，人人平等！', 1270, 880, 70, t, P('G09_03', 0.5), FX.blue);
  }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['X02', 'X03']); sfx(P('X02', 0.45) + 0.6, 'click', 0.6); sfx(S('G09_01'), 'impact', 1.0); sfx(S('G09_01') + 0.05, 'buzz', 0.6); sfx(S('G09_01') + 0.1, 'stamp', 0.5); [0.3, 0.5, 0.72].forEach(f => sfx(P('G09_02', f), 'ding', 0.4)); sfx(P('G09_03', 0.5), 'sparkle', 0.4); });

// ---- .gitignore ----
let _igT;
SC.ignore = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  if (!_igT) _igT = cmdLines([{ t: P('G10_04', 0.15), s: 'git rm --cached 录屏.mp4', cmd: true, dur: 0.6 }, { t: P('G10_04', 0.45), s: "{w}rm '录屏.mp4'" }]);
  const a = eOut(prog(t, blk.t0, 0.3)); const big = t >= S('G10_05') - 0.1 && t < S('B03') - 0.2;
  const ign = [null, P('G10_03', 0.62), P('G10_03', 0.3), null];
  ctx.save(); ctx.globalAlpha = a * (big ? 0.35 : 1);
  win(690, 110, 540, 470, '豆包的仓库', '#16a5c9');
  [['📄', 'doubao.md', '4 KB'], ['🎬', '录屏.mp4', '2.3 GB'], ['🔑', '.env', '1 KB'], ['📄', 'README.md', '2 KB']].forEach((r, i) => {
    const y = 220 + i * 86, bad = (i === 1 || i === 2), gone = ign[i] && t >= ign[i];
    ctx.save(); if (gone) ctx.globalAlpha *= 0.35;
    if (bad && !gone && t >= P('B02', 0.4)) { ctx.save(); ctx.globalAlpha *= 0.25 + 0.2 * Math.sin(t * 9); box(706, y - 36, 508, 72, 12, '#ff3b5c'); ctx.restore(); }
    txt(r[0], 720, y, 36, '#000', { font: '"Segoe UI Emoji","Noto Color Emoji",sans-serif', bold: false }); txt(r[1], 780, y, 32, '#ece9f7', { font: F_CODE }); txt(r[2], 1200, y, 26, bad ? '#ff6b81' : '#8f8aa8', { align: 'right' });
    ctx.restore(); if (gone) chip(1000, y, 1, '已忽略', '#5b4f8a', '#fff', 20);
  });
  if (t >= S('G10_02') - 0.1) {
    const ea = eOut(prog(t, S('G10_02') - 0.1, 0.3)); ctx.save(); ctx.globalAlpha *= ea;
    win(1250, 110, 610, 400, '.gitignore（新建）', '#ffd23f');
    const L = [['.env', P('G10_03', 0.15)], ['*.mp4', P('G10_03', 0.45)]];
    L.forEach((l, i) => { if (t < l[1]) return; const n = Math.floor(clamp((t - l[1]) / 0.3) * l[0].length); txt(l[0].slice(0, n), 1290, 220 + i * 70, 44, '#ffd36b', { font: F_CODE }); });
    if (t >= P('G10_03', 0.7)) txt('# 不让 Git 管的文件', 1290, 380, 28, '#8f8aa8', { font: F_CODE, bold: false });
    ctx.restore();
  }
  if (t >= S('G10_04') - 0.1) { terminal(t, 1250, 540, 610, 240, _igT, { alpha: eOut(prog(t, S('G10_04') - 0.1, 0.3)), fs: 26, accent: '#16a5c9', title: '终端' }); note(960, 690, popIn(t, P('G10_04', 0.55)), '文件还在电脑上 ✓', '#7cf07a', { fs: 30 }); }
  ctx.restore();
  if (big) {
    const s = popIn(t, S('G10_05') - 0.1); ctx.save(); ctx.translate(1270, 470); ctx.scale(s, s);
    box(-470, -300, 940, 600, 36, 'rgba(20,14,40,0.95)', '#ff3b5c', 8);
    txt('🔑 密码已经推上去了？', 0, -200, 54, '#fff', { align: 'center' });
    txt('① 马上改密码', -380, -60, 56, '#7cf07a', { font: F_FANCY, bold: false }); txt('② 再清理记录', -380, 60, 56, '#8f8aa8', { font: F_FANCY, bold: false });
    ctx.restore(); stamp(t, P('G10_05', 0.5), 1300, 680, '改密码 > 删记录', '#ff3b5c', 60, -0.08);
  }
  if (t < S('G10_02') - 0.1 && t >= S('G10_01')) fancy('密码和大文件，不进仓库！', 1270, 880, 64, t, P('G10_01', 0.3), FX.red);
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['B02', 'B03']); sfx(P('B02', 0.4), 'buzz', 0.5); sfx(P('G10_01', 0.3), 'stamp', 0.4); sfx(S('G10_02') - 0.1, 'swoosh_in', 0.4); typeSfx(P('G10_03', 0.15), 4, 0.3); typeSfx(P('G10_03', 0.45), 5, 0.3); sfx(P('G10_03', 0.3), 'pop', 0.4); sfx(P('G10_03', 0.62), 'pop', 0.4); sfx(P('G10_04', 0.55), 'ding', 0.4); sfx(S('G10_05') - 0.1, 'impact', 0.6); sfx(P('G10_05', 0.5), 'stamp', 0.7); });

// ---- Fork ----
function repoCard(x, y, w, h, who, name, col, o = {}) {
  box(x, y, w, h, 24, '#fff', col, 6); box(x, y, w, 70, [24, 24, 0, 0], col);
  txt(who, x + w / 2, y + 36, 32, '#fff', { align: 'center', font: F_FANCY, bold: false });
  txt('📦 ' + name, x + 30, y + 120, 30, '#0969da', { font: F_CODE });
}
SC.fork = (t, blk, en) => {
  bgLecture(t, '#a66bff'); lecturer(t, blk, en, blk.t0);
  const a = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha = a;
  const LX = 700, RX = 1360, Y = 150, CW = 500, CH = 330;
  repoCard(LX, Y, CW, CH, '别人的仓库', 'open-girls/zukan', '#57606a');
  chainRow(LX + 250, Y + 210, 3, { s: 0.36, gap: 90, c0: 3 });
  const click = P('G11_01', 0.35);
  ghButton(LX + 350, Y + 10, 130, 50, '⑂ Fork', '#24292f', { fs: 24, press: t > click && t < click + 0.1, glow: t < click ? 0.6 + 0.4 * Math.sin(t * 8) : 0 });
  if (t < click + 0.4) { const cp = eIO(prog(t, blk.t0 + 0.2, 0.4)); cursor(lerp(1100, LX + 415, cp), lerp(600, Y + 35, cp), 1.2, prog(t, click, 0.35)); }
  const cp = eOut(prog(t, click + 0.1, 0.5));
  if (cp > 0) {
    ctx.save(); ctx.translate(lerp(LX, RX, cp), lerp(Y + 40, Y, cp) - Math.sin(cp * Math.PI) * 60);
    repoCard(0, 0, CW, CH, '你的账号（副本）', 'dafeiyu/zukan', '#a66bff'); chainRow(250, 210, 3, { s: 0.36, gap: 90, c0: 3 });
    if (t >= S('G11_02')) { const bp = eOut(prog(t, P('G11_02', 0.05), 0.4)); seg(340, 210, 430, 270, '#ff7a3d', bp, 9); if (bp >= 1) commitNode(430, 270, 0.3, null, { col: '#ff7a3d' }); }
    ctx.restore();
  }
  if (t >= P('G11_02', 0.55)) {
    const p = eOut(prog(t, P('G11_02', 0.55), 0.5)); ctx.save(); ctx.strokeStyle = '#1f883d'; ctx.lineWidth = 12; ctx.setLineDash([22, 14]); ctx.lineDashOffset = -t * 60;
    ctx.beginPath(); const N = 30; for (let i = 0; i <= N * p; i++) { const u = i / N; const x = lerp(RX + 200, LX + 300, u), y = Y + CH + 20 + Math.sin(u * Math.PI) * 130; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
    if (p >= 1) { arrow(LX + 340, Y + CH + 40, LX + 300, Y + CH + 10, '#1f883d', 1, 12); pill(1280, Y + CH + 150, 'Pull Request →  原仓库', '#7cf07a', popIn(t, P('G11_02', 0.8)), { font: F_BODY, fs: 30 }); }
  }
  ctx.restore();
  if (t >= S('G11_03')) {
    const s1 = popIn(t, P('G11_03', 0.05)), s2 = popIn(t, P('G11_03', 0.3));
    note(990, 770, s1, '队友 → 用分支', '#3ec1ff', { fs: 40 }); note(1550, 770, s2, '外人 → 用 Fork', '#a66bff', { fs: 40 });
    fancy('最后都靠 PR 合并！', 1270, 900, 60, t, P('G11_03', 0.6), FX.green);
  }
};
SFX_FNS.push(() => { sfx(P('G11_01', 0.35), 'click', 0.6); sfx(P('G11_01', 0.4), 'whoosh', 0.5); sfx(P('G11_01', 0.85), 'pop', 0.4); sfx(P('G11_02', 0.05), 'pop', 0.4); sfx(P('G11_02', 0.55), 'whoosh', 0.4); sfx(P('G11_02', 0.8), 'ding', 0.4); sfx(P('G11_03', 0.05), 'pop', 0.4); sfx(P('G11_03', 0.3), 'pop', 0.4); sfx(P('G11_03', 0.6), 'sparkle', 0.4); });

// ---- 复习：流水线 ----
const PIPE = [['📋', 'Issue', '领任务'], ['🌿', '分支', 'switch -c'], ['⬆', 'push', '推分支'], ['🔀', 'PR', '请求合并'], ['🔍', '审查', 'Approve'], ['🟣', '合并', 'Merge'], ['⬇', 'pull', '大家同步']];
SC.recap = (t, blk, en) => {
  bgLecture(t, '#ffd23f'); lecturer(t, blk, en, blk.t0);
  const fr = [P('G12_01', 0.22), P('G12_01', 0.38), P('G12_01', 0.55), P('G12_01', 0.75), P('G12_02', 0.04), P('G12_02', 0.16), P('G12_02', 0.3)];
  const y = 400, x0 = 745, dx = 172;
  box(700, y - 20, 1180, 40, 20, '#2a2350', '#fff', 4);
  ctx.save(); ctx.beginPath(); rr(704, y - 16, 1172, 32, 16); ctx.clip(); ctx.strokeStyle = '#4a3f80'; ctx.lineWidth = 6; for (let i = -2; i < 30; i++) { const xx = 700 + i * 50 + (t * 120) % 50; ctx.beginPath(); ctx.moveTo(xx, y - 20); ctx.lineTo(xx - 20, y + 20); ctx.stroke(); } ctx.restore();
  let lit = -1; PIPE.forEach((p, i) => {
    const on = t >= fr[i]; if (on) lit = i; const x = x0 + i * dx; const s = popIn(t, fr[i]);
    ctx.save(); ctx.translate(x, y - 110); const sc = on ? s : 0.85; ctx.scale(sc, sc); ctx.globalAlpha *= on ? 1 : 0.4;
    box(-78, -70, 156, 140, 26, on ? '#fff' : '#3a3358', on ? '#ffd23f' : '#5b4f8a', 6);
    txt(p[0], 0, -22, 48, '#000', { align: 'center', font: '"Segoe UI Emoji","Noto Color Emoji",sans-serif', bold: false }); txt(p[1], 0, 38, 32, on ? '#1b1433' : '#ccc', { align: 'center' });
    ctx.restore(); if (on) txt(p[2], x, y + 60, 24, '#ece9f7', { align: 'center', font: /[a-z]/.test(p[2]) ? F_CODE : F_BODY });
  });
  if (lit >= 0) { const xi = x0 + Math.min(lit, 6) * dx; docIcon(xi, y - 6, 0.38, '', '#ff7a3d'); }
  if (t < S('G12_02')) fancy('联机流水线', 1270, 180, 76, t, P('G12_01', 0.08), FX.yel);
  const s1 = popIn(t, P('G12_02', 0.55)), s2 = popIn(t, P('G12_02', 0.78));
  if (s1 > 0) { shield(1060, 690, 0.6 * s1, t); note(1060, 830, s1, '保护 main', '#3ec1ff', { fs: 34 }); }
  if (s2 > 0) { shield(1480, 690, 0.6 * s2, t); note(1480, 830, s2, '.gitignore', '#ff7a3d', { fs: 34 }); }
  if (s1 > 0) fancy('两道保险', 1270, 180, 76, t, P('G12_02', 0.5), FX.blue);
};
SFX_FNS.push(() => { [P('G12_01', 0.22), P('G12_01', 0.38), P('G12_01', 0.55), P('G12_01', 0.75), P('G12_02', 0.04), P('G12_02', 0.16), P('G12_02', 0.3)].forEach(x => sfx(x, 'ding', 0.35)); sfx(P('G12_02', 0.55), 'impact', 0.5); sfx(P('G12_02', 0.78), 'impact', 0.5); });

// ---- 实战：用 Kimi 的介绍页走一遍 ----
let _prT;
SC.practice = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  if (!_prT) _prT = cmdLines([
    { t: P('G13_02', 0.3), s: 'git switch main', cmd: true, dur: 0.35 },
    { t: P('G13_02', 0.6), s: 'git pull', cmd: true, dur: 0.25 },
    { t: P('G13_02', 0.8), s: '{w}Updating 3c4d5e6..7a8b9c0' },
    { t: P('G13_03', 0.3), s: 'git switch -c kimi-page', cmd: true, dur: 0.5 },
    { t: P('G13_03', 0.7), s: "{g}Switched to a new branch {y}'kimi-page'" },
    { t: P('G13_04', 0.08), s: 'git add .', cmd: true, dur: 0.3 },
    { t: P('G13_04', 0.2), s: 'git commit -m "添加 Kimi 介绍页"', cmd: true, dur: 0.6 },
    { t: P('G13_04', 0.42), s: '{y}[kimi-page 1f2e3d4]{w} 添加 Kimi 介绍页' },
    { t: P('G13_04', 0.6), s: 'git push -u origin kimi-page', cmd: true, dur: 0.6 },
    { t: P('G13_04', 0.88), s: '{g} * [new branch]{w}  kimi-page' },
    { t: P('G13_06', 0.05), s: 'git switch main && git pull', cmd: true, dur: 0.5 },
    { t: P('G13_06', 0.4), s: '{w} members/kimi.md | 9999 {g}++++++++' },
  ]);
  const steps = [['拉最新', S('G13_02')], ['开分支', S('G13_03')], ['写+提交', S('K02')], ['推送', P('G13_04', 0.6)], ['PR+审查', S('G13_05')], ['合并+pull', P('G13_05', 0.6)]];
  const end = S('G13_06') + D('G13_06') * 0.55;
  steps.forEach((s, i) => {
    const a = popIn(t, blk.t0 + 0.15 + i * 0.08); if (a <= 0) return;
    const x = 770 + i * 200, y = 88; const act = t < end && t >= s[1] && (i === 5 || t < steps[i + 1][1]); const done = t >= end || (i < 5 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1));
    box(-92, -34, 184, 68, 20, act ? '#ff7a3d' : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act ? '✓' : (i + 1)) + ' ' + s[0], 0, 2, 26, '#fff', { align: 'center' }); ctx.restore();
  });
  const ta = eOut(prog(t, blk.t0, 0.3));
  terminal(t, 676, 160, 640, 700, _prT, { alpha: ta, fs: 21, accent: '#ff7a3d', title: '终端 — Kimi 的电脑' });
  // 右侧：先是 kimi.md 预览，开 PR 后变成 PR 页面
  const prOn = t >= S('G13_05') - 0.1;
  ctx.save(); ctx.globalAlpha = ta;
  if (!prOn) {
    win(1330, 160, 560, 700, 'members/kimi.md', '#34407a');
    const nL = t < S('K02') ? 2 : 2 + Math.floor(clamp((t - S('K02')) / D('K02')) * 40);
    for (let i = 0; i < Math.min(nL, 13); i++) { const ly = 250 + i * 44; box(1370, ly - 10, 380 + rnd(i + Math.floor(nL / 13) * 7) * 100, 18, 9, i < 2 ? '#c9a6ff' : '#4a4470'); }
    if (t >= S('K02')) { pill(1610, 820, `第 ${Math.min(88, Math.max(1, Math.floor(nL * 2.2)))} 页 / 共 88 页`, '#ffd23f', popIn(t, S('K02')), { font: F_BODY, fs: 24 }); }
  } else {
    const cy = browser(1330, 160, 560, 700, 'ai-zukan/pull/12', { title: 'PR' });
    txt('添加 Kimi 介绍页 #12', 1360, cy + 40, 30, '#24292f');
    txt('Closes #6', 1360, cy + 96, 30, '#0969da', { font: F_CODE });
    if (t >= P('G13_05', 0.4)) { avatar('C', 1390, cy + 170, 26, { s: popIn(t, P('G13_05', 0.4)) }); txt('Claude', 1430, cy + 170, 26, '#24292f'); chip(1540, cy + 170, 1, '✓ Approved', '#1a7f37', '#fff', 22); }
    const merged = t >= P('G13_05', 0.62);
    ghButton(1360, cy + 240, 300, 56, merged ? '⑂ Merged' : 'Merge pull request', merged ? '#8250df' : '#1f883d', { fs: 24 });
    if (t >= P('G13_05', 0.82)) ghButton(1360, cy + 320, 260, 52, '✓ 分支已删除', '#8c959f', { fs: 22 });
    if (t >= P('G13_05', 0.62)) chip(1360, cy + 410, popIn(t, P('G13_05', 0.62)), '#6 已自动关闭', '#8250df', '#fff', 24);
  }
  ctx.restore();
  if (t < S('G13_02')) fancy('实战开始！', 1280, 500, 110, t, P('G13_01', 0.3), Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.7 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const bs = popIn(t, end + 0.05, 0.4); ctx.save(); ctx.translate(1270, 450); ctx.scale(bs, bs); ctx.rotate(-0.04);
    box(-170, -210, 340, 420, 20, '#ff7a3d', '#fff', 8); box(-150, -190, 300, 380, 12, '#fff3e6');
    txt('AI娘', 0, -80, 64, '#ff7a3d', { align: 'center', font: F_FANCY, bold: false }); txt('图鉴', 0, 20, 86, '#1b1433', { align: 'center', font: F_FANCY, bold: false }); txt('第 1 版', 0, 130, 30, '#8f8aa8', { align: 'center' });
    ctx.restore();
    ['D', 'Q', 'C', 'M', 'X', 'B', 'K'].forEach((k, i) => { const ang = Math.PI * (1.05 + i * 0.15); avatar(k, 1270 + Math.cos(ang) * 420, 470 + Math.sin(ang) * 300 + 120, 52, { s: popIn(t, end + 0.2 + i * 0.05) }); });
    fancy('七个人，一本图鉴！', 1270, 840, 76, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1270, 450);
  }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['K02', 'Q03']); const b = BK.practice; [0, 1, 2, 3, 4, 5].forEach(i => sfx(b.t0 + 0.15 + i * 0.08, 'pop', 0.3)); sfx(P('G13_01', 0.3), 'impact', 0.6); sfx(P('G13_02', 0.8), 'ding', 0.3); sfx(P('G13_04', 0.88), 'ding', 0.4); sfx(S('G13_05') - 0.1, 'swoosh_in', 0.4); sfx(P('G13_05', 0.4), 'ding', 0.4); sfx(P('G13_05', 0.62), 'stamp', 0.6); const end = S('G13_06') + D('G13_06') * 0.55; sfx(end, 'impact', 0.6); sfx(end + 0.4, 'confetti', 0.6); });

// ---- 预告 + 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#a66bff');
  const outro = E('G14_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G14_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G14_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 130, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G14_01', 0.15), 0.5);
    if (bp > 0) { // 药瓶
      ctx.save(); ctx.translate(1260, 450); ctx.scale(bp, bp); ctx.rotate(Math.sin(t * 3) * 0.05);
      box(-110, -150, 220, 300, 50, '#ff8fb3', '#fff', 10); box(-80, -200, 160, 70, 16, '#7c5cff', '#fff', 8);
      box(-90, -40, 180, 110, 14, '#fff'); txt('后悔药', 0, 15, 50, '#ff5c8a', { align: 'center', font: F_FANCY, bold: false }); ctx.restore();
    }
    [['commit --amend', -470, 330, 0.35], ['git stash', 470, 300, 0.5], ['git reset', -430, 600, 0.62], ['git revert', 450, 620, 0.72]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G14_01', c[3])), { fs: 34 }));
    fancy('Git 后悔药大全', 1260, 820, 84, t, P('G14_01', 0.75), FX.pink);
  }
  if (ot > 0) {
    ctx.fillStyle = `rgba(10,8,22,${0.78 * ot})`; ctx.fillRect(...OS);
    [['👍', '点赞', '#ff5c8a'], ['🪙', '投币', '#ffd23f'], ['⭐', '收藏', '#3ec1ff']].forEach((ic, i) => {
      const a = popIn(t, S('G14_02') + 0.4 + i * 0.32, 0.4); if (a <= 0) return;
      const x = W / 2 + (i - 1) * 330, y = 440;
      ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(t * 5 + i) * 0.06);
      ctx.fillStyle = ic[2]; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.font = `110px "Segoe UI Emoji","Noto Color Emoji",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic[0], 0, 8); ctx.restore();
      fancy(ic[1], x, y + 180, 60, t, S('G14_02') + 0.5 + i * 0.32, { c1: '#fff', c2: '#eee', stroke: ic[2] });
    });
    fancy('一键三连，下集见！', W / 2, 180, 96, t, S('G14_02') + 1.4, { stagger: 0.04 });
    if (t > outro) {
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_leader', 1690, H + 40, 600, { scale: sa }); }
      SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音', W / 2, 930);
    ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
    ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G14_01', 0.15), 'pop', 0.6); [0.35, 0.5, 0.62, 0.72].forEach(f => sfx(P('G14_01', f), 'pop', 0.4)); sfx(P('G14_01', 0.75), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G14_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G14_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_leader', P('G02_02', 0.15), P('G02_02', 0.6)], ['d_sparkle', P('G05_02', 0.4), E('G05_02')], ['d_relief', P('G07_01', 0.6), E('G07_01')],
  ['d_shock', P('G08_02', 0.5), E('G08_02')], ['d_leader', P('G09_01', 0.2), E('G09_01')], ['d_shock', P('G10_01', 0.3), E('G10_01')],
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
['branch', 'conflict', 'protect', 'ignore', 'practice'].forEach(k => { const b = BK[k]; b.entries.filter(e => e.k === 'v').map(e => e.vo + 0.3).forEach(tt => { ctx.save(); try { SC[k](tt, b, b.entries[b.entries.length - 1]); } catch (e) { console.error(e); } ctx.restore(); }); });
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
