// AI娘 Git课 · 第8集 渲染引擎 —— renderAt(t) 纯函数，逐帧确定性导出（通用部分沿用第1集）
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const F_FANCY = '"Smiley", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const F_BODY = '"Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const F_CODE = 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", "Microsoft YaHei", "Noto Sans CJK SC", monospace';

// ================= 素材 =================
const SPR = {};
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'g_cheer', 'g_warn', 'g_think', 'g_shock', 'g_proud', 'g_type', 'g_peace', 'g_awkward', 'g_present', 'd_panic', 'd_curious', 'd_happy', 'd_raise', 'd_think', 'd_shock', 'd_sparkle', 'd_ok', 'd_relief', 'd_leader', 'q_base', 'q_point', 'q_tea', 'c_base', 'c_ok', 'c_cool', 'm_base', 'm_panic', 'm_cheeky', 'x_base', 'x_angry', 'x_force', 'b_base', 'b_sorry', 'k_base', 'k_read', 'g_pill', 'd_pill', 'm_oops', 'q_alarm', 'b_wave', 'x_panic', 'k_diary', 'c_read', 'g_tag', 'd_party', 'b_proud', 'm_tag', 'x_thumb', 'k_scroll', 'g_web', 'd_phone', 'm_photo', 'x_doubt', 'b_point', 'g_check', 'd_robot', 'm_clock', 'c_lock', 'b_badge', 'g_scissors', 'd_tangle', 'd_film', 'b_squash'];
// 竖版立绘只显示上半身：显示高度占整张图的比例（头顶到腰）
const SPRC = { d_panic: 0.55, d_curious: 0.55, d_happy: 0.55, d_sparkle: 0.6, d_ok: 0.66, d_raise: 0.72, d_think: 0.7, d_relief: 0.82, d_shock: 0.82, d_leader: 0.7, q_base: 0.6, q_point: 0.6, q_tea: 0.6, c_base: 0.58, c_ok: 0.58, c_cool: 0.58, m_base: 0.62, m_panic: 0.6, m_cheeky: 0.62, x_base: 0.6, x_angry: 0.6, x_force: 0.66, b_base: 0.62, b_sorry: 0.62, k_base: 0.6, k_read: 0.6, d_pill: 0.6, m_oops: 0.62, q_alarm: 0.6, b_wave: 0.62, x_panic: 0.62, k_diary: 0.6, c_read: 0.58, d_party: 0.68, b_proud: 0.6, m_tag: 0.62, x_thumb: 0.66, k_scroll: 0.62, d_phone: 0.66, m_photo: 0.6, x_doubt: 0.62, b_point: 0.62, d_robot: 0.66, m_clock: 0.62, c_lock: 0.6, b_badge: 0.62, d_tangle: 0.62, d_film: 0.64, b_squash: 0.7 };
const loadImg = n => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });


// ================= 台词（由 subtitles.json 生成，改台词请改 _gen_script.py）=================
const TEXT = {
  D01: "我想给白饭页发个 PR，可提交历史一看：改改、再改、真的好了……还到处都是分叉！",
  G01_01: "别慌，Git 能整理历史：变基，rebase。它把你的提交拿起来，接到最新的 main 后面，一个一个重新放一遍。",
  G01_02: "就像剪辑游戏录像：失误的片段剪掉，碎镜头拼成一段，最后成片一条线。",
  G01_03: "欢迎来到 AI娘 Git 课，第八集，整理提交历史！",
  D02: "那它和 merge 有什么区别？不都是把两条线合起来吗？",
  G02_01: "merge 会多一个合并提交，历史像打了个结；rebase 不留结，你的提交直接排到 main 最新的后面。",
  G02_02: "用法：先切到自己的分支，再运行 git rebase main。",
  G02_03: "注意：重放出来的是新提交，编号全变了，改的内容还是原来那些。",
  Q01: "用户反馈：白饭页的历史里全是“Merge branch main”，看不出到底改了什么。",
  D03: "那是我每次 git pull 自动生成的……",
  G03_01: "本地和云端都有新提交时，git pull 默认用合并，就会多出一个合并提交。",
  G03_02: "换成 git pull --rebase：先接上云端的提交，再把你的放到后面，历史还是一条线。",
  G03_03: "嫌每次都要加参数？运行 git config --global pull.rebase true，以后拉取默认变基。",
  G03_04: "有没提交的改动，变基会拒绝开始：先提交，或者 git stash 收起来，拉完再拿出来。",
  Q02: "历史清爽了，用户说一眼就能看懂。",
  D04: "变基到一半冲突了！这下是不是全完了？",
  C01: "慢着，先别乱点。提示里已经写了下一步怎么做。",
  G04_01: "变基是一个提交一个提交地放，哪个冲突就停在哪个。改好文件，git add，再 git rebase --continue。",
  G04_02: "提交多的话，可能要停好几次；实在乱了，git rebase --abort，一键回到变基之前。",
  C02: "先读提示，再动手。处理得很干净，批准。",
  B01: "家人们！我四个碎提交想合成一个，但不想像上回那样全退回去重新交！",
  D05: "我也是！我那几个“改改”“再改”……",
  G05_01: "用交互式变基：git rebase -i HEAD~4，会打开一张清单，最近四个提交一行一个。",
  G05_02: "第一行留 pick；下面改成 squash，就压进上一个；改成 fixup 也压进去，但它的说明直接丢掉。",
  G05_03: "保存、关掉编辑器，四个提交就合成了一个，再给它写一句像样的说明。",
  G05_04: "注意清单的顺序和 git log 相反：最上面是最早的提交，所以 pick 要留在第一行。",
  B02: "四合一！家人们，历史干净得能照镜子！",
  M01: "喵？三个提交之前的说明，我又把年份写成 2024 了！",
  D06: "上回的 amend 不是只能改最后一个吗？",
  G06_01: "还是那张清单：把那一行的 pick 改成 reword，保存后会让你重写那条说明。",
  G06_02: "改成 drop 就删掉那个提交；上下挪动几行，提交的顺序也跟着变。",
  M02: "改好了！这回年份终于对了。",
  X01: "变基完推送被拒了？那我直接 --force。",
  D07: "等等！队友的提交还在上面呢！",
  G07_01: "变基换掉了编号，云端的历史对不上，普通推送当然会被拒。",
  G07_02: "黄金法则：别人也在用的分支，比如 main，不要变基；只整理你自己还没合并的分支。",
  G07_03: "自己的分支要覆盖云端，用 git push --force-with-lease：云端多了别人的提交，它就拒绝，不会冲掉。",
  G07_04: "再给 main 开上保护规则，谁强推都会被直接拦下，比靠记性稳多了。",
  X02: "带保险的强推。这才是真的稳。",
  K01: "我把日记翻完了：历史整理坏了也不怕，reflog 里记着整理之前的位置。",
  D08: "真的能回去？",
  G08_01: "找到变基之前那一行，比如 HEAD@{5}，git reset --hard 回去，就像没变基过。",
  G08_02: "不想敲命令？PR 的合并按钮也能选：Squash and merge 压成一个，Rebase and merge 排成一条线。",
  G08_03: "压缩合并以后，main 上只多一个提交；原来那些碎提交，PR 页面里还能翻到。",
  K02: "一句话：自己的分支随便整理，整理坏了就翻日记。",
  D09: "剪辑课好多步……帮我划个重点！",
  G09_01: "接：git rebase main 接到最新；pull 加 --rebase 不留结；冲突就 add，再 --continue。",
  G09_02: "剪：rebase -i 清单里，squash 合并，reword 改说明，drop 删掉。",
  G09_03: "守：别人在用的分支不变基；强推用 --force-with-lease；搞砸了翻 reflog。",
  D10: "我现在就把甜点菜单的分支剪干净！",
  G10_01: "先 git fetch，再 git rebase origin/main：甜点分支接到最新的 main 后面。",
  G10_02: "菜单文件冲突了：两边的菜都留下，git add，再 --continue。",
  G10_03: "再 rebase -i HEAD~4：一个 pick、三个 fixup，合成一个“添加甜点菜单”。",
  G10_04: "--force-with-lease 推上去，PR 的检查亮起绿勾，点 Rebase and merge。",
  G10_05: "最后 git log --oneline --graph：一条直线，每个提交都说得清干了什么。",
  D11: "我的提交历史，第一次这么好看！",
  G11_01: "下集预告：网页突然坏了，是哪次提交改坏的？Git 侦探出动，blame 和 bisect 帮你抓真凶！",
  G11_02: "喜欢的话记得一键三连，我们下集见！",
};
const DUR = Object.assign({}, window.DUR || {});

