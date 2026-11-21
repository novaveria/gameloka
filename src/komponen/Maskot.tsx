// Maskot Gameloka dan tokoh kisah. Gaya vektor datar, garis tebal, bentuk membulat (DESIGN.md 7, 9.4).
//
// Catatan keputusan: brief mengusulkan ondel-ondel cilik, tetapi ondel-ondel punya makna ritual dan
// desainnya wajib disetujui LKB. Sampai ada persetujuan, prototype memakai cadangan yang disebut brief:
// anak Betawi berpeci dengan baju sadariah dan sarung di bahu. Semua gambar maskot ada di berkas ini,
// jadi menggantinya cukup di satu tempat.
import { useId } from 'react';

export type Ekspresi = 'netral' | 'senang' | 'bangga' | 'cemas' | 'kaget' | 'semangat';
export type Varian = 'anak' | 'jali' | 'ipah' | 'mamat';

interface Props {
  ekspresi?: Ekspresi;
  varian?: Varian;
  ukuran?: number;
  level?: number;
  className?: string;
  label?: string;
}

const TINTA = '#2C3E50';
const KULIT = '#E8B48A';
const GARIS = 3.5;

export function Maskot({ ekspresi = 'senang', varian = 'anak', ukuran = 120, level = 1, className, label }: Props) {
  const id = useId().replace(/:/g, '');
  const baju = varian === 'jali' ? '#C0392B' : varian === 'ipah' ? '#FFFFFF' : '#FFFFFF';
  const sarungA = varian === 'mamat' ? '#1F6FA3' : varian === 'jali' ? '#F1C40F' : '#C0392B';
  const sarungB = varian === 'mamat' ? '#DDEEF9' : varian === 'jali' ? '#1E8449' : '#F1C40F';
  const lenganNaik = ekspresi === 'semangat' || ekspresi === 'senang' || ekspresi === 'bangga';

  return (
    <svg
      width={ukuran}
      height={ukuran * 1.25}
      viewBox="0 0 120 150"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <pattern id={`kotak-${id}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <rect width="10" height="10" fill={sarungA} />
          <rect width="5" height="10" fill={sarungB} opacity="0.85" />
          <rect width="10" height="5" fill={sarungB} opacity="0.55" />
        </pattern>
      </defs>

      {/* Lengan kiri (selalu turun) */}
      <path d="M33 108 L23 133" stroke={TINTA} strokeWidth="16" strokeLinecap="round" />
      <path d="M33 108 L23 133" stroke={baju} strokeWidth="9" strokeLinecap="round" />
      <circle cx="22" cy="136" r="7" fill={KULIT} stroke={TINTA} strokeWidth={GARIS} />

      {/* Lengan kanan */}
      {lenganNaik ? (
        <>
          <path d="M87 106 L103 82" stroke={TINTA} strokeWidth="16" strokeLinecap="round" />
          <path d="M87 106 L103 82" stroke={baju} strokeWidth="9" strokeLinecap="round" />
          <circle cx="105" cy="77" r="8" fill={KULIT} stroke={TINTA} strokeWidth={GARIS} />
        </>
      ) : (
        <>
          <path d="M87 108 L97 133" stroke={TINTA} strokeWidth="16" strokeLinecap="round" />
          <path d="M87 108 L97 133" stroke={baju} strokeWidth="9" strokeLinecap="round" />
          <circle cx="98" cy="136" r="7" fill={KULIT} stroke={TINTA} strokeWidth={GARIS} />
        </>
      )}

      {/* Badan */}
      <path d="M30 148 V114 a24 24 0 0 1 24-24 h12 a24 24 0 0 1 24 24 V148 Z" fill={baju} stroke={TINTA} strokeWidth={GARIS} strokeLinejoin="round" />
      {varian === 'ipah' ? (
        <path d="M32 136 H88" stroke="#F1C40F" strokeWidth="6" />
      ) : (
        <>
          <path d="M60 92 V140" stroke={TINTA} strokeWidth="2" opacity="0.5" />
          <circle cx="60" cy="104" r="1.8" fill={TINTA} />
          <circle cx="60" cy="114" r="1.8" fill={TINTA} />
          <circle cx="60" cy="124" r="1.8" fill={TINTA} />
        </>
      )}

      {/* Sarung di bahu */}
      {varian !== 'ipah' && (
        <path d="M40 94 L50 92 L90 140 L90 148 L80 148 Z" fill={`url(#kotak-${id})`} stroke={TINTA} strokeWidth="3" strokeLinejoin="round" />
      )}
      {varian === 'anak' && level >= 4 && (
        <path d="M80 94 L70 92 L32 140 L32 148 L40 148 Z" fill="#C0392B" stroke={TINTA} strokeWidth="3" strokeLinejoin="round" />
      )}
      {varian === 'anak' && level >= 2 && (
        <g>
          <circle cx="44" cy="118" r="6.5" fill="#F1C40F" stroke={TINTA} strokeWidth="2.5" />
          <path d="m44 114.5 1 2.2 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z" fill="#FFFFFF" />
        </g>
      )}

      {/* Kerudung Mpok Ipah (di belakang kepala) */}
      {varian === 'ipah' && (
        <path d="M22 62 a38 40 0 0 1 76 0 V92 Q60 104 22 92 Z" fill="#1E8449" stroke={TINTA} strokeWidth={GARIS} strokeLinejoin="round" />
      )}

      {/* Telinga + kepala */}
      {varian !== 'ipah' && (
        <>
          <circle cx="27" cy="62" r="7" fill={KULIT} stroke={TINTA} strokeWidth={GARIS} />
          <circle cx="93" cy="62" r="7" fill={KULIT} stroke={TINTA} strokeWidth={GARIS} />
        </>
      )}
      <circle cx="60" cy="60" r="33" fill={KULIT} stroke={TINTA} strokeWidth={GARIS} />

      {/* Janggut Engkong */}
      {varian === 'mamat' && (
        <path d="M38 74 Q42 98 60 100 Q78 98 82 74 Q74 86 60 86 Q46 86 38 74 Z" fill="#FFFFFF" stroke={TINTA} strokeWidth="3" strokeLinejoin="round" />
      )}

      {/* Peci */}
      {varian !== 'ipah' && (
        <>
          <path d="M31 40 L34 19 Q60 12 86 19 L89 40 Q60 34 31 40 Z" fill={varian === 'mamat' ? '#FFFFFF' : TINTA} stroke={TINTA} strokeWidth="3" strokeLinejoin="round" />
          {varian === 'anak' && level >= 3 && <path d="M32.5 34 Q60 28 87.5 34" stroke="#F1C40F" strokeWidth="3.5" fill="none" />}
        </>
      )}
      {varian === 'ipah' && <path d="M27 50 Q60 22 93 50" stroke={TINTA} strokeWidth="3" fill="none" opacity="0.35" />}

      {/* Pipi */}
      <ellipse cx="40" cy="71" rx="6" ry="4" fill="#E74C3C" opacity="0.28" />
      <ellipse cx="80" cy="71" rx="6" ry="4" fill="#E74C3C" opacity="0.28" />

      <Wajah ekspresi={ekspresi} />

      {/* Kumis Bang Jali */}
      {varian === 'jali' && <path d="M48 72 Q54 68 60 71 Q66 68 72 72 Q66 75 60 73 Q54 75 48 72 Z" fill={TINTA} />}

      {ekspresi === 'cemas' && (
        <path d="M90 36 q5 7 0 11 q-5 -4 0 -11 Z" fill="#AED6F1" stroke={TINTA} strokeWidth="2" strokeLinejoin="round" />
      )}
      {ekspresi === 'bangga' && (
        <g fill="#F1C40F" stroke="#C99A06" strokeWidth="1">
          <path d="m12 30 2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2z" />
          <path d="m108 18 1.6 3.4 3.4 1.6-3.4 1.6-1.6 3.4-1.6-3.4-3.4-1.6 3.4-1.6z" />
        </g>
      )}
    </svg>
  );
}

