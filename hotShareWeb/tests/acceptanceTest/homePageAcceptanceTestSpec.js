describe('首页', function () {
  beforeEach(function () {
    //browser.url('http://localhost:3000');
  });
  
  afterEach(function () {
    
  });

  describe('登录网站首页 @watch', function(){
    beforeEach(function () {
      browser.url('http://localhost:3000');
    });

    it('logo可见 @watch', function(){
      expect(browser.isVisible('.logo-top-margin')).to.equal(true);
    });
    
    it('显示欢迎信息 @watch', function(){
      expect(browser.isVisible('#menu-1 .welcome-text')).to.be.true;
    });
    
    it('ios下载按钮 @watch', function(){
      expect(browser.isVisible('#menu-1 .iosBtn')).to.be.true;
      expect(browser.isEnabled('#menu-1 .iosBtn')).to.be.true;
    });
    
    it('android下载按钮 @watch', function(){
      expect(browser.isVisible('#menu-1 .androidBtn')).to.be.true;
      expect(browser.isEnabled('#menu-1 .androidBtn')).to.be.true;
    });

    it('网站主页按钮 @watch', function(){
      expect(browser.isEnabled('#nav .homebutton')).to.be.true;
      expect(browser.isVisible('#nav .homebutton')).to.be.true;
    });
    
    it('使用指南按钮 @watch', function(){
      expect(browser.isEnabled('#nav .aboutbutton')).to.be.true;
      expect(browser.isVisible('#nav .aboutbutton')).to.be.true;
    });
    
    it('留言反馈按钮 @watch', function(){
      expect(browser.isEnabled('#nav .contactbutton')).to.be.true;
      expect(browser.isVisible('#nav .contactbutton')).to.be.true;
    });
       
    it('微信按钮 未添加代码，不可用 @watch', function(){
//      browser.click('');
//      expect(browser.isVisible('main-menu .')).to.be.true;
    });

    it('微博按钮 未添加代码，不可用 @watch', function(){
//      browser.click('');
//      expect(browser.isVisible('main-menu .')).to.be.true;
    });
    
    it('qq按钮 未添加代码，不可用 @watch', function(){
//      browser.click('');
//      expect(browser.isVisible('main-menu .')).to.be.true;
    });
  });
 
  describe('从其他页面跳转到首页', function(){
    beforeEach(function () {
      var logoLocate;
      
      browser.url('http://localhost:3000');
      logoLocate  = browser.getLocation('.logo-top-margin');
      browser.click('#nav .aboutbutton');
      browser.click('#nav .homebutton');
    });
    
    it('logo可见 @watch', function(){
      expect(browser.isVisible('.logo-top-margin')).to.equal(true);
    });
    
    it('显示欢迎信息 @watch', function(){
      expect(browser.isVisible('#menu-1 .welcome-text')).to.be.true;
    });
    
    it('ios下载按钮 @watch', function(){
      expect(browser.isVisible('#menu-1 .iosBtn')).to.be.true;
      expect(browser.isEnabled('#menu-1 .iosBtn')).to.be.true;
    });
    
    it('android下载按钮 @watch', function(){
      expect(browser.isVisible('#menu-1 .androidBtn')).to.be.true;
      expect(browser.isEnabled('#menu-1 .androidBtn')).to.be.true;
    });

    it('网站主页按钮 @watch', function(){
      expect(browser.isEnabled('#nav .homebutton')).to.be.true;
      expect(browser.isVisible('#nav .homebutton')).to.be.true;
    });
    
    it('使用指南按钮 @watch', function(){
      expect(browser.isEnabled('#nav .aboutbutton')).to.be.true;
      expect(browser.isVisible('#nav .aboutbutton')).to.be.true;
    });
    
    it('留言反馈按钮 @watch', function(){
      expect(browser.isEnabled('#nav .contactbutton')).to.be.true;
      expect(browser.isVisible('#nav .contactbutton')).to.be.true;
    });
  });
 
  describe('点击使用指南', function () {
    beforeEach(function () {
      browser.url('http://localhost:3000');
    });

    it('内容弹出 @watch', function () {
        browser.click('#nav .aboutbutton');// 点击使用指南
        expect(browser.isVisible('#menu-2')).to.equal(true);
        expect(browser.isVisible('#menu-2 .open')).to.equal(true);
        expect(browser.isVisible('#openImg1')).to.be.true;
        expect(browser.isVisible('#openImg2')).to.be.true;        
    });
    
    it('logo移动 @watch', function () {
        var marginTop   = browser.getCssProperty('.logo-top-margin', 'marginTop');
        var marginLeft  = browser.getCssProperty('.logo-top-margin', 'marginLeft');
        
        browser.click('#nav .aboutbutton');
        setTimeout(function(){}, 500);
        expect(browser.getCssProperty('.logo-top-margin', 'marginTop')).not.to.equal(marginTop);
        expect(browser.getCssProperty('.logo-top-margin', 'marginLeft')).not.to.equal(marginLeft);
    });
   
    it('如何注册故事贴 @watch', function () {
      browser.click('#nav .aboutbutton');
      browser.click('#custom-show-hide-example .open');
      expect(browser.isVisible('#openImg1')).to.be.false;
      expect(browser.isVisible('#openImg2')).to.be.false;   
    });

   
    it('如何发贴 @watch', function () {
      browser.click('#nav .aboutbutton');
      browser.waitForVisible('#posts', 1000);
      browser.click('#posts');
      expect(browser.isVisible('#postsImg1')).to.be.true;
      expect(browser.isVisible('#postsImg2')).to.be.true;   
    });

    it('图片调整 @watch', function () {
      browser.click('#nav .aboutbutton');
      browser.waitForVisible('#image', 1000);
      browser.click('#image');
      expect(browser.isVisible('#imgImg1')).to.be.true;
      expect(browser.isVisible('#imgImg2')).to.be.true;   
    });

    it('添加文字&排版 @watch', function () {
      browser.click('#nav .aboutbutton');
      browser.waitForVisible('#addFont', 1000);
      browser.click('#addFont');
      expect(browser.isVisible('#addFont1')).to.be.true;
      expect(browser.isVisible('#addFont2')).to.be.true;   
      expect(browser.isVisible('#addFont3')).to.be.true;         
    });

    it('一键导入 @watch', function () {
      browser.click('#nav .aboutbutton');
      browser.waitForVisible('#import', 1000);
      browser.click('#import');
      expect(browser.isVisible('#import1')).to.be.true;
      expect(browser.isVisible('#import2')).to.be.true;   
    });
    
    it('分享朋友圈 @watch', function () {
      browser.click('#nav .aboutbutton');
      browser.waitForVisible('#share', 1000);      
      browser.click('#share');
      expect(browser.isVisible('#share1')).to.be.true;
    });
  
    it('忘记登录密码 @watch', function () {
      browser.click('#nav .aboutbutton');
      browser.waitForVisible('#forgetps', 1000);
      browser.click('#forgetps');
      expect(browser.isVisible('#forgetps1')).to.be.true;
    });
    
    it('如何段落转帖 @watch', function () {
      browser.click('#nav .aboutbutton');
      browser.waitForVisible('#repost', 1000);
      browser.click('#repost');
      expect(browser.isVisible('#repost1')).to.be.true;
      expect(browser.isVisible('#repost2')).to.be.true;      
    });
    
    it('作者自己的文章搜索 @watch', function () {
      browser.click('#nav .aboutbutton');
      browser.waitForVisible('#search', 1000);
      browser.click('#search');
      expect(browser.isVisible('#search1')).to.be.true;
    });
    
    it('使用匿名发帖 @watch', function () {
      browser.click('#nav .aboutbutton');
      browser.waitForVisible('#anonymous', 1000);      
      browser.click('#anonymous');
      expect(browser.isVisible('#anonymous1')).to.be.true;
      expect(browser.isVisible('#anonymous2')).to.be.true;      
    });
    
    it('收藏帖子 @watch', function () {
      browser.click('#nav .aboutbutton');
      browser.waitForVisible('#collect', 1000);            
      browser.click('#collect');
      expect(browser.isVisible('#collect1')).to.be.true;
      expect(browser.isVisible('#collect2')).to.be.true;      
    });
    
  });

  describe('点击留言反馈', function(){
    beforeEach(function () {
      browser.url('http://localhost:3000');
    });
    
    it('输入框以及发送按钮可用 @watch', function(){
      browser.click('#nav .contactbutton');// 点击使用指南
      expect(browser.isEnabled('#sendEmailname')).to.be.true;
      expect(browser.isEnabled('#sendEmailemail')).to.be.true;
      expect(browser.isEnabled('#sendEmailsubject')).to.be.true;
      expect(browser.isEnabled('#sendEmailmessage')).to.be.true;
      expect(browser.isEnabled('#sendEmailbtn')).to.be.true;
      expect(browser.isVisible('#menu-3 .col-md-4.col-sm-4')).to.be.true;
    });
    
    it('提交空建议 @watch', function(){
      var log;
      
      browser.click('#nav .contactbutton');
      browser.waitForVisible('#menu-3 .button', 2000);
      browser.click('#menu-3 .button');
      log = browser.getCssProperty('.sendAlert', 'display');      
      expect(log.value).to.be.equal('block');
      browser.click('#sendAlert');
      log = browser.getCssProperty('.sendAlert', 'display');      
      expect(log.value).to.be.equal('none');
    });
    
    it('提交建议 @watch', function(){
      browser.click('#nav .contactbutton');
      browser.waitForVisible('#sendEmailname');
      browser.setValue('#sendEmailname', 'name');
      browser.setValue('#sendEmailemail', 'email');
      browser.setValue('#sendEmailsubject', 'subject');
      browser.setValue('#sendEmailmessage', 'messages');
      browser.click('#menu-3 .button');
      browser.waitForVisible('#sendEmailname', 1000, true);
      expect(browser.isVisible('#sendEmailname')).to.be.false;
      expect(browser.isVisible('#sendEmailemail')).to.be.false;
      expect(browser.isVisible('#sendEmailsubject')).to.be.false;
      expect(browser.isVisible('#sendEmailmessage')).to.be.false;
      expect(browser.isVisible('#sendEmailbtn')).to.be.false;
      expect(browser.isVisible('#menu-3 .col-md-4.col-sm-4')).to.be.false;
    });
    
    it('logo移动 @watch', function () {
        var marginTop   = browser.getCssProperty('.logo-top-margin', 'marginTop');
        var marginLeft  = browser.getCssProperty('.logo-top-margin', 'marginLeft');
        
        browser.click('#nav .aboutbutton');
        setTimeout(function(){}, 500);
        expect(browser.getCssProperty('.logo-top-margin', 'marginTop')).not.to.equal(marginTop);
        expect(browser.getCssProperty('.logo-top-margin', 'marginLeft')).not.to.equal(marginLeft);
    });

  });
/*
  describe('点击 Iphone 1.1.8按钮', function(){
    beforeEach(function () {
      browser.url('http://localhost:3000');
    });
    
    it('点击按钮 @watch', function(){
      browser.click('#menu-1 .iosBtn');
      //browser.newWindow('https://itunes.apple.com/app/gu-shi-tie/id957024953', 'ios下载');
      //var url = browser.getUrl();
      //var tmp = browser.forward();
      
      //expect(client.url()).to.be.equal('1');
    });
  });
*/
});