Template.accounts_management.rendered=->
  $('.dashboard').css 'min-height', $(window).height()

  userIds = []
  AssociatedUsers.find({}).forEach((item)->
      if Meteor.userId() isnt item.userIdA and !~ userIds.indexOf(item.userIdA)
          userIds.push(item.userIdA)

      if Meteor.userId() isnt item.userIdB and !~ userIds.indexOf(item.userIdB)
          userIds.push(item.userIdB)
  )
  
  Meteor.subscribe('associateduserdetails', userIds)

  return

Template.accounts_management.helpers
  accountList :->
    userIds = []
    AssociatedUsers.find({}).forEach((item)->
        if Meteor.userId() isnt item.userIdA and !~ userIds.indexOf(item.userIdA)
            userIds.push(item.userIdA)

        if Meteor.userId() isnt item.userIdB and !~ userIds.indexOf(item.userIdB)
            userIds.push(item.userIdB)
    )
    
    return Meteor.users.find({_id: {'$in': userIds}})

Template.accounts_management.events
  'click dl.my_account': ->
    $title = $('.managementTitle')
    title = $title.html()
    $title.text('切换帐号中...')
    
    Meteor.loginWithUserId(
      @_id
      (err)->
        $title.html(title)
        if(!err)
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
          PUB.toast('切换帐号成功~')
        else
          PUB.toast('切换帐号失败~')
    )
  'click .add-new' :->
    Router.go '/my_accounts_management_addnew'

  'click .remove': (e, t)->
    e.stopPropagation()
    id = @_id
    #console.log(this._id)
    #console.log(e.currentTarget)
    PUB.confirm(
      '确定要删除吗？'
      ()->
        Meteor.call(
          'removeAssociatedUser'
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
    Router.go '/my_accounts_management'
  'submit #form-addnew': (e, t)->
    e.preventDefault()

    userInfo = {
        username: $(e.target).find('input[name=username]').val(),
        password: Package.sha.SHA256($(e.target).find('input[name=password]').val()),
        type: Meteor.user().type,
        token: Meteor.user().token
    }
    
    Meteor.call('addAssociatedUser', userInfo, (err, data)->
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