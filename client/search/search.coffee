if Meteor.isClient
  Template.search.helpers
    theme:()->
      [
        {"_id":"cxHEcrdKchGfFvgnu","type":"theme","title":"Featured","imgUrl":"/theme/theme1.jpg","order":1}
        {"_id":"cxHEcrsschGfFvgnu","type":"theme","title":"The Big Picture","imgUrl":"/theme/theme2.jpg","order":2}
        {"_id":"cxHEcaaachGfFvgnu","type":"theme","title":"Small Stories","imgUrl":"/theme/theme3.jpg","order":3}
        {"_id":"cxHEcrdKerefFvgnu","type":"theme","title":"Places To Go","imgUrl":"/theme/theme4.jpg","order":4}
        {"_id":"cxHEcrdK34efFvgnu","type":"theme","title":"Stay Informed","imgUrl":"/theme/theme5.jpg","order":5}
      ]
    topic:()->
      [
        {"_id":"cxHEcrdsdhGfFvgnu","type":"topic","text":"boracay"}
        {"_id":"cxHEcrdsdhGsavgnu","type":"topic","text":"love"}
        {"_id":"cxHEdfghsdf2Fvgnu","type":"topic","text":"travel"}
        {"_id":"cxdfghdssdf2Fvgnu","type":"topic","text":"travel"}
        {"_id":"cxHEc23fgdf2Fvgnu","type":"topic","text":"travel"}
        {"_id":"cxHEcrdsskyuivgnu","type":"topic","text":"travel"}
        {"_id":"cxHEcrd456y2Fvgnu","type":"topic","text":"travel"}
        {"_id":"cxHEcrdsfghfgvgnu","type":"topic","text":"travel"}
        {"_id":"cxHEcghfgdf2Fvgnu","type":"topic","text":"travel"}
        {"_id":"cxHEcrd345g2Fvgnu","type":"topic","text":"travel"}
      ]