/**
 * Created by simba on 4/16/16.
 */

Template.signup.events({
    "click #back-toregister": function(e,t){
        console.log('clicked on register')
        Session.set("gosignup",false)
    },
    "submit #sign-up-form": function(e,t){

        e.preventDefault();
        var username = t.find('#username').value
        var password = t.find('#password').value
        var password1 = t.find('#rppassword').value
        var email = t.find('#email').value

        var username = t.find
        console.log('createuser')
        console.log('username:' + username);
        console.log('email:' + email);
        console.log('passwd:' + password);
        console.log('passwd1:' + password1);

        var myRegExp = /[a-z0-9-]{1,30}@[a-z0-9-]{1,65}.[a-z]{2,6}/ ;
        if (username == '' || username == undefined){
            toastr.info('Please input your username')
        } else if (myRegExp.test(email) == false) {
            toastr.info('Is that a correct email address?')
        } else if (password.length < 6) {
            toastr.info('Please input a password longer than 6 char')
        } else if (password != password1){
            toastr.info('Please double check your repeating password')
        } else {
            Accounts.createUser({
                username:username,
                email: email,
                password: password
            }, function(error){
                if (error){
                    toastr.info('Your user/email may already token, please try another one or login')
                } else{
                    Session.set("gosignup",false)
                    Router.go('/dashboard/overview');
                }
            });
        }
    }
})