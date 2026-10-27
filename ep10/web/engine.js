// AI娘 Git课 · 第10集 渲染引擎 —— renderAt(t) 纯函数，逐帧确定性导出（通用部分沿用第1集）
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const F_FANCY = '"Smiley", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const F_BODY = '"Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const F_CODE = 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", "Microsoft YaHei", "Noto Sans CJK SC", monospace';

// ================= 素材 =================
const SPR = {};
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'g_cheer', 'g_warn', 'g_think', 'g_shock', 'g_proud', 'g_type', 'g_peace', 'g_awkward', 'g_present', 'd_panic', 'd_curious', 'd_happy', 'd_raise', 'd_think', 'd_shock', 'd_sparkle', 'd_ok', 'd_relief', 'd_leader', 'q_base', 'q_point', 'q_tea', 'c_base', 'c_ok', 'c_cool', 'm_base', 'm_panic', 'm_cheeky', 'x_base', 'x_angry', 'x_force', 'b_base', 'b_sorry', 'k_base', 'k_read', 'g_pill', 'd_pill', 'm_oops', 'q_alarm', 'b_wave', 'x_panic', 'k_diary', 'c_read', 'g_tag', 'd_party', 'b_proud', 'm_tag', 'x_thumb', 'k_scroll', 'g_web', 'd_phone', 'm_photo', 'x_doubt', 'b_point', 'g_check', 'd_robot', 'm_clock', 'c_lock', 'b_badge', 'g_scissors', 'd_tangle', 'd_film', 'b_squash', 'g_detective', 'd_detective', 'b_cherry', 'g_fork', 'd_medal', 'm_review'];
// 竖版立绘只显示上半身：显示高度占整张图的比例（头顶到腰）
const SPRC = { d_panic: 0.55, d_curious: 0.55, d_happy: 0.55, d_sparkle: 0.6, d_ok: 0.66, d_raise: 0.72, d_think: 0.7, d_relief: 0.82, d_shock: 0.82, d_leader: 0.7, q_base: 0.6, q_point: 0.6, q_tea: 0.6, c_base: 0.58, c_ok: 0.58, c_cool: 0.58, m_base: 0.62, m_panic: 0.6, m_cheeky: 0.62, x_base: 0.6, x_angry: 0.6, x_force: 0.66, b_base: 0.62, b_sorry: 0.62, k_base: 0.6, k_read: 0.6, d_pill: 0.6, m_oops: 0.62, q_alarm: 0.6, b_wave: 0.62, x_panic: 0.62, k_diary: 0.6, c_read: 0.58, d_party: 0.68, b_proud: 0.6, m_tag: 0.62, x_thumb: 0.66, k_scroll: 0.62, d_phone: 0.66, m_photo: 0.6, x_doubt: 0.62, b_point: 0.62, d_robot: 0.66, m_clock: 0.62, c_lock: 0.6, b_badge: 0.62, d_tangle: 0.62, d_film: 0.64, b_squash: 0.7, d_detective: 0.64, b_cherry: 0.62, d_medal: 0.64, m_review: 0.62 };
const loadImg = n => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });


// ================= 台词（由 subtitles.json 生成，改台词请改 _gen_script.py）=================
const TEXT = {
  D01: "我天天用的开源项目「电饭煲计时器」，README 里有个错别字！想帮它改……可我没有写权限！",
  G01_01: "没权限也能贡献！开源项目谁都能看：复刻一份到自己名下，改好了，再发 PR 请维护者合并。",
  G01_02: "就像去大饭店帮厨：先读后厨规矩，抄一份菜谱回家改，改好了，端回去请主厨尝。",
  G01_03: "欢迎来到 AI娘 Git 课，第十集，参与开源！",
  C01: "慢着。动手之前，先看规矩。",
  D02: "开源项目还有规矩？",
  G02_01: "先看 LICENSE 许可证：它写明别人能怎么用这份代码。MIT 这类宽松许可，保留版权声明，就能随便用、随便改。",
  G02_02: "注意：没有许可证不等于随便用。默认版权归作者，别人不能随意复制、发布。",
  G02_03: "再看 CONTRIBUTING 贡献指南：分支怎么起名、提交怎么写、要不要先开 issue，都写在里面。",
  G02_04: "还有 CODE_OF_CONDUCT 行为准则：讨论时友善待人。这几份文件，仓库首页 README 旁边的标签页里都有。",
  C02: "先读规矩再动手。合规，批准。",
  K01: "我把这个项目四百多个 issue 全读了。带绿色 good first issue 标签的，最适合新人。",
  D03: "那我直接开改，改完再说？",
  G03_01: "先认领：在 issue 下面留言“我想试试这个”，等维护者回复，免得两个人撞车做同一件事。",
  G03_02: "自己发现的问题，先开一个新 issue 说清楚：哪里有问题、怎么复现、打算怎么改。",
  G03_03: "在 Issues 页按 good first issue、help wanted 标签筛选，就能找到项目欢迎外人帮忙的任务。",
  K02: "四十二号 issue：README 错别字。已认领。",
  X01: "没权限？我直接 clone 下来，改完推上去。",
  D04: "……推送被拒了！403！",
  G04_01: "别人的仓库你推不上去。点右上角的 Fork，复刻一份到你自己名下，这份随便改。",
  G04_02: "把你的复刻 clone 到电脑上：这时 origin 指向你自己的复刻，推送就没问题了。",
  G04_03: "再用 git remote add upstream 加上原项目的地址，叫它“上游”。以后从上游拿更新。",
  G04_04: "改东西照老规矩：新开一个分支，别直接在 main 上改。",
  X02: "自己的地盘，随便推。这条路走得通。",
  Q01: "注意！上游昨晚又合了二十个提交，你的复刻已经落后了！",
  D05: "落后了会怎样？",
  G05_01: "落后太多，PR 容易冲突。最简单的：在你的复刻页面点 Sync fork，再点 Update branch。",
  G05_02: "命令行也行：git fetch upstream，切到 main，git merge upstream/main，再 push 回你的复刻。",
  G05_03: "功能分支也要跟上：用第八集学的 rebase，接到最新的 main 后面。",
  Q02: "同步完成，零落后。用户放心。",
  B01: "家人们！改完推到复刻了，PR 怎么发到人家项目里去呀？",
  D06: "对呀，PR 不是在自己仓库里发的吗？",
  G06_01: "推送后，复刻页面会弹出 Compare & pull request；也可以点 Contribute，再点 Open pull request。",
  G06_02: "看清箭头：base 是原项目的 main，head 是你复刻里的分支。",
  G06_03: "描述里写上 Closes #42：PR 合进 main 时，这个 issue 会自动关闭。",
  G06_04: "再勾上 Allow edits by maintainers，维护者就能直接帮你改一两个小地方。",
  B02: "跨仓库送菜，一步到位！家人们，学会了吗！",
  M01: "喵？维护者说要改两处……是不是得关掉 PR，重新开一个？",
  D07: "被要求修改，要怎么更新 PR？",
  G07_01: "不用关！在同一个分支上继续改、提交、推送，PR 会自动更新。",
  G07_02: "每条意见改完回复一句，点 Resolve conversation；全部改好，再请维护者重新审查。",
  G07_03: "被要求修改很正常，不是针对你。维护者多半是业余时间在帮忙，耐心一点、礼貌一点。",
  M02: "改好推上去，PR 自己就更新了！合并了喵！",
  D08: "开源步骤好多……帮我划个重点！",
  G08_01: "读：先读 LICENSE 和 CONTRIBUTING，找 good first issue，留言认领。",
  G08_02: "同：Fork 一份，加上 upstream，开工前先同步上游。",
  G08_03: "交：从复刻发 PR 到原项目，写上 Closes，按审查意见继续推送。",
  D09: "我这就去给电饭煲计时器修错别字！",
  G09_01: "在 #42 下留言认领，然后 Fork，clone 你的复刻，加上 upstream。",
  G09_02: "fetch upstream，从最新的 main 开分支 fix-typo，改好错别字，提交，推到 origin。",
  G09_03: "点 Compare & pull request：base 选原项目的 main，描述写 Closes #42，勾上允许维护者编辑。",
  G09_04: "维护者请你顺手把一处标点也改掉：改好、推送，PR 自动更新，检查绿勾。",
  G09_05: "合并！issue 自动关闭，项目的贡献者列表里，多了你的头像。",
  D10: "我也是开源贡献者了！",
  G10_01: "下集预告：仓库越来越大？不小心把密码推上去了？大文件 LFS 和泄露急救，带你给仓库做一次体检！",
  G10_02: "喜欢的话记得一键三连，我们下集见！",
};
const DUR = Object.assign({}, window.DUR || {});

