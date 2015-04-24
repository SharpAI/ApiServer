if Meteor.isClient
  Template.addTopicComment.events
    "click #save":(event)->
       topicPostId = Session.get("TopicPostId")
       TopicTitle = Session.get("TopicTitle")
       TopicAddonTitle = Session.get("TopicAddonTitle")
       TopicMainImage = Session.get("TopicMainImage")
       comment = $('#comment').val()
       if comment != ''
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
             postId:topicPostId
             content:comment
             username:username
             userId:userId
             userIcon:userIcon
             createdAt: new Date()
           }
           #下面这行语句有问题，先注释掉，以后修改
           #FollowPosts.update {_id: FollowPostId},{$inc: {comment: 1}}
         catch error
           console.log error
         ss = comment
         r=ss.replace /\#([^\#|.]+)\#/g,(word)->
           topic = word.replace '#', ''
           topic = topic.replace '#', ''
           #console.log word
           if topic.length > 0 && topic.charAt(0)!=' '
             haveSpace = topic.indexOf ' ', 0
             if haveSpace > 0
                topic = topic[...haveSpace]
             #console.log topic
             if Topics.find({text:topic}).count() > 0
                topicData = Topics.find({text:topic}).fetch()[0]
                topicId = topicData._id
                #console.log topicData._id
             else
                topicId = Topics.insert {
                  type:"topic",
                  text:topic,
                  imgUrl: ""
                }
             #console.log "topicId:" + topicId
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
             TopicPosts.insert {
               postId:topicPostId,
               title:TopicTitle,
               addontitle:TopicAddonTitle,
               mainImage:TopicMainImage,
               heart:0,
               retweet:0,
               comment:1,
               owner:userId,
               ownerName:username,
               ownerIcon:userIcon,
               createdAt: new Date(),
               topicId: topicId
             }
       Router.go('/posts/'+topicPostId)
       false
