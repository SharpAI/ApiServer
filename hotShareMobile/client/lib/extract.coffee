#
# This file is based on readabiity.js:
# http://code.google.com/p/arc90labs-readability/
#
# Copyright (c) 2010 Arc90 Inc
# Copyright (c) 2011 MORITA Hajime
# This software is licensed under the Apache License, Version 2.0.
#
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
  possibleVideoTags: /iframe/i,
  specialClass:     /note-content|rich_media_content|WBA_content/i

specialClassNameForPopularMobileSite = [
  '.note-content', # Douban
  '.rich_media_content', # Wechat
  '.WBA_content' # Weibo
]

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
  weight = classWeight(node)
  contentScore = if node.score then node.score.value else 0
  return true if weight + contentScore < 0
  return false if 10 <= countChars(node, ',')
  nj = $(node)
  p      = nj.find("p").length
  img    = nj.find("img").length
  li     = nj.find("li").length - 100
  input  = nj.find("input").length
  embed  = nj.find("embed").length
  linkDensity   = linkDensityFor(node)
  contentLength = textContentFor(node).length

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
  if removeStyle
    jn.find("object,h1,script,link,iframe,style").remove()
  else
    jn.find("object,h1,script,iframe,link").remove()
  jn.find("h2").remove() if jn.find("h2").length == 1
  node.innerHTML = node.innerHTML.replace(/<br[^>]*>\s*<p/gi, '<p')
asTop = (page) ->
  Log.log("not found. using page element")
  page.score = new Score(page)
  page

scoreAndSelectTop = (nodes) ->
  scored = _.reduce(nodes, reduceScorable, [])
  #_.each(scored, (n) => n.score.scale(1 - linkDensityFor(n)))
  _.sortBy(scored, (n) -> n.score.value)[scored.length-1]

collectSiblings = (top) ->
  _.reduce(
    $(top.parentNode).children(),
    ((root, s) =>
      root.appendChild(s) if isAcceptableSibling(top, s)
      root),
    document.createElement("div"))

@extract = (page) ->
  parified = _.map($(page).find('*'), parify)
  for tag in specialClassNameForPopularMobileSite
    if $(parified).find(tag).length > 0

      treeWalker = document.createTreeWalker(
        $(parified).find(tag)[0],
        NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,
        null,
        false
      )
      newRoot = document.createElement("div")
      nodeList = []
      while(treeWalker.nextNode())
        nodeList.push(treeWalker.currentNode)
      for node in nodeList
        unless node.hasChildNodes()
          if node.nodeType is Node.TEXT_NODE
            p = document.createElement("P")
            p.appendChild(node)
            newRoot.appendChild(p)
          else
            newRoot.appendChild(node)
      console.log('node length ' + nodeList.length)
      return newRoot
  top = scoreAndSelectTop(parified) or asTop(page)
  root = collectSiblings(top)
  removeFragments(root)
  root

