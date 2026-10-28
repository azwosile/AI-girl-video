
// ================= 番外3：图形界面工具 =================
Object.assign(SQ.M, { role: '写到一半' });
const VSC = '#007acc', PARTC = '#a855f7', CONFC = '#e03131', DESKC = '#6f42c1', PRAC = '#7048e8';

// ---- 冷开场：二十个文件，只想交三行 ----
coldScene({ bg: ['#10233a', '#1f6feb'], pose: 'd_tangle', pill: '大肥鱼 · 改了一下午', cry: ['命令全忘了！', ['D01', 0.6]], shake: ['D01', 0.5],
  panels: [{ at: 0.05, k: 'term', title: '终端 — git status', acc: '#1f6feb', y: 170, h: 470, fs: 24, lines: [
    [['D01', 0, -0.2], '$ git status'], ...['index.html', 'rice.css', 'menu.js', 'bowl.js', 'about.html', 'logo.svg', 'README.md', 'chopsticks.js', 'soup.css', 'table.html', 'tea.js', 'spoon.css']
      .map((f, i) => [['D01', 0.04 + i * 0.03], `{r}        modified:   ${f}`])],
    st: [[['D01', 0.5], '20 个文件！', CLUE, 1360, 720, 66]] }] });

// ---- 引入：VS Code 自带 Git 界面 ----
lec('why', { acc: VSC, panels: [{ at: 'G01_01', k: 'ide', tag: ['🖱️ 不想敲命令？', CLUE], tagY: 60, pulse: [['G01_01', 0.3], ['G01_01', 0.6]],
  files: [['index.html', 'M', ['G01_01', 0.35]], ['rice.css', 'M', ['G01_01', 0.4]], ['menu.js', 'U', ['G01_01', 0.45]]],
  msg: [['G01_01', 0.6], '修复按钮错位'], commit: [['G01_01', 0.55], ['G01_01', 0.85]],
  fx: [[['G01_01', 0.7], '点几下就能存档', 'yel', 1500, 560, 60]] }] });

titleScene({ bg: ['#002b4d', '#007acc'], icons: ['🖱️', '💻', '✅', '🔀', '🐙'], gpose: 'g_mouse', dpose: 'd_happy', num: '番外3', l1: '图形界面', l2: '工具！' });

const PROB = {
  btnQ: { chap: ['技巧①', '源代码管理', VSC, F_BODY], q: '按钮在哪儿？', bg: ['#e3f0ff', '#c4defc'], draw: qArt('🖱️', ['不敲命令', '点按钮就能存档'], VSC) },
  partQ: { chap: ['技巧②', '只交一部分', PARTC, F_BODY], q: '能只交一部分吗？', bg: ['#f3e8ff', '#e2ccff'], draw: qArt('✂️', ['一个文件两段改动', '只交改好的那段'], PARTC) },
  confQ: { chap: ['技巧③', '合并冲突', CONFC, F_BODY], q: '箭头看不懂！', bg: ['#ffe8e8', '#ffc9c9'], draw: qArt('⚔️', ['<<<<<<< HEAD', '>>>>>>> feature'], CONFC) },
  deskQ: { chap: ['技巧④', 'GitHub Desktop', DESKC, F_CODE], q: '不用 VS Code？', bg: ['#efe8ff', '#dccfff'], draw: qArt('🖥️', ['没装 VS Code', '也有图形界面'], DESKC) },
  askP: { chap: ['实战', '只用鼠标提交', PRAC, F_BODY], q: '只用鼠标！', bg: ['#efe8ff', '#dccfff'], draw: qArt('🖱️', ['看改动 → 暂存', '提交 → 同步'], PRAC) },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);

