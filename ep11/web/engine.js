// AI娘 Git课 · 第11集 渲染引擎 —— renderAt(t) 纯函数，逐帧确定性导出（通用部分沿用第1集）
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const F_FANCY = '"Smiley", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const F_BODY = '"Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const F_CODE = 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", "Microsoft YaHei", "Noto Sans CJK SC", monospace';

// ================= 素材 =================
const SPR = {};
const SPR_NAMES = ['g_explain', 'g_point', 'g_wink', 'g_cheer', 'g_warn', 'g_think', 'g_shock', 'g_proud', 'g_type', 'g_peace', 'g_awkward', 'g_present', 'd_panic', 'd_curious', 'd_happy', 'd_raise', 'd_think', 'd_shock', 'd_sparkle', 'd_ok', 'd_relief', 'd_leader', 'q_base', 'q_point', 'q_tea', 'c_base', 'c_ok', 'c_cool', 'm_base', 'm_panic', 'm_cheeky', 'x_base', 'x_angry', 'x_force', 'b_base', 'b_sorry', 'k_base', 'k_read', 'g_pill', 'd_pill', 'm_oops', 'q_alarm', 'b_wave', 'x_panic', 'k_diary', 'c_read', 'g_tag', 'd_party', 'b_proud', 'm_tag', 'x_thumb', 'k_scroll', 'g_web', 'd_phone', 'm_photo', 'x_doubt', 'b_point', 'g_check', 'd_robot', 'm_clock', 'c_lock', 'b_badge', 'g_scissors', 'd_tangle', 'd_film', 'b_squash', 'g_detective', 'd_detective', 'b_cherry', 'g_fork', 'd_medal', 'm_review', 'g_doctor', 'd_heavy', 'c_key'];
// 竖版立绘只显示上半身：显示高度占整张图的比例（头顶到腰）
const SPRC = { d_panic: 0.55, d_curious: 0.55, d_happy: 0.55, d_sparkle: 0.6, d_ok: 0.66, d_raise: 0.72, d_think: 0.7, d_relief: 0.82, d_shock: 0.82, d_leader: 0.7, q_base: 0.6, q_point: 0.6, q_tea: 0.6, c_base: 0.58, c_ok: 0.58, c_cool: 0.58, m_base: 0.62, m_panic: 0.6, m_cheeky: 0.62, x_base: 0.6, x_angry: 0.6, x_force: 0.66, b_base: 0.62, b_sorry: 0.62, k_base: 0.6, k_read: 0.6, d_pill: 0.6, m_oops: 0.62, q_alarm: 0.6, b_wave: 0.62, x_panic: 0.62, k_diary: 0.6, c_read: 0.58, d_party: 0.68, b_proud: 0.6, m_tag: 0.62, x_thumb: 0.66, k_scroll: 0.62, d_phone: 0.66, m_photo: 0.6, x_doubt: 0.62, b_point: 0.62, d_robot: 0.66, m_clock: 0.62, c_lock: 0.6, b_badge: 0.62, d_tangle: 0.62, d_film: 0.64, b_squash: 0.7, d_detective: 0.64, b_cherry: 0.62, d_medal: 0.64, m_review: 0.62, d_heavy: 0.66, c_key: 0.6 };
const loadImg = n => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'sprites/' + n + '.webp'; SPR[n] = im; });


// ================= 台词（由 subtitles.json 生成，改台词请改 _gen_script.py）=================
const TEXT = {
  D01: "推送被拒了？！说我的设计稿有 180 MB，超过了 100 MB 的上限……",
  G01_01: "仓库用久了也要体检：有没有虚胖的大文件、乱掉的换行符，还有不小心推上去的密钥。",
  G01_02: "就像去医院体检：量体重、查指标，发现问题马上处理。今天三项全查！",
  G01_03: "欢迎来到 AI娘 Git 课，第十一集，仓库体检！",
  Q01: "用户反馈：克隆白饭页仓库，要等整整十分钟！",
  D02: "一个小网页，仓库怎么这么胖？",
  G02_01: "Git 会把每个版本都存下来。一个 180 MB 的设计稿改十次，历史里就存了十份。",
  G02_02: "量体重：git count-objects -vH，看 size-pack 这一项，就是仓库压缩后的大小。",
  G02_03: "GitHub 的规矩：单个文件超过 50 MB 会警告，超过 100 MB 直接拒收；仓库最好别超过 1 GB。",
  Q02: "收到，我转告用户：仓库正在减肥！",
  X01: "这还不简单？把设计稿删了，再提交一次。",
  D03: "……还是被拒了？！",
  G03_01: "删除只是又多了一个提交，旧提交里那份设计稿还在，推送时照样要带上。",
  G03_02: "还没推送的话：git rm --cached 把它移出仓库，再 git commit --amend 改写最后一个提交。",
  G03_03: "早就推送过的，就得改写历史：用第八集的交互式变基，或者后面要讲的 filter-repo。",
  X02: "原来历史也得清。这下真懂了。",
  B01: "家人们！设计稿就是这么大，那还能放进仓库吗？",
  D04: "对啊，设计稿总得有个地方放吧？",
  G04_01: "用 Git LFS，大文件专用存储。先 git lfs install，再 git lfs track \"*.psd\"。",
  G04_02: "track 会把规则写进 .gitattributes，记得把这个文件也提交上去。",
  G04_03: "之后仓库里只存一张小小的指针：文件编号和大小。真文件放在 LFS 存储里，用到才下载。",
  G04_04: "已经在历史里的，用 git lfs migrate import 一次性搬过去。免费额度：存储 10 GB，每月流量 10 GB。",
  G04_05: "注意：Pages 网站读不到 LFS 文件，网页上要用的图片，别放进 LFS。",
  B02: "指针小小一条，仓库轻飘飘！",
  M01: "喵？我只是打开保存了一下，怎么整个文件都变红了？",
  D05: "一行没改，全都算改动？",
  G05_01: "换行符的锅：Windows 每行结尾是 CRLF，Mac 和 Linux 是 LF。编辑器一转换，每一行都变了。",
  G05_02: "在 .gitattributes 里写上 * text=auto：文本文件统一换行，进仓库时自动整理好。",
  G05_03: "脚本单独指定 eol=lf，图片标成 binary 别碰。加完规则，用 git add --renormalize . 整理一遍。",
  M02: "这回只红了我改的那一行喵！",
  C01: "安全审查：config.js 里写着支付接口的密钥，三个月前就推上去了。",
  D06: "那我赶紧删掉那一行！",
  G06_01: "推上去的密钥，就当它已经泄露：公开仓库很快就会被自动扫描程序翻到。",
  G06_02: "第一步，马上去服务后台作废旧密钥、换一把新的。旧的作废了，就算被翻到也没用。",
  G06_03: "新密钥放进 .env，代码从环境变量里读；.env 写进 .gitignore，已经被跟踪的用 git rm --cached 移出去。",
  C02: "先换钥匙，再谈打扫。批准。",
  K01: "我把历史全翻了一遍：三个月前那个提交里，旧密钥还在。",
  D07: "钥匙都换了，还要清吗？",
  G07_01: "旧密钥作废后，很多时候这就够了。要彻底清掉，就用 git filter-repo。",
  G07_02: "加上 --sensitive-data-removal：用 --invert-paths --path 删掉整个文件，或者 --replace-text 只替换密钥。",
  G07_03: "然后 git push --force --mirror 覆盖远程。所有人重新克隆，旧分支要接到新历史上，千万别合并，不然又带回来了。",
  G07_04: "旧 PR 里的缓存，要联系 GitHub Support 清理。以后还有推送保护：往公开仓库推密钥，会被直接拦下。",
  K02: "日记里那一页，撕干净了。",
  D08: "体检项目好多……帮我划个重点！",
  G08_01: "瘦：大文件交给 Git LFS，已经进历史的用 migrate 搬走；成品下载包放 Release。",
  G08_02: "齐：.gitattributes 写上 text=auto，换行符统一，改动只算真改的那几行。",
  G08_03: "救：密钥推上去先作废换新，再用 filter-repo 清历史、强制推送，所有人重新克隆。",
  D09: "我这就给白饭页做一次全面体检！",
  G09_01: "先量体重：count-objects 一看，2.1 GB，元凶是设计稿文件夹。",
  G09_02: "git lfs track \"*.psd\"，提交 .gitattributes；再用 migrate import 把历史里的设计稿搬进 LFS。",
  G09_03: "加上 * text=auto，renormalize 整理一遍：换行符的假改动全没了。",
  G09_04: "旧密钥作废换新，新密钥放进 .env；filter-repo 用 --replace-text 把旧密钥从历史里抹掉，强制推送。",
  G09_05: "再量一次：只剩 12 MB，克隆三秒完成，体检报告全绿！",
  D10: "仓库瘦身成功！体检全部通过！",
  G10_01: "下集预告：毕业篇！分支保护、打标签发版本、团队协作流程，把十二集学的串成一条线！",
  G10_02: "喜欢的话，一键三连！我们下集毕业典礼见！",
};
const DUR = Object.assign({}, window.DUR || {});

