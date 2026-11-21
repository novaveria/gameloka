import { Penyedia, useApp } from './lib/store.tsx';
import { useRute } from './lib/rute.ts';
import { Toaster } from './komponen/Toast.tsx';
import { Maskot } from './komponen/Maskot.tsx';
import { Onboarding } from './layar/Onboarding.tsx';
import { Belajar } from './layar/Belajar.tsx';
import { Pelajaran } from './layar/Pelajaran.tsx';
import { Arena } from './layar/Arena.tsx';
import { Peringkat } from './layar/Peringkat.tsx';
import { Jelajah } from './layar/Jelajah.tsx';
import { Artikel } from './layar/Artikel.tsx';
import { Kisah } from './layar/Kisah.tsx';
import { Profil } from './layar/Profil.tsx';
import { Guru } from './layar/Guru.tsx';

export function App() {
  const rute = useRute();
  if (rute[0] === 'guru') {
    return (
      <>
        <Guru />
        <Toaster />
      </>
    );
  }
  return (
    <Penyedia memuat={<Memuat />} galat={(pesan, ulang) => <GagalMuat pesan={pesan} ulang={ulang} />}>
      <Isi rute={rute} />
      <Toaster />
    </Penyedia>
  );
}

function Isi({ rute }: { rute: string[] }) {
  const { status } = useApp();
  if (!status) return <Onboarding masuk={rute[0] === 'masuk'} />;
  const [a, b] = rute;
  switch (a) {
    case 'pelajaran':
      return <Pelajaran key={b} id={b} />;
    case 'kisah':
      return <Kisah key={b} id={b} />;
    case 'arena':
      return <Arena />;
    case 'peringkat':
      return <Peringkat />;
    case 'jelajah':
      return <Jelajah tab={b === 'pustaka' ? 'pustaka' : 'peta'} />;
    case 'pustaka':
      return <Artikel key={b} id={b} />;
    case 'profil':
      return <Profil fokus={b} />;
    default:
      return <Belajar />;
  }
}

function Memuat() {
  return (
    <div className="layar tengah" style={{ justifyContent: 'center', gap: 12 }} aria-busy="true">
      <Maskot ekspresi="senang" ukuran={96} />
      <p className="teks-abu">Memuat Gameloka…</p>
    </div>
  );
}

function GagalMuat({ pesan, ulang }: { pesan: string; ulang: () => void }) {
  return (
    <div className="layar tengah" style={{ justifyContent: 'center', gap: 16 }}>
      <Maskot ekspresi="cemas" ukuran={110} />
      <h1 className="instruksi">Gameloka belum bisa dibuka</h1>
      <p className="teks-abu">{pesan}</p>
      <button type="button" className="tombol" onClick={ulang}>
        Coba lagi
      </button>
    </div>
  );
}
