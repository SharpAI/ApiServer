
window.LocationUpdate =()->
  console.log("locationUpdate called");
  onSuccess = (position) ->
    console.log('\nLatitude: '          + position.coords.latitude          + '\n' +
    'Longitude: '         + position.coords.longitude         + '\n' +
    'Accuracy: '          + position.coords.accuracy          + '\n' +
    'Timestamp: '         + position.timestamp                + '\n');
    Session.set('location',{latitude: position.coords.latitude,longitude:position.coords.longitude,type:'geo',accuracy:position.coords.accuracy })
    geoc = new BMap.Geocoder();
    point = new BMap.Point(position.coords.longitude,position.coords.latitude);
    #point = new BMap.Point(116.404, 39.915);
    geoc.getLocation point,(rs)->
     if rs and rs.addressComponents
        addComp = rs.addressComponents
        if addComp.city and addComp.city is ''
          Session.set("userAddress",addComp.city+' '+addComp.district)
          console.log("#baidu location city is " + Session.get("userAddress"))
          Meteor.users.update Meteor.userId(),{$set:{'profile.location':Session.get("userAddress")}}
        else
          requestUrl = "http://maps.googleapis.com/maps/api/geocode/json?latlng="+Session.get('location').latitude+','+Session.get('location').longitude+'&sensor=false'
          Meteor.http.call "GET",requestUrl,(error,result)->
            if result.statusCode is 200
              results = result.data.results
              if results.length > 1
                Session.set("userAddress",JSON.stringify(results[1].formatted_address))
                console.log("#google location city is " + Session.get("userAddress"))
                Meteor.users.update Meteor.userId(),{$set:{'profile.location':Session.get("userAddress")}}
     else
      console.log("getLocation rs is null")


  onError = (error) ->
    console.log('code: '    + error.code    + '\n' +
    'message: ' + error.message + '\n');

  Meteor.call('getGeoFromConnection',(err,response )->
    location = Session.get('location');
    if location and location.type isnt 'geo'
      Session.set('location',{latitude:response.ll[0],longitude:response.ll[1],type:'ip'})
      Session.set("userAddress",response.city+response.region+response.country)
      console.log('#IP Location is ' + JSON.stringify(response ))
      Meteor.users.update Meteor.userId(),{$set:{'profile.location':Session.get("userAddress")}}
  )
  window.navigator.geolocation.getCurrentPosition(onSuccess, onError, { maximumAge: 600000, timeout:60000,enableHighAccuracy :false});


