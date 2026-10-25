# 统一转 48k wav、裁静音、写 durations.json（主机用 GPT-SoVITS runtime python 运行）
import json, subprocess, sys, numpy as np, soundfile as sf
from pathlib import Path
P = Path(__file__).resolve().parents[1]; A = P / 'audio'; W = P / 'web'; S = P.parent / 'audio'  # S：各集共用的音效目录
(A / 'vo48').mkdir(exist_ok=True); (S / 'sfx48').mkdir(exist_ok=True)
def to48(src, dst): subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(src), '-ar', '48000', '-ac', '1', str(dst)], check=True)
dur = {}
for f in sorted((A / 'vo').glob('*')):
    if f.suffix not in ('.wav', '.flac') or len(f.stem) != 2: continue
    d = A / 'vo48' / (f.stem + '.wav'); to48(f, d)
    x, sr = sf.read(d); e = np.abs(x) > 0.012; i = int(np.argmax(e)); j = len(x) - int(np.argmax(e[::-1]))
    x = x[max(0, i - int(.02 * sr)):min(len(x), j + int(.10 * sr))]
    pk = np.abs(x).max(); x = x / pk * 0.89  # 统一峰值
    sf.write(d, x, sr); dur[f.stem] = round(len(x) / sr, 3)
for f in sorted((S / 'sfx').glob('*')):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(f), '-ar', '48000', '-ac', '2', str(S / 'sfx48' / (f.stem + '.wav'))], check=True)
(W / 'durations.json').write_text(json.dumps(dur, ensure_ascii=False, indent=1), encoding='utf-8')
print(dur)
