// Kerangka tiga kolom (desktop) / navigasi bawah (ponsel). DESIGN.md bagian 4.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Ikon, type NamaIkon } from './Ikon.tsx';
import { useApp, useSiswa } from '../lib/store.tsx';
import { pergi } from '../lib/rute.ts';
import { api } from '../lib/api.ts';
import type { BarisPeringkat, StatusSiswa } from '../../shared/tipe.ts';
import { NAMA_BULAN, geserHari, urutanHari } from '../../shared/aturan.ts';
import { toast } from './Toast.tsx';
import { Avatar } from './Avatar.tsx';

export type Tab = 'belajar' | 'arena' | 'peringkat' | 'jelajah' | 'profil';

const MENU: { tab: Tab; label: string; ikon: NamaIkon }[] = [
  { tab: 'belajar', label: 'Belajar', ikon: 'belajar' },
  { tab: 'arena', label: 'Arena', ikon: 'arena' },
  { tab: 'peringkat', label: 'Peringkat', ikon: 'peringkat' },
  { tab: 'jelajah', label: 'Jelajah', ikon: 'jelajah' },
  { tab: 'profil', label: 'Profil', ikon: 'profil' },
];

export function Kerangka({ tab, children, barStatus = false }: { tab: Tab; children: ReactNode; barStatus?: boolean }) {
  const { konten } = useApp();
  return (
    <div className="tata">
      <aside className="tata__kiri" aria-label="Menu utama">
        <a href="#/belajar" className="logo" aria-label="Gameloka, ke halaman Belajar">
          gameloka
        </a>
        <nav>
          <ul className="menu-samping">
            {MENU.map((m) => (
              <li key={m.tab}>
                <a href={`#/${m.tab}`} className="menu-samping__item" aria-current={tab === m.tab ? 'page' : undefined}>
                  <Ikon nama={m.ikon} ukuran={30} />
                  <span className="label">{m.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="tata__tengah" id="isi">
        {barStatus && (
          <div className="tata__status-ponsel">
            <BarStatus />
          </div>
        )}
        {konten.adaDraf && tab === 'belajar' && <CatatanDraf ringkas />}
        {children}
      </main>

      <aside className="tata__kanan" aria-label="Ringkasan">
        <BarStatus />
        <KartuMisi />
        <RingkasPeringkat />
        {konten.adaDraf && <CatatanDraf />}
      </aside>

      <nav className="nav-bawah" aria-label="Menu utama">
        {MENU.map((m) => (
          <a key={m.tab} href={`#/${m.tab}`} className="nav-bawah__item" aria-current={tab === m.tab ? 'page' : undefined} aria-label={m.label}>
            <Ikon nama={m.ikon} ukuran={30} />
          </a>
        ))}
      </nav>
    </div>
  );
}

function CatatanDraf({ ringkas = false }: { ringkas?: boolean }) {
  return (
    <p className={ringkas ? 'catatan-draf catatan-draf--ringkas' : 'catatan-draf'} role="note">
      <strong>Mode draf.</strong> Kosakata, kisah, dan artikel di sini belum divalidasi LKB.
    </p>
  );
}

// ---------- Bar status + panel ----------

type Panel = 'streak' | 'xp' | 'kartu' | null;

export function BarStatus() {
  const { status, konten } = useSiswa();
  const [panel, setPanel] = useState<Panel>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panel) return;
    const tutup = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setPanel(null);
    };
    document.addEventListener('mousedown', tutup);
    document.addEventListener('keydown', tutup);
    return () => {
      document.removeEventListener('mousedown', tutup);
      document.removeEventListener('keydown', tutup);
    };
  }, [panel]);

  const tombol = (p: Exclude<Panel, null>, ikon: NamaIkon, nilai: number, kelas: string, label: string) => (
    <button
      type="button"
      className={`status__item ${kelas}`}
      aria-expanded={panel === p}
      aria-label={label}
      onClick={() => setPanel(panel === p ? null : p)}
    >
      <Ikon nama={ikon} ukuran={26} warna={ikon === 'api' && status.streak === 0 ? '#A6ACAF' : undefined} />
      <span className="angka">{nilai}</span>
    </button>
  );

  return (
    <div className="status" ref={ref}>
      <div className="status__bar">
        {tombol('streak', 'api', status.streak, status.streak ? 'teks-jingga' : 'teks-abu', `Streak ${status.streak} hari`)}
        {tombol('xp', 'xp', status.xp, 'teks-kuning', `Total ${status.xp} XP`)}
        {tombol('kartu', 'kartu', status.kartu.length, 'teks-merah', `${status.kartu.length} kartu koleksi`)}
      </div>
      {panel && (
        <div className="status__panel kartu" role="dialog" aria-label="Detail">
          {panel === 'streak' && <PanelStreak status={status} />}
          {panel === 'xp' && <PanelXp status={status} />}
          {panel === 'kartu' && (
            <div className="panel-kartu">
              <p className="instruksi">
                {status.kartu.length} dari {konten.kartu.length} kartu
              </p>
              <p className="teks-abu">Kartu koleksi didapat dari menyelesaikan kisah di setiap bagian.</p>
              <a className="tombol tombol--sekunder tombol--penuh" href="#/profil/koleksi" onClick={() => setPanel(null)}>
                Lihat koleksi
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PanelStreak({ status }: { status: StatusSiswa }) {
  const [y, m] = status.hariIni.split('-').map(Number);
  const awal = `${y}-${String(m).padStart(2, '0')}-01`;
  const kosong = urutanHari(awal);
  const hari: string[] = [];
  for (let d = awal; d.slice(0, 7) === awal.slice(0, 7); d = geserHari(d, 1)) hari.push(d);
  const aktif = new Set(status.hariAktif);
  return (
    <div className="panel-streak">
      <div className="panel-streak__ringkas">
        <div className="kartu panel-streak__kotak">
          <Ikon nama="api" ukuran={30} />
          <div>
            <p className="angka">{status.streak} hari</p>
            <p className="teks-abu">Streak sekarang</p>
          </div>
        </div>
        <div className="kartu panel-streak__kotak">
          <Ikon nama="peti" ukuran={30} />
          <div>
            <p className="angka">
              {Math.min(status.xpHariIni, status.targetHarian)}/{status.targetHarian} XP
            </p>
            <p className="teks-abu">Target hari ini</p>
          </div>
        </div>
      </div>
      <p className="label panel-streak__bulan">
        {NAMA_BULAN[m - 1]} {y}
      </p>
      <div className="kalender" role="grid" aria-label={`Kalender ${NAMA_BULAN[m - 1]}`}>
        {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((h, i) => (
          <span key={i} className="kalender__kepala" aria-hidden="true">
            {h}
          </span>
        ))}
        {Array.from({ length: kosong }, (_, i) => (
          <span key={`k${i}`} />
        ))}
        {hari.map((d) => (
          <span
            key={d}
            role="gridcell"
            className={`kalender__hari${aktif.has(d) ? ' kalender__hari--aktif' : ''}${d === status.hariIni ? ' kalender__hari--ini' : ''}`}
            aria-label={`${Number(d.slice(8))}${aktif.has(d) ? ', aktif' : ''}`}
          >
            {Number(d.slice(8))}
          </span>
        ))}
      </div>
    </div>
  );
}

function PanelXp({ status }: { status: StatusSiswa }) {
  const l = status.level;
  const ke = l.berikut;
  return (
    <div className="panel-xp">
      <p className="instruksi">
        Level {l.level} · {l.nama}
      </p>
      {ke ? (
        <>
          <div className="progres progres--kuning" role="progressbar" aria-valuemin={l.min} aria-valuemax={ke} aria-valuenow={status.xp}>
            <div className="progres__isi" style={{ width: `${((status.xp - l.min) / (ke - l.min)) * 100}%` }} />
          </div>
          <p className="teks-abu">{ke - status.xp} XP lagi ke level berikutnya</p>
        </>
      ) : (
        <p className="teks-abu">Level tertinggi sudah tercapai.</p>
      )}
      <DaftarMisi />
    </div>
  );
}

// ---------- Misi Harian ----------

export function KartuMisi() {
  return (
    <section className="kartu kartu-samping" aria-labelledby="judul-misi">
      <h2 id="judul-misi" className="instruksi">
        Misi Harian
      </h2>
      <DaftarMisi />
    </section>
  );
}

export function DaftarMisi() {
  const { status, setStatus } = useSiswa();
  const [klaim, setKlaim] = useState<string | null>(null);
  async function buka(id: string) {
    setKlaim(id);
    try {
      const r = await api<{ xp: number; naikLevel: boolean; status: StatusSiswa }>('/api/misi/klaim', { misiId: id });
      setStatus(r.status);
      toast(r.naikLevel ? `Peti terbuka: +${r.xp} XP. Kamu naik level!` : `Peti terbuka: +${r.xp} XP`);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal membuka peti.');
    } finally {
      setKlaim(null);
    }
  }
  return (
    <ul className="misi">
      {status.misi.map((m) => {
        const tuntas = m.nilai >= m.target;
        return (
          <li key={m.id} className="misi__item">
            <div className="misi__isi">
              <p className="misi__judul">{m.judul}</p>
              <div className="progres progres--kuning" role="progressbar" aria-valuemin={0} aria-valuemax={m.target} aria-valuenow={m.nilai} aria-label={m.judul}>
                <div className="progres__isi" style={{ width: `${(m.nilai / m.target) * 100}%` }} />
                <span className="misi__angka">
                  {m.nilai} / {m.target}
                </span>
              </div>
            </div>
            {tuntas && !m.diklaim ? (
              <button type="button" className="misi__peti misi__peti--siap" onClick={() => buka(m.id)} disabled={klaim === m.id} aria-label={`Buka peti: ${m.hadiah} XP bonus`}>
                <Ikon nama="peti" ukuran={36} />
              </button>
            ) : (
              <span className="misi__peti" aria-label={m.diklaim ? 'Peti sudah dibuka' : `Hadiah ${m.hadiah} XP`}>
                <Ikon nama={m.diklaim ? 'peti-buka' : 'peti'} ukuran={36} style={{ opacity: m.diklaim ? 0.45 : 1 }} />
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ---------- Ringkasan peringkat ----------

function RingkasPeringkat() {
  const { status } = useSiswa();
  const [baris, setBaris] = useState<BarisPeringkat[] | null>(null);
  useEffect(() => {
    api<{ baris: BarisPeringkat[] }>('/api/peringkat').then((r) => setBaris(r.baris)).catch(() => setBaris(null));
  }, [status.xp]);
  if (!status.kelas) {
    return (
      <section className="kartu kartu-samping">
        <h2 className="instruksi">Peringkat kelas</h2>
        <p className="teks-abu">Masukkan kode kelas dari gurumu untuk bersaing dengan teman sekelas.</p>
        <button type="button" className="tombol tombol--sekunder tombol--penuh" onClick={() => pergi('peringkat')}>
          Masukkan kode
        </button>
      </section>
    );
  }
  const i = baris?.findIndex((b) => b.saya) ?? -1;
  return (
    <section className="kartu kartu-samping">
      <div className="kartu-samping__kepala">
        <h2 className="instruksi">{status.kelas.nama}</h2>
        <a className="tautan" href="#/peringkat">
          Lihat semua
        </a>
      </div>
      {baris && (
        <ol className="ringkas-peringkat">
          {baris.slice(0, 5).map((b, n) => (
            <li key={b.id} className={b.saya ? 'saya' : undefined}>
              <span className="ringkas-peringkat__no">{n + 1}</span>
              <Avatar nama={b.nama} ukuran={32} />
              <span className="ringkas-peringkat__nama">{b.nama}</span>
              <span>{b.xp} XP</span>
            </li>
          ))}
          {i >= 5 && baris[i] && (
            <li className="saya">
              <span className="ringkas-peringkat__no">{i + 1}</span>
              <Avatar nama={baris[i].nama} ukuran={32} />
              <span className="ringkas-peringkat__nama">{baris[i].nama}</span>
              <span>{baris[i].xp} XP</span>
            </li>
          )}
        </ol>
      )}
    </section>
  );
}
