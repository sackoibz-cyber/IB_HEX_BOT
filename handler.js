const config = require("./config")

module.exports = async (sock, m) => {
  const msg = m.messages[0]
  if (!msg.message || msg.key.fromMe) return

  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    ""

  if (!text.startsWith(config.prefix)) return

  const args = text.slice(config.prefix.length).trim().split(/ +/)
  const command = args.shift().toLowerCase()

  try {
    require(`./commands/${command}`)(sock, msg, args)
  } catch (e) {
    // commande inconnue
  }
}
