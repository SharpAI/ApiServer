

FlowRouter.route '/channel/:postId/userid/:userId', action: (params, queryParams)->
  Session.set('HistoryBack', -2)
  console.log("Yeah! We are on the post: "+ params.postId+' userId'+' userId'+params.userId);\
  if amplify.store('hotshareUserID') and amplify.store('hotshareUserID') isnt params.userId
    #Meteor.call 'associateGushitie', params.userId
      Meteor.loginWithGushitie params.userId, (err)->
        if err
          console.log('>>>>>> login with error:')
  amplify.store('hotshareUserID', params.userId)
  FlowRouter.go('/channel/'+params.postId);