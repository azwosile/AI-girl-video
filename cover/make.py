# -*- coding: utf-8 -*-
"""B站封面生成器（第1–12集 + 番外1–6，16:9 + 4:3 两种版式）。

用法（项目根目录或 cover/ 目录都行）：
    python cover/make.py            # 全部集数
    python cover/make.py 3          # 只出第3集
依赖：pip install playwright pillow && python -m playwright install chromium

· 立绘直接引用各集 epN/web/sprites/，背景图在 cover/bg/（AI 生成，无人物无文字）。
· 版式写在下面的 EPISODES 里：每集分 '169'（1920×1080）和 '43'（1440×1080）两套坐标，
  不是简单裁切，所以两种比例都能把画面排满。
· 输出：cover/export/AI娘Git课_第N集_封面_16x9.jpg / _4x3.jpg（中间 html 在 cover/html/）。
· 右下角会被B站时长角标挡住，不放关键内容。
"""
import sys, asyncio
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
FONT = '../../ep3/web/fonts/SmileySans-Oblique.ttf.woff2'   # 相对 cover/html/

CSS = r'''
@font-face{font-family:"Smiley";src:url("%(font)s") format("woff2");}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:%(W)dpx;height:1080px;overflow:hidden;background:#000}
#c{position:relative;width:%(W)dpx;height:1080px;overflow:hidden;font-family:"Smiley","Noto Sans CJK SC",sans-serif}
#bg{position:absolute;inset:-20px;background:url("%(bg)s") center/cover;filter:saturate(1.18) brightness(1.02) blur(1.2px)}
#shade{position:absolute;inset:0;background:
  linear-gradient(100deg,%(shade)s 0%%,%(shade_mid)s 34%%,rgba(0,0,0,0) 62%%),
  linear-gradient(0deg,rgba(10,4,30,.45) 0%%,rgba(10,4,30,0) 30%%)}
#dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.16) 2.2px,transparent 2.6px);background-size:26px 26px;
  -webkit-mask-image:linear-gradient(100deg,#000 0%%,rgba(0,0,0,0) 45%%)}
#lines{position:absolute;inset:0;background:repeating-conic-gradient(from 0deg at %(burst)s,rgba(255,255,255,.10) 0deg 3deg,rgba(255,255,255,0) 3deg 11deg);
  -webkit-mask-image:radial-gradient(circle at %(burst)s,rgba(0,0,0,0) 22%%,#000 70%%)}
.spr{position:absolute;filter:drop-shadow(0 12px 20px rgba(10,4,40,.6))}
/* 系列 logo */
.logo{position:absolute;display:flex;align-items:center;gap:0;transform:rotate(-3deg);transform-origin:left top;
  filter:drop-shadow(0 10px 0 rgba(10,4,40,.85))}
.logo .plate{display:flex;align-items:center;gap:16px;background:#0d1117;border:7px solid #fff;border-right:none;
  border-radius:26px 0 0 26px;padding:12px 26px 8px 22px;height:%(logo_h)dpx}
.logo .plate svg{height:%(icon)dpx;width:%(icon)dpx}
.logo .txt{font-size:%(logo_fs)dpx;color:#fff;white-space:nowrap;letter-spacing:1px;line-height:1}
.logo .txt em{font-style:normal;color:#ffd84a}
.logo .ep{background:linear-gradient(180deg,#ff5d9e,#ff2f6d);border:7px solid #fff;border-radius:0 26px 26px 0;height:%(logo_h)dpx;
  display:flex;align-items:center;padding:8px 26px 2px;font-size:%(ep_fs)dpx;color:#fff;white-space:nowrap;line-height:1;
  -webkit-text-stroke:3px #7a0030;paint-order:stroke fill}
/* 大标题 */
.title{position:absolute;transform:rotate(-4deg);transform-origin:left top}
.t1,.t2{display:block;line-height:1.02;letter-spacing:2px;white-space:nowrap}
.t1{color:#ffe14d;-webkit-text-stroke:24px %(ink)s;paint-order:stroke fill;text-shadow:0 14px 0 %(ink)s,0 22px 30px rgba(0,0,0,.45)}
.t2{color:#fff;-webkit-text-stroke:22px %(ink)s;paint-order:stroke fill;text-shadow:0 12px 0 %(ink)s,0 20px 28px rgba(0,0,0,.45);margin-top:6px}
.t1 b,.t2 b{color:#7ef0ff}
.chips{position:absolute;display:flex;gap:10px;transform:rotate(-3deg);transform-origin:left top}
.chip{color:#fff;background:#0d1117;border:5px solid #fff;border-radius:16px;padding:6px 18px 3px;white-space:nowrap;box-shadow:0 6px 0 rgba(0,0,0,.45)}
.arrow{color:#fff;align-self:center;-webkit-text-stroke:5px #0d1117;paint-order:stroke fill}
.stamp{position:absolute;color:#ff3d5a;border:8px solid #ff3d5a;border-radius:14px;padding:6px 22px 2px;background:rgba(255,255,255,.95);
  white-space:nowrap;box-shadow:0 7px 0 rgba(20,6,50,.6);line-height:1.1}
.bubble{position:absolute;background:#fff;color:#1d1040;padding:14px 26px 10px;border-radius:28px;border:6px solid #1d1040;white-space:nowrap;box-shadow:0 7px 0 #1d1040}
.bubble:after{content:"";position:absolute;bottom:-34px;border:16px solid transparent;border-top:24px solid #1d1040}
.bubble.r:after{right:50px}.bubble.l:after{left:50px}
.name{position:absolute;color:#fff;padding:2px 16px 0;border-radius:14px;border:4px solid #fff;white-space:nowrap;transform:rotate(-3deg);box-shadow:0 5px 0 rgba(0,0,0,.4)}
'''

