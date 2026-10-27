# AI娘 Git课

用 AI 娘角色讲 Git 的系列短视频，每集 4–5 分钟。讲师是 GitHub娘，学生是大肥鱼（DeepSeek 娘）；从第3集起，其他 AI 娘组成“AI 分工小队”一起出场。
风格是“贴纸人 MG + 花字”，节奏快。画面由网页引擎逐帧渲染，配音用 GPT-SoVITS 等 TTS，音效和 BGM 由程序合成。

## 成片

| 集数 | 内容 | 时长 | 下载（1080P） |
|---|---|---|---|
| 第1集 | Git 入门：存档 · 读档 · 平行世界 + 实战 | 4:56 | [Release ep1](https://github.com/azwosile/AI-girl-video/releases/tag/ep1) |
| 第2集 | GitHub 云存档：建库 · remote · push · clone · pull · 分支上云 · rejected · 不能上传的东西 + 实战 | 4:17 | [Release ep2](https://github.com/azwosile/AI-girl-video/releases/tag/ep2) |
| 第3集 | 联机模式：协作者 · Issue · 分支 + PR · 审查 · 冲突 · 保护 main · .gitignore · Fork + 实战；AI 分工小队登场 | 5:02 | [Release ep3](https://github.com/azwosile/AI-girl-video/releases/tag/ep3) |
| 第4集 | Git 后悔药大全：amend · stash · reset soft/mixed/hard · revert · reflog · 报错急救 + 实战 | 4:19 | [Release ep4](https://github.com/azwosile/AI-girl-video/releases/tag/ep4) |
| 第5集 | 版本号与发布：git tag 轻量/附注 · 删标签 · 推标签 · 回旧版修 bug · 语义化版本 · GitHub Releases + 实战 | 4:14 | [Release ep5](https://github.com/azwosile/AI-girl-video/releases/tag/ep5) |
| 番外1 | Git 小技巧：git config 设身份 · 别名 st / lg · git diff（--staged / --stat / 比较标签）· .gitignore 不生效怎么办 + 实战 | 2:20 | [Release sp1](https://github.com/azwosile/AI-girl-video/releases/tag/sp1) |
| 第6集 | GitHub Pages：开启 Pages · 网址格式 · 公开与密钥 · 404 与 index.html · 大小写与相对路径 · 自动部署与强制刷新 · .nojekyll · 个人主页与自定义域名 + 实战 | 4:14 | [Release ep6](https://github.com/azwosile/AI-girl-video/releases/tag/ep6) |
| 第7集 | GitHub Actions：workflow 任务单 · YAML 缩进 · 红叉绿勾与日志 · pull_request / 手动运行 · 定时 cron 与时区 · Secrets 密钥 · 状态徽章 + 实战 | 4:09 | [Release ep7](https://github.com/azwosile/AI-girl-video/releases/tag/ep7) |

成片不进仓库，统一放在 [Releases](https://github.com/azwosile/AI-girl-video/releases)，每集一个，附带 B站封面（16:9 + 4:3）。

## 目录结构

```
AI娘Git课/
├─ README.md                 ← 本文件
├─ docs/                     ← 全部文档（导航见 docs/README.md）
│  ├─ 系列大纲.md  制作流程.md  素材与授权.md  反馈与决策记录.md
│  ├─ 第1集/                 脚本.md · 讲义.md · B站投稿文案.md
│  ├─ 第2集/                 策划.md · B站投稿文案.md
│  ├─ 第3集/                 策划.md · B站投稿文案.md
│  ├─ 第4集/                 策划.md · B站投稿文案.md
│  ├─ 第5集/                 策划.md · B站投稿文案.md
│  ├─ 番外1/                 策划.md · B站投稿文案.md
│  ├─ 第6集/                 策划.md · B站投稿文案.md
│  └─ 第7集/                 策划.md · B站投稿文案.md
├─ ep1/ … ep7/  sp1/        ← 每集一个工程，结构相同（sp1 = 番外1）
│  ├─ _gen_script.py         台词源 → script.json（朗读稿）+ subtitles.json（字幕稿）
│  ├─ tts_gen.py             生成配音 → vo/
│  ├─ vo/                    定稿配音（ID 首字母 = 说话人）
│  └─ web/                   渲染工程：engine.js · index.html · prep.py · render.py · mix.py · build.sh · sprites/ · fonts/
│                            （out/ 成片、vo48/ 转码都由 build.sh 生成，不进仓库）
│  ep3/ 另有：qa/（逐句 ASR 审核）、tts_doubao.py（豆包自训练声音）、_archive/（换下来的旧配音和旧立绘）
│  ep4/ 另有：asr4.py（逐句 ASR 审核 → qa_asr.tsv）、tts_doubao.py、_archive/vo_v1/（重生成前的旧配音）
│  ep5/ 另有：asr5.py、tts_doubao.py、src/（引擎场景源码 plan5/scenes5 + build5.py 拼装脚本 + smoke.js 逐帧冒烟测试）
│  sp1/ 另有：asr_sp.py、qa_asr.tsv、src/（plan_sp/common_sp/scenes_sp + build_sp.py）
│  ep6/ 另有：asr6.py、qa_asr.tsv、src/（plan6/common6/scenes6a–c + build6.py + smoke.js + preview.js 无浏览器预览帧）
│  ep7/ 另有：asr7.py、qa_asr.tsv、src/（plan7/common7/scenes7a–c + build7.py + key7.py 抠绿幕 + smoke.js + preview.js）
├─ cover/                    ← B站封面：make.py 一键出 1–7 集和番外的 16:9 + 4:3（python make.py sp1 只出番外）；bg/ 背景图，export/ 成品
├─ audio/                    ← 各集共用的声音
│  ├─ ref/ ref_g/ ref_squad/ 大肥鱼 / GitHub娘 / 小队成员的参考音（GPT-SoVITS 克隆用）
│  ├─ sfx/  sfx.py  bgm.py   程序合成的音效与 BGM
│  └─ src_doubao/            豆包声音训练说明（原始音频只留本机）
├─ tools/key.py              绿幕抠图 → 去溢色 → 白描边贴纸（立绘用）
├─ sample/                   ← 最早的 44 秒样片工程（已定稿，仅作参考）
└─ 外源/                     ← 有版权的外部素材（片尾曲），不上传，mix.py 找不到会自动跳过
```

## 快速开始（以第7集为例）

```bash
# 1) 需要重新生成配音时才启动 GPT-SoVITS API
cd /e/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0
./runtime/python.exe -I api_v2.py -a 127.0.0.1 -p 9880 -c GPT_SoVITS/configs/tts_v5.yaml

# 2) 一键：配音处理 → 逐帧渲染 → 混音 → 成片（约 6 分钟）
cd /e/AI/AI娘课程/AI娘GIt课/ep7/web && ./build.sh

# 3) 封面
python cover/make.py 7
```

预览：浏览器直接打开 `epN/web/index.html`，会循环播放，可以拖动查看任意时刻（不带声音）。
详细步骤、参数、改台词的方法和常见坑见 `docs/制作流程.md`。

## 仓库

- 本地：`E:\AI\AI娘课程\AI娘GIt课`
- 远端：https://github.com/azwosile/AI-girl-video
- 仓库只放源文件（脚本、引擎、文档、立绘、定稿配音、音效源、封面）。成片放 Releases；`out/`、`vo48/`、`sfx48/` 由 `build.sh` 重新生成；`外源/` 里的版权音乐不上传。
- 素材授权见 `docs/素材与授权.md`：角色设计 ai-girls / ZipZipPipe，大肥鱼声音 da-fei-yu（CC BY-NC 4.0），豆包声音仅作非商用二创。整个项目非商用。
