const Realm = require('realm');

class UserData {
	constructor() {
		this.User = {
			name: "User",
			properties: {
				_id: 'string',
				pitch: 'double'
			},
			primaryKey: '_id'
		};
		this.realm = await Realm.open({
			schema: [User],
		});
	}

	
	getUserPitch = (userId) => {
		const user = realm.objects("User");
		const filterdUser = user.filtered(`_id == '${userId}'`);
		const pitch;
		if (filterdUser.length == 0) {
			pitch = getRandomArbitrary(-24, 24);
			setUserPitch(userId, pitch);
		} else {
			pitch = filterdUser[0].pitch;
		}
		return pitch;
	};
	
	setUserPitch = (userId, pitch) => {
		realm.write(() => {
			const user = realm.objects("User");
			const filterdUser = user.filtered(`_id == '${userId}'`);
			if (filterdUser.length == 0) {
				realm.create("User", { _id: userId, pitch: pitch});
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