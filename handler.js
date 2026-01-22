const fs = require('fs');
const path = require('path');

// Fonction principale pour gérer les messages
module.exports = (sock) => {

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const from = msg.key.remoteJid;

        if(!text) return;

        // Vérifie le préfixe obligatoire "Ib"
        if(!text.startsWith('Ib')) return;

        // Retire le préfixe pour identifier la commande
        const command = text.slice(2).trim().split(' ')[0].toLowerCase();

        // COMMANDES HEX-BOT
        if(command === 'ping') {
            await sock.sendMessage(from, { text: '🏓 Pong !' });
        } else if(command === 'alive') {
            await sock.sendMessage(from, { text: '🤖 IB_HEX_BOT est en ligne !' });
        } else if(command === 'menu') {
            await sock.sendMessage(from, { text: '📜 Menu du bot :\n- Ibalive\n- Ibping\n- Ibmenu\n- Ibvv\n- Ibdev\n- Ibsudo\n- Ibowner\n- Iballvar' });
        }

        // COMMANDES OWNER
        else if(command === 'vv') {
            await sock.sendMessage(from, { text: 'Version du bot : 2.0' });
        } else if(command === 'dev') {
            await sock.sendMessage(from, { text: 'Développeur : IB-HEX' });
        } else if(command === 'sudo') {
            await sock.sendMessage(from, { text: 'Commande sudo exécutée !' });
        } else if(command === 'owner') {
            await sock.sendMessage(from, { text: 'Propriétaire : IBSacko' });
        } else if(command === 'allvar') {
            await sock.sendMessage(from, { text: 'Toutes les variables sont opérationnelles !' });
        }

        // IA / Chatbot
        else if(command === 'help') {
            await sock.sendMessage(from, { text: '💡 Commandes IA : Ibhelp, Ibecho' });
        } else if(command === 'echo') {
            const msgText = text.slice(6); // supprime "Ibecho"
            await sock.sendMessage(from, { text: msgText || 'Vous devez écrire quelque chose après Ibecho !' });
        }

        // Tu peux ajouter ici toutes les autres catégories de commandes
    });
};
