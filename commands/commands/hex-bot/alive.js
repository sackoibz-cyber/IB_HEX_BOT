module.exports = {
    name: 'alive',
    description: 'Vérifie si le bot est en ligne',
    execute: async (sock, message) => {
        await sock.sendMessage(message.key.remoteJid, { 
            text: `✅ IB_HEX_BOT est en ligne !\nTemps de fonctionnement : 0h 0m 0s` 
        });
    }
};
