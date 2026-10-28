
// ---- 讲解⑤：推标签自动发布（千问）----
const REL_YML = [['name: release', 'G06_02', 0.1], ['on:', 'G06_02', 0.18], ['  push:', 'G06_02', 0.24], ["    tags: ['v*']", 'G06_02', 0.3], ['permissions:', 'G06_04', 0.1], ['  contents: write', 'G06_04', 0.18], ['jobs:', 'G06_03', 0.05], ['  release:', 'G06_03', 0.09],
  ['    runs-on: ubuntu-latest', 'G06_03', 0.13], ['    steps:', 'G06_03', 0.17], ['      - uses: actions/checkout@v4', 'G06_03', 0.21], ['      - run: zip -r site.zip dist', 'G06_03', 0.27], ['      - run: gh release create "$GITHUB_REF_NAME" site.zip --generate-notes', 'G06_03', 0.4], ['        env:', 'G06_03', 0.5], ['          GH_TOKEN: ${{ github.token }}', 'G06_03', 0.54]];
SC.rel = (t, blk, en) => {
  bgLecture(t, RELC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G06_01'), g2 = S('G06_02') - 0.15, g5 = U.Q02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    const s1 = popIn(t, P('G06_01', 0.1)), s2 = popIn(t, P('G06_01', 0.42)), j = eIO(prog(t, P('G06_01', 0.72), 0.4));
    [[s1, '第5集', '🏷️', '标签 + Release', GOLD, 960], [s2, '第7集', '⚙️', 'GitHub Actions', CHKC, 1580]].forEach((c, i) => { if (c[0] <= 0) return; const x = lerp(c[5], i ? 1380 : 1160, j);
      ctx.save(); ctx.translate(x, 400); ctx.scale(c[0], c[0]); box(-200, -230, 400, 460, 28, '#fffaf0', c[4], 8); pill(0, -230, c[1], c[4], 1, { fs: 30, fg: '#fff', font: F_BODY });
      txt(c[2], 0, -60, 120, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[3], 0, 110, 34, '#1b1433', { align: 'center', font: isCJK(c[3]) ? F_BODY + ',' + F_CODE : F_CODE, max: 360 }); ctx.restore(); });
    if (t >= P('G06_01', 0.3) && j < 0.5) txt('+', 1270, 400, 120, '#fff', { align: 'center', font: F_FANCY, bold: false });
    if (j >= 1) fancy('接起来 = 自动发布！', 1270, 760, 72, t, P('G06_01', 0.72) + 0.4, FX.orange);
    ctx.restore(); }
  if (t >= g2 - 0.1) { const a = fadeW(t, g2, g5); ctx.save(); ctx.globalAlpha *= a;
    const L = REL_YML.map((r, i) => ({ s: r[0], t: P(r[1], r[2]), dur: 0.3, hl: i === 3 ? [P('G06_02', 0.4), S('G06_03')] : i === 5 ? [P('G06_04', 0.25), P('G06_04', 0.55)] : i === 12 ? [P('G06_03', 0.5), S('G06_04')] : null }));
    ymlEditor(t, 680, 110, 820, 700, '.github/workflows/release.yml', L, { fs: 21, accent: RELC });
    if (t >= P('G06_02', 0.45) && t < S('G06_03')) note(1090, 770, popIn(t, P('G06_02', 0.45)), '推送 v 开头的标签就运行', RELC, { fs: 28 });
    if (t >= P('G06_03', 0.65) && t < S('G06_04')) note(1090, 770, popIn(t, P('G06_03', 0.65)), '建 Release + 写说明 + 附文件', RELC, { fs: 28 });
    if (t >= P('G06_04', 0.3) && t < P('G06_04', 0.6)) note(1090, 770, popIn(t, P('G06_04', 0.3)), '给工作流写入权限', BADC, { fs: 28 });
    const pt = P('G06_04', 0.6); const rs = popIn(t, S('G06_03') + 0.2, 0.4);
    if (t >= pt) { cmdBar(t, 1090, 770, 'git push origin v2.0.0', pt, 0.6, { fs: 26, col: RELC }); }
    tagChip(1690, 200, popIn(t, P('G06_02', 0.35)) * 0.9, 'v2.0.0');
    const gp = popIn(t, P('G06_03', 0.2)); if (gp > 0) { ctx.save(); ctx.translate(1690, 360); ctx.scale(gp, gp); ctx.rotate(t * 2); txt('⚙️', 0, 0, 90, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore(); seg(1690, 240, 1690, 310, RELC, 1, 6); }
    if (rs > 0) { ctx.save(); ctx.translate(1690, 590); ctx.scale(rs, rs); box(-170, -160, 340, 320, 20, '#fff', RELC, 6); txt('📦 v2.0.0', -140, -120, 28, '#24292f', { font: EMOJI + ',' + F_CODE }); pill(110, -120, 'Latest', '#1f883d', 1, { fs: 20, fg: '#fff' });
      txt("What's Changed", -140, -60, 22, '#24292f', { font: F_CODE }); ['· 深色模式 #21', '· 修复按钮 #22'].forEach((l, i) => txt(l, -140, -20 + i * 36, 20, '#57606a', { bold: false, font: F_BODY + ',' + F_CODE }));
      txt('Assets', -140, 70, 22, '#24292f', { font: F_CODE }); txt('📎 site.zip', -140, 110, 22, '#0969da', { font: EMOJI + ',' + F_CODE }); ctx.restore(); seg(1690, 410, 1690, 430, RELC, 1, 6); }
    if (t >= pt + 0.7) { const p = eIO(prog(t, pt + 0.7, 0.6)); tagChip(lerp(1240, 1690, p), lerp(770, 200, p) - Math.sin(p * Math.PI) * 80, 0.6, 'v2.0.0'); if (p >= 1) stamp(t, pt + 1.3, 1690, 790, '自动发布 ✓', GOODC, 44, -0.08); }
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['Q02']); sfx(P('G06_01', 0.1), 'pop', 0.4); sfx(P('G06_01', 0.42), 'pop', 0.4); sfx(P('G06_01', 0.72), 'whoosh', 0.4); sfx(P('G06_01', 0.72) + 0.4, 'impact', 0.5);
  sfx(S('G06_02') - 0.15, 'swoosh_in', 0.4); REL_YML.forEach(r => typeSfx(P(r[1], r[2]), Math.min(20, r[0].length), 0.3)); sfx(P('G06_02', 0.35), 'pop', 0.4); sfx(P('G06_02', 0.45), 'ding', 0.35);
  sfx(P('G06_03', 0.2), 'pop', 0.3); sfx(S('G06_03') + 0.2, 'pop', 0.4); sfx(P('G06_03', 0.65), 'ding', 0.35); sfx(P('G06_04', 0.3), 'ding', 0.35);
  const pt = P('G06_04', 0.6); typeSfx(pt, 22, 0.6); sfx(pt + 0.7, 'whoosh', 0.4); sfx(pt + 1.3, 'stamp', 0.5); });

