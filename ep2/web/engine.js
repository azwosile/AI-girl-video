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
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'g_cheer', 'g_warn', 'g_think', 'g_shock', 'g_proud', 'g_type', 'g_peace', 'g_awkward', 'g_present', 'd_panic', 'd_curious', 'd_happy', 'd_raise', 'd_think', 'd_shock', 'd_sparkle', 'd_ok', 'd_relief', 'd_laptop', 'd_twopc'];
// 竖版立绘只显示上半身：显示高度占整张图的比例（头顶到腰）
const SPRC = { d_panic: 0.55, d_curious: 0.55, d_happy: 0.55, d_sparkle: 0.6, d_ok: 0.66, d_raise: 0.72, d_think: 0.7, d_cry: 0.88, d_relief: 0.82, d_shock: 0.82, d_laptop: 0.62, d_twopc: 0.6 };
const loadImg = n => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });


// ================= 台词（由 subtitles.json 生成，改台词请改 _gen_script.py）=================
const TEXT = {
  D01: "完了完了！我的电脑泡水开不了机了！论文的存档全在里面！",
  G01_01: "先别哭！大肥鱼，上集教你的存档，其实都只存在你自己的电脑里。",
  G01_02: "电脑一坏，仓库就跟着一起没了。",
  G01_03: "所以我们需要云存档！就像游戏把进度同步到服务器，换台机器登录，存档还在。",
  G01_04: "Git 的云存档，最有名的就是 GitHub，也就是我的老家！",
  G01_05: "欢迎来到 AI娘 Git 课，第二集，把存档搬上云端！",
  D02: "云存档？那我要去哪里开一个呀？",
  G02_01: "打开 GitHub 官网，用邮箱注册一个账号。",
  G02_02: "登录以后，点右上角的加号，选择新建仓库。",
  G02_03: "起个名字，比如 thesis，再选公开还是私有。论文嘛，选私有就好。",
  G02_04: "注意，下面那个添加 README 的选项，先别勾！",
  G02_05: "你电脑里已经有存档了，云端保持空仓库，第一次上传最省事。",
  G02_06: "点击创建，云端的空仓库就准备好啦！",
  D03: "空仓库有了，我电脑里的存档要怎么连上去呢？",
  G03_01: "复制仓库页面上的地址，回到终端。",
  G03_02: "输入 git remote add origin，后面粘贴刚才的地址。",
  G03_03: "origin 就是给云端仓库起的小名，以后就不用每次都敲一长串网址了。",
  G03_04: "再用 git remote -v 检查一下，能看到地址，就说明连上了。",
  D04: "连上了！那要怎么把存档传上去呀？",
  G04_01: "用 git push！push 就是推，把本地的存档推到云端。",
  G04_02: "第一次要写完整：git push -u origin main。",
  G04_03: "意思是把 main 这条线推到 origin，-u 会记住它们的对应关系。",
  G04_04: "记住以后，下次只要敲 git push 就行了。",
  G04_05: "第一次推送会弹出登录窗口，在浏览器里点一下授权就好。",
  G04_06: "注意，GitHub 早就不能直接输密码了，要用浏览器授权或者令牌。",
  G04_07: "要是终端卡着不动，看看登录窗口是不是藏在别的窗口后面！",
  G04_08: "刷新网页，你的文件和每一个存档，都在云上啦！",
  D05: "传上去以后，在网页上能干什么呀？",
  G05_01: "能干的可多了！点开提交记录，每一个存档都排得整整齐齐。",
  G05_02: "点进任何一个存档，红色是删掉的，绿色是新加的，和 git diff 一样清楚。",
  G05_03: "文件不小心删了？在网页上翻到旧存档，直接就能把它找回来。",
  G05_04: "就算电脑当场爆炸，只要推上去了，你的论文就一个字都不会丢！",
  D06: "那要是换了一台新电脑呢？",
  G06_01: "在新电脑上，输入 git clone，再加上仓库地址。",
  G06_02: "clone 就是克隆，会把整个仓库，连同所有的历史存档，一起下载下来。",
  G06_03: "而且它已经自动连好了 origin，不用再 remote add。",
  G06_04: "进到文件夹就能接着写，读档、开分支，都和原来一模一样。",
  D07: "可我宿舍电脑和实验室电脑都在改，怎么让它们保持一样呢？",
  G07_01: "这就要用 git pull，把云端的新存档拉下来。",
  G07_02: "pull 其实是两步：先 fetch 下载，再 merge 合并进你当前的分支。",
  G07_03: "用 git status 也能看出来：ahead 表示你比云端多存了档，behind 表示你落后了。",
  G07_04: "所以要养成习惯：开工先 pull，收工再 push！",
  D08: "那我上集开的平行世界，也能传上去吗？",
  G08_01: "当然可以！切到 idea 分支，git push -u origin idea。",
  G08_02: "云端就多了一条 idea 分支，网页上可以随时切换着看。",
  G08_03: "另一台电脑 git pull 以后，用 git switch idea，就能切过去接着写。",
  G08_04: "写完合并回 main，别忘了把 main 也 push 上去。",
  D09: "那我要是忘了 pull，直接 push 会怎么样？",
  G09_01: "GitHub 会拒绝你，提示 rejected。",
  G09_02: "因为云端有你本地没有的存档，直接推上去，就会把它们盖掉。",
  G09_03: "别慌，先 git pull，把云端的存档合进来。",
  G09_04: "要是两边改了同一行，就会出现冲突，处理方法和上集一模一样。",
  G09_05: "合好以后再 git push，就成功啦！",
  G09_06: "网上有人教你加 --force 强制推送，那会抹掉云端的存档，新手千万别用！",
  D10: "那是不是什么文件都能往上传呀？",
  G10_01: "私有仓库只有你自己能看，但有两样东西，无论如何都别推上去。",
  G10_02: "第一是密码和密钥，一旦推上去，就很难彻底删干净。",
  G10_03: "第二是超大的文件，GitHub 单个文件超过一百兆，会直接拒收。",
  G10_04: "怎么让 Git 自动忽略它们？我们下集讲 .gitignore 的时候细说！",
  D11: "好像有点多，能帮我总结一下吗？",
  G11_01: "云存档，就四个命令！",
  G11_02: "remote add 连上云端，push 推上去，clone 搬到新电脑，pull 拉下来。",
  G11_03: "再记一句口诀：开工先 pull，收工再 push！",
  D12: "能不能带我从头到尾，完整走一遍呀？",
  G12_01: "没问题！我们模拟两台电脑，完整实战一遍！",
  G12_02: "宿舍电脑：先在 GitHub 新建空仓库，再 git remote add origin。",
  G12_03: "git push -u origin main，存档上云！",
  G12_04: "到了实验室：git clone 下载仓库，写完第二章，add、commit，再 push。",
  G12_05: "回到宿舍：git pull，第二章就同步过来了！",
  G12_06: "最后 git log --oneline，main 和 origin/main 指着同一个存档，两边完全一致。",
  G12_07: "两台电脑，一份存档，再也不怕电脑坏啦！",
  G13_01: "下集预告：一个人用云存档已经会了，那和同学一起写呢？下集我们讲联机模式，多人协作！",
  G13_02: "喜欢的话记得一键三连，我们下集见！",
};
const DUR = Object.assign({}, window.DUR || {});

// ================= 时间轴 =================
const V = (b, id, pose) => ({ k: 'v', b, id, pose });
const BEAT = (b, d) => ({ k: 'beat', b, d: b === 'teaser' ? d * 0.75 : d * 0.35 });
const CH_COL = ['#7c5cff', '#3ec1ff', '#22c08b', '#ffb020', '#ff5c8a', '#ff7a3d', '#a66bff', '#ffd23f'];
const PLAN = [
  V('cold', 'D01', 'd_laptop'),
  V('why', 'G01_01', 'g_explain'), V('why', 'G01_02', 'g_warn'), V('why', 'G01_03', 'g_cheer'), V('why', 'G01_04', 'g_proud'),
  V('title', 'G01_05', 'g_cheer'), BEAT('title', 1.4),
  V('ask1', 'D02', 'd_curious'),
  V('newrepo', 'G02_01', 'g_present'), V('newrepo', 'G02_02', 'g_point'), V('newrepo', 'G02_03', 'g_explain'), V('newrepo', 'G02_04', 'g_warn'), V('newrepo', 'G02_05', 'g_think'), V('newrepo', 'G02_06', 'g_cheer'),
  V('ask2', 'D03', 'd_think'),
  V('remote', 'G03_01', 'g_point'), V('remote', 'G03_02', 'g_type'), BEAT('remote', 0.8), V('remote', 'G03_03', 'g_explain'), V('remote', 'G03_04', 'g_type'),
  V('ask3', 'D04', 'd_sparkle'),
  V('push', 'G04_01', 'g_point'), V('push', 'G04_02', 'g_type'), BEAT('push', 1.0), V('push', 'G04_03', 'g_explain'), V('push', 'G04_04', 'g_wink'),
  V('push', 'G04_05', 'g_explain'), V('push', 'G04_06', 'g_warn'), V('push', 'G04_07', 'g_awkward'), V('push', 'G04_08', 'g_peace'),
  V('ask4', 'D05', 'd_curious'),
  V('web', 'G05_01', 'g_present'), V('web', 'G05_02', 'g_explain'), V('web', 'G05_03', 'g_point'), V('web', 'G05_04', 'g_proud'),
  V('ask5', 'D06', 'd_raise'),
  V('clone', 'G06_01', 'g_type'), V('clone', 'G06_02', 'g_explain'), V('clone', 'G06_03', 'g_point'), V('clone', 'G06_04', 'g_wink'),
  V('ask6', 'D07', 'd_twopc'),
  V('pull', 'G07_01', 'g_point'), V('pull', 'G07_02', 'g_think'), V('pull', 'G07_03', 'g_explain'), V('pull', 'G07_04', 'g_cheer'),
  V('ask7', 'D08', 'd_sparkle'),
  V('branchpush', 'G08_01', 'g_type'), V('branchpush', 'G08_02', 'g_present'), V('branchpush', 'G08_03', 'g_explain'), V('branchpush', 'G08_04', 'g_wink'),
  V('ask8', 'D09', 'd_panic'),
  V('rejected', 'G09_01', 'g_shock'), V('rejected', 'G09_02', 'g_explain'), V('rejected', 'G09_03', 'g_point'), V('rejected', 'G09_04', 'g_think'), V('rejected', 'G09_05', 'g_peace'), V('rejected', 'G09_06', 'g_warn'),
  V('ask9', 'D10', 'd_raise'),
  V('nopush', 'G10_01', 'g_explain'), V('nopush', 'G10_02', 'g_warn'), V('nopush', 'G10_03', 'g_shock'), V('nopush', 'G10_04', 'g_wink'),
  V('ask10', 'D11', 'd_think'),
  V('recap', 'G11_01', 'g_cheer'), V('recap', 'G11_02', 'g_present'), V('recap', 'G11_03', 'g_peace'),
  V('askP', 'D12', 'd_ok'),
  V('practice', 'G12_01', 'g_cheer'), V('practice', 'G12_02', 'g_type'), V('practice', 'G12_03', 'g_point'), V('practice', 'G12_04', 'g_type'),
  V('practice', 'G12_05', 'g_explain'), V('practice', 'G12_06', 'g_point'), V('practice', 'G12_07', 'g_proud'),
  V('teaser', 'G13_01', 'g_explain'), V('teaser', 'G13_02', 'g_cheer'), BEAT('teaser', 8),
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
const REPO_URL = 'https://github.com/dafeiyu/thesis.git';
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
// ---- 冷开场：电脑泡水 ----
SC.cold = (t, blk) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.05, 16, 0.4); ctx.translate(sx, sy);
  bgBurst(t, '#ff4d6d', '#ff8fa3', W * 0.62, H * 0.55, 22, 0.35);
  for (let i = 0; i < 30; i++) { const st = t0 + rnd(i) * 3.6; const dt = t - st; if (dt < 0) continue; const x = 40 + rnd(i + 11) * (W - 80), y = -60 + dt * (900 + rnd(i + 5) * 500); if (y > H + 80) continue; ctx.fillStyle = 'rgba(140,210,255,0.85)'; ctx.beginPath(); ctx.ellipse(x, y, 9, 15, 0, 0, 7); ctx.fill(); }
  const lp = eBack(prog(t, t0 + 0.2, 0.45));
  laptop(1450, 640, 1.25 * lp, { dead: true, t });
  for (let i = 0; i < 10; i++) {
    const st = P('D01', 0.62) + i * 0.05, dt = t - st; if (dt < 0 || dt > 1.8) continue;
    const a = -Math.PI * (0.15 + rnd(i + 30) * 0.7); const x = 1450 + Math.cos(a) * dt * 650, y = 420 + Math.sin(a) * dt * 650 + 600 * dt * dt;
    ctx.save(); ctx.globalAlpha = clamp(1.6 - dt); commitNode(x, y, 0.45, null, { col: CH_COL[i % 8] }); ctx.restore();
  }
  const p = spring(prog(t, t0, 0.9));
  sprite('d_laptop', 640, H + 40, 960, { scale: lerp(1.4, 1, p) });
  fancy('完了完了！', 470, 170, 140, t, U.D01.vo + 0.1, { rot: -0.12, wobble: 6, c1: '#fff36b', c2: '#ffb000', stroke: '#8a0a2a' });
  fancy('存档全在里面！', 1450, 860, 84, t, P('D01', 0.62), Object.assign({ rot: -0.05, wobble: 3 }, FX.white, { stroke: '#8a0a2a' }));
};
SFX_FNS.push(() => { const b = BK.cold; sfx(b.t0 + 0.05, 'boom', 0.9); sfx(b.t0 + 0.25, 'glitch', 0.6); sfx(P('D01', 0.62), 'crack', 0.8); for (let k = 0; k < 4; k++) sfx(P('D01', 0.62) + 0.1 + k * 0.12, 'pop', 0.25); });

