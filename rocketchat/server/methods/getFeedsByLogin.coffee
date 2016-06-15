
Meteor.methods
  getFeedsByLogin: (type)->
    this.unblock()

    type = type || 'SelfPosted'
    if not Meteor.userId()
      return []
      
    # return [
    #   {
    #     owner:'NYtJcHfCKSE6GWhmj',
    #     ownerName:'ccoo',
    #     ownerIcon:'',
    #     eventType:'SelfPosted',
    #     postId:'NYtJcHfCKSE6GWhmj',
    #     postTitle:'千老这个称谓的来历',
    #     mainImage:'http://data.tiegushi.com/2Yfmd5PmEDsoECLvg_1459975484141_cdv_photo_001.jpg',
    #     createdAt:new Date(new Date().getTime()-1455460221),
    #     heart:0,
    #     retweet:0,
    #     comment:0,
    #     followby: Meteor.userId()
    #   },
    #   {
    #     owner:'NYtJcHfCKSEfd6GWj',
    #     ownerName:'ccoo',
    #     ownerIcon:'',
    #     eventType:'SelfPosted',
    #     postId:'NYtJcHfCKSE6GWhmj',
    #     postTitle:'千老这个称谓的来历',
    #     mainImage:'http://data.tiegushi.com/2Yfmd5PmEDsoECLvg_1459975484141_cdv_photo_001.jpg',
    #     createdAt:new Date(new Date().getTime()-14501),
    #     heart:0,
    #     retweet:0,
    #     comment:0,
    #     followby: Meteor.userId()
    #   }
    # ]
    
    me=Meteor.user()
    myGushitieID=null
    if me and me.services and me.services.gushitie and me.services.gushitie.id
        myGushitieID=me.services.gushitie.id
    if me and me.gushitie and me.gushitie.id
        myGushitieID=me.gushitie.id

    result = []
    if myGushitieID?
      #GushitieFeeds.find({followby:Meteor.userId(),checked:false}).forEach (feed)->
      GushitieFeeds.find({followby: myGushitieID, eventType: type, checked:{$ne: true}}, {limit: 5}).forEach (feed)->
        if feed.pindex
          post = GushitiePosts.findOne({_id: feed.postId})
          feed.pindexText = post.pub[index].text
        result.push(feed)
      #GushitieFeeds.update({followby:Meteor.userId(),checked:false}, {$set: {checked: true}})
      GushitieFeeds.update({followby: myGushitieID, eventType: type, checked:{$ne: true}}, {$set: {checked: true}}, {multi: true})
    
    return result