// ================= 时间轴 =================
const V = (b, id, pose) => ({ k: 'v', b, id, pose });
const BEAT = (b, d) => ({ k: 'beat', b, d: b === 'teaser' ? d * 0.75 : d * 0.35 });
const CH_COL = ['#7c5cff', '#3ec1ff', '#22c08b', '#ffb020', '#ff5c8a', '#ff7a3d', '#a66bff', '#ffd23f'];
const PLAN = [
  V('cold', 'D01', 'd_heavy'),
  V('why', 'G01_01', 'g_doctor'), V('why', 'G01_02', 'g_explain'),
  V('title', 'G01_03', 'g_cheer'), BEAT('title', 1.4),
  V('sizeQ', 'Q01', 'q_alarm'), V('sizeQ', 'D02', 'd_curious'),
  V('size', 'G02_01', 'g_explain'), V('size', 'G02_02', 'g_type'), V('size', 'G02_03', 'g_warn'), V('size', 'Q02', 'q_point'),
  V('delQ', 'X01', 'x_force'), V('delQ', 'D03', 'd_shock'),
  V('del', 'G03_01', 'g_think'), V('del', 'G03_02', 'g_type'), V('del', 'G03_03', 'g_scissors'), V('del', 'X02', 'x_thumb'),
  V('lfsQ', 'B01', 'b_wave'), V('lfsQ', 'D04', 'd_curious'),
  V('lfs', 'G04_01', 'g_type'), V('lfs', 'G04_02', 'g_point'), V('lfs', 'G04_03', 'g_explain'), V('lfs', 'G04_04', 'g_present'), V('lfs', 'G04_05', 'g_warn'), V('lfs', 'B02', 'b_proud'),
  V('eolQ', 'M01', 'm_oops'), V('eolQ', 'D05', 'd_shock'),
  V('eol', 'G05_01', 'g_explain'), V('eol', 'G05_02', 'g_type'), V('eol', 'G05_03', 'g_check'), V('eol', 'M02', 'm_cheeky'),
  V('leakQ', 'C01', 'c_lock'), V('leakQ', 'D06', 'd_panic'),
  V('leak', 'G06_01', 'g_warn'), V('leak', 'G06_02', 'g_point'), V('leak', 'G06_03', 'g_type'), V('leak', 'C02', 'c_key'),
  V('histQ', 'K01', 'k_diary'), V('histQ', 'D07', 'd_think'),
  V('hist', 'G07_01', 'g_think'), V('hist', 'G07_02', 'g_detective'), V('hist', 'G07_03', 'g_warn'), V('hist', 'G07_04', 'g_check'), V('hist', 'K02', 'k_scroll'),
  V('ask11', 'D08', 'd_happy'),
  V('recap', 'G08_01', 'g_present'), V('recap', 'G08_02', 'g_point'), V('recap', 'G08_03', 'g_proud'),
  V('askP', 'D09', 'd_leader'),
  V('practice', 'G09_01', 'g_doctor'), V('practice', 'G09_02', 'g_type'), V('practice', 'G09_03', 'g_check'), V('practice', 'G09_04', 'g_scissors'), V('practice', 'G09_05', 'g_proud'), V('practice', 'D10', 'd_medal'),
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
// ================= 第11集：仓库体检 =================
Object.assign(SQ.Q, { role: '用户反馈' }); Object.assign(SQ.X, { role: '删了再说' }); Object.assign(SQ.B, { role: '设计稿太大' });
Object.assign(SQ.M, { role: '全红了' }); Object.assign(SQ.C, { role: '安全审查' }); Object.assign(SQ.K, { role: '翻遍历史' });
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

// ---- 第11集专用组件 ----
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

// ---- 冷开场：推送被拒（文件 180 MB）----
const L_COLD = () => { const t0 = BK.cold.t0, lk = P('D01', 0.1); return [{ s: 'git push', t: t0 + 0.05, cmd: true, dur: 0.25 }, { s: '{d}Writing objects: 100% (12/12), 180.02 MiB', t: t0 + 0.35 },
  { s: '{r}remote: error: File design/白饭页设计稿.psd is 180.00 MB;', t: lk }, { s: "{r}remote: this exceeds GitHub's file size limit of 100.00 MB", t: lk + 0.1 },
  { s: '{y}remote: error: GH001: Large files detected.', t: lk + 0.2 }, { s: '{r} ! [remote rejected] main -> main (pre-receive hook declined)', t: lk + 0.3 }]; };
SC.cold = (t, blk) => {
  const t0 = blk.t0, lk = P('D01', 0.1); let [sx, sy] = shake(t, lk, 12, 0.35); ctx.translate(sx, sy);
  bgBurst(t, '#3a1020', '#c2255c', W * 0.62, H * 0.5, 22, 0.35);
  terminal(t, 860, 150, 1000, 430, L_COLD(), { title: '终端 — rice-page', accent: '#d6283e', fs: 22, prompt: false, scale: eBack(prog(t, t0, 0.4)) });
  if (t >= lk) { flash(t, lk, 0.15, '255,80,120'); stamp(t, lk + 0.35, 1560, 520, '推送被拒', BADC, 64, -0.1); }
  const g0 = P('D01', 0.3), gp = eOut(prog(t, g0, 0.7));
  if (t >= g0) { box(860, 630, 1000, 170, 22, 'rgba(15,12,31,0.94)', '#fff', 5);
    const bx = 900, bw = 920, by = 740; txt('🎨 白饭页设计稿.psd', bx, 675, 28, '#fff', { font: EMOJI + ',' + F_BODY });
    box(bx, by - 20, bw, 40, 20, '#2a2350'); box(bx, by - 20, Math.max(40, bw * 0.9 * gp), 40, 20, gp > 0.55 ? BADC : '#ff9f43');
    txt((180 * gp).toFixed(0) + ' MB', bx + Math.max(40, bw * 0.9 * gp) - 14, by + 1, 26, '#fff', { align: 'right', font: F_CODE });
    const lx = bx + bw * 0.5; ctx.save(); ctx.setLineDash([10, 8]); seg(lx, 650, lx, 790, CLUE, 1, 6); ctx.restore();
    if (t >= P('D01', 0.62)) pill(lx + 10, 660, '上限 100 MB', CLUE, popIn(t, P('D01', 0.62)), { fs: 26 }); }
  const p = spring(prog(t, t0, 0.9)); const sw = P('D01', 0.55);
  if (t < sw) sprite('d_heavy', 440, H + 40, 960, { scale: lerp(1.2, 1, p) * breath(t, 1) }); else sprite('d_shock', 440, H + 40, 990, { scale: lerp(1.15, 1, spring(prog(t, sw, 0.6))) });
  pill(440, 150, '大肥鱼 · 推送设计稿', SQ.D.col, popIn(t, t0 + 0.15), { font: F_FANCY, fs: 44, fg: '#fff' });
  if (t >= lk) fancy('推不上去？！', 440, 270, 80, t, lk + 0.1, { rot: -0.06, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
};
SFX_FNS.push(() => { const b = BK.cold; termSfx(L_COLD()); sfx(b.t0 + 0.15, 'pop', 0.4); const lk = P('D01', 0.1);
  sfx(lk, 'impact', 0.6); sfx(lk, 'buzz', 0.5); sfx(lk + 0.35, 'stamp', 0.6); sfx(P('D01', 0.3), 'whoosh', 0.4); sfx(P('D01', 0.55), 'boing', 0.4); sfx(P('D01', 0.62), 'ding', 0.4); });

// ---- 引入：仓库也要体检 ----
SC.why = (t, blk, en) => {
  bgLecture(t, DOCC); lecturer(t, blk, en, blk.t0);
  const sw = S('G01_02') - 0.2, a1 = 1 - eIO(prog(t, sw, 0.35));
  if (a1 > 0) { ctx.save(); ctx.globalAlpha *= a1;
    pill(1270, 130, '🩺 仓库用久了也要体检', CLUE, popIn(t, blk.t0 + 0.1), { fs: 42, font: F_BODY + ',' + EMOJI });
    [['🐘', '虚胖的大文件', '仓库越来越重', SIZEC, P('G01_01', 0.3)], ['↩️', '乱掉的换行符', 'CRLF / LF', EOLC, P('G01_01', 0.52)], ['🔑', '推上去的密钥', '谁都能看到', BADC, P('G01_01', 0.75)]].forEach((c, i) => {
      const s = popIn(t, c[4], 0.4); if (s <= 0) return; const x = 890 + i * 380; ctx.save(); ctx.translate(x, 470); ctx.scale(s, s); ctx.rotate((i - 1) * 0.04);
      box(-170, -200, 340, 400, 26, '#fffaf0', c[3], 7); txt(c[0], 0, -80, 100, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 0, 50, 36, '#1b1433', { align: 'center' }); txt(c[2], 0, 120, 26, c[3], { align: 'center', font: isCJK(c[2]) ? F_BODY : F_CODE });
      ctx.restore(); if (t >= c[4] + 0.3) stamp(t, c[4] + 0.3, x + 90, 300, '?', c[3], 60, 0.1); });
    ctx.restore(); }
  if (t >= sw) { const a = eOut(prog(t, sw, 0.35)); ctx.save(); ctx.globalAlpha *= a;
    const s = popIn(t, sw + 0.05, 0.45); ctx.save(); ctx.translate(1270, 470); ctx.scale(s, s); ctx.rotate(-0.02);
    box(-400, -330, 800, 660, 30, '#fff', DOCC, 8); box(-120, -360, 240, 60, 16, '#8a8f98'); txt('🩺 仓库体检单', 0, -250, 48, DOCC, { align: 'center', font: EMOJI + ',' + F_BODY });
    [['⚖️', '量体重', '仓库多大', 0.15], ['🔬', '查指标', '换行符 · 密钥', 0.4], ['💊', '马上处理', '发现就治', 0.62]].forEach((c, i) => { const y = -130 + i * 140, on = t >= P('G01_02', c[3]);
      box(-340, y - 55, 680, 110, 18, on ? '#effaf3' : '#f6f8fa', on ? GOODC : '#d0d7de', 3); txt(c[0], -290, y, 52, '#000', { align: 'center', font: EMOJI, bold: false });
      txt(c[1], -230, y - 14, 38, '#1b1433', {}); txt(c[2], -230, y + 30, 24, '#57606a', { bold: false }); box(230, y - 32, 64, 64, 12, '#fff', on ? GOODC : '#d0d7de', 4);
      if (on) { const k = eBack(prog(t, P('G01_02', c[3]), 0.3)); ctx.save(); ctx.translate(262, y); ctx.scale(k, k); txt('✓', 0, 0, 56, GOODC, { align: 'center' }); ctx.restore(); } });
    ctx.restore();
    if (t >= P('G01_02', 0.8)) fancy('今天三项全查！', 1270, 860, 72, t, P('G01_02', 0.8), FX.yel);
    ctx.restore(); }
};
SFX_FNS.push(() => { const b = BK.why; sfx(b.t0 + 0.1, 'pop', 0.4); [0.3, 0.52, 0.75].forEach(f => { sfx(P('G01_01', f), 'pop', 0.4); sfx(P('G01_01', f) + 0.3, 'stamp', 0.35); });
  sfx(S('G01_02') - 0.2, 'swoosh_in', 0.4); [0.15, 0.4, 0.62].forEach(f => sfx(P('G01_02', f), 'ding', 0.4)); sfx(P('G01_02', 0.8), 'sparkle', 0.4); });

// ---- 标题 ----
SC.title = (t, blk, en) => {
  const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
  bgBurst(t, '#0b3d3a', '#12a594', W * 0.6, H * 0.45, 28, 0.2);
  ['🩺', '⚖️', '🔑', '🐘', '✨'].forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / 5; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
  sprite('g_doctor', lerp(-400, 330, eBack(prog(t, t0, 0.5))), H + 60, 1040);
  sprite('d_heavy', lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 780);
  fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
  const slam = prog(t, t0 + 0.8, 0.2);
  if (slam > 0) {
    ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
    badge(-400, -10, 95, '#ff5c8a', '第11集', { fs: 48, rot: -0.15, fg: '#fff' });
    fancy('仓库', 40, -70, 130, t, -99, FX.white);
    fancy('体检！', 110, 80, 150, t, -99, FX.yel);
    ctx.restore();
    speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
  }
  SQUAD.split('').forEach((k, i) => avatar(k, 760 + i * 130, 790, 48, { s: popIn(t, t0 + 1.2 + i * 0.07) }));
  flash(t, t0 + 1.0, 0.2);
};
SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < 6; i++) sfx(b.t0 + 1.2 + i * 0.07, 'pop', 0.25); });

