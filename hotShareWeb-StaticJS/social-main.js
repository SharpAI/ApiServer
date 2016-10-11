require("./libs/ddp");
require("./libs/hammer.min");
require("./libs/wookmark");
require("./libs/jquery.swipebox.1.3.0.2");
window.scrollMonitor = require("./libs/scrollMonitor.1.0.12");
require("./libs/jquery.toolbar");
window.toastr = require("./libs/toastr.min");

postid = location.pathname.replace(/[\/]static[\/]/g, "");
console.log('postid is ' + postid);

const GetTime0 = function(dateM){
    var MinMilli = 1000 * 60;         // 初始化变量。
    var HrMilli = MinMilli * 60;
    var DyMilli = HrMilli * 24;
    //计算出相差天数
    var days=Math.floor(dateM/(DyMilli));

    //计算出小时数
    var leave1=dateM%(DyMilli); //计算天数后剩余的毫秒数
    var hours=Math.floor(leave1/(HrMilli));
    //计算相差分钟数
    var leave2=leave1%(HrMilli);        //计算小时数后剩余的毫秒数
    var minutes=Math.floor(leave2/(MinMilli));
    //计算相差秒数
    var leave3=leave2%(MinMilli);      //计算分钟数后剩余的毫秒数
    var seconds=Math.round(leave3/1000);
    
    var prefix;
    if(dateM > DyMilli)
        prefix = days+"天前";
    else if (dateM > HrMilli)
        prefix = hours+"小时前";
    else if (dateM > MinMilli)                         
        prefix = minutes+"分钟前";
    else if (dateM <= MinMilli){
        if (seconds <= 0)
            prefix = "刚刚";
        else
            prefix = seconds+"秒前";
    } else
        prefix = "";
    return prefix;
}

var $bellHtml = $('.show-post-new-message ._count');

