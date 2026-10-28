# -*- coding: utf-8 -*-
"""番外4《GitHub CLI》台词唯一来源：同时生成 script.json（朗读稿，送 TTS）和 subtitles.json（字幕稿，贴进 engine.js 的 TEXT）。
改台词只改这里，然后运行：python sp4/_gen_script.py
每行：(ID, 字幕稿, 朗读稿或 None)。朗读稿为 None 时与字幕稿相同。

ID 首字母 = 说话人：
  G GitHub娘（讲师）  D 大肥鱼 / DeepSeek（组长）
  Q 千问  C Claude  M Gemini  X Grok  B 豆包  K Kimi   ← AI 分工小队
朗读稿规则（GPT-SoVITS）：行(háng)→航；Gemini→杰米奈；Claude→克劳德；push→推送；main→主分支；PR→P R。
番外4补充：gh→g h；CLI→C L I；--fill / --web / --squash 等参数口语化。
字幕保留英文原文和代码。
"""
import json, re
from pathlib import Path

SPEAKERS = {'G': 'GitHub娘', 'D': '大肥鱼', 'Q': '千问', 'C': 'Claude', 'M': 'Gemini',
            'X': 'Grok', 'B': '豆包', 'K': 'Kimi'}


LINES = [
    # ---- cold 冷开场：终端和网页来回切 ----
    ('D01', '写完代码去网页开 PR，审完又切回终端拉代码……来回切到头晕！', '写完代码去网页开 P R，审完又切回终端拉代码，来回切到头晕！'),
    # ---- title ----
    ('G01_01', '试试 GitHub 官方的命令行工具 gh：仓库、PR、Issue，在终端里全搞定。', '试试 GitHub 官方的命令行工具 g h：仓库、P R、Issue，在终端里全搞定。'),
    ('G01_02', '欢迎来到 AI娘 Git 课番外四：GitHub CLI！', '欢迎来到，AI 娘，Git 课！番外四，GitHub C L I！'),
    # ---- auth 登录 ----
    ('D02', '它怎么认识我？', None),
    ('G02_01', '装好以后先 gh auth login：选 GitHub.com，按提示在浏览器里点一下确认，就登录了。', '装好以后先登录：选 GitHub 点 com，按提示在浏览器里点一下确认，就好了。'),
    ('G02_02', 'gh auth status 能看到现在登录的是哪个账号。', '用 auth status 能看到现在登录的是哪个账号。'),
    ('G02_03', '公司号、个人号都能登录：gh auth switch 一条命令换号，跟番外二的配置正好搭配。', '公司号、个人号都能登录：auth switch 一条命令换号，跟番外二的配置正好搭配。'),
    # ---- repo 仓库 ----
    ('D03', '克隆和建仓库呢？', None),
    ('G03_01', 'gh repo clone 加上“用户名/仓库名”就能克隆，不用复制一长串地址。', 'repo clone 加上用户名斜杠仓库名就能克隆，不用复制一长串地址。'),
    ('G03_02', '本地新项目想上云：gh repo create，选“推送现有的本地仓库”，建好远程仓库还顺手推上去。', '本地新项目想上云：用 repo create，选推送现有的本地仓库，建好远程仓库还顺手推上去。'),
    ('G03_03', '想看网页？gh repo view --web，浏览器直接打开。', '想看网页？repo view 加上 web 参数，浏览器直接打开。'),
    ('G03_04', '想参与别人的项目？gh repo fork 加 --clone：一键复刻再克隆到本地，原仓库自动设成 upstream。', '想参与别人的项目？repo fork 加上 clone 参数：一键复刻再克隆到本地，原仓库自动设成 upstream。'),
    # ---- pr PR（Grok）----
    ('D04', 'PR 也能在终端里开？', 'P R 也能在终端里开？'),
    ('G04_01', 'gh pr create，标题和说明按提示填；加 --fill 就直接用提交信息。', '用 pr create，标题和说明按提示填；加上 fill 参数就直接用提交信息。'),
    ('G04_02', '审别人的 PR：gh pr checkout 加编号，一条命令把他的分支拉到本地跑一跑。', '审别人的 P R：pr checkout 加编号，一条命令把他的分支拉到本地跑一跑。'),
    ('G04_03', 'gh pr status 看哪些 PR 在等你，gh pr checks 看检查跑没跑绿。', 'pr status 看哪些 P R 在等你，pr checks 看检查跑没跑绿。'),
    ('X01', '检查全绿。我直接在终端里合了。', None),
    ('G04_04', 'gh pr merge 加编号，选 --squash，再加 --delete-branch，合完顺手删掉分支。', 'pr merge 加编号，选压缩合并，再加上删除分支的参数，合完顺手删掉分支。'),
    # ---- issue Issue ----
    ('D05', 'Issue 怎么办？', None),
    ('G05_01', 'gh issue list 看列表，gh issue create 新建，gh issue view 加编号看详情。', 'issue list 看列表，issue create 新建，issue view 加编号看详情。'),
    ('G05_02', '大部分命令加上 --web 就会打开对应的网页，终端和网页随时切换。', '大部分命令加上 web 参数就会打开对应的网页，终端和网页随时切换。'),
    ('G05_03', '接了 Issue 就开工：gh issue develop 加编号和 --checkout，建一个关联它的分支并切过去；PR 合并后，Issue 自动关闭。', '接了 Issue 就开工：issue develop 加编号，再加上 checkout 参数，建一个关联它的分支并切过去；P R 合并后，Issue 自动关闭。'),
    # ---- practice 实战 ----
    ('D06', '实战：不离开终端，走完一个 PR！', '实战：不离开终端，走完一个 P R！'),
    ('G06_01', 'git switch -c fix/typo，改好、提交、推送。', '先开一个修错别字的分支，改好、提交、推送。'),
    ('G06_02', 'gh pr create --fill，PR 开好了；gh pr checks 等它变绿。', 'pr create 加 fill，P R 就开好了；再用 pr checks 等它变绿。'),
    ('G06_03', 'gh pr merge --squash --delete-branch：合并、删分支，一次完成。', 'pr merge 加上压缩合并和删除分支：合并、删分支，一次完成。'),
    ('D07', '一个网页都没开，PR 就合进去了！', '一个网页都没开，P R 就合进去了！'),
    # ---- outro ----
    ('G07_01', '下个番外：提交说明怎么写才规范，再让钩子帮你自动把关。', None),
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
