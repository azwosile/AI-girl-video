
// ---- 讲解④：git revert（Claude）----
SC.revert = (t, blk, en) => {
  bgLecture(t, '#e07a3d'); lecturer(t, blk, en, blk.t0);
  const g1 = S('G05_01'), g2 = S('G05_02') - 0.15, g3 = S('G05_03') - 0.15, rv = P('G05_01', 0.4);
  if (t < g2 + 0.3) { const a = eOut(prog(t, g1, 0.3)) * (1 - prog(t, g2, 0.3)); ctx.save(); ctx.globalAlpha *= clamp(a);
    cmdBar(t, 1270, 160, 'git revert e5f6a7', P('G05_01', 0.05), 0.45, { fs: 40, col: '#e07a3d' });
    box(690, 250, 1180, 300, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
    const xs = [770, 900, 1030, 1160, 1290, 1470]; const labs = ['A', 'B', 'e5f6', '千问', 'Kimi', '↩ 撤销'];
    const N = {}, E = []; xs.forEach((x, i) => { if (i === 5 && t < rv) return; N['n' + i] = { x, y: 380, col: i === 2 ? KNOTC : i === 5 ? GOODC : MAINC, t0: i === 5 ? rv : -1, lab: labs[i], fs: 22, r: i === 5 ? 30 : 22, glow: i === 5 && t < rv + 1, mark: i === 5 ? '↩' : null }; if (i) E.push(['n' + (i - 1), 'n' + i, i === 5 ? rv : -1, i === 5 ? GOODC : null]); });
    drawGraph(t, N, E);
    if (t >= rv) { const pv = moveP(t, rv - 0.1, 0.5, 1030, 380, 1470, 380, 120); if (pv[2] < 1) txt('↺', pv[0], pv[1] - 50, 50, CLUE, { align: 'center' }); }
    if (t >= P('G05_01', 0.55)) { ymlEditor(t, 700, 580, 760, 230, 'index.html（撤销后）', [{ s: '<button class="order-btn">点菜</button>', t: P('G05_01', 0.58), good: true, vcol: '#9be89b' }, { s: '  ↑ 按钮回来了', t: P('G05_01', 0.65), vcol: '#ffd27a' }], { fs: 26, accent: GOODC }); }
    if (t >= P('G05_01', 0.78)) note(1650, 610, popIn(t, P('G05_01', 0.78)), '原来的历史 一点不动', '#7cf07a', { fs: 30 });
    ctx.restore(); }
  if (t >= g2 && t < g3 + 0.3) { const a = eOut(prog(t, g2, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    [[690, 'reset', '把历史倒回去', KNOTC, S('G05_02')], [1290, 'revert', '往前加一步“撤销”', GOODC, P('G05_02', 0.35)]].forEach((c, i) => { const s = popIn(t, c[4], 0.4); if (s <= 0) return;
      ctx.save(); ctx.translate(c[0] + 285, 400); ctx.scale(s, s); ctx.translate(-c[0] - 285, -400); box(c[0], 170, 570, 460, 26, 'rgba(15,12,31,0.92)', c[3], 6); txt(c[1], c[0] + 285, 230, 44, c[3], { align: 'center', font: F_CODE }); txt(c[2], c[0] + 285, 290, 32, '#fff', { align: 'center' });
      const N = {}, E = []; for (let k = 0; k < 4; k++) { const gone = i === 0 && k >= 2 && t >= c[4] + 0.4; N['k' + k] = { x: c[0] + 85 + k * 105, y: 420, col: k === 2 ? KNOTC : MAINC, ghost: gone }; if (k) E.push(['k' + (k - 1), 'k' + k, -1]); }
      if (i === 1 && t >= c[4] + 0.4) { N.r = { x: c[0] + 85 + 4 * 105, y: 420, col: GOODC, t0: c[4] + 0.4, mark: '↩' }; E.push(['k3', 'r', c[4] + 0.4, GOODC]); }
      drawGraph(t, N, E, { r: 22 });
      txt(i === 0 ? '⚠ 改写历史' : '✓ 不改写历史', c[0] + 285, 560, 32, i === 0 ? '#ff9aa9' : '#7cf07a', { align: 'center' }); ctx.restore(); });
    if (t >= P('G05_02', 0.7)) fancy('推送过的 → revert', 1270, 760, 66, t, P('G05_02', 0.7), FX.green);
    ctx.restore(); }
  if (t >= g3) { const a = eOut(prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    ymlEditor(t, 700, 180, 1170, 330, 'COMMIT_EDITMSG', [{ s: 'Revert "调整首页布局"', t: P('G05_03', 0.12), dur: 0.5, vcol: '#ffd27a', hl: [P('G05_03', 0.12), P('G05_03', 0.5)] }, { s: '', t: -1 }, { s: 'This reverts commit e5f6a7.', t: P('G05_03', 0.25), dur: 0.5, vcol: '#c9c3e6' }], { fs: 32, accent: '#e07a3d' });
    if (t >= P('G05_03', 0.4)) note(1270, 560, popIn(t, P('G05_03', 0.4)), '💾 说明自动写好 · 保存就行', CLUE, { fs: 32 });
    if (t >= P('G05_03', 0.6)) { const s = popIn(t, P('G05_03', 0.6), 0.4); ctx.save(); ctx.translate(1270, 720); ctx.scale(s, s); box(-480, -70, 960, 140, 26, '#fffaf0', '#e07a3d', 6); txt('想恢复？再 revert 这个撤销提交 ↩↩', 0, 2, 36, '#1b1433', { align: 'center' }); ctx.restore(); }
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('C02', 0.6)) stamp(t, P('C02', 0.6), 1180, 520, '批准 ✓', '#22c08b', 96, -0.12);
};
SFX_FNS.push(() => { guestSfx(['C02']); typeSfx(P('G05_01', 0.05), 17, 0.45); sfx(P('G05_01', 0.4) - 0.1, 'whoosh', 0.5); sfx(P('G05_01', 0.4) + 0.4, 'ding', 0.5); sfx(P('G05_01', 0.58), 'pop', 0.3); sfx(P('G05_01', 0.78), 'pop', 0.3);
  sfx(S('G05_02') - 0.15, 'swoosh_in', 0.4); sfx(S('G05_02'), 'pop', 0.4); sfx(S('G05_02') + 0.4, 'buzz', 0.3); sfx(P('G05_02', 0.35), 'pop', 0.4); sfx(P('G05_02', 0.35) + 0.4, 'ding', 0.4); sfx(P('G05_02', 0.7), 'stamp', 0.5);
  sfx(S('G05_03') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G05_03', 0.12), 20, 0.5); typeSfx(P('G05_03', 0.25), 27, 0.5); sfx(P('G05_03', 0.4), 'pop', 0.3); sfx(P('G05_03', 0.6), 'pop', 0.4); sfx(P('C02', 0.6), 'stamp', 0.8); });

// ---- 讲解⑤：cherry-pick（豆包）----
SC.cherry = (t, blk, en) => {
  bgLecture(t, CHERRY); lecturer(t, blk, en, blk.t0);
  const g1 = S('G06_01'), g2 = S('G06_02'), g3 = S('G06_03') - 0.15, cp = P('G06_01', 0.45);
  cmdBar(t, 1270, 160, 'git cherry-pick c3d4e5', P('G06_01', 0.08), 0.5, { out: g3, fs: 40, col: CHERRY });
  if (t >= g3) cmdBar(t, 1270, 160, 'git cherry-pick -x c3d4e5', P('G06_03', 0.08), 0.5, { fs: 40, col: CHERRY });
  if (t < g3 + 0.3) { const a = eOut(prog(t, g1, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha *= clamp(a);
    box(690, 250, 1180, 420, 26, 'rgba(15,12,31,0.9)', '#fff', 5); txt('main', 720, 310, 28, MAINC, { font: F_CODE }); txt('dessert', 720, 560, 28, FEATC, { font: F_CODE });
    const N = { a: { x: 820, y: 380, col: MAINC }, b: { x: 960, y: 380, col: MAINC }, c: { x: 1100, y: 380, col: MAINC } }; const E = [['a', 'b', -1], ['b', 'c', -1]];
    ['甜点', '修错字', '做一半', '做一半'].forEach((l, i) => { N['f' + i] = { x: 1040 + i * 150, y: 580, col: i === 1 ? CHERRY : FEATC, lab: i === 1 ? 'c3d4e5 修错字' : l, fs: 20, glow: i === 1 && t < cp + 0.6, r: i === 1 ? 28 : 22, max: 260 }; E.push([i ? 'f' + (i - 1) : 'b', 'f' + i, -1]); });
    const m = moveP(t, cp, 0.6, 1190, 580, 1260, 380, 140);
    if (t >= cp) { N.cp = { x: m[0], y: m[1], col: m[2] > 0.99 ? NEWC : CHERRY, r: 28, lab: m[2] > 0.99 ? '9a8b7c 修错字' : null, up: true, fs: 22, max: 260 }; if (m[2] > 0.99) E.push(['c', 'cp', cp + 0.6, NEWC]); }
    drawGraph(t, N, E, { r: 22 });
    if (t >= cp) txt('🍒', m[0] + 30, m[1] - 40, 46, '#000', { align: 'center', font: EMOJI, bold: false });
    if (t >= cp + 0.7 && t < g2) note(1270, 740, popIn(t, cp + 0.7), '复制一份 · 接到当前分支后面', CLUE, { fs: 34 });
    if (t >= g2) { [['只拿点名的那个', P('G06_02', 0.05), '#7cf07a'], ['新编号 9a8b7c', P('G06_02', 0.35), CLUE], ['冲突：add → --continue', P('G06_02', 0.6), '#ff9aa9']].forEach((c, i) => note(840 + i * 400, 750, popIn(t, c[1]), c[0], c[2], { fs: 28 })); }
    ctx.restore(); }
  if (t >= g3) { const a = eOut(prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    ymlEditor(t, 700, 260, 1170, 300, 'git log -1', [{ s: '修错字', t: P('G06_03', 0.2), vcol: '#ffd27a' }, { s: '', t: -1 }, { s: '(cherry picked from commit c3d4e5)', t: P('G06_03', 0.35), dur: 0.6, good: true, vcol: '#9be89b' }], { fs: 32, accent: CHERRY });
    if (t >= P('G06_03', 0.6)) fancy('从哪摘来的，一眼就知道！', 1270, 720, 58, t, P('G06_03', 0.6), FX.pink);
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('B02', 0.5)) stamp(t, P('B02', 0.5), 1180, 520, '精准摘取 🍒', CHERRY, 76, -0.1);
};
SFX_FNS.push(() => { guestSfx(['B02']); typeSfx(P('G06_01', 0.08), 22, 0.5); sfx(P('G06_01', 0.45), 'whoosh', 0.5); sfx(P('G06_01', 0.45) + 0.6, 'ding', 0.5); sfx(P('G06_01', 0.45) + 0.7, 'pop', 0.3);
  [0.05, 0.35, 0.6].forEach(f => sfx(P('G06_02', f), 'pop', 0.35)); sfx(S('G06_03') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G06_03', 0.08), 25, 0.5); sfx(P('G06_03', 0.35), 'ding', 0.4); sfx(P('G06_03', 0.6), 'sparkle', 0.4); sfx(P('B02', 0.5), 'stamp', 0.8); });

// ---- 复习：搜 · 查 · 修 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const cards = [['🔍 搜', MAINC, ['log -- 文件名', 'log -S "代码"', '--author / --since'], 'G07_01'], ['🕵️ 查', ACC, ['blame 谁改的', 'show 看改动', 'bisect 二分'], 'G07_02'], ['🩹 修', OKC, ['推送过 → revert', '只要一个 → cherry-pick', '不改写公共历史'], 'G07_03']];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.1, 0.4); if (s <= 0) return; const act = t >= S(c[3]) - 0.1 && (i === 2 || t < S(cards[i + 1][3]) - 0.1);
    const x = 870 + i * 400, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= S(c[3]) - 0.1 ? 1 : 0.5;
    if (act) { ctx.shadowColor = c[1]; ctx.shadowBlur = 40; } box(-180, -300, 360, 600, 28, '#fffaf0', c[1], 8); ctx.shadowBlur = 0;
    box(-180, -300, 360, 100, [28, 28, 0, 0], c[1]); txt(c[0], 0, -248, 46, '#fff', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false });
    c[2].forEach((l, k) => { const a = clamp(prog(t, P(c[3], 0.08 + k * 0.27), 0.25)); ctx.save(); ctx.globalAlpha *= 0.25 + 0.75 * a; box(-150, -170 + k * 140, 300, 110, 16, '#fff', '#e4dff5', 3); txt(l, 0, -170 + k * 140 + 55, 25, '#1b1433', { align: 'center', font: isCJK(l) ? F_BODY : F_CODE, max: 285 }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= P('G07_03', 0.8)) fancy('搜 · 查 · 修，真凶跑不掉！', 1270, 880, 56, t, P('G07_03', 0.8), FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2].forEach(i => sfx(BK.recap.t0 + 0.1 + i * 0.1, 'pop', 0.3)); ['G07_01', 'G07_02', 'G07_03'].forEach(id => { for (let k = 0; k < 3; k++) sfx(P(id, 0.08 + k * 0.27), 'ding', 0.25); }); sfx(P('G07_03', 0.8), 'sparkle', 0.5); });

// ---- 实战：抓出按钮真凶 ----
SC.practice = (t, blk, en) => {
  bgLecture(t, BADC); lecturer(t, blk, en, blk.t0);
  const T = { log: S('G08_01'), bis: S('G08_02'), show: S('G08_03'), rv: S('G08_04'), ok: P('G08_04', 0.6), pr: S('G08_05') };
  const steps = [['log -S', T.log], ['bisect', T.bis], ['show', T.show], ['revert', T.rv], ['✅ 检查', T.ok], ['写说明', T.pr]];
  const end = S('D09') - 0.2;
  steps.forEach((s, i) => { const a = popIn(t, blk.t0 + 0.15 + i * 0.06); if (a <= 0) return;
    const x = 790 + i * 200, y = 88; const act = t < end && t >= s[1] && (i === 5 || t < steps[i + 1][1]); const done = t >= end || (i < 5 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1)); box(-90, -32, 180, 64, 18, act ? BADC : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act && !/^[✓✅]/.test(s[0]) ? '✓ ' : '') + s[0], 0, 2, 22, '#fff', { align: 'center', font: isCJK(s[0]) ? F_BODY : F_CODE, max: 170 }); ctx.restore(); });
  const ta = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha *= ta;
  // 上：二分条 + 网页
  box(670, 150, 1210, 330, 24, 'rgba(15,12,31,0.92)', '#fff', 4);
  const st = [[-1, 0, 23, null], [P('G08_02', 0.35), 0, 23, 12], [P('G08_02', 0.5), 12, 23, 18], [P('G08_02', 0.65), 12, 18, 15], [P('G08_02', 0.78), 12, 15, null, 14]];
  const sus = [3, 14, 20];
  if (t < T.bis) { for (let i = 0; i < 24; i++) { const hot = sus.includes(i) && t >= P('G08_01', 0.5); box(720 + i * 34, 250 - (hot ? 10 : 0), 24, hot ? 80 : 60, 4, hot ? CLUE : t >= P('G08_01', 0.5) ? '#3d3760' : '#5a5580'); } if (t >= P('G08_01', 0.55)) txt('嫌疑 × 3', 1100, 380, 34, CLUE, { align: 'center' }); }
  else bisectBar(t, 720, 280, 820, 24, bisectState(t, st), { h: 60 });
  const btn = t < T.rv + 0.3 ? 0 : t >= T.ok ? 1 : 0; baifanPage(t, 1720, 315, 0.62, btn);
  if (t >= T.ok) sparkle(t, T.ok, 1720, 360, 160, 10);
  // 下：终端
  const L = [{ s: 'git log -S "order-btn" -- index.html', t: P('G08_01', 0.05), cmd: true, dur: 0.6 }, { s: '{y}f7a8b9 {y}e5f6a7 {y}a1b2c3 {d}← 3 个', t: P('G08_01', 0.5) },
    { s: 'git bisect start; git bisect bad; git bisect good v1.2', t: P('G08_02', 0.05), cmd: true, dur: 0.7 }, { s: '{r}e5f6a7 is the first bad commit', t: P('G08_02', 0.8) },
    { s: 'git show e5f6a7', t: T.show + 0.05, cmd: true, dur: 0.35 }, { s: '{r}-  <button class="order-btn">点菜</button>', t: P('G08_03', 0.4) }, { s: 'git bisect reset', t: P('G08_03', 0.8), cmd: true, dur: 0.3 },
    { s: 'git revert e5f6a7 && git push', t: T.rv + 0.05, cmd: true, dur: 0.55 }, { s: '{g}✓ checks passed', t: T.ok }];
  terminal(t, 670, 500, 1210, 400, L, { title: '终端 — 白饭页', accent: BADC, fs: 28, prompt: false });
  if (t >= T.pr && t < end) { const s = popIn(t, T.pr + 0.05, 0.4); ctx.save(); ctx.translate(1275, 700); ctx.scale(s, s); box(-560, -170, 1120, 340, 22, '#fff', '#d0d7de', 4);
    txt('PR #6 修复：点菜按钮消失', -520, -120, 34, '#24292f', {}); ['🔍 哪次：e5f6a7「调整首页布局」', '💥 为什么：改布局时误删了按钮', '🩹 怎么修：git revert e5f6a7'].forEach((l, i) => { const a = clamp(prog(t, P('G08_05', 0.25 + i * 0.15), 0.2)); ctx.save(); ctx.globalAlpha *= a; txt(l, -520, -40 + i * 70, 30, '#24292f', { font: EMOJI + ',' + F_BODY }); ctx.restore(); }); ctx.restore(); }
  ctx.restore();
  if (t < S('G08_01') + 0.6) fancy('实战开始！', 1280, 500, 110, t, blk.t0 + 0.2, Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_party', 1620, H + 30, 880, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    baifanPage(t, 960, 400, popIn(t, end + 0.05, 0.4) * 1.1, 1, { col: GOODC });
    stamp(t, end + 0.4, 1160, 230, '结案 ✓', GOODC, 70, -0.1);
    fancy('案子破了！', 940, 720, 90, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 6; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(b.t0 + 0.2, 'impact', 0.6);
  typeSfx(P('G08_01', 0.05), 36, 0.6); sfx(P('G08_01', 0.5), 'ding', 0.4); typeSfx(P('G08_02', 0.05), 50, 0.7); [0.35, 0.5, 0.65].forEach(f => sfx(P('G08_02', f), 'whoosh', 0.3)); sfx(P('G08_02', 0.78), 'impact', 0.5);
  typeSfx(S('G08_03') + 0.05, 15, 0.35); sfx(P('G08_03', 0.4), 'buzz', 0.4); typeSfx(P('G08_03', 0.8), 16, 0.3); typeSfx(S('G08_04') + 0.05, 30, 0.55); sfx(P('G08_04', 0.6), 'ding', 0.5); sfx(P('G08_04', 0.6), 'sparkle', 0.4);
  sfx(S('G08_05') + 0.05, 'pop', 0.4); [0.25, 0.4, 0.55].forEach(f => sfx(P('G08_05', f), 'pop', 0.25));
  const end = S('D09') - 0.2; sfx(end, 'impact', 0.6); sfx(end + 0.4, 'stamp', 0.6); sfx(end + 0.4, 'confetti', 0.6); });

// ---- 预告（参与开源）+ 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#5f3dc4');
  const outro = E('G09_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G09_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G09_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G09_01', 0.1), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 470); ctx.scale(bp, bp); ctx.translate(-1260, -470);
      box(860, 250, 800, 420, 24, '#ffffff', '#5f3dc4', 6);
      const up = [1000, 380], fk = [1520, 380], pr = P('G09_01', 0.62);
      [[up, '🌍 开源项目', 'upstream'], [fk, '🍴 你的 fork', 'fork']].forEach((c, i) => { const s = popIn(t, P('G09_01', 0.2 + i * 0.15)); if (s <= 0) return; ctx.save(); ctx.translate(c[0][0], c[0][1]); ctx.scale(s, s); box(-140, -70, 280, 140, 20, '#f6f8fa', '#24292f', 4); txt(c[1], 0, -15, 32, '#24292f', { align: 'center', font: EMOJI + ',' + F_BODY }); txt(c[2], 0, 35, 24, '#57606a', { align: 'center', font: F_CODE }); ctx.restore(); });
      if (t >= P('G09_01', 0.3)) { const p = eOut(prog(t, P('G09_01', 0.3), 0.4)); seg(1140, 360, lerp(1140, 1380, p), 360, '#24292f', 1, 6); txt('fork', 1260, 330, 24, '#24292f', { align: 'center', font: F_CODE }); }
      if (t >= pr) { const p = eOut(prog(t, pr, 0.5)); seg(1380, 410, lerp(1380, 1140, p), 410, OKC, 1, 8); txt('Pull Request ✓', 1260, 450, 26, OKC, { align: 'center', font: F_CODE }); }
      ['issue #42  good first issue'].forEach((l, i) => { const s = popIn(t, P('G09_01', 0.45)); if (s > 0) { ctx.save(); ctx.translate(1260, 580); ctx.scale(s, s); box(-300, -36, 600, 72, 36, '#ddf4ff', '#54aeff', 3); txt('🏷️ ' + l, 0, 2, 28, '#0969da', { align: 'center', font: EMOJI + ',' + F_CODE }); ctx.restore(); } });
      ctx.restore(); }
    [['fork', -520, 300, 0.25], ['同步上游', 520, 290, 0.4], ['认领 issue', -500, 680, 0.5], ['🎉 第一个 PR', 510, 690, 0.66]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G09_01', c[3])), { fs: 34, font: isCJK(c[0]) ? F_BODY : F_CODE }));
    fancy('给开源项目出一份力！', 1260, 830, 70, t, P('G09_01', 0.78), FX.pink);
  }
  if (ot > 0) {
    ctx.fillStyle = `rgba(10,8,22,${0.78 * ot})`; ctx.fillRect(...OS);
    [['👍', '点赞', '#ff5c8a'], ['🪙', '投币', '#ffd23f'], ['⭐', '收藏', '#3ec1ff']].forEach((ic, i) => {
      const a = popIn(t, S('G09_02') + 0.4 + i * 0.32, 0.4); if (a <= 0) return;
      const x = W / 2 + (i - 1) * 330, y = 440;
      ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(t * 5 + i) * 0.06);
      ctx.fillStyle = ic[2]; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.font = `110px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic[0], 0, 8); ctx.restore();
      fancy(ic[1], x, y + 180, 60, t, S('G09_02') + 0.5 + i * 0.32, { c1: '#fff', c2: '#eee', stroke: ic[2] });
    });
    fancy('一键三连，下集见！', W / 2, 180, 96, t, S('G09_02') + 1.4, { stagger: 0.04 });
    if (t > outro) {
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_detective', 1690, H + 40, 640, { scale: sa }); }
      SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
    ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
    ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G09_01', 0.1), 'pop', 0.6); [0.2, 0.35].forEach(f => sfx(P('G09_01', f), 'pop', 0.3)); sfx(P('G09_01', 0.3), 'whoosh', 0.4); sfx(P('G09_01', 0.62), 'whoosh', 0.5); sfx(P('G09_01', 0.62) + 0.5, 'ding', 0.5);
  [0.25, 0.4, 0.5, 0.66].forEach(f => sfx(P('G09_01', f), 'pop', 0.3)); sfx(P('G09_01', 0.78), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G09_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G09_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_sparkle', P('G01_01', 0.85), E('G01_01')], ['d_ok', P('G03_03', 0.4), P('G03_03', 0.95)],
  ['d_shock', P('G04_03', 0.65), E('G04_03')], ['d_relief', P('G05_01', 0.8), E('G05_01')],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));
