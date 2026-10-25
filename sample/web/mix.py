# 按 timeline.json 混音：人声 + 音效 + BGM（人声闪避）
import json, numpy as np, soundfile as sf
from pathlib import Path
P = Path(__file__).resolve().parents[1]; A = P / 'audio'; W = P / 'web'; S = P.parent / 'audio'  # S：各集共用的音效目录
tl = json.loads((W / 'out' / 'timeline.json').read_text(encoding='utf-8'))
SR = 48000; N = int((tl['total'] + 0.5) * SR)
vo = np.zeros((N, 2)); fx = np.zeros((N, 2))
def place(buf, x, t, g=1.0, pan=0.0):
    if x.ndim == 1: x = np.stack([x * (1 - pan), x * (1 + pan)], 1)
    i = int(t * SR); n = min(len(x), N - i)
    if n > 0 and i >= 0: buf[i:i + n] += x[:n] * g
for s in tl['seq']:
    x, _ = sf.read(A / 'vo48' / f"{s['id']}.wav"); place(vo, x, s['vo'], 1.0, -0.06 if s['id'][0] == 'g' else 0.06)
for e in tl['sfx']:
    x, _ = sf.read(S / 'sfx48' / f"{e['name']}.wav"); place(fx, x, e['t'], 0.55 * e['gain'])
bg, _ = sf.read(S / 'sfx48' / 'bgm.wav'); bg = bg[:N] if len(bg) >= N else np.pad(bg, ((0, N - len(bg)), (0, 0)))
# 闪避包络
lv = np.abs(vo).max(1); k = int(0.05 * SR)
lv = np.convolve(lv, np.ones(k) / k, 'same'); duck = 1 - 0.55 * np.clip(lv / 0.15, 0, 1)
a = np.exp(-1 / (0.12 * SR)); env = np.empty_like(duck); s = 1.0
for i in range(0, N, 64): s = a ** 64 * s + (1 - a ** 64) * duck[i]; env[i:i + 64] = s
bgm_gain = 0.30
fade = int(0.4 * SR); env[:fade] *= np.linspace(0, 1, fade)
mix = vo * 1.0 + fx + bg * bgm_gain * env[:, None]
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix *= 0.95 / max(1e-6, np.abs(mix).max())
sf.write(W / 'out' / 'mix.wav', mix.astype(np.float32), SR, subtype='PCM_16'); print('mix', round(N / SR, 2), 's')
