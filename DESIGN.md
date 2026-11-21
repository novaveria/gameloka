# DESIGN.md — Gameloka

Brief untuk membangun ulang prototype web Gameloka. Dokumen ini menggantikan arah desain versi Figma Make sebelumnya. Kalau ada konflik antara brief ini dan prototype lama, ikuti brief ini.

**Arah gaya:** pola interaksi dan bentuk komponen mengikuti aplikasi belajar bahasa bergaya Duolingo (referensi tangkapan layar dari tim). **Warna** tetap memakai palet UI web Gameloka yang sudah ada. Ambil polanya, bukan asetnya: maskot burung hantu, logo, nama "Duolingo", ilustrasi, dan istilah mereknya tidak boleh dipakai atau ditiru.

## 1. Produk dalam satu paragraf

Gameloka adalah web app untuk belajar bahasa dan budaya Betawi bagi siswa SMP di Jakarta. Siswa belajar dalam potongan singkat, menguji diri lewat kuis, mengumpulkan XP, membuka lokasi budaya di Jakarta, dan bersaing dengan teman sekelas. Semua kosakata dan narasi divalidasi oleh Lembaga Kebudayaan Betawi (LKB). Produk ini dinilai di Budaya Go! 2026, jadi prototype harus benar-benar berfungsi saat didemokan, bukan sekadar mockup.

## 2. Pengguna dan konteks pakai

- **Pengguna utama:** siswa SMP kelas 7–9, umur 12–15 tahun.
- **Perangkat:** ponsel Android kelas menengah ke bawah, layar sekitar 360 × 760 px, koneksi tidak selalu stabil.
- **Situasi:** sesi pendek 5–10 menit, di kelas saat dipandu guru atau di rumah.
- **Pengguna kedua:** guru Seni Budaya atau Prakarya yang ingin melihat progres kelasnya (lihat bagian 11).

## 3. Prinsip desain

1. **Mobile-first.** Desain di 360 px dulu, lalu lebarkan ke tablet dan desktop.
2. **Satu layar, satu tugas.** Pelajaran, pertanyaan onboarding, dan umpan balik masing-masing mengisi satu layar dengan satu tombol utama di bawah.
3. **Semua aktivitas memberi XP.** Belajar, kuis, membaca, dan menjelajah saling terhubung lewat satu sistem poin.
4. **Rayakan kemajuan sekecil apa pun.** Jawaban benar, streak, dan level baru selalu diberi momen visual singkat.
5. **Betawi terlihat, bukan hanya disebut.** Maskot, ilustrasi, dan istilah UI berakar pada budaya Betawi.
6. **Akurat dulu, baru menarik.** Konten yang belum divalidasi LKB tidak boleh tampil di aplikasi.

## 4. Struktur navigasi

**Ponsel:** navigasi bawah dengan lima ikon tanpa teks. Tab aktif diberi kotak bergaris warna dan latar terang.

| Tab | Isi |
| --- | --- |
| **Belajar** | Jalur belajar (lihat 8.3), titik awal aplikasi |
| **Arena** | Arena Jawara, kuis cepat |
| **Peringkat** | Peringkat kelas mingguan |
| **Jelajah** | Peta Budaya, kisah interaktif, dan Pustaka |
| **Profil** | XP, level, lencana, koleksi kartu, streak, Cerita Kami |

**Bar status atas (ponsel):** selalu tampil di tab Belajar dan Arena. Isinya, dari kiri: ikon streak + jumlah hari, ikon XP + total XP, ikon kartu + jumlah koleksi. Semua angka bisa diketuk untuk membuka detailnya.

**Desktop (≥ 1024 px):** tiga kolom.
- Kiri: sidebar dengan logo Gameloka dan lima menu. Setiap menu memakai ikon berwarna dan label huruf kapital tebal.
- Tengah: konten utama, lebar maksimal 600 px.
- Kanan: kolom samping berisi bar status, kartu Misi Harian, dan ringkasan peringkat kelas.

## 5. Loop inti

