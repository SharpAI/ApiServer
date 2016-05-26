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


      Fiber(() ->
        room =  RocketChat.models.Rooms.findOneByName mqtt_msg.postid

        if room
            message = {
              rid: room._id,
              msg: mqtt_msg.message,
              ts: new Date(),
              u: {
                  _id: 'group.cat',
                  name: '故事贴小秘',
                  username: 'GS'
              }
            }

            RocketChat.models.Messages.createWithTypeRoomIdMessageAndUser(null, message.rid, message.msg, message.u, message)
        return
        ).run()

      # here: show the message on page