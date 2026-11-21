// Router berbasis hash: #/belajar, #/pelajaran/p1-1, dst.
import { useEffect, useState } from 'react';

function baca(): string[] {
  const h = location.hash.replace(/^#\/?/, '');
  return h ? h.split('/').map(decodeURIComponent) : [];
}

export function useRute(): string[] {
  const [rute, setRute] = useState(baca);
  useEffect(() => {
    const f = () => {
      setRute(baca());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return rute;
}

export function pergi(...bagian: string[]) {
  location.hash = '/' + bagian.map(encodeURIComponent).join('/');
}
