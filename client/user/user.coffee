#space 2
if Meteor.isClient
  now = new Date();
  today = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate(), 0, 0, 0, 0);

  userGroupIndex = new ReactiveVar(0)

  Meteor.startup ()->
    ###
    Session.setDefault('myFollowedByCount',0)
    Session.setDefault('mySavedDraftsCount',0)
    Session.setDefault('myPostsCount',0)
    Session.setDefault('myFollowToCount',0)
    ###
    Tracker.autorun ()->
      ###
      Meteor.subscribe "myCounter",{
        onReady:()->
          Session.set('myCounterCollection','loaded')
      }
      ###
      if Meteor.user() and Session.equals('channel','user')
        Session.set('gotMyProfileData',false)
        Meteor.setTimeout ()->
          Meteor.call('getMyProfileData',(err,json)->
            if(!err && json)
              Session.set('gotMyProfileData',true)
              console.log(json)
              Session.setPersistent('myPostsCount',json['myPostsCount'])
              Session.setPersistent('mySavedDraftsCount',json['mySavedDraftsCount'])
              Session.setPersistent('myFollowedByCount',json['myFollowedByCount'])
              Session.setPersistent('myFollowedByCount-'+Meteor.userId(),json['myFollowedByCount-'+Meteor.userId()])
              Session.setPersistent('myFollowToCount',json['myFollowToCount'])
              Session.setPersistent('myEmailFollowerCount',json['myEmailFollowerCount'])
              Session.setPersistent('myEmailFollowerCount-'+Meteor.userId(),json['myEmailFollowerCount-'+Meteor.userId()])
            console.log('Issue on getMyProfileData')
          )
        ,100

    Tracker.autorun ()->
      if Meteor.user() and Session.equals('channel','user')
        Session.set('postsWithLimitCollection','loading')
        Session.set('savedDraftsWithLimitCollection','loading')
        Session.set('followedByWithLimitCollection','loading')
        Session.set('followToWithLimitCollection','loading')
        Session.set('myCounterCollection','loading')
        # Meteor.subscribe("postsWithLimit",4,{
        #   onReady:()->
        #     Session.set('postsWithLimitCollection','loaded')
        # })
        # Meteor.subscribe("savedDraftsWithLimit",20,{
        #   onReady:()->
        #     Session.set('savedDraftsWithLimitCollection','loaded')
        # })
        # Meteor.subscribe("followedByWithLimit",10,{
        #   onReady:()->
        #     Session.set('followedByWithLimitCollection','loaded')
        # })
        # Meteor.subscribe("followToWithLimit",10,{
        #   onReady:()->
        #     Session.set('followToWithLimitCollection','loaded')
        # })
        Meteor.subscribe("userRelation")
        Meteor.subscribe("userGroups")
        Meteor.subscribe("group_devices")
        # Meteor.subscribe('myCounter',{
        #   onReady:()->
        #     Session.set('myCounterCollection','loaded')
        # })
  Template.user.onRendered(->
    userGroupIndex.set(0)
  )

  Template.user.helpers
    followedOnly: () ->
      if Meteor.userId()
        followDoc = NotificationFollowList.findOne({_id: Meteor.userId()})
        if followDoc && followDoc['followedOnly']
          Session.set('push_followed_only',true)
          return 'checked'

      Session.set('push_followed_only',false)
      return ''
    getShortTime: (ts,group_id)->
      time_offset = 8
      group = SimpleChat.Groups.findOne({_id: group_id})
      if group and group.offsetTimeZone
        time_offset = group.offsetTimeZone
      time = new Date(this.ts)
      return time.shortTime(time_offset,true)
    isLoading:->
      if Session.get('myPostsCount') isnt undefined
        return false
      if (
        Session.get('persistentProfileIcon') is undefined or
        Session.get('persistentProfileName') is undefined or
        Session.get('myFollowedByCount') is undefined or
        Session.get('myEmailFollowerCount') is undefined or
        Session.get('mySavedDraftsCount') is undefined or
        Session.get('persistentMySavedDrafts') is undefined or
        Session.get('myPostsCount') is undefined or
        Session.get('persistentMyOwnPosts') is undefined or
        Session.get('myFollowToCount') is undefined
        ) and (
        Session.get('gotMyProfileData') is false or
        Session.get('postsWithLimitCollection') is 'loading' or
        Session.get('savedDraftsWithLimitCollection') is 'loading' or
        Session.get('followedByWithLimitCollection') is 'loading' or
        Session.get('followToWithLimitCollection') is 'loading'
        )
          return true
      else
          return false
    myProfileIcon:->
      me = Meteor.user()
      if me and me.profile and me.profile.icon
        Session.setPersistent('persistentProfileIcon',me.profile.icon)
      Session.get('persistentProfileIcon')
    myProfileName:->
      me = Meteor.user()
      if me and me.profile and me.profile.fullname
        Session.setPersistent('persistentProfileName',me.profile.fullname)
      else if me and me.username
        Session.setPersistent('persistentProfileName',me.username)
      Session.get('persistentProfileName')
    followers:->
      #Follower存放用户间关注记录， Follows是推荐偶像列表
      #followerId是偶像userId, userId是粉丝userId
      myFollowedByCount = Session.get('myEmailFollowerCount-'+Meteor.userId()) + Session.get('myFollowedByCount-'+Meteor.userId())
      if Session.equals('myCounterCollection','loaded')
        myFollowedByCount = Counts.get('myEmailFollowerCount-'+Meteor.userId()) + Counts.get('myFollowedByCount-'+Meteor.userId())
      if myFollowedByCount
        myFollowedByCount
      else
        0

    emailFollowerCount:->
      myEmailFollowedByCount = Session.get('myEmailFollowerCount-'+Meteor.userId())
      if Session.equals('myCounterCollection','loaded')
        myEmailFollowedByCount = Counts.get('myEmailFollowerCount-'+Meteor.userId())
      if myEmailFollowedByCount
        myEmailFollowedByCount
      else
        0

    appFollowerCount:->
      myFollowedByCount = Session.get('myFollowedByCount-'+Meteor.userId())
      if Session.equals('myCounterCollection','loaded')
        myFollowedByCount = Counts.get('myFollowedByCount-'+Meteor.userId())

      if myFollowedByCount
        myFollowedByCount
      else
        0

    draftsCount:->
      mySavedDraftsCount = Session.get('mySavedDraftsCount')
      if Session.equals('myCounterCollection','loaded')
        mySavedDraftsCount = Counts.get('mySavedDraftsCount')
      if mySavedDraftsCount
        mySavedDraftsCount
      else
        0
    compareDraftsCount:(value)->
      if (Session.get('mySavedDraftsCount')> value)
        true
      else
        false
    items:()->
      mySavedDrafts = SavedDrafts.find({owner: Meteor.userId()},{sort: {createdAt: -1},limit:2})
      if mySavedDrafts.count() > 0
        Meteor.defer ()->
          Session.setPersistent('persistentMySavedDrafts',mySavedDrafts.fetch())
        return mySavedDrafts
      else
        Session.get('persistentMySavedDrafts')
      return mySavedDrafts
    gtValue: (value1, value2)->
      return value1 > value2
    gtZero: (value)->
      return value > 0
    showGrayZone:(draftsCount, postsCount)->
      if draftsCount > 0 or postsCount > 0
        return true
      else
        return false
    postsCount:->
      #return  Posts.find({owner: Meteor.userId(), publish: {$ne: false}}).count()
      myPostsCount = Session.get('myPostsCount')
      if Session.equals('myCounterCollection','loaded')
        myPostsCount = Counts.get('myPostsCount')
      if myPostsCount
        myPostsCount
      else
        0
    comparePostsCount:(value)->
      if (Session.get('myPostsCount') > value)
        true
      else
        false
    postItems:()->
      myOwnPosts = Posts.find({owner: Meteor.userId(),publish:{"$ne":false}}, {sort: {createdAt: -1},limit:4})
      if myOwnPosts.count() > 0
        Meteor.defer ()->
          Session.setPersistent('persistentMyOwnPosts',myOwnPosts.fetch())
        return myOwnPosts
      else
        Session.get('persistentMyOwnPosts')
    followCount:->
      myFollowToCount = Session.get('myFollowToCount')
      if Session.equals('myCounterCollection','loaded')
        myFollowToCount = Counts.get('myFollowToCount')
      if myFollowToCount
        myFollowToCount
      else
        0
    getmainImage:()->
      mImg = this.mainImage
      if (mImg.indexOf('file:///') >= 0)
        if Session.get(mImg) is undefined
          ProcessImage = (URI,smallImage)->
            if smallImage
              Session.set(mImg, smallImage)
            else
              Session.set(mImg, '/noimage.png')
          getBase64OfImage('','',mImg,ProcessImage)
        Session.get(mImg)
      else
        this.mainImage
    hasTwoMoreGroup:()->
      workstatus = WorkStatus.find({app_user_id:Meteor.userId(),date: today});
      if workstatus and workstatus.count() > 1
        return true
      return false
    myGroupWorkStatus:()->
      lists = [];
      SimpleChat.GroupUsers.find({user_id:Meteor.userId()},{sort:{create_time:-1}}).forEach((item)->
          lists.push({
            group_id: item.group_id,
            group_name: item.group_name
          });
      );
      return lists;
    workstatus: (group_id)->
      if(group_id)
        return WorkStatus.find({
          group_id: group_id,
          app_user_id:Meteor.userId(),
          date: today
        }).fetch();
      return [];
    hasIntime:(in_time)->
      if in_time and in_time > 0
        return true
      return false
    inTime:(in_time,group_id)->
      time_offset = 8
      intime = in_time
      # if (!in_time)
      #   workstatus = WorkStatus.findOne({app_user_id:Meteor.userId(),date: today})
      #   if (workstatus and workstatus.in_time)
      #     intime = workstatus.in_time
      #   if (workstatus and workstatus.group_id)
      #     group_id = workstatus.group_id

      group = SimpleChat.Groups.findOne({_id: group_id})
      if (group and group.offsetTimeZone)
        time_offset = group.offsetTimeZone

      if (intime and intime isnt 0)
        inDate = new Date(intime);
        if (inDate.toString() isnt 'Invalid Date' )
          return inDate.shortTime(time_offset)
        return intime;
      return '';
    hasOutTime:(out_time)->
      if out_time and out_time > 0
        return true
      return false
    outTime:(out_time, group_id)->
      time_offset = 8
      outtime = out_time
      # if (!out_time)
      #   workstatus = WorkStatus.findOne({app_user_id:Meteor.userId(),date: today})
      #   if (workstatus and workstatus.out_time)
      #     outtime = workstatus.out_time
      #   if (workstatus and workstatus.group_id)
      #     group_id = workstatus.group_id

      group = SimpleChat.Groups.findOne({_id: group_id})
      if (group and group.offsetTimeZone)
        time_offset = group.offsetTimeZone

      if (outtime and outtime isnt 0)
        outDate = new Date(outtime);
        if (outDate.toString() isnt 'Invalid Date' )
          return outDate.shortTime(time_offset)
        return outtime
      return '';
    devices: ()->
      group_id = Session.get('modifyMyStatus_group_id');
      in_out = Session.get('modifyMyStatus_in_out');
      return Devices.find({groupId: group_id,in_out:in_out},{sort:{createAt:-1}}).fetch();
    hasJoinGroup:()->
      SimpleChat.GroupUsers.find({user_id:Meteor.userId()}).count() > 0
    hasTwoMore:()->
      SimpleChat.GroupUsers.find({user_id:Meteor.userId()}).count() > 2
    group:()->
      lists = []
      SimpleChat.GroupUsers.find({user_id:Meteor.userId()},{sort:{create_time:-1}}).forEach((item)->
        workstatus = WorkStatus.findOne({group_id: item.group_id, app_user_id:Meteor.userId(), date: today})
        if workstatus
          group = {
            group_id:item.group_id,
            group_name: item.group_name
          }
          group = _.extend(group,workstatus)
          lists.push(group)
      )
      index = userGroupIndex.get()
      group = lists[index]
      return group
    isFirstGroup: ()->
      return userGroupIndex.get() < 1
    isLastGroup: ()->
      lists = []
      SimpleChat.GroupUsers.find({user_id:Meteor.userId()},{sort:{create_time:-1}}).forEach((item)->
        workstatus = WorkStatus.findOne({group_id: item.group_id, app_user_id:Meteor.userId(), date: today})
        if workstatus
          group = {
            group_id:item.group_id,
            group_name: item.group_name
          }
          lists.push(group)
      )
      return userGroupIndex.get() >= (lists.length - 1)
    groupList:()->
      SimpleChat.GroupUsers.find({user_id:Meteor.userId()}, {limit:2, sort: {create_time: -1}}).fetch()
  Template.user.events
    # bind group user
    'click input':(e) ->
      isChecked = false
      if Session.equals('push_followed_only',true)
        isChecked = true
      if isChecked
        NotificationFollowList.update({_id:Meteor.userId()},{ $unset: {followedOnly:1}})
      else
        NotificationFollowList.update({_id:Meteor.userId()},{ $set: {followedOnly:1}})
    'click .bindGroupUser':(e)->
      PUB.page('/bindGroupUser')
    'click .collect':(e)->
      PUB.page('/collectList')
    # edit day Tasks
    'click .editDayTasks': (e)->
      group_id = $(e.currentTarget).data('groupid')
      PUB.page('/dayTasks/'+group_id)
    # change to next Group
    'click #changeToNextGroup': (e)->
      index = userGroupIndex.get()
      index += 1
      userGroupIndex.set(index)
    'click #changeToPrevGroup': (e)->
      index = userGroupIndex.get()
      index -= 1
      userGroupIndex.set(index)
    'focus #search-box': (event)->
       PostsSearch.cleanHistory()
       PUB.page '/searchMyPosts'
    'click #follow': (event)->
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        Router.go '/searchFollow'
      ,animatePageTrasitionTimeout
    'click .icon':(e)->
      val = e.currentTarget.innerHTML
      uploadFile 160, 160, 60, (status,result)->
        e.currentTarget.innerHTML = '<span class="fa fa-spinner fa-spin"></span>'
        if status is 'done' and result
          e.currentTarget.innerHTML = '<img src="'+result+'"  width="80" height="80">'
          Meteor.users.update Meteor.userId(),{$set:{'profile.icon':result}}
          Meteor.call 'updateFollower',Meteor.userId(),{icon:result}
          console.log '头像上传成功：' + result
        else
          e.currentTarget.innerHTML = val
        return
      return
    'click #setting' :->
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        Router.go '/dashboard'
      ,animatePageTrasitionTimeout
    'click .follower' :->
      Session.set('followersitemsLimit', 10);
      Session.set('followeesitemsLimit', 10);
      #true 列出偶像列表，false 列出粉丝列表
      Session.set 'followers_tag', false
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        Router.go '/followers'
      ,animatePageTrasitionTimeout
    'click .following' :->
      Session.set('followeesitemsLimit', 10);
      Session.set('followersitemsLimit', 10);
      #true 列出偶像列表，false 列出粉丝列表
      Session.set 'followers_tag', true
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        Router.go '/followers'
      ,animatePageTrasitionTimeout
    'click .draftImages ul li':(e)->
      Session.set('pubImages', [])
      #Use for if user discard change on Draft
      Session.set('backtopageuser', true)
      TempDrafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          TempDrafts.remove drafts._id
      #Clear draft first
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
      #Prepare data
      savedDraftData = SavedDrafts.findOne({_id: e.currentTarget.id})
      if withDirectDraftShow
        if savedDraftData and savedDraftData.pub and savedDraftData._id
          Session.set('postContent',savedDraftData)
          PUB.page('/draftposts/'+savedDraftData._id)
          return
        else
          toastr.error('got wrong')
          return

      TempDrafts.insert {
        _id:savedDraftData._id,
        pub:savedDraftData.pub,
        title:savedDraftData.title,
        addontitle:savedDraftData.addontitle,
        fromUrl:savedDraftData.fromUrl,
        mainImage: savedDraftData.mainImage,
        mainText: savedDraftData.mainText,
        owner:savedDraftData.owner,
        createdAt: savedDraftData.createdAt,
      }
      pub = savedDraftData.pub
      deferedProcessAddPostItemsWithEditingProcessBar(pub)
      Session.set 'isReviewMode','1'
      PUB.page('/add')

    'click .draftRight':(e)->
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        PUB.page('/allDrafts')
      ,animatePageTrasitionTimeout
    'click .postImages ul li':(e)->
      Session.set("postPageScrollTop", 0)
      postId = e.currentTarget.id
      $('.user').addClass('animated ' + animateOutLowerEffect);
      # history = []
      # history.push {
      #     view: 'user'
      #     scrollTop: document.body.scrollTop
      # }
      # Session.set "history_view", history
      #Session.set('backtopageuser', true)
      Meteor.setTimeout ()->
        PUB.page '/posts/'+postId
      ,animatePageTrasitionTimeout
    'click .postRight':(e)->
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        PUB.page('/myPosts')
      ,animatePageTrasitionTimeout
    'click .checkInTime, click .reReckInTime':(e)->
      group_id = $(e.currentTarget).data('groupid')
      Session.set('wantModify',true);
      if (group_id)
        modifyStatusFun(group_id,'in')
        return;
      workstatus = WorkStatus.findOne({app_user_id:Meteor.userId(),date:today})
      if (workstatus && workstatus.group_id)
        modifyStatusFun(workstatus.group_id,'in')
      else
        Session.set('fromUserInfomation',true);
        PUB.page('/timeline')
    'click .checkOutTime, click .reCheckOutTime':(e)->
      group_id = $(e.currentTarget).data('groupid')
      Session.set('wantModify',true)
      if (group_id)
        modifyStatusFun(group_id,'out')
        return
      workstatus = WorkStatus.findOne({app_user_id:Meteor.userId(),date:today});
      if (workstatus && workstatus.group_id)
        modifyStatusFun(workstatus.group_id,'out')
      else
        Session.set('fromUserInfomation',true);
        PUB.page('/timeline')
    'click .deviceItem': (e)->
      $('#selectDevicesInOut').modal('hide');
      $('.user .content').removeClass('content_box');
      setTimeout(()->
        PUB.page('/timelineAlbum/'+e.currentTarget.id);
      ,1000);
    'click .groupItem':(e)->
      console.log 'click .groupItem'
      $('.user').addClass('animated ' + animateOutLowerEffect);
      console.log this.group_id
      url = '/simple-chat/to/group?id='+this.group_id
      setTimeout ()->
        PUB.page(url)
      ,animatePageTrasitionTimeout
    'click .check_all':(e)->
      $('.user').addClass('animated ' + animateOutLowerEffect);
      setTimeout ()->
        PUB.page('/groupsList');
      ,animatePageTrasitionTimeout

  Template.searchMyPosts.rendered=->
