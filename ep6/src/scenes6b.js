// ---- 讲解①：开启 Pages（Claude：公开、不放密钥）----
SC.pages = (t, blk, en) => {
  bgLecture(t, PGC); lecturer(t, blk, en, blk.t0);
  const g5 = S('G02_05') - 0.15, g6 = S('G02_06') - 0.15;
  const sa = 1 - eIO(prog(t, g5, 0.3));
  if (sa > 0) {
    const st = { hi: t >= P('G02_01', 0.55), src: t >= P('G02_02', 0.12) ? 'Deploy from a branch' : null, srcHot: t >= P('G02_02', 0.05) && t < P('G02_02', 0.35),
      br: t >= P('G02_02', 0.42) ? 'main' : null, brHot: t >= P('G02_02', 0.35) && t < P('G02_02', 0.6), dirHot: (t >= P('G02_02', 0.6) && t < P('G02_02', 0.82)) || (t >= S('G02_03') && t < E('G02_03')),
      dir: t >= S('G02_03') + 0.1 && t < P('G02_03', 0.9) ? '/docs' : '/ (root)', docs: t >= S('G02_03') && t < P('G02_03', 0.9) ? prog(t, S('G02_03'), 0.2) : 0,
      saved: t >= P('G02_02', 0.86), press: t >= P('G02_02', 0.86) && t < P('G02_02', 0.86) + 0.2, live: prog(t, P('G02_04', 0.4), 0.3) };
    ctx.save(); ctx.globalAlpha = sa; const ss = popIn(t, blk.t0 + 0.05, 0.4);
    ctx.translate(1270, 480); ctx.scale(ss, ss); ctx.translate(-1270, -480);
    settingsPage(t, 680, 120, 1180, 740, st);
    if (t >= P('G02_01', 0.55) && t < S('G02_02')) { const p = eOut(prog(t, P('G02_01', 0.55), 0.3)); txt('👆', 850, 650 + (1 - p) * 60, 64, '#000', { font: EMOJI, bold: false }); }
    if (t >= P('G02_02', 0.86) && t < S('G02_03')) txt('👆', 1600, 740, 64, '#000', { font: EMOJI, bold: false });
    ctx.restore();
    if (t >= S('G02_01') && t < P('G02_01', 0.55)) note(1270, 940, popIn(t, S('G02_01')), '什么都不用装 · 免费', PGC, { fs: 38 });
    if (t >= P('G02_04', 0.45) && t < g5) { sparkle(t, P('G02_04', 0.45), 1400, 360, 260, 12); fancy('网站上线！', 1300, 880, 70, t, P('G02_04', 0.45), FX.green); }
  }
  const c1 = S('C01') - 0.3;
  if (t >= g5 && t < c1 + 0.3) { // 网址格式（Claude 开口前退场）
    const a = eOut(prog(t, g5, 0.3)) * (1 - prog(t, c1, 0.3)); ctx.save(); ctx.globalAlpha = a;
    txt('网址格式', 1270, 200, 46, '#fff', { align: 'center', font: F_FANCY, bold: false });
    urlParts(1270, 340, popIn(t, g5 + 0.1, 0.4), [['用户名', '#ffd23f', ''], ['.github.io', '#ece9f7', ''], ['/仓库名', '#7cf07a', '']], 60);
    urlParts(1270, 560, popIn(t, P('G02_05', 0.5), 0.4), [['dafeiyu', '#ffd23f', '用户名'], ['.github.io', '#ece9f7'], ['/baifan', '#7cf07a', '仓库名']], 60);
    ctx.restore();
  }
  if (t >= g6) { // 静态网页：能放 / 不能放
    const a = eOut(prog(t, g6, 0.3)); ctx.save(); ctx.globalAlpha = a;
    txt('✅ 能放：静态网页', 760, 230, 44, '#7cf07a', {});
    [['📄', 'HTML', '#ff7a3d'], ['🎨', 'CSS', '#3ec1ff'], ['⚙️', 'JavaScript', '#ffd23f']].forEach((c, i) => fileChip(860 + i * 330, 340, 0.85 * popIn(t, P('G02_06', 0.2 + i * 0.08)), c[0], c[1], c[2]));
    txt('❌ 跑不了：后台', 760, 520, 44, '#ff6b81', {});
    [['🔐', '登录', 0.6], ['🗄️', '数据库', 0.68]].forEach((c, i) => { const s = popIn(t, P('G02_06', c[2])); if (s <= 0) return; fileChip(900 + i * 380, 630, 0.85 * s, c[0], c[1], '#ff3b5c'); bigX(900 + i * 380, 630, 40, '#ff3b5c', prog(t, P('G02_06', c[2]) + 0.2, 0.3)); });
    ctx.restore();
  }
  guest(t, blk);
  if (t >= P('C01', 0.45) && t < E('C01') + 0.2) { note(1150, 330, popIn(t, P('C01', 0.15)), '🌐 仓库要公开', '#e07a3d', { fs: 40 }); note(1150, 470, popIn(t, P('C01', 0.6)), '🔑 密码密钥 ✗', '#ff3b5c', { fs: 40 }); }
  if (t >= P('C02', 0.5)) stamp(t, P('C02', 0.5), 1180, 520, '可以上线 ✓', '#22c08b', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['C01', 'C02']); const b = BK.pages; sfx(b.t0 + 0.05, 'swoosh_in', 0.4); sfx(P('G02_01', 0.55), 'click', 0.6);
  [0.12, 0.42].forEach(f => sfx(P('G02_02', f), 'click', 0.5)); sfx(P('G02_02', 0.86), 'click', 0.7); sfx(S('G02_03'), 'pop', 0.4); sfx(P('G02_04', 0.4), 'ding', 0.6); sfx(P('G02_04', 0.45), 'sparkle', 0.5);
  sfx(S('G02_05') - 0.05, 'swoosh_in', 0.4); sfx(P('G02_05', 0.5), 'pop', 0.5); sfx(S('G02_06') - 0.15, 'swoosh_in', 0.4); [0.2, 0.28, 0.36].forEach(f => sfx(P('G02_06', f), 'pop', 0.3)); [0.6, 0.68].forEach(f => sfx(P('G02_06', f) + 0.2, 'buzz', 0.3));
  sfx(P('C01', 0.15), 'pop', 0.4); sfx(P('C01', 0.6), 'buzz', 0.4); sfx(P('C02', 0.5), 'stamp', 0.7); });

