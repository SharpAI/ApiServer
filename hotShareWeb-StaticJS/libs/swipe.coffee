print = (msg) ->
  if false
    console.log msg

eventPrint = (msg) ->
  if false
    console.log msg

debugPrint = (msg) ->
  if false
    console.log msg

class ReactiveDict
  _names = [];
  _values = [];

  constructor: ()->
  set: (name, value)->
    index = _names.indexOf(name)
    if(index >= 0)
      return _values[index] = value
    _names.push(name)
    _values.push(value)

  get: (name)->
    index = _names.indexOf(name)
    if(index >= 0)
      return _values[index]
    return null

  equals: (name, value)->
    index = _names.indexOf(name)
    if(index >= 0)
      return _values[index] is value
    return false

class window.Swipe
  _template = null
  _pages = []
  constructor: (@templates, arrowKeys=true, @t) ->
    @t.Swiper = @
    _template = new template(@)
    _pages = []
# @templates is a list of template name strings that will be used by
# the Swiper

# Create a reactive dictionary so the current page can be a reactive variable
    @state = new ReactiveDict
    @state.set 'page', null
    # Handle the left and right pages manually. Otherwise every transition will trigger
    # multiple reactive autoruns
    @left =  null
    @right =  null
    # keep track of the previous page so we make make sure not to hide it so the
    # animations finish when the page drops.
    @previousPage = null
    # Keep track of the template this object is bound to so we can t.find specifically
    # within the template and manage template variables.
    # The template manages all the touch events and drag-swiping. The swiper manages
    # the pages.
    #@t = null # template

    self = @
    # When the window resizes, reposition the left and right
    $(window).resize ->
# set the width of the page so the template knows where to position
# the left and right pages
      self.t?.width = $(self.t?.find('.pages:first')).width()
      # do not animate the window resizing
      $(self.t.findAll('.animate')).removeClass('animate')
      # re-position the left and right pages.
      self.setLeft self.left
      self.setRight self.right

    # If we want to allow arrow keys to swipe, we need to register the arrow key
    # events
    if arrowKeys
      document.onkeydown = (e) ->
        if not e then e = window.event
        code = e.keyCode
        if code is 37
          event.preventDefault()
          # clear animations will immediately finish the previous animation
          # and moveLeft will execute the next animation
          self.clearAnimate()
          self.moveLeft()
        else if code is 39
          event.preventDefault()
          # clear animations will immediately finish the previous animation
          # and moveRight will execute the next animation
          self.clearAnimate()
          self.moveRight()

  clearAnimate: ->
    $(@t?.find('.animate')).removeClass('animate')

  animateAll: ->
    $(@t.find('.page')).addClass('animate')

  unanimate: (name) ->
    $(@t.find('.page.'+name + ':first')).removeClass('animate')

  animate: (name) ->
    $(@t.find('.page.'+name + ':first')).addClass('animate')

  animateRight: (name) ->
    $(@t.find('.page.'+name + ':first')).addClass('animate').css 'transform',
      'translate3d('+@t.width+'px,0,0)'

  animateLeft: (name) ->
    $(@t.find('.page.'+name + ':first')).addClass('animate').css 'transform',
      'translate3d(-'+@t.width+'px,0,0)'

  animateCenter: (name) ->
    $(@t.find('.page.'+name + ':first')).addClass('animate').css 'transform',
      'translate3d(0px,0,0)'

