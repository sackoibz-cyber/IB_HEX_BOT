module.exports = {
    name: 'menu',
    description: 'Affiche le menu des commandes',
    execute: async (sock, sender) => {
        const menuText = `
Menu des commandes:
- Ibping
- Ibalive
- Ibmenu
- Ibninja
- Ibvv
- Ibinfo
- Ibhelp
- Ibecho
        `;
        await sock.sendMessage(sender, { text: menuText });
    }
};
