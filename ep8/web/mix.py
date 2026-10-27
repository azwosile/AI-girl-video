# ep8 混音（与第1、2集相同）：人声 + 音效 + BGM（人声闪避）
import json, numpy as np, soundfile as sf
from pathlib import Path
EP = Path(__file__).resolve().parents[1]; ROOT = EP.parent; SFXD = ROOT / 'audio' / 'sfx48'
tl = json.loads((EP / 'web' / 'out' / 'timeline.json').read_text(encoding='utf-8'))
SR = 48000; N = int((tl['total'] + 0.5) * SR)
vo = np.zeros((N, 2), np.float32); fx = np.zeros((N, 2), np.float32)
cache = {}
def load(p):
    if p not in cache: cache[p] = sf.read(p, dtype='float32')[0]
    return cache[p]
def place(buf, x, t, g=1.0, pan=0.0):
    if x.ndim == 1: x = np.stack([x * (1 - pan), x * (1 + pan)], 1)
    i = int(t * SR); n = min(len(x), N - i)
    if n > 0 and i >= 0: buf[i:i + n] += x[:n] * g
for s in tl['seq']:
    g = 1.0 if s['id'][0] == 'G' else 0.95
    place(vo, load(EP / 'vo48' / f"{s['id']}.wav"), s['vo'], g, -0.05 if s['id'][0] == 'G' else 0.05)
for e in tl['sfx']:
    place(fx, load(SFXD / f"{e['name']}.wav"), e['t'], 0.5 * e['gain'])
bg = load(SFXD / 'bgm.wav')
if len(bg) < N: bg = np.concatenate([bg] * (N // len(bg) + 1))
bg = bg[:N]
# 片尾曲：预告 + 三连时切入（BGM 淡出，歌曲从开头起播）
import subprocess
SONG = ROOT / '外源' / 'さユり - 花の塔.mp3'
tz = next((b['t0'] for b in tl['blocks'] if b['b'] == 'teaser'), None)
song = np.zeros((N, 2), np.float32)
if tz is not None and SONG.exists():
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-t', str(tl['total'] - tz + 1), '-i', str(SONG), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    x *= 0.13 / max(1e-6, np.sqrt(np.mean(x ** 2)))          # 统一到固定 RMS
    i0 = int((tz - 0.2) * SR); n = min(len(x), N - i0); song[i0:i0 + n] = x[:n]
    fi = int(0.25 * SR); song[i0:i0 + fi] *= np.linspace(0, 1, fi)[:, None]
    bg_cut = np.ones(N, np.float32); fo = int(0.8 * SR); bg_cut[i0:i0 + fo] = np.linspace(1, 0, fo); bg_cut[i0 + fo:] = 0
    bg = bg * bg_cut[:, None]
    print('song at', round(tz, 2), 's')
lv = np.abs(vo).max(1); k = int(0.05 * SR); lv = np.convolve(lv, np.ones(k) / k, 'same')
duck = 1 - 0.6 * np.clip(lv / 0.12, 0, 1)
a = np.exp(-64 / (0.15 * SR)); env = np.empty_like(duck); s = 1.0
for i in range(0, N, 64): s = a * s + (1 - a) * duck[i]; env[i:i + 64] = s
envd = env.copy()  # 未做首尾淡入淡出的闪避包络（0.4~1）
fade = int(0.5 * SR); env[:fade] *= np.linspace(0, 1, fade); env[-int(2 * SR):] *= np.linspace(1, 0, int(2 * SR))
song_env = 0.22 + 0.78 * np.clip((envd - 0.4) / 0.6, 0, 1) ** 2   # 人声时歌曲压到约 22%
fo2 = int(1.5 * SR); song_env[-fo2:] *= np.linspace(1, 0, fo2)
mix = vo + fx + bg * 0.24 * env[:, None] + song * song_env[:, None]
mix = np.tanh(mix * 1.1) / np.tanh(1.1); mix *= 0.95 / max(1e-6, np.abs(mix).max())
sf.write(EP / 'web' / 'out' / 'mix.wav', mix, SR, subtype='PCM_16'); print('mix', round(N / SR, 2), 's')
