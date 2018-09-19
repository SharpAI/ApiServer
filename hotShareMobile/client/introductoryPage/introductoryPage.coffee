if Meteor.isClient
  # Template.introductoryPage.rendered=->
  #   $('.content').css 'min-height',$(window).height()
  joinTestGroup2 = (groupid, type)->
    Meteor.call 'add-group-urser', groupid, [ Meteor.userId() ], (err, result)->
      if err
        console.log err
        return PUB.toast('添加失败，请重试~')
      gotoPage = '/'
      if result is 'succ'
        PUB.toast '添加成功'
        SimpleChat.onShowTipsMessages(true,type)
        Meteor.call 'get-group-intro', groupid, type, (err,result)->
          if err
            console.log err
          if result and result.text
            SimpleChat.Messages.insert(result)
      if result == 'not find group'
        PUB.toast '添加失败，请重试~'
      # show TestGroup Tip
      Session.set('homePagesForm', 'joinTestGroup')
      Meteor.setTimeout ()->
        $('body').append('<div class="joinTestGroupTips" onclick="$(this).remove();"></div>')
      ,300
      return Router.go(gotoPage)

  joinTestGroup = (groupid,type)->
    return joinTestGroup2(groupid, type)
    #groupid = 'd2bc4601dfc593888618e98f'
    Meteor.call 'add-group-urser', groupid, [ Meteor.userId() ], (err, result) ->
      if err
        console.log err
        return PUB.toast('添加失败，请重试~')
      gotoPage = '/';
      if result == 'succ'
        PUB.toast '添加成功'
        gotoPage = '/simple-chat/to/group?id=' + groupid
        #window.localStorage.setItem("simple_chat_need_show_tips",'true')
        SimpleChat.onShowTipsMessages(true,type)
        PUB.page '/'
        Meteor.setTimeout ()->
          PUB.page gotoPage
        ,300
        Meteor.call 'get-group-intro', groupid, type, (err,result)->
          if err
            console.log err
          if result and result.text
            SimpleChat.Messages.insert(result);
        relations = WorkAIUserRelations.findOne({'app_user_id':Meteor.userId()});
        unless relations
          Meteor.setTimeout(()->
            Router.go('/timeline');
          ,500);
      if result == 'not find group'
        PUB.toast '添加失败，请重试~'
        return Router.go(gotoPage)
      return
  Template.introductoryPage.helpers
    enable_home_ai:()->
      if window.localStorage.getItem("enableHomeAI") == 'true'
        return true
      return false
  Template.introductoryPage.events
    'click .leftButton':(event)->
      Router.go('/scene');
    'click #joinGroup':(event)->
      Router.go('/introductoryPage1');
    'click #createGroup':(event)->
      window.localStorage.setItem("isSecondUse",'true');
      #Router.go('/group/add');
      Session.set('fromCreateNewGroups',true);
      Session.set('notice-from','createNewChatGroups');
      Router.go('/setGroupname');
      #PUB.page '/notice'
    'click #joinTestGroup':(event)->
      # Session.set('needShowBubble','false');
      # window.localStorage.setItem("isSecondUse",'true');
      # joinTestGroup()
      Session.set('needShowBubble','false');
      window.localStorage.setItem("isSecondUse",'true');
      #讯动训练营
      #groupid = 'd2bc4601dfc593888618e98f' 
      #type = 'FACE'
      #joinTestGroup(groupid,type)
      PUB.page '/'
      #PUB.page('/introductoryPage2')
     'click #skipStep':(event)->
      Session.set('needShowBubble','false');
      window.localStorage.setItem("isSecondUse",'true');
      PUB.page '/'
      Meteor.setTimeout ()->
        PUB.page '/posts/uRyvJDmL88gd4BbBF'
      ,300
  
  # Template.introductoryPage1.rendered=->
  #   $('.content').css 'min-height',$(window).height()

  Template.introductoryPage1.events
    'click .leftButton':(event)->
      Router.go('/introductoryPage')
    'click #scanBarcode':(event)->
      ScanBarcodeByBarcodeScanner();
      window.localStorage.setItem("isSecondUse",'true');
    'click #loadBarCodeFromAlbum':(event)->
      #PUB.page('/newFriendsList')
      window.localStorage.setItem("isSecondUse",'true');
      DecodeImageFromAlum();
    'click #joinTestGroup':(event)->
      # Session.set('needShowBubble','false');
      # window.localStorage.setItem("isSecondUse",'true');
      # joinTestGroup()
      #PUB.page('/introductoryPage2')
      Session.set('needShowBubble','false');
      window.localStorage.setItem("isSecondUse",'true');
      #讯动训练营
      groupid = 'd2bc4601dfc593888618e98f' 
      type = 'FACE'
      joinTestGroup(groupid,type)
    'click #skipStep':(event)->
      Session.set('needShowBubble','false');
      window.localStorage.setItem("isSecondUse",'true');
      PUB.page '/'
      Meteor.setTimeout ()->
        PUB.page '/posts/uRyvJDmL88gd4BbBF'
      ,300
  
  Template.introductoryPage2.events
    'click .leftButton':(event)->
      PUB.back();
    
    'click #joinFaceGroup':(event)->
      Session.set('needShowBubble','false');
      window.localStorage.setItem("isSecondUse",'true');
      #讯动训练营
      groupid = 'd2bc4601dfc593888618e98f' 
      type = 'FACE'
      joinTestGroup(groupid,type)
    'click #joinNLPGroup':(event)->
      Session.set('needShowBubble','false');
      window.localStorage.setItem("isSecondUse",'true');
      #nlp训练营
      groupid = '92bf785ddbe299bac9d1ca82'
      type = 'NLP'
      joinTestGroup(groupid,type)
    # 'click #skipStep':(event)->
    #   Session.set('needShowBubble','false');
    #   window.localStorage.setItem("isSecondUse",'true');
    #   PUB.page '/'
    #   Meteor.setTimeout ()->
    #     PUB.page '/posts/uRyvJDmL88gd4BbBF'
    #   ,300