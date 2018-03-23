var todayUTC = new ReactiveVar(null);

Template.dayTasks.onRendered(function () {
  var now = new Date();
  var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
      0, 0, 0, 0);

  todayUTC.set(date);

  var group_id = Router.current().params._id;
  Meteor.subscribe('group_workstatus',group_id, date);
});

Template.dayTasks.helpers({
  data: function() {
    var group_id = Router.current().params._id;

    return WorkStatus.findOne({group_id: group_id,date: todayUTC.get(),app_user_id:Meteor.userId()});
  }
});

Template.dayTasks.events({
  'click .back': function(e) {
    return PUB.back();
  },
  'click .save': function(e) {
    var text = $('#wahtsUpTextContent').val();

    var group_id = Router.current().params._id;
    var date = todayUTC.get();

    var work_status = WorkStatus.findOne({group_id: group_id,date: todayUTC.get(),app_user_id:Meteor.userId()});
    if (work_status) {
      var whats_up = work_status.whats_up || [];
      whats_up.push({
        content: text,
        person_name: Meteor.user().username,
        ts: Date.now()
      });
      WorkStatus.update({_id: work_status._id},{$set:{whats_up: whats_up}}, function(error, result){
        if(error) {
          console.log('==sr==. update WorkStatus Err=', error);
          return PUB.tosat('更新今日简述失败~')
        }
        return PUB.back();
      });
    }
  }
});