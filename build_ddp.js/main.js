var appUtils = window.appUtils || {};
appUtils.ddp = require("ddp.js").default;
//window.appUtils = appUtils;

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
