# AI娘Git课 第7集 · B站投稿文案

> 视频：`ep7/web/out/AI娘Git课_第7集.mp4`（4:09，1080p，-16.0 LUFS），GitHub Release `ep7` 里有同一份。
> 封面：`cover/export/AI娘Git课_第7集_封面_16x9.jpg`（1920×1080，横版）、`cover/export/AI娘Git课_第7集_封面_4x3.jpg`（1440×1080，首页信息流）。
> 时间戳已按实际成片（4:09）校准。

## 标题（≤80 字，选一个）

格式沿用前几集：钩子在前 → 知识点关键词 → “N分钟入门【AI娘Git课0N】”。

| # | 标题 | 钩子 |
|---|------|------|
| ⭐1 | 推送了坏页面被同学看见？用GitHub Actions请个检查机器人！workflow/红叉绿勾 5分钟入门【AI娘Git课07】 | 痛点 + 知识点 |
| 2 | 提交旁边一个红叉，这是真的吗？GitHub Actions看日志/PR自动检查/状态徽章 5分钟入门【AI娘Git课07】 | Grok 梗 |
| 3 | 设了早上八点，下午四点才跑？GitHub Actions定时任务/cron时区/Secrets密钥 5分钟入门【AI娘Git课07】 | 踩坑向 |
| 4 | push一下全自动！零基础写第一个GitHub Actions工作流｜yml/checkout/徽章 5分钟入门【AI娘Git课07】 | 实用向 |

推荐 1：和封面“检查机器人”对得上，“GitHub Actions”“workflow”都是常见搜索词。想突出踩坑可以选 3。

## 分区 / 类型
- 类型：自制
- 分区：科技 · 计算机技术（备选：知识 · 校园学习）
- **创作声明：勾选“使用 AI 合成技术”**（配音和立绘都是 AI 生成的）
- 合集：放进“AI娘Git课”合集，排在第6集后面

## 标签（10 个）
Git, GitHub, GitHub Actions, CI/CD, 自动化, 编程入门, 零基础, AI娘, 程序员, 计算机

## 简介

```
推送了一版白饭页，标签没关好，页面全乱，同学都看见了……
这集 GitHub娘 教你用 GitHub Actions：每次推送，GitHub 借你一台云电脑，按你写的任务单自动检查！

00:00 开场：推送了坏页面，同学都看见了
00:22 写任务单：.github/workflows/check.yml（name / on / jobs / steps）
00:55 YAML 缩进只用空格（Kimi 读完文档）
01:07 红叉是真的吗？看日志、自动重跑、免费额度（Grok）
01:37 PR 合并前自动检查 + 手动运行按钮（千问的用户反馈）
02:03 设了八点、四点才跑：cron 与 UTC 时区（Gemini）
02:33 密钥别写进代码：Secrets 与日志打码（Claude 审查）
02:51 README 挂绿牌子：状态徽章（豆包）
03:10 复习速查：写 / 看 / 管
03:27 实战：白饭页装上自动检查
03:55 下集预告：变基 rebase（暂定）

任务单：.github/workflows/check.yml（name / on / jobs / runs-on / steps，缩进只用空格）
看结果：黄点在跑、绿勾通过、红叉点进 Actions 展开步骤看日志
触发：push、pull_request（PR 页面显示检查）、workflow_dispatch（手动 Run workflow）
定时：cron 默认按 UTC，比北京时间慢 8 小时；或者加 timezone: Asia/Shanghai
密钥：Settings → Secrets and variables → Actions，用 ${{ secrets.名字 }} 取，日志自动打码
额度：公开仓库免费，私有仓库每月 2000 分钟免费

上一集：第6集《GitHub Pages》（BV 号自己补）
系列合集：AI娘Git课

—— 素材与鸣谢 ——
· AI娘角色设计：ai-girls / ZipZipPipe（DeepSeek 娘设计 CC BY-NC-SA）
· 大肥鱼声音素材：da-fei-yu（CC BY-NC 4.0）
· 豆包声音：用公开语音片段训练的 GPT-SoVITS 模型，非商用，仅作二创演示
· 片尾音乐：さユり《花の塔》（版权归原作者所有）
· 配音：GPT-SoVITS 等 AI 语音合成；画面：AI 生成立绘 + 自制动画
本视频仅作学习交流，不做商用。角色言行纯属玩梗，不代表各家 AI 产品官方。
```

## 置顶评论（可选）
```
GitHub Actions 速查：
写 → .github/workflows/xxx.yml：on 写触发，jobs → runs-on → steps（uses 借动作，run 跑命令），缩进只用空格
看 → 🟡 在跑 / ✅ 通过 / ❌ 点进 Actions 展开步骤看日志
管 → PR 前自动检查；定时记得 UTC；密钥放 Secrets，别写进代码
你想让机器人帮你自动干什么？评论区说说👇 下集（暂定）：用变基 rebase 整理提交历史！
```

## 发布前检查
- [x] 用实际渲染时间替换简介里的时间戳（按渲染时间轴 TIMELINE 取各段起点）
- [ ] 封面上传 16:9，B站会自动生成 4:3，如果裁坏了就手动换成 4:3 版
- [ ] 时间戳格式正确，可以点击跳转
- [ ] 勾选 AI 合成声明
- [ ] 《花の塔》可能触发 BGM 版权识别；如果被限流，可以考虑把片尾换成免版权曲
- [ ] 简介里的 `dafeiyu.github.io` / `sk-baifan-…` 只是演示，不是真实网址和密钥
