# 第10集引擎：以第3集最终版 engine.js 为底，替换台词 / 时间轴 / 立绘表 / 场景（同第4集 build4.py）
import json, re, sys
from pathlib import Path
EP = Path(__file__).resolve().parent
base = (EP / (sys.argv[1] if len(sys.argv) > 1 else 'ep4ref/engine.js')).read_text(encoding='utf-8')
sub = json.loads((EP / 'subtitles.json').read_text(encoding='utf-8'))
L = base.split('\n')
def idx(prefix, start=0):
    for i in range(start, len(L)):
        if L[i].startswith(prefix): return i
    raise SystemExit('marker not found: ' + prefix)
i_text = idx('const TEXT = {'); i_text_end = idx('};', i_text)
i_plan = idx('const PLAN = ['); i_plan_end = idx('];', i_plan)
i_sc = idx('// ================= 场景 =================')
i_sq = idx('// ================= 第3集：小队 =================')
i_cold = idx('// ---- 冷开场')
i_main = idx('// ================= 主渲染 =================')
head = '\n'.join(L[:i_text]).replace('第2集 渲染引擎', '第10集 渲染引擎')
NEW4 = ['g_pill', 'd_pill', 'm_oops', 'q_alarm', 'b_wave', 'x_panic', 'k_diary', 'c_read']
NEW5 = ['g_tag', 'd_party', 'b_proud', 'm_tag', 'x_thumb', 'k_scroll']
NEW6 = ['g_web', 'd_phone', 'm_photo', 'x_doubt', 'b_point']
NEW7 = ['g_check', 'd_robot', 'm_clock', 'c_lock', 'b_badge']
NEW8 = ['g_scissors', 'd_tangle', 'd_film', 'b_squash']
NEW9 = ['g_detective', 'd_detective', 'b_cherry']
NEW10 = ['g_fork', 'd_medal', 'm_review']
m = re.search(r"const SPR_NAMES = \[(.*?)\];", head); names = re.findall(r"'(\w+)'", m.group(1)) + NEW4 + NEW5 + NEW6 + NEW7 + NEW8 + NEW9 + NEW10
head = head.replace(m.group(0), 'const SPR_NAMES = [' + ', '.join(f"'{n}'" for n in names) + '];')
head = head.replace("k_read: 0.6 };", "k_read: 0.6, d_pill: 0.6, m_oops: 0.62, q_alarm: 0.6, b_wave: 0.62, x_panic: 0.62, k_diary: 0.6, c_read: 0.58, d_party: 0.68, b_proud: 0.6, m_tag: 0.62, x_thumb: 0.66, k_scroll: 0.62, d_phone: 0.66, m_photo: 0.6, x_doubt: 0.62, b_point: 0.62, d_robot: 0.66, m_clock: 0.62, c_lock: 0.6, b_badge: 0.62, d_tangle: 0.62, d_film: 0.64, b_squash: 0.7, d_detective: 0.64, b_cherry: 0.62, d_medal: 0.64, m_review: 0.62 };")
assert 'd_party: 0.68' in head and 'm_review: 0.62' in head
text = ['const TEXT = {'] + [f'  {k}: {json.dumps(v, ensure_ascii=False)},' for k, v in sub.items()] + ['};']
mid = '\n'.join(L[i_text_end + 1:i_plan])
plan = (EP / 'plan10.js').read_text(encoding='utf-8').rstrip('\n')
ids = re.findall(r"V\('\w+', '(\w+)'", plan); assert set(ids) == set(sub) and len(ids) == len(sub), (set(sub) - set(ids), set(ids) - set(sub))
poses = set(re.findall(r"V\('\w+', '\w+', '(\w+)'", plan)); assert poses <= set(names), poses - set(names)
mid2 = '\n'.join(L[i_plan_end + 1:i_sc])
mid2 = mid2.replace(r"str.split(/\{(\w)\}/)", r"str.split(/\{([a-z])\}/)").replace(r"s.replace(/\{\w\}/g, '')", r"s.replace(/\{[a-z]\}/g, '')")
assert r"\{([a-z])\}" in mid2 and r"\{[a-z]\}/g" in mid2
helpers = '\n'.join(L[i_sq:i_cold])
scen = (EP / 'common10.js').read_text(encoding='utf-8') + (EP / 'helpers10.js').read_text(encoding='utf-8') + ''.join((EP / f'scenes10{x}.js').read_text(encoding='utf-8') for x in 'abc')
used = set(re.findall(r"sprite\('(\w+)'", scen)) | set(re.findall(r"\['(\w_\w+)', P\(", scen)); assert used <= set(names), used - set(names)
foot = '\n'.join(l for l in L[i_main:] if not l.startswith("['branch', 'conflict'"))
out = '\n'.join([head, *text, mid, plan, mid2, '// ================= 场景 =================', 'const SC = {};', 'const SFX_FNS = [];', helpers, scen, foot])
(EP / 'web').mkdir(exist_ok=True); (EP / 'web' / 'engine.js').write_text(out, encoding='utf-8')
print('engine lines', out.count('\n') + 1, 'sprites', len(names))
