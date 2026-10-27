# AI娘Git课 第8集 · B站投稿文案

> 视频：`ep8/web/out/AI娘Git课_第8集.mp4`（4:20，1080p，-16.0 LUFS），GitHub Release `ep8` 里有同一份。
> 封面：`cover/export/AI娘Git课_第8集_封面_16x9.jpg`（1920×1080，横版）、`cover/export/AI娘Git课_第8集_封面_4x3.jpg`（1440×1080，首页信息流）。
> 时间戳已按实际成片（4:20）校准。

## 标题（≤80 字，选一个）

格式沿用前几集：钩子在前 → 知识点关键词 → “N分钟入门【AI娘Git课0N】”。

| # | 标题 | 钩子 |
|---|------|------|
| ⭐1 | 提交历史乱成麻？用变基剪成一条线！git rebase/squash/reword 5分钟入门【AI娘Git课08】 | 痛点 + 知识点 |
| 2 | 满屏Merge branch main看不懂？git pull --rebase/交互式变基合并提交 5分钟入门【AI娘Git课08】 | 千问的用户反馈 |
| 3 | 变基完推送被拒，直接--force？先看黄金法则！force-with-lease/reflog救回 5分钟入门【AI娘Git课08】 | 踩坑向 |
| 4 | merge和rebase到底有什么区别？零基础整理Git提交历史｜rebase -i/Squash and merge 5分钟入门【AI娘Git课08】 | 搜索向 |

推荐 1：和封面“历史乱成麻？剪成一条线！”对得上，“git rebase”“squash”都是常见搜索词。想突出踩坑可以选 3。

## 分区 / 类型
- 类型：自制
- 分区：科技 · 计算机技术（备选：知识 · 校园学习）
- **创作声明：勾选“使用 AI 合成技术”**（配音和立绘都是 AI 生成的）
- 合集：放进“AI娘Git课”合集，排在第7集后面

## 标签（10 个）
Git, GitHub, git rebase, 变基, 版本控制, 编程入门, 零基础, AI娘, 程序员, 计算机

## 简介

```
想给白饭页发个 PR，一看提交历史：改改、再改、真的好了……还到处都是分叉！
这集 GitHub娘 教你用变基 rebase 整理提交历史，像剪辑游戏录像一样，最后成片一条线！

00:00 开场：提交历史乱成一团还到处分叉
00:23 merge 和 rebase：打结 vs 一条直线，编号会变
00:41 变基拉取 pull --rebase / pull.rebase true（千问的用户反馈）
01:12 变基冲突：改好 → add → --continue，乱了 --abort（Claude）
01:33 rebase -i 合并碎提交：pick / squash / fixup（豆包）
02:07 改旧说明 reword、删提交 drop、调顺序（Gemini）
02:25 黄金法则与 --force-with-lease（Grok）
02:54 整理坏了：reflog 救回 + PR 合并方式（Kimi）
03:18 复习速查：接 / 剪 / 守
03:37 实战：甜点分支剪干净再提 PR
04:06 下集预告：Git 侦探 blame / bisect

接：git rebase main 接到最新；git pull --rebase 不留合并提交（或 git config --global pull.rebase true）
冲突：改好 → git add → git rebase --continue；乱了 git rebase --abort
剪：git rebase -i HEAD~4，pick / squash / fixup / reword / drop，清单顺序和 git log 相反
守：别人在用的分支不变基；强推用 git push --force-with-lease；main 开保护规则
救：git reflog 找到变基前的位置，git reset --hard HEAD@{5}
PR 合并按钮：Squash and merge 压成一个，Rebase and merge 排成一条线

上一集：第7集《GitHub Actions》（BV 号自己补）
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
变基 rebase 速查：
接 → git rebase main / git pull --rebase；冲突就 add，再 --continue（不行就 --abort）
剪 → git rebase -i HEAD~N：squash 合并、fixup 合并丢说明、reword 改说明、drop 删掉
守 → 别人在用的分支不变基；强推用 --force-with-lease；搞砸了翻 git reflog
你的提交历史里最离谱的一条说明是什么？评论区晒晒👇 下集（暂定）：Git 侦探 blame / bisect 抓真凶！
```

## 发布前检查
- [x] 用实际渲染时间替换简介里的时间戳（按渲染时间轴 TIMELINE 取各段起点）
- [ ] 封面上传 16:9，B站会自动生成 4:3，如果裁坏了就手动换成 4:3 版
- [ ] 时间戳格式正确，可以点击跳转
- [ ] 勾选 AI 合成声明
- [ ] 《花の塔》可能触发 BGM 版权识别；如果被限流，可以考虑把片尾换成免版权曲
- [ ] 简介里的白饭页、甜点菜单分支都是演示用的例子
