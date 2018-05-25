var showPop = new ReactiveVar(false);
var labelScore = new ReactiveVar('-/-');
var roateScore = new ReactiveVar('-/-');
Template.groupInstallTest.onRendered(function(){
    var group_id = Router.current().params._id;
    Meteor.subscribe('device_by_groupId',group_id);
    var mySwiper = new Swiper('#gif',{
        pagination: '.swiper-pagination',
    });
    var group = SimpleChat.Groups.findOne({_id:group_id});
    if(group.installStatus && group.installStatus.a && group.installStatus.b && group.installStatus.c){
        showPop.set(true);
    }
})

Template.groupInstallTest.helpers({
    astatus:function(){
        var group_id = Router.current().params._id;
        var group = SimpleChat.Groups.findOne({_id:group_id});
        if(group.installStatus && group.installStatus.a){
            return "checked";
        }
        return "";
    },
    bstatus:function(){
        var group_id = Router.current().params._id;
        var group = SimpleChat.Groups.findOne({_id:group_id});
        if(group.installStatus && group.installStatus.b){
            return "checked";
        }
        return "";
    },
    cstatus:function(){
        var group_id = Router.current().params._id;
        var group = SimpleChat.Groups.findOne({_id:group_id});
        if(group.installStatus && group.installStatus.c){
            return "checked";
        }
        return "";
    },
    canleft:function(){
        var s = Session.get('isStarting');
        if(!s || !s.isTesting){
            return true;
        }
        return false;
    },
    popupConfig:function(){
        var isShow = showPop.get()?"":"display:none;"
        return {
            isShow:isShow,
            content:"请在点击开始之后,1分钟内到摄像头面前正面站立大概1分钟左右离开,然后查看评测分数,根据分数调整配置",
            btn:"开始"
        }
    },
    isTesting:function(){
        var s = Session.get('isStarting');
        var group_id = Router.current().params._id;
        if(s&&s.group_id == group_id){
            if(s.showScore){
                return true;
            }
            return s.isTesting;
        }
        return false;
    }
})
Template.groupInstallTest.events({
    'click input[type=checkbox]':function(e){
        var group_id = Router.current().params._id;
        console.log(e.currentTarget.id);
        var isFinish = $(e.currentTarget.id).is(':checked');
        var key = 'installStatus.'+e.currentTarget.id;
        var setting = {};
        setting[key] = !isFinish;
        Meteor.call('update_install_status',group_id,setting,function(err){
            if(err){
                console.log(err);
                return;
            }
            var group = SimpleChat.Groups.findOne({_id:group_id});
            if(group.installStatus && group.installStatus.a && group.installStatus.b && group.installStatus.c){
                showPop.set(true);
            }
        });
    },
    'click .back':function(e){
        e.preventDefault();
        e.stopPropagation();
        Session.set('isStarting',null);
        return PUB.back();
    },
    'click #operate':function(e){
        e.stopPropagation();
        var group_id = Router.current().params._id;
        Session.set('isStarting',{
            isTesting:true,
            group_id:group_id
        })
        showPop.set(false);
        //开始测试
        Meteor.setTimeout(function(){
            var st = Session.get('isStarting');
            st.isTesting = false;
            st.showScore = true;
            Session.set('isStarting',st);
            var totalCount = message_queue.length;
            var labelArr = _.filter(message_queue,function(m){
                if(m.label &&  m.label != ''){
                    return true;
                }
                return false;
            });
            var frontArr = _.filter(message_queue,function(m){
                return m.style == 'front'
            });
            if(totalCount == 0){
                return;
            }
            labelScore.set(Math.floor(labelArr.length/totalCount * 100) + '');
            roateScore.set(Math.floor(frontArr.length/totalCount * 100) + '');
            message_queue = [];
        }, 2*60*1000);
    },

})
Template.popup.events({
    'click .close':function(){
        showPop.set(false);
    }
})
Template.score.helpers({
    label_score:function(){
        return labelScore.get();
    },
    roate_score:function(){
        return roateScore.get();
    },
    cancel:function(){
        var s = Session.get('isStarting');
        if(!s || !s.isTesting){
            return false;
        }
        return true;
    }
})
Template.score.events({
    'click #cancel':function(e){
        var st = Session.get('isStarting');
        st.isTesting = false;
        st.showScore = true;
        Session.set('isStarting',st);
        message_queue = [];
    },
    'click #goTimeLine':function(){
        var group_id = Router.current().params._id;
        var deviceLists =  Devices.find({groupId: group_id}).fetch();
        if (deviceLists && deviceLists.length > 0) {
            if(deviceLists.length == 1 && deviceLists[0].uuid) {
              return PUB.page('/timelineAlbum/'+deviceLists[0].uuid+'?from=groupchat');
            } else {
              Session.set('_groupChatDeviceLists',deviceLists);
              return $('._checkGroupDevice').fadeIn();
            }
          }
        return PUB.toast('该群组下暂无设备');
    },
    'click #goLink':function(e){
        var ref = cordova.ThemeableBrowser.open('http://workaiossqn.tiegushi.com/description.pdf', '_blank', {  
            title: {  
                color: '#000000',  
                showPageTitle: true,  
                staticText: '部署说明'  
            },  
            closeButton: {  
                image: 'back',  
                imagePressed: 'back_pressed',  
                align: 'left',  
                event: 'closePressed'  
            },
            statusbar: {
                color: '#37a7fe'
            },
            toolbar: {  
                height: 44,
                color: '#37a7fe' 
            }  
        }); 
        ref.addEventListener('closePressed', function(event) {
            return ref.close();
        }); 
    }
})
var message_queue = [];
GroupInstallTest = function(message){
    message = JSON.parse(message);
    console.log('GroupInstallTest');
    if(message.event_type == "motion"){
        return;
    }
    if(message.images && message.images.length>0){
        message_queue.push.apply(message_queue,message.images);
    } 
    console.log('GroupInstallTest',message_queue.length); 
}