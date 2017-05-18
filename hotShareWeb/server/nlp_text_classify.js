NLP_CLASSIFY = {
  setName: function(group_id,class_name){
    var obj = NLPTextClassName.findOne({group_id: group_id, class_name: class_name});

    if (!obj)
      NLPTextClassName.insert({group_id: group_id, class_name: class_name, createAt: new Date(), updateAt: new Date()});
    else
      NLPTextClassName.update({_id: obj._id}, {$set: {class_name: class_name,updateAt: new Date()}})

  },
  removeName: function(group_id, class_name){
    PersonNames.remove({group_id: group_id, class_name: class_name});
  }
};

Meteor.methods({
  'set-class-name': function(group_id,class_name){
    return NLP_CLASSIFY.setName(group_id, class_name);
  },
  'set-class-names': function(group_id, items){
    console.log('set-class-names:', items);
    for(var i=0;i<items.length;i++)
      NLP_CLASSIFY.setName(group_id, items[i].class_name);
  },
  'remove-class': function(group_id, class_name){
    return NLP_CLASSIFY.removeName(group_id, class_name);
  },
  'remove-classes': function(items){
    for(var i=0;i<items.length;i++)
      NLP_CLASSIFY.removeName(items[i].group_id, items[i].class_name);
  }
})
