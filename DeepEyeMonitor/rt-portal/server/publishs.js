Meteor.startup(function () {
  if (Meteor.isServer) {
		Meteor.publish("userData", function () {
			if (this.userId) {
				return Meteor.users.find({_id: this.userId},{fields:{cdnSettings:1}});
			} else {
				this.ready();
			}
		});
		Meteor.publish('commands', function (client_id){
			return Commands.find({client_id:client_id,done : false},{limit: 5,sort:{createdAt:1}});
		});
		Meteor.publish('peerInfo', function peerInfoPublication() {
			var serverDate = new Date()
			serverDate.setMinutes(serverDate.getMinutes() - 5);
			return peerCollection.find({updateBy:{$gte:serverDate}});
		});
		Meteor.publish('inactiveClients', function(filter) {
			var self = this;

			var serverDate = new Date()
			serverDate.setMinutes(serverDate.getMinutes() - 5);
			var subHandle = peerCollection.find({updateBy:{$lte:serverDate}}).observeChanges({
				added: function (id, fields) {
					if(fields.updateBy){
						try{
							var now = new moment(new Date())
							var then = new Date(fields.updateBy)
							var timeDiff  =  moment.duration(now.diff(then)).humanize()
						} catch(err){
						}
						fields.timeDiff = timeDiff
					}
					self.added("inactive", id, fields);
				},
				changed: function(id, fields) {
					if(fields.updateBy){
						try{
							var now = new moment(new Date())
							var then = new Date(fields.updateBy)
							var timeDiff  =  moment.duration(now.diff(then)).humanize()
						} catch(err){
						}
						fields.timeDiff = timeDiff
					}
					self.changed("inactive", id, fields);
				},
				removed: function (id) {
					self.removed("inactive", id);
				}
			});

			self.ready();

			self.onStop(function () {
				subHandle.stop();
			});
		});

		Meteor.publish('raidInfoLogs', function(limit, ranges, session_id){
			var limit = limit || 50;
			console.log(limit)
			console.log(ranges)

			var selector = {};
			if(ranges && ranges.length > 0){
				selector = {
					createdAt:{
						$gte: ranges[0],
						$lte: ranges[1]
					}
				};
			}
			if(session_id && session_id.length > 0) {
				selector['user_info.session_id'] = session_id;
			}

			return RaidInfoLogs.find(selector,{limit: limit,sort:{createdAt:-1}});
		})
	}
});
Commands.allow({
  insert:function(){
    return true;
  },
  update: function(){
    return true;
  }
})
Meteor.users.allow({
	update: function (userId, doc) {
		return doc._id === userId;
	}
});

peerCollection.allow({
	update: function (userId, doc, fields, modifier) {
		return fields[0] === 'location'
	}
});
