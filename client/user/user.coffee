#space 2
if Meteor.isClient
  Template.user.events
    'click .icon':(e)->
      val = e.currentTarget.innerHTML
      uploadFile (result)->
        e.currentTarget.innerHTML = '<span class="fa fa-spinner fa-spin"></span>'
        if result
          e.currentTarget.innerHTML = '<img src="'+result+'">'
          Meteor.users.update Meteor.userId(),{$set:{'profile.icon':result}}
          console.log '头像上传成功：' + result
        else
          e.currentTarget.innerHTML = val
        return
      return
    'click #login-name-link' :->
      document.getElementById('login-buttons-open-change-password').innerHTML = '修改密码'
      document.getElementById('login-buttons-logout').innerHTML = '退出'
      $("#login-dropdown-list .login-close-text").html "关闭"
      return
    'click #login-buttons-open-change-password':-> 
      Meteor.setTimeout ->
        document.getElementById('login-old-password-label').innerHTML = '当前密码'
        document.getElementById('login-password-label').innerHTML = '更改密码'
        document.getElementById('login-buttons-do-change-password').innerHTML = '修改密码'
        0
      return