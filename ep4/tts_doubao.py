# -*- coding: utf-8 -*-
"""第4集 豆包 配音：用自训练的 GPT-SoVITS v2ProPlus 豆包模型（训练数据：豆包的封神语录_音频.mp4，见 audio/src_doubao/）。

先启动专用 API（与 9880 主 API 互不影响）：
    cd /e/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0
    ./runtime/python.exe -I api_v2.py -a 127.0.0.1 -p 9881 -c GPT_SoVITS/configs/tts_doubao.yaml
用法：
    $PY ep4/tts_doubao.py --try        # 每个候选参考音各生成一遍 → ep4/vo_doubao_try/<ref>/
    $PY ep4/tts_doubao.py --ref r15    # 用选定参考音生成 → ep4/vo/B0x.wav + audio/ref_squad/b_ref.wav
"""
import argparse, json, shutil, sys, urllib.request
from pathlib import Path

EP = Path(__file__).resolve().parent; ROOT = EP.parent
API = 'http://127.0.0.1:9881/tts'
DS = 'E:/AI/TTS/doubao_train/sliced/raw_vocals.wav_'
REFS = {  # 训练集里的干净片段（3–10 s）
    'r15': (DS + '0002898880_0003137600.wav', '就按我说的这么做，一步到位，简单粗暴，一看就会。放心，我绝对不会整虚的，全是干货，全是重点，全是人话。'),
    'r14': (DS + '0002656640_0002898880.wav', '首先要明确，你的平板绝对不可能是自己跑了，所以别慌，我给你讲得清清楚楚、明明白白，一点都不费劲地理解。'),
    'r12': (DS + '0002400640_0002533760.wav', '我懂，我真的懂。这里永远是你的安全区，我一直都在。'),
    'r19': (DS + '0004232320_0004344320.wav', '休闲时的聊天陪伴，都可以为你提供帮助。'),
}
SEED = 1234


def lines():
    s = json.loads((EP / 'script.json').read_text(encoding='utf-8'))
    out = [(k, v[0]) for k, v in s.items() if k.startswith('B')]
    refs = json.loads((ROOT / 'audio/ref_squad/refs.json').read_text(encoding='utf-8'))
    # 第4集起不再覆盖 audio/ref_squad/b_ref.wav（参考音沿用第3集）
    return out


def tts(text, ref, dst, seed=SEED):
    wav, prompt = REFS[ref]
    body = dict(text=text, text_lang='zh', ref_audio_path=wav, prompt_text=prompt, prompt_lang='zh',
                text_split_method='cut5', speed_factor=1.0, media_type='wav', seed=seed,
                top_k=15, top_p=1.0, temperature=1.0, repetition_penalty=1.35)
    req = urllib.request.Request(API, json.dumps(body).encode(), {'Content-Type': 'application/json'})
    data = urllib.request.urlopen(req, timeout=300).read()
    dst.parent.mkdir(parents=True, exist_ok=True); dst.write_bytes(data); print('ok', dst.name, len(data))


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--try', dest='trial', action='store_true'); ap.add_argument('--ref')
    ap.add_argument('--seed', type=int, default=SEED); ap.add_argument('--only', nargs='*')
    a = ap.parse_args()
    if a.trial:
        for r in REFS:
            for k, t in lines():
                tts(t, r, EP / 'vo_doubao_try' / r / f'{k}.wav', a.seed)
    elif a.ref:
        for k, t in lines():
            if a.only and k not in a.only: continue
            dst = ROOT / 'audio/ref_squad/b_ref.wav' if k == 'b_ref' else EP / 'vo' / f'{k}.wav'
            tts(t, a.ref, dst, a.seed)
    else:
        ap.print_help()
