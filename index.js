// index.js
import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import express from "express";
import qrcode from "qrcode";
import path from "path";

const app = express();
const PORT = process.env.PORT || 10000;

// --- Session ---
const SESSION_FILE = "./session.json";
let sessionData = existsSync(SESSION_FILE) ? JSON.parse(readFileSync(SESSION_FILE, "utf-8")) : null;
let lastQR = null;
let sockInstance = null;

// --- Fonction utilitaire pour envoyer texte ---
async function sendText(jid, text) {
    if (!sockInstance) return;
    await sockInstance.sendMessage(jid, { text });
}

// --- Démarre le bot ---
async function startBot() {
    const { version } = await fetchLatestBaileysVersion();

    sockInstance = makeWASocket({
        version,
        auth: sessionData || {},
        printQRInTerminal: false
    });

    // Connection
    sockInstance.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            lastQR = await qrcode.toDataURL(qr);
            console.log("QR généré pour la page web ✅");
        }

        if (connection === "open") {
            console.log("Bot connecté ✅");
            sessionData = sockInstance.authState;
            writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
            // ⚡ sock.user est maintenant défini
        }

        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("Reconnexion...");
                startBot();
            } else {
                console.log("Déconnecté définitivement.");
            }
        }
    });

    // --- Messages ---
    sockInstance.ev.on("messages.upsert", async (msgUpdate) => {
        const message = msgUpdate.messages[0];
        if (!message?.message) return;

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        if (!text?.startsWith("Ib")) return; // Préfixe obligatoire

        const command = text.slice(2).trim().toLowerCase();
        const jid = message.key.remoteJid;

        // --- SWITCH COMMANDES HEX-BOT ---
        switch (command) {
            // MENU
            case "alive": sendText(jid, "IB-HEX-BOT est en ligne ✅"); break;
            case "menu": sendText(jid, "📜 Menu complet : Ib alive, Ib menu, Ib info, Ib help, Ib ping, Ib say <msg>, Ib echo <msg>, Ib 🥷, etc."); break;
            case "info": sendText(jid, "🤖 IB-HEX-BOT v2.0\nPropriétaire : IbSacko\nPréfixe : Ib"); break;
            case "help": sendText(jid, "Toutes les commandes commencent par Ib.\nExemple : Ib alive, Ib menu, Ib ping"); break;
            case "ping": sendText(jid, "🏓 Pong !"); break;

            // OWNER
            case "join": sendText(jid, "Commande join activée."); break;
            case "leave": sendText(jid, "Commande leave activée."); break;
            case "update": sendText(jid, "Commande update activée."); break;
            case "antidelete": sendText(jid, "Commande antidelete activée."); break;
            case "upload": sendText(jid, "Commande upload activée."); break;
            case "vv": sendText(jid, "Commande vv activée."); break;
            case "allcmds": sendText(jid, "Toutes les commandes HEX-BOT listées."); break;
            case "delete": sendText(jid, "Commande delete activée."); break;
            case "repo": sendText(jid, "Dépôt GitHub : https://github.com/tonrepo"); break;

            // Commande spéciale 🥷
            case "🥷":
                if (message.message.imageMessage || message.message.videoMessage) {
                    const media = message.message.imageMessage || message.message.videoMessage;
                    const buffer = await sockInstance.downloadMediaMessage(message, "buffer");
                    await sockInstance.sendMessage(jid, { 
                        document: buffer, 
                        mimetype: media.mimetype,
                        fileName: "media_" + Date.now()
                    });
                } else {
                    sendText(jid, "Pas de photo ou vidéo à télécharger.");
                }
                break;

            // IA
            case "ai": sendText(jid, "Commande AI activée."); break;
            case "bug": sendText(jid, "Signaler un bug."); break;
            case "bot": sendText(jid, "Informations bot."); break;
            case "gemini": sendText(jid, "IA Gemini activée."); break;
            case "chatbot": sendText(jid, "Discussion chatbot activée."); break;
            case "gpt": sendText(jid, "ChatGPT activé."); break;

            // Add ici toutes les autres commandes comme tu avais...
            default: sendText(jid, `Commande inconnue : ${command}`); break;
        }
    });

    return sockInstance;
}

startBot();

// --- Serveur Web pour QR + PAIR Code ---
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/qr", (req, res) => {
    if (sessionData) {
        res.json({ connected: true, session: sessionData });
    } else if (lastQR) {
        res.json({ connected: false, qr: lastQR });
    } else {
        res.json({ connected: false, qr: null });
    }
});

// Pair Code : demande le numéro et régénère la session
app.get("/pair", (req, res) => {
    res.send(`
        <html>
        <body>
            <h2>Pair Code IB-HEX-BOT</h2>
            <form method="POST" action="/pair/regenerate">
                <input type="text" name="number" placeholder="Entrez votre numéro" required />
                <button type="submit">Générer SESSION_ID</button>
            </form>
        </body>
        </html>
    `);
});

app.post("/pair/regenerate", express.urlencoded({ extended: true }), async (req, res) => {
    const number = req.body.number;
    if (!number) return res.send("Numéro invalide !");
    // Supprime l'ancienne session
    if (existsSync(SESSION_FILE)) writeFileSync(SESSION_FILE, "{}");
    lastQR = null;
    sessionData = null;
    await startBot();
    res.send(`Session régénérée pour : ${number}`);
});

app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Serveur web actif sur le port ${PORT}`);
});
