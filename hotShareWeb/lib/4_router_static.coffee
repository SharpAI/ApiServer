if Meteor.isServer
  html_minifier = Meteor.npmRequire "html-minifier"
  minify = html_minifier.minify

  Router.route '/static/:_id', (req, res, next)->
        postItem = Posts.findOne({_id: this.params._id})
        postHtml = SSR.render('post', postItem)

        res.writeHead(200, {
            'Content-Type': 'text/html'
        })
        res.end(minify(postHtml, {removeComments: true, collapseWhitespace: true, minifyJS: true, minifyCSS: true}))
    , {where: 'server'}

    Router.route '/static/data/suggestposts/:_id/:skip/:limit', (req, res, next)->
        userId = this.params._id
        limit = parseInt(this.params.limit)
        if not limit
          limit = 10
        skip = parseInt(this.params.skip)
        if not skip
          skip = 0


        suggestPostsUserId = Meteor.users.findOne({'username': 'suggestPosts'})._id
        suggestPosts = FollowPosts.find({followby: suggestPostsUserId}, {sort: {createdAt: -1}, skip: skip, limit: limit}).fetch()
        console.log(suggestPosts);
        res.writeHead(200, {
            'Content-Type': 'application/json'
        })
        res.end(JSON.stringify({data: suggestPosts}))        
    , {where: 'server'}  

    Router.route '/static/author-hot-posts/:_id', (req, res, next)->
      id = this.params._id
      SSR.compileTemplate('hot_posts', Assets.getText('static/author-hot-posts.html'))

      Template.hot_posts.helpers
        authorReadPopularPosts: ()->
          post = Posts.findOne({_id: id})
          return Posts.find({_id: {$ne: id},owner: post.owner, publish: {$ne: false}},{sort: {browse: -1},limit: 3})

      res.writeHead(200, {'Content-Type': 'text/html'})
      html = SSR.render('hot_posts')
      res.end(minify(html, {removeComments: true, collapseWhitespace: true, minifyJS: true, minifyCSS: true}))
    , {where: 'server'}

    Router.route '/static/bell/:userId', (req, res, next)->
      userId = this.params.userId
      limit = 30 # max 30 count
      SSR.compileTemplate('bell', Assets.getText('static/bell.html'))

      Template.bell.helpers
        notReadCount: ()->
          return Feeds.find({followby: userId, isRead: {$ne: true},checked: {$ne: true}}, {limit: limit}).count()
        notRead: (read, check, index, createAt)->
          if ((new Date() - new Date(createAt).getTime()) > (7 * 24 * 3600 * 1000))
            return false
          if (index > 20)
            return false
          if (check || read)
            return false
          else if (arguments.length is 2)
            return false
          else
            return true
        isFriend: (_userId)->
          if (Follower.findOne({"userId": userId, "followerId": _userId}))
            return true
          else
            return false
        eventFeeds: ->
          return Feeds.find({followby: userId}, {sort: {createdAt: -1}}, {limit: limit})
        isAlsoComment: (eventType)->
          return eventType is 'pcomment'
        isAlsoFavourite: (eventType)->
          return eventType is 'pfavourite'
        isPcommentOwner: (eventType)->
          return eventType is 'pcommentowner'
        isPersonalletter: (eventType)->
          return eventType is 'personalletter'
        isGetRequest: (eventType)->
          return eventType is 'getrequest'
        isSendRequest: (eventType)->
          return eventType is 'sendrequest'
        isRecommand: (eventType)->
          return eventType is 'recommand'
        isReComment: (eventType)->
          return eventType is 'recomment'
        isComment: (eventType)->
          return eventType is 'comment'
        selfPosted: (eventType)->
          return eventType is 'SelfPosted'
        time_diff: (created)->
          return GetTime0(new Date() - created)

      res.writeHead(200, {'Content-Type': 'text/html'})
      postHtml = SSR.render('bell')
      res.end(minify(postHtml, {removeComments: true, collapseWhitespace: true, minifyJS: true, minifyCSS: true}))
    , {where: 'server'}  
