if Meteor.isClient
  @sysMsgToUserId = 'fTnmgpdDN4hF9re8F'
  Template.chatGroups.created = ->
    if Session.get('offlineMsgOverflow')
      PUB.toast('收件箱已满，消息可能丢失......')
      Session.set('offlineMsgOverflow', false)
    
  Template.chatGroups.rendered=->
    #$('.content').css 'min-height',$(window).height()
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
    msgSess = SimpleChat.MsgSession.find({userId: Meteor.userId(),toUserId:{$ne: sysMsgToUserId}}, {sort: {updateAt: -1}})
    if (msgSess)
      msgSess.forEach (sess)->
        if sess.sessionType is 'group' and sess.toUserId
          Meteor.subscribe 'getStrangersByGroupId', sess.toUserId

  Template.chatGroups.helpers
    hasNewLabelMsg:()->
      Session.get('hasNewLabelMsg')
    syncing:()->
      Session.get('history_message')
    showBubbleTipHintTemplate:()->
      Session.equals('needShowBubble','true')
    msgSession2: ()->
      SimpleChat.MsgSession.update({toUserId:Session.get('touserid6')},{$set:{toUserName: Session.get('tousername6')}})
      return SimpleChat.MsgSession.find({userId: Meteor.userId(),toUserId:{$ne: sysMsgToUserId}}, {sort: {updateAt: -1}})
    isGroup: (msg)->
      return msg.to_type is 'group'
    hasVal: (val)->
      console.log('hasVal:', if val then true else false)
      return if val then true else false
    hasCount: (val)->
      #Session.set('hasNewLabelMsg',true)
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
    totalReadCount = -1
    msgSess = SimpleChat.MsgSession.find()
    msgSess.forEach((msg)->
    if (msg.count)
        totalReadCount = totalReadCount + msg.count
    )
    if (totalReadCount < 0)
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
      # Meteor.defer ()->
      #   msgSession = SimpleChat.MsgSession.findOne({userId: Meteor.userId(),toUserId:sysMsgToUserId});
      #   if msgSession
      #     SimpleChat.MsgSession.update({_id:msgSession._id},{$set:{count:0}});
      PUB.page('/checkInOutMsgList')
    'click li': (event)->
      if isIOS
        if (event.clientY + $('.home #footer').height()) >=  $(window).height()
          console.log 'should be triggered in scrolling'
          return false
      critiaria = { group_id: { $eq: this.toUserId} };
      face_settings = {"face_list" : ["front","human_shape"], "fuzziness" : "100"}
      if face_settings
          critiaria.imgs = {$elemMatch: {style: {$in: face_settings.face_list}, fuzziness: {$gte: parseInt(face_settings.fuzziness)}}};
      scursor = Strangers.find(critiaria);
      strange = scursor.count()
      urlMsg = '/simple-chat/to/'+this.sessionType+'?id='+ this.toUserId
      url = '/ishaveStranger/'
      SimpleChat.MsgSession.update({_id: this._id}, {$set: {count: 0}})
      Session.set("isMark",true)
      Session.set("session_type", this.sessionType)
      Session.set("toUser_id",this.toUserId)

      strangeToUserId = this.toUserId
      scursor.observeChanges
          removed: (id)->
            count = Strangers.find(critiaria).count()
            console.log('##RDBG, stranger count: ' + count)
            if count is 0 and Router.current().originalUrl is '/ishaveStranger/' and Session.get('toUser_id') is strangeToUserId
              PUB.page(urlMsg)

      if strange
        PUB.page(url)
      else
        setTimeout ()->
          PUB.page(urlMsg)
        ,animatePageTrasitionTimeout
        
      #Session.set('hasNewLabelMsg',false)
      #updateTotalReadCount()
    'click .delBtnContent': (e,t)->
      e.stopImmediatePropagation();
      isSysDel = $(e.currentTarget).hasClass('sysDelBtn');
      userId = Meteor.userId();
      if isSysDel
        SimpleChat.MsgSession.remove({userId: userId,toUserId:sysMsgToUserId},(err,num)->
          if(err)
            return console.log('del MsgSession Err:',err);
          console.log('num =',num)
          # remove local msg with this Session
          SimpleChat.Messages.remove({'to.id': sysMsgToUserId,'form.id': userId});
          SimpleChat.Messages.remove({'to.id': userId,'form.id': sysMsgToUserId});
          Meteor.setTimeout(()->
            SimpleChat.MessagesHis.remove({'to.id': sysMsgToUserId,'form.id': userId});
            SimpleChat.MessagesHis.remove({'to.id': userId,'form.id': sysMsgToUserId});
          ,100)
        );
        return;
      _id = e.currentTarget.id;
      type = $(e.currentTarget).data('type');
      toUserId = $(e.currentTarget).data('touserid');
      $(e.target).parents('li').slideUp('fast', ()->
        $(e.target).parent('li').remove();
        # remove current list
        SimpleChat.MsgSession.remove({_id: _id},(err,num)->
          if(err)
            return console.log('del MsgSession Err:',err);
          console.log('num =',num)
          # remove local msg with this Session
          SimpleChat.Messages.remove({'to.id': toUserId,'form.id': userId});
          SimpleChat.Messages.remove({'to.id': userId,'form.id': toUserId});
          Meteor.setTimeout(()->
            SimpleChat.MessagesHis.remove({'to.id': toUserId,'form.id': userId});
            SimpleChat.MessagesHis.remove({'to.id': userId,'form.id': toUserId});
          ,100)
        );
      );
