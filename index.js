const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');

const prefix = 'Ib'; // ton préfix obligatoire

// Authentification
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startBot() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using WhatsApp version v${version.join('.')}, latest: ${isLatest}`);

    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        version
    });

    sock.ev.on('creds.update', saveState);

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
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        let text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!text) return;
        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = commands.get(commandName);
        if (!command) return;

        try {
            await command.run(sock, msg, args);
        } catch (error) {
            console.error(error);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Une erreur est survenue lors de l’exécution de cette commande.' });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if ((lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
                startBot(); // reconnect
            } else {
                console.log('Déconnecté. Connectez-vous à nouveau.');
            }
        } else if (connection === 'open') {
            console.log('🤖 Bot WhatsApp connecté !');
        }
    });
}

startBot();
