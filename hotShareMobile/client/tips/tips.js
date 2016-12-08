var view = null;
Tips = {
  show: function(template, showClose){
    Tips.close();
    if(localStorage.getItem('_tips_' + template))
      return;

    view = Blaze.renderWithData(Template._tips, {view: template}, document.body);
    localStorage.setItem('_tips_' + template, true);
  },
  close: function(){
    if(view){
      Blaze.remove(view);
      view = null;
    }
  }
};

Template._tips.events({
  "click ._tips": function(e, t) {
    Tips.close();
  }
});