# set position regardless of animation
  displayRight: (name) ->
    $(@t.find('.page.'+name + ':first')).css('display', 'block').css 'transform',
      'translate3d('+@t.width+'px,0,0)'

  displayLeft: (name) ->
    $(@t.find('.page.'+name + ':first')).css('display', 'block').css 'transform',
      'translate3d(-'+@t.width+'px,0,0)'

  displayCenter: (name) ->
    $(@t.find('.page.'+name + ':first')).css('display', 'block').css 'transform',
      'translate3d(0px,0,0)'

  transitionRight: (name) ->
    print "transitionRight"
    @hidePage @previousPage
    @clearAnimate()
    # @hideAllBut @getPage(), name
    @setRight name
    self = @
    delay 0, ->
      self.moveRight()

  transitionLeft: (name) ->
    print "transitionLeft"
    @hidePage @previousPage
    @clearAnimate()
    # @hideAllBut @getPage(), name
    @setLeft name
    self = @
    delay 0, ->
      self.moveLeft()

  moveLeft: ->
    if @left
      print "moveLeft"
      @hideAllBut @getPage(), @left
      @unanimate @right
      # only animate the center and the left towards the right
      @animateRight @getPage()
      @animateCenter @left
      @setPage @left

  moveRight: ->
    if @right
      print "moveRight"
      @hideAllBut @getPage(), @right
      @unanimate @left
      # only animate the center and the left towards the right
      @animateLeft @getPage()
      @animateCenter @right
      @setPage @right

  onPageChanged: (func)->
    _pages.push(func)
  setPage: (name) ->
# this method will simply trigger any functions that autorun reactively on
# the current page. This assumes whatever function is calling it will
# take cre of any animations or transitions.
    @previousPage = @getPage()
    @state.set 'page', name
    for item in _pages
      item(@, name);

  hideAllBut: (names...) ->
    for item in @templates
      if names.indexOf(item) is -1
        @hidePage item
    # for n in _.partial(_.without, @templates).apply(this, names)
    #   @hidePage n

  hidePage: (name) ->
    $(@t.find('.page.'+name + ':first')).css('display', 'none')

  setInitialPage: (name) ->
# hide everything when placing the initial page
# the left and right should be unhidden later.
    for n in @templates
      if n isnt name then @hidePage n
    @setPage name
    # place this page in the center
    @displayCenter name

  # setTemplate: (t) ->
  #   @t = t

  getPage: () ->
    @state.get 'page'

  pageIs: (name) ->
# used as a reactive binding in an autorun to manage left and right pages
    @state.equals 'page', name

  setLeft: (name) ->
    @left =  name
    @displayLeft name

  setRight: (name) ->
    @right =  name
    @displayRight name

  drag: (posX) ->
    width = @t.width

    # Cant scroll in the direction where there is no page!
    if @left
# positive posx reveals left
      posX = Math.min(width, posX)
    else
      posX = Math.min(0, posX)

    if @right
# negative posx reveals right
      posX = Math.max(-width, posX)
    else
      posX = Math.max(0, posX)

    # update the page positions
    if @left
      $(@t.find('.page.'+@left + ':first')).css 'transform',
        'translate3d(-' + (width - posX) + 'px,0,0)'
    if @right
      $(@t.find('.page.'+@right + ':first')).css 'transform',
        'translate3d(' + (width + posX) + 'px,0,0)'

    $(@t.find('.page.'+@getPage() + ':first')).css 'transform',
      'translate3d(' + posX + 'px,0,0)'

  animateBack: () ->
# Animate all pages back into place
    @animate @left
    @animate @right
    @animate @getPage()

    if @left
      $(@t.find('.page.'+@left + ':first')).css 'transform',
        'translate3d(-' + @t.width + 'px,0,0)'

    if @right
      $(@t.find('.page.'+@right + ':first')).css 'transform',
        'translate3d(' + @t.width + 'px,0,0)'

    $(@t.find('.page.'+@getPage() + ':first')).css 'transform',
      'translate3d(0px,0,0)'

  leftRight: (left, right) ->
    debugPrint 'leftRight'
    center = @getPage()
    @setLeft left
    @setRight right

    # dont hide the old center to give it time to animate offscreen just in case
    # it is removed.
    dontHide = [left, center, right, @previousPage]
    hideThese = []
    for item in dontHide
      if @templates.indexOf(item) is -1
        hideThese.push(item)
    # hideThese = _.difference(@templates, dontHide)

    for name in hideThese
      @hidePage name


  shouldControl: ->
