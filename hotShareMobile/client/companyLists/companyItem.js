var isLoading = new ReactiveVar(false);
var activeShow = new ReactiveVar('monthly');

var getHourMinutesTime = function(value) {
    var val = value.toString().split('.');
    var h = val[0];
    var m = val[1] * 60 / 100;
    return h+' 小时'+ Math.floor(m) + ' 分';
};

var DateTimezone = function(d, time_offset) {
		if (time_offset == undefined){
				if (d.getTimezoneOffset() == 420){
						time_offset = -7
				}else {
						time_offset = 8
				}
		}
		// 取得 UTC time
		var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
		var local_now = new Date(utc + (3600000*time_offset))
		var today_now = new Date(local_now.getFullYear(), local_now.getMonth(), local_now.getDate(), 
		local_now.getHours(), local_now.getMinutes());
	
		return today_now;
};

window.inCompanyTimeLength = function(time_offset, status){
	var self = status;

	var diff = 0;
	var out_time = self.out_time;
	var today_end = self.out_time;

	if(self.in_time) {
		var date = new Date(self.in_time);
		var fomatDate = date.shortTime(time_offset);
		var isToday = fomatDate.indexOf('今天') > -1 ? true : false;

	//不是今天的时间没有out_time的或者是不是今天时间，最后一次拍到的是进门的状态的都计算到当天结束
		if((!out_time && !isToday) || (self.status === 'in' && !isToday)) {
			date = DateTimezone(date,time_offset);
			day_end = new Date(date).setHours(23,59,59);
			//day_end = new Date(this.in_time).setUTCHours(0,0,0,0) + (24 - time_offset)*60*60*1000 - 1;
			out_time = day_end;
			self.in_time = date.getTime();
		}
		//今天的时间（没有离开过监控组）
		else if(!out_time && isToday) {
			var now_time = Date.now();
			out_time = now_time;
		}
		//今天的时间（离开监控组又回到监控组）
		else if(out_time && this.status === 'in' && isToday) {
			var now_time = Date.now();
			out_time = now_time;
		}
	}

	if(self.in_time && out_time){
		diff = out_time - self.in_time;
	}

	if(diff > 24*60*60*1000) {
		if(self.in_time) {
			var date = DateTimezone(date,time_offset);
			var day_end = new Date(date).setHours(23,59,59);
			out_time = day_end;
			diff = out_time - self.in_time;
		} else {
			diff = 16 * 60 * 60 * 1000;
		}
	} else if(diff < 0) {
		diff = 0;
	}

	return diff;
};

var options = {
  title : {
      show: false,
  },
  grid:{
      left:40,right:10,top:10,bottom:30
  },
  tooltip : {
      trigger: 'axis',
      formatter: function (params,ticket,callback) {
          var res = '日期: ' + params[0].name;
          for (var i = 0, l = params.length; i < l; i++) {
              if(params[i].seriesType == 'bar'){
                res += '<br/>出现时间: ' + getHourMinutesTime(params[i].value);
              }
          }
          return res;
      }
  },
  color: ['#3398DB','#FF5722'],
  legend: {
      x: 'center',
      y: 'top',
      data:[]
  },
  toolbox: {
      show : false,
  },
  calculable : true,
  xAxis : [
      {
          type : 'category',
          boundaryGap : '5px',
          data:[]
      }
  ],
  yAxis : [
      {
          type : 'value',
          axisLabel : {
              formatter: function (value) {
                  return parseInt(value) + ' h';
              }
          }, 
          splitNumber:3
      }
  ],
  series : []
};


var fillChartData = function() {
  var group_id = Router.current().params._id;
	var lineChartGroup = echarts.init(document.getElementById('lineChartGroup'));
  var group = SimpleChat.Groups.findOne({_id: group_id});
  var time_offset = 8;
  if (group && group.offsetTimeZone) {
    time_offset = group.offsetTimeZone;
  }

  var showLen = 30;
  var now = new Date();
  var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() ,  0, 0, 0, 0);
  var date_reg = Date.UTC(group.create_time.getFullYear(),group.create_time.getMonth(), group.create_time.getDate() ,  0, 0, 0, 0);
  var date_span = (date - date_reg) / (24 * 3600 * 1000);
  if( date_span < 30){
    showLen = date_span;
  }
  
  if( activeShow.get() == 'weekly' && date_span > 6) {
      showLen = 7;
  }

  // var date = displayDate.get();

  options.legend.data=['时间'];
  options.xAxis[0].data = [];
  options.series[0] = {
    type: 'bar',
    data:[]
  };
  options.series[1] = {
    type:'line',
    smooth:true,
    data:[]
  };

  for(var i = showLen; i >= 0 ; i--){
    var d = date - (i * 24 * 60 * 60 * 1000);

    var status = WorkStatus.find({group_id: group_id, date:d}).fetch();
    var counts = status.length;

    var timeLen = 0;
    status.forEach(function(item) {
			var diff = inCompanyTimeLength(time_offset, item);
			timeLen += Math.abs(diff);
    });

    if(counts > 0){
      timeLen = timeLen / counts;
    } else {
			timeLen = 0;
		}
    
    var ts = new Date(d).parseDate('MM-DD'); // TODO: time_offset
    timeLen = timeLen / (60 * 60 * 1000);
    timeLen = timeLen.toFixed(2);
    options.xAxis[0].data.push(ts);
    options.series[0].data.push(timeLen);
    options.series[1].data.push(timeLen);
  };

  console.log(options);
  isLoading.set(false);
  lineChartGroup.setOption(options);
};

Template.companyItem.onRendered(function () {

	var group_id = Router.current().params._id;
	isLoading.set(true);

	var now = new Date();
  var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() ,  0, 0, 0, 0);

  Meteor.subscribe('WorkStatusListsByGroup', date, group_id, {
    onReady: function() {}
  });
	Meteor.subscribe('get-group',group_id , {
		onReady: function() {
			fillChartData();
		}
	});
	
});

Template.companyItem.helpers({
	getActiveShow: function(str) {
		if( str == activeShow.get() ) {
			return 'active';
		}
		return '';
	},

	data: function() {
		var group_id = Router.current().params._id;
		return SimpleChat.Groups.findOne({_id: group_id});
	},

	isLoading: function() {
		return isLoading.get();
	}
});

Template.companyItem.events({
	'click .back': function(e) {
		return PUB.back();
	},
  'click .weekly': function(e){
		activeShow.set('weekly');
		isLoading.set(true);
		fillChartData();
	},
	'click .monthly': function(e){
		activeShow.set('monthly');
		isLoading.set(true);
		fillChartData();
	}
})
