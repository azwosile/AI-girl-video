
// ================= 番外2：SSH 与多账号 =================
Object.assign(SQ.C, { role: '审查' });
const KEYC = '#e8890c', PUBC = '#2da44e', MULC = '#1971c2', IDC = '#d9480f', PRAC = '#7048e8';

// ---- 冷开场：推送要密码，还被拒 ----
coldScene({ bg: ['#3a1020', '#c2255c'], pose: 'd_panic', pill: '大肥鱼 · 准备推送', cry: ['又要密码？！', ['D01', 0.22]], shake: ['D01', 0.55],
  panels: [{ at: 0.05, k: 'term', title: '终端 — 推送白饭页', acc: '#d6283e', y: 190, h: 430, fs: 21, lines: [
    [['D01', 0, -0.2], '$ git push origin main'], [['D01', 0.1], "{d}Username for 'https://github.com': {w}dafeiyu"],
    [['D01', 0.2], "{d}Password for 'https://dafeiyu@github.com': {w}********"],
    [['D01', 0.55], '{r}remote: Support for password authentication was removed.'],
    [['D01', 0.6], "{r}fatal: Authentication failed for 'https://github.com/...'"]],
    st: [[['D01', 0.65], '密码不收了！', CLUE, 1360, 720, 66]] }] });

// ---- 引入：两种认证方式 ----
lec('why', { acc: KEYC, panels: [{ at: 'G01_01', k: 'cards', tag: ['🔐 推送怎么认证？', CLUE], items: [
  ['🚫', '账号密码', '2021 年起\n不再接受', BADC, ['G01_01', 0.08]], ['🎫', 'HTTPS + 令牌', 'Personal\nAccess Token', '#0969da', ['G01_01', 0.3]], ['🔑', 'SSH 钥匙', '一次配好\n免输密码', KEYC, ['G01_01', 0.5]]],
  hot: [['G01_01', 0.6], 2], fx: [[['G01_01', 0.7], '一次配好，再也不输！', 'yel', null, 810, 62]] }] });

titleScene({ bg: ['#3d2a00', '#e8890c'], icons: ['🔑', '🗝️', '💻', '🏢', '🏠'], gpose: 'g_cheer', dpose: 'd_keys', num: '番外2', l1: 'SSH', l2: '与多账号！' });

const PROB = {
  keyQ: { chap: ['技巧①', '造一把钥匙', KEYC, F_BODY], q: '钥匙去哪领？', bg: ['#fff4dc', '#ffe2a8'], draw: qArt('🔑', ['不用账号密码', '换成 SSH 钥匙'], KEYC) },
  pubQ: { chap: ['技巧②', '公钥交给 GitHub', PUBC, F_BODY], q: '交给谁？', bg: ['#e3f7e9', '#c2edd0'], draw: qArt('📮', ['私钥：自己留着', '公钥：交出去'], PUBC) },
  multiQ: { chap: ['技巧③', '两个账号', MULC, F_BODY], q: '一把钥匙两边用？', bg: ['#e3f0ff', '#c4defc'], draw: qArt('👥', ['个人号 dafeiyu', '公司号 dafeiyu-work'], MULC) },
  idQ: { chap: ['技巧④', '提交身份', IDC, F_BODY], q: '名字怎么错了？', bg: ['#fff0e0', '#ffd9b3'], draw: qArt('🪪', ['公司仓库的提交', '作者：dafeiyu@home.com ❌'], IDC) },
  askP: { chap: ['实战', '两个号都配好', PRAC, F_BODY], q: '帮我配好！', bg: ['#efe8ff', '#dccfff'], draw: qArt('🛠️', ['个人号 + 公司号', '各用各的钥匙'], PRAC) },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);

// ---- 技巧①：ssh-keygen ----
lec('key', { acc: KEYC, chap: PROB.keyQ.chap, panels: [
  { at: 'G02_01', k: 'term', title: '终端 — 造钥匙', y: 150, h: 440, fs: 24, lines: [
    [['G02_01', 0.12], '$ ssh-keygen -t ed25519 -C "dafeiyu@home.com"'], [['G02_01', 0.4], '{d}Generating public/private ed25519 key pair.'],
    [['G02_01', 0.46], '{y}Enter file (~/.ssh/id_ed25519): {g}⏎'], [['G02_01', 0.62], '{y}Enter passphrase (empty for no passphrase): {g}****'],
    [['G02_01', 0.74], '{g}Your public key has been saved in ~/.ssh/id_ed25519.pub']],
    fx: [[['G02_01', 0.48], '一路回车！', 'yel', 1560, 680, 60], [['G02_01', 0.66], '可加密码短语', 'blue', 1000, 680, 50]] },
  { at: 'G02_02', k: 'cards', cw: 470, items: [['🔒', 'id_ed25519', '私钥\n谁都不能给', BADC, ['G02_02', 0.12]], ['🔓', 'id_ed25519.pub', '公钥\n放心交出去', PUBC, ['G02_02', 0.55]]],
    st: [[['G02_02', 0.35], '绝密', BADC, 1160, 300, 46, 0.12]], fx: [[['G02_02', 0.85], '私钥不外传！', 'red', null, 810, 62]] }] });

