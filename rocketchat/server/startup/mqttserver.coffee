Meteor.startup ->
    Fiber = Npm.require('fibers')
    mqtt_connection=mqtt.connect('ws://rpcserver.raidcdn.com:80')
    mqtt_connection.on('connect',()->
      console.log('Connected to mqtt server')
      mqtt_connection.subscribe('all')
      #mqtt_connection.publish(Session.get('postContent')._id, 'Hello u'+Session.get('postContent')._id)
    )
    mqtt_connection.on 'message',(topic, message)->
      mqtt_msg = JSON.parse(message.toString())

      message = {
        rid: mqtt_msg.postid,
        msg: mqtt_msg.message,
        ts: new Date(),
        u: {
            _id: 'rocket.cat',
            name: 'Rocket.Cat',
            username: 'rocket.cat'
        }
      }

      Fiber(() ->

        RocketChat.models.Messages.createWithTypeRoomIdMessageAndUser(null, message.rid, message.msg, message.u, message)
        return
        ).run()

      # here: show the message on page