// ---- 为什么要云存档 ----
SC.why = (t, blk, en) => {
  bgLecture(t, '#3ec1ff'); lecturer(t, blk, en, blk.t0);
  const sw = S('G01_03') - 0.15;
  if (t < sw + 0.3) { // 本地电脑
    const a = ph(t, blk.t0, sw, 0.35, 0.3);
    const boom = P('G01_02', 0.25), dead = t >= boom;
    let [sx, sy] = shake(t, boom, 22, 0.45);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(sx, sy);
    laptop(1270, 600, 1.5, { dead, t, label: '你的电脑', screen: () => { txt('📦 仓库', 0, -55, 34, '#ffd23f', { align: 'center' }); chainRow(0, 30, 4, { s: 0.36, gap: 70, pop: i => popIn(t, S('G01_01') + 0.6 + i * 0.12) }); } });
    if (dead) for (let i = 0; i < 4; i++) { const dt = t - boom; if (dt > 1.5) break; const ang = -Math.PI * (0.2 + i * 0.2); commitNode(1270 + Math.cos(ang) * dt * 700, 400 + Math.sin(ang) * dt * 500 + 700 * dt * dt, 0.5, null, { col: CH_COL[(i + 2) % 8] }); }
    ctx.restore();
    if (t < S('G01_02')) fancy('存档只在本地', 1270, 830, 66, t, P('G01_01', 0.55), Object.assign({ out: S('G01_02') - 0.1 }, FX.white));
    if (dead && t < sw) { stamp(t, boom + 0.15, 1300, 350, '仓库也没了！', '#ff3b5c', 72, -0.12); flash(t, boom, 0.25, '255,200,150'); }
  }
  if (t >= sw) { // 云存档
    const a = eOut(prog(t, sw, 0.35));
    const n = t < P('G01_03', 0.45) ? 0 : 3;
    ctx.save(); ctx.globalAlpha = a;
    cloud(1280, 300, 1.0, { t, label: t >= S('G01_04') ? 'GitHub' : '云端', n, pop: i => popIn(t, P('G01_03', 0.42) + i * 0.08), glow: t >= S('G01_04') ? 0.6 + 0.3 * Math.sin(t * 5) : 0 });
    laptop(930, 780, 0.7, { label: '电脑 A', screen: () => chainRow(0, 0, 3, { s: 0.4, gap: 80 }) });
    const n2 = t < P('G01_03', 0.85) ? 0 : 3;
    laptop(1630, 780, 0.7, { label: '电脑 B', lcol: '#7cf07a', screen: () => n2 ? chainRow(0, 0, 3, { s: 0.4, gap: 80, pop: i => popIn(t, P('G01_03', 0.82) + i * 0.06) }) : txt('登录…', 0, 0, 34, '#8f8aa8', { align: 'center' }) });
    arrow(1000, 600, 1130, 440, '#7cf07a', eOut(prog(t, P('G01_03', 0.12), 0.3)), 14);
    arrow(1430, 440, 1560, 600, '#6bd3ff', eOut(prog(t, P('G01_03', 0.62), 0.3)), 14);
    for (let i = 0; i < 3; i++) flyNode(t, P('G01_03', 0.2) + i * 0.1, 0.5, 930, 680, 1240 + (i - 1) * 50, 340, CH_COL[(i + 2) % 8], 0.38);
    for (let i = 0; i < 3; i++) flyNode(t, P('G01_03', 0.66) + i * 0.08, 0.45, 1280, 340, 1630, 680, CH_COL[(i + 2) % 8], 0.38);
    // 游戏风同步条
    if (t < S('G01_04')) {
      const sp = clamp((t - P('G01_03', 0.15)) / (D('G01_03') * 0.35)); const ba = ph(t, P('G01_03', 0.15), S('G01_04') - 0.2);
      if (ba > 0) { ctx.save(); ctx.globalAlpha *= ba; box(1080, 640, 400, 64, 32, 'rgba(20,14,40,0.9)', '#fff', 4); box(1092, 652, 376 * sp, 40, 20, '#7cf07a'); txt(sp < 1 ? `云存档同步中 ${Math.floor(sp * 100)}%` : '✓ 同步完成 100%', 1280, 673, 30, '#fff', { align: 'center' }); ctx.restore(); }
    }
    ctx.restore();
    if (t < S('G01_04')) fancy('云存档！', 1280, 110, 90, t, S('G01_03') + 0.15, Object.assign({ out: S('G01_04') - 0.15, wobble: 3 }, FX.blue));
    if (t >= S('G01_04')) {
      fancy('GitHub = 我的老家', 1280, 110, 84, t, P('G01_04', 0.5), FX.yel);
      sparkle(t, P('G01_04', 0.5), 1280, 300, 260, 14);
    }
  }
};
SFX_FNS.push(() => {
  for (let i = 0; i < 4; i++) sfx(S('G01_01') + 0.6 + i * 0.12, 'pop', 0.3);
  sfx(P('G01_02', 0.25), 'boom', 0.9); sfx(P('G01_02', 0.25) + 0.15, 'stamp', 0.7);
  sfx(S('G01_03') - 0.15, 'swoosh_in', 0.5); sfx(P('G01_03', 0.2), 'whoosh', 0.5); sfx(P('G01_03', 0.5), 'ding', 0.5); sfx(P('G01_03', 0.66), 'whoosh', 0.5); sfx(P('G01_03', 0.85), 'coin', 0.5);
  sfx(P('G01_04', 0.5), 'sparkle', 0.6);
});

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#1f6fb3', '#2f86d6', W * 0.6, H * 0.45, 28, 0.2);
  sprite('g_cheer', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 250, 1180);
  sprite('d_happy', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 640);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 420); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-330, 0, 95, '#ffd23f', '第2集', { fs: 52, rot: -0.15 });
    fancy('把存档', 60, -60, 110, t, -99, FX.yel);
    fancy('搬上云端！', 150, 80, 150, t, -99, FX.blue);
    ctx.restore();
    speedLines(t, 1060, 420, 1 - prog(t, t0 + 1.0, 0.6));
  }
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); });

