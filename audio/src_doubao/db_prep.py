# 豆包音源：UVR5 人声分离 -> 切片 -> FunASR 标注
import os, sys, subprocess, glob
G = r'E:/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0'; os.chdir(G); sys.path.insert(0, G); sys.path.insert(0, G + '/tools/uvr5')
W = r'E:/AI/TTS/doubao_train'; PY = sys.executable
for d in ['vocal', 'inst', 'sliced', 'asr']: os.makedirs(f'{W}/{d}', exist_ok=True)
raw = f'{W}/raw.wav'
if not glob.glob(f'{W}/vocal/*.wav'):
    from bsroformer import Roformer_Loader
    m = 'tools/uvr5/uvr5_weights/model_bs_roformer_ep_317_sdr_12.9755'
    pre = Roformer_Loader(model_path=m + '.ckpt', config_path=m + '.yaml', device='cuda', is_half=True)
    pre._path_audio_(raw, f'{W}/inst', f'{W}/vocal', 'wav', False)
    del pre; import torch; torch.cuda.empty_cache()
print('vocal:', os.listdir(f'{W}/vocal'), flush=True)
voc = glob.glob(f'{W}/vocal/*.wav')[0]
subprocess.run([PY, '-s', 'tools/slice_audio.py', voc, f'{W}/sliced', '-34', '4000', '300', '10', '500', '0.9', '0.25', '0', '1'], check=True)
print('slices:', len(os.listdir(f'{W}/sliced')), flush=True)
subprocess.run([PY, '-s', 'tools/asr/funasr_asr.py', '-i', f'{W}/sliced', '-o', f'{W}/asr', '-s', 'large', '-l', 'zh', '-p', 'float16'], check=True)
print('asr:', os.listdir(f'{W}/asr'), flush=True)

