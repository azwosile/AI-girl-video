
// ================= 番外通用组件（spkit）：声明式面板 + 片头 / 标题 / 片尾模板 =================
// 时间写法：数字 = 绝对秒；'G02_01' = 该句开口；['G02_01', 0.4] = 句内 40%；['G02_01', 0.4, 0.1] = 再加 0.1 秒
const tAt = a => typeof a === 'number' ? a : Array.isArray(a) ? P(a[0], a[1]) + (a[2] || 0) : S(a);
const SPC = { x: 680, w: 1180 };   // 讲解区（讲师在左）
const LECS = [];                   // [块名, cfg]：统一登记音效
const FXK = s => typeof s === 'string' ? FX[s] : (s || FX.yel);

// ---- 面板解析：panels = [{ at, k, ... }]，下一块开始即淡出 ----
function spPanels(cfg, blk) {
  if (cfg._ps) return cfg._ps;
  const ps = (cfg.panels || []).map(p => Object.assign({}, p, { t0: typeof p.at === 'string' ? S(p.at) - 0.15 : tAt(p.at) }));
  ps.forEach((p, i) => { p.t1 = p.until ? tAt(p.until) : i < ps.length - 1 ? ps[i + 1].t0 : blk.t1 + 1; p.x = p.x ?? (cfg.geo || SPC).x; p.w = p.w ?? (cfg.geo || SPC).w; prepPanel(p, cfg); });
  return cfg._ps = ps;
}
function prepPanel(p, cfg) {
  p.acc = p.acc || cfg.acc;
  if (p.k === 'term') p.L = p.lines.map(l => { const cmd = l[1].startsWith('$ '), s = cmd ? l[1].slice(2) : l[1]; const o = l[2] || {};
    return Object.assign({ s, t: tAt(l[0]), cmd, dur: cmd ? (o.dur || Math.min(1.2, 0.25 + [...s].length * 0.04)) : 0 }, o.hl ? { hl: o.hl.map(tAt), hlc: o.hlc } : {}, o.c ? { c: o.c } : {}); });
  if (p.k === 'edit') p.L = p.lines.map((l, i) => { const o = l[2] || {};
    return Object.assign({ s: l[1], t: tAt(l[0]), dur: o.type ? Math.min(1.1, 0.2 + [...l[1]].length * 0.035) : 0.01, type: !!o.type }, o.hl ? { hl: o.hl.map(tAt) } : {}, o.good ? { good: 1 } : {}, o.bad ? { bad: 1 } : {}, o.dim ? { dim: 1 } : {}, o.row != null ? { row: o.row } : {}, o.vcol ? { vcol: o.vcol } : {}); });
  (p.fx || []).forEach(f => f._t = tAt(f[0])); (p.st || []).forEach(f => f._t = tAt(f[0]));
  if (p.items) p.items.forEach(c => c._t = tAt(p.k === 'flow' ? c[2] : c[4]));
  if (p.rows) p.rows.forEach(r => { r._t = tAt(r[0]); if (r[1] === 'chk') r._on = tAt(r[4]); if (r[3] && r[3].hot) r._hot = r[3].hot.map(tAt); });
  if (p.k === 'ide') { (p.files || []).forEach(f => { f._t = tAt(f[2]); if (f[3] != null) f._s = tAt(f[3]); if (f[5] != null) f._u = tAt(f[5]); }); (p.diff || []).forEach(d => d._t = tAt(d[0]));
    ['sel', 'menu', 'msg', 'commit', 'sync', 'conf'].forEach(k => { if (p[k]) p[k]._t = tAt(p[k][0]); }); if (p.sync && p.sync[2] != null) p.sync._p = tAt(p.sync[2]); if (p.commit && p.commit[1] != null) p.commit._p = tAt(p.commit[1]); }
}
function panelSfx(p, first) {
  sfx(p.t0, first ? 'pop' : 'swoosh_in', 0.4);
  if (p.L && p.k === 'term') termSfx(p.L);
  if (p.L && p.k === 'edit') p.L.forEach(l => { if (l.type) typeSfx(l.t, [...l.s].length, l.dur); });
  (p.items || []).forEach(c => sfx(c._t, 'pop', 0.35));
  (p.rows || []).forEach(r => { if (r._t > p.t0 + 0.2) sfx(r._t, 'pop', 0.22); if (r._on) sfx(r._on, 'ding', 0.35); if (r._hot) sfx(r._hot[0], 'pop', 0.4); });
  (p.fx || []).forEach(f => sfx(f._t, 'sparkle', 0.35)); (p.st || []).forEach(f => sfx(f._t, 'stamp', 0.5));
  if (p.k === 'ide') { (p.files || []).forEach(f => { if (f._t > p.t0 + 0.2) sfx(f._t, 'pop', 0.2); if (f._s > p.t0 + 0.2) sfx(f._s, 'ding', 0.3); if (f._u) sfx(f._u, 'pop', 0.4); }); if (p.sel) sfx(p.sel._t, 'pop', 0.3); if (p.menu) { sfx(p.menu._t, 'pop', 0.35); sfx(p.menu._t + 0.5, 'ding', 0.35); }
    if (p.msg) typeSfx(p.msg._t, [...p.msg[1]].length, 0.7); if (p.commit) sfx(p.commit._p ?? p.commit._t, 'ding', 0.4); if (p.sync && p.sync._p) sfx(p.sync._p, 'whoosh', 0.45); if (p.conf) sfx(p.conf._t, 'pop', 0.3); }
  if (p.sfx) p.sfx(p);
}

