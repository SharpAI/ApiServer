//0:不显示 1:开始测试 2:点击右上角 3:安装检查
var showPop = new ReactiveVar(0);
var labelScore = new ReactiveVar('---');
var roateScore = new ReactiveVar('---');
var showRes = new ReactiveVar(true);
var timer;
var uuid;
var deviceUserId;
Template.groupInstallTest.onRendered(function(){
    var group_id = Router.current().params._id;
    uuid = Router.current().params.uuid;
    Meteor.subscribe('devices-by-uuid',uuid,function(err){
        if(err){
            console.log(err);
            return;
        }

        var st = Session.get('isStarting');
        if(st && st.label_score){
            labelScore.set(st.label_score);
        }
        if(st && st.roate_score){
            roateScore.set(st.roate_score);
        }
        var dev = Devices.findOne({uuid: uuid});
        if (!(dev.online && dev.camera_run)) {
            showPop.set(4);
        }
        else if(!st){
            showPop.set(1);
        }
    });
    
})

Template.groupInstallTest.helpers({
    popupConfig:function(){
        var s = showPop.get();
        var isShow = s === 0?"display:none;":"";
        var content = '';
        var btn = '';
        var head = '';
        var showFoot = '';
        var showClose = '';
        var deviceImg = '/device_offline.png';
        var cameraImg = '/camera_offline.png';
        var dev = Devices.findOne({uuid: Router.current().params.uuid});
        switch(s){
            case 1:
                content = '请在点击开始后，按照摄像头部署方向以正常速度来回走过，检查你的摄像头安装角度和识别率';
                btn = '开始';
                break;
            case 2:
                content = '设备未接通，请查看右上角帮助';
                // btn = '确定';
                showFoot = 'display:none';
                break;
            case 3:
                head = '评测帮助';
                content = '<p class="title_failure">失败原因</p><p class="failure_info">1.“网络堵塞”可能导致部署评测失败,但是网络堵塞并不会影响来了吗的其它功能。</p><p class="failure_info">2. 如果想得到准确的部署评测分数，您可以根据以下操作来进行调整：' +
                '</p><p class="perform_perform">操作</p><p class="perform_order">先在镜头前行走1-2次后，再点击<small class="url_review url_fa">部署评测</small></p><p class="perform_order"></p><p class="perform_perform">说明</p><p class="perform_order">操作过程中，你可以去<small class="url_time url_fa">时间轴</small>里观察行人照片出现的时间，参考下列标准检测你的网络堵塞状态</p><p class="perform_order">&lt;=10秒，网络正常；</p>'+
                '<p class="perform_order">=&gt30秒，网络拥挤；</p><p class="perform_order">=&gt;60秒，网络堵塞；</p>'
                btn = "确定";
                break;
            case 4:
                head = '设备状态';
                if (dev.online)
                    deviceImg = '/face_box_online.svg';
                else
                    deviceImg = '/face_box_offline.svg';
                if (dev.camera_run)
                    cameraImg = '/camera_online.svg';
                else
                    cameraImg = '/camera_offline.svg';
                content = '<div><div style="margin: 10px 20px;">脸脸盒：<img src="' + deviceImg
                + '" "'+ "width='30' height='20'" +'"></div><div style="margin: 10px 20px;">摄像头：<img src="' + cameraImg 
                + '" "'+ "width='26' height='22'" +'"></div><p style="margin: 10px 20px; color: red; text-align: center;">您的设备未接通，请检查设备连接后再次进行部署评测</p></div>';
                btn = "放弃";
                showClose = 'display: none;';
                break;

        }
        return {
            isShow:isShow,
            content:content,
            btn:btn,
            head:head,
            showFoot:showFoot,
            showClose:showClose
        }
    },
})
Template.groupInstallTest.events({
    'click .url_review':function(e){
        showPop.set(1); 
    },
    'click .url_time':function(){
        if (Session.get("myHotPostsChanged"))
            Session.set("myHotPostsChanged", false)
        showPop.set(0); 
        PUB.page('/timeline')
    },
    'click .check':function(e){
        showPop.set(3);
    },
    'click .back':function(e){
        e.preventDefault();
        e.stopPropagation();
        // var s = Session.get('isStarting');
        // if(s && s.isTesting){
        //     return PUB.toast('正在测试中，请勿离开');
        // }
        labelScore.set('---');
        roateScore.set('---');
        Meteor.clearTimeout(timer);
        timer = null;
        Session.set('isStarting',null);
        return PUB.back();
    },
    'click #operate':function(e){
        e.stopPropagation();
        var t = showPop.get();
        if (t == 4) {
            showPop.set(0);
            setTimeout(function() {
                labelScore.set('---');
                roateScore.set('---');
                Meteor.clearTimeout(timer);
                timer = null;
                Session.set('isStarting',null);
                return PUB.back();
            }, 50);
        }
        if(t == 1){
            var group_id = Router.current().params._id;
            Session.set('isStarting',{
                isTesting:true,
                group_id:group_id
            })
            //开始测试
            $('.progress-bar').addClass('time');
            var du = Meteor.users.findOne({username:uuid});
            deviceUserId = du._id;
            timer = Meteor.setTimeout(test_score,40*1000);
        }
        showPop.set(0);
    },

})
var test_score = function(){
    $('.progress').hide();
    $('.progress-bar').removeClass('time');
    var st = Session.get('isStarting');
    st.isTesting = false;
    st.showScore = true;
    
    var totalCount = message_queue.length;
    var labelArr = _.filter(message_queue,function(m){
        if(m.label &&  m.label != ''){
            return true;
        }
        return false;
    });
    var frontArr = _.filter(message_queue,function(m){
        if(m.style == "human_shape"){
            return m.style = "human_shape"
        }
        return m.style == 'front'
    });
    var front_len = frontArr.length;
   
    if(totalCount != 0){
        roateScore.set(Math.floor(front_len/totalCount * 100) + '');
        showRes.set(true);
    }else{
        roateScore.set('0');
        showPop.set(2);
        showRes.set(false);
    }
    if(front_len != 0){
        if(labelArr.length >= front_len){
            labelScore.set(100 + '');
        }else{
            labelScore.set(Math.floor(labelArr.length/front_len * 100) + '');
        }
        
    }else{
        labelScore.set('0');
    }
    message_queue = [];
    if(totalCount == 0 || front_len == 0){
        st.status = "fail";
    }else{
        st.status = "success";
    }
    Session.set('isStarting',st);
}
Template.popup.events({
    'click .close':function(){
        showPop.set(0);
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
        if(!s || s.isTesting){
            return true;
        }
        return false;
    },
    showRes:function(){
        var s = Session.get('isStarting');
        if(!s || s.isTesting || !showRes.get()){
            return true;
        }
        return false;
    },
    isSuccess:function(){
        var s = Session.get('isStarting');
        if(s.status == "success"){
            return true;
        }
        return false;
    },
    testres:function(tag){
        console.log(tag);
        if(tag == 1 && labelScore.get()>70){
            return true;
        }
        if(tag == 2 && roateScore.get()>70){
            return true;
        }
        return false;
    },
    showBtn:function(){
        var s = Session.get('isStarting');
        if(!s || s.isTesting){
            return false;
        }
        return true;
    },
    showCancel:function(){
        var s = Session.get('isStarting');
        if(s && s.isTesting){
            return true;
        }
        return false;
    }
})

