
// ---- 讲解①：量体重（千问）----
const L_SIZE = () => { const g2 = S('G02_02') - 0.15; return [{ s: 'git count-objects -vH', t: g2 + 0.15, cmd: true, dur: 0.45 }, { s: '{d}count: 0', t: P('G02_02', 0.3) }, { s: '{d}size: 0 bytes', t: P('G02_02', 0.33) },
  { s: 'in-pack: 2194', t: P('G02_02', 0.36) }, { s: 'packs: 1', t: P('G02_02', 0.39) }, { s: '{y}size-pack: 2.10 GiB', t: P('G02_02', 0.42), hl: [P('G02_02', 0.55), 1e9], hlc: CLUE },
  { s: '{d}prune-packable: 0', t: P('G02_02', 0.45) }, { s: '{d}garbage: 0', t: P('G02_02', 0.48) }]; };
SC.size = (t, blk, en) => {
  bgLecture(t, SIZEC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G02_01'), g2 = S('G02_02') - 0.15, g3 = S('G02_03') - 0.15, g4 = U.Q02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    box(680, 110, 1180, 640, 26, 'rgba(15,12,31,0.92)', '#fff', 5); txt('📜 每个提交都存一份完整的设计稿', 720, 170, 32, '#fff', { font: EMOJI + ',' + F_BODY });
    for (let i = 0; i < 10; i++) { const tt = P('G02_01', 0.3 + i * 0.045), s = popIn(t, tt), x = 760 + i * 112; if (s <= 0) continue;
      if (i) seg(x - 112, 270, x, 270, '#5a5580', clamp(s), 7); gDot(x, 270, s, ORIC, { r: 20 }); txt('v' + (i + 1), x, 318, 20, '#cfc8ef', { align: 'center', font: F_CODE });
      psdIcon(x, 420 + Math.sin(t * 3 + i) * 4, s * 0.85, { lab: '180MB', rot: (i % 2 ? 0.05 : -0.05) }); }
    if (t >= P('G02_01', 0.78)) { fancy('180 MB × 10 = 1.8 GB', 1270, 600, 74, t, P('G02_01', 0.78), FX.orange); }
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fadeW(t, g2, g3); ctx.save(); ctx.globalAlpha *= a;
    terminal(t, 680, 120, 760, 620, L_SIZE(), { title: '终端 — rice-page', accent: SIZEC, fs: 30, prompt: false });
    const s = popIn(t, P('G02_02', 0.6), 0.45); if (s > 0) { ctx.save(); ctx.translate(1660, 420); ctx.scale(s, s); box(-170, -200, 340, 400, 26, '#fffaf0', SIZEC, 7);
      txt('⚖️', 0, -90, 100, '#000', { align: 'center', font: EMOJI, bold: false }); txt('仓库体重', 0, 30, 38, '#1b1433', { align: 'center' }); txt('2.10 GiB', 0, 100, 44, BADC, { align: 'center', font: F_CODE }); ctx.restore(); }
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    box(680, 110, 1180, 640, 26, '#fff', SIZEC, 6); txt('📏 GitHub 的规矩', 720, 175, 38, '#1b1433', { font: EMOJI + ',' + F_BODY });
    const bx = 740, bw = 1060, by = 340; box(bx, by - 18, bw, 36, 18, '#eaeef2');
    const gp = eOut(prog(t, g3 + 0.1, 0.8)); const grd = ctx.createLinearGradient(bx, 0, bx + bw, 0); grd.addColorStop(0, '#2fbf71'); grd.addColorStop(0.45, '#ffd23f'); grd.addColorStop(0.75, '#ff6b35'); grd.addColorStop(1, BADC);
    ctx.save(); rr(bx, by - 18, bw * gp, 36, 18); ctx.fillStyle = grd; ctx.fill(); ctx.restore();
    txt('单个文件', bx, by - 50, 26, '#57606a', {});
    [[0.42, '50 MB', '⚠️ 警告', '#d4a72c', 0.15], [0.84, '100 MB', '⛔ 拒收', BADC, 0.42]].forEach(m => { if (t < P('G02_03', m[4])) return; const x = bx + bw * m[0], s = popIn(t, P('G02_03', m[4]));
      seg(x, by - 40, x, by + 40, m[3], 1, 6); ctx.save(); ctx.translate(x, by + 100); ctx.scale(s, s); box(-110, -42, 220, 84, 16, '#fff', m[3], 5); txt(m[1], 0, -14, 28, m[3], { align: 'center', font: F_CODE }); txt(m[2], 0, 20, 24, '#1b1433', { align: 'center', font: EMOJI + ',' + F_BODY }); ctx.restore(); });
    if (t >= P('G02_03', 0.4)) psdIcon(bx + bw * 0.97, by - 4, popIn(t, P('G02_03', 0.4)) * 0.7, { col: BADC });
    const rs = popIn(t, P('G02_03', 0.72), 0.45); if (rs > 0) { ctx.save(); ctx.translate(1270, 620); ctx.scale(rs, rs); box(-460, -70, 920, 140, 22, '#effaf3', GOODC, 5);
      txt('📦 整个仓库：最好别超过 1 GB', 0, 0, 40, '#1b1433', { align: 'center', font: EMOJI + ',' + F_BODY }); ctx.restore(); }
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['Q02']); for (let i = 0; i < 10; i++) sfx(P('G02_01', 0.3 + i * 0.045), 'pop', 0.18); sfx(P('G02_01', 0.78), 'impact', 0.5);
  sfx(S('G02_02') - 0.15, 'swoosh_in', 0.4); termSfx(L_SIZE()); sfx(P('G02_02', 0.55), 'ding', 0.4); sfx(P('G02_02', 0.6), 'pop', 0.4);
  sfx(S('G02_03') - 0.15, 'swoosh_in', 0.4); sfx(S('G02_03'), 'whoosh', 0.4); sfx(P('G02_03', 0.15), 'pop', 0.4); sfx(P('G02_03', 0.42), 'buzz', 0.4); sfx(P('G02_03', 0.72), 'ding', 0.4); });

