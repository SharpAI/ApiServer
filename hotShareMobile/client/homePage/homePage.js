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

  homePageMethods.createMoveAnimate(this);
});

var homePageMethods = {
  initGroupListIndex: function() {
    var noSortList = SimpleChat.GroupUsers.find({ user_id: Meteor.userId(), index: {$exists: false} }, { sort: { create_time: -1 } }).fetch();
    var sortList = SimpleChat.GroupUsers.find({ user_id: Meteor.userId(), index: {$exists: true} }, { sort: { index: 1 } }).fetch();
    if (noSortList.length === 0) {
      return;
    }
    noSortList.concat(sortList).forEach(function (item, index) {
      SimpleChat.GroupUsers.update({ _id: item._id}, { $set: { index: index } });
    });
  },
  moveGroupItem: function(currentIndex, targetIndex) {
    var targetId = SimpleChat.GroupUsers.findOne({ user_id: Meteor.userId(), index : targetIndex })._id;
    var currentItemId = SimpleChat.GroupUsers.findOne({ user_id: Meteor.userId(), index : currentIndex })._id;
    SimpleChat.GroupUsers.update({ _id: targetId }, { $set: { index: currentIndex } });
    SimpleChat.GroupUsers.update({ _id: currentItemId }, { $set: { index: targetIndex } });
  },
  createMoveAnimate: function(context) {
    context.find('.content')._uihooks = {
      moveElement: function (node, next) {
        var $node = $(node),
            $next = $(next),
            height = $node.outerHeight(),
            oldTop = $node.offset().top,
            newTop = 0,
            $inBetween = $next.nextUntil($node);

        if ($inBetween.length === 0) {
          $inBetween = $node.nextUntil($next);
        }
        $node.insertBefore($next);
        newTop = $node.offset().top;
        $node.removeClass('animate')
        .css('top', oldTop - newTop);
        $inBetween.removeClass('animate')
        .css('top', oldTop - newTop > 0 ? -height : height);
        $node.offset();
        $node.add($inBetween).addClass('animate')
        .css('top', 0);
      }
    };
  }
};

Template.homePage.onCreated(function() {
  homePageMethods.initGroupListIndex();
});

Template.homePage.helpers({
  companys: function () {
    var lists = [];
    var sortList = SimpleChat.GroupUsers.find({ user_id: Meteor.userId() }, { sort: { index: 1 } }).fetch();
    sortList.forEach(function (item) {
      var group = SimpleChat.Groups.findOne({ _id: item.group_id });
      if (group) {
        group.index = item.index;
        lists.push(group);
      }
    });
    return lists;
  },
  noCompany:function(){
    var lists = Template.homePage.__helpers.get('companys')();
    if (lists.length == 0) {
      return 'background-image:url(nogroup_bg.png);background-repeat:no-repeat;background-size:cover';
    }
    return '';
  },
  hide_content:function(){
    var lists = Template.homePage.__helpers.get('companys')();
    if (lists.length == 0) {
      return 'display:none';
    }
    return '';
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

    // var counts = WorkStatus.find({ group_id: this._id, date: Session.get('theCurrentDay'), status: { $in: ['in', 'out'] } }).count();
    var counts = _.uniq(_.map(WorkStatus.find({group_id: this._id, date: Session.get('theCurrentDay')}).fetch(), function(ws){return ws.person_name})).length;
    return counts
  },
  isShowDownArrow: function(index) {
    return index < SimpleChat.GroupUsers.find({ user_id: Meteor.userId() }).count() - 1;
  }
});

