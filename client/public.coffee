#公共函数
@PUB =
    # 该方法实现页面切换
    'page':(pageName)->
        history = Session.get("history_view")
        view = Session.get("channel")
        if history is undefined or history is ""
            history = new Array()
        #footerPages = ['/home', '/search', '/add', '/bell', '/user']
        footerPages = ['home', 'search', 'bell', 'user']
        #if current view is one of footer pages, and record the position of these pages
        for page in footerPages
            if view is page
                Session.set 'document_body_scrollTop_'+view, document.body.scrollTop
                break
        #if pageName is one of footer pages, we will clear history and need to return back to the last position
        Session.set 'document_body_scrollTop', 0
        for page in footerPages
            if pageName is page
                history = []
                value = Session.get 'document_body_scrollTop_'+page
                if value is undefined
                    value = 0
                Session.set 'document_body_scrollTop', value
                break
        unless view is undefined or view is ""
            if history.length > 0 and view is history[history.length-1].view
                history[history.length-1].scrollTop = document.body.scrollTop
            else
                history.push {
                    view: view
                    scrollTop: document.body.scrollTop
                }
            Session.set "history_view", history
        #if Session.get('view') isnt 'partner_detail' and Session.get('view') isnt 'add_partner'
        #    Session.set 'referrer',Session.get('view')
#        Meteor.setTimeout ->
#            document.body.scrollTop = 0
#            350
#        Session.set 'view',pageName
        Router.go(pageName)
        return
    # 返回上一页
    'back':->
        history = Session.get("history_view")
        unless history is undefined or history is ""
            if history.length > 0
                page =  history.pop()
                Session.set "document_body_scrollTop", page.scrollTop
                Session.set "history_view", history
                #Session.set "view", page.view
                if page.view is 'addPost'
                    Router.go('/add')
                else if page.view is 'home'
                    Router.go('/')
                else
                    Router.go(page.view)
        #nowPage = Session.get('view')
        #Session.set 'view',Session.get('referrer')
        #if nowPage isnt 'partner_detail' and nowPage isnt 'add_partner'
        #    Session.set 'referrer',nowPage
        return
    'toast':(msg)->
        try
            window.plugins.toast.showLongBottom(msg)
        catch error
            alert msg
    "confirm":(msg, callback)->
        try
            navigator.notification.confirm(
                msg
                (index)->
                    if index is 1
                       callback
                '提示'
                ['确定','取消']
            )
        catch error
            if confirm(msg)
                callback
                
#       可以浏览图片，放大，缩小，下一张
#        items 格式
#        items = [
#            {src: '/home/111.jpg',w: 300,h: 350},
#            {src: '/home/112.jpg',w: 300,h: 450}
#          ]
#    "photos":(items)->
#        window.openPhotoSwipe(items)