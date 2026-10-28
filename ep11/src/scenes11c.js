
// ---- 讲解⑤：密钥泄露急救（Claude）----
const L_LEAK = () => [{ s: 'git rm --cached .env', t: P('G06_03', 0.8), cmd: true, dur: 0.3 }];
SC.leak = (t, blk, en) => {
  bgLecture(t, BADC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G06_01'), g2 = S('G06_02') - 0.15, g3 = S('G06_03') - 0.15, g4 = U.C02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    ghWin(700, 120, 1140, 600, 'github.com/dafeiyu/rice-page/blob/main/config.js'); txt('🌍 Public', 1790, 210, 24, '#57606a', { align: 'right', font: EMOJI + ',' + F_CODE });
    box(740, 250, 1060, 70, 10, '#ffebe9', BADC, 3); txt('PAY_KEY = "sk_live_51Hx9aQ…7Qz"', 770, 286, 30, BADC, { font: F_CODE });
    for (let i = 0; i < 3; i++) { const tt = P('G06_01', 0.25 + i * 0.1), s = popIn(t, tt); if (s <= 0) continue; const x = lerp(1900, 900 + i * 320, eOut(prog(t, tt, 0.6)));
      txt('🤖', x, 480, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); magnifier(x + 40, 400 + Math.sin(t * 6 + i) * 10, 34, { rot: -0.4 }); }
    txt('自动扫描程序', 1270, 600, 30, '#57606a', { align: 'center' });
    if (t >= P('G06_01', 0.55)) { keyIcon(1560, 560, popIn(t, P('G06_01', 0.55)) * 1.1, BADC, { glow: true, rot: -0.3 }); stamp(t, P('G06_01', 0.6), 1270, 680, '就当已经泄露', BADC, 54, -0.06); }
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fadeW(t, g2, g3); ctx.save(); ctx.globalAlpha *= a;
    win(700, 120, 1140, 560, '💳 支付服务后台 · API 密钥', BADC);
    txt('第一步：作废旧密钥，换一把新的', 740, 230, 34, '#fff', {});
    const rv = P('G06_02', 0.4), nw = P('G06_02', 0.62);
    box(740, 290, 1060, 110, 16, '#fff', '#d0d7de', 3); keyIcon(800, 345, 0.45, t >= rv ? '#8c959f' : CLUE, { broken: t >= rv }); txt('sk_live_51Hx9aQ…7Qz', 880, 330, 30, t >= rv ? '#8c959f' : '#24292f', { font: F_CODE }); txt('旧密钥', 880, 370, 22, '#57606a', { bold: false });
    if (t >= rv) { ctx.fillStyle = '#8c959f'; ctx.fillRect(880, 328, 330 * eOut(prog(t, rv, 0.3)), 4); }
    ghBtn(1690, 345, t >= rv ? '已作废' : 'Revoke 作废', { fs: 26, w: 190, hot: t >= P('G06_02', 0.25) && t < rv, t, hc: BADC, bg: t >= rv ? '#f6f8fa' : '#fff', fg: BADC });
    if (t >= rv) stamp(t, rv + 0.05, 1440, 345, '作废', BADC, 50, -0.12);
    if (t >= nw) { const s = popIn(t, nw); ctx.save(); ctx.translate(1270, 480); ctx.scale(s, s); box(-530, -55, 1060, 110, 16, '#effaf3', GOODC, 4); keyIcon(-470, 0, 0.45, CLUE, { glow: true }); txt('sk_live_9Kq2mW…b2M', -390, -15, 30, '#24292f', { font: F_CODE }); txt('新密钥 ✓', -390, 25, 22, GOODC, {}); ctx.restore(); }
    if (t >= P('G06_02', 0.8)) note(1270, 620, popIn(t, P('G06_02', 0.8)), '旧的被翻到也没用', CLUE, { fs: 34 });
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    const F3 = [['🔒 .env', 'PAY_KEY=sk_live_9Kq2mW…b2M', LFSC, P('G06_03', 0.05)], ['📄 config.js', 'PAY_KEY = process.env.PAY_KEY', ORIC, P('G06_03', 0.25)], ['🙈 .gitignore', '.env', '#57606a', P('G06_03', 0.5)]];
    F3.forEach((c, i) => { const s = popIn(t, c[3], 0.4); if (s <= 0) return; const y = 170 + i * 150; ctx.save(); ctx.translate(1270, y); ctx.scale(s, s);
      box(-580, -60, 1160, 120, 18, '#1b1730', c[2], 5); txt(c[0], -550, 0, 32, '#fff', { font: EMOJI + ',' + F_CODE }); txt(c[1], -230, 0, 28, '#ffd27a', { font: F_CODE, max: 790 }); ctx.restore(); });
    if (t >= P('G06_03', 0.3)) { ctx.save(); ctx.setLineDash([10, 8]); seg(1700, 230, 1700, 290, CLUE, eOut(prog(t, P('G06_03', 0.3), 0.3)), 5); ctx.restore(); pill(1720, 260, '从环境变量读', CLUE, popIn(t, P('G06_03', 0.32)), { fs: 22 }); }
    terminal(t, 690, 590, 1160, 200, L_LEAK(), { title: '终端 — 已被跟踪的，移出仓库', accent: BADC, fs: 30, prompt: false });
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['C02']); sfx(S('G06_01') + 0.05, 'pop', 0.4); [0, 1, 2].forEach(i => sfx(P('G06_01', 0.25 + i * 0.1), 'whoosh', 0.3)); sfx(P('G06_01', 0.55), 'buzz', 0.5); sfx(P('G06_01', 0.6), 'stamp', 0.6);
  sfx(S('G06_02') - 0.15, 'swoosh_in', 0.4); sfx(P('G06_02', 0.4), 'impact', 0.4); sfx(P('G06_02', 0.4) + 0.05, 'stamp', 0.5); sfx(P('G06_02', 0.62), 'sparkle', 0.4); sfx(P('G06_02', 0.8), 'pop', 0.4);
  sfx(S('G06_03') - 0.15, 'swoosh_in', 0.4); [0.05, 0.25, 0.5].forEach(f => sfx(P('G06_03', f), 'pop', 0.4)); termSfx(L_LEAK()); });

