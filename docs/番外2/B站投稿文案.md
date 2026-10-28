# AI娘Git课 番外2 · B站投稿文案

> 视频：`sp2/web/out/AI娘Git课_番外2.mp4`（2:08，1080p，-15.9 LUFS）；GitHub Release `sp2` 里有同一份
> 封面：`cover/export/AI娘Git课_番外2_封面_16x9.jpg`（1920×1080）、`cover/export/AI娘Git课_番外2_封面_4x3.jpg`（1440×1080）
> 时间戳已按实际成片校准。

## 标题（选一个）

| # | 标题 | 钩子 |
|---|------|------|
| ⭐1 | 公司号个人号分不清？一台电脑配两个GitHub账号！SSH密钥/ssh config/includeIf 3分钟入门【AI娘Git课·番外2】 | 封面同款痛点 |
| 2 | Password authentication is not supported？推送报错一次解决：SSH密钥配置 3分钟入门【AI娘Git课·番外2】 | 高频报错搜索 |
| 3 | 提交作者变成个人邮箱？SSH多账号＋自动切换邮箱 3分钟入门【AI娘Git课·番外2】 | 职场共鸣 |

推荐 1：和封面“公司号个人号分不清？SSH 多账号！”对得上。2 是搜索量很大的报错原文。

## 分区 / 类型
- 类型：自制
- 分区：科技 · 计算机技术（备选：知识 · 校园学习）
- **创作声明：勾选“使用 AI 合成技术”**
- 合集：放进“AI娘Git课”合集，排在番外1 后面

## 标签（10 个）
Git, GitHub, SSH, ssh-keygen, 多账号, includeIf, 编程入门, AI娘, 程序员, 计算机

## 简介

```
推送又要输密码，还报错 Password authentication is not supported？公司号和个人号还老串？GitHub娘教你配 SSH 钥匙，一台电脑两个号各用各的！

00:00 开场：密码不收了
00:14 造钥匙：ssh-keygen，私钥和公钥
00:31 交公钥：SSH and GPG keys、ssh -T 测试、remote set-url
00:50 两个账号：一把钥匙只能一个号，~/.ssh/config 起别名
01:13 提交身份：includeIf 按文件夹自动换邮箱
01:36 实战：两个号都配好
01:55 下个番外：图形界面工具

命令速查：
ssh-keygen -t ed25519 -C "邮箱"
ssh -T git@github.com
git remote set-url origin git@github.com:用户名/仓库.git
# ~/.ssh/config
Host github-work
  HostName github.com
  IdentityFile ~/.ssh/id_work
git clone git@github-work:公司/仓库.git
# ~/.gitconfig
[includeIf "gitdir:~/work/"]
  path = ~/.gitconfig-work

千问 / Claude / Gemini / Grok / 豆包(Seed) / Kimi 形象：ZipZipPipe · DeepSeek娘形象：上善无形 & ZipZipPipe（CC BY-NC-SA 4.0）
大肥鱼音色：da-fei-yu（CC BY-NC 4.0） · 片尾曲：さユり《花の塔》
配音和表情差分是 AI 生成的，仅供学习交流。
```

## 置顶评论
```
你是用 HTTPS 令牌还是 SSH？评论区说说～ 下个番外：不想敲命令？图形界面工具也能把 Git 用明白！
```

## 发布前检查
- [x] 封面 16:9 + 4:3
- [x] 成片 QA（20 帧总览 + 响度 -16 LUFS 左右）
- [x] 时间戳按实际成片校准
- [x] GitHub Release `sp2`
