
if(Meteor.isServer){
    Meteor.startup(function(){
        Meteor.methods({
            "getPostFriends": function (postId,skip,limit) {
                if (this.userId === null || !Match.test(postId, String) || !Match.test(skip, Number) || !Match.test(limit, Number)) {
                    return [];
                }
                this.unblock();
                var self = this;
                var userId = this.userId;
                self.count = 0;
                if(!self.meeterIds){
                    self.meeterIds = [];
                }
                var handle = Meets.find({me: this.userId, meetOnPostId: postId}, {
                    sort: {createdAt: -1},
                    skip: skip,
                    limit: limit
                });
                var totalCount = Meets.find({me: this.userId, meetOnPostId: postId}).count();
                console.log('totalCount is ' + totalCount);
                if(handle.count()<=0){
                    return false
                }
                var postFriendsList=[];
                var total = {totalCount:totalCount};
                var result = [];
                handle.fetch().forEach(function (fields) {
                    var taId = fields.ta;
                    if (taId !== userId) {
                        if (!~self.meeterIds.indexOf(taId)) {
                            self.meeterIds.push(taId);
                            var taInfo = Meteor.users.findOne({_id: taId},{fields: {'username':1,'email':1,'profile.fullname':1,
                                'profile.icon':1, 'profile.desc':1, 'profile.location':1,'profile.lastLogonIP':1,'profile.profile.sex':1}});
                            if (taInfo){
                                try{
                                    var userName = taInfo.username;
                                    if(taInfo.profile.fullname){
                                        userName = taInfo.profile.fullname;
                                    }
                                    fields.name = userName;
                                    fields.location = taInfo.profile.location;
                                    fields.icon = taInfo.profile.icon;
                                    //fields.profile.lastLogonIP = taInfo.profile.lastLogonIP;
                                    fields.sex = taInfo.profile.sex;
                                    delete fields['meetOnPostId'];
                                    delete fields['createdAt'];
                                    delete fields['me'];
                                    delete fields['_id'];

                                } catch (error){
                                }
                                postFriendsList.push(fields)
                            }
                            //getViewLists(self,taId,3);
                            //self.added("postfriends", id, fields);
                        }
                    }
                });
                result = [total,postFriendsList];
                return result;
            }
        });
    });
}