GIT_ICON = ('<svg viewBox="0 0 92 92"><path fill="#F05033" d="M90.2 41.9 50.1 1.8a5.9 5.9 0 0 0-8.4 0l-8.3 8.3 10.6 10.6a7 7 0 0 1 8.9 '
            '8.9l10.2 10.2a7 7 0 1 1-4.2 4l-9.5-9.5v25a7 7 0 1 1-5.8-.2V33.9a7 7 0 0 1-3.8-9.2L29.3 14.2 1.8 41.7a5.9 5.9 0 0 0 0 8.4l40.1 '
            '40.1a5.9 5.9 0 0 0 8.4 0l39.9-39.9a5.9 5.9 0 0 0 0-8.4"/></svg>')


def spr(path, x, h, bottom=0, z=None, flip=False):
    return dict(k='spr', path=path, x=x, h=h, bottom=bottom, z=z, flip=flip)


E1 = '../../ep1/web/sprites/'; E2 = '../../ep2/web/sprites/'; E3 = '../../ep3/web/sprites/'; E4 = '../../ep4/web/sprites/'; E5 = '../../ep5/web/sprites/'; SP1 = '../../sp1/web/sprites/'; E6 = '../../ep6/web/sprites/'; E7 = '../../ep7/web/sprites/'; E8 = '../../ep8/web/sprites/'; E9 = '../../ep9/web/sprites/'; E10 = '../../ep10/web/sprites/'; E11 = '../../ep11/web/sprites/'; E12 = '../../ep12/web/sprites/'

