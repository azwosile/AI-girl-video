# -*- coding: utf-8 -*-
"""第6集台词唯一来源：同时生成 script.json（朗读稿，送 TTS）和 subtitles.json（字幕稿，贴进 engine.js 的 TEXT）。
改台词只改这里，然后运行：python ep6/_gen_script.py
每行：(ID, 字幕稿, 朗读稿或 None)。朗读稿为 None 时与字幕稿相同。

ID 首字母 = 说话人：
  G GitHub娘（讲师）  D 大肥鱼 / DeepSeek（组长）
  Q 千问  C Claude  M Gemini  X Grok  B 豆包  K Kimi   ← AI 分工小队
朗读稿规则（GPT-SoVITS）：行(háng)→航；Gemini→杰米奈；Claude→克劳德；命令参数读成“加 xx 参数”；~ 读“波浪号”；版本号 v1.0.1 读“V 一点零点一”；Grok 在大肥鱼台词里写“格洛克”。
第6集补充：main→主分支；push→推送；Settings→设置；index.html→index 点 H T M L；404→四零四；Jekyll→杰基尔；.nojekyll→点 no 杰基尔；网址读“大肥鱼 点 github 点 io 斜杠 白饭”；英文界面按钮一律读中文（从分支部署 / 保存 / 网站已上线 / 自定义域名 / 强制 HTTPS）。
"""
import json, re
from pathlib import Path

SPEAKERS = {'G': 'GitHub娘', 'D': '大肥鱼', 'Q': '千问', 'C': 'Claude', 'M': 'Gemini',
            'X': 'Grok', 'B': '豆包', 'K': 'Kimi'}

