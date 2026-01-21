const qrImg = document.getElementById("qr");
const sessionInput = document.getElementById("session");
const statusText = document.getElementById("status");

async function fetchQR() {
    try {
        const res = await fetch("/qr");
        const data = await res.json();

        if (data.connected) {
            qrImg.style.display = "none";
            sessionInput.value = JSON.stringify(data.session);
            statusText.innerText = "✅ Bot connecté avec SESSION_ID prêt !";
        } else if (data.qr) {
            qrImg.src = data.qr;
            qrImg.style.display = "block";
            sessionInput.value = "";
            statusText.innerText = "📡 Scannez le QR pour connecter le bot.";
        } else {
            qrImg.style.display = "none";
            sessionInput.value = "";
            statusText.innerText = "⚠️ QR non généré, le bot se connecte...";
        }
    } catch (err) {
        console.error(err);
        statusText.innerText = "⚠️ Erreur de connexion au serveur";
    }
}

// Copie SESSION_ID dans le presse-papier
function copySession() {
    sessionInput.select();
    sessionInput.setSelectionRange(0, 99999);
    document.execCommand("copy");
    alert("SESSION_ID copié !");
}

// Vérifie toutes les 3 secondes
setInterval(fetchQR, 3000);
fetchQR();