# don't register a click if the page is scrolled or being flicked.
    if @t.scrolling then return false
    speedX = 10*@t.velX
    flickX = @t.changeX + speedX
    speedY = 10*@t.velY
    flickY = @t.changeY + speedY
    Xok = Math.abs(flickX) <= 30 or Math.abs(@t.changeX) <= 10
    Yok = Math.abs(flickY) <= 30 or Math.abs(@t.changeY) <= 10
    return Xok and Yok


# These are effectively the same:

# click Swiper, 'page1', '.next', (e,t) ->
#   Swiper.moveRight()

# Template.page1.events
#   'mouseup .next': (e,t) ->
#     debugPrint e
#     Swiper.moveRight()
#
#   'touchend .next': (e,t) ->
#     if e.currentTarget is Swiper.element
#       Swiper.moveRight()

  # click: (tmp, selector, handler) ->
  #   Swiper = @
  #   mouseup = 'mouseup ' + selector
  #   touchend = 'touchend ' + selector
  #   eventMap = {}

  #   eventMap[mouseup] = (e,t) ->
  #     if Swiper.shouldControl() and not Swiper.t.touchDown
  #       eventPrint "mouseup control"
  #       handler.bind(@)(e,t)

  #   eventMap[touchend] = (e,t) ->
  #     if e.currentTarget is Swiper.element and Swiper.shouldControl()
  #       eventPrint "touchend control"
  #       e.stopPropagation()
  #       handler.bind(@)(e,t)

  #   if _template
  #     _template.events eventMap
  #   else
  #     debugPrint "WARNING: Template '" + tmp + "' not found."

  # register the page names to dynamically render each page
