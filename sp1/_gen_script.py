# -*- coding: utf-8 -*-
"""番外1《Git 小技巧》台词唯一来源：生成 script.json（朗读稿，送 TTS）和 subtitles.json（字幕稿，贴进 engine.js 的 TEXT）。
改台词只改这里，然后运行：python sp1/_gen_script.py
每行：(ID, 字幕稿, 朗读稿或 None)。朗读稿为 None 时与字幕稿相同。

ID 首字母 = 说话人：G GitHub娘（讲师）  D 大肥鱼 / DeepSeek（提问）
朗读稿规则（GPT-SoVITS，沿用第5集审核结论）：
  命令参数读成“加 xx 参数”；.gitignore 读“点 git ignore”；node_modules 读“node modules”；
  别名 st / lg 读字母“s t”“L G”；避开 main（会读成“明”）、行(háng)、“版本号”（GitHub娘会读成“版本后”）；
  v1.0 读“V 一点零”。
"""
import json, re
from pathlib import Path

SPEAKERS = {'G': 'GitHub娘', 'D': '大肥鱼'}

LINES = [
    # ---- cold 冷开场：手酸 ----
    ('D01', '又打错了……一天敲几十遍 git status，手都要断了！', '又打错了……一天敲几十遍 git status，手都要断了！'),
    # ---- title ----
    ('G01_01', '这期不讲新命令，送你几个用了就回不去的小技巧。', None),
    ('G01_02', '欢迎来到 AI娘 Git 课番外：Git 小技巧！', '欢迎来到，AI 娘，Git 课番外！Git 小技巧！'),
    # ---- config 先告诉 Git 你是谁 ----
    ('D02', '先问个怪事：换了台电脑提交，作者怎么变成一串奇怪的名字？', None),
    ('G02_01', '新电脑要先告诉 Git 你是谁：git config --global user.name 和 user.email。',
               '新电脑要先告诉 Git 你是谁：git config，加 global 参数，设置 user 点 name，和 user 点 email。'),
    ('G02_02', '邮箱和 GitHub 账号填一样的，提交记录上才会显示你的头像。', None),
    ('G02_03', '只想给这一个仓库换名字？去掉 --global，就只在当前仓库生效。', '只想给这一个仓库换名字？去掉 global 参数，就只在当前仓库生效。'),
    ('G02_04', '设没设好，git config --list 看一眼，所有设置都在这里。', '设没设好，git config，加 list 参数，看一眼，所有设置都在这里。'),
    # ---- alias 起别名 ----
    ('D03', '那 git status 能不能少打几个字？', None),
    ('G03_01', '能！起个别名：git config --global alias.st status。', '能！给命令起个别名：git config，加 global 参数，alias 点 s t，设成 status。'),
    ('G03_02', '以后打 git st，就等于 git status。', '以后打 git s t，就等于 git status。'),
    ('G03_03', '别名随便起，但别和已有的命令重名，不然自己都搞不清。', None),
    ('G03_04', '再送一个：把 log --oneline --graph --all 起名叫 lg，提交和分支图一屏看完。',
               '再送你一个：把 log 加上 oneline、graph、all 三个参数，起名叫 L G，提交和分支图，一眼看完。'),
    # ---- diff 看改动 ----
    ('D04', '写了一下午，提交前……我到底改了哪些地方？', None),
    ('G04_01', 'git diff：红色是删掉的，绿色是新加的，改了哪里一目了然。', '用 git diff：红色是删掉的，绿色是新加的，改了哪里，一目了然。'),
    ('G04_02', '已经 add 进暂存区的，要加 --staged 才看得到。', '已经 add 进暂存区的，要加 staged 参数，才看得到。'),
    ('G04_03', '只想知道改了哪些文件？加 --stat，只列文件名和改动多少。', '只想知道改了哪些文件？加 stat 参数，只列文件名，和改动多少。'),
    ('G04_04', '还能比两个版本：git diff v1.0 v1.1，上集打的标签这就用上了。', '还能比两个版本：git diff，V 一点零，V 一点一，上集打的标签，这就用上了。'),
    # ---- ignore .gitignore 补救 ----
    ('D05', 'node_modules 早就提交上去了，现在写进 .gitignore，怎么还在？', 'node modules 早就提交上去了，现在写进点 git ignore，怎么还在？'),
    ('G05_01', '.gitignore 只管还没被跟踪的文件；已经提交过的，Git 会一直盯着。', '点 git ignore，只管还没被跟踪的文件；已经提交过的，Git 会一直盯着。'),
    ('G05_02', '先 git rm -r --cached node_modules：从仓库里拿掉，本地文件还在，再提交。',
               '先 git rm，加 r 和 cached 参数，node modules：从仓库里拿掉，本地文件还在，然后再提交。'),
    ('G05_03', '想知道一个文件为什么被忽略？git check-ignore -v 文件名，是哪条规则一查便知。', '想知道一个文件为什么被忽略？git check ignore，加 v 参数，再写文件名，是哪条规则，一查便知。'),
    ('G05_04', '不知道该忽略什么？在 GitHub 建仓库时选个 .gitignore 模板，常见的都写好了。',
               '不知道该忽略什么？在 GitHub 建仓库时，选一个点 git ignore 模板，常见的都写好了。'),
    # ---- recap ----
    ('D06', '等等，信息量有点大，帮我总结一下！', None),
    ('G06_01', 'config 设身份，alias 起别名，diff 看改动，rm --cached 补救忽略。', 'config 设身份，alias 起别名，diff 看改动，rm 加 cached，补救忽略。'),
    # ---- practice 实战 ----
    ('D07', '我现在就在白饭页上配一遍！', None),
    ('G07_01', '先设好名字和邮箱，再起 st 和 lg 两个别名。', '先设好名字和邮箱，再起 s t 和 L G，两个别名。'),
    ('G07_02', 'git st 一看，node_modules 又冒出来了？rm --cached 拿掉，写进 .gitignore。',
               'git s t 一看，node modules 又冒出来了？加 cached 参数拿掉，写进点 git ignore。'),
    ('G07_03', '提交前 git diff --staged 检查一遍，没问题就提交！', '提交前，git diff，加 staged 参数，检查一遍，没问题就提交！'),
    ('D08', '手不酸了，提交也干净了！', None),
    # ---- teaser 预告 + 三连 ----
    ('G08_01', '下集正片：把白饭页变成一个真正的网站，GitHub Pages！', '下集正片：把白饭页，变成一个真正的网站！GitHub Pages！'),
    ('G08_02', '觉得有用就点赞、投币、收藏，我们下集见！', None),
]


