if Meteor.isClient
  Template.addTopicComment.events
    "click #save":(event)->
       topicPostId = Session.get("TopicPostId")
       TopicTitle = Session.get("TopicTitle")
       TopicAddonTitle = Session.get("TopicAddonTitle")
       TopicMainImage = Session.get("TopicMainImage")
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
             TopicPosts.insert {
               postId:topicPostId,
               title:TopicTitle,
               addontitle:TopicAddonTitle,
               mainImage:TopicMainImage,
               heart:0,
               retweet:0,
               comment:1,
               owner:Meteor.user()._id,
               ownerName:Meteor.user().username,
               ownerIcon:Meteor.user().profile.icon,
               createdAt: new Date(),
               topicId: topicId
             }
       Router.go('/posts/'+topicPostId)
       false