1. Siswa membuka **Belajar** dan melihat jalur. Simpul berikutnya berdenyut dengan label "MULAI".
2. Siswa mengerjakan satu **pelajaran** berisi 6–10 soal pendek: kata, audio, dan kalimat.
3. Setiap jawaban langsung mendapat **umpan balik**. Pelajaran selesai menampilkan layar hasil dan XP.
4. Simpul berubah menjadi **selesai** dan diberi 1–3 bintang sesuai akurasi.
5. Menyelesaikan satu **bagian** jalur membuka **kisah interaktif** di lokasi bagian itu dan memberi **kartu koleksi**.
6. XP masuk ke **peringkat kelas** mingguan, dan aktivitas harian menjaga **streak**.

Tidak ada tombol "Tandai Selesai". Penyelesaian selalu dibuktikan lewat soal.

## 6. Sistem gamifikasi

### XP

| Aktivitas | XP |
| --- | --- |
| Menyelesaikan satu pelajaran | 10 (+5 kalau tanpa salah) |
| Jawaban benar di Arena | 10 (+5 kalau dijawab dalam 5 detik pertama) |
| Membaca artikel Pustaka + menjawab 2 soal di akhir | 15 |
| Menyelesaikan satu kisah | 25 |
| Menuntaskan satu Misi Harian | sesuai misi |

### Level

| Level | XP minimal | Nama sementara |
| --- | --- | --- |
| 1 | 0 | Bocah |
| 2 | 200 | Jawara Muda |
| 3 | 600 | Jago |
| 4 | 1.200 | Abang / Mpok |

Nama level masih usulan. Nama final harus disetujui LKB.

### Elemen lain

- **Streak harian:** bertambah kalau siswa menyelesaikan minimal satu pelajaran per hari.
- **Target harian:** siswa memilih 10, 20, atau 30 XP per hari saat onboarding.
- **Misi Harian:** tiga misi kecil per hari, misalnya "Dapatkan 30 XP" atau "Selesaikan 2 pelajaran tanpa salah". Misi yang tuntas membuka peti hadiah berisi XP bonus.
- **Kombo:** label "3 berturut-turut" muncul di atas progress bar saat siswa menjawab benar tiga kali beruntun.
- **Bintang:** setiap simpul jalur mendapat 1–3 bintang sesuai akurasi. Simpul bisa diulang untuk menambah bintang.
- **Lencana dan kartu koleksi:** lencana per bagian jalur. Kartu koleksi berisi ikon budaya (ondel-ondel, kerak telor, gambang kromong, dan seterusnya) yang didapat dari kisah. Kartu yang belum didapat tampil sebagai siluet.
- **Peringkat:** per kelas, reset setiap Senin, baris siswa sendiri selalu disorot.
- **Tanpa nyawa (hearts).** Berbeda dari referensi, salah menjawab tidak menghentikan pelajaran. Siswa memakai Gameloka di kelas, dan siswa yang tertahan di tengah pelajaran akan tertinggal dari teman-temannya.

## 7. Maskot

- Gameloka butuh maskot orisinal yang muncul di jalur belajar, gelembung soal, layar streak, dan layar hasil. Pola ini meniru peran maskot di referensi, bukan bentuknya.
- Usulan: karakter **ondel-ondel cilik** dengan beberapa ekspresi: senang, bangga, cemas (streak hampir putus), kaget, dan semangat.
- Ondel-ondel punya makna ritual dalam budaya Betawi. **Desain dan cara penggambarannya wajib disetujui LKB** sebelum dipakai. Kalau tidak disetujui, siapkan cadangan, misalnya karakter anak Betawi berpakaian sadariah dan kebaya encim.
- Maskot digambar dalam gaya vektor datar dengan garis tebal dan bentuk membulat, sesuai gaya ilustrasi referensi.

## 8. Spesifikasi layar

### 8.1 Onboarding
Satu pertanyaan per layar. Tombol X di kiri atas, progress bar hijau di atas, dan tombol utama "LANJUT" di bawah yang aktif setelah siswa memilih atau mengisi.

1. Layar sambutan: maskot besar, logo Gameloka, satu kalimat ajakan, tombol "MULAI".
2. "Kenapa kamu belajar bahasa Betawi?" berupa daftar pilihan dengan ilustrasi: Tugas sekolah, Kenal budaya Jakarta, Ngobrol sama keluarga, Penasaran aja.
3. "Mau belajar berapa lama per hari?" dengan pilihan target 10, 20, atau 30 XP.
4. "Siapa nama panggilanmu?" berupa satu kolom teks.
5. "Masukkan kode kelas dari gurumu" berupa satu kolom teks pendek, dengan tautan "Belum punya kode" untuk belajar mandiri.

