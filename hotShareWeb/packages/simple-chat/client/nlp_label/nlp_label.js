var label_limit = new ReactiveVar(0);

Template._NLPTextLabelName.onRendered(function(){
  label_limit.set(40);
  Meteor.subscribe('get-nlp-label-names', this.data.group_id, label_limit.get()); // TODO：
  var $box = this.$(".simple-chat-to-chat-label-name");
  $box.scroll(function(){
    if ($box.scrollTop() + $box[0].offsetHeight >= $box[0].scrollHeight){
      label_limit.set(label_limit.get()+20);
      var group_id = Blaze.getData($('.simple-chat-to-chat-label-name')[0]).group_id;
      Meteor.subscribe('get-nlp-label-names', group_id, label_limit.get()); // TODO：
      console.log('load more');
    }
  });
});
Template._NLPTextLabelName.helpers({
  names: function(){
    return NLPTextClassName.find({group_id: this.group_id}, {sort: {updateAt: 1}, limit: label_limit.get()});
  }
});
Template._NLPTextLabelName.events({
  'click li': function(e, t){
    $('#label-input-name').val(this.class_name);
    t.$('li img').removeAttr('style');
    $(e.currentTarget).find('img').attr('style', 'border: 3px solid #39a8fe;box-shadow: 0 0 10px 3px #39a8fe;');
  },
  'click .leftButton': function(){
    if (nlp_label_view) {
      Blaze.remove(nlp_label_view);
    }
    nlp_label_view = null;
  },
  'click .rightButton': function(e, t){
    if (!$('#label-input-name').val())
      return PUB.toast('请选择或输入类名~');;

    t.data.callback && t.data.callback($('#label-input-name').val());
    if (nlp_label_view) {
      Blaze.remove(nlp_label_view);
    }
    nlp_label_view = null;
  }
});