// ================= 时间轴 =================
const V = (b, id, pose) => ({ k: 'v', b, id, pose });
const BEAT = (b, d) => ({ k: 'beat', b, d: b === 'teaser' ? d * 0.75 : d * 0.35 });
const CH_COL = ['#7c5cff', '#3ec1ff', '#22c08b', '#ffb020', '#ff5c8a', '#ff7a3d', '#a66bff', '#ffd23f'];
const PLAN = [
  V('cold', 'D01', 'd_phone'),
  V('why', 'G01_01', 'g_fork'), V('why', 'G01_02', 'g_explain'),
  V('title', 'G01_03', 'g_cheer'), BEAT('title', 1.4),
  V('rulesQ', 'C01', 'c_read'), V('rulesQ', 'D02', 'd_curious'),
  V('rules', 'G02_01', 'g_explain'), V('rules', 'G02_02', 'g_warn'), V('rules', 'G02_03', 'g_point'), V('rules', 'G02_04', 'g_present'), V('rules', 'C02', 'c_ok'),
  V('issueQ', 'K01', 'k_read'), V('issueQ', 'D03', 'd_raise'),
  V('issue', 'G03_01', 'g_type'), V('issue', 'G03_02', 'g_think'), V('issue', 'G03_03', 'g_point'), V('issue', 'K02', 'k_scroll'),
  V('forkQ', 'X01', 'x_force'), V('forkQ', 'D04', 'd_shock'),
  V('fork', 'G04_01', 'g_fork'), V('fork', 'G04_02', 'g_type'), V('fork', 'G04_03', 'g_explain'), V('fork', 'G04_04', 'g_warn'), V('fork', 'X02', 'x_thumb'),
  V('syncQ', 'Q01', 'q_alarm'), V('syncQ', 'D05', 'd_think'),
  V('sync', 'G05_01', 'g_web'), V('sync', 'G05_02', 'g_type'), V('sync', 'G05_03', 'g_scissors'), V('sync', 'Q02', 'q_point'),
  V('prQ', 'B01', 'b_wave'), V('prQ', 'D06', 'd_curious'),
  V('pr', 'G06_01', 'g_point'), V('pr', 'G06_02', 'g_explain'), V('pr', 'G06_03', 'g_tag'), V('pr', 'G06_04', 'g_check'), V('pr', 'B02', 'b_proud'),
  V('reviewQ', 'M01', 'm_review'), V('reviewQ', 'D07', 'd_think'),
  V('review', 'G07_01', 'g_cheer'), V('review', 'G07_02', 'g_type'), V('review', 'G07_03', 'g_wink'), V('review', 'M02', 'm_cheeky'),
  V('ask10', 'D08', 'd_happy'),
  V('recap', 'G08_01', 'g_present'), V('recap', 'G08_02', 'g_fork'), V('recap', 'G08_03', 'g_proud'),
  V('askP', 'D09', 'd_leader'),
  V('practice', 'G09_01', 'g_cheer'), V('practice', 'G09_02', 'g_type'), V('practice', 'G09_03', 'g_point'), V('practice', 'G09_04', 'g_check'), V('practice', 'G09_05', 'g_proud'), V('practice', 'D10', 'd_medal'),
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
// ================= 第10集：参与开源 =================
Object.assign(SQ.C, { role: '先看规矩' }); Object.assign(SQ.K, { role: '读完 issue' }); Object.assign(SQ.X, { role: '直接推' });
Object.assign(SQ.Q, { role: '上游动态' }); Object.assign(SQ.B, { role: '送 PR' }); Object.assign(SQ.M, { role: '被审查' });
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

// ---- 冷开场：想修错别字，没有写权限 ----
SC.cold = (t, blk) => {
  const t0 = blk.t0, lk = P('D01', 0.62); let [sx, sy] = shake(t, lk, 10, 0.35); ctx.translate(sx, sy);
  bgBurst(t, '#123a5c', '#2f6fe0', W * 0.62, H * 0.5, 22, 0.35);
  readmeCard(t, 1290, 420, eBack(prog(t, t0 + 0.05, 0.45)) * 1.2, t >= P('D01', 0.3) ? 1 : 0);
  if (t >= P('D01', 0.3)) note(1290, 720, popIn(t, P('D01', 0.32)), '“者熟” → “煮熟”', CLUE, { fs: 40, rot: -0.03 });
  if (t >= lk) { flash(t, lk, 0.15, '255,80,120'); ctx.fillStyle = `rgba(15,12,31,${0.45 * eOut(prog(t, lk, 0.3))})`; rr(950, 160, 680, 520, 24); ctx.fill(); lockIcon(1290, 360, eBack(prog(t, lk, 0.35)) * 1.4); stamp(t, lk + 0.2, 1290, 540, '没有写权限', BADC, 60, -0.08); }
  const p = spring(prog(t, t0, 0.9)); if (t < lk) sprite('d_phone', 470, H + 40, 990, { scale: lerp(1.2, 1, p) * breath(t, 1) }); else sprite('d_shock', 470, H + 40, 990, { scale: lerp(1.15, 1, spring(prog(t, lk, 0.6))) });
  pill(470, 150, '大肥鱼 · 想帮忙', SQ.D.col, popIn(t, t0 + 0.15), { font: F_FANCY, fs: 44, fg: '#fff' });
  if (t >= lk) fancy('想改却改不了？！', 470, 270, 76, t, lk + 0.1, { rot: -0.06, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
};
SFX_FNS.push(() => { const b = BK.cold; sfx(b.t0 + 0.05, 'swoosh_in', 0.5); sfx(b.t0 + 0.15, 'pop', 0.4); sfx(P('D01', 0.3), 'ding', 0.4); sfx(P('D01', 0.32), 'pop', 0.4);
  sfx(P('D01', 0.62), 'impact', 0.6); sfx(P('D01', 0.62) + 0.2, 'stamp', 0.6); sfx(P('D01', 0.62) + 0.1, 'boing', 0.4); });

// ---- 引入：复刻 → 改 → PR；帮厨比喻 ----
SC.why = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const sw = S('G01_02') - 0.2, a1 = 1 - eIO(prog(t, sw, 0.35));
  if (a1 > 0) { ctx.save(); ctx.globalAlpha *= a1;
    pill(1280, 130, '🌍 没权限也能贡献', CLUE, popIn(t, blk.t0 + 0.1), { fs: 42, font: F_BODY + ',' + EMOJI });
    const k1 = P('G01_01', 0.35), k2 = P('G01_01', 0.55), k3 = P('G01_01', 0.72), k4 = P('G01_01', 0.88);
    const nodes = [[900, 330, '🏛️', '原项目', 'octo-chef', UPC, blk.t0 + 0.2], [1660, 330, '🍴', '你的复刻', 'dafeiyu', ORIC, k1], [1660, 660, '✏️', '改好了', 'fix-typo', LOCC, k2], [900, 660, '✅', '维护者合并', 'merged', PRC, k4]];
    nodes.forEach(n => { const s = popIn(t, n[6], 0.4); if (s <= 0) return; ctx.save(); ctx.translate(n[0], n[1]); ctx.scale(s, s); box(-170, -95, 340, 190, 24, '#fffaf0', n[5], 7); txt(n[2], 0, -38, 60, '#000', { align: 'center', font: EMOJI, bold: false }); txt(n[3], 0, 28, 36, '#1b1433', { align: 'center' }); txt(n[4], 0, 68, 22, n[5], { align: 'center', font: F_CODE }); ctx.restore(); });
    const arr = (x0, y0, x1, y1, t0, col, lab, lx, ly) => { if (t < t0) return; const p = eOut(prog(t, t0, 0.4)); seg(x0, y0, lerp(x0, x1, p), lerp(y0, y1, p), col, 1, 9); if (p > 0.6) pill(lx, ly, lab, col, popIn(t, t0 + 0.15), { fs: 28, font: isCJK(lab) ? F_BODY : F_CODE }); };
    arr(1080, 330, 1480, 330, k1 - 0.1, ORIC, 'Fork 复刻', 1280, 280); arr(1660, 435, 1660, 555, k2 - 0.1, LOCC, '改', 1720, 495); arr(1480, 660, 1080, 660, k3, PRC, 'Pull Request', 1280, 610);
    ctx.restore(); }
  if (t >= sw) { const a = eOut(prog(t, sw, 0.35)); ctx.save(); ctx.globalAlpha *= a;
    pill(1280, 130, '👩‍🍳 就像去大饭店帮厨', CLUE, popIn(t, sw + 0.1), { fs: 42, font: F_BODY + ',' + EMOJI });
    [['📜', '读后厨规矩', 'LICENSE · CONTRIBUTING', P('G01_02', 0.12)], ['📋', '抄菜谱回家改', 'Fork · 分支', P('G01_02', 0.42)], ['🍲', '端回去请主厨尝', 'Pull Request', P('G01_02', 0.72)]].forEach((c, i) => { const s = popIn(t, c[3], 0.4); if (s <= 0) return;
      const x = 900 + i * 380; ctx.save(); ctx.translate(x, 450); ctx.scale(s, s); ctx.rotate((i - 1) * 0.04);
      box(-165, -180, 330, 360, 26, '#fffaf0', ACC, 7); txt(c[0], 0, -75, 92, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 0, 40, 38, '#1b1433', { align: 'center' }); txt(c[2], 0, 110, 22, ACC, { align: 'center', font: F_CODE, max: 300 }); ctx.restore();
      if (i < 2 && t >= c[3] + 0.2) txt('→', x + 190, 450, 60, '#fff', { align: 'center' }); });
    ctx.restore(); }
};
SFX_FNS.push(() => { const b = BK.why; sfx(b.t0 + 0.1, 'pop', 0.4); sfx(b.t0 + 0.2, 'pop', 0.3); [0.35, 0.55, 0.72, 0.88].forEach(f => sfx(P('G01_01', f), 'pop', 0.35)); sfx(P('G01_01', 0.72), 'whoosh', 0.4);
  sfx(S('G01_02') - 0.2, 'swoosh_in', 0.4); [0.12, 0.42, 0.72].forEach(f => sfx(P('G01_02', f), 'pop', 0.4)); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#123a5c', '#2f6fe0', W * 0.6, H * 0.45, 28, 0.2);
  ['🍴', '🌍', '🤝', '⭐', '✨'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  sprite('g_fork', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 60, 1040);
  sprite('d_happy', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 800);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-400, -10, 95, '#ff5c8a', '第10集', { fs: 48, rot: -0.15, fg: '#fff' });
    fancy('参与', 40, -70, 130, t, -99, FX.white);
    fancy('开源！', 110, 80, 150, t, -99, FX.yel);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况（左侧插图，画在 80..960）----
function probRulesQ(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.1, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 450); ctx.scale(s, s); ctx.translate(-520, -450);
  ghWin(110, 170, 820, 560, 'github.com/octo-chef/rice-timer'); repoHead(140, 260, 'octo-chef', 'rice-timer');
  const files = [['📁', 'src/', 0], ['📄', 'README.md', 0], ['⚖️', 'LICENSE', 1], ['🤝', 'CONTRIBUTING.md', 1], ['💬', 'CODE_OF_CONDUCT.md', 1], ['📄', 'package.json', 0]];
  const hot = P('C01', 0.45);
  files.forEach((f, i) => { const a = clamp(prog(t, t0 + 0.2 + i * 0.05, 0.2)); const y = 330 + i * 64; ctx.save(); ctx.globalAlpha *= a;
    const h = f[2] && t >= hot; if (h) box(130, y - 28, 780, 56, 8, hexA(CLUE, 0.25 + 0.08 * Math.sin(t * 8)), CLUE, 3); else box(130, y + 28, 780, 2, 0, '#eaeef2');
    txt(f[0], 160, y, 28, '#000', { font: EMOJI, bold: false }); txt(f[1], 210, y, 28, '#0969da', { font: F_CODE, bold: false }); if (h) txt('👈 先看', 890, y, 26, '#9a6700', { align: 'right', font: F_BODY + ',' + EMOJI }); ctx.restore(); });
  ctx.restore();
  if (U.D02 && t >= U.D02.vo + 0.3) stamp(t, U.D02.vo + 0.3, 520, 820, '还有规矩？', '#e07a3d', 58, -0.08);
}
const ISSUES = [
  { title: '支持暗色模式', labels: [['help wanted', HWC]], num: '#57' }, { title: 'README 错别字', labels: [['good first issue', GFI]], num: '#42', g: 1 },
  { title: '倒计时归零后崩溃', labels: [['bug', BADC]], num: '#61' }, { title: '补充英文文档', labels: [['good first issue', GFI]], num: '#45', g: 1 },
  { title: '重构计时模块', labels: [['refactor', '#57606a']], num: '#33' }];
function probIssueQ(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.1, 0.45); if (s <= 0) return; const hot = P('K01', 0.6);
  ctx.save(); ctx.translate(520, 450); ctx.scale(s, s); ctx.translate(-520, -450);
  ghWin(100, 170, 840, 560, 'github.com/octo-chef/rice-timer/issues');
  txt('⊙ 412 Open', 140, 260, 28, '#24292f', { font: F_CODE }); txt('✓ 1,208 Closed', 380, 260, 26, '#57606a', { font: F_CODE, bold: false });
  ISSUES.forEach((r, i) => issueRow(t, 120, 300 + i * 82, 800, Object.assign({ t: t0 + 0.25 + i * 0.06, hot: r.g && t >= hot, dim: !r.g && t >= hot }, r)));
  ctx.restore();
  if (t >= hot + 0.2) note(520, 780, popIn(t, hot + 0.2), '新人从这里开始', GFI, { fs: 36, rot: -0.03 });
  if (U.D03 && t >= U.D03.vo + 0.3) stamp(t, U.D03.vo + 0.3, 520, 870, '直接开改？', BADC, 52, -0.08);
}
function probForkQ(t, blk) {
  const t0 = blk.t0, d4 = U.D04 ? U.D04.vo : 1e9;
  const L = [{ s: 'git clone https://github.com/octo-chef/rice-timer.git', t: t0 + 0.2, cmd: true, dur: 0.6 }, { s: '{d}... 改好错别字，提交 ...', t: P('X01', 0.5) },
    { s: 'git push', t: P('X01', 0.7), cmd: true, dur: 0.2 }, { s: '{r}remote: Permission to octo-chef/rice-timer denied.', t: d4 - 0.1 }, { s: '{r}fatal: ... error: 403', t: d4 }];
  terminal(t, 100, 220, 840, 470, L, { title: '终端 — rice-timer', accent: '#d6283e', fs: 22, prompt: false });
  if (t >= d4) { flash(t, d4, 0.12, '255,60,90'); stamp(t, d4 + 0.1, 520, 800, '推送被拒 403', BADC, 58, -0.08); }
}
function probSyncQ(t, blk) {
  const t0 = blk.t0; box(100, 200, 840, 520, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
  txt('🏛️ 上游 main', 140, 270, 28, UPC, { font: EMOJI + ',' + F_BODY }); txt('🍴 你的复刻 main', 140, 520, 28, ORIC, { font: EMOJI + ',' + F_BODY });
  const N = {}, E = []; for (let i = 0; i < 3; i++) { N['a' + i] = { x: 200 + i * 110, y: 360, col: UPC, t0: t0 + 0.1 + i * 0.05 }; N['f' + i] = { x: 200 + i * 110, y: 610, col: ORIC, t0: t0 + 0.1 + i * 0.05 }; if (i) { E.push(['a' + (i - 1), 'a' + i, t0 + 0.1 + i * 0.05]); E.push(['f' + (i - 1), 'f' + i, t0 + 0.1 + i * 0.05]); } }
  const nw = P('Q01', 0.3); for (let i = 0; i < 5; i++) { const tt = nw + i * 0.12; N['n' + i] = { x: 530 + i * 90, y: 360, col: CLUE, t0: tt, r: 16 }; E.push([i ? 'n' + (i - 1) : 'a2', 'n' + i, tt]); }
  drawGraph(t, N, E, { r: 20, lw: 7 });
  if (t >= nw + 0.6) { txt('+20', 890, 300, 34, CLUE, { align: 'right', font: F_CODE }); ctx.save(); ctx.setLineDash([12, 10]); seg(420, 610, 880, 610, '#5a5580', 1, 5); ctx.restore(); pill(650, 670, 'This branch is 20 commits behind', '#ff9aa9', popIn(t, nw + 0.7), { fs: 22, font: F_CODE }); }
  if (U.D05 && t >= U.D05.vo + 0.3) stamp(t, U.D05.vo + 0.3, 520, 820, '落后 20 个！', BADC, 56, -0.08);
}
function probPrQ(t, blk) {
  const t0 = blk.t0; box(100, 200, 840, 520, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
  [[300, '🍴', '你的复刻', 'fix-typo ✓ 已推送', ORIC], [740, '🏛️', '原项目', 'octo-chef/rice-timer', UPC]].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s <= 0) return; ctx.save(); ctx.translate(c[0], 420); ctx.scale(s, s); box(-170, -120, 340, 240, 22, '#fff', c[4], 6); txt(c[1], 0, -50, 64, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[2], 0, 30, 34, '#1b1433', { align: 'center' }); txt(c[3], 0, 80, 20, c[4], { align: 'center', font: F_CODE + ',' + EMOJI, max: 320 }); ctx.restore(); });
  if (t >= P('B01', 0.5)) { const p = eOut(prog(t, P('B01', 0.5), 0.4)); ctx.save(); ctx.setLineDash([14, 10]); seg(480, 420, lerp(480, 560, p), 420, PRC, 1, 8); ctx.restore(); txt('?', 520, 360, 70, CLUE, { align: 'center', font: F_FANCY, bold: false }); txt('PR', 520, 470, 28, PRC, { align: 'center', font: F_CODE }); }
  if (U.D06 && t >= U.D06.vo + 0.3) stamp(t, U.D06.vo + 0.3, 520, 820, 'PR 发到哪？', '#d6336c', 56, -0.08);
}
function probReviewQ(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.1, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 450); ctx.scale(s, s); ctx.translate(-520, -450);
  ghWin(100, 170, 840, 560, 'github.com/octo-chef/rice-timer/pull/88');
  txt('修正 README 错别字 #88', 140, 260, 32, '#24292f', {}); box(140, 290, 760, 70, 12, '#fff5f5', BADC, 3); txt('✗ octo-chef requested changes', 170, 325, 26, BADC, { font: F_CODE });
  [['README.md 第 12 行', '这里的句号也改成全角吧'], ['README.md 第 20 行', '“定时” 统一成 “计时”']].forEach((c, i) => { const a = clamp(prog(t, P('M01', 0.2 + i * 0.15), 0.25)); ctx.save(); ctx.globalAlpha *= a; box(140, 390 + i * 140, 760, 120, 12, '#fff', '#d0d7de', 2); txt('💬 ' + c[0], 170, 425 + i * 140, 22, '#57606a', { font: EMOJI + ',' + F_BODY, bold: false }); txt(c[1], 170, 470 + i * 140, 28, '#24292f', {}); ctx.restore(); });
  ctx.restore();
  if (t >= P('M01', 0.6)) { const s2 = popIn(t, P('M01', 0.6)); ghBtn(520, 790, '关掉 PR，重开一个？', { fs: 30, bg: '#fff', bd: BADC, fg: BADC, w: 420, h: 66 }); }
  if (U.D07 && t >= U.D07.vo + 0.3) stamp(t, U.D07.vo + 0.3, 520, 880, '怎么更新？', '#a855f7', 50, -0.08);
}
function probAsk10(t, blk) {
  const t0 = blk.t0;
  [['📖 读', UPC], ['🔄 同', ORIC], ['📮 交', PRC]].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s > 0) { ctx.save(); ctx.translate(250 + i * 270, 480); ctx.scale(s, s); ctx.rotate((i - 1) * 0.06); box(-110, -140, 220, 280, 24, '#fff', c[1], 8); txt(c[0], 0, 0, 52, '#1b1433', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false }); ctx.restore(); } });
  if (t >= t0 + 0.6) txt('三个重点', 520, 760, 64, ACC, { align: 'center', font: F_FANCY, bold: false });
}
function probAskP(t, blk) {
  const t0 = blk.t0; readmeCard(t, 520, 430, popIn(t, t0 + 0.1, 0.4) * 1.15, 1);
  if (t >= P('D09', 0.5)) stamp(t, P('D09', 0.5), 520, 800, '修好它！', GOODC, 64, -0.08);
}
const PROB = {
  rulesQ: { chap: ['第①步', '先读规矩', '#e07a3d', F_BODY], q: '还有规矩？', bg: ['#fff0e0', '#ffd9b3'], draw: probRulesQ },
  issueQ: { chap: ['第②步', '认领 issue', GFI, F_BODY], q: '直接开改？', bg: ['#efe8ff', '#dccfff'], draw: probIssueQ },
  forkQ: { chap: ['第③步', '复刻 Fork', '#d6283e', F_BODY], q: '推送被拒！', bg: ['#ffe3e6', '#ffc4cc'], draw: probForkQ },
  syncQ: { chap: ['第④步', '同步上游', '#e8890c', F_BODY], q: '落后会怎样？', bg: ['#fff4db', '#ffe3a3'], draw: probSyncQ },
  prQ: { chap: ['第⑤步', '跨仓库发 PR', PRC, F_BODY], q: 'PR 发哪？', bg: ['#e3f7e9', '#c2edd0'], draw: probPrQ },
  reviewQ: { chap: ['第⑥步', '回应审查', '#a855f7', F_BODY], q: '怎么更新？', bg: ['#f3e8ff', '#e2ccff'], draw: probReviewQ },
  ask10: { chap: ['复习', '读 · 同 · 交', ACC, F_BODY], q: '帮我划重点！', bg: ['#ece3ff', '#d6c4ff'], draw: probAsk10 },
  askP: { chap: ['实战', '修好错别字', GOODC, F_BODY], q: '这就去修！', bg: ['#e3f7e9', '#c2edd0'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  for (let i = 0; i < 6; i++) sfx(BK.rulesQ.t0 + 0.2 + i * 0.05, 'pop', 0.2); sfx(P('C01', 0.45), 'ding', 0.4); sfx(U.D02.vo + 0.3, 'stamp', 0.6);
  for (let i = 0; i < 5; i++) sfx(BK.issueQ.t0 + 0.25 + i * 0.06, 'pop', 0.2); sfx(P('K01', 0.6), 'sparkle', 0.4); sfx(U.D03.vo + 0.3, 'stamp', 0.6);
  typeSfx(BK.forkQ.t0 + 0.2, 50, 0.6); typeSfx(P('X01', 0.7), 8, 0.2); sfx(U.D04.vo, 'buzz', 0.6); sfx(U.D04.vo + 0.1, 'stamp', 0.6);
  for (let i = 0; i < 5; i++) sfx(P('Q01', 0.3) + i * 0.12, 'pop', 0.3); sfx(P('Q01', 0.3) + 0.7, 'buzz', 0.4); sfx(U.D05.vo + 0.3, 'stamp', 0.6);
  sfx(BK.prQ.t0 + 0.15, 'pop', 0.3); sfx(BK.prQ.t0 + 0.27, 'pop', 0.3); sfx(P('B01', 0.5), 'whoosh', 0.4); sfx(U.D06.vo + 0.3, 'stamp', 0.6);
  sfx(BK.reviewQ.t0 + 0.1, 'pop', 0.4); sfx(P('M01', 0.2), 'pop', 0.3); sfx(P('M01', 0.35), 'pop', 0.3); sfx(P('M01', 0.6), 'buzz', 0.3); sfx(U.D07.vo + 0.3, 'stamp', 0.6);
  [0, 1, 2].forEach(i => sfx(BK.ask10.t0 + 0.15 + i * 0.12, 'pop', 0.3)); sfx(BK.askP.t0 + 0.1, 'pop', 0.4); sfx(P('D09', 0.5), 'stamp', 0.6);
});

// ---- 讲解①：读规矩（Claude）----
SC.rules = (t, blk, en) => {
  bgLecture(t, '#e07a3d'); lecturer(t, blk, en, blk.t0);
  const g1 = S('G02_01'), g2 = S('G02_02') - 0.15, g3 = S('G02_03') - 0.15, g4 = S('G02_04') - 0.15, g5 = E('G02_04');
  const fade = (a0, a1) => clamp(eOut(prog(t, a0, 0.3)) * (1 - prog(t, a1, 0.3)));
  if (t < g3 + 0.3) { const a = fade(g1, g3); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 110, 1140, 470, 'github.com/octo-chef/rice-timer/blob/main/LICENSE');
    txt('⚖️ LICENSE', 740, 210, 34, '#24292f', { font: EMOJI + ',' + F_CODE });
    const lic = ['MIT License', '', 'Copyright (c) 2026 octo-chef', '', 'Permission is hereby granted, free of charge,', 'to any person obtaining a copy of this software ...'];
    lic.forEach((l, i) => { const p = clamp(prog(t, g1 + 0.2 + i * 0.08, 0.2)); ctx.save(); ctx.globalAlpha *= p; const hot = i === 2 && t >= P('G02_01', 0.7); if (hot) box(730, 262 + i * 46, 700, 42, 8, hexA(CLUE, 0.3), CLUE, 3); txt(l, 750, 283 + i * 46, 26, '#24292f', { font: F_CODE, bold: i === 0 }); ctx.restore(); });
    [['✓ 商用', GOODC, 0.4], ['✓ 修改', GOODC, 0.48], ['✓ 分发', GOODC, 0.56], ['📌 保留版权声明', UPC, 0.7]].forEach((c, i) => pill(860 + i * 250 + (i === 3 ? 40 : 0), 660, c[0], c[1], popIn(t, P('G02_01', c[2])), { fs: 32, font: F_BODY + ',' + EMOJI }));
    if (t >= g2) { const b = eOut(prog(t, g2, 0.3)); ctx.fillStyle = `rgba(15,12,31,${0.82 * b})`; rr(690, 100, 1170, 640, 24); ctx.fill();
      const s = popIn(t, g2 + 0.1, 0.4); ctx.save(); ctx.translate(1270, 380); ctx.scale(s, s); box(-380, -170, 760, 340, 26, '#fff', BADC, 7); txt('❓ 没有 LICENSE', 0, -105, 42, BADC, { align: 'center', font: EMOJI + ',' + F_CODE });
      txt('© 默认版权归作者', 0, -25, 40, '#1b1433', { align: 'center' }); txt('✗ 复制   ✗ 发布   ✗ 拿去用', 0, 60, 34, BADC, { align: 'center' }); ctx.restore();
      if (t >= P('G02_02', 0.25)) stamp(t, P('G02_02', 0.25), 1270, 660, '≠ 随便用', BADC, 66, -0.08); }
    ctx.restore(); }
  if (t >= g3 - 0.1 && t < g4 + 0.3) { const a = fade(g3, g4); ctx.save(); ctx.globalAlpha *= a;
    const L = [{ s: '# 🤝 贡献指南', t: g3 + 0.1 }, { s: '', t: g3 + 0.1 }, { s: '## 分支命名：fix/xxx、feat/xxx', t: P('G02_03', 0.3), hl: [P('G02_03', 0.3), P('G02_03', 0.48)] },
      { s: '## 提交说明：动词开头，一行写清', t: P('G02_03', 0.48), hl: [P('G02_03', 0.48), P('G02_03', 0.66)] }, { s: '## 大改动：先开 issue 讨论', t: P('G02_03', 0.66), hl: [P('G02_03', 0.66), g4] }, { s: '## 提交前：npm test 全绿', t: P('G02_03', 0.8) }];
    ymlEditor(t, 700, 130, 1140, 560, 'CONTRIBUTING.md', L, { fs: 32, accent: '#e07a3d' });
    ctx.restore(); }
  if (t >= g4 - 0.1) { const a = clamp(eOut(prog(t, g4, 0.3)) * (1 - prog(t, U.C02.vo - 0.3, 0.3))); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 130, 1140, 500, 'github.com/octo-chef/rice-timer');
    const tabs = [['📖 README', -1], ['💬 Code of conduct', P('G02_04', 0.05)], ['🤝 Contributing', P('G02_04', 0.55)], ['⚖️ MIT license', P('G02_04', 0.65)], ['🛡️ Security', 1e9]];
    let x = 730; tabs.forEach((tb, i) => { ctx.font = `bold 20px ${F_CODE}`; const w = ctx.measureText(tb[0]).width + 36; const hot = t >= tb[1] && (i === tabs.length - 1 || t < (tabs[i + 1][1] > 1e8 ? 1e9 : tabs[i + 1][1]) || i === 3);
      const on = tb[1] > 0 && t >= tb[1]; box(x, 210, w, 56, [12, 12, 0, 0], on ? '#fff8c5' : '#fff', on ? '#d4a72c' : '#d0d7de', on ? 4 : 2); txt(tb[0], x + w / 2, 239, 19, '#24292f', { align: 'center', font: EMOJI + ',' + F_CODE }); x += w + 10; });
    box(730, 266, 1080, 2, 0, '#d0d7de');
    if (t >= P('G02_04', 0.08)) { txt('💬 行为准则', 760, 330, 34, '#24292f', { font: EMOJI + ',' + F_BODY }); ['· 友善、尊重每一位参与者', '· 对事不对人', '· 欢迎新人提问'].forEach((l, i) => { const p = clamp(prog(t, P('G02_04', 0.12 + i * 0.08), 0.2)); ctx.save(); ctx.globalAlpha *= p; txt(l, 780, 400 + i * 56, 30, '#24292f', {}); ctx.restore(); }); }
    if (t >= P('G02_04', 0.7)) note(1270, 740, popIn(t, P('G02_04', 0.7)), 'README 旁边的标签页里都有', CLUE, { fs: 36 });
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['C02']); for (let i = 0; i < 6; i++) sfx(S('G02_01') + 0.2 + i * 0.08, 'pop', 0.15); sfx(P('G02_01', 0.7), 'ding', 0.4); [0.4, 0.48, 0.56, 0.7].forEach(f => sfx(P('G02_01', f), 'pop', 0.3));
  sfx(S('G02_02') - 0.15, 'whoosh', 0.4); sfx(S('G02_02') - 0.05, 'pop', 0.4); sfx(P('G02_02', 0.25), 'stamp', 0.6); sfx(S('G02_03') - 0.15, 'swoosh_in', 0.4); [0.3, 0.48, 0.66].forEach(f => sfx(P('G02_03', f), 'ding', 0.3));
  sfx(S('G02_04') - 0.15, 'swoosh_in', 0.4); [0.05, 0.55, 0.65].forEach(f => sfx(P('G02_04', f), 'pop', 0.35)); sfx(P('G02_04', 0.7), 'pop', 0.4); sfx(P('C02', 0.5), 'stamp', 0.7); });

