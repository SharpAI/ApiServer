RefComments = new Mongo.Collection("refcomments");
if (Meteor.isClient) {
// This code only runs on the client
Template.body.helpers({
comments: function () {
// Show newest comments first
return RefComments.find({}, {sort: {createdAt: -1}});
}
});
Template.body.events({
"submit .new-comment": function (event) {
// This function is called when the new comment form is submitted
var text = event.target.text.value;
RefComments.insert({
text: text,
createdAt: new Date() // current time
});
// Clear form
event.target.text.value = "";
// Prevent default form submit
return false;
}
});
Template.comment.events({
"click .toggle-checked": function () {
// Set the checked property to the opposite of its current value
RefComments.update(this._id, {$set: {checked: ! this.checked}});
},
"click .delete": function () {
  if(this.checked)
  {
    RefComments.remove(this._id);
  }
}
});
}
