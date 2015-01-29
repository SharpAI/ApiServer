if Meteor.isClient
    Template.loadingPost.rendered=->
        $('body').css 'background-color','white'