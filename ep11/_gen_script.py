# -*- coding: utf-8 -*-
"""第11集台词唯一来源：同时生成 script.json（朗读稿，送 TTS）和 subtitles.json（字幕稿，贴进 engine.js 的 TEXT）。
改台词只改这里，然后运行：python ep11/_gen_script.py
每行：(ID, 字幕稿, 朗读稿或 None)。朗读稿为 None 时与字幕稿相同。

ID 首字母 = 说话人：
  G GitHub娘（讲师）  D 大肥鱼 / DeepSeek（组长）
  Q 千问  C Claude  M Gemini  X Grok  B 豆包  K Kimi   ← AI 分工小队
朗读稿规则（GPT-SoVITS）：行(háng)→航；Gemini→杰米奈；Claude→克劳德；push→推送；main→主分支；PR→P R。
第11集补充：LFS→L F S；.gitattributes→git attributes 文件；.gitignore→git ignore；.env→点 env；
filter-repo→filter repo；MB→兆；GB→个 G；psd→P S D；行→航（含"一行""每行"）。字幕保留英文原文和代码。
"""
import json, re
from pathlib import Path

SPEAKERS = {'G': 'GitHub娘', 'D': '大肥鱼', 'Q': '千问', 'C': 'Claude', 'M': 'Gemini',
            'X': 'Grok', 'B': '豆包', 'K': 'Kimi'}

