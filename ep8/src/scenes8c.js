
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
