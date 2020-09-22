@showScanTipHint = new ReactiveVar(false)

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
  @checkNewVersion2 = ->
    platform = if Blaze._globalHelpers.isIOS() then 'ios' else (if Blaze._globalHelpers.isAndroid() then 'android' else 'others')
    HTTP.get(version_host_url,(err,result)->
      if err
        console.log(err)
        return
      data = result.data
      console.log(data)
      currentVersion = version_of_build
      if platform is 'ios'
        stableVersion = data.stable_ios
        latestVersion = data.latest_ios
        stableRelease = data.stable_release_ios
        latestRelease = data.latest_release_ios
      if platform is 'android'
        stableVersion = data.stable_android
        latestVersion = data.latest_android
        stableRelease = data.stable_release_android
        latestRelease = data.latest_release_android
      window.localStorage.setItem('stableVersion',stableVersion)
      window.localStorage.setItem('latestVersion',latestVersion)
      if window.compareVersions(currentVersion,stableVersion)
        # 强制升级
        window.updateAPPVersion(data.stable_title,stableRelease, data.stable_styles,false)
      else if window.compareVersions(currentVersion, latestVersion) < 0
        updateTipTimes = window.localStorage.getItem('stable_update_tip_times')
        if !updateTipTimes
          window.localStorage.setItem('stable_update_tip_times',1)
        window.localStorage.setItem('stable_update_tip_times',Number(updateTipTimes)+1)
        if updateTipTimes and updateTipTimes%data.latest_times is 0
          window.updateAPPVersion(data.latest_title,latestRelease, data.latest_styles,true)
    )
  @checkNewVersion = ->
    platform = if Blaze._globalHelpers.isIOS() then 'ios' else (if Blaze._globalHelpers.isAndroid() then 'android' else 'others')
    # version = Versions.findOne({})
    if !window.localStorage.getItem("latestVersion")
      console.log 'no localStorage latestVersion.'
      window.localStorage.setItem("latestVersion", version_of_build)
    # if version and version[platform]
    #   latestVersion = version[platform]
    # else
    #   latestVersion = version_of_build
    latestVersion =  window.localStorage.getItem("latestVersion")
    _latestVersion = toNum(latestVersion)
    _version_of_build = toNum(version_of_build)
    # _localLatestVersion = toNum(window.localStorage.getItem("latestVersion"))

    # if _latestVersion > _version_of_build and _latestVersion > _localLatestVersion
    if _latestVersion > _version_of_build
      # window.localStorage.setItem("latestVersion", latestVersion)
      console.log 'set latestVersionAlert true. '
      # Session.set('latestVersionAlert', true) # 使用新的升级提醒
    else
      Session.set('latestVersionAlert', false)

    if _latestVersion > _version_of_build
      console.log '有新版本：' + _latestVersion
      return true
    if _latestVersion <= _version_of_build
      console.log '当前版本已是最新版本！'
      return false
  @goToUpdate = ->
    if Blaze._globalHelpers.isIOS()
      cordova.InAppBrowser.open('https://itunes.apple.com/app/gu-shi-tie/id957024953', '_system')
    else
      cordova.InAppBrowser.open('http://a.app.qq.com/o/simple.jsp?pkgname=org.hotshare.everywhere', '_system')
  
  Template.home.onRendered ()->
    # 首页数据直接在首页订阅，不需要等mqtt连接成功，提升首页打开速度
    Meteor.subscribe 'get-my-group', Meteor.userId()

    if !localStorage.getItem('scantipFlag')
      maskDescription.set({
        maskEllipse: false,
        x: '31%',
        y: '100%',
        width: '50',
        height: '50',
        trsx: 0,
        trsy: -50,
        scantipContainerStyle: "position: absolute; bottom: 0px; width: 100%; height: 150px;",
        iconClass: 'fa fa-3x fa-hand-o-down',
        iconStyle: 'display: block; position: absolute; bottom: 60px; left: 31%;',
        spanStyle: 'display: block; font-size: 18px; position: absolute; bottom: 110px; left: 20%;',
        spanContent: '点击时间轴查看设备在线状态'
      })

      currentTip = 'timeLineTab'
      showScanTipHint.set(true)

  Template.home.helpers
    wasLogon:()->
      Session.get('persistentLoginStatus')
    isCordova:()->
      Meteor.isCordova
    isFirstLog:()->
      Session.get('isFlag');
    isAndroid:()->
      isAndroidFunc()
    showDailyReporterTip:()->
      if localStorage.getItem('hideDailyReporterTip') is 'true'
        return false
      else
        return true
    showScanTipHintTemplate:()->
      showScanTipHint.get()

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
    'click .dailyReporterTip':(event)->
      localStorage.setItem('hideDailyReporterTip', 'true')
      $('.dailyReporterTip').fadeOut()
  Template.home.rendered=->
    flag = window.localStorage.getItem("firstLog") == 'first'
    Session.set('isFlag', !flag)
    checkNewVersion()

# Tracker.autorun((t)->
#   if !Session.get('isFlag') and Session.get('latestVersionAlert')
#     t.stop()
#     setTimeout(()->
#       Dialogs.alert('我们已为您备好更有趣新版本，记得去更新哦~', null, '新版本提示', '好的')
#     , 1000)
# );
