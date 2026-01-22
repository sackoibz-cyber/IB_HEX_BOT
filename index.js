const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const qrcode = require('qrcode-terminal');

const prefix = 'Ib'; // Préfix obligatoire

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`WhatsApp version: v${version.join('.')}, latest: ${isLatest}`);

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        version
    });

    sock.ev.on('creds.update', saveCreds);

    // Charger les commandes
    const commands = new Map();
    const commandFolders = fs.readdirSync('./commands');
    for (const folder of commandFolders) {
        const folderPath = `./commands/${folder}`;
        if (!fs.lstatSync(folderPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`${folderPath}/${file}`);
            if (command.name) commands.set(command.name, command);
        }
    }

    // Quand un message arrive
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!text || !text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = commands.get(commandName);
        if (!command) return;

        try {
            await command.run(sock, msg, args);
        } catch (err) {
            console.error(err);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Une erreur est survenue lors de l’exécution de la commande.' });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) qrcode.generate(qr, { small: true });

        if (connection === 'close') {
            const reason = lastDisconnect.error?.output?.statusCode;
            console.log('Déconnexion:', reason);

            if (reason !== DisconnectReason.loggedOut) startBot();
            else console.log('Déconnecté, connectez-vous à nouveau.');
        } else if (connection === 'open') {
            console.log('✅ Bot WhatsApp connecté !');
        }
    });
}

startBot();
