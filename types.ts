// Enum untuk mendefinisikan tipe transaksi: Masuk (IN) atau Keluar (OUT).
export enum TransactionType {
    IN = 'IN',
    OUT = 'OUT',
}

// Interface untuk mendefinisikan struktur data sebuah dompet.
export interface Wallet {
    id: string; // ID unik untuk dompet, contoh: 'CASH', 'BRI'.
    name: string; // Nama dompet yang ditampilkan, contoh: 'Cash', 'BRI'.
    balance: number; // Saldo saat ini dalam dompet.
    icon: string; // URL atau path ke ikon dompet (opsional).
}

// Interface untuk mendefinisikan struktur data sebuah transaksi.
export interface Transaction {
    id: string; // ID unik untuk transaksi.
    date: string; // Tanggal transaksi dalam format ISO string.
    description: string; // Deskripsi atau kategori transaksi, contoh: 'Tarik Tunai'.
    customer: string; // Nama pelanggan yang terkait dengan transaksi.
    type: TransactionType; // Tipe transaksi (IN atau OUT).
    amount: number; // Jumlah utama transaksi.
    margin: number; // Keuntungan atau biaya tambahan dari transaksi.
    wallet: string; // ID dompet utama yang terlibat.
    toWallet?: string; // ID dompet tujuan (khusus untuk transfer saldo).
    isPiutang: boolean; // Menandakan apakah transaksi ini adalah piutang (belum lunas).
    marginType?: 'dalam' | 'luar'; // Tipe margin untuk 'Tarik Tunai', menentukan kemana margin dialokasikan.
    isInternalTransfer?: boolean; // Menandakan apakah ini transfer internal antar dompet.
    transferId?: string; // ID unik untuk menghubungkan dua transaksi transfer (keluar dan masuk).
    isDeleting?: boolean; // Status sementara untuk UI saat transaksi sedang dalam proses hapus dengan opsi 'undo'.
    notes?: string; // Catatan tambahan untuk transaksi (opsional).
}

// Tipe alias untuk mendefinisikan halaman yang tersedia di aplikasi.
export type Page = 'dashboard' | 'management' | 'customers' | 'reports' | 'settings';
// Tipe alias untuk kunci yang bisa digunakan untuk mengurutkan tabel transaksi.
export type SortKey = 'date' | 'description' | 'customer' | 'amount' | 'margin';
// Tipe alias untuk arah pengurutan (ascending atau descending).
export type SortDirection = 'asc' | 'desc';
// Tipe alias untuk mendefinisikan jenis huruf yang tersedia di aplikasi.
export type Font = 'font-sans' | 'font-inter' | 'font-poppins' | 'font-roboto-flex';