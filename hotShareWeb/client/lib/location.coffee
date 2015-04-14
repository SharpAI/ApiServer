updateFromThirdPartWebsite = ()->
  $.getJSON "http://www.telize.com/geoip?callback=?",(json , textStatus, jqXHR )->
    if (textStatus is 'success') and json
      address = ''
      if json.country and json.country isnt ''
        address += json.country
      if json.region and json.region isnt ''
        if address isnt ''
          address += ', '
        address += json.region + ','
      if json.city and json.city isnt ''
        if address isnt ''
          address += ', '
        address += json.city
      if address isnt ''
        Meteor.users.update Meteor.userId(),{$set:{'profile.location':address}}
        console.log 'Set address to ' + address
window.LocationUpdate =()->
  console.log("locationUpdate called")
  getLocation = ()->
    geoc = new BMap.Geocoder();
    point = new BMap.Point(Session.get('location').longitude,Session.get('location').latitude);

    geoc.getLocation point,(rs)->
      if rs and rs.addressComponents
        addComp = rs.addressComponents
        address = ''
        if addComp.province and (addComp.province isnt '') and (addComp.province isnt addComp.city)
          address += addComp.province + ' '
        if addComp.city and addComp.city isnt ''
          address += addComp.city
        if address isnt ''
          Meteor.users.update Meteor.userId(),{$set:{'profile.location':address}}
          return
      else
        console.log 'cant handle by baidu'
        updateFromThirdPartWebsite()

  Meteor.call 'getGeoFromConnection',(err,response )->
    if response and response.ll
      Session.set('location',{latitude:response.ll[0],longitude:response.ll[1],type:'ip'})
      getLocation()
      #Session.set('location',{latitude:39.915,longitude:116.404,type:'ip'})
      #Session.set('location',{latitude:37.394,longitude:-122.031,type:'ip'})
    else
      updateFromThirdPartWebsite()

Accounts.onLogin(()->
  Meteor.setTimeout ()->
    console.log("Accounts.onLogin")
    window.BMap_loadScriptTime = (new Date).getTime()
    url = "http://api.map.baidu.com/getscript?v=2.0&ak=Wg2XtQkIKg1YwWzGguTw9lTj&services=&t=20150330161927"
    $.getScript url, (data, textStatus, jqxhr)->
      console.log 'status is ' + textStatus
      if textStatus is 'success'
        window.LocationUpdate()
      else
        updateFromThirdPartWebsite()

)