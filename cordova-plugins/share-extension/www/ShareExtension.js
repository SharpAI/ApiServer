/**
 * Created by Doris on 12/22/15.
 */
function ShareExtension() {
}

ShareExtension.prototype.getShareData = function (successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "ShareExtension", "getShareData",[]);
};

ShareExtension.prototype.emptyData = function (successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "ShareExtension", "emptyData",[]);
};

ShareExtension.prototype.closeView = function (error,successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "ShareExtension", "closeView",[error]);
};

ShareExtension.install = function () {
    if (!window.plugins) {
        window.plugins = {};
    }

    window.plugins.shareExtension = new ShareExtension();

    return window.plugins.shareExtension;
};

cordova.addConstructor(ShareExtension.install);


               

