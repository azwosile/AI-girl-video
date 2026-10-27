# -*- coding: utf-8 -*-
"""第10集台词唯一来源：同时生成 script.json（朗读稿，送 TTS）和 subtitles.json（字幕稿，贴进 engine.js 的 TEXT）。
改台词只改这里，然后运行：python ep10/_gen_script.py
每行：(ID, 字幕稿, 朗读稿或 None)。朗读稿为 None 时与字幕稿相同。

ID 首字母 = 说话人：
  G GitHub娘（讲师）  D 大肥鱼 / DeepSeek（组长）
  Q 千问  C Claude  M Gemini  X Grok  B 豆包  K Kimi   ← AI 分工小队
朗读稿规则（GPT-SoVITS）：行(háng)→航；Gemini→杰米奈；Claude→克劳德；push→推送；main→主分支；PR→P R。
第10集补充：Fork→复刻（Fork 按钮照读）；upstream→上游；LICENSE→许可证；CONTRIBUTING→贡献指南；
good first issue→新手友好标签；#42→四十二号；403→四零三；origin 照读。字幕保留英文原文和代码。
"""
import json, re
from pathlib import Path

SPEAKERS = {'G': 'GitHub娘', 'D': '大肥鱼', 'Q': '千问', 'C': 'Claude', 'M': 'Gemini',
            'X': 'Grok', 'B': '豆包', 'K': 'Kimi'}

