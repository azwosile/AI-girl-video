
// ---- 讲解①：读规矩（Claude）----
SC.rules = (t, blk, en) => {
  bgLecture(t, '#e07a3d'); lecturer(t, blk, en, blk.t0);
  const g1 = S('G02_01'), g2 = S('G02_02') - 0.15, g3 = S('G02_03') - 0.15, g4 = S('G02_04') - 0.15, g5 = E('G02_04');
  const fade = (a0, a1) => clamp(eOut(prog(t, a0, 0.3)) * (1 - prog(t, a1, 0.3)));
  if (t < g3 + 0.3) { const a = fade(g1, g3); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 110, 1140, 470, 'github.com/octo-chef/rice-timer/blob/main/LICENSE');
    txt('⚖️ LICENSE', 740, 210, 34, '#24292f', { font: EMOJI + ',' + F_CODE });
    const lic = ['MIT License', '', 'Copyright (c) 2026 octo-chef', '', 'Permission is hereby granted, free of charge,', 'to any person obtaining a copy of this software ...'];
    lic.forEach((l, i) => { const p = clamp(prog(t, g1 + 0.2 + i * 0.08, 0.2)); ctx.save(); ctx.globalAlpha *= p; const hot = i === 2 && t >= P('G02_01', 0.7); if (hot) box(730, 262 + i * 46, 700, 42, 8, hexA(CLUE, 0.3), CLUE, 3); txt(l, 750, 283 + i * 46, 26, '#24292f', { font: F_CODE, bold: i === 0 }); ctx.restore(); });
    [['✓ 商用', GOODC, 0.4], ['✓ 修改', GOODC, 0.48], ['✓ 分发', GOODC, 0.56], ['📌 保留版权声明', UPC, 0.7]].forEach((c, i) => pill(860 + i * 250 + (i === 3 ? 40 : 0), 660, c[0], c[1], popIn(t, P('G02_01', c[2])), { fs: 32, font: F_BODY + ',' + EMOJI }));
    if (t >= g2) { const b = eOut(prog(t, g2, 0.3)); ctx.fillStyle = `rgba(15,12,31,${0.82 * b})`; rr(690, 100, 1170, 640, 24); ctx.fill();
      const s = popIn(t, g2 + 0.1, 0.4); ctx.save(); ctx.translate(1270, 380); ctx.scale(s, s); box(-380, -170, 760, 340, 26, '#fff', BADC, 7); txt('❓ 没有 LICENSE', 0, -105, 42, BADC, { align: 'center', font: EMOJI + ',' + F_CODE });
      txt('© 默认版权归作者', 0, -25, 40, '#1b1433', { align: 'center' }); txt('✗ 复制   ✗ 发布   ✗ 拿去用', 0, 60, 34, BADC, { align: 'center' }); ctx.restore();
      if (t >= P('G02_02', 0.25)) stamp(t, P('G02_02', 0.25), 1270, 660, '≠ 随便用', BADC, 66, -0.08); }
    ctx.restore(); }
  if (t >= g3 - 0.1 && t < g4 + 0.3) { const a = fade(g3, g4); ctx.save(); ctx.globalAlpha *= a;
    const L = [{ s: '# 🤝 贡献指南', t: g3 + 0.1 }, { s: '', t: g3 + 0.1 }, { s: '## 分支命名：fix/xxx、feat/xxx', t: P('G02_03', 0.3), hl: [P('G02_03', 0.3), P('G02_03', 0.48)] },
      { s: '## 提交说明：动词开头，一行写清', t: P('G02_03', 0.48), hl: [P('G02_03', 0.48), P('G02_03', 0.66)] }, { s: '## 大改动：先开 issue 讨论', t: P('G02_03', 0.66), hl: [P('G02_03', 0.66), g4] }, { s: '## 提交前：npm test 全绿', t: P('G02_03', 0.8) }];
    ymlEditor(t, 700, 130, 1140, 560, 'CONTRIBUTING.md', L, { fs: 32, accent: '#e07a3d' });
    ctx.restore(); }
  if (t >= g4 - 0.1) { const a = clamp(eOut(prog(t, g4, 0.3)) * (1 - prog(t, U.C02.vo - 0.3, 0.3))); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 130, 1140, 500, 'github.com/octo-chef/rice-timer');
    const tabs = [['📖 README', -1], ['💬 Code of conduct', P('G02_04', 0.05)], ['🤝 Contributing', P('G02_04', 0.55)], ['⚖️ MIT license', P('G02_04', 0.65)], ['🛡️ Security', 1e9]];
    let x = 730; tabs.forEach((tb, i) => { ctx.font = `bold 20px ${F_CODE}`; const w = ctx.measureText(tb[0]).width + 36; const hot = t >= tb[1] && (i === tabs.length - 1 || t < (tabs[i + 1][1] > 1e8 ? 1e9 : tabs[i + 1][1]) || i === 3);
      const on = tb[1] > 0 && t >= tb[1]; box(x, 210, w, 56, [12, 12, 0, 0], on ? '#fff8c5' : '#fff', on ? '#d4a72c' : '#d0d7de', on ? 4 : 2); txt(tb[0], x + w / 2, 239, 19, '#24292f', { align: 'center', font: EMOJI + ',' + F_CODE }); x += w + 10; });
    box(730, 266, 1080, 2, 0, '#d0d7de');
    if (t >= P('G02_04', 0.08)) { txt('💬 行为准则', 760, 330, 34, '#24292f', { font: EMOJI + ',' + F_BODY }); ['· 友善、尊重每一位参与者', '· 对事不对人', '· 欢迎新人提问'].forEach((l, i) => { const p = clamp(prog(t, P('G02_04', 0.12 + i * 0.08), 0.2)); ctx.save(); ctx.globalAlpha *= p; txt(l, 780, 400 + i * 56, 30, '#24292f', {}); ctx.restore(); }); }
    if (t >= P('G02_04', 0.7)) note(1270, 740, popIn(t, P('G02_04', 0.7)), 'README 旁边的标签页里都有', CLUE, { fs: 36 });
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['C02']); for (let i = 0; i < 6; i++) sfx(S('G02_01') + 0.2 + i * 0.08, 'pop', 0.15); sfx(P('G02_01', 0.7), 'ding', 0.4); [0.4, 0.48, 0.56, 0.7].forEach(f => sfx(P('G02_01', f), 'pop', 0.3));
  sfx(S('G02_02') - 0.15, 'whoosh', 0.4); sfx(S('G02_02') - 0.05, 'pop', 0.4); sfx(P('G02_02', 0.25), 'stamp', 0.6); sfx(S('G02_03') - 0.15, 'swoosh_in', 0.4); [0.3, 0.48, 0.66].forEach(f => sfx(P('G02_03', f), 'ding', 0.3));
  sfx(S('G02_04') - 0.15, 'swoosh_in', 0.4); [0.05, 0.55, 0.65].forEach(f => sfx(P('G02_04', f), 'pop', 0.35)); sfx(P('G02_04', 0.7), 'pop', 0.4); sfx(P('C02', 0.5), 'stamp', 0.7); });

