#space 2
if Meteor.isClient
  toNum = (a) ->
    if a is null or a is undefined or a is ''
      return
      
    c = a.split('.')
    num_place = [
      ''
      '0'
      '00'
      '000'
      '0000'
    ]
    r = num_place.reverse()
    i = 0
    while i < c.length
      len = c[i].length
      c[i] = r[len] + c[i]
      i++
    res = c.join('')
    res

  @checkNewVersion = ->
    platform = if Blaze._globalHelpers.isIOS() then 'ios' else (if Blaze._globalHelpers.isAndroid() then 'android' else 'others')
    version = Versions.findOne({})

    if version and version[platform]
      latestVersion = version[platform]
    else
      latestVersion = version_of_build
    _latestVersion = toNum(latestVersion)
    _version_of_build = toNum(version_of_build)
    _localLatestVersion = toNum(window.localStorage.getItem("latestVersion"))
    
    if _latestVersion > _version_of_build and _latestVersion > _localLatestVersion
      window.localStorage.setItem("latestVersion", latestVersion)
      Session.set('latestVersionAlert', true)
    else
      Session.set('latestVersionAlert', false)

    if _latestVersion > _version_of_build
      console.log '有新版本：' + _latestVersion
      return true
    if _latestVersion <= _version_of_build
      console.log '当前版本已是最新版本！'
      return false
  Template.home.helpers
    wasLogon:()->
      Session.get('persistentLoginStatus')
    isCordova:()->
      Meteor.isCordova
    isFirstLog:()->
      Session.get('isFlag');
  Template.home.events
    # 'click .top-series-btn': (event)->
    #    Router.go '/seriesList'
    # 'click #follow': (event)->
    #    Router.go '/searchFollow'
    # 'click .clickHelp':(event)->
    #   PUB.page '/help'
    'click .closebtn':()->
      $('.app-rate').fadeOut()
      promptForRatingWindowButtonClickHandler(2)
    'click .btn-rate1':()->
      $('.app-rate').fadeOut()
      promptForRatingWindowButtonClickHandler(3)
    'click .btn-rate2':()->
      $('.app-rate').fadeOut()
      promptForRatingWindowButtonClickHandler(3)
    'click #createNewChatGroups':(event)->
      Router.go('/group/add')
      #ScanBarcodeByBarcodeScanner()
    'click #addNewFriends':(event)->
      PUB.page '/searchFollow'
    'click #scanbarcode':(event)->
      ScanBarcodeByBarcodeScanner()

  Template.home.rendered=->
    flag = window.localStorage.getItem("firstLog") == 'first'
    Session.set('isFlag', !flag)
    checkNewVersion()

Tracker.autorun((t)->
  if !Session.get('isFlag') and Session.get('latestVersionAlert')
    t.stop()
    setTimeout(()->
      Dialogs.alert('我们已为您备好更有趣新版本，记得去更新哦~', null, '新版本提示', '好的')
    , 1000)
);
