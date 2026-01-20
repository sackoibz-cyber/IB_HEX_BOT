const {
  default: makeWASocket,
  DisconnectReason,
  useSingleFileAuthState
} = require("@whiskeysockets/baileys")

const Pino = require("pino")
const fs = require("fs")
const http = require("http")
const config = require("./config")

/* =========================
   🔐 GESTION SESSION_ID
========================= */
if (process.env.SESSION_ID) {
  fs.writeFileSync("./session.json", process.env.SESSION_ID)
}

const { state, saveCreds } = useSingleFileAuthState("./session.json")

/* =========================
   🌐 SERVEUR HTTP (RENDER)
========================= */
const PORT = process.env.PORT || 3000
http.createServer((req, res) => {
  res.writeHead(200)
  res.end("IB-HEX-BOT EN LIGNE")
}).listen(PORT, () => {
  console.log("🌐 Serveur actif sur le port", PORT)
})

/* =========================
   🤖 BOT WHATSAPP
========================= */
async function startBot() {
  const sock = makeWASocket({
    logger: Pino({ level: "silent" }),
    auth: state,
    browser: ["IB-HEX-BOT", "Chrome", "1.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

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
        console.log("❌ SESSION DÉCONNECTÉE")
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

    // ❌ IGNORER SANS PRÉFIXE
    if (!body.startsWith(config.prefix)) return

    const command = body
      .slice(config.prefix.length)
      .trim()
      .toLowerCase()

    // ===== MENU =====
    if (command === "menu") {
      await sock.sendMessage(from, {
        text: `
╭──𝗜𝗕-𝗛𝗘𝗫-𝗕𝗢𝗧─────🥷
│ Bot : ${config.botName}
│ Mode : ${config.mode}
│ Préfixe : ${config.prefix}
│ Propriétaire : ${config.ownerName}
│ Version : ${config.version}
╰──────────────🥷

🥷 ${config.prefix}menu
🥷 ${config.prefix}alive
🥷 ${config.prefix}owner
`
      })
    }

    // ===== ALIVE =====
    if (command === "alive") {
      await sock.sendMessage(from, {
        text: "🤖 IB-HEX-BOT est actif et en ligne ✅"
      })
    }

    // ===== OWNER =====
    if (command === "owner") {
      await sock.sendMessage(from, {
        text: `👑 Propriétaire : ${config.ownerName}`
      })
    }
  })
}

startBot()
