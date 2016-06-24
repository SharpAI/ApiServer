Template.topTosts.helpers
  # isShowTwice: ->
  #   if Session.equals('topTostsShowTimes',2)
  #     return true
  #   else 
  #     return false
  # isWeiXin: ->
  #   return true
  isIos: ->
    u = navigator.userAgent;
    isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    return isiOS