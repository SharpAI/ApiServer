(function() {
    require('./libs/wechatapi');
    require("./libs/ddp");
    window.Hammer = require("./libs/hammer.min");
    require("./libs/wookmark");
    require("./libs/jquery.swipebox.1.3.0.2");
    window.scrollMonitor = require("./libs/scrollMonitor.1.0.12");
    require("./libs/jquery.toolbar");
    window.toastr = require("./libs/toastr.min");
    require("./libs/swipe");
    var imagesLoaded = require("imagesloaded");
    var debugPrint = function (msg) {
        // console.log(msg);
    };

    var usersInformation = {};
    var userCollection = {};

    function loadScript(url, callback) {
        jQuery.ajax({
            url: url,
            dataType: 'script',
            success: callback,
            async: true,
            cache: true
        });
    }

    function isWeiXinFunc() {
        var M, ua;
        ua = window.navigator.userAgent.toLowerCase();
        M = ua.match(/MicroMessenger/i);
        if (M && M[0] === 'micromessenger') {
            return true;
        } else {
            return false;
        }
    }
    
    const GetTime0 = function (dateM) {
        var MinMilli = 1000 * 60;         // 初始化变量。
        var HrMilli = MinMilli * 60;
        var DyMilli = HrMilli * 24;
        //计算出相差天数
        var days = Math.floor(dateM / (DyMilli));

        //计算出小时数
        var leave1 = dateM % (DyMilli); //计算天数后剩余的毫秒数
        var hours = Math.floor(leave1 / (HrMilli));
        //计算相差分钟数
        var leave2 = leave1 % (HrMilli);        //计算小时数后剩余的毫秒数
        var minutes = Math.floor(leave2 / (MinMilli));
        //计算相差秒数
        var leave3 = leave2 % (MinMilli);      //计算分钟数后剩余的毫秒数
        var seconds = Math.round(leave3 / 1000);

        var prefix;
        if (dateM > DyMilli)
            prefix = days + "天前";
        else if (dateM > HrMilli)
            prefix = hours + "小时前";
        else if (dateM > MinMilli)
            prefix = minutes + "分钟前";
        else if (dateM <= MinMilli) {
            if (seconds <= 0)
                prefix = "刚刚";
            else
                prefix = seconds + "秒前";
        } else
            prefix = "";
        return prefix;
    }

    var $bellHtml = $('.show-post-new-message ._count');

    var userNewBellCountHandle = function (e1) {
        var message = e1.detail;
        debugPrint('userNewBellCount:' + JSON.stringify(message));
        var count = message.fields.count;
        if (count <= 0) {
            $('.show-post-new-message').hide();
        } else {
            $bellHtml.html(count);
            window.bellNewCount = count;
            $('.show-post-new-message').show();
        }

        // render bell page
        if (!message.fields.feeds || message.fields.feeds.length <= 0)
            return $('._bell-box .content').html('');

        var html = '';
        var index = 0;
        var typeName = '';
        var notRead = function (read, check, _index, createAt) {
            if ((new Date() - new Date(createAt).getTime()) > (7 * 24 * 3600 * 1000))
                return false;
            if (_index > 20)
                return false;
            if (check || read)
                return false;
            else if (arguments.length === 2)
                return false;
            else
                return true;
        };
        var time_diff = function (created) {
            return GetTime0(new Date() - created);
        };

        message.fields.feeds.forEach(function (feed) {
            if (feed.eventType === 'personalletter'){
                html += '<a href="javascript:void(0);" class="contentList" data-id="' + feed._id + '" data-post="' + feed.postId + '">' + (notRead(feed.isRead, feed.checked, index, feed.createdAt) ? '<div class="readTips"></div>' : '') + '\
                        <img class="icon" src="' + feed.ownerIcon + '" width="30" height="30" />\
                        <div id="' + feed.postId + '" class="alarm">' + feed.ownerName + ' 给您发来一条私信 《' + feed.postTitle + '》</div>\
                        <div class="createAt">' + time_diff(feed.createdAt) + '</div>\
                        </a>\
                        <div id="' + feed._id + 'content" class="personalLetterContent">\
                        <div class="LetterHead">来自 <strong>' + feed.userName + '</strong> 的私信</div>\
                        <div class="closePersonalLetter"><i class="fa fa-angle-left fa-fw"></i></div>\
                        <div class="LetterContent">' + feed.content + '</div>\
                        <a href="mailto:' + feed.userEmail + '?subject=Re:' + feed.userName + '"><div class="LetterFooter">\
                        <div class="show-user-email">联系邮箱：' + feed.userEmail + '</div>\
                        </div></a>\
                        /div>\
                        <div class="line"><span></span></div>';
            } else if(feed.eventType === 'recommand'){
                html += '<a href="javascript:void(0);" class="contentList" data-id="' + feed._id + '" data-post="' + feed.postId + '">' + (notRead(feed.isRead, feed.checked, index, feed.createdAt) ? '<div class="readTips"></div>' : '') + '\
                        <img class="icon" src="' + feed.recommanderIcon + '" width="30" height="30">\
                        <div id="' + feed.postId + '" class="alarm">' + feed.recommander + ' 推荐您一个新故事 《' + feed.postTitle + '》</div>\
                        <div class="createAt">' + time_diff(feed.createdAt) + '</div>\
                        </a><div class="line"><span></span></div>';
            } else {
                if (feed.eventType === 'pcomment'){
                    typeName = '也点评了此故事';
                }
                if (feed.eventType === 'pcommentowner'){
                    typeName = '点评了您的故事';
                }
                if (feed.eventType === 'pfavourite'){
                    typeName = '也赞了此故事';
                }
                if (feed.eventType === 'SelfPosted'){
                    typeName = '发布了新故事';
                }
                if (feed.eventType === 'comment'){
                    typeName = '回复了您的故事';
                }
                if (feed.eventType === 'recomment'){
                    typeName = '回复了您参与讨论的故事';
                }
                if (feed.eventType === 'getrequest'){
                    // TODO: 邀请您加为好友
                }
                if (feed.eventType === 'sendrequest'){
                    // TODO: 已添加/已发送邀请
                }
                html += '<a href="javascript:void(0);" class="contentList" data-id="' + feed._id + '" data-post="' + feed.postId + '">' + (notRead(feed.isRead, feed.checked, index, feed.createdAt) ? '<div class="readTips"></div>' : '') + '\
                        <img class="icon" src="' + feed.ownerIcon + '" width="30" height="30">\
                        <div id="' + feed.postId + '" class="alarm">' + feed.ownerName + ' ' + typeName + ' 《' + feed.postTitle + '》</div>\
                        <div class="createAt">' + time_diff(feed.createdAt) + '</div>\
                        </a><div class="line"><span></span></div>';
            }

            index += 1;
        });
        $('._bell-box .content').html(html);
        // $('._bell-box').slideDown(300);
        $('._bell-box .contentList').each(function () {
            $(this).click(function () {
                debugPrint('post id:', $(this).attr('data-post'));
                window._bell.contentList($(this).attr('data-post'));
                if ($(this).attr('data-post'))
                    location = '/t/' + $(this).attr('data-post');
            });
        });
    };
    var update_read_status = function () {
        if (typeof window.read_report === 'undefined') {
            window.read_report = true;
            CallMethod('readPostReport', [postid, window._loginUserId], function (type, result) {
                debugPrint('readPostReport, result: ' + result)
            });
            Subscribe("reading", [postid], function (e) {
                var message = e1.detail;
                debugPrint('reading: ' + JSON.stringify(message));
            });
        }
    };

    window.SUGGEST_POSTS_SKIP = 0;
    window.SUGGEST_POSTS_LIMIT = 5;
    window.SUGGEST_POSTS_LOADING = false;

    var colorIndex, colorLength, predefineColors;
    predefineColors = ["#55303e", "#503f32", "#7e766c", "#291d13", "#d59a73", "#a87c5f", "#282632", "#ca9e92", "#a7a07d", "#846843", "#6ea89e", "#292523", "#637168", "#573e1b", "#925f3e", "#786b53", "#aaa489", "#a5926a", "#6a6b6d", "#978d69", "#a0a1a1", "#4b423c", "#5f4a36", "#b6a2a9", "#1c1c4e", "#e0d9dc", "#393838", "#c5bab3", "#a46d40", "#735853", "#3c3c39"];
    colorLength = predefineColors.length;
    colorIndex = 0;
    window.newLayoutWatchIdList = {};

    setRandomlyBackgroundColor = function ($node) {
        $node.css("background-color", predefineColors[colorIndex]);
        if (++colorIndex >= colorLength) {
            return colorIndex = 0;
        }
    };

    var processSuggestPostsData = function (data) {
        var posts = data;
        var counter = posts.length;
        var html = '';
        posts.forEach(function (post) {
            if (post.ownerName) {
                var poster = '<h1 class="username">' + post.ownerName + '<span>发布</span><button class="suggestAlreadyRead"><i class="fa fa-times"></i></button></h1>'
            } else if (post.reader) {
                var poster = '<h1 class="username">' + post.reader + '<span>读过</span><button class="suggestAlreadyRead"><i class="fa fa-times"></i></button></h1>'
            }
            html += '<div class="newLayout_element" data-postid="' + post.postId + '">'
                + '<div class="img_placeholder">'
                + '<img class="mainImage" src="' + post.mainImage + '" />'
                + '</div>'
                + '<div class="pin_content">'
                + '<p class="title">' + post.title + '</p>'
                + '<p class="addontitle">' + post.addontitle + '</p>'
                + poster
                + '</div>'
                + '</div>';
        });

        var $container = $(".moments .newLayout_container");

        if ($container.length > 0) {
            $container.append(html);
        }
        else {
            html = '<div class="newLayout_container" style="display:none;position:relative;">' + html + '</div>';
            $(".div_discover .moments").append(html);
            $container = $(".moments .newLayout_container");
        }


        $(".moments .newLayout_element").not('.loaded').each(function () {
            var elem = this, $elem = $(this);
            var the_postid = $elem.data('postid');
            $elem.find('.img_placeholder').click(function () {
                window.open('/t/' + the_postid, '_blank');
            });
            $elem.find('.pin_content .title').click(function () {
                window.open('/t/' + the_postid, '_blank');
            });
            $elem.detach();

            var imgLoad = imagesLoaded(elem);

            imgLoad.on('done', function () {
                debugPrint('>>> img load done!!!');
                elem.style.display = 'hidden';
                $elem.css('opacity', 0);
                $elem.addClass('loaded');

                $container.append($elem);
                var $img, $parent, src, watcher;

                if (!window.newLayoutWatchIdList['watcher_' + the_postid]) {
                    $img = $elem.find('img');
                    src = $img.attr('src');
                    $parent = $img.parent();
                    setRandomlyBackgroundColor($parent);
                    watcher = scrollMonitor.create($img, {
                        top: 1600,
                        bottom: 1600
                    });
                    window.newLayoutWatchIdList['watcher_' + the_postid] = watcher;
                    watcher.enterViewport(function () {
                        debugPrint('I have entered the viewport ' + the_postid + ' src: ' + src);
                        if (!$img.hasClass('entered')) {
                            $img.addClass('entered');
                        }
                        if (!$img.is(':visible')) {
                            return $img.show();
                        }
                    });
                    watcher.exitViewport(function () {
                        var height, width;
                        debugPrint('I have left the viewport ' + the_postid + ' src: ' + src);
                        if ($img.hasClass('entered') && $img.is(':visible')) {
                            width = $img.width();
                            height = $img.height();
                            $parent.width(width);
                            $parent.height(height);
                            return $img.hide();
                        }
                    });
                }

                $elem.animate({
                    opacity: 1
                }, 400);
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
                    debugPrint('SUGGEST_POSTS_LOADING:', SUGGEST_POSTS_LOADING);
                    $('.moments-loading').hide();
                }
            });

            imgLoad.on('fail', function () {
                console.error('>>> img load failed!!!');
                SUGGEST_POSTS_LOADING = false;
                debugPrint('SUGGEST_POSTS_LOADING:', SUGGEST_POSTS_LOADING);
                $('.moments-loading').hide();
            });
        });
    };

    var fetchSuggestPosts = function (skip, limit) {
        debugPrint('getSuggestedPosts start');
        window.fetchedSuggestPosts = true;
        if (SUGGEST_POSTS_LOADING) return;
        SUGGEST_POSTS_LOADING = true;
        SUGGEST_POSTS_SKIP += limit;
        $('.moments-loading').show();
        CallMethod('getSuggestedPosts', [postid, skip, limit], function (type, result) {
            debugPrint('getSuggestedPosts result: ' + JSON.stringify(result));
            var data = [];
            if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    if (!window.localStorage.getItem('hideSuggestPost_' + result[i].postId))
                        data.push(result[i]);
                }
            }
            processSuggestPostsData(data);
        });
    };
    var initDiscover = function () {
        // ==========动态 start=================

        $(window).scroll(function () {
            if ($(window).scrollTop() >= $(document).height() - $(window).height() && $('.div_discover').css('display') === 'block')
                fetchSuggestPosts(SUGGEST_POSTS_SKIP, SUGGEST_POSTS_LIMIT);
        });
        setTimeout(function () {
            fetchSuggestPosts(SUGGEST_POSTS_SKIP, 2);
        }, 3000);
        $(".discoverBtn").click(function () {
            document.body.scrollTop = $('.div_discover').offset().top - 45;
            //fetchSuggestPosts(SUGGEST_POSTS_SKIP, SUGGEST_POSTS_LIMIT);
            $(".contactsBtn, .postBtn, .discoverBtn, .meBtn").removeClass('focusColor');
            $(".discoverBtn").addClass('focusColor');
            $('.div_me_set-up-sex,.div_me_set-up-nike').css('display', 'none');
            $('.div_contactsList').css('display', "none");
            $('.div_discover').css('display', "block");
            $('.div_me').css('display', "none");
            enablePostScroll();
        });
        $(".div_discover .moments").on('click', '.suggestAlreadyRead', function (e) {
            var the_postid = $(this).parent().parent().parent().data('postid');
            debugPrint(the_postid)
            localStorage.setItem('hideSuggestPost_' + the_postid, true);
            $(this).parent().parent().parent().remove();
            var wookmark = new Wookmark('.newLayout_container', {
                autoResize: false,
                itemSelector: '.newLayout_element',
                itemWidth: "48%",
                flexibleWidth: true,
                direction: 'left',
                align: 'center'
            }, true);
            return false;
        });
        // ==========动态 end=================
    };
    var newFriendCounts = 0;
