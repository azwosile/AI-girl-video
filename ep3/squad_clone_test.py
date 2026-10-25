# -*- coding: utf-8 -*-
"""小队参考音克隆试验：每人用 audio/ref_squad 的参考音合成 1 句本集台词 + 1 句新句子，输出到 ep3/clone_test/。"""
import json, urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
refs = json.loads((ROOT / 'audio/ref_squad/refs.json').read_text(encoding='utf-8'))
subs = json.loads((ROOT / 'ep3/script.json').read_text(encoding='utf-8'))
NEW = '这一页我来负责，写完以后发个 PR，记得帮我看看。'.replace('PR', 'P R')
out = ROOT / 'ep3/clone_test'; out.mkdir(exist_ok=True)
for k, r in refs.items():
    first = next(v[0] for kk, v in subs.items() if kk[0] == k)
    for tag, text in (('line', first), ('new', NEW)):
        body = dict(text=text, text_lang='zh', ref_audio_path=str(ROOT / 'audio/ref_squad' / r['file']),
                    prompt_text=r['text'], prompt_lang='zh', speed_factor=1.0, media_type='wav', seed=1234,
                    text_split_method='cut0', batch_size=1, top_k=15, top_p=1, temperature=1)
        req = urllib.request.Request('http://127.0.0.1:9880/tts', json.dumps(body).encode(), {'Content-Type': 'application/json'})
        (out / f'{k}_{tag}.wav').write_bytes(urllib.request.urlopen(req, timeout=300).read())
        print(k, tag, 'ok', flush=True)
