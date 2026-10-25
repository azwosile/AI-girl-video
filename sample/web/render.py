"""样片导出：python render.py [--sheet] [--fps 30] [--out out.mp4] [--channel chrome]
- 起本地 http 服务 → Playwright 打开 index.html → 逐帧 renderAt(t) → canvas JPEG → ffmpeg 管道编码
- --sheet：只截若干时间点拼成联系表，用于快速检查
"""
import argparse, base64, functools, http.server, json, os, shutil, subprocess, sys, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
ap = argparse.ArgumentParser()
ap.add_argument('--fps', type=int, default=30)
ap.add_argument('--out', default=str(HERE / 'out' / 'video.mp4'))
ap.add_argument('--channel', default=None)  # 主机上用 chrome
ap.add_argument('--sheet', action='store_true')
ap.add_argument('--times', default='')
ap.add_argument('--ffmpeg', default=shutil.which('ffmpeg') or 'ffmpeg')
ap.add_argument('--start', type=float, default=0)
ap.add_argument('--end', type=float, default=-1)
a = ap.parse_args()

dur_file = HERE / 'durations.json'
DUR = json.loads(dur_file.read_text(encoding='utf-8')) if dur_file.exists() else {}

handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(HERE))
handler.log_message = lambda *x: None
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{srv.server_address[1]}/index.html'

with sync_playwright() as p:
    br = p.chromium.launch(channel=a.channel, args=['--force-device-scale-factor=1', '--disable-gpu-vsync'])
    pg = br.new_page(viewport={'width': 1920, 'height': 1080})
    pg.add_init_script(f'window.__EXPORT__=true; window.DUR={json.dumps(DUR)};')
    pg.goto(url); pg.evaluate('window.ready')
    tl = pg.evaluate('window.TIMELINE')
    (HERE / 'out').mkdir(exist_ok=True)
    (HERE / 'out' / 'timeline.json').write_text(json.dumps(tl, ensure_ascii=False, indent=1), encoding='utf-8')
    total = tl['total']
    print('total', round(total, 2), 's')
    grab = "t => { window.renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93); }"
    if a.sheet:
        times = [float(x) for x in a.times.split(',')] if a.times else [s['vo'] + 0.6 * s['dur'] for s in tl['seq']]
        from PIL import Image
        import io
        ims = [Image.open(io.BytesIO(base64.b64decode(pg.evaluate(grab, t).split(',')[1]))).resize((640, 360)) for t in times]
        cols = 4; rows = (len(ims) + cols - 1) // cols
        sheet = Image.new('RGB', (640 * cols, 360 * rows), 'black')
        for i, im in enumerate(ims): sheet.paste(im, ((i % cols) * 640, (i // cols) * 360))
        sheet.save(HERE / 'out' / 'sheet.jpg', quality=85); print('sheet', times)
    else:
        end = total if a.end < 0 else a.end
        n0, n1 = int(a.start * a.fps), int(end * a.fps)
        ff = subprocess.Popen([a.ffmpeg, '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', str(a.fps), '-c:v', 'mjpeg', '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a.out], stdin=subprocess.PIPE)
        for i in range(n0, n1):
            ff.stdin.write(base64.b64decode(pg.evaluate(grab, i / a.fps).split(',')[1]))
            if i % 150 == 0: print('frame', i, '/', n1, flush=True)
        ff.stdin.close(); ff.wait(); print('done', a.out)
    br.close()
srv.shutdown()
