// ---- 复习：开 · 查 · 改 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, PGC); lecturer(t, blk, en, blk.t0);
  const cards = [['🚀 开', PGC, ['Settings → Pages', 'main + /(root)', 'Save'], 'G08_01'], ['🔍 查', '#e0485e', ['首页 index.html', '大小写一致', '相对路径', '_ 文件夹 → .nojekyll'], 'G08_02'], ['🔄 改', WEBC, ['push 自动部署', 'Actions 绿勾', 'Ctrl+F5 强制刷新'], 'G08_03']];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.1, 0.4); if (s <= 0) return; const act = t >= S(c[3]) - 0.1 && (i === 2 || t < S(cards[i + 1][3]) - 0.1);
    const x = 870 + i * 400, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= S(c[3]) - 0.1 ? 1 : 0.5;
    if (act) { ctx.shadowColor = c[1]; ctx.shadowBlur = 40; } box(-180, -300, 360, 600, 28, '#fffaf0', c[1], 8); ctx.shadowBlur = 0;
    box(-180, -300, 360, 100, [28, 28, 0, 0], c[1]); txt(c[0], 0, -248, 46, '#fff', { align: 'center', font: F_FANCY, bold: false });
    const n = c[2].length, gap = n > 3 ? 112 : 140, hh = n > 3 ? 92 : 110;
    c[2].forEach((l, k) => { const a = clamp(prog(t, P(c[3], 0.08 + k * (0.8 / n)), 0.25)); ctx.save(); ctx.globalAlpha *= 0.25 + 0.75 * a; box(-150, -170 + k * gap, 300, hh, 16, '#fff', '#e4dff5', 3); txt(l, 0, -170 + k * gap + hh / 2, 26, '#1b1433', { align: 'center', font: /[\u4e00-\u9fff]/.test(l) ? F_BODY : F_CODE, max: 280 }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= P('G08_03', 0.8)) fancy('开 · 查 · 改，网站就上线！', 1270, 880, 58, t, P('G08_03', 0.8), FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2].forEach(i => sfx(BK.recap.t0 + 0.1 + i * 0.1, 'pop', 0.3)); [['G08_01', 3], ['G08_02', 4], ['G08_03', 3]].forEach(([id, n]) => { for (let k = 0; k < n; k++) sfx(P(id, 0.08 + k * (0.8 / n)), 'ding', 0.25); }); sfx(P('G08_03', 0.8), 'sparkle', 0.5); });

