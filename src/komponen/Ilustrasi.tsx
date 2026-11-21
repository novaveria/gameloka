// Ilustrasi vektor datar: benda budaya (kartu koleksi dan Pustaka) dan lanskap lokasi (jalur dan kisah).
// Semua digambar untuk proyek ini; hak pakai milik tim Gameloka. Penggambaran budaya tetap perlu ditinjau LKB.
import type { ReactNode } from 'react';
import type { Lokasi } from '../../shared/tipe.ts';

const T = '#2C3E50';
const W = 3;

export function IlustrasiBudaya({ nama, ukuran = 96, siluet = false }: { nama: string; ukuran?: number; siluet?: boolean }) {
  const isi = siluet ? '#CFD4DA' : undefined;
  const c = (warna: string) => isi ?? warna;
  const g = siluet ? '#B5BCC4' : T;
  let gambar: ReactNode;
  switch (nama) {
    case 'ondel':
    case 'ondel-ondel':
      gambar = (
        <>
          <g stroke={g} strokeWidth="3" strokeLinecap="round">
            {[-50, -30, -10, 10, 30, 50].map((a, i) => (
              <path key={a} d={`M50 26 L${50 + Math.sin((a * Math.PI) / 180) * 26} ${26 - Math.cos((a * Math.PI) / 180) * 22}`} stroke={c(['#C0392B', '#F1C40F', '#1E8449', '#F1C40F', '#1F6FA3', '#C0392B'][i])} strokeWidth="4" />
            ))}
          </g>
          <path d="M28 96 L36 52 H64 L72 96 Z" fill={c('#1E8449')} stroke={g} strokeWidth={W} strokeLinejoin="round" />
          <path d="M33 70 H67 M31 82 H69" stroke={c('#F1C40F')} strokeWidth="4" />
          <circle cx="50" cy="38" r="15" fill={c('#C0392B')} stroke={g} strokeWidth={W} />
          {!siluet && (
            <>
              <circle cx="44" cy="36" r="3.5" fill="#FFFFFF" stroke={T} strokeWidth="1.5" />
              <circle cx="56" cy="36" r="3.5" fill="#FFFFFF" stroke={T} strokeWidth="1.5" />
              <path d="M42 45 Q50 41 58 45" stroke={T} strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}
        </>
      );
      break;
    case 'gambang':
    case 'gambang-kromong':
      gambar = (
        <>
          <path d="M14 58 L86 50 L82 80 L18 84 Z" fill={c('#A0522D')} stroke={g} strokeWidth={W} strokeLinejoin="round" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={20 + i * 9.4} y={44 - i * 1.2} width="7" height={30 - i * 2.2} rx="2" fill={c('#F5CBA7')} stroke={g} strokeWidth="2" />
          ))}
          <path d="M30 24 L44 40 M60 20 L58 40" stroke={g} strokeWidth="3" strokeLinecap="round" />
          <circle cx="29" cy="22" r="5" fill={c('#C0392B')} stroke={g} strokeWidth="2" />
          <circle cx="60" cy="18" r="5" fill={c('#C0392B')} stroke={g} strokeWidth="2" />
        </>
      );
      break;
    case 'kerak':
    case 'kerak-telor':
      gambar = (
        <>
          <rect x="22" y="70" width="56" height="16" rx="4" fill={c('#5D6D7E')} stroke={g} strokeWidth={W} />
          {!siluet && [30, 40, 50, 60, 70].map((x) => <circle key={x} cx={x} cy="70" r="4" fill="#E67E22" />)}
          <path d="M12 52 Q50 80 88 52 Z" fill={c('#2C3E50')} stroke={g} strokeWidth={W} strokeLinejoin="round" />
          <ellipse cx="50" cy="52" rx="34" ry="9" fill={c('#E5B567')} stroke={g} strokeWidth={W} />
          {!siluet && [[38, 50], [50, 54], [60, 49], [44, 56], [56, 47]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="2.2" fill="#E67E22" />)}
          {!siluet && <path d="M30 38 q4 -6 0 -12 M50 36 q4 -6 0 -12 M70 38 q4 -6 0 -12" stroke="#A6ACAF" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
        </>
      );
      break;
    case 'rumah':
    case 'rumah-kebaya':
      gambar = <RumahKebaya x={8} y={18} s={0.84} siluet={siluet} />;
      break;
    case 'palang':
      gambar = (
        <>
          <rect x="16" y="36" width="10" height="52" rx="2" fill={c('#A0522D')} stroke={g} strokeWidth={W} />
          <rect x="74" y="36" width="10" height="52" rx="2" fill={c('#A0522D')} stroke={g} strokeWidth={W} />
          <rect x="10" y="54" width="80" height="9" rx="4" fill={c('#D4AC0D')} stroke={g} strokeWidth={W} />
          <path d="M26 14 h30 a6 6 0 0 1 6 6 v8 a6 6 0 0 1 -6 6 h-20 l-8 6 v-6 a6 6 0 0 1 -8 -6 v-8 a6 6 0 0 1 6 -6z" fill={c('#FFFFFF')} stroke={g} strokeWidth="2.5" />
          {!siluet && <path d="M30 22 h22 M30 28 h16" stroke={T} strokeWidth="2.5" strokeLinecap="round" />}
        </>
      );
      break;
    case 'roti-buaya':
      gambar = (
        <>
          <path d="M10 58 Q14 44 32 44 H70 Q84 44 92 54 Q84 62 70 64 H32 Q14 66 10 58 Z" fill={c('#D68910')} stroke={g} strokeWidth={W} strokeLinejoin="round" />
          <path d="M30 64 l-4 10 M46 64 l-2 10 M62 64 l2 10 M74 62 l4 10" stroke={g} strokeWidth="5" strokeLinecap="round" />
          {!siluet && [38, 48, 58, 68].map((x) => <path key={x} d={`M${x} 50 l4 4 l4 -4`} stroke="#9C640C" strokeWidth="2.5" fill="none" />)}
          {!siluet && <circle cx="82" cy="51" r="2.5" fill={T} />}
        </>
      );
      break;
    case 'keroncong-kemayoran':
      gambar = (
        <>
          <path d="M54 22 L80 10" stroke={g} strokeWidth="7" strokeLinecap="round" />
          <path d="M54 22 L80 10" stroke={c('#A0522D')} strokeWidth="3" strokeLinecap="round" />
          <path d="M22 58 a16 16 0 0 1 14 -24 a12 12 0 0 1 20 -8 a14 14 0 0 1 -2 22 a16 16 0 0 1 -32 10 z" fill={c('#E59866')} stroke={g} strokeWidth={W} strokeLinejoin="round" />
          <circle cx="44" cy="42" r="6" fill={c('#784212')} />
          {!siluet && <path d="M64 70 q6 -8 12 -2 M70 82 q6 -8 12 -2" stroke="#1F6FA3" strokeWidth="3" fill="none" strokeLinecap="round" />}
        </>
      );
      break;
    case 'salak-condet':
      gambar = (
        <>
          {[[36, 60], [60, 58], [48, 40], [48, 72]].map(([x, y]) => (
            <g key={`${x}${y}`}>
              <path d={`M${x} ${y - 16} Q${x + 14} ${y - 4} ${x} ${y + 14} Q${x - 14} ${y - 4} ${x} ${y - 16} Z`} fill={c('#784212')} stroke={g} strokeWidth="2.5" />
              {!siluet && <path d={`M${x - 5} ${y - 4} l5 4 l5 -4 M${x - 5} ${y + 4} l5 4 l5 -4`} stroke="#B9770E" strokeWidth="2" fill="none" />}
            </g>
          ))}
          <path d="M48 24 q-8 -10 -18 -8 M48 24 q8 -10 18 -8" stroke={c('#1E8449')} strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      );
      break;
    case 'dodol-betawi':
      gambar = (
        <>
          <path d="M72 16 L52 56" stroke={g} strokeWidth="7" strokeLinecap="round" />
          <path d="M72 16 L52 56" stroke={c('#D4AC0D')} strokeWidth="3" strokeLinecap="round" />
          <path d="M10 54 Q50 96 90 54 Z" fill={c('#2C3E50')} stroke={g} strokeWidth={W} strokeLinejoin="round" />
          <ellipse cx="50" cy="54" rx="40" ry="10" fill={c('#6E2C00')} stroke={g} strokeWidth={W} />
          {!siluet && <path d="M30 54 q10 -5 20 0 t20 0" stroke="#A04000" strokeWidth="3" fill="none" />}
        </>
      );
      break;
    default:
      gambar = <circle cx="50" cy="50" r="26" fill={c('#F1C40F')} stroke={g} strokeWidth={W} />;
  }
  return (
    <svg width={ukuran} height={ukuran} viewBox="0 0 100 100" aria-hidden="true">
      {gambar}
    </svg>
  );
}

