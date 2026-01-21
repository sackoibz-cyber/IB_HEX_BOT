module.exports = {
    name: 'info',
    description: 'Informations sur le bot',
    execute: async (sock, sender) => {
        const infoText = `
🤖 Nom du bot: IB HEX BOT
⚡ Version: 1.0.0
📡 Status: En ligne
        `;
        await sock.sendMessage(sender, { text: infoText });
    }
};
