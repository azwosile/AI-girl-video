// AI娘 Git课 · 第12集 渲染引擎 —— renderAt(t) 纯函数，逐帧确定性导出（通用部分沿用第1集）
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const F_FANCY = '"Smiley", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const F_BODY = '"Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const F_CODE = 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", "Microsoft YaHei", "Noto Sans CJK SC", monospace';

// ================= 素材 =================
const SPR = {};
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'g_cheer', 'g_warn', 'g_think', 'g_shock', 'g_proud', 'g_type', 'g_peace', 'g_awkward', 'g_present', 'd_panic', 'd_curious', 'd_happy', 'd_raise', 'd_think', 'd_shock', 'd_sparkle', 'd_ok', 'd_relief', 'd_leader', 'q_base', 'q_point', 'q_tea', 'c_base', 'c_ok', 'c_cool', 'm_base', 'm_panic', 'm_cheeky', 'x_base', 'x_angry', 'x_force', 'b_base', 'b_sorry', 'k_base', 'k_read', 'g_pill', 'd_pill', 'm_oops', 'q_alarm', 'b_wave', 'x_panic', 'k_diary', 'c_read', 'g_tag', 'd_party', 'b_proud', 'm_tag', 'x_thumb', 'k_scroll', 'g_web', 'd_phone', 'm_photo', 'x_doubt', 'b_point', 'g_check', 'd_robot', 'm_clock', 'c_lock', 'b_badge', 'g_scissors', 'd_tangle', 'd_film', 'b_squash', 'g_detective', 'd_detective', 'b_cherry', 'g_fork', 'd_medal', 'm_review', 'g_doctor', 'd_heavy', 'c_key', 'g_grad', 'd_grad'];
// 竖版立绘只显示上半身：显示高度占整张图的比例（头顶到腰）
const SPRC = { d_panic: 0.55, d_curious: 0.55, d_happy: 0.55, d_sparkle: 0.6, d_ok: 0.66, d_raise: 0.72, d_think: 0.7, d_relief: 0.82, d_shock: 0.82, d_leader: 0.7, q_base: 0.6, q_point: 0.6, q_tea: 0.6, c_base: 0.58, c_ok: 0.58, c_cool: 0.58, m_base: 0.62, m_panic: 0.6, m_cheeky: 0.62, x_base: 0.6, x_angry: 0.6, x_force: 0.66, b_base: 0.62, b_sorry: 0.62, k_base: 0.6, k_read: 0.6, d_pill: 0.6, m_oops: 0.62, q_alarm: 0.6, b_wave: 0.62, x_panic: 0.62, k_diary: 0.6, c_read: 0.58, d_party: 0.68, b_proud: 0.6, m_tag: 0.62, x_thumb: 0.66, k_scroll: 0.62, d_phone: 0.66, m_photo: 0.6, x_doubt: 0.62, b_point: 0.62, d_robot: 0.66, m_clock: 0.62, c_lock: 0.6, b_badge: 0.62, d_tangle: 0.62, d_film: 0.64, b_squash: 0.7, d_detective: 0.64, b_cherry: 0.62, d_medal: 0.64, m_review: 0.62, d_heavy: 0.66, c_key: 0.6, d_grad: 0.64 };
const loadImg = n => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });


// ================= 台词（由 subtitles.json 生成，改台词请改 _gen_script.py）=================
const TEXT = {
  D01: "刚合并完，白饭页就白屏了！谁直接推到 main 上了？",
  G01_01: "一个人会用 Git 还不够。团队要有规矩：谁能推、谁来审、怎么发版本。",
  G01_02: "今天是毕业考试：把前面十一集学的，拼成一整套团队工作流！",
  G01_03: "欢迎来到 AI娘 Git 课，第十二集，毕业篇！",
  X01: "是我推的。我是管理员，保护规则拦不住我。",
  D02: "规则还能绕过去？",
  G02_01: "第三集给 main 加过保护：必须走 PR，不许强制推送，也不许删除。",
  G02_02: "可保护规则默认管理员能绕过。勾上 Do not allow bypassing，管理员也得老老实实走 PR。",
  G02_03: "再有人直接推，就会收到 GH006：Protected branch update failed，推送被拒。",
  X02: "规矩对谁都一样。好，我服。",
  C01: "每个 PR 都点名让我审，三十个排着队，我审不过来。",
  D03: "那能不能按文件，分给不同的人？",
  G03_01: "写一个 CODEOWNERS 文件，放进 .github 文件夹：一行一条规则，路径后面跟负责人。",
  G03_02: "比如 /docs/ 交给 Claude，*.css 交给 Gemini。改到谁的文件，就自动请谁来审。",
  G03_03: "保护规则里再勾上“需要代码负责人批准”，负责人不点头，就合并不了。",
  C02: "各管一摊，效率高多了。",
  M01: "嘿嘿，批准之后，我又偷偷推了一个提交喵！",
  D04: "那审过的还算数吗？",
  G04_01: "勾上“推送新提交时，旧批准作废”：改动一变，批准自动失效，得重新审。",
  G04_02: "再勾上“合并前必须通过状态检查”，选中第七集写的 Actions 检查：红叉就不能合并。",
  G04_03: "还可以要求分支先和 main 同步、所有评论都处理完，才能点合并。",
  M02: "偷偷加的那一行，被红叉抓到了喵！",
  B01: "家人们！合并按钮旁边有个小箭头，三个选项到底选哪个？",
  D05: "我一直闭着眼睛点第一个……",
  G05_01: "Create a merge commit：保留分支上的每个提交，再加一个合并提交，历史最完整。",
  G05_02: "Squash and merge：整个 PR 压成一个提交，main 上一个功能一条记录，最清爽。",
  G05_03: "Rebase and merge：把提交一个个接到 main 后面，历史一条直线，没有合并提交。",
  G05_04: "设置里只留团队选定的方式，再打开“自动删除已合并的分支”，仓库不堆旧分支。",
  B02: "压成一条，历史干干净净！",
  Q01: "用户反馈：新版本什么时候能下载？每次都要手动打包上传吗？",
  D06: "对啊，每次发版本都好累……",
  G06_01: "第五集学了打标签和 Release，第七集学了 Actions，今天把它们接起来。",
  G06_02: "工作流的触发条件写 on: push: tags: v*：只要推送 v 开头的标签，就自动运行。",
  G06_03: "步骤里先打包，再用 gh release create 加上 --generate-notes：自动建 Release、写更新说明、附上文件。",
  G06_04: "记得给工作流 contents: write 权限。以后发版本，只要 git push origin v2.0.0。",
  Q02: "收到，我转告用户：新版本几分钟后就能下载！",
  K01: "我把十一集的笔记全翻了一遍，能把它们串成一条线吗？",
  D07: "对，到底先做什么，后做什么？",
  G07_01: "团队工作流七步走：开 Issue 分任务、开分支、小步提交、发 PR 写上 Closes #编号。",
  G07_02: "然后检查跑绿、负责人审查、选好方式合并并删分支；功能攒够了，打标签自动发布。",
  G07_03: "出了岔子也不慌：后悔药在第四集，侦探在第九集，体检在第十一集。",
  K02: "十二集，一条线。我都记下了。",
  D08: "毕业考试考什么？帮我划重点！",
  G08_01: "守：保护规则谁都不许绕过；PR 要批准，新提交让旧批准作废，检查不绿不合并。",
  G08_02: "合：CODEOWNERS 自动请对的人来审；合并方式团队统一，合完自动删分支。",
  G08_03: "发：推送 v 开头的标签，Actions 自动打包、写更新说明、发 Release。",
  D09: "毕业实战：带小队，把 2.0 版的白饭页发出去！",
  G09_01: "先给 main 加规则：必须 PR、一人批准、检查通过、不许绕过；CODEOWNERS 分好负责人。",
  G09_02: "开 Issue #20 深色模式，开分支 feat/dark-mode，提交后发 PR，写上 Closes #20。",
  G09_03: "Gemini 又推了一个提交：旧批准作废，检查重跑；Claude 重新审过，全绿。",
  G09_04: "Squash and merge：分支自动删除，Issue 自动关闭。",
  G09_05: "git tag -a v2.0.0，推送标签：Actions 自动打包，两分钟后 Release 上线！",
  D10: "白饭页 2.0 发布成功！小队配合满分！",
  G10_01: "十二集，从第一次存档，到带着小队发布版本。大肥鱼，你毕业了！",
  D11: "我毕业了！谢谢 GitHub娘老师！",
  Q03: "恭喜组长毕业！",
  C03: "表现不错，准予毕业。",
  M03: "毕业快乐喵！",
  X03: "干得漂亮。",
  B03: "家人们，组长毕业啦！",
  K03: "这一页，我会一直记着。",
  G10_02: "正片到这里就完结啦！之后还有番外：SSH 多账号、图形界面工具，敬请期待！",
  G10_03: "喜欢的话，一键三连！我们番外见！",
};
const DUR = Object.assign({}, window.DUR || {});

