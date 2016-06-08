Template.avatar.helpers
	imageUrl: ->
		if this.avatarUrl? and not this.avatarUrl is ''
			url = this.avatarUrl
			return "background-image:url(#{url});"
		username = this.username
		if not username? and this.userId?
			username = Meteor.users.findOne(this.userId)?.username

		if not username?
			return

		Session.get "avatar_random_#{username}"

		url = getAvatarUrlFromUsername(username)

		return "background-image:url(#{url});"
