import os, sys, glob
G = r'E:/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0'; os.chdir(G)
from funasr import AutoModel
W = r'E:/AI/TTS/doubao_train'
m = AutoModel(model='tools/asr/models/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch', vad_model='tools/asr/models/speech_fsmn_vad_zh-cn-16k-common-pytorch', disable_update=True, device='cuda')
out = []
for f in sorted(glob.glob(f'{W}/sliced/*.wav')):
    try: t = m.generate(input=f)[0]['text']
    except Exception as e: t = ''; print('ERR', f, e)
    out.append(f'{f}|sliced|ZH|{t}')
open(f'{W}/asr/raw.list', 'w', encoding='utf-8').write('\n'.join(out) + '\n'); print('ASR OK', len(out))
