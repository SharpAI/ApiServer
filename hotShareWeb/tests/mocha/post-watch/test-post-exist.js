// @fubo,帖子是否正常访问监控


describe('测试贴子是否能够访问 @watch', function () {
    var i = 0;
    var watchServer = '';
    var server1 = 'http://cdn.tiegushi.com';
    var server2 = "http://cdcdn.tiegushi.com";
    var sendMailTo = ["sraita@139.com","guifubo@msn.cn","xfang@actiontec.com"];
    // this.timeout(60000);
    before(function () {
        browser.windowHandleSize({ width: 800, height: 600 });
        browser.url('http://cdcdn.tiegushi.com/posts/7iFh5KQJFcq9FH4PE');
        browser.pause(6000);
    });
    beforeEach(function (done) {
        browser.url('http://cdcdn.tiegushi.com/posts/7iFh5KQJFcq9FH4PE');
        browser.pause(6000);
        console.log('开始检测');
        // this.timeout(60000); // A very long environment setup.
        setTimeout(done, 30000);
    });
    afterEach(function () {
      // 设置检测间隔时长
        browser.pause(600000);
        setTimeout(done, 20000);
    });
    
    setInterval(function () {
        console.log(i%2);
        if(i%2){
            watchServer = server1;
        } else {
            watchServer = server2;
        }
        describe('帖子是否正常打开 @watch', function () {
            it('帖子是否正常打开', function (done) {
                browser.url(watchServer+'/posts/7iFh5KQJFcq9FH4PE');
                var startTime = new Date();
                browser.pause(2000);             
                
                try {
                    console.log(startTime);
                
                    expect(browser.isExisting('.element')).to.be.ok;
                    expect(browser.isVisible('.element')).to.be.ok;
                    done();
                } catch (e) {
                    
                    var endTime = new Date();
                    var text = '故事贴帖子打开异常：\n帖子'+watchServer;
                    if(browser.isVisible('.unpublishWebPage')){
                        text += '出现帖子被删除，';
                    } else {
                        text += '操作等待时长' + (endTime.getTime()-startTime.getTime())+ 'ms,  ';
                    }
                    
                    text += '时间为：'+ startTime;
                    console.log(text);
                    server.apply('sendErrorReport', [sendMailTo, 'sraita@139.com', '故事贴帖子打开异常', text]);
                    
                    done(e);
                }
                i++;
            });
        })
    }, 5000);


    it('第一次检测帖子是否正常打开', function (done) {
        browser.url('http://cdcdn.tiegushi.com/posts/7iFh5KQJFcq9FH4PE');
        browser.pause(20000);
        try {
            console.log('帖子能够打开');
            expect(browser.isExisting('.element')).to.be.ok;
            expect(browser.isVisible('.element')).to.be.ok;
            done();
        } catch (e) {
            var text = '故事贴帖子打开异常';
            text += e;
            server.apply('sendErrorReport', [sendMailTo, 'sraita@139.com', '故事贴帖子打开异常', text]);
            console.log(text);
            done(e);
        }
        browser.pause(6000);
        setTimeout(done, 3000);
    });


});


