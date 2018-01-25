var isLoading = new ReactiveVar(false);
var timeRange = new ReactiveVar([]);
var group_id = new ReactiveVar('');

var personCounts = new ReactiveVar({});
Template.recognitionCounts.onRendered(function(){
  isLoading.set(true);
  group_id.set(Router.current().params.group_id);

  var now = new Date();
  var range = [];
  range[0] = new Date(now.getFullYear(),now.getMonth(), now.getDate() , 
      0, 0, 0, 0);
  range[1] = new Date(now.getFullYear(),now.getMonth(), now.getDate() , 
      23, 59, 59, 0);
  
  timeRange.set(range);

  Meteor.subscribe('group-device-timeline', group_id.get(),range, function() {
    isLoading.set(false);
  });
});

Template.recognitionCounts.helpers({
  lists: function () {
    var selector = {
        group_id: group_id.get(),
        hour: {
            $gte: timeRange.get()[0],
            $lte: timeRange.get()[1]
        }
    };
    var lists = [];
    var counts = {};
    DeviceTimeLine.find(selector, {sort:{hour: -1}}).forEach(function(item){
      var uuid = item.uuid;

      for(x in item.perMin) {
        var hour = new Date(item.hour)
        hour = hour.setMinutes(x);

        var personIds = [];

        item.perMin[x].forEach( function(doc) {
          if(doc.person_id && doc.person_name && doc.person_name != null && doc.person_name != '') {
            var index = personIds.indexOf(doc.person_id);
            if(index < 0){
              personIds.push(doc.person_id);
              var obj = doc;
              obj.time = hour;
              obj.uuid = uuid;
              lists.push(obj);

              if(counts[doc.person_name]) {
                counts[doc.person_name].count += 1;
              } else {
                counts[doc.person_name] = {
                  name: doc.person_name,
                  count: 1
                };
              }
            }
          }
        });
      }
    });
    lists.sort(function(a,b){
      return a.time - b.time;
    });
    personCounts.set(counts);
    return lists;
  },
  counts: function(){
    var counts = personCounts.get();
    var lists = [];
    for(x in counts) {
      lists.push(counts[x]);
    }
    return lists;
  },
  getTime: function() {
    var d = new Date(this.time);
    return d.parseDate('YYYY-MM-DD hh:mm');
  }
});

Template.recognitionCounts.events({
  'click .back': function(e) {
    return PUB.back();
  }
})