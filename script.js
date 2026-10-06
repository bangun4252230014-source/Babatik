// =====================================================
// CANVAS SETUP
// =====================================================
const canvas = document.getElementById("canvasSketsa");
const ctx = canvas.getContext("2d");

const canvasBatik = document.getElementById("canvasBatik");
const ctxBatik = canvasBatik.getContext("2d");

let menggambar = false;

canvas.width = 450;
canvas.height = 450;

canvasBatik.width = 450;
canvasBatik.height = 450;

// Pengaturan awal kuas
ctx.lineWidth = 4;
ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.strokeStyle = document.getElementById("warnaMotif").value;

// =====================================================
// POSISI POINTER (MOUSE / TOUCH)
// =====================================================
function posisiPointer(event) {
    const rect = canvas.getBoundingClientRect();
    let x, y;

    if (event.touches && event.touches.length > 0) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
    } else {
        x = event.clientX;
        y = event.clientY;
    }

    return {
        x: (x - rect.left) * (canvas.width / rect.width),
        y: (y - rect.top) * (canvas.height / rect.height)
    };
}

// =====================================================
// EVENT MENGGAMBAR SKETSA
// =====================================================
function mulaiGambar(event) {
    event.preventDefault();
    menggambar = true;
    const posisi = posisiPointer(event);
    ctx.beginPath();
    ctx.moveTo(posisi.x, posisi.y);
}

function gambar(event) {
    if (!menggambar) return;
    event.preventDefault();
    const posisi = posisiPointer(event);
    ctx.lineTo(posisi.x, posisi.y);
    ctx.stroke();
    gambarBatik();
}

function berhentiGambar(event) {
    if (!menggambar) return;
    event.preventDefault();
    menggambar = false;
    ctx.closePath();
    gambarBatik();
}

// Event Listeners Sketsa
canvas.addEventListener("mousedown", mulaiGambar);
canvas.addEventListener("mousemove", gambar);
canvas.addEventListener("mouseup", berhentiGambar);
canvas.addEventListener("mouseleave", berhentiGambar);

canvas.addEventListener("touchstart", mulaiGambar, { passive: false });
canvas.addEventListener("touchmove", gambar, { passive: false });
canvas.addEventListener("touchend", berhentiGambar, { passive: false });

// =====================================================
// EVENT CONTROLS
// =====================================================
document.getElementById("warnaMotif").addEventListener("input", function () {
    ctx.strokeStyle = this.value;
    gambarBatik();
});

document.getElementById("hapus").addEventListener("click", function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gambarBatik();
});

document.getElementById("skala").addEventListener("input", function () {
    document.getElementById("nilaiSkala").textContent = this.value + "%";
    gambarBatik();
});

document.getElementById("rotasi").addEventListener("input", function () {
    document.getElementById("nilaiRotasi").textContent = this.value + "°";
    gambarBatik();
});

document.getElementById("kedalaman").addEventListener("input", gambarBatik);
document.getElementById("cermin").addEventListener("change", gambarBatik);
document.getElementById("warnaLatar").addEventListener("input", gambarBatik);
document.getElementById("generate").addEventListener("click", gambarBatik);

// =====================================================
// GENERATOR BATIK (GRID & REKURSI SIMETRIS)
// =====================================================
function gambarBatik() {
    const warnaLatar = document.getElementById("warnaLatar").value;
    const kedalaman = Number(document.getElementById("kedalaman").value);
    const rotasi = Number(document.getElementById("rotasi").value);
    const cermin = document.getElementById("cermin").checked;
    const skalaInput = Number(document.getElementById("skala").value) / 100;

    ctxBatik.clearRect(0, 0, canvasBatik.width, canvasBatik.height);

    ctxBatik.fillStyle = warnaLatar;
    ctxBatik.fillRect(0, 0, canvasBatik.width, canvasBatik.height);

    // Ubah pembagian grid agar tidak terlalu ekstrem saat kedalaman naik
    // Kedalaman 0 = 1x1, Kedalaman 1 = 2x2, Kedalaman 2 = 3x3, Kedalaman 3 = 4x4
    const barisKolom = kedalaman + 1; 
    const ukuranUbin = canvasBatik.width / barisKolom;

    for (let i = 0; i < barisKolom; i++) {
        for (let j = 0; j < barisKolom; j++) {
            const x = i * ukuranUbin;
            const y = j * ukuranUbin;

            const cerminX = cermin && (i % 2 === 1);
            const cerminY = cermin && (j % 2 === 1);

            gambarUbinMotif(
                canvas,
                x,
                y,
                ukuranUbin,
                rotasi,
                cerminX,
                cerminY,
                skalaInput
            );
        }
    }
}

// Fungsi Menggambar 1 Ubin Motif secara Presisi
function gambarUbinMotif(source, x, y, ukuran, rotasi, cerminX, cerminY, skala) {
    ctxBatik.save();

    // Transformasi ke titik tengah ubin
    const centerX = x + ukuran / 2;
    const centerY = y + ukuran / 2;
    ctxBatik.translate(centerX, centerY);

    // Rotasi Motif
    ctxBatik.rotate((rotasi * Math.PI) / 180);

    // Skala Cermin Simetris
    const scaleX = cerminX ? -1 : 1;
    const scaleY = cerminY ? -1 : 1;
    ctxBatik.scale(scaleX, scaleY);

    // Sesuaikan Skala Motif terhadap Ukuran Ubin
    const rasio = (ukuran / source.width) * skala;
    ctxBatik.scale(rasio, rasio);

    // Gambar Sketsa tepat di tengah
    ctxBatik.drawImage(source, -source.width / 2, -source.height / 2);

    ctxBatik.restore();
}

// Download
document.getElementById("download").addEventListener("click", function () {
    gambarBatik();
    const link = document.createElement("a");
    link.download = "hasil-batik.png";
    link.href = canvasBatik.toDataURL("image/png");
    link.click();
});

// Inisialisasi awal
gambarBatik();