
// ---- 讲解⑤：密钥放 Secrets（Claude：批准）----
SC.secrets = (t, blk, en) => {
  bgLecture(t, '#e07a3d'); lecturer(t, blk, en, blk.t0);
  const g2 = S('G06_02') - 0.15;
  if (t < g2 + 0.3) { const a = popIn(t, blk.t0 + 0.05, 0.4) * (1 - prog(t, g2, 0.3)); if (a > 0) { ctx.save(); ctx.globalAlpha *= clamp(a);
    const cy = browser(680, 110, 1180, 780, 'github.com/dafeiyu/baifan/settings/secrets/actions', { title: 'Settings', accent: '#e07a3d' });
    const ex = P('G06_01', 0.22), sel = P('G06_01', 0.38), nb = P('G06_01', 0.58), form = P('G06_01', 0.68), add = P('G06_01', 0.9);
    box(700, cy + 20, 300, 540, 12, '#f6f8fa', '#d0d7de', 2);
    const side = ['General', 'Branches', 'Pages', '🔒 Secrets and', '    variables', t >= ex ? '      Actions' : null].filter(Boolean);
    side.forEach((n, i) => { const yy = cy + 60 + i * 60, hot = (i >= 3 && i <= 4 && t >= S('G06_01') && t < sel) || (i === 5 && t >= sel);
      if (hot) { box(708, yy - 26, 284, 52, 10, '#ddf4ff'); ctx.fillStyle = '#fd8c73'; rr(708, yy - 22, 6, 44, 3); ctx.fill(); }
      txt(n, 726, yy, 24, hot ? '#0969da' : '#24292f', { font: F_CODE, bold: hot }); });
    const px = 1030; txt('Actions secrets and variables', px, cy + 50, 30, '#24292f', {});
    txt('Secrets', px, cy + 110, 26, '#24292f', {}); box(px, cy + 128, 110, 5, 2, '#fd8c73'); txt('Variables', px + 150, cy + 110, 26, '#57606a', { bold: false });
    if (t < form) { ghButton(px, cy + 170, 360, 64, 'New repository secret', OKC, { fs: 24, press: t >= nb && t < nb + 0.2, glow: t >= sel ? 0.6 + 0.4 * Math.sin(t * 6) : 0 });
      if (t >= sel) txt('👆', px + 250, cy + 270, 60, '#000', { font: EMOJI, bold: false }); txt('还没有密钥', px, cy + 330, 26, '#8c959f', { bold: false }); }
    else if (t < add + 0.3) { const f = popIn(t, form, 0.35); ctx.save(); ctx.translate(px + 380, cy + 330); ctx.scale(f, f); ctx.translate(-px - 380, -cy - 330);
      inputBox(px, cy + 210, 780, 'Name *', 'DEPLOY_KEY', { code: true });
      box(px, cy + 330, 780, 120, 10, '#f6f8fa', '#d0d7de', 2); txt('Secret *', px, cy + 304, 28, '#24292f', {}); txt('••••••••••••••', px + 18, cy + 370, 30, '#24292f', { font: F_CODE });
      ghButton(px, cy + 480, 200, 60, 'Add secret', OKC, { fs: 24, press: t >= add && t < add + 0.2 }); ctx.restore(); }
    else { box(px, cy + 170, 780, 80, 10, '#fff', '#4ac26b', 3); txt('🔑 DEPLOY_KEY', px + 24, cy + 210, 28, '#24292f', { font: F_CODE }); txt('Updated now', px + 760, cy + 210, 22, '#57606a', { align: 'right', bold: false });
      note(px + 390, cy + 330, popIn(t, add + 0.3), '值只能写入，谁都看不到', '#2ec86e', { fs: 32 }); }
    ctx.restore(); } }
  if (t >= g2) { const a = eOut(prog(t, g2, 0.3));
    ymlEditor(t, 690, 120, 1170, 270, 'check.yml', [{ s: '    env:', t: -1 }, { s: '      KEY: ${{ secrets.DEPLOY_KEY }}', t: P('G06_02', 0.08), dur: 0.6, good: true }], { fs: 32, accent: '#e07a3d', alpha: a });
    const lg = P('G06_02', 0.55); if (t >= lg) { ctx.save(); ctx.globalAlpha = eOut(prog(t, lg, 0.3));
      box(690, 430, 1170, 260, 16, '#0d1117', '#30363d', 3); txt('▶ Run ./deploy.sh', 720, 480, 26, '#e6edf3', { font: F_CODE });
      txt('KEY:', 740, 560, 44, '#8b949e', { font: F_CODE }); const hs = popIn(t, lg + 0.2, 0.4); ctx.save(); ctx.translate(980, 560); ctx.scale(hs, hs); box(-20, -40, 150, 80, 12, 'rgba(255,210,63,0.2)', '#ffd23f', 4); txt('***', 55, 6, 64, '#ffd23f', { align: 'center', font: F_CODE }); ctx.restore();
      txt('日志自动打码', 1400, 560, 40, '#7cf07a', {}); ctx.restore(); }
  }
  guest(t, blk);
  if (t >= P('C02', 0.6)) stamp(t, P('C02', 0.6), 1180, 520, '批准 ✓', '#22c08b', 90, -0.12);
};
SFX_FNS.push(() => { guestSfx(['C02']); const b = BK.secrets; sfx(b.t0 + 0.05, 'pop', 0.4); sfx(P('G06_01', 0.22), 'click', 0.5); sfx(P('G06_01', 0.38), 'click', 0.5); sfx(P('G06_01', 0.58), 'click', 0.7); sfx(P('G06_01', 0.68), 'pop', 0.4); sfx(P('G06_01', 0.9), 'click', 0.6); sfx(P('G06_01', 0.9) + 0.3, 'ding', 0.4);
  sfx(S('G06_02') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G06_02', 0.08), 18, 0.6); sfx(P('G06_02', 0.55) + 0.2, 'pop', 0.6); sfx(P('C02', 0.6), 'stamp', 0.8); });

// ---- 讲解⑥：状态徽章（豆包）----
SC.badge = (t, blk, en) => {
  bgLecture(t, '#16a5c9'); lecturer(t, blk, en, blk.t0);
  const g2 = S('G07_02') - 0.15;
  if (t < g2 + 0.3) { const a = popIn(t, blk.t0 + 0.05, 0.4) * (1 - prog(t, g2, 0.3)); if (a > 0) { ctx.save(); ctx.globalAlpha *= clamp(a);
    const cy = browser(680, 110, 1180, 780, 'github.com/dafeiyu/baifan/actions/workflows/check.yml', { title: 'Actions', accent: '#16a5c9' });
    const mn = P('G07_01', 0.3), it = P('G07_01', 0.42), dl = P('G07_01', 0.55), cp = P('G07_01', 0.86);
    txt('白饭页检查', 720, cy + 50, 38, '#24292f', {}); txt('check.yml', 720, cy + 96, 24, '#57606a', { font: F_CODE, bold: false });
    ghButton(1740, cy + 26, 90, 54, '⋯', t >= P('G07_01', 0.18) && t < dl ? '#fff8c5' : '#f6f8fa', { fg: '#24292f', border: '#d0d7de', fs: 34, press: t >= mn && t < mn + 0.2 });
    runList(t, 710, cy + 150, 1120, [['补上结束标签', 1, 1, 'check #4 · main', '19s'], ['白饭页改版', 2, 1, 'check #3 · main', '18s']], { fs: 24 });
    if (t >= mn && t < dl) { const s = popIn(t, mn, 0.25); ctx.save(); ctx.translate(1830, cy + 90); ctx.scale(s, s); box(-380, 0, 380, 170, 12, '#fff', '#d0d7de', 3);
      txt('Disable workflow', -350, 44, 24, '#24292f', { font: F_CODE, bold: false }); if (t >= it) box(-372, 82, 364, 60, 8, '#ddf4ff'); txt('Create status badge', -350, 112, 24, t >= it ? '#0969da' : '#24292f', { font: F_CODE }); ctx.restore();
      if (t >= it) txt('👆', 1700, cy + 260, 56, '#000', { font: EMOJI, bold: false }); }
    if (t >= dl) { const s = popIn(t, dl, 0.35); ctx.save(); ctx.translate(1270, 520); ctx.scale(s, s); ctx.translate(-1270, -520);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(686, cy, 1168, 880 - cy);
      box(760, 300, 1020, 460, 16, '#fff', '#d0d7de', 3); txt('Create status badge', 790, 345, 32, '#24292f', {}); badgeSvg(900, 420, 1.2, 'check', 'passing', '#2ea44f');
      box(790, 480, 960, 110, 10, '#f6f8fa', '#d0d7de', 2); txt('![check](https://github.com/dafeiyu/baifan/', 810, 515, 22, '#24292f', { font: F_CODE, bold: false }); txt('actions/workflows/check.yml/badge.svg)', 810, 555, 22, '#24292f', { font: F_CODE, bold: false });
      ghButton(790, 630, 460, 64, 'Copy status badge Markdown', OKC, { fs: 22, press: t >= cp && t < cp + 0.2 }); if (t >= cp) note(1500, 662, popIn(t, cp + 0.1), '贴进 README', '#16a5c9', { fs: 32 });
      ctx.restore(); }
    ctx.restore(); } }
  if (t >= g2) { const a = eOut(prog(t, g2, 0.3)); ctx.save(); ctx.globalAlpha = a;
    box(760, 160, 1020, 620, 20, '#fff', '#d0d7de', 3); box(760, 160, 1020, 70, [20, 20, 0, 0], '#f6f8fa', '#d0d7de', 2); txt('📖 README.md', 790, 196, 30, '#24292f', {});
    txt('🍚 白饭页', 800, 320, 64, '#24292f', { font: F_FANCY, bold: false });
    const bad = t >= P('G07_02', 0.45) && t < P('G07_02', 0.8); const fl = flipText(t, [[-1, 'p'], [P('G07_02', 0.45), 'f'], [P('G07_02', 0.8), 'p']]);
    ctx.save(); ctx.translate(1000, 430); ctx.scale(1, fl.sc); badgeSvg(0, 0, 1.8, 'check', fl.s === 'f' ? 'failing' : 'passing', fl.s === 'f' ? '#cb2431' : '#2ea44f'); ctx.restore();
    txt(bad ? '❌ 失败 → 变红' : '✅ 通过 → 绿色', 1260, 430, 36, bad ? BADC : LIVEC, {});
    txt('每天推荐一道盖饭', 800, 560, 32, '#57606a', { bold: false }); for (let i = 0; i < 2; i++) box(800, 620 + i * 50, 600 - i * 140, 20, 10, '#eaeef2');
    ctx.restore(); if (t >= P('G07_02', 0.85) && t < E('G07_02') + 0.3) fancy('访客一眼就知道！', 1270, 880, 64, t, P('G07_02', 0.85), FX.blue); }
  guest(t, blk);
  if (t >= P('B02', 0.5)) stamp(t, P('B02', 0.5), 1180, 520, '放心点赞！', '#16a5c9', 86, -0.12);
};
SFX_FNS.push(() => { guestSfx(['B02']); const b = BK.badge; sfx(b.t0 + 0.05, 'pop', 0.4); sfx(P('G07_01', 0.3), 'click', 0.6); sfx(P('G07_01', 0.42), 'pop', 0.3); sfx(P('G07_01', 0.55), 'pop', 0.5); sfx(P('G07_01', 0.86), 'click', 0.6);
  sfx(S('G07_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G07_02', 0.45), 'buzz', 0.5); sfx(P('G07_02', 0.8), 'ding', 0.5); sfx(P('G07_02', 0.85), 'sparkle', 0.4); sfx(P('B02', 0.5), 'stamp', 0.7); });

// ---- 复习：写 · 看 · 管 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const cards = [['✍️ 写', ACC, ['.github/workflows/', 'on · jobs · steps', '缩进只用空格'], 'G08_01'], ['👀 看', OKC, ['🟡 正在跑', '✅ 通过', '❌ 点进去看日志'], 'G08_02'], ['🛠️ 管', '#e07a3d', ['PR 前自动检查', '定时按 UTC', '密钥放 Secrets'], 'G08_03']];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.1, 0.4); if (s <= 0) return; const act = t >= S(c[3]) - 0.1 && (i === 2 || t < S(cards[i + 1][3]) - 0.1);
    const x = 870 + i * 400, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= S(c[3]) - 0.1 ? 1 : 0.5;
    if (act) { ctx.shadowColor = c[1]; ctx.shadowBlur = 40; } box(-180, -300, 360, 600, 28, '#fffaf0', c[1], 8); ctx.shadowBlur = 0;
    box(-180, -300, 360, 100, [28, 28, 0, 0], c[1]); txt(c[0], 0, -248, 46, '#fff', { align: 'center', font: F_FANCY, bold: false });
    const n = c[2].length;
    c[2].forEach((l, k) => { const a = clamp(prog(t, P(c[3], 0.08 + k * (0.8 / n)), 0.25)); ctx.save(); ctx.globalAlpha *= 0.25 + 0.75 * a; box(-150, -170 + k * 140, 300, 110, 16, '#fff', '#e4dff5', 3); txt(l, 0, -170 + k * 140 + 55, 26, '#1b1433', { align: 'center', font: /[\u4e00-\u9fff]/.test(l) ? F_BODY : F_CODE, max: 280 }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= P('G08_03', 0.8)) fancy('写 · 看 · 管，自动挂机！', 1270, 880, 58, t, P('G08_03', 0.8), FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2].forEach(i => sfx(BK.recap.t0 + 0.1 + i * 0.1, 'pop', 0.3)); ['G08_01', 'G08_02', 'G08_03'].forEach(id => { for (let k = 0; k < 3; k++) sfx(P(id, 0.08 + k * (0.8 / 3)), 'ding', 0.25); }); sfx(P('G08_03', 0.8), 'sparkle', 0.5); });

// ---- 实战：白饭页装上自动检查 ----
const L_PRAC = () => [
  { s: 'name: 白饭页检查', t: P('G09_01', 0.12), dur: 0.25 }, { s: 'on: [push, pull_request]', t: P('G09_01', 0.22), dur: 0.3, hl: [P('G09_01', 0.22), P('G09_01', 0.5)] },
  { s: 'jobs:', t: P('G09_01', 0.3), dur: 0.1 }, { s: '  check:', t: P('G09_01', 0.34), dur: 0.15 }, { s: '    runs-on: ubuntu-latest', t: P('G09_01', 0.4), dur: 0.3 },
  { s: '    steps:', t: P('G09_01', 0.48), dur: 0.15 }, { s: '      - uses: actions/checkout@v7', t: P('G09_01', 0.55), dur: 0.35, hl: [P('G09_01', 0.55), P('G09_01', 0.75)] },
  { s: '      - run: npx --yes html-validate index.html', t: P('G09_01', 0.72), dur: 0.45, hl: [P('G09_01', 0.75), E('G09_01') + 0.2] },
];
SC.practice = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  const red = P('G09_02', 0.55), fixT = S('G09_03'), okT = P('G09_03', 0.45), pgT = P('G09_03', 0.7), bt = P('G09_04', 0.2), bdg = P('G09_04', 0.55);
  const steps = [['check.yml', S('G09_01')], ['push', S('G09_02')], ['❌ 日志', red], ['修好', fixT], ['✅ 部署', okT], ['徽章', S('G09_04')]];
  const end = S('D11') - 0.2;
  steps.forEach((s, i) => {
    const a = popIn(t, blk.t0 + 0.15 + i * 0.06); if (a <= 0) return;
    const x = 790 + i * 200, y = 88; const act = t < end && t >= s[1] && (i === 5 || t < steps[i + 1][1]); const done = t >= end || (i < 5 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1));
    box(-90, -32, 180, 64, 18, act ? '#ff7a3d' : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act && !/^[✓✅❌]/.test(s[0]) ? '✓ ' : '') + s[0], 0, 2, 22, '#fff', { align: 'center', font: /[\u4e00-\u9fff]/.test(s[0]) ? F_BODY : F_CODE, max: 170 }); ctx.restore();
  });
  const ta = eOut(prog(t, blk.t0, 0.3));
  if (t < fixT) ymlEditor(t, 660, 160, 700, 700, '.github/workflows/check.yml', L_PRAC(), { fs: 20, accent: '#ff7a3d', alpha: ta });
  else { const fx = P('G09_03', 0.15);
    ymlEditor(t, 660, 160, 700, 700, 'index.html', [{ s: '<body>', t: -1, row: 8 }, { s: '  <h1>🍚 白饭页</h1>', t: -1, row: 9 }, { s: '  <main>', t: -1, row: 10 },
      { s: '  <div class="dish">番茄炒蛋盖饭' + (t >= fx ? '</div>' : ''), t: -1, row: 11, bad: t < fx, good: t >= fx, vcol: '#ffd27a' }, { s: '  </main>', t: -1, row: 12 }, { s: '</body>', t: -1, row: 13 }], { fs: 24, accent: '#ff7a3d', alpha: 1, rowOff: 7 });
    if (t < fx + 0.8) note(1010, 700, popIn(t, fixT + 0.05), '补上 </div>', '#7cf07a', { fs: 34 }); }
  ctx.save(); ctx.globalAlpha = ta;
  box(1380, 160, 500, 700, 20, '#fff', '#d0d7de', 3); box(1380, 160, 500, 66, [20, 20, 0, 0], '#f6f8fa', '#d0d7de', 2); txt('▶ Actions', 1404, 194, 28, '#24292f', {});
  const r1 = P('G09_02', 0.25); const rows = [];
  if (t >= P('G09_03', 0.3)) rows.push(['补上结束标签', t >= okT ? 1 : 0, prog(t, P('G09_03', 0.3), 0.2), 'push · check', '19s', t >= okT && t < pgT + 0.5]);
  if (t >= pgT) rows.unshift(['pages deploy', 1, prog(t, pgT, 0.2), '自动部署', '41s']);
  if (t >= r1) rows.push(['准备自动检查', t >= red ? 2 : 0, prog(t, r1, 0.2), 'push · check', '18s', t >= red && t < fixT]);
  runList(t, 1396, 246, 468, rows, { fs: 22, rh: 88 });
  if (t >= P('G09_02', 0.7) && t < fixT) { ctx.save(); ctx.globalAlpha *= clamp(prog(t, P('G09_02', 0.7), 0.25)); box(1396, 360, 468, 120, 10, '#0d1117', '#30363d', 2); txt('index.html', 1416, 392, 20, '#c9d1d9', { font: F_CODE, bold: false }); txt('12:5 error Unclosed "div"', 1416, 440, 22, '#ff7b72', { font: F_CODE }); ctx.restore(); }
  if (t >= S('G09_04')) { ghButton(1580, 640, 280, 56, 'Run workflow ▾', '#f6f8fa', { fg: '#24292f', border: '#d0d7de', fs: 22, press: t >= bt && t < bt + 0.2, glow: t >= bt && t < bt + 0.5 ? 1 : 0 });
    if (t >= bdg) { box(1400, 720, 460, 120, 14, '#fff', '#d0d7de', 2); txt('📖 README', 1420, 750, 24, '#24292f', {}); badgeSvg(1630, 800, 1.1 * popIn(t, bdg, 0.4), 'check', 'passing', '#2ea44f'); if (t < bdg + 1) sparkle(t, bdg, 1630, 800, 140, 8); } }
  ctx.restore();
  if (t >= S('G09_05') && t < end) pill(1270, 960 - 60, '🔔 推坏了？红叉马上提醒', '#ffd23f', popIn(t, P('G09_05', 0.1)), { fs: 36, font: F_BODY });
  if (t < S('G09_01') + 0.6) fancy('实战开始！', 1280, 500, 110, t, blk.t0 + 0.2, Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_robot', 1620, H + 30, 860, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    const bs = popIn(t, end + 0.05, 0.4); ctx.save(); ctx.translate(1050, 420); ctx.scale(bs, bs); ctx.rotate(-0.04); ctx.translate(-1050, -420);
    const c2 = siteWin(760, 160, 580, 470, 'dafeiyu.github.io/baifan', { ufs: 22 }); baifanPage(1050, c2 + 10, 540, { badge: true }); ctx.restore();
    fancy('有检查机器人了！', 1050, 780, 84, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 6; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(b.t0 + 0.2, 'impact', 0.6); L_PRAC().forEach(l => typeSfx(l.t, [...l.s].length, l.dur));
  sfx(P('G09_02', 0.25), 'pop', 0.4); sfx(P('G09_02', 0.55), 'buzz', 0.6); sfx(P('G09_02', 0.7), 'pop', 0.3); sfx(S('G09_03'), 'swoosh_in', 0.4); typeSfx(P('G09_03', 0.15), 6, 0.2); sfx(P('G09_03', 0.3), 'pop', 0.4); sfx(P('G09_03', 0.45), 'ding', 0.6); sfx(P('G09_03', 0.7), 'sparkle', 0.4);
  sfx(P('G09_04', 0.2), 'click', 0.6); sfx(P('G09_04', 0.55), 'sparkle', 0.5); sfx(P('G09_05', 0.1), 'pop', 0.4); const end = S('D11') - 0.2; sfx(end, 'impact', 0.6); sfx(end + 0.4, 'confetti', 0.6); });

// ---- 预告（变基 rebase）+ 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#2088ff');
  const outro = E('G10_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G10_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G10_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G10_01', 0.1), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 470); ctx.scale(bp, bp); ctx.translate(-1260, -470);
      box(860, 250, 800, 420, 24, '#ffffff', '#2088ff', 6); box(860, 250, 800, 70, [24, 24, 0, 0], '#24292f'); txt('git log --graph', 900, 286, 30, '#fff', { font: F_CODE });
      const sp = eIO(prog(t, P('G10_01', 0.55), 0.6)); const mess = [[930, 420], [1050, 560], [1130, 380], [1270, 600], [1390, 400], [1560, 540]];
      const lab = ['wip', '修bug', '再修', '真修好了', '改错字', 'wip2'];
      const pts = mess.map((m, i) => [lerp(m[0], 940 + i * 128, sp), lerp(m[1], 470, sp)]);
      ctx.strokeStyle = sp > 0.99 ? '#2ea44f' : '#ff8a9a'; ctx.lineWidth = 8; ctx.beginPath(); pts.forEach((p, i) => { const a = prog(t, P('G10_01', 0.15 + i * 0.05), 0.2); if (a > 0) i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke();
      pts.forEach((p, i) => { const s = popIn(t, P('G10_01', 0.15 + i * 0.05)); if (s <= 0) return; ctx.fillStyle = sp > 0.99 ? '#2ea44f' : '#ff5c8a'; ctx.beginPath(); ctx.arc(p[0], p[1], 20 * s, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke();
        txt(lab[i], p[0], p[1] + (i % 2 ? 50 : -48), 22, '#24292f', { align: 'center' }); });
      ctx.restore(); }
    [['git rebase', -520, 300, 0.35], ['变基', 520, 290, 0.5], ['整理提交历史', -500, 680, 0.62], ['✨ 干干净净', 510, 690, 0.72]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G10_01', c[3])), { fs: 34, font: /[\u4e00-\u9fff]/.test(c[0]) ? F_BODY : F_CODE }));
    fancy('乱成一团？捋成一条线！', 1260, 830, 76, t, P('G10_01', 0.75), FX.pink);
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
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_robot', 1690, H + 40, 640, { scale: sa }); }
      SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
    ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
    ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G10_01', 0.1), 'pop', 0.6); for (let i = 0; i < 6; i++) sfx(P('G10_01', 0.15 + i * 0.05), 'pop', 0.25); sfx(P('G10_01', 0.55), 'whoosh', 0.5); [0.35, 0.5, 0.62, 0.72].forEach(f => sfx(P('G10_01', f), 'pop', 0.3)); sfx(P('G10_01', 0.75), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G10_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G10_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_sparkle', P('G01_01', 0.82), E('G01_01')], ['d_think', P('G02_03', 0.55), E('G02_03')], ['d_relief', P('G03_03', 0.5), E('G03_03')],
  ['d_ok', P('G05_02', 0.7), E('G05_02')], ['d_sparkle', P('G06_02', 0.7), E('G06_02')],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));
