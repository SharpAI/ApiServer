if Meteor.isClient
  Template.search.helpers
    theme:()->
      [
        {"_id":"cxHEcrdKchGfFvgnu","title":"Featured","imgUrl":"/theme/theme1.jpg","order":1}
        {"_id":"cxHEcrsschGfFvgnu","title":"The Big Picture","imgUrl":"/theme/theme2.jpg","order":2}
        {"_id":"cxHEcaaachGfFvgnu","title":"Small Stories","imgUrl":"/theme/theme3.jpg","order":3}
        {"_id":"cxHEcrdKerefFvgnu","title":"Places To Go","imgUrl":"/theme/theme4.jpg","order":4}
        {"_id":"cxHEcrdK34efFvgnu","title":"Stay Informed","imgUrl":"/theme/theme5.jpg","order":5}
      ]