// ---- 出状况（左侧插图，画在 80..960）----
const L_SIZEQ = () => { const t0 = BK.sizeQ.t0; return [{ s: 'git clone https://github.com/dafeiyu/rice-page.git', t: t0 + 0.2, cmd: true, dur: 0.5 }, { s: "{d}Cloning into 'rice-page'...", t: t0 + 0.75 }]; };
function probSizeQ(t, blk) {
  const t0 = blk.t0, r0 = t0 + 0.95; const L = L_SIZEQ();
  if (t >= r0) { const k = clamp((t - r0) / 6); const pct = Math.floor(k * 37), n = Math.floor(k * 812), mb = (k * 780).toFixed(1);
    L.push({ s: `{y}Receiving objects: ${pct}% (${n}/2194), ${mb} MiB`, t: r0 }); L.push({ s: '{r}预计剩余：09:48 ……', t: r0 + 0.4 }); }
  terminal(t, 100, 200, 840, 400, L, { title: '终端 — 用户的电脑', accent: SIZEC, fs: 21, prompt: false });
  if (t >= r0) { const k = clamp((t - r0) / 6); box(130, 650, 780, 44, 22, '#2a2350', '#fff', 3); box(134, 654, Math.max(36, 772 * k * 0.37), 36, 18, SIZEC);
    txt('🐌', 150 + 772 * k * 0.37, 620, 60, '#000', { align: 'center', font: EMOJI, bold: false }); }
  if (U.D02 && t >= U.D02.vo + 0.3) stamp(t, U.D02.vo + 0.3, 520, 820, '要十分钟！', BADC, 58, -0.08);
}
const L_DELQ = () => { const d3 = U.D03 ? U.D03.vo : 1e9; return [{ s: 'git rm design/白饭页设计稿.psd', t: BK.delQ.t0 + 0.2, cmd: true, dur: 0.4 }, { s: 'git commit -m "删掉大文件"', t: P('X01', 0.45), cmd: true, dur: 0.4 },
  { s: 'git push', t: P('X01', 0.8), cmd: true, dur: 0.2 }, { s: '{r}remote: error: File design/白饭页设计稿.psd is 180.00 MB', t: d3 - 0.1 }, { s: '{r} ! [remote rejected] main -> main', t: d3 }]; };
function probDelQ(t, blk) {
  const d3 = U.D03 ? U.D03.vo : 1e9;
  terminal(t, 100, 220, 840, 470, L_DELQ(), { title: '终端 — rice-page', accent: '#d6283e', fs: 22, prompt: false });
  if (t >= P('X01', 0.6) && t < d3) txt('🗑️', 800, 330, 80, '#000', { align: 'center', font: EMOJI, bold: false });
  if (t >= d3) { flash(t, d3, 0.12, '255,60,90'); stamp(t, d3 + 0.1, 520, 800, '还是被拒！', BADC, 60, -0.08); }
}
function probLfsQ(t, blk) {
  const t0 = blk.t0; box(100, 200, 840, 520, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
  const ds = popIn(t, t0 + 0.15); if (ds > 0) { ctx.save(); ctx.translate(620, 470); ctx.scale(ds, ds); box(-80, -170, 160, 340, 14, '#6b4a1f', '#3b2a10', 6); box(-60, -150, 120, 300, 8, '#1b1433');
    txt('≤100MB', 0, -200, 28, CLUE, { align: 'center', font: F_CODE }); txt('🚪', 0, 0, 60, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore(); }
  const bs = popIn(t, t0 + 0.3); if (bs > 0) { const bump = t >= P('B01', 0.4) ? Math.abs(Math.sin((t - P('B01', 0.4)) * 6)) * 60 : 0;
    ctx.save(); ctx.translate(290 + bump, 480); ctx.scale(bs * 0.85, bs * 0.85); box(-170, -170, 340, 340, 18, '#c8915a', '#7a5228', 7); ctx.fillStyle = '#a8743f'; ctx.fillRect(-170, -20, 340, 40);
    txt('PSD', 0, -90, 54, '#fff', { align: 'center', font: F_CODE }); txt('180 MB', 0, 90, 44, '#fff', { align: 'center', font: F_CODE }); ctx.restore();
    if (bump > 50) txt('💥', 500, 380, 60, '#000', { align: 'center', font: EMOJI, bold: false }); }
  if (U.D04 && t >= U.D04.vo + 0.3) stamp(t, U.D04.vo + 0.3, 520, 820, '塞不进去！', LFSC, 56, -0.08);
}
const EOL_ROWS = ['<!doctype html>', '<html lang="zh">', '<head>', '  <title>白饭页</title>', '</head>', '<body>', '  <h1>今天吃白饭</h1>', '  <p>大肥鱼会偷吃</p>'];
function probEolQ(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.1, 0.45); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 450); ctx.scale(s, s); ctx.translate(-520, -450);
  ghWin(100, 150, 840, 600, 'github.com/dafeiyu/rice-page/commit/7c1e9a2');
  txt('📄 index.html', 130, 240, 26, '#24292f', { font: EMOJI + ',' + F_CODE }); txt('+240 −240', 900, 240, 26, BADC, { align: 'right', font: F_CODE });
  EOL_ROWS.slice(0, 6).forEach((r, i) => { [0, 1].forEach(k => { const a = clamp(prog(t, P('M01', 0.25) + (i * 2 + k) * 0.05, 0.12)); if (a <= 0) return; const y = 285 + (i * 2 + k) * 37; ctx.save(); ctx.globalAlpha *= a;
    box(120, y, 800, 35, 0, k ? '#e6ffec' : '#ffebe9'); txt((k ? '+ ' : '− ') + r, 140, y + 18, 20, k ? '#1a7f37' : BADC, { font: F_CODE, bold: false }); ctx.restore(); }); });
  ctx.restore();
  if (U.D05 && t >= U.D05.vo + 0.3) stamp(t, U.D05.vo + 0.3, 520, 820, '一行没改！', EOLC, 58, -0.08);
}
function probLeakQ(t, blk) {
  const t0 = blk.t0, hot = P('C01', 0.35);
  const L = [{ s: '// 白饭页 · 支付配置', t: t0 + 0.15, dim: true }, { s: 'PAY_URL = "pay.example.com"', t: t0 + 0.25 }, { s: 'PAY_KEY = "sk_live_51Hx9aQ…7Qz"', t: t0 + 0.35, bad: t >= hot }, { s: 'export { PAY_URL, PAY_KEY }', t: t0 + 0.45 }];
  ymlEditor(t, 100, 200, 840, 360, 'config.js', L, { fs: 28, accent: BADC });
  if (t >= hot) keyIcon(830, 420, popIn(t, hot) * 0.7, BADC, { glow: true, rot: -0.3 });
  if (t >= P('C01', 0.7)) pill(520, 620, '🕒 3 个月前 · 已推送到 GitHub', BADC, popIn(t, P('C01', 0.7)), { fs: 30, font: F_BODY + ',' + EMOJI });
  if (U.D06 && t >= U.D06.vo + 0.3) stamp(t, U.D06.vo + 0.3, 520, 800, '快删掉！', BADC, 60, -0.08);
}
function probHistQ(t, blk) {
  const t0 = blk.t0, hot = P('K01', 0.55); box(100, 200, 840, 520, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
  txt('📜 git log', 140, 260, 30, '#fff', { font: EMOJI + ',' + F_CODE });
  const lab = ['7月', '', '8月', '', '9月', '', '10月', '今天'];
  for (let i = 0; i < 8; i++) { const x = 170 + i * 100, s = popIn(t, t0 + 0.15 + i * 0.05); if (i) seg(x - 100, 450, x, 450, '#5a5580', clamp(s), 7);
    gDot(x, 450, s, i === 1 && t >= hot ? BADC : ORIC, { r: 22, glow: i === 1 && t >= hot, t }); if (lab[i]) txt(lab[i], x, 510, 22, '#cfc8ef', { align: 'center' }); }
  const mx = lerp(870, 270, eIO(prog(t, P('K01', 0.1), 1.2))); magnifier(mx, 400, 50, { rot: -0.3 });
  if (t >= hot) { keyIcon(240, 340, popIn(t, hot) * 0.55, BADC, { glow: true }); note(400, 620, popIn(t, hot + 0.2), '旧密钥还在这里', BADC, { fs: 32 }); }
  if (U.D07 && t >= U.D07.vo + 0.3) stamp(t, U.D07.vo + 0.3, 520, 820, '还要清吗？', HISC, 56, -0.08);
}
function probAsk11(t, blk) {
  const t0 = blk.t0;
  [['🏃 瘦', SIZEC], ['📏 齐', EOLC], ['🚑 救', BADC]].forEach((c, i) => { const s = popIn(t, t0 + 0.15 + i * 0.12); if (s > 0) { ctx.save(); ctx.translate(250 + i * 270, 480); ctx.scale(s, s); ctx.rotate((i - 1) * 0.06); box(-110, -140, 220, 280, 24, '#fff', c[1], 8); txt(c[0], 0, 0, 52, '#1b1433', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false }); ctx.restore(); } });
  if (t >= t0 + 0.6) txt('三个重点', 520, 760, 64, ACC, { align: 'center', font: F_FANCY, bold: false });
}
function probAskP(t, blk) {
  const t0 = blk.t0; const s = popIn(t, t0 + 0.1, 0.4); if (s <= 0) return;
  ctx.save(); ctx.translate(520, 440); ctx.scale(s, s); ctx.translate(-520, -440);
  box(130, 180, 780, 520, 26, '#fff', DOCC, 7); txt('🩺 白饭页 · 体检单', 520, 240, 38, DOCC, { align: 'center', font: EMOJI + ',' + F_BODY });
  [['⚖️', '体重', '2.1 GB'], ['🐘', '大文件', '12 个'], ['↩️', '换行符', '乱'], ['🔑', '密钥', '泄露']].forEach((c, i) => checkRow(170, 290 + i * 98, 700, c[0], c[1], c[2], false, clamp(prog(t, t0 + 0.3 + i * 0.1, 0.2))));
  ctx.restore();
  if (t >= P('D09', 0.5)) stamp(t, P('D09', 0.5), 520, 800, '全面体检！', GOODC, 64, -0.08);
}
const PROB = {
  sizeQ: { chap: ['第①项', '量体重', SIZEC, F_BODY], q: '怎么这么胖？', bg: ['#fff0e0', '#ffd9b3'], draw: probSizeQ },
  delQ: { chap: ['第②项', '删了没用？', '#d6283e', F_BODY], q: '还是被拒？', bg: ['#ffe3e6', '#ffc4cc'], draw: probDelQ },
  lfsQ: { chap: ['第③项', 'Git LFS', LFSC, F_CODE], q: '设计稿放哪？', bg: ['#e3f7ef', '#bfeedd'], draw: probLfsQ },
  eolQ: { chap: ['第④项', '换行符', EOLC, F_BODY], q: '一行没改？', bg: ['#ffe3f0', '#ffc9e0'], draw: probEolQ },
  leakQ: { chap: ['第⑤项', '密钥泄露', BADC, F_BODY], q: '快删掉！', bg: ['#ffe3e6', '#ffc4cc'], draw: probLeakQ },
  histQ: { chap: ['第⑥项', '清理历史', HISC, F_BODY], q: '还要清吗？', bg: ['#efe8ff', '#dccfff'], draw: probHistQ },
  ask11: { chap: ['复习', '瘦 · 齐 · 救', ACC, F_BODY], q: '帮我划重点！', bg: ['#ece3ff', '#d6c4ff'], draw: probAsk11 },
  askP: { chap: ['实战', '白饭页体检', GOODC, F_BODY], q: '全面体检！', bg: ['#e3f7e9', '#c2edd0'], draw: probAskP },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);
