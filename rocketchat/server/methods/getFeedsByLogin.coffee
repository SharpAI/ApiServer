
Meteor.methods
  getFeedsByLogin: ()->
    this.unblock()

    if not Meteor.userId()
      return []
    
    me=Meteor.user()
    myGushitieID=null
    if me and me.services and me.services.gushitie and me.services.gushitie.id
        myGushitieID=me.services.gushitie.id
    if me and me.gushitie and me.gushitie.id
        myGushitieID=me.gushitie.id

    result = []
    if myGushitieID?
        #GushitieFeeds.find({followby:Meteor.userId(),checked:false}).forEach (feed)->
        GushitieFeeds.find({followby: myGushitieID,checked:false}).forEach (feed)->
          result.push(feed)
        #GushitieFeeds.update({followby:Meteor.userId(),checked:false}, {$set: {checked: true}})
        GushitieFeeds.update({followby: myGushitieID,checked:false}, {$set: {checked: true}}, {multi: true})
    
    return result