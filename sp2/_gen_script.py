# -*- coding: utf-8 -*-
"""番外2《SSH 与多账号》台词唯一来源：同时生成 script.json（朗读稿，送 TTS）和 subtitles.json（字幕稿，贴进 engine.js 的 TEXT）。
改台词只改这里，然后运行：python sp2/_gen_script.py
每行：(ID, 字幕稿, 朗读稿或 None)。朗读稿为 None 时与字幕稿相同。

ID 首字母 = 说话人：
  G GitHub娘（讲师）  D 大肥鱼 / DeepSeek（组长）
  Q 千问  C Claude  M Gemini  X Grok  B 豆包  K Kimi   ← AI 分工小队
朗读稿规则（GPT-SoVITS）：行(háng)→航；Gemini→杰米奈；Claude→克劳德；push→推送；main→主分支；PR→P R。
番外2补充：SSH→S S H；ssh-keygen→S S H keygen；ed25519→E D 二五五一九；.pub→点 pub；~/.ssh/config→S S H 的 config 文件；includeIf→include if。
字幕保留英文原文和代码。
"""
import json, re
from pathlib import Path

SPEAKERS = {'G': 'GitHub娘', 'D': '大肥鱼', 'Q': '千问', 'C': 'Claude', 'M': 'Gemini',
            'X': 'Grok', 'B': '豆包', 'K': 'Kimi'}

LINES = [
    # ---- cold 冷开场：HTTPS 推送要密码，还被拒 ----
    ('D01', '推送又要我输密码？输完还报错：Password authentication is not supported！', '推送又要我输密码？输完还报错：不支持密码登录！'),
    # ---- title ----
    ('G01_01', 'GitHub 早就不收账号密码了：HTTPS 要用令牌，或者换成 SSH 钥匙，一次配好，以后再也不用输。', 'GitHub 早就不收账号密码了：H T T P S 要用令牌，或者换成 S S H 钥匙，一次配好，以后再也不用输。'),
    ('G01_02', '欢迎来到 AI娘 Git 课番外二：SSH 与多账号！', '欢迎来到，AI 娘，Git 课！番外二，S S H 与多账号！'),
    # ---- key 造钥匙 ----
    ('D02', 'SSH 钥匙去哪儿领？', 'S S H 钥匙去哪儿领？'),
    ('G02_01', '自己造！ssh-keygen -t ed25519 -C 加上邮箱，一路回车，还可以顺手设一个密码短语。', '自己造！用 S S H keygen 命令，选 E D 二五五一九 类型，后面加上邮箱，一路回车，还可以顺手设一个密码短语。'),
    ('G02_02', '会生成两个文件：id_ed25519 是私钥，谁都不能给；带 .pub 的是公钥，可以放心交出去。', '会生成两个文件：不带后缀的是私钥，谁都不能给；带点 pub 的是公钥，可以放心交出去。'),
    # ---- add 公钥交给 GitHub ----
    ('D03', '公钥交给谁？', None),
    ('G03_01', '打开 GitHub 的 Settings → SSH and GPG keys，点 New SSH key，把 .pub 文件的内容整段粘进去。', '打开 GitHub 设置里的 S S H 密钥页面，点新建，把点 pub 文件的内容整段粘进去。'),
    ('G03_02', '再用 ssh -T git@github.com 测一下：第一次要确认指纹，输入 yes；看到 Hi 加你的用户名，就通了。', '再用 S S H 连一下 github 测试：第一次要确认指纹，输入 yes；看到 Hi 加你的用户名，就通了。'),
    ('G03_03', '旧仓库换个地址就行：git remote set-url origin，后面跟 git@github.com 开头的 SSH 地址。', '旧仓库换个地址就行：用 remote set url 命令，换成 git at github 开头的 S S H 地址。'),
    # ---- multi 多账号 ----
    ('D04', '我有公司号和个人号，一把钥匙能两边用吗？', None),
    ('G04_01', '不行：一把公钥只能加到一个 GitHub 账号上，再加会提示 Key is already in use。', '不行：一把公钥只能加到一个 GitHub 账号上，再加就会提示：这把钥匙已经被用了。'),
    ('G04_02', '给公司号再造一把 id_work，在 ~/.ssh/config 里起个别名：Host github-work，指向 github.com，用 id_work 这把钥匙。', '给公司号再造一把钥匙，在 S S H 的 config 文件里起个别名：github 杠 work，指向 github 点 com，用公司那把钥匙。'),
    ('G04_03', '克隆公司仓库时，把地址里的 github.com 换成 github-work，SSH 就会自动拿对钥匙。', '克隆公司仓库时，把地址里的 github 点 com 换成 github 杠 work，S S H 就会自动拿对钥匙。'),
    # ---- who 提交身份（Claude）----
    ('C01', '组长，公司仓库里混进了一个用你个人邮箱写的提交。', None),
    ('D05', '钥匙都对了，名字怎么还是错的？', None),
    ('G05_01', '钥匙只管能不能推；提交上写的是谁，看的是 user.name 和 user.email。', '钥匙只管能不能推；提交上写的是谁，看的是用户名和邮箱这两项配置。'),
    ('G05_02', '在全局配置里加一段 includeIf "gitdir:~/work/"：仓库在 work 文件夹里，就自动读公司那份配置，换上公司邮箱。', '在全局配置里加一段 include if：只要仓库在 work 文件夹里，就自动读公司那份配置，换上公司邮箱。'),
    ('G05_03', '进公司仓库敲 git config user.email 检查一下，显示公司邮箱就对了。', '进公司仓库查一下邮箱配置，显示公司邮箱就对了。'),
    ('C02', '身份清清楚楚，审查通过。', None),
    # ---- practice 实战 ----
    ('D06', '实战：帮我把两个号都配好！', None),
    ('G06_01', 'ssh-keygen 造两把钥匙：个人一把、公司一把，各自加到对应的账号上。', '造两把钥匙：个人一把、公司一把，各自加到对应的账号上。'),
    ('G06_02', 'config 里写好 github-work，再 ssh -T 两边各测一次：两个 Hi 后面，是两个不同的用户名。', 'config 里写好公司别名，两边各测一次：两个 Hi 后面，是两个不同的用户名。'),
    ('G06_03', 'includeIf 管住公司文件夹的邮箱。从此推送不用密码，两个号也不会串。', 'include if 管住公司文件夹的邮箱。从此推送不用密码，两个号也不会串。'),
    ('D07', '一次配好，再也不用输密码了！', None),
    # ---- outro 下个番外 + 三连 ----
    ('G07_01', '下个番外：不想敲命令？图形界面工具也能把 Git 用得明明白白。', None),
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
