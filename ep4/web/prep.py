# ep4：转 48k、提速（不变调）、压缩句内长停顿、裁首尾，写 durations.json
import json, os, re, subprocess, numpy as np, soundfile as sf
from pathlib import Path
EP = Path(os.environ.get('EP_DIR') or Path(__file__).resolve().parents[1]); ROOT = EP.parent
FF = os.environ.get('FFMPEG', 'ffmpeg')
TEMPO = {'G': 1.18, 'D': 1.1, 'Q': 1.1, 'C': 1.1, 'M': 1.1, 'X': 1.12, 'B': 1.05, 'K': 1.1}   # ep4 小队全部为 GPT-SoVITS 克隆，语速与讲师接近
MAX_SIL, KEEP_SIL = 0.22, 0.18          # 句内静音超过 0.22s 的压到 0.18s（v2：留一点气口，不连读，也不拖）
(EP / 'vo48').mkdir(exist_ok=True)
def ff(*a): subprocess.run([FF, '-loglevel', 'error', '-y', *map(str, a)], check=True)
def squeeze(x, sr):
    win = int(0.01 * sr); n = len(x) // win
    rms = np.sqrt((x[:n * win].reshape(n, win) ** 2).mean(1)); quiet = rms < 0.008
    out, i = [], 0
    while i < n:
        j = i
        while j < n and quiet[j] == quiet[i]: j += 1
        seg = x[i * win:j * win]
        if quiet[i] and (j - i) * 0.01 > MAX_SIL and i > 0 and j < n:
            k = int(KEEP_SIL * sr); seg = np.concatenate([seg[:k // 2], seg[-(k - k // 2):]])
        out.append(seg); i = j
    out.append(x[n * win:]); return np.concatenate(out)
dur = {}
for f in sorted((EP / 'vo').glob('*')):
    if not re.fullmatch(r'[GDQCMXBK]\d\d(_\d\d)?', f.stem) or f.suffix not in ('.wav', '.ogg', '.flac'): continue
    d = EP / 'vo48' / (f.stem + '.wav')
    ff('-i', f, '-af', f'atempo={TEMPO[f.stem[0]]}', '-ar', 48000, '-ac', 1, d)
    x, sr = sf.read(d); e = np.abs(x) > 0.012; i = int(np.argmax(e)); j = len(x) - int(np.argmax(e[::-1]))
    x = x[max(0, i - int(.015 * sr)):min(len(x), j + int(.06 * sr))]
    x = squeeze(x, sr); x = x / np.abs(x).max() * 0.89
    sf.write(d, x, sr); dur[f.stem] = round(len(x) / sr, 3)
if not os.environ.get('EP_DIR'):
    (ROOT / 'audio' / 'sfx48').mkdir(exist_ok=True)
    for f in sorted((ROOT / 'audio' / 'sfx').glob('*')): ff('-i', f, '-ar', 48000, '-ac', 2, ROOT / 'audio' / 'sfx48' / (f.stem + '.wav'))
(EP / 'web' / 'durations.json').write_text(json.dumps(dur, ensure_ascii=False, indent=0), encoding='utf-8')
print(len(dur), 'lines', round(sum(dur.values()), 1), 's')
