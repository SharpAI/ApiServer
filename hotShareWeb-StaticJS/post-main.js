(function(global) {
    require("./libs/jquery.lazyload.1.9.3");
    require("./libs/jquery.linkify");
    require("./libs/image-fit-cover");

    if (!global.gushitie) global.gushitie = {};

    var gushitie = global.gushitie;
    gushitie.showpost = {};

    var predefineColors = ["#55303e", "#503f32", "#7e766c", "#291d13", "#d59a73", "#a87c5f", "#282632", "#ca9e92", "#a7a07d", "#846843", "#6ea89e", "#292523", "#637168", "#573e1b", "#925f3e", "#786b53", "#aaa489", "#a5926a", "#6a6b6d", "#978d69", "#a0a1a1", "#4b423c", "#5f4a36", "#b6a2a9", "#1c1c4e", "#e0d9dc", "#393838", "#c5bab3", "#a46d40", "#735853", "#3c3c39"];

    var colorIndex = 0, colorLength = predefineColors.length;

    var padding = {};

    var debugPrint = function(msg) {
        if (false) {
            console.log(msg);
        }
    };

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

    this.getNewFriendReadCount = function(data){
      try{
        var newFriendReadCount = parseInt($('#newFriendRedSpot').html());
        var datacount = data.length;
        debugPrint('newFriendReadCount is ' + newFriendReadCount);
        var totalCount = newFriendReadCount + datacount;
        if(newFriendReadCount && newFriendReadCount > 0){
            debugPrint('newFriendReadCount');
            if(datacount > 0) {
                $.each(data,function(index,content){
                    var userId = this.ta;
                    if(window.localStorage.getItem('newFriendRead_'+userId)){
                        $('#'+ userId +' .red_spot').hide();
                        debugPrint('count plus 1');
                        totalCount-=1;
                    }
                });
                if(totalCount > 0){
                    $('#newFriendRedSpot').show();
                    $('#newFriendRedSpot').html(totalCount);
                }else{
                    $('#newFriendRedSpot').hide();
                }
            }
            debugPrint('final count is ' + newFriendReadCount);
        }else{
            if(datacount > 0) {
                $.each(data,function(index,content){
                    var userId = this.ta;
                    if(window.localStorage.getItem('newFriendRead_'+userId)){
                        datacount--;
                    }
                });
                if(datacount > 0){
                    $('#newFriendRedSpot').show();
                    $('#newFriendRedSpot').html(datacount);
                }else{
                    $('#newFriendRedSpot').hide();
                }
            }
        }
      }catch (e){
        return;
      }
    };
    this.calcLayoutForEachPubElement = function() {
        var layoutHelper = [0, 0, 0, 0, 0, 0];
        var imageMarginPixel = 5;

        // $('#test').css('display', 'block');
        $("#test .element").each(function(index) {
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

    function init() {
        $("#wrapper .mainImage").css("height", (window.screen.height * 0.55) + "px");
        $('.textDiv1Link').linkify();
        localStorage.setItem('newFriendsCounts',20);

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

        debugPrint('post rended.');
        debugPrint('test height:', $('#test').height());
        //$('.full-wait-loading').hide();
        $('.showPostsBox').removeClass('default');

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

        try{
            $('video')[0].onplaying=function(e) {
                var $curVideo, $node;
                $node = $(e.currentTarget).parent();
                if ($node) {
                    $curVideo = $node.find("video");
                    if ($curVideo && $curVideo.get(0)) {
                        return $curVideo.siblings('.video_thumb').fadeOut(100);
                    }
                }
            };
        } catch (e){
            debugPrint("no Video");
        }
        $(".postVideoItem.element .play_area").click(function(e) {
            var _self = this, $_self = $(this);
            var $node=$(e.currentTarget);
            var $video = $node.find("video");
            if ($video.get(0)) {
                $video.siblings('.video_thumb').fadeOut(100);
                $video.get(0).paused ? $video.get(0).play() : $video.get(0).pause();
            }
        });

        $(".chatBtn").click(function() {
            var chat_server_url = 'testchat.tiegushi.com';
            var url = 'http://'+chat_server_url+'/channel/' + postid;

            var userId = localStorage.getItem("Meteor.userId");
            if (userId) url += '/userid/' + userId;
            window.open(url,'_blank')
        });
        $(".postTextItem").click(function() {
            debugPrint('Need trigger section repost.')
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
                    var pindex,url;
                    pindex = parseInt($self.attr('index'));
                    url = '/t/'+postid+'/'+pindex;
                    debugPrint($self.attr('index'));
                    debugPrint('Event: '+event+' Button: '+buttonClicked);
                    window.location.href = url;
                });

                $self.data('toolbarObj').show();
            }
        });

        var showBellBox = function() {
          $('._bell-box').slideDown(300);
        //   var userId = window._loginUserId || 'u8MRTTcXLoTzs9oXn';
        //   $('.wait-loading').show();
        //   jQuery.get('/t/bell/' + userId, {}, function(data){
        //     $('.wait-loading').hide();
        //     debugPrint('get ajax bell data:', data);
        //     $('._bell-box-main').html(data);
        //     $('._bell-box').slideDown(300);

        //     // 显示消息页
        //     var $main = $('._bell-box-main');
        //     $main.find('#follow').click(function(){
        //       $('._bell-box').css('display', 'none');
        //     });
        //     $main.find('.contentList').click(function(){
        //       debugPrint('feed id:', $(this).attr('data-id'));
        //       window._bell.contentList($(this).attr('data-id'));
        //       $('._bell-box').css('display', 'none');
        //       // calcLayoutForEachPubElement();
        //       if($(this).attr('data-id'))
        //         location = '/t/' + $(this).attr('data-id');
        //     });
        //     // $main.find('.acceptrequest').click(function(){
        //     //   window._bell.acceptrequest('');
        //     //   $('._bell-box').css('display', 'none');
        //     // });
        //   }, 'html');
        };
        $(".show-post-new-message").click(function(){showBellBox()});
        $(".div_me .set-up .bell").click(function(){showBellBox()});
        $('._bell-box .head').click(function(){
          window.CallMethod('clearUserBellWaitReadCount',[window._loginUserId]);
          $('._bell-box,.msg-box, _bell-box .readTips').css('display', 'none');
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
            CallMethod("updateThumbs", [postid,window._loginUserId,pindex,type],function(result,message){
                debugPrint(message)
            })
        }
        $(".thumbsUp").click(function(e) {
            var self = this;
            var pindex = $(e.currentTarget).parent().parent().parent().attr('index');
            pindex = parseInt(pindex);
            debugPrint('==点评index=='+pindex);
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
            debugPrint('==点评index=='+pindex);
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
            CallMethod("updatePcommitContent", [postid,window._loginUserId,pindex,pcommitContent],function(result,message){
                debugPrint(message)
            })
        }
        $('#pcommitReportBtn').click(function(e) {
            var self = this;
            var pcommitContent,pcommitContentHTML1,pcommitContentHTML2,pindex;
            var userName = "匿名";
            if (typeof getMyUserInfo !== 'undefined'){
                var myInfo = getMyUserInfo();
                if (myInfo){
                    if (myInfo.profile && myInfo.profile.fullname) {
                        userName = myInfo.profile.fullname;
                    } else if(myInfo.username){
                        userName = myInfo.username;
                    }
                }
            }
            var id = localStorage.getItem('pcommentParagraph');
            pindex = parseInt(localStorage.getItem('pcommentPindex'));
            pcommitContent = $('#pcommitReport').val();
            debugPrint('==评论内容是=='+pcommitContent);
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

        $(".postBtn").click(function(){
            $('.div_me_set-up-sex,.div_me_set-up-nike').css('display', 'none');
            $(".contactsBtn, .postBtn, .discoverBtn, .meBtn").removeClass('focusColor');
            $(".postBtn").addClass('focusColor');
            if($('.contactsList .head').is(':visible')){
                $('.contactsList .head').fadeOut(300);
            }
            $('body').css('overflow-y','auto');
            $('.div_contactsList').css('display',"none");
            $('.div_me').css('display',"none");
            document.body.scrollTop = 0;
        });
        $(".contactsBtn").click(function(){
             $('.div_me_set-up-sex,.div_me_set-up-nike').css('display', 'none');
             localStorage.setItem('documentCurrTop',document.body.scrollTop);
             if($('.eachViewer').length <= 1){
                 $('.wait-loading').show();
             }
             $('.socialContent .chatFooter').fadeIn(300);
             $('body').css('overflow-y','hidden');
             //trackEvent("socialBar","Newfrineds");
             $(".contactsBtn, .postBtn, .discoverBtn, .meBtn").removeClass('focusColor');
             $(".contactsBtn").addClass('focusColor');
             $('.div_contactsList').css('display',"block");
             $('.div_me').css('display',"none");
         });
        $(".meBtn").click(function(){
            localStorage.setItem('documentCurrTop',document.body.scrollTop);
            $('.socialContent .chatFooter').fadeIn(300);
            $('body').css('overflow-y','hidden');
            //trackEvent("socialBar","Me")
            //Session.set('favouritepostsLimit', 0);
            $(".contactsBtn, .postBtn, .discoverBtn, .meBtn").removeClass('focusColor');
            $(".meBtn").addClass('focusColor');
            $('.div_contactsList').css('display',"none");
            $('.div_me').css('display',"block");
        });
        $(".div_contactsList .left-btn").click(function() {
            document.body.scrollTop = 0;
            $('.div_contactsList').css('display',"none");
            $('body').css('overflow-y','auto');
            $(".contactsBtn").removeClass('focusColor');
            $(".postBtn").addClass('focusColor');
        });
        // --查看大图 END ---

        //fetchSuggestPosts(SUGGEST_POSTS_SKIP, SUGGEST_POSTS_LIMIT);

        // --作者热门文章--
        /*$("#author-hot-posts").load("/t/author-hot-posts/"+postid, function(){
          $("#author-hot-posts dl").each(function(){
            $(this).click(function(e){
              location = '/t/' + $(event.currentTarget).attr('data-id');
            });
          });
        });*/

        // --我--
        $('.div_me .set-up .nickname').click(function(){
          $('.div_me').hide(0, function(){
            $('.div_me_set-up-nike').show(0, function(){
              $('body').scrollTop($('.div_me_set-up-nike').offset().top);
            });
          });
        });
        $('.div_me .socialTitle .left-btn').click(function(){
            document.body.scrollTop = 0;
            $(".contactsBtn, .postBtn, .discoverBtn, .meBtn").removeClass('focusColor');
            $('body').css('overflow-y','auto');
            $(".postBtn").addClass('focusColor');
            $('.div_me').css('display', 'none');
        });
        $('.div_me_set-up-nike .left-btn').click(function(){$('.div_me').css('display', 'block');$('.div_me_set-up-nike').css('display', 'none')});
        $('.div_me_set-up-nike .right-btn').click(function(){
          if(!$('#div_me_set-up-nike-input').val())
            return alert('请输入昵称~');

          window.CallMethod('updateUserNike', [window._loginUser._id, $('#div_me_set-up-nike-input').val()]);
          $('.div_me').css('display', 'block');$('.div_me_set-up-nike').css('display', 'none');
        });

        $('.div_me .set-up .sex').click(function(){
          $('.div_me').css('display', 'none');
          $('.div_me_set-up-sex').css('display', 'block');
          $('body').scrollTop($('.div_me_set-up-sex').offset().top);
        });
        $('.div_me_set-up-sex .left-btn').click(function(){$('.div_me').css('display', 'block');$('.div_me_set-up-sex').css('display', 'none')});
        $('.div_me_set-up-sex .setMale').click(function(){
          window.CallMethod('updateUserSex', [window._loginUser._id, 'male']);
          $('.div_me').css('display', 'block');$('.div_me_set-up-sex').css('display', 'none');
        });
        $('.div_me_set-up-sex .setFemale').click(function(){
          window.CallMethod('updateUserSex', [window._loginUser._id, 'female']);
          $('.div_me').css('display', 'block');$('.div_me_set-up-sex').css('display', 'none');
        });
        document.addEventListener('users', function(e){
          var message = e.detail;
          window._loginUser = message.fields;
          // window._loginUser._id = 'PEc8YjSCheMN4qzcC';
          window._loginUser._id = message.id;

          $('.div_me .nickname .value').html(window._loginUser.profile.fullname + '<i class="fa fa-angle-right"></i>');
          $('#div_me_set-up-nike-input').val(window._loginUser.profile.fullname);
          $('.div_me .sex .value').html((window._loginUser.profile.sex ? (window._loginUser.profile.sex === 'male' ? '男' : '女') : '[未知]') + '<i class="fa fa-angle-right"></i>');

          window.CallMethod('profileData', [window._loginUser._id], function(type,result){
            debugPrint('profileData:', result);
            // 喜欢故事
            var favouriteposts = '';
            result.favouritePosts.forEach(function(item) {
                favouriteposts += '<a href="http://'+window.location.host+'/t/'+item._id+'" style="color: #5A5A5A;"><div id="'+item._id+'" style="border-radius: 5px; background-color: #f7f7f7;">'+
                    '<div class="img_placeholder" style="'+
                    'margin: 0 0.125em 1em;-moz-page-break-inside: avoid;-webkit-column-break-inside: avoid;break-inside: avoid;background: white;border-radius:4px;">'+
                        '<img class="mainImage" src="'+item.mainImage+'" style="width: 100%;border-radius: 4px 4px 0 0;"/>'+
                    '<p class="title" style="font-size: 16px;font-weight: bold;white-space: pre-line;word-wrap: break-word;margin: 10px;">'+item.title+'</p>'+
                    '<p class="addontitle" style="font-size:11px;margin: 10px;">'+item.addontitle+'</p>'+
                    '</div></div></a>';
            });
            $('.favposts').attr('style', 'padding: 10px;background: #F1F1F1;-moz-column-count: 2;-webkit-column-count: 2;column-count: 2;-moz-column-width: 10em;-webkit-column-width: 10em;column-width: 10em;-moz-column-gap: 1em;-webkit-column-gap: 1em;column-gap: 1em;')
            $(".favposts").html(favouriteposts);

            // 发表的故事
            favouriteposts = '';
            result.mePosts.forEach(function(item) {
                favouriteposts += '<a href="http://'+window.location.host+'/t/'+item._id+'" style="color: #5A5A5A;"><li id="'+item.postId+'">'+
                    '<div class="img" style="background-image: url('+item.mainImage+');"></div>'+
                    '<h1>'+item.title+'</h1></li></a>';
            });
            favouriteposts += '<div class="clear"></div>';
            $(".mePosts").html(favouriteposts);
          });
        }, false);

        // ---- 关注作者 START----
        if ($('.authorInfos .subscribe').attr('id') !== window._loginUserId){
            $('#SubscribeAuthor').show();
        }
        $('.authorReadPopularPostItem').click(function(){
            var url = '/t/'+ $(this).attr('id');
            window.open(url,'_system');
        });
        $('.subscribeAutorPage .cannelBtn,.subscribeAutorPage .bg').on('click', function(){
            $('.subscribeAutorPage').hide();
        });
        $('.subscribeAutorPage .okBtn').on('click', function(){
            // var $self = $('.subscribeAutorPage');
            var email,qqValueReg,mailValueReg;
            email = $('#email').val();
            debugPrint(email);
            // 验证电子邮件合法性
            qqValueReg = new RegExp(/^[1-9][0-9]{4,9}$/);
            mailValueReg = new RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/);
            if (email === '' || !mailValueReg.test(email) && !qqValueReg.test(email)){
                $('.subscribeAutorPage .help-block').html('请输入正确的QQ号或Email');
                return false;
            }
            if (qqValueReg.test(email)){
                email += '@qq.com';
            }
            $('.subscribeAutorPage').hide();
            // 更新关注Email,  updateSubscribeAutorEmail params[author,userId,email]
            window.CallMethod('updateSubscribeAutorEmail',[$(".showPosts .user").attr("id"),window._loginUser._id,email],function (type,result){
                debugPrint('profileData is ==:'+JSON.stringify(result));
                if(result.msg === 'success') {
                    toastr.success('您已成功关注作者'+$(".showPosts .user .name").html()+'，确认邮件将很快（10分钟左右）送达，谢谢！','关注成功')
                } else {
                    toastr.error('关注失败，再试一次吧~')
                }
            });
        });
        // ---- 关注作者 END----

        // ---- 私信作者 START ----
        $('#sendEmail').click(function(){
            $('.sendAuthorEmail,.authorEmailAlertBackground').show();
        });
        this.hideAuthorEmail = function(){
            $('.sendAuthorEmail,.authorEmailAlertBackground').hide();
        }
        this.sendAuthorEmail = function() {
            var content, doc, mailAddress, mailValueReg, post, qqValueReg, userIcon, userId, username;
            mailAddress = $('#authorEmail').val();
            content = $('#sendContent').val();
            // post = Session.get("postContent");
            qqValueReg = RegExp(/^[1-9][0-9]{4,9}$/);
            mailValueReg = RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/);
            if (!mailValueReg.test(mailAddress) && !qqValueReg.test(mailAddress)) {
                toastr.info('请输入正确的QQ号或Email');
                return false;
            }
            if (qqValueReg.test(mailAddress)) {
                mailAddress += '@qq.com';
            }
            if (content === '') {
                toastr.info('请输入私信内容');
            return false;
            }
            $("#sendContent").val('');
            $('.sendAuthorEmail,.authorEmailAlertBackground').hide();
            // sendAuthorEmail params[author,postid,email,content]
            window.CallMethod('sendAuthorEmail',[window._loginUser._id,window.postid,mailAddress,content]);
        }
        // ---- 私信作者 END ---
    };
    $(document).ready(function(){
        init();
    })
})(window);
