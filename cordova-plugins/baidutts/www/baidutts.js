exports.speak = function (options, onfulfilled, onrejected) {
    var ThenFail = window.ThenFail;
    var promise;

    if (ThenFail && !onfulfilled && !onrejected) {
        promise = new ThenFail();
    }
    cordova
        .exec(function () {
            if (promise) {
                promise.resolve();
            } else if (onfulfilled) {
                onfulfilled();
            }
        }, function (reason) {
            if (promise) {
                promise.reject(reason);
            } else if (onrejected) {
                onrejected(reason);
            }
        }, 'BaiduTTS', 'speak', [options]);

    return promise;
};

exports.stop = function () {
    var ThenFail = window.ThenFail;
    var promise;

    if (ThenFail) {
        promise = new ThenFail();
    }
    cordova
        .exec(function () {
            if (promise) {
                promise.resolve();
            }
        }, function (reason) {
        }, 'BaiduTTS', 'stop');

    return promise;
};