// ---- 技巧①：源代码管理面板 ----
const CSS_DIFF = a => [[[a, 0.05], '.eat-btn {', ' '], [[a, 0.1], '  margin-left: 12px;', '-'], [[a, 0.14], '  margin-left: 0;', '+'], [[a, 0.18], '  color: gold;', ' '], [[a, 0.2], '}', ' ']];
lec('btn', { acc: VSC, chap: PROB.btnQ.chap, panels: [
  { at: 'G02_01', k: 'ide', pulse: [['G02_01', 0.0], ['G02_01', 0.4]], files: [['index.html', 'M', ['G02_01', 0.45]], ['menu.js', 'U', ['G02_01', 0.62]], ['old.txt', 'D', ['G02_01', 0.8]]],
    extra: (t, p, g) => [['M', '修改', ['G02_01', 0.5]], ['U', '新文件', ['G02_01', 0.66]], ['D', '删除', ['G02_01', 0.84]]].forEach((r, i) => { const s = popIn(t, tAt(r[2])); if (s > 0) pill(g.ex + 330, 420 + i * 62, r[0] + ' = ' + r[1], SCM[r[0]], s, { fs: 30, font: F_BODY }); }),
    fx: [[['G02_01', 0.3], '分叉图标 = 源代码管理', 'blue', 1500, 300, 48]] },
  { at: 'G02_02', k: 'ide', etitle: 'rice.css（工作树）↔ 上次提交', open: [['G02_02', 0.05], 'rice.css'], files: [['rice.css', 'M', ['G02_02', 0], ['G02_02', 0.4]], ['menu.js', 'U', ['G02_02', 0]]],
    diff: CSS_DIFF('G02_02'), msg: [['G02_02', 0.62], 'fix: 修复按钮错位'], commit: [['G02_02', 0.5], ['G02_02', 0.88]],
    fx: [[['G02_02', 0.4], '＋ = git add', 'green', 1500, 560, 54], [['G02_02', 0.85], '✓ 提交 = git commit', 'blue', 1500, 680, 54]] },
  { at: 'G02_03', k: 'ide', files: [], sync: [['G02_03', 0.05], '同步更改 1↓ 1↑', ['G02_03', 0.55]], etitle: '同步 = 先 pull，再 push',
    fx: [[['G02_03', 0.6], '一键先拉后推', 'yel', 1500, 420, 64]], st: [[['G02_03', 0.75], '⇅ pull + push', VSC, 1500, 600, 50, -0.06]] },
  { at: 'G02_04', k: 'ide', etitle: 'rice.css（改乱了）', files: [['rice.css', 'M', ['G02_04', 0]]],
    diff: [[['G02_04', 0], '  margin-left: ???;', '+'], [['G02_04', 0], '  colr: gld;;', '+'], [['G02_04', 0], '  }}}', '+']],
    menu: [['G02_04', 0.28], ['打开更改', '放弃更改', '暂存更改'], 1], open: [['G02_04', 0.2], 'rice.css'],
    fx: [[['G02_04', 0.55], '回到上次提交', 'orange', 1500, 600, 50]], st: [[['G02_04', 0.78], '撤不回！小心', BADC, 1500, 720, 56]] }] });

// ---- 技巧②：暂存所选范围 / add -p / 取消暂存 ----
const MENU_DIFF = a => [[[a, 0], 'function eat() {', ' '], [[a, 0], '  rice += 1;      // 改好了', '+'], [[a, 0], '  bowl.fill();', '+'], [[a, 0], '  say("开饭啦");', '+'], [[a, 0], '}', ' '],
  [[a, 0], '// TODO 乱写的草稿 ???', '+'], [[a, 0], 'let xx = ;;', '+']];
lec('part', { acc: PARTC, chap: PROB.partQ.chap, panels: [
  { at: 'G03_01', k: 'ide', etitle: 'menu.js ↔ 上次提交', open: [['G03_01', 0], 'menu.js'], files: [['menu.js', 'M', ['G03_01', 0], ['G03_01', 0.72], true]],
    diff: MENU_DIFF('G03_01'), sel: [['G03_01', 0.28], 1, 3], menu: [['G03_01', 0.45], ['暂存所选范围', '还原所选范围', '复制'], 0, null, 500],
    fx: [[['G03_01', 0.78], '只有这几行进暂存区', 'pink', 1500, 760, 50]] },
  { at: 'G03_02', k: 'term', title: '终端 — git add -p', y: 150, h: 470, fs: 25, lines: [
    [['G03_02', 0.06], '$ git add -p menu.js'], [['G03_02', 0.25], '{c}@@ -1,2 +1,5 @@'], [['G03_02', 0.27], '{g}+  rice += 1;'], [['G03_02', 0.29], '{g}+  bowl.fill();'], [['G03_02', 0.31], '{g}+  say("开饭啦");'],
    [['G03_02', 0.42], '{y}(1/2) Stage this hunk [y,n,q,a,d,s,e,?]? {g}y'], [['G03_02', 0.6], '{g}+let xx = ;;'], [['G03_02', 0.68], '{y}(2/2) Stage this hunk [y,n,q,a,d,s,e,?]? {r}n']],
    fx: [[['G03_02', 0.5], '一块一块问', 'yel', 1560, 720, 58]] },
  { at: 'G03_03', k: 'ide', etitle: '暂存错了？', files: [['menu.js', 'M', ['G03_03', 0], ['G03_03', 0], false, ['G03_03', 0.4]]], minus: ['G03_03', 0.4],
    fx: [[['G03_03', 0.25], '点 − 取消暂存', 'blue', 1500, 420, 56], [['G03_03', 0.62], '改动还在文件里', 'green', 1500, 560, 54]] }] });

