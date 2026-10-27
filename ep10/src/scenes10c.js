
// ---- 讲解⑤：跨仓库 PR（豆包）----
SC.pr = (t, blk, en) => {
  bgLecture(t, PRC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G06_01'), g2 = S('G06_02') - 0.15, g3 = S('G06_03') - 0.15, g4 = S('G06_04') - 0.15;
  const fade = (a0, a1) => clamp(eOut(prog(t, a0, 0.3)) * (1 - prog(t, a1, 0.3)));
  if (t < g2 + 0.3) { const a = fade(g1, g2); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 100, 1140, 640, 'github.com/dafeiyu/rice-timer'); repoHead(740, 200, 'dafeiyu', 'rice-timer', { from: 'octo-chef/rice-timer' });
    const s1 = popIn(t, P('G06_01', 0.1), 0.35); if (s1 > 0) { ctx.save(); ctx.translate(1270, 330); ctx.scale(s1, s1); box(-530, -50, 1060, 100, 12, '#fff8c5', '#d4a72c', 3); txt('fix-typo had recent pushes 1 minute ago', -500, 0, 24, '#7d4e00', { font: F_CODE, max: 640 }); ghBtn(370, 0, 'Compare & pull request', { fs: 22, bg: PRC, bd: PRC, fg: '#fff', hot: t >= P('G06_01', 0.25) && t < P('G06_01', 0.55), hc: GOODC, t }); ctx.restore(); }
    if (t >= P('G06_01', 0.55)) { txt('或者', 760, 450, 30, '#57606a', {}); ghBtn(960, 450, '🤝 Contribute ▾', { fs: 24, hot: true, hc: PRC, t });
      const s2 = popIn(t, P('G06_01', 0.72), 0.3); if (s2 > 0) { ctx.save(); ctx.translate(820, 490); ctx.scale(s2, s2); box(0, 0, 440, 190, 14, '#fff', '#d0d7de', 3); txt('This branch is 1 commit ahead', 24, 40, 20, '#57606a', { font: F_CODE, bold: false, max: 400 }); ghBtn(220, 120, 'Open pull request', { fs: 22, w: 380, bg: PRC, bd: PRC, fg: '#fff', hot: t >= P('G06_01', 0.85), hc: GOODC, t }); ctx.restore(); } }
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < U.B02.vo) { const a = fade(g2, U.B02.vo - 0.3); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 100, 1140, 300, 'github.com/octo-chef/rice-timer/compare');
    txt('Comparing changes', 740, 190, 30, '#24292f', { font: F_CODE });
    const hb = P('G06_02', 0.15), hh = P('G06_02', 0.55);
    const chip = (x, k, v, hot, col) => { ctx.font = `bold 22px ${F_CODE}`; const w = ctx.measureText(k + v).width + 40; if (hot) { ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 24; } box(x, 240, w, 52, 10, hot ? hexA(col, 0.15) : '#f6f8fa', hot ? col : '#d0d7de', hot ? 4 : 2); if (hot) ctx.restore(); txt(k, x + 20, 267, 22, '#57606a', { font: F_CODE, bold: false }); txt(v, x + 20 + ctx.measureText(k).width, 267, 22, '#24292f', { font: F_CODE }); return w; };
    let x = 740; x += chip(x, 'base: ', 'octo-chef / main', t >= hb && t < g3, UPC) + 14; txt('←', x + 14, 266, 40, '#57606a', { align: 'center' }); x += 40; chip(x, 'head: ', 'dafeiyu / fix-typo', t >= hh && t < g3, ORIC);
    txt('✓ Able to merge.', 740, 350, 24, OKC, { font: F_CODE });
    if (t >= hb && t < g3) { pill(980, 450, '合进：原项目的 main', UPC, popIn(t, hb + 0.1), { fs: 30, font: F_BODY }); }
    if (t >= hh && t < g3) { pill(1560, 450, '来自：你复刻的分支', ORIC, popIn(t, hh + 0.1), { fs: 30, font: F_BODY }); }
    if (t >= g3 - 0.1) { const b = eOut(prog(t, g3, 0.3));
      ctx.save(); ctx.globalAlpha *= b; box(740, 430, 1060, 360, 12, '#fff', '#d0d7de', 3); box(740, 430, 1060, 60, [12, 12, 0, 0], '#f6f8fa'); txt('修正 README 错别字', 770, 460, 26, '#24292f', {});
      const L = ['把“者熟”改成“煮熟”。', '', 'Closes #42']; L.forEach((l, i) => { const p = clamp(prog(t, P('G06_03', 0.1 + i * 0.15), 0.2)); ctx.save(); ctx.globalAlpha *= p; if (i === 2 && t >= P('G06_03', 0.42)) box(760, 520 + i * 52 - 24, 260, 48, 8, hexA(CLUE, 0.3), CLUE, 3); txt(l, 780, 520 + i * 52, 28, '#24292f', { font: i === 2 ? F_CODE : F_BODY }); ctx.restore(); });
      if (t >= P('G06_03', 0.6)) { txt('合并进 main →', 1150, 624, 28, '#57606a', {}); const s = popIn(t, P('G06_03', 0.68)); issueRow(t, 1360, 590, 420, { title: '#42 错别字', num: '', closed: true, labels: [['Closed', '#8250df']], t: P('G06_03', 0.68) }); }
      if (t >= g4) { const p = P('G06_04', 0.35), on = t >= p; box(770, 700, 36, 36, 6, on ? '#0969da' : '#fff', '#0969da', 3); if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(778, 718); ctx.lineTo(786, 727); ctx.lineTo(800, 708); ctx.stroke(); }
        txt('Allow edits by maintainers', 826, 718, 28, '#24292f', { font: F_CODE }); if (on) { flash(t, p, 0.08); note(1500, 718, popIn(t, p + 0.1), '维护者能帮你改小地方', PRC, { fs: 28 }); } }
      ctx.restore(); }
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['B02']); sfx(P('G06_01', 0.1), 'pop', 0.4); sfx(P('G06_01', 0.25), 'ding', 0.3); sfx(P('G06_01', 0.55), 'pop', 0.4); sfx(P('G06_01', 0.72), 'pop', 0.3); sfx(P('G06_01', 0.85), 'click', 0.4);
  sfx(S('G06_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G06_02', 0.15), 'ding', 0.35); sfx(P('G06_02', 0.55), 'ding', 0.35); sfx(S('G06_03') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G06_03', 0.1), 20, 0.5); sfx(P('G06_03', 0.42), 'ding', 0.4); sfx(P('G06_03', 0.68), 'pop', 0.4);
  sfx(P('G06_04', 0.35), 'click', 0.5); sfx(P('G06_04', 0.45), 'pop', 0.3); sfx(P('B02', 0.5), 'stamp', 0.7); });