#    $('.content').css 'min-height',$(window).height()
    if(Session.get("searchContent") isnt undefined)
      $("#search-box").val(Session.get("searchContent"))
    if(Session.get("showBigImage") == undefined)
      Session.set("showBigImage",true)
    if Session.get("noSearchResult") is true
      Session.set("searchLoading", false)
    if($("#search-box").val() is "")
      Session.set("showSearchStatus", false)
      Session.set("showSearchItems", false)
      Session.set("noSearchResult", false)
    $(window).scroll (event)->
        console.log "myPosts window scroll event: "+event
        target = $("#showMoreMyPostsResults");
        MYPOSTS_ITEMS_INCREMENT = 300;
        if (!target.length)
            return;
        threshold = $(window).scrollTop() + $(window).height() - target.height();

        if target.offset().top < threshold
            if (!target.data("visible"))
                if Session.get("mypostsitemsLimit") < Session.get('myPostsCount')
                    target.data("visible", true);
                    Next_Limit = Session.get("mypostsitemsLimit") + MYPOSTS_ITEMS_INCREMENT
                    if Next_Limit > Session.get('myPostsCount')
                        Next_Limit = Session.get('myPostsCount')
                    Session.set('myPostsCollection','loading')
                    Session.set("mypostsitemsLimit", Next_Limit);
        else
            if (target.data("visible"))
                target.data("visible", false);
    $('#search-box').bind('propertychange input',(e)->
       text = $(e.target).val().trim()
       Session.set("showSearchStatus", true)
       Session.set("showSearchItems", true)
       Session.set("searchLoading", true)
       Session.set("noSearchResult", false)
       if text is ""
         Session.set("showSearchStatus", false)
         Session.set("showSearchItems", false)
         Session.set("searchLoading", false)
         Session.set("noSearchResult", false)
         return
       options = {userId: Meteor.userId()}
       PostsSearch.search text,options
    )