// ---- 讲解⑥：清理历史（Kimi）----
const L_H2 = () => [{ s: 'git filter-repo --sensitive-data-removal \\', t: P('G07_02', 0.08), cmd: true, dur: 0.5 }, { s: '{c}    --invert-paths --path config.js', t: P('G07_02', 0.3) },
  { s: '{d}# 或者：只把密钥替换掉', t: P('G07_02', 0.55) }, { s: 'git filter-repo --sensitive-data-removal \\', t: P('G07_02', 0.62), cmd: true, dur: 0.4 }, { s: '{c}    --replace-text ../passwords.txt', t: P('G07_02', 0.78) }];
const L_H3 = () => [{ s: 'git push --force --mirror origin', t: P('G07_03', 0.08), cmd: true, dur: 0.45 }, { s: '{y} + 7c1e9a2...3f9a2c1 main -> main (forced update)', t: P('G07_03', 0.25) }];
const L_H4 = () => [{ s: 'git push', t: P('G07_04', 0.5), cmd: true, dur: 0.2 }, { s: '{r}remote: error: Push cannot contain secrets', t: P('G07_04', 0.62) }, { s: '{y}remote:   — 检测到密钥：config.js:3 —', t: P('G07_04', 0.68) }, { s: '{r} ! [remote rejected] main -> main', t: P('G07_04', 0.72) }];
SC.hist = (t, blk, en) => {
  bgLecture(t, HISC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G07_01'), g2 = S('G07_02') - 0.15, g3 = S('G07_03') - 0.15, g4 = S('G07_04') - 0.15, g5 = U.K02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    [['🔑', '旧密钥已作废', '很多时候，这就够了 ✓', GOODC, g1 + 0.1], ['🧹', '要彻底清掉', 'git filter-repo', HISC, P('G07_01', 0.55)]].forEach((c, i) => { const s = popIn(t, c[4], 0.45); if (s <= 0) return;
      const x = 980 + i * 620; ctx.save(); ctx.translate(x, 430); ctx.scale(s, s); ctx.rotate((i ? 1 : -1) * 0.03); box(-250, -270, 500, 540, 28, '#fffaf0', c[3], 8);
      if (i === 0) keyIcon(-60, -110, 1.2, '#8c959f', { broken: true }); else txt(c[0], 0, -110, 120, '#000', { align: 'center', font: EMOJI, bold: false });
      txt(c[1], 0, 40, 40, '#1b1433', { align: 'center' }); txt(c[2], 0, 130, 30, c[3], { align: 'center', font: i ? F_CODE : F_BODY + ',' + F_CODE }); ctx.restore(); });
    if (t >= P('G07_01', 0.55)) txt('或', 1290, 430, 48, '#fff', { align: 'center', font: F_FANCY, bold: false });
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fadeW(t, g2, g3); ctx.save(); ctx.globalAlpha *= a;
    terminal(t, 680, 110, 1180, 420, L_H2(), { title: '终端 — rice-page', accent: HISC, fs: 26, prompt: false });
    if (t >= P('G07_02', 0.3)) pill(1500, 590, '整个文件从历史里删掉', HISC, popIn(t, P('G07_02', 0.32)), { fs: 28 });
    if (t >= P('G07_02', 0.8)) { const s = popIn(t, P('G07_02', 0.8), 0.4); ctx.save(); ctx.translate(1270, 720); ctx.scale(s, s); box(-560, -70, 1120, 140, 18, '#fff', HISC, 5);
      txt('📄 passwords.txt', -530, -30, 22, '#57606a', { font: EMOJI + ',' + F_CODE }); txt('sk_live_51Hx9aQ…7Qz', -530, 20, 30, BADC, { font: F_CODE }); txt('→', 40, 20, 40, '#1b1433', { align: 'center' }); txt('***REMOVED***', 120, 20, 30, GOODC, { font: F_CODE }); ctx.restore(); }
    ctx.restore(); }
  if (t >= g3 - 0.1 && t < g4 + 0.3) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    terminal(t, 680, 110, 1180, 250, L_H3(), { title: '终端 — 覆盖远程', accent: '#d6283e', fs: 26, prompt: false });
    [['♻️', '所有人重新克隆', GOODC, P('G07_03', 0.4)], ['🔁', '旧分支用变基接上', GOODC, P('G07_03', 0.55)], ['⛔', '千万别合并', BADC, P('G07_03', 0.72)]].forEach((c, i) => { const s = popIn(t, c[3], 0.4); if (s <= 0) return;
      const x = 880 + i * 390; ctx.save(); ctx.translate(x, 580); ctx.scale(s, s); box(-180, -150, 360, 300, 24, i === 2 ? '#fff5f5' : '#effaf3', c[2], 6); txt(c[0], 0, -50, 80, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 0, 70, 30, '#1b1433', { align: 'center', max: 330 }); ctx.restore(); });
    if (t >= P('G07_03', 0.85)) note(1660, 790, popIn(t, P('G07_03', 0.85)), '合并会把旧历史带回来', BADC, { fs: 28 });
    ctx.restore(); }
  if (t >= g4 - 0.1) { const a = fadeW(t, g4, g5); ctx.save(); ctx.globalAlpha *= a;
    const s = popIn(t, g4 + 0.05, 0.4); ctx.save(); ctx.translate(1270, 210); ctx.scale(s, s); box(-580, -90, 1160, 180, 22, '#fff', '#57606a', 5);
    txt('📨 联系 GitHub Support', -540, -30, 36, '#1b1433', { font: EMOJI + ',' + F_CODE + ',' + F_BODY }); txt('清理旧 PR 里的缓存视图和引用', -540, 30, 28, '#57606a', { bold: false }); ctx.restore();
    pill(1270, 380, '🛡️ 推送保护（Push protection）', GOODC, popIn(t, P('G07_04', 0.45)), { fs: 34, font: EMOJI + ',' + F_BODY + ',' + F_CODE });
    terminal(t, 680, 430, 1180, 340, L_H4(), { title: '终端 — 又想推密钥？', accent: GOODC, fs: 26, prompt: false, alpha: clamp(prog(t, P('G07_04', 0.45), 0.25)) });
    if (t >= P('G07_04', 0.72)) stamp(t, P('G07_04', 0.72), 1640, 700, '直接拦下', GOODC, 52, -0.1);
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['K02']); sfx(S('G07_01') + 0.1, 'pop', 0.4); sfx(P('G07_01', 0.55), 'pop', 0.4);
  sfx(S('G07_02') - 0.15, 'swoosh_in', 0.4); termSfx(L_H2()); sfx(P('G07_02', 0.32), 'pop', 0.3); sfx(P('G07_02', 0.8), 'sparkle', 0.4);
  sfx(S('G07_03') - 0.15, 'swoosh_in', 0.4); termSfx(L_H3()); sfx(P('G07_03', 0.25), 'impact', 0.4); [0.4, 0.55].forEach(f => sfx(P('G07_03', f), 'ding', 0.35)); sfx(P('G07_03', 0.72), 'buzz', 0.4); sfx(P('G07_03', 0.85), 'pop', 0.3);
  sfx(S('G07_04') - 0.15, 'swoosh_in', 0.4); sfx(P('G07_04', 0.45), 'pop', 0.4); termSfx(L_H4()); sfx(P('G07_04', 0.62), 'buzz', 0.4); sfx(P('G07_04', 0.72), 'stamp', 0.6); });

