
if Meteor.isClient
  @pcommentReportHandler=(i, content)->
    Meteor.defer ()->
        postId = Session.get("postContent")._id
        post = Session.get("postContent").pub
        if content is ""
          console.log "输入内容为空"
          return
        if !(i >= 0)
          console.log "index is wrong."
          return
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
        if not post[i].pcomments or post[i].pcomments is undefined
          pcomments = []
          post[i].pcomments = pcomments
        pcommentJson = {
          content:content
          username:username
          userId:userId
          userIcon:userIcon
          createdAt: new Date()
        }
        post[i].pcomments.push(pcommentJson)
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"pcomments","pindex":i}}, (error, result)->
          if error
            console.log(error.reason)
          else
            console.log("success")
            if Session.get("clickedCommentOverlayThumbsUp") is true
              commentOverlayThumbsUpHandler(i)
              console.log "up is true"
            if Session.get("clickedCommentOverlayThumbsDown") is true
              commentOverlayThumbsDownHandler(i)
              console.log "down is true"
        )
  @commentOverlayThumbsUpHandler=(i)->
    Meteor.defer ()->
      postId = Session.get("postContent")._id
      post = Session.get("postContent").pub
      userId = Meteor.userId()
      if not post[i].likeUserId
        likeUserId = {}
        post[i].likeUserId = likeUserId
      if not post[i].likeSum
        likeSum = 0
        post[i].likeSum = likeSum
      if not post[i].dislikeUserId
        dislikeUserId = {}
        post[i].dislikeUserId = dislikeUserId
      if not post[i].dislikeSum
        dislikeSum = 0
        post[i].dislikeSum = dislikeSum
      if post[i].likeUserId.hasOwnProperty(userId) isnt true
        post[i].likeUserId[Meteor.userId()] = false
      if  post[i].dislikeUserId.hasOwnProperty(userId) isnt true
        post[i].dislikeUserId[userId] = false
      if post[i].likeUserId[userId] isnt true  and post[i].dislikeUserId[userId] isnt true
        post[i].likeSum += 1
        post[i].likeUserId[userId] = true
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"like","pindex":i}}, (error, result)->
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else if  post[i].dislikeUserId[userId] is true and  post[i].likeUserId[userId] isnt true
        post[i].likeSum += 1
        post[i].likeUserId[userId] = true
        post[i].dislikeSum -= 1
        post[i].dislikeUserId[Meteor.userId()] = false
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"like","pindex":i}}, (error, result)->
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else if post[i].likeUserId[userId] is true and  post[i].dislikeUserId[userId] isnt true
        post[i].likeSum -= 1
        post[i].likeUserId[userId] = false
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"like","pindex":i}}, (error, result)->
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else
        return
  @commentOverlayThumbsDownHandler=(i)->
    Meteor.defer ()->
      postId = Session.get("postContent")._id
      post = Session.get("postContent").pub
      userId = Meteor.userId()
      if not post[i].likeUserId
        likeUserId = {}
        post[i].likeUserId = likeUserId
      if not post[i].likeSum
        likeSum = 0
        post[i].likeSum = likeSum
      if not post[i].dislikeUserId
        dislikeUserId = {}
        post[i].dislikeUserId = dislikeUserId
      if not post[i].dislikeSum
        dislikeSum = 0
        post[i].dislikeSum = dislikeSum
      if post[i].likeUserId.hasOwnProperty(userId) isnt true
        post[i].likeUserId[Meteor.userId()] = false
      if  post[i].dislikeUserId.hasOwnProperty(userId) isnt true
        post[i].dislikeUserId[userId] = false
      if post[i].likeUserId[userId] isnt true  and post[i].dislikeUserId[userId] isnt true
        post[i].dislikeSum += 1
        post[i].dislikeUserId[userId] = true
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"dislike","pindex":i}}, (error, result)->
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else if  post[i].dislikeUserId[userId] isnt true and  post[i].likeUserId[userId] is true
        post[i].dislikeSum += 1
        post[i].dislikeUserId[userId] = true
        post[i].likeSum -= 1
        post[i].likeUserId[Meteor.userId()] = false
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"dislike","pindex":i}}, (error, result)->
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else if post[i].likeUserId[userId] isnt true and  post[i].dislikeUserId[userId] is true
        post[i].dislikeSum -= 1
        post[i].dislikeUserId[userId] = false
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"dislike","pindex":i}}, (error, result)->
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else
        return
  @thumbsUpHandler=(e,self)->
    if e.target.className is "fa fa-thumbs-up thumbsUp"
      e.target.className="fa fa-thumbs-o-up thumbsUp"
      #e.target.textContent=e.target.textContent-1
    else
      e.target.className="fa fa-thumbs-up thumbsUp"
      e.target.parentNode.parentElement.style.color="rgb(243,11,68)"
      #e.target.textContent=e.target.textContent-0+1
      if e.target.nextElementSibling.className is "fa fa-thumbs-down thumbsDown"
        e.target.nextElementSibling.className = "fa fa-thumbs-o-down thumbsDown"
        #e.target.nextElementSibling.textContent=e.target.nextElementSibling.textContent-1
    Meteor.defer ()->
      i = self.index
      postId = Session.get("postContent")._id
      post = Session.get("postContent").pub
      userId = Meteor.userId()

      if (favp = FavouritePosts.findOne({postId: postId, userId: userId}))
        FavouritePosts.update({_id: favp._id}, {$set: {updateAt: new Date()}})
      else
        FavouritePosts.insert({postId: postId, userId: userId, createdAt: new Date(), updateAt: new Date()})

      if not post[i].likeUserId
        likeUserId = {}
        post[i].likeUserId = likeUserId
      if not post[i].likeSum
        likeSum = 0
        post[i].likeSum = likeSum
      if not post[i].dislikeUserId
        dislikeUserId = {}
        post[i].dislikeUserId = dislikeUserId
      if not post[i].dislikeSum
        dislikeSum = 0
        post[i].dislikeSum = dislikeSum
      if post[i].likeUserId.hasOwnProperty(userId) isnt true
        post[i].likeUserId[Meteor.userId()] = false
      if  post[i].dislikeUserId.hasOwnProperty(userId) isnt true
        post[i].dislikeUserId[userId] = false
      if post[i].likeUserId[userId] isnt true  and post[i].dislikeUserId[userId] isnt true
        post[i].likeSum += 1
        post[i].likeUserId[userId] = true
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"like","pindex":i}}, (error, result)->
          triggerToolbarShowOnThumb($(e.target))
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else if  post[i].dislikeUserId[userId] is true and  post[i].likeUserId[userId] isnt true
        post[i].likeSum += 1
        post[i].likeUserId[userId] = true
        post[i].dislikeSum -= 1
        post[i].dislikeUserId[Meteor.userId()] = false
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"like","pindex":i}}, (error, result)->
          triggerToolbarShowOnThumb($(e.target))
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else if post[i].likeUserId[userId] is true and  post[i].dislikeUserId[userId] isnt true
        post[i].likeSum -= 1
        post[i].likeUserId[userId] = false
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"like","pindex":i}}, (error, result)->
          triggerToolbarShowOnThumb($(e.target))
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else
        triggerToolbarShowOnThumb($(e.target))
        return
  @thumbsDownHandler = (e,self)->
    if e.target.className is "fa fa-thumbs-down thumbsDown"
      e.target.className="fa fa-thumbs-o-down thumbsDown"
      #e.target.textContent=e.target.textContent-1
    else
      e.target.className="fa fa-thumbs-down thumbsDown"
      e.target.parentNode.parentElement.style.color="rgb(243,11,68)"
      #e.target.textContent=e.target.textContent-0+1
      if e.target.previousElementSibling.className is "fa fa-thumbs-up thumbsUp"
        e.target.previousElementSibling.className = "fa fa-thumbs-o-up thumbsUp"
        #e.target.previousElementSibling.textContent=e.target.previousElementSibling.textContent-1
    Meteor.defer ()->
      i = self.index
      postId = Session.get("postContent")._id
      post = Session.get("postContent").pub
      userId = Meteor.userId()
      if not post[i].likeUserId
        likeUserId = {}
        post[i].likeUserId = likeUserId
      if not post[i].likeSum
        likeSum = 0
        post[i].likeSum = likeSum
      if not post[i].dislikeUserId
        dislikeUserId = {}
        post[i].dislikeUserId = dislikeUserId
      if not post[i].dislikeSum
        dislikeSum = 0
        post[i].dislikeSum = dislikeSum
      if post[i].likeUserId.hasOwnProperty(userId) isnt true
        post[i].likeUserId[Meteor.userId()] = false
      if  post[i].dislikeUserId.hasOwnProperty(userId) isnt true
        post[i].dislikeUserId[userId] = false
      if post[i].likeUserId[userId] isnt true  and post[i].dislikeUserId[userId] isnt true
        post[i].dislikeSum += 1
        post[i].dislikeUserId[userId] = true
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"dislike","pindex":i}}, (error, result)->
          triggerToolbarShowOnThumb($(e.target))
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else if  post[i].dislikeUserId[userId] isnt true and  post[i].likeUserId[userId] is true
        post[i].dislikeSum += 1
        post[i].dislikeUserId[userId] = true
        post[i].likeSum -= 1
        post[i].likeUserId[Meteor.userId()] = false
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"dislike","pindex":i}}, (error, result)->
          triggerToolbarShowOnThumb($(e.target))
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else if post[i].likeUserId[userId] isnt true and  post[i].dislikeUserId[userId] is true
        post[i].dislikeSum -= 1
        post[i].dislikeUserId[userId] = false
        pclength=0
        if(post[i].pcomments)
          pclength=post[i].pcomments.length
        if post[i].dislikeSum + post[i].likeSum + pclength is 0
          if post[i].style and post[i].style.length>100
            post[i].style=post[i].style.replace("#F30B44","grey")
          else
            post[i].style=""
        Posts.update({_id: postId},{"$set":{"pub":post,"ptype":"dislike","pindex":i}}, (error, result)->
          triggerToolbarShowOnThumb($(e.target))
          if error
            console.log(error.reason);
          else
            console.log("success");
        )
      else
        triggerToolbarShowOnThumb($(e.target))
        return
  @triggerToolbarShowOnThumb = ($node)->
    $node.parent().click()