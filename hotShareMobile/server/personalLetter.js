if(Meteor.isServer){
	Meteor.startup(function() {
	  Meteor.methods({
	    'personalLetterSendEmailFeedback': function(doc) {
	      var owner = Meteor.users.findOne({
	            _id: doc.ownerId
	        });
	      // 获取不到作者的email
	      	// console.log('ownerId IS ' + doc.ownerId)
	      	// console.log('owner IS ' + owner)
	      	// console.log('owner.email ' + owner.email)
	      	// console.log('owner.email[0].address ' + owner.email[0].address)
	      	// console.log('true or false ? ' + owner && owner.email && owner.email[0].address)
	       //  if (owner && owner.email && owner.email[0].address) {
	       //  	console.log('here.....')
	       //      var text = Assets.getText('email/personal-letter.html');
	       //      Meteor.defer(function(){
	       //          try{
	       //              Email.send({
	       //                  to: owner.email[0].address,
	       //                  from: '故事贴<notify@mail.tiegushi.com>',
	       //                  subject: doc.userName + '给您发了一封私信！',
	       //                  body: doc.content,
	       //                  html: text
	       //              });
	       //              console.log('sendEmail' + owner.email[0].address)
	       //          } catch (e){
	       //              console.log(e);
	       //          }
	       //      });
	       //  }
	        Feeds.insert({
	            user: doc.user,
	            userName: doc.userName,
	            userIcon: doc.userIcon,
	            userEmail: doc.email,
	            eventType: 'personalletter',
	            postId: doc.postId,
	            postTitle: doc.title,
	            addontitle: doc.addontitle,
	            mainImage: doc.mainImage,
	            createdAt: new Date(),
	            content:doc.content,
	            owner:doc.ownerId,
	            followby: doc.ownerId,
	            ownerName: owner.profile.fullname,
	            checked: false
	        });
	        pushnotification("personalletter", doc, doc.ownerId);
	    }
	  });
	});
}