// app.js

// Sélection des éléments HTML
const qrImg = document.getElementById("qr-code");
const pairBtn = document.getElementById("pair-btn");
const qrBtn = document.getElementById("qr-btn");
const phoneInputDiv = document.getElementById("phone-input-div");
const phoneInput = document.getElementById("phone-number");
const sendBtn = document.getElementById("send-number");
const statusDiv = document.getElementById("status");

// Fonction pour afficher le QR Code
async function getQRCode() {
  const res = await fetch("/qr");
  const data = await res.json();
  if (!data.connected && data.qr) {
    qrImg.src = data.qr;
    statusDiv.innerText = "📱 Scanne le QR Code avec WhatsApp.";
  } else if (data.connected) {
    qrImg.src = "";
    statusDiv.innerText = "✅ Bot déjà connecté.";
  }
}

// Afficher le formulaire pour Pair Code
function showPairForm() {
  phoneInputDiv.style.display = "block";
}

// Envoi du numéro pour générer SESSION_ID
sendBtn.addEventListener("click", async () => {
  const number = phoneInput.value.trim();
  if (!number) return alert("Entre ton numéro WhatsApp !");
  const res = await fetch(`/pair?number=${encodeURIComponent(number)}`);
  const data = await res.json();
  if (data.success) {
    statusDiv.innerText = "✅ Session ID régénéré avec succès !";
    phoneInputDiv.style.display = "none";
    phoneInput.value = "";
    getQRCode(); // Affiche le QR si besoin
  } else {
    statusDiv.innerText = "❌ Erreur lors de la génération de Session.";
  }
});

// Boutons
qrBtn.addEventListener("click", () => {
  phoneInputDiv.style.display = "none";
  getQRCode();
});
pairBtn.addEventListener("click", showPairForm);

// Initialisation : montre le QR au chargement
getQRCode();
