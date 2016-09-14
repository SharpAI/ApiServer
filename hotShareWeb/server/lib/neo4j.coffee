Meteor.startup ()->
  url = process.env.NEO4J_URL or process.env.GRAPHENEDB_URL or "http://neo4j:5MW-wU3-V9t-bF6@120.24.247.107:7474"
  Meteor.defer ()->
    @Neo4j = new Neo4jDb url