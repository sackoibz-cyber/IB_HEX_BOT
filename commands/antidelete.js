    const viewOnce = message.message?.viewOnceMessageV2?.message || message.message?.viewOnceMessage?.message;

    if (viewOnce) {
      if (viewOnce.imageMessage) {
        mediaType = "image";
        content = viewOnce.imageMessage.caption || "";
        const buffer = await downloadContentFromMessage(viewOnce.imageMessage, "image");
        mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
        await writeFile(mediaPath, buffer);
        isViewOnce = true;
      } else if (viewOnce.videoMessage) {
        mediaType = "video";
        content = viewOnce.videoMessage.caption || "";
        const buffer = await downloadContentFromMessage(viewOnce.videoMessage, "video");
        mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
        await writeFile(mediaPath, buffer);
        isViewOnce = true;
      }
    } else if (message.message?.conversation) {
      content = message.message.conversation;
    } else if (message.message?.extendedTextMessage?.text) {
      content = message.message.extendedTextMessage.text;
    } else if (message.message?.imageMessage) {
      mediaType = "image";
      content = message.message.imageMessage.caption || "";
      const buffer = await downloadContentFromMessage(message.message.imageMessage, "image");
      mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
      await writeFile(mediaPath, buffer);
    } else if (message.message?.stickerMessage) {
      mediaType = "sticker";
      const buffer = await downloadContentFromMessage(message.message.stickerMessage, "sticker");
      mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
      await writeFile(mediaPath, buffer);
    } else if (message.message?.videoMessage) {
      mediaType = "video";
      content = message.message.videoMessage.caption || "";
      const buffer = await downloadContentFromMessage(message.message.videoMessage, "video");
      mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
      await writeFile(mediaPath, buffer);
    } else if (message.message?.audioMessage) {
      mediaType = "audio";
      const mime = message.message.audioMessage.mimetype || "";
      const ext = mime.includes("mpeg") ? "mp3" : mime.includes("ogg") ? "ogg" : "mp3";
      const buffer = await downloadContentFromMessage(message.message.audioMessage, "audio");
      mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.${ext}`);
      await writeFile(mediaPath, buffer);
    }

    messageStore.set(messageId, {
      content,
      mediaType,
      mediaPath,
      sender,
      group: message.key.remoteJid.endsWith("@g.us") ? message.key.remoteJid : null,
      timestamp: new Date().toISOString()
    });

    // Forward view-once immediately
    if (isViewOnce && mediaType && fs.existsSync(mediaPath)) {
      try {
        const owner = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const senderName = sender.split("@")[0];
        const mediaOpts = { caption: `*Anti-ViewOnce ${mediaType}*\nFrom: @${senderName}`, mentions: [sender] };
        if (mediaType === "image") await sock.sendMessage(owner, { image: { url: mediaPath }, ...mediaOpts });
        if (mediaType === "video") await sock.sendMessage(owner, { video: { url: mediaPath }, ...mediaOpts });
        try { fs.unlinkSync(mediaPath); } catch {}
      } catch {}
    }

  } catch (err) { console.error("storeMessage error:", err); }
}

// 🔹 Handle deleted messages
export async function handleMessageRevocation(sock, revMessage) {
  try {
    const config = loadConfig();
    if (!config.enabled) return;

    const messageId = revMessage.message.protocolMessage.key.id;
    const deletedBy = revMessage.participant || revMessage.key.participant || revMessage.key.remoteJid;
    const owner = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    if (deletedBy.includes(sock.user.id) || deletedBy === owner) return;

    const original = messageStore.get(messageId);
    if (!original) return;

    const senderName = original.sender.split("@")[0];
    const groupName = original.group ? (await sock.groupMetadata(original.group)).subject : "";

    let text = `*🔰 ANTIDELETE REPORT 🔰*\n\n*🗑️ Deleted By:* @${deletedBy.split("@")[0]}\n*👤 Sender:* @${senderName}\n*📱 Number:* ${original.sender}\n`;
    if (groupName) text += `*👥 Group:* ${groupName}\n`;
    if (original.content) text += `\n*💬 Deleted Message:*\n${original.content}`;

    await sock.sendMessage(owner, { text, mentions: [deletedBy, original.sender] });

    if (original.mediaType && fs.existsSync(original.mediaPath)) {
      const opts = { caption: `*Deleted ${original.mediaType}*\nFrom: @${senderName}`, mentions: [original.sender] };
      try {
        switch (original.mediaType) {
          case "image": await sock.sendMessage(owner, { image: { url: original.mediaPath }, ...opts }); break;
          case "sticker": await sock.sendMessage(owner, { sticker: { url: original.mediaPath }, ...opts }); break;
          case "video": await sock.sendMessage(owner, { video: { url: original.mediaPath }, ...opts }); break;
          case "audio": await sock.sendMessage(owner, { audio: { url: original.mediaPath }, mimetype: "audio/mpeg", ptt: false, ...opts }); break;
        }
      } catch (err) { await sock.sendMessage(owner, { text: `⚠️ Error sending media: ${err.message}` }); }
      try { fs.unlinkSync(original.mediaPath); } catch {}
    }

    messageStore.delete(messageId);

  } catch (err) { console.error("handleMessageRevocation error:", err); }
}
