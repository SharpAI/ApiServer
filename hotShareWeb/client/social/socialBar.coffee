if Meteor.isClient
  Session.setDefault("Social.LevelOne.Menu",'discover')
  Session.setDefault("SocialOnButton",'postBtn')
  Template.socialContent.events
    'click .postBtn':->
      #PUB.postPageBack()
      $('.showPostsBox,.showPostsLine,.superChatIntroduce').show()
      trackEvent("socialBar","Post")
      Session.set("SocialOnButton",'postBtn')
      Session.set("Social.LevelOne.Menu",'discover')
      if $('.contactsList .head').is(':visible')
        $('.contactsList .head').fadeOut 300
      document.body.scrollTop = 0
    'click .chatBtn': (e)->
      $('.showPostsBox,.showPostsLine,.superChatIntroduce').show()
      $(".chatBtn .red_spot").hide().html(0)
      trackEvent("socialBar","GroupChat")
      e.stopPropagation()
      #window.location.href = 'http://testchat.tiegushi.com/channel/'+ Session.get('postContent')._id+'/userid/'+Meteor.userId();
      #This is a Evaluation version to redirect all web user to the same chat room, let's wait and see what will happen
      url = 'http://'+chat_server_url+'/channel/'+ Session.get('postContent')._id+'/userid/'+Meteor.userId();
      window.open(url,'_blank')
#Session.set("Social.LevelOne.Menu",'chatContent')
      #Session.set("SocialOnButton",'chatContent')
    'click .contactsBtn':->
      $('.showPostsBox,.showPostsLine,.superChatIntroduce').show()
      trackEvent("socialBar","Newfrineds")
      Session.set("Social.LevelOne.Menu",'contactsList')
      Session.set("SocialOnButton",'contactsList')
      $('.div_contactsList').css('display',"block")
      $('.div_discover').css('display',"none")
      $('.div_me').css('display',"none")
      document.body.scrollTop = $(".showPostsBox").height()
    'click .discoverBtn':->
      $('.showPostsBox,.showPostsLine,.superChatIntroduce').show()
      trackEvent("socialBar","Discover")
      Session.set("SocialOnButton",'discover')
      Session.set('momentsitemsLimit', 10);
      Session.set("Social.LevelOne.Menu",'discover')
      $('.div_contactsList').css('display',"none")
      $('.div_discover').css('display',"block")
      $('.div_me').css('display',"none")
      document.body.scrollTop = $(".showPostsBox").height()
    'click .meBtn':->
      if Session.equals('isInformationEditing',true)
        $('.showPostsBox,.showPostsLine,.superChatIntroduce').hide()
      else
        $('.showPostsBox,.showPostsLine,.superChatIntroduce').show()
      trackEvent("socialBar","Me")
      Session.set("SocialOnButton",'me')
      Session.set("Social.LevelOne.Menu",'me')
      #Session.set('favouritepostsLimit', 0);
      $('.div_contactsList').css('display',"none")
      $('.div_discover').css('display',"none")
      $('.div_me').css('display',"block")
      document.body.scrollTop = $(".showPostsBox").height()
      triggerScroll=()->
        $(window).trigger('scroll')
      setTimeout(triggerScroll, 500)
  Template.socialContent.created=->
    this.reactivevars = {}
    this.reactivevars.chatcount = new ReactiveVar(0)      
  Template.socialContent.rendered=->
    inst = this    
    $('.chatBoxContent').css('min-height',$(window).height()-90)
    msg_rest_url = 'http://' + chat_server_url + '/api/gushitie/msgcount/' + Meteor.userId()
    #msg_rest_url = 'http://172.16.10.34:4000/api/gushitie/msgcount/' + Meteor.userId()
    # $.getJSON(msg_rest_url, (data) ->
    #   if data? and data.count?
    #     inst.reactivevars.chatcount.set(data.count)
    # )        
  Template.socialContent.helpers
    newcount:()->
      PostFriends.find({meetOnPostId:Session.get("postContent")._id,count:1,ta:{$ne:null}},{sort: {createdAt: -1}}).count()
    feedscount:()->
      Feeds.find({followby:Meteor.userId(),checked:false,eventType: {$nin: ['share','personalletter']}, createdAt:{$gt:new Date((new Date()).getTime() - 7 * 24 * 3600 * 1000)}},{sort: {createdAt: -1}, limit:20}).count()
    haveFeeds:->
      if Feeds.find({followby:Meteor.userId(),checked:false,eventType: {$nin: ['share','personalletter']}, createdAt:{$gt:new Date((new Date()).getTime() - 7 * 24 * 3600 * 1000)}},{sort: {createdAt: -1}, limit:20}).count()>0
        true
      else
        false
    haveNewFriends: ->
      if PostFriends.find({meetOnPostId:Session.get("postContent")._id,count:1,ta:{$ne:null}},{sort:{createdAt:-1}}).count()>0
        true
      else
        false
    whichOne : ->
      Session.get('Social.LevelOne.Menu')
    isFocus : (view) ->
      #if Session.equals("Social.LevelOne.Menu",view)
      if Session.equals("SocialOnButton",view)
        "focusColor"
      else
        ""
    isWaitRead: ()->
      MsgSession.find({userId: Meteor.userId(), waitRead: {$gt: 0}}).count() > 0
    dynamicMe: ()->
      if Session.equals("SocialOnButton",'me')
        return 'me'
      else
        return 'emptyMe'
    chatcount: ()->
      count = Template.instance().reactivevars.chatcount.get()
      if count > 99 then '99+' else count
    haschats: ()->
      return (if Template.instance().reactivevars.chatcount.get() > 0 then true else false) 