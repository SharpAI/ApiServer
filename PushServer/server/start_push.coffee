
if Meteor.isServer
    Meteor.startup ()->
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
        Meteor.users.find({type:{$exists:true}},{limit:50,skip:9000}).forEach((item)->
            console.log item
        )
        me = Meteor.users.findOne({username:'故事文摘'})
        console.log(me)
        pushToUser(me,'谢谢使用故事帖！根据阿里云的通知（“违规类型：涉政类->政治人物“），故事帖暂停使用，接受处罚及整改（大约一周）。”每个人都是故事的主角“，无论如何，故事帖将会继续服务。敬请关注最新进展：
1）故事帖公共号；或 2）微信群；或 3）QQq群；或 4）Email')





