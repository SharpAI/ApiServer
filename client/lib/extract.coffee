#
# This file is based on readabiity.js:
# http://code.google.com/p/arc90labs-readability/
#
# Copyright (c) 2010 Arc90 Inc
# Copyright (c) 2011 MORITA Hajime
# This software is licensed under the Apache License, Version 2.0.
#
keepImagesForSpecialMobileSite = false
removeStyle = true
class Log
  this.print = (message) -> console.log(message)
  this.error = (message) -> console.log(message)
  this.log = (message) -> console.log(message)
  this.debug = (message) -> console.log(message)


class Score
  constructor: (node) ->
    this.value = Score.initialScoreFor(node.tagName)

  add: (n) -> this.value += n
  scale: (s) -> this.value *= s

  this.initialScoreFor = (tagName) ->
    switch tagName
      when 'DIV' then 5
      when 'IFRAME' then 15
      when 'BLOCKQUOTE' then 15
      when 'PRE', 'TD' then 3
      when 'ADDRESS', 'OL', 'UL', 'DL', 'DD', 'DT', 'LI', 'FORM' then -3
      when 'H2', 'H3', 'H4', 'H5' then -5
      else 0

REGEXPS =
  unlikelyCandidates:    /combx|comment|community|disqus|extra|foot|header|menu|remark|rss|shoutbox|sidebar|sponsor|ad-break|agegate|pagination|pager|popup|tweet|twitter/i,
  okMaybeItsACandidate:  /and|article|body|column|main|shadow/i,  okMaybeItsACandidate:  /and|article|body|column|main|shadow/i,
  positive: /iframe|article|body|content|entry|hentry|main|page|pagination|post|text|blog|story|rich_media_content/i,
  negative: /combx|comment|com-|contact|foot|footer|footnote|masthead|media|meta|outbrain|promo|related|scroll|shoutbox|sidebar|sponsor|shopping|tags|tool|widget|js_profile_qrcode|rich_media_meta_list|profile_inner/i,
  extraneous:       /print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single/i,
  divToPElements:   /<(a|blockquote|dl|div|img|ol|p|pre|table|ul)/i,
  replaceBrs:       /(<br[^>]*>[ \n\r\t]*){2,}/gi,
  replaceFonts:     /<(\/?)font[^>]*>/gi,
  trim:             /^\s+|\s+$/g,
  normalize:        /\s{2,}/g,
  killBreaks:       /(<br\s*\/?>(\s|&nbsp;?)*){1,}/g,
  videos:           /http:\/\/(www\.)?(youtube|vimeo)\.com/i,
  skipFootnoteLink: /^\s*(\[?[a-z0-9]{1,2}\]?|^|edit|citation needed)\s*$/i,
  nextLink:         /(next|weiter|continue|>([^\|]|$)|ﾂｻ([^\|]|$))/i, # Match: next, continue, >, >>, ﾂｻ but not >|, ﾂｻ| as those usually mean last.
  prevLink:         /(prev|earl|old|new|<|ﾂｫ)/i,
  specialTags:      /blockquote|section/i,
  possibleVideoTags: /iframe|data-video/i,
  specialClass:     /note-content|rich_media_content|WBA_content/i

specialClassNameForPopularMobileSite = [
  '.note-content' # Douban
  '.rich_media_content' # Wechat
  '.WBA_content' # Weibo
  '#cont-wrapper' # 豆瓣FM
  '#j-body' # 企鹅FM 
  '.article' # 悦读FM 
  '.main_box' # QQ 音乐
  '#page-content'   #xueqiu
  '#BODYCON'        #tripadvisor
  '.yaow > p'  #news.ifeng.com
  #'.pulse-article'    #Linkedin
  '.page-wrap'  # businessinsider.com
]

specialClassNameExcludeMobileSites = [
  'techcrunch.com'
]

specialMobileSiteForImages = [
  'medium.com'
  'techcrunch.com'
]

beforeExtractConfig = [
  # 微信凤凰读书诗歌的例外处理。
  # {
  #   enable: (url, data)->
  #     $page = $(data.body)
  #     if $page.find('.rich_media_content').length <= 0
  #       return false
  #     if $page.find(".rich_media_content > section > section:last > section > section:last > section > section > section").length <= 0
  #       return false
  #     return true
  #   extract: (url, data)->
  #     $page = $(data.body)
  #     $sction = $page.find(".rich_media_content > section > section:last > section > section:last > section > section")
  #     $sction.each ()->
  #       $(this).html('<p>'+$(this).text()+'</p>')
      
  #     data.body = ''
  #     _.map $page[0].parentNode.childNodes, (node)->
  #       data.body += node.outerHTML
  #     data.bodyLength = data.body.length
  # }
]

