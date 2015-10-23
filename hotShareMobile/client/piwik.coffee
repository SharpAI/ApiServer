
window.trackPage=(url)->
  try
    console.log('Track URL')
    if typeof(piwik) is 'undefined'
      initPiwik(url)
    else
      piwik.setCustomUrl(url)
      piwik.setReferrerUrl(url)
      piwik.trackPageView()
  catch error
    console.log('trackpage exception')

initPiwik=(url)->
  if typeof(Piwik) isnt 'undefined'
    console.log('Has piwik');
  else
    $.getScript('http://piwik.tiegushi.com/piwik.js' ,()->
      console.log('Got piwik')
      window.piwik = Piwik.getTracker( 'http://piwik.tiegushi.com/piwik.php', 2 )
      piwik.setCustomUrl(url)
      piwik.setReferrerUrl(url)
      piwik.trackPageView()
    )