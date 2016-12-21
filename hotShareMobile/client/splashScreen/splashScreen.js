Template.splashScreen.rendered=function(){
    // StatusBar.backgroundColorByHexString("#ffffff");
    // StatusBar.styleDefault();
    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        direction: 'horizontal',
        onTouchEnd: function(swiper){
           if(swiper.isEnd){
                window.localStorage.setItem("firstLog", "first");
                Session.set('isFlag', false);
            }
        }
    });
};

// Template.authOverlay.onDestroyed(function () {
//     StatusBar.backgroundColorByHexString("#37a7fe");
//     StatusBar.styleLightContent();
// });
Template.splashScreen.events({
	"click #lastImg": function(){
                        window.localStorage.setItem("firstLog", "first");
                        Session.set('isFlag', false);
	}
});

Template.splashScreen.helpers({
  isIOS: function () {
    if (device.platform == 'iOS') {
      return true;
    } else {
      return false;
    }
  },
  isUSVersion: function () {
    // return isUSVersion;
    if(Session.equals('display-lang',undefined)){
      return getUserLanguage() == 'en';
    } else {
      return Session.equals('display-lang','en');
    }
  }
});
