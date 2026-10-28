
// ---- 沿用第12集组件 ----
const RULEC = '#d9480f', OWNC = '#1971c2', CHKC = '#2f9e44', MRGC = '#8250df', RELC = '#e67700', FLOWC = '#0c8599', GOLD = '#d4a017';
// 盾牌（保护规则）
function shield(x, y, s, col = RULEC, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.globalAlpha *= o.alpha ?? 1;
  if (o.glow) { ctx.shadowColor = col; ctx.shadowBlur = 36; }
  ctx.fillStyle = col; ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -80); ctx.quadraticCurveTo(50, -60, 70, -64); ctx.quadraticCurveTo(74, 40, 0, 84); ctx.quadraticCurveTo(-74, 40, -70, -64); ctx.quadraticCurveTo(-50, -60, 0, -80); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
  if (o.crack) { ctx.strokeStyle = '#1b1433'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-6, -78); ctx.lineTo(10, -30); ctx.lineTo(-12, 6); ctx.lineTo(8, 40); ctx.lineTo(-2, 80); ctx.stroke(); }
  else txt(o.mark || '✓', 0, 4, 70, '#fff', { align: 'center' });
  ctx.restore();
}
// 设置页复选框行：x,y 左上
function ghCheck(t, x, y, w, label, sub, on, s = 1, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(s); const h = o.h || (sub ? 86 : 64);
  if (o.hot) { ctx.shadowColor = o.hc || CLUE; ctx.shadowBlur = 28 + 8 * Math.sin(t * 8); }
  box(x, y, w, h, 12, o.hot ? '#fffbe6' : '#fff', o.hot ? (o.hc || CLUE) : '#d0d7de', o.hot ? 4 : 2); ctx.shadowBlur = 0;
  box(x + 22, y + h / 2 - 16, 32, 32, 7, on ? '#0969da' : '#fff', on ? '#0969da' : '#8c959f', 3);
  if (on) { const k = clamp(on); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 30, y + h / 2); ctx.lineTo(x + 30 + 6 * k, y + h / 2 + 7 * k); if (k > 0.5) ctx.lineTo(x + 36 + 12 * (k - 0.5) * 2, y + h / 2 + 7 - 16 * (k - 0.5) * 2); ctx.stroke(); }
  txt(label, x + 72, y + (sub ? h / 2 - 15 : h / 2), o.fs || 26, '#24292f', { font: isCJK(label) ? F_BODY : F_CODE, max: w - 90 });
  if (sub) txt(sub, x + 72, y + h / 2 + 20, 20, '#57606a', { bold: false, font: isCJK(sub) ? F_BODY : F_CODE, max: w - 90 });
  ctx.restore();
}
// PR 合并面板：rows = [[状态 0转 1绿 2红 3灰, 标题, 副标题]]；o.btn: 0 灰 / 1 绿；o.drop: 下拉菜单出现进度；o.pick: 高亮第几项
const MERGE_OPTS = [['Create a merge commit', '保留全部提交 + 一个合并提交'], ['Squash and merge', '整个 PR 压成一个提交'], ['Rebase and merge', '逐个接到 main 后面，一条直线']];
function mergeBox(t, x, y, w, rows, o = {}) {
  const rh = 78, h = rows.length * rh + 120; box(x, y, w, h, 16, '#fff', o.border || '#d0d7de', 4);
  rows.forEach((r, i) => { const ry = y + 14 + i * rh; if (i) { ctx.fillStyle = '#eaeef2'; ctx.fillRect(x + 16, ry - 4, w - 32, 2); }
    if (r[0] === 3) { ctx.fillStyle = '#8c959f'; ctx.beginPath(); ctx.arc(x + 44, ry + 34, 18, 0, 7); ctx.fill(); } else statusIcon(x + 44, ry + 34, 18, r[0], t);
    txt(r[1], x + 80, ry + 22, 25, '#24292f', { font: isCJK(r[1]) ? F_BODY + ',' + F_CODE : F_CODE, max: w - 110 }); if (r[2]) txt(r[2], x + 80, ry + 52, 19, '#57606a', { bold: false, font: isCJK(r[2]) ? F_BODY + ',' + F_CODE : F_CODE, max: w - 110 }); });
  const by = y + h - 70, on = o.btn; const bw = Math.min(420, w - 60);
  box(x + 24, by, bw - 56, 52, [10, 0, 0, 10], on ? '#1f883d' : '#94d3a2'); box(x + 24 + bw - 56, by, 56, 52, [0, 10, 10, 0], on ? '#1a7f37' : '#8cc99a');
  txt(o.label || 'Squash and merge', x + 24 + (bw - 56) / 2, by + 27, 22, '#fff', { align: 'center', font: F_CODE, max: bw - 76 }); txt('▾', x + 24 + bw - 28, by + 27, 26, '#fff', { align: 'center', font: F_CODE });
  if (o.hotArrow) { ctx.save(); ctx.strokeStyle = CLUE; ctx.lineWidth = 5; ctx.shadowColor = CLUE; ctx.shadowBlur = 20 + 8 * Math.sin(t * 8); rr(x + 24 + bw - 60, by - 4, 64, 60, 12); ctx.stroke(); ctx.restore(); }
  const dp = o.drop || 0; if (dp > 0) { ctx.save(); ctx.globalAlpha *= clamp(dp); const dy = by + 62; box(x + 24, dy, bw + 120, 3 * 76 + 12, 12, '#fff', '#d0d7de', 3);
    MERGE_OPTS.forEach((m, i) => { const yy = dy + 6 + i * 76; if (o.pick === i) box(x + 30, yy, bw + 108, 72, 10, hexA(MRGC, 0.14), MRGC, 3);
      txt(m[0], x + 50, yy + 24, 22, '#24292f', { font: F_CODE }); txt(m[1], x + 50, yy + 52, 18, '#57606a', { bold: false, font: F_BODY + ',' + F_CODE, max: bw + 60 }); }); ctx.restore(); }
  return h;
}
// 标签（git tag）
function tagChip(x, y, s, label, col = GOLD) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.font = `bold 30px ${F_CODE}`; const w = ctx.measureText(label).width + 70;
  ctx.fillStyle = col; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2 + 26, -30); ctx.lineTo(w / 2, -30); ctx.lineTo(w / 2, 30); ctx.lineTo(-w / 2 + 26, 30); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-w / 2 + 26, 0, 7, 0, 7); ctx.fill(); txt(label, 14, 1, 30, '#1b1433', { align: 'center', font: F_CODE }); ctx.restore();
}
// 学士帽
function capIcon(x, y, s, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  ctx.fillStyle = '#1b1433'; ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(90, 0); ctx.lineTo(0, 40); ctx.lineTo(-90, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();
  box(-48, 14, 96, 44, [0, 0, 22, 22], '#1b1433'); ctx.strokeStyle = GOLD; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(62, 18); ctx.lineTo(62, 60); ctx.stroke();
  ctx.fillStyle = GOLD; ctx.fillRect(56, 56, 12, 24); ctx.restore();
}
// 毕业证书（展开）
function diploma(x, y, s, name, o = {}) {
  if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  box(-300, -200, 600, 400, 18, '#fffaf0', GOLD, 8); box(-280, -180, 560, 360, 12, null, hexA(GOLD, 0.6), 3);
  txt('🎓 毕业证书', 0, -120, 46, '#7a5b00', { align: 'center', font: EMOJI + ',' + F_FANCY, bold: false });
  txt(name, 0, -40, 40, '#1b1433', { align: 'center' }); txt('修完 AI娘 Git课 全部 12 集', 0, 20, 28, '#57606a', { align: 'center' });
  txt('准予毕业', 0, 80, 34, BADC, { align: 'center', font: F_FANCY, bold: false });
  ctx.fillStyle = BADC; ctx.beginPath(); ctx.arc(200, 120, 44, 0, 7); ctx.fill(); txt('Git', 200, 122, 28, '#fff', { align: 'center', font: F_CODE }); ctx.restore();
}
// 进度胶囊条（实战 / 工作流）
function stepBar(t, steps, x0, y, dx, end, o = {}) {
  steps.forEach((s, i) => { const a = popIn(t, (o.t0 || 0) + i * 0.06); if (a <= 0) return;
    const x = x0 + i * dx; const act = t < end && t >= s[1] && (i === steps.length - 1 || t < steps[i + 1][1]); const done = t >= end || (i < steps.length - 1 && t >= steps[i + 1][1]);
    ctx.save(); ctx.translate(x, y); ctx.scale(a * (act ? 1.1 : 1), a * (act ? 1.1 : 1)); box(-(dx / 2 - 8), -32, dx - 16, 64, 18, act ? (o.col || GOODC) : done ? '#22c08b' : '#2a2350', '#fff', 5);
    txt((done && !act ? '✓ ' : '') + s[0], 0, 2, o.fs || 24, '#fff', { align: 'center', font: isCJK(s[0]) ? F_BODY : F_CODE, max: dx - 36 }); ctx.restore(); });
}

