
// ================= 番外5：提交规范与钩子 =================
Object.assign(SQ.K, { role: '翻历史' });
const MSGC = '#0ca678', TYPEC = '#e8590c', TMPC = '#1971c2', HOOKC = '#c2255c', PRAC = '#7048e8';

// ---- 钓竿上的鱼线 + 鱼钩（g_hook 立绘里鱼线太细抠不出来，这里画）----
function hookLine(t, x, by, h, a = 1) {
  const im = SPR.g_hook; if (!im || !im.width || a <= 0) return; const w = h * im.width / im.height;
  const tx = x + (0.945 - 0.5) * w, ty = by - h + 0.052 * h, L = h * 0.3, ang = Math.sin(t * 2.2) * 0.1;
  const ex = tx + Math.sin(ang) * L, ey = ty + Math.cos(ang) * L;
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.translate(ex, ey); ctx.rotate(ang); const s = h / 1180; ctx.scale(s, s);
  ctx.strokeStyle = '#1b1433'; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 46); ctx.arc(-16, 46, 16, 0, Math.PI, false); ctx.lineTo(-32, 34); ctx.stroke();
  ctx.strokeStyle = '#dfe6ee'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 46); ctx.arc(-16, 46, 16, 0, Math.PI, false); ctx.lineTo(-32, 34); ctx.stroke();
  ctx.fillStyle = '#dfe6ee'; ctx.beginPath(); ctx.moveTo(-32, 26); ctx.lineTo(-40, 40); ctx.lineTo(-25, 38); ctx.fill(); ctx.restore();
}
function hookIfPose(t, blk) {
  const gs = blk.entries.filter(e => e.k === 'v' && e.id[0] === 'G'); const cur = [...gs].reverse().find(e => e.vo - 0.15 <= t) || gs[0]; if (!cur || cur.pose !== 'g_hook') return;
  const i = gs.indexOf(cur), prev = i > 0 ? gs[i - 1].pose : null; const a = prev && prev !== 'g_hook' ? clamp(prog(t, cur.vo - 0.15, 0.2)) : 1;
  const pin = eOut(prog(t, blk.t0, 0.35)); hookLine(t, 300, H + 280 + (1 - pin) * 200, 1180 * breath(t), a);
}

// ---- 冷开场：看不懂的提交历史 ----
coldScene({ bg: ['#2b1d0e', '#e8590c'], pose: 'd_panic', pill: '大肥鱼 · 翻历史', cry: ['看不懂！', ['D01', 0.7]], shake: ['D01', 0.72],
  panels: [{ at: 0.05, k: 'term', title: '终端 — git log --oneline', acc: '#e8590c', y: 170, h: 470, fs: 28, lines: [
    [['D01', 0, -0.2], '$ git log --oneline'], ...[['a1b2c3d', '修改'], ['9f8e7d6', '改了点'], ['5c4b3a2', '再改一下'], ['1a2b3c4', '改'], ['0f9e8d7', '啊啊啊'], ['7d6c5b4', 'test'], ['3e2d1c0', '最终版'], ['8b7a6f5', '最终版2']]
      .map((r, i) => [['D01', 0.12 + i * 0.07], `{y}${r[0]} {w}${r[1]}`])],
    st: [[['D01', 0.75], '？？？', CLUE, 1600, 560, 80]] }] });

// ---- 引入 ----
lec('why', { acc: MSGC, panels: [{ at: 'G01_01', k: 'cards', tag: ['📜 提交说明', CLUE], items: [
  ['📝', '写给未来的自己', '说明要\n看得懂', MSGC, ['G01_01', 0.1]], ['🏷️', '通用写法', '约定式提交', TYPEC, ['G01_01', 0.55]], ['🪝', '钩子把关', '自动检查\n格式', HOOKC, ['G01_01', 0.8]]] }] });

