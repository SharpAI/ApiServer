this.PUB = {
  'pagepop': function() {
    var history, page;
    history = Session.get("history_view");
    if (!(history === void 0 || history === "")) {
      if (history.length > 0) {
        page = history.pop();
        return Session.set("history_view", history);
      }
    }
  },
  'toast': function(msg) {
    var error;
    try {
      return window.plugins.toast.showLongBottom(msg);
    } catch (_error) {
      error = _error;
      return toastr.warning(msg);
    }
  },
  "alert": function(msg, callback) {
    var error;
    try {
      return navigator.notification.alert(msg, callback, '提示', '确定');
    } catch (_error) {
      error = _error;
      if (confirm(msg)) {
        return callback;
      }
    }
  },
  "confirm": function(msg, callback) {
    var error;
    try {
      return navigator.notification.confirm(msg, function(index) {
        if (index === 2) {
          return callback();
        }
      }, '提示', ['取消', '确定']);
    } catch (_error) {
      error = _error;
      if (confirm(msg)) {
        return callback();
      }
    }
  },
  "actionSheet": function(menuArray, title, callback) {
    var options;
    if (Meteor.isCordova) {
      if (title) {
        options = {
          'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
          'title': title,
          'buttonLabels': menuArray,
          'androidEnableCancelButton': true,
          'winphoneEnableCancelButton': true,
          'addCancelButtonWithLabel': '取消',
          'position': [20, 40]
        };
      } else {
        options = {
          'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
          'buttonLabels': menuArray,
          'androidEnableCancelButton': true,
          'winphoneEnableCancelButton': true,
          'addCancelButtonWithLabel': '取消',
          'position': [20, 40]
        };
      }
      return window.plugins.actionsheet.show(options, callback);
    }
  }
};