// ---- 技巧②：加公钥 + 测试 + 换地址 ----
lec('pub', { acc: PUBC, chap: PROB.pubQ.chap, panels: [
  { at: 'G03_01', k: 'gh', url: 'github.com/settings/keys', h: 640, rows: [
    [['G03_01', 0], 'h', '⚙️ Settings › SSH and GPG keys'],
    [['G03_01', 0.3], 'btn', 'New SSH key', { green: true, hot: [['G03_01', 0.3], ['G03_01', 0.5]] }],
    [['G03_01', 0.45], 'field', 'Title', '家里的电脑'],
    [['G03_01', 0.58], 'field', 'Key', 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI…k3Qx dafeiyu@home.com'],
    [['G03_01', 0.85], 'btn', 'Add SSH key', { green: true, hot: [['G03_01', 0.85]] }]],
    fx: [[['G03_01', 0.66], '整段粘进去', 'green', 1600, 600, 50]] },
  { at: 'G03_02', k: 'term', title: '终端 — 测试连接', y: 170, h: 400, fs: 24, lines: [
    [['G03_02', 0.06], '$ ssh -T git@github.com'], [['G03_02', 0.22], "{d}The authenticity of host 'github.com' can't be established."],
    [['G03_02', 0.28], '{y}Are you sure you want to continue connecting (yes/no)? {g}yes'],
    [['G03_02', 0.6], "{g}Hi dafeiyu! You've successfully authenticated,"], [['G03_02', 0.62], '{d}but GitHub does not provide shell access.']],
    fx: [[['G03_02', 0.68], '通了！', 'green', null, 720, 96]] },
  { at: 'G03_03', k: 'term', title: '终端 — 旧仓库换地址', y: 170, h: 400, fs: 23, lines: [
    [['G03_03', 0.1], '$ git remote set-url origin git@github.com:dafeiyu/rice-page.git'], [['G03_03', 0.6], '$ git remote -v'],
    [['G03_03', 0.74], '{d}origin  {g}git@github.com:dafeiyu/rice-page.git{d} (fetch)'], [['G03_03', 0.76], '{d}origin  {g}git@github.com:dafeiyu/rice-page.git{d} (push)']],
    fx: [[['G03_03', 0.4], 'https://  →  git@', 'blue', null, 720, 64]] }] });

// ---- 技巧③：一把钥匙只认一个号 → config 别名 ----
lec('multi', { acc: MULC, chap: PROB.multiQ.chap, panels: [
  { at: 'G04_01', k: 'gh', url: 'github.com/settings/ssh/new', h: 560, rows: [
    [['G04_01', 0], 'h', '🏢 公司号 dafeiyu-work · Add new SSH key'],
    [['G04_01', 0.15], 'field', 'Key', 'ssh-ed25519 AAAAC3Nz…k3Qx dafeiyu@home.com'],
    [['G04_01', 0.35], 'btn', 'Add SSH key', { green: true, hot: [['G04_01', 0.35], ['G04_01', 0.55]] }],
    [['G04_01', 0.55], 't', '⚠ Key is already in use', { col: BADC, bold: true, size: 34, gap: 10 }]],
    st: [[['G04_01', 0.65], '一把公钥只认一个号', BADC, 1270, 730, 52, -0.05]] },
  { at: 'G04_02', k: 'edit', title: '~/.ssh/config', y: 140, h: 560, fs: 30, lines: [
    [['G04_02', 0.05], '# 先造公司钥匙：ssh-keygen -f ~/.ssh/id_work', { vcol: '#8f8aa8' }],
    [['G04_02', 0.33], 'Host github-work', { type: 1, hl: [['G04_02', 0.33], ['G04_02', 0.55]], vcol: '#7cc7ff', row: 2 }],
    [['G04_02', 0.48], '  HostName github.com', { type: 1, row: 3 }], [['G04_02', 0.55], '  User git', { row: 4 }],
    [['G04_02', 0.66], '  IdentityFile ~/.ssh/id_work', { type: 1, hl: [['G04_02', 0.66], ['G04_02', 0.98]], row: 5 }],
    [['G04_02', 0.86], 'Host github.com', { dim: 1, vcol: '#7cc7ff', row: 7 }], [['G04_02', 0.88], '  IdentityFile ~/.ssh/id_ed25519', { dim: 1, row: 8 }]],
    fx: [[['G04_02', 0.4], '起个别名', 'blue', 1640, 330, 56]] },
  { at: 'G04_03', k: 'term', title: '终端 — 克隆公司仓库', y: 170, h: 380, fs: 25, lines: [
    [['G04_03', 0.02], '{d}# 原地址：git@{y}github.com{d}:company/portal.git'],
    [['G04_03', 0.28], '$ git clone git@github-work:company/portal.git'],
    [['G04_03', 0.72], '{g}✓ 自动用 id_work 登录 → dafeiyu-work']],
    fx: [[['G04_03', 0.4], 'github.com → github-work', 'yel', null, 690, 60]] }] });

// ---- 技巧④：提交身份 includeIf ----
lec('id', { acc: IDC, chap: PROB.idQ.chap, panels: [
  { at: 'G05_01', k: 'cards', cw: 480, items: [['🔑', 'SSH 钥匙', '只管\n能不能推', KEYC, ['G05_01', 0.1]], ['🪪', 'user.name / email', '决定\n提交上写谁', IDC, ['G05_01', 0.5]]],
    hot: [['G05_01', 0.55], 1] },
  { at: 'G05_02', k: 'edit', title: '~/.gitconfig', y: 140, h: 540, fs: 30, lines: [
    [['G05_02', 0.02], '[user]', { vcol: '#7cc7ff' }], [['G05_02', 0.04], '  name = dafeiyu'], [['G05_02', 0.06], '  email = dafeiyu@home.com'],
    [['G05_02', 0.3], '[includeIf "gitdir:~/work/"]', { type: 1, hl: [['G05_02', 0.3], ['G05_02', 0.6]], row: 4 }],
    [['G05_02', 0.5], '  path = ~/.gitconfig-work', { type: 1, row: 5 }],
    [['G05_02', 0.72], '# ~/.gitconfig-work 里写：email = yu@company.com', { vcol: '#8f8aa8', row: 7 }]],
    fx: [[['G05_02', 0.78], '进 work 文件夹，自动换邮箱', 'orange', null, 790, 54]] },
  { at: 'G05_03', k: 'term', title: '终端 — 检查身份', y: 170, h: 360, fs: 28, lines: [
    [['G05_03', 0.04], '$ cd ~/work/portal'], [['G05_03', 0.2], '$ git config user.email'], [['G05_03', 0.58], '{g}yu@company.com']],
    st: [[['G05_03', 0.66], '✓ 公司邮箱', OKC, 1500, 650, 64]] }] });

// ---- 实战 ----
lec('practice', { acc: PRAC, chap: PROB.askP.chap, steps: [['造两把钥匙', 'G06_01'], ['别名 + 测试', 'G06_02'], ['includeIf', 'G06_03']], sx: 920, sdx: 350, panels: [
  { at: 'G06_01', k: 'term', title: '终端 — 两把钥匙', y: 150, h: 400, fs: 23, lines: [
    [['G06_01', 0.05], '$ ssh-keygen -t ed25519 -C "dafeiyu@home.com"'], [['G06_01', 0.3], '$ ssh-keygen -t ed25519 -C "yu@company.com" -f ~/.ssh/id_work'],
    [['G06_01', 0.62], '{c}id_ed25519.pub{d} → 加到个人号'], [['G06_01', 0.72], '{y}id_work.pub{d}    → 加到公司号']] },
  { at: 'G06_02', k: 'term', title: '终端 — 两边各测一次', y: 150, h: 400, fs: 23, lines: [
    [['G06_02', 0.04], '{d}# ~/.ssh/config 已写好：{y}Host github-work'], [['G06_02', 0.32], '$ ssh -T git@github.com'], [['G06_02', 0.44], "{g}Hi {c}dafeiyu{g}! You've successfully authenticated, ..."],
    [['G06_02', 0.55], '$ ssh -T git@github-work'], [['G06_02', 0.68], "{g}Hi {y}dafeiyu-work{g}! You've successfully authenticated, ..."]],
    fx: [[['G06_02', 0.8], '两个 Hi，两个名字！', 'green', null, 690, 60]] },
  { at: 'G06_03', k: 'cards', items: [['🏠', '个人仓库', 'dafeiyu@home.com', '#0969da', ['G06_03', 0.05]], ['🏢', '~/work/ 仓库', 'yu@company.com', IDC, ['G06_03', 0.22]], ['🔓', '推送免密码', '两个号不串', OKC, ['G06_03', 0.5]]],
    y: 470, fx: [[['G06_03', 0.75], '配置完成！', 'yel', null, 800, 70]] }] });

outroScene({ head: '番外2 完！', next: ['🖱️', '图形界面工具', '不敲命令也能用 Git'], dpose: 'd_keys' });

// ================= 大肥鱼反应贴纸（每个都对应一个知识点）=================
const CAMEOS = [
  ['d_shock', P('G02_02', 0.4), E('G02_02')], ['d_sparkle', P('G03_02', 0.75), E('G03_02')], ['d_ok', P('G04_03', 0.75), E('G04_03')],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));
