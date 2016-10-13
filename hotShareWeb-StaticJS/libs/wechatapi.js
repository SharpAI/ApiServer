/**
* Created by simba on 10/5/16.
*/

function isWeiXinFunc() {
    var M, ua;
    ua = window.navigator.userAgent.toLowerCase();
    M = ua.match(/MicroMessenger/i);
    if (M && M[0] === 'micromessenger') {
        return true;
    } else {
        return false;
    }
};

function sendShareDataToServer(type){
    CallMethod('weshare',[postid,type])
}
function sendSectionShareDataToServer(type,section){
    CallMethod('weshare',[postid,type,section])
}
function wechatSetup(signatureResult) {
    console.log('wechat_sign:', signatureResult);
    return wx.config({
        debug: true,
        appId: signatureResult.appid,
        timestamp: signatureResult.timestamp,
        nonceStr: signatureResult.nonceStr,
        signature: signatureResult.signature,
        jsApiList: ['checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone']
    });
};
function wechatReady() {
    var chatShareData,timelineData;

    var title = post_title;
    var desc = post_desc;
    var image = post_image;

    timelineData = {
        title: title,
        desc: title,
        link: window.location.href.split('#')[0],
        imgUrl: image,
        success: function() {
            var hotPosts;
            sendShareDataToServer('timeline');

            /*
             hotPosts = _.filter(Session.get('hottestPosts') || [], function(value) {
             return !value.hasPush;
             });
            if (hotPosts.length > 0 || (Meteor.user().profile && Meteor.user().profile.web_follower_count && Meteor.user().profile.web_follower_count > 0)) {
                $('.shareReaderClub,.shareReaderClubBackground').show();
            }*/
            console.log('shared to timeline')
        },
        cancel: function() {
            console.log('Share cancled');
        }
    };
    chatShareData = {
        title: title,
        desc: desc,
        link: window.location.href.split('#')[0],
        imgUrl: image,
        success: function() {
            var hotPosts;
            //trackEvent("Share", "Post to Wechat Chat");
            console.log('shared to chat')
            sendShareDataToServer('chat');
            /*hotPosts = _.filter(Session.get('hottestPosts') || [], function(value) {
                return !value.hasPush;
            });
            if (hotPosts.length > 0 || (Meteor.user().profile && Meteor.user().profile.web_follower_count && Meteor.user().profile.web_follower_count > 0)) {
                $('.shareReaderClub,.shareReaderClubBackground').show();
            }*/
            console.log('Share success');
        },
        cancel: function() {
            console.log('Share cancled');
        }
    };
    wx.onMenuShareTimeline(timelineData);
    wx.onMenuShareQQ(chatShareData);
    wx.onMenuShareWeibo(chatShareData);
    wx.onMenuShareAppMessage(chatShareData);
    return wx.onMenuShareQZone(chatShareData);
};
function setupWeichat(url) {
    /*HTTP.get(sign_server_url + encodeURIComponent(url), function(error, result) {
    });*/
    jQuery.ajaxSetup({ cache: false });
    jQuery.getJSON(sign_server_url + encodeURIComponent(url), function(data){
        console.log('get json wechat sign data:', data);
        var signatureResult = data;
        //signatureResult = JSON.parse(result.content);
        console.log('data: '+data)
        wechatSetup(signatureResult);
        wx.ready(wechatReady);
        wx.error(function(res){
            console.log(res)
        });
    });
};
wechat_sign = function(){
    setupWeichat(window.location.href.split('#')[0]);
};
