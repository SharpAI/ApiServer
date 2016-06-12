var gushitie = {};
gushitie.showpost = {};

var getBaseHeight, getBaseWidth, getLayoutTop, imageMarginPixel, layoutHelper, updateLayoutData;

getBaseWidth = function() {
  return ($('.showPosts').width() - 30) / 6;
};

window.getDocHeight = function() {
  var D;
  D = document;
  return Math.max(Math.max(D.body.scrollHeight, D.documentElement.scrollHeight), Math.max(D.body.offsetHeight, D.documentElement.offsetHeight), Math.max(D.body.clientHeight, D.documentElement.clientHeight));
};

getBaseHeight = function() {
  return ($('.showPosts').width() - 30) / 6;
};

layoutHelper = [0, 0, 0, 0, 0, 0];

imageMarginPixel = 5;

getLayoutTop = function(helper, col, sizeX) {
  var max;
  max = 0;
  for (i = col; i <= col+sizeX -1; i++) {
    max = Math.max(max, helper[(i - 1)]);
  }
  return max;
};

updateLayoutData = function(helper, col, sizeX, bottom) {
  for (i = col; i <= col+sizeX -1; i++) {
    helper[(i - 1)] = bottom;
  }
};

gushitie.showpost.init = function () {
    $("#wrapper .mainImage").css("height", ($(window).height() * 0.55) + "px");

    var baseHeight = ($('.showPosts').width() - 30) / 6;
    $(".postImageItem.element").each(function (idx, item) {
        var img = this.querySelector("img.lazy");
        var pHeight = parseInt($(img).data('sizey')) * baseHeight;
        this.style.height = pHeight + 'px';
    });
    
    var element, elementBottom, parentNode;
    var myData = new Object();
    $('.textDiv1Link').linkify();
    var obj = $("#test").find('.element');
    obj.each(function(){
        element = this
        dataId=$(this).attr('id');
        myData.index = Number($(this).attr('index'));
        myData.data_col = Number($(this).attr('col'));
        myData.type = $(this).attr('type');
        myData.data_sizex = Number($(this).attr('sizex'));
        myData.data_sizey = Number($(this).attr('sizey'));
        parentNode = element.parentNode;
        if (myData.index === 0) {
            updateLayoutData(layoutHelper, 1, 6, parentNode.offsetTop);
        }
        element.style.top = getLayoutTop(layoutHelper, myData.data_col, myData.data_sizex) + imageMarginPixel + 'px';
        if (myData.data_col !== 1) {
            element.style.left = (parentNode.offsetLeft + (myData.data_col - 1) * getBaseWidth() + imageMarginPixel) + 'px';
            element.style.width = (myData.data_sizex * getBaseWidth() - imageMarginPixel) + 'px';
        } else {
            element.style.left = parentNode.offsetLeft + (myData.data_col - 1) * getBaseWidth() + 'px';
            element.style.width = myData.data_sizex * getBaseWidth() + 'px';
        }
        if (myData.type === 'image') {
            element.style.height = myData.data_sizey * getBaseHeight() + 'px';
        } else if (myData.type === 'video') {
            element.style.height = myData.data_sizey * getBaseHeight() + 'px';
        }
        elementBottom = element.offsetTop + element.offsetHeight;
        updateLayoutData(layoutHelper, myData.data_col, myData.data_sizex, elementBottom);
        return parentNode.style.height = getLayoutTop(layoutHelper, 1, 6) - parentNode.offsetTop + 'px';
    });

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
        if ((st + $(window).height()) === window.getDocHeight()) {
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


    // register for video play
    $(".postVideoItem.element .play_area").click(function() {
        var _self = this, $_self = $(this);

        $video = $_self.find("video");

        if ($video.get(0)) {
            $video.siblings('.video_thumb').fadeOut(100);
            $video.get(0).paused ? $video.get(0).play() : $video.get(0).pause();
        }
    });
};