// ==================== commands/sora.js ====================
import axios from 'axios';
import { BOT_NAME } from '../system/botAssets.js';

export default {
	name: 'sora',
	description: 'Generate a video from your prompt using AI',
	category: 'AI',

	async execute(ib-hex-bot, m, args) {
		try {
			// Get raw text from message or quoted message
			const rawText =
				m.message?.conversation?.trim() ||
				m.message?.extendedTextMessage?.text?.trim() ||
				m.message?.imageMessage?.caption?.trim() ||
				m.message?.videoMessage?.caption?.trim() ||
				'';

			const usedCmd = (rawText || '').split(/\s+/)[0] || '.sora';
			const argsText = rawText.slice(usedCmd.length).trim();

			const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
			const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';

			const prompt = argsText || quotedText;

			if (!prompt) {
				return ib-hex-bot.sendMessage(
					m.chat,
					{ text: `❌ Provide a prompt. Example: .sora anime girl with short blue hair\n\nby ${BOT_NAME}` },
					{ quoted: m }
				);
			}

			// API call
			const apiUrl = `https://okatsu-rolezapiiz.vercel.app/ai/txt2video?text=${encodeURIComponent(prompt)}`;
			const { data } = await axios.get(apiUrl, {
				timeout: 60000,
				headers: { 'user-agent': 'Mozilla/5.0' }
			});

			const videoUrl = data?.videoUrl || data?.result || data?.data?.videoUrl;
			if (!videoUrl) {
				throw new Error('No video URL returned by API');
			}

			// Send video
			await ib-hex-bot.sendMessage(
				m.chat,
				{
					video: { url: videoUrl },
					mimetype: 'video/mp4',
					caption: `🎬 Prompt: ${prompt}\n\nby ${BOT_NAME}`
				},
				{ quoted: m }
			);

		} catch (err) {
			console.error('[SORA] Error:', err?.message || err);
			await ib-hex-bot.sendMessage(
				m.chat,
				{ text: `❌ Failed to generate video. Try a different prompt later.\n\nby ${BOT_NAME}` },
				{ quoted: m }
			);
		}
	}
};
