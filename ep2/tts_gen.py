# -*- coding: utf-8 -*-
"""第2集配音：GPT-SoVITS v5 零样本，GitHub娘与大肥鱼都走本地 API（127.0.0.1:9880）。
GitHub娘的参考音取自第1集她自己的台词（audio/ref_g/），保证跨集音色一致。

用法（先启动 GPT-SoVITS API，见 README）：
    PY=/e/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0/runtime/python.exe
    $PY ep2/tts_gen.py                 # 生成缺失的句子 → ep2/vo/*.wav
    $PY ep2/tts_gen.py --only G04_02 D03 --force
每句单独生成，不需要 cut.py 切句。
"""
import argparse, json, sys, time, urllib.request
from pathlib import Path

EP = Path(__file__).resolve().parent; ROOT = EP.parent
API = 'http://127.0.0.1:9880/tts'

G_REF = {  # 主参考 + 辅助参考（v2 起支持多参考融合音色）
    # 主参考选带英文的句子：GPT-SoVITS 会模仿参考音里的英文读法，git / push 更清楚
    'main': ('G07_01', '用 git log，就能看到所有的存档记录。'),
    'aux': [],  # 多参考融合在 v5 下会让 GitHub娘 胡言乱语，已停用
    'alt': ('G02_06', '以后每一次存档，都会签上你的名字，谁改的一清二楚。'),
}
# 逐句微调（ASR 抽查后选定）：换参考音 / 换随机种子
G_OVERRIDE = {'G01_05': {'ref': 'alt'}, 'G08_04': {'ref': 'alt'}, 'G07_04': {'seed': 7}}
D_REF = {
    'panic': ('dwg_0036', '别、别突然从后面叫我，我真的会被你吓到。刚才屏幕为什么自己亮了？我明明没有碰它。'),
    'think': ('dwg_0053', '嗯，让我想想，这件事其实没有你想象中那么复杂。'),
    'daily': ('dwg_0002', '什么嘛，这么简单的事情，你居然专门跑来问我。'),
    'sigh': ('dwg_0033', '你又订阅别的人工智能了？行吧，我就当没看见。'),
    'easy': ('dwg_0031', '今天的海水温度刚刚好，特别适合一边摸鱼，一边认真工作。'),
}
D_MOOD = {'D01': 'panic', 'D02': 'daily', 'D03': 'think', 'D04': 'easy', 'D05': 'daily', 'D06': 'think',
          'D07': 'sigh', 'D08': 'easy', 'D09': 'panic', 'D10': 'think', 'D11': 'sigh', 'D12': 'easy'}
G_SPEED, D_SPEED, SEED = 1.0, 1.08, 1234


def units():
    s = json.loads((EP / 'script.json').read_text(encoding='utf-8'))
    for k, arr in s.items():
        if k.startswith('D'):
            yield k, arr[0]
        else:
            for i, t in enumerate(arr):
                yield f'{k}_{i + 1:02d}', t


def body(uid, text):
    if uid[0] == 'G':
        ov = G_OVERRIDE.get(uid, {})
        ref, prompt = G_REF[ov.get('ref', 'main')]
        return dict(text=text, text_lang='zh', ref_audio_path=str(ROOT / 'audio' / 'ref_g' / f'{ref}.ogg'),
                    **({'aux_ref_audio_paths': [str(ROOT / 'audio' / 'ref_g' / f'{a}.ogg') for a in G_REF['aux']]} if G_REF['aux'] else {}),
                    prompt_text=prompt, prompt_lang='zh', speed_factor=G_SPEED, media_type='wav', seed=ov.get('seed', SEED),
                    text_split_method='cut0', batch_size=1, top_k=15, top_p=1, temperature=1)
    ref, prompt = D_REF[D_MOOD.get(uid, 'daily')]
    return dict(text=text, text_lang='zh', ref_audio_path=str(ROOT / 'audio' / 'ref' / f'{ref}.wav'),
                prompt_text=prompt, prompt_lang='zh', speed_factor=D_SPEED, media_type='wav', seed=SEED,
                text_split_method='cut0', batch_size=1, top_k=15, top_p=1, temperature=1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', nargs='*'); ap.add_argument('--force', action='store_true')
    ap.add_argument('--seed', type=int, default=None)
    ap.add_argument('--out', default='vo', help='输出子目录（ep2/ 下）')
    a = ap.parse_args()
    out = EP / a.out; out.mkdir(exist_ok=True)
    todo = [(u, t) for u, t in units() if (not a.only or u in a.only)]
    for n, (u, t) in enumerate(todo, 1):
        f = out / f'{u}.wav'
        if f.exists() and not a.force:
            continue
        b = body(u, t)
        if a.seed is not None: b['seed'] = a.seed
        req = urllib.request.Request(API, json.dumps(b).encode('utf-8'), {'Content-Type': 'application/json'})
        t0 = time.time()
        for attempt in range(3):
            try:
                data = urllib.request.urlopen(req, timeout=300).read(); break
            except Exception as e:
                detail = e.read().decode('utf-8', 'ignore')[:300] if hasattr(e, 'read') else ''
                print(f'  {u} 第 {attempt + 1} 次失败：{e} {detail}', file=sys.stderr); time.sleep(3)
        else:
            raise SystemExit(f'{u} 生成失败')
        f.write_bytes(data)
        print(f'[{n}/{len(todo)}] {u} {time.time() - t0:.1f}s {t}', flush=True)


if __name__ == '__main__':
    main()