// ---- 大肥鱼提问 ----
const ASK = {
  ask1: { q: '去哪开云存档？', col: '#d7f3ff', dot: '#b5e6ff' }, ask2: { q: '怎么连上去？', col: '#d9fbe9', dot: '#b6f0d2' },
  ask3: { q: '怎么传上去？', col: '#fff1cc', dot: '#ffe29a' }, ask4: { q: '网页上能干啥？', col: '#ffe0ea', dot: '#ffc2d4' },
  ask5: { q: '换了新电脑？', col: '#ffe6d6', dot: '#ffcaa8' }, ask6: { q: '两台电脑怎么同步？', col: '#eadfff', dot: '#d6c4ff' },
  ask7: { q: '分支也能传吗？', col: '#d9fbe9', dot: '#b6f0d2' }, ask8: { q: '忘了 pull 会怎样？', col: '#ffe0e0', dot: '#ffbcbc' },
  ask9: { q: '什么都能传吗？', col: '#fff1cc', dot: '#ffe29a' }, ask10: { q: '帮我总结一下！', col: '#d7f3ff', dot: '#b5e6ff' },
  askP: { q: '完整走一遍！', col: '#ffe6d6', dot: '#ffcaa8' },
};
const CHAP = {
  ask1: ['云存档', '新建云仓库', '#3ec1ff'], ask2: ['云存档', '连接云端', '#3ec1ff'], ask3: ['云存档', '推送 push', '#3ec1ff'], ask4: ['云存档', '网页上看存档', '#3ec1ff'],
  ask5: ['同步', '换电脑 clone', '#22c08b'], ask6: ['同步', '拉取 pull', '#22c08b'], ask7: ['同步', '分支上云', '#22c08b'],
  ask8: ['避坑', 'push 被拒绝', '#ff5c8a'], ask9: ['避坑', '不能上传的东西', '#ff5c8a'], ask10: ['复习', '四个命令', '#ff7a3d'], askP: ['实战', '两台电脑走一遍', '#ff7a3d'],
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

// ---- 新建云仓库 ----
SC.newrepo = (t, blk, en) => {
  bgLecture(t, '#3ec1ff'); lecturer(t, blk, en, blk.t0);
  const a = eOut(prog(t, blk.t0, 0.35));
  const BX = 680, BY = 100, BW = 1200, BH = 790;
  const stage = t < S('G02_02') - 0.1 ? 0 : t < S('G02_03') - 0.1 ? 1 : t < E('G02_06') - D('G02_06') * 0.45 ? 2 : 3;
  const url = ['github.com/signup', 'github.com', 'github.com/new', 'github.com/dafeiyu/thesis'][stage];
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 60);
  const cy = browser(BX, BY, BW, BH, url, { user: stage > 0 });
  const cx = BX + 80;
  let cur = null, click = 0;
  const ck = (tt) => { const q = (t - tt) / 0.35; if (q > 0 && q < 1) click = q; };
  if (stage === 0) {
    txt('注册 GitHub 账号', cx, cy + 80, 50, '#24292f');
    const em = 'dfy@example.com', n = Math.floor(clamp((t - P('G02_01', 0.45)) / 0.8) * em.length);
    inputBox(cx, cy + 190, 640, '邮箱', em.slice(0, n), { focus: n < em.length && t > P('G02_01', 0.4), t, code: true });
    inputBox(cx, cy + 320, 640, '密码', t > P('G02_01', 0.7) ? '••••••••••' : '', {});
    ghButton(cx, cy + 420, 640, 66, '创建账号 Create account', '#1f883d', { press: t > P('G02_01', 0.88) && t < P('G02_01', 0.88) + 0.15 });
    cur = [lerp(1500, cx + 320, eIO(prog(t, P('G02_01', 0.75), 0.3))), lerp(800, cy + 455, eIO(prog(t, P('G02_01', 0.75), 0.3)))]; ck(P('G02_01', 0.88));
    if (t > P('G02_01', 0.9)) stamp(t, P('G02_01', 0.9), cx + 860, cy + 300, '✓ 注册成功', '#22c08b', 50, -0.1);
  } else if (stage === 1) {
    txt('🏠 首页', cx, cy + 70, 40, '#24292f');
    for (let i = 0; i < 3; i++) box(cx, cy + 130 + i * 90, 700, 60, 12, '#f6f8fa', '#d0d7de', 2);
    const plusX = BX + BW - 140, plusY = BY + 162;
    const openT = P('G02_02', 0.45);
    box(plusX - 34, plusY - 22, 68, 44, 10, t > openT ? '#57606a' : '#3d444d', '#8c959f', 2); txt('+ ▾', plusX, plusY, 26, '#fff', { align: 'center' });
    const mp = popIn(t, openT, 0.25);
    if (mp > 0) {
      ctx.save(); ctx.translate(plusX + 20, plusY + 30); ctx.scale(mp, mp);
      box(-330, 0, 340, 170, 12, '#fff', '#d0d7de', 2);
      const hi = t > P('G02_02', 0.62);
      box(-322, 12, 324, 64, 8, hi ? '#ddf4ff' : '#fff'); txt('📕 新建仓库 New repository', -306, 44, 24, hi ? '#0969da' : '#24292f');
      txt('📥 导入仓库 Import', -306, 120, 24, '#24292f');
      ctx.restore();
      if (hi) stamp(t, P('G02_02', 0.62), plusX - 520, plusY + 230, '点这里！', '#ff5c8a', 44, -0.08);
    }
    const tgt1 = [plusX, plusY], tgt2 = [plusX - 160, plusY + 74];
    const m1 = eIO(prog(t, S('G02_02') + 0.1, D('G02_02') * 0.35)), m2 = eIO(prog(t, P('G02_02', 0.55), 0.25));
    cur = [lerp(lerp(1200, tgt1[0], m1), tgt2[0], m2) + 6, lerp(lerp(700, tgt1[1], m1), tgt2[1], m2) + 6]; ck(openT); ck(P('G02_02', 0.85));
  } else if (stage === 2) {
    txt('新建仓库 Create a new repository', cx, cy + 60, 40, '#24292f');
    const nm = 'thesis', n = Math.floor(clamp((t - P('G02_03', 0.18)) / 0.5) * nm.length);
    inputBox(cx, cy + 150, 520, '仓库名 Repository name', nm.slice(0, n), { focus: t < S('G02_03') + D('G02_03') * 0.5, t, code: true });
    if (n >= nm.length) txt('✓', cx + 540, cy + 180, 40, '#1f883d');
    const priv = t > P('G02_03', 0.78);
    radio(cx + 20, cy + 268, !priv, '公开 Public', '所有人可见');
    radio(cx + 20, cy + 358, priv, '私有 Private', '只有你自己能看');
    if (priv) { ctx.save(); ctx.globalAlpha *= ph(t, P('G02_03', 0.78), S('G02_04')); box(cx - 14, cy + 324, 560, 84, 14, null, '#ffd23f', 6); ctx.restore(); }
    const rmHi = t >= S('G02_04') - 0.1 && t < S('G02_05') + 0.5;
    if (rmHi) { ctx.save(); const pp = 0.5 + 0.5 * Math.sin(t * 8); box(cx - 14, cy + 430, 620, 70, 14, `rgba(255,59,92,${0.08 + 0.1 * pp})`, '#ff3b5c', 5); ctx.restore(); }
    checkbox(cx + 20, cy + 465, false, '添加 README 文件 Add a README');
    if (t >= S('G02_04')) bigX(cx + 20, cy + 465, 30, '#ff3b5c', prog(t, P('G02_04', 0.45), 0.3));
    if (t >= S('G02_04') && t < S('G02_05')) stamp(t, P('G02_04', 0.55), cx + 780, cy + 450, '别勾！', '#ff3b5c', 70, -0.12);
    const createT = P('G02_06', 0.22);
    ghButton(cx, cy + 540, 380, 66, '创建仓库 Create', '#1f883d', { press: t > createT && t < createT + 0.15, glow: t > S('G02_06') - 0.1 ? 0.6 + 0.4 * Math.sin(t * 8) : 0 });
    if (t >= S('G02_06') - 0.2) { const m = eIO(prog(t, S('G02_06') - 0.2, 0.4)); cur = [lerp(1500, cx + 190, m), lerp(860, cy + 575, m)]; ck(createT); }
    else if (t < P('G02_03', 0.85)) { const m = eIO(prog(t, P('G02_03', 0.6), 0.25)); cur = [lerp(cx + 560, cx + 20, m), lerp(cy + 200, cy + 358, m)]; ck(P('G02_03', 0.78)); }
  } else {
    const ap = eOut(prog(t, P('G02_06', 0.55) - 0.1, 0.3));
    ctx.save(); ctx.globalAlpha *= ap;
    txt('📕 dafeiyu / thesis', cx, cy + 60, 44, '#24292f'); pill(cx + 470, cy + 60, 'Private', '#ffffff', 1, { fs: 24 });
    box(cx, cy + 130, 1040, 300, 14, '#f6f8fa', '#d0d7de', 2);
    txt('快速设置 Quick setup', cx + 30, cy + 180, 32, '#24292f');
    txt('这个仓库还是空的 —— 等你把存档推上来', cx + 30, cy + 240, 28, '#6b6488', { bold: false });
    box(cx + 30, cy + 290, 980, 60, 10, '#fff', '#d0d7de', 2); txt(REPO_URL, cx + 50, cy + 321, 28, '#24292f', { font: F_CODE, bold: false });
    ctx.restore();
    stamp(t, P('G02_06', 0.6), cx + 820, cy + 560, '✓ 空仓库准备好啦', '#22c08b', 50, -0.08);
  }
  if (cur) cursor(cur[0], cur[1], 1.1, click);
  ctx.restore();
  if (stage === 2 && t >= S('G02_05') && t < S('G02_06')) {
    const sa = popIn(t, S('G02_05') + 0.1);
    ctx.save(); ctx.translate(1580, 640); ctx.scale(sa, sa);
    box(-260, -150, 520, 300, 26, 'rgba(20,14,40,0.94)', '#ffd23f', 6);
    laptop(-130, 70, 0.42, { screen: () => chainRow(0, 0, 3, { s: 0.45, gap: 90 }) });
    arrow(-40, -10, 50, -10, '#ffd23f', 1, 10);
    cloud(150, -10, 0.38, { t, n: 0 });
    txt('本地有存档', -130, -115, 28, '#fff', { align: 'center' }); txt('云端保持空', 150, -115, 28, '#fff', { align: 'center' });
    ctx.restore();
    fancy('第一次上传最省事', 1280, 860, 56, t, P('G02_05', 0.55), Object.assign({ out: S('G02_06') - 0.1 }, FX.yel));
  }
};
SFX_FNS.push(() => {
  sfx(P('G02_01', 0.45), 'type', 0.3); sfx(P('G02_01', 0.88), 'click', 0.7); sfx(P('G02_01', 0.9), 'ding', 0.5);
  sfx(P('G02_02', 0.45), 'click', 0.7); sfx(P('G02_02', 0.62), 'stamp', 0.4); sfx(P('G02_02', 0.85), 'click', 0.7);
  typeSfx(P('G02_03', 0.18), 6, 0.5); sfx(P('G02_03', 0.78), 'click', 0.6);
  sfx(P('G02_04', 0.45), 'buzz', 0.5); sfx(P('G02_04', 0.55), 'stamp', 0.8); sfx(S('G02_05') + 0.1, 'pop', 0.5);
  sfx(P('G02_06', 0.22), 'click', 0.7); sfx(P('G02_06', 0.6), 'stamp', 0.7); sfx(P('G02_06', 0.62), 'sparkle', 0.4);
});

// ---- 连接云端：remote ----
let _rmTerm;
SC.remote = (t, blk, en) => {
  bgLecture(t, '#22c08b'); lecturer(t, blk, en, blk.t0);
  if (t < S('G03_02')) { // 复制地址
    const a = ph(t, blk.t0, S('G03_02') - 0.25, 0.35);
    ctx.save(); ctx.globalAlpha = a;
    const cy = browser(680, 120, 1200, 640, 'github.com/dafeiyu/thesis');
    txt('快速设置 Quick setup', 740, cy + 70, 36, '#24292f');
    const hi = t > P('G03_01', 0.15);
    box(740, cy + 140, 1080, 72, 12, hi ? '#fff8c5' : '#fff', hi ? '#d4a72c' : '#d0d7de', hi ? 4 : 2);
    txt(REPO_URL, 764, cy + 177, 30, '#24292f', { font: F_CODE, bold: false });
    const cpT = P('G03_01', 0.35);
    box(1730, cy + 150, 76, 52, 10, t > cpT ? '#ddf4ff' : '#f6f8fa', '#d0d7de', 2); txt('📋', 1768, cy + 177, 28, '#000', { align: 'center', font: '"Segoe UI Emoji","Noto Color Emoji",sans-serif', bold: false });
    if (t > cpT) pill(1700, cy + 270, '✓ 已复制', '#7cf07a', popIn(t, cpT), { font: F_BODY, fs: 30 });
    const m = eIO(prog(t, S('G03_01') + 0.05, cpT - S('G03_01') - 0.05));
    let click = 0; const q = (t - cpT) / 0.35; if (q > 0 && q < 1) click = q;
    cursor(lerp(1400, 1772, m), lerp(720, cy + 182, m), 1.1, click);
    ctx.restore();
    fancy('回到终端', 1280, 860, 64, t, P('G03_01', 0.65), Object.assign({ out: S('G03_02') - 0.2 }, FX.green));
  }
  if (t >= S('G03_02') - 0.25) {
    _rmTerm = _rmTerm || cmdLines([
      { t: P('G03_02', 0.2), s: 'git remote add origin ' + REPO_URL, cmd: true, dur: 1.3 },
      { t: S('G03_04') + 0.6, s: 'git remote -v', cmd: true, dur: 0.5 },
      { t: S('G03_04') + 1.3, s: '{p}origin{w}  ' + REPO_URL + ' {d}(fetch)' },
      { t: S('G03_04') + 1.45, s: '{p}origin{w}  ' + REPO_URL + ' {d}(push)' },
    ]);
    const a = eOut(prog(t, S('G03_02') - 0.25, 0.35));
    terminal(t, 680, 120, 1200, 470, _rmTerm, { alpha: a, scale: lerp(0.9, 1, a), fs: 29, accent: '#22c08b', title: '终端 — 论文' });
    // 网址缩成 origin
    if (t >= S('G03_03') - 0.3) {
      const ia = eOut(prog(t, S('G03_03') - 0.3, 0.3));
      const m = eIO(prog(t, P('G03_03', 0.12), 0.6));
      ctx.save(); ctx.globalAlpha = ia;
      cloud(1640, 770, 0.6, { t, label: 'GitHub' });
      laptop(940, 860, 0.5, { label: null, screen: () => chainRow(0, 0, 3, { s: 0.45, gap: 90 }) });
      arrow(1060, 760, 1470, 760, '#c9a6ff', 1, 8, { dash: [18, 14], t });
      if (m < 1) { ctx.save(); ctx.globalAlpha *= 1 - m; note(1260, 690, lerp(1, 0.4, m), REPO_URL, '#c9a6ff', { fs: 28 }); ctx.restore(); }
      pill(1260, 700, 'origin', '#c9a6ff', popIn(t, P('G03_03', 0.55)), { fs: 44 });
      ctx.restore();
      if (t < S('G03_04')) fancy('origin = 云端仓库的小名', 1280, 625, 48, t, P('G03_03', 0.4), Object.assign({ out: S('G03_04') - 0.1 }, FX.white));
    }
    if (t >= S('G03_04') + 1.5) stamp(t, S('G03_04') + 1.6, 1640, 520, '✓ 连上了', '#22c08b', 56, -0.1);
  }
};
SFX_FNS.push(() => { sfx(P('G03_01', 0.15), 'pop', 0.3); sfx(P('G03_01', 0.35), 'click', 0.7); sfx(P('G03_01', 0.37), 'ding', 0.4); sfx(S('G03_02') - 0.25, 'whoosh', 0.4); sfx(S('G03_03') - 0.3, 'pop', 0.4); sfx(P('G03_03', 0.12), 'rewind', 0.4); sfx(P('G03_03', 0.55), 'pop', 0.6); sfx(S('G03_04') + 1.3, 'ding', 0.4); sfx(S('G03_04') + 1.6, 'stamp', 0.7); });

