/**
 * Created by simba on 9/29/16.
 */

globle_init = function(){
    postid = location.pathname.replace(/[\/]static[\/]/g, "");
    console.log('postid is ' + postid);

    var $bellHtml = $('.show-post-new-message ._count');

    document.addEventListener('ddpConnected', function (e) {
        console.log(e);
        console.log(e.message);
        LoginWithEmail("Test@163.com","123456",function(type,message){
            console.log('login response:' + JSON.stringify(message));
            if(type === 'result' && message && message.result){
                window._loginUserId = message.result.id;
                window._loginUserToken = message.result.token;
                window._loginUsertokenExpires = message.result.tokenExpires;
                console.log('user id:'+_loginUserId);
            }

            var userNewBellCountId = Subscribe("userNewBellCount", [window._loginUserId],function (e1){
                var message = e1.detail;
                console.log('userNewBellCount:'+JSON.stringify(message));
                var count = message.fields.count;
                if(count <= 0)
                    return $('.show-post-new-message').hide();
                $bellHtml.html(count);
                window.bellNewCount = count;
                $('.show-post-new-message').show();
                console.log(message)
            });

            // Post Information is on the page
            /*var postContent = Subscribe("staticPost",[postid]);
            document.addEventListener('posts', function (e) {
                var message = e.detail;
                postdata = message.fields;
                console.log('posts:'+JSON.stringify(message))
            }, false);*/

            document.addEventListener('subReady', function (e1) {
                var message = e1.detail;
                console.log(message);
                /*if (message.subs.includes(postContent)) {
                    console.log("mySubscription ready");
                }*/
                if (message.subs.includes(userNewBellCountId)) {
                    console.log("userNewBellCount ready");
                }
            }, false);
        });
    }, false);
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

