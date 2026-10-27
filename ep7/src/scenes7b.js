
// ---- 讲解①：任务单 .github/workflows/check.yml ----
const L_WF = () => [
  { s: 'name: 白饭页检查', t: P('G02_02', 0.08), hl: [S('G02_02'), P('G02_02', 0.45)] },
  { s: 'on: push', t: P('G02_02', 0.45), hl: [P('G02_02', 0.45), E('G02_02')] },
  { s: 'jobs:', t: P('G02_03', 0.02), hl: [S('G02_03'), P('G02_03', 0.3)] },
  { s: '  check:', t: P('G02_03', 0.12), hl: [S('G02_03'), P('G02_03', 0.3)] },
  { s: '    runs-on: ubuntu-latest', t: P('G02_03', 0.32), dur: 0.5, hl: [P('G02_03', 0.32), E('G02_03')] },
  { s: '    steps:', t: P('G02_04', 0.02), hl: [S('G02_04'), P('G02_04', 0.35)] },
  { s: '      - uses: actions/checkout@v7', t: P('G02_04', 0.35), dur: 0.5, hl: [P('G02_04', 0.35), E('G02_04')] },
  { s: '      - run: npx --yes html-validate index.html', t: P('G02_05', 0.12), dur: 0.7, hl: [P('G02_05', 0.12), E('G02_05') + 0.3] },
];
SC.workflow = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const e1 = S('G02_02') - 0.15;
  if (t < e1 + 0.3) { const a = 1 - prog(t, e1, 0.3); ctx.save(); ctx.globalAlpha = a;
    pill(1270, 170, '什么都不用装 · 写个文件就行', '#ffd23f', popIn(t, blk.t0 + 0.1), { fs: 40, font: F_BODY });
    urlParts(1270, 400, popIn(t, P('G02_01', 0.2), 0.4), [['.github', '#ffd23f', '点开头'], ['/workflows', '#7cc7ff', '固定名字'], ['/check.yml', '#7cf07a', '任务单']], 58);
    if (t >= P('G02_01', 0.65)) fancy('一个字母都不能错！', 1270, 720, 70, t, P('G02_01', 0.65), FX.red);
    ctx.restore(); }
  const g6 = S('G02_06') - 0.15;
  if (t >= e1 && t < g6 + 0.3) {
    const a = eOut(prog(t, e1, 0.3)) * (1 - prog(t, g6, 0.3));
    ymlEditor(t, 690, 130, 1170, 620, '.github/workflows/check.yml', L_WF(), { fs: 32, alpha: a });
    const notes = [['G02_02', 0.5, 'name = 名字 · on = 什么时候跑', '#7cc7ff'], ['G02_03', 0.45, '🐧 runs-on：借一台 Linux 云电脑', '#ffd23f'], ['G02_04', 0.5, 'uses：借现成动作，先拉代码', '#ff9de2'], ['G02_05', 0.4, 'run：直接跑命令，检查标签', '#7cf07a']];
    ctx.save(); ctx.globalAlpha = a; notes.forEach(n => { if (t >= P(n[0], n[1]) && t < E(n[0]) + 0.25) note(1270, 830, popIn(t, P(n[0], n[1])), n[2], n[3], { fs: 38 }); }); ctx.restore();
  }
  if (t >= g6) { // 推送后：Actions 标签页
    const a = eOut(prog(t, g6, 0.3)); ctx.save(); ctx.globalAlpha = a;
    const cy = browser(680, 120, 1180, 700, 'github.com/dafeiyu/baifan/actions', { title: '浏览器', accent: ACC });
    const tab = P('G02_06', 0.35); ['<> Code', 'Issues', 'Pull requests', '▶ Actions'].forEach((n, i) => { const x = 710 + i * 250, hot = i === 3 && t >= tab;
      txt(n, x, cy + 40, 26, hot ? '#24292f' : '#57606a', { font: F_CODE, bold: hot }); if (hot) box(x - 6, cy + 66, 170, 5, 2, '#fd8c73'); });
    box(686, cy + 78, 1168, 2, 0, '#d0d7de');
    if (t >= P('G02_06', 0.3) && t < tab + 0.5) txt('👆', 1520, cy + 110, 60, '#000', { font: EMOJI, bold: false });
    runList(t, 710, cy + 120, 1120, [['Create check.yml', 0, prog(t, P('G02_06', 0.55), 0.25), 'check #1 · main · push', '']]);
    if (t >= P('G02_06', 0.62)) fancy('开始跑了！', 1270, 900, 72, t, P('G02_06', 0.62), FX.yel);
    ctx.restore(); }
};
SFX_FNS.push(() => { const b = BK.workflow; sfx(b.t0 + 0.1, 'pop', 0.4); sfx(P('G02_01', 0.2), 'whoosh', 0.4); sfx(P('G02_01', 0.65), 'stamp', 0.5); sfx(S('G02_02') - 0.15, 'swoosh_in', 0.4);
  L_WF().forEach(l => typeSfx(l.t, [...l.s].length, l.dur || 0.35)); [['G02_02', 0.5], ['G02_03', 0.45], ['G02_04', 0.5], ['G02_05', 0.4]].forEach(n => sfx(P(n[0], n[1]), 'pop', 0.35)); sfx(S('G02_06') - 0.15, 'swoosh_in', 0.4); sfx(P('G02_06', 0.35), 'click', 0.6); sfx(P('G02_06', 0.55), 'pop', 0.4); sfx(P('G02_06', 0.62), 'ding', 0.4); });

