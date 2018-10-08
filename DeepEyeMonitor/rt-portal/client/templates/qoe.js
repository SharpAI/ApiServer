setQoeData = function (data,select) {
    QoEChart = echarts.init(document.getElementById('chart-id-qoe-starting'));
    option = {
        title: {
            text: 'Starting',
            x: 10,
            y: 30,
            textStyle: { color: '#009688', fontSize: 18, },
            backgroundColor: '#efefef',
            padding: [5, 50, 60, 5],
            z: 9
        },
        tooltip: {
            trigger: 'axis',
            showDelay: 0,             // 显示延迟，添加显示延迟可以避免频繁切换，单位ms
            formatter: function(params) {
                var raid = (params[0].data/1000).toFixed(2) + ' s';
                var normal = (params[1].data/1000).toFixed(2) + ' s';
                var spanStyle = " display:inline-block;height: 10px;width:10px; border-radius:5px; margin-right:5px;";
                var result = '<div style="text-align:justify;">'+
                            '<h4>'+params[0].name+"：</h4>"+
                            '<p><span style="background-color:#009688; '+spanStyle+'"></span>'+params[0].seriesName+"："+raid+"</p>"+
                            '<p><span style="background-color:#4caf50; '+spanStyle+'"></span>'+params[1].seriesName+"："+normal+"</p></div>";
                return result;
            }
        },
        symbolList: ['circle'],
        color: ['#009688', '#4caf50'],
        legend: {
            x: 10,
            y: 60,
            z: 11,
            orient: 'vertical',
            data: ['Raid', 'Normal']
        },
        toolbox: {
            show: false
        },
        grid: {
            x: 140,
            y: 25,
            // x2: 100,
            y2: 30
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: data.axisData
            }
        ],
        yAxis: [
            {
                type: 'value',
                position: 'right',
                axisLabel: {
                    formatter: function (v) {
                        return (v/1000) + ' s';
                    }
                },
            }
        ],
        series: [
            {
                name: 'Raid',
                type: 'line',
                smooth: true,
                data: data.startingRaid
            },
            {
                name: 'Normal',
                type: 'line',
                smooth: true,
                data: data.startingNoRaid
            }

        ]
    };
   
    QoEChart.setOption(option);
    option2 = {
        title: {
            text: 'Fast Forward',
            x: 10,
            y: 10,
            textStyle: { color: '#2196f3', fontSize: 18, },
            backgroundColor: '#efefef',
            padding: [5, 10, 60, 5],
            z: 9
        },
        tooltip: {
            trigger: 'axis',
            showDelay: 0,            // 显示延迟，添加显示延迟可以避免频繁切换，单位ms
            formatter: function(params) {
                var raid = (params[0].data/1000).toFixed(2) + ' s';
                var normal = (params[1].data/1000).toFixed(2) + ' s';
                var spanStyle = " display:inline-block;height: 10px;width:10px; border-radius:5px; margin-right:5px;";
                var result = '<div style="text-align:justify;">'+
                            '<h4>'+params[0].name+"：</h4>"+
                            '<p><span style="background-color:#2196f3; '+spanStyle+'"></span>'+params[0].seriesName+"："+raid+"</p>"+
                            '<p><span style="background-color:#00bcd4; '+spanStyle+'"></span>'+params[1].seriesName+"："+normal+"</p></div>";
                return result;
            }
        },
        symbolList: ['circle'],
        color: ['#2196f3', '#00bcd4'],
        legend: {
            x: 10,
            y: 40,
            z: 11,
            orient: 'vertical',
            data: ['Raid', 'Normal']
        },
        toolbox: {
            show: false,
        },
        grid: {
            x: 140,
            y: 5,
            // x2: 100,
            y2: 40
        },
        xAxis: [
            {
                type: 'category',
                position: 'top',
                boundaryGap: false,
                data: data.axisData
            }
        ],
        yAxis: [
            {
                type: 'value',
                position: 'right',
                axisLabel: {
                    formatter: function (v) {
                        return (v/1000) + ' s';
                    }
                },
            }
        ],
        series: [
            {
                name: 'Raid',
                type: 'line',
                smooth: true,
                data: data.seekingRaid
            },
            {
                name: 'Normal',
                type: 'line',
                smooth: true,
                data: data.seekingNoRaid
            }
        ]
    };
    QoEChart2 = echarts.init(document.getElementById('chart-id-qoe-seeking'));
    QoEChart2.setOption(option2);

    option3 = {
        title: {
            text: 'buffering',
            x: 10,
            y: 10,
            textStyle: { color: '#ff5722', fontSize: 18, },
            backgroundColor: '#efefef',
            padding: [5, 50, 60, 5],
            z: 9
        },
        tooltip: {
            trigger: 'axis',
            showDelay: 0,             // 显示延迟，添加显示延迟可以避免频繁切换，单位ms
            formatter: function(params) {
                var raid = (params[0].data/1000).toFixed(2) + ' s';
                var normal = (params[1].data/1000).toFixed(2) + ' s';
                var spanStyle = " display:inline-block;height: 10px;width:10px; border-radius:5px; margin-right:5px;";
                var result = '<div style="text-align:justify;">'+
                            '<h4>'+params[0].name+"：</h4>"+
                            '<p><span style="background-color:#ff5722; '+spanStyle+'"></span>'+params[0].seriesName+"："+raid+"</p>"+
                            '<p><span style="background-color:#ffc107; '+spanStyle+'"></span>'+params[1].seriesName+"："+normal+"</p></div>";
                return result;
            }
        },
        symbolList: ['circle'],
        color: ['#ff5722', '#ffc107'],
        legend: {
            x: 10,
            y: 40,
            z: 11,
            orient: 'vertical',
            data: ['Raid', 'Normal']
        },
        toolbox: {
            show: false
        },
        grid: {
            x: 140,
            y: 5,
            // x2: 100,
            y2: 30
        },
        xAxis: [
            {
                type: 'category',
                position: 'bottom',
                boundaryGap: false,
                data: data.axisData
            }
        ],
        yAxis: [
            {
                type: 'value',
                position: 'right',
                axisLabel: {
                    formatter: function (v) {
                        return (v/1000) + ' s';
                    }
                },
            }
        ],
        series: [
            {
                name: 'Raid',
                type: 'line',
                smooth: true,
                data: data.bufferingRaid
            },
            {
                name: 'Normal',
                type: 'line',
                smooth: true,
                data: data.bufferingNoRaid
            }
        ]
    };
    QoEChart3 = echarts.init(document.getElementById('chart-id-qoe-buffering'));
    QoEChart3.setOption(option3);

    option4 = {
        title: {
            text: 'Sampling Times',
            x: 10,
            y: 10,
            textStyle: { fontSize: 18, },
            backgroundColor: '#efefef',
            padding: [5, 50, 80, 5],
            z: 9
        },
        tooltip: {
            trigger: 'axis',
            showDelay: 0,             // 显示延迟，添加显示延迟可以避免频繁切换，单位ms
            formatter: function(params) {
                var starting = params[0].data + ' 次';
                var seeking = params[1].data + ' 次';
                var buffering = params[2].data + ' 次';
                var spanStyle = " display:inline-block;height: 10px;width:10px; border-radius:5px; margin-right:5px;";
                var result = '<div style="text-align:justify;">'+
                            '<h4>'+params[0].name+"：</h4>"+
                            '<p><span style="background-color:#009688; '+spanStyle+'"></span>'+params[0].seriesName+"："+starting+"</p>"+
                            '<p><span style="background-color:#2196f3; '+spanStyle+'"></span>'+params[1].seriesName+"："+seeking+"</p>"+
                            '<p><span style="background-color:#ff5722; '+spanStyle+'"></span>'+params[2].seriesName+"："+buffering+"</p></div>";
                return result;
            }
        },
        symbolList: ['circle'],
        color: ['#009688','#2196f3','#ff5722'],
        legend: {
            x: 10,
            y: 40,
            z: 11,
            orient: 'vertical',
            data: ['Starting','Fast Forward','Buffering']
        },
        toolbox: {
            show: false
        },
        grid: {
            x: 140,
            y: 5,
            // x2: 100,
            y2: 30
        },
        xAxis: [
            {
                type: 'category',
                position: 'bottom',
                boundaryGap: false,
                data: data.axisData
            }
        ],
        yAxis: [
            {
                type: 'value',
                position: 'right',
                // axisLabel: {
                //     formatter: function (v) {
                //         return Math.floor(v/1000);
                //     }
                // },
            }
        ],
        series: [
            {
                name: 'Starting',
                type: 'line',
                smooth: true,
                data: data.startingSamples
            },
            {
                name: 'Fast Forward',
                type: 'line',
                smooth: true,
                data: data.seekingSimples
            },
            {
                name: 'Buffering',
                type: 'line',
                smooth: true,
                data: data.bufferingSimples
            }
        ]
    };

    // QoEChart4 = echarts.init(document.getElementById('chart-id-qoe-counts'));
    // QoEChart4.setOption(option4);

    // QoEChart.connect([QoEChart2, QoEChart3, QoEChart4]);
    // QoEChart2.connect([QoEChart, QoEChart3, QoEChart4]);
    // QoEChart3.connect([QoEChart, QoEChart2, QoEChart4]);
    // QoEChart4.connect([QoEChart, QoEChart2, QoEChart3]);

    QoEChart.connect([QoEChart2, QoEChart3]);
    QoEChart2.connect([QoEChart, QoEChart3]);
    QoEChart3.connect([QoEChart, QoEChart2]);

    setTimeout(function () {
        window.onresize = function () {
            QoEChart.resize();
            QoEChart2.resize();
            QoEChart3.resize();
        }
    }, 200);
}
addZero = function (value){
    if(value < 10){
        return "0"+value;
    } else {
        return value;
    }
}
GetDataQoE = function() {
  var isHours = true;
  var result = {
      axisData:[],
      startingRaid:[],
      startingNoRaid:[],
      seekingRaid:[],
      seekingNoRaid:[],
      bufferingRaid:[],
      bufferingNoRaid:[],

      startingSamples:[],
      seekingSimples:[],
      bufferingSimples:[]
  };
  if(!document.getElementById("chart-id-qoe-starting") || !document.getElementById("chart-id-qoe-seeking") || !document.getElementById("chart-id-qoe-buffering"))
    return;
  Meteor.call('getQoEData', Meteor.userId(), $('.qoe-chart-time.btn-primary').attr('id'), function(err, data) {
    if(!Session.get('currentPage') || Session.get('currentPage') != 'qoe')
        return;

    var ts = '';
    if( $('.qoe-chart-time.btn-primary').attr('id') === 'h'){
        _.each(data, function(item,index){
            var date = item.time;
            var ts = addZero(date.getHours()) + ":"+addZero(date.getMinutes());
            result.axisData.push(ts);

            result.startingRaid.push((item.raid_starting)>=0?item.raid_starting:0);
            result.seekingRaid.push((item.raid_seeking)>=0?item.raid_seeking:0);
            result.bufferingRaid.push((item.raid_buffering)>=0?item.raid_buffering:0);
            result.startingNoRaid.push((item.normal_starting)>=0?item.normal_starting:0);
            result.seekingNoRaid.push((item.normal_seeking)>=0?item.normal_seeking:0);
            result.bufferingNoRaid.push((item.normal_buffering)>=0?item.normal_buffering:0);

            result.startingSamples.push((item.raid_starting_samples && item.normal_starting_samples)>=0?(item.raid_starting_samples + item.normal_starting_samples):0);
            result.seekingSimples.push((item.raid_seeking_samples && item.normal_seeking_samples)>=0?(item.raid_seeking_samples + item.normal_seeking_samples):0);
            result.bufferingSimples.push((item.raid_buffering_samples && item.normal_buffering_samples)>=0?(item.raid_buffering_samples + item.normal_buffering_samples):0);
        });
    } else {
        _.each(data, function(item,index){
            var date = item.time;
            if( $('.qoe-chart-time.btn-primary').attr('id') === 'd'){
               var ts = date.getDate()+"/"+addZero(date.getHours())+":00"
            } else {
                var ts = date.getFullYear()+"/"+(Number(date.getMonth())+1)+"/"+date.getDate();
            }
            result.axisData.push(ts);

            result.startingRaid.push(item.raid_starting_samples?(item.raid_starting/item.raid_starting_samples):0);
            result.seekingRaid.push(item.raid_seeking_samples?(item.raid_seeking/item.raid_seeking_samples):0);
            result.bufferingRaid.push(item.raid_buffering_samples?(item.raid_buffering/item.raid_buffering_samples):0);
            result.startingNoRaid.push(item.normal_starting_samples?(item.normal_starting/item.normal_starting_samples):0);
            result.seekingNoRaid.push(item.normal_seeking_samples?(item.normal_seeking/item.normal_seeking_samples):0);
            result.bufferingNoRaid.push(item.normal_buffering_samples?(item.normal_buffering/item.normal_buffering_samples):0);

            result.startingSamples.push(item.raid_starting_samples + item.normal_starting_samples);
            result.seekingSimples.push(item.raid_seeking_samples + item.normal_seeking_samples);
            result.bufferingSimples.push(item.raid_buffering_samples + item.normal_buffering_samples);
        });
    }
    setQoeData(result,$('.qoe-chart-time.btn-primary').attr('id'))
  });
}

Template.qoe.rendered = function() {
  Session.set('noTrafficData','loading')
  $(".chart-id-qoe").css({
    width: Math.floor($(window).width()*0.75)  + 'px',
    height: Math.floor($(window).height()*0.3)  + 'px'
  });
  window.onresize = function(){
    $(".chart-id-qoe").css({
      width: Math.floor($(window).width()*0.75)  + 'px',
      height: Math.floor($(window).height()*0.3)  + 'px'
    });
  }
  GetDataQoE();
  if( $('.qoe-chart-time.btn-primary').attr('id') === 'h'){
    qoeDataInterval = window.setInterval(GetDataQoE, 60*1000);
  }
};

Template.qoe.events({
  'click .qoe-chart-time': function(e){
    $('.qoe-chart-time').removeClass('btn-primary');
    $(e.currentTarget).addClass('btn-primary');
    GetDataQoE();
    if( $('.qoe-chart-time.btn-primary').attr('id') === 'h'){
        qoeDataInterval = window.setInterval(GetDataQoE, 60*1000);
    } else {
        qoeDataInterval = window.clearInterval(qoeDataInterval);   
    }
  }
});

Template.qoe.onDestroyed(function (){
  qoeDataInterval = window.clearInterval(qoeDataInterval);
});
