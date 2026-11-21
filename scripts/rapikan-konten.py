"""Merapikan konten/*.json: objek atau daftar pendek ditulis satu baris, yang panjang diuraikan.
Jalankan: python3 scripts/rapikan-konten.py"""
import glob
import json

LEBAR = 120


def tulis(v, tingkat=0):
    satu = json.dumps(v, ensure_ascii=False)
    if len(satu) + tingkat * 2 <= LEBAR or not isinstance(v, (dict, list)) or not v:
        return satu
    jarak = '  ' * (tingkat + 1)
    if isinstance(v, dict):
        isi = [f'{jarak}{json.dumps(k, ensure_ascii=False)}: {tulis(x, tingkat + 1)}' for k, x in v.items()]
        return '{\n' + ',\n'.join(isi) + '\n' + '  ' * tingkat + '}'
    isi = [jarak + tulis(x, tingkat + 1) for x in v]
    return '[\n' + ',\n'.join(isi) + '\n' + '  ' * tingkat + ']'


for berkas in sorted(glob.glob('konten/*.json')):
    with open(berkas, encoding='utf-8') as f:
        data = json.load(f)
    with open(berkas, 'w', encoding='utf-8') as f:
        f.write(tulis(data) + '\n')
