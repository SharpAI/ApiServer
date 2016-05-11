

FlowRouter.route '/channel/:postId/userid/:userId', action: (params, queryParams)->
  console.log("Yeah! We are on the post: "+ params.postId+' userId'+' userId'+params.userId);
  amplify.store('hotshareUserID', params.userId)
  FlowRouter.go('/channel/'+params.postId);