LINES = [
    # ---- cold 冷开场：推送被拒 ----
    ('D01', '推送被拒了？！说我的设计稿有 180 MB，超过了 100 MB 的上限……', '推送被拒了？说我的设计稿有一百八十兆，超过了一百兆的上限……'),
    # ---- why 引入 + title ----
    ('G01_01', '仓库用久了也要体检：有没有虚胖的大文件、乱掉的换行符，还有不小心推上去的密钥。', None),
    ('G01_02', '就像去医院体检：量体重、查指标，发现问题马上处理。今天三项全查！', None),
    ('G01_03', '欢迎来到 AI娘 Git 课，第十一集，仓库体检！', '欢迎来到，AI 娘，Git 课！第十一集，仓库体检！'),
    # ---- size 量体重（千问：克隆要十分钟）----
    ('Q01', '用户反馈：克隆白饭页仓库，要等整整十分钟！', None),
    ('D02', '一个小网页，仓库怎么这么胖？', None),
    ('G02_01', 'Git 会把每个版本都存下来。一个 180 MB 的设计稿改十次，历史里就存了十份。', 'Git 会把每个版本都存下来。一个一百八十兆的设计稿改十次，历史里就存了十份。'),
    ('G02_02', '量体重：git count-objects -vH，看 size-pack 这一项，就是仓库压缩后的大小。', '量体重：用 count objects 命令，看 size pack 这一项，就是仓库压缩后的大小。'),
    ('G02_03', 'GitHub 的规矩：单个文件超过 50 MB 会警告，超过 100 MB 直接拒收；仓库最好别超过 1 GB。', 'GitHub 的规矩：单个文件超过五十兆会警告，超过一百兆直接拒收；仓库最好别超过一个 G。'),
    ('Q02', '收到，我转告用户：仓库正在减肥！', None),
    # ---- delete 删了还被拒（Grok）----
    ('X01', '这还不简单？把设计稿删了，再提交一次。', None),
    ('D03', '……还是被拒了？！', '还是被拒了？'),
    ('G03_01', '删除只是又多了一个提交，旧提交里那份设计稿还在，推送时照样要带上。', None),
    ('G03_02', '还没推送的话：git rm --cached 把它移出仓库，再 git commit --amend 改写最后一个提交。', '还没推送的话：用 rm 命令加 cached 参数，把它移出仓库，再用 amend，改写最后一个提交。'),
    ('G03_03', '早就推送过的，就得改写历史：用第八集的交互式变基，或者后面要讲的 filter-repo。', '早就推送过的，就得改写历史：用第八集的交互式变基，或者后面要讲的 filter repo。'),
    ('X02', '原来历史也得清。这下真懂了。', None),
    # ---- lfs 大文件（豆包）----
    ('B01', '家人们！设计稿就是这么大，那还能放进仓库吗？', None),
    ('D04', '对啊，设计稿总得有个地方放吧？', None),
    ('G04_01', '用 Git LFS，大文件专用存储。先 git lfs install，再 git lfs track "*.psd"。', '用 Git L F S，大文件专用存储。先装好 L F S，再用 track 命令，登记所有 P S D 文件。'),
    ('G04_02', 'track 会把规则写进 .gitattributes，记得把这个文件也提交上去。', 'track 会把规则写进 git attributes 文件，记得把这个文件也一起提交。'),
    ('G04_03', '之后仓库里只存一张小小的指针：文件编号和大小。真文件放在 LFS 存储里，用到才下载。', '之后仓库里只存一张小小的指针：文件编号和大小。真文件放在 L F S 存储里，用到才下载。'),
    ('G04_04', '已经在历史里的，用 git lfs migrate import 一次性搬过去。免费额度：存储 10 GB，每月流量 10 GB。', '已经在历史里的，用 migrate 命令，一次性搬过去。免费额度是：存储十个 G，每月流量十个 G。'),
    ('G04_05', '注意：Pages 网站读不到 LFS 文件，网页上要用的图片，别放进 LFS。', '注意：Pages 网站读不到 L F S 文件，网页上要用的图片，别放进 L F S。'),
    ('B02', '指针小小一条，仓库轻飘飘！', None),
    # ---- eol 换行符（Gemini：整个文件全红）----
    ('M01', '喵？我只是打开保存了一下，怎么整个文件都变红了？', None),
    ('D05', '一行没改，全都算改动？', '一航没改，全都算改动？'),
    ('G05_01', '换行符的锅：Windows 每行结尾是 CRLF，Mac 和 Linux 是 LF。编辑器一转换，每一行都变了。', '换行符的锅：Windows 每航结尾是两个字符，Mac 和 Linux 只有一个。编辑器一转换，每一航都变了。'),
    ('G05_02', '在 .gitattributes 里写上 * text=auto：文本文件统一换行，进仓库时自动整理好。', '在 git attributes 文件里，写上 text 等于 auto：文本文件统一换行，进仓库时自动整理好。'),
    ('G05_03', '脚本单独指定 eol=lf，图片标成 binary 别碰。加完规则，用 git add --renormalize . 整理一遍。', '脚本单独指定用 LF，图片标成二进制，别碰。加完规则，用 renormalize 参数，把仓库整理一遍。'),
    ('M02', '这回只红了我改的那一行喵！', '这回只红了我改的那一航喵！'),
    # ---- leak 密钥泄露（Claude）----
    ('C01', '安全审查：config.js 里写着支付接口的密钥，三个月前就推上去了。', '安全审查：配置文件里写着支付接口的密钥，三个月前就推上去了。'),
    ('D06', '那我赶紧删掉那一行！', '那我赶紧删掉那一航！'),
    ('G06_01', '推上去的密钥，就当它已经泄露：公开仓库很快就会被自动扫描程序翻到。', None),
    ('G06_02', '第一步，马上去服务后台作废旧密钥、换一把新的。旧的作废了，就算被翻到也没用。', None),
    ('G06_03', '新密钥放进 .env，代码从环境变量里读；.env 写进 .gitignore，已经被跟踪的用 git rm --cached 移出去。', '新密钥放进点 env 文件，代码从环境变量里读；再把它写进 git ignore；已经被跟踪的，用 rm 命令加 cached 参数，移出仓库。'),
    ('C02', '先换钥匙，再谈打扫。批准。', None),
    # ---- history 清历史（Kimi）----
    ('K01', '我把历史全翻了一遍：三个月前那个提交里，旧密钥还在。', None),
    ('D07', '钥匙都换了，还要清吗？', None),
    ('G07_01', '旧密钥作废后，很多时候这就够了。要彻底清掉，就用 git filter-repo。', '旧密钥作废后，很多时候这就够了。要彻底清掉，就用 filter repo 工具。'),
    ('G07_02', '加上 --sensitive-data-removal：用 --invert-paths --path 删掉整个文件，或者 --replace-text 只替换密钥。', '加上清除敏感数据的参数：可以把整个文件从历史里删掉，也可以只把密钥替换掉。'),
    ('G07_03', '然后 git push --force --mirror 覆盖远程。所有人重新克隆，旧分支用变基接上，千万别合并，不然又带回来了。', '然后强制推送，覆盖远程。所有人重新克隆，旧分支用变基接上，千万别合并，不然又带回来了。'),
    ('G07_04', '旧 PR 里的缓存，要联系 GitHub Support 清理。以后还有推送保护：往公开仓库推密钥，会被直接拦下。', '旧 P R 里的缓存，要联系 GitHub 客服清理。以后还有推送保护：往公开仓库推密钥，会被直接拦下。'),
    ('K02', '日记里那一页，撕干净了。', None),
    # ---- recap 复习 ----
    ('D08', '体检项目好多……帮我划个重点！', '体检项目好多，帮我划个重点！'),
    ('G08_01', '瘦：大文件交给 Git LFS，已经进历史的用 migrate 搬走；成品下载包放 Release。', '瘦：大文件交给 L F S，已经进历史的，用 migrate 搬走；成品下载包放 Release。'),
    ('G08_02', '齐：.gitattributes 写上 text=auto，换行符统一，改动只算真改的那几行。', '齐：git attributes 文件写上 text 等于 auto，换行符统一，改动只算真改的那几航。'),
    ('G08_03', '救：密钥推上去先作废换新，再用 filter-repo 清历史、强制推送，所有人重新克隆。', '救：密钥推上去，先作废换新，再用 filter repo 清历史、强制推送，所有人重新克隆。'),
    # ---- practice 实战：白饭页全面体检 ----
    ('D09', '我这就给白饭页做一次全面体检！', None),
    ('G09_01', '先量体重：count-objects 一看，2.1 GB，元凶是设计稿文件夹。', '先量体重：count objects 一看，二点一个 G，元凶是设计稿文件夹。'),
    ('G09_02', 'git lfs track "*.psd"，提交 .gitattributes；再用 migrate import 把历史里的设计稿搬进 LFS。', '用 track 登记 P S D，提交 git attributes 文件；再用 migrate，把历史里的设计稿搬进 L F S。'),
    ('G09_03', '加上 * text=auto，renormalize 整理一遍：换行符的假改动全没了。', '再加上 text 等于 auto，整理一遍：换行符的假改动，全没了。'),
    ('G09_04', '旧密钥作废换新，新密钥放进 .env；filter-repo 用 --replace-text 把旧密钥从历史里抹掉，强制推送。', '旧密钥作废换新，新密钥放进点 env 文件；再用 filter repo，把旧密钥从历史里抹掉，强制推送。'),
    ('G09_05', '再量一次：只剩 12 MB，克隆三秒完成，体检报告全绿！', '再量一次：只剩十二兆，克隆三秒完成，体检报告全绿！'),
    ('D10', '仓库瘦身成功！体检全部通过！', None),
    # ---- teaser 预告 ----
    ('G10_01', '下集预告：毕业篇！分支保护、打标签发版本、团队协作流程，把十二集学的串成一条线！', None),
    ('G10_02', '喜欢的话，一键三连！我们下集毕业典礼见！', None),
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
