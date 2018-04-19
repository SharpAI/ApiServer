root = exports ? this
if Meteor.isServer
  Meteor.startup ()->
    #Files are placed in the `/private` folder:
    apnsDevCert = Assets.getText 'ios/apn-development/WorkAI_PN_DEV_Cert.pem'
    apnsDevKey = Assets.getText 'ios/apn-development/WorkAI_PN_DEV_Key.pem'
    optionsDevelopment =
        passphrase: '1234'
        certData: apnsDevCert
        keyData: apnsDevKey
        gateway: 'gateway.sandbox.push.apple.com'

    apnsProductionCert = Assets.getText 'ios/apn-production/SharpAI_PN_Production_Cert.pem'
    apnsProductionKey = Assets.getText 'ios/apn-production/SharpAI_PN_Production_Key.pem'
    optionsProduction =
        passphrase: '123456'
        certData: apnsProductionCert
        keyData: apnsProductionKey
        gateway: 'gateway.push.apple.com'

    pushServer = new CordovaPush 'AIzaSyAeo0xEPBfrUJ5MztClvICNo-ZLIHcM8Zo', optionsProduction

    pushServer.initFeedback()
    root.pushServer = pushServer
    #sharpai_pushnotification("notify_stranger", {active_time:utilFormatTime(1524123047645), group_id:"0a3c12765104f7c9c827f6e5", group_name:'Realdoor'}, null)
