
// ================= 番外4：GitHub CLI =================
Object.assign(SQ.X, { role: '合并' });
const AUTHC = '#0969da', REPOC = '#e8590c', PRGC = '#2da44e', ISSC = '#7057ff', PRAC = '#7048e8';

// ---- 冷开场：网页 ↔ 终端来回切 ----
function swapWins(t, p) {
  const t0 = p.t0, k = Math.floor(Math.max(0, t - t0 - 0.3) / 0.55) % 2, wob = Math.sin(t * 7) * 6;
  const drawWeb = (x, y, s) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ghWin(-420, -230, 840, 460, 'github.com/dafeiyu/rice-page/pull/12');
    txt('🔀 修复错别字 #12', -380, -120, 34, '#24292f', { font: F_BODY + ',' + EMOJI }); ghBtn(-250, 0, 'Merge pull request', { w: 300, bg: '#1f883d', fg: '#fff', bd: '#1a7f37' }); ctx.restore(); };
  const drawTerm = (x, y, s) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); win(-420, -230, 840, 460, '终端', '#7c5cff');
    ctx.font = `bold 28px ${F_CODE}`; colorText('{g}$ {w}git pull', -380, -120); colorText('{g}$ {w}git switch fix/typo', -380, -70); colorText('{g}$ {w}git push', -380, -20); ctx.restore(); };
  const A = [1300 - 40 + wob, 380], B = [1420 + 40 - wob, 520];
  if (k) { drawTerm(...A, 0.92); drawWeb(...B, 1); } else { drawWeb(...A, 0.92); drawTerm(...B, 1); }
  ['🔄', '💫'].forEach((e, i) => txt(e, 1360 + Math.cos(t * 4 + i * 3) * 470, 450 + Math.sin(t * 4 + i * 3) * 320, 80, '#000', { align: 'center', font: EMOJI, bold: false }));
}
coldScene({ bg: ['#2a1a3a', '#8250df'], pose: 'd_panic', pill: '大肥鱼 · 来回切窗口', cry: ['头晕了！', ['D01', 0.62]], shake: ['D01', 0.7],
  panels: [{ at: 0.05, k: 'draw', fn: swapWins }] });

// ---- 引入：gh 三件套 ----
lec('why', { acc: AUTHC, panels: [{ at: 'G01_01', k: 'cards', tag: ['⌨️ GitHub 官方命令行工具 gh', CLUE], items: [
  ['📦', '仓库', 'gh repo', AUTHC, ['G01_01', 0.42]], ['🔀', 'PR', 'gh pr', PRGC, ['G01_01', 0.5]], ['🐞', 'Issue', 'gh issue', ISSC, ['G01_01', 0.58]]],
  fx: [[['G01_01', 0.75], '终端里全搞定！', 'yel', null, 810, 64]] }] });

titleScene({ bg: ['#0d1117', '#2f81f7'], icons: ['⌨️', '🔀', '🐞', '📦', '🚀'], gpose: 'g_term', dpose: 'd_happy', num: '番外4', l1: 'GitHub', l2: 'CLI！' });

const PROB = {
  authQ: { chap: ['技巧①', '登录', AUTHC, F_BODY], q: '它怎么认识我？', bg: ['#e3f0ff', '#c4defc'], draw: qArt('🔐', ['gh 要先登录', '才知道你是谁'], AUTHC) },
  repoQ: { chap: ['技巧②', '仓库', REPOC, F_BODY], q: '克隆和建仓库？', bg: ['#fff0e0', '#ffd9b3'], draw: qArt('📦', ['不想复制长地址', '本地项目想上云'], REPOC) },
  prQ: { chap: ['技巧③', 'PR', PRGC, F_CODE], q: 'PR 也能开？', bg: ['#e3f7e9', '#c2edd0'], draw: qArt('🔀', ['开 PR · 审 PR', '看检查 · 合并'], PRGC) },
  issueQ: { chap: ['技巧④', 'Issue', ISSC, F_CODE], q: 'Issue 怎么办？', bg: ['#efe8ff', '#dccfff'], draw: qArt('🐞', ['看列表 · 新建', '接了就开工'], ISSC) },
  askP: { chap: ['实战', '终端走完 PR', PRAC, F_BODY], q: '不离开终端！', bg: ['#efe8ff', '#dccfff'], draw: qArt('⌨️', ['开分支 → 开 PR', '等检查 → 合并'], PRAC) },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);

