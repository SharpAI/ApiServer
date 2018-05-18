var isShowNoPerson = new ReactiveVar(false);

Template.newLabel.helpers({
  showNoPersonBtn: function() {
    return isShowNoPerson.get();
  }
});

Template.newLabel.events({
  'click .right-handle-btn': function(e) {
    e.stopImmediatePropagation();
    isShowNoPerson.set(!isShowNoPerson.get());
  },
  'click .newLabel-wrap': function() {
    if (isShowNoPerson.get()) {
      isShowNoPerson.set(false);
    }
  },
  'click .no-person-btn': function() {

  },
  'click .back': function() {
    return Router.go('/message');
  }
});