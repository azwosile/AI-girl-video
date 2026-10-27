# -*- coding: utf-8 -*-
"""第7集台词唯一来源：同时生成 script.json（朗读稿，送 TTS）和 subtitles.json（字幕稿，贴进 engine.js 的 TEXT）。
改台词只改这里，然后运行：python ep7/_gen_script.py
每行：(ID, 字幕稿, 朗读稿或 None)。朗读稿为 None 时与字幕稿相同。

ID 首字母 = 说话人：
  G GitHub娘（讲师）  D 大肥鱼 / DeepSeek（组长）
  Q 千问  C Claude  M Gemini  X Grok  B 豆包  K Kimi   ← AI 分工小队
朗读稿规则（GPT-SoVITS）：行(háng)→航；Gemini→杰米奈；Claude→克劳德；push→推送；main→主分支。
第7集补充：.github/workflows→点 github 斜杠 workflows；.yml→点 Y M L；YAML→Y A M L；PR→P R；UTC→U T C；cron→克龙；
README→read me；Asia/Shanghai→亚洲斜杠上海；html-validate→H T M L 校验工具；界面按钮读中文（运行按钮 / 创建状态徽章 / 新建仓库密钥）；
passing→通过；rebase→变基。字幕保留英文原文和代码。
"""
import json, re
from pathlib import Path

SPEAKERS = {'G': 'GitHub娘', 'D': '大肥鱼', 'Q': '千问', 'C': 'Claude', 'M': 'Gemini',
            'X': 'Grok', 'B': '豆包', 'K': 'Kimi'}