// ---- 讲解②：认领 issue（Kimi）----
SC.issue = (t, blk, en) => {
  bgLecture(t, GFI); lecturer(t, blk, en, blk.t0);
  const g1 = S('G03_01'), g2 = S('G03_02') - 0.15, g3 = S('G03_03') - 0.15;
  const fade = (a0, a1) => clamp(eOut(prog(t, a0, 0.3)) * (1 - prog(t, a1, 0.3)));
  if (t < g2 + 0.3) { const a = fade(g1, g2); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 100, 1140, 720, 'github.com/octo-chef/rice-timer/issues/42');
    txt('README 错别字 #42', 740, 200, 36, '#24292f', {}); ghLabel(1150, 200, 'good first issue', GFI, 1, 22);
    const cm = [['D', '大肥鱼', '我想试试这个！', P('G03_01', 0.2), '#ddf4ff'], ['G', 'octo-chef（维护者）', '好的，交给你了 👍', P('G03_01', 0.55), '#fff']];
    cm.forEach((c, i) => { const s = popIn(t, c[3], 0.35); if (s <= 0) return; const y = 300 + i * 170; ctx.save(); ctx.translate(0, (1 - s) * 30); ctx.globalAlpha *= clamp(s);
      avatar(c[0], 780, y + 40, 38, { gray: c[0] === 'G' }); box(840, y, 940, 130, 12, c[4], '#d0d7de', 2); txt(c[1], 870, y + 34, 22, '#57606a', { bold: false }); txt(c[2], 870, y + 84, 34, '#24292f', { font: F_BODY + ',' + EMOJI }); ctx.restore(); });
    if (t >= P('G03_01', 0.72)) { box(740, 660, 1060, 70, 12, '#f6f8fa', '#d0d7de', 2); txt('Assignees', 770, 695, 24, '#57606a', { font: F_CODE }); avatar('D', 940, 695, 24); txt('大肥鱼', 980, 695, 26, '#24292f', {}); stamp(t, P('G03_01', 0.75), 1650, 690, '已认领', GOODC, 44, -0.08); }
    if (t >= P('G03_01', 0.85)) note(1270, 770, popIn(t, P('G03_01', 0.85)), '免得两个人撞车', CLUE, { fs: 34 });
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fade(g2, g3); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 100, 1140, 720, 'github.com/octo-chef/rice-timer/issues/new');
    txt('New issue', 740, 200, 36, '#24292f', { font: F_CODE }); box(740, 240, 1060, 64, 10, '#fff', '#0969da', 3); txt('倒计时结束没有提示音', 770, 272, 30, '#24292f', {});
    [['🐞 问题在哪', '点开始后，倒计时归零但不响', 0.3], ['🔁 怎么复现', '1. 设 1 分钟  2. 锁屏  3. 等待', 0.5], ['💡 打算怎么改', '锁屏时改用系统通知', 0.7]].forEach((c, i) => { const s = clamp(prog(t, P('G03_02', c[2]), 0.25)); ctx.save(); ctx.globalAlpha *= s; const y = 350 + i * 145;
      txt(c[0], 750, y, 30, '#24292f', { font: EMOJI + ',' + F_BODY }); box(740, y + 28, 1060, 70, 10, '#f6f8fa', '#d0d7de', 2); txt(c[1], 770, y + 63, 28, '#57606a', { bold: false }); ctx.restore(); });
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = clamp(eOut(prog(t, g3, 0.3)) * (1 - prog(t, U.K02.vo - 0.3, 0.3))); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 100, 1140, 720, 'github.com/octo-chef/rice-timer/issues');
    box(740, 180, 1060, 60, 10, '#fff', '#0969da', 3); const q = 'is:open label:"good first issue"'; const n = Math.floor(clamp(prog(t, g3 + 0.15, 0.6)) * q.length); txt('🔍 ' + q.slice(0, n), 760, 210, 26, '#24292f', { font: EMOJI + ',' + F_CODE });
    const flt = P('G03_03', 0.45);
    ISSUES.forEach((r, i) => { const row = r.g || t < flt ? i : i; const keep = r.g || r.labels[0][0] === 'help wanted'; issueRow(t, 740, 270 + i * 86, 1060, Object.assign({}, r, { t: g3 + 0.2 + i * 0.05, dim: t >= flt && !keep, hot: t >= flt && keep })); });
    ghLabel(760, 740, 'good first issue', GFI, popIn(t, P('G03_03', 0.25)), 26); ghLabel(1080, 740, 'help wanted', HWC, popIn(t, P('G03_03', 0.35)), 26);
    if (t >= P('G03_03', 0.7)) txt('= 项目欢迎外人帮忙', 1300, 740, 30, '#24292f', {});
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['K02']); sfx(S('G03_01') + 0.1, 'pop', 0.4); sfx(P('G03_01', 0.2), 'pop', 0.4); sfx(P('G03_01', 0.55), 'ding', 0.4); sfx(P('G03_01', 0.75), 'stamp', 0.6); sfx(P('G03_01', 0.85), 'pop', 0.3);
  sfx(S('G03_02') - 0.15, 'swoosh_in', 0.4); typeSfx(S('G03_02'), 10, 0.4); [0.3, 0.5, 0.7].forEach(f => sfx(P('G03_02', f), 'pop', 0.3));
  sfx(S('G03_03') - 0.15, 'swoosh_in', 0.4); typeSfx(S('G03_03') + 0.0, 30, 0.6); sfx(P('G03_03', 0.45), 'ding', 0.4); [0.25, 0.35].forEach(f => sfx(P('G03_03', f), 'pop', 0.3)); });