var userNewBellCountHandle = function (e1){
    var message = e1.detail;
    console.log('userNewBellCount:'+JSON.stringify(message));
    var count = message.fields.count;
    if(count <= 0){
        $('.show-post-new-message').hide();
    }else{
      $bellHtml.html(count);
      window.bellNewCount = count;
      $('.show-post-new-message').show();
    }

    // render bell page
    if(!message.fields.feeds || message.fields.feeds.length <= 0)
      return $('._bell-box .content').html('');

    var html = '';
    var index = 0;
    var typeName = '';
    var notRead = function(read, check, _index, createAt){
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
    var time_diff = function(created){
      return GetTime0(new Date() - created);
    };

    message.fields.feeds.forEach(function(feed){
      switch(feed.eventType){
        case 'personalletter':
          html += '<a href="javascript:void(0);" class="contentList" data-id="'+feed._id+'" data-post="'+feed.postId+'">'+(notRead(feed.isRead, feed.checked, index, feed.createdAt) ? '<div class="readTips"></div>' : '')+'\
            <img class="icon" src="'+feed.ownerIcon+'" width="30" height="30" />\
            <div id="'+feed.postId+'" class="alarm">'+feed.ownerName+' 给您发来一条私信 《'+feed.postTitle+'》</div>\
            <div class="createAt">'+time_diff(feed.createdAt)+'</div>\
            </a>\
            <div id="'+feed._id+'content" class="personalLetterContent">\
            <div class="LetterHead">来自 <strong>'+feed.userName+'</strong> 的私信</div>\
            <div class="closePersonalLetter"><i class="fa fa-angle-left fa-fw"></i></div>\
            <div class="LetterContent">'+feed.content+'</div>\
            <a href="mailto:'+feed.userEmail+'?subject=Re:'+feed.userName+'"><div class="LetterFooter">\
            <div class="show-user-email">联系邮箱：'+feed.userEmail+'</div>\
            </div></a>\
            /div>\
            <div class="line"><span></span></div>';
          break;
        case 'pcomment':
          typeName = '也点评了此故事';
        case 'pcommentowner':
          typeName = '点评了您的故事';
        case 'pfavourite':
          typeName = '也赞了此故事';
        case 'SelfPosted':
          typeName = '发布了新故事';
        case 'recommand':
          typeName = '推荐您一个新故事';
        case 'comment':
          typeName = '回复了您的故事';
        case 'recomment':
          html += '<a href="javascript:void(0);" class="contentList" data-id="'+feed._id+'" data-post="'+feed.postId+'">'+(notRead(feed.isRead, feed.checked, index, feed.createdAt) ? '<div class="readTips"></div>' : '')+'\
            <img class="icon" src="'+feed.ownerIcon+'" width="30" height="30">\
            <div id="'+feed.postId+'" class="alarm">'+feed.ownerName+' '+(feed.eventType === 'recomment' ? '回复了您参与讨论的故事' : typeName)+' 《'+feed.postTitle+'》</div>\
            <div class="createAt">'+time_diff(feed.createdAt)+'</div>\
            </a><div class="line"><span></span></div>';
          break;
        case 'getrequest':
          // TODO: 邀请您加为好友
          break;
        case 'sendrequest':
          // TODO: 已添加/已发送邀请
          break;
      }

      index += 1;
    });
    $('._bell-box .content').html(html);
    // $('._bell-box').slideDown(300);
    $('._bell-box .contentList').each(function(){
      $(this).click(function(){
        console.log('feed id:', $(this).attr('data-id'));
        window._bell.contentList($(this).attr('data-id'));
        $('._bell-box').css('display', 'none');
        if($(this).attr('data-id'))
          location = '/static/' + $(this).attr('data-id');
      });
    });
};
var update_read_status = function(){
    if(typeof window.read_report === 'undefined'){
        window.read_report = true;
        CallMethod('readPostReport',[postid,window._loginUserId],function(type,result){
            console.log('readPostReport, result: '+result)
        });
        Subscribe("reading", [postid],function(e){
            var message = e1.detail;
            console.log('reading: '+JSON.stringify(message));
        });
    }
};
var userHandle = function(e){
    var message = e.detail;
    console.log('users: '+JSON.stringify(message));
};
document.addEventListener('users', userHandle , false);
var DDPConnectedHandle =  function (e) {
    console.log(e);
    console.log(e.message);

    autoLogin(function(type,message){
        console.log('login response:' + JSON.stringify(message));
        if(type === 'result' && message ){
            window._loginUserId = message.id;
            window._loginUserToken = message.token;
            window._loginUsertokenExpires = message.tokenExpires;
            console.log('user id:'+_loginUserId);
            window.localStorage.setItem('static_login_userId', message.id);
        }
        update_read_status();
        var userNewBellCountId = Subscribe("userNewBellCount", [window._loginUserId],userNewBellCountHandle);
        CallMethod("socialData", [postid],function (result,message){
            console.log('Social data is: '+JSON.stringify(message));
            $.each(message,function(index,content){
                var html = '';
                var pcomments = '';
                // console.log('socialData index is ' + index + ' . this.index is  ' +　this.index + ' . content is ' + JSON.stringify(content) + ' this is ' + JSON.stringify(this) + '  ..dan ');
                $node = $('[index='+ this.index +']')
                if(this.pcomments && this.pcomments.length > 0){
                    for(i=0;i<=this.pcomments.length-1;i++){
                        pcomments += '<div class="eachComment">'
                            + '<div class="bubble">'
                            + '<span class="personName">' + this.pcomments[i].username + '</span>:'
                            + '<span class="personSay">' + this.pcomments[i].content + '</span>'
                            + '</div>'
                            + '</div>';
                        // console.log('each pcomments is ' + pcomments);
                    }
                    // console.log('final pcomments is ' + pcomments);
                
                 
                html += '<div class="pcomment">'
                    + pcomments
                    + '</div>';
                $node.append(html);
                }
            });
            calcLayoutForEachPubElement();
        });

        CallMethod("getPostFriends",[postid,0,20],function (type,result){
            console.log('postFriendHandle:'+JSON.stringify(result));
            var html = '';
            $.each(result,function(index,content){
                $node = $('.addNewFriends #wrapper');
                html += '<div id=' + this.ta + ' class="eachViewer newFriends">'
                    + '<img class="icon" src=' + this.icon + ' width="30" height="30">'
                    + '<span class="userName">' + this.name + '</span>'
                    + '<div class="meet_count">缘分啊，我们已偶遇' + this.count + '次了！</div>'
                    + '<div class="red_spot"></div>'
                    + '</div>'
                    + '<div class="chatContentLine"></div>';
            });
            $node.append(html);
            $(".newFriends").click(function(e) {
                // console.log('target id is ' + $(e.currentTarget).attr("id"))
                showProfilePage($(e.currentTarget).attr("id"));
            });
            if(result.length >= 20){
                $('#showMorePostFriendsResults').show();
                loadMoreNewFriends();
            }
        });

        if(typeof subReadyHandle !== 'undefined'){
            document.removeEventListener('subReady', subReadyHandle);
        }
        subReadyHandle = function (e1) {
            var message = e1.detail;
            if (message.subs.includes(userNewBellCountId)) {
                console.log("userNewBellCount ready");
            }
        };
        document.addEventListener('subReady', subReadyHandle , false);
    });
};
document.addEventListener('ddpConnected',DDPConnectedHandle, false);
window._bell = {
    contentList: function(feedId){
        console.log('contentList:', feedId);
        window.CallMethod('readFeedsStatus',[feedId]);
        window.CallMethod('updataFeedsWithMe',[window._loginUserId]);
    }
};


