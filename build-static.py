from pathlib import Path
import shutil
root=Path(__file__).parent
out=root/'dist'
out.mkdir(exist_ok=True)
for name in ['index.html','assets','boutique','tarot','horus','lithotherapie','consultation','morgane','contact','confidentialite']:
    source=root/name
    if source.is_dir(): shutil.copytree(source,out/name,dirs_exist_ok=True)
    else: shutil.copy2(source,out/name)