// ---- 技巧③：冲突按钮 + 合并编辑器 ----
function mergeEd(t, p) {
  const x = p.x, y = 110, w = p.w, h = 660; win(x, y, w, h, '合并编辑器 — rice.css', CONFC, { bg: '#1e1e1e' });
  const hw = (w - 30) / 2, a = 'G04_02';
  [['传入 feature', '#3794ff', ['  color: gold;'], x + 10, ['G04_02', 0.35]], ['当前 HEAD', '#3fb950', ['  color: white;'], x + 20 + hw, ['G04_02', 0.5]]].forEach(c => {
    box(c[3], y + 70, hw, 240, 10, '#252526', c[1], 3); txt(c[0], c[3] + 20, y + 100, 22, c[1], { font: F_BODY + ',' + F_CODE });
    box(c[3] + 14, y + 150, hw - 28, 50, 6, hexA(c[1], 0.22)); txt(c[2][0], c[3] + 30, y + 175, 24, '#d4d4d4', { font: F_CODE, bold: false });
    const on = clamp(prog(t, tAt(c[4]), 0.25)); box(c[3] + 20, y + 230, 30, 30, 6, on ? c[1] : '#1e1e1e', c[1], 2); if (on) txt('✓', c[3] + 35, y + 246, 22, '#fff', { align: 'center' });
    txt('接受' + (c[0].startsWith('传入') ? '传入' : '当前'), c[3] + 64, y + 245, 20, '#ccc', { font: F_BODY, bold: false }); });
  box(x + 10, y + 330, w - 20, 300, 10, '#252526', CLUE, 3); txt('结果  Result', x + 30, y + 360, 22, CLUE, { font: F_BODY + ',' + F_CODE });
  [['.eat-btn {', ['G04_02', 0.1]], ['  color: gold;', ['G04_02', 0.38]], ['  color: white;', ['G04_02', 0.53]], ['}', ['G04_02', 0.1]]].forEach((r, i) => { const k = clamp(prog(t, tAt(r[1]), 0.2)); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= k; if (i === 1 || i === 2) box(x + 24, y + 392 + i * 50, w - 48, 44, 6, hexA(i === 1 ? '#3794ff' : '#3fb950', 0.2)); txt(r[0], x + 40, y + 414 + i * 50, 24, '#d4d4d4', { font: F_CODE, bold: false }); ctx.restore(); });
}
lec('conf', { acc: CONFC, chap: PROB.confQ.chap, panels: [
  { at: 'G04_01', k: 'ide', etitle: 'rice.css', files: [['rice.css', 'C', ['G04_01', 0]]], open: [['G04_01', 0], 'rice.css'], dfs: 26,
    diff: [[['G04_01', 0], '<<<<<<< HEAD（当前更改）', '='], [['G04_01', 0], '  color: white;', '<'], [['G04_01', 0], '=======', '='], [['G04_01', 0], '  color: gold;', '>'], [['G04_01', 0], '>>>>>>> feature（传入的更改）', '=']],
    conf: [['G04_01', 0.3], ['采用当前更改', '采用传入的更改', '保留双方更改'], 2],
    fx: [[['G04_01', 0.75], '点一下就选好', 'yel', 1500, 640, 58]] },
  { at: 'G04_02', k: 'draw', fn: mergeEd, fx: [[['G04_02', 0.75], '勾一勾就合好', 'green', 1270, 810, 56]] },
  { at: 'G04_03', k: 'ide', etitle: 'rice.css（已合并）', files: [['rice.css', 'M', ['G04_03', 0], ['G04_03', 0.6]]], commitLabel: '✓ 完成合并', commit: [['G04_03', 0.05], ['G04_03', 0.3]],
    diff: [[['G04_03', 0], '.eat-btn {', ' '], [['G04_03', 0], '  color: gold;', '+'], [['G04_03', 0], '  color: white;', '+'], [['G04_03', 0], '}', ' ']],
    st: [[['G04_03', 0.7], '冲突解决 ✓', OKC, 1500, 640, 60]] }] });

