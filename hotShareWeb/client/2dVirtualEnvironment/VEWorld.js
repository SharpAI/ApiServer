Template.VEWorld.onRendered(function() {
var groupIds = ['d2bc4601dfc593888618e98f','ae64c98bdff9b674fb5dad4b','73c125cc48a83a95882fced3'];

var color = ['#a6c84c', '#ffa022', '#46bee9'];
var series =  [
        {
            name: 'Top5',
            type: 'map',
            mapType: 'world',
            data:[],
            markPoint : {
                symbol:'emptyCircle',
                symbolSize : function (v){
                    return 10
                },
                effect : {
                    show: true,
                    shadowBlur : 0
                },
                itemStyle:{
                    normal:{
                        label:{show:false}
                    }
                },
                data : [
                    {
                        name: "China", 
                        value: [
                            28, 
                            84,
                            98
                        ]
                    }
                ]
            }
        }
    ];


var latlong = {};
latlong.KM = {'latitude':25.07197, 'longitude':102.679003}; // 102.679003,25.07197
latlong.SH = {'latitude':31.23667, 'longitude':121.477664}; // 121.477664,31.23667
latlong.LA = {'latitude':33.978945, 'longitude':-117.643241}; //-117.643241,33.978945

var mapData = [
{'code':'KM' , 'name':'讯动办公室', 'value':8, 'color':'#eea638','group_id':'d2bc4601dfc593888618e98f'},
{'code':'SH' , 'name':'上海办公室', 'value':40, 'color':'#eea638','group_id':'ae64c98bdff9b674fb5dad4b'},
{'code':'LA' , 'name':'SWLAB', 'value':12, 'color':'#a7a737', 'group_id':'73c125cc48a83a95882fced3'}];
var mapOffices = ['讯动办公室','上海办公室','SWLAB'];

var max = -Infinity;
var min = Infinity;
mapData.forEach(function (itemOpt) {
    if (itemOpt.value > max) {
        max = itemOpt.value;
    }
    if (itemOpt.value < min) {
        min = itemOpt.value;
    }
});

option = {
    backgroundColor: '#404a59',
    title : {
        text: '昆明讯动科技',
        left: 'center',
        top: 'top',
        textStyle: {
            color: '#fff'
        }
    },
    tooltip : {
        trigger: 'item',
        formatter : function (params) {
            var value = (params.value + '').split(',');
            // value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,')
            //         + '.' + value[1];
            value = value[2] + '(人) 在线';
            return  params.name + ' : <br/>' + value;
        }
    },
    visualMap: {
        show: false,
        min: 0,
        max: max,
        inRange: {
            symbolSize: 30
        }
    },
    geo: {
        name: 'World Population (2010)',
        type: 'map',
        map: 'world',
        roam: true,
        zoom:1.2,
        label: {
            emphasis: {
                show: false
            }
        },
        itemStyle: {
            normal: {
                areaColor: '#323c48',
                borderColor: '#111'
            },
            emphasis: {
                areaColor: '#2a333d'
            }
        }
    },
    series : [
        {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: mapData.map(function (itemOpt) {
                return {
                    name: itemOpt.name,
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    value: [
                        latlong[itemOpt.code].longitude,
                        latlong[itemOpt.code].latitude,
                        itemOpt.value
                    ],
                    label: {
                        normal:{
                            show: true,
                            color: '#ffffff',
                            position: 'right',
                            offset:[-30,30],
                            formatter: function (params) {
                                var value = (params.value + '').split(',');
                                value = value[2] + '(人) 在线';
                                return  params.name + ': ' + value;
                            }
                        },
                        emphasis: {
                            position: 'right',
                            show: false
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: itemOpt.color
                        }
                    }
                };
            })
        }
    ]
};

themap = echarts.init(document.getElementById('VEWorld'))

themap.setOption(option);

// 注册地图点击事件
themap.on('click', function (params) {
    // 控制台打印数据的名称
    console.log(params.componentType);
    if (params.componentType === 'series') {
        var index = mapOffices.indexOf(params.name);
        if(index > -1){
            var group_id = mapData[index].group_id;
            return Router.go('/VEOffice/'+group_id);
        }
    } else {
        return false;
    }
});

themap.on('dblclick',function (param){
    return false;
});

})