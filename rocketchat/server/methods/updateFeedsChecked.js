Meteor.methods({
  updateFeedsChecked: function (ids) {
    ids = _.isArray(ids) ? ids : [ids];
    GushitieFeeds.update({_id: {$in: ids}}, {$set: {checked: true}}, {multi: true});
  }
})