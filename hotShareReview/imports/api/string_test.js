this.isEmail = /[a-z0-9-]{1,30}@[a-z0-9-]{1,65}.[a-z]{2,6}/;
this.isCellPhone = /^((\(\d{3}\))|(\d{3}\-))?1[3,4,5,7,8]\d{9}$/;
this.isIdCard = /(^([\d]{15}|[\d]{18}|[\d]{17}[xX]{1})$)/;
this.isCn = /^[\u0391-\uFFE5]+$/;
this.isQQ = /^[1-9][0-9]{4,9}$/;
// this.isEmail = RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/);