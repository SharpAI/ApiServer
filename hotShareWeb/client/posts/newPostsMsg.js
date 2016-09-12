var subs = new SubsManager({
  cacheLimit: 999,
  expireIn: 60*24*30
});

Router.route('/posts_msg/:_id', {
  waitOn: function(){
    return subs.subscribe("publicPosts", this.params._id);
  },
  loadingTemplate: 'loadingPost',
  template: 'newPostMsg',
  data: function(){
    return Posts.findOne({_id: this.params._id});
  }
});

Template.newPostMsg.onRendered(function(){
  Session.set('new-posts-msg', this.data);
  var pub = this.data.pub;
  for(var i=0;i<pub.length;i++){
    if(pub[i].pcomments && pub[i].pcomments.length > 0){
      for(var ii=0;ii<pub[i].pcomments.length;ii++)
        pub[i].pcomments[ii].read = true;
    }
  }
  Posts.update({_id: this.data._id}, {$set: {pub: pub}}, function(err, res){
    // if(err || res <= 0)
    //   return alert('操作失败，请重试~');
    // history.go(-1);
  });
});

Template.newPostMsg.helpers({
  msgs: function(){
    var result = [];
    if(Session.get('new-posts-msg')){
      _.map(Session.get('new-posts-msg').pub, function(item){
        if(item.pcomments && item.pcomments.length > 0){
          _.map(item.pcomments, function(pcom){
            if(pcom.read != true && pcom.createdAt >= new Date('2016-09-12 00:00:00')){
              pcom.pub_id = item._id || new Mongo.ObjectID()._str;
              result.push(pcom);
            }
          });
        }
      });
    }

    if(result.length > 0){
      result.sort(function(a, b){
        return a.createdAt < b.createdAt;
      });
    }

    console.log('msgs:', result);
    return result;
  },
  time_diff: function(created){
    return GetTime0(new Date() - created);
  }
});

Template.newPostMsg.events({
  'click li': function(e, t){
    Router.go('/posts/' + Session.get('new-posts-msg')._id + '?pub_pcom=' + this.pub_id);
  },
  'click .leftButton': function(){
    history.go(-1);
  },
  'click .rightButton': function(e, t){
    var pub = t.data.pub;
    for(var i=0;i<pub.length;i++){
      if(pub[i].pcomments && pub[i].pcomments.length > 0){
        for(var ii=0;ii<pub[i].pcomments.length;ii++)
          pub[i].pcomments[ii].read = true;
      }
    }
    Posts.update({_id: t.data._id}, {$set: {pub: pub}}, function(err, res){
      if(err || res <= 0)
        return alert('操作失败，请重试~');
      history.go(-1);
    });
  }
});