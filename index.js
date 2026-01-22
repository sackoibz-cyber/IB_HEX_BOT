const { default: makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const { state, saveState } = useSingleFileAuthState('./session/session.json');

// Création du socket WhatsApp
const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
});

// Sauvegarde automatique des credentials
sock.ev.on('creds.update', saveState);

// Gestion des connexions
sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if(connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
        console.log('Connexion fermée, tentative de reconnexion...', reason);
        // Relancer ton bot automatiquement si tu veux
    } else if(connection === 'open') {
        console.log('Bot connecté à WhatsApp !');
    }
});

// Import des commandes
const handler = require('./handler');
handler(sock);
