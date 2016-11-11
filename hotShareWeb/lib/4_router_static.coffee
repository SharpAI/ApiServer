if Meteor.isServer
  html_minifier = Meteor.npmRequire "html-minifier"
  minify = html_minifier.minify
  getCookie = (c_name,cookies) ->
    if cookies and cookies.length > 0
      c_start =cookies.indexOf(c_name + '=')
      if c_start != -1
        c_start = c_start + c_name.length + 1
        c_end =cookies.indexOf(';', c_start)
        if c_end == -1
          c_end = cookies.length
        return unescape(cookies.substring(c_start, c_end))
    return ''
  SSR.compileTemplate('no-post', Assets.getText('static/no-post.html'))
  SSR.compileTemplate('hot_posts', Assets.getText('static/author-hot-posts.html'))
  SSR.compileTemplate('bell', Assets.getText('static/bell.html'))
  SSR.compileTemplate('post-no-review', Assets.getText('static/post-no-review.html'))
  WebApp.rawConnectHandlers.use (req, res, next)->
    res.setHeader("Access-Control-Allow-Origin", "*")
    next()

  Router.route '/static/:_id', (req, res, next)->
    postItem = Posts.findOne({_id: this.params._id})
    if(!postItem)
      html = SSR.render('no-post')
      res.writeHead(404, {
        'Content-Type': 'text/html'
      })
      return res.end(minify(html, {removeComments: true, collapseWhitespace: true, minifyJS: true, minifyCSS: true}))

    postHtml = SSR.render('post', postItem)
    res.writeHead(200, {
      'Content-Type': 'text/html'
    })
    res.end(minify(postHtml, {removeComments: true, collapseWhitespace: true, minifyJS: true, minifyCSS: true}))
  , {where: 'server'}

  Router.route '/static/:_id/:_index', (req, res, next)->
    postItem = Posts.findOne({_id: this.params._id})
    if(!postItem)
      html = SSR.render('no-post')
      res.writeHead(404, {
        'Content-Type': 'text/html'
      })
      return res.end(minify(html, {removeComments: true, collapseWhitespace: true, minifyJS: true, minifyCSS: true}))
    postItem.focusedIndex = this.params._index
    postHtml = SSR.render('post', postItem)
    res.writeHead(200, {
      'Content-Type': 'text/html'
    })
    res.end(minify(postHtml, {removeComments: true, collapseWhitespace: true, minifyJS: true, minifyCSS: true}))
  , {where: 'server'}

  Router.route '/raw/:_id', (req, res, next)->
    postItem = Posts.findOne({_id: this.params._id})
    cookies = req.headers.cookie
    loginUserId = getCookie('loginUserId',cookies).toString()
    if(!postItem)
      res.writeHead(404, {
        'Content-Type': 'application/json'
      })
      return res.end(JSON.stringify({status:'Not Found'}))


    res.writeHead(200, {
      'Content-Type': 'application/json'
    })
    res.end(JSON.stringify({status:'ok',data: postItem}))
  , {where: 'server'}

  Router.route '/t/:_id', (req, res, next)->
    postItem = Posts.findOne({_id: this.params._id})
    cookies = req.headers.cookie
    loginUserId = getCookie('loginUserId',cookies).toString()
    if(!postItem)
      html = SSR.render('no-post')
      res.writeHead(404, {
        'Content-Type': 'text/html'
      })
      return res.end(minify(html, {removeComments: true, collapseWhitespace: true, minifyJS: true, minifyCSS: true}))
    
    if postItem and postItem.isReview is false
      if !(loginUserId  and loginUserId isnt '' and postItem.owner is loginUserId)
        html = SSR.render('post-no-review')
        res.writeHead(404, {
          'Content-Type': 'text/html'
        })
        return res.end(minify(html, {removeComments: true, collapseWhitespace: true, minifyJS: true, minifyCSS: true}))
    
    postHtml = SSR.render('post', postItem)
    res.writeHead(200, {
        'Content-Type': 'text/html'
    })
    res.end(minify(postHtml, {removeComments: true, collapseWhitespace: true, minifyJS: true, minifyCSS: true}))
  , {where: 'server'}

  Router.route '/t/:_id/:_index', (req, res, next)->
    postItem = Posts.findOne({_id: this.params._id})
    cookies = req.headers.cookie
    loginUserId = getCookie('loginUserId',cookies).toString()
    if(!postItem)
      html = SSR.render('no-post')
      res.writeHead(404, {
        'Content-Type': 'text/html'
      })
      return res.end(minify(html, {removeComments: true, collapseWhitespace: true, minifyJS: true, minifyCSS: true}))
    if postItem and postItem.isReview is false
      if !(loginUserId  and loginUserId isnt '' and postItem.owner is loginUserId)
        html = SSR.render('post-no-review')
        res.writeHead(404, {
          'Content-Type': 'text/html'
        })
        return res.end(minify(html, {removeComments: true, collapseWhitespace: true, minifyJS: true, minifyCSS: true}))
    postItem.focusedIndex = this.params._index
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

  Router.route '/static/bell/:userId', (req, res, next)->
    userId = this.params.userId
    limit = 30 # max 30 count

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