Template.homePage.events({
  'shown.bs.dropdown .dropdown': function(e) {
    if (!localStorage.getItem('createCompanyFlag')) {
      maskDescription.set({
        maskEllipse: false,
        x: '100%',
        y: '0%',
        width: '140',
        height: '40',
        trsx: -160,
        trsy: 50,
        scantipContainerStyle: "position: absolute; top: 50px; width: 100%; height: 150px;",
        iconClass: 'fa fa-3x fa-hand-o-up',
        iconStyle: 'display: block; position: absolute; top: 50px; right: 80px;',
        spanStyle: 'display: block; font-size: 18px; position: absolute; top: 5px; right: 180px;',
        spanContent: '点击此处创建监控组'
      });
      currentTip = 'createCompanyMenu';
      showScanTipHint.set(true);
    }
  },
  'hidden.bs.dropdown .dropdown': function(e) {
  },
  'click .viewWorkStatus': function (e) {
    Session.set('deviceDashboardTitle', this.name);
    return PUB.page('/device/dashboard/' + this._id);
  },
  'click .goInstallTest':function(e){
    var group_id = this._id;
    //根据group_id得到group下的设备列表
    Meteor.call('getDeviceListByGroupId', group_id, function (err, deviceLists) {
      if(err){
        console.log('getDeviceListByGroupId:',err);
        return;
      }
      console.log("device lists is: ", JSON.stringify(deviceLists));
      if (deviceLists && deviceLists.length > 0) {
        if (deviceLists.length == 1 && deviceLists[0].uuid) {
          console.log("enter this device install test");
          return PUB.page('/groupInstallTest/'+group_id+'/' + deviceLists[0].uuid);
        } else {
          Session.set('_groupChatDeviceLists', deviceLists);
          Session.set('toPath','/groupInstallTest/'+group_id);
          $('._checkGroupDevice').fadeIn();
          return;
        }
      }
      return PUB.toast('该监控组下暂无脸脸盒');
    });
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
      Session.set("timelinehref",true)
      console.log("device lists is: ", JSON.stringify(deviceLists));
      if (deviceLists && deviceLists.length > 0) {
        if (deviceLists.length == 1 && deviceLists[0].uuid) {
          console.log("enter this device timeline")
          // return PUB.page('/timelineAlbum/' + deviceLists[0].uuid + '?from=groupchat');
          // return PUB.page('/chooseLabelType/' + deviceLists[0].uuid);
          var uuid = deviceLists[0].uuid;
          return PUB.page('/timelineAlbum/' + uuid + '?from=groupchat');
        } else {
          console.log("select a device")
          Session.set('_groupChatDeviceLists', deviceLists);
          // Session.set('toPath','/timelineAlbum');
          //workStatusPopPage.close();
          $('._checkGroupDevice').fadeIn();
          //workStatusPopPage.hide();
          $('.homePage').css('z-index', 0)
          return;
        }
      }
      return PUB.toast('该监控组下暂无脸脸盒');
    })

  },
  'click #joinTestChatGroups': function (event) {
    event.stopImmediatePropagation();
    return PUB.page('/introductoryPage2');
  },
  'click #createNewChatGroups': function (event) {
    //跳转到这个页面取消
    event.stopImmediatePropagation()
    Session.set('fromCreateNewGroups', true);
    Session.set('notice-from','createNewChatGroups');
    // return Router.go('/setGroupname');
    //PUB.page('/notice');
    return Router.go('/setGroupname');
  },
  'click #qrcodeadddevice': function (event) {
    //event.stopImmediatePropagation();
    return QRCodeAddDevice();
  },
  'click #scanbarcode': function (event) {
    event.stopImmediatePropagation();
    return ScanBarcodeByBarcodeScanner();
  },
  'click #scanimage': function (event) {
    event.stopImmediatePropagation();
    return DecodeImageFromAlum();
  },
  'click #scanadddevice': function (event) {
    event.stopImmediatePropagation();
    return Router.go('/scannerAddDevice');
  },
  // 周报 / 月报 查看
  'click .goGroupReporter': function (event) {
    event.stopImmediatePropagation();
    return PUB.page('/comReporter/' + this._id);
  },
  'click .sort-arrow-up .fa': function(event) {
    event.stopImmediatePropagation();
    homePageMethods.moveGroupItem.call(this, this.index, this.index - 1);
  },
  'click .sort-arrow-down .fa': function(event) {
    event.stopImmediatePropagation();
    homePageMethods.moveGroupItem.call(this, this.index, this.index + 1);
  }
})
Template.notice.onCreated(function(){
  this.curSrc = new ReactiveVar('');
  var type = Session.get('notice-from');
    if(type == 'timelineAlbum'){
      this.curSrc.set('/moshengren.png');
    }else if(type == 'deviceDashboard'){
      this.curSrc.set('/hint.jpg');
    }
    // else if(type == 'createNewChatGroups'){
    //   this.curSrc.set('/createGroup3.png');
    // }
})
Template.notice.helpers({
  src:function(){
    var t = Template.instance();

    return t.curSrc.get();
  }
})
Template.notice.events({
  'click #notice_img':function(e,t){
    e.stopImmediatePropagation();
    e.preventDefault();
    var t = Template.instance();
    var type = Session.get('notice-from');
    if(type == 'timelineAlbum'){
      return;
    }else if(type == 'deviceDashboard'){
      // if(t.curSrc.get()=='/hint.jpg'){
      //   //t.curSrc.set('/createGroup2.jpg');
      // }else{
      //   Session.set('showHint',false);
      // }
      Session.set('showHint',false);
    }else if(type == 'createNewChatGroups'){
      return Router.go('/setGroupname');
    }
  },
  'click #back':function(e,t){
    e.stopImmediatePropagation();
    e.preventDefault();
    var type = Session.get('notice-from');
    if(type == 'timelineAlbum'){
      Session.set('showHint',false);
      return;
    }
    if(type == 'deviceDashboard'){
      if(t.curSrc.get()=='/createGroup2.jpg'){
        t.curSrc.set('/hint.jpg');
      }else{
        Session.set('showHint',false);
      }
    }
    if(type == 'createNewChatGroups'){
      // Router.go('/');
      PUB.back();
    }
  }
})
