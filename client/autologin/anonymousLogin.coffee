# if Meteor.isClient
#   unless Meteor.isCordova
#     @anonymouslogin = ()->
#       if Session.get('disableAnonymousLogin') is true
#         return
#       console.log  'anonymouslogin'
#       unless Meteor.user()
#         createUser = ()->
#           uuid = Meteor.uuid()
#           Accounts.createUser {
#               username:uuid,
#               password:'123456',
#               'profile':{
#                 fullname:'匿名',
#                 icon:'/userPicture.png',
#                 anonymous:true,
#                 browser:true
#               }
#             }
#           ,(error)->
#             console.log('Registration Error is ' + JSON.stringify(error))
#             unless error
#               amplify.store('uuid',uuid)
#               console.log('Registration Success, now logging on '+ uuid)
#               Meteor.loginWithPassword(uuid,'123456',(error)->
#                 unless error
#                   if window.updateMyOwnLocationAddress
#                     window.updateMyOwnLocationAddress()
#               )
#         if amplify.store('uuid')
#           Meteor.loginWithPassword(amplify.store('uuid'),'123456',(error)->
#             unless error
#               if window.updateMyOwnLocationAddress
#                 window.updateMyOwnLocationAddress()
#             else
#               createUser()
#           )
#         else
#           createUser()
