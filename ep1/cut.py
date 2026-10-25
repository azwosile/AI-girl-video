import json,re,difflib,numpy as np,soundfile as sf,os
S=json.load(open('script.json')); A=json.load(open('asr.json'))
def norm(t): return [c for c in t.lower() if re.match(r'[\u4e00-\u9fffa-z0-9]',c)]
os.makedirs('cut',exist_ok=True); units={}
for k in [k for k in S if k.startswith('G')]:
    x,sr=sf.read(f'vo/{k}.wav')
    # ASR 字符级时间
    ac,at=[],[]
    for st,en,w in A[k]['words']:
        cs=norm(w)
        for i,c in enumerate(cs): ac.append(c); at.append((st+(en-st)*i/len(cs), st+(en-st)*(i+1)/len(cs)))
    sc,owner=[],[]
    for si,sen in enumerate(S[k]):
        for c in norm(sen): sc.append(c); owner.append(si)
    sm=difflib.SequenceMatcher(None,sc,ac,autojunk=False); mp={}
    for a,b,n in sm.get_matching_blocks():
        for j in range(n): mp[a+j]=b+j
    # 每句首尾时间
    bounds=[]
    for si in range(len(S[k])):
        idx=[i for i,o in enumerate(owner) if o==si and i in mp]
        bounds.append((at[mp[idx[0]]][0], at[mp[idx[-1]]][1]))
    # 在相邻句之间找能量最低点切开
    fr=int(0.01*sr); e=np.array([np.sqrt(np.mean(x[i:i+fr]**2)) for i in range(0,len(x)-fr,fr)])
    cuts=[0]
    for si in range(len(bounds)-1):
        a0=bounds[si][1]-0.15; a1=bounds[si+1][0]+0.15
        lo,hi=int(a0*100),max(int(a0*100)+1,int(a1*100))
        c=lo+int(np.argmin(e[lo:hi])); cuts.append(c/100)
    cuts.append(len(x)/sr)
    for si in range(len(S[k])):
        seg=x[int(cuts[si]*sr):int(cuts[si+1]*sr)]
        ee=np.abs(seg)>0.01; i=np.argmax(ee); j=len(seg)-np.argmax(ee[::-1])
        seg=seg[max(0,i-int(.03*sr)):min(len(seg),j+int(.08*sr))]
        name=f'{k}_{si+1:02d}'; sf.write(f'cut/{name}.wav',seg,sr); units[name]=round(len(seg)/sr,3)
    print(k,[round(c,2) for c in cuts])
json.dump(units,open('cut/units.json','w'),indent=1); print(sum(units.values()))
