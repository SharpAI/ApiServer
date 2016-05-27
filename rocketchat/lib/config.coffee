if Meteor.isClient
    @withOtherChatRoomMessageAlert = if window.location.hostname is 'chat.tiegushi.com' then false else true