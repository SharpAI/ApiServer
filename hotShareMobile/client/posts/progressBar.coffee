if Meteor.isClient
    progressBar_blaze = null
    
    Template.progressBar.rendered=->
        #Session.set 'isDelayPublish',true
        Session.set 'progressBarWidth',1

    Template.progressBar.helpers
        isDelayPublish:->
            Session.get("isDelayPublish")
        progressBarWidth:->
            Session.get("progressBarWidth")
        show: ()->
            if progressBar_blaze is null
                Session.set('progressBarWidth', 1);
                progressBar_blaze = Blaze.render Template.progressBar, document.body
            else
                Blaze.remove progressBar_blaze
                progressBar_blaze = null
        close: ()->
            Session.set('progressBarWidth', 0);
            if progressBar_blaze isnt null
                Blaze.remove progressBar_blaze
                progressBar_blaze = null

    Template.progressBar.events
        'click #delayPublish':->
            abortuploader();
            Template.progressBar.__helpers.get('close')()