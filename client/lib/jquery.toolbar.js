/**
 * Toolbar.js
 *
 * @fileoverview  jQuery plugin that creates tooltip style toolbars.
 * @link          http://paulkinzett.github.com/toolbar/
 * @author        Paul Kinzett (http://kinzett.co.nz/)
 * @version       1.0.4
 * @requires      jQuery 1.7+
 *
 * @license jQuery Toolbar Plugin v1.0.4
 * http://paulkinzett.github.com/toolbar/
 * Copyright 2013 Paul Kinzett (http://kinzett.co.nz/)
 * Released under the MIT license.
 * <https://raw.github.com/paulkinzett/toolbar/master/LICENSE.txt>
 */

if ( typeof Object.create !== 'function' ) {
    Object.create = function( obj ) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

(function( $, window, document, undefined ) {

    var ToolBar = {
        init: function( options, elem ) {
            var self = this;
            self.elem = elem;
            self.$elem = $( elem );
            self.options = $.extend( {}, $.fn.toolbar.options, options );
            self.toolbar = $('<div class="tool-container gradient" />')
                .addClass('tool-'+self.options.position)
                .addClass('tool-rounded')
                .append('<div class="tool-items" />')
                .append('<div class="arrow" />')
                .appendTo('body')
                .css('opacity', 0)
                .hide();
            self.toolbar_arrow = self.toolbar.find('.arrow');
            self.initializeToolbar();
            self.scrollMontor = scrollMonitor.create(self.$elem);
            self.needRestart = false;
        },

        initializeToolbar: function() {
            var self = this;
            self.populateContent();
            self.setTrigger();
            self.toolbarWidth = self.toolbar.width();
        },

        reInitializeToolbar: function() {
            var self = this;
            self.reinitContent();
            //self.setTrigger();
            self.toolbarWidth = self.toolbar.width();
        },

        setTrigger: function() {
            var self = this;

            self.$elem.on('click', function(event) {
                if (typeof global_toolbar_hidden !== "undefined" && global_toolbar_hidden !== null) {
                    if (global_toolbar_hidden) {
                        return;
                    }

                }
                event.preventDefault();
                if(self.$elem.hasClass('pressed')) {
                    self.hide();
                } else {
                    //console.log("Show #1");
                    self.show();
                }
            });

            if (self.options.hideOnClick) {
                $('html').on("click.toolbar", function ( event ) {

                    if (event.target != self.elem &&
                        self.$elem.has(event.target).length === 0 &&
                        self.toolbar.has(event.target).length === 0
                        ) {

                        if (self.toolbar.is(":visible")){
                            //console.log("click toobar hidden :" + self.$elem.attr("id") + " visible:" + self.toolbar.is(":visible"));
                            self.hide();
                        } else {
                            //console.log("click toobar No hidden :" + self.$elem.attr("id") + " visible:" + self.toolbar.is(":visible"));
                        }


                    }
                });
            }

            if (self.options.hover) {
                var moveTime;

                function decideTimeout () {
                    if (self.$elem.hasClass('pressed')) {
                        moveTime = setTimeout(function() {
                            self.hide();
                        }, 150);
                    } else {
                        clearTimeout(moveTime);
                    };
                };

                self.$elem.on({
                    mouseenter: function(event) {
                        if (self.$elem.hasClass('pressed')) {
                            clearTimeout(moveTime);
                        } else {
                            //console.log("Show #2");
                            self.show();
                        }
                    }
                });

                self.$elem.parent().on({
                    mouseleave: function(event){ decideTimeout(); }
                });

                $('.tool-container').on({
                    mouseenter: function(event){ clearTimeout(moveTime); },
                    mouseleave: function(event){ decideTimeout(); }
                });
            }

            $(window).resize(function( event ) {
                event.stopPropagation();
                if ( self.toolbar.is(":visible") ) {
                    self.toolbarCss = self.getCoordinates(self.options.position, 20);
                    self.collisionDetection();
                    self.toolbar.css( self.toolbarCss );
                    self.toolbar_arrow.css( self.arrowCss );
                }
            });
        },

        populateContent: function() {
            var self = this;
            var location = self.toolbar.find('.tool-items');
            var content = $(self.options.content).clone( true ).find('a').addClass('tool-item gradient');
            location.html(content);
            location.find('.tool-item').on('click', function(event) {
                event.preventDefault();
                self.$elem.trigger('toolbarItemClick', this);
                self.hide();
            });
        },
        reinitContent: function() {
            var self = this;
            var location = self.toolbar.find('.tool-items');
            var content = $(self.options.content).clone( true ).find('a').addClass('tool-item gradient');
            location.html(content);
            location.find('.tool-item').on('click', function(event) {
                event.preventDefault();
                self.$elem.trigger('toolbarItemClick', this);
            });
        },
        calculatePosition: function() {
            var self = this;
                self.arrowCss = {};
                self.toolbarCss = self.getCoordinates(self.options.position, 0);
                self.toolbarCss.position = 'absolute';
                self.toolbarCss.zIndex = self.options.zIndex;
                self.collisionDetection();
                self.toolbar.css(self.toolbarCss);
                self.toolbar_arrow.css(self.arrowCss);
        },

        getCoordinates: function( position, adjustment ) {
            var self = this;
            self.coordinates = self.$elem.offset();

            if (self.options.adjustment && self.options.adjustment[self.options.position]) {
                adjustment = self.options.adjustment[self.options.position] + adjustment;
            }

            switch(self.options.position) {
                case 'top':
                    return {
                        left: self.coordinates.left-(self.toolbar.width()/2)+(self.$elem.outerWidth()/2),
                        top: self.coordinates.top-self.toolbar.height()-adjustment,
                        right: 'auto'
                    };
                case 'left':
                    return {
                        left: self.coordinates.left-(self.toolbar.width()/2)-(self.$elem.width()/2)-adjustment,
                        top: self.coordinates.top-(self.toolbar.height()/2)+(self.$elem.outerHeight()/2),
                        right: 'auto'
                    };
                case 'right':
                    return {
                        left: self.coordinates.left+(self.toolbar.width()/2)+(self.$elem.width()/3)+adjustment,
                        top: self.coordinates.top-(self.toolbar.height()/2)+(self.$elem.outerHeight()/2),
                        right: 'auto'
                    };
                case 'bottom':
                    return {
                        left: self.coordinates.left-(self.toolbar.width()/2)+(self.$elem.outerWidth()/2),
                        top: self.coordinates.top+self.$elem.height()+adjustment,
                        right: 'auto'
                    };
                case 'center':
                    return {
                        left: self.coordinates.left-(self.toolbar.width()/2)+(self.$elem.outerWidth()/2),
                        top: $(window).height()/2 + $(window).scrollTop()-self.toolbar.height()-adjustment,
                        right: 'auto'
                    };
            }
        },

        collisionDetection: function() {
            var self = this;
            var edgeOffset = 20;
            if(self.options.position == 'top' || self.options.position == 'bottom'
              || self.options.position == 'center') {
                self.arrowCss = {left: '50%', right: '50%'};
                if( self.toolbarCss.left < edgeOffset ) {
                    self.toolbarCss.left = edgeOffset;
                    self.arrowCss.left = self.$elem.offset().left + self.$elem.width()/2-(edgeOffset);
                }
                else if(($(window).width() - (self.toolbarCss.left + self.toolbarWidth)) < edgeOffset) {
                    self.toolbarCss.right = edgeOffset;
                    self.toolbarCss.left = 'auto';
                    self.arrowCss.left = 'auto';
                    self.arrowCss.right = ($(window).width()-self.$elem.offset().left)-(self.$elem.width()/2)-(edgeOffset)-5;
                }
            }
        },

        show: function() {
            var self = this;
            var animation = {'opacity': 1};
            var watcher = self.scrollMontor;
            var edgeOffset = 20;
            var toTop = watcher.top - $(window).scrollTop()
                - $('.head').height() - self.toolbar.height() - edgeOffset;
            var toBottom = $(window).height()-(watcher.bottom - $(window).scrollTop()) -  $('#postFooter').height() - self.toolbar.height() - edgeOffset;
            self.needRestart = false;

            if( toTop >= 0 ) {
                if(self.options.position !== 'top') {
                    $(self.toolbar).removeClass('tool-'+self.options.position);
                    self.options.position = 'top';
                    $(self.toolbar).addClass('tool-top');
                }
            } else if ( toBottom >= 0 ) {
                if(self.options.position !== 'bottom') {
                    $(self.toolbar).removeClass('tool-'+self.options.position);
                    self.options.position = 'bottom';
                    $(self.toolbar).addClass('tool-bottom');
                }
            } else {
                if(self.options.position !== 'center') {
                    $(self.toolbar).removeClass('tool-'+self.options.position);
                    self.options.position = 'center';
                    $(self.toolbar).addClass('tool-center');
                }
            }
            self.$elem.addClass('pressed').trigger('beSelected');
//            console.log("click toobar pressed :" + self.$elem.attr("id") + " visible:" + self.toolbar.is(":visible"));
            $("#"+self.$elem.attr("id")+"TextArea").attr("placeholder", "点击笔添加文字")
            self.calculatePosition();

            switch(self.options.position) {
                case 'top':
                    animation.top = '-=20';
                    break;
                case 'left':
                    animation.left = '-=20';
                    break;
                case 'right':
                    animation.left = '+=20';
                    break;
                case 'bottom':
                    animation.top = '+=20';
                    break;
                case 'center':
                    animation.top = '=0';
                    break;
            }

            self.toolbar.show().animate(animation, 200 );
            self.$elem.trigger('toolbarShown');

            /* touchmove event bind with toolbar's restart show() may cause two more active toolbar exist at same time issue.
            $('body').one("touchmove", function() {
                self.needRestart = true;
                if ( self.toolbar.is(":visible") ) {
                    self.toolbar.hide();
                    $('body').one("touchend", function() {
                        if( self.needRestart === true ) {
                            self.needRestart = false;
                            console.log("Show #4");
                            self.show();
                        }
                    })
                }
            })
            */
        },

        hide: function() {
            var self = this;
            var animation = {'opacity': 0};

            self.$elem.removeClass('pressed').trigger('beUnSelected');


            switch(self.options.position) {
                case 'top':
                    animation.top = '+=20';
                    break;
                case 'left':
                    animation.left = '+=20';
                    break;
                case 'right':
                    animation.left = '-=20';
                    break;
                case 'bottom':
                    animation.top = '-=20';
                    break;
                case 'center':
                    animation.top = '=0';
                    break;
            }

            self.toolbar.animate(animation, 200, function() {
                self.toolbar.hide();
            });

            self.$elem.trigger('toolbarHidden');
        },

        getToolbarElement: function () {
            return this.toolbar.find('.tool-items');
        }
    };

    $.fn.toolbar = function( options ) {
        if ($.isPlainObject( options )) {
            return this.each(function() {
                var toolbarObj = Object.create( ToolBar );
                toolbarObj.init( options, this );
                $(this).data('toolbarObj', toolbarObj);
            });
        } else if ( typeof options === 'string' && options.indexOf('_') !== 0 ) {
            var toolbarObj = $(this).data('toolbarObj');
            var method = toolbarObj[options];
            return method.apply(toolbarObj, $.makeArray(arguments).slice(1));
        }
    };

    $.fn.toolbar.options = {
        content: '#myContent',
        position: 'top',
        hideOnClick: false,
        zIndex: 120,
        hover: false
    };

}) ( jQuery, window, document );
