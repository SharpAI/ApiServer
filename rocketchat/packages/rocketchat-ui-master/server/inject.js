/* globals Inject */
SSR.compileTemplate('hottestPosts', Assets.getText('server/hottestPosts.html'));
Template.hottestPosts.helpers({
	linkUrl:function(){
		return 'http://cdn.tiegushi.com/posts/'+this.postId;
	},
	description:function(){
		if( this.addonTitle && this.addonTitle != ''){
			return this.addonTitle;
		} else if (this.ownerName && this.ownerName!='') {
			return '作者: '+this.ownerName;
		} else {
			return '';
		}
	}
});
//Inject.rawHead("loader", Assets.getText('server/loader.html'));
Inject.rawHead("hottestPosts",function(chunk,res){
	if(chunk && chunk.req && chunk.req.url){
		console.log('the url is '+chunk.req.url);
		var url = chunk.req.url;
		if(url.indexOf('/channel/') ===0){
			url=url.replace('/channel/','')
			console.log('Channel request');
			url=url.split('?')[0];
			url=url.split('/userid/')[0];
			if(url.indexOf('/') > 0){
				console.log('not a hackable post link')
				return null;
			}
			console.log('The id is'+url)
			var postHtml = SSR.render('hottestPosts', {posts:getHottestPosts()});
			return postHtml;
		}
	}
	return null;
});

/*
Inject.rawBody('page-loading',`
	<div id="initial-page-loading" class="page-loading">
		<div class="spinner">
			<div class="rect1"></div>
			<div class="rect2"></div>
			<div class="rect3"></div>
			<div class="rect4"></div>
			<div class="rect5"></div>
		</div>
	</div>`);
*/
RocketChat.settings.get('Site_Url', function() {
	Meteor.defer(function() {
		if (__meteor_runtime_config__.ROOT_URL_PATH_PREFIX && __meteor_runtime_config__.ROOT_URL_PATH_PREFIX.trim() !== '') {
			let base_url = __meteor_runtime_config__.ROOT_URL+__meteor_runtime_config__.ROOT_URL_PATH_PREFIX;

			if(/\/$/.test(base_url) === false) {
				base_url += '/';
			}

			Inject.rawHead('base', `<base href="${base_url}">`);
		} else {
			Inject.rawHead('base', '');
		}
	});
});