@onBeforeExtract = (url, data)->
  _.map beforeExtractConfig, (config)->
    if config.enable(url, data)
      config.extract(url, data)

textContentFor = (node, normalizeWs = true) ->
  return "" unless node.textContent
  text = node.textContent.replace(REGEXPS.trim, "")
  text = text.replace(REGEXPS.normalize, " ") if normalizeWs
  text

countChars = (node, ch) ->
  textContentFor(node).split(ch).length - 1

linkDensityFor = (node) ->
  linkLength = _.reduce($(node).find("a"), ((len, n) -> len + n.innerHTML.length), 0)
  if (node and node.innerHTML and node.innerHTML.length)
    textLength = node.innerHTML.length
  else
    return 1
  linkLength/textLength

classWeight = (node) ->
  weight = 0
  if node.className
    weight -= 25 if -1 < node.className.search(REGEXPS.negative)
    weight += 25 if -1 < node.className.search(REGEXPS.positive)
  if node.id
    weight -= 25 if -1 < node.id.search(REGEXPS.negative)
    weight += 25 if -1 < node.id.search(REGEXPS.positive)
  weight

fishy = (node) ->
  if node.tagName == 'iframe' || $(node).find('iframe').length > 0
    console.log('fishy on iframe')
    return false
  theNode = if $(node).parent() then $(node).parent() else $(node)
  if (node.id is 'mediaPlayer' and node.getAttribute('data-video') isnt null) or theNode.find('#mediaPlayer').length > 0
    console.log('fishy on mediaPlayer')
    return false
  weight = classWeight(node)
  contentScore = if node.score then node.score.value else 0
  return false if 10 <= countChars(node, ',')
  nj = $(node)
  p      = nj.find("p").length
  img    = nj.find("img").length
  li     = nj.find("li").length - 100
  input  = nj.find("input").length
  embed  = nj.find("embed").length
  linkDensity   = linkDensityFor(node)
  contentLength = textContentFor(node).length

  if keepImagesForSpecialMobileSite
    return false if img > 0
  return true if weight + contentScore < 0
  #return true if img > p
  return true if li > p and node.tagName != "ul" and node.tagName != "ol"
  return true if input > Math.floor(p/3)
  return true if contentLength < 25 and (img == 0 || img > 2)
  return true if weight < 25 && linkDensity > 0.2
  return true if weight >= 25 && linkDensity > 0.5
  return true if (embed == 1 && contentLength < 75) || embed > 1
  false

deepInsideThislayer = (node,tagName)->
  childrenNumber=$(node).children().length
  if childrenNumber > 0 and childrenNumber <=2
    firstChild = $(node).find(':first-child').get(0)
    if firstChild and firstChild.tagName is tagName
      return deepInsideThislayer(firstChild,tagName)
  return node
# Turn all divs that don't have children block level elements into p's
# TODO(omo): support experimental parify text node
parify = (node) ->
  ###
  if node.tagName.search(REGEXPS.specialTags) > -1
    newNode = deepInsideThislayer(node,node.tagName)
    if newNode
      console.log('we got you')
      node.parentNode.replaceChild(newNode, node)
      return newNode
  ###
  return node if node.tagName != "DIV"
  return node if node.innerHTML.search(REGEXPS.divToPElements) > -1
  p = $("<p>").html(node.innerHTML)[0]
  node.parentNode.replaceChild(p, node)
  p

ensureScore = (array, node) ->
  return if !node or typeof(node.tagName) == 'undefined'
  if not node.score
    node.score = new Score(node)
    console.log('Node tag ' + node.tagName + ' class ' + node.className + ' id ' + node.id + ' score value ' + node.score.value)
    array.push(node)

propagateScore = (node, scoredList, score) ->
  parent = node.parentNode
  if parent
    ensureScore(scoredList, parent)
    parent.score.add(score)
    grandParent = parent.parentNode
    if grandParent and grandParent.score
      ensureScore(scoredList, grandParent)
      grandParent.score.add(score/2)

