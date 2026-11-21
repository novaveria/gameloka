// Avatar teman sekelas: huruf awal nama panggilan di lingkaran berwarna. Tidak memakai foto (pengguna di bawah umur).
const WARNA = ['#C0392B', '#1E8449', '#1F6FA3', '#B35309', '#117864', '#922B21'];

export function Avatar({ nama, ukuran = 40 }: { nama: string; ukuran?: number }) {
  let h = 0;
  for (const c of nama) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return (
    <span
      className="avatar"
      aria-hidden="true"
      style={{ width: ukuran, height: ukuran, background: WARNA[h % WARNA.length], fontSize: ukuran * 0.45 }}
    >
      {nama.trim().charAt(0).toUpperCase()}
    </span>
  );
}