// ---- 推送 push ----
let _puTerm;
SC.push = (t, blk, en) => {
  bgLecture(t, '#ffb020'); lecturer(t, blk, en, blk.t0);
  // G04_01：推的示意
  if (t < S('G04_02')) {
    const a = ph(t, blk.t0, S('G04_02') - 0.25, 0.35);
    ctx.save(); ctx.globalAlpha = a;
    laptop(960, 640, 0.9, { label: '本地', screen: () => chainRow(0, 0, 3, { s: 0.42, gap: 85 }) });
    const got = t > P('G04_01', 0.72);
    cloud(1600, 360, 0.9, { t, label: 'origin', n: got ? 3 : 0, pop: i => popIn(t, P('G04_01', 0.62) + i * 0.08) });
    arrow(1080, 470, 1430, 400, '#ffb020', eOut(prog(t, P('G04_01', 0.3), 0.3)), 18);
    for (let i = 0; i < 3; i++) flyNode(t, P('G04_01', 0.36) + i * 0.08, 0.5, 960, 500, 1560 + (i - 1) * 56, 400, CH_COL[(i + 2) % 8], 0.4, 120);
    ctx.restore();
    fancy('push = 推', 1280, 160, 96, t, P('G04_01', 0.28), Object.assign({ out: S('G04_02') - 0.15, wobble: 3 }, FX.orange));
  }
  // 终端：G04_02 – G04_04
  if (t >= S('G04_02') - 0.25 && t < S('G04_05')) {
    _puTerm = _puTerm || cmdLines([
      { t: P('G04_02', 0.45), s: 'git push -u origin main', cmd: true, dur: 0.9 },
      { t: E('G04_02') + 0.1, s: '{d}Enumerating objects: 12, done.' },
      { t: E('G04_02') + 0.3, s: '{d}Writing objects: {g}100% (12/12){d}, 2.31 KiB, done.' },
      { t: E('G04_02') + 0.5, s: '{w}To ' + REPO_URL },
      { t: E('G04_02') + 0.65, s: '{g} * [new branch]{w}      main -> main' },
      { t: E('G04_02') + 0.8, s: "{d}branch 'main' set up to track '{p}origin/main{d}'." },
      { t: P('G04_04', 0.5), s: 'git push', cmd: true, dur: 0.4 },
      { t: P('G04_04', 0.5) + 0.6, s: '{g}Everything up-to-date' },
    ]);
    const a = ph(t, S('G04_02') - 0.25, S('G04_05') - 0.25, 0.35);
    terminal(t, 680, 110, 1200, 520, _puTerm, { alpha: a, scale: lerp(0.9, 1, a), fs: 30, accent: '#ffb020', title: '终端 — 论文' });
    // 命令拆解
    const da = ph(t, P('G04_02', 0.5), S('G04_04') - 0.1);
    if (da > 0) {
      ctx.save(); ctx.globalAlpha *= a * da;
      const parts = [['-u', '记住对应关系', '#ff5c8a'], ['origin', '推到哪', '#c9a6ff'], ['main', '推哪条线', '#ffd23f']];
      parts.forEach((p, i) => { const s = popIn(t, P('G04_02', 0.6) + i * 0.15); pill(900 + i * 380, 700, p[0], p[2], s, { fs: 40 }); if (s > 0) txt(p[1], 900 + i * 380, 775, 32, '#fff', { align: 'center' }); });
      ctx.restore();
    }
    if (t >= S('G04_03') - 0.1) { // -u 记住对应
      const la = ph(t, S('G04_03') + D('G04_03') * 0.45, S('G04_04') + D('G04_04') * 0.4);
      if (la > 0) {
        ctx.save(); ctx.globalAlpha *= la; box(820, 830, 920, 90, 24, 'rgba(20,14,40,0.92)', '#ff5c8a', 5);
        pill(1010, 875, 'main', '#ffd23f', 1, { fs: 34 }); pill(1550, 875, 'origin/main', '#c9a6ff', 1, { fs: 34 });
        ctx.strokeStyle = '#ff5c8a'; ctx.lineWidth = 8; ctx.setLineDash([16, 10]); ctx.lineDashOffset = -t * 50; ctx.beginPath(); ctx.moveTo(1090, 875); ctx.lineTo(1430, 875); ctx.stroke(); ctx.setLineDash([]);
        txt('🔗', 1260, 873, 40, '#000', { align: 'center', font: '"Segoe UI Emoji","Noto Color Emoji",sans-serif', bold: false });
        ctx.restore();
      }
    }
    if (t >= S('G04_04')) fancy('下次只要 git push', 1280, 760, 70, t, P('G04_04', 0.3), Object.assign({ out: S('G04_05') - 0.2 }, FX.yel));
  }
  // 授权弹窗 G04_05 – G04_07
  if (t >= S('G04_05') - 0.25 && t < S('G04_08')) {
    const a = ph(t, S('G04_05') - 0.25, S('G04_08') - 0.25);
    ctx.save(); ctx.globalAlpha = a;
    const hide = t >= S('G04_07') - 0.1; // 弹窗躲在别的窗口后面
    const slide = eOut(prog(t, P('G04_07', 0.55), 0.45));
    const dx = hide ? lerp(170, 0, slide) : 0, dy = hide ? lerp(90, 0, slide) : 0;
    const drawDlg = () => {
      ctx.save(); ctx.translate(dx, dy);
      win(860, 160, 840, 560, 'Git Credential Manager', '#7c5cff', { bg: '#ffffff', bar: '#ece8f8' });
      ctx.fillStyle = '#24292f'; ctx.beginPath(); ctx.arc(1280, 300, 52, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(1280, 310, 26, 0, 7); ctx.fill();
      txt('连接到 GitHub', 1280, 400, 44, '#24292f', { align: 'center' });
      const bT = P('G04_05', 0.55);
      ghButton(1000, 460, 560, 74, '🌐 用浏览器登录 Sign in with your browser', '#1f883d', { fs: 26, press: t > bT && t < bT + 0.15 });
      ghButton(1000, 560, 560, 64, '🔑 用令牌登录 Token', '#f6f8fa', { fs: 26, fg: '#24292f', border: '#d0d7de' });
      if (!hide) { const m = eIO(prog(t, S('G04_05') + 0.2, bT - S('G04_05') - 0.2)); let ck = 0; const q = (t - bT) / 0.35; if (q > 0 && q < 1) ck = q; cursor(lerp(1600, 1300, m), lerp(800, 500, m), 1.1, ck); }
      if (t > P('G04_05', 0.7) && t < S('G04_06') + 0.2) stamp(t, P('G04_05', 0.72), 1560, 300, '✓ 授权成功', '#22c08b', 46, -0.12);
      ctx.restore();
    };
    if (!hide) drawDlg();
    else {
      drawDlg();
      if (slide < 1) { // 盖在上面的其他窗口
        ctx.save(); ctx.globalAlpha *= 1 - slide;
        win(720, 140, 900, 660, '课程表.xlsx', '#22c08b', { bg: '#f4fff8', bar: '#dff5e8' });
        for (let r = 0; r < 8; r++) for (let c = 0; c < 5; c++) box(760 + c * 168, 230 + r * 66, 160, 58, 4, '#fff', '#cfe8d8', 2);
        ctx.restore();
        note(1400, 860, popIn(t, P('G04_07', 0.15)), '终端卡住了…？', '#ff5c8a', { fs: 34 });
      } else fancy('原来躲在后面！', 1280, 860, 62, t, P('G04_07', 0.85), FX.pink);
    }
    // 三连印章
    if (t >= S('G04_06') && t < S('G04_07')) {
      ctx.fillStyle = 'rgba(20,14,40,0.55)'; ctx.fillRect(660, 100, 1240, 820);
      stamp(t, P('G04_06', 0.25), 1000, 380, '密码 ✗', '#ff3b5c', 72, -0.12);
      stamp(t, P('G04_06', 0.6), 1500, 420, '浏览器授权 ✓', '#22c08b', 64, 0.06);
      stamp(t, P('G04_06', 0.82), 1240, 640, '令牌 ✓', '#22c08b', 64, -0.05);
    }
    ctx.restore();
  }
  // G04_08：刷新网页
  if (t >= S('G04_08') - 0.25) {
    const a = eOut(prog(t, S('G04_08') - 0.25, 0.35));
    ctx.save(); ctx.globalAlpha = a;
    const rl = prog(t, S('G04_08'), 0.5);
    const cy = browser(680, 110, 1200, 720, 'github.com/dafeiyu/thesis', { reload: rl });
    txt('📕 dafeiyu / thesis', 740, cy + 50, 40, '#24292f');
    if (rl >= 1) repoFiles(740, cy + 100, 1080, ['第一章.md', '第二章.md', '图表.png', '参考文献.bib'], t, S('G04_08') + 0.5, { commits: 3 });
    ctx.restore();
    if (rl >= 1) { confetti(t, S('G04_08') + 0.6, 80, 5, 1280, 500); fancy('存档上云啦！', 1280, 880, 70, t, P('G04_08', 0.55), FX.yel); }
  }
};
SFX_FNS.push(() => {
  sfx(P('G04_01', 0.3), 'whoosh', 0.6); sfx(P('G04_01', 0.65), 'ding', 0.5); sfx(S('G04_02') - 0.25, 'swoosh_in', 0.4);
  sfx(E('G04_02') + 0.65, 'ding', 0.4); [0.6, 0.75, 0.9].forEach(f => sfx(P('G04_02', f), 'pop', 0.4)); sfx(P('G04_04', 0.5) + 0.6, 'ding', 0.3);
  sfx(S('G04_05') - 0.2, 'pop', 0.6); sfx(P('G04_05', 0.55), 'click', 0.7); sfx(P('G04_05', 0.72), 'stamp', 0.6);
  sfx(P('G04_06', 0.25), 'buzz', 0.5); sfx(P('G04_06', 0.6), 'stamp', 0.6); sfx(P('G04_06', 0.82), 'stamp', 0.6);
  sfx(P('G04_07', 0.15), 'pop', 0.4); sfx(P('G04_07', 0.55), 'swoosh_in', 0.5);
  sfx(S('G04_08'), 'rewind', 0.3); sfx(S('G04_08') + 0.6, 'confetti', 0.5);
});

// ---- 网页上看存档 ----
SC.web = (t, blk, en) => {
  bgLecture(t, '#ff5c8a'); lecturer(t, blk, en, blk.t0);
  if (t < S('G05_04') - 0.1) {
    const a = ph(t, blk.t0, S('G05_04') - 0.3, 0.35);
    const stage = t < S('G05_02') - 0.1 ? 0 : t < S('G05_03') - 0.1 ? 1 : 2;
    ctx.save(); ctx.globalAlpha = a;
    const cy = browser(680, 110, 1200, 780, ['github.com/dafeiyu/thesis/commits', 'github.com/dafeiyu/thesis/commit/b7c8d9e', 'github.com/dafeiyu/thesis/tree/a1b2c3d'][stage]);
    if (stage === 0) {
      txt('🕒 提交记录 Commits', 740, cy + 55, 38, '#24292f');
      const rows = [['e5f6a7b', '合并 idea：新写法'], ['b7c8d9e', '修改参考文献'], ['c3d4e5f', '加了图表'], ['a1b2c3d', '完成第一章']];
      rows.forEach((r, i) => {
        const s = popIn(t, P('G05_01', 0.35) + i * 0.14); if (s <= 0) return;
        const y = cy + 110 + i * 120; ctx.save(); ctx.translate(0, (1 - clamp(s)) * 30); ctx.globalAlpha *= clamp(s);
        box(740, y, 1080, 100, 12, '#fff', '#d0d7de', 2);
        ctx.fillStyle = CH_COL[(i + 2) % 8]; ctx.beginPath(); ctx.arc(784, y + 50, 18, 0, 7); ctx.fill();
        txt(r[1], 820, y + 36, 32, '#24292f'); txt('dafeiyu 提交于 ' + ['刚刚', '昨天', '3 天前', '上周'][i], 820, y + 74, 22, '#6b6488', { bold: false });
        box(1650, y + 28, 140, 44, 8, '#f6f8fa', '#d0d7de', 2); txt(r[0], 1720, y + 51, 24, '#0969da', { font: F_CODE, align: 'center' });
        ctx.restore();
      });
    } else if (stage === 1) {
      txt('修改参考文献', 740, cy + 50, 38, '#24292f'); txt('b7c8d9e', 1820, cy + 50, 26, '#0969da', { font: F_CODE, align: 'right' });
      box(740, cy + 100, 1080, 56, [12, 12, 0, 0], '#f6f8fa', '#d0d7de', 2); txt('参考文献.bib', 764, cy + 128, 28, '#24292f', { font: F_CODE });
      const L = [[' ', '@article{wang2023,'], ['-', '  year = {2022},'], ['+', '  year = {2023},'], [' ', '  title = {大模型综述},'], ['-', '  pages = {1--10}'], ['+', '  pages = {1--12},'], ['+', '  doi = {10.1234/abc}'], [' ', '}']];
      L.forEach((l, i) => {
        const s = prog(t, P('G05_02', 0.2) + i * 0.06, 0.2); if (s <= 0) return;
        const y = cy + 156 + i * 56; ctx.save(); ctx.globalAlpha *= s;
        box(740, y, 1080, 56, 0, l[0] === '-' ? '#ffebe9' : l[0] === '+' ? '#dafbe1' : '#fff', '#eaeef2', 1);
        txt(l[0], 764, y + 28, 30, l[0] === '-' ? '#cf222e' : '#1a7f37', { font: F_CODE }); txt(l[1], 804, y + 28, 30, '#24292f', { font: F_CODE, bold: false });
        ctx.restore();
      });
      if (t > P('G05_02', 0.3)) note(1640, cy + 400, popIn(t, P('G05_02', 0.3)), '🔴 删掉的', '#cf222e', { fs: 30 });
      if (t > P('G05_02', 0.5)) note(1640, cy + 500, popIn(t, P('G05_02', 0.5)), '🟢 新加的', '#1a7f37', { fs: 30 });
    } else {
      txt('📁 浏览旧存档  a1b2c3d', 740, cy + 50, 36, '#24292f');
      const rows = ['第一章.md', '第二章.md', '图表.png'];
      rows.forEach((r, i) => { const y = cy + 110 + i * 80; const hi = i === 1 && t > P('G05_03', 0.4); box(740, y, 1080, 70, 8, hi ? '#fff8c5' : '#fff', hi ? '#d4a72c' : '#d0d7de', hi ? 4 : 2); txt('📄 ' + r, 770, y + 36, 30, '#0969da', { bold: false }); });
      const bT = P('G05_03', 0.62);
      ghButton(1500, cy + 380, 300, 64, '⬇ 下载 Raw', '#1f883d', { press: t > bT && t < bT + 0.15 });
      const m = eIO(prog(t, P('G05_03', 0.3), 0.4)); let ck = 0; const q = (t - bT) / 0.35; if (q > 0 && q < 1) ck = q;
      cursor(lerp(1200, 1650, m), lerp(cy + 600, cy + 412, m), 1.1, ck);
      if (t > bT) { const fp = eOut(prog(t, bT + 0.1, 0.6)); docIcon(lerp(1650, 1000, fp), lerp(cy + 400, cy + 530, fp) - Math.sin(fp * Math.PI) * 120, 1.0, 'M', '#2f6fe0', { name: '第二章.md' }); }
      if (t > bT + 0.6) stamp(t, bT + 0.7, 1320, cy + 560, '找回来了！', '#22c08b', 56, -0.08);
      note(1080, cy + 410, popIn(t, P('G05_03', 0.05)), '😱 本地不小心删了第二章', '#ff5c8a', { fs: 30 });
    }
    ctx.restore();
  }
  if (t >= S('G05_04') - 0.25) {
    const boom = P('G05_04', 0.18), dead = t >= boom;
    let [sx, sy] = shake(t, boom, 18, 0.4);
    ctx.save(); ctx.translate(sx, sy); ctx.globalAlpha = eOut(prog(t, S('G05_04') - 0.25, 0.3));
    laptop(960, 700, 0.95, { dead, t, label: '电脑', screen: () => chainRow(0, 0, 4, { s: 0.36, gap: 70 }) });
    cloud(1590, 380, 1.0, { t, label: 'GitHub', n: 4, glow: 0.7 });
    shield(1590, 380, popIn(t, boom + 0.25) * 0.0, t);
    ctx.restore();
    if (dead) { flash(t, boom, 0.25, '255,200,150'); fancy('一个字都不会丢！', 1280, 880, 76, t, P('G05_04', 0.55), FX.yel); sparkle(t, boom + 0.3, 1590, 380, 250, 12, '#8fdcff'); }
  }
};
SFX_FNS.push(() => {
  for (let i = 0; i < 4; i++) sfx(P('G05_01', 0.35) + i * 0.14, 'pop', 0.35);
  sfx(S('G05_02') - 0.1, 'click', 0.5); sfx(P('G05_02', 0.3), 'pop', 0.4); sfx(P('G05_02', 0.5), 'pop', 0.4);
  sfx(S('G05_03') - 0.1, 'click', 0.5); sfx(P('G05_03', 0.62), 'click', 0.7); sfx(P('G05_03', 0.62) + 0.7, 'stamp', 0.6);
  sfx(P('G05_04', 0.18), 'boom', 0.8); sfx(P('G05_04', 0.18) + 0.3, 'sparkle', 0.6);
});

// ---- 换电脑：clone ----
let _clTerm;
SC.clone = (t, blk, en) => {
  bgLecture(t, '#22c08b'); lecturer(t, blk, en, blk.t0);
  _clTerm = _clTerm || cmdLines([
    { t: P('G06_01', 0.3), s: 'git clone ' + REPO_URL, cmd: true, dur: 1.1 },
    { t: E('G06_01') + 0.05, s: "{w}Cloning into '{y}thesis{w}'..." },
    { t: E('G06_01') + 0.3, s: '{d}remote: Enumerating objects: 12, done.' },
    { t: P('G06_02', 0.35), s: '{d}Receiving objects: {g}100% (12/12){d}, done.' },
    { t: P('G06_04', 0.1), s: 'cd thesis', cmd: true, dur: 0.4 },
    { t: P('G06_04', 0.3), s: 'git log --oneline', cmd: true, dur: 0.6 },
    { t: P('G06_04', 0.5), s: '{y}e5f6a7b {c}(HEAD -> main, origin/main){w} 合并 idea' },
    { t: P('G06_04', 0.55), s: '{y}b7c8d9e{w} 修改参考文献' },
    { t: P('G06_04', 0.6), s: '{y}a1b2c3d{w} 完成第一章' },
  ]);
  const a = eOut(prog(t, blk.t0, 0.35));
  terminal(t, 680, 100, 1200, 450, _clTerm, { alpha: a, fs: 28, accent: '#22c08b', title: '终端 — 新电脑' });
  const da = eOut(prog(t, S('G06_01') + 0.4, 0.4));
  ctx.save(); ctx.globalAlpha = da;
  const n = t < P('G06_02', 0.3) ? 0 : 4;
  cloud(970, 710, 0.7, { t, label: 'GitHub', n: 4 });
  laptop(1600, 820, 0.62, { label: '新电脑', lcol: '#7cf07a', tag: 'origin', tcol: '#c9a6ff', tagS: popIn(t, P('G06_03', 0.25)), screen: () => n ? chainRow(0, 0, 4, { s: 0.4, gap: 76, pop: i => popIn(t, P('G06_02', 0.3) + i * 0.1) }) : txt('📂 空', 0, 0, 34, '#8f8aa8', { align: 'center' }) });
  arrow(1150, 690, 1440, 690, '#7cf07a', eOut(prog(t, P('G06_02', 0.05), 0.3)), 14);
  for (let i = 0; i < 4; i++) flyNode(t, P('G06_02', 0.1) + i * 0.09, 0.45, 970 + (i - 1.5) * 40, 730, 1600, 720, CH_COL[(i + 2) % 8], 0.36, 70);
  if (t > P('G06_03', 0.25)) arrow(1520, 600, 1130, 650, '#c9a6ff', eOut(prog(t, P('G06_03', 0.3), 0.4)), 7, { dash: [14, 10], t });
  ctx.restore();
  if (t >= S('G06_02') && t < S('G06_03')) fancy('clone = 克隆', 1280, 610, 78, t, P('G06_02', 0.05), Object.assign({ out: S('G06_03') - 0.1 }, FX.green));
  if (t >= S('G06_02') + 0.2 && t < S('G06_03')) note(1280, 880, popIn(t, P('G06_02', 0.6)), '连同所有历史存档', '#7cf07a', { fs: 30 });
  if (t >= S('G06_03') && t < S('G06_04')) stamp(t, P('G06_03', 0.55), 1290, 610, '不用再 remote add', '#7c5cff', 46, -0.06);
  if (t >= S('G06_04')) fancy('接着写！', 1300, 640, 80, t, P('G06_04', 0.7), FX.yel);
};
SFX_FNS.push(() => { sfx(S('G06_01') + 0.4, 'pop', 0.4); sfx(P('G06_02', 0.05), 'whoosh', 0.5); for (let i = 0; i < 4; i++) sfx(P('G06_02', 0.3) + i * 0.1, 'pop', 0.3); sfx(P('G06_03', 0.25), 'pop', 0.5); sfx(P('G06_03', 0.55), 'stamp', 0.6); sfx(P('G06_04', 0.5), 'ding', 0.4); });

// ---- 两台电脑同步：pull ----
SC.pull = (t, blk, en) => {
  bgLecture(t, '#a66bff'); lecturer(t, blk, en, blk.t0);
  const a = eOut(prog(t, blk.t0, 0.35));
  const labNew = P('G07_01', 0.05), upT = P('G07_01', 0.18), downT = P('G07_01', 0.55);
  const cN = 3 + (t > upT + 0.45 ? 1 : 0), dN = 3 + (t > downT + 0.45 ? 1 : 0), lN = 3 + (t > labNew ? 1 : 0);
  const CX = 1280, CY = 250, DX = 930, LX = 1630, PY = 690;
  ctx.save(); ctx.globalAlpha = a;
  const st = t >= S('G07_03') && t < S('G07_04');
  cloud(CX, CY, 0.85, { t, label: 'GitHub', n: cN, hi: cN === 4 ? 3 : null });
  laptop(DX, PY, 0.68, { label: '宿舍', screen: () => chainRow(0, 0, st ? 5 : dN, { s: 0.34, gap: 62, hi: dN === 4 && t < S('G07_02') ? 3 : null, pop: i => i === 4 ? popIn(t, P('G07_03', 0.1)) : 1 }), hl: t > downT && t < S('G07_02') ? '#7cf07a' : null });
  laptop(LX, PY, 0.68, { label: '实验室', lcol: '#7cf07a', screen: () => chainRow(0, 0, st ? 3 : lN, { s: 0.34, gap: 62, pop: i => i === 3 ? popIn(t, labNew) : 1 }) });
  if (t < S('G07_02')) {
    arrow(LX - 40, PY - 220, CX + 140, CY + 110, '#ffb020', eOut(prog(t, upT, 0.3)), 12);
    flyNode(t, upT, 0.5, LX, PY - 140, CX + 60, CY + 30, CH_COL[5], 0.36);
    if (t > upT) note(LX + 60, PY - 330, popIn(t, upT), 'push', '#ffb020', { fs: 32 });
    arrow(CX - 140, CY + 110, DX + 40, PY - 220, '#7cf07a', eOut(prog(t, downT, 0.3)), 12);
    flyNode(t, downT, 0.5, CX - 60, CY + 30, DX, PY - 140, CH_COL[5], 0.36);
    if (t > downT) note(DX - 60, PY - 330, popIn(t, downT), 'git pull', '#7cf07a', { fs: 32 });
  }
  ctx.restore();
  // G07_02：pull = fetch + merge
  if (t >= S('G07_02') - 0.1 && t < S('G07_03')) {
    const fa = ph(t, S('G07_02') - 0.1, S('G07_03') - 0.2);
    ctx.save(); ctx.globalAlpha = fa; box(700, 800, 1160, 120, 30, 'rgba(20,14,40,0.94)', '#fff', 5);
    pill(820, 860, 'pull', '#7cf07a', popIn(t, S('G07_02')), { fs: 44 }); txt('=', 920, 860, 56, '#fff', { align: 'center' });
    pill(1100, 860, 'fetch ⬇下载', '#6bd3ff', popIn(t, P('G07_02', 0.3)), { fs: 38, font: F_BODY }); txt('+', 1290, 860, 56, '#fff', { align: 'center' });
    pill(1530, 860, 'merge 🔀合并', '#ffd23f', popIn(t, P('G07_02', 0.62)), { fs: 38, font: F_BODY });
    ctx.restore();
  }
  // G07_03：ahead / behind
  if (st) {
    note(DX, PY + 150, popIn(t, P('G07_03', 0.3)), '↑ ahead 1：比云端多', '#7cf07a', { fs: 30 });
    note(LX, PY + 150, popIn(t, P('G07_03', 0.68)), '↓ behind 2：落后了', '#ff5c8a', { fs: 30 });
  }
  if (t >= S('G07_04')) {
    ctx.fillStyle = `rgba(20,14,40,${0.55 * eOut(prog(t, S('G07_04'), 0.3))})`; ctx.fillRect(660, 80, 1260, 880);
    fancy('☀ 开工先 pull', 1280, 380, 100, t, P('G07_04', 0.35), Object.assign({ wobble: 2 }, FX.green));
    fancy('🌙 收工再 push', 1280, 600, 100, t, P('G07_04', 0.62), Object.assign({ wobble: 2 }, FX.orange));
  }
};
SFX_FNS.push(() => { sfx(P('G07_01', 0.05), 'pop', 0.5); sfx(P('G07_01', 0.18), 'whoosh', 0.5); sfx(P('G07_01', 0.55), 'whoosh', 0.5); sfx(P('G07_01', 0.55) + 0.5, 'ding', 0.4); sfx(S('G07_02'), 'pop', 0.5); sfx(P('G07_02', 0.3), 'pop', 0.5); sfx(P('G07_02', 0.62), 'pop', 0.5); sfx(P('G07_03', 0.3), 'pop', 0.5); sfx(P('G07_03', 0.68), 'pop', 0.5); sfx(P('G07_04', 0.35), 'impact', 0.6); sfx(P('G07_04', 0.62), 'impact', 0.6); });

// ---- 分支上云 ----
let _bpTerm, _bpTerm2;
function cloudBranches(x, y, s, t, ideaP, merged) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cloud(0, 0, 1.25, { t, label: 'GitHub', n: -1 });
  seg(-170, 40, 170, 40, '#ffd23f', 1, 10);
  [-130, -50, 30].forEach((cx, i) => commitNode(cx, 40, 0.28, null, { col: CH_COL[(i + 2) % 8] }));
  if (ideaP > 0) { seg(30, 40, 110, -10, '#ff5c8a', eOut(clamp(ideaP * 1.5)), 10); if (ideaP > 0.5) { commitNode(110, -10, 0.28, null, { col: '#ff5c8a' }); pill(190, -14, 'idea', '#ff5c8a', clamp((ideaP - 0.5) * 3), { fs: 22 }); } }
  if (merged > 0) { seg(110, -10, 170, 40, '#ff5c8a', merged, 10); if (merged >= 1) commitNode(170, 40, 0.32, null, { col: '#a66bff' }); }
  pill(merged >= 1 ? 230 : 200, 80, 'main', '#ffd23f', 1, { fs: 22 });
  ctx.restore();
}
SC.branchpush = (t, blk, en) => {
  bgLecture(t, '#22c08b'); lecturer(t, blk, en, blk.t0);
  if (t < S('G08_03')) {
    _bpTerm = _bpTerm || cmdLines([
      { t: P('G08_01', 0.25), s: 'git switch idea', cmd: true, dur: 0.5 },
      { t: P('G08_01', 0.38), s: "{w}Switched to branch '{p}idea{w}'" },
      { t: P('G08_01', 0.5), s: 'git push -u origin idea', cmd: true, dur: 0.8 },
      { t: E('G08_01') + 0.1, s: '{g} * [new branch]{w}      idea -> idea' },
    ]);
    const a = ph(t, blk.t0, S('G08_03') - 0.25, 0.35);
    terminal(t, 680, 100, 1200, 400, _bpTerm, { alpha: a, fs: 30, accent: '#22c08b', title: '终端 — 宿舍' });
    ctx.save(); ctx.globalAlpha = a;
    cloudBranches(1280, 730, 1.0, t, prog(t, E('G08_01') - 0.1, 0.6), 0);
    ctx.restore();
    if (t >= S('G08_02')) { // 网页分支切换
      const dp = popIn(t, P('G08_02', 0.35));
      if (dp > 0) {
        ctx.save(); ctx.translate(1700, 600); ctx.scale(dp, dp);
        box(-130, -40, 260, 64, 12, '#f6f8fa', '#d0d7de', 2); const sel = Math.floor((t - P('G08_02', 0.55)) / 0.6) % 2 === 0 || t < P('G08_02', 0.55);
        txt('🌿 ' + (sel ? 'main' : 'idea') + ' ▾', 0, -7, 28, '#24292f', { align: 'center', font: F_CODE });
        if (t > P('G08_02', 0.5)) { box(-130, 30, 260, 120, 12, '#fff', '#d0d7de', 2); txt((sel ? '✓ ' : '   ') + 'main', -100, 60, 26, '#24292f', { font: F_CODE }); txt((!sel ? '✓ ' : '   ') + 'idea', -100, 118, 26, '#ff5c8a', { font: F_CODE }); }
        ctx.restore();
      }
      fancy('分支也能上云', 1280, 880, 54, t, P('G08_02', 0.2), Object.assign({ out: S('G08_03') - 0.1 }, FX.green));
    }
  } else {
    _bpTerm2 = _bpTerm2 || cmdLines([
      { t: P('G08_03', 0.2), s: 'git pull', cmd: true, dur: 0.4 },
      { t: P('G08_03', 0.32), s: '{g} * [new branch]{w}      idea -> {p}origin/idea' },
      { t: P('G08_03', 0.5), s: 'git switch idea', cmd: true, dur: 0.5 },
      { t: P('G08_03', 0.68), s: "{w}branch '{p}idea{w}' set up to track '{p}origin/idea{w}'." },
      { t: P('G08_04', 0.15), s: 'git switch main', cmd: true, dur: 0.4 },
      { t: P('G08_04', 0.3), s: 'git merge idea', cmd: true, dur: 0.4 },
      { t: P('G08_04', 0.6), s: 'git push', cmd: true, dur: 0.3 },
      { t: P('G08_04', 0.72), s: '{w}   e5f6a7b..f0e1d2c  main -> main' },
    ]);
    const a = eOut(prog(t, S('G08_03') - 0.25, 0.35));
    terminal(t, 680, 100, 1200, 450, _bpTerm2, { alpha: a, fs: 28, accent: '#a66bff', title: '终端 — 实验室' });
    ctx.save(); ctx.globalAlpha = a;
    cloudBranches(1280, 760, 1.0, t, 1, prog(t, P('G08_04', 0.65), 0.5));
    ctx.restore();
    if (t >= S('G08_04')) note(1280, 880, popIn(t, P('G08_04', 0.5)), '⚠ main 也要 push！', '#ffd23f', { fs: 32 });
  }
};
SFX_FNS.push(() => { sfx(E('G08_01') - 0.1, 'whoosh', 0.5); sfx(E('G08_01') + 0.2, 'ding', 0.4); sfx(P('G08_02', 0.35), 'pop', 0.5); sfx(P('G08_02', 0.55), 'click', 0.4); sfx(S('G08_03') - 0.25, 'swoosh_in', 0.4); sfx(P('G08_04', 0.5), 'pop', 0.5); sfx(P('G08_04', 0.7), 'sparkle', 0.4); });

