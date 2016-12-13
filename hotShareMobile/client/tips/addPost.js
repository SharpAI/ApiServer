var swiper = new Swipe(['_tips_addPost_one', '_tips_addPost_two', '_tips_addPost_three']);
var handler = null;

Template._tips_addPost.helpers({
  swiper: function(){
    return swiper;
  }
});

Template._tips_addPost.onRendered(function(){
  swiper.setInitialPage('_tips_addPost_one');
  if(handler){
    handler.stop()
    handler = null;
  }
  Tracker.autorun(function(obj){
    handler = obj;
    if(swiper.pageIs('_tips_addPost_one')){
      swiper.leftRight(null, '_tips_addPost_two');
    }else if(swiper.pageIs('_tips_addPost_two')){
      swiper.leftRight('_tips_addPost_one', '_tips_addPost_three');
    }else if(swiper.pageIs('_tips_addPost_three')){
      swiper.leftRight('_tips_addPost_two', null);
    }
  });
});

Template._tips_addPost.events({
  "click ._tips_addPost_three": function(e, t) {
    Tips.close();
  }
});