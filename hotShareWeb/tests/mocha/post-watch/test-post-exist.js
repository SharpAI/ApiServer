// @fubo,帖子是否正常访问监控, web端
describe('测试贴子是否能够访问 @watch', function () {
    var i = 0;
    var watchPost = '7iFh5KQJFcq9FH4PE';
    var Realserver = 'http://cdn.tiegushi.com';
    var testServer = "http://cdcdn.tiegushi.com";
    var sendMailTo = ["sraita@139.com", "guifubo@msn.cn", "xfang@actiontec.com"];
     before(function () {
        browser.windowHandleSize({ width: 800, height: 600 });
        browser.url('http://www.baidu.com');
        browser.pause(1000);
    });
    beforeEach(function (done) {
        browser.url('http://www.baidu.com');
        browser.pause(6000);
        console.log('开始检测');
        setTimeout(done, 2000);
    });
    afterEach(function (done) {
      // 设置检测间隔时长
        browser.pause(3000);
        setTimeout(done, 2000);
    });
    

    it('检测帖子正式版帖子是否正常打开', function (done) {
        var url = Realserver + '/posts/' + watchPost;
        browser.url(url);
        var startTime = new Date();
        var waitTime = 0;
        var log = {
            url: url,
            startTime: startTime,
            serverStatus: browser.status().state
        }
        browser.pause(2000);
        try {
            expect(browser.isExisting('.element')).to.be.ok;
            expect(browser.isVisible('.element')).to.be.ok;
            var endTime = new Date();
            waitTime = endTime.getTime() - startTime.getTime();
            log.waitTime = waitTime;
            // server.apply('insertTestLog',log);
            done();
        } catch (e) {

            var endTime = new Date();
            waitTime = endTime.getTime() - startTime.getTime();
            log.waitTime = waitTime;
            var text = '故事贴正式服务器帖子打开异常：\n帖子' + url;
            if (browser.isVisible('.unpublishWebPage')) {
                text += '出现帖子被删除提示';
            } else {
                text += '操作等待时长' + waitTime + 'ms,  ';
            }

            text += '时间为：' + startTime+ '， 服务器状态：'+log.serverStatus;
            console.log(log);
            server.apply('sendErrorReport', [sendMailTo, 'sraita@139.com', '故事贴帖子打开异常', text]);

            done(e);
        }
    });


    it('检测帖子测试版帖子是否正常打开', function (done) {
        var url = testServer + '/posts/' + watchPost;
        browser.url(url);
        var startTime = new Date();
        var waitTime = 0;
        browser.pause(2000);
        var log = {
            url: url,
            startTime: startTime,
            serverStatus: browser.status().state
        }
        try {
            expect(browser.isExisting('.element')).to.be.ok;
            expect(browser.isVisible('.element')).to.be.ok;
            var endTime = new Date();
            waitTime = endTime.getTime() - startTime.getTime();
            log.waitTime = waitTime;
            // server.apply('insertTestLog',log);
            done();
        } catch (e) {
            var endTime = new Date();
            waitTime = endTime.getTime() - startTime.getTime();
            log.waitTime = waitTime;
            var text = '故事贴正式服务器帖子打开异常：\n帖子' + url;
            if (browser.isVisible('.unpublishWebPage')) {
                text += '出现帖子被删除提示';
            } else {
                text += '操作等待时长' + waitTime + 'ms,  ';
            }

            text += '时间为：' + startTime+'， 服务器状态：'+log.serverStatus;
            console.log(log);
            server.apply('sendErrorReport', [sendMailTo, 'fgui@actiontec.com', '故事贴帖子打开异常', text]);

            done(e);
        }
    });
});


