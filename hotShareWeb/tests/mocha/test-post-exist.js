// @fubo,帖子是否正常访问监控

// 发送邮件提醒
// var sendErrorReport = function (args) {
//     console.log('发送错误报告给：' + args[0]);
//     Meteor.call('sendErrorReport', args[0], args[0], args[0], args[0]);
// }


describe('测试贴子是否能够访问 @watch', function () {
    before(function () {
        browser.windowHandleSize({ width: 800, height: 600 });
        browser.url('http://cdcdn.tiegushi.com/posts/YFQofExszB4wD8QfR');
        browser.pause(6000);
    });
    beforeEach(function (done) {
        browser.url('http://cdcdn.tiegushi.com/posts/YFQofExszB4wD8QfR');
        browser.pause(6000);
        console.log('开始检测');
        setTimeout(done, 3000);
    });
    afterEach(function () {
        // 设置检测间隔时长
        var timeOut = 60 * 1000;
        browser.timeouts('script', timeOut);
    });

    setInterval(function () {
        describe('帖子是否正常打开 @watch', function () {
            it('正常打开', function (done) {
                browser.url('http://cdcdn.tiegushi.com/posts/YFQofExszB4wD8QfR');
                browser.pause(6000);
                try {
                    console.log('帖子能够打开');
                    expect(browser.isExisting('.element')).not.to.be.ok;
                    done();
                } catch (e) {
                    var text = '故事贴帖子打开异常：\n测试消息为：\n';
                    text += e;
                    // server.apply('sendErrorReport', ['fgui@actiontec.com', 'sraita@139.com', '故事贴帖子打开异常', text]);
                    console.log(text);
                    done(e);
                }
            });
        })
    }, 100*60);


    it('帖子是否正常打开', function (done) {
        try {
            console.log('帖子能够打开');
            expect(browser.isExisting('.element')).not.to.be.ok;
            done();
        } catch (e) {
            var text = '故事贴帖子打开异常：\n测试消息为：\n';
            text += e;
            server.apply('sendErrorReport', ['sraita@139.com', 'sraita@139.com', '故事贴帖子打开异常', text]);
            console.log(text);
            done(e);
        }
    });


});


