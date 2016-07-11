
var config = {};
config.posts = [
		{postId:"YFQofExszB4wD8QfR"},
        {postId:""},
	];
config.serverUrl = "http://localhost:3000";

var getUserProfileProperty = function(property) {
            return Meteor.user().profile[property]
        }

var getPostsForTest = function(limit) {
    return Meteor.Posts.find({},{limit:10}).fetch();
}
describe('测试post数据到数据库后的html', function () {
    var post = null;
	before(function () {
        // test ddp connect 
        // var result = server.call('getOnePostForTest');
        // console.log(result);
        var getMeteorSettings = function(setting) {
            return Meteor.settings[setting];
        }
        var mySetting = server.execute(getMeteorSettings, 'MySetting');
        // console.log(mySetting);

        var getUserProfileProperty = function(property) {
            return Meteor.user().profile[property]
        }
        console.log("------------------------+++------------------");
		browser.windowHandleSize({width: 800, height: 600});   
        browser.url(config.serverUrl+'/posts/Huc5MjqjWq2Z9uBaM');
		browser.pause(6000);
        var userName = browser.execute(getUserProfileProperty, 'fullname').value;
        console.log(userName);

        // post = Meteor.Posts.findOne();
        var getMeteorPosts = function(id) {
            return Posts.findOne({});
        }
        // console.log(post)
        post = browser.execute(getMeteorPosts, "Huc5MjqjWq2Z9uBaM").value;

        var getPostPubById = function(id, property) {
            console.log(Posts.find().count());
            // return Posts.findOne({_id: id}).pub;
            return Posts.find().count()
        }
        var PUB = browser.execute(getPostPubById, 'pub').value;
        console.log(PUB);

	});
	beforeEach(function () {
		// browser.waitForExist('.showBgColor');
	});

	it('标题和标题图片 @watch', function () {
		var mainImage = browser.element('.mainImage img');
		var title = browser.element('h2 .title');
		var addontitle = browser.element('h4 .addontitle');
		console.log(mainImage.getAttribute('src'));
		expect(mainImage.getAttribute('src')).not.to.be.equal('');
		expect(mainImage.getAttribute('src')).not.to.be.empty;

	});
	
	it('pub节点数量 @watch', function () {
			var pub = browser.elements('.element');
			console.log(pub.value.length);
			// expect(pub.value.length).to.be.equal(post.pub.length);	
	});
	it('结构与样式 @watch', function () {
        console.log("这里有post吗"+ post.pub.length)
		post.pub.forEach(function(item) {
			if(!item.isImage && item.type == 'text' && item.text != ""){
				describe('段落: 位置为'+ item.index, function() {
					var ele = browser.element('#'+item._id);
					console.log(item._id);
					expect(ele.getTagName()).to.be.equal('div');
					expect(ele.getAttribute('class')).to.be.equal('postTextItem element');

					var node1 = ele.element('.textDiv1Link');
					console.log(node1.getAttribute('class'));
					expect(node1.getTagName()).to.be.equal('span');
					expect(node1.getAttribute('class')).to.be.equal('textDiv1Link');
					// expect(node1.getText()).to.be.equal('"'+item.text+'"');

                    console.log(ele.getAttribute('style'));
                    // 验证样式
                    // expect(ele.getAttribute('style')).to.match(/top/);
                    // expect(ele.getAttribute('style')).to.match(/left/);
                    // expect(ele.getAttribute('style')).to.match(/width/);
                    // expect(ele.getAttribute('style')).to.match(/height/);

					// 是否包含评论
					if(item.likeSum){
						var like = ele.element('.inlineScoring');
						console.log(like.getAttribute('class'));
						expect(like.getTagName()).to.be.equal('div');
						expect(like.getAttribute('class')).to.be.equal('inlineScoring');

						var likeChild = like.elements('i');
						expect(likeChild.value.length).to.be.equal(3);
					}

                    // 验证是否有元素重叠
					return;
				});
			} else if(item.type == 'image' && item.isImage) {
				describe('图像: 位置为'+ item.index, function() {
					var ele = browser.element('#'+item._id);
                    // 验证节点和class
					expect(ele.getTagName()).to.be.equal('div');
					expect(ele.getAttribute('class')).to.be.equal('postImageItem element');

					console.log(item._id);

					var child1 = ele.element('.padding-overlay');
					expect(child1.getTagName()).to.be.equal('div');
					expect(child1.getAttribute('class')).to.be.equal('padding-overlay');

					var childImg = ele.element('img');
					expect(childImg.getTagName()).to.be.equal('img');
					expect(childImg.getAttribute('src')).not.to.be.equal('');
					expect(childImg.getAttribute('src')).not.to.be.empty;
					expect(childImg.getAttribute('class')).to.be.equal('lazy');

                    console.log(ele.getAttribute('style'));
                    // 验证样式
                    expect(ele.getAttribute('style')).to.match(/top/);
                    expect(ele.getAttribute('style')).to.match(/left/);
                    expect(ele.getAttribute('style')).to.match(/width/);
                    expect(ele.getAttribute('style')).to.match(/height/);
					return;
				});
                // 验证定位样式left&top, 当post标题包含图片排列测试时
                    var titleReg = new RegExp("图片排列测试");
                    if(titleReg.exec(post.title)){
                        describe("验证图像排列 @watch", function() {
                            console.log(post.title)
                        });
                    }
			}
		});
		
	});


    it('段落点评与点赞 @watch', function() {

    });

    
    it('音乐和视频播放操作 @watch', function() {
        // 验证点击相应元素后， 是否有声音
        it('音乐播放与停止', function() {

        });
        it('视频播放与停止', function() {

        });
    });

});

