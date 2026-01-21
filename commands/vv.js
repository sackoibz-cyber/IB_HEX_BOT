module.exports = async (sock, msg) => {
  const q = msg.message?.extendedTextMessage?.contextInfo
  if (!q || !q.quotedMessage) return

  const media = await sock.downloadMediaMessage(q)
  await sock.sendMessage(msg.key.remoteJid, { image: media })
}