SFX_FNS.push(() => {
  Object.keys(PROB).forEach(k => { const b = BK[k]; sfx(b.t0 + 0.08, 'swoosh_in', 0.35); b.entries.filter(e => e.k === 'v').forEach((e, i) => { if (i) sfx(e.vo - 0.3, 'swoosh_in', 0.35); if (e.id[0] === 'D') sfx(e.vo + 0.35, 'boing', 0.4); }); });
  termSfx(L_SIZEQ()); sfx(BK.sizeQ.t0 + 1.35, 'buzz', 0.3); sfx(U.D02.vo + 0.3, 'stamp', 0.6);
  termSfx(L_DELQ()); sfx(P('X01', 0.6), 'pop', 0.3); sfx(U.D03.vo, 'buzz', 0.6); sfx(U.D03.vo + 0.1, 'stamp', 0.6);
  sfx(BK.lfsQ.t0 + 0.15, 'pop', 0.3); sfx(BK.lfsQ.t0 + 0.3, 'pop', 0.3); for (let i = 0; i < 3; i++) sfx(P('B01', 0.4) + 0.26 + i * 0.52, 'impact', 0.25); sfx(U.D04.vo + 0.3, 'stamp', 0.6);
  sfx(BK.eolQ.t0 + 0.1, 'pop', 0.4); for (let i = 0; i < 12; i++) sfx(P('M01', 0.25) + i * 0.05, 'pop', 0.12); sfx(U.D05.vo + 0.3, 'stamp', 0.6);
  sfx(P('C01', 0.35), 'buzz', 0.4); sfx(P('C01', 0.7), 'pop', 0.3); sfx(U.D06.vo + 0.3, 'stamp', 0.6);
  for (let i = 0; i < 8; i++) sfx(BK.histQ.t0 + 0.15 + i * 0.05, 'pop', 0.15); sfx(P('K01', 0.55), 'ding', 0.4); sfx(U.D07.vo + 0.3, 'stamp', 0.6);
  [0, 1, 2].forEach(i => sfx(BK.ask11.t0 + 0.15 + i * 0.12, 'pop', 0.3)); sfx(BK.askP.t0 + 0.1, 'pop', 0.4); sfx(P('D09', 0.5), 'stamp', 0.6);
});

// ---- 讲解①：量体重（千问）----
const L_SIZE = () => { const g2 = S('G02_02') - 0.15; return [{ s: 'git count-objects -vH', t: g2 + 0.15, cmd: true, dur: 0.45 }, { s: '{d}count: 0', t: P('G02_02', 0.3) }, { s: '{d}size: 0 bytes', t: P('G02_02', 0.33) },
  { s: 'in-pack: 2194', t: P('G02_02', 0.36) }, { s: 'packs: 1', t: P('G02_02', 0.39) }, { s: '{y}size-pack: 2.10 GiB', t: P('G02_02', 0.42), hl: [P('G02_02', 0.55), 1e9], hlc: CLUE },
  { s: '{d}prune-packable: 0', t: P('G02_02', 0.45) }, { s: '{d}garbage: 0', t: P('G02_02', 0.48) }]; };
SC.size = (t, blk, en) => {
  bgLecture(t, SIZEC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G02_01'), g2 = S('G02_02') - 0.15, g3 = S('G02_03') - 0.15, g4 = U.Q02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    box(680, 110, 1180, 640, 26, 'rgba(15,12,31,0.92)', '#fff', 5); txt('📜 每个提交都存一份完整的设计稿', 720, 170, 32, '#fff', { font: EMOJI + ',' + F_BODY });
    for (let i = 0; i < 10; i++) { const tt = P('G02_01', 0.3 + i * 0.045), s = popIn(t, tt), x = 760 + i * 112; if (s <= 0) continue;
      if (i) seg(x - 112, 270, x, 270, '#5a5580', clamp(s), 7); gDot(x, 270, s, ORIC, { r: 20 }); txt('v' + (i + 1), x, 318, 20, '#cfc8ef', { align: 'center', font: F_CODE });
      psdIcon(x, 420 + Math.sin(t * 3 + i) * 4, s * 0.85, { lab: '180MB', rot: (i % 2 ? 0.05 : -0.05) }); }
    if (t >= P('G02_01', 0.78)) { fancy('180 MB × 10 = 1.8 GB', 1270, 600, 74, t, P('G02_01', 0.78), FX.orange); }
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fadeW(t, g2, g3); ctx.save(); ctx.globalAlpha *= a;
    terminal(t, 680, 120, 760, 620, L_SIZE(), { title: '终端 — rice-page', accent: SIZEC, fs: 30, prompt: false });
    const s = popIn(t, P('G02_02', 0.6), 0.45); if (s > 0) { ctx.save(); ctx.translate(1660, 420); ctx.scale(s, s); box(-170, -200, 340, 400, 26, '#fffaf0', SIZEC, 7);
      txt('⚖️', 0, -90, 100, '#000', { align: 'center', font: EMOJI, bold: false }); txt('仓库体重', 0, 30, 38, '#1b1433', { align: 'center' }); txt('2.10 GiB', 0, 100, 44, BADC, { align: 'center', font: F_CODE }); ctx.restore(); }
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    box(680, 110, 1180, 640, 26, '#fff', SIZEC, 6); txt('📏 GitHub 的规矩', 720, 175, 38, '#1b1433', { font: EMOJI + ',' + F_BODY });
    const bx = 740, bw = 1060, by = 340; box(bx, by - 18, bw, 36, 18, '#eaeef2');
    const gp = eOut(prog(t, g3 + 0.1, 0.8)); const grd = ctx.createLinearGradient(bx, 0, bx + bw, 0); grd.addColorStop(0, '#2fbf71'); grd.addColorStop(0.45, '#ffd23f'); grd.addColorStop(0.75, '#ff6b35'); grd.addColorStop(1, BADC);
    ctx.save(); rr(bx, by - 18, bw * gp, 36, 18); ctx.fillStyle = grd; ctx.fill(); ctx.restore();
    txt('单个文件', bx, by - 50, 26, '#57606a', {});
    [[0.42, '50 MB', '⚠️ 警告', '#d4a72c', 0.15], [0.84, '100 MB', '⛔ 拒收', BADC, 0.42]].forEach(m => { if (t < P('G02_03', m[4])) return; const x = bx + bw * m[0], s = popIn(t, P('G02_03', m[4]));
      seg(x, by - 40, x, by + 40, m[3], 1, 6); ctx.save(); ctx.translate(x, by + 100); ctx.scale(s, s); box(-110, -42, 220, 84, 16, '#fff', m[3], 5); txt(m[1], 0, -14, 28, m[3], { align: 'center', font: F_CODE }); txt(m[2], 0, 20, 24, '#1b1433', { align: 'center', font: EMOJI + ',' + F_BODY }); ctx.restore(); });
    if (t >= P('G02_03', 0.4)) psdIcon(bx + bw * 0.97, by - 4, popIn(t, P('G02_03', 0.4)) * 0.7, { col: BADC });
    const rs = popIn(t, P('G02_03', 0.72), 0.45); if (rs > 0) { ctx.save(); ctx.translate(1270, 620); ctx.scale(rs, rs); box(-460, -70, 920, 140, 22, '#effaf3', GOODC, 5);
      txt('📦 整个仓库：最好别超过 1 GB', 0, 0, 40, '#1b1433', { align: 'center', font: EMOJI + ',' + F_BODY }); ctx.restore(); }
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['Q02']); for (let i = 0; i < 10; i++) sfx(P('G02_01', 0.3 + i * 0.045), 'pop', 0.18); sfx(P('G02_01', 0.78), 'impact', 0.5);
  sfx(S('G02_02') - 0.15, 'swoosh_in', 0.4); termSfx(L_SIZE()); sfx(P('G02_02', 0.55), 'ding', 0.4); sfx(P('G02_02', 0.6), 'pop', 0.4);
  sfx(S('G02_03') - 0.15, 'swoosh_in', 0.4); sfx(S('G02_03'), 'whoosh', 0.4); sfx(P('G02_03', 0.15), 'pop', 0.4); sfx(P('G02_03', 0.42), 'buzz', 0.4); sfx(P('G02_03', 0.72), 'ding', 0.4); });

// ---- 讲解②：删了没用（Grok）----
const L_DEL = () => [{ s: 'git rm --cached design/白饭页设计稿.psd', t: P('G03_02', 0.2), cmd: true, dur: 0.5 }, { s: "{d}rm 'design/白饭页设计稿.psd'", t: P('G03_02', 0.38) },
  { s: 'git commit --amend --no-edit', t: P('G03_02', 0.6), cmd: true, dur: 0.4 }, { s: '{g}[main 3f9a2c1] 首页样式（已不含设计稿）', t: P('G03_02', 0.78) }, { s: 'git push', t: P('G03_02', 0.86), cmd: true, dur: 0.2 }, { s: '{g}✓ main -> main', t: P('G03_02', 0.95) }];
