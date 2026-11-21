// Ikon UI berwarna dengan isi solid (DESIGN.md 9.4). Digambar sendiri, tidak memakai emoji atau aset pihak lain.
import type { SVGProps } from 'react';

export type NamaIkon =
  | 'api' | 'xp' | 'kartu' | 'belajar' | 'arena' | 'peringkat' | 'jelajah' | 'profil'
  | 'gembok' | 'centang' | 'silang' | 'bendera' | 'audio' | 'peti' | 'peti-buka' | 'bintang'
  | 'tutup' | 'kembali' | 'buku' | 'pena' | 'gerbang' | 'cari' | 'jam' | 'target' | 'lencana'
  | 'pelan' | 'keluar' | 'naik' | 'turun' | 'sama';

interface Props extends SVGProps<SVGSVGElement> {
  nama: NamaIkon;
  ukuran?: number;
  warna?: string;
}

export function Ikon({ nama, ukuran = 24, warna, ...rest }: Props) {
  const p = { width: ukuran, height: ukuran, viewBox: '0 0 24 24', 'aria-hidden': true, focusable: false, ...rest } as const;
  switch (nama) {
    case 'api':
      return (
        <svg {...p}>
          <path d="M12.6 1.8c.6 3.3 5.9 5.6 5.9 11.4A6.5 6.5 0 0 1 5.5 13.6c0-2.6 1.2-4.4 2.6-5.6.2 1.9 1 3.1 2.2 3.5-.6-3.7.4-7 2.3-9.7z" fill={warna ?? '#E67E22'} />
          <path d="M12.3 10.6c.4 2 3.2 3 3.2 5.9a3.4 3.4 0 0 1-6.8.1c0-1.6.9-2.6 1.6-3.2.2 1 .6 1.5 1.2 1.7-.3-1.7.1-3.2.8-4.5z" fill="#F1C40F" />
        </svg>
      );
    case 'xp':
      return (
        <svg {...p}>
          <path d="M13.8 1.5 4.6 13.3h6.1l-1.3 9.2 9.3-12.2h-6.2z" fill={warna ?? '#F1C40F'} stroke="#C99A06" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case 'kartu':
      return (
        <svg {...p}>
          <rect x="7.5" y="2.5" width="12" height="16" rx="2.5" transform="rotate(10 13.5 10.5)" fill="#1F6FA3" />
          <rect x="4" y="4.5" width="12" height="16" rx="2.5" fill={warna ?? '#C0392B'} />
          <path d="m10 8.6 1.1 2.3 2.5.3-1.8 1.7.5 2.5-2.3-1.2-2.2 1.2.4-2.5-1.8-1.7 2.5-.3z" fill="#F1C40F" />
        </svg>
      );
    case 'belajar':
      return (
        <svg {...p}>
          <path d="M2.5 11.5 12 3.5l9.5 8z" fill="#C0392B" />
          <path d="M1.8 12.2c3-.3 4.6-.9 6.3-2.1M22.2 12.2c-3-.3-4.6-.9-6.3-2.1" stroke="#922B21" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <rect x="5" y="11.5" width="14" height="9.5" rx="1" fill="#F1C40F" />
          <rect x="10" y="14.5" width="4" height="6.5" rx="1" fill="#2C3E50" />
        </svg>
      );
    case 'arena':
      return (
        <svg {...p}>
          <path d="M12 2 4 5v6.5c0 5 3.4 9 8 10.5 4.6-1.5 8-5.5 8-10.5V5z" fill={warna ?? '#E67E22'} />
          <path d="M12.9 6.5 8.8 12.7h3l-.8 4.8 4.2-6.4h-3z" fill="#FFFFFF" />
        </svg>
      );
    case 'peringkat':
      return (
        <svg {...p}>
          <path d="M6 3h12v5a6 6 0 0 1-12 0z" fill="#F1C40F" />
          <path d="M6 5H3v2a4 4 0 0 0 4 4M18 5h3v2a4 4 0 0 1-4 4" stroke="#C99A06" strokeWidth="2" fill="none" />
          <path d="M10.5 13.5h3V17h-3z" fill="#C99A06" />
          <rect x="7" y="17" width="10" height="4" rx="1.2" fill="#C0392B" />
        </svg>
      );
    case 'jelajah':
      return (
        <svg {...p}>
          <path d="m2.5 5.5 6-2.5 7 2.5 6-2.5v15.5l-6 2.5-7-2.5-6 2.5z" fill="#16A085" />
          <path d="m8.5 3v15.5M15.5 5.5V21" stroke="#0E6655" strokeWidth="1.6" />
          <circle cx="12" cy="10" r="2.6" fill="#F1C40F" />
        </svg>
      );
    case 'profil':
      return (
        <svg {...p}>
          <circle cx="12" cy="13" r="8.5" fill="#E8B48A" />
          <path d="M5.5 8.5h13v-3a2 2 0 0 0-2-2h-9a2 2 0 0 0-2 2z" fill="#2C3E50" />
          <circle cx="9" cy="13" r="1.3" fill="#2C3E50" />
          <circle cx="15" cy="13" r="1.3" fill="#2C3E50" />
          <path d="M9.5 16.5c1.5 1.2 3.5 1.2 5 0" stroke="#2C3E50" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'gembok':
      return (
        <svg {...p}>
          <path d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10" stroke={warna ?? '#A6ACAF'} strokeWidth="2.6" fill="none" />
          <rect x="5" y="10" width="14" height="11" rx="2.5" fill={warna ?? '#A6ACAF'} />
        </svg>
      );
    case 'centang':
      return (
        <svg {...p}>
          <path d="m5 12.5 4.5 4.5L19 7.5" stroke={warna ?? 'currentColor'} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'silang':
    case 'tutup':
      return (
        <svg {...p}>
          <path d="m6 6 12 12M18 6 6 18" stroke={warna ?? 'currentColor'} strokeWidth={nama === 'tutup' ? 2.6 : 3.2} strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'bendera':
      return (
        <svg {...p}>
          <path d="M5.5 21V3.5M5.5 4.5h11l-2.5 4 2.5 4h-11" stroke={warna ?? 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'audio':
      return (
        <svg {...p}>
          <path d="M3.5 9h3.5L12 4.5v15L7 15H3.5z" fill={warna ?? '#FFFFFF'} />
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" stroke={warna ?? '#FFFFFF'} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'pelan':
      return (
        <svg {...p}>
          <path d="M4 15c0-4 3-7 7-7s7 3 7 7z" fill={warna ?? '#FFFFFF'} />
          <path d="M18 13.5h2.5a1.5 1.5 0 0 0 0-3H19M6 15v2.5M15 15v2.5" stroke={warna ?? '#FFFFFF'} strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'peti':
    case 'peti-buka':
      return (
        <svg {...p}>
          {nama === 'peti' ? (
            <path d="M3 10V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2z" fill="#E67E22" />
          ) : (
            <path d="M4 9.5 5.5 3.6a2 2 0 0 1 2.4-1.4l11 2.8a2 2 0 0 1 1.4 2.4L19.5 9.5z" fill="#E67E22" />
          )}
          <rect x="3" y="10" width="18" height="10.5" rx="2" fill="#A0522D" />
          <path d="M3 13h18" stroke="#7B3F1E" strokeWidth="1.5" />
          <rect x="10" y="11" width="4" height="5" rx="1" fill="#F1C40F" />
        </svg>
      );
    case 'bintang':
      return (
        <svg {...p}>
          <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z" fill={warna ?? '#F1C40F'} stroke={warna ? 'none' : '#C99A06'} strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );
    case 'kembali':
      return (
        <svg {...p}>
          <path d="M15 5 8 12l7 7" stroke={warna ?? 'currentColor'} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'buku':
      return (
        <svg {...p}>
          <path d="M3 5.5c3-1.5 6-1.5 9 .5v14c-3-2-6-2-9-.5z" fill={warna ?? '#FFFFFF'} />
          <path d="M21 5.5c-3-1.5-6-1.5-9 .5v14c3-2 6-2 9-.5z" fill={warna ?? '#FFFFFF'} opacity="0.8" />
        </svg>
      );
    case 'pena':
      return (
        <svg {...p}>
          <path d="m15 4.5 4.5 4.5L9 19.5 3.5 20.5l1-5.5z" fill={warna ?? '#FFFFFF'} />
          <path d="m13 6.5 4.5 4.5" stroke="rgba(0,0,0,.2)" strokeWidth="1.6" />
        </svg>
      );
    case 'gerbang':
      return (
        <svg {...p}>
          <path d="M3 21V9.5L12 3l9 6.5V21h-5v-6.5a4 4 0 0 0-8 0V21z" fill={warna ?? '#FFFFFF'} />
        </svg>
      );
    case 'cari':
      return (
        <svg {...p}>
          <circle cx="10.5" cy="10.5" r="6" stroke={warna ?? 'currentColor'} strokeWidth="2.6" fill="none" />
          <path d="m15 15 5 5" stroke={warna ?? 'currentColor'} strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case 'jam':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" fill={warna ?? '#1F6FA3'} />
          <path d="M12 7v5l3.5 2" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'target':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" fill={warna ?? '#1E8449'} />
          <circle cx="12" cy="12" r="5.5" fill="#FFFFFF" />
          <circle cx="12" cy="12" r="2.5" fill={warna ?? '#1E8449'} />
        </svg>
      );
    case 'lencana':
      return (
        <svg {...p}>
          <path d="M7 2h10l-2 6H9z" fill="#C0392B" />
          <circle cx="12" cy="14.5" r="7" fill={warna ?? '#F1C40F'} />
          <path d="m12 10.5 1.3 2.6 2.8.4-2 2 .5 2.8-2.6-1.4-2.5 1.4.5-2.8-2-2 2.8-.4z" fill="#FFFFFF" />
        </svg>
      );
    case 'keluar':
      return (
        <svg {...p}>
          <path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" stroke={warna ?? 'currentColor'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'naik':
    case 'turun':
      return (
        <svg {...p} style={nama === 'turun' ? { transform: 'rotate(180deg)' } : undefined}>
          <path d="M12 5 4 15h16z" fill={warna ?? (nama === 'naik' ? '#1E8449' : '#C0392B')} />
        </svg>
      );
    case 'sama':
      return (
        <svg {...p}>
          <rect x="5" y="10.5" width="14" height="3" rx="1.5" fill={warna ?? '#5D6D7E'} />
        </svg>
      );
  }
}
