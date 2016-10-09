(function(global) {
    window.$ = window.jQuery = require("jquery");
    require("./libs/jquery.lazyload.1.9.3");
    require("./libs/jquery.linkify");
    require("./libs/image-fit-cover");
    require('./libs/wechatapi');
    var imagesLoaded = require("imagesloaded");

    if (!global.gushitie) global.gushitie = {};

    var gushitie = global.gushitie;
    gushitie.showpost = {};


    var SUGGEST_POSTS_SKIP = 0;
    var SUGGEST_POSTS_LIMIT = 5;
    var SUGGEST_POSTS_LOADING = false;
    var predefineColors = ["#55303e", "#503f32", "#7e766c", "#291d13", "#d59a73", "#a87c5f", "#282632", "#ca9e92", "#a7a07d", "#846843", "#6ea89e", "#292523", "#637168", "#573e1b", "#925f3e", "#786b53", "#aaa489", "#a5926a", "#6a6b6d", "#978d69", "#a0a1a1", "#4b423c", "#5f4a36", "#b6a2a9", "#1c1c4e", "#e0d9dc", "#393838", "#c5bab3", "#a46d40", "#735853", "#3c3c39"];

    var colorIndex = 0, colorLength = predefineColors.length;

    var padding = {};

    padding.setRandomlyBackgroundColor = function($node) {
        $node.css("background-color", predefineColors[colorIndex]);
        if (++colorIndex >= colorLength) colorIndex = 0;
    };

    global.padding = padding;

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
      for (var i = col; i <= col+sizeX -1; i++) {
        max = Math.max(max, helper[(i - 1)]);
      }
      return max;
    };

    var updateLayoutData = function(helper, col, sizeX, bottom) {
      for (var i = col; i <= col+sizeX -1; i++) {
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

    this.calcLayoutForEachPubElement = function() {
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

    function initLazyload() {
        $(".padding-overlay").siblings("img.lazy").each(function() {
            var $lazyItem = $(this);
            $lazyItem.lazyload({
                effect: "fadeIn",
                effectspeed: 600,
                threshold: 200,
                placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
                load: function() {
                    $(this).parent().actImageFitCover('style');
                }
            });
            padding.setRandomlyBackgroundColor($lazyItem);
        });
    }
    var processSuggestPostsData = function(data){
        var posts = data;
        var counter = posts.length;
        var html = '';
        posts.forEach(function(post) {
            if(post.ownerName){
                var poster =  '<h1 class="username">' + post.ownerName + '<span>发布</span><button class="suggestAlreadyRead"><i class="fa fa-times"></i></button></h1>'
            } else if(post.reader){
                var poster =  '<h1 class="username">' + post.reader + '<span>读过</span><button class="suggestAlreadyRead"><i class="fa fa-times"></i></button></h1>'
            }
            html += '<div class="newLayout_element" data-postid="' + post.postId + '">'
                + '<div class="img_placeholder">'
                + '<img class="mainImage" src="' + post.mainImage+ '" />'
                + '</div>'
                + '<div class="pin_content">'
                + '<p class="title">' + post.title + '</p>'
                + '<p class="addontitle">' + post.addontitle + '</p>'
                + poster
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
    }
    var fetchSuggestPosts = function(skip, limit) {
        if(typeof CallMethod === 'undefined'){
            return
        }
        window.fetchedSuggestPosts = true;
        if(SUGGEST_POSTS_LOADING) return;
        SUGGEST_POSTS_LOADING = true;
        console.log('>>> Begin to fetch suggest posts <<<');
        SUGGEST_POSTS_SKIP += SUGGEST_POSTS_LIMIT;
        CallMethod('getSuggestedPosts',[postid,skip,limit],function(type,result){
            console.log('getSuggestedPosts: '+JSON.stringify(result));
            processSuggestPostsData(result);
        });
        /*
        var url = '/static/data/suggestposts/123/' + skip + '/' + limit;
        SUGGEST_POSTS_SKIP += SUGGEST_POSTS_LIMIT;
        $.getJSON(url, function(data) {
            processSuggestPostsData(data.data);
        });
        */
    };

    function init() {
        $("#wrapper .mainImage").css("height", ($(window).height() * 0.55) + "px");
        $('.textDiv1Link').linkify();

        calcLayoutForEachPubElement();
        initLazyload();
        var $showPosts, $test;
        $showPosts = $('.showPosts');
        $test = $('.showPosts').find('.content .gridster #test');
        if ($test.height() > 1000) {
            $('.showPosts').get(0).style.overflow = 'hidden';
            $('.showPosts').get(0).style.maxHeight = '1500px';
            $('.showPosts').get(0).style.position = 'relative';

            $showPosts.after('<div class="readmore"><div class="readMoreContent"><i class="fa fa-plus-circle"></i>继续阅读</div></div>');
        }

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
        $(".postTextItem").click(function() {
            console.log('Need trigger section repost.')
            var $self, toolbar;

            $self = $(this);

            toolbar = $self.data('toolbarObj');

            if (!toolbar) {
                $self.toolbar({
                    content: '.section-toolbar',
                    position: 'bottom',
                    hideOnClick: true
                });
                $self.on('toolbarItemClick', function(event, buttonClicked) {
                    //sectionToolbarClickHandler(self, event, buttonClicked);
                    var pindex;
                    pindex = parseInt($self.attr('index')) +1;
                    var newLineHTML = '第'+pindex+'段 '+$('#wx-title').html();
                    $(".newline a").html(newLineHTML);
                    $(".newLine-paragraph").html($('#'+$self.attr('id')+' .textDiv1Link').html());
                    $(".head-top-border").show();
                    calcLayoutForEachPubElement();
                    document.body.scrollTop = 0;
                    console.log($self.attr('index'));
                    console.log('Event: '+event+' Button: '+buttonClicked);
                });

                $self.data('toolbarObj').show();
            }
        });

        $(".show-post-new-message").click(function() {
          var userId = window._loginUserId || 'u8MRTTcXLoTzs9oXn';
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
              console.log('feed id:', $(this).attr('data-id'));
              window._bell.contentList($(this).attr('data-id'));
              $('._bell-box').css('display', 'none');
              // calcLayoutForEachPubElement();
              if($(this).attr('data-id'))
                location = '/static/' + $(this).attr('data-id');
            });
            // $main.find('.acceptrequest').click(function(){
            //   window._bell.acceptrequest('');
            //   $('._bell-box').css('display', 'none');
            // });
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
            // It will be very hard to maintain the DDP connection if you initial it from everywhere in the code.
            /*const options = {
                endpoint: "ws://localhost:3000/websocket",
                SocketConstructor: WebSocket
            };
            const ddp = new appUtils.ddp(options);
            ddp.on("connected", () => {
                console.log("Connected");
            });
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
            });*/
            postid = location.pathname.replace(/[\/]static[\/]/g, "");
            CallMethod("updateThumbs", [postid,window._loginUserId,pindex,type],function(result,message){
                console.log(message)
            })
        }
        $(".thumbsUp").click(function(e) {
            var self = this;
            var pindex = $(e.currentTarget).parent().parent().parent().attr('index');
            pindex = parseInt(pindex);
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
            pindex = parseInt(pindex);
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
            // It will be very hard to maintain the DDP connection if you initial it from everywhere in the code.
            /*const options = {
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
            });*/
            postid = location.pathname.replace(/[\/]static[\/]/g, "");
            CallMethod("updatePcommitContent", [postid,window._loginUserId,pindex,pcommitContent],function(result,message){
                console.log(message)
            })
        }
        $('#pcommitReportBtn').click(function(e) {
            var self = this;
            var pcommitContent,pcommitContentHTML1,pcommitContentHTML2,pindex;
            var userName = "匿名";
            var id = localStorage.getItem('pcommentParagraph');
            pindex = parseInt(localStorage.getItem('pcommentPindex'));
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
            var selected, swipedata;
            swipedata = [];
            selected = 0;

            var selectedImage = $(this).find('img').attr('data-original');
            $('.postImageItem').map(function(index,item){
                var imgUrl = $(item).find('img').attr('data-original');
                if(imgUrl){
                    if(selectedImage === imgUrl){
                        selected = index
                    }
                    swipedata.push({
                        href: imgUrl,
                        title: ''
                    });
                }
            });
            return $.swipebox(swipedata, {
              initialIndexOnArray: selected,
              hideCloseButtonOnMobile: true,
              loopAtEnd: false
            });
        });
        $(".postBtn").click(function(){
            $(".contactsBtn, .postBtn, .discoverBtn, .meBtn").removeClass('focusColor');
            $(".postBtn").addClass('focusColor');
            if($('.contactsList .head').is(':visible')){
                $('.contactsList .head').fadeOut(300);
            }
            document.body.scrollTop = 0
        });
        $(".discoverBtn").click(function(){
            document.body.scrollTop = $(".showPostsBox").height();
            if(typeof window.fetchedSuggestPosts === 'undefined'){
                fetchSuggestPosts(SUGGEST_POSTS_SKIP, SUGGEST_POSTS_LIMIT);
            }
            $(".contactsBtn, .postBtn, .discoverBtn, .meBtn").removeClass('focusColor');
            $(".discoverBtn").addClass('focusColor');
            $('.div_contactsList').css('display',"none");
            $('.div_discover').css('display',"block");
            $('.div_me').css('display',"none");
        });
        $(".contactsBtn").click(function(){
            //trackEvent("socialBar","Newfrineds");
            $(".contactsBtn, .postBtn, .discoverBtn, .meBtn").removeClass('focusColor');
            $(".contactsBtn").addClass('focusColor');
            $('.div_contactsList').css('display',"block");
            $('.div_discover').css('display',"none");
            $('.div_me').css('display',"none");
            document.body.scrollTop = $(".showPostsBox").height()
        });
        $(".meBtn").click(function(){
            //trackEvent("socialBar","Me")
            //Session.set('favouritepostsLimit', 0);
            $(".contactsBtn, .postBtn, .discoverBtn, .meBtn").removeClass('focusColor');
            $(".meBtn").addClass('focusColor');
            $('.div_contactsList').css('display',"none");
            $('.div_discover').css('display',"none");
            $('.div_me').css('display',"block");
            //document.body.scrollTop = $(".showPostsBox").height();
            $('body').scrollTop($('.div_me').offset().top);        
        });
        // --查看大图 END --- 
        
        // ---- Profile START ----
        var preProfileInfo = function(userId) {
            window.CallMethod('profileData',[userId],function (type,result){
                console.log('profileData is ==:'+JSON.stringify(result));
                // 写入user数据
                $(".theprofileName").html(result.userProfile.name);
                $(".userProfileTop .icon").attr('src',result.userProfile.icon);
                $(".userProfileTop .location").html(result.userProfile.location);
                $(".userProfileTop .desc").html(result.userProfile.desc);
                // 写入最近浏览的故事
                var recentReviewPost = '';
                var favouriteposts = '';
                result.recentViewPosts.forEach(function(item){
                    recentReviewPost += '<a href="http://'+window.location.host+'/static/'+item._id+'" style="color: #5A5A5A;"><li id="'+item.postId+'">'+
                                        '<div class="postMainImage no-swipe" style="background-image:url('+item.mainImage+')"></div>'+
                                        '<h6 class="title" style="text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">'+
                                        item.title+'</h6></li></a>';
                });
                
                // 写入喜欢的故事
                
                result.favouritePosts.forEach(function(item) {
                    favouriteposts += '<a href="http://'+window.location.host+'/static/'+item._id+'" style="color: #5A5A5A;"><div id="'+item._id+'" style="border-radius: 5px; background-color: #f7f7f7;">'+
                                        '<div class="img_placeholder" style="'+
                                        'margin: 0 0.125em 1em;-moz-page-break-inside: avoid;-webkit-column-break-inside: avoid;break-inside: avoid;background: white;border-radius:4px;">'+
                                            '<img class="mainImage" src="'+item.mainImage+'" style="width: 100%;border-radius: 4px 4px 0 0;"/>'+
                                        '<p class="title" style="font-size: 16px;font-weight: bold;white-space: pre-line;word-wrap: break-word;margin: 10px;">'+item.title+'</p>'+
                                        '<p class="addontitle" style="font-size:11px;margin: 10px;">'+item.addontitle+'</p>'+
                                        '</div></div></a>';
                });
                $(".recentViewPosts").html(recentReviewPost);
                $(".favoritePosts").html(favouriteposts);
                
            });
        };
        this.showProfilePage = function(userId) {
            localStorage.setItem('documentCurrTop',document.body.scrollTop);
            document.body.scrollTop = 0;
            preProfileInfo(userId);
            $(".userProfileBox").show();
        }
        $(".showPosts .user").click(function(){
            showProfilePage($(".showPosts .user").attr("id"));
        });

        $(".userProfileBox .leftButton").click(function(){
            document.body.scrollTop = localStorage.getItem('documentCurrTop');
            $(".userProfileBox").hide();
        });
        // ---- Profile END ----
        //fetchSuggestPosts(SUGGEST_POSTS_SKIP, SUGGEST_POSTS_LIMIT);        

        // --作者热门文章--
        $("#author-hot-posts").load("/static/author-hot-posts/"+location.pathname.replace(/[\/]static[\/]/g, "")+"?r=" + Math.random(), function(){
          $("#author-hot-posts dl").each(function(){
            $(this).click(function(e){
              location = '/static/' + $(event.currentTarget).attr('data-id');
            });
          });
        });

        // --我--
        $('.div_me .set-up .nickname').click(function(){
          $('.div_me').hide(0, function(){
            $('.div_me_set-up-nike').show(0, function(){
              $('body').scrollTop($('.div_me_set-up-nike').offset().top);
            });
          });
        });
        $('.div_me_set-up-nike .left-btn').click(function(){$('.div_me').show(0);$('.div_me_set-up-nike').hide(0)});
        $('.div_me_set-up-nike .right-btn').click(function(){
          if(!$('#div_me_set-up-nike-input').val())
            return alert('请输入昵称~');

          window.CallMethod('updateUserNike', [window._loginUser._id, $('#div_me_set-up-nike-input').val()]);
          $('.div_me').show(0);$('.div_me_set-up-nike').hide(0);
        });

        $('.div_me .set-up .sex').click(function(){
          $('.div_me').hide(0, function(){
            $('.div_me_set-up-sex').show(0, function(){
              $('body').scrollTop($('.div_me_set-up-sex').offset().top);
            });
          });
        });
        $('.div_me_set-up-sex .left-btn').click(function(){$('.div_me').show(0);$('.div_me_set-up-sex').hide(0)});
        $('.div_me_set-up-sex .setMale').click(function(){
          window.CallMethod('updateUserSex', [window._loginUser._id, 'male']);
          $('.div_me').show(0);$('.div_me_set-up-sex').hide(0);
        });
        $('.div_me_set-up-sex .setFemale').click(function(){
          window.CallMethod('updateUserSex', [window._loginUser._id, 'female']);
          $('.div_me').show(0);$('.div_me_set-up-sex').hide(0);
        });
        document.addEventListener('users', function(e){
          var message = e.detail;
          window._loginUser = message.fields;
          // window._loginUser._id = 'n6uTgF6TbHdtqQbYK';
          window._loginUser._id = message.id;

          $('.div_me .nickname .value').html(window._loginUser.profile.fullname + '<i class="fa fa-angle-right"></i>'); 
          $('#div_me_set-up-nike-input').val(window._loginUser.profile.fullname);
          $('.div_me .sex .value').html((window._loginUser.profile.sex ? (window._loginUser.profile.sex === 'male' ? '男' : '女') : '[未知]') + '<i class="fa fa-angle-right"></i>');

          // 喜欢故事
          window.CallMethod('profileData', [window._loginUser._id], function(type,result){
            console.log("==============", result);
            var favouriteposts = '';
            result.favouritePosts.forEach(function(item) {
                favouriteposts += '<a href="http://'+window.location.host+'/static/'+item._id+'" style="color: #5A5A5A;"><div id="'+item._id+'" style="border-radius: 5px; background-color: #f7f7f7;">'+
                    '<div class="img_placeholder" style="'+
                    'margin: 0 0.125em 1em;-moz-page-break-inside: avoid;-webkit-column-break-inside: avoid;break-inside: avoid;background: white;border-radius:4px;">'+
                        '<img class="mainImage" src="'+item.mainImage+'" style="width: 100%;border-radius: 4px 4px 0 0;"/>'+
                    '<p class="title" style="font-size: 16px;font-weight: bold;white-space: pre-line;word-wrap: break-word;margin: 10px;">'+item.title+'</p>'+
                    '<p class="addontitle" style="font-size:11px;margin: 10px;">'+item.addontitle+'</p>'+
                    '</div></div></a>';
            });
            $('.favposts').attr('style', 'padding: 10px;background: #F1F1F1;-moz-column-count: 2;-webkit-column-count: 2;column-count: 2;-moz-column-width: 10em;-webkit-column-width: 10em;column-width: 10em;-moz-column-gap: 1em;-webkit-column-gap: 1em;column-gap: 1em;')
            $(".favposts").html(favouriteposts);
          }); 
        }, false);
    };
    init();
})(window);