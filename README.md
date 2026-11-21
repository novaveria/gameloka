# Gameloka

Prototype web untuk belajar bahasa dan budaya Betawi bagi siswa SMP di Jakarta. Dibangun ulang mengikuti `DESIGN.md` untuk Budaya Go! 2026.

## Menjalankan

Butuh Node.js 22.18 atau lebih baru. Server tidak memakai dependensi luar.

```bash
npm install
npm run dev          # server API (port 8787) + Vite (port 5173)
```

Buka http://localhost:5173. Dasbor guru ada di http://localhost:5173/#/guru.

Untuk demo atau produksi:

```bash
npm run build
GAMELOKA_IZINKAN_DRAF=1 npm start    # http://localhost:8787
```

| Variabel | Bawaan | Arti |
| --- | --- | --- |
| `PORT` | `8787` | Port server |
| `GAMELOKA_DATA` | `data/db.json` | Berkas penyimpanan siswa, kelas, laporan, cerita |
| `GAMELOKA_IZINKAN_DRAF` | aktif saat dev, mati saat `npm start` | `1` = konten tanpa validasi LKB ikut tampil, dengan tanda "Mode draf" di aplikasi |

## Mode draf dan validasi LKB

Semua konten ada di `konten/*.json`. Setiap butir (soal, kisah, kartu, artikel, kalimat pujian) punya kolom `validator` dan `tanggal_validasi`. **Saat ini semuanya masih `null`.**

- Mode draf mati: butir tanpa kedua kolom itu tidak dikirim ke aplikasi sama sekali (DESIGN.md 11).
- Mode draf aktif: butir tetap tampil, dan aplikasi memasang catatan "Mode draf" di jalur belajar dan kolom kanan. Catatan ini hilang sendiri begitu semua butir tervalidasi.

Alur validasi: validator mengisi `"validator": "Nama, LKB"` dan `"tanggal_validasi": "2026-12-01"`, lalu jalankan `npm run cek`. Skrip ini memeriksa struktur (jawaban ada di pilihan, pantun punya satu rumpang, id unik) dan menghitung berapa butir yang sudah tervalidasi.

Kata yang perlu diperhatikan validator: *ente*, *rume*, *ame*, *nyang*, *encang/encing*, dan semua pantun. Pantun ditulis tim, bukan pantun tradisional yang sudah dikenal.

## Yang sudah berfungsi

- Onboarding lima langkah, tanpa email, telepon, umur, atau foto. Siswa mendapat **kode masuk 6 huruf** untuk membuka akunnya di perangkat lain.
- Jalur belajar tiga bagian (Kemayoran, Condet, Setu Babakan) dengan simpul terkunci, sekarang, selesai, ulasan, dan simpul kisah.
- Lima tipe soal: susun kalimat, pilih arti, dengar dan pilih, lengkapi pantun, cocokkan pasangan.
- Umpan balik per soal, kombo, soal salah diulang sekali di akhir, laporan soal ke antrean validator.
- Layar hasil (XP, akurasi, waktu, bintang, tinjau jawaban), layar streak, layar naik level.
- Kisah interaktif dengan "lihat arti" dan titik pilihan, memberi XP, kartu koleksi, dan lencana bagian.
- Arena Jawara mode Bertarung (timer 10 detik, bonus cepat) dan Latihan, dengan perubahan posisi di peringkat.
- Peringkat kelas mingguan (reset Senin, waktu Jakarta), baris sendiri menempel saat digulir.
- Peta Budaya, Pustaka dengan pencarian dan filter, artikel dengan dua soal.
- Profil: avatar dengan aksesori per level, kartu streak tiga keadaan, grafik mingguan vs rata-rata kelas, lencana, koleksi kartu (siluet untuk yang belum), Cerita Kami dengan moderasi.
- Misi Harian dengan peti hadiah, panel streak dengan kalender bulan ini.
- Dasbor guru: buat kelas, lihat progres siswa, moderasi cerita.
- XP, progres, streak, dan skor disimpan di server, bukan di perangkat. Hasil pelajaran yang gagal terkirim saat offline diantrekan dan dikirim ulang.

Diuji otomatis di Chromium 360×760: seluruh alur dari onboarding sampai kisah, dua siswa di dua perangkat, masuk ulang dari perangkat ketiga, tanpa error JavaScript, tanpa geser horizontal, kontras teks ≥ 4,5:1, target sentuh ≥ 44 px.

## Belum selesai, dan risikonya

1. **Belum ada satu pun konten yang divalidasi LKB.** Kosakata dan fakta budaya ditulis tim pengembang sebagai draf. Jangan demokan tanpa catatan draf sebelum validasi selesai.
2. **Belum ada audio penutur asli.** Di mode draf, soal "dengar dan pilih" memakai suara sintetis peramban, dengan label "Suara sementara (sintetis)". Di mode non-draf, soal tanpa rekaman disembunyikan. Rekaman ditaruh di `public/audio/` dan dirujuk di kolom `audio`.
3. **Maskot memakai cadangan.** Ondel-ondel cilik dari brief butuh persetujuan LKB karena makna ritualnya. Prototype memakai anak Betawi berpeci, baju sadariah, dan sarung di bahu. Semua gambar maskot ada di `src/komponen/Maskot.tsx`.
4. **Nama level** (Bocah, Jawara Muda, Jago, Abang/Mpok) dan kalimat pujian ("Mantap!", "Jempolan!", dan lainnya) masih usulan.
5. **Penyimpanan satu berkas JSON.** Cukup untuk demo satu atau beberapa kelas di satu server. Untuk banyak sekolah, pindahkan ke basis data (SQLite atau Postgres). Hosting gratis yang menghapus disk saat restart akan menghapus data siswa, jadi pastikan disk persisten.
6. **XP dihitung server dari hasil yang dilaporkan aplikasi.** Siswa yang paham teknis bisa memalsukan skor lewat API. Untuk lomba kelas ini cukup. Untuk skala besar, server perlu menilai jawaban sendiri.
7. **Kode masuk adalah satu-satunya kunci akun.** Kalau hilang, progres tidak bisa dipulihkan kecuali lewat data server. Guru sebaiknya mencatat kode siswanya.

## Struktur

```
konten/      Kosakata, soal, kisah, kartu, artikel (JSON, dengan kolom validasi)
server/      API Node tanpa dependensi + penyimpanan JSON
shared/      Aturan XP, level, misi, tanggal Jakarta, dan tipe data
src/         Aplikasi React
  komponen/  Ikon, maskot, ilustrasi, soal, umpan balik, kerangka navigasi
  layar/     Onboarding, Belajar, Pelajaran, Arena, Peringkat, Jelajah, Kisah, Profil, Guru
scripts/     Runner pengembangan dan pemeriksa konten
```

Semua ikon, maskot, dan ilustrasi digambar untuk proyek ini sebagai SVG. Tidak ada aset, nama, atau maskot dari aplikasi referensi. Huruf: Nunito (SIL Open Font License), di-host sendiri lewat `@fontsource-variable/nunito`.
