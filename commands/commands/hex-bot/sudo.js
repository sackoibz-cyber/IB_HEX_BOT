module.exports = {
    name: "sudo",
    description: "Afficher les super utilisateurs",
    execute: async (client, message, args) => {
        const superUsers = ["IbSacko", "AutreSuperUser"]; // remplace par tes super utilisateurs
        message.reply(`👑 Super utilisateurs :\n${superUsers.join("\n")}`);
    }
};