// ---- 讲解②：认领 issue（Kimi）----
SC.issue = (t, blk, en) => {
  bgLecture(t, GFI); lecturer(t, blk, en, blk.t0);
  const g1 = S('G03_01'), g2 = S('G03_02') - 0.15, g3 = S('G03_03') - 0.15;
  const fade = (a0, a1) => clamp(eOut(prog(t, a0, 0.3)) * (1 - prog(t, a1, 0.3)));
  if (t < g2 + 0.3) { const a = fade(g1, g2); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 100, 1140, 720, 'github.com/octo-chef/rice-timer/issues/42');
    txt('README 错别字 #42', 740, 200, 36, '#24292f', {}); ghLabel(1150, 200, 'good first issue', GFI, 1, 22);
    const cm = [['D', '大肥鱼', '我想试试这个！', P('G03_01', 0.2), '#ddf4ff'], ['G', 'octo-chef（维护者）', '好的，交给你了 👍', P('G03_01', 0.55), '#fff']];
    cm.forEach((c, i) => { const s = popIn(t, c[3], 0.35); if (s <= 0) return; const y = 300 + i * 170; ctx.save(); ctx.translate(0, (1 - s) * 30); ctx.globalAlpha *= clamp(s);
      avatar(c[0], 780, y + 40, 38, { gray: c[0] === 'G' }); box(840, y, 940, 130, 12, c[4], '#d0d7de', 2); txt(c[1], 870, y + 34, 22, '#57606a', { bold: false }); txt(c[2], 870, y + 84, 34, '#24292f', { font: F_BODY + ',' + EMOJI }); ctx.restore(); });
    if (t >= P('G03_01', 0.72)) { box(740, 660, 1060, 70, 12, '#f6f8fa', '#d0d7de', 2); txt('Assignees', 770, 695, 24, '#57606a', { font: F_CODE }); avatar('D', 940, 695, 24); txt('大肥鱼', 980, 695, 26, '#24292f', {}); stamp(t, P('G03_01', 0.75), 1650, 690, '已认领', GOODC, 44, -0.08); }
    if (t >= P('G03_01', 0.85)) note(1270, 770, popIn(t, P('G03_01', 0.85)), '免得两个人撞车', CLUE, { fs: 34 });
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fade(g2, g3); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 100, 1140, 720, 'github.com/octo-chef/rice-timer/issues/new');
    txt('New issue', 740, 200, 36, '#24292f', { font: F_CODE }); box(740, 240, 1060, 64, 10, '#fff', '#0969da', 3); txt('倒计时结束没有提示音', 770, 272, 30, '#24292f', {});
    [['🐞 问题在哪', '点开始后，倒计时归零但不响', 0.3], ['🔁 怎么复现', '1. 设 1 分钟  2. 锁屏  3. 等待', 0.5], ['💡 打算怎么改', '锁屏时改用系统通知', 0.7]].forEach((c, i) => { const s = clamp(prog(t, P('G03_02', c[2]), 0.25)); ctx.save(); ctx.globalAlpha *= s; const y = 350 + i * 145;
      txt(c[0], 750, y, 30, '#24292f', { font: EMOJI + ',' + F_BODY }); box(740, y + 28, 1060, 70, 10, '#f6f8fa', '#d0d7de', 2); txt(c[1], 770, y + 63, 28, '#57606a', { bold: false }); ctx.restore(); });
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = clamp(eOut(prog(t, g3, 0.3)) * (1 - prog(t, U.K02.vo - 0.3, 0.3))); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 100, 1140, 720, 'github.com/octo-chef/rice-timer/issues');
    box(740, 180, 1060, 60, 10, '#fff', '#0969da', 3); const q = 'is:open label:"good first issue"'; const n = Math.floor(clamp(prog(t, g3 + 0.15, 0.6)) * q.length); txt('🔍 ' + q.slice(0, n), 760, 210, 26, '#24292f', { font: EMOJI + ',' + F_CODE });
    const flt = P('G03_03', 0.45);
    ISSUES.forEach((r, i) => { const row = r.g || t < flt ? i : i; const keep = r.g || r.labels[0][0] === 'help wanted'; issueRow(t, 740, 270 + i * 86, 1060, Object.assign({}, r, { t: g3 + 0.2 + i * 0.05, dim: t >= flt && !keep, hot: t >= flt && keep })); });
    ghLabel(760, 740, 'good first issue', GFI, popIn(t, P('G03_03', 0.25)), 26); ghLabel(1080, 740, 'help wanted', HWC, popIn(t, P('G03_03', 0.35)), 26);
    if (t >= P('G03_03', 0.7)) txt('= 项目欢迎外人帮忙', 1300, 740, 30, '#24292f', {});
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['K02']); sfx(S('G03_01') + 0.1, 'pop', 0.4); sfx(P('G03_01', 0.2), 'pop', 0.4); sfx(P('G03_01', 0.55), 'ding', 0.4); sfx(P('G03_01', 0.75), 'stamp', 0.6); sfx(P('G03_01', 0.85), 'pop', 0.3);
  sfx(S('G03_02') - 0.15, 'swoosh_in', 0.4); typeSfx(S('G03_02'), 10, 0.4); [0.3, 0.5, 0.7].forEach(f => sfx(P('G03_02', f), 'pop', 0.3));
  sfx(S('G03_03') - 0.15, 'swoosh_in', 0.4); typeSfx(S('G03_03') + 0.0, 30, 0.6); sfx(P('G03_03', 0.45), 'ding', 0.4); [0.25, 0.35].forEach(f => sfx(P('G03_03', f), 'pop', 0.3)); });

