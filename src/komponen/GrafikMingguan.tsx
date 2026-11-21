// Grafik garis XP harian siswa vs rata-rata kelas, Senin–Minggu (DESIGN.md 8.11).
// Satu sumbu, dua seri dengan legenda + label langsung, garis putus-putus untuk kelas (bukan warna saja),
// tooltip saat diketuk/disorot, dan tabel untuk pembaca layar.
import { useState } from 'react';
import { NAMA_HARI } from '../../shared/aturan.ts';

interface Titik {
  tanggal: string;
  saya: number;
  kelas: number | null;
}

const W = 340;
const H = 200;
const P = { kiri: 34, kanan: 16, atas: 16, bawah: 28 };
const MERAH = '#C0392B';
const BIRU = '#1F6FA3';

export function GrafikMingguan({ data, hariIni }: { data: Titik[]; hariIni: string }) {
  const [sorot, setSorot] = useState<number | null>(null);
  const adaKelas = data.some((d) => d.kelas !== null);
  const iHariIni = data.findIndex((d) => d.tanggal === hariIni);
  const batas = iHariIni < 0 ? data.length - 1 : iHariIni;
  const maks = Math.max(40, ...data.map((d) => Math.max(d.saya, d.kelas ?? 0)));
  const atasSkala = [40, 60, 80, 100, 120, 160, 200, 300, 400, 500, 600, 800, 1000, 1200, 1600, 2000].find((n) => n >= maks) ?? Math.ceil(maks / 500) * 500;
  const x = (i: number) => P.kiri + (i * (W - P.kiri - P.kanan)) / 6;
  const y = (v: number) => H - P.bawah - (v / atasSkala) * (H - P.atas - P.bawah);
  const garis = (f: (d: Titik) => number | null) =>
    data
      .slice(0, batas + 1)
      .map((d, i) => {
        const v = f(d);
        return v === null ? '' : `${i === 0 ? 'M' : 'L'}${x(i)} ${y(v)}`;
      })
      .join(' ');
  const total = data.reduce((a, d) => a + d.saya, 0);
  const s = sorot !== null ? data[sorot] : null;

  return (
    <figure className="grafik">
      <div className="grafik__legenda" aria-hidden="true">
        <span>
          <i style={{ background: MERAH }} /> Kamu
        </span>
        {adaKelas && (
          <span>
            <i className="grafik__putus" style={{ borderColor: BIRU }} /> Rata-rata kelas
          </span>
        )}
      </div>
      <div className="grafik__kanvas">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`XP harian minggu ini. Total kamu ${total} XP.`} onMouseLeave={() => setSorot(null)}>
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={P.kiri} x2={W - P.kanan} y1={y(atasSkala * t)} y2={y(atasSkala * t)} stroke="#E5E7EB" strokeWidth="1" />
              <text x={P.kiri - 6} y={y(atasSkala * t) + 4} textAnchor="end" fontSize="11" fill="#5D6D7E">
                {atasSkala * t}
              </text>
            </g>
          ))}
          {data.map((d, i) => (
            <text key={d.tanggal} x={x(i)} y={H - 8} textAnchor="middle" fontSize="12" fontWeight={i === iHariIni ? 800 : 600} fill={i === iHariIni ? '#2C3E50' : '#5D6D7E'}>
              {NAMA_HARI[i]}
            </text>
          ))}
          {sorot !== null && <line x1={x(sorot)} x2={x(sorot)} y1={P.atas} y2={H - P.bawah} stroke="#A6ACAF" strokeWidth="1" />}
          {adaKelas && <path d={garis((d) => d.kelas)} stroke={BIRU} strokeWidth="2" strokeDasharray="5 4" fill="none" strokeLinejoin="round" />}
          <path d={garis((d) => d.saya)} stroke={MERAH} strokeWidth="2" fill="none" strokeLinejoin="round" />
          {data.slice(0, batas + 1).map((d, i) => (
            <g key={d.tanggal}>
              {adaKelas && d.kelas !== null && (sorot === i || i === batas) && <circle cx={x(i)} cy={y(d.kelas)} r="4.5" fill={BIRU} stroke="#FFFFFF" strokeWidth="2" />}
              {(sorot === i || i === batas) && <circle cx={x(i)} cy={y(d.saya)} r="5" fill={MERAH} stroke="#FFFFFF" strokeWidth="2" />}
            </g>
          ))}
          {data.map((d, i) => (
            <rect
              key={`hit-${d.tanggal}`}
              x={x(i) - 22}
              y={P.atas}
              width="44"
              height={H - P.atas - P.bawah}
              fill="transparent"
              onMouseEnter={() => setSorot(i <= batas ? i : null)}
              onClick={() => setSorot(i <= batas ? i : null)}
            />
          ))}
        </svg>
        {s && sorot !== null && (
          <div className="grafik__tip" style={{ left: `${(x(sorot) / W) * 100}%` }} role="status">
            <p className="grafik__tip-hari">{NAMA_HARI[sorot]}</p>
            <p>
              <i style={{ background: MERAH }} /> Kamu: {s.saya} XP
            </p>
            {s.kelas !== null && (
              <p>
                <i style={{ background: BIRU }} /> Kelas: {s.kelas} XP
              </p>
            )}
          </div>
        )}
      </div>
      <figcaption className="sr-only">
        <table>
          <thead>
            <tr>
              <th>Hari</th>
              <th>Kamu (XP)</th>
              {adaKelas && <th>Rata-rata kelas (XP)</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={d.tanggal}>
                <td>{NAMA_HARI[i]}</td>
                <td>{i <= batas ? d.saya : '-'}</td>
                {adaKelas && <td>{i <= batas ? d.kelas : '-'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
      {!adaKelas && <p className="teks-abu grafik__catatan">Garis rata-rata kelas muncul setelah ada teman sekelas yang bergabung.</p>}
    </figure>
  );
}
