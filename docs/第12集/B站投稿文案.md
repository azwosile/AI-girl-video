# AI娘Git课 第12集 · B站投稿文案

> 视频：`ep12/web/out/AI娘Git课_第12集.mp4`（4:17，1080p，-16.0 LUFS），GitHub Release `ep12` 里有同一份。
> 封面：`cover/export/AI娘Git课_第12集_封面_16x9.jpg`（1920×1080，横版）、`cover/export/AI娘Git课_第12集_封面_4x3.jpg`（1440×1080，首页信息流）。
> 时间戳已按实际成片（4:17）校准。本集是**正片最终集**。

## 标题（≤80 字，选一个）

格式沿用前几集：钩子在前 → 知识点关键词 → “N分钟入门【AI娘Git课1N】”。

| # | 标题 | 钩子 |
|---|------|------|
| ⭐1 | 团队怎么用Git？分支保护、CODEOWNERS、Squash合并、打标签自动发Release，毕业篇 5分钟入门【AI娘Git课12】 | 悬念 + 知识点 |
| 2 | 管理员直接推main把网站搞白屏？保护规则不许绕过｜GH006 / 代码负责人审查 5分钟入门【AI娘Git课12】 | 踩坑向 |
| 3 | 合并按钮三个选项到底选哪个？merge / squash / rebase 一次讲清 + 团队工作流七步走 5分钟入门【AI娘Git课12】 | 搜索向 |
| 4 | 推一个标签就自动发版本！GitHub Actions + Release 自动发布，Git课正片完结 5分钟入门【AI娘Git课12】 | 结果向 |

推荐 1：和封面“团队怎么用 Git？毕业篇！”对得上，四个知识点都在标题里。想走搜索流量可以选 3（“merge / squash / rebase 区别”是高频问题）。

## 分区 / 类型
- 类型：自制
- 分区：科技 · 计算机技术（备选：知识 · 校园学习）
- **创作声明：勾选“使用 AI 合成技术”**（配音和立绘都是 AI 生成的）
- 合集：放进“AI娘Git课”合集，排在第11集后面（正片最后一集）

## 标签（10 个）
Git, GitHub, 分支保护, CODEOWNERS, 代码审查, Squash, GitHub Actions, Release, 团队协作, AI娘

## 简介

```
刚合并完网站就白屏？管理员直接推了 main？三十个 PR 排队没人审？批准之后又偷偷推了提交？合并按钮的三个选项到底选哪个？
正片最终集！GitHub娘 带大家把前十一集拼成一整套团队工作流，大肥鱼毕业啦！

00:00 开场：刚合并完白饭页就白屏，有人直接推了 main
00:16 不许绕过：管理员也得走 PR、GH006（Grok）
00:39 CODEOWNERS：按文件分负责人、代码负责人批准（Claude）
01:04 批准与检查：新提交让旧批准作废、状态检查（Gemini）
01:28 三种合并：merge / squash / rebase、自动删分支（豆包）
01:59 自动发布：推标签自动发 Release（千问）
02:28 团队工作流七步走（Kimi）
02:55 复习速查：守 / 合 / 发
03:13 毕业实战：白饭页 2.0 团队发布
03:46 毕业典礼
04:02 正片完结 + 番外预告

保护规则：必须走 PR、不许强制推送和删除；默认管理员能绕过，勾上 Do not allow bypassing the above settings 才对谁都一样；直接推会收到 GH006: Protected branch update failed
CODEOWNERS：放进 .github/，一行“路径 + 负责人”（/docs/ @claude、*.css @gemini），改到谁的文件就自动请谁审；再勾 Require review from Code Owners
批准与检查：Dismiss stale approvals（推新提交旧批准作废）；Require status checks（选第7集的 Actions 检查，红叉不能合并）；分支先和 main 同步、评论都处理完
三种合并：Create a merge commit 保留全部提交 + 合并提交；Squash and merge 整个 PR 压成一个提交；Rebase and merge 历史一条直线；设置里只留团队选定的方式，打开 Automatically delete head branches
自动发布：工作流 on: push: tags: ['v*']，先打包，再 gh release create --generate-notes 附上文件；permissions: contents: write；以后只要 git tag -a v2.0.0 + git push origin v2.0.0
团队工作流七步：Issue 分任务 → 开分支 → 小步提交 → 发 PR 写 Closes #编号 → 检查跑绿 + 负责人审查 → 选好方式合并并删分支 → 打标签自动发布；出岔子看第4集后悔药、第9集侦探、第11集体检

上一集：第11集《仓库体检》（BV 号自己补）
系列合集：AI娘Git课（正片 12 集完结，之后还有番外：SSH 多账号、图形界面工具）

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
毕业考试速查：
守 → 保护规则谁都不许绕过；PR 要批准，新提交让旧批准作废，检查不绿不合并
合 → CODEOWNERS 自动请对的人来审；合并方式团队统一，合完自动删分支
发 → 推送 v 开头的标签，Actions 自动打包、写更新说明、发 Release
正片 12 集完结啦！你的团队用哪种合并方式？评论区说说👇 番外想先看 SSH 多账号还是图形界面工具？
```

## 发布前检查
- [ ] 用实际渲染时间替换简介里的时间戳（按渲染时间轴 TIMELINE 取各段起点）
- [ ] 封面上传 16:9，B站会自动生成 4:3，如果裁坏了就手动换成 4:3 版
- [ ] 时间戳格式正确，可以点击跳转
- [ ] 勾选 AI 合成声明
- [ ] 《花の塔》可能触发 BGM 版权识别；如果被限流，可以考虑把片尾换成免版权曲
- [ ] 合集简介可以改成“正片 12 集已完结”
- [ ] 简介里的 dafeiyu/rice-page、Issue #20、feat/dark-mode、v2.0.0、@claude / @gemini 都是演示用的例子，不是真实仓库或账号
