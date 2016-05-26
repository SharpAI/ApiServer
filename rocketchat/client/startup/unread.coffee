Meteor.startup ->
	# 这个方式可以后面整合到某个lib文件下，避免多个地方重复编写
	sendPersonalMessageWithURLToRoom = (message, url, title, description, mainImageUrl, roomName)->
	    url = if url? then url else 'http://www.tiegushi.com/'
	    alink = document.createElement 'a'
	    alink.href = url
	    currentRoomId = Session.get('openedRoom')

	    msg = {
	        t: 'bot'
	        msg: if message? then message else ''
	        rid: currentRoomId
	        ts: new Date()
	        u: {
	            _id: 'group.cat'
	            username: 'GS'
	            name: '故事贴小秘'
	        },
	        urls : [ 
	            {
	                "url" : ''+roomName, # 这边需要设置下 url 的格式和打开方式，　现在默认是　新窗口打开，聊天室的切换可以在统一页面切换
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
	                    #"host" : alink.host, #www.tiegushi.com
	                    "host" : window.location.hostname, #www.tiegushi.com
	                    "pathname" : alink.pathname, #/posts/NYtJcHfCKSE6GWhmj
	                    "protocol" : alink.protocol #http:
	                },
	                "roomAlert": true
	            }
	        ]            
	    } 

	    ChatMessage.insert msg

	handleMessageAlert = (roomName)->
		if roomName?
			Meteor.call 'getPostInfo',roomName,(err,data) ->
				if !err and data
					sendPersonalMessageWithURLToRoom('这个聊天室有新消息啦!\r\n点击链接去看看:', 'http://cdn.tiegushi.com/posts/'+data._id, data.title, data.addonTitle, data.mainImage, roomName)

	Tracker.autorun ->

		unreadCount = 0
		unreadAlert = false

		subscriptions = ChatSubscription.find({open: true}, { fields: { unread: 1, alert: 1, rid: 1, t: 1, name: 1, ls: 1 } })

		openedRoomId = undefined
		Tracker.nonreactive ->
			if FlowRouter.getRouteName() in ['channel', 'group', 'direct']
				openedRoomId = Session.get 'openedRoom'

		for subscription in subscriptions.fetch()
			if subscription.alert and subscription.unread > 0 and subscription.name isnt FlowRouter.current().params.name
				handleMessageAlert(subscription.name)
				
			if subscription.alert or subscription.unread > 0
				# This logic is duplicated in /client/notifications/notification.coffee.
				hasFocus = readMessage.isEnable()
				subscriptionIsTheOpenedRoom = openedRoomId is subscription.rid
				if hasFocus and subscriptionIsTheOpenedRoom
					# The user has probably read all messages in this room.
					# TODO: readNow() should return whether it has actually marked the room as read.
					Meteor.setTimeout ->
						readMessage.readNow()
					, 500

				# Increment the total unread count.
				unreadCount += subscription.unread
				if subscription.alert is true
					unreadAlert = '•'

			readMessage.refreshUnreadMark(subscription.rid)

		menu.updateUnreadBars()

		if unreadCount > 0
			if unreadCount > 999
				Session.set 'unread', '999+'
			else
				Session.set 'unread', unreadCount
		else if unreadAlert isnt false
			Session.set 'unread', unreadAlert
		else
			Session.set 'unread', ''

Meteor.startup ->

	window.favico = new Favico
		position: 'up'
		animation: 'none'

	Tracker.autorun ->
		siteName = RocketChat.settings.get 'Site_Name'

		unread = Session.get 'unread'
		fireGlobalEvent 'unread-changed', unread
		favico?.badge unread, bgColor: if typeof unread isnt 'number' then '#3d8a3a' else '#ac1b1b'
		document.title = if unread == '' then 'Group Chat' else '(' + unread + ') '+ 'Group Chat'
