# -*- coding: utf-8 -*-
"""番外3配音逐句 ASR 审核：Paraformer-large 识别 sp3/vo/*.wav，与朗读稿比对。
用法：$PY sp3/asr_sp.py [ID ...]  → sp3/qa_asr.tsv（ID、时长、字/秒、中文相似度、识别结果、朗读稿）"""
import os, sys, json, re, difflib, wave
try:
    import setuptools  # 提供 distutils 兼容层（Python 3.12 已移除 distutils）
except ImportError:
    pass
from pathlib import Path
EP = Path(__file__).resolve().parent
M = Path('E:/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0/tools/asr/models')
from funasr import AutoModel
am = AutoModel(model=str(M / 'speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch'),
               vad_model=str(M / 'speech_fsmn_vad_zh-cn-16k-common-pytorch'),
               punc_model=str(M / 'punc_ct-transformer_zh-cn-common-vocab272727-pytorch'), disable_update=True, device='cpu')
s = json.loads((EP / 'script.json').read_text(encoding='utf-8'))
exp = {}
for k, arr in s.items():
    if k[0] != 'G': exp[k] = arr[0]
    else:
        for i, t in enumerate(arr): exp[f'{k}_{i + 1:02d}'] = t
only = sys.argv[1:]
cjk = lambda t: ''.join(re.findall(r'[\u4e00-\u9fff]', t))
rows = []
for u, t in exp.items():
    if only and u not in only: continue
    f = EP / os.environ.get('VO', 'vo') / f'{u}.wav'
    if not f.exists(): rows.append((u, 0, 0, 0, 'MISSING', t)); continue
    with wave.open(str(f)) as w: dur = w.getnframes() / w.getframerate()
    r = am.generate(input=str(f))[0]['text']
    sim = difflib.SequenceMatcher(None, cjk(t), cjk(r)).ratio()
    rows.append((u, round(dur, 2), round(len(cjk(t)) / dur, 2) if dur else 0, round(sim, 3), r, t))
out = EP / os.environ.get('OUT', 'qa_asr.tsv')
with out.open('w', encoding='utf-8') as fo:
    for r in rows: fo.write('\t'.join(map(str, r)) + '\n')
print('done', len(rows), 'total_s', round(sum(r[1] for r in rows), 1), 'low', [r[0] for r in rows if r[3] < 0.9])