def main():
    here = Path(__file__).resolve().parent
    ids = [i for i, _, _ in LINES]
    assert len(ids) == len(set(ids)), '台词 ID 重复'
    script, subs = {}, {}
    for i, sub, read in LINES:
        subs[i] = sub
        key = i.split('_')[0] if '_' in i else i
        script.setdefault(key, []).append(read or sub)
    (here / 'script.json').write_text(json.dumps(script, ensure_ascii=False, indent=1), encoding='utf-8')
    (here / 'subtitles.json').write_text(json.dumps(subs, ensure_ascii=False, indent=1), encoding='utf-8')
    cjk = lambda s: len(re.sub(r'[\x00-\x7f]', '', s))
    en = lambda s: len(re.findall(r'[A-Za-z]+', s))
    for sp, name in SPEAKERS.items():
        ls = [s for i, s, _ in LINES if i[0] == sp]
        print(f'  {sp} {name}：{len(ls)} 句 / {sum(cjk(s) for s in ls)} 字')
    total = sum(cjk(s) for _, s, _ in LINES); ens = sum(en(r or s) for _, s, r in LINES)
    k = 239.4 / 1326.4
    print(f'{len(LINES)} 句，中文 {total} 字，英文词 {ens}；估算配音 ≈ {k * (total + 1.6 * ens):.0f} 秒')


if __name__ == '__main__':
    main()
