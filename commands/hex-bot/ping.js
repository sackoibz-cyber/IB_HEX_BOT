module.exports = {
    name: 'ping',
    category: 'hex-bot',
    description: 'Répond avec Pong!',
    execute: async (sock, sender) => {
        await sock.sendMessage(sender, { text: 'Pong!' });
    }
}; 