// ---- push 被拒绝 ----
let _rjTerm;
SC.rejected = (t, blk, en) => {
  bgLecture(t, '#ff5c8a'); lecturer(t, blk, en, blk.t0);
  const hit = P('G09_01', 0.22);
  // 上方示意：本地 → 云
  const top = t < S('G09_06') - 0.1;
  if (top) {
    const a = ph(t, blk.t0, S('G09_06') - 0.3, 0.35);
    const pulled = t > P('G09_03', 0.45), ok = t > P('G09_05', 0.3);
    let [sx, sy] = shake(t, hit, 14, 0.35);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(sx, sy);
    const lc = pulled ? ['#22c08b', '#3ec1ff', '#ff7a3d', '#ff5c8a'] : ['#22c08b', '#3ec1ff', '#ff5c8a'];
    laptop(960, 470, 0.75, { label: '宿舍（忘了 pull）', screen: () => chainRow(0, 0, lc.length + (pulled ? 1 : 0), { s: 0.34, gap: 62, cols: [...lc, '#a66bff'], pop: i => i >= 3 ? popIn(t, P('G09_03', 0.45) + (i - 3) * 0.15) : 1 }) });
    const cc = ok ? ['#22c08b', '#3ec1ff', '#ff7a3d', '#ff5c8a', '#a66bff'] : ['#22c08b', '#3ec1ff', '#ff7a3d'];
    const g2 = t >= S('G09_02') && t < S('G09_03');
    cloud(1620, 300, 0.8, { t, label: 'GitHub', n: cc.length, cols: cc, hi: g2 ? 2 : null });
    // 墙
    const wall = !ok && t < S('G09_03') + 0.3;
    if (wall) { const wa = popIn(t, hit - 0.05, 0.25); ctx.save(); ctx.translate(1300, 330); ctx.scale(wa, wa); for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) box(-50 + c * 50 - (r % 2) * 25, -125 + r * 50, 48, 46, 6, '#c0533a', '#7a2a18', 3); ctx.restore(); }
    // 第一次 push 撞墙
    if (t < S('G09_02')) {
      const p1 = prog(t, S('G09_01'), hit - S('G09_01')), p2 = prog(t, hit, 0.5);
      if (p1 < 1) flyNode(t, S('G09_01'), hit - S('G09_01'), 960, 340, 1240, 330, '#ff5c8a', 0.42, 40);
      else if (p2 < 1) commitNode(lerp(1240, 1050, eOut(p2)), 330 + 500 * p2 * p2 - 160 * p2, 0.42, null, { col: '#ff5c8a' });
      if (t > hit) stamp(t, hit, 1300, 560, 'REJECTED', '#ff3b5c', 84, -0.1);
    }
    if (g2) { note(1620, 120, popIn(t, P('G09_02', 0.15)), '云端有你没有的存档', '#ff7a3d', { fs: 30 }); if (t > P('G09_02', 0.6)) stamp(t, P('G09_02', 0.6), 1600, 500, '会被盖掉！', '#ff3b5c', 56, 0.08); }
    if (t >= S('G09_03') && !ok) { arrow(1460, 360, 1110, 400, '#7cf07a', eOut(prog(t, P('G09_03', 0.2), 0.3)), 12); flyNode(t, P('G09_03', 0.25), 0.4, 1620, 340, 960, 360, '#ff7a3d', 0.36); }
    if (ok) { arrow(1110, 380, 1450, 340, '#7cf07a', eOut(prog(t, P('G09_05', 0.15), 0.25)), 12); if (t < S('G09_06')) stamp(t, P('G09_05', 0.4), 1300, 560, '✓ push 成功', '#22c08b', 64, -0.06); }
    ctx.restore();
  }
  // 下方终端
  _rjTerm = _rjTerm || cmdLines([
    { t: S('G09_01') + 0.05, s: 'git push', cmd: true, dur: 0.3 },
    { t: hit + 0.05, s: '{r} ! [rejected]{w}        main -> main {d}(fetch first)' },
    { t: hit + 0.2, s: "{r}error:{w} failed to push some refs to 'github.com/dafeiyu/thesis'" },
    { t: P('G09_03', 0.2), s: 'git pull', cmd: true, dur: 0.35 },
    { t: P('G09_03', 0.5), s: "{w}Merge made by the 'ort' strategy." },
    { t: P('G09_05', 0.1), s: 'git push', cmd: true, dur: 0.3 },
    { t: P('G09_05', 0.3), s: '{w}   c3d4e5f..f0e1d2c  {g}main -> main' },
  ]);
  if (top && !(t >= S('G09_04') && t < S('G09_05'))) {
    const a = ph(t, blk.t0 + 0.1, S('G09_06') - 0.3, 0.35);
    terminal(t, 680, 640, 1200, 300, _rjTerm, { alpha: a, fs: 26, accent: '#ff5c8a', title: '终端', prompt: false });
  }
  // 冲突提示
  if (t >= S('G09_04') - 0.1 && t < S('G09_05')) {
    const a = ph(t, S('G09_04') - 0.1, S('G09_05') - 0.2);
    ctx.save(); ctx.globalAlpha = a; win(680, 640, 1200, 300, '第二章.md', '#ffb020', { bg: '#fffaf0' });
    const L = [['<<<<<<< HEAD', '#cf222e'], ['研究方法：问卷调查', '#24292f'], ['=======', '#6b6488'], ['研究方法：问卷 + 访谈', '#24292f'], ['>>>>>>> origin/main', '#1a7f37']];
    L.forEach((l, i) => txt(l[0], 720, 720 + i * 44, 30, l[1], { font: F_CODE }));
    ctx.restore();
    note(1640, 800, popIn(t, P('G09_04', 0.5)), '📖 上集讲过', '#ffb020', { fs: 34 });
  }
  // --force 警告
  if (t >= S('G09_06') - 0.2) {
    const a = eOut(prog(t, S('G09_06') - 0.2, 0.3));
    ctx.save(); ctx.globalAlpha = a;
    box(760, 150, 1040, 140, 24, '#1d1838', '#ff3b5c', 6); txt('$ git push --force', 1280, 222, 60, '#ff6b81', { font: F_CODE, align: 'center' });
    prohibit(1280, 220, 120, popIn(t, P('G09_06', 0.3)));
    const er = prog(t, P('G09_06', 0.45), 0.6);
    cloud(1280, 560, 0.95, { t, label: 'GitHub', n: 5, ghost: i => i >= 3 && er > (i - 3) * 0.5 });
    if (er > 0) for (let i = 0; i < 2; i++) bigX(1280 + (i + 1) * 56 * 0.95, 560 + Math.sin(t * 1.8) * 5 + 40 * 0.95, 20, '#ff3b5c', clamp(er * 2 - i));
    ctx.restore();
    if (t > P('G09_06', 0.7)) stamp(t, P('G09_06', 0.72), 1280, 830, '新手千万别用！', '#ff3b5c', 70, -0.06);
  }
};
SFX_FNS.push(() => { const h = P('G09_01', 0.22); sfx(S('G09_01'), 'whoosh', 0.5); sfx(h, 'impact', 0.8); sfx(h + 0.02, 'buzz', 0.6); sfx(h + 0.05, 'stamp', 0.7); sfx(P('G09_02', 0.6), 'stamp', 0.6); sfx(P('G09_03', 0.2), 'whoosh', 0.4); sfx(P('G09_03', 0.5), 'ding', 0.4); sfx(S('G09_04'), 'pop', 0.4); sfx(P('G09_05', 0.15), 'whoosh', 0.5); sfx(P('G09_05', 0.4), 'stamp', 0.6); sfx(P('G09_05', 0.42), 'sparkle', 0.4); sfx(P('G09_06', 0.3), 'buzz', 0.6); sfx(P('G09_06', 0.45), 'glitch', 0.4); sfx(P('G09_06', 0.72), 'stamp', 0.8); });

