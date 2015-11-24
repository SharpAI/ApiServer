if Meteor.isClient
  Template.search.rendered=->
    Meteor.subscribe("topicposts")
    Meteor.subscribe("topics")
  Template.search.helpers
    theme:()->
      themes = Topics.find({type:"theme"}, {sort: {posts: -1}})
      if themes.count() > 0
        Meteor.defer ()->
          Session.setPersistent('persistentThemes',themes.fetch())
        return themes
      else
        Session.get('persistentThemes')
    topic:()->
      topics = Topics.find({type:"topic"}, {sort: {posts: -1},limit:20})
      if topics.count() > 0
        Meteor.defer ()->
          Session.setPersistent('persistentTopics',topics.fetch())
        return topics
      else
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
  Template.searchFollow.rendered=->
    Session.set('isSearching', false)
    Meteor.subscribe 'follows'
    $('#search-box').bind('propertychange input',(e)->
       text = $(e.target).val().trim()
       if text.length > 0
         Session.set 'isSearching', true
       else
         Session.set 'isSearching', false
       FollowUsersSearch.search text
    )
  Template.searchFollow.events
    'focus #search-box':->
      console.log("#search get focus");
      $('#footer').css('display',"none")
    'blur #search-box':->
      console.log("#search lost focus");
      $('#footer').css('display',"")
    'click .back': (event)->
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
      Follower.insert {
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
      Follower.insert {
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
  Template.searchFollow.helpers
    isSearching:->
      if Session.get('isSearching') is false
         false
      else
         true
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
    Meteor.subscribe("topicposts")
    Meteor.subscribe("topics")
  Template.searchPeopleAndTopic.rendered=->
    Session.setDefault('is_people', true)
    $('#search-box').bind('propertychange input',(e)->
       text = $(e.target).val().trim()
       if Session.get('is_people')
          FollowUsersSearch.search text
       else
          TopicsSearch.search text
    )
    $('#search-box').trigger('focus')
  Template.searchPeopleAndTopic.helpers
    is_people:->
       Session.get('is_people')
    placeHolder:->
       if Session.get('is_people')
          "搜索人"
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
    'click #search_topic': (event)->
        Session.set('is_people', false)
    'click .back': (event)->
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
      Follower.insert {
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
