if Meteor.isClient
  Template.companyLists.onRendered ()->
    Meteor.subscribe('get-my-group', Meteor.userId(), {
      onReady: ()->
        Session.set('companyListLoading', false)
      });
  Template.companyLists.helpers
    isLoading: ()->
      loading = true
      if Session.get('companyListLoading') is false
        loading = false
      loading
    hasBoundCompany: ()->
      company_array = []
      groups = SimpleChat.GroupUsers.find({user_id: Meteor.userId()}).fetch();
      if groups
        for group in groups
          if group.perf_info
            company_array.push(group.perf_info)
      company_array.length > 0
    companies: ()->
      company_array = []
      groups = SimpleChat.GroupUsers.find({user_id: Meteor.userId()}).fetch();
      if groups
        for group in groups
          if group.perf_info
            company_array.push(group.perf_info)
      #company_array.push({companyName: 'text company1'})
      #company_array.push({companyName: 'test company2'})
      company_array
  Template.companyLists.events
    'click .companyLists ul li':(e, t)->
      Session.set('reportUrl', this.reportUrl)
      Router.go 'perfShow'
