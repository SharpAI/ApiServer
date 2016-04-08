/**
 * Created by Doris on 12/22/15.
 */
function UserInfo() {
}

UserInfo.prototype.setUserInfo = function (userId,successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "UserInfo", "setUserInfo",[userId]);
};

UserInfo.prototype.getUserInfo = function (successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "UserInfo", "getUserInfo",[]);
};


UserInfo.install = function () {
    if (!window.plugins) {
        window.plugins = {};
    }

    window.plugins.userinfo = new UserInfo();

    return window.plugins.userinfo;
};

cordova.addConstructor(UserInfo.install);


               

