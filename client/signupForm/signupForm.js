Template.signupForm.events({
    'click #btn_back': function () {
      Router.go('/authOverlay');
    },
	'submit #signup-form':function(e,t){
		e.preventDefault();
		Accounts.createUser({
          username:t.find('#signup-username').value,
          password:t.find('#signup-password').value,
          email:t.find('#signup-email').value
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
