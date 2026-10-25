# -*- coding: utf-8 -*-
"""绿幕抠像 → 去溢色 → 白描边贴纸（AI娘Git课 表情差分用）

用法（主机，用 GPT-SoVITS 自带的 Python，已含 numpy / Pillow / scipy）：
    PY=/e/AI/TTS/GPT-SoVITS-v2pro-20261006nvidia50x0/runtime/python.exe
    $PY tools/key.py 生图/g_think.png                    # → 同目录 g_think.webp
    $PY tools/key.py 生图/*.png -o ep2/web/sprites --preview
    $PY tools/key.py 生图/ -o ep2/web/sprites --height 1100 --outline 10

流程：
  1. 估计背景色（取四条边的像素中位数，不要求一定是 #00FF00）
  2. 按“偏绿程度” g - max(r, b) 生成软 alpha，去掉小碎块（scipy 可用时）
  3. 边缘收缩 choke 像素 → 半透明像素反预乘去掉背景色 → 全图去绿溢色
  4. 按欧氏距离向外扩 outline 像素做抗锯齿白描边
  5. 裁到内容边界并留边，可选缩放到固定高度，输出 webp（保留 alpha）
  6. 检查头顶是否贴着原图上边（第1集踩过的坑），贴边就给出 WARN

--preview 会额外输出 *_preview.jpg（左：深色底，右：棋盘格），方便检查绿边。
"""
import argparse, json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

try:
    from scipy import ndimage as ndi
except Exception:  # scipy 不在时退化为 PIL 形态学，结果略方
    ndi = None

EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.bmp'}


def estimate_bg(rgb):
    h, w, _ = rgb.shape
    b = max(2, min(h, w) // 100)
    edge = np.concatenate([rgb[:b].reshape(-1, 3), rgb[-b:].reshape(-1, 3),
                           rgb[:, :b].reshape(-1, 3), rgb[:, -b:].reshape(-1, 3)])
    return np.median(edge, axis=0)


def key_alpha(rgb, bg, lo, hi):
    """偏绿程度越高越透明；lo 以下完全保留，hi 以上完全透明。"""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    spill = g - np.maximum(r, b)
    bg_spill = bg[1] - max(bg[0], bg[2])
    # 把阈值按实际背景的偏绿程度缩放，背景不是纯 #00FF00 也能用
    scale = max(bg_spill, 0.25)
    a = 1 - np.clip((spill / scale - lo) / (hi - lo), 0, 1)
    # 与背景色非常接近的像素直接透明（处理 jpg 压缩噪点）
    dist = np.sqrt(((rgb - bg) ** 2).sum(-1))
    a[dist < 0.06] = 0
    return a


def remove_specks(a, min_frac):
    if ndi is None:
        return a
    m = a > 0.5
    lab, n = ndi.label(m)
    if n <= 1:
        return a
    sizes = ndi.sum(m, lab, range(1, n + 1))
    keep = np.zeros(n + 1, bool)
    keep[1:] = sizes >= sizes.max() * min_frac
    # 半透明边缘跟随它所属的主体：先把保留区域膨胀 2px 作为允许范围
    allowed = ndi.binary_dilation(keep[lab], iterations=2)
    return a * allowed


def choke(a, px):
    if px <= 0:
        return a
    if ndi is not None:
        return ndi.grey_erosion(a, size=(2 * px + 1, 2 * px + 1))
    im = Image.fromarray((a * 255).astype(np.uint8))
    for _ in range(px):
        im = im.filter(ImageFilter.MinFilter(3))
    return np.asarray(im, np.float32) / 255


def despill(rgb, a, bg, mode):
    out = rgb.copy()
    # 半透明像素：C = (C - (1-m)·BG) / m，去掉混进来的背景色。
    # m 用线性混合模型估计（前景本身不偏绿时，像素偏绿量 = (1-m)·背景偏绿量），
    # 比阈值化的 a 更准，否则浅色边缘会被多减绿色、发紫。
    spill = rgb[..., 1] - np.maximum(rgb[..., 0], rgb[..., 2])
    bg_spill = max(float(bg[1] - max(bg[0], bg[2])), 0.25)
    mix = np.clip(1 - spill / bg_spill, 0.05, 1)
    edge = (a > 0.02) & (a < 0.98)
    if edge.any():
        ae = mix[edge][:, None]
        out[edge] = np.clip((rgb[edge] - (1 - ae) * bg) / ae, 0, 1)
    if mode != 'off':
        r, g, b = out[..., 0], out[..., 1], out[..., 2]
        limit = np.maximum(r, b) if mode == 'max' else (r + b) / 2
        out[..., 1] = np.minimum(g, limit)
    return out


def outline_alpha(a, px):
    if px <= 0:
        return np.zeros_like(a)
    m = a > 0.5
    if ndi is not None:
        d = ndi.distance_transform_edt(~m)
        return np.clip(px + 0.5 - d, 0, 1).astype(np.float32)
    im = Image.fromarray((m * 255).astype(np.uint8))
    for _ in range(px):
        im = im.filter(ImageFilter.MaxFilter(3))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(0.7)), np.float32) / 255


