#!/bin/bash
# 第5集配音（省内存版）：9880 先生成 56 句 → 临时启动豆包 API 9881 生成 2 句后关闭 → 逐句 ASR（CPU）
R="/e/AI/AI娘课程/AI娘GIt课"; PY=/e/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0/runtime/python.exe; GSV=/e/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0
cd "$R"
for i in $(seq 1 120); do curl -s -o /dev/null "http://127.0.0.1:9880/docs" && break; sleep 2; done; echo "api 9880 up"
$PY ep5/tts_gen.py && echo MAIN_VO_DONE
( cd "$GSV" && exec ./runtime/python.exe -I api_v2.py -a 127.0.0.1 -p 9881 -c GPT_SoVITS/configs/tts_doubao.yaml > /e/AI/ep5up/api_9881.log 2>&1 ) &
API=$!
for i in $(seq 1 120); do curl -s -o /dev/null "http://127.0.0.1:9881/docs" && break; sleep 2; done; echo "api 9881 up"
$PY ep5/tts_doubao.py --ref r19 && echo ALL_VO_DONE
kill $API 2>/dev/null; sleep 2; pkill -f "api_v2.py -a 127.0.0.1 -p 9881" 2>/dev/null; echo "api 9881 stopped"
ls ep5/vo | wc -l
$PY ep5/asr5.py 2>&1 | grep "^done"; cp ep5/qa_asr.tsv /e/AI/ep5up/qa_asr.tsv && echo ASR_DONE