SC.del = (t, blk, en) => {
  bgLecture(t, '#d6283e'); lecturer(t, blk, en, blk.t0);
  const g1 = S('G03_01'), g2 = S('G03_02') - 0.15, g3 = S('G03_03') - 0.15, g4 = U.X02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    box(680, 110, 1180, 640, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
    const C = [[820, '加设计稿', '+180 MB', BADC], [1100, '改样式', '', ORIC], [1380, '删设计稿', '−180 MB', ORIC]];
    C.forEach((c, i) => { const s = popIn(t, g1 + 0.1 + i * 0.15); if (i) seg(C[i - 1][0], 330, c[0], 330, '#5a5580', clamp(s), 8); gDot(c[0], 330, s, c[3], { r: 30, glow: i === 0 && t >= P('G03_01', 0.4), t });
      if (s > 0) { txt(c[1], c[0], 400, 28, '#fff', { align: 'center' }); if (c[2]) txt(c[2], c[0], 440, 24, i ? GOODC : '#ff8fa3', { align: 'center', font: F_CODE }); } });
    if (t >= P('G03_01', 0.4)) { psdIcon(820, 210, popIn(t, P('G03_01', 0.4)) * 0.8, { col: BADC }); note(820, 540, popIn(t, P('G03_01', 0.45)), '旧提交里还在！', BADC, { fs: 32 }); }
    if (t >= P('G03_01', 0.68)) { const p = eOut(prog(t, P('G03_01', 0.68), 0.5)); cloud(1700, 330, popIn(t, P('G03_01', 0.68)) * 0.8, '#57606a', 'GitHub');
      ctx.save(); ctx.setLineDash([16, 10]); seg(760, 620, lerp(760, 1600, p), 620, CLUE, 1, 8); ctx.restore(); pill(1180, 670, '推送 = 带上整段历史', CLUE, popIn(t, P('G03_01', 0.72)), { fs: 30 });
      if (p > 0.95) stamp(t, P('G03_01', 0.68) + 0.5, 1700, 470, '✗ 拒收', BADC, 50, -0.1); }
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fadeW(t, g2, g3); ctx.save(); ctx.globalAlpha *= a;
    pill(1270, 140, '🕐 还没推送', GOODC, popIn(t, g2 + 0.05), { fs: 38, font: EMOJI + ',' + F_BODY });
    box(680, 190, 1180, 170, 22, 'rgba(15,12,31,0.92)', '#fff', 4);
    gDot(800, 275, 1, ORIC, { r: 26 }); seg(800, 275, 1060, 275, '#5a5580', 1, 8);
    const am = P('G03_02', 0.6), rp = eOut(prog(t, am, 0.4));
    ctx.save(); ctx.globalAlpha *= 1 - rp * 0.7; gDot(1060, 275, 1, BADC, { r: 26 }); psdIcon(1160, 275, 0.6, { col: BADC }); ctx.restore();
    if (rp > 0) { seg(800, 275, 1060, 275, '#5a5580', 1, 8); gDot(1460, 275, rp, GOODC, { r: 30, glow: true, t }); ctx.save(); ctx.setLineDash([10, 8]); seg(1100, 275, lerp(1100, 1420, rp), 275, GOODC, 1, 6); ctx.restore(); txt('改写后的提交', 1460, 335, 24, GOODC, { align: 'center' }); txt('✗', 1060, 275, 56, '#fff', { align: 'center' }); }
    terminal(t, 680, 390, 1180, 400, L_DEL(), { title: '终端 — rice-page', accent: GOODC, fs: 25, prompt: false });
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    pill(1270, 140, '📤 早就推送过', BADC, popIn(t, g3 + 0.05), { fs: 38, font: EMOJI + ',' + F_BODY });
    box(680, 190, 1180, 420, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
    const rw = P('G03_03', 0.3), wp = clamp(prog(t, rw, 0.8));
    for (let i = 0; i < 7; i++) { const x = 770 + i * 165, nw = i >= 2 && wp * 7 > i - 1; if (i) seg(x - 165, 360, x, 360, '#5a5580', 1, 8);
      gDot(x, 360, popIn(t, g3 + 0.1 + i * 0.04), i === 2 && !nw ? BADC : nw ? '#ffd23f' : ORIC, { r: 26 }); if (nw) txt('′', x + 24, 330, 40, '#ffd23f', { font: F_CODE }); }
    if (t < rw + 0.3) psdIcon(1100, 250, popIn(t, g3 + 0.2) * 0.6, { col: BADC });
    if (t >= rw) { ctx.save(); ctx.globalAlpha *= 1 - prog(t, rw + 0.8, 0.3); const sx = lerp(1000, 1900, wp); ctx.fillStyle = 'rgba(255,210,63,0.25)'; ctx.fillRect(sx - 60, 210, 120, 380); ctx.restore(); note(1270, 520, popIn(t, rw + 0.4), '之后的提交全部换新编号', CLUE, { fs: 32 }); }
    [['git rebase -i（第8集）', P('G03_03', 0.4), 940], ['git filter-repo（后面讲）', P('G03_03', 0.7), 1560]].forEach(c => pill(c[2], 690, c[0], HISC, popIn(t, c[1]), { fs: 32, font: F_CODE + ',' + F_BODY }));
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['X02']); [0, 1, 2].forEach(i => sfx(S('G03_01') + 0.1 + i * 0.15, 'pop', 0.3)); sfx(P('G03_01', 0.4), 'buzz', 0.4); sfx(P('G03_01', 0.45), 'pop', 0.3); sfx(P('G03_01', 0.68), 'whoosh', 0.4); sfx(P('G03_01', 0.68) + 0.5, 'stamp', 0.5);
  sfx(S('G03_02') - 0.15, 'swoosh_in', 0.4); termSfx(L_DEL()); sfx(P('G03_02', 0.6), 'whoosh', 0.3); sfx(P('G03_02', 0.95), 'ding', 0.4);
  sfx(S('G03_03') - 0.15, 'swoosh_in', 0.4); sfx(P('G03_03', 0.3), 'whoosh', 0.5); sfx(P('G03_03', 0.4), 'pop', 0.4); sfx(P('G03_03', 0.7), 'pop', 0.4); });

// ---- 讲解③：Git LFS（豆包）----
const L_LFS1 = () => [{ s: 'git lfs install', t: P('G04_01', 0.32), cmd: true, dur: 0.3 }, { s: '{g}Git LFS initialized.', t: P('G04_01', 0.45) },
  { s: 'git lfs track "*.psd"', t: P('G04_01', 0.62), cmd: true, dur: 0.4 }, { s: '{g}Tracking "*.psd"', t: P('G04_01', 0.8) }];
const L_LFS2 = () => [{ s: 'git add .gitattributes', t: P('G04_02', 0.55), cmd: true, dur: 0.35 }, { s: 'git commit -m "用 LFS 管理设计稿"', t: P('G04_02', 0.72), cmd: true, dur: 0.4 }];
const L_LFS4 = () => [{ s: 'git lfs migrate import --include="*.psd" --everything', t: P('G04_04', 0.08), cmd: true, dur: 0.6 }, { s: '{d}migrate: Sorting commits: ..., done.', t: P('G04_04', 0.25) },
  { s: '{y}migrate: Rewriting commits: 100% (12/12), done.', t: P('G04_04', 0.3) }, { s: '{g}migrate: Updating refs: ..., done.', t: P('G04_04', 0.36) }];
SC.lfs = (t, blk, en) => {
  bgLecture(t, LFSC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G04_01'), g2 = S('G04_02') - 0.15, g3 = S('G04_03') - 0.15, g4 = S('G04_04') - 0.15, g5 = S('G04_05') - 0.15, g6 = U.B02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    const s = popIn(t, g1 + 0.05, 0.45); ctx.save(); ctx.translate(1270, 230); ctx.scale(s, s); box(-430, -90, 860, 180, 30, '#fff', LFSC, 7);
    txt('🐘', -330, 0, 100, '#000', { align: 'center', font: EMOJI, bold: false }); txt('Git LFS', -230, -22, 56, LFSC, { font: F_CODE }); txt('Large File Storage · 大文件专用存储', -230, 40, 26, '#57606a', { font: F_CODE + ',' + F_BODY, bold: false }); ctx.restore();
    terminal(t, 680, 360, 1180, 400, L_LFS1(), { title: '终端 — rice-page', accent: LFSC, fs: 32, prompt: false });
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fadeW(t, g2, g3); ctx.save(); ctx.globalAlpha *= a;
    ymlEditor(t, 680, 120, 1180, 260, '.gitattributes', [{ s: '*.psd filter=lfs diff=lfs merge=lfs -text', t: g2 + 0.2, dur: 0.5, hl: [P('G04_02', 0.2), P('G04_02', 0.55)] }], { fs: 34, accent: LFSC });
    terminal(t, 680, 410, 1180, 300, L_LFS2(), { title: '终端 — rice-page', accent: LFSC, fs: 28, prompt: false });
    if (t >= P('G04_02', 0.7)) note(1270, 770, popIn(t, P('G04_02', 0.7)), '这个文件也要提交！', CLUE, { fs: 38, rot: -0.02 });
    ctx.restore(); }
  if (t >= g3 - 0.1 && t < g4 + 0.3) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    const s1 = popIn(t, g3 + 0.1, 0.45); ctx.save(); ctx.translate(960, 420); ctx.scale(s1, s1); box(-290, -280, 580, 560, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
    txt('📦 Git 仓库里', 0, -225, 34, '#fff', { align: 'center', font: EMOJI + ',' + F_BODY });
    const ps = popIn(t, P('G04_03', 0.15), 0.4); if (ps > 0) { ctx.save(); ctx.scale(ps, ps); box(-250, -160, 500, 260, 16, '#fffbea', CLUE, 4); txt('📄 指针文件', -225, -125, 24, '#9a6700', { font: EMOJI + ',' + F_BODY });
      ['version https://git-lfs.github.com/spec/v1', 'oid sha256:4d7a2140…e9b1', 'size 188743680'].forEach((l, i) => { const hot = (i === 1 && t >= P('G04_03', 0.3) && t < P('G04_03', 0.42)) || (i === 2 && t >= P('G04_03', 0.38) && t < P('G04_03', 0.5));
        if (hot) box(-240, -78 + i * 56, 480, 44, 8, hexA(CLUE, 0.35)); txt(l, -228, -56 + i * 56, i ? 22 : 17, '#24292f', { font: F_CODE, bold: i > 0, max: 460 }); }); ctx.restore(); }
    if (t >= P('G04_03', 0.3)) { pill(-120, 170, '编号', '#9a6700', popIn(t, P('G04_03', 0.3)), { fs: 26 }); pill(120, 170, '大小', '#9a6700', popIn(t, P('G04_03', 0.38)), { fs: 26 }); }
    txt('只有几百字节', 0, 240, 26, '#cfc8ef', { align: 'center' }); ctx.restore();
    const cs = popIn(t, P('G04_03', 0.5), 0.45); cloud(1600, 360, cs * 1.2, LFSC, ''); if (cs > 0) { txt('LFS 存储', 1600, 430, 34 * cs, LFSC, { align: 'center' }); psdIcon(1600, 300, cs * 1.0, { lab: '180MB' }); }
    if (t >= P('G04_03', 0.5)) { const p = eOut(prog(t, P('G04_03', 0.5), 0.4)); ctx.save(); ctx.setLineDash([14, 10]); seg(1250, 420, lerp(1250, 1420, p), lerp(420, 380, p), LFSC, 1, 7); ctx.restore(); }
    if (t >= P('G04_03', 0.75)) pill(1600, 620, '⬇️ 用到才下载', LFSC, popIn(t, P('G04_03', 0.75)), { fs: 34, font: EMOJI + ',' + F_BODY });
    ctx.restore(); }
  if (t >= g4 - 0.1 && t < g5 + 0.3) { const a = fadeW(t, g4, g5); ctx.save(); ctx.globalAlpha *= a;
    terminal(t, 680, 110, 1180, 340, L_LFS4(), { title: '终端 — rice-page', accent: LFSC, fs: 25, prompt: false });
    if (t >= P('G04_04', 0.36)) note(1600, 480, popIn(t, P('G04_04', 0.38)), '会改写历史 → 要强制推送', CLUE, { fs: 28 });
    [['💾', '存储', '10 GB', P('G04_04', 0.6)], ['📶', '每月流量', '10 GB', P('G04_04', 0.78)], ['📄', '单个文件', '≤ 2 GB', P('G04_04', 0.9)]].forEach((c, i) => { const s = popIn(t, c[3]); if (s <= 0) return;
      const x = 880 + i * 390; ctx.save(); ctx.translate(x, 650); ctx.scale(s, s); box(-175, -95, 350, 190, 22, '#fff', LFSC, 6); txt(c[0], -110, -20, 56, '#000', { align: 'center', font: EMOJI, bold: false });
      txt(c[1], 40, -40, 28, '#57606a', { align: 'center' }); txt(c[2], 40, 20, 50, LFSC, { align: 'center', font: F_CODE }); ctx.restore(); });
    if (t >= P('G04_04', 0.6)) txt('免费额度', 700, 530, 28, '#fff', {});
    ctx.restore(); }
  if (t >= g5 - 0.1) { const a = fadeW(t, g5, g6); ctx.save(); ctx.globalAlpha *= a;
    const s = popIn(t, g5 + 0.05, 0.45); ctx.save(); ctx.translate(1270, 420); ctx.scale(s, s); box(-560, -310, 1120, 620, 28, '#fff', BADC, 7);
    txt('⚠️ 注意', 0, -250, 44, BADC, { align: 'center', font: EMOJI + ',' + F_BODY });
    txt('🌐', -300, -100, 110, '#000', { align: 'center', font: EMOJI, bold: false }); txt('GitHub Pages', -300, 10, 32, '#1b1433', { align: 'center', font: F_CODE });
    txt('🐘', 300, -100, 110, '#000', { align: 'center', font: EMOJI, bold: false }); txt('LFS 文件', 300, 10, 32, '#1b1433', { align: 'center' });
    if (t >= P('G04_05', 0.2)) { seg(-170, -100, 170, -100, BADC, eOut(prog(t, P('G04_05', 0.2), 0.3)), 10); txt('✗ 读不到', 0, -150, 34, BADC, { align: 'center' }); }
    [['🖼️ 网页要用的图片', '→ 普通提交', GOODC, 0.55], ['🎨 设计源文件', '→ LFS', LFSC, 0.7]].forEach((c, i) => { if (t < P('G04_05', c[3])) return; const y = 130 + i * 90;
      box(-460, y - 38, 920, 76, 16, hexA(c[2], 0.1), c[2], 3); txt(c[0], -420, y, 32, '#1b1433', { font: EMOJI + ',' + F_BODY }); txt(c[1], 420, y, 32, c[2], { align: 'right', font: F_BODY + ',' + F_CODE }); });
    ctx.restore(); ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['B02']); sfx(S('G04_01') + 0.05, 'pop', 0.5); termSfx(L_LFS1()); sfx(P('G04_01', 0.45), 'ding', 0.3); sfx(P('G04_01', 0.8), 'ding', 0.3);
  sfx(S('G04_02') - 0.15, 'swoosh_in', 0.4); typeSfx(S('G04_02') + 0.05, 40, 0.5); termSfx(L_LFS2()); sfx(P('G04_02', 0.7), 'pop', 0.4);
  sfx(S('G04_03') - 0.15, 'swoosh_in', 0.4); sfx(P('G04_03', 0.15), 'pop', 0.4); sfx(P('G04_03', 0.3), 'ding', 0.3); sfx(P('G04_03', 0.38), 'ding', 0.3); sfx(P('G04_03', 0.5), 'whoosh', 0.4); sfx(P('G04_03', 0.75), 'pop', 0.4);
  sfx(S('G04_04') - 0.15, 'swoosh_in', 0.4); termSfx(L_LFS4()); sfx(P('G04_04', 0.38), 'pop', 0.3); [0.6, 0.78, 0.9].forEach(f => sfx(P('G04_04', f), 'pop', 0.4));
  sfx(S('G04_05') - 0.15, 'swoosh_in', 0.4); sfx(P('G04_05', 0.2), 'buzz', 0.4); sfx(P('G04_05', 0.55), 'ding', 0.3); sfx(P('G04_05', 0.7), 'ding', 0.3); });

