if Meteor.isClient
  Template.search.helpers
    theme:()->
      Topics.find({type:"theme"}, {sort: {createdAt: -1}})
    topic:()->
      Topics.find({type:"topic"}, {sort: {createdAt: -1}})
  Template.search.events
    'focus #search-box': (event)->
       Router.go '/searchPeopleAndTopic'
    'click #follow': (event)->
       Router.go '/searchFollow'
    'click .themeBtn': (event)->
       Session.set "topicId", @_id
       Session.set "topicTitle", @text
       Router.go '/topicPosts'
    'click .topic': (event)->
       Session.set "topicId", @_id
       Session.set "topicTitle", "#"+ @text
       Router.go '/topicPosts'
  Template.searchFollow.rendered=->
    Session.set('isSearching', false)
    $('#search-box').bind('propertychange input',(e)->
       text = $(e.target).val().trim()
       if text.length > 0
         Session.set 'isSearching', true
       else
         Session.set 'isSearching', false
       FollowUsersSearch.search text
    )
  Template.searchFollow.events
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
      Follows.find()
    isFollowed:(follow)->
      fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow.userId}).count()
      if fcount > 0
        true
      else
        false
    isFollowedUser:(follow)->
      fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow._id}).count()
      if fcount > 0
        true
      else
        false
    notSelf:(follow)->
      fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow.userId}).count()
      if follow._id is Meteor.userId()
        false
      else
        true
  Template.searchPeopleAndTopic.rendered=->
    Session.setDefault('is_people', true)
    $('#search-box').bind('propertychange input',(e)->
       text = $(e.target).val().trim()
       if text.length > 0
          FollowUsersSearch.search text
    )
    $('#search-box').trigger('focus')
  Template.searchPeopleAndTopic.helpers
    is_people:->
       Session.get('is_people')
    isFollowedUser:(follow)->
      fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow._id}).count()
      if fcount > 0
        true
      else
        false
    notSelf:(follow)->
      fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow.userId}).count()
      if follow._id is Meteor.userId()
        false
      else
        true
  Template.searchPeopleAndTopic.events
    'click #search_people': (event)->
        Session.set('is_people', true)
    'click #search_topic': (event)->
        Session.set('is_people', false)
    'click .back': (event)->
       history.back()