// ---- 讲解②：删了没用（Grok）----
const L_DEL = () => [{ s: 'git rm --cached design/白饭页设计稿.psd', t: P('G03_02', 0.2), cmd: true, dur: 0.5 }, { s: "{d}rm 'design/白饭页设计稿.psd'", t: P('G03_02', 0.38) },
  { s: 'git commit --amend --no-edit', t: P('G03_02', 0.6), cmd: true, dur: 0.4 }, { s: '{g}[main 3f9a2c1] 首页样式（已不含设计稿）', t: P('G03_02', 0.78) }, { s: 'git push', t: P('G03_02', 0.86), cmd: true, dur: 0.2 }, { s: '{g}✓ main -> main', t: P('G03_02', 0.95) }];
SC.del = (t, blk, en) => {
  bgLecture(t, '#d6283e'); lecturer(t, blk, en, blk.t0);
  const g1 = S('G03_01'), g2 = S('G03_02') - 0.15, g3 = S('G03_03') - 0.15, g4 = U.X02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    box(680, 110, 1180, 640, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
    const C = [[820, '加设计稿', '+180 MB', BADC], [1100, '改样式', '', ORIC], [1380, '删设计稿', '−180 MB', ORIC]];
    C.forEach((c, i) => { const s = popIn(t, g1 + 0.1 + i * 0.15); if (i) seg(C[i - 1][0], 330, c[0], 330, '#5a5580', clamp(s), 8); gDot(c[0], 330, s, c[3], { r: 30, glow: i === 0 && t >= P('G03_01', 0.4), t });
      if (s > 0) { txt(c[1], c[0], 400, 28, '#fff', { align: 'center' }); if (c[2]) txt(c[2], c[0], 440, 24, i ? GOODC : '#ff8fa3', { align: 'center', font: F_CODE }); } });
    if (t >= P('G03_01', 0.4)) { psdIcon(820, 210, popIn(t, P('G03_01', 0.4)) * 0.8, { col: BADC }); note(820, 540, popIn(t, P('G03_01', 0.45)), '旧提交里还在！', BADC, { fs: 32 }); }
    if (t >= P('G03_01', 0.68)) { const p = eOut(prog(t, P('G03_01', 0.68), 0.5)); cloud(1700, 330, popIn(t, P('G03_01', 0.68)) * 0.8, '#57606a', 'GitHub');
      ctx.save(); ctx.setLineDash([16, 10]); seg(760, 620, lerp(760, 1600, p), 620, CLUE, 1, 8); ctx.restore(); pill(1180, 670, '推送 = 带上整段历史', CLUE, popIn(t, P('G03_01', 0.72)), { fs: 30 });
      if (p > 0.95) stamp(t, P('G03_01', 0.68) + 0.5, 1700, 470, '✗ 拒收', BADC, 50, -0.1); }
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fadeW(t, g2, g3); ctx.save(); ctx.globalAlpha *= a;
    pill(1270, 140, '🕐 还没推送', GOODC, popIn(t, g2 + 0.05), { fs: 38, font: EMOJI + ',' + F_BODY });
    box(680, 190, 1180, 170, 22, 'rgba(15,12,31,0.92)', '#fff', 4);
    gDot(800, 275, 1, ORIC, { r: 26 }); seg(800, 275, 1060, 275, '#5a5580', 1, 8);
    const am = P('G03_02', 0.6), rp = eOut(prog(t, am, 0.4));
    ctx.save(); ctx.globalAlpha *= 1 - rp * 0.7; gDot(1060, 275, 1, BADC, { r: 26 }); psdIcon(1160, 275, 0.6, { col: BADC }); ctx.restore();
    if (rp > 0) { seg(800, 275, 1060, 275, '#5a5580', 1, 8); gDot(1460, 275, rp, GOODC, { r: 30, glow: true, t }); ctx.save(); ctx.setLineDash([10, 8]); seg(1100, 275, lerp(1100, 1420, rp), 275, GOODC, 1, 6); ctx.restore(); txt('改写后的提交', 1460, 335, 24, GOODC, { align: 'center' }); txt('✗', 1060, 275, 56, '#fff', { align: 'center' }); }
    terminal(t, 680, 390, 1180, 400, L_DEL(), { title: '终端 — rice-page', accent: GOODC, fs: 25, prompt: false });
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    pill(1270, 140, '📤 早就推送过', BADC, popIn(t, g3 + 0.05), { fs: 38, font: EMOJI + ',' + F_BODY });
    box(680, 190, 1180, 420, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
    const rw = P('G03_03', 0.3), wp = clamp(prog(t, rw, 0.8));
    for (let i = 0; i < 7; i++) { const x = 770 + i * 165, nw = i >= 2 && wp * 7 > i - 1; if (i) seg(x - 165, 360, x, 360, '#5a5580', 1, 8);
      gDot(x, 360, popIn(t, g3 + 0.1 + i * 0.04), i === 2 && !nw ? BADC : nw ? '#ffd23f' : ORIC, { r: 26 }); if (nw) txt('′', x + 24, 330, 40, '#ffd23f', { font: F_CODE }); }
    if (t < rw + 0.3) psdIcon(1100, 250, popIn(t, g3 + 0.2) * 0.6, { col: BADC });
    if (t >= rw) { ctx.save(); ctx.globalAlpha *= 1 - prog(t, rw + 0.8, 0.3); const sx = lerp(1000, 1900, wp); ctx.fillStyle = 'rgba(255,210,63,0.25)'; ctx.fillRect(sx - 60, 210, 120, 380); ctx.restore(); note(1270, 520, popIn(t, rw + 0.4), '之后的提交全部换新编号', CLUE, { fs: 32 }); }
    [['git rebase -i（第8集）', P('G03_03', 0.4), 940], ['git filter-repo（后面讲）', P('G03_03', 0.7), 1560]].forEach(c => pill(c[2], 690, c[0], HISC, popIn(t, c[1]), { fs: 32, font: F_CODE + ',' + F_BODY }));
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['X02']); [0, 1, 2].forEach(i => sfx(S('G03_01') + 0.1 + i * 0.15, 'pop', 0.3)); sfx(P('G03_01', 0.4), 'buzz', 0.4); sfx(P('G03_01', 0.45), 'pop', 0.3); sfx(P('G03_01', 0.68), 'whoosh', 0.4); sfx(P('G03_01', 0.68) + 0.5, 'stamp', 0.5);
  sfx(S('G03_02') - 0.15, 'swoosh_in', 0.4); termSfx(L_DEL()); sfx(P('G03_02', 0.6), 'whoosh', 0.3); sfx(P('G03_02', 0.95), 'ding', 0.4);
  sfx(S('G03_03') - 0.15, 'swoosh_in', 0.4); sfx(P('G03_03', 0.3), 'whoosh', 0.5); sfx(P('G03_03', 0.4), 'pop', 0.4); sfx(P('G03_03', 0.7), 'pop', 0.4); });