#    if PostsSearch.getStatus().loaded is true
#      Session.set("searchLoading", false)
    $('#search-box').trigger('focus')
  Template.searchMyPosts.helpers
    showSearchItems:()->
      return Session.get('showSearchItems')
    showSearchStatus:()->
      return Session.get('showSearchStatus')
    searchLoading:()->
      return Session.get('searchLoading')
    noSearchResult:()->
      return Session.get('noSearchResult')
    showBigImage:()->
      return Session.get("showBigImage")
    showRightIcon:()->
      if(Session.get("showBigImage"))
        return "fa fa-list fa-fw"
      else
        return "fa fa-th-large"
    getBrowseCount:(browse)->
      if (browse)
        browse
      else
        0
    moreResults:->
      if (Posts.find({owner:Meteor.userId()}).count() < Session.get('myPostsCount')) or (Session.equals('myPostsCollection','loading'))
        true
      else
        false
    loading:->
      Session.equals('myPostsCollection','loading')
    loadError:->
      Session.equals('myPostsCollection','error')
  Template.searchMyPosts.events
    'click #search-box':()->
        PostsSearch.cleanHistory()
    'click .back':(event)->
        $('.home').addClass('animated ' + animateOutUpperEffect);
        Meteor.setTimeout ()->
#          PUB.back()
          Session.set("searchContent","")
          Router.go('/user')
        ,animatePageTrasitionTimeout
    'click .mainImage':(e)->
        content = $("#search-box").val()
        Session.set("searchContent",content)
        Session.set("postPageScrollTop", 0)
        if isIOS
          if (event.clientY + $('#footer').height()) >=  $(window).height()
            console.log 'should be triggered in scrolling'
            return false
        postId = this._id
        $('.home').addClass('animated ' + animateOutUpperEffect);
        Meteor.setTimeout ()->
          PUB.page '/posts/'+postId
          history = []
          history.push {
              view: 'searchMyPosts'
              scrollTop: document.body.scrollTop
          }
          Session.set "history_view", history
        ,animatePageTrasitionTimeout
        Session.set 'FollowPostsId',this._id
        return
    'click .listView':()->
      if(Session.get("showBigImage"))
        Session.set("showBigImage",false)
      else
        Session.set("showBigImage",true)
