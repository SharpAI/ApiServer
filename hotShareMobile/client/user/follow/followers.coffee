#space 2
if Meteor.isClient
  @addFollower = (data)->
    followerId = data.followerId
    callback = ()->
      blackId = BlackList.findOne({blackBy: Meteor.userId()})._id
      BlackList.update({_id: blackId}, {$pull: {blacker: followerId}})
      Follower.insert data
    #对方在黑名单中
    if BlackList.find({blackBy: Meteor.userId(), blacker:{$in: [followerId]}}).count() > 0
       navigator.notification.confirm(
                '你已将对方加入黑名单，是否解除？'
                (index)->
                    if index is 2
                       callback()
                '提示'
                ['暂不','解除']
            )
    else
      Follower.insert data
  Template.followers.rendered=->
    $('.content').css 'min-height',$(window).height()
    $(window).scroll (event)->
        target = $("#showMoreFollowsResults");
        FOLLOWS_ITEMS_INCREMENT = 10;
        if (!target.length)
            return;
        threshold = $(window).scrollTop() + $(window).height() - target.height();
        if target.offset().top < threshold
            if (!target.data("visible"))
                target.data("visible", true);
                if Session.get('followers_tag')
                  Session.set("followersitemsLimit",
                  Session.get("followersitemsLimit") + FOLLOWS_ITEMS_INCREMENT);
                else
                  Session.set("followeesitemsLimit",
                  Session.get("followeesitemsLimit") + FOLLOWS_ITEMS_INCREMENT);
        else
            if (target.data("visible"))
                target.data("visible", false);
  Template.followers.helpers
    followers:->
      #true 列出偶像列表，false 列出粉丝列表
      #Follower存放用户间关注记录， Follows是推荐偶像列表
      #followerId是偶像userId, userId是粉丝userId
      if Session.get('followers_tag')
          #粉丝是自己的； true 列出偶像
          Follower.find({"userId":Meteor.userId()}, {sort: {createdAt: -1}}, {limit:Session.get("followersitemsLimit")})
      else
          #偶像id是自己的； false 列出粉丝
          Follower.find({"followerId":Meteor.userId()}, {sort: {createdAt: -1}}, {limit:Session.get("followeesitemsLimit")})
    isFollowers:->
      if Session.get('followers_tag')
         true
      else
         false
    page_title:->
      #true 列出偶像列表，false 列出粉丝列表
      if Session.get('followers_tag')
         #'正在关注'
         TAPi18n.__("following")
      else
         #'关注者'
         TAPi18n.__("follower")
    isFollowed:(follow)->
      if Session.get('followers_tag')
         #follow.userId是自己
         #follow.followerId是偶像
         #这个页面可以取消关注，所以要重新检查是否还有关注
         fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow.followerId}).count()
      else
         #follow.userId是粉丝
         #找followerId是follow.userId，是否互粉
         Meteor.subscribe("friendFollower",Meteor.userId(),follow.userId)
         fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow.userId,"userEmail": {$exists: false}}).count()
      if fcount > 0
         true
      else
         false
    moreResults:->
      if Session.get('followers_tag')
        !(Follower.find({"userId":Meteor.userId()}).count() < Session.get("followersitemsLimit"))
      else
        !(Follower.find({"followerId":Meteor.userId()}).count() < Session.get("followeesitemsLimit"))
    loading:->
      if Session.get('followers_tag')
        Session.equals('followersCollection','loading')
      else
        Session.equals('followeesCollection','loading')
    loadError:->
      if Session.get('followers_tag')
        Session.equals('followersCollection','error')
      else
        Session.equals('followeesCollection','error')
  Template.followers.events
    'click .back' :->
      Router.go '/user'
    'click .del':(e)->
      followerId = e.currentTarget.id
      FollowerId = Follower.findOne({
                     userId: Meteor.userId()
                     followerId: followerId
                 })._id
      Follower.remove(FollowerId)
    'click .add':(e)->
      #true 列出偶像列表，false 列出粉丝列表
      if Session.get('followers_tag')
          followerId = @followerId
          followerName = @followerName
          followerIcon = @followerIcon
          followerDesc = @followerDesc
      else
          followerId = @userId
          followerName = @userName
          followerIcon = @userIcon
          followerDesc = @userDesc

      if Meteor.user().profile.fullname
         username = Meteor.user().profile.fullname
      else
         username = Meteor.user().username
      insertObj = {
        userId: Meteor.userId()
        #这里存放fullname
        userName: username
        userIcon: Meteor.user().profile.icon
        userDesc: Meteor.user().profile.desc
        followerId: followerId
        #这里存放fullname
        followerName: followerName
        followerIcon: followerIcon
        followerDesc: followerDesc
        createAt: new Date()
      }
      addFollower(insertObj)