// ================= 时间轴 =================
const V = (b, id, pose) => ({ k: 'v', b, id, pose });
const BEAT = (b, d) => ({ k: 'beat', b, d: b === 'teaser' ? d * 0.75 : d * 0.35 });
const CH_COL = ['#7c5cff', '#3ec1ff', '#22c08b', '#ffb020', '#ff5c8a', '#ff7a3d', '#a66bff', '#ffd23f'];
const PLAN = [
  V('cold', 'D01', 'd_panic'),
  V('why', 'G01_01', 'g_explain'), V('why', 'G01_02', 'g_present'),
  V('title', 'G01_03', 'g_cheer'), BEAT('title', 1.4),
  V('ruleQ', 'X01', 'x_force'), V('ruleQ', 'D02', 'd_shock'),
  V('rule', 'G02_01', 'g_explain'), V('rule', 'G02_02', 'g_warn'), V('rule', 'G02_03', 'g_point'), V('rule', 'X02', 'x_thumb'),
  V('ownQ', 'C01', 'c_read'), V('ownQ', 'D03', 'd_curious'),
  V('own', 'G03_01', 'g_type'), V('own', 'G03_02', 'g_point'), V('own', 'G03_03', 'g_check'), V('own', 'C02', 'c_ok'),
  V('chkQ', 'M01', 'm_cheeky'), V('chkQ', 'D04', 'd_think'),
  V('chk', 'G04_01', 'g_warn'), V('chk', 'G04_02', 'g_check'), V('chk', 'G04_03', 'g_explain'), V('chk', 'M02', 'm_oops'),
  V('mrgQ', 'B01', 'b_wave'), V('mrgQ', 'D05', 'd_think'),
  V('mrg', 'G05_01', 'g_explain'), V('mrg', 'G05_02', 'g_present'), V('mrg', 'G05_03', 'g_point'), V('mrg', 'G05_04', 'g_check'), V('mrg', 'B02', 'b_squash'),
  V('relQ', 'Q01', 'q_alarm'), V('relQ', 'D06', 'd_tangle'),
  V('rel', 'G06_01', 'g_tag'), V('rel', 'G06_02', 'g_type'), V('rel', 'G06_03', 'g_check'), V('rel', 'G06_04', 'g_warn'), V('rel', 'Q02', 'q_point'),
  V('flowQ', 'K01', 'k_diary'), V('flowQ', 'D07', 'd_curious'),
  V('flow', 'G07_01', 'g_present'), V('flow', 'G07_02', 'g_explain'), V('flow', 'G07_03', 'g_wink'), V('flow', 'K02', 'k_scroll'),
  V('ask12', 'D08', 'd_happy'),
  V('recap', 'G08_01', 'g_present'), V('recap', 'G08_02', 'g_point'), V('recap', 'G08_03', 'g_proud'),
  V('askP', 'D09', 'd_leader'),
  V('practice', 'G09_01', 'g_type'), V('practice', 'G09_02', 'g_point'), V('practice', 'G09_03', 'g_check'), V('practice', 'G09_04', 'g_explain'), V('practice', 'G09_05', 'g_tag'), V('practice', 'D10', 'd_party'),
  V('grad', 'G10_01', 'g_grad'), V('grad', 'D11', 'd_grad'), V('grad', 'Q03', 'q_point'), V('grad', 'C03', 'c_cool'), V('grad', 'M03', 'm_cheeky'), V('grad', 'X03', 'x_thumb'), V('grad', 'B03', 'b_proud'), V('grad', 'K03', 'k_scroll'),
  V('teaser', 'G10_02', 'g_cheer'), V('teaser', 'G10_03', 'g_peace'), BEAT('teaser', 8),
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
// ================= 第12集：毕业篇 =================
Object.assign(SQ.Q, { role: '用户反馈' }); Object.assign(SQ.X, { role: '管理员' }); Object.assign(SQ.B, { role: '合并按钮' });
Object.assign(SQ.M, { role: '偷偷推送' }); Object.assign(SQ.C, { role: '审查' }); Object.assign(SQ.K, { role: '翻遍笔记' });
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

// ---- 沿用第11集组件 ----
const SIZEC = '#e8590c', LFSC = '#0e9f6e', EOLC = '#d6336c', HISC = '#7048e8', DOCC = '#0f766e';
function termSfx(L) { L.forEach(l => { if (l.cmd) typeSfx(l.t, [...l.s].length, l.dur || 0.8); }); }
const fadeW = (t, a0, a1) => clamp(eOut(prog(t, a0, 0.3)) * (1 - prog(t, a1, 0.3)));
// PSD 文件图标（中心 x,y）
function psdIcon(x, y, s, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.globalAlpha *= o.alpha ?? 1;
  box(-46, -60, 92, 120, 12, o.bg || '#fff', o.col || SIZEC, 5); box(-34, -42, 68, 40, 8, o.col || SIZEC);
  txt('PSD', 0, -21, 24, '#fff', { align: 'center', font: F_CODE }); txt(o.lab || '180MB', 0, 28, 20, '#1b1433', { align: 'center', font: F_CODE });
  ctx.restore();
}
// 钥匙（x,y 为钥匙圈中心）
function keyIcon(x, y, s, col = CLUE, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.globalAlpha *= o.alpha ?? 1;
  if (o.glow) { ctx.shadowColor = col; ctx.shadowBlur = 30; }
  ctx.strokeStyle = col; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.stroke();
  ctx.fillStyle = col; ctx.fillRect(24, -7, 90, 14); ctx.fillRect(84, 0, 12, 26); ctx.fillRect(102, 0, 12, 18);
  if (o.broken) { ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(55, -20); ctx.lineTo(48, 0); ctx.lineTo(60, 20); ctx.stroke(); }
  ctx.restore();
}
// 云（LFS 存储 / GitHub）
function cloud(x, y, s, col, lab) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#fff'; ctx.strokeStyle = col; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(-80, 20, 60, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(-20, -40, 80, Math.PI, Math.PI * 1.9); ctx.arc(80, 0, 70, Math.PI * 1.4, Math.PI * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (lab) txt(lab, 0, 30, 30, col, { align: 'center' }); ctx.restore();
}
// 体检报告行
function checkRow(x, y, w, icon, lab, val, ok, s = 1) {
  if (s <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(s);
  box(x, y, w, 76, 14, ok ? '#effaf3' : '#fff5f5', ok ? GOODC : BADC, 4);
  txt(icon, x + 40, y + 38, 36, '#000', { align: 'center', font: EMOJI, bold: false }); txt(lab, x + 78, y + 38, 30, '#1b1433', {});
  txt(val, x + w - 70, y + 38, 28, ok ? OKC : BADC, { align: 'right', font: isCJK(val) ? F_BODY : F_CODE }); statusIcon(x + w - 36, y + 38, 18, ok ? 1 : 2, 0);
  ctx.restore();
}


// ---- 第12集专用组件 ----
const RULEC = '#d9480f', OWNC = '#1971c2', CHKC = '#2f9e44', MRGC = '#8250df', RELC = '#e67700', FLOWC = '#0c8599', GOLD = '#d4a017';
// 盾牌（保护规则）
function shield(x, y, s, col = RULEC, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.globalAlpha *= o.alpha ?? 1;
  if (o.glow) { ctx.shadowColor = col; ctx.shadowBlur = 36; }
  ctx.fillStyle = col; ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -80); ctx.quadraticCurveTo(50, -60, 70, -64); ctx.quadraticCurveTo(74, 40, 0, 84); ctx.quadraticCurveTo(-74, 40, -70, -64); ctx.quadraticCurveTo(-50, -60, 0, -80); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
  if (o.crack) { ctx.strokeStyle = '#1b1433'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-6, -78); ctx.lineTo(10, -30); ctx.lineTo(-12, 6); ctx.lineTo(8, 40); ctx.lineTo(-2, 80); ctx.stroke(); }
  else txt(o.mark || '✓', 0, 4, 70, '#fff', { align: 'center' });
  ctx.restore();
}
// 设置页复选框行：x,y 左上
function ghCheck(t, x, y, w, label, sub, on, s = 1, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(s); const h = o.h || (sub ? 86 : 64);
  if (o.hot) { ctx.shadowColor = o.hc || CLUE; ctx.shadowBlur = 28 + 8 * Math.sin(t * 8); }
  box(x, y, w, h, 12, o.hot ? '#fffbe6' : '#fff', o.hot ? (o.hc || CLUE) : '#d0d7de', o.hot ? 4 : 2); ctx.shadowBlur = 0;
  box(x + 22, y + h / 2 - 16, 32, 32, 7, on ? '#0969da' : '#fff', on ? '#0969da' : '#8c959f', 3);
  if (on) { const k = clamp(on); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 30, y + h / 2); ctx.lineTo(x + 30 + 6 * k, y + h / 2 + 7 * k); if (k > 0.5) ctx.lineTo(x + 36 + 12 * (k - 0.5) * 2, y + h / 2 + 7 - 16 * (k - 0.5) * 2); ctx.stroke(); }
  txt(label, x + 72, y + (sub ? h / 2 - 15 : h / 2), o.fs || 26, '#24292f', { font: isCJK(label) ? F_BODY : F_CODE, max: w - 90 });
  if (sub) txt(sub, x + 72, y + h / 2 + 20, 20, '#57606a', { bold: false, font: isCJK(sub) ? F_BODY : F_CODE, max: w - 90 });
  ctx.restore();
}
// PR 合并面板：rows = [[状态 0转 1绿 2红 3灰, 标题, 副标题]]；o.btn: 0 灰 / 1 绿；o.drop: 下拉菜单出现进度；o.pick: 高亮第几项
const MERGE_OPTS = [['Create a merge commit', '保留全部提交 + 一个合并提交'], ['Squash and merge', '整个 PR 压成一个提交'], ['Rebase and merge', '逐个接到 main 后面，一条直线']];
function mergeBox(t, x, y, w, rows, o = {}) {
  const rh = 78, h = rows.length * rh + 120; box(x, y, w, h, 16, '#fff', o.border || '#d0d7de', 4);
  rows.forEach((r, i) => { const ry = y + 14 + i * rh; if (i) { ctx.fillStyle = '#eaeef2'; ctx.fillRect(x + 16, ry - 4, w - 32, 2); }
    if (r[0] === 3) { ctx.fillStyle = '#8c959f'; ctx.beginPath(); ctx.arc(x + 44, ry + 34, 18, 0, 7); ctx.fill(); } else statusIcon(x + 44, ry + 34, 18, r[0], t);
    txt(r[1], x + 80, ry + 22, 25, '#24292f', { font: isCJK(r[1]) ? F_BODY + ',' + F_CODE : F_CODE, max: w - 110 }); if (r[2]) txt(r[2], x + 80, ry + 52, 19, '#57606a', { bold: false, font: isCJK(r[2]) ? F_BODY + ',' + F_CODE : F_CODE, max: w - 110 }); });
  const by = y + h - 70, on = o.btn; const bw = Math.min(420, w - 60);
  box(x + 24, by, bw - 56, 52, [10, 0, 0, 10], on ? '#1f883d' : '#94d3a2'); box(x + 24 + bw - 56, by, 56, 52, [0, 10, 10, 0], on ? '#1a7f37' : '#8cc99a');
  txt(o.label || 'Squash and merge', x + 24 + (bw - 56) / 2, by + 27, 22, '#fff', { align: 'center', font: F_CODE, max: bw - 76 }); txt('▾', x + 24 + bw - 28, by + 27, 26, '#fff', { align: 'center', font: F_CODE });
  if (o.hotArrow) { ctx.save(); ctx.strokeStyle = CLUE; ctx.lineWidth = 5; ctx.shadowColor = CLUE; ctx.shadowBlur = 20 + 8 * Math.sin(t * 8); rr(x + 24 + bw - 60, by - 4, 64, 60, 12); ctx.stroke(); ctx.restore(); }
  const dp = o.drop || 0; if (dp > 0) { ctx.save(); ctx.globalAlpha *= clamp(dp); const dy = by + 62; box(x + 24, dy, bw + 120, 3 * 76 + 12, 12, '#fff', '#d0d7de', 3);
    MERGE_OPTS.forEach((m, i) => { const yy = dy + 6 + i * 76; if (o.pick === i) box(x + 30, yy, bw + 108, 72, 10, hexA(MRGC, 0.14), MRGC, 3);
      txt(m[0], x + 50, yy + 24, 22, '#24292f', { font: F_CODE }); txt(m[1], x + 50, yy + 52, 18, '#57606a', { bold: false, font: F_BODY + ',' + F_CODE, max: bw + 60 }); }); ctx.restore(); }
  return h;
}
// 标签（git tag）
function tagChip(x, y, s, label, col = GOLD) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.font = `bold 30px ${F_CODE}`; const w = ctx.measureText(label).width + 70;
  ctx.fillStyle = col; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2 + 26, -30); ctx.lineTo(w / 2, -30); ctx.lineTo(w / 2, 30); ctx.lineTo(-w / 2 + 26, 30); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-w / 2 + 26, 0, 7, 0, 7); ctx.fill(); txt(label, 14, 1, 30, '#1b1433', { align: 'center', font: F_CODE }); ctx.restore();
}
// 学士帽
function capIcon(x, y, s, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  ctx.fillStyle = '#1b1433'; ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(90, 0); ctx.lineTo(0, 40); ctx.lineTo(-90, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();
  box(-48, 14, 96, 44, [0, 0, 22, 22], '#1b1433'); ctx.strokeStyle = GOLD; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(62, 18); ctx.lineTo(62, 60); ctx.stroke();
  ctx.fillStyle = GOLD; ctx.fillRect(56, 56, 12, 24); ctx.restore();
}
// 毕业证书（展开）
function diploma(x, y, s, name, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  box(-300, -200, 600, 400, 18, '#fffaf0', GOLD, 8); box(-280, -180, 560, 360, 12, null, hexA(GOLD, 0.6), 3);
  txt('🎓 毕业证书', 0, -120, 46, '#7a5b00', { align: 'center', font: EMOJI + ',' + F_FANCY, bold: false });
  txt(name, 0, -40, 40, '#1b1433', { align: 'center' }); txt('修完 AI娘 Git课 全部 12 集', 0, 20, 28, '#57606a', { align: 'center' });
  txt('准予毕业', 0, 80, 34, BADC, { align: 'center', font: F_FANCY, bold: false });
  ctx.fillStyle = BADC; ctx.beginPath(); ctx.arc(200, 120, 44, 0, 7); ctx.fill(); txt('Git', 200, 122, 28, '#fff', { align: 'center', font: F_CODE }); ctx.restore();
}
// 进度胶囊条（实战 / 工作流）
function stepBar(t, steps, x0, y, dx, end, o = {}) {
  steps.forEach((s, i) => { const a = popIn(t, (o.t0 || 0) + i * 0.06); if (a <= 0) return;
    const x = x0 + i * dx; const act = t < end && t >= s[1] && (i === steps.length - 1 || t < steps[i + 1][1]); const done = t >= end || (i < steps.length - 1 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1)); box(-(dx / 2 - 8), -32, dx - 16, 64, 18, act ? (o.col || GOODC) : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act ? '✓ ' : '') + s[0], 0, 2, o.fs || 24, '#fff', { align: 'center', font: isCJK(s[0]) ? F_BODY : F_CODE, max: dx - 36 }); ctx.restore(); });
}

