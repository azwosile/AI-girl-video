# AI娘 Git课

用 AI 娘角色讲 Git 的系列短视频。讲师 GitHub娘 讲解，学生 大肥鱼 提问；风格为“贴纸人 MG + 花字”，节奏快。
画面由网页引擎逐帧渲染，配音用 TTS，音效与 BGM 由程序合成。

## 当前进度

| 集数 | 内容 | 状态 | 成片 |
|---|---|---|---|
| 样片 | Git 三步走（44 秒） | 已完成 | `web/out/AI娘Git课_样片.mp4` |
| 第1集 | 存档 · 读档 · 平行世界 + 实战连贯操作，片尾曲《花の塔》，4分56秒 | 已完成（v4） | `ep1/web/out/AI娘Git课_第1集.mp4` |
| 第2集 | GitHub 云存档 | 待制作 | — |

第1集的历史版本：`ep1/v1/`（4分51秒，节奏慢）、`ep1/v2/`（3分23秒，只有“存档”部分）、`ep1/v3/`（4分27秒，三集合一，无实战段）。

## 目录结构

```
AI娘Git课/
├─ README.md              ← 本文件
├─ docs/                  ← 全部文档
│  ├─ 制作流程.md          流水线、参数、常见坑
│  ├─ 系列大纲.md          每集内容规划
│  ├─ 第1集_脚本.md        字幕版完整脚本（由引擎自动导出）
│  ├─ 第1集_讲义.md        观众向命令速查，可放到简介或专栏
│  ├─ 素材与授权.md        声音、形象、字体、音乐的来源和许可
│  └─ 反馈与决策记录.md    历次修改意见和对应改动
├─ audio/
│  ├─ ref/                大肥鱼参考音（数据集 dwg_0002/0031/0033/0036/0053）
│  ├─ sfx/ sfx48/         程序音效与 BGM（sfx.py / bgm.py 生成；sfx48 为 48k 转码）
│  └─ sfx.py  bgm.py      音效 / BGM 生成脚本
├─ ep1/                   第1集
│  ├─ vo/                 原始配音：G**_**.ogg（GitHub娘，按句切好）、D**.wav（大肥鱼）
│  ├─ vo48/               prep.py 处理后的 48k 配音（提速、压停顿、裁静音）
│  ├─ web/                渲染工程
│  │  ├─ engine.js        引擎 + 台词 + 时间轴 + 全部场景
│  │  ├─ index.html       载入引擎与 durations.json
│  │  ├─ prep.py          配音处理 → durations.json
│  │  ├─ render.py        Chrome 无头逐帧导出 → out/video.mp4
│  │  ├─ mix.py           人声 + 音效 + BGM（人声闪避）→ out/mix.wav
│  │  ├─ build.sh         一键全流程
│  │  ├─ sprites/         表情差分 webp（GitHub娘 5 张 + 大肥鱼 10 张）
│  │  └─ fonts/           得意黑子集
│  └─ v1/ v2/             旧版成片
├─ 外源/                  外部素材（片尾曲 さユり - 花の塔.mp3，mix.py 自动读取）
├─ web/                   样片工程（结构同上，已定稿，仅作参考）
└─ assets/sprites/        样片阶段的 6 张差分（第1集已改用 ep1/web/sprites）
```

## 快速开始（出第1集）

```bash
# 1) 先启动 GPT-SoVITS API（只有重新生成大肥鱼台词时才需要）
cd /e/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0
./runtime/python.exe -I api_v2.py -a 127.0.0.1 -p 9880 -c GPT_SoVITS/configs/tts_v5.yaml

# 2) 一键：配音处理 → 渲染 → 混音 → 成片（约 5–7 分钟）
cd /e/AI/AI娘课程/AI娘GIt课/ep1/web && ./build.sh
```

预览：浏览器直接打开 `ep1/web/index.html` 会循环播放，可拖动查看任意时刻（不带声音）。

详细步骤和改台词的方法见 `docs/制作流程.md`。

## 仓库

- 本地：`E:\AI\AI娘课程\AI娘GIt课`（2026-10-25 从 `E:\AI\AI娘Git课` 迁入）
- 远端：https://github.com/azwosile/AI-girl-video
- 仓库只放源文件（脚本、引擎、文档、立绘、原始配音、音效源）。成片、`out/`、`vo48/`、`sfx48/` 由 `build.sh` 重新生成；`外源/` 里的版权音乐不上传，需要时手动放回。
