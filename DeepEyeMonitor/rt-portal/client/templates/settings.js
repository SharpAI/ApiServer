var showLogs = new ReactiveVar(true);
var formatLogsJson = new ReactiveVar(true);
var logsLimit = new ReactiveVar(100);
var logsTimeRange = new ReactiveVar([]);
var sessionId = new ReactiveVar('');

Template.settings.rendered = function(){
	Meteor.subscribe("userData", Meteor.userId(), function(){
		var cdnSetting = Meteor.user();
		if(cdnSetting.cdnSettings){
			var settings = cdnSetting.cdnSettings;
			$('#raid-box').prop('checked',settings.disableBox);
			$('#raid-cdn').prop('checked',settings.disableRaid);
			$('#orignal-cdn').prop('checked',settings.disableOrig);
			Session.set('disableBox',settings.disableBox)
			Session.set('disableRaid',settings.disableRaid)
			Session.set('disableOrig',settings.disableOrig)
		} 
	});

	Meteor.subscribe("raidInfoLogs",logsLimit.get(),logsTimeRange.get(),sessionId.get());

	$(function() {
      var start = moment().subtract(29, 'days');
      var end = moment();
      $('#logTimeRange').daterangepicker({
          startDate: start,
          endDate: end,
          ranges: {
              'Latest': [moment(), moment()],
              'Last 24 Hours': [moment().subtract(1, 'days'), moment()],
              'Last 7 Days': [moment().subtract(6, 'days'), moment()],
              'Last 30 Days': [moment().subtract(29, 'days'), moment()]
          }
      }, function(start, end){
        console.log('start = '+ start + ' , end = '+ end);
				logsTimeRange.set([start+0, end+0]);
				Meteor.subscribe("raidInfoLogs",logsLimit.get(),logsTimeRange.get(),sessionId.get());
				console.log(logsTimeRange.get())
        $('#logTimeRange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
      });
  });
}
function updateSettings(){

	Meteor.users.update({_id: Meteor.userId()},
		{$set:{
			cdnSettings:{
				disableBox:Session.get('disableBox'),
				disableRaid:Session.get('disableRaid'),
				disableOrig:Session.get('disableOrig')
			}
		}});
}

Template.settings.helpers({
	withPlayLogs: function(){
		return withPlayLogs;
	},
	showLogs: function(){
		return showLogs.get();
	},
	formatLogsJson: function(){
		return formatLogsJson.get();
	},
	logsLimit: function(){
		return logsLimit.get();
	},
	logLists: function(){
		var range = logsTimeRange.get();
		var limit = logsLimit.get() || 0;

		var selector = {};
		if(range && range.length > 0){
			selector = {
				createdAt:{
					$gte: range[0],
					$lte: range[1]
				}
			};
		}
		if(sessionId.get() && sessionId.get().length > 0) {
			selector['user_info.session_id']=sessionId.get();
		}
		console.log(selector);
		return RaidInfoLogs.find(selector,{limit: limit,sort:{createdAt:-1}}).fetch();
	},
	formatLogTime: function(createdAt){
		return new Date(createdAt);
	},
	jsonData: function(){
		var json = this;
		delete json.ts;
		return JSON.stringify(json);
	},
	jsonOptions: function(){
		var options = {
			collapsed: true,
			recursive_collapser: true
		};
		return options;
	}
})
Template.settings.events({
	'click #raid-box': function(e,t){
		Session.set('disableBox',e.target.checked)
		updateSettings()
		if(e.target.checked){
			toastr.warning('You disabled RAID Box/Browser traffic');
		} else {
			toastr.success('You enabled RAID Box/Browser traffic');
		}
	},
	'click #raid-cdn': function(e,t){
		Session.set('disableRaid',e.target.checked)
		updateSettings()
		if(e.target.checked){
			toastr.warning('You disabled RAID CDN traffic');
		} else {
			toastr.success('You enabled RAID CDN traffic');
		}
	},
	'click #orignal-cdn': function(e,t){
		Session.set('disableOrig',e.target.checked)
		updateSettings()
		if(e.target.checked){
			toastr.warning('You disabled Original CDN traffic');
		} else {
			toastr.success('You enabled Original CDN traffic');
		}
	},
	'click #save': function(e,t){
		var raidBox = t.find('#raid-box').checked;
		var raidCdn = t.find('#raid-cdn').checked;
		var orignalCdn = t.find('#orignal-cdn').checked;
		Meteor.users.update({_id: Meteor.userId()},
			{$set:{
				cdnSettings:{
					disableBox: raidBox,
					disableRaid: raidCdn,
					disableOrig: orignalCdn
				}
			}});
	},
	'click #logs-header': function(e){
		if(showLogs.get()){
			showLogs.set(false);
		} else {
			showLogs.set(true);
		}
	},
	'click #format-logs-json': function(e){
		if(formatLogsJson.get()){
			formatLogsJson.set(false);
		} else {
			formatLogsJson.set(true);
		}
	},
	'change #logLimit': function(){
		var limit = $('#logLimit').val();
		limit = parseInt(limit);
		if(limit && !isNaN(limit)){
			logsLimit.set(limit);
			Meteor.subscribe("raidInfoLogs",limit,logsTimeRange.get());
		}
	},
	'change #sessionId': function(e){
		var session_id = $('#sessionId').val();
		sessionId.set(session_id);
	}
});