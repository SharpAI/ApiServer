require("./libs/ddp");
require("./libs/hammer.min");
require("./libs/wookmark");
require("./libs/jquery.swipebox.1.3.0.2");
window.scrollMonitor = require("./libs/scrollMonitor.1.0.12");
require("./libs/jquery.toolbar");

postid = location.pathname.replace(/[\/]static[\/]/g, "");
console.log('postid is ' + postid);

var $bellHtml = $('.show-post-new-message ._count');

var userNewBellCountHandle = function (e1){
    var message = e1.detail;
    console.log('userNewBellCount:'+JSON.stringify(message));
    var count = message.fields.count;
    if(count <= 0)
        return $('.show-post-new-message').hide();
    $bellHtml.html(count);
    window.bellNewCount = count;
    $('.show-post-new-message').show();
    console.log(message)
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
                }
                 
                html += '<div class="pcomment">'
                    + pcomments
                    + '</div>';
                $node.append(html);
            });
            calcLayoutForEachPubElement();
        });

        CallMethod("getPostFriends",[postid,0,20],function (type,result){
            console.log('postFriendHandle:'+JSON.stringify(result));
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


