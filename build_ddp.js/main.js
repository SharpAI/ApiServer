var appUtils = window.appUtils || {};
appUtils.ddp = require("ddp.js").default;
//window.appUtils = appUtils;

var Sha256 = require('./libs/sha256');
require('./libs/random');

var uuid = function () {
    var HEX_DIGITS = "0123456789abcdef";
    var s = [];
    for (var i = 0; i < 36; i++) {
        s[i] = Random.choice(HEX_DIGITS);
    }
    s[14] = "4";
    s[19] = HEX_DIGITS.substr((parseInt(s[19],16) & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
};

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
function createNewAutoUser(username,callback){
    CallMethod("createUser", [{
        username:username,
        password:{
            digest:"8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
            algorithm:"sha-256"},
        profile:{
            fullname:"匿名",
            icon:"/userPicture.png"
            ,anonymous:true,
            browser:true
        }
    }],callback);
}
function loginErrorHandle(callback){
    localStorage.clear('savedUsername');
    localStorage.clear('loginToken');
    localStorage.clear('loginTokenExpires');
    setTimeout(function(){
        autoLogin(callback);
    },5000);
}
function loginHandle(type,result,callback){
    console.log('type: '+type+' result:'+result)
    if(type ==='result' && result && result.token && result.tokenExpires && result.tokenExpires.$date ){
        /*
         id:"LApaRD39Ziz2EcpTm"
         token:"eXoFSIulKAjjezmQ8weQuwhqVqYhY7MFBWj02nzit-z"
         tokenExpires:{$date: 1483485599652}
         */
        console.log('login success');
        localStorage.setItem('loginToken',result.token);
        localStorage.setItem('loginTokenExpires',result.tokenExpires.$date);
        if(callback){
            callback(type,result);
        }
    } else {
        console.log('login Not Success, need retry.');
        loginErrorHandle(callback);
    }
}
window.autoLogin = function(callback){
    var loginToken = localStorage.getItem('loginToken');
    var loginTokenExpires = localStorage.getItem('loginTokenExpires');
    if(loginToken && loginToken !=='' && (loginTokenExpires - new Date())>10000){
        CallMethod("login", [{
            resume: loginToken
        }],function(type,result){
            loginHandle(type,result,callback)
        });
        return
    }
    var savedUsername = localStorage.getItem('savedUsername');
    if(savedUsername && savedUsername !== ''){
        CallMethod("login", [{
            user:{
                username:savedUsername
            },
            password: {
                digest: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
                algorithm:"sha-256"
            }
        }],function(type,result){
            loginHandle(type,result,callback)
        });
        return
    }
    var randomUsername=uuid();
    localStorage.setItem('savedUsername',randomUsername);
    createNewAutoUser(randomUsername,function(type,result){
        loginHandle(type,result,callback)
    });
};

ddp.on("connected", function(){
    console.log("Connected");
    window.ddp_connected = true;
    var event = new Event('ddpConnected');
    document.dispatchEvent(event);
});

ddp.on("result", function(message){
    if (method_callback[message.id] && typeof method_callback[message.id] === 'function' ){
        if(message.result){
            method_callback[message.id]("result",message.result);
        } else if(message.error){
            method_callback[message.id]("error",message.error);
        }
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
