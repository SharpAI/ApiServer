/**
 * Created by Doris on 4/08/16.
 */

var CustomDialog, exec;

exec = require('cordova/exec');

CustomDialog = (function() {
  
  function CustomDialog() {}

  CustomDialog.show = function(content,successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'CustomDialog', 'show', [content]);
    return CustomDialog;
  };

  CustomDialog.hidden = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'CustomDialog', 'hidden', []);
    return CustomDialog;
  };

  CustomDialog.init = function() {
    return this;
  };

  return CustomDialog;

})();

CustomDialog.init();

module.exports = CustomDialog;




               

