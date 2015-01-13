if Meteor.isClient
  # the only document I found here https://github.com/percolatestudio/transition-helper/blob/master/transition-helper.js#L4

  Template.addPost.rendered=->
    $('.img').css('max-width',$(window).width())
    $('.mainImage').css('height',$(window).height()*0.4)
    $('.title').css('top',$(window).height()*0.25)
    $('.addontitle').css('top',$(window).height()*0.35)

    console.log 'addPost rendered'
    this.find('.content')._uihooks = {
      insertElement: (node, next)->
        console.log('Inserted node id is ' + node.id);
        $(node)
          .insertBefore(next)
        $('.mainImage').css('height',$(window).height()*0.4)
        $('.title').css('top',$(window).height()*0.25)
        $('.addontitle').css('top',$(window).height()*0.35)
    }
    this.find('#display')._uihooks = {
      insertElement: (node, next)->
        console.log('Inserted node id is ' + node.id);
        $(node)
          .insertBefore(next)
        Deps.afterFlush =>
          console.log 'Added node id is ' + node.id
    }
    #draftLayout = Session.get("draftLayout")
    if Drafts.find().count() >= 1
      draftData = Drafts.find().fetch()
      draftLayout = draftData[0].layout;
      if draftLayout != '' and draftLayout != undefined
        json = jQuery.parseJSON(draftLayout);
        for item in json
          $('#' + item.id).attr('data-row', item.row).attr('data-col', item.col).attr('data-sizex', item.size_x).attr('data-sizey', item.size_y)

    test = $("#display");
    `gridster = test.gridster({serialize_params: function ($w, wgd) {
      return {
        id: wgd.el[0].id,
        col: wgd.col,
        row: wgd.row,
        size_x: wgd.size_x,
        size_y: wgd.size_y
      };
    },
    draggable: {
      stop: function () {
        var json = JSON.stringify(gridster.serialize());
        console.log("draggable draftLayout "+ json);
        var drafts = Drafts.find({owner: Meteor.userId()}).fetch();
        for (var i = 0; i < drafts.length; i++){
          Drafts.update({_id: drafts[i]._id}, {$set: {layout: json}});
        }
      }
    }, widget_base_dimensions: [120, 40],widget_margins: [5, 5], min_cols: 2, resize: {enabled: true, stop: function () {
        var json = JSON.stringify(gridster.serialize());
        console.log("resize draftLayout "+ json);
        var drafts = Drafts.find({owner: Meteor.userId()}).fetch();
        for (var i = 0; i < drafts.length; i++){
          Drafts.update({_id: drafts[i]._id}, {$set: {layout: json}});
        }
    }}}).data('gridster');`
    return

  Template.addPost.helpers
    mainImage:->
      #Meteor.setTimeout ->
      #  $('.mainImage').css('height',$(window).height()*0.55)
      #  0
      if Drafts.find().count() > 0
        Drafts.find().fetch()[0]
      else
        null
    items:()->
      if Drafts.find().count() > 1
        for i in [1..(Drafts.find().count()-1)]
          Drafts.find().fetch()[i]
  Template.addPost.events
    'click #addmore':->
      #uploadFile (result)->
      selectMediaFromAblum (result)->
        #console.log 'upload success: url is ' + result
        #Drafts.insert {owner: Meteor.userId(), imgUrl:result}
        console.log 'upload success: url is ' + result.smallImage
        Drafts.insert {owner: Meteor.userId(), imgUrl:result.smallImage, filename:result.filename, URI:result.URI, layout:''}

      return

    'click #cancle':->
      #Router.go('/')
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
        return
    'click #publish':->
      if Meteor.user() is null
        Router.go('/user')
        false
      else
        #Session.set("draftLayout", '');
        layout = JSON.stringify(gridster.serialize())
        #console.log("layout serialize "+ layout)
        pub=[]
        title = $("#title").val()
        addontitle = $("#addontitle").val()
        draftData = Drafts.find().fetch()
        postId = draftData[0]._id;
#        console.log "#####" + pub
        uploadFileWhenPublishInCordova(draftData)
        for i in [0..(draftData.length-1)]
#          console.log i
          if i is 0
            mainImage = 'http://bcs.duapp.com/travelers-km/'+draftData[i].filename
            mainText = $("#"+draftData[i]._id+"text").val()
          else
            pub.push {
              _id: draftData[i]._id,
              imgUrl:'http://bcs.duapp.com/travelers-km/'+draftData[i].filename,
              text: $("#"+draftData[i]._id+"text").val(),
            }
#        console.log "#####end" + pub
        Posts.insert {
          _id:postId,
          pub:pub,
          title:title,
          addontitle:addontitle,
          mainImage: mainImage,
          mainText: mainText,
          owner:Meteor.userId(),
          createdAt: new Date(),
          layout: layout
        }
        Router.go('/posts/'+postId)
        Drafts
          .find {owner: Meteor.userId()}
          .forEach (drafts)->
            Drafts.remove drafts._id
          return
    'click .remove':(event)->
      Drafts.remove this._id
