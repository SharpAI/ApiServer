Template.webHome.rendered = function() {
    $('.webHome').css('height', $(window).height());
    $('.webFooter').css('left', $(window).width()*0.5-105);
    Meteor.subscribe("versions");
    Meteor.subscribe("publicPosts","StynhCAjeAdBrZTff")
  };
Template.webHome.events({
    'click .iosBtn':function(){
      var userAgent = navigator.userAgent.toLowerCase();
      if(userAgent.indexOf('micromessenger')>=0){
//        document.write('微信内无法下载，请点击“右上角”按钮，选择“在浏览器中打开”即可正常下载');
        window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=org.hotshare.everywhere';
      }
    },
    'click .helpPost':function(){
      PUB.page('/help')
    }
});

Template.webHome.helpers({
    resetPassword: function(){
        return Session.get('resetPassword');
    },
    versions: function(){
        return Versions.findOne();
    },
    buildVersion: function(){
        return version_of_build;
    },
    helpPost: function(){
        return Posts.findOne({_id: 'StynhCAjeAdBrZTff'})
    }
});

Meteor.startup(function() {
    $(window).resize(function() {
      $('.webHome').css('height', $(window).height());
      $('.webFooter').css('left', $(window).width()*0.5-105);
    });
  });
