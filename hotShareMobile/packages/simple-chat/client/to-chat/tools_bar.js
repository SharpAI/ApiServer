var currentToolsBar;

Template.toolsBarMenus.helpers({
  menus: [{
    key: 'collect',
    name: '收藏'
  }, {
    key: 'multipleChoice',
    name: '多选'
  }]
});

Template.toolsBarDown.helpers({
  isShow: false,
  left: 0,
  top: 0
});


var handleEvents = function() {
  Template.toolsBarMenus.events({
    'click #collect': function(event) {
      currentToolsBar.collect();
    }
  });
};

var toolsBarBase = {
  toolsBar: null,
  selectedItems: [],
  addItem: function(item) {
    this.selectedItems.push(item);
  },
  removeItem: function(item) {
    for (var i = 0, len = selectedItems.length; i < len; i++) {
      if (selectedItems[i] === item) {
        selectedItems.splice(i, 1);
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
    var srcOffsetTop = $(srcElement).offset().top;
    var toolsBarHeight = this.toolsBar.height();
    var targetTop = srcOffsetTop - toolsBarHeight;
    return targetTop;
  },
  collect: function() {
    this.selectedItems.forEach(function(item) {
      var updateItem = {
        isCollect: true,
        collectDate: new Date()
      };
      Messages.update({_id: item._id}, {$set: updateItem});
    });
    var queryCondition = {
      $or: [
        {'form.id': Meteor.userId()},
        {'to.id': Meteor.userId()}
      ],
      isCollect: true
    };
    var collectList = Messages.find(queryCondition).fetch();
    console.log(collectList);
    $('.tools-bar-wrap').hide();
  },
  hide: function() {
    this.toolsBar.hide();
  }
};

var msgDownToolsBar = $.extend({},toolsBarBase, {
  show: function(srcElement) {
    this.toolsBar = $('.tools-bar-wrap-down');
    this.toolsBar.css({
      left: this.getTargetLeft(srcElement),
      top: this.getTargetTop(srcElement)
    });
    this.toolsBar.show();
  }
});

var msgUpToolsBar = $.extend({},toolsBarBase, {
  show: function(srcElement) {
    this.toolsBar = $('.tools-bar-wrap-up');
    this.toolsBar.css({
      left: this.getTargetLeft(srcElement),
      top: this.getTargetTop(srcElement)
    });
    this.toolsBar.show();
  },
  getTargetTop: function(srcElement) {
    var srcOffsetTop = $(srcElement).offset().top;
    var toolsBarHeight = this.toolsBar.height();
    var targetTop = srcOffsetTop + toolsBarHeight;
    return targetTop;
  }
});

toolsBarFactory = {
  createToolsBar: function(srcElement) {
    var srcOffsetTop = $(srcElement).offset().top;
    var srcollTop = document.documentElement.scrollTop;
    var toolsBarHeight = $('.tools-bar-wrap').height();
    var headerHeight = $('.header').height();
    console.log(srcollTop);
    if (srcollTop + toolsBarHeight + headerHeight < srcOffsetTop) {
      return currentToolsBar = msgDownToolsBar;
    } else {
      return currentToolsBar = msgUpToolsBar;
    }
  }
};

handleEvents();


