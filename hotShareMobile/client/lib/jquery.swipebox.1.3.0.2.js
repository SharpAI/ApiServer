/*! Swipebox v1.3.0.2 | Constantin Saguin csag.co | MIT License | github.com/brutaldesign/swipebox */

;( function ( window, document, $, undefined ) {

	$.swipebox = function( elem, options ) {

		// Default options
		var ui,
			defaults = {
				useCSS : true,
				useSVG : true,
				initialIndexOnArray : 0,
				hideCloseButtonOnMobile : false,
				hideBarsDelay : 3000,
				videoMaxWidth : 1140,
				vimeoColor : 'cccccc',
				beforeOpen: null,
				afterOpen: null,
				afterClose: null,
				loopAtEnd: false,
				autoplayVideos: false,
				indexChanged: options.indexChanged || null
			},

			plugin = this,
			elements = [], // slides array [ { href:'...', title:'...' }, ...],
			$elem,
			selector = elem.selector,
			$selector = $( selector ),
			isMobile = navigator.userAgent.match( /(iPad)|(iPhone)|(iPod)|(Android)|(PlayBook)|(BB10)|(BlackBerry)|(Opera Mini)|(IEMobile)|(webOS)|(MeeGo)/i ),
			isTouch = isMobile !== null || document.createTouch !== undefined || ( 'ontouchstart' in window ) || ( 'onmsgesturechange' in window ) || navigator.msMaxTouchPoints,
			supportSVG = !! document.createElementNS && !! document.createElementNS( 'http://www.w3.org/2000/svg', 'svg').createSVGRect,
			winWidth = window.innerWidth ? window.innerWidth : $( window ).width(),
			winHeight = window.innerHeight ? window.innerHeight : $( window ).height(),
			currentX = 0,
			/* jshint multistr: true */
			html = '<div id="swipebox-overlay">\
					<div id="swipebox-container">\
            <div id="swipebox-console"><i class="fa fa-times"></i></div>\
						<div id="swipebox-slider"></div>\
						<div id="swipebox-top-bar">\
							<div id="swipebox-title"></div>\
						</div>\
						<div id="swipebox-bottom-bar">\
							<div id="swipebox-arrows">\
								<a id="swipebox-prev"></a>\
								<a id="swipebox-next"></a>\
							</div>\
						</div>\
						<a id="swipebox-close"></a>\
					</div>\
			</div>';

		plugin.settings = {};

		$.swipebox.close = function () {
			ui.closeSlide();
		};

		$.swipebox.extend = function () {
			return ui;
		};

		plugin.init = function() {

			plugin.settings = $.extend( {}, defaults, options );

			if ( $.isArray( elem ) ) {

				elements = elem;
				ui.target = $( window );
				ui.init( plugin.settings.initialIndexOnArray );

			} else {

				$( document ).on( 'click', selector, function( event ) {

					// console.log( isTouch );

					if ( event.target.parentNode.className === 'slide current' ) {

						return false;
					}

					if ( ! $.isArray( elem ) ) {
						ui.destroy();
						$elem = $( selector );
						ui.actions();
					}

					elements = [];
					var index , relType, relVal;

					// Allow for HTML5 compliant attribute before legacy use of rel
					if ( ! relVal ) {
						relType = 'data-rel';
						relVal  = $( this ).attr( relType );
					}

					if ( ! relVal ) {
						relType = 'rel';
						relVal = $( this ).attr( relType );
					}

					if ( relVal && relVal !== '' && relVal !== 'nofollow' ) {
						$elem = $selector.filter( '[' + relType + '="' + relVal + '"]' );
					} else {
						$elem = $( selector );
					}

					$elem.each( function() {

						var title = null,
							href = null;

						if ( $( this ).attr( 'title' ) ) {
							title = $( this ).attr( 'title' );
						}


						if ( $( this ).attr( 'href' ) ) {
							href = $( this ).attr( 'href' );
						}

						elements.push( {
							href: href,
							title: title
						} );
					} );

					index = $elem.index( $( this ) );
					event.preventDefault();
					event.stopPropagation();
					ui.target = $( event.target );
					ui.init( index );
				} );
			}
		};

		ui = {

			/**
			 * Initiate Swipebox
			 */
			init : function( index ) {
				if ( plugin.settings.beforeOpen ) {
					plugin.settings.beforeOpen();
				}
				this.target.trigger( 'swipebox-start' );
				$.swipebox.isOpen = true;
				this.build();
				this.openSlide( index );
				this.openMedia( index );
				this.preloadMedia( index+1 );
				this.preloadMedia( index-1 );
				if ( plugin.settings.afterOpen ) {
					plugin.settings.afterOpen();
				}
			},

			/**
			 * Built HTML containers and fire main functions
			 */
			build : function () {
				var $this = this, bg;

				$( 'body' ).append( html );

				if ( supportSVG && plugin.settings.useSVG === true ) {
					bg = $( '#swipebox-close' ).css( 'background-image' );
					bg = bg.replace( 'png', 'svg' );
					$( '#swipebox-prev, #swipebox-next, #swipebox-close' ).css( {
						'background-image' : bg
					} );
				}

				if ( isMobile ) {
					$( '#swipebox-bottom-bar, #swipebox-top-bar' ).remove();
				}

				$.each( elements,  function() {
					$( '#swipebox-slider' ).append( '<div class="slide"></div>' );
				} );

				$this.setDim();
				$this.actions();

				if ( isTouch ) {
					$this.gesture();
				}

				// Devices can have both touch and keyboard input so always allow key events
				$this.keyboard();

				$this.animBars();
				$this.resize();

			},

			/**
			 * Set dimensions depending on windows width and height
			 */
			setDim : function () {

				var width, height, sliderCss = {};

				// Reset dimensions on mobile orientation change
				if ( 'onorientationchange' in window ) {

					window.addEventListener( 'orientationchange', function() {
						if ( window.orientation === 0 ) {
							width = winWidth;
							height = winHeight;
						} else if ( window.orientation === 90 || window.orientation === -90 ) {
							width = winHeight;
							height = winWidth;
						}
					}, false );


				} else {

					width = window.innerWidth ? window.innerWidth : $( window ).width();
					height = window.innerHeight ? window.innerHeight : $( window ).height();
				}

				sliderCss = {
					width : (width),
					height : (height)
				};

				$( '#swipebox-overlay' ).css( sliderCss );

			},

			/**
			 * Reset dimensions on window resize envent
			 */
			resize : function () {
				var $this = this;

				$( window ).resize( function() {
					$this.setDim();
				} ).resize();
			},

			/**
			 * Check if device supports CSS transitions
			 */
			supportTransition : function () {

				var prefixes = 'transition WebkitTransition MozTransition OTransition msTransition KhtmlTransition'.split( ' ' ),
					i;

				for ( i = 0; i < prefixes.length; i++ ) {
					if ( document.createElement( 'div' ).style[ prefixes[i] ] !== undefined ) {
						return prefixes[i];
					}
				}
				return false;
			},

			/**
			 * Check if CSS transitions are allowed (options + devicesupport)
			 */
			doCssTrans : function () {
				if ( plugin.settings.useCSS && this.supportTransition() ) {
					return true;
				}
			},

			/**
			 * Touch navigation
			 */
			gesture : function () {

				var $this = this,
					index,
					hDistance,
					vDistance,
					hDistanceLast,
					vDistanceLast,
					hDistancePercent,
					vSwipe = false,
					hSwipe = false,
					hSwipMinDistance = 10,
					vSwipMinDistance = 50,
					startCoords = {},
          scaleCoords = {},
          region = {},
          fixRegionSetTimeout = null,
					endCoords = {},
					bars = $( '#swipebox-top-bar, #swipebox-bottom-bar' ),
					slider = $( '#swipebox-slider' );

				bars.addClass( 'visible-bars' );
				$this.setTimeout();

        $('#swipebox-console').click(function (event) {
          event.preventDefault();
					event.stopPropagation();
          var _index = $( '#swipebox-slider .slide' ).index( $( '#swipebox-slider .slide.current' ) );
          
          $('#swipebox-slider .current .img-box').css({
            '-webkit-transition' : '-webkit-transform 0.4s ease',
            'transition' : 'transform 0.4s ease',
            '-webkit-transform' : 'translate3d(0px, 0px, 0px)',
            'transform' : 'translate3d(0px, 0px, 0px)'
          });
          $('#swipebox-slider .current img').css({
            '-webkit-transition' : '-webkit-transform 0.4s ease',
            'transition' : 'transform 0.4s ease',
            '-webkit-transform' : ''
          });
          $(this).css('display', 'none');
          
          $this.setSlide(_index, _index <= 0);
        });
				$( '#swipebox-slider' ).bind( 'touchstart', function( event ) {
          //$('#swipebox-console').html(event.originalEvent.targetTouches[0].pageX + ',' + event.originalEvent.targetTouches[0].pageY);
          //$('#swipebox-console').html('');

					// if(typeof StartZoom != 'undefined' && StartZoom>0)
					// {
					// 	return false;
					// }
          
					$( this ).addClass( 'touching' );
          
          //scale
					var $swipebox_slider = $('#swipebox-slider .current img');
          var img_style = null;//$('#swipebox-slider .current img')[0].style['-webkit-transform'];
					if($swipebox_slider.length > 0 && $swipebox_slider[0].style)
						img_style = $swipebox_slider[0].style['-webkit-transform'];
          if(img_style && img_style != '' && img_style != 'scale(1)'){
            var transform_style = $('#swipebox-slider .current .img-box')[0].style['-webkit-transform'];
            if(transform_style != ''){
              scaleCoords.x = parseInt(transform_style.split('(')[1].split(',')[0].replace('px', ''));
              scaleCoords.y = parseInt(transform_style.split('(')[1].split(',')[1].replace('px', ''));
            }else{
              scaleCoords.x = 0;
              scaleCoords.y = 0;
            }
            scaleCoords.pageX = event.originalEvent.targetTouches[0].pageX;
            scaleCoords.pageY = event.originalEvent.targetTouches[0].pageY;
            
            // get region
            var scale = parseInt(img_style.split('(')[1].split(')')[0]);
            var $img = $('#swipebox-slider .current img');
            var img_height = $img.height()*scale;
            var img_width = $img.width()*scale;
            region.right = -((img_width-$(window).width())/2);
            region.left =  (img_width-$(window).width())/2;
            if(img_height < $(window).height()){
              region.top = 0;
              region.down = 0;
            } else if(img_height > $(window).height()){
              region.top = (img_height - $(window).height())/2;
              region.down = -((img_height - $(window).height())/2);
            } else {
              region.top = 0;
              region.down = 0;
            }
          }else{
            index = $( '#swipebox-slider .slide' ).index( $( '#swipebox-slider .slide.current' ) );
            endCoords = event.originalEvent.targetTouches[0];
            startCoords.pageX = event.originalEvent.targetTouches[0].pageX;
            startCoords.pageY = event.originalEvent.targetTouches[0].pageY;

            var size = ($( window ).width() * (currentX)/100);
            $( '#swipebox-slider' ).css( {
                '-webkit-transform' : 'translate3d(' + size +'px, 0, 0)',
                'transform' : 'translate3d(' + size +'px, 0, 0)'
            } );
          }

					//$( '#swipebox-slider' ).css( {
					//	'-webkit-transform' : 'translate3d(' + currentX +'%, 0, 0)',
					//	'transform' : 'translate3d(' + currentX + '%, 0, 0)'
					//} );
					Session.set('longTouch', false);
					$( '.touching' ).bind('touchstart',function(){
					       setTimeout(function() {
					            Session.set('longTouch', true);
					        }, 500);
					}).bind( 'touchmove',function( event ) {
						event.preventDefault();
						event.stopPropagation();
            endCoords = event.originalEvent.targetTouches[0];
            
            //scale
						var $swipebox_slider = $('#swipebox-slider .current img');
            var img_style = null;//$('#swipebox-slider .current img')[0].style['-webkit-transform'];
						if($swipebox_slider.length > 0 && $swipebox_slider[0].style)
							img_style = $swipebox_slider[0].style['-webkit-transform'];
            if(img_style && img_style != '' && img_style != 'scale(1)'){
              var pageX = event.originalEvent.targetTouches[0].pageX - scaleCoords.pageX + scaleCoords.x;
              var pageY = event.originalEvent.targetTouches[0].pageY - scaleCoords.pageY + scaleCoords.y;

              $('#swipebox-slider .current .img-box').css({
                '-webkit-transition' : '',
                'transition' : '',
                '-webkit-transform' : 'translate3d('+pageX+'px, '+pageY+'px, 0px)',
                'transform' : 'translate3d('+pageX+'px, '+pageY+'px, 0px)'
              });
              
              return false;
            }
            
						// if(typeof StartZoom != 'undefined' && StartZoom>0)
						// {
						// 	return false;
						// }

						if ( ! hSwipe ) {
							vDistanceLast = vDistance;
							vDistance = endCoords.pageY - startCoords.pageY;
							if ( Math.abs( vDistance ) >= vSwipMinDistance || vSwipe ) {
								var opacity = 0.75 - Math.abs(vDistance) / slider.height();

								slider.css( { 'top': vDistance + 'px' } );
								slider.css( { 'opacity': opacity } );

								vSwipe = true;
							}
						}

						hDistanceLast = hDistance;
						hDistance = endCoords.pageX - startCoords.pageX;
						hDistancePercent = hDistance * 100 / winWidth;

						if ( ! hSwipe && ! vSwipe && Math.abs( hDistance ) >= hSwipMinDistance ) {
							$( '#swipebox-slider' ).css( {
								'-webkit-transition' : '',
								'transition' : ''
							} );
							hSwipe = true;
						}

						if ( hSwipe ) {

							// swipe left
							if ( 0 < hDistance ) {

								// first slide
								if ( 0 === index ) {
									$( '#swipebox-overlay' ).addClass( 'leftSpringTouch' );
								} else {
                                    $( '#swipebox-overlay' ).removeClass( 'leftSpringTouch' ).removeClass( 'rightSpringTouch' );

                                    var size = ($( window ).width() * (currentX+ hDistancePercent)/100);

                                    $( '#swipebox-slider' ).css( {
                                        '-webkit-transform' : 'translate3d(' + size +'px, 0, 0)',
                                        'transform' : 'translate3d(' + size +'px, 0, 0)'
                                    } );

									// Follow gesture
									//$( '#swipebox-slider' ).css( {
									//	'-webkit-transform' : 'translate3d(' + ( currentX + hDistancePercent ) +'%, 0, 0)',
								//		'transform' : 'translate3d(' + ( currentX + hDistancePercent ) + '%, 0, 0)'
								//	} );
								}

							// swipe rught
							} else if ( 0 > hDistance ) {

								// last Slide
								if ( elements.length === index +1 ) {
									$( '#swipebox-overlay' ).addClass( 'rightSpringTouch' );
								} else {
									$( '#swipebox-overlay' ).removeClass( 'leftSpringTouch' ).removeClass( 'rightSpringTouch' );

                                    var size = ($( window ).width() * (currentX+ hDistancePercent)/100);

                                    $( '#swipebox-slider' ).css( {
                                        '-webkit-transform' : 'translate3d(' + size +'px, 0, 0)',
                                        'transform' : 'translate3d(' + size +'px, 0, 0)'
                                    } );

									//$( '#swipebox-slider' ).css( {
									//	'-webkit-transform' : 'translate3d(' + ( currentX + hDistancePercent ) +'%, 0, 0)',
									//	'transform' : 'translate3d(' + ( currentX + hDistancePercent ) + '%, 0, 0)'
									//} );

								}

							}
						}
					} );

					return false;

				} ).bind( 'touchend',function( event ) {
					event.preventDefault();
					event.stopPropagation();
          
          var $swipebox_slider = $('#swipebox-slider .current img');
					var img_style = null;//$('#swipebox-slider .current img')[0].style['-webkit-transform'];
					if($swipebox_slider.length > 0 && $swipebox_slider[0].style)
						img_style = $swipebox_slider[0].style['-webkit-transform'];
          if(img_style && img_style != '' && img_style != 'scale(1)'){
            //console.log(img_style.split('(')[1].split(')')[0]);
            var scale = parseInt(img_style.split('(')[1].split(')')[0]);
            
            // get direction
            var direction = {};
            if(endCoords.pageX > scaleCoords.pageX){direction.right = true;}
            else if(endCoords.pageX < scaleCoords.pageX){direction.left = true;}
            if(endCoords.pageY > scaleCoords.pageY){direction.down = true;}
            else if(endCoords.pageY < scaleCoords.pageY){direction.up = true;}
            if(direction.up && !direction.left && !direction.right){direction.result = "up";}
            else if(direction.right && !direction.up && !direction.down){direction.result = "right";}
            else if(direction.down && !direction.left && !direction.right){direction.result = "down";}
            else if(direction.left && !direction.up && !direction.down){direction.result = "left";}
            else if(direction.up && direction.right){direction.result = "rightUp";}
            else if(direction.right && direction.down){direction.result = "rightDown";}
            else if(direction.left && direction.down){direction.result = "leftDown";}
            else if(direction.left && direction.up){direction.result = "leftUp";}
            
            // fix region
            var pageX = endCoords.pageX - scaleCoords.pageX + scaleCoords.x;
            var pageY = endCoords.pageY - scaleCoords.pageY + scaleCoords.y;
            console.log(region);
            console.log('x:'+pageX+', y:'+pageY);
            
            switch (direction.result) {
              case 'up':
                if(region.down === 0){pageY = 0;}
                else if(pageY < region.down){pageY = region.down;}
                break;
              case 'right':
                if(pageX > region.left){pageX = region.left;}
                break;
              case 'down':
                if(region.top === 0){pageY = 0;}
                else if(pageY > region.top){pageY = region.top;}
                break;
              case 'left':
                if(pageX < region.right){pageX = region.right;}
                break;
              case 'rightUp':
                if(pageX > region.left){pageX = region.left;}
                if(region.down === 0){pageY = 0;}
                else if(pageY < region.down){pageY = region.down;}
                break;
              case 'rightDown':
                if(pageX > region.left){pageX = region.left;}
                if(region.top === 0){pageY = 0;}
                else if(pageY > region.top){pageY = region.top;}
                break;
              case 'leftDown':
                if(pageX < region.right){pageX = region.right;}
                if(region.top === 0){pageY = 0;}
                else if(pageY > region.top){pageY = region.top;}
                break;
              case 'leftUp':
                if(pageX < region.right){pageX = region.right;}
                if(region.down === 0){pageY = 0;}
                else if(pageY < region.down){pageY = region.down;}
                break;
            }
            
            if(pageX != endCoords.pageX - scaleCoords.pageX + scaleCoords.x || pageY != endCoords.pageY - scaleCoords.pageY + scaleCoords.y){
              //$('#swipebox-console').html('x:'+pageX+', y:'+pageY);
              
              var x = pageX - (endCoords.pageX - scaleCoords.pageX + scaleCoords.x);
              var y = pageY - (endCoords.pageY - scaleCoords.pageY + scaleCoords.y);
              console.log('x:'+x+', y:'+y);
              var maxVal = $(window).width()*scale*0.3;
              // if(x > maxVal || x < -(maxVal) || y > maxVal || y < -(maxVal){
              //   console.log('close');
              //   $('#swipebox-console').html(maxVal+'close-> x:'+x+',y:'+y);
              // }
              // if(x > $(window).width()/2 || x < -($(window).width()/2) || y > $(window).width()/2 || y < -($(window).width()/2)){
              //   $('#swipebox-slider .current .img-box').css({
              //     '-webkit-transition' : '',
              //     'transition' : '',
              //     '-webkit-transform' : 'translate3d(0px, 0px, 0px)',
              //     'transform' : 'translate3d(0px, 0px, 0px)'
              //   });
              //   $('#swipebox-slider .current img').css({
              //     '-webkit-transform' : 'scale(1)'
              //   });
              // }else{
                $('#swipebox-slider .current .img-box').css({
                  '-webkit-transition' : '-webkit-transform 0.4s ease',
                  'transition' : 'transform 0.4s ease',
                  '-webkit-transform' : 'translate3d('+pageX+'px, '+pageY+'px, 0px)',
                  'transform' : 'translate3d('+pageX+'px, '+pageY+'px, 0px)'
                });
              // }
            }
            
            //$('#swipebox-console').html(direction.result);
            //console.log(region);
            //console.log(direction.result);
              
            return false;
          }
            
					// if(typeof StartZoom != 'undefined' && StartZoom>0)
					// {
					// 	StartZoom--;
					// 	return false;
					// }
          
					$( '#swipebox-slider' ).css( {
						'-webkit-transition' : '-webkit-transform 0.4s ease',
						'transition' : 'transform 0.4s ease'
					} );

					//ifIsCurrentLike();

					vDistance = endCoords.pageY - startCoords.pageY;
					hDistance = endCoords.pageX - startCoords.pageX;
					hDistancePercent = hDistance*100/winWidth;

					// Swipe to bottom to close
					if ( vSwipe ) {
						vSwipe = false;
						if ( Math.abs( vDistance ) >= 2 * vSwipMinDistance && Math.abs( vDistance ) > Math.abs( vDistanceLast ) ) {
							var vOffset = vDistance > 0 ? slider.height() : - slider.height();
							slider.animate( { top: vOffset + 'px', 'opacity': 0 },
								300,
								function () {
									$this.closeSlide();
								} );
						} else {
							slider.animate( { top: 0, 'opacity': 1 }, 300 );
						}

					} else if ( hSwipe ) {

						hSwipe = false;
						if(Session.get('longTouch')){
							// swipeLeft
							if(hDistancePercent>=50) {
								$this.getPrev();

							// swipeRight
							}else if ( hDistancePercent<=-50) {
								$this.getNext();
							}
						}else{
							// swipeLeft
							if( hDistance >= hSwipMinDistance && hDistance >= hDistanceLast) {
								$this.getPrev();

							// swipeRight
							} else if ( hDistance <= -hSwipMinDistance && hDistance <= hDistanceLast) {
								$this.getNext();
							}
						}

					} else { // Top and bottom bars have been removed on touchable devices
						// tap
                        if($( this ).hasClass( 'touching' ) && typeof($("#isClicked").attr('value')) == "undefined"){
                            slider.animate( { 'opacity': 0 },
                                300,
                                function () {
                                    $this.closeSlide();
                                } );
                        }
						if ( ! bars.hasClass( 'visible-bars' ) ) {
							$this.showBars();
							$this.setTimeout();
						} else {
							$this.clearTimeout();
							$this.hideBars();
                            }
						}

                    var size = ($( window ).width() * currentX/100);

                    $( '#swipebox-slider' ).css( {
                            '-webkit-transform' : 'translate3d(' + size +'px, 0, 0)',
                            'transform' : 'translate3d(' + size +'px, 0, 0)'
                    } );

					//$( '#swipebox-slider' ).css( {
					//	'-webkit-transform' : 'translate3d(' + currentX + '%, 0, 0)',
					//	'transform' : 'translate3d(' + currentX + '%, 0, 0)'
					//} );

					$( '#swipebox-overlay' ).removeClass( 'leftSpringTouch' ).removeClass( 'rightSpringTouch' );
					$( '.touching' ).off( 'touchmove' ).removeClass( 'touching' );

				} );
			},

			/**
			 * Set timer to hide the action bars
			 */
			setTimeout: function () {
				if ( plugin.settings.hideBarsDelay > 0 ) {
					var $this = this;
					$this.clearTimeout();
					$this.timeout = window.setTimeout( function() {
							$this.hideBars();
						},

						plugin.settings.hideBarsDelay
					);
				}
			},

			/**
			 * Clear timer
			 */
			clearTimeout: function () {
				window.clearTimeout( this.timeout );
				this.timeout = null;
			},

			/**
			 * Show navigation and title bars
			 */
			showBars : function () {
				var bars = $( '#swipebox-top-bar, #swipebox-bottom-bar' );
				if ( this.doCssTrans() ) {
					bars.addClass( 'visible-bars' );
				} else {
					$( '#swipebox-top-bar' ).animate( { top : 0 }, 500 );
					$( '#swipebox-bottom-bar' ).animate( { bottom : 0 }, 500 );
					setTimeout( function() {
						bars.addClass( 'visible-bars' );
					}, 1000 );
				}
			},

			/**
			 * Hide navigation and title bars
			 */
			hideBars : function () {
				var bars = $( '#swipebox-top-bar, #swipebox-bottom-bar' );
				if ( this.doCssTrans() ) {
					bars.removeClass( 'visible-bars' );
				} else {
					$( '#swipebox-top-bar' ).animate( { top : '-50px' }, 500 );
					$( '#swipebox-bottom-bar' ).animate( { bottom : '-50px' }, 500 );
					setTimeout( function() {
						bars.removeClass( 'visible-bars' );
					}, 1000 );
				}
			},

			/**
			 * Animate navigation and top bars
			 */
			animBars : function () {
				var $this = this,
					bars = $( '#swipebox-top-bar, #swipebox-bottom-bar' );

				bars.addClass( 'visible-bars' );
				$this.setTimeout();

				$( '#swipebox-slider' ).click( function() {
					if ( ! bars.hasClass( 'visible-bars' ) ) {
						$this.showBars();
						$this.setTimeout();
					}
				} );

				$( '#swipebox-bottom-bar' ).hover( function() {
					$this.showBars();
					bars.addClass( 'visible-bars' );
					$this.clearTimeout();

				}, function() {
					if ( plugin.settings.hideBarsDelay > 0 ) {
						bars.removeClass( 'visible-bars' );
						$this.setTimeout();
					}

				} );
			},

			/**
			 * Keyboard navigation
			 */
			keyboard : function () {
				var $this = this;
				$( window ).bind( 'keyup', function( event ) {
					event.preventDefault();
					event.stopPropagation();

					if ( event.keyCode === 37 ) {

						$this.getPrev();

					} else if ( event.keyCode === 39 ) {

						$this.getNext();

					} else if ( event.keyCode === 27 ) {

						$this.closeSlide();
					}
				} );
			},

			/**
			 * Navigation events : go to next slide, go to prevous slide and close
			 */
			actions : function () {
				var $this = this,
					action = 'touchend click'; // Just detect for both event types to allow for multi-input

				if ( elements.length < 2 ) {

					$( '#swipebox-bottom-bar' ).hide();

					if ( undefined === elements[ 1 ] ) {
						$( '#swipebox-top-bar' ).hide();
					}

				} else {
					$( '#swipebox-prev' ).bind( action, function( event ) {
						event.preventDefault();
						event.stopPropagation();
						$this.getPrev();
						$this.setTimeout();
					} );

					$( '#swipebox-next' ).bind( action, function( event ) {
						event.preventDefault();
						event.stopPropagation();
						$this.getNext();
						$this.setTimeout();
					} );
				}

				$( '#swipebox-close' ).bind( action, function() {
					$this.closeSlide();
				} );
			},

			/**
			 * Set current slide
			 */
			setSlide : function ( index, isFirst ) {

				isFirst = isFirst || false;

				var slider = $( '#swipebox-slider' );

				currentX = -index*100;

				if ( this.doCssTrans() ) {

                    var size = -$( window ).width() * index;

                    slider.css( {
                        '-webkit-transform' : 'translate3d(' + size +'px, 0, 0)',
                        'transform' : 'translate3d(' + size +'px, 0, 0)'
                    } );

					//slider.css( {
					//	'-webkit-transform' : 'translate3d(' + (-index*100)+'%, 0, 0)',
					//	'transform' : 'translate3d(' + (-index*100)+'%, 0, 0)'
					//} );
				} else {
                    var size = -$( window ).width() * index;
                    slider.animate( { left : ( size )+'px' } );
					//slider.animate( { left : ( -index*100 )+'%' } );
				}

				$( '#swipebox-slider .slide' ).removeClass( 'current' );
				$( '#swipebox-slider .slide').removeAttr( 'style' );
				$( '#swipebox-slider .slide' ).eq( index ).addClass( 'current' );
				this.setTitle( index );

				var currentSlide = $( '#swipebox-slider .slide' ).eq( index );
				var zoomimg = currentSlide[0];
				var hammertime = new Hammer(zoomimg);
				var pinch = new Hammer.Pinch();
				var rotate = new Hammer.Rotate();
				pinch.recognizeWith(rotate);
				hammertime.add([pinch, rotate]);
				var scale = 1; // scale of the image

				hammertime.on("pinchstart pinchin pinchout pinchend", function(event) {
					event.preventDefault();
					/*
					console.log("========ev begin===========");
					console.log("pageX0: "+event.pointers[0].pageX);
					console.log("pageY0: "+event.pointers[0].pageY);
					console.log("screenX0: "+event.pointers[0].screenX);
					console.log("screenY0: "+event.pointers[0].screenY);
					console.log("clientX0: "+event.pointers[0].clientX);
					console.log("clientY0: "+event.pointers[0].clientY);
					console.log("pageX1: "+event.pointers[1].pageX);
					console.log("pageY1: "+event.pointers[1].pageY);
					console.log("screenX1: "+event.pointers[1].screenX);
					console.log("screenY1: "+event.pointers[1].screenY);
					console.log("clientX1: "+event.pointers[1].clientX);
					console.log("clientY1: "+event.pointers[1].clientY);
					console.log("center: "+JSON.stringify(event.center));
					console.log("========ev   end===========");
					*/

					if(event.type === 'pinchstart')
					{
						initScale = scale
						pinchStatus = 1;
					}
					else if(event.type === 'pinchend')
					{
						initScale = scale
						pinchStatus = 0
					}
					else if(event.type === 'pinchin' || event.type === 'pinchout')
					{
						if (pinchStatus === 0)
							return;
						StartZoom=2;
						scale = initScale * event.scale;
						if(scale<1 || scale>3)
							return;
              
						// redraw
            $('#swipebox-console').css('display', 'block');
            $('#swipebox-slider .current img').css({
              '-webkit-transform' : 'scale(' + scale + ')'
            });
            
            // var img_style = $('#swipebox-slider .current img')[0].style['-webkit-transform'];
            // if(!(img_style && img_style != '' && img_style != 'scale(1)')){
            //   $('#swipebox-slider .current .img-box').css({
            //     '-webkit-transition' : '',
            //     'transition' : '',
            //     '-webkit-transform' : 'translate3d(0px, 0px, 0px)',
            //     'transform' : 'translate3d(0px, 0px, 0px)'
            //   });
            // }
					}
				});

				if ( isFirst ) {
					slider.fadeIn();
				}

				$( '#swipebox-prev, #swipebox-next' ).removeClass( 'disabled' );

				if ( index === 0 ) {
					$( '#swipebox-prev' ).addClass( 'disabled' );
				} else if ( index === elements.length - 1 && plugin.settings.loopAtEnd !== true ) {
					$( '#swipebox-next' ).addClass( 'disabled' );
				}

				if(defaults.indexChanged)
					defaults.indexChanged(index);
				else
					console.log('swipeobx index:', index);
			},

			/**
			 * Open slide
			 */
			openSlide : function ( index ) {
				$( 'html' ).addClass( 'swipebox-html' );
				if ( isTouch ) {
					$( 'html' ).addClass( 'swipebox-touch' );

					if ( plugin.settings.hideCloseButtonOnMobile ) {
						$( 'html' ).addClass( 'swipebox-no-close-button' );
					}
				} else {
					$( 'html' ).addClass( 'swipebox-no-touch' );
				}
				$( window ).trigger( 'resize' ); // fix scroll bar visibility on desktop
				this.setSlide( index, true );
			},

			/**
			 * Set a time out if the media is a video
			 */
			preloadMedia : function ( index ) {
				var $this = this,
					src = null;

				if ( elements[ index ] !== undefined ) {
					src = elements[ index ].href;
				}

				if ( ! $this.isVideo( src ) ) {
					setTimeout( function() {
						$this.openMedia( index );
					}, 1000);
				} else {
					$this.openMedia( index );
				}
			},

			/**
			 * Open
			 */
			openMedia : function ( index ) {
				var $this = this,
					src,
					slide;

				if ( elements[ index ] !== undefined ) {
					src = elements[ index ].href;
				}

				if ( index < 0 || index >= elements.length ) {
					return false;
				}

				slide = $( '#swipebox-slider .slide' ).eq( index );

				if ( ! $this.isVideo( src ) ) {
					slide.addClass( 'slide-loading' );
					$this.loadMedia( src, function() {
						slide.removeClass( 'slide-loading' );
						slide.html('<div class="img-box" style="display: inline-block;"><img src="' + src + '" /></div>');
					} );
				} else {
					slide.html( $this.getVideo( src ) );
				}

			},

			/**
			 * Set link title attribute as caption
			 */
			setTitle : function ( index ) {
				var title = null;

				$( '#swipebox-title' ).empty();

				if ( elements[ index ] !== undefined ) {
					title = elements[ index ].title;
				}

				if ( title ) {
					$( '#swipebox-top-bar' ).show();
					$( '#swipebox-title' ).append( title );
				} else {
					$( '#swipebox-top-bar' ).hide();
				}
			},

			/**
			 * Check if the URL is a video
			 */
			isVideo : function ( src ) {

				if ( src ) {
					if ( src.match( /youtube\.com\/watch\?v=([a-zA-Z0-9\-_]+)/) || src.match( /vimeo\.com\/([0-9]*)/ ) || src.match( /youtu\.be\/([a-zA-Z0-9\-_]+)/ ) ) {
						return true;
					}

					if ( src.toLowerCase().indexOf( 'swipeboxvideo=1' ) >= 0 ) {

						return true;
					}
				}

			},

			/**
			 * Get video iframe code from URL
			 */
			getVideo : function( url ) {
				var iframe = '',
					youtubeUrl = url.match( /watch\?v=([a-zA-Z0-9\-_]+)/ ),
					youtubeShortUrl = url.match(/youtu\.be\/([a-zA-Z0-9\-_]+)/),
					vimeoUrl = url.match( /vimeo\.com\/([0-9]*)/ );
				if ( youtubeUrl || youtubeShortUrl) {
					if ( youtubeShortUrl ) {
						youtubeUrl = youtubeShortUrl;
					}
					iframe = '<iframe width="560" height="315" src="//www.youtube.com/embed/' + youtubeUrl[1] + '?autoplay='+ plugin.settings.autoplayVideos + '" frameborder="0" allowfullscreen></iframe>';

				} else if ( vimeoUrl ) {

					iframe = '<iframe width="560" height="315"  src="//player.vimeo.com/video/' + vimeoUrl[1] + '?byline=0&amp;portrait=0&amp;color=' + plugin.settings.vimeoColor + '&autoplay=' + plugin.settings.autoplayVideos + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';

				}

				if ( youtubeUrl || youtubeShortUrl || vimeoUrl ) {

				} else {
					iframe = '<iframe width="560" height="315" src="' + url + '" frameborder="0" allowfullscreen></iframe>';
				}

				return '<div class="swipebox-video-container" style="max-width:' + plugin.settings.videomaxWidth + 'px"><div class="swipebox-video">' + iframe + '</div></div>';
			},

			/**
			 * Load image
			 */
			loadMedia : function ( src, callback ) {
				if ( ! this.isVideo( src ) ) {
					var $img = $( '<img>' );
					var timeInterval = null;
					var isReload = false;

					$img.error(function(){
						isReload = false;
						if(timeInterval === null){
							timeInterval = setInterval(function(){
								if($('#swipebox-overlay').length <= 0){
									clearInterval(timeInterval);
									return timeInterval = null;
								}

								if(isReload)
									return;

								$img.attr( 'src', src );
								console.log('reload image:', src);
								isReload = true;
							}, 1000);
						}
					});
					$img.on( 'load', function(){
						if(timeInterval != null){
							clearInterval(timeInterval);
							timeInterval = null;
						}
						callback.call( $img );
					});
					// var img = $( '<img>' ).on( 'load', function() {
					// 	callback.call( img );
					// } );

					$img.attr( 'src', src );
				}
			},

			/**
			 * Get next slide
			 */
			getNext : function () {
				var $this = this,
					src,
					index = $( '#swipebox-slider .slide' ).index( $( '#swipebox-slider .slide.current' ) );
				if ( index + 1 < elements.length ) {

					src = $( '#swipebox-slider .slide' ).eq( index ).contents().find( 'iframe' ).attr( 'src' );
					$( '#swipebox-slider .slide' ).eq( index ).contents().find( 'iframe' ).attr( 'src', src );
					index++;
					$this.setSlide( index );
					$this.preloadMedia( index+1 );
				} else {

					if ( plugin.settings.loopAtEnd === true ) {
						src = $( '#swipebox-slider .slide' ).eq( index ).contents().find( 'iframe' ).attr( 'src' );
						$( '#swipebox-slider .slide' ).eq( index ).contents().find( 'iframe' ).attr( 'src', src );
						index = 0;
						$this.preloadMedia( index );
						$this.setSlide( index );
						$this.preloadMedia( index + 1 );
					} else {
						$( '#swipebox-overlay' ).addClass( 'rightSpring' );
						setTimeout( function() {
							$( '#swipebox-overlay' ).removeClass( 'rightSpring' );
						}, 500 );
					}
				}
			},

			/**
			 * Get previous slide
			 */
			getPrev : function () {
				var index = $( '#swipebox-slider .slide' ).index( $( '#swipebox-slider .slide.current' ) ),
					src;
				if ( index > 0 ) {
					src = $( '#swipebox-slider .slide' ).eq( index ).contents().find( 'iframe').attr( 'src' );
					$( '#swipebox-slider .slide' ).eq( index ).contents().find( 'iframe' ).attr( 'src', src );
					index--;
					this.setSlide( index );
					this.preloadMedia( index-1 );
				} else {
					$( '#swipebox-overlay' ).addClass( 'leftSpring' );
					setTimeout( function() {
						$( '#swipebox-overlay' ).removeClass( 'leftSpring' );
					}, 500 );
				}
			},

			/**
			 * Close
			 */
			closeSlide : function () {
				$( 'html' ).removeClass( 'swipebox-html' );
				$( 'html' ).removeClass( 'swipebox-touch' );
				$( window ).trigger( 'resize' );
				this.destroy();
			},

			/**
			 * Destroy the whole thing
			 */
			destroy : function () {
				$( window ).unbind( 'keyup' );
				$( 'body' ).unbind( 'touchstart' );
				$( 'body' ).unbind( 'touchmove' );
				$( 'body' ).unbind( 'touchend' );
				$( '#swipebox-slider' ).unbind();
				$( '#swipebox-overlay' ).remove();

				if ( ! $.isArray( elem ) ) {
					elem.removeData( '_swipebox' );
				}

				if ( this.target ) {
					this.target.trigger( 'swipebox-destroy' );
				}

				$.swipebox.isOpen = false;

				if ( plugin.settings.afterClose ) {
					plugin.settings.afterClose();
				}
			}
		};

		plugin.init();
	};

	$.fn.swipebox = function( options ) {

		if ( ! $.data( this, '_swipebox' ) ) {
			var swipebox = new $.swipebox( this, options );
			this.data( '_swipebox', swipebox );
		}
		return this.data( '_swipebox' );

	};

}( window, document, jQuery ) );