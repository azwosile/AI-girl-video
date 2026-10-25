# -*- coding: utf-8 -*-
"""逐句 ASR 审核（每次重配 / 出片后都跑）：Paraformer 识别 ep3/vo/*.wav，与朗读稿按无调拼音比对。
用法：$PY ep3/qa_asr.py [--src vo|vo48] [--only C02 X03]
输出：ep3/qa_asr.txt；相似度 < 0.85 的句子标 ⚠，需要人工复听或重配。"""
import argparse, difflib, json, os, re, sys
from pathlib import Path
EP = Path(__file__).resolve().parent
G = 'E:/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0'
ap = argparse.ArgumentParser(); ap.add_argument('--src', default='vo'); ap.add_argument('--only', nargs='*'); a = ap.parse_args()
sc = json.loads((EP / 'script.json').read_text(encoding='utf-8'))
ref = {}
for k, v in sc.items():
    if k[0] == 'G':
        for i, t in enumerate(v): ref[f'{k}_{i + 1:02d}'] = t
    else: ref[k] = v[0]
os.chdir(G); sys.path.insert(0, G)
from funasr import AutoModel
from pypinyin import lazy_pinyin
m = AutoModel(model='tools/asr/models/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch', disable_update=True, device='cuda')
EN = {'claude': '克劳德', 'grok': '格洛克', 'gemini': '杰米奈', 'kimi': '基米', 'github': '吉特哈布', 'git': '吉特', 'main': '曼恩', 'push': '普什', 'pull': '普尔', 'pr': '批阿', 'p r': '批阿', 'approve': '阿普鲁夫', 'readme': '瑞德米', 'read me': '瑞德米', 'env': '一恩威', 'mp4': '艾姆批四', 'force': '佛斯'}
def norm(s):
    s = s.lower()
    for e, z in sorted(EN.items(), key=lambda x: -len(x[0])): s = s.replace(e, z)
    s = re.sub(r'[^\w]', '', s)
    return ''.join(lazy_pinyin(s))
out, bad = [], []
for k in sorted(ref):
    if a.only and k not in a.only: continue
    f = EP / a.src / f'{k}.wav'
    if not f.exists(): out.append(f'?? {k} 缺音频'); continue
    t = m.generate(input=str(f))[0]['text'].replace(' ', '')
    r = difflib.SequenceMatcher(None, norm(t), norm(ref[k])).ratio()
    flag = '⚠' if r < 0.85 else 'OK'
    out.append(f'{flag} {k} {r:.2f} | ASR: {t} | 稿: {ref[k]}')
    if r < 0.85: bad.append(k)
(EP / 'qa_asr.txt').write_text('\n'.join(out) + f'\n\n低于 0.85：{" ".join(bad) or "无"}\n', encoding='utf-8')
print('lines', len(out), 'flagged', len(bad), bad)
