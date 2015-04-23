RefNames = new Mongo.Collection("refnames");
if (Meteor.isClient) {
  Template.body.helpers({
    comments: function () {
      return RefNames.find({}, {sort: {createdAt: -1}});
    },
    count: function () {
      return RefNames.find({}).count();
    }
  });
  Template.body.events({
  "submit .new-comment": function (event) {
    var text = event.target.text.value;
      RefNames.insert({
      text: text,
      createdAt: new Date()
    });
    event.target.text.value = "";
    return false;
  }
  });
  Template.comment.events({
    "click .toggle-checked": function () {
      RefNames.update(this._id, {$set: {checked: ! this.checked}});
  },
  "click .delete": function () {
    if(this.checked){
      RefNames.remove(this._id);
    }
  }
  });
}
