// AI娘 Git课 · 第7集 渲染引擎 —— renderAt(t) 纯函数，逐帧确定性导出（通用部分沿用第1集）
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const F_FANCY = '"Smiley", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const F_BODY = '"Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const F_CODE = 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", "Microsoft YaHei", "Noto Sans CJK SC", monospace';

// ================= 素材 =================
const SPR = {};
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'g_cheer', 'g_warn', 'g_think', 'g_shock', 'g_proud', 'g_type', 'g_peace', 'g_awkward', 'g_present', 'd_panic', 'd_curious', 'd_happy', 'd_raise', 'd_think', 'd_shock', 'd_sparkle', 'd_ok', 'd_relief', 'd_leader', 'q_base', 'q_point', 'q_tea', 'c_base', 'c_ok', 'c_cool', 'm_base', 'm_panic', 'm_cheeky', 'x_base', 'x_angry', 'x_force', 'b_base', 'b_sorry', 'k_base', 'k_read', 'g_pill', 'd_pill', 'm_oops', 'q_alarm', 'b_wave', 'x_panic', 'k_diary', 'c_read', 'g_tag', 'd_party', 'b_proud', 'm_tag', 'x_thumb', 'k_scroll', 'g_web', 'd_phone', 'm_photo', 'x_doubt', 'b_point', 'g_check', 'd_robot', 'm_clock', 'c_lock', 'b_badge'];
// 竖版立绘只显示上半身：显示高度占整张图的比例（头顶到腰）
const SPRC = { d_panic: 0.55, d_curious: 0.55, d_happy: 0.55, d_sparkle: 0.6, d_ok: 0.66, d_raise: 0.72, d_think: 0.7, d_relief: 0.82, d_shock: 0.82, d_leader: 0.7, q_base: 0.6, q_point: 0.6, q_tea: 0.6, c_base: 0.58, c_ok: 0.58, c_cool: 0.58, m_base: 0.62, m_panic: 0.6, m_cheeky: 0.62, x_base: 0.6, x_angry: 0.6, x_force: 0.66, b_base: 0.62, b_sorry: 0.62, k_base: 0.6, k_read: 0.6, d_pill: 0.6, m_oops: 0.62, q_alarm: 0.6, b_wave: 0.62, x_panic: 0.62, k_diary: 0.6, c_read: 0.58, d_party: 0.68, b_proud: 0.6, m_tag: 0.62, x_thumb: 0.66, k_scroll: 0.62, d_phone: 0.66, m_photo: 0.6, x_doubt: 0.62, b_point: 0.62, d_robot: 0.66, m_clock: 0.62, c_lock: 0.6, b_badge: 0.62 };
const loadImg = n => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });


// ================= 台词（由 subtitles.json 生成，改台词请改 _gen_script.py）=================
const TEXT = {
  D01: "我推送了一版白饭页，标签没关好，整个页面全乱了……同学都看见了！",
  G01_01: "每次推送前都自己检查？太累了。交给 GitHub Actions：每次推送，GitHub 借你一台云电脑，按你写的任务单自动干活。",
  G01_02: "就像游戏里的自动挂机：规则写好一次，以后每次存档上传，它都自己跑一遍。",
  G01_03: "欢迎来到 AI娘 Git 课，第七集，GitHub Actions！",
  D02: "任务单写在哪？要装什么软件吗？",
  G02_01: "什么都不用装：在仓库里新建 .github/workflows/check.yml，文件夹名一个字母都不能错。",
  G02_02: "name 给任务单起名字；on 写什么时候干活，写 push，就是每次推送都跑。",
  G02_03: "jobs 下面是任务；runs-on 选云电脑，ubuntu-latest 就是最新版的 Linux。",
  G02_04: "steps 是一步一步的步骤：uses 借用现成的动作，比如 actions/checkout，先把代码拉到云电脑上。",
  G02_05: "run 就是直接跑命令，比如 npx html-validate index.html，检查网页标签有没有关好。",
  G02_06: "文件推送上去，打开仓库的 Actions 标签页，就能看到它开始跑了。",
  K01: "我把 YAML 文档读完了。关键：层级全靠缩进，只能用空格，不能用 Tab。",
  D03: "难怪我的任务单报错……我用了 Tab！",
  K02: "一句话：同一层左边对齐，只用空格。",
  X01: "我推送完，提交旁边多了个红叉。这是真的吗？",
  D04: "红叉？是把仓库弄坏了吗？",
  G03_01: "是真的，但仓库没坏：红叉只是说检查没通过。黄点是正在跑，绿勾是通过。",
  G03_02: "点进 Actions，打开红叉那一次，展开报错的那一步，日志会写出错在哪一行。",
  G03_03: "修好再推送，它会自动再跑一遍；失败的时候，GitHub 还会发邮件提醒你。",
  X02: "第十二行少了个结束标签。补上，绿勾。是真的。",
  G03_04: "公开仓库用这些云电脑不要钱；私有仓库每月也有两千分钟免费额度。",
  Q01: "用户反馈：有人给白饭页提了 PR，能不能合并之前先自动检查？",
  D05: "对哦，上次就是合并完才发现坏了！",
  G04_01: "on 里再加一个 pull_request：PR 页面下面就会显示检查结果，绿勾了再合并。",
  G04_02: "再加一个 workflow_dispatch，Actions 页面会多一个 Run workflow 按钮，随时手动跑一次。",
  G04_03: "push 和 pull_request 写在一起：自己推送查一遍，别人提 PR 也查一遍。",
  Q02: "PR 下面亮绿勾了，用户说可以放心合并。",
  M01: "喵？我设了每天早上八点自动检查，结果下午四点才跑！",
  D06: "又是 Gemini 的时间……这次是几几年？",
  G05_01: "schedule 用 cron 写时间，默认按 UTC 算，比北京时间慢八个小时。",
  G05_02: "要北京时间八点，就写零点；或者在下面加一行 timezone: Asia/Shanghai。",
  G05_03: "最短五分钟一次；整点跑的人多，可能会晚一点，挑个零碎的分钟更稳。",
  M02: "原来不是我的时间错了，是时差的锅！",
  G05_04: "还有两点：定时只在默认分支上跑；公开仓库六十天没动静，定时会被自动暂停。",
  C01: "慢着。你要把部署密钥直接写进任务单？仓库是公开的，谁都看得见。",
  D07: "那……密钥该放哪？",
  G06_01: "放进 Settings → Secrets and variables → Actions，点 New repository secret 新建一个。",
  G06_02: "任务单里写 ${{ secrets.DEPLOY_KEY }} 来取；日志里只会显示三个星号。",
  C02: "密钥不进代码，日志自动打码。批准。",
  B01: "家人们！我想在 README 上挂个绿色的“检查通过”牌子，一看就靠谱！",
  D08: "我也要！要绿色的！",
  G07_01: "在 Actions 里点开这个工作流，右上角三个点，Create status badge，复制那一行贴进 README。",
  G07_02: "检查通过它就是绿色的 passing，失败就变红，访客一眼就知道。",
  B02: "牌子挂上了，家人们放心点赞！",
  D09: "信息量好大……帮我划个重点！",
  G08_01: "写：.github/workflows 里放 yml；on、jobs、steps，缩进只用空格。",
  G08_02: "看：黄点在跑，绿勾通过，红叉就点进 Actions 看日志。",
  G08_03: "管：PR 前自动检查，定时记得 UTC，密钥放 Secrets，别写进代码。",
  D10: "我现在就给白饭页装上自动检查！",
  G09_01: "新建 .github/workflows/check.yml：push 和 PR 都触发，先 checkout，再用 html-validate 检查首页。",
  G09_02: "提交、推送，Actions 里黄点转起来……红叉！日志说第十二行，div 没关。",
  G09_03: "补上结束标签，再推送：绿勾！Pages 也跟着自动部署了。",
  G09_04: "再加上手动按钮和徽章，README 上亮起绿色的 passing。",
  G09_05: "以后谁推送了坏页面，红叉马上提醒，同学还没看到就修好了。",
  D11: "白饭页有自己的检查机器人了！",
  G10_01: "下集预告：提交历史乱成一团？用 git rebase 把它整理干净！",
  G10_02: "喜欢的话记得一键三连，我们下集见！",
};
const DUR = Object.assign({}, window.DUR || {});