// 加载更多新朋友
    window.newFriendsLoadedAll = false;
    var grabNewFriendsFromServer = function () {
        $('#pullDownAddMore').html('加载中...');
        window.CallMethod('getPostFriends', [postid, newFriendCounts, 20], function (type, result) {
            debugPrint('load more postFriendHandle is ==:' + JSON.stringify(result));
            var html = '';
            var $node;
            newFriendCounts += 20;
            getNewFriendReadCount(result);
            result.forEach(function(item){
                if(item && item.ta && item.ta !==''){
                    usersInformation[item.ta] = {
                        name: item.name,
                        location: item.location,
                        icon: item.icon
                    }
                }
            });
            if (result.length === 0) {
                $pullDownAddMore = $('#pullDownAddMore').html('没有更多数据了');
                newFriendsLoadedAll = true;
                return getScrollEvent = false;
            } else {
                $.each(result, function (index, content) {
                    $node = $('.addNewFriends #wrapper');
                    var redSpot = '';
                    if (this.count && this.count === 1) {
                        if (!window.localStorage.getItem('newFriendRead_' + this.ta)) {
                            redSpot = '<div class="red_spot"></div>';
                        }
                    }
                    html += '<div id=' + this.ta + ' class="eachViewer newFriends">'
                        + '<img class="icon" src=' + this.icon + ' width="30" height="30">'
                        + '<span class="userName">' + this.name + '</span>'
                        + '<div class="meet_count">缘分啊，我们已偶遇' + this.count + '次了！</div>'
                        + redSpot
                        + '</div>'
                        + '<div class="chatContentLine"></div>';
                });
                $node.append(html);
                $('#pullDownAddMore').html('没有更多数据了');
                $(".newFriends").click(function (e) {
                    var userId = $(e.currentTarget).attr("id");
                    var newFriendReadUser = window.localStorage.getItem('newFriendRead_' + userId);
                    if (!newFriendReadUser) {
                        window.localStorage.setItem('newFriendRead_' + userId, true);
                        $('#' + userId + ' .red_spot').hide();
                        var totalCount = parseInt($('#newFriendRedSpot').html()) - 1;
                        if (totalCount > 0) {
                            $('#newFriendRedSpot').html(totalCount);
                        } else {
                            $('#newFriendRedSpot').hide();
                        }
                    }
                    showProfilePage(userId);
                });
            }
        });
    };

    var loadMoreNewFriends = function () {
        var getScrollEvent = true;
        $('.div_contactsList').scroll(function (event) {
            var $pullDownAddMore = $('#pullDownAddMore');
            var target = $("#showMorePostFriendsResults");
            if (!target.length) {
                return;
            }
            var threshold = $(window).scrollTop() + $(window).height() - target.height();
            // debugPrint("threshold: " + threshold);
            // debugPrint("target.top: " + target.offset().top);

            // 110:.contactsList 的 padding-bottom 为110px, 64:#addNewFriends 的 margin-top为64px
            if ($('.div_contactsList ').scrollTop() >= ($('.contactsList').height() - $('.div_contactsList ').height() +64 +110 ) && $(".div_contactsList").is(':visible') && !newFriendsLoadedAll){
                grabNewFriendsFromServer()
            }
        });
    };

    var initPullToRefreshOnNewFriends = function () {
        loadMoreNewFriends();
    };

    var getPostCommentData = function () {
        CallMethod("socialData", [postid], function (result, message) {
            debugPrint('Social data is: ' + JSON.stringify(message));
            $.each(message, function (index, content) {
                var html = '';
                var pcomments = '';
                // debugPrint('socialData index is ' + index + ' . this.index is  ' +　this.index + ' . content is ' + JSON.stringify(content) + ' this is ' + JSON.stringify(this) + '  ..dan ');
                var $node = $('[index=' + this.index + ']')
                if (this.pcomments && this.pcomments.length > 0) {
                    for (var i = 0; i <= this.pcomments.length - 1; i++) {
                        pcomments += '<div class="eachComment">'
                            + '<div class="bubble">'
                            + '<span class="personName">' + this.pcomments[i].username + '</span>:'
                            + '<span class="personSay">' + this.pcomments[i].content + '</span>'
                            + '</div>'
                            + '</div>';
                        // debugPrint('each pcomments is ' + pcomments);
                    }
                    // debugPrint('final pcomments is ' + pcomments);
                    html += '<div class="pcomment">'
                        + pcomments
                        + '</div>';
                    $node.append(html);
                }
            });
            calcLayoutForEachPubElement();
        });
    };

    var initImageSwipeView = function () {
        // --- 查看大图 ---
        $(".postImageItem").click(function () {
            var selected, swipedata;
            swipedata = [];
            selected = 0;

            var selectedImage = $(this).find('img').attr('data-original');
            $('.postImageItem').map(function (index, item) {
                var imgUrl = $(item).find('img').attr('data-original');
                if (imgUrl) {
                    if (selectedImage === imgUrl) {
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
    };

//==== 分享到故事贴读友圈 START ====
    window.RECOMMEND_USER_STORY_COUNT = 0;
    window.RECOMMEND_FAV_STORY_COUNT = 0;
    window.RECOMMEND_STORY_LIMIT = 5;
    window.RECOMMEND_USER_STORY_LOADALL = false;
    window.RECOMMEND_FAV_STORY_LOADALL = false;
    window.IS_RECOMMEND_FAV_STORY_TABLE = false;
    window.RecommendStorysInit = false;

    var getRecommendStorys = function () {
        var skip = 0;
        if (IS_RECOMMEND_FAV_STORY_TABLE) {
            if (RECOMMEND_FAV_STORY_LOADALL) {
                return false;
            }
            skip += RECOMMEND_FAV_STORY_COUNT;
        } else {
            if (RECOMMEND_USER_STORY_LOADALL) {
                return false;
            }
            skip += RECOMMEND_USER_STORY_COUNT;
        }
        $('.storySourceLoading').show();
        window.CallMethod('getRecommendStorys', [window._loginUserId, RECOMMEND_STORY_LIMIT, skip, IS_RECOMMEND_FAV_STORY_TABLE], function (type, result) {
            var html = '';
            var firstParagraph = '';
            if (result) {
                if (result.length > 0) {
                    result.forEach(function (post) {
                        if (post.pub) {
                            post.pub.forEach(function (item) {
                                if (item.type === 'text') {
                                    firstParagraph = item.text;
                                }
                            });
                        }
                        html += '<li id="' + post._id + '">' +
                            '<div class="imgPlaceHolder">' +
                            '<img id="" class="lazy" src="' + post.mainImage + '" style="display: block; background-color: rgb(80, 63, 50);">' +
                            '</div>' +
                            '<div class="postContent">' +
                            '<h2>' + post.title + '</h2>' +
                            '<p>' + firstParagraph + '</p>' +
                            '</div>' +
                            '</li>';
                    });
                    if (IS_RECOMMEND_FAV_STORY_TABLE) {
                        RECOMMEND_FAV_STORY_COUNT += result.length;
                        $('.favoriteStoriesLists').append(html);
                    } else {
                        RECOMMEND_USER_STORY_COUNT += result.length;
                        $('.publishedStoriesLists').append(html);
                    }
                } else {
                    if (IS_RECOMMEND_FAV_STORY_TABLE) {
                        RECOMMEND_FAV_STORY_LOADALL = true;
                    } else {
                        RECOMMEND_USER_STORY_LOADALL = true;
                    }
                }
            }
            $('.storySourceLoading').hide();
        });
    };

    var closeRecommendStorysPage = function () {
        enablePostScroll();
        $('.recommendStory').fadeOut(100);
    };
    var initRecommendStorys = function () {
        RecommendStorysInit = true;
        $(".storyLists").scroll(function () {
            var nScrollHight = $(this)[0].scrollHeight;
            var nScrollTop = $(this)[0].scrollTop;
            if (nScrollTop + $(this).height() >= nScrollHight)
                getRecommendStorys();
        });
        /*$('#shareStoryBtn').click(function () {
            disablePostScroll();
            $('.recommendStory').fadeIn(100);
            getRecommendStorys();
        });*/
        $('.recommendStory .leftButton').click(function () {
            closeRecommendStorysPage();
        });
        $('.storySource input[type="radio"]').click(function (e) {
            debugPrint(e.currentTarget.id);
            $('.storyLists').toggle();
            if (e.currentTarget.id === 'publishedStories') {
                IS_RECOMMEND_FAV_STORY_TABLE = false;
                if (RECOMMEND_USER_STORY_COUNT === 0) {
                    getRecommendStorys();
                }
            } else {
                IS_RECOMMEND_FAV_STORY_TABLE = true;
                if (RECOMMEND_FAV_STORY_COUNT === 0) {
                    getRecommendStorys();
                }
            }
        });

        // 选择故事分享
        $('.recommendStory').on('click', '.storyLists li', function (e) {
            debugPrint(e.currentTarget.id);
            window.CallMethod('pushRecommendStoryToReaderGroups', [postid, e.currentTarget.id]);
            toastr.info('推荐成功！');
            closeRecommendStorysPage();
        });

        // 导入分享
        $('.recommendStory #importBtn').click(function (e) {
            var originUrl, url, urlReg;
            originUrl = $('.recommendStory #importUrl').val();
            debugPrint('originUrl==' + originUrl);
            if (originUrl === '') {
                return toastr.info('请输入或粘贴一个链接~');
            }
            urlReg = new RegExp("(http[s]{0,1}|ftp)://[a-zA-Z0-9\\.\\-]+\\.([a-zA-Z]{2,4})(:\\d+)?(/[a-zA-Z0-9\\.\\-~!@#$%^&*+?:_/=<>]*)?", "gi");
            if (!originUrl.match(urlReg)) {
                return toastr.info('链接格式错误~');
            }
            url = 'http://' + window.location.host + '/import-server/' + window._loginUserId + '/' + encodeURIComponent(originUrl);
            debugPrint('url==' + url);
            $('.importing-mask,.importing').show();
            $.get(url, function (result, status) {
                debugPrint(JSON.stringify(result));
                debugPrint(status);
                var data, storyId;
                if (result && status === 'success') {
                    data = result.split("\r\n");
                    data = JSON.parse(data[data.length - 1]);
                    storyId = data.json.split("/");
                    storyId = storyId[storyId.length - 1];
                    debugPrint("data is ==", data);
                    debugPrint("storyId is ==", storyId);
                    $('.importing-mask,.importing').hide();
                    if (data.status === "succ") {
                        window.CallMethod('pushRecommendStoryToReaderGroups', [postid, storyId]);
                        toastr.info('推荐成功！');
                        return closeRecommendStorysPage();
                    }
                }
                return toastr.info('导入失败，请重试！');
            });
        });
    }//==== 分享到故事贴读友圈 END ====

    //==== server Import START ====
    window.importTaskID = null;
    window.setCookie = function (c_name,value,expiredays) {
        var exdate=new Date()
        exdate.setDate(exdate.getDate()+expiredays);
        document.cookie=c_name+ "=" +escape(value)+((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
    };
    var serverImportHandle = function(e1) {
        var message = e1.detail;
        debugPrint('serverImportHandle:' + JSON.stringify(message));
        var import_status = message.fields.import_status;
        var pub;
        if(import_status === 'done'){
            pub = message.fields.pub;
            // 处理图片src
            $('#wx-img').attr('src',message.fields.mainImage);
            pub.forEach(function(item){
                $('#'+item._id+' img').attr('data-original',item.imgUrl);
            });
            
            window.localStorage.removeItem('waitForServerImportStatus');
        }
    }
    var initServerImport = function(){
        // 导入
        $('.submit-import').click(function(){
            var url,originUrl,postId;
            originUrl = $('#import-post-url').val();
            debugPrint('originUrl==' + originUrl);
            urlReg = new RegExp("(http[s]{0,1}|ftp)://[a-zA-Z0-9\\.\\-]+\\.([a-zA-Z]{2,4})(:\\d+)?(/[a-zA-Z0-9\\.\\-~!@#$%^&*+?:_/=<>]*)?", "gi");
            if (originUrl === '') {
                toastr.remove();
                return toastr.info('请输入或粘贴一个链接~');
            }
            if (!originUrl.match(urlReg)) {
                toastr.remove();
                return toastr.info('链接格式错误~');
            }
            $('.import-post').css('overflow-y','hidden');
            $('.import-post .loading').show();
            importTaskID = window._loginUserId + '_'+(new Date()).getTime();
            url = '/import-server/' + window._loginUserId + '/' + encodeURIComponent(originUrl);
            url += '?task_id=' + importTaskID;
            debugPrint('url='+url);
            // var newPostWindow = window.open();
            setTimeout(function() {
                $.ajax({
                    url:url,
                    async:false,
                    type: "GET",
                    success:function(result){
                        var data;
                        setCookie('loginUserId',window._loginUserId,360);
                        debugPrint('import succ=='+ JSON.stringify(result));
                        data = result.split("\r\n");
                        data = JSON.parse(data[data.length - 1]);
                        debugPrint('datais=='+JSON.stringify(data));
                        if(data.status === 'succ'){
                            postId = data.json.split("/");
                            postId = postId[postId.length - 1];
                            debugPrint("data is ==", data);
                            debugPrint("postId is ==", postId);
                            toastr.remove();
                            toastr.success('正在对图片进行自动优化,稍后跳转到导入的帖子...','导入成功!');
                            $('.import-post .loading').hide();
                            $('.import-post').css('overflow-y','auto');
                        } else{
                            toastr.remove();
                            toastr.info('导入失败!');
                            $('.import-post .loading').hide();
                            $('.import-post').css('overflow-y','auto');
                            return false;
                        }
                    },
                    error: function(result){
                        toastr.remove();
                        toastr.info('导入失败!');
                        $('.import-post .loading').hide();
                        $('.import-post').css('overflow-y','auto');
                    }
                });
                if(postId && postId !== ''){
                    window.localStorage.setItem('waitForServerImportStatus', true);
                    window.open('/t/'+postId.toString(), '_self');
                }
            }, 100);
        });
        // 取消导入
        $('.cancel-import').click(function(){
            $.ajax({url:'/import-cancel/' + importTaskID, async:true});
            $('.import-post .loading').hide();
            $('.import-post').css('overflow-y','auto');
        });
        // back 
        $('.import-post .left-btn').click(function(){
            $('body').scrollTop(0);
            $('.import-post').hide();
        });
    };
    
    //==== server Import END ====
    var userHandle = function (e) {
        var message = e.detail;
        console.log('users: ' + JSON.stringify(message));
        if(message.id && message.id !== '' && message.fields && message.fields._id && message.fields._id===message.id){
            userCollection[message.id] = message.fields;
        }
        if(window._loginUserId){
            console.log(window._loginUserId+' is user id')
        }
    };
    document.addEventListener('users', userHandle, false);
    var DDPConnectedHandle = function (e) {

        debugPrint('postid is ' + postid);

        autoLogin(function (type, message) {
            debugPrint('login response:' + JSON.stringify(message));
            if (type === 'result' && message) {
                window._loginUserId = message.id;
                window._loginUserToken = message.token;
                window._loginUsertokenExpires = message.tokenExpires;
                debugPrint('user id:' + _loginUserId);
                window.localStorage.setItem('static_login_userId', message.id);
            }
            //Get the most important data ASAP.
            getPostCommentData();

            initPullToRefreshOnNewFriends();
            initImageSwipeView();

            var userNewBellCountId = Subscribe("userNewBellCount", [window._loginUserId], userNewBellCountHandle);
            if(window.localStorage.getItem('waitForServerImportStatus') && window.localStorage.getItem('waitForServerImportStatus') === 'true') {
                toastr.remove();
                var serverImportId = Subscribe("serverImportPostStatus", [postid], serverImportHandle);
            }
            if (typeof window.alreadyInit !== 'undefined') {
                debugPrint('skip duplicated initialize');
                return;
            }
            window.alreadyInit = true;

            setTimeout(function () {
                update_read_status();
                //initRecommendStorys();
            }, 1000);

            setTimeout(function () {
                grabNewFriendsFromServer();
            }, 3000);
            setTimeout(function () {
                initDiscover();
            }, 4000);

            if (typeof subReadyHandle !== 'undefined') {
                document.removeEventListener('subReady', subReadyHandle);
            }
            subReadyHandle = function (e1) {
                var message = e1.detail;
                if (message.subs.includes(userNewBellCountId)) {
                    debugPrint("userNewBellCount ready");
                }
            };
            document.addEventListener('subReady', subReadyHandle, false);
        });
    };

    window._bell = {
        contentList: function (feedId) {
            debugPrint('contentList:', feedId);
            window.CallMethod('readFeedsStatus', [feedId]);
            window.CallMethod('updataFeedsWithMe', [window._loginUserId]);
        }
    };

// ---- Profile START ----
    var preProfileInfo = function (name, userId) {
        $('.' + name + ' .userProfileTop').html('<img class="icon" src="/userPicture.png" width="70" height="70">\
                    <span class="userName theprofileName"></span>\
                    <span class="location"></span>\
                    <span class="desc"></span>');
        $("." + name + " .recentViewPosts").html('');
        $("." + name + " .favoritePosts").html('');
        disablePostScroll();
        $('.' + name + ' .wait-loading').show();

        // 写入user数据
        $("." + name + " .head div:eq(1)").html(usersInformation[userId].name);
        $("." + name + " .theprofileName").html(usersInformation[userId].name);
        $("." + name + " .userProfileTop .icon").attr('src', usersInformation[userId].icon);
        $("." + name + " .userProfileTop .location").html(usersInformation[userId].location);
        //$("." + name + " .userProfileTop .desc").html(result.userProfile.desc);

        if(usersInformation[userId].recentViewPosts && usersInformation[userId].favouritePosts){
            displayRecentViewPosts(name,userId,usersInformation[userId].recentViewPosts);
            // 写入喜欢的故事
            displayFavouriteposts(name,userId,usersInformation[userId].favouritePosts);
        } else {
            $("." + name + " .user-profile-loading").show();
            window.CallMethod('profileData', [userId.substr(0,1) === '_' ? userId.substr(1) :  userId], function (type, result) {
                $("." + name + " .user-profile-loading").hide();
                debugPrint('profileData is ==:' + JSON.stringify(result));
                usersInformation[userId].favouritePosts = result.favouritePosts;
                usersInformation[userId].recentViewPosts = result.recentViewPosts;

                // 写入最近浏览的故事
                displayRecentViewPosts(name,userId,usersInformation[userId].recentViewPosts);
                // 写入喜欢的故事
                displayFavouriteposts(name,userId,usersInformation[userId].favouritePosts);
                $('.' + name + ' .wait-loading').hide();
                $("." + name + " .loadMore").html("加载更多");
            });
        }
    };
    var displayRecentViewPosts = function(name,userId,posts){
        var recentReviewPost = '';
        posts.forEach(function (item) {
            recentReviewPost += '<a href="http://' + window.location.host + '/t/' + item._id + '" style="color: #5A5A5A;"><li id="' + item.postId + '">' +
                '<div class="postMainImage no-swipe" style="background-image:url(' + item.mainImage + ')"></div>' +
                '<h6 class="title" style="text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">' +
                item.title + '</h6></li></a>';
        });
        $('.' + name + ' .recentViewPosts').html(recentReviewPost);
    };
    var displayFavouriteposts = function(name,userId,posts){
        var favouriteposts = '';
        for (var i = 0; i < posts.length; i++) {
            favouriteposts += '<a href="http://' + window.location.host + '/t/' + posts[i]._id + '" style="color: #5A5A5A;"><div id="' + posts[i]._id + '" style="border-radius: 5px; background-color: #f7f7f7;">' +
                '<div class="img_placeholder" style="' +
                'margin: 0 0.125em 1em;-moz-page-break-inside: avoid;-webkit-column-break-inside: avoid;break-inside: avoid;background: white;border-radius:4px;">' +
                '<img class="mainImage" src="' + posts[i].mainImage + '" style="width: 100%;border-radius: 4px 4px 0 0;"/>' +
                '<p class="title" style="font-size: 16px;font-weight: bold;word-wrap: break-word;margin: 10px;">' + posts[i].title + '</p>' +
                '<p class="addontitle" style="font-size:11px;margin: 10px;">' + posts[i].addontitle + '</p>' +
                '</div></div></a>';
        }
        $("." + name + " .favoritePosts").html(favouriteposts);
    };
    // 加载更多喜欢的故事
    var loadMoreFavouriteposts = function (name) {
        console.log(name);
        var $self = $("."+name+" .loadMore");
        var userId = $("."+name).attr('data-id');
        $self.html('<img src="/loading-2.gif" style="width: 28px; height:28px;"/> 加载中...');
        console.log(userId);
        window.CallMethod('getMoreFavouritePosts', [userId.substr(0,1) === '_' ? userId.substr(1) :  userId, usersInformation[userId].favouritePosts.length, 10], function (type, result) {
            debugPrint('profileData is ==:' + JSON.stringify(result));
            if (result.length === 0) {
                $self.html('没有更多数据了');
                $self.off("click");
            } else {
                $self.html('加载更多');
                for(var i=0;i<result.length;i++)
                  usersInformation[userId].favouritePosts.push(result[i]);
                displayFavouriteposts(name,userId,usersInformation[userId].favouritePosts)
            }
        });
    }
    window.getMyUserInfo=function(){
        if(window._loginUserId && userCollection[window._loginUserId]){
            return userCollection[window._loginUserId]
        }

        return null;
    };

    var renderProfile = function(name, id){
      var $page = $('.' + name);
      var $profile = $page.find('.userProfileTop');
      var profile = usersInformation[id];

      $profile.find('.icon').attr('src', profile.icon);
      $profile.find('.userName').html(profile.name);
      $profile.find('.location').html(profile.location);
      $page.find('.head div:eq(1)').html(profile.name);
      //preProfileInfo(name, id);
      //loadMoreFavouriteposts(name, userId);
    };

    var $swiper = $('.swipe-tmp');
    var $swiper_tempate = $('.swip-page-tempate');
    var $swiper_page = $swiper.find('.pages');
    window.showProfilePage = function (userId, isOwner) {
        localStorage.setItem('documentCurrTop', document.body.scrollTop);
        document.body.scrollTop = 0;
        // preProfileInfo(userId);
        // $(".userProfileBox").show();
        // loadMoreFavouriteposts();
        $('.userProfileBox').show();
        $swiper_page.html('');

        var ownerId = '_' + $('.showPostsBox .head .user').attr('id');
        if(!usersInformation[ownerId]){
          usersInformation[ownerId] = {
            name: $('.showPostsBox .head .name').html(),
            location: '',
            icon: $('.showPostsBox .head .name').attr('data-icon')
          };
        }

        if (isOwner) {
	    var swipe = null;
            var html = '<div class="page scrollable userProfilePage0 " data-index="0" data-id="'+ownerId+'">' + $swiper_tempate.html() + '</div>';
            $swiper_page.append(html);
            $(".userProfilePage0 .page-main").attr('style', 'height:'+($(window).height()-40)+'px;');
            renderProfile('userProfilePage0', ownerId);
            $(".userProfilePage0 .leftButton").click(function () {
                swipe.dispose();
                document.body.scrollTop = 0;
                if (localStorage.getItem('userProfile_BoxFromPostsPage') === 'true') {
                    enablePostScroll();
                }
                localStorage.setItem('userProfile_BoxFromPostsPage', false);
                $(".userProfileBox").hide();
            });
            $(".userProfilePage0 .loadMore").click(function (e) {
              loadMoreFavouriteposts("userProfilePage0");
            });

            swipe = new window.Swipe(['userProfilePage0'], true, $('.swipe-tmp'));
            swipe.leftRight(null, null);
            swipe.setInitialPage('userProfilePage0');
            preProfileInfo('userProfilePage0', ownerId);
            return;
        }

        var tempates = [];
        var defaultPage = '';
        var i = 0;
        var swipe = null;
        for(var key in usersInformation){
          if(key === ownerId)
            continue;

          var html = '<div class="page scrollable userProfilePage'+i+'" data-index="'+i+'" data-id="'+key+'">' + $swiper_tempate.html() + '</div>';
          $swiper_page.append(html);
          $(".userProfilePage"+i+" .page-main").attr('style', 'height:'+($(window).height()-40)+'px;');
          tempates.push('userProfilePage' + i);
          renderProfile('userProfilePage' + i, key);
          if(key === userId)
            defaultPage = 'userProfilePage' + i;

          $(".userProfilePage"+i+" .leftButton").click(function () {
              swipe.dispose();
              document.body.scrollTop = 0;
              if (localStorage.getItem('userProfile_BoxFromPostsPage') === 'true') {
                  enablePostScroll();
              }
              localStorage.setItem('userProfile_BoxFromPostsPage', false);
              $(".userProfileBox").hide();
          });
          $(".userProfilePage"+i+" .loadMore").click(function (e) {
            console.log($(e.currentTarget).parent().parent().parent());
            loadMoreFavouriteposts("userProfilePage"+$(e.currentTarget).parent().parent().parent().attr('data-index'));
          });
          i+=1;
        }

        var swipe = new window.Swipe(tempates, true, $swiper);
        swipe.onPageChanged(function (obj, name) {
            var index = parseInt($('.' + name).attr('data-index'));
            var left = null;
            var right = null;
            if(index > 0)
              left = 'userProfilePage' + (index-1);
            if(index+1 < i)
              right = 'userProfilePage' + (index+1);
            swipe.leftRight(left, right);
            preProfileInfo(name, $('.' + name).attr('data-id'));
        });
        swipe.setInitialPage(defaultPage);
    }
    $(".showPosts .user").click(function () {
        var profileUserId = $(".showPosts .user").attr("id");
        localStorage.setItem('profileUserId', profileUserId);
        localStorage.setItem('userProfile_BoxFromPostsPage', true);
        showProfilePage(profileUserId, true);
    });

    $(".userProfileBox .leftButton").click(function () {
        document.body.scrollTop = 0;
        if (localStorage.getItem('userProfile_BoxFromPostsPage') === 'true') {
            enablePostScroll();
        }
        localStorage.setItem('userProfile_BoxFromPostsPage', false);
        $(".userProfileBox").hide();
    });
// ---- Profile END ----

    $(document).ready(function () {
        document.addEventListener('ddpConnected', DDPConnectedHandle, false);
        initServerImport();
        $('#shareStoryBtn').click(function(){
            disablePostScroll();
            $('.recommendStory').fadeIn(100);
            getRecommendStorys();
            if(!RecommendStorysInit){
                initRecommendStorys();
            }
        });

        if (isWeiXinFunc()) {
            if (typeof wx === 'undefined') {
                loadScript('http://res.wx.qq.com/open/js/jweixin-1.0.0.js', function () {
                    wechat_sign();
                });
            } else {
                wechat_sign();
            }
        }
    })
})();
