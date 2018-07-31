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
        var $li = $(e.currentTarget)
        var id = $li.attr("data")
        if ( tagName === "a" || tagName === "i" ) {
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
        if ( tagName === "button" ) {
            var imgData = markList.get()
            var val = $("#mark_val").val()
            var uuid = this.uuid
            var id = this._id
            var group_id = this.group_id
            // imgData = JSON.parse(imgData)
            // var faceId = new Mongo.ObjectID()._str
            Session.set("isMark",true)
        
            var call_back_handle = function(name){
                if (!name) {
                return;
                }
                
                PUB.showWaitLoading('处理中');
                var setNames = [];
                Meteor.call('get-id-by-name1', uuid, name, group_id, function(err, res){
                if (err || !res){
                    return PUB.toast('标注失败，请重试');
                }
                
                var faceId = null;
                if (res && res.faceId){
                    faceId = res.faceId;
                }else if (imgData[0].person_name != null && imgData[0].person_name != undefined) {
                    faceId = new Mongo.ObjectID()._str;
                }else {
                    faceId = imgData[0].faceid;
                }
        
                imgData.forEach(function(item) {
                    // 发送消息给平板
                    var trainsetObj = {
                    group_id: group_id,
                    type: 'trainset',
                    url: item.url,
                    person_id: item.faceid,
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
                        url: item.url, 
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
                        'img_url': item.url,
                        'type': 'face',
                        'ts': new Date().getTime(),
                        'accuracy': item.accuracy,
                        'fuzziness': item.fuzziness,
                        'sqlid':item.sqlid,
                        'style':item.style
                    };
                    var data = {
                        face_id: item.faceid,
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
            Local_data.remove({_id: id})
            Meteor.call('removeStrangers', id)
            var len = Local_data.find().fetch().length
            $('#stranger-contain').find($li).remove()
            if (len == 0) {
                PUB.page(url)
            }
        }
    }
})

Template.haveStranger.helpers({
    isHaveStranger: function() {
       return true;
    },
    Stranger_people: function(){
        return Local_data.find({})
    },
    isMark: function() {
        return Session.get("isMark")
    }
})