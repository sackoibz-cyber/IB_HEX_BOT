module.exports = {
    name: 'help',
    description: 'Aide sur les commandes',
    execute: async (sock, sender) => {
        const helpText = `
Liste des commandes:
- Ibping
- Ibalive
- Ibmenu
- Ibninja
- Ibvv
- Ibinfo
- Ibhelp
- Ibecho
        `;
        await sock.sendMessage(sender, { text: helpText });
    }
};
