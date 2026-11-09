# Implementation Plan: JobTrack Mobile App (MVP)

Dokumen ini berisi rencana teknis bertahap untuk membangun aplikasi **JobTrack Mobile** berdasarkan spesifikasi di [PRD.md](file:///d:/Belajar%20Ngoding/JOB_TRACKER/PRD.md) dan desain di [DESIGN.md](file:///d:/Belajar%20Ngoding/JOB_TRACKER/DESIGN.md).

---

## Ringkasan Arsitektur & Library Inti

| Komponen | Teknologi / Package | Keterangan |
|---|---|---|
| **Framework & Navigasi** | `expo` (SDK terbaru), `expo-router`, `typescript` | File-based routing (Tab & Stack) |
| **Database Lokal** | `expo-sqlite` | Penyimpanan lokal SQLite 100% offline & cepat |
| **State & Preferensi** | `zustand` + `@react-native-async-storage/async-storage` | Menyimpan state tema (`dark`/`light`), bahasa (`id`/`en`), mata uang, dan trigger refresh data |
| **Multi-Bahasa (i18n)** | `i18next`, `react-i18next`, `expo-localization` | Kamus bahasa Indonesia & Inggris instan tanpa reload |
| **Ikon & UI Pendukung** | `@expo/vector-icons` (`Ionicons` / `Feather`), `@react-native-community/datetimepicker` | Ikon aplikasi & pemilih tanggal native |
| **Export & Share (Backup)**| `expo-file-system`, `expo-sharing` | Export data lamaran ke `.csv` (Excel) & `.json` (Backup) |

---

## Struktur Direktori Project

```text
d:\Belajar Ngoding\JOB_TRACKER\
├── PRD.md
├── DESIGN.md
├── IMPLEMENTATION_PLAN.md
├── app.json
├── eas.json                          # Konfigurasi build APK Android
├── package.json
├── tsconfig.json
├── app/                              # Expo Router Screens
│   ├── _layout.tsx                   # Root Layout (Theme Provider, DB Init, StatusBar)
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Bottom Tab Bar (Lamaran, Statistik, Pengaturan)
│   │   ├── index.tsx                 # Layar Utama: Daftar Lamaran + Search + Filter + FAB
│   │   ├── stats.tsx                 # Layar Statistik & Ringkasan Sumber/Status
│   │   └── settings.tsx              # Layar Pengaturan (Bahasa, Tema, Export, Reset)
│   ├── application/
│   │   ├── new.tsx                   # Form Tambah Lamaran Baru
│   │   └── [id]/
│   │       ├── index.tsx             # Detail Lamaran + Timeline Riwayat Status
│   │       └── edit.tsx              # Form Edit Lamaran
│   └── statuses/
│       └── index.tsx                 # Halaman Kelola Status Kustom (Tambah/Edit/Hapus)
└── src/
    ├── constants/
    │   ├── theme.ts                  # Palet warna Dark & Light Mode + 8 Preset Warna Badge
    │   └── defaults.ts               # Data awal Status Bawaan & Daftar Sumber Lowongan
    ├── db/
    │   ├── client.ts                 # Inisialisasi koneksi SQLite, pembuatan tabel & seed data
    │   ├── applications.ts           # Query CRUD Lamaran, Filter, Search, & Statistik
    │   └── statuses.ts               # Query CRUD Status Kustom & Riwayat Status (Timeline)
    ├── i18n/
    │   ├── index.ts                  # Konfigurasi i18next
    │   ├── id.json                   # Teks Bahasa Indonesia
    │   └── en.json                   # Teks Bahasa Inggris
    ├── store/
    │   └── useAppStore.ts            # Zustand store (theme, language, currency, dataVersion)
    ├── types/
    │   └── index.ts                  # TypeScript interfaces (Application, Status, StatusHistory)
    ├── utils/
    │   ├── format.ts                 # Formatter angka ribuan gaji (Rp 8.000.000) & tanggal
    │   └── export.ts                 # Generator file CSV & JSON backup + Share Sheet
    └── components/
        ├── ApplicationCard.tsx       # Kartu lamaran bergaya jobmetry.app
        ├── StatusBadge.tsx           # Translucent Pill Badge (mengikuti Dark/Light mode)
        ├── StatusPickerModal.tsx     # Bottom Sheet modal untuk ganti status cepat + catatan
        ├── ApplicationForm.tsx       # Komponen form reusable (Wajib + Accordion Opsional)
        ├── FilterBar.tsx             # Tab Semua/Aktif/Selesai + Chips Filter Sumber & Sort
        └── EmptyState.tsx            # Tampilan saat daftar lamaran masih kosong
```

---

## Tahapan Implementasi (Step-by-Step)

### Fase 1: Inisialisasi Project & Pondasi Tema / Bahasa
**Tujuan:** Project Expo berjalan dengan navigasi dasar, sistem tema Dark/Light sesuai `DESIGN.md`, dan sistem 2 bahasa (ID/EN).
1. Inisialisasi project Expo TypeScript di direktori kerja `d:\Belajar Ngoding\JOB_TRACKER` dan install dependencies utama (`expo-sqlite`, `zustand`, `@react-native-async-storage/async-storage`, `i18next`, `react-i18next`, `expo-localization`, `@react-native-community/datetimepicker`, `expo-file-system`, `expo-sharing`).
2. Buat `src/constants/theme.ts` yang berisi token warna Dark Mode (`#070B12`, `#0F1623`, `#22D3EE`, dll), Light Mode (`#F8FAFC`, `#FFFFFF`, `#0891B2`, dll), serta 8 preset warna badge (`cyan`, `blue`, `purple`, `indigo`, `emerald`, `amber`, `orange`, `rose`, `slate`).
3. Buat `src/i18n/id.json`, `src/i18n/en.json`, dan `src/i18n/index.ts`.
4. Buat `src/store/useAppStore.ts` untuk menyimpan state `themeMode` (default `'dark'`), `language` (default `'id'`), dan `currency` (default `'IDR'`).

---

### Fase 2: Database Lokal SQLite & Seed Data
**Tujuan:** Penyimpanan lokal siap digunakan untuk lamaran, status kustom, dan riwayat status.
1. Buat `src/types/index.ts` untuk seluruh tipe data aplikasi.
2. Buat `src/db/client.ts` menggunakan API sinkron/asinkron modern `expo-sqlite`:
   - Tabel `statuses`: menyimpan 10 status bawaan (`WISHLIST`, `APPLIED`, `SCREENING`, `INTERVIEW`, `TEST`, `OFFERING`, `ACCEPTED`, `REJECTED`, `GHOSTED`, `WITHDRAWN`) + status kustom buatan pengguna.
   - Tabel `applications`: menyimpan seluruh field lamaran sesuai `PRD.md` (Perusahaan, Posisi, Sumber, Status, Tanggal, Rentang Gaji, Tipe Gaji, Tipe Kerja, Lokasi, Link, Kontak, Follow-up, Catatan).
   - Tabel `status_history`: menyimpan log setiap kali lamaran berpindah status beserta timestamp dan catatan.
3. Buat fungsi query di `src/db/applications.ts` dan `src/db/statuses.ts`.

---

### Fase 3: Komponen UI & Halaman Daftar Lamaran (Home)
**Tujuan:** Menampilkan daftar lamaran dengan visual khas `jobmetry.app`, fitur pencarian, filter, dan ganti status sekali tap.
1. Buat `StatusBadge.tsx` dengan tampilan kapsul transparan (*translucent pill*).
2. Buat `ApplicationCard.tsx` yang menampilkan Nama Perusahaan, Posisi, Badge Status (bisa di-tap), Sumber Lowongan, Lokasi/Tipe Kerja, Rentang Gaji, dan Tanggal Melamar.
3. Buat `StatusPickerModal.tsx` (Bottom Sheet) agar pengguna bisa langsung mengganti status dari kartu maupun halaman detail, sekaligus menambah catatan riwayat singkat.
4. Bangun halaman `app/(tabs)/index.tsx`:
   - Header ringkasan (`Total` & `Aktif`)
   - Search Bar (cari nama perusahaan / posisi)
   - Segmented Tab (`Semua`, `Aktif`, `Selesai`)
   - Filter Sumber & Urutan (Terbaru, Terlama, Nama A-Z)
   - Tombol mengambang (FAB `+ Lamaran`) dengan kontras tinggi.

---

### Fase 4: Form Tambah/Edit & Halaman Detail + Riwayat
**Tujuan:** Mencatat lamaran baru kurang dari 30 detik dan melihat detail lengkap beserta timeline progresnya.
1. Buat `ApplicationForm.tsx`:
   - **Section Wajib**: Nama Perusahaan, Posisi, Pilihan Chip Sumber Lowongan (`LinkedIn`, `Jobstreet`, `Glints`, `Kalibrr`, `Referral`, `Lainnya`), Status Awal, dan Tanggal Melamar.
   - **Section Opsional (Collapsible Accordion)**: Tipe Info Gaji (`Lowongan` / `Ekspektasi` / `Offering`), Input Gaji Min & Max dengan auto-format titik ribuan (`8.000.000`), Tipe Kerja (`Onsite`/`Hybrid`/`Remote`), Jenis Pekerjaan (`Full-time`/`Contract`/`Intern`), Lokasi, Link URL, Kontak HR, Tanggal Follow-up, dan Catatan.
   - Peringatan otomatis jika pengguna mengetik nama perusahaan + posisi yang sudah pernah dilamar sebelumnya.
2. Buat layar `app/application/new.tsx` dan `app/application/[id]/edit.tsx`.
3. Buat layar `app/application/[id]/index.tsx` (Detail Lamaran):
   - Menampilkan seluruh informasi lamaran, tombol buka link lowongan di browser, tombol ubah status cepat, tombol Edit & Hapus, serta **Timeline Riwayat Status** dari awal melamar hingga status terakhir.

---

### Fase 5: Manajemen Status Kustom, Statistik, & Pengaturan
**Tujuan:** Melengkapi fitur kustomisasi status, analitik lamaran, ganti bahasa/tema, dan backup CSV.
1. Buat layar `app/statuses/index.tsx`:
   - Daftar status kelompok **Aktif** dan **Selesai**.
   - Form modal untuk menambah status kustom baru (input nama status, pilih kelompok Aktif/Selesai, dan pilih 1 dari 8 warna badge) serta hapus status kustom.
2. Buat layar `app/(tabs)/stats.tsx`:
   - Grid 2x2 Kartu Metrik Utama: *Total Lamaran*, *Lamaran Aktif*, *Tahap Interview/Test*, dan *Response Rate (%)*.
   - Bar distribusi jumlah lamaran per Status.
   - Peringkat Sumber Lowongan (menampilkan jumlah lamaran & berapa yang tembus tahap lanjut per sumber seperti LinkedIn vs Jobstreet).
3. Buat layar `app/(tabs)/settings.tsx`:
   - Switcher Bahasa instan: **Bahasa Indonesia** / **English**.
   - Switcher Tema: **Dark Mode (Default)** / **Light Mode**.
   - Pintasan ke menu **Kelola Status Kustom**.
   - Tombol **Export ke CSV (Excel)** & **Hapus Semua Data** (dengan dialog konfirmasi).

---

### Fase 6: Verifikasi & Konfigurasi Build APK
**Tujuan:** Memastikan tidak ada error TypeScript/runtime dan menyiapkan konfigurasi build APK untuk HP Android.
1. Jalankan pemeriksaan tipe TypeScript (`npx tsc --noEmit`) dan pastikan semua layar & komponen terhubung dengan rapi.
2. Siapkan file `eas.json` dengan profil `preview` / `apk` (`"buildType": "apk"`) agar kapan pun kamu ingin membuat file `.apk`, cukup menjalankan 1 perintah.

