//0:刚进入显示开始 1:点击开始后显示结束按钮
var btn_pro = new ReactiveVar(0);
var markList = new ReactiveVar([]);
Session.set("isMark",true)

var datas = null
// $.get('http://192.168.31.113:5000/api/parameters', function(data){
//     datas = data
// })

Template.haveStranger.events({
    'click .back':function(e){
        btn_pro.set(0);
        return PUB.back();
    },
    'click .stranges-item': function(e,t){
        var sessionType = Session.get("session_type")
        var toUserId = Session.get("toUser_id")
        // alert($(".stack__item--current").css('opacity') == "1")
        var url = '/simple-chat/to/'+sessionType+'?id='+ toUserId
        // alert($(e.target).prop("tagName"))
        var tagName = $(e.target).prop("tagName").toLowerCase()
        if ( tagName === "a" || tagName === "i" ) {
            var $li = $(e.currentTarget)
            var id = $li.attr("data")
            if ( $(e.target).attr("id") === "reject" || $(e.target).parent().attr("id") === "reject" ) {
                Session.set("isMark",true)
                Local_data.remove({_id: id})
                Meteor.call('removeStrangers', id)
                // alert(JSON.stringify(Local_data.find({}).fetch().length))
                var len = Local_data.find().fetch().length
                $('#stranger-contain').find($li).remove()
                // alert($li.attr('data'))
                if (len == 0) {
                    PUB.page(url)
                }
            } else {
                var curData = Local_data.find({_id: id}).fetch()[0].imgs
                Session.set("isMark",false)
                markList.set(curData)
            }
        }
    },
    'keyup #mark_val':function(e,t){
        console.log('123')
    },
    'click #confirm-val':function() {
        var imgData = markList.get()
        var val = $("#mark_val").val()
        var uuid = this.uuid
        var id = this._id
        var group_id = this.group_id
        var imgs = this.imgs
        imgData = JSON.parse(imgData)
        var setNames = []
        var faceId = new Mongo.ObjectID()._str;
        // { uuid: '78c2c095de5c',
    //      id: '15329188969150000',
    //      url: 'http://workaiossqn.tiegushi.com/083a5f2e-93a3-11e8-af0f-0242ac130005',
    //      name: 'sjdd',
    //      sqlid: 'front',
    //      style: '0' } 
        // setNames.push({
        //     uuid: uuid, 
        //     id: faceId,
        //     url: imgData, 
        //     name: val,
        //     sqlid:null,
        //     style:null
        // })
        // Meteor.call('mark-strangers', group_id, setNames);
        var call_back_handle = function(name){
            if (!name) {
              return;
            }
            debugger
            PUB.showWaitLoading('处理中');
            var setNames = [];
            Meteor.call('get-id-by-name1', uuid, name, group_id, function(err, res){
              if (err || !res){
                return PUB.toast('标注失败，请重试');
              }
              
              var faceId = null;
              faceId = new Mongo.ObjectID()._str;
             
      
              imgData.forEach(function(item) {
                // 发送消息给平板
                var trainsetObj = {
                  group_id: group_id,
                  type: 'trainset',
                  url: item,
                  person_id: faceId,
                  device_id: uuid,
                  face_id: faceId,
                  drop: false,
                  img_type: 'face',
                  style:item.style,
                  sqlid:item.sqlid
                };
                console.log("==sr==. timeLine multiSelect: " + JSON.stringify(trainsetObj));
                sendMqttMessage('/device/'+group_id, trainsetObj);
      
                setNames.push({
                  uuid: uuid, 
                  id: faceId, //item.person_id,
                  url: item, 
                  name: name,
                  sqlid:item.style,
                  style:item.sqlid
                });
              });
      
              if (setNames.length > 0){
                Meteor.call('set-person-names', group_id, setNames);
              }
              imgData.forEach(function(item) {
                try {
                  var person_info = {
                    'uuid': uuid,
                    'name': name,
                    'group_id':group_id,
                    'img_url': item,
                    'type': 'face',
                    'ts': item.ts,
                    'accuracy': item.accuracy,
                    'fuzziness': item.fuzziness,
                    'sqlid':item.sqlid,
                    'style':item.style
                  };
                  var data = {
                    face_id: faceId,
                    person_info: person_info,
                    formLabel: true
                  };
                  
                  Meteor.call('ai-checkin-out',data,function(err,res){});
                } catch(e){}
              });
              PUB.hideWaitLoading();
            });
          };
      
          SimpleChat.show_label(group_id, this.avatar, call_back_handle);
        },
    })

Template.haveStranger.helpers({
    isHaveStranger: function() {
       return true;
    },
    Stranger_people: function(){
        // alert(JSON.stringify(Local_data.find({},{limit: 2}).fetch()))
        return Local_data.find({})
    },
    isMark: function() {
        return Session.get("isMark")
    }
})