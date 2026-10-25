# -*- coding: utf-8 -*-
"""第2集台词唯一来源：同时生成 script.json（朗读稿，送 TTS）和 subtitles.json（字幕稿，贴进 engine.js 的 TEXT）。
改台词只改这里，然后运行：python ep2/_gen_script.py
每行：(ID, 字幕稿, 朗读稿或 None)。朗读稿为 None 时与字幕稿相同。
"""
import json, re
from pathlib import Path

LINES = [
    # ---- cold 冷开场 ----
    ('D01', '完了完了！我的电脑泡水开不了机了！论文的存档全在里面！', None),
    # ---- why 为什么要云存档 + title ----
    ('G01_01', '先别哭！大肥鱼，上集教你的存档，其实都只存在你自己的电脑里。', None),
    ('G01_02', '电脑一坏，仓库就跟着一起没了。', None),
    ('G01_03', '所以我们需要云存档！就像游戏把进度同步到服务器，换台机器登录，存档还在。', None),
    ('G01_04', 'Git 的云存档，最有名的就是 GitHub，也就是我的老家！', None),
    ('G01_05', '欢迎来到 AI娘 Git 课，第二集，把存档搬上云端！', None),
    # ---- newrepo 开仓库 ----
    ('D02', '云存档？那我要去哪里开一个呀？', None),
    ('G02_01', '打开 GitHub 官网，用邮箱注册一个账号。', None),
    ('G02_02', '登录以后，点右上角的加号，选择新建仓库。', None),
    ('G02_03', '起个名字，比如 thesis，再选公开还是私有。论文嘛，选私有就好。', None),
    ('G02_04', '注意，下面那个添加 README 的选项，先别勾！', '注意，下面那个添加 read me 的选项，先别勾！'),
    ('G02_05', '你电脑里已经有存档了，云端保持空仓库，第一次上传最省事。', None),
    ('G02_06', '点击创建，云端的空仓库就准备好啦！', None),
    # ---- remote 连接远端 ----
    ('D03', '空仓库有了，我电脑里的存档要怎么连上去呢？', None),
    ('G03_01', '复制仓库页面上的地址，回到终端。', None),
    ('G03_02', '输入 git remote add origin，后面粘贴刚才的地址。', None),
    ('G03_03', 'origin 就是给云端仓库起的小名，以后就不用每次都敲一长串网址了。', None),
    ('G03_04', '再用 git remote -v 检查一下，能看到地址，就说明连上了。', '再用 git remote 加 v 参数检查一下，能看到地址，就说明连上了。'),
    # ---- push 上传 ----
    ('D04', '连上了！那要怎么把存档传上去呀？', None),
    ('G04_01', '用 git push！push 就是推，把本地的存档推到云端。', None),
    ('G04_02', '第一次要写完整：git push -u origin main。', '第一次要写完整：git push，加 u 参数，origin，main。'),
    ('G04_03', '意思是把 main 这条线推到 origin，-u 会记住它们的对应关系。', '意思是把 main 这条线推到 origin，u 参数会记住它们的对应关系。'),
    ('G04_04', '记住以后，下次只要敲 git push 就行了。', None),
    ('G04_05', '第一次推送会弹出登录窗口，在浏览器里点一下授权就好。', None),
    ('G04_06', '注意，GitHub 早就不能直接输密码了，要用浏览器授权或者令牌。', None),
    ('G04_07', '要是终端卡着不动，看看登录窗口是不是藏在别的窗口后面！', None),
    ('G04_08', '刷新网页，你的文件和每一个存档，都在云上啦！', None),
    # ---- web 网页上看存档 ----
    ('D05', '传上去以后，在网页上能干什么呀？', None),
    ('G05_01', '能干的可多了！点开提交记录，每一个存档都排得整整齐齐。', None),
    ('G05_02', '点进任何一个存档，红色是删掉的，绿色是新加的，和 git diff 一样清楚。', None),
    ('G05_03', '文件不小心删了？在网页上翻到旧存档，直接就能把它找回来。', None),
    ('G05_04', '就算电脑当场爆炸，只要推上去了，你的论文就一个字都不会丢！', None),
    # ---- clone 换电脑 ----
    ('D06', '那要是换了一台新电脑呢？', None),
    ('G06_01', '在新电脑上，输入 git clone，再加上仓库地址。', None),
    ('G06_02', 'clone 就是克隆，会把整个仓库，连同所有的历史存档，一起下载下来。', None),
    ('G06_03', '而且它已经自动连好了 origin，不用再 remote add。', None),
    ('G06_04', '进到文件夹就能接着写，读档、开分支，都和原来一模一样。', None),
    # ---- pull 两台电脑同步 ----
    ('D07', '可我宿舍电脑和实验室电脑都在改，怎么让它们保持一样呢？', None),
    ('G07_01', '这就要用 git pull，把云端的新存档拉下来。', None),
    ('G07_02', 'pull 其实是两步：先 fetch 下载，再 merge 合并进你当前的分支。', None),
    ('G07_03', '用 git status 也能看出来：ahead 表示你比云端多存了档，behind 表示你落后了。', None),
    ('G07_04', '所以要养成习惯：开工先 pull，收工再 push！', '所以要养成习惯：开工，先 pull！收工，再 push！'),
    # ---- branchpush 分支上云 ----
    ('D08', '那我上集开的平行世界，也能传上去吗？', None),
    ('G08_01', '当然可以！切到 idea 分支，git push -u origin idea。', '当然可以！切到 idea 分支，git push，加 u 参数，origin，idea。'),
    ('G08_02', '云端就多了一条 idea 分支，网页上可以随时切换着看。', None),
    ('G08_03', '另一台电脑 git pull 以后，用 git switch idea，就能切过去接着写。', None),
    ('G08_04', '写完合并回 main，别忘了把 main 也 push 上去。', None),
    # ---- rejected push 被拒 ----
    ('D09', '那我要是忘了 pull，直接 push 会怎么样？', None),
    ('G09_01', 'GitHub 会拒绝你，提示 rejected。', None),
    ('G09_02', '因为云端有你本地没有的存档，直接推上去，就会把它们盖掉。', None),
    ('G09_03', '别慌，先 git pull，把云端的存档合进来。', None),
    ('G09_04', '要是两边改了同一行，就会出现冲突，处理方法和上集一模一样。', None),
    ('G09_05', '合好以后再 git push，就成功啦！', None),
    ('G09_06', '网上有人教你加 --force 强制推送，那会抹掉云端的存档，新手千万别用！', '网上有人教你加 force 参数强制推送，那会抹掉云端的存档，新手千万别用！'),
    # ---- nopush 什么不能传 ----
    ('D10', '那是不是什么文件都能往上传呀？', None),
    ('G10_01', '私有仓库只有你自己能看，但有两样东西，无论如何都别推上去。', None),
    ('G10_02', '第一是密码和密钥，一旦推上去，就很难彻底删干净。', None),
    ('G10_03', '第二是超大的文件，GitHub 单个文件超过一百兆，会直接拒收。', None),
    ('G10_04', '怎么让 Git 自动忽略它们？我们下集讲 .gitignore 的时候细说！', '怎么让 Git 自动忽略它们？我们下集讲 git ignore 的时候细说！'),
    # ---- recap 复习 ----
    ('D11', '好像有点多，能帮我总结一下吗？', None),
    ('G11_01', '云存档，就四个命令！', None),
    ('G11_02', 'remote add 连上云端，push 推上去，clone 搬到新电脑，pull 拉下来。', None),
    ('G11_03', '再记一句口诀：开工先 pull，收工再 push！', '再记一句口诀：开工，先 pull！收工，再 push！'),
    # ---- practice 实战 ----
    ('D12', '能不能带我从头到尾，完整走一遍呀？', None),
    ('G12_01', '没问题！我们模拟两台电脑，完整实战一遍！', None),
    ('G12_02', '宿舍电脑：先在 GitHub 新建空仓库，再 git remote add origin。', None),
    ('G12_03', 'git push -u origin main，存档上云！', 'git push，加 u 参数，origin，main，存档上云！'),
    ('G12_04', '到了实验室：git clone 下载仓库，写完第二章，add、commit，再 push。', None),
    ('G12_05', '回到宿舍：git pull，第二章就同步过来了！', None),
    ('G12_06', '最后 git log --oneline，main 和 origin/main 指着同一个存档，两边完全一致。', '最后 git log，加 oneline 参数，main 和 origin 斜杠 main 指着同一个存档，两边完全一致。'),
    ('G12_07', '两台电脑，一份存档，再也不怕电脑坏啦！', None),
    # ---- teaser 预告 + 三连 ----
    ('G13_01', '下集预告：一个人用云存档已经会了，那和同学一起写呢？下集我们讲联机模式，多人协作！', None),
    ('G13_02', '喜欢的话记得一键三连，我们下集见！', None),
]


def main():
    here = Path(__file__).resolve().parent
    ids = [i for i, _, _ in LINES]
    assert len(ids) == len(set(ids)), '台词 ID 重复'
    script, subs = {}, {}
    for i, sub, read in LINES:
        subs[i] = sub
        key = i.split('_')[0]               # G04_02 → G04；D03 → D03
        script.setdefault(key, []).append(read or sub)
    (here / 'script.json').write_text(json.dumps(script, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    (here / 'subtitles.json').write_text(json.dumps(subs, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    g = sum(len(s) for i, s, _ in LINES if i[0] == 'G'); d = sum(len(s) for i, s, _ in LINES if i[0] == 'D')
    cjk = sum(len(re.sub(r'[\x00-\x7f]', '', s)) for _, s, _ in LINES)
    print(f'{len(LINES)} 句（G {sum(i[0] == "G" for i in ids)} / D {sum(i[0] == "D" for i in ids)}），'
          f'字幕 {g + d} 字符，其中中文 {cjk} 字；按第1集 ≈6.3 字/秒 估算 {cjk / 6.3 / 60:.1f} 分钟（含动画空拍）')


if __name__ == '__main__':
    main()
