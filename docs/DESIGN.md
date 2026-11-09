# Design System & UI/UX Specification (`DESIGN.md`)

| Item | Detail |
|---|---|
| **Nama Produk** | JobTrack Mobile |
| **Platform** | React Native (Expo) – Android & iOS |
| **Inspirasi Visual** | `jobmetry.app` (Modern Dark Slate & Cyan/Teal Accent, Clean Pill Badges, High-Contrast Typography) |
| **Tema** | Dual Theme: **Dark Mode** (Signature Look) & **Light Mode** (Clean Daylight) |

---

## 1. Filosofi Desain

Dari referensi `jobmetry.app`, karakter visual utamanya adalah **Modern Productivity SaaS** (mirip gaya *Linear*, *Vercel*, atau *Raycast*):
1. **Deep Slate & Subtle Borders**: Tidak memakai bayangan tebal (*heavy drop shadow*), melainkan mengandalkan perbedaan warna surface yang halus dan garis tepi tipis (`1px border`).
2. **Translucent Pill Badges**: Status lamaran tampil sangat menonjol namun tetap elegan menggunakan latar warna transparan (`15%–20% opacity`) dengan teks berwarna terang/kontras.
3. **Teal/Cyan Atmospheric Accent**: Aksen warna biru-kehijauan (*cyan/teal*) memberi kesan fokus, segar, dan modern, dipadukan dengan tombol aksi utama (CTA) yang sangat kontras.
4. **Adaptasi Web ke Mobile**: Jika di web `jobmetry.app` menggunakan **tabel memanjang ke samping**, di aplikasi mobile kita ubah menjadi **Compact Card List** agar semua informasi penting (Perusahaan, Posisi, Status, Sumber, Tanggal, Gaji) terbaca jelas dalam sekali pandang tanpa perlu geser layar ke kanan-kiri (*horizontal scroll*).

---

## 2. Palet Warna (Dark Mode & Light Mode)

### 2.1 Warna Inti (Core Theme Tokens)

| Token | Kegunaan | Dark Mode (Signature) | Light Mode (Clean) |
|---|---|---|---|
| `background` | Latar belakang utama layar | `#070B12` (Rich Obsidian Navy) | `#F8FAFC` (Cool Alabaster / Slate 50) |
| `surface` | Latar kartu (Card), Input, Tab Bar | `#0F1623` (Deep Slate Surface) | `#FFFFFF` (Pure White) |
| `surfaceElevated` | Bottom Sheet, Modal, Chip aktif | `#162032` (Elevated Slate) | `#F1F5F9` (Slate 100) |
| `surfaceHighlight` | Efek tekan (Pressed state) / Hover | `#1E293B` (Slate 800) | `#E2E8F0` (Slate 200) |
| `border` | Garis tepi kartu, pembatas baris | `#1E293B` (Subtle Slate Border) | `#E2E8F0` (Light Slate Border) |
| `borderFocus` | Garis tepi input saat aktif/diketik | `#22D3EE` (Cyan 400) | `#0891B2` (Cyan 600) |
| `textPrimary` | Judul, Nama Perusahaan, Angka Utama | `#F8FAFC` (Crisp White) | `#0F172A` (Deep Slate 900) |
| `textSecondary` | Nama Posisi, Label Form, Subjudul | `#94A3B8` (Slate 400) | `#475569` (Slate 600) |
| `textMuted` | Tanggal, Placeholder, Teks non-aktif | `#64748B` (Slate 500) | `#94A3B8` (Slate 400) |
| `accent` | Warna aksen brand (Ikon aktif, Link, Glow) | `#22D3EE` (Cyan / Electric Teal) | `#0891B2` (Deep Cyan / Teal 600) |
| `accentSoft` | Background chip aktif / highlight | `rgba(34, 211, 238, 0.14)` | `rgba(8, 145, 178, 0.10)` |
| `primaryButtonBg` | Tombol utama (Simpan, FAB "+") | `#F8FAFC` (White Pill seperti referensi) atau `#06B6D4` | `#0F172A` (Dark Slate Pill) atau `#0891B2` |
| `primaryButtonText`| Teks pada tombol utama | `#070B12` (Dark Text) | `#FFFFFF` (White Text) |
| `danger` | Hapus data, Pesan error validasi | `#F87171` (Red 400) | `#DC2626` (Red 600) |

