Template.webHome.rendered = function () {
  //    $('.webHome').css('height', $(window).height());
  //    $('.webFooter').css('left', $(window).width()*0.5-105);
  $('.sendAlert').css('display', "none");
  trackPage('http://www.tiegushi.com/');
  /*
  Meteor.subscribe("versions");
  Meteor.subscribe("publicPosts","StynhCAjeAdBrZTff")
  */
};
Template.webHome.events({
  'click #sendAlert': function (events) {
    $('.sendAlert').css('display', "none");
  },
  'click #sendEmailbtn': function (events) {
    name = $("#sendEmailname").val();
    email = $("#sendEmailemail").val();
    subject = $("#sendEmailsubject").val();
    text = $("#sendEmailmessage").val();
    if (name === "" || email === "" || subject === "" || text === "") {
      $('.sendAlert').css('display', "");
    } else {
//      Meteor.call('sendEmailToAdmin', email, subject, text + name);
      $("#sendEmailname").val('');
      $("#sendEmailemail").val('');
      $("#sendEmailsubject").val('');
      $("#sendEmailmessage").val('');
      $("#menu-container .content").slideUp('slow');
      $("#menu-container .homepage").slideDown('slow');
      $(".logo-top-margin").animate({ marginLeft: '45%' }, "slow");
      $(".logo-top-margin").animate({ marginTop: '80px' }, "slow");
      return false;
    }
  },
  'click .main-menu a': function (events) {
    var id = $(events.currentTarget).attr('class');
    console.log(id);
    id = id.split('-');
    $('a.active').removeClass('active');
    $(events.currentTarget).addClass('active');
    $("#menu-container .content").slideUp('slow');
    $("#menu-container #menu-" + id[1]).slideDown('slow');
    $("#menu-container .homepage").slideUp('slow');
    return false;
  },
  'click .main-menu a.homebutton': function () {
    $("#menu-container .content").slideUp('slow');
    $("#menu-container .homepage").slideDown('slow');
    $(".logo-top-margin").animate({ marginLeft: '45%' }, "slow");
    $(".logo-top-margin").animate({ marginTop: '80px' }, "slow");
    return false;
  },
  'click .main-menu a.aboutbutton': function () {
    $("#menu-container .content").slideUp('slow');
    $("#menu-container .about-section").slideDown('slow');
    $(".logo-top-margin").animate({ marginTop: '0' }, "slow");
    $(".logo-top-margin").animate({ marginLeft: '0' }, "slow");
    return false;
  },
  'click .main-menu a.projectbutton': function () {
    $("#menu-container .content").slideUp('slow');
    $("#menu-container .gallery-section").slideDown('slow');
    $(".logo-top-margin").animate({ marginTop: '0' }, "slow");
    $(".logo-top-margin").animate({ marginLeft: '0' }, "slow");
    return false;
  },
  'click .main-menu a.contactbutton': function () {
    $("#menu-container .content").fadeOut();
    $("#menu-container .contact-section").slideDown('slow');
    $(".logo-top-margin").animate({ marginTop: '0' }, "slow");
    $(".logo-top-margin").animate({ marginLeft: '0' }, "slow");
    return false;
  },
  'click .toggle-menu': function () {
    $('.show-menu').stop(true, true).slideToggle();
    return false;
  },
  'click .show-menu a': function () {
    $('.show-menu').fadeOut('slow');
  },
  'click .iosBtn': function () {
    var userAgent = navigator.userAgent.toLowerCase();
    trackEvent('Download', 'from Ios Button');
    if (userAgent.indexOf('micromessenger') >= 0) {
      //        document.write('微信内无法下载，请点击“右上角”按钮，选择“在浏览器中打开”即可正常下载');
      window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=org.hotshare.everywhere';
    }
  },
  'click .androidBtn': function () {
    trackEvent('Download', 'from Android Button');
  },
  'click .helpPost': function () {
    PUB.page('/help')
  },
  'click .banner .btn.up': function (e) {
    e.stopPropagation();
    localStorage.setItem('travel-box--banner-show', 'true');
    $('.banner img').attr('src', '/banner_02.jpg');
    $('.banner img').removeClass();
    $('.banner img').addClass('down');
    $(e.currentTarget).removeClass('up').addClass('down');
  },
  'click .banner .btn.down': function (e) {
    e.stopPropagation();
    $('.banner img').attr('src', '/banner_01.jpg');
    $('.banner img').removeClass();
    $('.banner img').addClass('up');
    $(e.currentTarget).removeClass('down').addClass('up');
  },
  'click .banner img': function () {
    location = 'http://travelbox.duapp.com/';
  }
});

Template.webHome.helpers({
  resetPassword: function () {
    return Session.get('resetPassword');
  },
  /*,
  versions: function(){
      return Versions.findOne();
  },
  */
  buildVersion: function () {
    return version_of_build;
  },
  isShowBanner: function () {
    return !(localStorage.getItem('travel-box--banner-show') === 'true');
  }
  /*
  helpPost: function(){
      return Posts.findOne({_id: 'StynhCAjeAdBrZTff'})
  }
  */
});

//Meteor.startup(function() {
//    $(window).resize(function() {
//      $('.webHome').css('height', $(window).height());
//      $('.webFooter').css('left', $(window).width()*0.5-105);
//    });
//  });
