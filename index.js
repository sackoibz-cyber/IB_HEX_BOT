const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys")

const Pino = require("pino")
const readline = require("readline")
const handler = require("./handler")

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session")
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: Pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "silent" }))
    },
    printQRInTerminal: false
  })

  if (!sock.authState.creds.registered) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question("Entre ton numéro WhatsApp (ex: 224621963059): ", async (num) => {
      const code = await sock.requestPairingCode(num)
      console.log("CODE DE CONNEXION :", code)
      rl.close()
    })
  }

  sock.ev.on("messages.upsert", async (m) => {
    handler(sock, m)
  })

  sock.ev.on("creds.update", saveCreds)
}

startBot()
