// Import de Baileys
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const { state, saveState } = useSingleFileAuthState('./session/session.json');
const fs = require('fs');
const path = require('path');

// Créer le socket WhatsApp
async function startBot() {
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        version,
    });

    // Sauvegarde automatique de la session
    sock.ev.on('creds.update', saveState);

    // Événement connexion
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'close') {
            console.log('Connexion fermée, tentative de reconnexion...');
            const reason = (lastDisconnect.error)?.output?.statusCode;
            if(reason !== DisconnectReason.loggedOut) {
                startBot(); // relance le bot automatiquement
            } else {
                console.log('Déconnecté car le compte a été déconnecté de WhatsApp.');
            }
        } else if(connection === 'open') {
            console.log('✅ Bot connecté à WhatsApp !');
        }
    });

    // Gestion des messages entrants
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if(!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const from = msg.key.remoteJid;

        // Commandes simples
        if(!text) return;

        if(text.startsWith('!alive')) {
            await sock.sendMessage(from, { text: '🤖 Bot est en ligne !' });
        } 
        else if(text.startsWith('!ping')) {
            await sock.sendMessage(from, { text: '🏓 Pong !' });
        } 
        else if(text.startsWith('!menu')) {
            await sock.sendMessage(from, { text: '📜 Menu du bot : !alive, !ping, !menu, !vv, !dev, !sudo, !owner, !allvar' });
        } 
        else if(text.startsWith('!vv')) {
            await sock.sendMessage(from, { text: 'Version du bot : 1.0.0' });
        } 
        else if(text.startsWith('!dev')) {
            await sock.sendMessage(from, { text: 'Développeur : IB-HEX' });
        } 
        else if(text.startsWith('!sudo')) {
            await sock.sendMessage(from, { text: 'Commande sudo exécutée !' });
        } 
        else if(text.startsWith('!owner')) {
            await sock.sendMessage(from, { text: 'Propriétaire : IB-HEX' });
        } 
        else if(text.startsWith('!allvar')) {
            await sock.sendMessage(from, { text: 'Toutes les variables sont opérationnelles !' });
        }
    });
}

// Démarrer le bot
startBot();