titleScene({ bg: ['#3a0d1f', '#c2255c'], icons: ['📝', '🪝', '🏷️', '✅', '🐛'], gpose: 'g_hook', dpose: 'd_happy', num: '番外5', l1: '提交规范', l2: '与钩子！', gextra: (t, x, by, h) => hookLine(t, x, by, h) });

const PROB = {
  msgQ: { chap: ['技巧①', '好的说明', MSGC, F_BODY], q: '长什么样？', bg: ['#e0f8f1', '#bdeee0'], draw: qArt('📝', ['“修改” ❌', '“改了点” ❌'], MSGC) },
  typeQ: { chap: ['技巧②', '约定式提交', TYPEC, F_BODY], q: '能分个类吗？', bg: ['#fff0e0', '#ffd9b3'], draw: qArt('🗂️', ['一眼找出', '所有修 bug 的提交'], TYPEC) },
  tmplQ: { chap: ['技巧③', '提交模板', TMPC, F_BODY], q: '好麻烦……', bg: ['#e3f0ff', '#c4defc'], draw: qArt('😩', ['每次都要想格式'], TMPC) },
  hookQ: { chap: ['技巧④', '钩子把关', HOOKC, F_BODY], q: '有人乱写呢？', bg: ['#ffe3ee', '#ffc2d8'], draw: qArt('🪝', ['乱写的提交', '谁来拦？'], HOOKC) },
  askP: { chap: ['实战', '装上提交把关', PRAC, F_BODY], q: '装上把关！', bg: ['#efe8ff', '#dccfff'], draw: qArt('🛡️', ['写钩子 → 指过去', '试一试'], PRAC) },
};
Object.keys(PROB).forEach(k => SC[k] = probScene);

// ---- 技巧①：标题 + 空行 + 原因 ----
lec('msg', { acc: MSGC, chap: PROB.msgQ.chap, panels: [
  { at: 'G02_01', k: 'edit', title: 'COMMIT_EDITMSG', y: 150, h: 420, fs: 34, lines: [
    [['G02_01', 0.08], '修复登录按钮在手机上错位', { type: 1, hl: [['G02_01', 0.08], ['G02_01', 0.5]] }],
    [['G02_01', 0.62], '手机屏幕窄时，按钮被挤到第二行，', { type: 1, row: 2 }], [['G02_01', 0.72], '改成 flex 布局并允许换行。', { type: 1, row: 3 }]],
    fx: [[['G02_01', 0.2], '标题 ≤ 50 字符', 'green', 960, 650, 52], [['G02_01', 0.5], '空一行', 'yel', 1300, 650, 52], [['G02_01', 0.75], '再写为什么', 'blue', 1660, 650, 52]] },
  { at: 'G02_02', k: 'cards', cw: 500, items: [['✅', '修复登录按钮错位', '直接写动作', OKC, ['G02_02', 0.1]], ['❌', '修改了一些东西', '等于没写', BADC, ['G02_02', 0.6]]],
    st: [[['G02_02', 0.72], '别这样', BADC, 1760, 700, 50, 0.12]] }] });

