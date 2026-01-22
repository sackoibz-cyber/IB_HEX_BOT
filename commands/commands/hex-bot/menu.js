module.exports = {
    name: 'menu',
    description: 'Affiche le menu principal',
    execute: async (sock, message) => {
        const menuText = `
╭──𝗜𝗕-𝗛𝗘𝗫-𝗕𝗢𝗧─────🥷
│ ʙᴏᴛ : IB_HEX_BOT
│ ᴘʀᴇғɪxᴇ : Ib
╰──────────────🥷
『 𝗠𝗘𝗡𝗨 𝗛𝗘𝗫-𝗕𝗢𝗧 』
⬡ Ibmenu → afficher le menu
⬡ Ibalive → état du bot
⬡ Ibsudo → super utilisateurs
⬡ Ibdev → développeur
⬡ Iballvar → toutes les variables
⬡ Ibping → vitesse du bot
⬡ Ibowner → propriétaire
        `;
        await sock.sendMessage(message.key.remoteJid, { text: menuText });
    }
};
