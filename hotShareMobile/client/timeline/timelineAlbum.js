Template.timelineAlbum.helpers({
  lists: function(){
    var msgs = [];
    var tempDate = null;
    var list = [{
      "images":[{
        "url":"http://workaiossqn.tiegushi.com/03c6ed68-7b53-11e7-a2fd-7427eaa513de"
      }],
      "create_time":"2017-08-07T09:30:11.362Z"
    },{
      "images":[{
        "url":"http://workaiossqn.tiegushi.com/03c6ed68-7b53-11e7-a2fd-7427eaa513de"
      },{
        "url":"http://workaiossqn.tiegushi.com/03c6ed68-7b53-11e7-a2fd-7427eaa513de"
      },{
        "url":"http://workaiossqn.tiegushi.com/03c6ed68-7b53-11e7-a2fd-7427eaa513de"
      },{
        "url":"http://workaiossqn.tiegushi.com/03c6ed68-7b53-11e7-a2fd-7427eaa513de"
      },{
        "url":"http://workaiossqn.tiegushi.com/03c6ed68-7b53-11e7-a2fd-7427eaa513de"
      }],
      "create_time":"2017-08-07T09:32:11.362Z"
    },{
      "images":[{
        "url":"http://workaiossqn.tiegushi.com/03c6ed68-7b53-11e7-a2fd-7427eaa513de"
      }],
      "create_time":"2017-08-07T09:32:40.362Z"
    }]
    SimpleChat.Messages.find({type:'text', images: {$exists: true}},{sort:{create_time:-1}}).forEach(function(item){
    // list.forEach(function(item){
      var date = new Date(item.create_time);
      var time = date.shortTime();
      var obj = {
        create_time: time,
        images: item.images
      };
      if(tempDate !== time){
        obj.isShowTime = true;
      }
      msgs.push(obj);
      tempDate = time;
    });
    return msgs;
  }
});

Template.timelineAlbum.events({
  'click .back': function(){
    return PUB.back();
  }
});