// ---- 冷开场：main 被直接推坏 ----
const L_COLD = () => { const t0 = BK.cold.t0; return [{ s: 'git push origin main', t: t0 + 0.05, cmd: true, dur: 0.3 }, { s: '{d}To github.com/dafeiyu/rice-page.git', t: t0 + 0.4 },
  { s: '{g}   9c1e2f0..4b7d1aa  main -> main', t: t0 + 0.5 }, { s: '{y}⚠ 没有 PR · 没有审查 · 没有检查', t: P('D01', 0.4) }]; };
SC.cold = (t, blk) => {
  const t0 = blk.t0, lk = P('D01', 0.12); let [sx, sy] = shake(t, lk, 12, 0.35); ctx.translate(sx, sy);
  bgBurst(t, '#3a1020', '#c2255c', W * 0.62, H * 0.5, 22, 0.35);
  terminal(t, 860, 110, 1000, 290, L_COLD(), { title: '终端 — 某位同学', accent: '#d6283e', fs: 24, prompt: false, scale: eBack(prog(t, t0, 0.4)) });
  const bs = popIn(t, t0 + 0.6, 0.4); if (bs > 0) { ctx.save(); ctx.translate(1360, 640); ctx.scale(bs, bs); ctx.translate(-1360, -640);
    ghWin(860, 440, 1000, 400, 'dafeiyu.github.io/rice-page');
    if (t < lk) { txt('🍚 今天吃白饭', 1360, 600, 54, '#24292f', { align: 'center', font: EMOJI + ',' + F_BODY }); txt('大肥鱼会偷吃白饭', 1360, 680, 30, '#57606a', { align: 'center' }); }
    else { const fl = Math.floor(t * 10) % 2 && t < lk + 0.4; box(864, 498, 992, 338, [0, 0, 16, 16], fl ? '#f0f0f0' : '#fff');
      txt('（一片空白）', 1360, 640, 34, '#c9ced6', { align: 'center' }); box(890, 760, 940, 52, 8, '#ffebe9', BADC, 2); txt('✖ Uncaught TypeError: rice is undefined', 910, 787, 22, BADC, { font: F_CODE }); }
    ctx.restore(); }
  if (t >= lk) { flash(t, lk, 0.15, '255,80,120'); stamp(t, lk + 0.3, 1650, 520, '白屏了！', BADC, 70, -0.1); }
  const p = spring(prog(t, t0, 0.9)); sprite('d_panic', 440, H + 40, 980, { scale: lerp(1.2, 1, p) * breath(t, 1) });
  pill(440, 150, '大肥鱼 · 刚合并完', SQ.D.col, popIn(t, t0 + 0.15), { font: F_FANCY, fs: 44, fg: '#fff' });
  if (t >= P('D01', 0.6)) fancy('谁推的？！', 440, 270, 84, t, P('D01', 0.6), { rot: -0.06, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
};
SFX_FNS.push(() => { const b = BK.cold; termSfx(L_COLD()); sfx(b.t0 + 0.15, 'pop', 0.4); sfx(b.t0 + 0.6, 'pop', 0.4); const lk = P('D01', 0.12);
  sfx(lk, 'impact', 0.6); sfx(lk, 'buzz', 0.5); sfx(lk + 0.3, 'stamp', 0.6); sfx(P('D01', 0.4), 'pop', 0.3); sfx(P('D01', 0.6), 'boing', 0.4); });

// ---- 引入：团队要有规矩 ----
SC.why = (t, blk, en) => {
  bgLecture(t, GOLD); lecturer(t, blk, en, blk.t0);
  const sw = S('G01_02') - 0.2, a1 = 1 - eIO(prog(t, sw, 0.35));
  if (a1 > 0) { ctx.save(); ctx.globalAlpha *= a1;
    pill(1270, 130, '👥 团队要有规矩', CLUE, popIn(t, blk.t0 + 0.1), { fs: 42, font: F_BODY + ',' + EMOJI });
    [['🚪', '谁能推', 'main 要保护', RULEC, P('G01_01', 0.42)], ['👀', '谁来审', '对的人审对的文件', OWNC, P('G01_01', 0.6)], ['🚀', '怎么发版本', '标签一推就发布', RELC, P('G01_01', 0.78)]].forEach((c, i) => {
      const s = popIn(t, c[4], 0.4); if (s <= 0) return; const x = 890 + i * 380; ctx.save(); ctx.translate(x, 470); ctx.scale(s, s); ctx.rotate((i - 1) * 0.04);
      box(-170, -200, 340, 400, 26, '#fffaf0', c[3], 7); txt(c[0], 0, -80, 100, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 0, 50, 36, '#1b1433', { align: 'center' }); txt(c[2], 0, 120, 24, c[3], { align: 'center', max: 300 });
      ctx.restore(); });
    if (t >= P('G01_01', 0.15)) fancy('一个人会用还不够', 1270, 800, 60, t, P('G01_01', 0.15), FX.white);
    ctx.restore(); }
  if (t >= sw) { const a = eOut(prog(t, sw, 0.35)); ctx.save(); ctx.globalAlpha *= a;
    const s = popIn(t, sw + 0.05, 0.45); ctx.save(); ctx.translate(1270, 440); ctx.scale(s, s); ctx.rotate(-0.02);
    box(-430, -320, 860, 600, 30, '#fffaf0', GOLD, 8); capIcon(-330, -250, 0.7, { rot: -0.2 }); txt('🎓 毕业考试', 0, -250, 52, '#7a5b00', { align: 'center', font: EMOJI + ',' + F_FANCY, bold: false });
    const eps = ['存档', '云存档', '协作', '后悔药', '发布', 'Pages', 'Actions', '变基', '侦探', '开源', '体检'];
    eps.forEach((e, i) => { const tt = P('G01_02', 0.1 + i * 0.035), k = popIn(t, tt, 0.3); if (k <= 0) return; const col = i % 4, row = Math.floor(i / 4);
      const fx = -300 + col * 200, fy = -130 + row * 90; ctx.save(); ctx.translate(fx, fy); ctx.scale(k, k); box(-90, -34, 180, 68, 16, '#fff', ACC, 3);
      txt(String(i + 1), -62, 0, 24, ACC, { align: 'center', font: F_CODE }); txt(e, 14, 1, 24, '#1b1433', { align: 'center', font: isCJK(e) ? F_BODY : F_CODE, max: 120 }); ctx.restore(); });
    if (t >= P('G01_02', 0.62)) { const p = eOut(prog(t, P('G01_02', 0.62), 0.4)); box(-380, 140, 760 * p, 90, 22, FLOWC); if (p > 0.9) txt('➡ 一整套团队工作流', 0, 186, 40, '#fff', { align: 'center', font: EMOJI + ',' + F_BODY }); }
    ctx.restore(); ctx.restore(); }
};
SFX_FNS.push(() => { const b = BK.why; sfx(b.t0 + 0.1, 'pop', 0.4); [0.42, 0.6, 0.78].forEach(f => sfx(P('G01_01', f), 'pop', 0.4)); sfx(P('G01_01', 0.15), 'ding', 0.3);
  sfx(S('G01_02') - 0.2, 'swoosh_in', 0.4); for (let i = 0; i < 11; i++) sfx(P('G01_02', 0.1 + i * 0.035), 'pop', 0.15); sfx(P('G01_02', 0.62), 'whoosh', 0.4); sfx(P('G01_02', 0.75), 'sparkle', 0.4); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#3d2a00', '#d4a017', W * 0.6, H * 0.45, 28, 0.2);
  ['🎓', '🛡️', '🏷️', '🚀', '✨'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  sprite('g_grad', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 60, 1040);
  sprite('d_leader', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 780);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-400, -10, 95, '#ff5c8a', '第12集', { fs: 48, rot: -0.15, fg: '#fff' });
    fancy('最终回', 40, -70, 120, t, -99, FX.white);
    fancy('毕业篇！', 110, 80, 150, t, -99, FX.yel);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况（左侧插图，画在 100..940）----
const L_RULEQ = () => { const t0 = BK.ruleQ.t0; return [{ s: 'git push origin main', t: t0 + 0.2, cmd: true, dur: 0.3 }, { s: '{y}remote: Bypassed rule violations for refs/heads/main:', t: P('X01', 0.4) },
  { s: '{y}remote: - Changes must be made through a pull request.', t: P('X01', 0.45) }, { s: '{g}   4b7d1aa..e81f3c2  main -> main', t: P('X01', 0.55) }]; };
function probRuleQ(t, blk) {
  terminal(t, 100, 200, 840, 330, L_RULEQ(), { title: '终端 — Grok（管理员）', accent: '#d6283e', fs: 21, prompt: false });
  const cr = P('X01', 0.55); shield(520, 660, popIn(t, blk.t0 + 0.3) * 0.9, RULEC, { crack: t >= cr, rot: t >= cr ? 0.08 : 0 });
  if (t >= P('X01', 0.4)) pill(250, 640, '管理员', '#ffd23f', popIn(t, P('X01', 0.4)), { fs: 30, font: F_BODY });
  if (U.D02 && t >= U.D02.vo + 0.3) stamp(t, U.D02.vo + 0.3, 760, 760, '能绕过？！', BADC, 56, -0.08);
}
function probOwnQ(t, blk) {
  const t0 = blk.t0; ghWin(100, 170, 840, 600, 'github.com/pulls/review-requested');
  txt('👀 Review requests', 130, 265, 28, '#24292f', { font: EMOJI + ',' + F_CODE }); const n = Math.min(30, Math.floor(clamp((t - t0 - 0.2) / 2) * 30)); pill(860, 265, String(n), BADC, popIn(t, t0 + 0.2), { fs: 28, fg: '#fff' });
  const T = ['修改首页标题', '更新 README', '深色模式样式', '修复按钮错位', '新增文档页', '调整配色'];
  T.forEach((s, i) => issueRow(t, 130, 310 + i * 76, 780, { t: t0 + 0.3 + i * 0.12, title: s, num: '#' + (31 - i), labels: [['review', i % 2 ? '#1971c2' : '#e07a3d']] }));
  if (U.D03 && t >= U.D03.vo + 0.3) stamp(t, U.D03.vo + 0.3, 700, 800, '按文件分？', OWNC, 54, -0.08);
}
function probChkQ(t, blk) {
  const t0 = blk.t0, sn = P('M01', 0.5); box(100, 200, 840, 520, 26, '#fff', '#d0d7de', 4); txt('🔀 PR #18 · 首页改版', 130, 250, 30, '#24292f', { font: EMOJI + ',' + F_BODY + ',' + F_CODE });
  const R = [['🟢', 'feat: 首页改版', '3 天前', t0 + 0.15], ['✅', 'Claude approved these changes', '1 小时前', t0 + 0.3], ['😼', 'Gemini: 偷偷加一行', '刚刚', sn]];
  R.forEach((r, i) => { const a = clamp(prog(t, r[3], 0.2)); if (a <= 0) return; const y = 300 + i * 120; ctx.save(); ctx.globalAlpha *= a; if (i < 2) seg(150, y + 40, 150, y + 120, '#d0d7de', 1, 5);
    box(130, y, 780, 90, 14, i === 2 ? '#fff5f5' : '#f6f8fa', i === 2 ? BADC : '#d0d7de', i === 2 ? 4 : 2); txt(r[0], 170, y + 45, 34, '#000', { align: 'center', font: EMOJI, bold: false });
    txt(r[1], 210, y + 45, 26, '#24292f', { font: isCJK(r[1]) ? F_BODY + ',' + F_CODE : F_CODE, max: 560 }); txt(r[2], 890, y + 45, 20, '#57606a', { align: 'right', bold: false }); ctx.restore(); });
  if (t >= sn + 0.2) note(520, 680, popIn(t, sn + 0.2), '批准之后又改了！', BADC, { fs: 30 });
  if (U.D04 && t >= U.D04.vo + 0.3) stamp(t, U.D04.vo + 0.3, 720, 800, '还算数吗？', CHKC, 54, -0.08);
}
function probMrgQ(t, blk) {
  const t0 = blk.t0, dp = eOut(prog(t, P('B01', 0.45), 0.35)); const s = popIn(t, t0 + 0.1, 0.4); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 420); ctx.scale(s, s); ctx.translate(-520, -420);
  mergeBox(t, 110, 170, 820, [[1, 'All checks have passed', '1 successful check'], [1, 'Changes approved', '1 approving review']], { btn: 1, label: 'Create a merge commit', hotArrow: t >= P('B01', 0.3) && dp < 1, drop: dp });
  ctx.restore();
  if (U.D05 && t >= U.D05.vo + 0.3) stamp(t, U.D05.vo + 0.3, 700, 850, '闭眼点第一个', MRGC, 50, -0.08);
}
function probRelQ(t, blk) {
  const t0 = blk.t0; box(100, 200, 840, 520, 26, 'rgba(15,12,31,0.92)', '#fff', 5); txt('📦 手动发布 v1.9.3（第 23 次）', 140, 260, 30, '#fff', { font: EMOJI + ',' + F_BODY + ',' + F_CODE });
  [['🗜️', '打包成 zip'], ['📝', '手写更新说明'], ['⬆️', '上传附件'], ['🔢', '核对版本号']].forEach((c, i) => { const a = clamp(prog(t, t0 + 0.3 + i * 0.25, 0.2)); if (a <= 0) return; const y = 330 + i * 90; ctx.save(); ctx.globalAlpha *= a;
    box(140, y, 760, 72, 14, '#2a2350', '#5a5580', 3); txt(c[0], 180, y + 36, 34, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 220, y + 36, 28, '#fff', {}); txt('😩', 860, y + 36, 32, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore(); });
  if (U.D06 && t >= U.D06.vo + 0.3) stamp(t, U.D06.vo + 0.3, 700, 790, '好累……', RELC, 58, -0.08);
}
const NOTES = [['①', '存档读档'], ['②', 'push / pull'], ['③', 'PR 协作'], ['④', '后悔药'], ['⑤', 'tag 发布'], ['⑥', 'Pages'], ['⑦', 'Actions'], ['⑧', 'rebase'], ['⑨', 'bisect'], ['⑩', 'Fork 开源'], ['⑪', '仓库体检']];
function probFlowQ(t, blk) {
  const t0 = blk.t0; box(100, 190, 840, 560, 26, '#fff8e1', '#c99a2e', 6); txt('📒 Kimi 的笔记', 140, 245, 30, '#7a5b00', { font: EMOJI + ',' + F_BODY });
  NOTES.forEach((n, i) => { const s = popIn(t, t0 + 0.2 + i * 0.06, 0.3); if (s <= 0) return; const px = 210 + ((i * 263) % 640), py = 330 + ((i * 157) % 360), r = ((i * 37) % 9 - 4) * 0.05;
    ctx.save(); ctx.translate(px, py); ctx.scale(s, s); ctx.rotate(r); box(-90, -40, 180, 80, 8, ['#ffe066', '#a5d8ff', '#b2f2bb', '#ffc9c9'][i % 4], null); txt(n[0] + ' ' + n[1], 0, 1, 22, '#1b1433', { align: 'center', font: F_BODY + ',' + F_CODE, max: 168 }); ctx.restore(); });
  if (U.D07 && t >= U.D07.vo + 0.3) stamp(t, U.D07.vo + 0.3, 700, 810, '先做什么？', FLOWC, 54, -0.08);
}
function probAsk12(t, blk) {
  const t0 = blk.t0;
  [['🛡️ 守', RULEC], ['🤝 合', MRGC], ['🚀 发', RELC]].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s > 0) { ctx.save(); ctx.translate(250 + i * 270, 480); ctx.scale(s, s); ctx.rotate((i - 1) * 0.06); box(-110, -140, 220, 280, 24, '#fff', c[1], 8); txt(c[0], 0, 0, 52, '#1b1433', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false }); ctx.restore(); } });
  if (t >= t0 + 0.6) txt('三个重点', 520, 760, 64, ACC, { align: 'center', font: F_FANCY, bold: false });
}
function probAskP(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.1, 0.4); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 440); ctx.scale(s, s); ctx.translate(-520, -440);
  box(130, 170, 780, 560, 26, '#fff', GOODC, 7); txt('🚀 白饭页 v2.0 · 发布清单', 520, 225, 36, GOODC, { align: 'center', font: EMOJI + ',' + F_BODY });
  [['🛡️', '保护规则', '待办'], ['👀', 'CODEOWNERS', '待办'], ['🔀', 'PR + 审查', '待办'], ['🏷️', '标签发布', '待办']].forEach((c, i) => checkRow(170, 280 + i * 98, 700, c[0], c[1], c[2], false, clamp(prog(t, t0 + 0.3 + i * 0.1, 0.2))));
  ctx.restore();
  if (t >= P('D09', 0.5)) stamp(t, P('D09', 0.5), 520, 800, '发出去！', GOODC, 64, -0.08);
}
const PROB = {
  ruleQ: { chap: ['第①题', '不许绕过', RULEC, F_BODY], q: '能绕过去？', bg: ['#fff0e0', '#ffd9b3'], draw: probRuleQ },
  ownQ: { chap: ['第②题', 'CODEOWNERS', OWNC, F_CODE], q: '按文件分？', bg: ['#e3f0ff', '#c4defc'], draw: probOwnQ },
  chkQ: { chap: ['第③题', '批准作废', CHKC, F_BODY], q: '还算数吗？', bg: ['#e3f7e9', '#c2edd0'], draw: probChkQ },
  mrgQ: { chap: ['第④题', '三种合并', MRGC, F_BODY], q: '选哪个？', bg: ['#efe8ff', '#dccfff'], draw: probMrgQ },
  relQ: { chap: ['第⑤题', '自动发布', RELC, F_BODY], q: '好累……', bg: ['#fff3d6', '#ffe2a8'], draw: probRelQ },
  flowQ: { chap: ['第⑥题', '团队工作流', FLOWC, F_BODY], q: '先做什么？', bg: ['#dff6f8', '#bdebef'], draw: probFlowQ },
  ask12: { chap: ['复习', '守 · 合 · 发', ACC, F_BODY], q: '帮我划重点！', bg: ['#ece3ff', '#d6c4ff'], draw: probAsk12 },
  askP: { chap: ['实战', '白饭页 2.0', GOODC, F_BODY], q: '发出去！', bg: ['#e3f7e9', '#c2edd0'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  termSfx(L_RULEQ()); sfx(P('X01', 0.4), 'buzz', 0.3); sfx(P('X01', 0.55), 'impact', 0.4); sfx(U.D02.vo + 0.3, 'stamp', 0.6);
  for (let i = 0; i < 6; i++) sfx(BK.ownQ.t0 + 0.3 + i * 0.12, 'pop', 0.2); sfx(U.D03.vo + 0.3, 'stamp', 0.6);
  sfx(BK.chkQ.t0 + 0.15, 'pop', 0.3); sfx(BK.chkQ.t0 + 0.3, 'ding', 0.3); sfx(P('M01', 0.5), 'buzz', 0.4); sfx(U.D04.vo + 0.3, 'stamp', 0.6);
  sfx(BK.mrgQ.t0 + 0.1, 'pop', 0.4); sfx(P('B01', 0.45), 'whoosh', 0.4); sfx(U.D05.vo + 0.3, 'stamp', 0.6);
  for (let i = 0; i < 4; i++) sfx(BK.relQ.t0 + 0.3 + i * 0.25, 'pop', 0.25); sfx(U.D06.vo + 0.3, 'stamp', 0.6);
  for (let i = 0; i < 11; i++) sfx(BK.flowQ.t0 + 0.2 + i * 0.06, 'pop', 0.15); sfx(U.D07.vo + 0.3, 'stamp', 0.6);
  [0, 1, 2].forEach(i => sfx(BK.ask12.t0 + 0.15 + i * 0.12, 'pop', 0.3)); sfx(BK.askP.t0 + 0.1, 'pop', 0.4); sfx(P('D09', 0.5), 'stamp', 0.6);
});

// ---- 讲解①：保护规则不许绕过（Grok）----
const L_RULE = () => [{ s: 'git push origin main', t: S('G02_03') + 0.05, cmd: true, dur: 0.3 }, { s: '{r}remote: error: GH006: Protected branch update failed for refs/heads/main.', t: P('G02_03', 0.35) },
  { s: '{r}remote: error: Changes must be made through a pull request.', t: P('G02_03', 0.42) }, { s: '{r} ! [remote rejected] main -> main (protected branch hook declined)', t: P('G02_03', 0.5) }];
SC.rule = (t, blk, en) => {
  bgLecture(t, RULEC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G02_01'), g2 = S('G02_02') - 0.15, g3 = S('G02_03') - 0.15, g4 = U.X02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    ghWin(680, 110, 1180, 640, 'github.com/dafeiyu/rice-page/settings/branches'); pill(1500, 70, '第3集复习', CLUE, popIn(t, g1 + 0.05), { fs: 28, font: F_BODY });
    txt('🛡️ Branch protection rule · main', 720, 210, 30, '#24292f', { font: EMOJI + ',' + F_CODE });
    [['Require a pull request before merging', '必须走 PR', 0.3], ['Allow force pushes', '默认关闭：不许强制推送', 0.55, true], ['Allow deletions', '默认关闭：不许删除', 0.75, true]].forEach((r, i) => {
      const tt = P('G02_01', r[2]); ghCheck(t, 720, 260 + i * 110, 820, r[0], r[1], r[3] ? 0 : clamp(prog(t, tt, 0.25)), popIn(t, tt - 0.15), { hot: t >= tt && t < tt + 0.8 });
      if (r[3] && t >= tt) stamp(t, tt + 0.1, 1480, 303 + i * 110, '🚫', BADC, 40, 0); });
    shield(1720, 600, popIn(t, P('G02_01', 0.2)) * 1.0, RULEC, { glow: true });
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fadeW(t, g2, g3); ctx.save(); ctx.globalAlpha *= a;
    const lock = P('G02_02', 0.5);
    box(680, 110, 1180, 400, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
    shield(1270, 310, 1.1, RULEC, { glow: t >= lock }); txt('main', 1270, 430, 30, '#fff', { align: 'center', font: F_CODE });
    const ap = eIO(prog(t, g2 + 0.3, 1.0)); const px = lerp(760, 1760, ap);
    if (t < lock) { ctx.save(); ctx.setLineDash([14, 10]); ctx.strokeStyle = CLUE; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(800, 330); ctx.quadraticCurveTo(1270, 90, 1740, 330); ctx.stroke(); ctx.restore();
      const qx = lerp(800, 1740, ap), qy = 330 - Math.sin(ap * Math.PI) * 120; txt('👑', qx, qy - 10, 60, '#000', { align: 'center', font: EMOJI, bold: false }); pill(1270, 160, '管理员默认能绕过', CLUE, popIn(t, g2 + 0.4), { fs: 28, font: F_BODY }); }
    else { const bx = lerp(800, 1130, eOut(prog(t, lock, 0.4))); txt('👑', bx, 320, 60, '#000', { align: 'center', font: EMOJI, bold: false }); if (t >= lock + 0.4) stamp(t, lock + 0.4, 1000, 220, '✗ 绕不过', BADC, 44, -0.1); }
    ghCheck(t, 700, 540, 1140, 'Do not allow bypassing the above settings', '不允许绕过：管理员也一样', clamp(prog(t, lock, 0.25)), popIn(t, P('G02_02', 0.3)), { hot: t >= P('G02_02', 0.3), fs: 28 });
    if (t >= P('G02_02', 0.7)) fancy('管理员也得走 PR！', 1270, 720, 68, t, P('G02_02', 0.7), FX.orange);
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    terminal(t, 680, 160, 1180, 360, L_RULE(), { title: '终端 — 直接推 main', accent: BADC, fs: 22, prompt: false });
    if (t >= P('G02_03', 0.35)) { flash(t, P('G02_03', 0.35), 0.12, '255,60,90'); stamp(t, P('G02_03', 0.55), 1270, 640, '推送被拒 · GH006', BADC, 64, -0.06); }
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['X02']); sfx(S('G02_01') + 0.05, 'pop', 0.4); [0.3, 0.55, 0.75].forEach(f => sfx(P('G02_01', f), 'ding', 0.3)); [0.55, 0.75].forEach(f => sfx(P('G02_01', f) + 0.1, 'stamp', 0.35)); sfx(P('G02_01', 0.2), 'pop', 0.4);
  sfx(S('G02_02') - 0.15, 'swoosh_in', 0.4); sfx(S('G02_02') + 0.3, 'whoosh', 0.4); sfx(P('G02_02', 0.3), 'pop', 0.4); sfx(P('G02_02', 0.5), 'ding', 0.5); sfx(P('G02_02', 0.5) + 0.4, 'stamp', 0.5); sfx(P('G02_02', 0.7), 'sparkle', 0.4);
  sfx(S('G02_03') - 0.15, 'swoosh_in', 0.4); termSfx(L_RULE()); sfx(P('G02_03', 0.35), 'buzz', 0.5); sfx(P('G02_03', 0.55), 'stamp', 0.6); });

// ---- 讲解②：CODEOWNERS（Claude）----
SC.own = (t, blk, en) => {
  bgLecture(t, OWNC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G03_01'), g3 = S('G03_03') - 0.15, g4 = U.C02.vo - 0.3;
  if (t < g3 + 0.3) { const a = fadeW(t, g1, g3); ctx.save(); ctx.globalAlpha *= a;
    const fs = popIn(t, g1 + 0.05); if (fs > 0) { ctx.save(); ctx.globalAlpha *= clamp(fs); box(680, 110, 520, 150, 18, '#fff', '#d0d7de', 3);
      txt('📁 rice-page', 700, 145, 24, '#24292f', { font: EMOJI + ',' + F_CODE }); txt('└ 📁 .github', 720, 185, 24, '#24292f', { font: EMOJI + ',' + F_CODE });
      box(760, 205, 320, 40, 8, t >= P('G03_01', 0.3) ? '#fffbe6' : '#fff', t >= P('G03_01', 0.3) ? CLUE : '#fff', 3); txt('└ 📄 CODEOWNERS', 770, 226, 24, OWNC, { font: EMOJI + ',' + F_CODE }); ctx.restore(); }
    const h1 = P('G03_02', 0.1), h2 = P('G03_02', 0.35);
    const L = [{ s: '# 路径          负责人', t: P('G03_01', 0.45), dim: true }, { s: '/docs/          @claude', t: P('G03_01', 0.6), hl: [h1, h2 + 0.6] }, { s: '*.css           @gemini', t: P('G03_01', 0.7), hl: [h2, h2 + 0.9] }, { s: '/.github/       @dafeiyu', t: P('G03_01', 0.8) }];
    ymlEditor(t, 680, 280, 620, 330, 'CODEOWNERS', L, { fs: 28, accent: OWNC });
    if (t >= P('G03_01', 0.62)) note(990, 670, popIn(t, P('G03_01', 0.62)), '一行一条：路径 + 负责人', OWNC, { fs: 28 });
    const ps = popIn(t, S('G03_02') - 0.1, 0.4); if (ps > 0) { ctx.save(); ctx.translate(1590, 400); ctx.scale(ps, ps); ctx.translate(-1590, -400);
      box(1340, 110, 520, 600, 18, '#fff', '#d0d7de', 3); txt('🔀 PR #19 · Files changed', 1365, 150, 24, '#24292f', { font: EMOJI + ',' + F_CODE });
      [['docs/guide.md', h1], ['style.css', h2]].forEach((f, i) => { const a = clamp(prog(t, f[1], 0.2)); if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; box(1365, 185 + i * 62, 470, 50, 8, '#f6f8fa', '#d0d7de', 2); txt('📄 ' + f[0], 1380, 210 + i * 62, 22, '#24292f', { font: EMOJI + ',' + F_CODE }); ctx.restore(); });
      txt('Reviewers', 1365, 345, 24, '#57606a', { font: F_CODE });
      [['C', '@claude', h1 + 0.25], ['M', '@gemini', h2 + 0.25]].forEach((r, i) => { const s = popIn(t, r[2]); if (s <= 0) return; avatar(r[0], 1400, 410 + i * 110, 36, { s });
        txt(r[1], 1450, 400 + i * 110, 26, '#24292f', { font: F_CODE }); txt('code owner · 自动请求', 1450, 432 + i * 110, 20, OWNC, { bold: false }); });
      ctx.restore(); }
    if (t >= P('G03_02', 0.7)) fancy('改到谁的文件，就请谁审', 1270, 800, 58, t, P('G03_02', 0.7), FX.blue);
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    ghCheck(t, 700, 140, 1140, 'Require review from Code Owners', '需要代码负责人批准', clamp(prog(t, P('G03_03', 0.25), 0.25)), popIn(t, g3 + 0.1), { hot: t >= P('G03_03', 0.15), fs: 28 });
    const ok = t >= P('G03_03', 0.85);
    mergeBox(t, 760, 290, 1020, [[1, 'All checks have passed', 'check — 23s'], [ok ? 1 : 3, ok ? 'Approved by code owner @claude' : 'Review required', ok ? '负责人已批准' : '等待代码负责人 @claude 批准']], { btn: ok ? 1 : 0, label: 'Squash and merge' });
    if (t >= P('G03_03', 0.5) && !ok) stamp(t, P('G03_03', 0.5), 1600, 690, '🔒 合并不了', BADC, 46, -0.08);
    if (ok) stamp(t, P('G03_03', 0.85), 1600, 690, '✓ 可以合并', GOODC, 46, -0.08);
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['C02']); sfx(S('G03_01') + 0.05, 'pop', 0.4); sfx(P('G03_01', 0.3), 'ding', 0.3); [0.45, 0.6, 0.7, 0.8].forEach(f => typeSfx(P('G03_01', f), 18, 0.35)); sfx(P('G03_01', 0.62), 'pop', 0.3);
  sfx(S('G03_02') - 0.1, 'swoosh_in', 0.4); [0.1, 0.35].forEach(f => { sfx(P('G03_02', f), 'pop', 0.3); sfx(P('G03_02', f) + 0.25, 'ding', 0.35); }); sfx(P('G03_02', 0.7), 'sparkle', 0.4);
  sfx(S('G03_03') - 0.15, 'swoosh_in', 0.4); sfx(P('G03_03', 0.25), 'ding', 0.4); sfx(P('G03_03', 0.5), 'buzz', 0.4); sfx(P('G03_03', 0.85), 'stamp', 0.5); });

// ---- 讲解③：新提交让批准作废 + 状态检查（Gemini）----
SC.chk = (t, blk, en) => {
  bgLecture(t, CHKC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G04_01'), g2 = S('G04_02') - 0.15, g3 = S('G04_03') - 0.15, g4 = U.M02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    ghCheck(t, 700, 120, 1140, 'Dismiss stale pull request approvals when new commits are pushed', '推送新提交时，旧批准作废', clamp(prog(t, P('G04_01', 0.25), 0.25)), popIn(t, g1 + 0.05), { hot: t >= P('G04_01', 0.15), fs: 24 });
    box(680, 250, 1180, 480, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
    const nc = P('G04_01', 0.5), dz = P('G04_01', 0.62);
    gDot(820, 420, popIn(t, g1 + 0.2), ORIC, { r: 30, lab: '首页改版', fs: 24 }); seg(850, 420, 1120, 420, '#5a5580', clamp(prog(t, nc - 0.2, 0.3)), 8);
    if (t >= nc) gDot(1150, 420, popIn(t, nc), BADC, { r: 30, lab: '偷偷加一行', fs: 24, glow: true, t });
    const ap = popIn(t, g1 + 0.35); if (ap > 0) { ctx.save(); ctx.translate(820, 310); ctx.scale(ap, ap); ctx.globalAlpha *= t >= dz ? 0.45 : 1; pill(0, 0, '✓ Approved · Claude', GOODC, 1, { fs: 26, fg: '#fff', font: F_CODE }); ctx.restore();
      if (t >= dz) { ctx.save(); ctx.strokeStyle = BADC; ctx.lineWidth = 8; const p = eOut(prog(t, dz, 0.25)); ctx.beginPath(); ctx.moveTo(660, 310); ctx.lineTo(lerp(660, 980, p), 310); ctx.stroke(); ctx.restore(); pill(1500, 310, 'Dismissed · 批准作废', BADC, popIn(t, dz + 0.1), { fs: 28, fg: '#fff', font: F_BODY }); } }
    if (t >= P('G04_01', 0.78)) fancy('改动一变，得重新审！', 1270, 640, 64, t, P('G04_01', 0.78), FX.red);
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fadeW(t, g2, g3); ctx.save(); ctx.globalAlpha *= a;
    ghCheck(t, 700, 120, 1140, 'Require status checks to pass before merging', '合并前必须通过状态检查', clamp(prog(t, P('G04_02', 0.2), 0.25)), popIn(t, g2 + 0.1), { hot: t >= P('G04_02', 0.1) && t < P('G04_02', 0.5), fs: 26 });
    const sel = popIn(t, P('G04_02', 0.4)); if (sel > 0) { ctx.save(); ctx.translate(1270, 290); ctx.scale(sel, sel); box(-500, -40, 1000, 80, 14, '#fff', CHKC, 4); txt('✔ check', -470, 0, 28, CHKC, { font: F_CODE }); txt('← 第7集写的 Actions 工作流', -300, 0, 26, '#57606a', { bold: false }); ctx.restore(); }
    const red = t >= P('G04_02', 0.6);
    mergeBox(t, 760, 360, 1020, [[red ? 2 : 0, red ? 'Some checks were not successful' : 'Some checks haven\'t completed yet', red ? 'check — 失败' : 'check — 运行中'], [1, 'Changes approved', '1 approving review']], { btn: 0, label: 'Merge pull request' });
    if (red) stamp(t, P('G04_02', 0.7), 1600, 750, '红叉 → 不能合并', BADC, 46, -0.08);
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    ghCheck(t, 700, 170, 1140, 'Require branches to be up to date before merging', '分支先和 main 同步', clamp(prog(t, P('G04_03', 0.3), 0.25)), popIn(t, g3 + 0.1), { hot: t >= P('G04_03', 0.2) && t < P('G04_03', 0.55), fs: 26 });
    ghCheck(t, 700, 290, 1140, 'Require conversation resolution before merging', '所有评论都处理完', clamp(prog(t, P('G04_03', 0.6), 0.25)), popIn(t, P('G04_03', 0.45)), { hot: t >= P('G04_03', 0.55), fs: 26 });
    mergeBox(t, 760, 430, 1020, [[1, 'All checks have passed', 'check — 23s'], [1, 'All conversations resolved', '评论已处理']], { btn: t >= P('G04_03', 0.85) ? 1 : 0, label: 'Squash and merge' });
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['M02']); sfx(S('G04_01') + 0.05, 'pop', 0.4); sfx(P('G04_01', 0.25), 'ding', 0.4); sfx(S('G04_01') + 0.35, 'pop', 0.3); sfx(P('G04_01', 0.5), 'pop', 0.4); sfx(P('G04_01', 0.62), 'buzz', 0.4); sfx(P('G04_01', 0.78), 'impact', 0.4);
  sfx(S('G04_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G04_02', 0.2), 'ding', 0.4); sfx(P('G04_02', 0.4), 'pop', 0.4); sfx(P('G04_02', 0.6), 'buzz', 0.5); sfx(P('G04_02', 0.7), 'stamp', 0.5);
  sfx(S('G04_03') - 0.15, 'swoosh_in', 0.4); sfx(P('G04_03', 0.3), 'ding', 0.4); sfx(P('G04_03', 0.6), 'ding', 0.4); sfx(P('G04_03', 0.85), 'sparkle', 0.4); });

// ---- 讲解④：三种合并（豆包）----
function mergeGraph(t, k, cx, cy, t0) {
  const mainY = cy + 90, featY = cy - 30, x0 = cx - 150;
  for (let i = 0; i < 2; i++) { gDot(x0 + i * 90, mainY, popIn(t, t0 + i * 0.05), MAINC, { r: 18 }); if (i) seg(x0, mainY, x0 + 90, mainY, '#8a84b8', clamp(prog(t, t0, 0.2)), 7); }
  const fx = [x0 + 120, x0 + 190, x0 + 260];
  if (k === 0) { fx.forEach((x, i) => { seg(i ? fx[i - 1] : x0 + 90, i ? featY : mainY, x, featY, FEATC, clamp(prog(t, t0 + 0.2 + i * 0.1, 0.2)), 7); gDot(x, featY, popIn(t, t0 + 0.25 + i * 0.1), FEATC, { r: 16 }); });
    seg(x0 + 90, mainY, x0 + 300, mainY, '#8a84b8', clamp(prog(t, t0 + 0.6, 0.25)), 7); seg(fx[2], featY, x0 + 300, mainY, FEATC, clamp(prog(t, t0 + 0.7, 0.25)), 7); gDot(x0 + 300, mainY, popIn(t, t0 + 0.85), MRGC, { r: 22, mark: 'M' }); }
  else if (k === 1) { fx.forEach((x, i) => { ctx.save(); ctx.globalAlpha *= 1 - eIO(prog(t, t0 + 0.6, 0.4)) * 0.7; gDot(x, featY, popIn(t, t0 + 0.2 + i * 0.08), FEATC, { r: 16 }); ctx.restore(); });
    seg(x0 + 90, mainY, x0 + 220, mainY, '#8a84b8', clamp(prog(t, t0 + 0.6, 0.25)), 7); gDot(x0 + 220, mainY, popIn(t, t0 + 0.8), MRGC, { r: 24, mark: 'S' }); if (t >= t0 + 0.6) txt('3 → 1', x0 + 190, featY - 50, 26, MRGC, { align: 'center', font: F_CODE }); }
  else { fx.forEach((x, i) => { const p = eIO(prog(t, t0 + 0.4 + i * 0.12, 0.4)); const xx = lerp(x, x0 + 90 + (i + 1) * 70, p), yy = lerp(featY, mainY, p); if (i || p > 0) seg(i ? lerp(fx[i - 1], x0 + 90 + i * 70, p) : x0 + 90, i ? yy : mainY, xx, yy, p > 0.99 ? '#8a84b8' : FEATC, clamp(prog(t, t0 + 0.2, 0.2)), 7); gDot(xx, yy, popIn(t, t0 + 0.2 + i * 0.08), p > 0.99 ? MRGC : FEATC, { r: 16 }); }); }
}
SC.mrg = (t, blk, en) => {
  bgLecture(t, MRGC); lecturer(t, blk, en, blk.t0);
  const g4 = S('G05_04') - 0.15, g5 = U.B02.vo - 0.3;
  const C = [['Create a merge commit', '历史最完整', 'G05_01', '保留每个提交 + 合并提交'], ['Squash and merge', '最清爽', 'G05_02', '一个 PR = 一个提交'], ['Rebase and merge', '一条直线', 'G05_03', '逐个接到 main 后面']];
  if (t < g4 + 0.3) { const a = fadeW(t, S('G05_01') - 0.2, g4); ctx.save(); ctx.globalAlpha *= a;
    C.forEach((c, i) => { const t0 = S(c[2]) - 0.1, s = popIn(t, t0, 0.4); if (s <= 0) return; const act = t >= t0 && (i === 2 || t < S(C[i + 1][2]) - 0.1); const x = 880 + i * 390;
      ctx.save(); ctx.translate(x, 430); ctx.scale(s * (act ? 1.04 : 0.96), s * (act ? 1.04 : 0.96)); ctx.globalAlpha *= act ? 1 : 0.6; if (act) { ctx.shadowColor = MRGC; ctx.shadowBlur = 36; }
      box(-185, -310, 370, 620, 26, '#1b1730', act ? MRGC : '#5a5580', 6); ctx.shadowBlur = 0; box(-185, -310, 370, 90, [26, 26, 0, 0], act ? MRGC : '#3a3358');
      txt(String(i + 1), -150, -265, 40, '#fff', { align: 'center', font: F_FANCY, bold: false }); txt(c[0], 12, -265, 23, '#fff', { align: 'center', font: F_CODE, max: 300 });
      ctx.restore();
      ctx.save(); ctx.globalAlpha *= act ? 1 : 0.6; mergeGraph(t, i, x, 330, t0 + 0.2);
      txt(c[3], x, 560, 24, '#e4defa', { align: 'center', max: 340 }); pill(x, 650, c[1], act ? CLUE : '#8a84b8', popIn(t, P(c[2], 0.6)), { fs: 30, font: F_BODY }); ctx.restore(); });
    ctx.restore(); }
  if (t >= g4 - 0.1) { const a = fadeW(t, g4, g5); ctx.save(); ctx.globalAlpha *= a;
    ghWin(680, 120, 1180, 600, 'github.com/dafeiyu/rice-page/settings');
    txt('Pull Requests', 720, 220, 32, '#24292f', { font: F_CODE });
    [['Allow merge commits', 0, 0.12], ['Allow squash merging', 1, 0.2], ['Allow rebase merging', 0, 0.28]].forEach((r, i) => ghCheck(t, 720, 260 + i * 80, 600, r[0], null, r[1] ? 1 : 0, popIn(t, P('G05_04', r[2])), { h: 64 }));
    const ad = P('G05_04', 0.6); ghCheck(t, 720, 530, 1100, 'Automatically delete head branches', '合并后自动删除分支', clamp(prog(t, ad, 0.25)), popIn(t, ad - 0.2), { hot: t >= ad - 0.1, fs: 26 });
    if (t >= P('G05_04', 0.35)) note(1590, 340, popIn(t, P('G05_04', 0.35)), '只留团队选定的', MRGC, { fs: 30 });
    if (t >= ad + 0.3) stamp(t, ad + 0.3, 1650, 460, '🧹 不堆旧分支', GOODC, 40, -0.08);
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['B02']); ['G05_01', 'G05_02', 'G05_03'].forEach(id => { sfx(S(id) - 0.1, 'swoosh_in', 0.4); for (let k = 0; k < 4; k++) sfx(S(id) + 0.15 + k * 0.12, 'pop', 0.18); sfx(P(id, 0.6), 'ding', 0.35); });
  sfx(S('G05_04') - 0.15, 'swoosh_in', 0.4); [0.12, 0.2, 0.28].forEach(f => sfx(P('G05_04', f), 'pop', 0.25)); sfx(P('G05_04', 0.35), 'pop', 0.3); sfx(P('G05_04', 0.6), 'ding', 0.4); sfx(P('G05_04', 0.6) + 0.3, 'stamp', 0.5); });