// ---- 讲解⑥：团队工作流七步（Kimi）----
const FLOW = [['📋', 'Issue 分任务', '#20', '第3集', 'G07_01', 0.2], ['🌿', '开分支', 'switch -c', '第3集', 'G07_01', 0.33], ['💾', '小步提交', 'commit', '第1集', 'G07_01', 0.45], ['🔀', '发 PR', 'Closes #20', '第3集', 'G07_01', 0.6],
  ['✅', '检查跑绿', 'Actions', '第7集', 'G07_02', 0.08], ['👀', '审查 + 合并', '删分支', '第12集', 'G07_02', 0.25], ['🏷️', '打标签发布', 'v2.0.0', '第5集', 'G07_02', 0.65]];
const FLOWXY = i => i < 4 ? [830 + i * 290, 220] : [1700 - (i - 4) * 290, 470];
SC.flow = (t, blk, en) => {
  bgLecture(t, FLOWC); lecturer(t, blk, en, blk.t0);
  const end = U.K02.vo - 0.3;
  ctx.save(); ctx.globalAlpha *= fadeW(t, S('G07_01') - 0.2, end);
  FLOW.forEach((f, i) => { const tt = P(f[4], f[5]), s = popIn(t, tt, 0.35); if (s <= 0) return; const [x, y] = FLOWXY(i);
    if (i) { const [px, py] = FLOWXY(i - 1); const p = clamp(prog(t, tt - 0.1, 0.25)); if (i === 4) { ctx.save(); ctx.strokeStyle = FLOWC; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(1700 + 60, 345, 125, -Math.PI / 2, -Math.PI / 2 + Math.PI * p); ctx.stroke(); ctx.restore(); }
      else seg(px + (i < 4 ? 120 : -120), py, px + (i < 4 ? 120 : -120) + (x - px + (i < 4 ? -240 : 240)) * p, y, FLOWC, 1, 8); }
    const act = t >= tt && (i === 6 || t < P(FLOW[i + 1][4], FLOW[i + 1][5]));
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.08 : 1), s * (act ? 1.08 : 1)); if (act) { ctx.shadowColor = FLOWC; ctx.shadowBlur = 30; }
    box(-120, -90, 240, 180, 22, '#fff', FLOWC, act ? 7 : 4); ctx.shadowBlur = 0; txt(String(i + 1), -96, -64, 30, FLOWC, { align: 'center', font: F_FANCY, bold: false });
    txt(f[0], 0, -38, 52, '#000', { align: 'center', font: EMOJI, bold: false }); txt(f[1], 0, 22, 27, '#1b1433', { align: 'center', font: F_BODY + ',' + F_CODE, max: 220 }); txt(f[2], 0, 58, 20, FLOWC, { align: 'center', font: F_CODE + ',' + F_BODY, max: 220 });
    ctx.restore(); pill(x + 80, y - 90, f[3], CLUE, popIn(t, tt + 0.15) * 0.75, { fs: 22, font: F_BODY }); });
  const g3 = S('G07_03') - 0.1;
  if (t >= g3) { [['💊', '后悔药', '第4集', 0.25], ['🔍', 'Git 侦探', '第9集', 0.45], ['🩺', '仓库体检', '第11集', 0.68]].forEach((c, i) => { const s = popIn(t, P('G07_03', c[3])); if (s <= 0) return; const x = 900 + i * 370;
      ctx.save(); ctx.translate(x, 700); ctx.scale(s, s); ctx.rotate((i - 1) * 0.03); box(-160, -70, 320, 140, 20, '#fff5f5', BADC, 5); txt(c[0], -105, 0, 60, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], 20, -18, 30, '#1b1433', { align: 'center' }); txt(c[2], 20, 26, 24, BADC, { align: 'center' }); ctx.restore(); });
    pill(1270, 610, '🧰 出岔子也不慌', BADC, popIn(t, g3 + 0.05), { fs: 28, fg: '#fff', font: F_BODY + ',' + EMOJI }); }
  ctx.restore();
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['K02']); FLOW.forEach(f => sfx(P(f[4], f[5]), 'pop', 0.35)); sfx(P('G07_02', 0.8), 'sparkle', 0.4); sfx(S('G07_03') - 0.1, 'swoosh_in', 0.4); [0.25, 0.45, 0.68].forEach(f => sfx(P('G07_03', f), 'pop', 0.4)); });

