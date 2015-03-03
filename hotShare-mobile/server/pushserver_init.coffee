root = exports ? this
if Meteor.isServer
  Meteor.startup ()->
    #Files are placed in the `/private` folder:
    apnsDevCert = Assets.getText 'ios/apn-development/HotShare_PN_DEV_Cert.pem'
    apnsDevKey = Assets.getText 'ios/apn-development/HotShare_PN_DEV_Key.pem'
    optionsDevelopment =
        passphrase: '1234'
        certData: apnsDevCert
        keyData: apnsDevKey
        gateway: 'gateway.sandbox.push.apple.com'
    
    apnsProductionCert = Assets.getText 'ios/apn-production/HotShare_PN_Production_Cert.pem'
    apnsProductionKey = Assets.getText 'ios/apn-production/HotShare_PN_Production_Key.pem'
    optionsProduction =
        passphrase: '1234'
        certData: apnsProductionCert
        keyData: apnsProductionKey
        gateway: 'gateway.push.apple.com'

    pushServer = new CordovaPush 'AIzaSyAeo0xEPBfrUJ5MztClvICNo-ZLIHcM8Zo', optionsDevelopment

    pushServer.initFeedback()
    root.pushServer = pushServer
