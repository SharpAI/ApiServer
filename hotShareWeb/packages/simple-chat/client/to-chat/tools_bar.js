
isMultipleChoice = new ReactiveVar(false);
var currentToolsBar;
var choiceMenu = new ReactiveVar({
  key: 'multipleChoice',
  name: '多选'
});

Template.toolsBarMenus.helpers({
  menus: function() {
    return [{
      key: 'collect',
      name: '收藏'
    }, choiceMenu.get()]
  }
});

Template.toolsBarDown.helpers({
  isShow: false,
  left: 0,
  top: 0
});


var handleEvents = function() {
  Template.toolsBarMenus.events({
    'click #collect': function(event) {
      if (currentToolsBar.selectedItems.length === 0) {
        PUB.toast('请选择要收藏的消息');
        return;
      }
      currentToolsBar.collect();
      currentToolsBar.hide();
      isMultipleChoice.set(false);
      PUB.toast('已收藏');
    },
    'click #multipleChoice, click #cancelChoice': function(event) {
      if (this.key === 'cancelChoice' && isMultipleChoice.get()) {
        currentToolsBar.hide();
      }
      currentToolsBar.toggleChoiceState();
      if (isMultipleChoice.get()) {
        choiceMenu.set({
          key: 'cancelChoice',
          name: '取消'
        });
      }
    }
  });
};

var toolsBarBase = {
  toolsBar: null,
  selectedItems: [],
  init: function(srcElement) {
    this.selectedItems.length = 0;
    isMultipleChoice.set(false);
    choiceMenu.set({
      key: 'multipleChoice',
      name: '多选'
    });
    this.show(srcElement);
  },
  show: function() {},
  setPositionAndDisplay: function(srcElement) {
    this.toolsBar.css({
      left: this.getTargetLeft(srcElement),
      top: this.getTargetTop(srcElement)
    });
    this.toolsBar.show();
  },
  addItem: function(item) {
    this.selectedItems.push(item);
  },
  removeItem: function(item) {
    for (var i = 0, len = this.selectedItems.length; i < len; i++) {
      if (this.selectedItems[i]._id === item._id) {
        this.selectedItems.splice(i, 1);
        break;
      }
    }
  },
  getTargetLeft: function(srcElement) {
    var srcOffsetLeft = $(srcElement).offset().left;
    var srcWidth = $(srcElement).width();
    var toolsBarWidth = this.toolsBar.width();
    var targetLeft = srcOffsetLeft + ((srcWidth - toolsBarWidth) / 2);
    if (targetLeft < 0) {
      targetLeft = 0;
    }
    return targetLeft;
  },
  getTargetTop: function(srcElement) {
    var srcOffsetTop = $(srcElement).parents('li:first')[0].offsetTop + 20;
    var toolsBarHeight = this.toolsBar.height();
    var targetTop = srcOffsetTop - toolsBarHeight;
    return targetTop;
  },
  collect: function() {
    this.selectedItems.forEach(function(item) {
      if (CollectMessages.findOne({_id: item._id})) {
        CollectMessages.update({_id: item._id}, {$set: {collectDate: new Date()}});
        return;
      }
      item.collectDate = new Date();
      CollectMessages.insert(item);
    });
  },
  hide: function() {
    this.toolsBar.hide();
    this.resetSelectedItems();
  },
  toggleChoiceState: function() {
    isMultipleChoice.set(!isMultipleChoice.get());
  },
  resetSelectedItems: function() {
    this.selectedItems.forEach(function(item) {
      item.checked = false;
    });
  }
};

var msgDownToolsBar = $.extend({},toolsBarBase, {
  show: function(srcElement) {
    this.toolsBar = $('.tools-bar-wrap-down');
    this.setPositionAndDisplay(srcElement);
  }
});

var msgUpToolsBar = $.extend({},toolsBarBase, {
  show: function(srcElement) {
    this.toolsBar = $('.tools-bar-wrap-up');
    this.setPositionAndDisplay(srcElement);
  },
  getTargetTop: function(srcElement) {
    var srcOffsetTop = $(srcElement).offset().top;
    var toolsBarHeight = this.toolsBar.height();
    var srcollTop = document.documentElement.scrollTop;
    var headerHeight = $('.header').height();
    // var targetTop = srcOffsetTop + toolsBarHeight;
    var targetTop = srcollTop + headerHeight + toolsBarHeight;
    return targetTop;
  }
});

toolsBarFactory = {
  createToolsBar: function(srcElement) {
    var srcOffsetTop = $(srcElement).offset().top;
    var srcollTop = document.documentElement.scrollTop;
    var toolsBarHeight = $('.tools-bar-wrap').height();
    var headerHeight = $('.header').height();
    if (srcollTop + toolsBarHeight + headerHeight < srcOffsetTop) {
      return currentToolsBar = msgDownToolsBar;
    } else {
      return currentToolsBar = msgUpToolsBar;
    }
  }
};

handleEvents();


