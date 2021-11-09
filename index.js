require("dotenv").config();

const Discord = require("discord.js");
const VoiceQueueHandler = require("./VoiceQueueHandler");
const UserData = require("./User");
const client = new Discord.Client();
const botToken = process.env.DISCORD_BOT_TOKEN;
const { v4: uuidv4 } = require('uuid');
const user = new UserData();

let guilds = {};

client.on("ready", () => {
	console.log("ready!!!");
});

client.on("message", async msg => {
	const message = msg.content;
	const messageChannel = msg.channel;
	if (messageChannel.type !== "text") return;
	if (msg.author.bot) return;
	const guildId = msg.guild.id;
	const channelId = messageChannel.id;
	const member = msg.member;
	const memberId = member.id;
	if (message.startsWith("/ondoku")) {
		const commands = message.split(" ");
		if (commands.length <= 1) {
			sendHelpMessage(messageChannel);
		} else {
			if (commands[1] === "s") {
				const voiceChannel = member.voice.channel;
				if (guilds[guildId]) {
					msg.reply("既にこのサーバーには呼び出されています!");
					return;
				}
				if (!voiceChannel) {
					msg.reply("ボイスチャンネルに入った状態で呼び出してください!");
					return;
				}
				const connection = await voiceChannel.join();
				connection.setSpeaking(Discord.Speaking.FLAGS.PRIORITY_SPEAKING);
				const voiceQueueHandler = new VoiceQueueHandler(connection, channelId);
				guilds[guildId] = voiceQueueHandler;
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
						msg.reply("ボイスチャンネルに接続されていません!");
					}
				} else {
					msg.reply("ボイスチャンネルに接続されていません!");
				}
			} else if (commands[1] === "p") {
				if (commands.length <= 2) {
					msg.reply("引数を入力してください!");
				} else {
					if (isFinite(commands[2])) {
						const number = parseFloat(commands[2]);
						if (number <= 24 && number >= -24) {
							user.setUserPitch(memberId, number);
							msg.reply(`声の高さを \`${number}\` に設定しました`);
						} else {
							msg.reply("-24~24の値を入力してください!");
						}
					} else {
						msg.reply("数値を入力してください!");
					}
				}
			} else {
				sendHelpMessage(messageChannel);
			}
		}
	} else {
		const guild = guilds[guildId];
		if (guild) {
			const savingTextChannel = guild.channelId;
			if (messageChannel == savingTextChannel) {
				
				const audioUrl = getAudioUrl(getReplacedMessage(message), user.getUserPitch(memberId));
				guild.play(audioUrl);
			}
		}
	}
});

client.login(botToken);

const getAudioUrl = (msg, pitch) => `http://localhost:13698/voice?text=${msg}&voice=/usr/local/src/htsvoice-tohoku-f01/tohoku-f01-neutral.htsvoice&uuid=${uuidv4()}&fm=${pitch}`;

const sendHelpMessage = (messageChannel) => {
	messageChannel.send(
		{embed: {
			color: 0xc8e3d4,
			title: "Help / ヘルプ",
			description: "　読み上げBot「Ondoku」のヘルプです。",
			fields: [
				{
					name: ":keyboard: **Commands** >",
					value: "　`/ondoku`　このヘルプを表示\n" +
						   "　`/ondoku s`　Ondoku を召喚します\n" +
						   "　`/ondoku b`　Ondoku を片付けます\n" +
						   "　`/ondoku p 数値`　声の高さを`[-24~24]`の間で変更します"
				},
				{
					name: ":level_slider: **Using** >",
					value: "　`OpenJTalk`　音声合成システム\n" +
						   "　`HTS voice tohoku-f01`　[音響モデル](https://github.com/icn-lab/htsvoice-tohoku-f01)\n"
				}
			],
			footer: {
				icon_url: client.user.avatarURL,
				text: "てれるんお手製"
			},
		}}
	);
};

const getReplacedMessage = (message) => {
	let replacedMessage = message.replace(/https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/g, "URL省略").replace(/<a?:[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+:[0-9]+>/g, "");
	if (replacedMessage.length >= 240) {
		replacedMessage = replacedMessage.substring(0, 240);
	}
	return replacedMessage;
}