// ---- 技巧②：约定式提交 ----
function ccFormula(t, p) {
  const a = 'G03_01', y = 240; const parts = [['类型', TYPEC, 0.08], [':', '#fff', 0.14], ['空格', '#495057', 0.2], ['描述', MSGC, 0.26]]; ctx.font = `48px ${F_FANCY}`; const ws = parts.map(c => c[0] === ':' ? 60 : ctx.measureText(c[0]).width + 60); let x = 1270 - (ws.reduce((a, b) => a + b, 0) + 24 * 3) / 2;
  parts.forEach(c => { const s = popIn(t, tAt([a, c[2]])); ctx.font = `48px ${F_FANCY}`; const w = c[0] === ':' ? 60 : ctx.measureText(c[0]).width + 60;
    if (s > 0) { ctx.save(); ctx.translate(x + w / 2, y); ctx.scale(s, s); if (c[0] !== ':') box(-w / 2, -50, w, 100, 22, c[1], '#fff', 5); txt(c[0], 0, 2, 48, '#fff', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); }
    x += w + 24; });
  if (t >= tAt([a, 0.3])) txt('例：fix: 修复按钮错位', 1270, 340, 34, '#ffd27a', { align: 'center', font: F_CODE + ',' + F_BODY });
  [['✨', 'feat', '新功能', '#1f883d', 0.5], ['🐛', 'fix', '修 bug', BADC, 0.65], ['📖', 'docs', '改文档', AUTHC, 0.8]].forEach((c, i) => { const s = popIn(t, tAt([a, c[4]])); if (s <= 0) return;
    const cx = 920 + i * 350; ctx.save(); ctx.translate(cx, 580); ctx.scale(s, s); box(-150, -130, 300, 260, 24, '#fffaf0', c[3], 7);
    txt(c[0], 0, -60, 70, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 0, 30, 46, c[3], { align: 'center', font: F_CODE }); txt(c[2], 0, 90, 30, '#1b1433', { align: 'center' }); ctx.restore(); });
}
const AUTHC = '#0969da';
lec('type', { acc: TYPEC, chap: PROB.typeQ.chap, panels: [
  { at: 'G03_01', k: 'draw', fn: ccFormula, tag: ['🏷️ Conventional Commits', CLUE], tagY: 120 },
  { at: 'G03_02', k: 'cards', cw: 500, items: [['🎯', 'fix(login): …', '括号里写范围', TYPEC, ['G03_02', 0.1]], ['💥', 'feat!: …', '! = 破坏性改动', BADC, ['G03_02', 0.55]]] },
  { at: 'G03_03', k: 'term', title: '终端 — 筛出所有修复', y: 150, h: 400, fs: 27, lines: [
    [['G03_03', 0.1], '$ git log --oneline --grep "^fix"'], [['G03_03', 0.35], '{y}e4f1a2b {w}fix(login): 修复按钮错位'], [['G03_03', 0.38], '{y}b7c8d9e {w}fix: 修复米饭计数'],
    [['G03_03', 0.41], '{y}3a4b5c6 {w}fix(css): 手机端字体太小']],
    fx: [[['G03_03', 0.72], '还能自动生成更新日志', 'yel', null, 690, 56]] }] });

// ---- 技巧③：提交模板 ----
lec('tmpl', { acc: TMPC, chap: PROB.tmplQ.chap, panels: [
  { at: 'G04_01', k: 'term', title: '终端 — 设置模板', y: 180, h: 300, fs: 26, lines: [[['G04_01', 0.05], '$ git config --global commit.template ~/.gitmessage'], [['G04_01', 0.4], '$ git commit']] },
  { at: ['G04_01', 0.5], k: 'edit', title: 'COMMIT_EDITMSG（自动带上提示）', y: 150, h: 460, fs: 30, lines: [
    [['G04_01', 0.52], '█', { vcol: '#ffffff' }], [['G04_01', 0.55], '# 类型(范围): 描述   例：fix(login): 修复按钮错位', { vcol: '#8f8aa8', row: 1 }],
    [['G04_01', 0.6], '# 类型：feat / fix / docs', { vcol: '#8f8aa8', row: 2 }], [['G04_01', 0.65], '# 空一行，再写为什么要改', { vcol: '#8f8aa8', row: 3 }]],
    fx: [[['G04_01', 0.75], '不加 -m，提示自动出现', 'blue', null, 700, 56]] }] });