// ---- 讲解②：看结果（Grok：这是真的吗）----
function logPanel(t, x, y, w, h, steps, o = {}) {
  box(x, y, w, h, 16, '#0d1117', '#30363d', 3); txt('check', x + 30, y + 40, 30, '#e6edf3', { font: F_CODE }); txt(o.sub || '失败 · 18s', x + 150, y + 40, 22, '#8b949e', { bold: false });
  let yy = y + 90;
  steps.forEach(s => { if (t < (s.t ?? -1)) return; statusIcon(x + 46, yy, 16, s.st, t); txt(s.n, x + 80, yy, 24, '#e6edf3', { font: F_CODE, max: w - 120 }); yy += 56;
    if (s.open && t >= s.open[0]) { const n = s.open[1].length; const hh = 20 + n * 40 * clamp(prog(t, s.open[0], 0.3)); box(x + 60, yy - 18, w - 90, hh, 10, '#161b22', '#30363d', 2);
      ctx.save(); rr(x + 60, yy - 18, w - 90, hh, 10); ctx.clip(); s.open[1].forEach((l, i) => { const ly = yy + 6 + i * 40; if (l.hl) box(x + 66, ly - 18, w - 102, 36, 6, 'rgba(255,59,92,0.25)'); txt(l.s, x + 84, ly, 22, l.c || '#c9d1d9', { font: F_CODE, bold: !!l.hl, max: w - 140 }); }); ctx.restore(); yy += hh + 10; } });
}
SC.run = (t, blk, en) => {
  bgLecture(t, BADC); lecturer(t, blk, en, blk.t0);
  const g2 = S('G03_02') - 0.15, g4 = S('G03_04') - 0.15;
  if (t < g2 + 0.3) { const a = 1 - prog(t, g2, 0.3); ctx.save(); ctx.globalAlpha = a;
    note(1270, 170, popIn(t, P('G03_01', 0.12)), '仓库没坏 ✓ 只是检查没通过', '#2ec86e', { fs: 38 });
    [[1640, 2, '没通过', 0.28, '#ff8a9a'], [900, 0, '正在跑', 0.55, '#ffd36b'], [1270, 1, '通过', 0.78, '#7cf07a']].forEach(c => { const s = popIn(t, P('G03_01', c[3]), 0.45); if (s <= 0) return; ctx.save(); ctx.translate(c[0], 440); ctx.scale(s, s); statusIcon(0, 0, 100, c[1], t); txt(c[2], 0, 170, 48, c[4], { align: 'center' }); ctx.restore(); });
    ctx.restore(); }
  if (t >= g2 && t < g4 + 0.3) {
    const a = eOut(prog(t, g2, 0.3)) * (1 - prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha = a;
    const cy = browser(680, 110, 1180, 780, 'github.com/dafeiyu/baifan/actions', { title: 'Actions', accent: BADC });
    const lg = P('G03_02', 0.3), back = S('G03_03') - 0.1, fix = P('G03_03', 0.12), ok = P('G03_03', 0.42);
    if (t < lg || t >= back) {
      const rows = [['白饭页改版', 2, 1, 'check #3 · main', '18s', t >= P('G03_02', 0.1) && t < lg], ['加今日推荐菜', 1, 1, 'check #2 · main', '21s'], ['第一次上线', 1, 1, 'check #1 · main', '20s']];
      if (t >= back) rows.unshift(['补上结束标签', t >= ok ? 1 : 0, prog(t, fix, 0.25), 'check #4 · main', '19s', t >= ok]);
      runList(t, 710, cy + 24, 1120, rows);
      if (t >= P('G03_02', 0.12) && t < lg) txt('👆', 1300, cy + 120, 64, '#000', { font: EMOJI, bold: false });
      if (t >= ok) sparkle(t, ok, 754, cy + 64, 120, 8);
    } else {
      logPanel(t, 710, cy + 20, 1120, 540, [{ n: 'Set up job', st: 1 }, { n: 'Run actions/checkout@v7', st: 1 }, { n: 'Run npx --yes html-validate index.html', st: 2,
        open: [P('G03_02', 0.5), [{ s: 'index.html' }, { s: '  12:5  error  Unclosed element "div"', c: '#ff7b72', hl: true }, { s: '✖ 1 problem' }]] }]);
      if (t >= P('G03_02', 0.7)) note(1560, cy + 470, popIn(t, P('G03_02', 0.7)), '第 12 行出错', '#ff3b5c', { fs: 38 });
    }
    mailCard(1180, 800, popIn(t, P('G03_03', 0.65), 0.4));
    ctx.restore();
  }
  if (t >= g4) { const a = eOut(prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha = a;
    [['🌐 公开仓库', '免费', '不限分钟', '#2ec86e', 0.1], ['🔒 私有仓库', '每月 2000 分钟', '免费额度', '#ffd23f', 0.5]].forEach((c, i) => { const s = popIn(t, P('G03_04', c[4]), 0.45); if (s <= 0) return; ctx.save(); ctx.translate(990 + i * 560, 470); ctx.scale(s, s);
      box(-240, -230, 480, 460, 30, 'rgba(255,255,255,0.08)', c[3], 7); txt(c[0], 0, -150, 46, '#fff', { align: 'center' }); txt(c[1], 0, 0, i ? 52 : 90, c[3], { align: 'center', font: F_FANCY, bold: false }); txt(c[2], 0, 130, 36, '#c9c3dd', { align: 'center' }); ctx.restore(); });
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('X02', 0.65) && t < E('X02') + 0.4) stamp(t, P('X02', 0.65), 1180, 520, '绿勾 ✓ 是真的', '#22c08b', 76, -0.12);
};
SFX_FNS.push(() => { guestSfx(['X02']); sfx(P('G03_01', 0.12), 'pop', 0.4); [0.28, 0.55, 0.78].forEach(f => sfx(P('G03_01', f), 'pop', 0.45));
  sfx(S('G03_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G03_02', 0.3), 'click', 0.6); sfx(P('G03_02', 0.5), 'whoosh', 0.3); sfx(P('G03_02', 0.7), 'buzz', 0.4);
  sfx(P('G03_03', 0.12), 'pop', 0.4); sfx(P('G03_03', 0.42), 'ding', 0.6); sfx(P('G03_03', 0.65), 'pop', 0.5); sfx(P('X02', 0.65), 'stamp', 0.7);
  sfx(S('G03_04') - 0.15, 'swoosh_in', 0.4); [0.1, 0.5].forEach(f => sfx(P('G03_04', f), 'pop', 0.45)); });

// ---- 讲解③：触发方式 pull_request / workflow_dispatch（千问）----
SC.trigger = (t, blk, en) => {
  bgLecture(t, '#5b6ee1'); lecturer(t, blk, en, blk.t0);
  const g2 = S('G04_02') - 0.1;
  const L = [{ s: 'on:', t: -1 }, { s: '  push:', t: -1, good: t >= S('G04_03') - 0.15 }, { s: '  pull_request:', t: P('G04_01', 0.12), dur: 0.5, good: (t >= P('G04_01', 0.12) && t < g2) || t >= S('G04_03') - 0.15 },
    { s: '  workflow_dispatch:', t: P('G04_02', 0.12), dur: 0.5, good: t >= P('G04_02', 0.12) && t < S('G04_03') - 0.15, dim: t >= S('G04_03') - 0.15 }];
  ymlEditor(t, 690, 140, 560, 400, 'check.yml', L, { fs: 30, accent: '#5b6ee1', alpha: popIn(t, blk.t0 + 0.05) });
  if (t < g2 + 0.3) { const a = popIn(t, blk.t0 + 0.2) * (1 - prog(t, g2, 0.3)); if (a > 0) { ctx.save(); ctx.globalAlpha *= clamp(a);
    const x = 1280, y = 140, ck = P('G04_01', 0.42), pass = P('G04_01', 0.62);
    box(x, y, 580, 620, 20, '#fff', '#d0d7de', 3); box(x, y, 580, 70, [20, 20, 0, 0], '#f6f8fa', '#d0d7de', 2); txt('⇄ PR #3 咖喱饭', x + 30, y + 36, 30, '#24292f', {});
    const st = t >= pass ? 1 : t >= ck ? 0 : -1;
    box(x + 30, y + 110, 520, 240, 14, st === 1 ? '#dafbe1' : '#f6f8fa', st === 1 ? '#4ac26b' : '#d0d7de', st === 1 ? 4 : 2);
    if (st < 0) txt('⚪ 等待检查…', x + 60, y + 170, 30, '#57606a', {});
    else { statusIcon(x + 80, y + 170, 26, st, t); txt(st ? 'All checks have passed' : 'Some checks haven’t completed', x + 124, y + 170, st ? 28 : 24, st ? LIVEC : '#9a6700', { font: F_CODE, max: 420 });
      statusIcon(x + 80, y + 260, 16, st, t); txt('check / check (pull_request)', x + 110, y + 260, 22, '#24292f', { font: F_CODE, bold: false, max: 430 }); }
    ghButton(x + 30, y + 400, 360, 74, 'Merge pull request', st === 1 ? OKC : '#94d3a2', { fs: 28, glow: st === 1 ? 0.5 + 0.5 * Math.sin(t * 5) : 0 });
    if (t >= pass) note(x + 290, y + 560, popIn(t, pass + 0.1), '绿勾了再合并', '#2ec86e', { fs: 36 });
    ctx.restore(); } }
  const g3 = S('G04_03') - 0.15;
  if (t >= g2 && t < g3 + 0.3) { const a = eOut(prog(t, g2, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a;
    const x = 1280, y = 140, pr = P('G04_02', 0.55); box(x, y, 580, 620, 20, '#fff', '#d0d7de', 3); box(x, y, 580, 70, [20, 20, 0, 0], '#f6f8fa', '#d0d7de', 2); txt('▶ Actions · 白饭页检查', x + 30, y + 36, 28, '#24292f', {});
    txt('This workflow has a', x + 30, y + 120, 22, '#57606a', { font: F_CODE, bold: false }); txt('workflow_dispatch trigger.', x + 30, y + 152, 22, '#57606a', { font: F_CODE, bold: false });
    ghButton(x + 300, y + 100, 250, 64, 'Run workflow ▾', '#f6f8fa', { fg: '#24292f', border: t >= P('G04_02', 0.35) ? '#d4a72c' : '#d0d7de', fs: 24, press: t >= pr && t < pr + 0.2, glow: t >= P('G04_02', 0.35) && t < pr + 0.3 ? 1 : 0 });
    if (t >= P('G04_02', 0.35) && t < pr + 0.6) txt('👆', x + 420, y + 200, 60, '#000', { font: EMOJI, bold: false });
    runList(t, x + 24, y + 260, 532, [['手动运行', t >= P('G04_02', 0.85) ? 1 : 0, prog(t, pr + 0.15, 0.25), 'workflow_dispatch', '20s'], ['咖喱饭 #3', 1, 1, 'pull_request', '22s'], ['白饭页改版', 1, 1, 'push', '19s']], { fs: 24 });
    ctx.restore(); if (t >= P('G04_02', 0.6) && t < g3) pill(1570, 840, '随时手动跑一次', '#ffd23f', popIn(t, P('G04_02', 0.6)), { fs: 36, font: F_BODY }); }
  if (t >= g3) { const a = eOut(prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a; // push + PR 两条线
    [['🧑‍💻 自己推送', 'push', 0.2, 300], ['👥 别人提 PR', 'pull_request', 0.55, 560]].forEach(c => { const s = popIn(t, P('G04_03', c[2]), 0.4); if (s <= 0) return; ctx.save(); ctx.translate(1570, c[3]); ctx.scale(s, s);
      box(-290, -100, 580, 200, 26, 'rgba(255,255,255,0.08)', '#9aa5ff', 5); txt(c[0], -250, -36, 36, '#fff', {}); txt(c[1], -250, 30, 30, '#7cc7ff', { font: F_CODE }); arrow(60, 30, 160, 30, '#fff', 1, 8); statusIcon(220, 30, 40, 1, t); ctx.restore(); });
    if (t >= P('G04_03', 0.8)) fancy('都查一遍！', 1570, 800, 70, t, P('G04_03', 0.8), FX.green);
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('Q02', 0.45)) stamp(t, P('Q02', 0.45), 1180, 520, '放心合并 ✓', '#22c08b', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['Q02']); const b = BK.trigger; sfx(b.t0 + 0.05, 'pop', 0.4); typeSfx(P('G04_01', 0.12), 14, 0.5); sfx(P('G04_01', 0.42), 'pop', 0.4); sfx(P('G04_01', 0.62), 'ding', 0.6); sfx(P('G04_01', 0.62) + 0.1, 'pop', 0.4);
  sfx(S('G04_02') - 0.1, 'swoosh_in', 0.4); typeSfx(P('G04_02', 0.12), 18, 0.5); sfx(P('G04_02', 0.55), 'click', 0.7); sfx(P('G04_02', 0.6), 'pop', 0.4); sfx(P('G04_02', 0.85), 'ding', 0.4); sfx(S('G04_03') - 0.15, 'swoosh_in', 0.4); [0.2, 0.55].forEach(f => sfx(P('G04_03', f), 'pop', 0.4)); sfx(P('G04_03', 0.8), 'ding', 0.5); sfx(P('Q02', 0.45), 'stamp', 0.7); });

// ---- 讲解④：定时 schedule / cron（Gemini 八点变四点）----
function miniClock(x, y, r, hour, label, col, s = 1) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = col; ctx.lineWidth = r * 0.08; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.stroke();
  const ha = (hour % 12) / 12 * Math.PI * 2; ctx.strokeStyle = '#1b1433'; ctx.lineCap = 'round'; ctx.lineWidth = r * 0.1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ha) * r * 0.52, -Math.cos(ha) * r * 0.52); ctx.stroke();
  ctx.lineWidth = r * 0.06; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.78); ctx.stroke();
  txt(label, 0, r + 50, 40, col, { align: 'center', font: F_CODE }); ctx.restore();
}
SC.schedule = (t, blk, en) => {
  bgLecture(t, '#a855f7'); lecturer(t, blk, en, blk.t0);
  const f0 = P('G05_02', 0.15), tz = P('G05_02', 0.55), f1 = P('G05_03', 0.7);
  const cron = flipText(t, [[-1, "'0 8 * * *'"], [f0, "'0 0 * * *'"], [tz, "'0 8 * * *'"], [f1, "'17 8 * * *'"]]);
  const L = [{ s: 'on:', t: -1 }, { s: '  schedule:', t: -1 }, { s: "    - cron: " + cron.s, t: -1, good: t >= f0, hl: [S('G05_01'), f0] },
    { s: '      timezone: Asia/Shanghai', t: tz, dur: 0.5, good: true }];
  ymlEditor(t, 690, 120, 1170, 330, 'check.yml', L, { fs: 32, accent: '#a855f7', alpha: popIn(t, blk.t0 + 0.05) });
  const g3 = S('G05_03') - 0.15, sw = P('G05_01', 0.5);
  if (t < sw + 0.3) { const a = 1 - prog(t, sw, 0.3); ctx.save(); ctx.globalAlpha = a;
    urlParts(1270, 600, popIn(t, P('G05_01', 0.08), 0.4), [['0 ', '#7cf07a', '分'], ['8 ', '#ffd23f', '时'], ['* ', '#ece9f7', '日'], ['* ', '#ece9f7', '月'], ['*', '#ece9f7', '周']], 70);
    ctx.restore(); }
  if (t >= sw && t < g3 + 0.3) { const a = eOut(prog(t, sw, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a;
    const fixed = t >= f0; miniClock(930, 620, 120, fixed ? 0 : 8, fixed ? 'UTC 00:00' : 'UTC 08:00', '#7cc7ff', popIn(t, sw, 0.4));
    arrow(1080, 620, 1290, 620, '#fff', eOut(prog(t, sw + 0.3, 0.3)), 12); txt('+8 小时', 1185, 570, 34, '#ffd23f', { align: 'center' });
    miniClock(1440, 620, 120, fixed ? 8 : 16, fixed ? '北京 08:00 ✓' : '北京 16:00', fixed ? '#7cf07a' : '#ff8a9a', popIn(t, sw + 0.4, 0.4));
    if (t >= tz) note(1185, 850, popIn(t, tz), '或者：加上时区，照写 8 点', '#ffd23f', { fs: 34 });
    ctx.restore(); }
  const g4 = S('G05_04') - 0.15;
  if (t >= g4) { const a = eOut(prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha = a;
    [['🌿', '只在默认分支 main 上跑', 0.15, 580, '#7cf07a'], ['💤', '公开仓库 60 天没动静 → 自动暂停', 0.5, 780, '#ffd23f']].forEach(c => { const s = popIn(t, P('G05_04', c[2]), 0.4); if (s <= 0) return; ctx.save(); ctx.translate(1270, c[3]); ctx.scale(s, s);
      box(-540, -76, 1080, 152, 26, 'rgba(15,12,31,0.9)', c[4], 5); txt(c[0], -470, 2, 70, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], -400, 2, 42, '#fff', { max: 900 }); ctx.restore(); });
    ctx.restore(); }
  if (t >= g3 && t < g4 + 0.3) { const a = eOut(prog(t, g3, 0.3)) * (1 - prog(t, g4, 0.3)); ctx.save(); ctx.globalAlpha = a;
    pill(930, 540, '⏱ 最短 5 分钟一次', '#ffd23f', popIn(t, P('G05_03', 0.05)), { fs: 38, font: F_BODY });
    box(720, 620, 1120, 8, 4, '#c9c3dd'); [['7:55', 760], ['8:00', 1270], ['8:17', 1760]].forEach(m => { box(m[1] - 3, 600, 6, 48, 3, '#fff'); txt(m[0], m[1], 680, 30, '#fff', { align: 'center', font: F_CODE }); });
    for (let i = 0; i < 9; i++) { const s = popIn(t, P('G05_03', 0.3 + i * 0.03)); if (s > 0) statusIcon(1270 + (i % 3 - 1) * 58, 570 - Math.floor(i / 3) * 58 - 30, 24 * s, 0, t + i); }
    if (t >= P('G05_03', 0.45)) note(1270, 760, popIn(t, P('G05_03', 0.45)), '整点人多 → 可能晚一点', '#ff8a9a', { fs: 34 });
    if (t >= f1) { statusIcon(1760, 560, 28 * popIn(t, f1 + 0.2), 1, t); note(1640, 860, popIn(t, f1 + 0.1), '挑零碎分钟更稳', '#7cf07a', { fs: 34 }); }
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('M02', 0.5) && t < E('M02') + 0.4) stamp(t, P('M02', 0.5), 1180, 520, '时差的锅！', '#a855f7', 76, -0.12);
};
SFX_FNS.push(() => { guestSfx(['M02']); const b = BK.schedule; sfx(b.t0 + 0.05, 'pop', 0.4); sfx(P('G05_01', 0.08), 'pop', 0.5); sfx(P('G05_01', 0.5), 'swoosh_in', 0.4); sfx(P('G05_01', 0.5) + 0.3, 'whoosh', 0.4); sfx(P('G05_01', 0.5) + 0.4, 'buzz', 0.4);
  sfx(P('G05_02', 0.15), 'ding', 0.5); typeSfx(P('G05_02', 0.55), 18, 0.5); sfx(S('G05_03') - 0.15, 'swoosh_in', 0.4); for (let i = 0; i < 9; i += 2) sfx(P('G05_03', 0.3 + i * 0.03), 'pop', 0.2); sfx(P('G05_03', 0.45), 'buzz', 0.3); sfx(P('G05_03', 0.7), 'ding', 0.5); sfx(S('G05_04') - 0.15, 'swoosh_in', 0.4); [0.15, 0.5].forEach(f => sfx(P('G05_04', f), 'pop', 0.4)); sfx(P('M02', 0.5), 'stamp', 0.7); });