// ---- 讲解⑥：回应审查（Gemini）----
SC.review = (t, blk, en) => {
  bgLecture(t, '#a855f7'); lecturer(t, blk, en, blk.t0);
  const g1 = S('G07_01'), g2 = S('G07_02') - 0.15, g3 = S('G07_03') - 0.15;
  const fade = (a0, a1) => clamp(eOut(prog(t, a0, 0.3)) * (1 - prog(t, a1, 0.3)));
  if (t < g2 + 0.3) { const a = fade(g1, g2); ctx.save(); ctx.globalAlpha *= a;
    stamp(t, g1 + 0.1, 1760, 150, '不用关！', GOODC, 44, -0.08);
    cmdBar(t, 1110, 160, 'git commit -am "按审查修改" && git push', P('G07_01', 0.3), 0.7, { fs: 30, col: '#a855f7' });
    ghWin(700, 250, 1140, 520, 'github.com/octo-chef/rice-timer/pull/88');
    txt('修正 README 错别字 #88', 740, 340, 30, '#24292f', {}); txt('Commits', 740, 400, 24, '#57606a', { font: F_CODE });
    const nc = P('G07_01', 0.65);
    [['a3f9c1', '修正 README 错别字', -1], ['b7d2e8', '按审查修改', nc]].forEach((c, i) => { const s = popIn(t, c[2], 0.35); if (s <= 0) return; const y = 450 + i * 90; ctx.save(); ctx.translate(0, (1 - s) * -30); ctx.globalAlpha *= clamp(s); box(740, y, 1060, 74, 10, i ? '#dafbe1' : '#fff', i ? PRC : '#d0d7de', i ? 4 : 2); gDot(775, y + 37, 1, i ? PRC : MAINC, { r: 12 }); txt(c[0], 805, y + 37, 24, '#9a6700', { font: F_CODE }); txt(c[1], 940, y + 37, 26, '#24292f', {}); if (i) txt('刚刚', 1780, y + 37, 22, OKC, { align: 'right' }); ctx.restore(); });
    if (t >= nc + 0.3) note(1270, 700, popIn(t, nc + 0.3), '同一个分支推送 → PR 自动更新', PRC, { fs: 32 });
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fade(g2, g3); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 100, 1140, 680, 'github.com/octo-chef/rice-timer/pull/88/files');
    const rs = P('G07_02', 0.4), rr2 = P('G07_02', 0.75);
    const th = (y, who, msg, col) => { avatar(who === '大肥鱼' ? 'D' : 'G', 780, y + 30, 26, { gray: who !== '大肥鱼' }); txt(who, 830, y + 16, 20, '#57606a', { bold: false }); txt(msg, 830, y + 50, 28, '#24292f', { font: F_BODY + ',' + EMOJI }); };
    if (t < rs + 0.3) { const fa = 1 - prog(t, rs, 0.3); ctx.save(); ctx.globalAlpha *= fa; box(740, 170, 1060, 320, 12, '#fff', '#d0d7de', 2); txt('README.md 第 12 行', 770, 205, 22, '#57606a', { font: F_CODE, bold: false });
      th(240, 'octo-chef', '这里的句号也改成全角吧', '#fff'); if (t >= P('G07_02', 0.12)) th(330, '大肥鱼', '已修改，谢谢提醒 🙏', '#fff');
      ghBtn(1650, 445, 'Resolve conversation', { fs: 20, hot: t >= P('G07_02', 0.25), hc: PRC, t }); ctx.restore(); }
    else { const s = popIn(t, rs, 0.3); ctx.save(); ctx.globalAlpha *= clamp(s); box(740, 170, 1060, 70, 12, '#f6f8fa', '#d0d7de', 2); txt('✓ README.md 第 12 行 — Resolved', 770, 205, 24, OKC, { font: F_CODE }); ctx.restore(); }
    if (t >= rs) { const s = popIn(t, rs + 0.15, 0.3); ctx.save(); ctx.globalAlpha *= clamp(s); box(740, 260, 1060, 70, 12, '#f6f8fa', '#d0d7de', 2); txt('✓ README.md 第 20 行 — Resolved', 770, 295, 24, OKC, { font: F_CODE }); ctx.restore(); }
    if (t >= rs + 0.4) note(1270, 440, popIn(t, rs + 0.4), '每条意见都回复、标记解决', PRC, { fs: 34 });
    if (t >= rr2 - 0.3) { box(740, 560, 1060, 150, 12, '#fff', '#d0d7de', 2); txt('Reviewers', 770, 600, 24, '#57606a', { font: F_CODE }); avatar('G', 800, 655, 26, { gray: true }); txt('octo-chef', 840, 655, 26, '#24292f', { font: F_CODE }); ghBtn(1580, 655, '🔄 Re-request review', { fs: 22, hot: t >= rr2, hc: '#a855f7', t }); }
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = clamp(eOut(prog(t, g3, 0.3)) * (1 - prog(t, U.M02.vo - 0.3, 0.3))); ctx.save(); ctx.globalAlpha *= a;
    const s = popIn(t, g3 + 0.1, 0.4); ctx.save(); ctx.translate(1270, 360); ctx.scale(s, s); box(-460, -170, 920, 340, 30, '#fff', '#a855f7', 8);
    txt('Changes requested', 0, -90, 44, BADC, { align: 'center', font: F_CODE }); txt('≠ 否定你', 0, 0, 64, '#1b1433', { align: 'center', font: F_FANCY, bold: false }); txt('维护者多半在用业余时间帮你', 0, 90, 32, '#57606a', { align: 'center' }); ctx.restore();
    if (t >= P('G07_03', 0.6)) fancy('耐心一点 · 礼貌一点', 1270, 680, 72, t, P('G07_03', 0.6), FX.pink);
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['M02']); sfx(S('G07_01') + 0.1, 'stamp', 0.5); typeSfx(P('G07_01', 0.3), 36, 0.7); sfx(P('G07_01', 0.65), 'pop', 0.5); sfx(P('G07_01', 0.65) + 0.3, 'ding', 0.4);
  sfx(S('G07_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G07_02', 0.12), 'pop', 0.3); sfx(P('G07_02', 0.4), 'click', 0.4); sfx(P('G07_02', 0.4) + 0.15, 'ding', 0.3); sfx(P('G07_02', 0.75), 'click', 0.4);
  sfx(S('G07_03') - 0.05, 'pop', 0.4); sfx(P('G07_03', 0.6), 'sparkle', 0.4); sfx(P('M02', 0.6), 'confetti', 0.4); });

