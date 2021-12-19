const Discord = require('discord.js');

class VoiceQueueHandler {
	constructor(connection, channelId) {
		this.connection = connection;
		this.channelId = channelId;
		this.queues = [];
	}

	play(audioUrl) {
		if (this.connection.speaking == Discord.Speaking.FLAGS.PRIORITY_SPEAKING) {
			this.connection.setSpeaking(Discord.Speaking.FLAGS.SPEAKING);
			const dispatcher = this.connection.play(audioUrl);
			dispatcher.on('speaking', (speaking) => {
				if (speaking) return;
				this.connection.setSpeaking(Discord.Speaking.FLAGS.PRIORITY_SPEAKING);
				if (this.queues.length != 0) {
					this.play(this.queues[0]);
					this.queues.shift();
				}
			});
		} else {
			this.queues.push(audioUrl);
		}
	}
}

module.exports = VoiceQueueHandler;
