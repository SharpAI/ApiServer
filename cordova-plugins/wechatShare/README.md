# phoneGap-wechat-sharing
phoneGap wechat sharing to friend,moment,favorite


## Using the plugin

Example -share to moment
```javascript
WechatShare.shareToMoment({
    "title": "title",
    "summary": "summary",
    "image_url": "http://img3.cache.netease.com/photo/0005/2013-03-07/8PBKS8G400BV0005.jpg",
    "target_url": "http://weibo.com/u/5398990359"
}, function() {
      console.log("ok");
}, function() {
    console.log("error");
});
```
Example -share to friend 
```javascript
WechatShare.shareToSession({
    "title": "title",
    "summary": "summary",
    "image_url": "http://img3.cache.netease.com/photo/0005/2013-03-07/8PBKS8G400BV0005.jpg",
    "target_url": "http://weibo.com/u/5398990359"
}, function() {
      console.log("ok");
}, function() {
    console.log("error");
});
```
Example -share to favorite 
```javascript
WechatShare.shareToFavorite({
    "title": "title",
    "summary": "summary",
    "image_url": "http://img3.cache.netease.com/photo/0005/2013-03-07/8PBKS8G400BV0005.jpg",
    "target_url": "http://weibo.com/u/5398990359"
}, function() {
      console.log("ok");
}, function() {
    console.log("error");
});
```
