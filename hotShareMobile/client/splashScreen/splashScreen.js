Template.splashScreen.rendered=function(){
    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        direction: 'vertical',
        onTouchEnd: function(swiper){
           if(swiper.isEnd){
                window.localStorage.setItem("firstLog", "first");
                Session.set('isFlag', false);
            }
        }
    });
};

Template.splashScreen.events({
	"click #lastImg": function(){
                        window.localStorage.setItem("firstLog", "first");
                        Session.set('isFlag', false);
	}
});

Template.splashScreen.helpers({
  isMIUI: function () {
    return isMIUI;
  }
});