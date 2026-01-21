module.exports = {
    name: 'alive',
    description: 'Vérifie si le bot est en ligne',
    execute: async (sock, sender) => {
        await sock.sendMessage(sender, { text: 'Je suis en ligne 😎' });
    }
}; 