// ---- 复习：守 · 合 · 发 ----
SC.recap = (t, blk, en) => {
  bgLecture(t, ACC); lecturer(t, blk, en, blk.t0);
  const cards = [['🛡️ 守', RULEC, ['谁都不许绕过', 'PR 要批准 · 新提交作废', '检查不绿不合并'], 'G08_01'], ['🤝 合', MRGC, ['CODEOWNERS', '合并方式团队统一', '合完自动删分支'], 'G08_02'], ['🚀 发', RELC, ['推送 v 开头的标签', 'Actions 自动打包', '自动发 Release'], 'G08_03']];
  cards.forEach((c, i) => {
    const s = popIn(t, blk.t0 + 0.1 + i * 0.1, 0.4); if (s <= 0) return; const act = t >= S(c[3]) - 0.1 && (i === 2 || t < S(cards[i + 1][3]) - 0.1);
    const x = 870 + i * 400, y = 470; ctx.save(); ctx.translate(x, y); ctx.scale(s * (act ? 1.06 : 1), s * (act ? 1.06 : 1)); ctx.globalAlpha *= t >= S(c[3]) - 0.1 ? 1 : 0.5;
    if (act) { ctx.shadowColor = c[1]; ctx.shadowBlur = 40; } box(-180, -300, 360, 600, 28, '#fffaf0', c[1], 8); ctx.shadowBlur = 0;
    box(-180, -300, 360, 100, [28, 28, 0, 0], c[1]); txt(c[0], 0, -248, 46, '#fff', { align: 'center', font: F_FANCY + ',' + EMOJI, bold: false });
    c[2].forEach((l, k) => { const a = clamp(prog(t, P(c[3], 0.12 + k * 0.25), 0.25)); ctx.save(); ctx.globalAlpha *= 0.25 + 0.75 * a; box(-150, -170 + k * 140, 300, 110, 16, '#fff', '#e4dff5', 3); txt(l, 0, -170 + k * 140 + 55, 25, '#1b1433', { align: 'center', max: 280, font: /^[A-Z]{4}/.test(l) ? F_CODE : F_BODY + ',' + F_CODE }); ctx.restore(); });
    ctx.restore();
  });
  if (t >= P('G08_03', 0.8)) fancy('守 · 合 · 发，团队工作流到手！', 1270, 880, 54, t, P('G08_03', 0.8), FX.yel);
};
SFX_FNS.push(() => { [0, 1, 2].forEach(i => sfx(BK.recap.t0 + 0.1 + i * 0.1, 'pop', 0.3)); ['G08_01', 'G08_02', 'G08_03'].forEach(id => { for (let k = 0; k < 3; k++) sfx(P(id, 0.12 + k * 0.25), 'ding', 0.25); }); sfx(P('G08_03', 0.8), 'sparkle', 0.5); });

