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
window.updateMyOwnLocationAddress = ()->
  return updateFromThirdPartWebsite()
  console.log('Update location now')
  url = "http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js"
  $.getScript url, (data, textStatus, jqxhr)->
    console.log 'status is ' + textStatus
    address = ''
    if textStatus is 'success' and remote_ip_info and remote_ip_info.ret is 1
      console.log 'Remote IP Info is ' + JSON.stringify(remote_ip_info)
      if remote_ip_info.country and remote_ip_info.country isnt '' and remote_ip_info.country isnt '中国'
        address += remote_ip_info.country
        address += ' '
      if remote_ip_info.province and remote_ip_info.province isnt ''
        address += remote_ip_info.province
        address += ' '
      if remote_ip_info.city and remote_ip_info.city isnt '' and remote_ip_info.city isnt remote_ip_info.province
        address += remote_ip_info.city
      console.log 'Address is ' + address
      if address isnt ''
        Meteor.users.update Meteor.userId(),{$set:{'profile.location':address}}
      else
        updateFromThirdPartWebsite()
    else
      updateFromThirdPartWebsite()