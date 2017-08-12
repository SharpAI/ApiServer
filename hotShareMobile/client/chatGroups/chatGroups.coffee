if Meteor.isClient
  @sysMsgToUserId = 'fTnmgpdDN4hF9re8F'
  Template.chatGroups.rendered=->
    $('.content').css 'min-height',$(window).height()
    #Meteor.subscribe("get-my-group", Meteor.userId())
#    $('.mainImage').css('height',$(window).height()*0.55)
    # $(window).scroll (event)->
    #     target = $("#showMoreFollowsResults");
    #     FOLLOWS_ITEMS_INCREMENT = 10;
    #     if (!target.length)
    #         return;
    #     threshold = $(window).scrollTop() + $(window).height() - target.height();
    #     if target.offset().top < threshold
    #         if (!target.data("visible"))
    #             target.data("visible", true);
    #             Session.set("followersitemsLimit",
    #             Session.get("followersitemsLimit") + FOLLOWS_ITEMS_INCREMENT);
    #     else
    #         if (target.data("visible"))
    #             target.data("visible", false);
  Template.chatGroups.helpers
    showBubbleTipHintTemplate:()->
      Session.equals('needShowBubble','true')
    msgSession2: ()->
      return SimpleChat.MsgSession.find({userId: Meteor.userId(),toUserId:{$ne: sysMsgToUserId}}, {sort: {updateAt: -1}})
    isGroup: (msg)->
      return msg.to_type is 'group'
    hasVal: (val)->
      console.log('hasVal:', if val then true else false)
      return if val then true else false
    hasCount: (val)->
      return val > 0
    formatTime: (val)->
      return get_diff_time(val)
    # msgSession: ()->
    #   SimpleChat.GroupUsers.find({user_id:Meteor.userId()}, {sort: {createdAt: -1}})
    # myChatGroups:()->
    #   Follower.find({"userId":Meteor.userId()}, {sort: {createdAt: -1}}, {limit:Session.get("followersitemsLimit")})
    hasSysMessages:()->
      sysMsg = SimpleChat.MsgSession.findOne({userId: Meteor.userId(),toUserId:sysMsgToUserId})
      if sysMsg
        return true
      return false
    showRedSpot:()->
      msgSession = SimpleChat.MsgSession.findOne({userId: Meteor.userId(),toUserId:sysMsgToUserId})
      if msgSession && msgSession.count
        return msgSession.count > 0
      else
        return false
    # moreResults:->
    #   !(Follower.find({"userId":Meteor.userId()}).count() < Session.get("followersitemsLimit"))
    # loading:->
    #   Session.equals('followersCollection','loading')
    # loadError:->
    #   Session.equals('followersCollection','error')
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
    'click #joinTestChatGroups':(event)->
      event.stopImmediatePropagation()
      PUB.page '/introductoryPage2'
    'click #createNewChatGroups':(event)->
      event.stopImmediatePropagation()
      #Router.go('/group/add')
      Session.set('fromCreateNewGroups',true);
      Router.go('/setGroupname');
      #ScanBarcodeByBarcodeScanner()
    'click #addNewFriends':(event)->
      event.stopImmediatePropagation()
      PUB.page '/searchFollow'
    'click #scanbarcode':(event)->
      event.stopImmediatePropagation()
      ScanBarcodeByBarcodeScanner()
    'click #scanimage':(event)->
      event.stopImmediatePropagation()
      DecodeImageFromAlum()
    'click #sysBell':(event)->
      Meteor.defer ()->
        msgSession = SimpleChat.MsgSession.findOne({userId: Meteor.userId(),toUserId:sysMsgToUserId});
        if msgSession
          SimpleChat.MsgSession.update({_id:msgSession._id},{$set:{count:0}});
      PUB.page('/checkInOutMsgList')
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