> **Catatan Tombol Utama (CTA) & FAB:**
> Pada gambar referensi `jobmetry.app`, tombol utama **"Try it free"** menggunakan bentuk kapsul putih bersih (`#F8FAFC`) dengan teks gelap (`#070B12`) di atas background gelap, didampingi pendaran warna Cyan/Teal. Kita menerapkan gaya yang sama agar nuansa `jobmetry.app` benar-benar terasa.

---

### 2.2 Warna Badge Status Lamaran (Pill Badges)

Terinspirasi langsung dari kolom **Status** pada tabel referensi (`Screening` ungu, `Offer` hijau, `Applied` abu-kebiruan, `Rejected` merah):

| ID Status | Label (ID / EN) | Dark Mode (Text / Background) | Light Mode (Text / Background) | Border (Opsional) |
|---|---|---|---|---|
| `WISHLIST` | Ingin Dilamar / Wishlist | Text: `#CBD5E1`<br>Bg: `rgba(148, 163, 184, 0.16)` | Text: `#475569`<br>Bg: `#F1F5F9` | `rgba(148, 163, 184, 0.25)` |
| `APPLIED` | Sudah Melamar / Applied | Text: `#38BDF8`<br>Bg: `rgba(56, 189, 248, 0.16)` | Text: `#0369A1`<br>Bg: `#E0F2FE` | `rgba(56, 189, 248, 0.30)` |
| `SCREENING` | Screening | Text: `#C084FC`<br>Bg: `rgba(192, 132, 252, 0.18)` | Text: `#7E22CE`<br>Bg: `#F3E8FF` | `rgba(192, 132, 252, 0.30)` |
| `INTERVIEW` | Interview | Text: `#FBBF24`<br>Bg: `rgba(251, 191, 36, 0.16)` | Text: `#B45309`<br>Bg: `#FEF3C7` | `rgba(251, 191, 36, 0.30)` |
| `TEST` | Technical Test | Text: `#818CF8`<br>Bg: `rgba(129, 140, 248, 0.18)` | Text: `#4338CA`<br>Bg: `#E0E7FF` | `rgba(129, 140, 248, 0.30)` |
| `OFFERING` | Offering / Offer | Text: `#34D399`<br>Bg: `rgba(52, 211, 153, 0.18)` | Text: `#047857`<br>Bg: `#D1FAE5` | `rgba(52, 211, 153, 0.30)` |
| `ACCEPTED` | Diterima / Accepted | Text: `#4ADE80`<br>Bg: `rgba(74, 222, 128, 0.22)` | Text: `#15803D`<br>Bg: `#DCFCE7` | `rgba(74, 222, 128, 0.40)` |
| `REJECTED` | Ditolak / Rejected | Text: `#F87171`<br>Bg: `rgba(248, 113, 113, 0.18)` | Text: `#B91C1C`<br>Bg: `#FEE2E2` | `rgba(248, 113, 113, 0.30)` |
| `GHOSTED` | Tidak Ada Kabar / Ghosted | Text: `#94A3B8`<br>Bg: `rgba(100, 116, 139, 0.14)` | Text: `#64748B`<br>Bg: `#F1F5F9` | `rgba(100, 116, 139, 0.25)` |
| `WITHDRAWN` | Mundur / Withdrawn | Text: `#FB923C`<br>Bg: `rgba(251, 146, 60, 0.16)` | Text: `#C2410C`<br>Bg: `#FFEDD5` | `rgba(251, 146, 60, 0.30)` |

#### Palet Pilihan untuk **Status Kustom (Custom Status)**
Saat pengguna membuat status baru (misal: *"MCU"*, *"Interview User"*), sediakan **8 pilihan warna preset** (Cyan, Blue, Purple, Indigo, Emerald, Amber, Orange, Rose) yang otomatis memiliki pasangan warna teks & background transparan untuk Dark Mode maupun Light Mode.

---

## 3. Tipografi (Typography)

Menggunakan font sans-serif modern yang bersih: **Plus Jakarta Sans** atau **Inter** (atau fallback sistem `System` untuk performa maksimal).