// 需要测试每一个节点
describe('界面事件操作 @watch', function(){
    beforeEach(function() {
        browser.windowHandleSize({width: 800, height: 600});   
        browser.url(config.serverUrl+'/posts/Huc5MjqjWq2Z9uBaM');
		browser.pause(6000);
    });
    it('故事贴页面 @watch', function(){
        // 点击继续阅读 
        var readMore = browser.isVisible('.readmore');
        var ele = browser.element('.readmore');
        browser.moveToObject('.readmore',5,10);
        browser.leftClick('.readmore');
        browser.pause(1000);
        browser.scroll(0,1000);
        browser.pause(6000);


        // 图像查看操作
        browser.scroll(0,-1000);
        var Img =  browser.element('.postImageItem');
        browser.moveToObject('.postImageItem');
        browser.click('.postImageItem img');
            
        // 点击图片应当打开查看器
        browser.click(".img-box img");
        // browser.pause(600);
        browser.waitForExist('#swipebox-bottom-bar');
        browser.click('#swipebox-next');
        browser.pause(600);
        browser.click('#swipebox-next');
        browser.pause(600);
        browser.click('#swipebox-prev');
        browser.waitForExist('#swipebox-close');
        browser.click('#swipebox-close');

    });
    

    it('点击我', function() {
        var meBtn = browser.isVisible('.meBtn');
        if(meBtn) {
            browser.scroll(0,-200);
            var ele = browser.element('.meBtn');
            browser.click('.meBtn');
            browser.pause(600);

            // 设置昵称
            browser.moveToObject('.nickname');
            browser.click('.nickname');
            browser.setValue('#text', '我是哈哈哈');
            browser.click('.right-btn');
            var newFullName = browser.execute(getUserProfileProperty, 'fullname').value;
            expect(newFullName).to.be.equal('我是哈哈哈');

            // 设置性别
            browser.moveToObject('.sex');
            browser.click('.sex');
            browser.moveToObject('.setFemale');
            browser.click('.setFemale');
            var newSex = browser.execute(getUserProfileProperty, 'sex').value;
            expect(newSex).to.be.equal("female");
            // browser.click('.left-btn');
        }
    });
    it('动态页面', function(){

    });

    it('新朋友页面', function(){

    });
});