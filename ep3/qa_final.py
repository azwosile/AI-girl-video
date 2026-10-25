# -*- coding: utf-8 -*-
"""成片逐句 ASR 审核：按 out/timeline.json 从成片里切出每句（含音乐和音效），Paraformer 识别后与朗读稿按拼音比对。
用法（项目根目录）：$PY ep3/qa_final.py  → ep3/qa_final.txt"""
import difflib, json, os, re, subprocess, sys
from pathlib import Path
import numpy as np, soundfile as sf
EP = Path(__file__).resolve().parent; OUT = EP / 'web' / 'out'
G = 'E:/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0'
mp4 = OUT / 'AI娘Git课_第3集.mp4'; wav = OUT / 'qa16k.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(mp4), '-vn', '-ac', '1', '-ar', '16000', str(wav)], check=True)
x, sr = sf.read(wav)
tl = json.loads((OUT / 'timeline.json').read_text(encoding='utf-8')); seq = tl['seq'] if isinstance(tl, dict) else tl
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
EN = {'claude': '克劳德', 'grok': '格洛克', 'gemini': '杰米奈', 'kimi': '基米', 'github': '吉特哈布', 'git': '吉特', 'main': '曼恩', 'push': '普什', 'pull': '普尔', 'p r': '批阿', 'pr': '批阿', 'approve': '阿普鲁夫', 'read me': '瑞德米', 'readme': '瑞德米', 'env': '一恩威', 'mp4': '艾姆批四', 'force': '佛斯'}
def norm(s):
    s = s.lower()
    for e, z in sorted(EN.items(), key=lambda q: -len(q[0])): s = s.replace(e, z)
    return ''.join(lazy_pinyin(re.sub(r'[^\w]', '', s)))
out, bad = [], []
for s in seq:
    k = s['id']
    if k not in ref: continue
    seg = x[int(s['vo'] * sr): int((s['vo'] + s['dur'] + 0.05) * sr)].astype(np.float32)
    t = m.generate(input=seg)[0]['text'].replace(' ', '')
    r = difflib.SequenceMatcher(None, norm(t), norm(ref[k])).ratio()
    out.append(f"{'⚠' if r < 0.85 else 'OK'} {k} {s['vo']:.1f}s {r:.2f} | ASR: {t} | 稿: {ref[k]}")
    if r < 0.85: bad.append(k)
(EP / 'qa_final.txt').write_text('\n'.join(out) + f'\n\n句数 {len(out)}；低于 0.85：{" ".join(bad) or "无"}\n', encoding='utf-8')
os.remove(wav); print('lines', len(out), 'flagged', bad)
