# -*- coding: utf-8 -*-
"""第4集台词唯一来源：同时生成 script.json（朗读稿，送 TTS）和 subtitles.json（字幕稿，贴进 engine.js 的 TEXT）。
改台词只改这里，然后运行：python ep4/_gen_script.py
每行：(ID, 字幕稿, 朗读稿或 None)。朗读稿为 None 时与字幕稿相同。

ID 首字母 = 说话人：
  G GitHub娘（讲师）  D 大肥鱼 / DeepSeek（组长）
  Q 千问  C Claude  M Gemini  X Grok  B 豆包  K Kimi   ← AI 分工小队
朗读稿规则（GPT-SoVITS）：行(háng)→航；Gemini→杰米奈；Claude→克劳德；命令参数读成“加 xx 参数”；~ 读“波浪号”。
"""
import json, re
from pathlib import Path

SPEAKERS = {'G': 'GitHub娘', 'D': '大肥鱼', 'Q': '千问', 'C': 'Claude', 'M': 'Gemini',
            'X': 'Grok', 'B': '豆包', 'K': 'Kimi'}

LINES = [
    # ---- cold 冷开场：刚提交就后悔 ----
    ('D01', '完了完了！刚提交完就发现，说明写错了，还漏了一个文件！Git 有后悔药吗？', None),
    # ---- why 引入 + title ----
    ('G01_01', '有！而且不止一种。改说明、收起半成品、撤回提交、找回删掉的存档，Git 全都能后悔。', None),
    ('G01_02', '欢迎来到 AI娘 Git 课，第四集，Git 后悔药大全！', '欢迎来到，AI 娘，Git 课！第四集，Git 后悔药大全！'),
    # ---- amend 改上一次提交（Gemini 又写成 2024 年）----
    ('M01', '嘿嘿，我刚提交完，说明写的是“2024 年更新”喵！', '嘿嘿，我刚提交完，说明写的是，二零二四年更新喵！'),
    ('D02', '又是 2024 年……这种刚提交的，还能改吗？', '又是二零二四年……这种刚提交的，还能改吗？'),
    ('G02_01', '能！第一颗后悔药：git commit --amend。', '能！第一颗后悔药：git commit，加 amend 参数。'),
    ('G02_02', '说明写错了，就 git commit --amend -m，跟上新的说明，上一次提交直接被换掉。',
               '说明写错了，就 git commit，加 amend 参数，再加 m，跟上新的说明，上一次提交直接被换掉。'),
    ('G02_03', '漏了文件，先 git add 把它加进来，再 git commit --amend --no-edit，说明不变，文件补进去。',
               '漏了文件，先 git add 把它加进来，再 git commit，加 amend 和 no edit 参数，说明不变，文件补进去。'),
    ('G02_04', '注意：amend 会换成一个新的提交，所以只改还没 push 的那一次。', None),
    ('M02', '改好啦，这次年份写对了喵！', '改好啦！这次年份写对了，喵！'),
    # ---- stash 改到一半先收起来（千问派紧急任务）----
    ('Q01', '紧急任务！首页打不开了，谁有空马上去修？', None),
    ('D03', '可我的介绍页才写到一半，又不想提交半成品，怎么办？', None),
    ('G03_01', '第二颗后悔药：git stash，把改到一半的东西先收进抽屉。', None),
    ('G03_02', '工作区一下子就干净了，放心切到别的分支，修好、提交。', None),
    ('G03_03', '回来以后 git stash pop，刚才的半成品原样放回来。', None),
    ('G03_04', '抽屉里能放好几份，git stash list 就能看到。新建的文件，记得加 -u 一起收。',
               '抽屉里能放好几份，git stash list 就能看到。新建的文件，记得加 u 参数一起收。'),
    ('Q02', '首页修好啦！辛苦了，奶茶我请～', None),
    # ---- reset --soft / --mixed 撤回提交（豆包一口气交了三次）----
    ('D04', '豆包怎么一口气提交了三次？', None),
    ('B01', '“测试”“测试二”“这次真的是最后一次”！家人们，先交了再说嘛！', '测试，测试二，这次真的是最后一次！家人们，先交了再说嘛！'),
    ('G04_01', '提交太碎了。第三颗后悔药：git reset，撤回提交。', None),
    ('G04_02', 'git reset --soft HEAD~3，撤回最近三次提交，改动全都留在暂存区。',
               'git reset，加 soft 参数，HEAD 波浪号三，撤回最近三次提交，改动全都留在暂存区。'),
    ('G04_03', '再重新 commit 一次，三次提交就合成了一次，说明也能重写。', None),
    ('G04_04', '不加参数的话，默认是 --mixed：提交撤回了，改动留在工作区，等你重新 add。',
               '不加参数的话，默认是 mixed：提交撤回了，改动留在工作区，等你重新 add。'),
    ('G04_05', '三种模式记一句话：soft 留暂存，mixed 留工作区，hard 全清空。', '三种模式记一句话：soft，留暂存；mixed，留工作区；hard，全清空。'),
    ('B02', '收到！三合一，这下整整齐齐啦！', None),
    # ---- reset --hard / revert（Grok 一键清空）----
    ('X01', '全写坏了。git reset --hard HEAD~2，退回两步，重新来过！', '全写坏了。git reset，加 hard 参数，HEAD 波浪号二，退回两步，重新来过！'),
    ('D05', '等等！Grok 的改动全没了？', '等等！格洛克的改动全没了？'),
    ('G05_01', '这就是最危险的一颗：reset --hard。它会把提交和没提交的改动，一起清掉。', '这就是最危险的一颗：reset，加 hard 参数。它会把提交和没提交的改动，一起清掉。'),
    ('G05_02', '没提交的改动，清掉就真的找不回来了。用之前，一定先 commit 或者 stash。', None),
    ('G05_03', '还有，已经 push 上去的提交，别用 reset 改历史，要用 git revert。', None),
    ('G05_04', 'revert 会新建一个提交，把那次改动反着做一遍。历史一条不少，队友也不受影响。', None),
    ('X02', '那我刚才退掉的两次提交，也没了？这是真的吗？', None),
    # ---- reflog 找回（Kimi：Git 的日记）----
    ('K01', '别慌……Git 有一本日记，每一步都记着。我帮你翻。', None),
    ('D06', '退掉的提交，还能找回来？', None),
    ('G06_01', '能！最后一颗后悔药：git reflog。HEAD 每移动一次，它都记一笔，被 reset 掉的提交也在里面。', '能！最后一颗后悔药：git ref log。HEAD 每移动一次，它都记一笔，被 reset 掉的提交也在里面。'),
    ('G06_02', '在列表里找到出事之前的那一行，复制前面的编号。', '在列表里找到出事之前的那一航，复制前面的编号。'),
    ('K02', '找到了。第二行，就是她出事之前。', '找到了。第二航，就是她出事之前。'),
    ('G06_03', '再 git reset --hard 加上这个编号，两次提交就全回来了。', '再 git reset，加 hard 参数，加上这个编号，两次提交就全回来了。'),
    ('G06_04', '不放心的话，也可以 git branch rescue 加编号，先开一条新分支把它存起来。', '不放心的话，也可以 git branch rescue，加上编号，先开一条新分支把它存起来。'),
    ('G06_05', '不过记住：reflog 只记提交过的东西，没提交的改动，它也救不了。', '不过记住：ref log 只记提交过的东西，没提交的改动，它也救不了。'),
    ('X03', '回来了。行，下次我先 commit 再动手。', None),
    # ---- errors 报错急救（Claude：先读报错）----
    ('D07', '还有，一看到红色的报错，我就慌。', None),
    ('C01', '先别慌。报错已经把原因写清楚了，读完再动手。', None),
    ('G07_01', 'Claude 说得对。最常见的三个，记住解法就行。', '克劳德 说得对。最常见的三个，记住解法就行。'),
    ('G07_02', '看到“本地改动会被覆盖”：有没提交的改动挡路，先 commit 或者 stash。', None),
    ('G07_03', '看到 detached HEAD：你停在了某个旧提交上。回去用 git switch main，想接着写，就 git switch -c 开新分支。',
               '看到 detached HEAD：你停在了某个旧提交上。回去用 git switch main，想接着写，就 git switch，加 c 参数，开新分支。'),
    ('G07_04', '看到 not a git repository：你不在仓库文件夹里，cd 进项目目录就好。', None),
    ('C02', '原因写清楚了，解法也有。批准。', None),
    # ---- recap 复习：后悔药药方 ----
    ('D08', '后悔药好多，帮我整理一下！', None),
    ('G08_01', '说明写错、漏了文件，用 amend；改到一半要切走，用 stash。', None),
    ('G08_02', '撤回提交、留着改动，用 reset --soft 或 --mixed；已经 push 的，用 revert。', '撤回提交、留着改动，用 reset 的 soft 或 mixed；已经 push 的，用 revert。'),
    ('G08_03', 'reset --hard 要小心；退掉的提交，用 reflog 找回来。', 'reset 的 hard 参数，要小心；退掉的提交，用 ref log 找回来。'),
    # ---- practice 实战：白饭页走一遍 ----
    ('D09', '能带我从头到尾，用一遍吗？', None),
    ('G09_01', '没问题！用大肥鱼的白饭页，把后悔药完整用一遍！', None),
    ('G09_02', '提交以后发现说明写错：git commit --amend -m，改掉。', '提交以后发现说明写错：git commit，加 amend 参数，再加 m，改掉。'),
    ('G09_03', '千问喊紧急任务：git stash 收起半成品，git switch -c 开个修复分支，修好提交，切回来 git stash pop。',
               '千问喊紧急任务：git stash 收起半成品，git switch，加 c 参数，开个修复分支，修好提交，切回来 git stash pop。'),
    ('G09_04', '写完提交，手一滑 reset --hard HEAD~1。别慌：git reflog 找到编号，reset --hard 回去，提交全回来！',
               '写完提交，手一滑 reset，加 hard 参数，HEAD 波浪号一。别慌：git ref log 找到编号，再 reset 回去，提交全回来！'),
    ('D10', '吃了后悔药，白饭页一个字都没丢！', None),
    # ---- teaser 下集预告 + 三连 ----
    ('G10_01', '下集预告：给作品打上版本标签！git tag 和 GitHub Releases，下集见分晓！', '下集预告！给作品，打上版本标签！git tag 和 GitHub Releases，下集见分晓！'),
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