// ---- 实战：白饭页 2.0 团队发布 ----
const L_PR = () => [{ s: '{p}Settings → Rules：PR · 1 人批准 · check · 不许绕过 ✓', t: P('G09_01', 0.15) }, { s: '{p}.github/CODEOWNERS：/docs/ @claude   *.css @gemini ✓', t: P('G09_01', 0.65) },
  { s: 'git switch -c feat/dark-mode', t: P('G09_02', 0.3), cmd: true, dur: 0.35 }, { s: 'git commit -am "深色模式" && git push -u origin feat/dark-mode', t: P('G09_02', 0.5), cmd: true, dur: 0.5 }, { s: '{c}PR #21 已创建 · Closes #20', t: P('G09_02', 0.85) },
  { s: '{y}Gemini 推送新提交 → 旧批准作废，检查重跑', t: P('G09_03', 0.15) }, { s: '{g}✓ check 通过 · Claude approved', t: P('G09_03', 0.7) },
  { s: '{g}Squash and merge ✓  分支已删除  Issue #20 已关闭', t: P('G09_04', 0.3) },
  { s: 'git tag -a v2.0.0 -m "白饭页 2.0" && git push origin v2.0.0', t: P('G09_05', 0.12), cmd: true, dur: 0.55 }, { s: '{g}Actions: release ✓ → Release v2.0.0 已发布', t: P('G09_05', 0.6) }];
