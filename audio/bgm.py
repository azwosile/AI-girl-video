import numpy as np, soundfile as sf
SR=48000; BPM=132; beat=60/BPM; bars=int(330/(4*60/132))+1; L=int(bars*4*beat*SR)+SR; out=np.zeros((L,2))
rng=np.random.default_rng(3)
def add(sig,t,pan=0.0,g=1.0):
    i=int(t*SR); n=min(len(sig),L-i)
    if n<=0: return
    out[i:i+n,0]+=sig[:n]*g*(1-pan)/1.0; out[i:i+n,1]+=sig[:n]*g*(1+pan)/1.0
def env(n,c): return np.exp(-np.linspace(0,1,n)*c)
def kick():
    n=int(.35*SR); t=np.arange(n)/SR; f=50+120*np.exp(-t*30); return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,6)
def hat(o=False):
    n=int((.18 if o else .05)*SR); x=rng.standard_normal(n); x=np.diff(np.r_[0,x]); return x*env(n,8 if o else 30)*0.25
def clap():
    n=int(.2*SR); x=rng.standard_normal(n)*env(n,12); return np.convolve(x,np.ones(8)/8,'same')*0.6
def note(f,d,wave='saw',c=3):
    n=int(d*SR); t=np.arange(n)/SR
    if wave=='saw': y=2*((t*f)%1)-1
    elif wave=='sq': y=np.sign(np.sin(2*np.pi*f*t))
    else: y=np.sin(2*np.pi*f*t)
    a=np.minimum(1,np.arange(n)/(0.005*SR)); return y*env(n,c)*a
m2f=lambda m: 440*2**((m-69)/12)
PA=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]; PB=[[53,57,60],[55,59,62],[52,55,59],[57,60,64]]
for bar in range(bars):
    t0=bar*4*beat; sec=(bar//16)%4; ch=(PA if sec in (0,2) else PB)[bar%4]
    for b in range(4):
        add(kick(),t0+b*beat,0,0.9)
        if b in (1,3): add(clap(),t0+b*beat,0,0.5)
        for e in range(2): add(hat(e==1),t0+b*beat+e*beat/2,0.3,0.6)
    # bass 8ths
    for e in range(8):
        add(note(m2f(ch[0]-24),beat/2*0.9,'sq',5)*0.22,t0+e*beat/2,0,1)
    # stab chords on offbeats
    for e in [1,3,5,7]:
        s=sum(note(m2f(m),beat/2*0.8,'saw',7) for m in ch)/3
        add(s*0.16,t0+e*beat/2,-0.2+0.4*(e%4==1),1)
    # arp
    arp=[ch[0]+12,ch[1]+12,ch[2]+12,ch[1]+12]
    if sec==3: continue
    for e in range(16):
        add(note(m2f(arp[e%4]+12),beat/4*0.8,'sq',10)*0.06,t0+e*beat/4,0.4*np.sin(e),1)
out=np.tanh(out*1.2); out/=np.abs(out).max()/0.8
fade=int(1.5*SR); out[-fade:]*=np.linspace(1,0,fade)[:,None]
sf.write('sfx/bgm.flac',out.astype(np.float32),SR); print(len(out)/SR)