// ---- 复习：读 · 同 · 交 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const cards = [['📖 读', UPC, ['LICENSE · CONTRIBUTING', 'good first issue', '留言认领'], 'G08_01'], ['🔄 同', ORIC, ['Fork 复刻', 'remote add upstream', '开工前先同步'], 'G08_02'], ['📮 交', PRC, ['从复刻发 PR', 'Closes #42', '按审查继续推送'], 'G08_03']];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.1, 0.4); if (s <= 0) return; const act = t >= S(c[3]) - 0.1 && (i === 2 || t < S(cards[i + 1][3]) - 0.1);
    const x = 870 + i * 400, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= S(c[3]) - 0.1 ? 1 : 0.5;
    if (act) { ctx.shadowColor = c[1]; ctx.shadowBlur = 40; } box(-180, -300, 360, 600, 28, '#fffaf0', c[1], 8); ctx.shadowBlur = 0;
    box(-180, -300, 360, 100, [28, 28, 0, 0], c[1]); txt(c[0], 0, -248, 46, '#fff', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false });
    c[2].forEach((l, k) => { const a = clamp(prog(t, P(c[3], 0.12 + k * 0.25), 0.25)); ctx.save(); ctx.globalAlpha *= 0.25 + 0.75 * a; box(-150, -170 + k * 140, 300, 110, 16, '#fff', '#e4dff5', 3); txt(l, 0, -170 + k * 140 + 55, 25, '#1b1433', { align: 'center', font: isCJK(l) ? F_BODY : F_CODE, max: 285 }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= P('G08_03', 0.8)) fancy('读 · 同 · 交，开源不再难！', 1270, 880, 56, t, P('G08_03', 0.8), FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2].forEach(i => sfx(BK.recap.t0 + 0.1 + i * 0.1, 'pop', 0.3)); ['G08_01', 'G08_02', 'G08_03'].forEach(id => { for (let k = 0; k < 3; k++) sfx(P(id, 0.12 + k * 0.25), 'ding', 0.25); }); sfx(P('G08_03', 0.8), 'sparkle', 0.5); });