SC.practice = (t, blk, en) => {
  bgLecture(t, GOODC); lecturer(t, blk, en, blk.t0);
  const end = S('D10') - 0.2;
  stepBar(t, [['规则', S('G09_01')], ['Issue + PR', S('G09_02')], ['审查', S('G09_03')], ['合并', S('G09_04')], ['发布', S('G09_05')]], 800, 88, 235, end, { t0: blk.t0 + 0.15 });
  const ta = eOut(prog(t, blk.t0, 0.3)); ctx.save(); ctx.globalAlpha *= ta;
  box(670, 150, 1210, 300, 24, '#fff', '#d0d7de', 4); txt('🔀 #21 深色模式 · Closes #20', 700, 190, 28, '#24292f', { font: EMOJI + ',' + F_BODY + ',' + F_CODE });
  const g3 = S('G09_03'), dis = t >= P('G09_03', 0.12) && t < P('G09_03', 0.65), okR = t >= P('G09_03', 0.65), merged = t >= P('G09_04', 0.3);
  if (t < S('G09_02') + 0.5) txt('（还没有 PR）', 1275, 320, 34, '#c9ced6', { align: 'center' });
  else if (merged) { pill(1275, 300, '🟣 Merged · 分支已删除', MRGC, popIn(t, P('G09_04', 0.3)), { fs: 36, fg: '#fff', font: F_BODY + ',' + EMOJI + ',' + F_CODE }); txt('Issue #20 ✓ closed', 1275, 380, 26, '#8250df', { align: 'center', font: F_CODE }); }
  else { const rows = [[t < g3 ? 1 : dis ? 0 : 1, t < g3 || okR ? 'All checks have passed' : 'check 重跑中…', 'check · Actions'], [dis ? 2 : t < S('G09_02') + 1 ? 3 : 1, dis ? 'Approval dismissed（新提交）' : okR ? 'Approved by @claude（code owner）' : 'Approved by @claude', 'code owner']];
    rows.forEach((r, i) => { const y = 250 + i * 80; statusIcon(720, y + 20, 20, r[0] === 3 ? 0 : r[0], t); txt(r[1], 760, y + 8, 26, '#24292f', { font: F_CODE + ',' + F_BODY, max: 1060 }); txt(r[2], 760, y + 40, 20, '#57606a', { bold: false, font: F_CODE }); }); }
  terminal(t, 670, 470, 1210, 430, L_PR(), { title: '终端 — rice-page', accent: GOODC, fs: 22, prompt: false });
  ctx.restore();
  if (t < S('G09_01') + 0.6) fancy('毕业实战！', 1280, 500, 110, t, blk.t0 + 0.2, Object.assign({ wobble: 3 }, FX.orange));
  if (t >= P('G09_05', 0.35) && t < end) tagChip(1700, 820, popIn(t, P('G09_05', 0.35)), 'v2.0.0');
  if (t >= end) {
    ctx.fillStyle = `rgba(20,14,40,${0.72 * eOut(prog(t, end, 0.3))})`; ctx.fillRect(650, 40, 1280, 880);
    const p = spring(prog(t, end + 0.05, 0.8)); sprite('d_party', 1620, H + 30, 900, { scale: lerp(1.1, 1, p) * breath(t, 2) });
    const s = popIn(t, end + 0.05, 0.4); ctx.save(); ctx.translate(1000, 400); ctx.scale(s, s); box(-300, -230, 600, 460, 26, '#fff', RELC, 7);
    txt('📦 白饭页 v2.0.0', -260, -175, 36, '#24292f', { font: EMOJI + ',' + F_BODY + ',' + F_CODE }); pill(200, -175, 'Latest', '#1f883d', 1, { fs: 22, fg: '#fff' });
    [['🛡️', '规则', '不许绕过'], ['👀', '审查', 'Claude ✓'], ['✅', '检查', '全绿'], ['🏷️', '标签', 'v2.0.0']].forEach((r, i) => checkRow(-260, -120 + i * 84, 520, r[0], r[1], r[2], true, 1)); ctx.restore();
    stamp(t, end + 0.4, 1330, 120, '发布成功 ✓', GOODC, 60, -0.1);
    fancy('白饭页 2.0 上线！', 980, 740, 92, t, end + 0.3, FX.yel);
    confetti(t, end + 0.4, 90, 7, 1200, 450);
  }
};
SFX_FNS.push(() => { const b = BK.practice; for (let i = 0; i < 5; i++) sfx(b.t0 + 0.15 + i * 0.06, 'pop', 0.25); sfx(b.t0 + 0.2, 'impact', 0.6); termSfx(L_PR());
  sfx(P('G09_01', 0.15), 'ding', 0.3); sfx(P('G09_01', 0.65), 'ding', 0.3); sfx(P('G09_02', 0.85), 'pop', 0.4); sfx(P('G09_03', 0.12), 'buzz', 0.4); sfx(P('G09_03', 0.65), 'ding', 0.4);
  sfx(P('G09_04', 0.3), 'impact', 0.5); sfx(P('G09_04', 0.3) + 0.1, 'sparkle', 0.4); sfx(P('G09_05', 0.35), 'pop', 0.4); sfx(P('G09_05', 0.6), 'ding', 0.5);
  const e = S('D10') - 0.2; sfx(e, 'swoosh_in', 0.5); sfx(e + 0.4, 'stamp', 0.7); sfx(e + 0.3, 'sparkle', 0.6); sfx(e + 0.4, 'confetti', 0.6); });

