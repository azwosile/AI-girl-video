# AI娘Git课 番外5 · B站投稿文案

> 视频：`sp5/web/out/AI娘Git课_番外5.mp4`（2:00，1080p，-16.2 LUFS）；GitHub Release `sp5` 里有同一份
> 封面：`cover/export/AI娘Git课_番外5_封面_16x9.jpg`（1920×1080）、`cover/export/AI娘Git课_番外5_封面_4x3.jpg`（1440×1080）
> 时间戳已按实际成片校准。

## 标题（选一个）

| # | 标题 | 钩子 |
|---|------|------|
| ⭐1 | 提交说明全是“修改”？约定式提交＋Git钩子自动把关！feat/fix/commit-msg 3分钟入门【AI娘Git课·番外5】 | 封面同款 |
| 2 | Git提交信息怎么写才规范？Conventional Commits 3分钟入门【AI娘Git课·番外5】 | 高频搜索问题 |
| 3 | 不按格式写就提交失败？commit-msg钩子＋core.hooksPath团队共享 3分钟入门【AI娘Git课·番外5】 | 反差 |

推荐 1：和封面“提交说明看不懂？规范与钩子！”对得上。2 是搜索量大的问题。

## 分区 / 类型
- 类型：自制
- 分区：科技 · 计算机技术（备选：知识 · 校园学习）
- **创作声明：勾选“使用 AI 合成技术”**
- 合集：放进“AI娘Git课”合集，排在番外4 后面

## 标签（10 个）
Git, GitHub, 约定式提交, Conventional Commits, Git钩子, commit-msg, 编程入门, AI娘, 程序员, 计算机

## 简介

```
翻提交历史全是“修改”“改了点”，自己都看不懂？GitHub娘教你一套通用写法，再让 Git 钩子帮你自动把关！

00:00 开场：看不懂的提交历史
00:16 好的说明：标题 + 空行 + 原因
00:27 约定式提交：feat / fix / docs、范围、破坏性改动、--grep
00:52 提交模板：commit.template
01:02 钩子：commit-msg、pre-commit、core.hooksPath、--no-verify
01:29 实战：给白饭页装上提交把关
01:47 下个番外：网页里写代码

速查：
fix(login): 修复按钮错位 · feat!: 删除旧接口
git log --oneline --grep "^fix"
git config --global commit.template ~/.gitmessage
git config core.hooksPath .githooks && chmod +x .githooks/commit-msg
# .githooks/commit-msg
grep -qE "^(feat|fix|docs)(\(.+\))?!?: " "$1" || { echo "提交说明格式不对！"; exit 1; }

千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0）
大肥鱼音色：da-fei-yu（CC BY-NC 4.0） · 片尾曲：さユり《花の塔》
配音和表情差分是 AI 生成的，仅供学习交流。
```

## 置顶评论
```
你的团队有提交规范吗？晒晒你见过最离谱的提交说明～ 下个番外：在网页里按一个键就能写代码！
```

## 发布前检查
- [x] 封面 16:9 + 4:3
- [x] 成片 QA（20 帧总览 + 响度 -16 LUFS 左右）
- [x] 时间戳按实际成片校准
- [x] GitHub Release `sp5`
