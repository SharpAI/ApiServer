var isLoading = new ReactiveVar(false);
var timeRange = new ReactiveVar([]);
var group_id = new ReactiveVar('');

var personCounts = new ReactiveVar({});

var initTimeRangeSet = function() {
  var range = timeRange.get();
  
  $('#timeRange').mobiscroll().range({
    defaultVaule: [new Date(),new Date()],
    theme: 'material',
    lang: 'zh',
    display: 'bottom',
    controls: ['time'],
    maxWidth: 100,
    setText: '设置',
    fromText: '开始时间',
    toText:'结束时间',
    defaultValue: [
        new Date(range[0]),new Date(range[1])
    ],
    onSet: function(value, inst){
      var val = value.valueText;

      var vals = val.split(' - ');
      var startArr =  vals[0].split(":");
      var endArr = vals[1].split(":");

      var now = new Date();

      var range = timeRange.get();
      range[0] = new Date(now.getFullYear(),now.getMonth(), now.getDate() , 
      Number(startArr[0]), Number(startArr[1]), 0, 0);
      range[1] = new Date(now.getFullYear(),now.getMonth(), now.getDate() , 
      Number(endArr[0]), Number(endArr[1]), 0, 0);

      timeRange.set(range);
    }
  });
};

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
  initTimeRangeSet();
  Meteor.subscribe('group-device-timeline', group_id.get(),range, function() {
    isLoading.set(false);
  });
  Meteor.setTimeout(function(){
    $(document).scrollTop(0);
  },50);
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
  },
  getRange: function() {
    var range = timeRange.get();
    var start = new Date(range[0]);
    var end = new Date(range[1]);
    return start.parseDate('hh:mm') + ' - ' + end.parseDate('hh:mm');
  }
});

Template.recognitionCounts.events({
  'click .back': function(e) {
    return PUB.back();
  },
  'click #timeRange': function(e) {
    return $('#timeRange').mobiscroll('show');
  }
})