
if Meteor.isClient
  Template.addPostMainImage.helpers
    draftTitles:->
      draftId = $('.mainImage').attr('id')
      if draftId and draftId isnt ''
        if Session.get('isReviewMode') is '2'
          post = Session.get("postContent")
          draftTitles = {}
          if post?
            draftTitles.title = post.title
            draftTitles.addontitle = post.addontitle
          draftTitles
        else if Session.get('isReviewMode') is '1' or Session.get('isReviewMode') is '0' or Session.get('isReviewMode') is '3'
          draftTitles = SavedDrafts.findOne({_id:draftId})
          if !draftTitles?
            draftTitles = {}
            draftTitles.title = $("#title").val()
            draftTitles.addontitle = $("#addontitle").val()
            console.log("draftTitles.title="+draftTitles.title+", draftTitles.addontitle="+draftTitles.addontitle);
            draftTitles
      else
        draftTitles = {'title':'','addontitle':''}
    mainImage:->
      Drafts.findOne({type:'image'})
    getImagePath: (path,uri,id)->
      getImagePath(path,uri,id)
    getMainImageHeight:()->
      $(window).height()*0.55