// ---- 讲解③：复刻 Fork（Grok）----
SC.fork = (t, blk, en) => {
  bgLecture(t, '#d6283e'); lecturer(t, blk, en, blk.t0);
  const g1 = S('G04_01'), g2 = S('G04_02') - 0.15, g3 = S('G04_03') - 0.15, g4 = S('G04_04') - 0.15;
  const fade = (a0, a1) => clamp(eOut(prog(t, a0, 0.3)) * (1 - prog(t, a1, 0.3)));
  if (t < g2 + 0.3) { const a = fade(g1, g2); ctx.save(); ctx.globalAlpha *= a;
    const ck = P('G04_01', 0.35), cp = P('G04_01', 0.55);
    ghWin(700, 100, 1140, 300, 'github.com/octo-chef/rice-timer'); repoHead(740, 200, 'octo-chef', 'rice-timer');
    ghBtn(1460, 200, '👁 Watch', { fs: 22 }); ghBtn(1600, 200, '🍴 Fork 87', { fs: 22, hot: t >= P('G04_01', 0.2), hc: '#d6283e', t }); ghBtn(1745, 200, '⭐ 2.3k', { fs: 22 });
    if (t >= P('G04_01', 0.2) && t < ck + 0.3) { const [mx, my] = moveP(t, P('G04_01', 0.2), 0.4, 1200, 360, 1610, 215, 40); txt('👆', mx, my + 20, 54, '#000', { align: 'center', font: EMOJI, bold: false }); if (t >= ck) flash(t, ck, 0.1); }
    txt('Create a new fork', 740, 300, 26, '#57606a', { font: F_CODE, bold: false });
    if (t >= cp) { const [x, y, p] = moveP(t, cp, 0.6, 1000, 260, 1270, 600, 120); ghWin(x - 380, y - 90, 760, 200, 'github.com/dafeiyu/rice-timer', { border: ORIC }); if (p > 0.6) { repoHead(x - 340, y + 10, 'dafeiyu', 'rice-timer', { from: 'octo-chef/rice-timer' }); } }
    if (t >= cp + 0.7) { stamp(t, cp + 0.7, 1660, 600, '你自己的！', ORIC, 46, -0.08); note(1270, 800, popIn(t, cp + 0.8), '这份随便改', ORIC, { fs: 36 }); }
    ctx.restore(); }
  if (t >= g2 - 0.1) { const a = clamp(eOut(prog(t, g2, 0.3)) * (1 - prog(t, g4, 0.3))); ctx.save(); ctx.globalAlpha *= a;
    triNode(t, 'up', popIn(t, g2 + 0.05), '原项目', 'octo-chef/rice-timer', UPC, '🏛️');
    triNode(t, 'ori', popIn(t, g2 + 0.15), '你的复刻', 'dafeiyu/rice-timer', ORIC, '🍴');
    triNode(t, 'loc', popIn(t, P('G04_02', 0.25)), '你的电脑', '~/rice-timer', LOCC, '💻');
    triArrow(t, 'up', 'ori', g2 + 0.2, ORIC, 'fork', { pad0: 175, pad1: 175, ly: -40 });
    triArrow(t, 'ori', 'loc', P('G04_02', 0.25), LOCC, 'clone', { side: -24, lx: -90, ly: -30 });
    triArrow(t, 'loc', 'ori', P('G04_02', 0.6), GOODC, 'push ✓', { side: -24, lx: 120, ly: 30 });
    if (t < g3 + 0.2) cmdBar(t, 1270, 860, 'git clone https://github.com/dafeiyu/rice-timer.git', P('G04_02', 0.05), 0.7, { out: g3, fs: 26, col: LOCC });
    if (t >= P('G04_02', 0.45)) pill(1730, 390, 'origin = 你的复刻', ORIC, popIn(t, P('G04_02', 0.45)), { fs: 28, font: F_BODY });
    if (t >= g3) { triArrow(t, 'up', 'loc', P('G04_03', 0.35), UPC, 'upstream', { side: 24, lx: -30, ly: -70, dash: true });
      cmdBar(t, 1270, 860, 'git remote add upstream https://github.com/octo-chef/rice-timer.git', P('G04_03', 0.05), 0.8, { fs: 24, col: UPC });
      if (t >= P('G04_03', 0.6)) pill(880, 580, '上游：以后从这拿更新', UPC, popIn(t, P('G04_03', 0.6)), { fs: 28, font: F_BODY }); }
    ctx.restore(); }
  if (t >= g4 - 0.1) { const a = clamp(eOut(prog(t, g4, 0.3)) * (1 - prog(t, U.X02.vo - 0.3, 0.3))); ctx.save(); ctx.globalAlpha *= a;
    cmdBar(t, 1270, 170, 'git switch -c fix-typo', P('G04_04', 0.08), 0.5, { fs: 38, col: FEATC });
    const N = { a: { x: 820, y: 460, col: MAINC, t0: g4 + 0.05, lab: 'main', up: true }, b: { x: 1020, y: 460, col: MAINC, t0: g4 + 0.1 }, c: { x: 1220, y: 460, col: MAINC, t0: g4 + 0.15, lab: 'main', up: true } };
    const E = [['a', 'b', g4 + 0.1], ['b', 'c', g4 + 0.15]]; const fb = P('G04_04', 0.35);
    N.f1 = { x: 1420, y: 620, col: FEATC, t0: fb, lab: 'fix-typo', fs: 26 }; N.f2 = { x: 1620, y: 620, col: FEATC, t0: fb + 0.25, lab: '改错别字', fs: 24 }; E.push(['c', 'f1', fb, FEATC], ['f1', 'f2', fb + 0.25, FEATC]);
    drawGraph(t, N, E, { r: 30, lw: 10, fs: 28 });
    if (t >= P('G04_04', 0.6)) { stamp(t, P('G04_04', 0.6), 1100, 720, 'main 上直接改 ✗', BADC, 44, -0.06); }
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['X02']); sfx(S('G04_01') + 0.05, 'pop', 0.4); sfx(P('G04_01', 0.2), 'whoosh', 0.3); sfx(P('G04_01', 0.35), 'click', 0.5); sfx(P('G04_01', 0.55), 'whoosh', 0.5); sfx(P('G04_01', 0.55) + 0.7, 'stamp', 0.6); sfx(P('G04_01', 0.55) + 0.8, 'pop', 0.3);
  sfx(S('G04_02') - 0.1, 'swoosh_in', 0.4); [0.05, 0.15].forEach(d => sfx(S('G04_02') - 0.15 + d, 'pop', 0.3)); typeSfx(P('G04_02', 0.05), 50, 0.7); sfx(P('G04_02', 0.25), 'whoosh', 0.4); sfx(P('G04_02', 0.6), 'whoosh', 0.4); sfx(P('G04_02', 0.6) + 0.5, 'ding', 0.4);
  typeSfx(P('G04_03', 0.05), 60, 0.8); sfx(P('G04_03', 0.35), 'whoosh', 0.4); sfx(P('G04_03', 0.6), 'pop', 0.4);
  sfx(S('G04_04') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G04_04', 0.08), 22, 0.5); sfx(P('G04_04', 0.35), 'pop', 0.4); sfx(P('G04_04', 0.35) + 0.25, 'pop', 0.4); sfx(P('G04_04', 0.6), 'stamp', 0.5); sfx(P('X02', 0.5), 'pop', 0.4); });

// ---- 讲解④：同步上游（千问）----
SC.sync = (t, blk, en) => {
  bgLecture(t, '#e8890c'); lecturer(t, blk, en, blk.t0);
  const g1 = S('G05_01'), g2 = S('G05_02') - 0.15, g3 = S('G05_03') - 0.15;
  const fade = (a0, a1) => clamp(eOut(prog(t, a0, 0.3)) * (1 - prog(t, a1, 0.3)));
  if (t < g2 + 0.3) { const a = fade(g1, g2); ctx.save(); ctx.globalAlpha *= a;
    const ck1 = P('G05_01', 0.5), ck2 = P('G05_01', 0.78);
    ghWin(700, 100, 1140, 640, 'github.com/dafeiyu/rice-timer'); repoHead(740, 200, 'dafeiyu', 'rice-timer', { from: 'octo-chef/rice-timer' });
    const ok = t >= ck2 + 0.2; box(740, 280, 1060, 80, 12, ok ? '#dafbe1' : '#fff8c5', ok ? PRC : '#d4a72c', 3);
    txt(ok ? '✓ This branch is up to date with octo-chef/rice-timer:main.' : 'This branch is 20 commits behind octo-chef/rice-timer:main.', 770, 320, 24, ok ? OKC : '#7d4e00', { font: F_CODE, max: 760 });
    if (!ok) ghBtn(1700, 320, '🔄 Sync fork ▾', { fs: 22, hot: t >= P('G05_01', 0.35), hc: UPC, t });
    if (t >= ck1 && !ok) { const s = popIn(t, ck1, 0.3); ctx.save(); ctx.translate(1500, 380); ctx.scale(s, s); box(0, 0, 300, 230, 14, '#fff', '#d0d7de', 3); txt('This branch is out-of-date', 20, 40, 18, '#57606a', { font: F_CODE, bold: false, max: 260 });
      ghBtn(150, 110, 'Compare', { fs: 20, w: 240 }); ghBtn(150, 175, 'Update branch', { fs: 20, w: 240, bg: PRC, bd: PRC, fg: '#fff', hot: t >= P('G05_01', 0.65), hc: GOODC, t }); ctx.restore(); }
    if (t >= ck2 && t < ck2 + 0.3) flash(t, ck2, 0.12);
    if (ok) { sparkle(t, ck2 + 0.2, 1270, 320, 200, 10); stamp(t, ck2 + 0.3, 1270, 600, '零落后 ✓', GOODC, 60, -0.06); }
    const files = ['src/', 'README.md', 'LICENSE']; files.forEach((f, i) => txt('📄 ' + f, 780, 420 + i * 56, 26, '#0969da', { font: EMOJI + ',' + F_CODE, bold: false }));
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fade(g2, g3); ctx.save(); ctx.globalAlpha *= a;
    const L = [{ s: 'git fetch upstream', t: P('G05_02', 0.08), cmd: true, dur: 0.35 }, { s: '{d} * [new commits]  main -> upstream/main', t: P('G05_02', 0.2) },
      { s: 'git switch main', t: P('G05_02', 0.3), cmd: true, dur: 0.3 }, { s: 'git merge upstream/main', t: P('G05_02', 0.45), cmd: true, dur: 0.4 }, { s: '{g}Fast-forward  (20 commits)', t: P('G05_02', 0.62) },
      { s: 'git push origin main', t: P('G05_02', 0.75), cmd: true, dur: 0.35 }, { s: '{g}✓ 复刻也跟上了', t: P('G05_02', 0.92) }];
    terminal(t, 700, 120, 1140, 560, L, { title: '终端 — rice-timer', accent: UPC, fs: 32, prompt: false });
    [['上游 → 本地', UPC, 0.15], ['合进 main', LOCC, 0.5], ['本地 → 复刻', ORIC, 0.8]].forEach((c, i) => pill(900 + i * 370, 760, c[0], c[1], popIn(t, P('G05_02', c[2])), { fs: 30, font: F_BODY }));
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = clamp(eOut(prog(t, g3, 0.3)) * (1 - prog(t, U.Q02.vo - 0.3, 0.3))); ctx.save(); ctx.globalAlpha *= a;
    cmdBar(t, 1270, 170, 'git switch fix-typo && git rebase main', P('G05_03', 0.1), 0.6, { fs: 34, col: FEATC });
    const mv = P('G05_03', 0.45), N = {}, E = [];
    for (let i = 0; i < 6; i++) { N['m' + i] = { x: 760 + i * 150, y: 420, col: i < 3 ? MAINC : UPC, t0: g3 + 0.05 + i * 0.05, r: i < 3 ? 26 : 22 }; if (i) E.push(['m' + (i - 1), 'm' + i, g3 + 0.05 + i * 0.05]); }
    N.m5.lab = 'main'; N.m5.up = true;
    const [fx, fy] = moveP(t, mv, 0.6, 1060, 600, 1660, 420, 140); N.f = { x: fx, y: fy, col: FEATC, t0: g3 + 0.1, lab: 'fix-typo', fs: 26, glow: t >= mv && t < mv + 0.7 };
    E.push([t < mv + 0.3 ? 'm2' : 'm5', 'f', -1, FEATC]); drawGraph(t, N, E, { r: 26, lw: 9 });
    if (t >= mv + 0.7) { note(1270, 700, popIn(t, mv + 0.7), '第8集学的变基：接到最新 main 后面', FEATC, { fs: 34 }); }
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['Q02']); sfx(S('G05_01') + 0.05, 'pop', 0.4); sfx(P('G05_01', 0.35), 'ding', 0.3); sfx(P('G05_01', 0.5), 'click', 0.5); sfx(P('G05_01', 0.65), 'ding', 0.3); sfx(P('G05_01', 0.78), 'click', 0.5); sfx(P('G05_01', 0.78) + 0.2, 'sparkle', 0.5); sfx(P('G05_01', 0.78) + 0.3, 'stamp', 0.6);
  sfx(S('G05_02') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G05_02', 0.08), 18, 0.35); typeSfx(P('G05_02', 0.3), 15, 0.3); typeSfx(P('G05_02', 0.45), 23, 0.4); sfx(P('G05_02', 0.62), 'ding', 0.3); typeSfx(P('G05_02', 0.75), 20, 0.35); sfx(P('G05_02', 0.92), 'ding', 0.4); [0.15, 0.5, 0.8].forEach(f => sfx(P('G05_02', f), 'pop', 0.25));
  sfx(S('G05_03') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G05_03', 0.1), 38, 0.6); sfx(P('G05_03', 0.45), 'whoosh', 0.5); sfx(P('G05_03', 0.45) + 0.6, 'pop', 0.4); sfx(P('G05_03', 0.45) + 0.7, 'pop', 0.3); });

// ---- 讲解⑤：跨仓库 PR（豆包）----
SC.pr = (t, blk, en) => {
  bgLecture(t, PRC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G06_01'), g2 = S('G06_02') - 0.15, g3 = S('G06_03') - 0.15, g4 = S('G06_04') - 0.15;
  const fade = (a0, a1) => clamp(eOut(prog(t, a0, 0.3)) * (1 - prog(t, a1, 0.3)));
  if (t < g2 + 0.3) { const a = fade(g1, g2); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 100, 1140, 640, 'github.com/dafeiyu/rice-timer'); repoHead(740, 200, 'dafeiyu', 'rice-timer', { from: 'octo-chef/rice-timer' });
    const s1 = popIn(t, P('G06_01', 0.1), 0.35); if (s1 > 0) { ctx.save(); ctx.translate(1270, 330); ctx.scale(s1, s1); box(-530, -50, 1060, 100, 12, '#fff8c5', '#d4a72c', 3); txt('fix-typo had recent pushes 1 minute ago', -500, 0, 24, '#7d4e00', { font: F_CODE, max: 640 }); ghBtn(370, 0, 'Compare & pull request', { fs: 22, bg: PRC, bd: PRC, fg: '#fff', hot: t >= P('G06_01', 0.25) && t < P('G06_01', 0.55), hc: GOODC, t }); ctx.restore(); }
    if (t >= P('G06_01', 0.55)) { txt('或者', 760, 450, 30, '#57606a', {}); ghBtn(960, 450, '🤝 Contribute ▾', { fs: 24, hot: true, hc: PRC, t });
      const s2 = popIn(t, P('G06_01', 0.72), 0.3); if (s2 > 0) { ctx.save(); ctx.translate(820, 490); ctx.scale(s2, s2); box(0, 0, 440, 190, 14, '#fff', '#d0d7de', 3); txt('This branch is 1 commit ahead', 24, 40, 20, '#57606a', { font: F_CODE, bold: false, max: 400 }); ghBtn(220, 120, 'Open pull request', { fs: 22, w: 380, bg: PRC, bd: PRC, fg: '#fff', hot: t >= P('G06_01', 0.85), hc: GOODC, t }); ctx.restore(); } }
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < U.B02.vo) { const a = fade(g2, U.B02.vo - 0.3); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 100, 1140, 300, 'github.com/octo-chef/rice-timer/compare');
    txt('Comparing changes', 740, 190, 30, '#24292f', { font: F_CODE });
    const hb = P('G06_02', 0.15), hh = P('G06_02', 0.55);
    const chip = (x, k, v, hot, col) => { ctx.font = `bold 22px ${F_CODE}`; const w = ctx.measureText(k + v).width + 40; if (hot) { ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 24; } box(x, 240, w, 52, 10, hot ? hexA(col, 0.15) : '#f6f8fa', hot ? col : '#d0d7de', hot ? 4 : 2); if (hot) ctx.restore(); txt(k, x + 20, 267, 22, '#57606a', { font: F_CODE, bold: false }); txt(v, x + 20 + ctx.measureText(k).width, 267, 22, '#24292f', { font: F_CODE }); return w; };
    let x = 740; x += chip(x, 'base: ', 'octo-chef / main', t >= hb && t < g3, UPC) + 14; txt('←', x + 14, 266, 40, '#57606a', { align: 'center' }); x += 40; chip(x, 'head: ', 'dafeiyu / fix-typo', t >= hh && t < g3, ORIC);
    txt('✓ Able to merge.', 740, 350, 24, OKC, { font: F_CODE });
    if (t >= hb && t < g3) { pill(980, 450, '合进：原项目的 main', UPC, popIn(t, hb + 0.1), { fs: 30, font: F_BODY }); }
    if (t >= hh && t < g3) { pill(1560, 450, '来自：你复刻的分支', ORIC, popIn(t, hh + 0.1), { fs: 30, font: F_BODY }); }
    if (t >= g3 - 0.1) { const b = eOut(prog(t, g3, 0.3));
      ctx.save(); ctx.globalAlpha *= b; box(740, 430, 1060, 360, 12, '#fff', '#d0d7de', 3); box(740, 430, 1060, 60, [12, 12, 0, 0], '#f6f8fa'); txt('修正 README 错别字', 770, 460, 26, '#24292f', {});
      const L = ['把“者熟”改成“煮熟”。', '', 'Closes #42']; L.forEach((l, i) => { const p = clamp(prog(t, P('G06_03', 0.1 + i * 0.15), 0.2)); ctx.save(); ctx.globalAlpha *= p; if (i === 2 && t >= P('G06_03', 0.42)) box(760, 520 + i * 52 - 24, 260, 48, 8, hexA(CLUE, 0.3), CLUE, 3); txt(l, 780, 520 + i * 52, 28, '#24292f', { font: i === 2 ? F_CODE : F_BODY }); ctx.restore(); });
      if (t >= P('G06_03', 0.6)) { txt('合并进 main →', 1150, 624, 28, '#57606a', {}); const s = popIn(t, P('G06_03', 0.68)); issueRow(t, 1360, 590, 420, { title: '#42 错别字', num: '', closed: true, labels: [['Closed', '#8250df']], t: P('G06_03', 0.68) }); }
      if (t >= g4) { const p = P('G06_04', 0.35), on = t >= p; box(770, 700, 36, 36, 6, on ? '#0969da' : '#fff', '#0969da', 3); if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(778, 718); ctx.lineTo(786, 727); ctx.lineTo(800, 708); ctx.stroke(); }
        txt('Allow edits by maintainers', 826, 718, 28, '#24292f', { font: F_CODE }); if (on) { flash(t, p, 0.08); note(1500, 718, popIn(t, p + 0.1), '维护者能帮你改小地方', PRC, { fs: 28 }); } }
      ctx.restore(); }
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['B02']); sfx(P('G06_01', 0.1), 'pop', 0.4); sfx(P('G06_01', 0.25), 'ding', 0.3); sfx(P('G06_01', 0.55), 'pop', 0.4); sfx(P('G06_01', 0.72), 'pop', 0.3); sfx(P('G06_01', 0.85), 'click', 0.4);
  sfx(S('G06_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G06_02', 0.15), 'ding', 0.35); sfx(P('G06_02', 0.55), 'ding', 0.35); sfx(S('G06_03') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G06_03', 0.1), 20, 0.5); sfx(P('G06_03', 0.42), 'ding', 0.4); sfx(P('G06_03', 0.68), 'pop', 0.4);
  sfx(P('G06_04', 0.35), 'click', 0.5); sfx(P('G06_04', 0.45), 'pop', 0.3); sfx(P('B02', 0.5), 'stamp', 0.7); });

// ---- 讲解⑥：回应审查（Gemini）----
SC.review = (t, blk, en) => {
  bgLecture(t, '#a855f7'); lecturer(t, blk, en, blk.t0);
  const g1 = S('G07_01'), g2 = S('G07_02') - 0.15, g3 = S('G07_03') - 0.15;
  const fade = (a0, a1) => clamp(eOut(prog(t, a0, 0.3)) * (1 - prog(t, a1, 0.3)));
  if (t < g2 + 0.3) { const a = fade(g1, g2); ctx.save(); ctx.globalAlpha *= a;
    stamp(t, g1 + 0.1, 1760, 150, '不用关！', GOODC, 44, -0.08);
    cmdBar(t, 1110, 160, 'git commit -am "按审查修改" && git push', P('G07_01', 0.3), 0.7, { fs: 30, col: '#a855f7' });
    ghWin(700, 250, 1140, 520, 'github.com/octo-chef/rice-timer/pull/88');
    txt('修正 README 错别字 #88', 740, 340, 30, '#24292f', {}); txt('Commits', 740, 400, 24, '#57606a', { font: F_CODE });
    const nc = P('G07_01', 0.65);
    [['a3f9c1', '修正 README 错别字', -1], ['b7d2e8', '按审查修改', nc]].forEach((c, i) => { const s = popIn(t, c[2], 0.35); if (s <= 0) return; const y = 450 + i * 90; ctx.save(); ctx.translate(0, (1 - s) * -30); ctx.globalAlpha *= clamp(s); box(740, y, 1060, 74, 10, i ? '#dafbe1' : '#fff', i ? PRC : '#d0d7de', i ? 4 : 2); gDot(775, y + 37, 1, i ? PRC : MAINC, { r: 12 }); txt(c[0], 805, y + 37, 24, '#9a6700', { font: F_CODE }); txt(c[1], 940, y + 37, 26, '#24292f', {}); if (i) txt('刚刚', 1780, y + 37, 22, OKC, { align: 'right' }); ctx.restore(); });
    if (t >= nc + 0.3) note(1270, 700, popIn(t, nc + 0.3), '同一个分支推送 → PR 自动更新', PRC, { fs: 32 });
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fade(g2, g3); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 100, 1140, 680, 'github.com/octo-chef/rice-timer/pull/88/files');
    const rs = P('G07_02', 0.4), rr2 = P('G07_02', 0.75);
    const th = (y, who, msg, col) => { avatar(who === '大肥鱼' ? 'D' : 'G', 780, y + 30, 26, { gray: who !== '大肥鱼' }); txt(who, 830, y + 16, 20, '#57606a', { bold: false }); txt(msg, 830, y + 50, 28, '#24292f', { font: F_BODY + ',' + EMOJI }); };
    if (t < rs + 0.3) { const fa = 1 - prog(t, rs, 0.3); ctx.save(); ctx.globalAlpha *= fa; box(740, 170, 1060, 320, 12, '#fff', '#d0d7de', 2); txt('README.md 第 12 行', 770, 205, 22, '#57606a', { font: F_CODE, bold: false });
      th(240, 'octo-chef', '这里的句号也改成全角吧', '#fff'); if (t >= P('G07_02', 0.12)) th(330, '大肥鱼', '已修改，谢谢提醒 🙏', '#fff');
      ghBtn(1650, 445, 'Resolve conversation', { fs: 20, hot: t >= P('G07_02', 0.25), hc: PRC, t }); ctx.restore(); }
    else { const s = popIn(t, rs, 0.3); ctx.save(); ctx.globalAlpha *= clamp(s); box(740, 170, 1060, 70, 12, '#f6f8fa', '#d0d7de', 2); txt('✓ README.md 第 12 行 — Resolved', 770, 205, 24, OKC, { font: F_CODE }); ctx.restore(); }
    if (t >= rs) { const s = popIn(t, rs + 0.15, 0.3); ctx.save(); ctx.globalAlpha *= clamp(s); box(740, 260, 1060, 70, 12, '#f6f8fa', '#d0d7de', 2); txt('✓ README.md 第 20 行 — Resolved', 770, 295, 24, OKC, { font: F_CODE }); ctx.restore(); }
    if (t >= rs + 0.4) note(1270, 440, popIn(t, rs + 0.4), '每条意见都回复、标记解决', PRC, { fs: 34 });
    if (t >= rr2 - 0.3) { box(740, 560, 1060, 150, 12, '#fff', '#d0d7de', 2); txt('Reviewers', 770, 600, 24, '#57606a', { font: F_CODE }); avatar('G', 800, 655, 26, { gray: true }); txt('octo-chef', 840, 655, 26, '#24292f', { font: F_CODE }); ghBtn(1580, 655, '🔄 Re-request review', { fs: 22, hot: t >= rr2, hc: '#a855f7', t }); }
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = clamp(eOut(prog(t, g3, 0.3)) * (1 - prog(t, U.M02.vo - 0.3, 0.3))); ctx.save(); ctx.globalAlpha *= a;
    const s = popIn(t, g3 + 0.1, 0.4); ctx.save(); ctx.translate(1270, 360); ctx.scale(s, s); box(-460, -170, 920, 340, 30, '#fff', '#a855f7', 8);
    txt('Changes requested', 0, -90, 44, BADC, { align: 'center', font: F_CODE }); txt('≠ 否定你', 0, 0, 64, '#1b1433', { align: 'center', font: F_FANCY, bold: false }); txt('维护者多半在用业余时间帮你', 0, 90, 32, '#57606a', { align: 'center' }); ctx.restore();
    if (t >= P('G07_03', 0.6)) fancy('耐心一点 · 礼貌一点', 1270, 680, 72, t, P('G07_03', 0.6), FX.pink);
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['M02']); sfx(S('G07_01') + 0.1, 'stamp', 0.5); typeSfx(P('G07_01', 0.3), 36, 0.7); sfx(P('G07_01', 0.65), 'pop', 0.5); sfx(P('G07_01', 0.65) + 0.3, 'ding', 0.4);
  sfx(S('G07_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G07_02', 0.12), 'pop', 0.3); sfx(P('G07_02', 0.4), 'click', 0.4); sfx(P('G07_02', 0.4) + 0.15, 'ding', 0.3); sfx(P('G07_02', 0.75), 'click', 0.4);
  sfx(S('G07_03') - 0.05, 'pop', 0.4); sfx(P('G07_03', 0.6), 'sparkle', 0.4); sfx(P('M02', 0.6), 'confetti', 0.4); });

// ---- 复习：读 · 同 · 交 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const cards = [['📖 读', UPC, ['LICENSE · CONTRIBUTING', 'good first issue', '留言认领'], 'G08_01'], ['🔄 同', ORIC, ['Fork 复刻', 'remote add upstream', '开工前先同步'], 'G08_02'], ['📮 交', PRC, ['从复刻发 PR', 'Closes #42', '按审查继续推送'], 'G08_03']];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.1, 0.4); if (s <= 0) return; const act = t >= S(c[3]) - 0.1 && (i === 2 || t < S(cards[i + 1][3]) - 0.1);
    const x = 870 + i * 400, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= S(c[3]) - 0.1 ? 1 : 0.5;
    if (act) { ctx.shadowColor = c[1]; ctx.shadowBlur = 40; } box(-180, -300, 360, 600, 28, '#fffaf0', c[1], 8); ctx.shadowBlur = 0;
    box(-180, -300, 360, 100, [28, 28, 0, 0], c[1]); txt(c[0], 0, -248, 46, '#fff', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false });
    c[2].forEach((l, k) => { const a = clamp(prog(t, P(c[3], 0.12 + k * 0.25), 0.25)); ctx.save(); ctx.globalAlpha *= 0.25 + 0.75 * a; box(-150, -170 + k * 140, 300, 110, 16, '#fff', '#e4dff5', 3); txt(l, 0, -170 + k * 140 + 55, 25, '#1b1433', { align: 'center', font: isCJK(l) ? F_BODY : F_CODE, max: 285 }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= P('G08_03', 0.8)) fancy('读 · 同 · 交，开源不再难！', 1270, 880, 56, t, P('G08_03', 0.8), FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2].forEach(i => sfx(BK.recap.t0 + 0.1 + i * 0.1, 'pop', 0.3)); ['G08_01', 'G08_02', 'G08_03'].forEach(id => { for (let k = 0; k < 3; k++) sfx(P(id, 0.12 + k * 0.25), 'ding', 0.25); }); sfx(P('G08_03', 0.8), 'sparkle', 0.5); });

