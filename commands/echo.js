module.exports = {
    name: 'echo',
    description: 'Renvoie le message que vous envoyez après la commande',
    execute: async (sock, sender, text) => {
        const message = text.split(' ').slice(1).join(' ');
        if (!message) return await sock.sendMessage(sender, { text: 'Veuillez écrire un message à répéter après Ibecho.' });
        await sock.sendMessage(sender, { text: message });
    }
};
