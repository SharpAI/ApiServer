/**
 * Created by simba on 9/29/16.
 */

globle_init = function(){
    const options = {
        endpoint: ddpUrl, //"ws://localhost:5000/websocket",
        SocketConstructor: WebSocket
    };
    const ddp = new appUtils.ddp(options);

    var method_callback = {};
    window.ddp_connected = false;
    window.CallMethod = function(method,param,callback){
        if(ddp){
            var methodId = ddp.method(method, param);
            method_callback[methodId] = callback;
        }
    };
    window.Subscribe = function(collection,param,callback){
        if(ddp){
            if(callback){
                document.addEventListener(collection,callback,false);
            }
            if(param){
                var subId = ddp.sub(collection,param);
            } else {
                var subId = ddp.sub(collection,[]);
            }
            return subId
        }
        return -1;
    };
    window.LoginWithEmail = function(email,password,callback){
        CallMethod("login", [{
            user: {
                email: email
            },
            password: password
        }],callback);
    };
    window.LoginWithToken = function(token,callback){
    };
    window.LoginWithUsername = function(username,password,callback){
    };

    ddp.on("connected", () => {
        console.log("Connected");
        window.ddp_connected = true;
        var event = new Event('ddpConnected');
        document.dispatchEvent(event);
    });

    ddp.on("result", message => {
        if (method_callback[message.id] && typeof method_callback[message.id] === 'function' ){
            method_callback[message.id]("result",message);
            //delete method_callback[message.id];
        }
    });
    ddp.on("updated", message => {
        if (method_callback[message.id] && typeof method_callback[message.id] === 'function' ){
            method_callback[message.id]("updated",message);
            //delete method_callback[message.id];
        }
    });
    ddp.on("ready",function(message){
        //console.log('ready: '+ JSON.stringify( message));
        var event = new CustomEvent('subReady', { 'detail': message });
        document.dispatchEvent(event);
    });
    ddp.on("added", message => {
        //console.log('collection:', JSON.stringify(message.collection));
        var event = new CustomEvent(message.collection, { 'detail': message });
        document.dispatchEvent(event);
    });

    ddp.on("changed", message => {
      console.log('collection:', JSON.stringify(message.collection));
      var event = new CustomEvent(message.collection, { 'detail': message });
      document.dispatchEvent(event);
    });
    ddp.on("removed", message => {
    });

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

