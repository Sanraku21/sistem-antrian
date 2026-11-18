
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

// Memulihkan antrean yang sedang dipanggil
let aktif = antrean.find(a => a.status === "Dipanggil") || null;

// Pengaturan halaman tabel
let halamanSekarang = 1;
const dataPerHalaman = 10;


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

    counter[layanan]++;

    const nomor = layanan + "-" +
        String(counter[layanan]).padStart(3, "0");

    const data = {
        nomor: nomor,
        nama: nama,
        layanan: layanan,
        waktu: Date.now(),
        status: "Menunggu"
    };

    antrean.push(data);

    halamanSekarang = 1;

    simpanData();
    tampilkanAntrean();

    document.getElementById("hasil").innerHTML =
        "Nomor antrean Anda:" +
        "<h2>" + escapeHTML(nomor) + "</h2>" +
        "Layanan: " + escapeHTML(layananList[layanan]);

    document.getElementById("nama").value = "";
    document.getElementById("layanan").value = "";
}


/* =================================
   MENAMPILKAN ANTREAN
================================= */

function tampilkanAntrean() {

    const tabel = document.getElementById("daftarAntrean");

    // Menampilkan seluruh riwayat antrean
    const daftarTampil = antrean
        .filter(a =>
            a.status === "Menunggu" ||
            a.status === "Dipanggil" ||
            a.status === "Selesai" ||
            a.status === "Dilewati"
        )
        .sort((a, b) => a.waktu - b.waktu);

    const totalHalaman = Math.max(
        1,
        Math.ceil(daftarTampil.length / dataPerHalaman)
    );

    // Memastikan halaman tetap dalam batas
    halamanSekarang = Math.max(
        1,
        Math.min(halamanSekarang, totalHalaman)
    );

    const awal = (halamanSekarang - 1) * dataPerHalaman;

    const dataHalaman = daftarTampil.slice(
        awal,
        awal + dataPerHalaman
    );

    tabel.innerHTML = "";

    if (dataHalaman.length === 0) {

        tabel.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    Belum ada antrean.
                </td>
            </tr>
        `;

    } else {

        dataHalaman.forEach((a, index) => {

            // Tombol untuk semua antrean kecuali yang sudah selesai
            let tombolPanggil = "-";

            if (a.status === "Menunggu") {
                tombolPanggil = `
                    <button class="btn-warning btn-repeat"
                        onclick="panggilUlang('${escapeHTML(a.nomor)}')">
                        <i class="bi bi-volume-up-fill"></i>
                        Panggil
                    </button>
                `;
            } else if (
                a.status === "Dipanggil" ||
                a.status === "Dilewati"
            ) {
                tombolPanggil = `
                    <button class="btn-warning btn-repeat"
                        onclick="panggilUlang('${escapeHTML(a.nomor)}')">
                        <i class="bi bi-volume-up-fill"></i>
                        Panggil Ulang
                    </button>
                `;
            }

            tabel.innerHTML += `
                <tr>
                    <td>${awal + index + 1}</td>

                    <td>
                        <strong>${escapeHTML(a.nomor)}</strong>
                    </td>

                    <td>${escapeHTML(a.nama)}</td>

                    <td>
                        ${escapeHTML(
                            layananList[a.layanan] || a.layanan
                        )}
                    </td>

                    <td>
                        <span class="status-${a.status.toLowerCase()}">
                            ${escapeHTML(a.status)}
                        </span>
                    </td>

                    <td>${tombolPanggil}</td>
                </tr>
            `;
        });
    }

    // Informasi halaman
    document.getElementById("infoHalaman").textContent =
        `Halaman ${halamanSekarang} dari ${totalHalaman}`;

    document.getElementById("btnSebelumnya").disabled =
        halamanSekarang === 1;

    document.getElementById("btnBerikutnya").disabled =
        halamanSekarang === totalHalaman;

    // Tampilan pemanggilan utama
    document.getElementById("nomorAktif").textContent =
        aktif ? aktif.nomor : "-";

    document.getElementById("namaAktif").textContent =
        aktif ? aktif.nama : "Belum ada antrean";

    document.getElementById("layananAktif").textContent =
        aktif ? layananList[aktif.layanan] : "";

    tampilkanNomorLayanan();
}


/* =================================
   PINDAH HALAMAN TABEL
================================= */

function ubahHalaman(arah) {

    halamanSekarang += arah;

    tampilkanAntrean();
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
            elemen.textContent = key + "-" +
                String(counter[key]).padStart(3, "0");
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

function suaraAntrean(data) {

    if (!data) return;

    if (!("speechSynthesis" in window)) {
        alert("Fitur suara tidak didukung browser ini.");
        return;
    }

    window.speechSynthesis.cancel();

    const pesan = new SpeechSynthesisUtterance(
        "Nomor antrean " +
        data.nomor +
        ", atas nama " +
        data.nama +
        ", untuk layanan " +
        layananList[data.layanan] +
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

    // Mengambil antrean Menunggu paling awal
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

    suaraAntrean(aktif);
}


/* =================================
   PANGGIL ULANG / PANGGIL LANGSUNG
   Bisa dari tabel dan dashboard
================================= */

function panggilUlang(nomor = aktif ? aktif.nomor : null) {

    if (!nomor) {
        alert("Pilih antrean yang ingin dipanggil.");
        return;
    }

    const data = antrean.find(a =>
        a.nomor === nomor &&
        (
            a.status === "Menunggu" ||
            a.status === "Dipanggil" ||
            a.status === "Dilewati"
        )
    );

    if (!data) {
        alert("Antrean tidak ditemukan atau sudah selesai.");
        return;
    }

    // Jika ada antrean aktif lain, kembalikan ke Menunggu
    if (aktif && aktif.nomor !== data.nomor) {
        aktif.status = "Menunggu";
    }

    // Jadikan antrean yang dipilih sebagai antrean aktif
    data.status = "Dipanggil";
    aktif = data;

    simpanData();
    tampilkanAntrean();

    // Panggil suara antrean
    suaraAntrean(data);
}


/* =================================
   SELESAIKAN ANTREAN
================================= */

function selesaikan() {

    if (!aktif) {
        alert("Tidak ada antrean aktif.");
        return;
    }

    // Mengubah status tanpa menghapus data
    aktif.status = "Selesai";

    // Mengosongkan antrean aktif
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

    // Mengubah status tanpa menghapus data
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

    if (!konfirmasi) return;

    antrean = [];
    aktif = null;
    halamanSekarang = 1;

    Object.keys(counter).forEach(key => {
        counter[key] = 0;
    });

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
