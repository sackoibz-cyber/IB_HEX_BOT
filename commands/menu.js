module.exports = async (sock, msg) => {
  const menu = `╭──𝗜𝗕-𝗛𝗘𝗫-𝗕𝗢𝗧─────🥷
│ ʙᴏᴛ : IB_HEX_BOT
│ ᴛᴇᴍᴘꜱ : en ligne
│ ᴍᴏᴅᴇ : privé
│ ᴘʀᴇғɪxᴇ : Ib
│ ᴠᴇʀꜱɪᴏɴ : 2.0
╰──────────────🥷

🥷 MENU PRINCIPAL
Ibmenu → afficher menu
Ibalive → état du bot
Ibping → vitesse
Ibowner → propriétaire
Ibdev → développeur
`
  await sock.sendMessage(msg.key.remoteJid, { text: menu })
}
