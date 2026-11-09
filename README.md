# 🚀 GetHired — Mobile Job Tracker

> **Your job hunt, without the spreadsheet chaos.**  
> Aplikasi mobile modern untuk mencatat, melacak, dan memantau progres lamaran kerja dari berbagai platform (LinkedIn, Jobstreet, Glints, dll) langsung dari genggaman HP. 100% Offline, privat, dan cepat.

---

## ✨ Tentang GetHired

Pencari kerja sering kali mencatat puluhan hingga ratusan lamaran di spreadsheet Excel atau Google Sheets. Masalahnya, membuka spreadsheet di layar ponsel sangat tidak nyaman—kolomnya kecil, sulit diedit saat bepergian, dan rawan lupa follow-up.

**GetHired** hadir dengan gaya antarmuka modern produktivitas (terinspirasi dari estetika *jobmetry.app*):
- **Deep Obsidian Navy & Cyan Glow** (*Dark Mode Signature*) dan **Clean Alabaster** (*Light Mode*).
- **Translucent Pill Badges** untuk status lamaran yang elegan dan terbaca jelas.
- **Offline-First & Tanpa Login**: Seluruh data tersimpan aman di database lokal SQLite HP kamu, bebas biaya server dan privasi terjaga penuh.

---

## 🎯 Fitur Utama

- ⚡ **Pencatatan Cepat (< 30 detik)**: Form dibagi menjadi field wajib cepat (Perusahaan, Posisi, Sumber Lowongan, Status Awal, Tanggal) dan bagian detail opsional (Gaji, Tipe Kerja, Link, Kontak Recruiter).
- 🔄 **Ubah Status Sekali Tap**: Cukup tap badge status di kartu lamaran untuk membuka *bottom sheet* update status, lengkap dengan catatan perubahan.
- 🕒 **Timeline Riwayat Status**: Memantau perjalanan setiap lamaran secara vertikal dari awal melamar hingga hasil akhir (Interview, Test, Offering, Accepted, Rejected, dll).
- 🎨 **Status Kustom (Custom Pipeline Stages)**: Bebas menambah tahapan proses rekrutmen sendiri (misal: *Medical Checkup / MCU*, *Background Check*, dll) dengan 8 palet warna pilihan.
- ⚠️ **Deteksi Duplikasi Otomatis**: Mendapat peringatan langsung jika kamu mengetik posisi dan perusahaan yang sudah pernah dilamar sebelumnya.
- 📊 **Dashboard Analitik**:
  - Total Lamaran, Lamaran Aktif, dan Tahap Interview/Test.
  - **Response Rate (%)**: Rasio lamaran yang tembus ke tahap lanjut.
  - Grafik distribusi per status dan peringkat efektivitas sumber lowongan (*LinkedIn vs Jobstreet vs Glints*).
- 🌐 **Dwi-Bahasa (ID & EN)**: Beralih instan antara **Bahasa Indonesia** 🇮🇩 dan **English** 🇬🇧 dari menu Pengaturan.
- 🌓 **Dark Mode & Light Mode**: Tampilan gelap signature atau terang bersih yang otomatis atau manual.
- 📥 **Export ke CSV (Excel)**: Download seluruh riwayat lamaran dalam format `.csv` dengan UTF-8 BOM dan bagikan langsung lewat WhatsApp atau Google Drive.

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 58) + [React Native](https://reactnative.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Navigasi**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Database Lokal**: `expo-sqlite` (SQLite Native Storage)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) + `@react-native-async-storage/async-storage`
- **Multi-Bahasa**: `i18next` + `react-i18next` + `expo-localization`
- **Icons & UI**: `@expo/vector-icons` (Ionicons) + `@react-native-community/datetimepicker`
- **Export & Share**: `expo-file-system` + `expo-sharing`
- **Build APK**: [EAS Build](https://docs.expo.dev/eas/) (`eas.json`)

---

## 📁 Struktur Direktori

```text
├── docs/
│   ├── PRD.md                  # Product Requirements Document
│   ├── DESIGN.md               # Design System & Color Tokens Specification
│   └── IMPLEMENTATION_PLAN.md  # 6-Phase Technical Implementation Plan
├── app/
│   ├── _layout.tsx             # Root Layout (Theme & DB Hydrator)
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Bottom Tab Bar (Lamaran, Stats, Settings)
│   │   ├── index.tsx           # Layar Utama: List Lamaran, Search, Filter & FAB
│   │   ├── stats.tsx           # Dashboard Analitik & Response Rate
│   │   └── settings.tsx        # Bahasa, Tema, Status Kustom, Export CSV
│   ├── application/
│   │   ├── new.tsx             # Form Tambah Lamaran
│   │   └── [id]/
│   │       ├── index.tsx       # Detail Lamaran + Visual Status Timeline
│   │       └── edit.tsx        # Form Edit Lamaran
│   └── statuses/
│       └── index.tsx           # Kelola Status Kustom (Tambah/Hapus Tahapan)
├── src/
│   ├── components/             # ApplicationCard, StatusBadge, FilterBar, dll
│   ├── constants/              # theme.ts (Dark/Light tokens) & defaults.ts
│   ├── db/                     # client.ts, applications.ts, statuses.ts
│   ├── hooks/                  # useAppTheme.ts
│   ├── i18n/                   # id.json, en.json, index.ts
│   ├── store/                  # useAppStore.ts (Zustand)
│   ├── types/                  # TypeScript Data Models
│   └── utils/                  # format.ts, export.ts, uuid.ts
├── app.json                    # Konfigurasi Expo & Android Package
└── eas.json                    # Konfigurasi Build APK Android
```

---

## 🚀 Memulai (Getting Started)

### 1. Prasyarat
- Node.js versi 18+ (disarankan Node.js v22 LTS)
- Aplikasi **Expo Go** ter-install di HP Android / iOS kamu (bisa download gratis di Play Store / App Store)

### 2. Instalasi Dependencies
```bash
npm install
```

### 3. Menjalankan Server Lokal
```bash
npx expo start
```
- Buka aplikasi **Expo Go** di HP kamu, lalu scan QR Code yang muncul di terminal.

### 4. Pengecekan TypeScript
```bash
npx tsc --noEmit
```

---

## 📦 Build File APK Fisik (Android)

Untuk membuat file instalasi `.apk` mandiri yang siap di-install langsung di HP:

1. Install EAS CLI jika belum ada:
   ```bash
   npm install -g eas-cli
   ```
2. Jalankan perintah build APK:
   ```bash
   eas build -p android --profile preview
   ```
3. Tunggu proses build cloud selesai, lalu unduh dan install file `.apk` di HP Android kamu.

---

## 📄 Lisensi
Didistribusikan di bawah lisensi MIT. Silakan gunakan dan modifikasi untuk keperluan pelacakan karier pribadimu!