// ---- 不能上传的东西 ----
SC.nopush = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  const a = eOut(prog(t, blk.t0, 0.35));
  ctx.save(); ctx.globalAlpha = a;
  if (t < S('G10_04') - 0.1) {
    cloud(1280, 260, 0.75, { t, label: '🔒 私有仓库' });
    if (t < S('G10_02')) { note(1280, 470, popIn(t, P('G10_01', 0.2)), '只有你自己能看', '#7cf07a', { fs: 36 }); ['？', '？'].forEach((q, i) => badge(1080 + i * 400, 700, 90, '#ffd23f', q, { s: popIn(t, P('G10_01', 0.65) + i * 0.15), fs: 100 })); }
    const sh = popIn(t, S('G10_02') - 0.1);
    if (t >= S('G10_02') - 0.1) shield(1280, 560, 0.9 * sh, t);
    const bounce = (t0, sx0, label, icon, col, side) => {
      const p = prog(t, t0, 0.55), q = prog(t, t0 + 0.55, 0.5);
      const x = p < 1 ? lerp(sx0, 1280 + side * 200, eIn(p)) : lerp(1280 + side * 200, 1280 + side * 400, eOut(q));
      const y = p < 1 ? 860 - Math.sin(p * Math.PI * 0.5) * 300 : 560 + q * 200 - Math.sin(q * Math.PI) * 120;
      fileChip(x, y, 0.85, icon, label, col, { rot: p < 1 ? 0 : side * q * 0.4 });
      if (p >= 1 && q < 0.4) sparkle(t, t0 + 0.55, 1280 + side * 170, 560, 120, 8, '#ff3b5c');
    };
    if (t >= S('G10_02')) { bounce(P('G10_02', 0.1), 700, 'password.txt', '🔑', '#ff3b5c', -1); if (t > P('G10_02', 0.5)) stamp(t, P('G10_02', 0.5), 960, 340, '密码 / 密钥', '#ff3b5c', 50, -0.1); }
    if (t >= S('G10_03')) { bounce(P('G10_03', 0.15), 1860, 'video_200MB.mp4', '🎬', '#ff7a3d', 1); if (t > P('G10_03', 0.6)) stamp(t, P('G10_03', 0.62), 1620, 340, '> 100 MB 拒收', '#ff7a3d', 50, 0.08); }
  } else {
    const ca = popIn(t, S('G10_04'));
    ctx.save(); ctx.translate(1280, 470); ctx.scale(ca, ca); ctx.rotate(-0.03);
    box(-420, -280, 840, 560, 34, '#fffaf0', '#1b1433', 8);
    pill(0, -280, '下集预告', '#ffd23f', 1, { font: F_FANCY, fs: 48 });
    txt('.gitignore', 0, -150, 80, '#1b1433', { font: F_CODE, align: 'center' });
    [['password.txt', '🔑'], ['*.mp4', '🎬']].forEach((r, i) => { const y = -20 + i * 110; box(-300, y - 40, 600, 80, 16, '#1d1838'); txt(r[1] + ' ' + r[0], -270, y, 40, '#7cf07a', { font: F_CODE }); txt('→ 忽略', 270, y, 34, '#8f8aa8', { align: 'right' }); });
    txt('让 Git 自动忽略它们', 0, 220, 40, '#3b3355', { align: 'center' });
    ctx.restore();
    fancy('下集细说！', 1280, 870, 72, t, P('G10_04', 0.65), FX.yel);
  }
  ctx.restore();
};
SFX_FNS.push(() => { sfx(P('G10_01', 0.2), 'pop', 0.4); sfx(P('G10_01', 0.65), 'pop', 0.4); sfx(P('G10_01', 0.65) + 0.15, 'pop', 0.4); sfx(S('G10_02') - 0.1, 'swoosh_in', 0.5); sfx(P('G10_02', 0.1) + 0.55, 'boing', 0.7); sfx(P('G10_02', 0.5), 'stamp', 0.6); sfx(P('G10_03', 0.15) + 0.55, 'boing', 0.7); sfx(P('G10_03', 0.62), 'stamp', 0.6); sfx(S('G10_04'), 'pop', 0.6); sfx(P('G10_04', 0.65), 'sparkle', 0.4); });