// ---- 实战：白饭页上线 ----
const T_PRAC = retime([
  { t: 0, s: 'git mv baifan.html index.html', cmd: true, dur: 0.6 },
  { t: 0, s: 'git mv _img img', cmd: true, dur: 0.4 },
  { t: 0, s: '{d}# 路径改成 img/cat.png' },
  { t: 0, s: 'git commit -am "准备上线"', cmd: true, dur: 0.5 },
  { t: 0, s: 'git push', cmd: true, dur: 0.3 },
  { t: 0, s: '{g}   main -> main' },
  { t: 0, s: '{c}# Settings → Pages → main /(root) → Save' },
  { t: 0, s: '{g}✓ pages build and deployment' },
  { t: 0, s: 'git commit -am "今日推荐菜：咖喱饭"', cmd: true, dur: 0.6 },
  { t: 0, s: 'git push', cmd: true, dur: 0.3 },
  { t: 0, s: '{g}✓ pages build and deployment' },
], [['G09_01', 0.25], ['G09_01', 0.55], ['G09_01', 0.75], ['G09_02', 0.08], ['G09_02', 0.2], ['G09_02', 0.3], ['G09_02', 0.5], ['G09_03', 0.12], ['G09_04', 0.2], ['G09_04', 0.38], ['G09_04', 0.55]]);
SC.practice = (t, blk, en) => {
  bgLecture(t, '#ff7a3d'); lecturer(t, blk, en, blk.t0);
  const steps = [['index.html', S('G09_01')], ['img/', P('G09_01', 0.5)], ['push', S('G09_02')], ['Pages', P('G09_02', 0.45)], ['✓ 上线', S('G09_03')], ['更新', S('G09_04')]];
  const end = S('D10') - 0.2;
  steps.forEach((s, i) => {
    const a = popIn(t, blk.t0 + 0.15 + i * 0.06); if (a <= 0) return;
    const x = 790 + i * 200, y = 88; const act = t < end && t >= s[1] && (i === 5 || t < steps[i + 1][1]); const done = t >= end || (i < 5 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1));
    box(-90, -32, 180, 64, 18, act ? '#ff7a3d' : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act && !s[0].startsWith('✓') ? '✓ ' : '') + s[0], 0, 2, 22, '#fff', { align: 'center', font: /[\u4e00-\u9fff]/.test(s[0]) ? F_BODY : F_CODE, max: 170 }); ctx.restore();
  });
  const ta = eOut(prog(t, blk.t0, 0.3));
  terminal(t, 676, 160, 640, 700, T_PRAC, { alpha: ta, fs: 22, accent: '#ff7a3d', title: '终端 — 大肥鱼的电脑' });
  ctx.save(); ctx.globalAlpha = ta;
  const live = P('G09_03', 0.3), upd = P('G09_04', 0.6);
  const cy = siteWin(1340, 160, 540, 700, t >= live ? 'dafeiyu.github.io/baifan' : '（还没上线）', { ufs: 20, reload: t >= upd ? prog(t, upd, 0.5) : null });
  if (t < live) { txt('⏳', 1610, cy + 260, 120, '#000', { align: 'center', font: EMOJI, bold: false }); txt('等待部署…', 1610, cy + 400, 34, '#6b6488', { align: 'center' }); }
  else { const s = popIn(t, live, 0.4); ctx.save(); ctx.translate(1610, cy); ctx.scale(s, s); ctx.translate(-1610, -cy);
    baifanPage(1610, cy + 10, 500, { cat: 'ok', dish: flipText(t, [[-1, '番茄炒蛋盖饭'], [upd + 0.3, '咖喱饭 🍛']]).s }); ctx.restore();
    if (t < live + 1) sparkle(t, live, 1610, cy + 200, 220, 12); }
  if (t >= S('G09_05') && t < end) { const s = popIn(t, S('G09_05'), 0.4); ctx.save(); ctx.translate(1610, 760); ctx.scale(s, s); box(-120, -150, 240, 300, 34, '#1b1433', '#fff', 6); box(-100, -120, 200, 230, 10, '#fff'); txt('🍚', 0, -10, 90, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore(); note(1610, 560, popIn(t, P('G09_05', 0.3)), '📱 手机也能打开', '#ffd23f', { fs: 32 }); }
  ctx.restore();
  if (t < S('G09_01') + 0.6) fancy('实战开始！', 1280, 500, 110, t, blk.t0 + 0.2, Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_phone', 1600, H + 30, 860, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    const bs = popIn(t, end + 0.05, 0.4); ctx.save(); ctx.translate(1050, 420); ctx.scale(bs, bs); ctx.rotate(-0.04); ctx.translate(-1050, -420);
    const c2 = siteWin(760, 160, 580, 470, 'dafeiyu.github.io/baifan', { ufs: 22 }); baifanPage(1050, c2 + 10, 540, { cat: 'ok', dish: '咖喱饭 🍛' }); ctx.restore();
    fancy('白饭页，上线啦！', 1050, 780, 90, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 6; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(b.t0 + 0.2, 'impact', 0.6); sfx(P('G09_03', 0.3), 'sparkle', 0.6); sfx(P('G09_03', 0.3), 'ding', 0.5); sfx(P('G09_04', 0.6), 'whoosh', 0.4); sfx(P('G09_04', 0.6) + 0.3, 'ding', 0.4); sfx(S('G09_05'), 'pop', 0.5); const end = S('D10') - 0.2; sfx(end, 'impact', 0.6); sfx(end + 0.4, 'confetti', 0.6); });

// ---- 预告 + 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#2da44e');
  const outro = E('G10_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G10_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G10_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G10_01', 0.12), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 470); ctx.scale(bp, bp); ctx.translate(-1260, -470);
      box(860, 250, 800, 420, 24, '#ffffff', '#2da44e', 6); box(860, 250, 800, 70, [24, 24, 0, 0], '#24292f'); txt('▶ Actions', 900, 286, 32, '#fff', {});
      [['⬆', 'push', 0.2], ['✔', '检查', 0.35], ['🧪', '测试', 0.5], ['🚀', '部署', 0.62]].forEach((c, i) => { const s = popIn(t, P('G10_01', c[2])); if (s <= 0) return; const x = 960 + i * 200;
        ctx.save(); ctx.translate(x, 470); ctx.scale(s, s); ctx.fillStyle = i ? '#1f883d' : '#3e8ed0'; ctx.beginPath(); ctx.arc(0, 0, 66, 0, 7); ctx.fill(); txt(c[0], 0, -4, 54, i === 1 ? '#fff' : '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore();
        txt(c[1], x, 580, 32, '#24292f', { align: 'center' }); if (i) arrow(x - 130, 470, x - 72, 470, '#2da44e', s, 8); });
      ctx.restore(); }
    [['GitHub Actions', -520, 300, 0.35], ['自动检查', 520, 290, 0.5], ['自动测试', -500, 680, 0.62], ['🤖 自动部署', 510, 690, 0.72]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G10_01', c[3])), { fs: 34, font: /[\u4e00-\u9fff]/.test(c[0]) ? F_BODY : F_CODE }));
    fancy('push 一下，全自动！', 1260, 830, 84, t, P('G10_01', 0.75), FX.pink);
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
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_phone', 1690, H + 40, 640, { scale: sa }); }
      SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
    ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
    ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G10_01', 0.12), 'pop', 0.6); [0.2, 0.35, 0.5, 0.62].forEach(f => sfx(P('G10_01', f), 'pop', 0.35)); [0.35, 0.5, 0.62, 0.72].forEach(f => sfx(P('G10_01', f), 'pop', 0.3)); sfx(P('G10_01', 0.75), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G10_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G10_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸 =================
const CAMEOS = [
  ['d_sparkle', P('G02_04', 0.5), E('G02_04')], ['d_shock', P('G03_02', 0.6), E('G03_02')], ['d_relief', P('G04_02', 0.75), E('G04_02')],
  ['d_ok', P('G05_01', 0.75), E('G05_01')], ['d_sparkle', P('G07_02', 0.4), E('G07_02')],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));
