
if Meteor.isServer
    pushToUser = (user,content)->
        pushToken = {type: user.type, token: user.token}
        if pushToken.type is 'JPush'
            token = pushToken.token
            #console.log 'JPUSH to ' + pushToken.token
            client.push().setPlatform 'ios', 'android'
            .setAudience JPush.registration_id(token)
            .setNotification '回复通知',JPush.ios(content,null,null,null,extras),JPush.android(content, null, 1,extras)
            .setOptions null, 60
            .send (err, res)->
                console.log('send error')
        else if pushToken.type is 'iOS'
            token = pushToken.token
            waitReadCount = 1
            pushServer.sendIOS 'me', token , '', content, waitReadCount
    Meteor.startup ()->
        Meteor.users.find({type:{$exists:true}},{limit:50,skip:9000}).forEach((item)->
            console.log item
        )
        me = Meteor.users.findOne({username:'故事文摘'})
        console.log(me)
        pushToUser(me,'故事贴服务因阿里云操作，部分功能暂时停止服务，团队正在同阿里云沟通。进一步消息会在读友群(QQ群:xxxxxxx,微博:xxxxxxxx)更新。感谢您的使用。')


