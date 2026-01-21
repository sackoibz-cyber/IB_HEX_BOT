module.exports = {
    name: 'vv',
    description: 'Commande VV',
    execute: async (sock, sender) => {
        await sock.sendMessage(sender, { text: 'VV activé!' });
    }
}; 