// ---- 技巧④：GitHub Desktop + 提交图 ----
function deskWin(t, p) {
  const x = p.x, y = 110, w = p.w, h = 660, a = 'G05_01'; box(x, y, w, h, 18, '#ffffff', '#d0d7de', 4);
  box(x, y, w, 80, [18, 18, 0, 0], '#24292f');
  [['Current repository', 'rice-page', 0.15], ['Current branch', 'main', 0.4], ['Fetch origin', '⟳', 0.55]].forEach((c, i) => { const bx = x + 20 + i * 330; const hot = t >= tAt([a, c[2]]) && t < tAt([a, c[2] + 0.15]);
    if (hot) box(bx - 6, y + 8, 320, 64, 8, '#444c56'); txt(c[0], bx, y + 28, 18, '#8b949e', { font: F_CODE, bold: false }); txt(c[1], bx, y + 54, 24, '#fff', { font: F_CODE + ',' + EMOJI }); });
  box(x + 4, y + 80, 420, h - 84, 0, '#f6f8fa'); txt('Changes  3', x + 24, y + 110, 22, '#24292f', { font: F_CODE });
  ['index.html', 'rice.css', 'menu.js'].forEach((f, i) => { const on = clamp(prog(t, tAt([a, 0.6 + i * 0.03]), 0.2)); box(x + 24, y + 140 + i * 48, 26, 26, 5, '#0969da'); txt('✓', x + 37, y + 154 + i * 48, 20, '#fff', { align: 'center' }); txt(f, x + 64, y + 154 + i * 48, 22, '#24292f', { font: F_CODE, bold: false }); });
  box(x + 20, y + h - 220, 388, 48, 6, '#fff', '#d0d7de', 2); txt(t >= tAt([a, 0.62]) ? 'fix: 修复按钮错位' : 'Summary (required)', x + 34, y + h - 196, 20, t >= tAt([a, 0.62]) ? '#24292f' : '#8c959f', { font: F_BODY + ',' + F_CODE, bold: false });
  const c1 = tAt([a, 0.68]); ghBtn(x + 214, y + h - 140, 'Commit to main', { w: 388, bg: '#0969da', fg: '#fff', bd: '#0969da', hot: t >= c1 && t < c1 + 0.4, t });
  ghBtn(x + 214, y + h - 76, 'Push origin ↑1', { w: 388, hot: t >= tAt([a, 0.75]) && t < tAt([a, 0.85]), t });
  const pr = tAt([a, 0.85]); txt('No local changes', x + 430 + (w - 430) / 2, y + 260, 30, '#57606a', { align: 'center', font: F_CODE });
  ghBtn(x + 430 + (w - 430) / 2, y + 340, 'Create Pull Request', { w: 360, bg: '#1f883d', fg: '#fff', bd: '#1a7f37', hot: t >= pr, t, hc: CLUE });
  if (t >= pr) fancy('一键去开 PR', x + 430 + (w - 430) / 2, y + 450, 54, t, pr, FX.green);
}
function graphWin(t, p) {
  const x = p.x, y = 110, w = p.w, h = 640, a = 'G05_02'; win(x, y, w, h, '源代码管理 › 图形 GRAPH', VSC, { bg: '#1e1e1e' });
  const rows = [['合并 feature/menu', 0, 1], ['feat: 新菜单', 1], ['fix: 按钮错位', 0], ['feat: 菜单草稿', 1], ['开新分支 feature/menu', 0, 0, 1], ['init: 白饭页', 0]];
  const X0 = x + 90, DX = 70;
  rows.forEach((r, i) => { const yy = y + 110 + i * 88, k = popIn(t, tAt([a, 0.1 + i * 0.07])); if (k <= 0) return;
    if (i < rows.length - 1) { ctx.strokeStyle = MAINC; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(X0, yy); ctx.lineTo(X0, yy + 88); ctx.stroke(); }
    if (i >= 1 && i <= 3) { ctx.strokeStyle = FEATC; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(X0 + DX, yy - (i === 1 ? 44 : 88) + (i === 1 ? 0 : 0)); ctx.lineTo(X0 + DX, yy + 88); ctx.stroke(); }
    if (r[2]) { ctx.strokeStyle = FEATC; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(X0 + DX, yy + 88); ctx.quadraticCurveTo(X0 + DX, yy, X0, yy); ctx.stroke(); }
    if (r[3]) { ctx.strokeStyle = FEATC; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(X0, yy); ctx.quadraticCurveTo(X0 + DX, yy, X0 + DX, yy - 88); ctx.stroke(); }
    gDot(X0 + r[1] * DX, yy, k, r[1] ? FEATC : MAINC, { r: 18 }); txt(r[0], X0 + 2 * DX + 30, yy, 28, '#d4d4d4', { font: F_BODY + ',' + F_CODE, bold: false }); });
  if (t >= tAt([a, 0.6])) fancy('怎么分、怎么合，一眼看清', x + w / 2 + 120, y + h - 60, 50, t, tAt([a, 0.6]), FX.blue);
}
lec('desk', { acc: DESKC, chap: PROB.deskQ.chap, panels: [
  { at: 'G05_01', k: 'draw', fn: deskWin, tag: ['🖥️ GitHub Desktop · 官方免费', CLUE], tagY: 60 },
  { at: 'G05_02', k: 'draw', fn: graphWin },
  { at: 'G05_03', k: 'flow', title: '按钮背后还是命令', y: 430, items: [['点「提交」', DESKC, ['G05_03', 0.1], '图形界面'], ['git commit', '#24292f', ['G05_03', 0.3], '同一套命令'], ['懂命令 = 会排错', BADC, ['G05_03', 0.6], '出问题才看得懂']],
    fx: [[['G05_03', 0.75], '两样都会最稳！', 'yel', null, 700, 62]] }] });

