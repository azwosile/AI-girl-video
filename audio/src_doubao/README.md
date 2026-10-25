# 豆包声音训练素材

- `豆包的封神语录_音频.mp4`：用户提供（原路径 `C:\\Users\\Kurami_Utaho\\Downloads\\`），165.26 s，AAC 44.1 kHz 立体声。网络流传的豆包 App 语音合辑，**声音权利归字节跳动 / 原配音**，本系列只做非商用同人。
- `dataset/` + `clean.list`：去伴奏、切片、校对后的训练集，18 段 / 113.5 s（`路径|说话人|语言|文本`）。
  删掉的片段：提问者的声音（“豆包豆包…”“不是我只是想问…”“不是啊豆包…平板扔哪儿了”“豆包你是人类吗”）、含英文 brainstorm 的一段、识别乱码的一段。
- `db_prep.py`：UVR5 bs_roformer 去伴奏 → slice_audio 切片（-34 4000 300 10 500 0.9 0.25）→ ASR。
- `asr_local.py`：本地 Paraformer + VAD 识别（运行库里的标点模型加载失败，标点是人工补的）。
- `db_train.py`：数据格式化（1-get-text / 2-get-hubert / 2-get-sv / 3-get-semantic）→ s2_train（v2ProPlus，10 轮）→ s1_train（15 轮）。

训练机：RTX 5070 Laptop 8 GB，训练目录 `E:/AI/TTS/doubao_train/`，GPT-SoVITS 目录 `E:/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0/`。

权重（不进仓库，不分发）：
- `GPT_weights_v2ProPlus/doubao-e15.ckpt`
- `SoVITS_weights_v2ProPlus/doubao_e10_s250.pth`

使用：
```bash
cd /e/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0
./runtime/python.exe -I api_v2.py -a 127.0.0.1 -p 9881 -c GPT_SoVITS/configs/tts_doubao.yaml
# 另开终端，在项目根目录
$PY ep3/tts_doubao.py --ref r19
```
api_v2 可能改写 yaml；`tts_doubao.yaml.keep` 是原始备份。

> 仓库里只提交脚本、clean.list 和本说明；mp4 原片和 dataset/ 切片已在 .gitignore 中排除（第三方音频，不再分发）。
