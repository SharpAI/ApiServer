# phoneGap-wechat-oauth
phoneGap wechat oauth


## Using the plugin

Example - get user info
```javascript
WechatOauth.getUserInfo({}, function(e) {
      console.log(JSON.stringify(e));
}, function() {
    console.log("error");
});
```
