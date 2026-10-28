
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