// ---- 讲解④：换行符（Gemini）----
const L_EOL = () => [{ s: 'git add --renormalize .', t: P('G05_03', 0.58), cmd: true, dur: 0.4 }, { s: 'git commit -m "统一换行符"', t: P('G05_03', 0.78), cmd: true, dur: 0.35 }];
function eolChip(x, y, lab, col, s = 1) { if (s <= 0) return 0; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.font = `bold 26px ${F_CODE}`; const w = ctx.measureText(lab).width + 24; box(0, -22, w, 44, 10, col); txt(lab, w / 2, 1, 26, '#fff', { align: 'center', font: F_CODE }); ctx.restore(); return w * s; }
SC.eol = (t, blk, en) => {
  bgLecture(t, EOLC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G05_01'), g2 = S('G05_02') - 0.15, g3 = S('G05_03') - 0.15, g4 = U.M02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    box(680, 110, 1180, 640, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
    [['🪟 Windows', [['CR', '#ff6b35'], ['LF', EOLC]], P('G05_01', 0.15), '\\r\\n'], ['🍎 Mac / 🐧 Linux', [['LF', EOLC]], P('G05_01', 0.42), '\\n']].forEach((r, i) => { const s = clamp(prog(t, r[2], 0.25)); if (s <= 0) return; const y = 220 + i * 170;
      ctx.save(); ctx.globalAlpha *= s; txt(r[0], 720, y, 30, '#fff', { font: EMOJI + ',' + F_BODY }); box(720, y + 30, 1100, 80, 14, '#1b1730', '#5a5580', 2);
      let x = 750 + txt('<h1>今天吃白饭</h1>', 750, y + 70, 30, '#ffd27a', { font: F_CODE + ',' + F_BODY }) + 14; r[1].forEach(c => { x += eolChip(x, y + 70, c[0], c[1], popIn(t, r[2] + 0.2)) + 8; });
      txt(r[3], 1790, y + 70, 26, '#8f8aa8', { align: 'right', font: F_CODE }); ctx.restore(); });
    if (t >= P('G05_01', 0.68)) { const s = popIn(t, P('G05_01', 0.68)); pill(1270, 560, '✏️ 编辑器一转换', CLUE, s, { fs: 32, font: EMOJI + ',' + F_BODY });
      for (let i = 0; i < 14; i++) { const p = clamp(prog(t, P('G05_01', 0.72) + i * 0.03, 0.15)); box(730 + i * 80, 630, 66, 80, 8, p > 0.5 ? '#ffebe9' : '#2a2350', p > 0.5 ? BADC : '#5a5580', 3); }
      if (t >= P('G05_01', 0.9)) stamp(t, P('G05_01', 0.9), 1660, 545, '每行都变了', BADC, 46, -0.08); }
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fadeW(t, g2, g3); ctx.save(); ctx.globalAlpha *= a;
    ymlEditor(t, 680, 110, 1180, 260, '.gitattributes', [{ s: '# 文本文件统一换行', t: g2 + 0.15, dim: true }, { s: '* text=auto', t: P('G05_02', 0.25), dur: 0.3, hl: [P('G05_02', 0.3), 1e9] }], { fs: 36, accent: EOLC });
    const s = popIn(t, P('G05_02', 0.5), 0.45); if (s > 0) { ctx.save(); ctx.translate(1270, 580); ctx.scale(s, s);
      [[-420, '🪟', 'CRLF'], [420, '🍎', 'LF']].forEach(c => { box(c[0] - 140, -90, 280, 180, 22, '#fff', '#57606a', 4); txt(c[1], c[0], -25, 60, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[2], c[0], 50, 32, '#57606a', { align: 'center', font: F_CODE }); });
      box(-170, -110, 340, 220, 24, '#effaf3', GOODC, 6); txt('📦 仓库里', 0, -40, 34, '#1b1433', { align: 'center', font: EMOJI + ',' + F_BODY }); txt('统一 LF', 0, 30, 40, GOODC, { align: 'center', font: F_BODY + ',' + F_CODE });
      const p = eOut(prog(t, P('G05_02', 0.62), 0.4)); seg(-280, 0, lerp(-280, -180, p), 0, GOODC, 1, 8); seg(280, 0, lerp(280, 180, p), 0, GOODC, 1, 8);
      ctx.restore(); if (t >= P('G05_02', 0.75)) note(1270, 800, popIn(t, P('G05_02', 0.75)), '进仓库时自动整理好', CLUE, { fs: 32 }); }
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    ymlEditor(t, 680, 110, 1180, 340, '.gitattributes', [{ s: '* text=auto', t: -1 }, { s: '*.sh text eol=lf', t: P('G05_03', 0.08), dur: 0.35, good: t >= P('G05_03', 0.2) && t < P('G05_03', 0.35) }, { s: '*.png binary', t: P('G05_03', 0.3), dur: 0.3, good: t >= P('G05_03', 0.4) && t < P('G05_03', 0.55) }], { fs: 36, accent: EOLC });
    if (t >= P('G05_03', 0.2)) pill(1660, 268, '脚本固定 LF', GOODC, popIn(t, P('G05_03', 0.2)), { fs: 28 });
    if (t >= P('G05_03', 0.4)) pill(1660, 324, '🖼️ 别碰', '#57606a', popIn(t, P('G05_03', 0.4)), { fs: 28, font: EMOJI + ',' + F_BODY });
    terminal(t, 680, 480, 1180, 290, L_EOL(), { title: '终端 — rice-page', accent: EOLC, fs: 30, prompt: false });
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['M02']); sfx(P('G05_01', 0.15), 'pop', 0.4); sfx(P('G05_01', 0.35), 'pop', 0.3); sfx(P('G05_01', 0.42), 'pop', 0.4); sfx(P('G05_01', 0.62), 'pop', 0.3); sfx(P('G05_01', 0.68), 'whoosh', 0.4);
  for (let i = 0; i < 14; i++) sfx(P('G05_01', 0.72) + i * 0.03, 'pop', 0.1); sfx(P('G05_01', 0.9), 'stamp', 0.5);
  sfx(S('G05_02') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G05_02', 0.25), 11, 0.3); sfx(P('G05_02', 0.5), 'pop', 0.4); sfx(P('G05_02', 0.62), 'whoosh', 0.3); sfx(P('G05_02', 0.75), 'ding', 0.4);
  sfx(S('G05_03') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G05_03', 0.08), 16, 0.35); typeSfx(P('G05_03', 0.3), 12, 0.3); sfx(P('G05_03', 0.2), 'ding', 0.3); sfx(P('G05_03', 0.4), 'ding', 0.3); termSfx(L_EOL()); });

// ---- 讲解⑤：密钥泄露急救（Claude）----
const L_LEAK = () => [{ s: 'git rm --cached .env', t: P('G06_03', 0.8), cmd: true, dur: 0.3 }];
SC.leak = (t, blk, en) => {
  bgLecture(t, BADC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G06_01'), g2 = S('G06_02') - 0.15, g3 = S('G06_03') - 0.15, g4 = U.C02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 120, 1140, 600, 'github.com/dafeiyu/rice-page/blob/main/config.js'); txt('🌍 Public', 1790, 210, 24, '#57606a', { align: 'right', font: EMOJI + ',' + F_CODE });
    box(740, 250, 1060, 70, 10, '#ffebe9', BADC, 3); txt('PAY_KEY = "sk_live_51Hx9aQ…7Qz"', 770, 286, 30, BADC, { font: F_CODE });
    for (let i = 0; i < 3; i++) { const tt = P('G06_01', 0.25 + i * 0.1), s = popIn(t, tt); if (s <= 0) continue; const x = lerp(1900, 900 + i * 320, eOut(prog(t, tt, 0.6)));
      txt('🤖', x, 480, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); magnifier(x + 40, 400 + Math.sin(t * 6 + i) * 10, 34, { rot: -0.4 }); }
    txt('自动扫描程序', 1270, 600, 30, '#57606a', { align: 'center' });
    if (t >= P('G06_01', 0.55)) { keyIcon(1560, 560, popIn(t, P('G06_01', 0.55)) * 1.1, BADC, { glow: true, rot: -0.3 }); stamp(t, P('G06_01', 0.6), 1270, 680, '就当已经泄露', BADC, 54, -0.06); }
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fadeW(t, g2, g3); ctx.save(); ctx.globalAlpha *= a;
    win(700, 120, 1140, 560, '💳 支付服务后台 · API 密钥', BADC);
    txt('第一步：作废旧密钥，换一把新的', 740, 230, 34, '#fff', {});
    const rv = P('G06_02', 0.4), nw = P('G06_02', 0.62);
    box(740, 290, 1060, 110, 16, '#fff', '#d0d7de', 3); keyIcon(800, 345, 0.45, t >= rv ? '#8c959f' : CLUE, { broken: t >= rv }); txt('sk_live_51Hx9aQ…7Qz', 880, 330, 30, t >= rv ? '#8c959f' : '#24292f', { font: F_CODE }); txt('旧密钥', 880, 370, 22, '#57606a', { bold: false });
    if (t >= rv) { ctx.fillStyle = '#8c959f'; ctx.fillRect(880, 328, 330 * eOut(prog(t, rv, 0.3)), 4); }
    ghBtn(1690, 345, t >= rv ? '已作废' : 'Revoke 作废', { fs: 26, w: 190, hot: t >= P('G06_02', 0.25) && t < rv, t, hc: BADC, bg: t >= rv ? '#f6f8fa' : '#fff', fg: BADC });
    if (t >= rv) stamp(t, rv + 0.05, 1440, 345, '作废', BADC, 50, -0.12);
    if (t >= nw) { const s = popIn(t, nw); ctx.save(); ctx.translate(1270, 480); ctx.scale(s, s); box(-530, -55, 1060, 110, 16, '#effaf3', GOODC, 4); keyIcon(-470, 0, 0.45, CLUE, { glow: true }); txt('sk_live_9Kq2mW…b2M', -390, -15, 30, '#24292f', { font: F_CODE }); txt('新密钥 ✓', -390, 25, 22, GOODC, {}); ctx.restore(); }
    if (t >= P('G06_02', 0.8)) note(1270, 620, popIn(t, P('G06_02', 0.8)), '旧的被翻到也没用', CLUE, { fs: 34 });
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    const F3 = [['🔒 .env', 'PAY_KEY=sk_live_9Kq2mW…b2M', LFSC, P('G06_03', 0.05)], ['📄 config.js', 'PAY_KEY = process.env.PAY_KEY', ORIC, P('G06_03', 0.25)], ['🙈 .gitignore', '.env', '#57606a', P('G06_03', 0.5)]];
    F3.forEach((c, i) => { const s = popIn(t, c[3], 0.4); if (s <= 0) return; const y = 170 + i * 150; ctx.save(); ctx.translate(1270, y); ctx.scale(s, s);
      box(-580, -60, 1160, 120, 18, '#1b1730', c[2], 5); txt(c[0], -550, 0, 32, '#fff', { font: EMOJI + ',' + F_CODE }); txt(c[1], -230, 0, 28, '#ffd27a', { font: F_CODE, max: 790 }); ctx.restore(); });
    if (t >= P('G06_03', 0.3)) { ctx.save(); ctx.setLineDash([10, 8]); seg(1700, 230, 1700, 290, CLUE, eOut(prog(t, P('G06_03', 0.3), 0.3)), 5); ctx.restore(); pill(1720, 260, '从环境变量读', CLUE, popIn(t, P('G06_03', 0.32)), { fs: 22 }); }
    terminal(t, 690, 590, 1160, 200, L_LEAK(), { title: '终端 — 已被跟踪的，移出仓库', accent: BADC, fs: 30, prompt: false });
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['C02']); sfx(S('G06_01') + 0.05, 'pop', 0.4); [0, 1, 2].forEach(i => sfx(P('G06_01', 0.25 + i * 0.1), 'whoosh', 0.3)); sfx(P('G06_01', 0.55), 'buzz', 0.5); sfx(P('G06_01', 0.6), 'stamp', 0.6);
  sfx(S('G06_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G06_02', 0.4), 'impact', 0.4); sfx(P('G06_02', 0.4) + 0.05, 'stamp', 0.5); sfx(P('G06_02', 0.62), 'sparkle', 0.4); sfx(P('G06_02', 0.8), 'pop', 0.4);
  sfx(S('G06_03') - 0.15, 'swoosh_in', 0.4); [0.05, 0.25, 0.5].forEach(f => sfx(P('G06_03', f), 'pop', 0.4)); termSfx(L_LEAK()); });

// ---- 讲解⑥：清理历史（Kimi）----
const L_H2 = () => [{ s: 'git filter-repo --sensitive-data-removal \\', t: P('G07_02', 0.08), cmd: true, dur: 0.5 }, { s: '{c}    --invert-paths --path config.js', t: P('G07_02', 0.3) },
  { s: '{d}# 或者：只把密钥替换掉', t: P('G07_02', 0.55) }, { s: 'git filter-repo --sensitive-data-removal \\', t: P('G07_02', 0.62), cmd: true, dur: 0.4 }, { s: '{c}    --replace-text ../passwords.txt', t: P('G07_02', 0.78) }];
const L_H3 = () => [{ s: 'git push --force --mirror origin', t: P('G07_03', 0.08), cmd: true, dur: 0.45 }, { s: '{y} + 7c1e9a2...3f9a2c1 main -> main (forced update)', t: P('G07_03', 0.25) }];
const L_H4 = () => [{ s: 'git push', t: P('G07_04', 0.5), cmd: true, dur: 0.2 }, { s: '{r}remote: error: Push cannot contain secrets', t: P('G07_04', 0.62) }, { s: '{y}remote:   — 检测到密钥：config.js:3 —', t: P('G07_04', 0.68) }, { s: '{r} ! [remote rejected] main -> main', t: P('G07_04', 0.72) }];
SC.hist = (t, blk, en) => {
  bgLecture(t, HISC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G07_01'), g2 = S('G07_02') - 0.15, g3 = S('G07_03') - 0.15, g4 = S('G07_04') - 0.15, g5 = U.K02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    [['🔑', '旧密钥已作废', '很多时候，这就够了 ✓', GOODC, g1 + 0.1], ['🧹', '要彻底清掉', 'git filter-repo', HISC, P('G07_01', 0.55)]].forEach((c, i) => { const s = popIn(t, c[4], 0.45); if (s <= 0) return;
      const x = 980 + i * 620; ctx.save(); ctx.translate(x, 430); ctx.scale(s, s); ctx.rotate((i ? 1 : -1) * 0.03); box(-250, -270, 500, 540, 28, '#fffaf0', c[3], 8);
      if (i === 0) keyIcon(-60, -110, 1.2, '#8c959f', { broken: true }); else txt(c[0], 0, -110, 120, '#000', { align: 'center', font: EMOJI, bold: false });
      txt(c[1], 0, 40, 40, '#1b1433', { align: 'center' }); txt(c[2], 0, 130, 30, c[3], { align: 'center', font: i ? F_CODE : F_BODY + ',' + F_CODE }); ctx.restore(); });
    if (t >= P('G07_01', 0.55)) txt('或', 1290, 430, 48, '#fff', { align: 'center', font: F_FANCY, bold: false });
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fadeW(t, g2, g3); ctx.save(); ctx.globalAlpha *= a;
    terminal(t, 680, 110, 1180, 420, L_H2(), { title: '终端 — rice-page', accent: HISC, fs: 26, prompt: false });
    if (t >= P('G07_02', 0.3)) pill(1500, 590, '整个文件从历史里删掉', HISC, popIn(t, P('G07_02', 0.32)), { fs: 28 });
    if (t >= P('G07_02', 0.8)) { const s = popIn(t, P('G07_02', 0.8), 0.4); ctx.save(); ctx.translate(1270, 720); ctx.scale(s, s); box(-560, -70, 1120, 140, 18, '#fff', HISC, 5);
      txt('📄 passwords.txt', -530, -30, 22, '#57606a', { font: EMOJI + ',' + F_CODE }); txt('sk_live_51Hx9aQ…7Qz', -530, 20, 30, BADC, { font: F_CODE }); txt('→', 40, 20, 40, '#1b1433', { align: 'center' }); txt('***REMOVED***', 120, 20, 30, GOODC, { font: F_CODE }); ctx.restore(); }
    ctx.restore(); }
  if (t >= g3 - 0.1 && t < g4 + 0.3) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    terminal(t, 680, 110, 1180, 250, L_H3(), { title: '终端 — 覆盖远程', accent: '#d6283e', fs: 26, prompt: false });
    [['♻️', '所有人重新克隆', GOODC, P('G07_03', 0.4)], ['🔁', '旧分支用变基接上', GOODC, P('G07_03', 0.55)], ['⛔', '千万别合并', BADC, P('G07_03', 0.72)]].forEach((c, i) => { const s = popIn(t, c[3], 0.4); if (s <= 0) return;
      const x = 880 + i * 390; ctx.save(); ctx.translate(x, 580); ctx.scale(s, s); box(-180, -150, 360, 300, 24, i === 2 ? '#fff5f5' : '#effaf3', c[2], 6); txt(c[0], 0, -50, 80, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 0, 70, 30, '#1b1433', { align: 'center', max: 330 }); ctx.restore(); });
    if (t >= P('G07_03', 0.85)) note(1660, 790, popIn(t, P('G07_03', 0.85)), '合并会把旧历史带回来', BADC, { fs: 28 });
    ctx.restore(); }
  if (t >= g4 - 0.1) { const a = fadeW(t, g4, g5); ctx.save(); ctx.globalAlpha *= a;
    const s = popIn(t, g4 + 0.05, 0.4); ctx.save(); ctx.translate(1270, 210); ctx.scale(s, s); box(-580, -90, 1160, 180, 22, '#fff', '#57606a', 5);
    txt('📨 联系 GitHub Support', -540, -30, 36, '#1b1433', { font: EMOJI + ',' + F_CODE + ',' + F_BODY }); txt('清理旧 PR 里的缓存视图和引用', -540, 30, 28, '#57606a', { bold: false }); ctx.restore();
    pill(1270, 380, '🛡️ 推送保护（Push protection）', GOODC, popIn(t, P('G07_04', 0.45)), { fs: 34, font: EMOJI + ',' + F_BODY + ',' + F_CODE });
    terminal(t, 680, 430, 1180, 340, L_H4(), { title: '终端 — 又想推密钥？', accent: GOODC, fs: 26, prompt: false, alpha: clamp(prog(t, P('G07_04', 0.45), 0.25)) });
    if (t >= P('G07_04', 0.72)) stamp(t, P('G07_04', 0.72), 1640, 700, '直接拦下', GOODC, 52, -0.1);
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['K02']); sfx(S('G07_01') + 0.1, 'pop', 0.4); sfx(P('G07_01', 0.55), 'pop', 0.4);
  sfx(S('G07_02') - 0.15, 'swoosh_in', 0.4); termSfx(L_H2()); sfx(P('G07_02', 0.32), 'pop', 0.3); sfx(P('G07_02', 0.8), 'sparkle', 0.4);
  sfx(S('G07_03') - 0.15, 'swoosh_in', 0.4); termSfx(L_H3()); sfx(P('G07_03', 0.25), 'impact', 0.4); [0.4, 0.55].forEach(f => sfx(P('G07_03', f), 'ding', 0.35)); sfx(P('G07_03', 0.72), 'buzz', 0.4); sfx(P('G07_03', 0.85), 'pop', 0.3);
  sfx(S('G07_04') - 0.15, 'swoosh_in', 0.4); sfx(P('G07_04', 0.45), 'pop', 0.4); termSfx(L_H4()); sfx(P('G07_04', 0.62), 'buzz', 0.4); sfx(P('G07_04', 0.72), 'stamp', 0.6); });

