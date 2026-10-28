# -*- coding: utf-8 -*-
"""番外5《提交规范与钩子》台词唯一来源：同时生成 script.json（朗读稿，送 TTS）和 subtitles.json（字幕稿，贴进 engine.js 的 TEXT）。
改台词只改这里，然后运行：python sp5/_gen_script.py
每行：(ID, 字幕稿, 朗读稿或 None)。朗读稿为 None 时与字幕稿相同。

ID 首字母 = 说话人：
  G GitHub娘（讲师）  D 大肥鱼 / DeepSeek（组长）
  Q 千问  C Claude  M Gemini  X Grok  B 豆包  K Kimi   ← AI 分工小队
朗读稿规则（GPT-SoVITS）：行(háng)→航；Gemini→杰米奈；Claude→克劳德；push→推送；main→主分支；PR→P R。
番外5补充：feat / fix / docs 照读；commit-msg→commit message 钩子；pre-commit→pre commit；core.hooksPath→hooks path 配置；--no-verify→no verify。
字幕保留英文原文和代码。
"""
import json, re
from pathlib import Path

SPEAKERS = {'G': 'GitHub娘', 'D': '大肥鱼', 'Q': '千问', 'C': 'Claude', 'M': 'Gemini',
            'X': 'Grok', 'B': '豆包', 'K': 'Kimi'}

LINES = [
    # ---- cold 冷开场：提交历史全是“改了点” ----
    ('D01', '翻提交历史：“修改”“改了点”“再改一下”……我自己都看不懂当时改了啥！', '翻提交历史：修改、改了点、再改一下……我自己都看不懂当时改了啥！'),
    # ---- title ----
    ('G01_01', '提交说明是写给未来的自己看的。今天学一套通用写法，再让 Git 钩子帮你自动把关。', None),
    ('G01_02', '欢迎来到 AI娘 Git 课番外五：提交规范与钩子！', '欢迎来到，AI 娘，Git 课！番外五，提交规范与钩子！'),
    # ---- msg 好说明 ----
    ('D02', '好的说明长什么样？', None),
    ('G02_01', '第一行是标题：五十个字符以内，说清楚做了什么；空一行，再写为什么要改。', None),
    ('G02_02', '标题直接写动作：“修复登录按钮错位”；别写“修改了一些东西”。', None),
    # ---- cc 约定式提交（Kimi）----
    ('K01', '历史太长了。我想一眼找出所有修 bug 的提交。', None),
    ('D03', '能给提交分个类吗？', None),
    ('G03_01', '用约定式提交：类型、冒号、空格，再写描述。feat 是新功能，fix 是修 bug，docs 是改文档。', None),
    ('G03_02', '还能加范围：fix(login)；破坏性改动在类型后面加感叹号，比如 feat!。', '还能在括号里加范围，比如 fix 登录；破坏性改动在类型后面加感叹号。'),
    ('G03_03', '格式统一以后，git log --grep "^fix" 就能筛出所有修复，工具还能据此自动生成更新日志。', '格式统一以后，用 log 加 grep 就能筛出所有修复，工具还能据此自动生成更新日志。'),
    ('K02', '一条一条，分得清清楚楚。', None),
    # ---- tpl 提交模板 ----
    ('D04', '每次都要想格式，好麻烦……', None),
    ('G04_01', '写一个提交模板：git config commit.template 指向一个文本文件，不加 -m 提交时，编辑器里自动带上提示。', '写一个提交模板：用 commit template 配置指向一个文本文件，不加 m 参数提交时，编辑器里自动带上提示。'),
    # ---- hook 钩子 ----
    ('D05', '要是有人还是乱写呢？', None),
    ('G05_01', '用钩子把关：仓库的 .git/hooks 文件夹里，放一个叫 commit-msg 的脚本。', '用钩子把关：仓库的 hooks 文件夹里，放一个叫 commit message 的脚本。'),
    ('G05_02', '每次提交，Git 都会先跑它：格式不对就返回非零，这次提交直接被拒。', None),
    ('G05_03', '还有 pre-commit 钩子：提交前自动跑检查，比如格式化、跑测试。', '还有 pre commit 钩子：提交前自动跑检查，比如格式化、跑测试。'),
    ('G05_04', '.git/hooks 不会跟着仓库走：团队要共享，就把钩子放进仓库里的文件夹，再用 core.hooksPath 指过去。', 'hooks 文件夹不会跟着仓库走：团队要共享，就把钩子放进仓库里的文件夹，再用 hooks path 配置指过去。'),
    ('G05_05', '本地钩子能用 --no-verify 跳过，所以真正把关，还得靠第七集的 Actions 检查。', '本地钩子能用 no verify 跳过，所以真正把关，还得靠第七集的 Actions 检查。'),
    # ---- practice 实战 ----
    ('D06', '实战：给白饭页装上提交把关！', None),
    ('G06_01', '在仓库里建 .githooks 文件夹，写一个 commit-msg：不是 feat、fix、docs 开头，就拒绝。', '在仓库里建一个 githooks 文件夹，写一个 commit message 钩子：不是 feat、fix、docs 开头，就拒绝。'),
    ('G06_02', 'git config core.hooksPath .githooks，再给脚本加上执行权限。', '把 hooks path 配置指向这个文件夹，再给脚本加上执行权限。'),
    ('G06_03', '试一下：写“改了点东西”，被拒；改成“fix: 修复按钮错位”，提交成功！', '试一下：写改了点东西，被拒；改成 fix 冒号 修复按钮错位，提交成功！'),
    ('D07', '历史终于看得懂了！', None),
    # ---- outro ----
    ('G07_01', '下个番外：不用装任何软件，在网页里按一个键就能写代码。', None),
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
