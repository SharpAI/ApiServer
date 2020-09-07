Template.VEWorld.onRendered(function() {
    var groupIds = ['d2bc4601dfc593888618e98f','ae64c98bdff9b674fb5dad4b','73c125cc48a83a95882fced3'];

    var color = ['#a6c84c', '#ffa022', '#46bee9'];
    var now = new Date();
    var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
        0, 0, 0, 0);
        
    var latlong = {};
    latlong.KM = {'latitude':25.07197, 'longitude':102.679003}; // 102.679003,25.07197
    latlong.SH = {'latitude':31.23667, 'longitude':121.477664}; // 121.477664,31.23667
    latlong.LA = {'latitude':33.978945, 'longitude':-117.643241}; //-117.643241,33.978945

    var mapData = [];
    var mapOffices = ['讯动办公室','上海办公室','SWLAB'];

    var max = -Infinity;
    var min = Infinity;

    var option = {
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
            roamController: {
                show: true,
                x: 'right',
                mapTypeControl: {
                    'china': true
                }
            },
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
    Meteor.call('getOfficesOnlineInfo', groupIds, date,function(error, result){
        console.log(JSON.stringify(result));
        if(error){
            console.log(error);
        } else {
            mapData = [
    {'code':'KM' , 'name':'讯动办公室', 'value':0, 'color':'#eea638','group_id':'d2bc4601dfc593888618e98f','country':'china'},
    {'code':'SH' , 'name':'上海办公室', 'value':0, 'color':'#eea638','group_id':'ae64c98bdff9b674fb5dad4b','country':'china'},
    {'code':'LA' , 'name':'SWLAB', 'value':0, 'color':'#a7a737', 'group_id':'73c125cc48a83a95882fced3','country':'usa'}];
            result.forEach(function(item){
                var index = groupIds.indexOf(item._id);
                mapData[index].name = item.name;
                mapData[index].value = item.value;
            });
            option.series[0].data = mapData.map(function (itemOpt) {
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
            });
            themap.setOption(option);
        }
    });


    // 注册地图点击事件
    themap.on('click', function (params) {
        // 控制台打印数据的名称
        console.log(params.componentType);
        if (params.componentType === 'series') {
            var index = mapOffices.indexOf(params.name);
            if(index > -1){
                console.log(params)
                var x = params.event.offsetX;
                var y = params.event.offsetY;
                var group_id = mapData[index].group_id;
                // 先进行地图缩放
                var country = mapData[index].country;
                
                option.geo.map = country;
                // option.geo.zoom = 3;
                option.series.center = ['50%','0%'];
                themap.setOption(option, true)
                Meteor.setTimeout(function(){
                    $('#VEWorld').addClass('worldScaleOut');
                },500);
                Meteor.setTimeout(function(){
                    $('#VEWorld').hide();
                    Router.go('/VEOffice/'+group_id);
                },2000);
            }
        } else {
            return false;
        }
    });

    themap.on('dblclick',function (param){
        return false;
    });

})