Jangan meminta email, nomor telepon, umur, atau foto. Pengguna adalah anak di bawah umur.

### 8.2 Bar status dan Misi Harian
- Bar status atas seperti di bagian 4.
- Mengetuk ikon streak membuka panel streak: jumlah hari, target XP hari ini (misalnya 10/20 XP), dan kalender bulan ini dengan hari aktif ditandai.
- Kartu Misi Harian berisi tiga misi. Setiap misi punya progress bar dan ikon peti di ujungnya.

### 8.3 Jalur belajar (tab Belajar)
Pengganti tampilan grid Kompas Belajar versi lama.

- Jalur vertikal yang berkelok, terdiri atas simpul bulat atau perisai. Ditaruh di atas ilustrasi latar lokasi.
- Jalur dibagi menjadi **bagian**. Setiap bagian punya banner berwarna di atas, misalnya "Bagian 1 · Sapaan Betawi".
- **Setiap bagian berlatar satu lokasi budaya:** Bagian 1 di Kemayoran, Bagian 2 di Condet, Bagian 3 di Setu Babakan. Dengan begitu, jalur belajar sekaligus menjadi perjalanan keliling Jakarta.
- Status simpul:
  - **Terkunci:** abu-abu dengan ikon gembok.
  - **Sekarang:** berwarna, berdenyut pelan, dengan label "MULAI" di atasnya.
  - **Selesai:** berwarna emas dengan 1–3 bintang.
  - **Ulasan:** ikon audio atau buku, untuk latihan ulang.
- Ujung setiap bagian adalah simpul **kisah** berbentuk peti atau gerbang, yang membuka kisah interaktif di lokasi tersebut.
- Maskot berdiri di samping jalur dekat simpul yang aktif.

### 8.4 Layar pelajaran
- **Atas:** tombol X, progress bar tebal berwarna hijau, label kombo di atas progress bar.
- **Tengah:** instruksi singkat bercetak tebal (misalnya "Terjemahkan kalimat ini"), lalu maskot dengan gelembung kata berisi teks Betawi dan tombol audio.
- **Bawah:** area jawaban.
- **Tombol "PERIKSA"** menempel di bawah layar dan abu-abu sampai siswa memilih jawaban.

Tipe soal, minimal lima:
1. **Susun kalimat:** ketuk ubin kata dari bank kata untuk menyusun terjemahan. Ubin bisa dikembalikan dengan diketuk lagi.
2. **Pilih arti:** satu kata Betawi, empat pilihan.
3. **Dengar dan pilih:** putar audio penutur, pilih kata yang diucapkan.
4. **Lengkapi pantun:** pilih kata yang tepat untuk baris pantun yang rumpang.
5. **Cocokkan pasangan:** dua kolom ubin, Betawi dan Indonesia.

### 8.5 Umpan balik jawaban
- Setelah "PERIKSA", panel naik dari bawah menutupi area tombol.
- **Benar:** panel hijau muda, ikon centang, judul "Mantap!" atau variasi pujian lain berbahasa Betawi yang disetujui LKB, tombol "LANJUT" hijau.
- **Salah:** panel merah muda, ikon silang, judul "Jawaban yang benar:", diikuti jawaban dan satu contoh kalimat, tombol "LANJUT" merah.
- Ikon bendera kecil untuk melaporkan soal yang dianggap keliru. Laporan masuk ke antrean validator.
- Soal yang salah diulang di akhir pelajaran.

### 8.6 Layar hasil pelajaran
- Maskot dengan ekspresi sesuai hasil.
- Tiga kotak statistik: total XP, akurasi (%), dan waktu.
- Jumlah bintang yang didapat.
- Tombol "LANJUT" kembali ke jalur, dan tautan "Tinjau jawaban".

