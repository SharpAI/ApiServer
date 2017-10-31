
if(Meteor.isServer){
    Meteor.startup(function(){
        Meteor.methods({
            "getPostFriends":function (postId,skip,limit){
                if (this.userId === null || !Match.test(postId, String) || !Match.test(skip, Number) || !Match.test(limit, Number)) {
                    return [];
                }
                this.unblock();
                var queryString = 'MATCH (u:User) WHERE u.userId="'+this.userId+'" WITH u ' +
                'MATCH (p:Post) WHERE p.postId="'+postId+'" WITH u,p ' +
                'MATCH (u1:User)-[v1:VIEWER]->(p:Post) WHERE u1.userId <>"'+this.userId+'" WITH distinct u1 as meeter,u,p ' +
                'MATCH meeter-[v2:VIEWER]->(p1:Post)<-[v3:VIEWER]-u WITH distinct meeter as meeter1,size(collect(distinct p1)) as meetsCount ' +
                'RETURN distinct meeter1.userId,meetsCount ORDER BY meetsCount DESC SKIP '+skip+' LIMIT '+limit;

                /*
                var queryString = 'MATCH (u:User)-[v:VIEWER]->(p:Post)<-[v1:VIEWER]-(u1:User) ' +
                    'WHERE p.postId="'+postId+'" and u.userId="'+this.userId+'" ' +
                        'and u1.userId <>"'+this.userId+'" ' +
                    'WITH distinct u1 as meeter,u ' +
                    'MATCH meeter-[v2:VIEWER]->(p1:Post)<-[v3:VIEWER]-u ' +
                    'WITH distinct meeter as meeter1,size(collect(distinct p1)) as meetsCount ' +
                    'RETURN distinct meeter1.userId,meetsCount ORDER BY meetsCount DESC SKIP '+skip+' LIMIT '+limit;
                */
                try {
                    var queryResult = Neo4j.query(queryString);
                } catch (_error) {
                    console.log("Can't query hot post from neo4j server");
                    if (postMessageToGeneralChannel) {
                        if (process.env.PRODUCTION) {
                            postMessageToGeneralChannel("@everyone Can't query hot post from neo4j server, this is reporting from Production server.");
                        } else {
                            postMessageToGeneralChannel("@everyone Can't query hot post from neo4j server, this is reporting from Test/Local  server.");
                        }
                    }
                    return [];
                }
                console.log('Query String for getPostFriends is: '+queryString);
                var postFriendsList=[];
                queryResult.forEach(function (item) {
                    if(item && item[0] && item[1] && Match.test(item[0], String) && Match.test(item[1], Number)){
                        var taId = item[0];
                        var taInfo = Meteor.users.findOne({_id: taId},{fields: {'username':1,'profile.fullname':1,
                            'profile.icon':1, 'profile.desc':1, 'profile.location':1,'profile.profile.sex':1}});
                        if (taInfo){
                            try{
                                var userName = taInfo.username;
                                if(taInfo.profile.fullname){
                                    userName = taInfo.profile.fullname;
                                }
                                var fields = {
                                    ta:item[0],
                                    name:userName,
                                    location:taInfo.profile.location?taInfo.profile.location:'未知',
                                    icon:taInfo.profile.icon,
                                    sex:taInfo.profile.sex,
                                    count:item[1]
                                };
                                postFriendsList.push(fields)
                            } catch (error){
                                console.log('Exception for the post neo4j query'+error);
                            }
                        }
                    }
                });
                return postFriendsList;
            }
        });
    });
}

