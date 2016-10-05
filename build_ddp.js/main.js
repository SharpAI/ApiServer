var appUtils = window.appUtils || {};
appUtils.ddp = require("ddp.js").default;
//window.appUtils = appUtils;

var Sha256 = require('./libs/sha256');

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
        document.removeEventListener(collection,callback);
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
window.SubToCol = function(subName,collection,param,callback){
    if(ddp){
        document.removeEventListener(collection,callback);
        if(callback){
            document.addEventListener(collection,callback,false);
        }
        if(param){
            var subId = ddp.sub(subName,param);
        } else {
            var subId = ddp.sub(subName,[]);
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
        password: {
            digest: Sha256.hash(password),
            algorithm:"sha-256"
        }
    }],callback);
};


/*
 * Login sequence:
 * 1. Create User if not token/username saved
 * 2. Login with username if no token saved, or token expired
 * 3. Login with Token
 *
 * Protocol Buffer:
 *
 * 1. Create User: ["{\"msg\":\"method\",\"method\":\"createUser\",\"params\":[{\"username\":\"194c4aeb-1b5c-48b6-8c68-1c9a9de64004\",\"password\":{\"digest\":\"8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92\",\"algorithm\":\"sha-256\"},\"profile\":{\"fullname\":\"匿名\",\"icon\":\"/userPicture.png\",\"anonymous\":true,\"browser\":true}}],\"id\":\"1\"}"]
 * 2. Login with username: ["{\"msg\":\"method\",\"method\":\"login\",\"params\":[{\"username\":\"194c4aeb-1b5c-48b6-8c68-1c9a9de64004\",\"password\":{\"digest\":\"8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92\",\"algorithm\":\"sha-256\"}}],\"id\":\"1\"}"]
 * 3. Login with token: ["{\"msg\":\"method\",\"method\":\"login\",\"params\":[{\"resume\":\"HKCS60-5A5xVT7LbpisufeSQSG_Dl1tfK3E-10M3oRK\"}],\"id\":\"1\"}"]
 */

window.anonymousLogin = function(){

};

ddp.on("connected", function(){
    console.log("Connected");
    window.ddp_connected = true;
    var event = new Event('ddpConnected');
    document.dispatchEvent(event);
});

ddp.on("result", function(message){
    if (method_callback[message.id] && typeof method_callback[message.id] === 'function' ){
        method_callback[message.id]("result",message.result);
        //delete method_callback[message.id];
    }
});
ddp.on("updated", function(message){
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
ddp.on("added", function(message){
    //console.log('collection:', JSON.stringify(message.collection));
    var event = new CustomEvent(message.collection, { 'detail': message });
    document.dispatchEvent(event);
});

ddp.on("changed", function(message){
    //console.log('collection:', JSON.stringify(message.collection));
    var event = new CustomEvent(message.collection, { 'detail': message });
    document.dispatchEvent(event);
});
ddp.on("removed", function(message){
    var event = new CustomEvent(message.collection, { 'detail': message });
    document.dispatchEvent(event);
});
