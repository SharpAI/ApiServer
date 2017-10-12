if(Meteor.isServer){
  Meteor.startup(function(){
    Meteor.methods({
      'getOfficesOnlineInfo': function(ids,date){
        var lists = [];
        ids.forEach(function(item){
          var group = SimpleChat.Groups.findOne({_id: item});
          if(group){
            var count = WorkStatus.find({date:date,group_id: item,status: 'in'}).count();
            lists.push({
              _id: group._id,
              name: group.name,
              value: count
            });
          }
        });
        return lists;
      }
    })
  });
}