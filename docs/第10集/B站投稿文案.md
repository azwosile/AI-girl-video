# AI娘Git课 第10集 · B站投稿文案

> 视频：`ep10/web/out/AI娘Git课_第10集.mp4`（4:10，1080p，-16.1 LUFS），GitHub Release `ep10` 里有同一份。
> 封面：`cover/export/AI娘Git课_第10集_封面_16x9.jpg`（1920×1080，横版）、`cover/export/AI娘Git课_第10集_封面_4x3.jpg`（1440×1080，首页信息流）。
> 时间戳已按实际成片（4:10）校准。

## 标题（≤80 字，选一个）

格式沿用前几集：钩子在前 → 知识点关键词 → “N分钟入门【AI娘Git课1N】”。

| # | 标题 | 钩子 |
|---|------|------|
| ⭐1 | 没有权限也能改别人的项目？Fork到第一个PR，参与开源 5分钟入门【AI娘Git课10】 | 悬念 + 知识点 |
| 2 | push被拒403？先Fork！upstream同步/跨仓库PR/Closes自动关issue 5分钟入门【AI娘Git课10】 | 踩坑向 |
| 3 | 第一次给开源项目提PR怎么做？零基础GitHub参与开源｜Fork/upstream/good first issue 5分钟入门【AI娘Git课10】 | 搜索向 |
| 4 | 被要求修改要关掉PR重开吗？同一分支继续推就行！开源贡献全流程 5分钟入门【AI娘Git课10】 | 误区向 |

推荐 1：和封面“没权限也能改？第一个开源 PR！”对得上，“Fork”“PR”“参与开源”都是常见搜索词。想突出踩坑可以选 2。

## 分区 / 类型
- 类型：自制
- 分区：科技 · 计算机技术（备选：知识 · 校园学习）
- **创作声明：勾选“使用 AI 合成技术”**（配音和立绘都是 AI 生成的）
- 合集：放进“AI娘Git课”合集，排在第9集后面

## 标签（10 个）
Git, GitHub, 参与开源, Fork, Pull Request, 开源, 版本控制, 编程入门, AI娘, 程序员

## 简介

```
天天用的开源小工具，README 里有个错别字，想修却没有写权限？
这集 GitHub娘 带你去“大饭店帮厨”：读规矩、找任务、复刻、同步、发 PR、改到合并，成为开源贡献者！

00:00 开场：想修开源项目的错别字，却没有写权限
00:22 读规矩：LICENSE / CONTRIBUTING / 行为准则（Claude）
00:53 找任务：good first issue、留言认领、开新 issue（Kimi）
01:22 push 被拒 403 → Fork、origin 与 upstream（Grok）
01:49 同步复刻：Sync fork / fetch + merge upstream（千问）
02:13 跨仓库 PR：base ← head、Closes #42、允许维护者编辑（豆包）
02:42 被要求修改：同一分支继续推送、Resolve、重新请求审查（Gemini）
03:08 复习速查：读 / 同 / 交
03:23 实战：第一个开源 PR 到合并
03:54 下集预告：仓库体检

读规矩：LICENSE（MIT 可商用/修改/分发，保留版权声明；没有许可证≠随便用）、CONTRIBUTING 贡献指南、行为准则
找任务：按 good first issue / help wanted 筛选；先在 issue 下留言认领，没有就开新 issue 写清问题、复现步骤和打算
Fork：没写权限 push 会 403 → 点 Fork 复刻到自己名下 → clone 自己的复刻（origin）→ git remote add upstream 原项目地址 → 开新分支再改
同步：复刻页 Sync fork → Update branch；或 git fetch upstream + git merge upstream/main + git push origin main；功能分支 git rebase main 跟上
发 PR：Compare & pull request，看清 base（原项目）← head（你的分支）；描述写 Closes #42，合并进默认分支时自动关 issue；勾选 Allow edits by maintainers
改到合并：被要求修改不用关 PR，同一分支继续推送就会自动更新；逐条回复、Resolve conversation，再 Re-request review

上一集：第9集《Git 侦探：blame / bisect》（BV 号自己补）
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
开源贡献速查：
读 → LICENSE / CONTRIBUTING / 行为准则；找 good first issue，先留言认领
同 → Fork → clone 自己的复刻 → git remote add upstream … → Sync fork 或 fetch upstream + merge
交 → 新分支推到 origin → Compare & pull request → 描述写 Closes #编号 → 被要求修改就在同一分支继续推
你的第一个开源 PR 是改了什么？评论区说说👇 下集：仓库体检，大文件和泄露的密码怎么救！
```

## 发布前检查
- [ ] 用实际渲染时间替换简介里的时间戳（按渲染时间轴 TIMELINE 取各段起点）
- [ ] 封面上传 16:9，B站会自动生成 4:3，如果裁坏了就手动换成 4:3 版
- [ ] 时间戳格式正确，可以点击跳转
- [ ] 勾选 AI 合成声明
- [ ] 《花の塔》可能触发 BGM 版权识别；如果被限流，可以考虑把片尾换成免版权曲
- [ ] 简介里的 octo-chef/rice-timer、#42、#88 都是演示用的例子，不是真实仓库
