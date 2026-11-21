import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Konten, StatusSiswa } from '../../shared/tipe.ts';
import { api, GalatApi, kirimTertunda, token } from './api.ts';

interface Nilai {
  konten: Konten;
  status: StatusSiswa | null;
  setStatus: (s: StatusSiswa) => void;
  segarkan: () => Promise<void>;
  keluar: () => void;
}

const Ctx = createContext<Nilai | null>(null);

export function useApp(): Nilai {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp di luar Penyedia');
  return v;
}

/** Untuk layar yang hanya tampil setelah onboarding. */
export function useSiswa(): Nilai & { status: StatusSiswa } {
  const v = useApp();
  if (!v.status) throw new Error('Belum ada siswa');
  return v as Nilai & { status: StatusSiswa };
}

export function Penyedia({ children, memuat, galat }: { children: ReactNode; memuat: ReactNode; galat: (pesan: string, ulang: () => void) => ReactNode }) {
  const [konten, setKonten] = useState<Konten | null>(null);
  const [status, setStatus] = useState<StatusSiswa | null>(null);
  const [siap, setSiap] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);

  const segarkan = useCallback(async () => {
    if (!token.ambil()) return;
    try {
      setStatus(await api<StatusSiswa>('/api/saya'));
    } catch (e) {
      if (e instanceof GalatApi && e.status === 401) {
        token.simpan(null);
        setStatus(null);
      }
    }
  }, []);

  const muat = useCallback(async () => {
    setPesan(null);
    try {
      const k = await api<Konten>('/api/konten');
      setKonten(k);
      if (token.ambil()) {
        const tertunda = await kirimTertunda();
        if (tertunda) setStatus(tertunda);
        await segarkan();
      }
      setSiap(true);
    } catch (e) {
      setPesan(e instanceof Error ? e.message : 'Gagal memuat.');
    }
  }, [segarkan]);

  useEffect(() => {
    muat();
    const online = () => kirimTertunda().then((s) => s && setStatus(s));
    const fokus = () => document.visibilityState === 'visible' && segarkan();
    window.addEventListener('online', online);
    document.addEventListener('visibilitychange', fokus);
    return () => {
      window.removeEventListener('online', online);
      document.removeEventListener('visibilitychange', fokus);
    };
  }, [muat, segarkan]);

  const keluar = useCallback(() => {
    token.simpan(null);
    setStatus(null);
    location.hash = '';
  }, []);

  if (pesan) return <>{galat(pesan, muat)}</>;
  if (!siap || !konten) return <>{memuat}</>;
  return <Ctx.Provider value={{ konten, status, setStatus, segarkan, keluar }}>{children}</Ctx.Provider>;
}
