Meteor.methods
	sendMessage: (message) ->
		if not Meteor.userId()
			throw new Meteor.Error 203, t('User_logged_out')

		if _.trim(message.msg) isnt ''

			message.ts = new Date(Date.now() + TimeSync.serverOffset())

			message.u =
				_id: Meteor.userId()
				username: Meteor.user().username
				name: Meteor.user().name

			message.temp = true

			message = RocketChat.callbacks.run 'beforeSaveMessage', message

			RocketChat.promises.run('onClientMessageReceived', message).then (message) ->

				ChatMessage.insert message
				
				postId = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1)
				mqtt_msg = {"type": "newmessage", "counter": ''}

				mqtt_connection=mqtt.connect('ws://rpcserver.raidcdn.com:80')
				mqtt_connection.on('connect',()->
					mqtt_connection.publish(postId, JSON.stringify(mqtt_msg))
				)				
