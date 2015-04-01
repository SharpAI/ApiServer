if Meteor.isClient
  Template.chatContent.rendered=->
    #Meteor.subscribe("msgSession")
  Template.chatContent.helpers
    time_diff: (time)->
      now = new Date()
      showTime = GetTime0(now - time)
      showTime
    msgSession: ()->
      MsgSession.find({userId: Meteor.userId()}, {sort: {updateTime: -1}})
    isShowWaitRead: (waitRead)->
      waitRead > 0
    withChat: ()->
      withChat
  Template.chatContent.events
    'click .eachChat': (e)->
      Meteor.subscribe("userinfo",Session.get("ProfileUserId"));
      Session.set("messageDialog_to_userId", e.currentTarget.id)
      Session.set("Social.LevelOne.Menu", 'messageDialog')