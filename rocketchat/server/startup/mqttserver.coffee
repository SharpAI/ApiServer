Meteor.startup ->
    mqtt_connection=mqtt.connect('ws://rpcserver.raidcdn.com:80')
    mqtt_connection.on('connect',()->
      console.log('Connected to mqtt server')
      mqtt_connection.subscribe('all')
      #mqtt_connection.publish(Session.get('postContent')._id, 'Hello u'+Session.get('postContent')._id)
    )
    mqtt_connection.on 'message',(topic, message)->
      mqtt_msg = JSON.parse(message.toString())
      console.log(mqtt_msg);
      # here: show the message on page