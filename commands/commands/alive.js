module.exports = async (sock, msg) => {
  await sock.sendMessage(msg.key.remoteJid, {
    text: "🤖 IB_HEX_BOT est actif et fonctionne correctement ✅"
  })
}