// ---- 讲解②：首页必须叫 index.html ----
const T_IDX = retime([
  { t: 0, s: 'git mv baifan.html index.html', cmd: true },
  { t: 0, s: 'git commit -m "首页改名 index.html"', cmd: true, dur: 0.6 },
  { t: 0, s: 'git push', cmd: true, dur: 0.3 },
  { t: 0, s: '{g}   main -> main' },
], [['G03_03', 0.3], ['G03_03', 0.55], ['G03_03', 0.7], ['G03_03', 0.78]]);
SC.index = (t, blk, en) => {
  bgLecture(t, '#e0485e'); lecturer(t, blk, en, blk.t0);
  const rn = P('G03_03', 0.3), bad = t >= S('G03_02') && t < rn;
  const nm = flipText(t, [[-1, 'baifan.html'], [rn, 'index.html']]);
  fileTree(700, 150, 560, [[nm.s, bad ? 'bad' : t >= rn ? 'good' : '', null, nm.s, nm.sc], ['style.css', ''], ['img/', '']], { col: '#e0485e', root: '根目录 /(root)' });
  // 放大镜：Pages 在找 index.html
  const ms = popIn(t, P('G03_01', 0.15), 0.4); if (ms > 0 && t < S('G03_03')) { const mx = 1500 + Math.sin(t * 2.4) * 60, my = 300 + Math.cos(t * 1.8) * 30;
    ctx.save(); ctx.translate(mx, my); ctx.scale(ms, ms); txt('🔍', 0, 0, 120, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore();
    note(1560, 450, popIn(t, P('G03_01', 0.3)), '找：index.html', '#ffd23f', { fs: 36 }); }
  if (t >= P('G03_01', 0.6) && t < S('G03_02')) note(980, 560, popIn(t, P('G03_01', 0.6)), '全小写 · 放最外层', '#ffd23f', { fs: 36 });
  if (bad) { const s = popIn(t, P('G03_02', 0.55), 0.4); if (s > 0) { const cy = siteWin(1100, 500, 560, 380, 'dafeiyu.github.io/baifan', { ufs: 20 }); page404(1380, cy - 10, 0.75 * s); } }
  if (t >= S('G03_03') - 0.1) {
    terminal(t, 690, 560, 760, 300, T_IDX, { fs: 24, title: '终端', accent: '#e0485e', alpha: eOut(prog(t, S('G03_03') - 0.1, 0.3)) });
    const ok = P('G03_03', 0.85); if (t >= ok) { const s = popIn(t, ok, 0.45); ctx.save(); ctx.translate(1660, 680); ctx.scale(s, s); ctx.translate(-1660, -680); const cy = siteWin(1470, 520, 380, 320, 'github.io/baifan', { ufs: 18 }); baifanPage(1660, cy + 6, 350); ctx.restore(); }
  }
  guest(t, blk);
  if (t >= P('Q02', 0.4)) stamp(t, P('Q02', 0.4), 1180, 520, '打开了 ✓', '#22c08b', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['Q02']); sfx(P('G03_01', 0.15), 'pop', 0.5); sfx(P('G03_01', 0.3), 'pop', 0.3); sfx(P('G03_01', 0.6), 'ding', 0.4); sfx(S('G03_02'), 'buzz', 0.5); sfx(P('G03_02', 0.55), 'impact', 0.5);
  sfx(P('G03_03', 0.3), 'click', 0.5); sfx(P('G03_03', 0.85), 'sparkle', 0.5); sfx(P('Q02', 0.4), 'stamp', 0.7); });

