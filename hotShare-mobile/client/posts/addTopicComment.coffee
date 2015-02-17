if Meteor.isClient
  Template.addTopicComment.events
    "click #save":(event)->
       topicPostId = Session.get("TopicPostId")
       comment = $('#comment').val()
       if comment != ''
         try
           Comment.insert {
             postId:topicPostId
             content:comment
             username:Meteor.user().username
             userId:Meteor.user()._id
             userIcon:Meteor.user().profile.icon
             createdAt: new Date()
           }
           #下面这行语句有问题，先注释掉，以后修改
           #FollowPosts.update {_id: FollowPostId},{$inc: {comment: 1}}
         catch error
           console.log error
         ss = comment
         r=ss.replace /\#([^\#|.]+)/g,(word)->
           topic = word.replace '#', ''
           console.log word
           if topic.length > 0 && topic.charAt(0)!=' '
             haveSpace = topic.indexOf ' ', 0
             if haveSpace > 0
                topic = topic[...haveSpace]
             console.log topic
       Router.go('/posts/'+topicPostId)
       false