// ---- 实战：给电饭煲计时器修错别字 ----
SC.practice = (t, blk, en) => {
  bgLecture(t, GOODC); lecturer(t, blk, en, blk.t0);
  const T = { claim: S('G09_01'), fork: P('G09_01', 0.35), br: S('G09_02'), pr: S('G09_03'), rv: S('G09_04'), mg: S('G09_05') };
  const steps = [['认领', T.claim], ['Fork', T.fork], ['分支', T.br], ['PR', T.pr], ['审查', T.rv], ['合并', T.mg]];
  const end = S('D10') - 0.2;
  steps.forEach((s, i) => { const a = popIn(t, blk.t0 + 0.15 + i * 0.06); if (a <= 0) return;
    const x = 790 + i * 200, y = 88; const act = t < end && t >= s[1] && (i === 5 || t < steps[i + 1][1]); const done = t >= end || (i < 5 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1)); box(-90, -32, 180, 64, 18, act ? GOODC : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act ? '✓ ' : '') + s[0], 0, 2, 24, '#fff', { align: 'center', font: isCJK(s[0]) ? F_BODY : F_CODE, max: 170 }); ctx.restore(); });
  const ta = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha *= ta;
  // 上：README / PR 状态卡
  box(670, 150, 1210, 330, 24, 'rgba(15,12,31,0.92)', '#fff', 4);
  const fixed = t >= P('G09_02', 0.6) ? 2 : 1; readmeCard(t, 960, 315, 0.7, fixed);
  const prs = t >= T.mg ? ['🟣 Merged', '#8250df'] : t >= P('G09_04', 0.7) ? ['✓ checks passed', PRC] : t >= T.rv ? ['✎ Changes requested', BADC] : t >= P('G09_03', 0.3) ? ['● Open', PRC] : null;
  if (prs) { box(1290, 200, 560, 230, 18, '#fff', prs[1], 5); txt('PR #88 修正 README 错别字', 1315, 245, 26, '#24292f', {}); txt('octo-chef:main ← dafeiyu:fix-typo', 1315, 295, 20, '#57606a', { font: F_CODE, bold: false }); pill(1430, 370, prs[0], prs[1], popIn(t, t >= T.mg ? T.mg : t >= P('G09_04', 0.7) ? P('G09_04', 0.7) : t >= T.rv ? T.rv : P('G09_03', 0.3)), { fs: 26, font: F_CODE + ',' + EMOJI }); if (t >= P('G09_03', 0.75)) txt('Closes #42', 1840, 370, 22, '#8250df', { align: 'right', font: F_CODE }); }
  else { txt('🍴 dafeiyu/rice-timer', 1570, 315, 30, ORIC, { align: 'center', font: EMOJI + ',' + F_CODE }); }
  // 下：终端
  const L = [{ s: '{p}#42 💬 我想试试这个！ → 维护者：交给你了', t: P('G09_01', 0.1) }, { s: 'git clone https://github.com/dafeiyu/rice-timer.git', t: P('G09_01', 0.4), cmd: true, dur: 0.5 }, { s: 'git remote add upstream https://github.com/octo-chef/rice-timer.git', t: P('G09_01', 0.7), cmd: true, dur: 0.5 },
    { s: 'git fetch upstream && git switch -c fix-typo upstream/main', t: P('G09_02', 0.05), cmd: true, dur: 0.6 }, { s: 'git commit -am "修正 README 错别字" && git push -u origin fix-typo', t: P('G09_02', 0.5), cmd: true, dur: 0.6 },
    { s: '{y}→ Compare & pull request   base: octo-chef/main', t: P('G09_03', 0.1) }, { s: 'git commit -am "按审查修改标点" && git push', t: P('G09_04', 0.35), cmd: true, dur: 0.5 }, { s: '{g}✓ PR 已更新 · checks passed', t: P('G09_04', 0.7) }];
  terminal(t, 670, 500, 1210, 400, L, { title: '终端 — rice-timer', accent: GOODC, fs: 24, prompt: false });
  if (t >= T.mg && t < end) { const s = popIn(t, T.mg + 0.1, 0.4); ctx.save(); ctx.translate(1275, 700); ctx.scale(s, s); box(-560, -170, 1120, 340, 22, '#fff', '#d0d7de', 4);
    txt('🟣 #42 README 错别字 — Closed', -520, -115, 32, '#8250df', { font: EMOJI + ',' + F_BODY }); txt('Contributors', -520, -40, 28, '#24292f', { font: F_CODE });
    ['G', 'Q', 'K', 'C', 'B', 'M', 'X'].forEach((k, i) => avatar(k, -480 + i * 90, 50, 34, { s: popIn(t, T.mg + 0.2 + i * 0.04) })); avatar('D', -480 + 7 * 90 + 20, 50, 42, { s: popIn(t, P('G09_05', 0.6), 0.5) });
    if (t >= P('G09_05', 0.65)) { sparkle(t, P('G09_05', 0.65), -480 + 7 * 90 + 20 + 1275, 750, 90, 8); txt('+ 你！', -480 + 8 * 90 + 40, 50, 36, GOODC, {}); }
    ctx.restore(); }
  ctx.restore();
  if (t < S('G09_01') + 0.6) fancy('实战开始！', 1280, 500, 110, t, blk.t0 + 0.2, Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_medal', 1620, H + 30, 900, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    readmeCard(t, 1000, 380, popIn(t, end + 0.05, 0.4) * 0.95, 2, { col: GOODC });
    stamp(t, end + 0.4, 1200, 200, 'Merged ✓', '#8250df', 64, -0.1);
    fancy('开源贡献者！', 980, 720, 96, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 6; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(b.t0 + 0.2, 'impact', 0.6);
  sfx(P('G09_01', 0.1), 'pop', 0.4); typeSfx(P('G09_01', 0.4), 50, 0.5); typeSfx(P('G09_01', 0.7), 60, 0.5); typeSfx(P('G09_02', 0.05), 55, 0.6); sfx(P('G09_02', 0.6), 'ding', 0.4); typeSfx(P('G09_02', 0.5), 60, 0.6);
  sfx(P('G09_03', 0.1), 'pop', 0.3); sfx(P('G09_03', 0.3), 'ding', 0.4); sfx(P('G09_03', 0.75), 'pop', 0.3); sfx(S('G09_04'), 'buzz', 0.3); typeSfx(P('G09_04', 0.35), 40, 0.5); sfx(P('G09_04', 0.7), 'ding', 0.5);
  sfx(S('G09_05'), 'impact', 0.5); sfx(S('G09_05') + 0.1, 'pop', 0.4); for (let i = 0; i < 7; i++) sfx(S('G09_05') + 0.2 + i * 0.04, 'pop', 0.15); sfx(P('G09_05', 0.6), 'sparkle', 0.5);
  const end = S('D10') - 0.2; sfx(end, 'impact', 0.6); sfx(end + 0.4, 'stamp', 0.6); sfx(end + 0.4, 'confetti', 0.6); });

