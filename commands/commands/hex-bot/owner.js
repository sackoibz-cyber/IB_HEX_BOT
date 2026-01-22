module.exports = {
    name: "owner",
    description: "Afficher le propriétaire du bot",
    execute: async (client, message, args) => {
        message.reply(`🥷 Propriétaire : IbSacko\nDéveloppeur : sacko\nMode : privé`);
    }
};
