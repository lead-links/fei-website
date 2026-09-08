import pdfplumber, glob, json, re, os, sys

MAT='/Volumes/Workspace/Projects/FEI/Website/material'

def norm(s):
    s = re.sub(r'\s+',' ', (s or '').replace('\n',' ')).strip()
    # pdf line-wrap hyphens: "network- connectivity" -> "network-connectivity".
    # A real spaced dash (" - ") keeps its spaces and is untouched.
    return re.sub(r'(\w)- (\w)', r'\1-\2', s)

def tables(f):
    out=[]
    with pdfplumber.open(f) as pdf:
        for p in pdf.pages:
            for tb in p.extract_tables():
                out.append([[norm(c) for c in row] for row in tb])
    return out

def kv(tbs, key):
    """Find a 2-col key/value table containing `key` in col 0."""
    for tb in tbs:
        for row in tb:
            if len(row)>=2 and row[0].upper()==key.upper():
                return row[1]
    return ''

OTHER={'Student-Facing Course Description':'Pathway and Career Relevance',
       'Pathway and Career Relevance':'Student-Facing Course Description'}

def panel(tbs, head):
    """The two side-by-side panels of section 2. Depending on the template variant
    they land in one cell, in two cells of one row, or in two separate tables — and
    sometimes the cell that starts with one heading actually holds the other panel,
    so strip whichever heading is present and keep only this panel's own text."""
    other = OTHER[head]
    cands = []
    for tb in tbs:
        for row in tb:
            for i, cell in enumerate(row):
                if not cell or not (cell.startswith(head) or cell.startswith(other)):
                    continue
                # variant where the heading is its own cell and the body is the next
                if cell in (head, other) and i + 1 < len(row) and row[i+1]:
                    cands.append(cell + ' ' + row[i+1])
                else:
                    cands.append(cell)
    for c in cands:
        if c.startswith(head):
            body = norm(c[len(head):])
            if body.startswith(other):     # both panels in one cell: take the first
                body = norm(body[len(other):])
            body = body.split(other)[0]
            if body: return norm(body)
    # only the other heading present: this panel is the tail after it
    for c in cands:
        if head in c:
            return norm(c.split(head,1)[1])
    return ''

def outcomes(tbs):
    for tb in tbs:
        h=[c.upper() for c in tb[0]]
        if not h: continue
        joined=' '.join(h)
        if ('LEARNING OUTCOME' in joined or 'STUDENT WILL BE ABLE' in joined) and len(tb)>2:
            rows=[r for r in tb[1:] if len(r)>=2 and r[1]]
            return [r[1] for r in rows]
    return []

def modules(tbs):
    best=[]
    for tb in tbs:
        h=[c.upper() for c in tb[0]]
        if not h or not h[0].startswith(('WEEK','MODULE')): continue
        if len(tb)<2: continue
        cols=tb[0]
        rows=[]
        for r in tb[1:]:
            if not r or not r[0]: continue
            rows.append({'label':r[0],
                         'topic': r[1] if len(r)>1 else '',
                         'detail': ' '.join(x for x in r[2:] if x)})
        best.extend(rows)
    return best

def prereq(tbs):
    for k in ('Required Prerequisite(s)','STANDARD ENTRY','Required Prerequisite'):
        v=kv(tbs,k)
        if v: return v
    for tb in tbs:
        for row in tb:
            if len(row)>=2 and 'prerequisite' in row[0].lower(): return row[1]
    return ''

def entry(tbs):
    for k in ('Entry Baseline','TARGET STUDENT','RECOMMENDED BACKGROUND'):
        v=kv(tbs,k)
        if v: return v
    return ''

data={}
for f in sorted(glob.glob(os.path.join(MAT,'FEI_Week_3_Course_Teaching_Plan_ITP_*.pdf'))):
    tbs=tables(f)
    code=kv(tbs,'COURSE CODE') or re.search(r'ITP_(\d+)',f).group(0).replace('_',' ')
    data[code]={
      'code':code,
      'title':kv(tbs,'OFFICIAL COURSE TITLE'),
      'certPrograms':kv(tbs,'CERTIFICATE PROGRAM(S)'),
      'length':kv(tbs,'COURSE LENGTH'),
      'credits':kv(tbs,'CREDIT VALUE'),
      'alignment':kv(tbs,'CERTIFICATION ALIGNMENT'),
      'delivery':kv(tbs,'DELIVERY FORMAT'),
      'overview':panel(tbs,'Student-Facing Course Description'),
      'pathway':panel(tbs,'Pathway and Career Relevance'),
      'prereq':prereq(tbs),
      'entry':entry(tbs),
      'outcomes':outcomes(tbs),
      'modules':modules(tbs),
    }
json.dump(data,open('/tmp/courses.json','w'),indent=1)
for k,v in data.items():
    print(f"{k} | out:{len(v['outcomes'])} mod:{len(v['modules'])} ov:{len(v['overview'])} pw:{len(v['pathway'])} pre:{len(v['prereq'])} align:{len(v['alignment'])} | {v['title'][:38]}")