// ================= 时间轴 =================
const V = (b, id, pose) => ({ k: 'v', b, id, pose });
const BEAT = (b, d) => ({ k: 'beat', b, d: b === 'teaser' ? d * 0.75 : d * 0.35 });
const CH_COL = ['#7c5cff', '#3ec1ff', '#22c08b', '#ffb020', '#ff5c8a', '#ff7a3d', '#a66bff', '#ffd23f'];
const PLAN = [
  V('cold', 'D01', 'd_panic'),
  V('why', 'G01_01', 'g_explain'), V('why', 'G01_02', 'g_wink'),
  V('title', 'G01_03', 'g_cheer'), BEAT('title', 1.4),
  V('wfQ', 'D02', 'd_think'),
  V('workflow', 'G02_01', 'g_point'), V('workflow', 'G02_02', 'g_type'), V('workflow', 'G02_03', 'g_explain'), V('workflow', 'G02_04', 'g_present'), V('workflow', 'G02_05', 'g_check'), V('workflow', 'G02_06', 'g_point'),
  V('yamlQ', 'K01', 'k_read'), V('yamlQ', 'D03', 'd_shock'), V('yamlQ', 'K02', 'k_scroll'),
  V('redQ', 'X01', 'x_doubt'), V('redQ', 'D04', 'd_panic'),
  V('run', 'G03_01', 'g_explain'), V('run', 'G03_02', 'g_point'), V('run', 'G03_03', 'g_type'), V('run', 'X02', 'x_thumb'), V('run', 'G03_04', 'g_wink'),
  V('prQ', 'Q01', 'q_alarm'), V('prQ', 'D05', 'd_curious'),
  V('trigger', 'G04_01', 'g_check'), V('trigger', 'G04_02', 'g_type'), V('trigger', 'G04_03', 'g_explain'), V('trigger', 'Q02', 'q_point'),
  V('cronQ', 'M01', 'm_clock'), V('cronQ', 'D06', 'd_relief'),
  V('schedule', 'G05_01', 'g_think'), V('schedule', 'G05_02', 'g_explain'), V('schedule', 'G05_03', 'g_warn'), V('schedule', 'M02', 'm_cheeky'), V('schedule', 'G05_04', 'g_think'),
  V('secQ', 'C01', 'c_lock'), V('secQ', 'D07', 'd_raise'),
  V('secrets', 'G06_01', 'g_point'), V('secrets', 'G06_02', 'g_explain'), V('secrets', 'C02', 'c_ok'),
  V('badgeQ', 'B01', 'b_badge'), V('badgeQ', 'D08', 'd_sparkle'),
  V('badge', 'G07_01', 'g_present'), V('badge', 'G07_02', 'g_proud'), V('badge', 'B02', 'b_wave'),
  V('ask8', 'D09', 'd_happy'),
  V('recap', 'G08_01', 'g_present'), V('recap', 'G08_02', 'g_explain'), V('recap', 'G08_03', 'g_proud'),
  V('askP', 'D10', 'd_leader'),
  V('practice', 'G09_01', 'g_cheer'), V('practice', 'G09_02', 'g_awkward'), V('practice', 'G09_03', 'g_check'), V('practice', 'G09_04', 'g_type'), V('practice', 'G09_05', 'g_proud'), V('practice', 'D11', 'd_robot'),
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
// ================= 第7集：GitHub Actions =================
Object.assign(SQ.Q, { role: '用户反馈' }); Object.assign(SQ.C, { role: '安全审查' }); Object.assign(SQ.M, { role: '定时任务' });
Object.assign(SQ.X, { role: '推送' }); Object.assign(SQ.B, { role: '展示' }); Object.assign(SQ.K, { role: '读文档' });
const ACC = '#2088ff', OKC = '#1f883d', BADC = '#cf222e', RUNC = '#d4a72c', WEBC = '#3ec1ff', LIVEC = '#1a7f37';
// 普通网站窗口（没有 GitHub 顶栏）：返回内容区顶部 y
function siteWin(x, y, w, h, url, o = {}) {
  win(x, y, w, h, o.title || '浏览器', o.accent || WEBC, { bg: '#ffffff', bar: '#e9e6f3' });
  box(x + 20, y + 68, w - 40, 50, 25, '#f2f0f8', '#d6d1e6', 2);
  txt('🔒 ' + url, x + 44, y + 94, o.ufs || 26, '#555', { font: F_CODE, bold: false, max: w - 120 });
  if (o.reload != null) { ctx.save(); ctx.translate(x + w - 56, y + 94); ctx.rotate(o.reload * Math.PI * 2); ctx.strokeStyle = '#7c5cff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 13, 0.3, 5.6); ctx.stroke(); ctx.restore(); }
  return y + 130;
}
// 白饭页本体（cx 中心，y 顶部，w 宽）；o.broken：标签没关好，排版全乱
function baifanPage(cx, y, w, o = {}) {
  const s = w / 700; ctx.save(); ctx.translate(cx, y); ctx.scale(s, s);
  if (o.broken) {
    box(-350, 0, 700, 90, 0, '#ffe9c7'); ctx.save(); ctx.rotate(0.05); txt('🍚 白饭页', -60, 50, 52, '#7a3d00', { align: 'center', font: F_FANCY, bold: false }); ctx.restore();
    ctx.save(); ctx.rotate(-0.08); ['首页', '今日推荐菜', '关于'].forEach((n, i) => chip(-320 + i * 90, 150 + i * 46, 1, n, ['#ff7a3d', '#22c08b', '#7c5cff'][i], '#fff', 26)); ctx.restore();
    txt('<div class="dish">番茄炒蛋盖饭', -330, 310, 28, BADC, { font: F_CODE, max: 660 });
    ctx.save(); ctx.rotate(0.12); box(30, 120, 300, 120, 14, '#fffaf0', '#ffd6a0', 3); txt('今日推荐菜', 60, 160, 26, '#b85c00', {}); ctx.restore();
    ctx.restore(); return;
  }
  box(-350, 0, 700, 90, 0, '#ffe9c7'); txt(o.title || '🍚 白饭页', 0, 46, 52, '#7a3d00', { align: 'center', font: F_FANCY, bold: false });
  ['首页', '今日推荐菜', '关于'].forEach((n, i) => chip(-300 + i * 200, 130, 1, n, ['#ff7a3d', '#22c08b', '#7c5cff'][i], '#fff', 26));
  box(-310, 180, 370, 150, 18, '#fffaf0', '#ffd6a0', 3); txt('今日推荐菜', -290, 212, 26, '#b85c00', {});
  txt(o.dish || '番茄炒蛋盖饭', -290, 262, o.dishFs || 34, '#1b1433', { max: 340 });
  if (o.badge) badgeSvg(200, 255, 1.1, 'check', 'passing', '#2ea44f');
  else for (let i = 0; i < 3; i++) box(90, 190 + i * 44, 180 + rnd(i + 7) * 40, 20, 10, '#e4dff5');
  ctx.restore();
}
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
// 云电脑
function cloudPC(x, y, s, t, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1b1433'; ctx.lineWidth = 7; ctx.beginPath();
  ctx.arc(-90, 20, 70, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(-10, -50, 90, Math.PI, Math.PI * 1.9); ctx.arc(100, 10, 80, Math.PI * 1.4, Math.PI * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
  box(-70, -40, 140, 96, 10, '#1b1730', '#1b1433', 5); box(-24, 58, 48, 14, 4, '#1b1433');
  if (o.st != null) statusIcon(0, 8, 30, o.st, t); else txt('⚙️', 0, 8, 54, '#000', { align: 'center', font: EMOJI, bold: false });
  ctx.restore();
}
// 网址/路径拆解：segs = [[文字, 颜色, 说明]]
function urlParts(cx, y, s, segs, fs = 64) {
  if (s <= 0) return; ctx.save(); ctx.translate(cx, y); ctx.scale(s, s); ctx.font = `bold ${fs}px ${F_CODE}`;
  const ws = segs.map(g => ctx.measureText(g[0]).width), tot = ws.reduce((a, b) => a + b, 0); let x = -tot / 2;
  box(-tot / 2 - 40, -fs, tot + 80, fs * 2, 24, 'rgba(15,12,31,0.95)', '#fff', 5);
  segs.forEach((g, i) => { txt(g[0], x, 2, fs, g[1], { font: F_CODE }); if (g[2]) { ctx.strokeStyle = g[1]; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 6, fs * 0.82); ctx.lineTo(x + ws[i] - 6, fs * 0.82); ctx.stroke(); note(x + ws[i] / 2, fs * 1.75, 1, g[2], g[1], { fs: 30 }); } x += ws[i]; });
  ctx.restore();
}
// 邮件提醒
function mailCard(x, y, s, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0.04);
  box(-210, -80, 420, 160, 18, '#fff', '#1b1433', 5); txt('✉️', -150, 0, 70, '#000', { align: 'center', font: EMOJI, bold: false });
  txt('Run failed', -90, -28, 30, BADC, { font: F_CODE }); txt('check · main', -90, 14, 24, '#57606a', { font: F_CODE, bold: false }); txt('GitHub 邮件提醒', -90, 50, 22, '#57606a', { bold: false });
  ctx.restore();
}

// ---- 冷开场：坏页面推上去了 ----
SC.cold = (t, blk) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, P('D01', 0.4), 10, 0.35); ctx.translate(sx, sy);
  bgBurst(t, '#8c1f3a', '#d0485e', W * 0.62, H * 0.5, 22, 0.35);
  const wa = eBack(prog(t, t0 + 0.05, 0.4));
  ctx.save(); ctx.translate(1390, 470); ctx.scale(wa, wa); ctx.rotate(-0.02); ctx.translate(-1390, -470);
  const cy = siteWin(960, 100, 860, 640, 'dafeiyu.github.io/baifan', { title: '同学的手机', ufs: 24 });
  const br = t >= P('D01', 0.38); baifanPage(1390, cy + 20, 800, { broken: br });
  if (br) { flash(t, P('D01', 0.38), 0.15, '255,80,100'); stamp(t, P('D01', 0.42), 1560, 640, '<div> 没关！', BADC, 54, -0.1); }
  ctx.restore();
  [['哈哈哈', 1720, 200, 0.55, '#ff5c8a'], ['页面炸了？', 1100, 820, 0.64, '#7c5cff'], ['😂😂', 1700, 820, 0.72, '#22a06b']].forEach(q => { const s = popIn(t, P('D01', q[3])); if (s > 0) note(q[1], q[2], s, q[0], q[4], { fs: 40, rot: -0.06 }); });
  const p = spring(prog(t, t0, 0.9));
  sprite('d_panic', 480, H + 40, 980, { scale: lerp(1.3, 1, p) });
  fancy('页面全乱了！', 470, 160, 88, t, U.D01.vo + 0.05, { rot: -0.08, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
  if (t >= P('D01', 0.8)) fancy('同学都看见了……', 1390, 960, 64, t, P('D01', 0.8), Object.assign({ rot: -0.03 }, FX.white));
};
SFX_FNS.push(() => { sfx(BK.cold.t0 + 0.05, 'swoosh_in', 0.5); sfx(P('D01', 0.38), 'impact', 0.6); sfx(P('D01', 0.42), 'stamp', 0.6); [0.55, 0.64, 0.72].forEach(f => sfx(P('D01', f), 'boing', 0.3)); sfx(P('D01', 0.8), 'buzz', 0.3); });

// ---- 引入：云电脑按任务单干活；自动挂机 ----
SC.why = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const sw = S('G01_02') - 0.2, a1 = 1 - eIO(prog(t, sw, 0.35));
  if (a1 > 0) { ctx.save(); ctx.globalAlpha = a1;
    const ps = popIn(t, blk.t0 + 0.1); if (ps > 0) { ctx.save(); ctx.translate(880, 300); ctx.scale(ps, ps); box(-150, -60, 300, 120, 24, '#0f0c1f', '#7cf07a', 5); txt('git push', 0, 2, 40, '#fff', { align: 'center', font: F_CODE }); ctx.restore(); }
    const ckt = P('G01_01', 0.15); if (t < ckt + 0.5) { const q = popIn(t, blk.t0 + 0.3); if (q > 0) { txt('🥱 每次都自己检查？', 880, 470, 36 * q, '#fff', { align: 'center' }); if (t >= ckt) bigX(880, 470, 60, '#ff3b5c', prog(t, ckt, 0.3)); } }
    arrow(1050, 300, 1220, 300, ACC, eOut(prog(t, P('G01_01', 0.3), 0.4)), 16);
    cloudPC(1430, 300, popIn(t, P('G01_01', 0.32), 0.45), t, { st: t >= P('G01_01', 0.8) ? 1 : 0 });
    const ls = popIn(t, P('G01_01', 0.55), 0.4); if (ls > 0) { ctx.save(); ctx.translate(1430, 640); ctx.scale(ls, ls); box(-260, -150, 520, 300, 20, '#fffaf0', '#1b1433', 6); txt('📋 任务单', -230, -108, 34, '#1b1433', {});
      ['拉代码', '检查网页', '自动部署'].forEach((k, i) => { const on = t >= P('G01_01', 0.62 + i * 0.08); box(-230, -62 + i * 66, 40, 40, 8, on ? OKC : '#fff', '#1b1433', 3); if (on) txt('✓', -210, -40 + i * 66, 32, '#fff', { align: 'center' }); txt(k, -170, -42 + i * 66, 32, '#1b1433', {}); });
      ctx.restore(); }
    if (t >= P('G01_01', 0.8)) sparkle(t, P('G01_01', 0.8), 1430, 300, 180, 10);
    ctx.restore();
  }
  if (t >= sw) { // 自动挂机
    const a = eOut(prog(t, sw, 0.35)); ctx.save(); ctx.globalAlpha = a;
    const on = t >= P('G01_02', 0.25);
    ctx.save(); ctx.translate(1270, 330); ctx.scale(eBack(prog(t, sw, 0.45)), eBack(prog(t, sw, 0.45)));
    box(-380, -170, 760, 340, 40, '#2a2350', '#fff', 7); txt('🎮', -270, -20, 120, '#000', { align: 'center', font: EMOJI, bold: false });
    box(-110, -70, 420, 120, 60, on ? '#22c08b' : '#4a4370', '#fff', 6); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(on ? 250 : -50, -10, 46, 0, 7); ctx.fill();
    txt(on ? 'AUTO ON' : 'AUTO', on ? 30 : 160, -10, 46, '#fff', { align: 'center', font: F_CODE });
    txt('自动挂机', 100, 110, 40, '#ffd23f', { align: 'center' }); ctx.restore();
    [0, 1, 2].forEach(i => { const s = popIn(t, P('G01_02', 0.5 + i * 0.1)); if (s <= 0) return; ctx.save(); ctx.translate(900 + i * 370, 700); ctx.scale(s, s);
      box(-150, -70, 300, 140, 22, '#fff', OKC, 5); txt('💾 存档 ' + (i + 1), -40, -18, 32, '#1b1433', { align: 'center' }); txt('⬆ 上传', -40, 28, 28, '#57606a', { align: 'center', bold: false }); statusIcon(100, 0, 30, 1, t); ctx.restore(); });
    if (t >= P('G01_02', 0.3)) pill(1270, 120, '规则写一次 · 每次自动跑', '#ffd23f', popIn(t, P('G01_02', 0.3)), { fs: 40, font: F_BODY });
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.why; sfx(b.t0 + 0.1, 'pop', 0.4); sfx(P('G01_01', 0.15), 'buzz', 0.4); sfx(P('G01_01', 0.3), 'whoosh', 0.4); sfx(P('G01_01', 0.32), 'pop', 0.5); sfx(P('G01_01', 0.55), 'pop', 0.4);
  [0, 1, 2].forEach(i => sfx(P('G01_01', 0.62 + i * 0.08), 'ding', 0.3)); sfx(P('G01_01', 0.8), 'sparkle', 0.5);
  sfx(S('G01_02') - 0.2, 'swoosh_in', 0.4); sfx(P('G01_02', 0.25), 'click', 0.7); sfx(P('G01_02', 0.3), 'ding', 0.4); [0, 1, 2].forEach(i => sfx(P('G01_02', 0.5 + i * 0.1), 'pop', 0.3)); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#0b4fa8', '#2088ff', W * 0.6, H * 0.45, 28, 0.2);
  ['⚙️', '✅', '🤖', '⏰', '🔑'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  sprite('g_check', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 60, 1040);
  sprite('d_robot', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 760);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-400, -10, 95, '#ff5c8a', '第7集', { fs: 52, rot: -0.15, fg: '#fff' });
    fancy('GitHub', 60, -70, 120, t, -99, FX.white);
    fancy('Actions！', 110, 80, 150, t, -99, FX.blue);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况（左侧插图，画在 80..960）----
function probWfQ(t, blk) {
  const t0 = blk.t0; const ls = popIn(t, t0 + 0.15, 0.4);
  if (ls > 0) laptop(330, 470, 0.95 * ls, { screen: () => { txt('📋', 0, 0, 90, '#000', { align: 'center', font: EMOJI, bold: false }); } });
  const ss = popIn(t, t0 + 0.4, 0.4); if (ss > 0) { ctx.save(); ctx.translate(760, 430); ctx.scale(ss, ss); ctx.rotate(0.06);
    box(-120, -150, 240, 300, 18, '#e8e4f8', '#1b1433', 6); txt('💿', 0, -40, 100, '#000', { align: 'center', font: EMOJI, bold: false }); txt('安装包？', 0, 90, 36, '#1b1433', { align: 'center' }); ctx.restore(); }
  ['？', '？'].forEach((q, i) => { const s = popIn(t, t0 + 0.6 + i * 0.12); if (s > 0) txt(q, 520 + i * 90, 250 - i * 40, 100 * s, ['#ff5c8a', '#3ec1ff'][i], { align: 'center', font: F_FANCY, bold: false }); });
  if (t >= P('D02', 0.7)) stamp(t, P('D02', 0.7), 520, 830, '写在哪？', '#ff7a3d', 64, -0.08);
}
function probYamlQ(t, blk) {
  const t0 = blk.t0, k = P('K01', 0.55), d = U.D03.vo + 0.2, ok = U.K02.vo + 0.3;
  const L = t < d ? [{ s: 'jobs:', t: 0 }, { s: '  check:', t: 0 }, { s: '    runs-on: ubuntu-latest', t: 0 }]
    : [{ s: 'jobs:', t: 0 }, { s: t < ok ? '\tcheck:' : '  check:', t: 0, bad: t < ok, good: t >= ok }, { s: '    runs-on: ubuntu-latest', t: 0, good: t >= ok }];
  ymlEditor(t, 110, 200, 820, 330, 'check.yml', L, { fs: 30, dots: t >= k, accent: '#34407a', alpha: popIn(t, t0 + 0.1) });
  if (t >= k && t < d) { note(320, 600, popIn(t, k), '空格 ✓', '#2ec86e', { fs: 40 }); note(700, 600, popIn(t, k + 0.15), 'Tab ✗', '#ff3b5c', { fs: 40 }); }
  if (t >= d && t < ok) stamp(t, d + 0.15, 520, 640, 'Invalid workflow file', BADC, 46, -0.06);
  if (t >= ok) { fancy('同层左对齐！', 520, 640, 72, t, ok, FX.green); }
}
function probRedQ(t, blk) {
  const t0 = blk.t0; const cy = browser(110, 170, 820, 560, 'github.com/dafeiyu/baifan/commits', { title: '提交记录', accent: BADC });
  [['白饭页改版', 2, 0.25, '刚刚'], ['加今日推荐菜', 1, 0.15, '昨天'], ['第一次上线', 1, 0.1, '3 天前']].forEach((c, i) => { const a = prog(t, t0 + c[2], 0.2); if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; const ry = cy + 30 + i * 110;
    box(140, ry, 760, 90, 12, i ? '#fff' : '#fff5f5', i ? '#d0d7de' : '#ff8182', i ? 2 : 4); txt(c[0], 170, ry + 32, 30, '#24292f', {}); txt('dafeiyu · ' + c[3], 170, ry + 66, 20, '#57606a', { bold: false }); statusIcon(850, ry + 45, i ? 18 : 22 + 6 * Math.max(0, Math.sin(t * 6)), c[1], t); ctx.restore(); });
  if (t >= P('X01', 0.5)) { const s = popIn(t, P('X01', 0.5), 0.4); ctx.save(); ctx.translate(850, cy + 75); ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 50 * s, 0, 7); ctx.stroke(); ctx.restore(); }
  if (U.D04 && t >= U.D04.vo + 0.3) stamp(t, U.D04.vo + 0.3, 520, 830, '红叉？！', BADC, 70, -0.08);
}
function probPrQ(t, blk) {
  const t0 = blk.t0; const cy = browser(110, 170, 820, 600, 'github.com/dafeiyu/baifan/pull/3', { title: 'Pull request', accent: '#5b6ee1' });
  txt('改今日推荐菜：咖喱饭 #3', 140, cy + 46, 32, '#24292f', {}); chip(140, cy + 100, 1, '⇄ Open', OKC, '#fff', 24); txt('xiaoming 想合并到 main', 280, cy + 100, 22, '#57606a', { bold: false });
  box(140, cy + 150, 760, 120, 14, '#f6f8fa', '#d0d7de', 2); const q = t >= P('Q01', 0.55);
  txt(q ? '⚪ 还没有任何检查' : '…', 170, cy + 190, 28, '#57606a', {}); txt('合并前不知道会不会坏', 170, cy + 236, 22, '#8c959f', { bold: false });
  ghButton(140, cy + 300, 300, 64, 'Merge pull request', OKC, { fs: 24 });
  if (t >= P('Q01', 0.55)) txt('？', 500, cy + 330, 80, '#ff5c8a', { align: 'center', font: F_FANCY, bold: false });
  if (U.D05 && t >= U.D05.vo + 0.3) stamp(t, U.D05.vo + 0.3, 600, 830, '合并完才发现！', BADC, 54, -0.08);
}
function probCronQ(t, blk) {
  const t0 = blk.t0; const fl = P('M01', 0.6);
  [['设定', '08:00', '#2ec86e', 300, 0.15], ['实际', '16:00', '#ff3b5c', 740, 0.5]].forEach((c, i) => { const s = popIn(t, i ? fl : t0 + c[4], 0.4); if (s <= 0) return; ctx.save(); ctx.translate(c[3], 400); ctx.scale(s, s);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = c[2]; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 150, 0, 7); ctx.fill(); ctx.stroke();
    const hh = i ? 4 : 8; ctx.strokeStyle = '#1b1433'; ctx.lineCap = 'round'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(hh / 12 * Math.PI * 2) * 80, -Math.cos(hh / 12 * Math.PI * 2) * 80); ctx.stroke();
    ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -120); ctx.stroke(); ctx.fillStyle = '#1b1433'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.fill();
    txt(c[0] + ' ' + c[1], 0, 200, 44, '#1b1433', { align: 'center', font: F_CODE }); ctx.restore(); });
  if (t >= fl) arrow(470, 400, 570, 400, '#ff3b5c', eOut(prog(t, fl + 0.2, 0.3)), 12);
  if (U.D06 && t >= U.D06.vo) { const f = prog(t, P('D06', 0.6), 0.4); calendar(520, 760, popIn(t, U.D06.vo + 0.1), ['2026', '????'], f); }
  else if (t >= fl + 0.4) stamp(t, fl + 0.4, 520, 780, '晚了 8 小时！', '#a855f7', 60, -0.08);
}
function probSecQ(t, blk) {
  const t0 = blk.t0; const L = [{ s: 'steps:', t: 0 }, { s: '  - run: ./deploy.sh', t: 0 }, { s: '    env:', t: 0 }, { s: '      KEY: sk-baifan-8f3a2c', t: t0 + 0.3, bad: t >= P('C01', 0.35), vcol: '#ff9aa9' }];
  ymlEditor(t, 110, 220, 820, 400, 'check.yml', L, { fs: 30, accent: '#e07a3d', alpha: popIn(t, t0 + 0.1) });
  if (t >= P('C01', 0.4)) chip(130, 180, 1, '🌐 Public 公开仓库', '#e07a3d', '#fff', 30);
  ['👀', '👀', '👀'].forEach((e, i) => { const s = popIn(t, P('C01', 0.5 + i * 0.08)); if (s > 0) txt(e, 260 + i * 260, 720 + Math.sin(t * 3 + i) * 10, 80 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  if (U.D07 && t >= U.D07.vo + 0.3) stamp(t, U.D07.vo + 0.3, 600, 860, '谁都看得见！', BADC, 56, -0.08);
}
function probBadgeQ(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.15, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 470); ctx.scale(s, s); ctx.translate(-520, -470);
  box(130, 200, 780, 520, 20, '#fff', '#d0d7de', 3); box(130, 200, 780, 70, [20, 20, 0, 0], '#f6f8fa', '#d0d7de', 2); txt('📖 README.md', 160, 236, 30, '#24292f', {});
  txt('🍚 白饭页', 170, 340, 60, '#24292f', { font: F_FANCY, bold: false });
  const bp = popIn(t, P('B01', 0.45), 0.4); badgeSvg(330, 430, 1.5 * bp, 'check', 'passing', '#2ea44f'); if (bp > 0) sparkle(t, P('B01', 0.45), 330, 430, 160, 10);
  txt('每天推荐一道盖饭', 170, 530, 32, '#57606a', { bold: false }); for (let i = 0; i < 2; i++) box(170, 590 + i * 50, 500 - i * 120, 20, 10, '#eaeef2');
  ctx.restore();
  if (U.D08 && t >= U.D08.vo + 0.3) fancy('一看就靠谱！', 520, 830, 76, t, U.D08.vo + 0.3, FX.green);
}
function probAsk8(t, blk) {
  const t0 = blk.t0;
  [['✍️ 写', ACC], ['👀 看', OKC], ['🛠️ 管', '#e07a3d']].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s > 0) { ctx.save(); ctx.translate(250 + i * 270, 480); ctx.scale(s, s); ctx.rotate((i - 1) * 0.06); box(-110, -140, 220, 280, 24, '#fff', c[1], 8); txt(c[0], 0, 0, 52, '#1b1433', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); } });
  if (t >= t0 + 0.6) txt('三个重点', 520, 760, 64, ACC, { align: 'center', font: F_FANCY, bold: false });
}
function probAskP(t, blk) {
  const s = popIn(t, blk.t0 + 0.15, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 500); ctx.scale(s, s); ctx.translate(-520, -500);
  const cy = siteWin(150, 200, 740, 560, 'dafeiyu.github.io/baifan', { ufs: 24 }); baifanPage(520, cy + 10, 690);
  ctx.restore();
  ['🤖', '✅', '🚀'].forEach((e, i) => { const p = popIn(t, blk.t0 + 0.4 + i * 0.1); if (p > 0) txt(e, 200 + i * 320, 870, 90 * p, '#000', { align: 'center', font: EMOJI, bold: false }); });
}
const PROB = {
  wfQ: { chap: ['第①步', '写任务单', ACC, F_BODY], q: '要装什么吗？', bg: ['#dbeaff', '#b9d6ff'], draw: probWfQ },
  yamlQ: { chap: ['踩坑①', 'YAML 缩进', '#34407a', F_BODY], q: '我用了 Tab！', bg: ['#dde3ff', '#c3ccf5'], draw: probYamlQ },
  redQ: { chap: ['第②步', '看结果', BADC, F_BODY], q: '仓库坏了？', bg: ['#ffe0e4', '#ffbcc6'], draw: probRedQ },
  prQ: { chap: ['第③步', 'PR 自动检查', '#5b6ee1', F_BODY], q: '合并前先查！', bg: ['#e3e6ff', '#c9cff9'], draw: probPrQ },
  cronQ: { chap: ['踩坑②', '定时差 8 小时', '#a855f7', F_BODY], q: '这次几几年？', bg: ['#eadfff', '#d6c4ff'], draw: probCronQ },
  secQ: { chap: ['踩坑③', '密钥别写进代码', '#e07a3d', F_BODY], q: '密钥放哪？', bg: ['#ffe9d6', '#ffd0ab'], draw: probSecQ },
  badgeQ: { chap: ['进阶', '状态徽章', '#16a5c9', F_BODY], q: '我也要绿的！', bg: ['#d7f3ff', '#b5e6ff'], draw: probBadgeQ },
  ask8: { chap: ['复习', '写 · 看 · 管', ACC, F_BODY], q: '帮我划重点！', bg: ['#dbeaff', '#b9d6ff'], draw: probAsk8 },
  askP: { chap: ['实战', '白饭页自动检查', '#ff7a3d', F_BODY], q: '现在就装上！', bg: ['#ffe6d6', '#ffcaa8'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  sfx(BK.wfQ.t0 + 0.4, 'pop', 0.4); sfx(P('D02', 0.7), 'stamp', 0.6);
  sfx(P('K01', 0.55), 'pop', 0.4); sfx(U.D03.vo + 0.35, 'buzz', 0.5); sfx(U.K02.vo + 0.3, 'ding', 0.5);
  sfx(P('X01', 0.5), 'buzz', 0.5); sfx(U.D04.vo + 0.3, 'stamp', 0.6);
  sfx(P('Q01', 0.55), 'boing', 0.3); sfx(U.D05.vo + 0.3, 'stamp', 0.6);
  sfx(P('M01', 0.6), 'buzz', 0.5); sfx(P('M01', 0.6) + 0.4, 'stamp', 0.5); sfx(P('D06', 0.6), 'whoosh', 0.4);
  sfx(P('C01', 0.35), 'buzz', 0.5); [0, 1, 2].forEach(i => sfx(P('C01', 0.5 + i * 0.08), 'pop', 0.25)); sfx(U.D07.vo + 0.3, 'stamp', 0.6);
  sfx(P('B01', 0.45), 'sparkle', 0.5); sfx(U.D08.vo + 0.3, 'ding', 0.4);
  [0, 1, 2].forEach(i => sfx(BK.ask8.t0 + 0.15 + i * 0.12, 'pop', 0.3));
  sfx(BK.askP.t0 + 0.15, 'pop', 0.4);
});

// ---- 讲解①：任务单 .github/workflows/check.yml ----
const L_WF = () => [
  { s: 'name: 白饭页检查', t: P('G02_02', 0.08), hl: [S('G02_02'), P('G02_02', 0.45)] },
  { s: 'on: push', t: P('G02_02', 0.45), hl: [P('G02_02', 0.45), E('G02_02')] },
  { s: 'jobs:', t: P('G02_03', 0.02), hl: [S('G02_03'), P('G02_03', 0.3)] },
  { s: '  check:', t: P('G02_03', 0.12), hl: [S('G02_03'), P('G02_03', 0.3)] },
  { s: '    runs-on: ubuntu-latest', t: P('G02_03', 0.32), dur: 0.5, hl: [P('G02_03', 0.32), E('G02_03')] },
  { s: '    steps:', t: P('G02_04', 0.02), hl: [S('G02_04'), P('G02_04', 0.35)] },
  { s: '      - uses: actions/checkout@v7', t: P('G02_04', 0.35), dur: 0.5, hl: [P('G02_04', 0.35), E('G02_04')] },
  { s: '      - run: npx --yes html-validate index.html', t: P('G02_05', 0.12), dur: 0.7, hl: [P('G02_05', 0.12), E('G02_05') + 0.3] },
];
SC.workflow = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const e1 = S('G02_02') - 0.15;
  if (t < e1 + 0.3) { const a = 1 - prog(t, e1, 0.3); ctx.save(); ctx.globalAlpha = a;
    pill(1270, 170, '什么都不用装 · 写个文件就行', '#ffd23f', popIn(t, blk.t0 + 0.1), { fs: 40, font: F_BODY });
    urlParts(1270, 400, popIn(t, P('G02_01', 0.2), 0.4), [['.github', '#ffd23f', '点开头'], ['/workflows', '#7cc7ff', '固定名字'], ['/check.yml', '#7cf07a', '任务单']], 58);
    if (t >= P('G02_01', 0.65)) fancy('一个字母都不能错！', 1270, 720, 70, t, P('G02_01', 0.65), FX.red);
    ctx.restore(); }
  const g6 = S('G02_06') - 0.15;
  if (t >= e1 && t < g6 + 0.3) {
    const a = eOut(prog(t, e1, 0.3)) * (1 - prog(t, g6, 0.3));
    ymlEditor(t, 690, 130, 1170, 620, '.github/workflows/check.yml', L_WF(), { fs: 32, alpha: a });
    const notes = [['G02_02', 0.5, 'name = 名字 · on = 什么时候跑', '#7cc7ff'], ['G02_03', 0.45, '🐧 runs-on：借一台 Linux 云电脑', '#ffd23f'], ['G02_04', 0.5, 'uses：借现成动作，先拉代码', '#ff9de2'], ['G02_05', 0.4, 'run：直接跑命令，检查标签', '#7cf07a']];
    ctx.save(); ctx.globalAlpha = a; notes.forEach(n => { if (t >= P(n[0], n[1]) && t < E(n[0]) + 0.25) note(1270, 830, popIn(t, P(n[0], n[1])), n[2], n[3], { fs: 38 }); }); ctx.restore();
  }
  if (t >= g6) { // 推送后：Actions 标签页
    const a = eOut(prog(t, g6, 0.3)); ctx.save(); ctx.globalAlpha = a;
    const cy = browser(680, 120, 1180, 700, 'github.com/dafeiyu/baifan/actions', { title: '浏览器', accent: ACC });
    const tab = P('G02_06', 0.35); ['<> Code', 'Issues', 'Pull requests', '▶ Actions'].forEach((n, i) => { const x = 710 + i * 250, hot = i === 3 && t >= tab;
      txt(n, x, cy + 40, 26, hot ? '#24292f' : '#57606a', { font: F_CODE, bold: hot }); if (hot) box(x - 6, cy + 66, 170, 5, 2, '#fd8c73'); });
    box(686, cy + 78, 1168, 2, 0, '#d0d7de');
    if (t >= P('G02_06', 0.3) && t < tab + 0.5) txt('👆', 1520, cy + 110, 60, '#000', { font: EMOJI, bold: false });
    runList(t, 710, cy + 120, 1120, [['Create check.yml', 0, prog(t, P('G02_06', 0.55), 0.25), 'check #1 · main · push', '']]);
    if (t >= P('G02_06', 0.62)) fancy('开始跑了！', 1270, 900, 72, t, P('G02_06', 0.62), FX.yel);
    ctx.restore(); }
};
SFX_FNS.push(() => { const b = BK.workflow; sfx(b.t0 + 0.1, 'pop', 0.4); sfx(P('G02_01', 0.2), 'whoosh', 0.4); sfx(P('G02_01', 0.65), 'stamp', 0.5); sfx(S('G02_02') - 0.15, 'swoosh_in', 0.4);
  L_WF().forEach(l => typeSfx(l.t, [...l.s].length, l.dur || 0.35)); [['G02_02', 0.5], ['G02_03', 0.45], ['G02_04', 0.5], ['G02_05', 0.4]].forEach(n => sfx(P(n[0], n[1]), 'pop', 0.35)); sfx(S('G02_06') - 0.15, 'swoosh_in', 0.4); sfx(P('G02_06', 0.35), 'click', 0.6); sfx(P('G02_06', 0.55), 'pop', 0.4); sfx(P('G02_06', 0.62), 'ding', 0.4); });

