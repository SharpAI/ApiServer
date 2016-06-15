Meteor.publish('hotShareFeeds', function () {
  var self = this;
  var me = Meteor.users.findOne(this.userId);
  var hotShareUserId;
  
  if(!me)
    return self.ready();
  else if(me.services && me.services.gushitie && me.services.gushitie.id)
    hotShareUserId = me.services.gushitie.id;
  else if(me.gushitie && me.gushitie.id)
    hotShareUserId = me.gushitie.id;
  if(!hotShareUserId)
    return self.ready();
    
  var handle = GushitieFeeds.find({followby: hotShareUserId, eventType: {$in: ['SelfPosted', 'share', 'pcommentowner']}, checked:{$ne: true}}, {sort: {createdAt: -1}, limit: 99}).observeChanges({
    added: function(id, fields){
      if(fields.pindex)
        fields.pindexText = GushitiePosts.findOne(fields.postId).pub[fields.pindex].text;
      self.added("hotshareFeeds", id, fields);
    },
    changed: function(id, fields){
      self.changed("hotshareFeeds", id, fields);
    },
    removed: function(id){
      self.removed("hotshareFeeds", id);
    }
  });
  
  self.ready();
  self.onStop(function () {
    handle.stop();
  });
});