### 8.7 Layar streak
- Muncul setelah pelajaran pertama hari itu.
- Ikon api besar, jumlah hari ("14 hari berturut-turut!"), deretan titik tujuh hari dengan centang untuk hari yang aktif, satu kalimat penyemangat, tombol "LANJUT".
- **Kartu streak di Profil** memakai latar warna penuh dan ekspresi maskot yang berubah sesuai keadaan:
  - Streak berjalan: latar gradien merah ke kuning, maskot bersemangat.
  - Streak terancam (belum belajar hari ini setelah pukul 18.00): latar biru, maskot cemas.
  - Streak 0: latar hijau, maskot mengajak mulai.

### 8.8 Arena Jawara
- Layar mulai: aturan main dan dua mode, **BERTARUNG** (timer 10 detik per soal) dan **LATIHAN** (tanpa timer).
- Soal memakai komponen yang sama dengan layar pelajaran, ditambah timer lingkaran di atas.
- Layar hasil: skor, XP, perubahan posisi di peringkat kelas, dan daftar soal yang salah.

### 8.9 Peringkat
- Judul minggu dan sisa hari sampai reset.
- Daftar 30-an siswa sekelas: nomor peringkat, avatar, nama panggilan, XP minggu ini.
- Tiga besar diberi warna emas, perak, dan perunggu.
- Baris siswa sendiri disorot dan tetap terlihat (menempel di bawah) saat daftar digulir.

### 8.10 Jelajah: Peta, kisah, dan Pustaka
- **Peta Budaya:** peta ilustrasi Jakarta dengan Kemayoran, Condet, dan Setu Babakan. Setiap lokasi berstatus terkunci, terbuka, atau selesai, mengikuti progres jalur belajar. Ada misi "Jelajahi Jakarta 1/3" di atas.
- **Kisah interaktif:** latar ilustrasi lokasi. Kotak dialog di bawah memuat nama karakter dan teks, dan keduanya tidak boleh saling menimpa. Dialog berbahasa Betawi dengan tombol "lihat arti". Ada 2–3 titik pilihan jawaban per kisah. Akhir kisah memberi kartu koleksi.
- **Pustaka:** daftar artikel dengan filter kategori dan pencarian. Halaman artikel penuh berisi gambar, nama validator, dan 2 soal di akhir.

### 8.11 Profil
- Avatar berbentuk maskot dengan aksesori yang bisa dibuka dari level.
- Nama panggilan, kelas, tanggal bergabung.
- Statistik: streak, total XP, level, jumlah kartu.
- **Grafik kemajuan mingguan:** garis XP harian siswa dibandingkan rata-rata kelas, Senin sampai Minggu.
- Lencana dan kartu koleksi.
- Akses ke Cerita Kami. Cerita masuk antrean moderasi dan baru tampil setelah disetujui.

## 9. Gaya visual

### 9.1 Palet warna (dari UI web Gameloka)

Warna di bawah diambil dari tangkapan layar UI web Gameloka. Setiap warna punya **satu peran tetap** di seluruh aplikasi. Jangan mengganti gradien latar di setiap halaman seperti di versi lama.

| Token | Hex | Asal di UI lama | Peran |
| --- | --- | --- | --- |
| `merah` | #C0392B | Menu aktif, label Sejarah, header peringkat | Warna merek, tombol "MULAI", tombol salah |
| `merah-tepi` | #922B21 | Turunan | Sisi bawah tombol merah |
| `jingga` | #E67E22 | Tengah gradien Arena | Ikon streak, api, aksen. Bukan untuk teks |
| `kuning` | #F1C40F | Ujung gradien, label Kuliner | XP, bintang, simpul selesai, peti. Bukan untuk teks |
| `hijau` | #27AE60 | Tombol Tutup, timer, menu Peta | Progress bar, ikon benar, simpul aktif. Bukan untuk teks |
| `hijau-tombol` | #1E8449 | Hijau digelapkan | Isi tombol "PERIKSA" dan "LANJUT", teks di panel benar |
| `hijau-tepi` | #145A32 | Turunan | Sisi bawah tombol hijau |
| `hijau-muda` | #E3F6EA | Turunan | Latar panel jawaban benar |
| `merah-muda` | #FDECEA | Turunan | Latar panel jawaban salah |
| `biru` | #2980B9 | Menu Pustaka, latar Peta | Pustaka, info, kartu streak terancam |
| `biru-teks` | #1F6FA3 | Biru digelapkan | Tautan dan teks biru |
| `teal` | #16A085 | Penanda peta | Lokasi di Peta Budaya |
| `krem` | #FAF3E0 | Panel dan kolom pencarian | Latar panel, kartu misi, bank kata |
| `putih` | #FFFFFF | Kartu | Latar utama layar dan kartu |
| `garis` | #E5E7EB | Turunan | Garis tepi kartu dan ubin |
| `tinta` | #2C3E50 | Ditambahkan | Teks utama |
| `abu` | #5D6D7E | Ditambahkan | Teks sekunder |
| `nonaktif` | #E5E7EB / #A6ACAF | Ditambahkan | Tombol nonaktif dan simpul terkunci |

