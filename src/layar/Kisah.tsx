// Kisah interaktif di lokasi budaya (DESIGN.md 8.10). Nama tokoh dan teks dialog tidak saling menimpa.
import { useState } from 'react';
import { useSiswa } from '../lib/store.tsx';
import { api } from '../lib/api.ts';
import { pergi } from '../lib/rute.ts';
import { Ikon } from '../komponen/Ikon.tsx';
import { Maskot, type Varian } from '../komponen/Maskot.tsx';
import { IlustrasiBudaya, LanskapLokasi } from '../komponen/Ilustrasi.tsx';
import { KonfirmasiKeluar } from '../komponen/UmpanBalik.tsx';
import { LayarNaikLevel } from './Pelajaran.tsx';
import type { StatusSiswa } from '../../shared/tipe.ts';

const TOKOH: Record<string, Varian> = { 'Bang Jali': 'jali', 'Mpok Ipah': 'ipah', 'Engkong Mamat': 'mamat' };

interface Hadiah {
  xp: number;
  kartuBaru: string[];
  lencanaBaru: string | null;
  naikLevel: boolean;
}

export function Kisah({ id }: { id: string }) {
  const { konten, status, setStatus } = useSiswa();
  const kisah = konten.kisah.find((k) => k.id === id);
  const [n, setN] = useState(0);
  const [pilihan, setPilihan] = useState<number | null>(null);
  const [arti, setArti] = useState(false);
  const [keluar, setKeluar] = useState(false);
  const [hadiah, setHadiah] = useState<Hadiah | null>(null);
  const [levelTampil, setLevelTampil] = useState(false);
  const [kirim, setKirim] = useState(false);

  if (!kisah) {
    return (
      <div className="layar tengah" style={{ justifyContent: 'center', gap: 16 }}>
        <Maskot ekspresi="kaget" />
        <p className="instruksi">Kisah ini belum tersedia.</p>
        <button type="button" className="tombol" onClick={() => pergi('belajar')}>
          Kembali
        </button>
      </div>
    );
  }

  if (hadiah) {
    if (levelTampil) return <LayarNaikLevel status={status} onLanjut={() => pergi('belajar')} />;
    const kartu = konten.kartu.filter((k) => hadiah.kartuBaru.includes(k.id));
    const lencana = konten.bagian.find((b) => b.lencana.id === hadiah.lencanaBaru)?.lencana;
    return (
      <div className="layar">
        <div className="layar__isi tengah hadiah">
          <h1 className="judul-layar">{hadiah.xp ? 'Kisah tamat!' : 'Kisah selesai'}</h1>
          {hadiah.xp > 0 && (
            <p className="hadiah__xp">
              <Ikon nama="xp" ukuran={26} /> +{hadiah.xp} XP
            </p>
          )}
          {kartu.length > 0 && (
            <>
              <p className="teks-abu">Kartu koleksi baru:</p>
              <ul className="hadiah__kartu">
                {kartu.map((k, i) => (
                  <li key={k.id} className="kartu-koleksi kartu-koleksi--baru" style={{ animationDelay: `${i * 160}ms` }}>
                    <IlustrasiBudaya nama={k.id} ukuran={80} />
                    <span className="kartu-koleksi__nama">{k.nama}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {lencana && (
            <p className="hadiah__lencana">
              <Ikon nama="lencana" ukuran={32} /> Lencana {lencana.nama}
            </p>
          )}
          {!hadiah.xp && <p className="teks-abu">Hadiah kisah ini sudah kamu dapat sebelumnya.</p>}
        </div>
        <div className="layar__bawah">
          <button type="button" className="tombol tombol--penuh" autoFocus onClick={() => (hadiah.naikLevel ? setLevelTampil(true) : pergi('belajar'))}>
            Lanjut
          </button>
        </div>
      </div>
    );
  }

  const a = kisah.adegan[n];
  const p = pilihan !== null ? a.pilihan?.[pilihan] : undefined;
  const butuhPilih = Boolean(a.pilihan?.length) && pilihan === null;
  const terakhir = n === kisah.adegan.length - 1;

  async function tamat() {
    setKirim(true);
    try {
      const r = await api<Hadiah & { status: StatusSiswa }>('/api/kisah/selesai', { kisahId: id });
      setStatus(r.status);
      setHadiah(r);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal menyimpan kisah.');
      setKirim(false);
    }
  }

  function lanjut() {
    if (terakhir) return tamat();
    setN(n + 1);
    setPilihan(null);
    setArti(false);
  }

  const teks = p ? p.balasan : a.teks;
  const teksArti = p ? p.balasanArti : a.arti;

  return (
    <div className="kisah">
      <div className="kisah__atas">
        <button type="button" className="ikon-tombol kisah__tutup" onClick={() => setKeluar(true)} aria-label="Keluar dari kisah">
          <Ikon nama="tutup" ukuran={26} />
        </button>
        <div className="progres" role="progressbar" aria-label="Kemajuan kisah" aria-valuemin={0} aria-valuemax={kisah.adegan.length} aria-valuenow={n + 1}>
          <div className="progres__isi" style={{ width: `${((n + (butuhPilih ? 0 : 1)) / kisah.adegan.length) * 100}%` }} />
        </div>
      </div>
      <div className="kisah__panggung" aria-hidden="true">
        <LanskapLokasi lokasi={kisah.lokasi} />
        <div className="kisah__tokoh">
          <Maskot varian={TOKOH[a.karakter] ?? 'jali'} ekspresi={p && !p.tepat ? 'kaget' : 'senang'} ukuran={130} />
        </div>
      </div>

      <section className="kisah__dialog" aria-live="polite">
        <p className="kisah__nama">{a.karakter}</p>
        <p className="kisah__teks" lang="bew">
          {teks}
        </p>
        {arti && <p className="kisah__arti">{teksArti}</p>}
        <button type="button" className="tautan tautan--kiri" aria-expanded={arti} onClick={() => setArti(!arti)}>
          {arti ? 'Sembunyikan arti' : 'Lihat arti'}
        </button>

        {butuhPilih ? (
          <div className="daftar-pilihan" role="group" aria-label="Pilih jawabanmu">
            {a.pilihan!.map((x, i) => (
              <button key={i} type="button" className="pilihan" onClick={() => { setPilihan(i); setArti(false); }}>
                <span>
                  <span lang="bew">{x.teks}</span>
                  {arti && <span className="teks-abu kisah__pilihan-arti">{x.arti}</span>}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <button type="button" className="tombol tombol--penuh" onClick={lanjut} disabled={kirim}>
            {terakhir ? 'Ambil hadiah' : 'Lanjut'}
          </button>
        )}
      </section>
      {keluar && <KonfirmasiKeluar pesan="Kisah harus diulang dari awal kalau kamu keluar sekarang." onTetap={() => setKeluar(false)} onKeluar={() => pergi('belajar')} />}
    </div>
  );
}
