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
  'click .add-new' :->
    Router.go '/my_accounts_management_addnew'

  'click .remove': (e, t)->
    e.stopPropagation()
    #console.log(this._id)
    #console.log(e.currentTarget)
    Meteor.call('removeAssociatedUser', this._id);
      
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
        else if data.message is 'Exist Associate User'
          PUB.toast('该用户已关联')
        else if data.message is 'Invalid Password'
          PUB.toast('密码不正确')
        else
          PUB.toast('用户名或密码不正确')
      else
        Router.go '/my_accounts_management'
    );