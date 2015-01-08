Template.loginForm.events({
	'submit #login-form':function(e,t){
		e.preventDefault();
		var uname=t.find("#login-username").value;
		var password=t.find("#login-password").value;
		Meteor.loginWithPassword(uname,password,function(error){
        if(error)
		{
			alert("Wrong Credentials");
		}
        else
        {
            Router.go('/');
        }
		});
	}
});
