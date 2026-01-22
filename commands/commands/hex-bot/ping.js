module.exports = {
    name: 'ping',
    description: 'Vérifie la latence du bot',
    execute: async (sock, message) => {
        const start = Date.now();
        await sock.sendMessage(message.key.remoteJid, { text: 'Pong!' });
        const latency = Date.now() - start;
        await sock.sendMessage(message.key.remoteJid, { text: `Latence : ${latency}ms` });
    }
};
