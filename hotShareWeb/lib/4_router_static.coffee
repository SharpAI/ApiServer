if Meteor.isServer
    postFontStyleDefault='font-size:large;';
    postFontStyleNormal='font-size:large;';
    postFontStyleQuota='font-size:15px;background:#F5F5F5;padding-left:3%;padding-right:3%;color:grey;';

    calcTextItemStyle = (layoutObj)->
        fontStyle = postFontStyleDefault
        alignStyle = 'text-align:left;'
        if layoutObj
            if layoutObj.font
                if layoutObj.font is 'normal'
                    fontStyle=postFontStyleNormal
                else if layoutObj.font is 'quota'
                    fontStyle=postFontStyleQuota
            if layoutObj.align
                if layoutObj.align is 'right'
                    alignStyle = "text-align:right;"
                else if layoutObj.align is 'center'
                    alignStyle = "text-align:center;"
            if layoutObj.weight
                alignStyle = "font-weight:"+layoutObj.weight+";"
        fontStyle+alignStyle
    storeStyleInItem = (node,type,value)->
        $(node).attr('hotshare-'+type,value)
    getStyleInItem = (node,type,value)->
        $(node).attr('hotshare-'+type)


    GetTime0 = (dateM)->
        MinMilli = 1000 * 60;         #初始化变量。
        HrMilli = MinMilli * 60;
        DyMilli = HrMilli * 24;
        #计算出相差天数
        days=Math.floor(dateM/(DyMilli));

        #计算出小时数
        leave1=dateM%(DyMilli); #计算天数后剩余的毫秒数
        hours=Math.floor(leave1/(HrMilli));
        #计算相差分钟数
        leave2=leave1%(HrMilli);        #计算小时数后剩余的毫秒数
        minutes=Math.floor(leave2/(MinMilli));
        #计算相差秒数
        leave3=leave2%(MinMilli);      #计算分钟数后剩余的毫秒数
        seconds=Math.round(leave3/1000);
    
        prefix = ""
        if dateM > DyMilli
          prefix = days+"天 前"
        else if dateM > HrMilli
          prefix = hours+"小时 前"
        else if dateM > MinMilli
          prefix = minutes+"分钟 前"
        else if dateM <= MinMilli
          if seconds <= 0
              prefix = "刚刚"
          else
              prefix = seconds+"秒 前"

        return prefix

    Router.route '/static/:_id', (req, res, next)->
        SSR.compileTemplate('postItem', Assets.getText('static/postItem.html'))
        Template.postItem.helpers
            hasVideoInfo: (videoInfo)->
              if videoInfo
                return true
              else
                false
            myselfClickedUp:->
                false
            myselfClickedDown:->
                return false
            calcStyle: ()->
              # For backforward compatible. Only older version set style directly
              if this.style and this.style isnt ''
                ''
              else
                calcTextItemStyle(this.layout)
            isTextLength:(text)->
              if(text.trim().length>20)
                return true
              else if  text.split(/\r\n|\r|\n/).length > 1
                return true
              else
                return false
            pcIndex:->
              pcindex = 0
              index = parseInt(this.index)
              if index is pcindex
                'dCurrent'
              else
                ''
            scIndex:->
              scindex = 0
              index = parseInt(this.index)
              if index is scindex
                'sCurrent'
              else
                ''
            plike:->
              if this.likeSum is undefined
                0
              else
                this.likeSum
            pdislike:->
              if this.dislikeSum is undefined
                0
              else
                this.dislikeSum
            pcomments:->
              if this.pcomments is undefined
                0
              else
                this.pcomments.length
            getStyle:->
              self=this
              pclength=0
              if self.pcomments
                pclength=self.pcomments.length
              userId=""
              scolor="#F30B44"
              if userId and userId isnt ""
                if self.likeUserId and self.likeUserId[userId] is true
                  scolor="#304EF5"
                if scolor is "#F30B44" and self.dislikeUserId and self.dislikeUserId[userId] is true
                  scolor="#304EF5"
                if scolor is "#F30B44" and pclength>0
                  for icomment in self.pcomments
                    if icomment["userId"] is userId
                      scolor="#304EF5"
                      break
              if scolor is "#304EF5"
                if Session.get("toasted") is false
                  Session.set "toasted",true
                  Session.set("needToast",true)
              dislikeSum = 0
              if self.dislikeSum
                dislikeSum=self.dislikeSum
              likeSum=0
              if self.likeSum
                likeSum=self.likeSum
              if dislikeSum + likeSum + pclength is 0
                self.style
              else
                if self.style is undefined or self.style.length is 0
                  "color: "+scolor+";"
                else
                  self.style.replace("grey",scolor).replace("rgb(128, 128, 128)",scolor).replace("rgb(0, 0, 0)",scolor).replace("#F30B44",scolor)

        SSR.compileTemplate('post', Assets.getText('static/post.html'))
        Template.post.helpers
            time_diff: (created)->
                GetTime0(new Date() - created)
            getPub:->
              self = this
              self.pub = self.pub || []
              if withSponserLinkAds
                position = 1+(self.pub.length / 2)
                self.pub.splice(position,0,{adv:true,type:'insertedLink',data_col:1,data_sizex:6,urlinfo:'http://cdn.tiegushi.com/posts/qwWdWJPMAbyeo8tiJ'})
                _.map self.pub, (doc, index, cursor)->
                  if position < index
                    _.extend(doc, {index: index-1})
                  else
                    _.extend(doc, {index: index})
              else
                _.map self.pub, (doc, index, cursor)->
                  _.extend(doc, {index: index})                

        postItem = Posts.findOne({_id: this.params._id})
        postHtml = SSR.render('post', postItem)

        res.writeHead(200, {
            'Content-Type': 'text/html'
        })
        res.end(postHtml)
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
        res.writeHead(200, {
            'Content-Type': 'application/json'
        })
        res.end(JSON.stringify({data: suggestPosts}))        
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
      res.end(postHtml)
    , {where: 'server'}  
