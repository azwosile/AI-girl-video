// AI娘 Git课 · 第1集 渲染引擎 —— renderAt(t) 纯函数，逐帧确定性导出
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const F_FANCY = '"Smiley", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const F_BODY = '"Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const F_CODE = 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", "Microsoft YaHei", "Noto Sans CJK SC", monospace';

// ================= 素材 =================
const SPR = {};
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'g_cheer', 'g_warn', 'd_panic', 'd_curious', 'd_happy', 'd_raise', 'd_think', 'd_cry', 'd_shock', 'd_sparkle', 'd_ok', 'd_relief'];
// 竖版立绘只显示上半身：显示高度占整张图的比例（头顶到腰）
const SPRC = { d_panic: 0.55, d_curious: 0.55, d_happy: 0.55, d_sparkle: 0.6, d_ok: 0.66, d_raise: 0.72, d_think: 0.7, d_cry: 0.88, d_relief: 0.82, d_shock: 0.82 };
const loadImg = n => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });

// ================= 台词 =================
const TEXT = {
  D01: '完了完了！我的论文又改崩了！昨天那版明明还好好的！',
  G01_01: '别慌别慌！大肥鱼，你是不是有一堆叫最终版、最终版二、真的最终版的文件？', G01_02: '这样存，过两天你自己都分不清哪个是哪个。', G01_03: '今天我就教你一个神器，Git！',
  G01_04: '它就像游戏里的存档系统，每改好一点就存个档，改崩了随时读档回去。', G01_05: '不管是写论文、写代码，还是做设计，都用得上。', G01_06: '欢迎来到 AI娘 Git 课，第一集，给你的文件装上存档！',
  D02: '存档？那它要怎么装到电脑里呀？',
  G02_01: '很简单！先去官网下载安装包，Windows 一路点下一步就好。', G02_02: '装完以后打开终端，敲一句 git version，查一下版本。', G02_03: '看到版本号，就说明装好啦！',
  G02_04: '接下来要告诉 Git 你是谁。', G02_05: '用 git config，设置你的名字和邮箱。', G02_06: '以后每一次存档，都会签上你的名字，谁改的一清二楚。',
  D03: '那我的论文文件夹，要怎么交给它管呢？',
  G03_01: '进到你的论文文件夹，输入 git init，也就是初始化的意思。', G03_02: '叮！文件夹里会多出一个隐藏的 .git 文件夹。', G03_03: '这就是 Git 的仓库，所有存档都藏在这里面。', G03_04: '注意哦，千万不要手动删掉它，不然存档就全没啦！',
  D04: '仓库我懂了，可是存档具体要怎么存呀？',
  G04_01: '这就要说到 Git 最重要的概念：三个区域。', G04_02: '第一个是工作区，就是你平时打开、正在编辑的文件。', G04_03: '第二个是暂存区，相当于一个快递箱，把准备存档的改动先放进去。',
  G04_04: '第三个是仓库，箱子封好、贴上标签，就变成了一个永久的存档。', G04_05: '记住这条路线：工作区，到暂存区，再到仓库！',
  D05: '那我怎么知道，哪些文件改过了呢？',
  G05_01: '问得好！输入 git status，Git 就会告诉你现在的状态。', G05_02: '红色的文件，表示改过了，但还没放进暂存区。', G05_03: '想看具体改了哪几行？用 git diff，删掉的是红色，新加的是绿色。',
  G05_04: '确认没问题，就用 git add 加上文件名，把它放进暂存区。', G05_05: '再看一次 status，它变成绿色了！', G05_06: '如果想一次放进所有改动，可以用 git add 点。',
  D06: '放进箱子以后，就可以封箱了吗？',
  G06_01: '没错！输入 git commit -m，后面写上这次存档的说明。', G06_02: '咔嚓！一个存档就诞生了。', G06_03: '每个存档都有一串独一无二的编号，叫做哈希值。',
  G06_04: '提交以后，暂存区就清空了，等着装下一批改动。', G06_05: '说明要写清楚，比如完成第一章、修改参考文献，而不是随便写个改了改。', G06_06: '不然以后翻存档的时候，你会想哭的。',
  D07: '存了这么多档，我要怎么翻出来看呢？',
  G07_01: '用 git log，就能看到所有的存档记录。', G07_02: '谁、在什么时候、存了什么，一目了然。', G07_03: '觉得太长？加上 oneline 参数，每个存档只占一行，清清爽爽。', G07_04: '最上面那个就是最新的存档，HEAD 指针指向的，就是你现在所在的位置。',
  D08: '原来是这样！我好像全都学会了！',
  G08_01: '那我们来复习一下日常的存档循环！', G08_02: '改文件，git status 看看状态，git add 放进暂存区，git commit 存档。', G08_03: '就这么简单的三步，每天重复就好。',
  G08_04: '下集预告：存档存好了，那改崩的时候到底怎么读档呢？我们下集讲后悔药，git restore！', G08_05: '喜欢的话记得一键三连，我们下集见！',
  D09: '糟了，我把第一章改得乱七八糟，还没存档，能变回去吗？',
  G09_01: '能！还没 add 的改动，用 git restore 加文件名，一键回到上次存档的样子。', G09_02: '不过要小心，这一步会直接丢掉没存的改动，找不回来哦。',
  G09_03: '如果已经 add 进暂存区了，就加上 --staged 参数，先把它从箱子里拿出来。', G09_04: '拿出来以后，改动还留在工作区，要不要，你说了算。',
  D10: '那要是已经存过档了，我想要前天那一版呢？',
  G10_01: '先用 git log --oneline，找到那个存档的编号。', G10_02: '然后 git restore，用 --source 参数写上编号，再写文件名。', G10_03: '前天的第一章就回来了，其他文件一点都不受影响。',
  G10_04: '如果想撤销整个存档，就用 git revert 加编号。', G10_05: '它不会删除历史，而是新建一个反向的存档，把那次改动抵消掉。', G10_06: '网上还有一个 reset --hard 的写法，会直接抹掉存档，新手千万别乱用！',
  D11: '我想试试新的写法，可又怕把论文搞乱了……',
  G11_01: '这时候就该开平行世界了，也就是分支！', G11_02: '你现在所在的主线，叫做 main。', G11_03: '输入 git branch idea，就复制出一条叫 idea 的新路线。',
  G11_04: '再用 git switch idea，切换过去。', G11_05: '在这条线上随便改、随便存档，主线完全不受影响。', G11_06: '想偷懒的话，git switch -c，新建加切换一步到位。',
  D12: '新写法效果超好！怎么把它合回主线呀？',
  G12_01: '先切回主线，git switch main。', G12_02: '然后 git merge idea，把这条线的存档合并进来。', G12_03: '两条路线就汇合成一条啦！', G12_04: '用完的分支，可以用 git branch -d 删掉，保持清爽。',
  D13: '那要是两条线都改了同一句话呢？',
  G13_01: '那就会发生冲突，Git 不知道该听谁的。', G13_02: '它会在文件里用箭头和等号，把两边的内容都标出来。', G13_03: '上面是主线的写法，下面是分支的写法。',
  G13_04: '你自己决定保留哪个，再把这些标记删掉。', G13_05: '然后照常 add 和 commit，冲突就解决了。别怕，冲突很正常！',
  G14_01: '读档记三招：没存的用 restore，进了箱子的加 --staged，存过档的用 --source 或者 revert。', G14_02: '平行世界也是三步：branch 开分支，switch 切过去，merge 合回来。',
  G15_01: '下集预告：存档只在自己电脑里，电脑坏了怎么办？下集我们讲 GitHub 云存档！',
  D14: '能不能带我从头到尾，完整走一遍呀？',
  G16_01: '没问题！我们从零开始，完整实战一遍！', G16_02: '新建文件夹，git init，仓库建好。', G16_03: '写好第一章，git add .，git commit，第一个存档完成！',
  G16_04: '想试新写法？git switch -c，开一个 idea 分支。', G16_05: '在分支上改完，同样 add、commit 存档。', G16_06: '回到 main，git merge idea，合并进来。',
  G16_07: '最后 git log 加上 --oneline 和 --graph，整条历史一目了然！', G16_08: '这就是一套完整的 Git 工作流，快打开终端自己试试吧！',
};
const DUR = Object.assign({}, window.DUR || {});

