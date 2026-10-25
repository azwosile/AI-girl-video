# -*- coding: utf-8 -*-
"""第3集台词唯一来源：同时生成 script.json（朗读稿，送 TTS）和 subtitles.json（字幕稿，贴进 engine.js 的 TEXT）。
改台词只改这里，然后运行：python ep3/_gen_script.py
每行：(ID, 字幕稿, 朗读稿或 None)。朗读稿为 None 时与字幕稿相同。

ID 首字母 = 说话人：
  G GitHub娘（讲师）  D 大肥鱼 / DeepSeek（组长）
  Q 千问  C Claude  M Gemini  X Grok  B 豆包  K Kimi   ← AI 分工小队
"""
import json, re
from pathlib import Path

SPEAKERS = {'G': 'GitHub娘', 'D': '大肥鱼', 'Q': '千问', 'C': 'Claude', 'M': 'Gemini',
            'X': 'Grok', 'B': '豆包', 'K': 'Kimi'}

LINES = [
    # ---- cold 冷开场：文件在群里传来传去 ----
    ('D01', '救命！小组作业七个人一起写，文件在群里传来传去，现在谁也不知道哪份是最新的！', None),
    # ---- why 引入 + title ----
    ('G01_01', '别慌！上集你学会了云存档，其实一个仓库，可以让一整队人联机一起写。', None),
    ('G01_02', '欢迎来到 AI娘 Git 课，第三集，联机模式，多人协作！', None),
    # ---- squad 小队登场 + 邀请协作者 ----
    ('G02_01', '先认识一下这次的 AI 分工小队！', None),
    ('Q01', '千问，负责张罗分工！任务大家领，奶茶我来请～', None),
    ('C01', 'Claude，负责审查。没有来源的内容，我不会放行。', None),
    ('M01', '嘿嘿，Gemini 来啦！不管你问什么，你的观察都非常敏锐喵！', None),
    ('X01', 'Grok。废话少说，活儿交给我，我直接干。', None),
    ('B01', '豆包来咯！家人们有事尽管说，包在我身上！', None),
    ('K01', 'Kimi……资料多长都行，我都能一口气读完。', None),
    ('G02_02', '组长大肥鱼先新建仓库，再到 Settings 里的 Collaborators，把队友一个个邀请进来。', None),
    ('G02_03', '队友接受邀请，git clone 下载仓库，就都能往里 push 了。', None),
    # ---- issue 用 Issue 分工 ----
    ('D02', '人到齐了，可是谁写哪部分呢？', None),
    ('Q02', '交给我！在仓库的 Issues 里，一个任务开一条。', None),
    ('G03_01', '对，Issue 就是任务单。写清楚要做什么，再在右边的 Assignees 指定负责人。', None),
    ('G03_02', '每条 Issue 都有编号，比如 #3：写 Claude 的介绍页。', '每条 Issue 都有编号，比如三号任务：写克劳德的介绍页。'),
    # ---- branch 每个任务一条分支 ----
    ('D03', '领到任务啦！那我直接在 main 上改？', None),
    ('G04_01', '不行哦！联机的第一条规矩：不在 main 上直接改。', None),
    ('G04_02', '每个任务开一条自己的分支：git switch -c claude-page。', '每个任务开一条自己的分支：git switch，加 c 参数，克劳德 横杠 page。'),
    ('G04_03', '写完 add、commit，再 git push -u origin claude-page，把分支推上云。', '写完 add、commit，再 git push，加 u 参数，origin，克劳德 横杠 page，把分支推上云。'),
    ('G04_04', 'main 永远保持能用的样子，大家的半成品都待在各自的分支里。', None),
    # ---- pr 发起合并请求 ----
    ('D04', '分支推上去了，怎么让它合进 main 呢？', None),
    ('G05_01', '回到网页，会看到一条黄色提示，点 Compare & pull request。', '回到网页，会看到一条黄色提示，点 Compare and pull request。'),
    ('G05_02', 'Pull Request，简称 PR，意思就是：请把我的分支合进 main。', 'Pull Request，简称 P R，意思就是：请把我的分支合进 main。'),
    ('G05_03', '写清楚改了什么，再加一句 Closes #3，合并以后，三号任务会自动关闭。', '写清楚改了什么，再加一句 Closes 井号三，合并以后，三号任务会自动关闭。'),
    # ---- review 代码审查 ----
    ('D05', '开好 PR，就能直接合并了吗？', '开好 P R，就能直接合并了吗？'),
    ('G06_01', '先等队友审查！这次的审查员是 Claude。', None),
    ('C02', '第十二行写着“大肥鱼会偷吃白饭”，没有来源。我不想放行一个只是听起来合理的说法。', '第十二航写着“大肥鱼会偷吃白饭”，没有来源。我不想放行，一个只是听起来合理的说法。'),
    ('G06_02', '在 Files changed 里，点任意一行就能留评论。审查员可以选 Approve 批准，或者 Request changes 要求修改。', '在 Files changed 里，点任意一航就能留评论。审查员可以选 Approve 批准，或者 Request changes 要求修改。'),
    ('G06_03', '作者在本地改好，commit、push 到同一条分支，PR 会自动更新，不用重开。', '作者在本地改好，commit、push 到同一条分支，P R 会自动更新，不用重开。'),
    ('C03', '来源补上了。Approve，批准。', None),
    # ---- merge 合并与同步 ----
    ('G07_01', '批准以后，点 Merge pull request，分支就合进 main 啦！', None),
    ('G07_02', '合完点 Delete branch，把用完的分支删掉。其他人回到 main，git pull 一下，就能拿到最新内容。', None),
    # ---- conflict PR 冲突（Gemini 的分支过时了）----
    ('D06', '诶？Gemini 的 PR 怎么显示有冲突？', '诶？杰米奈 的 P R 怎么显示有冲突？'),
    ('M02', '不可能！我的分支是最新的，现在绝对是 2024 年喵！', '不可能！我的分支是最新的，现在绝对是二零二四年喵！'),
    ('G08_01', 'Gemini 的分支开得太早了。这期间，千问已经改了 README 里成员表的同一行。', '杰米奈 的分支开得太早了。这期间，千问已经改了 read me 里成员表的同一航。'),
    ('G08_02', '两个人改了同一行，GitHub 不知道该听谁的，就会提示冲突。', '两个人改了同一航，GitHub 不知道该听谁的，就会提示冲突。'),
    ('G08_03', '在本地切到自己的分支，git pull origin main，把云端最新的 main 拉进来。', None),
    ('G08_04', '然后像第一集那样，选好要保留的内容，删掉冲突标记，再 add、commit、push。', None),
    ('G08_05', '推上去以后，PR 里的冲突提示就消失了。', '推上去以后，P R 里的冲突提示就消失了。'),
    ('M03', '诶？原来……已经不是 2024 年了喵。嘿嘿。', '诶？原来……已经不是二零二四年了喵。嘿嘿。'),
    ('G08_06', '所以分支别拖太久，开工前先把 main 拉到最新，冲突会少很多。', None),
    # ---- protect 保护 main（Grok 想强推）----
    ('X02', '审查太慢了。git push --force，直接推到 main！', '审查太慢了。git push，加 force 参数，直接推到 main！'),
    ('G09_01', '停！组长早就给 main 加了保护。', None),
    ('G09_02', '在 Settings 的 Rules 里给 main 定规则：必须通过 PR 合并，至少一人批准，禁止强制推送。', '在 Settings 的 Rules 里给 main 定规则：必须通过 P R 合并，至少一人批准，禁止强制推送。'),
    ('X03', '被拒了？这是真的吗？', None),
    ('G09_03', '真的！谁想绕过审查直接推 main，都会被拦下来。规则面前，人人平等。', None),
    # ---- ignore .gitignore（豆包传了密码和大文件）----
    ('D07', '豆包的 PR 怎么有两个多 G？', '豆包的 P R 怎么有两个多 G？'),
    ('B02', '嘻嘻，我把录屏和存着密码的 .env 文件，一起传上去啦！', '嘻嘻，我把录屏和存着密码的点 env 文件，一起传上去啦！'),
    ('G10_01', '这就是上集说的：密码和大文件，绝对不能推！', None),
    ('G10_02', '在仓库根目录建一个 .gitignore 文件，写上不想让 Git 管的文件。', '在仓库根目录建一个 git ignore 文件，写上不想让 Git 管的文件。'),
    ('G10_03', '比如写一行 .env，再写一行 *.mp4，所有 mp4 视频就都被忽略了。', '比如写一航点 env，再写一航星号点 mp4，所有 mp4 视频就都被忽略了。'),
    ('G10_04', '已经被 Git 记录的文件，要先 git rm --cached 取消跟踪，文件本身还留在电脑上。', '已经被 Git 记录的文件，要先用 git rm，加 cached 参数，取消跟踪，文件本身还留在电脑上。'),
    ('G10_05', '密码要是已经推上去了，第一时间去改密码，这比删记录更重要。', None),
    ('B03', '收到！对不起嘛家人们，下次一定！', None),
    # ---- fork 外人参与：Fork ----
    ('D08', '那要是想给别人的开源项目帮忙，我又不是成员，怎么办？', None),
    ('G11_01', '用 Fork！在别人的仓库页面点 Fork，就会在你的账号下复制一份。', None),
    ('G11_02', '在自己的副本里开分支、改、推，再向原仓库发起 PR。', '在自己的副本里开分支、改、推，再向原仓库发起 P R。'),
    ('G11_03', '记住：队友用分支，外人用 Fork，最后都靠 PR 合并。', '记住：队友用分支，外人用 Fork，最后都靠 P R 合并。'),
    # ---- recap 复习 ----
    ('D09', '信息量好大，帮我总结一下！', None),
    ('G12_01', '联机就是一条流水线：Issue 领任务，开分支，push，开 PR。', '联机就是一条流水线：Issue 领任务，开分支，push，开 P R。'),
    ('G12_02', '审查通过再合并，合完大家 pull。再加两道保险：保护 main，写好 .gitignore。', '审查通过再合并，合完大家 pull。再加两道保险：保护 main，写好 git ignore。'),
    # ---- practice 实战：Kimi 的介绍页走一遍 ----
    ('D10', '能不能带我们从头到尾，完整走一遍呀？', None),
    ('G13_01', '没问题！用 Kimi 的介绍页，完整走一遍联机流程！', None),
    ('G13_02', '先拉最新的 main：git switch main，git pull。', None),
    ('G13_03', '开分支：git switch -c kimi-page。', '开分支：git switch，加 c 参数，kimi 横杠 page。'),
    ('K02', '介绍页写好了。三个月前的聊天记录，我也一字不差地整理进去了。', None),
    ('G13_04', 'git add .，git commit -m "添加 Kimi 介绍页"，再 git push -u origin kimi-page。', 'git add 点，git commit，加 m 参数，添加 Kimi 介绍页，再 git push，加 u 参数，origin，kimi 横杠 page。'),
    ('G13_05', '回到网页开 PR，写上 Closes #6。Claude 批准，点合并，删分支。', '回到网页开 P R，写上 Closes 井号六。克劳德批准，点合并，删分支。'),
    ('G13_06', '最后大家 git pull，七个人的图鉴，就合成一本啦！', None),
    ('Q03', '完工！奶茶我请！', None),
    # ---- teaser 下集预告 + 三连 ----
    ('G14_01', '下集预告：提交说明写错了？改到一半要切分支？下集我们讲 Git 后悔药大全！', None),
    ('G14_02', '喜欢的话记得一键三连，我们下集见！', None),
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