// ---- 实战：给电饭煲计时器修错别字 ----
SC.practice = (t, blk, en) => {
  bgLecture(t, GOODC); lecturer(t, blk, en, blk.t0);
  const T = { claim: S('G09_01'), fork: P('G09_01', 0.35), br: S('G09_02'), pr: S('G09_03'), rv: S('G09_04'), mg: S('G09_05') };
  const steps = [['认领', T.claim], ['Fork', T.fork], ['分支', T.br], ['PR', T.pr], ['审查', T.rv], ['合并', T.mg]];
  const end = S('D10') - 0.2;
  steps.forEach((s, i) => { const a = popIn(t, blk.t0 + 0.15 + i * 0.06); if (a <= 0) return;
    const x = 790 + i * 200, y = 88; const act = t < end && t >= s[1] && (i === 5 || t < steps[i + 1][1]); const done = t >= end || (i < 5 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1)); box(-90, -32, 180, 64, 18, act ? GOODC : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act ? '✓ ' : '') + s[0], 0, 2, 24, '#fff', { align: 'center', font: isCJK(s[0]) ? F_BODY : F_CODE, max: 170 }); ctx.restore(); });
  const ta = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha *= ta;
  // 上：README / PR 状态卡
  box(670, 150, 1210, 330, 24, 'rgba(15,12,31,0.92)', '#fff', 4);
  const fixed = t >= P('G09_02', 0.6) ? 2 : 1; readmeCard(t, 960, 315, 0.7, fixed);
  const prs = t >= T.mg ? ['🟣 Merged', '#8250df'] : t >= P('G09_04', 0.7) ? ['✓ checks passed', PRC] : t >= T.rv ? ['✎ Changes requested', BADC] : t >= P('G09_03', 0.3) ? ['● Open', PRC] : null;
  if (prs) { box(1290, 200, 560, 230, 18, '#fff', prs[1], 5); txt('PR #88 修正 README 错别字', 1315, 245, 26, '#24292f', {}); txt('octo-chef:main ← dafeiyu:fix-typo', 1315, 295, 20, '#57606a', { font: F_CODE, bold: false }); pill(1430, 370, prs[0], prs[1], popIn(t, t >= T.mg ? T.mg : t >= P('G09_04', 0.7) ? P('G09_04', 0.7) : t >= T.rv ? T.rv : P('G09_03', 0.3)), { fs: 26, font: F_CODE + ',' + EMOJI }); if (t >= P('G09_03', 0.75)) txt('Closes #42', 1840, 370, 22, '#8250df', { align: 'right', font: F_CODE }); }
  else { txt('🍴 dafeiyu/rice-timer', 1570, 315, 30, ORIC, { align: 'center', font: EMOJI + ',' + F_CODE }); }
  // 下：终端
  const L = [{ s: '{p}#42 💬 我想试试这个！ → 维护者：交给你了', t: P('G09_01', 0.1) }, { s: 'git clone https://github.com/dafeiyu/rice-timer.git', t: P('G09_01', 0.4), cmd: true, dur: 0.5 }, { s: 'git remote add upstream https://github.com/octo-chef/rice-timer.git', t: P('G09_01', 0.7), cmd: true, dur: 0.5 },
    { s: 'git fetch upstream && git switch -c fix-typo upstream/main', t: P('G09_02', 0.05), cmd: true, dur: 0.6 }, { s: 'git commit -am "修正 README 错别字" && git push -u origin fix-typo', t: P('G09_02', 0.5), cmd: true, dur: 0.6 },
    { s: '{y}→ Compare & pull request   base: octo-chef/main', t: P('G09_03', 0.1) }, { s: 'git commit -am "按审查修改标点" && git push', t: P('G09_04', 0.35), cmd: true, dur: 0.5 }, { s: '{g}✓ PR 已更新 · checks passed', t: P('G09_04', 0.7) }];
  terminal(t, 670, 500, 1210, 400, L, { title: '终端 — rice-timer', accent: GOODC, fs: 24, prompt: false });
  if (t >= T.mg && t < end) { const s = popIn(t, T.mg + 0.1, 0.4); ctx.save(); ctx.translate(1275, 700); ctx.scale(s, s); box(-560, -170, 1120, 340, 22, '#fff', '#d0d7de', 4);
    txt('🟣 #42 README 错别字 — Closed', -520, -115, 32, '#8250df', { font: EMOJI + ',' + F_BODY }); txt('Contributors', -520, -40, 28, '#24292f', { font: F_CODE });
    ['G', 'Q', 'K', 'C', 'B', 'M', 'X'].forEach((k, i) => avatar(k, -480 + i * 90, 50, 34, { s: popIn(t, T.mg + 0.2 + i * 0.04) })); avatar('D', -480 + 7 * 90 + 20, 50, 42, { s: popIn(t, P('G09_05', 0.6), 0.5) });
    if (t >= P('G09_05', 0.65)) { sparkle(t, P('G09_05', 0.65), -480 + 7 * 90 + 20 + 1275, 750, 90, 8); txt('+ 你！', -480 + 8 * 90 + 40, 50, 36, GOODC, {}); }
    ctx.restore(); }
  ctx.restore();
  if (t < S('G09_01') + 0.6) fancy('实战开始！', 1280, 500, 110, t, blk.t0 + 0.2, Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_medal', 1620, H + 30, 900, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    readmeCard(t, 1000, 380, popIn(t, end + 0.05, 0.4) * 0.95, 2, { col: GOODC });
    stamp(t, end + 0.4, 1200, 200, 'Merged ✓', '#8250df', 64, -0.1);
    fancy('开源贡献者！', 980, 720, 96, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 6; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(b.t0 + 0.2, 'impact', 0.6);
  sfx(P('G09_01', 0.1), 'pop', 0.4); typeSfx(P('G09_01', 0.4), 50, 0.5); typeSfx(P('G09_01', 0.7), 60, 0.5); typeSfx(P('G09_02', 0.05), 55, 0.6); sfx(P('G09_02', 0.6), 'ding', 0.4); typeSfx(P('G09_02', 0.5), 60, 0.6);
  sfx(P('G09_03', 0.1), 'pop', 0.3); sfx(P('G09_03', 0.3), 'ding', 0.4); sfx(P('G09_03', 0.75), 'pop', 0.3); sfx(S('G09_04'), 'buzz', 0.3); typeSfx(P('G09_04', 0.35), 40, 0.5); sfx(P('G09_04', 0.7), 'ding', 0.5);
  sfx(S('G09_05'), 'impact', 0.5); sfx(S('G09_05') + 0.1, 'pop', 0.4); for (let i = 0; i < 7; i++) sfx(S('G09_05') + 0.2 + i * 0.04, 'pop', 0.15); sfx(P('G09_05', 0.6), 'sparkle', 0.5);
  const end = S('D10') - 0.2; sfx(end, 'impact', 0.6); sfx(end + 0.4, 'stamp', 0.6); sfx(end + 0.4, 'confetti', 0.6); });

