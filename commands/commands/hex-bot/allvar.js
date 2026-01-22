module.exports = {
    name: "allvar",
    description: "Afficher toutes les variables du bot",
    execute: async (client, message, args) => {
        const variables = {
            prefix: "Ib",
            mode: "privé",
            owner: "IbSacko",
            version: "2.0",
            uptime: process.uptime()
        };
        let text = "📜 Variables du bot :\n";
        for (const [key, value] of Object.entries(variables)) {
            text += `• ${key} : ${value}\n`;
        }
        message.reply(text);
    }
};