// ================= 时间轴 =================
const V = (b, id, pose) => ({ k: 'v', b, id, pose });
const BEAT = (b, d) => ({ k: 'beat', b, d: b === 'teaser' ? d * 0.75 : d * 0.35 });
const CH_COL = ['#7c5cff', '#3ec1ff', '#22c08b', '#ffb020', '#ff5c8a', '#ff7a3d', '#a66bff', '#ffd23f'];
const PLAN = [
  V('cold', 'D01', 'd_tangle'),
  V('why', 'G01_01', 'g_explain'), V('why', 'G01_02', 'g_scissors'),
  V('title', 'G01_03', 'g_cheer'), BEAT('title', 1.4),
  V('mergeQ', 'D02', 'd_think'),
  V('basics', 'G02_01', 'g_explain'), V('basics', 'G02_02', 'g_type'), V('basics', 'G02_03', 'g_warn'),
  V('pullQ', 'Q01', 'q_alarm'), V('pullQ', 'D03', 'd_shock'),
  V('pull', 'G03_01', 'g_explain'), V('pull', 'G03_02', 'g_point'), V('pull', 'G03_03', 'g_type'), V('pull', 'G03_04', 'g_warn'), V('pull', 'Q02', 'q_point'),
  V('conflictQ', 'D04', 'd_panic'), V('conflictQ', 'C01', 'c_read'),
  V('conflict', 'G04_01', 'g_explain'), V('conflict', 'G04_02', 'g_think'), V('conflict', 'C02', 'c_ok'),
  V('squashQ', 'B01', 'b_squash'), V('squashQ', 'D05', 'd_raise'),
  V('squash', 'G05_01', 'g_type'), V('squash', 'G05_02', 'g_explain'), V('squash', 'G05_03', 'g_scissors'), V('squash', 'G05_04', 'g_warn'), V('squash', 'B02', 'b_proud'),
  V('rewordQ', 'M01', 'm_oops'), V('rewordQ', 'D06', 'd_curious'),
  V('reword', 'G06_01', 'g_point'), V('reword', 'G06_02', 'g_scissors'), V('reword', 'M02', 'm_cheeky'),
  V('forceQ', 'X01', 'x_force'), V('forceQ', 'D07', 'd_shock'),
  V('golden', 'G07_01', 'g_think'), V('golden', 'G07_02', 'g_warn'), V('golden', 'G07_03', 'g_explain'), V('golden', 'G07_04', 'g_proud'), V('golden', 'X02', 'x_thumb'),
  V('rescueQ', 'K01', 'k_diary'), V('rescueQ', 'D08', 'd_sparkle'),
  V('rescue', 'G08_01', 'g_point'), V('rescue', 'G08_02', 'g_present'), V('rescue', 'G08_03', 'g_explain'), V('rescue', 'K02', 'k_scroll'),
  V('ask8', 'D09', 'd_happy'),
  V('recap', 'G09_01', 'g_present'), V('recap', 'G09_02', 'g_scissors'), V('recap', 'G09_03', 'g_proud'),
  V('askP', 'D10', 'd_leader'),
  V('practice', 'G10_01', 'g_cheer'), V('practice', 'G10_02', 'g_awkward'), V('practice', 'G10_03', 'g_type'), V('practice', 'G10_04', 'g_check'), V('practice', 'G10_05', 'g_proud'), V('practice', 'D11', 'd_film'),
  V('teaser', 'G11_01', 'g_explain'), V('teaser', 'G11_02', 'g_cheer'), BEAT('teaser', 8),
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
// ================= 第8集：变基 rebase =================
Object.assign(SQ.Q, { role: '用户反馈' }); Object.assign(SQ.C, { role: '先读提示' }); Object.assign(SQ.M, { role: '改旧说明' });
Object.assign(SQ.X, { role: '强推' }); Object.assign(SQ.B, { role: '合并碎提交' }); Object.assign(SQ.K, { role: '翻日记' });
const ACC = '#f76707', MAINC = '#3ec1ff', FEATC = '#ff7a3d', NEWC = '#ffd23f', KNOTC = '#ff4d6d', OKC = '#1f883d', BADC = '#cf222e', RUNC = '#d4a72c', LIVEC = '#1a7f37';
const CMDC = { pick: '#6bd3ff', squash: '#ff9f43', fixup: '#c9a6ff', reword: '#7cf07a', drop: '#ff6b81' };
const isCJK = s => /[\u4e00-\u9fff]/.test(s);
// 提交点：x,y 圆心；s 缩放；o.r 半径、o.glow、o.lab 标签、o.up 标签在上、o.ghost 半透明、o.mark 圆内字
function gDot(x, y, s, col, o = {}) {
  if (s <= 0) return; const r = o.r || 24; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.ghost) ctx.globalAlpha *= 0.3;
  if (o.glow) { ctx.fillStyle = hexA(col, 0.35); ctx.beginPath(); ctx.arc(0, 0, r * 1.9 + 5 * Math.sin((o.t || 0) * 8), 0, 7); ctx.fill(); }
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.lineWidth = r * 0.26; ctx.strokeStyle = '#fff'; ctx.stroke();
  if (o.mark) txt(o.mark, 0, 1, r * 1.05, '#fff', { align: 'center', font: F_CODE });
  if (o.lab) txt(o.lab, 0, o.up ? -r - 24 : r + 26, o.fs || 24, o.lc || '#fff', { align: 'center', font: isCJK(o.lab) ? F_BODY : F_CODE, max: o.max || 220 });
  ctx.restore();
}
// 节点 N = {k: {x, y, col, t0, ...gDot 选项}}；边 E = [[k1, k2, t0, col]]（col 缺省取终点颜色）
function drawGraph(t, N, E, o = {}) {
  E.forEach(e => { const a = N[e[0]], b = N[e[1]]; if (!a || !b) return; const p = prog(t, e[2] ?? -1, 0.25); if (p <= 0) return;
    ctx.save(); if (a.ghost || b.ghost) ctx.globalAlpha *= 0.3; seg(a.x, a.y, b.x, b.y, e[3] || b.col, p, o.lw || 9); ctx.restore(); });
  Object.values(N).forEach(n => gDot(n.x, n.y, n.s ?? popIn(t, n.t0 ?? -1), n.col, Object.assign({ t, fs: o.fs, r: o.r }, n)));
}
// 曲线 + 抬起：把点从 (x0,y0) 搬到 (x1,y1)
function moveP(t, t0, d, x0, y0, x1, y1, lift = 90) { const p = eIO(prog(t, t0, d)); return [lerp(x0, x1, p), lerp(y0, y1, p) - Math.sin(p * Math.PI) * lift, p]; }
// 交互式变基清单：rows = [{cmd, hash, msg, t, to:[[时间, 新cmd]], gone:时间, y0 行号覆盖}]
function todoList(t, x, y, w, rows, o = {}) {
  const fs = o.fs || 30, lh = o.lh || fs * 1.9; const h = o.h || (90 + rows.length * lh + (o.foot ? 70 : 20));
  const a0 = o.alpha ?? 1; if (a0 <= 0) return; ctx.save(); ctx.globalAlpha *= a0;
  win(x, y, w, h, '📝 ' + (o.title || 'git-rebase-todo'), o.accent || ACC, { bg: '#1b1730' });
  rows.forEach((r, i) => {
    if (t < (r.t ?? -1)) return; let cmd = r.cmd; (r.to || []).forEach(c => { if (t >= c[0]) cmd = c[1]; });
    const ch = (r.to || []).find(c => t >= c[0] && t < c[0] + 0.45);
    const gone = r.gone != null ? clamp(prog(t, r.gone, 0.35)) : 0; const row = r.row != null ? (typeof r.row === 'function' ? r.row(t) : r.row) : i;
    const ly = y + 100 + row * lh; ctx.save(); ctx.globalAlpha *= clamp(prog(t, r.t ?? -1, 0.2)) * (1 - gone * 0.8);
    if (ch || r.hl && t >= r.hl[0] && t < r.hl[1]) box(x + 20, ly - lh / 2 + 4, w - 40, lh - 8, 10, hexA(CMDC[cmd] || '#ffd23f', 0.2 + 0.08 * Math.sin(t * 8)), CMDC[cmd] || '#ffd23f', 3);
    ctx.font = `bold ${fs}px ${F_CODE}`; const cw = ctx.measureText('squash ').width;
    const sc = ch ? 1 + 0.25 * Math.sin(prog(t, ch[0], 0.45) * Math.PI) : 1;
    ctx.save(); ctx.translate(x + 40, ly); ctx.scale(sc, sc); txt(cmd, 0, 0, fs, CMDC[cmd] || '#fff', { font: F_CODE }); ctx.restore();
    txt(r.hash, x + 40 + cw, ly, fs, '#ffd36b', { font: F_CODE }); txt(r.msg, x + 40 + cw + fs * 4.4, ly, fs, '#ece9f7', { font: isCJK(r.msg) ? F_BODY : F_CODE, max: w - cw - fs * 4.4 - 70 });
    if (gone > 0) { ctx.strokeStyle = '#ff6b81'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 30, ly); ctx.lineTo(x + 30 + (w - 60) * gone, ly); ctx.stroke(); }
    ctx.restore();
  });
  if (o.foot) txt(o.foot, x + 40, y + h - 40, 22, '#8f8aa8', { font: F_CODE, bold: false });
  ctx.restore();
}
// 胶片条（cx 中心）：frames = [[文字, 颜色, 透明度, 缩放]]
function filmStrip(cx, y, s, frames, o = {}) {
  if (s <= 0) return; const fw = o.fw || 170, fh = o.fh || 130, n = frames.length, w = n * fw + 40; ctx.save(); ctx.translate(cx, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  box(-w / 2, -fh / 2 - 34, w, fh + 68, 10, '#2b2233', '#111', 4);
  for (let i = 0; i < n * 3 + 2; i++) { const hx = -w / 2 + 12 + i * (w - 24) / (n * 3 + 1); box(hx - 7, -fh / 2 - 24, 14, 14, 3, '#f4efe6'); box(hx - 7, fh / 2 + 10, 14, 14, 3, '#f4efe6'); }
  frames.forEach((f, i) => { const fx = -w / 2 + 20 + i * fw; ctx.save(); ctx.globalAlpha *= f[2] ?? 1; const k = f[3] ?? 1; ctx.translate(fx + fw / 2, 0); ctx.scale(k, k);
    box(-fw / 2 + 6, -fh / 2, fw - 12, fh, 8, f[1] || '#5b4a7a'); txt(f[0], 0, 0, o.fs || 28, '#fff', { align: 'center', max: fw - 24 }); ctx.restore(); });
  ctx.restore();
}

// ---- 冷开场：提交历史乱成一团 ----
SC.cold = (t, blk) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, P('D01', 0.62), 10, 0.35); ctx.translate(sx, sy);
  bgBurst(t, '#7a1f4a', '#c2416d', W * 0.62, H * 0.5, 22, 0.35);
  const wa = eBack(prog(t, t0 + 0.05, 0.4));
  ctx.save(); ctx.translate(1390, 450); ctx.scale(wa, wa); ctx.rotate(-0.02); ctx.translate(-1390, -450);
  win(960, 90, 860, 700, '终端 — git log --graph', ACC, { bg: '#1b1730' });
  const N = {}, E = []; const labs = ['甜点菜单', '改改', 'Merge branch main', '再改', 'Merge branch main', '真的好了', 'Merge branch main'];
  labs.forEach((l, i) => { const mg = l.startsWith('Merge'); const x = mg ? 1130 : 1060 + (i % 2) * 150, y = 720 - i * 88;
    N['n' + i] = { x, y, col: mg ? KNOTC : FEATC, t0: t0 + 0.15 + i * 0.12, r: 18 }; if (i) E.push(['n' + (i - 1), 'n' + i, t0 + 0.15 + i * 0.12]);
    if (mg) { N['m' + i] = { x: 1290, y: y + 44, col: MAINC, t0: t0 + 0.1 + i * 0.12, r: 14 }; E.push(['m' + i, 'n' + i, t0 + 0.15 + i * 0.12, MAINC]); }
    const a = popIn(t, t0 + 0.2 + i * 0.12); if (a > 0) txt(l, 1340, y, 28, mg ? '#ff9aa9' : '#ece9f7', { font: isCJK(l) ? F_BODY : F_CODE, max: 460 }); });
  drawGraph(t, N, E, { lw: 7 });
  if (t >= P('D01', 0.62)) { flash(t, P('D01', 0.62), 0.15, '255,80,120'); stamp(t, P('D01', 0.66), 1560, 640, '全是分叉！', BADC, 60, -0.1); }
  ctx.restore();
  [['这是啥？', 1720, 170, 0.5, '#ff5c8a'], ['看不懂…', 1110, 860, 0.56, '#7c5cff']].forEach(q => { const s = popIn(t, P('D01', q[3])); if (s > 0) note(q[1], q[2], s, q[0], q[4], { fs: 40, rot: -0.06 }); });
  const p = spring(prog(t, t0, 0.9));
  sprite('d_tangle', 470, H + 40, 990, { scale: lerp(1.3, 1, p) });
  fancy('乱成一团！', 460, 150, 92, t, U.D01.vo + 0.05, { rot: -0.08, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
  if (t >= P('D01', 0.12)) pill(1390, 960, 'PR 都不好意思发…', '#ff9aa9', popIn(t, P('D01', 0.12)), { fs: 38, font: F_BODY });
};
SFX_FNS.push(() => { const b = BK.cold; sfx(b.t0 + 0.05, 'swoosh_in', 0.5); for (let i = 0; i < 7; i++) sfx(b.t0 + 0.15 + i * 0.12, 'pop', 0.22); sfx(P('D01', 0.12), 'boing', 0.3); [0.5, 0.56].forEach(f => sfx(P('D01', f), 'boing', 0.3)); sfx(P('D01', 0.62), 'impact', 0.6); sfx(P('D01', 0.66), 'stamp', 0.6); });

// ---- 引入：提交拿起来接到 main 后面；剪辑录像 ----
SC.why = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const sw = S('G01_02') - 0.2, a1 = 1 - eIO(prog(t, sw, 0.35));
  if (a1 > 0) { ctx.save(); ctx.globalAlpha = a1;
    box(700, 170, 1160, 560, 30, 'rgba(15,12,31,0.88)', '#fff', 5);
    const up = P('G01_01', 0.42), mv = P('G01_01', 0.5);
    const N = { a: { x: 800, y: 330, col: MAINC, t0: blk.t0 + 0.1, lab: 'A' }, b: { x: 960, y: 330, col: MAINC, t0: blk.t0 + 0.16, lab: 'B' },
      c: { x: 1120, y: 330, col: MAINC, t0: P('G01_01', 0.3), lab: 'C' }, d: { x: 1280, y: 330, col: MAINC, t0: P('G01_01', 0.34), lab: 'D' } };
    const E = [['a', 'b', blk.t0 + 0.16], ['b', 'c', P('G01_01', 0.3)], ['c', 'd', P('G01_01', 0.34)]];
    const f1 = moveP(t, mv, 0.6, 1120, 560, 1440, 330, 120), f2 = moveP(t, mv + 0.15, 0.6, 1280, 560, 1600, 330, 120);
    N.f1 = { x: f1[0], y: f1[1], col: f1[2] > 0.99 ? NEWC : FEATC, t0: blk.t0 + 0.3, lab: f1[2] > 0.99 ? "F1'" : 'F1' };
    N.f2 = { x: f2[0], y: f2[1], col: f2[2] > 0.99 ? NEWC : FEATC, t0: blk.t0 + 0.36, lab: f2[2] > 0.99 ? "F2'" : 'F2' };
    if (t < mv) E.push(['b', 'f1', blk.t0 + 0.3]); else if (f1[2] > 0.99) E.push(['d', 'f1', mv + 0.6]);
    E.push(['f1', 'f2', blk.t0 + 0.36]);
    drawGraph(t, N, E);
    txt('main', 800, 282, 26, MAINC, { align: 'center', font: F_CODE }); if (t < mv) txt('你的分支', 1180, 640, 26, FEATC, {});
    if (t >= up && t < mv + 1) { const s = popIn(t, up); note(1360, 470, s, '拿起来 ↻ 重新放一遍', NEWC, { fs: 36 }); }
    if (t >= mv + 0.8) { fancy('一条直线！', 1280, 620, 76, t, mv + 0.8, FX.yel); }
    pill(1280, 120, '变基 rebase · 整理提交历史', NEWC, popIn(t, blk.t0 + 0.1), { fs: 40, font: F_BODY });
    ctx.restore(); }
  if (t >= sw) { // 剪辑游戏录像
    const a = eOut(prog(t, sw, 0.35)); ctx.save(); ctx.globalAlpha = a;
    const cut = P('G01_02', 0.25), glue = P('G01_02', 0.5), done = P('G01_02', 0.75);
    const fr0 = [['开场', '#5b6ee1'], ['失误', '#cf222e'], ['碎镜头', '#a26ad9'], ['碎镜头', '#a26ad9'], ['通关', '#22a06b']];
    if (t < glue) { filmStrip(1280, 380, popIn(t, sw, 0.4), fr0.map((f, i) => [f[0], f[1], i === 1 ? 1 - clamp(prog(t, cut + 0.1, 0.3)) : 1])); if (t >= cut) bigX(1110, 380, 70, '#ff3b5c', prog(t, cut, 0.3)); }
    else filmStrip(1280, 380, 1, [['开场', '#5b6ee1'], ['精彩片段', '#a26ad9', 1, 1 + 0.15 * Math.sin(prog(t, glue, 0.4) * Math.PI)], ['通关', '#22a06b']], { fw: 230 });
    if (t >= cut && t < glue) note(1100, 560, popIn(t, cut), '✂ 失误剪掉', '#ff8a9a', { fs: 34 });
    if (t >= glue && t < done) note(1280, 560, popIn(t, glue), '碎镜头拼成一段', '#c9a6ff', { fs: 34 });
    if (t >= done) { fancy('成片一条线！', 1280, 620, 80, t, done, FX.yel); sparkle(t, done, 1280, 380, 260, 12); }
    pill(1280, 140, '🎬 剪辑游戏录像', NEWC, popIn(t, sw + 0.1), { fs: 42, font: F_BODY });
    ctx.restore(); }
};
SFX_FNS.push(() => { const b = BK.why; sfx(b.t0 + 0.1, 'pop', 0.4); sfx(P('G01_01', 0.3), 'pop', 0.3); sfx(P('G01_01', 0.42), 'pop', 0.4); sfx(P('G01_01', 0.5), 'whoosh', 0.5); sfx(P('G01_01', 0.5) + 0.6, 'ding', 0.4); sfx(P('G01_01', 0.5) + 0.8, 'sparkle', 0.4);
  sfx(S('G01_02') - 0.2, 'swoosh_in', 0.4); sfx(P('G01_02', 0.25), 'buzz', 0.4); sfx(P('G01_02', 0.5), 'whoosh', 0.4); sfx(P('G01_02', 0.75), 'sparkle', 0.5); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#a3360a', '#f76707', W * 0.6, H * 0.45, 28, 0.2);
  ['✂️', '🎬', '📼', '⏪', '✨'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  sprite('g_scissors', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 60, 1040);
  sprite('d_film', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 760);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-400, -10, 95, '#ff5c8a', '第8集', { fs: 52, rot: -0.15, fg: '#fff' });
    fancy('变基', 40, -70, 130, t, -99, FX.white);
    fancy('rebase！', 110, 80, 150, t, -99, FX.orange);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况（左侧插图，画在 80..960）----
function probMergeQ(t, blk) {
  const t0 = blk.t0; box(110, 200, 820, 500, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
  const N = { a: { x: 200, y: 330, col: MAINC, t0: t0 + 0.1 }, b: { x: 360, y: 330, col: MAINC, t0: t0 + 0.15 }, c: { x: 560, y: 330, col: MAINC, t0: t0 + 0.2 },
    f1: { x: 480, y: 540, col: FEATC, t0: t0 + 0.3 }, f2: { x: 640, y: 540, col: FEATC, t0: t0 + 0.35 }, m: { x: 800, y: 430, col: '#ffffff', t0: P('D02', 0.45), mark: '?' } };
  drawGraph(t, N, [['a', 'b', t0 + 0.15], ['b', 'c', t0 + 0.2], ['b', 'f1', t0 + 0.3], ['f1', 'f2', t0 + 0.35], ['c', 'm', P('D02', 0.45), '#fff'], ['f2', 'm', P('D02', 0.45), '#fff']]);
  txt('main', 140, 270, 28, MAINC, { font: F_CODE }); txt('我的分支', 400, 620, 28, FEATC, {});
  if (t >= P('D02', 0.7)) stamp(t, P('D02', 0.7), 520, 820, 'merge？rebase？', ACC, 56, -0.08);
}
function probPullQ(t, blk) {
  const t0 = blk.t0; const cy = browser(110, 160, 820, 640, 'github.com/dafeiyu/baifan/commits', { title: '提交记录', accent: '#5b6ee1' });
  const rows = ['Merge branch \'main\'', '加甜点菜单', 'Merge branch \'main\'', '改错字', 'Merge branch \'main\''];
  rows.forEach((r, i) => { const a = prog(t, t0 + 0.15 + i * 0.1, 0.2); if (a <= 0) return; const mg = r.startsWith('Merge'); const ry = cy + 20 + i * 86; ctx.save(); ctx.globalAlpha *= a;
    box(140, ry, 760, 72, 12, mg && t >= P('Q01', 0.4) ? '#fff0f2' : '#fff', mg && t >= P('Q01', 0.4) ? '#ff8182' : '#d0d7de', mg && t >= P('Q01', 0.4) ? 4 : 2);
    gDot(178, ry + 36, 1, mg ? KNOTC : FEATC, { r: 13 }); txt(r, 210, ry + 36, 28, '#24292f', { font: isCJK(r) ? F_BODY : F_CODE }); ctx.restore(); });
  if (U.D03 && t >= U.D03.vo + 0.3) stamp(t, U.D03.vo + 0.3, 520, 850, '每次 pull 都多一个！', BADC, 52, -0.08);
}
function probConflictQ(t, blk) {
  const t0 = blk.t0, hint = P('C01', 0.45);
  terminal(t, 110, 190, 820, 560, [
    { s: 'git rebase main', t: t0 + 0.1, cmd: true, dur: 0.5 },
    { s: '{r}CONFLICT (content):', t: t0 + 0.7 }, { s: '{r}  Merge conflict in menu.html', t: t0 + 0.75 },
    { s: '{d}hint: Resolve all conflicts manually,', t: t0 + 0.9, hl: [hint, 1e9], hlc: '#ffd23f' }, { s: '{d}hint: mark them with "git add",', t: t0 + 0.95, hl: [hint, 1e9], hlc: '#ffd23f' },
    { s: '{y}hint: then run "git rebase --continue".', t: t0 + 1.0, hl: [hint, 1e9], hlc: '#ffd23f' }], { title: '终端 — 变基停下了', accent: BADC, fs: 26, prompt: false });
  if (t >= hint) note(520, 800, popIn(t, hint), '👀 下一步写在这里', '#ffd23f', { fs: 38 });
  else if (t >= t0 + 0.8) stamp(t, t0 + 0.8, 560, 820, '冲突了！', BADC, 70, -0.08);
}
function probSquashQ(t, blk) {
  const t0 = blk.t0; const cs = [['甜点菜单', '#ff9fb2'], ['改改', '#ffd36b'], ['再改', '#8fd3ff'], ['真的好了', '#c9a6ff']];
  cs.forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12, 0.4); if (s <= 0) return; const sq = t >= P('B01', 0.45) ? 0.06 * Math.sin(t * 7 + i) : 0;
    ctx.save(); ctx.translate(520, 640 - i * 125); ctx.rotate((i % 2 ? 0.04 : -0.04) + sq); ctx.scale(s, s); box(-240, -52, 480, 104, 18, c[1], '#1b1433', 5); gDot(-190, 0, 1, FEATC, { r: 18 }); txt(c[0], -150, 2, 38, '#1b1433', {}); ctx.restore(); });
  if (t >= P('B01', 0.45)) { const s = popIn(t, P('B01', 0.45)); txt('4 → 1 ?', 640, 170, 64 * s, ACC, { align: 'center', font: F_FANCY, bold: false }); }
  if (U.D05 && t >= U.D05.vo + 0.3) stamp(t, U.D05.vo + 0.3, 520, 830, '碎成渣了…', '#a855f7', 60, -0.08);
}
function probRewordQ(t, blk) {
  const t0 = blk.t0; const cy = browser(110, 170, 820, 560, 'git log --oneline', { title: '终端里的历史', accent: '#a855f7' });
  [['e5f6a7', '加饮料菜单'], ['c3d4e5', '调整配色'], ['b2c3d4', '2024 新菜单上线'], ['a1b2c3', '第一次上线']].forEach((c, i) => { const a = prog(t, t0 + 0.15 + i * 0.1, 0.2); if (a <= 0) return; const bad = i === 2 && t >= P('M01', 0.5); const ry = cy + 24 + i * 96;
    ctx.save(); ctx.globalAlpha *= a; box(140, ry, 760, 80, 12, bad ? '#fff0f2' : '#fff', bad ? '#ff8182' : '#d0d7de', bad ? 4 : 2); txt(c[0], 166, ry + 40, 26, '#9a6700', { font: F_CODE }); txt(c[1], 320, ry + 40, 30, bad ? BADC : '#24292f', {}); ctx.restore(); });
  if (t >= P('M01', 0.5)) { const s = popIn(t, P('M01', 0.5)); txt('← 三个之前', 860, cy + 260, 26 * s, BADC, { align: 'right' }); }
  if (U.D06 && t >= U.D06.vo + 0.3) stamp(t, U.D06.vo + 0.3, 520, 830, 'amend 够不着！', '#a855f7', 58, -0.08);
}
function probForceQ(t, blk) {
  const t0 = blk.t0, fp = P('X01', 0.55);
  terminal(t, 110, 190, 820, 360, [{ s: 'git push', t: t0 + 0.1, cmd: true, dur: 0.3 }, { s: '{r} ! [rejected] dessert -> dessert', t: t0 + 0.5 }, { s: '{r}   (non-fast-forward)', t: t0 + 0.55 },
    { s: 'git push --force', t: fp, cmd: true, dur: 0.4 }], { title: '终端', accent: BADC, fs: 28, prompt: false });
  if (t >= fp) { const s = popIn(t, fp + 0.3, 0.4); ctx.save(); ctx.translate(330, 700); ctx.scale(s, s); ctx.fillStyle = '#ff3b5c'; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.stroke(); txt('FORCE', 0, 2, 40, '#fff', { align: 'center', font: F_CODE }); ctx.restore(); }
  if (U.D07 && t >= U.D07.vo) { [['千问', 'Q'], ['Kimi', 'K']].forEach((q, i) => { const s = popIn(t, U.D07.vo + 0.1 + i * 0.1); if (s > 0) { avatar(q[1], 640 + i * 170, 700, 56, { s }); if (t >= U.D07.vo + 0.5) txt('💦', 680 + i * 170, 640, 44, '#000', { font: EMOJI, bold: false }); } });
    stamp(t, U.D07.vo + 0.4, 600, 860, '队友的提交！', BADC, 56, -0.08); }
}
function probRescueQ(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.15, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 470); ctx.scale(s, s); ctx.rotate(-0.03);
  box(-380, -250, 760, 500, 22, '#fff7e6', '#7a4b1f', 8); box(-12, -250, 24, 500, 0, '#c8a27a'); txt('📔 reflog 日记', -350, -205, 34, '#7a4b1f', {});
  ['HEAD@{0}: rebase (finish)', 'HEAD@{1}: rebase (pick)', 'HEAD@{4}: rebase (start)', 'HEAD@{5}: commit: 真的好了'].forEach((l, i) => { const a = clamp(prog(t, P('K01', 0.3 + i * 0.1), 0.2)); ctx.save(); ctx.globalAlpha *= a; const hot = i === 3 && t >= P('K01', 0.75);
    if (hot) box(-360, -150 + i * 92, 720, 70, 10, 'rgba(255,210,63,0.45)'); txt(l, -340, -115 + i * 92, 28, '#3b2a14', { font: isCJK(l) ? F_BODY : F_CODE, max: 680 }); ctx.restore(); });
  ctx.restore();
  if (U.D08 && t >= U.D08.vo + 0.2) fancy('每一步都记着！', 520, 840, 70, t, U.D08.vo + 0.2, FX.green);
}
function probAsk8(t, blk) {
  const t0 = blk.t0;
  [['🔗 接', MAINC], ['✂️ 剪', ACC], ['🛡️ 守', OKC]].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s > 0) { ctx.save(); ctx.translate(250 + i * 270, 480); ctx.scale(s, s); ctx.rotate((i - 1) * 0.06); box(-110, -140, 220, 280, 24, '#fff', c[1], 8); txt(c[0], 0, 0, 52, '#1b1433', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); } });
  if (t >= t0 + 0.6) txt('三个重点', 520, 760, 64, ACC, { align: 'center', font: F_FANCY, bold: false });
}
function probAskP(t, blk) {
  const t0 = blk.t0; box(110, 200, 820, 520, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
  const N = { a: { x: 200, y: 330, col: MAINC, t0: t0 + 0.1 }, b: { x: 340, y: 330, col: MAINC, t0: t0 + 0.14 }, c: { x: 600, y: 330, col: MAINC, t0: t0 + 0.18 }, d: { x: 800, y: 330, col: MAINC, t0: t0 + 0.22 } };
  const E = [['a', 'b', t0 + 0.14], ['b', 'c', t0 + 0.18], ['c', 'd', t0 + 0.22]];
  ['甜点', '改改', '再改', '好了'].forEach((l, i) => { N['f' + i] = { x: 340 + (i + 1) * 120, y: 560 + (i % 2) * 40, col: FEATC, t0: t0 + 0.3 + i * 0.08, lab: l, fs: 22 }; E.push([i ? 'f' + (i - 1) : 'b', 'f' + i, t0 + 0.3 + i * 0.08]); });
  drawGraph(t, N, E); txt('main', 140, 270, 28, MAINC, { font: F_CODE }); txt('dessert 分支', 380, 680, 26, FEATC, {});
  ['✂️', '✨'].forEach((e, i) => { const p = popIn(t, t0 + 0.5 + i * 0.12); if (p > 0) txt(e, 300 + i * 440, 850, 90 * p, '#000', { align: 'center', font: EMOJI, bold: false }); });
}
const PROB = {
  mergeQ: { chap: ['第①步', '变基是什么', ACC, F_BODY], q: '有啥区别？', bg: ['#ffe6d6', '#ffcaa8'], draw: probMergeQ },
  pullQ: { chap: ['第②步', 'pull 也能变基', '#5b6ee1', F_BODY], q: '我自动生成的…', bg: ['#e3e6ff', '#c9cff9'], draw: probPullQ },
  conflictQ: { chap: ['踩坑①', '变基冲突', BADC, F_BODY], q: '是不是全完了？', bg: ['#ffe0e4', '#ffbcc6'], draw: probConflictQ },
  squashQ: { chap: ['第③步', '合并碎提交', '#ff9f43', F_BODY], q: '我也是！', bg: ['#fff0d6', '#ffdcab'], draw: probSquashQ },
  rewordQ: { chap: ['第④步', '改旧说明', '#a855f7', F_BODY], q: 'amend 不行？', bg: ['#eadfff', '#d6c4ff'], draw: probRewordQ },
  forceQ: { chap: ['踩坑②', '强推冲掉队友', '#e03131', F_BODY], q: '等等！', bg: ['#ffe3e3', '#ffc9c9'], draw: probForceQ },
  rescueQ: { chap: ['救命', '变基搞砸了', '#7a4b1f', F_BODY], q: '真的能回去？', bg: ['#fff3db', '#ffe2a8'], draw: probRescueQ },
  ask8: { chap: ['复习', '接 · 剪 · 守', ACC, F_BODY], q: '帮我划重点！', bg: ['#ffe6d6', '#ffcaa8'], draw: probAsk8 },
  askP: { chap: ['实战', '剪干净甜点分支', '#ff7a3d', F_BODY], q: '现在就剪！', bg: ['#ffe6d6', '#ffcaa8'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  sfx(BK.mergeQ.t0 + 0.3, 'pop', 0.3); sfx(P('D02', 0.45), 'pop', 0.4); sfx(P('D02', 0.7), 'stamp', 0.6);
  for (let i = 0; i < 5; i++) sfx(BK.pullQ.t0 + 0.15 + i * 0.1, 'pop', 0.2); sfx(P('Q01', 0.4), 'buzz', 0.4); sfx(U.D03.vo + 0.3, 'stamp', 0.6);
  typeSfx(BK.conflictQ.t0 + 0.1, 15, 0.5); sfx(BK.conflictQ.t0 + 0.7, 'buzz', 0.5); sfx(BK.conflictQ.t0 + 0.8, 'stamp', 0.6); sfx(P('C01', 0.45), 'ding', 0.5);
  for (let i = 0; i < 4; i++) sfx(BK.squashQ.t0 + 0.15 + i * 0.12, 'pop', 0.3); sfx(P('B01', 0.45), 'boing', 0.4); sfx(U.D05.vo + 0.3, 'stamp', 0.6);
  sfx(P('M01', 0.5), 'buzz', 0.5); sfx(U.D06.vo + 0.3, 'stamp', 0.6);
  typeSfx(BK.forceQ.t0 + 0.1, 8, 0.3); sfx(BK.forceQ.t0 + 0.5, 'buzz', 0.5); typeSfx(P('X01', 0.55), 16, 0.4); sfx(P('X01', 0.55) + 0.3, 'impact', 0.5); sfx(U.D07.vo + 0.4, 'stamp', 0.6);
  sfx(BK.rescueQ.t0 + 0.15, 'pop', 0.4); for (let i = 0; i < 4; i++) sfx(P('K01', 0.3 + i * 0.1), 'pop', 0.2); sfx(P('K01', 0.75), 'ding', 0.4); sfx(U.D08.vo + 0.2, 'sparkle', 0.4);
  [0, 1, 2].forEach(i => sfx(BK.ask8.t0 + 0.15 + i * 0.12, 'pop', 0.3)); sfx(BK.askP.t0 + 0.15, 'pop', 0.4);
});

// ---- 讲解①：merge 打结 vs rebase 一条线 ----
SC.basics = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G02_01'), rb = P('G02_01', 0.55);
  [[690, 'merge 合并', KNOTC, g1 + 0.05], [1290, 'rebase 变基', NEWC, rb]].forEach((p, i) => { const s = popIn(t, p[3], 0.4); if (s <= 0) return;
    ctx.save(); ctx.translate(p[0] + 285, 350); ctx.scale(s, s); ctx.translate(-p[0] - 285, -350); box(p[0], 140, 570, 420, 26, 'rgba(15,12,31,0.9)', p[2], 5); txt(p[1], p[0] + 285, 186, 36, p[2], { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); });
  const k1 = P('G02_01', 0.12);
  const NM = { a: { x: 740, y: 300, col: MAINC, t0: k1 }, b: { x: 860, y: 300, col: MAINC, t0: k1 + 0.05 }, c: { x: 1000, y: 300, col: MAINC, t0: k1 + 0.1 },
    f1: { x: 960, y: 440, col: FEATC, t0: k1 + 0.15 }, f2: { x: 1080, y: 440, col: FEATC, t0: k1 + 0.2 }, m: { x: 1180, y: 300, col: KNOTC, t0: P('G02_01', 0.3), mark: 'M', glow: t < P('G02_01', 0.5) } };
  if (t >= g1) drawGraph(t, NM, [['a', 'b', k1 + 0.05], ['b', 'c', k1 + 0.1], ['b', 'f1', k1 + 0.15], ['f1', 'f2', k1 + 0.2], ['c', 'm', P('G02_01', 0.3)], ['f2', 'm', P('G02_01', 0.3)]], { r: 20 });
  if (t >= P('G02_01', 0.33)) note(975, 520, popIn(t, P('G02_01', 0.33)), '🪢 多一个合并提交', '#ff8a9a', { fs: 30 });
  if (t >= rb) { const k = rb + 0.1; const NR = { a: { x: 1340, y: 300, col: MAINC, t0: k }, b: { x: 1450, y: 300, col: MAINC, t0: k + 0.05 }, c: { x: 1560, y: 300, col: MAINC, t0: k + 0.1 },
      f1: { x: 1680, y: 300, col: NEWC, t0: k + 0.3, lab: "F1'", fs: 20 }, f2: { x: 1800, y: 300, col: NEWC, t0: k + 0.38, lab: "F2'", fs: 20 } };
    drawGraph(t, NR, [['a', 'b', k + 0.05], ['b', 'c', k + 0.1], ['c', 'f1', k + 0.3], ['f1', 'f2', k + 0.38]], { r: 20 });
    if (t >= P('G02_01', 0.78)) note(1575, 470, popIn(t, P('G02_01', 0.78)), '➖ 不留结 · 一条线', NEWC, { fs: 30 }); }
  const g2 = S('G02_02'), g3 = S('G02_03');
  cmdBar(t, 1270, 690, 'git switch dessert', P('G02_02', 0.12), 0.45, { out: P('G02_02', 0.48), fs: 38 });
  cmdBar(t, 1270, 690, 'git rebase main', P('G02_02', 0.5), 0.45, { out: g3 - 0.1, fs: 38, col: ACC });
  if (t >= P('G02_02', 0.12) && t < g3) note(1270, 800, popIn(t, P('G02_02', 0.12)), t < P('G02_02', 0.5) ? '① 先切到自己的分支' : '② 接到 main 最新的后面', '#ffd23f', { fs: 32 });
  if (t >= g3) { const s = popIn(t, g3, 0.4); ctx.save(); ctx.translate(1190, 720); ctx.scale(s, s);
    box(-430, -80, 860, 160, 24, '#fffaf0', '#1b1433', 6); gDot(-370, 0, 1, FEATC, { r: 22 });
    const fl = flipText(t, [[-1, 'a1b2c3'], [P('G02_03', 0.25), '9f8e7d']]); ctx.save(); ctx.translate(-220, 0); ctx.scale(1, fl.sc); txt(fl.s, 0, 0, 48, fl.fresh || t >= P('G02_03', 0.25) ? '#e8590c' : '#9a6700', { align: 'center', font: F_CODE }); ctx.restore();
    txt('改了甜点菜单', 170, 0, 40, '#1b1433', { align: 'center' }); txt('编号变了', -220, -58, 22, BADC, { align: 'center' }); txt('内容不变', 170, -58, 22, OKC, { align: 'center' }); ctx.restore();
    if (t >= P('G02_03', 0.6)) fancy('是新提交！', 1190, 880, 64, t, P('G02_03', 0.6), FX.orange); }
};
SFX_FNS.push(() => { const k1 = P('G02_01', 0.12); sfx(S('G02_01') + 0.05, 'pop', 0.4); for (let i = 0; i < 5; i++) sfx(k1 + i * 0.05, 'pop', 0.2); sfx(P('G02_01', 0.3), 'buzz', 0.4); sfx(P('G02_01', 0.33), 'pop', 0.3);
  sfx(P('G02_01', 0.55), 'pop', 0.4); sfx(P('G02_01', 0.55) + 0.3, 'whoosh', 0.3); sfx(P('G02_01', 0.78), 'ding', 0.4);
  typeSfx(P('G02_02', 0.12), 18, 0.45); typeSfx(P('G02_02', 0.5), 15, 0.45); sfx(S('G02_03'), 'pop', 0.4); sfx(P('G02_03', 0.25), 'whoosh', 0.4); sfx(P('G02_03', 0.6), 'stamp', 0.5); });

// ---- 讲解②：git pull --rebase（千问）----
SC.pull = (t, blk, en) => {
  bgLecture(t, '#5b6ee1'); lecturer(t, blk, en, blk.t0);
  const g2 = S('G03_02'), g3 = S('G03_03'), g4 = S('G03_04') - 0.15, mv = P('G03_02', 0.42);
  if (t < g4 + 0.3) { const a = popIn(t, blk.t0 + 0.05, 0.4) * (1 - prog(t, g4, 0.3)) * (t >= g3 ? 1 - 0.6 * prog(t, g3, 0.3) : 1); ctx.save(); ctx.globalAlpha *= clamp(a);
    box(690, 130, 1170, 480, 26, 'rgba(15,12,31,0.9)', '#fff', 5); txt('☁️ 云端', 720, 190, 30, MAINC, {}); txt('💻 本地', 720, 470, 30, FEATC, {});
    const l = moveP(t, mv, 0.6, 1170, 470, 1400, 330, 100); const merged = t >= P('G03_01', 0.55) && t < g2 + 0.2;
    const N = { a: { x: 860, y: 330, col: MAINC, lab: 'A' }, b: { x: 1010, y: 330, col: MAINC, lab: 'B' }, c: { x: 1170, y: 330, col: MAINC, t0: P('G03_01', 0.12), lab: '云端新提交', up: true, fs: 22 },
      l: { x: l[0], y: l[1], col: l[2] > 0.99 ? NEWC : FEATC, t0: P('G03_01', 0.25), lab: l[2] > 0.99 ? '你的提交（放到后面）' : '你的新提交', fs: 22, max: 300 } };
    const E = [['a', 'b', -1], ['b', 'c', P('G03_01', 0.12)]];
    if (t < mv) E.push(['b', 'l', P('G03_01', 0.25)]); else if (l[2] > 0.99) E.push(['c', 'l', mv + 0.6]);
    if (merged) { N.m = { x: 1370, y: 330, col: KNOTC, t0: P('G03_01', 0.55), mark: 'M', glow: true }; E.push(['c', 'm', P('G03_01', 0.55)], ['l', 'm', P('G03_01', 0.55)]); }
    drawGraph(t, N, E, { r: 22 });
    if (merged && t >= P('G03_01', 0.62)) stamp(t, P('G03_01', 0.62), 1560, 480, 'Merge branch…', KNOTC, 40, -0.08);
    if (t >= mv + 0.7 && t < g3) fancy('还是一条线！', 1270, 560, 64, t, mv + 0.7, FX.yel);
    ctx.restore(); }
  if (t >= S('G03_01') && t < g2) cmdBar(t, 1270, 720, 'git pull', P('G03_01', 0.4), 0.3, { fs: 40 });
  cmdBar(t, 1270, 720, 'git pull --rebase', P('G03_02', 0.08), 0.5, { out: g3 - 0.1, fs: 40, col: ACC });
  cmdBar(t, 1270, 720, 'git config --global pull.rebase true', P('G03_03', 0.25), 0.8, { out: g4, fs: 32, col: ACC });
  if (t >= P('G03_03', 0.75) && t < g4) stamp(t, P('G03_03', 0.75), 1270, 850, '以后拉取默认变基 ✓', OKC, 54, -0.06);
  if (t >= g4) { const a = eOut(prog(t, g4, 0.3)); const er = P('G03_04', 0.12);
    terminal(t, 700, 150, 1150, 330, [{ s: 'git pull --rebase', t: g4 + 0.05, cmd: true, dur: 0.35 }, { s: '{r}error: cannot pull with rebase:', t: er }, { s: '{r}You have unstaged changes.', t: er + 0.05 }], { title: '终端', accent: BADC, fs: 32, alpha: a, prompt: false });
    [['① git commit', '先提交', P('G03_04', 0.35)], ['② git stash → pull → stash pop', '收起来，拉完再拿出来', P('G03_04', 0.55)]].forEach((c, i) => { const s = popIn(t, c[2], 0.4); if (s <= 0) return;
      ctx.save(); ctx.translate(1275, 580 + i * 140); ctx.scale(s, s); box(-560, -55, 1120, 110, 20, '#fffaf0', i ? '#a855f7' : OKC, 6); txt(c[0], -530, 0, 34, '#1b1433', { font: F_CODE }); txt(c[1], 530, 0, 30, i ? '#7a3fc4' : OKC, { align: 'right' }); ctx.restore(); }); }
  guest(t, blk);
  if (t >= P('Q02', 0.6)) stamp(t, P('Q02', 0.6), 1180, 520, '一眼看懂 ✓', '#22c08b', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['Q02']); const b = BK.pull; sfx(b.t0 + 0.05, 'pop', 0.4); sfx(P('G03_01', 0.12), 'pop', 0.3); sfx(P('G03_01', 0.25), 'pop', 0.3); typeSfx(P('G03_01', 0.4), 8, 0.3); sfx(P('G03_01', 0.55), 'buzz', 0.4); sfx(P('G03_01', 0.62), 'stamp', 0.5);
  typeSfx(P('G03_02', 0.08), 17, 0.5); sfx(P('G03_02', 0.42), 'whoosh', 0.5); sfx(P('G03_02', 0.42) + 0.7, 'ding', 0.4); typeSfx(P('G03_03', 0.25), 36, 0.8); sfx(P('G03_03', 0.75), 'stamp', 0.5);
  sfx(S('G03_04') - 0.15, 'swoosh_in', 0.4); typeSfx(S('G03_04') - 0.1, 17, 0.35); sfx(P('G03_04', 0.12), 'buzz', 0.5); sfx(P('G03_04', 0.35), 'pop', 0.4); sfx(P('G03_04', 0.55), 'pop', 0.4); sfx(P('Q02', 0.6), 'stamp', 0.7); });

// ---- 讲解③：变基冲突（Claude：先读提示）----
SC.conflict = (t, blk, en) => {
  bgLecture(t, BADC); lecturer(t, blk, en, blk.t0);
  const a0 = popIn(t, blk.t0 + 0.05, 0.4); ctx.save(); ctx.globalAlpha *= a0;
  box(690, 120, 1170, 270, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
  const cf = P('G04_01', 0.2), cont = P('G04_01', 0.8), ab = P('G04_02', 0.5);
  const fly = [P('G04_01', 0.06), P('G04_01', 0.14), cont + 0.1, cont + 0.25];
  const N = { a: { x: 760, y: 200, col: MAINC }, b: { x: 880, y: 200, col: MAINC }, c: { x: 1000, y: 200, col: MAINC, lab: 'main', fs: 22 } }; const E = [['a', 'b', -1], ['b', 'c', -1]];
  ['f1', 'f2', 'f3', 'f4'].forEach((k, i) => { const x = 1160 + i * 170; let p = moveP(t, fly[i], 0.4, x, 320, x, 200, 60); if (t >= ab) p = moveP(t, ab + 0.15 + i * 0.05, 0.4, p[0], 200, x, 320, -40).map((v, j) => j === 2 ? 1 - v : v);
    const placed = p[2] > 0.99, stuck = i === 1 && t >= cf && t < cont;
    N[k] = { x: p[0], y: p[1], col: stuck ? KNOTC : placed ? NEWC : FEATC, ghost: !placed && t < ab, lab: (placed ? k.toUpperCase() + "'" : k.toUpperCase()), fs: 20, glow: stuck };
    if (placed) E.push([i ? ['f1', 'f2', 'f3'][i - 1] : 'c', k, fly[i] + 0.4]); });
  drawGraph(t, N, E, { r: 20 });
  if (t >= cf && t < cont) { stamp(t, cf, 1600, 165, 'CONFLICT 停下！', BADC, 40, -0.06); }
  if (t >= S('G04_02') - 0.1 && t < ab) pill(1560, 160, '每个提交都放一遍 · 可能停好几次', '#ffd23f', popIn(t, S('G04_02') - 0.1), { fs: 28, font: F_BODY });
  if (t >= ab + 0.6) note(1470, 160, popIn(t, ab + 0.6), '⏪ 回到变基之前', '#7cf07a', { fs: 32 });
  ctx.restore();
  const ed = P('G04_01', 0.28), fix = P('G04_01', 0.5), g2 = S('G04_02') - 0.15;
  if (t >= ed && t < g2 + 0.3) { const a = eOut(prog(t, ed, 0.3)) * (1 - prog(t, g2, 0.3));
    const L = t < fix ? [{ s: '<<<<<<< HEAD', t: -1, bad: true, vcol: '#ff9aa9' }, { s: '  <li>芒果布丁</li>', t: -1, vcol: '#ffd27a' }, { s: '=======', t: -1, bad: true, vcol: '#ff9aa9' }, { s: '  <li>草莓蛋糕</li>', t: -1, vcol: '#ffd27a' }, { s: '>>>>>>> 甜点菜单', t: -1, bad: true, vcol: '#ff9aa9' }]
      : [{ s: '  <li>芒果布丁</li>', t: -1, good: true, vcol: '#ffd27a' }, { s: '  <li>草莓蛋糕</li>', t: -1, good: true, vcol: '#ffd27a' }];
    ymlEditor(t, 690, 420, 700, 400, 'menu.html', L, { fs: 28, accent: BADC, alpha: a });
    if (t >= fix && t < cont + 0.5) note(1040, 780, popIn(t, fix), '两边都留下 ✓', '#7cf07a', { fs: 30 });
    terminal(t, 1420, 420, 440, 400, [{ s: 'git add menu.html', t: P('G04_01', 0.62), cmd: true, dur: 0.35 }, { s: 'git rebase', t: P('G04_01', 0.76), cmd: true, dur: 0.2 }, { s: '  --continue', t: P('G04_01', 0.8), cmd: true, dur: 0.2 }, { s: '{g}Successfully rebased.', t: cont + 0.45 }], { title: '终端', accent: BADC, fs: 26, alpha: a, prompt: false }); }
  if (t >= g2) { const a = eOut(prog(t, g2, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    const s = popIn(t, P('G04_02', 0.45), 0.4); ctx.save(); ctx.translate(1270, 600); ctx.scale(s, s); box(-330, -90, 660, 180, 40, '#2a2350', '#ff6b81', 7); txt('git rebase --abort', 0, -10, 46, '#fff', { align: 'center', font: F_CODE }); txt('一键放弃 · 回到原样', 0, 52, 28, '#ffb3c0', { align: 'center' }); ctx.restore();
    if (t >= P('G04_02', 0.1) && t < P('G04_02', 0.45)) fancy('实在乱了？', 1270, 600, 70, t, P('G04_02', 0.1), FX.red);
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('C02', 0.6)) stamp(t, P('C02', 0.6), 1180, 520, '批准 ✓', '#22c08b', 90, -0.12);
};
SFX_FNS.push(() => { guestSfx(['C02']); const b = BK.conflict; sfx(b.t0 + 0.05, 'pop', 0.4); [P('G04_01', 0.06), P('G04_01', 0.14)].forEach(x => sfx(x, 'whoosh', 0.3)); sfx(P('G04_01', 0.2), 'buzz', 0.6); sfx(P('G04_01', 0.2), 'stamp', 0.5);
  sfx(P('G04_01', 0.28), 'swoosh_in', 0.4); sfx(P('G04_01', 0.5), 'ding', 0.4); typeSfx(P('G04_01', 0.62), 17, 0.35); typeSfx(P('G04_01', 0.76), 10, 0.2); typeSfx(P('G04_01', 0.8), 12, 0.2);
  const c = P('G04_01', 0.8); sfx(c + 0.1, 'whoosh', 0.3); sfx(c + 0.25, 'whoosh', 0.3); sfx(c + 0.45, 'ding', 0.5);
  sfx(P('G04_02', 0.1), 'buzz', 0.3); sfx(P('G04_02', 0.45), 'pop', 0.5); sfx(P('G04_02', 0.5) + 0.15, 'whoosh', 0.5); sfx(P('G04_02', 0.5) + 0.6, 'ding', 0.4); sfx(P('C02', 0.6), 'stamp', 0.8); });

// ---- 讲解④：交互式变基合并碎提交（豆包）----
const SQ_ROWS = [['a1b2c3', '甜点菜单'], ['b2c3d4', '改改'], ['c3d4e5', '再改'], ['d4e5f6', '真的好了']];
SC.squash = (t, blk, en) => {
  bgLecture(t, '#ff9f43'); lecturer(t, blk, en, blk.t0);
  const op = P('G05_01', 0.4), g3 = S('G05_03') - 0.15, g4 = S('G05_04') - 0.15;
  cmdBar(t, 1270, 170, 'git rebase -i HEAD~4', P('G05_01', 0.05), 0.5, { out: g3, fs: 38, col: ACC });
  if (t >= op && t < g3 + 0.3) { const a = eOut(prog(t, op, 0.3)) * (1 - prog(t, g3, 0.3));
    const rows = SQ_ROWS.map((r, i) => ({ cmd: 'pick', hash: r[0], msg: r[1], t: op + 0.1 + i * 0.08, to: i === 1 ? [[P('G05_02', 0.3), 'squash']] : i >= 2 ? [[P('G05_02', 0.55 + (i - 2) * 0.06), 'fixup']] : [], hl: i === 0 ? [S('G05_02'), P('G05_02', 0.28)] : null }));
    todoList(t, 700, 270, 1150, rows, { fs: 34, alpha: a, foot: '# 改 pick 就行，保存关掉编辑器' });
    if (t >= P('G05_01', 0.75) && t < S('G05_02')) note(1275, 760, popIn(t, P('G05_01', 0.75)), '最近四个提交 · 一行一个', '#ffd23f', { fs: 34 });
    const nt = [[S('G05_02'), P('G05_02', 0.3), '第一行留着 pick', CMDC.pick], [P('G05_02', 0.3), P('G05_02', 0.55), 'squash：压进上一个，说明合在一起', CMDC.squash], [P('G05_02', 0.55), g3, 'fixup：也压进去，说明直接丢掉', CMDC.fixup]];
    ctx.save(); ctx.globalAlpha *= a; nt.forEach(n => { if (t >= n[0] && t < n[1]) note(1275, 790, popIn(t, n[0]), n[2], n[3], { fs: 34 }); }); ctx.restore(); }
  if (t >= g3 && t < g4 + 0.3) { const a = eOut(prog(t, g3, 0.3)) * (1 - prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    const m = eIO(prog(t, P('G05_03', 0.15), 0.5)), one = t >= P('G05_03', 0.4);
    if (!one) SQ_ROWS.forEach((r, i) => { const x = lerp(810 + i * 300, 1270, m), y = lerp(330, 420, m); ctx.save(); ctx.translate(x, y); ctx.rotate((i - 1.5) * 0.05 * (1 - m)); box(-130, -50, 260, 100, 18, ['#ff9fb2', '#ffd36b', '#8fd3ff', '#c9a6ff'][i], '#1b1433', 5); txt(r[1], 0, 2, 32, '#1b1433', { align: 'center' }); ctx.restore(); });
    else { const s = eBack(prog(t, P('G05_03', 0.4), 0.4)); ctx.save(); ctx.translate(1270, 420); ctx.scale(s, s); box(-330, -70, 660, 140, 24, '#fffaf0', '#ff9f43', 8); gDot(-270, 0, 1, NEWC, { r: 26 }); txt('添加甜点菜单', 20, 2, 50, '#1b1433', { align: 'center' }); ctx.restore(); sparkle(t, P('G05_03', 0.4), 1270, 420, 300, 12); }
    if (t >= P('G05_03', 0.6)) note(1270, 600, popIn(t, P('G05_03', 0.6)), '✍️ 再写一句像样的说明', '#ffd23f', { fs: 36 });
    if (t >= P('G05_03', 0.4)) fancy('四合一！', 1270, 200, 84, t, P('G05_03', 0.4), FX.orange);
    ctx.restore(); }
  if (t >= g4) { const a = eOut(prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    todoList(t, 700, 150, 560, SQ_ROWS.map(r => ({ cmd: 'pick', hash: r[0], msg: r[1] })), { fs: 24, title: '变基清单' });
    terminal(t, 1300, 150, 560, 370, [{ s: '{y}d4e5f6 {w}真的好了', t: -1 }, { s: '{y}c3d4e5 {w}再改', t: -1 }, { s: '{y}b2c3d4 {w}改改', t: -1 }, { s: '{y}a1b2c3 {w}甜点菜单', t: -1 }], { title: 'git log --oneline', accent: '#5b6ee1', fs: 26, prompt: false });
    const s1 = popIn(t, P('G05_04', 0.3)), s2 = popIn(t, P('G05_04', 0.45));
    note(980, 600, s1, '⬆ 最上面 = 最早', CMDC.pick, { fs: 34 }); note(1580, 600, s2, '⬆ 最上面 = 最新', '#c9a6ff', { fs: 34 });
    if (t >= P('G05_04', 0.6)) fancy('顺序相反！', 1270, 760, 76, t, P('G05_04', 0.6), FX.yel);
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('B02', 0.5)) stamp(t, P('B02', 0.5), 1180, 520, '干净得能照镜子！', '#ff9f43', 64, -0.1);
};
SFX_FNS.push(() => { guestSfx(['B02']); typeSfx(P('G05_01', 0.05), 20, 0.5); sfx(P('G05_01', 0.4), 'swoosh_in', 0.4); for (let i = 0; i < 4; i++) sfx(P('G05_01', 0.4) + 0.1 + i * 0.08, 'pop', 0.2); sfx(P('G05_01', 0.75), 'pop', 0.3);
  sfx(P('G05_02', 0.3), 'click', 0.6); sfx(P('G05_02', 0.55), 'click', 0.6); sfx(P('G05_02', 0.61), 'click', 0.6);
  sfx(S('G05_03') - 0.15, 'swoosh_in', 0.4); sfx(P('G05_03', 0.15), 'whoosh', 0.5); sfx(P('G05_03', 0.4), 'impact', 0.5); sfx(P('G05_03', 0.4), 'sparkle', 0.5); sfx(P('G05_03', 0.6), 'pop', 0.3);
  sfx(S('G05_04') - 0.15, 'swoosh_in', 0.4); sfx(P('G05_04', 0.3), 'pop', 0.4); sfx(P('G05_04', 0.45), 'pop', 0.4); sfx(P('G05_04', 0.6), 'ding', 0.4); sfx(P('B02', 0.5), 'stamp', 0.7); });

// ---- 讲解⑤：reword / drop / 调顺序（Gemini）----
SC.reword = (t, blk, en) => {
  bgLecture(t, '#a855f7'); lecturer(t, blk, en, blk.t0);
  const rw = P('G06_01', 0.35), ed = P('G06_01', 0.62), fx = P('G06_01', 0.8), g2 = S('G06_02') - 0.1, dr = P('G06_02', 0.2), sw = P('G06_02', 0.55);
  const swp = eIO(prog(t, sw, 0.45));
  const rows = [{ cmd: 'pick', hash: 'b2c3d4', msg: t >= fx ? '2026 新菜单上线' : '2024 新菜单上线', to: [[rw, 'reword']], hl: [S('G06_01'), rw] },
    { cmd: 'pick', hash: 'c3d4e5', msg: '调整配色', row: () => lerp(1, 2, swp) }, { cmd: 'pick', hash: 'e5f6a7', msg: '加饮料菜单', row: () => lerp(2, 1, swp) },
    { cmd: 'pick', hash: 'f6a7b8', msg: '临时测试', to: [[dr, 'drop']], gone: dr + 0.4 }];
  todoList(t, 700, 140, 1150, rows, { fs: 34, alpha: popIn(t, blk.t0 + 0.05, 0.4), title: 'git-rebase-todo（还是那张清单）' });
  if (t >= ed && t < g2 + 0.3) { const a = eOut(prog(t, ed, 0.3)) * (1 - prog(t, g2, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    win(800, 560, 950, 230, '📝 COMMIT_EDITMSG', '#a855f7', { bg: '#1b1730' }); const fl = flipText(t, [[-1, '2024'], [fx, '2026']]);
    ctx.save(); ctx.translate(900, 690); ctx.scale(1, fl.sc); txt(fl.s, 0, 0, 52, t >= fx ? '#7cf07a' : '#ff6b81', { font: F_CODE }); ctx.restore(); txt('新菜单上线', 1040, 690, 52, '#ece9f7', {});
    if (t >= fx) stamp(t, fx + 0.1, 1600, 640, '重写 ✓', OKC, 44, -0.1); ctx.restore(); }
  if (t >= g2) { const a = eOut(prog(t, g2, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    if (t >= dr && t < sw) note(1275, 680, popIn(t, dr), '✂ drop：整个提交删掉', CMDC.drop, { fs: 36 });
    if (t >= sw) { note(1275, 680, popIn(t, sw), '↕ 挪动行 = 调换提交顺序', '#ffd23f', { fs: 36 }); if (t < sw + 0.6) arrow(1820, 330, 1820, 400, '#ffd23f', prog(t, sw, 0.3), 10); }
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('M02', 0.55)) stamp(t, P('M02', 0.55), 1180, 520, '年份对了 ✓', '#a855f7', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['M02']); const b = BK.reword; sfx(b.t0 + 0.05, 'pop', 0.4); sfx(P('G06_01', 0.35), 'click', 0.6); sfx(P('G06_01', 0.62), 'swoosh_in', 0.4); sfx(P('G06_01', 0.8), 'whoosh', 0.4); sfx(P('G06_01', 0.8) + 0.1, 'stamp', 0.5);
  sfx(P('G06_02', 0.2), 'click', 0.6); sfx(P('G06_02', 0.2) + 0.4, 'buzz', 0.3); sfx(P('G06_02', 0.55), 'whoosh', 0.5); sfx(P('M02', 0.55), 'stamp', 0.7); });

// ---- 讲解⑥：黄金法则 + --force-with-lease（Grok）----
SC.golden = (t, blk, en) => {
  bgLecture(t, '#e03131'); lecturer(t, blk, en, blk.t0);
  const g2 = S('G07_02') - 0.15, g3 = S('G07_03') - 0.15, g4 = S('G07_04') - 0.15;
  if (t < g2 + 0.3) { const a = popIn(t, blk.t0 + 0.05, 0.4) * (1 - prog(t, g2, 0.3)); ctx.save(); ctx.globalAlpha *= clamp(a);
    [[700, '☁️ 云端', ['a1b2c3', 'b2c3d4'], FEATC], [1290, '💻 本地（变基后）', ['9f8e7d', '8e7d6c'], NEWC]].forEach((p, i) => { box(p[0], 140, 570, 360, 26, 'rgba(15,12,31,0.9)', p[3], 5); txt(p[1], p[0] + 285, 190, 34, p[3], { align: 'center' });
      p[2].forEach((h, k) => { const s = popIn(t, blk.t0 + 0.15 + i * 0.2 + k * 0.08); if (s <= 0) return; gDot(p[0] + 90, 280 + k * 100, s, p[3], { r: 22 }); txt(h, p[0] + 140, 280 + k * 100, 38, '#ffd36b', { font: F_CODE }); }); });
    if (t >= P('G07_01', 0.35)) { const s = popIn(t, P('G07_01', 0.35)); txt('≠', 1275, 330, 110 * s, '#ff6b81', { align: 'center', font: F_FANCY, bold: false }); }
    if (t >= P('G07_01', 0.6)) stamp(t, P('G07_01', 0.6), 1275, 640, '普通推送：rejected', BADC, 54, -0.06);
    ctx.restore(); }
  if (t >= g2 && t < g3 + 0.3) { const a = eOut(prog(t, g2, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    const s = eBack(prog(t, g2, 0.45)); ctx.save(); ctx.translate(1275, 450); ctx.scale(s, s);
    box(-560, -330, 1120, 660, 36, '#fffaf0', '#1b1433', 8); box(-560, -330, 1120, 110, [36, 36, 0, 0], '#ffd23f'); txt('🏆 变基黄金法则', 0, -274, 54, '#1b1433', { align: 'center', font: F_FANCY, bold: false });
    const r1 = popIn(t, P('G07_02', 0.25)), r2 = popIn(t, P('G07_02', 0.6));
    if (r1 > 0) { ctx.save(); ctx.globalAlpha *= r1; box(-500, -180, 1000, 150, 22, '#fff0f2', '#ff6b81', 5); txt('👥 main / 大家在用的分支', -470, -105, 38, '#1b1433', {}); txt('✗ 不变基', 470, -105, 44, BADC, { align: 'right' }); ctx.restore(); }
    if (r2 > 0) { ctx.save(); ctx.globalAlpha *= r2; box(-500, 20, 1000, 150, 22, '#effff3', '#2ec86e', 5); txt('🙋 自己的、还没合并的分支', -470, 95, 38, '#1b1433', {}); txt('✓ 随便整理', 470, 95, 44, OKC, { align: 'right' }); ctx.restore(); }
    ctx.restore(); ctx.restore(); }
  if (t >= g3 && t < g4 + 0.3) { const a = eOut(prog(t, g3, 0.3)) * (1 - prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    cmdBar(t, 1270, 190, 'git push --force-with-lease', P('G07_03', 0.1), 0.6, { fs: 40, col: ACC });
    const c1 = popIn(t, P('G07_03', 0.45)), c2 = popIn(t, P('G07_03', 0.6));
    if (c1 > 0) { ctx.save(); ctx.translate(985, 520); ctx.scale(c1, c1); box(-270, -200, 540, 400, 26, '#fff', '#2ec86e', 6); txt('云端没人动过', 0, -140, 34, '#1b1433', { align: 'center' }); statusIcon(0, 0, 70, 1, t); txt('覆盖成功', 0, 130, 40, OKC, { align: 'center' }); ctx.restore(); }
    if (c2 > 0) { ctx.save(); ctx.translate(1565, 520); ctx.scale(c2, c2); box(-270, -200, 540, 400, 26, '#fff', '#ff6b81', 6); txt('云端多了队友的提交', 0, -140, 34, '#1b1433', { align: 'center' }); shield(0, 10, 0.6, t); txt('拒绝，不会冲掉', 0, 150, 40, BADC, { align: 'center' }); ctx.restore(); }
    if (t >= P('G07_03', 0.82)) fancy('带保险的强推！', 1270, 850, 70, t, P('G07_03', 0.82), FX.green);
    ctx.restore(); }
  if (t >= g4) { const a = eOut(prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    const cy = browser(700, 120, 1150, 600, 'github.com/dafeiyu/baifan/settings/rules', { title: 'Settings → Rules', accent: '#e03131' });
    txt('🛡️ 保护 main', 740, cy + 50, 36, '#24292f', {}); const on = t >= P('G07_04', 0.35);
    box(740, cy + 110, 1070, 100, 14, '#f6f8fa', '#d0d7de', 2); txt('Block force pushes', 780, cy + 160, 32, '#24292f', { font: F_CODE }); txt('禁止强制推送', 1150, cy + 160, 28, '#57606a', { bold: false });
    box(1660, cy + 135, 110, 50, 25, on ? OKC : '#8c959f'); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(on ? 1745 : 1685, cy + 160, 20, 0, 7); ctx.fill();
    if (t >= P('G07_04', 0.55)) { terminal(t, 740, cy + 250, 1070, 190, [{ s: 'git push --force origin main', t: P('G07_04', 0.55), cmd: true, dur: 0.4 }, { s: '{r}! [remote rejected] main (protected branch)', t: P('G07_04', 0.68) }], { title: '终端', accent: BADC, fs: 26, prompt: false }); }
    if (t >= P('G07_04', 0.75)) stamp(t, P('G07_04', 0.75), 1500, 780, '直接拦下！', OKC, 60, -0.08);
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('X02', 0.6)) stamp(t, P('X02', 0.6), 1180, 520, '真的稳 ✓', '#e03131', 84, -0.12);
};
SFX_FNS.push(() => { guestSfx(['X02']); const b = BK.golden; sfx(b.t0 + 0.05, 'pop', 0.4); for (let k = 0; k < 4; k++) sfx(b.t0 + 0.15 + (k >> 1) * 0.2 + (k & 1) * 0.08, 'pop', 0.2); sfx(P('G07_01', 0.35), 'buzz', 0.4); sfx(P('G07_01', 0.6), 'stamp', 0.6);
  sfx(S('G07_02') - 0.15, 'impact', 0.5); sfx(P('G07_02', 0.25), 'pop', 0.4); sfx(P('G07_02', 0.6), 'pop', 0.4);
  sfx(S('G07_03') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G07_03', 0.1), 27, 0.6); sfx(P('G07_03', 0.45), 'ding', 0.4); sfx(P('G07_03', 0.6), 'buzz', 0.4); sfx(P('G07_03', 0.82), 'sparkle', 0.4);
  sfx(S('G07_04') - 0.15, 'swoosh_in', 0.4); sfx(P('G07_04', 0.35), 'click', 0.6); typeSfx(P('G07_04', 0.55), 28, 0.4); sfx(P('G07_04', 0.68), 'buzz', 0.5); sfx(P('G07_04', 0.75), 'stamp', 0.6); sfx(P('X02', 0.6), 'stamp', 0.7); });

// ---- 讲解⑦：reflog 救回 + PR 合并按钮（Kimi）----
SC.rescue = (t, blk, en) => {
  bgLecture(t, '#7a4b1f'); lecturer(t, blk, en, blk.t0);
  const g2 = S('G08_02') - 0.15, g3 = S('G08_03') - 0.15;
  if (t < g2 + 0.3) { const a = popIn(t, blk.t0 + 0.05, 0.4) * (1 - prog(t, g2, 0.3)); const hot = P('G08_01', 0.3), rs = P('G08_01', 0.55);
    terminal(t, 700, 130, 1150, 440, [{ s: 'git reflog', t: blk.t0 + 0.1, cmd: true, dur: 0.3 },
      { s: '{y}9f8e7d {w}HEAD@{0}: rebase (finish)', t: blk.t0 + 0.4 }, { s: '{y}8e7d6c {w}HEAD@{1}: rebase (pick)', t: blk.t0 + 0.45 }, { s: '{y}…', t: blk.t0 + 0.5 },
      { s: '{y}d4e5f6 {w}HEAD@{5}: commit: 真的好了', t: blk.t0 + 0.55, hl: [hot, 1e9], hlc: '#ffd23f' }], { title: '终端 — 翻日记', accent: '#7a4b1f', fs: 30, alpha: clamp(a), prompt: false });
    ctx.save(); ctx.globalAlpha *= clamp(a); cmdBar(t, 1270, 660, 'git reset --hard HEAD@{5}', rs, 0.6, { fs: 38, col: ACC });
    if (t >= P('G08_01', 0.8)) fancy('就像没变基过！', 1270, 820, 70, t, P('G08_01', 0.8), FX.yel); ctx.restore(); }
  if (t >= g2 && t < g3 + 0.3) { const a = eOut(prog(t, g2, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    const cy = browser(700, 110, 1150, 760, 'github.com/dafeiyu/baifan/pull/5', { title: 'Pull request', accent: '#5b6ee1' });
    txt('添加甜点菜单 #5', 740, cy + 40, 34, '#24292f', {}); box(740, cy + 90, 1070, 70, 12, '#f0fff4', '#4ac26b', 2); statusIcon(780, cy + 125, 18, 1, t); txt('All checks have passed', 815, cy + 125, 26, '#1a7f37', { font: F_CODE });
    const opts = [['Create a merge commit', '保留分叉 + 合并提交', '#57606a', -1], ['Squash and merge', '压缩合并：压成一个', '#ff9f43', P('G08_02', 0.35)], ['Rebase and merge', '变基合并：排成一条线', NEWC, P('G08_02', 0.65)]];
    const dd = popIn(t, P('G08_02', 0.15), 0.35);
    if (dd > 0) { ctx.save(); ctx.translate(740, cy + 200); ctx.scale(1, dd); box(0, 0, 1070, 360, 16, '#fff', '#d0d7de', 2);
      opts.forEach((o, i) => { const hot = t >= o[3] && (i === 2 || t < opts[i + 1][3]) && o[3] > 0; if (hot) box(8, 10 + i * 116, 1054, 104, 12, hexA(o[2], 0.2), o[2], 4);
        txt((hot ? '✔ ' : '　') + o[0], 40, 50 + i * 116, 32, '#24292f', { font: F_CODE }); txt(o[1], 60, 88 + i * 116, 24, '#57606a', { bold: false }); });
      ctx.restore(); }
    ctx.restore(); }
  if (t >= g3) { const a = eOut(prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    box(700, 140, 1150, 300, 26, 'rgba(15,12,31,0.9)', '#ff9f43', 5); txt('main', 730, 210, 28, MAINC, { font: F_CODE });
    const N = { a: { x: 820, y: 290, col: MAINC }, b: { x: 980, y: 290, col: MAINC }, c: { x: 1140, y: 290, col: MAINC }, s: { x: 1340, y: 290, col: NEWC, t0: P('G08_03', 0.15), lab: '添加甜点菜单', fs: 22, glow: true, r: 30 } };
    drawGraph(t, N, [['a', 'b', -1], ['b', 'c', -1], ['c', 's', P('G08_03', 0.15)]], { r: 22 });
    if (t >= P('G08_03', 0.25)) txt('+1 个提交', 1560, 290, 36, '#ffd23f', {});
    if (t >= P('G08_03', 0.5)) { const s = popIn(t, P('G08_03', 0.5), 0.4); ctx.save(); ctx.translate(1275, 640); ctx.scale(s, s); box(-500, -130, 1000, 260, 20, '#fff', '#d0d7de', 3);
      txt('PR #5 · Commits 4', -460, -80, 30, '#24292f', { font: F_CODE }); ['甜点菜单', '改改', '再改', '真的好了'].forEach((m, i) => { gDot(-430 + i * 240, 20, 1, FEATC, { r: 14 }); txt(m, -405 + i * 240, 20, 26, '#57606a', {}); });
      txt('原来的碎提交还能翻到', 0, 90, 28, OKC, { align: 'center' }); ctx.restore(); }
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['K02']); const b = BK.rescue; typeSfx(b.t0 + 0.1, 10, 0.3); for (let i = 0; i < 4; i++) sfx(b.t0 + 0.4 + i * 0.05, 'pop', 0.15); sfx(P('G08_01', 0.3), 'ding', 0.4); typeSfx(P('G08_01', 0.55), 25, 0.6); sfx(P('G08_01', 0.8), 'sparkle', 0.4);
  sfx(S('G08_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G08_02', 0.15), 'pop', 0.4); sfx(P('G08_02', 0.35), 'click', 0.5); sfx(P('G08_02', 0.65), 'click', 0.5);
  sfx(S('G08_03') - 0.15, 'swoosh_in', 0.4); sfx(P('G08_03', 0.15), 'pop', 0.5); sfx(P('G08_03', 0.5), 'pop', 0.4); });

// ---- 复习：接 · 剪 · 守 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const cards = [['🔗 接', MAINC, ['rebase main', 'pull --rebase', '冲突 add + continue'], 'G09_01'], ['✂️ 剪', ACC, ['rebase -i', 'squash · fixup', 'reword · drop'], 'G09_02'], ['🛡️ 守', OKC, ['大家的分支不变基', '--force-with-lease', '搞砸翻 reflog'], 'G09_03']];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.1, 0.4); if (s <= 0) return; const act = t >= S(c[3]) - 0.1 && (i === 2 || t < S(cards[i + 1][3]) - 0.1);
    const x = 870 + i * 400, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= S(c[3]) - 0.1 ? 1 : 0.5;
    if (act) { ctx.shadowColor = c[1]; ctx.shadowBlur = 40; } box(-180, -300, 360, 600, 28, '#fffaf0', c[1], 8); ctx.shadowBlur = 0;
    box(-180, -300, 360, 100, [28, 28, 0, 0], c[1]); txt(c[0], 0, -248, 46, '#fff', { align: 'center', font: F_FANCY, bold: false });
    c[2].forEach((l, k) => { const a = clamp(prog(t, P(c[3], 0.08 + k * 0.27), 0.25)); ctx.save(); ctx.globalAlpha *= 0.25 + 0.75 * a; box(-150, -170 + k * 140, 300, 110, 16, '#fff', '#e4dff5', 3); txt(l, 0, -170 + k * 140 + 55, 26, '#1b1433', { align: 'center', font: isCJK(l) ? F_BODY : F_CODE, max: 280 }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= P('G09_03', 0.8)) fancy('接 · 剪 · 守，历史一条线！', 1270, 880, 56, t, P('G09_03', 0.8), FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2].forEach(i => sfx(BK.recap.t0 + 0.1 + i * 0.1, 'pop', 0.3)); ['G09_01', 'G09_02', 'G09_03'].forEach(id => { for (let k = 0; k < 3; k++) sfx(P(id, 0.08 + k * 0.27), 'ding', 0.25); }); sfx(P('G09_03', 0.8), 'sparkle', 0.5); });

// ---- 实战：甜点分支剪干净 ----
SC.practice = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  const T = { fetch: S('G10_01'), cf: P('G10_02', 0.1), fix: P('G10_02', 0.45), ri: S('G10_03'), sq: P('G10_03', 0.6), push: S('G10_04'), ok: P('G10_04', 0.5), mg: P('G10_04', 0.8), log: S('G10_05') };
  const steps = [['fetch + rebase', T.fetch], ['冲突', T.cf], ['rebase -i', T.ri], ['强推', T.push], ['✅ 合并', T.mg], ['log', T.log]];
  const end = S('D11') - 0.2;
  steps.forEach((s, i) => { const a = popIn(t, blk.t0 + 0.15 + i * 0.06); if (a <= 0) return;
    const x = 790 + i * 200, y = 88; const act = t < end && t >= s[1] && (i === 5 || t < steps[i + 1][1]); const done = t >= end || (i < 5 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1)); box(-90, -32, 180, 64, 18, act ? '#ff7a3d' : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act && !/^[✓✅]/.test(s[0]) ? '✓ ' : '') + s[0], 0, 2, 22, '#fff', { align: 'center', font: isCJK(s[0]) ? F_BODY : F_CODE, max: 170 }); ctx.restore(); });
  const ta = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha *= ta;
  // 上：提交图
  box(670, 150, 1210, 330, 24, 'rgba(15,12,31,0.92)', '#fff', 4); txt('main', 700, 220, 24, MAINC, { font: F_CODE });
  const N = { a: { x: 760, y: 280, col: MAINC }, b: { x: 860, y: 280, col: MAINC }, c: { x: 960, y: 280, col: MAINC, lab: '队友', fs: 20 }, d: { x: 1060, y: 280, col: MAINC, lab: '队友', fs: 20 } }; const E = [['a', 'b', -1], ['b', 'c', -1], ['c', 'd', -1]];
  const reb = P('G10_01', 0.5), sqm = eIO(prog(t, T.sq, 0.5)), labs = ['甜点', '改改', '再改', '好了'];
  if (t < T.sq + 0.5) labs.forEach((l, i) => { const x0 = 960 + i * 110, y0 = 410, x1 = 1170 + i * 110, y1 = 280; let p = moveP(t, reb + i * 0.08, 0.5, x0, y0, x1, y1, 60);
    const x = lerp(p[0], 1170, sqm), y = p[1]; N['f' + i] = { x, y, col: p[2] > 0.99 ? NEWC : FEATC, lab: sqm > 0.3 ? null : l, fs: 20, ghost: false, glow: i === 0 && t >= T.cf && t < T.fix };
    E.push([i ? 'f' + (i - 1) : (p[2] > 0.99 ? 'd' : 'b'), 'f' + i, -1]); });
  else { N.s = { x: 1170, y: 280, col: NEWC, lab: '添加甜点菜单', fs: 22, r: 28, glow: t < T.sq + 1.2 }; E.push(['d', 's', -1]); }
  drawGraph(t, N, E, { r: 20 });
  if (t >= T.mg) { gDot(1560, 280, popIn(t, T.mg), OKC, { r: 26, mark: '✓' }); txt('PR #5 Rebase and merge', 1560, 350, 22, '#7cf07a', { align: 'center', font: F_CODE }); }
  // 下：终端
  const L = [{ s: 'git fetch', t: P('G10_01', 0.05), cmd: true, dur: 0.25 }, { s: 'git rebase origin/main', t: P('G10_01', 0.28), cmd: true, dur: 0.45 },
    { s: '{r}CONFLICT in menu.html', t: T.cf }, { s: 'git add menu.html', t: T.fix, cmd: true, dur: 0.3 }, { s: 'git rebase --continue', t: T.fix + 0.4, cmd: true, dur: 0.35 },
    { s: 'git rebase -i HEAD~4', t: T.ri + 0.05, cmd: true, dur: 0.4 }, { s: '{c}pick {w}甜点  {p}fixup ×3', t: P('G10_03', 0.4) }, { s: 'git push --force-with-lease', t: T.push + 0.05, cmd: true, dur: 0.5 },
    { s: '{g}✓ checks passed', t: T.ok }, { s: 'git log --oneline --graph', t: T.log + 0.05, cmd: true, dur: 0.45 }];
  terminal(t, 670, 500, 1210, 400, L, { title: '终端 — 白饭页 dessert 分支', accent: '#ff7a3d', fs: 28, prompt: false });
  ctx.restore();
  if (t < S('G10_01') + 0.6) fancy('实战开始！', 1280, 500, 110, t, blk.t0 + 0.2, Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_film', 1620, H + 30, 880, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    const bs = popIn(t, end + 0.05, 0.4); ctx.save(); ctx.translate(960, 400); ctx.scale(bs, bs);
    box(-330, -140, 660, 280, 24, 'rgba(15,12,31,0.95)', NEWC, 6); const M = {}; const EE = [];
    ['A', 'B', 'C', 'D', '★'].forEach((l, i) => { M['n' + i] = { x: -240 + i * 120, y: 0, col: i === 4 ? NEWC : MAINC, mark: l === '★' ? '★' : null, r: i === 4 ? 30 : 22 }; if (i) EE.push(['n' + (i - 1), 'n' + i, -1]); });
    drawGraph(t, M, EE); ctx.restore();
    fancy('历史一条线！', 940, 700, 84, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 6; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(b.t0 + 0.2, 'impact', 0.6);
  typeSfx(P('G10_01', 0.05), 9, 0.25); typeSfx(P('G10_01', 0.28), 22, 0.45); for (let i = 0; i < 4; i++) sfx(P('G10_01', 0.5) + i * 0.08, 'whoosh', 0.2);
  sfx(P('G10_02', 0.1), 'buzz', 0.5); typeSfx(P('G10_02', 0.45), 17, 0.3); typeSfx(P('G10_02', 0.45) + 0.4, 21, 0.35);
  typeSfx(S('G10_03') + 0.05, 20, 0.4); sfx(P('G10_03', 0.4), 'pop', 0.3); sfx(P('G10_03', 0.6), 'whoosh', 0.5); sfx(P('G10_03', 0.6) + 0.5, 'sparkle', 0.5);
  typeSfx(S('G10_04') + 0.05, 27, 0.5); sfx(P('G10_04', 0.5), 'ding', 0.5); sfx(P('G10_04', 0.8), 'pop', 0.5); typeSfx(S('G10_05') + 0.05, 25, 0.45);
  const end = S('D11') - 0.2; sfx(end, 'impact', 0.6); sfx(end + 0.4, 'confetti', 0.6); });

// ---- 预告（Git 侦探）+ 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#f76707');
  const outro = E('G11_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G11_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G11_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G11_01', 0.1), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 470); ctx.scale(bp, bp); ctx.translate(-1260, -470);
      box(860, 250, 800, 420, 24, '#ffffff', '#f76707', 6); box(860, 250, 800, 70, [24, 24, 0, 0], '#24292f'); txt('git log', 900, 286, 30, '#fff', { font: F_CODE });
      const rows = ['加甜点菜单', '调整配色', '改首页标题', '加饮料菜单', '修错字']; const sus = 2, mg = P('G11_01', 0.4);
      rows.forEach((r, i) => { const a = prog(t, P('G11_01', 0.15 + i * 0.04), 0.2); if (a <= 0) return; const ry = 360 + i * 60; ctx.save(); ctx.globalAlpha *= a; const hot = i === sus && t >= P('G11_01', 0.6);
        if (hot) box(890, ry - 26, 740, 52, 10, 'rgba(255,77,109,0.2)', '#ff4d6d', 3); gDot(920, ry, 1, hot ? KNOTC : MAINC, { r: 12 }); txt(r, 950, ry, 28, '#24292f', {}); ctx.restore(); });
      if (t >= mg) { const p = eIO(prog(t, mg, 0.6)); const mx = lerp(1500, 1180, p), my = lerp(620, 480, p); ctx.save(); ctx.translate(mx, my); ctx.strokeStyle = '#1b1433'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.stroke(); ctx.fillStyle = 'rgba(180,230,255,0.25)'; ctx.fill(); ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(50, 50); ctx.lineTo(120, 120); ctx.stroke(); ctx.restore(); }
      if (t >= P('G11_01', 0.62)) stamp(t, P('G11_01', 0.62), 1500, 480, '真凶！', BADC, 56, -0.1);
      ctx.restore(); }
    [['git blame', -520, 300, 0.45], ['git bisect', 520, 290, 0.55], ['Git 侦探', -500, 680, 0.66], ['🔍 抓真凶', 510, 690, 0.74]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G11_01', c[3])), { fs: 34, font: isCJK(c[0]) ? F_BODY : F_CODE }));
    fancy('谁改坏的？Git 侦探出动！', 1260, 830, 70, t, P('G11_01', 0.78), FX.pink);
  }
  if (ot > 0) {
    ctx.fillStyle = `rgba(10,8,22,${0.78 * ot})`; ctx.fillRect(...OS);
    [['👍', '点赞', '#ff5c8a'], ['🪙', '投币', '#ffd23f'], ['⭐', '收藏', '#3ec1ff']].forEach((ic, i) => {
      const a = popIn(t, S('G11_02') + 0.4 + i * 0.32, 0.4); if (a <= 0) return;
      const x = W / 2 + (i - 1) * 330, y = 440;
      ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(t * 5 + i) * 0.06);
      ctx.fillStyle = ic[2]; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.font = `110px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic[0], 0, 8); ctx.restore();
      fancy(ic[1], x, y + 180, 60, t, S('G11_02') + 0.5 + i * 0.32, { c1: '#fff', c2: '#eee', stroke: ic[2] });
    });
    fancy('一键三连，下集见！', W / 2, 180, 96, t, S('G11_02') + 1.4, { stagger: 0.04 });
    if (t > outro) {
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_film', 1690, H + 40, 640, { scale: sa }); }
      SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
    ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
    ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G11_01', 0.1), 'pop', 0.6); for (let i = 0; i < 5; i++) sfx(P('G11_01', 0.15 + i * 0.04), 'pop', 0.2); sfx(P('G11_01', 0.4), 'whoosh', 0.5); sfx(P('G11_01', 0.62), 'stamp', 0.6);
  [0.45, 0.55, 0.66, 0.74].forEach(f => sfx(P('G11_01', f), 'pop', 0.3)); sfx(P('G11_01', 0.78), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G11_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G11_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_sparkle', P('G01_01', 0.85), E('G01_01')], ['d_think', P('G02_03', 0.5), E('G02_03')], ['d_relief', P('G03_02', 0.75), E('G03_02')],
  ['d_ok', P('G05_03', 0.65), E('G05_03')], ['d_shock', P('G07_01', 0.5), E('G07_01')],
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
