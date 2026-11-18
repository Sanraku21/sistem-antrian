
/* =================================
   DATA ANTREAN
================================= */

const layananList = {
    R1: "BAST - Notaris Ibu Maria Magdalena",
    R2: "BAST - Notaris Ibu Telly Feberianawati",
    R3: "BAST - Notaris Ibu Tiara Vita",
    R4: "BAST - Notaris Bpk Achmad Muharam",
    PBB: "Pengambilan PBB",
    LGL: "Pengambilan Dokumen Asli",
    PPJB: "Pengambilan PPJB"
};

let antrean = JSON.parse(localStorage.getItem("antrean")) || [];

let counter = JSON.parse(localStorage.getItem("counter")) || {
    R1: 0,
    R2: 0,
    R3: 0,
    R4: 0,
    PBB: 0,
    LGL: 0,
    PPJB: 0
};

// Memastikan semua kategori memiliki counter
Object.keys(layananList).forEach(key => {
    if (typeof counter[key] !== "number") {
        counter[key] = 0;
    }
});

// Mengambil antrean aktif setelah halaman di-refresh
let aktif = antrean.find(a => a.status === "Dipanggil") || null;


/* =================================
   SIMPAN DATA
================================= */

function simpanData() {
    localStorage.setItem("antrean", JSON.stringify(antrean));
    localStorage.setItem("counter", JSON.stringify(counter));
}


/* =================================
   AMBIL NOMOR ANTREAN
================================= */

function ambilAntrean() {

    const nama = document.getElementById("nama").value.trim();
    const layanan = document.getElementById("layanan").value;

    if (!nama || !layanan) {
        alert("Nama dan jenis layanan harus diisi!");
        return;
    }

    if (!layananList[layanan]) {
        alert("Jenis layanan tidak valid!");
        return;
    }

    // Tambah nomor antrean berdasarkan layanan
    counter[layanan]++;

    const nomor = layanan + "-" +
        String(counter[layanan]).padStart(3, "0");

    // Membuat data antrean
    const data = {
        nomor: nomor,
        nama: nama,
        layanan: layanan,
        waktu: Date.now(),
        status: "Menunggu"
    };

    antrean.push(data);

    simpanData();
    tampilkanAntrean();

    // Menampilkan nomor antrean kepada pengunjung
    document.getElementById("hasil").innerHTML =
        "Nomor antrean Anda: " +
        "<h2>" + escapeHTML(nomor) + "</h2>" +
        "Layanan: " + escapeHTML(layananList[layanan]);

    // Mengosongkan formulir
    document.getElementById("nama").value = "";
    document.getElementById("layanan").value = "";
}


/* =================================
   MENAMPILKAN ANTREAN
================================= */

function tampilkanAntrean() {

    const tabel = document.getElementById("daftarAntrean");

    tabel.innerHTML = "";

    // Menampilkan antrean yang masih menunggu
    const daftarMenunggu = antrean
        .filter(a => a.status === "Menunggu")
        .sort((a, b) => a.waktu - b.waktu);

    if (daftarMenunggu.length === 0) {
        tabel.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    Belum ada antrean menunggu.
                </td>
            </tr>
        `;
    } else {

        daftarMenunggu.forEach((a, index) => {

            tabel.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHTML(a.nomor)}</td>
                    <td>${escapeHTML(a.nama)}</td>
                    <td>${escapeHTML(layananList[a.layanan] || a.layanan)}</td>
                    <td>${escapeHTML(a.status)}</td>
                </tr>
            `;

        });
    }

    // Menampilkan nomor antrean aktif
    document.getElementById("nomorAktif").textContent =
        aktif ? aktif.nomor : "-";

    document.getElementById("namaAktif").textContent =
        aktif ? aktif.nama : "Belum ada antrean";

    document.getElementById("layananAktif").textContent =
        aktif ? layananList[aktif.layanan] : "";

    // Memperbarui daftar nomor setiap layanan
    tampilkanNomorLayanan();
}


