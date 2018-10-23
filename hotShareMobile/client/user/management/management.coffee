Meteor['_unsubscribeAll'] = _.bind(Meteor.connection['_unsubscribeAll'], Meteor.connection);
is_loading = new ReactiveVar([])
loginFn = (id)->
  Meteor._unsubscribeAll()
  Meteor.loginWithUserId id, false, (err)->
    # 切换帐号时清空PostSearch history
    Session.set("searchContent","")
    #PostsSearch.cleanHistory()
    if err is 'RESET_LOGIN'
      return navigator.notification.confirm('切换帐号失败~'
        (index)->
          if index is 1 then loginFn id
        '提示', ['知道了', '重新切换']
      )
    else if err is 'NOT_LOGIN'
      return navigator.notification.confirm('切换帐号时发生异常，需要重新登录您的帐号！'
        ()->
          return Router.go '/loginForm'
        '提示', ['重新登录']
      )
    else if err is 'WAIT_TIME'
      return navigator.notification.confirm '切换帐号太频繁了（间隔至少10秒），请稍后再试！', null, '提示', ['知道了']

    window.plugins.userinfo.setUserInfo(
      Meteor.userId()
      ()->
        console.log("setUserInfo was success ")
      ()->
        console.log("setUserInfo was Error!")
    )
    Router.go '/my_accounts_management'
    Meteor.defer ()->
      Session.setPersistent('persistentMySavedDrafts', SavedDrafts.find({},{sort: {createdAt: -1},limit:2}).fetch())
      Session.setPersistent('persistentMyOwnPosts', Posts.find({owner: Meteor.userId(),publish:{"$ne":false}}, {sort: {createdAt: -1},limit:4}).fetch())
      Session.setPersistent('myFollowedByCount',Counts.get('myFollowedByCount'))
      Session.setPersistent('mySavedDraftsCount',Counts.get('mySavedDraftsCount'))
      Session.setPersistent('myPostsCount',Counts.get('myPostsCount'))
      Session.setPersistent('myFollowToCount',Counts.get('myFollowToCount'))
      Session.setPersistent('myFollowToCount',Counts.get('myEmailFollowerCount'))

    is_loading.set([])
    navigator.notification.confirm '切换帐号成功~', null, '提示', ['知道了']

Template.accounts_management.rendered=->
  is_loading = new ReactiveVar([])
  Tracker.autorun ()->
    if Meteor.status().connected && is_loading.get().length > 0
      loginFn is_loading.get().pop()
      is_loading.set([])


  $('.dashboard').css 'min-height', $(window).height()

  # userIds = []
  # AssociatedUsers.find({}).forEach((item)->
  #     if Meteor.userId() isnt item.userIdA and !~ userIds.indexOf(item.userIdA)
  #         userIds.push(item.userIdA)

  #     if Meteor.userId() isnt item.userIdB and !~ userIds.indexOf(item.userIdB)
  #         userIds.push(item.userIdB)
  # )

  # Meteor.subscribe('associateduserdetails', userIds)

  # return

Template.accounts_management.helpers
  is_me: (id)->
    return id is Meteor.userId()
  connecting: ->
    return is_loading.get().length > 0
  loging: ->
    return Meteor.loggingIn()
  accountList :->
    UserRelation.find({userId: Meteor.userId()})
    # userIds = []
    # AssociatedUsers.find({}).forEach((item)->
    #     if Meteor.userId() isnt item.userIdA and !~ userIds.indexOf(item.userIdA)
    #         userIds.push(item.userIdA)

    #     if Meteor.userId() isnt item.userIdB and !~ userIds.indexOf(item.userIdB)
    #         userIds.push(item.userIdB)
    # )

    # return Meteor.users.find({_id: {'$in': userIds}})

Template.accounts_management.events
  'click dl.my_account': ->
    if is_loading.get().length > 0
      return navigator.notification.confirm '正在切换中，请稍后在试~', null, '提示', ['知道了']
    slef = this
    unless Meteor.status().connected
      is_loading.set([@toUserId])
      return Meteor.reconnect()
    loginFn(@toUserId)
  'click .add-new' :->
    history = Session.get("history_view")
    history.push {
        view: 'my_accounts_management'
        scrollTop: document.body.scrollTop
    }
    Session.set "history_view", history
    Router.go '/my_accounts_management_addnew'

  'click .remove': (e, t)->
    e.stopPropagation()
    id = @toUserId
    #console.log(this._id)
    #console.log(e.currentTarget)
    PUB.confirm(
      '确定要删除吗？'
      ()->
        Meteor.call(
          'removeAssociatedUserNew'
          id
        )
    )

  'click .leftButton' :->
    Router.go '/dashboard'




Template.accounts_management_addnew.rendered=->
  $('.dashboard').css 'min-height', $(window).height()
  return

Template.accounts_management_addnew.events
  'click .leftButton' :->
    PUB.back()
  'submit #form-addnew': (e, t)->
    e.preventDefault()
    # need wait method response
    $(e.target).find('input[type=submit]').attr('disabled','').removeClass('active').val('添加中...')
    userInfo = {
        username: $(e.target).find('input[name=username]').val(),
        password: Package.sha.SHA256($(e.target).find('input[name=password]').val()),
        type: Meteor.user().type,
        token: Meteor.user().token
    }

    Meteor.call('addAssociatedUserNew', userInfo, (err, data)->
      $(e.target).find('input[type=submit]').removeAttr('disabled').addClass('active').val('添加')
      if data and data.status is 'ERROR'
        if data.message is 'Invalid Username'
          PUB.toast('用户不存在')
        else if data.message is 'Can not add their own'
          PUB.toast('不能添加自己')
        else if data.message is 'Exist Associate User'
          PUB.toast('该用户已关联')
        else if data.message is 'Invalid Password'
          PUB.toast('密码不正确')
        else
          PUB.toast('用户名或密码不正确')
      else
        Router.go '/my_accounts_management'
    );

Template.accounts_management_prompt.rendered=->
  $(".spinner .spinner-blade").css({"width":"0.104em","height":"0.4777em","transform-origin":"center -0.4222em"})
  $("body,html").css({"overflow":"hidden"})
  return

Template.accounts_management_prompt.events
  'click .prompt-close' :->
    $('.page-accounts-management-prompt').remove()

Template.accounts_management_prompt.destroyed=->
  $(".spinner .spinner-blade").css({"width":"0.074em","height":"0.2777em","transform-origin":"center -0.2222em"})
  $("body,html").css({"overflow":""})
  return
