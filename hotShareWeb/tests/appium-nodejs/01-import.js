"use strict";

require("./helpers/setup");
var actions = require('./helpers/actions');

var wd = require("wd"),
    _ = require('underscore'),
    serverConfigs = require('./helpers/appium-servers');
var TouchAction = require('wd').TouchAction;
var Q = require('q');
var tcpdump = require('./helpers/tcpdump.js');

wd.addPromiseChainMethod('tap_once', actions.tap_once);
wd.addPromiseChainMethod('swipe', actions.swipe);

function sleep(sleepTime) {
    for(var start = +new Date; +new Date - start <= sleepTime; ) { } 
}

describe("android import", function () {
  this.timeout(300000);
  var driver;
  var allPassed = true;

  before(function () {
    var serverConfig = process.env.npm_package_config_sauce ?
      serverConfigs.sauce : serverConfigs.local;
    driver = wd.promiseChainRemote(serverConfig);
    require("./helpers/logging").configure(driver);

  //  var desired = process.env.npm_package_config_sauce ?
 //     _.clone(require("./helpers/caps").android18) :
//      _.clone(require("./helpers/caps").android19);
    var desired = _.clone(require("./helpers/caps").android19);

//    desired.app = require("./helpers/apps").androidApiDemos;
	desired.appPackage = "org.hotshare.everywhere";
	desired.appActivity = "org.hotshare.everywhere.MainActivity";
	desired.appWaitActivity = "org.hotshare.everywhere.MainActivity";

    if (process.env.npm_package_config_sauce) {
      desired.name = 'android - import';
      desired.tags = ['sample'];
    }
    return driver
      .init(desired)
      .setImplicitWaitTimeout(300000);
  });

  after(function () {
    return driver
	  .sleep(10000)

    return driver
      .quit()
      .finally(function () {
        if (process.env.npm_package_config_sauce) {
          return driver.sauceJobStatus(allPassed);
        }
      });
  });

  afterEach(function () {
    allPassed = allPassed && this.currentTest.state === 'passed';
  });

  it("case 1: do nothing, wait mainpage ...", function () {
  // TODO: environment check
  //  return driver
  //    .getNetworkConnection()
  //      .should.eventually.deep.equal({value: 6})

    return driver
      .sleep(5000)
      .waitForElementByAccessibilityId('故事贴')
        .text().should.become('')
  });

  it("case 2: swipe (x, y) --> (x2, y2), swipe to make appium happy", function () {
      return driver
        .sleep(2000)
        .swipe({
          startX: 100, startY: 100,
          endX: 100, endY: 1000,
          duration: 1000
        });
  });

  it("case 3-1: import frome web", function () {
    //step 1, got DISCOVER page, input and copy a URL
    return driver
      .sleep(2000)
      .waitForElementByAccessibilityId('DISCOVER')
        .click()
  });

  it("case 3-2: import frome web", function () {
    return driver
      .sleep(2000)
      .waitForElementByClassName('android.widget.EditText')
        .click()
      .clear()
      .sendKeys('http://www.meipai.com/media/545318929')
  });

  it("case 3-3: import frome web", function () {
    var d = {x:0, y:0, w:0, h:0};
    return driver
      .sleep(2000)
      .waitForElementByAccessibilityId('http://www.meipai.com/media/545318929')
        .then(function (els) {
          return Q.all([
            els.getLocation(),
            els.getSize()
          ]).then(function (locs) {
              d.x=locs[0].x;
              d.y=locs[0].y;
              d.w=locs[1].width;
              d.h=locs[1].height;
              return driver.tap_once({x: d.x + d.w/2, y: d.y+d.h/2, duration: 3000});
            });
        })
  });

  it("case 3-4: import frome web", function () {
    return driver
      .sleep(1000)
      .waitForElementByAccessibilityId('全选')
        .click()
  });

  it("case 3-5: import frome web", function () {
    return driver
      .sleep(1000)
      .waitForElementByAccessibilityId('剪切')
        .click()
  });

  it("case 3-6: import frome web", function () {
    return driver
     .sleep(2000)
      .waitForElementByAccessibilityId('Cancel')
        .click()
  });

  it("case 3-7: import frome web", function () {
    //step 2, import URL
    var d = {x:0, y:0, w:0, h:0};
    return driver
     .sleep(4000)
     .elementsByAccessibilityId('DISCOVER')
       .then(function (els) {
         return Q.all([
           els[0].getLocation(),
           els[0].getSize()
         ]).then(function (locs) {
             d.x=locs[0].x;
             d.y=locs[0].y;
             d.w=locs[1].width;
             d.h=locs[1].height;
             return driver.tap_once({x: d.x + d.w + 20, y: d.y+20, duration: 500});
           });
       });
  });

  it("case 3-8: import frome web", function () {
    //tcpdump.start();
    driver
      .waitForElementByAccessibilityId('IMPORT FROM WEB')
        .click()
    return tcpdump.start();
  });

  it("case 3-9: import frome web", function () {
    return driver
      .sleep(10000)
      .waitForElementByAccessibilityId('Publish')
       .then(function (els) {
         tcpdump.stop();
         tcpdump.size(function (size){
           console.log("导入时间 " + (tcpdump.time2.getTime() - tcpdump.time1.getTime())/1000);
           console.log("消耗流量 " + size);
         });
       });
      //  .click()
  });
});
