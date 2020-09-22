//0：刚进入 1：处理中 2:成功 3：失败
var progress = new ReactiveVar(0);
//0:刚进入显示开始 1:点击开始后显示结束按钮
var btn_pro = new ReactiveVar(0);
var timeRange = {};
Template.chooseLabelType.events({
    'click #goAutolabel':function(e){
        var uuid = Router.current().params.uuid;
        return PUB.page('/autolabel/'+uuid);
    },
    'click #goLabelstranger':function(e){
        var uuid = Router.current().params.uuid;
        return PUB.page('/timelineAlbum/' + uuid + '?from=groupchat');
        // return PUB.page('/ishavestranger/');
    },
    'click .back':function(e){
        btn_pro.set(0);
        return PUB.back();
    }
})
Template.autolabel.helpers({
    isShow:function(tag){
        
        if(progress.get() == tag){
            return true;
        }
        return false;
    },
    btnShow:function(tag){
        if(btn_pro.get() == tag){
            return true;
        }
        return false;
    }
})
Template.autolabel.events({
    'click .back':function(e){
        progress.set(0);
        return PUB.back();
    },
    'click #start':function(e,t){
        //person_name
        var person_name = t.find('.input-box').value;
        console.log(person_name);
        if(!person_name){
            return PUB.toast('请输入标注人名称');
        }
        btn_pro.set(1);
        //记录时间
        var now = new Date();
        var hour = new Date(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),0,0);
        var min = now.getMinutes();
        timeRange = {
            start:{
                hour:hour,
                min:min
            }
        };
        
        timeRange.person_name = person_name;
    },
    'click #end':function(e){
        btn_pro.set(0);
        //记录结束时间
        var now = new Date();
        var hour = new Date(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),0,0);
        var min = now.getMinutes();
        timeRange.end = {
            hour:hour,
            min:min
        }
        //进入处理状态
        progress.set(1);
        Meteor.call('autolabel',timeRange,Router.current().params.uuid,function(err,res){
            if(err || (res && res.code==1)){
                console.log(err,res);
                progress.set(3);
            }else{
                progress.set(2);
            }
        })
    }
})