/**
 * Created by simba on 9/29/16.
 */

globle_init = function(){
    const options = {
        endpoint: "ws://localhost:5000/websocket",
        SocketConstructor: WebSocket
    };
    const ddp = new appUtils.ddp(options);
    ddp.on("connected", () => {
        console.log("Connected");
    });
    const myLoginParams = {
        user: {
            email: "Test@163.com"
        },
        password: "123456"
    };
    const methodId = ddp.method("login", [myLoginParams]);
    postid = location.pathname.replace(/[\/]static[\/]/g, "");
    console.log('postid is ' + postid);

    var userId = window._loginUserId || 'u8MRTTcXLoTzs9oXn';
    var userNewBellCountId = ddp.sub("userNewBellCount", [userId]);
    var $bellHtml = $('.show-post-new-message ._count');

    const postContent = ddp.sub("staticPost",[postid]);
    console.log('get post content is ' + postContent);

    ddp.on("result", message => {
        if (message.id === methodId && !message.error) {
            console.log("Logged in!");
        }
    });
    ddp.on("ready",function(message){
        console.log('ready: '+ JSON.stringify( message));
        if (message.subs.includes(postContent)) {
            console.log("mySubscription ready");
        }
        if (message.subs.includes(userNewBellCountId)) {
            console.log("userNewBellCount ready");
        }
    });
    ddp.on("added", message => {
      console.log('collection:', JSON.stringify(message.collection));
      switch(message.collection){
        case 'posts':
          postdata = message.fields;
          break;
        case 'userNewBellCount':
          console.log(message.fields);
          var count = message.fields.count;
          if(count <= 0)
            return $('.show-post-new-message').hide();
          $bellHtml.html(count);
          window.bellNewCount = count;
          $('.show-post-new-message').show();
          break;
      }
    });
    ddp.on("changed", message => {
      console.log('collection:', JSON.stringify(message.collection));
      switch(message.collection){
        case 'posts':
          postdata = message.fields;
          break;
        case 'userNewBellCount':
          console.log(message.fields);
          var count = message.fields.count;
          if(count <= 0)
            return $('.show-post-new-message').hide();
          $bellHtml.html(count);
          window.bellNewCount = count;
          $('.show-post-new-message').show();
          break;
      }
    });
    ddp.on("removed", message => {
    });


    window._bell = {
      contentList: function(feedId){
        console.log('contentList:', feedId);
        ddp.method('readFeedsStatus', [feedId]);
        ddp.method('updataFeedsWithMe', [userId]);
      }
    };
};

wechat_sign = function(){
    console.log('Need continue to do the sign based on url and body content, session will not working here')
};

