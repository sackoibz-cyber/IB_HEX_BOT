const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys")

const Pino = require("pino")
const http = require("http")
const config = require("./config")

// 🔥 OBLIGATOIRE POUR RENDER
const PORT = process.env.PORT || 3000

// Petit serveur HTTP pour Render
http.createServer((req, res) => {
  res.writeHead(200)
  res.end("IB-HEX-BOT EN LIGNE")
}).listen(PORT, () => {
  console.log("🌐 Serveur actif sur le port", PORT)
})

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session")

  const sock = makeWASocket({
    logger: Pino({ level: "silent" }),
    auth: state,
    browser: ["IB-HEX-BOT", "Chrome", "1.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  // ✅ GESTION DU QR MODERNE
  sock.ev.on("connection.update", (update) => {
    const { connection, qr, lastDisconnect } = update

    if (qr) {
      console.log("📸 SCANNE CE QR DANS WHATSAPP ⬇️")
      console.log(qr)
    }

    if (connection === "open") {
      console.log("✅ IB-HEX-BOT CONNECTÉ À WHATSAPP")
    }

    if (connection === "close") {
      if (
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        startBot()
      } else {
        console.log("❌ Déconnecté définitivement")
      }
    }
  })

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

    // ❌ Ignore sans préfixe
    if (!body.startsWith(config.prefix)) return

    const command = body
      .slice(config.prefix.length)
      .trim()
      .toLowerCase()

    if (command === "menu") {
      await sock.sendMessage(from, {
        text: `
╭──𝗜𝗕-𝗛𝗘𝗫-𝗕𝗢𝗧─────🥷
│ Bot : ${config.botName}
│ Mode : ${config.mode}
│ Préfixe : ${config.prefix}
│ Owner : ${config.ownerName}
│ Version : ${config.version}
╰──────────────🥷

🥷 ${config.prefix}alive
🥷 ${config.prefix}owner
`
      })
    }

    if (command === "alive") {
      await sock.sendMessage(from, {
        text: "🤖 IB-HEX-BOT est actif ✅"
      })
    }

    if (command === "owner") {
      await sock.sendMessage(from, {
        text: `👑 Propriétaire : ${config.ownerName}`
      })
    }
  })
}

startBot()
