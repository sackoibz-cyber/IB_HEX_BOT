// ==================== config.js ====================
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ================== ESM __dirname ==================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== CHEMINS ==================
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const configPath = path.join(dataDir, "config.json");

// ================== CONFIGURATION PAR DÉFAUT ==================
const defaultConfig = {
  // 🔑 Identifiants
  SESSION_ID: "SESSION_ID",
  
  OWNER_NUMBER: ["224XXXXXXXX"], 

  // ⚙️ Paramètres du bot
  PREFIX: "Ib",
  TIMEZONE: "Africa/guinea",
  VERSION: "2.0.0",
  public: false,
  autoRead: true,
  restrict: false,
  botImage: "https://i.ibb.co/vvLVkvkR/IMG-20260118-WA0276.jpg",
  blockInbox: false,

  // 🌐 Liens utiles
  LINKS: {
    group: "https://chat.whatsapp.com/DSvc4vCcdZEER4DodjvhIT",
  
  },
};

// ================== CRÉATION DU FICHIER SI INEXISTANT ==================
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  console.log("✅ config.json créé avec les paramètres par défaut");
}

// ================== CHARGEMENT DE LA CONFIG ==================
let userConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// ================== VARIABLES GLOBALES ==================
global.blockInbox = userConfig.blockInbox ?? false;
global.owner = Array.isArray(userConfig.OWNERS)
  ? userConfig.OWNERS
  : [userConfig.OWNER_NUMBER].filter(Boolean);

// ================== FONCTION DE SAUVEGARDE ==================
export function saveConfig(updatedConfig) {
  // Merge avec la config actuelle
  userConfig = { ...userConfig, ...updatedConfig };

  // Sauvegarde dans config.json
  fs.writeFileSync(configPath, JSON.stringify(userConfig, null, 2));
  console.log("✅ Configuration sauvegardée dans config.json");

  // Mise à jour des variables globales
  if (typeof updatedConfig.blockInbox !== "undefined") {
    global.blockInbox = updatedConfig.blockInbox;
  }
  if (Array.isArray(updatedConfig.OWNERS)) {
    global.owner = updatedConfig.OWNERS;
  }
}

// ================== EXPORT ==================
export default userConfig; 
