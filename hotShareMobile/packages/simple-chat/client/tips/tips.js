Template._TipHintTemplate.rendered = function () {
  $('.simple-chat .box').addClass('chatTip-html-body');
  var type = Session.get('simple_chat_tips_type');
  if (type == 'NLP') {
      document.getElementById("tipsHint").style.backgroundImage = "url(/packages/feiwu_simple-chat/images/nlp_tips1.jpg)";
    } else {
      document.getElementById("tipsHint").style.backgroundImage = "url(/packages/feiwu_simple-chat/images/tips.jpg)";
    }
};