def checker(h, w, s=24):
    y, x = np.mgrid[0:h, 0:w]
    c = ((x // s + y // s) % 2).astype(np.float32)
    return np.stack([0.75 + 0.15 * c] * 3, -1)


def process(src, dst, o):
    im = Image.open(src).convert('RGB')
    rgb = np.asarray(im, np.float32) / 255
    H, W, _ = rgb.shape
    bg = estimate_bg(rgb)
    a = key_alpha(rgb, bg, o.lo, o.hi)
    a[a < 0.03] = 0
    a = remove_specks(a, o.min_speck)
    a = choke(a, o.choke)
    col = despill(rgb, a, bg, o.despill)

    ys, xs = np.nonzero(a > 0.5)
    if len(ys) == 0:
        raise SystemExit(f'{src}: 没有抠出任何主体，检查背景色或调低 --hi')
    top, bot, left, right = ys.min(), ys.max(), xs.min(), xs.max()
    warns = []
    if top < H * o.headroom:
        warns.append(f'头顶距上边只有 {top}px（{top / H:.1%}），可能被裁到，建议重新生图并在头顶留空')
    if left <= 1 or right >= W - 2:
        warns.append('主体碰到左右边缘')

    # 先在画布四周补足描边空间，再加描边
    pad = o.outline + o.margin
    a = np.pad(a, pad); col = np.pad(col, ((pad, pad), (pad, pad), (0, 0)))
    ol = outline_alpha(a, o.outline)
    white = np.ones_like(col)
    out_a = a + ol * (1 - a)
    out_c = (col * a[..., None] + white * (ol * (1 - a))[..., None]) / np.maximum(out_a, 1e-6)[..., None]

    # 裁到内容 + margin
    ys, xs = np.nonzero(out_a > 0.01)
    y0, y1 = max(0, ys.min() - o.margin), min(out_a.shape[0], ys.max() + 1 + o.margin)
    x0, x1 = max(0, xs.min() - o.margin), min(out_a.shape[1], xs.max() + 1 + o.margin)
    out_a, out_c = out_a[y0:y1, x0:x1], out_c[y0:y1, x0:x1]

    rgba = np.dstack([out_c, out_a])
    img = Image.fromarray((np.clip(rgba, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA')
    if o.height and img.height != o.height:
        img = img.resize((round(img.width * o.height / img.height), o.height), Image.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.suffix.lower() == '.webp':
        img.save(dst, 'WEBP', quality=o.quality, alpha_quality=100, method=6)
    else:
        img.save(dst)

    if o.preview:
        arr = np.asarray(img, np.float32) / 255
        al = arr[..., 3:4]
        dark = arr[..., :3] * al + np.array([0.12, 0.1, 0.2]) * (1 - al)
        chk = arr[..., :3] * al + checker(*arr.shape[:2]) * (1 - al)
        prev = np.concatenate([dark, chk], 1)
        Image.fromarray((prev * 255).astype(np.uint8)).save(dst.with_name(dst.stem + '_preview.jpg'), quality=88)

    info = {'src': str(src), 'dst': str(dst), 'size': img.size, 'bg': [round(float(v) * 255) for v in bg],
            'headroom_px': int(top), 'warn': warns}
    print(json.dumps(info, ensure_ascii=False))
    for w_ in warns:
        print(f'  WARN {Path(src).name}: {w_}', file=sys.stderr)
    return info


def main():
    ap = argparse.ArgumentParser(description='绿幕抠像 → 去溢色 → 白描边贴纸')
    ap.add_argument('inputs', nargs='+', help='图片文件或目录')
    ap.add_argument('-o', '--outdir', help='输出目录（默认与输入同目录）')
    ap.add_argument('--outline', type=int, default=10, help='白描边宽度 px（按输出前的原图尺寸算），默认 10')
    ap.add_argument('--choke', type=int, default=1, help='边缘向内收缩 px，去绿边，默认 1')
    ap.add_argument('--margin', type=int, default=6, help='描边外再留的透明边 px')
    ap.add_argument('--height', type=int, default=0, help='输出高度 px，0 = 不缩放')
    ap.add_argument('--lo', type=float, default=0.18, help='偏绿程度低于此比例完全保留')
    ap.add_argument('--hi', type=float, default=0.55, help='偏绿程度高于此比例完全透明')
    ap.add_argument('--despill', choices=['max', 'avg', 'off'], default='max', help='去溢色强度：max 温和 / avg 更强 / off')
    ap.add_argument('--min-speck', type=float, default=0.002, help='小于最大连通块该比例的碎块会被删掉')
    ap.add_argument('--headroom', type=float, default=0.015, help='头顶离上边少于该比例时警告')
    ap.add_argument('--quality', type=int, default=92, help='webp 质量')
    ap.add_argument('--ext', default='.webp', help='输出格式，默认 .webp')
    ap.add_argument('--preview', action='store_true', help='额外输出 *_preview.jpg 检查图')
    o = ap.parse_args()

    files = []
    for p in map(Path, o.inputs):
        files += sorted(f for f in p.iterdir() if f.suffix.lower() in EXTS) if p.is_dir() else [p]
    files = [f for f in files if not f.stem.endswith('_preview')]
    if not files:
        raise SystemExit('没有找到输入图片')
    if ndi is None:
        print('提示：未安装 scipy，使用简化形态学（描边略方，不去碎块）', file=sys.stderr)
    nwarn = 0
    for f in files:
        out = (Path(o.outdir) if o.outdir else f.parent) / (f.stem + o.ext)
        if out.resolve() == f.resolve():
            out = out.with_name(f.stem + '_key' + o.ext)
        nwarn += bool(process(f, out, o)['warn'])
    print(f'完成 {len(files)} 张，{nwarn} 张有警告', file=sys.stderr)


if __name__ == '__main__':
    main()