// ---- 复习：瘦 · 齐 · 救 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const cards = [['🏃 瘦', SIZEC, ['大文件交给 Git LFS', 'migrate 搬走历史', '下载包放 Release'], 'G08_01'], ['📏 齐', EOLC, ['.gitattributes', '* text=auto', '只算真改动'], 'G08_02'], ['🚑 救', BADC, ['先作废、换新密钥', 'filter-repo 清历史', '强推 + 重新克隆'], 'G08_03']];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.1, 0.4); if (s <= 0) return; const act = t >= S(c[3]) - 0.1 && (i === 2 || t < S(cards[i + 1][3]) - 0.1);
    const x = 870 + i * 400, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= S(c[3]) - 0.1 ? 1 : 0.5;
    if (act) { ctx.shadowColor = c[1]; ctx.shadowBlur = 40; } box(-180, -300, 360, 600, 28, '#fffaf0', c[1], 8); ctx.shadowBlur = 0;
    box(-180, -300, 360, 100, [28, 28, 0, 0], c[1]); txt(c[0], 0, -248, 46, '#fff', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false });
    c[2].forEach((l, k) => { const a = clamp(prog(t, P(c[3], 0.12 + k * 0.25), 0.25)); ctx.save(); ctx.globalAlpha *= 0.25 + 0.75 * a; box(-150, -170 + k * 140, 300, 110, 16, '#fff', '#e4dff5', 3); txt(l, 0, -170 + k * 140 + 55, 25, '#1b1433', { align: 'center', max: 280, font: /^[.*a-z]/.test(l) ? F_CODE : F_BODY + ',' + F_CODE }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= P('G08_03', 0.8)) fancy('瘦 · 齐 · 救，仓库体检全绿！', 1270, 880, 56, t, P('G08_03', 0.8), FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2].forEach(i => sfx(BK.recap.t0 + 0.1 + i * 0.1, 'pop', 0.3)); ['G08_01', 'G08_02', 'G08_03'].forEach(id => { for (let k = 0; k < 3; k++) sfx(P(id, 0.12 + k * 0.25), 'ding', 0.25); }); sfx(P('G08_03', 0.8), 'sparkle', 0.5); });

