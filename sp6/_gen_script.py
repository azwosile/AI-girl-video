# -*- coding: utf-8 -*-
"""番外6《网页里写代码》台词唯一来源：同时生成 script.json（朗读稿，送 TTS）和 subtitles.json（字幕稿，贴进 engine.js 的 TEXT）。
改台词只改这里，然后运行：python sp6/_gen_script.py
每行：(ID, 字幕稿, 朗读稿或 None)。朗读稿为 None 时与字幕稿相同。

ID 首字母 = 说话人：
  G GitHub娘（讲师）  D 大肥鱼 / DeepSeek（组长）
  Q 千问  C Claude  M Gemini  X Grok  B 豆包  K Kimi   ← AI 分工小队
朗读稿规则（GPT-SoVITS）：行(háng)→航；Gemini→杰米奈；Claude→克劳德；push→推送；main→主分支；PR→P R。
番外6补充：github.dev→github 点 dev；Codespaces→code spaces；README→read me。
字幕保留英文原文和代码。
"""
import json, re
from pathlib import Path

SPEAKERS = {'G': 'GitHub娘', 'D': '大肥鱼', 'Q': '千问', 'C': 'Claude', 'M': 'Gemini',
            'X': 'Grok', 'B': '豆包', 'K': 'Kimi'}


LINES = [
    # ---- cold 冷开场：借来的电脑，急着改错别字（千问）----
    ('Q01', '用户反馈：白饭页的 README 有个错别字，能马上改吗？', '用户反馈：白饭页的 read me 有个错别字，能马上改吗？'),
    ('D01', '可我用的是借来的电脑，Git 都没装啊！', None),
    # ---- title ----
    ('G01_01', '不用装！GitHub 网页里就能改代码，连带终端的开发环境都有。', None),
    ('G01_02', '欢迎来到 AI娘 Git 课番外六：网页里写代码！', '欢迎来到，AI 娘，Git 课！番外六，网页里写代码！'),
    # ---- pen 铅笔 ----
    ('D02', '最简单的改法呢？', None),
    ('G02_01', '打开文件，点右上角的铅笔图标，直接在网页里改。', None),
    ('G02_02', '改完点 Commit changes：可以直接提交到当前分支，也可以新建一个分支，顺手开 PR。', '改完点提交：可以直接提交到当前分支，也可以新建一个分支，顺手开 P R。'),
    ('G02_03', '审 PR 时，还能在评论里插入修改建议；作者点一下 Commit suggestion，就直接改好了。', '审 P R 时，还能在评论里插入修改建议；作者点一下 commit suggestion，就直接改好了。'),
    # ---- dev github.dev ----
    ('D03', '要改好几个文件呢？', None),
    ('G03_01', '在仓库页面按一下句号键，就会打开 github.dev：浏览器里的 VS Code。', '在仓库页面按一下句号键，就会打开 github 点 dev：浏览器里的 V S Code。'),
    ('G03_02', '好几个文件一起改，在左边的源代码管理里一次提交；把网址里的 github.com 换成 github.dev 也行。', '好几个文件一起改，在左边的源代码管理里一次提交；把网址里的 github 点 com 换成 github 点 dev 也行。'),
    ('G03_03', '它免费，但没有终端，不能运行代码。', None),
    ('G03_04', '在 PR 页面按句号也行：github.dev 会直接打开这个 PR 的分支，改完提交，就进了这个 PR。', '在 P R 页面按句号也行：github 点 dev 会直接打开这个 P R 的分支，改完提交，就进了这个 P R。'),
    # ---- cs Codespaces ----
    ('D04', '那我想在网页里跑起来看看效果呢？', None),
    ('G04_01', '用 Codespaces：点 Code 按钮，切到 Codespaces 新建一个，云端就开好一台带终端的开发机。', '用 code spaces：点 Code 按钮，切到 code spaces 新建一个，云端就开好一台带终端的开发机。'),
    ('G04_02', '里面装好了 Git 和常用工具，能运行、能调试，还能转发端口预览网页。', None),
    ('G04_03', '个人账号每月有免费额度：120 核心小时加 15 GB 存储；闲置 30 分钟会自动停止。', '个人账号每月有免费额度：一百二十核心小时，加十五 G 存储；闲置三十分钟会自动停止。'),
    # ---- pick 怎么选 ----
    ('D05', '三个工具怎么选？', None),
    ('G05_01', '改一两个字用铅笔；改几个文件用 github.dev；要运行、要终端，就开 Codespaces。', '改一两个字用铅笔；改几个文件用 github 点 dev；要运行、要终端，就开 code spaces。'),
    ('G05_02', '用完记得删掉不要的 codespace：停着不动，存储也照样算额度。', '用完记得删掉不要的 code space：停着不动，存储也照样算额度。'),
    # ---- practice 实战 ----
    ('D06', '实战：用借来的电脑修好错别字！', None),
    ('G06_01', '按句号打开 github.dev，新建分支 fix/typo，改好 README。', '按句号打开 github 点 dev，新建一个修错别字的分支，改好 read me。'),
    ('G06_02', '源代码管理里写好说明、提交，再回仓库页面开 PR。', '源代码管理里写好说明、提交，再回仓库页面开 P R。'),
    ('G06_03', '想先看效果？在 Codespaces 里跑起来，确认没问题再合并。', '想先看效果？在 code spaces 里跑起来，确认没问题再合并。'),
    ('Q02', '收到，我转告用户：错别字已经修好啦！', None),
    ('D07', '什么都没装，PR 照样提！', '什么都没装，P R 照样提！'),
    # ---- outro ----
    ('G07_01', '番外就先到这里！还想看什么主题，评论区告诉我们。', None),
    ('G07_02', '喜欢的话，一键三连！我们下次见！', None),
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
