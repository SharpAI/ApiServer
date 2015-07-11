if Meteor.isClient
  Template.reportPost.helpers
    postOwner:->
      Session.get("postContent").ownerName
    postTitle:->
      Session.get("postContent").title
  Template.reportPost.events
    'click .back': (event)->
       history.back()
    "click #save":(event)->
       reportPostId = Session.get("postContent")._id
       reportPostOwner = Session.get("postContent").ownerName
       reportTitle = Session.get("postContent").title
       reportReason = $('#reason').val()
       if reportReason is ""
         PUB.toast('请添加举报理由！')
         return false
       if reportReason != ''
         try
           Reports.insert {
             postId:reportPostId
             reason:reportReason
             username:Meteor.user().username
             userId:Meteor.user()._id
             userIcon:Meteor.user().profile.icon
             createdAt: new Date()
           }
         catch error
           console.log error
       Router.go('/thanksReport')
       false
