if (Meteor.isClient){
    Template.changeSeriesImage.onRendered(function(){
      $('.mainImagesList').css('min-height',$(window).height());
    });
      
    Template.changeSeriesImage.events({
      'click .mainImagesListback' :function(e){
        $('body').removeAttr('style');
        $('.mainImagesList').hide();
        $('#seriesTitle').show();
      },
      'click .mainImagesListImport' :function(e){
        var mainImgUrl = '';
        $('input[class="mainImageListInput"]').each(function(){
          if($(this).prop('checked') === true){
            mainImgUrl = $(this).attr('value');
          }
        });
        if (mainImgUrl !== ''){
          var seriesContent = Session.get('seriesContent');
          seriesContent.mainImage = mainImgUrl
          Session.set('seriesContent',seriesContent);
          $('.mainImagesList').hide();
          $('#seriesTitle').show();
        } else {
          PUB.toast('请选择图片！');
        }
      },
      'click .mainImageListInput':function(e){
        $('.mainImageListInput').prop('checked',false);
        Meteor.setTimeout(function(){
          $(e.currentTarget).prop('checked',true);
        },50);
      }
    });

    Template.changeSeriesImage.helpers({
      mainImage:function(){
        if(Session.get('seriesContent')){
          return Session.get('seriesContent').mainImage;
        } else {
          return false;
        }
      },
      officialImages:function(){
        var arr = [{num:1},{num:2},{num:3},{num:4},{num:5},{num:6},{num:7},{num:8},{num:9},{num:10},{num:11},{num:12},{num:13},{num:14},{num:15},{num:16},{num:17},{num:18},{num:19},{num:20},{num:21},{num:22},{num:23},{num:24},{num:25},{num:26},{num:27},{num:28},{num:29},{num:30},{num:31},{num:32},{num:33},{num:34},{num:35},{num:36},{num:37}];
        return arr;
      }
    });
}