Template.timelineAlbum.onRendered(function(){
  Session.set('timelineAlbumLimit',10);
  var uuid = Router.current().params._uuid;
  $('.content').scroll(function(){
    var height = $('.timeLine').height();
    var contentTop = $('.content').scrollTop();
    var contentHeight = $('.content').height();
    console.log(contentTop+contentHeight)
    console.log(height)
    if((contentHeight + contentTop + 50 ) >= height){
      var limit = Session.get('timelineAlbumLimit') + 10
      console.log('loadMore and limit = ',limit);
      SimpleChat.withMessageHisEnable && SimpleChat.loadMoreMesage({people_uuid:uuid,type:'text', images: {$exists: true}}, {limit: limit, sort: {create_time: -1}}, limit);
      Session.set('timelineAlbumLimit',limit);
    }
  })
});
Template.timelineAlbum.helpers({
  lists: function(){
    var uuid = Router.current().params._uuid;
    var msgs = [];
    var tempDate = null;
    if(SimpleChat.Messages.find({people_uuid:uuid,type:'text', images: {$exists: true}},{sort:{create_time:1}}).count() ==0){
       SimpleChat.withMessageHisEnable && SimpleChat.loadMoreMesage({people_uuid:uuid,type:'text', images: {$exists: true}}, {limit: 10, sort: {create_time: -1}}, 10);
    }
    SimpleChat.Messages.find({people_uuid:uuid,type:'text', images: {$exists: true}},{sort:{create_time:-1}}).forEach(function(item){
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
  },
  'click .images': function(){
    var uuid = Router.current().params._uuid;
    device = Devices.findOne({uuid: uuid});
    // if(device){
    //   var person_info = {
    //     'id': res[updateObj.images[i].label].faceId,
    //     'uuid': msgObj.people_uuid,
    //     'name': nas[0],
    //     'group_id': msgObj.to.id,
    //     'img_url': updateObj.images[i].url,
    //     'type': updateObj.images[i].img_type,
    //     'ts': new Date(updateObj.create_time).getTime(),
    //     'accuracy': 1,
    //     'fuzziness': 1
    //   }
    // }
    PUB.confirm('是否将该时间记录到每日出勤报告？', function(){
      console.log('ok')
      PUB.toast('已记录到每日出勤报告')
      // Meteor.call('send-person-to-web',person_info,function(err, res){
      //   if(err){
      //     console.log('send-person-to-web Err:',err);
      //   }
      // })
    })
  }
});