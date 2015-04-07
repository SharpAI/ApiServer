if Meteor.isClient
  Template.userProfile.rendered=->
    $('.userProfile').css('min-height',$(window).height()-90)
    $('.viewPostImages ul li').css('height',$(window).width()*0.168)
  Template.userProfile.helpers
    isMale:(sex)->
      sex is 'male'
    isFemale:(sex)->
      sex is 'female'
    AddFriend:->
      addstr = '添加'
      if Feeds.find({requesteeId:Session.get("ProfileUserId"),requesterId:Meteor.userId()}).count()>0
        addstr = '已发送邀请'
      addstr
    withChat:->
      withChat
    profile:->
      Meteor.users.findOne {_id: Session.get("ProfileUserId")}
    isFollowed:()->
      fcount = Follower.find({"followerId":Session.get("ProfileUserId")}).count()
      if fcount > 0
        true
      else
        false
    viewItems:()->
      value = 0
      count = Viewers.find({userId:Session.get("ProfileUserId")},{sort: {createdAt: -1}, limit:3}).count()
      if count >=3
        value = 2
      else
        value = count-1
      for i in [0..value]
        vDoc = Viewers.find({userId:Session.get("ProfileUserId")},{sort: {createdAt: -1}}).fetch()[i]
        Meteor.subscribe("publicPosts",vDoc.postId)
        Posts.findOne({_id:vDoc.postId})
    compareViewsCount:(value)->
      if (Viewers.find({userId:Session.get("ProfileUserId")}, {sort: {createdAt: -1}, limit:3}).count() > value)
        true
      else
        false
    isSuggested:()->
      Meteor.subscribe("userFeeds", Session.get("ProfileUserId"),Session.get("postContent")._id)
      if Feeds.find({followby: Session.get("ProfileUserId"),postId: Session.get("postContent")._id,recommanderId:Meteor.userId()}).count()>0
        true
      else
        false
  Template.userProfile.events
    'click #suggestCurrentPost': ()->
      username = Meteor.user().username
      if Meteor.user().profile.fullname
        username = Meteor.user().profile.fullname
      Feeds.insert {
        owner:Session.get("postContent").owner
        ownerName:Session.get("postContent").ownerName
        ownerIcon:Session.get("postContent").ownerIcon
        eventType:'recommand'
        postId:Session.get("postContent")._id
        postTitle:Session.get("postContent").title
        mainImage:Session.get("postContent").mainImage
        createdAt:new Date()
        heart:Session.get("postContent").heart
        retweet:Session.get("postContent").retweet
        comment:Session.get("postContent").comment
        followby: Session.get("ProfileUserId")
        recommander:username
        recommanderIcon:Meteor.user().profile.icon
        recommanderId:Meteor.userId()
      }
    'click #sendChatMessage': ()->
      Meteor.subscribe("userinfo",Session.get("ProfileUserId"));
      Session.set("messageDialog_to", {id: Session.get("ProfileUserId"), type: 'user'})
      Session.set("Social.LevelOne.Menu", 'messageDialog')
    'click .postImages ul li':(e)->
      postId = e.currentTarget.id
      Router.go '/redirect/'+postId
    'click #addToContactList': ()->
      username = Meteor.user().username
      if Meteor.user().profile.fullname
        username = Meteor.user().profile.fullname
      UserProfile = Meteor.users.findOne {_id: Session.get("ProfileUserId")}
      requestee = UserProfile.username
      if UserProfile.profile.fullname
        requestee = UserProfile.profile.fullname
      if Follower.findOne({"userId":UserProfile._id,"followerId":Meteor.userId()})
        Follower.insert {
          userId: Meteor.userId()
          userName: username
          userIcon: Meteor.user().profile.icon
          userDesc: ''
          followerId: UserProfile._id
          followerName: requestee
          followerIcon: UserProfile.profile.icon
          followerDesc: ''
          createAt: new Date()
        }
        return
      if Feeds.findOne({"requesteeId":Meteor.userId(),"requesterId":UserProfile._id})
        Follower.insert {
          userId: Meteor.userId()
          userName: username
          userIcon: Meteor.user().profile.icon
          userDesc: ''
          followerId: UserProfile._id
          followerName: requestee
          followerIcon: UserProfile.profile.icon
          followerDesc: ''
          createAt: new Date()
        }
        Follower.insert {
          userId: UserProfile._id
          userName: requestee
          userIcon: UserProfile.profile.icon
          userDesc: ''
          followerId: Meteor.userId()
          followerName: username
          followerIcon: Meteor.user().profile.icon
          followerDesc: ''
          createAt: new Date()
        }
        return
      Feeds.insert {
        eventType:'sendrequest'
        createdAt:new Date()
        followby:Meteor.userId()
        requestee:requestee
        requesteeIcon:UserProfile.profile.icon
        requesteeId:UserProfile._id
        requester:username
        requesterIcon:Meteor.user().profile.icon
        requesterId:Meteor.userId()
      }
      Feeds.insert {
        eventType:'getrequest'
        createdAt:new Date()
        followby:UserProfile._id
        requestee:requestee
        requesteeIcon:UserProfile.profile.icon
        requesteeId:UserProfile._id
        requester:username
        requesterIcon:Meteor.user().profile.icon
        requesterId:Meteor.userId()
      }