// ---- 技巧①：auth login / status / switch ----
lec('auth', { acc: AUTHC, chap: PROB.authQ.chap, panels: [
  { at: 'G02_01', k: 'term', title: '终端 — gh auth login', y: 140, h: 480, fs: 22, lines: [
    [['G02_01', 0.06], '$ gh auth login'], [['G02_01', 0.22], '{c}? Where do you use GitHub? {g}GitHub.com'],
    [['G02_01', 0.34], '{c}? How would you like to authenticate GitHub CLI? {g}Login with a web browser'],
    [['G02_01', 0.48], '{y}! First copy your one-time code: {w}A1B2-C3D4'], [['G02_01', 0.52], '{d}Press Enter to open https://github.com/login/device in your browser...'],
    [['G02_01', 0.85], '{g}✓ Logged in as dafeiyu']],
    fx: [[['G02_01', 0.62], '浏览器里点一下确认', 'blue', null, 720, 56]] },
  { at: 'G02_02', k: 'term', title: '终端 — gh auth status', y: 160, h: 400, fs: 25, lines: [
    [['G02_02', 0.05], '$ gh auth status'], [['G02_02', 0.25], '{w}github.com'], [['G02_02', 0.3], '{g}  ✓ Logged in to github.com account {c}dafeiyu'],
    [['G02_02', 0.36], '{d}  - Active account: {g}true'], [['G02_02', 0.42], '{d}  - Git operations protocol: https']],
    fx: [[['G02_02', 0.6], '现在登的是哪个号', 'yel', null, 700, 58]] },
  { at: 'G02_03', k: 'term', title: '终端 — gh auth switch', tag: ['🔗 搭配番外2：多账号', CLUE], tagY: 110, y: 160, h: 420, fs: 25, lines: [
    [['G02_03', 0.25], '$ gh auth switch'], [['G02_03', 0.4], '{c}? What account do you want to switch to?'], [['G02_03', 0.44], '{d}    dafeiyu (github.com)'],
    [['G02_03', 0.46], '{g}  > dafeiyu-work (github.com)'], [['G02_03', 0.62], '{g}✓ Switched active account for github.com to dafeiyu-work']],
    fx: [[['G02_03', 0.7], '一条命令换号', 'green', null, 720, 60]] }] });

// ---- 技巧②：repo clone / create / view / fork ----
lec('repo', { acc: REPOC, chap: PROB.repoQ.chap, panels: [
  { at: 'G03_01', k: 'term', title: '终端 — gh repo clone', y: 160, h: 360, fs: 27, lines: [
    [['G03_01', 0.1], '$ gh repo clone dafeiyu/rice-page'], [['G03_01', 0.45], "{d}Cloning into 'rice-page'..."], [['G03_01', 0.55], '{g}done.']],
    fx: [[['G03_01', 0.35], '用户名/仓库名 就够了', 'yel', null, 640, 58]], st: [[['G03_01', 0.7], '不用复制长地址', REPOC, 1270, 760, 50, -0.05]] },
  { at: 'G03_02', k: 'term', title: '终端 — gh repo create', y: 140, h: 500, fs: 22, lines: [
    [['G03_02', 0.18], '$ gh repo create'], [['G03_02', 0.3], '{c}? What would you like to do? {g}Push an existing local repository to GitHub'],
    [['G03_02', 0.4], '{c}? Path to local repository {g}.'], [['G03_02', 0.46], '{c}? Repository name {g}soup-page'], [['G03_02', 0.52], '{c}? Visibility {g}Public'],
    [['G03_02', 0.62], '{c}? Would you like to push commits from the current branch? {g}Yes'],
    [['G03_02', 0.75], '{g}✓ Created repository dafeiyu/soup-page on GitHub'], [['G03_02', 0.82], '{g}✓ Pushed commits to https://github.com/dafeiyu/soup-page.git']],
    fx: [[['G03_02', 0.85], '建好还顺手推上去', 'green', null, 740, 54]] },
  { at: 'G03_03', k: 'gh', url: 'github.com/dafeiyu/rice-page', h: 600, rows: [
    [['G03_03', 0], 'code', '$ gh repo view --web'], [['G03_03', 0.35], 'h', '📦 dafeiyu / rice-page'],
    [['G03_03', 0.42], 't', '🍚 今天吃白饭 — README.md'], [['G03_03', 0.5], 'btn', '<> Code', { green: true }]],
    fx: [[['G03_03', 0.55], '浏览器直接打开', 'blue', null, 640, 60]] },
  { at: 'G03_04', k: 'flow', title: 'gh repo fork --clone', y: 420, items: [['原仓库', '#57606a', ['G03_04', 0.3], 'someone/noodle'], ['复刻到你名下', REPOC, ['G03_04', 0.45], 'dafeiyu/noodle'], ['克隆到本地', AUTHC, ['G03_04', 0.6], 'origin + upstream']],
    fx: [[['G03_04', 0.78], 'upstream 自动设好', 'yel', null, 680, 58]] }] });

