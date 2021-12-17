const Realm = require('realm');

class UserData {
	constructor() {
		this.User = {
			name: "User",
			properties: {
				_id: 'string',
				pitch: 'float'
			},
			primaryKey: '_id'
		};
		this.realm = new Realm({
			schema: [this.User],
		});
	}

	getUserPitch (userId) {
		const user = this.realm.objects("User");
		const filterdUser = user.filtered(`_id == '${userId}'`);
		let pitch;
		if (filterdUser.length == 0) {
			pitch = this.getRandomArbitrary(-24, 24);
			this.setUserPitch(userId, pitch);
		} else {
			pitch = filterdUser[0].pitch;
		}
		return pitch;
	};

	setUserPitch (userId, pitch) {
		this.realm.write(() => {
			const user = this.realm.objects("User");
			const filterdUser = user.filtered(`_id == '${userId}'`);
			if (filterdUser.length == 0) {
				this.realm.create("User", { _id: userId, pitch: pitch});
			} else {
				filterdUser[0].pitch = pitch;
			}
		});
	};

	getRandomArbitrary(min, max) {
		return Math.random() * (max - min) + min;
	}
}

module.exports = UserData;
