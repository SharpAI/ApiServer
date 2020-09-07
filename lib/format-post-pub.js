formatPostPub = function(pub){
  for(var i=0;i<pub.length;i++){
    if(!pub[i]._id){pub[i]._id = new Mongo.ObjectID()._str;}
    if(pub[i].type === 'image'){
      pub[i].isImage = true;
      pub[i].data_sizey = pub[i].inIframe ? 4 : 3;
    }else{
      pub[i].data_sizey = 1;
    }
    pub[i].data_row = 1;
    pub[i].data_col = 1;
    pub[i].data_sizex = 6;
  }

  // format
  for(var i=0;i<pub.length;i++){
    pub[i].index = i;
    pub[i].data_col = parseInt(pub[i].data_col);
    pub[i].data_row = parseInt(pub[i].data_row);
    pub[i].data_sizex = parseInt(pub[i].data_sizex);
    pub[i].data_sizey = parseInt(pub[i].data_sizey);
    pub[i].data_wait_init = true;
    if (i > 0) {
      pub[i].data_row = pub[i-1].data_row + pub[i-1].data_sizey;
    }
  }

  return pub;
}