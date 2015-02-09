if Meteor.isClient
  Template.commentBar.rendered=->
    $('.commentBar').css('height',$(window).height())
  Template.commentBar.helpers
    time_diff: (created)->
      GetTime0(new Date() - created)
    comment: ()->
      Comment.find({postId:Session.get("postContent")._id}, {sort: {createdAt: -1}})
  Template.commentBar.events
    'click #finish':->
      $('#showComment').css('display',"none")
      $('.showPosts').css('height',"auto")
    "click .submit":->
      $("#new-reply").submit()
    "submit .new-reply": (event)->
      if Meteor.user() is null
        window.plugins.toast.showLongBottom '请登陆后操作!'
        return

      # This function is called when the new task form is submitted
      content = event.target.comment.value
      console.log content
      if content is ""
        window.plugins.toast.showLongBottom "内容不能为空"
        return false

      FollowPostsId = Session.get("FollowPostsId")
      console.log('User information is ' + Meteor.user().username)
      postId = Session.get("postContent")._id
      username = Meteor.user().username
      userId = Meteor.user()._id
      userIcon = Meteor.user().profile.icon

      try
        Comment.insert {
          postId:postId
          content:content
          username:username
          userId:userId
          userIcon:userIcon
          createdAt: new Date()
        }
        FollowPosts.update {_id: FollowPostsId},{$inc: {comment: 1}}
        console.log
      catch error
        console.log error
      event.target.comment.value = ""
      $("#comment").attr("placeholder", "说点什么")
      false