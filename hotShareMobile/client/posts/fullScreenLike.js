Template.bottomLike.events({
  "click .full_like": function(e){
      //prevent image from closing
      if(typeof($("#isClicked").val()) == "undefined"){
        $(".bottomLike").append("<div value='hasClick' id='isClicked'></div>");
      }
       Meteor.setTimeout (function(){
          $("#isClicked").remove();
       },10);

       currentImgId = $('#swipebox-slider .current img')[0].src;
       post = Session.get('postContent');
       clickToLike(post, currentImgId);

       if($(e.currentTarget).find('img').attr('src') == "/img/b_unlike.png"){
              //click image animation
              imgArray = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v"];
              $.each(imgArray, function( i, img ) {
              setTimeout(function(){
                    $(".big_like").attr("src", "/img/gif/"+ img+".png");
               }, 20 *i);
            });
       }
    }
});

Template.bottomLike.onRendered(function () {
      post = Session.get('postContent');
      currentImgId = $('#swipebox-slider .current img')[0].src;
      for(i = 0; i < post.pub.length; i++){
        if(post.pub[i].imgUrl === currentImgId){
            //the count
            Session.set("likeCount", post.pub[i].pub_Heart.length);
            //the like 
            if(post.pub[i].pub_Heart.length == 0){
                Session.set("hasLiked", false);
            }else if(post.pub[i].pub_Heart.length > 0){
                for(k=0; k <post.pub[i].pub_Heart.length; k++){
                     if(post.pub[i].pub_Heart[k].like_userId == Meteor.userId()){
                        Session.set("hasLiked", true);
                     }else{
                        Session.set("hasLiked", false);
                       }
                }
            }
            
        }
      }
});

Template.bottomLike.helpers({
  "isLiked": function(){
                  return Session.get("hasLiked");
  },
  "allLikeCount": function(){
            return Session.get("likeCount");
  }
});