Template.score.onRendered(function(){
})
Template.score.events({
    'click #cancel':function(){
        Meteor.clearTimeout(timer);
        var s = Session.get('isStarting');
        s.isTesting = false;
        Session.set('isStarting',s);
        message_queue = [];
        // $('.progress').hide();
        showRes.set(false);
        $('.progress-bar').removeClass('time');
    },
    'click #restart':function(e){
        labelScore.set('---');
        roateScore.set('---');
        showRes.set(false);
        message_queue = [];
        var st = Session.get('isStarting');
        st.isTesting = true;
        st.showScore = null;
        Session.set('isStarting',st);
        $('.progress').show();
        $('.progress-bar').addClass('time');
        timer = Meteor.setTimeout(test_score,40*1000);
    },
    'click #goTimeLine':function(){
        var group_id = Router.current().params._id;
        var deviceLists =  Devices.find({groupId: group_id}).fetch();
        var st = Session.get('isStarting');
        st.label_score = labelScore.get();
        st.roate_score = roateScore.get();
        Session.set('isStarting',st);
        var uuid = Router.current().params.uuid;
        return PUB.page('/timelineAlbum/'+uuid+'?from=groupchat');
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
    //users表 username(uuid) ==> message.form.id(users表的_id)  
    var uuid = Router.current().params.uuid;
    message = JSON.parse(message);
    console.log('GroupInstallTest');
    if(message.event_type == "motion"){
        return;
    }
    if(message.form.id != deviceUserId){
        console.log('rmMsg',message.form.name,deviceUserId);
        return;
    }

    if(message.images && message.images.length>0){
        message_queue.push.apply(message_queue,message.images);
    } 
    console.log('GroupInstallTest',message_queue.length); 
}