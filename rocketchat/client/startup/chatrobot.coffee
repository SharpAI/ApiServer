
if Meteor.isClient
    idleMessageInterval = null
    timeIn = Date.now()
    idleMessageIntervalSec = 30000
    mystate = null
    sendPersonalMessageToRoom = (message)->
        if ChatRoom.findOne()
            ChatMessage.insert {
                t: 'bot'
                msg: message
                rid: ChatRoom.findOne()._id
                ts: new Date()
                u: {
                    _id: 'group.cat'
                    username: 'GS'
                    name: '故事贴小秘'
                }
            }
    idleMessage = ()->
        console.log('idleMessage')
        duration = parseInt((Date.now() - timeIn)/1000)
        sendPersonalMessageToRoom('您已经进入房间 ' + duration + ' 秒')
    startIdleMessage = ()->
        console.log('startIdleMessage')
        if !idleMessageInterval
            idleMessageInterval = setInterval(idleMessage,idleMessageIntervalSec)
    stopIdleMessage = ()->
        console.log('stopIdleMessage')
        if idleMessageInterval
            clearInterval(idleMessageInterval)
            idleMessageInterval = null
    restartIdleMessage = ()->
        console.log('restartIdleMessage')
        if !idleMessageInterval
            idleMessageInterval = setInterval(idleMessage,idleMessageIntervalSec)
        else
            stopIdleMessage()
            startIdleMessage()

    Meteor.startup ->
        Meteor.call 'getPostInfo','mypostid',(err,data)->
            if !err and data
                console.log data
        Tracker.autorun (t)->
            if Meteor.user() and amplify.store('hotshareUserID')
                t.stop()
                Meteor.call 'getMyState',amplify.store('hotshareUserID'),(err,list)->
                    console.log('Got my list: '+list)
                console.log('HotShare ID is '+amplify.store('hotshareUserID'))
        Tracker.autorun ()->
            if MsgTyping.selfTyping.get()
                console.log('Need stop interval since typing')
                stopIdleMessage()
            else
                console.log('not typing now')
                restartIdleMessage()
        Tracker.autorun ()->
            if ChatMessage.findOne({t:{$ne:'bot'}},{sort:{ts:-1}},{fields:{ts:1}})
                console.log('New message arrived')
                restartIdleMessage()
        Tracker.autorun ()->
            if onlineUsers != (_.size(RoomManager.onlineUsers.get())-1)
                onlineUsers = (_.size(RoomManager.onlineUsers.get())-1)
                console.log('Online member: '+(_.size(RoomManager.onlineUsers.get())-1))