/* =================================
   NOMOR SETIAP LAYANAN
================================= */

function tampilkanNomorLayanan() {

    const kategori = {
        R1: "jumlahR1",
        R2: "jumlahR2",
        R3: "jumlahR3",
        R4: "jumlahR4",
        PBB: "jumlahPBB",
        LGL: "jumlahLGL",
        PPJB: "jumlahPPJB"
    };

    Object.keys(kategori).forEach(key => {

        const elemen = document.getElementById(kategori[key]);

        if (elemen) {

            const nomor = key + "-" +
                String(counter[key]).padStart(3, "0");

            elemen.textContent = nomor;
        }

    });
}


/* =================================
   MENCEGAH HTML BERBAHAYA
================================= */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

}


/* =================================
   SUARA PEMANGGILAN
================================= */

function suaraAntrean() {

    if (!aktif) return;

    if (!("speechSynthesis" in window)) {
        alert("Fitur suara tidak didukung browser ini.");
        return;
    }

    window.speechSynthesis.cancel();

    const pesan = new SpeechSynthesisUtterance(
        "Nomor antrean " +
        aktif.nomor +
        ", atas nama " +
        aktif.nama +
        ", untuk layanan " +
        layananList[aktif.layanan] +
        ", silakan menuju petugas."
    );

    pesan.lang = "id-ID";
    pesan.rate = 0.9;
    pesan.pitch = 1;

    window.speechSynthesis.speak(pesan);
}


/* =================================
   PANGGIL ANTREAN BERIKUTNYA
================================= */

function panggilBerikutnya() {

    if (aktif) {
        alert("Selesaikan atau lewati antrean aktif terlebih dahulu!");
        return;
    }

    // Mengambil antrean paling awal dari seluruh layanan
    const berikutnya = antrean
        .filter(a => a.status === "Menunggu")
        .sort((a, b) => a.waktu - b.waktu)[0];

    if (!berikutnya) {
        alert("Tidak ada antrean yang menunggu.");
        return;
    }

    berikutnya.status = "Dipanggil";

    aktif = berikutnya;

    simpanData();
    tampilkanAntrean();

    // Memanggil nomor menggunakan suara
    suaraAntrean();
}


/* =================================
   PANGGIL ULANG
================================= */

function panggilUlang() {

    if (!aktif) {
        alert("Belum ada antrean yang dipanggil.");
        return;
    }

    suaraAntrean();
}


/* =================================
   SELESAIKAN ANTREAN
================================= */

function selesaikan() {

    if (!aktif) {
        alert("Tidak ada antrean aktif.");
        return;
    }

    aktif.status = "Selesai";

    aktif = null;

    simpanData();
    tampilkanAntrean();
}


/* =================================
   LEWATI ANTREAN
================================= */

function lewati() {

    if (!aktif) {
        alert("Tidak ada antrean aktif.");
        return;
    }

    aktif.status = "Dilewati";

    aktif = null;

    simpanData();
    tampilkanAntrean();
}


/* =================================
   RESET ANTREAN
================================= */

function resetAntrean() {

    const konfirmasi = confirm(
        "Apakah Anda yakin ingin mereset semua antrean?\n\n" +
        "Seluruh data antrean dan nomor layanan akan dihapus."
    );

    if (!konfirmasi) {
        return;
    }

    // Menghapus seluruh data antrean
    antrean = [];

    aktif = null;

    // Mengembalikan semua nomor ke nol
    Object.keys(counter).forEach(key => {
        counter[key] = 0;
    });

    // Menghentikan suara jika sedang berjalan
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    simpanData();
    tampilkanAntrean();

    document.getElementById("hasil").innerHTML = "";

    alert("Semua antrean berhasil direset.");
}


/* =================================
   JALANKAN SAAT HALAMAN DIBUKA
================================= */

tampilkanAntrean();