// ---- 实战：白饭页全面体检 ----
const L_PR = () => [{ s: 'git count-objects -vH', t: P('G09_01', 0.08), cmd: true, dur: 0.35 }, { s: '{y}size-pack: 2.10 GiB   {r}← 元凶：design/ 文件夹', t: P('G09_01', 0.45) },
  { s: 'git lfs track "*.psd" && git add .gitattributes', t: P('G09_02', 0.05), cmd: true, dur: 0.5 }, { s: 'git lfs migrate import --include="*.psd" --everything', t: P('G09_02', 0.5), cmd: true, dur: 0.5 },
  { s: 'echo "* text=auto" >> .gitattributes', t: P('G09_03', 0.05), cmd: true, dur: 0.35 }, { s: 'git add --renormalize . && git commit -m "统一换行符"', t: P('G09_03', 0.4), cmd: true, dur: 0.5 },
  { s: '{p}后台：旧密钥已作废 ✓   新密钥 → .env', t: P('G09_04', 0.1) }, { s: 'git filter-repo --sensitive-data-removal --replace-text ../passwords.txt', t: P('G09_04', 0.4), cmd: true, dur: 0.6 },
  { s: 'git push --force --mirror origin', t: P('G09_04', 0.82), cmd: true, dur: 0.35 }, { s: 'git count-objects -vH', t: S('G09_05'), cmd: true, dur: 0.3 }, { s: '{g}size-pack: 12.0 MiB ✓', t: P('G09_05', 0.25) }];
