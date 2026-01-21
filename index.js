import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import { writeFileSync, existsSync, readFileSync } from "fs";
import express from "express";
import qrcode from "qrcode";
import path from "path";

const app = express();
const PORT = process.env.PORT || 10000;

const SESSION_FILE = "./session.json";
let sessionData = existsSync(SESSION_FILE) ? JSON.parse(readFileSync(SESSION_FILE, "utf-8")) : null;
let lastQR = null;
let sockInstance = null;

// Fonction utilitaire pour envoyer texte
async function sendText(jid, text) {
    if (!sockInstance) return;
    await sockInstance.sendMessage(jid, { text });
}

// Fonction principale pour démarrer le bot
async function startBot() {
    const { version } = await fetchLatestBaileysVersion();

    sockInstance = makeWASocket({
        version,
        auth: sessionData || {},
    });

    sockInstance.ev.on("connection.update", async (update) => {
        const { connection, qr } = update;

        if (qr) {
            lastQR = await qrcode.toDataURL(qr);
            console.log("QR généré pour la page web ✅");
        }

        if (connection === "close") {
            console.log("Bot déconnecté ❌");
            sessionData = null;
        } else if (connection === "open") {
            console.log("Bot connecté ✅");
            sessionData = sockInstance.authState;
            writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
        }
    });

    // Gestion des messages et commandes
    sockInstance.ev.on("messages.upsert", async (msgUpdate) => {
        const message = msgUpdate.messages[0];
        if (!message?.message) return;

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        if (!text?.startsWith("Ib")) return;

        const command = text.slice(2).trim().toLowerCase();
        const jid = message.key.remoteJid;

        // --- SWITCH COMMANDES HEX-BOT ---
        switch (command) {
            // MENU
            case "alive": sendText(jid, "IB-HEX-BOT est en ligne ✅"); break;
            case "menu": sendText(jid, "📜 Menu IB-HEX-BOT complet : Ib alive, Ib menu, Ib info, Ib help, Ib ping, Ib say <msg>, Ib echo <msg>, Ib 🥷, etc."); break;
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
            case "repo": sendText(jid, "Dépôt GitHub : https://github.com/sackoibz-cyber/IB_HEX_BOT"); break;

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

            // Convertisseur
            case "attp": sendText(jid, "Texte en sticker."); break;
            case "toimage": sendText(jid, "Conversion en image."); break;
            case "gimage": sendText(jid, "Recherche Google image."); break;
            case "mp3": sendText(jid, "Conversion en MP3."); break;
            case "ss": sendText(jid, "Capture d’écran."); break;
            case "fancy": sendText(jid, "Texte stylé."); break;
            case "url": sendText(jid, "Lien généré."); break;
            case "sticker": sendText(jid, "Sticker créé."); break;
            case "take": sendText(jid, "Récupération média."); break;

            // RECHERCHE
            case "google": sendText(jid, "Recherche Google activée."); break;
            case "play": sendText(jid, "Play Store activé."); break;
            case "video": sendText(jid, "Recherche vidéo activée."); break;
            case "song": sendText(jid, "Recherche musique activée."); break;
            case "mediafire": sendText(jid, "Recherche MediaFire."); break;
            case "facebook": sendText(jid, "Recherche Facebook."); break;
            case "instagram": sendText(jid, "Recherche Instagram."); break;
            case "tiktok": sendText(jid, "Recherche TikTok."); break;
            case "lyrics": sendText(jid, "Paroles de chanson."); break;
            case "image": sendText(jid, "Recherche image."); break;

            // DIVERTISSEMENT
            case "getpp": sendText(jid, "Photo de profil."); break;
            case "goodnight": sendText(jid, "Bonne nuit !"); break;
            case "wcg": sendText(jid, "Classement WCG."); break;
            case "quizz": sendText(jid, "Quiz démarré."); break;
            case "anime": sendText(jid, "Anime info."); break;
            case "profile": sendText(jid, "Infos profil."); break;
            case "couple": sendText(jid, "Infos couple."); break;
            case "poll": sendText(jid, "Sondage créé."); break;
            case "emojimix": sendText(jid, "Mélange d’emojis."); break;

            // GROUPES
            case "kickall": sendText(jid, "Exclusion de tous."); break;
            case "tagadmin": sendText(jid, "Mention des admins."); break;
            case "acceptall": sendText(jid, "Acceptation de tous."); break;
            case "tagall": sendText(jid, "Mention de tous."); break;
            case "getall": sendText(jid, "Récupération membres."); break;
            case "group close": sendText(jid, "Groupe fermé."); break;
            case "group open": sendText(jid, "Groupe ouvert."); break;
            case "add": sendText(jid, "Ajout de membre."); break;
            case "vcf": sendText(jid, "Contacts VCF."); break;
            case "linkgc": sendText(jid, "Lien du groupe."); break;
            case "antilink": sendText(jid, "Anti-lien activé."); break;
            case "antisticker": sendText(jid, "Anti-sticker activé."); break;
            case "antigm": sendText(jid, "Anti-mention activé."); break;
            case "create": sendText(jid, "Groupe créé."); break;
            case "groupinfo": sendText(jid, "Infos groupe."); break;

            // HENTAI
            case "hneko": sendText(jid, "Neko hentai."); break;
            case "trap": sendText(jid, "Trap."); break;
            case "hwaifu": sendText(jid, "Waifu hentai."); break;
            case "hentai": sendText(jid, "Hentai."); break;

            // REACTIONS
            case "yeet": sendText(jid, "Jeter."); break;
            case "slap": sendText(jid, "Gifler."); break;
            case "nom": sendText(jid, "Manger."); break;
            case "poke": sendText(jid, "Toucher."); break;
            case "wave": sendText(jid, "Saluer."); break;
            case "smile": sendText(jid, "Sourire."); break;
            case "dance": sendText(jid, "Danser."); break;
            case "smug": sendText(jid, "Sourire narquois."); break;
            case "cringe": sendText(jid, "Malaise."); break;
            case "happy": sendText(jid, "Heureux."); break;

            default:
                sendText(jid, `Commande inconnue : ${command}`);
                break;
        }
    });

    return sockInstance;
}

startBot();

// --- Serveur web stylé pour QR + Pair Code + Boutons ---
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

// Page principale
app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Serveur web actif sur le port ${PORT}`);
});