LINES = [
    # ---- cold 冷开场：坏页面推上去了 ----
    ('D01', '我推送了一版白饭页，标签没关好，整个页面全乱了……同学都看见了！', None),
    # ---- why 引入 + title ----
    ('G01_01', '每次推送前都自己检查？太累了。交给 GitHub Actions：每次推送，GitHub 借你一台云电脑，按你写的任务单自动干活。', '每次推送前都自己检查？太累了。交给 GitHub Actions：每次推送，GitHub 借你一台云电脑，按你写的任务单，自动干活。'),
    ('G01_02', '就像游戏里的自动挂机：规则写好一次，以后每次存档上传，它都自己跑一遍。', '就像游戏里的自动挂机：规则写好一次，以后每次存档上传，它都自己跑一遍。'),
    ('G01_03', '欢迎来到 AI娘 Git 课，第七集，GitHub Actions！', '欢迎来到，AI 娘，Git 课！第七集，GitHub Actions！'),
    # ---- workflow 任务单（Kimi：YAML 缩进）----
    ('D02', '任务单写在哪？要装什么软件吗？', None),
    ('G02_01', '什么都不用装：在仓库里新建 .github/workflows/check.yml，文件夹名一个字母都不能错。', '什么都不用装：在仓库里新建文件，点 github 斜杠 workflows 斜杠 check 点 Y M L，文件夹名一个字母都不能错。'),
    ('G02_02', 'name 给任务单起名字；on 写什么时候干活，写 push，就是每次推送都跑。', 'name，给任务单起名字；on，写什么时候干活：写推送，就是每次推送都跑。'),
    ('G02_03', 'jobs 下面是任务；runs-on 选云电脑，ubuntu-latest 就是最新版的 Linux。', 'jobs 下面是任务；runs on 选云电脑，ubuntu latest，就是最新版的 Linux。'),
    ('G02_04', 'steps 是一步一步的步骤：uses 借用现成的动作，比如 actions/checkout，先把代码拉到云电脑上。', 'steps，是一步一步的步骤：uses，借用现成的动作，比如 checkout，先把代码拉到云电脑上。'),
    ('G02_05', 'run 就是直接跑命令，比如 npx html-validate index.html，检查网页标签有没有关好。', 'run，就是直接跑命令，比如用 H T M L 校验工具，检查网页的标签有没有关好。'),
    ('G02_06', '文件推送上去，打开仓库的 Actions 标签页，就能看到它开始跑了。', None),
    ('K01', '我把 YAML 文档读完了。关键：层级全靠缩进，只能用空格，不能用 Tab。', '我把 Y A M L 的文档读完了。关键：层级全靠缩进，只能用空格，不能用 Tab 键。'),
    ('D03', '难怪我的任务单报错……我用了 Tab！', '难怪我的任务单报错……我用了 T A B 键！'),
    ('K02', '一句话：同一层左边对齐，只用空格。', None),
    # ---- run 运行结果（Grok：红叉是真的吗）----
    ('X01', '我推送完，提交旁边多了个红叉。这是真的吗？', None),
    ('D04', '红叉？是把仓库弄坏了吗？', None),
    ('G03_01', '是真的，但仓库没坏：红叉只是说检查没通过。黄点是正在跑，绿勾是通过。', None),
    ('G03_02', '点进 Actions，打开红叉那一次，展开报错的那一步，日志会写出错在哪一行。', None),
    ('G03_03', '修好再推送，它会自动再跑一遍；失败的时候，GitHub 还会发邮件提醒你。', None),
    ('X02', '第十二行少了个结束标签。补上，绿勾。是真的。', None),
    ('G03_04', '公开仓库用这些云电脑不要钱；私有仓库每月也有两千分钟免费额度。', None),
    # ---- trigger 触发方式（千问：PR 前先检查）----
    ('Q01', '用户反馈：有人给白饭页提了 PR，能不能合并之前先自动检查？', '用户反馈：有人给白饭页提了 P R，能不能合并之前，先自动检查？'),
    ('D05', '对哦，上次就是合并完才发现坏了！', None),
    ('G04_01', 'on 里再加一个 pull_request：PR 页面下面就会显示检查结果，绿勾了再合并。', 'on 里再加一个 pull request：P R 页面下面，就会显示检查结果，绿勾了再合并。'),
    ('G04_02', '再加一个 workflow_dispatch，Actions 页面会多一个 Run workflow 按钮，随时手动跑一次。', '再加一个 workflow dispatch，Actions 页面会多一个运行按钮，随时手动跑一次。'),
    ('G04_03', 'push 和 pull_request 写在一起：自己推送查一遍，别人提 PR 也查一遍。', '推送和 pull request 写在一起：自己推送，查一遍；别人提 P R，也查一遍。'),
    ('Q02', 'PR 下面亮绿勾了，用户说可以放心合并。', 'P R 下面亮绿勾了，用户说可以放心合并。'),
    # ---- schedule 定时（Gemini：八点变四点）----
    ('M01', '喵？我设了每天早上八点自动检查，结果下午四点才跑！', None),
    ('D06', '又是 Gemini 的时间……这次是几几年？', '又是杰米奈的时间……这次是几几年？'),
    ('G05_01', 'schedule 用 cron 写时间，默认按 UTC 算，比北京时间慢八个小时。', '定时任务用克龙表达式写时间，默认按 U T C 算，比北京时间慢八个小时。'),
    ('G05_02', '要北京时间八点，就写零点；或者在下面加一行 timezone: Asia/Shanghai。', '要北京时间八点，就写零点；或者在下面加一行时区，写亚洲斜杠上海。'),
    ('G05_03', '最短五分钟一次；整点跑的人多，可能会晚一点，挑个零碎的分钟更稳。', None),
    ('M02', '原来不是我的时间错了，是时差的锅！', None),
    ('G05_04', '还有两点：定时只在默认分支上跑；公开仓库六十天没动静，定时会被自动暂停。', None),
    # ---- secrets 密钥（Claude：别写进任务单）----
    ('C01', '慢着。你要把部署密钥直接写进任务单？仓库是公开的，谁都看得见。', None),
    ('D07', '那……密钥该放哪？', None),
    ('G06_01', '放进 Settings → Secrets and variables → Actions，点 New repository secret 新建一个。', '放进设置页面的密钥和变量，选 Actions，新建一个仓库密钥。'),
    ('G06_02', '任务单里写 ${{ secrets.DEPLOY_KEY }} 来取；日志里只会显示三个星号。', '任务单里用 secrets 点名字来取；日志里，只会显示三个星号。'),
    ('C02', '密钥不进代码，日志自动打码。批准。', None),
    # ---- badge 徽章（豆包：挂个绿牌子）----
    ('B01', '家人们！我想在 README 上挂个绿色的“检查通过”牌子，一看就靠谱！', '家人们！我想在 read me 上，挂个绿色的检查通过牌子，一看就靠谱！'),
    ('D08', '我也要！要绿色的！', None),
    ('G07_01', '在 Actions 里点开这个工作流，右上角三个点，Create status badge，复制那一行贴进 README。', '在 Actions 里点开这个工作流，右上角三个点，选创建状态徽章，复制那一行，贴进 read me。'),
    ('G07_02', '检查通过它就是绿色的 passing，失败就变红，访客一眼就知道。', '检查通过，它就是绿色的通过；失败就变红，访客一眼就知道。'),
    ('B02', '牌子挂上了，家人们放心点赞！', None),
    # ---- recap 复习 ----
    ('D09', '信息量好大……帮我划个重点！', None),
    ('G08_01', '写：.github/workflows 里放 yml；on、jobs、steps，缩进只用空格。', '写：点 github 斜杠 workflows 里，放 Y M L 文件；on、jobs、steps，缩进只用空格。'),
    ('G08_02', '看：黄点在跑，绿勾通过，红叉就点进 Actions 看日志。', None),
    ('G08_03', '管：PR 前自动检查，定时记得 UTC，密钥放 Secrets，别写进代码。', '管：P R 前自动检查，定时记得 U T C，密钥放进设置，别写进代码。'),
    # ---- practice 实战：白饭页装上自动检查 ----
    ('D10', '我现在就给白饭页装上自动检查！', None),
    ('G09_01', '新建 .github/workflows/check.yml：push 和 PR 都触发，先 checkout，再用 html-validate 检查首页。', '新建 check 点 Y M L：推送和 P R 都触发；先拉代码，再用 H T M L 校验工具检查首页。'),
    ('G09_02', '提交、推送，Actions 里黄点转起来……红叉！日志说第十二行，div 没关。', '提交、推送，Actions 里黄点转起来……红叉！日志说第十二行，div 标签没关。'),
    ('G09_03', '补上结束标签，再推送：绿勾！Pages 也跟着自动部署了。', None),
    ('G09_04', '再加上手动按钮和徽章，README 上亮起绿色的 passing。', '再加上手动按钮和徽章，read me 上亮起绿色的通过。'),
    ('G09_05', '以后谁推送了坏页面，红叉马上提醒，同学还没看到就修好了。', None),
    ('D11', '白饭页有自己的检查机器人了！', None),
    # ---- teaser 预告 + 三连 ----
    ('G10_01', '下集预告：提交历史乱成一团？用 git rebase 把它整理干净！', '下集预告！提交历史乱成一团？用变基命令，把它整理干净！'),
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
