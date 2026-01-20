const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys")

const Pino = require("pino")
const fs = require("fs")
const config = require("./config")

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session")

  const sock = makeWASocket({
    logger: Pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: true,
    browser: ["IB-HEX-BOT", "Chrome", "1.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid
    const isOwner = config.owner.some(
      v => from.includes(v)
    )

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

    // ❌ IGNORE SI PAS DE PRÉFIXE
    if (!body.startsWith(config.prefix)) return

    const args = body
      .slice(config.prefix.length)
      .trim()
      .split(/ +/)

    const command = args.shift().toLowerCase()

    // ===== MENU =====
    if (command === "menu") {
      await sock.sendMessage(from, {
        text: `
╭──𝗜𝗕-𝗛𝗘𝗫-𝗕𝗢𝗧─────🥷
│ ʙᴏᴛ : ${config.botName}
│ ᴍᴏᴅᴇ : ${config.mode}
│ ᴘʀᴇғɪxᴇ : ${config.prefix}
│ ᴘʀᴏᴘʀɪÉᴛᴀɪʀᴇ : ${config.ownerName}
│ ᴠᴇʀꜱɪᴏɴ : ${config.version}
╰──────────────🥷

🥷 『 MENU HEX-BOT 』
│ ⬡ ${config.prefix}menu
│ ⬡ ${config.prefix}alive
│ ⬡ ${config.prefix}owner
╰────────────────🥷
`
      })
    }

    // ===== ALIVE =====
    if (command === "alive") {
      await sock.sendMessage(from, {
        text: "🤖 IB-HEX-BOT est actif et fonctionne correctement ✅"
      })
    }

    // ===== OWNER =====
    if (command === "owner") {
      await sock.sendMessage(from, {
        text: `👑 Propriétaire : ${config.ownerName}`
      })
    }
  })

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update
    if (connection === "close") {
      if (
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        startBot()
      }
    }
  })
}

startBot()
