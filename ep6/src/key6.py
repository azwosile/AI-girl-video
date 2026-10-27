import numpy as np, glob, os
from PIL import Image, ImageFilter
os.chdir('/home/user/ep6w')
for f in sorted(glob.glob('gen/*.png')):
    im=np.array(Image.open(f).convert('RGB')).astype(np.float32)/255
    r,g,b=im[...,0],im[...,1],im[...,2]
    # greenness: how much g exceeds max(r,b)
    gx=g-np.maximum(r,b)
    a=1-np.clip((gx-0.10)/0.25,0,1)
    A=Image.fromarray((a*255).astype(np.uint8))
    # remove isolated bg specks: keep largest region via min/max filter clean
    A=A.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    a=np.array(A).astype(np.float32)/255
    # despill
    lim=np.maximum(r,b); g2=np.where(g>lim,lim+(g-lim)*0.15,g)
    rgb=np.stack([r,g2,b],-1)
    out=np.dstack([rgb,a]); out=(out*255).astype(np.uint8)
    img=Image.fromarray(out,'RGBA')
    bbox=img.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox(); img=img.crop(bbox)
    n=os.path.basename(f)[:-4]
    if n in ('d_phone',):
        img.save(f'keyed/{n}.png'); print(n,img.size,'no-outline'); continue
    # sticker outline
    pad=24; W,H=img.size
    can=Image.new('RGBA',(W+2*pad,H+2*pad),(0,0,0,0)); can.paste(img,(pad,pad),img)
    al=can.getchannel('A').point(lambda v:255 if v>60 else 0)
    stroke=al.filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    st=Image.new('RGBA',can.size,(255,255,255,0)); st.putalpha(stroke)
    sh=Image.new('RGBA',can.size,(30,20,60,0)); sh.putalpha(stroke.point(lambda v:int(v*0.35)))
    fin=Image.new('RGBA',(can.width+12,can.height+12),(0,0,0,0))
    fin.alpha_composite(sh,(10,12)); fin.alpha_composite(st,(0,0)); fin.alpha_composite(can,(0,0))
    n=os.path.basename(f)[:-4]
    fin.save(f'keyed/{n}.png'); print(n,fin.size)
