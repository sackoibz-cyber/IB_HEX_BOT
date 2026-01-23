import checkAdminOrOwner from "../system/checkAdmin.js";

export default {
  name: "del",
  alias: ["delete", "rm"],
  description: "Delete a message in a group",
  category: "Groupe",
  group: true,
  admin: true,
  ownerOnly: false,
  usage: ".del <reply>",

  run: async (ib-hex-bot, m) => {
    try {
      const chatId = m.chat;

      if (!m.isGroup) {
        return ib-hex-bot.sendMessage(chatId, { text: "❌ This command works only in groups." }, { quoted: m });
      }

      // 🔐 Check admin / owner
      const check = await checkAdminOrOwner(kaya, chatId, m.sender);
      if (!check.isAdmin && !check.isOwner) {
        return ib-hex-bot.sendMessage(chatId, { text: "🚫 Admins or Owner only." }, { quoted: m });
      }

      // 🗑️ Si message répondu
      if (m.quoted) {
        try {
          await ib-hex-bot.sendMessage(chatId, { delete: m.quoted.key });
          return ib-hex-bot.sendMessage(chatId, { text: "✅ Message deleted successfully." }, { quoted: m });
        } catch (err) {
          console.error("[DEL] Reply Error:", err);
          return ib-hex-bot.sendMessage(chatId, { text: "❌ Could not delete this message." }, { quoted: m });
        }
      }

      // ⚠️ Si aucun reply
      return ib-hex-bot.sendMessage(chatId, { text: "⚠️ Reply to the message you want to delete." }, { quoted: m });

    } catch (err) {
      console.error("[DEL] Error:", err);
      return ib-hex-bot.sendMessage(chatId, { text: "❌ An error occurred while deleting the message." }, { quoted: m });
    }
  }
};
