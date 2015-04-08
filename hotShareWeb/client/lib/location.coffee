
window.LocationUpdate =()->
  console.log("locationUpdate called");

  getLocation = ()->
    geoc = new BMap.Geocoder();
    point = new BMap.Point(Session.get('location').longitude,Session.get('location').latitude);
    #point = new BMap.Point(116.404, 39.915);
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
              if results.length > 1
                Session.set("userAddress",JSON.stringify(results[1].formatted_address))
                console.log("#google location city is " + Session.get("userAddress"))
                #alert(Session.get("userAddress"));
                Meteor.users.update Meteor.userId(),{$set:{'profile.location':Session.get("userAddress")}}


      else
        console.log("getLocation rs is null")

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


Accounts.onLogin(()->
  console.log("Accounts.onLogin");
  window.LocationUpdate()
)