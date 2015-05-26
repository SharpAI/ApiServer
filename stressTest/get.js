var page = require('webpage').create(),
    system = require('system'),
    address;

address = system.args[1];

page.onResourceRequested = function (requestData, request) {
    if ((/ga.js/gi).test(requestData['url'])) {
        console.log('Skiping: ' + requestData['url']);
        request.abort();
    }
};

page.open(address, function (status) {
    if (status !== 'success') {
        console.log('Unable to access network');
    } else {
        var p = page.evaluate(function () {
            return document.getElementsByTagName('html')[0].innerHTML
        });
        console.log(p);
    }
    phantom.exit();
});