LINES = [
    # ---- cold 冷开场：想修错别字，没权限 ----
    ('D01', '我天天用的开源项目「电饭煲计时器」，README 里有个错别字！想帮它改……可我没有写权限！', None),
    # ---- why 引入 + title ----
    ('G01_01', '没权限也能贡献！开源项目谁都能看：复刻一份到自己名下，改好了，再发 PR 请维护者合并。', '没权限也能贡献！开源项目谁都能看：复刻一份到自己名下，改好了，再发 P R，请维护者合并。'),
    ('G01_02', '就像去大饭店帮厨：先读后厨规矩，抄一份菜谱回家改，改好了，端回去请主厨尝。', None),
    ('G01_03', '欢迎来到 AI娘 Git 课，第十集，参与开源！', '欢迎来到，AI 娘，Git 课！第十集，参与开源！'),
    # ---- rules 读规矩（Claude：慢着，先看规矩）----
    ('C01', '慢着。动手之前，先看规矩。', None),
    ('D02', '开源项目还有规矩？', None),
    ('G02_01', '先看 LICENSE 许可证：它写明别人能怎么用这份代码。MIT 这类宽松许可，保留版权声明，就能随便用、随便改。', '先看许可证：它写明别人能怎么用这份代码。像 MIT 这类宽松许可，保留版权声明，就能随便用、随便改。'),
    ('G02_02', '注意：没有许可证不等于随便用。默认版权归作者，别人不能随意复制、发布。', None),
    ('G02_03', '再看 CONTRIBUTING 贡献指南：分支怎么起名、提交怎么写、要不要先开 issue，都写在里面。', '再看贡献指南：分支怎么起名、提交怎么写、要不要先开 issue，都写在里面。'),
    ('G02_04', '还有 CODE_OF_CONDUCT 行为准则：讨论时友善待人。这几份文件，仓库首页 README 旁边的标签页里都有。', '还有行为准则：讨论时友善待人。这几份文件，仓库首页，README 旁边的标签页里都有。'),
    ('C02', '先读规矩再动手。合规，批准。', None),
    # ---- issue 认领（Kimi：issue 全读完了）----
    ('K01', '我把这个项目四百多个 issue 全读了。带绿色 good first issue 标签的，最适合新人。', '我把这个项目四百多个 issue 全读了。带绿色新手友好标签的，最适合新人。'),
    ('D03', '那我直接开改，改完再说？', None),
    ('G03_01', '先认领：在 issue 下面留言“我想试试这个”，等维护者回复，免得两个人撞车做同一件事。', '先认领：在 issue 下面留言，我想试试这个，等维护者回复，免得两个人撞车，做同一件事。'),
    ('G03_02', '自己发现的问题，先开一个新 issue 说清楚：哪里有问题、怎么复现、打算怎么改。', None),
    ('G03_03', '在 Issues 页按 good first issue、help wanted 标签筛选，就能找到项目欢迎外人帮忙的任务。', '在 issue 页面，按新手友好、需要帮助这两个标签筛选，就能找到项目欢迎外人帮忙的任务。'),
    ('K02', '四十二号 issue：README 错别字。已认领。', None),
    # ---- fork 复刻（Grok：直接推上去）----
    ('X01', '没权限？我直接 clone 下来，改完推上去。', None),
    ('D04', '……推送被拒了！403！', '……推送被拒了！四零三！'),
    ('G04_01', '别人的仓库你推不上去。点右上角的 Fork，复刻一份到你自己名下，这份随便改。', '别人的仓库，你推不上去。点右上角的 Fork，复刻一份到你自己名下，这份随便改。'),
    ('G04_02', '把你的复刻 clone 到电脑上：这时 origin 指向你自己的复刻，推送就没问题了。', None),
    ('G04_03', '再用 git remote add upstream 加上原项目的地址，叫它“上游”。以后从上游拿更新。', '再用 remote add 命令，加上原项目的地址，叫它上游。以后，从上游拿更新。'),
    ('G04_04', '改东西照老规矩：新开一个分支，别直接在 main 上改。', '改东西照老规矩：新开一个分支，别直接在主分支上改。'),
    ('X02', '自己的地盘，随便推。这条路走得通。', None),
    # ---- sync 同步上游（千问：落后了！）----
    ('Q01', '注意！上游昨晚又合了二十个提交，你的复刻已经落后了！', None),
    ('D05', '落后了会怎样？', None),
    ('G05_01', '落后太多，PR 容易冲突。最简单的：在你的复刻页面点 Sync fork，再点 Update branch。', '落后太多，P R 容易冲突。最简单的：在你的复刻页面，点 Sync fork，再点 Update branch。'),
    ('G05_02', '命令行也行：git fetch upstream，切到 main，git merge upstream/main，再 push 回你的复刻。', '命令航也行：先 fetch 上游，切到主分支，合并上游的主分支，再推送回你的复刻。'),
    ('G05_03', '功能分支也要跟上：用第八集学的 rebase，接到最新的 main 后面。', '功能分支也要跟上：用第八集学的变基命令，接到最新的主分支后面。'),
    ('Q02', '同步完成，零落后。用户放心。', None),
    # ---- pr 跨仓库 PR（豆包：家人们！）----
    ('B01', '家人们！改完推到复刻了，PR 怎么发到人家项目里去呀？', '家人们！改完推到复刻了，P R 怎么发到人家项目里去呀？'),
    ('D06', '对呀，PR 不是在自己仓库里发的吗？', '对呀，P R 不是在自己仓库里发的吗？'),
    ('G06_01', '推送后，复刻页面会弹出 Compare & pull request；也可以点 Contribute，再点 Open pull request。', '推送以后，复刻页面会弹出 Compare and pull request；也可以点 Contribute，再点 Open pull request。'),
    ('G06_02', '看清箭头：base 是原项目的 main，head 是你复刻里的分支。', '看清箭头：base 是原项目的主分支，head 是你复刻里的分支。'),
    ('G06_03', '描述里写上 Closes #42：PR 合进 main 时，这个 issue 会自动关闭。', '描述里写上 Closes 四十二号：P R 合进主分支时，这个 issue 会自动关闭。'),
    ('G06_04', '再勾上 Allow edits by maintainers，维护者就能直接帮你改一两个小地方。', '再勾上，允许维护者编辑，维护者就能直接帮你改一两个小地方。'),
    ('B02', '跨仓库送菜，一步到位！家人们，学会了吗！', None),
    # ---- review 审查（Gemini：要关掉重开吗）----
    ('M01', '喵？维护者说要改两处……是不是得关掉 PR，重新开一个？', '喵？维护者说要改两处……是不是得关掉 P R，重新开一个？'),
    ('D07', '被要求修改，要怎么更新 PR？', '被要求修改，要怎么更新 P R？'),
    ('G07_01', '不用关！在同一个分支上继续改、提交、推送，PR 会自动更新。', '不用关！在同一个分支上继续改、提交、推送，P R 会自动更新。'),
    ('G07_02', '每条意见改完回复一句，点 Resolve conversation；全部改好，再请维护者重新审查。', '每条意见改完，回复一句，点 Resolve conversation；全部改好，再请维护者重新审查。'),
    ('G07_03', '被要求修改很正常，不是针对你。维护者多半是业余时间在帮忙，耐心一点、礼貌一点。', None),
    ('M02', '改好推上去，PR 自己就更新了！合并了喵！', '改好推上去，P R 自己就更新了！合并了喵！'),
    # ---- recap 复习 ----
    ('D08', '开源步骤好多……帮我划个重点！', None),
    ('G08_01', '读：先读 LICENSE 和 CONTRIBUTING，找 good first issue，留言认领。', '读：先读许可证和贡献指南，找新手友好的 issue，留言认领。'),
    ('G08_02', '同：Fork 一份，加上 upstream，开工前先同步上游。', '同：复刻一份，加上上游地址，开工前，先同步上游。'),
    ('G08_03', '交：从复刻发 PR 到原项目，写上 Closes，按审查意见继续推送。', '交：从复刻发 P R 到原项目，写上 Closes，按审查意见继续推送。'),
    # ---- practice 实战 ----
    ('D09', '我这就去给电饭煲计时器修错别字！', None),
    ('G09_01', '在 #42 下留言认领，然后 Fork，clone 你的复刻，加上 upstream。', '在四十二号 issue 下留言认领，然后复刻，clone 你的复刻，加上上游。'),
    ('G09_02', 'fetch upstream，从最新的 main 开分支 fix-typo，改好错别字，提交，推到 origin。', 'fetch 上游，从最新的主分支开一个修错字的分支，改好，提交，推到 origin。'),
    ('G09_03', '点 Compare & pull request：base 选原项目的 main，描述写 Closes #42，勾上允许维护者编辑。', '点 Compare and pull request：base 选原项目的主分支，描述写 Closes 四十二号，勾上允许维护者编辑。'),
    ('G09_04', '维护者请你顺手把一处标点也改掉：改好、推送，PR 自动更新，检查绿勾。', '维护者请你顺手把一处标点也改掉：改好、推送，P R 自动更新，检查绿勾。'),
    ('G09_05', '合并！issue 自动关闭，项目的贡献者列表里，多了你的头像。', None),
    ('D10', '我也是开源贡献者了！', None),
    # ---- teaser 预告 + 三连 ----
    ('G10_01', '下集预告：仓库越来越大？不小心把密码推上去了？大文件 LFS 和泄露急救，带你给仓库做一次体检！', '下集预告！仓库越来越大？不小心把密码推上去了？大文件存储和泄露急救，带你给仓库做一次体检！'),
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
