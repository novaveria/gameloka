// Pemutar audio soal. Audio harus rekaman penutur asli (DESIGN.md 12).
// Selama rekaman belum ada dan mode draf aktif, suara sintetis dipakai sebagai pengganti sementara
// dan ditandai di layar. Di mode non-draf, soal tanpa rekaman tidak ditampilkan.
export function bisaSintetis(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

let audioAktif: HTMLAudioElement | null = null;

export function putar(teks: string, berkas: string | null, pelan = false) {
  if (berkas) {
    audioAktif?.pause();
    audioAktif = new Audio(berkas);
    audioAktif.playbackRate = pelan ? 0.75 : 1;
    audioAktif.play().catch(() => {});
    return;
  }
  if (!bisaSintetis()) return;
  const u = new SpeechSynthesisUtterance(teks);
  u.lang = 'id-ID';
  u.rate = pelan ? 0.6 : 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
