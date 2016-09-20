/**
 * Created by simba on 10/8/15.
 */
function AppSetup() {
}

AppSetup.prototype.getVersion = function (successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "AppSetup", "getVersion");
};

AppSetup.install = function () {
    if (!window.plugins) {
        window.plugins = {};
    }

    window.plugins.appsetup = new AppSetup();

    return window.plugins.appsetup;
};

cordova.addConstructor(AppSetup.install);