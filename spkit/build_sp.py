# 番外引擎：以第3集最终版 engine.js 为底（同 build12.py），拼 kit/ 共用组件 + spN 场景
# 用法（仓库根目录）：python spkit/build_sp.py N  → spN/web/engine.js；底座默认 ep3/web/engine.js
import json, re, sys
from pathlib import Path
K = Path(__file__).resolve().parent; R = K.parent; N = sys.argv[1]; EP = R / f'sp{N}'
base = (R / (sys.argv[2] if len(sys.argv) > 2 else 'ep3/web/engine.js')).read_text(encoding='utf-8')
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
head = '\n'.join(L[:i_text]).replace('第2集 渲染引擎', f'番外{N} 渲染引擎')
NEW = ['g_pill', 'd_pill', 'm_oops', 'q_alarm', 'b_wave', 'x_panic', 'k_diary', 'c_read', 'g_tag', 'd_party', 'b_proud', 'm_tag', 'x_thumb', 'k_scroll',
       'g_web', 'd_phone', 'm_photo', 'x_doubt', 'b_point', 'g_check', 'd_robot', 'm_clock', 'c_lock', 'b_badge', 'g_scissors', 'd_tangle', 'd_film', 'b_squash',
       'g_detective', 'd_detective', 'b_cherry', 'g_fork', 'd_medal', 'm_review', 'g_doctor', 'd_heavy', 'c_key', 'g_grad', 'd_grad',
       'd_keys', 'g_mouse', 'g_term', 'g_hook', 'd_cloud']
m = re.search(r"const SPR_NAMES = \[(.*?)\];", head); names = re.findall(r"'(\w+)'", m.group(1)) + NEW
head = head.replace(m.group(0), 'const SPR_NAMES = [' + ', '.join(f"'{n}'" for n in names) + '];')
head = head.replace("k_read: 0.6 };", "k_read: 0.6, d_pill: 0.6, m_oops: 0.62, q_alarm: 0.6, b_wave: 0.62, x_panic: 0.62, k_diary: 0.6, c_read: 0.58, d_party: 0.68, b_proud: 0.6, m_tag: 0.62, x_thumb: 0.66, k_scroll: 0.62, d_phone: 0.66, m_photo: 0.6, x_doubt: 0.62, b_point: 0.62, d_robot: 0.66, m_clock: 0.62, c_lock: 0.6, b_badge: 0.62, d_tangle: 0.62, d_film: 0.64, b_squash: 0.7, d_detective: 0.64, b_cherry: 0.62, d_medal: 0.64, m_review: 0.62, d_heavy: 0.66, c_key: 0.6, d_grad: 0.64, d_keys: 0.6, d_cloud: 0.64 };")
assert 'd_keys: 0.6' in head
text = ['const TEXT = {'] + [f'  {k}: {json.dumps(v, ensure_ascii=False)},' for k, v in sub.items()] + ['};']
mid = '\n'.join(L[i_text_end + 1:i_plan])
plan = (EP / 'src' / f'plan_sp{N}.js').read_text(encoding='utf-8').rstrip('\n')
ids = re.findall(r"V\('\w+', '(\w+)'", plan); assert set(ids) == set(sub) and len(ids) == len(sub), (set(sub) - set(ids), set(ids) - set(sub))
poses = set(re.findall(r"V\('\w+', '\w+', '(\w+)'", plan)); assert poses <= set(names), poses - set(names)
mid2 = '\n'.join(L[i_plan_end + 1:i_sc])
mid2 = mid2.replace(r"str.split(/\{(\w)\}/)", r"str.split(/\{([a-z])\}/)").replace(r"s.replace(/\{\w\}/g, '')", r"s.replace(/\{[a-z]\}/g, '')")
assert r"\{([a-z])\}" in mid2 and r"\{[a-z]\}/g" in mid2
helpers = '\n'.join(L[i_sq:i_cold])
kit = ''.join((K / 'kit' / f).read_text(encoding='utf-8') for f in ['common12.js', 'helpers12.js', 'common_head.js', 'widgets12.js', 'spkit.js'])
scen = kit + (EP / 'src' / f'scenes_sp{N}.js').read_text(encoding='utf-8')
used = set(re.findall(r"sprite\('(\w+)'", scen)) | set(re.findall(r"pose: '(\w+)'|[gd]pose: '(\w+)'", scen) and []) ; assert used <= set(names), used - set(names)
for k in ['gpose', 'dpose', 'pose']:
    for v in re.findall(k + r": '(\w+)'", scen): assert v in names, v
foot = '\n'.join(l for l in L[i_main:] if not l.startswith("['branch', 'conflict'"))
out = '\n'.join([head, *text, mid, plan, mid2, '// ================= 场景 =================', 'const SC = {};', 'const SFX_FNS = [];', helpers, scen, foot])
(EP / 'web').mkdir(exist_ok=True); (EP / 'web' / 'engine.js').write_text(out, encoding='utf-8')
print('engine lines', out.count('\n') + 1, 'sprites', len(names))
