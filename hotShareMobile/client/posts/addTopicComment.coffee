if Meteor.isClient
  topicsCountIsBeyond=(comment)->
    #comment = Session.get("comment")
    regex = new RegExp('#', 'g')
    result = comment.match(regex)
    count = if !result then 0 else result.length
    count = parseInt(count / 2)
    #count = count / 2
    console.log '话题的数量为 ' + count
    if count>5
      window.plugins.toast.showWithOptions
        message: '话题数量不能超过5个'
        duration: 'short'
        position: 'center'
        addPixelsY: -60
      return true
    return false
  Template.addTopicComment.rendered=->
    Meteor.subscribe "topics"
    Meteor.subscribe "ViewPostsList", Session.get("TopicPostId")
    uid = Session.get('post-publish-user-id') || Meteor.userId()
    commentData = Comment.find({postId:Session.get("TopicPostId"),userId:uid}, {sort: {createdAt: 1}}).fetch()
    commentContent = ''
    if commentData and commentData.length > 0
      for index of commentData
        commentContent += commentData[index].content
    Session.set("comment",commentContent)
    Meteor.subscribe "readerpopularpostsbyuid" , uid
    Meteor.subscribe "usersById", uid
    $('#comment').bind 'propertychange input', (event) ->
      console.log '>>>>>>>>>>>>>>>>>' + event.target.value
      topicsCountIsBeyond event.target.value
  Template.addTopicComment.helpers
    is_server_import: ()->
      return location.search is '?server_import=true'
    template: ()->
      return 'serverImportSelectUser'
    data: ()->
      return {server_import: Session.get('addTopicComment_server_import')}
    comment:()->
      Session.get("comment")
    topics:()->
       Topics.find({type:"topic"}, {sort: {posts: -1}, limit:20})
    groups: ()->
      # ReaderPopularPosts.find({userId: Meteor.userId()})
      uid = Session.get('post-publish-user-id') || Meteor.userId()
      posts = []
      ReaderPopularPosts.find({userId: uid}).forEach (item)->
        post = Posts.findOne({_id: item.postId})
        if post
          item.mainImage = post.mainImage
          posts.push(item)
      return posts
    isShowPublish: ()->
      uid = Session.get('post-publish-user-id') || Meteor.userId()
      return ReaderPopularPosts.find({userId: uid}).count()
      # return true
    has_share_push: ()->
      return Meteor.user().profile and Meteor.user().profile.web_follower_count and Meteor.user().profile.web_follower_count > 0

  Template.addTopicComment.events
    "click #share-follower": ()->
        if $('#share-follower').prop('checked')
            $(".publish-readers-list1").css('color','#00c4ff')
            $('.pin').each () ->
                $(this).toggleClass('select')
                $('#'+$(this).attr("id")+' .selectHelper img').attr('src','/select_p.png')
        else
            $('.publish-readers-list1').css('color','')
            $('.pin').each () ->
                $(this).toggleClass('select')
                $('#'+$(this).attr("id")+' .selectHelper img').attr('src','/select_n.png')
    "click .pin": (e)->
      e.preventDefault()
      if $('#'+e.currentTarget.id).hasClass('select')
        $('#'+e.currentTarget.id+' .selectHelper img').attr('src','/select_n.png')
      else
        $('#'+e.currentTarget.id+' .selectHelper img').attr('src','/select_p.png')
      $(e.currentTarget).toggleClass('select')
    # "change .publish-reader-group input[type='checkbox']": (e, t)->
    #   $(e.target.parentNode).toggleClass('selected')
    "change #comment":()->
       Session.set("comment",$('#comment').val())
    "click #topic":(event)->
       comment = Session.get("comment")+"#"+this.text+"#"
       if topicsCountIsBeyond(comment)
        return
       Session.set("comment",comment)
    "click #save":(event, t)->
       if topicsCountIsBeyond(Session.get("comment"))
        return
       $save = $(event.currentTarget)
       if $save.find('i').length > 0
         return
       else
         $save.html($save.html() + '<i style="font-size:18px; margin-left: 10px;" class="fa fa-refresh fa-spin fa-3x fa-fw"></i>')
         # return

      #  if($('#share-follower').prop('checked'))
      #    Meteor.call('sendEmailByWebFollower', Session.get('TopicPostId'), 'push')

       topicPostId = Session.get("TopicPostId")
       Meteor.defer ()->
          TopicTitle = Session.get("TopicTitle")
          TopicAddonTitle = Session.get("TopicAddonTitle")
          TopicMainImage = Session.get("TopicMainImage")
          comment = Session.get("comment")
          user = Meteor.user()

          if Session.get('post-publish-user-id') and Session.get('post-publish-user-id') isnt ''
          #unless Session.equals('post-publish-user-id', '')
            pubuser = Meteor.users.findOne({_id: Session.get('post-publish-user-id')})
            if pubuser
              user = pubuser

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
          commentData = Comment.find({postId:topicPostId,userId:userId}, {sort: {createdAt: 1}}).fetch()
          if commentData.length>0
            if comment == ''
              for i in [0..(commentData.length-1)]
                commentId = commentData[i]._id
                Comment.remove({_id:commentId})
            else
              if commentData.length>1
                for i in [0..(commentData.length-2)]
                  commentId = commentData[i]._id
                  Comment.remove({_id:commentId})
              try
                commentObj = {
                  postId:topicPostId
                  content:comment
                  username:username
                  userId:userId
                  userIcon:userIcon
                  createdAt: new Date()
                }
                commentId = commentData[commentData.length-1]._id
                Comment.update({_id:commentId},{$set:commentObj})
              catch error
                console.log error
          else 
            if comment != ''
              try
                Comment.insert {
                  postId:topicPostId
                  content:comment
                  username:username
                  userId:userId
                  userIcon:userIcon
                  createdAt: new Date()
                }
              catch error
                console.log error
          if comment != ''
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

                #  if Topics.find({text:topic}).count() > 0
                #     topicData = Topics.find({text:topic}).fetch()[0]
                #     topicId = topicData._id
                #     #console.log topicData._id
                #  else
                #     topicId = Topics.insert {
                #       type:"topic",
                #       text:topic,
                #       imgUrl: ""
                #     }
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
                topicPostObj = {
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
                  createdAt: new Date()
                }
                Meteor.call('updateTopicPostsAfterComment', topicPostId, topic, topicPostObj)
                #  unless TopicPosts.findOne({postId:topicPostId,topicId: topicId})
                #    TopicPosts.insert {
                #      postId:topicPostId,
                #      title:TopicTitle,
                #      addontitle:TopicAddonTitle,
                #      mainImage:TopicMainImage,
                #      heart:0,
                #      retweet:0,
                #      comment:1,
                #      owner:userId,
                #      ownerName:username,
                #      ownerIcon:userIcon,
                #      createdAt: new Date(),
                #      topicId: topicId
                #    }
          #added for reader group

       groups = []
       #  $(".publish-reader-group").find("input:checked").each(()->
       t.$(".waterfall .select").each(()->
         groups.push $(this).attr("id")
       )

       Meteor.defer ()->
         console.log(groups)
         if groups.length isnt 0
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
            Meteor.call('pushPostToReaderGroups', feedItem, groups)
       if Session.get('recommendStoryShare') is true
          Meteor.defer ()->
            Meteor.call('pushRecommendStoryToReaderGroups', Session.get('recommendStoryShareFromId'), topicPostId)
          Session.set('recommendStoryShare',false)
       Session.set("mynewpostId",topicPostId)
       if Session.get('isServerImport')
        Session.set 'isServerImport', false
        Router.go('/posts/'+topicPostId)
       else
        Router.go('/newposts/'+topicPostId)
       # Router.go('/newposts/'+topicPostId)
       false

  Template.publishReadersList.rendered=->
     uid = Session.get('post-publish-user-id') || Meteor.userId()
     Meteor.subscribe "readerpopularpostsbyuid", uid,(ready)->
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

  Template.serverImportSelectUser.onRendered ()->
    t = this
    Meteor.subscribe 'userRelation', ()->
      console.log('chooseAssociatedUser data:', t.data)
      if UserRelation.find({userId: Meteor.userId()}).count() > 0 and t.data.server_import
        $('.addTopicComment .content').hide()
        $('.server-import-select-user').show()
  Template.serverImportSelectUser.helpers
    accountList :->
      return UserRelation.find({userId: Meteor.userId()})

  Template.serverImportSelectUser.events
    "click .c dl": (e, t)->
      t.$("dt.active").removeClass("active")
      $(e.currentTarget).find("dt").addClass('active')
    "click #modalServerPublish": (e, t)->
      user_id = $('.server-import-select-user .c dt.active').attr('userId')
      console.log('publish user:', user_id)
      $('.server-import-select-user').hide()
      $('.addTopicComment .content').show()
      Session.set 'post-publish-user-id', user_id
      Meteor.subscribe "usersById", user_id
      Meteor.call('updatePostUser', Session.get('TopicPostId'), user_id)
