module.exports = {
    name: 'ping',
    description: 'Répond avec Pong!',
    execute: async (sock, sender) => {
        await sock.sendMessage(sender, { text: 'Pong!' });
    }
};
