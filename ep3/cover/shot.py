# 用法：python shot.py （需 pip install playwright && playwright install chromium）
# 渲染 cover.html → 16:9 1920x1080 与 4:3 1440x1080（中心裁切 x 240–1680）
import pathlib
from playwright.sync_api import sync_playwright
from PIL import Image
here = pathlib.Path(__file__).resolve().parent
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto((here / "cover.html").as_uri()); pg.wait_for_timeout(800)
    pg.screenshot(path=str(here / "cover_16x9.png")); b.close()
im = Image.open(here / "cover_16x9.png").convert("RGB")
im.save(here / "AI娘Git课_第3集_封面_16x9.jpg", quality=93)
im.crop((240, 0, 1680, 1080)).save(here / "AI娘Git课_第3集_封面_4x3.jpg", quality=93)
