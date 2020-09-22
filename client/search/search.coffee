if Meteor.isClient
  Template.search.onRendered ()->
    Meteor.subscribe("topics")
    Meteor.subscribe("topicposts")
    topics = Topics.find({type:"topic"}, {sort: {posts: -1},limit:20})
    themes = Topics.find({type:"theme"}, {sort: {posts: -1},limit:5})
    if topics.count() > 0
      Meteor.defer ()->
        Session.setPersistent('persistentTopics',topics.fetch())
    if themes.count() > 0
      Meteor.defer ()->
        Session.setPersistent('persistentThemes',themes.fetch())
  Template.search.helpers
    theme:()->
      Session.get('persistentThemes')
    topic:()->
      Session.get('persistentTopics')
  Template.search.events
    'focus #search-box': (event)->
       PUB.page '/searchPeopleAndTopic'
    'click #follow': (event)->
       PUB.page '/searchFollow'
    'click .themeBtn': (event)->
       Session.set "topicId", @_id
       Session.set "topicTitle", "#"+ @text + "#"
       PUB.page '/topicPosts'
    'click .topic': (event)->
       Session.set "topicId", @_id
       Session.set "topicTitle", "#"+ @text + "#"
       PUB.page '/topicPosts'
  Template.searchFollow.onRendered ()->
    Session.set('isSearching', false)
    Session.set('is_fullname', true)
    Meteor.subscribe 'follows'
    $('#search-box').bind('propertychange input',(e)->
       text = $(e.target).val().trim()
       if text.length > 0
         Session.set 'isSearching', true
         Session.set 'noSearchResult',false
         Session.set 'searchLoading', true
       else
         Session.set 'isSearching', false
         return
       options = {is_fullname:Session.get('is_fullname')}
       FollowUsersSearch.search text,options
    )
  Template.searchFollow.events
    'focus #search-box':->
      console.log("#search get focus");
      $('#footer').css('display',"none")
    'blur #search-box':->
      console.log("#search lost focus");
      $('#footer').css('display',"")
    'click #search_people_fullname':(event)->
      Session.set("is_fullname",true)
      text = $('#search-box').val().trim()
      if text is ""
         Session.set 'isSearching', false
         $('#search-box').trigger('focus')
         return
      Session.set 'isSearching', true
      Session.set 'noSearchResult',false
      Session.set 'searchLoading', true
      options = {is_fullname:Session.get('is_fullname')}
      FollowUsersSearch.search text,options
      $('#search-box').trigger('focus')

    'click #search_people_username':(event)->
      Session.set("is_fullname",false)
      text = $('#search-box').val().trim()
      if text is ""
         Session.set 'isSearching', false
         $('#search-box').trigger('focus')
         return
      Session.set 'isSearching', true
      Session.set 'noSearchResult',false
      Session.set 'searchLoading', true
      options = {is_fullname:Session.get('is_fullname')}
      FollowUsersSearch.search text,options
      $('#search-box').trigger('focus')

    'click .back': (event)->
       Session.set('is_fullname', true)
       history.back()
    'click .delFollow':(e)->
      FollowerId = Follower.findOne({
                     userId: Meteor.userId()
                     followerId: @_id
                 })._id
      Follower.remove(FollowerId)
    'click .addFollow':(e)->
      if Meteor.user().profile.fullname
         username = Meteor.user().profile.fullname
      else
         username = Meteor.user().username
      if @profile.fullname
         followername = @profile.fullname
      else
         followername = @username
      insertObj = {
        userId: Meteor.userId()
        #这里存放fullname
        userName: username
        userIcon: Meteor.user().profile.icon
        userDesc: Meteor.user().profile.desc
        followerId: @_id
        #这里存放fullname
        followerName: followername
        followerIcon: @profile.icon
        followerDesc: @desc
        createAt: new Date()
      }
      addFollower(insertObj)
    'click .del':(e)->
      followerId = e.currentTarget.id
      FollowerId = Follower.findOne({
                     userId: Meteor.userId()
                     followerId: followerId
                 })._id
      Follower.remove(FollowerId)
    'click .add':(e)->
      if Meteor.user().profile.fullname
         username = Meteor.user().profile.fullname
      else
         username = Meteor.user().username
      insertObj = {
        userId: Meteor.userId()
        #这里存放fullname
        userName: username
        userIcon: Meteor.user().profile.icon
        userDesc: Meteor.user().profile.desc
        followerId: @userId
        #这里存放fullname
        followerName: @fullname
        followerIcon: @icon
        followerDesc: @desc
        createAt: new Date()
      }
      addFollower(insertObj)
  Template.searchFollow.helpers
    isSearching:->
      if Session.get('isSearching') is false
         false
      else
         true
    is_fullname:->
      if Session.get('is_fullname')
        "昵称"
      else
        "用户名"
    noSearchResult:->
      return Session.get("noSearchResult")
    searchLoading:->
       return Session.get('searchLoading')

    follows: ->
      Follows.find({},{sort: {index: 1}})
    isFollowed:(follow)->
      Meteor.subscribe("friendFollower",Meteor.userId(),follow.userId)
      fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow.userId}).count()
      if fcount > 0
        true
      else
        false
    isFollowedUser:(follow)->
      Meteor.subscribe("friendFollower",Meteor.userId(),follow._id)
      fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow._id}).count()
      if fcount > 0
        true
      else
        false
    isSelf:(follow)->
      if follow.userId is Meteor.userId()
        true
      else
        false
    notSelf:(follow)->
      if follow._id is Meteor.userId()
        false
      else
        true
  Template.searchPeopleAndTopic.onCreated ()->
    Meteor.subscribe("topics")
    Meteor.subscribe('follows')
    Meteor.subscribe("topicposts")
  Template.searchPeopleAndTopic.onRendered ()->
    Session.setDefault('is_people', true)
    Session.setDefault('is_fullname', true)
    if(Session.get("searchContent") isnt undefined)
      $("#search-box").val(Session.get("searchContent"))
    if Session.get("noSearchResult") is true
      Session.set("searchLoading", false)
    if($("#search-box").val() is "")
      Session.set("showSearchStatus", false)
      Session.set("showSearchItems", false)
      Session.set("noSearchResult", false)
    $('#search-box').bind('propertychange input',(e)->
       text = $(e.target).val().trim()
       Session.set("showSearchStatus", true)
       Session.set("showSearchItems", true)
       Session.set("searchLoading", true)
       Session.set("noSearchResult", false)
       if text is ""
         Session.set("showSearchStatus", false)
         Session.set("showSearchItems", false)
         Session.set("searchLoading", false)
         Session.set("noSearchResult", false)
         return

       if Session.get('is_people')
          options = {is_fullname:Session.get('is_fullname')}
          FollowUsersSearch.search text,options
       else
          TopicsSearch.search text
    )
    $('#search-box').trigger('focus')
  Template.searchPeopleAndTopic.helpers
    is_people:->
       Session.get('is_people')
    is_fullname:->
       if Session.get('is_fullname')
         "昵称"
       else
         "用户名"
    showSearchStatus:->
       return Session.get('showSearchStatus')
    noSearchResult:->
       return Session.get('noSearchResult')
    searchLoading:->
       return Session.get('searchLoading')
    showSearchItems:->
       return Session.get('showSearchItems')
    placeHolder:->
       if Session.get('is_people')
          "搜索作者"
       else
          "搜索话题"
    isFollowedUser:(follow)->
      fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow._id}).count()
      if fcount > 0
        true
      else
        false
    notSelf:(follow)->
      if follow._id is Meteor.userId()
        false
      else
        true
  Template.searchPeopleAndTopic.events
    'focus #search-box':->
      console.log("#search get focus");
      $('#footer').css('display',"none")
    'blur #search-box':->
      console.log("#search lost focus");
      $('#footer').css('display',"")
    'click .topicTitle': (event)->
       Session.set "topicId", @_id
       Session.set "topicTitle", "#"+ @text + "#"
       Router.go '/topicPosts'
    'click #search_people': (event)->
      Session.set('is_people', true)
      text = $('#search-box').val().trim()
      if text is ""
         Session.set("showSearchStatus", false)
         Session.set("showSearchItems", false)
         Session.set("searchLoading", false)
         Session.set("noSearchResult", false)
         $('#search-box').trigger('focus')
         return
      Session.set("showSearchStatus", true)
      Session.set("showSearchItems", true)
      Session.set("searchLoading", true)
      Session.set("noSearchResult", false)
      options = {is_fullname:Session.get('is_fullname')}
      FollowUsersSearch.search text,options
      $('#search-box').trigger('focus')
      
    'click #search_topic': (event)->
      Session.set('is_people', false)
      text = $('#search-box').val().trim()
      if text is ""
         Session.set("showSearchStatus", false)
         Session.set("showSearchItems", false)
         Session.set("searchLoading", false)
         Session.set("noSearchResult", false)
         $('#search-box').trigger('focus')
         return
      Session.set("showSearchStatus", true)
      Session.set("showSearchItems", true)
      Session.set("searchLoading", true)
      Session.set("noSearchResult", false)
      TopicsSearch.search text
      $('#search-box').trigger('focus')
      
    'click #search_people_fullname':(event)->
      Session.set("is_fullname",true)
      text = $('#search-box').val().trim()
      if text is ""
         Session.set("showSearchStatus", false)
         Session.set("showSearchItems", false)
         Session.set("searchLoading", false)
         Session.set("noSearchResult", false)
         $('#search-box').trigger('focus')
         return
      Session.set("showSearchStatus", true)
      Session.set("showSearchItems", true)
      Session.set("searchLoading", true)
      Session.set("noSearchResult", false)
      options = {is_fullname:Session.get('is_fullname')}
      FollowUsersSearch.search text,options
      $('#search-box').trigger('focus')
    'click #search_people_username':(event)->
      Session.set("is_fullname",false)
      text = $('#search-box').val().trim()
      if text is ""
         Session.set("showSearchStatus", false)
         Session.set("showSearchItems", false)
         Session.set("searchLoading", false)
         Session.set("noSearchResult", false)
         $('#search-box').trigger('focus')
         return
      Session.set("showSearchStatus", true)
      Session.set("showSearchItems", true)
      Session.set("searchLoading", true)
      Session.set("noSearchResult", false)
      options = {is_fullname:Session.get('is_fullname')}
      FollowUsersSearch.search text,options
      $('#search-box').trigger('focus')
    'click .back': (event)->
       Session.set("searchContent","")
       Session.set('is_fullname', true)
       history.back()
    'click .delFollow':(e)->
      FollowerId = Follower.findOne({
                     userId: Meteor.userId()
                     followerId: @_id
                 })._id
      Follower.remove(FollowerId)
    'click .addFollow':(e)->
      if Meteor.user().profile.fullname
         username = Meteor.user().profile.fullname
      else
         username = Meteor.user().username
      if @profile.fullname
         followername = @profile.fullname
      else
         followername = @username
      insertObj = {
        userId: Meteor.userId()
        #这里存放fullname
        userName: username
        userIcon: Meteor.user().profile.icon
        userDesc: Meteor.user().profile.desc
        followerId: @_id
        #这里存放fullname
        followerName: followername
        followerIcon: @profile.icon
        followerDesc: @desc
        createAt: new Date()
      }
      addFollower(insertObj)
    'click .del':(e)->
      followerId = e.currentTarget.id
      FollowerId = Follower.findOne({
                     userId: Meteor.userId()
                     followerId: followerId
                 })._id
      Follower.remove(FollowerId)
    'click .add':(e)->
      if Meteor.user().profile.fullname
         username = Meteor.user().profile.fullname
      else
         username = Meteor.user().username
      insertObj = {
        userId: Meteor.userId()
        #这里存放fullname
        userName: username
        userIcon: Meteor.user().profile.icon
        userDesc: Meteor.user().profile.desc
        followerId: @userId
        #这里存放fullname
        followerName: @fullname
        followerIcon: @icon
        followerDesc: @desc
        createAt: new Date()
      }
      addFollower(insertObj)