// ---- 面板绘制 ----
function drawPanels(t, ps) {
  ps.forEach(p => { if (t < p.t0 - 0.05 || t > p.t1 + 0.35) return; const a = fadeW(t, p.t0, p.t1); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; const s = 0.94 + 0.06 * eBack(prog(t, p.t0, 0.35)); const cx = p.x + p.w / 2;
    ctx.translate(cx, 470); ctx.scale(s, s); ctx.translate(-cx, -470);
    (PANEL[p.k] || PANEL.draw)(t, p);
    if (p.tag) pill(cx, p.tagY || 70, p.tag[0], p.tag[1] || CLUE, popIn(t, p.t0 + 0.1), { fs: 30, font: F_BODY + ',' + EMOJI });
    (p.st || []).forEach(f => { if (t >= f._t) stamp(t, f._t, f[3] ?? cx + 300, f[4] ?? 640, f[1], f[2] || BADC, f[5] || 60, f[6] ?? -0.1); });
    (p.fx || []).forEach(f => { if (t >= f._t) fancy(f[1], f[3] ?? cx, f[4] ?? 830, f[5] || 64, t, f._t, FXK(f[2])); });
    ctx.restore(); });
}
const PANEL = {};
PANEL.draw = (t, p) => p.fn && p.fn(t, p);
PANEL.term = (t, p) => terminal(t, p.x, p.y ?? 150, p.w, p.h ?? 440, p.L, { title: p.title || '终端', accent: p.acc, fs: p.fs || 28, prompt: false });
PANEL.edit = (t, p) => ymlEditor(t, p.x, p.y ?? 150, p.w, p.h ?? 460, p.title || 'config', p.L, { fs: p.fs || 30, accent: p.acc });
// 卡片排：items = [[emoji, 标题, 副标题, 颜色, 出现]]
PANEL.cards = (t, p) => {
  const n = p.items.length, gap = 30, cw = Math.min(p.cw || 360, (p.w - 40 - gap * (n - 1)) / n), ch = p.ch || 380, y = p.y ?? 450;
  if (p.title) txt(p.title, p.x + p.w / 2, y - ch / 2 - 60, 40, '#fff', { align: 'center', font: F_BODY + ',' + EMOJI });
  p.items.forEach((c, i) => { const s = popIn(t, c._t, 0.4); if (s <= 0) return; const x = p.x + p.w / 2 + (i - (n - 1) / 2) * (cw + gap);
    const hot = p.hot && t >= tAt(p.hot[0]) && i === p.hot[1];
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (hot ? 1.06 : 1), s * (hot ? 1.06 : 1)); ctx.rotate((i - (n - 1) / 2) * 0.03);
    if (hot) { ctx.shadowColor = c[3]; ctx.shadowBlur = 40; }
    box(-cw / 2, -ch / 2, cw, ch, 26, '#fffaf0', c[3], 7); ctx.shadowBlur = 0;
    txt(c[0], 0, -ch / 2 + 100, 96, '#000', { align: 'center', font: EMOJI, bold: false });
    txt(c[1], 0, 30, c[1].length > 9 ? 30 : 36, '#1b1433', { align: 'center', font: isCJK(c[1]) ? F_BODY + ',' + EMOJI : F_CODE, max: cw - 30 });
    if (c[2]) String(c[2]).split('\n').forEach((s2, k) => txt(s2, 0, 92 + k * 36, 24, c[3], { align: 'center', max: cw - 30, font: isCJK(s2) ? F_BODY : F_CODE }));
    ctx.restore(); });
};
// 网页：rows = [[出现, 类型, ...]]，类型 h / t / btn / chk / field / code
PANEL.gh = (t, p) => {
  const x = p.x, y = p.y ?? 110, h = p.h ?? 660; ghWin(x, y, p.w, h, p.url || 'github.com');
  let cy = y + 110;
  p.rows.forEach(r => { const o = (r[1] === 'chk' ? r[5] : r[1] === 'field' ? r[4] : r[3]) || {}; if (o.y != null) cy = o.y; const a = clamp(prog(t, r._t, 0.2)); const rh = { h: 64, t: 50, btn: 74, chk: 100, field: 116, code: 72 }[r[1]] + (o.gap || 0);
    if (a > 0) { ctx.save(); ctx.globalAlpha *= a; const lx = x + 40 + (o.dx || 0);
      if (r[1] === 'h') txt(r[2], lx, cy + 10, o.size || 34, '#24292f', { font: (isCJK(r[2]) ? F_BODY : F_CODE) + ',' + EMOJI });
      if (r[1] === 't') txt(r[2], lx, cy, o.size || 26, o.col || '#57606a', { font: (isCJK(r[2]) ? F_BODY : F_CODE) + ',' + EMOJI, bold: !!o.bold, max: p.w - 80 });
      if (r[1] === 'btn') { const hot = r._hot && t >= r._hot[0] && t < (r._hot[1] ?? 1e9); ctx.font = `bold 26px ${F_CODE}`; const bw = ctx.measureText(r[2]).width + 44;
        ghBtn(o.x ?? lx + bw / 2, cy + 6, r[2], { fs: 26, hot, t, bg: o.green ? '#1f883d' : undefined, fg: o.green ? '#fff' : undefined, bd: o.green ? '#1a7f37' : undefined, hc: o.hc }); }
      if (r[1] === 'chk') ghCheck(t, lx, cy - 20, p.w - 80 - (o.dx || 0), r[2], r[3], clamp(prog(t, r._on, 0.25)), 1, { hot: t >= r._on && t < r._on + 0.9 });
      if (r[1] === 'field') { txt(r[2], lx, cy - 10, 24, '#24292f', { font: isCJK(r[2]) ? F_BODY : F_CODE }); const n = Math.floor(clamp((t - r._t - 0.2) / 0.6) * [...r[3]].length);
        box(lx, cy + 14, p.w - 80 - (o.dx || 0), o.fh || 56, 8, '#f6f8fa', '#d0d7de', 2);
        String([...r[3]].slice(0, n).join('')).split('\n').forEach((s2, k) => txt(s2, lx + 16, cy + 42 + k * 30, o.fs || 22, '#24292f', { font: F_CODE, bold: false, max: p.w - 120 })); }
      if (r[1] === 'code') { box(lx, cy - 24, p.w - 80, 56, 8, '#f6f8fa', '#d0d7de', 2); txt(r[2], lx + 16, cy + 4, 24, o.col || '#0550ae', { font: F_CODE, max: p.w - 120 }); }
      ctx.restore(); }
    cy += rh; });
};
// 流程链：items = [[文字, 颜色, 出现, 副标题?]]
PANEL.flow = (t, p) => {
  const n = p.items.length, gap = 64, cw = (p.w - 40 - gap * (n - 1)) / n, y = p.y ?? 420;
  if (p.title) fancy(p.title, p.x + p.w / 2, y - 150, 56, t, p.t0 + 0.1, FX.white);
  p.items.forEach((c, i) => { const x = p.x + 20 + cw / 2 + i * (cw + gap), s = popIn(t, c._t, 0.35); if (s <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); box(-cw / 2, -60, cw, 120, 22, c[1], '#fff', 5);
    txt(c[0], 0, c[3] ? -14 : 2, cw < 240 ? 26 : 30, '#fff', { align: 'center', font: (isCJK(c[0]) ? F_BODY : F_CODE) + ',' + EMOJI, max: cw - 20 });
    if (c[3]) txt(c[3], 0, 30, 20, 'rgba(255,255,255,0.9)', { align: 'center', max: cw - 20, font: isCJK(c[3]) ? F_BODY : F_CODE, bold: false });
    ctx.restore();
    if (i < n - 1 && t >= p.items[i + 1]._t - 0.1) { const ax = x + cw / 2 + 8; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(ax, y - 16); ctx.lineTo(ax + gap - 20, y); ctx.lineTo(ax, y + 16); ctx.fill(); } });
};
// 大卡片：emoji + 标题 + 副标题
PANEL.big = (t, p) => {
  const s = popIn(t, p.t0, 0.45), cx = p.x + p.w / 2, y = p.y ?? 440; if (s <= 0) return; ctx.save(); ctx.translate(cx, y); ctx.scale(s, s); ctx.rotate(-0.02);
  box(-430, -260, 860, 520, 30, '#fffaf0', p.acc, 8); txt(p.emoji, 0, -120, 140, '#000', { align: 'center', font: EMOJI, bold: false });
  txt(p.title, 0, 50, 54, '#1b1433', { align: 'center', font: (isCJK(p.title) ? F_FANCY : F_CODE) + ',' + EMOJI, bold: false, max: 800 });
  if (p.sub) String(p.sub).split('\n').forEach((s2, k) => txt(s2, 0, 140 + k * 44, 32, p.acc, { align: 'center', max: 800, font: isCJK(s2) ? F_BODY : F_CODE }));
  ctx.restore();
};
// VS Code / github.dev 模拟：files = [[文件名, M/U/D, 出现, 暂存时间?]]，diff = [[出现, 文本, '+'|'-'|' ']]
const SCM = { M: '#e2c08d', U: '#73c991', D: '#f14c4c', A: '#73c991', C: '#f14c4c' };
PANEL.ide = (t, p) => {
  const x = p.x, y = p.y ?? 110, w = p.w, h = p.h ?? 660, sw = p.sw ?? 400;
  win(x, y, w, h, p.title || 'Visual Studio Code', p.acc || '#007acc', { bg: '#1e1e1e' });
  box(x + 6, y + 62, 70, h - 68, [0, 0, 0, 14], '#333333');
  ['📄', '🔍', '⑂', '▶', '⧉'].forEach((ic, i) => { const iy = y + 110 + i * 78, on = i === 2;
    if (on) { const pulse = p.pulse && t >= tAt(p.pulse[0]) && t < tAt(p.pulse[1]); if (pulse) { ctx.save(); ctx.shadowColor = CLUE; ctx.shadowBlur = 30 + 10 * Math.sin(t * 9); box(x + 14, iy - 30, 54, 60, 10, hexA(CLUE, 0.25), CLUE, 3); ctx.restore(); }
      ctx.fillStyle = '#fff'; ctx.fillRect(x + 6, iy - 30, 5, 60); }
    txt(ic, x + 41, iy, i === 2 ? 40 : 32, on ? '#fff' : '#858585', { align: 'center', font: (i === 2 ? F_CODE : EMOJI), bold: i === 2 });
    if (on) { const nf = (p.files || []).filter(f => t >= f._t && !(f._s && t >= f._s + 0.2 && p.badgeStaged === false)).length; if (nf) { ctx.fillStyle = '#007acc'; ctx.beginPath(); ctx.arc(x + 60, iy + 20, 14, 0, 7); ctx.fill(); txt(String(nf), x + 60, iy + 21, 18, '#fff', { align: 'center' }); } } });
  const sx = x + 76; box(sx, y + 62, sw, h - 68, 0, '#252526');
  txt(p.side || '源代码管理', sx + 20, y + 92, 20, '#bbbbbb', { font: F_BODY });
  let cy = y + 128;
  if (p.msg) { box(sx + 16, cy, sw - 32, 50, 6, '#3c3c3c', t >= p.msg._t && t < p.msg._t + 1.2 ? '#007acc' : '#3c3c3c', 2); const n = Math.floor(clamp((t - p.msg._t) / 0.7) * [...p.msg[1]].length);
    txt(n > 0 ? [...p.msg[1]].slice(0, n).join('') : '消息（Ctrl+Enter 提交）', sx + 30, cy + 26, 20, n > 0 ? '#ffffff' : '#8b8b8b', { font: F_BODY + ',' + F_CODE, bold: false, max: sw - 60 }); cy += 64; }
  if (p.commit) { const pr = p.commit._p != null && t >= p.commit._p && t < p.commit._p + 0.3; box(sx + 16, cy, sw - 32, 48, 6, pr ? '#1177bb' : '#0e639c'); txt(p.commitLabel || '✓ 提交', sx + sw / 2, cy + 25, 22, '#fff', { align: 'center', font: F_BODY + ',' + EMOJI }); cy += 66; }
  const isSt = f => f._s != null && t >= f._s && !(f._u != null && t >= f._u); const staged = (p.files || []).filter(isSt), changes = (p.files || []).filter(f => t >= f._t && !(isSt(f) && !f[4]));
  const fileRow = (f, yy, hi) => { if (hi) box(sx + 4, yy - 20, sw - 8, 40, 4, '#094771'); txt('📄 ' + f[0], sx + 30, yy, 22, '#cccccc', { font: F_CODE + ',' + EMOJI, bold: false, max: sw - 110 }); txt(f[1], sx + sw - 30, yy, 22, SCM[f[1]] || '#ccc', { align: 'right', font: F_CODE }); };
  if (staged.length) { txt('暂存的更改  ' + staged.length, sx + 20, cy, 18, '#bbbbbb', { font: F_BODY }); cy += 36; staged.forEach(f => { fileRow(f, cy, false);
    if (p.minus) { const m0 = tAt(p.minus), hot = t >= m0 - 0.5 && t < m0 + 0.3; if (hot) { ctx.save(); ctx.shadowColor = CLUE; ctx.shadowBlur = 20 + 8 * Math.sin(t * 9); } box(sx + sw - 92, cy - 16, 32, 32, 6, hot ? hexA(CLUE, 0.3) : '#3c3c3c', hot ? CLUE : null, 2); if (hot) ctx.restore(); txt('−', sx + sw - 76, cy, 26, '#fff', { align: 'center' }); }
    cy += 40; }); cy += 8; }
  if (changes.length) { txt('更改  ' + changes.length, sx + 20, cy, 18, '#bbbbbb', { font: F_BODY }); cy += 36; changes.forEach(f => { const a = clamp(prog(t, f._t, 0.2)); ctx.save(); ctx.globalAlpha *= a; fileRow(f, cy, p.open && f[0] === p.open[1] && t >= tAt(p.open[0])); ctx.restore(); cy += 40; }); }
  if (p.sync) { const pr = p.sync._p != null && t >= p.sync._p; const by = y + h - 70; const hot = t >= p.sync._t && !pr;
    if (hot) { ctx.save(); ctx.shadowColor = CLUE; ctx.shadowBlur = 24 + 8 * Math.sin(t * 8); } box(sx + 16, by, sw - 32, 48, 6, pr ? '#1177bb' : '#0e639c', hot ? CLUE : null, 3); if (hot) ctx.restore();
    txt((pr ? '⟳ ' : '⇅ ') + (p.sync[1] || '同步更改'), sx + sw / 2, by + 25, 22, '#fff', { align: 'center', font: F_BODY + ',' + F_CODE }); }
  // 编辑区
  const ex = sx + sw, ew = x + w - 6 - ex; box(ex, y + 62, ew, h - 68, [0, 0, 14, 0], '#1e1e1e');
  if (p.etitle) { box(ex, y + 62, ew, 44, 0, '#2d2d2d'); txt(p.etitle, ex + 20, y + 85, 20, '#cccccc', { font: F_CODE + ',' + F_BODY, bold: false, max: ew - 40 }); }
  const fs = p.dfs || 24, lh = fs * 1.7; let row = 0;
  (p.diff || []).forEach((d, i) => { if (t < d._t) return; const ly = y + (p.conf ? 165 : 140) + i * lh; const a = clamp(prog(t, d._t, 0.2)); ctx.save(); ctx.globalAlpha *= a;
    const bg = d[2] === '+' ? 'rgba(46,160,67,0.28)' : d[2] === '-' ? 'rgba(248,81,73,0.28)' : d[2] === '<' ? 'rgba(63,185,80,0.22)' : d[2] === '>' ? 'rgba(56,139,253,0.25)' : d[2] === '=' ? 'rgba(255,210,63,0.18)' : null;
    if (bg) box(ex + 8, ly - lh / 2 + 2, ew - 16, lh - 4, 4, bg);
    const sel = p.sel && t >= p.sel._t && i >= p.sel[1] && i <= p.sel[2]; if (sel) box(ex + 8, ly - lh / 2 + 2, ew - 16, lh - 4, 4, 'rgba(38,79,120,0.9)', '#3794ff', 2);
    txt(String(i + 1), ex + 40, ly, fs * 0.8, '#858585', { align: 'right', font: F_CODE, bold: false });
    txt(d[1], ex + 60, ly, fs, d[2] === '=' ? '#ffd23f' : '#d4d4d4', { font: F_CODE + ',' + F_BODY, bold: false, max: ew - 80 }); ctx.restore(); row++; });
  if (p.conf) { const cy2 = y + 108; const items = p.conf[1]; let cx2 = ex + 20; ctx.save(); ctx.globalAlpha *= clamp(prog(t, p.conf._t, 0.2));
    items.forEach((s2, k) => { ctx.font = `20px ${F_BODY}`; const ww = ctx.measureText(s2).width + 10; const hot = p.conf[2] === k && t >= p.conf._t + 0.6; txt(s2, cx2, cy2, 20, hot ? '#ffd23f' : '#9cdcfe', { font: F_BODY, bold: hot }); if (hot) { ctx.fillStyle = '#ffd23f'; ctx.fillRect(cx2, cy2 + 14, ww - 10, 3); } cx2 += ww + 14; txt('|', cx2 - 12, cy2, 20, '#555', { bold: false }); }); ctx.restore(); }
  if (p.menu && t >= p.menu._t) { const s = popIn(t, p.menu._t, 0.25), items = p.menu[1], mx = p.menu[3] ?? ex + 140, my = p.menu[4] ?? y + 300; ctx.save(); ctx.translate(mx, my); ctx.scale(s, s);
    box(0, 0, 380, items.length * 46 + 16, 8, '#252526', '#454545', 2); items.forEach((s2, k) => { const hot = k === p.menu[2] && t >= p.menu._t + 0.45; if (hot) box(6, 8 + k * 46, 368, 44, 4, '#094771'); txt(s2, 22, 30 + k * 46, 22, hot ? '#fff' : '#cccccc', { font: F_BODY + ',' + F_CODE, bold: false }); });
    ctx.restore(); }
  if (p.extra) p.extra(t, p, { ex, ew, sx, sw });
};

