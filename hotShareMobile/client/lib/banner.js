Meteor.startup(function(){
	Template.connectionBanner.events({
		'click #connection-try-reconnect': function(event, template){
			event.preventDefault();
            Session.set('MeteorConnection-isConnecting', true);
            Meteor.reconnect();
		}
	});

	Template.connectionBanner.helpers({
		'wasConnected': function(event, template){
			return Session.equals('MeteorConnection-wasConnected', true);
		},
		'isDisconnected': function(event, template){
			return Session.equals('MeteorConnection-isConnected', false) && Meteor.status().retryCount > 1;
		},
		'retryTimeSeconds': function(event, template){
			return Session.get('MeteorConnection-retryTimeSeconds');
		},
		'failedReason': function(event, template){
			return Session.get('MeteorConnection-failedReason');
		},
        'isConnecting': function(event, template){
            return Session.get('MeteorConnection-isConnecting');
        },

        'connectioningText': function(event, template){
            var defaultText = "正在连接中";
            if(Meteor.settings && Meteor.settings.public && Meteor.settings.public.connectionBanner && Meteor.settings.public.connectionBanner.connectioningText)
                return Meteor.settings.public.connectionBanner.connectionLostText;
            else
                return defaultText;
        },
		'connectionLostText': function(event, template){
			var defaultText = "世界上最遥远的距离就是没网，请检查你的网络设置!";
			if(Meteor.settings && Meteor.settings.public && Meteor.settings.public.connectionBanner && Meteor.settings.public.connectionBanner.connectionLostText)
				return Meteor.settings.public.connectionBanner.connectionLostText;
			else
				return defaultText;
		},
		'tryReconnectText': function(event, template){
			var defaultText = "点击重新连接";
			if(Meteor.settings && Meteor.settings.public && Meteor.settings.public.connectionBanner && Meteor.settings.public.connectionBanner.tryReconnectText)
				return Meteor.settings.public.connectionBanner.tryReconnectText;
			else
				return defaultText;
		},
		'reconnectBeforeCountdownText': function(event, template){
			var defaultText = "(未连接)尝试自动重连";
			if(Meteor.settings && Meteor.settings.public && Meteor.settings.public.connectionBanner && Meteor.settings.public.connectionBanner.reconnectBeforeCountdownText)
				return Meteor.settings.public.connectionBanner.reconnectBeforeCountdownText;
			else
				return defaultText;
		},
		'reconnectAfterCountdownText': function(event, template){
			var defaultText = "秒后.";
			if(Meteor.settings && Meteor.settings.public && Meteor.settings.public.connectionBanner && Meteor.settings.public.connectionBanner.reconnectAfterCountdownText)
				return Meteor.settings.public.connectionBanner.reconnectAfterCountdownText;
			else
				return defaultText;
		}
	});

	Session.setDefault('MeteorConnection-isConnected', true);
	Session.setDefault('MeteorConnection-wasConnected', false);
	Session.setDefault('MeteorConnection-retryTimeSeconds', 0);
	Session.setDefault('MeteorConnection-failedReason', null);
    Session.setDefault('MeteorConnection-isConnecting', false);
	var connectionRetryUpdateInterval;

	Deps.autorun(function(){
		var isConnected = Meteor.status().connected;
		if(isConnected){
			Session.set('MeteorConnection-wasConnected', true);
			Meteor.clearInterval(connectionRetryUpdateInterval);
			connectionRetryUpdateInterval = undefined;
			Session.set('MeteorConnection-retryTimeSeconds', 0);
			Session.set('MeteorConnection-failedReason', null);
            Session.set('MeteorConnection-isConnecting', false);
		}else{
			if(Session.equals('MeteorConnection-wasConnected', true)){
				if(!connectionRetryUpdateInterval)
					connectionRetryUpdateInterval = Meteor.setInterval(function(){
						var retryIn = Math.round((Meteor.status().retryTime - (new Date()).getTime())/1000);
						if(isNaN(retryIn))
							retryIn = 0;
                        if (retryIn == 0){
                            Session.set('MeteorConnection-isConnecting', true);
                        }
						Session.set('MeteorConnection-retryTimeSeconds', retryIn);
						Session.set('MeteorConnection-failedReason', Meteor.status().reason);
					},500);


			}else {
                Meteor.setTimeout(function(){
                    Session.set('MeteorConnection-wasConnected', true);
                }, 5000);
            }
            if(Session.equals('MeteorConnection-isConnecting', true)){

                Meteor.setTimeout(function(){
                    var retryIn = Math.round((Meteor.status().retryTime - (new Date()).getTime())/1000);
                    if(isNaN(retryIn))
                        retryIn = 0;

                    if (retryIn != 0){
                        Session.set('MeteorConnection-isConnecting', false);
                    }
                }, 1000);
            }
		}
		Session.set('MeteorConnection-isConnected', isConnected);
	});
});
	