// Menjalankan server API dan Vite bersamaan untuk pengembangan.
import { spawn } from 'node:child_process';

const anak = [
  spawn('node', ['--watch-path=server', '--watch-path=shared', '--watch-path=konten', 'server/index.ts'], { stdio: 'inherit' }),
  spawn('npx', ['vite'], { stdio: 'inherit' }),
];
const stop = () => { for (const a of anak) a.kill('SIGTERM'); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