// ---- 嘉宾（含大肥鱼）：讲解块里插话 ----
function guest2(t, blk) {
  blk.entries.forEach(e => {
    if (e.k !== 'v' || e.id[0] === 'G') return;
    const a0 = e.vo - 0.25, a1 = e.t1 + 0.2; if (t < a0 || t > a1 + 0.3) return;
    const pi = eOut(prog(t, a0, 0.3)), po = eIn(prog(t, a1, 0.3)); const v = pi * (1 - po);
    ctx.fillStyle = `rgba(16,10,34,${0.42 * v})`; ctx.fillRect(640, -40, W, H + 80);
    const c = SQ[e.id[0]];
    sprite(e.pose, lerp(W + 450, 1560, pi) + po * 500, H + 40, 960, { scale: breath(t, 3) });
    const np = popIn(t, a0 + 0.1); if (np > 0 && po < 1) { ctx.save(); ctx.globalAlpha *= 1 - po; pill(1560, 150, c.n + ' · ' + c.role, c.col, np, { font: F_FANCY, fs: 46, fg: '#fff' }); ctx.restore(); }
  });
}

// ---- 讲解块模板 ----
function lec(name, cfg) {
  LECS.push([name, cfg]);
  SC[name] = (t, blk, en) => {
    bgLecture(t, cfg.acc); lecturer(t, blk, en, blk.t0);
    if (cfg.steps) stepBar(t, cfg.steps.map(s => [s[0], tAt(s[1])]), cfg.sx ?? 900, 70, cfg.sdx ?? 330, blk.t1, { t0: blk.t0 + 0.1, col: cfg.acc, fs: 24 });
    drawPanels(t, spPanels(cfg, blk));
    if (cfg.chap) probChap(t, blk.t0, cfg.chap);
    if (cfg.extra) cfg.extra(t, blk, en);
    guest2(t, blk);
  };
}
// ---- 提问块：左侧插图（大图标 + 小卡片）----
function qArt(emoji, lines, col, o = {}) {
  return (t, blk) => {
    const t0 = blk.t0, s = popIn(t, t0 + 0.1, 0.45), bob = Math.sin(t * 2.4) * 10;
    if (s > 0) { ctx.save(); ctx.translate(520, 330 + bob); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.7) * 0.04);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 175, 0, 7); ctx.fill(); ctx.lineWidth = 12; ctx.strokeStyle = col; ctx.stroke();
      txt(emoji, 0, 8, 170, '#000', { align: 'center', font: EMOJI, bold: false }); ctx.restore(); }
    (lines || []).forEach((l, i) => miniCard(520, 610 + i * 92, l, col, popIn(t, t0 + 0.35 + i * 0.15), { w: 560, h: 72, fs: 28, rot: (i % 2 ? 0.02 : -0.02) }));
    if (o.draw) o.draw(t, blk);
  };
}
// ---- 冷开场模板：cfg = { bg:[c1,c2], pose, pill, cry:[文字, 时间], shake, panels(画在 860..1860) } ----
function coldScene(cfg) {
  cfg.geo = { x: 860, w: 1000 }; LECS.push(['cold', cfg]);
  SC.cold = (t, blk) => {
    const t0 = blk.t0; if (cfg.shake) { const [sx, sy] = shake(t, tAt(cfg.shake), 12, 0.35); ctx.translate(sx, sy); }
    bgBurst(t, cfg.bg[0], cfg.bg[1], W * 0.62, H * 0.5, 22, 0.35);
    drawPanels(t, spPanels(cfg, blk));
    if (cfg.shake && t >= tAt(cfg.shake)) flash(t, tAt(cfg.shake), 0.15, '255,80,120');
    const lead = blk.entries.find(e => e.k === 'v' && e.id[0] === 'D'); const others = blk.entries.filter(e => e.k === 'v' && e.id[0] !== 'D');
    if (others.length) guest2(t, { entries: others });
    const din = lead ? lead.vo - 0.4 : t0; const p = spring(prog(t, din, 0.9)); const dv = clamp(prog(t, din, 0.25));
    if (dv > 0) { ctx.save(); ctx.globalAlpha *= dv; sprite(cfg.pose, 440, H + 40, 980, { scale: lerp(1.2, 1, p) * breath(t, 1) }); ctx.restore();
      pill(440, 150, cfg.pill, SQ.D.col, popIn(t, din + 0.15), { font: F_FANCY, fs: 44, fg: '#fff' }); }
    if (cfg.cry && t >= tAt(cfg.cry[1])) fancy(cfg.cry[0], 440, 270, cfg.cry[2] || 80, t, tAt(cfg.cry[1]), { rot: -0.06, wobble: 5, c1: '#fff36b', c2: '#ffb000', stroke: '#2a1460' });
  };
  SFX_FNS.push(() => { if (cfg.shake) { const k = tAt(cfg.shake); sfx(k, 'impact', 0.6); sfx(k, 'buzz', 0.45); } if (cfg.cry) sfx(tAt(cfg.cry[1]), 'boing', 0.4);
    const lead = BK.cold.entries.find(e => e.k === 'v' && e.id[0] === 'D'); if (lead) sfx(lead.vo - 0.25, 'pop', 0.4);
    guestSfx(BK.cold.entries.filter(e => e.k === 'v' && e.id[0] !== 'D' && e.id[0] !== 'G').map(e => e.id)); });
}
// ---- 标题模板：cfg = { bg:[c1,c2], icons:[5], gpose, dpose, num, l1, l2 } ----
function titleScene(cfg) {
  SC.title = (t, blk) => {
    const t0 = blk.t0; let [sx, sy] = shake(t, t0 + 0.9, 12, 0.3); ctx.translate(sx, sy);
    bgBurst(t, cfg.bg[0], cfg.bg[1], W * 0.6, H * 0.45, 28, 0.2);
    cfg.icons.forEach((k, i) => { const a = t * 0.5 + i * Math.PI * 2 / cfg.icons.length; const s = popIn(t, t0 + 0.2 + i * 0.06); if (s > 0) txt(k, 1100 + Math.cos(a) * 640, 470 + Math.sin(a) * 330, 90 * s, '#000', { align: 'center', font: EMOJI, bold: false }); });
    const gx = lerp(-400, 330, eBack(prog(t, t0, 0.5))); sprite(cfg.gpose, gx, H + 60, 1040);
    if (cfg.gextra) cfg.gextra(t, gx, H + 60, 1040);
    sprite(cfg.dpose, lerp(W + 500, 1660, eBack(prog(t, t0 + 0.3, 0.5))), H + 30, 780);
    fancy('AI娘 Git课', 1100, 170, 90, t, t0 + 0.25, FX.white);
    const slam = prog(t, t0 + 0.8, 0.2);
    if (slam > 0) {
      ctx.save(); ctx.translate(1060, 460); const s = lerp(3, 1, eOut(slam)); ctx.scale(s, s); ctx.globalAlpha = clamp(slam * 3);
      badge(-420, -10, 95, '#ff5c8a', cfg.num, { fs: 46, rot: -0.15, fg: '#fff' });
      const n1 = [...cfg.l1].length, n2 = [...cfg.l2].length;
      fancy(cfg.l1, 60, -70, Math.min(120, 760 / Math.max(1, n1 * 0.62)), t, -99, FX.white);
      fancy(cfg.l2, 110, 80, Math.min(140, 820 / Math.max(1, n2 * 0.95)), t, -99, FX.yel);
      ctx.restore();
      speedLines(t, 1060, 460, 1 - prog(t, t0 + 1.0, 0.6));
    }
    flash(t, t0 + 1.0, 0.2);
  };
  SFX_FNS.push(() => { const b = BK.title; sfx(b.t0 + 0.1, 'swoosh_in', 0.5); sfx(b.t0 + 0.95, 'impact', 1.0); sfx(b.t0 + 1.1, 'confetti', 0.4); for (let i = 0; i < cfg.icons.length; i++) sfx(b.t0 + 0.2 + i * 0.06, 'pop', 0.2); });
}
// ---- 片尾模板（块名 teaser：mix.py 靠它接片尾曲）：cfg = { head, next:[emoji, 标题, 副标题] | comment:true, end, dpose } ----
function outroScene(cfg) {
  SC.teaser = (t, blk, en) => {
    const st = blk.t0; bgStripes(t, '#5f3dc4');
    const outro = E('G07_02') + 0.2;
    const cur = en && en.k === 'v' ? en : U.G07_02;
    sprite(cur.pose, lerp(-400, 340, eBack(prog(t, st, 0.45))), H + 260, 1160);
    const ot = prog(t, S('G07_02'), 0.3);
    if (ot < 1) {
      fancy(cfg.head, 1260, 120, 92, t, st + 0.1, FX.white);
      const bp = popIn(t, P('G07_01', 0.2), 0.5);
      if (bp > 0) { ctx.save(); ctx.translate(1260, 480); ctx.scale(bp, bp); ctx.translate(-1260, -480);
        box(860, 250, 800, 440, 24, '#ffffff', '#5f3dc4', 6);
        txt(cfg.next ? '🎁 下个番外' : '💬 评论区点菜', 900, 305, 38, '#5f3dc4', { font: EMOJI + ',' + F_BODY });
        const rows = cfg.next ? [cfg.next] : cfg.rows;
        rows.forEach((c, i) => { const s = popIn(t, P('G07_01', 0.35 + i * 0.15)); if (s <= 0) return; const ry = rows.length === 1 ? 480 : 410 + i * 105; ctx.save(); ctx.translate(1260, ry); ctx.scale(s, s);
          const bh = rows.length === 1 ? 200 : 90; box(-360, -bh / 2, 720, bh, 16, '#f6f8fa', '#5f3dc4', 3);
          txt(c[0], -290, 0, rows.length === 1 ? 110 : 50, '#000', { align: 'center', font: EMOJI, bold: false });
          txt(c[1], rows.length === 1 ? -200 : -250, rows.length === 1 ? -30 : -14, rows.length === 1 ? 46 : 30, '#24292f', { font: F_BODY + ',' + F_CODE, max: 520 });
          txt(c[2], rows.length === 1 ? -200 : -250, rows.length === 1 ? 40 : 24, rows.length === 1 ? 28 : 22, '#5f3dc4', { font: F_BODY + ',' + F_CODE, bold: false, max: 520 }); ctx.restore(); });
        ctx.restore(); }
      fancy(cfg.tease || '敬请期待！', 1260, 820, 66, t, P('G07_01', 0.8), FX.pink);
    }
    if (ot > 0) {
      ctx.fillStyle = `rgba(10,8,22,${0.78 * ot})`; ctx.fillRect(...OS);
      [['👍', '点赞', '#ff5c8a'], ['🪙', '投币', '#ffd23f'], ['⭐', '收藏', '#3ec1ff']].forEach((ic, i) => {
        const a = popIn(t, S('G07_02') + 0.4 + i * 0.32, 0.4); if (a <= 0) return;
        const x = W / 2 + (i - 1) * 330, y = 440;
        ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(Math.sin(t * 5 + i) * 0.06);
        ctx.fillStyle = ic[2]; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
        ctx.font = `110px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic[0], 0, 8); ctx.restore();
        fancy(ic[1], x, y + 180, 60, t, S('G07_02') + 0.5 + i * 0.32, { c1: '#fff', c2: '#eee', stroke: ic[2] });
      });
      fancy(cfg.end || '一键三连，番外见！', W / 2, 180, 92, t, S('G07_02') + 1.4, { stagger: 0.04 });
      if (t > outro) {
        const sa = popIn(t, outro + 0.2); if (sa > 0) { sprite('g_peace', 260, H + 330, 980, { scale: sa }); sprite(cfg.dpose || 'd_happy', 1690, H + 40, 640, { scale: sa }); }
        SQUAD.split('').forEach((k, i) => avatar(k, W / 2 + (i - 2.5) * 120, 790, 44, { s: popIn(t, outro + 0.4 + i * 0.06) }));
      }
      ctx.save(); ctx.globalAlpha = clamp(prog(t, outro + 0.8, 0.5)); ctx.fillStyle = 'rgba(10,8,22,0.85)'; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = '#e4defa'; ctx.font = `22px ${F_BODY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('配音：大肥鱼 — 尹紫鹭幻想社 da-fei-yu 数据集（CC BY-NC 4.0） · GitHub娘 — GPT-SoVITS 声音克隆 · 豆包 — GPT-SoVITS 训练 · 其余小队 — AI 合成语音（GPT-SoVITS 克隆）', W / 2, 930);
      ctx.fillText('千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0） · 片尾曲：さユり《花の塔》', W / 2, 968);
      ctx.fillText('豆包声音训练素材：网络音频《豆包的封神语录》 · 各 AI 名称、声音与商标归其权利人，本片为非商用同人创作，不代表厂商官方', W / 2, 1006);
      ctx.restore();
    }
  };
  SFX_FNS.push(() => { const b = BK.teaser; sfx(b.t0 + 0.1, 'impact', 0.6); sfx(P('G07_01', 0.2), 'pop', 0.6); sfx(P('G07_01', 0.35), 'pop', 0.4); sfx(P('G07_01', 0.8), 'ding', 0.5);
    [0, 1, 2].forEach(k => sfx(S('G07_02') + 0.4 + k * 0.32, 'coin', 0.6)); sfx(S('G07_02') + 1.4, 'confetti', 0.4); });
}
// ---- 统一登记：讲解块面板音效 + 嘉宾音效 ----
SFX_FNS.push(() => LECS.forEach(([name, cfg]) => { const blk = BK[name]; if (!blk) return; spPanels(cfg, blk).forEach((p, i) => panelSfx(p, i === 0));
  if (name !== 'cold') guestSfx(blk.entries.filter(e => e.k === 'v' && e.id[0] !== 'G').map(e => e.id)); if (cfg.sfx) cfg.sfx(blk); }));
// ---- 提问块音效：角色滑入 + 气泡弹出 ----
SFX_FNS.push(() => Object.keys(PROB).forEach(b => { const blk = BK[b]; if (!blk) return; const vs = blk.entries.filter(e => e.k === 'v');
  vs.forEach((e, i) => { sfx(i === 0 ? blk.t0 : e.vo - 0.3, 'swoosh_in', 0.35); sfx((i === 0 ? blk.t0 : e.vo - 0.3) + 0.12, 'pop', 0.3); });
  const dq = vs.find(e => e.id[0] === 'D'); if (dq) { sfx(dq.vo + 0.35, 'pop', 0.4); sfx(dq.vo + 0.5, 'sparkle', 0.25); } sfx(blk.t0 + 0.1, 'pop', 0.3); }));