**Gradien merek** `merah → jingga → kuning` (135°) dipakai hanya untuk momen spesial: layar sambutan, kartu streak, layar naik level, dan banner Arena. Teks di atas gradien harus diletakkan di bagian merah, atau di dalam kartu putih. Jangan menaruh teks putih di bagian kuning.

**Catatan kontras** (dihitung terhadap latar putih, standar minimal 4,5:1):
- Lolos: `merah` 5,4 · `hijau-tombol` 4,7 · `biru-teks` 5,4 · `tinta` 11,0 · `abu` sekitar 5,3.
- Tidak lolos untuk teks: `hijau` 2,9 · `jingga` 2,9 · `kuning` 1,7. Karena itu tombol hijau memakai `hijau-tombol`, bukan `hijau`.

### 9.2 Tipografi
- Satu keluarga huruf membulat: **Nunito** (Google Fonts). Bentuknya membulat dan ramah, sesuai referensi.
- Judul layar: 24 px, tebal 800.
- Instruksi soal: 20 px, tebal 800.
- Teks isi: 16 px, tebal 600.
- **Tombol dan label menu: huruf kapital, 15 px, tebal 800, jarak huruf 0,5 px.**
- Angka statistik: 20 px, tebal 800, warna sesuai ikon.
- Teks isi tidak boleh lebih kecil dari 14 px di ponsel.

### 9.3 Komponen kunci

**Tombol 3D (ciri utama gaya ini)**
- Isi warna solid, radius 16 px, tinggi 48 px, lebar penuh di ponsel.
- Sisi bawah 4 px dengan warna `-tepi` yang lebih gelap, sehingga tombol terlihat timbul.
- Saat ditekan, tombol turun 4 px dan sisi bawahnya hilang. Transisi 80 ms.
- Varian: utama (`hijau-tombol`), merek (`merah`), sekunder (putih dengan garis `garis` dan sisi bawah abu), nonaktif (`nonaktif`, tanpa sisi bawah).

**Ubin kata**
- Latar putih, garis 2 px `garis`, sisi bawah 3 px abu, radius 12 px, teks 16 px tebal 700.
- Ubin yang sudah dipakai meninggalkan slot abu kosong di bank kata.

**Kartu**
- Latar putih, garis 2 px `garis`, radius 16 px. Tidak memakai bayangan.

**Kartu pilihan (onboarding, pilihan jawaban)**
- Seperti kartu, dengan ilustrasi kecil di kiri.
- Saat dipilih: garis berubah `biru`, latar biru sangat muda, sisi bawah biru.

**Progress bar**
- Tinggi 16 px, radius penuh, latar `nonaktif`, isi `hijau` dengan garis sorot tipis di atas.

**Simpul jalur**
- Diameter 72 px, sisi bawah 6 px warna lebih gelap.
- Warna mengikuti bagian jalur, emas saat selesai, abu saat terkunci.

**Panel umpan balik**
- Menempel di bawah layar, padding 16 px, judul 20 px tebal 800 dengan ikon, tombol 3D lebar penuh.

### 9.4 Ilustrasi dan ikon
- Gaya vektor datar dengan garis tebal, bentuk membulat, dan warna dari palet di atas.
- Latar jalur dan kisah: lanskap lokasi Betawi (rumah kebaya, danau Setu Babakan, pohon salak Condet, gedung lama Kemayoran).
- Ikon UI: ikon berwarna dengan isi solid, bukan emoji.
- Semua aset harus punya sumber dan hak pakai yang jelas, sesuai juknis Budaya Go!.

