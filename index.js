const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const PREFIX = 'Ib'; // Préfixe obligatoire

const commands = new Map();

async function loadCommands() {
    const commandFolders = fs.readdirSync('./commands/');

    for (const folder of commandFolders) {
        const folderPath = path.join('./commands/', folder);
        if (!fs.lstatSync(folderPath).isDirectory()) continue;

        const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
        for (const file of files) {
            const command = require(path.join(folderPath, file));
            if (command.name && typeof command.run === 'function') {
                commands.set(command.name.toLowerCase(), command);
            }
        }
    }

    console.log(`✅ ${commands.size} commandes chargées !`);
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: P({ level: 'silent' }),
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) qrcode.generate(qr, { small: true });

        if (connection === 'close') {
            const reason = lastDisconnect.error?.output?.statusCode;
            console.log('Déconnexion :', reason);

            if (reason !== DisconnectReason.loggedOut) startBot();
        } else if (connection === 'open') {
            console.log('✅ Connecté à WhatsApp !');
        }
    });

    sock.ev.on('messages.upsert', async (msgUpdate) => {
        const msg = msgUpdate.messages[0];
        if (!msg.message) return;

        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!text) return;

        if (!text.startsWith(PREFIX)) return;

        const args = text.slice(PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = commands.get(commandName);
        if (command) {
            try {
                await command.run(sock, msg, args);
            } catch (err) {
                console.error(`Erreur commande ${commandName}:`, err);
            }
        }
    });
}

// Chargement des commandes puis démarrage du bot
loadCommands().then(startBot);