// ---- 预告（仓库体检）+ 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#0f766e');
  const outro = E('G10_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G10_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G10_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G10_01', 0.1), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 470); ctx.scale(bp, bp); ctx.translate(-1260, -470);
      box(860, 250, 800, 420, 24, '#ffffff', '#0f766e', 6);
      txt('🩺 仓库体检报告', 900, 300, 34, '#0f766e', { font: EMOJI + ',' + F_BODY });
      [['🐘', '仓库越来越大', '大文件 → Git LFS', P('G10_01', 0.25)], ['🔑', '密码推上去了', '换密钥 + 清历史', P('G10_01', 0.5)]].forEach((c, i) => { const s = popIn(t, c[3]); if (s <= 0) return; ctx.save(); ctx.translate(1260, 400 + i * 130); ctx.scale(s, s);
        box(-360, -52, 720, 104, 16, i ? '#fff5f5' : '#f6f8fa', i ? BADC : '#57606a', 3); txt(c[0], -320, 0, 52, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], -260, -16, 30, '#24292f', {}); txt(c[2], -260, 26, 24, i ? BADC : '#0f766e', {}); ctx.restore(); });
      ctx.restore(); }
    [['git lfs', -520, 300, 0.3], ['.gitattributes', 430, 290, 0.4], ['泄露急救', -500, 680, 0.55], ['filter-repo', 440, 700, 0.66]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G10_01', c[3])), { fs: 34, font: isCJK(c[0]) ? F_BODY : F_CODE }));
    fancy('给仓库做一次体检！', 1260, 830, 70, t, P('G10_01', 0.78), FX.pink);
  }
  if (ot > 0) {
    ctx.fillStyle = `rgba(10,8,22,${0.78 * ot})`; ctx.fillRect(...OS);
    [['👍', '点赞', '#ff5c8a'], ['🪙', '投币', '#ffd23f'], ['⭐', '收藏', '#3ec1ff']].forEach((ic, i) => {
      const a = popIn(t, S('G10_02') + 0.4 + i * 0.32, 0.4); if (a <= 0) return;
      const x = W / 2 + (i - 1) * 330, y = 440;
      ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(t * 5 + i) * 0.06);
      ctx.fillStyle = ic[2]; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.font = `110px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic[0], 0, 8); ctx.restore();
      fancy(ic[1], x, y + 180, 60, t, S('G10_02') + 0.5 + i * 0.32, { c1: '#fff', c2: '#eee', stroke: ic[2] });
    });
    fancy('一键三连，下集见！', W / 2, 180, 96, t, S('G10_02') + 1.4, { stagger: 0.04 });
    if (t > outro) {
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_medal', 1690, H + 40, 640, { scale: sa }); }
      SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
    ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
    ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G10_01', 0.1), 'pop', 0.6); [0.25, 0.5].forEach(f => sfx(P('G10_01', f), 'pop', 0.4)); sfx(P('G10_01', 0.5), 'buzz', 0.3);
  [0.3, 0.4, 0.55, 0.66].forEach(f => sfx(P('G10_01', f), 'pop', 0.3)); sfx(P('G10_01', 0.78), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G10_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G10_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_sparkle', P('G01_02', 0.88), E('G01_02')], ['d_ok', P('G03_02', 0.85), E('G03_02')],
  ['d_think', P('G07_03', 0.25), P('G07_03', 0.55)],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));