class template
  constructor: (@swiper) ->
    debugPrint('swipe tempate init');
    @rendered()
    
  # @helpers: 
  #   pageNames: -> _.map @Swiper?.templates, (name) -> {name: name}
  rendered: ->
    # keep track of the width so we know where to place pages to the left
    # and the right
    debugPrint('swipe tempate rendered');
    @swiper.t.width = $(@swiper.t.find('.pages:first')).width()

    debugPrint('swipe tempate events');
    for key, value of @events
      params = key.split(' ')
      debugPrint('on event:', params[0]);
      @swiper.t.find(params[1] + ':first').on(params[0], null, @swiper.t, value)
    # keep track of scrolling
    @swiper.t.mouseDown = false
    @swiper.t.touchDown = false
    @swiper.t.startX = 0
    @swiper.t.mouseX = 0
    @swiper.t.posX = 0
    @swiper.t.startY = 0
    @swiper.t.mouseY = 0
    @swiper.t.posY = 0

    # We need to keep track of whether the user is scrolling or swiping.
    @swiper.t.scrollableCSS = false
    @swiper.t.mightBeScrolling = false
    @swiper.t.scrolling = false
  events:
    'mousedown .pages': (e) ->
      t = e.data
      debugPrint(t);
      # if we're the user has already touched down, we want to ignore mouse events
      if t.touchDown
        return true

      eventPrint "mousedown"
      noSwipeCSS = targetInClass 'no-swipe', e.target

      unless noSwipeCSS
      # remove stop all animations in this swiper
        t.Swiper.clearAnimate()
        clickX = e.pageX
        clickY = e.pageY

        t.startX = clickX # beginning of the swipe
        t.mouseX = clickX # current position of the swipe
        t.startY = clickY # beginning of the swipe
        t.mouseY = clickY # current position of the swipe
        t.mouseDown = true # click swipe has begun
        t.touchDown = false

        return true

    'touchstart .pages': (e) ->
      t = e.data
      eventPrint "touchstart"

      noSwipeCSS = targetInClass 'no-swipe', e.target
      scrollableCSS = targetInClass 'scrollable', e.target

      # Check to see if the user touched inside of a scrollable div. If so,
      # then the user might be scrolling depending on whether he moves his finger
      # to the side to swipe or up and down to scroll. Once we have determined the
      # direction of the gesture, we can be certain of whether the user is scrolling
      # or not.
      if scrollableCSS
        t.scrollableCSS = true
        t.mightBeScrolling = true
        t.scrolling = false
      else
        t.scrollableCSS = false
        t.mightBeScrolling = false
        t.scrolling = false

      unless noSwipeCSS
  # keep track of what element the pointer is over for touchend
        x = e.originalEvent.touches[0].pageX - window.pageXOffset
        y = e.originalEvent.touches[0].pageY - window.pageYOffset
        target = document.elementFromPoint(x, y)
        t.Swiper.element = target

        # remove stop all animations in this swiper
        t.Swiper.clearAnimate()
        # key track of Y for calculating scroll
        clickX = e.originalEvent.touches[0].pageX
        clickY = e.originalEvent.touches[0].pageY
        t.startX = clickX # beginning of the swipe
        t.mouseX = clickX # current position of the swipe
        t.startY = clickY # beginning of the swipe
        t.mouseY = clickY # current position of the swipe
        # we must distinguish between mouse and touch because sometimes
        # touch will induce a click; touchend => mouseup
        t.mouseDown = false
        t.touchDown = true

      return true

    'mousemove .pages': (e) ->
      t = e.data
  # if the mouse is pressed, we need to keep track of the swipe.
  # note that you cannot scroll by clicking the mouse!
      if t.mouseDown
        eventPrint "mousemove"
        newMouseX = e.pageX
        oldMouseX = t.mouseX
        t.velX = newMouseX - oldMouseX
        t.changeX = newMouseX - t.startX
        posX = t.changeX + t.posX
        t.mouseX = newMouseX

        newMouseY = e.pageY
        oldMouseY = t.mouseY
        t.velY = newMouseY - oldMouseY
        t.changeY = newMouseY - t.startY
        posY = t.changeY + t.posY
        t.mouseY = newMouseY

        t.Swiper.drag(posX)

      return true

    'touchmove .pages': (e) ->
      t = e.data
      eventPrint "touchmove"
      noSwipeCSS = targetInClass 'no-swipe', e.target

      # If we're not sure if the user is scrolling or not, then we need to check to
      # see if the first motion is left-right, or up-down.
      if t.mightBeScrolling
  # keep track of what element the pointer is over for touchend
        x = e.originalEvent.touches[0].pageX - window.pageXOffset
        y = e.originalEvent.touches[0].pageY - window.pageYOffset
        target = document.elementFromPoint(x, y)
        t.Swiper.element = target

        newMouseX = e.originalEvent.touches[0].pageX
        oldMouseX = t.mouseX
        t.velX = newMouseX - oldMouseX
        t.changeX = newMouseX - t.startX
        posX = t.changeX + t.posX
        t.mouseX = newMouseX

        newMouseY = e.originalEvent.touches[0].pageY
        oldMouseY = t.mouseY
        t.velY = newMouseY - oldMouseY
        t.changeY = newMouseY - t.startY
        posY = t.changeY + t.posY
        t.mouseY = newMouseY

        speedX = 10*t.velX
        flickX = t.changeX + speedX

        speedY = 10*t.velY
        flickY = t.changeY + speedY

        # compute the relative angles of up-down or left-right
        if Math.abs(flickY*1.66) > Math.abs(flickX)
  # we've determined that the user is definitely scrolling
  # so we don't want to compute this all over again. on the next
  # touchmove, just compute the scroll position.
          t.mightBeScrolling = false
          t.scrolling = true
          return true
        else
  # if the user is swiping, not scrolling, we can set the appropriate values
          t.mightBeScrolling = false
          t.scrolling = false
          if noSwipeCSS
  # if you
            return true
          else
  # prevent the default scrolling functionality
            e.preventDefault()
            t.Swiper.drag(posX)
            return false
      else if t.scrolling
  # if we know the user is scrolling, we can just let the default
  # functionality handle it.
        return true
      else
        unless noSwipeCSS
  # if the user is swiping, then we need to prevent the default functionality
  # of scrolling.
          e.preventDefault()

          # keep track of what element the pointer is over for touchend
          x = e.originalEvent.touches[0].pageX - window.pageXOffset
          y = e.originalEvent.touches[0].pageY - window.pageYOffset
          target = document.elementFromPoint(x, y)
          t.Swiper.element = target

          newMouseX = e.originalEvent.touches[0].pageX
          oldMouseX = t.mouseX
          t.velX = newMouseX - oldMouseX
          t.changeX = newMouseX - t.startX
          posX = t.changeX + t.posX
          t.mouseX = newMouseX

          # keep track of y, so we know if the `shouldControl` and we can measure both
          # x and y directions.
          newMouseY = e.originalEvent.touches[0].pageY
          oldMouseY = t.mouseY
          t.velY = newMouseY - oldMouseY
          t.changeY = newMouseY - t.startY
          posY = t.changeY + t.posY
          t.mouseY = newMouseY

          t.Swiper.drag(posX)
        return false

    'mouseup .pages': (e) ->
      t = e.data
      if t.mouseDown
        eventPrint "mouseup"
        posX = t.changeX + t.posX
        momentum = Math.abs(10*t.velX)
        momentum = Math.min(momentum, t.width/2)
        momentum = momentum*sign(t.velX)
        distance = posX + momentum
        swipeControlCSS = targetInClass 'swipe-control', e.target
        # run the swiping event
        if swipeControlCSS and (e.target is t.Swiper.element) and t.Swiper.shouldControl()
          t.velX = 0
          t.startX = 0
          t.mouseX = 0
          t.changeX = 0
          t.velY = 0
          t.startY = 0
          t.mouseY = 0
          t.changeY = 0
          t.mouseDown = false
          return

        # otherwise, snap the page where it should go
        index = Math.round(distance / t.width)
        if index is -1
          t.Swiper.moveRight()
        else if index is 1
          t.Swiper.moveLeft()
        else
          t.Swiper.animateBack()

        t.velX = 0
        t.startX = 0
        t.mouseX = 0
        t.changeX = 0
        t.velY = 0
        t.startY = 0
        t.mouseY = 0
        t.changeY = 0
        t.mouseDown = false

    'touchend .pages': (e) ->
      t = e.data
      if t.touchDown
        eventPrint "touchend"

        posX = t.changeX + t.posX
        momentum = Math.abs(10*t.velX)
        momentum = Math.min(momentum, t.width/2)
        momentum = momentum*sign(t.velX)
        distance = posX + momentum

        swipeControlCSS = targetInClass 'swipe-control', e.target
        # run the swiping event
        if swipeControlCSS and (e.target is t.Swiper.element) and t.Swiper.shouldControl()
          t.velX = 0
          t.startX = 0
          t.mouseX = 0
          t.changeX = 0
          t.velY = 0
          t.startY = 0
          t.mouseY = 0
          t.changeY = 0
          t.touchDown = false
          return true

        index = Math.round(distance / t.width)
        if index is -1
          t.Swiper.moveRight()
        else if index is 1
          t.Swiper.moveLeft()
        else
          t.Swiper.animateBack()

        t.velX = 0
        t.startX = 0
        t.mouseX = 0
        t.changeX = 0
        t.velY = 0
        t.startY = 0
        t.mouseY = 0
        t.changeY = 0
        t.touchDown = false
      return true

targetInClass = (name, target) ->
  $(target).hasClass(name) or $(target).parentsUntil('body', '.' + name).length

sign = (x) ->
  if x >= 0 then return 1 else return -1

bound = (min, max, n) ->
  Math.min(Math.max(min, n), max)

wrap = (min, max, n) ->
  if n < min
    return max - (min - 1) - 1
  else if n > max
    return min + (n - max) - 1
  else
    return n


delay = (ms, func) -> setTimeout func, ms

debugPrint('swipe js.');