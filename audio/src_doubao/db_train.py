# 豆包：数据格式化 (1a/1b/sv/1c) -> SoVITS(v2ProPlus) -> GPT 训练
import os, sys, json, subprocess, yaml, glob
G = r'E:/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0'; os.chdir(G)
W = r'E:/AI/TTS/doubao_train'; PY = sys.executable; VER = 'v2ProPlus'; EXP = 'doubao'
S2_EPOCH = int(os.environ.get('S2_EPOCH', 10)); S1_EPOCH = int(os.environ.get('S1_EPOCH', 15))
opt = f'logs/{EXP}'; os.makedirs(opt, exist_ok=True)
lst = os.environ.get('DB_LIST', f'{W}/asr/clean.list')
base = dict(version=VER, is_half='True', exp_name=EXP, opt_dir=opt, inp_text=lst, inp_wav_dir=f'{W}/sliced', i_part='0', all_parts='1', _CUDA_VISIBLE_DEVICES='0',
            bert_pretrained_dir='GPT_SoVITS/pretrained_models/chinese-roberta-wwm-ext-large', cnhubert_base_dir='GPT_SoVITS/pretrained_models/chinese-hubert-base',
            sv_path='GPT_SoVITS/pretrained_models/sv/pretrained_eres2netv2w24s4ep4.ckpt', pretrained_s2G=f'GPT_SoVITS/pretrained_models/v2Pro/s2G{VER}.pth', s2config_path=f'GPT_SoVITS/configs/s2{VER}.json')
env = dict(os.environ, **base)
def run(script): print('>>', script, flush=True); subprocess.run([PY, '-s', script], env=env, check=True)
if not os.path.exists(f'{opt}/2-name2text.txt'):
    run('GPT_SoVITS/prepare_datasets/1-get-text.py'); os.replace(f'{opt}/2-name2text-0.txt', f'{opt}/2-name2text.txt')
run('GPT_SoVITS/prepare_datasets/2-get-hubert-wav32k.py'); run('GPT_SoVITS/prepare_datasets/2-get-sv.py')
if not os.path.exists(f'{opt}/6-name2semantic.tsv'):
    run('GPT_SoVITS/prepare_datasets/3-get-semantic.py')
    body = open(f'{opt}/6-name2semantic-0.tsv', encoding='utf8').read().strip('\n')
    open(f'{opt}/6-name2semantic.tsv', 'w', encoding='utf8').write('item_name\tsemantic_audio\n' + body + '\n'); os.remove(f'{opt}/6-name2semantic-0.tsv')
print('format done', flush=True)
# ---- SoVITS ----
d = json.load(open(f'GPT_SoVITS/configs/s2{VER}.json'))
t = d['train']; t.update(batch_size=4, epochs=S2_EPOCH, text_low_lr_rate=0.4, pretrained_s2G=base['pretrained_s2G'], pretrained_s2D=f'GPT_SoVITS/pretrained_models/v2Pro/s2D{VER}.pth',
                     if_save_latest=True, if_save_every_weights=True, save_every_epoch=5, gpu_numbers='0', grad_ckpt=False, lora_rank=32)
d['model']['version'] = VER; d['data']['exp_dir'] = d['s2_ckpt_dir'] = opt; d['save_weight_dir'] = f'SoVITS_weights_{VER}'; d['name'] = EXP; d['version'] = VER
os.makedirs(f'{opt}/logs_s2_{VER}', exist_ok=True); os.makedirs('TEMP', exist_ok=True); os.makedirs(d['save_weight_dir'], exist_ok=True)
json.dump(d, open('TEMP/tmp_s2_doubao.json', 'w'))
print('>> s2_train', flush=True); subprocess.run([PY, '-s', 'GPT_SoVITS/s2_train.py', '--config', 'TEMP/tmp_s2_doubao.json'], env=env, check=True)
# ---- GPT ----
y = yaml.load(open('GPT_SoVITS/configs/s1longer-v2.yaml'), Loader=yaml.FullLoader)
y['train'].update(batch_size=4, epochs=S1_EPOCH, save_every_n_epoch=5, if_save_every_weights=True, if_save_latest=True, if_dpo=False, half_weights_save_dir=f'GPT_weights_{VER}', exp_name=EXP)
y['pretrained_s1'] = 'GPT_SoVITS/pretrained_models/s1v3.ckpt'; y['train_semantic_path'] = f'{opt}/6-name2semantic.tsv'; y['train_phoneme_path'] = f'{opt}/2-name2text.txt'; y['output_dir'] = f'{opt}/logs_s1_{VER}'
os.makedirs(y['train']['half_weights_save_dir'], exist_ok=True)
yaml.dump(y, open('TEMP/tmp_s1_doubao.yaml', 'w'), default_flow_style=False)
env['hz'] = '25hz'
print('>> s1_train', flush=True); subprocess.run([PY, '-s', 'GPT_SoVITS/s1_train.py', '--config_file', 'TEMP/tmp_s1_doubao.yaml'], env=env, check=True)
print('TRAIN DONE', glob.glob(f'SoVITS_weights_{VER}/{EXP}*'), glob.glob(f'GPT_weights_{VER}/{EXP}*'), flush=True)