// ---- 讲解②：看结果（Grok：这是真的吗）----
function logPanel(t, x, y, w, h, steps, o = {}) {
  box(x, y, w, h, 16, '#0d1117', '#30363d', 3); txt('check', x + 30, y + 40, 30, '#e6edf3', { font: F_CODE }); txt(o.sub || '失败 · 18s', x + 150, y + 40, 22, '#8b949e', { bold: false });
  let yy = y + 90;
  steps.forEach(s => { if (t < (s.t ?? -1)) return; statusIcon(x + 46, yy, 16, s.st, t); txt(s.n, x + 80, yy, 24, '#e6edf3', { font: F_CODE, max: w - 120 }); yy += 56;
    if (s.open && t >= s.open[0]) { const n = s.open[1].length; const hh = 20 + n * 40 * clamp(prog(t, s.open[0], 0.3)); box(x + 60, yy - 18, w - 90, hh, 10, '#161b22', '#30363d', 2);
      ctx.save(); rr(x + 60, yy - 18, w - 90, hh, 10); ctx.clip(); s.open[1].forEach((l, i) => { const ly = yy + 6 + i * 40; if (l.hl) box(x + 66, ly - 18, w - 102, 36, 6, 'rgba(255,59,92,0.25)'); txt(l.s, x + 84, ly, 22, l.c || '#c9d1d9', { font: F_CODE, bold: !!l.hl, max: w - 140 }); }); ctx.restore(); yy += hh + 10; } });
}
SC.run = (t, blk, en) => {
  bgLecture(t, BADC); lecturer(t, blk, en, blk.t0);
  const g2 = S('G03_02') - 0.15, g4 = S('G03_04') - 0.15;
  if (t < g2 + 0.3) { const a = 1 - prog(t, g2, 0.3); ctx.save(); ctx.globalAlpha = a;
    note(1270, 170, popIn(t, P('G03_01', 0.12)), '仓库没坏 ✓ 只是检查没通过', '#2ec86e', { fs: 38 });
    [[1640, 2, '没通过', 0.28, '#ff8a9a'], [900, 0, '正在跑', 0.55, '#ffd36b'], [1270, 1, '通过', 0.78, '#7cf07a']].forEach(c => { const s = popIn(t, P('G03_01', c[3]), 0.45); if (s <= 0) return; ctx.save(); ctx.translate(c[0], 440); ctx.scale(s, s); statusIcon(0, 0, 100, c[1], t); txt(c[2], 0, 170, 48, c[4], { align: 'center' }); ctx.restore(); });
    ctx.restore(); }
  if (t >= g2 && t < g4 + 0.3) {
    const a = eOut(prog(t, g2, 0.3)) * (1 - prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha = a;
    const cy = browser(680, 110, 1180, 780, 'github.com/dafeiyu/baifan/actions', { title: 'Actions', accent: BADC });
    const lg = P('G03_02', 0.3), back = S('G03_03') - 0.1, fix = P('G03_03', 0.12), ok = P('G03_03', 0.42);
    if (t < lg || t >= back) {
      const rows = [['白饭页改版', 2, 1, 'check #3 · main', '18s', t >= P('G03_02', 0.1) && t < lg], ['加今日推荐菜', 1, 1, 'check #2 · main', '21s'], ['第一次上线', 1, 1, 'check #1 · main', '20s']];
      if (t >= back) rows.unshift(['补上结束标签', t >= ok ? 1 : 0, prog(t, fix, 0.25), 'check #4 · main', '19s', t >= ok]);
      runList(t, 710, cy + 24, 1120, rows);
      if (t >= P('G03_02', 0.12) && t < lg) txt('👆', 1300, cy + 120, 64, '#000', { font: EMOJI, bold: false });
      if (t >= ok) sparkle(t, ok, 754, cy + 64, 120, 8);
    } else {
      logPanel(t, 710, cy + 20, 1120, 540, [{ n: 'Set up job', st: 1 }, { n: 'Run actions/checkout@v7', st: 1 }, { n: 'Run npx --yes html-validate index.html', st: 2,
        open: [P('G03_02', 0.5), [{ s: 'index.html' }, { s: '  12:5  error  Unclosed element "div"', c: '#ff7b72', hl: true }, { s: '✖ 1 problem' }]] }]);
      if (t >= P('G03_02', 0.7)) note(1560, cy + 470, popIn(t, P('G03_02', 0.7)), '第 12 行出错', '#ff3b5c', { fs: 38 });
    }
    mailCard(1180, 800, popIn(t, P('G03_03', 0.65), 0.4));
    ctx.restore();
  }
  if (t >= g4) { const a = eOut(prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha = a;
    [['🌐 公开仓库', '免费', '不限分钟', '#2ec86e', 0.1], ['🔒 私有仓库', '每月 2000 分钟', '免费额度', '#ffd23f', 0.5]].forEach((c, i) => { const s = popIn(t, P('G03_04', c[4]), 0.45); if (s <= 0) return; ctx.save(); ctx.translate(990 + i * 560, 470); ctx.scale(s, s);
      box(-240, -230, 480, 460, 30, 'rgba(255,255,255,0.08)', c[3], 7); txt(c[0], 0, -150, 46, '#fff', { align: 'center' }); txt(c[1], 0, 0, i ? 52 : 90, c[3], { align: 'center', font: F_FANCY, bold: false }); txt(c[2], 0, 130, 36, '#c9c3dd', { align: 'center' }); ctx.restore(); });
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('X02', 0.65) && t < E('X02') + 0.4) stamp(t, P('X02', 0.65), 1180, 520, '绿勾 ✓ 是真的', '#22c08b', 76, -0.12);
};
SFX_FNS.push(() => { guestSfx(['X02']); sfx(P('G03_01', 0.12), 'pop', 0.4); [0.28, 0.55, 0.78].forEach(f => sfx(P('G03_01', f), 'pop', 0.45));
  sfx(S('G03_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G03_02', 0.3), 'click', 0.6); sfx(P('G03_02', 0.5), 'whoosh', 0.3); sfx(P('G03_02', 0.7), 'buzz', 0.4);
  sfx(P('G03_03', 0.12), 'pop', 0.4); sfx(P('G03_03', 0.42), 'ding', 0.6); sfx(P('G03_03', 0.65), 'pop', 0.5); sfx(P('X02', 0.65), 'stamp', 0.7);
  sfx(S('G03_04') - 0.15, 'swoosh_in', 0.4); [0.1, 0.5].forEach(f => sfx(P('G03_04', f), 'pop', 0.45)); });

// ---- 讲解③：触发方式 pull_request / workflow_dispatch（千问）----
SC.trigger = (t, blk, en) => {
  bgLecture(t, '#5b6ee1'); lecturer(t, blk, en, blk.t0);
  const g2 = S('G04_02') - 0.1;
  const L = [{ s: 'on:', t: -1 }, { s: '  push:', t: -1, good: t >= S('G04_03') - 0.15 }, { s: '  pull_request:', t: P('G04_01', 0.12), dur: 0.5, good: (t >= P('G04_01', 0.12) && t < g2) || t >= S('G04_03') - 0.15 },
    { s: '  workflow_dispatch:', t: P('G04_02', 0.12), dur: 0.5, good: t >= P('G04_02', 0.12) && t < S('G04_03') - 0.15, dim: t >= S('G04_03') - 0.15 }];
  ymlEditor(t, 690, 140, 560, 400, 'check.yml', L, { fs: 30, accent: '#5b6ee1', alpha: popIn(t, blk.t0 + 0.05) });
  if (t < g2 + 0.3) { const a = popIn(t, blk.t0 + 0.2) * (1 - prog(t, g2, 0.3)); if (a > 0) { ctx.save(); ctx.globalAlpha *= clamp(a);
    const x = 1280, y = 140, ck = P('G04_01', 0.42), pass = P('G04_01', 0.62);
    box(x, y, 580, 620, 20, '#fff', '#d0d7de', 3); box(x, y, 580, 70, [20, 20, 0, 0], '#f6f8fa', '#d0d7de', 2); txt('⇄ PR #3 咖喱饭', x + 30, y + 36, 30, '#24292f', {});
    const st = t >= pass ? 1 : t >= ck ? 0 : -1;
    box(x + 30, y + 110, 520, 240, 14, st === 1 ? '#dafbe1' : '#f6f8fa', st === 1 ? '#4ac26b' : '#d0d7de', st === 1 ? 4 : 2);
    if (st < 0) txt('⚪ 等待检查…', x + 60, y + 170, 30, '#57606a', {});
    else { statusIcon(x + 80, y + 170, 26, st, t); txt(st ? 'All checks have passed' : 'Some checks haven’t completed', x + 124, y + 170, st ? 28 : 24, st ? LIVEC : '#9a6700', { font: F_CODE, max: 420 });
      statusIcon(x + 80, y + 260, 16, st, t); txt('check / check (pull_request)', x + 110, y + 260, 22, '#24292f', { font: F_CODE, bold: false, max: 430 }); }
    ghButton(x + 30, y + 400, 360, 74, 'Merge pull request', st === 1 ? OKC : '#94d3a2', { fs: 28, glow: st === 1 ? 0.5 + 0.5 * Math.sin(t * 5) : 0 });
    if (t >= pass) note(x + 290, y + 560, popIn(t, pass + 0.1), '绿勾了再合并', '#2ec86e', { fs: 36 });
    ctx.restore(); } }
  const g3 = S('G04_03') - 0.15;
  if (t >= g2 && t < g3 + 0.3) { const a = eOut(prog(t, g2, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a;
    const x = 1280, y = 140, pr = P('G04_02', 0.55); box(x, y, 580, 620, 20, '#fff', '#d0d7de', 3); box(x, y, 580, 70, [20, 20, 0, 0], '#f6f8fa', '#d0d7de', 2); txt('▶ Actions · 白饭页检查', x + 30, y + 36, 28, '#24292f', {});
    txt('This workflow has a', x + 30, y + 120, 22, '#57606a', { font: F_CODE, bold: false }); txt('workflow_dispatch trigger.', x + 30, y + 152, 22, '#57606a', { font: F_CODE, bold: false });
    ghButton(x + 300, y + 100, 250, 64, 'Run workflow ▾', '#f6f8fa', { fg: '#24292f', border: t >= P('G04_02', 0.35) ? '#d4a72c' : '#d0d7de', fs: 24, press: t >= pr && t < pr + 0.2, glow: t >= P('G04_02', 0.35) && t < pr + 0.3 ? 1 : 0 });
    if (t >= P('G04_02', 0.35) && t < pr + 0.6) txt('👆', x + 420, y + 200, 60, '#000', { font: EMOJI, bold: false });
    runList(t, x + 24, y + 260, 532, [['手动运行', t >= P('G04_02', 0.85) ? 1 : 0, prog(t, pr + 0.15, 0.25), 'workflow_dispatch', '20s'], ['咖喱饭 #3', 1, 1, 'pull_request', '22s'], ['白饭页改版', 1, 1, 'push', '19s']], { fs: 24 });
    ctx.restore(); if (t >= P('G04_02', 0.6) && t < g3) pill(1570, 840, '随时手动跑一次', '#ffd23f', popIn(t, P('G04_02', 0.6)), { fs: 36, font: F_BODY }); }
  if (t >= g3) { const a = eOut(prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a; // push + PR 两条线
    [['🧑‍💻 自己推送', 'push', 0.2, 300], ['👥 别人提 PR', 'pull_request', 0.55, 560]].forEach(c => { const s = popIn(t, P('G04_03', c[2]), 0.4); if (s <= 0) return; ctx.save(); ctx.translate(1570, c[3]); ctx.scale(s, s);
      box(-290, -100, 580, 200, 26, 'rgba(255,255,255,0.08)', '#9aa5ff', 5); txt(c[0], -250, -36, 36, '#fff', {}); txt(c[1], -250, 30, 30, '#7cc7ff', { font: F_CODE }); arrow(60, 30, 160, 30, '#fff', 1, 8); statusIcon(220, 30, 40, 1, t); ctx.restore(); });
    if (t >= P('G04_03', 0.8)) fancy('都查一遍！', 1570, 800, 70, t, P('G04_03', 0.8), FX.green);
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('Q02', 0.45)) stamp(t, P('Q02', 0.45), 1180, 520, '放心合并 ✓', '#22c08b', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['Q02']); const b = BK.trigger; sfx(b.t0 + 0.05, 'pop', 0.4); typeSfx(P('G04_01', 0.12), 14, 0.5); sfx(P('G04_01', 0.42), 'pop', 0.4); sfx(P('G04_01', 0.62), 'ding', 0.6); sfx(P('G04_01', 0.62) + 0.1, 'pop', 0.4);
  sfx(S('G04_02') - 0.1, 'swoosh_in', 0.4); typeSfx(P('G04_02', 0.12), 18, 0.5); sfx(P('G04_02', 0.55), 'click', 0.7); sfx(P('G04_02', 0.6), 'pop', 0.4); sfx(P('G04_02', 0.85), 'ding', 0.4); sfx(S('G04_03') - 0.15, 'swoosh_in', 0.4); [0.2, 0.55].forEach(f => sfx(P('G04_03', f), 'pop', 0.4)); sfx(P('G04_03', 0.8), 'ding', 0.5); sfx(P('Q02', 0.45), 'stamp', 0.7); });

// ---- 讲解④：定时 schedule / cron（Gemini 八点变四点）----
function miniClock(x, y, r, hour, label, col, s = 1) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = col; ctx.lineWidth = r * 0.08; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.stroke();
  const ha = (hour % 12) / 12 * Math.PI * 2; ctx.strokeStyle = '#1b1433'; ctx.lineCap = 'round'; ctx.lineWidth = r * 0.1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ha) * r * 0.52, -Math.cos(ha) * r * 0.52); ctx.stroke();
  ctx.lineWidth = r * 0.06; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.78); ctx.stroke();
  txt(label, 0, r + 50, 40, col, { align: 'center', font: F_CODE }); ctx.restore();
}
SC.schedule = (t, blk, en) => {
  bgLecture(t, '#a855f7'); lecturer(t, blk, en, blk.t0);
  const f0 = P('G05_02', 0.15), tz = P('G05_02', 0.55), f1 = P('G05_03', 0.7);
  const cron = flipText(t, [[-1, "'0 8 * * *'"], [f0, "'0 0 * * *'"], [tz, "'0 8 * * *'"], [f1, "'17 8 * * *'"]]);
  const L = [{ s: 'on:', t: -1 }, { s: '  schedule:', t: -1 }, { s: "    - cron: " + cron.s, t: -1, good: t >= f0, hl: [S('G05_01'), f0] },
    { s: '      timezone: Asia/Shanghai', t: tz, dur: 0.5, good: true }];
  ymlEditor(t, 690, 120, 1170, 330, 'check.yml', L, { fs: 32, accent: '#a855f7', alpha: popIn(t, blk.t0 + 0.05) });
  const g3 = S('G05_03') - 0.15, sw = P('G05_01', 0.5);
  if (t < sw + 0.3) { const a = 1 - prog(t, sw, 0.3); ctx.save(); ctx.globalAlpha = a;
    urlParts(1270, 600, popIn(t, P('G05_01', 0.08), 0.4), [['0 ', '#7cf07a', '分'], ['8 ', '#ffd23f', '时'], ['* ', '#ece9f7', '日'], ['* ', '#ece9f7', '月'], ['*', '#ece9f7', '周']], 70);
    ctx.restore(); }
  if (t >= sw && t < g3 + 0.3) { const a = eOut(prog(t, sw, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a;
    const fixed = t >= f0; miniClock(930, 620, 120, fixed ? 0 : 8, fixed ? 'UTC 00:00' : 'UTC 08:00', '#7cc7ff', popIn(t, sw, 0.4));
    arrow(1080, 620, 1290, 620, '#fff', eOut(prog(t, sw + 0.3, 0.3)), 12); txt('+8 小时', 1185, 570, 34, '#ffd23f', { align: 'center' });
    miniClock(1440, 620, 120, fixed ? 8 : 16, fixed ? '北京 08:00 ✓' : '北京 16:00', fixed ? '#7cf07a' : '#ff8a9a', popIn(t, sw + 0.4, 0.4));
    if (t >= tz) note(1185, 850, popIn(t, tz), '或者：加上时区，照写 8 点', '#ffd23f', { fs: 34 });
    ctx.restore(); }
  const g4 = S('G05_04') - 0.15;
  if (t >= g4) { const a = eOut(prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha = a;
    [['🌿', '只在默认分支 main 上跑', 0.15, 580, '#7cf07a'], ['💤', '公开仓库 60 天没动静 → 自动暂停', 0.5, 780, '#ffd23f']].forEach(c => { const s = popIn(t, P('G05_04', c[2]), 0.4); if (s <= 0) return; ctx.save(); ctx.translate(1270, c[3]); ctx.scale(s, s);
      box(-540, -76, 1080, 152, 26, 'rgba(15,12,31,0.9)', c[4], 5); txt(c[0], -470, 2, 70, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], -400, 2, 42, '#fff', { max: 900 }); ctx.restore(); });
    ctx.restore(); }
  if (t >= g3 && t < g4 + 0.3) { const a = eOut(prog(t, g3, 0.3)) * (1 - prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha = a;
    pill(930, 540, '⏱ 最短 5 分钟一次', '#ffd23f', popIn(t, P('G05_03', 0.05)), { fs: 38, font: F_BODY });
    box(720, 620, 1120, 8, 4, '#c9c3dd'); [['7:55', 760], ['8:00', 1270], ['8:17', 1760]].forEach(m => { box(m[1] - 3, 600, 6, 48, 3, '#fff'); txt(m[0], m[1], 680, 30, '#fff', { align: 'center', font: F_CODE }); });
    for (let i = 0; i < 9; i++) { const s = popIn(t, P('G05_03', 0.3 + i * 0.03)); if (s > 0) statusIcon(1270 + (i % 3 - 1) * 58, 570 - Math.floor(i / 3) * 58 - 30, 24 * s, 0, t + i); }
    if (t >= P('G05_03', 0.45)) note(1270, 760, popIn(t, P('G05_03', 0.45)), '整点人多 → 可能晚一点', '#ff8a9a', { fs: 34 });
    if (t >= f1) { statusIcon(1760, 560, 28 * popIn(t, f1 + 0.2), 1, t); note(1640, 860, popIn(t, f1 + 0.1), '挑零碎分钟更稳', '#7cf07a', { fs: 34 }); }
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('M02', 0.5) && t < E('M02') + 0.4) stamp(t, P('M02', 0.5), 1180, 520, '时差的锅！', '#a855f7', 76, -0.12);
};
SFX_FNS.push(() => { guestSfx(['M02']); const b = BK.schedule; sfx(b.t0 + 0.05, 'pop', 0.4); sfx(P('G05_01', 0.08), 'pop', 0.5); sfx(P('G05_01', 0.5), 'swoosh_in', 0.4); sfx(P('G05_01', 0.5) + 0.3, 'whoosh', 0.4); sfx(P('G05_01', 0.5) + 0.4, 'buzz', 0.4);
  sfx(P('G05_02', 0.15), 'ding', 0.5); typeSfx(P('G05_02', 0.55), 18, 0.5); sfx(S('G05_03') - 0.15, 'swoosh_in', 0.4); for (let i = 0; i < 9; i += 2) sfx(P('G05_03', 0.3 + i * 0.03), 'pop', 0.2); sfx(P('G05_03', 0.45), 'buzz', 0.3); sfx(P('G05_03', 0.7), 'ding', 0.5); sfx(S('G05_04') - 0.15, 'swoosh_in', 0.4); [0.15, 0.5].forEach(f => sfx(P('G05_04', f), 'pop', 0.4)); sfx(P('M02', 0.5), 'stamp', 0.7); });

// ---- 讲解⑤：密钥放 Secrets（Claude：批准）----
SC.secrets = (t, blk, en) => {
  bgLecture(t, '#e07a3d'); lecturer(t, blk, en, blk.t0);
  const g2 = S('G06_02') - 0.15;
  if (t < g2 + 0.3) { const a = popIn(t, blk.t0 + 0.05, 0.4) * (1 - prog(t, g2, 0.3)); if (a > 0) { ctx.save(); ctx.globalAlpha *= clamp(a);
    const cy = browser(680, 110, 1180, 780, 'github.com/dafeiyu/baifan/settings/secrets/actions', { title: 'Settings', accent: '#e07a3d' });
    const ex = P('G06_01', 0.22), sel = P('G06_01', 0.38), nb = P('G06_01', 0.58), form = P('G06_01', 0.68), add = P('G06_01', 0.9);
    box(700, cy + 20, 300, 540, 12, '#f6f8fa', '#d0d7de', 2);
    const side = ['General', 'Branches', 'Pages', '🔒 Secrets and', '    variables', t >= ex ? '      Actions' : null].filter(Boolean);
    side.forEach((n, i) => { const yy = cy + 60 + i * 60, hot = (i >= 3 && i <= 4 && t >= S('G06_01') && t < sel) || (i === 5 && t >= sel);
      if (hot) { box(708, yy - 26, 284, 52, 10, '#ddf4ff'); ctx.fillStyle = '#fd8c73'; rr(708, yy - 22, 6, 44, 3); ctx.fill(); }
      txt(n, 726, yy, 24, hot ? '#0969da' : '#24292f', { font: F_CODE, bold: hot }); });
    const px = 1030; txt('Actions secrets and variables', px, cy + 50, 30, '#24292f', {});
    txt('Secrets', px, cy + 110, 26, '#24292f', {}); box(px, cy + 128, 110, 5, 2, '#fd8c73'); txt('Variables', px + 150, cy + 110, 26, '#57606a', { bold: false });
    if (t < form) { ghButton(px, cy + 170, 360, 64, 'New repository secret', OKC, { fs: 24, press: t >= nb && t < nb + 0.2, glow: t >= sel ? 0.6 + 0.4 * Math.sin(t * 6) : 0 });
      if (t >= sel) txt('👆', px + 250, cy + 270, 60, '#000', { font: EMOJI, bold: false }); txt('还没有密钥', px, cy + 330, 26, '#8c959f', { bold: false }); }
    else if (t < add + 0.3) { const f = popIn(t, form, 0.35); ctx.save(); ctx.translate(px + 380, cy + 330); ctx.scale(f, f); ctx.translate(-px - 380, -cy - 330);
      inputBox(px, cy + 210, 780, 'Name *', 'DEPLOY_KEY', { code: true });
      box(px, cy + 330, 780, 120, 10, '#f6f8fa', '#d0d7de', 2); txt('Secret *', px, cy + 304, 28, '#24292f', {}); txt('••••••••••••••', px + 18, cy + 370, 30, '#24292f', { font: F_CODE });
      ghButton(px, cy + 480, 200, 60, 'Add secret', OKC, { fs: 24, press: t >= add && t < add + 0.2 }); ctx.restore(); }
    else { box(px, cy + 170, 780, 80, 10, '#fff', '#4ac26b', 3); txt('🔑 DEPLOY_KEY', px + 24, cy + 210, 28, '#24292f', { font: F_CODE }); txt('Updated now', px + 760, cy + 210, 22, '#57606a', { align: 'right', bold: false });
      note(px + 390, cy + 330, popIn(t, add + 0.3), '值只能写入，谁都看不到', '#2ec86e', { fs: 32 }); }
    ctx.restore(); } }
  if (t >= g2) { const a = eOut(prog(t, g2, 0.3));
    ymlEditor(t, 690, 120, 1170, 270, 'check.yml', [{ s: '    env:', t: -1 }, { s: '      KEY: ${{ secrets.DEPLOY_KEY }}', t: P('G06_02', 0.08), dur: 0.6, good: true }], { fs: 32, accent: '#e07a3d', alpha: a });
    const lg = P('G06_02', 0.55); if (t >= lg) { ctx.save(); ctx.globalAlpha = eOut(prog(t, lg, 0.3));
      box(690, 430, 1170, 260, 16, '#0d1117', '#30363d', 3); txt('▶ Run ./deploy.sh', 720, 480, 26, '#e6edf3', { font: F_CODE });
      txt('KEY:', 740, 560, 44, '#8b949e', { font: F_CODE }); const hs = popIn(t, lg + 0.2, 0.4); ctx.save(); ctx.translate(980, 560); ctx.scale(hs, hs); box(-20, -40, 150, 80, 12, 'rgba(255,210,63,0.2)', '#ffd23f', 4); txt('***', 55, 6, 64, '#ffd23f', { align: 'center', font: F_CODE }); ctx.restore();
      txt('日志自动打码', 1400, 560, 40, '#7cf07a', {}); ctx.restore(); }
  }
  guest(t, blk);
  if (t >= P('C02', 0.6)) stamp(t, P('C02', 0.6), 1180, 520, '批准 ✓', '#22c08b', 90, -0.12);
};
SFX_FNS.push(() => { guestSfx(['C02']); const b = BK.secrets; sfx(b.t0 + 0.05, 'pop', 0.4); sfx(P('G06_01', 0.22), 'click', 0.5); sfx(P('G06_01', 0.38), 'click', 0.5); sfx(P('G06_01', 0.58), 'click', 0.7); sfx(P('G06_01', 0.68), 'pop', 0.4); sfx(P('G06_01', 0.9), 'click', 0.6); sfx(P('G06_01', 0.9) + 0.3, 'ding', 0.4);
  sfx(S('G06_02') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G06_02', 0.08), 18, 0.6); sfx(P('G06_02', 0.55) + 0.2, 'pop', 0.6); sfx(P('C02', 0.6), 'stamp', 0.8); });

// ---- 讲解⑥：状态徽章（豆包）----
SC.badge = (t, blk, en) => {
  bgLecture(t, '#16a5c9'); lecturer(t, blk, en, blk.t0);
  const g2 = S('G07_02') - 0.15;
  if (t < g2 + 0.3) { const a = popIn(t, blk.t0 + 0.05, 0.4) * (1 - prog(t, g2, 0.3)); if (a > 0) { ctx.save(); ctx.globalAlpha *= clamp(a);
    const cy = browser(680, 110, 1180, 780, 'github.com/dafeiyu/baifan/actions/workflows/check.yml', { title: 'Actions', accent: '#16a5c9' });
    const mn = P('G07_01', 0.3), it = P('G07_01', 0.42), dl = P('G07_01', 0.55), cp = P('G07_01', 0.86);
    txt('白饭页检查', 720, cy + 50, 38, '#24292f', {}); txt('check.yml', 720, cy + 96, 24, '#57606a', { font: F_CODE, bold: false });
    ghButton(1740, cy + 26, 90, 54, '⋯', t >= P('G07_01', 0.18) && t < dl ? '#fff8c5' : '#f6f8fa', { fg: '#24292f', border: '#d0d7de', fs: 34, press: t >= mn && t < mn + 0.2 });
    runList(t, 710, cy + 150, 1120, [['补上结束标签', 1, 1, 'check #4 · main', '19s'], ['白饭页改版', 2, 1, 'check #3 · main', '18s']], { fs: 24 });
    if (t >= mn && t < dl) { const s = popIn(t, mn, 0.25); ctx.save(); ctx.translate(1830, cy + 90); ctx.scale(s, s); box(-380, 0, 380, 170, 12, '#fff', '#d0d7de', 3);
      txt('Disable workflow', -350, 44, 24, '#24292f', { font: F_CODE, bold: false }); if (t >= it) box(-372, 82, 364, 60, 8, '#ddf4ff'); txt('Create status badge', -350, 112, 24, t >= it ? '#0969da' : '#24292f', { font: F_CODE }); ctx.restore();
      if (t >= it) txt('👆', 1700, cy + 260, 56, '#000', { font: EMOJI, bold: false }); }
    if (t >= dl) { const s = popIn(t, dl, 0.35); ctx.save(); ctx.translate(1270, 520); ctx.scale(s, s); ctx.translate(-1270, -520);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(686, cy, 1168, 880 - cy);
      box(760, 300, 1020, 460, 16, '#fff', '#d0d7de', 3); txt('Create status badge', 790, 345, 32, '#24292f', {}); badgeSvg(900, 420, 1.2, 'check', 'passing', '#2ea44f');
      box(790, 480, 960, 110, 10, '#f6f8fa', '#d0d7de', 2); txt('![check](https://github.com/dafeiyu/baifan/', 810, 515, 22, '#24292f', { font: F_CODE, bold: false }); txt('actions/workflows/check.yml/badge.svg)', 810, 555, 22, '#24292f', { font: F_CODE, bold: false });
      ghButton(790, 630, 460, 64, 'Copy status badge Markdown', OKC, { fs: 22, press: t >= cp && t < cp + 0.2 }); if (t >= cp) note(1500, 662, popIn(t, cp + 0.1), '贴进 README', '#16a5c9', { fs: 32 });
      ctx.restore(); }
    ctx.restore(); } }
  if (t >= g2) { const a = eOut(prog(t, g2, 0.3)); ctx.save(); ctx.globalAlpha = a;
    box(760, 160, 1020, 620, 20, '#fff', '#d0d7de', 3); box(760, 160, 1020, 70, [20, 20, 0, 0], '#f6f8fa', '#d0d7de', 2); txt('📖 README.md', 790, 196, 30, '#24292f', {});
    txt('🍚 白饭页', 800, 320, 64, '#24292f', { font: F_FANCY, bold: false });
    const bad = t >= P('G07_02', 0.45) && t < P('G07_02', 0.8); const fl = flipText(t, [[-1, 'p'], [P('G07_02', 0.45), 'f'], [P('G07_02', 0.8), 'p']]);
    ctx.save(); ctx.translate(1000, 430); ctx.scale(1, fl.sc); badgeSvg(0, 0, 1.8, 'check', fl.s === 'f' ? 'failing' : 'passing', fl.s === 'f' ? '#cb2431' : '#2ea44f'); ctx.restore();
    txt(bad ? '❌ 失败 → 变红' : '✅ 通过 → 绿色', 1260, 430, 36, bad ? BADC : LIVEC, {});
    txt('每天推荐一道盖饭', 800, 560, 32, '#57606a', { bold: false }); for (let i = 0; i < 2; i++) box(800, 620 + i * 50, 600 - i * 140, 20, 10, '#eaeef2');
    ctx.restore(); if (t >= P('G07_02', 0.85) && t < E('G07_02') + 0.3) fancy('访客一眼就知道！', 1270, 880, 64, t, P('G07_02', 0.85), FX.blue); }
  guest(t, blk);
  if (t >= P('B02', 0.5)) stamp(t, P('B02', 0.5), 1180, 520, '放心点赞！', '#16a5c9', 86, -0.12);
};
SFX_FNS.push(() => { guestSfx(['B02']); const b = BK.badge; sfx(b.t0 + 0.05, 'pop', 0.4); sfx(P('G07_01', 0.3), 'click', 0.6); sfx(P('G07_01', 0.42), 'pop', 0.3); sfx(P('G07_01', 0.55), 'pop', 0.5); sfx(P('G07_01', 0.86), 'click', 0.6);
  sfx(S('G07_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G07_02', 0.45), 'buzz', 0.5); sfx(P('G07_02', 0.8), 'ding', 0.5); sfx(P('G07_02', 0.85), 'sparkle', 0.4); sfx(P('B02', 0.5), 'stamp', 0.7); });

// ---- 复习：写 · 看 · 管 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const cards = [['✍️ 写', ACC, ['.github/workflows/', 'on · jobs · steps', '缩进只用空格'], 'G08_01'], ['👀 看', OKC, ['🟡 正在跑', '✅ 通过', '❌ 点进去看日志'], 'G08_02'], ['🛠️ 管', '#e07a3d', ['PR 前自动检查', '定时按 UTC', '密钥放 Secrets'], 'G08_03']];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.1, 0.4); if (s <= 0) return; const act = t >= S(c[3]) - 0.1 && (i === 2 || t < S(cards[i + 1][3]) - 0.1);
    const x = 870 + i * 400, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= S(c[3]) - 0.1 ? 1 : 0.5;
    if (act) { ctx.shadowColor = c[1]; ctx.shadowBlur = 40; } box(-180, -300, 360, 600, 28, '#fffaf0', c[1], 8); ctx.shadowBlur = 0;
    box(-180, -300, 360, 100, [28, 28, 0, 0], c[1]); txt(c[0], 0, -248, 46, '#fff', { align: 'center', font: F_FANCY, bold: false });
    const n = c[2].length;
    c[2].forEach((l, k) => { const a = clamp(prog(t, P(c[3], 0.08 + k * (0.8 / n)), 0.25)); ctx.save(); ctx.globalAlpha *= 0.25 + 0.75 * a; box(-150, -170 + k * 140, 300, 110, 16, '#fff', '#e4dff5', 3); txt(l, 0, -170 + k * 140 + 55, 26, '#1b1433', { align: 'center', font: /[\u4e00-\u9fff]/.test(l) ? F_BODY : F_CODE, max: 280 }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= P('G08_03', 0.8)) fancy('写 · 看 · 管，自动挂机！', 1270, 880, 58, t, P('G08_03', 0.8), FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2].forEach(i => sfx(BK.recap.t0 + 0.1 + i * 0.1, 'pop', 0.3)); ['G08_01', 'G08_02', 'G08_03'].forEach(id => { for (let k = 0; k < 3; k++) sfx(P(id, 0.08 + k * (0.8 / 3)), 'ding', 0.25); }); sfx(P('G08_03', 0.8), 'sparkle', 0.5); });

// ---- 实战：白饭页装上自动检查 ----
const L_PRAC = () => [
  { s: 'name: 白饭页检查', t: P('G09_01', 0.12), dur: 0.25 }, { s: 'on: [push, pull_request]', t: P('G09_01', 0.22), dur: 0.3, hl: [P('G09_01', 0.22), P('G09_01', 0.5)] },
  { s: 'jobs:', t: P('G09_01', 0.3), dur: 0.1 }, { s: '  check:', t: P('G09_01', 0.34), dur: 0.15 }, { s: '    runs-on: ubuntu-latest', t: P('G09_01', 0.4), dur: 0.3 },
  { s: '    steps:', t: P('G09_01', 0.48), dur: 0.15 }, { s: '      - uses: actions/checkout@v7', t: P('G09_01', 0.55), dur: 0.35, hl: [P('G09_01', 0.55), P('G09_01', 0.75)] },
  { s: '      - run: npx --yes html-validate index.html', t: P('G09_01', 0.72), dur: 0.45, hl: [P('G09_01', 0.75), E('G09_01') + 0.2] },
];
SC.practice = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  const red = P('G09_02', 0.55), fixT = S('G09_03'), okT = P('G09_03', 0.45), pgT = P('G09_03', 0.7), bt = P('G09_04', 0.2), bdg = P('G09_04', 0.55);
  const steps = [['check.yml', S('G09_01')], ['push', S('G09_02')], ['❌ 日志', red], ['修好', fixT], ['✅ 部署', okT], ['徽章', S('G09_04')]];
  const end = S('D11') - 0.2;
  steps.forEach((s, i) => {
    const a = popIn(t, blk.t0 + 0.15 + i * 0.06); if (a <= 0) return;
    const x = 790 + i * 200, y = 88; const act = t < end && t >= s[1] && (i === 5 || t < steps[i + 1][1]); const done = t >= end || (i < 5 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1));
    box(-90, -32, 180, 64, 18, act ? '#ff7a3d' : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act && !/^[✓✅❌]/.test(s[0]) ? '✓ ' : '') + s[0], 0, 2, 22, '#fff', { align: 'center', font: /[\u4e00-\u9fff]/.test(s[0]) ? F_BODY : F_CODE, max: 170 }); ctx.restore();
  });
  const ta = eOut(prog(t, blk.t0, 0.3));
  if (t < fixT) ymlEditor(t, 660, 160, 700, 700, '.github/workflows/check.yml', L_PRAC(), { fs: 20, accent: '#ff7a3d', alpha: ta });
  else { const fx = P('G09_03', 0.15);
    ymlEditor(t, 660, 160, 700, 700, 'index.html', [{ s: '<body>', t: -1, row: 8 }, { s: '  <h1>🍚 白饭页</h1>', t: -1, row: 9 }, { s: '  <main>', t: -1, row: 10 },
      { s: '  <div class="dish">番茄炒蛋盖饭' + (t >= fx ? '</div>' : ''), t: -1, row: 11, bad: t < fx, good: t >= fx, vcol: '#ffd27a' }, { s: '  </main>', t: -1, row: 12 }, { s: '</body>', t: -1, row: 13 }], { fs: 24, accent: '#ff7a3d', alpha: 1, rowOff: 7 });
    if (t < fx + 0.8) note(1010, 700, popIn(t, fixT + 0.05), '补上 </div>', '#7cf07a', { fs: 34 }); }
  ctx.save(); ctx.globalAlpha = ta;
  box(1380, 160, 500, 700, 20, '#fff', '#d0d7de', 3); box(1380, 160, 500, 66, [20, 20, 0, 0], '#f6f8fa', '#d0d7de', 2); txt('▶ Actions', 1404, 194, 28, '#24292f', {});
  const r1 = P('G09_02', 0.25); const rows = [];
  if (t >= P('G09_03', 0.3)) rows.push(['补上结束标签', t >= okT ? 1 : 0, prog(t, P('G09_03', 0.3), 0.2), 'push · check', '19s', t >= okT && t < pgT + 0.5]);
  if (t >= pgT) rows.unshift(['pages deploy', 1, prog(t, pgT, 0.2), '自动部署', '41s']);
  if (t >= r1) rows.push(['准备自动检查', t >= red ? 2 : 0, prog(t, r1, 0.2), 'push · check', '18s', t >= red && t < fixT]);
  runList(t, 1396, 246, 468, rows, { fs: 22, rh: 88 });
  if (t >= P('G09_02', 0.7) && t < fixT) { ctx.save(); ctx.globalAlpha *= clamp(prog(t, P('G09_02', 0.7), 0.25)); box(1396, 360, 468, 120, 10, '#0d1117', '#30363d', 2); txt('index.html', 1416, 392, 20, '#c9d1d9', { font: F_CODE, bold: false }); txt('12:5 error Unclosed "div"', 1416, 440, 22, '#ff7b72', { font: F_CODE }); ctx.restore(); }
  if (t >= S('G09_04')) { ghButton(1580, 640, 280, 56, 'Run workflow ▾', '#f6f8fa', { fg: '#24292f', border: '#d0d7de', fs: 22, press: t >= bt && t < bt + 0.2, glow: t >= bt && t < bt + 0.5 ? 1 : 0 });
    if (t >= bdg) { box(1400, 720, 460, 120, 14, '#fff', '#d0d7de', 2); txt('📖 README', 1420, 750, 24, '#24292f', {}); badgeSvg(1630, 800, 1.1 * popIn(t, bdg, 0.4), 'check', 'passing', '#2ea44f'); if (t < bdg + 1) sparkle(t, bdg, 1630, 800, 140, 8); } }
  ctx.restore();
  if (t >= S('G09_05') && t < end) pill(1270, 960 - 60, '🔔 推坏了？红叉马上提醒', '#ffd23f', popIn(t, P('G09_05', 0.1)), { fs: 36, font: F_BODY });
  if (t < S('G09_01') + 0.6) fancy('实战开始！', 1280, 500, 110, t, blk.t0 + 0.2, Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_robot', 1620, H + 30, 860, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    const bs = popIn(t, end + 0.05, 0.4); ctx.save(); ctx.translate(1050, 420); ctx.scale(bs, bs); ctx.rotate(-0.04); ctx.translate(-1050, -420);
    const c2 = siteWin(760, 160, 580, 470, 'dafeiyu.github.io/baifan', { ufs: 22 }); baifanPage(1050, c2 + 10, 540, { badge: true }); ctx.restore();
    fancy('有检查机器人了！', 1050, 780, 84, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 6; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(b.t0 + 0.2, 'impact', 0.6); L_PRAC().forEach(l => typeSfx(l.t, [...l.s].length, l.dur));
  sfx(P('G09_02', 0.25), 'pop', 0.4); sfx(P('G09_02', 0.55), 'buzz', 0.6); sfx(P('G09_02', 0.7), 'pop', 0.3); sfx(S('G09_03'), 'swoosh_in', 0.4); typeSfx(P('G09_03', 0.15), 6, 0.2); sfx(P('G09_03', 0.3), 'pop', 0.4); sfx(P('G09_03', 0.45), 'ding', 0.6); sfx(P('G09_03', 0.7), 'sparkle', 0.4);
  sfx(P('G09_04', 0.2), 'click', 0.6); sfx(P('G09_04', 0.55), 'sparkle', 0.5); sfx(P('G09_05', 0.1), 'pop', 0.4); const end = S('D11') - 0.2; sfx(end, 'impact', 0.6); sfx(end + 0.4, 'confetti', 0.6); });

// ---- 预告（变基 rebase）+ 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#2088ff');
  const outro = E('G10_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G10_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G10_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G10_01', 0.1), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 470); ctx.scale(bp, bp); ctx.translate(-1260, -470);
      box(860, 250, 800, 420, 24, '#ffffff', '#2088ff', 6); box(860, 250, 800, 70, [24, 24, 0, 0], '#24292f'); txt('git log --graph', 900, 286, 30, '#fff', { font: F_CODE });
      const sp = eIO(prog(t, P('G10_01', 0.55), 0.6)); const mess = [[930, 420], [1050, 560], [1130, 380], [1270, 600], [1390, 400], [1560, 540]];
      const lab = ['wip', '修bug', '再修', '真修好了', '改错字', 'wip2'];
      const pts = mess.map((m, i) => [lerp(m[0], 940 + i * 128, sp), lerp(m[1], 470, sp)]);
      ctx.strokeStyle = sp > 0.99 ? '#2ea44f' : '#ff8a9a'; ctx.lineWidth = 8; ctx.beginPath(); pts.forEach((p, i) => { const a = prog(t, P('G10_01', 0.15 + i * 0.05), 0.2); if (a > 0) i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke();
      pts.forEach((p, i) => { const s = popIn(t, P('G10_01', 0.15 + i * 0.05)); if (s <= 0) return; ctx.fillStyle = sp > 0.99 ? '#2ea44f' : '#ff5c8a'; ctx.beginPath(); ctx.arc(p[0], p[1], 20 * s, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke();
        txt(lab[i], p[0], p[1] + (i % 2 ? 50 : -48), 22, '#24292f', { align: 'center' }); });
      ctx.restore(); }
    [['git rebase', -520, 300, 0.35], ['变基', 520, 290, 0.5], ['整理提交历史', -500, 680, 0.62], ['✨ 干干净净', 510, 690, 0.72]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G10_01', c[3])), { fs: 34, font: /[\u4e00-\u9fff]/.test(c[0]) ? F_BODY : F_CODE }));
    fancy('乱成一团？捋成一条线！', 1260, 830, 76, t, P('G10_01', 0.75), FX.pink);
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
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_robot', 1690, H + 40, 640, { scale: sa }); }
      SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
    ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
    ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G10_01', 0.1), 'pop', 0.6); for (let i = 0; i < 6; i++) sfx(P('G10_01', 0.15 + i * 0.05), 'pop', 0.25); sfx(P('G10_01', 0.55), 'whoosh', 0.5); [0.35, 0.5, 0.62, 0.72].forEach(f => sfx(P('G10_01', f), 'pop', 0.3)); sfx(P('G10_01', 0.75), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G10_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G10_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_sparkle', P('G01_01', 0.82), E('G01_01')], ['d_think', P('G02_03', 0.55), E('G02_03')], ['d_relief', P('G03_03', 0.5), E('G03_03')],
  ['d_ok', P('G05_02', 0.7), E('G05_02')], ['d_sparkle', P('G06_02', 0.7), E('G06_02')],
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
