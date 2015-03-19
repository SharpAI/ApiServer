if Meteor.isClient
    Template.progressBar.rendered=->
        #Session.set 'isDelayPublish',true
        Session.set 'progressBarWidth',0

    Template.progressBar.helpers
        isDelayPublish:->
            Session.get("isDelayPublish")
        progressBarWidth:->
            Session.get("progressBarWidth")

    Template.progressBar.events
        'click #delayPublish':->
            console.log "delayPublish!!"
            PUB.back()
            #console.log "trigger click event"
            #$('#saveDraft').click()