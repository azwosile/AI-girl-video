
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
