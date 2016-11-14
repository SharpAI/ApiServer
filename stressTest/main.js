/**
 * Created by simba on 11/8/16.
 */
meteorDown.init(function (Meteor) {
    Meteor.call('login',{"resume":"BhcBnM2TVgznbjCCcZmbP-pLFYjtcsXVvdLa4UNbuUk"}, function (error, result) {
        console.log(result);
        Meteor.call('profileData','KjXj9TtBaRquETXZL',function(err,result){
            console.log(result)
        });

        Meteor.subscribe('userNewBellCount','KjXj9TtBaRquETXZL', function(err,result){
            console.log(result)
        });
        Meteor.call('socialData','f6c453c28fe232fe000059',function(err,result){
            console.log(result)
        });
        Meteor.call('readPostReport',"57f6c453c28fe232fe000059","KjXj9TtBaRquETXZL",function(err,result){
            console.log(result)
        });
        Meteor.subscribe('reading','57f6c453c28fe232fe000059', function(err,result){
            console.log(result)
        });
        Meteor.call('socialData','f6c453c28fe232fe000059',function(err,result){
            console.log(result)

            Meteor.call('getPostFriends',"57f6c453c28fe232fe000059",0,20, function(err,result){
                console.log(result)
                Meteor.call('getSuggestedPosts',"57f6c453c28fe232fe000059",0,2, function(err,result){
                    console.log(result)
                    setTimeout(function(){
                        Meteor.kill();
                    },2000)
                });
            });

        });
    });
});

meteorDown.run({
    concurrency: 20,
    url: "http://host2.tiegushi.com"
});
