Template.webHome.rendered = function() {
    $('.webHome').css('height', $(window).height());
    $('.webFooter').css('left', $(window).width()*0.5-105);
    trackPage('http://www.tiegushi.com/');
    /*
    Meteor.subscribe("versions");
    Meteor.subscribe("publicPosts","StynhCAjeAdBrZTff")
    */
  };
Template.webHome.events({
    'click .iosBtn':function(){
      var userAgent = navigator.userAgent.toLowerCase();
        trackEvent('Download','from Ios Button');
      if(userAgent.indexOf('micromessenger')>=0){
//        document.write('微信内无法下载，请点击“右上角”按钮，选择“在浏览器中打开”即可正常下载');
        window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=org.hotshare.everywhere';
      }
    },
    'click .androidBtn':function(){
        trackEvent('Download','from Android Button');
    },
    'click .helpPost':function(){
      PUB.page('/help')
    },
    'click .banner .btn.up': function(e){
      e.stopPropagation();
      localStorage.setItem('travel-box--banner-show', 'true');
      $('.banner img').attr('src', '/banner_02.jpg');
      $('.banner img').removeClass();
      $('.banner img').addClass('down');
      $(e.currentTarget).removeClass('up').addClass('down');
    },
    'click .banner .btn.down': function(e){
      e.stopPropagation();
      $('.banner img').attr('src', '/banner_01.jpg');
      $('.banner img').removeClass();
      $('.banner img').addClass('up');
      $(e.currentTarget).removeClass('down').addClass('up');
    },
    'click .banner img': function(){
      location = 'http://travelbox.duapp.com/'; 
    }
});

Template.webHome.helpers({
    resetPassword: function(){
        return Session.get('resetPassword');
    },
    /*,
    versions: function(){
        return Versions.findOne();
    },
    */
    buildVersion: function(){
        return version_of_build;
    },
    isShowBanner: function(){
      return !(localStorage.getItem('travel-box--banner-show') === 'true');
    }
    /*
    helpPost: function(){
        return Posts.findOne({_id: 'StynhCAjeAdBrZTff'})
    }
    */
});

Meteor.startup(function() {
    $(window).resize(function() {
      $('.webHome').css('height', $(window).height());
      $('.webFooter').css('left', $(window).width()*0.5-105);
    });
  });
