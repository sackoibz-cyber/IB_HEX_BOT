const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys")

const Pino = require("pino")
const fs = require("fs")
const http = require("http")
const config = require("./config")

// 🌐 Serveur Render (obligatoire)
const PORT = process.env.PORT || 3000
http.createServer((req, res) => {
  res.writeHead(200)
  res.end("IB-HEX-BOT ACTIF")
}).listen(PORT)

// 📁 Dossier auth
const AUTH_FOLDER = "./auth"

// 🔐 Écriture de la SESSION_ID
if (process.env.SESSION_ID && !fs.existsSync(AUTH_FOLDER)) {
  fs.mkdirSync(AUTH_FOLDER)
  fs.writeFileSync(
    `${AUTH_FOLDER}/creds.json`,
    process.env.SESSION_ID
  )
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER)

  const sock = makeWASocket({
    logger: Pino({ level: "silent" }),
    auth: state,
    browser: ["IB-HEX-BOT", "Chrome", "1.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "open") {
      console.log("✅ BOT CONNECTÉ À WHATSAPP")
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut

      if (shouldReconnect) startBot()
    }
  })

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

    if (!text.startsWith(config.prefix)) return

    const cmd = text
      .slice(config.prefix.length)
      .trim()
      .toLowerCase()

    if (cmd === "menu") {
      await sock.sendMessage(from, {
        text: "🤖 IB-HEX-BOT est en ligne"
      })
    }
  })
}

startBot()
