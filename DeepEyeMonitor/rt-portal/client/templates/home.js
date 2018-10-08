/**
 * Created by simba on 4/16/16.
 */
Template.home.helpers({
    isLogging: function(){
        return false
    },
    gosignup: function(){
        return Session.get('gosignup')
    }
})