// ---- 技巧④：钩子 ----
const HOOK_SRC = [['#!/bin/sh', '#8f8aa8'], ['grep -qE "^(feat|fix|docs)(\\(.+\\))?!?: " "$1" || {'], ['  echo "提交说明格式不对！"'], ['  exit 1'], ['}']];
lec('hook', { acc: HOOKC, chap: PROB.hookQ.chap, extra: hookIfPose, panels: [
  { at: 'G05_01', k: 'edit', title: '.git/hooks/commit-msg', y: 150, h: 440, fs: 28, lines: HOOK_SRC.map((r, i) => [['G05_01', 0.3 + i * 0.1], r[0], { type: 1, vcol: r[1], row: i }]),
    fx: [[['G05_01', 0.2], '名字就叫 commit-msg', 'pink', null, 680, 54]] },
  { at: 'G05_02', k: 'flow', title: '每次提交都先过一遍', y: 420, items: [['git commit', '#24292f', ['G05_02', 0.05], '按下提交'], ['跑 commit-msg', HOOKC, ['G05_02', 0.25], '检查格式'], ['返回非零', BADC, ['G05_02', 0.55], '直接拒绝']],
    st: [[['G05_02', 0.72], '✗ 提交被拒', BADC, 1270, 660, 60]] },
  { at: 'G05_03', k: 'cards', cw: 470, items: [['🪝', 'commit-msg', '检查\n说明格式', HOOKC, ['G05_03', 0.05]], ['🧹', 'pre-commit', '提交前\n格式化 · 跑测试', MSGC, ['G05_03', 0.25]]] },
  { at: 'G05_04', k: 'term', title: '终端 — 团队共享钩子', y: 170, h: 380, fs: 27, lines: [
    [['G05_04', 0.05], '{r}# .git/hooks 不会跟着仓库走'], [['G05_04', 0.35], '{d}# 钩子放进仓库里的 .githooks/'], [['G05_04', 0.55], '$ git config core.hooksPath .githooks'], [['G05_04', 0.85], '{g}✓ 全队用同一套钩子']] },
  { at: 'G05_05', k: 'term', title: '终端 — 跳过钩子', tag: ['🔗 第7集：Actions', CLUE], tagY: 110, y: 170, h: 340, fs: 26, lines: [
    [['G05_05', 0.05], '$ git commit --no-verify -m "随便写"'], [['G05_05', 0.35], '{y}[main 9d8c7b6] 随便写    {r}← 钩子被跳过了']],
    st: [[['G05_05', 0.7], 'Actions 才是真把关', OKC, 1270, 650, 56]] }] });

// ---- 实战 ----
lec('practice', { acc: PRAC, chap: PROB.askP.chap, steps: [['写钩子', 'G06_01'], ['hooksPath', 'G06_02'], ['试一试', 'G06_03']], sx: 920, sdx: 350, panels: [
  { at: 'G06_01', k: 'edit', title: '.githooks/commit-msg', y: 150, h: 420, fs: 28, lines: HOOK_SRC.map((r, i) => [['G06_01', 0.15 + i * 0.12], r[0], { type: 1, vcol: r[1], row: i }]) },
  { at: 'G06_02', k: 'term', title: '终端 — 指过去 + 执行权限', y: 150, h: 340, fs: 27, lines: [[['G06_02', 0.05], '$ git config core.hooksPath .githooks'], [['G06_02', 0.55], '$ chmod +x .githooks/commit-msg']] },
  { at: 'G06_03', k: 'term', title: '终端 — 试一下', y: 150, h: 460, fs: 26, lines: [
    [['G06_03', 0.04], '$ git commit -m "改了点东西"'], [['G06_03', 0.25], '{r}提交说明格式不对！'], [['G06_03', 0.5], '$ git commit -m "fix: 修复按钮错位"'],
    [['G06_03', 0.75], '{g}[main 4e5f6a7] fix: 修复按钮错位']],
    st: [[['G06_03', 0.3], '被拒 ✗', BADC, 1640, 330, 46, 0.1], [['G06_03', 0.8], '提交成功 ✓', OKC, 1500, 680, 60]] }] });

outroScene({ head: '番外5 完！', next: ['🌐', '网页里写代码', '按一个键就能开写'], dpose: 'd_happy' });

// ================= 大肥鱼反应贴纸（每个都对应一个知识点）=================
const CAMEOS = [
  ['d_ok', P('G03_03', 0.8), E('G03_03')], ['d_sparkle', P('G04_01', 0.85), E('G04_01')], ['d_shock', P('G05_02', 0.85), E('G05_02')],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));