// ---- 讲解⑤：推标签自动发布（千问）----
const REL_YML = [['name: release', 'G06_02', 0.1], ['on:', 'G06_02', 0.18], ['  push:', 'G06_02', 0.24], ["    tags: ['v*']", 'G06_02', 0.3], ['permissions:', 'G06_04', 0.1], ['  contents: write', 'G06_04', 0.18], ['jobs:', 'G06_03', 0.05], ['  release:', 'G06_03', 0.09],
  ['    runs-on: ubuntu-latest', 'G06_03', 0.13], ['    steps:', 'G06_03', 0.17], ['      - uses: actions/checkout@v4', 'G06_03', 0.21], ['      - run: zip -r site.zip dist', 'G06_03', 0.27], ['      - run: gh release create "$GITHUB_REF_NAME" site.zip --generate-notes', 'G06_03', 0.4], ['        env:', 'G06_03', 0.5], ['          GH_TOKEN: ${{ github.token }}', 'G06_03', 0.54]];
SC.rel = (t, blk, en) => {
  bgLecture(t, RELC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G06_01'), g2 = S('G06_02') - 0.15, g5 = U.Q02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    const s1 = popIn(t, P('G06_01', 0.1)), s2 = popIn(t, P('G06_01', 0.42)), j = eIO(prog(t, P('G06_01', 0.72), 0.4));
    [[s1, '第5集', '🏷️', '标签 + Release', GOLD, 960], [s2, '第7集', '⚙️', 'GitHub Actions', CHKC, 1580]].forEach((c, i) => { if (c[0] <= 0) return; const x = lerp(c[5], i ? 1380 : 1160, j);
      ctx.save(); ctx.translate(x, 400); ctx.scale(c[0], c[0]); box(-200, -230, 400, 460, 28, '#fffaf0', c[4], 8); pill(0, -230, c[1], c[4], 1, { fs: 30, fg: '#fff', font: F_BODY });
      txt(c[2], 0, -60, 120, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[3], 0, 110, 34, '#1b1433', { align: 'center', font: isCJK(c[3]) ? F_BODY + ',' + F_CODE : F_CODE, max: 360 }); ctx.restore(); });
    if (t >= P('G06_01', 0.3) && j < 0.5) txt('+', 1270, 400, 120, '#fff', { align: 'center', font: F_FANCY, bold: false });
    if (j >= 1) fancy('接起来 = 自动发布！', 1270, 760, 72, t, P('G06_01', 0.72) + 0.4, FX.orange);
    ctx.restore(); }
  if (t >= g2 - 0.1) { const a = fadeW(t, g2, g5); ctx.save(); ctx.globalAlpha *= a;
    const L = REL_YML.map((r, i) => ({ s: r[0], t: P(r[1], r[2]), dur: 0.3, hl: i === 3 ? [P('G06_02', 0.4), S('G06_03')] : i === 5 ? [P('G06_04', 0.25), P('G06_04', 0.55)] : i === 12 ? [P('G06_03', 0.5), S('G06_04')] : null }));
    ymlEditor(t, 680, 110, 820, 700, '.github/workflows/release.yml', L, { fs: 21, accent: RELC });
    if (t >= P('G06_02', 0.45) && t < S('G06_03')) note(1090, 770, popIn(t, P('G06_02', 0.45)), '推送 v 开头的标签就运行', RELC, { fs: 28 });
    if (t >= P('G06_03', 0.65) && t < S('G06_04')) note(1090, 770, popIn(t, P('G06_03', 0.65)), '建 Release + 写说明 + 附文件', RELC, { fs: 28 });
    if (t >= P('G06_04', 0.3) && t < P('G06_04', 0.6)) note(1090, 770, popIn(t, P('G06_04', 0.3)), '给工作流写入权限', BADC, { fs: 28 });
    const pt = P('G06_04', 0.6); const rs = popIn(t, S('G06_03') + 0.2, 0.4);
    if (t >= pt) { cmdBar(t, 1090, 770, 'git push origin v2.0.0', pt, 0.6, { fs: 26, col: RELC }); }
    tagChip(1690, 200, popIn(t, P('G06_02', 0.35)) * 0.9, 'v2.0.0');
    const gp = popIn(t, P('G06_03', 0.2)); if (gp > 0) { ctx.save(); ctx.translate(1690, 360); ctx.scale(gp, gp); ctx.rotate(t * 2); txt('⚙️', 0, 0, 90, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore(); seg(1690, 240, 1690, 310, RELC, 1, 6); }
    if (rs > 0) { ctx.save(); ctx.translate(1690, 590); ctx.scale(rs, rs); box(-170, -160, 340, 320, 20, '#fff', RELC, 6); txt('📦 v2.0.0', -140, -120, 28, '#24292f', { font: EMOJI + ',' + F_CODE }); pill(110, -120, 'Latest', '#1f883d', 1, { fs: 20, fg: '#fff' });
      txt("What's Changed", -140, -60, 22, '#24292f', { font: F_CODE }); ['· 深色模式 #21', '· 修复按钮 #22'].forEach((l, i) => txt(l, -140, -20 + i * 36, 20, '#57606a', { bold: false, font: F_BODY + ',' + F_CODE }));
      txt('Assets', -140, 70, 22, '#24292f', { font: F_CODE }); txt('📎 site.zip', -140, 110, 22, '#0969da', { font: EMOJI + ',' + F_CODE }); ctx.restore(); seg(1690, 410, 1690, 430, RELC, 1, 6); }
    if (t >= pt + 0.7) { const p = eIO(prog(t, pt + 0.7, 0.6)); tagChip(lerp(1240, 1690, p), lerp(770, 200, p) - Math.sin(p * Math.PI) * 80, 0.6, 'v2.0.0'); if (p >= 1) stamp(t, pt + 1.3, 1690, 790, '自动发布 ✓', GOODC, 44, -0.08); }
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['Q02']); sfx(P('G06_01', 0.1), 'pop', 0.4); sfx(P('G06_01', 0.42), 'pop', 0.4); sfx(P('G06_01', 0.72), 'whoosh', 0.4); sfx(P('G06_01', 0.72) + 0.4, 'impact', 0.5);
  sfx(S('G06_02') - 0.15, 'swoosh_in', 0.4); REL_YML.forEach(r => typeSfx(P(r[1], r[2]), Math.min(20, r[0].length), 0.3)); sfx(P('G06_02', 0.35), 'pop', 0.4); sfx(P('G06_02', 0.45), 'ding', 0.35);
  sfx(P('G06_03', 0.2), 'pop', 0.3); sfx(S('G06_03') + 0.2, 'pop', 0.4); sfx(P('G06_03', 0.65), 'ding', 0.35); sfx(P('G06_04', 0.3), 'ding', 0.35);
  const pt = P('G06_04', 0.6); typeSfx(pt, 22, 0.6); sfx(pt + 0.7, 'whoosh', 0.4); sfx(pt + 1.3, 'stamp', 0.5); });

