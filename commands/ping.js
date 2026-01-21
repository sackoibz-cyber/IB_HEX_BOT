module.exports = async (sock, msg) => {
  const start = Date.now()
  const end = Date.now() - start

  await sock.sendMessage(msg.key.remoteJid, {
    text: `⚡ Pong : ${end} ms`
  })
}
