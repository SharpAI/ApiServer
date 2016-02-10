if Meteor.isClient
  hasMoreFavouritePosts = ()->
    #if FavouritePosts.find({userId: Meteor.userId()}).count() > 0
    #  !(FavouritePosts.find({userId: Meteor.userId()}).count() < Session.get("favouritepostsLimit"))
    #else
    #  false
    !(FavouritePosts.find({userId: Meteor.userId()}).count() < Session.get("favouritepostsLimit"))

  Session.setDefault("Social.LevelTwo.Me.Menu",'information')
  ###
    me views
  ###
  Template.me.rendered=->
    #$('.me').css('min-height',$(window).height()-90)
  Template.me.helpers
    whichOne:()->
      Session.get("Social.LevelTwo.Me.Menu")
  ###
    Information View
  ###
  ###
  Template.information.rendered=->
    document.body.scrollTop = document.body.scrollHeight
    document.ontouchmove = (e) ->
      e.preventDefault()
      return
  Template.information.destroyed=->
    document.ontouchmove = (e) ->
      true
  ###
  Template.information.helpers
    nickname:()->
      if Meteor.user()
        if Cookies.check("display-lang")
          if Cookies.get("display-lang") is 'en'
            Meteor.user().profile.fullname || '[N/A]'
          else
            Meteor.user().profile.fullname || '[无]'
        else
          Meteor.user().profile.fullname || '[无]'
    sex:()->
      if Meteor.user() and Meteor.user().profile.sex
        if Cookies.check("display-lang")
          if Cookies.get("display-lang") is 'en'
            if Meteor.user().profile.sex is 'male'
              return 'Male'
            else if Meteor.user().profile.sex is 'female'
              return 'Female'
          else
            if Meteor.user().profile.sex is 'male'
              return '男'
            else if Meteor.user().profile.sex is 'female'
              return '女'
        else #zh
          if Meteor.user().profile.sex is 'male'
              return '男'
          else if Meteor.user().profile.sex is 'female'
              return '女'
    favposts: ()->
      return []
  Template.information.events
    'click .nickname':(e)->
      Session.set("Social.LevelTwo.Me.Menu","setNickname")
    'click .sex':(e)->
      Session.set("Social.LevelTwo.Me.Menu","setSex")
  ###
    Set Nickname View
  ###
  Template.setNickname.helpers
    nickname:()->
      if Meteor.user()
        Meteor.user().profile.fullname
  Template.setNickname.rendered=->
    document.body.scrollTop = document.body.scrollHeight
    document.ontouchmove = (e) ->
      e.preventDefault()
      return
    $('.text').focus()
  Template.setNickname.destroyed=->
    document.ontouchmove = (e) ->
      true
  Template.setNickname.events
    'focus .text':->
      console.log("#comment get focus");
      $('.contactsList .head').css('display' ,'block')
      if Meteor.isCordova and device.platform is 'iOS'
        $('.me .setNickname .head').css('position', 'static')
        Meteor.setTimeout(()->
          distance = $('.me .setNickname .head').offset().top - ($(window).scrollTop())
          distance = '-' + distance + 'px'
          $('.me .setNickname .head').css 'margin-top', distance
          return
        ,5)
        cordova.plugins.Keyboard.disableScroll(true)
    'blur .text':->
      console.log("#comment lost focus");
      $('.contactsList .head').css('display' ,'block')
      if Meteor.isCordova and device.platform is 'iOS'
        $('.me .setNickname .head').css('position', 'fixed').css('margin-top', 0)
        cordova.plugins.Keyboard.disableScroll(false)
    'click .left-btn':(e)->
      Session.set("Social.LevelTwo.Me.Menu","information")
    'click .right-btn':(e)->
      $('.setNickname-form').submit()
    'submit .setNickname-form': (e)->
      if Meteor.user()
        if e.target.text.value isnt ''
          console.log 'Change Nick Name to ' + $('#my_edit_nickname').val()
          Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.fullname': e.target.text.value}})
          Session.set("Social.LevelTwo.Me.Menu","information")
          
      false
  ###
    Set Sex View
  ###
  Template.setSex.rendered=->
    document.body.scrollTop = document.body.scrollHeight
    document.ontouchmove = (e) ->
      e.preventDefault()
      return
  Template.setSex.destroyed=->
    document.ontouchmove = (e) ->
      true
  Template.setSex.helpers
    isMale:()->
      if Meteor.user()
        return Meteor.user().profile.sex is 'male'
      return false
    isFemale:()->
      if Meteor.user()
        return Meteor.user().profile.sex is 'female'
      return false
  Template.setSex.events
    'click .setMale':(e)->
      if Meteor.user()
        Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.sex': 'male'}})
        Session.set("Social.LevelTwo.Me.Menu","information")
    'click .setFemale':(e)->
      if Meteor.user()
        Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.sex': 'female'}})
        Session.set("Social.LevelTwo.Me.Menu","information")
    'click .left-btn': (e)->
      Session.set("Social.LevelTwo.Me.Menu","information")

  Template.myFavouritePosts.rendered=->
    $(window).scroll (event)->
      if Session.get("Social.LevelOne.Menu") is 'me'
        FAVOURITE_POSTS_INCREMENT = 10
        if window.innerHeight
          winHeight = window.innerHeight
        else
          winHeight = $(window).height() # iphone fix
        closeToBottom = ($(window).scrollTop() + winHeight > $(document).height() - 100);
        console.log('Close to bottom: '+closeToBottom)
        if (closeToBottom and hasMoreFavouritePosts())
          if window.favouritepostsCollection_getmore is 'done' and (window.newLayoutImageInDownloading < 5)
            console.log('Triggered data source refresh');
            window.favouritepostsCollection_getmore = 'inprogress'
            Session.set("favouritepostsLimit",Session.get("favouritepostsLimit") + FAVOURITE_POSTS_INCREMENT);      

  Template.myFavouritePosts.helpers
    isLoading:()->
      (Session.equals('newLayoutImageDownloading',true) or
        !Session.equals('favouritepostsCollection_getmore','done'))
    onPostId:()->
      Session.get("postContent")._id
    withSuggestAlreadyRead:()->
      withSuggestAlreadyRead      
    favposts: ()->
      postIds = []
      FavouritePosts.find({userId: Meteor.userId()}).forEach((item) ->
          if !~postIds.indexOf(item.postId)
            postIds.push(item.postId)
      )
      Posts.find({_id: {$in: postIds}})
      #SuggestPosts.find({},{sort: {createdAt: -1},limit:10})
  Template.myFavouritePosts.events
    'click .removefavp': (e, t) ->
      e.preventDefault()
      e.stopPropagation()
      postId = $(e.currentTarget).data('id')
      userId = Meteor.userId()
      favp = FavouritePosts.findOne({postId: postId, userId: userId})
      if favp isnt undefined and favp isnt null
        FavouritePosts.remove({_id: favp._id})
      return