// ---- 讲解⑥：团队工作流七步（Kimi）----
const FLOW = [['📋', 'Issue 分任务', '#20', '第3集', 'G07_01', 0.2], ['🌿', '开分支', 'switch -c', '第3集', 'G07_01', 0.33], ['💾', '小步提交', 'commit', '第1集', 'G07_01', 0.45], ['🔀', '发 PR', 'Closes #20', '第3集', 'G07_01', 0.6],
  ['✅', '检查跑绿', 'Actions', '第7集', 'G07_02', 0.08], ['👀', '审查 + 合并', '删分支', '第12集', 'G07_02', 0.25], ['🏷️', '打标签发布', 'v2.0.0', '第5集', 'G07_02', 0.65]];
const FLOWXY = i => i < 4 ? [830 + i * 290, 220] : [1700 - (i - 4) * 290, 470];
SC.flow = (t, blk, en) => {
  bgLecture(t, FLOWC); lecturer(t, blk, en, blk.t0);
  const end = U.K02.vo - 0.3;
  ctx.save(); ctx.globalAlpha *= fadeW(t, S('G07_01') - 0.2, end);
  FLOW.forEach((f, i) => { const tt = P(f[4], f[5]), s = popIn(t, tt, 0.35); if (s <= 0) return; const [x, y] = FLOWXY(i);
    if (i) { const [px, py] = FLOWXY(i - 1); const p = clamp(prog(t, tt - 0.1, 0.25)); if (i === 4) { ctx.save(); ctx.strokeStyle = FLOWC; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(1700 + 60, 345, 125, -Math.PI / 2, -Math.PI / 2 + Math.PI * p); ctx.stroke(); ctx.restore(); }
      else seg(px + (i < 4 ? 120 : -120), py, px + (i < 4 ? 120 : -120) + (x - px + (i < 4 ? -240 : 240)) * p, y, FLOWC, 1, 8); }
    const act = t >= tt && (i === 6 || t < P(FLOW[i + 1][4], FLOW[i + 1][5]));
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.08 : 1), s * (act ? 1.08 : 1)); if (act) { ctx.shadowColor = FLOWC; ctx.shadowBlur = 30; }
    box(-120, -90, 240, 180, 22, '#fff', FLOWC, act ? 7 : 4); ctx.shadowBlur = 0; txt(String(i + 1), -96, -64, 30, FLOWC, { align: 'center', font: F_FANCY, bold: false });
    txt(f[0], 0, -38, 52, '#000', { align: 'center', font: EMOJI, bold: false }); txt(f[1], 0, 22, 27, '#1b1433', { align: 'center', font: F_BODY + ',' + F_CODE, max: 220 }); txt(f[2], 0, 58, 20, FLOWC, { align: 'center', font: F_CODE + ',' + F_BODY, max: 220 });
    ctx.restore(); pill(x + 80, y - 90, f[3], CLUE, popIn(t, tt + 0.15) * 0.75, { fs: 22, font: F_BODY }); });
  const g3 = S('G07_03') - 0.1;
  if (t >= g3) { [['💊', '后悔药', '第4集', 0.25], ['🔍', 'Git 侦探', '第9集', 0.45], ['🩺', '仓库体检', '第11集', 0.68]].forEach((c, i) => { const s = popIn(t, P('G07_03', c[3])); if (s <= 0) return; const x = 900 + i * 370;
      ctx.save(); ctx.translate(x, 700); ctx.scale(s, s); ctx.rotate((i - 1) * 0.03); box(-160, -70, 320, 140, 20, '#fff5f5', BADC, 5); txt(c[0], -105, 0, 60, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 20, -18, 30, '#1b1433', { align: 'center' }); txt(c[2], 20, 26, 24, BADC, { align: 'center' }); ctx.restore(); });
    pill(1270, 610, '🧰 出岔子也不慌', BADC, popIn(t, g3 + 0.05), { fs: 28, fg: '#fff', font: F_BODY + ',' + EMOJI }); }
  ctx.restore();
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['K02']); FLOW.forEach(f => sfx(P(f[4], f[5]), 'pop', 0.35)); sfx(P('G07_02', 0.8), 'sparkle', 0.4); sfx(S('G07_03') - 0.1, 'swoosh_in', 0.4); [0.25, 0.45, 0.68].forEach(f => sfx(P('G07_03', f), 'pop', 0.4)); });

