Template.checkInOutMsgListImageItem.rendered=->
  this.$('img.lazy').lazyload()

Template.checkInOutMsgList.rendered=->
  $('.content').css 'min-height',$(window).height()
  Session.set('sysMsgIsRead',false);
  Session.set('sysMsgLimit',20);
  SimpleChat.loadMoreMesage({'to.id':Meteor.userId(),'form.id':sysMsgToUserId,is_read:Session.get('sysMsgIsRead')},{limit:Session.get('sysMsgLimit'),sort:{create_time:-1}},Session.get('sysMsgLimit'));
  $(window).scroll (event)->
    target = $("#showMoreResults");
    MSG_IEMS_INCREMENT = 10;
    if (!target.length)
        return;
    threshold = $(window).scrollTop() + $(window).height() - target.height();
    if target.offset().top < threshold
        if (!target.data("visible"))
            target.data("visible", true);
            Session.set("sysMsgLimit", Session.get("sysMsgLimit") + MSG_IEMS_INCREMENT);
            SimpleChat.loadMoreMesage({'to.id':Meteor.userId(),'form.id':sysMsgToUserId,is_read:Session.get('sysMsgIsRead')},{limit:Session.get('sysMsgLimit'),sort:{create_time:-1}},Session.get('sysMsgLimit'));
    else
        if (target.data("visible"))
            target.data("visible", false);
Template.checkInOutMsgList.helpers
  noMsg:()->
    count = SimpleChat.Messages.find({'to.id':Meteor.userId(),'form.id':sysMsgToUserId,is_read:Session.get('sysMsgIsRead')}).count();
    !(count > 0)
  msgType:()->
    is_read = Session.get('sysMsgIsRead')
    if is_read
      return '已读'
    return '未读'
  formatTime: (val)->
      return get_diff_time(val)
  mySysMsg:()->
    return SimpleChat.Messages.find({'to.id':Meteor.userId(),'form.id':sysMsgToUserId,is_read:Session.get('sysMsgIsRead')},{sort: {create_time: -1}})
  moreResults:->
    count = SimpleChat.Messages.find({'to.id':Meteor.userId(),'form.id':sysMsgToUserId,is_read:Session.get('sysMsgIsRead')}).count();
    !(count < Session.get("sysMsgLimit"))
Template.checkInOutMsgList.events
    'click .top-unread-btn': (event)->
      Session.set('sysMsgIsRead',false)
      $('.checkInOutMsgList .active').removeClass('active')
      $(event.currentTarget).addClass('active')
    'click .top-read-btn':(event)->
      Session.set('sysMsgIsRead',true)
      $('.checkInOutMsgList .active').removeClass('active')
      $(event.currentTarget).addClass('active')
      SimpleChat.loadMoreMesage({'to.id':Meteor.userId(),'form.id':sysMsgToUserId,is_read:Session.get('sysMsgIsRead')},{limit:Session.get('sysMsgLimit'),sort:{create_time:-1}},Session.get('sysMsgLimit'));
    'click .leftButton': (event)->
      PUB.back()
    'click #list ul li':(e)->
      msgId = e.currentTarget.id
      slef = this;
      confirm_callBack = (index)->
        if index is 1
          img = slef.images[0];
          data = {
            user_id:Meteor.userId(),
            face_id:img.id,
            person_info:{
               'uuid': slef.people_uuid,
               'name': img.label,
               'group_id': slef.group_id,
               'img_url': img.url,
               'type': img_type,
               'ts': new Date(slef.create_time).getTime(),
               'accuracy': img.accuracy,
               'fuzziness': img.fuzziness
            }
          }
          if slef.checkin_out is 'in'
            data.checkin_time = slef.create_time;
          else if slef.checkin_out is 'out'
            data.checkout_time = slef.create_time;
          Meteor.call('ai-checkin-out',data,(error,res)->
            if error || !res || res.result isnt 'succ'
              PUB.toast '记录失败，请重试'
              console.log 'ai-checkin-out error:' + error
              return
            PUB.toast '记录成功！'
            )
          # ...
        else
          #跳转至时间轴
          PUB.page '/timelineAlbum/'+slef.people_uuid
      confirm_text = '是否将该时间记录到每日出勤报告？'
      if slef.checkin_out and slef.checkin_out isnt ''
        if slef.images and slef.images.length > 0
          try
            navigator.notification.confirm(confirm_text,
                (index)->
                  confirm_callBack(index)
                ,'提示',['确定','修改']);
          catch e
            if confirm(confirm_text)
              confirm_callBack(1)
            else
              confirm_callBack(2)
        else
          #跳转至时间轴
          PUB.page '/timelineAlbum/'+slef.people_uuid
      SimpleChat.Messages.update({_id:msgId},{$set:{is_read:true}});