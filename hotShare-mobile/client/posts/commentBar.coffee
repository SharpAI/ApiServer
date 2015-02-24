if Meteor.isClient
  Session.setDefault 'RC', 0
  Template.commentBar.rendered=->
    $('.commentBar').css('height',$(window).height())
  Template.commentBar.helpers
    refcomment:->
      RC = Session.get 'RC'
      #console.log "RC: " + RC
      RefC = Session.get("refComment")
      if RefC
        return RefC[RC].text
    time_diff: (created)->
      GetTime0(new Date() - created)
    comment: ()->
      Comment.find({postId:Session.get("postContent")._id}, {sort: {createdAt: -1}})
  Template.commentBar.events
    "click .change":->
      RC = Session.get("RC")+1
      if RC>7
         RC=0
      Session.set("RC", RC)
    'click #finish':->
#      $('#showComment').css('display',"none")
      $('.commentBar').fadeOut 300
      $('.showPosts').css('height',"auto")
      PUB.pagepop()
      Meteor.setTimeout(
        ()->
            document.body.scrollTop = Session.get("document_body_scrollTop")
        0
      )
    "click .submit":->
      $("#new-reply").submit()
    "submit .new-reply": (event)->
      ###
      if Meteor.user() is null
        window.plugins.toast.showLongBottom '请登陆后操作!'
        return
      ###
      # This function is called when the new task form is submitted
      content = event.target.comment.value
      console.log content
      if content is ""
        #window.plugins.toast.showLongBottom "内容不能为空"
        return false

      FollowPostsId = Session.get("FollowPostsId")
      postId = Session.get("postContent")._id
      if Meteor.user()
        username = Meteor.user().username
        userId = Meteor.user()._id
        userIcon = Meteor.user().profile.icon
      else
        username = '匿名'
        userId = 0
        userIcon = ''
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
      catch error
        console.log error
      event.target.comment.value = ""
      $("#comment").attr("placeholder", "说点什么")
      false