// ---- 复习：四个命令 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, '#ffd23f'); lecturer(t, blk, en, blk.t0);
  const a = eOut(prog(t, blk.t0, 0.35));
  const CX = 1280, CY = 250, DX = 920, LX = 1640, PY = 700;
  const lit = f => t >= P('G11_02', f);
  const fr = [0.02, 0.27, 0.5, 0.76];
  ctx.save(); ctx.globalAlpha = a;
  cloud(CX, CY, 0.8, { t, label: 'GitHub', n: 3 });
  laptop(DX, PY, 0.62, { label: '我的电脑', screen: () => chainRow(0, 0, 3, { s: 0.4, gap: 80 }) });
  laptop(LX, PY, 0.62, { label: '新电脑', lcol: '#7cf07a', screen: () => lit(fr[2]) ? chainRow(0, 0, 3, { s: 0.4, gap: 80 }) : txt('📂', 0, 0, 40, '#8f8aa8', { align: 'center' }) });
  const items = [
    ['remote add', '连上云端', '#c9a6ff', [DX - 120, PY - 240, CX - 260, CY + 30], [DX - 260, 390], { dash: [16, 12], t }],
    ['push', '推上去', '#ffb020', [DX + 10, PY - 240, CX - 110, CY + 120], [DX + 120, 440], {}],
    ['clone', '搬到新电脑', '#7cf07a', [CX + 120, CY + 110, LX - 20, PY - 240], [LX + 150, 430], {}],
    ['pull', '拉下来', '#6bd3ff', [CX - 40, CY + 140, DX + 160, PY - 220], [DX + 330, 560], {}],
  ];
  items.forEach((it, i) => {
    const on = lit(fr[i]); if (!on && t < S('G11_03')) return;
    const p = eOut(prog(t, P('G11_02', fr[i]), 0.35));
    arrow(...it[3], it[2], t >= S('G11_03') ? 1 : p, 12, it[5]);
    const s = popIn(t, P('G11_02', fr[i])); pill(it[4][0], it[4][1], it[0], it[2], s, { fs: 36 });
    if (s > 0) { ctx.save(); ctx.globalAlpha *= clamp(s); txt(it[1], it[4][0], it[4][1] + 52, 28, '#fff', { align: 'center' }); ctx.restore(); }
  });
  ctx.restore();
  if (t < S('G11_02')) { fancy('4 个命令！', 1280, 520, 110, t, P('G11_01', 0.2), Object.assign({ wobble: 3, out: S('G11_02') - 0.1 }, FX.yel)); }
  if (t >= S('G11_03')) {
    ctx.save(); ctx.globalAlpha = eOut(prog(t, S('G11_03'), 0.3)); box(700, 820, 1160, 110, 30, 'rgba(20,14,40,0.94)', '#ffd23f', 6); ctx.restore();
    fancy('开工先 pull，收工再 push！', 1280, 875, 64, t, P('G11_03', 0.3), FX.yel);
  }
};
SFX_FNS.push(() => { sfx(P('G11_01', 0.2), 'impact', 0.6); [0.02, 0.27, 0.5, 0.76].forEach(f => sfx(P('G11_02', f), 'ding', 0.4)); sfx(P('G11_03', 0.3), 'swoosh_in', 0.5); sfx(P('G11_03', 0.6), 'sparkle', 0.4); });

