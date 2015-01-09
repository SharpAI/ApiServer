	Template.signupForm.events({
		'submit #signup-form':function(e,t){
			e.preventDefault();
			Accounts.createUser({
				username:t.find('#signup-username').value,
				password:t.find('#signup-password').value,
				email:t.find('#signup-email').value,
				profile:{
					fullname:t.find('#signup-name').value
				}
			},function(err){
				if(err){
					alert("Account is not created");
				}
                else
                {
                    Router.go('/registerFollow');
                }
			});
		}
	});
