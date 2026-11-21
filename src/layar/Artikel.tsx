// Halaman artikel Pustaka: gambar, nama validator, dua soal di akhir (DESIGN.md 8.10).
import { useState } from 'react';
import { Kerangka } from '../komponen/Kerangka.tsx';
import { Ikon } from '../komponen/Ikon.tsx';
import { IlustrasiBudaya } from '../komponen/Ilustrasi.tsx';
import { toast } from '../komponen/Toast.tsx';
import { useSiswa } from '../lib/store.tsx';
import { api } from '../lib/api.ts';
import { pergi } from '../lib/rute.ts';
import { XP } from '../../shared/aturan.ts';
import type { StatusSiswa } from '../../shared/tipe.ts';

export function Artikel({ id }: { id: string }) {
  const { konten, status, setStatus } = useSiswa();
  const a = konten.pustaka.find((x) => x.id === id);
  const [jawab, setJawab] = useState<Record<string, string>>({});
  const [kirim, setKirim] = useState(false);
  const sudah = a ? status.pustakaSelesai.includes(a.id) : false;

  if (!a) {
    return (
      <Kerangka tab="jelajah">
        <p className="instruksi">Artikel tidak ditemukan.</p>
        <a className="tautan" href="#/jelajah/pustaka">Kembali ke Pustaka</a>
      </Kerangka>
    );
  }

  const semuaBenar = a.soal.every((s) => jawab[s.id] === s.jawaban);

  async function selesai() {
    if (!a) return;
    setKirim(true);
    try {
      const r = await api<{ xp: number; naikLevel: boolean; status: StatusSiswa }>('/api/pustaka/selesai', { artikelId: a.id });
      setStatus(r.status);
      toast(r.xp ? `+${r.xp} XP dari membaca ${a.judul}${r.naikLevel ? '. Kamu naik level!' : ''}` : 'Artikel ini sudah pernah kamu selesaikan.');
      pergi('jelajah', 'pustaka');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal menyimpan.');
      setKirim(false);
    }
  }

  return (
    <Kerangka tab="jelajah">
      <article className="artikel">
        <a className="tautan tautan--kiri artikel__kembali" href="#/jelajah/pustaka">
          <Ikon nama="kembali" ukuran={20} /> Pustaka
        </a>
        <div className="artikel__gambar">
          <IlustrasiBudaya nama={a.ilustrasi} ukuran={160} />
        </div>
        <p className="label artikel-kartu__kat">{a.kategori}</p>
        <h1 className="judul-layar">{a.judul}</h1>
        <p className="artikel__validator">
          {a.validator ? (
            <>
              Divalidasi oleh {a.validator}, {a.tanggal_validasi}
            </>
          ) : (
            <>Draf: belum divalidasi LKB</>
          )}
        </p>
        {a.isi.map((p, i) => (
          <p key={i} className="artikel__paragraf">
            {p}
          </p>
        ))}

        <section className="artikel__kuis" aria-labelledby="judul-kuis">
          <h2 id="judul-kuis" className="instruksi">
            Cek pemahamanmu
          </h2>
          {a.soal.map((s, n) => {
            const pilihan = jawab[s.id];
            const dijawab = pilihan !== undefined;
            const benar = pilihan === s.jawaban;
            return (
              <fieldset key={s.id} className="kuis-soal">
                <legend className="kuis-soal__tanya">
                  {n + 1}. {s.kata}
                </legend>
                <div className="daftar-pilihan">
                  {s.pilihan.map((p) => {
                    const dipilih = pilihan === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        role="radio"
                        aria-checked={dipilih}
                        className={`pilihan${dipilih ? (benar ? ' pilihan--benar' : ' pilihan--salah') : ''}`}
                        disabled={dijawab && benar}
                        onClick={() => setJawab({ ...jawab, [s.id]: p })}
                      >
                        {dipilih && <Ikon nama={benar ? 'centang' : 'silang'} ukuran={20} />}
                        {p}
                      </button>
                    );
                  })}
                </div>
                {dijawab && (
                  <p className={benar ? 'kuis-soal__benar' : 'galat'} role="status">
                    {benar ? 'Benar.' : 'Belum tepat. Baca lagi paragraf di atas, lalu coba pilihan lain.'}
                  </p>
                )}
              </fieldset>
            );
          })}
          <button type="button" className="tombol tombol--penuh" disabled={!semuaBenar || kirim} onClick={selesai}>
            {sudah ? 'Selesai' : `Selesai +${XP.pustaka} XP`}
          </button>
        </section>
      </article>
    </Kerangka>
  );
}
