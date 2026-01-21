// index.js
import { default as makeWASocket, useSingleFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import { writeFileSync } from "fs";
import QRCode from "qrcode";
import http from "http";
import { join } from "path";

// Fichier de session
const { state, saveCreds } = useSingleFileAuthState(join("./", "session.json"));

// Création du bot WhatsApp
const startBot = () => {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // On gère le QR via page web
    });

    // Sauvegarde automatique des creds
    sock.ev.on("creds.update", saveCreds);

    // Événement connection.update pour récupérer le QR
    sock.ev.on("connection.update", async (update) => {
        const { connection, qr } = update;

        // Génération QR pour la page web
        if (qr) {
            // Convertit le QR en image data URL
            const qrImage = await QRCode.toDataURL(qr);
            writeFileSync("qr.html", `
                <html>
                    <head><meta charset="UTF-8"><title>IB-HEX-BOT - QR WhatsApp</title></head>
                    <body>
                        <h2>IB-HEX-BOT - Scanner le QR WhatsApp</h2>
                        <p>Ouvre WhatsApp et scanne le QR pour générer la SESSION_ID</p>
                        <img src="${qrImage}" alt="QR WhatsApp"/>
                        <p>Une fois scanné, ton bot sera connecté automatiquement.</p>
                    </body>
                </html>
            `);
        }

        if (connection === "close") {
            console.log("Connexion fermée, tentative de reconnexion...");
            startBot();
        } else if (connection === "open") {
            console.log("Bot connecté ✅");
        }
    });

    return sock;
};

startBot();

// Serveur web pour afficher QR sur page
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });

    try {
        const qrPage = join("./", "qr.html");
        const html = require("fs").readFileSync(qrPage, "utf-8");
        res.end(html);
    } catch (e) {
        res.end("<h2>IB-HEX-BOT - Scanner le QR WhatsApp</h2><p>QR non généré</p><p>Ouvre WhatsApp et scanne le QR pour générer la SESSION_ID</p>");
    }
}).listen(process.env.PORT || 10000, () => {
    console.log(`Serveur web actif sur le port ${process.env.PORT || 10000}`);
    console.log(`Ouvre la page web pour scanner le QR.`);
});
