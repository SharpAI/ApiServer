Template.homePage.onRendered(function () {
  var now = new Date();
  var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var date = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),
    0, 0, 0, 0);

  Session.set('theCurrentDay', date); //UTC日期
  Session.set('theDisplayDay', displayDate); //当前显示的日期
  Session.set('today', displayDate); //今天
  Meteor.subscribe('userGroups');
  Meteor.subscribe('WorkStatus', date, {
    onReady: function () {
      Session.set('WorkStatusLoading', false);
    }
  });
});

Template.homePage.helpers({
  companys: function () {
    var lists = [];
    SimpleChat.GroupUsers.find({ user_id: Meteor.userId() }, { sort: { create_time: -1 } }).forEach(function (item) {
      var group = SimpleChat.Groups.findOne({ _id: item.group_id });
      if (group) {
        lists.push(group);
      }
    });
    return lists;
  },
  onlyOneCompany: function () {
    var lists = Template.homePage.__helpers.get('companys')();
    if (lists.length == 1) {
      return 'width: 100%;';
    }
    return '';
  },
  getGroupInOutTime: function () {
    var group_intime = '09:00';
    var group_outtime = '18:00';
    group = SimpleChat.Groups.findOne({ _id: Session.get('groupsId') })
    if (this.group_intime) {
      group_intime = this.group_intime;
    }
    if (this.group_outtime) {
      group_outtime = this.group_outtime;
    }
    return group_intime + ' - ' + group_outtime;
  },
  getInCount: function () {
    var group_id = this._id;
    return WorkStatus.find({ group_id: this._id, date: Session.get('theCurrentDay'), status: { $in: ['in', 'out'] } }).count();
  }
});

Template.homePage.events({
  'click .viewWorkStatus': function (e) {
    Session.set('deviceDashboardTitle', this.name);
    return PUB.page('/device/dashboard/' + this._id);
  },
  'click .goGroupPerson': function (e) {
    return PUB.page('/groupPerson/' + this._id);
  },
  'click .goGroupProfile': function (e) {
    return PUB.page('/groupsProfile/group/' + e.currentTarget.id);
  },
  'click .goPersonHistory': function (e) {
    Session.set('workstatus_group', this);
    return workStatusPopPage.show();
  },
  'click .goStranger': function (e) {
    var group_id = this._id;
    console.log('group id is: ', group_id);
    //根据group_id得到group下的设备列表
    Meteor.call('getDeviceListByGroupId', group_id, function (err, deviceLists) {
      if(err){
        console.log('getDeviceListByGroupId:',err);
        return;
      }
      console.log("device lists is: ", JSON.stringify(deviceLists));
      if (deviceLists && deviceLists.length > 0) {
        if (deviceLists.length == 1 && deviceLists[0].uuid) {
          console.log("enter this device timeline")
          return PUB.page('/timelineAlbum/' + deviceLists[0].uuid + '?from=groupchat');
        } else {
          console.log("select a device")
          Session.set('_groupChatDeviceLists', deviceLists);
          //workStatusPopPage.close();
          $('._checkGroupDevice').fadeIn();
          //workStatusPopPage.hide();
          $('.homePage').css('z-index', 0)
          return;
        }
      }
      return PUB.toast('该群组下暂无设备');
    })

  },
  'click #joinTestChatGroups': function (event) {
    event.stopImmediatePropagation();
    return PUB.page('/introductoryPage2');
  },
  'click #createNewChatGroups': function (event) {
    event.stopImmediatePropagation()
    // Session.set('fromCreateNewGroups', true);
    // return Router.go('/setGroupname');
    Router.go('/notice');
  },
  'click #scanbarcode': function (event) {
    event.stopImmediatePropagation();
    return ScanBarcodeByBarcodeScanner();
  },
  'click #scanimage': function (event) {
    event.stopImmediatePropagation();
    return DecodeImageFromAlum();
  },
  // 周报 / 月报 查看
  'click .goGroupReporter': function (event) {
    event.stopImmediatePropagation();
    return PUB.page('/comReporter/' + this._id);
  }
})
Template.notice.onCreated(function(){
  this.imgArr = ["/createGroup1.png","/createGroup2.png","/createGroup3.png"];
  this.index = new ReactiveVar(0);
})
Template.notice.helpers({
  src:function(){
    var t = Template.instance();
    return t.imgArr[t.index.get()];
  }
})
Template.notice.events({
  'click #notice_img':function(e,t){
    if(t.index.get()<t.imgArr.length-1){
      t.index.set(t.index.get()+1);
    }else{
      Session.set('fromCreateNewGroups', true);
      return Router.go('/setGroupname');
    }
    
  }
})
