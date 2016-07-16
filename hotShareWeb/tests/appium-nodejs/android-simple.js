"use strict";

require("./helpers/setup");
var actions = require('./helpers/actions');

var wd = require("wd"),
    _ = require('underscore'),
    serverConfigs = require('./helpers/appium-servers');
var TouchAction = require('wd').TouchAction;
var Q = require('q');

wd.addPromiseChainMethod('tap_once', actions.tap_once);
wd.addPromiseChainMethod('swipe', actions.swipe);

function sleep(sleepTime) {
    for(var start = +new Date; +new Date - start <= sleepTime; ) { } 
}

describe("android simple", function () {
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
      desired.name = 'android - simple';
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

  it("case 3: find and click 'ME'", function () {
    return driver
      .sleep(2000)
      .waitForElementByAccessibilityId('ME')
        .click()
      .text().should.become('')
  });

  it("case 4: find and click 'MESSAGES'", function () {
    return driver
      .sleep(2000)
      .waitForElementByAccessibilityId('MESSAGES')
        .click()
      .text().should.become('')
  });

  it("case 5: find and click '+'", function () {
    var d = {x:0, y:0, w:0, h:0};

    return driver
     .sleep(2000)
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
             return;
           });
       });
  });

  it("case 6: find and click '+', to close import items", function () {
    var d = {x:0, y:0, w:0, h:0};

    return driver
     .sleep(2000)
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
             return;
           });
       });
  });

  it("case 7: find and click 'DISCOVER'", function () {
    return driver
      .sleep(2000)
      .waitForElementByAccessibilityId('DISCOVER')
        .click()
      .text().should.become('')
  });

  it("case 8: find and click 'Home'", function () {
    return driver
      .sleep(2000)
      .waitForElementByAccessibilityId('HOME')
        .click()
      .text().should.become('')
  });

  it("case 9: open a '帖子', record how much time is consumed", function () {
    var time1 = null;
    var time2 = null;

    driver
      .sleep(2000)
      .elementsByXPath("//android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.webkit.WebView/android.view.View/android.widget.Image[contains(@index,1)]")
        .then(function (els) {
          els[0].getLocation().click();
          time1 = new Date();
          console.log('1 ' +time1);
        });

    return driver
      .waitForElementByAccessibilityId('ReadingRoom')
        .then(function (els) {
          time2 = new Date();
          console.log('2 ' +time2);
        });
  });

  it("case 10: exit from '帖子'", function () {
    return driver
      .sleep(2000)
      .elementsByXPath("//android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.webkit.WebView/android.view.View/android.view.View[contains(@index,0)]")
        .then(function (els) {
          els[0].getLocation().click();
        });
  });
});