// ---- 复习：瘦 · 齐 · 救 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const cards = [['🏃 瘦', SIZEC, ['大文件交给 Git LFS', 'migrate 搬走历史', '下载包放 Release'], 'G08_01'], ['📏 齐', EOLC, ['.gitattributes', '* text=auto', '只算真改动'], 'G08_02'], ['🚑 救', BADC, ['先作废、换新密钥', 'filter-repo 清历史', '强推 + 重新克隆'], 'G08_03']];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.1, 0.4); if (s <= 0) return; const act = t >= S(c[3]) - 0.1 && (i === 2 || t < S(cards[i + 1][3]) - 0.1);
    const x = 870 + i * 400, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= S(c[3]) - 0.1 ? 1 : 0.5;
    if (act) { ctx.shadowColor = c[1]; ctx.shadowBlur = 40; } box(-180, -300, 360, 600, 28, '#fffaf0', c[1], 8); ctx.shadowBlur = 0;
    box(-180, -300, 360, 100, [28, 28, 0, 0], c[1]); txt(c[0], 0, -248, 46, '#fff', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false });
    c[2].forEach((l, k) => { const a = clamp(prog(t, P(c[3], 0.12 + k * 0.25), 0.25)); ctx.save(); ctx.globalAlpha *= 0.25 + 0.75 * a; box(-150, -170 + k * 140, 300, 110, 16, '#fff', '#e4dff5', 3); txt(l, 0, -170 + k * 140 + 55, 25, '#1b1433', { align: 'center', max: 280, font: /^[.*a-z]/.test(l) ? F_CODE : F_BODY + ',' + F_CODE }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= P('G08_03', 0.8)) fancy('瘦 · 齐 · 救，仓库体检全绿！', 1270, 880, 56, t, P('G08_03', 0.8), FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2].forEach(i => sfx(BK.recap.t0 + 0.1 + i * 0.1, 'pop', 0.3)); ['G08_01', 'G08_02', 'G08_03'].forEach(id => { for (let k = 0; k < 3; k++) sfx(P(id, 0.12 + k * 0.25), 'ding', 0.25); }); sfx(P('G08_03', 0.8), 'sparkle', 0.5); });

