Template.accounts_management.rendered=->
  $('.dashboard').css 'min-height', $(window).height()
  return

Template.accounts_management.helpers
  accountList :->
    LocalAccounts.find({})

Template.accounts_management.events
  'click .add-new' :->
    PUB.toast "添加新帐号"
      
  'click .leftButton' :->
    Router.go '/dashboard'