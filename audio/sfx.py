import numpy as np, soundfile as sf
SR=48000; rng=np.random.default_rng(7)
def env(n,a=0.005,r=None,curve=4):
    t=np.linspace(0,1,n); e=np.exp(-curve*t) if r is None else np.clip(1-t/r,0,1)
    k=int(a*SR); e[:k]*=np.linspace(0,1,k); return e
def lp(x,a): # one-pole lowpass, a in (0,1)
    y=np.zeros_like(x); s=0
    for i in range(len(x)): s+= a*(x[i]-s); y[i]=s
    return y
def bp_noise(n,f0,f1):
    X=np.fft.rfft(rng.standard_normal(n)); f=np.fft.rfftfreq(n,1/SR); X[(f<f0)|(f>f1)]=0; y=np.fft.irfft(X,n); return y/np.abs(y).max()
def sweep_noise(dur,f0,f1,shape):
    n=int(dur*SR); out=np.zeros(n); seg=1024
    for i in range(0,n,seg):
        fc=f0*(f1/f0)**(i/n); out[i:i+seg]=bp_noise(seg*2,fc*0.6,fc*1.6)[:len(out[i:i+seg])]
    return out*shape(n)
def tone(dur,f0,f1=None,curve=8,wave='sin'):
    n=int(dur*SR); t=np.arange(n)/SR; f=np.full(n,f0) if f1 is None else f0*(f1/f0)**(t/dur)
    ph=2*np.pi*np.cumsum(f)/SR; y=np.sin(ph) if wave=='sin' else np.sign(np.sin(ph))*0.5
    return y*env(n,curve=curve)
def norm(x,p=0.9): return x/np.abs(x).max()*p
S={}
n=int(.35*SR); S['whoosh']=norm(sweep_noise(.35,500,4000,lambda n: np.sin(np.linspace(0,np.pi,n))**2),0.7)
S['swoosh_in']=norm(sweep_noise(.5,300,6000,lambda n: np.linspace(0,1,n)**2*np.exp(-np.linspace(0,1,n)*0)),0.6)
S['pop']=norm(tone(.12,900,300,curve=18)+0.3*tone(.12,1800,600,curve=25),0.7)
S['boing']=norm(tone(.45,220,520,curve=5)*(1+0.4*np.sin(2*np.pi*14*np.arange(int(.45*SR))/SR)),0.6)
b=tone(.9,90,38,curve=4)+0.5*bp_noise(int(.9*SR),40,600)*env(int(.9*SR),curve=7); S['boom']=norm(np.tanh(b*2),0.95)
im=tone(.6,140,50,curve=6)+0.7*bp_noise(int(.6*SR),200,6000)*env(int(.6*SR),curve=14); S['impact']=norm(np.tanh(im*2.5),0.95)
k=int(.035*SR); S['type']=norm(bp_noise(k,2000,7000)*env(k,a=0.001,curve=30)+0.3*tone(.035,1200,curve=40),0.5)
d=sum(tone(1.2,f,curve=c)*g for f,c,g in [(1318.5,4,1),(2637,6,.4),(1975.5,5,.3)]); S['ding']=norm(d,0.6)
k=int(.5*SR); S['tape']=norm(sweep_noise(.5,1500,3500,lambda n: np.ones(n)*np.r_[np.linspace(0,1,200),np.ones(n-400),np.linspace(1,0,200)])*(0.7+0.3*np.sign(np.sin(np.arange(k)/SR*2*np.pi*35))),0.5)
st=tone(.3,120,60,curve=10)+bp_noise(int(.3*SR),300,3000)*env(int(.3*SR),curve=20); S['stamp']=norm(np.tanh(st*3),0.9)
k=int(.25*SR); sh=bp_noise(k,1500,9000)*env(k,a=0.001,curve=25); sh2=np.r_[np.zeros(int(.07*SR)),sh[:k-int(.07*SR)]*0.7]; S['shutter']=norm(sh+sh2,0.8)
k=int(.6*SR); g=bp_noise(k,200,8000)*np.repeat(rng.random(k//1200+1)>0.4,1200)[:k]; S['glitch']=norm(g*(0.6+0.4*np.sign(np.sin(np.arange(k)/SR*2*np.pi*60))),0.6)
k=int(.4*SR); S['crack']=norm(np.tanh(3*(bp_noise(k,800,8000)*env(k,a=0.001,curve=12)+0.6*tone(.4,180,70,curve=9))),0.8)
k=int(1.2*SR); t=np.arange(k)/SR; f=1200*np.exp(-t*1.2)+200; ph=2*np.pi*np.cumsum(f*(1+0.2*np.sin(2*np.pi*9*t)))/SR
S['rewind']=norm((np.sign(np.sin(ph))*0.3+0.5*bp_noise(k,1000,6000))*np.sin(np.linspace(0,np.pi,k))**0.5,0.55)
k=int(1.0*SR); c=np.zeros(k)
for i in range(30):
    o=int(rng.random()*0.8*SR); f=2000+rng.random()*4000; c[o:o+int(.06*SR)]+=tone(.06,f,f*0.7,curve=30)[:len(c[o:o+int(.06*SR)])]*(1-o/k)
S['confetti']=norm(c+0.3*sweep_noise(1.0,3000,6000,lambda n: env(n,curve=4)),0.6)
S['coin']=norm(np.r_[tone(.08,988,curve=2,wave='sq')*0.8,tone(.4,1319,curve=6,wave='sq')],0.45)

k=int(.05*SR); S['click']=norm(bp_noise(k,1500,6000)*env(k,a=0.0005,curve=40)+0.4*tone(.05,2200,1800,curve=50),0.6)
k=int(.7*SR); sp=np.zeros(k)
for i in range(12):
    o=int(i*0.045*SR); f=2500+i*180; seg=tone(.18,f,curve=12); sp[o:o+len(seg)]+=seg[:len(sp[o:o+len(seg)])]*(1-i/14)
S['sparkle']=norm(sp,0.5)
k=int(.35*SR); t_=np.arange(k)/SR; S['buzz']=norm(np.tanh(3*np.sign(np.sin(2*np.pi*110*t_))*0.5+np.sin(2*np.pi*55*t_))*env(k,curve=3),0.6)
for k,v in S.items():
    v=np.r_[v,np.zeros(int(.02*SR))]; sf.write(f'sfx/{k}.flac',v.astype(np.float32),SR); 
print(sorted(S))