// ---- 预告（仓库体检）+ 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#0f766e');
  const outro = E('G10_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G10_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G10_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G10_01', 0.1), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 470); ctx.scale(bp, bp); ctx.translate(-1260, -470);
      box(860, 250, 800, 420, 24, '#ffffff', '#0f766e', 6);
      txt('🩺 仓库体检报告', 900, 300, 34, '#0f766e', { font: EMOJI + ',' + F_BODY });
      [['🐘', '仓库越来越大', '大文件 → Git LFS', P('G10_01', 0.25)], ['🔑', '密码推上去了', '换密钥 + 清历史', P('G10_01', 0.5)]].forEach((c, i) => { const s = popIn(t, c[3]); if (s <= 0) return; ctx.save(); ctx.translate(1260, 400 + i * 130); ctx.scale(s, s);
        box(-360, -52, 720, 104, 16, i ? '#fff5f5' : '#f6f8fa', i ? BADC : '#57606a', 3); txt(c[0], -320, 0, 52, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], -260, -16, 30, '#24292f', {}); txt(c[2], -260, 26, 24, i ? BADC : '#0f766e', {}); ctx.restore(); });
      ctx.restore(); }
    [['git lfs', -520, 300, 0.3], ['.gitattributes', 430, 290, 0.4], ['泄露急救', -500, 680, 0.55], ['filter-repo', 440, 700, 0.66]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G10_01', c[3])), { fs: 34, font: isCJK(c[0]) ? F_BODY : F_CODE }));
    fancy('给仓库做一次体检！', 1260, 830, 70, t, P('G10_01', 0.78), FX.pink);
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
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_medal', 1690, H + 40, 640, { scale: sa }); }
      SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
    ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
    ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G10_01', 0.1), 'pop', 0.6); [0.25, 0.5].forEach(f => sfx(P('G10_01', f), 'pop', 0.4)); sfx(P('G10_01', 0.5), 'buzz', 0.3);
  [0.3, 0.4, 0.55, 0.66].forEach(f => sfx(P('G10_01', f), 'pop', 0.3)); sfx(P('G10_01', 0.78), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G10_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G10_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_sparkle', P('G01_02', 0.88), E('G01_02')], ['d_ok', P('G03_02', 0.85), E('G03_02')],
  ['d_think', P('G07_03', 0.25), P('G07_03', 0.55)],
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
