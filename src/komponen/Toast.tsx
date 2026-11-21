import { useEffect, useState } from 'react';

type Pendengar = (pesan: string) => void;
const pendengar = new Set<Pendengar>();

export function toast(pesan: string) {
  pendengar.forEach((f) => f(pesan));
}

export function Toaster() {
  const [pesan, setPesan] = useState<{ id: number; teks: string } | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const f: Pendengar = (teks) => {
      setPesan({ id: Date.now(), teks });
      clearTimeout(t);
      t = setTimeout(() => setPesan(null), 3200);
    };
    pendengar.add(f);
    return () => {
      pendengar.delete(f);
      clearTimeout(t);
    };
  }, []);
  return (
    <div className="toast-wadah" role="status" aria-live="polite">
      {pesan && (
        <p key={pesan.id} className="toast">
          {pesan.teks}
        </p>
      )}
    </div>
  );
}