// ---- 技巧③：pr create / checkout / status / checks / merge ----
lec('pr', { acc: PRGC, chap: PROB.prQ.chap, panels: [
  { at: 'G04_01', k: 'term', title: '终端 — gh pr create', y: 150, h: 440, fs: 24, lines: [
    [['G04_01', 0.04], '$ gh pr create'], [['G04_01', 0.2], '{c}? Title {w}修复错别字'], [['G04_01', 0.3], '{c}? Body {d}[(e) to launch nano, enter to skip]'],
    [['G04_01', 0.55], '$ gh pr create --fill'], [['G04_01', 0.78], '{g}https://github.com/dafeiyu/rice-page/pull/12']],
    fx: [[['G04_01', 0.62], '--fill = 直接用提交信息', 'green', null, 720, 52]] },
  { at: 'G04_02', k: 'term', title: '终端 — gh pr checkout', y: 160, h: 400, fs: 26, lines: [
    [['G04_02', 0.3], '$ gh pr checkout 21'], [['G04_02', 0.5], "{d}Switched to branch 'grok/soup-page'"], [['G04_02', 0.7], '{g}✓ 别人的分支拉到本地了，跑一跑']],
    fx: [[['G04_02', 0.45], '审别人的 PR', 'yel', 1560, 660, 54]] },
  { at: 'G04_03', k: 'term', title: '终端 — gh pr status / checks', y: 140, h: 480, fs: 24, lines: [
    [['G04_03', 0.04], '$ gh pr status'], [['G04_03', 0.15], '{w}Requesting a code review from you'], [['G04_03', 0.2], '{y}  #21  加一个汤的页面  [grok/soup-page]'],
    [['G04_03', 0.5], '$ gh pr checks 21'], [['G04_03', 0.68], '{g}✓  build   23s'], [['G04_03', 0.72], '{g}✓  test    41s'], [['G04_03', 0.8], '{g}All checks were successful']],
    st: [[['G04_03', 0.82], '全绿 ✓', OKC, 1640, 640, 60]] },
  { at: 'G04_04', k: 'term', title: '终端 — gh pr merge', y: 160, h: 420, fs: 22, lines: [
    [['G04_04', 0.05], '$ gh pr merge 21 --squash --delete-branch'], [['G04_04', 0.55], '{g}✓ Squashed and merged pull request dafeiyu/rice-page#21'],
    [['G04_04', 0.62], '{g}✓ Deleted local branch grok/soup-page and switched to branch main'], [['G04_04', 0.7], '{g}✓ Deleted remote branch grok/soup-page']],
    fx: [[['G04_04', 0.78], '合完顺手删分支', 'yel', null, 720, 58]] }] });

