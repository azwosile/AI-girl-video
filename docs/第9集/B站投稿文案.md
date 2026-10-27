# AI娘Git课 第9集 · B站投稿文案

> 视频：`ep9/web/out/AI娘Git课_第9集.mp4`（4:15，1080p，-16.0 LUFS），GitHub Release `ep9` 里有同一份。
> 封面：`cover/export/AI娘Git课_第9集_封面_16x9.jpg`（1920×1080，横版）、`cover/export/AI娘Git课_第9集_封面_4x3.jpg`（1440×1080，首页信息流）。
> 时间戳已按实际成片（4:15）校准。

## 标题（≤80 字，选一个）

格式沿用前几集：钩子在前 → 知识点关键词 → “N分钟入门【AI娘Git课0N】”。

| # | 标题 | 钩子 |
|---|------|------|
| ⭐1 | 网页按钮突然没了，是谁改坏的？git blame/bisect抓出真凶 5分钟入门【AI娘Git课09】 | 悬念 + 知识点 |
| 2 | 一百个提交找一个bug？git bisect二分七次就抓到！blame/log -S/revert 5分钟入门【AI娘Git课09】 | 数字反差 |
| 3 | 改坏了直接reset删掉？推送过的提交要用revert！git cherry-pick摘提交 5分钟入门【AI娘Git课09】 | 踩坑向 |
| 4 | 怎么查某行代码是谁改的？零基础Git排查bug｜git blame/git log -S/GitHub Blame 5分钟入门【AI娘Git课09】 | 搜索向 |

推荐 1：和封面“按钮没了？七次抓真凶！”对得上，“git blame”“bisect”都是常见搜索词。想突出踩坑可以选 3。

## 分区 / 类型
- 类型：自制
- 分区：科技 · 计算机技术（备选：知识 · 校园学习）
- **创作声明：勾选“使用 AI 合成技术”**（配音和立绘都是 AI 生成的）
- 合集：放进“AI娘Git课”合集，排在第8集后面

## 标签（10 个）
Git, GitHub, git blame, git bisect, 排查bug, 版本控制, 编程入门, 零基础, AI娘, 程序员

## 简介

```
从周三开始，白饭页的“点菜”按钮不见了！一百多个提交，到底是哪次改坏的？
这集 GitHub娘 带你当一回 Git 侦探：翻卷宗、看指纹、二分排查，七次抓出真凶！

00:00 开场：白饭页的“点菜”按钮不见了
00:24 搜历史：log -- 文件、log -S、--grep / --author / --since（Kimi）
01:01 看每一行：blame、show、-w 忽略空白（Gemini）
01:41 二分抓 bug：bisect good / bad / skip / reset（Grok）
02:17 撤销：推送过的用 revert，不要 reset（Claude）
02:46 摘一个提交：cherry-pick -x（豆包）
03:14 复习速查：搜 / 查 / 修
03:31 实战：亲手抓出按钮的真凶
03:59 下集预告：参与开源

搜：git log -- index.html 只看动过这个文件的；git log -S "order-btn" 找代码出现 / 消失的提交；--grep / --author / --since 叠着用；GitHub 文件页点 History
查：git blame index.html（-L 40,50 只看几行，-w 忽略空白）；blame ≠ 背锅，拿编号用 git show 看完整改动；GitHub 的 Blame 页面能一层层往前查
二分：git bisect start → bad → good v1.2，看网页输 good / bad，100 个提交最多 7 次；跑不起来就 skip；查完 git bisect reset；有测试脚本用 git bisect run
修：推送过的提交用 git revert 留痕撤销（不要 reset 改写历史）；只要一个提交用 git cherry-pick，加 -x 记下来源

上一集：第8集《整理提交历史：变基 rebase》（BV 号自己补）
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
Git 侦探速查：
搜 → git log -- 文件 / git log -S "代码" / --grep --author --since
查 → git blame 文件（-L 行号、-w 忽略空白）→ git show 编号；不知道哪次就 git bisect（start / bad / good / skip / reset）
修 → 推送过的用 git revert；只要一个提交用 git cherry-pick -x
你用 blame 查到过最意外的“真凶”是谁？评论区说说👇 下集：参与开源，fork 到第一个 PR！
```

## 发布前检查
- [ ] 用实际渲染时间替换简介里的时间戳（按渲染时间轴 TIMELINE 取各段起点）
- [ ] 封面上传 16:9，B站会自动生成 4:3，如果裁坏了就手动换成 4:3 版
- [ ] 时间戳格式正确，可以点击跳转
- [ ] 勾选 AI 合成声明
- [ ] 《花の塔》可能触发 BGM 版权识别；如果被限流，可以考虑把片尾换成免版权曲
- [ ] 简介里的白饭页、e5f6a7 等提交都是演示用的例子