// ---- 讲解③：大小写 + 相对路径（Gemini 猫猫图）----
SC.path = (t, blk, en) => {
  bgLecture(t, '#a66bff'); lecturer(t, blk, en, blk.t0);
  const g3 = S('G04_03') - 0.15, a1 = 1 - prog(t, g3, 0.3);
  if (a1 > 0) { ctx.save(); ctx.globalAlpha = a1;
    fileChip(980, 230, popIn(t, blk.t0 + 0.1), '🖼️', 'Cat.png', '#a66bff'); txt('文件', 980, 150, 30, '#c9c3dd', { align: 'center' });
    const cs = popIn(t, blk.t0 + 0.2); if (cs > 0) { ctx.save(); ctx.translate(1560, 230); ctx.scale(cs, cs); box(-290, -46, 580, 92, 16, '#0f0c1f', '#a66bff', 5); txt('<img src="cat.png">', 0, 2, 32, '#ece9f7', { align: 'center', font: F_CODE }); ctx.restore(); }
    txt('代码', 1560, 150, 30, '#c9c3dd', { align: 'center' });
    const hc = P('G04_01', 0.55); if (t >= hc) { const p = eOut(prog(t, hc, 0.3)); ctx.save(); ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = 7;
      ctx.font = `bold 34px ${F_CODE}`; const fw = ctx.measureText('Cat.png').width + 120, cw = ctx.measureText('C').width; const cx1 = 980 - fw / 2 + 88 + cw / 2;
      ctx.font = `bold 32px ${F_CODE}`; const sw2 = ctx.measureText('<img src="cat.png">').width, pre = ctx.measureText('<img src="').width, cw2 = ctx.measureText('c').width; const cx2 = 1560 - sw2 / 2 + pre + cw2 / 2;
      ctx.beginPath(); ctx.ellipse(cx1, 228, 26, 34, 0, 0, p * 7); ctx.stroke(); ctx.beginPath(); ctx.ellipse(cx2, 232, 22, 30, 0, 0, p * 7); ctx.stroke(); ctx.restore();
      fancy('C ≠ c', 1270, 360, 80, t, hc + 0.1, FX.red); }
    const g2 = S('G04_02') - 0.1; if (t >= g2) {
      [['💻 你的电脑', 'Cat = cat', '#7cf07a', '✓'], ['🌐 网站服务器', 'Cat ≠ cat', '#ff6b81', '✗']].forEach((c, i) => { const s = popIn(t, i ? P('G04_02', 0.35) : g2, 0.4); if (s <= 0) return; ctx.save(); ctx.translate(960 + i * 500, 640); ctx.scale(s, s);
        box(-230, -150, 460, 300, 26, 'rgba(255,255,255,0.08)', c[2], 6); txt(c[0], 0, -90, 40, '#fff', { align: 'center' }); txt(c[1], 0, 10, 52, c[2], { align: 'center', font: F_CODE }); txt(c[3], 0, 100, 60, c[2], { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); });
      if (t >= P('G04_02', 0.7)) fancy('差一个字母就找不到！', 1220, 880, 58, t, P('G04_02', 0.7), FX.yel);
    }
    ctx.restore();
  }
  if (t >= g3) { // 网站目录：/img 跑到最外层
    const a = eOut(prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a;
    box(700, 140, 1160, 470, 24, 'rgba(255,255,255,0.06)', '#8f8aa8', 4);
    txt('🌐 dafeiyu.github.io/', 740, 200, 36, '#ffd23f', { font: F_CODE });
    txt('📁 img/  ← 这里没有！', 800, 290, 32, '#ff9aa9', { font: F_CODE });
    txt('📁 baifan/   ← 你的项目网站', 800, 380, 32, '#9dffbf', { font: F_CODE });
    txt('📁 img/cat.png', 880, 460, 32, '#ece9f7', { font: F_CODE }); txt('📄 index.html', 880, 530, 32, '#ece9f7', { font: F_CODE });
    const w1 = P('G04_03', 0.45); if (t >= w1 && t < S('G04_04')) { cmdBar(t, 1270, 700, 'src="/img/cat.png"', w1, 0.5, { fs: 34, col: '#ff3b5c' }); arrow(1040, 650, 1040, 320, '#ff3b5c', eOut(prog(t, w1 + 0.5, 0.4)), 10); if (t >= w1 + 0.8) bigX(1260, 290, 26, '#ff3b5c', prog(t, w1 + 0.8, 0.3)); }
    const w2 = S('G04_04'); if (t >= w2) { cmdBar(t, 1270, 700, 'src="img/cat.png"', w2 + 0.1, 0.5, { fs: 34, col: '#7cf07a' }); arrow(1500, 650, 1180, 480, '#7cf07a', eOut(prog(t, w2 + 0.6, 0.4)), 10);
      if (t >= P('G04_04', 0.6)) fancy('相对路径：本地网上都能用', 1270, 870, 56, t, P('G04_04', 0.6), FX.green); }
    ctx.restore();
  }
  guest(t, blk);
  if (t >= P('M02', 0.45)) { const s = popIn(t, P('M02', 0.45), 0.4); ctx.save(); ctx.translate(1100, 480); ctx.scale(s, s); box(-150, -120, 300, 240, 20, '#fff3d6', '#a66bff', 6); txt('🐱', 0, 6, 150, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore(); sparkle(t, P('M02', 0.45), 1100, 480, 200, 10); }
};
SFX_FNS.push(() => { guestSfx(['M02']); const b = BK.path; sfx(b.t0 + 0.1, 'pop', 0.4); sfx(b.t0 + 0.2, 'pop', 0.4); sfx(P('G04_01', 0.55), 'buzz', 0.5); sfx(S('G04_02') - 0.1, 'pop', 0.4); sfx(P('G04_02', 0.35), 'pop', 0.4); sfx(P('G04_02', 0.7), 'ding', 0.4);
  sfx(S('G04_03') - 0.15, 'swoosh_in', 0.4); const w1 = P('G04_03', 0.45); cmdAt(w1, 'src="/img/cat.png"', 0.5); sfx(w1 + 0.8, 'buzz', 0.5); cmdAt(S('G04_04') + 0.1, 'src="img/cat.png"', 0.5); sfx(P('G04_04', 0.6), 'ding', 0.5); sfx(P('M02', 0.45), 'sparkle', 0.6); });

// ---- 讲解④：推送后要等部署（Grok：这是真的吗）----
SC.update = (t, blk, en) => {
  bgLecture(t, '#22a06b'); lecturer(t, blk, en, blk.t0);
  const steps = [['⬆', 'push'], ['🏗️', '构建'], ['🚀', '部署'], ['🌐', '上线']];
  const top = S('G05_02') - 0.15;
  const py = lerp(330, 190, eIO(prog(t, top, 0.35))), ps = lerp(1, 0.7, eIO(prog(t, top, 0.35)));
  const g3 = S('G05_03') - 0.15; const sfa = 1 - prog(t, g3, 0.3);
  if (sfa > 0) steps.forEach((s, i) => { const a = popIn(t, P('G05_01', 0.12 + i * 0.1)) * sfa; if (a <= 0) return; const x = 840 + i * 300;
    const lit = t >= P('G05_01', 0.15 + i * 0.12); ctx.save(); ctx.translate(x, py); ctx.scale(a * ps, a * ps);
    ctx.fillStyle = lit ? '#22c08b' : '#3a3358'; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = '#fff'; ctx.stroke();
    txt(s[0], 0, -10, 70, '#000', { align: 'center', font: EMOJI, bold: false }); txt(s[1], 0, 130, 36, '#fff', { align: 'center' }); ctx.restore();
    if (i) arrow(x - 300 + 100 * ps, py, x - 100 * ps, py, '#fff', prog(t, P('G05_01', 0.15 + i * 0.12) - 0.1, 0.25), 10); });
  if (t >= P('G05_01', 0.6) && t < top) { const s = popIn(t, P('G05_01', 0.6), 0.4); ctx.save(); ctx.translate(1290, 680); ctx.scale(s, s); box(-330, -90, 660, 180, 30, '#fff', '#22a06b', 7);
    txt('⏱', -250, 2, 80, '#000', { align: 'center', font: EMOJI, bold: false }); txt('一般几分钟', 40, -30, 46, '#1b1433', { align: 'center' }); txt('最长 ≈ 10 分钟', 40, 36, 40, '#cf222e', { align: 'center' }); ctx.restore(); }
  if (t >= top && t < g3 + 0.3) { const a = eOut(prog(t, top, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a;
    box(700, 330, 1160, 520, 20, '#ffffff', '#d0d7de', 3); box(700, 330, 1160, 70, [20, 20, 0, 0], '#f6f8fa', '#d0d7de', 2);
    txt('▶ Actions · All workflows', 730, 366, 30, '#24292f', {});
    const done = P('G05_02', 0.6);
    actionsList(t, 730, 430, 1100, [['pages build and deployment', t >= done ? 1 : 0, prog(t, top + 0.1, 0.2), 'main · 改标题', '58s'], ['pages build and deployment', 1, prog(t, top + 0.2, 0.2), 'main · 首页改名 index.html', '1m 3s'], ['pages build and deployment', 1, prog(t, top + 0.3, 0.2), 'main · 第一次上线', '1m 12s']]);
    ctx.restore(); if (t >= done) { sparkle(t, done, 775, 470, 120, 8); note(1640, 366, popIn(t, done), '绿勾 = 部署好了', '#22c08b', { fs: 36 }); } }
  if (t >= g3) { const a = eOut(prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a;
    const kt = P('G05_03', 0.55), pr = t >= kt && t < kt + 0.25;
    const cy = siteWin(700, 330, 640, 520, 'dafeiyu.github.io/baifan', { ufs: 22, reload: t >= kt ? prog(t, kt, 0.5) : 0 });
    baifanPage(1020, cy + 10, 600, { title: t >= kt + 0.4 ? '🍚 白饭页 · 新标题' : '🍚 白饭页' });
    note(1020, 280, popIn(t, P('G05_03', 0.1)), '浏览器缓存：还是旧的', '#ffd23f', { fs: 32 });
    keycap(1490, 560, popIn(t, P('G05_03', 0.4)), 'Ctrl', { press: pr }); txt('+', 1600, 560, 70, '#fff', { align: 'center', font: F_FANCY, bold: false }); keycap(1710, 560, popIn(t, P('G05_03', 0.45)), 'F5', { press: pr });
    if (t >= kt + 0.2) fancy('强制刷新！', 1600, 730, 70, t, kt + 0.2, FX.green);
    ctx.restore(); }
  guest(t, blk);
  if (t >= P('X02', 0.6)) stamp(t, P('X02', 0.6), 1180, 520, '是真的 ✓', '#22c08b', 80, -0.12);
};
SFX_FNS.push(() => { guestSfx(['X02']); for (let i = 0; i < 4; i++) sfx(P('G05_01', 0.12 + i * 0.1), 'pop', 0.35); sfx(P('G05_01', 0.6), 'ding', 0.4);
  sfx(S('G05_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G05_02', 0.6), 'ding', 0.6); sfx(S('G05_03') - 0.15, 'swoosh_in', 0.4); sfx(P('G05_03', 0.4), 'pop', 0.3); sfx(P('G05_03', 0.55), 'click', 0.7); sfx(P('G05_03', 0.55) + 0.2, 'whoosh', 0.4); sfx(P('X02', 0.6), 'stamp', 0.7); });

// ---- 讲解⑤：下划线文件夹 / .nojekyll（Kimi 读文档）----
const T_JEK = retime([
  { t: 0, s: 'git mv _img img', cmd: true, dur: 0.4 },
  { t: 0, clear: true },
  { t: 0, s: '{d}# 或者：根目录放一个空文件' },
  { t: 0, s: 'touch .nojekyll', cmd: true, dur: 0.4 },
  { t: 0, s: 'git add .nojekyll', cmd: true, dur: 0.4 },
], [['G06_01', 0.45], ['G06_02', 0.0], ['G06_02', 0.05], ['G06_02', 0.3], ['G06_02', 0.5]]);
SC.jekyll = (t, blk, en) => {
  bgLecture(t, '#34407a'); lecturer(t, blk, en, blk.t0);
  const g2 = S('G06_02'), rn = P('G06_01', 0.55), nj = P('G06_02', 0.35);
  const opt2 = t >= g2 - 0.1;
  const nm = opt2 ? { s: '_img/', sc: 1 } : flipText(t, [[-1, '_img/'], [rn, 'img/']]);
  const rows = [['index.html', ''], ['style.css', ''], [nm.s, opt2 ? (t >= nj ? 'good' : 'bad') : (t >= rn ? 'good' : 'bad'), null, nm.s, nm.sc], ['   cat.png', (!opt2 && t < rn) || (opt2 && t < nj) ? 'ghost' : '']];
  if (opt2) rows.unshift(['.nojekyll', t >= nj ? 'good' : '', prog(t, nj - 0.05, 0.3)]);
  fileTree(700, 140, 540, rows, { col: '#6b7cff' });
  pill(1560, 200, opt2 ? '办法②：加 .nojekyll' : '办法①：改名', opt2 ? '#7cf07a' : '#ffd23f', popIn(t, opt2 ? g2 - 0.1 : S('G06_01')), { fs: 36, font: F_BODY });
  terminal(t, 1280, 290, 590, 300, T_JEK, { fs: 24, title: '终端', accent: '#6b7cff', alpha: eOut(prog(t, S('G06_01'), 0.3)) });
  if (opt2 && t >= nj) { const s = popIn(t, nj + 0.2); if (s > 0) { ctx.save(); ctx.translate(1580, 720); ctx.scale(s, s); box(-90, -110, 180, 220, 14, '#fff', '#1b1433', 6); txt('空', 0, 0, 60, '#c9c3dd', { align: 'center', font: F_FANCY, bold: false }); ctx.restore(); } note(1580, 880, popIn(t, P('G06_02', 0.7)), '原样发布 · 不做处理', '#7cf07a', { fs: 32 }); }
  if (!opt2 && t >= rn + 0.3) fancy('别用 _ 开头', 1580, 760, 70, t, rn + 0.3, FX.yel);
  guest(t, blk);
  if (t >= P('K02', 0.5)) stamp(t, P('K02', 0.5), 1180, 520, '改名 或 .nojekyll', '#6b7cff', 64, -0.1);
};
SFX_FNS.push(() => { guestSfx(['K02']); sfx(S('G06_01'), 'pop', 0.4); sfx(P('G06_01', 0.55), 'click', 0.5); sfx(P('G06_01', 0.55) + 0.3, 'ding', 0.4); sfx(S('G06_02') - 0.1, 'swoosh_in', 0.4); sfx(P('G06_02', 0.35), 'pop', 0.5); sfx(P('G06_02', 0.35) + 0.2, 'sparkle', 0.4); sfx(P('K02', 0.5), 'stamp', 0.6); });

// ---- 进阶：个人主页 + 自定义域名（豆包）----
SC.user = (t, blk, en) => {
  bgLecture(t, '#16a5c9'); lecturer(t, blk, en, blk.t0);
  const g2 = S('G07_02') - 0.15, g3 = S('G07_03') - 0.15;
  if (t < g2 + 0.3) { const a = 1 - prog(t, g2, 0.3); ctx.save(); ctx.globalAlpha = a;
    const cy = browser(700, 130, 1160, 420, 'github.com/new', { title: '新建仓库', accent: '#16a5c9' });
    txt('Create a new repository', 740, cy + 50, 34, '#24292f', {});
    const typ = 'dafeiyu.github.io'; const n = Math.floor(clamp(prog(t, P('G07_01', 0.2), 0.8)) * typ.length);
    inputBox(740, cy + 130, 620, 'Repository name', typ.slice(0, n), { focus: true, code: true, t });
    if (n >= typ.length) { txt('✓', 1390, cy + 160, 44, LIVEC, {}); }
    const us = popIn(t, P('G07_01', 0.7), 0.4); if (us > 0) { urlParts(1280, 720, us, [['dafeiyu.github.io', '#ffd23f', '个人主页 · 最短网址']], 66); }
    ctx.restore(); }
  if (t >= g2 && t < g3 + 0.3) { const a = eOut(prog(t, g2, 0.3)) * (1 - prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a;
    avatar('D', 820, 450, 80, { s: popIn(t, g2) }); txt('一个账号', 820, 580, 34, '#fff', { align: 'center' });
    const us = popIn(t, P('G07_02', 0.15)); if (us > 0) { arrow(920, 300, 1080, 250, '#ffd23f', us, 10); pill(1360, 240, '🏠 个人主页 ×1', '#ffd23f', us, { fs: 36, font: F_BODY }); txt('dafeiyu.github.io', 1360, 320, 30, '#ffd23f', { align: 'center', font: F_CODE }); }
    ['/baifan', '/notes', '/game'].forEach((r, i) => { const s = popIn(t, P('G07_02', 0.55 + i * 0.08)); if (s <= 0) return; arrow(920, 480 + i * 30, 1080, 460 + i * 120, '#7cf07a', s, 8); pill(1360, 460 + i * 120, '📦 项目网站  ' + r, '#7cf07a', s, { fs: 32, font: F_BODY }); });
    if (t >= P('G07_02', 0.8)) note(1360, 860, popIn(t, P('G07_02', 0.8)), '每个仓库都能开一个', '#7cf07a', { fs: 32 });
    ctx.restore(); }
  if (t >= g3) { const a = eOut(prog(t, g3, 0.3)); ctx.save(); ctx.globalAlpha = a;
    settingsPage(t, 680, 120, 1180, 760, { hi: true, src: 'Deploy from a branch', br: 'main', saved: true, live: 1, domain: 1, dval: 'baifan.com'.slice(0, Math.floor(clamp(prog(t, P('G07_03', 0.3), 0.5)) * 10)), dfocus: t < P('G07_03', 0.75), https: t >= P('G07_03', 0.8) });
    if (t >= P('G07_03', 0.82)) { txt('🔒', 1260, 820, 56, '#000', { align: 'center', font: EMOJI, bold: false }); fancy('自定义域名 + HTTPS', 1600, 780, 42, t, P('G07_03', 0.82), FX.blue); }
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['B02']); cmdAt(P('G07_01', 0.2), 'dafeiyu.github.io', 0.8); sfx(P('G07_01', 0.7), 'ding', 0.5); sfx(S('G07_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G07_02', 0.15), 'pop', 0.4); [0, 1, 2].forEach(i => sfx(P('G07_02', 0.55 + i * 0.08), 'pop', 0.3));
  sfx(S('G07_03') - 0.15, 'swoosh_in', 0.4); cmdAt(P('G07_03', 0.3), 'baifan.com', 0.5); sfx(P('G07_03', 0.8), 'click', 0.6); sfx(P('G07_03', 0.82), 'sparkle', 0.5); });