// ---- 毕业典礼 ----
const EPWALL = [['存档读档', '💾'], ['云存档', '☁️'], ['联机协作', '🤝'], ['后悔药', '💊'], ['版本发布', '🏷️'], ['Pages', '🌐'], ['Actions', '⚙️'], ['变基', '✂️'], ['Git 侦探', '🔍'], ['参与开源', '🍴'], ['仓库体检', '🩺'], ['毕业篇', '🎓']];
const GRAD_SQ = ['Q03', 'C03', 'M03', 'X03', 'B03', 'K03'];
SC.grad = (t, blk, en) => {
  const t0 = blk.t0, d11 = U.D11.vo - 0.3; bgBurst(t, '#3d2a00', '#d4a017', W * 0.55, H * 0.45, 26, 0.15);
  sprite('g_grad', lerp(-400, 300, eBack(prog(t, t0, 0.5))), H + 120, 1100, { scale: breath(t, 0) });
  const wa = 1 - eIO(prog(t, d11, 0.35));
  if (wa > 0) { ctx.save(); ctx.globalAlpha *= wa; fancy('十二集，毕业啦！', 1280, 110, 72, t, t0 + 0.1, FX.yel);
    EPWALL.forEach((e, i) => { const s = popIn(t, P('G10_01', 0.05 + i * 0.045), 0.3); if (s <= 0) return; const x = 830 + (i % 4) * 290, y = 270 + Math.floor(i / 4) * 200;
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); box(-130, -80, 260, 160, 20, i === 11 ? '#fff3c4' : '#fff', i === 11 ? GOLD : ACC, i === 11 ? 7 : 4);
      txt(e[1], -78, 0, 52, '#000', { align: 'center', font: EMOJI, bold: false }); txt('第' + (i + 1) + '集', 40, -26, 22, ACC, { align: 'center' }); txt(e[0], 40, 18, 28, '#1b1433', { align: 'center', font: isCJK(e[0]) ? F_BODY + ',' + F_CODE : F_CODE, max: 150 }); ctx.restore(); });
    if (t >= P('G10_01', 0.75)) fancy('大肥鱼，你毕业了！', 1280, 880, 70, t, P('G10_01', 0.75), FX.pink);
    ctx.restore(); }
  if (t >= d11) {
    const p = spring(prog(t, d11, 0.8)); sprite('d_grad', 1060, H + 40, 940, { scale: lerp(1.15, 1, p) * breath(t, 2) });
    diploma(1560, 640, popIn(t, d11 + 0.4, 0.45) * 0.62, '大肥鱼', { rot: 0.05 });
    for (let i = 0; i < 5; i++) { const c0 = d11 + 0.5 + i * 0.12, u = prog(t, c0, 1.6); if (u > 0 && u < 1) capIcon(780 + i * 230, 900 - Math.sin(u * Math.PI) * 760, 0.6, { rot: t * 4 + i }); }
    confetti(t, d11 + 0.3, 110, 12, 1150, 300);
    GRAD_SQ.forEach((id, i) => { const e = U[id]; const k = id[0]; const s = popIn(t, d11 + 0.2 + i * 0.06); const x = 780 + i * 210, y = 110; const on = t >= e.vo - 0.15 && t < e.t1 + 0.25;
      avatar(k, x, y + (on ? 8 : 0), on ? 66 : 54, { s }); if (t >= e.vo - 0.15) { const bp = popIn(t, e.vo - 0.1, 0.3); if (on && bp > 0) pill(x, y + 110, TEXT[id], SQ[k].col, bp, { fs: 30, fg: '#fff', font: F_BODY }); } });
    if (t >= U.Q03.vo - 0.2) fancy('恭喜毕业！', 1060, 880, 90, t, U.Q03.vo - 0.2, FX.yel);
  }
};
SFX_FNS.push(() => { const b = BK.grad; sfx(b.t0 + 0.05, 'swoosh_in', 0.5); sfx(b.t0 + 0.1, 'sparkle', 0.4); for (let i = 0; i < 12; i++) sfx(P('G10_01', 0.05 + i * 0.045), 'pop', 0.18); sfx(P('G10_01', 0.75), 'ding', 0.5);
  const d = U.D11.vo - 0.3; sfx(d, 'impact', 0.6); sfx(d + 0.3, 'confetti', 0.6); sfx(d + 0.4, 'stamp', 0.5); for (let i = 0; i < 5; i++) sfx(d + 0.5 + i * 0.12, 'whoosh', 0.2);
  GRAD_SQ.forEach(id => sfx(U[id].vo - 0.1, 'pop', 0.35)); });