// ================= 时间轴 =================
const V = (b, id, pose) => ({ k: 'v', b, id, pose });
const BEAT = (b, d) => ({ k: 'beat', b, d: b === 'teaser' ? d * 0.75 : d * 0.35 });
const CARD = (n, title, sub, col) => ({ k: 'card', b: 'card' + n, n, title, sub, col, d: 1.5 });
const SUM = (b, items) => ({ k: 'sum', b: b + '_sum', items, d: 2.6 });
const CH_COL = ['#7c5cff', '#3ec1ff', '#22c08b', '#ffb020', '#ff5c8a', '#ff7a3d', '#a66bff', '#ffd23f'];
const PLAN = [
  V('cold', 'D01', 'd_panic'),
  V('why', 'G01_01', 'g_point'), V('why', 'G01_02', 'g_explain'), V('why', 'G01_03', 'g_cheer'), V('why', 'G01_04', 'g_explain'), V('why', 'G01_05', 'g_wink'),
  V('title', 'G01_06', 'g_cheer'), BEAT('title', 1.4),
  V('ask1', 'D02', 'd_raise'),
  V('install', 'G02_01', 'g_explain'), V('install', 'G02_02', 'g_point'), BEAT('install', 0.9), V('install', 'G02_03', 'g_wink'), V('install', 'G02_04', 'g_explain'), V('install', 'G02_05', 'g_point'), BEAT('install', 1.0), V('install', 'G02_06', 'g_explain'),
  V('ask2', 'D03', 'd_curious'),
  V('init', 'G03_01', 'g_point'), BEAT('init', 0.9), V('init', 'G03_02', 'g_explain'), V('init', 'G03_03', 'g_explain'), V('init', 'G03_04', 'g_warn'),
  V('ask3', 'D04', 'd_think'),
  V('zones', 'G04_01', 'g_explain'), V('zones', 'G04_02', 'g_point'), V('zones', 'G04_03', 'g_explain'), V('zones', 'G04_04', 'g_point'), V('zones', 'G04_05', 'g_cheer'),
  V('ask4', 'D05', 'd_curious'),
  V('status', 'G05_01', 'g_point'), BEAT('status', 1.0), V('status', 'G05_02', 'g_explain'), V('status', 'G05_03', 'g_explain'), BEAT('status', 0.8), V('status', 'G05_04', 'g_point'), V('status', 'G05_05', 'g_wink'), V('status', 'G05_06', 'g_explain'),
  V('ask5', 'D06', 'd_sparkle'),
  V('commit', 'G06_01', 'g_point'), BEAT('commit', 0.5), V('commit', 'G06_02', 'g_cheer'), V('commit', 'G06_03', 'g_explain'), V('commit', 'G06_04', 'g_explain'), V('commit', 'G06_05', 'g_warn'), V('commit', 'G06_06', 'g_wink'),
  V('ask6', 'D07', 'd_think'),
  V('log', 'G07_01', 'g_point'), BEAT('log', 1.0), V('log', 'G07_02', 'g_explain'), V('log', 'G07_03', 'g_point'), V('log', 'G07_04', 'g_explain'),
  V('askR1', 'D09', 'd_cry'),
  V('restore1', 'G09_01', 'g_point'), V('restore1', 'G09_02', 'g_warn'), V('restore1', 'G09_03', 'g_explain'), V('restore1', 'G09_04', 'g_wink'),
  V('askR2', 'D10', 'd_raise'),
  V('restore2', 'G10_01', 'g_point'), V('restore2', 'G10_02', 'g_explain'), V('restore2', 'G10_03', 'g_cheer'), V('restore2', 'G10_04', 'g_point'), V('restore2', 'G10_05', 'g_explain'), V('restore2', 'G10_06', 'g_warn'),
  V('askB1', 'D11', 'd_think'),
  V('branch', 'G11_01', 'g_cheer'), V('branch', 'G11_02', 'g_explain'), V('branch', 'G11_03', 'g_point'), V('branch', 'G11_04', 'g_point'), V('branch', 'G11_05', 'g_explain'), V('branch', 'G11_06', 'g_wink'),
  V('askB2', 'D12', 'd_sparkle'),
  V('merge', 'G12_01', 'g_point'), V('merge', 'G12_02', 'g_explain'), V('merge', 'G12_03', 'g_cheer'), V('merge', 'G12_04', 'g_wink'),
  V('askB3', 'D13', 'd_shock'),
  V('conflict', 'G13_01', 'g_warn'), V('conflict', 'G13_02', 'g_explain'), V('conflict', 'G13_03', 'g_point'), V('conflict', 'G13_04', 'g_explain'), V('conflict', 'G13_05', 'g_cheer'),
  V('ask7', 'D08', 'd_happy'),
  V('recap', 'G08_01', 'g_cheer'), V('recap', 'G08_02', 'g_point'), V('recap', 'G08_03', 'g_wink'),
  V('recap2', 'G14_01', 'g_explain'), V('recap2', 'G14_02', 'g_point'),
  V('askP', 'D14', 'd_ok'),
  V('practice', 'G16_01', 'g_cheer'), V('practice', 'G16_02', 'g_point'), V('practice', 'G16_03', 'g_explain'), V('practice', 'G16_04', 'g_point'), V('practice', 'G16_05', 'g_explain'), V('practice', 'G16_06', 'g_point'), V('practice', 'G16_07', 'g_explain'), V('practice', 'G16_08', 'g_wink'),
  V('teaser', 'G15_01', 'g_explain'), V('teaser', 'G08_05', 'g_cheer'), BEAT('teaser', 8),
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
  const isG = en.id[0] === 'G';
  const name = isG ? 'GitHub娘' : '大肥鱼', col = isG ? '#8b5cf6' : '#2f6fe0';
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

// ================= 场景 =================
const SC = {};
// ---- 冷开场 ----
SC.cold = (t, blk, en) => {
  const u = U.D01; let [sx, sy] = shake(t, blk.t0, 14, 0.35); ctx.translate(sx, sy);
  bgBurst(t, '#ff4d6d', '#ff8fa3', W / 2, H * 0.6, 22, 0.35);
  for (let i = 0; i < 18; i++) { const st = blk.t0 + 0.25 + rnd(i) * 3.2; const dt = t - st; if (dt < 0) continue; docIcon(80 + rnd(i + 20) * (W - 160), -150 + dt * (800 + rnd(i + 40) * 500), 0.75 + rnd(i + 60) * 0.4, 'W', '#2f6fe0', { rot: dt * (rnd(i + 80) - .5) * 6, broken: i % 3 === 0 }); }
  const p = spring(prog(t, blk.t0, 0.9));
  sprite('d_panic', W * 0.56, H + 40, 900, { scale: lerp(1.5, 1, p) });
  fancy('完了完了！', 400, 200, 150, t, u.vo + 0.1, { rot: -0.12, wobble: 6, c1: '#fff36b', c2: '#ffb000', stroke: '#8a0a2a' });
  fancy('论文_真的最终版.docx', 60, 400, 46, t, P('D01', 0.55), { rot: -0.08, stagger: 0.02, align: 'left', font: F_BODY, c1: '#fff', c2: '#dfe8ff', stroke: '#2a2140' });
};
const SFX_FNS = [() => { sfx(BK.cold.t0 + 0.05, 'boom', 0.9); for (let k = 0; k < 8; k++) sfx(BK.cold.t0 + 0.4 + k * 0.4, 'pop', 0.2); }];

// ---- 为什么要用 Git ----
SC.why = (t, blk, en) => {
  bgLecture(t, '#7c5cff');
  lecturer(t, blk, en, blk.t0);
  const names = ['最终版.docx', '最终版2.docx', '真的最终版.docx', '真真最终版(1).docx', '打死不改版.docx'];
  const pileOut = prog(t, S('G01_03') - 0.1, 0.45);
  if (pileOut < 1) {
    names.forEach((n, i) => {
      const a = popIn(t, S('G01_01') + 1.0 + i * 0.55); if (a <= 0) return;
      const shk = t > S('G01_02') ? noise(t, i) * 6 : 0;
      const fx = lerp(0, (i % 2 ? 1 : -1) * 1400, eIn(pileOut)), fy = lerp(0, -300 - i * 80, eIn(pileOut));
      docIcon(960 + (i % 3) * 330 + (i > 2 ? 165 : 0) + shk + fx, 300 + Math.floor(i / 3) * 270 + fy, 1.2 * a, 'W', '#2f6fe0', { rot: (rnd(i) - .5) * 0.4 + pileOut * 4, name: n, nameSize: 21 });
    });
    [0, 1, 2].forEach(i => { const a = popIn(t, S('G01_02') + 0.6 + i * 0.2); if (a <= 0 || pileOut > 0) return; fancy('?', 1050 + i * 330, 170 + (i % 2) * 40 + Math.sin(t * 6 + i) * 10, 120, t, -99, { c1: '#fff', c2: '#c6b8ff', stroke: '#3b1460' }); });
    if (t < S('G01_03') - 0.1) stamp(t, P('G01_02', 0.7), 1300, 720, '分不清！', '#ff4d6d', 72);
  }
  // Git 登场
  const gIn = prog(t, S('G01_03') + 0.55, 0.3), gOut = prog(t, S('G01_04') - 0.15, 0.3);
  if (gIn > 0 && gOut < 1) {
    const s = lerp(3, 1, eOut(gIn)) * (1 - eIn(gOut));
    ctx.save(); ctx.globalAlpha = clamp(gIn * 3); gitLogo(1150, 420, s * (1 + Math.sin(t * 4) * 0.02)); ctx.restore();
    if (s > 0.2) fancy('Git', 1530, 430, 220 * s, t, -99, { c1: '#ffffff', c2: '#ffd9c7', stroke: '#f05133' });
    speedLines(t, 1250, 420, (1 - prog(t, S('G01_03') + 0.6, 0.7)) * (gIn > 0 ? 1 : 0));
    fancy('版本管理神器', 1280, 720, 70, t, S('G01_03') + 1.0, Object.assign({ out: S('G01_04') - 0.2 }, FX.yel));
  }
  // 游戏存档界面
  if (t >= S('G01_04') - 0.15 && t < S('G01_05')) {
    const a = eOut(prog(t, S('G01_04') - 0.15, 0.35)), out = clamp((S('G01_05') - t) / 0.2);
    ctx.save(); ctx.globalAlpha = a * out;
    win(720, 130 + (1 - a) * 60, 1120, 620, 'SAVE / LOAD', '#ffd23f', { bg: '#141033', bar: '#2a2160' });
    const slots = [['存档 1', '第一章写完', '#22c08b'], ['存档 2', '加了图表', '#3ec1ff'], ['存档 3', '改崩了…', '#ff4d6d']];
    slots.forEach((sl, i) => {
      const sa = popIn(t, P('G01_04', 0.18 + i * 0.12)); if (sa <= 0) return;
      const y = 250 + i * 150 + (1 - a) * 60;
      ctx.save(); ctx.translate(1280, y + 55); ctx.scale(sa, sa); ctx.translate(-1280, -y - 55);
      const sel = i === 1 && t > P('G01_04', 0.72);
      ctx.fillStyle = sel ? 'rgba(255,210,63,0.25)' : 'rgba(255,255,255,0.07)'; rr(780, y, 1000, 110, 18); ctx.fill();
      ctx.lineWidth = sel ? 7 : 4; ctx.strokeStyle = sel ? '#ffd23f' : 'rgba(255,255,255,0.3)'; ctx.stroke();
      ctx.fillStyle = sl[2]; rr(800, y + 15, 80, 80, 14); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `46px ${F_FANCY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(i + 1, 840, y + 58);
      ctx.textAlign = 'left'; ctx.font = `bold 40px ${F_BODY}`; ctx.fillText(sl[0], 910, y + 56);
      ctx.fillStyle = i === 2 ? '#ff8fa3' : '#cfc8ef'; ctx.font = `36px ${F_BODY}`; ctx.fillText(sl[1], 1100, y + 56);
      ctx.restore();
    });
    const rp = prog(t, P('G01_04', 0.72), 0.3);
    if (rp > 0) { stamp(t, P('G01_04', 0.72), 1640, 405, '读档！', '#ffd23f', 54, -0.1); }
    ctx.restore();
    fancy('像游戏存档一样', 1280, 840, 64, t, P('G01_04', 0.1), Object.assign({ out: S('G01_05') - 0.2 }, FX.yel));
  }
  // 用途
  if (t >= S('G01_05') - 0.1) {
    const items = [['论文', '#3ec1ff', '📄'], ['代码', '#7cf07a', '</>'], ['设计', '#ff5c8a', '🎨']];
    items.forEach((it, i) => {
      const a = popIn(t, P('G01_05', 0.08 + i * 0.22)); if (a <= 0) return;
      badge(900 + i * 380, 440 + Math.sin(t * 3 + i) * 10, 140, it[1], it[2], { s: a, fs: it[2] === '</>' ? 80 : 110, font: it[2] === '</>' ? F_CODE : '"Segoe UI Emoji","Noto Color Emoji",sans-serif', fg: '#1b1433' });
      fancy(it[0], 900 + i * 380, 660, 70, t, P('G01_05', 0.1 + i * 0.22), FX.white);
    });
    fancy('都用得上！', 1280, 820, 80, t, P('G01_05', 0.75), FX.yel);
  }
};
SFX_FNS.push(() => {
  for (let i = 0; i < 5; i++) sfx(S('G01_01') + 1.0 + i * 0.55, 'pop', 0.4);
  sfx(P('G01_02', 0.7), 'stamp', 0.7); sfx(S('G01_03') - 0.1, 'whoosh', 0.6); sfx(S('G01_03') + 0.55, 'impact', 1.0); sfx(S('G01_03') + 1.0, 'pop', 0.4);
  [0.18, 0.30, 0.42].forEach(f => sfx(P('G01_04', f), 'pop', 0.4)); sfx(P('G01_04', 0.72), 'ding', 0.6);
  [0.08, 0.30, 0.52].forEach(f => sfx(P('G01_05', f), 'pop', 0.5));
});

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#4b2bb3', '#5d3bd6', W * 0.6, H * 0.45, 28, 0.2);
  sprite('g_cheer', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 250 + talkBob(t, en), 1180);
  sprite('d_happy', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 640);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 420); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-330, 0, 95, '#ffd23f', '第1集', { fs: 52, rot: -0.15 });
    fancy('给你的文件', 120, -60, 110, t, -99, FX.yel);
    fancy('装上存档！', 150, 80, 150, t, -99, FX.orange);
    ctx.restore();
    speedLines(t, 1060, 420, 1 - prog(t, t0 + 1.0, 0.6));
  }
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); });

// ---- 章节卡 ----
function cardScene(t, blk) {
  const e = blk.entries[0]; const t0 = e.vo; let [sx, sy] = shake(t, t0 + 0.35, 8, 0.25); ctx.translate(sx, sy);
  bgStripes(t, e.col);
  const ip = eOut(prog(t, t0 - 0.1, 0.35));
  ctx.save(); ctx.fillStyle = e.col; ctx.beginPath(); ctx.moveTo(-200, 330); ctx.lineTo(lerp(-200, W + 200, ip), 300); ctx.lineTo(lerp(-200, W + 200, ip), 760); ctx.lineTo(-200, 790); ctx.fill(); ctx.restore();
  const s = popIn(t, t0 + 0.25, 0.4);
  if (s > 0) badge(560, 545, 170, '#ffffff', e.n === 7 ? '★' : e.n, { s, fs: 200, fg: '#1b1433', rot: -0.1 });
  ctx.save(); ctx.globalAlpha = clamp(prog(t, t0 + 0.3, 0.2)); ctx.fillStyle = '#1b1433'; ctx.font = `bold 40px ${F_CODE}`; ctx.textAlign = 'left'; ctx.fillText(e.n === 7 ? 'REVIEW' : 'CHAPTER ' + e.n, 790, 400); ctx.restore();
  fancy(e.title, 790, 530, 130, t, t0 + 0.4, Object.assign({ align: 'left', stagger: 0.05 }, FX.white, { stroke: '#1b1433' }));
  ctx.save(); ctx.globalAlpha = clamp(prog(t, t0 + 0.9, 0.3)); ctx.fillStyle = '#1b1433'; ctx.font = `bold 42px ${F_CODE}`; ctx.textAlign = 'left'; ctx.fillText(e.sub, 800, 680); ctx.restore();
  flash(t, t0 + 0.32, 0.18);
}
for (let n = 1; n <= 7; n++) SC['card' + n] = cardScene;
SFX_FNS.push(() => BLOCKS.filter(b => b.b.startsWith('card')).forEach(b => { sfx(b.entries[0].vo - 0.1, 'swoosh_in', 0.5); sfx(b.entries[0].vo + 0.3, 'impact', 0.9); }));

// ---- 本节要点卡 ----
function sumScene(t, blk) {
  const e = blk.entries[0], t0 = e.vo;
  bgLecture(t, '#ffd23f');
  const a = eOut(prog(t, t0 - 0.1, 0.3));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 60);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; rr(270, 130, 1400, 760, 36); ctx.fill();
  ctx.fillStyle = '#fffaf0'; rr(250, 110, 1400, 760, 36); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#1b1433'; ctx.stroke();
  ctx.fillStyle = '#ffd23f'; rr(310, 70, 360, 84, 22); ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#1b1433'; ctx.font = `54px ${F_FANCY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('📌 本节要点', 490, 114);
  const n = e.items.length / 2;
  for (let i = 0; i < n; i++) {
    const p = eBack(prog(t, t0 + 0.15 + i * 0.2, 0.3)); if (p <= 0) continue;
    const y = 250 + i * (560 / n) + 20;
    ctx.save(); ctx.translate(320, y); ctx.scale(p, p);
    const cmd = e.items[i * 2], desc = e.items[i * 2 + 1];
    const isCode = /^[a-z.]/.test(cmd) || cmd === 'HEAD';
    ctx.font = isCode ? `bold 46px ${F_CODE}` : `bold 50px ${F_BODY}`;
    const w = ctx.measureText(cmd).width + 50;
    ctx.fillStyle = isCode ? '#1d1838' : CH_COL[(i + 2) % 8]; rr(0, -42, w, 84, 18); ctx.fill();
    ctx.fillStyle = isCode ? '#7cf07a' : '#1b1433'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(cmd, 25, 2);
    ctx.fillStyle = '#3b3355'; ctx.font = `bold 42px ${F_BODY}`;
    const dx = Math.max(w + 40, 0); ctx.fillText((w + 40 > 860 ? '' : '→ ') + desc, w + 40 > 860 ? 30 : dx, w + 40 > 860 ? 80 : 2);
    ctx.restore();
  }
  ctx.restore();
}
['install', 'init', 'zones', 'status', 'commit', 'log'].forEach(k => SC[k + '_sum'] = sumScene);
SFX_FNS.push(() => BLOCKS.filter(b => b.b.endsWith('_sum')).forEach(b => { const e = b.entries[0]; sfx(e.vo - 0.1, 'whoosh', 0.4); for (let i = 0; i < e.items.length / 2; i++) sfx(e.vo + 0.25 + i * 0.35, 'pop', 0.45); }));

// ---- 大肥鱼提问 ----
const ASK = {
  ask1: { q: '怎么安装？', col: '#d7f3ff', dot: '#b5e6ff' }, ask2: { q: '怎么交给它管？', col: '#d9fbe9', dot: '#b6f0d2' },
  ask3: { q: '具体怎么存？', col: '#fff1cc', dot: '#ffe29a' }, ask4: { q: '哪些改过了？', col: '#ffe0ea', dot: '#ffc2d4' },
  ask5: { q: '能封箱了吗？', col: '#ffe6d6', dot: '#ffcaa8' }, ask6: { q: '怎么翻存档？', col: '#eadfff', dot: '#d6c4ff' },
  ask7: { q: '全都学会了！', col: '#3ec1ff', dot: '#8fdcff', happy: true },
  askR1: { q: '能变回去吗？', col: '#ffe0ea', dot: '#ffc2d4' }, askR2: { q: '想要前天那版！', col: '#eadfff', dot: '#d6c4ff' },
  askP: { q: '完整走一遍！', col: '#fff1cc', dot: '#ffe29a' },
  askB1: { q: '怕把论文搞乱…', col: '#ffe6d6', dot: '#ffcaa8' }, askB2: { q: '怎么合回去？', col: '#d9fbe9', dot: '#b6f0d2' }, askB3: { q: '改了同一句？', col: '#ffe0e0', dot: '#ffbcbc' },
};
const CHAP = {
  ask1: ['存档', '安装与配置', '#7c5cff'], ask2: ['存档', '创建仓库', '#7c5cff'], ask3: ['存档', '三个区域', '#7c5cff'], ask4: ['存档', '查看与暂存', '#7c5cff'],
  ask5: ['存档', '提交存档', '#7c5cff'], ask6: ['存档', '查看历史', '#7c5cff'], askR1: ['读档', '撤销没存的改动', '#ff5c8a'], askR2: ['读档', '找回旧存档', '#ff5c8a'],
  askB1: ['平行世界', '开分支', '#22c08b'], askB2: ['平行世界', '合并分支', '#22c08b'], askB3: ['平行世界', '解决冲突', '#22c08b'], ask7: ['复习', '三件套速查', '#ff7a3d'], askP: ['实战', '从零完整走一遍', '#ff7a3d'],
};
function askScene(t, blk, en) {
  const cfg = ASK[blk.b], e = blk.entries[0], t0 = blk.t0;
  if (cfg.happy) { bgBurst(t, cfg.col, cfg.dot, W * 0.6, H * 0.55, 24, 0.5); confetti(t, t0 + 0.1, 110, 3, W * 0.62); }
  else bgDots(t, cfg.col, cfg.dot);
  // 讲师在左侧小一点地“听”
  sprite('g_explain', lerp(-300, 250, eOut(prog(t, t0, 0.3))), H + 330, 980, { filter: 'brightness(0.92)', scale: breath(t) });
  const p = spring(prog(t, t0 + 0.05, 0.8));
  sprite(e.pose, lerp(W + 600, 1320, eOut(prog(t, t0, 0.3))), H + 30, 880, { scale: lerp(1.06, 1, p) * breath(t, 1) });
  // 气泡
  const bp = popIn(t, e.vo + 0.4, 0.4);
  if (bp > 0) {
    ctx.save(); ctx.translate(820, 260); ctx.scale(bp, bp); ctx.rotate(-0.05);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1b1433'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.ellipse(0, 0, 330, 140, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(180, 100); ctx.lineTo(300, 210); ctx.lineTo(240, 80); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, 320, 132, 0, 0, 7); ctx.fill();
    ctx.restore();
    fancy(cfg.q, 820, 255, cfg.q.length > 5 ? 84 : 100, t, e.vo + 0.55, cfg.happy ? FX.yel : FX.blue);
  }
  const ch = CHAP[blk.b];
  if (ch) { // 章节标签：取代独立章节卡
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
SFX_FNS.push(() => BLOCKS.filter(b => b.b.startsWith('ask')).forEach(b => { sfx(b.t0 + 0.08, 'swoosh_in', 0.35); sfx(b.t0 + 0.05, b.b === 'ask7' ? 'impact' : 'pop', 0.6); sfx(b.entries[0].vo + 0.4, 'boing', 0.4); if (b.b === 'ask7') sfx(b.t0 + 0.1, 'confetti', 0.6); }));

// ---- 安装与配置 ----
const INSTALL_TERM = () => cmdLines([
  { t: P('G02_02', 0.42), s: 'git version', cmd: true },
  { t: E('G02_02') + 0.15, s: '{y}git version 2.51.0.windows.1' },
  { t: S('G02_05') + 0.35, s: 'git config --global user.name "大肥鱼"', cmd: true, dur: 1.1 },
  { t: S('G02_05') + 1.6, s: 'git config --global user.email "dfy@example.com"', cmd: true, dur: 1.1 },
]);
let _installTerm;
SC.install = (t, blk, en) => {
  bgLecture(t, '#3ec1ff'); lecturer(t, blk, en, blk.t0);
  // 浏览器 + 安装向导
  const bOut = prog(t, S('G02_02') - 0.2, 0.3);
  if (bOut < 1) {
    const a = eOut(prog(t, blk.t0, 0.35)) * (1 - bOut);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 50);
    win(700, 120, 1150, 640, '浏览器', '#3ec1ff', { bg: '#f6f4fb', bar: '#e2def0' });
    ctx.fillStyle = '#fff'; rr(800, 76 + 60, 900, 40, 20); ctx.fill(); ctx.fillStyle = '#555'; ctx.font = `26px ${F_CODE}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('🔒 https://git-scm.com', 820, 157);
    gitLogo(900, 330, 0.6); ctx.fillStyle = '#2a2140'; ctx.font = `bold 64px ${F_BODY}`; ctx.fillText('git', 990, 335);
    ctx.fillStyle = '#555'; ctx.font = `30px ${F_BODY}`; ctx.fillText('--everything-is-local', 1000, 400);
    const btnP = t > P('G02_01', 0.3) ? 0.95 : 1;
    ctx.save(); ctx.translate(1275, 560); ctx.scale(btnP, btnP); ctx.fillStyle = '#f05133'; rr(-250, -50, 500, 100, 20); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `bold 40px ${F_BODY}`; ctx.textAlign = 'center'; ctx.fillText('⬇ Download for Windows', 0, 2); ctx.restore();
    // 安装向导弹窗
    const dlg = popIn(t, P('G02_01', 0.42), 0.35);
    if (dlg > 0) {
      ctx.save(); ctx.translate(1275, 450); ctx.scale(dlg, dlg); ctx.translate(-1275, -450);
      win(930, 250, 690, 400, 'Git Setup', '#7c5cff', { bg: '#ffffff', bar: '#ece8f8' });
      const clicks = [0.55, 0.68, 0.81].map(f => P('G02_01', f)); const k = clicks.filter(c => t >= c).length;
      ctx.fillStyle = '#2a2140'; ctx.font = `bold 36px ${F_BODY}`; ctx.textAlign = 'left'; ctx.fillText(['欢迎安装 Git', '选择安装位置', '选择组件', '安装完成 ✓'][k], 980, 360);
      ctx.fillStyle = '#e6e2f2'; rr(980, 430, 590, 26, 13); ctx.fill(); ctx.fillStyle = '#7cf07a'; rr(980, 430, 590 * k / 3, 26, 13); ctx.fill();
      ctx.fillStyle = k >= 3 ? '#22c08b' : '#7c5cff'; rr(1380, 540, 200, 70, 14); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `bold 32px ${F_BODY}`; ctx.textAlign = 'center'; ctx.fillText(k >= 3 ? '完成' : '下一步 >', 1480, 577);
      ctx.restore();
    }
    // 光标
    const cx = lerp(1500, 1275, eIO(prog(t, S('G02_01') + 0.3, P('G02_01', 0.3) - S('G02_01') - 0.3)));
    const cy = lerp(700, 570, eIO(prog(t, S('G02_01') + 0.3, P('G02_01', 0.3) - S('G02_01') - 0.3)));
    const toBtn = prog(t, P('G02_01', 0.45), 0.1);
    const clicksT = [P('G02_01', 0.3), P('G02_01', 0.55), P('G02_01', 0.68), P('G02_01', 0.81)];
    let ck = 0; clicksT.forEach(c => { const q = (t - c) / 0.35; if (q > 0 && q < 1) ck = q; });
    cursor(lerp(cx, 1490, toBtn), lerp(cy, 590, toBtn), 1.1, ck);
    ctx.restore();
    fancy('一路「下一步」', 1280, 860, 66, t, P('G02_01', 0.6), Object.assign({ out: S('G02_02') - 0.2 }, FX.blue));
  }
  // 终端
  if (t >= S('G02_02') - 0.25) {
    _installTerm = _installTerm || INSTALL_TERM();
    const a = eOut(prog(t, S('G02_02') - 0.25, 0.35));
    terminal(t, 690, 130, 1180, 520, _installTerm, { alpha: a, scale: lerp(0.9, 1, a), fs: 34, accent: '#3ec1ff' });
    if (t >= S('G02_03') && t < S('G02_05')) stamp(t, S('G02_03') + 0.1, 1560, 400, '✓ 安装成功', '#22c08b', 60, -0.12);
    if (t >= S('G02_04') && t < S('G02_06')) {
      const ip = popIn(t, S('G02_04') + 0.2);
      if (ip > 0) { // 身份卡
        ctx.save(); ctx.translate(1280, 790); ctx.scale(ip, ip); ctx.rotate(-0.03);
        ctx.fillStyle = '#fffaf0'; rr(-330, -95, 660, 190, 24); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#1b1433'; ctx.stroke();
        ctx.fillStyle = '#3ec1ff'; ctx.beginPath(); ctx.arc(-230, 0, 62, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `70px ${F_FANCY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', -230, 4);
        ctx.fillStyle = '#1b1433'; ctx.textAlign = 'left'; ctx.font = `bold 38px ${F_BODY}`;
        const nm = t > S('G02_05') + 1.2 ? '大肥鱼' : '？？？', em = t > S('G02_05') + 2.4 ? 'dfy@example.com' : '？？？';
        ctx.fillText('名字：' + nm, -140, -32); ctx.font = `bold 34px ${F_BODY}`; ctx.fillText('邮箱：' + em, -140, 34);
        ctx.restore();
      }
    }
    if (t >= S('G02_06') - 0.2) { // 签名存档
      const a2 = popIn(t, S('G02_06'), 0.4);
      ctx.save(); ctx.translate(1280, 800); ctx.scale(a2, a2);
      ctx.fillStyle = '#fffaf0'; rr(-420, -100, 840, 200, 24); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#1b1433'; ctx.stroke();
      commitNode(-320, 0, 0.9, null, {});
      ctx.fillStyle = '#1b1433'; ctx.font = `bold 34px ${F_BODY}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('存档 #1  完成第一章', -230, -40);
      ctx.fillStyle = '#6b6488'; ctx.font = `30px ${F_BODY}`; ctx.fillText('Author: 大肥鱼 <dfy@example.com>', -230, 20);
      // 签名笔画
      const sp = prog(t, P('G02_06', 0.35), 0.9);
      ctx.strokeStyle = '#2f6fe0'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
      for (let i = 0; i <= 60 * sp; i++) { const u = i / 60; const x = 180 + u * 200, y = 55 + Math.sin(u * 18) * 14 - u * 20; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      ctx.restore();
      if (t > P('G02_06', 0.75)) stamp(t, P('G02_06', 0.75), 1700, 700, '谁改的一清二楚', '#7c5cff', 40, 0.1);
    }
  }
};
SFX_FNS.push(() => {
  [0.3, 0.55, 0.68, 0.81].forEach(f => sfx(P('G02_01', f), 'click', 0.7)); sfx(P('G02_01', 0.42), 'pop', 0.5);
  sfx(S('G02_02') - 0.25, 'whoosh', 0.5); sfx(E('G02_02') + 0.15, 'ding', 0.4); sfx(S('G02_03') + 0.1, 'stamp', 0.8);
  sfx(S('G02_04') + 0.2, 'pop', 0.5); sfx(S('G02_06'), 'pop', 0.5); sfx(P('G02_06', 0.35), 'tape', 0.3); sfx(P('G02_06', 0.75), 'stamp', 0.6);
});

// ---- git init ----
let _initTerm;
SC.init = (t, blk, en) => {
  bgLecture(t, '#22c08b'); lecturer(t, blk, en, blk.t0);
  const a = eOut(prog(t, blk.t0, 0.35));
  // 资源管理器
  ctx.save(); ctx.globalAlpha = a;
  win(680, 110, 560, 640, '📁 D:\\论文', '#22c08b', { bg: '#f6f4fb', bar: '#e2def0' });
  const files = [['第一章.md', '#2f6fe0', 'M'], ['第二章.md', '#2f6fe0', 'M'], ['图表.png', '#22a06b', '图'], ['参考文献.bib', '#e0452f', 'B']];
  const showGit = t >= S('G03_02') + 0.15;
  const rows = showGit ? [['.git', null, null], ...files] : files;
  rows.forEach((f, i) => {
    const y = 210 + i * 104; const isGit = f[0] === '.git';
    const ap = isGit ? popIn(t, S('G03_02') + 0.15) : 1;
    ctx.save(); ctx.translate(720, y); ctx.scale(ap, ap);
    const hl = isGit && t > S('G03_03') && t < S('G03_04') + 0.5;
    if (isGit) { ctx.fillStyle = hl ? 'rgba(255,210,63,0.35)' : 'rgba(34,192,139,0.15)'; rr(-10, -44, 500, 88, 14); ctx.fill(); if (hl) { ctx.lineWidth = 5; ctx.strokeStyle = '#ffd23f'; ctx.stroke(); } }
    if (isGit) folderIcon(40, 0, 0.8, '#b8aee0', { alpha: 0.75 }); else docIcon(40, 0, 0.55, f[2], f[1]);
    ctx.fillStyle = isGit ? '#6b6488' : '#2a2140'; ctx.font = `bold 36px ${isGit ? F_CODE : F_BODY}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(f[0], 110, 2);
    if (isGit) { ctx.fillStyle = '#8f8aa8'; ctx.font = `24px ${F_BODY}`; ctx.fillText('(隐藏)', 230, 4); }
    ctx.restore();
  });
  ctx.restore();
  if (showGit) sparkle(t, S('G03_02') + 0.15, 790, 210, 130, 12);
  // 终端
  _initTerm = _initTerm || cmdLines([
    { t: P('G03_01', 0.32), s: 'cd D:/论文', cmd: true, dur: 0.5 },
    { t: P('G03_01', 0.5), s: 'git init', cmd: true },
    { t: E('G03_01') + 0.2, s: '{g}Initialized empty Git' },
    { t: E('G03_01') + 0.3, s: '{g}repository in D:/论文/.git/' },
  ]);
  terminal(t, 1270, 110, 600, 400, _initTerm, { alpha: a, fs: 30, accent: '#22c08b' });
  if (t >= E('G03_01') + 0.2 && t < S('G03_03')) fancy('git init = 初始化', 1570, 600, 56, t, E('G03_01') + 0.3, FX.green);
  // 仓库 = 存档库
  if (t >= S('G03_03') && t < S('G03_04')) {
    const v = popIn(t, S('G03_03') + 0.2, 0.4);
    ctx.save(); ctx.translate(1570, 680); ctx.scale(v, v);
    ctx.fillStyle = '#5a4b8a'; rr(-170, -150, 340, 300, 30); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.fillStyle = '#2a2140'; rr(-130, -110, 260, 220, 20); ctx.fill();
    [0, 1, 2].forEach(i => { ctx.fillStyle = ['#22c08b', '#3ec1ff', '#ffd23f'][i]; rr(-100, -85 + i * 62, 200, 46, 10); ctx.fill(); ctx.fillStyle = '#1b1433'; ctx.font = `bold 26px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('存档 ' + (i + 1), 0, -61 + i * 62); });
    ctx.restore();
    fancy('.git = 存档库', 1570, 470, 60, t, S('G03_03') + 0.5, FX.yel);
  }
  // 警告
  if (t >= S('G03_04') - 0.1) {
    const w = popIn(t, S('G03_04') + 0.1, 0.35);
    const [sx, sy] = shake(t, P('G03_04', 0.4), 8, 0.3);
    ctx.save(); ctx.translate(1570 + sx, 700 + sy); ctx.scale(w, w);
    ctx.fillStyle = '#ff4d6d'; ctx.beginPath(); ctx.moveTo(0, -190); ctx.lineTo(190, 140); ctx.lineTo(-190, 140); ctx.closePath(); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = `200px ${F_FANCY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 20);
    ctx.restore();
    fancy('千万别删 .git！', 1570, 895, 66, t, P('G03_04', 0.3), Object.assign({ wobble: 3 }, FX.red));
    if (t > P('G03_04', 0.4)) { ctx.fillStyle = `rgba(255,0,40,${0.1 + 0.06 * Math.sin(t * 12)})`; ctx.fillRect(...OS); }
  }
};
SFX_FNS.push(() => { sfx(E('G03_01') + 0.2, 'ding', 0.4); sfx(S('G03_02') + 0.15, 'ding', 0.8); sfx(S('G03_02') + 0.2, 'sparkle', 0.5); sfx(S('G03_03') + 0.2, 'pop', 0.5); sfx(S('G03_04') + 0.1, 'buzz', 0.7); sfx(P('G03_04', 0.4), 'buzz', 0.5); });

// ---- 三个区域 ----
SC.zones = (t, blk, en) => {
  bgLecture(t, '#ffb020'); lecturer(t, blk, en, blk.t0);
  const hi = t >= S('G04_04') ? 'repo' : t >= S('G04_03') ? 'stage' : t >= S('G04_02') ? 'work' : null;
  zoneBoard(t, P('G04_01', 0.55), t < S('G04_05') ? hi : null);
  if (t < S('G04_02')) fancy('三个区域', 1285, 140, 80, t, P('G04_01', 0.4), FX.yel);
  // 工作区文件 + 编辑笔
  const files = [['第一章.md', 'M', '#2f6fe0'], ['图表.png', '图', '#22a06b'], ['参考.bib', 'B', '#e0452f']];
  const flyP = prog(t, P('G04_03', 0.55), 0.6);
  files.forEach((f, i) => {
    const ap = popIn(t, S('G04_02') + 0.6 + i * 0.25); if (ap <= 0) return;
    if (i === 0 && flyP > 0) return;
    docIcon(900 + (i - 1) * 105, ZY + 200 + (i % 2) * 120 + Math.sin(t * 3 + i) * 5, 0.85 * ap, f[1], f[2], { name: f[0], rot: Math.sin(t * 2 + i) * 0.05 });
  });
  if (t > S('G04_02') + 1.2 && t < S('G04_03')) { // 编辑中的铅笔
    const px = 820 + Math.sin(t * 9) * 20, py = ZY + 170 + Math.cos(t * 7) * 10;
    ctx.save(); ctx.translate(px, py); ctx.rotate(0.7); ctx.fillStyle = '#ffd23f'; ctx.fillRect(-8, -60, 16, 70); ctx.fillStyle = '#f0b090'; ctx.beginPath(); ctx.moveTo(-8, 10); ctx.lineTo(8, 10); ctx.lineTo(0, 30); ctx.fill(); ctx.restore();
    fancy('编辑中…', 900, ZY + 520, 46, t, S('G04_02') + 1.2, FX.blue);
  }
  // 暂存区快递箱
  const boxIn = popIn(t, P('G04_03', 0.2), 0.4);
  const lid = eOut(prog(t, P('G04_04', 0.35), 0.4)), tape = prog(t, P('G04_04', 0.5), 0.3), label = prog(t, P('G04_04', 0.6), 0.25);
  const fly2 = prog(t, P('G04_04', 0.75), 0.45);
  if (boxIn > 0 && fly2 < 1) {
    const e2 = eIn(fly2);
    const bx = lerp(1285, 1670, e2), by = lerp(ZY + 300, ZY + 230, e2) - Math.sin(e2 * Math.PI) * 180;
    if (flyP > 0 && lid < 0.5) {
      const e = eIO(flyP); docIcon(lerp(795, 1285, e), lerp(ZY + 200, ZY + 250, e) - Math.sin(e * Math.PI) * 240, lerp(0.85, 0.7, e), 'M', '#2f6fe0', { rot: flyP < 1 ? e * 6.28 : 0 });
    }
    boxIcon(bx, by, lerp(0.95, 0.4, e2) * boxIn, lid, { tape, label });
  }
  if (t >= S('G04_03') && t < S('G04_04')) fancy('快递箱 📦', 1285, ZY + 540, 50, t, P('G04_03', 0.3), FX.yel);
  if (fly2 >= 1) commitNode(1670, ZY + 230, spring(prog(t, P('G04_04', 0.75) + 0.45, 0.6)), 'a1b2c3d', { glow: 1, t });
  if (t >= S('G04_04') && t < S('G04_05')) fancy('永久存档', 1670, ZY + 540, 50, t, P('G04_04', 0.85), FX.orange);
  flash(t, P('G04_04', 0.75) + 0.45, 0.25);
  // 路线
  if (t >= S('G04_05')) {
    const rp = prog(t, P('G04_05', 0.2), D('G04_05') * 0.6);
    const x = lerp(760, 1810, eIO(rp));
    ctx.save(); const g = ctx.createRadialGradient(x, ZY + ZH / 2, 10, x, ZY + ZH / 2, 220); g.addColorStop(0, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - 230, ZY - 50, 460, ZH + 100); ctx.restore();
    ZONES.forEach((z, i) => { if (rp > (i + 0.3) / 3.2) sparkle(t, P('G04_05', 0.2) + D('G04_05') * 0.6 * (i + 0.3) / 3.2, z.x, ZY - 40, 120, 8); });
    fancy('工作区 → 暂存区 → 仓库', 1285, ZY + 560, 58, t, P('G04_05', 0.25), Object.assign({ stagger: 0.03 }, FX.yel));
  }
};
SFX_FNS.push(() => {
  [0, 1, 2].forEach(i => sfx(P('G04_01', 0.55) + i * 0.12, 'pop', 0.45)); [0, 1, 2].forEach(i => sfx(S('G04_02') + 0.6 + i * 0.25, 'pop', 0.35));
  sfx(P('G04_03', 0.2), 'pop', 0.5); sfx(P('G04_03', 0.55), 'whoosh', 0.45); sfx(P('G04_03', 0.55) + 0.6, 'ding', 0.4);
  sfx(P('G04_04', 0.35), 'pop', 0.4); sfx(P('G04_04', 0.5), 'tape', 0.6); sfx(P('G04_04', 0.6), 'stamp', 0.8); sfx(P('G04_04', 0.75), 'whoosh', 0.5); sfx(P('G04_04', 0.75) + 0.45, 'shutter', 0.9);
  sfx(P('G04_05', 0.2), 'swoosh_in', 0.5); [0, 1, 2].forEach(i => sfx(P('G04_05', 0.2) + D('G04_05') * 0.6 * (i + 0.3) / 3.2, 'ding', 0.35));
});

// ---- status / diff / add ----
let _stTerm;
SC.status = (t, blk, en) => {
  bgLecture(t, '#ff5c8a'); lecturer(t, blk, en, blk.t0);
  if (!_stTerm) {
    const t1 = P('G05_01', 0.25), o1 = t1 + 1.0;
    const t4 = P('G05_04', 0.3), t5 = S('G05_05') + 0.1, t6 = P('G05_06', 0.6);
    _stTerm = cmdLines([
      { t: t1, s: 'git status', cmd: true },
      { t: o1, s: '{d}On branch main' },
      { t: o1 + 0.08, s: 'Changes not staged for commit:' },
      { t: o1 + 0.16, s: '{r}    modified:   第一章.md', hl: [S('G05_02'), E('G05_02')] },
      { t: o1 + 0.24, s: 'Untracked files:' },
      { t: o1 + 0.32, s: '{r}    图表.png', hl: [S('G05_02'), E('G05_02')] },
      { t: t4 - 0.2, clear: true },
      { t: t4, s: 'git add 第一章.md', cmd: true },
      { t: t5, s: 'git status', cmd: true, dur: 0.5 },
      { t: t5 + 0.6, s: 'Changes to be committed:' },
      { t: t5 + 0.68, s: '{g}    modified:   第一章.md', hl: [t5 + 0.7, E('G05_05') + 0.2], hlc: '#7cf07a' },
      { t: t5 + 0.76, s: 'Untracked files:' },
      { t: t5 + 0.84, s: '{r}    图表.png' },
      { t: t6 - 0.15, clear: true },
      { t: t6, s: 'git add .', cmd: true },
      { t: t6 + 0.6, s: 'git status', cmd: true, dur: 0.4 },
      { t: t6 + 1.1, s: 'Changes to be committed:' },
      { t: t6 + 1.18, s: '{g}    modified:   第一章.md' },
      { t: t6 + 1.26, s: '{g}    new file:   图表.png' },
    ]);
  }
  const diffIn = prog(t, S('G05_03') - 0.1, 0.3), diffOut = prog(t, S('G05_04') - 0.1, 0.3);
  const termA = eOut(prog(t, blk.t0, 0.35));
  terminal(t, 690, 120, 1180, 640, _stTerm, { alpha: termA * (1 - 0.7 * (diffIn - diffOut)), fs: 36, accent: '#ff5c8a' });
  if (t >= S('G05_02') && t < S('G05_03')) fancy('红色 = 改了，还没暂存', 1280, 860, 60, t, S('G05_02') + 0.3, FX.red);
  // diff 面板
  const dv = eOut(diffIn) * (1 - eIn(diffOut));
  if (dv > 0) {
    ctx.save(); ctx.globalAlpha = dv; ctx.translate(0, (1 - dv) * 80);
    win(740, 150, 1080, 600, 'git diff 第一章.md', '#ffd23f', { bg: '#14102a' });
    const L = [[' ', '# 第一章 绪论', null], [' ', '', null], ['-', '本文研究了鲸鱼的游泳速度。', 'r'], ['+', '本文研究了大肥鱼的摸鱼速度。', 'g'], [' ', '', null], [' ', '实验结果表明……', null], ['+', '摸鱼可以提升 200% 的快乐。', 'g']];
    L.forEach((l, i) => {
      const la = prog(t, S('G05_03') + 0.35 + i * 0.1, 0.15); if (la <= 0) return;
      const y = 260 + i * 66; ctx.globalAlpha = dv * la;
      if (l[2]) { const pulse = (l[2] === 'r' ? t > P('G05_03', 0.55) && t < P('G05_03', 0.75) : t > P('G05_03', 0.75)) ? 0.38 : 0.2; ctx.fillStyle = l[2] === 'r' ? `rgba(255,80,110,${pulse})` : `rgba(90,230,120,${pulse})`; ctx.fillRect(760, y - 30, 1040, 60); }
      ctx.font = `bold 38px ${F_CODE}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = l[2] ? TC[l[2]] : TC.w; ctx.fillText(l[0], 790, y); ctx.fillText(l[1], 840, y);
    });
    ctx.restore();
    fancy('－ 删掉的', 1050, 860, 60, t, P('G05_03', 0.55), FX.red);
    fancy('＋ 新加的', 1520, 860, 60, t, P('G05_03', 0.75), FX.green);
  }
  if (t >= S('G05_05') && t < S('G05_06')) { fancy('变绿了！', 1600, 840, 80, t, S('G05_05') + 0.9, Object.assign({ wobble: 3 }, FX.green)); sparkle(t, S('G05_05') + 0.9, 1100, 395, 160, 12, '#7cf07a'); }
  if (t >= S('G05_06')) fancy('git add .  = 全部放进去', 1280, 860, 56, t, P('G05_06', 0.75), FX.yel);
};
SFX_FNS.push(() => { sfx(S('G05_02') + 0.3, 'pop', 0.4); sfx(S('G05_03') - 0.1, 'whoosh', 0.5); sfx(P('G05_03', 0.55), 'pop', 0.5); sfx(P('G05_03', 0.75), 'pop', 0.5); sfx(S('G05_04') - 0.1, 'whoosh', 0.4); sfx(S('G05_05') + 0.9, 'ding', 0.7); sfx(P('G05_06', 0.75), 'pop', 0.5); });

// ---- commit ----
let _cmTerm;
SC.commit = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  _cmTerm = _cmTerm || cmdLines([
    { t: P('G06_01', 0.22), s: 'git commit -m "完成第一章"', cmd: true, dur: 1.3 },
    { t: S('G06_02') + 0.05, s: '{y}[main a1b2c3d]{w} 完成第一章' },
    { t: S('G06_02') + 0.15, s: '{d} 2 files changed, 18 insertions(+)' },
  ]);
  const tA = eOut(prog(t, blk.t0, 0.35));
  const tShrink = eIO(prog(t, S('G06_03') - 0.2, 0.4));
  terminal(t, 690, lerp(130, 100, tShrink), 1180, lerp(420, 300, tShrink), _cmTerm, { alpha: tA, fs: lerp(38, 32, tShrink), accent: '#ff7a3d' });
  if (t >= S('G06_02') && t < S('G06_03')) {
    const p = spring(prog(t, S('G06_02') + 0.05, 0.6));
    commitNode(1280, 740, 1.6 * p, 'a1b2c3d', { glow: 1, t });
    // 取景框
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; const fr = lerp(1.5, 1, eOut(prog(t, S('G06_02'), 0.25)));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const cx = 1280 + a * 230 * fr, cy = 740 + b * 170 * fr; ctx.beginPath(); ctx.moveTo(cx, cy - b * 60); ctx.lineTo(cx, cy); ctx.lineTo(cx - a * 60, cy); ctx.stroke(); });
    ctx.restore();
    fancy('咔嚓！', 1640, 640, 100, t, S('G06_02') + 0.1, Object.assign({ rot: 0.1 }, FX.orange));
  }
  flash(t, S('G06_02') + 0.05, 0.3);
  if (t >= S('G06_03') && t < S('G06_04')) {
    const hp = popIn(t, S('G06_03') + 0.1, 0.4);
    ctx.save(); ctx.translate(1280, 600); ctx.scale(hp, hp);
    ctx.font = `bold 120px ${F_CODE}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 14; ctx.strokeStyle = '#1b1433'; ctx.strokeText('a1b2c3d', 0, 0); ctx.fillStyle = '#ffd36b'; ctx.fillText('a1b2c3d', 0, 0);
    const full = 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678'; const n = Math.floor(clamp((t - P('G06_03', 0.35)) / 1.2) * full.length);
    ctx.font = `bold 34px ${F_CODE}`; ctx.fillStyle = '#cfc8ef'; ctx.fillText(full.slice(0, n), 0, 100);
    ctx.restore();
    fancy('哈希值 = 存档编号', 1280, 840, 62, t, P('G06_03', 0.5), FX.yel);
  }
  if (t >= S('G06_04') && t < S('G06_05')) {
    const a = popIn(t, S('G06_04') + 0.1, 0.4);
    ctx.save(); ctx.translate(1280, 640); ctx.scale(a, a);
    ctx.fillStyle = 'rgba(255,255,255,0.09)'; rr(-200, -200, 400, 360, 30); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = '#ffd23f'; ctx.stroke();
    ctx.fillStyle = '#ffd23f'; rr(-150, -232, 300, 64, 20); ctx.fill(); ctx.fillStyle = '#1b1433'; ctx.font = `42px ${F_FANCY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('暂存区', 0, -198);
    const out = eIn(prog(t, P('G06_04', 0.2), 0.5));
    if (out < 1) docIcon(0 + out * 600, 0 - out * 200, 0.9 * (1 - out * 0.5), 'M', '#2f6fe0', { rot: out * 3 });
    ctx.globalAlpha = clamp(prog(t, P('G06_04', 0.5), 0.3)); ctx.fillStyle = '#8f8aa8'; ctx.font = `bold 44px ${F_BODY}`; ctx.fillText('（空）', 0, 10);
    ctx.restore();
    fancy('清空，等下一批', 1280, 860, 60, t, P('G06_04', 0.55), FX.yel);
  }
  if (t >= S('G06_05') && t < S('G06_06')) {
    const good = ['完成第一章', '修改参考文献'], bad = ['改了改', 'asdf', '更新'];
    good.forEach((g, i) => { const a = popIn(t, P('G06_05', 0.2 + i * 0.12)); if (a <= 0) return; ctx.save(); ctx.translate(1000, 520 + i * 140); ctx.scale(a, a); ctx.fillStyle = '#d9ffe2'; rr(-230, -50, 460, 100, 20); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#22c08b'; ctx.stroke(); ctx.fillStyle = '#0d3a1a'; ctx.font = `bold 40px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('✓ ' + g, 0, 2); ctx.restore(); });
    bad.forEach((g, i) => { const a = popIn(t, P('G06_05', 0.62 + i * 0.08)); if (a <= 0) return; ctx.save(); ctx.translate(1580, 480 + i * 130); ctx.scale(a, a); ctx.rotate((i - 1) * 0.06); ctx.fillStyle = '#ffe0e6'; rr(-180, -48, 360, 96, 20); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#ff4d6d'; ctx.stroke(); ctx.fillStyle = '#3a0010'; ctx.font = `bold 40px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('✗ ' + g, 0, 2); ctx.restore(); });
    if (t > P('G06_05', 0.85)) stamp(t, P('G06_05', 0.85), 1580, 610, 'NG', '#ff4d6d', 110, -0.2);
    fancy('好说明', 1000, 400, 60, t, P('G06_05', 0.2), FX.green); fancy('坏说明', 1580, 370, 60, t, P('G06_05', 0.6), FX.red);
  }
  if (t >= S('G06_06')) {
    const a = popIn(t, S('G06_06') + 0.1, 0.4);
    ctx.save(); ctx.translate(1280, 620); ctx.scale(a, a); cryFace(0, 0, 150, t); ctx.restore();
    fancy('未来的你：呜呜…', 1280, 860, 60, t, P('G06_06', 0.4), FX.blue);
  }
};
SFX_FNS.push(() => { sfx(S('G06_02') + 0.05, 'shutter', 1.0); sfx(S('G06_02') + 0.1, 'impact', 0.6); sfx(S('G06_03') + 0.1, 'pop', 0.5); for (let k = 0; k < 14; k++) sfx(P('G06_03', 0.35) + k * 0.085, 'type', 0.2);
  sfx(S('G06_04') + 0.1, 'pop', 0.5); sfx(P('G06_04', 0.2), 'whoosh', 0.4); [0.2, 0.32].forEach(f => sfx(P('G06_05', f), 'ding', 0.35)); [0.62, 0.7, 0.78].forEach(f => sfx(P('G06_05', f), 'pop', 0.4)); sfx(P('G06_05', 0.85), 'buzz', 0.6); sfx(S('G06_06') + 0.1, 'boing', 0.5); });

// ---- log ----
let _lgTerm;
SC.log = (t, blk, en) => {
  bgLecture(t, '#a66bff'); lecturer(t, blk, en, blk.t0);
  if (!_lgTerm) {
    const o = E('G07_01') + 0.1, t3 = P('G07_03', 0.25);
    const C = [['c3d4e5f', '修改参考文献', '21:30'], ['b2c3d4e', '加入图表', '20:05'], ['a1b2c3d', '完成第一章', '18:42']];
    const L = [{ t: P('G07_01', 0.2), s: 'git log', cmd: true, dur: 0.5 }];
    C.forEach((c, i) => {
      const b = o + i * 0.25;
      L.push({ t: b, s: `{y}commit ${c[0]}${i === 0 ? ' {c}(HEAD -> main)' : ''}` });
      L.push({ t: b + 0.05, s: '{w}Author: 大肥鱼 <dfy@example.com>', hl: i === 0 ? [P('G07_02', 0.0), P('G07_02', 0.3)] : null, hlc: '#6bd3ff' });
      L.push({ t: b + 0.1, s: `{w}Date:   Sat Oct 24 ${c[2]}`, hl: i === 0 ? [P('G07_02', 0.3), P('G07_02', 0.6)] : null, hlc: '#ffd36b' });
      L.push({ t: b + 0.15, s: `{p}    ${c[1]}`, hl: i === 0 ? [P('G07_02', 0.6), E('G07_02') + 0.2] : null, hlc: '#c9a6ff' });
    });
    L.push({ t: t3 - 0.2, clear: true });
    L.push({ t: t3, s: 'git log --oneline', cmd: true });
    C.forEach((c, i) => L.push({ t: t3 + 1.0 + i * 0.12, s: `{y}${c[0]}${i === 0 ? ' {c}(HEAD -> main)' : ''}{w} ${c[1]}`, hl: i === 0 ? [S('G07_04'), E('G07_04') + 0.3] : null, hlc: '#6bd3ff' }));
    _lgTerm = cmdLines(L);
  }
  const tA = eOut(prog(t, blk.t0, 0.35));
  const narrow = eIO(prog(t, S('G07_04') - 0.2, 0.4));
  terminal(t, 690, 120, lerp(1180, 820, narrow), 640, _lgTerm, { alpha: tA, fs: 32, accent: '#a66bff' });
  if (t >= S('G07_02') && t < S('G07_03')) {
    [['谁', '#6bd3ff', 0.0], ['何时', '#ffd36b', 0.3], ['什么', '#c9a6ff', 0.6]].forEach((k, i) => { const a = popIn(t, P('G07_02', k[2])); if (a > 0) badge(1720, 260 + i * 140, 62, k[1], k[0], { s: a, fs: k[0].length > 1 ? 40 : 56 }); });
    fancy('一目了然', 1280, 860, 64, t, P('G07_02', 0.7), FX.yel);
  }
  if (t >= S('G07_03') && t < S('G07_04')) fancy('一行一个，清清爽爽', 1280, 860, 60, t, P('G07_03', 0.6), FX.green);
  if (narrow > 0) { // 提交图
    const gx = 1690; ctx.save(); ctx.globalAlpha = narrow;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(gx, 300); ctx.lineTo(gx, 700); ctx.stroke();
    [['c3d4e5f', '#ff7a3d'], ['b2c3d4e', '#3ec1ff'], ['a1b2c3d', '#22c08b']].forEach((c, i) => commitNode(gx, 300 + i * 200, 0.8 * popIn(t, S('G07_04') + i * 0.12), null, { col: c[1] }));
    const hp = eBack(prog(t, P('G07_04', 0.45), 0.4)); const hy = 300 - 120 + Math.sin(t * 5) * 8;
    if (hp > 0) { ctx.save(); ctx.translate(gx, hy); ctx.scale(hp, hp); ctx.fillStyle = '#6bd3ff'; rr(-80, -36, 160, 64, 18); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.fillStyle = '#0d2238'; ctx.font = `bold 36px ${F_CODE}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('HEAD', 0, -2); ctx.beginPath(); ctx.moveTo(-14, 30); ctx.lineTo(14, 30); ctx.lineTo(0, 54); ctx.fillStyle = '#6bd3ff'; ctx.fill(); ctx.restore(); }
    ctx.restore();
    fancy('HEAD = 你在这里', 1280, 860, 62, t, P('G07_04', 0.55), FX.blue);
  }
};
SFX_FNS.push(() => { sfx(E('G07_01') + 0.1, 'whoosh', 0.3); [0, 0.3, 0.6].forEach(f => sfx(P('G07_02', f), 'pop', 0.5)); sfx(P('G07_03', 0.6), 'ding', 0.4); sfx(S('G07_04'), 'pop', 0.4); sfx(P('G07_04', 0.45), 'boing', 0.5); });

// ================= 读档 / 平行世界 =================
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
// 分支图：st = {base, idea, ideaN, head(0..1 主线→分支), ff(快进合并 0..1), del, mainTag, t}
const BG = { my: 640, iy: 450, xs: [840, 1010, 1180], ix: [1360, 1530] };
function branchGraph(t, st) {
  const { my, xs, ix } = BG; const iy = lerp(BG.iy, my, eIO(st.ff || 0));
  const ba = st.base; if (ba <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(ba * 2);
  seg(760, my, lerp(760, 1300, eOut(ba)), my, '#7c5cff');
  const mainEnd = (st.ff || 0) > 0 ? lerp(1300, ix[1] + 120, eIO(st.ff)) : 1300;
  if ((st.ff || 0) > 0) seg(1300, my, mainEnd, my, '#7c5cff', 1);
  const ip = st.idea || 0;
  if (ip > 0) {
    const col = (st.ff || 0) > 0.6 ? '#7c5cff' : '#ff5c8a';
    seg(xs[2], my, ix[0], iy, col, eOut(clamp(ip * 1.6)));
    if (ip > 0.6) seg(ix[0], iy, lerp(ix[0], ix[1] + 120, eOut(clamp((ip - 0.6) / 0.4))), iy, col);
    for (let i = 0; i < 2; i++) { const a = popIn(t, (st.ideaT || [99, 99])[i]); if (a > 0) commitNode(ix[i], iy, 0.62 * a, null, { col: col === '#7c5cff' ? '#a66bff' : '#ff5c8a' }); }
    const da = 1 - clamp(st.del || 0); const ta = popIn(t, st.ideaTagT ?? 99) * da;
    pill(lerp(ix[1] + 200, ix[1] + 220, eIO(st.ff || 0)), iy - 80 * eIO(st.ff || 0), 'idea', '#ff5c8a', ta);
  }
  ['#22c08b', '#3ec1ff', '#ff7a3d'].forEach((c, i) => { const a = popIn(t, (st.nodeT || 0) + i * 0.1); if (a > 0) commitNode(xs[i], my, 0.62 * a, null, { col: c }); });
  const mx = (st.ff || 0) > 0 ? lerp(1300, ix[1] + 120, eIO(st.ff)) : 1300;
  pill(mx + 100, my, 'main', '#ffd23f', popIn(t, st.mainTagT ?? 99));
  if (st.headT != null) {
    const hs = popIn(t, st.headT); const h = eIO(clamp(st.head || 0));
    const tipMain = (st.ff || 0) > 0 ? ix[1] : xs[2];
    const hx = lerp(tipMain, (st.ideaN || 0) > 0 ? ix[Math.min(1, st.ideaN - 1)] : ix[0] - 40, h);
    const hy = lerp(my, iy, h) - 96 + Math.sin(t * 2) * 4;
    headTag(hx, hy, hs);
  }
  ctx.restore();
}

// ---- 读档①：还没存档 ----
SC.restore1 = (t, blk, en) => {
  bgLecture(t, '#ff5c8a'); lecturer(t, blk, en, blk.t0);
  if (!_r1Term) _r1Term = cmdLines([
    { t: P('G09_01', 0.32), s: 'git restore 第一章.md', cmd: true },
    { t: P('G09_03', 0.45), s: 'git restore --staged 第一章.md', cmd: true, dur: 1.0 },
  ]);
  const tA = eOut(prog(t, blk.t0, 0.3));
  terminal(t, 700, 90, 1160, 240, _r1Term, { alpha: tA, fs: 34, accent: '#ff5c8a' });
  if (t < S('G09_03')) {
    const a = popIn(t, blk.t0 + 0.15); const fix = prog(t, P('G09_01', 0.72), 0.35);
    const shk = fix > 0 && fix < 1 ? Math.sin(t * 60) * 8 * (1 - fix) : 0;
    if (a > 0) {
      docIcon(1060 + shk, 610, 1.9 * a, 'M', '#7c5cff', { broken: fix < 0.5, name: '第一章.md', nameSize: 22, rot: lerp(-0.08, 0, fix) });
      scribble(1060, 640, 1.6, (1 - fix) * a);
    }
    if (fix > 0 && fix < 1) { ctx.save(); ctx.translate(1060, 600); ctx.rotate(-t * 10); ctx.strokeStyle = '#7cf07a'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 190, 0, 4.6); ctx.stroke(); ctx.restore(); }
    if (fix >= 1) sparkle(t, P('G09_01', 0.72) + 0.35, 1060, 600, 200, 12, '#7cf07a');
    if (t < S('G09_02')) fancy('回到上次存档', 1560, 560, 74, t, P('G09_01', 0.8), FX.green);
    else {
      const sa = popIn(t, P('G09_02', 0.35)); if (sa > 0) stamp(t, P('G09_02', 0.35), 1560, 560, '没存的改动会丢！', '#e02424', 58, -0.1);
    }
  } else {
    const za = eOut(prog(t, S('G09_03') - 0.1, 0.3));
    miniZone(1000, 620, 400, 330, '工作区', '#3ec1ff', za, t > P('G09_03', 0.75));
    miniZone(1570, 620, 400, 330, '暂存区', '#ffd23f', za, t < P('G09_03', 0.75));
    const fly = eIO(prog(t, P('G09_03', 0.62), 0.45));
    const x = lerp(1570, 1000, fly), y = 640 - Math.sin(fly * Math.PI) * 180;
    docIcon(x, y, 1.15 * za, 'M', '#7c5cff', { name: '第一章.md', nameSize: 22, rot: Math.sin(fly * Math.PI) * 0.4 });
    if (t >= S('G09_04')) fancy('改动还在，你说了算', 1290, 870, 62, t, P('G09_04', 0.3), FX.yel);
  }
};
let _r1Term;
SFX_FNS.push(() => { sfx(P('G09_01', 0.72), 'rewind', 0.6); sfx(P('G09_01', 0.72) + 0.35, 'sparkle', 0.5); sfx(P('G09_02', 0.35), 'buzz', 0.5); sfx(P('G09_02', 0.35) + 0.05, 'stamp', 0.7); sfx(P('G09_03', 0.62), 'swoosh_in', 0.5); sfx(P('G09_04', 0.3), 'pop', 0.4); });

// ---- 读档②：找回旧存档 / revert / reset 警告 ----
SC.restore2 = (t, blk, en) => {
  bgLecture(t, '#a66bff'); lecturer(t, blk, en, blk.t0);
  if (!_r2Term) {
    const o = P('G10_01', 0.55);
    _r2Term = cmdLines([
      { t: P('G10_01', 0.12), s: 'git log --oneline', cmd: true, dur: 0.6 },
      { t: o, s: '{y}c3d4e5f {c}(HEAD -> main){w} 修改参考文献' },
      { t: o + 0.1, s: '{y}b2c3d4e{w} 加入图表' },
      { t: o + 0.2, s: '{y}a1b2c3d{w} 完成第一章', hl: [P('G10_01', 0.75), E('G10_02')], hlc: '#ffd36b' },
      { t: P('G10_02', 0.3), s: 'git restore --source=a1b2c3d 第一章.md', cmd: true, dur: 1.1 },
      { t: S('G10_04') - 0.05, clear: true },
      { t: P('G10_04', 0.45), s: 'git revert c3d4e5f', cmd: true, dur: 0.7 },
      { t: P('G10_05', 0.1), s: '{g}[main d4e5f6a] Revert "修改参考文献"' },
      { t: P('G10_06', 0.12), s: 'git reset --hard a1b2c3d', cmd: true, dur: 0.8 },
    ]);
  }
  const tA = eOut(prog(t, blk.t0, 0.3));
  terminal(t, 700, 90, 1160, 330, _r2Term, { alpha: tA, fs: 32, accent: '#a66bff' });
  const gy = 660, nx = [880, 1070, 1260], cols = ['#22c08b', '#3ec1ff', '#ff7a3d'], hs = ['a1b2c3d', 'b2c3d4e', 'c3d4e5f'];
  if (t >= S('G10_01') + 0.2 && t < S('G10_04')) {
    const ga = eOut(prog(t, P('G10_01', 0.5), 0.3));
    ctx.save(); ctx.globalAlpha = ga; seg(820, gy, 1340, gy, 'rgba(255,255,255,0.7)', 1, 10);
    nx.forEach((x, i) => commitNode(x, gy, 0.75, hs[i], { col: cols[i], glow: i === 0 && t > P('G10_01', 0.75) ? 1 : 0, t }));
    ctx.restore();
    if (t > P('G10_01', 0.75)) pill(900, gy - 110, '前天', '#ffd23f', popIn(t, P('G10_01', 0.75)), { font: F_FANCY, fs: 36 });
    // 工作区里的第一章
    miniZone(1640, gy, 300, 260, '工作区', '#3ec1ff', ga);
    const fly = eIO(prog(t, P('G10_03', 0.05), 0.55));
    if (fly > 0) docIcon(lerp(900, 1640, fly), gy - Math.sin(fly * Math.PI) * 220, lerp(0.5, 0.95, fly), 'M', '#22c08b', { name: fly > 0.9 ? '第一章.md' : '', nameSize: 22 });
    else docIcon(1640, gy, 0.95, 'M', '#7c5cff', { broken: true, name: '第一章.md', nameSize: 22 });
    if (t >= S('G10_03')) fancy('只拿回这一个文件', 1290, 870, 62, t, P('G10_03', 0.55), FX.green);
  }
  if (t >= S('G10_04')) {
    const ga = eOut(prog(t, S('G10_04'), 0.3)); const danger = t >= S('G10_06');
    ctx.save(); ctx.globalAlpha = ga;
    const rv = popIn(t, P('G10_05', 0.15));
    seg(820, gy, lerp(1340, 1520, clamp(rv)), gy, 'rgba(255,255,255,0.7)', 1, 10);
    nx.forEach((x, i) => { ctx.save(); if (danger && i > 0) { ctx.globalAlpha *= lerp(1, 0.25, prog(t, P('G10_06', 0.5), 0.4)); } commitNode(x, gy, 0.75, hs[i], { col: cols[i] }); ctx.restore(); });
    if (rv > 0) {
      commitNode(1450, gy, 0.75 * rv, 'd4e5f6a', { col: '#a66bff' });
      ctx.save(); ctx.globalAlpha *= clamp(rv); ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 7; ctx.setLineDash([14, 10]);
      ctx.beginPath(); ctx.moveTo(1440, gy - 50); ctx.quadraticCurveTo(1350, gy - 200, 1270, gy - 55); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.moveTo(1262, gy - 48); ctx.lineTo(1290, gy - 72); ctx.lineTo(1250, gy - 82); ctx.fill();
      ctx.font = `40px ${F_FANCY}`; ctx.textAlign = 'center'; ctx.fillText('反向抵消', 1355, gy - 190); ctx.restore();
    }
    ctx.restore();
    if (t >= S('G10_05') && !danger) fancy('历史不删，新增一个反向存档', 1290, 870, 58, t, P('G10_05', 0.45), FX.yel);
    if (danger) {
      const xa = popIn(t, P('G10_06', 0.5));
      if (xa > 0) { ctx.save(); ctx.translate(1170, gy); ctx.scale(xa, xa); ctx.strokeStyle = '#ff2d55'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-130, -130); ctx.lineTo(130, 130); ctx.moveTo(130, -130); ctx.lineTo(-130, 130); ctx.stroke(); ctx.restore(); }
      if (t > P('G10_06', 0.6)) stamp(t, P('G10_06', 0.6), 1560, 560, '新手别乱用！', '#e02424', 64, -0.12);
      if (t > P('G10_06', 0.5)) { ctx.fillStyle = `rgba(255,0,40,${0.08 + 0.05 * Math.sin(t * 10)})`; ctx.fillRect(...OS); }
    }
  }
};
let _r2Term;
SFX_FNS.push(() => { sfx(P('G10_01', 0.75), 'ding', 0.4); sfx(P('G10_03', 0.05), 'swoosh_in', 0.5); sfx(P('G10_03', 0.6), 'sparkle', 0.4); sfx(P('G10_05', 0.15), 'pop', 0.5); sfx(P('G10_05', 0.45), 'rewind', 0.4); sfx(P('G10_06', 0.5), 'buzz', 0.6); sfx(P('G10_06', 0.6), 'stamp', 0.8); });

// ---- 平行世界①：开分支 ----
SC.branch = (t, blk, en) => {
  bgLecture(t, '#ff5c8a'); lecturer(t, blk, en, blk.t0);
  if (!_brTerm) _brTerm = cmdLines([
    { t: P('G11_03', 0.12), s: 'git branch idea', cmd: true, dur: 0.6 },
    { t: P('G11_04', 0.15), s: 'git switch idea', cmd: true, dur: 0.6 },
    { t: P('G11_04', 0.5), s: "{w}Switched to branch '{p}idea{w}'" },
    { t: S('G11_06'), clear: true },
    { t: P('G11_06', 0.3), s: 'git switch -c idea', cmd: true, dur: 0.7 },
    { t: P('G11_06', 0.65), s: '{d}# 等于 git branch idea + git switch idea' },
  ]);
  terminal(t, 700, 90, 1160, 200, _brTerm, { alpha: eOut(prog(t, blk.t0, 0.3)), fs: 34, accent: '#ff5c8a' });
  branchGraph(t, {
    base: prog(t, blk.t0 + 0.1, 0.5), nodeT: blk.t0 + 0.2, mainTagT: P('G11_02', 0.4),
    idea: prog(t, P('G11_03', 0.5), 0.6), ideaTagT: P('G11_03', 0.8),
    ideaT: [P('G11_05', 0.3), P('G11_05', 0.6)], ideaN: t > P('G11_05', 0.6) ? 2 : t > P('G11_05', 0.3) ? 1 : 0,
    headT: P('G11_02', 0.6), head: prog(t, P('G11_04', 0.55), 0.4),
  });
  if (t < S('G11_02')) fancy('分支 = 平行世界', 1290, 870, 70, t, P('G11_01', 0.45), FX.pink);
  else if (t >= S('G11_03') && t < S('G11_04')) fancy('复制出一条新路线', 1290, 870, 62, t, P('G11_03', 0.7), FX.pink);
  else if (t >= S('G11_05') && t < S('G11_06')) { fancy('主线完全不受影响', 1290, 870, 62, t, P('G11_05', 0.7), FX.green); }
  else if (t >= S('G11_06')) fancy('-c = 新建 + 切换', 1290, 870, 66, t, P('G11_06', 0.6), FX.yel);
};
let _brTerm;
SFX_FNS.push(() => { sfx(P('G11_01', 0.45), 'swoosh_in', 0.5); sfx(P('G11_02', 0.4), 'pop', 0.4); sfx(P('G11_03', 0.5), 'whoosh', 0.5); sfx(P('G11_03', 0.8), 'pop', 0.4); sfx(P('G11_04', 0.55), 'boing', 0.4); [0.3, 0.6].forEach(f => sfx(P('G11_05', f), 'pop', 0.5)); sfx(P('G11_06', 0.6), 'ding', 0.4); });

// ---- 平行世界②：合并（快进） ----
SC.merge = (t, blk, en) => {
  bgLecture(t, '#22c08b'); lecturer(t, blk, en, blk.t0);
  if (!_mgTerm) _mgTerm = cmdLines([
    { t: P('G12_01', 0.4), s: 'git switch main', cmd: true, dur: 0.6 },
    { t: P('G12_02', 0.12), s: 'git merge idea', cmd: true, dur: 0.6 },
    { t: P('G12_02', 0.5), s: '{g}Fast-forward' },
    { t: P('G12_04', 0.5), s: 'git branch -d idea', cmd: true, dur: 0.7 },
  ]);
  terminal(t, 700, 90, 1160, 200, _mgTerm, { alpha: eOut(prog(t, blk.t0, 0.3)), fs: 34, accent: '#22c08b' });
  const ffT = P('G12_02', 0.55);
  branchGraph(t, {
    base: 1, nodeT: -99, mainTagT: -99, idea: 1, ideaTagT: -99, ideaT: [-99, -99], ideaN: 2,
    headT: -99, head: 1 - prog(t, P('G12_01', 0.75), 0.4), ff: prog(t, ffT, 0.7), del: prog(t, P('G12_04', 0.8), 0.25),
  });
  if (t >= S('G12_03')) { sparkle(t, S('G12_03'), 1450, 640, 220, 14, '#7cf07a'); fancy('汇合成一条啦！', 1290, 870, 70, t, P('G12_03', 0.2), FX.green); }
  if (t > P('G12_04', 0.8)) sparkle(t, P('G12_04', 0.8), 1730, 640, 90, 8, '#ff9ec0');
};
let _mgTerm;
SFX_FNS.push(() => { sfx(P('G12_01', 0.75), 'boing', 0.4); sfx(P('G12_02', 0.55), 'whoosh', 0.5); sfx(S('G12_03'), 'sparkle', 0.6); sfx(P('G12_04', 0.8), 'pop', 0.5); });

// ---- 平行世界③：冲突 ----
SC.conflict = (t, blk, en) => {
  bgLecture(t, '#ff4d6d'); lecturer(t, blk, en, blk.t0);
  const ea = eOut(prog(t, blk.t0, 0.3));
  const x = 700, y = 90, w = 1160, h = 560;
  ctx.save(); ctx.globalAlpha = ea; win(x, y, w, h, '第一章.md — 合并冲突', '#ff4d6d');
  const L = [
    ['# 第一章 绪论', 'h'], ['<<<<<<< HEAD', 'm'], ['本文研究了大肥鱼的摸鱼速度。', 'a'], ['=======', 'm'], ['本文研究了大肥鱼的游泳速度。', 'b'], ['>>>>>>> idea', 'm'],
  ];
  const rm = eIO(prog(t, P('G13_04', 0.4), 0.5));
  let ly = y + 120; const lh = 72;
  ctx.font = `bold 38px ${F_CODE}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  L.forEach(([s, k], i) => {
    const gone = (k === 'm' || k === 'b') ? rm : 0; const hh = lh * (1 - gone);
    if (hh < 2) return;
    ctx.save(); ctx.globalAlpha *= 1 - gone; const cy = ly + hh / 2 - lh / 2 + 20;
    let hl = null;
    if (k === 'm' && t >= P('G13_02', 0.25) && t < S('G13_03')) hl = '#ffd36b';
    if (k === 'a' && t >= S('G13_03') && t < E('G13_04')) hl = '#3ec1ff';
    if (k === 'b' && t >= P('G13_03', 0.5) && t < S('G13_04') + 0.3) hl = '#ff5c8a';
    if (hl) { ctx.fillStyle = hexA(hl, 0.22 + 0.08 * Math.sin(t * 8)); rr(x + 24, cy - lh / 2 + 6, w - 48, lh - 12, 12); ctx.fill(); }
    ctx.fillStyle = k === 'm' ? '#ffd36b' : k === 'h' ? '#c9a6ff' : k === 'a' ? '#9fe3ff' : k === 'b' ? '#ffb0c8' : '#ece9f7';
    ctx.font = k === 'm' ? `bold 38px ${F_CODE}` : `bold 40px ${F_BODY}`; ctx.fillText(s, x + 50, cy);
    ctx.restore(); ly += hh;
  });
  ctx.restore();
  // 标注
  if (t >= S('G13_02') && t < S('G13_03')) { pill(1700, 300, '<<< === >>>', '#ffd36b', popIn(t, P('G13_02', 0.3)), { fs: 30 }); }
  if (t >= S('G13_03') && t < S('G13_04')) { pill(1700, 330, '主线 main', '#3ec1ff', popIn(t, S('G13_03')), { font: F_FANCY, fs: 34 }); pill(1700, 470, '分支 idea', '#ff5c8a', popIn(t, P('G13_03', 0.5)), { font: F_FANCY, fs: 34 }); }
  if (t >= S('G13_04') && t < S('G13_05')) fancy('选一个，删掉标记', 1290, 870, 62, t, P('G13_04', 0.3), FX.yel);
  if (t < S('G13_02')) {
    const fa = popIn(t, P('G13_01', 0.2)); if (fa > 0) { flash(t, P('G13_01', 0.2), 0.2, '255,60,90'); fancy('CONFLICT!', 1290, 860, 92, t, P('G13_01', 0.2), Object.assign({ wobble: 3, font: F_FANCY }, FX.red)); }
  }
  if (t >= S('G13_05')) {
    if (!_cfTerm) _cfTerm = cmdLines([{ t: P('G13_05', 0.05), s: 'git add 第一章.md', cmd: true, dur: 0.5 }, { t: P('G13_05', 0.22), s: 'git commit -m "解决冲突"', cmd: true, dur: 0.7 }]);
    terminal(t, 760, 560, 1040, 200, _cfTerm, { fs: 32, accent: '#22c08b', alpha: eOut(prog(t, S('G13_05'), 0.25)) });
    if (t > P('G13_05', 0.45)) stamp(t, P('G13_05', 0.45), 1640, 330, '✓ 已解决', '#22c08b', 64, -0.12);
    if (t > P('G13_05', 0.65)) fancy('冲突很正常，别怕！', 1290, 870, 62, t, P('G13_05', 0.65), FX.green);
  }
};
let _cfTerm;
SFX_FNS.push(() => { sfx(P('G13_01', 0.2), 'buzz', 0.6); sfx(P('G13_01', 0.2) + 0.02, 'impact', 0.6); sfx(P('G13_02', 0.3), 'pop', 0.4); sfx(S('G13_03'), 'pop', 0.4); sfx(P('G13_03', 0.5), 'pop', 0.4); sfx(P('G13_04', 0.4), 'whoosh', 0.4); sfx(P('G13_05', 0.45), 'stamp', 0.7); });

// ---- 复习：速查卡 ----
SC.recap2 = (t, blk, en) => {
  bgLecture(t, '#ffd23f'); lecturer(t, blk, en, blk.t0);
  const cards = [
    { x: 690, title: '读档', col: '#ff5c8a', rows: [['没存的改动', 'git restore 文件'], ['已进暂存区', 'git restore --staged 文件'], ['已经存过档', 'git restore --source=编号 文件'], ['', 'git revert 编号']], tt: ['G14_01', [0.15, 0.4, 0.62, 0.8]] },
    { x: 1290, title: '平行世界', col: '#22c08b', rows: [['开分支', 'git branch idea'], ['切过去', 'git switch idea'], ['合回来', 'git merge idea']], tt: ['G14_02', [0.3, 0.55, 0.8]] },
  ];
  cards.forEach((c, ci) => {
    const a = eBack(prog(t, blk.t0 + 0.1 + ci * 0.12, 0.35)); if (a <= 0) return;
    ctx.save(); ctx.translate(c.x + 280, 470); ctx.scale(a, a); ctx.translate(-c.x - 280, -470);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; rr(c.x + 12, 150, 560, 660, 30); ctx.fill();
    ctx.fillStyle = '#fffaf0'; rr(c.x, 136, 560, 660, 30); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = '#1b1433'; ctx.stroke();
    pill(c.x + 280, 136, c.title, c.col, 1, { font: F_FANCY, fs: 46 });
    c.rows.forEach((r, i) => {
      const p = eBack(prog(t, P(c.tt[0], c.tt[1][i]), 0.3)); if (p <= 0) return;
      const yy = 250 + i * (c.rows.length > 3 ? 132 : 170);
      ctx.save(); ctx.globalAlpha = clamp(p); ctx.translate((1 - p) * 40, 0);
      if (r[0]) { ctx.fillStyle = '#1b1433'; ctx.font = `bold 34px ${F_BODY}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(r[0], c.x + 40, yy); }
      ctx.font = `bold 30px ${F_CODE}`; const tw = ctx.measureText(r[1]).width;
      ctx.fillStyle = '#1b1433'; rr(c.x + 34, yy + 26, Math.min(500, tw + 30), 52, 12); ctx.fill();
      ctx.fillStyle = '#7cf07a'; ctx.fillText(r[1], c.x + 49, yy + 53, 470);
      ctx.restore();
    });
    ctx.restore();
  });
};
SFX_FNS.push(() => { [[ 'G14_01', [0.15, 0.4, 0.62, 0.8]], ['G14_02', [0.3, 0.55, 0.8]]].forEach(([id, fs]) => fs.forEach(f => sfx(P(id, f), 'pop', 0.4))); });

// ---- 实战：从零完整走一遍 ----
SC.practice = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  if (!_prTerm) _prTerm = cmdLines([
    { t: P('G16_02', 0.08), s: 'mkdir 论文 && cd 论文', cmd: true, dur: 0.5 },
    { t: P('G16_02', 0.38), s: 'git init', cmd: true, dur: 0.35 },
    { t: P('G16_02', 0.62), s: '{d}Initialized empty Git repository in D:/论文/.git/' },
    { t: P('G16_03', 0.28), s: 'git add .', cmd: true, dur: 0.35 },
    { t: P('G16_03', 0.45), s: 'git commit -m "完成第一章"', cmd: true, dur: 0.6 },
    { t: P('G16_03', 0.72), s: '{y}[main (root-commit) a1b2c3d]{w} 完成第一章' },
    { t: P('G16_04', 0.42), s: 'git switch -c idea', cmd: true, dur: 0.5 },
    { t: P('G16_04', 0.75), s: "{w}Switched to a new branch '{p}idea{w}'" },
    { t: P('G16_05', 0.3), s: 'git add .', cmd: true, dur: 0.3 },
    { t: P('G16_05', 0.45), s: 'git commit -m "尝试新写法"', cmd: true, dur: 0.6 },
    { t: P('G16_05', 0.8), s: '{y}[idea e5f6a7b]{w} 尝试新写法' },
    { t: P('G16_06', 0.08), s: 'git switch main', cmd: true, dur: 0.4 },
    { t: P('G16_06', 0.3), s: "{w}Switched to branch '{y}main{w}'" },
    { t: P('G16_06', 0.45), s: 'git merge idea', cmd: true, dur: 0.4 },
    { t: P('G16_06', 0.75), s: '{w}Updating a1b2c3d..e5f6a7b  {g}Fast-forward' },
    { t: P('G16_07', 0.2), s: 'git log --oneline --graph', cmd: true, dur: 0.6 },
    { t: P('G16_07', 0.55), s: '{r}* {y}e5f6a7b {c}(HEAD -> main, idea){w} 尝试新写法' },
    { t: P('G16_07', 0.62), s: '{r}* {y}a1b2c3d{w} 完成第一章' },
  ]);
  const steps = [['建仓库', 'G16_02'], ['存档', 'G16_03'], ['开分支', 'G16_04'], ['合并', 'G16_06'], ['看历史', 'G16_07']];
  const allDone = t >= S('G16_08');
  steps.forEach((st, i) => {
    const a = popIn(t, blk.t0 + 0.15 + i * 0.08); if (a <= 0) return;
    const x = 800 + i * 236, y = 92; const act = t >= S(st[1]) && (i === 4 || t < S(steps[i + 1][1])) && !allDone; const done = allDone || t >= (i < 4 ? S(steps[i + 1][1]) : 1e9);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1));
    ctx.fillStyle = act ? '#ff7a3d' : done ? '#22c08b' : '#2a2350'; rr(-104, -36, 208, 72, 22); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = `38px ${F_FANCY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText((done && !act ? '✓ ' : (i + 1) + ' ') + st[0], 0, 2);
    ctx.restore();
    if (i < 4) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.moveTo(x + 110, y - 10); ctx.lineTo(x + 124, y); ctx.lineTo(x + 110, y + 10); ctx.fill(); }
  });
  terminal(t, 690, 160, 1180, 690, _prTerm, { alpha: eOut(prog(t, blk.t0, 0.3)), fs: 30, accent: '#ff7a3d', title: '终端 — 实战' });
  if (t < S('G16_02')) fancy('实战开始！', 1280, 500, 110, t, P('G16_01', 0.3), Object.assign({ wobble: 3 }, FX.orange));
  if (allDone) { fancy('轮到你了！', 1280, 905, 64, t, P('G16_08', 0.5), FX.yel); }
};
let _prTerm;
SFX_FNS.push(() => { const b = BK.practice; [0, 1, 2, 3, 4].forEach(i => sfx(b.t0 + 0.15 + i * 0.08, 'pop', 0.3)); sfx(P('G16_01', 0.3), 'impact', 0.6); ['G16_02', 'G16_03', 'G16_04', 'G16_06', 'G16_07'].forEach(id => sfx(S(id), 'click', 0.5)); sfx(P('G16_03', 0.72), 'ding', 0.4); sfx(P('G16_06', 0.75), 'sparkle', 0.4); sfx(P('G16_07', 0.6), 'ding', 0.5); sfx(P('G16_08', 0.5), 'confetti', 0.4); });

// ---- 复习：循环 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, '#ffd23f'); lecturer(t, blk, en, blk.t0);
  const cx = 1290, cy = 450, R = 270;
  const nodes = [['✏️ 改文件', '#3ec1ff'], ['git status', '#ff5c8a'], ['git add', '#ffd23f'], ['git commit', '#ff7a3d']];
  const step = t < S('G08_02') ? -1 : Math.min(3, Math.floor(clamp((t - S('G08_02')) / D('G08_02')) * 4.2));
  const spin = t > S('G08_03') ? (t - S('G08_03')) * 2.2 : 0;
  // 圆环
  ctx.save(); ctx.globalAlpha = eOut(prog(t, blk.t0 + 0.2, 0.4)); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 14; ctx.setLineDash([30, 20]); ctx.lineDashOffset = -t * 60; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.restore();
  nodes.forEach((n, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 2 + spin * 0; const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    const ap = popIn(t, blk.t0 + 0.3 + i * 0.15); if (ap <= 0) return;
    const on = step === i || (spin > 0 && Math.floor(spin) % 4 === i);
    ctx.save(); ctx.translate(x, y); ctx.scale(ap * (on ? 1.15 : 1), ap * (on ? 1.15 : 1));
    if (on) { ctx.shadowColor = n[1]; ctx.shadowBlur = 40; }
    ctx.font = `bold 40px ${i ? F_CODE : F_BODY}`; const w = ctx.measureText(n[0]).width + 60;
    ctx.fillStyle = on ? n[1] : '#2a2350'; rr(-w / 2, -48, w, 96, 26); ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 6; ctx.strokeStyle = n[1]; ctx.stroke();
    ctx.fillStyle = on ? '#1b1433' : '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n[0], 0, 2);
    ctx.restore();
  });
  // 中心
  const ce = popIn(t, blk.t0 + 0.4); if (ce > 0) { commitNode(cx, cy, 1.1 * ce, null, { glow: spin > 0 ? 1 : 0, t }); }
  fancy('每天的存档循环', 1290, 860, 64, t, blk.t0 + 0.6, Object.assign({ out: S('G08_03') }, FX.white));
  if (t >= S('G08_03')) fancy('每天重复就好！', 1290, 860, 72, t, S('G08_03') + 0.2, Object.assign({ wobble: 3 }, FX.yel));
};
SFX_FNS.push(() => { const b = BK.recap; [0, 1, 2, 3].forEach(i => sfx(b.t0 + 0.3 + i * 0.15, 'pop', 0.4)); [0, 1, 2, 3].forEach(i => sfx(S('G08_02') + D('G08_02') * i / 4.2, 'ding', 0.35)); sfx(S('G08_03') + 0.2, 'swoosh_in', 0.5); });

// ---- 预告 + 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#7c5cff');
  const outro = E('G08_05') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G08_05;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260 + talkBob(t, en), 1160);
  const ot = prog(t, S('G08_05'), 0.3);
  if (ot < 1) {
  fancy('下集预告', 1260, 150, 92, t, st + 0.1, FX.white);
  fancy('电脑坏了怎么办？', 1260, 300, 90, t, P('G15_01', 0.25), FX.blue);
  const cp = popIn(t, P('G15_01', 0.55), 0.5);
  if (cp > 0) {
    ctx.save(); ctx.translate(1260, 580); ctx.scale(cp, cp); ctx.translate(0, Math.sin(t * 2) * 6);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#2a2140'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.arc(-90, 20, 80, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(0, -40, 110, Math.PI, 0); ctx.arc(100, 20, 80, Math.PI * 1.5, Math.PI * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3ec1ff'; ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(50, -10); ctx.lineTo(20, -10); ctx.lineTo(20, 60); ctx.lineTo(-20, 60); ctx.lineTo(-20, -10); ctx.lineTo(-50, -10); ctx.closePath(); ctx.fill();
    ctx.restore();
    fancy('GitHub 云存档', 1640, 470, 80, t, P('G15_01', 0.7), FX.pink);
  }
  const rp = prog(t, P('G15_01', 0.82), 0.4);
  if (rp > 0) { ctx.save(); ctx.globalAlpha = rp; ctx.font = `bold 64px ${F_CODE}`; ctx.fillStyle = '#7cf07a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$ git push', 1260, 790 + (1 - eOut(rp)) * 30); ctx.restore(); }
  }
  if (ot > 0) {
    ctx.fillStyle = `rgba(10,8,22,${0.78 * ot})`; ctx.fillRect(...OS);
    [['👍', '点赞', '#ff5c8a'], ['🪙', '投币', '#ffd23f'], ['⭐', '收藏', '#3ec1ff']].forEach((ic, i) => {
      const a = popIn(t, S('G08_05') + 0.4 + i * 0.32, 0.4); if (a <= 0) return;
      const x = W / 2 + (i - 1) * 330, y = 470;
      ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(t * 5 + i) * 0.06);
      ctx.fillStyle = ic[2]; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.font = `110px "Segoe UI Emoji","Noto Color Emoji",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic[0], 0, 8); ctx.restore();
      fancy(ic[1], x, y + 185, 60, t, S('G08_05') + 0.5 + i * 0.32, { c1: '#fff', c2: '#eee', stroke: ic[2] });
    });
    fancy('一键三连，下集见！', W / 2, 200, 96, t, S('G08_05') + 1.4, { stagger: 0.04 });
    if (t > outro) { const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_wink', 260, H + 330, 980, { scale: sa }); sprite('d_ok', 1680, H + 40, 560, { scale: sa }); } }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.8)'; ctx.fillRect(0, 975, W, 50); ctx.fillStyle = '#e4defa'; ctx.font = `24px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 1000);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G15_01', 0.55), 'pop', 0.6); sfx(P('G15_01', 0.82), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G08_05') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G08_05') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_sparkle', S('G06_02'), E('G06_02')], ['d_happy', P('G05_05', 0.4), E('G05_05')],
  ['d_shock', P('G09_02', 0.25), E('G09_02')], ['d_relief', P('G10_03', 0.4), E('G10_03')], ['d_cry', P('G10_06', 0.45), E('G10_06')],
  ['d_sparkle', S('G12_03'), E('G12_03')], ['d_relief', P('G13_05', 0.5), E('G13_05')],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));

// ================= 主渲染 =================
function drawFrame(t) {
  const blk = BLOCKS.find(b => t >= b.t0 && t < b.t1) || BLOCKS[BLOCKS.length - 1];
  const en = blk.entries.find(e => t >= e.t0 && t < e.t1);
  ctx.save();
  // 轻微推镜
  const k = clamp((t - blk.t0) / Math.max(1, blk.t1 - blk.t0));
  if (!blk.b.startsWith('card')) { const z = 1 + 0.025 * k; ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); }
  (SC[blk.b] || (() => { }))(t, blk, en);
  ctx.restore();
  // 块转场：斜切色带
  BLOCKS.forEach((b, i) => {
    if (i === 0) return; const p = prog(t, b.t0 - 0.16, 0.32); if (p <= 0 || p >= 1) return;
    const cols = ['#ffd23f', '#7c5cff', '#3ec1ff', '#ff5c8a', '#22c08b'];
    [0, 1].forEach(j => { const e = eIO(clamp(p * 1.15 - j * 0.12)); const x = lerp(-W * 0.9, W * 1.9, e); ctx.fillStyle = j ? '#ffffff' : cols[i % cols.length]; ctx.beginPath(); ctx.moveTo(x - 700, 0); ctx.lineTo(x + 300, 0); ctx.lineTo(x - 100, H); ctx.lineTo(x - 1100, H); ctx.fill(); });
  });
  CAMEOS.forEach(c => { if (t > c[1] - 0.1 && t < c[2] + 0.4) cameo(t, c[0], c[1], c[2]); });
  subtitle(t);
}
SFX_FNS.push(() => BLOCKS.forEach((b, i) => { if (i > 0 && !b.b.startsWith('card')) sfx(b.t0 - 0.12, 'whoosh', 0.45); }));
['install', 'init', 'status', 'commit', 'log', 'restore1', 'restore2', 'branch', 'merge', 'conflict', 'practice'].forEach(k => { const b = BK[k]; ctx.save(); try { SC[k](b.t1 - 0.01, b, b.entries[b.entries.length - 1]); } catch (e) { console.error(e); } ctx.restore(); });
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