// ---- 技巧④：issue list / create / view / --web / develop ----
lec('issue', { acc: ISSC, chap: PROB.issueQ.chap, panels: [
  { at: 'G05_01', k: 'term', title: '终端 — gh issue', y: 140, h: 500, fs: 23, lines: [
    [['G05_01', 0.04], '$ gh issue list'], [['G05_01', 0.15], '{w}Showing 3 of 3 open issues in dafeiyu/rice-page'],
    [['G05_01', 0.18], '{g}#15  {w}按钮在手机上错位    {r}bug'], [['G05_01', 0.21], '{g}#14  {w}加一个汤的页面      {c}enhancement'], [['G05_01', 0.24], '{g}#13  {w}README 有错别字     {p}docs'],
    [['G05_01', 0.4], '$ gh issue create --title "加米饭计数器"'], [['G05_01', 0.72], '$ gh issue view 15']] },
  { at: 'G05_02', k: 'flow', title: '加上 --web', y: 420, items: [['gh pr view 21', '#24292f', ['G05_02', 0.1], '终端里看'], ['--web', '#d4a017', ['G05_02', 0.3], '加一个参数'], ['🌐 浏览器打开', AUTHC, ['G05_02', 0.5], '同一页']],
    fx: [[['G05_02', 0.75], '终端 ⇄ 网页 随时切', 'blue', null, 680, 58]] },
  { at: 'G05_03', k: 'term', title: '终端 — gh issue develop', y: 150, h: 420, fs: 24, lines: [
    [['G05_03', 0.12], '$ gh issue develop 15 --checkout'], [['G05_03', 0.4], '{g}github.com/dafeiyu/rice-page/tree/15-按钮在手机上错位'],
    [['G05_03', 0.48], "{d}Switched to branch '15-按钮在手机上错位'"]],
    fx: [[['G05_03', 0.3], '分支关联 Issue', 'yel', null, 640, 56]], st: [[['G05_03', 0.8], 'PR 合并 → Issue 自动关闭', ISSC, 1270, 760, 44, -0.04]] }] });

// ---- 实战 ----
lec('practice', { acc: PRAC, chap: PROB.askP.chap, steps: [['开分支', 'G06_01'], ['开 PR · 等绿', 'G06_02'], ['合并', 'G06_03']], sx: 920, sdx: 350, panels: [
  { at: 'G06_01', k: 'term', title: '终端 — 改错别字', y: 150, h: 440, fs: 25, lines: [
    [['G06_01', 0.04], '$ git switch -c fix/typo'], [['G06_01', 0.4], '{d}# 改好 README.md'], [['G06_01', 0.55], '$ git commit -am "docs: 修复错别字"'], [['G06_01', 0.78], '$ git push -u origin fix/typo']] },
  { at: 'G06_02', k: 'term', title: '终端 — 开 PR，等检查', y: 150, h: 440, fs: 25, lines: [
    [['G06_02', 0.04], '$ gh pr create --fill'], [['G06_02', 0.3], '{g}https://github.com/dafeiyu/rice-page/pull/16'], [['G06_02', 0.5], '$ gh pr checks --watch'],
    [['G06_02', 0.68], '{y}*  test   pending'], [['G06_02', 0.85], '{g}✓  test   38s']] },
  { at: 'G06_03', k: 'term', title: '终端 — 合并', y: 150, h: 440, fs: 23, lines: [
    [['G06_03', 0.04], '$ gh pr merge --squash --delete-branch'], [['G06_03', 0.5], '{g}✓ Squashed and merged pull request dafeiyu/rice-page#16'],
    [['G06_03', 0.58], '{g}✓ Deleted local branch fix/typo and switched to branch main'], [['G06_03', 0.64], '{g}✓ Deleted remote branch fix/typo']],
    st: [[['G06_03', 0.75], '一次完成 ✓', OKC, 1270, 700, 60]] }] });

outroScene({ head: '番外4 完！', next: ['📝', '提交规范与钩子', '说明写清楚 · 钩子来把关'], dpose: 'd_happy' });

// ================= 大肥鱼反应贴纸（每个都对应一个知识点）=================
const CAMEOS = [
  ['d_sparkle', P('G02_03', 0.8), E('G02_03')], ['d_ok', P('G04_02', 0.8), E('G04_02')], ['d_happy', P('G05_03', 0.88), E('G05_03')],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));
