require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const botToken = process.env.DISCORD_BOT_TOKEN;
const googleTTS = require('google-tts-api');

let guilds = {};
const broadcast = client.voice.createBroadcast();

client.on('message', async msg => {
	const message = msg.content;
	const messageChannel = msg.channel;
	if (messageChannel.type !== "text") return;
	if (msg.author.bot) return;
	const guildId = msg.guild.id;
	const channelId = messageChannel.id;
	const member = msg.member;
	if (message.startsWith("/ondoku")) {
		const commands = message.split(" ");
		if (commands.length <= 1) {
			messageChannel.send("`/ondoku s`で呼び出せるよ");
			messageChannel.send("`/ondoku b`で消えるよ");
		} else {
			if (commands[1] === "s") {
				const voiceChannel = member.voice.channel;
				if (guilds[guildId]) {
					msg.reply("既にこのサーバーには呼び出されています!");
					return;
				}
				if (!voiceChannel) {
					msg.reply.send("ボイスチャンネルに入った状態で呼び出してください!");
					return;
				}
				const connection = await voiceChannel.join();
				guilds[guildId] = {
					"connection": connection,
					"channelId": channelId, 
					"queues": [],
					"speaking": false
				};
				connection.on('disconnect', () => {
					delete guilds[guildId];
				});
			} else if (commands[1] === "b") {
				const guild = guilds[guildId];
				if (guild) {
					const connection = guild.connection;
					if (connection) {
						connection.disconnect();
					} else {
						msg.reply.send("ボイスチャンネルに接続されていません!");
					}
				} else {
					msg.reply.send("ボイスチャンネルに接続されていません!");
				}
			} else {
				messageChannel.send("`/ondoku s`で呼び出せるよ\n`/ondoku b`で消えるよ");
			}
		}
	} else {
		const guild = guilds[guildId];
		if (guild) {
			const savingTextChannel = guild.channelId;
			if (messageChannel == savingTextChannel) {
				const audioUrl = getAudioUrl(message);
				const dispatcher = broadcast.play(audioUrl);
				guild.connection.play(broadcast);
			}
		}
	}
});
  
client.login(botToken);

const getAudioUrl = (msg) => googleTTS.getAudioUrl(msg, {lang: 'ja', slow: false, host: 'https://translate.google.com'});