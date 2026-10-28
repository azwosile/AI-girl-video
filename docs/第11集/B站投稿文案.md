# AI娘Git课 第11集 · B站投稿文案

> 视频：`ep11/web/out/AI娘Git课_第11集.mp4`（4:18，1080p，-16.1 LUFS），GitHub Release `ep11` 里有同一份。
> 封面：`cover/export/AI娘Git课_第11集_封面_16x9.jpg`（1920×1080，横版）、`cover/export/AI娘Git课_第11集_封面_4x3.jpg`（1440×1080，首页信息流）。
> 时间戳已按实际成片（4:18）校准。

## 标题（≤80 字，选一个）

格式沿用前几集：钩子在前 → 知识点关键词 → “N分钟入门【AI娘Git课1N】”。

| # | 标题 | 钩子 |
|---|------|------|
| ⭐1 | 仓库越来越胖？大文件LFS、换行符、密钥泄露急救，给Git仓库做体检 5分钟入门【AI娘Git课11】 | 悬念 + 知识点 |
| 2 | push被拒：文件超过100MB？删了再提交也没用！Git LFS / filter-repo 5分钟入门【AI娘Git课11】 | 踩坑向 |
| 3 | 不小心把密码推上GitHub怎么办？先换密钥再清历史｜.gitignore / filter-repo / 推送保护 5分钟入门【AI娘Git课11】 | 搜索向 |
| 4 | 只是保存了一下整个文件全红？CRLF换行符和.gitattributes一次讲清 5分钟入门【AI娘Git课11】 | 误区向 |

推荐 1：和封面“仓库越来越胖？给仓库做体检！”对得上，三个知识点都在标题里。想走搜索流量可以选 3（“密码推上 GitHub”是高频问题）。

## 分区 / 类型
- 类型：自制
- 分区：科技 · 计算机技术（备选：知识 · 校园学习）
- **创作声明：勾选“使用 AI 合成技术”**（配音和立绘都是 AI 生成的）
- 合集：放进“AI娘Git课”合集，排在第10集后面

## 标签（10 个）
Git, GitHub, Git LFS, 大文件, 换行符, 密钥泄露, gitignore, 版本控制, 编程入门, AI娘

## 简介

```
推送被拒：设计稿 180 MB 超过上限？删了再提交还是不行？打开保存一下整个文件全红？密钥三个月前就推上去了？
这集 GitHub娘 带大家给仓库做一次体检：量体重、查指标、马上处理！

00:00 开场：推送被拒，设计稿 180 MB 超过上限
00:19 量体重：每个版本都存一份、count-objects、50 / 100 MB 限制（千问）
00:45 删了还被拒：rm --cached + amend、改写历史（Grok）
01:08 大文件：Git LFS、.gitattributes、指针文件、migrate（豆包）
01:45 整个文件全红：换行符 CRLF / LF、text=auto、renormalize（Gemini）
02:13 密钥泄露：先作废换新、.env + .gitignore（Claude）
02:41 清理历史：filter-repo、强制推送、推送保护（Kimi）
03:12 复习速查：瘦 / 齐 / 救
03:31 实战：白饭页全面体检
04:01 下集预告：毕业篇

量体重：Git 保存每个版本，大文件改几次仓库就胖几倍；git count-objects -vH 看 size-pack；超过 50 MB 警告、超过 100 MB 拒收，仓库最好别超过 1 GB
删了没用：删除只是新提交，历史里还在；没推送：git rm --cached + git commit --amend；推送过：改写历史（rebase -i / filter-repo）
Git LFS：git lfs install → git lfs track "*.psd" → 提交 .gitattributes；仓库只存指针（oid + size），用到才下载；git lfs migrate import 搬走历史里的大文件（会改写历史）；免费 10 GB 存储 + 每月 10 GB 流量；Pages 网站读不到 LFS 文件
换行符：Windows CRLF / Mac、Linux LF；.gitattributes 写 * text=auto，脚本 eol=lf，图片 binary；git add --renormalize . 整理一遍
密钥泄露：推上去就当已泄露，先去后台作废、换新；新密钥放 .env，写进 .gitignore，已跟踪的 git rm --cached
清历史：git filter-repo --sensitive-data-removal（--invert-paths --path 删文件 / --replace-text 替换）→ git push --force --mirror → 所有人重新克隆、旧分支变基别合并；旧 PR 缓存找 GitHub Support；推送保护会拦下新密钥

上一集：第10集《参与开源》（BV 号自己补）
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
仓库体检速查：
瘦 → 大文件交给 Git LFS（track + 提交 .gitattributes），历史里的用 git lfs migrate import 搬走，下载包放 Release
齐 → .gitattributes 写 * text=auto，git add --renormalize . 整理一遍
救 → 密钥推上去先作废换新 → .env + .gitignore → filter-repo --sensitive-data-removal → push --force --mirror → 所有人重新克隆
你的仓库体检结果怎么样？评论区晒一下 size-pack👇 下集：毕业篇，分支保护、打标签发版本、团队协作流程！
```

## 发布前检查
- [ ] 用实际渲染时间替换简介里的时间戳（按渲染时间轴 TIMELINE 取各段起点）
- [ ] 封面上传 16:9，B站会自动生成 4:3，如果裁坏了就手动换成 4:3 版
- [ ] 时间戳格式正确，可以点击跳转
- [ ] 勾选 AI 合成声明
- [ ] 《花の塔》可能触发 BGM 版权识别；如果被限流，可以考虑把片尾换成免版权曲
- [ ] 简介里的 dafeiyu/rice-page、白饭页设计稿.psd、sk_live_… 密钥都是演示用的例子，不是真实仓库或真实密钥
