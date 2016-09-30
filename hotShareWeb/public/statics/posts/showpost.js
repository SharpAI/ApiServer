(function(global) {
    if (!global.gushitie) global.gushitie = {};

    var gushitie = global.gushitie;
    gushitie.showpost = {};


    var SUGGEST_POSTS_SKIP = 0;
    var SUGGEST_POSTS_LIMIT = 10;
    var SUGGEST_POSTS_LOADING = false;

    var getBaseWidth = function() {
      return ($('.showPosts').width() - 30) / 6;
    };

    var getDocHeight = function() {
      var D;
      D = document;
      return Math.max(Math.max(D.body.scrollHeight, D.documentElement.scrollHeight), Math.max(D.body.offsetHeight, D.documentElement.offsetHeight), Math.max(D.body.clientHeight, D.documentElement.clientHeight));
    };

    var getBaseHeight = function() {
      return ($('.showPosts').width() - 30) / 6;
    };


    var getLayoutTop = function(helper, col, sizeX) {
      var max;
      max = 0;
      for (i = col; i <= col+sizeX -1; i++) {
        max = Math.max(max, helper[(i - 1)]);
      }
      return max;
    };

    var updateLayoutData = function(helper, col, sizeX, bottom) {
      for (i = col; i <= col+sizeX -1; i++) {
        helper[(i - 1)] = bottom;
      }
    };

    var fetchPubInfo = function($elem) {
        return {
            "index": Number($elem.attr('index')),
            "type": $elem.attr('type'),
            "data_col": Number($elem.attr('col')),
            "data_sizex": Number($elem.attr('sizex')),
            "data_sizey": Number($elem.attr('sizey'))
        };
    };

    var calcLayoutForEachPubElement = function() {
        var layoutHelper = [0, 0, 0, 0, 0, 0];
        var imageMarginPixel = 5;

        $("#test .element").each(function() {
            var elem = this, $elem= $(this), parentNode = this.parentNode;
            var pubInfo = fetchPubInfo($elem);

            if (pubInfo.index === 0) {
                updateLayoutData(layoutHelper, 1, 6, parentNode.offsetTop);
            }

            elem.style.top = getLayoutTop(layoutHelper, pubInfo.data_col, pubInfo.data_sizex) + imageMarginPixel + 'px';

            var left = parentNode.offsetLeft + (pubInfo.data_col - 1) * getBaseWidth();
            var width = pubInfo.data_sizex * getBaseWidth();

            if (pubInfo.data_col !== 1) {
                left = left + imageMarginPixel;
                width = width - imageMarginPixel;
            }

            elem.style.left = left + 'px';
            elem.style.width = width + 'px';

            if (pubInfo.type === 'image' || pubInfo.type === 'video') {
                elem.style.height = pubInfo.data_sizey * getBaseHeight() + 'px';
            }

            var elemBottom = elem.offsetTop + elem.offsetHeight;
            updateLayoutData(layoutHelper, pubInfo.data_col, pubInfo.data_sizex, elemBottom);
            parentNode.style.height = getLayoutTop(layoutHelper, 1, 6) - parentNode.offsetTop + 'px';            
        });
    };

    var initLazyload = function() {
        $(".padding-overlay").siblings("img.lazy").each(function() {
            var $lazyItem = $(this);
            $lazyItem.lazyload({
                effect: "fadeIn",
                effectspeed: 600,
                threshold: 800,
                placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
                load: function() {
                    $(this).parent().actImageFitCover('style');
                }
            });
            padding.setRandomlyBackgroundColor($lazyItem);
        });
    };

    var fetchSuggestPosts = function(skip, limit) {
        if(SUGGEST_POSTS_LOADING) return;
        SUGGEST_POSTS_LOADING = true;
        console.log('>>> Begin to fetch suggest posts <<<');
        var url = '/static/data/suggestposts/123/' + skip + '/' + limit;
        SUGGEST_POSTS_SKIP += SUGGEST_POSTS_LIMIT;
        $.getJSON(url, function(data) {
            var posts = data.data;
            var counter = posts.length;
            var html = '';
            posts.forEach(function(post) {
                html += '<div class="newLayout_element" data-postid="' + post.postId + '">'
                          + '<div class="img_placeholder">'
                          + '<img class="mainImage" src="' + post.mainImage+ '" />'
                          + '</div>'
                          + '<div class="pin_content">'
                          + '<p class="title">' + post.title + '</p>'
                          + '<p class="addontitle">' + post.addontitle + '</p>'
                          + '<h1 class="username">' + post.ownerName + '<span>发布</span><button class="suggestAlreadyRead"><i class="fa fa-times"></i></button></h1>'
                          + '</div>'
                          + '</div>';
            });

            var $container = $(".moments .newLayout_container");

            if($container.length > 0) {
                $container.append(html);
            }
            else {
                html = '<div class="newLayout_container">' + html + '</div>';
                $(".div_discover .moments").append(html);
                $container = $(".moments .newLayout_container");
            }


            $(".moments .newLayout_element").not('.loaded').each(function() {
                var elem = this, $elem = $(this);
                $elem.click(function() {
                    var postid = $(this).data('postid');
                    window.open('/static/' + postid, '_blank');
                });
                $elem.detach();

                var imgLoad = imagesLoaded(elem);

                imgLoad.on('done', function() {
                    console.log('>>> img load done!!!');
                    elem.style.display = 'block';
                    //$elem.css('opacity', 0);
                    $elem.addClass('loaded');

                    $container.append($elem);

                    if (--counter < 1) {
                        var wookmark = new Wookmark('.newLayout_container', {
                            autoResize: false,
                            itemSelector: '.newLayout_element',
                            itemWidth: "48%",
                            flexibleWidth: true,
                            direction: 'left',
                            align: 'center'
                        }, true);
                        SUGGEST_POSTS_LOADING = false;
                    }
                });

                imgLoad.on('fail', function() {
                    console.error('>>> img load failed!!!');
                });
            });
        });
    };

    gushitie.showpost.init = function () {
        $("#wrapper .mainImage").css("height", ($(window).height() * 0.55) + "px");
        $('.textDiv1Link').linkify();

        calcLayoutForEachPubElement();

        var $showPosts, $test;
        $showPosts = $('.showPosts');
        $test = $('.showPosts').find('.content .gridster #test');
        if ($test.height() > 1000) {
            $('.showPosts').get(0).style.overflow = 'hidden';
            $('.showPosts').get(0).style.maxHeight = '1500px';
            $('.showPosts').get(0).style.position = 'relative';

            $showPosts.after('<div class="readmore"><div class="readMoreContent"><i class="fa fa-plus-circle"></i>继续阅读</div></div>');
        }

        initLazyload();

        $('.showPostsBox .readmore').click(function (e) {
            e.stopPropagation();
            $('.showPosts').get(0).style.overflow = '';
            $('.showPosts').get(0).style.maxHeight = '';
            $('.showPosts').get(0).style.position = '';
            $('.readmore').remove();
        });

        // register window scroll callback
        function toggleHeaderNav(show) {
            if(show) {
                if (!$('.showPosts .head').is(':visible')) {
                    $('.showPosts .head').fadeIn(300);
                }
            }
            else {
                if ($('.showPosts .head').is(':visible')) {
                    $('.showPosts .head').fadeOut(300);
                }
            }
        }

        function toggleFooterNav(show) {
            if(show) {
                if (!$('.socialContent .chatFooter').is(':visible')) {
                    $('.socialContent .chatFooter').fadeIn(300);
                }
            }
            else {
                if ($('.socialContent .chatFooter').is(':visible')) {
                    $('.socialContent .chatFooter').fadeOut(300);
                }           
            }
        }

        function scrollEventCallback() {
            var st = $(window).scrollTop();

            if (st <= 40) {
                toggleHeaderNav(true);
                toggleFooterNav(true);
                window.lastScroll = st;
                return;
            }

            // reach bottom
            if ((st + $(window).height()) === getDocHeight()) {
                fetchSuggestPosts(SUGGEST_POSTS_SKIP, SUGGEST_POSTS_LIMIT);
            }            
            //if ((st + $(window).height()) === getDocHeight()) {
            if ((getDocHeight() - (st + $(window).height())) < 150) {
                toggleHeaderNav(true);
                toggleFooterNav(true);
                window.lastScroll = st;
                return;
            }


            // scroll up
            if (window.lastScroll - st > 5) {
                toggleHeaderNav(true);
                toggleFooterNav(true);
            }

            // scroll down
            if (window.lastScroll - st < -5) {
                toggleHeaderNav(false);
                toggleFooterNav(false);
            }

            if (Math.abs(window.lastScroll - st) < 5) {
                return;
            }

            window.lastScroll = st;
        }
        $(window).scroll(scrollEventCallback);


        // register for audio/video play
        $(".postAudioItem.element .play_area").click(function() {
            var _self = this, $_self = $(this), $audio= $_self.find('audio');
            if ($_self.hasClass('music_playing')) {
                $_self.removeClass('music_playing');
                $audio.trigger('pause');
            }
            else {
                $_self.addClass('music_playing');
                $audio.trigger('play');
            }
        });
        
        $(".postVideoItem.element .play_area").click(function() {
            var _self = this, $_self = $(this), $video = $_self.find("video");

            if ($video.get(0)) {
                $video.siblings('.video_thumb').fadeOut(100);
                $video.get(0).paused ? $video.get(0).play() : $video.get(0).pause();
            }
        });

        $(".chatBtn").click(function() {
            var chat_server_url = 'testchat.tiegushi.com';
            var postId = window.location.pathname.split('/static/')[1];
            var url = 'http://'+chat_server_url+'/channel/' + postId;

            var userId = localStorage.getItem("Meteor.userId");
            if (userId) url += '/userid/' + userId;
            window.open(url,'_blank')
        });

        $(".show-post-new-message").click(function() {
          var userId = 'u8MRTTcXLoTzs9oXn';
          jQuery.get('/static/bell/' + userId, {}, function(data){
            console.log('get ajax bell data:', data);
            $('._bell-box-main').html(data);
            $('._bell-box').slideDown(300);

            // 显示消息页
            var $main = $('._bell-box-main');
            $main.find('#follow').click(function(){
              $('._bell-box').css('display', 'none');
            });
            $main.find('.contentList').click(function(){
              $('._bell-box').css('display', 'none');
            });
            $main.find('.acceptrequest').click(function(){
              $('._bell-box').css('display', 'none');
            });
          }, 'html');
        });

        // --- 评论/点评 START---
        var isRemoveParentColor = function(target, parent, isLike) {
          if(parseInt($(target).text()) > 0) {
            return false;
          }
          if($(parent).siblings('.pcomment').length > 0) {
            return false;
          }
          if(isLike && parseInt($(target.nextElementSibling).text()) > 0) {
            return false;
          }
          
          if(!isLike && parseInt($(target.previousElementSibling).text()) > 0) {
            return false;
          }
          return true;
        };
        var syncThumbs = function(pindex,type){
            const options = {
                endpoint: "ws://localhost:3000/websocket",
                SocketConstructor: WebSocket
            };
            const ddp = new appUtils.ddp(options);
            ddp.on("connected", () => {
                console.log("Connected");
            });
            postid = location.pathname.replace(/[\/]static[\/]/g, "");
            userId = 'testuser';
            const methodUpdatePcommit = ddp.method("updateThumbs", [postid,userId,pindex,type]);

            ddp.on("result", message => {
                if (message.id === methodUpdatePcommit && !message.error) {
                    console.log("点评成功!");
                }
            });
            ddp.on("ready",function(message){
                console.log('ready: '+ JSON.stringify( message));
            });
            ddp.on("added", message => {
                postdata = message.fields;
                console.log('added: '+ JSON.stringify( message));
            });
        }
        $(".thumbsUp").click(function(e) {
            var self = this;
            var pindex = $(e.currentTarget).parent().parent().parent().attr('index');
            pindex = pindex.toString();
            console.log('==点评index=='+pindex);
            if (e.target.className === "fa fa-thumbs-up thumbsUp") {
              syncThumbs(pindex,'likeDel');
              e.target.className = "fa fa-thumbs-o-up thumbsUp";
              $(self).text($(self).text().replace(/\d/g, function(m) {return m > 0 ? parseInt(m) -1 : 0;}));
              if(isRemoveParentColor(self, e.target.parentNode.parentElement, true)) e.target.parentNode.parentElement.style.color = "rgb(0,0,0)";
            } else {
              syncThumbs(pindex,'likeAdd');
              e.target.className = "fa fa-thumbs-up thumbsUp";
              e.target.parentNode.parentElement.style.color = "rgb(243,11,68)";
              $(self).text($(self).text().replace(/\d/g, function(m) {return parseInt(m) +1;}));

              if (e.target.nextElementSibling.className === "fa fa-thumbs-down thumbsDown") {
                $(self.nextElementSibling).text($(self.nextElementSibling).text().replace(/\d/g, function(m) {return m > 0 ? parseInt(m) -1 : 0;}));
                e.target.nextElementSibling.className = "fa fa-thumbs-o-down thumbsDown";
              }
            }           
        });
        $(".thumbsDown").click(function(e) {
            var self = this;
            var pindex = $(e.currentTarget).parent().parent().parent().attr('index');
            pindex = pindex.toString();
            console.log('==点评index=='+pindex);
            if (e.target.className === "fa fa-thumbs-down thumbsDown") {
              syncThumbs(pindex,'dislikeDel');
              e.target.className = "fa fa-thumbs-o-down thumbsDown";
              $(self).text($(self).text().replace(/\d/g, function(m) {return m > 0 ? parseInt(m) -1 : 0;}));
              if(isRemoveParentColor(self, e.target.parentNode.parentElement, false))  e.target.parentNode.parentElement.style.color = "rgb(0,0,0)";
            } else {
              syncThumbs(pindex,'dislikeAdd');
              e.target.className = "fa fa-thumbs-down thumbsDown";
              e.target.parentNode.parentElement.style.color = "rgb(243,11,68)";
              $(self).text($(self).text().replace(/\d/g, function(m) {return parseInt(m) +1;}));
              if (e.target.previousElementSibling.className === "fa fa-thumbs-up thumbsUp") {
                $(self.previousElementSibling).text($(self.previousElementSibling).text().replace(/\d/g, function(m) {return m > 0 ? parseInt(m) -1 : 0;}));
                e.target.previousElementSibling.className = "fa fa-thumbs-o-up thumbsUp";
              }
            }
        });

        $(".pcomments").click(function(e) {
            var self = this;
            var backgroundTop, bgheight;
            localStorage.setItem('pcommentPindex',$(e.currentTarget).parent().parent().parent().attr('index'));
            localStorage.setItem('pcommentParagraph',$(e.currentTarget).parent().parent().parent().attr('id'));
            $('.showBgColor').attr('style', 'overflow:hidden;min-width:' + $(window).width() + 'px;' + 'height:' + bgheight + 'px;');
            $('.pcommentInput,.alertBackground').fadeIn(300, function() {
              return $('#pcommitReport').focus();
            });
            $('#pcommitReport').focus();         
        });
        
        $('.alertBackground').click(function(e) {
            $('.showBgColor').removeAttr('style');
            $('.pcommentInput,.alertBackground').fadeOut(300);
        });
        var syncPcommitContent = function(pindex,pcommitContent){
            const options = {
                endpoint: "ws://localhost:3000/websocket",
                SocketConstructor: WebSocket
            };
            const ddp = new appUtils.ddp(options);
            ddp.on("connected", () => {
                console.log("Connected");
            });
            postid = location.pathname.replace(/[\/]static[\/]/g, "");
            userId = null;
            const methodUpdatePcommit = ddp.method("updatePcommitContent", [postid,userId,pindex,pcommitContent]);

            ddp.on("result", message => {
                if (message.id === methodUpdatePcommit && !message.error) {
                    console.log("评论成功!");
                }
            });
            ddp.on("ready",function(message){
                console.log('ready: '+ JSON.stringify( message));
            });
            ddp.on("added", message => {
                postdata = message.fields;
                console.log('added: '+ JSON.stringify( message));
            });
        }
        $('#pcommitReportBtn').click(function(e) {
            var self = this;
            var pcommitContent,pcommitContentHTML1,pcommitContentHTML2,pindex;
            var userName = "匿名";
            var id = localStorage.getItem('pcommentParagraph');
            pindex = localStorage.getItem('pcommentPindex');
            pcommitContent = $('#pcommitReport').val();
            console.log('==评论内容是=='+pcommitContent); 
            $('#pcommitReport').val('');
            $('.showBgColor').removeAttr('style');
            //  添加内容
            pcommitContentHTML1 = '<div class="pcomment">\
                                    <div class="eachComment">\
                                     <div class="bubble">';
            pcommitContentHTML1 += '<span class="personName">'+userName+'</span>:'+
                                    '<span class="personSay">'+pcommitContent+'</span></div></div></div>';
            pcommitContentHTML2 = '<div class="bubble"><span class="personName">'+userName+'</span>:'+
                                    '<span class="personSay">'+pcommitContent+'</span></div>';
            if($('#'+id).children('.pcomment').length > 0){
                $('#'+id + ' .pcomment').append(pcommitContentHTML2);
            } else {
                $('#'+id + ' .inlineScoring').after(pcommitContentHTML1);
            }
            calcLayoutForEachPubElement();
            syncPcommitContent(pindex,pcommitContent);
            $('.pcommentInput,.alertBackground').fadeOut(300);
        });
        // --- 评论/点评 END ---

        // --- 查看大图 ---
        $(".postImageItem").click(function() {
            var i, image, j, len, ref, selected, swipedata;
            swipedata = [];
            i = 0;
            selected = 0;
            console.log("=============click on image index is: " + this.index);
            ref = postdata.pub;
            for (j = 0, len = ref.length; j < len; j++) {
              image = ref[j];
              if (image.imgUrl) {
                if (image.imgUrl === this.imgUrl) {
                  selected = i;
                }
                swipedata.push({
                  href: image.imgUrl,
                  title: image.text
                });
                i++;
              }
            }
            return $.swipebox(swipedata, {
              initialIndexOnArray: selected,
              hideCloseButtonOnMobile: true,
              loopAtEnd: false
            });
        });

        // --查看大图 END --- 
        fetchSuggestPosts(SUGGEST_POSTS_SKIP, SUGGEST_POSTS_LIMIT);
    };
})(window);