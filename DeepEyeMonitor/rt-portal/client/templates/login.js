if (Meteor.isClient) {
	Template.login.events({
    "submit #login-form": function (event,t) {
      // Prevent default browser form submit
        event.preventDefault();
		console.log('click on login')
		var username = t.find('#login-username').value
		var password = t.find('#login-password').value

		console.log('username is '+username)
		if (username === '' || username === undefined){
			toastr.info('Please input username')
			return;
		}else if (password === '' || password === undefined){
			toastr.info('Please input password！')
			return;
		}
		Meteor.loginWithPassword(username, password, function(error){
			if(error) {
				toastr.info('Your username and password is mismatch');
			}else {
				Router.go('/dashboard/overview');
			}
		});
    },
	"click .register": function(event){
		event.preventDefault();
		console.log('clicked on register')
		Session.set("gosignup",true)
	}
  });

	Template.login.rendered = function(){
		$(".login-page").addClass("ng-enter");
		setTimeout(function(){
			$(".login-page").addClass("ng-enter-active");
		}, 300);
		setTimeout(function(){
			$(".login-page").removeClass("ng-enter");
			$(".login-page").removeClass("ng-enter-active");
		}, 600);
	};
  
}