scoreNode = (node) ->
  #if node.tagName == "IFRAME"
  #  console.log('scoreNode on IFRAME +15')
  #  return 15
  #if node.className && node.className.search(REGEXPS.specialClass)
  #  console.log('the main class of mainstream web for mobile. bingo')
  #  return 250
  if node.tagName == "IMG"
    if $(node).parent() and $(node).parent().hasClass('article-cover')
      if $(node).parent().parent() and $(node).parent().parent().hasClass('article-header')
        return 99999
  unlikely = node.className + node.id
  if unlikely.search(REGEXPS.unlikelyCandidates) != -1 and \
     unlikely.search(REGEXPS.okMaybeItsACandidate) == -1 and \
     node.tagName != "BODY"
    return 0
  unless node.tagName == "P" || node.tagName == "TD" || node.tagName == "PRE"
    return 0
  text = textContentFor(node)
  return 0 if text.length < 25
  # Add points for any commas within this paragraph
  # For every 100 characters in this paragraph, add another point. Up to 3 points.
  1 + text.split(',').length + Math.min(Math.floor(text.length / 100), 3)

reduceScorable = (scoredList, node) ->
  score = scoreNode(node)
  if node.tagName == 'IFRAME'
    console.log('reduceScoreable on IFRAME ' + score)
  propagateScore(node, scoredList, score) if 0 < score
  scoredList

isAcceptableSibling = (top, sib) ->
  return true if top == sib
  if sib.innerHTML.search(REGEXPS.specialTags) > -1
    console.log('Sib of ' + sib.tagName + ' has specialTags')
    return true
  if sib.innerHTML.search(REGEXPS.possibleVideoTags) > -1
    console.log('sib contain video tags ' + sib.tagName)
    return true
  threshold = Math.max(10, top.score.value * 0.2)
  return true if threshold <= scoreSibling(top, sib)
  return false if "P" != sib.tagName
  #density = linkDensityFor(sib)
  text = textContentFor(sib)
  textLen = text.length
  return true if 80 < textLen #and density < 0.25
  #return true if textLen < 80 and density == 0 and text.search(/\.( |$)/) != -1
  false

scoreSibling = (top, sib) ->
  return 0 if !sib.score
  if sib.className == sib.className && sib.className != ""
    sib.score.value + (top.score.value * 0.2)
  else
    sib.score.value

removeFragments = (node) ->
  jn = $(node)
  jn.html(jn.html().replace(REGEXPS.killBreaks,'<br />'))
  jn.find("h1,h2,h3").find(
    (n) -> classWeight(n) < 0 #or linkDensityFor(n) > 0.33
  ).remove()
  if removeStyle
    jn.find("*").removeAttr("style")
  jn.find("p").filter(-> \
    0 == $(this).find("img").length and \
    0 == $(this).find("embed").length and \
    0 == $(this).find("object").length and \
    0 == $(this).find("iframe").length and \
    0 == textContentFor(this, false).length).remove()
  jn.find("form").filter(-> fishy(this)).remove()
  jn.find("table").filter(-> fishy(this)).remove()
  jn.find("ul").filter(-> fishy(this)).remove()
  jn.find("div").filter(-> fishy(this)).remove()
  jn.find("noscript").filter(-> fishy(this)).remove()
  if removeStyle
    jn.find("object,h1,script,link,iframe,style").remove()
  else
    jn.find("object,h1,script,iframe,link").remove()
  jn.find("h2").remove() if jn.find("h2").length == 1
  node.innerHTML = node.innerHTML.replace(/<br[^>]*>\s*<p/gi, '<p')
removeUnwanted = (node) ->
  jn = $(node)
  jn.html(jn.html().replace(REGEXPS.killBreaks,'<br />'))
  if removeStyle
    jn.find("*").removeAttr("style")
  if removeStyle
    jn.find("object,h1,script,link,style").remove()
  else
    jn.find("object,h1,script,link").remove()
  #node.innerHTML = node.innerHTML.replace(/<br[^>]*>\s*<p/gi, '<p')
asTop = (page) ->
  Log.log("not found. using page element")
  page.score = new Score(page)
  page

scoreAndSelectTop = (nodes) ->
  scored = _.reduce(nodes, reduceScorable, [])
  #_.each(scored, (n) => n.score.scale(1 - linkDensityFor(n)))
  #_.sortBy(scored, (n) -> n.score.value)[scored.length-1]
  sortArray = _.sortBy(scored, (n) -> n.score.value)
  id = scored.length-1
  while id >= 0 and sortArray[id].score.value == 99999
    id--
  topId = scored.length-1
  if id >= 0 and id != scored.length-1
    $(sortArray[id]).prepend($(sortArray[scored.length-1]))
    topId = id
  sortArray[topId]

