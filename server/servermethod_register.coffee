if Meteor.isServer
  myCrypto = Meteor.npmRequire "crypto"
  Meteor.startup ()->
    Meteor.methods
      "getS3WritePolicy": (filename, URI)->
        MAXIMUM_MB = 10
        SECONDS_BEFORE_TIMEOUT = 600
        s3 = new s3Policies 'AKIAJY2UYZVD3WWOF4JA', 'cTLpygPleqe4BVMlIOo3cJCEza82E7LwSVTwATiM'
        policy = s3.writePolicy filename,'travelers-bucket', SECONDS_BEFORE_TIMEOUT, MAXIMUM_MB
        policy.orignalURI = URI
        #console.log('return policy ' + JSON.stringify(policy))
        policy
      "getBCSSigniture": (filename,URI)->
        content = "MBO" + "\n"+"Method=PUT" + "\n"+"Bucket=travelers-km" + "\n"+"Object=/" + filename + "\n"
        apiKey = '9Ud6jfxuTwkM0a7G6ZPjXbCe'
        SecrectKey = 'zhoMHNUqtmQGgR4Il1GqmZiYoP0pX2AT'
        hash = myCrypto.createHmac('sha1', SecrectKey).update(content).digest()
        Signture = encodeURIComponent hash.toString('base64')
        policy = {
          signture: "MBO:"+apiKey+":"+Signture
          orignalURI: URI
        }
        policy