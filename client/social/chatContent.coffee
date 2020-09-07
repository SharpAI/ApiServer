if Meteor.isClient
  Template.chatContent.rendered=->
    #Meteor.subscribe("msgSession")
  Template.chatContent.helpers
    withChat: ()->
      withChat
    time_diff: (time)->
      now = new Date()
      showTime = GetTime0(now - time)
      showTime
    msgSession: ()->
      MsgSession.find({userId: Meteor.userId()}, {sort: {updateTime: -1}})
    isShowWaitRead: (waitRead)->
      waitRead > 0
    isGroup: (sesType)->
      sesType is 'groupChat' or sesType is 'chatNotify'
  Template.chatContent.events
    'click .eachChat': (e)->
      Session.set("messageDialog_to", {id: e.currentTarget.id, type: 'session'})
      Session.set("Social.LevelOne.Menu", 'messageDialog')