| Style | Ukuran (`fontSize`) | Ketebalan (`fontWeight`) | Line Height | Penggunaan |
|---|---|---|---|---|
| **Heading XL** | `24px` | `700 (Bold)` | `32px` | Judul Halaman Utama, Angka Total di Statistik |
| **Heading LG** | `20px` | `700 (Bold)` | `28px` | Nama Perusahaan di Halaman Detail, Judul Bottom Sheet |
| **Title MD** | `16px` | `600 (SemiBold)` | `22px` | **Nama Perusahaan di Card**, Judul Section |
| **Body MD** | `14px` | `500 (Medium)` | `20px` | **Nama Posisi di Card**, Teks Input Form |
| **Body SM** | `13px` | `400 (Regular)` | `18px` | Info Lokasi, Sumber, Tanggal, Catatan |
| **Badge / Pill** | `12px` | `600 (SemiBold)` | `16px` | Teks di dalam Badge Status & Filter Chip |
| **Caption** | `11px` | `500 (Medium)` | `14px` | Label Tab Bar, Timestamp Riwayat, Label Field |

> **Tip Angka Gaji:** Gunakan properti `fontVariant: ['tabular-nums']` pada tampilan nominal gaji dan statistik agar deretan angka sejajar rapi seperti di tabel referensi.

---

## 4. Spacing, Radius, & Elevasi

- **Spacing Scale**: Kelipatan `4px` (`4`, `8`, `12`, `16`, `20`, `24`, `32`).
- **Padding Layar Horizontal**: `16px` di kiri dan kanan layar.
- **Jarak Antar Kartu (Card Gap)**: `10px` (cukup rapat agar muat banyak seperti baris tabel, tapi tetap mudah di-tap).
- **Border Radius**:
  - Kartu Lamaran (`Card`): `14px`
  - Input Form & Tombol: `12px`
  - Badge Status & Chip Filter: `999px` (Full Pill / Kapsul)
  - Bottom Sheet: `24px` (sudut atas kiri & kanan)
- **Border & Shadow**:
  - **Dark Mode**: Tanpa drop shadow, gunakan `borderWidth: 1` dengan warna `#1E293B`. Pada bagian atas halaman utama/statistik, bisa ditambahkan efek gradasi tipis radial warna Cyan (`rgba(34, 211, 238, 0.07)`) seperti background `jobmetry.app`.
  - **Light Mode**: `borderWidth: 1` dengan warna `#E2E8F0` ditambah shadow sangat halus (`opacity: 0.04`, `radius: 6`, `offset: 0, 2`).

---

## 5. Spesifikasi Komponen Utama (Adaptasi Tabel Web ke Mobile)

### 5.1 Kartu Lamaran (`ApplicationCard`)
Menggantikan 1 baris tabel pada referensi `jobmetry.app` (`Company | Position | Status | Applied date | Location | Next activity`) menjadi kartu mobile yang ringkas dan padat informasi:

```
+-------------------------------------------------------------------+
|  Unilever                                         [ Screening v ] |
|  Marketing Manager                                                |
|                                                                   |
|  [in] LinkedIn  •  Jakarta (Hybrid)               Rp 12jt - 15jt  |
|  Melamar: 4 Mar 2026                     Follow-up: Kamis, 12 Mar |
+-------------------------------------------------------------------+
```

- **Baris Atas**:
  - Kiri: **Nama Perusahaan** (`16px`, Bold, `textPrimary`)
  - Kanan: **Pill Badge Status** (`12px`, SemiBold, dapat di-tap langsung untuk buka Bottom Sheet ubah status, dilengkapi ikon chevron kecil `v`)
- **Baris Tengah**:
  - **Nama Posisi** (`14px`, Medium, `textSecondary`)
- **Divider Halus (Opsional)** atau jarak `10px`
- **Baris Bawah (Metadata)**:
  - Kiri: Badge kecil **Sumber** (misal ikon/teks `LinkedIn`), titik pemisah `•`, **Lokasi / Tipe Kerja** (`Jakarta • Hybrid`).
  - Kanan: **Info Gaji** singkat (jika diisi, misal `Rp 12–15 jt` dengan warna `accent`) dan **Tanggal Melamar** (`4 Mar 2026`, `textMuted`).

### 5.2 Header & Filter Bar (Halaman Utama)
1. **Top Header**: Judul aplikasi `JobTrack` (dengan titik aksen cyan) + ringkasan cepat di sampingnya (misal: `24 Lamaran • 6 Aktif`).
2. **Search Bar**: Input pencarian dengan ikon kaca pembesar, latar `surface`, border `border`, tinggi `44px`.
3. **Segmented Tabs**: `Semua (24)` | `Aktif (15)` | `Selesai (9)`
4. **Horizontal Filter Chips**: Baris chip yang bisa di-scroll ke samping untuk filter cepat:
   - `[ Semua Sumber v ]` `[ Status v ]` `[ Urutkan: Terbaru v ]`

