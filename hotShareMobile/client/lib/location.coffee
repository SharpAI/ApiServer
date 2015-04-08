window.LocationUpdate =()->
  console.log("locationUpdate called")
  getLocation = ()->
    geoc = new BMap.Geocoder();
    point = new BMap.Point(Session.get('location').longitude,Session.get('location').latitude);

    geoc.getLocation point,(rs)->
      if rs and rs.addressComponents
        addComp = rs.addressComponents
        if addComp.city and addComp.city isnt ''
          Session.set("userAddress",addComp.city+' '+addComp.district)
          console.log("#baidu location city is " + Session.get("userAddress"))
          #alert(Session.get("userAddress"));
          Meteor.users.update Meteor.userId(),{$set:{'profile.location':Session.get("userAddress")}}
        else
          requestUrl = "http://maps.googleapis.com/maps/api/geocode/json?latlng="+Session.get('location').latitude+','+Session.get('location').longitude+'&sensor=false'
          Meteor.http.call "GET",requestUrl,(error,result)->
            if result.statusCode is 200
              results = result.data.results
              if results.length > 2
                address_components = results[2].address_components
                address_components.reverse()
                address_array = [];
                for i in [0..(address_components.length)-1]
                  address_array.push(address_components[i].long_name)
                reverse_address = address_array.join(',');

                Session.set("userAddress",reverse_address)
                console.log("#google location city is " + Session.get("userAddress"))
                #alert(Session.get("userAddress"));
                Meteor.users.update Meteor.userId(),{$set:{'profile.location':Session.get("userAddress")}}
      else
        console.log("getLocation rs is null")
  Meteor.call('getGeoFromConnection',(err,response )->
    if response and response.ll
      Session.set('location',{latitude:response.ll[0],longitude:response.ll[1],type:'ip'})
      #Session.set('location',{latitude:39.915,longitude:116.404,type:'ip'})
      #Session.set('location',{latitude:37.394,longitude:-122.031,type:'ip'})
      getLocation()
  )
  ###
  Popup information is not good currently. Let's hide it for now.
  onSuccess = (position) ->
    console.log('\nLatitude: '          + position.coords.latitude          + '\n' +
    'Longitude: '         + position.coords.longitude         + '\n' +
    'Accuracy: '          + position.coords.accuracy          + '\n' +
    'Timestamp: '         + position.timestamp                + '\n');
    Session.set('location',{latitude: position.coords.latitude,longitude:position.coords.longitude,type:'geo',accuracy:position.coords.accuracy })
    getLocation()

  onError = (error) ->
    console.log('code: '    + error.code    + '\n' +
    'message: ' + error.message + '\n');

    Meteor.call('getGeoFromConnection',(err,response )->
      Session.set('location',{latitude:response.ll[0],longitude:response.ll[1],type:'ip'})
      getLocation()
    )

  window.navigator.geolocation.getCurrentPosition(onSuccess, onError, { maximumAge: 600000, timeout:60000,enableHighAccuracy :false});
  ###

Accounts.onLogin(()->
  console.log("Accounts.onLogin")
  window.BMap_loadScriptTime = (new Date).getTime()
  url = "http://api.map.baidu.com/getscript?v=2.0&ak=Wg2XtQkIKg1YwWzGguTw9lTj&services=&t=20150330161927"
  $.getScript url, (data, textStatus, jqxhr)->
    console.log 'status is ' + textStatus
    window.LocationUpdate()
)