// ---- 讲解③：复刻 Fork（Grok）----
SC.fork = (t, blk, en) => {
  bgLecture(t, '#d6283e'); lecturer(t, blk, en, blk.t0);
  const g1 = S('G04_01'), g2 = S('G04_02') - 0.15, g3 = S('G04_03') - 0.15, g4 = S('G04_04') - 0.15;
  const fade = (a0, a1) => clamp(eOut(prog(t, a0, 0.3)) * (1 - prog(t, a1, 0.3)));
  if (t < g2 + 0.3) { const a = fade(g1, g2); ctx.save(); ctx.globalAlpha *= a;
    const ck = P('G04_01', 0.35), cp = P('G04_01', 0.55);
    ghWin(700, 100, 1140, 300, 'github.com/octo-chef/rice-timer'); repoHead(740, 200, 'octo-chef', 'rice-timer');
    ghBtn(1460, 200, '👁 Watch', { fs: 22 }); ghBtn(1600, 200, '🍴 Fork 87', { fs: 22, hot: t >= P('G04_01', 0.2), hc: '#d6283e', t }); ghBtn(1745, 200, '⭐ 2.3k', { fs: 22 });
    if (t >= P('G04_01', 0.2) && t < ck + 0.3) { const [mx, my] = moveP(t, P('G04_01', 0.2), 0.4, 1200, 360, 1610, 215, 40); txt('👆', mx, my + 20, 54, '#000', { align: 'center', font: EMOJI, bold: false }); if (t >= ck) flash(t, ck, 0.1); }
    txt('Create a new fork', 740, 300, 26, '#57606a', { font: F_CODE, bold: false });
    if (t >= cp) { const [x, y, p] = moveP(t, cp, 0.6, 1000, 260, 1270, 600, 120); ghWin(x - 380, y - 90, 760, 200, 'github.com/dafeiyu/rice-timer', { border: ORIC }); if (p > 0.6) { repoHead(x - 340, y + 10, 'dafeiyu', 'rice-timer', { from: 'octo-chef/rice-timer' }); } }
    if (t >= cp + 0.7) { stamp(t, cp + 0.7, 1660, 600, '你自己的！', ORIC, 46, -0.08); note(1270, 800, popIn(t, cp + 0.8), '这份随便改', ORIC, { fs: 36 }); }
    ctx.restore(); }
  if (t >= g2 - 0.1) { const a = clamp(eOut(prog(t, g2, 0.3)) * (1 - prog(t, g4, 0.3))); ctx.save(); ctx.globalAlpha *= a;
    triNode(t, 'up', popIn(t, g2 + 0.05), '原项目', 'octo-chef/rice-timer', UPC, '🏛️');
    triNode(t, 'ori', popIn(t, g2 + 0.15), '你的复刻', 'dafeiyu/rice-timer', ORIC, '🍴');
    triNode(t, 'loc', popIn(t, P('G04_02', 0.25)), '你的电脑', '~/rice-timer', LOCC, '💻');
    triArrow(t, 'up', 'ori', g2 + 0.2, ORIC, 'fork', { pad0: 175, pad1: 175, ly: -40 });
    triArrow(t, 'ori', 'loc', P('G04_02', 0.25), LOCC, 'clone', { side: -24, lx: -90, ly: -30 });
    triArrow(t, 'loc', 'ori', P('G04_02', 0.6), GOODC, 'push ✓', { side: -24, lx: 120, ly: 30 });
    if (t < g3 + 0.2) cmdBar(t, 1270, 860, 'git clone https://github.com/dafeiyu/rice-timer.git', P('G04_02', 0.05), 0.7, { out: g3, fs: 26, col: LOCC });
    if (t >= P('G04_02', 0.45)) pill(1730, 390, 'origin = 你的复刻', ORIC, popIn(t, P('G04_02', 0.45)), { fs: 28, font: F_BODY });
    if (t >= g3) { triArrow(t, 'up', 'loc', P('G04_03', 0.35), UPC, 'upstream', { side: 24, lx: -30, ly: -70, dash: true });
      cmdBar(t, 1270, 860, 'git remote add upstream https://github.com/octo-chef/rice-timer.git', P('G04_03', 0.05), 0.8, { fs: 24, col: UPC });
      if (t >= P('G04_03', 0.6)) pill(880, 580, '上游：以后从这拿更新', UPC, popIn(t, P('G04_03', 0.6)), { fs: 28, font: F_BODY }); }
    ctx.restore(); }
  if (t >= g4 - 0.1) { const a = clamp(eOut(prog(t, g4, 0.3)) * (1 - prog(t, U.X02.vo - 0.3, 0.3))); ctx.save(); ctx.globalAlpha *= a;
    cmdBar(t, 1270, 170, 'git switch -c fix-typo', P('G04_04', 0.08), 0.5, { fs: 38, col: FEATC });
    const N = { a: { x: 820, y: 460, col: MAINC, t0: g4 + 0.05, lab: 'main', up: true }, b: { x: 1020, y: 460, col: MAINC, t0: g4 + 0.1 }, c: { x: 1220, y: 460, col: MAINC, t0: g4 + 0.15, lab: 'main', up: true } };
    const E = [['a', 'b', g4 + 0.1], ['b', 'c', g4 + 0.15]]; const fb = P('G04_04', 0.35);
    N.f1 = { x: 1420, y: 620, col: FEATC, t0: fb, lab: 'fix-typo', fs: 26 }; N.f2 = { x: 1620, y: 620, col: FEATC, t0: fb + 0.25, lab: '改错别字', fs: 24 }; E.push(['c', 'f1', fb, FEATC], ['f1', 'f2', fb + 0.25, FEATC]);
    drawGraph(t, N, E, { r: 30, lw: 10, fs: 28 });
    if (t >= P('G04_04', 0.6)) { stamp(t, P('G04_04', 0.6), 1100, 720, 'main 上直接改 ✗', BADC, 44, -0.06); }
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['X02']); sfx(S('G04_01') + 0.05, 'pop', 0.4); sfx(P('G04_01', 0.2), 'whoosh', 0.3); sfx(P('G04_01', 0.35), 'click', 0.5); sfx(P('G04_01', 0.55), 'whoosh', 0.5); sfx(P('G04_01', 0.55) + 0.7, 'stamp', 0.6); sfx(P('G04_01', 0.55) + 0.8, 'pop', 0.3);
  sfx(S('G04_02') - 0.1, 'swoosh_in', 0.4); [0.05, 0.15].forEach(d => sfx(S('G04_02') - 0.15 + d, 'pop', 0.3)); typeSfx(P('G04_02', 0.05), 50, 0.7); sfx(P('G04_02', 0.25), 'whoosh', 0.4); sfx(P('G04_02', 0.6), 'whoosh', 0.4); sfx(P('G04_02', 0.6) + 0.5, 'ding', 0.4);
  typeSfx(P('G04_03', 0.05), 60, 0.8); sfx(P('G04_03', 0.35), 'whoosh', 0.4); sfx(P('G04_03', 0.6), 'pop', 0.4);
  sfx(S('G04_04') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G04_04', 0.08), 22, 0.5); sfx(P('G04_04', 0.35), 'pop', 0.4); sfx(P('G04_04', 0.35) + 0.25, 'pop', 0.4); sfx(P('G04_04', 0.6), 'stamp', 0.5); sfx(P('X02', 0.5), 'pop', 0.4); });

// ---- 讲解④：同步上游（千问）----
SC.sync = (t, blk, en) => {
  bgLecture(t, '#e8890c'); lecturer(t, blk, en, blk.t0);
  const g1 = S('G05_01'), g2 = S('G05_02') - 0.15, g3 = S('G05_03') - 0.15;
  const fade = (a0, a1) => clamp(eOut(prog(t, a0, 0.3)) * (1 - prog(t, a1, 0.3)));
  if (t < g2 + 0.3) { const a = fade(g1, g2); ctx.save(); ctx.globalAlpha *= a;
    const ck1 = P('G05_01', 0.5), ck2 = P('G05_01', 0.78);
    ghWin(700, 100, 1140, 640, 'github.com/dafeiyu/rice-timer'); repoHead(740, 200, 'dafeiyu', 'rice-timer', { from: 'octo-chef/rice-timer' });
    const ok = t >= ck2 + 0.2; box(740, 280, 1060, 80, 12, ok ? '#dafbe1' : '#fff8c5', ok ? PRC : '#d4a72c', 3);
    txt(ok ? '✓ This branch is up to date with octo-chef/rice-timer:main.' : 'This branch is 20 commits behind octo-chef/rice-timer:main.', 770, 320, 24, ok ? OKC : '#7d4e00', { font: F_CODE, max: 760 });
    if (!ok) ghBtn(1700, 320, '🔄 Sync fork ▾', { fs: 22, hot: t >= P('G05_01', 0.35), hc: UPC, t });
    if (t >= ck1 && !ok) { const s = popIn(t, ck1, 0.3); ctx.save(); ctx.translate(1500, 380); ctx.scale(s, s); box(0, 0, 300, 230, 14, '#fff', '#d0d7de', 3); txt('This branch is out-of-date', 20, 40, 18, '#57606a', { font: F_CODE, bold: false, max: 260 });
      ghBtn(150, 110, 'Compare', { fs: 20, w: 240 }); ghBtn(150, 175, 'Update branch', { fs: 20, w: 240, bg: PRC, bd: PRC, fg: '#fff', hot: t >= P('G05_01', 0.65), hc: GOODC, t }); ctx.restore(); }
    if (t >= ck2 && t < ck2 + 0.3) flash(t, ck2, 0.12);
    if (ok) { sparkle(t, ck2 + 0.2, 1270, 320, 200, 10); stamp(t, ck2 + 0.3, 1270, 600, '零落后 ✓', GOODC, 60, -0.06); }
    const files = ['src/', 'README.md', 'LICENSE']; files.forEach((f, i) => txt('📄 ' + f, 780, 420 + i * 56, 26, '#0969da', { font: EMOJI + ',' + F_CODE, bold: false }));
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fade(g2, g3); ctx.save(); ctx.globalAlpha *= a;
    const L = [{ s: 'git fetch upstream', t: P('G05_02', 0.08), cmd: true, dur: 0.35 }, { s: '{d} * [new commits]  main -> upstream/main', t: P('G05_02', 0.2) },
      { s: 'git switch main', t: P('G05_02', 0.3), cmd: true, dur: 0.3 }, { s: 'git merge upstream/main', t: P('G05_02', 0.45), cmd: true, dur: 0.4 }, { s: '{g}Fast-forward  (20 commits)', t: P('G05_02', 0.62) },
      { s: 'git push origin main', t: P('G05_02', 0.75), cmd: true, dur: 0.35 }, { s: '{g}✓ 复刻也跟上了', t: P('G05_02', 0.92) }];
    terminal(t, 700, 120, 1140, 560, L, { title: '终端 — rice-timer', accent: UPC, fs: 32, prompt: false });
    [['上游 → 本地', UPC, 0.15], ['合进 main', LOCC, 0.5], ['本地 → 复刻', ORIC, 0.8]].forEach((c, i) => pill(900 + i * 370, 760, c[0], c[1], popIn(t, P('G05_02', c[2])), { fs: 30, font: F_BODY }));
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = clamp(eOut(prog(t, g3, 0.3)) * (1 - prog(t, U.Q02.vo - 0.3, 0.3))); ctx.save(); ctx.globalAlpha *= a;
    cmdBar(t, 1270, 170, 'git switch fix-typo && git rebase main', P('G05_03', 0.1), 0.6, { fs: 34, col: FEATC });
    const mv = P('G05_03', 0.45), N = {}, E = [];
    for (let i = 0; i < 6; i++) { N['m' + i] = { x: 760 + i * 150, y: 420, col: i < 3 ? MAINC : UPC, t0: g3 + 0.05 + i * 0.05, r: i < 3 ? 26 : 22 }; if (i) E.push(['m' + (i - 1), 'm' + i, g3 + 0.05 + i * 0.05]); }
    N.m5.lab = 'main'; N.m5.up = true;
    const [fx, fy] = moveP(t, mv, 0.6, 1060, 600, 1660, 420, 140); N.f = { x: fx, y: fy, col: FEATC, t0: g3 + 0.1, lab: 'fix-typo', fs: 26, glow: t >= mv && t < mv + 0.7 };
    E.push([t < mv + 0.3 ? 'm2' : 'm5', 'f', -1, FEATC]); drawGraph(t, N, E, { r: 26, lw: 9 });
    if (t >= mv + 0.7) { note(1270, 700, popIn(t, mv + 0.7), '第8集学的变基：接到最新 main 后面', FEATC, { fs: 34 }); }
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['Q02']); sfx(S('G05_01') + 0.05, 'pop', 0.4); sfx(P('G05_01', 0.35), 'ding', 0.3); sfx(P('G05_01', 0.5), 'click', 0.5); sfx(P('G05_01', 0.65), 'ding', 0.3); sfx(P('G05_01', 0.78), 'click', 0.5); sfx(P('G05_01', 0.78) + 0.2, 'sparkle', 0.5); sfx(P('G05_01', 0.78) + 0.3, 'stamp', 0.6);
  sfx(S('G05_02') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G05_02', 0.08), 18, 0.35); typeSfx(P('G05_02', 0.3), 15, 0.3); typeSfx(P('G05_02', 0.45), 23, 0.4); sfx(P('G05_02', 0.62), 'ding', 0.3); typeSfx(P('G05_02', 0.75), 20, 0.35); sfx(P('G05_02', 0.92), 'ding', 0.4); [0.15, 0.5, 0.8].forEach(f => sfx(P('G05_02', f), 'pop', 0.25));
  sfx(S('G05_03') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G05_03', 0.1), 38, 0.6); sfx(P('G05_03', 0.45), 'whoosh', 0.5); sfx(P('G05_03', 0.45) + 0.6, 'pop', 0.4); sfx(P('G05_03', 0.45) + 0.7, 'pop', 0.3); });
