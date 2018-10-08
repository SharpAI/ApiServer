if(Meteor.isClient){
	Template.overview.rendered = function(){
		if(Session.get("animateChild")){
			$(".overview-page").addClass("ng-enter");
			setTimeout(function(){
				$(".overview-page").addClass("ng-enter-active");
			}, 300);
			setTimeout(function(){
				$(".overview-page").removeClass("ng-enter");
				$(".overview-page").removeClass("ng-enter-active");
			}, 600);
		}
	};
	Template.overview.helpers({
		noTraffic:function(){
			return (Session.get('noTrafficData') === true)
		},
		realtimePage:function(){
			return (Session.get('currentPage') === 'realtime')
		},
		historyPage:function(){
			return (Session.get('currentPage') === 'history')
		},
		lsLoading:function(){
			return (Session.get('noTrafficData') === 'loading')
		}
	})

}
