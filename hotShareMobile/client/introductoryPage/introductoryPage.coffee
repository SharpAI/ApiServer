if Meteor.isClient
  # Template.introductoryPage.rendered=->
  #   $('.content').css 'min-height',$(window).height()
  joinTestGroup = ()->
    groupid = 'd2bc4601dfc593888618e98f'
    Meteor.call 'add-group-urser', groupid, [ Meteor.userId() ], (err, result) ->
      if err
        console.log err
        return PUB.toast('添加失败，请重试~')
      gotoPage = '/';
      if result == 'succ'
        PUB.toast '添加成功'
        gotoPage = '/simple-chat/to/group?id=' + groupid
        window.localStorage.setItem("simple_chat_need_show_tips",'true')
        PUB.page '/'
        Meteor.setTimeout ()->
          PUB.page gotoPage
        ,300
      if result == 'not find group'
        PUB.toast '添加失败，请重试~'
        return Router.go(gotoPage)
      return

  Template.introductoryPage.events
    'click #joinGroup':(event)->
      Router.go('/introductoryPage1');
    'click #createGroup':(event)->
      window.localStorage.setItem("isSecondUse",'true');
      Router.go('/group/add');
    'click #joinTestGroup':(event)->
      Session.set('needShowBubble','false');
      window.localStorage.setItem("isSecondUse",'true');
      joinTestGroup()
    'click #skipStep':(event)->
      Session.set('needShowBubble','false');
      window.localStorage.setItem("isSecondUse",'true');
      joinTestGroup()
  
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
      Session.set('needShowBubble','false');
      window.localStorage.setItem("isSecondUse",'true');
      joinTestGroup()
    'click #skipStep':(event)->
      Session.set('needShowBubble','false');
      window.localStorage.setItem("isSecondUse",'true');
      PUB.page '/'
      Meteor.setTimeout ()->
        PUB.page '/posts/uRyvJDmL88gd4BbBF'
      ,300