export function RumahKebaya({ x = 0, y = 0, s = 1, siluet = false }: { x?: number; y?: number; s?: number; siluet?: boolean }) {
  const c = (w: string) => (siluet ? '#CFD4DA' : w);
  const g = siluet ? '#B5BCC4' : T;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="18" y="44" width="64" height="36" fill={c('#FAF3E0')} stroke={g} strokeWidth={W} />
      <path d="M2 50 L16 38 H84 L98 50 Z" fill={c('#922B21')} stroke={g} strokeWidth={W} strokeLinejoin="round" />
      <path d="M14 40 L30 16 H70 L86 40 Z" fill={c('#C0392B')} stroke={g} strokeWidth={W} strokeLinejoin="round" />
      <rect x="44" y="56" width="12" height="24" fill={c('#784212')} stroke={g} strokeWidth="2.5" />
      <rect x="26" y="56" width="12" height="11" fill={c('#1E8449')} stroke={g} strokeWidth="2.5" />
      <rect x="62" y="56" width="12" height="11" fill={c('#1E8449')} stroke={g} strokeWidth="2.5" />
      <path d="M10 80 H90" stroke={g} strokeWidth={W} strokeLinecap="round" />
      <path d="M12 72 H40 M60 72 H88" stroke={c('#784212')} strokeWidth="3" />
      {[14, 22, 30, 64, 72, 80, 88].map((px) => (
        <path key={px} d={`M${px} 72 V80`} stroke={c('#784212')} strokeWidth="2.5" />
      ))}
    </g>
  );
}

