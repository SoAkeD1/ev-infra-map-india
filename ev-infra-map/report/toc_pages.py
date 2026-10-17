import pymupdf, json, re, sys
secs=['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','A1','A2','A3']
names={'1':'Executive summary','2':'Problem and relevance','3':'Users and scope','4':'Data strategy','5':'Approach overview','6':'Data integration','7':'Gap assessment: Charging Gap Index','8':'Norm compliance','9':'Demand forecast','10':'Charger requirement','11':'Siting (Round 2)','12':'Validation','13':'Architecture and tech stack','14':'Implementation roadmap (7 Nov to 16 Dec 2026)','15':'Assumptions, risks and mitigations','16':'Innovation and scalability','A1':'Sources','A2':'Synthetic and assumed data register','A3':'AI-tool disclosure'}
d=pymupdf.open('Final_Round1_Submission.pdf'); out={}
for n in secs:
    pat = f'{n}. Appendix' if n.startswith('A') else f'{n}. {names[n].split(" (")[0].split(":")[0]}'
    for i,p in enumerate(d):
        if i==0: continue
        if any(l.startswith(pat) for l in p.get_text().split('\n')):
            out[f'{n}. {names[n]}']=i+1; break
print(out); json.dump(out,open('toc_pages.json','w'))
