/**
 * Created by simba on 9/29/16.
 */

globle_init = function(){
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
    var DDPConnectedHandle =  function (e) {
        console.log(e);
        console.log(e.message);

        LoginWithEmail("Test@163.com","123456",function(type,message){
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
            });

            CallMethod("getPostFriends",[postid,0,20],function (type,result){
                console.log('postFriendHandle:'+JSON.stringify(result));
            });
            // Post Information is on the page
            /*var postContent = Subscribe("staticPost",[postid]);
             document.addEventListener('posts', function (e) {
             var message = e.detail;
             postdata = message.fields;
             console.log('posts:'+JSON.stringify(message))
             }, false);*/
            if(typeof subReadyHandle !== 'undefined'){
                document.removeEventListener('subReady', subReadyHandle);
            }
            subReadyHandle = function (e1) {
                var message = e1.detail;
                console.log(message);
                /*if (message.subs.includes(postContent)) {
                 console.log("mySubscription ready");
                 }*/
                if (message.subs.includes(userNewBellCountId)) {
                    console.log("userNewBellCount ready");
                }

                if (message.subs.includes(postFriendsSubId)) {
                    console.log("postFriendsSubId ready");
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
};

wechat_sign = function(){
    console.log('Need continue to do the sign based on url and body content, session will not working here')
};