// ---- 讲解③：Git LFS（豆包）----
const L_LFS1 = () => [{ s: 'git lfs install', t: P('G04_01', 0.32), cmd: true, dur: 0.3 }, { s: '{g}Git LFS initialized.', t: P('G04_01', 0.45) },
  { s: 'git lfs track "*.psd"', t: P('G04_01', 0.62), cmd: true, dur: 0.4 }, { s: '{g}Tracking "*.psd"', t: P('G04_01', 0.8) }];
const L_LFS2 = () => [{ s: 'git add .gitattributes', t: P('G04_02', 0.55), cmd: true, dur: 0.35 }, { s: 'git commit -m "用 LFS 管理设计稿"', t: P('G04_02', 0.72), cmd: true, dur: 0.4 }];
const L_LFS4 = () => [{ s: 'git lfs migrate import --include="*.psd" --everything', t: P('G04_04', 0.08), cmd: true, dur: 0.6 }, { s: '{d}migrate: Sorting commits: ..., done.', t: P('G04_04', 0.25) },
  { s: '{y}migrate: Rewriting commits: 100% (12/12), done.', t: P('G04_04', 0.3) }, { s: '{g}migrate: Updating refs: ..., done.', t: P('G04_04', 0.36) }];
SC.lfs = (t, blk, en) => {
  bgLecture(t, LFSC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G04_01'), g2 = S('G04_02') - 0.15, g3 = S('G04_03') - 0.15, g4 = S('G04_04') - 0.15, g5 = S('G04_05') - 0.15, g6 = U.B02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    const s = popIn(t, g1 + 0.05, 0.45); ctx.save(); ctx.translate(1270, 230); ctx.scale(s, s); box(-430, -90, 860, 180, 30, '#fff', LFSC, 7);
    txt('🐘', -330, 0, 100, '#000', { align: 'center', font: EMOJI, bold: false }); txt('Git LFS', -230, -22, 56, LFSC, { font: F_CODE }); txt('Large File Storage · 大文件专用存储', -230, 40, 26, '#57606a', { font: F_CODE + ',' + F_BODY, bold: false }); ctx.restore();
    terminal(t, 680, 360, 1180, 400, L_LFS1(), { title: '终端 — rice-page', accent: LFSC, fs: 32, prompt: false });
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fadeW(t, g2, g3); ctx.save(); ctx.globalAlpha *= a;
    ymlEditor(t, 680, 120, 1180, 260, '.gitattributes', [{ s: '*.psd filter=lfs diff=lfs merge=lfs -text', t: g2 + 0.2, dur: 0.5, hl: [P('G04_02', 0.2), P('G04_02', 0.55)] }], { fs: 34, accent: LFSC });
    terminal(t, 680, 410, 1180, 300, L_LFS2(), { title: '终端 — rice-page', accent: LFSC, fs: 28, prompt: false });
    if (t >= P('G04_02', 0.7)) note(1270, 770, popIn(t, P('G04_02', 0.7)), '这个文件也要提交！', CLUE, { fs: 38, rot: -0.02 });
    ctx.restore(); }
  if (t >= g3 - 0.1 && t < g4 + 0.3) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    const s1 = popIn(t, g3 + 0.1, 0.45); ctx.save(); ctx.translate(960, 420); ctx.scale(s1, s1); box(-290, -280, 580, 560, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
    txt('📦 Git 仓库里', 0, -225, 34, '#fff', { align: 'center', font: EMOJI + ',' + F_BODY });
    const ps = popIn(t, P('G04_03', 0.15), 0.4); if (ps > 0) { ctx.save(); ctx.scale(ps, ps); box(-250, -160, 500, 260, 16, '#fffbea', CLUE, 4); txt('📄 指针文件', -225, -125, 24, '#9a6700', { font: EMOJI + ',' + F_BODY });
      ['version https://git-lfs.github.com/spec/v1', 'oid sha256:4d7a2140…e9b1', 'size 188743680'].forEach((l, i) => { const hot = (i === 1 && t >= P('G04_03', 0.3) && t < P('G04_03', 0.42)) || (i === 2 && t >= P('G04_03', 0.38) && t < P('G04_03', 0.5));
        if (hot) box(-240, -78 + i * 56, 480, 44, 8, hexA(CLUE, 0.35)); txt(l, -228, -56 + i * 56, i ? 22 : 17, '#24292f', { font: F_CODE, bold: i > 0, max: 460 }); }); ctx.restore(); }
    if (t >= P('G04_03', 0.3)) { pill(-120, 170, '编号', '#9a6700', popIn(t, P('G04_03', 0.3)), { fs: 26 }); pill(120, 170, '大小', '#9a6700', popIn(t, P('G04_03', 0.38)), { fs: 26 }); }
    txt('只有几百字节', 0, 240, 26, '#cfc8ef', { align: 'center' }); ctx.restore();
    const cs = popIn(t, P('G04_03', 0.5), 0.45); cloud(1600, 360, cs * 1.2, LFSC, ''); if (cs > 0) { txt('LFS 存储', 1600, 430, 34 * cs, LFSC, { align: 'center' }); psdIcon(1600, 300, cs * 1.0, { lab: '180MB' }); }
    if (t >= P('G04_03', 0.5)) { const p = eOut(prog(t, P('G04_03', 0.5), 0.4)); ctx.save(); ctx.setLineDash([14, 10]); seg(1250, 420, lerp(1250, 1420, p), lerp(420, 380, p), LFSC, 1, 7); ctx.restore(); }
    if (t >= P('G04_03', 0.75)) pill(1600, 620, '⬇️ 用到才下载', LFSC, popIn(t, P('G04_03', 0.75)), { fs: 34, font: EMOJI + ',' + F_BODY });
    ctx.restore(); }
  if (t >= g4 - 0.1 && t < g5 + 0.3) { const a = fadeW(t, g4, g5); ctx.save(); ctx.globalAlpha *= a;
    terminal(t, 680, 110, 1180, 340, L_LFS4(), { title: '终端 — rice-page', accent: LFSC, fs: 25, prompt: false });
    if (t >= P('G04_04', 0.36)) note(1600, 480, popIn(t, P('G04_04', 0.38)), '会改写历史 → 要强制推送', CLUE, { fs: 28 });
    [['💾', '存储', '10 GB', P('G04_04', 0.6)], ['📶', '每月流量', '10 GB', P('G04_04', 0.78)], ['📄', '单个文件', '≤ 2 GB', P('G04_04', 0.9)]].forEach((c, i) => { const s = popIn(t, c[3]); if (s <= 0) return;
      const x = 880 + i * 390; ctx.save(); ctx.translate(x, 650); ctx.scale(s, s); box(-175, -95, 350, 190, 22, '#fff', LFSC, 6); txt(c[0], -110, -20, 56, '#000', { align: 'center', font: EMOJI, bold: false });
      txt(c[1], 40, -40, 28, '#57606a', { align: 'center' }); txt(c[2], 40, 20, 50, LFSC, { align: 'center', font: F_CODE }); ctx.restore(); });
    if (t >= P('G04_04', 0.6)) txt('免费额度', 700, 530, 28, '#fff', {});
    ctx.restore(); }
  if (t >= g5 - 0.1) { const a = fadeW(t, g5, g6); ctx.save(); ctx.globalAlpha *= a;
    const s = popIn(t, g5 + 0.05, 0.45); ctx.save(); ctx.translate(1270, 420); ctx.scale(s, s); box(-560, -310, 1120, 620, 28, '#fff', BADC, 7);
    txt('⚠️ 注意', 0, -250, 44, BADC, { align: 'center', font: EMOJI + ',' + F_BODY });
    txt('🌐', -300, -100, 110, '#000', { align: 'center', font: EMOJI, bold: false }); txt('GitHub Pages', -300, 10, 32, '#1b1433', { align: 'center', font: F_CODE });
    txt('🐘', 300, -100, 110, '#000', { align: 'center', font: EMOJI, bold: false }); txt('LFS 文件', 300, 10, 32, '#1b1433', { align: 'center' });
    if (t >= P('G04_05', 0.2)) { seg(-170, -100, 170, -100, BADC, eOut(prog(t, P('G04_05', 0.2), 0.3)), 10); txt('✗ 读不到', 0, -150, 34, BADC, { align: 'center' }); }
    [['🖼️ 网页要用的图片', '→ 普通提交', GOODC, 0.55], ['🎨 设计源文件', '→ LFS', LFSC, 0.7]].forEach((c, i) => { if (t < P('G04_05', c[3])) return; const y = 130 + i * 90;
      box(-460, y - 38, 920, 76, 16, hexA(c[2], 0.1), c[2], 3); txt(c[0], -420, y, 32, '#1b1433', { font: EMOJI + ',' + F_BODY }); txt(c[1], 420, y, 32, c[2], { align: 'right', font: F_BODY + ',' + F_CODE }); });
    ctx.restore(); ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['B02']); sfx(S('G04_01') + 0.05, 'pop', 0.5); termSfx(L_LFS1()); sfx(P('G04_01', 0.45), 'ding', 0.3); sfx(P('G04_01', 0.8), 'ding', 0.3);
  sfx(S('G04_02') - 0.15, 'swoosh_in', 0.4); typeSfx(S('G04_02') + 0.05, 40, 0.5); termSfx(L_LFS2()); sfx(P('G04_02', 0.7), 'pop', 0.4);
  sfx(S('G04_03') - 0.15, 'swoosh_in', 0.4); sfx(P('G04_03', 0.15), 'pop', 0.4); sfx(P('G04_03', 0.3), 'ding', 0.3); sfx(P('G04_03', 0.38), 'ding', 0.3); sfx(P('G04_03', 0.5), 'whoosh', 0.4); sfx(P('G04_03', 0.75), 'pop', 0.4);
  sfx(S('G04_04') - 0.15, 'swoosh_in', 0.4); termSfx(L_LFS4()); sfx(P('G04_04', 0.38), 'pop', 0.3); [0.6, 0.78, 0.9].forEach(f => sfx(P('G04_04', f), 'pop', 0.4));
  sfx(S('G04_05') - 0.15, 'swoosh_in', 0.4); sfx(P('G04_05', 0.2), 'buzz', 0.4); sfx(P('G04_05', 0.55), 'ding', 0.3); sfx(P('G04_05', 0.7), 'ding', 0.3); });

