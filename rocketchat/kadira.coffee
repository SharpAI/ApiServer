if Meteor.isServer

  kadiraID=process.env.KARDIRA_ID ||'TJCHp2Ky3JdypFdjv'
  kadiraKey=process.env.KARDIRA_KEY ||'25235f4b-7079-4fac-b82d-8cd2d865a6dc'

  Kadira.connect(kadiraID,kadiraKey)
