# -*- coding: utf-8 -*-
"""番外3《图形界面工具》台词唯一来源：同时生成 script.json（朗读稿，送 TTS）和 subtitles.json（字幕稿，贴进 engine.js 的 TEXT）。
改台词只改这里，然后运行：python sp3/_gen_script.py
每行：(ID, 字幕稿, 朗读稿或 None)。朗读稿为 None 时与字幕稿相同。

ID 首字母 = 说话人：
  G GitHub娘（讲师）  D 大肥鱼 / DeepSeek（组长）
  Q 千问  C Claude  M Gemini  X Grok  B 豆包  K Kimi   ← AI 分工小队
朗读稿规则（GPT-SoVITS）：行(háng)→航；Gemini→杰米奈；Claude→克劳德；push→推送；main→主分支；PR→P R。
番外3补充：VS Code→V S Code；git add -p→git add 杠 p；GitHub Desktop→GitHub Desktop（照读）。
字幕保留英文原文和代码。
"""
import json, re
from pathlib import Path

SPEAKERS = {'G': 'GitHub娘', 'D': '大肥鱼', 'Q': '千问', 'C': 'Claude', 'M': 'Gemini',
            'X': 'Grok', 'B': '豆包', 'K': 'Kimi'}


LINES = [
    # ---- cold 冷开场：改了一堆文件，只想交三行 ----
    ('D01', '改了二十个文件，只想提交其中三行……命令我全忘了！', None),
    # ---- title ----
    ('G01_01', '不想敲命令也没关系：VS Code 自带 Git 图形界面，点几下就能存档。', '不想敲命令也没关系：V S Code 自带 Git 图形界面，点几下就能存档。'),
    ('G01_02', '欢迎来到 AI娘 Git 课番外三：图形界面工具！', '欢迎来到，AI 娘，Git 课！番外三，图形界面工具！'),
    # ---- panel 源代码管理面板 ----
    ('D02', '按钮在哪儿？', None),
    ('G02_01', '左边栏这个分叉图标就是源代码管理，改过的文件都列在这里：M 是修改，U 是新文件，D 是删除。', None),
    ('G02_02', '点文件就能左右对比；点加号就是 git add，写好说明点“提交”，就是 git commit。', '点文件就能左右对比；点加号就是暂存，写好说明点提交，就是存档。'),
    ('G02_03', '下面的“同步更改”按钮，一键先拉后推。', None),
    ('G02_04', '改乱了想重来？在文件上点“放弃更改”，就回到上次提交的样子；这一步撤不回，要小心。', '改乱了想重来？在文件上点，放弃更改，就回到上次提交的样子；这一步撤不回，要小心。'),
    # ---- part 只交一部分（Gemini）----
    ('M01', '我只想提交改好的那一段，另一段还在乱写喵！', '我只想提交改好的那一段，另一段还在乱写，喵！'),
    ('D03', '能只交一部分吗？', None),
    ('G03_01', '能！在对比视图里选中几行，右键“暂存所选范围”，只有这几行进暂存区。', None),
    ('G03_02', '命令行也能做：git add -p，一块一块问你要不要，输 y 就收下。', '命令行也能做：git add 杠 p，一块一块问你要不要，输 y 就收下。'),
    ('G03_03', '暂存错了也不怕：在暂存区里点减号，就是取消暂存，改动还留在文件里。', None),
    ('M02', '好的交上去，乱写的留着喵！', '好的交上去，乱写的留着，喵！'),
    # ---- conflict 解冲突 ----
    ('D04', '合并冲突了，满屏箭头符号看不懂！', None),
    ('G04_01', 'VS Code 会把冲突块标出来，上面一排按钮：保留当前、保留传入、两个都保留。', 'V S Code 会把冲突块标出来，上面一排按钮：保留当前、保留传入、两个都保留。'),
    ('G04_02', '复杂的就点“在合并编辑器中解决”：上面是双方的改动，下面是结果，勾一勾就合好了。', None),
    ('G04_03', '改完点“完成合并”，再提交，冲突就解决了。', None),
    # ---- desktop GitHub Desktop + 提交图 ----
    ('D05', '不用 VS Code 呢？', '不用 V S Code 呢？'),
    ('G05_01', '还有官方免费的 GitHub Desktop：登录账号，就能克隆、建分支、提交、推送，还能一键跳去开 PR。', '还有官方免费的 GitHub Desktop：登录账号，就能克隆、建分支、提交、推送，还能一键跳去开 P R。'),
    ('G05_02', '新版 VS Code 的源代码管理里还自带提交图，分支怎么分、怎么合，一眼看清。', '新版 V S Code 的源代码管理里还自带提交图，分支怎么分、怎么合，一眼看清。'),
    ('G05_03', '不过按钮背后还是同一套命令；出了问题，懂命令才知道它到底干了什么。', None),
    # ---- practice 实战 ----
    ('D06', '实战：只用鼠标完成一次提交！', None),
    ('G06_01', '打开源代码管理，看一眼改了哪些文件，点开对比。', None),
    ('G06_02', '选中改好的三行，暂存所选范围；写好说明，提交。', None),
    ('G06_03', '最后点同步，推上 GitHub。全程没敲一个命令！', None),
    ('D07', '原来鼠标也能玩转 Git！', None),
    # ---- outro ----
    ('G07_01', '下个番外：GitHub 还有自己的命令行工具 gh，开 PR 不用打开网页。', '下个番外：GitHub 还有自己的命令行工具 g h，开 P R 不用打开网页。'),
    ('G07_02', '喜欢的话，一键三连！我们下个番外见！', None),
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
