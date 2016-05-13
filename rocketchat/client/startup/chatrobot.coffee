
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

    sendPersonalMessageWithURLToRoom = (message, url, title, description, mainImageUrl)->
        url = if url? then url else 'http://www.tiegushi.com/'
        alink = document.createElement 'a'
        alink.href = url

        msg = {
            t: 'bot'
            msg: if message? then message else ''
            rid: ChatRoom.findOne()._id
            ts: new Date()
            u: {
                _id: 'group.cat'
                username: 'GS'
                name: '故事贴小秘'
            },
            urls : [ 
                {
                    "url" : url, #http://www.tiegushi.com/posts/NYtJcHfCKSE6GWhmj
                    "meta" : {
                        "ogSiteName" : "故事贴",
                        "ogTitle" : if title? then title else "", #千老这个称谓的来历
                        "ogUrl" :url, #http://www.tiegushi.com/posts/NYtJcHfCKSE6GWhmj
                        "ogImage" : if mainImageUrl? then mainImageUrl else "", #http://data.tiegushi.com/2Yfmd5PmEDsoECLvg_1459975484141_cdv_photo_001.jpg
                        "ogDescription" : if description? then description else "", #早点一咬牙一跺脚转CS，现在幸福日子望不到头呢！…
                        "ogType" : "article"
                    },
                    "headers" : {
                        "contentType" : "text/html; charset=utf-8"
                    },
                    "parsedUrl" : {
                        "host" : alink.host, #www.tiegushi.com
                        "pathname" : alink.pathname, #/posts/NYtJcHfCKSE6GWhmj
                        "protocol" : alink.protocol #http:
                    }
                }
            ]            
        } 

        ChatMessage.insert msg

    idleMessage = ()->
        console.log('idleMessage')
        duration = parseInt((Date.now() - timeIn)/1000)
        #sendPersonalMessageToRoom('您已经进入房间 ' + duration + ' 秒')
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
        Tracker.autorun (t)->
            if ChatRoom.findOne()
                t.stop()
                Meteor.call 'getPostInfo',ChatRoom.findOne().name,(err,data)->
                    if !err and data
                        ###
                        _id:"27ZRmEeXwkoFi6BZC"
                        createdAt:Thu May 28 2015 17:26:48 GMT-0700 (PDT)
                        mainImage:"http://data.tiegushi.com/yDDXttJznF72aR9kL_1432858306301_cdv_photo_002.jpg"
                        ownerName:"微尘"
                        ###
                        console.log data
                        document.title = data.title + ' - 聊天室'
                        window.trackPage(window.location.href,data.title)
                        sendPersonalMessageWithURLToRoom('欢迎来到本贴的专属聊天室，您可以点右上角转发链接到微信朋友圈，让更多的朋友加入聊天室参与匿名聊天。\r\n点击链接可以查看原文:',
                          'http://cdcdn.tiegushi.com/posts/'+data._id, data.title, data.addonTitle, data.mainImage)
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