collectSiblings = (top) ->
  _.reduce(
    if top.parentNode then $(top.parentNode).children() else $(top).children()
    ((root, s) =>
      root.appendChild(s) if isAcceptableSibling(top, s)
      root),
    document.createElement("div"))
collectNodeSibling=(node)->
  el=node.nextSibling
  count=0
  while (el)
    console.log(count+' Self.nextSibling Tag is '+el.tagName+' my text '+
        textContentFor(node)+' siblingNode text'+textContentFor(el)+
        ' siblingNode is text node '+(el.nodeType is Node.TEXT_NODE))
    next=el.nextSibling
    if el.tagName is 'BR'
      console.log('Has BR')
      node.textContent=node.textContent+'\n'
      node.parentNode.removeChild(el)
    else if el.tagName is 'SPAN'
      text=textContentFor(el)
      if text
        console.log('Hit SPAN'+text)
        node.textContent=node.textContent+text
      node.parentNode.removeChild(el)
    else if el.nodeType is Node.TEXT_NODE
      text=textContentFor(el)
      console.log('Hit TEXT_NODE'+text)
      if text
        node.textContent=node.textContent+text
        node.parentNode.removeChild(el)
    else
      console.log('Stop processing')
      return false
    el = next;
    count++
  return true
getCalculatedStyle=(node,prop)->
  try
    $node=$(node)
    while($node.parent().length>0)
      attr=$node.parent().css(prop)
      if attr and attr isnt ''
        return attr
      $node=$node.parent()
  catch error
    return null
  return null
getSpecialTag=(node,specialTagName)->
  try
    $node=$(node)
    while($node.parent().length>0)
      tagName=$node.parent().get(0).tagName
      if tagName and tagName isnt '' and tagName.toLowerCase() is specialTagName
        return true
      $node=$node.parent()
  catch error
    return false
  return false
cloneWithoutSibling=(parentNode, node)->
  if parentNode is null or parentNode is undefined
    return null
  $parentNode=$(parentNode)
  $cloneParent=$parentNode.clone().empty()
  $cloneParent.append($(node).clone())
  return $cloneParent.get(0)
@extractScript = (page, getMusic)->
  parified = _.map($('<div>'+page.innerHTML+'</div>').find('*'), parify)
  for item in $(parified)
    if(item.tagName is 'SCRIPT')
      musicInfo = getMusic(item)
      if musicInfo
        console.log('Got Music Info '+JSON.stringify(musicInfo))
        musicElement = document.createElement("musicExtracted")
        musicElement.setAttribute('playUrl', musicInfo.playUrl)
        musicElement.setAttribute('image', musicInfo.image)
        musicElement.setAttribute('songName', musicInfo.songName)
        musicElement.setAttribute('singerName', musicInfo.singerName)
          
        newRoot = document.createElement("div")
        newRoot.appendChild(musicElement)
        newRoot.id = 'hotshare_special_tag_will_not_hit_other'
        return newRoot
  
  newRoot = document.createElement("div")
  newRoot.id = 'hotshare_special_tag_will_not_hit_other'
  return newRoot