function Wajah({ ekspresi }: { ekspresi: Ekspresi }) {
  const mata = (cx: number) => {
    switch (ekspresi) {
      case 'bangga':
        return <path key={cx} d={`M${cx - 6} 62 Q${cx} 54 ${cx + 6} 62`} stroke={TINTA} strokeWidth="3.5" strokeLinecap="round" fill="none" />;
      case 'kaget':
        return (
          <g key={cx}>
            <circle cx={cx} cy="58" r="7.5" fill="#FFFFFF" stroke={TINTA} strokeWidth="2.5" />
            <circle cx={cx} cy="58" r="3.5" fill={TINTA} />
          </g>
        );
      default:
        return (
          <g key={cx}>
            <ellipse cx={cx} cy="59" rx="4.6" ry="5.8" fill={TINTA} />
            <circle cx={cx + 1.6} cy="56.8" r="1.6" fill="#FFFFFF" />
          </g>
        );
    }
  };
  const alis =
    ekspresi === 'cemas' ? (
      <g stroke={TINTA} strokeWidth="3" strokeLinecap="round">
        <path d="M40 50 L51 46" />
        <path d="M80 50 L69 46" />
      </g>
    ) : ekspresi === 'semangat' ? (
      <g stroke={TINTA} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M40 49 Q46 43 52 48" />
        <path d="M68 48 Q74 43 80 49" />
      </g>
    ) : null;
  const mulut = (() => {
    switch (ekspresi) {
      case 'netral':
        return <path d="M52 76 Q60 81 68 76" stroke={TINTA} strokeWidth="3" strokeLinecap="round" fill="none" />;
      case 'kaget':
        return <ellipse cx="60" cy="79" rx="5" ry="6" fill="#922B21" stroke={TINTA} strokeWidth="2.5" />;
      case 'cemas':
        return <path d="M50 80 q5 -4 10 0 t10 0" stroke={TINTA} strokeWidth="3" strokeLinecap="round" fill="none" />;
      default:
        return (
          <path d={ekspresi === 'semangat' || ekspresi === 'bangga' ? 'M47 73 Q60 90 73 73 Z' : 'M50 74 Q60 86 70 74 Z'} fill="#922B21" stroke={TINTA} strokeWidth="2.5" strokeLinejoin="round" />
        );
    }
  })();
  return (
    <g>
      {alis}
      {mata(47)}
      {mata(73)}
      {mulut}
    </g>
  );
}
