if Meteor.isClient
  Template.chatGroups.rendered=->
    $('.content').css 'min-height',$(window).height()
    Meteor.subscribe("get-my-group", Meteor.userId())
#    $('.mainImage').css('height',$(window).height()*0.55)
    $(window).scroll (event)->
        target = $("#showMoreFollowsResults");
        FOLLOWS_ITEMS_INCREMENT = 10;
        if (!target.length)
            return;
        threshold = $(window).scrollTop() + $(window).height() - target.height();
        if target.offset().top < threshold
            if (!target.data("visible"))
                target.data("visible", true);
                Session.set("followersitemsLimit",
                Session.get("followersitemsLimit") + FOLLOWS_ITEMS_INCREMENT);
        else
            if (target.data("visible"))
                target.data("visible", false);
  Template.chatGroups.helpers
    showBubbleTipHintTemplate:()->
      Session.equals('needShowBubble','true')
    msgSession2: ()->
      return SimpleChat.MsgSession.find({userId: Meteor.userId()}, {sort: {sessionType: 1, updateAt: -1}})
    isGroup: (msg)->
      return msg.to_type is 'group'
    hasVal: (val)->
      console.log('hasVal:', if val then true else false)
      return if val then true else false
    hasCount: (val)->
      return val > 0
    formatTime: (val)->
      return get_diff_time(val)
    msgSession: ()->
      SimpleChat.GroupUsers.find({user_id:Meteor.userId()}, {sort: {createdAt: -1}})
    myChatGroups:()->
      Follower.find({"userId":Meteor.userId()}, {sort: {createdAt: -1}}, {limit:Session.get("followersitemsLimit")})
    hasSysMessages:()->
      if Feeds.find().count() > 0
        true
      else
        false
    showRedSpot:()->
      me = Meteor.user()
      if me
        wait_read_count = Feeds.find({
            followby: Meteor.userId(),
            isRead:{$ne: true},
            checked:{$ne: true},
            eventType:{$ne:'share'},
            createdAt: {$gt: new Date((new Date()).getTime() - 7 * 24 * 3600 * 1000)}
          },{
            limit: 99
          }).count()
        if wait_read_count > 0
          true
        else
          false
      else
        false
    moreResults:->
      !(Follower.find({"userId":Meteor.userId()}).count() < Session.get("followersitemsLimit"))
    loading:->
      Session.equals('followersCollection','loading')
    loadError:->
      Session.equals('followersCollection','error')
  updateTotalReadCount = ()->
    totalReadCount = 0
    msgSess = SimpleChat.MsgSession.find()
    msgSess.forEach((msg)->
      if (msg.count)
        totalReadCount = totalReadCount + msg.count
    )
    if (totalReadCount <= 0)
      Session.set('hasNewLabelMsg', false)
  Template.chatGroups.events
    'click #sysBell':(event)->
      Meteor.defer ()->
        me = Meteor.user()
        if me and me.profile and me.profile.waitReadCount
          if me.profile.waitReadCount > 0
            Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.waitReadCount': 0}});
      PUB.page('/bell')
    'click li': (event)->
      if isIOS
        if (event.clientY + $('.home #footer').height()) >=  $(window).height()
          console.log 'should be triggered in scrolling'
          return false
      url = '/simple-chat/to/'+this.sessionType+'?id='+ this.toUserId
      SimpleChat.MsgSession.update({_id: this._id}, {$set: {count: 0}})
      setTimeout ()->
        PUB.page(url)
      ,animatePageTrasitionTimeout
      updateTotalReadCount()
