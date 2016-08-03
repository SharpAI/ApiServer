if Meteor.isClient
  Template.addTopicComment.rendered=->
    Meteor.subscribe "topics"
    Meteor.subscribe "ViewPostsList", Session.get("TopicPostId")
    Session.set("comment","")
  Template.addTopicComment.helpers
    comment:()->
      Session.get("comment")
    topics:()->
       Topics.find({type:"topic"}, {sort: {posts: -1}, limit:20})
    groups: ()->
      # ReaderPopularPosts.find({userId: Meteor.userId()})
      posts = []
      ReaderPopularPosts.find({}).forEach (item)->
        item.mainImage = Posts.findOne({_id: item.postId}).mainImage
        posts.push(item)
      return posts
    isShowPublish: ()->
      return ReaderPopularPosts.find({userId: Meteor.userId()}).count()
      # return true
    has_share_push: ()->
      return Meteor.user().profile and Meteor.user().profile.web_follower_count and Meteor.user().profile.web_follower_count > 0

  Template.addTopicComment.events
    "click #share-follower": ()->
      if $('#share-follower').prop('checked')
        $(".publish-readers-list1").css('color','#00c4ff')
      else
        $('.publish-readers-list1').css('color','')
    "click .pin": (e)->
      e.preventDefault()
      if $('#'+e.currentTarget.id).hasClass('select')
        $('#'+e.currentTarget.id+' .selectHelper img').attr('src','/select_n.png')
      else 
        $('#'+e.currentTarget.id+' .selectHelper img').attr('src','/select_p.png')
      $(e.currentTarget).toggleClass('select')
    "change .publish-reader-group input[type='checkbox']": (e, t)->
      $(e.target.parentNode).toggleClass('selected')
    "change #comment":()->
       Session.set("comment",$('#comment').val())
    "click #topic":(event)->
       comment = Session.get("comment")+"#"+this.text+"#"
       Session.set("comment",comment)
    "click #save":(event)->
       if($('#share-follower').prop('checked'))
         Meteor.call('sendEmailByWebFollower', Session.get('TopicPostId'), 'push')
         
       topicPostId = Session.get("TopicPostId")
       TopicTitle = Session.get("TopicTitle")
       TopicAddonTitle = Session.get("TopicAddonTitle")
       TopicMainImage = Session.get("TopicMainImage")
       comment = Session.get("comment")
       user = Meteor.user()

       unless Session.equals('post-publish-user-id', '')
         user = Meteor.users.findOne({_id: Session.get('post-publish-user-id')})

       if comment != ''
         if user
           if user.profile.fullname
             username = user.profile.fullname
           else
             username = user.username
           userId = user._id
           userIcon = user.profile.icon
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
             if user
               if user.profile.fullname
                 username = user.profile.fullname
               else
                 username = user.username
               userId = user._id
               userIcon = user.profile.icon
             else
               username = '匿名'
               userId = 0
               userIcon = ''
             unless TopicPosts.findOne({postId:topicPostId,topicId: topicId})
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
       #added for reader group
       postItem = Posts.findOne({_id: topicPostId})
       feedItem = {
          owner: Meteor.userId(),
          ownerName: postItem.ownerName,
          ownerIcon: postItem.ownerIcon,
          eventType:'SelfPosted',
          postId: postItem._id,
          postTitle: postItem.title,
          mainImage: postItem.mainImage,
          createdAt: postItem.createdAt,
          heart: 0,
          retweet: 0,
          comment: 0
       }

       groups = []
      #  $(".publish-reader-group").find("input:checked").each(()->
       $(".waterfall").find(".select").each(()->
          groups.push $(this).attr("id")
       )

       console.log(groups)
       if groups.length isnt 0
         Meteor.call('pushPostToReaderGroups', feedItem, groups)

       Session.set("mynewpostId",topicPostId)
       Router.go('/posts/'+topicPostId)
       false
  
  Template.publishReadersList.rendered=->
     Meteor.subscribe "readerpopularposts",(ready)->
      handler = $('.newLayout_container')
      options={
        align: 'left',
        autoResize: true,
        comparator: null,
        container: $('.publish-readers-list'),
        direction: undefined,
        ignoreInactiveItems: true,
        itemWidth: '50%',
        fillEmptySpace: false,
        flexibleWidth: '50%',
        offset: 10,
        onLayoutChanged: undefined,
        outerOffset: 0,
        possibleFilters: [],
        resizeDelay: 50,
        verticalOffset: 10
      }
      Session.set('publish-readers-list-loading',true)
      # handler.wookmark(options) 
      $('.newLayout_element').imagesLoaded ()->
        Session.set('publish-readers-list-loading',false)
        handler.wookmark(options) 

  # Template.publishReadersList.helpers
    # groups: ()->
    #   # ReaderPopularPosts.find({userId: Meteor.userId()})
    #   # TopicPosts.find({},{limit: 6})
    #   # posts = []
    #   # ReaderPopularPosts.find({}).forEach (item)->
    #   #   item.mainImage = Posts.findOne({_id: item.postId}).mainImage
    #   #   posts.push(item)
    #   # return posts
    #   ReaderPopularPosts.find({})
    # isLoading: ()->
    #   return Session.get('publish-readers-list-loading')

  Template.publishReadersList.events
    'click .newLayout_element': (e)->
      e.preventDefault()
      # alert(e.currentTarget.id)
      $(e.currentTarget).toggleClass('select')