SC.practice = (t, blk, en) => {
  bgLecture(t, GOODC); lecturer(t, blk, en, blk.t0);
  const steps = [['量体重', S('G09_01')], ['LFS', S('G09_02')], ['换行符', S('G09_03')], ['密钥', S('G09_04')], ['复查', S('G09_05')]];
  const end = S('D10') - 0.2;
  steps.forEach((s, i) => { const a = popIn(t, blk.t0 + 0.15 + i * 0.06); if (a <= 0) return;
    const x = 800 + i * 235, y = 88; const act = t < end && t >= s[1] && (i === 4 || t < steps[i + 1][1]); const done = t >= end || (i < 4 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1)); box(-105, -32, 210, 64, 18, act ? GOODC : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act ? '✓ ' : '') + s[0], 0, 2, 26, '#fff', { align: 'center', font: isCJK(s[0]) ? F_BODY : F_CODE, max: 190 }); ctx.restore(); });
  const ta = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha *= ta;
  box(670, 150, 1210, 290, 24, '#fff', DOCC, 5); txt('🩺 体检报告 · dafeiyu/rice-page', 700, 190, 26, DOCC, { font: EMOJI + ',' + F_BODY + ',' + F_CODE });
  const thin = t >= P('G09_05', 0.25);
  const R = [['⚖️', '体重', thin ? '12 MB' : '2.1 GB', thin], ['🐘', '大文件', t >= P('G09_02', 0.8) ? '已进 LFS' : '12 个', t >= P('G09_02', 0.8)], ['↩️', '换行符', t >= P('G09_03', 0.7) ? '统一' : '乱', t >= P('G09_03', 0.7)], ['🔑', '密钥', t >= P('G09_04', 0.7) ? '已清除' : '泄露', t >= P('G09_04', 0.7)]];
  R.forEach((r, i) => checkRow(700 + (i % 2) * 585, 230 + Math.floor(i / 2) * 95, 560, r[0], r[1], r[2], r[3], 1));
  terminal(t, 670, 460, 1210, 440, L_PR(), { title: '终端 — rice-page', accent: GOODC, fs: 22, prompt: false });
  if (thin && t < end) stamp(t, P('G09_05', 0.3), 1700, 845, '克隆 3 秒', GOODC, 44, -0.1);
  ctx.restore();
  if (t < S('G09_01') + 0.6) fancy('实战开始！', 1280, 500, 110, t, blk.t0 + 0.2, Object.assign({ wobble: 3 }, FX.orange));
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_medal', 1620, H + 30, 900, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    const s = popIn(t, end + 0.05, 0.4); ctx.save(); ctx.translate(1000, 380); ctx.scale(s, s); box(-300, -230, 600, 460, 26, '#fff', GOODC, 7); txt('🩺 体检报告', 0, -175, 38, DOCC, { align: 'center', font: EMOJI + ',' + F_BODY });
    [['⚖️', '体重', '12 MB'], ['🐘', '大文件', 'LFS'], ['↩️', '换行符', '统一'], ['🔑', '密钥', '已清除']].forEach((r, i) => checkRow(-260, -120 + i * 84, 520, r[0], r[1], r[2], true, 1)); ctx.restore();
    stamp(t, end + 0.4, 1330, 120, '全部通过 ✓', GOODC, 60, -0.1);
    fancy('仓库瘦身成功！', 980, 720, 96, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 5; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(b.t0 + 0.2, 'impact', 0.6); termSfx(L_PR());
  sfx(P('G09_01', 0.45), 'buzz', 0.3); sfx(P('G09_02', 0.8), 'ding', 0.4); sfx(P('G09_03', 0.7), 'ding', 0.4); sfx(P('G09_04', 0.1), 'pop', 0.3); sfx(P('G09_04', 0.7), 'ding', 0.4);
  sfx(P('G09_05', 0.25), 'impact', 0.5); sfx(P('G09_05', 0.3), 'stamp', 0.5); sfx(P('G09_05', 0.3) + 0.1, 'sparkle', 0.5);
  const e = S('D10') - 0.2; sfx(e, 'swoosh_in', 0.5); sfx(e + 0.4, 'stamp', 0.7); sfx(e + 0.3, 'sparkle', 0.6); sfx(e + 0.4, 'confetti', 0.6); });