// ---- 讲解④：换行符（Gemini）----
const L_EOL = () => [{ s: 'git add --renormalize .', t: P('G05_03', 0.58), cmd: true, dur: 0.4 }, { s: 'git commit -m "统一换行符"', t: P('G05_03', 0.78), cmd: true, dur: 0.35 }];
function eolChip(x, y, lab, col, s = 1) { if (s <= 0) return 0; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.font = `bold 26px ${F_CODE}`; const w = ctx.measureText(lab).width + 24; box(0, -22, w, 44, 10, col); txt(lab, w / 2, 1, 26, '#fff', { align: 'center', font: F_CODE }); ctx.restore(); return w * s; }
SC.eol = (t, blk, en) => {
  bgLecture(t, EOLC); lecturer(t, blk, en, blk.t0);
  const g1 = S('G05_01'), g2 = S('G05_02') - 0.15, g3 = S('G05_03') - 0.15, g4 = U.M02.vo - 0.3;
  if (t < g2 + 0.3) { const a = fadeW(t, g1, g2); ctx.save(); ctx.globalAlpha *= a;
    box(680, 110, 1180, 640, 26, 'rgba(15,12,31,0.92)', '#fff', 5);
    [['🪟 Windows', [['CR', '#ff6b35'], ['LF', EOLC]], P('G05_01', 0.15), '\\r\\n'], ['🍎 Mac / 🐧 Linux', [['LF', EOLC]], P('G05_01', 0.42), '\\n']].forEach((r, i) => { const s = clamp(prog(t, r[2], 0.25)); if (s <= 0) return; const y = 220 + i * 170;
      ctx.save(); ctx.globalAlpha *= s; txt(r[0], 720, y, 30, '#fff', { font: EMOJI + ',' + F_BODY }); box(720, y + 30, 1100, 80, 14, '#1b1730', '#5a5580', 2);
      let x = 750 + txt('<h1>今天吃白饭</h1>', 750, y + 70, 30, '#ffd27a', { font: F_CODE + ',' + F_BODY }) + 14; r[1].forEach(c => { x += eolChip(x, y + 70, c[0], c[1], popIn(t, r[2] + 0.2)) + 8; });
      txt(r[3], 1790, y + 70, 26, '#8f8aa8', { align: 'right', font: F_CODE }); ctx.restore(); });
    if (t >= P('G05_01', 0.68)) { const s = popIn(t, P('G05_01', 0.68)); pill(1270, 560, '✏️ 编辑器一转换', CLUE, s, { fs: 32, font: EMOJI + ',' + F_BODY });
      for (let i = 0; i < 14; i++) { const p = clamp(prog(t, P('G05_01', 0.72) + i * 0.03, 0.15)); box(730 + i * 80, 630, 66, 80, 8, p > 0.5 ? '#ffebe9' : '#2a2350', p > 0.5 ? BADC : '#5a5580', 3); }
      if (t >= P('G05_01', 0.9)) stamp(t, P('G05_01', 0.9), 1660, 545, '每行都变了', BADC, 46, -0.08); }
    ctx.restore(); }
  if (t >= g2 - 0.1 && t < g3 + 0.3) { const a = fadeW(t, g2, g3); ctx.save(); ctx.globalAlpha *= a;
    ymlEditor(t, 680, 110, 1180, 260, '.gitattributes', [{ s: '# 文本文件统一换行', t: g2 + 0.15, dim: true }, { s: '* text=auto', t: P('G05_02', 0.25), dur: 0.3, hl: [P('G05_02', 0.3), 1e9] }], { fs: 36, accent: EOLC });
    const s = popIn(t, P('G05_02', 0.5), 0.45); if (s > 0) { ctx.save(); ctx.translate(1270, 580); ctx.scale(s, s);
      [[-420, '🪟', 'CRLF'], [420, '🍎', 'LF']].forEach(c => { box(c[0] - 140, -90, 280, 180, 22, '#fff', '#57606a', 4); txt(c[1], c[0], -25, 60, '#000', { align: 'center', font: EMOJI, bold: false }); txt(c[2], c[0], 50, 32, '#57606a', { align: 'center', font: F_CODE }); });
      box(-170, -110, 340, 220, 24, '#effaf3', GOODC, 6); txt('📦 仓库里', 0, -40, 34, '#1b1433', { align: 'center', font: EMOJI + ',' + F_BODY }); txt('统一 LF', 0, 30, 40, GOODC, { align: 'center', font: F_BODY + ',' + F_CODE });
      const p = eOut(prog(t, P('G05_02', 0.62), 0.4)); seg(-280, 0, lerp(-280, -180, p), 0, GOODC, 1, 8); seg(280, 0, lerp(280, 180, p), 0, GOODC, 1, 8);
      ctx.restore(); if (t >= P('G05_02', 0.75)) note(1270, 800, popIn(t, P('G05_02', 0.75)), '进仓库时自动整理好', CLUE, { fs: 32 }); }
    ctx.restore(); }
  if (t >= g3 - 0.1) { const a = fadeW(t, g3, g4); ctx.save(); ctx.globalAlpha *= a;
    ymlEditor(t, 680, 110, 1180, 340, '.gitattributes', [{ s: '* text=auto', t: -1 }, { s: '*.sh text eol=lf', t: P('G05_03', 0.08), dur: 0.35, good: t >= P('G05_03', 0.2) && t < P('G05_03', 0.35) }, { s: '*.png binary', t: P('G05_03', 0.3), dur: 0.3, good: t >= P('G05_03', 0.4) && t < P('G05_03', 0.55) }], { fs: 36, accent: EOLC });
    if (t >= P('G05_03', 0.2)) pill(1660, 268, '脚本固定 LF', GOODC, popIn(t, P('G05_03', 0.2)), { fs: 28 });
    if (t >= P('G05_03', 0.4)) pill(1660, 324, '🖼️ 别碰', '#57606a', popIn(t, P('G05_03', 0.4)), { fs: 28, font: EMOJI + ',' + F_BODY });
    terminal(t, 680, 480, 1180, 290, L_EOL(), { title: '终端 — rice-page', accent: EOLC, fs: 30, prompt: false });
    ctx.restore(); }
  guest(t, blk);
};
SFX_FNS.push(() => { guestSfx(['M02']); sfx(P('G05_01', 0.15), 'pop', 0.4); sfx(P('G05_01', 0.35), 'pop', 0.3); sfx(P('G05_01', 0.42), 'pop', 0.4); sfx(P('G05_01', 0.62), 'pop', 0.3); sfx(P('G05_01', 0.68), 'whoosh', 0.4);
  for (let i = 0; i < 14; i++) sfx(P('G05_01', 0.72) + i * 0.03, 'pop', 0.1); sfx(P('G05_01', 0.9), 'stamp', 0.5);
  sfx(S('G05_02') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G05_02', 0.25), 11, 0.3); sfx(P('G05_02', 0.5), 'pop', 0.4); sfx(P('G05_02', 0.62), 'whoosh', 0.3); sfx(P('G05_02', 0.75), 'ding', 0.4);
  sfx(S('G05_03') - 0.15, 'swoosh_in', 0.4); typeSfx(P('G05_03', 0.08), 16, 0.35); typeSfx(P('G05_03', 0.3), 12, 0.3); sfx(P('G05_03', 0.2), 'ding', 0.3); sfx(P('G05_03', 0.4), 'ding', 0.3); termSfx(L_EOL()); });
