if(Meteor.isClient){
	Meteor.startup(function(){
		Template.dashboard.rendered = function(){
			if(!Session.get("animateChild")){
				$(".dashboard-page").addClass("ng-enter");
				setTimeout(function(){
					$(".dashboard-page").addClass("ng-enter-active");
				}, 300);
				setTimeout(function(){
					$(".dashboard-page").removeClass("ng-enter");
					$(".dashboard-page").removeClass("ng-enter-active");
					Session.set("animateChild", true);
				}, 600);
			}
		};

		Template.dashboard.destroyed= function(){
			Session.set("animateChild", false);
		};

		Template.dashboard.helpers({
			token: function(){
				return Meteor.userId()
			},
			enableBoxDisplay: function() {
				return withBoxDisplay || false;
			},
			withLiveChat: function(){
				return withLiveChat || false;
                        },
                        withQoEDisplay: function(){
                                return withQoE || false;
			}
		});

		Template.dashboard.events({
			"click #logout-btn": function(e){
				e.preventDefault();
				Meteor.logout(function(){
					Router.go('/')
				})
			}
		});

		Session.set("animateChild", false);
	})
}
