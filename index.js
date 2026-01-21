const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys")
const Pino = require("pino")
const fs = require("fs")
const http = require("http")
const qrcode = require("qrcode")
const config = require("./config")

const AUTH_FOLDER = "./auth"
if (!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER)

const PORT = process.env.PORT || 3000

// 🌐 Serveur Web pour afficher QR
let qrCodeDataUrl = ""

http.createServer(async (req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" })
    res.end(`
      <h2>IB-HEX-BOT - Scanner le QR WhatsApp</h2>
      <p>Ouvre WhatsApp et scanne le QR pour générer la SESSION_ID</p>
      ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" />` : "<p>QR non généré</p>"}
      <p>Une fois scanné, ton bot sera connecté automatiquement.</p>
    `)
  } else {
    res.writeHead(404)
    res.end("Not found")
  }
}).listen(PORT, () => console.log("Serveur web prêt sur le port", PORT))

// 🔐 Bot WhatsApp avec QR
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER)

  const sock = makeWASocket({
    logger: Pino({ level: "silent" }),
    auth: state,
    browser: ["IB-HEX-BOT", "Chrome", "1.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update

    // Génère le QR pour la page web
    if (qr) {
      qrCodeDataUrl = await qrcode.toDataURL(qr)
      console.log("QR généré pour la page Web")
    }

    if (connection === "open") console.log("✅ BOT CONNECTÉ À WHATSAPP")

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    }
  })

  // Exemple : réponse menu
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return
    const from = msg.key.remoteJid
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""
    if (!text.startsWith(config.prefix)) return
    const cmd = text.slice(config.prefix.length).trim().toLowerCase()
    if (cmd === "menu") {
      await sock.sendMessage(from, { text: "🤖 IB-HEX-BOT est en ligne ✅" })
    }
  })
}

startBot()