### 5.3 Floating Action Button (FAB `+`)
- Berada di kanan bawah (`bottom: 24px`, `right: 20px`).
- Berbentuk kapsul (`+ Lamaran` / `+ Add`) atau bulat `56x56px`.
- Di Dark Mode menggunakan warna kontras putih `#F8FAFC` (dengan teks/ikon `#070B12`) atau Cyan `#22D3EE` agar langsung terlihat jelas seperti tombol CTA pada gambar referensi.

### 5.4 Form Tambah / Edit Lamaran
Agar pengisian terasa secepat mengisi sel Excel (kurang dari 30 detik):
- **Bagian 1: Data Wajib (Langsung Terbuka)**
  1. **Nama Perusahaan** (Text Input, Auto-capitalize words)
  2. **Posisi** (Text Input)
  3. **Sumber Info Lowongan** (Horizontal scrollable chips: `LinkedIn`, `Jobstreet`, `Glints`, `Kalibrr`, `Referral`, `Web Perusahaan`, `+ Lainnya` -> jika pilih Lainnya, muncul input teks)
  4. **Status Awal** (Default terpilih: `Applied / Sudah Melamar`, bisa di-tap untuk ganti)
  5. **Tanggal Melamar** (Default: `Hari ini`, tap untuk buka Date Picker)
- **Bagian 2: Informasi Gaji & Detail Tambahan (Accordion / Bisa Dibuka-Tutup)**
  - **Tipe Info Gaji**: Pill selector `Dari Lowongan` | `Ekspektasi Saya` | `Offering`
  - **Rentang Gaji**: 2 kolom berdampingan `Gaji Minimum` & `Gaji Maksimum` dengan auto-format titik ribuan (`Rp 8.000.000`).
  - **Tipe Kerja & Status Pegawai**: Chips `Onsite / Hybrid / Remote` & `Full-time / Contract / Intern`.
  - **Lokasi, Link Lowongan, Kontak HR, Tanggal Follow-up, dan Catatan**.

### 5.5 Bottom Sheet Ubah Status Cepat
Saat pengguna men-tap badge status di kartu mana pun:
- Muncul Bottom Sheet dari bawah (`surfaceElevated`).
- Menampilkan grid/list semua status (bawaan + kustom) lengkap dengan titik warna masing-masing.
- Tersedia input kecil opsional: *"Tambah catatan perubahan (misal: Lolos ke tahap interview user)"*.
- Tombol pintas di paling bawah: **`+ Buat Status Kustom Baru`**.

### 5.6 Halaman Statistik (Dashboard)
- **Hero Metric Cards (Grid 2x2)**:
  - **Total Lamaran** (angka besar `24px`, warna `textPrimary`)
  - **Masih Proses / Aktif** (warna Cyan `#22D3EE`)
  - **Tahap Interview / Test** (warna Amber `#FBBF24`)
  - **Response Rate (%)** (warna Emerald `#34D399`)
- **Distribusi per Status**: Horizontal progress bar untuk tiap status (lengkap dengan warna badge masing-masing dan jumlahnya).
- **Efektivitas Sumber Lowongan**: Urutan sumber paling banyak dipakai & paling banyak menghasilkan interview (misal: `LinkedIn: 15 lamaran (4 interview)`).

---

## 6. Panduan Implementasi Tema di Kode (NativeWind / StyleSheet)

Agar perpindahan **Dark Mode** dan **Light Mode** berjalan mulus tanpa kedip:
1. Simpan preferensi tema pengguna (`'dark' | 'light' | 'system'`) di **Zustand + SQLite / AsyncStorage**, dengan default awal **`'dark'`** (mengikuti identitas visual referensi `jobmetry.app`).
2. Buat satu file konstanta terpusat `src/constants/theme.ts` yang mengekspor objek `colors.dark` dan `colors.light` sesuai tabel pada **Bagian 2.1 & 2.2** di atas.
3. Untuk badge status kustom, simpan `colorKey` (misal `'cyan'`, `'purple'`, `'emerald'`, `'amber'`, `'rose'`, `'blue'`, `'orange'`, `'slate'`) di database sehingga ketika pengguna berganti dari Dark Mode ke Light Mode, warna teks dan transparansi background badge otomatis menyesuaikan agar tetap terbaca jelas.