LINES = [
    # ---- cold 冷开场：发给同学，打开全是代码 ----
    ('D01', '白饭页发给同学，他们打开全是代码……能不能像真网站一样，点个链接就能看？', None),
    # ---- why 引入 + title ----
    ('G01_01', '能！GitHub Pages：把仓库里的网页直接变成网站，免费，还不用买服务器。', '能！GitHub Pages：把仓库里的网页，直接变成网站。免费，还不用买服务器。'),
    ('G01_02', '云存档只有自己翻；Pages 就是把它摆进展示柜，谁路过都能点开看。', '云存档，只有自己翻；Pages，就是把它摆进展示柜，谁路过都能点开看。'),
    ('G01_03', '欢迎来到 AI娘 Git 课，第六集，GitHub Pages！', '欢迎来到，AI 娘，Git 课！第六集，GitHub Pages！'),
    # ---- pages 开启（Claude：公开 + 不放密钥）----
    ('D02', '要怎么开？是不是还得装什么东西？', None),
    ('G02_01', '什么都不用装：打开仓库的 Settings，左边点 Pages。', '什么都不用装：打开仓库的设置页面，左边点 Pages。'),
    ('G02_02', 'Source 选 Deploy from a branch，分支选 main，文件夹选 /(root)，点 Save。', '来源选，从分支部署；分支选主分支，文件夹选根目录，点保存。'),
    ('G02_03', '网页要是放在 docs 文件夹里，文件夹就选 /docs，也一样能发布。', '网页要是放在 docs 文件夹里，文件夹就选斜杠 docs，也一样能发布。'),
    ('G02_04', '等一两分钟，上方出现 Your site is live，网址就有了。', '等一两分钟，上方出现提示：网站已上线，网址就有了。'),
    ('G02_05', '格式是 用户名.github.io/仓库名，大肥鱼的就是 dafeiyu.github.io/baifan。', '格式是：用户名，点 github 点 io，斜杠，仓库名。大肥鱼的，就是大肥鱼点 github 点 io，斜杠白饭。'),
    ('C01', '慢着。免费账号，仓库得是公开的；网站谁都能看，密码和密钥一个字都别放。', '慢着。免费账号，仓库得是公开的。网站谁都能看，密码和密钥，一个字都别放。'),
    ('G02_06', 'Claude 说得对。而且 Pages 只放静态网页：HTML、CSS、JavaScript，要登录、要数据库的后台，它跑不了。', '克劳德说得对。而且 Pages 只放静态网页：H T M L、C S S、Java Script；要登录、要数据库的后台，它跑不了。'),
    ('C02', '公开、无密钥、纯静态。可以上线。', None),
    # ---- index 404（千问：用户反馈）----
    ('Q01', '用户反馈：网址打开，是一个大大的 404！', '用户反馈：网址打开，是一个大大的四零四！'),
    ('D03', '啊？我明明点了 Save 啊！', '啊？我明明点了保存啊！'),
    ('G03_01', 'Pages 打开网址，先找一个叫 index.html 的首页，而且要放在你选的文件夹最外层。', 'Pages 打开网址，先找一个叫 index 点 H T M L 的首页，而且要放在你选的文件夹最外层。'),
    ('G03_02', '你的首页叫 baifan.html，它找不到首页，只好给你 404。', '你的首页叫白饭点 H T M L，它找不到首页，只好给你四零四。'),
    ('G03_03', '改名成 index.html，全部小写；提交、推送，等一会儿刷新就好了。', '改名成 index 点 H T M L，全部小写；提交、推送，等一会儿刷新就好了。'),
    ('Q02', '用户说打开了！还夸白饭页挺好看。', None),
    # ---- path 大小写 + 相对路径（Gemini：猫猫图裂了）----
    ('M01', '我给白饭页加了猫猫图，本地好好的，网上怎么是个裂开的图标？喵？', None),
    ('D04', '又是 Gemini……你图片放哪了？', '又是杰米奈……你图片放哪了？'),
    ('G04_01', '看一眼：文件叫 Cat.png，代码里写的是 cat.png，大小写不一样。', '看一眼：文件叫大写 C 的 Cat 点 png，代码里写的，是小写的 cat 点 png。'),
    ('G04_02', '你的电脑不分大小写，网站服务器分。差一个字母，它就找不到。', None),
    ('G04_03', '还有，路径别用斜杠开头：项目网站在 /baifan 下面，写 /img 会跑到网站最外层去找。', '还有，路径别用斜杠开头：项目网站在斜杠白饭下面，斜杠开头，会跑到网站最外层去找。'),
    ('G04_04', '用相对路径，比如 img/cat.png，本地和网上都能用。', '用相对路径，比如 img 斜杠 cat 点 png，本地和网上都能用。'),
    ('M02', '名字改成一样，猫猫出来了！', None),
    # ---- update 推送后要等（Grok：这是真的吗）----
    ('X01', '我改了标题，push 了，网页一点没变。这是真的吗？', '我改了标题，推送了，网页一点没变。这是真的吗？'),
    ('D05', '我上次也是，还以为把网站弄坏了！', None),
    ('G05_01', '是真的，只是要等等：每次推送，GitHub 都会自动部署一遍，一般几分钟，最长十分钟左右。', '是真的，只是要等等：每次推送，GitHub 都会自动部署一遍。一般几分钟，最长十分钟左右。'),
    ('G05_02', '去 Actions 页面看，pages build and deployment 打了绿勾，就是部署好了。', '去 Actions 页面看，那条 Pages 部署任务打了绿勾，就是部署好了。'),
    ('G05_03', '绿勾了还没变？多半是浏览器缓存，按 Ctrl+F5 强制刷新。', '绿勾了还没变？多半是浏览器缓存，按 control 加 F 五 键，强制刷新。'),
    ('X02', '绿勾，强刷，标题变了。是真的。', None),
    # ---- jekyll 下划线文件夹（Kimi：读完文档）----
    ('K01', '我把 Pages 文档读完了。关键：默认会经过 Jekyll 处理，下划线开头的文件夹不会被发布。', '我把 Pages 的文档读完了。关键：默认会经过杰基尔处理，下划线开头的文件夹，不会被发布。'),
    ('D06', '我的图片全放在 _img 里……难怪一张都没有！', '我的图片，全放在下划线 img 里……难怪一张都没有！'),
    ('G06_01', '两个办法：一，文件夹改个名，别用下划线开头。', None),
    ('G06_02', '二，在根目录放一个空文件，名字叫 .nojekyll，Pages 就原样发布，不做处理。', '二，在根目录放一个空文件，名字叫点 no 杰基尔，Pages 就原样发布，不做处理。'),
    ('K02', '一句话：下划线，要么改名，要么加 .nojekyll。', '一句话：下划线，要么改名，要么加点 no 杰基尔。'),
    # ---- user 个人主页 + 自定义域名（豆包：想要短网址）----
    ('B01', '家人们！这网址后面还拖着仓库名，我想要 doubao.github.io，干干净净！', '家人们！这网址后面还拖着仓库名，我想要，豆包点 github 点 io！干干净净！'),
    ('D07', '短网址？那我也想要一个！', None),
    ('G07_01', '可以：新建一个仓库，名字就叫 用户名.github.io，它就是你的个人主页。', '可以：新建一个仓库，名字就叫用户名点 github 点 io，它就是你的个人主页。'),
    ('G07_02', '个人主页每个账号只有一个；项目网站，每个仓库都能开一个。', None),
    ('G07_03', '想用自己买的域名，就在 Pages 设置里填 Custom domain，再勾上 Enforce HTTPS。', '想用自己买的域名，就在 Pages 设置里，填自定义域名，再勾上强制 H T T P S。'),
    ('B02', '那我先把个人主页建了，域名……下回再买！', None),
    # ---- recap 复习 ----
    ('D08', '信息量好大，帮我收个尾！', None),
    ('G08_01', '开：Settings → Pages，选 main 和根目录，Save。', '开：设置里点 Pages，选主分支和根目录，保存。'),
    ('G08_02', '查：首页叫 index.html，大小写一致，用相对路径，下划线加 .nojekyll。', '查：首页叫 index 点 H T M L，大小写一致，用相对路径，下划线加点 no 杰基尔。'),
    ('G08_03', '改：push 就自动部署，看 Actions 绿勾，再强制刷新。', '改：推送就自动部署，看 Actions 绿勾，再强制刷新。'),
    # ---- practice 实战：白饭页上线 ----
    ('D09', '我现在就让白饭页上线！', None),
    ('G09_01', '先把 baifan.html 改名成 index.html，图片挪出 _img，路径全改成相对路径。', '先把白饭点 H T M L，改名成 index 点 H T M L；图片挪出下划线 img，路径全改成相对路径。'),
    ('G09_02', '提交、推送，再到 Settings → Pages，选 main 和根目录，Save。', '提交、推送，再到设置里点 Pages，选主分支和根目录，保存。'),
    ('G09_03', 'Actions 打了绿勾，打开 dafeiyu.github.io/baifan，白饭页上线了！', 'Actions 打了绿勾，打开大肥鱼点 github 点 io，斜杠白饭，白饭页上线了！'),
    ('G09_04', '再改一下今日推荐菜，push，等一会儿强制刷新，网站跟着变了。', '再改一下今日推荐菜，推送，等一会儿强制刷新，网站跟着变了。'),
    ('G09_05', '手机也能打开，把链接发给同学，点开就是你的白饭页。', None),
    ('D10', '同学们都能点开了！白饭页，是真网站了！', None),
    # ---- teaser 预告 + 三连 ----
    ('G10_01', '下集预告：每次 push，自动帮你检查、测试、部署——GitHub Actions！', '下集预告！每次推送，自动帮你检查、测试、部署！GitHub Actions！'),
    ('G10_02', '喜欢的话记得一键三连，我们下集见！', None),
]

def main():
    here = Path(__file__).resolve().parent
    ids = [i for i, _, _ in LINES]
    assert len(ids) == len(set(ids)), '台词 ID 重复'
    assert all(i[0] in SPEAKERS for i in ids), '未知说话人'
    script, subs = {}, {}
    for i, sub, read in LINES:
        subs[i] = sub
        key = i.split('_')[0]               # G04_02 → G04；Q01 → Q01
        script.setdefault(key, []).append(read or sub)
    (here / 'script.json').write_text(json.dumps(script, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    (here / 'subtitles.json').write_text(json.dumps(subs, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    cjk = lambda s: len(re.sub(r'[\x00-\x7f]', '', s))
    per = {}
    for i, s, _ in LINES:
        n, c = per.get(i[0], (0, 0)); per[i[0]] = (n + 1, c + cjk(s))
    total = sum(c for _, c in per.values())
    print(f'{len(LINES)} 句，中文 {total} 字；按第2集实测 ≈0.174 秒/字 估算成片 {total * 0.174 / 60:.1f} 分钟')
    for k, (n, c) in per.items():
        print(f'  {k} {SPEAKERS[k]}：{n} 句 / {c} 字')


if __name__ == '__main__':
    main()
