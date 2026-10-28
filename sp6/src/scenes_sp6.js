
// ================= 番外6：网页里写代码 =================
Object.assign(SQ.Q, { role: '用户反馈' });
const PENC = '#1f883d', DEVC = '#0969da', CSC = '#8250df', PRAC = '#7048e8';
const TYPO = '欢迎来到白饭页，今天吃百饭！', FIXED = '欢迎来到白饭页，今天吃白饭！';

// ---- 冷开场：README 错别字 + 借来的电脑 ----
coldScene({ bg: ['#10233a', '#2f81f7'], pose: 'd_panic', pill: '大肥鱼 · 借来的电脑', cry: ['没装 Git！', ['D01', 0.55]], shake: ['D01', 0.6],
  panels: [{ at: 0.05, k: 'gh', url: 'github.com/dafeiyu/rice-page', y: 170, h: 500, rows: [
    [0.1, 'h', '📄 README.md'], [0.2, 't', '# 今天吃白饭', { size: 34, col: '#24292f', bold: true }], [0.3, 't', '每天一碗白饭，快乐加倍。'], [['Q01', 0.5], 't', TYPO, { col: '#cf222e', bold: true }]],
    st: [[['Q01', 0.65], '错别字！', CLUE, 1580, 600, 54, -0.08]] }] });

// ---- 引入：三件套 ----
lec('why', { acc: DEVC, panels: [{ at: 'G01_01', k: 'cards', tag: ['🌐 不用装 Git', CLUE], items: [
  ['✏️', '铅笔', '改一两处', PENC, ['G01_01', 0.15]], ['⌨️', 'github.dev', '浏览器里的\nVS Code', DEVC, ['G01_01', 0.4]], ['☁️', 'Codespaces', '带终端的\n云端开发机', CSC, ['G01_01', 0.7]]] }] });

titleScene({ bg: ['#0d1b2a', '#2f81f7'], icons: ['🌐', '✏️', '☁️', '⌨️', '🚀'], gpose: 'g_web', dpose: 'd_happy', num: '番外6', l1: '网页里', l2: '写代码！' });

const PROB = {
  penQ: { chap: ['技巧①', '铅笔', PENC, F_BODY], q: '最简单的改法？', bg: ['#e3f7e9', '#c2edd0'], draw: qArt('✏️', ['改一个字', '也要装 Git？'], PENC) },
  devQ: { chap: ['技巧②', 'github.dev', DEVC, F_CODE], q: '好几个文件呢？', bg: ['#e3f0ff', '#c4defc'], draw: qArt('⌨️', ['一次改好几个', '一起提交'], DEVC) },
  csQ: { chap: ['技巧③', 'Codespaces', CSC, F_CODE], q: '想跑起来看看？', bg: ['#f0e8ff', '#dccfff'], draw: qArt('☁️', ['网页里', '也能运行？'], CSC) },
  pickQ: { chap: ['技巧④', '怎么选', '#e8590c', F_BODY], q: '三个怎么选？', bg: ['#fff0e0', '#ffd9b3'], draw: qArt('🤔', ['铅笔 · github.dev', 'Codespaces'], '#e8590c') },
  askP: { chap: ['实战', '借来的电脑修错字', PRAC, F_BODY], q: '修好错别字！', bg: ['#efe8ff', '#dccfff'], draw: qArt('💻', ['什么都不装', '照样提 PR'], PRAC) },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);

// ---- 技巧①：铅笔 ----
lec('pen', { acc: PENC, chap: PROB.penQ.chap, panels: [
  { at: 'G02_01', k: 'gh', url: 'github.com/dafeiyu/rice-page/blob/main/README.md', h: 560, rows: [
    [['G02_01', 0], 'h', '📄 README.md'], [['G02_01', 0.3], 'btn', '✏️ Edit', { hot: [['G02_01', 0.4], ['G02_01', 0.75]] }],
    [['G02_01', 0.7], 'field', 'README.md（编辑中）', FIXED]],
    fx: [[['G02_01', 0.5], '右上角的铅笔', 'green', null, 720, 56]] },
  { at: 'G02_02', k: 'gh', url: 'github.com/dafeiyu/rice-page/edit/main/README.md', h: 600, rows: [
    [['G02_02', 0], 'h', 'Commit changes'], [['G02_02', 0.08], 'field', '提交说明', 'docs: 修复错别字'],
    [['G02_02', 0.3], 't', '◉  直接提交到 main', { col: '#24292f', bold: true, size: 28 }], [['G02_02', 0.55], 't', '○  新建分支，顺手开 PR', { col: '#24292f', bold: true, size: 28 }],
    [['G02_02', 0.75], 'btn', 'Commit changes', { green: true, hot: [['G02_02', 0.78], ['G02_02', 1]] }]] },
  { at: 'G02_03', k: 'gh', url: 'github.com/dafeiyu/rice-page/pull/18/files', h: 600, rows: [
    [['G02_03', 0], 'h', '💬 审 PR #18'], [['G02_03', 0.1], 't', '千问：这里错了一个字，建议这样改 👇'],
    [['G02_03', 0.2], 'code', '```suggestion'], [['G02_03', 0.3], 'code', FIXED, { col: '#1a7f37' }],
    [['G02_03', 0.68], 'btn', 'Commit suggestion', { green: true, hot: [['G02_03', 0.72], ['G02_03', 0.95]] }]],
    fx: [[['G02_03', 0.82], '作者一点就改好', 'yel', null, 760, 56]] }] });