// ---- 实战 ----
lec('practice', { acc: PRAC, chap: PROB.askP.chap, steps: [['看改动', 'G06_01'], ['暂存 + 提交', 'G06_02'], ['同步', 'G06_03']], sx: 920, sdx: 350, panels: [
  { at: 'G06_01', k: 'ide', y: 140, h: 640, pulse: [['G06_01', 0], ['G06_01', 0.3]], etitle: 'menu.js ↔ 上次提交', open: [['G06_01', 0.6], 'menu.js'],
    files: [['menu.js', 'M', ['G06_01', 0.3]], ['rice.css', 'M', ['G06_01', 0.35]], ['draft.txt', 'U', ['G06_01', 0.4]]], diff: MENU_DIFF(['G06_01', 0.65][0]).map(d => [['G06_01', 0.65], d[1], d[2]]) },
  { at: 'G06_02', k: 'ide', y: 140, h: 640, etitle: 'menu.js ↔ 上次提交', open: [['G06_02', 0], 'menu.js'],
    files: [['menu.js', 'M', ['G06_02', 0], ['G06_02', 0.42], true], ['rice.css', 'M', ['G06_02', 0]], ['draft.txt', 'U', ['G06_02', 0]]],
    diff: MENU_DIFF('G06_02'), sel: [['G06_02', 0.1], 1, 3], menu: [['G06_02', 0.22], ['暂存所选范围', '还原所选范围', '复制'], 0, null, 520],
    msg: [['G06_02', 0.6], 'feat: 加一碗饭'], commit: [['G06_02', 0.55], ['G06_02', 0.9]] },
  { at: 'G06_03', k: 'ide', y: 140, h: 640, etitle: '推上 GitHub', files: [['rice.css', 'M', ['G06_03', 0]], ['draft.txt', 'U', ['G06_03', 0]]], sync: [['G06_03', 0.05], '同步更改 0↓ 1↑', ['G06_03', 0.3]],
    st: [[['G06_03', 0.45], '✓ 已推送', OKC, 1500, 380, 60]], fx: [[['G06_03', 0.65], '一个命令都没敲！', 'yel', 1500, 560, 58]] }] });

outroScene({ head: '番外3 完！', next: ['⌨️', 'GitHub CLI', '开 PR 不用打开网页'], dpose: 'd_happy' });

// ================= 大肥鱼反应贴纸（每个都对应一个知识点）=================
const CAMEOS = [
  ['d_sparkle', P('G02_02', 0.9), E('G02_02')], ['d_shock', P('G02_04', 0.8), E('G02_04')], ['d_ok', P('G04_02', 0.8), E('G04_02')],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));