// ---- 预告 + 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#5f3dc4');
  const outro = E('G10_02') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G10_02;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G10_02'), 0.3);
  if (ot < 1) {
    fancy('下集预告', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G10_01', 0.08), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 480); ctx.scale(bp, bp); ctx.translate(-1260, -480);
      box(860, 230, 800, 500, 24, '#ffffff', '#5f3dc4', 6);
      txt('🎓 毕业篇', 900, 285, 38, '#5f3dc4', { font: EMOJI + ',' + F_BODY });
      [['🛡️', '分支保护', 'main 不能直接推', P('G10_01', 0.2)], ['🏷️', '打标签发版本', 'git tag v1.0 · Release', P('G10_01', 0.38)], ['👥', '团队协作流程', '分支 → PR → 审查 → 合并', P('G10_01', 0.55)]].forEach((c, i) => { const s = popIn(t, c[3]); if (s <= 0) return; ctx.save(); ctx.translate(1260, 380 + i * 115); ctx.scale(s, s);
        box(-360, -50, 720, 100, 16, '#f6f8fa', '#5f3dc4', 3); txt(c[0], -320, 0, 50, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], -260, -16, 30, '#24292f', {}); txt(c[2], -260, 26, 22, '#5f3dc4', { font: F_CODE + ',' + F_BODY, bold: false }); ctx.restore(); });
      ctx.restore(); }
    [['branch protection', -540, 300, 0.25], ['git tag', 470, 280, 0.4], ['Release', -500, 720, 0.5], ['团队流程', 470, 730, 0.6]].forEach(c => pill(1260 + c[1], c[2], c[0], '#ffd23f', popIn(t, P('G10_01', c[3])), { fs: 32, font: isCJK(c[0]) ? F_BODY : F_CODE }));
    fancy('十二集串成一条线！', 1260, 850, 66, t, P('G10_01', 0.78), FX.pink);
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
    fancy('一键三连，毕业典礼见！', W / 2, 180, 92, t, S('G10_02') + 1.4, { stagger: 0.04 });
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
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G10_01', 0.08), 'pop', 0.6); [0.2, 0.38, 0.55].forEach(f => sfx(P('G10_01', f), 'pop', 0.4));
  [0.25, 0.4, 0.5, 0.6].forEach(f => sfx(P('G10_01', f), 'pop', 0.3)); sfx(P('G10_01', 0.78), 'ding', 0.5); [0, 1, 2].forEach(k => sfx(S('G10_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G10_02') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸（每个都对应一个知识点）=================
const CAMEOS = [
  ['d_heavy', P('G02_01', 0.82), E('G02_01')], ['d_sparkle', P('G04_03', 0.78), E('G04_03')],
  ['d_panic', P('G06_01', 0.6), E('G06_01')], ['d_ok', P('G07_01', 0.2), P('G07_01', 0.5)],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));
