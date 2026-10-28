import numpy as np, glob, os
from PIL import Image, ImageFilter
os.chdir(os.path.dirname(os.path.abspath(__file__)))
for f in sorted(glob.glob('gen/*.png')):
    im=np.array(Image.open(f).convert('RGB')).astype(np.float32)/255
    r,g,b=im[...,0],im[...,1],im[...,2]
    # greenness: how much g exceeds max(r,b)
    gx=g-np.maximum(r,b)
    a=1-np.clip((gx-0.10)/0.25,0,1)
    from scipy import ndimage
    n0=os.path.basename(f)[:-4]
    cs=np.concatenate([im[:8,:8].reshape(-1,3),im[:8,-8:].reshape(-1,3),im[-8:,:8].reshape(-1,3),im[-8:,-8:].reshape(-1,3)]); bgc=np.median(cs,0); pure=np.linalg.norm(im-bgc,axis=-1)<0.18
    lab,nl=ndimage.label(a<0.5)
    edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))
    prot=np.zeros(a.shape,bool)
    for i in range(1,nl+1):
        if i in edge: continue
        m=lab==i
        if m.sum()>30 and pure[m].mean()<0.5: prot|=m
    prot=ndimage.binary_dilation(prot,iterations=2)&~pure
    pass
    a[prot]=1.0
    print(n0,'protected px',int(prot.sum()))
    A=Image.fromarray((a*255).astype(np.uint8))
    # remove isolated bg specks: keep largest region via min/max filter clean
    A=A.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    a=np.array(A).astype(np.float32)/255
    # despill
    lim=np.maximum(r,b); g2=np.where(g>lim,lim+(g-lim)*0.15,g)
    g2[prot]=g[prot]
    rgb=np.stack([r,g2,b],-1)
    out=np.dstack([rgb,a]); out=(out*255).astype(np.uint8)
    img=Image.fromarray(out,'RGBA')
    bbox=img.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox(); img=img.crop(bbox)
    n=os.path.basename(f)[:-4]
    if n in ():
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