// ---- 复习：守 · 合 · 发 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const cards = [['🛡️ 守', RULEC, ['谁都不许绕过', 'PR 要批准 · 新提交作废', '检查不绿不合并'], 'G08_01'], ['🤝 合', MRGC, ['CODEOWNERS', '合并方式团队统一', '合完自动删分支'], 'G08_02'], ['🚀 发', RELC, ['推送 v 开头的标签', 'Actions 自动打包', '自动发 Release'], 'G08_03']];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.1, 0.4); if (s <= 0) return; const act = t >= S(c[3]) - 0.1 && (i === 2 || t < S(cards[i + 1][3]) - 0.1);
    const x = 870 + i * 400, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= S(c[3]) - 0.1 ? 1 : 0.5;
    if (act) { ctx.shadowColor = c[1]; ctx.shadowBlur = 40; } box(-180, -300, 360, 600, 28, '#fffaf0', c[1], 8); ctx.shadowBlur = 0;
    box(-180, -300, 360, 100, [28, 28, 0, 0], c[1]); txt(c[0], 0, -248, 46, '#fff', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false });
    c[2].forEach((l, k) => { const a = clamp(prog(t, P(c[3], 0.12 + k * 0.25), 0.25)); ctx.save(); ctx.globalAlpha *= 0.25 + 0.75 * a; box(-150, -170 + k * 140, 300, 110, 16, '#fff', '#e4dff5', 3); txt(l, 0, -170 + k * 140 + 55, 25, '#1b1433', { align: 'center', max: 280, font: /^[A-Z]{4}/.test(l) ? F_CODE : F_BODY + ',' + F_CODE }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= P('G08_03', 0.8)) fancy('守 · 合 · 发，团队工作流到手！', 1270, 880, 54, t, P('G08_03', 0.8), FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2].forEach(i => sfx(BK.recap.t0 + 0.1 + i * 0.1, 'pop', 0.3)); ['G08_01', 'G08_02', 'G08_03'].forEach(id => { for (let k = 0; k < 3; k++) sfx(P(id, 0.12 + k * 0.25), 'ding', 0.25); }); sfx(P('G08_03', 0.8), 'sparkle', 0.5); });

