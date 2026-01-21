import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import Pino from "pino";
import fs from "fs";
import http from "http";
import QRCode from "qrcode";

// Dossier pour stocker la session
const AUTH_FOLDER = "./session";
if (!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER);

// Serveur web pour afficher le QR
let qrCodeDataUrl = "";
const PORT = process.env.PORT || 10000;

// Page web pour QR
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  if (qrCodeDataUrl) {
    res.end(`
      <html>
        <head><meta charset="UTF-8"><title>IB-HEX-BOT - QR WhatsApp</title></head>
        <body>
          <h2>IB-HEX-BOT - Scanner le QR WhatsApp</h2>
          <img src="${qrCodeDataUrl}" />
          <p>Une fois scanné, le bot sera connecté automatiquement.</p>
        </body>
      </html>
    `);
  } else {
    res.end(`
      <html>
        <head><meta charset="UTF-8"><title>IB-HEX-BOT</title></head>
        <body>
          <h2>IB-HEX-BOT - Scanner le QR WhatsApp</h2>
          <p>QR non généré pour le moment...</p>
        </body>
      </html>
    `);
  }
}).listen(PORT, () => console.log(`Serveur web actif sur le port ${PORT}`));

// Fonction principale du bot
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

  const sock = makeWASocket({
    logger: Pino({ level: "silent" }),
    auth: state,
    browser: ["IB-HEX-BOT", "Chrome", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Générer le QR pour la page web
    if (qr) {
      qrCodeDataUrl = await QRCode.toDataURL(qr);
      console.log("QR généré pour la page web ✅");
    }

    if (connection === "open") {
      console.log("Bot connecté à WhatsApp ✅");
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log("Reconnexion...");
        startBot();
      }
    }
  });

  // Événement messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    // Vérifie le préfixe Ib
    if (!text.startsWith("Ib")) return;

    const cmd = text.slice(2).trim().toLowerCase();

    if (cmd === "menu") {
      await sock.sendMessage(from, { text: "🤖 IB-HEX-BOT est en ligne ✅" });
    }
    // Ici tu peux ajouter toutes les autres commandes comme alive, owner, etc.
  });
}

startBot();