EPISODES = {
  1: dict(bg='bg_ep1.jpg', ink='#2b1150', shade='rgba(40,12,80,.80)', shade_mid='rgba(40,12,80,.40)', burst='70% 55%',
    t1='Git 就是', t2='游戏<b>存档</b>！',
    chips=['存档', '读档', '平行世界'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 196, 176),
        chips=(70, 600, 52),
        items=[spr(E1+'d_cry.webp', 880, 820, -150), spr(E1+'g_point.webp', 1290, 1180, -230, flip=True)],
        extra='<div class="stamp" style="left:50px;top:720px;font-size:50px;transform:rotate(-9deg)"><s>毕业论文_最终版.docx</s></div><div class="stamp" style="left:140px;top:832px;font-size:50px;transform:rotate(7deg)"><s>最终版(2).docx</s></div><div class="stamp" style="left:70px;top:944px;font-size:50px;transform:rotate(-5deg)"><s>最终版(2)(真·最终).docx</s></div>'
              '<div class="bubble r" style="left:560px;top:700px;font-size:50px">文件全乱了！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 180, 160),
        chips=(54, 560, 46),
        items=[spr(E1+'d_cry.webp', 560, 760, -150), spr(E1+'g_point.webp', 900, 1100, -230, flip=True)],
        extra='<div class="stamp" style="left:30px;top:730px;font-size:44px;transform:rotate(-9deg)"><s>毕业论文_最终版.docx</s></div><div class="stamp" style="left:120px;top:838px;font-size:44px;transform:rotate(7deg)"><s>最终版(2).docx</s></div><div class="stamp" style="left:50px;top:946px;font-size:44px;transform:rotate(-5deg)"><s>最终版(2)(真·最终).docx</s></div>'
              '<div class="bubble r" style="left:300px;top:680px;font-size:44px">文件全乱了！</div>'),
    }),
  2: dict(bg='bg_ep2.jpg', ink='#0d2a5c', shade='rgba(8,30,80,.82)', shade_mid='rgba(8,30,80,.42)', burst='62% 50%',
    t1='电脑坏了？', t2='存档在<b>云</b>上！',
    chips=['remote', 'push', 'clone', 'pull'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 190, 176),
        chips=(70, 610, 50),
        items=[spr(E2+'d_laptop.webp', 860, 900, -170), spr(E2+'g_proud.webp', 1300, 1180, -230)],
        extra='<div class="stamp" style="left:1080px;top:150px;font-size:54px;transform:rotate(10deg)">! [rejected]</div>'
              '<div class="bubble r" style="left:110px;top:800px;font-size:50px">换电脑也能接着写！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 172, 160),
        chips=(54, 560, 44),
        items=[spr(E2+'d_laptop.webp', 540, 860, -170), spr(E2+'g_proud.webp', 900, 1120, -230)],
        extra='<div class="stamp" style="left:900px;top:120px;font-size:46px;transform:rotate(10deg)">! [rejected]</div>'
              '<div class="bubble r" style="left:60px;top:820px;font-size:44px">换电脑也能接着写！</div>'),
    }),
  3: dict(bg='bg_ep3.jpg', ink='#2a1260', shade='rgba(30,10,70,.80)', shade_mid='rgba(30,10,70,.38)', burst='72% 50%',
    t1='7 个 AI 娘', t2='联机写<b>代码</b>！',
    chips=['Issue', '分支', 'PR', '审查', '合并'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 210, 176, 136),
        chips=(1020, 44, 38),
        items=[spr(E3+'q_tea.webp', 250, 660, 20), spr(E3+'k_read.webp', 570, 640, 30),
               spr(E3+'m_cheeky.webp', 745, 760, -260), spr(E3+'c_cool.webp', 215, 780, -280),
               spr(E3+'b_base.webp', 20, 720, -220), spr(E3+'x_force.webp', 440, 700, -250),
               spr(E3+'g_present.webp', 1560, 900, -130), spr(E3+'d_leader.webp', 1150, 1040, -150)],
        extra='<div class="stamp" style="left:720px;top:900px;font-size:60px;transform:rotate(10deg)">CONFLICT!</div>'
              '<div class="name" style="left:1270px;top:252px;font-size:40px;background:#3d7bff">组长</div>'
              '<div class="stamp" style="left:40px;top:930px;font-size:44px;transform:rotate(-7deg)">⚠ 密码.env 已上传</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 164, 128),
        chips=None,
        items=[spr(E3+'q_tea.webp', 185, 640, 20), spr(E3+'k_read.webp', 480, 620, 30),
               spr(E3+'m_cheeky.webp', 640, 720, -250), spr(E3+'c_cool.webp', 160, 740, -270),
               spr(E3+'b_base.webp', -10, 690, -220), spr(E3+'x_force.webp', 360, 660, -240),
               spr(E3+'d_leader.webp', 930, 1000, -150)],
        extra='<div class="stamp" style="left:610px;top:910px;font-size:54px;transform:rotate(10deg)">CONFLICT!</div>'
              '<div class="name" style="left:1040px;top:268px;font-size:38px;background:#3d7bff">组长</div>'
              '<div class="stamp" style="left:20px;top:940px;font-size:40px;transform:rotate(-7deg)">⚠ 密码.env 已上传</div>'),
    }),
  4: dict(bg='bg_ep4.jpg', ink='#3a0f45', shade='rgba(45,10,60,.82)', shade_mid='rgba(45,10,60,.40)', burst='70% 50%',
    t1='手滑删了提交？', t2='Git 有<b>后悔药</b>！',
    chips=['amend', 'stash', 'reset', 'revert', 'reflog'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 150, 176),
        chips=(70, 610, 46),
        items=[spr(E4+'x_panic.webp', 540, 660, -330), spr(E4+'d_pill.webp', 900, 920, -170), spr(E4+'g_pill.webp', 1340, 1160, -190)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:54px;transform:rotate(-7deg)">⚠ reset --hard</div>'
              '<div class="stamp" style="left:90px;top:900px;font-size:46px;transform:rotate(5deg);color:#8a3dff;border-color:#8a3dff">reflog 全找回 ✓</div>'
              '<div class="bubble l" style="left:1010px;top:150px;font-size:48px">还能找回来？！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 128, 160),
        chips=None,
        items=[spr(E4+'x_panic.webp', 170, 620, -330), spr(E4+'d_pill.webp', 560, 860, -170), spr(E4+'g_pill.webp', 930, 1100, -190)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:52px;transform:rotate(-7deg)">⚠ reset --hard</div>'
              '<div class="stamp" style="left:70px;top:780px;font-size:46px;transform:rotate(5deg);color:#8a3dff;border-color:#8a3dff">reflog 全找回 ✓</div>'
              '<div class="bubble r" style="left:1010px;top:560px;font-size:42px;transform:rotate(4deg)">都能找回来！</div>'),
    }),
  5: dict(bg='bg_ep5.jpg', ink='#2e0f5c', shade='rgba(34,10,70,.84)', shade_mid='rgba(34,10,70,.42)', burst='72% 45%',
    t1='改了几十版？', t2='打上<b>版本号</b>！',
    chips=['git tag', 'push --tags', 'v1.0.1', 'Release'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 150, 176),
        chips=(70, 610, 44),
        items=[spr(E5+'b_proud.webp', 640, 700, -300), spr(E5+'d_party.webp', 930, 900, -150), spr(E5+'g_tag.webp', 1270, 1120, -200)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:54px;transform:rotate(-7deg)">改个错字就 v2.0.0 ✗</div>'
              '<div class="stamp" style="left:90px;top:900px;font-size:48px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">v1.0.1 才对 ✓</div>'
              '<div class="bubble l" style="left:1010px;top:120px;font-size:48px">哪一版能用？！</div>'
              '<div style="position:absolute;left:1560px;top:556px;width:200px;text-align:center;font:bold 64px Consolas,monospace;color:#5a3a00;transform:rotate(-2deg);text-shadow:0 2px 0 rgba(255,255,255,.6)">v1.0</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 128, 160),
        chips=None,
        items=[spr(E5+'b_proud.webp', 250, 640, -300), spr(E5+'d_party.webp', 520, 860, -150), spr(E5+'g_tag.webp', 860, 1080, -200)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:50px;transform:rotate(-7deg)">改个错字就 v2.0.0 ✗</div>'
              '<div class="stamp" style="left:70px;top:780px;font-size:46px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">v1.0.1 才对 ✓</div>'
              '<div class="bubble l" style="left:960px;top:110px;font-size:44px;transform:rotate(3deg)">正式发布啦！</div>'
              '<div style="position:absolute;left:1150px;top:588px;width:190px;text-align:center;font:bold 60px Consolas,monospace;color:#5a3a00;transform:rotate(-2deg);text-shadow:0 2px 0 rgba(255,255,255,.6)">v1.0</div>'),
    }),
  6: dict(bg='bg_ep6.jpg', ink='#0b3d1f', shade='rgba(8,48,24,.84)', shade_mid='rgba(8,48,24,.40)', burst='72% 45%',
    t1='全是代码？', t2='变成<b>真网站</b>！',
    chips=['Pages', 'index.html', 'push', '上线'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 150, 176),
        chips=(70, 610, 44),
        items=[spr(E6+'d_phone.webp', 820, 880, -150), spr(E6+'g_web.webp', 1330, 1180, -230)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:54px;transform:rotate(-7deg)">打开一屏代码 ✗</div>'
              '<div class="stamp" style="left:90px;top:900px;font-size:44px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">dafeiyu.github.io ✓</div>'
              '<div class="bubble l" style="left:1000px;top:110px;font-size:48px">同学都能点开！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 128, 160),
        chips=None,
        items=[spr(E6+'d_phone.webp', 470, 840, -150), spr(E6+'g_web.webp', 900, 1120, -230)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:50px;transform:rotate(-7deg)">打开一屏代码 ✗</div>'
              '<div class="stamp" style="left:70px;top:780px;font-size:42px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">dafeiyu.github.io ✓</div>'
              '<div class="bubble l" style="left:880px;top:110px;font-size:44px;transform:rotate(3deg)">同学都能点开！</div>'),
    }),
  7: dict(bg='bg_ep7.jpg', ink='#0b2a5c', shade='rgba(8,28,70,.84)', shade_mid='rgba(8,28,70,.40)', burst='70% 50%',
    t1='推送就翻车？', t2='请个<b>检查机器人</b>！',
    chips=['check.yml', 'push', '❌→✅', '徽章'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 150, 150),
        chips=(70, 610, 44),
        items=[spr(E7+'d_robot.webp', 800, 860, -150), spr(E7+'g_check.webp', 1330, 1180, -230)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:54px;transform:rotate(-7deg)">&lt;div&gt; 没关 ✗</div>'
              '<div class="stamp" style="left:90px;top:900px;font-size:44px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">check passing ✓</div>'
              '<div class="bubble l" style="left:1000px;top:110px;font-size:48px">每次推送自动查！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 128, 116),
        chips=None,
        items=[spr(E7+'d_robot.webp', 460, 820, -150), spr(E7+'g_check.webp', 900, 1120, -230)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:50px;transform:rotate(-7deg)">&lt;div&gt; 没关 ✗</div>'
              '<div class="stamp" style="left:70px;top:780px;font-size:42px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">check passing ✓</div>'
              '<div class="bubble l" style="left:880px;top:110px;font-size:44px;transform:rotate(3deg)">每次推送自动查！</div>'),
    }),
  8: dict(bg='bg_ep8.jpg', ink='#5c2a0b', shade='rgba(70,30,8,.84)', shade_mid='rgba(70,30,8,.40)', burst='70% 50%',
    t1='历史乱成麻？', t2='剪成<b>一条线</b>！',
    chips=['rebase', 'squash', 'reword', 'reflog'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 150, 150),
        chips=(70, 610, 44),
        items=[spr(E8+'d_film.webp', 800, 860, -150), spr(E8+'g_scissors.webp', 1330, 1180, -230)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:50px;transform:rotate(-7deg)">Merge branch ×3 ✗</div>'
              '<div class="stamp" style="left:90px;top:900px;font-size:44px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">git log 一条线 ✓</div>'
              '<div class="bubble l" style="left:1000px;top:110px;font-size:48px">提交历史剪干净！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 128, 116),
        chips=None,
        items=[spr(E8+'d_film.webp', 460, 820, -150), spr(E8+'g_scissors.webp', 900, 1120, -230)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:46px;transform:rotate(-7deg)">Merge branch ×3 ✗</div>'
              '<div class="stamp" style="left:70px;top:780px;font-size:42px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">git log 一条线 ✓</div>'
              '<div class="bubble l" style="left:880px;top:110px;font-size:44px;transform:rotate(3deg)">提交历史剪干净！</div>'),
    }),
  9: dict(bg='bg_ep9.jpg', ink='#0b3a4a', shade='rgba(6,34,48,.86)', shade_mid='rgba(6,34,48,.42)', burst='70% 50%',
    t1='按钮没了？', t2='七次抓<b>真凶</b>！',
    chips=['log -S', 'blame', 'bisect', 'revert'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 150, 150),
        chips=(70, 610, 44),
        items=[spr(E9+'d_detective.webp', 800, 860, -150), spr(E9+'g_detective.webp', 1330, 1180, -230)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:50px;transform:rotate(-7deg)">「点菜」按钮 ✗</div>'
              '<div class="stamp" style="left:90px;top:900px;font-size:44px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">first bad commit ✓</div>'
              '<div class="bubble l" style="left:1000px;top:110px;font-size:48px">到底是谁改坏的？</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 128, 116),
        chips=None,
        items=[spr(E9+'d_detective.webp', 460, 820, -150), spr(E9+'g_detective.webp', 900, 1120, -230)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:46px;transform:rotate(-7deg)">「点菜」按钮 ✗</div>'
              '<div class="stamp" style="left:70px;top:780px;font-size:40px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">first bad commit ✓</div>'
              '<div class="bubble l" style="left:880px;top:110px;font-size:44px;transform:rotate(3deg)">到底是谁改坏的？</div>'),
    }),
  10: dict(bg='bg_ep10.jpg', ink='#0b4a2a', shade='rgba(6,48,28,.86)', shade_mid='rgba(6,48,28,.42)', burst='70% 50%',
    t1='没权限也能改？', t2='第一个<b>开源 PR</b>！',
    chips=['Fork', 'upstream', 'issue', 'PR'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 136, 136),
        chips=(70, 610, 44),
        items=[spr(E10+'d_medal.webp', 760, 860, -150), spr(E10+'g_fork.webp', 1130, 1110, -190)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:50px;transform:rotate(-7deg)">push 403 ✗</div>'
              '<div class="stamp" style="left:90px;top:900px;font-size:44px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">Merged · Closes #42 ✓</div>'
              '<div class="bubble l" style="left:940px;top:100px;font-size:48px">我也是贡献者了！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 112, 104),
        chips=None,
        items=[spr(E10+'d_medal.webp', 330, 820, -150), spr(E10+'g_fork.webp', 715, 1010, -170)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:46px;transform:rotate(-7deg)">push 403 ✗</div>'
              '<div class="stamp" style="left:70px;top:780px;font-size:38px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">Merged · Closes #42 ✓</div>'
              '<div class="bubble l" style="left:930px;top:160px;font-size:44px;transform:rotate(3deg)">我也是贡献者了！</div>'),
    }),
  11: dict(bg='bg_ep11.jpg', ink='#0b3d3a', shade='rgba(6,40,38,.86)', shade_mid='rgba(6,40,38,.42)', burst='70% 50%',
    t1='仓库越来越胖？', t2='给仓库<b>做体检</b>！',
    chips=['LFS', '.gitattributes', '密钥', 'filter-repo'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 136, 136),
        chips=(70, 610, 40),
        items=[spr(E11+'d_heavy.webp', 760, 820, -150), spr(E11+'g_doctor.webp', 1150, 1110, -190)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:50px;transform:rotate(-7deg)">push ✗ 180 MB</div>'
              '<div class="stamp" style="left:90px;top:900px;font-size:44px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">2.1 GB → 12 MB ✓</div>'
              '<div class="bubble l" style="left:940px;top:100px;font-size:48px">仓库瘦身成功！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 112, 104),
        chips=None,
        items=[spr(E11+'d_heavy.webp', 330, 780, -150), spr(E11+'g_doctor.webp', 735, 1010, -170)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:46px;transform:rotate(-7deg)">push ✗ 180 MB</div>'
              '<div class="stamp" style="left:70px;top:780px;font-size:38px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">2.1 GB → 12 MB ✓</div>'
              '<div class="bubble l" style="left:930px;top:160px;font-size:44px;transform:rotate(3deg)">仓库瘦身成功！</div>'),
    }),
  12: dict(bg='bg_ep12.jpg', ink='#1a2350', shade='rgba(14,18,50,.86)', shade_mid='rgba(14,18,50,.42)', burst='70% 50%',
    t1='团队怎么用 Git？', t2='<b>毕业篇</b>！',
    chips=['分支保护', 'CODEOWNERS', 'Squash', 'tag → Release'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 136, 136),
        chips=(70, 610, 40),
        items=[spr(E12+'d_grad.webp', 760, 840, -150), spr(E12+'g_grad.webp', 1150, 1110, -190)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:50px;transform:rotate(-7deg)">push main ✗ GH006</div>'
              '<div class="stamp" style="left:90px;top:900px;font-size:44px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">v2.0.0 Released ✓</div>'
              '<div class="bubble l" style="left:940px;top:100px;font-size:48px">恭喜毕业！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 112, 104),
        chips=None,
        items=[spr(E12+'d_grad.webp', 330, 800, -150), spr(E12+'g_grad.webp', 735, 1010, -170)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:46px;transform:rotate(-7deg)">push main ✗ GH006</div>'
              '<div class="stamp" style="left:70px;top:780px;font-size:38px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">v2.0.0 Released ✓</div>'
              '<div class="bubble l" style="left:930px;top:160px;font-size:44px;transform:rotate(3deg)">恭喜毕业！</div>'),
    }),
  'sp1': dict(bg='bg_sp1.jpg', label='番外', name='番外1', ink='#4a1a08', shade='rgba(60,18,8,.84)', shade_mid='rgba(60,18,8,.40)', burst='78% 55%',
    t1='手要敲断了？', t2='Git <b>小技巧</b>！',
    chips=['config', 'alias', 'diff', '.gitignore'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 150, 176),
        chips=(70, 610, 44),
        items=[spr(SP1+'d_tired.webp', 760, 820, -170), spr(SP1+'g_tools.webp', 1260, 1120, -200)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:54px;transform:rotate(-7deg)">git stauts ✗</div>'
              '<div class="stamp" style="left:90px;top:900px;font-size:50px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">git st ✓</div>'
              '<div class="bubble l" style="left:1180px;top:110px;font-size:48px">用了就回不去！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 128, 160),
        chips=None,
        items=[spr(SP1+'d_tired.webp', 380, 760, -170), spr(SP1+'g_tools.webp', 820, 1060, -200)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:50px;transform:rotate(-7deg)">git stauts ✗</div>'
              '<div class="stamp" style="left:70px;top:780px;font-size:48px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">git st ✓</div>'
              '<div class="bubble l" style="left:900px;top:110px;font-size:44px;transform:rotate(3deg)">用了就回不去！</div>'),
    }),
  'sp2': dict(bg='bg_sp2.jpg', label='番外2', name='番外2', ink='#3a2408', shade='rgba(40,24,6,.86)', shade_mid='rgba(40,24,6,.42)', burst='78% 55%',
    t1='公司号个人号分不清？', t2='<b>SSH</b> 多账号！',
    chips=['ssh-keygen', '加公钥', '~/.ssh/config', 'includeIf'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 124, 160),
        chips=(70, 610, 40),
        items=[spr('../../sp2/web/sprites/'+'d_keys.webp', 760, 820, -170), spr('../../sp2/web/sprites/'+'g_point.webp', 1260, 1120, -200)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:50px;transform:rotate(-7deg)">Permission denied ✗</div><div class="stamp" style="left:90px;top:900px;font-size:46px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">Hi dafeiyu! ✓</div><div class="bubble l" style="left:1180px;top:110px;font-size:48px">一台电脑两个号！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 104, 132),
        chips=None,
        items=[spr('../../sp2/web/sprites/'+'d_keys.webp', 380, 760, -170), spr('../../sp2/web/sprites/'+'g_point.webp', 820, 1060, -200)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:46px;transform:rotate(-7deg)">Permission denied ✗</div><div class="stamp" style="left:70px;top:780px;font-size:42px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">Hi dafeiyu! ✓</div><div class="bubble l" style="left:900px;top:110px;font-size:44px;transform:rotate(3deg)">一台电脑两个号！</div>'),
    }),
  'sp3': dict(bg='bg_sp3.jpg', label='番外3', name='番外3', ink='#0b2a4a', shade='rgba(6,26,50,.86)', shade_mid='rgba(6,26,50,.42)', burst='78% 55%',
    t1='不想敲命令？', t2='<b>图形界面</b>用 Git！',
    chips=['VS Code', '按块暂存', '合并编辑器', 'GitHub Desktop'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 150, 150),
        chips=(70, 610, 40),
        items=[spr('../../sp3/web/sprites/'+'d_curious.webp', 760, 820, -170), spr('../../sp3/web/sprites/'+'g_mouse.webp', 1260, 1120, -200)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:50px;transform:rotate(-7deg)">冲突看不懂 ✗</div><div class="stamp" style="left:90px;top:900px;font-size:46px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">点一下就解决 ✓</div><div class="bubble l" style="left:1180px;top:110px;font-size:48px">鼠标点点就行！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 128, 124),
        chips=None,
        items=[spr('../../sp3/web/sprites/'+'d_curious.webp', 380, 760, -170), spr('../../sp3/web/sprites/'+'g_mouse.webp', 820, 1060, -200)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:46px;transform:rotate(-7deg)">冲突看不懂 ✗</div><div class="stamp" style="left:70px;top:780px;font-size:42px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">点一下就解决 ✓</div><div class="bubble l" style="left:900px;top:110px;font-size:44px;transform:rotate(3deg)">鼠标点点就行！</div>'),
    }),
  'sp4': dict(bg='bg_sp4.jpg', label='番外4', name='番外4', ink='#0d1b2a', shade='rgba(6,12,24,.88)', shade_mid='rgba(6,12,24,.44)', burst='78% 55%',
    t1='网页终端来回切？', t2='GitHub <b>CLI</b>！',
    chips=['gh auth', 'gh repo', 'gh pr', 'gh issue'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 128, 170),
        chips=(70, 610, 40),
        items=[spr('../../sp4/web/sprites/'+'d_panic.webp', 760, 820, -170), spr('../../sp4/web/sprites/'+'g_term.webp', 1260, 1120, -200)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:50px;transform:rotate(-7deg)">来回切窗口 ✗</div><div class="stamp" style="left:90px;top:900px;font-size:46px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">gh pr merge ✓</div><div class="bubble l" style="left:1180px;top:110px;font-size:48px">终端里全搞定！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 106, 140),
        chips=None,
        items=[spr('../../sp4/web/sprites/'+'d_panic.webp', 380, 760, -170), spr('../../sp4/web/sprites/'+'g_term.webp', 820, 1060, -200)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:46px;transform:rotate(-7deg)">来回切窗口 ✗</div><div class="stamp" style="left:70px;top:780px;font-size:42px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">gh pr merge ✓</div><div class="bubble l" style="left:900px;top:110px;font-size:44px;transform:rotate(3deg)">终端里全搞定！</div>'),
    }),
  'sp5': dict(bg='bg_sp5.jpg', label='番外5', name='番外5', ink='#4a0b2a', shade='rgba(60,8,36,.86)', shade_mid='rgba(60,8,36,.42)', burst='78% 55%',
    t1='提交说明看不懂？', t2='<b>规范</b>与钩子！',
    chips=['feat / fix', '提交模板', 'commit-msg', 'hooksPath'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 128, 160),
        chips=(70, 610, 40),
        items=[spr('../../sp5/web/sprites/'+'d_heavy.webp', 760, 820, -170), spr('../../sp5/web/sprites/'+'g_hook.webp', 1260, 1120, -200)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:50px;transform:rotate(-7deg)">"改了点" ✗</div><div class="stamp" style="left:90px;top:900px;font-size:46px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">fix: 修复按钮错位 ✓</div><div class="bubble l" style="left:1180px;top:110px;font-size:48px">钩子来把关！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 106, 134),
        chips=None,
        items=[spr('../../sp5/web/sprites/'+'d_heavy.webp', 380, 760, -170), spr('../../sp5/web/sprites/'+'g_hook.webp', 820, 1060, -200)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:46px;transform:rotate(-7deg)">"改了点" ✗</div><div class="stamp" style="left:70px;top:780px;font-size:42px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">fix: 修复按钮错位 ✓</div><div class="bubble l" style="left:900px;top:110px;font-size:44px;transform:rotate(3deg)">钩子来把关！</div>'),
    }),
  'sp6': dict(bg='bg_sp6.jpg', label='番外6', name='番外6', ink='#1d1a5c', shade='rgba(20,16,70,.86)', shade_mid='rgba(20,16,70,.42)', burst='78% 55%',
    t1='电脑没装 Git？', t2='<b>网页里</b>写代码！',
    chips=['铅笔', '按 . 键', 'github.dev', 'Codespaces'],
    layouts={
      '169': dict(W=1920, logo=(56, 36, 1.14), title=(64, 214, 150, 150),
        chips=(70, 610, 40),
        items=[spr('../../sp6/web/sprites/'+'d_cloud.webp', 760, 820, -170), spr('../../sp6/web/sprites/'+'g_web.webp', 1260, 1120, -200)],
        extra='<div class="stamp" style="left:56px;top:770px;font-size:50px;transform:rotate(-7deg)">没装 Git ✗</div><div class="stamp" style="left:90px;top:900px;font-size:46px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">PR 照样提 ✓</div><div class="bubble l" style="left:1180px;top:110px;font-size:48px">按一下句号键！</div>'),
      '43': dict(W=1440, logo=(40, 32, 1.0), title=(48, 188, 124, 124),
        chips=None,
        items=[spr('../../sp6/web/sprites/'+'d_cloud.webp', 380, 760, -170), spr('../../sp6/web/sprites/'+'g_web.webp', 820, 1060, -200)],
        extra='<div class="stamp" style="left:40px;top:640px;font-size:46px;transform:rotate(-7deg)">没装 Git ✗</div><div class="stamp" style="left:70px;top:780px;font-size:42px;transform:rotate(5deg);color:#14a05a;border-color:#14a05a">PR 照样提 ✓</div><div class="bubble l" style="left:900px;top:110px;font-size:44px;transform:rotate(3deg)">按一下句号键！</div>'),
    }),
}


def build_html(n, key):
    ep = EPISODES[n]; L = ep['layouts'][key]; W = L['W']
    lx, ly, ls = L['logo']
    css = CSS % dict(font=FONT, W=W, bg='../bg/' + ep['bg'], shade=ep['shade'], shade_mid=ep['shade_mid'], burst=ep['burst'],
                     ink=ep['ink'], logo_h=int(104 * ls), icon=int(70 * ls), logo_fs=int(76 * ls), ep_fs=int(70 * ls))
    tx, ty, f1, f2 = L['title']
    h = [f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body><div id="c">',
         '<div id="bg"></div><div id="lines"></div><div id="shade"></div><div id="dots"></div>']
    for i, it in enumerate(L['items']):
        tf = 'transform:scaleX(-1);' if it['flip'] else ''
        h.append(f'<img class="spr" src="{it["path"]}" style="left:{it["x"]}px;height:{it["h"]}px;bottom:{it["bottom"]}px;{tf}">')
    h.append(f'<div class="logo" style="left:{lx}px;top:{ly}px"><div class="plate">{GIT_ICON}'
             f'<span class="txt">AI娘 <em>Git</em>课</span></div><div class="ep">{ep.get('label', f'第{n}集')}</div></div>')
    h.append(f'<div class="title" style="left:{tx}px;top:{ty}px"><span class="t1" style="font-size:{f1}px">{ep["t1"]}</span>'
             f'<span class="t2" style="font-size:{f2}px;margin-left:{int(f2*.3)}px">{ep["t2"]}</span></div>')
    if L.get('chips'):
        cx, cy, cf = L['chips']; parts = []
        for j, c in enumerate(ep['chips']):
            if j: parts.append(f'<span class="arrow" style="font-size:{cf}px">→</span>')
            parts.append(f'<span class="chip" style="font-size:{cf}px">{c}</span>')
        h.append(f'<div class="chips" style="left:{cx}px;top:{cy}px">{"".join(parts)}</div>')
    h.append(L.get('extra', ''))
    h.append('</div></body></html>')
    return W, '\n'.join(h)


async def render(eps):
    from playwright.async_api import async_playwright
    (HERE / 'html').mkdir(exist_ok=True); (HERE / 'export').mkdir(exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for n in eps:
            for key, tag in (('169', '16x9'), ('43', '4x3')):
                W, html = build_html(n, key)
                f = HERE / 'html' / f'ep{n}_{tag}.html'; f.write_text(html, encoding='utf-8')
                pg = await b.new_page(viewport={'width': W, 'height': 1080})
                await pg.goto(f.as_uri()); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(400)
                png = HERE / 'html' / f'ep{n}_{tag}.png'
                await pg.screenshot(path=str(png)); await pg.close()
                out = HERE / 'export' / f"AI娘Git课_{EPISODES[n].get('name', f'第{n}集')}_封面_{tag}.jpg"
                Image.open(png).convert('RGB').save(out, quality=93); png.unlink()
                print('ok', out.name)
        await b.close()


if __name__ == '__main__':
    eps = [int(a) if a.isdigit() else a for a in sys.argv[1:]] or list(EPISODES)
    asyncio.run(render(eps))