// ---- 实战：白饭页 2.0 团队发布 ----
const L_PR = () => [{ s: '{p}Settings → Rules：PR · 1 人批准 · check · 不许绕过 ✓', t: P('G09_01', 0.15) }, { s: '{p}.github/CODEOWNERS：/docs/ @claude   *.css @gemini ✓', t: P('G09_01', 0.65) },
  { s: 'git switch -c feat/dark-mode', t: P('G09_02', 0.3), cmd: true, dur: 0.35 }, { s: 'git commit -am "深色模式" && git push -u origin feat/dark-mode', t: P('G09_02', 0.5), cmd: true, dur: 0.5 }, { s: '{c}PR #21 已创建 · Closes #20', t: P('G09_02', 0.85) },
  { s: '{y}Gemini 推送新提交 → 旧批准作废，检查重跑', t: P('G09_03', 0.15) }, { s: '{g}✓ check 通过 · Claude approved', t: P('G09_03', 0.7) },
  { s: '{g}Squash and merge ✓  分支已删除  Issue #20 已关闭', t: P('G09_04', 0.3) },
  { s: 'git tag -a v2.0.0 -m "白饭页 2.0" && git push origin v2.0.0', t: P('G09_05', 0.12), cmd: true, dur: 0.55 }, { s: '{g}Actions: release ✓ → Release v2.0.0 已发布', t: P('G09_05', 0.6) }];
