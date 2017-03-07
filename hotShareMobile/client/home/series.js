Template.series.helpers({
  postsLists: function(){
    return Session.get('seriesContent').postLists
  },
  isSeriesEdit: function(){
    return Session.equals('isSeriesEdit',true);
  },
  postCounts: function(){
    var seriesContent = Session.get('seriesContent')
    return (seriesContent && seriesContent.postLists)?seriesContent.postLists.length : 0
  },
  seriesTitle: function(){
    if(Session.get('seriesContent').title){
      return Session.get('seriesContent').title;
    } else {
      return "";
    }
  },
  mainImage: function() {
    if(!Session.get('seriesMainImage') || Session.get('seriesMainImage') === ''){
      Session.set('seriesMainImage','http://data.tiegushi.com/ocmainimages/mainimage5.jpg');
    }
    return Session.get('seriesMainImage');
  },
  showPublishBtn: function(){
    console.log(Session.get('seriesContent').publish +'--dsfsdf')
    return !Session.get('seriesContent').publish && Template.series.__helpers.get('postCounts')()
  }
});

Template.series.events({
  'click .back': function(e,t){
    if(!Session.get('seriesIsSaved') && Session.get('isSeriesEdit')){

       navigator.notification.confirm('这个操作无法撤销', function(r){
        if(r !== 1){
          return 
        }
        Router.go('/seriesList');
       },'您确定要放弃未保存的修改吗？', ['放弃修改','继续编辑']);
    } else {
      Router.go('/seriesList');
    }
  },
  'click #edit': function(e,t){
    return Session.set('isSeriesEdit',true);
  },
  'click #save':function(){
    Session.set('seriesIsSaved',true);
  },
  'click .editAndAddNew': function(e,t){
    Session.set('isSeriesEdit',true);
    Session.set('seriesIsSaved',false);
    $('.author-self-posts').toggle();
  },
  'change #seriesTitle':function(){
    Session.set('seriesIsSaved',false);
  },
  'click .series-title':function(){
    $('.mainImageTools').show();
  },
  'click .imageToolBtn': function(e,t){
    $('.mainImageTools').hide();
    if(e.currentTarget.id === 'useOfficalImage'){
      $('.mainImagesList').show();
    } else {
      // todo 
    }
  },
  'click .series-post-item': function(e,t){
    $(e.currentTarget).toggleClass('series-post-item-not-select');
    return $(e.currentTarget).toggleClass('series-post-item-select');
  },
  'click .addNewPost': function(){
    Session.set('seriesIsSaved',false);
    $('.author-self-posts').toggle();
  },
  'click .has-dropdown, click .series-dropdown': function(){
    $('.series-dropdown').toggle();
  },
  'click #removeSelected': function(e,t){
    if($(".series-post-item-select").length === 0){
      return PUB.toast('请至少选择一个要删除故事')
    }
    Session.set('seriesIsSaved',false);
    var seriesContent = Session.get('seriesContent')
    var postLists = [];
    
    $('.series-post-item-not-select').each(function(index){
      postLists.push({
        postId:$(this).attr('id'),
        postMainImage: $(this).data('image'),
        postTitle:$(this).data('title'),
        postIndex: $(this).data('index')
      });
    });
    $('.series-post-item').removeClass('series-post-item-select');
    console.table(postLists)
    seriesContent.postLists = postLists;
    Session.set('seriesContent',seriesContent);
  },
  'click .viewModal':function(e,t){
    return Router.go('/posts/'+e.currentTarget.id);
  },
  'click #del':function(e,t){
    Series.remove({_id: Session.get('seriesId')});
    return PUB.back();
  },  
  'click .publish':function(e,t){
    if($('#seriesTitle').val() === ''){
      return PUB.toast('请输入标题');
    }
    if($(".series-post-item").length === 0){
      return PUB.toast('请至少添加一个故事')
    }
    Session.set('isSeriesEdit',false);
    var title = $('#seriesTitle').val();
    var posts = []
    var mainImage = $('.series-title').data('image');
    var owner = Meteor.user();
    var ownerName = owner.profile.fullname ? owner.profile.fullname: owner.username;
    var ownerIcon = owner.profile.icon
    var num = 0;
    $('.series-post-item').each(function(index){
      posts.push({
          postId:$(this).attr('id'),
          postTitle: $(this).data('title'),
          postAddonTitle: $(this).data('addontitle'),
          postMainImage: $(this).data('image'),
          postIndex: num,
          postOwner: owner._id,
          postOwnerName: ownerName,
          postOwnerIcon: ownerIcon
      });
      num++;
    });
    var publish = Session.get('seriesContent').publish;
    if(e.currentTarget.id === 'publish'){
      publish = true;
    }
    console.log('publish='+publish)
    if(Session.get('seriesId')){
      Series.update({
        _id: Session.get('seriesId')
      },{
        $set:{
          title: title,
          mainImage: mainImage,
          postLists: posts,
          updateAt: new Date(),
          publish: publish
        }
      });
    } else {
      Series.insert({
          title: title,
          mainImage: mainImage,
          owner: owner._id,
          ownerName: ownerName,
          ownerIcon: ownerIcon,
          createdAt: new Date(),
          postLists: posts,
          publish: publish
      })
    }

    Router.go('/seriesList');
  }
})