### 9.5 Gerak
- Umpan balik benar: ubin atau pilihan memantul kecil, panel naik dari bawah dalam 200 ms.
- Simpul aktif berdenyut pelan, skala 1 → 1,05, siklus 1,5 detik.
- Layar streak dan naik level: api atau lencana muncul dengan efek skala.
- Semua animasi dimatikan kalau pengguna memilih *reduced motion*.

## 10. Aksesibilitas dan kualitas

- Kontras teks minimal 4,5:1 (WCAG AA). Ikuti catatan kontras di 9.1.
- Target sentuh minimal 44 × 44 px.
- Benar/salah tidak boleh hanya lewat warna. Selalu pakai ikon centang atau silang dan teks.
- Halaman pertama harus tampil dalam 3 detik di koneksi 4G lambat. Ilustrasi latar dimuat bertahap.
- Tidak boleh ada lencana atau tanda pembuat alat (misalnya "Created with Figma Make") saat demo.
- Tidak ada iklan, tawaran langganan, atau banner promosi. Gameloka gratis untuk siswa.

## 11. Data dan fungsi

- **XP, progres, streak, dan skor wajib tersimpan di server**, bukan hanya di perangkat. Peringkat kelas harus menampilkan semua siswa di kelas yang sama.
- Konten (kosakata, soal, artikel, kisah) disimpan sebagai data terstruktur, bukan ditulis langsung di kode.
- Setiap butir konten punya kolom `validator` dan `tanggal_validasi`. Butir tanpa validasi tidak tampil.
- **Dasbor guru (opsional untuk prototype):** guru memasukkan kode kelas dan melihat daftar siswa, bagian jalur yang selesai, dan rata-rata akurasi. Kalau tidak sempat dibuat, tulis sebagai roadmap di proposal.

## 12. Aturan konten

- Hanya kosakata Betawi yang sudah divalidasi LKB.
- **Jangan pakai bahasa prokem atau gaul Jakarta sebagai kata Betawi.** Contoh yang harus dihapus dari versi lama: *bokap*, *nyokap*. Kata dari bahasa daerah lain, seperti *meni* (Sunda), juga dihapus.
- Contoh kata yang perlu dipastikan validator sebelum dipakai: *aye* (saya), *babe* (ayah), *nyak* (ibu), *kagak* (tidak).
- Kalimat pujian dan penyemangat di UI ("Mantap!", dan lainnya) yang ditulis dalam bahasa Betawi juga harus divalidasi.
- Audio dari penutur asli, bukan suara sintetis.
- Fitur asisten AI tidak termasuk prototype ini. Jangan tampilkan tombol atau menu AI yang belum berfungsi.

## 13. Di luar cakupan prototype

- Asisten AI percakapan
- Sistem nyawa (hearts), toko, dan mata uang yang bisa dibelanjakan
- Aplikasi native Android/iOS
- Pembayaran atau langganan sekolah
- Bahasa daerah selain Betawi

## 14. Kriteria selesai

- [ ] Onboarding lima langkah berjalan. Progres tetap ada setelah dimuat ulang atau dibuka di perangkat lain.
- [ ] Jalur belajar menampilkan minimal satu bagian penuh dengan status simpul terkunci, sekarang, dan selesai.
- [ ] Satu alur penuh berjalan: pelajaran → umpan balik per soal → layar hasil → simpul selesai dengan bintang → kisah lokasi terbuka → kartu koleksi.
- [ ] Minimal lima tipe soal berfungsi, termasuk susun kalimat dengan ubin kata.
- [ ] Layar streak muncul setelah pelajaran pertama hari itu.
- [ ] Peringkat kelas menampilkan lebih dari satu siswa dari perangkat berbeda.
- [ ] Semua tombol utama memakai gaya tombol 3D dengan efek tekan.
- [ ] Semua layar nyaman dipakai di lebar 360 px tanpa geser ke samping.
- [ ] Tidak ada teks yang gagal kontras 4,5:1 dan tidak ada elemen yang saling menimpa.
- [ ] Tidak ada aset, maskot, atau nama yang diambil dari aplikasi referensi.
- [ ] Semua konten yang tampil punya data validator.
