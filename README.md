# Infinite Temple — React + React Three Fiber

Starter project untuk pengalaman 3D "temple road" low-poly tanpa backend.

## Fitur

- React + TypeScript + Vite.
- Three.js melalui React Three Fiber.
- GLB dimuat dari `public/models/temple.glb`.
- Satu sumber model dipakai oleh banyak `InstancedMesh`.
- 18 pasang candi aktif (36 instance) yang didaur ulang sepanjang perjalanan.
- Scroll wheel menggerakkan dunia; drag mengorbit kamera.
- Fog, pencahayaan, dan ground untuk membangun suasana.

> Catatan: model GLB tidak disertakan dalam ZIP ini karena server unduhan asset menolak pengambilan otomatis dari lingkungan pembuatan file. Unduh manual melalui tautan di bawah dan simpan dengan nama `temple.glb`.

## 1. Unduh model

**Jungle Temple Pyramid — Shuriken Studio**

- Halaman model: https://shuriken.studio/models/buildings/jungle-temple-pyramid
- Format: GLB
- Ukuran yang tercantum: sekitar 0.5 MB
- Kompleksitas yang tercantum: 9.286 triangles, 14 parts
- Model low-poly dengan piramida bertingkat, tangga, shrine di puncak, dan detail batu.
- Lisensi: free model license Shuriken Studio. Boleh dipakai dan dimodifikasi dalam project, termasuk project komersial; jangan mendistribusikan file model secara terpisah sebagai asset pack.

Klik tombol **Download GLB** pada halaman tersebut, lalu letakkan file di:

```text
public/models/temple.glb
```

Halaman lisensi:
https://shuriken.studio/legal/models

## 2. Instalasi

Persyaratan: Node.js 20.19+ atau 22.12+.

```bash
npm install
npm run dev
```

Buka URL Vite yang ditampilkan di terminal.

Build production:

```bash
npm run build
npm run preview
```

## 3. Kontrol

- Scroll wheel / trackpad: bergerak maju.
- Klik + drag: orbit / ubah sudut pandang.
- Zoom sengaja dinonaktifkan agar wheel tidak bentrok dengan infinite travel.
- Nilai jarak virtual bertambah seiring perjalanan.

## 4. Cara kerja infinite instancing

`InfiniteTemples.tsx` mengambil semua mesh dari GLB, menggabungkan transformasi node ke geometry lokal, lalu membuat satu `InstancedMesh` untuk setiap bagian mesh sumber. Dengan demikian, setiap bagian model memakai geometry/material yang sama pada banyak instance.

Di setiap frame, transformasi instance diperbarui berdasarkan jarak virtual:

- `baseIndex` menentukan indeks candi pertama pada segmen yang sedang aktif.
- `offset` menggeser deretan candi secara kontinu.
- Instance yang keluar dari rentang aktif muncul kembali di depan.
- Variasi rotasi, skala, dan offset dibuat deterministik dari indeks dunia.

Ini adalah infinite-world illusion: jumlah instance aktif tetap terbatas, bukan 1.000 model yang terus ditambahkan ke scene.

## 5. Parameter yang bisa diubah

Di `src/components/InfiniteTemples.tsx`:

```ts
const ACTIVE_PAIRS = 18; // 18 pasang = 36 candi aktif
const SPACING = 13;      // jarak antar pasangan
const SIDE_OFFSET = 5.2; // jarak dari jalan
```

Naikkan `ACTIVE_PAIRS` secara bertahap dan ukur performa perangkat target. Setiap bagian mesh GLB menghasilkan satu draw call per material/mesh source, sehingga model dengan banyak bagian/material dapat meningkatkan draw calls.

## 6. Catatan teknis dan batasan starter

- Model contoh adalah temple bergaya jungle/low-poly, bukan rekonstruksi arsitektur candi Indonesia tertentu.
- Model perlu diuji visual setelah diunduh. Jika orientasi atau skala berbeda, sesuaikan normalisasi pada `InfiniteTemples.tsx`.
- Versi awal menggunakan scroll wheel untuk perjalanan dan OrbitControls untuk drag. Pada perangkat touch, perlu pengembangan gesture khusus agar swipe vertikal juga mengubah jarak virtual.
- Ground menggunakan bidang sangat panjang dan fog agar ujungnya tidak terlihat selama sesi normal. Untuk dunia yang benar-benar bebas ke segala arah, implementasikan ground tile recycling atau terrain chunks.
- Bayangan real-time dapat mahal pada perangkat mobile. Jika FPS rendah, matikan `shadows` pada Canvas dan `castShadow` pada instance.
- Asset GLB harus tersedia secara lokal agar website tidak bergantung pada host asset eksternal.
- Tidak ada backend, API, database, atau akun pengguna.

## Struktur

```text
src/
  components/
    Ground.tsx
    InfiniteTemples.tsx
  App.tsx
  main.tsx
  styles.css
public/
  models/
    temple.glb  <-- tambahkan file unduhan di sini
```
