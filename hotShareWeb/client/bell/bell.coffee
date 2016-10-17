if Meteor.isClient
  Template.bell.rendered=->
    Session.set("postPageScrollTop", 0)
    $('.content').css 'min-height',$(window).height()
    $(window).scroll (event)->
        target = $("#showMoreFeedsResults");
        FEEDS_ITEMS_INCREMENT = 20;
        if (!target.length)
            return;
        threshold = $(window).scrollTop() + $(window).height() - target.height();

        if target.offset().top < threshold
            if (!target.data("visible"))
                target.data("visible", true);
                Session.set("feedsitemsLimit",
                Session.get("feedsitemsLimit") + FEEDS_ITEMS_INCREMENT);
        else
            if (target.data("visible"))
                target.data("visible", false);
    ctt_msgs = $('#content_msgs')
    if (Feeds.find().count() > 3)
      ctt_msgs.css('overflow', 'hidden')
      ctt_msgs.css('minHeight', '50px')
      ctt_msgs.css('maxHeight', '240px')
      ctt_msgs.css('position', 'relative')
      ctt_msgs.after('<div class="readmore"><div class="readMoreContent"><i class="fa fa-chevron-down"></i>查看更多</div></div>')
  Template.bell.helpers
    notReadCount: ()->
      Feeds.find({isRead:{$ne: true}, checked:{$ne: true}}).count()
    notRead:(read, check, index, createAt)->
      console.log('isRead:'+read+ 'isCheck:'+check+'>>>>>>>>>>>参数 长度：'+arguments.length)
      if (new Date() - new Date(createAt).getTime() ) > (7 * 24 * 3600 * 1000)
        return false
      if index > 20
        return false
      if check or read
        return false
      else if arguments.length is 2
        console.log(">>>++++>>>"+this._id)
        return false
      else
        return true
    isFriend:(userId)->
      Meteor.subscribe("friendFollower",Meteor.userId(),userId)
      if Follower.findOne({"userId":Meteor.userId(),"followerId":userId})
        true
      else
        false
    eventFeeds:->
      feeds = Feeds.find({}, {sort: {createdAt: -1}})
      if feeds.count() > 0
        Meteor.defer ()->
          Session.setPersistent('persistentFeedsForMe',feeds.fetch())
        return feeds
      else
        Session.get('persistentFeedsForMe')
    isPComment:(eventType)->
      eventType is 'pcomments'
    isPLike:(eventType)->
      eventType is 'like'
    isPDislike:(eventType)->
      eventType is 'dislike'
    isAlsoComment:(eventType)->
      eventType is 'pcomment'
    isAlsoFavourite:(eventType)->
      eventType is 'pfavourite'
    isPcommentOwner:(eventType)->
      eventType is 'pcommentowner'
    isPersonalletter:(eventType)->
      eventType is 'personalletter'
    isGetRequest:(eventType)->
      eventType is 'getrequest'
    isSendRequest:(eventType)->
      eventType is 'sendrequest'
    isRecommand:(eventType)->
      eventType is 'recommand'
    isReComment:(eventType)->
      eventType is 'recomment'
    isComment:(eventType)->
      eventType is 'comment'
    selfPosted:(eventType)->
      eventType is 'SelfPosted'
    time_diff: (created)->
      GetTime0(new Date() - created)
    moreResults:->
      !(Feeds.find().count() < Session.get("feedsitemsLimit"))
    loading:->
      Session.equals('feedsCollection','loading')
    loadError:->
      Session.equals('feedsCollection','error')
    noMessages:->
      if Feeds.find().count() > 0 or Session.equals('feedsCollection','loading')
         return false
      else
         return true
  Template.bell.events
    'click .readmore': (e, t)->
      ctt_msgs = $('#content_msgs')
      ctt_msgs.css('overflow', '')
      ctt_msgs.css('minHeight', '')
      ctt_msgs.css('maxHeight', '')
      ctt_msgs.css('position', '')
      $('.readmore').remove()
    'click .closePersonalLetter': ()->
      Session.set('inPersonalLetterView',false)
      $('body').css('overflow-y','auto')
      $('.personalLetterContent,.bellAlertBackground').fadeOut 300
    'click #personalLetter': (e)->
      Session.set('inPersonalLetterView',true)
      $('body').css('overflow-y','hidden')
      document.getElementById(this._id + 'content').style.display='block'
      $(".bellAlertBackground").fadeIn 300
    'click .contentList': (e)->
      if this.pindex?
        Session.set("pcurrentIndex",this.pindex)
        Session.set("pcommetsId",this.owner)
        Session.set("pcommentsName",this.ownerName)
        Session.set "toasted",false
        Feeds.update({_id:this._id},{$set: {checked:true}})
      console.log(this._id)
      Meteor.call 'updataFeedsWithMe', Meteor.userId()
    'click .acceptrequest': (event)->
       Follower.insert {
         userId: this.requesteeId
         userName: this.requestee
         userIcon: this.requesteeIcon
         userDesc: ''
         followerId: this.requesterId
         followerName: this.requester
         followerIcon: this.requesterIcon
         followerDesc: ''
         createAt: new Date()
       }
       Follower.insert {
         userId: this.requesterId
         userName: this.requester
         userIcon: this.requesterIcon
         userDesc: ''
         followerId: this.requesteeId
         followerName: this.requestee
         followerIcon: this.requesteeIcon
         followerDesc: ''
         createAt: new Date()
       }
    'click #follow': (event)->
       history.go(-1)
