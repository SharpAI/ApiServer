
Meteor.methods
  getFeedsByLogin: ()->
    if not Meteor.userId()
      return []
    
    result = []
    GushitieFeeds.find({followby:Meteor.userId(),checked:false}).forEach (feed)->
      result.push(feed)
    GushitieFeeds.update({followby:Meteor.userId(),checked:false}, {$set: {checked: true}})
    
    return result