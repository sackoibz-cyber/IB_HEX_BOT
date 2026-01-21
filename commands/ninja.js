module.exports = {
    name: 'ninja',
    description: 'Commande Ninja',
    execute: async (sock, sender) => {
        await sock.sendMessage(sender, { text: '🥷 Ninja activé!' });
    }
};
