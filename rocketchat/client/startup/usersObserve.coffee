Meteor.startup ->
	Meteor.users.find({}, { fields: { name: 1, username: 1, pictures: 1, status: 1, emails: 1, phone: 1, services: 1, utcOffset: 1, profile:1 } }).observe
		added: (user) ->
			Meteor.call 'getUserLocation', user.username, (error, result)->
				Session.set('user_' + user.username + '_status', user.status, result)
				RoomManager.updateUserStatus user, user.status, user.utcOffset, result
		changed: (user) ->
			Meteor.call 'getUserLocation', user.username, (error, result)->
				Session.set('user_' + user.username + '_status', user.status, result)
				RoomManager.updateUserStatus user, user.status, user.utcOffset, result
		removed: (user) ->
			Session.set('user_' + user.username + '_status', null, null)
			RoomManager.updateUserStatus user, 'offline', null, null
