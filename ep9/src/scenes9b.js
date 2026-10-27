
// ---- 讲解①：搜历史（Kimi）----
const LOG9 = [
  { h: 'f7a8b9', m: '加饮料菜单', a: '千问', d: '周四' }, { h: 'e5f6a7', m: '调整首页布局', a: '大肥鱼', d: '周三' }, { h: 'd4e5f6', m: '改颜色', a: 'Gemini', d: '周三' },
  { h: 'c3d4e5', m: '修错字', a: 'Kimi', d: '周二' }, { h: '7c8d9e', m: '统一缩进', a: 'Gemini', d: '周二' }, { h: 'b2c3d4', m: '更新 README', a: 'Claude', d: '周一' },
  { h: 'a1b2c3', m: '加点菜按钮', a: '大肥鱼', d: '上周' }];
const LOG_FILE = [true, true, false, true, true, false, true];   // 动过 index.html 的
SC.search = (t, blk, en) => {
  bgLecture(t, MAINC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G02_01'), g2 = S('G02_02'), g3 = S('G02_03'), g4 = S('G02_04') - 0.15, g5 = S('G02_05') - 0.15;
  const flt = P('G02_01', 0.55), pk = P('G02_02', 0.55);
  if (t < g3 - 0.1) { const a = eOut(prog(t, g1, 0.3)) * (1 - prog(t, g3 - 0.4, 0.3)); ctx.save(); ctx.globalAlpha *= clamp(a);
    cmdBar(t, 1270, 160, 'git log --oneline -- index.html', P('G02_01', 0.08), 0.7, { out: g2 - 0.1, fs: 34, col: MAINC });
    cmdBar(t, 1270, 160, 'git log -S "order-btn"', P('G02_02', 0.1), 0.6, { out: g3 - 0.4, fs: 36, col: CLUE });
    const rows = LOG9.map((r, i) => Object.assign({}, r, { t: g1 + 0.1 + i * 0.05,
      st: tt => { if (tt >= pk && (i === 1 || i === 6)) return i === 1 ? 2 : 4; if (tt >= g2 + 0.2 && LOG_FILE[i]) return 3; if (tt >= flt && !LOG_FILE[i]) return 3; return 0; },
      tag: i === 6 ? ['+ 出现', GOODC, pk + 0.1] : i === 1 ? ['− 消失', KNOTC, pk + 0.25] : null }));
    logRows(t, 700, 240, 980, rows, { rh: 76, fs: 28 });
    if (t >= flt && t < g2) note(1190, 830, popIn(t, flt), '只剩动过 index.html 的', MAINC, { fs: 34 });
    if (t >= pk + 0.4) note(1190, 830, popIn(t, pk + 0.4), '按内容搜：代码在哪出现、在哪消失', CLUE, { fs: 34 });
    ctx.restore(); }
  if (t >= g3 - 0.3 && t < g4 + 0.3) { const a = eOut(prog(t, g3 - 0.3, 0.3)) * (1 - prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    txt('git log', 760, 230, 48, '#fff', { font: F_CODE });
    [['--grep="按钮"', '搜说明里的字', P('G02_03', 0.05), '#9fb0ff'], ['--author="大肥鱼"', '只看某个人', P('G02_03', 0.3), '#8fc3ff'], ['--since="3 days ago"', '只看最近几天', P('G02_03', 0.55), '#7cf07a']].forEach((c, i) => { const s = popIn(t, c[2], 0.4); if (s <= 0) return;
      ctx.save(); ctx.translate(1270, 360 + i * 140); ctx.scale(s, s); box(-500, -55, 1000, 110, 22, 'rgba(15,12,31,0.92)', c[3], 5); txt(c[0], -470, 0, 38, c[3], { font: F_CODE }); txt(c[1], 470, 0, 32, '#fff', { align: 'right' }); ctx.restore(); });
    if (t >= P('G02_03', 0.8)) fancy('条件可以叠着用！', 1270, 820, 64, t, P('G02_03', 0.8), FX.yel);
    ctx.restore(); }
  if (t >= g4 && t < g5 + 0.3) { const a = eOut(prog(t, g4, 0.3)) * (1 - prog(t, g5, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    pill(1270, 170, '-S 找的是“数量变了”的提交', CLUE, popIn(t, g4 + 0.05), { fs: 38, font: F_BODY });
    [['加上', 'order-btn × 0 → 1', '✓ 算', GOODC, P('G02_04', 0.3)], ['删掉', 'order-btn × 1 → 0', '✓ 算', GOODC, P('G02_04', 0.42)], ['挪位置', 'order-btn × 1 → 1', '✗ 不算', KNOTC, P('G02_04', 0.65)]].forEach((c, i) => { const s = popIn(t, c[4], 0.4); if (s <= 0) return;
      ctx.save(); ctx.translate(1270, 330 + i * 150); ctx.scale(s, s); box(-520, -60, 1040, 120, 22, '#fffaf0', c[3], 6); txt(c[0], -480, 0, 40, '#1b1433', {}); txt(c[1], -40, 0, 36, '#5f3dc4', { align: 'center', font: F_CODE }); txt(c[2], 480, 0, 40, c[3], { align: 'right' }); ctx.restore(); });
    ctx.restore(); }
  if (t >= g5) { const a = eOut(prog(t, g5, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    const cy = browser(700, 140, 1160, 640, 'github.com/dafeiyu/baifan/blob/main/index.html', { title: 'GitHub', accent: '#24292f' });
    txt('📄 index.html', 740, cy + 50, 34, '#24292f', {});
    const hb = popIn(t, P('G02_05', 0.35)); ctx.save(); ctx.translate(1720, cy + 50); ctx.scale(1 + 0.15 * Math.sin(prog(t, P('G02_05', 0.35), 0.5) * Math.PI), 1 + 0.15 * Math.sin(prog(t, P('G02_05', 0.35), 0.5) * Math.PI));
    box(-90, -30, 180, 60, 12, t >= P('G02_05', 0.35) ? '#fff8c5' : '#f6f8fa', t >= P('G02_05', 0.35) ? '#d4a72c' : '#d0d7de', 3); txt('🕘 History', 0, 1, 26, '#24292f', { align: 'center' }); ctx.restore();
    if (t >= P('G02_05', 0.5)) logRows(t, 740, cy + 110, 1080, LOG9.filter((r, i) => LOG_FILE[i]).map((r, i) => Object.assign({}, r, { t: P('G02_05', 0.5) + i * 0.06 })), { rh: 70, fs: 26 });
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('K02', 0.6)) stamp(t, P('K02', 0.6), 1180, 520, '嫌疑 3 个 ✓', '#34407a', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['K02']); typeSfx(P('G02_01', 0.08), 31, 0.7); for (let i = 0; i < 7; i++) sfx(S('G02_01') + 0.1 + i * 0.05, 'pop', 0.15); sfx(P('G02_01', 0.55), 'whoosh', 0.4);
  typeSfx(P('G02_02', 0.1), 22, 0.6); sfx(S('G02_02') + 0.2, 'whoosh', 0.3); sfx(P('G02_02', 0.55), 'ding', 0.5); sfx(P('G02_02', 0.55) + 0.25, 'buzz', 0.4);
  [0.05, 0.3, 0.55].forEach(f => sfx(P('G02_03', f), 'pop', 0.4)); sfx(P('G02_03', 0.8), 'sparkle', 0.4);
  sfx(S('G02_04') - 0.15, 'swoosh_in', 0.4); [0.3, 0.42].forEach(f => sfx(P('G02_04', f), 'ding', 0.3)); sfx(P('G02_04', 0.65), 'buzz', 0.4);
  sfx(S('G02_05') - 0.15, 'swoosh_in', 0.4); sfx(P('G02_05', 0.35), 'click', 0.6); for (let i = 0; i < 5; i++) sfx(P('G02_05', 0.5) + i * 0.06, 'pop', 0.15); sfx(P('K02', 0.6), 'stamp', 0.7); });

// ---- 讲解②：git blame（Gemini）----
const BL9 = [
  { h: 'a1b2c3', a: '大肥鱼', d: '10-12', ln: 40, code: '<nav class="top">' }, { h: '7c8d9e', a: 'Gemini', d: '10-20', ln: 41, code: '  <a href="#menu">菜单</a>' },
  { h: '7c8d9e', a: 'Gemini', d: '10-20', ln: 42, code: '  <a href="#about">关于</a>' }, { h: 'a1b2c3', a: '大肥鱼', d: '10-12', ln: 43, code: '</nav>' },
  { h: 'e5f6a7', a: '大肥鱼', d: '10-21', ln: 44, code: '<section id="menu" class="grid">' }, { h: '7c8d9e', a: 'Gemini', d: '10-20', ln: 45, code: '  <h2>今日菜单</h2>' }];
SC.blame = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G03_01'), g2 = S('G03_02'), g3 = S('G03_03') - 0.15, g4 = S('G03_04') - 0.15, g5 = S('G03_05') - 0.15, ws = P('G03_05', 0.4);
  if (t < g3 + 0.3) { const a = eOut(prog(t, g1, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha *= clamp(a);
    cmdBar(t, 1270, 160, 'git blame index.html', P('G03_01', 0.05), 0.5, { out: g2 - 0.1, fs: 38, col: ACC });
    cmdBar(t, 1270, 160, 'git blame -L 40,50 index.html', P('G03_02', 0.05), 0.6, { out: P('G03_02', 0.55), fs: 34, col: ACC });
    const cols = [[P('G03_01', 0.3), '提交编号', 760], [P('G03_01', 0.45), '作者', 930], [P('G03_01', 0.58), '时间', 1060]];
    blameView(t, 700, 240, 1170, BL9.map((r, i) => Object.assign({}, r, { t: g1 + 0.15 + i * 0.05, st: tt => (r.a === 'Gemini' && tt >= P('G03_01', 0.75) ? 1 : 0) })), { fs: 26, rh: 64 });
    cols.forEach(c => { if (t >= c[0] && t < g2) note(c[2] + 40, 740, popIn(t, c[0]), c[1], CLUE, { fs: 28 }); });
    if (t >= P('G03_02', 0.3) && t < P('G03_02', 0.55)) note(1270, 760, popIn(t, P('G03_02', 0.3)), '只看第 40–50 行', CLUE, { fs: 34 });
    if (t >= P('G03_02', 0.55)) { const s = popIn(t, P('G03_02', 0.55), 0.4); ctx.save(); ctx.translate(1270, 170); ctx.scale(s, s); box(-430, -50, 860, 100, 18, '#fff', '#24292f', 4); txt('GitHub 文件页', -400, 0, 32, '#24292f', {});
      box(140, -30, 120, 60, 10, '#fff8c5', '#d4a72c', 3); txt('Blame', 200, 1, 28, '#24292f', { align: 'center', font: F_CODE }); box(275, -30, 130, 60, 10, '#f6f8fa', '#d0d7de', 2); txt('History', 340, 1, 24, '#57606a', { align: 'center', font: F_CODE }); ctx.restore(); }
    ctx.restore(); }
  if (t >= g3 && t < g4 + 0.3) { const a = eOut(prog(t, g3, 0.3)) * (1 - prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    const s0 = popIn(t, g3 + 0.05, 0.4); ctx.save(); ctx.translate(1270, 230); ctx.scale(s0, s0); box(-520, -80, 1040, 160, 26, '#fffaf0', BADC, 7); txt('最后动过这一行', -260, 0, 44, '#1b1433', { align: 'center' }); txt('≠', 0, 0, 80, BADC, { align: 'center' }); txt('谁的锅', 260, 0, 44, '#1b1433', { align: 'center' }); ctx.restore();
    cmdBar(t, 1270, 420, 'git show 7c8d9e', P('G03_03', 0.6), 0.4, { fs: 38, col: ACC });
    if (t >= P('G03_03', 0.7)) ymlEditor(t, 700, 500, 1170, 340, '7c8d9e 统一缩进 · Gemini', [{ s: '-<a href="#menu">菜单</a>', t: P('G03_03', 0.72), bad: true, vcol: '#ff9aa9' }, { s: '+  <a href="#menu">菜单</a>', t: P('G03_03', 0.76), good: true, vcol: '#9be89b' }, { s: '  （只多了两个空格）', t: P('G03_03', 0.85), vcol: '#ffd27a' }], { fs: 30, accent: ACC });
    ctx.restore(); }
  if (t >= g4 && t < g5 + 0.3) { const a = eOut(prog(t, g4, 0.3)) * (1 - prog(t, g5, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    const cy = browser(700, 140, 1160, 640, 'github.com/dafeiyu/baifan/blame/main/index.html', { title: 'GitHub · Blame', accent: '#24292f' });
    const lay = Math.min(2, Math.floor(Math.max(0, t - P('G03_04', 0.45)) / 0.7) + (t >= P('G03_04', 0.45) ? 1 : 0));
    const vers = [['7c8d9e', 'Gemini', '统一缩进'], ['e5f6a7', '大肥鱼', '调整首页布局'], ['a1b2c3', '大肥鱼', '加点菜按钮']];
    for (let k = 0; k <= lay; k++) { const off = (lay - k) * -24; ctx.save(); ctx.globalAlpha *= k === lay ? 1 : 0.5; box(740 + off, cy + 30 + off, 1080, 420, 16, '#fff', k === lay ? '#d4a72c' : '#d0d7de', k === lay ? 4 : 2);
      if (k === lay) { txt(vers[k][0] + ' · ' + vers[k][1], 780 + off, cy + 80 + off, 28, '#9a6700', { font: F_CODE }); txt(vers[k][2], 780 + off, cy + 130 + off, 30, '#24292f', {});
        ['<nav class="top">', k === 2 ? '  <button class="order-btn">点菜</button>' : '  <a href="#menu">菜单</a>', '</nav>'].forEach((l, j) => txt(l, 900 + off, cy + 210 + j * 56 + off, 26, '#24292f', { font: F_CODE }));
        const ib = popIn(t, P('G03_04', 0.3)); ctx.save(); ctx.translate(820 + off, cy + 210 + off); ctx.scale(ib, ib); box(-26, -26, 52, 52, 10, '#ddf4ff', '#54aeff', 3); txt('⧉', 0, 2, 30, '#0969da', { align: 'center' }); ctx.restore(); }
      ctx.restore(); }
    if (t >= P('G03_04', 0.45)) note(1290, cy + 560, popIn(t, P('G03_04', 0.45)), '⧉ 跳到这次改动之前 · 一层层往前查', CLUE, { fs: 32 });
    ctx.restore(); }
  if (t >= g5) { const a = eOut(prog(t, g5, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    cmdBar(t, 1270, 160, 'git blame -w index.html', P('G03_05', 0.3), 0.5, { fs: 38, col: ACC });
    blameView(t, 700, 240, 1170, BL9.map(r => { const ig = r.a === 'Gemini'; return Object.assign({}, r, ig && t >= ws + 0.4 ? { h: 'a1b2c3', a: '大肥鱼', d: '10-12' } : {}, { t: -1, st: ig ? (t >= ws + 0.4 ? 4 : t >= ws ? 3 : 1) : 0 }); }), { fs: 26, rh: 64, title: 'git blame -w index.html' });
    if (t >= ws) note(1270, 790, popIn(t, ws), '-w：忽略空白改动，跳过“只改缩进”', '#7cf07a', { fs: 32 });
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('M02', 0.6)) stamp(t, P('M02', 0.6), 1180, 520, '清白 ✓', '#a855f7', 96, -0.12);
};
SFX_FNS.push(() => { guestSfx(['M02']); typeSfx(P('G03_01', 0.05), 20, 0.5); for (let i = 0; i < 6; i++) sfx(S('G03_01') + 0.15 + i * 0.05, 'pop', 0.15); [0.3, 0.45, 0.58].forEach(f => sfx(P('G03_01', f), 'pop', 0.3)); sfx(P('G03_01', 0.75), 'ding', 0.4);
  typeSfx(P('G03_02', 0.05), 29, 0.6); sfx(P('G03_02', 0.3), 'pop', 0.3); sfx(P('G03_02', 0.55), 'click', 0.5);
  sfx(S('G03_03') - 0.1, 'swoosh_in', 0.4); sfx(S('G03_03'), 'buzz', 0.4); typeSfx(P('G03_03', 0.6), 15, 0.4); sfx(P('G03_03', 0.72), 'pop', 0.3); sfx(P('G03_03', 0.76), 'pop', 0.3);
  sfx(S('G03_04') - 0.15, 'swoosh_in', 0.4); sfx(P('G03_04', 0.3), 'pop', 0.4); sfx(P('G03_04', 0.45), 'click', 0.5); sfx(P('G03_04', 0.45) + 0.7, 'click', 0.5);
  sfx(S('G03_05') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G03_05', 0.3), 23, 0.5); sfx(P('G03_05', 0.4), 'whoosh', 0.4); sfx(P('G03_05', 0.4) + 0.4, 'ding', 0.4); sfx(P('M02', 0.6), 'stamp', 0.8); });

// ---- 讲解③：git bisect（Grok）----
SC.bisect = (t, blk, en) => {
  bgLecture(t, '#d6283e'); lecturer(t, blk, en, blk.t0);
  const g1 = S('G04_01'), g2 = S('G04_02'), g3 = S('G04_03'), g4 = S('G04_04') - 0.15, g5 = S('G04_05') - 0.15;
  const N = 64;   // 画 64 格代表 100 个提交
  const st = [[-1, 0, N - 1, null], [P('G04_02', 0.12), 0, N - 1, 32], [P('G04_02', 0.5), 32, N - 1, 48], [P('G04_02', 0.78), 32, 48, 40],
    [P('G04_03', 0.1), 40, 48, 44], [P('G04_03', 0.25), 40, 44, 42], [P('G04_03', 0.4), 42, 44, 43], [P('G04_03', 0.55), 42, 43, null, 43]];
  const top = t < g4 + 0.3;
  if (top) { const a = eOut(prog(t, g1, 0.3)) * (1 - prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha *= clamp(a);
    box(690, 130, 1180, 300, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
    bisectBar(t, 740, 280, 1080, N, bisectState(t, st), { h: 70 });
    const ms = bisectState(t, st); if (ms.mid != null && t >= P('G04_02', 0.12)) txt('试这个 →', 740 + (ms.mid + 0.5) * 1080 / N, 190, 26, CLUE, { align: 'center' });
    ctx.restore();
    if (t < g2) terminal(t, 700, 470, 1160, 380, [{ s: 'git bisect start', t: P('G04_01', 0.08), cmd: true, dur: 0.35 }, { s: 'git bisect bad', t: P('G04_01', 0.35), cmd: true, dur: 0.3 }, { s: '{d}# 现在是坏的', t: P('G04_01', 0.42) }, { s: 'git bisect good v1.2', t: P('G04_01', 0.7), cmd: true, dur: 0.4 }, { s: '{d}# 上周的版本是好的', t: P('G04_01', 0.78) }], { title: '终端', accent: '#d6283e', fs: 32, prompt: false, alpha: a });
    else if (t < g3) { const k = [[P('G04_02', 0.3), 1, 'good', GOODC], [P('G04_02', 0.6), 0, 'bad', KNOTC]]; let cur = null; k.forEach(c => { if (t >= c[0]) cur = c; });
      baifanPage(t, 1000, 660, 0.82 * popIn(t, P('G04_02', 0.15)), cur ? cur[1] : 1);
      if (cur) { const s = popIn(t, cur[0] + 0.15); ctx.save(); ctx.translate(1530, 650); ctx.scale(s, s); box(-260, -60, 520, 120, 30, '#1b1730', cur[3], 6); txt('git bisect ' + cur[2], 0, 2, 38, cur[3], { align: 'center', font: F_CODE }); ctx.restore(); }
      if (t >= P('G04_02', 0.82)) fancy('每次砍掉一半！', 1270, 860, 60, t, P('G04_02', 0.82), FX.yel); }
    else { const cnt = [100, 50, 25, 13, 7, 4, 2, 1]; const ci = Math.min(7, Math.max(0, Math.floor((t - g3) / ((E('G04_03') - g3) * 0.08)))); const fin = P('G04_03', 0.6);
      cnt.forEach((n, i) => { if (i > ci) return; const s = popIn(t, g3 + i * (E('G04_03') - g3) * 0.08, 0.3); ctx.save(); ctx.translate(760 + i * 150, 560); ctx.scale(s, s); box(-60, -50, 120, 100, 20, i === 7 ? KNOTC : '#fffaf0', i === 7 ? '#fff' : ACC, 5); txt(String(n), 0, 2, 44, i === 7 ? '#fff' : '#1b1433', { align: 'center', font: F_CODE }); if (i) txt('第' + i + '次', 0, 78, 22, '#fff', { align: 'center' }); ctx.restore(); });
      if (t >= fin) { const s = popIn(t, fin, 0.4); ctx.save(); ctx.translate(1270, 800); ctx.scale(s, s); box(-560, -60, 1120, 120, 24, '#1b1730', KNOTC, 6); txt('e5f6a7 is the first bad commit', 0, 2, 40, '#ff9aa9', { align: 'center', font: F_CODE }); ctx.restore(); stamp(t, fin + 0.3, 1640, 680, '最多 7 次！', BADC, 42, -0.06); } } }
  if (t >= g4 && t < g5 + 0.3) { const a = eOut(prog(t, g4, 0.3)) * (1 - prog(t, g5, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    box(690, 130, 1180, 300, 26, 'rgba(15,12,31,0.9)', '#fff', 5);
    const sk = P('G04_04', 0.55); const s2 = t < sk ? { lo: 32, hi: 48, mid: 40 } : { lo: 32, hi: 48, mid: 39, skip: [40] };
    bisectBar(t, 740, 280, 1080, N, s2, { h: 70 });
    if (t < sk) { const p = popIn(t, P('G04_04', 0.1)); ctx.save(); ctx.translate(1270, 600); ctx.scale(p, p); box(-300, -110, 600, 220, 24, '#2a2350', '#888', 5); txt('💥 跑不起来', 0, -30, 44, '#fff', { align: 'center', font: EMOJI + ',' + F_BODY }); txt('好？坏？没法判断', 0, 40, 32, '#c9c3e6', { align: 'center' }); ctx.restore(); }
    else { cmdBar(t, 1270, 600, 'git bisect skip', sk, 0.35, { fs: 44, col: '#aaa' }); note(1270, 740, popIn(t, sk + 0.4), '跳过它，换旁边一个', '#ddd', { fs: 34 }); }
    ctx.restore(); }
  if (t >= g5) { const a = eOut(prog(t, g5, 0.3)); ctx.save(); ctx.globalAlpha *= a;
    [['git bisect reset', '⏪ 查完回到原来的分支', P('G04_05', 0.1), '#7cf07a'], ['git bisect run npm test', '🤖 有测试脚本？自动跑完', P('G04_05', 0.55), '#6bd3ff']].forEach((c, i) => { const s = popIn(t, c[2], 0.4); if (s <= 0) return;
      ctx.save(); ctx.translate(1270, 320 + i * 260); ctx.scale(s, s); box(-540, -100, 1080, 200, 30, '#1b1730', c[3], 7); txt(c[0], 0, -30, 46, c[3], { align: 'center', font: F_CODE }); txt(c[1], 0, 45, 34, '#fff', { align: 'center', font: EMOJI + ',' + F_BODY }); ctx.restore(); });
    if (t >= P('G04_05', 0.25) && t < P('G04_05', 0.55)) stamp(t, P('G04_05', 0.25), 1700, 180, '别忘了！', BADC, 46, -0.1);
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('X02', 0.5)) stamp(t, P('X02', 0.5), 1180, 520, '7 次抓到 ✓', '#d6283e', 86, -0.12);
};
SFX_FNS.push(() => { guestSfx(['X02']); typeSfx(P('G04_01', 0.08), 16, 0.35); typeSfx(P('G04_01', 0.35), 14, 0.3); typeSfx(P('G04_01', 0.7), 20, 0.4);
  [0.12, 0.5, 0.78].forEach(f => sfx(P('G04_02', f), 'whoosh', 0.4)); sfx(P('G04_02', 0.15), 'pop', 0.3); sfx(P('G04_02', 0.3) + 0.15, 'ding', 0.4); sfx(P('G04_02', 0.6) + 0.15, 'buzz', 0.4); sfx(P('G04_02', 0.82), 'sparkle', 0.4);
  const g3 = S('G04_03'), d3 = E('G04_03') - g3; for (let i = 0; i < 8; i++) sfx(g3 + i * d3 * 0.08, 'pop', 0.25); [0.1, 0.25, 0.4].forEach(f => sfx(P('G04_03', f), 'whoosh', 0.25)); sfx(P('G04_03', 0.6), 'impact', 0.6); sfx(P('G04_03', 0.6) + 0.3, 'stamp', 0.6);
  sfx(S('G04_04') - 0.15, 'swoosh_in', 0.4); sfx(P('G04_04', 0.1), 'buzz', 0.4); typeSfx(P('G04_04', 0.55), 15, 0.35); sfx(P('G04_04', 0.55) + 0.4, 'pop', 0.3);
  sfx(S('G04_05') - 0.15, 'swoosh_in', 0.4); sfx(P('G04_05', 0.1), 'pop', 0.4); sfx(P('G04_05', 0.25), 'stamp', 0.5); sfx(P('G04_05', 0.55), 'pop', 0.4); sfx(P('X02', 0.5), 'stamp', 0.8); });
