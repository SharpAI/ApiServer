window.trackEvent=(category, action)->
  try
    console.log('Track Event')
    unless typeof(piwik) is 'undefined'
      piwik.trackEvent(category, action)
      piwik1.trackEvent(category, action)
  catch error
    console.log('trackevent exception')

window.trackPage=(url,title)->
  try
    console.log('Track URL')
    if typeof(piwik) is 'undefined'
      initPiwik(url,title)
    else
      piwik.setCustomUrl(url)
      piwik.setReferrerUrl(url)
      piwik.setDocumentTitle(title)
      piwik.trackPageView()

      piwik1.setCustomUrl(url)
      piwik1.setReferrerUrl(url)
      piwik1.setDocumentTitle(title)
      piwik1.trackPageView()
  catch error
    console.log('trackpage exception')

initPiwik=(url,title)->

  loadScript =  (url, callback)->
    jQuery.ajax({
      url: url,
      dataType: 'script',
      success: callback,
      async: true,
      cache: true
    });
  if typeof(Piwik) isnt 'undefined'
    console.log('Has piwik');
  else
    loadScript('http://piwik.tiegushi.com/piwik.js' ,()->
      console.log('Got piwik')
      window.piwik = Piwik.getTracker( 'http://piwik.tiegushi.com/piwik.php', 1 )
      piwik.setCustomUrl(url)
      piwik.setReferrerUrl(url)
      piwik.setDocumentTitle(title)
      piwik.trackPageView()

      window.piwik1 = Piwik.getTracker( 'http://piwik.tiegushi.com/piwik.php', 10 )
      piwik1.setCustomUrl(url)
      piwik1.setReferrerUrl(url)
      piwik1.setDocumentTitle(title)
      piwik1.trackPageView()
    )
