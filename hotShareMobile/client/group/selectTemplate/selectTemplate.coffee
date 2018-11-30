if Meteor.isClient
  @create_group_fun = (name,followers,template)->
    group_name = name || null;
    selected_followers = followers || null;
    selected_template = selected_template || null;
    offsetTimeZone = (new Date().getTimezoneOffset())/-60
    Meteor.call 'create-group1', null, group_name, selected_followers,selected_template,offsetTimeZone, (err, id)->
      console.log(err)
      if err or !id
        return PUB.toast('创建监控组失败，请重试~')
      Session.set('AI_Group_Name',null);
      Session.set('touserid6', id)
      Session.set('tousername6',group_name)
      Meteor.subscribe('get-group',id,{
          onReady:()->
            # 欢迎消息重复
            # group = SimpleChat.Groups.findOne({_id:id});
            # msgObj =  {
            #   _id: new Mongo.ObjectID()._str,
            #   form: {
            #     id: '',
            #     name: '系统',
            #     icon: ''
            #   },
            #   to: {
            #     id: group._id,
            #     name: group.name,
            #     icon: group.icon
            #   },
            #   images: [],
            #   to_type: "group",
            #   type: "system",
            #   text: '欢迎加入'+group.name ,
            #   create_time: new Date(),
            #   is_read: false
            # };
            # sendMqttGroupMessage(group._id, msgObj);
        })
      Meteor.setTimeout(
        ()->
          Session.set("history_view",null)
          Router.go('/simple-chat/to/group?id=' + id)
        50
      )
  Template.selectTemplate.rendered=->
    $('.content').css 'min-height',$(window).height()
    api_url = rest_api_url + '/restapi/workai-group-template'
    succ_return = (res)->
      console.log("cordovaHTTP result="+res.data)
      try
        result = JSON.parse(res.data)
        if result and result.group_templates
          Session.set('group_templates',result.group_templates)
          Session.set('group_templates_loading','success')
        else
          Session.set('group_templates_loading','error')
      catch e
        Session.set('group_templates_loading','error')
    error_return = (res)->
      console.log res
      Session.set('group_templates_loading','error')
    cordovaHTTP.get api_url, {}, {}, succ_return, error_return
    Session.set('group_templates_loading','true')
    Session.set('selected_template',null)
  Template.selectTemplate.helpers
    groupTemplates:()->
      Session.get('group_templates')
    loading:->
      Session.equals('group_templates_loading','true')
    loadError:->
      Session.equals('group_templates_loading','error')
    is_selected: (_id)->
      selected = Session.get('selected_template')
      if selected and selected._id is _id
        return true
      return false
  Template.selectTemplate.events
    'click .leftButton':(event)->
      Session.set('fromCreateNewGroups',true);
      history.go(-1)
    'click .rightButton':(event)->
      selected_followers = Session.get('selected_followers')
      selected_template = Session.get('selected_template')
      # if selected.length <= 0
      #   return PUB.toast('没有选择任何用户~')
      group_name = Session.get('AI_Group_Name');
      create_group_fun(selected_followers,selected_template,group_name);
    'click .tempItem': (event)->
      # console.log(this);
      #$i = $(event.currentTarget).find('i');
      Session.set('selected_template',this)
