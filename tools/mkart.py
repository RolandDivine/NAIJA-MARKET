# Packs art/*.png into src/art.js as small WebP data URLs. Run: python3 tools/mkart.py
import base64, glob, io, os
from PIL import Image
root=os.path.join(os.path.dirname(__file__),'..'); out={}
for f in sorted(glob.glob(os.path.join(root,'art','*_*.png'))):
    k=os.path.basename(f)[:-4]; im=Image.open(f).convert('RGBA')
    h=168 if k[0] in 'os' else 140 if k[0]=='c' else 120
    if im.height>h: im=im.resize((round(im.width*h/im.height),h),Image.LANCZOS)
    b=io.BytesIO(); im.save(b,'WEBP',quality=82,method=6); out[k]=[im.width,im.height,'data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()]
js='/* ===== generated from art/*.png by tools/mkart.py ===== */\nconst ART={'+','.join('%s:[%d,%d,"%s"]'%(k,v[0],v[1],v[2]) for k,v in out.items())+'};\n'
open(os.path.join(root,'src','art.js'),'w').write(js); print(len(out),'sprites',len(js),'bytes')
