###
if Meteor.isClient
  Meteor.startup ()->
    offlineHandler = ()->
      console.log "offline now"
    onlineHandler = ()->
      console.log "online now"
    document.addEventListener("offline", offlineHandler, false)
    document.addEventListener("online", onlineHandler, false)
    checkConnection=()->
      networkState = navigator.connection.type;
      states = {};
      states[Connection.UNKNOWN]  = 'Unknown connection'
      states[Connection.ETHERNET] = 'Ethernet connection'
      states[Connection.WIFI]     = 'WiFi connection'
      states[Connection.CELL_2G]  = 'Cell 2G connection'
      states[Connection.CELL_3G]  = 'Cell 3G connection'
      states[Connection.CELL_4G]  = 'Cell 4G connection'
      states[Connection.CELL]     = 'Cell generic connection'
      states[Connection.NONE]     = 'No network connection'

      console.log('Connection type: ' + states[networkState])

    Deps.autorun ()->
      if Meteor.status().connected is false
        console.log "Disconnected from server"
      else
        console.log "Connected to Server"
      console.log("Reconnect in "+(Meteor.status().retryTime - (new Date()).getTime())+" Status is "+JSON.stringify(Meteor.status()))
      checkConnection()

###