// ---- 技巧②：github.dev ----
function keyCap(t, p) {
  const cx = p.x + p.w / 2, cy = 400, s = popIn(t, p.t0, 0.4); if (s <= 0) return; const k0 = P('G03_01', 0.18), dn = t >= k0 && t < k0 + 0.18 ? 14 : 0;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); box(-150, -140 + 20, 300, 280, 36, '#3b3355'); box(-150, -150 + dn, 300, 270, 36, '#f8f6ff', '#c9c2e8', 6);
  txt('.', 0, -40 + dn, 220, '#1b1433', { align: 'center', font: F_CODE }); txt('句号键', 0, 80 + dn, 34, '#7048e8', { align: 'center' }); ctx.restore();
  if (t >= k0) { const r = (t - k0) * 900; if (r < 500) { ctx.save(); ctx.strokeStyle = hexA(CLUE, 1 - r / 500); ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, 160 + r, 0, 7); ctx.stroke(); ctx.restore(); } }
  fancy('按一下 → github.dev', cx, 720, 60, t, k0 + 0.1, FX.yel);
}
const DEV_IDE = { k: 'ide', title: 'github.dev — dafeiyu/rice-page', acc: '#2f81f7' };
lec('dev', { acc: DEVC, chap: PROB.devQ.chap, panels: [
  { at: 'G03_01', k: 'draw', fn: keyCap },
  { at: ['G03_01', 0.55], ...DEV_IDE, etitle: 'README.md', files: [], diff: [[['G03_01', 0.6], '# 今天吃白饭', ' '], [['G03_01', 0.64], '每天一碗白饭，快乐加倍。', ' ']],
    fx: [[['G03_01', 0.7], '浏览器里的 VS Code', 'blue', null, 820, 56]] },
  { at: 'G03_02', ...DEV_IDE, h: 600, etitle: '三个文件一起改', files: [['README.md', 'M', ['G03_02', 0.05]], ['index.html', 'M', ['G03_02', 0.15]], ['rice.css', 'M', ['G03_02', 0.25]]],
    msg: [['G03_02', 0.35], 'fix: 修复错别字和样式'], commit: [['G03_02', 0.32], ['G03_02', 0.52]],
    fx: [[['G03_02', 0.65], 'github.com → github.dev', 'yel', null, 780, 54]] },
  { at: 'G03_03', k: 'cards', cw: 480, items: [['🆓', '免费', '打开就能用', OKC, ['G03_03', 0.05]], ['🚫', '没有终端', '不能运行代码', BADC, ['G03_03', 0.45]]] },
  { at: 'G03_04', k: 'gh', url: 'github.com/dafeiyu/rice-page/pull/18', h: 420, rows: [
    [['G03_04', 0], 'h', '🔀 修复错别字 #18'], [['G03_04', 0.08], 't', 'fix/typo → main · 按 . 打开'], [['G03_04', 0.1], 'btn', '.', { hot: [['G03_04', 0.2], ['G03_04', 0.4]] }]] },
  { at: ['G03_04', 0.4], ...DEV_IDE, title: 'github.dev — PR #18 · fix/typo', etitle: 'README.md（fix/typo 分支）', files: [['README.md', 'M', ['G03_04', 0.5]]],
    diff: [[['G03_04', 0.5], TYPO, '-'], [['G03_04', 0.55], FIXED, '+']], fx: [[['G03_04', 0.8], '提交 → 直接进这个 PR', 'green', null, 820, 54]] }] });

// ---- 技巧③：Codespaces ----
lec('cs', { acc: CSC, chap: PROB.csQ.chap, panels: [
  { at: 'G04_01', k: 'gh', url: 'github.com/dafeiyu/rice-page', h: 560, rows: [
    [['G04_01', 0], 'btn', '<> Code', { green: true, hot: [['G04_01', 0.12], ['G04_01', 0.35]] }], [['G04_01', 0.3], 't', '本地    ▸ Codespaces', { col: '#8250df', bold: true, size: 30 }],
    [['G04_01', 0.45], 'btn', '+ Create codespace on main', { green: true, hot: [['G04_01', 0.5], ['G04_01', 0.75]] }], [['G04_01', 0.75], 't', '☁️ 云端开发机启动中…', { size: 28 }]],
    st: [[['G04_01', 0.85], '带终端！', CSC, 1640, 640, 56]] },
  { at: 'G04_02', k: 'term', title: 'Codespace — rice-page（浏览器里）', y: 150, h: 440, fs: 27, lines: [
    [['G04_02', 0.02], '$ git --version'], [['G04_02', 0.12], '{d}git version 2.x  ← 已装好'], [['G04_02', 0.35], '$ npm run dev'], [['G04_02', 0.5], '{g}➜  Local: http://localhost:3000'],
    [['G04_02', 0.72], '{y}🔌 端口 3000 已转发 → 浏览器打开预览']] },
  { at: 'G04_03', k: 'cards', tag: ['💰 个人账号 · 每月免费', CLUE], items: [['⏱️', '120 核心小时', '计算时长', CSC, ['G04_03', 0.2]], ['💾', '15 GB', '存储', DEVC, ['G04_03', 0.42]], ['😴', '30 分钟', '闲置自动停止', '#868e96', ['G04_03', 0.72]]] }] });