SC.practice = (t, blk, en) => {
  bgLecture(t, GOODC); lecturer(t, blk, en, blk.t0);
  const end = S('D10') - 0.2;
  stepBar(t, [['规则', S('G09_01')], ['Issue + PR', S('G09_02')], ['审查', S('G09_03')], ['合并', S('G09_04')], ['发布', S('G09_05')]], 800, 88, 235, end, { t0: blk.t0 + 0.15 });
  const ta = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha *= ta;
  box(670, 150, 1210, 300, 24, '#fff', '#d0d7de', 4); txt('🔀 #21 深色模式 · Closes #20', 700, 190, 28, '#24292f', { font: EMOJI + ',' + F_BODY + ',' + F_CODE });
  const g3 = S('G09_03'), dis = t >= P('G09_03', 0.12) && t < P('G09_03', 0.65), okR = t >= P('G09_03', 0.65), merged = t >= P('G09_04', 0.3);
  if (t < S('G09_02') + 0.5) txt('（还没有 PR）', 1275, 320, 34, '#c9ced6', { align: 'center' });
  else if (merged) { pill(1275, 300, '🟣 Merged · 分支已删除', MRGC, popIn(t, P('G09_04', 0.3)), { fs: 36, fg: '#fff', font: F_BODY + ',' + EMOJI + ',' + F_CODE }); txt('Issue #20 ✓ closed', 1275, 380, 26, '#8250df', { align: 'center', font: F_CODE }); }
  else { const rows = [[t < g3 ? 1 : dis ? 0 : 1, t < g3 || okR ? 'All checks have passed' : 'check 重跑中…', 'check · Actions'], [dis ? 2 : t < S('G09_02') + 1 ? 3 : 1, dis ? 'Approval dismissed（新提交）' : okR ? 'Approved by @claude（code owner）' : 'Approved by @claude', 'code owner']];
    rows.forEach((r, i) => { const y = 250 + i * 80; statusIcon(720, y + 20, 20, r[0] === 3 ? 0 : r[0], t); txt(r[1], 760, y + 8, 26, '#24292f', { font: F_CODE + ',' + F_BODY, max: 1060 }); txt(r[2], 760, y + 40, 20, '#57606a', { bold: false, font: F_CODE }); }); }
  terminal(t, 670, 470, 1210, 430, L_PR(), { title: '终端 — rice-page', accent: GOODC, fs: 22, prompt: false });
  ctx.restore();
  if (t < S('G09_01') + 0.6) fancy('毕业实战！', 1280, 500, 110, t, blk.t0 + 0.2, Object.assign({ wobble: 3 }, FX.orange));
  if (t >= P('G09_05', 0.35) && t < end) tagChip(1700, 820, popIn(t, P('G09_05', 0.35)), 'v2.0.0');
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_party', 1620, H + 30, 900, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    const s = popIn(t, end + 0.05, 0.4); ctx.save(); ctx.translate(1000, 400); ctx.scale(s, s); box(-300, -230, 600, 460, 26, '#fff', RELC, 7);
    txt('📦 白饭页 v2.0.0', -260, -175, 36, '#24292f', { font: EMOJI + ',' + F_BODY + ',' + F_CODE }); pill(200, -175, 'Latest', '#1f883d', 1, { fs: 22, fg: '#fff' });
    [['🛡️', '规则', '不许绕过'], ['👀', '审查', 'Claude ✓'], ['✅', '检查', '全绿'], ['🏷️', '标签', 'v2.0.0']].forEach((r, i) => checkRow(-260, -120 + i * 84, 520, r[0], r[1], r[2], true, 1)); ctx.restore();
    stamp(t, end + 0.4, 1330, 120, '发布成功 ✓', GOODC, 60, -0.1);
    fancy('白饭页 2.0 上线！', 980, 740, 92, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 5; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(b.t0 + 0.2, 'impact', 0.6); termSfx(L_PR());
  sfx(P('G09_01', 0.15), 'ding', 0.3); sfx(P('G09_01', 0.65), 'ding', 0.3); sfx(P('G09_02', 0.85), 'pop', 0.4); sfx(P('G09_03', 0.12), 'buzz', 0.4); sfx(P('G09_03', 0.65), 'ding', 0.4);
  sfx(P('G09_04', 0.3), 'impact', 0.5); sfx(P('G09_04', 0.3) + 0.1, 'sparkle', 0.4); sfx(P('G09_05', 0.35), 'pop', 0.4); sfx(P('G09_05', 0.6), 'ding', 0.5);
  const e = S('D10') - 0.2; sfx(e, 'swoosh_in', 0.5); sfx(e + 0.4, 'stamp', 0.7); sfx(e + 0.3, 'sparkle', 0.6); sfx(e + 0.4, 'confetti', 0.6); });

// ---- 毕业典礼 ----
const EPWALL = [['存档读档', '💾'], ['云存档', '☁️'], ['联机协作', '🤝'], ['后悔药', '💊'], ['版本发布', '🏷️'], ['Pages', '🌐'], ['Actions', '⚙️'], ['变基', '✂️'], ['Git 侦探', '🔍'], ['参与开源', '🍴'], ['仓库体检', '🩺'], ['毕业篇', '🎓']];
const GRAD_SQ = ['Q03', 'C03', 'M03', 'X03', 'B03', 'K03'];
SC.grad = (t, blk, en) => {
  const t0 = blk.t0, d11 = U.D11.vo - 0.3; bgBurst(t, '#3d2a00', '#d4a017', W * 0.55, H * 0.45, 26, 0.15);
  sprite('g_grad', lerp(-400, 300, eBack(prog(t, t0, 0.5))), H + 120, 1100, { scale: breath(t, 0) });
  const wa = 1 - eIO(prog(t, d11, 0.35));
  if (wa > 0) { ctx.save(); ctx.globalAlpha *= wa; fancy('十二集，毕业啦！', 1280, 110, 72, t, t0 + 0.1, FX.yel);
    EPWALL.forEach((e, i) => { const s = popIn(t, P('G10_01', 0.05 + i * 0.045), 0.3); if (s <= 0) return; const x = 830 + (i % 4) * 290, y = 270 + Math.floor(i / 4) * 200;
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); box(-130, -80, 260, 160, 20, i === 11 ? '#fff3c4' : '#fff', i === 11 ? GOLD : ACC, i === 11 ? 7 : 4);
      txt(e[1], -78, 0, 52, '#000', { align: 'center', font: EMOJI, bold: false }); txt('第' + (i + 1) + '集', 40, -26, 22, ACC, { align: 'center' }); txt(e[0], 40, 18, 28, '#1b1433', { align: 'center', font: isCJK(e[0]) ? F_BODY + ',' + F_CODE : F_CODE, max: 150 }); ctx.restore(); });
    if (t >= P('G10_01', 0.75)) fancy('大肥鱼，你毕业了！', 1280, 880, 70, t, P('G10_01', 0.75), FX.pink);
    ctx.restore(); }
  if (t >= d11) {
    const p = spring(prog(t, d11, 0.8)); sprite('d_grad', 1060, H + 40, 940, { scale: lerp(1.15, 1, p) * breath(t, 2) });
    diploma(1560, 640, popIn(t, d11 + 0.4, 0.45) * 0.62, '大肥鱼', { rot: 0.05 });
    for (let i = 0; i < 5; i++) { const c0 = d11 + 0.5 + i * 0.12, u = prog(t, c0, 1.6); if (u > 0 && u < 1) capIcon(780 + i * 230, 900 - Math.sin(u * Math.PI) * 760, 0.6, { rot: t * 4 + i }); }
    confetti(t, d11 + 0.3, 110, 12, 1150, 300);
    GRAD_SQ.forEach((id, i) => { const e = U[id]; const k = id[0]; const s = popIn(t, d11 + 0.2 + i * 0.06); const x = 780 + i * 210, y = 110; const on = t >= e.vo - 0.15 && t < e.t1 + 0.25;
      avatar(k, x, y + (on ? 8 : 0), on ? 66 : 54, { s }); if (t >= e.vo - 0.15) { const bp = popIn(t, e.vo - 0.1, 0.3); if (on && bp > 0) pill(x, y + 110, TEXT[id], SQ[k].col, bp, { fs: 30, fg: '#fff', font: F_BODY }); } });
    if (t >= U.Q03.vo - 0.2) fancy('恭喜毕业！', 1060, 880, 90, t, U.Q03.vo - 0.2, FX.yel);
  }
};
SFX_FNS.push(() => { const b = BK.grad; sfx(b.t0 + 0.05, 'swoosh_in', 0.5); sfx(b.t0 + 0.1, 'sparkle', 0.4); for (let i = 0; i < 12; i++) sfx(P('G10_01', 0.05 + i * 0.045), 'pop', 0.18); sfx(P('G10_01', 0.75), 'ding', 0.5);
  const d = U.D11.vo - 0.3; sfx(d, 'impact', 0.6); sfx(d + 0.3, 'confetti', 0.6); sfx(d + 0.4, 'stamp', 0.5); for (let i = 0; i < 5; i++) sfx(d + 0.5 + i * 0.12, 'whoosh', 0.2);
  GRAD_SQ.forEach(id => sfx(U[id].vo - 0.1, 'pop', 0.35)); });

// ---- 完结 + 番外预告 + 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#5f3dc4');
  const outro = E('G10_03') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G10_03;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G10_03'), 0.3);
  if (ot < 1) {
    fancy('正片完结！', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G10_02', 0.3), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 480); ctx.scale(bp, bp); ctx.translate(-1260, -480);
      box(860, 230, 800, 500, 24, '#ffffff', '#5f3dc4', 6);
      txt('🎁 番外预告', 900, 285, 38, '#5f3dc4', { font: EMOJI + ',' + F_BODY });
      [['🔑', 'SSH 与多账号', '公司号 / 个人号不串', P('G10_02', 0.45)], ['🖱️', '图形界面工具', '不敲命令也能用 Git', P('G10_02', 0.62)], ['✨', '更多番外', '评论区点菜', P('G10_02', 0.78)]].forEach((c, i) => { const s = popIn(t, c[3]); if (s <= 0) return; ctx.save(); ctx.translate(1260, 380 + i * 115); ctx.scale(s, s);
        box(-360, -50, 720, 100, 16, '#f6f8fa', '#5f3dc4', 3); txt(c[0], -320, 0, 50, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], -260, -16, 30, '#24292f', { font: F_BODY + ',' + F_CODE }); txt(c[2], -260, 26, 22, '#5f3dc4', { font: F_BODY + ',' + F_CODE, bold: false }); ctx.restore(); });
      ctx.restore(); }
    fancy('敬请期待！', 1260, 850, 66, t, P('G10_02', 0.85), FX.pink);
  }
  if (ot > 0) {
    ctx.fillStyle = `rgba(10,8,22,${0.78 * ot})`; ctx.fillRect(...OS);
    [['👍', '点赞', '#ff5c8a'], ['🪙', '投币', '#ffd23f'], ['⭐', '收藏', '#3ec1ff']].forEach((ic, i) => {
      const a = popIn(t, S('G10_03') + 0.4 + i * 0.32, 0.4); if (a <= 0) return;
      const x = W / 2 + (i - 1) * 330, y = 440;
      ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(t * 5 + i) * 0.06);
      ctx.fillStyle = ic[2]; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.font = `110px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic[0], 0, 8); ctx.restore();
      fancy(ic[1], x, y + 180, 60, t, S('G10_03') + 0.5 + i * 0.32, { c1: '#fff', c2: '#eee', stroke: ic[2] });
    });
    fancy('一键三连，番外见！', W / 2, 180, 92, t, S('G10_03') + 1.4, { stagger: 0.04 });
    if (t > outro) {
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_grad', 1690, H + 40, 640, { scale: sa }); }
      SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
    ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
    ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G10_02', 0.3), 'pop', 0.6); [0.45, 0.62, 0.78].forEach(f => sfx(P('G10_02', f), 'pop', 0.4)); sfx(P('G10_02', 0.85), 'ding', 0.5);
  [0, 1, 2].forEach(k => sfx(S('G10_03') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G10_03') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸（每个都对应一个知识点）=================
const CAMEOS = [
  ['d_shock', P('G02_03', 0.6), E('G02_03')], ['d_sparkle', P('G03_02', 0.8), E('G03_02')],
  ['d_ok', P('G05_02', 0.7), E('G05_02')], ['d_happy', P('G06_01', 0.85), E('G06_01')],
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
