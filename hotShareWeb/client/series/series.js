Template.series.helpers({
  postsLists: function(){
    if(Session.get('seriesContent')){
      return Session.get('seriesContent').postLists
    }
  },
  postCounts: function(){
    var seriesContent = Session.get('seriesContent')
    return (seriesContent && seriesContent.postLists)?seriesContent.postLists.length : 0
  },
  seriesTitle: function(){
    if(Session.get('seriesContent') && Session.get('seriesContent').title){
      document.title = Session.get('seriesContent').ownerName + '的合辑《' + Session.get('seriesContent').title + '》';
      return Session.get('seriesContent').title;
    } else {
      return "";
    }
  },
  mainImage: function() {
    if(Session.get('seriesContent') && Session.get('seriesContent').mainImage){
      return Session.get('seriesContent').mainImage;
    } else {
      return 'http://data.tiegushi.com/ocmainimages/mainimage5.jpg';
    }
  },
  showPublishBtn: function(){
    if(Session.get('seriesContent')){
      return !Session.get('seriesContent').publish && Template.series.__helpers.get('postCounts')()
    } else {
      return true;
    }
  },
  formatTime(updateAt,createdAt){
    if(updateAt){
      return get_diff_time(updateAt) + ' 更新';
    } else {
      get_diff_time(createdAt) + ' 创建';
    }
  }
});

Template.series.events({
  'click #SubscribeSeries': function(e,t){
    console.log('follow btn clicked');
    $('.subscribeSeriesPage').show();
  },
  'click .cannelBtn': function(e,t){
    console.log('cancel btn clicked');
    $('.subscribeSeriesPage').hide();
  },
  'click .okBtn': function(e,t){
    console.log('ok btn clicked');

    mailAddress = t.find('#email').value;
    qqValueReg = RegExp(/^[1-9][0-9]{4,9}$/);
    mailValueReg = RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/);
    if (!mailValueReg.test(mailAddress) && !qqValueReg.test(mailAddress)) {
      toastr.remove();
      toastr.info('请输入正确的QQ号或Email');
      return false;
    }
    if (qqValueReg.test(mailAddress)) {
      mailAddress += '@qq.com';
    }

    console.log('##RDBG mailAddress: ' + mailAddress);
    $('.subscribeSeriesPage').hide();

    var series = Series.findOne({_id: this._id});
    if (series) {
      var followingEmails = series.followingEmails;
      if (!followingEmails)
        followingEmails = [];
      for (var i = 0; i < followingEmails.length; i++) {
        if (followingEmails[i] == mailAddress) {
          toastr.info('已经关注了这个邮箱 ' + mailAddress);
          return;
        }
      }
      followingEmails.push(mailAddress);
      Series.update({_id: this._id}, {$set: {followingEmails: followingEmails}});
    }
  },
  'click .back': function(e,t){
    console.log('back clicked');
  },
  'click .viewModal':function(e,t){
    Router.go('/posts/'+e.currentTarget.id);
  },
});
