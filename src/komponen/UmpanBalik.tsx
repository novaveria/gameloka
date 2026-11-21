// Panel umpan balik setelah PERIKSA (DESIGN.md 8.5) dan lembar laporan soal.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Ikon } from './Ikon.tsx';
import { useApp } from '../lib/store.tsx';
import { api } from '../lib/api.ts';
import { toast } from './Toast.tsx';

export function PanelUmpanBalik({
  benar, kunci, contoh, soalId, onLanjut, judulSalah = 'Jawaban yang benar:',
}: {
  benar: boolean;
  kunci: string;
  contoh?: string;
  soalId: string;
  onLanjut: () => void;
  judulSalah?: string;
}) {
  const { konten } = useApp();
  const pujian = useMemo(() => {
    const p = konten.pujian;
    return p.length ? p[Math.floor(Math.random() * p.length)].teks : 'Benar!';
  }, [konten.pujian]);
  const [lapor, setLapor] = useState(false);
  const tombolRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    tombolRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className={`umpan umpan--${benar ? 'benar' : 'salah'}`} role="alert">
      <div className="umpan__dalam">
        <div className="umpan__kepala">
          <span className="umpan__ikon" aria-hidden="true">
            <Ikon nama={benar ? 'centang' : 'silang'} ukuran={22} warna="#FFFFFF" />
          </span>
          <p className="umpan__judul">{benar ? pujian : judulSalah}</p>
          <button type="button" className="ikon-tombol umpan__bendera" onClick={() => setLapor(true)} aria-label="Laporkan soal ini">
            <Ikon nama="bendera" ukuran={22} />
          </button>
        </div>
        {!benar && (
          <div className="umpan__isi">
            <p className="umpan__kunci">{kunci}</p>
            {contoh && <p className="umpan__contoh">{contoh}</p>}
          </div>
        )}
        <button ref={tombolRef} type="button" className={`tombol tombol--penuh${benar ? '' : ' tombol--merek'}`} onClick={onLanjut}>
          Lanjut
        </button>
      </div>
      {lapor && <LaporSoal soalId={soalId} onTutup={() => setLapor(false)} />}
    </div>
  );
}

const ALASAN = ['Jawabanku seharusnya benar', 'Ada salah ketik', 'Arti atau kata Betawinya kurang tepat', 'Audio tidak jelas'];

export function LaporSoal({ soalId, onTutup }: { soalId: string; onTutup: () => void }) {
  const [alasan, setAlasan] = useState<string | null>(null);
  const [kirim, setKirim] = useState(false);
  async function lapor() {
    setKirim(true);
    try {
      await api('/api/laporan', { soalId, alasan });
      toast('Laporan terkirim ke antrean validator. Terima kasih.');
      onTutup();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal mengirim laporan.');
      setKirim(false);
    }
  }
  return (
    <div className="lembar-latar" onClick={onTutup}>
      <div className="lembar" role="dialog" aria-modal="true" aria-labelledby="judul-lapor" onClick={(e) => e.stopPropagation()}>
        <h2 id="judul-lapor" className="instruksi">
          Apa yang keliru dari soal ini?
        </h2>
        <div className="daftar-pilihan" role="radiogroup">
          {ALASAN.map((a) => (
            <button key={a} type="button" role="radio" aria-checked={alasan === a} className="pilihan" onClick={() => setAlasan(a)}>
              {a}
            </button>
          ))}
        </div>
        <button type="button" className="tombol tombol--penuh" disabled={!alasan || kirim} onClick={lapor}>
          Kirim laporan
        </button>
        <button type="button" className="tautan" onClick={onTutup}>
          Batal
        </button>
      </div>
    </div>
  );
}

export function KonfirmasiKeluar({ onTetap, onKeluar, pesan }: { onTetap: () => void; onKeluar: () => void; pesan: string }) {
  return (
    <div className="lembar-latar" onClick={onTetap}>
      <div className="lembar tengah" role="alertdialog" aria-modal="true" aria-labelledby="judul-keluar" onClick={(e) => e.stopPropagation()}>
        <h2 id="judul-keluar" className="instruksi">
          Yakin mau berhenti?
        </h2>
        <p className="teks-abu">{pesan}</p>
        <button type="button" className="tombol tombol--penuh" onClick={onTetap} autoFocus>
          Lanjut belajar
        </button>
        <button type="button" className="tautan" style={{ color: 'var(--merah)' }} onClick={onKeluar}>
          Berhenti
        </button>
      </div>
    </div>
  );
}