// ---- 实战：两台电脑完整走一遍 ----
let _prD, _prL;
SC.practice = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  if (!_prD) {
    _prD = cmdLines([
      { t: P('G12_02', 0.55), s: 'git remote add origin \\', cmd: true, dur: 0.7 },
      { t: P('G12_02', 0.75), s: '{d}  ' + REPO_URL, ind: 0 },
      { t: P('G12_03', 0.08), s: 'git push -u origin main', cmd: true, dur: 0.7 },
      { t: P('G12_03', 0.55), s: '{g} * [new branch]{w}  main -> main' },
      { t: P('G12_05', 0.2), s: 'git pull', cmd: true, dur: 0.3 },
      { t: P('G12_05', 0.4), s: '{w}Updating a1b2c3d..9f8e7d6' },
      { t: P('G12_05', 0.5), s: '{w} 第二章.md | 42 {g}++++++' },
      { t: P('G12_06', 0.08), s: 'git log --oneline', cmd: true, dur: 0.5 },
      { t: P('G12_06', 0.3), s: '{y}9f8e7d6 {c}(HEAD -> main, origin/main)' },
      { t: P('G12_06', 0.33), s: '{w}        写完第二章' },
      { t: P('G12_06', 0.36), s: '{y}a1b2c3d{w} 完成第一章' },
    ]);
    _prL = cmdLines([
      { t: P('G12_04', 0.12), s: 'git clone \\', cmd: true, dur: 0.4 },
      { t: P('G12_04', 0.22), s: '{d}  ' + REPO_URL },
      { t: P('G12_04', 0.5), s: 'git add .', cmd: true, dur: 0.3 },
      { t: P('G12_04', 0.6), s: 'git commit -m "写完第二章"', cmd: true, dur: 0.5 },
      { t: P('G12_04', 0.72), s: '{y}[main 9f8e7d6]{w} 写完第二章' },
      { t: P('G12_04', 0.82), s: 'git push', cmd: true, dur: 0.3 },
      { t: P('G12_04', 0.94), s: '{w}  a1b2c3d..9f8e7d6  {g}main -> main' },
      { t: P('G12_06', 0.45), s: 'git log --oneline', cmd: true, dur: 0.5 },
      { t: P('G12_06', 0.6), s: '{y}9f8e7d6 {c}(HEAD -> main, origin/main)' },
      { t: P('G12_06', 0.63), s: '{w}        写完第二章' },
      { t: P('G12_06', 0.66), s: '{y}a1b2c3d{w} 完成第一章' },
    ]);
  }
  const steps = [['新建仓库', 'G12_02'], ['remote', P('G12_02', 0.5)], ['push -u', 'G12_03'], ['clone', 'G12_04'], ['commit', P('G12_04', 0.45)], ['pull', 'G12_05']];
  const st = steps.map(s => typeof s[1] === 'string' ? S(s[1]) : s[1]);
  const allDone = t >= S('G12_06');
  steps.forEach((s, i) => {
    const a = popIn(t, blk.t0 + 0.15 + i * 0.08); if (a <= 0) return;
    const x = 770 + i * 200, y = 88; const act = !allDone && t >= st[i] && (i === 5 || t < st[i + 1]); const done = allDone || (i < 5 && t >= st[i + 1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1));
    box(-92, -34, 184, 68, 20, act ? '#ff7a3d' : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act ? '✓' : (i + 1)) + ' ' + s[0], 0, 2, 26, '#fff', { align: 'center', font: s[0].match(/[a-z]/) ? F_CODE : F_BODY });
    ctx.restore();
  });
  const dAct = (t >= S('G12_02') && t < S('G12_04')) || (t >= S('G12_05') && t < P('G12_06', 0.42));
  const lAct = (t >= S('G12_04') && t < S('G12_05')) || (t >= P('G12_06', 0.42) && t < S('G12_07'));
  const ta = eOut(prog(t, blk.t0, 0.3));
  // 新建仓库小浏览器
  if (t >= S('G12_02') && t < P('G12_02', 0.55)) { const ba = ph(t, S('G12_02'), P('G12_02', 0.5)); ctx.save(); ctx.globalAlpha *= ba; const cy = browser(700, 180, 560, 360, 'github.com/new', { title: 'GitHub' }); txt('thesis', 740, cy + 60, 34, '#24292f', { font: F_CODE }); ghButton(740, cy + 100, 260, 54, '创建仓库', '#1f883d', { fs: 24 }); ctx.restore(); }
  else terminal(t, 676, 160, 600, 700, _prD, { alpha: ta * (lAct ? 0.6 : 1), fs: 21, accent: dAct ? '#ff7a3d' : '#5b4f8a', title: '🏠 宿舍电脑' });
  terminal(t, 1290, 160, 600, 700, _prL, { alpha: ta * (dAct ? 0.6 : 1), fs: 21, accent: lAct ? '#7cf07a' : '#5b4f8a', title: '🧪 实验室电脑' });
  if (t < S('G12_02')) fancy('实战开始！', 1280, 500, 110, t, P('G12_01', 0.3), Object.assign({ wobble: 3 }, FX.orange));
  if (t >= S('G12_06') && t < S('G12_07')) { const p = popIn(t, P('G12_06', 0.7)); note(1283, 885, p, '两边指着同一个存档 ✓', '#7cf07a', { fs: 34 }); }
  if (t >= S('G12_07')) {
    ctx.fillStyle = `rgba(20,14,40,${0.6 * eOut(prog(t, S('G12_07'), 0.3))})`; ctx.fillRect(660, 140, 1260, 760);
    cloud(1280, 400, 0.9, { t, label: '一份存档', n: 3, glow: 0.8 });
    fancy('两台电脑，一份存档！', 1280, 720, 80, t, P('G12_07', 0.2), FX.yel);
    confetti(t, P('G12_07', 0.4), 90, 7, 1280, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; [0, 1, 2, 3, 4, 5].forEach(i => sfx(b.t0 + 0.15 + i * 0.08, 'pop', 0.3)); sfx(P('G12_01', 0.3), 'impact', 0.6); ['G12_02', 'G12_03', 'G12_04', 'G12_05', 'G12_06'].forEach(id => sfx(S(id), 'click', 0.5)); sfx(P('G12_03', 0.55), 'ding', 0.4); sfx(P('G12_04', 0.94), 'ding', 0.4); sfx(P('G12_05', 0.5), 'sparkle', 0.4); sfx(P('G12_06', 0.7), 'ding', 0.5); sfx(P('G12_07', 0.4), 'confetti', 0.5); });

// ---- 预告 + 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#3ec1ff');
  const outro = E('G13_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G13_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G13_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 140, 92, t, st + 0.1, FX.white);
    fancy('和同学一起写？', 1260, 290, 86, t, P('G13_01', 0.3), FX.blue);
    const cp = popIn(t, P('G13_01', 0.5), 0.5);
    if (cp > 0) {
      ctx.save(); ctx.translate(1260, 560); ctx.scale(cp, cp);
      cloud(0, -40, 0.7, { t, label: '一个仓库' });
      const cols = ['#ff5c8a', '#22c08b', '#ffd23f', '#a66bff'];
      cols.forEach((c, i) => { const ang = Math.PI * (0.15 + i * 0.233); const x = Math.cos(ang) * 330, y = 40 + Math.sin(ang) * 90; ctx.save(); ctx.translate(x, y + Math.sin(t * 3 + i) * 8); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, -40, 34, 0, 7); ctx.fill(); rr(-44, 0, 88, 80, 30); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke(); txt('?', 0, -38, 40, '#fff', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); arrow(x * 0.8, y * 0.6 - 10, x * 0.35, -20, c, 1, 6); });
      ctx.restore();
      fancy('联机模式：多人协作', 1260, 850, 72, t, P('G13_01', 0.75), FX.pink);
    }
  }
  if (ot > 0) {
    ctx.fillStyle = `rgba(10,8,22,${0.78 * ot})`; ctx.fillRect(...OS);
    [['👍', '点赞', '#ff5c8a'], ['🪙', '投币', '#ffd23f'], ['⭐', '收藏', '#3ec1ff']].forEach((ic, i) => {
      const a = popIn(t, S('G13_02') + 0.4 + i * 0.32, 0.4); if (a <= 0) return;
      const x = W / 2 + (i - 1) * 330, y = 470;
      ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(t * 5 + i) * 0.06);
      ctx.fillStyle = ic[2]; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.font = `110px "Segoe UI Emoji","Noto Color Emoji",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic[0], 0, 8); ctx.restore();
      fancy(ic[1], x, y + 185, 60, t, S('G13_02') + 0.5 + i * 0.32, { c1: '#fff', c2: '#eee', stroke: ic[2] });
    });
    fancy('一键三连，下集见！', W / 2, 200, 96, t, S('G13_02') + 1.4, { stagger: 0.04 });
    if (t > outro) { const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_ok', 1680, H + 40, 560, { scale: sa }); } }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.8)'; ctx.fillRect(0, 950, W, 90); ctx.fillStyle = '#e4defa'; ctx.font = `23px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆（沿用第1集音色）', W / 2, 978);
    ctx.fillText('DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 1014);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G13_01', 0.3), 'pop', 0.5); sfx(P('G13_01', 0.5), 'pop', 0.6); sfx(P('G13_01', 0.75), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G13_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G13_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_sparkle', P('G01_04', 0.4), E('G01_04')], ['d_shock', P('G04_06', 0.3), E('G04_06')], ['d_relief', P('G05_04', 0.5), E('G05_04')],
  ['d_happy', P('G06_04', 0.5), E('G06_04')], ['d_panic', P('G09_01', 0.35), E('G09_01')], ['d_relief', P('G09_05', 0.45), E('G09_05')],
  ['d_shock', P('G10_03', 0.5), E('G10_03')], ['d_sparkle', P('G12_07', 0.3), E('G12_07')],
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
['remote', 'push', 'clone', 'branchpush', 'rejected', 'practice'].forEach(k => { const b = BK[k]; b.entries.filter(e => e.k === 'v').map(e => e.vo + 0.3).forEach(tt => { ctx.save(); try { SC[k](tt, b, b.entries[b.entries.length - 1]); } catch (e) { console.error(e); } ctx.restore(); }); });
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