// ---- 完结 + 番外预告 + 三连 ----
SC.teaser = (t, blk, en) => {
  const st = blk.t0; bgStripes(t, '#5f3dc4');
  const outro = E('G10_03') + 0.2;
  const cur = en && en.k === 'v' ? en : U.G10_03;
  sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
  const ot = prog(t, S('G10_03'), 0.3);
  if (ot < 1) {
    fancy('正片完结！', 1260, 120, 92, t, st + 0.1, FX.white);
    const bp = popIn(t, P('G10_02', 0.3), 0.5);
    if (bp > 0) { ctx.save(); ctx.translate(1260, 480); ctx.scale(bp, bp); ctx.translate(-1260, -480);
      box(860, 230, 800, 500, 24, '#ffffff', '#5f3dc4', 6);
      txt('🎁 番外预告', 900, 285, 38, '#5f3dc4', { font: EMOJI + ',' + F_BODY });
      [['🔑', 'SSH 与多账号', '公司号 / 个人号不串', P('G10_02', 0.45)], ['🖱️', '图形界面工具', '不敲命令也能用 Git', P('G10_02', 0.62)], ['✨', '更多番外', '评论区点菜', P('G10_02', 0.78)]].forEach((c, i) => { const s = popIn(t, c[3]); if (s <= 0) return; ctx.save(); ctx.translate(1260, 380 + i * 115); ctx.scale(s, s);
        box(-360, -50, 720, 100, 16, '#f6f8fa', '#5f3dc4', 3); txt(c[0], -320, 0, 50, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[1], -260, -16, 30, '#24292f', { font: F_BODY + ',' + F_CODE }); txt(c[2], -260, 26, 22, '#5f3dc4', { font: F_BODY + ',' + F_CODE, bold: false }); ctx.restore(); });
      ctx.restore(); }
    fancy('敬请期待！', 1260, 850, 66, t, P('G10_02', 0.85), FX.pink);
  }
  if (ot > 0) {
    ctx.fillStyle = `rgba(10,8,22,${0.78 * ot})`; ctx.fillRect(...OS);
    [['👍', '点赞', '#ff5c8a'], ['🪙', '投币', '#ffd23f'], ['⭐', '收藏', '#3ec1ff']].forEach((ic, i) => {
      const a = popIn(t, S('G10_03') + 0.4 + i * 0.32, 0.4); if (a <= 0) return;
      const x = W / 2 + (i - 1) * 330, y = 440;
      ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(t * 5 + i) * 0.06);
      ctx.fillStyle = ic[2]; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.font = `110px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic[0], 0, 8); ctx.restore();
      fancy(ic[1], x, y + 180, 60, t, S('G10_03') + 0.5 + i * 0.32, { c1: '#fff', c2: '#eee', stroke: ic[2] });
    });
    fancy('一键三连，番外见！', W / 2, 180, 92, t, S('G10_03') + 1.4, { stagger: 0.04 });
    if (t > outro) {
      const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite('d_grad', 1690, H + 40, 640, { scale: sa }); }
      SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
    }
    ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
    ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
    ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
    ctx.restore();
  }
};
SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G10_02', 0.3), 'pop', 0.6); [0.45, 0.62, 0.78].forEach(f => sfx(P('G10_02', f), 'pop', 0.4)); sfx(P('G10_02', 0.85), 'ding', 0.5);
  [0, 1, 2].forEach(k => sfx(S('G10_03') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G10_03') + 1.4, 'confetti', 0.4); });

// ================= 大肥鱼反应贴纸（每个都对应一个知识点）=================
const CAMEOS = [
  ['d_shock', P('G02_03', 0.6), E('G02_03')], ['d_sparkle', P('G03_02', 0.8), E('G03_02')],
  ['d_ok', P('G05_02', 0.7), E('G05_02')], ['d_happy', P('G06_01', 0.85), E('G06_01')],
];
SFX_FNS.push(() => CAMEOS.forEach(c => sfx(c[1], 'boing', 0.3)));