// ---- 技巧④：怎么选 ----
lec('pick', { acc: '#e8590c', chap: PROB.pickQ.chap, panels: [
  { at: 'G05_01', k: 'cards', items: [['✏️', '铅笔', '改一两个字', PENC, ['G05_01', 0.05]], ['⌨️', 'github.dev', '改几个文件', DEVC, ['G05_01', 0.35]], ['☁️', 'Codespaces', '要运行\n要终端', CSC, ['G05_01', 0.7]]] },
  { at: 'G05_02', k: 'gh', url: 'github.com/codespaces', h: 460, rows: [
    [['G05_02', 0], 'h', '☁️ 你的 codespaces'], [['G05_02', 0.1], 't', '😴 rice-page-main · 已停止 · 2.1 GB', { col: '#24292f', size: 28 }],
    [['G05_02', 0.3], 'btn', '🗑 Delete', { hot: [['G05_02', 0.35], ['G05_02', 0.7]], hc: BADC }]],
    st: [[['G05_02', 0.6], '停着也算存储额度', BADC, 1270, 660, 50, -0.05]] }] });

// ---- 实战 ----
lec('practice', { acc: PRAC, chap: PROB.askP.chap, steps: [['github.dev', 'G06_01'], ['提交 + PR', 'G06_02'], ['Codespaces', 'G06_03']], sx: 920, sdx: 350, panels: [
  { at: 'G06_01', ...DEV_IDE, etitle: 'README.md · ⑂ fix/typo', files: [['README.md', 'M', ['G06_01', 0.75]]],
    diff: [[['G06_01', 0.05], '# 今天吃白饭', ' '], [['G06_01', 0.1], TYPO, ' ']], extra: (t, p, g) => { if (t >= P('G06_01', 0.72)) { box(g.ex + 50, (p.y ?? 110) + 160, g.ew - 58, 40, 0, '#1e1e1e'); box(g.ex + 50, (p.y ?? 110) + 162, g.ew - 58, 36, 4, 'rgba(46,160,67,0.35)'); txt(FIXED, g.ex + 60, (p.y ?? 110) + 140 + 40.8, 24, '#d4d4d4', { font: F_CODE + ',' + F_BODY, bold: false }); } },
    fx: [[['G06_01', 0.35], '⑂ 新分支 fix/typo', 'blue', null, 820, 54]] },
  { at: 'G06_02', ...DEV_IDE, etitle: 'README.md · ⑂ fix/typo', files: [['README.md', 'M', ['G06_02', 0], ['G06_02', 0.3]]], msg: [['G06_02', 0.05], 'docs: 修复 README 错别字'], commit: [['G06_02', 0.02], ['G06_02', 0.3]] },
  { at: ['G06_02', 0.5], k: 'gh', url: 'github.com/dafeiyu/rice-page/compare/fix/typo', h: 440, rows: [
    [['G06_02', 0.5], 'h', '🔀 Open a pull request'], [['G06_02', 0.58], 't', 'fix/typo → main'], [['G06_02', 0.68], 'btn', 'Create pull request', { green: true, hot: [['G06_02', 0.75], ['G06_02', 1]] }]] },
  { at: 'G06_03', k: 'term', title: 'Codespace — fix/typo', y: 150, h: 380, fs: 27, lines: [
    [['G06_03', 0.25], '$ npm run dev'], [['G06_03', 0.45], '{g}➜  预览：' + FIXED]],
    st: [[['G06_03', 0.7], '没问题 → 合并 ✓', OKC, 1270, 650, 56]] }] });

outroScene({ head: '番外6 完！', comment: true, rows: [['🧪', 'Git 进阶？', 'bisect · worktree …'], ['🤖', '和 AI 一起写代码？', 'AI 娘们来帮你开 PR'], ['💬', '你来点菜！', '评论区告诉我们']], tease: '评论区见！', end: '一键三连，下次见！', dpose: 'd_happy' });

// ================= 大肥鱼反应贴纸（每个都对应一个知识点）=================
const CAMEOS = [
  ['d_ok', P('G02_03', 0.85), E('G02_03')], ['d_sparkle', P('G03_04', 0.85), E('G03_04')], ['d_shock', P('G05_02', 0.8), E('G05_02')],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));
