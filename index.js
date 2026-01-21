const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: P({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    // Charger toutes les commandes dans commands/
    const commands = new Map();
    const commandFolders = fs.readdirSync('./commands');

    for (const folder of commandFolders) {
        const files = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith('.js'));
        for (const file of files) {
            const command = require(`./commands/${folder}/${file}`);
            commands.set(command.name.toLowerCase(), command);
        }
    }

    // Gestion de la connexion
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) qrcode.generate(qr, { small: true });
        if (connection === 'close') {
            const reason = lastDisconnect.error?.output?.statusCode;
            console.log('Déconnexion :', reason);
            if (reason !== DisconnectReason.loggedOut) startBot();
        } else if (connection === 'open') {
            console.log('✅ Connecté à WhatsApp!');
        }
    });

    // Écoute des messages
    sock.ev.on('messages.upsert', async (msgUpdate) => {
        const msg = msgUpdate.messages[0];
        if (!msg.message) return;

        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!text) return;

        if (!text.startsWith('Ib')) return; // préfixe obligatoire

        const commandName = text.slice(2).toLowerCase();
        const command = commands.get(commandName);
        if (command) {
            try {
                await command.execute(sock, sender, text);
            } catch (err) {
                console.error(`Erreur dans la commande ${commandName}:`, err);
            }
        }
    });
}

startBot();
