if Meteor.isClient
  Template.companyLists.onRendered ()->
    Meteor.subscribe('get-my-group', Meteor.userId());
  Template.companyLists.helpers
    companies: ()->
      company_array = []
      groups = SimpleChat.GroupUsers.find({user_id: Meteor.userId()}).fetch();
      if groups
        for group in groups
          if group.perf_info
            company_array.push(group.perf_info)
      return company_array
  Template.companyLists.events
    'click .companyLists ul li':(e, t)->
      Router.go 'perfShow'
