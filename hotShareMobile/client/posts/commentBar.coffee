if Meteor.isClient
  Session.setDefault 'RC', 0
  Template.commentBar.rendered=->
#    $('.commentBar').css('height',$(window).height())
    $('#comment').on('keyup input',(e)->
      e.preventDefault()
      $(this).css('height', 'auto').css('height', this.scrollHeight)
#      height = this.scrollHeight + 10;
#      if $('#new-reply').css("height") != height
#        $('#new-reply').css("height", height)
#        console.log('comment propertychange sizey:'+ 'scrollHeight:'+this.scrollHeight)
    )

    $('.box')
    .pullToRefresh()
    .on("start.pulltorefresh", ($e,y)->
        window.pullstart = true
    )
    .on("move.pulltorefresh", (percent)->
        if ($('.commentBar').scrollTop() is 0) && window.pullstart
          Meteor.setTimeout ()->
              $('#finish').click()
            ,300
        window.pullstart = false
    )
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
      Comment.find({postId:Session.get("postContent")._id}, {sort: {createdAt: 1}})
  Template.commentContent.rendered=->
    $('.chatBoxContent').css('min-height',$(window).height()-50)
  Template.commentContent.helpers
    refcomment:->
      RC = Session.get 'RC'
      #console.log "RC: " + RC
      RefC = Session.get("refComment")
      if RefC
        return RefC[RC].text
    time_diff: (created)->
      GetTime0(new Date() - created)
    comment: ()->
      Comment.find({postId:Session.get("postContent")._id}, {sort: {createdAt: 1}})
  
  Template.commentContent.events
    'click .chatBtn':->
      $('.viewerList').fadeOut 300
      $('.viewerListBtn').removeClass "focusColor"
      $('.chatContent').fadeIn 300
      $('.chatBtn').addClass "focusColor"
    'click .viewerListBtn':->
      $('.chatContent').fadeOut 300
      $('.chatBtn').removeClass "focusColor"
      $('.viewerList').fadeIn 300
      $('.viewerListBtn').addClass "focusColor"
      
  Template.commentBar.events
    'focus #comment':->
      console.log("#comment get focus");
      #$("#new-reply").css 'position','absolute'
      #$("#new-reply").hide()
      #$.silentScroll($('input:focus').offset().top - 100)
      
      console.log 'Window height is ' + window.innerHeight
      Meteor.setTimeout ()->
          $('.commentBar').animate({ scrollTop: $('.commentBar .content').height() }, "fast")
          $("html, body").animate({ scrollTop: $(document).height() }, "fast")
        ,300
    'blur #comment':->
      console.log("#comment lost focus");
      Meteor.setTimeout ()->
          $('.commentBar').animate({ scrollTop: $('.commentBar .content').height() }, "fast")
          #console.log 'Window height is ' + window.innerHeight
        ,300
      #$("#new-reply").css 'position','fixed'
    "click .change":->
      RC = Session.get("RC")+1
      if RC>7
         RC=0
      Session.set("RC", RC)
      setTimeout(()->
        $('#comment').trigger("keyup")
      ,300)
    'click #finish':->
      #$('.showPosts').removeClass('fade-up-out')
      $('#showComment').fadeOut 300
      $('#comment').fadeOut 300
      $('.showBgColor').show 300,->
          if window.showPostAt
            $(window).scrollTop(window.showPostAt)
      $('.showPosts .head').fadeIn 300
      $('.showPostsFooter').fadeIn 300
    "click #submit":->
      $("#new-reply").submit()
      $("#finish").click()
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
        if Meteor.user().profile.fullname
          username = Meteor.user().profile.fullname
        else
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
      $("#comment").css('height', 'auto')
#      scrollHeight = document.getElementById("comment").scrollHeight
#      height = scrollHeight + 10;
#      $('#new-reply').css("height", height)
      Meteor.setTimeout ()->
          $('.commentBar').animate({ scrollTop: $('.commentBar .content').height() }, "fast")
        ,0
      false