// ---------- Properti lanskap untuk latar jalur ----------

export function Pohon({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-4" y="0" width="8" height="22" rx="3" fill="#8D5524" />
      <circle cx="0" cy="-10" r="18" fill="#58B368" />
      <circle cx="-10" cy="-2" r="11" fill="#4AA35A" />
      <circle cx="10" cy="-4" r="12" fill="#4AA35A" />
    </g>
  );
}

export function PohonSalak({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" strokeLinecap="round">
      {[-60, -30, 0, 30, 60].map((a) => (
        <path
          key={a}
          d={`M0 10 Q${Math.sin((a * Math.PI) / 180) * 18} ${-10} ${Math.sin((a * Math.PI) / 180) * 34} ${-6 - Math.cos((a * Math.PI) / 180) * 22}`}
          stroke={a === 0 ? '#2E8B57' : '#3E9E63'}
          strokeWidth="7"
        />
      ))}
      <circle cx="-5" cy="10" r="4" fill="#784212" />
      <circle cx="4" cy="11" r="4" fill="#784212" />
    </g>
  );
}

export function Menara({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-7" y="-60" width="14" height="60" fill="#D5DBDF" />
      <path d="M-16 -74 H16 L12 -60 H-12 Z" fill="#AEB6BF" />
      <rect x="-14" y="-82" width="28" height="9" rx="2" fill="#85C1E9" />
      <rect x="-3" y="-92" width="6" height="10" fill="#AEB6BF" />
    </g>
  );
}

export function Gedung({ x, y, s = 1, warna = '#F6DDCC' }: { x: number; y: number; s?: number; warna?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-20" y="-34" width="40" height="34" fill={warna} />
      <path d="M-24 -34 H24 L18 -42 H-18 Z" fill="#C0392B" />
      {[-12, 0, 12].map((wx) => (
        <rect key={wx} x={wx - 3} y="-26" width="6" height="9" fill="#FFFFFF" />
      ))}
    </g>
  );
}

export function Awan({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#FFFFFF">
      <ellipse cx="0" cy="0" rx="22" ry="9" />
      <circle cx="-8" cy="-5" r="9" />
      <circle cx="6" cy="-7" r="11" />
    </g>
  );
}

// ---------- Lanskap penuh untuk layar kisah ----------

export function LanskapLokasi({ lokasi }: { lokasi: Lokasi }) {
  const langit = lokasi === 'setu-babakan' ? '#D6EAF8' : lokasi === 'condet' ? '#E8F6F3' : '#FDEBD0';
  return (
    <svg viewBox="0 0 360 260" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" aria-hidden="true">
      <rect width="360" height="260" fill={langit} />
      <Awan x={70} y={46} />
      <Awan x={270} y={30} s={0.8} />
      {lokasi === 'kemayoran' && (
        <>
          <rect y="190" width="360" height="70" fill="#F5E6C8" />
          <Menara x={260} y={192} s={1.3} />
          <Gedung x={70} y={192} s={1.4} />
          <Gedung x={150} y={192} s={1.1} warna="#FAF3E0" />
          <Pohon x={330} y={170} />
          <Pohon x={20} y={176} s={0.8} />
          <rect y="214" width="360" height="16" fill="#AEB6BF" />
          <path d="M0 222 H360" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="16 14" />
        </>
      )}
      {lokasi === 'condet' && (
        <>
          <rect y="180" width="360" height="80" fill="#BFE3C7" />
          <path d="M0 214 C80 200 140 236 220 220 S330 204 360 214 V240 C300 232 250 250 180 244 S60 236 0 246 Z" fill="#85C1E9" />
          <PohonSalak x={50} y={176} s={1.3} />
          <PohonSalak x={130} y={182} />
          <PohonSalak x={300} y={178} s={1.2} />
          <Pohon x={220} y={164} s={1.3} />
        </>
      )}
      {lokasi === 'setu-babakan' && (
        <>
          <rect y="176" width="360" height="84" fill="#BFE3C7" />
          <ellipse cx="250" cy="226" rx="150" ry="34" fill="#5DADE2" />
          <ellipse cx="250" cy="220" rx="120" ry="20" fill="#85C1E9" />
          <RumahKebaya x={20} y={110} s={1.05} />
          <Pohon x={150} y={166} s={1.1} />
          <Pohon x={340} y={170} s={0.9} />
          <path d="M240 222 h40 l-6 8 h-28 z" fill="#A0522D" />
        </>
      )}
    </svg>
  );
}