@extract = (page) ->
  parified = _.map($(page).find('*'), parify)
  documentBody = document.createElement('body')
  documentBody.innerHTML = page.innerHTML
  bodyParified = _.map($(documentBody).find('*'), parify) # -> body

  keepImagesForSpecialMobileSite = false
  console.log('  page.host = '+page.host)
  if page.host is specialMobileSiteForImages
    keepImagesForSpecialMobileSite = true

  for tag in specialClassNameForPopularMobileSite
    if page.host in specialClassNameExcludeMobileSites
      break
    rootNode = null
    
    if($(bodyParified).find(tag).length > 0) # 无法查找body下的第一层
      #item = $(bodyParified).find(tag)[0]
      #if item.tagName and item.tagName.toUpperCase() is 'IMG'
      #  continue
      rootNode = $(bodyParified).find(tag)[0]
    else
      for item in bodyParified
        if tag.indexOf('#') is 0
          if item.id is tag.substr(1)
            rootNode = item
            break
          else if item.parentNode.id is tag.substr(1)
            rootNode = item.parentNode
            break
        else if tag.indexOf('.') is 0
          if item.className is tag.substr(1)
            rootNode = item
            break
          else if item.parentNode.className is tag.substr(1)
            rootNode = item.parentNode
            break
        else
          if item.tagName is tag.toUpperCase()
            rootNode = item
            break
          else if item.tagName is tag.toUpperCase()
            rootNode = item.parentNode
            break

    console.log("rootNode =" + rootNode)
    if rootNode isnt null
      treeWalker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,
        {
          acceptNode : (node)->
            try
              try
                #if (node.nodeType isnt Node.TEXT_NODE)
                musicInfo = getMusicFromNode(node, documentBody)
                if musicInfo
                  return NodeFilter.FILTER_ACCEPT
              catch error
                console.log('getMusicFromNode Exception: ' + error)
              try
                if $(node).css("display") is 'none'
                  return NodeFilter.FILTER_REJECT
                if $(node).parent() and $(node).parent().css("display") is 'none'
                  return NodeFilter.FILTER_REJECT
              catch error
                console.log('Get Display Exception')
              unless node.hasChildNodes()
                if node.nodeType is Node.TEXT_NODE
                  if $(node).parent().length > 0
                    alignstyle=getCalculatedStyle(node,'text-align')
                    #console.log('Get parent style '+alignstyle);
                    if alignstyle and alignstyle isnt ''
                      storeStyleInItem(node.parentNode,'textAlign',alignstyle)
                  if collectNodeSibling(node) is false
                    return NodeFilter.FILTER_ACCEPT
                  #if node.parentNode and node.parentNode.tagName is 'SPAN'
                    #if node.parentNode.nextSibling
                    #  console.log('Parent nextSibling is '+node.parentNode.nextSibling.tagName+' my text '+
                    #      textContentFor(node)+' next text'+textContentFor(node.parentNode.nextSibling)+
                    #      ' next is text node '+(node.parentNode.nextSibling.nodeType is Node.TEXT_NODE))
                  #  collectNodeSibling(node.parentNode)
              return NodeFilter.FILTER_ACCEPT
            catch e
              return NodeFilter.FILTER_REJECT
            return NodeFilter.FILTER_REJECT
        },
        false
      )
      newRoot = document.createElement("div")
      nodeList = []
      while(treeWalker.nextNode())
        nodeList.push(treeWalker.currentNode)
      parentPNode = null;
      for node in nodeList
        unless node.hasChildNodes()
          if node.nodeType is Node.TEXT_NODE
            flag = 0
            level = 0
            tmpNode = node.parentNode;
            if parentPNode
              while level < 6 and tmpNode
                if tmpNode is parentPNode
                  flag = 1
                  break
                tmpNode = tmpNode.parentNode
                level++
            if flag
              if node.parentNode
                  alignstyle=$(node).parent().attr('hotshare-textAlign')
                  if alignstyle and alignstyle isnt ''
                    storeStyleInItem(parentPNode,'textAlign',alignstyle)
              if !node.parentNode or node.parentNode is parentPNode
                parentPNode.appendChild(node)
              else
                parentPNode.appendChild(node.parentNode)
            else
              if node.parentNode
                #newRoot.appendChild(node.parentNode)
                tmpParentNode = cloneWithoutSibling(node.parentNode, node)
                if getSpecialTag(node, "strong") or getSpecialTag(node, "h1") or getSpecialTag(node, "h2") or getSpecialTag(node, "h3")
                  storeStyleInItem(tmpParentNode, 'fontWeight', "bold")
                newRoot.appendChild(tmpParentNode)
              else
                p = document.createElement("P")
                p.appendChild(node)
            ###
            if node.parentNode
              if node.parentNode.tagName is 'P'
                span = document.createElement("SPAN")
                span.appendChild(node)
                alignstyle=getCalculatedStyle(node.parentNode,'text-align')
                if alignstyle and alignstyle isnt ''
                  storeStyleInItem(span, 'textAlign', alignstyle)
                newRoot.appendChild(span)
              else
                newRoot.appendChild(node.parentNode)
            else
              p = document.createElement("P")
              p.appendChild(node)
            ###
          else
            newRoot.appendChild(node)
        else if node.tagName is 'P'
          #p = document.createElement("P");
          newRoot.appendChild(node);
          parentPNode = node
      console.log('node length ' + nodeList.length)
      removeUnwanted(newRoot)
      newRoot.id = 'hotshare_special_tag_will_not_hit_other'
      return newRoot
  top = scoreAndSelectTop(parified) or asTop(page)
  root = collectSiblings(top)
  removeFragments(root)
  root

