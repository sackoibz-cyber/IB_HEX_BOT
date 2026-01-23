// ================= commands/info.js =================
import { getBotImage } from '../system/botAssets.js';
import { BOT_OWNER_INFO } from '../system/botInfo.js';

export default {
  name: 'owner',
  aliases: ['dev', 'creator'],
  description: 'Shows information about the bot developer',
  category: 'General',

  execute: async (ib-hex-bot, m) => {
    await ib-hex-bot.sendMessage(
      m.chat,
      {
        image: { url: getBotImage() },
        caption: BOT_OWNER_INFO,
        contextInfo: { mentionedJid: [m.sender] }
      },
      { quoted: m }
    );
  }
};
