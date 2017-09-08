var view = null;
var callback = null;

Template._user_checkout_confirm.open = function(text, cb){
  view && Blaze.remove(view);
  view = null;
  callback = cb;
  view = Blaze.renderWithData(Template._user_checkout_confirm, {text: text}, document.body);
}

Template._user_checkout_confirm.events({
  'click ._user_checkout_confirm_mask': function(){
    view && Blaze.remove(view);
    view = null;
    // callback && callback(false);
  },
  'click .no': function(){
    view && Blaze.remove(view);
    view = null;
    callback && callback(false);
  },
  'click .yes': function(){
    view && Blaze.remove(view);
    view = null;
    callback && callback(true);
  }
});