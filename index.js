import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import Pino from "pino";
import express from "express";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 10000;

// ===== SESSION =====
const SESSION_DIR = "./session";
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR);

let sock;
let lastQR = null;

// ===== BOT START =====
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    logger: Pino({ level: "silent" }),
    auth: state,
    browser: ["IB-HEX-BOT", "Chrome", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      lastQR = await QRCode.toDataURL(qr);
      console.log("✅ QR généré");
    }

    if (connection === "open") {
      console.log("🤖 IB-HEX-BOT connecté à WhatsApp");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconnexion...");
        startBot();
      } else {
        console.log("❌ Déconnecté (logout)");
      }
    }
  });

  // ===== COMMANDES =====
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (!text.startsWith("Ib")) return;

    const cmd = text.slice(2).trim().toLowerCase();

    const reply = (t) => sock.sendMessage(from, { text: t });

    switch (cmd) {
      case "alive":
        reply("✅ IB-HEX-BOT est actif");
        break;

      case "menu":
        reply(
          `📜 *IB-HEX-BOT MENU*
Ib alive
Ib menu
Ib info
Ib ping
Ib 🥷
+ toutes commandes HEX-BOT`
        );
        break;

      case "info":
        reply("🤖 IB-HEX-BOT\nOwner : IbSacko\nPréfixe : Ib");
        break;

      case "ping":
        reply("🏓 Pong !");
        break;

      case "🥷":
        reply("🥷 Commande ninja activée");
        break;

      default:
        reply("❓ Commande inconnue");
    }
  });
}

startBot();

// ===== WEB =====
app.use(express.static(path.join(__dirname, "public")));

app.get("/qr", (req, res) => {
  res.json({
    connected: !!sock?.user,
    qr: lastQR
  });
});

// ===== PAIR CODE =====
app.get("/pair", async (req, res) => {
  try {
    const number = req.query.number;
    if (!number) return res.json({ error: "Numéro requis" });

    const code = await sock.requestPairingCode(number);
    res.json({ code });
  } catch (e) {
    res.json({ error: "Impossible de générer le Pair Code" });
  }
});

app.listen(PORT, () =>
  console.log(`🌐 Interface Web active sur le port ${PORT}`)
);