// ---- 实战：白饭页全面体检 ----
const L_PR = () => [{ s: 'git count-objects -vH', t: P('G09_01', 0.08), cmd: true, dur: 0.35 }, { s: '{y}size-pack: 2.10 GiB   {r}← 元凶：design/ 文件夹', t: P('G09_01', 0.45) },
  { s: 'git lfs track "*.psd" && git add .gitattributes', t: P('G09_02', 0.05), cmd: true, dur: 0.5 }, { s: 'git lfs migrate import --include="*.psd" --everything', t: P('G09_02', 0.5), cmd: true, dur: 0.5 },
  { s: 'echo "* text=auto" >> .gitattributes', t: P('G09_03', 0.05), cmd: true, dur: 0.35 }, { s: 'git add --renormalize . && git commit -m "统一换行符"', t: P('G09_03', 0.4), cmd: true, dur: 0.5 },
  { s: '{p}后台：旧密钥已作废 ✓   新密钥 → .env', t: P('G09_04', 0.1) }, { s: 'git filter-repo --sensitive-data-removal --replace-text ../passwords.txt', t: P('G09_04', 0.4), cmd: true, dur: 0.6 },
  { s: 'git push --force --mirror origin', t: P('G09_04', 0.82), cmd: true, dur: 0.35 }, { s: 'git count-objects -vH', t: S('G09_05'), cmd: true, dur: 0.3 }, { s: '{g}size-pack: 12.0 MiB ✓', t: P('G09_05', 0.25) }];
SC.practice = (t, blk, en) => {
  bgLecture(t, GOODC); lecturer(t, blk, en, blk.t0);
  const steps = [['量体重', S('G09_01')], ['LFS', S('G09_02')], ['换行符', S('G09_03')], ['密钥', S('G09_04')], ['复查', S('G09_05')]];
  const end = S('D10') - 0.2;
  steps.forEach((s, i) => { const a = popIn(t, blk.t0 + 0.15 + i * 0.06); if (a <= 0) return;
    const x = 800 + i * 235, y = 88; const act = t < end && t >= s[1] && (i === 4 || t < steps[i + 1][1]); const done = t >= end || (i < 4 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1)); box(-105, -32, 210, 64, 18, act ? GOODC : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act ? '✓ ' : '') + s[0], 0, 2, 26, '#fff', { align: 'center', font: isCJK(s[0]) ? F_BODY : F_CODE, max: 190 }); ctx.restore(); });
  const ta = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha *= ta;
  box(670, 150, 1210, 290, 24, '#fff', DOCC, 5); txt('🩺 体检报告 · dafeiyu/rice-page', 700, 190, 26, DOCC, { font: EMOJI + ',' + F_BODY + ',' + F_CODE });
  const thin = t >= P('G09_05', 0.25);
  const R = [['⚖️', '体重', thin ? '12 MB' : '2.1 GB', thin], ['🐘', '大文件', t >= P('G09_02', 0.8) ? '已进 LFS' : '12 个', t >= P('G09_02', 0.8)], ['↩️', '换行符', t >= P('G09_03', 0.7) ? '统一' : '乱', t >= P('G09_03', 0.7)], ['🔑', '密钥', t >= P('G09_04', 0.7) ? '已清除' : '泄露', t >= P('G09_04', 0.7)]];
  R.forEach((r, i) => checkRow(700 + (i % 2) * 585, 230 + Math.floor(i / 2) * 95, 560, r[0], r[1], r[2], r[3], 1));
  terminal(t, 670, 460, 1210, 440, L_PR(), { title: '终端 — rice-page', accent: GOODC, fs: 22, prompt: false });
  if (thin && t < end) stamp(t, P('G09_05', 0.3), 1700, 845, '克隆 3 秒', GOODC, 44, -0.1);
  ctx.restore();
  if (t < S('G09_01') + 0.6) fancy('实战开始！', 1280, 500, 110, t, blk.t0 + 0.2, Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_medal', 1620, H + 30, 900, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    const s = popIn(t, end + 0.05, 0.4); ctx.save(); ctx.translate(1000, 380); ctx.scale(s, s); box(-300, -230, 600, 460, 26, '#fff', GOODC, 7); txt('🩺 体检报告', 0, -175, 38, DOCC, { align: 'center', font: EMOJI + ',' + F_BODY });
    [['⚖️', '体重', '12 MB'], ['🐘', '大文件', 'LFS'], ['↩️', '换行符', '统一'], ['🔑', '密钥', '已清除']].forEach((r, i) => checkRow(-260, -120 + i * 84, 520, r[0], r[1], r[2], true, 1)); ctx.restore();
    stamp(t, end + 0.4, 1330, 120, '全部通过 ✓', GOODC, 60, -0.1);
    fancy('仓库瘦身成功！', 980, 720, 96, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 5; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(b.t0 + 0.2, 'impact', 0.6); termSfx(L_PR());
  sfx(P('G09_01', 0.45), 'buzz', 0.3); sfx(P('G09_02', 0.8), 'ding', 0.4); sfx(P('G09_03', 0.7), 'ding', 0.4); sfx(P('G09_04', 0.1), 'pop', 0.3); sfx(P('G09_04', 0.7), 'ding', 0.4);
  sfx(P('G09_05', 0.25), 'impact', 0.5); sfx(P('G09_05', 0.3), 'stamp', 0.5); sfx(P('G09_05', 0.3) + 0.1, 'sparkle', 0.5);
  const e = S('D10') - 0.2; sfx(e, 'swoosh_in', 0.5); sfx(e + 0.4, 'stamp', 0.7); sfx(e + 0.3, 'sparkle', 0.6); sfx(e + 0.4, 'confetti', 0.6); });

// ---- 预告 + 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#5f3dc4');
  const outro = E('G10_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G10_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G10_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G10_01', 0.08), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 480); ctx.scale(bp, bp); ctx.translate(-1260, -480);
      box(860, 230, 800, 500, 24, '#ffffff', '#5f3dc4', 6);
      txt('🎓 毕业篇', 900, 285, 38, '#5f3dc4', { font: EMOJI + ',' + F_BODY });
      [['🛡️', '分支保护', 'main 不能直接推', P('G10_01', 0.2)], ['🏷️', '打标签发版本', 'git tag v1.0 · Release', P('G10_01', 0.38)], ['👥', '团队协作流程', '分支 → PR → 审查 → 合并', P('G10_01', 0.55)]].forEach((c, i) => { const s = popIn(t, c[3]); if (s <= 0) return; ctx.save(); ctx.translate(1260, 380 + i * 115); ctx.scale(s, s);
        box(-360, -50, 720, 100, 16, '#f6f8fa', '#5f3dc4', 3); txt(c[0], -320, 0, 50, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], -260, -16, 30, '#24292f', {}); txt(c[2], -260, 26, 22, '#5f3dc4', { font: F_CODE + ',' + F_BODY, bold: false }); ctx.restore(); });
      ctx.restore(); }
    [['branch protection', -540, 300, 0.25], ['git tag', 470, 280, 0.4], ['Release', -500, 720, 0.5], ['团队流程', 470, 730, 0.6]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G10_01', c[3])), { fs: 32, font: isCJK(c[0]) ? F_BODY : F_CODE }));
    fancy('十二集串成一条线！', 1260, 850, 66, t, P('G10_01', 0.78), FX.pink);
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
    fancy('一键三连，毕业典礼见！', W / 2, 180, 92, t, S('G10_02') + 1.4, { stagger: 0.04 });
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
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G10_01', 0.08), 'pop', 0.6); [0.2, 0.38, 0.55].forEach(f => sfx(P('G10_01', f), 'pop', 0.4));
  [0.25, 0.4, 0.5, 0.6].forEach(f => sfx(P('G10_01', f), 'pop', 0.3)); sfx(P('G10_01', 0.78), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G10_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G10_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸（每个都对应一个知识点）=================
const CAMEOS = [
  ['d_heavy', P('G02_01', 0.82), E('G02_01')], ['d_sparkle', P('G04_03', 0.78), E('G04_03')],
  ['d_panic', P('G06_01', 0.6), E('G06_01')], ['d_ok', P('G07_01', 0.2), P('G07_01', 0.5)],
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
